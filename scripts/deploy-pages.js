const fs = require('fs');
const path = require('path');
const blake3 = require('blake3-wasm');

const ACCOUNT_ID = 'edd91b475554f5d1c8d6baf7200f9c0d';
const PROJECT_NAME = 'sbs-store';
const BUILD_DIR = path.resolve(__dirname, '..', 'out');

const MIME_MAP = {
  '.html': 'text/html; charset=utf-8',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.xml': 'application/xml',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.json': 'application/json',
  '.webmanifest': 'application/manifest+json',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.webp': 'image/webp',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2'
};

function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return MIME_MAP[ext] || 'application/octet-stream';
}

const IGNORE_PATTERNS = [
  '_worker.js',
  '_redirects',
  '_headers',
  '_routes.json',
  '.DS_Store',
  'node_modules',
  '.git',
  '.wrangler'
];

function shouldIgnore(relPath) {
  const norm = relPath.replace(/\\/g, '/');
  return IGNORE_PATTERNS.some(p => norm === p || norm.startsWith(p + '/') || norm.endsWith('/' + p) || norm.includes('/' + p + '/'));
}

function walkDir(dir, baseDir = dir) {
  let results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relPath = path.relative(baseDir, fullPath).replace(/\\/g, '/');
    if (shouldIgnore(relPath)) continue;

    if (entry.isDirectory()) {
      results = results.concat(walkDir(fullPath, baseDir));
    } else if (entry.isFile()) {
      results.push({ fullPath, relPath });
    }
  }
  return results;
}

function hashFile(filepath) {
  const contents = fs.readFileSync(filepath);
  const base64Contents = contents.toString('base64');
  let ext = path.extname(filepath);
  if (ext.startsWith('.')) ext = ext.substring(1);
  return blake3.hash(base64Contents + ext).toString('hex').slice(0, 32);
}

async function uploadAssets(jwt) {
  console.log('1. Scanning build directory:', BUILD_DIR);
  const fileEntries = walkDir(BUILD_DIR);
  console.log(`Found ${fileEntries.length} static assets.`);

  console.log('2. Computing Blake3 hashes for assets...');
  const filesWithHashes = [];
  const manifest = {};

  for (const file of fileEntries) {
    const hash = hashFile(file.fullPath);
    const manifestKey = '/' + file.relPath;
    manifest[manifestKey] = hash;
    filesWithHashes.push({
      key: hash,
      path: file.fullPath,
      relPath: file.relPath,
      contentType: getMimeType(file.fullPath),
      size: fs.statSync(file.fullPath).size
    });
  }

  fs.writeFileSync(path.resolve(__dirname, '..', 'manifest.json'), JSON.stringify(manifest, null, 2));
  console.log('Manifest written to manifest.json with', Object.keys(manifest).length, 'entries.');

  const allHashes = filesWithHashes.map(f => f.key);
  console.log('3. Checking missing assets on Cloudflare...');
  const checkRes = await fetch('https://api.cloudflare.com/client/v4/pages/assets/check-missing', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + jwt,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ hashes: allHashes })
  });
  const checkData = await checkRes.json();
  if (!checkData.success) {
    throw new Error('Check missing failed: ' + JSON.stringify(checkData.errors));
  }

  const missingHashes = new Set(checkData.result || []);
  console.log(`Cloudflare reported ${missingHashes.size} assets missing out of ${allHashes.length}.`);

  const missingFiles = filesWithHashes.filter(f => missingHashes.has(f.key));

  if (missingFiles.length > 0) {
    console.log(`4. Uploading ${missingFiles.length} missing assets...`);
    // Upload in batches of 20 files
    const BATCH_SIZE = 20;
    for (let i = 0; i < missingFiles.length; i += BATCH_SIZE) {
      const batch = missingFiles.slice(i, i + BATCH_SIZE);
      const payload = batch.map(f => ({
        key: f.key,
        value: fs.readFileSync(f.path).toString('base64'),
        metadata: {
          contentType: f.contentType
        },
        base64: true
      }));

      const upRes = await fetch('https://api.cloudflare.com/client/v4/pages/assets/upload', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + jwt,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      const upData = await upRes.json();
      if (!upData.success) {
        throw new Error('Upload batch failed: ' + JSON.stringify(upData.errors));
      }
      console.log(`Uploaded batch ${i + 1} - ${Math.min(i + BATCH_SIZE, missingFiles.length)} of ${missingFiles.length}`);
    }
  } else {
    console.log('All assets already exist in Cloudflare store!');
  }

  console.log('5. Upserting asset hashes...');
  const upsertRes = await fetch('https://api.cloudflare.com/client/v4/pages/assets/upsert-hashes', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + jwt,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ hashes: allHashes })
  });
  const upsertData = await upsertRes.json();
  if (!upsertData.success) {
    console.warn('Upsert hashes warning:', upsertData.errors);
  } else {
    console.log('Asset hashes successfully upserted.');
  }

  console.log('Asset upload pipeline completed successfully!');
}

const jwt = process.argv[2] || process.env.CF_PAGES_UPLOAD_JWT;
if (!jwt) {
  console.error('Please pass CF_PAGES_UPLOAD_JWT as argument or environment variable');
  process.exit(1);
}

uploadAssets(jwt).catch(err => {
  console.error('Error during upload:', err);
  process.exit(1);
});

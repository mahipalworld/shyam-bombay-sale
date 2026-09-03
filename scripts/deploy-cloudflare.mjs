import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const ACCOUNT_ID = 'edd91b475554f5d1c8d6baf7200f9c0d';
const PROJECT_NAME = 'sbs-store';
const OUT_DIR = path.resolve('out');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
};

function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return MIME_TYPES[ext] || 'application/octet-stream';
}

function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
    } else {
      arrayOfFiles.push(fullPath);
    }
  });

  return arrayOfFiles;
}

async function main() {
  console.log('--- Starting Cloudflare Pages Direct Upload ---');

  // 1. Get Upload Token
  const jwt = process.argv[2];
  if (!jwt) {
    console.error('Usage: node scripts/deploy-cloudflare.mjs <UPLOAD_JWT>');
    process.exit(1);
  }

  // 2. Read and hash all files in `out`
  const allFiles = getAllFiles(OUT_DIR);
  console.log(`Found ${allFiles.length} files in ${OUT_DIR}`);

  const manifest = {};
  const fileHashMap = new Map();

  for (const file of allFiles) {
    const relPath = '/' + path.relative(OUT_DIR, file).replace(/\\/g, '/');
    const content = fs.readFileSync(file);
    const hash = crypto.createHash('md5').update(content).digest('hex');
    manifest[relPath] = hash;
    fileHashMap.set(hash, {
      file,
      relPath,
      content,
      mimeType: getMimeType(file),
    });
  }

  const hashes = Array.from(fileHashMap.keys());

  // 3. Check missing assets
  console.log(`Checking ${hashes.length} file hashes with Cloudflare...`);
  const checkRes = await fetch('https://api.cloudflare.com/client/v4/pages/assets/check-missing', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${jwt}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ hashes }),
  });

  const checkData = await checkRes.json();
  if (!checkData.success) {
    console.error('check-missing failed:', checkData);
    process.exit(1);
  }

  const missingHashes = checkData.result || [];
  console.log(`${missingHashes.length} assets need to be uploaded (${hashes.length - missingHashes.length} already cached)`);

  // 4. Upload missing assets in batches
  if (missingHashes.length > 0) {
    const batchSize = 25;
    for (let i = 0; i < missingHashes.length; i += batchSize) {
      const batchHashes = missingHashes.slice(i, i + batchSize);
      const batchPayload = batchHashes.map((hash) => {
        const item = fileHashMap.get(hash);
        return {
          key: hash,
          value: item.content.toString('base64'),
          base64: true,
          metadata: {
            contentType: item.mimeType,
          },
        };
      });

      console.log(`Uploading batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(missingHashes.length / batchSize)}...`);
      const uploadRes = await fetch('https://api.cloudflare.com/client/v4/pages/assets/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${jwt}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(batchPayload),
      });

      const uploadData = await uploadRes.json();
      if (!uploadData.success) {
        console.error('upload batch failed:', uploadData);
        process.exit(1);
      }
    }
  }

  // 5. Upsert Hashes
  console.log('Upserting hashes...');
  const upsertRes = await fetch('https://api.cloudflare.com/client/v4/pages/assets/upsert-hashes', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${jwt}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ hashes }),
  });
  const upsertData = await upsertRes.json();
  console.log('Upsert status:', upsertData.success ? 'OK' : upsertData);

  console.log('\nAsset upload completed successfully! Manifest ready for deployment.');
  console.log(JSON.stringify({ manifest, count: Object.keys(manifest).length }));
}

main().catch(console.error);

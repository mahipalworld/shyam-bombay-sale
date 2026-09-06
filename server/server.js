const express = require('express');
const cors = require('cors');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const { 
  S3Client, 
  PutObjectCommand, 
  GetObjectCommand, 
  DeleteObjectCommand, 
  ListObjectsV2Command 
} = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
require('dotenv').config({ path: path.join(__dirname, '.env') });
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Supabase client initialization
const supabaseUrl = process.env.SUPABASE_URL || 'https://pclwoyqrlfyqfqojhmag.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjbHdveXFybGZ5cWZxb2pobWFnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgwMTY1OTEsImV4cCI6MjEwMzU5MjU5MX0.B8PwpDM2T2XEZdC5YjpWbq85IYbvuZ-EkLlyQ0LDlt8';
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
}) : null;

// AWS S3 Configuration (Region: ap-south-1)
const s3Region = process.env.AWS_REGION || 'ap-south-1';
const s3Bucket = process.env.AWS_S3_BUCKET || 'sbs-store-media-748439418595';
const cloudfrontDomain = process.env.CLOUDFRONT_DOMAIN || '';

const isS3Configured = Boolean(
  process.env.AWS_ACCESS_KEY_ID && 
  process.env.AWS_SECRET_ACCESS_KEY && 
  s3Bucket
);

const s3Client = isS3Configured ? new S3Client({
  region: s3Region,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
}) : null;

// CORS configuration supporting frontend deployments and localhost
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'https://sbs-store.pages.dev',
  'https://sbsstore.in',
  'https://www.sbsstore.in',
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:3000'
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (
      allowedOrigins.length === 0 ||
      allowedOrigins.includes(origin) ||
      origin.endsWith('.pages.dev') ||
      origin.endsWith('sbsstore.in') ||
      origin.includes('localhost') ||
      origin.includes('127.0.0.1')
    ) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'X-SBS-Admin-Role', 'Accept']
}));

app.use(express.json({ limit: '10mb' }));

// Helper: Verify Admin Role
const PRIMARY_ADMIN_EMAILS = [
  'mahipalstudent71@gmail.com',
  'shyambombaysale@gmail.com',
  'mahipalworld71@gmail.com',
  'devanshipatel564@gmail.com'
];

async function verifyAdminAuth(req) {
  const authHeader = req.headers.authorization;
  const adminRoleHeader = req.headers['x-sbs-admin-role'];
  const origin = req.headers.origin;

  // 1. Check if request carries a Supabase Bearer token
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    if (token && supabase) {
      try {
        const { data: { user }, error } = await supabase.auth.getUser(token);
        if (!error && user && user.email) {
          const email = user.email.toLowerCase();
          if (PRIMARY_ADMIN_EMAILS.includes(email)) {
            return { authorized: true, user, role: 'OWNER' };
          }

          // Check admin_team_members table
          const { data: member, error: dbError } = await supabase
            .from('admin_team_members')
            .select('role, status')
            .eq('email', email)
            .single();

          if (!dbError && member && member.status === 'ACTIVE') {
            return { authorized: true, user, role: member.role };
          }
        }
      } catch (err) {
        console.warn('Supabase token verification check:', err.message);
      }
    }
  }

  // 2. Allow verified store origins with admin role header
  const isAllowedOrigin = !origin || 
    origin.includes('sbsstore.in') || 
    origin.includes('sbs-store.pages.dev') || 
    origin.includes('localhost') || 
    origin.includes('127.0.0.1');

  if (isAllowedOrigin && ['OWNER', 'MANAGER', 'MARKETING', 'STAFF'].includes(adminRoleHeader)) {
    return { authorized: true, role: adminRoleHeader, user: { email: PRIMARY_ADMIN_EMAILS[0] } };
  }

  // 3. Fallback for non-production environments
  if (!supabase || process.env.NODE_ENV !== 'production') {
    return { authorized: true, user: { email: PRIMARY_ADMIN_EMAILS[0] }, role: 'OWNER' };
  }

  return { authorized: false, reason: 'Missing or unauthorized admin credentials' };
}

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'SBS Backend API',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// ==========================================
// AWS S3 Storage Management Endpoints
// ==========================================

// 1. Storage Status Check
app.get('/api/storage/status', async (req, res) => {
  try {
    if (!isS3Configured || !s3Client) {
      return res.json({
        configured: false,
        status: 'not_configured',
        bucket: s3Bucket,
        region: s3Region,
        message: 'AWS S3 credentials not found in server environment.'
      });
    }

    // Verify bucket connectivity with ListObjectsV2 (max 1 key)
    const testCmd = new ListObjectsV2Command({
      Bucket: s3Bucket,
      MaxKeys: 1,
      Prefix: 'products/'
    });
    await s3Client.send(testCmd);

    res.json({
      configured: true,
      status: 'connected',
      bucket: s3Bucket,
      region: s3Region,
      cloudfrontEnabled: Boolean(cloudfrontDomain),
      message: 'AWS S3 connected and operational in ap-south-1.'
    });
  } catch (err) {
    console.error('Storage status error:', err.message);
    res.status(500).json({
      configured: false,
      status: 'error',
      bucket: s3Bucket,
      region: s3Region,
      message: 'Failed to connect to AWS S3 bucket: ' + err.message
    });
  }
});

// 2. Generate Presigned PUT URL for Direct Browser-to-S3 Upload
app.post('/api/storage/presigned-url', async (req, res) => {
  const auth = await verifyAdminAuth(req);
  if (!auth.authorized) {
    return res.status(403).json({ error: auth.reason });
  }

  if (!isS3Configured || !s3Client) {
    return res.status(503).json({ error: 'AWS S3 is not configured on the server.' });
  }

  const { filename, fileType, fileSize, category } = req.body;

  if (!filename || !fileType) {
    return res.status(400).json({ error: 'Filename and fileType are required.' });
  }

  // Allowed Categories
  const validCategories = ['images', 'videos', 'thumbnails'];
  const targetCategory = validCategories.includes(category) ? category : 'images';

  // Allowed MIME Types & Size Caps
  const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
  const allowedVideoTypes = ['video/mp4', 'video/webm', 'video/quicktime'];

  const isImage = allowedImageTypes.includes(fileType.toLowerCase());
  const isVideo = allowedVideoTypes.includes(fileType.toLowerCase());

  if (!isImage && !isVideo) {
    return res.status(400).json({ 
      error: `Unsupported file type "${fileType}". Allowed: JPEG, PNG, WebP, AVIF, MP4, WebM, MOV.` 
    });
  }

  // Size limit validation (Images: 15MB, Videos: 250MB)
  if (isImage && fileSize && fileSize > 15 * 1024 * 1024) {
    return res.status(400).json({ error: 'Image size exceeds maximum limit of 15MB.' });
  }
  if (isVideo && fileSize && fileSize > 250 * 1024 * 1024) {
    return res.status(400).json({ error: 'Video size exceeds maximum limit of 250MB.' });
  }

  // Safe object key generation: products/<category>/<timestamp>-<sanitized-name>.<ext>
  const ext = path.extname(filename).toLowerCase() || (isImage ? '.webp' : '.mp4');
  const baseName = path.basename(filename, ext).replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();
  const safeKey = `products/${targetCategory}/${Date.now()}-${baseName}${ext}`;

  try {
    const putCommand = new PutObjectCommand({
      Bucket: s3Bucket,
      Key: safeKey,
      ContentType: fileType,
    });

    // Short-lived presigned URL (5 minutes)
    const uploadUrl = await getSignedUrl(s3Client, putCommand, { expiresIn: 300 });

    res.json({
      uploadUrl,
      key: safeKey,
      expiresIn: 300,
      bucket: s3Bucket,
      region: s3Region
    });
  } catch (err) {
    console.error('Presigned URL error:', err.message);
    res.status(500).json({ error: 'Failed to generate upload URL: ' + err.message });
  }
});

// 3. Resolve Media Delivery URL (Byte-range compatible for video streaming)
app.get('/api/storage/delivery-url', async (req, res) => {
  const { key } = req.query;

  if (!key || typeof key !== 'string') {
    return res.status(400).json({ error: 'Media key is required.' });
  }

  // Validate prefix & prevent path traversal
  if (key.includes('..') || !key.startsWith('products/')) {
    return res.status(400).json({ error: 'Invalid media key.' });
  }

  // If CloudFront is configured, return CDN URL immediately
  if (cloudfrontDomain) {
    return res.json({
      url: `https://${cloudfrontDomain}/${key}`,
      key,
      type: 'cdn'
    });
  }

  if (!isS3Configured || !s3Client) {
    return res.status(503).json({ error: 'Storage backend not configured.' });
  }

  try {
    const getCommand = new GetObjectCommand({
      Bucket: s3Bucket,
      Key: key,
    });

    // 1-hour signed URL supporting byte-range streaming for videos
    const signedUrl = await getSignedUrl(s3Client, getCommand, { expiresIn: 3600 });

    res.json({
      url: signedUrl,
      key,
      expiresIn: 3600,
      type: 'signed-s3'
    });
  } catch (err) {
    console.error('Delivery URL error:', err.message);
    res.status(500).json({ error: 'Could not generate media delivery URL.' });
  }
});

// 4. Batch Delivery URLs Resolver (For grid rendering)
app.post('/api/storage/delivery-urls', async (req, res) => {
  const { keys } = req.body;
  if (!Array.isArray(keys)) {
    return res.status(400).json({ error: 'Keys must be an array.' });
  }

  const results = {};
  for (const key of keys.slice(0, 100)) {
    if (!key || typeof key !== 'string') continue;
    if (key.startsWith('http://') || key.startsWith('https://') || key.startsWith('data:')) {
      results[key] = key;
      continue;
    }

    if (key.includes('..') || !key.startsWith('products/')) continue;

    if (cloudfrontDomain) {
      results[key] = `https://${cloudfrontDomain}/${key}`;
      continue;
    }

    if (isS3Configured && s3Client) {
      try {
        const getCommand = new GetObjectCommand({
          Bucket: s3Bucket,
          Key: key,
        });
        const signedUrl = await getSignedUrl(s3Client, getCommand, { expiresIn: 3600 });
        results[key] = signedUrl;
      } catch (e) {
        // Fallback
      }
    }
  }

  res.json({ urls: results });
});

// 5. List Media Objects (Admin only)
app.get('/api/storage/files', async (req, res) => {
  const auth = await verifyAdminAuth(req);
  if (!auth.authorized) {
    return res.status(403).json({ error: auth.reason });
  }

  if (!isS3Configured || !s3Client) {
    return res.status(503).json({ error: 'AWS S3 is not configured.' });
  }

  const prefix = req.query.prefix || 'products/';
  if (!prefix.startsWith('products/')) {
    return res.status(400).json({ error: 'Allowed prefix must start with "products/".' });
  }

  try {
    const listCmd = new ListObjectsV2Command({
      Bucket: s3Bucket,
      Prefix: prefix,
      MaxKeys: 100,
      ContinuationToken: req.query.continuationToken || undefined
    });

    const response = await s3Client.send(listCmd);
    const rawItems = response.Contents || [];

    // Filter out folder markers
    const files = rawItems.filter(item => !item.Key.endsWith('/'));

    // Generate delivery URLs for each item
    const items = await Promise.all(
      files.map(async (item) => {
        const isVideo = /\.(mp4|webm|mov)$/i.test(item.Key);
        let url = '';
        if (cloudfrontDomain) {
          url = `https://${cloudfrontDomain}/${item.Key}`;
        } else {
          const getCmd = new GetObjectCommand({ Bucket: s3Bucket, Key: item.Key });
          url = await getSignedUrl(s3Client, getCmd, { expiresIn: 3600 });
        }

        return {
          key: item.Key,
          url,
          name: path.basename(item.Key),
          size: item.Size || 0,
          lastModified: item.LastModified ? item.LastModified.toISOString() : new Date().toISOString(),
          type: isVideo ? 'video' : 'image',
        };
      })
    );

    res.json({
      items,
      count: items.length,
      nextContinuationToken: response.NextContinuationToken || null,
      isTruncated: Boolean(response.IsTruncated),
      bucket: s3Bucket,
      region: s3Region
    });
  } catch (err) {
    console.error('List files error:', err.message);
    res.status(500).json({ error: 'Failed to list files: ' + err.message });
  }
});

// 6. Delete Media Object (Admin only with strict prefix validation)
app.delete('/api/storage/files', async (req, res) => {
  const auth = await verifyAdminAuth(req);
  if (!auth.authorized) {
    return res.status(403).json({ error: auth.reason });
  }

  if (!isS3Configured || !s3Client) {
    return res.status(503).json({ error: 'AWS S3 is not configured.' });
  }

  const { key } = req.body;
  if (!key || typeof key !== 'string') {
    return res.status(400).json({ error: 'Object key is required.' });
  }

  // Strict prefix validation and path traversal prevention
  const validPrefixes = ['products/images/', 'products/videos/', 'products/thumbnails/'];
  const isValidPrefix = validPrefixes.some(p => key.startsWith(p));

  if (!isValidPrefix || key.includes('..')) {
    return res.status(400).json({ 
      error: 'Cannot delete: Key must start with products/images/, products/videos/, or products/thumbnails/ and cannot contain path traversal.' 
    });
  }

  try {
    const delCmd = new DeleteObjectCommand({
      Bucket: s3Bucket,
      Key: key,
    });
    await s3Client.send(delCmd);

    res.json({ success: true, message: `Object "${key}" deleted successfully.` });
  } catch (err) {
    console.error('Delete file error:', err.message);
    res.status(500).json({ error: 'Failed to delete object: ' + err.message });
  }
});

// ==========================================
// Existing Product & Order Endpoints
// ==========================================

// Categories endpoint
app.get('/api/categories', async (req, res) => {
  try {
    if (!supabase) return res.status(503).json({ error: 'Database service not configured' });
    const { data, error } = await supabase.from('categories').select('*').order('name');
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Products endpoint
app.get('/api/products', async (req, res) => {
  try {
    if (!supabase) return res.status(503).json({ error: 'Database service not configured' });
    const { data, error } = await supabase.from('products').select('*');
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create Order endpoint
app.post('/api/orders', async (req, res) => {
  try {
    if (!supabase) return res.status(503).json({ error: 'Database service not configured' });
    const orderData = req.body;
    const { data, error } = await supabase.from('orders').insert(orderData).select().single();
    if (error) return res.status(500).json({ error: error.message });
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`SBS Backend API listening on port ${PORT}`);
  console.log(`AWS S3 Storage module: ${isS3Configured ? 'ENABLED (' + s3Bucket + ' in ' + s3Region + ')' : 'DISABLED'}`);
});

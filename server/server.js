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
const crypto = require('crypto');
const Razorpay = require('razorpay');
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

// Razorpay Payment Gateway Configuration
const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;
const isRazorpayConfigured = Boolean(razorpayKeyId && razorpayKeySecret);

const razorpay = isRazorpayConfigured ? new Razorpay({
  key_id: razorpayKeyId,
  key_secret: razorpayKeySecret,
}) : null;

// CORS configuration supporting verified frontend deployments and localhost
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
    try {
      const parsed = new URL(origin);
      const isAllowed = 
        allowedOrigins.includes(origin) ||
        parsed.hostname === 'sbsstore.in' ||
        parsed.hostname === 'www.sbsstore.in' ||
        parsed.hostname === 'sbs-store.pages.dev' ||
        parsed.hostname.endsWith('.sbs-store.pages.dev') ||
        parsed.hostname.endsWith('.ngrok-free.dev') ||
        parsed.hostname === 'localhost' ||
        parsed.hostname === '127.0.0.1';

      if (isAllowed) {
        return callback(null, true);
      }
    } catch (e) { }
    return callback(new Error('Not allowed by CORS policy'));
  },
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'X-SBS-Admin-Role', 'Accept']
}));

app.use(express.json({ limit: '10mb' }));

// Helper: Verify Admin Role Strictly Via Authenticated Supabase JWT
const PRIMARY_ADMIN_EMAILS = [
  'mahipalstudent71@gmail.com',
  'shyambombaysale@gmail.com',
  'mahipalworld71@gmail.com',
  'devanshipatel564@gmail.com'
];

async function verifyAdminAuth(req) {
  const authHeader = req.headers.authorization;

  // 1. Require a verified Supabase Bearer token for administrative operations
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
        console.warn('Supabase token verification check error:', err.message);
      }
    }
  }

  // Reject unauthenticated requests or spoofed headers
  return { authorized: false, reason: 'Unauthorized: A verified administrator session is required.' };
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
      CacheControl: 'public, max-age=31536000, immutable'
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

// 3. Resolve Media Delivery URL (Direct high-speed delivery with HTTP caching)
app.get('/api/storage/delivery-url', async (req, res) => {
  const { key } = req.query;

  if (!key || typeof key !== 'string') {
    return res.status(400).json({ error: 'Media key is required.' });
  }

  // Validate key & prevent path traversal
  if (key.includes('..')) {
    return res.status(400).json({ error: 'Invalid media key.' });
  }

  res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400');

  // If CloudFront is configured, return CDN URL immediately
  if (cloudfrontDomain) {
    return res.json({
      url: `https://${cloudfrontDomain}/${key}`,
      key,
      type: 'cdn'
    });
  }

  // Direct public S3 URL in ap-south-1
  const cleanKey = key.startsWith('/') ? key.slice(1) : key;
  const directUrl = `https://${s3Bucket}.s3.${s3Region}.amazonaws.com/${cleanKey}`;
  return res.json({
    url: directUrl,
    key,
    type: 'direct-s3'
  });
});

// 4. Batch Delivery URLs Resolver (Instant parallel resolution with HTTP caching)
app.post('/api/storage/delivery-urls', async (req, res) => {
  const { keys } = req.body;
  if (!Array.isArray(keys)) {
    return res.status(400).json({ error: 'Keys must be an array.' });
  }

  res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400');

  const base = cloudfrontDomain
    ? `https://${cloudfrontDomain}`
    : `https://${s3Bucket}.s3.${s3Region}.amazonaws.com`;

  const results = {};
  for (const key of keys.slice(0, 100)) {
    if (!key || typeof key !== 'string') continue;
    if (key.startsWith('http://') || key.startsWith('https://') || key.startsWith('data:')) {
      results[key] = key;
      continue;
    }

    if (key.includes('..')) continue;

    const cleanKey = key.startsWith('/') ? key.slice(1) : key;
    results[key] = `${base}/${cleanKey}`;
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

  let prefix = typeof req.query.prefix === 'string' ? req.query.prefix : 'products/';
  if (prefix.includes('..')) {
    return res.status(400).json({ error: 'Invalid prefix: path traversal not allowed.' });
  }

  // Normalize common prefix variations
  if (prefix === 'videos/') prefix = 'products/videos/';
  else if (prefix === 'images/') prefix = 'products/images/';
  else if (prefix === 'thumbnails/') prefix = 'products/thumbnails/';
  else if (prefix === 'all' || prefix === 'ALL') prefix = '';

  try {
    const listCmd = new ListObjectsV2Command({
      Bucket: s3Bucket,
      Prefix: prefix || undefined,
      MaxKeys: 1000,
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

// Products endpoints
app.get('/api/products', async (req, res) => {
  try {
    if (!supabase) return res.status(503).json({ error: 'Database service not configured' });
    const { data, error } = await supabase.from('products').select('*').order('name');
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/products', async (req, res) => {
  try {
    const auth = await verifyAdminAuth(req);
    if (!auth.authorized) {
      return res.status(403).json({ error: auth.reason || 'Unauthorized' });
    }
    if (!supabase) return res.status(503).json({ error: 'Database service not configured' });
    const productData = req.body;
    const { data, error } = await supabase.from('products').insert(productData).select().single();
    if (error) return res.status(500).json({ error: error.message });
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error: ' + err.message });
  }
});

app.put('/api/products/:id', async (req, res) => {
  try {
    const auth = await verifyAdminAuth(req);
    if (!auth.authorized) {
      return res.status(403).json({ error: auth.reason || 'Unauthorized' });
    }
    if (!supabase) return res.status(503).json({ error: 'Database service not configured' });
    const { id } = req.params;
    const updates = req.body;
    const { data, error } = await supabase.from('products').update(updates).eq('id', id).select().single();
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error: ' + err.message });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    const auth = await verifyAdminAuth(req);
    if (!auth.authorized) {
      return res.status(403).json({ error: auth.reason || 'Unauthorized' });
    }
    if (!supabase) return res.status(503).json({ error: 'Database service not configured' });
    const { id } = req.params;
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true, id });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error: ' + err.message });
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

// ==========================================
// Razorpay Payment Gateway Endpoints
// ==========================================

// 1. Payment Gateway Configuration Status
app.get('/api/payment/config', (req, res) => {
  res.json({
    configured: isRazorpayConfigured,
    keyId: isRazorpayConfigured ? razorpayKeyId : null,
  });
});

// 2. Create Razorpay Order
app.post('/api/payment/create-order', async (req, res) => {
  try {
    if (!isRazorpayConfigured || !razorpay) {
      return res.status(503).json({ error: 'Razorpay is not configured on the server.' });
    }

    const { amount, currency = 'INR', receipt, notes } = req.body;
    let verifiedAmount = Number(amount);

    if (!verifiedAmount || isNaN(verifiedAmount) || verifiedAmount <= 0) {
      return res.status(400).json({ error: 'Valid positive payment amount is required.' });
    }

    // Server-side price tampering verification against registered Supabase order
    const sbsOrderId = notes?.sbsOrderId;
    if (sbsOrderId && supabase) {
      try {
        const { data: orderRecord, error: orderErr } = await supabase
          .from('orders')
          .select('id, total, status')
          .eq('id', sbsOrderId)
          .single();

        if (!orderErr && orderRecord && orderRecord.total !== undefined) {
          const dbTotal = Number(orderRecord.total);
          // If customer-sent amount deviates from registered order total, lock to verified database total
          if (Math.abs(verifiedAmount - dbTotal) > 0.5) {
            console.warn(`Price tampering detected for order ${sbsOrderId}: Client sent ₹${verifiedAmount}, DB record is ₹${dbTotal}`);
            return res.status(400).json({ 
              error: `Amount mismatch detected. Order total is ₹${dbTotal}. Please refresh checkout.` 
            });
          }
          verifiedAmount = dbTotal;
        }
      } catch (dbCheckErr) {
        console.warn('Order amount verification note:', dbCheckErr.message);
      }
    }

    // Razorpay amount is in paise (1 INR = 100 paise)
    const amountInPaise = Math.round(verifiedAmount * 100);

    const orderOptions = {
      amount: amountInPaise,
      currency: currency || 'INR',
      receipt: receipt || `rcpt_${Date.now()}`,
      notes: notes || {}
    };

    const razorpayOrder = await razorpay.orders.create(orderOptions);

    res.json({
      success: true,
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: razorpayKeyId,
    });
  } catch (err) {
    console.error('Razorpay create-order error:', err);
    res.status(500).json({ 
      error: 'Failed to create payment order: ' + (err.description || err.message) 
    });
  }
});

// 3. Verify Razorpay Payment Signature
app.post('/api/payment/verify-payment', async (req, res) => {
  try {
    if (!isRazorpayConfigured || !razorpayKeySecret) {
      return res.status(503).json({ error: 'Razorpay is not configured on the server.' });
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, sbsOrderId } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: 'Missing required Razorpay payment verification fields.' });
    }

    // Cryptographic HMAC SHA256 verification
    const expectedSignature = crypto
      .createHmac('sha256', razorpayKeySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    // Prevent timing attacks using crypto.timingSafeEqual
    const expectedBuf = Buffer.from(expectedSignature, 'utf8');
    const receivedBuf = Buffer.from(razorpay_signature, 'utf8');

    const isValid = expectedBuf.length === receivedBuf.length && crypto.timingSafeEqual(expectedBuf, receivedBuf);

    if (!isValid) {
      return res.status(400).json({ success: false, error: 'Payment verification failed: Invalid signature.' });
    }

    // If SBS Order ID provided, update Supabase order record
    if (supabase && sbsOrderId) {
      try {
        await supabase
          .from('orders')
          .update({
            payment_status: 'PAYMENT_VERIFIED',
            payment_confirmed_at: new Date().toISOString(),
          })
          .eq('id', sbsOrderId);
      } catch (dbErr) {
        console.warn('Could not auto-update order status in Supabase:', dbErr.message);
      }
    }

    res.json({
      success: true,
      verified: true,
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      message: 'Payment verified successfully.'
    });
  } catch (err) {
    console.error('Razorpay verify-payment error:', err);
    res.status(500).json({ error: 'Payment verification failed: ' + err.message });
  }
});

app.listen(PORT, () => {
  console.log(`SBS Backend API listening on port ${PORT}`);
  console.log(`AWS S3 Storage module: ${isS3Configured ? 'ENABLED (' + s3Bucket + ' in ' + s3Region + ')' : 'DISABLED'}`);
  console.log(`Razorpay Gateway module: ${isRazorpayConfigured ? 'ENABLED (' + razorpayKeyId + ')' : 'DISABLED'}`);
});

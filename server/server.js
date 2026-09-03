const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Supabase client initialization
const supabaseUrl = process.env.SUPABASE_URL || 'https://pclwoyqrlfyqfqojhmag.supabase.co';
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
}) : null;

// CORS configuration supporting frontend deployments and localhost
const allowedOrigins = [
  process.env.FRONTEND_URL,
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
      origin.includes('localhost') ||
      origin.includes('127.0.0.1')
    ) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

app.use(express.json());

// Health Check Endpoint (Phase 4 requirement: GET /health returns { status: "ok" })
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
});

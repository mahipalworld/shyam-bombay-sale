const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
require('dotenv').config();

// AWS SES Configuration
const awsRegion = process.env.AWS_REGION || 'ap-south-1';
const defaultFromEmail = process.env.SES_FROM_EMAIL || 'orders@sbsstore.in';
const storeName = 'SBS Store (Shyam Bombay Sale)';
const storeUrl = process.env.FRONTEND_URL || 'https://sbsstore.in';

// Initialize SES Client
// If explicit credentials are provided in .env, use them; otherwise, AWS SDK automatically resolves from IAM / AWS credentials chain
const sesClient = new SESClient({
  region: awsRegion,
  ...(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY ? {
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    }
  } : {})
});

/**
 * Core function to send an email via AWS SES
 */
async function sendRawEmail({ to, subject, html, text, from = defaultFromEmail }) {
  if (!to) {
    console.warn('[EmailService] Skipped sending: No recipient email provided.');
    return { success: false, reason: 'No recipient email' };
  }

  // Ensure 'to' is an array
  const destinationAddresses = Array.isArray(to) ? to : [to];

  const params = {
    Source: `${storeName} <${from}>`,
    Destination: {
      ToAddresses: destinationAddresses,
    },
    Message: {
      Subject: {
        Charset: 'UTF-8',
        Data: subject,
      },
      Body: {
        Html: {
          Charset: 'UTF-8',
          Data: html,
        },
        ...(text ? {
          Text: {
            Charset: 'UTF-8',
            Data: text,
          }
        } : {}),
      },
    },
  };

  try {
    const command = new SendEmailCommand(params);
    const response = await sesClient.send(command);
    console.log(`[EmailService] Email sent successfully to ${destinationAddresses.join(', ')} | MessageId: ${response.MessageId}`);
    return { success: true, messageId: response.MessageId };
  } catch (err) {
    console.error(`[EmailService] Failed to send email to ${destinationAddresses.join(', ')}:`, err.message);
    return { success: false, error: err.message };
  }
}

// ============================================================================
// HTML Email Templates
// ============================================================================

/**
 * Base Email Wrapper with Premium SBS Store styling
 */
function emailLayout({ title, previewText, content }) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #0d0f12;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #e5e7eb;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      width: 100%;
      background-color: #0d0f12;
      padding: 30px 10px;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #14181f;
      border-radius: 16px;
      overflow: hidden;
      border: 1px solid #262c36;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
    }
    .header {
      background: linear-gradient(135deg, #1c212a 0%, #11141a 100%);
      padding: 28px 24px;
      text-align: center;
      border-bottom: 1px solid #262c36;
    }
    .logo-text {
      font-size: 24px;
      font-weight: 800;
      letter-spacing: 1.5px;
      color: #ffffff;
      text-transform: uppercase;
      margin: 0;
    }
    .logo-gold {
      color: #f59e0b;
      background: linear-gradient(135deg, #fbbf24 0%, #d97706 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .body-content {
      padding: 32px 28px;
    }
    .footer {
      padding: 24px;
      text-align: center;
      font-size: 12px;
      color: #6b7280;
      border-top: 1px solid #202630;
      background-color: #0e1116;
    }
    .btn {
      display: inline-block;
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
      color: #0d0f12 !important;
      font-weight: 700;
      padding: 13px 28px;
      border-radius: 8px;
      text-decoration: none;
      font-size: 14px;
      margin-top: 16px;
      letter-spacing: 0.5px;
    }
    .badge {
      display: inline-block;
      padding: 6px 14px;
      border-radius: 9999px;
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .badge-success { background-color: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.3); }
    .badge-info { background-color: rgba(59, 130, 246, 0.15); color: #60a5fa; border: 1px solid rgba(59, 130, 246, 0.3); }
    .badge-amber { background-color: rgba(245, 158, 11, 0.15); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.3); }
    table.items-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 20px;
    }
    table.items-table th {
      text-align: left;
      font-size: 12px;
      color: #9ca3af;
      padding: 10px 8px;
      border-bottom: 1px solid #262c36;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    table.items-table td {
      padding: 14px 8px;
      border-bottom: 1px solid #1f2530;
      font-size: 14px;
      vertical-align: middle;
    }
    .price {
      font-weight: 700;
      color: #f3f4f6;
    }
  </style>
</head>
<body>
  <div style="display:none;font-size:1px;color:#333;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">
    ${previewText || title}
  </div>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <h1 class="logo-text">SBS <span class="logo-gold">STORE</span></h1>
        <p style="margin: 4px 0 0; font-size: 12px; color: #9ca3af; letter-spacing: 1px;">SHYAM BOMBAY SALE</p>
      </div>
      <div class="body-content">
        ${content}
      </div>
      <div class="footer">
        <p style="margin: 0 0 8px;">© ${new Date().getFullYear()} Shyam Bombay Sale (SBS Store). All rights reserved.</p>
        <p style="margin: 0 0 12px; color: #9ca3af;">Everyday Home, Kitchen & Cleaning Essentials</p>
        <p style="margin: 0; font-size: 11px;">
          <a href="${storeUrl}" style="color: #f59e0b; text-decoration: none;">Visit Store</a> &bull; 
          <a href="${storeUrl}/orders" style="color: #9ca3af; text-decoration: none;">My Orders</a> &bull; 
          <a href="${storeUrl}/contact" style="color: #9ca3af; text-decoration: none;">Support</a>
        </p>
      </div>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * 1. Order Confirmation Email
 */
async function sendOrderConfirmation(order) {
  const customerEmail = order.shipping_address?.email || order.customer_email;
  const customerName = order.shipping_address?.fullName || order.shipping_address?.name || 'Valued Customer';
  const orderNumber = order.order_number || `#${(order.id || '').substring(0, 8).toUpperCase()}`;

  const items = Array.isArray(order.items) ? order.items : [];
  const itemsHtml = items.map(item => {
    const variantParts = [
      item.volume,
      item.variant,
      item.selectedSize || item.size,
      item.selectedColor || item.color
    ].filter(Boolean).join(' | ');

    return `
    <tr>
      <td style="padding: 12px 8px; width: 50px;">
        ${item.image ? `<img src="${item.image}" alt="${item.title || item.name}" width="48" height="48" style="border-radius: 8px; object-fit: cover; display: block;" />` : ''}
      </td>
      <td style="padding: 12px 8px;">
        <div style="font-weight: 600; color: #ffffff;">${item.title || item.name || 'Product'}</div>
        <div style="font-size: 12px; color: #9ca3af; margin-top: 2px;">
          ${variantParts ? `${variantParts} &bull; ` : ''}Qty: ${item.quantity || 1}
        </div>
      </td>
      <td style="padding: 12px 8px; text-align: right; font-weight: 600; color: #f59e0b;">
        ₹${Number(item.price || 0) * Number(item.quantity || 1)}
      </td>
    </tr>
  `;
  }).join('');

  const shipping = order.shipping_address || {};
  const shippingAddressText = [
    shipping.street || shipping.address,
    shipping.city,
    shipping.state,
    shipping.pincode || shipping.zipCode
  ].filter(Boolean).join(', ');

  const content = `
    <div style="text-align: center; margin-bottom: 24px;">
      <span class="badge badge-success">✓ Order Confirmed</span>
      <h2 style="color: #ffffff; font-size: 22px; margin: 16px 0 8px;">Thank You for Your Order, ${customerName}!</h2>
      <p style="color: #9ca3af; font-size: 14px; margin: 0;">We've received your order and our team is preparing it with care.</p>
    </div>

    <div style="background-color: #1a202c; border-radius: 12px; padding: 16px 20px; margin: 20px 0; border: 1px solid #2d3748;">
      <div style="display: flex; justify-content: space-between; font-size: 13px;">
        <div>
          <span style="color: #9ca3af;">Order Number:</span>
          <strong style="color: #f59e0b; display: block; font-size: 15px; margin-top: 2px;">${orderNumber}</strong>
        </div>
        <div style="text-align: right;">
          <span style="color: #9ca3af;">Payment Method:</span>
          <strong style="color: #ffffff; display: block; font-size: 14px; margin-top: 2px;">${(order.payment_method || 'Prepaid').toUpperCase()}</strong>
        </div>
      </div>
    </div>

    <h3 style="color: #ffffff; font-size: 16px; margin: 24px 0 12px; border-bottom: 1px solid #262c36; padding-bottom: 8px;">Order Summary</h3>
    <table class="items-table">
      <thead>
        <tr>
          <th colspan="2">Item</th>
          <th style="text-align: right;">Price</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
    </table>

    <div style="margin-top: 20px; padding-top: 16px; border-top: 1px solid #262c36;">
      <div style="display: flex; justify-content: space-between; font-size: 13px; color: #9ca3af; margin-bottom: 6px;">
        <span>Subtotal</span>
        <span>₹${order.subtotal || order.total}</span>
      </div>
      ${order.discount ? `
      <div style="display: flex; justify-content: space-between; font-size: 13px; color: #34d399; margin-bottom: 6px;">
        <span>Discount</span>
        <span>-₹${order.discount}</span>
      </div>` : ''}
      <div style="display: flex; justify-content: space-between; font-size: 13px; color: #9ca3af; margin-bottom: 10px;">
        <span>Delivery</span>
        <span>${order.delivery_charge ? `₹${order.delivery_charge}` : 'FREE'}</span>
      </div>
      <div style="display: flex; justify-content: space-between; font-size: 17px; font-weight: 700; color: #ffffff; padding-top: 10px; border-top: 1px dashed #374151;">
        <span>Total Paid</span>
        <span style="color: #f59e0b;">₹${order.total}</span>
      </div>
    </div>

    ${shippingAddressText ? `
    <div style="margin-top: 24px; padding: 16px; background-color: #1a202c; border-radius: 10px; border: 1px solid #262c36;">
      <h4 style="margin: 0 0 6px; font-size: 13px; color: #9ca3af; text-transform: uppercase;">Delivery Address</h4>
      <p style="margin: 0; font-size: 14px; color: #e5e7eb; line-height: 1.5;">
        <strong>${customerName}</strong><br />
        ${shippingAddressText}<br />
        ${shipping.phone ? `Phone: ${shipping.phone}` : ''}
      </p>
    </div>` : ''}

    <div style="text-align: center; margin-top: 30px;">
      <a href="${storeUrl}/orders" class="btn">Track Order Details</a>
    </div>
  `;

  const html = emailLayout({
    title: `Order Confirmation - ${orderNumber} | SBS Store`,
    previewText: `Thank you for your order! Your SBS Store order ${orderNumber} is confirmed.`,
    content,
  });

  return sendRawEmail({
    to: customerEmail,
    subject: `Order Confirmed: ${orderNumber} | SBS Store`,
    html,
  });
}

/**
 * 2. Order Status Update Email (Shipped, Out for Delivery, Delivered)
 */
async function sendOrderStatusUpdate(order, newStatus, trackingInfo = {}) {
  const customerEmail = order.shipping_address?.email || order.customer_email;
  const customerName = order.shipping_address?.fullName || order.shipping_address?.name || 'Valued Customer';
  const orderNumber = order.order_number || `#${(order.id || '').substring(0, 8).toUpperCase()}`;

  let statusBadge = '';
  let statusMessage = '';
  let statusColor = '#f59e0b';

  const normalizedStatus = String(newStatus).toUpperCase();

  switch (normalizedStatus) {
    case 'SHIPPED':
      statusBadge = '<span class="badge badge-info">📦 Order Dispatched</span>';
      statusMessage = 'Great news! Your package has been dispatched and is on its way to you.';
      statusColor = '#3b82f6';
      break;
    case 'OUT_FOR_DELIVERY':
      statusBadge = '<span class="badge badge-amber">🚚 Out for Delivery</span>';
      statusMessage = 'Your package is out for delivery today. Please ensure someone is available at the address.';
      statusColor = '#f59e0b';
      break;
    case 'DELIVERED':
      statusBadge = '<span class="badge badge-success">✓ Successfully Delivered</span>';
      statusMessage = 'Your SBS Store package has been delivered! We hope you love your new purchase.';
      statusColor = '#10b981';
      break;
    case 'CANCELLED':
      statusBadge = '<span class="badge" style="background:rgba(239,68,68,0.2);color:#ef4444;border:1px solid rgba(239,68,68,0.4)">Cancelled</span>';
      statusMessage = 'Your order has been cancelled. Any payment debited will be refunded to your source account.';
      statusColor = '#ef4444';
      break;
    default:
      statusBadge = `<span class="badge badge-amber">${newStatus}</span>`;
      statusMessage = `Your order status has been updated to ${newStatus}.`;
  }

  const content = `
    <div style="text-align: center; margin-bottom: 24px;">
      ${statusBadge}
      <h2 style="color: #ffffff; font-size: 22px; margin: 16px 0 8px;">Order Update for ${orderNumber}</h2>
      <p style="color: #9ca3af; font-size: 14px; margin: 0;">${statusMessage}</p>
    </div>

    ${trackingInfo.trackingNumber ? `
    <div style="background-color: #1a202c; border-radius: 12px; padding: 20px; margin: 24px 0; border: 1px solid #2d3748; text-align: center;">
      <span style="font-size: 12px; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.5px;">Tracking Information</span>
      <div style="font-size: 18px; font-weight: 700; color: #ffffff; margin: 6px 0;">
        ${trackingInfo.courier ? `${trackingInfo.courier}: ` : ''}${trackingInfo.trackingNumber}
      </div>
      ${trackingInfo.trackingUrl ? `
        <a href="${trackingInfo.trackingUrl}" target="_blank" style="color: #f59e0b; font-size: 13px; text-decoration: underline;">
          Track live with carrier &rarr;
        </a>
      ` : ''}
    </div>` : ''}

    <div style="text-align: center; margin-top: 30px;">
      <a href="${storeUrl}/orders" class="btn">View Live Status</a>
    </div>
  `;

  const html = emailLayout({
    title: `Order Status: ${newStatus} - ${orderNumber}`,
    previewText: `${statusMessage} Order: ${orderNumber}`,
    content,
  });

  return sendRawEmail({
    to: customerEmail,
    subject: `Order Update: ${newStatus} (${orderNumber}) | SBS Store`,
    html,
  });
}

/**
 * 3. Welcome Email for New Signups
 */
async function sendWelcomeEmail(userEmail, userName = 'Friend') {
  const content = `
    <div style="text-align: center; margin-bottom: 24px;">
      <span class="badge badge-amber">Welcome to SBS Store</span>
      <h2 style="color: #ffffff; font-size: 24px; margin: 16px 0 8px;">Welcome to the Family, ${userName}!</h2>
      <p style="color: #9ca3af; font-size: 14px; margin: 0; line-height: 1.6;">
        We're thrilled to have you here at Shyam Bombay Sale (SBS Store). Discover everyday home essentials, kitchen utility, cleaning supplies, and plasticware at unbeatable prices.
      </p>
    </div>

    <div style="background: linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(217, 119, 6, 0.05) 100%); border-radius: 14px; padding: 24px; margin: 24px 0; border: 1px dashed #f59e0b; text-align: center;">
      <span style="font-size: 12px; color: #f59e0b; text-transform: uppercase; letter-spacing: 1px; font-weight: 700;">Exclusive Welcome Gift</span>
      <div style="font-size: 26px; font-weight: 900; color: #ffffff; letter-spacing: 2px; margin: 8px 0;">
        WELCOME10
      </div>
      <p style="color: #d1d5db; font-size: 13px; margin: 0;">
        Enjoy <strong>10% OFF</strong> on your first order. Apply this coupon at checkout!
      </p>
    </div>

    <div style="text-align: center; margin-top: 30px;">
      <a href="${storeUrl}" class="btn">Explore Collections</a>
    </div>
  `;

  const html = emailLayout({
    title: 'Welcome to SBS Store',
    previewText: 'Welcome to Shyam Bombay Sale! Here is an exclusive 10% discount for your first order.',
    content,
  });

  return sendRawEmail({
    to: userEmail,
    subject: 'Welcome to SBS Store! Enjoy 10% off your first order 🎉',
    html,
  });
}

/**
 * 4. Marketing / Promotional Broadcast Email
 */
async function sendMarketingBroadcast({ to, subject, headline, bodyText, discountCode, bannerUrl, ctaText = 'Shop Now', ctaUrl = storeUrl }) {
  const content = `
    <div style="text-align: center; margin-bottom: 24px;">
      <span class="badge badge-amber">Special Announcement</span>
      <h2 style="color: #ffffff; font-size: 22px; margin: 16px 0 8px;">${headline || subject}</h2>
      ${bannerUrl ? `
        <div style="margin: 20px 0;">
          <img src="${bannerUrl}" alt="${headline}" style="max-width: 100%; border-radius: 12px; display: block;" />
        </div>
      ` : ''}
      <p style="color: #d1d5db; font-size: 14px; line-height: 1.6; margin: 16px 0;">
        ${bodyText}
      </p>
    </div>

    ${discountCode ? `
    <div style="background: rgba(245, 158, 11, 0.1); border-radius: 12px; padding: 18px; text-align: center; margin: 20px 0; border: 1px dashed #f59e0b;">
      <div style="font-size: 12px; color: #f59e0b; text-transform: uppercase; font-weight: 700;">Use Coupon Code</div>
      <div style="font-size: 24px; font-weight: 800; color: #ffffff; letter-spacing: 2px; margin: 4px 0;">${discountCode}</div>
    </div>` : ''}

    <div style="text-align: center; margin-top: 24px;">
      <a href="${ctaUrl}" class="btn">${ctaText}</a>
    </div>
  `;

  const html = emailLayout({
    title: subject,
    previewText: headline || subject,
    content,
  });

  return sendRawEmail({
    to,
    subject,
    html,
  });
}

module.exports = {
  sendRawEmail,
  sendOrderConfirmation,
  sendOrderStatusUpdate,
  sendWelcomeEmail,
  sendMarketingBroadcast,
  sesClient,
};

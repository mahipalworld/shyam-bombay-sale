const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
require('dotenv').config();

const { syncOutboundOrderMessage } = require('./wacrmSyncService');

const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN || 'EAAtkeqhZCW6IBS4ccYH03HjkQdiZC2g77ztlZAe5ZC4DWYf2QMDb5P9buVBFqA1joNZCxZCcuMIyC65a3xr6lmw1rlTTmuTDCgiHhbunexUcDhpvoBePaZB8vHfyDQo0X4iboHRlMSg3GZBPMkQNE0Ljh353rySX4oV57ea4uKZA3hSkbpzQ9kE9vdSM4zzYYiAZAwXU1tJUl4E76E';
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID || '1351691691356682';

/**
 * Normalizes any phone string to E.164 digits format (91XXXXXXXXXX).
 */
function normalizePhoneForWhatsApp(raw) {
  if (!raw) return null;
  const digits = String(raw).replace(/\D/g, '');
  if (digits.length === 10) return `91${digits}`;
  if (digits.length === 12 && digits.startsWith('91')) return digits;
  if (digits.length === 11 && digits.startsWith('0')) return `91${digits.slice(1)}`;
  return digits.length >= 10 ? digits : null;
}

/**
 * Sends a Meta WhatsApp Template message (utility / marketing category).
 * Bypasses 24-hr session restrictions and guarantees delivery.
 */
async function sendWhatsAppTemplate(toPhone, templateName, components = [], languageCode = 'en_US') {
  try {
    const recipient = normalizePhoneForWhatsApp(toPhone);
    if (!recipient) {
      console.warn('[WhatsAppService] Skipped: Invalid recipient phone', toPhone);
      return { success: false, reason: 'invalid_phone' };
    }

    if (!WHATSAPP_ACCESS_TOKEN || !WHATSAPP_PHONE_NUMBER_ID) {
      console.warn('[WhatsAppService] Skipped: Missing WhatsApp Cloud API credentials');
      return { success: false, reason: 'missing_credentials' };
    }

    const url = `https://graph.facebook.com/v21.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`;
    const payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: recipient,
      type: 'template',
      template: {
        name: templateName,
        language: {
          code: languageCode,
        },
        components: components,
      },
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!response.ok) {
      console.error('[WhatsAppService] Meta Template API Error:', data);
      return { success: false, error: data };
    }

    const messageId = data.messages?.[0]?.id;
    console.log(`[WhatsAppService] Template '${templateName}' delivered to ${recipient}:`, messageId);
    return { success: true, messageId, recipient };
  } catch (err) {
    console.error('[WhatsAppService] Exception sending WhatsApp template:', err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Sends a standard WhatsApp session text notification (valid within 24h window).
 */
async function sendWhatsAppNotification(toPhone, messageText) {
  try {
    const recipient = normalizePhoneForWhatsApp(toPhone);
    if (!recipient) {
      console.warn('[WhatsAppService] Skipped: Invalid recipient phone', toPhone);
      return { success: false, reason: 'invalid_phone' };
    }

    if (!WHATSAPP_ACCESS_TOKEN || !WHATSAPP_PHONE_NUMBER_ID) {
      console.warn('[WhatsAppService] Skipped: Missing WhatsApp Cloud API credentials');
      return { success: false, reason: 'missing_credentials' };
    }

    const url = `https://graph.facebook.com/v21.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: recipient,
        type: 'text',
        text: { body: messageText },
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      console.error('[WhatsAppService] Meta API Error:', data);
      return { success: false, error: data };
    }

    const messageId = data.messages?.[0]?.id;
    console.log(`[WhatsAppService] Text notification delivered to ${recipient}:`, messageId);
    return { success: true, messageId, recipient };
  } catch (err) {
    console.error('[WhatsAppService] Exception sending WhatsApp notification:', err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Sends Order Confirmation using the approved 'sbs_order_update' template.
 * Template structure:
 * "Hello {{1}}, your order #{{2}} from Shyam Bombay Sale has been received and is being processed. Thank you for shopping with us at sbsstore.in."
 */
async function sendOrderConfirmationWhatsApp(order) {
  try {
    const rawPhone = order.shipping_address?.phone || order.phone;
    if (!rawPhone) {
      console.warn(`[WhatsAppService] Order #${order.order_number} has no phone on record.`);
      return { success: false, reason: 'no_phone' };
    }

    const customerName = String(order.shipping_address?.fullName || order.shipping_address?.name || 'Customer').trim();
    const orderNumber = String(order.order_number || order.id || 'SBS').replace(/^[#\s]+/, '').trim();

    const templateComponents = [
      {
        type: 'body',
        parameters: [
          { type: 'text', text: customerName },
          { type: 'text', text: orderNumber },
        ],
      },
    ];

    const result = await sendWhatsAppTemplate(rawPhone, 'sbs_order_update', templateComponents, 'en_US');

    // Sync to WACRM inbox regardless of result to maintain audit trail
    const humanReadable = `Hello ${customerName}, your order #${orderNumber} from Shyam Bombay Sale has been received and is being processed. Thank you for shopping with us at sbsstore.in.`;
    
    syncOutboundOrderMessage({
      recipientPhone: rawPhone,
      customerName,
      messageText: humanReadable,
      templateName: 'sbs_order_update',
      messageId: result.messageId || null,
    }).catch(err => {
      console.warn('[WhatsAppService] WACRM sync background warning:', err.message);
    });

    return result;
  } catch (err) {
    console.error('[WhatsAppService] sendOrderConfirmationWhatsApp error:', err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Sends order status update notification to the customer via WhatsApp.
 * - Initial/Confirmed statuses dispatch the approved 'sbs_order_update' template.
 * - Progress statuses (Shipped, Delivered, etc.) send rich tracking details, with
 *   automatic graceful fallback to 'sbs_order_update' template if the 24h customer window is closed.
 */
async function sendOrderStatusNotification(order, status, meta = {}) {
  try {
    const rawPhone = order.shipping_address?.phone || order.phone;
    if (!rawPhone) {
      console.warn(`[WhatsAppService] Order #${order.order_number} has no phone number on record.`);
      return { success: false, reason: 'no_phone' };
    }

    const customerName = String(order.shipping_address?.fullName || order.shipping_address?.name || 'Valued Customer').trim();
    const orderNumber = String(order.order_number || order.id || 'SBS').replace(/^[#\s]+/, '').trim();
    const trackingNumber = meta.trackingNumber || order.tracking_number;
    const courier = meta.courier;
    const trackingUrl = meta.trackingUrl;

    const normalizedStatus = String(status).trim().toLowerCase();

    // If order is in early confirmation/processing stage, send approved template directly
    if (normalizedStatus === 'confirmed' || normalizedStatus === 'processing' || normalizedStatus === 'to pay') {
      return await sendOrderConfirmationWhatsApp(order);
    }

    // For milestone updates (Shipped, Out for Delivery, Delivered, Cancelled):
    const statusEmojis = {
      processing: '⏳',
      confirmed: '✅',
      packed: '📦',
      shipped: '🚚',
      out_for_delivery: '🛵',
      delivered: '🎉',
      cancelled: '❌',
      returns: '🔄',
    };
    const emoji = statusEmojis[normalizedStatus] || '📦';

    let text = `${emoji} *Shyam Bombay Sale — Order Update*\n\nHello *${customerName}*! Your order *#${orderNumber}* is now *${status}*.\n\n💰 *Total Amount:* ₹${Number(order.total || 0).toLocaleString('en-IN')}`;

    if (trackingNumber) {
      text += `\n📍 *Tracking Number:* ${trackingNumber}`;
    }
    if (courier) {
      text += `\n🚚 *Courier Partner:* ${courier}`;
    }
    if (trackingUrl) {
      text += `\n🔗 *Track Live:* ${trackingUrl}`;
    } else {
      text += `\n🔗 *View Order Details:* https://sbsstore.in/orders`;
    }

    text += `\n\nNeed assistance or wish to speak to our staff? Simply reply directly to this chat!`;

    // Attempt rich session message
    const sendRes = await sendWhatsAppNotification(rawPhone, text);

    // If Meta returns error code 131047 (session expired / outside 24h window), fallback to utility template
    if (!sendRes.success && (sendRes.error?.error?.code === 131047 || sendRes.error?.error?.code === 131026)) {
      console.warn(`[WhatsAppService] 24-hr session closed for ${rawPhone}. Falling back to approved 'sbs_order_update' template.`);
      return await sendOrderConfirmationWhatsApp(order);
    }

    // Sync sent status message to WACRM inbox
    syncOutboundOrderMessage({
      recipientPhone: rawPhone,
      customerName,
      messageText: text,
      templateName: null,
      messageId: sendRes.messageId || null,
    }).catch(err => {
      console.warn('[WhatsAppService] WACRM sync warning:', err.message);
    });

    return sendRes;
  } catch (err) {
    console.error('[WhatsAppService] sendOrderStatusNotification error:', err.message);
    return { success: false, error: err.message };
  }
}

module.exports = {
  normalizePhoneForWhatsApp,
  sendWhatsAppTemplate,
  sendWhatsAppNotification,
  sendOrderConfirmationWhatsApp,
  sendOrderStatusNotification,
};

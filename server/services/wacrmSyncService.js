const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
require('dotenv').config();

const WACRM_SUPABASE_URL = process.env.WACRM_SUPABASE_URL || 'https://nksbbhqpznxtrouylwhv.supabase.co';
const WACRM_SUPABASE_KEY = process.env.WACRM_SUPABASE_SERVICE_KEY || 
  process.env.WACRM_SUPABASE_KEY || 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5rc2JiaHFwem54dHJvdXlsd2h2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NzczODUxOCwiZXhwIjoyMTAzMzE0NTE4fQ.2ztW0Sv39k6a0BXMgsfPuGfqBvK52f3d7ujTWQfO2ZA';

const WACRM_ACCOUNT_ID = process.env.WACRM_ACCOUNT_ID || '2b91abf7-d9e2-40c2-93d5-75f53d635a8d';
const WACRM_USER_ID = process.env.WACRM_USER_ID || 'e0696c85-80d4-4ee8-9993-97ec7b9197da';

let wacrmClient = null;
if (WACRM_SUPABASE_URL && WACRM_SUPABASE_KEY) {
  try {
    wacrmClient = createClient(WACRM_SUPABASE_URL, WACRM_SUPABASE_KEY, {
      auth: { persistSession: false }
    });
  } catch (err) {
    console.warn('[WACRMSyncService] Initialization warning:', err.message);
  }
}

/**
 * Extracts 10-digit normalized phone for matching.
 */
function normalizeDigits(phone) {
  if (!phone) return null;
  const digits = String(phone).replace(/\D/g, '');
  return digits.length >= 10 ? digits.slice(-10) : digits;
}

/**
 * Syncs an outbound WhatsApp message into WACRM inbox:
 * 1. Finds or creates contact
 * 2. Finds or creates conversation
 * 3. Appends message with direction 'outbound'
 */
async function syncOutboundOrderMessage({ recipientPhone, customerName, messageText, templateName, messageId }) {
  if (!wacrmClient) {
    return { success: false, reason: 'WACRM client not configured' };
  }

  try {
    const rawDigits = String(recipientPhone).replace(/\D/g, '');
    const phoneNormalized = rawDigits.length === 10 ? `91${rawDigits}` : rawDigits;
    const phoneSuffix = normalizeDigits(recipientPhone);

    if (!phoneSuffix) {
      return { success: false, reason: 'invalid_phone' };
    }

    // 1. Locate existing contact by phone suffix or phone_normalized
    let { data: contacts, error: contactSearchErr } = await wacrmClient
      .from('contacts')
      .select('id, name, phone, user_id')
      .eq('account_id', WACRM_ACCOUNT_ID)
      .or(`phone_normalized.eq.${phoneNormalized},phone.ilike.%${phoneSuffix}%`);

    let contact = contacts && contacts.length > 0 ? contacts[0] : null;

    if (!contact) {
      // Create new contact in WACRM
      const newContactPayload = {
        account_id: WACRM_ACCOUNT_ID,
        user_id: WACRM_USER_ID,
        phone: `+${phoneNormalized}`,
        phone_normalized: phoneNormalized,
        name: customerName || 'Valued Customer',
        first_source: 'Website Order',
        latest_source: 'Website Order',
        lifecycle_stage: 'Customer',
        marketing_consent_status: 'opted_in',
        marketing_opt_out: false
      };

      const { data: createdContact, error: createContactErr } = await wacrmClient
        .from('contacts')
        .insert(newContactPayload)
        .select()
        .single();

      if (!createContactErr && createdContact) {
        contact = createdContact;
      }
    }

    if (!contact) {
      console.warn('[WACRMSyncService] Could not resolve contact for phone', recipientPhone);
      return { success: false, reason: 'Contact resolution failed' };
    }

    // 2. Locate or create active conversation
    let { data: convs } = await wacrmClient
      .from('conversations')
      .select('id')
      .eq('account_id', WACRM_ACCOUNT_ID)
      .eq('contact_id', contact.id)
      .order('updated_at', { ascending: false })
      .limit(1);

    let conversation = convs && convs.length > 0 ? convs[0] : null;

    if (!conversation) {
      const { data: newConv, error: newConvErr } = await wacrmClient
        .from('conversations')
        .insert({
          account_id: WACRM_ACCOUNT_ID,
          user_id: contact.user_id || WACRM_USER_ID,
          contact_id: contact.id,
          status: 'open',
          unread_count: 0,
          last_message_text: messageText,
          last_message_at: new Date().toISOString()
        })
        .select()
        .single();

      if (!newConvErr && newConv) {
        conversation = newConv;
      }
    } else {
      // Update last message in existing conversation
      await wacrmClient
        .from('conversations')
        .update({
          last_message_text: messageText,
          last_message_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', conversation.id);
    }

    if (!conversation) {
      console.warn('[WACRMSyncService] Could not resolve conversation for contact', contact.id);
      return { success: false, reason: 'Conversation resolution failed' };
    }

    // 3. Insert outbound message
    const messagePayload = {
      conversation_id: conversation.id,
      sender_type: 'bot',
      content_type: templateName ? 'template' : 'text',
      content_text: messageText,
      template_name: templateName || null,
      message_id: messageId || `sbs_out_${Date.now()}`,
      status: 'sent',
      ai_generated: false
    };

    const { error: msgErr } = await wacrmClient
      .from('messages')
      .insert(messagePayload);

    if (msgErr) {
      console.warn('[WACRMSyncService] Message insertion note:', msgErr.message);
    }

    console.log(`[WACRMSyncService] Successfully synced outbound order message to WACRM inbox for ${contact.name} (${phoneNormalized})`);
    return { success: true, conversationId: conversation.id, contactId: contact.id };
  } catch (err) {
    console.error('[WACRMSyncService] Exception syncing to WACRM:', err.message);
    return { success: false, error: err.message };
  }
}

module.exports = {
  syncOutboundOrderMessage,
  WACRM_ACCOUNT_ID,
};

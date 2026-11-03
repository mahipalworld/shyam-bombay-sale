const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
require('dotenv').config();

const { 
  normalizePhoneForWhatsApp, 
  sendWhatsAppTemplate, 
  sendOrderConfirmationWhatsApp, 
  sendOrderStatusNotification 
} = require('../services/whatsappService');

const emailService = require('../services/emailService');
const { syncOutboundOrderMessage } = require('../services/wacrmSyncService');

async function runTests() {
  console.log('====================================================');
  console.log('🧪 Starting SBS Order Notification System Local Test');
  console.log('====================================================\n');

  // Test 1: Phone Normalization
  console.log('--- Test 1: Phone Number Normalization ---');
  const testPhones = [
    '9829877766',
    '+91 98298 77766',
    '09829877766',
    '919829877766',
    '98298-77766'
  ];
  for (const p of testPhones) {
    const normalized = normalizePhoneForWhatsApp(p);
    console.log(`Input: "${p}" => E.164: "${normalized}" (Valid: ${normalized === '919829877766'})`);
  }

  // Test 2: Mock Order Definition
  const mockOrder = {
    id: 'ord_test_' + Date.now(),
    order_number: 'SBS-9999',
    total: 849,
    subtotal: 799,
    delivery_charge: 0,
    cod_charge: 15,
    discount: 50,
    payment_method: 'Cash on Delivery',
    shipping_address: {
      name: 'Mahipal Singh',
      phone: '9876543210',
      email: 'shyambombaysale@gmail.com',
      street: 'Shop 1, Vrundvilla, Subhanpura',
      city: 'Vadodara',
      state: 'Gujarat',
      pincode: '390023'
    },
    items: [
      {
        name: 'Kleen FRESH tiles cleaner',
        price: 30,
        quantity: 2,
        image: 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=100'
      },
      {
        name: 'Airtight Storage Container',
        price: 789,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=100'
      }
    ]
  };

  // Test 3: WhatsApp Order Confirmation Template Formatting
  console.log('\n--- Test 3: WhatsApp Template Dispatch Simulation ---');
  console.log('Calling sendOrderConfirmationWhatsApp for Order #SBS-9999...');
  try {
    const waResult = await sendOrderConfirmationWhatsApp(mockOrder);
    console.log('WhatsApp Result:', JSON.stringify(waResult, null, 2));
  } catch (waErr) {
    console.error('WhatsApp Error:', waErr.message);
  }

  // Test 4: WhatsApp Status Update with Tracking Details
  console.log('\n--- Test 4: WhatsApp Status Update (Shipped) Simulation ---');
  try {
    const statusResult = await sendOrderStatusNotification(mockOrder, 'Shipped', {
      trackingNumber: 'DEL-SBS-848392',
      courier: 'Delhivery Express',
      trackingUrl: 'https://www.delhivery.com/track/package/DEL-SBS-848392'
    });
    console.log('Status Result:', JSON.stringify(statusResult, null, 2));
  } catch (statusErr) {
    console.error('Status Error:', statusErr.message);
  }

  // Test 5: Email Service Output Verification
  console.log('\n--- Test 5: Email Service Dispatch Simulation ---');
  console.log('Testing sendOrderConfirmation...');
  try {
    const emailRes = await emailService.sendOrderConfirmation(mockOrder);
    console.log('Email Confirmation Result:', JSON.stringify(emailRes, null, 2));
  } catch (emErr) {
    console.error('Email Error:', emErr.message);
  }

  console.log('Testing sendOrderStatusUpdate...');
  try {
    const statusEmailRes = await emailService.sendOrderStatusUpdate(mockOrder, 'Shipped', {
      trackingNumber: 'DEL-SBS-848392',
      courier: 'Delhivery Express',
      trackingUrl: 'https://www.delhivery.com/track/package/DEL-SBS-848392'
    });
    console.log('Status Email Result:', JSON.stringify(statusEmailRes, null, 2));
  } catch (emStatusErr) {
    console.error('Status Email Error:', emStatusErr.message);
  }

  // Test 6: WACRM Inbox Sync
  console.log('\n--- Test 6: WACRM Inbox Direct Sync Simulation ---');
  try {
    const syncRes = await syncOutboundOrderMessage({
      recipientPhone: mockOrder.shipping_address.phone,
      customerName: mockOrder.shipping_address.name,
      messageText: `[Test] Hello ${mockOrder.shipping_address.name}, your order #${mockOrder.order_number} has been placed.`,
      templateName: 'sbs_order_update',
      messageId: `test_msg_${Date.now()}`
    });
    console.log('WACRM Sync Result:', JSON.stringify(syncRes, null, 2));
  } catch (syncErr) {
    console.error('WACRM Sync Error:', syncErr.message);
  }

  console.log('\n====================================================');
  console.log('✅ Local Test Suite Run Complete');
  console.log('====================================================');
}

runTests().catch(console.error);

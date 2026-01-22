/**
 * Test Razorpay Connection
 * Run this to verify Razorpay credentials are working
 */

require('dotenv').config();
const Razorpay = require('razorpay');

console.log('🧪 Testing Razorpay Connection...\n');

// Check if credentials are loaded
console.log('📋 Environment Check:');
console.log('RAZORPAY_KEY_ID:', process.env.RAZORPAY_KEY_ID ? '✅ SET' : '❌ NOT SET');
console.log('RAZORPAY_KEY_SECRET:', process.env.RAZORPAY_KEY_SECRET ? '✅ SET' : '❌ NOT SET');

if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  console.error('\n❌ ERROR: Razorpay credentials not set in .env file');
  console.error('Add these to .env:');
  console.error('RAZORPAY_KEY_ID=rzp_test_xxxxx');
  console.error('RAZORPAY_KEY_SECRET=your_secret_key');
  process.exit(1);
}

// Remove quotes if present
const keyId = process.env.RAZORPAY_KEY_ID.replace(/"/g, '');
const keySecret = process.env.RAZORPAY_KEY_SECRET.replace(/"/g, '');

console.log('\n📋 Cleaned Credentials:');
console.log('KEY_ID length:', keyId.length, '(should be ~20 chars)');
console.log('KEY_SECRET length:', keySecret.length, '(should be ~20 chars)');
console.log('KEY_ID starts with:', keyId.substring(0, 8));

// Initialize Razorpay
console.log('\n💳 Initializing Razorpay...');
try {
  const razorpay = new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
  console.log('✅ Razorpay instance created successfully');
  
  // Test by creating a dummy order
  console.log('\n💰 Testing order creation...');
  
  razorpay.orders.create({
    amount: 10000, // ₹100 in paise
    currency: 'INR',
    receipt: 'test_' + Date.now(),
    notes: {
      test: true
    }
  })
  .then(order => {
    console.log('✅ SUCCESS! Order created successfully');
    console.log('Order ID:', order.id);
    console.log('Amount:', order.amount);
    console.log('Currency:', order.currency);
    console.log('\n✅ Razorpay connection is working correctly!');
  })
  .catch(error => {
    console.error('\n❌ ERROR creating order:');
    console.error('Status:', error.statusCode);
    console.error('Error:', error.error);
    console.error('Description:', error.error?.description);
    
    if (error.statusCode === 401) {
      console.error('\n🔐 Authentication failed!');
      console.error('Check if your API keys are correct');
      console.error('Make sure you are using TEST keys (start with rzp_test_)');
    }
  });
  
} catch (error) {
  console.error('\n❌ ERROR initializing Razorpay:');
  console.error(error.message);
  console.error('\nFull error:', error);
}

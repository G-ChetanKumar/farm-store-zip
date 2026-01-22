/**
 * Manual Subscription Creation
 * Use this when payment was successful but subscription wasn't auto-created
 */

require('dotenv').config();
const mongoose = require('mongoose');
const MembershipSubscription = require('./models/MembershipSubscriptionModel');
const MembershipPlan = require('./models/MembershipPlanModel');
const User = require('./models/UserModel');
const config = require('./config/db');

const createSubscription = async () => {
  console.log('🔧 Manual Subscription Creation Tool\n');
  console.log('=' .repeat(60));
  
  try {
    await mongoose.connect(config.dbURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to database\n');
    
    // Find user by mobile from payment screenshot
    const userMobile = "+91 90108 12322"; // From the payment screenshot
    console.log(`🔍 Looking for user with mobile: ${userMobile}...`);
    
    let user = await User.findOne({ mobile: userMobile });
    
    if (!user) {
      // Try without spaces
      user = await User.findOne({ mobile: "+919010812322" });
    }
    
    if (!user) {
      // Try with different format
      user = await User.findOne({ mobile: "9010812322" });
    }
    
    if (!user) {
      console.log('\n❌ User not found with mobile:', userMobile);
      console.log('\n📋 Available users:');
      const users = await User.find({ user_type: "Farmer" }).limit(10);
      users.forEach(u => {
        console.log(`   - ${u.name} (${u.mobile || u.email})`);
        console.log(`     ID: ${u._id}`);
      });
      console.log('\n💡 Update the mobile number in this script or provide user ID');
      return;
    }
    
    console.log('✅ Found user:', user.name);
    console.log('   Email:', user.email);
    console.log('   Mobile:', user.mobile);
    console.log('   User ID:', user._id);
    console.log('');
    
    // Check for existing subscription
    const existing = await MembershipSubscription.findOne({
      user_id: user._id,
      status: 'active',
      expires_at: { $gte: new Date() }
    });
    
    if (existing) {
      console.log('✅ User ALREADY HAS active subscription!');
      console.log(`   Subscription ID: ${existing._id}`);
      console.log(`   Status: ${existing.status}`);
      console.log(`   Expires: ${existing.expires_at}`);
      console.log(`   Purchases Left: ${existing.purchases_left}`);
      console.log('\n💡 No need to create new subscription.');
      return;
    }
    
    console.log('ℹ️  No active subscription found. Creating new one...\n');
    
    // Find the plan (₹59 total = ₹50 base + ₹9 GST)
    const plan = await MembershipPlan.findOne({ 
      is_active: true 
    }).sort({ price: 1 }); // Get cheapest plan
    
    if (!plan) {
      console.log('❌ No active plans found');
      console.log('\nAvailable plans:');
      const allPlans = await MembershipPlan.find();
      allPlans.forEach(p => {
        console.log(`   - ${p.name}: ₹${p.price} (Active: ${p.is_active})`);
      });
      return;
    }
    
    console.log('✅ Using plan:', plan.name);
    console.log(`   Price: ₹${plan.price}`);
    console.log(`   Validity: ${plan.validity_days} days`);
    console.log(`   Purchases: ${plan.validity_purchases}`);
    console.log('');
    
    // Calculate expiry
    const expiresAt = new Date(Date.now() + plan.validity_days * 24 * 60 * 60 * 1000);
    
    // Create subscription
    const subscription = await MembershipSubscription.create({
      user_id: user._id,
      plan_id: plan._id,
      purchases_left: plan.validity_purchases,
      expires_at: expiresAt,
      status: "active",
      notes: {
        razorpay_payment_id: "pay_35gM0Yw7m7nTo", // From screenshot UPI ref
        manual_creation: true,
        created_at: new Date(),
        created_reason: "Payment successful via Razorpay but subscription not auto-created",
        payment_amount: 59,
        payment_mode: "UPI"
      }
    });
    
    console.log('=' .repeat(60));
    console.log('\n✅ ✅ ✅ SUBSCRIPTION CREATED SUCCESSFULLY! ✅ ✅ ✅\n');
    console.log('📊 Details:');
    console.log(`   Subscription ID: ${subscription._id}`);
    console.log(`   User: ${user.name} (${user._id})`);
    console.log(`   Plan: ${plan.name}`);
    console.log(`   Status: ${subscription.status}`);
    console.log(`   Created: ${subscription.createdAt}`);
    console.log(`   Expires: ${subscription.expires_at}`);
    console.log(`   Purchases Left: ${subscription.purchases_left}`);
    console.log('');
    console.log('=' .repeat(60));
    console.log('\n🎉 User can now see membership in "My Membership" page!');
    console.log('🔄 Refresh the store page to see the active membership.\n');
    
  } catch (error) {
    console.error('\n❌ Error creating subscription:');
    console.error(error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from database\n');
  }
};

console.log('Starting in 2 seconds...');
console.log('Press Ctrl+C to cancel\n');

setTimeout(() => {
  createSubscription();
}, 2000);

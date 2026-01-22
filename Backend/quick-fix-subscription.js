/**
 * Quick Fix: Create subscription for successful payment
 * Payment ID from network tab: Should be in recent Razorpay payments
 */

require('dotenv').config();
const mongoose = require('mongoose');
const MembershipSubscription = require('./models/MembershipSubscriptionModel');
const MembershipPlan = require('./models/MembershipPlanModel');
const User = require('./models/UserModel');
const config = require('./config/db');

async function quickFix() {
  try {
    console.log('🔧 Connecting to database...\n');
    
    await mongoose.connect(config.dbURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('✅ Connected!\n');
    
    // Find user by mobile
    const userMobile = "+91 90108 12322"; // From screenshot
    
    console.log(`Looking for user: ${userMobile}`);
    
    let user = await User.findOne({ 
      $or: [
        { mobile: userMobile },
        { mobile: "+919010812322" },
        { mobile: "9010812322" }
      ]
    });
    
    if (!user) {
      console.log('❌ User not found. Showing all Farmer users:\n');
      const farmers = await User.find({ user_type: "Farmer" }).limit(5);
      farmers.forEach(f => {
        console.log(`  - ${f.name} (${f.mobile}) - ID: ${f._id}`);
      });
      console.log('\n💡 Update mobile in script if needed');
      await mongoose.disconnect();
      return;
    }
    
    console.log(`✅ Found: ${user.name} (${user._id})\n`);
    
    // Check existing subscription
    const existing = await MembershipSubscription.findOne({
      user_id: user._id,
      status: 'active',
      expires_at: { $gte: new Date() }
    });
    
    if (existing) {
      console.log('✅ User ALREADY has active subscription!');
      console.log(`   ID: ${existing._id}`);
      console.log(`   Expires: ${existing.expires_at}`);
      console.log(`   Purchases Left: ${existing.purchases_left}\n`);
      console.log('✨ Subscription exists. Frontend should show it.');
      console.log('   Try: Logout → Login → Check "My Membership"\n');
      await mongoose.disconnect();
      return;
    }
    
    console.log('⚠️  No active subscription found. Creating...\n');
    
    // Get the cheapest plan (₹59 payment suggests basic plan)
    const plan = await MembershipPlan.findOne({ is_active: true }).sort({ price: 1 });
    
    if (!plan) {
      console.log('❌ No plans found!');
      await mongoose.disconnect();
      return;
    }
    
    console.log(`Using plan: ${plan.name} (₹${plan.price})\n`);
    
    // Create subscription
    const expiresAt = new Date(Date.now() + plan.validity_days * 24 * 60 * 60 * 1000);
    
    const subscription = await MembershipSubscription.create({
      user_id: user._id,
      plan_id: plan._id,
      purchases_left: plan.validity_purchases,
      expires_at: expiresAt,
      status: "active",
      notes: {
        payment_amount: 59,
        manual_creation: true,
        created_reason: "Payment successful but subscription not auto-created",
        created_at: new Date()
      }
    });
    
    console.log('✅✅✅ SUCCESS! ✅✅✅\n');
    console.log('Subscription Created:');
    console.log(`  ID: ${subscription._id}`);
    console.log(`  User: ${user.name}`);
    console.log(`  Plan: ${plan.name}`);
    console.log(`  Expires: ${expiresAt.toLocaleDateString()}`);
    console.log(`  Purchases: ${plan.validity_purchases}\n`);
    console.log('🎉 Now refresh browser and check "My Membership"!\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected\n');
  }
}

quickFix();

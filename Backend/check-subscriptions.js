/**
 * Check Membership Subscriptions in Database
 */

require('dotenv').config();
const mongoose = require('mongoose');
const MembershipSubscription = require('./models/MembershipSubscriptionModel');
const User = require('./models/UserModel');
const config = require('./config/db');

const checkSubscriptions = async () => {
  try {
    await mongoose.connect(config.dbURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to database\n');
    
    // Get all subscriptions
    const allSubs = await MembershipSubscription.find()
      .populate('plan_id')
      .populate('user_id')
      .sort({ createdAt: -1 })
      .limit(10);
    
    console.log(`📊 Total subscriptions in DB: ${await MembershipSubscription.countDocuments()}\n`);
    
    if (allSubs.length === 0) {
      console.log('❌ NO SUBSCRIPTIONS FOUND!\n');
      console.log('This explains why "My Membership" shows nothing.\n');
      
      // Check if there are any users
      const userCount = await User.countDocuments();
      console.log(`👥 Total users: ${userCount}\n`);
      
      return;
    }
    
    console.log('📋 Recent Subscriptions:\n');
    console.log('='.repeat(80));
    
    allSubs.forEach((sub, index) => {
      const userName = sub.user_id?.name || 'Unknown User';
      const planName = sub.plan_id?.name || 'Unknown Plan';
      const userId = sub.user_id?._id || sub.user_id;
      
      console.log(`\n${index + 1}. Subscription ID: ${sub._id}`);
      console.log(`   User: ${userName} (${userId})`);
      console.log(`   Plan: ${planName}`);
      console.log(`   Status: ${sub.status}`);
      console.log(`   Created: ${sub.createdAt}`);
      console.log(`   Expires: ${sub.expires_at}`);
      console.log(`   Purchases Left: ${sub.purchases_left}`);
      
      if (sub.notes) {
        console.log(`   Payment Info:`);
        if (sub.notes.razorpay_payment_id) {
          console.log(`     - Payment ID: ${sub.notes.razorpay_payment_id}`);
        }
        if (sub.notes.razorpay_order_id) {
          console.log(`     - Order ID: ${sub.notes.razorpay_order_id}`);
        }
      }
    });
    
    console.log('\n' + '='.repeat(80));
    
    // Check for active subscriptions
    const activeSubs = await MembershipSubscription.find({
      status: 'active',
      expires_at: { $gte: new Date() }
    });
    
    console.log(`\n✅ Active non-expired subscriptions: ${activeSubs.length}`);
    
    // Check for expired
    const expiredSubs = await MembershipSubscription.find({
      status: 'active',
      expires_at: { $lt: new Date() }
    });
    
    console.log(`⚠️  Expired but still active status: ${expiredSubs.length}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from database\n');
  }
};

checkSubscriptions();

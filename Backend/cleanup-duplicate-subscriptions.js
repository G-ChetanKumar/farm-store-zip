/**
 * Cleanup Duplicate Membership Subscriptions
 * 
 * This script finds and removes duplicate active subscriptions for the same user.
 * It keeps the oldest subscription and removes newer duplicates.
 */

require('dotenv').config();
const mongoose = require('mongoose');
const MembershipSubscription = require('./models/MembershipSubscriptionModel');
const config = require('./config/db');

const cleanupDuplicates = async () => {
  console.log('🧹 Membership Subscription Cleanup Tool\n');
  console.log('=' .repeat(60));
  
  try {
    // Connect to database
    await mongoose.connect(config.dbURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to database\n');
    
    // Find all active subscriptions
    const allSubs = await MembershipSubscription.find({ 
      status: 'active',
      expires_at: { $gte: new Date() }
    }).sort({ createdAt: 1 }).populate('plan_id user_id');
    
    console.log(`📊 Total active non-expired subscriptions: ${allSubs.length}\n`);
    
    if (allSubs.length === 0) {
      console.log('ℹ️  No active subscriptions found.');
      return;
    }
    
    // Group by user_id
    const byUser = {};
    allSubs.forEach(sub => {
      const userId = sub.user_id?._id?.toString() || 'unknown';
      if (!byUser[userId]) {
        byUser[userId] = [];
      }
      byUser[userId].push(sub);
    });
    
    console.log(`👥 Total users with active subscriptions: ${Object.keys(byUser).length}\n`);
    
    // Find and handle duplicates
    let duplicateCount = 0;
    let usersWithDuplicates = 0;
    
    for (const userId in byUser) {
      const userSubs = byUser[userId];
      
      if (userSubs.length > 1) {
        usersWithDuplicates++;
        const userName = userSubs[0].user_id?.name || 'Unknown User';
        
        console.log('=' .repeat(60));
        console.log(`⚠️  User: ${userName} (${userId})`);
        console.log(`   Has ${userSubs.length} active subscriptions (DUPLICATE!)\n`);
        
        // Display all subscriptions
        userSubs.forEach((sub, index) => {
          const planName = sub.plan_id?.name || 'Unknown Plan';
          console.log(`   ${index + 1}. Subscription ID: ${sub._id}`);
          console.log(`      Plan: ${planName}`);
          console.log(`      Created: ${sub.createdAt}`);
          console.log(`      Expires: ${sub.expires_at}`);
          console.log(`      Purchases Left: ${sub.purchases_left}`);
          if (sub.notes?.razorpay_payment_id) {
            console.log(`      Payment ID: ${sub.notes.razorpay_payment_id}`);
          }
          console.log('');
        });
        
        // Keep the oldest one (first created)
        const toKeep = userSubs[0];
        const toRemove = userSubs.slice(1);
        
        console.log(`   ✅ KEEPING: ${toKeep._id}`);
        console.log(`      (Created: ${toKeep.createdAt})\n`);
        
        // Remove duplicates
        for (const dup of toRemove) {
          console.log(`   ❌ REMOVING: ${dup._id}`);
          console.log(`      (Created: ${dup.createdAt})`);
          
          // Option 1: Delete completely (recommended for duplicates)
          await MembershipSubscription.findByIdAndDelete(dup._id);
          
          // Option 2: Mark as cancelled (safer, keeps history)
          // Uncomment below if you prefer to keep records
          /*
          await MembershipSubscription.findByIdAndUpdate(dup._id, {
            status: 'cancelled',
            cancelled_at: new Date(),
            cancelled_reason: 'Duplicate subscription removed by cleanup script'
          });
          */
          
          duplicateCount++;
        }
        
        console.log('');
      }
    }
    
    console.log('=' .repeat(60));
    console.log('\n✅ Cleanup complete!\n');
    console.log(`📊 Summary:`);
    console.log(`   - Users with duplicates found: ${usersWithDuplicates}`);
    console.log(`   - Duplicate subscriptions removed: ${duplicateCount}`);
    
    // Show final count
    const finalCount = await MembershipSubscription.countDocuments({ 
      status: 'active',
      expires_at: { $gte: new Date() }
    });
    console.log(`   - Active subscriptions remaining: ${finalCount}\n`);
    
    // Verify no duplicates remain
    const verifyDuplicates = await MembershipSubscription.aggregate([
      { 
        $match: { 
          status: "active",
          expires_at: { $gte: new Date() }
        }
      },
      { 
        $group: { 
          _id: "$user_id",
          count: { $sum: 1 }
        }
      },
      { 
        $match: { count: { $gt: 1 } }
      }
    ]);
    
    if (verifyDuplicates.length === 0) {
      console.log('✅ Verification: No duplicates remaining!\n');
    } else {
      console.log(`⚠️  Warning: ${verifyDuplicates.length} users still have duplicates`);
      console.log('   Run script again or check manually.\n');
    }
    
  } catch (error) {
    console.error('\n❌ Error during cleanup:');
    console.error(error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from database\n');
  }
};

// Run the cleanup
console.log('Starting cleanup in 3 seconds...');
console.log('Press Ctrl+C to cancel\n');

setTimeout(() => {
  cleanupDuplicates();
}, 3000);

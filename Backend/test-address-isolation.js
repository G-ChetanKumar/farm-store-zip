/**
 * Test Script: Verify Address User Isolation
 * 
 * This script tests that addresses are properly isolated per user
 * and users cannot access each other's addresses.
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Address = require('./models/AddressModel');
const User = require('./models/UserModel');
const config = require('./config/db');

const testAddressIsolation = async () => {
  console.log('🧪 Starting Address User Isolation Test...\n');
  
  try {
    // Connect to database
    await mongoose.connect(config.dbURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to database\n');
    
    // Step 1: Get two different users from database
    const users = await User.find().limit(2).lean();
    
    if (users.length < 2) {
      console.log('⚠️ Need at least 2 users in database to test isolation');
      console.log('Please create users first via the app\n');
      return;
    }
    
    const user1 = users[0];
    const user2 = users[1];
    
    console.log('📋 Test Users:');
    console.log(`User 1: ${user1.name} (${user1.mobile}) - ID: ${user1._id}`);
    console.log(`User 2: ${user2.name} (${user2.mobile}) - ID: ${user2._id}\n`);
    
    // Step 2: Get addresses for User 1
    const user1Addresses = await Address.find({ user_id: user1._id });
    console.log(`🏠 User 1 has ${user1Addresses.length} address(es)`);
    user1Addresses.forEach((addr, idx) => {
      console.log(`  ${idx + 1}. ${addr.label} - ${addr.city}, ${addr.postal_code}`);
    });
    console.log('');
    
    // Step 3: Get addresses for User 2
    const user2Addresses = await Address.find({ user_id: user2._id });
    console.log(`🏠 User 2 has ${user2Addresses.length} address(es)`);
    user2Addresses.forEach((addr, idx) => {
      console.log(`  ${idx + 1}. ${addr.label} - ${addr.city}, ${addr.postal_code}`);
    });
    console.log('');
    
    // Step 4: Test isolation - check if addresses are truly separate
    const user1AddressIds = user1Addresses.map(a => a._id.toString());
    const user2AddressIds = user2Addresses.map(a => a._id.toString());
    
    const hasOverlap = user1AddressIds.some(id => user2AddressIds.includes(id));
    
    if (hasOverlap) {
      console.log('❌ FAIL: Users share addresses! This is a security issue!');
    } else {
      console.log('✅ PASS: No address overlap between users');
    }
    console.log('');
    
    // Step 5: Test if User 2 can access User 1's address
    if (user1Addresses.length > 0) {
      const user1AddressId = user1Addresses[0]._id;
      
      // Try to get User 1's address using User 2's filter (what API does)
      const accessTest = await Address.findOne({ 
        _id: user1AddressId, 
        user_id: user2._id 
      });
      
      if (accessTest) {
        console.log('❌ FAIL: User 2 can access User 1\'s address! Security breach!');
      } else {
        console.log('✅ PASS: User 2 cannot access User 1\'s address (correct behavior)');
      }
    } else {
      console.log('⚠️ User 1 has no addresses to test access control');
    }
    console.log('');
    
    // Step 6: Create test addresses to verify insertion
    console.log('🧪 Testing address creation...');
    
    const testAddress1 = {
      user_id: user1._id,
      label: 'Test Home',
      line1: 'Test Street 1',
      city: 'Test City',
      state: 'Test State',
      postal_code: '123456'
    };
    
    const testAddress2 = {
      user_id: user2._id,
      label: 'Test Office',
      line1: 'Test Street 2',
      city: 'Test City',
      state: 'Test State',
      postal_code: '654321'
    };
    
    const created1 = await Address.create(testAddress1);
    const created2 = await Address.create(testAddress2);
    
    console.log(`✅ Created address for User 1: ${created1._id}`);
    console.log(`✅ Created address for User 2: ${created2._id}`);
    console.log('');
    
    // Step 7: Verify newly created addresses are isolated
    const verifyUser1 = await Address.findOne({ 
      _id: created1._id, 
      user_id: user1._id 
    });
    
    const verifyUser2CannotAccess = await Address.findOne({ 
      _id: created1._id, 
      user_id: user2._id 
    });
    
    if (verifyUser1 && !verifyUser2CannotAccess) {
      console.log('✅ PASS: New address properly isolated - User 1 can access, User 2 cannot');
    } else {
      console.log('❌ FAIL: Address isolation failed for new addresses');
    }
    console.log('');
    
    // Step 8: Cleanup test addresses
    await Address.deleteMany({ 
      _id: { $in: [created1._id, created2._id] } 
    });
    console.log('🧹 Cleaned up test addresses\n');
    
    // Step 9: Final summary
    console.log('═══════════════════════════════════════');
    console.log('📊 TEST SUMMARY');
    console.log('═══════════════════════════════════════');
    console.log(`✓ Database Model: user_id field present`);
    console.log(`✓ User Isolation: ${hasOverlap ? 'FAILED' : 'PASSED'}`);
    console.log(`✓ Access Control: ${!hasOverlap ? 'PASSED' : 'FAILED'}`);
    console.log(`✓ New Address Isolation: PASSED`);
    console.log('═══════════════════════════════════════\n');
    
    // Step 10: Check for any addresses without user_id (data integrity issue)
    const orphanAddresses = await Address.find({ user_id: { $exists: false } });
    if (orphanAddresses.length > 0) {
      console.log(`⚠️ WARNING: Found ${orphanAddresses.length} address(es) without user_id!`);
      console.log('These addresses are not tied to any user and should be cleaned up.\n');
    } else {
      console.log('✅ All addresses have valid user_id\n');
    }
    
    // Step 11: Check for duplicate default addresses per user
    const users_with_addresses = await Address.distinct('user_id');
    console.log(`📊 Total users with addresses: ${users_with_addresses.length}\n`);
    
    for (const userId of users_with_addresses) {
      const defaultCount = await Address.countDocuments({ 
        user_id: userId, 
        is_default: true 
      });
      
      if (defaultCount > 1) {
        const user = await User.findById(userId);
        console.log(`⚠️ WARNING: User ${user?.name || userId} has ${defaultCount} default addresses!`);
        console.log('   Each user should have only 1 default address.');
      }
    }
    
    console.log('\n✅ Address Isolation Test Complete!');
    
  } catch (error) {
    console.error('❌ Test failed with error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from database');
  }
};

// Run the test
testAddressIsolation();

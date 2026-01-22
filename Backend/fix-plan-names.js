/**
 * Fix Plan Names - Capitalize properly
 */

require('dotenv').config();
const mongoose = require('mongoose');
const MembershipPlan = require('./models/MembershipPlanModel');
const config = require('./config/db');

async function fixPlanNames() {
  try {
    await mongoose.connect(config.dbURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to database\n');
    
    // Get all plans
    const plans = await MembershipPlan.find();
    
    console.log(`📊 Found ${plans.length} plans\n`);
    
    for (const plan of plans) {
      const oldName = plan.name;
      let newName = oldName;
      
      // Capitalize plan names properly
      if (oldName === 'silver') {
        newName = 'Silver Plan';
      } else if (oldName === 'gold') {
        newName = 'Gold Plan';
      } else if (oldName === 'premium') {
        newName = 'Premium Plan';
      } else if (oldName === 'basic') {
        newName = 'Basic Plan';
      } else if (!oldName.includes('Plan') && oldName.toLowerCase() === oldName) {
        // Capitalize first letter if it's all lowercase and doesn't have "Plan"
        newName = oldName.charAt(0).toUpperCase() + oldName.slice(1) + ' Plan';
      }
      
      if (oldName !== newName) {
        plan.name = newName;
        await plan.save();
        console.log(`✅ Updated: "${oldName}" → "${newName}"`);
      } else {
        console.log(`ℹ️  No change: "${oldName}"`);
      }
    }
    
    console.log('\n✅ All plan names fixed!');
    
    // Show final list
    const updatedPlans = await MembershipPlan.find();
    console.log('\n📋 Current Plans:');
    updatedPlans.forEach(p => {
      console.log(`   - ${p.name} (₹${p.price})`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected\n');
  }
}

fixPlanNames();

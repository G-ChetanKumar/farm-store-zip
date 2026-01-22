require('dotenv').config();
const mongoose = require('mongoose');
const MembershipPlan = require('./models/MembershipPlanModel');
const config = require('./config/db');

async function fix() {
  try {
    await mongoose.connect(config.dbURI);
    console.log('Connected\n');
    
    const plan = await MembershipPlan.findOne({ name: 'Gold' });
    if (plan) {
      plan.name = 'Gold Plan';
      await plan.save();
      console.log('✅ Updated "Gold" to "Gold Plan"\n');
    }
    
    const plans = await MembershipPlan.find();
    console.log('All plans:');
    plans.forEach(p => console.log(`  - ${p.name} (₹${p.price})`));
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

fix();

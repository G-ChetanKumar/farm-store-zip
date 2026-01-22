require('dotenv').config();
const mongoose = require("mongoose");
const Coupon = require("./models/CouponModel");

const MONGODB_URL = process.env.DB_URI || process.env.MONGODB_URL || "mongodb://localhost:27017/farm-ecommerce";

async function fixCouponMinOrder() {
  try {
    console.log("🔧 Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URL);
    console.log("✅ Connected to MongoDB\n");

    // Find ALL coupons with unrealistic min_order (> ₹50,000)
    const UNREALISTIC_THRESHOLD = 50000;
    const REASONABLE_MIN_ORDER = 99; // Set to ₹99 for all coupons
    
    const coupons = await Coupon.find({
      min_order: { $gt: UNREALISTIC_THRESHOLD }
    });
    
    if (coupons.length === 0) {
      console.log("✅ No coupons found with unrealistic minimum orders");
      console.log(`ℹ️  All coupons have min_order <= ₹${UNREALISTIC_THRESHOLD}`);
      
      // Show all coupons for reference
      const allCoupons = await Coupon.find();
      console.log(`\n📋 Total coupons in database: ${allCoupons.length}\n`);
      
      allCoupons.forEach((c, index) => {
        console.log(`${index + 1}. ${c.code} - Min Order: ₹${c.min_order}, ${c.discount_type === 'percent' ? c.value + '% OFF' : '₹' + c.value + ' OFF'}, Expires: ${c.expires_at.toISOString().split('T')[0]}, Active: ${c.is_active}`);
      });
      
      process.exit(0);
    }

    console.log(`⚠️  Found ${coupons.length} coupon(s) with unrealistic minimum orders (> ₹${UNREALISTIC_THRESHOLD}):\n`);

    // Display and fix each coupon
    for (let i = 0; i < coupons.length; i++) {
      const coupon = coupons[i];
      
      console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(`📋 Coupon ${i + 1}/${coupons.length}: ${coupon.code}`);
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log("BEFORE:");
      console.log({
        code: coupon.code,
        discount_type: coupon.discount_type,
        value: coupon.value,
        min_order: coupon.min_order,
        expires_at: coupon.expires_at.toISOString().split('T')[0],
        is_active: coupon.is_active,
        usage_limit: coupon.usage_limit,
        used_count: coupon.used_count
      });

      // Update to reasonable minimum order
      coupon.min_order = REASONABLE_MIN_ORDER;
      await coupon.save();

      console.log("\nAFTER:");
      console.log({
        code: coupon.code,
        discount_type: coupon.discount_type,
        value: coupon.value,
        min_order: coupon.min_order,
        expires_at: coupon.expires_at.toISOString().split('T')[0],
        is_active: coupon.is_active,
        usage_limit: coupon.usage_limit,
        used_count: coupon.used_count
      });
      
      console.log(`✅ Updated ${coupon.code} minimum order: ₹${UNREALISTIC_THRESHOLD}+ → ₹${REASONABLE_MIN_ORDER}`);
    }

    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`✅ Successfully fixed ${coupons.length} coupon(s)!`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

fixCouponMinOrder();

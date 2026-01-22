/**
 * Script to list all coupons
 * Run this with: node scripts/listCoupons.js
 */

const mongoose = require("mongoose");
require("dotenv").config();

async function listCoupons() {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(process.env.DB_URI);
    console.log("✅ Connected to MongoDB\n");

    const db = mongoose.connection.db;
    const couponsCollection = db.collection("coupons");

    const coupons = await couponsCollection.find({}).toArray();
    
    console.log(`📋 Found ${coupons.length} coupon(s):\n`);
    
    coupons.forEach((coupon, index) => {
      console.log(`${index + 1}. Coupon:`);
      console.log(`   ID: ${coupon._id}`);
      console.log(`   Code: ${coupon.code || "NULL/EMPTY"}`);
      console.log(`   Discount: ${coupon.value} (${coupon.discount_type})`);
      console.log(`   Min Order: ${coupon.min_order || 0}`);
      console.log(`   Expires: ${coupon.expires_at}`);
      console.log(`   Active: ${coupon.is_active}`);
      console.log(`   Usage: ${coupon.used_count}/${coupon.usage_limit}`);
      console.log("");
    });

  } catch (error) {
    console.error("\n❌ Error:", error);
  } finally {
    await mongoose.connection.close();
    console.log("🔌 Database connection closed");
    process.exit(0);
  }
}

listCoupons();

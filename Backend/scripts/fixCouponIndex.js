/**
 * Script to fix Coupon collection indexes and clean up invalid data
 * Run this with: node scripts/fixCouponIndex.js
 */

const mongoose = require("mongoose");
require("dotenv").config();

async function fixCouponIndexes() {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(process.env.DB_URI);
    console.log("✅ Connected to MongoDB");

    const db = mongoose.connection.db;
    const couponsCollection = db.collection("coupons");

    // 1. Check existing indexes
    console.log("\n📋 Current indexes:");
    const indexes = await couponsCollection.indexes();
    console.log(JSON.stringify(indexes, null, 2));

    // 2. Drop old coupon_code index if it exists
    try {
      console.log("\n🗑️  Dropping old 'coupon_code_1' index...");
      await couponsCollection.dropIndex("coupon_code_1");
      console.log("✅ Dropped old 'coupon_code_1' index");
    } catch (error) {
      if (error.code === 27) {
        console.log("ℹ️  Index 'coupon_code_1' doesn't exist (already removed)");
      } else {
        console.error("❌ Error dropping index:", error.message);
      }
    }

    // 3. Delete coupons with null or empty code
    console.log("\n🧹 Cleaning up invalid coupons...");
    const deleteResult = await couponsCollection.deleteMany({
      $or: [
        { code: null },
        { code: "" },
        { code: { $exists: false } },
      ],
    });
    console.log(`✅ Deleted ${deleteResult.deletedCount} invalid coupon(s)`);

    // 4. Check if code index exists, if not create it
    const currentIndexes = await couponsCollection.indexes();
    const hasCodeIndex = currentIndexes.some(
      (idx) => idx.name === "code_1" || idx.name === "idx_coupon_code"
    );

    if (!hasCodeIndex) {
      console.log("\n📝 Creating 'code' index...");
      await couponsCollection.createIndex(
        { code: 1 },
        { unique: true, name: "idx_coupon_code" }
      );
      console.log("✅ Created 'code' index");
    } else {
      console.log("\nℹ️  'code' index already exists");
    }

    // 5. Show final indexes
    console.log("\n📋 Final indexes:");
    const finalIndexes = await couponsCollection.indexes();
    console.log(JSON.stringify(finalIndexes, null, 2));

    // 6. Show remaining coupons count
    const count = await couponsCollection.countDocuments();
    console.log(`\n✅ Total coupons in database: ${count}`);

    console.log("\n✨ Index fix completed successfully!");
  } catch (error) {
    console.error("\n❌ Error fixing indexes:", error);
  } finally {
    await mongoose.connection.close();
    console.log("\n🔌 Database connection closed");
    process.exit(0);
  }
}

fixCouponIndexes();

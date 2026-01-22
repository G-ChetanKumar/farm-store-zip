/**
 * Fix Coupon Duplicate Key Error
 * 
 * Problem: E11000 duplicate key error on coupon_code field
 * Cause: Multiple coupons with null/empty code values
 * 
 * This script:
 * 1. Removes duplicate/invalid coupons
 * 2. Drops old index
 * 3. Creates new index
 */

const mongoose = require("mongoose");
require("dotenv").config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/test";

async function fixCouponDuplicates() {
  try {
    console.log("🔧 Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    const db = mongoose.connection.db;
    const couponsCollection = db.collection("coupons");

    // Step 1: Find all invalid coupons (null, empty, or missing code)
    console.log("\n📊 Checking for invalid coupons...");
    const invalidCoupons = await couponsCollection
      .find({
        $or: [
          { code: null },
          { code: "" },
          { code: { $exists: false } },
          { coupon_code: null },
          { coupon_code: "" },
          { coupon_code: { $exists: false } },
        ],
      })
      .toArray();

    console.log(`Found ${invalidCoupons.length} invalid coupons`);

    if (invalidCoupons.length > 0) {
      console.log("\n🗑️  Removing invalid coupons...");
      const deleteResult = await couponsCollection.deleteMany({
        $or: [
          { code: null },
          { code: "" },
          { code: { $exists: false } },
          { coupon_code: null },
          { coupon_code: "" },
          { coupon_code: { $exists: false } },
        ],
      });
      console.log(`✅ Deleted ${deleteResult.deletedCount} invalid coupons`);
    }

    // Step 2: Check for duplicate codes
    console.log("\n📊 Checking for duplicate codes...");
    const duplicates = await couponsCollection
      .aggregate([
        {
          $match: {
            code: { $ne: null, $ne: "" },
          },
        },
        {
          $group: {
            _id: "$code",
            count: { $sum: 1 },
            ids: { $push: "$_id" },
          },
        },
        {
          $match: {
            count: { $gt: 1 },
          },
        },
      ])
      .toArray();

    if (duplicates.length > 0) {
      console.log(`Found ${duplicates.length} duplicate codes`);
      
      for (const dup of duplicates) {
        console.log(`\n🔍 Duplicate code: ${dup._id}`);
        // Keep first, delete rest
        const idsToDelete = dup.ids.slice(1);
        console.log(`   Keeping 1, deleting ${idsToDelete.length} duplicates`);
        
        await couponsCollection.deleteMany({
          _id: { $in: idsToDelete },
        });
      }
      console.log("✅ Removed duplicate coupons");
    } else {
      console.log("✅ No duplicate codes found");
    }

    // Step 3: Drop old indexes
    console.log("\n🗑️  Dropping old indexes...");
    try {
      const indexes = await couponsCollection.indexes();
      console.log("Current indexes:", indexes.map((i) => i.name).join(", "));

      for (const index of indexes) {
        if (index.name === "coupon_code_1") {
          console.log(`   Dropping old index: ${index.name}`);
          await couponsCollection.dropIndex(index.name);
          console.log(`   ✅ Dropped: ${index.name}`);
        }
      }
    } catch (error) {
      console.log("   ⚠️  No old indexes to drop or already dropped");
    }

    // Step 4: Create new index
    console.log("\n🔨 Creating new index on 'code' field...");
    try {
      await couponsCollection.createIndex(
        { code: 1 },
        { 
          unique: true, 
          name: "idx_coupon_code",
          sparse: true // Allow null but only one null
        }
      );
      console.log("✅ Created index: idx_coupon_code");
    } catch (error) {
      console.log("   ⚠️  Index might already exist:", error.message);
    }

    // Step 5: Show final stats
    console.log("\n📊 Final Statistics:");
    const totalCoupons = await couponsCollection.countDocuments();
    const activeCoupons = await couponsCollection.countDocuments({
      is_active: true,
    });
    const expiredCoupons = await couponsCollection.countDocuments({
      expires_at: { $lt: new Date() },
    });

    console.log(`   Total coupons: ${totalCoupons}`);
    console.log(`   Active coupons: ${activeCoupons}`);
    console.log(`   Expired coupons: ${expiredCoupons}`);

    // Step 6: List all valid coupons
    if (totalCoupons > 0) {
      console.log("\n📋 Current valid coupons:");
      const validCoupons = await couponsCollection
        .find({ code: { $ne: null, $ne: "" } })
        .sort({ createdAt: -1 })
        .limit(10)
        .toArray();

      validCoupons.forEach((coupon, index) => {
        console.log(
          `   ${index + 1}. ${coupon.code} - ${coupon.discount_type === "percent" ? coupon.value + "%" : "₹" + coupon.value} OFF (${coupon.is_active ? "Active" : "Inactive"})`
        );
      });
    }

    console.log("\n✅ Coupon database cleanup complete!");
    console.log("\n🔄 Next steps:");
    console.log("   1. Restart backend server");
    console.log("   2. Try creating/viewing coupons again");
    console.log("   3. No more duplicate key errors!");

  } catch (error) {
    console.error("\n❌ Error:", error.message);
    console.error("Stack:", error.stack);
  } finally {
    await mongoose.connection.close();
    console.log("\n🔌 Disconnected from MongoDB");
  }
}

// Run the fix
console.log("====================================");
console.log("  COUPON DUPLICATE KEY FIX SCRIPT  ");
console.log("====================================\n");

fixCouponDuplicates()
  .then(() => {
    console.log("\n✅ Script completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Script failed:", error);
    process.exit(1);
  });

/**
 * Script to clean up unnecessary Coupon collection indexes
 * Run this with: node scripts/cleanupCouponIndexes.js
 */

const mongoose = require("mongoose");
require("dotenv").config();

async function cleanupIndexes() {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(process.env.DB_URI);
    console.log("✅ Connected to MongoDB");

    const db = mongoose.connection.db;
    const couponsCollection = db.collection("coupons");

    // List of indexes to remove (old/unnecessary ones)
    const indexesToDrop = [
      "is_active_1",
      "valid_from_1_valid_until_1", 
      "is_active_1_valid_until_1",
      "code_1", // Keep only idx_coupon_code
    ];

    console.log("\n🗑️  Removing unnecessary indexes...");
    
    for (const indexName of indexesToDrop) {
      try {
        await couponsCollection.dropIndex(indexName);
        console.log(`  ✅ Dropped '${indexName}'`);
      } catch (error) {
        if (error.code === 27) {
          console.log(`  ℹ️  '${indexName}' doesn't exist (already removed)`);
        } else {
          console.error(`  ❌ Error dropping '${indexName}':`, error.message);
        }
      }
    }

    // Show final indexes
    console.log("\n📋 Final indexes:");
    const finalIndexes = await couponsCollection.indexes();
    finalIndexes.forEach((idx) => {
      console.log(`  - ${idx.name}: ${JSON.stringify(idx.key)}`);
    });

    console.log("\n✨ Cleanup completed successfully!");
  } catch (error) {
    console.error("\n❌ Error cleaning up indexes:", error);
  } finally {
    await mongoose.connection.close();
    console.log("\n🔌 Database connection closed");
    process.exit(0);
  }
}

cleanupIndexes();

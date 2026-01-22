/**
 * Quick script to check order statuses
 * Run this with: node scripts/checkOrderStatus.js
 */

const mongoose = require("mongoose");
require("dotenv").config();

async function checkOrders() {
  try {
    console.log("🔌 Connecting...");
    await mongoose.connect(process.env.DB_URI);
    
    const ordersCollection = mongoose.connection.db.collection("orders");
    
    // Get sample orders
    const orders = await ordersCollection.find({}).limit(5).toArray();
    
    console.log("\n📦 Sample Orders:");
    orders.forEach((order, i) => {
      console.log(`\n${i + 1}. Order ${order._id.toString().slice(-8)}`);
      console.log(`   Status: ${order.order_status || 'undefined'}`);
      console.log(`   Return Requested: ${order.return_requested || false}`);
    });
    
    // Count by status
    const statuses = await ordersCollection.aggregate([
      { $group: { _id: "$order_status", count: { $sum: 1 } } }
    ]).toArray();
    
    console.log("\n📊 Status Breakdown:");
    statuses.forEach(s => {
      console.log(`   ${s._id || 'undefined'}: ${s.count}`);
    });
    
    await mongoose.connection.close();
    console.log("\n✅ Done!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

checkOrders();

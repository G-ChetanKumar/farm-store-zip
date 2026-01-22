/**
 * Script to set orders as delivered for testing return functionality
 * Run this with: node scripts/setOrdersDelivered.js
 */

const mongoose = require("mongoose");
require("dotenv").config();

async function setOrdersDelivered() {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(process.env.DB_URI);
    console.log("✅ Connected to MongoDB\n");

    const db = mongoose.connection.db;
    const ordersCollection = db.collection("orders");

    // Get all orders
    const orders = await ordersCollection.find({}).toArray();
    console.log(`📦 Found ${orders.length} total orders\n`);

    // Show orders that are NOT delivered
    const notDelivered = orders.filter(o => o.order_status !== 'delivered');
    console.log(`🔍 Orders NOT marked as delivered: ${notDelivered.length}`);
    
    if (notDelivered.length > 0) {
      console.log("\nOrders to update:");
      notDelivered.forEach((order, index) => {
        console.log(`  ${index + 1}. Order ID: ${order._id}`);
        console.log(`     Current Status: ${order.order_status || 'undefined'}`);
        console.log(`     Customer: ${order.name || 'N/A'}`);
        console.log(`     Amount: ₹${order.total_amount || 0}`);
        console.log("");
      });

      // Ask for confirmation (in a real scenario)
      console.log("⚠️  This will update ALL orders to 'delivered' status");
      console.log("⚠️  AND set delivered_at to current date\n");

      // Update all orders to delivered
      const result = await ordersCollection.updateMany(
        { order_status: { $ne: 'delivered' } },
        { 
          $set: { 
            order_status: 'delivered',
            delivered_at: new Date()
          } 
        }
      );

      console.log(`✅ Updated ${result.modifiedCount} orders to 'delivered' status\n`);
    } else {
      console.log("✅ All orders are already marked as delivered!\n");
    }

    // Show final count
    const deliveredCount = await ordersCollection.countDocuments({ order_status: 'delivered' });
    console.log(`📊 Final Statistics:`);
    console.log(`   Total Orders: ${orders.length}`);
    console.log(`   Delivered Orders: ${deliveredCount}`);
    console.log(`   Eligible for Returns: ${deliveredCount}`);

  } catch (error) {
    console.error("\n❌ Error:", error);
  } finally {
    await mongoose.connection.close();
    console.log("\n🔌 Database connection closed");
    process.exit(0);
  }
}

setOrdersDelivered();

/**
 * Update a specific order to delivered status
 * Usage: node scripts/updateOrderToDelivered.js <transaction_id or order_id>
 */

const mongoose = require("mongoose");
require("dotenv").config();

async function updateOrder() {
  try {
    // Get transaction ID or order ID from command line
    const searchValue = process.argv[2];
    
    if (!searchValue) {
      console.log("❌ Please provide transaction ID or order ID");
      console.log("Usage: node scripts/updateOrderToDelivered.js order_52vGkQkcEq5WMTW");
      process.exit(1);
    }

    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(process.env.DB_URI);
    console.log("✅ Connected!\n");

    const ordersCollection = mongoose.connection.db.collection("orders");

    // Try to find by transaction_id first, then by _id
    let order;
    
    // Check if it's a valid ObjectId
    if (mongoose.Types.ObjectId.isValid(searchValue)) {
      order = await ordersCollection.findOne({ _id: new mongoose.Types.ObjectId(searchValue) });
    }
    
    // If not found, try transaction_id
    if (!order) {
      order = await ordersCollection.findOne({ transaction_id: searchValue });
    }
    
    if (!order) {
      console.log("❌ Order not found with:", searchValue);
      console.log("\nTry one of these:");
      
      // Show sample orders
      const samples = await ordersCollection.find({}).limit(3).toArray();
      samples.forEach((o, i) => {
        console.log(`\n${i + 1}. Order:`);
        console.log(`   ID: ${o._id}`);
        console.log(`   Transaction: ${o.transaction_id}`);
        console.log(`   Status: ${o.order_status}`);
      });
      
      process.exit(1);
    }

    console.log("📦 Found Order:");
    console.log(`   ID: ${order._id}`);
    console.log(`   Transaction ID: ${order.transaction_id}`);
    console.log(`   Customer: ${order.name}`);
    console.log(`   Amount: ₹${order.total_amount}`);
    console.log(`   Current Status: ${order.order_status || 'undefined'}`);
    console.log("");

    // Update to delivered
    const result = await ordersCollection.updateOne(
      { _id: order._id },
      { 
        $set: { 
          order_status: 'delivered',
          delivered_at: new Date()
        } 
      }
    );

    if (result.modifiedCount > 0) {
      console.log("✅ Order updated to 'delivered' status!");
      console.log("✅ delivered_at set to:", new Date().toISOString());
      console.log("\n🎯 Actions:");
      console.log("   1. Refresh your store orders page");
      console.log("   2. Look for the blue '✓ Can Return' badge");
      console.log("   3. Click 'Request Return/Refund' button");
      console.log("   4. Test the return flow!");
    } else {
      console.log("⚠️ Order was not modified (maybe already delivered?)");
    }

  } catch (error) {
    console.error("\n❌ Error:", error.message);
  } finally {
    await mongoose.connection.close();
    console.log("\n🔌 Connection closed");
    process.exit(0);
  }
}

updateOrder();

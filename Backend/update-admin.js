/**
 * Script to Update Admin Credentials
 * 
 * Run: node update-admin.js
 * 
 * Username: admin
 * Password: 12456
 */

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const Admin = require("./models/AdminModel");
const config = require("./config/db");

async function updateAdminCredentials() {
  try {
    console.log("🔄 Connecting to database...");
    await mongoose.connect(config.dbURI, { 
      useNewUrlParser: true, 
      useUnifiedTopology: true 
    });
    console.log("✅ Connected to MongoDB");

    // Hash the new password
    const newPassword = "12456";
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    console.log("✅ Password hashed");

    // Update or create admin
    const username = "admin";
    let admin = await Admin.findOne({ username });

    if (admin) {
      // Update existing admin
      admin.password = hashedPassword;
      
      // Reset security fields for fresh start
      admin.failedLoginAttempts = 0;
      admin.accountLockedUntil = null;
      admin.refreshToken = null;
      admin.refreshTokenExpiry = null;
      admin.csrfToken = null;
      admin.csrfTokenExpiry = null;
      
      // Set role and permissions if not set
      if (!admin.role) admin.role = "super_admin";
      if (!admin.permissions || admin.permissions.length === 0) {
        admin.permissions = ["create", "read", "update", "delete", "approve", "manage_users", "view_analytics", "manage_settings"];
      }
      
      await admin.save();
      console.log("✅ Admin updated successfully!");
    } else {
      // Create new admin
      admin = new Admin({
        username: username,
        password: hashedPassword,
        role: "super_admin",
        permissions: ["create", "read", "update", "delete", "approve", "manage_users", "view_analytics", "manage_settings"],
        failedLoginAttempts: 0
      });
      await admin.save();
      console.log("✅ New admin created successfully!");
    }

    console.log("\n📋 Admin Details:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("Username: admin");
    console.log("Password: 12456");
    console.log("Role:", admin.role);
    console.log("Permissions:", admin.permissions.length, "permissions");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("\n✅ You can now login with:");
    console.log("   Username: admin");
    console.log("   Password: 12456");

    await mongoose.connection.close();
    console.log("\n🔌 Database connection closed");
    process.exit(0);

  } catch (error) {
    console.error("❌ Error:", error);
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
}

// Run the script
updateAdminCredentials();

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, Mail, Phone, Lock, Edit2, Save, X, MapPin, ArrowLeft } from "lucide-react";
import { toast } from "react-toastify";
import BASE_URL from "../Helper/Helper";
import apiClient from "../api/axios";
import AddressManagement from "./AddressManagement";

const UserProfile = () => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [membership, setMembership] = useState(null);
  
  const [userDetails, setUserDetails] = useState({
    name: "",
    email: "",
    mobile: "",
    user_type: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      toast.error("Please login to view profile");
      navigate("/login");
      return;
    }
    
    const user = JSON.parse(storedUser);
    setUserDetails({
      name: user.name || "",
      email: user.email || "",
      mobile: user.mobile || "",
      user_type: user.user_type || "",
    });
    
    // Fetch membership if user is Farmer
    if (user.user_type === "Farmer") {
      fetchMembership(user.id);
    }
  }, [navigate]);
  
  const fetchMembership = async (userId) => {
    try {
      console.log("📋 Fetching membership for user:", userId);
      const response = await apiClient.get(`/v1/membership/subscription/${userId}`);
      
      if (response.data.success && response.data.data) {
        setMembership(response.data.data);
        console.log("✅ Membership fetched:", response.data.data);
      }
    } catch (error) {
      console.log("⚠️ No active membership or error:", error.message);
      // No active membership
      setMembership(null);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpdateProfile = async () => {
    setLoading(true);
    try {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      console.log("💾 Updating user profile:", userDetails);
      
      const response = await apiClient.put(`/user/update-user/${storedUser.id}`, userDetails);

      console.log("✅ Profile update response:", response.data);
      
      if (response.data.success) {
        localStorage.setItem("user", JSON.stringify({ ...storedUser, ...userDetails }));
        toast.success("Profile updated successfully!");
        setIsEditing(false);
      } else {
        toast.error(response.data.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("❌ Error updating profile:", error);
      const errorMessage = error.response?.data?.message || error.message || "Error updating profile. Please try again.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords do not match!");
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast.error("Password must be at least 8 characters long!");
      return;
    }

    setLoading(true);
    try {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      const response = await fetch(`${BASE_URL}/user/change-password/${storedUser.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success("Password changed successfully!");
        setIsChangingPassword(false);
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        toast.error(data.message || "Failed to change password");
      }
    } catch (error) {
      console.error("Error changing password:", error);
      toast.error("Error changing password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    localStorage.removeItem("userType");
    toast.success("Logged out successfully!");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 mb-4 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Back</span>
        </button>

        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                <User className="text-white" size={32} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">{userDetails.name}</h1>
                <p className="text-gray-600">{userDetails.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab("profile")}
              className={`flex-1 px-6 py-4 font-medium transition-colors ${
                activeTab === "profile"
                  ? "border-b-2 border-green-500 text-green-600"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Profile Details
            </button>
            <button
              onClick={() => setActiveTab("addresses")}
              className={`flex-1 px-6 py-4 font-medium transition-colors ${
                activeTab === "addresses"
                  ? "border-b-2 border-green-500 text-green-600"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              My Addresses
            </button>
            {userDetails.user_type === "Farmer" && (
              <button
                onClick={() => setActiveTab("membership")}
                className={`flex-1 px-6 py-4 font-medium transition-colors ${
                  activeTab === "membership"
                    ? "border-b-2 border-green-500 text-green-600"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                My Membership
              </button>
            )}
          </div>
        </div>

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Personal Information</h2>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <Edit2 size={18} />
                  <span>Edit</span>
                </button>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center space-x-2">
                    <User size={18} />
                    <span>Full Name</span>
                  </div>
                </label>
                <input
                  type="text"
                  name="name"
                  value={userDetails.name}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    isEditing ? "bg-white" : "bg-gray-100"
                  }`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center space-x-2">
                    <Mail size={18} />
                    <span>Email Address</span>
                  </div>
                </label>
                <input
                  type="email"
                  name="email"
                  value={userDetails.email}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    isEditing ? "bg-white" : "bg-gray-100"
                  }`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center space-x-2">
                    <Phone size={18} />
                    <span>Mobile Number</span>
                  </div>
                </label>
                <input
                  type="tel"
                  name="mobile"
                  value={userDetails.mobile}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    isEditing ? "bg-white" : "bg-gray-100"
                  }`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <span>Account Type</span>
                </label>
                <input
                  type="text"
                  value={userDetails.user_type}
                  disabled
                  className="w-full px-4 py-3 border rounded-lg bg-gray-100"
                />
              </div>

              {isEditing && (
                <div className="flex space-x-4 pt-4">
                  <button
                    onClick={handleUpdateProfile}
                    disabled={loading}
                    className="flex items-center space-x-2 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                  >
                    <Save size={18} />
                    <span>{loading ? "Saving..." : "Save Changes"}</span>
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="flex items-center space-x-2 px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    <X size={18} />
                    <span>Cancel</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Addresses Tab */}
        {activeTab === "addresses" && <AddressManagement />}
        
        {/* Membership Tab */}
        {activeTab === "membership" && userDetails.user_type === "Farmer" && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">My Membership</h2>
            
            {membership ? (
              <div className="space-y-6">
                {/* Active Membership Card */}
                <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-2 border-yellow-400 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-4xl">🎉</span>
                      <div>
                        <h3 className="text-2xl font-bold text-yellow-800">
                          {membership.plan_id?.name} Membership
                        </h3>
                        <p className="text-yellow-700">Active Plan</p>
                      </div>
                    </div>
                    <span className="bg-green-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                      ACTIVE
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    <div className="bg-white rounded-lg p-4">
                      <p className="text-gray-600 text-sm mb-1">Discount Benefit</p>
                      <p className="text-2xl font-bold text-green-600">
                        {membership.plan_id?.cashback_percent}% OFF
                      </p>
                      <p className="text-gray-500 text-xs mt-1">On every order</p>
                    </div>
                    
                    <div className="bg-white rounded-lg p-4">
                      <p className="text-gray-600 text-sm mb-1">Purchases Left</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {membership.purchases_left}
                      </p>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ 
                            width: `${(membership.purchases_left / membership.plan_id?.validity_purchases) * 100}%` 
                          }}
                        />
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-lg p-4">
                      <p className="text-gray-600 text-sm mb-1">Member Since</p>
                      <p className="text-lg font-semibold text-gray-800">
                        {new Date(membership.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    
                    <div className="bg-white rounded-lg p-4">
                      <p className="text-gray-600 text-sm mb-1">Expires On</p>
                      <p className="text-lg font-semibold text-gray-800">
                        {new Date(membership.expires_at).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {Math.ceil((new Date(membership.expires_at) - new Date()) / (1000 * 60 * 60 * 24))} days left
                      </p>
                    </div>
                  </div>
                  
                  {membership.plan_id?.can_club_coupons && (
                    <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-sm text-blue-800">
                        ✓ You can combine your membership discount with coupon codes!
                      </p>
                    </div>
                  )}
                </div>
                
                {/* Benefits Section */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Membership Benefits</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <span className="text-green-500 text-xl">✓</span>
                      <span className="text-gray-700">
                        Get <strong>{membership.plan_id?.cashback_percent}% instant discount</strong> on every order
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-green-500 text-xl">✓</span>
                      <span className="text-gray-700">
                        Earn <strong>Kisan Cash</strong> rewards on membership orders
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-green-500 text-xl">✓</span>
                      <span className="text-gray-700">
                        Valid for <strong>{membership.plan_id?.validity_purchases} purchases</strong>
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-green-500 text-xl">✓</span>
                      <span className="text-gray-700">
                        Membership valid for <strong>{membership.plan_id?.validity_days} days</strong>
                      </span>
                    </li>
                  </ul>
                </div>
                
                {/* Renew Button (if expiring soon) */}
                {Math.ceil((new Date(membership.expires_at) - new Date()) / (1000 * 60 * 60 * 24)) <= 7 && (
                  <div className="bg-orange-50 border border-orange-300 rounded-lg p-4">
                    <p className="text-orange-800 mb-3">
                      ⚠️ Your membership expires soon! Renew now to continue enjoying benefits.
                    </p>
                    <button
                      onClick={() => navigate("/membership")}
                      className="w-full bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors"
                    >
                      Renew Membership
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🌟</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  No Active Membership
                </h3>
                <p className="text-gray-600 mb-6">
                  Subscribe to a membership plan and save on every order!
                </p>
                <button
                  onClick={() => navigate("/membership")}
                  className="bg-green-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors"
                >
                  Browse Membership Plans
                </button>
              </div>
            )}
          </div>
        )}

        {/* Change Password Section - Only show on Profile tab */}
        {activeTab === "profile" && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-800">Security</h2>
            {!isChangingPassword && (
              <button
                onClick={() => setIsChangingPassword(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
              >
                <Lock size={18} />
                <span>Change Password</span>
              </button>
            )}
          </div>

          {isChangingPassword && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Password
                </label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  placeholder="Enter current password"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  placeholder="Enter new password"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  placeholder="Confirm new password"
                />
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  onClick={handleChangePassword}
                  disabled={loading}
                  className="flex items-center space-x-2 px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors disabled:opacity-50"
                >
                  <Save size={18} />
                  <span>{loading ? "Updating..." : "Update Password"}</span>
                </button>
                <button
                  onClick={() => {
                    setIsChangingPassword(false);
                    setPasswordData({
                      currentPassword: "",
                      newPassword: "",
                      confirmPassword: "",
                    });
                  }}
                  className="flex items-center space-x-2 px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  <X size={18} />
                  <span>Cancel</span>
                </button>
              </div>
            </div>
          )}
        </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;

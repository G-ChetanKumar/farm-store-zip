import React, { useState, useEffect } from "react";
import { 
  MapPin, Plus, Edit2, Trash2, Save, X, Home, Building, 
  Check, RefreshCw, Mail, Phone as PhoneIcon 
} from "lucide-react";
import { toast } from "react-toastify";
import { addressService } from "../services";

/**
 * AddressManagement Component
 * 
 * Features:
 * - Add multiple addresses
 * - Edit existing addresses
 * - Delete addresses
 * - Set default address
 * - Form validation
 * - Integrated with addressService
 */

const AddressManagement = () => {
  const [addresses, setAddresses] = useState([]);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  const [formData, setFormData] = useState({
    label: "Home",
    tag: "home",
    name: "",
    phone: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    postal_code: "",
    country: "India",
    is_default: false,
  });

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      setRefreshing(true);
      const result = await addressService.getAddresses();
      
      if (result.success && result.data) {
        setAddresses(result.data);
        console.log("✅ Loaded addresses:", result.data.length);
      } else {
        setAddresses([]);
        console.log("ℹ️ No addresses found");
      }
    } catch (error) {
      console.error("❌ Error fetching addresses:", error);
      toast.error("Failed to load addresses");
      setAddresses([]);
    } finally {
      setRefreshing(false);
    }
  };

  const resetForm = () => {
    setFormData({
      label: "Home",
      tag: "home",
      name: "",
      phone: "",
      line1: "",
      line2: "",
      city: "",
      state: "",
      postal_code: "",
      country: "India",
      is_default: false,
    });
    setIsAddingNew(false);
    setEditingId(null);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Update tag when label changes
    if (name === "label") {
      setFormData((prev) => ({
        ...prev,
        label: value,
        tag: value.toLowerCase(),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  const handleSaveAddress = async () => {
    // Validate form
    const validation = addressService.validateAddress(formData);
    if (!validation.valid) {
      toast.error(validation.errors[0]);
      return;
    }

    setLoading(true);
    try {
      let result;
      if (editingId) {
        result = await addressService.updateAddress(editingId, formData);
        toast.success("✅ Address updated successfully!");
      } else {
        result = await addressService.addAddress(formData);
        toast.success("✅ Address added successfully!");
      }

      if (result.success) {
        await fetchAddresses();
        resetForm();
      } else {
        toast.error(result.message || "Failed to save address");
      }
    } catch (error) {
      console.error("❌ Error saving address:", error);
      toast.error(error.response?.data?.message || "Error saving address");
    } finally {
      setLoading(false);
    }
  };

  const handleEditAddress = (address) => {
    setFormData({
      label: address.label || "Home",
      tag: address.tag || "home",
      name: address.name || "",
      phone: address.phone || "",
      line1: address.line1 || "",
      line2: address.line2 || "",
      city: address.city || "",
      state: address.state || "",
      postal_code: address.postal_code || "",
      country: address.country || "India",
      is_default: address.is_default || false,
    });
    setEditingId(address._id);
    setIsAddingNew(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteAddress = async (id) => {
    if (!window.confirm("Are you sure you want to delete this address?")) return;

    try {
      const result = await addressService.deleteAddress(id);
      if (result.success) {
        toast.success("✅ Address deleted successfully!");
        await fetchAddresses();
      } else {
        toast.error(result.message || "Failed to delete address");
      }
    } catch (error) {
      console.error("❌ Error deleting address:", error);
      toast.error("Error deleting address");
    }
  };

  const handleSetDefault = async (id) => {
    try {
      const result = await addressService.setDefaultAddress(id);
      if (result.success) {
        toast.success("✅ Default address updated!");
        await fetchAddresses();
      } else {
        toast.error(result.message || "Failed to set default address");
      }
    } catch (error) {
      console.error("❌ Error setting default address:", error);
      toast.error("Error setting default address");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">My Addresses</h2>
          <p className="text-sm text-gray-600 mt-1">
            Manage your delivery addresses ({addresses.length} saved)
          </p>
        </div>
        <button
          onClick={fetchAddresses}
          disabled={refreshing}
          className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          title="Refresh addresses"
        >
          <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Add New Address Button */}
      {!isAddingNew && (
        <button
          onClick={() => setIsAddingNew(true)}
          className="w-full flex items-center justify-center space-x-2 px-6 py-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors group"
        >
          <Plus size={20} className="text-green-600 group-hover:scale-110 transition-transform" />
          <span className="text-gray-700 font-medium">Add New Address</span>
        </button>
      )}

      {/* Address Form */}
      {isAddingNew && (
        <div className="bg-white border-2 border-green-500 rounded-xl p-6 shadow-lg">
          <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
            <MapPin className="mr-2 text-green-600" size={24} />
            {editingId ? "Edit Address" : "Add New Address"}
          </h3>
          
          <div className="space-y-5">
            {/* Address Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Address Type
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="label"
                    value="Home"
                    checked={formData.label === "Home"}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-green-500 focus:ring-green-500"
                  />
                  <Home size={18} className="text-gray-600" />
                  <span className="font-medium">Home</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="label"
                    value="Work"
                    checked={formData.label === "Work"}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-green-500 focus:ring-green-500"
                  />
                  <Building size={18} className="text-gray-600" />
                  <span className="font-medium">Work</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="label"
                    value="Other"
                    checked={formData.label === "Other"}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-green-500 focus:ring-green-500"
                  />
                  <MapPin size={18} className="text-gray-600" />
                  <span className="font-medium">Other</span>
                </label>
              </div>
            </div>

            {/* Contact Details */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="10-digit mobile number"
                  maxLength="10"
                />
              </div>
            </div>

            {/* Address Lines */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address Line 1 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="line1"
                value={formData.line1}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="House No., Building Name, Road"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address Line 2 (Optional)
              </label>
              <input
                type="text"
                name="line2"
                value={formData.line2}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Landmark, Area, Street"
              />
            </div>

            {/* City, State, Pincode */}
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pincode <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="postal_code"
                  value={formData.postal_code}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="6-digit pincode"
                  maxLength="6"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="City"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="State"
                />
              </div>
            </div>

            {/* Default Address Checkbox */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="is_default"
                  checked={formData.is_default}
                  onChange={handleInputChange}
                  className="w-5 h-5 text-green-500 focus:ring-green-500 rounded"
                />
                <div>
                  <span className="text-sm font-medium text-gray-800">
                    Set as default delivery address
                  </span>
                  <p className="text-xs text-gray-600 mt-1">
                    This address will be selected automatically during checkout
                  </p>
                </div>
              </label>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4 pt-4">
              <button
                onClick={handleSaveAddress}
                disabled={loading}
                className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                <Save size={18} />
                <span>{loading ? "Saving..." : "Save Address"}</span>
              </button>
              <button
                onClick={resetForm}
                disabled={loading}
                className="flex items-center justify-center space-x-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                <X size={18} />
                <span>Cancel</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Saved Addresses List */}
      <div className="space-y-4">
        {addresses.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <MapPin size={64} className="mx-auto mb-4 text-gray-400" />
            <p className="text-gray-700 font-medium text-lg">No saved addresses yet</p>
            <p className="text-sm text-gray-500 mt-2 mb-4">
              Add your first delivery address to get started
            </p>
            <button
              onClick={() => setIsAddingNew(true)}
              className="inline-flex items-center space-x-2 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
            >
              <Plus size={18} />
              <span>Add Address</span>
            </button>
          </div>
        ) : (
          addresses.map((address) => (
            <div
              key={address._id}
              className={`bg-white rounded-xl p-6 transition-all hover:shadow-md ${
                address.is_default 
                  ? "border-2 border-green-500 shadow-sm" 
                  : "border border-gray-200"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Address Header */}
                  <div className="flex items-center space-x-3 mb-3">
                    {address.label === "Home" ? (
                      <Home size={22} className="text-green-600" />
                    ) : address.label === "Work" ? (
                      <Building size={22} className="text-blue-600" />
                    ) : (
                      <MapPin size={22} className="text-gray-600" />
                    )}
                    <span className="font-bold text-gray-800 text-lg">{address.label}</span>
                    {address.is_default && (
                      <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full flex items-center space-x-1">
                        <Check size={14} />
                        <span>DEFAULT</span>
                      </span>
                    )}
                  </div>
                  
                  {/* Contact Info */}
                  <div className="space-y-2 mb-3">
                    <p className="text-gray-800 font-semibold text-base">{address.name}</p>
                    <p className="text-gray-600 flex items-center">
                      <PhoneIcon size={14} className="mr-2" />
                      {address.phone}
                    </p>
                  </div>

                  {/* Address Details */}
                  <div className="text-gray-600 space-y-1">
                    <p>{address.line1}</p>
                    {address.line2 && <p>{address.line2}</p>}
                    <p className="font-medium">
                      {address.city}, {address.state} - {address.postal_code}
                    </p>
                    <p className="text-sm text-gray-500">{address.country}</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col space-y-2 ml-6">
                  {!address.is_default && (
                    <button
                      onClick={() => handleSetDefault(address._id)}
                      className="px-4 py-2 text-sm text-green-600 border border-green-600 rounded-lg hover:bg-green-50 transition-colors font-medium whitespace-nowrap"
                    >
                      Set Default
                    </button>
                  )}
                  <button
                    onClick={() => handleEditAddress(address)}
                    className="flex items-center justify-center space-x-1 px-4 py-2 text-sm text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium"
                  >
                    <Edit2 size={14} />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDeleteAddress(address._id)}
                    className="flex items-center justify-center space-x-1 px-4 py-2 text-sm text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium"
                  >
                    <Trash2 size={14} />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Info Box */}
      {addresses.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>💡 Tip:</strong> You can add multiple addresses for different locations. 
            Set one as default for quick checkout!
          </p>
        </div>
      )}
    </div>
  );
};

export default AddressManagement;

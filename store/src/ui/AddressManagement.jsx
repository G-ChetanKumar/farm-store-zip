import React, { useEffect, useState } from "react";
import { Building, Check, Edit2, Home, MapPin, Plus, RefreshCw, Save, Trash2, X } from "lucide-react";
import { toast } from "react-toastify";
import { addressService } from "../services";

const AddressManagement = () => {
  const [addresses, setAddresses] = useState([]);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  
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
      setLoading(true);
      const result = await addressService.getAddresses();
      
      if (result.success && result.data) {
        setAddresses(result.data);
        console.log("Loaded addresses:", result.data.length);
      } else {
        setAddresses([]);
        console.log("No addresses found");
      }
    } catch (error) {
      console.error("Error fetching addresses:", error);
      toast.error("Failed to load addresses");
      setAddresses([]);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      tag: "home",
      label: "Home",
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
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error("Name is required");
      return false;
    }
    if (!formData.phone.trim() || !/^[0-9]{10}$/.test(formData.phone)) {
      toast.error("Valid 10-digit phone number is required");
      return false;
    }
    if (!formData.line1.trim()) {
      toast.error("Address is required");
      return false;
    }
    if (!formData.postal_code.trim() || !/^[0-9]{6}$/.test(formData.postal_code)) {
      toast.error("Valid 6-digit pincode is required");
      return false;
    }
    if (!formData.city.trim()) {
      toast.error("City is required");
      return false;
    }
    if (!formData.state.trim()) {
      toast.error("State is required");
      return false;
    }
    return true;
  };

  const handleSaveAddress = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Prepare address data with tag matching label
      const addressData = {
        ...formData,
        tag: formData.label.toLowerCase(),
        label: formData.label
      };

      let result;
      if (editingId) {
        result = await addressService.updateAddress(editingId, addressData);
      } else {
        result = await addressService.addAddress(addressData);
      }

      if (result.success) {
        toast.success(editingId ? "Address updated successfully!" : "Address added successfully!");
        fetchAddresses();
        resetForm();
      } else {
        toast.error(result.message || "Failed to save address");
      }
    } catch (error) {
      console.error("Error saving address:", error);
      toast.error(error.response?.data?.message || "Error saving address. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditAddress = (address) => {
    setFormData({
      tag: address.tag || "home",
      label: address.label || "Home",
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
  };

  const handleDeleteAddress = async (id) => {
    if (!window.confirm("Are you sure you want to delete this address?")) return;

    try {
      const result = await addressService.deleteAddress(id);
      
      if (result.success) {
        toast.success("Address deleted successfully!");
        fetchAddresses();
      } else {
        toast.error(result.message || "Failed to delete address");
      }
    } catch (error) {
      console.error("Error deleting address:", error);
      toast.error(error.response?.data?.message || "Error deleting address. Please try again.");
    }
  };

  const handleSetDefault = async (id) => {
    try {
      const result = await addressService.setDefaultAddress(id);
      
      if (result.success) {
        toast.success("Default address updated!");
        fetchAddresses();
      } else {
        toast.error(result.message || "Failed to set default address");
      }
    } catch (error) {
      console.error("Error setting default address:", error);
      toast.error(error.response?.data?.message || "Error setting default address. Please try again.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Refresh Button */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">Saved Addresses</h3>
        <button
          onClick={fetchAddresses}
          className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          title="Refresh addresses"
        >
          <RefreshCw size={16} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Add New Address Button */}
      {!isAddingNew && (
        <button
          onClick={() => setIsAddingNew(true)}
          className="w-full flex items-center justify-center space-x-2 px-6 py-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
        >
          <Plus size={20} className="text-green-600" />
          <span className="text-gray-700 font-medium">Add New Address</span>
        </button>
      )}

      {/* Address Form */}
      {isAddingNew && (
        <div className="bg-white border-2 border-green-500 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            {editingId ? "Edit Address" : "Add New Address"}
          </h3>
          
          <div className="space-y-4">
            <div className="flex space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="label"
                  value="Home"
                  checked={formData.label === "Home"}
                  onChange={handleInputChange}
                  className="text-green-500 focus:ring-green-500"
                />
                <Home size={18} />
                <span>Home</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="label"
                  value="Work"
                  checked={formData.label === "Work"}
                  onChange={handleInputChange}
                  className="text-green-500 focus:ring-green-500"
                />
                <Building size={18} />
                <span>Work</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="label"
                  value="Other"
                  checked={formData.label === "Other"}
                  onChange={handleInputChange}
                  className="text-green-500 focus:ring-green-500"
                />
                <MapPin size={18} />
                <span>Other</span>
              </label>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="10-digit mobile number"
                  maxLength="10"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address Line 1 *
              </label>
              <input
                type="text"
                name="line1"
                value={formData.line1}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="House No., Building Name, Road"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address Line 2
              </label>
              <input
                type="text"
                name="line2"
                value={formData.line2}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Area, Landmark (Optional)"
              />
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pincode *
                </label>
                <input
                  type="text"
                  name="postal_code"
                  value={formData.postal_code}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="6-digit pincode"
                  maxLength="6"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City *
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="City"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State *
                </label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="State"
                />
              </div>
            </div>

            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="is_default"
                  checked={formData.is_default}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-green-500 focus:ring-green-500 rounded"
                />
                <span className="text-sm text-gray-700">Set as default address</span>
              </label>
            </div>

            <div className="flex space-x-4 pt-4">
              <button
                onClick={handleSaveAddress}
                disabled={loading}
                className="flex items-center space-x-2 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
              >
                <Save size={18} />
                <span>{loading ? "Saving..." : "Save Address"}</span>
              </button>
              <button
                onClick={resetForm}
                className="flex items-center space-x-2 px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
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
          <div className="text-center py-8">
            <MapPin size={48} className="mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600 font-medium">No saved addresses yet</p>
            <p className="text-sm text-gray-500 mt-2">Add your first address to get started</p>
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg text-left">
              <p className="text-sm text-blue-800 font-medium mb-2">Debug Information:</p>
              <p className="text-xs text-blue-700">• API Endpoint: GET /v1/addresses</p>
              <p className="text-xs text-blue-700 mt-1">• Check browser console (F12) for detailed logs</p>
              <p className="text-xs text-blue-700 mt-1">• Click the Refresh button above to retry</p>
            </div>
          </div>
        ) : (
          addresses.map((address) => (
            <div
              key={address._id}
              className={`bg-white border rounded-lg p-6 ${
                address.is_default ? "border-green-500 border-2" : "border-gray-200"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    {address.tag === "home" ? (
                      <Home size={20} className="text-green-600" />
                    ) : address.tag === "work" ? (
                      <Building size={20} className="text-blue-600" />
                    ) : (
                      <MapPin size={20} className="text-gray-600" />
                    )}
                    <span className="font-semibold text-gray-800">{address.label || address.tag?.charAt(0).toUpperCase() + address.tag?.slice(1)}</span>
                    {address.is_default && (
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full flex items-center space-x-1">
                        <Check size={12} />
                        <span>Default</span>
                      </span>
                    )}
                  </div>
                  
                  <p className="text-gray-800 font-medium">{address.name}</p>
                  <p className="text-gray-600">{address.phone}</p>
                  <p className="text-gray-600 mt-2">{address.line1}</p>
                  {address.line2 && <p className="text-gray-600">{address.line2}</p>}
                  <p className="text-gray-600">
                    {address.city}, {address.state} - {address.postal_code}
                  </p>
                </div>

                <div className="flex flex-col space-y-2 ml-4">
                  {!address.is_default && (
                    <button
                      onClick={() => handleSetDefault(address._id)}
                      className="px-3 py-1 text-sm text-green-600 border border-green-600 rounded hover:bg-green-50 transition-colors"
                    >
                      Set Default
                    </button>
                  )}
                  <button
                    onClick={() => handleEditAddress(address)}
                    className="flex items-center space-x-1 px-3 py-1 text-sm text-blue-600 border border-blue-600 rounded hover:bg-blue-50 transition-colors"
                  >
                    <Edit2 size={14} />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDeleteAddress(address._id)}
                    className="flex items-center space-x-1 px-3 py-1 text-sm text-red-600 border border-red-600 rounded hover:bg-red-50 transition-colors"
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
    </div>
  );
};

export default AddressManagement;

import { Building, Check, Edit2, Home, Mail, MapPin, Phone as PhoneIcon, Plus, Tag, User, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import apiClient from "../api/axios";
import { useCart } from "../contexts/CartContext";
import { addressService, couponService, kisanCashService } from "../services";

const RazorpayCheckout = () => {
  const navigate = useNavigate();
  const { cartItems, clearCart } = useCart();
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [useNewAddress, setUseNewAddress] = useState(false);
  const [userDetails, setUserDetails] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    pincode: "",
  });
  const [orderNotes, setOrderNotes] = useState("");
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [membership, setMembership] = useState(null);
  const [membershipDiscount, setMembershipDiscount] = useState(0);
  
  // Coupon state
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [showCouponList, setShowCouponList] = useState(false);
  const [allowCouponClubbing, setAllowCouponClubbing] = useState(true); // Allow membership + coupon together
  
  // Kisan Cash state
  const [kisanCashLedger, setKisanCashLedger] = useState(null);
  const [kisanCashRedeemAmount, setKisanCashRedeemAmount] = useState(0);
  const [useKisanCash, setUseKisanCash] = useState(false);
  
  // Delivery options
  const [deliveryType, setDeliveryType] = useState("home"); // "home" or "pickup"
  const [paymentMethod, setPaymentMethod] = useState("online"); // "online" or "cod"

  useEffect(() => {
    loadSavedAddresses();
    loadMembership();
    loadAvailableCoupons();
    loadKisanCash();
  }, []);

  const loadSavedAddresses = async () => {
    try {
      const response = await addressService.getAddresses();
      console.log("📍 API Response:", response);
      
      // Handle different response formats
      const addresses = response?.data || response || [];
      console.log("📍 Parsed addresses:", addresses);
      
      if (Array.isArray(addresses) && addresses.length > 0) {
        console.log("✅ Found", addresses.length, "addresses - showing list");
        setSavedAddresses(addresses);
        setUseNewAddress(false); // Show address list
      } else {
        console.log("⚠️ No addresses in response - showing form");
        setSavedAddresses([]);
        setUseNewAddress(true);
        const storedUser = localStorage.getItem("user");
        const user = storedUser ? JSON.parse(storedUser) : null;
        setUserDetails({
          name: user?.name || "",
          phone: user?.mobile || "",
          email: user?.email || "",
          address: "",
          pincode: "",
        });
      }
    } catch (error) {
      console.error("❌ Error loading addresses:", error);
      console.error("Error details:", error.response || error.message);
      
      // If error is 401, user needs to re-login
      if (error.response?.status === 401) {
        console.error("🔒 Authentication error - please re-login");
        toast.error("Session expired. Please login again.");
      }
      
      setSavedAddresses([]);
      setUseNewAddress(true);
    }
  };

  const loadMembership = async () => {
    try {
      const storedUser = localStorage.getItem("user");
      if (!storedUser) return;
      
      const user = JSON.parse(storedUser);
      
      // ✅ FIX: Use apiClient instead of fetch for proper authentication
      const response = await apiClient.get(`/v1/membership/subscription/${user.id}`);
      const data = response.data;
      
      if (data.success && data.data) {
        setMembership(data.data);
        recalculateDiscounts(data.data);
      }
    } catch (error) {
      console.error("Error loading membership:", error);
      // If 401, user will be redirected to login by apiClient interceptor
    }
  };

  const loadAvailableCoupons = async () => {
    try {
      const storedUser = localStorage.getItem("user");
      if (!storedUser) return;
      
      const user = JSON.parse(storedUser);
      const result = await couponService.getUserCoupons(user.id);
      
      if (result.success && result.data) {
        setAvailableCoupons(result.data.filter(c => c.is_active && new Date(c.expires_at) > new Date()));
      }
    } catch (error) {
      console.error("Error loading coupons:", error);
    }
  };

  const recalculateDiscounts = (membershipData = membership) => {
    const subtotal = calculateSubtotal();
    
    // Calculate membership discount
    let memDiscount = 0;
    if (membershipData && membershipData.plan_id) {
      memDiscount = (subtotal * membershipData.plan_id.cashback_percent) / 100;
    }
    setMembershipDiscount(memDiscount);
    
    // Recalculate coupon discount on new subtotal
    if (appliedCoupon) {
      const result = couponService.calculateDiscount(
        subtotal,
        appliedCoupon.value,
        appliedCoupon.discount_type
      );
      setCouponDiscount(result.discount);
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error("Please enter a coupon code");
      return;
    }

    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      toast.error("Please login to apply coupon");
      return;
    }

    setApplyingCoupon(true);
    try {
      const user = JSON.parse(storedUser);
      const subtotal = calculateSubtotal();
      
      console.log("🎟️ Applying coupon with:", {
        code: couponCode,
        userId: user.id,
        subtotal: subtotal
      });
      
      if (!user.id) {
        toast.error("User ID not found. Please login again.");
        return;
      }
      
      const result = await couponService.applyCoupon(couponCode, user.id, subtotal);
      
      if (result.success && result.data) {
        setAppliedCoupon({
          code: couponCode.toUpperCase(),
          discount: result.data.discount,
          value: result.data.discount, // Store for recalculation
          discount_type: 'flat' // We'll get this from backend
        });
        setCouponDiscount(result.data.discount);
        toast.success(`Coupon applied! You saved ₹${result.data.discount}`);
        setCouponCode("");
        setShowCouponList(false);
      }
    } catch (error) {
      console.error("Error applying coupon:", error);
      toast.error(error.response?.data?.message || "Invalid or expired coupon code");
    } finally {
      setApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponDiscount(0);
    setCouponCode("");
    toast.info("Coupon removed");
  };

  const handleSelectCoupon = (coupon) => {
    setCouponCode(coupon.code);
    handleApplyCoupon();
  };

  const loadKisanCash = async () => {
    try {
      const storedUser = localStorage.getItem("user");
      if (!storedUser) return;
      
      const user = JSON.parse(storedUser);
      const result = await kisanCashService.getLedger(user.id);
      
      if (result.success && result.data) {
        setKisanCashLedger(result.data);
      }
    } catch (error) {
      console.error("Error loading Kisan Cash:", error);
    }
  };

  const handleApplyKisanCash = () => {
    if (!kisanCashLedger || kisanCashLedger.available <= 0) {
      toast.error("No Kisan Cash available");
      return;
    }

    const subtotal = calculateSubtotal();
    const maxRedeemable = kisanCashService.calculateMaxRedeemable(
      subtotal,
      kisanCashLedger.available
    );

    setKisanCashRedeemAmount(maxRedeemable);
    setUseKisanCash(true);
    toast.success(`₹${maxRedeemable} Kisan Cash applied!`);
  };

  const handleRemoveKisanCash = () => {
    setKisanCashRedeemAmount(0);
    setUseKisanCash(false);
    toast.info("Kisan Cash removed");
  };

  const handleAddressSelect = (address) => {
    setSelectedAddressId(address._id);
    setUseNewAddress(false);
    setUserDetails({
      name: address.name,
      phone: address.phone,
      email: address.email || "",
      address: `${address.line1}${address.line2 ? ', ' + address.line2 : ''}, ${address.city}, ${address.state}`,
      pincode: address.postal_code,
    });
  };

  const handleNewAddress = () => {
    setUseNewAddress(true);
    setSelectedAddressId(null);
    const storedUser = localStorage.getItem("user");
    const user = storedUser ? JSON.parse(storedUser) : null;
    
    setUserDetails({
      name: user?.name || "",
      phone: user?.mobile || "",
      email: user?.email || "",
      address: "",
      pincode: "",
    });
  };

  const handleSaveNewAddress = async () => {
    // Validation
    if (!userDetails.name || !userDetails.phone || !userDetails.address || !userDetails.pincode) {
      toast.error("Please fill in all required fields");
      return false;
    }

    if (userDetails.phone.length !== 10) {
      toast.error("Please enter a valid 10-digit phone number");
      return false;
    }

    if (userDetails.pincode.length !== 6) {
      toast.error("Please enter a valid 6-digit pincode");
      return false;
    }

    try {
      // Parse address into components for API
      const addressParts = userDetails.address.split(',').map(part => part.trim());
      
      const newAddress = {
        name: userDetails.name,
        phone: userDetails.phone,
        email: userDetails.email || "",
        line1: addressParts[0] || userDetails.address,
        line2: addressParts[1] || "",
        city: addressParts[2] || "City",
        state: addressParts[3] || "State",
        postal_code: userDetails.pincode,
        label: "Home",
        is_default: savedAddresses.length === 0, // First address is default
      };

      const savedAddress = await addressService.addAddress(newAddress);
      
      if (savedAddress) {
        toast.success("Address saved successfully!");
        // Reload addresses
        await loadSavedAddresses();
        setUseNewAddress(false);
        return true;
      }
    } catch (error) {
      console.error("Error saving address:", error);
      toast.error("Failed to save address. You can still proceed with checkout.");
      return true; // Allow checkout even if save fails
    }
  };

  const handleBackToHome = () => {
    navigate("/");
  };

  const calculateSubtotal = () => {
    const subtotal = cartItems.reduce((total, item) => {
      const itemPrice = parseFloat(item.variant.price) || 0;
      const quantity = parseInt(item.quantity) || 0;
      const itemTotal = itemPrice * quantity;
      
      console.log(`  Item: ${item.name || 'Unknown'}, Price: ${itemPrice}, Qty: ${quantity}, Total: ${itemTotal}`);
      
      return total + itemTotal;
    }, 0);
    
    console.log("🛒 Cart Subtotal:", subtotal);
    return subtotal;
  };

  const calculateSavings = () => {
    return cartItems.reduce((total, item) => {
      const originalPrice = parseFloat(item.variant.originalPrice);
      const currentPrice = parseFloat(item.variant.price);
      return total + (originalPrice - currentPrice) * item.quantity;
    }, 0);
  };
  
  const calculateFinalTotal = () => {
    const subtotal = calculateSubtotal();
    
    // Apply discounts based on clubbing setting
    let appliedMembershipDiscount = 0;
    let appliedCouponDiscount = 0;
    
    if (allowCouponClubbing) {
      // ✅ CLUBBING ALLOWED: Apply both membership and coupon
      appliedMembershipDiscount = membershipDiscount;
      appliedCouponDiscount = couponDiscount;
    } else {
      // ❌ CLUBBING NOT ALLOWED: Apply only the better discount
      if (membershipDiscount > 0 && couponDiscount > 0) {
        // User has both - apply only the higher one
        if (membershipDiscount >= couponDiscount) {
          appliedMembershipDiscount = membershipDiscount;
          appliedCouponDiscount = 0;
        } else {
          appliedMembershipDiscount = 0;
          appliedCouponDiscount = couponDiscount;
        }
      } else {
        // Only one discount available - apply it
        appliedMembershipDiscount = membershipDiscount;
        appliedCouponDiscount = couponDiscount;
      }
    }
    
    const total = Math.max(
      subtotal - appliedMembershipDiscount - appliedCouponDiscount - kisanCashRedeemAmount,
      0
    );
    
    console.log("💰 Calculating Final Total:");
    console.log("  - Subtotal:", subtotal);
    console.log("  - Clubbing Allowed:", allowCouponClubbing);
    console.log("  - Membership Discount:", appliedMembershipDiscount);
    console.log("  - Coupon Discount:", appliedCouponDiscount);
    console.log("  - Kisan Cash:", kisanCashRedeemAmount);
    console.log("  - Final Total:", total);
    
    return total;
  };

  const handleOrderCreation = async (razorpayResponse = null) => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      alert("Please login to place an order");
      return;
    }

    const user = JSON.parse(storedUser);
    const selectedCounter = localStorage.getItem("selectedCounter");
    const counterData = selectedCounter ? JSON.parse(selectedCounter) : null;
    
    console.log("👤 Creating order for user:", {
      user_id: user.id,
      name: user.name,
      user_type: user.user_type
    });
    
    const orderData = {
      name: userDetails.name,
      user_id: user.id,
      date: new Date().toISOString().split("T")[0],
      razorpay_payment_status: razorpayResponse ? razorpayResponse.razorpay_payment_id : null,
      transaction_id: razorpayResponse ? razorpayResponse.razorpay_order_id : null,
      products: cartItems.map((item) => ({
        product_id: item.id,
        quantity: item.quantity,
      })),
      role: user.user_type,
      order_status: "pending",
      address: deliveryType === "home" ? userDetails.address : (counterData ? counterData.address : "Store Pickup"),
      phone: userDetails.phone,
      pincode: deliveryType === "home" ? userDetails.pincode : (counterData ? counterData.pincode : ""),
      total_amount: calculateFinalTotal(),
      apply_membership: membership ? true : false,
      coupon_code: appliedCoupon ? appliedCoupon.code : null,
      coupon_discount: couponDiscount,
      kisan_cash_redeemed: kisanCashRedeemAmount,
      status: "active",
      delivery_type: deliveryType,
      payment_method: paymentMethod,
      counter_id: counterData ? counterData._id : null,
      counter_name: counterData ? counterData.type : null,
    };

    try {
      console.log("📤 Creating order with data:", orderData);
      
      const response = await apiClient.post("/order/add-order", orderData);
      
      console.log("✅ Order created successfully:", response.data);
      
      if (!response.data.success) {
        console.error("❌ Order creation failed:", response.data.message);
        throw new Error(response.data.message || "Order creation failed");
      }
      
      return response.data;
    } catch (error) {
      console.error("❌ Error creating order:", error);
      throw error;
    }
  };

  const handlePayment = async () => {
    console.log("🔍 handlePayment called");
    console.log("📋 User Details:", userDetails);
    console.log("📦 Delivery Type:", deliveryType);
    console.log("💳 Payment Method:", paymentMethod);
    
    // Validation - Check if store is required for pickup
    if (deliveryType === "pickup") {
      const selectedCounter = localStorage.getItem("selectedCounter");
      if (!selectedCounter) {
        toast.error("Please select a store for pickup");
        return;
      }
    }
    
    // Validation - Check address for home delivery
    if (deliveryType === "home") {
      // If user is adding new address, they must save it first
      if (useNewAddress) {
        toast.warning("Please save your address first by clicking 'Save Address & Continue'");
        return;
      }
      
      // Check if an address is selected
      if (!selectedAddressId && savedAddresses.length > 0) {
        toast.error("Please select a delivery address");
        return;
      }
      
      if (!userDetails.name || !userDetails.phone || !userDetails.address || !userDetails.pincode) {
        toast.error("Please fill in all required address fields");
        return;
      }
      
      if (userDetails.phone.length !== 10) {
        toast.error("Please enter a valid 10-digit phone number");
        return;
      }
      
      if (userDetails.pincode.length !== 6) {
        toast.error("Please enter a valid 6-digit pincode");
        return;
      }
    }

    // Handle COD orders (skip Razorpay)
    if (paymentMethod === "cod") {
      try {
        await handleOrderCreation();
        setPaymentSuccess(true);
        setPaymentDetails({
          method: deliveryType === "pickup" ? "Pay at Store" : "Cash on Delivery",
          amount: calculateFinalTotal()
        });
        clearCart();
        toast.success("✅ Order placed successfully!");
        return;
      } catch (error) {
        console.error("❌ COD order failed:", error);
        toast.error("Failed to place order. Please try again.");
        return;
      }
    }

    // Handle Online Payment (Razorpay)
    const finalTotal = calculateFinalTotal();
    
    // Validate amount
    if (finalTotal <= 0) {
      toast.error("Invalid order amount. Please check your cart.");
      return;
    }
    
    const amount = Math.round(finalTotal * 100); // Convert to paise

    try {
      console.log("💳 Creating Razorpay order:");
      console.log("  - Final Total (INR):", finalTotal);
      console.log("  - Amount (paise):", amount);
      
      const response = await apiClient.post("/payment/create-order", { amount });
      const orderData = response.data;

      console.log("✅ Razorpay order created:", orderData);

      if (!orderData.success) {
        toast.error("Failed to create payment order. Please try again.");
        return;
      }

      const options = {
        key: "rzp_test_lAupy84di3wKt5",
        amount: orderData.data.amount,
        currency: orderData.data.currency,
        name: "Farm Store",
        description: "Order Payment",
        order_id: orderData.data.id,
        handler: async function (response) {
          await handleOrderCreation(response);
          setPaymentDetails(response);
          setPaymentSuccess(true);
          clearCart();
          toast.success("Payment successful!");
        },
        prefill: {
          name: userDetails.name,
          email: userDetails.email,
          contact: userDetails.phone,
        },
        theme: {
          color: "#10b981",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("❌ Payment Error:", error);
      console.error("❌ Error response:", error.response?.data);
      console.error("❌ Error status:", error.response?.status);
      
      const errorMessage = error.response?.data?.message || error.message || "Payment failed. Please try again.";
      toast.error(`Payment failed: ${errorMessage}`);
    }
  };

  if (paymentSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="text-green-600" size={40} />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-3">
            Order Placed Successfully!
          </h2>
          <p className="text-gray-600 mb-6">
            Your order has been confirmed and will be processed soon.
          </p>
          {paymentDetails && (
            <div className="bg-gray-50 p-4 rounded-lg mb-6 text-left">
              <h3 className="font-semibold text-gray-700 mb-2">Order Details:</h3>
              {paymentDetails.method ? (
                <>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Payment Method:</span> {paymentDetails.method}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Amount:</span> ₹{paymentDetails.amount.toFixed(2)}
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Payment ID:</span> {paymentDetails.razorpay_payment_id}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Order ID:</span> {paymentDetails.razorpay_order_id}
                  </p>
                </>
              )}
              {deliveryType === "pickup" && (
                <div className="mt-3 p-3 bg-purple-50 border border-purple-200 rounded">
                  <p className="text-sm text-purple-800 font-medium">
                    📍 Pickup from selected store
                  </p>
                </div>
              )}
            </div>
          )}
          <div className="mt-6 space-x-3">
            <button
              className="px-6 py-3 bg-blue-500 text-white rounded text-sm font-semibold hover:bg-blue-600 transition-colors"
              onClick={handleBackToHome}
            >
              Back to Home
            </button>
            <button
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded text-sm font-semibold hover:bg-gray-300 transition-colors"
              onClick={() => navigate('/myorders')}
            >
              View Orders
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-8">
      <div className="bg-white p-6 rounded-lg shadow-md w-11/12 max-w-3xl">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Checkout
        </h1>

        {/* ========== STEP 1: DELIVERY TYPE SELECTION ========== */}
        <div className="mb-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-lg">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            📦 How would you like to receive your order?
          </h3>
          <div className="space-y-2">
            <label className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
              deliveryType === "home" 
                ? 'border-green-500 bg-green-50' 
                : 'border-gray-300 hover:border-green-300 bg-white'
            }`}>
              <input
                type="radio"
                name="deliveryType"
                value="home"
                checked={deliveryType === "home"}
                onChange={(e) => setDeliveryType(e.target.value)}
                className="mr-3"
              />
              <div className="flex-1">
                <div className="font-medium text-sm">🏠 Home Delivery</div>
                <div className="text-xs text-gray-600">Get products delivered to your address</div>
              </div>
              {deliveryType === "home" && (
                <Check className="text-green-600" size={20} />
              )}
            </label>
            <label className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
              deliveryType === "pickup" 
                ? 'border-purple-500 bg-purple-50' 
                : 'border-gray-300 hover:border-purple-300 bg-white'
            }`}>
              <input
                type="radio"
                name="deliveryType"
                value="pickup"
                checked={deliveryType === "pickup"}
                onChange={(e) => setDeliveryType(e.target.value)}
                className="mr-3"
              />
              <div className="flex-1">
                <div className="font-medium text-sm">🏪 Store Pickup</div>
                <div className="text-xs text-gray-600">Collect from selected store</div>
              </div>
              {deliveryType === "pickup" && (
                <Check className="text-purple-600" size={20} />
              )}
            </label>
          </div>
        </div>

        {/* ========== STEP 2A: HOME DELIVERY SECTIONS ========== */}
        {deliveryType === "home" && (
          <>
            {/* Selected Address Summary */}
            {selectedAddressId && !useNewAddress && (
              <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-green-50 border-2 border-blue-200 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-700 flex items-center">
                    <User size={16} className="mr-2 text-blue-600" />
                    Delivery Details
                  </h3>
                  <button
                    onClick={() => {
                      setSelectedAddressId(null);
                      setUseNewAddress(false);
                    }}
                    className="flex items-center text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors"
                  >
                    <Edit2 size={12} className="mr-1" />
                    Change Address
                  </button>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <User size={14} className="mr-2 text-gray-500" />
                    <span className="font-medium text-gray-800">{userDetails.name}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <PhoneIcon size={14} className="mr-2 text-gray-500" />
                    <span className="text-gray-700">{userDetails.phone}</span>
                  </div>
                  {userDetails.email && (
                    <div className="flex items-center text-sm">
                      <Mail size={14} className="mr-2 text-gray-500" />
                      <span className="text-gray-700">{userDetails.email}</span>
                    </div>
                  )}
                  <div className="flex items-start text-sm">
                    <MapPin size={14} className="mr-2 text-gray-500 mt-0.5" />
                    <span className="text-gray-700">{userDetails.address} - {userDetails.pincode}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Saved Addresses List - Show if has addresses and not adding new */}
            {savedAddresses.length > 0 && !useNewAddress && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-semibold text-gray-800">Select Delivery Address</h2>
                  <button
                    onClick={handleNewAddress}
                    className="flex items-center space-x-1 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    title="Add New Address"
                  >
                    <Plus size={18} />
                    <span className="text-sm font-medium">New</span>
                  </button>
                </div>
                <div className="space-y-3">
                  {savedAddresses.map((address) => (
                    <div
                      key={address._id}
                      onClick={() => handleAddressSelect(address)}
                      className="border rounded-lg p-4 cursor-pointer transition-all hover:border-green-500 hover:bg-green-50"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 flex-1">
                          {address.label === "Home" ? (
                            <Home size={18} className="text-green-600 mt-1" />
                          ) : address.label === "Work" ? (
                            <Building size={18} className="text-blue-600 mt-1" />
                          ) : (
                            <MapPin size={18} className="text-gray-600 mt-1" />
                          )}
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-semibold text-gray-800">{address.label}</span>
                              {address.is_default && (
                                <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded font-medium">
                                  ✓ Default
                                </span>
                              )}
                            </div>
                            <p className="text-sm font-medium text-gray-800 mt-1">{address.name}</p>
                            <p className="text-sm text-gray-600">{address.phone}</p>
                            <p className="text-sm text-gray-600 mt-1">
                              {address.line1}{address.line2 && `, ${address.line2}`}, {address.city}, {address.state} - {address.postal_code}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* New Address Form - Show when user clicks Add New */}
            {useNewAddress && (
              <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-semibold text-gray-800">
                    {savedAddresses.length === 0 ? "Enter Delivery Address" : "Add New Address"}
                  </h2>
                  {savedAddresses.length > 0 && (
                    <button
                      onClick={() => {
                        setUseNewAddress(false);
                        if (savedAddresses.length > 0) {
                          const defaultAddress = savedAddresses.find((addr) => addr.is_default);
                          if (defaultAddress) {
                            handleAddressSelect(defaultAddress);
                          }
                        }
                      }}
                      className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Use Saved Address
                    </button>
                  )}
                </div>
                <div className="space-y-3">
                  <div className="relative">
                    <User size={16} className="absolute left-3 top-3.5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Your Name *"
                      className="w-full p-3 pl-10 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                      value={userDetails.name}
                      onChange={(e) =>
                        setUserDetails({ ...userDetails, name: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="relative">
                    <PhoneIcon size={16} className="absolute left-3 top-3.5 text-gray-400" />
                    <input
                      type="tel"
                      placeholder="Phone Number (10 digits) *"
                      maxLength="10"
                      className="w-full p-3 pl-10 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                      value={userDetails.phone}
                      onChange={(e) =>
                        setUserDetails({ ...userDetails, phone: e.target.value.replace(/\D/g, '') })
                      }
                      required
                    />
                  </div>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-3.5 text-gray-400" />
                    <input
                      type="email"
                      placeholder="Email Address"
                      className="w-full p-3 pl-10 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                      value={userDetails.email}
                      onChange={(e) =>
                        setUserDetails({ ...userDetails, email: e.target.value })
                      }
                    />
                  </div>
                  <div className="relative">
                    <MapPin size={16} className="absolute left-3 top-3.5 text-gray-400" />
                    <textarea
                      placeholder="Complete Address (House No., Building, Street, Area, City, State) *"
                      className="w-full p-3 pl-10 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                      rows="3"
                      value={userDetails.address}
                      onChange={(e) =>
                        setUserDetails({ ...userDetails, address: e.target.value })
                      }
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1 ml-1">
                      Format: House No, Street, Area, City, State (comma-separated)
                    </p>
                  </div>
                  <div className="relative">
                    <MapPin size={16} className="absolute left-3 top-3.5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Pincode (6 digits) *"
                      maxLength="6"
                      className="w-full p-3 pl-10 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                      value={userDetails.pincode}
                      onChange={(e) =>
                        setUserDetails({ ...userDetails, pincode: e.target.value.replace(/\D/g, '') })
                      }
                      required
                    />
                  </div>

                  {/* Save Address Button */}
                  <div className="pt-3 border-t border-gray-300">
                    <button
                      type="button"
                      onClick={handleSaveNewAddress}
                      className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                    >
                      <Check size={18} />
                      <span>Save Address & Continue</span>
                    </button>
                    <p className="text-xs text-gray-500 mt-2 text-center">
                      This address will be saved to your account for future orders
                    </p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* ========== STEP 2B: STORE PICKUP SECTIONS ========== */}
        {deliveryType === "pickup" && (
          <>
            {(() => {
              const selectedCounter = localStorage.getItem("selectedCounter");
              
              if (selectedCounter) {
                try {
                  const counter = JSON.parse(selectedCounter);
                  return (
                    <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-semibold text-gray-700 flex items-center">
                          <Building size={16} className="mr-2 text-purple-600" />
                          Pickup Store Details
                        </h3>
                        <button
                          onClick={() => navigate('/locate')}
                          className="flex items-center text-xs text-purple-600 hover:text-purple-800 font-medium transition-colors"
                        >
                          <Edit2 size={12} className="mr-1" />
                          Change Store
                        </button>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center text-sm">
                          <Building size={14} className="mr-2 text-gray-500" />
                          <span className="font-medium text-gray-800">{counter.type}</span>
                        </div>
                        {counter.pincode && (
                          <div className="flex items-center text-sm">
                            <MapPin size={14} className="mr-2 text-gray-500" />
                            <span className="text-gray-700">Pincode: {counter.pincode}</span>
                          </div>
                        )}
                        {counter.agentName && (
                          <div className="flex items-center text-sm">
                            <User size={14} className="mr-2 text-gray-500" />
                            <span className="text-gray-700">Agent: {counter.agentName}</span>
                          </div>
                        )}
                        {counter.agentNumber && (
                          <div className="flex items-center text-sm">
                            <PhoneIcon size={14} className="mr-2 text-gray-500" />
                            <span className="text-gray-700">{counter.agentNumber}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                } catch (e) {
                  return null;
                }
              } else {
                // No store selected - show warning
                return (
                  <div className="mb-6 p-4 bg-yellow-50 border-2 border-yellow-300 rounded-lg">
                    <div className="flex items-start">
                      <MapPin size={16} className="mr-2 text-yellow-600 mt-0.5" />
                      <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-1">
                          ⚠️ Store Not Selected
                        </h3>
                        <p className="text-xs text-gray-600 mb-3">
                          Please select a store to proceed with pickup
                        </p>
                        <button
                          onClick={() => navigate('/locate')}
                          className="text-xs px-3 py-1.5 bg-purple-600 text-white rounded hover:bg-purple-700 font-medium"
                        >
                          Select Store Now
                        </button>
                      </div>
                    </div>
                  </div>
                );
              }
            })()}
          </>
        )}

        {/* ========== STEP 3: PAYMENT METHOD ========== */}
        <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            💳 Payment Method
          </h3>
          <div className="space-y-2">
            <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-white transition-colors">
              <input
                type="radio"
                name="paymentMethod"
                value="online"
                checked={paymentMethod === "online"}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="mr-3"
              />
              <div>
                <div className="font-medium text-sm">Pay Online</div>
                <div className="text-xs text-gray-600">Pay now using UPI, Card, Net Banking</div>
              </div>
            </label>
            <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-white transition-colors">
              <input
                type="radio"
                name="paymentMethod"
                value="cod"
                checked={paymentMethod === "cod"}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="mr-3"
              />
              <div>
                <div className="font-medium text-sm">
                  {deliveryType === "pickup" ? "💵 Pay at Store" : "💵 Cash on Delivery"}
                </div>
                <div className="text-xs text-gray-600">
                  {deliveryType === "pickup" ? "Pay when you collect" : "Pay when order is delivered"}
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* ========== STEP 4: ORDER SUMMARY ========== */}
        <textarea
          placeholder="Add order notes (optional)"
          className="w-full p-2 border rounded text-sm mb-4"
          rows="3"
          value={orderNotes}
          onChange={(e) => setOrderNotes(e.target.value)}
        />

        {/* ========== KISAN CASH SECTION ========== */}
        {kisanCashLedger && kisanCashLedger.available > 0 && membership && (
          <div className="mb-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
              <span className="text-lg mr-2">💰</span>
              Kisan Cash Credits
            </h3>
            
            {useKisanCash ? (
              <div className="bg-white border-2 border-green-500 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Check className="text-green-600" size={20} />
                    <div>
                      <p className="text-sm font-bold text-green-800">
                        Kisan Cash Applied
                      </p>
                      <p className="text-xs text-green-600">
                        You're using ₹{kisanCashRedeemAmount.toFixed(2)} credits
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleRemoveKisanCash}
                    className="text-red-500 hover:text-red-700"
                    title="Remove Kisan Cash"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white border border-green-300 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Available Balance</p>
                    <p className="text-xl font-bold text-green-600">
                      ₹{kisanCashLedger.available.toFixed(2)}
                    </p>
                  </div>
                  <button
                    onClick={handleApplyKisanCash}
                    className="px-4 py-2 bg-green-600 text-white rounded text-sm font-medium hover:bg-green-700"
                  >
                    Use Credits
                  </button>
                </div>
                <p className="text-xs text-gray-600">
                  💡 You can use up to 50% of your order value
                </p>
              </div>
            )}
          </div>
        )}

        {/* ========== COUPON SECTION ========== */}
        <div className="mb-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-700 flex items-center">
              <Tag size={16} className="mr-2 text-purple-600" />
              Apply Coupon Code
            </h3>
            
            {/* Coupon Clubbing Toggle - Only show if user has membership */}
            {membership && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-600">Club with membership</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={allowCouponClubbing}
                    onChange={(e) => setAllowCouponClubbing(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>
            )}
          </div>
          
          {/* Clubbing Info Message */}
          {membership && !allowCouponClubbing && appliedCoupon && (
            <div className="mb-3 p-2 bg-yellow-50 border border-yellow-300 rounded text-xs text-yellow-800">
              ⚠️ Clubbing disabled: Only the {membershipDiscount >= couponDiscount ? 'membership discount' : 'coupon discount'} will apply
            </div>
          )}
          
          {/* Applied Coupon Display */}
          {appliedCoupon ? (
            <div className="bg-white border-2 border-green-500 rounded-lg p-3 mb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Check className="text-green-600" size={20} />
                  <div>
                    <p className="text-sm font-bold text-green-800">{appliedCoupon.code}</p>
                    <p className="text-xs text-green-600">You saved ₹{couponDiscount.toFixed(2)}</p>
                  </div>
                </div>
                <button
                  onClick={handleRemoveCoupon}
                  className="text-red-500 hover:text-red-700"
                  title="Remove Coupon"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Coupon Input */}
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  placeholder="Enter coupon code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  className="flex-1 p-2 border rounded text-sm uppercase"
                  disabled={applyingCoupon}
                />
                <button
                  onClick={handleApplyCoupon}
                  disabled={applyingCoupon || !couponCode.trim()}
                  className="px-4 py-2 bg-purple-600 text-white rounded text-sm font-medium hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {applyingCoupon ? "Applying..." : "Apply"}
                </button>
              </div>

              {/* Available Coupons */}
              {availableCoupons.length > 0 && (
                <div>
                  <button
                    onClick={() => setShowCouponList(!showCouponList)}
                    className="text-xs text-purple-600 hover:text-purple-800 font-medium mb-2"
                  >
                    {showCouponList ? "Hide" : "View"} Available Coupons ({availableCoupons.length})
                  </button>
                  
                  {showCouponList && (
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {availableCoupons.map((coupon) => (
                        <div
                          key={coupon._id}
                          className="bg-white border border-purple-300 rounded p-2 hover:border-purple-500 cursor-pointer"
                          onClick={() => handleSelectCoupon(coupon)}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-xs font-bold text-purple-800">{coupon.code}</p>
                              <p className="text-xs text-gray-600">
                                {coupon.discount_type === "percent" 
                                  ? `${coupon.value}% OFF` 
                                  : `₹${coupon.value} OFF`}
                                {coupon.min_order > 0 && ` on orders above ₹${coupon.min_order}`}
                              </p>
                            </div>
                            <span className="text-xs text-purple-600 font-medium">APPLY</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span>Items Total</span>
            <span>₹{calculateSubtotal().toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm text-green-600">
            <span>Total Savings</span>
            <span>₹{calculateSavings().toFixed(2)}</span>
          </div>
          
          {/* Membership Discount */}
          {membership && membershipDiscount > 0 && (
            <>
              <div className="flex justify-between text-sm font-medium border-t border-gray-200 pt-2">
                <span>Subtotal</span>
                <span>₹{calculateSubtotal().toFixed(2)}</span>
              </div>
              <div className={`border rounded-lg p-3 my-2 ${
                !allowCouponClubbing && couponDiscount > 0 && membershipDiscount < couponDiscount
                  ? 'bg-gray-100 border-gray-300 opacity-60'
                  : 'bg-yellow-50 border-yellow-300'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🌟</span>
                    <div>
                      <p className={`text-sm font-semibold ${
                        !allowCouponClubbing && couponDiscount > 0 && membershipDiscount < couponDiscount
                          ? 'text-gray-600 line-through'
                          : 'text-yellow-800'
                      }`}>
                        {membership.plan_id?.name} Membership
                        {!allowCouponClubbing && couponDiscount > 0 && membershipDiscount < couponDiscount && ' (Not Applied)'}
                      </p>
                      <p className={`text-xs ${
                        !allowCouponClubbing && couponDiscount > 0 && membershipDiscount < couponDiscount
                          ? 'text-gray-500'
                          : 'text-yellow-700'
                      }`}>
                        {membership.plan_id?.cashback_percent}% discount
                        {!allowCouponClubbing && couponDiscount > 0 && membershipDiscount < couponDiscount && ' - Coupon has better value'}
                      </p>
                    </div>
                  </div>
                  <span className={`text-sm font-bold ${
                    !allowCouponClubbing && couponDiscount > 0 && membershipDiscount < couponDiscount
                      ? 'text-gray-600 line-through'
                      : 'text-yellow-800'
                  }`}>
                    -₹{membershipDiscount.toFixed(2)}
                  </span>
                </div>
              </div>
            </>
          )}

          {/* Message for Non-Members - Encourage Subscription */}
          {!membership && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-lg p-3 my-2">
              <div className="flex items-start gap-2">
                <span className="text-2xl">🎁</span>
                <div className="flex-1">
                  <p className="text-sm font-bold text-blue-900 mb-1">
                    💰 Save More with Membership!
                  </p>
                  <p className="text-xs text-blue-700 mb-2">
                    Get <span className="font-bold text-blue-900">10% OFF</span> on this order and every future order!
                  </p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-blue-600">
                        Your savings: <span className="font-bold text-green-600">₹{(calculateSubtotal() * 0.10).toFixed(2)}</span>
                      </p>
                    </div>
                    <button
                      onClick={() => window.location.href = '/membership'}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors"
                    >
                      Subscribe Now →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Coupon Discount */}
          {appliedCoupon && couponDiscount > 0 && (
            <div className={`border rounded-lg p-3 my-2 ${
              !allowCouponClubbing && membershipDiscount > 0 && couponDiscount < membershipDiscount
                ? 'bg-gray-100 border-gray-300 opacity-60'
                : 'bg-purple-50 border-purple-300'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Tag size={16} className={
                    !allowCouponClubbing && membershipDiscount > 0 && couponDiscount < membershipDiscount
                      ? 'text-gray-500'
                      : 'text-purple-600'
                  } />
                  <div>
                    <p className={`text-sm font-semibold ${
                      !allowCouponClubbing && membershipDiscount > 0 && couponDiscount < membershipDiscount
                        ? 'text-gray-600 line-through'
                        : 'text-purple-800'
                    }`}>
                      Coupon {appliedCoupon.code}
                      {!allowCouponClubbing && membershipDiscount > 0 && couponDiscount < membershipDiscount && ' (Not Applied)'}
                    </p>
                    {!allowCouponClubbing && membershipDiscount > 0 && couponDiscount < membershipDiscount && (
                      <p className="text-xs text-gray-500">Membership has better value</p>
                    )}
                  </div>
                </div>
                <span className={`text-sm font-bold ${
                  !allowCouponClubbing && membershipDiscount > 0 && couponDiscount < membershipDiscount
                    ? 'text-gray-600 line-through'
                    : 'text-purple-800'
                }`}>
                  -₹{couponDiscount.toFixed(2)}
                </span>
              </div>
            </div>
          )}

          {/* Kisan Cash Discount */}
          {useKisanCash && kisanCashRedeemAmount > 0 && (
            <div className="bg-green-50 border border-green-300 rounded-lg p-3 my-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">💰</span>
                  <div>
                    <p className="text-sm font-semibold text-green-800">
                      Kisan Cash Redeemed
                    </p>
                    <p className="text-xs text-green-600">
                      Credits used from your balance
                    </p>
                  </div>
                </div>
                <span className="text-sm font-bold text-green-800">
                  -₹{kisanCashRedeemAmount.toFixed(2)}
                </span>
              </div>
            </div>
          )}
          
          <div className="flex justify-between text-lg font-bold border-t border-gray-300 pt-2">
            <span>Total Amount</span>
            <span className="text-green-600">₹{calculateFinalTotal().toFixed(2)}</span>
          </div>
        </div>

        {/* ========== STEP 5: CHECKOUT BUTTON ========== */}
        <button
          className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white p-3 rounded-lg text-lg font-semibold hover:from-green-600 hover:to-green-700 transition-all shadow-lg"
          onClick={handlePayment}
        >
          {paymentMethod === "online" 
            ? `Pay ₹${calculateFinalTotal().toFixed(2)}` 
            : `Place Order - ${deliveryType === "pickup" ? "Pay at Store" : "COD"}`}
        </button>
      </div>
    </div>
  );
};

export default RazorpayCheckout;

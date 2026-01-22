import React, { useState, useEffect } from "react";
import axios from "axios";
import apiClient from "../api/axios";
import { useNavigate } from "react-router-dom";
import BASE_URL from "../Helper/Helper";
import { toast } from "react-toastify";

const Membership = () => {
  const [plans, setPlans] = useState([]);
  const [mySubscription, setMySubscription] = useState(null);
  const [loading, setLoading] = useState(false);
  const [processingPlanId, setProcessingPlanId] = useState(null); // Track which plan is being processed
  const navigate = useNavigate();
  
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  
  // Fetch plans
  useEffect(() => {
    fetchPlans();
    if (user.id) {
      fetchMySubscription();
    }
  }, []);
  
  const fetchPlans = async () => {
    try {
      console.log("📋 Fetching membership plans...");
      const response = await apiClient.get("/v1/membership/plans");
      console.log("✅ Plans fetched:", response.data);
      setPlans(response.data.data || []);
    } catch (error) {
      console.error("❌ Error fetching plans:", error);
    }
  };
  
  const fetchMySubscription = async () => {
    try {
      console.log("📋 Fetching user subscription for:", user.id);
      const response = await apiClient.get(`/v1/membership/subscription/${user.id}`);
      
      console.log("✅ Subscription response:", response.data);
      
      if (response.data.success) {
        setMySubscription(response.data.data);
      }
    } catch (error) {
      console.error("❌ Error fetching subscription:", error.response?.data || error.message);
      // No active subscription or error
      if (error.response?.status === 403) {
        // User type not allowed
        toast.error(error.response.data.message);
      }
      setMySubscription(null);
    }
  };
  
  const handleSubscribe = async (planId) => {
    if (!user.id) {
      toast.error("Please login to subscribe");
      navigate("/login");
      return;
    }
    
    // Prevent multiple simultaneous subscriptions
    if (processingPlanId) {
      console.log("⚠️ Already processing a subscription");
      return;
    }
    
    // Memberships available for all user types
    console.log("✅ Membership subscription for user type:", user.user_type);
    
    setLoading(true);
    setProcessingPlanId(planId); // Set which plan is being processed
    
    try {
      // Get plan details for payment
      const plan = plans.find(p => p._id === planId);
      if (!plan) {
        toast.error("Plan not found");
        setLoading(false);
        return;
      }
      
      // Step 1: Create Razorpay order (using apiClient for auto token refresh)
      const orderResponse = await apiClient.post(
        "/v1/membership/create-payment-order",
        { plan_id: planId }
      );
      
      if (!orderResponse.data.success) {
        toast.error(orderResponse.data.message || "Failed to create order");
        setLoading(false);
        setProcessingPlanId(null);
        return;
      }
      
      const { order_id, amount, currency, plan_name, total_amount } = orderResponse.data.data;
      
      // Step 2: Open Razorpay payment modal
      const options = {
        key: "rzp_test_lAupy84di3wKt5",
        amount: amount,
        currency: currency,
        name: "Farm-E Store",
        description: `${plan_name} Membership`,
        order_id: order_id,
        handler: async function (response) {
          // Step 3: Payment successful, verify and create subscription
          try {
            const verifyResponse = await apiClient.post(
              "/v1/membership/verify-payment",
              {
                plan_id: planId,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              }
            );
            
            if (verifyResponse.data.success) {
              toast.success(`🎉 ${verifyResponse.data.message}`);
              fetchMySubscription();
              setLoading(false);
              setProcessingPlanId(null);
            } else {
              toast.error(verifyResponse.data.message || "Subscription failed");
              setLoading(false);
              setProcessingPlanId(null);
            }
          } catch (error) {
            console.error("Payment verification error:", error);
            toast.error(error.response?.data?.message || "Payment verification failed");
            setLoading(false);
            setProcessingPlanId(null);
          }
        },
        prefill: {
          name: user.name || "",
          email: user.email || "",
          contact: user.mobile || ""
        },
        notes: {
          user_id: user.id,
          plan_name: plan_name
        },
        theme: {
          color: "#22c55e"
        },
        modal: {
          ondismiss: function() {
            setLoading(false);
            setProcessingPlanId(null);
            toast.info("Payment cancelled");
          }
        }
      };
      
      // Check if Razorpay is loaded
      if (typeof window.Razorpay === "undefined") {
        toast.error("Payment gateway not loaded. Please refresh the page.");
        setLoading(false);
        setProcessingPlanId(null);
        return;
      }
      
      const razorpay = new window.Razorpay(options);
      razorpay.open();
      
    } catch (error) {
      console.error("Subscription error:", error);
      const errorMsg = error.response?.data?.message || "Failed to initiate payment";
      toast.error(errorMsg);
      setLoading(false);
      setProcessingPlanId(null);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Membership Plans
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            <span className="inline-block bg-green-100 text-green-800 px-4 py-1 rounded-full font-semibold mb-2">
              🌾 Exclusive for Farmers
            </span>
            <br />
            Get instant discounts on every purchase and earn Kisan Cash!
          </p>
        </div>
        
        {/* User Type Warning for Non-Farmers */}
        {user.id && user.user_type !== "Farmer" && (
          <div className="max-w-2xl mx-auto mb-8 bg-yellow-50 border-2 border-yellow-400 rounded-lg p-4">
            <p className="text-yellow-800 text-center font-semibold">
              ⚠️ Memberships are only available for Farmer accounts. 
              Your account type: {user.user_type}
            </p>
          </div>
        )}
        
        {/* My Active Subscription */}
        {mySubscription && (
          <div className="max-w-4xl mx-auto mb-12 bg-gradient-to-r from-green-50 to-green-100 border-2 border-green-500 rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-green-800 mb-2">
                  ✓ Your Active Membership
                </h3>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <p className="text-gray-700 font-semibold">Plan:</p>
                    <p className="text-xl text-green-800">{mySubscription.plan_id.name}</p>
                  </div>
                  <div>
                    <p className="text-gray-700 font-semibold">Discount:</p>
                    <p className="text-xl text-green-800">{mySubscription.plan_id.cashback_percent}% off</p>
                  </div>
                  <div>
                    <p className="text-gray-700 font-semibold">Purchases Left:</p>
                    <p className="text-xl text-green-800 font-bold">{mySubscription.purchases_left}</p>
                  </div>
                  <div>
                    <p className="text-gray-700 font-semibold">Expires On:</p>
                    <p className="text-xl text-green-800">
                      {new Date(mySubscription.expires_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
              <div className="text-6xl">🎉</div>
            </div>
          </div>
        )}
        
        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map(plan => {
            const isRecommended = plan.name === "Gold";
            
            return (
              <div 
                key={plan._id}
                className={`relative bg-white rounded-2xl shadow-xl overflow-hidden transition-transform hover:scale-105 ${
                  isRecommended ? "border-4 border-green-500" : "border-2 border-gray-200"
                }`}
              >
                {isRecommended && (
                  <div className="absolute top-0 right-0 bg-green-500 text-white px-4 py-1 text-sm font-bold">
                    POPULAR
                  </div>
                )}
                
                <div className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <div className="mb-6">
                    <span className="text-5xl font-bold text-green-600">₹{plan.price}</span>
                    <span className="text-gray-600 ml-2">+ GST</span>
                  </div>
                  
                  <ul className="space-y-4 mb-8">
                    <li className="flex items-start">
                      <span className="text-green-500 font-bold text-xl mr-2">✓</span>
                      <span className="text-gray-700">
                        <strong>{plan.cashback_percent}%</strong> instant discount on every order
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 font-bold text-xl mr-2">✓</span>
                      <span className="text-gray-700">
                        Valid for <strong>{plan.validity_purchases}</strong> purchases
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 font-bold text-xl mr-2">✓</span>
                      <span className="text-gray-700">
                        <strong>{plan.validity_days}</strong> days validity
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 font-bold text-xl mr-2">✓</span>
                      <span className="text-gray-700">
                        Earn <strong>Kisan Cash</strong> on every purchase
                      </span>
                    </li>
                  </ul>
                  
                  <button
                    onClick={() => handleSubscribe(plan._id)}
                    disabled={processingPlanId !== null || mySubscription || user.user_type !== "Farmer"}
                    className={`w-full py-4 px-6 rounded-lg font-bold text-lg transition-colors ${
                      mySubscription && mySubscription.plan_id?._id === plan._id
                        ? "bg-green-500 text-white cursor-not-allowed"
                        : mySubscription
                        ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                        : user.user_type !== "Farmer"
                        ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                        : processingPlanId !== null
                        ? "bg-gray-400 text-white cursor-not-allowed"
                        : isRecommended
                        ? "bg-green-600 text-white hover:bg-green-700"
                        : "bg-green-500 text-white hover:bg-green-600"
                    }`}
                  >
                    {mySubscription && mySubscription.plan_id?._id === plan._id
                      ? "✓ Your Current Plan" 
                      : mySubscription
                      ? "Already Subscribed to Another Plan"
                      : user.user_type !== "Farmer"
                      ? "Farmers Only"
                      : processingPlanId === plan._id
                      ? "Processing..." 
                      : processingPlanId !== null
                      ? "Please Wait..."
                      : "Subscribe Now"}
                  </button>
                  
                  {!user.id && (
                    <p className="text-center text-sm text-gray-500 mt-3">
                      Please login to subscribe
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Benefits Section */}
        <div className="mt-16 max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
            Why Choose Membership?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start">
              <span className="text-4xl mr-4">💰</span>
              <div>
                <h4 className="font-bold text-lg text-gray-900 mb-1">Instant Savings</h4>
                <p className="text-gray-600">Get discount applied automatically at checkout</p>
              </div>
            </div>
            <div className="flex items-start">
              <span className="text-4xl mr-4">🎁</span>
              <div>
                <h4 className="font-bold text-lg text-gray-900 mb-1">Earn Rewards</h4>
                <p className="text-gray-600">Accumulate Kisan Cash with every purchase</p>
              </div>
            </div>
            <div className="flex items-start">
              <span className="text-4xl mr-4">🔒</span>
              <div>
                <h4 className="font-bold text-lg text-gray-900 mb-1">Secure & Trusted</h4>
                <p className="text-gray-600">Only for verified Farmer accounts</p>
              </div>
            </div>
            <div className="flex items-start">
              <span className="text-4xl mr-4">⚡</span>
              <div>
                <h4 className="font-bold text-lg text-gray-900 mb-1">Flexible Plans</h4>
                <p className="text-gray-600">Choose based on your purchase frequency</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* FAQ Section */}
        <div className="mt-12 max-w-2xl mx-auto text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h3>
          <div className="text-left space-y-4 bg-white rounded-lg shadow p-6">
            <div>
              <p className="font-semibold text-gray-900">Q: Who can subscribe?</p>
              <p className="text-gray-600 mt-1">A: Only Farmer accounts can subscribe to memberships.</p>
            </div>
            <div>
              <p className="font-semibold text-gray-900">Q: How does the discount work?</p>
              <p className="text-gray-600 mt-1">A: The discount is automatically applied at checkout when you have an active membership.</p>
            </div>
            <div>
              <p className="font-semibold text-gray-900">Q: What happens when I run out of purchases?</p>
              <p className="text-gray-600 mt-1">A: Your membership expires and you can purchase a new plan.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Membership;

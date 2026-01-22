import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Package, Calendar, MapPin, CreditCard, ShoppingCart, Filter, Search, X, ArrowLeft, Undo2, AlertCircle } from "lucide-react";
import BASE_URL from "../Helper/Helper";
import apiClient from "../api/axios";
import { orderService } from "../services/orderService";

const OrderCard = ({ order, onReturnRequest }) => {
  const [productDetails, setProductDetails] = useState({});
  const [showReturnDialog, setShowReturnDialog] = useState(false);
  const [returnReason, setReturnReason] = useState("");
  const [returnDetails, setReturnDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchProductDetails = async () => {
      const details = {};
      for (const product of order.products) {
        try {
          const response = await apiClient.get(`/product/get-id-product/${product.product_id}`);
          details[product.product_id] = response.data;
        } catch (error) {
          console.error("Error fetching product details:", error);
        }
      }
      setProductDetails(details);
    };

    fetchProductDetails();
  }, [order.products]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const getStatusColor = (status) => {
    if (!status) return 'bg-gray-100 text-gray-800'; // Default color for undefined status
    
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getReturnStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-blue-100 text-blue-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const canRequestReturn = () => {
    // Can request return if:
    // 1. Order is delivered
    // 2. No return already requested
    // 3. Within 7 days of delivery (if delivered_at exists)
    
    // Debug: Log order status
    console.log("🔍 Order status check:", {
      orderId: order._id,
      order_status: order.order_status,
      return_requested: order.return_requested,
      delivered_at: order.delivered_at
    });
    
    // Check if order status is delivered (case-insensitive)
    const isDelivered = order.order_status?.toLowerCase() === 'delivered';
    if (!isDelivered) {
      console.log("❌ Order not delivered:", order.order_status);
      return false;
    }
    
    if (order.return_requested) {
      console.log("❌ Return already requested");
      return false;
    }
    
    if (order.delivered_at) {
      const daysSince = Math.floor((new Date() - new Date(order.delivered_at)) / (1000 * 60 * 60 * 24));
      console.log("📅 Days since delivery:", daysSince);
      if (daysSince > 7) {
        console.log("❌ Return window expired");
        return false;
      }
    } else {
      // If no delivered_at date, allow return anyway (for testing)
      console.log("⚠️ No delivered_at date, allowing return");
    }
    
    console.log("✅ Can request return!");
    return true;
  };

  const handleReturnRequest = async () => {
    if (!returnReason || !returnDetails.trim()) {
      alert("Please select a reason and provide details for the return");
      return;
    }

    try {
      setSubmitting(true);
      await orderService.requestReturn(order._id, {
        return_reason: returnReason,
        return_reason_details: returnDetails,
        return_images: [], // Can be enhanced to include image uploads
      });
      
      alert("Return request submitted successfully! We'll review it and get back to you.");
      setShowReturnDialog(false);
      if (onReturnRequest) onReturnRequest();
    } catch (error) {
      console.error("Error submitting return request:", error);
      alert(error.response?.data?.message || "Failed to submit return request");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-6 transition-all duration-300 hover:shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-3">
          <Calendar className="text-gray-500" size={20} />
          <span className="text-sm text-gray-600">
            {new Date(order.date).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })}
          </span>
        </div>
        <div className="flex gap-2 items-center">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.order_status)}`}>
            {order.order_status || 'PENDING'}
          </span>
          {/* Debug: Show if eligible for return */}
          {canRequestReturn() && (
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              ✓ Can Return
            </span>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <MapPin className="text-gray-500" size={20} />
            <p className="text-sm text-gray-700">{order.address}</p>
          </div>
          <div className="flex items-center space-x-3">
            <CreditCard className="text-gray-500" size={20} />
            <p className="text-sm text-gray-700">
              Pincode: {order.pincode} | Phone: {order.phone}
            </p>
          </div>
        </div>
        <div className="flex justify-end items-center">
          <div className="text-right">
            <div className="flex items-center justify-end space-x-2 mb-2">
              <ShoppingCart className="text-gray-500" size={20} />
              <span className="text-lg font-bold text-gray-800">
                {formatCurrency(order.total_amount)}
              </span>
            </div>
            <p className="text-sm text-gray-500">Transaction ID: {order.transaction_id}</p>
          </div>
        </div>
      </div>

      <div className="border-t pt-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
          <Package className="mr-2 text-gray-500" size={20} />
          Products ordered
        </h4>
        <div className="grid gap-4">
          {order.products && order.products.length > 0 ? (
            order.products.map((product) => (
              <div 
                key={product._id} 
                className="bg-gray-50 rounded-md p-4 flex items-center gap-4"
              >
                {productDetails[product.product_id]?.imageUrl && (
                  <img 
                    src={productDetails[product.product_id].imageUrl} 
                    alt={productDetails[product.product_id]?.title || 'Product'} 
                    className="w-20 h-20 object-contain rounded-md"
                  />
                )}
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-gray-800">
                    {productDetails[product.product_id]?.title || 'Loading...'}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {productDetails[product.product_id]?.sub_title || ''}
                  </p>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-sm font-medium text-gray-600">
                      Quantity: {product.quantity}
                    </span>
                    {productDetails[product.product_id]?.sell_price && (
                      <span className="text-sm font-bold text-gray-800">
                        {formatCurrency(productDetails[product.product_id].sell_price * product.quantity)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-500 py-2">
              No products found in this order
            </div>
          )}
        </div>
      </div>

      {/* Return Status & Actions */}
      {order.return_requested && (
        <div className="border-t mt-4 pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Undo2 className="text-gray-500" size={20} />
              <div>
                <p className="text-sm font-medium text-gray-700">Return Requested</p>
                <p className="text-xs text-gray-500">
                  {order.return_reason && `Reason: ${order.return_reason}`}
                </p>
              </div>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getReturnStatusColor(order.return_status)}`}>
              {order.return_status?.toUpperCase() || 'PENDING'}
            </span>
          </div>
          {order.return_rejected_reason && (
            <div className="mt-2 p-3 bg-red-50 rounded-md">
              <p className="text-xs text-red-700 flex items-center gap-2">
                <AlertCircle size={16} />
                <span><strong>Rejection Reason:</strong> {order.return_rejected_reason}</span>
              </p>
            </div>
          )}
          {order.return_status === 'completed' && order.refund_amount && (
            <div className="mt-2 p-3 bg-green-50 rounded-md">
              <p className="text-xs text-green-700">
                <strong>Refund Amount:</strong> {formatCurrency(order.refund_amount)} has been processed
              </p>
            </div>
          )}
        </div>
      )}

      {/* Return Request Button */}
      {canRequestReturn() && (
        <div className="border-t mt-4 pt-4">
          <button
            onClick={() => setShowReturnDialog(true)}
            className="w-full md:w-auto px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
          >
            <Undo2 size={18} />
            Request Return/Refund
          </button>
        </div>
      )}

      {/* Return Request Dialog */}
      {showReturnDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">Request Return</h3>
              <button onClick={() => setShowReturnDialog(false)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Return Reason *
                </label>
                <select
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="">Select a reason</option>
                  <option value="damaged">Product Damaged</option>
                  <option value="wrong_item">Wrong Item Received</option>
                  <option value="not_as_described">Not as Described</option>
                  <option value="quality_issue">Quality Issue</option>
                  <option value="expired">Expired Product</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Detailed Explanation *
                </label>
                <textarea
                  value={returnDetails}
                  onChange={(e) => setReturnDetails(e.target.value)}
                  rows={4}
                  placeholder="Please provide details about why you want to return this order..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                <p className="text-xs text-yellow-800">
                  <strong>Return Policy:</strong> Returns are accepted within 7 days of delivery. 
                  Refunds will be processed within 5-7 business days after approval.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowReturnDialog(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleReturnRequest}
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? "Submitting..." : "Submit Request"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const OrderDetails = () => {
  const [orders, setOrders] = useState([]); 
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserOrders = async () => {
      try {
        setLoading(true);
        const storedUser = localStorage.getItem("user");
        if (!storedUser) {
          setError("Please login to view your orders");
          setLoading(false);
          return;
        }

        const user = JSON.parse(storedUser);
        console.log("📦 Fetching orders for user:", user.id);
        
        const response = await apiClient.get("/order/get-orders");
        const data = response.data;
        
        if (data && Array.isArray(data)) {
          console.log("📦 Total orders received:", data.length);
          console.log("🔍 User ID to match:", user.id);
          console.log("📋 Sample order user_id:", data[0]?.user_id);
          
          // Filter orders for current user and sort by date (newest first)
          // Handle both ObjectId and string comparison
          const userOrders = data
            .filter(order => {
              const orderUserId = order.user_id?._id || order.user_id;
              const match = String(orderUserId) === String(user.id);
              if (import.meta.env.DEV) {
                console.log(`Order ${order._id}: user_id=${orderUserId}, match=${match}`);
              }
              return match;
            })
            .sort((a, b) => new Date(b.date) - new Date(a.date));
          
          console.log("✅ Filtered user orders:", userOrders.length);
          
          if (userOrders.length > 0) {
            setOrders(userOrders);
            setFilteredOrders(userOrders);
          } else {
            console.warn("⚠️ No orders found for this user");
            setError("No orders found for this user.");
          }
        } else {
          setError("Failed to fetch orders.");
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
        setError("Error fetching orders. Please check your connection.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserOrders();
  }, []);

  // Filter orders based on search, status, and date
  useEffect(() => {
    let filtered = [...orders];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (order) =>
          order.transaction_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.phone.includes(searchTerm)
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (order) => order.order_status?.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    // Date filter
    if (dateFilter !== "all") {
      const now = new Date();
      filtered = filtered.filter((order) => {
        const orderDate = new Date(order.date);
        const diffTime = Math.abs(now - orderDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        switch (dateFilter) {
          case "7days":
            return diffDays <= 7;
          case "30days":
            return diffDays <= 30;
          case "90days":
            return diffDays <= 90;
          default:
            return true;
        }
      });
    }

    setFilteredOrders(filtered);
  }, [orders, searchTerm, statusFilter, dateFilter]);

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setDateFilter("all");
  };

  const getStatusCounts = () => {
    return {
      all: orders.length,
      pending: orders.filter(o => o.order_status?.toLowerCase() === "pending").length,
      processing: orders.filter(o => o.order_status?.toLowerCase() === "processing").length,
      shipped: orders.filter(o => o.order_status?.toLowerCase() === "shipped").length,
      delivered: orders.filter(o => o.order_status?.toLowerCase() === "delivered").length,
    };
  };

  const statusCounts = getStatusCounts();

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 mb-4 mx-auto"></div>
          <p className="text-gray-600">Loading your orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-100">
        <div className="text-center bg-white p-8 rounded-lg shadow-md">
          <div className="mb-4">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-16 w-16 text-red-500 mx-auto" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
              />
            </svg>
          </div>
          <p className="text-red-500 text-lg mb-2">{error}</p>
          <p className="text-gray-600">Please try again later or contact support.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 mb-4 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Back</span>
        </button>

        {/* Header */}
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Your Orders</h2>
          <p className="text-gray-600">Track and manage your recent purchases</p>
        </div>

        {orders.length > 0 && (
          <>
            {/* Search Bar */}
            <div className="bg-white rounded-lg shadow-md p-4 mb-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search by transaction ID, address, or phone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-10 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X size={20} />
                    </button>
                  )}
                </div>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center justify-center space-x-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Filter size={20} />
                  <span>Filters</span>
                </button>
              </div>

              {/* Filters */}
              {showFilters && (
                <div className="mt-4 pt-4 border-t space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Order Status
                      </label>
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        <option value="all">All Orders ({statusCounts.all})</option>
                        <option value="pending">Pending ({statusCounts.pending})</option>
                        <option value="processing">Processing ({statusCounts.processing})</option>
                        <option value="shipped">Shipped ({statusCounts.shipped})</option>
                        <option value="delivered">Delivered ({statusCounts.delivered})</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date Range
                      </label>
                      <select
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        <option value="all">All Time</option>
                        <option value="7days">Last 7 Days</option>
                        <option value="30days">Last 30 Days</option>
                        <option value="90days">Last 90 Days</option>
                      </select>
                    </div>
                  </div>

                  {(searchTerm || statusFilter !== "all" || dateFilter !== "all") && (
                    <button
                      onClick={clearFilters}
                      className="flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <X size={16} />
                      <span>Clear All Filters</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Status Quick Filters */}
            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setStatusFilter("all")}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    statusFilter === "all"
                      ? "bg-gray-800 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  All ({statusCounts.all})
                </button>
                <button
                  onClick={() => setStatusFilter("pending")}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    statusFilter === "pending"
                      ? "bg-orange-500 text-white"
                      : "bg-orange-100 text-orange-700 hover:bg-orange-200"
                  }`}
                >
                  Pending ({statusCounts.pending})
                </button>
                <button
                  onClick={() => setStatusFilter("processing")}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    statusFilter === "processing"
                      ? "bg-yellow-500 text-white"
                      : "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                  }`}
                >
                  Processing ({statusCounts.processing})
                </button>
                <button
                  onClick={() => setStatusFilter("shipped")}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    statusFilter === "shipped"
                      ? "bg-blue-500 text-white"
                      : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                  }`}
                >
                  Shipped ({statusCounts.shipped})
                </button>
                <button
                  onClick={() => setStatusFilter("delivered")}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    statusFilter === "delivered"
                      ? "bg-green-500 text-white"
                      : "bg-green-100 text-green-700 hover:bg-green-200"
                  }`}
                >
                  Delivered ({statusCounts.delivered})
                </button>
              </div>
            </div>

            {/* Results Info */}
            <div className="mb-4 text-sm text-gray-600">
              Showing {filteredOrders.length} of {orders.length} orders
            </div>
          </>
        )}

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-20 w-20 text-gray-400 mx-auto mb-4" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
              />
            </svg>
            <p className="text-xl text-gray-600">
              {orders.length === 0 ? "No orders found" : "No matching orders"}
            </p>
            <p className="text-gray-500 mt-2">
              {orders.length === 0 
                ? "You haven't placed any orders yet." 
                : "Try adjusting your filters to see more results."}
            </p>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <OrderCard 
              key={order._id} 
              order={order} 
              onReturnRequest={() => {
                // Refresh orders after return request
                const fetchUserOrders = async () => {
                  try {
                    const response = await apiClient.get("/order/get-orders");
                    const data = response.data;
                    
                    if (data && Array.isArray(data)) {
                      const user = JSON.parse(localStorage.getItem("user"));
                      const userOrders = data
                        .filter(o => String(o.user_id?._id || o.user_id) === String(user.id))
                        .sort((a, b) => new Date(b.date) - new Date(a.date));
                      
                      setOrders(userOrders);
                      setFilteredOrders(userOrders);
                    }
                  } catch (error) {
                    console.error("Error refreshing orders:", error);
                  }
                };
                fetchUserOrders();
              }}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default OrderDetails;
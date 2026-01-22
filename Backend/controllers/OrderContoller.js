const Order = require("../models/OrderModel");
const Product = require("../models/ProductModel");
const User = require("../models/UserModel");
const MembershipSubscription = require("../models/MembershipSubscriptionModel");
const MembershipPlan = require("../models/MembershipPlanModel");
const KisanCashTransaction = require("../models/KisanCashTransactionModel");

const resolveVariantsForRole = (product, userType) => {
  if (userType === "Agri-Retailer") {
    return Array.isArray(product.retailer_package_qty) ? product.retailer_package_qty : [];
  }
  return Array.isArray(product.package_qty) ? product.package_qty : [];
};

/**
 * SECURITY: Apply membership discount with strict validation
 * - ONLY Farmers can use membership
 * - Atomic operation to prevent race conditions
 * - Validates subscription at exact moment of use
 * - Locks purchase count during transaction
 */
const applyMembershipDiscount = async (userId, subtotal, session = null) => {
  try {
    console.log("[Membership] Attempting to apply for user:", userId);
    
    // SECURITY CHECK 1: Verify user is FARMER
    const user = await User.findById(userId);
    if (!user) {
      return { 
        applied: false, 
        reason: "User not found",
        allowRetry: false
      };
    }
    
    if (user.user_type !== "Farmer") {
      console.log("[Membership] BLOCKED: User type is", user.user_type, "not Farmer");
      return { 
        applied: false, 
        reason: `Memberships are ONLY for Farmers. Your account type: ${user.user_type}`,
        allowRetry: false
      };
    }
    
    // SECURITY CHECK 2: Find and LOCK active subscription
    const subscription = await MembershipSubscription.findOne({
      user_id: userId,
      status: "active",
      expires_at: { $gte: new Date() },
      purchases_left: { $gt: 0 }
    }).populate('plan_id');
    
    if (!subscription) {
      console.log("[Membership] No active subscription found");
      return { 
        applied: false, 
        reason: "No active membership or all purchases used",
        allowRetry: true
      };
    }
    
    // SECURITY CHECK 3: Verify subscription hasn't expired (double check)
    const now = new Date();
    if (new Date(subscription.expires_at) < now) {
      console.log("[Membership] Subscription expired at", subscription.expires_at);
      // Mark as expired
      subscription.status = "expired";
      await subscription.save();
      return { 
        applied: false, 
        reason: "Membership expired",
        allowRetry: false
      };
    }
    
    // SECURITY CHECK 4: Verify plan is still active
    const plan = subscription.plan_id;
    if (!plan || !plan.is_active) {
      console.log("[Membership] Plan not active");
      return { 
        applied: false, 
        reason: "Membership plan is no longer available",
        allowRetry: false
      };
    }
    
    // SECURITY CHECK 5: Atomically decrement purchases_left (PREVENTS RACE CONDITION)
    const purchasesBeforeUse = subscription.purchases_left;
    
    const updated = await MembershipSubscription.findOneAndUpdate(
      {
        _id: subscription._id,
        status: "active",
        purchases_left: { $gt: 0 }, // Triple check
        expires_at: { $gte: now } // Triple check
      },
      {
        $inc: { purchases_left: -1 },
        $set: { 
          last_used_at: now
        }
      },
      { new: true }
    );
    
    if (!updated) {
      console.log("[Membership] Failed atomic update - likely race condition or already used");
      return { 
        applied: false, 
        reason: "Membership purchase already consumed or expired",
        allowRetry: true
      };
    }
    
    console.log("[Membership] Successfully decremented purchases:", purchasesBeforeUse, "->", updated.purchases_left);
    
    // Calculate discount
    const discountPercent = plan.cashback_percent || 0;
    const discountAmount = Math.round((subtotal * discountPercent) / 100);
    
    // If no purchases left after this, mark as expired
    if (updated.purchases_left === 0) {
      console.log("[Membership] Last purchase used, marking as expired");
      updated.status = "expired";
      await updated.save();
    }
    
    return {
      applied: true,
      subscription: updated,
      plan,
      discountPercent,
      discountAmount,
      purchases_left_before: purchasesBeforeUse,
      purchases_left_after: updated.purchases_left,
      user_type_verified: user.user_type
    };
    
  } catch (error) {
    console.error("[Membership] Error applying discount:", error);
    return { 
      applied: false, 
      reason: `System error: ${error.message}`,
      allowRetry: true
    };
  }
};

exports.createOrder = async (req, res) => {
  try {
    const {
      name,
      user_id,
      date,
      razorpay_payment_status,
      transaction_id,
      products,
      role,
      order_status,
      address,
      phone,
      pincode,
      total_amount,
      status,
      apply_membership, // NEW: Boolean to apply membership discount
      payment_method, // NEW: "online" or "cod" (cash on delivery / pay at store)
      delivery_type, // NEW: "home" or "pickup" (home delivery or store pickup)
      counter_id, // NEW: Store counter ID for pickup orders
      counter_name, // NEW: Store counter name for pickup orders
      coupon_code, // NEW: Applied coupon code
      coupon_discount, // NEW: Coupon discount amount
      kisan_cash_redeemed, // NEW: Kisan Cash credits redeemed
    } = req.body;
    let priceSnapshot = [];
    let computedTotal = 0;
    if (Array.isArray(products) && products.length > 0) {
      for (const item of products) {
        const product = await Product.findById(item.product_id);
        if (!product) {
          continue;
        }
        const variants = resolveVariantsForRole(product, role);
        const variant = variants[0];
        const unitPrice = Number(variant?.sell_price || 0);
        const originalPrice = Number(variant?.mrp_price || 0);
        const qty = Number(item.quantity || 1);
        let commission = null;
        if (role === "Agent") {
          const percent = Number(product.agent_commission);
          if (!Number.isNaN(percent)) {
            commission = Math.round((unitPrice * percent) / 100);
          }
        }
        computedTotal += unitPrice * qty;
        priceSnapshot.push({
          product_id: product._id,
          variant_id: variant?._id,
          variant_qty: qty,
          unit_price: unitPrice,
          original_price: originalPrice,
          commission,
        });
      }
    }
    
    // MEMBERSHIP DISCOUNT LOGIC (STRICT FARMER-ONLY)
    let membershipDiscount = 0;
    let membershipDetails = null;
    let kisanCashEarned = 0;
    let kisanCashTransaction = null;
    
    // Only apply if explicitly requested AND user is Farmer
    if (apply_membership === true) {
      console.log("[Order] Membership requested, attempting to apply...");
      
      const membershipResult = await applyMembershipDiscount(user_id, computedTotal);
      
      if (membershipResult.applied) {
        membershipDiscount = membershipResult.discountAmount;
        kisanCashEarned = membershipDiscount; // Earn Kisan Cash = discount amount
        
        membershipDetails = {
          subscription_id: membershipResult.subscription._id,
          plan_id: membershipResult.plan._id,
          plan_name: membershipResult.plan.name,
          discount_percent: membershipResult.discountPercent,
          discount_amount: membershipDiscount,
          user_type_verified: membershipResult.user_type_verified,
          purchases_left_before: membershipResult.purchases_left_before,
          purchases_left_after: membershipResult.purchases_left_after,
          applied_at: new Date(),
          subscription_status_at_time: "active"
        };
        
        console.log("[Order] Membership applied successfully:", membershipDetails);
        
        // Create Kisan Cash earn transaction (will link order_id after save)
        kisanCashTransaction = await KisanCashTransaction.create({
          user_id,
          order_id: null, // Will update after order created
          type: "earn",
          amount: kisanCashEarned
        });
        
        console.log("[Order] Kisan Cash earned:", kisanCashEarned);
      } else {
        // Membership failed to apply
        console.log("[Order] Membership NOT applied:", membershipResult.reason);
        
        // Return error to user if membership was requested but failed
        return res.status(400).json({
          success: false,
          error: "Membership discount could not be applied",
          reason: membershipResult.reason,
          allowRetry: membershipResult.allowRetry
        });
      }
    }
    
    // Calculate final total after all discounts
    const couponDiscountAmount = Number(coupon_discount) || 0;
    const kisanCashRedeemedAmount = Number(kisan_cash_redeemed) || 0;
    const finalTotal = Math.max(
      computedTotal - membershipDiscount - couponDiscountAmount - kisanCashRedeemedAmount,
      0 // Ensure total doesn't go negative
    );
    
    // Create Kisan Cash redemption transaction if applicable (will link to order after save)
    let kisanCashRedemptionTransaction = null;
    if (kisanCashRedeemedAmount > 0) {
      kisanCashRedemptionTransaction = await KisanCashTransaction.create({
        user_id,
        order_id: null, // Will update after order created
        type: "redeem",
        amount: kisanCashRedeemedAmount
      });
      console.log("[Order] Kisan Cash redeemed:", kisanCashRedeemedAmount);
    }
    
    console.log("[Order] Order total:", {
      subtotal: computedTotal,
      membership_discount: membershipDiscount,
      coupon_discount: couponDiscountAmount,
      kisan_cash_redeemed: kisanCashRedeemedAmount,
      final_total: finalTotal,
      payment_method: payment_method || "online",
      delivery_type: delivery_type || "home"
    });
    
    const order = new Order({
      name,
      user_id,
      date,
      razorpay_payment_status: razorpay_payment_status || (payment_method === "cod" ? "COD" : null),
      transaction_id: transaction_id || (payment_method === "cod" ? `COD_${Date.now()}` : null),
      products,
      role,
      order_status,
      address,
      phone,
      pincode,
      total_amount: finalTotal,
      price_snapshot: priceSnapshot,
      membership_discount: membershipDiscount,
      membership_applied: membershipDetails,
      kisan_cash_earned: kisanCashEarned,
      status,
      // NEW: Payment and delivery options
      payment_method: payment_method || "online", // "online" or "cod"
      delivery_mode: delivery_type || "home", // "home" or "pickup" (using delivery_mode from schema)
      counter_id: counter_id || null, // Store counter for pickup
      counter_name: counter_name || null, // Store name
      coupon_code: coupon_code || null,
      coupon_discount: coupon_discount || 0,
      kisan_cash_redeemed: kisan_cash_redeemed || 0,
    });
    await order.save();
    
    // Link Kisan Cash transactions to order
    if (kisanCashTransaction) {
      kisanCashTransaction.order_id = order._id;
      await kisanCashTransaction.save();
    }
    if (kisanCashRedemptionTransaction) {
      kisanCashRedemptionTransaction.order_id = order._id;
      await kisanCashRedemptionTransaction.save();
    }
    
    console.log("[Order] Order created successfully:", order._id);
    console.log("[Order] Payment method:", payment_method);
    console.log("[Order] Delivery type:", delivery_type);
    
    res.status(200).json({ 
      success: true, // ✅ Frontend checks for success field
      message: "Order created successfully",
      order_id: order._id,
      total_amount: finalTotal,
      membership_discount: membershipDiscount,
      coupon_discount: couponDiscountAmount,
      kisan_cash_redeemed: kisanCashRedeemedAmount,
      kisan_cash_earned: kisanCashEarned,
      payment_method: payment_method || "online",
      delivery_type: delivery_type || "home"
    });
  } catch (error) {
    console.error("[Order] Error creating order:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.getOrders = async (req, res) => {
  try {
    console.log("[Order] Fetching all orders...");
    
    // Fetch all orders with populated product details
    const orders = await Order.find()
      .populate({
        path: 'products.product_id',
        select: 'title name product_name sell_price mrp_price image'
      })
      .populate({
        path: 'user_id',
        select: 'name email mobile user_type'
      })
      .sort({ createdAt: -1 }) // Most recent first
      .lean();
    
    console.log(`[Order] Found ${orders.length} orders`);
    
    // Transform orders to include product details in a friendly format
    const transformedOrders = orders.map(order => {
      const products = order.products.map(item => {
        const productData = item.product_id;
        // Calculate price from order total if product price not available
        const itemPrice = productData?.sell_price || productData?.mrp_price || 
                         (order.total_amount && order.products.length > 0 ? 
                          Math.round(order.total_amount / order.products.length) : 0);
        
        return {
          product_id: productData?._id || item.product_id,
          product_name: productData?.title || productData?.name || productData?.product_name || 'Product',
          quantity: item.quantity,
          price: itemPrice,
          sell_price: itemPrice,
          mrp_price: productData?.mrp_price || itemPrice,
          unit_price: itemPrice,
          item_total: itemPrice * (item.quantity || 1),
          title: productData?.title || productData?.name || 'N/A',
          name: productData?.name || productData?.title || 'N/A',
          image: productData?.image || null
        };
      });
      
      return {
        ...order,
        products: products
      };
    });
    
    res.status(200).json(transformedOrders);
  } catch (error) {
    console.error("[Order] Error fetching orders:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order Not Found" });
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateOrder = async (req, res) => {
  try {
    console.log("[Order] Updating order:", req.params.id);
    console.log("[Order] Update data:", req.body);
    
    // Only update fields that are provided in the request
    const updateFields = {};
    const allowedFields = [
      'name',
      'user_id',
      'date',
      'razorpay_payment_status',
      'transaction_id',
      'products',
      'order_status',
      'address',
      'phone',
      'pincode',
      'total_amount',
      'status',
      'payment_method',
      'delivery_type',
      // Delivery partner & tracking fields
      'delivery_partner',
      'tracking_number',
      'estimated_delivery',
      'delivery_notes',
      'delivered_at'
    ];
    
    // Only include fields that are present in the request body
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateFields[field] = req.body[field];
      }
    });
    
    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({ 
        success: false,
        message: "No valid fields provided for update" 
      });
    }
    
    console.log("[Order] Fields to update:", Object.keys(updateFields));
    
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { 
        new: true, // Return updated document
        runValidators: true // Run schema validators
      }
    )
    .populate({
      path: 'products.product_id',
      select: 'title name product_name sell_price mrp_price'
    })
    .populate({
      path: 'user_id',
      select: 'name email mobile user_type'
    });
    
    if (!order) {
      console.log("[Order] Order not found:", req.params.id);
      return res.status(404).json({ 
        success: false,
        message: "Order not found" 
      });
    }
    
    console.log("[Order] Order updated successfully:", order._id);
    
    res.status(200).json({
      success: true,
      message: "Order updated successfully",
      data: order
    });
  } catch (error) {
    console.error("[Order] Error updating order:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to update order",
      error: error.message 
    });
  }
};

exports.deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not Found" });
    
    // SECURITY: Refund membership purchase if it was used
    if (order.membership_applied && order.membership_applied.subscription_id) {
      console.log("[Order] Refunding membership purchase for cancelled order:", order._id);
      
      const subscription = await MembershipSubscription.findById(
        order.membership_applied.subscription_id
      );
      
      if (subscription) {
        // Refund the purchase count
        subscription.purchases_left += 1;
        
        // If it was marked expired due to 0 purchases, reactivate it
        if (subscription.status === "expired" && new Date(subscription.expires_at) >= new Date()) {
          subscription.status = "active";
          console.log("[Order] Reactivated subscription after refund");
        }
        
        await subscription.save();
        console.log("[Order] Refunded 1 purchase. New purchases_left:", subscription.purchases_left);
      }
      
      // Delete Kisan Cash earned from this order
      if (order.kisan_cash_earned > 0) {
        await KisanCashTransaction.deleteMany({
          order_id: order._id,
          type: "earn"
        });
        console.log("[Order] Removed Kisan Cash earned:", order.kisan_cash_earned);
      }
    }
    
    // Delete the order
    await Order.findByIdAndDelete(req.params.id);
    res.status(200).json({ 
      message: "Order Deleted successfully",
      membership_refunded: !!order.membership_applied
    });
  } catch (error) {
    console.error("[Order] Error deleting order:", error);
    res.status(500).json({ error: error.message });
  }
};

const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
require("dotenv").config();

const userRoutes = require("./routes/UserRoutes");
const config = require("./config/db");
const categoryRoute = require("./routes/CategoryRoute");
const subCategoryRoute = require("./routes/SubCategoryRoute");
const brandRoute = require("./routes/BrandRoute");
const cropRoute = require("./routes/CropRoute");
const productRoute = require("./routes/ProductRoute");
const adminRoute = require("./routes/AdminRoute");
const orderRoute = require("./routes/OrderRoute");
const superCatRoute = require("./routes/SuperCatRoute");
const pestRoute = require("./routes/PestRoute");
const entrepreneurRoute = require("./routes/EntrepreneurRoute");
const counterRoute = require("./routes/CounterRoute");
const userCounterRoute = require("./routes/UserCounterRoute");
const authRoute = require("./routes/AuthRoutes");
const addressRoute = require("./routes/AddressRoute");
const cartRoute = require("./routes/CartRoute");
const membershipRoute = require("./routes/MembershipRoute");
const kisanCashRoute = require("./routes/KisanCashRoute");
const paymentRoute = require("./routes/PaymentRoute");
const couponRoute = require("./routes/CouponRoute");
const shippingRoute = require("./routes/ShippingRoute");

const swaggerDocument = YAML.load(
  `${__dirname}/technical-docs/api-contracts/openapi.yaml`
);
const app = express();

// Security: Helmet for security headers
app.use(helmet({
  contentSecurityPolicy: false, // Disable for development (enable in production)
  crossOriginEmbedderPolicy: false
}));

// Cookie parser for HTTP-only cookies
app.use(cookieParser());

// Body parsers
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

// CORS with credentials for cookies - Enhanced & Flexible configuration
const getAllowedOrigins = () => {
  // Default development origins
  const devOrigins = [
    "http://localhost:3000",
    "http://localhost:3001", 
    "http://localhost:3002",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
    "http://127.0.0.1:3002"
  ];
  
  // Get origins from environment variable
  if (process.env.FRONTEND_URL) {
    const envOrigins = process.env.FRONTEND_URL
      .split(',')
      .map(url => url.trim())
      .filter(url => url); // Remove empty strings
    
    // In production, ONLY use env origins (strict)
    if (process.env.NODE_ENV === 'production') {
      console.log(`🔒 Production mode: ${envOrigins.length} allowed origins`);
      return envOrigins;
    }
    
    // In development, merge both (flexible)
    const allOrigins = [...new Set([...envOrigins, ...devOrigins])];
    console.log(`🔧 Development mode: ${allOrigins.length} allowed origins`);
    return allOrigins;
  }
  
  // Fallback to dev origins
  console.log(`⚠️ No FRONTEND_URL set, using default dev origins`);
  return devOrigins;
};

const allowedOrigins = getAllowedOrigins();

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, Postman, curl)
    if (!origin) {
      console.log(`✅ CORS: Allowing request with no origin`);
      return callback(null, true);
    }
    
    // Check if origin is in allowed list
    if (allowedOrigins.indexOf(origin) !== -1) {
      console.log(`✅ CORS: Allowed origin: ${origin}`);
      callback(null, true);
    } else {
      // Strict in production, lenient in development
      if (process.env.NODE_ENV === 'production') {
        console.error(`❌ CORS: BLOCKED origin in production: ${origin}`);
        callback(new Error(`CORS: Origin ${origin} not allowed`));
      } else {
        console.warn(`⚠️ CORS: Origin not in list but allowing in dev: ${origin}`);
        callback(null, true); // Allow in development for testing
      }
    }
  },
  credentials: true, // ✅ CRITICAL: Allow cookies
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type", 
    "Authorization", 
    "X-CSRF-Token", 
    "X-Request-Id",
    "Accept",
    "Origin",
    "X-Requested-With"
  ],
  exposedHeaders: ["Set-Cookie", "X-CSRF-Token"],
  maxAge: 86400, // 24 hours - cache preflight requests
  preflightContinue: false,
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));

// Handle preflight requests explicitly
app.options("*", cors(corsOptions));

// Rate limiting - prevent brute force attacks
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: { 
    success: false,
    message: "Too many login attempts. Please try again after 15 minutes.",
    code: "RATE_LIMIT_EXCEEDED"
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true // Don't count successful logins
});

const otpLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 3, // 3 OTP requests per 5 minutes
  message: { 
    success: false,
    message: "Too many OTP requests. Please try again after 5 minutes.",
    code: "OTP_RATE_LIMIT"
  }
});

const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  message: { 
    success: false,
    message: "Too many requests. Please slow down.",
    code: "API_RATE_LIMIT"
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Apply rate limiters to specific routes
app.use("/api/admin/admin-login", loginLimiter);
app.use("/api/v1/auth/request-otp", otpLimiter);
app.use("/api/v1/auth/verify-otp", loginLimiter);
app.use("/api/", apiLimiter);

mongoose
  .connect(config.dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Mongo DB Connected"))
  .catch((err) => console.log(err));

app.use("/api/user", userRoutes);
app.use("/api/super-category", superCatRoute);
app.use("/api/category", categoryRoute);
app.use("/api/subcategory", subCategoryRoute);
app.use("/api/counter", counterRoute);
app.use("/api/user-counter", userCounterRoute);
app.use("/api/brand", brandRoute);
app.use("/api/crop", cropRoute);
app.use("/api/product", productRoute);
app.use("/api/admin", adminRoute);
app.use("/api/order", orderRoute)
app.use("/api/pest", pestRoute);
app.use("/api/entrepreneur", entrepreneurRoute);
app.use("/api/v1/auth", authRoute);
app.use("/api/v1/addresses", addressRoute);
app.use("/api/v1/cart", cartRoute);
app.use("/api/v1/membership", membershipRoute);
app.use("/api/v1/credits", kisanCashRoute);
app.use("/api/v1/payments", paymentRoute);
app.use("/api/payment", paymentRoute); // Legacy route for compatibility
app.use("/api/v1/coupons", couponRoute);
app.use("/api/shipping", shippingRoute);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

app.post("/api/razorpay/create-razorpay-order", async (req, res) => {
  const { amount, currency } = req.body;

  const generateReceiptNumber = () => {
    const prefix = "receipt_";
    const randomDigits = Math.floor(100000 + Math.random() * 900000);
    return `${prefix}${Date.now()}_${randomDigits}`;
  };
  const receipt = generateReceiptNumber();
  try {
    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency,
      receipt,
    });
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/razorpay/verify-razorpay-payment", (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    req.body;

  const generatedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(razorpay_order_id + "|" + razorpay_payment_id)
    .digest("hex");

  if (generatedSignature === razorpay_signature) {
    res
      .status(200)
      .json({ success: true, message: "Payment verified successfully" });
  } else {
    res
      .status(400)
      .json({ success: false, message: "Payment verification failed" });
  }
});

const port = config.port || 3000;
app.listen(port, () => {
  console.log(`server is running on port ${port}`);
});

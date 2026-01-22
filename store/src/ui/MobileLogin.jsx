import axios from "axios";
import { Phone } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import logo from "../assets/farmLogo.png";
import BASE_URL from "../Helper/Helper";

const MobileLogin = () => {
  const [loading, setLoading] = useState(false);
  
  // Mobile/OTP states
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [userInfo, setUserInfo] = useState(null); // Store user info after OTP sent
  
  const navigate = useNavigate();

  const mobileRegex = /^[0-9]{10}$/;

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!mobileRegex.test(mobile)) {
      toast.error("Please enter a valid 10-digit mobile number.");
      setLoading(false);
      return;
    }

    try {
      // Try each user type until one works (backend will validate)
      let response;
      let lastError;
      const userTypes = ["Farmer", "Agri-Retailer", "Agent"];
      
      console.log(`🔍 Starting OTP request for mobile: ${mobile}`);
      console.log(`🔍 Will try user types in order: ${userTypes.join(' → ')}`);
      
      for (const userType of userTypes) {
        try {
          console.log(`📱 Attempting OTP request with user_type: "${userType}"`);
          
          response = await axios.post(`${BASE_URL}/v1/auth/request-otp`, {
            mobile,
            user_type: userType
          });
          
          if (response.data.success) {
            console.log(`✅ SUCCESS! User found with type: "${userType}"`);
            console.log(`✅ OTP sent successfully`);
            setUserInfo({ userType }); // Store for resend
            break;
          }
        } catch (error) {
          lastError = error;
          const errorMessage = error.response?.data?.message || error.message;
          
          console.log(`❌ Failed with user_type "${userType}": ${errorMessage}`);
          
          // If it's not a user type mismatch, throw the error
          if (errorMessage !== "User type mismatch") {
            console.error(`🚫 Non-mismatch error encountered. Stopping retry loop.`);
            throw error;
          }
          // Otherwise, try next user type
          console.log(`⏭️ User type mismatch detected. Will try next type...`);
        }
      }
      
      if (!response || !response.data.success) {
        console.error(`🚫 No successful response after trying all user types`);
        console.error(`Last error:`, lastError);
        throw lastError || new Error("Failed to send OTP - User not found or invalid user type");
      }
      
      console.log(`✅ OTP request completed successfully`);
      setOtpSent(true);
      toast.success("OTP sent to your mobile number!");
    } catch (error) {
      console.error("Failed to send OTP:", error);
      toast.error(error.response?.data?.message || "Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!otp || otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(`${BASE_URL}/v1/auth/verify-otp`, {
        mobile,
        otp
      });

      if (response.data.success) {
        const { user } = response.data.data;
        const csrfToken = response.data.csrfToken;
        
        console.log("✅ Login successful - User data:", user);
        console.log("✅ CSRF Token received:", csrfToken ? "YES" : "NO");
        
        // Store user data
        localStorage.setItem("user", JSON.stringify(user));
        
        // Store CSRF token (REQUIRED for new secure method)
        if (csrfToken) {
          localStorage.setItem("csrfToken", csrfToken);
          console.log("✅ Stored csrfToken");
        }
        
        // Store token if provided (backward compatibility)
        if (response.data.data.token) {
          localStorage.setItem("token", response.data.data.token);
          localStorage.setItem("authToken", response.data.data.token);
          console.log("✅ Stored token");
        }
        
        // Store user type
        if (user && user.user_type) {
          localStorage.setItem("userType", user.user_type);
          console.log("✅ User type:", user.user_type);
        }

        // ✅ Verify tokens are actually stored before proceeding
        const storedCsrfToken = localStorage.getItem("csrfToken");
        const storedUser = localStorage.getItem("user");
        
        console.log("🔍 Verification:", {
          csrfToken: !!storedCsrfToken,
          user: !!storedUser
        });
        
        if (!storedCsrfToken) {
          console.error("❌ CRITICAL: csrfToken not found in localStorage after storing!");
          toast.error("Authentication error. Please try again.");
          setLoading(false);
          return;
        }
        
        toast.success(`Welcome ${user.name || user.mobile}! (${user.user_type})`);
        
        // ✅ Delay to ensure storage is complete before reload
        setTimeout(() => {
          navigate("/");
          window.location.reload();
        }, 200); // 200ms delay ensures localStorage sync
      }
    } catch (error) {
      console.error("OTP verification failed:", error);
      toast.error(error.response?.data?.message || "Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);

    try {
      // Use the stored user type from initial OTP request
      const userType = userInfo?.userType || "Farmer";
      const response = await axios.post(`${BASE_URL}/v1/auth/resend-otp`, {
        mobile,
        user_type: userType
      });
      
      if (response.data.success) {
        toast.success("OTP resent to your mobile number!");
      }
    } catch (error) {
      console.error("Failed to resend OTP:", error);
      const resendAfter = error.response?.data?.resend_after_sec;
      if (resendAfter) {
        toast.error(`Please wait ${resendAfter} seconds before requesting another OTP.`);
      } else {
        toast.error(error.response?.data?.message || "Failed to resend OTP. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const inputClasses =
    "relative block w-full pl-10 pr-3 py-3 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-sm";
  const iconClasses = "absolute left-3 top-1/2 -translate-y-1/2 text-gray-400";

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      <div className="w-full flex items-center justify-center p-4 bg-white bg-opacity-90 backdrop-blur-sm">
        <div className="w-full max-w-sm space-y-8 bg-white p-6 rounded-xl shadow-xl">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 md:w-20 md:h-20 mb-4">
              <img
                src={logo}
                alt="Farm-E-Store Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <h2 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
              Welcome to Farm-E-Store
            </h2>
          </div>

          {/* Title - No Tabs */}
          <div className="text-center pb-4">
            <h3 className="text-lg font-semibold text-gray-800">Login with Mobile</h3>
            <p className="text-sm text-gray-500 mt-1">Enter your mobile number to continue</p>
          </div>

          {/* Mobile/OTP Login */}
          <form
            onSubmit={otpSent ? handleVerifyOtp : handleSendOtp}
            className="mt-6 space-y-5"
          >
            <div className="space-y-4">
              {!otpSent ? (
                <div className="relative">
                  <Phone className={iconClasses} size={20} />
                  <input
                    type="tel"
                    value={mobile}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "");
                      if (value.length <= 10) {
                        setMobile(value);
                      }
                    }}
                    required
                    className={inputClasses}
                    placeholder="Enter 10-digit mobile number"
                    maxLength="10"
                  />
                </div>
              ) : (
                <>
                  <div className="relative">
                    <Phone className={iconClasses} size={20} />
                    <input
                      type="tel"
                      value={mobile}
                      disabled
                      className={`${inputClasses} bg-gray-100`}
                    />
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "");
                        if (value.length <= 6) {
                          setOtp(value);
                        }
                      }}
                      required
                      className="relative block w-full px-3 py-3 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-sm"
                      placeholder="Enter 6-digit OTP"
                      maxLength="6"
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={loading}
                      className="text-green-600 hover:text-green-700 text-sm font-medium disabled:opacity-50"
                    >
                      Resend OTP
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setOtpSent(false);
                        setOtp("");
                      }}
                      className="text-gray-600 hover:text-gray-700 text-sm font-medium"
                    >
                      Change Number
                    </button>
                  </div>
                </>
              )}
            </div>

            <div>
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-500 hover:to-teal-500 text-white font-semibold py-3 rounded-lg shadow-md transition-all duration-200"
                disabled={loading}
              >
                {loading
                  ? "Processing..."
                  : otpSent
                  ? "Verify & Login"
                  : "Send OTP"}
              </button>
            </div>

          </form>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default MobileLogin;

import React, { useState } from "react";
import axios from "axios";
import { Eye, EyeOff, Mail, Lock, User, Phone } from "lucide-react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/farmLogo.png";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import BASE_URL from "../Helper/Helper";

const LoginUnified = () => {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState("email"); // "email", "mobile", "register"
  const navigate = useNavigate();

  // Email/Password states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Mobile/OTP states
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  // Registration states
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regMobile, setRegMobile] = useState("");
  const [regUserType, setRegUserType] = useState("");
  const [regPassword, setRegPassword] = useState("");

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const mobileRegex = /^[0-9]{10}$/;
  const passwordRegex =
    /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address.");
      setLoading(false);
      return;
    }

    if (!passwordRegex.test(password)) {
      toast.error("Please check the password.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(`${BASE_URL}/user/login`, {
        email,
        password,
      }, {
        withCredentials: true // Enable cookies
      });

      const { token, user, csrfToken } = response.data;
      
      // Store all tokens
      if (token) {
        localStorage.setItem("token", token);
        localStorage.setItem("authToken", token);
      }
      
      if (csrfToken) {
        localStorage.setItem("csrfToken", csrfToken);
      }
      
      localStorage.setItem("user", JSON.stringify(user));

      if (user && user.user_type) {
        localStorage.setItem("userType", user.user_type);
      }

      toast.success("Login Successful!");
      setTimeout(() => {
        navigate("/");
      }, 100);
    } catch (error) {
      console.error("Login error:", error);
      toast.error(
        error.response?.data?.message || "An error occurred. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!mobileRegex.test(mobile)) {
      toast.error("Please enter a valid 10-digit mobile number.");
      setLoading(false);
      return;
    }

    try {
      // API call will be implemented later
      // const response = await axios.post(`${BASE_URL}/user/send-otp`, { mobile });
      
      console.log("Sending OTP to:", mobile);
      setOtpSent(true);
      toast.success("OTP sent to your mobile number!");
    } catch (error) {
      console.error("Failed to send OTP:", error);
      toast.error("Failed to send OTP. Please try again.");
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
      // API call will be implemented later
      // const response = await axios.post(`${BASE_URL}/user/verify-otp`, { mobile, otp });
      // const { token, user } = response.data;
      // localStorage.setItem("authToken", token);
      // localStorage.setItem("user", JSON.stringify(user));
      // if (user && user.user_type) {
      //   localStorage.setItem("userType", user.user_type);
      // }

      console.log("Verifying OTP:", otp, "for mobile:", mobile);
      toast.success("Login Successful!");
      navigate("/");
      window.location.reload();
    } catch (error) {
      console.error("OTP verification failed:", error);
      toast.error("Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);

    try {
      // API call will be implemented later
      console.log("Resending OTP to:", mobile);
      toast.success("OTP resent to your mobile number!");
    } catch (error) {
      console.error("Failed to resend OTP:", error);
      toast.error("Failed to resend OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!emailRegex.test(regEmail)) {
      toast.error("Please enter a valid email address.");
      setLoading(false);
      return;
    }

    if (!mobileRegex.test(regMobile)) {
      toast.error("Mobile number must be 10 digits.");
      setLoading(false);
      return;
    }

    if (!passwordRegex.test(regPassword)) {
      toast.error(
        "Password must be at least 8 characters long and contain letters, numbers, and at least one special character."
      );
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(`${BASE_URL}/user/add-user`, {
        name: regName,
        email: regEmail,
        mobile: regMobile,
        user_type: regUserType,
        password: regPassword,
      });

      toast.success("User Registration Successful!");
      setActiveTab("email");
      // Clear registration form
      setRegName("");
      setRegEmail("");
      setRegMobile("");
      setRegUserType("");
      setRegPassword("");
    } catch (error) {
      console.error("Registration error:", error);
      toast.error(
        error.response?.data?.message ||
          "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const inputClasses =
    "relative block w-full pl-10 pr-3 py-3 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-sm";
  const iconClasses = "absolute left-3 top-1/2 -translate-y-1/2 text-gray-400";
  const tabButtonClasses = (isActive) =>
    `flex-1 py-3 text-sm font-semibold transition-all duration-200 ${
      isActive
        ? "border-b-2 border-green-600 text-green-600"
        : "text-gray-500 hover:text-gray-700"
    }`;

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

          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            <button
              type="button"
              onClick={() => {
                setActiveTab("email");
                setOtpSent(false);
                setOtp("");
              }}
              className={tabButtonClasses(activeTab === "email")}
            >
              Email Login
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab("mobile");
                setOtpSent(false);
                setOtp("");
              }}
              className={tabButtonClasses(activeTab === "mobile")}
            >
              Mobile Login
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("register")}
              className={tabButtonClasses(activeTab === "register")}
            >
              Register
            </button>
          </div>

          {/* Email/Password Login */}
          {activeTab === "email" && (
            <form onSubmit={handleLogin} className="mt-6 space-y-5">
              <div className="space-y-4">
                <div className="relative">
                  <Mail className={iconClasses} size={20} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className={inputClasses}
                    placeholder="Email Address"
                  />
                </div>

                <div className="relative">
                  <Lock className={iconClasses} size={20} />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className={`${inputClasses} pr-10`}
                    placeholder="Password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-500 hover:to-teal-500 text-white font-semibold py-3 rounded-lg shadow-md transition-all duration-200"
                  disabled={loading}
                >
                  {loading ? "Processing..." : "Login"}
                </button>
              </div>
            </form>
          )}

          {/* Mobile/OTP Login */}
          {activeTab === "mobile" && (
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
          )}

          {/* Registration */}
          {activeTab === "register" && (
            <form onSubmit={handleRegister} className="mt-6 space-y-5">
              <div className="space-y-4">
                <div className="relative">
                  <User className={iconClasses} size={20} />
                  <input
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    required
                    className={inputClasses}
                    placeholder="Full Name"
                  />
                </div>

                <div className="relative">
                  <Phone className={iconClasses} size={20} />
                  <input
                    type="tel"
                    value={regMobile}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "");
                      if (value.length <= 10) {
                        setRegMobile(value);
                      }
                    }}
                    required
                    className={inputClasses}
                    placeholder="Mobile Number"
                    maxLength="10"
                  />
                </div>

                <div className="relative">
                  <select
                    value={regUserType}
                    onChange={(e) => setRegUserType(e.target.value)}
                    required
                    className={`${inputClasses} pl-3`}
                  >
                    <option value="">Select User Type</option>
                    <option value="Farmer">Farmer</option>
                    <option value="Agri-Retailer">Agri-Retailer</option>
                    <option value="Agent">Agent</option>
                  </select>
                </div>

                <div className="relative">
                  <Mail className={iconClasses} size={20} />
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    required
                    className={inputClasses}
                    placeholder="Email Address"
                  />
                </div>

                <div className="relative">
                  <Lock className={iconClasses} size={20} />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    required
                    className={`${inputClasses} pr-10`}
                    placeholder="Password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-500 hover:to-teal-500 text-white font-semibold py-3 rounded-lg shadow-md transition-all duration-200"
                  disabled={loading}
                >
                  {loading ? "Processing..." : "Register"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default LoginUnified;

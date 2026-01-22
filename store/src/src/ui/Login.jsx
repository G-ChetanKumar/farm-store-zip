import React, { useState } from "react";
import axios from "axios";
import { Eye, EyeOff, Mail, Lock, User, Phone } from "lucide-react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/farmLogo.png";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import BASE_URL from "../Helper/Helper";

const Login = ({ setLogin }) => {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLogin, setIsLogin] = useState(setLogin);
  const navigate = useNavigate();

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const mobileRegex = /^[0-9]{10}$/;
  const passwordRegex =
    /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.target);
    const { email, password } = Object.fromEntries(formData);

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
      });

      const { token, user } = response.data;
      localStorage.setItem("authToken", token);
      localStorage.setItem("user", JSON.stringify(user));

      // Store the user_type separately for easier access
      if (user && user.user_type) {
        localStorage.setItem("userType", user.user_type);
      }

      toast.success("Login Successful!");
      navigate("/");
      window.location.reload();
    } catch (error) {
      console.error("Login error:", error);
      toast.error(
        error.response?.data?.message || "An error occurred. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.target);
    const { name, email, mobile, user_type, password } =
      Object.fromEntries(formData);

    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address.");
      setLoading(false);
      return;
    }

    if (!mobileRegex.test(mobile)) {
      toast.error("Mobile number must be 10 digits.");
      setLoading(false);
      return;
    }

    if (!passwordRegex.test(password)) {
      toast.error(
        "Password must be at least 8 characters long and contain letters, numbers, and at least one special character."
      );
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(`${BASE_URL}/user/add-user`, {
        name,
        email,
        mobile,
        user_type,
        password,
      });

      toast.success("User Registration Successful!");
      setIsLogin(true);
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
              {isLogin ? "Welcome Back!" : "Join Farm-E-Store"}
            </h2>
            <p className="mt-2 text-xs md:text-sm text-gray-600">
              {isLogin
                ? "Sign in to access your account"
                : "Create your account and start selling/buying"}
            </p>
          </div>

          <form
            onSubmit={isLogin ? handleLogin : handleRegister}
            className="mt-6 space-y-5"
          >
            <div className="space-y-4">
              {!isLogin && (
                <>
                  <div className="relative">
                    <User className={iconClasses} size={20} />
                    <input
                      type="text"
                      name="name"
                      required
                      className={inputClasses}
                      placeholder="Full Name"
                    />
                  </div>

                  <div className="relative">
                    <Phone className={iconClasses} size={20} />
                    <input
                      type="tel"
                      name="mobile"
                      required
                      className={inputClasses}
                      placeholder="Mobile Number"
                      pattern="[0-9]{10}"
                      maxLength="10"
                      onKeyPress={(e) => {
                        if (!/[0-9]/.test(e.key)) {
                          e.preventDefault();
                        }
                      }}
                    />
                  </div>

                  <div className="relative">
                    <select
                      name="user_type"
                      required
                      className={`${inputClasses} pl-3`}
                    >
                      <option value="">Select User Type</option>
                      <option value="Farmer">Farmer</option>
                      <option value="Agri-Retailer">Agri-Retailer</option>
                      <option value="Agent">Agent</option>
                    </select>
                  </div>
                </>
              )}

              <div className="relative">
                <Mail className={iconClasses} size={20} />
                <input
                  type="email"
                  name="email"
                  required
                  className={inputClasses}
                  placeholder="Email Address"
                />
              </div>

              <div className="relative">
                <Lock className={iconClasses} size={20} />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
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
                {loading ? "Processing..." : isLogin ? "Login" : "Register"}
              </button>
            </div>

            <div className="text-center text-xs md:text-sm text-gray-600">
              {isLogin ? (
                <p>
                  Don't have an account?{" "}
                  <button
                    type="button"
                    onClick={() => setIsLogin(false)}
                    className="text-green-600 hover:underline"
                  >
                    Register now
                  </button>
                </p>
              ) : (
                <p>
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => setIsLogin(true)}
                    className="text-green-600 hover:underline"
                  >
                    Login here
                  </button>
                </p>
              )}
            </div>
          </form>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default Login;

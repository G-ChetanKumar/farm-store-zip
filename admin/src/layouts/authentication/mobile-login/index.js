import { ArrowLeft, CheckCircle, Phone } from "@mui/icons-material";
import Card from "@mui/material/Card";
import bgImage from "assets/images/bg-sign-in-basic.jpeg";
import apiClient from "api/axios";
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import MDInput from "components/MDInput";
import MDTypography from "components/MDTypography";
import BasicLayout from "layouts/authentication/components/BasicLayout";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function MobileLogin() {
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [canResend, setCanResend] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);

  const navigate = useNavigate();

  // Start resend timer
  const startResendTimer = () => {
    setCanResend(false);
    setResendTimer(30);
    const interval = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Validate mobile number
  const validateMobile = (number) => {
    const mobileRegex = /^[6-9]\d{9}$/;
    return mobileRegex.test(number);
  };

  // Handle Send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!validateMobile(mobile)) {
      setError("Please enter a valid 10-digit mobile number");
      return;
    }

    setLoading(true);

    try {
      const response = await apiClient.post("/api/admin/send-otp", {
        mobile: mobile,
      });

      console.log("OTP sent successfully:", response.data);
      setSuccess("OTP sent successfully to your mobile number");
      setOtpSent(true);
      startResendTimer();
    } catch (error) {
      console.error("OTP send failed:", error.response?.data || error.message);
      setError(
        error.response?.data?.message || "Failed to send OTP. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle Resend OTP
  const handleResendOtp = async () => {
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await apiClient.post("/api/admin/send-otp", {
        mobile: mobile,
      });

      console.log("OTP resent successfully:", response.data);
      setSuccess("OTP resent successfully");
      startResendTimer();
    } catch (error) {
      console.error("OTP resend failed:", error.response?.data || error.message);
      setError(
        error.response?.data?.message || "Failed to resend OTP. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    setLoading(true);

    try {
      const response = await apiClient.post("/api/admin/verify-otp", {
        mobile: mobile,
        otp: otp,
      });

      console.log("Login successful:", response.data);

      // Store the token in localStorage
      localStorage.setItem("token", response.data.token);
      
      // Store admin details if provided
      if (response.data.admin) {
        localStorage.setItem("admin", JSON.stringify(response.data.admin));
      }

      setSuccess("Login successful!");
      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);
    } catch (error) {
      console.error("OTP verification failed:", error.response?.data || error.message);
      setError(
        error.response?.data?.message || "Invalid OTP. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle Change Number
  const handleChangeNumber = () => {
    setOtpSent(false);
    setOtp("");
    setError("");
    setSuccess("");
    setCanResend(false);
    setResendTimer(30);
  };

  return (
    <BasicLayout image={bgImage}>
      <br />
      <br />
      <br />
      <Card>
        <MDBox
          variant="gradient"
          bgColor="info"
          borderRadius="lg"
          coloredShadow="info"
          mx={2}
          mt={-3}
          p={2}
          mb={1}
          textAlign="center"
        >
          <MDTypography variant="h4" fontWeight="medium" color="white" mt={1}>
            Admin Login
          </MDTypography>
          <MDTypography variant="body2" color="white" mt={1} mb={2}>
            {otpSent ? "Enter OTP sent to your mobile" : "Login with Mobile & OTP"}
          </MDTypography>
        </MDBox>

        <MDBox pt={4} pb={3} px={3}>
          {!otpSent ? (
            // Step 1: Enter Mobile Number
            <MDBox component="form" role="form" onSubmit={handleSendOtp}>
              {error && (
                <MDBox mb={2} p={2} bgcolor="error.light" borderRadius="lg">
                  <MDTypography variant="body2" color="error">
                    {error}
                  </MDTypography>
                </MDBox>
              )}

              {success && (
                <MDBox mb={2} p={2} bgcolor="success.light" borderRadius="lg">
                  <MDTypography variant="body2" color="success">
                    {success}
                  </MDTypography>
                </MDBox>
              )}

              <MDBox mb={2}>
                <MDTypography variant="body2" color="text" mb={1}>
                  Mobile Number
                </MDTypography>
                <MDInput
                  type="tel"
                  placeholder="Enter 10-digit mobile number"
                  fullWidth
                  value={mobile}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    if (value.length <= 10) {
                      setMobile(value);
                    }
                  }}
                  inputProps={{
                    maxLength: 10,
                    pattern: "[0-9]*",
                  }}
                  InputProps={{
                    startAdornment: (
                      <Phone sx={{ mr: 1, color: "action.active" }} />
                    ),
                  }}
                />
              </MDBox>

              <MDBox mt={4} mb={1}>
                <MDButton
                  variant="gradient"
                  color="info"
                  fullWidth
                  type="submit"
                  disabled={loading || mobile.length !== 10}
                >
                  {loading ? "Sending OTP..." : "Send OTP"}
                </MDButton>
              </MDBox>

              <MDBox mt={3} textAlign="center">
                <MDTypography variant="body2" color="text" mb={1}>
                  Want to use username & password?
                </MDTypography>
                <MDBox
                  onClick={() => navigate("/authentication/sign-in")}
                  sx={{
                    cursor: "pointer",
                    display: "inline-block",
                  }}
                >
                  <MDTypography
                    variant="body2"
                    fontWeight="medium"
                    sx={{
                      background: "linear-gradient(195deg, #49a3f1, #1A73E8)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      "&:hover": {
                        textDecoration: "underline",
                      },
                    }}
                  >
                    Login Here
                  </MDTypography>
                </MDBox>
              </MDBox>
            </MDBox>
          ) : (
            // Step 2: Enter OTP
            <MDBox component="form" role="form" onSubmit={handleVerifyOtp}>
              {error && (
                <MDBox mb={2} p={2} bgcolor="error.light" borderRadius="lg">
                  <MDTypography variant="body2" color="error">
                    {error}
                  </MDTypography>
                </MDBox>
              )}

              {success && (
                <MDBox mb={2} p={2} bgcolor="success.light" borderRadius="lg">
                  <MDTypography variant="body2" color="success">
                    {success}
                  </MDTypography>
                </MDBox>
              )}

              <MDBox mb={2}>
                <MDTypography variant="body2" color="text" mb={1}>
                  Mobile Number: <strong>+91-{mobile}</strong>
                </MDTypography>
                <MDButton
                  variant="text"
                  color="info"
                  size="small"
                  onClick={handleChangeNumber}
                  startIcon={<ArrowLeft />}
                >
                  Change Number
                </MDButton>
              </MDBox>

              <MDBox mb={3}>
                <MDTypography variant="body2" color="text" mb={1}>
                  Enter OTP
                </MDTypography>
                <MDInput
                  type="tel"
                  placeholder="Enter 6-digit OTP"
                  fullWidth
                  value={otp}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    if (value.length <= 6) {
                      setOtp(value);
                    }
                  }}
                  inputProps={{
                    maxLength: 6,
                    pattern: "[0-9]*",
                  }}
                  InputProps={{
                    startAdornment: (
                      <CheckCircle sx={{ mr: 1, color: "action.active" }} />
                    ),
                  }}
                />
              </MDBox>

              <MDBox mt={4} mb={1}>
                <MDButton
                  variant="gradient"
                  color="info"
                  fullWidth
                  type="submit"
                  disabled={loading || otp.length !== 6}
                >
                  {loading ? "Verifying..." : "Verify & Login"}
                </MDButton>
              </MDBox>

              <MDBox mt={3} textAlign="center">
                {canResend ? (
                  <MDButton
                    variant="text"
                    color="info"
                    onClick={handleResendOtp}
                    disabled={loading}
                  >
                    Resend OTP
                  </MDButton>
                ) : (
                  <MDTypography variant="body2" color="text">
                    Resend OTP in <strong>{resendTimer}s</strong>
                  </MDTypography>
                )}
              </MDBox>
            </MDBox>
          )}
        </MDBox>
      </Card>
    </BasicLayout>
  );
}

export default MobileLogin;

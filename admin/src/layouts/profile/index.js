import React, { useEffect, useState } from "react";
import apiClient from "api/axios";
import Grid from "@mui/material/Grid";
import Divider from "@mui/material/Divider";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import FacebookIcon from "@mui/icons-material/Facebook";
import TwitterIcon from "@mui/icons-material/Twitter";
import InstagramIcon from "@mui/icons-material/Instagram";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import ProfileInfoCard from "examples/Cards/InfoCards/ProfileInfoCard";
import Header from "layouts/profile/components/Header";

function Overview() {
  const [adminData, setAdminData] = useState(null); // State to store admin details
  const [error, setError] = useState(null); // State to handle errors
  const [editMode, setEditMode] = useState(false); // State to toggle edit mode
  const [updatedData, setUpdatedData] = useState({ username: "", password: "" }); // State for updated credentials

  // Fetch admin details from API
  useEffect(() => {
    const fetchAdminDetails = async () => {
      try {
        const response = await apiClient.get("/api/admin/get-admin"
        );
        setAdminData(response.data);
        setUpdatedData({ username: response.data.username, password: "" });
      } catch (err) {
        setError("Failed to fetch admin details. Please try again later.");
      }
    };

    fetchAdminDetails();
  }, []);

  const handleUpdate = async () => {
    try {
      if (!updatedData.password) {
        alert("Password cannot be empty.");
        return;
      }
      const response = await apiClient.patch(`/api/admin/admin-update/${adminData._id}`, // Use PATCH method here
        updatedData
      );
      alert("Credentials updated successfully!");
      setAdminData(response.data); // Update the admin data with the response
      setEditMode(false);
    } catch (err) {
      setError("Failed to update admin credentials. Please try again later.");
    }
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox mb={2} />
      <Header>
        <MDBox mt={5} mb={3}>
          <Grid container spacing={1}>
            <Grid item xs={12} md={6} xl={4} sx={{ display: "flex" }}>
              <Divider orientation="vertical" sx={{ ml: -2, mr: 1 }} />
              {adminData ? (
                editMode ? (
                  <MDBox width="100%">
                    <MDTypography variant="h6" fontWeight="medium">
                      Update Admin Credentials
                    </MDTypography>
                    <TextField
                      fullWidth
                      margin="normal"
                      label="Username"
                      value={updatedData.username}
                      onChange={(e) =>
                        setUpdatedData((prev) => ({ ...prev, username: e.target.value }))
                      }
                    />
                    <TextField
                      fullWidth
                      margin="normal"
                      label="Password"
                      type="password"
                      value={updatedData.password}
                      onChange={(e) =>
                        setUpdatedData((prev) => ({ ...prev, password: e.target.value }))
                      }
                    />
                    <Button
                      variant="contained"
                      color="primary"
                      style={{ color: "#fff" }}
                      onClick={handleUpdate}
                      sx={{ mt: 2, mr: 2 }}
                    >
                      Save
                    </Button>
                    <Button
                      variant="outlined"
                      color="secondary"
                      onClick={() => setEditMode(false)}
                      sx={{ mt: 2 }}
                      style={{ color: "#000" }}
                    >
                      Cancel
                    </Button>
                  </MDBox>
                ) : (
                  <>
                    <ProfileInfoCard
                      title="Profile Information"
                      description="Welcome to your profile page. Manage your details here."
                      info={{
                        fullName: adminData.username || "Not Provided",
                        mobile: adminData.mobile || "(Not Provided)",
                        email: adminData.email || "admin@farmestore.com",
                        location: adminData.location || "N/A",
                      }}
                      social={[
                        {
                          link: adminData.facebook || "https://www.facebook.com/",
                          icon: <FacebookIcon />,
                          color: "facebook",
                        },
                        {
                          link: adminData.twitter || "https://x.com/",
                          icon: <TwitterIcon />,
                          color: "twitter",
                        },
                        {
                          link: adminData.instagram || "https://www.instagram.com/",
                          icon: <InstagramIcon />,
                          color: "instagram",
                        },
                      ]}
                      action={{
                        route: "/edit-profile", // The route for editing the profile
                        tooltip: "Edit Profile", // Tooltip text when hovering over the edit icon
                      }}
                      shadow={false}
                    />
                  </>
                )
              ) : error ? (
                <MDTypography color="error" variant="body2">
                  {error}
                </MDTypography>
              ) : (
                <MDTypography variant="body2">Loading...</MDTypography>
              )}
              <Divider orientation="vertical" sx={{ mx: 0 }} />
            </Grid>
          </Grid>
          <br/>
          <Button
            variant="contained"
            color="primary"
            onClick={() => setEditMode(true)}
            style={{ color: "#fff" }}
          >
            Edit Profile
          </Button>
        </MDBox>
      </Header>
      <Footer />
    </DashboardLayout>
  );
}

export default Overview;

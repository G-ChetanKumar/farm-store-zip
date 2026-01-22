import { useState, useEffect } from "react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";
import Icon from "@mui/material/Icon";
import { toast } from "react-toastify";
import apiClient from "api/axios";
import Config from "../../Config";
import Box from "@mui/material/Box";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Divider from "@mui/material/Divider";

function StoresManagement() {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [maintenanceDialog, setMaintenanceDialog] = useState(false);
  const [selectedStore, setSelectedStore] = useState(null);
  const [maintenanceMessage, setMaintenanceMessage] = useState("");
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
  });

  // Store icons and colors
  const storeConfig = {
    estore: {
      icon: "store",
      color: "#4CAF50",
      displayName: "Farm e-Store",
      description: "Agricultural products and farming equipment",
    },
    efresh: {
      icon: "local_grocery_store",
      color: "#FF9800",
      displayName: "e-Fresh",
      description: "Fresh fruits and vegetables",
    },
    emeds: {
      icon: "medical_services",
      color: "#2196F3",
      displayName: "e-Meds",
      description: "Veterinary medicines and supplies",
    },
  };

  // Fetch stores
  const fetchStores = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/api/store/get-stores");
      setStores(response.data.stores || []);
    } catch (error) {
      console.error("Error fetching stores:", error);
      if (error.response?.status === 404) {
        // Initialize stores if not found
        await initializeStores();
      } else {
        toast.error("Failed to fetch stores");
      }
    } finally {
      setLoading(false);
    }
  };

  // Initialize stores
  const initializeStores = async () => {
    try {
      const response = await apiClient.post("/api/store/initialize");
      setStores(response.data.stores || []);
      toast.success("Stores initialized successfully");
    } catch (error) {
      console.error("Error initializing stores:", error);
      toast.error("Failed to initialize stores");
    }
  };

  // Fetch statistics
  const fetchStats = async () => {
    try {
      const response = await apiClient.get("/api/store/stats");
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  useEffect(() => {
    fetchStores();
    fetchStats();
  }, []);

  // Toggle store status
  const handleToggleStore = async (storeType) => {
    try {
      await apiClient.post(`/api/store/${storeType}/toggle`, {
        updated_by: "Admin",
      });
      toast.success("Store status updated successfully");
      fetchStores();
      fetchStats();
    } catch (error) {
      console.error("Error toggling store:", error);
      toast.error("Failed to update store status");
    }
  };

  // Open maintenance dialog
  const handleMaintenanceDialog = (store) => {
    setSelectedStore(store);
    setMaintenanceMessage(store.maintenance_message || "");
    setMaintenanceDialog(true);
  };

  // Toggle maintenance mode
  const handleToggleMaintenance = async () => {
    try {
      await apiClient.post(`/api/store/${selectedStore.store_type}/maintenance`, {
        maintenance_message: maintenanceMessage,
        updated_by: "Admin",
      });
      toast.success("Maintenance mode updated");
      setMaintenanceDialog(false);
      fetchStores();
    } catch (error) {
      console.error("Error toggling maintenance:", error);
      toast.error("Failed to update maintenance mode");
    }
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        {/* Statistics Cards */}
        <Grid container spacing={3} mb={3}>
          <Grid item xs={12} md={4}>
            <Card>
              <MDBox p={3} textAlign="center">
                <Icon fontSize="large" color="info">
                  inventory_2
                </Icon>
                <MDTypography variant="h4" fontWeight="bold" color="info" mt={1}>
                  {stats.totalProducts}
                </MDTypography>
                <MDTypography variant="caption" color="text">
                  Total Products
                </MDTypography>
              </MDBox>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <MDBox p={3} textAlign="center">
                <Icon fontSize="large" color="success">
                  shopping_cart
                </Icon>
                <MDTypography variant="h4" fontWeight="bold" color="success" mt={1}>
                  {stats.totalOrders}
                </MDTypography>
                <MDTypography variant="caption" color="text">
                  Total Orders
                </MDTypography>
              </MDBox>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <MDBox p={3} textAlign="center">
                <Icon fontSize="large" color="primary">
                  account_balance_wallet
                </Icon>
                <MDTypography variant="h4" fontWeight="bold" color="primary" mt={1}>
                  ₹{stats.totalRevenue?.toFixed(2) || 0}
                </MDTypography>
                <MDTypography variant="caption" color="text">
                  Total Revenue
                </MDTypography>
              </MDBox>
            </Card>
          </Grid>
        </Grid>

        {/* Page Header */}
        <Card sx={{ mb: 3 }}>
          <MDBox p={3}>
            <MDTypography variant="h5" fontWeight="medium">
              Multi-Store Configuration
            </MDTypography>
            <MDTypography variant="body2" color="text" mt={1}>
              Enable or disable stores for your platform. Disabled stores will not be visible to
              customers.
            </MDTypography>
          </MDBox>
        </Card>

        {/* Store Cards */}
        <Grid container spacing={3}>
          {stores.map((store) => {
            const config = storeConfig[store.store_type] || {};
            return (
              <Grid item xs={12} md={4} key={store._id}>
                <Card
                  sx={{
                    border: store.is_enabled ? `2px solid ${config.color}` : "2px solid #e0e0e0",
                    transition: "all 0.3s",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: 3,
                    },
                  }}
                >
                  <MDBox p={3}>
                    {/* Store Header */}
                    <MDBox display="flex" alignItems="center" mb={2}>
                      <Box
                        sx={{
                          width: 60,
                          height: 60,
                          borderRadius: "12px",
                          backgroundColor: store.is_enabled ? config.color : "#e0e0e0",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          mr: 2,
                        }}
                      >
                        <Icon
                          fontSize="large"
                          sx={{
                            color: "white",
                          }}
                        >
                          {config.icon}
                        </Icon>
                      </Box>
                      <Box flex={1}>
                        <MDTypography variant="h6" fontWeight="bold">
                          {config.displayName}
                        </MDTypography>
                        <MDTypography variant="caption" color="text">
                          {config.description}
                        </MDTypography>
                      </Box>
                    </MDBox>

                    <Divider sx={{ my: 2 }} />

                    {/* Store Stats */}
                    <Grid container spacing={2} mb={2}>
                      <Grid item xs={6}>
                        <MDBox textAlign="center">
                          <MDTypography variant="h6" fontWeight="bold" color="info">
                            {store.total_products}
                          </MDTypography>
                          <MDTypography variant="caption" color="text">
                            Products
                          </MDTypography>
                        </MDBox>
                      </Grid>
                      <Grid item xs={6}>
                        <MDBox textAlign="center">
                          <MDTypography variant="h6" fontWeight="bold" color="success">
                            {store.total_orders}
                          </MDTypography>
                          <MDTypography variant="caption" color="text">
                            Orders
                          </MDTypography>
                        </MDBox>
                      </Grid>
                      <Grid item xs={12}>
                        <MDBox textAlign="center">
                          <MDTypography variant="h6" fontWeight="bold" color="primary">
                            ₹{store.total_revenue?.toFixed(2) || 0}
                          </MDTypography>
                          <MDTypography variant="caption" color="text">
                            Revenue
                          </MDTypography>
                        </MDBox>
                      </Grid>
                    </Grid>

                    <Divider sx={{ my: 2 }} />

                    {/* Store Controls */}
                    <MDBox>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={store.is_enabled}
                            onChange={() => handleToggleStore(store.store_type)}
                            color="success"
                            size="medium"
                          />
                        }
                        label={
                          <MDTypography variant="button" fontWeight="medium">
                            {store.is_enabled ? "Store Enabled" : "Store Disabled"}
                          </MDTypography>
                        }
                      />

                      {store.is_enabled && (
                        <FormControlLabel
                          control={
                            <Switch
                              checked={store.maintenance_mode}
                              onChange={() => handleMaintenanceDialog(store)}
                              color="warning"
                              size="small"
                            />
                          }
                          label={
                            <MDTypography variant="caption" color="text">
                              Maintenance Mode
                            </MDTypography>
                          }
                        />
                      )}
                    </MDBox>

                    {/* Maintenance Warning */}
                    {store.maintenance_mode && (
                      <Box
                        sx={{
                          mt: 2,
                          p: 1.5,
                          backgroundColor: "#fff3e0",
                          borderRadius: 1,
                          border: "1px solid #ff9800",
                        }}
                      >
                        <MDTypography variant="caption" color="warning" fontWeight="bold">
                          <Icon fontSize="small" sx={{ verticalAlign: "middle", mr: 0.5 }}>
                            warning
                          </Icon>
                          Under Maintenance
                        </MDTypography>
                        {store.maintenance_message && (
                          <MDTypography variant="caption" display="block" color="text" mt={0.5}>
                            {store.maintenance_message}
                          </MDTypography>
                        )}
                      </Box>
                    )}

                    {/* Last Updated */}
                    <MDBox mt={2}>
                      <MDTypography variant="caption" color="text" display="block">
                        Last updated:{" "}
                        {store.updatedAt
                          ? new Date(store.updatedAt).toLocaleString()
                          : "Not available"}
                      </MDTypography>
                      {store.updated_by && (
                        <MDTypography variant="caption" color="text" display="block">
                          Updated by: {store.updated_by}
                        </MDTypography>
                      )}
                    </MDBox>
                  </MDBox>
                </Card>
              </Grid>
            );
          })}
        </Grid>

        {/* Help Section */}
        <Card sx={{ mt: 3 }}>
          <MDBox p={3}>
            <MDTypography variant="h6" fontWeight="medium" mb={2}>
              <Icon sx={{ verticalAlign: "middle", mr: 1 }}>help_outline</Icon>
              How it works
            </MDTypography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <MDTypography variant="body2" color="text">
                  <strong>Enable/Disable:</strong> Toggle stores on/off. Disabled stores are hidden
                  from customers.
                </MDTypography>
              </Grid>
              <Grid item xs={12} md={4}>
                <MDTypography variant="body2" color="text">
                  <strong>Maintenance Mode:</strong> Temporarily disable a store for updates while
                  keeping it in the system.
                </MDTypography>
              </Grid>
              <Grid item xs={12} md={4}>
                <MDTypography variant="body2" color="text">
                  <strong>Statistics:</strong> View real-time products, orders, and revenue per
                  store.
                </MDTypography>
              </Grid>
            </Grid>
          </MDBox>
        </Card>
      </MDBox>

      {/* Maintenance Mode Dialog */}
      <Dialog
        open={maintenanceDialog}
        onClose={() => setMaintenanceDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {selectedStore?.maintenance_mode ? "Disable" : "Enable"} Maintenance Mode
        </DialogTitle>
        <DialogContent>
          <MDTypography variant="body2" color="text" mb={2}>
            {selectedStore?.maintenance_mode
              ? "Disabling maintenance mode will make the store available to customers again."
              : "Enable maintenance mode to temporarily disable the store for updates or fixes."}
          </MDTypography>
          {!selectedStore?.maintenance_mode && (
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Maintenance Message"
              value={maintenanceMessage}
              onChange={(e) => setMaintenanceMessage(e.target.value)}
              placeholder="e.g., We're updating our system. We'll be back soon!"
              sx={{ mt: 2 }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <MDButton onClick={() => setMaintenanceDialog(false)} color="secondary">
            Cancel
          </MDButton>
          <MDButton
            onClick={handleToggleMaintenance}
            variant="gradient"
            color={selectedStore?.maintenance_mode ? "success" : "warning"}
          >
            {selectedStore?.maintenance_mode ? "Disable" : "Enable"} Maintenance
          </MDButton>
        </DialogActions>
      </Dialog>

      <Footer />
    </DashboardLayout>
  );
}

export default StoresManagement;

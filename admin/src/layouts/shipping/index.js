import {
  Add,
  Close,
  Delete,
  Edit,
  LocalShipping,
  LocationOn,
  RestartAlt,
  Search,
  ToggleOff,
  ToggleOn,
  Upload,
  Visibility,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  Avatar,
  FormControlLabel,
} from "@mui/material";
import OutlinedInput from "@mui/material/OutlinedInput";
import apiClient from "api/axios";
import MDBox from "components/MDBox";
import Footer from "examples/Footer";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import { useEffect, useState } from "react";

const ShippingManagement = () => {
  const [shippingConfigs, setShippingConfigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filteredConfigs, setFilteredConfigs] = useState([]);
  const [shippingStats, setShippingStats] = useState(null);
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [filters, setFilters] = useState({
    search: "",
    state: "all",
    district: "all",
    is_serviceable: "all",
    store_type: "all",
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState(null);
  const [formData, setFormData] = useState({
    pincode: "",
    location_name: "",
    state: "",
    district: "",
    city: "",
    delivery_time: "3-5 days",
    shipping_fee: 0,
    delivery_mode: "home_delivery",
    is_serviceable: true,
    is_cod_available: true,
    store_type: "all",
    min_order_value: 0,
    free_shipping_above: null,
    estimated_delivery_days: { min: 3, max: 5 },
    notes: "",
  });
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  useEffect(() => {
    fetchShippingConfigs();
    fetchShippingStats();
    fetchStates();
  }, []);

  const fetchShippingConfigs = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/api/shipping/get-shipping-configs");
      setShippingConfigs(response.data);
      setFilteredConfigs(response.data);
    } catch (err) {
      setError("Failed to fetch shipping configurations");
      console.error("Error:", err);
      showSnackbar("Failed to fetch shipping configurations", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchShippingStats = async () => {
    try {
      const response = await apiClient.get("/api/shipping/shipping-stats");
      setShippingStats(response.data);
    } catch (err) {
      console.error("Error fetching shipping stats:", err);
    }
  };

  const fetchStates = async () => {
    try {
      const response = await apiClient.get("/api/shipping/get-states");
      setStates(response.data);
    } catch (err) {
      console.error("Error fetching states:", err);
    }
  };

  const fetchDistricts = async (state) => {
    try {
      const response = await apiClient.get(`/api/shipping/get-districts/${state}`);
      setDistricts(response.data);
    } catch (err) {
      console.error("Error fetching districts:", err);
    }
  };

  useEffect(() => {
    let result = shippingConfigs;

    if (filters.search) {
      result = result.filter(
        (config) =>
          config.pincode?.includes(filters.search) ||
          config.location_name?.toLowerCase().includes(filters.search.toLowerCase()) ||
          config.city?.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    if (filters.state !== "all") {
      result = result.filter((config) => config.state === filters.state);
    }

    if (filters.district !== "all") {
      result = result.filter((config) => config.district === filters.district);
    }

    if (filters.is_serviceable !== "all") {
      result = result.filter(
        (config) => config.is_serviceable === (filters.is_serviceable === "true")
      );
    }

    if (filters.store_type !== "all") {
      result = result.filter((config) => config.store_type === filters.store_type);
    }

    setFilteredConfigs(result);
  }, [filters, shippingConfigs]);

  useEffect(() => {
    if (filters.state !== "all") {
      fetchDistricts(filters.state);
    } else {
      setDistricts([]);
    }
  }, [filters.state]);

  const showSnackbar = (message, severity = "success") => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const resetFilters = () => {
    setFilters({
      search: "",
      state: "all",
      district: "all",
      is_serviceable: "all",
      store_type: "all",
    });
  };

  const handleOpenDialog = (config = null) => {
    if (config) {
      setEditMode(true);
      setSelectedConfig(config);
      setFormData(config);
    } else {
      setEditMode(false);
      setSelectedConfig(null);
      setFormData({
        pincode: "",
        location_name: "",
        state: "",
        district: "",
        city: "",
        delivery_time: "3-5 days",
        shipping_fee: 0,
        delivery_mode: "home_delivery",
        is_serviceable: true,
        is_cod_available: true,
        store_type: "all",
        min_order_value: 0,
        free_shipping_above: null,
        estimated_delivery_days: { min: 3, max: 5 },
        notes: "",
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditMode(false);
    setSelectedConfig(null);
  };

  const handleSubmit = async () => {
    try {
      if (editMode) {
        await apiClient.put(`/api/shipping/update-shipping-config/${selectedConfig._id}`,
          formData
        );
        showSnackbar("Shipping configuration updated successfully", "success");
      } else {
        await apiClient.post("/api/shipping/add-shipping-config", formData);
        showSnackbar("Shipping configuration created successfully", "success");
      }
      handleCloseDialog();
      fetchShippingConfigs();
      fetchShippingStats();
    } catch (err) {
      console.error("Error:", err);
      showSnackbar(
        err.response?.data?.message || "Failed to save shipping configuration",
        "error"
      );
    }
  };

  const handleToggleServiceable = async (config) => {
    try {
      await apiClient.patch(`/api/shipping/toggle-serviceable/${config._id}`);
      showSnackbar(
        `Delivery ${!config.is_serviceable ? "enabled" : "disabled"} for ${config.location_name}`,
        "success"
      );
      fetchShippingConfigs();
      fetchShippingStats();
    } catch (err) {
      console.error("Error:", err);
      showSnackbar("Failed to update status", "error");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this shipping configuration?")) {
      return;
    }

    try {
      await apiClient.delete(`/api/shipping/delete-shipping-config/${id}`);
      showSnackbar("Shipping configuration deleted successfully", "success");
      fetchShippingConfigs();
      fetchShippingStats();
    } catch (err) {
      console.error("Error:", err);
      showSnackbar("Failed to delete shipping configuration", "error");
    }
  };

  const formatCurrency = (amount) => {
    return `₹${parseFloat(amount).toFixed(2)}`;
  };

  if (loading) {
    return (
      <DashboardLayout>
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          minHeight="60vh"
        >
          <CircularProgress />
          <Typography variant="body1" mt={2}>
            Loading shipping configurations...
          </Typography>
        </Box>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <Typography color="error">{error}</Typography>
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        {/* Statistics Cards */}
        {shippingStats && (
          <Grid container spacing={3} mb={3}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ background: "linear-gradient(195deg, #42424a 0%, #191919 100%)" }}>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="body2" sx={{ color: '#ffffff', opacity: 0.9 }}>
                        Total Locations
                      </Typography>
                      <Typography variant="h4" sx={{ color: '#ffffff', fontWeight: 'bold' }}>
                        {shippingStats.totalLocations}
                      </Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: "rgba(255,255,255,0.2)", width: 40, height: 40 }}>
                      <LocationOn sx={{ color: '#ffffff', fontSize: 24 }} />
                    </Avatar>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ background: "linear-gradient(195deg, #66BB6A 0%, #43A047 100%)" }}>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="body2" sx={{ color: '#ffffff', opacity: 0.9 }}>
                        Serviceable
                      </Typography>
                      <Typography variant="h4" sx={{ color: '#ffffff', fontWeight: 'bold' }}>
                        {shippingStats.serviceableLocations}
                      </Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: "rgba(255,255,255,0.2)", width: 40, height: 40 }}>
                      <LocalShipping sx={{ color: '#ffffff', fontSize: 24 }} />
                    </Avatar>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ background: "linear-gradient(195deg, #42A5F5 0%, #1976D2 100%)" }}>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="body2" sx={{ color: '#ffffff', opacity: 0.9 }}>
                        States Covered
                      </Typography>
                      <Typography variant="h4" sx={{ color: '#ffffff', fontWeight: 'bold' }}>
                        {shippingStats.totalStates}
                      </Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: "rgba(255,255,255,0.2)", width: 40, height: 40 }}>
                      <LocationOn sx={{ color: '#ffffff', fontSize: 24 }} />
                    </Avatar>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ background: "linear-gradient(195deg, #FFA726 0%, #FB8C00 100%)" }}>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="body2" sx={{ color: '#ffffff', opacity: 0.9 }}>
                        Avg Shipping Fee
                      </Typography>
                      <Typography variant="h4" sx={{ color: '#ffffff', fontWeight: 'bold' }}>
                        {formatCurrency(shippingStats.averageShippingFee)}
                      </Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: "rgba(255,255,255,0.2)", width: 40, height: 40 }}>
                      <LocalShipping sx={{ color: '#ffffff', fontSize: 24 }} />
                    </Avatar>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  mb={2}
                  sx={{ pb: 2, borderBottom: "1px solid #eee" }}
                >
                  <Typography variant="h5">Shipping & Delivery Management</Typography>
                  <Box display="flex" gap={1}>
                    <Tooltip title="Reset filters">
                      <Button
                        variant="outlined"
                        startIcon={<RestartAlt />}
                        onClick={resetFilters}
                        sx={{ 
                          textTransform: "none",
                          color: "#000",
                          borderColor: "#000",
                          "&:hover": {
                            borderColor: "#000",
                            backgroundColor: "rgba(0, 0, 0, 0.04)"
                          }
                        }}
                      >
                        Reset
                      </Button>
                    </Tooltip>
                    <Button
                      variant="contained"
                      startIcon={<Add />}
                      onClick={() => handleOpenDialog()}
                      sx={{ 
                        textTransform: "none",
                        backgroundColor: "#fff",
                        color: "#000",
                        border: "1px solid #000",
                        "&:hover": {
                          backgroundColor: "#f5f5f5",
                          border: "1px solid #000"
                        }
                      }}
                    >
                      Add Location
                    </Button>
                  </Box>
                </Box>

                {/* Filters */}
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={12} sm={3}>
                    <TextField
                      fullWidth
                      label="Search Pincode/Location"
                      InputProps={{
                        startAdornment: <Search />,
                      }}
                      value={filters.search}
                      onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                    />
                  </Grid>
                  <Grid item xs={12} sm={2}>
                    <FormControl fullWidth>
                      <InputLabel>State</InputLabel>
                      <Select
                        value={filters.state}
                        label="State"
                        onChange={(e) => {
                          setFilters((prev) => ({ ...prev, state: e.target.value, district: "all" }));
                        }}
                        input={<OutlinedInput label="State" />}
                        sx={{ fontSize: "1rem", padding: "10.5px 14px", height: "45px" }}
                      >
                        <MenuItem value="all">All States</MenuItem>
                        {states.map((state) => (
                          <MenuItem key={state} value={state}>
                            {state}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={2}>
                    <FormControl fullWidth>
                      <InputLabel>District</InputLabel>
                      <Select
                        value={filters.district}
                        label="District"
                        onChange={(e) =>
                          setFilters((prev) => ({ ...prev, district: e.target.value }))
                        }
                        input={<OutlinedInput label="District" />}
                        sx={{ fontSize: "1rem", padding: "10.5px 14px", height: "45px" }}
                        disabled={filters.state === "all"}
                      >
                        <MenuItem value="all">All Districts</MenuItem>
                        {districts.map((district) => (
                          <MenuItem key={district} value={district}>
                            {district}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={2.5}>
                    <FormControl fullWidth>
                      <InputLabel>Serviceability</InputLabel>
                      <Select
                        value={filters.is_serviceable}
                        label="Serviceability"
                        onChange={(e) =>
                          setFilters((prev) => ({ ...prev, is_serviceable: e.target.value }))
                        }
                        input={<OutlinedInput label="Serviceability" />}
                        sx={{ fontSize: "1rem", padding: "10.5px 14px", height: "45px" }}
                      >
                        <MenuItem value="all">All</MenuItem>
                        <MenuItem value="true">Serviceable</MenuItem>
                        <MenuItem value="false">Non-Serviceable</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={2.5}>
                    <FormControl fullWidth>
                      <InputLabel>Store Type</InputLabel>
                      <Select
                        value={filters.store_type}
                        label="Store Type"
                        onChange={(e) =>
                          setFilters((prev) => ({ ...prev, store_type: e.target.value }))
                        }
                        input={<OutlinedInput label="Store Type" />}
                        sx={{ fontSize: "1rem", padding: "10.5px 14px", height: "45px" }}
                      >
                        <MenuItem value="all">All Stores</MenuItem>
                        <MenuItem value="estore">E-Store</MenuItem>
                        <MenuItem value="efresh">E-Fresh</MenuItem>
                        <MenuItem value="emeds">E-Meds</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>

                {/* Shipping Table */}
                <TableContainer component={Paper} sx={{ mt: 3, maxHeight: 600 }}>
                  <Table stickyHeader sx={{ minWidth: 1200 }}>
                    <TableBody>
                      <TableRow>
                        <TableCell
                          sx={{
                            fontWeight: "bold",
                            bgcolor: "grey.100",
                            position: "sticky",
                            top: 0,
                            zIndex: 100,
                          }}
                        >
                          Pincode
                        </TableCell>
                        <TableCell
                          sx={{
                            fontWeight: "bold",
                            bgcolor: "grey.100",
                            position: "sticky",
                            top: 0,
                            zIndex: 100,
                          }}
                        >
                          Location
                        </TableCell>
                        <TableCell
                          sx={{
                            fontWeight: "bold",
                            bgcolor: "grey.100",
                            position: "sticky",
                            top: 0,
                            zIndex: 100,
                          }}
                        >
                          State
                        </TableCell>
                        <TableCell
                          sx={{
                            fontWeight: "bold",
                            bgcolor: "grey.100",
                            position: "sticky",
                            top: 0,
                            zIndex: 100,
                          }}
                        >
                          District
                        </TableCell>
                        <TableCell
                          sx={{
                            fontWeight: "bold",
                            bgcolor: "grey.100",
                            position: "sticky",
                            top: 0,
                            zIndex: 100,
                          }}
                        >
                          Delivery Time
                        </TableCell>
                        <TableCell
                          sx={{
                            fontWeight: "bold",
                            bgcolor: "grey.100",
                            position: "sticky",
                            top: 0,
                            zIndex: 100,
                          }}
                        >
                          Shipping Fee
                        </TableCell>
                        <TableCell
                          sx={{
                            fontWeight: "bold",
                            bgcolor: "grey.100",
                            position: "sticky",
                            top: 0,
                            zIndex: 100,
                          }}
                        >
                          Delivery Mode
                        </TableCell>
                        <TableCell
                          sx={{
                            fontWeight: "bold",
                            bgcolor: "grey.100",
                            position: "sticky",
                            top: 0,
                            zIndex: 100,
                          }}
                        >
                          Serviceable
                        </TableCell>
                        <TableCell
                          sx={{
                            fontWeight: "bold",
                            bgcolor: "grey.100",
                            position: "sticky",
                            top: 0,
                            zIndex: 100,
                          }}
                        >
                          Actions
                        </TableCell>
                      </TableRow>
                      {filteredConfigs.map((config) => (
                        <TableRow
                          key={config._id}
                          sx={{
                            "&:hover": {
                              bgcolor: "grey.50",
                            },
                          }}
                        >
                          <TableCell sx={{ padding: "16px" }}>
                            <Typography variant="body2" fontWeight="bold">
                              {config.pincode}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ padding: "16px" }}>
                            <Typography variant="body2">
                              {config.location_name}
                              {config.city && (
                                <Typography variant="caption" display="block" color="textSecondary">
                                  {config.city}
                                </Typography>
                              )}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ padding: "16px" }}>
                            <Typography variant="body2">{config.state}</Typography>
                          </TableCell>
                          <TableCell sx={{ padding: "16px" }}>
                            <Typography variant="body2">{config.district}</Typography>
                          </TableCell>
                          <TableCell sx={{ padding: "16px" }}>
                            <Typography variant="body2">{config.delivery_time}</Typography>
                          </TableCell>
                          <TableCell sx={{ padding: "16px" }}>
                            <Typography variant="body2" fontWeight="medium">
                              {formatCurrency(config.shipping_fee)}
                            </Typography>
                            {config.free_shipping_above && (
                              <Typography variant="caption" display="block" color="success.main">
                                Free above {formatCurrency(config.free_shipping_above)}
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell sx={{ padding: "16px" }}>
                            <Chip
                              label={config.delivery_mode.replace("_", " ").toUpperCase()}
                              size="small"
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell sx={{ padding: "16px" }}>
                            <Switch
                              checked={config.is_serviceable}
                              onChange={() => handleToggleServiceable(config)}
                              color={config.is_serviceable ? "success" : "default"}
                            />
                          </TableCell>
                          <TableCell sx={{ padding: "16px" }}>
                            <Box display="flex" gap={0.5}>
                              <Tooltip title="Edit">
                                <IconButton
                                  color="primary"
                                  size="small"
                                  onClick={() => handleOpenDialog(config)}
                                >
                                  <Edit fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete">
                                <IconButton
                                  color="error"
                                  size="small"
                                  onClick={() => handleDelete(config._id)}
                                >
                                  <Delete fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                {filteredConfigs.length === 0 && (
                  <Box textAlign="center" py={3}>
                    <Typography color="textSecondary">
                      No shipping configurations found matching your filters
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </MDBox>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h5">
              {editMode ? "Edit Shipping Configuration" : "Add New Location"}
            </Typography>
            <IconButton onClick={handleCloseDialog}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Pincode *"
                value={formData.pincode}
                onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                disabled={editMode}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Location Name *"
                value={formData.location_name}
                onChange={(e) => setFormData({ ...formData, location_name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="State *"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="District *"
                value={formData.district}
                onChange={(e) => setFormData({ ...formData, district: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="City"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Delivery Time"
                value={formData.delivery_time}
                onChange={(e) => setFormData({ ...formData, delivery_time: e.target.value })}
                placeholder="e.g., 3-5 days"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Delivery Mode</InputLabel>
                <Select
                  value={formData.delivery_mode}
                  label="Delivery Mode"
                  onChange={(e) => setFormData({ ...formData, delivery_mode: e.target.value })}
                >
                  <MenuItem value="home_delivery">Home Delivery</MenuItem>
                  <MenuItem value="pickup">Pickup</MenuItem>
                  <MenuItem value="both">Both</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Shipping Fee (₹)"
                type="number"
                value={formData.shipping_fee}
                onChange={(e) =>
                  setFormData({ ...formData, shipping_fee: parseFloat(e.target.value) })
                }
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Min Order Value (₹)"
                type="number"
                value={formData.min_order_value}
                onChange={(e) =>
                  setFormData({ ...formData, min_order_value: parseFloat(e.target.value) })
                }
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Free Shipping Above (₹)"
                type="number"
                value={formData.free_shipping_above || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    free_shipping_above: e.target.value ? parseFloat(e.target.value) : null,
                  })
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Min Delivery Days"
                type="number"
                value={formData.estimated_delivery_days.min}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    estimated_delivery_days: {
                      ...formData.estimated_delivery_days,
                      min: parseInt(e.target.value),
                    },
                  })
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Max Delivery Days"
                type="number"
                value={formData.estimated_delivery_days.max}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    estimated_delivery_days: {
                      ...formData.estimated_delivery_days,
                      max: parseInt(e.target.value),
                    },
                  })
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Store Type</InputLabel>
                <Select
                  value={formData.store_type}
                  label="Store Type"
                  onChange={(e) => setFormData({ ...formData, store_type: e.target.value })}
                >
                  <MenuItem value="all">All Stores</MenuItem>
                  <MenuItem value="estore">E-Store</MenuItem>
                  <MenuItem value="efresh">E-Fresh</MenuItem>
                  <MenuItem value="emeds">E-Meds</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box display="flex" flexDirection="column" gap={1} mt={1}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.is_serviceable}
                      onChange={(e) =>
                        setFormData({ ...formData, is_serviceable: e.target.checked })
                      }
                    />
                  }
                  label="Serviceable"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.is_cod_available}
                      onChange={(e) =>
                        setFormData({ ...formData, is_cod_available: e.target.checked })
                      }
                    />
                  }
                  label="COD Available"
                />
              </Box>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                multiline
                rows={2}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit}>
            {editMode ? "Update" : "Add"} Configuration
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>

      <Footer />
    </DashboardLayout>
  );
};

export default ShippingManagement;

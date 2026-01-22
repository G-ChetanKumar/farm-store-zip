import { useState, useEffect } from "react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import MDInput from "components/MDInput";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";
import IconButton from "@mui/material/IconButton";
import Icon from "@mui/material/Icon";
import { toast } from "react-toastify";
import apiClient from "api/axios";
import Config from "../../Config";
import Chip from "@mui/material/Chip";
import Tooltip from "@mui/material/Tooltip";

function CouponsManagement() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterActive, setFilterActive] = useState("all");
  const [filterStoreType, setFilterStoreType] = useState("all");

  // Statistics
  const [stats, setStats] = useState({
    totalCoupons: 0,
    activeCoupons: 0,
    validCoupons: 0,
    expiredCoupons: 0,
  });

  // Form state
  const [formData, setFormData] = useState({
    coupon_code: "",
    coupon_name: "",
    discount_type: "percentage",
    discount_value: "",
    min_order_amount: "",
    max_discount_amount: "",
    valid_from: "",
    valid_until: "",
    total_usage_limit: "",
    per_user_limit: 1,
    applicable_stores: "all",
    applicable_user_types: ["all"],
    is_active: true,
    description: "",
  });

  // Fetch coupons
  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/api/v1/coupons/admin/all");
      const allCoupons = response.data.data || [];
      
      // Apply client-side filters
      let filtered = allCoupons;
      if (filterActive !== "all") {
        filtered = filtered.filter(c => c.is_active === (filterActive === "true"));
      }
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        filtered = filtered.filter(c => 
          c.code?.toLowerCase().includes(search) ||
          c.user_id?.name?.toLowerCase().includes(search)
        );
      }
      
      setCoupons(filtered);
    } catch (error) {
      console.error("Error fetching coupons:", error);
      toast.error("Failed to fetch coupons");
    } finally {
      setLoading(false);
    }
  };

  // Fetch statistics
  const fetchStats = async () => {
    try {
      const response = await apiClient.get("/api/v1/coupons/admin/stats");
      setStats(response.data.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  useEffect(() => {
    fetchCoupons();
    fetchStats();
  }, [filterActive, filterStoreType]);

  // Handle search
  const handleSearch = () => {
    fetchCoupons();
  };

  // Open dialog
  const handleOpenDialog = (coupon = null) => {
    if (coupon) {
      setEditMode(true);
      // Map backend data to frontend form
      setFormData({
        _id: coupon._id,
        coupon_code: coupon.code || "",
        coupon_name: "", 
        discount_type: coupon.discount_type === "percent" ? "percentage" : "flat",
        discount_value: coupon.value || "",
        min_order_amount: coupon.min_order || "",
        max_discount_amount: "",
        valid_from: "",
        valid_until: coupon.expires_at ? new Date(coupon.expires_at).toISOString().split('T')[0] : "",
        total_usage_limit: coupon.usage_limit || "",
        per_user_limit: 1,
        applicable_stores: "all",
        applicable_user_types: ["all"],
        is_active: coupon.is_active,
        description: "",
        user_id: coupon.user_id?._id || "",
      });
    } else {
      // Reset to create mode - ensure no _id or user_id is present
      setEditMode(false);
      setFormData({
        coupon_code: "",
        coupon_name: "",
        discount_type: "percentage",
        discount_value: "",
        min_order_amount: "",
        max_discount_amount: "",
        valid_from: "",
        valid_until: "",
        total_usage_limit: "",
        per_user_limit: 1,
        applicable_stores: "all",
        applicable_user_types: ["all"],
        is_active: true,
        description: "",
      });
    }
    setOpenDialog(true);
  };

  // Handle submit
  const handleSubmit = async () => {
    try {
      if (!formData.coupon_code || !formData.discount_value || !formData.valid_until) {
        toast.error("Please fill all required fields: code, discount value, and expiry date");
        return;
      }

      // Validate discount value
      const discountValue = parseFloat(formData.discount_value);
      if (isNaN(discountValue) || discountValue <= 0) {
        toast.error("Discount value must be a positive number");
        return;
      }

      // Validate percentage discount
      if (formData.discount_type === "percentage" && discountValue > 100) {
        toast.error("Percentage discount cannot exceed 100%");
        return;
      }

      // Validate minimum order amount
      const minOrder = parseFloat(formData.min_order_amount) || 0;
      if (minOrder < 0) {
        toast.error("Minimum order amount cannot be negative");
        return;
      }

      // Warn if minimum order is very high
      if (minOrder > 50000) {
        const confirm = window.confirm(
          `⚠️ Warning: Minimum order amount is very high (₹${minOrder.toLocaleString()}).\n\n` +
          `This may make the coupon unusable for most customers.\n\n` +
          `Recommended: Set between ₹0 - ₹10,000\n\n` +
          `Do you want to continue anyway?`
        );
        if (!confirm) {
          return;
        }
      }

      // Validate usage limit
      const usageLimit = parseInt(formData.total_usage_limit);
      if (usageLimit && (isNaN(usageLimit) || usageLimit <= 0)) {
        toast.error("Usage limit must be a positive number");
        return;
      }

      // Map frontend form data to backend schema
      const couponData = {
        code: formData.coupon_code.trim().toUpperCase(),
        discount_type: formData.discount_type === "percentage" ? "percent" : "flat",
        value: discountValue,
        min_order: minOrder,
        expires_at: new Date(formData.valid_until),
        usage_limit: usageLimit || 1,
        is_active: formData.is_active,
      };

      // Only include user_id if it exists and we're in edit mode
      if (formData.user_id && editMode) {
        couponData.user_id = formData.user_id;
      }

      if (editMode && formData._id) {
        // Edit mode - must have _id
        await apiClient.put(`/api/v1/coupons/${formData._id}`, couponData);
        toast.success("Coupon updated successfully");
      } else {
        // Create mode - should NOT have _id
        await apiClient.post("/api/v1/coupons", couponData);
        toast.success("Coupon created successfully");
      }

      setOpenDialog(false);
      fetchCoupons();
      fetchStats();
    } catch (error) {
      console.error("Error saving coupon:", error);
      toast.error(error.response?.data?.message || "Failed to save coupon");
    }
  };

  // Toggle active status
  const handleToggleStatus = async (couponId) => {
    try {
      await apiClient.patch(`/api/v1/coupons/${couponId}/toggle`);
      toast.success("Coupon status updated");
      fetchCoupons();
      fetchStats();
    } catch (error) {
      console.error("Error toggling status:", error);
      toast.error("Failed to update status");
    }
  };

  // Delete coupon
  const handleDelete = async (couponId) => {
    if (window.confirm("Are you sure you want to delete this coupon?")) {
      try {
        await apiClient.delete(`/api/v1/coupons/${couponId}`);
        toast.success("Coupon deleted successfully");
        fetchCoupons();
        fetchStats();
      } catch (error) {
        console.error("Error deleting coupon:", error);
        toast.error("Failed to delete coupon");
      }
    }
  };

  // Table columns (mapped to backend schema)
  const columns = [
    { 
      Header: "Code", 
      accessor: "code", 
      width: "12%", 
      align: "left",
      Cell: ({ row }) => (
        <Chip label={row.original.code} size="small" variant="outlined" />
      ),
    },
    { 
      Header: "User", 
      accessor: "user", 
      align: "left",
      Cell: ({ row }) => (
        <MDTypography variant="caption">
          {row.original.user_id?.name || "All Users"}
        </MDTypography>
      ),
    },
    {
      Header: "Discount",
      accessor: "discount",
      align: "center",
      Cell: ({ row }) => (
        <MDTypography variant="caption" fontWeight="medium" color="success">
          {row.original.discount_type === "percent"
            ? `${row.original.value}%`
            : `₹${row.original.value}`}
        </MDTypography>
      ),
    },
    {
      Header: "Min Order",
      accessor: "min_order",
      align: "center",
      Cell: ({ row }) => (
        <MDTypography variant="caption">
          {row.original.min_order ? `₹${row.original.min_order}` : "No Min"}
        </MDTypography>
      ),
    },
    {
      Header: "Expires",
      accessor: "expires_at",
      align: "center",
      Cell: ({ row }) => (
        <MDTypography variant="caption" color={new Date(row.original.expires_at) < new Date() ? "error" : "text"}>
          {new Date(row.original.expires_at).toLocaleDateString()}
        </MDTypography>
      ),
    },
    {
      Header: "Usage",
      accessor: "usage",
      align: "center",
      Cell: ({ row }) => (
        <MDTypography variant="caption" fontWeight="medium">
          {row.original.used_count} / {row.original.usage_limit}
        </MDTypography>
      ),
    },
    {
      Header: "Status",
      accessor: "is_active",
      align: "center",
      Cell: ({ row }) => (
        <Switch
          checked={row.original.is_active}
          onChange={() => handleToggleStatus(row.original._id)}
          color="success"
        />
      ),
    },
    {
      Header: "Actions",
      accessor: "actions",
      align: "center",
      Cell: ({ row }) => (
        <MDBox display="flex" gap={1} justifyContent="center">
          <Tooltip title="Edit">
            <IconButton onClick={() => handleOpenDialog(row.original)} size="small" color="info">
              <Icon>edit</Icon>
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton
              onClick={() => handleDelete(row.original._id)}
              size="small"
              color="error"
            >
              <Icon>delete</Icon>
            </IconButton>
          </Tooltip>
        </MDBox>
      ),
    },
  ];

  const rows = coupons;

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        {/* Statistics Cards */}
        <Grid container spacing={3} mb={3}>
          <Grid item xs={12} md={3}>
            <Card>
              <MDBox p={3} textAlign="center">
                <MDTypography variant="h4" fontWeight="bold" color="info">
                  {stats.totalCoupons}
                </MDTypography>
                <MDTypography variant="caption" color="text">
                  Total Coupons
                </MDTypography>
              </MDBox>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <MDBox p={3} textAlign="center">
                <MDTypography variant="h4" fontWeight="bold" color="success">
                  {stats.activeCoupons}
                </MDTypography>
                <MDTypography variant="caption" color="text">
                  Active Coupons
                </MDTypography>
              </MDBox>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <MDBox p={3} textAlign="center">
                <MDTypography variant="h4" fontWeight="bold" color="primary">
                  {stats.validCoupons}
                </MDTypography>
                <MDTypography variant="caption" color="text">
                  Valid Now
                </MDTypography>
              </MDBox>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <MDBox p={3} textAlign="center">
                <MDTypography variant="h4" fontWeight="bold" color="error">
                  {stats.expiredCoupons}
                </MDTypography>
                <MDTypography variant="caption" color="text">
                  Expired
                </MDTypography>
              </MDBox>
            </Card>
          </Grid>
        </Grid>

        {/* Main Content */}
        <Card>
          <MDBox p={3}>
            <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <MDTypography variant="h5" fontWeight="medium">
                Coupons Management
              </MDTypography>
              <MDButton variant="gradient" color="info" onClick={() => handleOpenDialog()}>
                <Icon sx={{ mr: 1 }}>add</Icon> Add Coupon
              </MDButton>
            </MDBox>

            {/* Filters */}
            <Grid container spacing={2} mb={3}>
              <Grid item xs={12} md={4}>
                <MDInput
                  fullWidth
                  placeholder="Search by code or name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  InputProps={{
                    endAdornment: (
                      <IconButton onClick={handleSearch}>
                        <Icon>search</Icon>
                      </IconButton>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Status Filter</InputLabel>
                  <Select
                    value={filterActive}
                    onChange={(e) => setFilterActive(e.target.value)}
                    label="Status Filter"
                    sx={{ fontSize: "1rem", padding: "10.5px 14px", height: "45px" }}
                  >
                    <MenuItem value="all">All Status</MenuItem>
                    <MenuItem value="true">Active Only</MenuItem>
                    <MenuItem value="false">Inactive Only</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Store Filter</InputLabel>
                  <Select
                    value={filterStoreType}
                    onChange={(e) => setFilterStoreType(e.target.value)}
                    label="Store Filter"
                    sx={{ fontSize: "1rem", padding: "10.5px 14px", height: "45px" }}
                  >
                    <MenuItem value="all">All Stores</MenuItem>
                    <MenuItem value="estore">Farm e-Store</MenuItem>
                    <MenuItem value="efresh">e-Fresh</MenuItem>
                    <MenuItem value="emeds">e-Meds</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={2}>
                <MDButton
                  fullWidth
                  variant="outlined"
                  color="secondary"
                  onClick={() => {
                    setSearchTerm("");
                    setFilterActive("all");
                    setFilterStoreType("all");
                  }}
                >
                  Reset Filters
                </MDButton>
              </Grid>
            </Grid>

            {/* Table */}
            <DataTable
              table={{ columns, rows }}
              showTotalEntries={true}
              isSorted={true}
              noEndBorder
              entriesPerPage={true}
            />
          </MDBox>
        </Card>
      </MDBox>

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editMode ? "Edit Coupon" : "Create New Coupon"}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} mt={1}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Coupon Code *"
                value={formData.coupon_code}
                onChange={(e) =>
                  setFormData({ ...formData, coupon_code: e.target.value.toUpperCase() })
                }
                disabled={editMode}
                placeholder="e.g., SAVE20"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Coupon Name *"
                value={formData.coupon_name}
                onChange={(e) => setFormData({ ...formData, coupon_name: e.target.value })}
                placeholder="e.g., 20% Off Summer Sale"
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Discount Type *</InputLabel>
                <Select
                  value={formData.discount_type}
                  onChange={(e) => setFormData({ ...formData, discount_type: e.target.value })}
                  label="Discount Type *"
                  sx={{ height: "45px" }}
                >
                  <MenuItem value="percentage">Percentage (%)</MenuItem>
                  <MenuItem value="fixed">Fixed Amount (₹)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                type="number"
                label="Discount Value *"
                value={formData.discount_value}
                onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })}
                placeholder={formData.discount_type === "percentage" ? "e.g., 20" : "e.g., 100"}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                type="number"
                label="Max Discount Amount"
                value={formData.max_discount_amount}
                onChange={(e) =>
                  setFormData({ ...formData, max_discount_amount: e.target.value })
                }
                placeholder="e.g., 500"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Minimum Order Amount (₹)"
                value={formData.min_order_amount}
                onChange={(e) => setFormData({ ...formData, min_order_amount: e.target.value })}
                placeholder="e.g., 99 or 999"
                helperText="Leave empty for no minimum. Recommended: ₹99 - ₹10,000"
                inputProps={{ min: 0, step: 1 }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Total Usage Limit"
                value={formData.total_usage_limit}
                onChange={(e) => setFormData({ ...formData, total_usage_limit: e.target.value })}
                placeholder="Leave empty for unlimited"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="date"
                label="Valid From"
                value={formData.valid_from}
                onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="date"
                label="Valid Until"
                value={formData.valid_until}
                onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Applicable Store</InputLabel>
                <Select
                  value={formData.applicable_stores}
                  onChange={(e) => setFormData({ ...formData, applicable_stores: e.target.value })}
                  label="Applicable Store"
                  sx={{ height: "45px" }}
                >
                  <MenuItem value="all">All Stores</MenuItem>
                  <MenuItem value="estore">Farm e-Store</MenuItem>
                  <MenuItem value="efresh">e-Fresh</MenuItem>
                  <MenuItem value="emeds">e-Meds</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                type="number"
                label="Per User Limit"
                value={formData.per_user_limit}
                onChange={(e) => setFormData({ ...formData, per_user_limit: e.target.value })}
                inputProps={{ min: 1 }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    color="success"
                  />
                }
                label="Active"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Internal notes or description"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <MDButton onClick={() => setOpenDialog(false)} color="secondary">
            Cancel
          </MDButton>
          <MDButton onClick={handleSubmit} variant="gradient" color="info">
            {editMode ? "Update" : "Create"} Coupon
          </MDButton>
        </DialogActions>
      </Dialog>

      <Footer />
    </DashboardLayout>
  );
}

export default CouponsManagement;

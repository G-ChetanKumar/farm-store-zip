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
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Switch,
  FormControlLabel,
  Tabs,
  Tab,
  Box,
  Chip,
  IconButton
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { toast } from "react-toastify";
import apiClient from "api/axios";

function TabPanel({ children, value, index }) {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function MembershipManagement() {
  const [activeTab, setActiveTab] = useState(0);
  const [plans, setPlans] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [openPlanDialog, setOpenPlanDialog] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [planForm, setPlanForm] = useState({
    name: "",
    price: "",
    cashback_percent: "",
    gst_percent: 18,
    validity_purchases: "",
    validity_days: "",
    can_club_coupons: false
  });
  const [openSubscriptionDialog, setOpenSubscriptionDialog] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState(null);
  const [subscriptionForm, setSubscriptionForm] = useState({
    purchases_left: "",
    expires_at: "",
    status: "active"
  });
  const [stats, setStats] = useState({
    totalPlans: 0,
    activePlans: 0,
    totalSubscriptions: 0,
    activeSubscriptions: 0
  });

  // Fetch plans (show all for admin)
  const fetchPlans = async () => {
    try {
      const response = await apiClient.get("/api/v1/membership/plans?showAll=true");
      const plansData = response.data.data || [];
      setPlans(plansData);
      
      setStats(prev => ({
        ...prev,
        totalPlans: plansData.length,
        activePlans: plansData.filter(p => p.is_active).length
      }));
    } catch (error) {
      console.error("Failed to fetch plans:", error);
      toast.error("Failed to fetch plans");
    }
  };

  // Fetch subscriptions
  const fetchSubscriptions = async () => {
    try {
      const response = await apiClient.get("/api/v1/membership/subscriptions");
      const subsData = response.data.data || [];
      setSubscriptions(subsData);
      
      // Update stats
      const activeCount = response.data.stats?.active || 0;
      const totalCount = response.data.stats?.total || 0;
      
      setStats(prev => ({
        ...prev,
        totalSubscriptions: totalCount,
        activeSubscriptions: activeCount
      }));
    } catch (error) {
      console.error("Failed to fetch subscriptions:", error);
      toast.error("Failed to fetch subscriptions");
    }
  };

  useEffect(() => {
    fetchPlans();
    fetchSubscriptions();
  }, []);

  const handleOpenPlanDialog = (plan = null) => {
    if (plan) {
      setEditingPlan(plan);
      setPlanForm({
        name: plan.name,
        price: plan.price,
        cashback_percent: plan.cashback_percent,
        gst_percent: plan.gst_percent || 18,
        validity_purchases: plan.validity_purchases,
        validity_days: plan.validity_days,
        can_club_coupons: plan.can_club_coupons || false
      });
    } else {
      setEditingPlan(null);
      setPlanForm({
        name: "",
        price: "",
        cashback_percent: "",
        gst_percent: 18,
        validity_purchases: "",
        validity_days: "",
        can_club_coupons: false
      });
    }
    setOpenPlanDialog(true);
  };

  const handleClosePlanDialog = () => {
    setOpenPlanDialog(false);
    setEditingPlan(null);
  };

  const handlePlanFormChange = (field, value) => {
    setPlanForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSavePlan = async () => {
    try {
      // Validate
      if (!planForm.name || !planForm.price || !planForm.cashback_percent || 
          !planForm.validity_purchases || !planForm.validity_days) {
        toast.error("All required fields must be filled");
        return;
      }

      if (editingPlan) {
        // Update existing plan
        const response = await apiClient.put(`/api/v1/membership/plans/${editingPlan._id}`, planForm);
        toast.success(response.data.message || "Plan updated successfully");
      } else {
        // Create new plan
        const response = await apiClient.post("/api/v1/membership/plans", planForm);
        toast.success(response.data.message || "Plan created successfully");
      }

      handleClosePlanDialog();
      fetchPlans();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save plan");
    }
  };

  const handleTogglePlanStatus = async (planId, currentStatus) => {
    try {
      const response = await apiClient.patch(`/api/v1/membership/plans/${planId}/toggle`);
      toast.success(response.data.message || `Plan ${!currentStatus ? "activated" : "deactivated"}`);
      fetchPlans();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update plan status");
    }
  };

  const handleDeletePlan = async (planId, planName) => {
    if (!window.confirm(`Are you sure you want to delete the plan "${planName}"?\n\nThis action cannot be undone.`)) {
      return;
    }

    try {
      const response = await apiClient.delete(`/api/v1/membership/plans/${planId}`);
      toast.success(response.data.message || "Plan deleted successfully");
      fetchPlans();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete plan");
    }
  };

  // Subscription management handlers
  const handleEditSubscription = (subscription) => {
    setEditingSubscription(subscription);
    const expiryDate = new Date(subscription.expires_at).toISOString().split('T')[0];
    setSubscriptionForm({
      purchases_left: subscription.purchases_left,
      expires_at: expiryDate,
      status: subscription.status
    });
    setOpenSubscriptionDialog(true);
  };

  const handleCloseSubscriptionDialog = () => {
    setOpenSubscriptionDialog(false);
    setEditingSubscription(null);
    setSubscriptionForm({
      purchases_left: "",
      expires_at: "",
      status: "active"
    });
  };

  const handleUpdateSubscription = async () => {
    if (!editingSubscription) return;

    try {
      const response = await apiClient.put(
        `/api/v1/membership/subscriptions/${editingSubscription._id}`,
        subscriptionForm
      );
      toast.success(response.data.message || "Subscription updated successfully");
      handleCloseSubscriptionDialog();
      fetchSubscriptions();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update subscription");
    }
  };

  const handleCancelSubscription = async (subscriptionId, userName) => {
    if (!window.confirm(`Are you sure you want to cancel the subscription for "${userName}"?\n\nThis action will set the subscription status to cancelled.`)) {
      return;
    }

    try {
      const response = await apiClient.patch(
        `/api/v1/membership/subscriptions/${subscriptionId}/cancel`
      );
      toast.success(response.data.message || "Subscription cancelled successfully");
      fetchSubscriptions();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to cancel subscription");
    }
  };

  const plansColumns = [
    { Header: "Plan Name", accessor: "name", width: "12%" },
    { Header: "Price", accessor: "price", width: "8%" },
    { Header: "Cashback %", accessor: "cashback", width: "9%" },
    { Header: "GST %", accessor: "gst", width: "7%" },
    { Header: "Purchases", accessor: "purchases", width: "9%" },
    { Header: "Days", accessor: "days", width: "7%" },
    { Header: "Coupon Club", accessor: "coupon", width: "10%" },
    { Header: "Status", accessor: "status", width: "10%" },
    { Header: "Actions", accessor: "actions", width: "18%" }
  ];

  const plansRows = plans.map(plan => ({
    name: (
      <MDTypography variant="caption" fontWeight="medium">
        {plan.name}
      </MDTypography>
    ),
    price: (
      <MDTypography variant="caption">
        ₹{plan.price}
      </MDTypography>
    ),
    cashback: (
      <MDTypography variant="caption" color="success">
        {plan.cashback_percent}%
      </MDTypography>
    ),
    gst: (
      <MDTypography variant="caption">
        {plan.gst_percent}%
      </MDTypography>
    ),
    purchases: (
      <MDTypography variant="caption">
        {plan.validity_purchases}
      </MDTypography>
    ),
    days: (
      <MDTypography variant="caption">
        {plan.validity_days}
      </MDTypography>
    ),
    coupon: (
      <Chip
        label={plan.can_club_coupons ? "Allowed" : "Not Allowed"}
        color={plan.can_club_coupons ? "info" : "default"}
        size="small"
        variant="outlined"
      />
    ),
    status: (
      <Chip
        label={plan.is_active ? "Active" : "Inactive"}
        color={plan.is_active ? "success" : "default"}
        size="small"
      />
    ),
    actions: (
      <MDBox display="flex" gap={1} alignItems="center">
        <IconButton
          size="small"
          color="info"
          onClick={() => handleOpenPlanDialog(plan)}
          title="Edit Plan"
        >
          <EditIcon fontSize="small" />
        </IconButton>
        <IconButton
          size="small"
          color="error"
          onClick={() => handleDeletePlan(plan._id, plan.name)}
          title="Delete Plan"
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
        <Switch
          checked={plan.is_active}
          onChange={() => handleTogglePlanStatus(plan._id, plan.is_active)}
          size="small"
          title={plan.is_active ? "Deactivate" : "Activate"}
        />
      </MDBox>
    )
  }));

  // Subscriptions table columns
  const subscriptionsColumns = [
    { Header: "User", accessor: "user", width: "15%" },
    { Header: "Plan", accessor: "plan", width: "10%" },
    { Header: "Status", accessor: "status", width: "8%" },
    { Header: "Expires", accessor: "expires", width: "10%" },
    { Header: "Purchases Left", accessor: "purchasesLeft", width: "8%" },
    { Header: "Created", accessor: "created", width: "10%" },
    { Header: "User Type", accessor: "userType", width: "8%" },
    { Header: "Days Left", accessor: "daysLeft", width: "8%" },
    { Header: "Actions", accessor: "actions", width: "15%" }
  ];

  const subscriptionsRows = subscriptions.map(sub => {
    const now = new Date();
    const expiresAt = new Date(sub.expires_at);
    const daysLeft = Math.ceil((expiresAt - now) / (1000 * 60 * 60 * 24));
    const isExpired = expiresAt < now;
    const isExpiringSoon = daysLeft <= 7 && daysLeft > 0;
    
    return {
      user: (
        <MDBox>
          <MDTypography variant="caption" fontWeight="medium">
            {sub.user_id?.name || "Unknown"}
          </MDTypography>
          <MDTypography variant="caption" color="text" display="block">
            {sub.user_id?.mobile || sub.user_id?.email || "N/A"}
          </MDTypography>
        </MDBox>
      ),
      plan: (
        <Chip 
          label={sub.plan_id?.name || "N/A"} 
          size="small" 
          color="primary"
          variant="outlined"
        />
      ),
      status: (
        <Chip 
          label={isExpired ? "Expired" : sub.status.toUpperCase()} 
          size="small"
          color={isExpired ? "error" : sub.status === "active" ? "success" : "default"}
        />
      ),
      expires: (
        <MDTypography variant="caption" color={isExpired ? "error" : isExpiringSoon ? "warning" : "text"}>
          {expiresAt.toLocaleDateString()}
        </MDTypography>
      ),
      purchasesLeft: (
        <MDTypography variant="caption" fontWeight="medium" color={sub.purchases_left === 0 ? "error" : "success"}>
          {sub.purchases_left}
        </MDTypography>
      ),
      created: (
        <MDTypography variant="caption" color="text">
          {new Date(sub.createdAt).toLocaleDateString()}
        </MDTypography>
      ),
      userType: (
        <Chip 
          label={sub.user_id?.user_type || "N/A"} 
          size="small"
          variant="outlined"
        />
      ),
      daysLeft: (
        <MDTypography 
          variant="caption" 
          fontWeight="medium"
          color={isExpired ? "error" : isExpiringSoon ? "warning" : "success"}
        >
          {isExpired ? "Expired" : `${daysLeft} days`}
        </MDTypography>
      ),
      actions: (
        <MDBox display="flex" gap={0.5}>
          <IconButton
            size="small"
            color="primary"
            onClick={() => handleEditSubscription(sub)}
            title="Edit Subscription"
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            color="error"
            onClick={() => handleCancelSubscription(sub._id, sub.user_id?.name)}
            title="Cancel Subscription"
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </MDBox>
      )
    };
  });

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <Grid container spacing={3}>
          {/* Stats Cards */}
          <Grid item xs={12} md={3}>
            <Card>
              <MDBox p={2}>
                <MDTypography variant="h6" color="text">Total Plans</MDTypography>
                <MDTypography variant="h3" fontWeight="medium">
                  {stats.totalPlans}
                </MDTypography>
              </MDBox>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Card>
              <MDBox p={2}>
                <MDTypography variant="h6" color="text">Active Plans</MDTypography>
                <MDTypography variant="h3" fontWeight="medium" color="success">
                  {stats.activePlans}
                </MDTypography>
              </MDBox>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card>
              <MDBox p={2}>
                <MDTypography variant="h6" color="text">Total Subscriptions</MDTypography>
                <MDTypography variant="h3" fontWeight="medium">
                  {stats.totalSubscriptions}
                </MDTypography>
              </MDBox>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card>
              <MDBox p={2}>
                <MDTypography variant="h6" color="text">Active Subscriptions</MDTypography>
                <MDTypography variant="h3" fontWeight="medium" color="success">
                  {stats.activeSubscriptions}
                </MDTypography>
              </MDBox>
            </Card>
          </Grid>

          {/* Main Content */}
          <Grid item xs={12}>
            <Card>
              <MDBox p={3}>
                <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <MDTypography variant="h5">Membership Management</MDTypography>
                  <MDButton
                    variant="gradient"
                    color="success"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenPlanDialog()}
                  >
                    Create New Plan
                  </MDButton>
                </MDBox>

                <Tabs value={activeTab} onChange={(e, val) => setActiveTab(val)}>
                  <Tab label="Membership Plans" />
                  <Tab label="Subscriptions" />
                  <Tab label="Analytics" />
                </Tabs>

                <TabPanel value={activeTab} index={0}>
                  <DataTable
                    table={{
                      columns: plansColumns,
                      rows: plansRows
                    }}
                    showTotalEntries={true}
                    isSorted={false}
                    noEndBorder
                    entriesPerPage={false}
                  />
                </TabPanel>

                <TabPanel value={activeTab} index={1}>
                  {subscriptions.length > 0 ? (
                    <DataTable
                      table={{
                        columns: subscriptionsColumns,
                        rows: subscriptionsRows
                      }}
                      showTotalEntries={true}
                      isSorted={false}
                      noEndBorder
                      entriesPerPage={false}
                    />
                  ) : (
                    <MDBox textAlign="center" py={4}>
                      <MDTypography variant="h6" color="text">
                        No subscriptions found
                      </MDTypography>
                      <MDTypography variant="body2" color="text" mt={1}>
                        Subscriptions will appear here once users subscribe to membership plans
                      </MDTypography>
                    </MDBox>
                  )}
                </TabPanel>

                <TabPanel value={activeTab} index={2}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Card>
                        <MDBox p={3}>
                          <MDTypography variant="h6" mb={2}>Subscription Statistics</MDTypography>
                          <MDBox display="flex" flexDirection="column" gap={2}>
                            <MDBox display="flex" justifyContent="space-between">
                              <MDTypography variant="body2">Total Subscriptions:</MDTypography>
                              <MDTypography variant="body2" fontWeight="bold">{stats.totalSubscriptions}</MDTypography>
                            </MDBox>
                            <MDBox display="flex" justifyContent="space-between">
                              <MDTypography variant="body2" color="success">Active Subscriptions:</MDTypography>
                              <MDTypography variant="body2" fontWeight="bold" color="success">{stats.activeSubscriptions}</MDTypography>
                            </MDBox>
                          </MDBox>
                        </MDBox>
                      </Card>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <Card>
                        <MDBox p={3}>
                          <MDTypography variant="h6" mb={2}>Plan Statistics</MDTypography>
                          <MDBox display="flex" flexDirection="column" gap={2}>
                            <MDBox display="flex" justifyContent="space-between">
                              <MDTypography variant="body2">Total Plans:</MDTypography>
                              <MDTypography variant="body2" fontWeight="bold">{stats.totalPlans}</MDTypography>
                            </MDBox>
                            <MDBox display="flex" justifyContent="space-between">
                              <MDTypography variant="body2" color="success">Active Plans:</MDTypography>
                              <MDTypography variant="body2" fontWeight="bold" color="success">{stats.activePlans}</MDTypography>
                            </MDBox>
                          </MDBox>
                        </MDBox>
                      </Card>
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Card>
                        <MDBox p={3}>
                          <MDTypography variant="h6" mb={2}>Revenue Insights</MDTypography>
                          <MDTypography variant="body2" color="text" mb={2}>
                            Detailed revenue analytics coming soon...
                          </MDTypography>
                          <MDBox display="flex" gap={2}>
                            <Chip label="Plan Performance" size="small" />
                            <Chip label="User Growth" size="small" />
                            <Chip label="Retention Rate" size="small" />
                          </MDBox>
                        </MDBox>
                      </Card>
                    </Grid>
                  </Grid>
                </TabPanel>
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />

      {/* Create/Edit Plan Dialog */}
      <Dialog open={openPlanDialog} onClose={handleClosePlanDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingPlan ? "Edit Membership Plan" : "Create New Membership Plan"}
        </DialogTitle>
        <DialogContent>
          <MDBox component="form" display="flex" flexDirection="column" gap={2} mt={2}>
            <TextField
              label="Plan Name"
              value={planForm.name}
              onChange={(e) => handlePlanFormChange("name", e.target.value)}
              placeholder="e.g., Silver, Gold, Platinum"
              fullWidth
              required
            />

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  label="Price (₹)"
                  type="number"
                  value={planForm.price}
                  onChange={(e) => handlePlanFormChange("price", e.target.value)}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Cashback %"
                  type="number"
                  value={planForm.cashback_percent}
                  onChange={(e) => handlePlanFormChange("cashback_percent", e.target.value)}
                  fullWidth
                  required
                />
              </Grid>
            </Grid>

            <TextField
              label="GST %"
              type="number"
              value={planForm.gst_percent}
              onChange={(e) => handlePlanFormChange("gst_percent", e.target.value)}
              fullWidth
            />

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  label="Validity (Purchases)"
                  type="number"
                  value={planForm.validity_purchases}
                  onChange={(e) => handlePlanFormChange("validity_purchases", e.target.value)}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Validity (Days)"
                  type="number"
                  value={planForm.validity_days}
                  onChange={(e) => handlePlanFormChange("validity_days", e.target.value)}
                  fullWidth
                  required
                />
              </Grid>
            </Grid>

            <FormControlLabel
              control={
                <Switch
                  checked={planForm.can_club_coupons}
                  onChange={(e) => handlePlanFormChange("can_club_coupons", e.target.checked)}
                  color="primary"
                />
              }
              label={
                <MDBox>
                  <MDTypography variant="button" fontWeight="medium">
                    Allow Coupon Clubbing
                  </MDTypography>
                  <MDTypography variant="caption" display="block" color="text">
                    Users can apply both membership discount and coupon code together
                  </MDTypography>
                </MDBox>
              }
            />

            <MDBox mt={1} p={2} bgcolor="grey.100" borderRadius="8px">
              <MDTypography variant="caption" color="text" fontWeight="bold">
                Plan Preview:
              </MDTypography>
              <MDTypography variant="caption" display="block" mt={1}>
                • Customers pay: ₹{planForm.price || 0} + {planForm.gst_percent || 18}% GST
              </MDTypography>
              <MDTypography variant="caption" display="block">
                • Get {planForm.cashback_percent || 0}% discount on every purchase
              </MDTypography>
              <MDTypography variant="caption" display="block">
                • Valid for {planForm.validity_purchases || 0} purchases
              </MDTypography>
              <MDTypography variant="caption" display="block">
                • Expires in {planForm.validity_days || 0} days
              </MDTypography>
              <MDTypography variant="caption" display="block" color={planForm.can_club_coupons ? "info" : "text"}>
                • Coupon clubbing: {planForm.can_club_coupons ? "✓ Allowed" : "✗ Not Allowed"}
              </MDTypography>
            </MDBox>
          </MDBox>
        </DialogContent>
        <DialogActions>
          <MDButton onClick={handleClosePlanDialog} color="secondary">
            Cancel
          </MDButton>
          <MDButton onClick={handleSavePlan} variant="gradient" color="success">
            {editingPlan ? "Update" : "Create"} Plan
          </MDButton>
        </DialogActions>
      </Dialog>

      {/* Edit Subscription Dialog */}
      <Dialog open={openSubscriptionDialog} onClose={handleCloseSubscriptionDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          Edit Subscription - {editingSubscription?.user_id?.name}
        </DialogTitle>
        <DialogContent>
          <MDBox component="form" display="flex" flexDirection="column" gap={2} mt={2}>
            <MDBox>
              <MDTypography variant="caption" color="text" fontWeight="bold">
                User Details:
              </MDTypography>
              <MDTypography variant="body2">
                {editingSubscription?.user_id?.name} ({editingSubscription?.user_id?.mobile})
              </MDTypography>
              <MDTypography variant="caption" color="text">
                Plan: {editingSubscription?.plan_id?.name}
              </MDTypography>
            </MDBox>

            <TextField
              label="Purchases Left"
              type="number"
              value={subscriptionForm.purchases_left}
              onChange={(e) => setSubscriptionForm({ ...subscriptionForm, purchases_left: e.target.value })}
              fullWidth
              required
              helperText="Number of purchases remaining for this subscription"
            />

            <TextField
              label="Expiry Date"
              type="date"
              value={subscriptionForm.expires_at}
              onChange={(e) => setSubscriptionForm({ ...subscriptionForm, expires_at: e.target.value })}
              fullWidth
              required
              InputLabelProps={{ shrink: true }}
              helperText="When this subscription will expire"
            />

            <FormControlLabel
              control={
                <Switch
                  checked={subscriptionForm.status === "active"}
                  onChange={(e) => setSubscriptionForm({ 
                    ...subscriptionForm, 
                    status: e.target.checked ? "active" : "cancelled" 
                  })}
                />
              }
              label={
                <MDBox>
                  <MDTypography variant="button" fontWeight="medium">
                    Status: {subscriptionForm.status === "active" ? "Active" : "Cancelled"}
                  </MDTypography>
                  <MDTypography variant="caption" display="block" color="text">
                    Toggle to activate or cancel subscription
                  </MDTypography>
                </MDBox>
              }
            />

            <MDBox p={2} bgcolor="info.100" borderRadius="8px">
              <MDTypography variant="caption" color="info" fontWeight="bold">
                ⚠️ Admin Note:
              </MDTypography>
              <MDTypography variant="caption" display="block" mt={0.5}>
                • Increasing purchases: Give user extra purchases
              </MDTypography>
              <MDTypography variant="caption" display="block">
                • Extending expiry: Give user more time
              </MDTypography>
              <MDTypography variant="caption" display="block">
                • Setting to cancelled: User loses access immediately
              </MDTypography>
            </MDBox>
          </MDBox>
        </DialogContent>
        <DialogActions>
          <MDButton onClick={handleCloseSubscriptionDialog} color="secondary">
            Cancel
          </MDButton>
          <MDButton onClick={handleUpdateSubscription} variant="gradient" color="success">
            Update Subscription
          </MDButton>
        </DialogActions>
      </Dialog>
    </DashboardLayout>
  );
}

export default MembershipManagement;

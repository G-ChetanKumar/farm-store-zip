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
import IconButton from "@mui/material/IconButton";
import Icon from "@mui/material/Icon";
import { toast } from "react-toastify";
import apiClient from "api/axios";
import Chip from "@mui/material/Chip";
import Tooltip from "@mui/material/Tooltip";
import Box from "@mui/material/Box";
import Avatar from "@mui/material/Avatar";
import LinearProgress from "@mui/material/LinearProgress";

function KisanCreditsManagement() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [openTransactionDialog, setOpenTransactionDialog] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterActive, setFilterActive] = useState("all");
  const [filterTier, setFilterTier] = useState("all");

  // Statistics
  const [stats, setStats] = useState({
    totalAccounts: 0,
    activeAccounts: 0,
    total_credits_in_system: 0,
    total_earned: 0,
    total_redeemed: 0,
    avgBalance: 0,
    redemptionRate: 0,
  });

  // Transaction form
  const [transactionData, setTransactionData] = useState({
    transaction_type: "credit",
    amount: "",
    description: "",
  });

  // Fetch accounts
  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterActive !== "all") params.append("is_active", filterActive);
      if (filterTier !== "all") params.append("tier", filterTier);
      if (searchTerm) params.append("search", searchTerm);

      const response = await apiClient.get(`/api/credit/get-accounts?${params}`);
      setAccounts(response.data.accounts || []);
    } catch (error) {
      console.error("Error fetching accounts:", error);
      toast.error("Failed to fetch credit accounts");
    } finally {
      setLoading(false);
    }
  };

  // Fetch statistics
  const fetchStats = async () => {
    try {
      const response = await apiClient.get("/api/credit/stats");
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  useEffect(() => {
    fetchAccounts();
    fetchStats();
  }, [filterActive, filterTier]);

  // Handle search
  const handleSearch = () => {
    fetchAccounts();
  };

  // Open transaction dialog
  const handleOpenTransaction = (account, type) => {
    setSelectedAccount(account);
    setTransactionData({
      transaction_type: type,
      amount: "",
      description: "",
    });
    setOpenTransactionDialog(true);
  };

  // Handle transaction submit
  const handleTransactionSubmit = async () => {
    try {
      if (!transactionData.amount || transactionData.amount <= 0) {
        toast.error("Please enter a valid amount");
        return;
      }

      const endpoint =
        transactionData.transaction_type === "credit"
          ? `/api/credit/user/${selectedAccount.user_id._id}/add-credits`
          : `/api/credit/user/${selectedAccount.user_id._id}/deduct-credits`;

      await apiClient.post(endpoint, {
        amount: parseFloat(transactionData.amount),
        description: transactionData.description || "Manual transaction",
        processed_by: "Admin",
      });

      toast.success(
        `Credits ${transactionData.transaction_type === "credit" ? "added" : "deducted"} successfully`
      );
      setOpenTransactionDialog(false);
      fetchAccounts();
      fetchStats();
    } catch (error) {
      console.error("Error processing transaction:", error);
      toast.error(error.response?.data?.message || "Failed to process transaction");
    }
  };

  // Toggle block status
  const handleToggleBlock = async (userId) => {
    try {
      await apiClient.post(`/api/credit/user/${userId}/toggle-block`, {
        processed_by: "Admin",
        reason: "Blocked via admin dashboard",
      });
      toast.success("Account status updated");
      fetchAccounts();
    } catch (error) {
      console.error("Error toggling block:", error);
      toast.error("Failed to update account status");
    }
  };

  // Upgrade tier
  const handleUpgradeTier = async (userId, newTier) => {
    try {
      await apiClient.post(`/api/credit/user/${userId}/upgrade-tier`, {
        tier: newTier,
      });
      toast.success("Tier upgraded successfully");
      fetchAccounts();
    } catch (error) {
      console.error("Error upgrading tier:", error);
      toast.error("Failed to upgrade tier");
    }
  };

  // Tier colors and labels
  const getTierConfig = (tier) => {
    const configs = {
      bronze: { color: "#cd7f32", label: "Bronze", icon: "looks_3" },
      silver: { color: "#c0c0c0", label: "Silver", icon: "looks_two" },
      gold: { color: "#ffd700", label: "Gold", icon: "looks_one" },
      platinum: { color: "#e5e4e2", label: "Platinum", icon: "star" },
    };
    return configs[tier] || configs.bronze;
  };

  // Table columns
  const columns = [
    {
      Header: "User",
      accessor: "user",
      align: "left",
      Cell: ({ row }) => (
        <MDBox display="flex" alignItems="center">
          <Avatar sx={{ mr: 2, bgcolor: getTierConfig(row.original.tier).color }}>
            {row.original.user_id?.name?.charAt(0).toUpperCase()}
          </Avatar>
          <MDBox>
            <MDTypography variant="button" fontWeight="medium">
              {row.original.user_id?.name}
            </MDTypography>
            <MDTypography variant="caption" color="text" display="block">
              {row.original.user_id?.email}
            </MDTypography>
            <MDTypography variant="caption" color="text">
              {row.original.user_id?.mobile}
            </MDTypography>
          </MDBox>
        </MDBox>
      ),
    },
    {
      Header: "Current Balance",
      accessor: "current_balance",
      align: "center",
      Cell: ({ row }) => (
        <MDTypography variant="h6" fontWeight="bold" color="success">
          ₹{row.original.current_balance?.toFixed(2) || 0}
        </MDTypography>
      ),
    },
    {
      Header: "Tier",
      accessor: "tier",
      align: "center",
      Cell: ({ row }) => {
        const config = getTierConfig(row.original.tier);
        return (
          <Chip
            icon={<Icon>{config.icon}</Icon>}
            label={config.label}
            size="small"
            sx={{ backgroundColor: config.color, color: "white" }}
          />
        );
      },
    },
    {
      Header: "Lifetime Stats",
      accessor: "lifetime",
      align: "center",
      Cell: ({ row }) => (
        <MDBox>
          <MDTypography variant="caption" display="block" color="success">
            Earned: ₹{row.original.lifetime_earned?.toFixed(2) || 0}
          </MDTypography>
          <MDTypography variant="caption" display="block" color="error">
            Redeemed: ₹{row.original.lifetime_redeemed?.toFixed(2) || 0}
          </MDTypography>
          <MDTypography variant="caption" display="block" color="text">
            Total Transactions: {row.original.total_transactions}
          </MDTypography>
        </MDBox>
      ),
    },
    {
      Header: "Status",
      accessor: "is_blocked",
      align: "center",
      Cell: ({ row }) => (
        <Chip
          label={row.original.is_blocked ? "Blocked" : "Active"}
          size="small"
          color={row.original.is_blocked ? "error" : "success"}
        />
      ),
    },
    {
      Header: "Actions",
      accessor: "actions",
      align: "center",
      Cell: ({ row }) => (
        <MDBox display="flex" gap={1} justifyContent="center">
          <Tooltip title="Add Credits">
            <IconButton
              onClick={() => handleOpenTransaction(row.original, "credit")}
              size="small"
              color="success"
            >
              <Icon>add_circle</Icon>
            </IconButton>
          </Tooltip>
          <Tooltip title="Deduct Credits">
            <IconButton
              onClick={() => handleOpenTransaction(row.original, "debit")}
              size="small"
              color="warning"
            >
              <Icon>remove_circle</Icon>
            </IconButton>
          </Tooltip>
          <Tooltip title={row.original.is_blocked ? "Unblock" : "Block"}>
            <IconButton
              onClick={() => handleToggleBlock(row.original.user_id._id)}
              size="small"
              color={row.original.is_blocked ? "success" : "error"}
            >
              <Icon>{row.original.is_blocked ? "lock_open" : "block"}</Icon>
            </IconButton>
          </Tooltip>
          <Tooltip title="View Transactions">
            <IconButton
              onClick={() => setOpenDialog(true) || setSelectedAccount(row.original)}
              size="small"
              color="info"
            >
              <Icon>receipt</Icon>
            </IconButton>
          </Tooltip>
        </MDBox>
      ),
    },
  ];

  const rows = accounts;

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        {/* Statistics Cards */}
        <Grid container spacing={3} mb={3}>
          <Grid item xs={12} md={3}>
            <Card>
              <MDBox p={3} textAlign="center">
                <Icon fontSize="large" color="info">
                  account_balance_wallet
                </Icon>
                <MDTypography variant="h4" fontWeight="bold" color="info" mt={1}>
                  {stats.totalAccounts}
                </MDTypography>
                <MDTypography variant="caption" color="text">
                  Total Accounts
                </MDTypography>
              </MDBox>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <MDBox p={3} textAlign="center">
                <Icon fontSize="large" color="success">
                  trending_up
                </Icon>
                <MDTypography variant="h4" fontWeight="bold" color="success" mt={1}>
                  ₹{stats.total_credits_in_system?.toFixed(2) || 0}
                </MDTypography>
                <MDTypography variant="caption" color="text">
                  Total Credits in System
                </MDTypography>
              </MDBox>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <MDBox p={3} textAlign="center">
                <Icon fontSize="large" color="primary">
                  savings
                </Icon>
                <MDTypography variant="h4" fontWeight="bold" color="primary" mt={1}>
                  ₹{stats.avgBalance?.toFixed(2) || 0}
                </MDTypography>
                <MDTypography variant="caption" color="text">
                  Average Balance
                </MDTypography>
              </MDBox>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <MDBox p={3} textAlign="center">
                <Icon fontSize="large" color="warning">
                  percent
                </Icon>
                <MDTypography variant="h4" fontWeight="bold" color="warning" mt={1}>
                  {stats.redemptionRate || 0}%
                </MDTypography>
                <MDTypography variant="caption" color="text">
                  Redemption Rate
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
                Kisan Cash Credits Management
              </MDTypography>
            </MDBox>

            {/* Filters */}
            <Grid container spacing={2} mb={3}>
              <Grid item xs={12} md={4}>
                <MDInput
                  fullWidth
                  placeholder="Search by name, email, or mobile..."
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
                    <MenuItem value="false">Blocked Only</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Tier Filter</InputLabel>
                  <Select
                    value={filterTier}
                    onChange={(e) => setFilterTier(e.target.value)}
                    label="Tier Filter"
                    sx={{ fontSize: "1rem", padding: "10.5px 14px", height: "45px" }}
                  >
                    <MenuItem value="all">All Tiers</MenuItem>
                    <MenuItem value="bronze">Bronze</MenuItem>
                    <MenuItem value="silver">Silver</MenuItem>
                    <MenuItem value="gold">Gold</MenuItem>
                    <MenuItem value="platinum">Platinum</MenuItem>
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
                    setFilterTier("all");
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

      {/* Transaction Dialog */}
      <Dialog
        open={openTransactionDialog}
        onClose={() => setOpenTransactionDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {transactionData.transaction_type === "credit" ? "Add" : "Deduct"} Credits
        </DialogTitle>
        <DialogContent>
          <MDBox mt={2}>
            <MDTypography variant="body2" color="text" mb={2}>
              User: <strong>{selectedAccount?.user_id?.name}</strong>
              <br />
              Current Balance:{" "}
              <strong>₹{selectedAccount?.current_balance?.toFixed(2) || 0}</strong>
            </MDTypography>

            <TextField
              fullWidth
              type="number"
              label="Amount"
              value={transactionData.amount}
              onChange={(e) =>
                setTransactionData({ ...transactionData, amount: e.target.value })
              }
              placeholder="Enter amount"
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              multiline
              rows={3}
              label="Description"
              value={transactionData.description}
              onChange={(e) =>
                setTransactionData({ ...transactionData, description: e.target.value })
              }
              placeholder="Optional description"
            />
          </MDBox>
        </DialogContent>
        <DialogActions>
          <MDButton onClick={() => setOpenTransactionDialog(false)} color="secondary">
            Cancel
          </MDButton>
          <MDButton
            onClick={handleTransactionSubmit}
            variant="gradient"
            color={transactionData.transaction_type === "credit" ? "success" : "warning"}
          >
            {transactionData.transaction_type === "credit" ? "Add" : "Deduct"} Credits
          </MDButton>
        </DialogActions>
      </Dialog>

      <Footer />
    </DashboardLayout>
  );
}

export default KisanCreditsManagement;

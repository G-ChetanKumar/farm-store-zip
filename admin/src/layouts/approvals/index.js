import Avatar from "@mui/material/Avatar";
import Badge from "@mui/material/Badge";
import Box from "@mui/material/Box";
import ButtonGroup from "@mui/material/ButtonGroup";
import Card from "@mui/material/Card";
import Checkbox from "@mui/material/Checkbox";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import FormControl from "@mui/material/FormControl";
import Grid from "@mui/material/Grid";
import Icon from "@mui/material/Icon";
import IconButton from "@mui/material/IconButton";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import apiClient from "api/axios";
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import MDInput from "components/MDInput";
import MDTypography from "components/MDTypography";
import Footer from "examples/Footer";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import DataTable from "examples/Tables/DataTable";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

function ApprovalsManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterUserType, setFilterUserType] = useState("all");
  const [filterSource, setFilterSource] = useState("all"); // NEW: Filter by source
  const [selectedTab, setSelectedTab] = useState(0); // 0=Pending, 1=Approved, 2=Rejected
  const [selectedUsers, setSelectedUsers] = useState([]);

  // Dialogs
  const [approveDialog, setApproveDialog] = useState(false);
  const [rejectDialog, setRejectDialog] = useState(false);
  const [detailDialog, setDetailDialog] = useState(false);
  const [createUserDialog, setCreateUserDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [bulkAction, setBulkAction] = useState(false);

  // Form data
  const [approvalNotes, setApprovalNotes] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");

  // Create user form data
  const [newUserData, setNewUserData] = useState({
    name: "",
    email: "",
    mobile: "",
    user_type: "Agri-Retailer",
    password: "",
    status: "pending",
  });

  // Statistics
  const [stats, setStats] = useState({
    totalPending: 0,
    pendingAgriRetailers: 0,
    totalApproved: 0,
    totalRejected: 0,
    approvalRate: 0,
  });

  // Fetch users and entrepreneurs (unified)
  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      let allUsers = [];
      
      // Determine status based on tab
      let statusFilter = '';
      switch (selectedTab) {
        case 0: statusFilter = 'pending'; break;
        case 1: statusFilter = 'approved'; break; 
        case 2: statusFilter = 'rejected'; break;
      }
      
      // Fetch admin-created users
      const params = new URLSearchParams();
      if (selectedTab === 0) params.append("status", "pending");
      else if (selectedTab === 1) params.append("status", "active");
      else if (selectedTab === 2) params.append("status", "rejected");
      
      if (filterUserType !== "all") params.append("user_type", filterUserType);
      
      const adminUsersResponse = await apiClient.get(`/api/admin/users?${params}`);
      const adminUsers = (adminUsersResponse.data.data || []).map(u => ({
        ...u,
        source: u.source || 'admin_created',
        _isAdminUser: true
      }));
      
      // Fetch self-registered entrepreneurs
      const entrepreneurResponse = await apiClient.get("/api/entrepreneur/get-entrepreneurs");
      const entrepreneurs = (entrepreneurResponse.data.data || []).map(e => ({
        ...e,
        source: 'self_registered',
        mobile: e.phone || e.mobile,
        user_type: e.user_type || "Agri-Retailer", // Default to Agri-Retailer if not specified
        status: e.approval_status === 'approved' ? 'active' : e.approval_status,
        _isEntrepreneur: true
      }));
      
      // Filter entrepreneurs by status
      const filteredEntrepreneurs = entrepreneurs.filter(e => {
        if (statusFilter === 'pending') return e.approval_status === 'pending';
        if (statusFilter === 'approved') return e.approval_status === 'approved';
        if (statusFilter === 'rejected') return e.approval_status === 'rejected';
        return true;
      });
      
      // Filter by user type if specified (handle both formats: "Agri-Retailer" and "Agri_Retailer")
      const filteredByType = filterUserType !== "all"
        ? filteredEntrepreneurs.filter(e => {
            const normalizedUserType = (e.user_type || "").replace("-", "_").replace(" ", "_").toLowerCase();
            const normalizedFilter = filterUserType.replace("-", "_").replace(" ", "_").toLowerCase();
            return normalizedUserType === normalizedFilter;
          })
        : filteredEntrepreneurs;
      
      // Combine both sources
      allUsers = [...adminUsers, ...filteredByType];
      
      // Filter by source if specified
      if (filterSource !== "all") {
        allUsers = allUsers.filter(u => u.source === filterSource);
      }
      
      setUsers(allUsers);
      setSelectedUsers([]);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  // Fetch statistics (unified from both sources)
  const fetchStats = async () => {
    try {
      // Fetch admin users
      const [pendingAdmin, activeAdmin, rejectedAdmin] = await Promise.all([
        apiClient.get("/api/admin/users?status=pending"),
        apiClient.get("/api/admin/users?status=active"),
        apiClient.get("/api/admin/users?status=rejected"),
      ]);
      
      // Fetch entrepreneurs
      const entrepreneursRes = await apiClient.get("/api/entrepreneur/get-entrepreneurs");
      const entrepreneurs = entrepreneursRes.data.data || [];
      
      // Combine all users
      const allPending = [
        ...(pendingAdmin.data.data || []),
        ...entrepreneurs.filter(e => e.approval_status === 'pending')
      ];
      const allApproved = [
        ...(activeAdmin.data.data || []),
        ...entrepreneurs.filter(e => e.approval_status === 'approved')
      ];
      const allRejected = [
        ...(rejectedAdmin.data.data || []),
        ...entrepreneurs.filter(e => e.approval_status === 'rejected')
      ];
      
      const totalPending = allPending.length;
      const pendingAgriRetailers = allPending.filter(u => u.user_type === "Agri-Retailer").length;
      const totalApproved = allApproved.length;
      const totalRejected = allRejected.length;
      const approvalRate = totalApproved + totalRejected > 0 
        ? Math.round((totalApproved / (totalApproved + totalRejected)) * 100) 
        : 0;
      
      setStats({
        totalPending,
        pendingAgriRetailers,
        totalApproved,
        totalRejected,
        approvalRate,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchStats();
  }, [selectedTab, filterUserType, filterSource]);

  // Handle approve (unified for both admin users and entrepreneurs)
  const handleApprove = async () => {
    try {
      if (bulkAction) {
        // Bulk approve - need to separate admin users and entrepreneurs
        const results = await Promise.allSettled(
          selectedUsers.map(userId => {
            const user = users.find(u => u._id === userId);
            if (user._isEntrepreneur) {
              return apiClient.patch(`/api/entrepreneur/${userId}/approve`, {
                approval_notes: approvalNotes,
                password: generatePassword(),
              });
            } else {
              return apiClient.patch(`/api/admin/users/${userId}/approve`);
            }
          })
        );
        
        const successful = results.filter(r => r.status === 'fulfilled').length;
        const failed = results.filter(r => r.status === 'rejected').length;
        
        if (successful > 0) toast.success(`${successful} user(s) approved successfully`);
        if (failed > 0) toast.warning(`${failed} failed to approve`);
      } else {
        // Single approve
        if (selectedUser._isEntrepreneur) {
          await apiClient.patch(`/api/entrepreneur/${selectedUser._id}/approve`, {
            approval_notes: approvalNotes,
            password: generatePassword(),
          });
        } else {
          await apiClient.patch(`/api/admin/users/${selectedUser._id}/approve`);
        }
        toast.success("User approved successfully");
      }

      setApproveDialog(false);
      setApprovalNotes("");
      
      // Refresh data to show updated status
      await fetchUsers();
      await fetchStats();
      
      // If detail dialog is open, refresh the user data
      if (detailDialog && selectedUser) {
        await openDetailDialog(selectedUser);
      }
    } catch (error) {
      console.error("Error approving user:", error);
      toast.error(error.response?.data?.message || "Failed to approve user");
    }
  };
  
  // Generate password for entrepreneurs
  const generatePassword = () => {
    return Math.random().toString(36).slice(-8) + Math.random().toString(36).toUpperCase().slice(-4);
  };

  // Handle reject (unified for both admin users and entrepreneurs)
  const handleReject = async () => {
    try {
      if (!rejectionReason.trim()) {
        toast.error("Please provide a rejection reason");
        return;
      }

      if (bulkAction) {
        // Bulk reject - separate admin users and entrepreneurs
        const results = await Promise.allSettled(
          selectedUsers.map(userId => {
            const user = users.find(u => u._id === userId);
            if (user._isEntrepreneur) {
              return apiClient.patch(`/api/entrepreneur/${userId}/reject`, {
                rejection_reason: rejectionReason,
              });
            } else {
              return apiClient.patch(`/api/admin/users/${userId}/reject`, {
                reason: rejectionReason,
              });
            }
          })
        );
        
        const successful = results.filter(r => r.status === 'fulfilled').length;
        const failed = results.filter(r => r.status === 'rejected').length;
        
        if (successful > 0) toast.success(`${successful} user(s) rejected`);
        if (failed > 0) toast.warning(`${failed} failed to reject`);
      } else {
        // Single reject
        if (selectedUser._isEntrepreneur) {
          await apiClient.patch(`/api/entrepreneur/${selectedUser._id}/reject`, {
            rejection_reason: rejectionReason,
          });
        } else {
          await apiClient.patch(`/api/admin/users/${selectedUser._id}/reject`, {
            reason: rejectionReason,
          });
        }
        toast.success("User rejected successfully");
      }

      setRejectDialog(false);
      setRejectionReason("");
      
      // Refresh data to show updated status
      await fetchUsers();
      await fetchStats();
      
      // If detail dialog is open, refresh the user data
      if (detailDialog && selectedUser) {
        await openDetailDialog(selectedUser);
      }
    } catch (error) {
      console.error("Error rejecting user:", error);
      toast.error(error.response?.data?.message || "Failed to reject user");
    }
  };

  // Handle checkbox
  const handleSelectUser = (userId) => {
    setSelectedUsers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  // Open approve dialog
  const openApproveDialog = (user = null, bulk = false) => {
    setSelectedUser(user);
    setBulkAction(bulk);
    setApproveDialog(true);
  };

  // Open reject dialog
  const openRejectDialog = (user = null, bulk = false) => {
    setSelectedUser(user);
    setBulkAction(bulk);
    setRejectDialog(true);
  };

  // Open detail dialog - Fetch fresh data from API
  const openDetailDialog = async (user) => {
    try {
      setDetailDialog(true);
      setSelectedUser({ ...user, _loading: true }); // Show loading state
      
      // Fetch latest user data from API
      let freshUserData;
      
      if (user._isEntrepreneur) {
        // Fetch entrepreneur data
        const response = await apiClient.get(`/api/entrepreneur/get-by-id-entrepreneur/${user._id}`);
        freshUserData = {
          ...response.data.data,
          source: 'self_registered',
          mobile: response.data.data.phone || response.data.data.mobile,
          user_type: response.data.data.user_type || "Agri-Retailer",
          status: response.data.data.approval_status === 'approved' ? 'active' : response.data.data.approval_status,
          _isEntrepreneur: true
        };
      } else {
        // Fetch admin-created user data
        const response = await apiClient.get(`/api/admin/users/${user._id}`);
        freshUserData = {
          ...response.data.data,
          source: user.source || 'admin_created',
          _isAdminUser: true
        };
      }
      
      setSelectedUser(freshUserData);
      console.log("✅ Fetched fresh user data:", freshUserData);
    } catch (error) {
      console.error("❌ Error fetching user details:", error);
      toast.error("Failed to fetch latest user data");
      setSelectedUser(user); // Fallback to cached data
    }
  };

  // Open create user dialog
  const openCreateUserDialog = () => {
    setCreateUserDialog(true);
    setNewUserData({
      name: "",
      email: "",
      mobile: "",
      user_type: "Agri-Retailer",
      password: "",
      status: "pending",
    });
  };

  // Close create user dialog
  const closeCreateUserDialog = () => {
    setCreateUserDialog(false);
    setNewUserData({
      name: "",
      email: "",
      mobile: "",
      user_type: "Agri-Retailer",
      password: "",
      status: "pending",
    });
  };

  // Handle create user
  const handleCreateUser = async () => {
    try {
      // Validation
      if (!newUserData.name.trim()) {
        toast.error("Please enter user name");
        return;
      }
      if (!newUserData.mobile.trim()) {
        toast.error("Please enter mobile number");
        return;
      }
      if (newUserData.mobile.length !== 10) {
        toast.error("Mobile number must be 10 digits");
        return;
      }
      if (!newUserData.password || newUserData.password.length < 6) {
        toast.error("Password must be at least 6 characters");
        return;
      }

      // Create user
      await apiClient.post("/api/user/add-user", newUserData);

      toast.success("User created successfully! Check Pending tab.");
      closeCreateUserDialog();
      
      // Refresh the list if on pending tab
      if (selectedTab === 0) {
        fetchUsers();
      }
      fetchStats();
    } catch (error) {
      console.error("Error creating user:", error);
      toast.error(error.response?.data?.message || "Failed to create user");
    }
  };

  // Handle form input change
  const handleNewUserChange = (field, value) => {
    setNewUserData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Get user type badge color
  const getUserTypeColor = (type) => {
    const colors = {
      agri_retailer: "warning",
      farmer: "success",
      agent: "info",
      retailer: "primary",
      entrepreneur: "secondary",
    };
    return colors[type] || "default";
  };

  // Table columns for pending
  const pendingColumns = [
    {
      Header: (
        <Checkbox
          checked={selectedUsers.length === users.length && users.length > 0}
          indeterminate={selectedUsers.length > 0 && selectedUsers.length < users.length}
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedUsers(users.map((u) => u._id));
            } else {
              setSelectedUsers([]);
            }
          }}
        />
      ),
      accessor: "select",
      width: "5%",
      Cell: ({ row }) => (
        <Checkbox
          checked={selectedUsers.includes(row.original._id)}
          onChange={() => handleSelectUser(row.original._id)}
        />
      ),
    },
    {
      Header: "User",
      accessor: "user",
      align: "left",
      Cell: ({ row }) => (
        <MDBox display="flex" alignItems="center">
          <Avatar sx={{ mr: 2, bgcolor: "#1976d2" }}>
            {row.original.name?.charAt(0).toUpperCase()}
          </Avatar>
          <MDBox>
            <MDTypography variant="button" fontWeight="medium">
              {row.original.name}
            </MDTypography>
            <MDTypography variant="caption" color="text" display="block">
              {row.original.email || "No email"}
            </MDTypography>
            <MDTypography variant="caption" color="text">
              {row.original.mobile}
            </MDTypography>
          </MDBox>
        </MDBox>
      ),
    },
    {
      Header: "User Type",
      accessor: "user_type",
      align: "center",
      Cell: ({ row }) => {
        const userType = row.original.user_type || "Unknown";
        return (
          <Chip
            label={userType.replace("_", "-").replace("-", " ").toUpperCase()}
            size="small"
            color={getUserTypeColor(userType.toLowerCase().replace("-", "_"))}
          />
        );
      },
    },
    {
      Header: "Source",
      accessor: "source",
      align: "center",
      Cell: ({ row }) => (
        <Chip
          label={row.original.source === 'self_registered' ? 'Self-Reg' : 'Admin'}
          size="small"
          color={row.original.source === 'self_registered' ? 'info' : 'default'}
          icon={<Icon fontSize="small">{row.original.source === 'self_registered' ? 'person_add' : 'admin_panel_settings'}</Icon>}
        />
      ),
    },
    {
      Header: "Location",
      accessor: "location",
      align: "left",
      Cell: ({ row }) => (
        <MDBox>
          <MDTypography variant="caption" display="block">
            {row.original.city || "-"}
          </MDTypography>
          <MDTypography variant="caption" color="text">
            {row.original.state || "-"}
          </MDTypography>
        </MDBox>
      ),
    },
    {
      Header: "Requested On",
      accessor: "createdAt",
      align: "center",
      Cell: ({ row }) => (
        <MDTypography variant="caption">
          {new Date(row.original.createdAt).toLocaleDateString()}
        </MDTypography>
      ),
    },
    {
      Header: "Actions",
      accessor: "actions",
      align: "center",
      Cell: ({ row }) => (
        <MDBox display="flex" gap={1} justifyContent="center">
          <Tooltip title="View Details">
            <IconButton onClick={() => openDetailDialog(row.original)} size="small" color="info">
              <Icon>visibility</Icon>
            </IconButton>
          </Tooltip>
          <Tooltip title="Approve">
            <IconButton
              onClick={() => openApproveDialog(row.original, false)}
              size="small"
              color="success"
            >
              <Icon>check_circle</Icon>
            </IconButton>
          </Tooltip>
          <Tooltip title="Reject">
            <IconButton
              onClick={() => openRejectDialog(row.original, false)}
              size="small"
              color="error"
            >
              <Icon>cancel</Icon>
            </IconButton>
          </Tooltip>
        </MDBox>
      ),
    },
  ];

  // Table columns for approved/rejected
  const historyColumns = [
    {
      Header: "User",
      accessor: "user",
      align: "left",
      Cell: ({ row }) => (
        <MDBox display="flex" alignItems="center">
          <Avatar sx={{ mr: 2, bgcolor: "#1976d2" }}>
            {row.original.name?.charAt(0).toUpperCase()}
          </Avatar>
          <MDBox>
            <MDTypography variant="button" fontWeight="medium">
              {row.original.name}
            </MDTypography>
            <MDTypography variant="caption" color="text" display="block">
              {row.original.email || "No email"}
            </MDTypography>
          </MDBox>
        </MDBox>
      ),
    },
    {
      Header: "User Type",
      accessor: "user_type",
      align: "center",
      Cell: ({ row }) => {
        const userType = row.original.user_type || "Unknown";
        return (
          <Chip
            label={userType.replace("_", "-").replace("-", " ").toUpperCase()}
            size="small"
            color={getUserTypeColor(userType.toLowerCase().replace("-", "_"))}
          />
        );
      },
    },
    {
      Header: selectedTab === 1 ? "Approved By" : "Rejected By",
      accessor: "approved_by",
      align: "left",
      Cell: ({ row }) => (
        <MDTypography variant="caption">
          {row.original.approved_by?.name || "System"}
        </MDTypography>
      ),
    },
    {
      Header: selectedTab === 1 ? "Approved On" : "Rejected On",
      accessor: "date",
      align: "center",
      Cell: ({ row }) => (
        <MDTypography variant="caption">
          {new Date(
            row.original.approved_at || row.original.rejected_at
          ).toLocaleDateString()}
        </MDTypography>
      ),
    },
    {
      Header: "Actions",
      accessor: "actions",
      align: "center",
      Cell: ({ row }) => (
        <Tooltip title="View Details">
          <IconButton onClick={() => openDetailDialog(row.original)} size="small" color="info">
            <Icon>visibility</Icon>
          </IconButton>
        </Tooltip>
      ),
    },
  ];

  const columns = selectedTab === 0 ? pendingColumns : historyColumns;
  const rows = users;

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        {/* Only User Approvals - Entrepreneur approvals moved to /entrepreneur page */}
        {/* Statistics Cards */}
        <Grid container spacing={3} mb={3}>
          <Grid item xs={12} md={3}>
            <Card>
              <MDBox p={3} textAlign="center">
                <Badge badgeContent={stats.pendingAgriRetailers} color="error">
                  <Icon fontSize="large" color="warning">
                    pending_actions
                  </Icon>
                </Badge>
                <MDTypography variant="h4" fontWeight="bold" color="warning" mt={1}>
                  {stats.totalPending}
                </MDTypography>
                <MDTypography variant="caption" color="text">
                  Pending Approvals
                </MDTypography>
              </MDBox>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <MDBox p={3} textAlign="center">
                <Icon fontSize="large" color="success">
                  check_circle
                </Icon>
                <MDTypography variant="h4" fontWeight="bold" color="success" mt={1}>
                  {stats.totalApproved}
                </MDTypography>
                <MDTypography variant="caption" color="text">
                  Total Approved
                </MDTypography>
              </MDBox>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <MDBox p={3} textAlign="center">
                <Icon fontSize="large" color="error">
                  cancel
                </Icon>
                <MDTypography variant="h4" fontWeight="bold" color="error" mt={1}>
                  {stats.totalRejected}
                </MDTypography>
                <MDTypography variant="caption" color="text">
                  Total Rejected
                </MDTypography>
              </MDBox>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <MDBox p={3} textAlign="center">
                <Icon fontSize="large" color="info">
                  trending_up
                </Icon>
                <MDTypography variant="h4" fontWeight="bold" color="info" mt={1}>
                  {stats.approvalRate}%
                </MDTypography>
                <MDTypography variant="caption" color="text">
                  Approval Rate
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
                User Approvals Management
              </MDTypography>
              <MDBox display="flex" gap={1}>
                {selectedTab === 0 && selectedUsers.length > 0 && (
                  <>
                    <MDButton
                      variant="gradient"
                      color="success"
                      size="small"
                      onClick={() => openApproveDialog(null, true)}
                    >
                      <Icon sx={{ mr: 1 }}>check_circle</Icon>
                      Approve Selected ({selectedUsers.length})
                    </MDButton>
                    <MDButton
                      variant="gradient"
                      color="error"
                      size="small"
                      onClick={() => openRejectDialog(null, true)}
                    >
                      <Icon sx={{ mr: 1 }}>cancel</Icon>
                      Reject Selected ({selectedUsers.length})
                    </MDButton>
                  </>
                )}
                <MDButton
                  variant="gradient"
                  color="info"
                  size="small"
                  onClick={openCreateUserDialog}
                >
                  <Icon sx={{ mr: 1 }}>person_add</Icon>
                  Create User
                </MDButton>
              </MDBox>
            </MDBox>

            {/* Tabs */}
            <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
              <Tabs value={selectedTab} onChange={(e, newValue) => setSelectedTab(newValue)}>
                <Tab
                  label={
                    <Badge badgeContent={stats.totalPending} color="error">
                      <span>Pending</span>
                    </Badge>
                  }
                />
                <Tab label="Approved" />
                <Tab label="Rejected" />
              </Tabs>
            </Box>

            {/* Filters */}
            <Grid container spacing={2} mb={3}>
              <Grid item xs={12} md={4}>
                <MDInput
                  fullWidth
                  placeholder="Search by name, email, or mobile..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>User Type Filter</InputLabel>
                  <Select
                    value={filterUserType}
                    onChange={(e) => setFilterUserType(e.target.value)}
                    label="User Type Filter"
                    sx={{ fontSize: "1rem", padding: "10.5px 14px", height: "45px" }}
                  >
                    <MenuItem value="all">All Types</MenuItem>
                    <MenuItem value="Farmer">Farmer</MenuItem>
                    <MenuItem value="Agent">Agent</MenuItem>
                    <MenuItem value="Agri-Retailer">Agri-Retailer</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Source Filter</InputLabel>
                  <Select
                    value={filterSource}
                    onChange={(e) => setFilterSource(e.target.value)}
                    label="Source Filter"
                    sx={{ fontSize: "1rem", padding: "10.5px 14px", height: "45px" }}
                  >
                    <MenuItem value="all">All Sources</MenuItem>
                    <MenuItem value="admin_created">Admin Created</MenuItem>
                    <MenuItem value="self_registered">Self-Registered</MenuItem>
                  </Select>
                </FormControl>
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

      {/* Approve Dialog */}
      <Dialog open={approveDialog} onClose={() => setApproveDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {bulkAction
            ? `Approve ${selectedUsers.length} User(s)`
            : `Approve ${selectedUser?.name}`}
        </DialogTitle>
        <DialogContent>
          <MDBox mt={2}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Approval Notes (Optional)"
              value={approvalNotes}
              onChange={(e) => setApprovalNotes(e.target.value)}
              placeholder="Add any notes for this approval..."
            />
          </MDBox>
        </DialogContent>
        <DialogActions>
          <MDButton onClick={() => setApproveDialog(false)} color="secondary">
            Cancel
          </MDButton>
          <MDButton onClick={handleApprove} variant="gradient" color="success">
            <Icon sx={{ mr: 1 }}>check_circle</Icon>
            Approve
          </MDButton>
        </DialogActions>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialog} onClose={() => setRejectDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {bulkAction
            ? `Reject ${selectedUsers.length} User(s)`
            : `Reject ${selectedUser?.name}`}
        </DialogTitle>
        <DialogContent>
          <MDBox mt={2}>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Rejection Reason *"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Please provide a reason for rejection..."
              required
            />
          </MDBox>
        </DialogContent>
        <DialogActions>
          <MDButton onClick={() => setRejectDialog(false)} color="secondary">
            Cancel
          </MDButton>
          <MDButton onClick={handleReject} variant="gradient" color="error">
            <Icon sx={{ mr: 1 }}>cancel</Icon>
            Reject
          </MDButton>
        </DialogActions>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={detailDialog} onClose={() => setDetailDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          User Details
          {selectedUser?._loading && (
            <MDTypography variant="caption" color="info" sx={{ ml: 2 }}>
              (Loading latest data...)
            </MDTypography>
          )}
        </DialogTitle>
        <DialogContent>
          {selectedUser && (
            <MDBox mt={2}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <MDBox display="flex" alignItems="center" mb={2}>
                    <Avatar sx={{ width: 60, height: 60, mr: 2, bgcolor: "#1976d2" }}>
                      {selectedUser.name?.charAt(0).toUpperCase()}
                    </Avatar>
                    <MDBox>
                      <MDTypography variant="h6">{selectedUser.name}</MDTypography>
                      <Chip
                        label={(selectedUser.user_type || "Unknown").replace("_", "-").replace("-", " ").toUpperCase()}
                        size="small"
                        color={getUserTypeColor((selectedUser.user_type || "").toLowerCase().replace("-", "_"))}
                      />
                    </MDBox>
                  </MDBox>
                </Grid>
                <Grid item xs={6}>
                  <MDTypography variant="caption" color="text">
                    Email
                  </MDTypography>
                  <MDTypography variant="button" fontWeight="medium">
                    {selectedUser.email || "Not provided"}
                  </MDTypography>
                </Grid>
                <Grid item xs={6}>
                  <MDTypography variant="caption" color="text">
                    Mobile
                  </MDTypography>
                  <MDTypography variant="button" fontWeight="medium">
                    {selectedUser.mobile}
                  </MDTypography>
                </Grid>
                <Grid item xs={6}>
                  <MDTypography variant="caption" color="text">
                    City
                  </MDTypography>
                  <MDTypography variant="button" fontWeight="medium">
                    {selectedUser.city || "Not provided"}
                  </MDTypography>
                </Grid>
                <Grid item xs={6}>
                  <MDTypography variant="caption" color="text">
                    State
                  </MDTypography>
                  <MDTypography variant="button" fontWeight="medium">
                    {selectedUser.state || "Not provided"}
                  </MDTypography>
                </Grid>
                <Grid item xs={12}>
                  <MDTypography variant="caption" color="text">
                    Address
                  </MDTypography>
                  <MDTypography variant="button" fontWeight="medium">
                    {selectedUser.address || "Not provided"}
                  </MDTypography>
                </Grid>
                <Grid item xs={6}>
                  <MDTypography variant="caption" color="text">
                    Approval Status
                  </MDTypography>
                  <MDTypography variant="button" fontWeight="medium">
                    <Chip
                      label={selectedUser.approval_status?.toUpperCase() || selectedUser.status?.toUpperCase()}
                      size="small"
                      sx={{
                        backgroundColor: 
                          (selectedUser.approval_status === "approved" || selectedUser.status === "active")
                            ? "#4caf50" // Green for approved
                            : (selectedUser.approval_status === "rejected" || selectedUser.status === "rejected")
                            ? "#f44336" // Red for rejected
                            : "#fb8c00", // #fb8c00 for pending
                        color: "white",
                        fontWeight: "bold"
                      }}
                    />
                  </MDTypography>
                </Grid>
                <Grid item xs={6}>
                  <MDTypography variant="caption" color="text">
                    Joined Date
                  </MDTypography>
                  <MDTypography variant="button" fontWeight="medium">
                    {new Date(selectedUser.createdAt).toLocaleDateString()}
                  </MDTypography>
                </Grid>
                {selectedUser.approved_at && (
                  <Grid item xs={6}>
                    <MDTypography variant="caption" color="text">
                      Approved On
                    </MDTypography>
                    <MDTypography variant="button" fontWeight="medium">
                      {new Date(selectedUser.approved_at).toLocaleDateString()}
                    </MDTypography>
                  </Grid>
                )}
                {selectedUser.rejected_at && (
                  <Grid item xs={6}>
                    <MDTypography variant="caption" color="text">
                      Rejected On
                    </MDTypography>
                    <MDTypography variant="button" fontWeight="medium">
                      {new Date(selectedUser.rejected_at).toLocaleDateString()}
                    </MDTypography>
                  </Grid>
                )}
                {selectedUser.rejection_reason && (
                  <Grid item xs={12}>
                    <MDTypography variant="caption" color="text">
                      Rejection Reason
                    </MDTypography>
                    <MDTypography variant="body2" color="error">
                      {selectedUser.rejection_reason}
                    </MDTypography>
                  </Grid>
                )}
                {selectedUser.approval_notes && (
                  <Grid item xs={12}>
                    <MDTypography variant="caption" color="text">
                      Approval Notes
                    </MDTypography>
                    <MDTypography variant="body2">
                      {selectedUser.approval_notes}
                    </MDTypography>
                  </Grid>
                )}
              </Grid>
            </MDBox>
          )}
        </DialogContent>
        <DialogActions>
          <MDButton onClick={() => setDetailDialog(false)} color="secondary">
            Close
          </MDButton>
          {selectedUser?.approval_status === "pending" && (
            <>
              <MDButton
                onClick={() => {
                  setDetailDialog(false);
                  openApproveDialog(selectedUser, false);
                }}
                variant="gradient"
                color="success"
              >
                Approve
              </MDButton>
              <MDButton
                onClick={() => {
                  setDetailDialog(false);
                  openRejectDialog(selectedUser, false);
                }}
                variant="gradient"
                color="error"
              >
                Reject
              </MDButton>
            </>
          )}
        </DialogActions>
      </Dialog>

      {/* Create User Dialog */}
      <Dialog open={createUserDialog} onClose={closeCreateUserDialog} maxWidth="md" fullWidth>
        <DialogTitle>Create New User</DialogTitle>
        <DialogContent>
          <MDBox mt={2}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Full Name *"
                  value={newUserData.name}
                  onChange={(e) => handleNewUserChange("name", e.target.value)}
                  placeholder="e.g., John Doe"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Mobile Number *"
                  value={newUserData.mobile}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    if (value.length <= 10) {
                      handleNewUserChange("mobile", value);
                    }
                  }}
                  placeholder="10 digit mobile"
                  helperText={
                    newUserData.mobile && newUserData.mobile.length !== 10
                      ? "Must be 10 digits"
                      : ""
                  }
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={newUserData.email}
                  onChange={(e) => handleNewUserChange("email", e.target.value)}
                  placeholder="email@example.com"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>User Type *</InputLabel>
                  <Select
                    value={newUserData.user_type}
                    onChange={(e) => handleNewUserChange("user_type", e.target.value)}
                    label="User Type *"
                    sx={{ height: "56px" }}
                  >
                    <MenuItem value="Agri-Retailer">AGRI-RETAILER</MenuItem>
                    <MenuItem value="Farmer">Farmer</MenuItem>
                    <MenuItem value="Agent">Agent</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Password *"
                  type="password"
                  value={newUserData.password}
                  onChange={(e) => handleNewUserChange("password", e.target.value)}
                  placeholder="Min 6 characters"
                  helperText={
                    newUserData.password && newUserData.password.length < 6
                      ? "Password must be at least 6 characters"
                      : ""
                  }
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Approval Status *</InputLabel>
                  <Select
                    value={newUserData.status}
                    onChange={(e) => handleNewUserChange("status", e.target.value)}
                    label="Approval Status *"
                    sx={{ height: "56px" }}
                  >
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="rejected">Rejected</MenuItem>
                    <MenuItem value="blocked">Blocked</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <Box
                  sx={{
                    p: 2,
                    backgroundColor: newUserData.user_type === "Agri-Retailer" ? "#fff3e0" : "#e3f2fd",
                    borderRadius: 1,
                    border: "1px solid",
                    borderColor: newUserData.user_type === "Agri-Retailer" ? "#ff9800" : "#2196f3",
                  }}
                >
                  <MDTypography variant="caption" fontWeight="bold" color="text">
                    <Icon fontSize="small" sx={{ verticalAlign: "middle", mr: 0.5 }}>
                      info
                    </Icon>
                    {newUserData.user_type === "Agri-Retailer"
                      ? "AGRI-RETAILER users typically start with PENDING status and require approval."
                      : `Creating ${newUserData.user_type} with ${newUserData.status.toUpperCase()} status.`}
                  </MDTypography>
                </Box>
              </Grid>
            </Grid>
          </MDBox>
        </DialogContent>
        <DialogActions>
          <MDButton onClick={closeCreateUserDialog} color="secondary">
            Cancel
          </MDButton>
          <MDButton
            onClick={handleCreateUser}
            variant="gradient"
            color="info"
            disabled={
              !newUserData.name.trim() ||
              !newUserData.mobile.trim() ||
              newUserData.mobile.length !== 10 ||
              !newUserData.password ||
              newUserData.password.length < 6
            }
          >
            <Icon sx={{ mr: 1 }}>person_add</Icon>
            Create User
          </MDButton>
        </DialogActions>
      </Dialog>
      </MDBox>

      <Footer />
    </DashboardLayout>
  );
}

export default ApprovalsManagement;

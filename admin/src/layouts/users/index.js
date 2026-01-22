import {
  Block,
  CheckCircle,
  Close,
  Delete,
  Edit,
  Group,
  HourglassEmpty,
  People,
  PersonAdd,
  RestartAlt,
  Search
} from "@mui/icons-material";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import OutlinedInput from "@mui/material/OutlinedInput";
import apiClient from "api/axios";
import MDBox from "components/MDBox";
import Footer from "examples/Footer";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import { useEffect, useState } from "react";

const UsersManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [userStats, setUserStats] = useState(null);
  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    user_type: "all",
    role: "all",
  });
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    user_type: "farmer",
    password: "",
    status: "pending",
    role: "user",
    address: "",
    city: "",
    state: "",
    pincode: "",
    notes: "",
  });
  const [bulkActionDialogOpen, setBulkActionDialogOpen] = useState(false);
  const [bulkStatus, setBulkStatus] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [userSubscription, setUserSubscription] = useState(null);
  const [loadingSubscription, setLoadingSubscription] = useState(false);

  useEffect(() => {
    fetchUsers();
    fetchUserStats();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/api/user/get-user");
      setUsers(response.data);
      setFilteredUsers(response.data);
    } catch (err) {
      setError("Failed to fetch users");
      console.error("Error:", err);
      showSnackbar("Failed to fetch users", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserStats = async () => {
    try {
      const response = await apiClient.get("/api/user/user-stats");
      setUserStats(response.data);
    } catch (err) {
      console.error("Error fetching user stats:", err);
    }
  };

  const fetchUserSubscription = async (userId) => {
    setLoadingSubscription(true);
    setUserSubscription(null);
    try {
      const response = await apiClient.get(`/v1/membership/subscription/${userId}`);
      if (response.data.success) {
        setUserSubscription(response.data.data);
      }
    } catch (err) {
      // No subscription or error - that's okay
      console.log("No subscription found for user");
    } finally {
      setLoadingSubscription(false);
    }
  };

  useEffect(() => {
    let result = users;

    if (filters.search) {
      result = result.filter(
        (user) =>
          user.name?.toLowerCase().includes(filters.search.toLowerCase()) ||
          user.email?.toLowerCase().includes(filters.search.toLowerCase()) ||
          user.mobile?.includes(filters.search)
      );
    }

    if (filters.status !== "all") {
      result = result.filter((user) => user.status === filters.status);
    }

    if (filters.user_type !== "all") {
      result = result.filter((user) => user.user_type === filters.user_type);
    }

    if (filters.role !== "all") {
      result = result.filter((user) => user.role === filters.role);
    }

    setFilteredUsers(result);
  }, [filters, users]);

  const getStatusColor = (status) => {
    const colors = {
      active: "success",
      pending: "warning",
      inactive: "default",
      suspended: "error",
      banned: "error",
    };
    return colors[status] || "default";
  };

  const getStatusIcon = (status) => {
    const icons = {
      active: <CheckCircle fontSize="small" />,
      pending: <HourglassEmpty fontSize="small" />,
      suspended: <Block fontSize="small" />,
      banned: <Block fontSize="small" />,
    };
    return icons[status] || null;
  };

  const showSnackbar = (message, severity = "success") => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const resetFilters = () => {
    setFilters({
      search: "",
      status: "all",
      user_type: "all",
      role: "all",
    });
  };

  const handleSelectUser = (userId) => {
    setSelectedUsers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map((user) => user._id));
    }
  };

  const handleOpenDialog = (user = null) => {
    if (user) {
      setEditMode(true);
      setSelectedUser(user);
      // Fetch user's subscription
      fetchUserSubscription(user._id);
      setFormData({
        name: user.name || "",
        email: user.email || "",
        mobile: user.mobile || "",
        user_type: user.user_type || "farmer",
        password: "",
        status: user.status || "pending",
        role: user.role || "user",
        address: user.address || "",
        city: user.city || "",
        state: user.state || "",
        pincode: user.pincode || "",
        notes: user.notes || "",
      });
    } else {
      setEditMode(false);
      setSelectedUser(null);
      setFormData({
        name: "",
        email: "",
        mobile: "",
        user_type: "farmer",
        password: "",
        status: "pending",
        role: "user",
        address: "",
        city: "",
        state: "",
        pincode: "",
        notes: "",
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditMode(false);
    setSelectedUser(null);
  };

  const handleSubmit = async () => {
    try {
      if (editMode) {
        const updateData = { ...formData };
        if (!updateData.password) {
          delete updateData.password;
        }
        await apiClient.put(`/api/user/update-user/${selectedUser._id}`, updateData);
        showSnackbar("User updated successfully", "success");
      } else {
        await apiClient.post("/api/user/add-user", formData);
        showSnackbar("User created successfully", "success");
      }
      handleCloseDialog();
      fetchUsers();
      fetchUserStats();
    } catch (err) {
      console.error("Error:", err);
      showSnackbar(err.response?.data?.message || "Failed to save user", "error");
    }
  };

  const handleUpdateStatus = async (userId, status) => {
    try {
      await apiClient.put(`/api/user/update-user/${userId}`, { status });
      showSnackbar(`User status updated to ${status}`, "success");
      fetchUsers();
      fetchUserStats();
    } catch (err) {
      console.error("Error:", err);
      showSnackbar("Failed to update status", "error");
    }
  };

  const handleUpdateRole = async (userId, role) => {
    try {
      await apiClient.put(`/api/user/update-user/${userId}`, { role });
      showSnackbar(`User role updated to ${role}`, "success");
      fetchUsers();
      fetchUserStats();
    } catch (err) {
      console.error("Error:", err);
      showSnackbar("Failed to update role", "error");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) {
      return;
    }

    try {
      await apiClient.delete(`/api/user/delete-user/${id}`);
      showSnackbar("User deleted successfully", "success");
      fetchUsers();
      fetchUserStats();
    } catch (err) {
      console.error("Error:", err);
      showSnackbar("Failed to delete user", "error");
    }
  };

  const handleBulkAction = async () => {
    if (selectedUsers.length === 0) {
      showSnackbar("Please select users first", "warning");
      return;
    }

    if (!bulkStatus) {
      showSnackbar("Please select a status", "warning");
      return;
    }

    try {
      await apiClient.post("/api/user/bulk-update-status", {
        user_ids: selectedUsers,
        status: bulkStatus,
      });
      showSnackbar(`${selectedUsers.length} user(s) updated successfully`, "success");
      setBulkActionDialogOpen(false);
      setSelectedUsers([]);
      setBulkStatus("");
      fetchUsers();
      fetchUserStats();
    } catch (err) {
      console.error("Error:", err);
      showSnackbar("Failed to perform bulk action", "error");
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return "Just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return formatDate(dateString);
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
            Loading users...
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
        {userStats && (
          <Grid container spacing={3} mb={3}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ background: "linear-gradient(195deg, #42424a 0%, #191919 100%)" }}>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="body2" sx={{ color: '#ffffff', opacity: 0.9 }}>
                        Total Users
                      </Typography>
                      <Typography variant="h4" sx={{ color: '#ffffff', fontWeight: 'bold' }}>
                        {userStats.totalUsers}
                      </Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: "rgba(255,255,255,0.2)", width: 40, height: 40 }}>
                      <People sx={{ color: '#ffffff', fontSize: 24 }} />
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
                        Active Users
                      </Typography>
                      <Typography variant="h4" sx={{ color: '#ffffff', fontWeight: 'bold' }}>
                        {userStats.activeUsers}
                      </Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: "rgba(255,255,255,0.2)", width: 40, height: 40 }}>
                      <CheckCircle sx={{ color: '#ffffff', fontSize: 24 }} />
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
                        Pending Users
                      </Typography>
                      <Typography variant="h4" sx={{ color: '#ffffff', fontWeight: 'bold' }}>
                        {userStats.pendingUsers}
                      </Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: "rgba(255,255,255,0.2)", width: 40, height: 40 }}>
                      <HourglassEmpty sx={{ color: '#ffffff', fontSize: 24 }} />
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
                        Active Rate
                      </Typography>
                      <Typography variant="h4" sx={{ color: '#ffffff', fontWeight: 'bold' }}>
                        {userStats.activeRate}%
                      </Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: "rgba(255,255,255,0.2)", width: 40, height: 40}}>
                      <Group sx={{ color: '#ffffff', fontSize: 30 }} />
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
                  <Typography variant="h5">Users & Roles Management</Typography>
                  <Box display="flex" gap={1}>
                    {selectedUsers.length > 0 && (
                      <Button
                        variant="outlined"
                        onClick={() => setBulkActionDialogOpen(true)}
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
                        Bulk Actions ({selectedUsers.length})
                      </Button>
                    )}
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
                      startIcon={<PersonAdd />}
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
                      Add User
                    </Button>
                  </Box>
                </Box>

                {/* Filters */}
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={12} sm={3}>
                    <TextField
                      fullWidth
                      label="Search Name/Email/Mobile"
                      InputProps={{
                        startAdornment: <Search />,
                      }}
                      value={filters.search}
                      onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <FormControl fullWidth>
                      <InputLabel>Status</InputLabel>
                      <Select
                        value={filters.status}
                        label="Status"
                        onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
                        input={<OutlinedInput label="Status" />}
                        sx={{ fontSize: "1rem", padding: "10.5px 14px", height: "45px" }}
                      >
                        <MenuItem value="all">All Status</MenuItem>
                        <MenuItem value="active">Active</MenuItem>
                        <MenuItem value="pending">Pending</MenuItem>
                        <MenuItem value="inactive">Inactive</MenuItem>
                        <MenuItem value="suspended">Suspended</MenuItem>
                        <MenuItem value="banned">Banned</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <FormControl fullWidth>
                      <InputLabel>User Type</InputLabel>
                      <Select
                        value={filters.user_type}
                        label="User Type"
                        onChange={(e) =>
                          setFilters((prev) => ({ ...prev, user_type: e.target.value }))
                        }
                        input={<OutlinedInput label="User Type" />}
                        sx={{ fontSize: "1rem", padding: "10.5px 14px", height: "45px" }}
                      >
                        <MenuItem value="all">All Types</MenuItem>
                        <MenuItem value="farmer">Farmer</MenuItem>
                        <MenuItem value="agent">Agent</MenuItem>
                        <MenuItem value="retailer">Retailer</MenuItem>
                        <MenuItem value="agri_retailer">Agri Retailer</MenuItem>
                        <MenuItem value="entrepreneur">Entrepreneur</MenuItem>
                        <MenuItem value="admin">Admin</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <FormControl fullWidth>
                      <InputLabel>Role</InputLabel>
                      <Select
                        value={filters.role}
                        label="Role"
                        onChange={(e) => setFilters((prev) => ({ ...prev, role: e.target.value }))}
                        input={<OutlinedInput label="Role" />}
                        sx={{ fontSize: "1rem", padding: "10.5px 14px", height: "45px" }}
                      >
                        <MenuItem value="all">All Roles</MenuItem>
                        <MenuItem value="user">User</MenuItem>
                        <MenuItem value="admin">Admin</MenuItem>
                        <MenuItem value="super_admin">Super Admin</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>

                {/* Users Table */}
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
                          <Checkbox
                            checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                            indeterminate={
                              selectedUsers.length > 0 && selectedUsers.length < filteredUsers.length
                            }
                            onChange={handleSelectAll}
                          />
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
                          User
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
                          Contact
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
                          User Type
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
                          Status
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
                          Role
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
                          Joined Date
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
                          Last Active
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
                      {filteredUsers.map((user) => (
                        <TableRow
                          key={user._id}
                          sx={{
                            "&:hover": {
                              bgcolor: "grey.50",
                            },
                          }}
                        >
                          <TableCell sx={{ padding: "16px" }}>
                            <Checkbox
                              checked={selectedUsers.includes(user._id)}
                              onChange={() => handleSelectUser(user._id)}
                            />
                          </TableCell>
                          <TableCell sx={{ padding: "16px" }}>
                            <Box display="flex" alignItems="center" gap={1}>
                              <Avatar sx={{ bgcolor: "primary.main" }}>
                                {user.name?.[0]?.toUpperCase() || "U"}
                              </Avatar>
                              <Box>
                                <Typography variant="body2" fontWeight="medium">
                                  {user.name}
                                </Typography>
                                {user.email && (
                                  <Typography variant="caption" color="textSecondary">
                                    {user.email}
                                  </Typography>
                                )}
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell sx={{ padding: "16px" }}>
                            <Typography variant="body2">{user.mobile}</Typography>
                          </TableCell>
                          <TableCell sx={{ padding: "16px" }}>
                            <Chip
                              label={user.user_type?.replace("_", " ").toUpperCase()}
                              size="small"
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell sx={{ padding: "16px" }}>
                            <FormControl size="small" sx={{ minWidth: 120 }}>
                              <Select
                                value={user.status}
                                onChange={(e) => handleUpdateStatus(user._id, e.target.value)}
                                size="small"
                              >
                                <MenuItem value="active">Active</MenuItem>
                                <MenuItem value="pending">Pending</MenuItem>
                                <MenuItem value="inactive">Inactive</MenuItem>
                                <MenuItem value="suspended">Suspended</MenuItem>
                                <MenuItem value="banned">Banned</MenuItem>
                              </Select>
                            </FormControl>
                          </TableCell>
                          <TableCell sx={{ padding: "16px" }}>
                            <FormControl size="small" sx={{ minWidth: 120 }}>
                              <Select
                                value={user.role}
                                onChange={(e) => handleUpdateRole(user._id, e.target.value)}
                                size="small"
                              >
                                <MenuItem value="user">User</MenuItem>
                                <MenuItem value="admin">Admin</MenuItem>
                                <MenuItem value="super_admin">Super Admin</MenuItem>
                              </Select>
                            </FormControl>
                          </TableCell>
                          <TableCell sx={{ padding: "16px" }}>
                            <Typography variant="body2">{formatDate(user.joined_date)}</Typography>
                          </TableCell>
                          <TableCell sx={{ padding: "16px" }}>
                            <Typography variant="body2" color="textSecondary">
                              {getTimeAgo(user.last_active)}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ padding: "16px" }}>
                            <Box display="flex" gap={0.5}>
                              <Tooltip title="Edit">
                                <IconButton
                                  color="primary"
                                  size="small"
                                  onClick={() => handleOpenDialog(user)}
                                >
                                  <Edit fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete">
                                <IconButton
                                  color="error"
                                  size="small"
                                  onClick={() => handleDelete(user._id)}
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

                {filteredUsers.length === 0 && (
                  <Box textAlign="center" py={3}>
                    <Typography color="textSecondary">
                      No users found matching your filters
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </MDBox>

      {/* Add/Edit User Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h5">{editMode ? "Edit User" : "Add New User"}</Typography>
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
                label="Full Name *"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Mobile *"
                value={formData.mobile}
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={editMode ? "Password (leave empty to keep current)" : "Password *"}
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>User Type</InputLabel>
                <Select
                  value={formData.user_type}
                  label="User Type"
                  onChange={(e) => setFormData({ ...formData, user_type: e.target.value })}
                >
                  <MenuItem value="farmer">Farmer</MenuItem>
                  <MenuItem value="agent">Agent</MenuItem>
                  <MenuItem value="retailer">Retailer</MenuItem>
                  <MenuItem value="agri_retailer">Agri Retailer</MenuItem>
                  <MenuItem value="entrepreneur">Entrepreneur</MenuItem>
                  <MenuItem value="admin">Admin</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  label="Status"
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                  <MenuItem value="suspended">Suspended</MenuItem>
                  <MenuItem value="banned">Banned</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select
                  value={formData.role}
                  label="Role"
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                >
                  <MenuItem value="user">User</MenuItem>
                  <MenuItem value="admin">Admin</MenuItem>
                  <MenuItem value="super_admin">Super Admin</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
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
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="State"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Pincode"
                value={formData.pincode}
                onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
              />
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

            {/* Membership Section - Only show in edit mode */}
            {editMode && (
              <Grid item xs={12}>
                <Box 
                  sx={{ 
                    mt: 2, 
                    p: 2, 
                    border: '2px solid', 
                    borderColor: userSubscription ? 'success.main' : 'grey.300',
                    borderRadius: 2,
                    bgcolor: userSubscription ? 'success.50' : 'grey.50'
                  }}
                >
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <People /> Membership Status
                  </Typography>
                  
                  {loadingSubscription && (
                    <Box display="flex" justifyContent="center" p={2}>
                      <CircularProgress size={24} />
                    </Box>
                  )}
                  
                  {!loadingSubscription && userSubscription && (
                    <Box>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="textSecondary">Plan</Typography>
                          <Chip 
                            label={userSubscription.plan_id?.name || 'Unknown'} 
                            color="success" 
                            sx={{ fontWeight: 'bold', mt: 0.5 }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="textSecondary">Status</Typography>
                          <Chip 
                            label={userSubscription.status?.toUpperCase()} 
                            color={userSubscription.status === 'active' ? 'success' : 'default'}
                            icon={userSubscription.status === 'active' ? <CheckCircle /> : <HourglassEmpty />}
                            sx={{ fontWeight: 'bold', mt: 0.5 }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <Typography variant="body2" color="textSecondary">Expires On</Typography>
                          <Typography variant="body1" fontWeight="medium">
                            {new Date(userSubscription.expires_at).toLocaleDateString()}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {Math.ceil((new Date(userSubscription.expires_at) - new Date()) / (1000 * 60 * 60 * 24))} days left
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <Typography variant="body2" color="textSecondary">Purchases Left</Typography>
                          <Typography variant="body1" fontWeight="medium">
                            {userSubscription.purchases_left}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <Typography variant="body2" color="textSecondary">Created</Typography>
                          <Typography variant="body1" fontWeight="medium">
                            {new Date(userSubscription.createdAt).toLocaleDateString()}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Box>
                  )}
                  
                  {!loadingSubscription && !userSubscription && (
                    <Box textAlign="center" py={2}>
                      <Typography variant="body2" color="textSecondary">
                        No active membership
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit}>
            {editMode ? "Update" : "Create"} User
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bulk Action Dialog */}
      <Dialog open={bulkActionDialogOpen} onClose={() => setBulkActionDialogOpen(false)}>
        <DialogTitle>Bulk Update Status</DialogTitle>
        <DialogContent>
          <Box pt={2}>
            <Typography variant="body2" mb={2}>
              Update status for {selectedUsers.length} selected user(s)
            </Typography>
            <FormControl fullWidth>
              <InputLabel>New Status</InputLabel>
              <Select
                value={bulkStatus}
                label="New Status"
                onChange={(e) => setBulkStatus(e.target.value)}
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
                <MenuItem value="suspended">Suspended</MenuItem>
                <MenuItem value="banned">Banned</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBulkActionDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleBulkAction}>
            Update
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

export default UsersManagement;

import { useState, useEffect } from "react";
import {
  Card,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Box,
  Tab,
  Tabs,
  CircularProgress,
  Alert,
  Avatar
} from "@mui/material";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import apiClient from "api/axios";
import { toast } from "react-toastify";

function CounterUsers() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState([]);
  const [selectedCounter, setSelectedCounter] = useState(null);
  const [users, setUsers] = useState([]);
  const [tabValue, setTabValue] = useState(0);

  // Fetch counter statistics
  const fetchCounterStats = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/api/user-counter/counter-stats");
      console.log('Counter stats:', response.data);
      console.log('First counter:', response.data.counters?.[0]);
      setStats(response.data.counters || []);
    } catch (error) {
      console.error("Error fetching counter stats:", error);
      toast.error("Failed to fetch counter statistics");
    } finally {
      setLoading(false);
    }
  };

  // Fetch users for specific counter
  const fetchCounterUsers = async (counterId) => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/api/user-counter/counter-users/${counterId}`);
      console.log('Counter users:', response.data);
      setUsers(response.data.users || []);
      setSelectedCounter(response.data.counter);
    } catch (error) {
      console.error("Error fetching counter users:", error);
      toast.error("Failed to fetch users for this counter");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCounterStats();
  }, []);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    if (newValue === 0) {
      fetchCounterStats();
    }
  };

  const handleCounterClick = (counter) => {
    if (counter.totalUsers > 0) {
      fetchCounterUsers(counter.counter._id);
      setTabValue(1);
    } else {
      toast.info("No users have selected this counter yet");
    }
  };

  const getUserTypeColor = (userType) => {
    switch (userType) {
      case "Farmer":
        return "success";
      case "Agri-Retailer":
        return "primary";
      case "Agent":
        return "warning";
      default:
        return "default";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "success";
      case "pending":
        return "warning";
      case "blocked":
        return "error";
      default:
        return "default";
    }
  };

  if (loading && stats.length === 0) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </MDBox>
        <Footer />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        {/* Page Header */}
        <Card sx={{ mb: 3 }}>
          <MDBox p={3}>
            <MDTypography variant="h5" fontWeight="medium">
              Counter User Selections
            </MDTypography>
            <MDTypography variant="body2" color="text" mt={1}>
              View which users have selected each counter/store location
            </MDTypography>
          </MDBox>
        </Card>

        {/* Tabs */}
        <Card sx={{ mb: 3 }}>
          <Tabs value={tabValue} onChange={handleTabChange} sx={{ px: 3, pt: 2 }}>
            <Tab label="Counter Statistics" />
            <Tab label="User Details" disabled={!selectedCounter} />
          </Tabs>
        </Card>

        {/* Tab Content */}
        {tabValue === 0 && (
          <Grid container spacing={3}>
            {/* Summary Cards */}
            <Grid item xs={12} md={4}>
              <Card>
                <MDBox p={3} textAlign="center">
                  <MDTypography variant="h4" fontWeight="bold" color="info">
                    {stats.length}
                  </MDTypography>
                  <MDTypography variant="caption" color="text">
                    Total Counters
                  </MDTypography>
                </MDBox>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <MDBox p={3} textAlign="center">
                  <MDTypography variant="h4" fontWeight="bold" color="success">
                    {stats.reduce((sum, s) => sum + s.totalUsers, 0)}
                  </MDTypography>
                  <MDTypography variant="caption" color="text">
                    Users with Selection
                  </MDTypography>
                </MDBox>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <MDBox p={3} textAlign="center">
                  <MDTypography variant="h4" fontWeight="bold" color="warning">
                    {stats.filter(s => s.totalUsers === 0).length}
                  </MDTypography>
                  <MDTypography variant="caption" color="text">
                    Counters Without Users
                  </MDTypography>
                </MDBox>
              </Card>
            </Grid>

            {/* Counter Statistics Table */}
            <Grid item xs={12}>
              <Card>
                <MDBox p={3}>
                  <MDTypography variant="h6" fontWeight="medium" mb={3}>
                    Counter Statistics
                  </MDTypography>
                  
                  <TableContainer 
                    component={Paper} 
                    sx={{ 
                      boxShadow: 'none',
                      borderRadius: 0,
                      border: '1px solid #e0e0e0',
                      '& .MuiPaper-root': {
                        display: 'table',
                        borderRadius: 0
                      }
                    }}
                  >
                    <Table sx={{ display: 'table', width: '100%', tableLayout: 'fixed' }}>
                      <TableHead>
                        <TableRow sx={{ bgcolor: 'grey.200' }}>
                          <TableCell sx={{ width: '18%' }}><strong>Counter Name</strong></TableCell>
                          <TableCell sx={{ width: '12%' }}><strong>Pincode</strong></TableCell>
                          <TableCell sx={{ width: '15%' }}><strong>Agent</strong></TableCell>
                          <TableCell sx={{ width: '15%' }}><strong>Total Users</strong></TableCell>
                          <TableCell sx={{ width: '13%' }}><strong>Farmers</strong></TableCell>
                          <TableCell sx={{ width: '13%' }}><strong>Retailers</strong></TableCell>
                          <TableCell sx={{ width: '14%' }}><strong>Agents</strong></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {stats.map((stat, index) => (
                          <TableRow
                            key={index}
                            hover
                            onClick={() => handleCounterClick(stat)}
                            sx={{
                              cursor: stat.totalUsers > 0 ? 'pointer' : 'default',
                              '&:hover': {
                                backgroundColor: stat.totalUsers > 0 ? 'grey.50' : 'inherit'
                              }
                            }}
                          >
                            <TableCell>{stat.counter?.counterName || 'N/A'}</TableCell>
                            <TableCell>
                              <Chip 
                                label={stat.counter?.pinCode || 'N/A'} 
                                size="small"
                                color="info"
                              />
                            </TableCell>
                            <TableCell>{stat.counter?.agentName || 'N/A'}</TableCell>
                            <TableCell>
                              <Chip
                                label={stat.totalUsers || 0}
                                size="small"
                                color={stat.totalUsers > 0 ? "success" : "default"}
                              />
                            </TableCell>
                            <TableCell>{stat.farmers || 0}</TableCell>
                            <TableCell>{stat.retailers || 0}</TableCell>
                            <TableCell>{stat.agents || 0}</TableCell>
                          </TableRow>
                        ))}
                        {stats.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                              <MDTypography variant="body2" color="text.secondary">
                                No counter statistics available
                              </MDTypography>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </MDBox>
              </Card>
            </Grid>
          </Grid>
        )}

        {tabValue === 1 && selectedCounter && (
          <Grid container spacing={3}>
            {/* Selected Counter Info */}
            <Grid item xs={12}>
              <Card>
                <MDBox p={3}>
                  <MDTypography variant="h6" fontWeight="medium" mb={2}>
                    {selectedCounter.counterName}
                  </MDTypography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <MDTypography variant="caption" color="text">
                        <strong>Address:</strong> {selectedCounter.address}
                      </MDTypography>
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <MDTypography variant="caption" color="text">
                        <strong>Pincode:</strong> {selectedCounter.pinCode}
                      </MDTypography>
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <MDTypography variant="caption" color="text">
                        <strong>Agent:</strong> {selectedCounter.agentName}
                      </MDTypography>
                    </Grid>
                  </Grid>
                </MDBox>
              </Card>
            </Grid>

            {/* Users Table */}
            <Grid item xs={12}>
              <Card>
                <MDBox p={3}>
                  <MDTypography variant="h6" fontWeight="medium" mb={2}>
                    Users Who Selected This Counter ({users.length})
                  </MDTypography>
                  
                  {users.length === 0 ? (
                    <Alert severity="info">No users have selected this counter yet</Alert>
                  ) : (
                    <TableContainer component={Paper} elevation={0}>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell><strong>Name</strong></TableCell>
                            <TableCell><strong>Mobile</strong></TableCell>
                            <TableCell><strong>Email</strong></TableCell>
                            <TableCell><strong>User Type</strong></TableCell>
                            <TableCell><strong>Status</strong></TableCell>
                            <TableCell><strong>Selection Date</strong></TableCell>
                            <TableCell align="center"><strong>Times Selected</strong></TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {users.map((user, index) => (
                            <TableRow key={user._id || index}>
                              <TableCell>
                                <Box display="flex" alignItems="center" gap={1}>
                                  <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                                    {user.name?.charAt(0).toUpperCase() || 'U'}
                                  </Avatar>
                                  <MDTypography variant="caption" fontWeight="medium">
                                    {user.name || 'N/A'}
                                  </MDTypography>
                                </Box>
                              </TableCell>
                              <TableCell>
                                <MDTypography variant="caption">
                                  {user.mobile}
                                </MDTypography>
                              </TableCell>
                              <TableCell>
                                <MDTypography variant="caption">
                                  {user.email || 'N/A'}
                                </MDTypography>
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={user.user_type}
                                  color={getUserTypeColor(user.user_type)}
                                  size="small"
                                />
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={user.status}
                                  color={getStatusColor(user.status)}
                                  size="small"
                                />
                              </TableCell>
                              <TableCell>
                                <MDTypography variant="caption">
                                  {user.counter_selection_date
                                    ? new Date(user.counter_selection_date).toLocaleString()
                                    : 'N/A'}
                                </MDTypography>
                              </TableCell>
                              <TableCell align="center">
                                <Chip
                                  label={user.counter_selection_count || 0}
                                  color="info"
                                  size="small"
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </MDBox>
              </Card>
            </Grid>
          </Grid>
        )}
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default CounterUsers;

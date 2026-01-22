import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  Grid,
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Paper,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
  CircularProgress,
  Avatar,
} from "@mui/material";
import {
  Visibility,
  CheckCircle,
  Cancel,
  Undo,
  Payment,
  RestartAlt,
  Search,
} from "@mui/icons-material";
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import apiClient from "api/axios";
import { toast } from "react-toastify";
import OutlinedInput from "@mui/material/OutlinedInput";

const ReturnsManagement = () => {
  const [returns, setReturns] = useState([]);
  const [filteredReturns, setFilteredReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [refundDialogOpen, setRefundDialogOpen] = useState(false);

  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    from_date: "",
    to_date: "",
  });

  const [approveNotes, setApproveNotes] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [refundAmount, setRefundAmount] = useState("");
  const [refundNotes, setRefundNotes] = useState("");

  useEffect(() => {
    fetchReturns();
    fetchStats();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, returns]);

  const fetchReturns = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.status !== "all") params.append("status", filters.status);
      if (filters.from_date) params.append("from_date", filters.from_date);
      if (filters.to_date) params.append("to_date", filters.to_date);

      const response = await apiClient.get(`/api/payment/return-requests?${params.toString()}`);
      setReturns(response.data.data || []);
    } catch (error) {
      console.error("Error fetching returns:", error);
      toast.error("Failed to fetch return requests");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await apiClient.get("/api/payment/return-stats");
      setStats(response.data.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const applyFilters = () => {
    let filtered = [...returns];

    if (filters.search) {
      filtered = filtered.filter(
        (ret) =>
          ret._id?.toLowerCase().includes(filters.search.toLowerCase()) ||
          ret.user_id?.name?.toLowerCase().includes(filters.search.toLowerCase()) ||
          ret.transaction_id?.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    setFilteredReturns(filtered);
  };

  const handleViewDetails = (returnRequest) => {
    setSelectedReturn(returnRequest);
    setDetailsDialogOpen(true);
  };

  const handleApprove = async () => {
    try {
      await apiClient.post(`/api/payment/approve-return/${selectedReturn._id}`, {
        return_notes: approveNotes,
      });
      toast.success("Return approved successfully");
      setApproveDialogOpen(false);
      setApproveNotes("");
      fetchReturns();
      fetchStats();
    } catch (error) {
      console.error("Error approving return:", error);
      toast.error(error.response?.data?.message || "Failed to approve return");
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }

    try {
      await apiClient.post(`/api/payment/reject-return/${selectedReturn._id}`, {
        return_rejected_reason: rejectReason,
      });
      toast.success("Return rejected");
      setRejectDialogOpen(false);
      setRejectReason("");
      fetchReturns();
      fetchStats();
    } catch (error) {
      console.error("Error rejecting return:", error);
      toast.error(error.response?.data?.message || "Failed to reject return");
    }
  };

  const handleProcessRefund = async () => {
    try {
      const payload = { notes: refundNotes };
      if (refundAmount) payload.refund_amount = parseFloat(refundAmount);

      await apiClient.post(`/api/payment/process-return-refund/${selectedReturn._id}`, payload);
      toast.success("Refund processed successfully");
      setRefundDialogOpen(false);
      setRefundAmount("");
      setRefundNotes("");
      fetchReturns();
      fetchStats();
    } catch (error) {
      console.error("Error processing refund:", error);
      toast.error(error.response?.data?.message || "Failed to process refund");
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "warning",
      approved: "info",
      rejected: "error",
      completed: "success",
    };
    return colors[status] || "default";
  };

  const formatCurrency = (amount) => `₹${parseFloat(amount || 0).toFixed(2)}`;

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  if (loading) {
    return (
      <DashboardLayout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        {/* Statistics */}
        {stats && (
          <Grid container spacing={3} mb={3}>
            <Grid item xs={12} md={2.4}>
              <Card sx={{ background: "linear-gradient(195deg, #42424a 0%, #191919 100%)" }}>
                <CardContent>
                  <Box textAlign="center">
                    <Typography variant="h4" sx={{ color: "#fff", fontWeight: "bold" }}>
                      {stats.totalReturns}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#fff", opacity: 0.9 }}>
                      Total Returns
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={2.4}>
              <Card sx={{ background: "linear-gradient(195deg, #FFA726 0%, #FB8C00 100%)" }}>
                <CardContent>
                  <Box textAlign="center">
                    <Typography variant="h4" sx={{ color: "#fff", fontWeight: "bold" }}>
                      {stats.pendingReturns}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#fff", opacity: 0.9 }}>
                      Pending
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={2.4}>
              <Card sx={{ background: "linear-gradient(195deg, #42A5F5 0%, #1976D2 100%)" }}>
                <CardContent>
                  <Box textAlign="center">
                    <Typography variant="h4" sx={{ color: "#fff", fontWeight: "bold" }}>
                      {stats.approvedReturns}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#fff", opacity: 0.9 }}>
                      Approved
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={2.4}>
              <Card sx={{ background: "linear-gradient(195deg, #66BB6A 0%, #43A047 100%)" }}>
                <CardContent>
                  <Box textAlign="center">
                    <Typography variant="h4" sx={{ color: "#fff", fontWeight: "bold" }}>
                      {stats.completedReturns}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#fff", opacity: 0.9 }}>
                      Completed
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={2.4}>
              <Card sx={{ background: "linear-gradient(195deg, #EF5350 0%, #E53935 100%)" }}>
                <CardContent>
                  <Box textAlign="center">
                    <Typography variant="h4" sx={{ color: "#fff", fontWeight: "bold" }}>
                      {formatCurrency(stats.totalRefunded)}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#fff", opacity: 0.9 }}>
                      Refunded
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Main Content */}
        <Card>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <MDTypography variant="h5">Return Requests Management</MDTypography>
              <MDButton
                variant="outlined"
                color="secondary"
                startIcon={<RestartAlt />}
                onClick={() => {
                  setFilters({ search: "", status: "all", from_date: "", to_date: "" });
                  fetchReturns();
                }}
              >
                Reset Filters
              </MDButton>
            </Box>

            {/* Filters */}
            <Grid container spacing={2} mb={3}>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  placeholder="Search order or customer..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  InputProps={{
                    startAdornment: <Search />,
                  }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={filters.status}
                    label="Status"
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    input={<OutlinedInput label="Status" />}
                    sx={{ height: "45px" }}
                  >
                    <MenuItem value="all">All Status</MenuItem>
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="approved">Approved</MenuItem>
                    <MenuItem value="rejected">Rejected</MenuItem>
                    <MenuItem value="completed">Completed</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  type="date"
                  label="From Date"
                  value={filters.from_date}
                  onChange={(e) => setFilters({ ...filters, from_date: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  type="date"
                  label="To Date"
                  value={filters.to_date}
                  onChange={(e) => setFilters({ ...filters, to_date: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>

            {/* Table */}
            <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
              <Table stickyHeader>
                <TableBody>
                  <TableRow>
                    <TableCell sx={{ fontWeight: "bold", bgcolor: "grey.100" }}>Order ID</TableCell>
                    <TableCell sx={{ fontWeight: "bold", bgcolor: "grey.100" }}>Customer</TableCell>
                    <TableCell sx={{ fontWeight: "bold", bgcolor: "grey.100" }}>Reason</TableCell>
                    <TableCell sx={{ fontWeight: "bold", bgcolor: "grey.100" }}>Amount</TableCell>
                    <TableCell sx={{ fontWeight: "bold", bgcolor: "grey.100" }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: "bold", bgcolor: "grey.100" }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: "bold", bgcolor: "grey.100" }}>Actions</TableCell>
                  </TableRow>
                  {filteredReturns.map((returnReq) => (
                    <TableRow key={returnReq._id} hover>
                      <TableCell>{returnReq._id.slice(-8)}</TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2">{returnReq.user_id?.name || "N/A"}</Typography>
                          {returnReq.user_id?.user_type && (
                            <Chip label={returnReq.user_id.user_type} size="small" sx={{ mt: 0.5 }} />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Tooltip title={returnReq.return_reason_details || ""}>
                          <Chip label={returnReq.return_reason} size="small" variant="outlined" />
                        </Tooltip>
                      </TableCell>
                      <TableCell>{formatCurrency(returnReq.total_amount)}</TableCell>
                      <TableCell>{formatDate(returnReq.return_request_date)}</TableCell>
                      <TableCell>
                        <Chip
                          label={returnReq.return_status?.toUpperCase()}
                          color={getStatusColor(returnReq.return_status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Box display="flex" gap={0.5}>
                          <Tooltip title="View Details">
                            <IconButton size="small" color="primary" onClick={() => handleViewDetails(returnReq)}>
                              <Visibility fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          {returnReq.return_status === "pending" && (
                            <>
                              <Tooltip title="Approve">
                                <IconButton
                                  size="small"
                                  color="success"
                                  onClick={() => {
                                    setSelectedReturn(returnReq);
                                    setApproveDialogOpen(true);
                                  }}
                                >
                                  <CheckCircle fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Reject">
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => {
                                    setSelectedReturn(returnReq);
                                    setRejectDialogOpen(true);
                                  }}
                                >
                                  <Cancel fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </>
                          )}
                          {returnReq.return_status === "approved" && !returnReq.refund_amount && (
                            <Tooltip title="Process Refund">
                              <IconButton
                                size="small"
                                color="info"
                                onClick={() => {
                                  setSelectedReturn(returnReq);
                                  setRefundAmount(returnReq.total_amount.toString());
                                  setRefundDialogOpen(true);
                                }}
                              >
                                <Payment fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {filteredReturns.length === 0 && (
              <Box textAlign="center" py={3}>
                <Typography color="textSecondary">No return requests found</Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      </MDBox>

      {/* Details Dialog */}
      <Dialog open={detailsDialogOpen} onClose={() => setDetailsDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Return Request Details</DialogTitle>
        <DialogContent dividers>
          {selectedReturn && (
            <Box>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="textSecondary">Order ID</Typography>
                  <Typography variant="body1">{selectedReturn._id}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="textSecondary">Customer</Typography>
                  <Typography variant="body1">{selectedReturn.user_id?.name || "N/A"}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="textSecondary">Return Reason</Typography>
                  <Typography variant="body1">{selectedReturn.return_reason}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="textSecondary">Status</Typography>
                  <Chip
                    label={selectedReturn.return_status?.toUpperCase()}
                    color={getStatusColor(selectedReturn.return_status)}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="textSecondary">Details</Typography>
                  <Typography variant="body1">{selectedReturn.return_reason_details}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="textSecondary">Order Amount</Typography>
                  <Typography variant="body1">{formatCurrency(selectedReturn.total_amount)}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="textSecondary">Request Date</Typography>
                  <Typography variant="body1">{formatDate(selectedReturn.return_request_date)}</Typography>
                </Grid>
                {selectedReturn.return_rejected_reason && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="error">Rejection Reason</Typography>
                    <Typography variant="body1">{selectedReturn.return_rejected_reason}</Typography>
                  </Grid>
                )}
                {selectedReturn.refund_amount && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="success.main">Refund Amount</Typography>
                    <Typography variant="body1">{formatCurrency(selectedReturn.refund_amount)}</Typography>
                  </Grid>
                )}
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Approve Dialog */}
      <Dialog open={approveDialogOpen} onClose={() => setApproveDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Approve Return Request</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Admin Notes (Optional)"
            value={approveNotes}
            onChange={(e) => setApproveNotes(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApproveDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" color="success" onClick={handleApprove}>
            Approve
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onClose={() => setRejectDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Reject Return Request</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Rejection Reason *"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            sx={{ mt: 2 }}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleReject}>
            Reject
          </Button>
        </DialogActions>
      </Dialog>

      {/* Refund Dialog */}
      <Dialog open={refundDialogOpen} onClose={() => setRefundDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Process Refund</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            type="number"
            label="Refund Amount"
            value={refundAmount}
            onChange={(e) => setRefundAmount(e.target.value)}
            sx={{ mt: 2, mb: 2 }}
            InputProps={{
              startAdornment: <Typography sx={{ mr: 1 }}>₹</Typography>,
            }}
          />
          <TextField
            fullWidth
            multiline
            rows={2}
            label="Notes (Optional)"
            value={refundNotes}
            onChange={(e) => setRefundNotes(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRefundDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" color="primary" onClick={handleProcessRefund}>
            Process Refund
          </Button>
        </DialogActions>
      </Dialog>

      <Footer />
    </DashboardLayout>
  );
};

export default ReturnsManagement;

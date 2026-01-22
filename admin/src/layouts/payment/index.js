import {
  Close,
  Download,
  RestartAlt,
  Search,
  Visibility,
  MonetizationOn,
  CheckCircle,
  Error,
  HourglassEmpty,
  Undo,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Collapse,
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
  Paper,
  Avatar,
} from "@mui/material";
import OutlinedInput from "@mui/material/OutlinedInput";
import apiClient from "api/axios";
import MDBox from "components/MDBox";
import Footer from "examples/Footer";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import { useEffect, useState } from "react";

const PaymentManagement = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [paymentStats, setPaymentStats] = useState(null);
  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    payment_method: "all",
    from_date: "",
    to_date: "",
  });
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [refundDialogOpen, setRefundDialogOpen] = useState(false);
  const [refundData, setRefundData] = useState({
    refund_amount: "",
    refund_reason: "",
  });
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  // Fetch payments
  useEffect(() => {
    fetchPayments();
    fetchPaymentStats();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/api/payment/get-payments");
      console.log("Fetched payments:", response.data);
      setPayments(response.data);
      setFilteredPayments(response.data);
    } catch (err) {
      setError("Failed to fetch payments");
      console.error("Error fetching payments:", err);
      showSnackbar("Failed to fetch payments", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchPaymentStats = async () => {
    try {
      const response = await apiClient.get("/api/payment/payment-stats");
      setPaymentStats(response.data);
    } catch (err) {
      console.error("Error fetching payment stats:", err);
    }
  };

  // Apply filters
  useEffect(() => {
    let result = payments;

    // Search filter
    if (filters.search) {
      result = result.filter(
        (payment) =>
          payment.transaction_id?.toLowerCase().includes(filters.search.toLowerCase()) ||
          payment.razorpay_payment_id?.toLowerCase().includes(filters.search.toLowerCase()) ||
          payment.order_id?.name?.toLowerCase().includes(filters.search.toLowerCase()) ||
          payment.user_id?.name?.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    // Status filter
    if (filters.status !== "all") {
      result = result.filter((payment) => payment.status === filters.status);
    }

    // Payment method filter
    if (filters.payment_method !== "all") {
      result = result.filter((payment) => payment.payment_method === filters.payment_method);
    }

    // Date range filter
    if (filters.from_date) {
      result = result.filter(
        (payment) => new Date(payment.payment_date) >= new Date(filters.from_date)
      );
    }
    if (filters.to_date) {
      result = result.filter(
        (payment) => new Date(payment.payment_date) <= new Date(filters.to_date)
      );
    }

    setFilteredPayments(result);
  }, [filters, payments]);

  const getStatusIcon = (status) => {
    const icons = {
      success: <CheckCircle fontSize="small" />,
      failed: <Error fontSize="small" />,
      pending: <HourglassEmpty fontSize="small" />,
      refunded: <Undo fontSize="small" />,
      cancelled: <Close fontSize="small" />,
    };
    return icons[status] || null;
  };

  const getStatusChipColor = (status) => {
    const statusColors = {
      success: "success",
      failed: "error",
      pending: "warning",
      refunded: "info",
      cancelled: "default",
    };
    return statusColors[status] || "default";
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
      payment_method: "all",
      from_date: "",
      to_date: "",
    });
  };

  const handleViewDetails = (payment) => {
    setSelectedPayment(payment);
  };

  const handleCloseDetails = () => {
    setSelectedPayment(null);
  };

  const handleOpenRefundDialog = (payment) => {
    setSelectedPayment(payment);
    setRefundData({
      refund_amount: payment.amount,
      refund_reason: "",
    });
    setRefundDialogOpen(true);
  };

  const handleCloseRefundDialog = () => {
    setRefundDialogOpen(false);
    setRefundData({ refund_amount: "", refund_reason: "" });
  };

  const handleProcessRefund = async () => {
    try {
      await apiClient.post(`/api/payment/process-refund/${selectedPayment._id}`, refundData);
      showSnackbar("Refund processed successfully", "success");
      handleCloseRefundDialog();
      fetchPayments();
      fetchPaymentStats();
    } catch (err) {
      console.error("Error processing refund:", err);
      showSnackbar("Failed to process refund", "error");
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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
            Loading payments...
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
        {/* Payment Statistics Cards */}
        {paymentStats && (
          <Grid container spacing={3} mb={3}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ background: 'linear-gradient(195deg, #42424a 0%, #191919 100%)' }}>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="body2" sx={{ color: '#ffffff', opacity: 0.9 }}>
                        Total Payments
                      </Typography>
                      <Typography variant="h4" sx={{ color: '#ffffff', fontWeight: 'bold' }}>
                        {paymentStats.totalPayments}
                      </Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 40, height: 40 }}>
                      <MonetizationOn sx={{ color: '#ffffff', fontSize: 24 }} />
                    </Avatar>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ background: 'linear-gradient(195deg, #66BB6A 0%, #43A047 100%)' }}>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="body2" sx={{ color: '#ffffff', opacity: 0.9 }}>
                        Total Revenue
                      </Typography>
                      <Typography variant="h4" sx={{ color: '#ffffff', fontWeight: 'bold' }}>
                        {formatCurrency(paymentStats.totalAmount || 0)}
                      </Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 40, height: 40 }}>
                      <CheckCircle sx={{ color: '#ffffff', fontSize: 24 }} />
                    </Avatar>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ background: 'linear-gradient(195deg, #EF5350 0%, #E53935 100%)' }}>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="body2" sx={{ color: '#ffffff', opacity: 0.9 }}>
                        Failed Payments
                      </Typography>
                      <Typography variant="h4" sx={{ color: '#ffffff', fontWeight: 'bold' }}>
                        {paymentStats.failedPayments}
                      </Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 40, height: 40 }}>
                      <Error sx={{ color: '#ffffff', fontSize: 24 }} />
                    </Avatar>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ background: 'linear-gradient(195deg, #42A5F5 0%, #1976D2 100%)' }}>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="body2" sx={{ color: '#ffffff', opacity: 0.9 }}>
                        Success Rate
                      </Typography>
                      <Typography variant="h4" sx={{ color: '#ffffff', fontWeight: 'bold' }}>
                        {paymentStats.successRate}%
                      </Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 40, height: 40 }}>
                      <HourglassEmpty sx={{ color: '#ffffff', fontSize: 24 }} />
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
                  <Typography variant="h5">Payment Management</Typography>
                  <Tooltip title="Reset all applied filters">
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
                      Reset Filters
                    </Button>
                  </Tooltip>
                </Box>

                {/* Filters */}
                <Collapse in timeout="auto">
                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={12} sm={3}>
                      <TextField
                        fullWidth
                        label="Search by Transaction ID"
                        InputProps={{
                          startAdornment: <Search />,
                        }}
                        value={filters.search}
                        onChange={(e) =>
                          setFilters((prev) => ({ ...prev, search: e.target.value }))
                        }
                      />
                    </Grid>
                    <Grid item xs={12} sm={2}>
                      <FormControl fullWidth>
                        <InputLabel>Status</InputLabel>
                        <Select
                          value={filters.status}
                          label="Status"
                          onChange={(e) =>
                            setFilters((prev) => ({ ...prev, status: e.target.value }))
                          }
                          input={<OutlinedInput label="Status" />}
                          sx={{
                            fontSize: "1rem",
                            padding: "10.5px 14px",
                            height: "45px",
                          }}
                        >
                          <MenuItem value="all">All Status</MenuItem>
                          <MenuItem value="success">Success</MenuItem>
                          <MenuItem value="pending">Pending</MenuItem>
                          <MenuItem value="failed">Failed</MenuItem>
                          <MenuItem value="refunded">Refunded</MenuItem>
                          <MenuItem value="cancelled">Cancelled</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={2}>
                      <FormControl fullWidth>
                        <InputLabel>Payment Method</InputLabel>
                        <Select
                          value={filters.payment_method}
                          label="Payment Method"
                          onChange={(e) =>
                            setFilters((prev) => ({ ...prev, payment_method: e.target.value }))
                          }
                          input={<OutlinedInput label="Payment Method" />}
                          sx={{
                            fontSize: "1rem",
                            padding: "10.5px 14px",
                            height: "45px",
                          }}
                        >
                          <MenuItem value="all">All Methods</MenuItem>
                          <MenuItem value="razorpay">Razorpay</MenuItem>
                          <MenuItem value="cod">Cash on Delivery</MenuItem>
                          <MenuItem value="wallet">Wallet</MenuItem>
                          <MenuItem value="upi">UPI</MenuItem>
                          <MenuItem value="card">Card</MenuItem>
                          <MenuItem value="netbanking">Net Banking</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={2.5}>
                      <TextField
                        fullWidth
                        type="date"
                        label="From Date"
                        value={filters.from_date}
                        onChange={(e) =>
                          setFilters((prev) => ({ ...prev, from_date: e.target.value }))
                        }
                        InputLabelProps={{
                          shrink: true,
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={2.5}>
                      <TextField
                        fullWidth
                        type="date"
                        label="To Date"
                        value={filters.to_date}
                        onChange={(e) =>
                          setFilters((prev) => ({ ...prev, to_date: e.target.value }))
                        }
                        InputLabelProps={{
                          shrink: true,
                        }}
                      />
                    </Grid>
                  </Grid>
                </Collapse>

                {/* Payments Table */}
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
                          Transaction ID
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
                          Order ID
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
                          Customer
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
                          Amount
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
                          Method
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
                          Date
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
                          Actions
                        </TableCell>
                      </TableRow>
                      {filteredPayments.map((payment) => (
                        <TableRow
                          key={payment._id}
                          sx={{
                            "&:hover": {
                              bgcolor: "grey.50",
                            },
                          }}
                        >
                          <TableCell sx={{ padding: "16px" }}>
                            <Typography
                              variant="body2"
                              sx={{ fontFamily: "monospace", fontSize: "0.85rem" }}
                            >
                              {payment.transaction_id}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ padding: "16px" }}>
                            <Typography
                              variant="body2"
                              sx={{ fontFamily: "monospace", fontSize: "0.85rem" }}
                            >
                              {payment.order_id?._id?.slice(-8) || "N/A"}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ padding: "16px" }}>
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {payment.order_id?.name || payment.user_id?.name || "N/A"}
                              </Typography>
                              {payment.user_id?.user_type && (
                                <Chip
                                  label={payment.user_id.user_type}
                                  size="small"
                                  sx={{
                                    fontSize: '0.65rem',
                                    height: '18px',
                                    mt: 0.5,
                                    bgcolor: payment.user_id.user_type === 'Farmer' ? '#e3f2fd' : 
                                             payment.user_id.user_type === 'Agri-Retailer' ? '#f3e5f5' : 
                                             '#fff3e0',
                                    color: payment.user_id.user_type === 'Farmer' ? '#1565c0' : 
                                           payment.user_id.user_type === 'Agri-Retailer' ? '#6a1b9a' : 
                                           '#e65100',
                                    fontWeight: 600
                                  }}
                                />
                              )}
                            </Box>
                          </TableCell>
                          <TableCell sx={{ padding: "16px" }}>
                            <Typography variant="body2" fontWeight="medium">
                              {formatCurrency(payment.amount)}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ padding: "16px" }}>
                            <Chip
                              label={payment.payment_method ? payment.payment_method.toUpperCase() : 'ONLINE'}
                              size="small"
                              variant="outlined"
                              color={payment.payment_method === 'cod' ? 'warning' : 'primary'}
                            />
                          </TableCell>
                          <TableCell sx={{ padding: "16px" }}>
                            <Typography variant="body2" sx={{ fontSize: "0.8rem" }}>
                              {formatDate(payment.payment_date)}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ padding: "16px" }}>
                            <Chip
                              icon={getStatusIcon(payment.status)}
                              label={payment.status?.toUpperCase()}
                              color={getStatusChipColor(payment.status)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell sx={{ padding: "16px" }}>
                            <Box display="flex" gap={0.5}>
                              <Tooltip title="View Details">
                                <IconButton
                                  color="primary"
                                  size="small"
                                  onClick={() => handleViewDetails(payment)}
                                >
                                  <Visibility fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              {payment.status === "success" && (
                                <Tooltip title="Process Refund">
                                  <IconButton
                                    color="error"
                                    size="small"
                                    onClick={() => handleOpenRefundDialog(payment)}
                                  >
                                    <Undo fontSize="small" />
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

                {filteredPayments.length === 0 && (
                  <Box textAlign="center" py={3}>
                    <Typography color="textSecondary">
                      No payments found matching your filters
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </MDBox>

      {/* Payment Details Dialog */}
      <Dialog open={Boolean(selectedPayment)} onClose={handleCloseDetails} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h5">Payment Details</Typography>
            <IconButton onClick={handleCloseDetails}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {selectedPayment && (
            <Box>
              <Table size="small">
                <TableBody>
                  <TableRow>
                    <TableCell>
                      <strong>Transaction ID:</strong>
                    </TableCell>
                    <TableCell>{selectedPayment.transaction_id}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <strong>Razorpay Payment ID:</strong>
                    </TableCell>
                    <TableCell>{selectedPayment.razorpay_payment_id || "N/A"}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <strong>Razorpay Order ID:</strong>
                    </TableCell>
                    <TableCell>{selectedPayment.razorpay_order_id || "N/A"}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <strong>Order ID:</strong>
                    </TableCell>
                    <TableCell>{selectedPayment.order_id?._id || "N/A"}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <strong>Customer Name:</strong>
                    </TableCell>
                    <TableCell>
                      {selectedPayment.order_id?.name || selectedPayment.user_id?.name || "N/A"}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <strong>Amount:</strong>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body1" fontWeight="bold">
                        {formatCurrency(selectedPayment.amount)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <strong>Currency:</strong>
                    </TableCell>
                    <TableCell>{selectedPayment.currency}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <strong>Payment Method:</strong>
                    </TableCell>
                    <TableCell>{selectedPayment.payment_method?.toUpperCase()}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <strong>Payment Date:</strong>
                    </TableCell>
                    <TableCell>{formatDate(selectedPayment.payment_date)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <strong>Status:</strong>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={getStatusIcon(selectedPayment.status)}
                        label={selectedPayment.status?.toUpperCase()}
                        color={getStatusChipColor(selectedPayment.status)}
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                  {selectedPayment.refund_details && (
                    <>
                      <TableRow>
                        <TableCell colSpan={2}>
                          <Divider sx={{ my: 1 }} />
                          <Typography variant="subtitle2" color="primary" gutterBottom>
                            Refund Information
                          </Typography>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <strong>Refund Amount:</strong>
                        </TableCell>
                        <TableCell>
                          {formatCurrency(selectedPayment.refund_details.refund_amount)}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <strong>Refund Date:</strong>
                        </TableCell>
                        <TableCell>
                          {formatDate(selectedPayment.refund_details.refund_date)}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <strong>Refund Reason:</strong>
                        </TableCell>
                        <TableCell>{selectedPayment.refund_details.refund_reason}</TableCell>
                      </TableRow>
                    </>
                  )}
                  {selectedPayment.notes && (
                    <TableRow>
                      <TableCell>
                        <strong>Notes:</strong>
                      </TableCell>
                      <TableCell>{selectedPayment.notes}</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetails}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Refund Dialog */}
      <Dialog open={refundDialogOpen} onClose={handleCloseRefundDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Process Refund</DialogTitle>
        <DialogContent>
          <Box pt={2}>
            <TextField
              fullWidth
              label="Refund Amount"
              type="number"
              value={refundData.refund_amount}
              onChange={(e) =>
                setRefundData((prev) => ({ ...prev, refund_amount: e.target.value }))
              }
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: <Typography sx={{ mr: 1 }}>₹</Typography>,
              }}
            />
            <TextField
              fullWidth
              label="Refund Reason"
              multiline
              rows={3}
              value={refundData.refund_reason}
              onChange={(e) =>
                setRefundData((prev) => ({ ...prev, refund_reason: e.target.value }))
              }
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseRefundDialog}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleProcessRefund}>
            Process Refund
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
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

export default PaymentManagement;

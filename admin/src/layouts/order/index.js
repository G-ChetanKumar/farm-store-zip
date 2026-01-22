// import React, { useState, useEffect } from "react";
// import {
//   Box,
//   Grid,
//   Card,
//   CardContent,
//   Typography,
//   IconButton,
//   Chip,
//   TextField,
//   FormControl,
//   InputLabel,
//   Select,
//   MenuItem,
//   CircularProgress,
//   Collapse,
//   Divider,
//   Avatar,
//   Button,
//   Tooltip,
// } from "@mui/material";
// import { Search, FilterList, ExpandMore, RestartAlt, PictureAsPdf } from "@mui/icons-material";
// import apiClient from "api/axios";
// import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
// import DashboardNavbar from "examples/Navbars/DashboardNavbar";
// import Footer from "examples/Footer";
// import MDBox from "components/MDBox";
// import OutlinedInput from "@mui/material/OutlinedInput";
// 
// const OrdersDashboard = () => {
//   const [orders, setOrders] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [filteredOrders, setFilteredOrders] = useState([]);
//   const [filters, setFilters] = useState({
//     search: "",
//     status: "all",
//     date: "",
//   });
//   const [expanded, setExpanded] = useState({});

//   // Fetch orders
//   useEffect(() => {
//     const fetchOrders = async () => {
//       try {
//         const response = await apiClient.get("/api/order/get-orders");
//         setOrders(response.data);
//         setFilteredOrders(response.data);
//       } catch (err) {
//         setError("Failed to fetch orders");
//         console.error("Error fetching orders:", err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchOrders();
//   }, []);

//   // Apply filters
//   useEffect(() => {
//     let result = orders;

//     // Search filter
//     if (filters.search) {
//       result = result.filter(
//         (order) =>
//           order.name.toLowerCase().includes(filters.search.toLowerCase()) ||
//           order.phone.includes(filters.search) ||
//           order._id.includes(filters.search)
//       );
//     }

//     // Status filter
//     if (filters.status !== "all") {
//       result = result.filter((order) => order.order_status === filters.status);
//     }

//     // Date filter
//     if (filters.date) {
//       result = result.filter((order) => order.date === filters.date);
//     }

//     setFilteredOrders(result);
//   }, [filters, orders]);

//   const getStatusChipColor = (status) => {
//     const statusColors = {
//       pending: "warning",
//       processing: "info",
//       shipped: "primary",
//       delivered: "success",
//       cancelled: "error",
//     };
//     return statusColors[status] || "default";
//   };

//   const handleDateChange = (event) => {
//     setFilters((prev) => ({ ...prev, date: event.target.value }));
//   };

//   const handleExpandClick = (orderId) => {
//     setExpanded((prev) => ({ ...prev, [orderId]: !prev[orderId] }));
//   };

//   const resetFilters = () => {
//     setFilters({ search: "", status: "all", date: "" });
//   };

//   if (loading) {
//     return (
//       <DashboardLayout>
//         <Box
//           display="flex"
//           flexDirection="column"
//           justifyContent="center"
//           alignItems="center"
//           minHeight="60vh"
//         >
//           <CircularProgress />
//           <Typography variant="body1" mt={2}>
//             Loading orders...
//           </Typography>
//         </Box>
//       </DashboardLayout>
//     );
//   }

//   if (error) {
//     return (
//       <DashboardLayout>
//         <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
//           <Typography color="error">{error}</Typography>
//         </Box>
//       </DashboardLayout>
//     );
//   }

//   return (
//     <DashboardLayout>
//       <DashboardNavbar />
//       <MDBox py={3}>
//         <Grid container spacing={3}>
//           <Grid item xs={12}>
//             <Card>
//               <CardContent>
//                 <Box
//                   display="flex"
//                   justifyContent="space-between"
//                   alignItems="center"
//                   mb={2}
//                   sx={{ pb: 2, borderBottom: "1px solid #eee" }}
//                 >
//                   <Typography variant="h5">Orders Dashboard</Typography>
//                   <Tooltip title="Reset all applied filters">
//                     <Button
//                       variant="outlined"
//                       startIcon={<RestartAlt />}
//                       onClick={resetFilters}
//                       sx={{ textTransform: "none" }}
//                     >
//                       Reset Filters
//                     </Button>
//                   </Tooltip>
//                 </Box>

//                 {/* Filters */}
//                 <Collapse in timeout="auto">
//                   <Grid container spacing={2} sx={{ mb: 3 }}>
//                     <Grid item xs={12} sm={4}>
//                       <TextField
//                         fullWidth
//                         label="Search by name, phone, or order ID"
//                         InputProps={{
//                           startAdornment: <Search />,
//                         }}
//                         value={filters.search}
//                         onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
//                       />
//                     </Grid>
//                     <Grid item xs={12} sm={4}>
//                     <FormControl fullWidth>
//                       <InputLabel>Status</InputLabel>
//                       <Select
//                         value={filters.status}
//                         label="Status"
//                         onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
//                         input={<OutlinedInput label="Select brand" />}
//                         sx={{
//                           fontSize: "1rem",
//                           padding: "10.5px 14px",
//                           height: "45px",
//                         }}
//                       >
//                         <MenuItem value="all">All</MenuItem>
//                         <MenuItem value="pending">Pending</MenuItem>
//                         <MenuItem value="processing">Processing</MenuItem>
//                         <MenuItem value="shipped">Shipped</MenuItem>
//                         <MenuItem value="delivered">Delivered</MenuItem>
//                         <MenuItem value="cancelled">Cancelled</MenuItem>
//                       </Select>
//                     </FormControl>
//                   </Grid>
//                     <Grid item xs={12} sm={4}>
//                       <TextField
//                         fullWidth
//                         type="date"
//                         label="Filter by date"
//                         value={filters.date}
//                         onChange={handleDateChange}
//                         InputLabelProps={{
//                           shrink: true,
//                         }}
//                       />
//                     </Grid>
//                   </Grid>
//                 </Collapse>

//                 {/* Orders List */}
//                 <Grid container spacing={2}>
//           {filteredOrders.map((order) => (
//             <Grid item xs={12} md={6} lg={4} key={order._id}>
//               <Card>
//                 <CardContent>
//                   <Box display="flex" justifyContent="space-between" alignItems="center">
//                     <Avatar sx={{ bgcolor: "primary.main" }}>
//                       {order.name[0].toUpperCase()}
//                     </Avatar>
//                     <Chip
//                       label={order.order_status}
//                       color={getStatusChipColor(order.order_status)}
//                       size="small"
//                     />
//                   </Box>
//                   <Typography variant="body1" mt={1}>
//                     <strong>{order.name}</strong>
//                   </Typography>
//                   <Typography variant="body2" color="textSecondary">
//                     ₹{order.total_amount} | {order.date}
//                   </Typography>
//                   <Box mt={2} display="flex" justifyContent="space-between">
//                     <Button
//                       variant="outlined"
//                       startIcon={<PictureAsPdf />}
//                       onClick={() => downloadInvoice(order._id)}
//                     >
//                       Download Invoice
//                     </Button>
//                     <IconButton
//                       onClick={() => handleExpandClick(order._id)}
//                       aria-expanded={expanded[order._id] || false}
//                       aria-label="show more"
//                     >
//                       <ExpandMore />
//                     </IconButton>
//                   </Box>
//                   <Collapse in={expanded[order._id]} timeout="auto" unmountOnExit>
//                     <Divider sx={{ my: 1 }} />
//                     {order.products.map((product, index) => (
//                       <Typography key={product._id} variant="body2">
//                         {`${product.quantity} x Product ${index + 1}`}
//                       </Typography>
//                     ))}
//                     <Typography variant="body2">
//                       Address: {order.address}, PIN: {order.pincode}
//                     </Typography>
//                   </Collapse>
//                 </CardContent>
//               </Card>
//             </Grid>
//           ))}
//         </Grid>

//         {filteredOrders.length === 0 && (
//           <Box textAlign="center" py={3}>
//             <Typography color="textSecondary">
//               No orders found matching your filters
//             </Typography>
//           </Box>
//         )}
//               </CardContent>
//             </Card>
//           </Grid>
//         </Grid>
//       </MDBox>
//       <Footer />
//     </DashboardLayout>
//   );
// };

// export default OrdersDashboard;
import {
  Close,
  ContentCopy,
  Download,
  Edit,
  RestartAlt,
  Search,
  Visibility
} from "@mui/icons-material";
import {
  Alert,
  Avatar,
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
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import OutlinedInput from "@mui/material/OutlinedInput";
import Paper from "@mui/material/Paper";
import TableContainer from "@mui/material/TableContainer";
import apiClient from "api/axios";
import MDBox from "components/MDBox";
import Footer from "examples/Footer";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import { useEffect, useState } from "react";

const OrdersDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    date: "",
  });
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [updateData, setUpdateData] = useState({});

  // Fetch orders
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await apiClient.get("/api/order/get-orders");
        console.log("Fetched orders:", response.data);
        setOrders(response.data);
        setFilteredOrders(response.data);
      } catch (err) {
        setError("Failed to fetch orders");
        console.error("Error fetching orders:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Apply filters
  useEffect(() => {
    let result = orders;

    // Search filter
    if (filters.search) {
      result = result.filter(
        (order) =>
          order.name.toLowerCase().includes(filters.search.toLowerCase()) ||
          order.phone.includes(filters.search) ||
          order._id.includes(filters.search)
      );
    }

    // Status filter
    if (filters.status !== "all") {
      result = result.filter((order) => order.order_status === filters.status);
    }

    // Date filter
    if (filters.date) {
      result = result.filter((order) => order.date === filters.date);
    }

    setFilteredOrders(result);
  }, [filters, orders]);

  const getStatusChipColor = (status) => {
    const statusColors = {
      pending: "warning",
      shipment: "primary", 
      delivered: "success",
    };
    return statusColors[status] || "default";
  };

  const handleDateChange = (event) => {
    setFilters((prev) => ({ ...prev, date: event.target.value }));
  };

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setUpdateData({});
  };

  const handleCloseDetails = () => {
    setSelectedOrder(null);
    setUpdateData({});
  };

  const resetFilters = () => {
    setFilters({ search: "", status: "all", date: "" });
  };

  // Handle status dropdown changes (immediate update)
  const handleStatusUpdate = async (orderId, field, value) => {
    try {
      console.log(`Updating ${field} to ${value} for order ${orderId}`);
      
      const updatePayload = {
        [field]: value
      };
      
      const response = await apiClient.put(`/api/order/update-order/${orderId}`, updatePayload);
      
      // Handle both old and new response formats
      const success = response.data?.success !== false && response.status === 200;
      const updatedOrder = response.data?.data || response.data;
      
      if (success) {
        // Update local state with new values
        setSelectedOrder(prev => ({ ...prev, [field]: value }));
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order._id === orderId ? { ...order, [field]: value } : order
          )
        );
        setFilteredOrders(prevOrders => 
          prevOrders.map(order => 
            order._id === orderId ? { ...order, [field]: value } : order
          )
        );
        
        setSnackbarMessage(`${field === 'order_status' ? 'Order' : 'Payment'} status updated successfully!`);
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
      } else {
        throw new Error(response.data?.message || 'Update failed');
      }
    } catch (error) {
      console.error(`Error updating ${field}:`, error);
      setSnackbarMessage(error.response?.data?.message || `Failed to update ${field === 'order_status' ? 'order' : 'payment'} status`);
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  // Handle field changes (store in temp state)
  const handleFieldUpdate = (orderId, field, value) => {
    setUpdateData(prev => ({
      ...prev,
      [field]: value
    }));
    setSelectedOrder(prev => ({ ...prev, [field]: value }));
  };

  // Save all pending updates
  const saveUpdates = async (orderId) => {
    if (Object.keys(updateData).length === 0) {
      setSnackbarMessage("No changes to save");
      setSnackbarSeverity("info");
      setSnackbarOpen(true);
      return;
    }

    try {
      console.log("Saving updates:", updateData);
      
      const response = await apiClient.put(`/api/order/update-order/${orderId}`, updateData);
      
      // Handle both old and new response formats
      const success = response.data?.success !== false && response.status === 200;
      const updatedOrder = response.data?.data || response.data;
      
      if (success) {
        // Update local state with saved changes
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order._id === orderId ? { ...order, ...updateData } : order
          )
        );
        setFilteredOrders(prevOrders => 
          prevOrders.map(order => 
            order._id === orderId ? { ...order, ...updateData } : order
          )
        );
        
        setUpdateData({});
        setSnackbarMessage(response.data?.message || "Order details updated successfully!");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
      } else {
        throw new Error(response.data?.message || 'Update failed');
      }
    } catch (error) {
      console.error("Error saving updates:", error);
      setSnackbarMessage(error.response?.data?.message || "Failed to save order updates");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  // Generate and download invoice as PDF
  const downloadInvoice = async (order) => {
    try {
      // Create a new window for printing
      const printWindow = window.open('', '_blank');
      
      // Generate invoice HTML with professional styling
      const invoiceHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Invoice - ${order._id}</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: Arial, sans-serif;
              padding: 40px;
              background-color: #f5f5f5;
            }
            .invoice-container {
              max-width: 800px;
              margin: 0 auto;
              background: white;
              padding: 40px;
              box-shadow: 0 0 10px rgba(0,0,0,0.1);
            }
            .invoice-header {
              display: flex;
              justify-content: space-between;
              align-items: start;
              margin-bottom: 40px;
              padding-bottom: 20px;
              border-bottom: 3px solid #1976d2;
            }
            .company-info {
              flex: 1;
            }
            .company-name {
              font-size: 28px;
              font-weight: bold;
              color: #1976d2;
              margin-bottom: 5px;
            }
            .invoice-title {
              font-size: 32px;
              font-weight: bold;
              color: #333;
              text-align: right;
            }
            .invoice-details {
              display: flex;
              justify-content: space-between;
              margin-bottom: 30px;
              gap: 40px;
            }
            .detail-section {
              flex: 1;
            }
            .section-title {
              font-size: 14px;
              font-weight: bold;
              color: #666;
              text-transform: uppercase;
              margin-bottom: 10px;
              letter-spacing: 0.5px;
            }
            .detail-item {
              margin-bottom: 8px;
              line-height: 1.6;
            }
            .detail-label {
              font-weight: 600;
              color: #333;
              display: inline-block;
              min-width: 100px;
            }
            .products-table {
              width: 100%;
              border-collapse: collapse;
              margin: 30px 0;
            }
            .products-table thead {
              background-color: #1976d2;
              color: white;
            }
            .products-table th {
              padding: 12px;
              text-align: left;
              font-weight: 600;
              font-size: 13px;
              text-transform: uppercase;
            }
            .products-table td {
              padding: 12px;
              border-bottom: 1px solid #e0e0e0;
            }
            .products-table tbody tr:hover {
              background-color: #f9f9f9;
            }
            .text-right {
              text-align: right;
            }
            .text-center {
              text-align: center;
            }
            .totals-section {
              margin-top: 30px;
              padding: 20px;
              background-color: #f9f9f9;
              border-radius: 5px;
            }
            .total-row {
              display: flex;
              justify-content: space-between;
              padding: 8px 0;
            }
            .total-row.grand-total {
              border-top: 2px solid #1976d2;
              margin-top: 10px;
              padding-top: 15px;
              font-size: 20px;
              font-weight: bold;
              color: #1976d2;
            }
            .status-badge {
              display: inline-block;
              padding: 6px 12px;
              border-radius: 4px;
              font-size: 12px;
              font-weight: 600;
              text-transform: uppercase;
            }
            .status-pending {
              background-color: #fff3cd;
              color: #856404;
            }
            .status-delivered {
              background-color: #d4edda;
              color: #155724;
            }
            .status-shipment {
              background-color: #cce5ff;
              color: #004085;
            }
            .footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 2px solid #e0e0e0;
              text-align: center;
              color: #666;
              font-size: 13px;
            }
            .thank-you {
              font-size: 18px;
              font-weight: 600;
              color: #1976d2;
              margin-bottom: 10px;
            }
            @media print {
              body {
                background: white;
                padding: 0;
              }
              .invoice-container {
                box-shadow: none;
                padding: 20px;
              }
              .no-print {
                display: none;
              }
            }
          </style>
        </head>
        <body>
          <div class="invoice-container">
            <!-- Print Instructions Banner (hidden when printing) -->
            <div class="no-print" style="background-color: #e3f2fd; padding: 15px; margin-bottom: 20px; border-radius: 5px; text-align: center; border: 2px dashed #1976d2;">
              <div style="font-size: 16px; font-weight: 600; color: #1976d2; margin-bottom: 5px;">
                📄 Ready to Download Invoice
              </div>
              <div style="font-size: 13px; color: #555;">
                Click "Print" button and select "Save as PDF" to download this invoice
              </div>
            </div>

            <!-- Header -->
            <div class="invoice-header">
              <div class="company-info">
                <div class="company-name">Farm-E-Store</div>
                <div style="color: #666; font-size: 14px; margin-top: 5px;">
                  Your Trusted Agricultural Partner
                </div>
              </div>
              <div>
                <div class="invoice-title">INVOICE</div>
                <div style="text-align: right; margin-top: 10px; color: #666;">
                  <div><strong>Invoice No:</strong> ${order._id.slice(-8).toUpperCase()}</div>
                  <div><strong>Date:</strong> ${order.date}</div>
                </div>
              </div>
            </div>

            <!-- Customer & Order Details present for Sold given default address -->
            <div class="invoice-details">
              <div class="detail-section">
                <div class="section-title">Sold By (Sender)</div>
                <div class="detail-item" style="font-weight: 600; color: #1976d2; margin-bottom: 5px;">Farm-E-Store</div>
                <div class="detail-item">123 Agricultural Market</div>
                <div class="detail-item">Farm District, Maharashtra</div>
                <div class="detail-item">India - 400001</div>
                <div class="detail-item" style="margin-top: 8px;"><strong>Phone:</strong> +91 98765 43210</div>
                <div class="detail-item"><strong>Email:</strong> support@farmestore.com</div>
                <div class="detail-item"><strong>GSTIN:</strong> 27AABCU9603R1ZM</div>
              </div>
              <div class="detail-section">
                <div class="section-title">Billing & Shipping Address (Receiver)</div>
                <div class="detail-item" style="font-weight: 600; color: #333; margin-bottom: 5px;">${order.name}</div>
                <div class="detail-item">${order.address}</div>
                <div class="detail-item">PIN: ${order.pincode}</div>
                <div class="detail-item" style="margin-top: 8px;"><strong>Phone:</strong> ${order.phone}</div>
              </div>
            </div>

            <!-- Order Information -->
            <div style="background-color: #f0f7ff; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                  <div class="detail-item"><span class="detail-label">Order ID:</span> ${order._id}</div>
                  <div class="detail-item"><span class="detail-label">Order Date:</span> ${order.date}</div>
                </div>
                <div style="text-align: right;">
                  <div class="detail-item">
                    <span class="detail-label">Status:</span> 
                    <span class="status-badge status-${order.order_status}">${order.order_status}</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">Payment:</span> ${order.razorpay_payment_status}
                  </div>
                </div>
              </div>
            </div>

            <!-- Products Table -->
            <table class="products-table">
              <thead>
                <tr>
                  <th style="width: 50px;">S.No</th>
                  <th>Product Name</th>
                  <th style="width: 150px;">Product ID</th>
                  <th class="text-center" style="width: 100px;">Quantity</th>
                  <th class="text-right" style="width: 120px;">Price</th>
                  <th class="text-right" style="width: 120px;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${order.products.map((product, index) => {
                  const price = parseFloat(product.price || product.sell_price || product.mrp_price || 0);
                  const quantity = parseInt(product.quantity || 1);
                  const total = price * quantity;
                  return `
                    <tr>
                      <td class="text-center">${index + 1}</td>
                      <td>${product.product_name || product.title || product.name || 'Product'}</td>
                      <td style="font-size: 11px; color: #666;">${product.product_id || 'N/A'}</td>
                      <td class="text-center">${quantity}</td>
                      <td class="text-right">₹${price > 0 ? price.toFixed(2) : (order.total_amount / order.products.length).toFixed(2)}</td>
                      <td class="text-right">₹${total > 0 ? total.toFixed(2) : order.total_amount.toFixed(2)}</td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>

            <!-- Totals Section -->
            <div class="totals-section">
              <div class="total-row">
                <span>Subtotal:</span>
                <span>₹${order.total_amount}</span>
              </div>
              <div class="total-row">
                <span>Tax & Fees:</span>
                <span>₹0.00</span>
              </div>
              <div class="total-row grand-total">
                <span>Grand Total:</span>
                <span>₹${order.total_amount}</span>
              </div>
            </div>

            <!-- Footer -->
            <div class="footer">
              <div class="thank-you">Thank you for your order!</div>
              <div>For any queries, please contact us at support@farmestore.com</div>
              <div style="margin-top: 20px; font-size: 11px;">
                This is a computer-generated invoice and does not require a signature.
              </div>
            </div>
          </div>
        </body>
        </html>
      `;

      printWindow.document.write(invoiceHTML);
      printWindow.document.close();
      
      // Wait for content to load then trigger print with download option
      printWindow.onload = function() {
        setTimeout(() => {
          printWindow.focus();
          printWindow.print();
          
          // Optional: Close the window after printing (user can cancel this)
          printWindow.onafterprint = function() {
            printWindow.close();
          };
          
          setSnackbarMessage("Invoice opened! Use Print dialog to save as PDF.");
          setSnackbarSeverity("success");
          setSnackbarOpen(true);
        }, 500);
      };

    } catch (err) {
      console.error("Error generating invoice:", err);
      setSnackbarMessage("Failed to generate invoice");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
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
            Loading orders...
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
                  <Typography variant="h5">Orders Dashboard</Typography>
                  <Tooltip title="Reset all applied filters">
                    <Button
                      variant="outlined"
                      startIcon={<RestartAlt />}
                      onClick={resetFilters}
                      sx={{ textTransform: "none" }}
                    >
                      Reset Filters
                    </Button>
                  </Tooltip>
                </Box>

                {/* Filters */}
                <Collapse in timeout="auto">
                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        label="Search by name, phone, or order ID"
                        InputProps={{
                          startAdornment: <Search />,
                        }}
                        value={filters.search}
                        onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <FormControl fullWidth>
                        <InputLabel>Status</InputLabel>
                        <Select
                          value={filters.status}
                          label="Status"
                          onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                          input={<OutlinedInput label="Select Status" />}
                          sx={{
                            fontSize: "1rem",
                            padding: "10.5px 14px",
                            height: "45px",
                          }}
                        >
                          <MenuItem value="all">All</MenuItem>
                          <MenuItem value="pending">Pending</MenuItem>
                          <MenuItem value="shipment">Shipment</MenuItem>
                          <MenuItem value="delivered">Delivered</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        type="date"
                        label="Filter by date"
                        value={filters.date}
                        onChange={handleDateChange}
                        InputLabelProps={{
                          shrink: true,
                        }}
                      />
                    </Grid>
                  </Grid>
                </Collapse>

                {/* Orders Table */}
                <TableContainer component={Paper} sx={{ mt: 3, maxHeight: 600 }}>
                  <Table stickyHeader sx={{ minWidth: 1800 }}>
                    <TableBody>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold', bgcolor: 'grey.100', position: 'sticky', top: 0, zIndex: 100, minWidth: 50 }}>
                          <strong>S.No</strong>
                        </TableCell>
                        <TableCell sx={{ fontWeight: 'bold', bgcolor: 'grey.100', position: 'sticky', top: 0, zIndex: 100, minWidth: 150 }}>
                          <strong>Customer</strong>
                        </TableCell>
                        <TableCell sx={{ fontWeight: 'bold', bgcolor: 'grey.100', position: 'sticky', top: 0, zIndex: 100, minWidth: 120 }}>
                          <strong>Order ID</strong>
                        </TableCell>
                        <TableCell sx={{ fontWeight: 'bold', bgcolor: 'grey.100', position: 'sticky', top: 0, zIndex: 100, minWidth: 120 }}>
                          <strong>Contact Number</strong>
                        </TableCell>
                        <TableCell sx={{ fontWeight: 'bold', bgcolor: 'grey.100', position: 'sticky', top: 0, zIndex: 100, minWidth: 200 }}>
                          <strong>Address</strong>
                        </TableCell>
                        <TableCell sx={{ fontWeight: 'bold', bgcolor: 'grey.100', position: 'sticky', top: 0, zIndex: 100, minWidth: 150 }}>
                          <strong>Billing/Invoice</strong>
                        </TableCell>
                        <TableCell sx={{ fontWeight: 'bold', bgcolor: 'grey.100', position: 'sticky', top: 0, zIndex: 100, minWidth: 100 }}>
                          <strong>Order Date</strong>
                        </TableCell>
                        <TableCell sx={{ fontWeight: 'bold', bgcolor: 'grey.100', position: 'sticky', top: 0, zIndex: 100, minWidth: 100 }}>
                          <strong>Order Status</strong>
                        </TableCell>
                        <TableCell sx={{ fontWeight: 'bold', bgcolor: 'grey.100', position: 'sticky', top: 0, zIndex: 100, minWidth: 120 }}>
                          <strong>Delivery Mode</strong>
                        </TableCell>
                        <TableCell sx={{ fontWeight: 'bold', bgcolor: 'grey.100', position: 'sticky', top: 0, zIndex: 100, minWidth: 100 }}>
                          <strong>COD/Online</strong>
                        </TableCell>
                        <TableCell sx={{ fontWeight: 'bold', bgcolor: 'grey.100', position: 'sticky', top: 0, zIndex: 100, minWidth: 100 }}>
                          <strong>Amount</strong>
                        </TableCell>
                        <TableCell sx={{ fontWeight: 'bold', bgcolor: 'grey.100', position: 'sticky', top: 0, zIndex: 100, minWidth: 150 }}>
                          <strong>Payment Method</strong>
                        </TableCell>
                        <TableCell sx={{ fontWeight: 'bold', bgcolor: 'grey.100', position: 'sticky', top: 0, zIndex: 100, minWidth: 150 }}>
                          <strong>Payment Status</strong>
                        </TableCell>
                        <TableCell sx={{ fontWeight: 'bold', bgcolor: 'grey.100', position: 'sticky', top: 0, zIndex: 100, minWidth: 180 }}>
                          <strong>Transaction ID</strong>
                        </TableCell>
                        <TableCell sx={{ fontWeight: 'bold', bgcolor: 'grey.100', position: 'sticky', top: 0, zIndex: 100, minWidth: 100 }}>
                          <strong>Platform Fee</strong>
                        </TableCell>
                        <TableCell sx={{ fontWeight: 'bold', bgcolor: 'grey.100', position: 'sticky', top: 0, zIndex: 100, minWidth: 150 }}>
                          <strong>Delivery Partner</strong>
                        </TableCell>
                        <TableCell sx={{ fontWeight: 'bold', bgcolor: 'grey.100', position: 'sticky', top: 0, zIndex: 100, minWidth: 120 }}>
                          <strong>Actions</strong>
                        </TableCell>
                      </TableRow>
                      {filteredOrders.map((order, index) => (
                        <TableRow 
                          key={order._id}
                          sx={{ 
                            '&:hover': { 
                              bgcolor: 'grey.50' 
                            }
                          }}
                        >
                          {/* S.No */}
                          <TableCell sx={{ padding: '12px' }}>
                            <Typography variant="body2">{index + 1}</Typography>
                          </TableCell>
                          
                          {/* Customer */}
                          <TableCell sx={{ padding: '12px' }}>
                            <Box>
                              <Box display="flex" alignItems="center" gap={1}>
                                <Avatar sx={{ bgcolor: "primary.main", width: 32, height: 32, fontSize: '0.875rem' }}>
                                  {order.name && order.name[0] ? order.name[0].toUpperCase() : 'U'}
                                </Avatar>
                                <Typography variant="body2" sx={{ fontSize: '0.85rem', fontWeight: 500 }}>
                                  {order.name || 'N/A'}
                                </Typography>
                              </Box>
                              {order.user_id?.user_type && (
                                <Box sx={{ mt: 0.5, ml: 5 }}>
                                  <Chip
                                    label={order.user_id.user_type}
                                    size="small"
                                    sx={{
                                      fontSize: '0.65rem',
                                      height: '18px',
                                      bgcolor: order.user_id.user_type === 'Farmer' ? '#e3f2fd' : 
                                               order.user_id.user_type === 'Agri-Retailer' ? '#f3e5f5' : 
                                               '#fff3e0',
                                      color: order.user_id.user_type === 'Farmer' ? '#1565c0' : 
                                             order.user_id.user_type === 'Agri-Retailer' ? '#6a1b9a' : 
                                             '#e65100',
                                      fontWeight: 600
                                    }}
                                  />
                                </Box>
                              )}
                            </Box>
                          </TableCell>
                          
                          {/* Order ID */}
                          <TableCell sx={{ padding: '12px' }}>
                            <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                              {order._id ? order._id.slice(-8) : 'N/A'}
                            </Typography>
                          </TableCell>
                          
                          {/* Contact Number */}
                          <TableCell sx={{ padding: '12px' }}>
                            <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                              {order.phone || 'N/A'}
                            </Typography>
                          </TableCell>
                          
                          {/* Address */}
                          <TableCell sx={{ padding: '12px' }}>
                            <Typography variant="body2" sx={{ fontSize: '0.8rem', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {order.address || 'N/A'}
                            </Typography>
                          </TableCell>
                          
                          {/* Billing/Invoice */}
                          <TableCell sx={{ padding: '12px' }}>
                            <Tooltip title="Download Invoice">
                              <IconButton size="small" color="primary" onClick={() => downloadInvoice(order)}>
                                <Download fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                          
                          {/* Order Date */}
                          <TableCell sx={{ padding: '12px' }}>
                            <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                              {order.date ? new Date(order.date).toLocaleDateString('en-IN') : 'N/A'}
                            </Typography>
                          </TableCell>
                          
                          {/* Order Status */}
                          <TableCell sx={{ padding: '12px' }}>
                            <Chip
                              label={order.order_status || 'pending'}
                              color={getStatusChipColor(order.order_status)}
                              size="small"
                              sx={{ fontSize: '0.7rem', height: '24px' }}
                            />
                          </TableCell>
                          
                          {/* Delivery Mode */}
                          <TableCell sx={{ padding: '12px' }}>
                            <Typography variant="body2" sx={{ fontSize: '0.8rem', textTransform: 'capitalize' }}>
                              {order.delivery_type || 'Home Delivery'}
                            </Typography>
                          </TableCell>
                          
                          {/* COD/Online */}
                          <TableCell sx={{ padding: '12px' }}>
                            <Chip
                              label={order.payment_method === 'cod' ? 'COD' : 'Online'}
                              color={order.payment_method === 'cod' ? 'warning' : 'success'}
                              size="small"
                              sx={{ fontSize: '0.7rem', height: '24px' }}
                            />
                          </TableCell>
                          
                          {/* Amount */}
                          <TableCell sx={{ padding: '12px' }}>
                            <Typography variant="body2" fontWeight="bold" sx={{ fontSize: '0.85rem', color: 'success.main' }}>
                              ₹{order.total_amount?.toFixed(2) || '0.00'}
                            </Typography>
                          </TableCell>
                          
                          {/* Payment Method */}
                          <TableCell sx={{ padding: '12px' }}>
                            <Typography variant="body2" sx={{ fontSize: '0.8rem', textTransform: 'uppercase' }}>
                              {order.payment_method || 'Online'}
                            </Typography>
                          </TableCell>
                          
                          {/* Payment Status */}
                          <TableCell sx={{ padding: '12px' }}>
                            <Chip
                              label={order.razorpay_payment_status || 'Pending'}
                              color={order.razorpay_payment_status === 'paid' || order.razorpay_payment_status === 'captured' ? 'success' : 'warning'}
                              size="small"
                              sx={{ fontSize: '0.7rem', height: '24px' }}
                            />
                          </TableCell>
                          
                          {/* Transaction ID */}
                          <TableCell sx={{ padding: '12px' }}>
                            <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.7rem' }}>
                              {order.transaction_id ? order.transaction_id.slice(0, 18) + '...' : 'N/A'}
                            </Typography>
                          </TableCell>
                          
                          {/* Platform Fee */}
                          <TableCell sx={{ padding: '12px' }}>
                            <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                              ₹{order.platform_fee || '0.00'}
                            </Typography>
                          </TableCell>
                          
                          {/* Delivery Partner */}
                          <TableCell sx={{ padding: '12px' }}>
                            <Box>
                              <Typography variant="body2" sx={{ fontSize: '0.8rem', fontWeight: 500 }}>
                                {order.delivery_partner || '-'}
                              </Typography>
                              {order.tracking_number && (
                                <Box display="flex" alignItems="center" gap={0.5} sx={{ mt: 0.5 }}>
                                  <Typography 
                                    variant="caption" 
                                    sx={{ 
                                      fontSize: '0.7rem', 
                                      color: 'text.secondary',
                                      fontFamily: 'monospace'
                                    }}
                                  >
                                    {order.tracking_number.length > 12 
                                      ? order.tracking_number.slice(0, 12) + '...' 
                                      : order.tracking_number}
                                  </Typography>
                                  <Tooltip title="Copy Tracking Number">
                                    <IconButton
                                      size="small"
                                      onClick={() => {
                                        navigator.clipboard.writeText(order.tracking_number);
                                        setSnackbarMessage("Tracking number copied!");
                                        setSnackbarSeverity("success");
                                        setSnackbarOpen(true);
                                      }}
                                      sx={{ 
                                        padding: '2px',
                                        '&:hover': { bgcolor: 'primary.light', color: 'white' }
                                      }}
                                    >
                                      <ContentCopy sx={{ fontSize: '0.75rem' }} />
                                    </IconButton>
                                  </Tooltip>
                                </Box>
                              )}
                            </Box>
                          </TableCell>
                          
                          {/* Actions */}
                          <TableCell sx={{ padding: '12px' }}>
                            <Box display="flex" gap={0.5}>
                              <Tooltip title="View Details">
                                <IconButton
                                  color="primary"
                                  size="small"
                                  onClick={() => handleViewDetails(order)}
                                >
                                  <Visibility fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Edit Order">
                                <IconButton
                                  color="info"
                                  size="small"
                                  onClick={() => handleViewDetails(order)}
                                >
                                  <Edit fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                {filteredOrders.length === 0 && (
                  <Box textAlign="center" py={3}>
                    <Typography color="textSecondary">
                      No orders found matching your filters
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </MDBox>

      {/* Order Details & Update Dialog */}
      <Dialog 
        open={Boolean(selectedOrder)} 
        onClose={handleCloseDetails}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h5">Order Details & Management</Typography>
            <IconButton onClick={handleCloseDetails}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {selectedOrder && (
            <Box>
              {/* Order Information */}
              <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                Order Information
              </Typography>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} md={6}>
                  <Table size="small">
                    <TableBody>
                      <TableRow>
                        <TableCell sx={{ width: '50%' }}><strong>Order ID:</strong></TableCell>
                        <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                          {selectedOrder._id?.slice(-12) || 'N/A'}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><strong>Order Date:</strong></TableCell>
                        <TableCell>{selectedOrder.date}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><strong>Customer Name:</strong></TableCell>
                        <TableCell>{selectedOrder.name}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><strong>Phone:</strong></TableCell>
                        <TableCell>{selectedOrder.phone}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><strong>Email:</strong></TableCell>
                        <TableCell>{selectedOrder.user_id?.email || 'N/A'}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Table size="small">
                    <TableBody>
                      <TableRow>
                        <TableCell sx={{ width: '50%' }}><strong>Order Status:</strong></TableCell>
                        <TableCell>
                          <Chip
                            label={selectedOrder.order_status}
                            color={getStatusChipColor(selectedOrder.order_status)}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><strong>Payment Method:</strong></TableCell>
                        <TableCell sx={{ textTransform: 'capitalize' }}>
                          {selectedOrder.payment_method || 'N/A'}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><strong>Payment Status:</strong></TableCell>
                        <TableCell sx={{ textTransform: 'capitalize' }}>
                          {selectedOrder.razorpay_payment_status}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><strong>Transaction ID:</strong></TableCell>
                        <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                          {selectedOrder.transaction_id?.slice(0, 20) || 'N/A'}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><strong>Total Amount:</strong></TableCell>
                        <TableCell sx={{ fontWeight: 'bold', fontSize: '1.2rem', color: 'success.main' }}>
                          ₹{selectedOrder.total_amount?.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              {/* Transaction Details */}
              <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                Transaction Details
              </Typography>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12}>
                  <Box sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 1 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">
                          Transaction ID
                        </Typography>
                        <Typography variant="body1" sx={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                          {selectedOrder.transaction_id || 'N/A'}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">
                          Gateway Order ID
                        </Typography>
                        <Typography variant="body1" sx={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                          {selectedOrder.gateway_order_id || 'N/A'}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">
                          Payment Gateway
                        </Typography>
                        <Typography variant="body1">
                          {selectedOrder.gateway_payment_id ? 'Razorpay' : selectedOrder.payment_method === 'cod' ? 'Cash on Delivery' : 'N/A'}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">
                          Payment Date
                        </Typography>
                        <Typography variant="body1">
                          {selectedOrder.paid_at ? new Date(selectedOrder.paid_at).toLocaleString() : selectedOrder.date}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              {/* Update Order & Payment Status Section */}
              <Typography variant="h6" gutterBottom sx={{ mb: 2, color: 'primary.main' }}>
                Update Order Status
              </Typography>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Order Status</InputLabel>
                    <Select
                      value={selectedOrder.order_status || 'pending'}
                      label="Order Status"
                      onChange={(e) => handleStatusUpdate(selectedOrder._id, 'order_status', e.target.value)}
                    >
                      <MenuItem value="pending">📦 Pending</MenuItem>
                      <MenuItem value="shipment">🚚 Shipment</MenuItem>
                      <MenuItem value="delivered">✅ Delivered</MenuItem>
                    </Select>
                  </FormControl>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                    Current: <Chip 
                      label={selectedOrder.order_status} 
                      color={getStatusChipColor(selectedOrder.order_status)} 
                      size="small" 
                      sx={{ ml: 1 }}
                    />
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Payment Status</InputLabel>
                    <Select
                      value={selectedOrder.razorpay_payment_status || 'pending'}
                      label="Payment Status"
                      onChange={(e) => handleStatusUpdate(selectedOrder._id, 'razorpay_payment_status', e.target.value)}
                    >
                      <MenuItem value="pending">⏳ Pending</MenuItem>
                      <MenuItem value="paid">💰 Paid</MenuItem>
                      <MenuItem value="failed">❌ Failed</MenuItem>
                      <MenuItem value="refunded">↩️ Refunded</MenuItem>
                    </Select>
                  </FormControl>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                    Current: {selectedOrder.razorpay_payment_status}
                  </Typography>
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              {/* Shipping & Delivery Details */}
              <Typography variant="h6" gutterBottom sx={{ mb: 2, color: 'primary.main' }}>
                Shipping & Delivery Details
              </Typography>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Delivery Address"
                    value={selectedOrder.address || ''}
                    onChange={(e) => handleFieldUpdate(selectedOrder._id, 'address', e.target.value)}
                    multiline
                    rows={2}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Pincode"
                    value={selectedOrder.pincode || ''}
                    onChange={(e) => handleFieldUpdate(selectedOrder._id, 'pincode', e.target.value)}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Contact Phone"
                    value={selectedOrder.phone || ''}
                    onChange={(e) => handleFieldUpdate(selectedOrder._id, 'phone', e.target.value)}
                  />
                </Grid>
                
                {/* NEW: Delivery Partner Dropdown */}
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Delivery Partner</InputLabel>
                    <Select
                      value={selectedOrder.delivery_partner || ''}
                      label="Delivery Partner"
                      onChange={(e) => handleFieldUpdate(selectedOrder._id, 'delivery_partner', e.target.value)}
                    >
                      <MenuItem value="">
                        <em>None / Not Assigned</em>
                      </MenuItem>
                      <MenuItem value="Blue Dart">🔵 Blue Dart</MenuItem>
                      <MenuItem value="Delhivery">📦 Delhivery</MenuItem>
                      <MenuItem value="DTDC">🚚 DTDC</MenuItem>
                      <MenuItem value="India Post">📮 India Post</MenuItem>
                      <MenuItem value="Ecom Express">⚡ Ecom Express</MenuItem>
                      <MenuItem value="Shadowfax">🦊 Shadowfax</MenuItem>
                      <MenuItem value="Dunzo">🏃 Dunzo</MenuItem>
                      <MenuItem value="Xpressbees">🐝 Xpressbees</MenuItem>
                      <MenuItem value="FedEx">✈️ FedEx</MenuItem>
                      <MenuItem value="DHL">🌍 DHL</MenuItem>
                      <MenuItem value="Self Delivery">🏪 Self Delivery</MenuItem>
                      <MenuItem value="Local Courier">🛵 Local Courier</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                {/* NEW: Tracking Number */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Tracking Number"
                    value={selectedOrder.tracking_number || ''}
                    onChange={(e) => handleFieldUpdate(selectedOrder._id, 'tracking_number', e.target.value)}
                    placeholder="e.g., TRK123456789"
                    helperText="Enter courier tracking/AWB number"
                  />
                </Grid>
                
                {/* NEW: Estimated Delivery Date */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    size="small"
                    type="date"
                    label="Estimated Delivery Date"
                    value={selectedOrder.estimated_delivery ? new Date(selectedOrder.estimated_delivery).toISOString().split('T')[0] : ''}
                    onChange={(e) => handleFieldUpdate(selectedOrder._id, 'estimated_delivery', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    helperText="Expected delivery date"
                  />
                </Grid>
                
                {/* Show Delivered At if order is delivered */}
                {selectedOrder.order_status === 'delivered' && (
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      size="small"
                      type="date"
                      label="Actual Delivery Date"
                      value={selectedOrder.delivered_at ? new Date(selectedOrder.delivered_at).toISOString().split('T')[0] : ''}
                      onChange={(e) => handleFieldUpdate(selectedOrder._id, 'delivered_at', e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      helperText="Actual delivery date"
                    />
                  </Grid>
                )}
                
                {/* NEW: Delivery Notes */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Delivery Notes / Special Instructions"
                    value={selectedOrder.delivery_notes || ''}
                    onChange={(e) => handleFieldUpdate(selectedOrder._id, 'delivery_notes', e.target.value)}
                    multiline
                    rows={2}
                    placeholder="e.g., Fragile items, Handle with care, Call before delivery, Gate code: 1234"
                  />
                </Grid>
              </Grid>

              <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
                <Button 
                  variant="contained" 
                  color="success" 
                  onClick={() => saveUpdates(selectedOrder._id)}
                  fullWidth
                >
                  💾 Save All Changes
                </Button>
              </Box>

              <Divider sx={{ my: 3 }} />
              
              {/* Products List */}
              <Typography variant="h6" gutterBottom>Products Ordered</Typography>
              <TableContainer component={Paper} sx={{ mt: 2 }}>
                <Table size="small">
                  <TableBody>
                    <TableRow sx={{ bgcolor: 'grey.100' }}>
                      <TableCell><strong>S.No</strong></TableCell>
                      <TableCell><strong>Product Name</strong></TableCell>
                      <TableCell align="center"><strong>Quantity</strong></TableCell>
                      <TableCell align="right"><strong>Unit Price</strong></TableCell>
                      <TableCell align="right"><strong>Total Price</strong></TableCell>
                    </TableRow>
                    {selectedOrder.products && selectedOrder.products.map((product, index) => {
                      const unitPrice = product.price || product.sell_price || product.unit_price || 0;
                      const quantity = product.quantity || 0;
                      const totalPrice = product.item_total || (unitPrice * quantity);
                      
                      return (
                        <TableRow key={product.product_id || index}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight="medium">
                              {product.product_name || product.title || 'N/A'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', fontFamily: 'monospace' }}>
                              ID: {String(product.product_id).slice(-8) || 'N/A'}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Typography variant="body2" fontWeight="medium">
                              {quantity}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2">
                              ₹{unitPrice.toFixed(2)}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" fontWeight="bold" color="primary.main">
                              ₹{totalPrice.toFixed(2)}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    <TableRow sx={{ bgcolor: 'primary.50' }}>
                      <TableCell colSpan={4} align="right">
                        <Typography variant="h6" fontWeight="bold">
                          Order Total:
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="h6" fontWeight="bold" color="success.main">
                          ₹{selectedOrder.total_amount?.toFixed(2)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button 
            onClick={() => selectedOrder && downloadInvoice(selectedOrder)}
            variant="outlined"
            startIcon={<Download />}
          >
            Download Invoice
          </Button>
          <Button onClick={handleCloseDetails} variant="outlined">
            Close
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
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>

      <Footer />
    </DashboardLayout>
  );
};

export default OrdersDashboard;
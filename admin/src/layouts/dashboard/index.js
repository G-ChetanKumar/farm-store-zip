import {
  Agriculture,
  BrandingWatermark,
  Category,
  ShoppingCart,
  Store
} from "@mui/icons-material";
import {
  Avatar,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  LinearProgress,
  Typography
} from "@mui/material";
import MDBox from "components/MDBox";
import apiClient from "api/axios";
import ReportsBarChart from "examples/Charts/BarCharts/ReportsBarChart";
import ReportsLineChart from "examples/Charts/LineCharts/ReportsLineChart";
import PieChart from "examples/Charts/PieChart";
import Footer from "examples/Footer";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

function Dashboard() {
  const [counts, setCounts] = useState({
    categories: 0,
    brands: 0,
    crops: 0,
    products: 0,
    orders: 0,
  });

  const [categoryProductData, setCategoryProductData] = useState({
    labels: [],
    datasets: { label: "Products", data: [] },
  });

  const [ordersTimelineData, setOrdersTimelineData] = useState({
    labels: [],
    datasets: { label: "Orders", data: [] },
  });

  const [orderStatusData, setOrderStatusData] = useState({
    labels: [],
    datasets: {
      label: "Orders by Status",
      backgroundColors: ["warning", "info", "success", "error"],
      data: [],
    },
  });

  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [categoriesRes, brandsRes, cropsRes, productsRes, ordersRes] = await Promise.all([
          apiClient.get("/api/category/get-category"),
          apiClient.get("/api/brand/get-brand"),
          apiClient.get("/api/crop/get-crops"),
          apiClient.get("/api/product/get-product"),
          apiClient.get("/api/order/get-orders"),
        ]);

        const categoriesData = categoriesRes.data || [];
        const brandsData = brandsRes.data || [];
        const cropsData = cropsRes.data || [];
        const productsData = productsRes.data || [];
        const ordersData = ordersRes.data || [];

        setCounts({
          categories: categoriesData.length || 0,
          brands: brandsData.length || 0,
          crops: cropsData.length || 0,
          products: productsData.length || 0,
          orders: ordersData.length || 0,
        });

        // Category-wise product distribution
        const categoryMap = {};
        categoriesData.forEach(cat => {
          categoryMap[cat._id] = cat.category_name || cat.name || 'Unknown';
        });

        const productsByCategory = {};
        productsData.forEach(product => {
          const categoryName = categoryMap[product.category_id] || 'Uncategorized';
          productsByCategory[categoryName] = (productsByCategory[categoryName] || 0) + 1;
        });

        const categoryLabels = Object.keys(productsByCategory).slice(0, 8);
        const categoryValues = Object.values(productsByCategory).slice(0, 8);

        setCategoryProductData({
          labels: categoryLabels,
          datasets: { label: "Products", data: categoryValues },
        });

        // Orders timeline (last 30 days)
        const last30Days = {};
        const today = new Date();
        for (let i = 29; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(date.getDate() - i);
          const dateStr = date.toISOString().split('T')[0];
          last30Days[dateStr] = 0;
        }

        ordersData.forEach(order => {
          const orderDate = order.date || new Date(order.createdAt).toISOString().split('T')[0];
          if (last30Days.hasOwnProperty(orderDate)) {
            last30Days[orderDate]++;
          }
        });

        const dateLabels = Object.keys(last30Days).map(date => {
          const d = new Date(date);
          return `${d.getDate()}/${d.getMonth() + 1}`;
        });
        const dateValues = Object.values(last30Days);

        setOrdersTimelineData({
          labels: dateLabels,
          datasets: { label: "Orders", data: dateValues },
        });

        // Order status distribution
        const statusCount = {
          pending: 0,
          shipment: 0,
          delivered: 0,
          cancelled: 0,
        };

        ordersData.forEach(order => {
          const status = order.order_status || 'pending';
          if (statusCount.hasOwnProperty(status)) {
            statusCount[status]++;
          }
        });

        setOrderStatusData({
          labels: ['Pending', 'Shipment', 'Delivered', 'Cancelled'],
          datasets: {
            label: "Orders by Status",
            backgroundColors: ["warning", "info", "success", "error"],
            data: [statusCount.pending, statusCount.shipment, statusCount.delivered, statusCount.cancelled],
          },
        });

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast.error(error.userMessage || "Failed to load dashboard data");
      }
    };

    fetchDashboardData();
  }, []);

  if (!counts) {
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
            Loading dashboard...
          </Typography>
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox 
        py={3} 
        px={3}
        sx={{ 
          background: 'linear-gradient(to bottom, #f9fafb 0%, #f3f4f6 100%)',
          minHeight: '100vh'
        }}
      >
        {/* Modern Pastel Statistics Cards */}
        <Grid container spacing={3} mb={4}>
          {/* Total Products Card - Purple */}
          <Grid item xs={12} sm={6} md={6} lg={4} xl={2.4}>
            <Card 
              sx={{ 
                background: 'linear-gradient(135deg, #9333EA 0%, #7E22CE 100%)',
                borderRadius: '16px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                border: 'none',
                boxShadow: '0 4px 12px rgba(147, 51, 234, 0.3)',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 24px rgba(147, 51, 234, 0.4)'
                }
              }}
              onClick={() => navigate("/Product")}
            >
              <CardContent sx={{ p: 2.5 }}>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="body2" sx={{ color: '#ffffff', fontSize: '1rem', mb: 0.5 }}>
                      Products
                    </Typography>
                    <Typography variant="h2" sx={{ color: '#ffffff', fontWeight: 'bold', fontSize: '2rem' }}>
                      {counts.products}
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 35, height: 35 }}>
                    <Store sx={{ color: '#ffffff', fontSize: 20 }} />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Total Orders Card - Orange */}
          <Grid item xs={12} sm={6} md={6} lg={4} xl={2.4}>
            <Card 
              sx={{ 
                background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                borderRadius: '16px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                border: 'none',
                boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 24px rgba(245, 158, 11, 0.4)'
                }
              }}
              onClick={() => navigate("/order")}
            >
              <CardContent sx={{ p: 2.5 }}>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="body2" sx={{ color: '#ffffff', fontSize: '1rem', mb: 0.5 }}>
                      Orders
                    </Typography>
                    <Typography variant="h2" sx={{ color: '#ffffff', fontWeight: 'bold', fontSize: '2rem' }}>
                      {counts.orders}
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 35, height: 35 }}>
                    <ShoppingCart sx={{ color: '#ffffff', fontSize: 20 }} />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Categories Card - Green */}
          <Grid item xs={12} sm={6} md={6} lg={4} xl={2.4}>
            <Card 
              sx={{ 
                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                borderRadius: '16px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                border: 'none',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 24px rgba(16, 185, 129, 0.4)'
                }
              }}
              onClick={() => navigate("/category")}
            >
              <CardContent sx={{ p: 2.5 }}>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="body2" sx={{ color: '#ffffff', fontSize: '1rem', mb: 0.5 }}>
                      Categories
                    </Typography>
                    <Typography variant="h2" sx={{ color: '#ffffff', fontWeight: 'bold', fontSize: '2rem' }}>
                      {counts.categories}
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 35, height: 35 }}>
                    <Category sx={{ color: '#ffffff', fontSize: 20 }} />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Crops Card - Blue */}
          <Grid item xs={12} sm={6} md={6} lg={4} xl={2.4}>
            <Card 
              sx={{ 
                background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
                borderRadius: '16px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                border: 'none',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 24px rgba(59, 130, 246, 0.4)'
                }
              }}
              onClick={() => navigate("/Crops")}
            >
              <CardContent sx={{ p: 2.5 }}>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="body2" sx={{ color: '#ffffff', fontSize: '1rem', mb: 0.5 }}>
                      Crops
                    </Typography>
                    <Typography variant="h2" sx={{ color: '#ffffff', fontWeight: 'bold', fontSize: '2rem' }}>
                      {counts.crops}
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 35, height: 35 }}>
                    <Agriculture sx={{ color: '#ffffff', fontSize: 20 }} />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Brands Card - Dark Gray */}
          <Grid item xs={12} sm={6} md={6} lg={4} xl={2.4}>
            <Card 
              sx={{ 
                background: 'linear-gradient(135deg, #4B5563 0%, #374151 100%)',
                borderRadius: '16px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                border: 'none',
                boxShadow: '0 4px 12px rgba(75, 85, 99, 0.3)',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 24px rgba(75, 85, 99, 0.4)'
                }
              }}
              onClick={() => navigate("/brand")}
            >
              <CardContent sx={{ p: 2.5 }}>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="body2" sx={{ color: '#ffffff', fontSize: '1rem', mb: 0.5 }}>
                      Brands
                    </Typography>
                    <Typography variant="h2" sx={{ color: '#ffffff', fontWeight: 'bold', fontSize: '2rem' }}>
                      {counts.brands}
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 35, height: 35 }}>
                    <BrandingWatermark sx={{ color: '#ffffff', fontSize: 20 }} />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Charts and Analytics Section */}
        <Grid container spacing={3}>
          {/* Orders Timeline Chart */}
          <Grid item xs={12} md={8}>
            <Card sx={{ 
              borderRadius: '20px', 
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
              background: '#ffffff',
              border: '1px solid rgba(0,0,0,0.08)',
              overflow: 'visible',
              '& .css-1scr5li': {
                marginTop: '0 !important'
              },
              '& .css-1jolx3e': {
                marginTop: '0 !important'
              },
              '& .css-1bc1gd7': {
                borderRadius: '10px !important'
              },
              '& > div': {
                marginTop: '0 !important'
              }
            }}>
              <ReportsLineChart
                color="success"
                title="Orders Timeline (Last 30 Days)"
                description="Daily order count trend"
                date="updated now"
                chart={ordersTimelineData}
              />
            </Card>
          </Grid>

          {/* Orders by Status Pie Chart */}
          <Grid item xs={12} md={4}>
            <Card sx={{ 
              borderRadius: '20px', 
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
              background: '#ffffff',
              border: '1px solid rgba(0,0,0,0.08)',
              overflow: 'visible',
              '& .css-1scr5li': {
                marginTop: '0 !important'
              },
              '& .css-1jolx3e': {
                marginTop: '0 !important'
              },
              '& .css-1bc1gd7': {
                borderRadius: '10px !important'
              },
              '& > div': {
                marginTop: '0 !important'
              }
            }}>
              <PieChart
                icon={{ color: "info", component: "pie_chart" }}
                title="Orders by Status"
                description="Distribution by status"
                chart={orderStatusData}
              />
            </Card>
          </Grid>

          {/* Products by Category Bar Chart */}
          <Grid item xs={12} md={8}>
            <Card sx={{ 
              borderRadius: '20px', 
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
              background: '#ffffff',
              border: '1px solid rgba(0,0,0,0.08)',
              overflow: 'visible',
              '& .css-1scr5li': {
                marginTop: '0 !important'
              },
              '& .css-1jolx3e': {
                marginTop: '0 !important'
              },
              '& .css-1bc1gd7': {
                borderRadius: '10px !important'
              },
              '& > div': {
                marginTop: '0 !important'
              }
            }}>
              <ReportsBarChart
                color="info"
                title="Products by Category"
                description="Distribution across categories"
                date="updated now"
                chart={categoryProductData}
              />
            </Card>
          </Grid>

          {/* Top Products Section */}
          <Grid item xs={12} md={4}>
            <Card sx={{ 
              borderRadius: '20px', 
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)', 
              height: '100%',
              background: '#ffffff',
              border: '1px solid rgba(0,0,0,0.08)'
            }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight="bold" mb={3} sx={{ color: '#1F2937' }}>
                  Top Products
                </Typography>
                <Box>
                  {/* Product 1 */}
                  <Box mb={3}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                      <Typography variant="body2" sx={{ color: '#374151', fontWeight: 500 }}>
                        Fertilizers
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#6B7280', fontWeight: 600 }}>
                        28%
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={28} 
                      sx={{ 
                        height: 8, 
                        borderRadius: 4,
                        backgroundColor: '#E5E7EB',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: '#3B82F6',
                          borderRadius: 4
                        }
                      }} 
                    />
                  </Box>

                  {/* Product 2 */}
                  <Box mb={3}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                      <Typography variant="body2" sx={{ color: '#374151', fontWeight: 500 }}>
                        Pesticides
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#6B7280', fontWeight: 600 }}>
                        20%
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={20} 
                      sx={{ 
                        height: 8, 
                        borderRadius: 4,
                        backgroundColor: '#E5E7EB',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: '#10B981',
                          borderRadius: 4
                        }
                      }} 
                    />
                  </Box>

                  {/* Product 3 */}
                  <Box mb={3}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                      <Typography variant="body2" sx={{ color: '#374151', fontWeight: 500 }}>
                        Seeds
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#6B7280', fontWeight: 600 }}>
                        18%
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={18} 
                      sx={{ 
                        height: 8, 
                        borderRadius: 4,
                        backgroundColor: '#E5E7EB',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: '#8B5CF6',
                          borderRadius: 4
                        }
                      }} 
                    />
                  </Box>

                  {/* Product 4 */}
                  <Box>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                      <Typography variant="body2" sx={{ color: '#374151', fontWeight: 500 }}>
                        Equipment
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#6B7280', fontWeight: 600 }}>
                        34%
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={34} 
                      sx={{ 
                        height: 8, 
                        borderRadius: 4,
                        backgroundColor: '#E5E7EB',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: '#F59E0B',
                          borderRadius: 4
                        }
                      }} 
                    />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default Dashboard;

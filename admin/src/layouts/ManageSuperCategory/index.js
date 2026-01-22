import {
    Category as CategoryIcon,
    Clear,
    Delete,
    Edit,
    FilterList,
    SwapVert,
    Visibility
} from '@mui/icons-material';
import {
    Alert,
    Badge,
    Box,
    Button,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    Drawer,
    FormControl,
    IconButton,
    MenuItem,
    Paper,
    Select,
    Snackbar,
    Stack,
    Switch,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableRow,
    TextField,
    Tooltip
} from '@mui/material';
import apiClient from "api/axios";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import Footer from 'examples/Footer';
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SuperCategoryManagement = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  
  const [editImage, setEditImage] = useState(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [searchTerm, setSearchTerm] = useState("");
  
  // Filter and Sort States
  const [sortOrder, setSortOrder] = useState("az");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("all");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("all");
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  // Temporary filter states (used in the drawer before applying)
  const [tempCategoryFilter, setTempCategoryFilter] = useState("all");
  const [tempStatusFilter, setTempStatusFilter] = useState("all");
  const [tempSortOrder, setTempSortOrder] = useState("az");

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await apiClient.get("/api/super-category/get-super-category");
        setCategories(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch SuperCategories');
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const handleAddCategory = () => {
    navigate('/add-super-category');
  };

  const handleViewDetails = (category) => {
    setSelectedCategory(category);
  };

  const handleCloseDetails = () => {
    setSelectedCategory(null);
  };
  const handleDeleteClick = (categoryId) => {
    setCategoryToDelete(categoryId);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteCategory = async () => {
    try {
      await apiClient.delete(`/api/super-category/delete-super-category/${categoryToDelete}`);
      setCategories(categories.filter(cat => cat._id !== categoryToDelete));
      setDeleteDialogOpen(false);
      setSnackbarMessage('SuperCategory deleted successfully!');
      setSnackbarSeverity('success');
    } catch (err) {
      setSnackbarMessage('Failed to delete SuperCategory');
      setSnackbarSeverity('error');
    } finally {
      setSnackbarOpen(true);
    }
  };

  const handleEditCategory = async (category) => {
    try {
      const response = await apiClient.get(`/api/super-category/get-by-id-super-category/${category._id}`);
      const fullCategoryDetails = response.data;

      setEditingCategory(fullCategoryDetails);
      setEditTitle(fullCategoryDetails.title);
     
      setEditImage(null);
    } catch (err) {
      setSnackbarMessage('Failed to fetch SuperCategory details');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleUpdateCategory = async () => {
    try {
      const formData = new FormData();
      formData.append('title', editTitle);
      if (editImage) formData.append('file', editImage);

      await apiClient.put(`/api/super-category/update-super-category/${editingCategory._id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setCategories(categories.map(cat => (cat._id === editingCategory._id ? { ...cat, title: editTitle, ...(editImage && { imageUrl: URL.createObjectURL(editImage) }) } : cat)));
      setEditingCategory(null);
      setSnackbarMessage('SuperCategory updated successfully!');
      setSnackbarSeverity('success');
    } catch (err) {
      setSnackbarMessage('Failed to update SuperCategory');
      setSnackbarSeverity('error');
    } finally {
      setSnackbarOpen(true);
    }
  };

  const handleFileChange = (event) => {
    setEditImage(event.target.files[0]);
  };
  const handleCloseSnackbar = () => setSnackbarOpen(false);

  const handleClearFilters = () => {
    setTempCategoryFilter("all");
    setTempStatusFilter("all");
  };

  const handleApplyFilters = () => {
    setSelectedCategoryFilter(tempCategoryFilter);
    setSelectedStatusFilter(tempStatusFilter);
    setSortOrder(tempSortOrder);
    setFilterDrawerOpen(false);
  };

  const handleOpenFilterDrawer = () => {
    // Sync temp values with current values when opening drawer
    setTempCategoryFilter(selectedCategoryFilter);
    setTempStatusFilter(selectedStatusFilter);
    setTempSortOrder(sortOrder);
    setFilterDrawerOpen(true);
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (selectedCategoryFilter !== "all") count++;
    if (selectedStatusFilter !== "all") count++;
    return count;
  };

  // Handle enable/disable toggle
  const handleToggleEnabled = async (category) => {
    const newEnabled = !category.enabled;
    try {
      // Optimistically update UI
      setCategories(categories.map(cat =>
        cat._id === category._id ? { ...cat, enabled: newEnabled } : cat
      ));
      await apiClient.put(`/api/super-category/update-super-category/${category._id}`,
        { enabled: newEnabled }
      );
      setSnackbarMessage(`SuperCategory ${newEnabled ? 'enabled' : 'disabled'}!`);
      setSnackbarSeverity('success');
    } catch (err) {
      setSnackbarMessage('Failed to update enabled status');
      setSnackbarSeverity('error');
      // Revert UI if failed
      setCategories(categories.map(cat =>
        cat._id === category._id ? { ...cat, enabled: category.enabled } : cat
      ));
    } finally {
      setSnackbarOpen(true);
    }
  };

  if (loading)
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <MDTypography>Loading Super Categories...</MDTypography>
      </Box>
    );
  if (error) return <MDTypography color="error">{error}</MDTypography>;

  // Filter categories by search term, category filter, and status filter
  const filteredCategories = categories.filter((category) => {
    const term = searchTerm.trim().toLowerCase();
    const matchesSearch =
      !term ||
      (category.title && category.title.toLowerCase().includes(term));
    const matchesCategoryFilter =
      selectedCategoryFilter === "all" || category._id === selectedCategoryFilter;
    const matchesStatusFilter =
      selectedStatusFilter === "all" ||
      (selectedStatusFilter === "enabled" && category.enabled) ||
      (selectedStatusFilter === "disabled" && !category.enabled);
    return matchesSearch && matchesCategoryFilter && matchesStatusFilter;
  });

  // Sort filtered categories
  const sortedCategories = [...filteredCategories].sort((a, b) => {
    if (sortOrder === "az") {
      return a.title.localeCompare(b.title);
    } else {
      return b.title.localeCompare(a.title);
    }
  });

  return (
    <DashboardLayout>
      <DashboardNavbar onSearch={setSearchTerm} />
      <MDBox>
        <Box display="flex" justifyContent="flex-end" alignItems="center" mb={3}>
          <Box display="flex" alignItems="center" gap={2}>
            <Tooltip title="Open Filters">
              <IconButton
                onClick={handleOpenFilterDrawer}
                sx={{
                  height: 28,
                  width: 28,
                }}
              >
                <Badge badgeContent={getActiveFilterCount()} color="error">
                  <FilterList sx={{ color: '#000', fontSize: 24 }} />
                </Badge>
              </IconButton>
            </Tooltip>
            <Tooltip title="Add New Super Category">
              <IconButton
                onClick={handleAddCategory}
                sx={{
                  height: 38,
                  width: 38,
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000">
                  <path d="M440-120v-320H120v-80h320v-320h80v320h320v80H520v320h-80Z"/>
                </svg>
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Filter Drawer */}
        <Drawer
          anchor="right"
          open={filterDrawerOpen}
          onClose={() => setFilterDrawerOpen(false)}
          PaperProps={{
            sx: {
              width: 420,
              p: 3,
            }
          }}
        >
          <Box>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
              <Box display="flex" alignItems="center" gap={1.5}>
                <FilterList sx={{ color: '#000', fontSize: 32 }} />
                <MDTypography variant="h5" fontWeight="bold">
                  Filters
                </MDTypography>
              </Box>
              <IconButton onClick={() => setFilterDrawerOpen(false)}>
                <Clear />
              </IconButton>
            </Box>

            <Divider sx={{ mb: 3 }} />

            {/* Active Filters Summary */}
            {getActiveFilterCount() > 0 && (
              <Box mb={3}>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                  <MDTypography variant="button" fontWeight="medium" color="text">
                    Active Filters ({getActiveFilterCount()})
                  </MDTypography>
                  <Button
                    size="small"
                    color="error"
                    onClick={handleClearFilters}
                    startIcon={<Clear />}
                  >
                    Clear All
                  </Button>
                </Box>
                {tempCategoryFilter !== "all" && (
                  <Chip
                    label={categories.find(c => c._id === tempCategoryFilter)?.title || ''}
                    onDelete={() => setTempCategoryFilter("all")}
                    color="primary"
                    sx={{ mb: 1, mr: 1 }}
                  />
                )}
                {tempStatusFilter !== "all" && (
                  <Chip
                    label={tempStatusFilter === "enabled" ? "Enabled" : "Disabled"}
                    onDelete={() => setTempStatusFilter("all")}
                    color="primary"
                    sx={{ mb: 1 }}
                  />
                )}
                <Divider sx={{ mt: 2 }} />
              </Box>
            )}

            {/* Category Filter */}
            <Box mb={4}>
              <MDTypography variant="body2" fontWeight="bold" sx={{ color: '#000' }} mb={2}>
                Filter by Super Category
              </MDTypography>
              <FormControl fullWidth>
                <Select
                  value={tempCategoryFilter}
                  onChange={(e) => setTempCategoryFilter(e.target.value)}
                  displayEmpty
                  sx={{ 
                    height: 56,
                    borderRadius: 2,
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: tempCategoryFilter !== "all" ? 'grey.600' : 'divider',
                      borderWidth: tempCategoryFilter !== "all" ? 2 : 2,
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'grey.600',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'grey.700',
                      borderWidth: 2,
                    },
                    backgroundColor: tempCategoryFilter !== "all" ? 'grey.100' : 'background.paper',
                  }}
                >
                  <MenuItem 
                    value="all"
                    sx={{
                      py: 1.5,
                      '&:hover': {
                        backgroundColor: 'grey.100',
                      },
                      '&.Mui-selected': {
                        backgroundColor: 'grey.200',
                        '&:hover': {
                          backgroundColor: 'grey.300',
                        },
                      },
                    }}
                  >
                    <Box display="flex" alignItems="center" gap={1.5}>
                      <CategoryIcon fontSize="small" color="action" />
                      <span style={{ fontWeight: 500 }}>All Super Categories</span>
                    </Box>
                  </MenuItem>
                  {categories.map((cat) => (
                    <MenuItem 
                      key={cat._id} 
                      value={cat._id}
                      sx={{
                        py: 1.5,
                        '&:hover': {
                          backgroundColor: 'grey.100',
                        },
                        '&.Mui-selected': {
                          backgroundColor: 'grey.200',
                          '&:hover': {
                            backgroundColor: 'grey.300',
                          },
                        },
                      }}
                    >
                      <Box display="flex" alignItems="center" gap={1.5}>
                        {cat.imageUrl && (
                          <img
                            src={cat.imageUrl}
                            alt={cat.title}
                            style={{
                              width: 32,
                              height: 32,
                              objectFit: "cover",
                              borderRadius: 6,
                            }}
                          />
                        )}
                        <span>{cat.title}</span>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <MDTypography variant="caption" color="text" display="block" mt={1}>
                Filter super categories to view specific items
              </MDTypography>
            </Box>

            {/* Status Filter */}
            <Box mb={4}>
              <MDTypography variant="body2" fontWeight="bold" sx={{ color: '#000' }} mb={2}>
                Status
              </MDTypography>
              <FormControl fullWidth>
                <Select
                  value={tempStatusFilter}
                  onChange={(e) => setTempStatusFilter(e.target.value)}
                  displayEmpty
                  sx={{ 
                    height: 56,
                    borderRadius: 2,
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: tempStatusFilter !== "all" ? 'grey.600' : 'divider',
                      borderWidth: 2,
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'grey.600',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'grey.700',
                      borderWidth: 2,
                    },
                    backgroundColor: tempStatusFilter !== "all" ? 'grey.100' : 'background.paper',
                  }}
                >
                  <MenuItem 
                    value="all"
                    sx={{
                      py: 1.5,
                      '&:hover': {
                        backgroundColor: 'grey.100',
                      },
                      '&.Mui-selected': {
                        backgroundColor: 'grey.200',
                        '&:hover': {
                          backgroundColor: 'grey.300',
                        },
                      },
                    }}
                  >
                    <Box display="flex" alignItems="center" gap={1.5}>
                      <CategoryIcon fontSize="small" color="action" />
                      <span style={{ fontWeight: 500 }}>All Status</span>
                    </Box>
                  </MenuItem>
                  <MenuItem 
                    value="enabled"
                    sx={{
                      py: 1.5,
                      '&:hover': {
                        backgroundColor: 'grey.100',
                      },
                      '&.Mui-selected': {
                        backgroundColor: 'grey.200',
                        '&:hover': {
                          backgroundColor: 'grey.300',
                        },
                      },
                    }}
                  >
                    <Box display="flex" alignItems="center" gap={1.5}>
                      <Box
                        sx={{
                          width: 10,
                          height: 10,
                          borderRadius: '50%',
                          backgroundColor: 'success.main',
                        }}
                      />
                      <span>Enabled</span>
                    </Box>
                  </MenuItem>
                  <MenuItem 
                    value="disabled"
                    sx={{
                      py: 1.5,
                      '&:hover': {
                        backgroundColor: 'grey.100',
                      },
                      '&.Mui-selected': {
                        backgroundColor: 'grey.200',
                        '&:hover': {
                          backgroundColor: 'grey.300',
                        },
                      },
                    }}
                  >
                    <Box display="flex" alignItems="center" gap={1.5}>
                      <Box
                        sx={{
                          width: 10,
                          height: 10,
                          borderRadius: '50%',
                          backgroundColor: 'error.main',
                        }}
                      />
                      <span>Disabled</span>
                    </Box>
                  </MenuItem>
                </Select>
              </FormControl>
              <MDTypography variant="caption" color="text" display="block" mt={1}>
                Filter by enabled or disabled status
              </MDTypography>
            </Box>

            {/* Sort Control */}
            <Box mb={4}>
              <MDTypography variant="body2" fontWeight="bold" sx={{ color: '#000' }} mb={2}>
                Sort Results
              </MDTypography>
              <FormControl fullWidth>
                <Select
                  value={tempSortOrder}
                  onChange={(e) => setTempSortOrder(e.target.value)}
                  displayEmpty
                  sx={{
                    height: 56,
                    borderRadius: 2,
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderWidth: 2,
                      borderColor: 'divider',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'grey.600',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'grey.700',
                      borderWidth: 2,
                    },
                    backgroundColor: 'background.paper',
                  }}
                >
                  <MenuItem 
                    value="az"
                    sx={{
                      py: 1.5,
                      '&:hover': {
                        backgroundColor: 'grey.100',
                      },
                      '&.Mui-selected': {
                        backgroundColor: 'grey.200',
                        '&:hover': {
                          backgroundColor: 'grey.300',
                        },
                      },
                    }}
                  >
                    <Box display="flex" alignItems="center" gap={1.5}>
                      <SwapVert fontSize="small" color="action" />
                      <span>A → Z (Ascending)</span>
                    </Box>
                  </MenuItem>
                  <MenuItem 
                    value="za"
                    sx={{
                      py: 1.5,
                      '&:hover': {
                        backgroundColor: 'grey.100',
                      },
                      '&.Mui-selected': {
                        backgroundColor: 'grey.200',
                        '&:hover': {
                          backgroundColor: 'grey.300',
                        },
                      },
                    }}
                  >
                    <Box display="flex" alignItems="center" gap={1.5}>
                      <SwapVert fontSize="small" color="action" sx={{ transform: 'rotate(180deg)' }} />
                      <span>Z → A (Descending)</span>
                    </Box>
                  </MenuItem>
                </Select>
              </FormControl>
              <MDTypography variant="caption" color="text" display="block" mt={1}>
                Sort super categories alphabetically
              </MDTypography>
            </Box>

            {/* Apply Button */}
            <Box mt={4}>
              <Button
                fullWidth
                variant="contained"
                color="primary"
                size="large"
                onClick={handleApplyFilters}
                sx={{ 
                  height: 56,
                  borderRadius: 2,
                  fontSize: '1rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  color: '#fff',
                  boxShadow: 2,
                  '&:hover': {
                    boxShadow: 4,
                  }
                }}
              >
                Apply Filters
              </Button>
            </Box>
          </Box>
        </Drawer>

        <TableContainer component={Paper}>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell><strong>S.No</strong></TableCell>
                <TableCell><strong>Image</strong></TableCell>
                <TableCell><strong>Title</strong></TableCell>
                <TableCell><strong>Enable/Disable</strong></TableCell>
                <TableCell><strong>Actions</strong></TableCell>
              </TableRow>
              {sortedCategories.map((category, index) => (
                <TableRow key={category._id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>
                    <img
                      src={category.imageUrl}
                      alt={category.title}
                      style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }}
                    />
                  </TableCell>
                  <TableCell>
                    <Box>
                      <MDTypography variant="body2" fontWeight="medium">{category.title}</MDTypography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={Boolean(category.enabled)} // true = right/on, false = left/off
                      onChange={() => handleToggleEnabled(category)}
                      color="primary"
                    />
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <Tooltip title="View Details">
                        <IconButton
                          color="info"
                          size="small"
                          onClick={() => handleViewDetails(category)}
                        >
                          <Visibility fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit">
                        <IconButton
                          color="primary"
                          size="small"
                          onClick={() => handleEditCategory(category)}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          color="error"
                          size="small"
                          onClick={() => handleDeleteClick(category._id)}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            Are you sure you want to delete this category?
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)} color="primary">No</Button>
            <Button onClick={confirmDeleteCategory} color="error">Yes</Button>
          </DialogActions>
        </Dialog>

        <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleCloseSnackbar}>
          <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
            {snackbarMessage}
          </Alert>
        </Snackbar>
        {/* Category Details Dialog */}
        {selectedCategory && (
          <Dialog open={!!selectedCategory} onClose={handleCloseDetails}>
            <DialogTitle>Category Details</DialogTitle>
            <DialogContent>
              <MDTypography><strong>Title:</strong> {selectedCategory.title}</MDTypography>
              <img
                src={selectedCategory.imageUrl}
                alt={selectedCategory.title}
                style={{ maxWidth: '100%', marginTop: '10px', borderRadius: '8px' }}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDetails} color="primary">Close</Button>
            </DialogActions>
          </Dialog>
        )}

        {/* Edit Category Dialog */}
        {editingCategory && (
          <Dialog open={!!editingCategory} onClose={() => setEditingCategory(null)}>
            <DialogTitle>Edit Category</DialogTitle>
            <DialogContent>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <TextField
                  label="Title"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                />
              </FormControl>

              <FormControl fullWidth sx={{ mb: 2 }}>
                <TextField
                  type="file"
                  label="Select Image"
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ accept: 'image/*' }}
                  onChange={handleFileChange}
                />
              </FormControl>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setEditingCategory(null)} color="primary">
                Cancel
              </Button>
              <Button onClick={handleUpdateCategory} color="primary" style={{ color: "#fff" }} variant="contained">
                Update
              </Button>
            </DialogActions>
          </Dialog>
        )}
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
};

export default SuperCategoryManagement;
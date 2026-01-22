import { Clear, FilterList, SwapVert, Visibility, Edit, Delete } from '@mui/icons-material';
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
    Paper,
    Snackbar,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableRow,
    TextField,
    Tooltip
} from '@mui/material';
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import apiClient from "api/axios";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import Footer from 'examples/Footer';
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const BrandManagement = () => {
  const navigate = useNavigate();
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [editingBrand, setEditingBrand] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  // const [editSubTitle, setEditSubTitle] = useState('');
  // const [editDescription, setEditDescription] = useState('');
  const [editImage, setEditImage] = useState(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [brandToDelete, setBrandToDelete] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("az");
  const [selectedBrandFilter, setSelectedBrandFilter] = useState("all");
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  // Temporary filter states (used in the drawer before applying)
  const [tempBrandFilter, setTempBrandFilter] = useState("all");
  const [tempSortOrder, setTempSortOrder] = useState("az");

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const response = await apiClient.get("/api/brand/get-brand");
        setBrands(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch brands');
        setLoading(false);
      }
    };
    fetchBrands();
  }, []);

  const handleAddBrand = () => {
    navigate('/add-brand');
  };

  const handleViewDetails = (brand) => {
    setSelectedBrand(brand);
  };

  const handleCloseDetails = () => {
    setSelectedBrand(null);
  };

  const handleDeleteClick = (brandId) => {
    setBrandToDelete(brandId);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteBrand = async () => {
    try {
      await apiClient.delete(`/api/brand/delete-brand/${brandToDelete}`);
      setBrands(brands.filter(brand => brand._id !== brandToDelete));
      setDeleteDialogOpen(false);
      setSnackbarMessage('Brand deleted successfully!');
      setSnackbarSeverity('success');
    } catch (err) {
      setSnackbarMessage('Failed to delete Brand');
      setSnackbarSeverity('error');
    } finally {
      setSnackbarOpen(true);
    }
  };

  const handleEditBrand = async (brand) => {
    try {
      const response = await apiClient.get(`/api/brand/get-id-brand/${brand._id}`);
      const fullBrandDetails = response.data;

      setEditingBrand(fullBrandDetails);
      setEditTitle(fullBrandDetails.title);
      // setEditSubTitle(fullBrandDetails.sub_title);
      // setEditDescription(fullBrandDetails.description);
      setEditImage(null);
    } catch (err) {
      setSnackbarMessage('Failed to fetch Brand details');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleUpdateBrand = async () => {
    try {
      const formData = new FormData();
      formData.append('title', editTitle);
      // formData.append('sub_title', editSubTitle);
      // formData.append('description', editDescription);
      if (editImage) formData.append('file', editImage);

      await apiClient.put(`/api/brand/update-brand/${editingBrand._id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setBrands(brands.map(brand => (brand._id === editingBrand._id ? { 
        ...brand, 
        title: editTitle, 
        // sub_title: editSubTitle, 
        // description: editDescription, 
        ...(editImage && { imageUrl: URL.createObjectURL(editImage) }) 
      } : brand)));
      
      setEditingBrand(null);
      setSnackbarMessage('Brand updated successfully!');
      setSnackbarSeverity('success');
    } catch (err) {
      setSnackbarMessage('Failed to update Brand');
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
    setTempBrandFilter("all");
  };

  const handleApplyFilters = () => {
    setSelectedBrandFilter(tempBrandFilter);
    setSortOrder(tempSortOrder);
    setFilterDrawerOpen(false);
  };

  const handleOpenFilterDrawer = () => {
    // Sync temp values with current values when opening drawer
    setTempBrandFilter(selectedBrandFilter);
    setTempSortOrder(sortOrder);
    setFilterDrawerOpen(true);
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (selectedBrandFilter !== "all") count++;
    return count;
  };

  // Filter brands by search term and brand filter
  const filteredBrands = brands.filter((brand) => {
    const matchesSearch = brand.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBrandFilter = selectedBrandFilter === "all" || brand._id === selectedBrandFilter;
    return matchesSearch && matchesBrandFilter;
  });

  // Sort filtered brands
  const sortedBrands = [...filteredBrands].sort((a, b) => {
    if (sortOrder === "az") {
      return a.title.localeCompare(b.title);
    } else {
      return b.title.localeCompare(a.title);
    }
  });

  if (loading)
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <MDTypography>Loading brands...</MDTypography>
      </Box>
    );
    if (error) return <MDTypography color="error">{error}</MDTypography>;

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
            <Tooltip title="Add New Brand">
              <IconButton
                onClick={handleAddBrand}
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
                {tempBrandFilter !== "all" && (
                  <Chip
                    label={brands.find(b => b._id === tempBrandFilter)?.title || ''}
                    onDelete={handleClearFilters}
                    color="primary"
                    sx={{ mb: 1 }}
                  />
                )}
                <Divider sx={{ mt: 2 }} />
              </Box>
            )}

            {/* Brand Filter */}
            <Box mb={4}>
              <MDTypography variant="body2" fontWeight="bold" sx={{ color: '#000' }} mb={2}>
                Filter by Brand
              </MDTypography>
              <FormControl fullWidth>
                <Select
                  value={tempBrandFilter}
                  onChange={(e) => setTempBrandFilter(e.target.value)}
                  displayEmpty
                  sx={{ 
                    height: 56,
                    borderRadius: 2,
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: tempBrandFilter !== "all" ? 'grey.600' : 'divider',
                      borderWidth: 2,
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'grey.600',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'grey.700',
                      borderWidth: 2,
                    },
                    backgroundColor: tempBrandFilter !== "all" ? 'grey.100' : 'background.paper',
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
                      <span style={{ fontWeight: 500 }}>All Brands</span>
                    </Box>
                  </MenuItem>
                  {brands.map((brand) => (
                    <MenuItem 
                      key={brand._id} 
                      value={brand._id}
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
                        {brand.imageUrl && (
                          <img
                            src={brand.imageUrl}
                            alt={brand.title}
                            style={{
                              width: 32,
                              height: 32,
                              objectFit: "cover",
                              borderRadius: 6,
                            }}
                          />
                        )}
                        <span>{brand.title}</span>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <MDTypography variant="caption" color="text" display="block" mt={1}>
                Filter brands to view specific items
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
                Sort brands alphabetically
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
                {/* <TableCell><strong>Description</strong></TableCell> */}
                <TableCell><strong>Actions</strong></TableCell>
              </TableRow>
              {sortedBrands.map((brand, index) => (
                <TableRow key={brand._id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>
                    <img 
                      src={brand.imageUrl} 
                      alt={brand.title} 
                      style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }} 
                    />
                  </TableCell>
                  <TableCell>
                    <Box>
                      <MDTypography variant="body2" fontWeight="medium">{brand.title}</MDTypography>
                      {/* <MDTypography variant="caption" color="text">{brand.sub_title}</MDTypography> */}
                    </Box>
                  </TableCell>
                  {/* <TableCell>
                    {brand.description.length > 50 
                      ? `${brand.description.substring(0, 50)}...` 
                      : brand.description}
                  </TableCell> */}
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <Tooltip title="View Details">
                        <IconButton 
                          color="info" 
                          size="small"
                          onClick={() => handleViewDetails(brand)}
                        >
                          <Visibility fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit">
                        <IconButton 
                          color="primary" 
                          size="small"
                          onClick={() => handleEditBrand(brand)}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton 
                          color="error" 
                          size="small" 
                          onClick={() => handleDeleteClick(brand._id)}
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
            Are you sure you want to delete this brand?
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)} color="primary">No</Button>
            <Button onClick={confirmDeleteBrand} color="error">Yes</Button>
          </DialogActions>
        </Dialog>

        <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleCloseSnackbar}>
          <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
            {snackbarMessage}
          </Alert>
        </Snackbar>

        {/* Brand Details Dialog */}
        {selectedBrand && (
          <Dialog open={!!selectedBrand} onClose={handleCloseDetails}>
            <DialogTitle>Brand Details</DialogTitle>
            <DialogContent>
              <MDTypography><strong>Title:</strong> {selectedBrand.title}</MDTypography>
              {/* <MDTypography><strong>Sub Title:</strong> {selectedBrand.sub_title}</MDTypography> */}
              {/* <MDTypography><strong>Description:</strong> {selectedBrand.description}</MDTypography> */}
              <img 
                src={selectedBrand.imageUrl} 
                alt={selectedBrand.title} 
                style={{ maxWidth: '100%', marginTop: '10px', borderRadius: '8px' }} 
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDetails} color="primary">Close</Button>
            </DialogActions>
          </Dialog>
        )}

        {/* Edit Brand Dialog */}
        {editingBrand && (
          <Dialog open={!!editingBrand} onClose={() => setEditingBrand(null)}>
            <DialogTitle>Edit Brand</DialogTitle>
            <DialogContent>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <TextField
                  label="Title"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                />
              </FormControl>
              {/* <FormControl fullWidth sx={{ mb: 2 }}>
                <TextField
                  label="Sub Title"
                  value={editSubTitle}
                  onChange={(e) => setEditSubTitle(e.target.value)}
                />
              </FormControl>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <TextField
                  label="Description"
                  multiline
                  rows={4}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                />
              </FormControl> */}
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
              <Button onClick={() => setEditingBrand(null)} color="primary">
                Cancel
              </Button>
              <Button onClick={handleUpdateBrand} color="primary" style={{ color: "#fff" }} variant="contained">
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

export default BrandManagement;
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
    MenuItem,
    Paper,
    Select,
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
import apiClient from "api/axios";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import Footer from 'examples/Footer';
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CropManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCrop, setSelectedCrop] = useState(null);
  const [editingCrop, setEditingCrop] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  // const [editSubTitle, setEditSubTitle] = useState('');
  // const [editDescription, setEditDescription] = useState('');
  const [editImage, setEditImage] = useState(null);

  // Add Crop states
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newCropTitle, setNewCropTitle] = useState('');
  const [newCropImage, setNewCropImage] = useState(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [cropToDelete, setCropToDelete] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [sortOrder, setSortOrder] = useState("az");
  const [selectedCropFilter, setSelectedCropFilter] = useState("all");
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  // Temporary filter states (used in the drawer before applying)
  const [tempCropFilter, setTempCropFilter] = useState("all");
  const [tempSortOrder, setTempSortOrder] = useState("az");

  useEffect(() => {
    const fetchCrops = async () => {
      try {
        const cropsRes = await apiClient.get("/api/crop/get-crops");
        setCrops(cropsRes.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch crops');
        setLoading(false);
      }
    };
    fetchCrops();
  }, []);

  const handleAddCrop = () => {
    setAddDialogOpen(true);
    setNewCropTitle('');
    setNewCropImage(null);
  };

  const handleCloseAddDialog = () => {
    setAddDialogOpen(false);
    setNewCropTitle('');
    setNewCropImage(null);
  };

  const handleCreateCrop = async () => {
    try {
      if (!newCropTitle.trim()) {
        setSnackbarMessage('Please enter crop name');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        return;
      }

      if (!newCropImage) {
        setSnackbarMessage('Please select an image');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        return;
      }

      const formData = new FormData();
      formData.append('title', newCropTitle);
      formData.append('file', newCropImage);

      const response = await apiClient.post("/api/crop/add-crop", formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // Add new crop to the list
      setCrops([...crops, response.data]);
      
      setAddDialogOpen(false);
      setNewCropTitle('');
      setNewCropImage(null);
      setSnackbarMessage('Crop created successfully!');
      setSnackbarSeverity('success');
    } catch (err) {
      console.error('Error creating crop:', err);
      setSnackbarMessage(err.response?.data?.message || 'Failed to create crop');
      setSnackbarSeverity('error');
    } finally {
      setSnackbarOpen(true);
    }
  };

  const handleNewCropImageChange = (event) => {
    setNewCropImage(event.target.files[0]);
  };

  const handleViewDetails = (crop) => {
    setSelectedCrop(crop);
  };

  const handleCloseDetails = () => {
    setSelectedCrop(null);
  };

  const handleDeleteClick = (cropId) => {
    setCropToDelete(cropId);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteCrop = async () => {
    try {
      await apiClient.delete(`/api/crop/delete-crop/${cropToDelete}`);
      setCrops(crops.filter(crop => crop._id !== cropToDelete));
      setDeleteDialogOpen(false);
      setSnackbarMessage('Crop deleted successfully!');
      setSnackbarSeverity('success');
    } catch (err) {
      setSnackbarMessage('Failed to delete Crop');
      setSnackbarSeverity('error');
    } finally {
      setSnackbarOpen(true);
    }
  };

  const handleEditCrop = async (crop) => {
    try {
      const response = await apiClient.get(`/api/crop/get-id-crop/${crop._id}`);
      const fullCropDetails = response.data;

      setEditingCrop(fullCropDetails);
      setEditTitle(fullCropDetails.title);
      // setEditSubTitle(fullCropDetails.sub_title);
      // setEditDescription(fullCropDetails.description);
      setEditImage(null);
    } catch (err) {
      setSnackbarMessage('Failed to fetch Crop details');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleUpdateCrop = async () => {
    try {
      const formData = new FormData();
      formData.append('title', editTitle);
      // formData.append('sub_title', editSubTitle);
      // formData.append('description', editDescription);
      if (editImage) formData.append('file', editImage);

      await apiClient.put(`/api/crop/update-crop/${editingCrop._id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setCrops(crops.map(crop => (crop._id === editingCrop._id ? { 
        ...crop, 
        title: editTitle, 
        // sub_title: editSubTitle, 
        // description: editDescription, 
        ...(editImage && { imageUrl: URL.createObjectURL(editImage) }) 
      } : crop)));
      
      setEditingCrop(null);
      setSnackbarMessage('Crop updated successfully!');
      setSnackbarSeverity('success');
    } catch (err) {
      setSnackbarMessage('Failed to update Crop');
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
    setTempCropFilter("all");
  };

  const handleApplyFilters = () => {
    setSelectedCropFilter(tempCropFilter);
    setSortOrder(tempSortOrder);
    setFilterDrawerOpen(false);
  };

  const handleOpenFilterDrawer = () => {
    // Sync temp values with current values when opening drawer
    setTempCropFilter(selectedCropFilter);
    setTempSortOrder(sortOrder);
    setFilterDrawerOpen(true);
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (selectedCropFilter !== "all") count++;
    return count;
  };

  if (loading)
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <MDTypography>Loading crops...</MDTypography>
      </Box>
    );
  if (error) return <MDTypography color="error">{error}</MDTypography>;

  // Filter crops by search term and crop filter
  const filteredCrops = crops.filter((crop) => {
    const term = searchTerm.trim().toLowerCase();
    const matchesSearch = !term || (crop.title && crop.title.toLowerCase().includes(term));
    const matchesCropFilter = selectedCropFilter === "all" || crop._id === selectedCropFilter;
    return matchesSearch && matchesCropFilter;
  });

  // Sort filtered crops
  const sortedCrops = [...filteredCrops].sort((a, b) => {
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
            <Tooltip title="Add New Crop">
              <IconButton
                onClick={handleAddCrop}
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
                {tempCropFilter !== "all" && (
                  <Chip
                    label={crops.find(c => c._id === tempCropFilter)?.title || ''}
                    onDelete={handleClearFilters}
                    color="primary"
                    sx={{ mb: 1 }}
                  />
                )}
                <Divider sx={{ mt: 2 }} />
              </Box>
            )}

            {/* Crop Filter */}
            <Box mb={4}>
              <MDTypography variant="body2" fontWeight="bold" sx={{ color: '#000' }} mb={2}>
                Filter by Crop
              </MDTypography>
              <FormControl fullWidth>
                <Select
                  value={tempCropFilter}
                  onChange={(e) => setTempCropFilter(e.target.value)}
                  displayEmpty
                  sx={{ 
                    height: 56,
                    borderRadius: 2,
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: tempCropFilter !== "all" ? 'grey.600' : 'divider',
                      borderWidth: 2,
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'grey.600',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'grey.700',
                      borderWidth: 2,
                    },
                    backgroundColor: tempCropFilter !== "all" ? 'grey.100' : 'background.paper',
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
                      <span style={{ fontWeight: 500 }}>All Crops</span>
                    </Box>
                  </MenuItem>
                  {crops.map((crop) => (
                    <MenuItem 
                      key={crop._id} 
                      value={crop._id}
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
                        {crop.imageUrl && (
                          <img
                            src={crop.imageUrl}
                            alt={crop.title}
                            style={{
                              width: 32,
                              height: 32,
                              objectFit: "cover",
                              borderRadius: 6,
                            }}
                          />
                        )}
                        <span>{crop.title}</span>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <MDTypography variant="caption" color="text" display="block" mt={1}>
                Filter crops to view specific items
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
                Sort crops alphabetically
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
                <TableCell><strong>Crops</strong></TableCell>
                {/* <TableCell><strong>Description</strong></TableCell> */}
                <TableCell><strong>Actions</strong></TableCell>
              </TableRow>
              {sortedCrops.map((crop, index) => (
                <TableRow key={crop._id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>
                    <img 
                      src={crop.imageUrl} 
                      alt={crop.title} 
                      style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }} 
                    />
                  </TableCell>
                  <TableCell>
                    <Box>
                      <MDTypography variant="body2" fontWeight="medium">{crop.title}</MDTypography>
                      {/* <MDTypography variant="caption" color="text">{crop.sub_title}</MDTypography> */}
                    </Box>
                  </TableCell>
                  {/* <TableCell>
                    {crop.description.length > 50 
                      ? `${crop.description.substring(0, 50)}...` 
                      : crop.description}
                  </TableCell> */}
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <Tooltip title="View Details">
                        <IconButton 
                          color="info" 
                          size="small"
                          onClick={() => handleViewDetails(crop)}
                        >
                          <Visibility fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit">
                        <IconButton 
                          color="primary" 
                          size="small"
                          onClick={() => handleEditCrop(crop)}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton 
                          color="error" 
                          size="small" 
                          onClick={() => handleDeleteClick(crop._id)}
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
            Are you sure you want to delete this crop?
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)} color="primary">No</Button>
            <Button onClick={confirmDeleteCrop} color="error">Yes</Button>
          </DialogActions>
        </Dialog>

        {/* Add Crop Dialog */}
        <Dialog open={addDialogOpen} onClose={handleCloseAddDialog} maxWidth="sm" fullWidth>
          <DialogTitle>Add New Crop</DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Crop Name *"
                variant="outlined"
                value={newCropTitle}
                onChange={(e) => setNewCropTitle(e.target.value)}
                sx={{ mb: 2 }}
                placeholder="e.g., Tomato, Wheat, Rice"
              />
              
              <Box sx={{ mb: 2 }}>
                <MDTypography variant="caption" color="text" display="block" mb={1}>
                  Crop Image *
                </MDTypography>
                <Button
                  variant="outlined"
                  component="label"
                  fullWidth
                  sx={{ height: 56 }}
                >
                  {newCropImage ? newCropImage.name : 'Choose Image'}
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleNewCropImageChange}
                  />
                </Button>
              </Box>

              {newCropImage && (
                <Box sx={{ mt: 2, textAlign: 'center' }}>
                  <MDTypography variant="caption" color="text" display="block" mb={1}>
                    Image Preview:
                  </MDTypography>
                  <img
                    src={URL.createObjectURL(newCropImage)}
                    alt="Preview"
                    style={{ 
                      width: '200px', 
                      height: '200px', 
                      objectFit: 'cover', 
                      borderRadius: '8px',
                      border: '1px solid #ddd'
                    }}
                  />
                </Box>
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseAddDialog} color="secondary">
              Cancel
            </Button>
            <Button 
              onClick={handleCreateCrop} 
              variant="contained" 
              color="primary"
              disabled={!newCropTitle.trim() || !newCropImage}
            >
              Create Crop
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleCloseSnackbar}>
          <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
            {snackbarMessage}
          </Alert>
        </Snackbar>

        {/* Crop Details Dialog */}
        {selectedCrop && (
          <Dialog open={!!selectedCrop} onClose={handleCloseDetails}>
            <DialogTitle>Crop Details</DialogTitle>
            <DialogContent>
              <MDTypography><strong>Crop:</strong> {selectedCrop.title}</MDTypography>
              {/* <MDTypography><strong>Sub Title:</strong> {selectedCrop.sub_title}</MDTypography> */}
              {/* <MDTypography><strong>Description:</strong> {selectedCrop.description}</MDTypography> */}
              <img 
                src={selectedCrop.imageUrl} 
                alt={selectedCrop.title} 
                style={{ maxWidth: '100%', marginTop: '10px', borderRadius: '8px' }} 
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDetails} color="primary">Close</Button>
            </DialogActions>
          </Dialog>
        )}

        {/* Edit Crop Dialog */}
        {editingCrop && (
          <Dialog open={!!editingCrop} onClose={() => setEditingCrop(null)}>
            <DialogTitle>Edit Crop</DialogTitle>
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
              <Button onClick={() => setEditingCrop(null)} color="primary">
                Cancel
              </Button>
              <Button onClick={handleUpdateCrop} color="primary" style={{ color: "#fff" }} variant="contained">
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

export default CropManagement;
import { Clear, Delete, Edit, FilterList, SwapVert, Visibility } from '@mui/icons-material';
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
  InputLabel,
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
  Tooltip,
} from "@mui/material";
import apiClient from "api/axios";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import Footer from "examples/Footer";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const PestManagement = () => {
  const navigate = useNavigate();
  const [pests, setPests] = useState([]);
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPest, setSelectedPest] = useState(null);
  const [editingPest, setEditingPest] = useState(null);
  const [editName, setEditName] = useState('');
  const [editSubTitle, setEditSubTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editAffectedCrops, setEditAffectedCrops] = useState([]);
  const [editImage, setEditImage] = useState(null);

  // Add Pest states
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [addName, setAddName] = useState('');
  const [addSubTitle, setAddSubTitle] = useState('');
  const [addDescription, setAddDescription] = useState('');
  const [addAffectedCrops, setAddAffectedCrops] = useState([]);
  const [addImage, setAddImage] = useState(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [pestToDelete, setPestToDelete] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("az");
  const [selectedPestFilter, setSelectedPestFilter] = useState("all");
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  // Temporary filter states
  const [tempPestFilter, setTempPestFilter] = useState("all");
  const [tempSortOrder, setTempSortOrder] = useState("az");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pestsResponse, cropsResponse] = await Promise.all([
          apiClient.get("/api/pest/get-pests"),
          apiClient.get("/api/crop/get-crops")
        ]);
        setPests(pestsResponse.data);
        setCrops(cropsResponse.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch data');
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAddPest = () => {
    setAddDialogOpen(true);
    setAddName('');
    setAddSubTitle('');
    setAddDescription('');
    setAddAffectedCrops([]);
    setAddImage(null);
  };

  const handleCreatePest = async () => {
    try {
      const formData = new FormData();
      formData.append('name', addName);
      formData.append('sub_title', addSubTitle);
      formData.append('description', addDescription);
      addAffectedCrops.forEach((cropId) => formData.append('affectedCrops', cropId));
      if (addImage) formData.append('file', addImage);

      await apiClient.post("/api/pest/add-pest", formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // Refresh the pest list to get complete data
      const pestsResponse = await apiClient.get("/api/pest/get-pests");
      setPests(pestsResponse.data);
      
      setAddDialogOpen(false);
      setSnackbarMessage('Pest added successfully!');
      setSnackbarSeverity('success');
    } catch (err) {
      setSnackbarMessage('Failed to add Pest');
      setSnackbarSeverity('error');
    } finally {
      setSnackbarOpen(true);
    }
  };

  const handleViewDetails = (pest) => {
    setSelectedPest(pest);
  };

  const handleCloseDetails = () => {
    setSelectedPest(null);
  };

  const handleDeleteClick = (pestId) => {
    setPestToDelete(pestId);
    setDeleteDialogOpen(true);
  };

  const confirmDeletePest = async () => {
    try {
      await apiClient.delete(`/api/pest/delete-pest/${pestToDelete}`);
      setPests(pests.filter(pest => pest._id !== pestToDelete));
      setDeleteDialogOpen(false);
      setSnackbarMessage('Pest deleted successfully!');
      setSnackbarSeverity('success');
    } catch (err) {
      setSnackbarMessage('Failed to delete Pest');
      setSnackbarSeverity('error');
    } finally {
      setSnackbarOpen(true);
    }
  };

  const handleEditPest = async (pest) => {
    try {
      // Use the pest data directly instead of fetching
      setEditingPest(pest);
      setEditName(pest.name || '');
      setEditSubTitle(pest.sub_title || '');
      setEditDescription(pest.description || '');
      setEditAffectedCrops(pest.affectedCrops?.map(crop => crop._id) || []);
      setEditImage(null);
    } catch (err) {
      setSnackbarMessage('Failed to load Pest details');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleUpdatePest = async () => {
    try {
      const formData = new FormData();
      formData.append('name', editName);
      formData.append('sub_title', editSubTitle);
      formData.append('description', editDescription);
      editAffectedCrops.forEach((cropId) => formData.append('affectedCrops', cropId));
      if (editImage) formData.append('file', editImage);

      await apiClient.put(`/api/pest/update-pest/${editingPest._id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // Refresh the pest list to get updated data
      const pestsResponse = await apiClient.get("/api/pest/get-pests");
      setPests(pestsResponse.data);
      
      setEditingPest(null);
      setSnackbarMessage('Pest updated successfully!');
      setSnackbarSeverity('success');
    } catch (err) {
      setSnackbarMessage('Failed to update Pest');
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
    setTempPestFilter("all");
  };

  const handleApplyFilters = () => {
    setSelectedPestFilter(tempPestFilter);
    setSortOrder(tempSortOrder);
    setFilterDrawerOpen(false);
  };

  const handleOpenFilterDrawer = () => {
    setTempPestFilter(selectedPestFilter);
    setTempSortOrder(sortOrder);
    setFilterDrawerOpen(true);
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (selectedPestFilter !== "all") count++;
    return count;
  };

  if (loading)
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <MDTypography>Loading pests...</MDTypography>
      </Box>
    );
  if (error) return <MDTypography color="error">{error}</MDTypography>;

  // Filter pests by search term and pest filter
  const filteredPests = pests.filter((pest) => {
    const term = searchTerm.trim().toLowerCase();
    const matchesSearch = !term || (pest.name && pest.name.toLowerCase().includes(term));
    const matchesPestFilter = selectedPestFilter === "all" || pest._id === selectedPestFilter;
    return matchesSearch && matchesPestFilter;
  });

  // Sort filtered pests
  const sortedPests = [...filteredPests].sort((a, b) => {
    const nameA = a.name || '';
    const nameB = b.name || '';
    if (sortOrder === "az") {
      return nameA.localeCompare(nameB);
    } else {
      return nameB.localeCompare(nameA);
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
            <Tooltip title="Add New Pest">
              <IconButton
                onClick={handleAddPest}
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
                {tempPestFilter !== "all" && (
                  <Chip
                    label={pests.find(p => p._id === tempPestFilter)?.name || ''}
                    onDelete={handleClearFilters}
                    color="primary"
                    sx={{ mb: 1 }}
                  />
                )}
                <Divider sx={{ mt: 2 }} />
              </Box>
            )}

            {/* Pest Filter */}
            <Box mb={4}>
              <MDTypography variant="body2" fontWeight="bold" sx={{ color: '#000' }} mb={2}>
                Filter by Pest
              </MDTypography>
              <FormControl fullWidth>
                <Select
                  value={tempPestFilter}
                  onChange={(e) => setTempPestFilter(e.target.value)}
                  displayEmpty
                  sx={{ 
                    height: 56,
                    borderRadius: 2,
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: tempPestFilter !== "all" ? 'grey.600' : 'divider',
                      borderWidth: 2,
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'grey.600',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'grey.700',
                      borderWidth: 2,
                    },
                    backgroundColor: tempPestFilter !== "all" ? 'grey.100' : 'background.paper',
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
                      <span style={{ fontWeight: 500 }}>All Pests</span>
                    </Box>
                  </MenuItem>
                  {pests.map((pest) => (
                    <MenuItem 
                      key={pest._id} 
                      value={pest._id}
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
                        {pest.imageUrl && (
                          <img
                            src={pest.imageUrl}
                            alt={pest.name}
                            style={{
                              width: 32,
                              height: 32,
                              objectFit: "cover",
                              borderRadius: 6,
                            }}
                          />
                        )}
                        <span>{pest.name}</span>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <MDTypography variant="caption" color="text" display="block" mt={1}>
                Filter pests to view specific items
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
                Sort pests alphabetically
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
                <TableCell><strong>Name</strong></TableCell>
                <TableCell><strong>Sub Title</strong></TableCell>
                <TableCell><strong>Affected Crops</strong></TableCell>
                <TableCell><strong>Actions</strong></TableCell>
              </TableRow>
              {sortedPests.map((pest, index) => (
                <TableRow key={pest._id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>
                    <img 
                      src={pest.imageUrl} 
                      alt={pest.name} 
                      style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }} 
                    />
                  </TableCell>
                  <TableCell>
                    <Box>
                      <MDTypography variant="body2">{pest.name}</MDTypography>
                    </Box>
                  </TableCell>
                  <TableCell>{pest.sub_title}</TableCell>
                  <TableCell>
                    {pest.affectedCrops?.map(crop => crop.title).join(", ") || "N/A"}
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <Tooltip title="View Details">
                        <IconButton 
                          color="info" 
                          size="small"
                          onClick={() => handleViewDetails(pest)}
                        >
                          <Visibility fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit">
                        <IconButton 
                          color="primary" 
                          size="small"
                          onClick={() => handleEditPest(pest)}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton 
                          color="error" 
                          size="small" 
                          onClick={() => handleDeleteClick(pest._id)}
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
            Are you sure you want to delete this pest?
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)} color="primary">No</Button>
            <Button onClick={confirmDeletePest} color="error">Yes</Button>
          </DialogActions>
        </Dialog>

        <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleCloseSnackbar}>
          <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
            {snackbarMessage}
          </Alert>
        </Snackbar>

        {/* Pest Details Dialog */}
        {selectedPest && (
          <Dialog open={!!selectedPest} onClose={handleCloseDetails}>
            <DialogTitle>Pest Details</DialogTitle>
            <DialogContent>
              <MDTypography><strong>Name:</strong> {selectedPest.name}</MDTypography>
              <MDTypography><strong>Sub Title:</strong> {selectedPest.sub_title}</MDTypography>
              <MDTypography><strong>Description:</strong> {selectedPest.description}</MDTypography>
              <MDTypography><strong>Affected Crops:</strong> {selectedPest.affectedCrops?.map(crop => crop.title).join(", ") || "N/A"}</MDTypography>
              <img 
                src={selectedPest.imageUrl} 
                alt={selectedPest.name} 
                style={{ maxWidth: '100%', marginTop: '10px', borderRadius: '8px' }} 
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDetails} color="primary">Close</Button>
            </DialogActions>
          </Dialog>
        )}

        {/* Edit Pest Dialog */}
        {editingPest && (
          <Dialog 
            open={!!editingPest} 
            onClose={() => setEditingPest(null)} 
            maxWidth="sm" 
            fullWidth
            PaperProps={{
              sx: {
                borderRadius: 3,
                boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
              }
            }}
          >
            <DialogTitle 
              sx={{ 
                fontSize: '1.5rem',
                fontWeight: 600,
                color: '#1a237e',
                pb: 1,
                borderBottom: '2px solid #e0e0e0'
              }}
            >
              Edit Pest
            </DialogTitle>
            <DialogContent sx={{ pt: 4, pb: 3, px: 4 }}>
              <FormControl fullWidth sx={{ mb: 3, mt: 1 }}>
                <TextField
                  label="Name"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '&:hover fieldset': {
                        borderColor: '#9e9e9e',
                      },
                      '&.Mui-focused fieldset': {
                        borderWidth: '2px',
                      },
                    },
                  }}
                />
              </FormControl>
              <FormControl fullWidth sx={{ mb: 3 }}>
                <TextField
                  label="Sub Title"
                  value={editSubTitle}
                  onChange={(e) => setEditSubTitle(e.target.value)}
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '&:hover fieldset': {
                        borderColor: '#9e9e9e',
                      },
                      '&.Mui-focused fieldset': {
                        borderWidth: '2px',
                      },
                    },
                  }}
                />
              </FormControl>
              <FormControl fullWidth sx={{ mb: 3 }}>
                <TextField
                  label="Description"
                  multiline
                  rows={4}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '&:hover fieldset': {
                        borderColor: '#9e9e9e',
                      },
                      '&.Mui-focused fieldset': {
                        borderWidth: '2px',
                      },
                    },
                  }}
                />
              </FormControl>
              <FormControl 
                fullWidth 
                sx={{ 
                  mb: 3,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    backgroundColor: '#fafafa',
                    minHeight: '56px',
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#9e9e9e',
                      borderWidth: '2px',
                    },
                    '&.Mui-focused': {
                      backgroundColor: '#fff',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderWidth: '2px',
                      borderColor: '#9e9e9e',
                    },
                  },
                  '& .MuiSelect-select': {
                    minHeight: '56px !important',
                    display: 'flex',
                    alignItems: 'center',
                    paddingTop: '16px',
                    paddingBottom: '16px',
                  },
                  '& .MuiInputLabel-root': {
                    fontWeight: 500,
                    '&.Mui-focused': {
                      color: '#9e9e9e',
                      fontWeight: 600,
                    },
                  },
                }}
              >
                <InputLabel>Affected Crops</InputLabel>
                <Select
                  multiple
                  value={editAffectedCrops}
                  onChange={(e) => setEditAffectedCrops(e.target.value)}
                  label="Affected Crops"
                  renderValue={(selected) => {
                    if (selected.length === 0) {
                      return <em style={{ color: '#999' }}>Select crops</em>;
                    }
                    const selectedCrops = crops.filter(crop => selected.includes(crop._id)).map(crop => crop.title);
                    return (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selectedCrops.map((value) => (
                          <Chip 
                            key={value} 
                            label={value} 
                            size="small"
                            sx={{
                              backgroundColor: '#e3f2fd',
                              color: '#1976d2',
                              fontWeight: 500,
                              '& .MuiChip-label': {
                                px: 1.5,
                              },
                            }}
                          />
                        ))}
                      </Box>
                    );
                  }}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        maxHeight: 300,
                        borderRadius: 2,
                        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                        mt: 1,
                      },
                    },
                  }}
                >
                  {crops.map((crop) => (
                    <MenuItem 
                      key={crop._id} 
                      value={crop._id}
                      sx={{
                        py: 1.5,
                        px: 2,
                        '&:hover': {
                          backgroundColor: '#e3f2fd',
                        },
                        '&.Mui-selected': {
                          backgroundColor: '#bbdefb',
                          fontWeight: 600,
                          '&:hover': {
                            backgroundColor: '#90caf9',
                          },
                        },
                      }}
                    >
                      {crop.title}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Box sx={{ mb: 2 }}>
                <MDTypography variant="caption" color="text" display="block" mb={1}>
                  Affected Crops
                </MDTypography>
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="edit-image-upload"
                  type="file"
                  onChange={handleFileChange}
                />
                <label htmlFor="edit-image-upload">
                  <Button
                    variant="outlined"
                    component="span"
                    fullWidth
                    sx={{
                      borderRadius: 2,
                      py: 1.5,
                      textTransform: 'none',
                      fontSize: '1rem',
                      borderWidth: '2px',
                      borderColor: '#9e9e9e',
                      color: '#666',
                      backgroundColor: '#fafafa',
                      justifyContent: 'flex-start',
                      '&:hover': {
                        borderWidth: '2px',
                        borderColor: '#9e9e9e',
                        backgroundColor: '#e0e0e0',
                      },
                    }}
                  >
                    {editImage ? editImage.name : 'Upload the image'}
                  </Button>
                </label>
                {editingPest?.imageUrl && !editImage && (
                  <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                    <MDTypography variant="caption" color="text">
                      Current Image:
                    </MDTypography>
                    <Box
                      component="img"
                      src={editingPest.imageUrl}
                      alt="Current pest image"
                      sx={{
                        width: 80,
                        height: 80,
                        objectFit: 'cover',
                        borderRadius: 2,
                        border: '2px solid #e0e0e0',
                      }}
                    />
                  </Box>
                )}
              </Box>
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2.5, borderTop: '1px solid #e0e0e0', gap: 1.5, backgroundColor: '#fafafa' }}>
              <Button 
                onClick={() => setEditingPest(null)} 
                variant="outlined"
                sx={{
                  borderRadius: 2,
                  px: 4,
                  py: 1.2,
                  textTransform: 'none',
                  fontSize: '1rem',
                  fontWeight: 600,
                  borderWidth: '2px',
                  borderColor: '#9e9e9e',
                  color: '#000',
                }}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleUpdatePest} 
                variant="contained"
                sx={{
                  borderRadius: 2,
                  px: 4,
                  py: 1.2,
                  textTransform: 'none',
                  fontSize: '1rem',
                  fontWeight: 600,
                  color: '#fff',
                  backgroundColor: '#1976d2',
                  boxShadow: '0 4px 14px rgba(25, 118, 210, 0.4)',
                  '&:hover': {
                    backgroundColor: '#1565c0',
                    boxShadow: '0 6px 20px rgba(25, 118, 210, 0.5)',
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.2s ease-in-out',
                }}
              >
                Update
              </Button>
            </DialogActions>
          </Dialog>
        )}

        {/* Add Pest Dialog */}
        <Dialog 
          open={addDialogOpen} 
          onClose={() => setAddDialogOpen(false)} 
          maxWidth="sm" 
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            }
          }}
        >
          <DialogTitle 
            sx={{ 
              fontSize: '1.5rem',
              fontWeight: 600,
              color: '#1a237e',
              pb: 1,
              borderBottom: '2px solid #e0e0e0'
            }}
          >
            Add New Pest
          </DialogTitle>
          <DialogContent sx={{ pt: 4, pb: 3, px: 4 }}>
            <FormControl fullWidth sx={{ mb: 3, mt: 1 }}>
              <TextField
                label="Name"
                value={addName}
                onChange={(e) => setAddName(e.target.value)}
                required
                variant="outlined"
                placeholder="Enter pest name"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover fieldset': {
                      borderColor: '#9e9e9e',
                    },
                    '&.Mui-focused fieldset': {
                      borderWidth: '2px',
                    },
                  },
                }}
              />
            </FormControl>
            <FormControl fullWidth sx={{ mb: 3 }}>
              <TextField
                label="Sub Title"
                value={addSubTitle}
                onChange={(e) => setAddSubTitle(e.target.value)}
                required
                variant="outlined"
                placeholder="Enter sub title"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover fieldset': {
                      borderColor: '#9e9e9e',
                    },
                    '&.Mui-focused fieldset': {
                      borderWidth: '2px',
                    },
                  },
                }}
              />
            </FormControl>
            <FormControl fullWidth sx={{ mb: 3 }}>
              <TextField
                label="Description"
                multiline
                rows={4}
                value={addDescription}
                onChange={(e) => setAddDescription(e.target.value)}
                required
                variant="outlined"
                placeholder="Enter detailed description"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover fieldset': {
                      borderColor: '#9e9e9e',
                    },
                    '&.Mui-focused fieldset': {
                      borderWidth: '2px',
                    },
                  },
                }}
              />
            </FormControl>
            <FormControl 
              fullWidth 
              sx={{ 
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  backgroundColor: '#fafafa',
                  minHeight: '56px',
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#9e9e9e',
                    borderWidth: '2px',
                  },
                  '&.Mui-focused': {
                    backgroundColor: '#fff',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderWidth: '2px',
                    borderColor: '#9e9e9e',
                  },
                },
                '& .MuiSelect-select': {
                  minHeight: '56px !important',
                  display: 'flex',
                  alignItems: 'center',
                  paddingTop: '16px',
                  paddingBottom: '16px',
                },
                '& .MuiInputLabel-root': {
                  fontWeight: 500,
                  '&.Mui-focused': {
                    color: '#9e9e9e',
                    fontWeight: 600,
                  },
                },
              }}
            >
              <InputLabel>Affected Crops</InputLabel>
              <Select
                multiple
                value={addAffectedCrops}
                onChange={(e) => setAddAffectedCrops(e.target.value)}
                label="Affected Crops"
                renderValue={(selected) => {
                  if (selected.length === 0) {
                    return <em style={{ color: '#999' }}>Select crops</em>;
                  }
                  const selectedCrops = crops.filter(crop => selected.includes(crop._id)).map(crop => crop.title);
                  return (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selectedCrops.map((value) => (
                        <Chip 
                          key={value} 
                          label={value} 
                          size="small"
                          sx={{
                            backgroundColor: '#e3f2fd',
                            color: '#1976d2',
                            fontWeight: 500,
                            '& .MuiChip-label': {
                              px: 1.5,
                            },
                          }}
                        />
                      ))}
                    </Box>
                  );
                }}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      maxHeight: 300,
                      borderRadius: 2,
                      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                      mt: 1,
                    },
                  },
                }}
              >
                {crops.map((crop) => (
                  <MenuItem 
                    key={crop._id} 
                    value={crop._id}
                    sx={{
                      py: 1.5,
                      px: 2,
                      '&:hover': {
                        backgroundColor: '#e3f2fd',
                      },
                      '&.Mui-selected': {
                        backgroundColor: '#bbdefb',
                        fontWeight: 600,
                        '&:hover': {
                          backgroundColor: '#90caf9',
                        },
                      },
                    }}
                  >
                    {crop.title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Box sx={{ mb: 2 }}>
              <MDTypography variant="caption" color="text" display="block" mb={1}>
                Affected Crops
              </MDTypography>
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="add-image-upload"
                type="file"
                onChange={(e) => setAddImage(e.target.files[0])}
              />
              <label htmlFor="add-image-upload">
                <Button
                  variant="outlined"
                  component="span"
                  fullWidth
                  sx={{
                    borderRadius: 2,
                    py: 1.5,
                    textTransform: 'none',
                    fontSize: '1rem',
                    borderWidth: '2px',
                    borderColor: '#9e9e9e',
                    color: '#fff',
                    backgroundColor: '#fafafa',
                    justifyContent: 'flex-start',
                    '&:hover': {
                      borderWidth: '2px',
                      borderColor: '#9e9e9e',
                      backgroundColor: '#e0e0e0',
                    },
                  }}
                >
                  {addImage ? addImage.name : 'Upload the image'}
                </Button>
              </label>
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2.5, borderTop: '1px solid #e0e0e0', gap: 1.5, backgroundColor: '#fafafa' }}>
            <Button 
              onClick={() => setAddDialogOpen(false)} 
              variant="outlined"
              sx={{
                borderRadius: 2,
                px: 4,
                py: 1.2,
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: 600,
                borderWidth: '2px',
                borderColor: '#9e9e9e',
                color: '#000',
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreatePest} 
              variant="contained"
              sx={{
                borderRadius: 2,
                px: 4,
                py: 1.2,
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: 600,
                backgroundColor: '#1976d2',
                color: '#fff',
                boxShadow: '0 4px 14px rgba(25, 118, 210, 0.4)',
                '&:hover': {
                  backgroundColor: '#1565c0',
                  boxShadow: '0 6px 20px rgba(25, 118, 210, 0.5)',
                  transform: 'translateY(-2px)',
                },
                transition: 'all 0.2s ease-in-out',
              }}
            >
              Add Pest
            </Button>
          </DialogActions>
        </Dialog>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
};

export default PestManagement;

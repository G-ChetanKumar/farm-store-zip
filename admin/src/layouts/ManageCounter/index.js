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

const CounterManagement = () => {
  const navigate = useNavigate();
  const [counters, setCounters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCounter, setSelectedCounter] = useState(null);
  const [editingCounter, setEditingCounter] = useState(null);
  const [editPinCode, setEditPinCode] = useState('');
    const [editCounterName, setEditCounterName] = useState('');
    const [editAgentName, setEditAgentName] = useState('');
    const [editAddress, setEditAddress] = useState('');
    const [editLandMark, setEditLandMark] = useState('');
    const [editLocationDirection, setEditLocationDirection] = useState('');
    const [editAgentNumber, setEditAgentNumber] = useState('');
//   const [editImage, setEditImage] = useState(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [counterToDelete, setCounterToDelete] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("az");
  const [selectedCounterFilter, setSelectedCounterFilter] = useState("all");
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  // Temporary filter states
  const [tempCounterFilter, setTempCounterFilter] = useState("all");
  const [tempSortOrder, setTempSortOrder] = useState("az");

  useEffect(() => {
    const fetchCounters = async () => {
      try {
        const response = await apiClient.get("/api/counter/get-counters");
        setCounters(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch counters');
        setLoading(false);
      }
    };
    fetchCounters();
  }, []);

  const handleAddCounter = () => {
    navigate('/add-counter');
  };

  const handleViewDetails = (counter) => {
    setSelectedCounter(counter);
  };

  const handleCloseDetails = () => {
    setSelectedCounter(null);
  };

  const handleDeleteClick = (counterId) => {
    setCounterToDelete(counterId);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteCounter = async () => {
    try {
      await apiClient.delete(`/api/counter/delete-counter/${counterToDelete}`);
      setCounters(counters.filter(counter => counter._id !== counterToDelete));
      setDeleteDialogOpen(false);
      setSnackbarMessage('Counter deleted successfully!');
      setSnackbarSeverity('success');
    } catch (err) {
      setSnackbarMessage('Failed to delete Counter');
      setSnackbarSeverity('error');
    } finally {
      setSnackbarOpen(true);
    }
  };

  const handleEditCounter = async (counter) => {
    try {
      const response = await apiClient.get(`/api/counter/get-id-counter/${counter._id}`);
      const fullCounterDetails = response.data;

      setEditingCounter(fullCounterDetails);
      setEditPinCode(fullCounterDetails.pinCode);
      setEditCounterName(fullCounterDetails.counterName);
      setEditAgentName(fullCounterDetails.agentName);
      setEditAddress(fullCounterDetails.address);
        setEditLandMark(fullCounterDetails.landMark);
        setEditLocationDirection(fullCounterDetails.location_direction);
        setEditAgentNumber(fullCounterDetails.agentNumber);
    
    } catch (err) {
      setSnackbarMessage('Failed to fetch Counter details');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleUpdateCounter = async () => {
    try {
      // Send as JSON instead of FormData since there's no file upload
      const updateData = {
        pinCode: editPinCode,
        counterName: editCounterName,
        agentName: editAgentName,
        address: editAddress,
        landMark: editLandMark,
        location_direction: editLocationDirection,
        agentNumber: editAgentNumber,
      };

      console.log('Sending update data:', updateData);

      const response = await apiClient.put(
        `/api/counter/update-counter/${editingCounter._id}`, 
        updateData
      );

      // Update local state with response data
      if (response.data) {
        setCounters(counters.map(counter => 
          counter._id === editingCounter._id ? response.data : counter
        ));
      } else {
        // Fallback to manual update if no response data
        setCounters(counters.map(counter => (counter._id === editingCounter._id ? { 
          ...counter, 
          pinCode: editPinCode,
          counterName: editCounterName,
          agentName: editAgentName,
          address: editAddress,
          landMark: editLandMark,
          location_direction: editLocationDirection,
          agentNumber: editAgentNumber,
          ...(editImage && { imageUrl: URL.createObjectURL(editImage) }) 
        } : counter)));
      }
      
      setEditingCounter(null);
      setSnackbarMessage('Counter updated successfully!');
      setSnackbarSeverity('success');
    } catch (err) {
      console.error('Update error:', err);
      setSnackbarMessage(`Failed to update Counter: ${err.response?.data?.message || err.message}`);
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
    setTempCounterFilter("all");
  };

  const handleApplyFilters = () => {
    setSelectedCounterFilter(tempCounterFilter);
    setSortOrder(tempSortOrder);
    setFilterDrawerOpen(false);
  };

  const handleOpenFilterDrawer = () => {
    setTempCounterFilter(selectedCounterFilter);
    setTempSortOrder(sortOrder);
    setFilterDrawerOpen(true);
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (selectedCounterFilter !== "all") count++;
    return count;
  };

  // Filter counters by search term and counter filter
  const filteredCounters = counters.filter((counter) => {
    const matchesSearch = counter.pinCode?.toLowerCase().includes(searchTerm.toLowerCase())
      || counter.counterName?.toLowerCase().includes(searchTerm.toLowerCase())
      || counter.agentName?.toLowerCase().includes(searchTerm.toLowerCase())
      || counter.address?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCounterFilter = selectedCounterFilter === "all" || counter._id === selectedCounterFilter;
    return matchesSearch && matchesCounterFilter;
  });

  // Sort filtered counters
  const sortedCounters = [...filteredCounters].sort((a, b) => {
    if (sortOrder === "az") {
      return a.counterName.localeCompare(b.counterName);
    } else {
      return b.counterName.localeCompare(a.counterName);
    }
  });

  if (loading)
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <MDTypography>Loading counters...</MDTypography>
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
            <Tooltip title="Add New Counter">
              <IconButton
                onClick={handleAddCounter}
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
                {tempCounterFilter !== "all" && (
                  <Chip
                    label={counters.find(c => c._id === tempCounterFilter)?.counterName || ''}
                    onDelete={handleClearFilters}
                    color="primary"
                    sx={{ mb: 1 }}
                  />
                )}
                <Divider sx={{ mt: 2 }} />
              </Box>
            )}

            {/* Counter Filter */}
            <Box mb={4}>
              <MDTypography variant="body2" fontWeight="bold" sx={{ color: '#000' }} mb={2}>
                Filter by Location/Counter
              </MDTypography>
              <FormControl fullWidth>
                <Select
                  value={tempCounterFilter}
                  onChange={(e) => setTempCounterFilter(e.target.value)}
                  displayEmpty
                  sx={{ 
                    height: 56,
                    borderRadius: 2,
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: tempCounterFilter !== "all" ? 'grey.600' : 'divider',
                      borderWidth: 2,
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'grey.600',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'grey.700',
                      borderWidth: 2,
                    },
                    backgroundColor: tempCounterFilter !== "all" ? 'grey.100' : 'background.paper',
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
                      <span style={{ fontWeight: 500 }}>All Locations</span>
                    </Box>
                  </MenuItem>
                  {counters.map((counter) => (
                    <MenuItem 
                      key={counter._id} 
                      value={counter._id}
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
                      <Box display="flex" flexDirection="column">
                        <span style={{ fontWeight: 500 }}>{counter.counterName}</span>
                        <span style={{ fontSize: '0.75rem', color: '#666' }}>{counter.pinCode} - {counter.agentName}</span>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <MDTypography variant="caption" color="text" display="block" mt={1}>
                Filter locations by counter name or agent
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
                Sort locations alphabetically
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
                <TableCell><strong>PinCode</strong></TableCell>
                <TableCell><strong>CounterName</strong></TableCell>
                <TableCell><strong>AgentName</strong></TableCell>
                <TableCell><strong>Address</strong></TableCell>
                <TableCell><strong>LandMark</strong></TableCell>
                {/* <TableCell><strong>Location Direction</strong></TableCell> */}
                <TableCell><strong>Mobile No</strong></TableCell>
                <TableCell><strong>Actions</strong></TableCell>
              </TableRow>
              {sortedCounters.map((counter, index) => (
                <TableRow key={counter._id}>
                  <TableCell>{index + 1}</TableCell>
                    <TableCell>{counter.pinCode}</TableCell>
                    <TableCell>{counter.counterName}</TableCell>
                    <TableCell>{counter.agentName}</TableCell>
                    <TableCell>{counter.address}</TableCell>
                    <TableCell>{counter.landMark}</TableCell>
                    {/* <TableCell>{counter.location_direction}</TableCell> */}
                    <TableCell>{counter.agentNumber}</TableCell>  
                 
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <Tooltip title="View Details">
                        <IconButton 
                          color="info" 
                          size="small"
                          onClick={() => handleViewDetails(counter)}
                        >
                          <Visibility fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit">
                        <IconButton 
                          color="primary" 
                          size="small"
                          onClick={() => handleEditCounter(counter)}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton 
                          color="error" 
                          size="small" 
                          onClick={() => handleDeleteClick(counter._id)}
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
            Are you sure you want to delete this counter?
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)} color="primary">No</Button>
            <Button onClick={confirmDeleteCounter} color="error">Yes</Button>
          </DialogActions>
        </Dialog>

        <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleCloseSnackbar}>
          <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
            {snackbarMessage}
          </Alert>
        </Snackbar>

        {/* Counter Details Dialog */}
        {selectedCounter && (
          <Dialog open={!!selectedCounter} onClose={handleCloseDetails}>
            <DialogTitle>Counter Details</DialogTitle>
            <DialogContent>
              <MDTypography><strong>PinCode</strong> {selectedCounter.pinCode}</MDTypography>
                <MDTypography><strong>CounterName</strong> {selectedCounter.counterName}</MDTypography>
                <MDTypography><strong>AgentName</strong> {selectedCounter.agentName}</MDTypography>
                <MDTypography><strong>Address</strong> {selectedCounter.address}</MDTypography>
                <MDTypography><strong>LandMark</strong> {selectedCounter.landMark}</MDTypography>
                <MDTypography><strong>Location Direction</strong> {selectedCounter.location_direction}</MDTypography>
                <MDTypography><strong>Mobile No</strong> {selectedCounter.agentNumber}</MDTypography>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDetails} color="primary">Close</Button>
            </DialogActions>
          </Dialog>
        )}

        {/* Edit Counter Dialog */}
        {editingCounter && (
          <Dialog open={!!editingCounter} onClose={() => setEditingCounter(null)}>
            <DialogTitle>Edit Counter</DialogTitle>
            <DialogContent>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <TextField
                  label="Pincode"
                  value={editPinCode}
                  onChange={(e) => setEditPinCode(e.target.value)}
                />
              </FormControl>
                <FormControl fullWidth sx={{ mb: 2 }}>
                <TextField
                  label="Counter Name"
                  value={editCounterName}
                    onChange={(e) => setEditCounterName(e.target.value)}
                />
              </FormControl>
                <FormControl fullWidth sx={{ mb: 2 }}>
                <TextField
                    label="Agent Name"
                    value={editAgentName}
                    onChange={(e) => setEditAgentName(e.target.value)}
                />
              </FormControl>
                <FormControl fullWidth sx={{ mb: 2 }}>
                <TextField
                    label="Address"
                    value={editAddress}
                    onChange={(e) => setEditAddress(e.target.value)}
                />
              </FormControl>
                <FormControl fullWidth sx={{ mb: 2 }}>
                <TextField
                    label="LandMark"
                    value={editLandMark}
                    onChange={(e) => setEditLandMark(e.target.value)}
                />
              </FormControl>
                <FormControl fullWidth sx={{ mb: 2 }}>
                <TextField
                    label="Location Direction"
                    value={editLocationDirection}
                    onChange={(e) => setEditLocationDirection(e.target.value)}
                />
              </FormControl>
                <FormControl fullWidth sx={{ mb: 2 }}>
                <TextField
                    label="Agent Number"
                    value={editAgentNumber}
                    onChange={(e) => setEditAgentNumber(e.target.value)}
                />
              </FormControl>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setEditingCounter(null)} color="primary">
                Cancel
              </Button>
              <Button onClick={handleUpdateCounter} color="primary" style={{ color: "#fff" }} variant="contained">
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

export default CounterManagement;
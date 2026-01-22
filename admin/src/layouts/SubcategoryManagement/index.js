import { Category as CategoryIcon, Clear, Delete, Edit, FilterList, SwapVert, Visibility } from "@mui/icons-material";
import {
  Alert,
  Autocomplete,
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

const SubcategoryManagement = () => {
  const navigate = useNavigate();
  const [subcategories, setSubcategories] = useState([]);
  const [superCategories, setSuperCategories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [editingSubcategory, setEditingSubcategory] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  // const [editSubTitle, setEditSubTitle] = useState("");
  // const [editDescription, setEditDescription] = useState("");
  const [editSuperCategory, setEditSuperCategory] = useState("");
  const [editCategoryId, setEditCategoryId] = useState("");
  const [editImage, setEditImage] = useState(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [subcategoryToDelete, setSubcategoryToDelete] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("az");
  // Set default selectedSuperCategory to "e-store" supercategory _id after fetching
  const [selectedSuperCategory, setSelectedSuperCategory] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSubcategoryFilter, setSelectedSubcategoryFilter] = useState("all");
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  // Temporary filter states (used in the drawer before applying)
  const [tempSuperCategory, setTempSuperCategory] = useState("");
  const [tempCategoryFilter, setTempCategoryFilter] = useState("all");
  const [tempSubcategoryFilter, setTempSubcategoryFilter] = useState("all");
  const [tempSortOrder, setTempSortOrder] = useState("az");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const subcategoriesResponse = await apiClient.get("/api/subcategory/get-sub-category"
        );
        setSubcategories(subcategoriesResponse.data);

        const supercategoriesResponse = await apiClient.get("/api/super-category/get-super-category"
        );
        setSuperCategories(supercategoriesResponse.data);

        const categoriesResponse = await apiClient.get("/api/category/get-category");
        setCategories(categoriesResponse.data);

        // Set default to "e-store" supercategory _id if present
        const estore = supercategoriesResponse.data.find(
          (sc) => sc.title && sc.title.toLowerCase() === "e-store"
        );
        if (estore) {
          setSelectedSuperCategory(estore._id);
          setTempSuperCategory(estore._id);
        } else if (supercategoriesResponse.data.length > 0) {
          setSelectedSuperCategory(supercategoriesResponse.data[0]._id);
          setTempSuperCategory(supercategoriesResponse.data[0]._id);
        }

        setLoading(false);
      } catch (err) {
        setError("Failed to fetch subcategories or categories");
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAddSubcategory = () => navigate("/add-subcategory");

  const handleViewDetails = (subcategory) => setSelectedSubcategory(subcategory);

  const handleCloseDetails = () => setSelectedSubcategory(null);

  const handleDeleteClick = (subcategoryId) => {
    setSubcategoryToDelete(subcategoryId);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteSubcategory = async () => {
    try {
      await apiClient.delete(`/api/subcategory/delete-sub-category/${subcategoryToDelete}`);
      setSubcategories(subcategories.filter((subcat) => subcat._id !== subcategoryToDelete));
      setDeleteDialogOpen(false);
      setSnackbarMessage("Subcategory deleted successfully!");
      setSnackbarSeverity("success");
    } catch (err) {
      setSnackbarMessage("Failed to delete subcategory");
      setSnackbarSeverity("error");
    } finally {
      setSnackbarOpen(true);
    }
  };

  const handleEditSubcategory = async (subcategory) => {
    try {
      const response = await apiClient.get(`/api/subcategory/get-id-sub-category/${subcategory._id}`
      );
      const fullSubcategoryDetails = response.data;

      setEditingSubcategory(fullSubcategoryDetails);
      setEditTitle(fullSubcategoryDetails.title);

      setEditSuperCategory(fullSubcategoryDetails.super_cat_id);
      setEditCategoryId(fullSubcategoryDetails.category_id);
      setEditImage(null);
    } catch (err) {
      setSnackbarMessage("Failed to fetch subcategory details");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const handleUpdateSubcategory = async () => {
    try {
      const formData = new FormData();
      formData.append("title", editTitle);

      formData.append("super_cat_id", editSuperCategory);
      formData.append("category_id", editCategoryId);
      if (editImage) formData.append("file", editImage);

      await apiClient.put(`/api/subcategory/update-sub-category/${editingSubcategory._id}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      setSubcategories(
        subcategories.map((subcat) =>
          subcat._id === editingSubcategory._id
            ? {
              ...subcat,
              title: editTitle,

              super_cat_id: editSuperCategory,
              category_id: editCategoryId,
              ...(editImage && { imageUrl: URL.createObjectURL(editImage) }),
            }
            : subcat
        )
      );
      setEditingSubcategory(null);
      setSnackbarMessage("Subcategory updated successfully!");
      setSnackbarSeverity("success");
    } catch (err) {
      setSnackbarMessage("Failed to update subcategory");
      setSnackbarSeverity("error");
    } finally {
      setSnackbarOpen(true);
    }
  };

  const handleFileChange = (event) => setEditImage(event.target.files[0]);

  const handleCloseSnackbar = () => setSnackbarOpen(false);

  const handleClearFilters = () => {
    setTempCategoryFilter("all");
    setTempSubcategoryFilter("all");
  };

  const handleApplyFilters = () => {
    setSelectedSuperCategory(tempSuperCategory);
    setSelectedCategory(tempCategoryFilter);
    setSelectedSubcategoryFilter(tempSubcategoryFilter);
    setSortOrder(tempSortOrder);
    setFilterDrawerOpen(false);
  };

  const handleOpenFilterDrawer = () => {
    // Sync temp values with current values when opening drawer
    setTempSuperCategory(selectedSuperCategory);
    setTempCategoryFilter(selectedCategory);
    setTempSubcategoryFilter(selectedSubcategoryFilter);
    setTempSortOrder(sortOrder);
    setFilterDrawerOpen(true);
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (selectedCategory !== "all") count++;
    if (selectedSubcategoryFilter !== "all") count++;
    return count;
  };

  // Filter subcategories by search term, supercategory, and category
  const filteredSubcategories = subcategories.filter((subcategory) => {
    const term = searchTerm.trim().toLowerCase();
    const matchesSearch =
      !term || (subcategory.title && subcategory.title.toLowerCase().includes(term));
    const matchesSuperCat =
      !selectedSuperCategory || subcategory.super_cat_id === selectedSuperCategory;
    const matchesCategory =
      selectedCategory === "all" || subcategory.category_id === selectedCategory;
    const matchesSubcategoryFilter =
      selectedSubcategoryFilter === "all" || subcategory._id === selectedSubcategoryFilter;
    return matchesSearch && matchesSuperCat && matchesCategory && matchesSubcategoryFilter;
  });

  // Sort filtered subcategories
  const sortedSubcategories = [...filteredSubcategories].sort((a, b) => {
    if (sortOrder === "az") {
      return a.title.localeCompare(b.title);
    } else {
      return b.title.localeCompare(a.title);
    }
  });

  if (loading)
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <MDTypography>Loading subcategories...</MDTypography>
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
            <Tooltip title="Add New Subcategory">
              <IconButton
                onClick={handleAddSubcategory}
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
                <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                  {tempCategoryFilter !== "all" && (
                    <Chip
                      label={categories.find(c => c._id === tempCategoryFilter)?.title || ''}
                      onDelete={() => setTempCategoryFilter("all")}
                      color="primary"
                    />
                  )}
                  {tempSubcategoryFilter !== "all" && (
                    <Chip
                      label={subcategories.find(s => s._id === tempSubcategoryFilter)?.title || ''}
                      onDelete={() => setTempSubcategoryFilter("all")}
                      color="primary"
                    />
                  )}
                </Stack>
                <Divider sx={{ mt: 2 }} />
              </Box>
            )}

            {/* Super Category Filter */}
            <Box mb={4}>
              <MDTypography variant="body2" fontWeight="bold" sx={{ color: '#000' }} mb={2}>
                Super Category
              </MDTypography>
              <FormControl fullWidth>
                <Select
                  value={tempSuperCategory}
                  onChange={(e) => {
                    setTempSuperCategory(e.target.value);
                    setTempCategoryFilter("all");
                    setTempSubcategoryFilter("all");
                  }}
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
                  renderValue={(selected) => {
                    const sc = superCategories.find((sc) => sc._id === selected);
                    return sc ? (
                      <Box display="flex" alignItems="center" gap={1.5}>
                        <img
                          src={sc.imageUrl}
                          alt={sc.title}
                          style={{
                            width: 32,
                            height: 32,
                            objectFit: "cover",
                            borderRadius: 6,
                          }}
                        />
                        <span style={{ fontWeight: 500 }}>{sc.title}</span>
                      </Box>
                    ) : "Select Super Category";
                  }}
                >
                  {superCategories.map((sc) => (
                    <MenuItem 
                      key={sc._id} 
                      value={sc._id}
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
                        <img
                          src={sc.imageUrl}
                          alt={sc.title}
                          style={{
                            width: 32,
                            height: 32,
                            objectFit: "cover",
                            borderRadius: 6,
                          }}
                        />
                        {sc.title}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <MDTypography variant="caption" color="text" display="block" mt={1}>
                Select super category to filter subcategories
              </MDTypography>
            </Box>

            {/* Category Filter */}
            <Box mb={4}>
              <MDTypography variant="body2" fontWeight="bold" sx={{ color: '#000' }} mb={2}>
                Filter by Category
              </MDTypography>
              <FormControl fullWidth>
                <Select
                  value={tempCategoryFilter}
                  onChange={(e) => {
                    setTempCategoryFilter(e.target.value);
                    setTempSubcategoryFilter("all");
                  }}
                  displayEmpty
                  sx={{ 
                    height: 56,
                    borderRadius: 2,
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: tempCategoryFilter !== "all" ? 'grey.600' : 'divider',
                      borderWidth: 2,
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
                      <span style={{ fontWeight: 500 }}>All Categories</span>
                    </Box>
                  </MenuItem>
                  {categories
                    .filter(cat => !tempSuperCategory || cat.super_cat_id === tempSuperCategory)
                    .map((cat) => (
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
                Filter by category to narrow down subcategories
              </MDTypography>
            </Box>

            {/* Subcategory Filter */}
            <Box mb={4}>
              <MDTypography variant="body2" fontWeight="bold" sx={{ color: '#000' }} mb={2}>
                Filter by Subcategory
              </MDTypography>
              <FormControl fullWidth>
                <Select
                  value={tempSubcategoryFilter}
                  onChange={(e) => setTempSubcategoryFilter(e.target.value)}
                  displayEmpty
                  sx={{ 
                    height: 56,
                    borderRadius: 2,
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: tempSubcategoryFilter !== "all" ? 'grey.600' : 'divider',
                      borderWidth: 2,
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'grey.600',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'grey.700',
                      borderWidth: 2,
                    },
                    backgroundColor: tempSubcategoryFilter !== "all" ? 'grey.100' : 'background.paper',
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
                      <span style={{ fontWeight: 500 }}>All Subcategories</span>
                    </Box>
                  </MenuItem>
                  {subcategories
                    .filter(subcat => {
                      const matchesSuperCat = !tempSuperCategory || subcat.super_cat_id === tempSuperCategory;
                      const matchesCat = tempCategoryFilter === "all" || subcat.category_id === tempCategoryFilter;
                      return matchesSuperCat && matchesCat;
                    })
                    .map((subcat) => (
                      <MenuItem 
                        key={subcat._id} 
                        value={subcat._id}
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
                          {subcat.imageUrl && (
                            <img
                              src={subcat.imageUrl}
                              alt={subcat.title}
                              style={{
                                width: 32,
                                height: 32,
                                objectFit: "cover",
                                borderRadius: 6,
                              }}
                            />
                          )}
                          <span>{subcat.title}</span>
                        </Box>
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
              <MDTypography variant="caption" color="text" display="block" mt={1}>
                Filter to view specific subcategory
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
                Sort subcategories alphabetically
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
                  textTransform: 'none',
                  fontSize: '1rem',
                  fontWeight: 600,
                  boxShadow: 3,
                  color: '#fff',
                  '&:hover': {
                    boxShadow: 6,
                  },
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
                <TableCell>
                  <strong>S.No</strong>
                </TableCell>
                <TableCell>
                  <strong>Image</strong>
                </TableCell>
                <TableCell>
                  <strong>Title</strong>
                </TableCell>
                <TableCell>
                  <strong>Category</strong>
                </TableCell>
                <TableCell>
                  <strong>Actions</strong>
                </TableCell>
              </TableRow>
              {sortedSubcategories.map((subcategory, index) => (
                <TableRow key={subcategory._id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>
                    <img
                      src={subcategory.imageUrl}
                      alt={subcategory.title}
                      style={{
                        width: "50px",
                        height: "50px",
                        objectFit: "cover",
                        borderRadius: "4px",
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Box>
                      <MDTypography variant="body2" fontWeight="medium">
                        {subcategory.title}
                      </MDTypography>

                    </Box>
                  </TableCell>
                  <TableCell>
                    {categories.find((cat) => cat._id === subcategory.category_id)?.title || "N/A"}
                  </TableCell>

                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <Tooltip title="View Details">
                        <IconButton
                          color="info"
                          size="small"
                          onClick={() => handleViewDetails(subcategory)}
                        >
                          <Visibility fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit">
                        <IconButton
                          color="primary"
                          size="small"
                          onClick={() => handleEditSubcategory(subcategory)}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          color="error"
                          size="small"
                          onClick={() => handleDeleteClick(subcategory._id)}
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
          <DialogContent>Are you sure you want to delete this subcategory?</DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)} color="primary">
              No
            </Button>
            <Button onClick={confirmDeleteSubcategory} color="error">
              Yes
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleCloseSnackbar}>
          <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: "100%" }}>
            {snackbarMessage}
          </Alert>
        </Snackbar>

        {/* Subcategory Details Dialog */}
        {selectedSubcategory && (
          <Dialog open={!!selectedSubcategory} onClose={handleCloseDetails}>
            <DialogTitle>Subcategory Details</DialogTitle>
            <DialogContent>
              <MDTypography>
                <strong>Title:</strong> {selectedSubcategory.title}
              </MDTypography>
              {/* <MDTypography>
                <strong>Sub Title:</strong> {selectedSubcategory.sub_title}
              </MDTypography> */}
              <MDTypography>
                <strong>SuperCategory:</strong>{" "}
                {superCategories.find(
                  (superCat) => superCat._id === selectedSubcategory.super_cat_id
                )?.title || "N/A"}
              </MDTypography>
              <MDTypography>
                <strong>Category:</strong>{" "}
                {categories.find((cat) => cat._id === selectedSubcategory.category_id)?.title ||
                  "N/A"}
              </MDTypography>
              {/* <MDTypography>
                <strong>Description:</strong> {selectedSubcategory.description}
              </MDTypography> */}
              <img
                src={selectedSubcategory.imageUrl}
                alt={selectedSubcategory.title}
                style={{ maxWidth: "100%", marginTop: "10px", borderRadius: "8px" }}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDetails} color="primary">
                Close
              </Button>
            </DialogActions>
          </Dialog>
        )}

        {/* Edit Subcategory Dialog */}
        {editingSubcategory && (
          <Dialog open={!!editingSubcategory} onClose={() => setEditingSubcategory(null)}>
            <DialogTitle>Edit Subcategory</DialogTitle>
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
              </FormControl> */}
              <FormControl fullWidth sx={{ mb: 2 }}>
                <Select
                  value={editSuperCategory}
                  onChange={(e) => setEditSuperCategory(e.target.value)}
                >
                  {superCategories.map((sc) => (
                    <MenuItem key={sc._id} value={sc._id}>
                      {sc.title}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <Autocomplete
                  options={categories}
                  getOptionLabel={(option) => option.title || ""}
                  value={categories.find((category) => category._id === editCategoryId) || null}
                  onChange={(event, newValue) => setEditCategoryId(newValue ? newValue._id : "")}
                  renderInput={(params) => (
                    <TextField {...params} label="Category" variant="outlined" />
                  )}
                  isOptionEqualToValue={(option, value) => option._id === value._id}
                />
              </FormControl>
              {/* <FormControl fullWidth sx={{ mb: 2 }}>
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
                  inputProps={{ accept: "image/*" }}
                  onChange={handleFileChange}
                />
              </FormControl>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setEditingSubcategory(null)} color="primary">
                Cancel
              </Button>
              <Button
                onClick={handleUpdateSubcategory}
                color="primary"
                style={{ color: "#fff" }}
                variant="contained"
              >
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

export default SubcategoryManagement;

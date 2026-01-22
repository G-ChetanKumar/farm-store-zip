import { Clear, FilterList, SwapVert, Visibility, Edit, Delete, Category as CategoryIcon } from "@mui/icons-material";
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

const ProductManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const [superCategories, setSuperCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [crops, setCrops] = useState([]);
  const [pests, setPests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for selected product and editing
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editSubTitle, setEditSubTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editChemicalContent, setEditChemicalContent] = useState("");
  const [editFeaturesBenefits, setEditFeaturesBenefits] = useState("");
  const [editModesOfUse, setEditModesOfUse] = useState("");
  const [editMethodOfApplication, setEditMethodOfApplication] = useState("");
  const [editRecommendations, setEditRecommendations] = useState("");
  const [editSuperCategory, setEditSuperCategory] = useState("");
  const [editCategoryId, setEditCategoryId] = useState("");
  const [editSubCategoryId, setEditSubCategoryId] = useState("");
  const [editBrandId, setEditBrandId] = useState("");
  const [editCropId, setEditCropId] = useState("");
  const [editPestId, setEditPestId] = useState("");
  const [editMfgBy, setEditMfgBy] = useState("");
  const [editAgentCommission, setEditAgentCommission] = useState("");
  const [editPackageQty, setEditPackageQty] = useState([]);
  const [editRetailerPackageQty, setEditRetailerPackageQty] = useState([]);

  const [editImage, setEditImage] = useState(null);
  // Dialog and snackbar states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [sortOrder, setSortOrder] = useState("az");
  const [selectedSuperCategory, setSelectedSuperCategory] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSubcategory, setSelectedSubcategory] = useState("all");
  const [selectedBrand, setSelectedBrand] = useState("all");
  const [selectedCrop, setSelectedCrop] = useState("all");
  const [selectedPest, setSelectedPest] = useState("all");
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  // Temporary filter states
  const [tempSuperCategory, setTempSuperCategory] = useState("");
  const [tempCategory, setTempCategory] = useState("all");
  const [tempSubcategory, setTempSubcategory] = useState("all");
  const [tempBrand, setTempBrand] = useState("all");
  const [tempCrop, setTempCrop] = useState("all");
  const [tempPest, setTempPest] = useState("all");
  const [tempSortOrder, setTempSortOrder] = useState("az");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          productsResponse,
          supercategoriesResponse,
          categoriesResponse,
          subcategoriesResponse,
          brandsResponse,
          cropsResponse,
          pestsResponse,
        ] = await Promise.all([
          apiClient.get("/api/product/get-product"),
          apiClient.get("/api/super-category/get-super-category"),
          apiClient.get("/api/category/get-category"),
          apiClient.get("/api/subcategory/get-sub-category"),
          apiClient.get("/api/brand/get-brand"),
          apiClient.get("/api/crop/get-crops"),
          apiClient.get("/api/pest/get-pests"),
        ]);

        setProducts(productsResponse.data);
        setSuperCategories(supercategoriesResponse.data);
        setCategories(categoriesResponse.data);
        setSubcategories(subcategoriesResponse.data);
        setBrands(brandsResponse.data);
        setCrops(cropsResponse.data);
        setPests(pestsResponse.data);

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
        setError("Failed to fetch data");
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAddProduct = () => navigate("/add-product");

  const handleViewDetails = (product) => setSelectedProduct(product);

  const handleCloseDetails = () => setSelectedProduct(null);

  const handleDeleteClick = (productId) => {
    setProductToDelete(productId);
    setDeleteDialogOpen(true);
  };

  const getFirstPackageData = (product) => {
    if (product.package_qty && product.package_qty.length > 0) {
      return product.package_qty[0];
    }
    return { mrp_price: "N/A", sell_price: "N/A", mfg_date: "N/A", exp_date: "N/A" };
  };

  const confirmDeleteProduct = async () => {
    try {
      await apiClient.delete(`/api/product/delete-product/${productToDelete}`);
      setProducts(products.filter((prod) => prod._id !== productToDelete));
      setDeleteDialogOpen(false);
      setSnackbarMessage("Product deleted successfully!");
      setSnackbarSeverity("success");
    } catch (err) {
      setSnackbarMessage("Failed to delete product");
      setSnackbarSeverity("error");
    } finally {
      setSnackbarOpen(true);
    }
  };

  const handleEditProduct = async (product) => {
    try {
      const response = await apiClient.get(`/api/product/get-id-product/${product._id}`);
      const fullProductDetails = response.data;

      setEditingProduct(fullProductDetails);
      setEditTitle(fullProductDetails.title);
      setEditSubTitle(fullProductDetails.sub_title);
      setEditDescription(fullProductDetails.description);
      setEditSuperCategory(fullProductDetails.super_cat_id);
      setEditCategoryId(fullProductDetails.category_id);
      setEditSubCategoryId(fullProductDetails.sub_category_id);
      setEditBrandId(fullProductDetails.brand_id);
      setEditCropId(fullProductDetails.crop_id);
      setEditPestId(fullProductDetails.pest_id);
      setEditMfgBy(fullProductDetails.mfg_by);
      setEditAgentCommission(fullProductDetails.agent_commission);
      setEditPackageQty(fullProductDetails.package_qty || []);
      setEditRetailerPackageQty(fullProductDetails.retailer_package_qty || []);
      setEditChemicalContent(fullProductDetails.chemical_content || "");
      setEditFeaturesBenefits(fullProductDetails.features_benefits || "");
      setEditModesOfUse(fullProductDetails.modes_of_use || "");
      setEditMethodOfApplication(fullProductDetails.method_of_application || "");
      setEditRecommendations(fullProductDetails.recommendations || "");
      setEditImage(null);
    } catch (err) {
      setSnackbarMessage("Failed to fetch product details");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };
  const handleUpdateProduct = async () => {
    try {
      const formData = new FormData();
      formData.append("title", editTitle);
      formData.append("sub_title", editSubTitle);
      formData.append("description", editDescription);
      formData.append("super_cat_id", editSuperCategory);
      formData.append("category_id", editCategoryId);
      formData.append("sub_category_id", editSubCategoryId);
      formData.append("brand_id", editBrandId);
      formData.append("crop_id", editCropId);
      formData.append("pest_id", editPestId);
      formData.append("mfg_by", editMfgBy);
      formData.append("agent_commission", editAgentCommission);
      formData.append("chemical_content", editChemicalContent);
      formData.append("features_benefits", editFeaturesBenefits);
      formData.append("modes_of_use", editModesOfUse);  
      formData.append("method_of_application", editMethodOfApplication);
      formData.append("recommendations", editRecommendations);
      // Append package_qty with all fields
      editPackageQty.forEach((item, index) => {
        formData.append(`package_qty[${index}][qty]`, item.qty || "");
        formData.append(`package_qty[${index}][pkgName]`, item.pkgName || "");
        formData.append(`package_qty[${index}][mrp_price]`, item.mrp_price || "");
        formData.append(`package_qty[${index}][sell_price]`, item.sell_price || "");
        formData.append(`package_qty[${index}][mfg_date]`, item.mfg_date || "");
        formData.append(`package_qty[${index}][exp_date]`, item.exp_date || "");
      });
      editRetailerPackageQty.forEach((item, index) => {
        formData.append(`retailer_package_qty[${index}][qty]`, item.qty || "");
        formData.append(`retailer_package_qty[${index}][pkgName]`, item.pkgName || "");
        formData.append(`retailer_package_qty[${index}][mrp_price]`, item.mrp_price || "");
        formData.append(`retailer_package_qty[${index}][sell_price]`, item.sell_price || "");
        formData.append(`retailer_package_qty[${index}][mfg_date]`, item.mfg_date || "");
        formData.append(`retailer_package_qty[${index}][exp_date]`, item.exp_date || "");
      });

      if (editImage) formData.append("file", editImage);

      await apiClient.put(`/api/product/update-product/${editingProduct._id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Update the products state
      setProducts(
        products.map((prod) =>
          prod._id === editingProduct._id
            ? {
                ...prod,
                title: editTitle,
                sub_title: editSubTitle,
                description: editDescription,
                super_cat_id: editSuperCategory,
                category_id: editCategoryId,
                sub_category_id: editSubCategoryId,
                brand_id: editBrandId,
                crop_id: editCropId,
                pest_id: editPestId,
                mfg_by: editMfgBy,
                agent_commission: editAgentCommission,
                package_qty: editPackageQty,
                retailer_package_qty: editRetailerPackageQty,
                chemical_content: editChemicalContent,
                features_benefits: editFeaturesBenefits,
                modes_of_use: editModesOfUse,
                method_of_application: editMethodOfApplication,
                recommendations: editRecommendations,
                ...(editImage && { imageUrl: URL.createObjectURL(editImage) }),
              }
            : prod
        )
      );

      setEditingProduct(null);
      setSnackbarMessage("Product updated successfully!");
      setSnackbarSeverity("success");
    } catch (err) {
      console.error("Update error:", err.response ? err.response.data : err);
      setSnackbarMessage("Failed to update product");
      setSnackbarSeverity("error");
    } finally {
      setSnackbarOpen(true);
    }
  };

  const handleFileChange = (event) => setEditImage(event.target.files[0]);

  const handleCloseSnackbar = () => setSnackbarOpen(false);

  const handleClearFilters = () => {
    setTempCategory("all");
    setTempSubcategory("all");
    setTempBrand("all");
    setTempCrop("all");
    setTempPest("all");
  };

  const handleApplyFilters = () => {
    setSelectedSuperCategory(tempSuperCategory);
    setSelectedCategory(tempCategory);
    setSelectedSubcategory(tempSubcategory);
    setSelectedBrand(tempBrand);
    setSelectedCrop(tempCrop);
    setSelectedPest(tempPest);
    setSortOrder(tempSortOrder);
    setFilterDrawerOpen(false);
  };

  const handleOpenFilterDrawer = () => {
    setTempSuperCategory(selectedSuperCategory);
    setTempCategory(selectedCategory);
    setTempSubcategory(selectedSubcategory);
    setTempBrand(selectedBrand);
    setTempCrop(selectedCrop);
    setTempPest(selectedPest);
    setTempSortOrder(sortOrder);
    setFilterDrawerOpen(true);
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (selectedCategory !== "all") count++;
    if (selectedSubcategory !== "all") count++;
    if (selectedBrand !== "all") count++;
    if (selectedCrop !== "all") count++;
    if (selectedPest !== "all") count++;
    return count;
  };

  if (loading)
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <MDTypography>Loading products...</MDTypography>
      </Box>
    );
  if (error) return <MDTypography color="error">{error}</MDTypography>;

  // Filter products by search term and all filter criteria
  const filteredProducts = products.filter((product) => {
    const term = searchTerm.trim().toLowerCase();
    const matchesSearch = !term || (
      (product.title && product.title.toLowerCase().includes(term)) ||
      (product.sub_title && product.sub_title.toLowerCase().includes(term)) ||
      (product.description && product.description.toLowerCase().includes(term))
    );
    
    const matchesSuperCat = !selectedSuperCategory || product.super_cat_id === selectedSuperCategory;
    const matchesCategory = selectedCategory === "all" || product.category_id === selectedCategory;
    const matchesSubcategory = selectedSubcategory === "all" || product.sub_category_id === selectedSubcategory;
    const matchesBrand = selectedBrand === "all" || product.brand_id === selectedBrand;
    const matchesCrop = selectedCrop === "all" || product.crop_id === selectedCrop;
    const matchesPest = selectedPest === "all" || product.pest_id === selectedPest;
    
    return matchesSearch && matchesSuperCat && matchesCategory && matchesSubcategory && matchesBrand && matchesCrop && matchesPest;
  });

  // Sort filtered products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortOrder === "az") {
      return (a.title || "").localeCompare(b.title || "");
    } else {
      return (b.title || "").localeCompare(a.title || "");
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
            <Tooltip title="Add New Product">
              <IconButton
                onClick={handleAddProduct}
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
                  {tempCategory !== "all" && (
                    <Chip
                      label={categories.find(c => c._id === tempCategory)?.title || ''}
                      onDelete={() => setTempCategory("all")}
                      color="primary"
                      size="small"
                    />
                  )}
                  {tempSubcategory !== "all" && (
                    <Chip
                      label={subcategories.find(s => s._id === tempSubcategory)?.title || ''}
                      onDelete={() => setTempSubcategory("all")}
                      color="primary"
                      size="small"
                    />
                  )}
                  {tempBrand !== "all" && (
                    <Chip
                      label={brands.find(b => b._id === tempBrand)?.title || ''}
                      onDelete={() => setTempBrand("all")}
                      color="primary"
                      size="small"
                    />
                  )}
                  {tempCrop !== "all" && (
                    <Chip
                      label={crops.find(c => c._id === tempCrop)?.title || ''}
                      onDelete={() => setTempCrop("all")}
                      color="primary"
                      size="small"
                    />
                  )}
                  {tempPest !== "all" && (
                    <Chip
                      label={pests.find(p => p._id === tempPest)?.name || ''}
                      onDelete={() => setTempPest("all")}
                      color="primary"
                      size="small"
                    />
                  )}
                </Stack>
                <Divider sx={{ mt: 2 }} />
              </Box>
            )}

            {/* Super Category Filter */}
            <Box mb={3}>
              <MDTypography variant="body2" fontWeight="bold" sx={{ color: '#000' }} mb={2}>
                Super Category
              </MDTypography>
              <FormControl fullWidth>
                <Select
                  value={tempSuperCategory}
                  onChange={(e) => {
                    setTempSuperCategory(e.target.value);
                    setTempCategory("all");
                    setTempSubcategory("all");
                  }}
                  displayEmpty
                  sx={{ height: 56, borderRadius: 2 }}
                  renderValue={(selected) => {
                    const sc = superCategories.find((sc) => sc._id === selected);
                    return sc ? (
                      <Box display="flex" alignItems="center" gap={1.5}>
                        <img src={sc.imageUrl} alt={sc.title} style={{ width: 32, height: 32, objectFit: "cover", borderRadius: 6 }} />
                        <span style={{ fontWeight: 500 }}>{sc.title}</span>
                      </Box>
                    ) : "Select Super Category";
                  }}
                >
                  {superCategories.map((sc) => (
                    <MenuItem key={sc._id} value={sc._id} sx={{ py: 1.5 }}>
                      <Box display="flex" alignItems="center" gap={1.5}>
                        <img src={sc.imageUrl} alt={sc.title} style={{ width: 32, height: 32, objectFit: "cover", borderRadius: 6 }} />
                        {sc.title}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {/* Category Filter */}
            <Box mb={3}>
              <MDTypography variant="body2" fontWeight="bold" sx={{ color: '#000' }} mb={2}>
                Category
              </MDTypography>
              <FormControl fullWidth>
                <Select
                  value={tempCategory}
                  onChange={(e) => {
                    setTempCategory(e.target.value);
                    setTempSubcategory("all");
                  }}
                  displayEmpty
                  sx={{ height: 56, borderRadius: 2 }}
                >
                  <MenuItem value="all">All Categories</MenuItem>
                  {categories
                    .filter(cat => !tempSuperCategory || cat.super_cat_id === tempSuperCategory)
                    .map((cat) => (
                      <MenuItem key={cat._id} value={cat._id} sx={{ py: 1.5 }}>
                        <Box display="flex" alignItems="center" gap={1.5}>
                          {cat.imageUrl && <img src={cat.imageUrl} alt={cat.title} style={{ width: 32, height: 32, objectFit: "cover", borderRadius: 6 }} />}
                          {cat.title}
                        </Box>
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            </Box>

            {/* Subcategory Filter */}
            <Box mb={3}>
              <MDTypography variant="body2" fontWeight="bold" sx={{ color: '#000' }} mb={2}>
                Subcategory
              </MDTypography>
              <FormControl fullWidth>
                <Select
                  value={tempSubcategory}
                  onChange={(e) => setTempSubcategory(e.target.value)}
                  displayEmpty
                  sx={{ height: 56, borderRadius: 2 }}
                >
                  <MenuItem value="all">All Subcategories</MenuItem>
                  {subcategories
                    .filter(sub => !tempCategory || tempCategory === "all" || sub.category_id === tempCategory)
                    .map((sub) => (
                      <MenuItem key={sub._id} value={sub._id} sx={{ py: 1.5 }}>
                        <Box display="flex" alignItems="center" gap={1.5}>
                          {sub.imageUrl && <img src={sub.imageUrl} alt={sub.title} style={{ width: 32, height: 32, objectFit: "cover", borderRadius: 6 }} />}
                          {sub.title}
                        </Box>
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            </Box>

            {/* Brand Filter */}
            <Box mb={3}>
              <MDTypography variant="body2" fontWeight="bold" sx={{ color: '#000' }} mb={2}>
                Brand
              </MDTypography>
              <FormControl fullWidth>
                <Select
                  value={tempBrand}
                  onChange={(e) => setTempBrand(e.target.value)}
                  displayEmpty
                  sx={{ height: 56, borderRadius: 2 }}
                >
                  <MenuItem value="all">All Brands</MenuItem>
                  {brands.map((brand) => (
                    <MenuItem key={brand._id} value={brand._id} sx={{ py: 1.5 }}>
                      <Box display="flex" alignItems="center" gap={1.5}>
                        {brand.imageUrl && <img src={brand.imageUrl} alt={brand.title} style={{ width: 32, height: 32, objectFit: "cover", borderRadius: 6 }} />}
                        {brand.title}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {/* Crop Filter */}
            <Box mb={3}>
              <MDTypography variant="body2" fontWeight="bold" sx={{ color: '#000' }} mb={2}>
                Crop
              </MDTypography>
              <FormControl fullWidth>
                <Select
                  value={tempCrop}
                  onChange={(e) => setTempCrop(e.target.value)}
                  displayEmpty
                  sx={{ height: 56, borderRadius: 2 }}
                >
                  <MenuItem value="all">All Crops</MenuItem>
                  {crops.map((crop) => (
                    <MenuItem key={crop._id} value={crop._id} sx={{ py: 1.5 }}>
                      <Box display="flex" alignItems="center" gap={1.5}>
                        {crop.imageUrl && <img src={crop.imageUrl} alt={crop.title} style={{ width: 32, height: 32, objectFit: "cover", borderRadius: 6 }} />}
                        {crop.title}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {/* Pest Filter */}
            <Box mb={3}>
              <MDTypography variant="body2" fontWeight="bold" sx={{ color: '#000' }} mb={2}>
                Pest
              </MDTypography>
              <FormControl fullWidth>
                <Select
                  value={tempPest}
                  onChange={(e) => setTempPest(e.target.value)}
                  displayEmpty
                  sx={{ height: 56, borderRadius: 2 }}
                >
                  <MenuItem value="all">All Pests</MenuItem>
                  {pests.map((pest) => (
                    <MenuItem key={pest._id} value={pest._id} sx={{ py: 1.5 }}>
                      {pest.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
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
                  sx={{ height: 56, borderRadius: 2 }}
                >
                  <MenuItem value="az" sx={{ py: 1.5 }}>
                    <Box display="flex" alignItems="center" gap={1.5}>
                      <SwapVert fontSize="small" color="action" />
                      <span>A → Z (Ascending)</span>
                    </Box>
                  </MenuItem>
                  <MenuItem value="za" sx={{ py: 1.5 }}>
                    <Box display="flex" alignItems="center" gap={1.5}>
                      <SwapVert fontSize="small" color="action" sx={{ transform: 'rotate(180deg)' }} />
                      <span>Z → A (Descending)</span>
                    </Box>
                  </MenuItem>
                </Select>
              </FormControl>
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
                  <strong>SuperCategory</strong>
                </TableCell>
                <TableCell>
                  <strong>Category</strong>
                </TableCell>
                <TableCell>
                  <strong>Brand</strong>
                </TableCell>
                <TableCell>
                  <strong>Crop</strong>
                </TableCell>
                <TableCell>
                  <strong>Pest</strong>
                </TableCell>
                <TableCell>
                  <strong>MFG</strong>
                </TableCell>
                <TableCell>
                  <strong>MRP</strong>
                </TableCell>
                <TableCell>
                  <strong>Sell Price</strong>
                </TableCell>
                <TableCell>
                  <strong>Mfg Date</strong>
                </TableCell>
                <TableCell>
                  <strong>Expiry Date</strong>
                </TableCell>
                <TableCell>
                  <strong>Package Qty</strong>
                </TableCell>
                <TableCell>
                  <strong>Actions</strong>
                </TableCell>
              </TableRow>
              {sortedProducts.map((product, index) => (
                <TableRow key={product._id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>
                    <img
                      src={Array.isArray(product.images) && product.images.length > 0 ? product.images[0].imageUrl : product.imageUrl}
                      alt={product.title}
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
                        {product.title}
                      </MDTypography>
                      <MDTypography variant="caption" color="text">
                        {product.sub_title}
                      </MDTypography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    {superCategories.find((superCat) => superCat._id === product.super_cat_id)
                      ?.title || "N/A"}
                  </TableCell>
                  <TableCell>
                    {categories.find((cat) => cat._id === product.category_id)?.title || "N/A"}
                  </TableCell>
                  <TableCell>
                    {brands.find((brand) => brand._id === product.brand_id)?.title || "N/A"}
                  </TableCell>
                  <TableCell>
                    {crops.find((crop) => crop._id === product.crop_id)?.title || "N/A"}
                  </TableCell>
                  <TableCell>
                    {pests.find((pest) => pest._id === product.pest_id)?.name || "N/A"}
                  </TableCell>
                  <TableCell>{product.mfg_by}</TableCell>

                  <TableCell>₹{getFirstPackageData(product).mrp_price}</TableCell>
                  <TableCell>₹{getFirstPackageData(product).sell_price}</TableCell>
                  <TableCell>{getFirstPackageData(product).mfg_date || "N/A"}</TableCell>
                  <TableCell>{getFirstPackageData(product).exp_date || "N/A"}</TableCell>

                  <TableCell>
                    {Array.isArray(product.package_qty)
                      ? product.package_qty.map((pkg) => `${pkg.qty}(${pkg.pkgName})`).join(", ")
                      : "N/A"}
                  </TableCell>

                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <Tooltip title="View Details">
                        <IconButton
                          color="info"
                          size="small"
                          onClick={() => handleViewDetails(product)}
                        >
                          <Visibility fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit">
                        <IconButton
                          color="primary"
                          size="small"
                          onClick={() => handleEditProduct(product)}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          color="error"
                          size="small"
                          onClick={() => handleDeleteClick(product._id)}
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
        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>Are you sure you want to delete this product?</DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)} color="primary">
              No
            </Button>
            <Button onClick={confirmDeleteProduct} color="error">
              Yes
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar for notifications */}
        <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleCloseSnackbar}>
          <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: "100%" }}>
            {snackbarMessage}
          </Alert>
        </Snackbar>
        {/* Product Details Dialog */}
        {selectedProduct && (
          <Dialog open={!!selectedProduct} onClose={handleCloseDetails} maxWidth="md" fullWidth>
            <DialogTitle>Product Details</DialogTitle>
            <DialogContent>
              <Box display="flex" flexDirection="column" gap={3}>
                {/* Image Section */}
                <Box
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  style={{
                    backgroundColor: "#f4f4f4",
                    borderRadius: "10px",
                    padding: "20px",
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                  }}
                >
                  {Array.isArray(selectedProduct.images) && selectedProduct.images.length > 0 ? (
                    <img
                      src={selectedProduct.images[0].imageUrl}
                      alt={selectedProduct.title}
                      style={{
                        maxWidth: "100%",
                        maxHeight: "250px",
                        borderRadius: "8px",
                        objectFit: "contain",
                      }}
                    />
                  ) : (
                    <img
                      src={selectedProduct.imageUrl}
                      alt={selectedProduct.title}
                      style={{
                        maxWidth: "100%",
                        maxHeight: "250px",
                        borderRadius: "8px",
                        objectFit: "contain",
                      }}
                    />
                  )}
                </Box>

                {/* Details Section */}
                <Box display="grid" gridTemplateColumns={{ xs: "1fr", sm: "1fr 1fr" }} gap={3}>
                  {/* General Info */}
                  <Box>
                    <MDTypography variant="h6" gutterBottom>
                      General Information
                    </MDTypography>
                    <MDTypography>
                      <strong>Title:</strong> {selectedProduct.title}
                    </MDTypography>
                    <MDTypography>
                      <strong>Sub Title:</strong> {selectedProduct.sub_title}
                    </MDTypography>
                    <MDTypography>
                      <strong>Description:</strong> {selectedProduct.description}
                    </MDTypography>
                    <MDTypography>
                      <strong>Chemical Content:</strong> {selectedProduct.chemical_content}
                    </MDTypography>
                    <MDTypography>
                      <strong>Features & Benefits:</strong> {selectedProduct.features_benefits}
                    </MDTypography>
                    <MDTypography>
                      <strong>Modes of Use:</strong> {selectedProduct.modes_of_use}
                    </MDTypography>
                    <MDTypography>
                      <strong>Method of Application:</strong> {selectedProduct.method_of_application}
                    </MDTypography>
                    <MDTypography>
                      <strong>Recommendations:</strong> {selectedProduct.recommendations}
                    </MDTypography>
                  </Box>

                  {/* Pricing Section */}
                  <Box>
                    <MDTypography variant="h6" gutterBottom>
                      Pricing & Dates
                    </MDTypography>
                    <MDTypography>
                      <strong>MRP Price:</strong> ₹{selectedProduct.mrp_price}
                    </MDTypography>
                    <MDTypography>
                      <strong>Selling Price:</strong> ₹{selectedProduct.sell_price}
                    </MDTypography>
                    <MDTypography>
                      <strong>Expiry Date:</strong> {selectedProduct.expiry_date}
                    </MDTypography>
                    <MDTypography>
                      <strong>Manufacture Date:</strong> {selectedProduct.mfg_date}
                    </MDTypography>
                  </Box>

                  {/* Categories Section */}
                  <Box>
                    <MDTypography variant="h6" gutterBottom>
                      Categories & Brand
                    </MDTypography>
                    <MDTypography>
                      <strong>SuperCategory:</strong>{" "}
                      {superCategories.find(
                        (superCat) => superCat._id === selectedProduct.super_cat_id
                      )?.title || "N/A"}
                    </MDTypography>
                    <MDTypography>
                      <strong>Category:</strong>{" "}
                      {categories.find((cat) => cat._id === selectedProduct.category_id)?.title ||
                        "N/A"}
                    </MDTypography>
                    <MDTypography>
                      <strong>Subcategory:</strong>{" "}
                      {subcategories.find((sub) => sub._id === selectedProduct.sub_category_id)
                        ?.title || "N/A"}
                    </MDTypography>
                    <MDTypography>
                      <strong>Brand:</strong>{" "}
                      {brands.find((brand) => brand._id === selectedProduct.brand_id)?.title ||
                        "N/A"}
                    </MDTypography>
                    <MDTypography>
                      <strong>Crop:</strong>{" "}
                      {crops.find((crop) => crop._id === selectedProduct.crop_id)?.title || "N/A"}
                    </MDTypography>
                    <MDTypography>
                      <strong>Pest:</strong>{" "}
                      {pests.find((pest) => pest._id === selectedProduct.pest_id)?.name || "N/A"}
                    </MDTypography>
                  </Box>

                  {/* Package Quantity Section */}
                  <Box>
                    <MDTypography variant="h6" gutterBottom>
                      Package Quantities
                    </MDTypography>
                    <MDTypography>
                      {Array.isArray(selectedProduct.package_qty)
                        ? selectedProduct.package_qty
                            .map((pkg) => `${pkg.qty} (${pkg.pkgName})`)
                            .join(", ")
                        : "N/A"}
                    </MDTypography>
                  </Box>
                </Box>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button
                onClick={handleCloseDetails}
                color="primary"
                variant="contained"
                style={{ margin: "10px", color: "#fff" }}
              >
                Close
              </Button>
            </DialogActions>
          </Dialog>
        )}
        {/*  Product Dialog */}
        {editingProduct && (
          <Dialog
            open={!!editingProduct}
            onClose={() => setEditingProduct(null)}
            maxWidth="md"
            fullWidth
          >
            <DialogTitle>Edit Product</DialogTitle>
            <DialogContent>
              <Box display="flex" flexDirection="column" gap={2} py={2}>
                <FormControl fullWidth>
                  <TextField
                    label="Title"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                  />
                </FormControl>
                <FormControl fullWidth>
                  <TextField
                    label="Sub Title"
                    value={editSubTitle}
                    onChange={(e) => setEditSubTitle(e.target.value)}
                  />
                </FormControl>
                <FormControl fullWidth>
                  <Autocomplete
                    options={superCategories}
                    getOptionLabel={(option) => option.title || ""}
                    value={superCategories.find((supercategory) => supercategory._id === editSuperCategory) || null}
                    onChange={(event, newValue) => setEditSuperCategory(newValue ? newValue._id : "")}
                    renderInput={(params) => (
                      <TextField {...params} label="SuperCategory" variant="outlined" />
                    )}
                    isOptionEqualToValue={(option, value) => option._id === value._id}
                  />
                </FormControl>
                <FormControl fullWidth>
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
                <FormControl fullWidth>
                  <Autocomplete
                    options={subcategories}
                    getOptionLabel={(option) => option.title || ""}
                    value={subcategories.find((subcat) => subcat._id === editSubCategoryId) || null}
                    onChange={(event, newValue) =>
                      setEditSubCategoryId(newValue ? newValue._id : "")
                    }
                    renderInput={(params) => (
                      <TextField {...params} label="Subcategory" variant="outlined" />
                    )}
                    isOptionEqualToValue={(option, value) => option._id === value._id}
                  />
                </FormControl>
                <FormControl fullWidth>
                  <Autocomplete
                    options={brands}
                    getOptionLabel={(option) => option.title || ""}
                    value={brands.find((brand) => brand._id === editBrandId) || null}
                    onChange={(event, newValue) => setEditBrandId(newValue ? newValue._id : "")}
                    renderInput={(params) => (
                      <TextField {...params} label="Brand" variant="outlined" />
                    )}
                    isOptionEqualToValue={(option, value) => option._id === value._id}
                  />
                </FormControl>
                <FormControl fullWidth>
                  <Autocomplete
                    options={crops}
                    getOptionLabel={(option) => option.title || ""}
                    value={crops.find((crop) => crop._id === editCropId) || null}
                    onChange={(event, newValue) => setEditCropId(newValue ? newValue._id : "")}
                    renderInput={(params) => (
                      <TextField {...params} label="Crop" variant="outlined" />
                    )}
                    isOptionEqualToValue={(option, value) => option._id === value._id}
                  />
                </FormControl>
                <FormControl fullWidth>
                  <Autocomplete
                    options={pests}
                    getOptionLabel={(option) => option.name || ""}
                    value={pests.find((pest) => pest._id === editPestId) || null}
                    onChange={(event, newValue) => setEditPestId(newValue ? newValue._id : "")}
                    renderInput={(params) => (
                      <TextField {...params} label="Pest" variant="outlined" />
                    )}
                    isOptionEqualToValue={(option, value) => option._id === value._id}
                  />
                </FormControl>
                <FormControl fullWidth>
                  <TextField
                    label="MFG By"
                    value={editMfgBy}
                    onChange={(e) => setEditMfgBy(e.target.value)}
                  />
                </FormControl>

                <FormControl fullWidth>
                  <MDTypography variant="subtitle1" gutterBottom>
                    Package Quantities:
                  </MDTypography>
                  {editPackageQty.map((pkg, index) => (
                    <Box key={index} display="flex" flexDirection="column" gap={2} mb={3}>
                      <Box display="flex" gap={1}>
                        <TextField
                          label="Quantity"
                          type="number"
                          value={pkg.qty}
                          onChange={(e) => {
                            const updatedQty = [...editPackageQty];
                            updatedQty[index] = { ...updatedQty[index], qty: e.target.value };
                            setEditPackageQty(updatedQty);
                          }}
                          fullWidth
                        />
                        <TextField
                          label="Package Name"
                          value={pkg.pkgName}
                          onChange={(e) => {
                            const updatedQty = [...editPackageQty];
                            updatedQty[index] = { ...updatedQty[index], pkgName: e.target.value };
                            setEditPackageQty(updatedQty);
                          }}
                          fullWidth
                        />
                      </Box>
                      <Box display="flex" gap={1}>
                        <TextField
                          label="MRP Price"
                          type="number"
                          value={pkg.mrp_price}
                          onChange={(e) => {
                            const updatedQty = [...editPackageQty];
                            updatedQty[index] = { ...updatedQty[index], mrp_price: e.target.value };
                            setEditPackageQty(updatedQty);
                          }}
                          InputProps={{
                            startAdornment: (
                              <Box component="span" mr={1}>
                                ₹
                              </Box>
                            ),
                          }}
                          fullWidth
                        />
                        <TextField
                          label="Selling Price"
                          type="number"
                          value={pkg.sell_price}
                          onChange={(e) => {
                            const updatedQty = [...editPackageQty];
                            updatedQty[index] = {
                              ...updatedQty[index],
                              sell_price: e.target.value,
                            };
                            setEditPackageQty(updatedQty);
                          }}
                          InputProps={{
                            startAdornment: (
                              <Box component="span" mr={1}>
                                ₹
                              </Box>
                            ),
                          }}
                          fullWidth
                        />
                      </Box>
                      <Box display="flex" gap={1}>
                        <TextField
                          label="Manufacturing Date"
                          type="date"
                          value={pkg.mfg_date || ""}
                          onChange={(e) => {
                            const updatedQty = [...editPackageQty];
                            updatedQty[index] = { ...updatedQty[index], mfg_date: e.target.value };
                            setEditPackageQty(updatedQty);
                          }}
                          fullWidth
                          InputLabelProps={{ shrink: true }}
                        />
                        <TextField
                          label="Expiry Date"
                          type="date"
                          value={pkg.exp_date || ""}
                          onChange={(e) => {
                            const updatedQty = [...editPackageQty];
                            updatedQty[index] = { ...updatedQty[index], exp_date: e.target.value };
                            setEditPackageQty(updatedQty);
                          }}
                          fullWidth
                          InputLabelProps={{ shrink: true }}
                        />
                      </Box>
                      <Button
                        color="error"
                        size="small"
                        onClick={() => {
                          const updatedQty = [...editPackageQty];
                          updatedQty.splice(index, 1);
                          setEditPackageQty(updatedQty);
                        }}
                      >
                        Delete Package
                      </Button>
                    </Box>
                  ))}
                  <Button
                    onClick={() =>
                      setEditPackageQty([
                        ...editPackageQty,
                        {
                          qty: "",
                          pkgName: "",
                          mrp_price: "",
                          sell_price: "",
                          mfg_date: "",
                          exp_date: "",
                        },
                      ])
                    }
                    variant="outlined"
                    color="primary"
                    style={{ color: "#000000" }}
                    size="small"
                  >
                    Add Package
                  </Button>
                </FormControl>
                <FormControl fullWidth>
                  <MDTypography variant="subtitle1" gutterBottom>
                   Retailer Package Quantities:
                  </MDTypography>
                  {editRetailerPackageQty.map((pkg, index) => (
                    <Box key={index} display="flex" flexDirection="column" gap={2} mb={3}>
                      <Box display="flex" gap={1}>
                        <TextField
                          label="Quantity"
                          type="number"
                          value={pkg.qty}
                          onChange={(e) => {
                            const updatedQty = [...editRetailerPackageQty];
                            updatedQty[index] = { ...updatedQty[index], qty: e.target.value };
                            setEditRetailerPackageQty(updatedQty);
                          }}
                          fullWidth
                        />
                        <TextField
                          label="Package Name"
                          value={pkg.pkgName}
                          onChange={(e) => {
                            const updatedQty = [...editRetailerPackageQty];
                            updatedQty[index] = { ...updatedQty[index], pkgName: e.target.value };
                            setEditRetailerPackageQty(updatedQty);
                          }}
                          fullWidth
                        />
                      </Box>
                      <Box display="flex" gap={1}>
                        <TextField
                          label="MRP Price"
                          type="number"
                          value={pkg.mrp_price}
                          onChange={(e) => {
                            const updatedQty = [...editRetailerPackageQty];
                            updatedQty[index] = { ...updatedQty[index], mrp_price: e.target.value };
                            setEditRetailerPackageQty(updatedQty);
                          }}
                          InputProps={{
                            startAdornment: (
                              <Box component="span" mr={1}>
                                ₹
                              </Box>
                            ),
                          }}
                          fullWidth
                        />
                        <TextField
                          label="Selling Price"
                          type="number"
                          value={pkg.sell_price}
                          onChange={(e) => {
                            const updatedQty = [...editRetailerPackageQty];
                            updatedQty[index] = {
                              ...updatedQty[index],
                              sell_price: e.target.value,
                            };
                            setEditRetailerPackageQty(updatedQty);
                          }}
                          InputProps={{
                            startAdornment: (
                              <Box component="span" mr={1}>
                                ₹
                              </Box>
                            ),
                          }}
                          fullWidth
                        />
                      </Box>
                      <Box display="flex" gap={1}>
                        <TextField
                          label="Manufacturing Date"
                          type="date"
                          value={pkg.mfg_date || ""}
                          onChange={(e) => {
                            const updatedQty = [...editRetailerPackageQty];
                            updatedQty[index] = { ...updatedQty[index], mfg_date: e.target.value };
                            setEditRetailerPackageQty(updatedQty);
                          }}
                          fullWidth
                          InputLabelProps={{ shrink: true }}
                        />
                        <TextField
                          label="Expiry Date"
                          type="date"
                          value={pkg.exp_date || ""}
                          onChange={(e) => {
                            const updatedQty = [...editRetailerPackageQty];
                            updatedQty[index] = { ...updatedQty[index], exp_date: e.target.value };
                            setEditRetailerPackageQty(updatedQty);
                          }}
                          fullWidth
                          InputLabelProps={{ shrink: true }}
                        />
                      </Box>
                      <Button
                        color="error"
                        size="small"
                        onClick={() => {
                          const updatedQty = [...editRetailerPackageQty];
                          updatedQty.splice(index, 1);
                          setEditRetailerPackageQty(updatedQty);
                        }}
                      >
                        Delete Package
                      </Button>
                    </Box>
                  ))}
                  <Button
                    onClick={() =>
                      setEditRetailerPackageQty([
                        ...editRetailerPackageQty,
                        {
                          qty: "",
                          pkgName: "",
                          mrp_price: "",
                          sell_price: "",
                          mfg_date: "",
                          exp_date: "",
                        },
                      ])
                    }
                    variant="outlined"
                    color="primary"
                    style={{ color: "#000000" }}
                    size="small"
                  >
                    Add Package
                  </Button>
                </FormControl>

                <FormControl fullWidth>
                  <TextField
                    label="Agent Commission"
                    value={editAgentCommission}
                    onChange={(e) => setEditAgentCommission(e.target.value)}
                  />
                </FormControl>
                <FormControl fullWidth>
                  <TextField
                    label="Description"
                    multiline
                    rows={4}
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                  />
                </FormControl>
                <FormControl fullWidth>
                  <TextField
                    label="Chemical Content"
                    multiline
                    rows={4}
                    value={editChemicalContent}
                    onChange={(e) => setEditChemicalContent(e.target.value)}
                  />
                </FormControl>
                <FormControl fullWidth>
                  <TextField
                    label="Features & Benefits"
                    multiline
                    rows={4}
                    value={editFeaturesBenefits}
                    onChange={(e) => setEditFeaturesBenefits(e.target.value)}
                  />
                </FormControl>
                <FormControl fullWidth>
                  <TextField
                    label="Modes of Use"
                    multiline
                    rows={4}
                    value={editModesOfUse}
                    onChange={(e) => setEditModesOfUse(e.target.value)}
                  />
                </FormControl>

                <FormControl fullWidth>
                  <TextField
                    label="Method of Application"
                    multiline
                    rows={4}
                    value={editMethodOfApplication}
                    onChange={(e) => setEditMethodOfApplication(e.target.value)}
                  />
                </FormControl>
                <FormControl fullWidth>
                  <TextField
                    label="Recommendations"
                    multiline
                    rows={4}
                    value={editRecommendations}
                    onChange={(e) => setEditRecommendations(e.target.value)}
                  />
                </FormControl>
                <FormControl fullWidth>
                  <TextField
                    type="file"
                    label="Select Images (Exactly 3 images required)"
                    InputLabelProps={{ shrink: true }}
                    inputProps={{ multiple: true, accept: "image/*" }}
                    onChange={handleFileChange}
                    required
                  />
                </FormControl>
                {Array.isArray(editingProduct.images) && editingProduct.images.length > 0 && (
                  <Box>
                    <MDTypography variant="body2" mb={1}>
                      Current Images:
                    </MDTypography>
                    <Box display="flex" gap={2}>
                      {editingProduct.images.map((imgObj, idx) => (
                        <img
                          key={imgObj._id || idx}
                          src={imgObj.imageUrl}
                          alt={`Current product ${idx + 1}`}
                          style={{
                            maxWidth: "100px",
                            borderRadius: "4px",
                          }}
                        />
                      ))}
                    </Box>
                  </Box>
                )}
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setEditingProduct(null)} color="primary">
                Cancel
              </Button>
              <Button
                onClick={handleUpdateProduct}
                style={{ color: "#fff" }}
                color="primary"
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

export default ProductManagement;

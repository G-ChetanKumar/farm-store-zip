import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import { Alert, Box, Card, CardContent, Divider, Snackbar, Typography } from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import OutlinedInput from "@mui/material/OutlinedInput";
import Select from "@mui/material/Select";
import TextField from "@mui/material/TextField";
import apiClient from "api/axios";
import MDBox from "components/MDBox";
import Footer from "examples/Footer";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function ProductForm() {
  const [formValues, setFormValues] = useState({
    title: "",
    sub_title: "",
    description: "",
    chemical_content: "",
    features_benefits: "",
    modes_of_use: "",
    method_of_application: "",
    recommendations: "",
    images: [], // Changed from image to images array
    super_cat_id: "",
    category_id: "",
    sub_category_id: "",
    brand_id: "",
    crop_id: "",
    pest_id: [],
    products: [],
    mfg_by: "",
    agent_commission: "",
    numberOfItems: "",
    package_qty: [
      {
        _id: null, // Initialize with null for new entries
        pkgName: "",
        qty: "",
        mrp_price: "",
        sell_price: "",
        mfg_date: "",
        exp_date: "",
      },
    ],
    retailer_package_qty: [
      {
        _id: null, // Initialize with null for new entries
        pkgName: "",
        qty: "",
        mrp_price: "",
        sell_price: "",
        mfg_date: "",
        exp_date: "",
      },
    ],
  });
  const [categories, setCategories] = useState([]);
  const [superCategories, setSuperCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [crops, setCrops] = useState([]);
  const [pests, setPests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [open, setOpen] = useState(false);
  const [productsList, setProductsList] = useState([]);
  const handleProductsChange = (event, value) => {
    setFormValues((prevValues) => ({
      ...prevValues,
      products: value,
    }));
  };
  useEffect(() => {
    const fetchData = async () => {
      try {
        const categoriesResponse = await apiClient.get("/api/category/get-category"
        );
        setCategories(categoriesResponse.data);

        const supercategoriesResponse = await apiClient.get("/api/super-category/get-super-category"
        );
        setSuperCategories(supercategoriesResponse.data);

        const brandsResponse = await apiClient.get("/api/brand/get-brand");
        setBrands(brandsResponse.data);

        const cropsResponse = await apiClient.get("/api/crop/get-crops");
        setCrops(cropsResponse.data);

        const pestsResponse = await apiClient.get("/api/pest/get-pests");
        setPests(pestsResponse.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

    useEffect(() => {
    axios
      .get(`${BASE_URL}/api/product/get-product`)
      .then((res) => setProductsList(res.data))
      .catch(() => setProductsList([]));
  }, []);

  useEffect(() => {
    const fetchSubCategories = async () => {
      if (formValues.category_id) {
        try {
          const subCategoriesResponse = await apiClient.get(`/api/subcategory/get-sub-category?categoryId=${formValues.category_id}`
          );
          setSubCategories(subCategoriesResponse.data);
        } catch (error) {
          console.error("Error fetching subcategories:", error);
        }
      } else {
        setSubCategories([]);
      }
    };

    fetchSubCategories();
  }, [formValues.category_id]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormValues((prevValues) => ({
      ...prevValues,
      [name]: value,
    }));
  };

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    if (files.length !== 3) {
      setAlertMessage("Please select exactly 3 images.");
      setOpen(true);
      return;
    }
    setFormValues((prevValues) => ({
      ...prevValues,
      images: files,
    }));
  };

  const handlePackageQtyChange = (index, field, value) => {
    const updatedPackageQty = [...formValues.package_qty];
    updatedPackageQty[index][field] = value;
    setFormValues((prevValues) => ({
      ...prevValues,
      package_qty: updatedPackageQty,
    }));
  };
  const handleRetailerPackageQtyChange = (index, field, value) => {
    const updatedPackageQty = [...formValues.retailer_package_qty];
    updatedPackageQty[index][field] = value;
    setFormValues((prevValues) => ({
      ...prevValues,
      retailer_package_qty: updatedPackageQty,
    }));
  };

  const addPackageQtyField = () => {
    setFormValues((prevValues) => ({
      ...prevValues,
      package_qty: [
        ...prevValues.package_qty,
        {
          _id: null, // New entries won't have an _id
          pkgName: "",
          qty: "",
          mrp_price: "",
          sell_price: "",
          mfg_date: "",
          exp_date: "",
        },
      ],
    }));
  };

  const addRetailerPackageQtyField = () => {
    setFormValues((prevValues) => ({
      ...prevValues,
      retailer_package_qty: [
        ...prevValues.retailer_package_qty,
        {
          _id: null, // New entries won't have an _id
          pkgName: "",
          qty: "",
          mrp_price: "",
          sell_price: "",
          mfg_date: "",
          exp_date: "",
        },
      ],
    }));
  };

  const deletePackageQtyField = (index) => {
    const updatedPackageQty = formValues.package_qty.filter((_, i) => i !== index);
    setFormValues((prevValues) => ({
      ...prevValues,
      package_qty: updatedPackageQty.length > 0 ? updatedPackageQty : [
        {
          _id: null,
          pkgName: "",
          qty: "",
          mrp_price: "",
          sell_price: "",
          mfg_date: "",
          exp_date: "",
        },
      ],
    }));
  };

  const deleteRetailerPackageQtyField = (index) => {
    const updatedPackageQty = formValues.retailer_package_qty.filter((_, i) => i !== index);
    setFormValues((prevValues) => ({
      ...prevValues,
      retailer_package_qty: updatedPackageQty.length > 0 ? updatedPackageQty : [
        {
          _id: null,
          pkgName: "",
          qty: "",
          mrp_price: "",
          sell_price: "",
          mfg_date: "",
          exp_date: "",
        },
      ],
    }));
  };

  // Update the handleSubmit function to fix the issues
  const handleSubmit = async (event) => {
    event.preventDefault();

    // Validate that exactly 3 images are selected
    if (!formValues.images || formValues.images.length !== 3) {
      setAlertMessage("Please select exactly 3 images.");
      setOpen(true);
      return;
    }

    // Validate required fields in package_qty
    const isPackageQtyValid = formValues.package_qty.every(
      (pkg) => pkg.pkgName && pkg.qty && pkg.mrp_price && pkg.sell_price
    );
    if (!isPackageQtyValid) {
      setAlertMessage("All package fields are required.");
      setOpen(true);
      return;
    }

    // Add validation for retailer_package_qty
    const isRetailerPackageQtyValid = formValues.retailer_package_qty.every(
      (pkg) => pkg.pkgName && pkg.qty && pkg.mrp_price && pkg.sell_price
    );
    if (!isRetailerPackageQtyValid) {
      setAlertMessage("All retailer package fields are required.");
      setOpen(true);
      return;
    }

    const formData = new FormData();
    formData.append("title", formValues.title);
    formData.append("sub_title", formValues.sub_title);
    formData.append("description", formValues.description);
    formData.append("chemical_content", formValues.chemical_content);
    formData.append("features_benefits", formValues.features_benefits);
    formData.append("modes_of_use", formValues.modes_of_use);
    formData.append("method_of_application", formValues.method_of_application);
    formData.append("recommendations", formValues.recommendations);

    // Append all 3 images with the field name "images"
    formValues.images.forEach((image, index) => {
      formData.append("images", image);
    });
    
    formData.append("super_cat_id", formValues.super_cat_id);
    formData.append("category_id", formValues.category_id);
    formData.append("sub_category_id", formValues.sub_category_id);
    formData.append("brand_id", formValues.brand_id);
    formData.append("crop_id", formValues.crop_id);
    formData.append("pest_id", formValues.pest_id); // Join pest IDs as a comma-separated string
    formData.append("mfg_by", formValues.mfg_by);

    // FIX 1: Ensure agent_commission is properly formatted and not empty
    const agentCommission = String(formValues.agent_commission).trim();
    if (agentCommission) {
      formData.append("agent_commission", agentCommission);
    }

    // Append numberOfItems if provided
    if (formValues.numberOfItems) {
      formData.append("numberOfItems", formValues.numberOfItems);
    }

    // Properly append package_qty data
    formValues.package_qty.forEach((pkg, index) => {
      formData.append(`package_qty[${index}][pkgName]`, pkg.pkgName);
      formData.append(`package_qty[${index}][qty]`, pkg.qty);
      formData.append(`package_qty[${index}][mrp_price]`, pkg.mrp_price);
      formData.append(`package_qty[${index}][sell_price]`, pkg.sell_price);
      formData.append(`package_qty[${index}][mfg_date]`, pkg.mfg_date || "");
      formData.append(`package_qty[${index}][exp_date]`, pkg.exp_date || "");
      if (pkg._id) {
        formData.append(`package_qty[${index}][_id]`, pkg._id);
      }
    });

    // FIX 2: Change how retailer_package_qty is handled to match package_qty exactly
    // Do not filter out entries as they've already been validated
    formValues.retailer_package_qty.forEach((pkg, index) => {
      formData.append(`retailer_package_qty[${index}][pkgName]`, pkg.pkgName);
      formData.append(`retailer_package_qty[${index}][qty]`, pkg.qty);
      formData.append(`retailer_package_qty[${index}][mrp_price]`, pkg.mrp_price);
      formData.append(`retailer_package_qty[${index}][sell_price]`, pkg.sell_price);
      formData.append(`retailer_package_qty[${index}][mfg_date]`, pkg.mfg_date || "");
      formData.append(`retailer_package_qty[${index}][exp_date]`, pkg.exp_date || "");
      if (pkg._id) {
        formData.append(`retailer_package_qty[${index}][_id]`, pkg._id);
      }
    });

    // Add debugging to see what's being sent
    console.log("Sending agent_commission:", agentCommission);
    console.log("Sending retailer_package_qty:", formValues.retailer_package_qty);

    // FIX 3: Add additional logging to see the entire FormData
    // This helps diagnose what's actually being sent to the server
    for (let pair of formData.entries()) {
      console.log(pair[0], pair[1]);
    }

    setLoading(true);
    try {
      const response = await apiClient.post("/api/product/add-product",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("API Response:", response.data); // Log the response for debugging

      setAlertMessage("Product added successfully!");
      setOpen(true);
      setFormValues({
        title: "",
        sub_title: "",
        description: "",
        chemical_content: "",
        features_benefits: "",
        modes_of_use: "",
        method_of_application: "",
        recommendations: "",
        images: [],
        super_cat_id: "",
        category_id: "",
        sub_category_id: "",
        brand_id: "",
        crop_id: "",
        pest_id: [],
        products: [],
        mfg_by: "",
        agent_commission: "",
        numberOfItems: "",
        package_qty: [
          {
            _id: null,
            pkgName: "",
            qty: "",
            mrp_price: "",
            sell_price: "",
            mfg_date: "",
            exp_date: "",
          },
        ],
        retailer_package_qty: [
          {
            _id: null,
            pkgName: "",
            qty: "",
            mrp_price: "",
            sell_price: "",
            mfg_date: "",
            exp_date: "",
          },
        ],
      });
    } catch (error) {
      console.error("Error adding product:", error.response?.data || error.message);
      setAlertMessage(error.response?.data?.message || "Failed to add Product. Please try again.");
      setOpen(true);
    }
    setLoading(false);
  };
  const handleClose = () => {
    setOpen(false);
  };

  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card sx={{ mb: 3, boxShadow: 3 }}>
              <CardContent>
                <MDBox display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="h4" fontWeight="bold" color="primary">
                      Add New Product
                    </Typography>
                    <Typography variant="body2" color="text.secondary" mt={0.5}>
                      Fill in the details below to add a new product to your inventory
                    </Typography>
                  </Box>
                  <Button
                    onClick={() => navigate("/Product")}
                    variant="outlined"
                    color="primary"
                    size="large"
                  >
                    Back to Products
                  </Button>
                </MDBox>
              </CardContent>
            </Card>
            <form onSubmit={handleSubmit}>
              {/* Basic Information Section */}
              <Card sx={{ mb: 3, boxShadow: 2 }}>
                <CardContent>
                  <Typography variant="h5" fontWeight="bold" color="primary" mb={2}>
                    📝 Basic Information
                  </Typography>
                  <Divider sx={{ mb: 3 }} />
                  <MDBox mb={2} display="flex" gap={2}>
                    <TextField
                      fullWidth
                      label="Product Title"
                      name="title"
                      value={formValues.title}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter product title"
                    />
                    <TextField
                      fullWidth
                      label="Sub Title"
                      name="sub_title"
                      value={formValues.sub_title}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter product subtitle"
                    />
                  </MDBox>
               <MDBox display="flex" gap={2} mb={1}>
                <FormControl fullWidth>
                  <InputLabel
                    id="category-select-label"
                    sx={{
                      fontSize: "1rem",
                    }}
                  >
                    Select SuperCategory
                  </InputLabel>
                  <Select
                    labelId="supercategory-select-label"
                    name="super_cat_id"
                    value={formValues.super_cat_id}
                    onChange={handleInputChange}
                    required
                    input={<OutlinedInput label="Select SuperCategory" />}
                    sx={{
                      fontSize: "1rem",
                      padding: "10.5px 14px",
                      height: "45px",
                    }}
                  >
                    <MenuItem value="">Select a Supercategory</MenuItem>
                    {superCategories.map((superCategory) => (
                      <MenuItem key={superCategory._id} value={superCategory._id}>
                        {superCategory.title}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth>
                  <InputLabel
                    id="category-select-label"
                    sx={{
                      fontSize: "1rem",
                    }}
                  >
                    Select Category
                  </InputLabel>
                  <Select
                    labelId="category-select-label"
                    name="category_id"
                    value={formValues.category_id}
                    onChange={handleInputChange}
                    required
                    input={<OutlinedInput label="Select Category" />}
                    sx={{
                      fontSize: "1rem",
                      padding: "10.5px 14px",
                      height: "45px",
                    }}
                  >
                    <MenuItem value="">Select a category</MenuItem>
                    {categories.map((category) => (
                      <MenuItem key={category._id} value={category._id}>
                        {category.title}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                         <FormControl fullWidth>
                  <InputLabel
                    id="subcategory-select-label"
                    sx={{
                      fontSize: "1rem",
                    }}
                  >
                    Select SubCategory
                  </InputLabel>
                  <Select
                    labelId="subcategory-select-label"
                    name="sub_category_id"
                    value={formValues.sub_category_id}
                    onChange={handleInputChange}
                    
                    disabled={!formValues.category_id}
                    input={<OutlinedInput label="Select SubCategory" />}
                    sx={{
                      fontSize: "1rem",
                      padding: "10.5px 14px",
                      height: "45px",
                    }}
                  >
                    <MenuItem value="">Select a subcategory</MenuItem>
                    {subCategories.map((subcategory) => (
                      <MenuItem
                        key={subcategory._id}
                        value={subcategory._id}
                        style={{
                          display:
                            subcategory.category_id === formValues.category_id ? "block" : "none",
                        }}
                      >
                        {subcategory.title}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                  </MDBox>
                </CardContent>
              </Card>

              {/* Brand & Manufacturing Section */}
              <Card sx={{ mb: 3, boxShadow: 2 }}>
                <CardContent>
                  <Typography variant="h5" fontWeight="bold" color="primary" mb={2}>
                    🏭 Brand & Manufacturing Details
                  </Typography>
                  <Divider sx={{ mb: 3 }} />
                  <MDBox display="flex" gap={2} mb={2}>
                    <FormControl fullWidth>
                      <InputLabel
                        id="brand-select-label"
                    sx={{
                      fontSize: "1rem",
                    }}
                  >
                    Select Brand
                  </InputLabel>
                  <Select
                    labelId="brand-select-label"
                    name="brand_id"
                    value={formValues.brand_id}
                    onChange={handleInputChange}
                    required
                    input={<OutlinedInput label="Select brand" />}
                    sx={{
                      fontSize: "1rem",
                      padding: "10.5px 14px",
                      height: "45px",
                    }}
                  >
                    <MenuItem value="">Select a brand</MenuItem>
                    {brands.map((brand) => (
                      <MenuItem key={brand._id} value={brand._id}>
                        {brand.title}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <TextField
                  fullWidth
                  label="MFG BY"
                  name="mfg_by"
                  value={formValues.mfg_by}
                  onChange={handleInputChange}
                  required
                />
                              <FormControl fullWidth>
                  <InputLabel
                    id="crop-select-label"
                    sx={{
                      fontSize: "1rem",
                    }}
                  >
                    Select Crop
                  </InputLabel>
                  <Select
                    labelId="crop-select-label"
                    name="crop_id"
                    value={formValues.crop_id}
                    onChange={handleInputChange}
                    required
                    input={<OutlinedInput label="Select Crop" />}
                    sx={{
                      fontSize: "1rem",
                      padding: "10.5px 14px",
                      height: "45px",
                    }}
                  >
                    <MenuItem value="">Select a Crop</MenuItem>
                    {crops.map((crop) => (
                      <MenuItem key={crop._id} value={crop._id}>
                        {crop.title}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth>
                  <InputLabel
                    id="pest-select-label"
                    sx={{
                      fontSize: "1rem",
                    }}
                  >
                    Select Pest
                  </InputLabel>
                  <Select
                    labelId="pest-select-label"
                    name="pest_id"
                    value={formValues.pest_id}
                    onChange={handleInputChange}
                    
                    input={<OutlinedInput label="Select Pest" />}
                    sx={{
                      fontSize: "1rem",
                      padding: "10.5px 14px",
                      height: "45px",
                    }}
                  >
                    <MenuItem value="">Select a Pest</MenuItem>
                    {pests.map((pest) => (
                      <MenuItem key={pest._id} value={pest._id}>
                        {pest.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                  </MDBox>
                </CardContent>
              </Card>

              {/* Product Details Section */}
              <Card sx={{ mb: 3, boxShadow: 2 }}>
                <CardContent>
                  <Typography variant="h5" fontWeight="bold" color="primary" mb={2}>
                    📋 Product Details
                  </Typography>
                  <Divider sx={{ mb: 3 }} />
                  <MDBox mb={2}>
                    <TextField
                      fullWidth
                      label="Description"
                  name="description"
                  multiline
                  rows={4}
                  value={formValues.description}
                  onChange={handleInputChange}
                  required
                />
              </MDBox>
              <MDBox mb={2}>
                <TextField
                  fullWidth
                  label="Chemical Content"
                  name="chemical_content"
                  value={formValues.chemical_content}
                  onChange={handleInputChange}
                  required
                />
              </MDBox>
              <MDBox mb={2}>
                <TextField
                  fullWidth
                  label="Features & Benefits"
                  name="features_benefits"
                  value={formValues.features_benefits}
                  onChange={handleInputChange}
                  required
                />
              </MDBox>
              <MDBox mb={2}>
                <TextField
                  fullWidth
                  label="Mode of Action"
                  name="modes_of_use"
                  value={formValues.modes_of_use}
                  onChange={handleInputChange}
                  required
                />
              </MDBox>
              <MDBox mb={2}>
                <TextField
                  fullWidth
                  label="Method of Application"
                  name="method_of_application"
                  value={formValues.method_of_application}
                  onChange={handleInputChange}
                  required
                />
              </MDBox>
              <MDBox mb={2}>
                <TextField
                  fullWidth
                  label="Recommendations"
                  name="recommendations"
                  value={formValues.recommendations}
                  onChange={handleInputChange}
                  required
                />
                  </MDBox>
                </CardContent>
              </Card>

              {/* Stock & Delivery Section */}
              <Card sx={{ mb: 3, boxShadow: 2 }}>
                <CardContent>
                  <Typography variant="h5" fontWeight="bold" color="primary" mb={2}>
                    📦 Stock & Delivery
                  </Typography>
                  <Divider sx={{ mb: 3 }} />
                  <MDBox display="flex" gap={2} mb={2}>
                    <FormControl fullWidth>
                      <InputLabel
                        id="delivery-label"
                    sx={{
                      fontSize: "1rem",
                    }}
                  >
                    Delivery Method
                  </InputLabel>
                  <Select
                    labelId="delivery-label"
                    name="delivery_method"
                    value={formValues.delivery_method}
                    onChange={handleInputChange}
                    required
                    input={<OutlinedInput label="Select Delivery Method" />}
                    sx={{
                      fontSize: "1rem",
                      padding: "10.5px 14px",
                      height: "45px",
                    }}
                  >
                    <MenuItem value="">Select Delivery Method</MenuItem>
                    <MenuItem value="Available only in store">Available only in store</MenuItem>
                    <MenuItem value="Home Delivery Available">Home Delivery Available</MenuItem>
                  </Select>
                </FormControl>

                <FormControl fullWidth>
                  <InputLabel
                    id="stock-label"
                    sx={{
                      fontSize: "1rem",
                    }}
                  >
                    Stock Status
                  </InputLabel>
                  <Select
                    labelId="stock-label"
                    name="stock_status"
                    value={formValues.stock_status || ""}
                    onChange={handleInputChange}
                    required
                    input={<OutlinedInput label="Stock Status" />}
                    sx={{
                      fontSize: "1rem",
                      padding: "10.5px 14px",
                      height: "45px",
                    }}
                  >
                    <MenuItem value="">Stock status</MenuItem>
                    <MenuItem value="In stock">In stock</MenuItem>
                    <MenuItem value="Out of Stock">Out of Stock</MenuItem>
                  </Select>
                </FormControl>
                  </MDBox>
                </CardContent>
              </Card>

              {/* Related Products Section */}
              <Card sx={{ mb: 3, boxShadow: 2 }}>
                <CardContent>
                  <Typography variant="h5" fontWeight="bold" color="primary" mb={2}>
                    🔗 Related Products
                  </Typography>
                  <Divider sx={{ mb: 3 }} />
                  <MDBox display="flex" flexDirection="column" gap={2} mb={2}>
                    <Autocomplete
                       multiple
                       options={productsList}
                       getOptionLabel={(option) => option.title || ""}
                       value={formValues.products}
                       onChange={handleProductsChange}
                       renderInput={(params) => (
                         <TextField
                           {...params}
                           label="Buy Together"
                           InputProps={{
                             ...params.InputProps,
                             endAdornment: (
                               <>
                                 <InputAdornment position="end">
                                   <SearchIcon sx={{ color: "#ff9800" }} />
                                 </InputAdornment>
                                 {params.InputProps.endAdornment}
                               </>
                             ),
                           }}
                         />
                       )}
                     />
                      <Autocomplete
                       multiple
                       options={productsList}
                       getOptionLabel={(option) => option.title || ""}
                       value={formValues.products}
                       onChange={handleProductsChange}
                       renderInput={(params) => (
                         <TextField
                           {...params}
                           label="Same technical products"
                           InputProps={{
                             ...params.InputProps,
                             endAdornment: (
                               <>
                                 <InputAdornment position="end">
                                   <SearchIcon sx={{ color: "#ff9800" }} />
                                 </InputAdornment>
                                 {params.InputProps.endAdornment}
                               </>
                             ),
                           }}
                         />
                       )}
                     />
                  </MDBox>
                </CardContent>
              </Card>

              {/* Pricing & Commission Section */}
              <Card sx={{ mb: 3, boxShadow: 2 }}>
                <CardContent>
                  <Typography variant="h5" fontWeight="bold" color="primary" mb={2}>
                    💰 Pricing & Commission
                  </Typography>
                  <Divider sx={{ mb: 3 }} />
                  <MDBox display="flex" gap={2} mb={2}>
                    <TextField
                      fullWidth
                      label="Agent Commission (%)"
                  name="agent_commission"
                  value={formValues.agent_commission}
                  onChange={handleInputChange}
                  required
                    />
                    <TextField
                      fullWidth
                      label="Number of Items in Product"
                  name="numberOfItems"
                  type="number"
                  value={formValues.numberOfItems}
                  onChange={handleInputChange}
                  placeholder="How many units/items in this product"
                  helperText="Example: If product contains 10 bottles, enter 10"
                    />
                  </MDBox>
                </CardContent>
              </Card>

              {/* Package Quantity Section */}
              <Card sx={{ mb: 3, boxShadow: 2 }}>
                <CardContent>
                  <Typography variant="h5" fontWeight="bold" color="primary" mb={2}>
                    📦 Package Quantity
                  </Typography>
                  <Divider sx={{ mb: 3 }} />
                {formValues.package_qty.map((pkg, index) => (
                  <MDBox key={pkg._id || index} display="flex" gap={2} mb={1} alignItems="center">
                    <TextField
                      fullWidth
                      label="Package Name"
                      value={pkg.pkgName}
                      onChange={(e) => handlePackageQtyChange(index, "pkgName", e.target.value)}
                      required
                    />
                    <TextField
                      fullWidth
                      label="Quantity"
                      value={pkg.qty}
                      onChange={(e) => handlePackageQtyChange(index, "qty", e.target.value)}
                      required
                    />
                    <TextField
                      fullWidth
                      label="MRP Price"
                      value={pkg.mrp_price}
                      onChange={(e) => handlePackageQtyChange(index, "mrp_price", e.target.value)}
                      required
                    />
                    <TextField
                      fullWidth
                      label="Sell Price"
                      value={pkg.sell_price}
                      onChange={(e) => handlePackageQtyChange(index, "sell_price", e.target.value)}
                      required
                    />
                    <TextField
                      fullWidth
                      label="Mfg Date"
                      type="date"
                      InputLabelProps={{ shrink: true }}
                      value={pkg.mfg_date}
                      onChange={(e) => handlePackageQtyChange(index, "mfg_date", e.target.value)}
                    />
                    <TextField
                      fullWidth
                      label="Exp Date"
                      type="date"
                      InputLabelProps={{ shrink: true }}
                      value={pkg.exp_date}
                      onChange={(e) => handlePackageQtyChange(index, "exp_date", e.target.value)}
                    />
                    <IconButton
                      color="error"
                      onClick={() => deletePackageQtyField(index)}
                      aria-label="delete"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </MDBox>
                  ))}
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    style={{ color: "#fff", marginTop: "16px" }}
                    onClick={addPackageQtyField}
                  >
                    Add More Package
                  </Button>
                </CardContent>
              </Card>
              {/* Retailer Package Quantity Section */}
              <Card sx={{ mb: 3, boxShadow: 2 }}>
                <CardContent>
                  <Typography variant="h5" fontWeight="bold" color="primary" mb={2}>
                    🏪 Retailer Package Quantity
                  </Typography>
                  <Divider sx={{ mb: 3 }} />
                {formValues.retailer_package_qty.map((pkg, index) => (
                  <MDBox key={pkg._id || index} display="flex" gap={2} mb={1} alignItems="center">
                    <TextField
                      fullWidth
                      label="Package Name"
                      value={pkg.pkgName}
                      onChange={(e) =>
                        handleRetailerPackageQtyChange(index, "pkgName", e.target.value)
                      }
                      required
                    />
                    <TextField
                      fullWidth
                      label="Quantity"
                      value={pkg.qty}
                      onChange={(e) => handleRetailerPackageQtyChange(index, "qty", e.target.value)}
                      required
                    />
                    <TextField
                      fullWidth
                      label="MRP Price"
                      value={pkg.mrp_price}
                      onChange={(e) =>
                        handleRetailerPackageQtyChange(index, "mrp_price", e.target.value)
                      }
                      required
                    />
                    <TextField
                      fullWidth
                      label="Sell Price"
                      value={pkg.sell_price}
                      onChange={(e) =>
                        handleRetailerPackageQtyChange(index, "sell_price", e.target.value)
                      }
                      required
                    />
                    <TextField
                      fullWidth
                      label="Mfg Date"
                      type="date"
                      InputLabelProps={{ shrink: true }}
                      value={pkg.mfg_date}
                      onChange={(e) =>
                        handleRetailerPackageQtyChange(index, "mfg_date", e.target.value)
                      }
                    />
                    <TextField
                      fullWidth
                      label="Exp Date"
                      type="date"
                      InputLabelProps={{ shrink: true }}
                      value={pkg.exp_date}
                      onChange={(e) =>
                        handleRetailerPackageQtyChange(index, "exp_date", e.target.value)
                      }
                    />
                    <IconButton
                      color="error"
                      onClick={() => deleteRetailerPackageQtyField(index)}
                      aria-label="delete"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </MDBox>
                  ))}
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    style={{ color: "#fff", marginTop: "16px" }}
                    onClick={addRetailerPackageQtyField}
                  >
                    Add More Retailer Package
                  </Button>
                </CardContent>
              </Card>
              {/* Product Images Section */}
              <Card sx={{ mb: 3, boxShadow: 2 }}>
                <CardContent>
                  <Typography variant="h5" fontWeight="bold" color="primary" mb={2}>
                    📸 Product Images
                  </Typography>
                  <Divider sx={{ mb: 3 }} />
                  <Typography variant="body2" color="text.secondary" mb={2}>
                    Please select exactly 3 images for this product
                  </Typography>
                  <TextField 
                    fullWidth 
                    type="file" 
                    inputProps={{ multiple: true, accept: "image/*" }}
                    onChange={handleFileChange} 
                    required
                    sx={{ mb: 2 }}
                  />
                  {formValues.images.length > 0 && (
                    <Box sx={{ p: 2, bgcolor: "success.lighter", borderRadius: 1 }}>
                      <Typography variant="body2" color="success.main" fontWeight="medium">
                        ✓ Selected {formValues.images.length} image(s): {formValues.images.map(img => img.name).join(", ")}
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>

              {/* Submit Button */}
              <MDBox mb={3} display="flex" justifyContent="center">
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  size="large"
                  style={{ color: "#fff", minWidth: "200px", padding: "12px 48px" }}
                  disabled={loading}
                >
                  {loading ? "Adding Product..." : "✓ Add Product"}
                </Button>
              </MDBox>
              <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
                <Alert
                  onClose={handleClose}
                  severity={alertMessage.includes("success") ? "success" : "error"}
                >
                  {alertMessage}
                </Alert>
              </Snackbar>
            </form>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default ProductForm;

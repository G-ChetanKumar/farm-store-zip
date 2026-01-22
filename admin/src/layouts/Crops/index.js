import SearchIcon from "@mui/icons-material/Search";
import { Alert, Snackbar } from "@mui/material"; // Import Snackbar for positioning
import Autocomplete from "@mui/material/Autocomplete";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import InputAdornment from "@mui/material/InputAdornment";
import TextField from "@mui/material/TextField";
import apiClient from "api/axios";
import MDBox from "components/MDBox";
import Footer from "examples/Footer";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// Custom crop form component
function CropForm() {
  const [formValues, setFormValues] = useState({
    title: "",
    image: null,
    products: [],
  });
  const [loading, setLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState(""); // State to handle alert message
  const [open, setOpen] = useState(false); // State to manage snackbar visibility
  const [productsList, setProductsList] = useState([]);

  useEffect(() => {
    // Fetch products for autocomplete
    axios
      .get(`${BASE_URL}/api/product/get-product`)
      .then((res) => setProductsList(res.data))
      .catch(() => setProductsList([]));
  }, []);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormValues((prevValues) => ({
      ...prevValues,
      [name]: value,
    }));
  };

  const handleProductsChange = (event, value) => {
    setFormValues((prevValues) => ({
      ...prevValues,
      products: value,
    }));
  };

  const handleFileChange = (event) => {
    setFormValues((prevValues) => ({
      ...prevValues,
      image: event.target.files[0],
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData();
    formData.append("title", formValues.title);
    formData.append("file", formValues.image);
    // Add selected product IDs
    formValues.products.forEach((prod) => {
      formData.append("products[]", prod._id);
    });

    setLoading(true);
    try {
      const response = await apiClient.post("/api/crop/add-crop",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      console.log("crop added successfully:", response.data);

      // Show success alert
      setAlertMessage("crop added successfully!");
      setOpen(true);

      // Reset form after successful submission
      setFormValues({
        title: "",
        image: null,
        products: [],
      });
    } catch (error) {
      console.error("Error adding crop:", error);

      // Show error alert
      setAlertMessage("Failed to add crop. Please try again.");
      setOpen(true);
    }
    setLoading(false);
  };

  const handleClose = () => {
    setOpen(false); // Close the snackbar
  };

  return (
    <form onSubmit={handleSubmit}>
      <MDBox mb={2}>
        <TextField
          fullWidth
          label="Title"
          name="title"
          value={formValues.title}
          onChange={handleInputChange}
          required
        />
      </MDBox>
      <MDBox mb={2}>
        <Autocomplete
          multiple
          options={productsList}
          getOptionLabel={(option) => option.title || ""}
          value={formValues.products}
          onChange={handleProductsChange}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Add Products"
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
      <MDBox mb={2}>
        <span>Select Image</span>
        <TextField
          type="file"
          fullWidth
          name="image"
          inputProps={{ accept: "image/*" }}
          onChange={handleFileChange}
          required
        />
      </MDBox>
      <MDBox>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          style={{ color: "#fff" }}
          disabled={loading}
        >
          {loading ? "Uploading..." : "Add New Crop"}
        </Button>
      </MDBox>

      <Snackbar
        open={open}
        autoHideDuration={3000}
        onClose={handleClose}
        anchorOrigin={{ vertical: "top", horizontal: "right" }} // Position at top right
      >
        <Alert
          onClose={handleClose}
          severity={alertMessage.includes("successfully") ? "success" : "error"}
        >
          {alertMessage}
        </Alert>
      </Snackbar>
    </form>
  );
}

function cropPage() {
  const navigate = useNavigate();
  
  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <MDBox
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={3}
            >
              <h2>Add New Crop</h2>
              <Button
                onClick={() => navigate("/Crops")}
                variant="contained"
                color="primary"
                style={{ color: "#fff" }} // Explicitly set the text color to white
              >
                Back to Crops
              </Button>
            </MDBox>
            <CropForm />
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default cropPage;

import { Alert, MenuItem, Snackbar } from "@mui/material"; // Import Snackbar for positioning
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import apiClient from "api/axios";
import MDBox from "components/MDBox";
import Footer from "examples/Footer";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function CategoryForm({ fetchCategories }) {
  const [formValues, setFormValues] = useState({
    title: "",
    // sub_title: "",
    // description: "",
    super_cat_id: "",
    image: "",
  });
  const [superCategories, setSuperCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState(""); // State to handle alert message
  const [open, setOpen] = useState(false); // State to manage snackbar visibility

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormValues((prevValues) => ({
      ...prevValues,
      [name]: value,
    }));
  };
  useEffect(() => {
    // Fetch supercategories
    const fetchSuperCategories = async () => {
      try {
        const response = await apiClient.get("/api/super-category/get-super-category");
        setSuperCategories(response.data);
      } catch (error) {
        console.error("Error fetching supercategories:", error);
      }
    };
    fetchSuperCategories();
  }, []);

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
    formData.append("super_cat_id", formValues.super_cat_id);
    if (formValues.image) {
      formData.append("file", formValues.image);
    }

    setLoading(true);
    try {
      // Add new category
      await apiClient.post("/api/category/add-category", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      console.log("Category added successfully");

      fetchCategories();

      setFormValues({
        title: "",
        super_cat_id: "",
        image: null,
      });

      setAlertMessage("Category added successfully!");
      setOpen(true);
    } catch (error) {
      console.error("Error adding category:", error);

      setAlertMessage("Failed to add category. Please try again.");
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
        <TextField
          select
          fullWidth
          label="Select Super Category"
          name="super_cat_id"
          value={formValues.super_cat_id}
          onChange={handleInputChange}
          required
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: "8px",
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "#ced4da",
              },
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: "#80bdff",
              },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: "#007bff",
              },
              fontSize: "1rem",
              padding: "9px 14px",
              height: "46px",
            },
          }}
        >
          {superCategories.map((category) => (
            <MenuItem key={category._id} value={category._id}>
              {category.title}
            </MenuItem>
          ))}
        </TextField>
      </MDBox>
      <MDBox mb={2}>
        <span>Select Image</span>
        <TextField
          type="file"
          fullWidth
          name="image"
          inputProps={{ accept: "image/*" }}
          onChange={handleFileChange}
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
          {loading ? "Processing..." : "Add Category"}
        </Button>
      </MDBox>

      {/* Snackbar for alert message */}
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

function CategoryPage() {
  const navigate = useNavigate();
  const fetchCategories = async () => {
    // Function to fetch categories after posting (placeholder for now)
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <h2>Add New Category</h2>
              <Button
                onClick={() => navigate("/category")}
                variant="contained"
                color="primary"
                style={{ color: "#fff" }} // Explicitly set the text color to white
              >
                Back to Categories
              </Button>
            </MDBox>

            <CategoryForm fetchCategories={fetchCategories} />
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default CategoryPage;

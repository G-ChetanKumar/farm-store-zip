import { Alert, Autocomplete, Button, Grid, Snackbar, TextField } from "@mui/material";
import apiClient from "api/axios";
import MDBox from "components/MDBox";
import Footer from "examples/Footer";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function SubCategoryForm() {
  const [formValues, setFormValues] = useState({
    title: "",
    super_cat_id: "",
    category_id: "", // New field for category selection
    image: null,
  });
  const [categories, setCategories] = useState([]); // State to hold fetched categories
  const [superCategories, setSuperCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState(""); // State to handle alert message
  const [open, setOpen] = useState(false); // State to manage Snackbar visibility

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

  // Fetch available categories when the component mounts
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await apiClient.get("/api/category/get-category");
        setCategories(response.data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormValues((prevValues) => ({
      ...prevValues,
      [name]: value,
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
    formData.append("super_cat_id", formValues.super_cat_id);
    formData.append("category_id", formValues.category_id); // Add category_id to the form data
    formData.append("file", formValues.image);

    setLoading(true);
    try {
      const response = await apiClient.post("/api/subcategory/add-sub-category", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      console.log("Sub Category added successfully:", response.data);

      // Show success message
      setAlertMessage("Sub Category added successfully!");
      setOpen(true);

      // Reset form after successful submission
      setFormValues({
        title: "",
        super_cat_id: "",
        category_id: "",
        image: null,
      });
    } catch (error) {
      console.error("Error adding Sub category:", error);

      // Show error message
      setAlertMessage("Failed to add Sub Category. Please try again.");
      setOpen(true);
    }
    setLoading(false);
  };

  const handleClose = () => {
    setOpen(false); // Close the Snackbar
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
          options={superCategories}
          getOptionLabel={(option) => option.title || ""}
          value={superCategories.find((superCategory) => superCategory._id === formValues.super_cat_id) || null}
          onChange={(event, newValue) =>
            handleInputChange({
              target: { name: "super_cat_id", value: newValue ? newValue._id : "" },
            })
          }
          renderInput={(params) => (
            <TextField
              {...params}
              label="Select SuperCategory"
              variant="outlined"
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
                  padding: "10.5px 14px",
                  height: "56px",
                },
              }}
            />
          )}
          isOptionEqualToValue={(option, value) => option._id === value._id}
        />
      </MDBox>
      <MDBox mb={2}>
        <Autocomplete
          options={categories}
          getOptionLabel={(option) => option.title || ""}
          value={categories.find((category) => category._id === formValues.category_id) || null}
          onChange={(event, newValue) =>
            handleInputChange({
              target: { name: "category_id", value: newValue ? newValue._id : "" },
            })
          }
          renderInput={(params) => (
            <TextField
              {...params}
              label="Select Category"
              variant="outlined"
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
                  padding: "10.5px 14px",
                  height: "56px",
                },
              }}
            />
          )}
          isOptionEqualToValue={(option, value) => option._id === value._id}
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
          {loading ? "Uploading..." : "Add Sub-Category"}
        </Button>
      </MDBox>

      <Snackbar
        open={open}
        autoHideDuration={3000}
        onClose={handleClose}
        anchorOrigin={{ vertical: "top", horizontal: "right" }} // Position Snackbar at top-right
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

function Subcategory() {
  const navigate = useNavigate();
  
  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <h2>Add New SubCategory</h2>
              <Button
                onClick={() => navigate("/Subcategory")}
                variant="contained"
                color="primary"
                style={{ color: "#fff" }} // Explicitly set the text color to white
              >
                Back to Subcategories
              </Button>
            </MDBox>
            <SubCategoryForm />
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default Subcategory;

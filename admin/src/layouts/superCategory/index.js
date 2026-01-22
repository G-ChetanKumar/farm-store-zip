import { Alert, Snackbar } from "@mui/material"; // Import Snackbar for positioning
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import apiClient from "api/axios";
import MDBox from "components/MDBox";
import Footer from "examples/Footer";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function SuperCategoryForm({ fetchCategories }) {
  const [formValues, setFormValues] = useState({
    title: "",
    // sub_title: "",
    // description: "",
    image: null,
  });
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
    // formData.append("sub_title", formValues.sub_title);
    // formData.append("description", formValues.description);

    if (formValues.image) {
      formData.append("file", formValues.image);
    }

    setLoading(true);
    try {
      // Add new category
      await apiClient.post("/api/super-category/add-super-category", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      console.log("SuperCategory added successfully");

      fetchCategories(); // Fetch categories after adding

      // Reset form after successful submission
      setFormValues({
        title: "",
        // sub_title: "",
        // description: "",
        image: null,
      });

      // Show success alert message
      setAlertMessage("Category added successfully!");
      setOpen(true); // Show the snackbar
    } catch (error) {
      console.error("Error adding category:", error);

      // Show error alert message
      setAlertMessage("Failed to add Super Category. Please try again.");
      setOpen(true); // Show the snackbar
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
      {/* <MDBox mb={2}>
        <TextField
          fullWidth
          label="Sub Title"
          name="sub_title"
          value={formValues.sub_title}
          onChange={handleInputChange}
          required
        />
      </MDBox> */}
      {/* <MDBox mb={2}>
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
      </MDBox> */}
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
          {loading ? "Processing..." : "Add Super Category"}
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

function SuperCategory() {
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
              <h2>Add New Super Category</h2>
              <Button
                onClick={() => navigate("/supercategory")}
                variant="contained"
                color="primary"
                style={{ color: "#fff" }} // Explicitly set the text color to white
              >
                Back to Super Categories
              </Button>
            </MDBox>

            <SuperCategoryForm fetchCategories={fetchCategories} />
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default SuperCategory;

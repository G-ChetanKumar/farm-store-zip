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

function CounterForm({ fetchCounters }) {
  const [formValues, setFormValues] = useState({
    pinCode: "",
    counterName: "",
    agentName: "",
    address: "",
    landMark: "",
    location_direction: "",
    agentNumber: "",
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
    formData.append("pinCode", formValues.pinCode);
    formData.append("counterName", formValues.counterName);
    formData.append("agentName", formValues.agentName);
    formData.append("address", formValues.address);
    formData.append("landMark", formValues.landMark);
    formData.append("location_direction", formValues.location_direction);
    formData.append("agentNumber", formValues.agentNumber);

    if (formValues.image) {
      formData.append("file", formValues.image);
    }

    setLoading(true);
    try {
      // Add new counter
      await apiClient.post("/api/counter/add-counter", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      console.log("Counter added successfully");

      fetchCounters(); // Fetch Counters after adding

      // Reset form after successful submission
      setFormValues({
        pinCode: "",
        counterName: "",
        agentName: "",
        address: "",
        landMark: "",
        location_direction: "",
        agentNumber: "",
    
      });

      // Show success alert message
      setAlertMessage("  counter added successfully!");
      setOpen(true); // Show the snackbar
    } catch (error) {
      console.error("Error adding counter:", error);

      // Show error alert message
      setAlertMessage("Failed to add Counter. Please try again.");
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
          label="Pin Code"
          name="pinCode"
          value={formValues.pinCode}
          onChange={handleInputChange}
          required
        />
      </MDBox>
     <MDBox mb={2}>
        <TextField
          fullWidth
          label="Counter Name"
          name="counterName"
          value={formValues.counterName}
          onChange={handleInputChange}
          required
        />
      </MDBox>
      <MDBox mb={2}>
        <TextField
          fullWidth
          label="Employee Name"
          name="agentName"
          value={formValues.agentName}
          onChange={handleInputChange}
          required
        />
      </MDBox>
      <MDBox mb={2}>
        <TextField
          fullWidth
          label="Address"
          name="address"
          value={formValues.address}
          onChange={handleInputChange}
          required
        />
      </MDBox>
      <MDBox mb={2}>
        <TextField
          fullWidth
          label="Landmark"
          name="landMark"
          value={formValues.landMark}
          onChange={handleInputChange}
          required
        />
      </MDBox>
      <MDBox mb={2}>
        <TextField
          fullWidth
          label="Add Location for Directions"
          name="location_direction"
          value={formValues.location_direction}
          onChange={handleInputChange}
          required
        />
      </MDBox>
      <MDBox mb={2}>
        <TextField
          fullWidth
          label="Employee Number"
          name="agentNumber"
          value={formValues.agentNumber}
          onChange={handleInputChange}
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
          {loading ? "Processing..." : "Add Counter"}
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

function Counter() {
  const navigate = useNavigate();
  const fetchCounters = async () => {
    // Function to fetch Counters after posting (placeholder for now)
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <h2>Add New Store</h2>
              <Button
                onClick={() => navigate("/counter")}
                variant="contained"
                color="primary"
                style={{ color: "#fff" }} // Explicitly set the text color to white
              >
                Back to Stores
              </Button>
            </MDBox>

            <CounterForm fetchCounters={fetchCounters} />
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default Counter;

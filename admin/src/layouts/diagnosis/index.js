import { useState, useEffect } from "react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import MDInput from "components/MDInput";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import IconButton from "@mui/material/IconButton";
import Icon from "@mui/material/Icon";
import { toast } from "react-toastify";
import apiClient from "api/axios";
import Chip from "@mui/material/Chip";
import Tooltip from "@mui/material/Tooltip";
import Badge from "@mui/material/Badge";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";

function CropDiagnosisManagement() {
  const [diagnoses, setDiagnoses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDiagnoseDialog, setOpenDiagnoseDialog] = useState(false);
  const [selectedDiagnosis, setSelectedDiagnosis] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [filterSeverity, setFilterSeverity] = useState("all");

  // Statistics
  const [stats, setStats] = useState({
    totalDiagnoses: 0,
    pendingDiagnoses: 0,
    diagnosedCases: 0,
    resolvedCases: 0,
    overdueCases: 0,
    highPriorityCases: 0,
  });

  // Diagnosis form
  const [diagnosisFormData, setDiagnosisFormData] = useState({
    diagnosed_disease: "",
    disease_description: "",
    treatment_recommendations: "",
    prevention_measures: "",
    expected_recovery_time: "",
  });

  // Fetch diagnoses
  const fetchDiagnoses = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterStatus !== "all") params.append("status", filterStatus);
      if (filterPriority !== "all") params.append("priority", filterPriority);
      if (filterSeverity !== "all") params.append("severity", filterSeverity);
      if (searchTerm) params.append("search", searchTerm);

      const response = await apiClient.get(`/api/diagnosis/get-diagnoses?${params}`);
      setDiagnoses(response.data.diagnoses || []);
    } catch (error) {
      console.error("Error fetching diagnoses:", error);
      toast.error("Failed to fetch diagnoses");
    } finally {
      setLoading(false);
    }
  };

  // Fetch statistics
  const fetchStats = async () => {
    try {
      const response = await apiClient.get("/api/diagnosis/stats");
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  useEffect(() => {
    fetchDiagnoses();
    fetchStats();
  }, [filterStatus, filterPriority, filterSeverity]);

  // Handle search
  const handleSearch = () => {
    fetchDiagnoses();
  };

  // Open detail dialog
  const handleOpenDetail = (diagnosis) => {
    setSelectedDiagnosis(diagnosis);
    setOpenDialog(true);
  };

  // Open diagnose dialog
  const handleOpenDiagnose = (diagnosis) => {
    setSelectedDiagnosis(diagnosis);
    setDiagnosisFormData({
      diagnosed_disease: diagnosis.diagnosed_disease || "",
      disease_description: diagnosis.disease_description || "",
      treatment_recommendations: diagnosis.treatment_recommendations || "",
      prevention_measures: diagnosis.prevention_measures || "",
      expected_recovery_time: diagnosis.expected_recovery_time || "",
    });
    setOpenDiagnoseDialog(true);
  };

  // Submit diagnosis
  const handleSubmitDiagnosis = async () => {
    try {
      if (!diagnosisFormData.diagnosed_disease) {
        toast.error("Please provide disease name");
        return;
      }

      await apiClient.post(`/api/diagnosis/${selectedDiagnosis._id}/add-diagnosis`,
        {
          diagnosis_data: diagnosisFormData,
          expert_info: {
            expert_id: null,
            expert_name: "Admin",
            diagnosis_date: new Date(),
          },
        }
      );

      toast.success("Diagnosis submitted successfully");
      setOpenDiagnoseDialog(false);
      fetchDiagnoses();
      fetchStats();
    } catch (error) {
      console.error("Error submitting diagnosis:", error);
      toast.error("Failed to submit diagnosis");
    }
  };

  // Update status
  const handleUpdateStatus = async (diagnosisId, newStatus) => {
    try {
      await apiClient.put(`/api/diagnosis/${diagnosisId}/update-status`, {
        status: newStatus,
        updated_by: "Admin",
      });
      toast.success("Status updated successfully");
      fetchDiagnoses();
      fetchStats();
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    }
  };

  // Status colors
  const getStatusConfig = (status) => {
    const configs = {
      pending: { color: "warning", label: "Pending" },
      under_review: { color: "info", label: "Under Review" },
      diagnosed: { color: "primary", label: "Diagnosed" },
      resolved: { color: "success", label: "Resolved" },
      closed: { color: "default", label: "Closed" },
    };
    return configs[status] || configs.pending;
  };

  // Priority colors
  const getPriorityConfig = (priority) => {
    const configs = {
      low: { color: "default", icon: "arrow_downward" },
      medium: { color: "info", icon: "remove" },
      high: { color: "warning", icon: "arrow_upward" },
      urgent: { color: "error", icon: "priority_high" },
    };
    return configs[priority] || configs.low;
  };

  // Severity colors
  const getSeverityConfig = (severity) => {
    const configs = {
      minor: { color: "default" },
      moderate: { color: "info" },
      severe: { color: "warning" },
      critical: { color: "error" },
    };
    return configs[severity] || configs.minor;
  };

  // Table columns
  const columns = [
    {
      Header: "Request ID",
      accessor: "request_id",
      width: "10%",
      align: "left",
      Cell: ({ row }) => (
        <MDTypography variant="caption" fontWeight="medium">
          #{row.original._id?.slice(-6).toUpperCase()}
        </MDTypography>
      ),
    },
    {
      Header: "Farmer",
      accessor: "farmer",
      align: "left",
      Cell: ({ row }) => (
        <MDBox>
          <MDTypography variant="button" fontWeight="medium">
            {row.original.farmer_name}
          </MDTypography>
          <MDTypography variant="caption" color="text" display="block">
            {row.original.farmer_contact}
          </MDTypography>
        </MDBox>
      ),
    },
    {
      Header: "Crop",
      accessor: "crop_name",
      align: "left",
    },
    {
      Header: "Problem",
      accessor: "problem_description",
      align: "left",
      Cell: ({ row }) => (
        <MDTypography variant="caption">
          {row.original.problem_description?.substring(0, 50)}...
        </MDTypography>
      ),
    },
    {
      Header: "Status",
      accessor: "diagnosis_status",
      align: "center",
      Cell: ({ row }) => {
        const config = getStatusConfig(row.original.diagnosis_status);
        return <Chip label={config.label} size="small" color={config.color} />;
      },
    },
    {
      Header: "Priority",
      accessor: "priority",
      align: "center",
      Cell: ({ row }) => {
        const config = getPriorityConfig(row.original.priority);
        return (
          <Chip
            icon={<Icon fontSize="small">{config.icon}</Icon>}
            label={row.original.priority.toUpperCase()}
            size="small"
            color={config.color}
          />
        );
      },
    },
    {
      Header: "Severity",
      accessor: "severity",
      align: "center",
      Cell: ({ row }) => {
        const config = getSeverityConfig(row.original.severity);
        return (
          <Chip
            label={row.original.severity.toUpperCase()}
            size="small"
            color={config.color}
          />
        );
      },
    },
    {
      Header: "Date",
      accessor: "createdAt",
      align: "center",
      Cell: ({ row }) => (
        <MDTypography variant="caption">
          {new Date(row.original.createdAt).toLocaleDateString()}
        </MDTypography>
      ),
    },
    {
      Header: "Actions",
      accessor: "actions",
      align: "center",
      Cell: ({ row }) => (
        <MDBox display="flex" gap={1} justifyContent="center">
          <Tooltip title="View Details">
            <IconButton
              onClick={() => handleOpenDetail(row.original)}
              size="small"
              color="info"
            >
              <Icon>visibility</Icon>
            </IconButton>
          </Tooltip>
          {row.original.diagnosis_status !== "diagnosed" &&
            row.original.diagnosis_status !== "resolved" && (
              <Tooltip title="Add Diagnosis">
                <IconButton
                  onClick={() => handleOpenDiagnose(row.original)}
                  size="small"
                  color="success"
                >
                  <Icon>medical_services</Icon>
                </IconButton>
              </Tooltip>
            )}
          {row.original.diagnosis_status === "diagnosed" && (
            <Tooltip title="Mark Resolved">
              <IconButton
                onClick={() => handleUpdateStatus(row.original._id, "resolved")}
                size="small"
                color="success"
              >
                <Icon>check_circle</Icon>
              </IconButton>
            </Tooltip>
          )}
        </MDBox>
      ),
    },
  ];

  const rows = diagnoses;

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        {/* Statistics Cards */}
        <Grid container spacing={3} mb={3}>
          <Grid item xs={12} md={2}>
            <Card>
              <MDBox p={3} textAlign="center">
                <MDTypography variant="h4" fontWeight="bold" color="info">
                  {stats.totalDiagnoses}
                </MDTypography>
                <MDTypography variant="caption" color="text">
                  Total Requests
                </MDTypography>
              </MDBox>
            </Card>
          </Grid>
          <Grid item xs={12} md={2}>
            <Card>
              <MDBox p={3} textAlign="center">
                <Badge badgeContent={stats.overdueCases} color="error">
                  <MDTypography variant="h4" fontWeight="bold" color="warning">
                    {stats.pendingDiagnoses}
                  </MDTypography>
                </Badge>
                <MDTypography variant="caption" color="text">
                  Pending
                </MDTypography>
              </MDBox>
            </Card>
          </Grid>
          <Grid item xs={12} md={2}>
            <Card>
              <MDBox p={3} textAlign="center">
                <MDTypography variant="h4" fontWeight="bold" color="primary">
                  {stats.diagnosedCases}
                </MDTypography>
                <MDTypography variant="caption" color="text">
                  Diagnosed
                </MDTypography>
              </MDBox>
            </Card>
          </Grid>
          <Grid item xs={12} md={2}>
            <Card>
              <MDBox p={3} textAlign="center">
                <MDTypography variant="h4" fontWeight="bold" color="success">
                  {stats.resolvedCases}
                </MDTypography>
                <MDTypography variant="caption" color="text">
                  Resolved
                </MDTypography>
              </MDBox>
            </Card>
          </Grid>
          <Grid item xs={12} md={2}>
            <Card>
              <MDBox p={3} textAlign="center">
                <MDTypography variant="h4" fontWeight="bold" color="error">
                  {stats.highPriorityCases}
                </MDTypography>
                <MDTypography variant="caption" color="text">
                  High Priority
                </MDTypography>
              </MDBox>
            </Card>
          </Grid>
          <Grid item xs={12} md={2}>
            <Card>
              <MDBox p={3} textAlign="center">
                <MDTypography variant="h4" fontWeight="bold" color="dark">
                  {stats.overdueCases}
                </MDTypography>
                <MDTypography variant="caption" color="text">
                  Overdue
                </MDTypography>
              </MDBox>
            </Card>
          </Grid>
        </Grid>

        {/* Main Content */}
        <Card>
          <MDBox p={3}>
            <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <MDTypography variant="h5" fontWeight="medium">
                Crop Diagnosis Management
              </MDTypography>
            </MDBox>

            {/* Filters */}
            <Grid container spacing={2} mb={3}>
              <Grid item xs={12} md={3}>
                <MDInput
                  fullWidth
                  placeholder="Search farmer, crop, or problem..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  InputProps={{
                    endAdornment: (
                      <IconButton onClick={handleSearch}>
                        <Icon>search</Icon>
                      </IconButton>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    label="Status"
                    sx={{ fontSize: "1rem", padding: "10.5px 14px", height: "45px" }}
                  >
                    <MenuItem value="all">All Status</MenuItem>
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="under_review">Under Review</MenuItem>
                    <MenuItem value="diagnosed">Diagnosed</MenuItem>
                    <MenuItem value="resolved">Resolved</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={2}>
                <FormControl fullWidth>
                  <InputLabel>Priority</InputLabel>
                  <Select
                    value={filterPriority}
                    onChange={(e) => setFilterPriority(e.target.value)}
                    label="Priority"
                    sx={{ fontSize: "1rem", padding: "10.5px 14px", height: "45px" }}
                  >
                    <MenuItem value="all">All Priority</MenuItem>
                    <MenuItem value="low">Low</MenuItem>
                    <MenuItem value="medium">Medium</MenuItem>
                    <MenuItem value="high">High</MenuItem>
                    <MenuItem value="urgent">Urgent</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={2}>
                <FormControl fullWidth>
                  <InputLabel>Severity</InputLabel>
                  <Select
                    value={filterSeverity}
                    onChange={(e) => setFilterSeverity(e.target.value)}
                    label="Severity"
                    sx={{ fontSize: "1rem", padding: "10.5px 14px", height: "45px" }}
                  >
                    <MenuItem value="all">All Severity</MenuItem>
                    <MenuItem value="minor">Minor</MenuItem>
                    <MenuItem value="moderate">Moderate</MenuItem>
                    <MenuItem value="severe">Severe</MenuItem>
                    <MenuItem value="critical">Critical</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <MDButton
                  fullWidth
                  variant="outlined"
                  color="secondary"
                  onClick={() => {
                    setSearchTerm("");
                    setFilterStatus("all");
                    setFilterPriority("all");
                    setFilterSeverity("all");
                  }}
                >
                  Reset Filters
                </MDButton>
              </Grid>
            </Grid>

            {/* Table */}
            <DataTable
              table={{ columns, rows }}
              showTotalEntries={true}
              isSorted={true}
              noEndBorder
              entriesPerPage={true}
            />
          </MDBox>
        </Card>
      </MDBox>

      {/* Detail Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Diagnosis Request Details</DialogTitle>
        <DialogContent>
          {selectedDiagnosis && (
            <MDBox mt={2}>
              {/* Status Stepper */}
              <Stepper
                activeStep={
                  ["pending", "under_review", "diagnosed", "resolved"].indexOf(
                    selectedDiagnosis.diagnosis_status
                  )
                }
                alternativeLabel
                sx={{ mb: 3 }}
              >
                <Step>
                  <StepLabel>Pending</StepLabel>
                </Step>
                <Step>
                  <StepLabel>Under Review</StepLabel>
                </Step>
                <Step>
                  <StepLabel>Diagnosed</StepLabel>
                </Step>
                <Step>
                  <StepLabel>Resolved</StepLabel>
                </Step>
              </Stepper>

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <MDTypography variant="caption" color="text">
                    Farmer Name
                  </MDTypography>
                  <MDTypography variant="button" fontWeight="medium">
                    {selectedDiagnosis.farmer_name}
                  </MDTypography>
                </Grid>
                <Grid item xs={6}>
                  <MDTypography variant="caption" color="text">
                    Contact
                  </MDTypography>
                  <MDTypography variant="button" fontWeight="medium">
                    {selectedDiagnosis.farmer_contact}
                  </MDTypography>
                </Grid>
                <Grid item xs={6}>
                  <MDTypography variant="caption" color="text">
                    Crop Name
                  </MDTypography>
                  <MDTypography variant="button" fontWeight="medium">
                    {selectedDiagnosis.crop_name}
                  </MDTypography>
                </Grid>
                <Grid item xs={6}>
                  <MDTypography variant="caption" color="text">
                    Location
                  </MDTypography>
                  <MDTypography variant="button" fontWeight="medium">
                    {selectedDiagnosis.location || "Not provided"}
                  </MDTypography>
                </Grid>
                <Grid item xs={12}>
                  <MDTypography variant="caption" color="text">
                    Problem Description
                  </MDTypography>
                  <MDTypography variant="body2">
                    {selectedDiagnosis.problem_description}
                  </MDTypography>
                </Grid>
                {selectedDiagnosis.diagnosed_disease && (
                  <>
                    <Grid item xs={12}>
                      <MDTypography variant="caption" color="text">
                        Diagnosed Disease
                      </MDTypography>
                      <MDTypography variant="h6" color="error">
                        {selectedDiagnosis.diagnosed_disease}
                      </MDTypography>
                    </Grid>
                    <Grid item xs={12}>
                      <MDTypography variant="caption" color="text">
                        Treatment Recommendations
                      </MDTypography>
                      <MDTypography variant="body2">
                        {selectedDiagnosis.treatment_recommendations}
                      </MDTypography>
                    </Grid>
                    <Grid item xs={12}>
                      <MDTypography variant="caption" color="text">
                        Prevention Measures
                      </MDTypography>
                      <MDTypography variant="body2">
                        {selectedDiagnosis.prevention_measures}
                      </MDTypography>
                    </Grid>
                  </>
                )}
              </Grid>
            </MDBox>
          )}
        </DialogContent>
        <DialogActions>
          <MDButton onClick={() => setOpenDialog(false)} color="secondary">
            Close
          </MDButton>
        </DialogActions>
      </Dialog>

      {/* Diagnose Dialog */}
      <Dialog
        open={openDiagnoseDialog}
        onClose={() => setOpenDiagnoseDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Add Diagnosis & Treatment</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} mt={1}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Disease Name *"
                value={diagnosisFormData.diagnosed_disease}
                onChange={(e) =>
                  setDiagnosisFormData({
                    ...diagnosisFormData,
                    diagnosed_disease: e.target.value,
                  })
                }
                placeholder="e.g., Late Blight, Powdery Mildew"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Disease Description"
                value={diagnosisFormData.disease_description}
                onChange={(e) =>
                  setDiagnosisFormData({
                    ...diagnosisFormData,
                    disease_description: e.target.value,
                  })
                }
                placeholder="Describe the disease and its symptoms..."
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Treatment Recommendations *"
                value={diagnosisFormData.treatment_recommendations}
                onChange={(e) =>
                  setDiagnosisFormData({
                    ...diagnosisFormData,
                    treatment_recommendations: e.target.value,
                  })
                }
                placeholder="Recommended treatment methods, products, and dosage..."
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Prevention Measures"
                value={diagnosisFormData.prevention_measures}
                onChange={(e) =>
                  setDiagnosisFormData({
                    ...diagnosisFormData,
                    prevention_measures: e.target.value,
                  })
                }
                placeholder="How to prevent this disease in future..."
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Expected Recovery Time"
                value={diagnosisFormData.expected_recovery_time}
                onChange={(e) =>
                  setDiagnosisFormData({
                    ...diagnosisFormData,
                    expected_recovery_time: e.target.value,
                  })
                }
                placeholder="e.g., 7-10 days with proper treatment"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <MDButton onClick={() => setOpenDiagnoseDialog(false)} color="secondary">
            Cancel
          </MDButton>
          <MDButton onClick={handleSubmitDiagnosis} variant="gradient" color="success">
            Submit Diagnosis
          </MDButton>
        </DialogActions>
      </Dialog>

      <Footer />
    </DashboardLayout>
  );
}

export default CropDiagnosisManagement;

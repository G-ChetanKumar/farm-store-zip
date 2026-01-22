import { useState, useEffect } from "react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import MDInput from "components/MDInput";
import DataTable from "examples/Tables/DataTable";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import Icon from "@mui/material/Icon";
import { toast } from "react-toastify";
import apiClient from "api/axios";
import Chip from "@mui/material/Chip";
import Tooltip from "@mui/material/Tooltip";
import Box from "@mui/material/Box";
import Avatar from "@mui/material/Avatar";
import Badge from "@mui/material/Badge";
import Checkbox from "@mui/material/Checkbox";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

function EntrepreneurDashboard() {
  const [entrepreneurs, setEntrepreneurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTab, setSelectedTab] = useState(0); // 0=Pending, 1=Approved, 2=Rejected
  const [selectedEntrepreneurs, setSelectedEntrepreneurs] = useState([]);

  // Dialogs
  const [approveDialog, setApproveDialog] = useState(false);
  const [rejectDialog, setRejectDialog] = useState(false);
  const [detailDialog, setDetailDialog] = useState(false);
  const [credentialsDialog, setCredentialsDialog] = useState(false);
  const [selectedEntrepreneur, setSelectedEntrepreneur] = useState(null);
  const [bulkAction, setBulkAction] = useState(false);
  const [generatedCredentials, setGeneratedCredentials] = useState(null);

  // Form data
  const [approvalNotes, setApprovalNotes] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");

  // Statistics
  const [stats, setStats] = useState({
    totalPending: 0,
    totalApproved: 0,
    totalRejected: 0,
    approvalRate: 0,
    recentApprovals: 0,
  });

  // Fetch all entrepreneurs (self-registered users from entrepreneur collection)
  const fetchEntrepreneurs = async () => {
    try {
      setLoading(true);
      
      // Fetch from entrepreneur collection (self-registered)
      const entrepreneurResponse = await apiClient.get("/api/entrepreneur/get-entrepreneurs");
      const entrepreneurData = entrepreneurResponse.data.data || [];
      
      // Tag entrepreneurs with source
      const taggedEntrepreneurs = entrepreneurData.map(e => ({
        ...e,
        source: 'self_registered',
        mobile: e.phone,  // Map phone to mobile for consistency
        _isEntrepreneurCollection: true
      }));
      
      setEntrepreneurs(taggedEntrepreneurs);
      calculateStats(taggedEntrepreneurs);
    } catch (error) {
      console.error("Error fetching entrepreneurs:", error);
      toast.error("Failed to fetch entrepreneurs");
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics from loaded entrepreneurs
  const calculateStats = (entrepreneursList) => {
    const pendingCount = entrepreneursList.filter(e => e.approval_status === 'pending').length;
    const approvedCount = entrepreneursList.filter(e => e.approval_status === 'approved').length;
    const rejectedCount = entrepreneursList.filter(e => e.approval_status === 'rejected').length;
    const totalCount = entrepreneursList.length;

    // Calculate approval rate
    const approvalRate = totalCount > 0 
      ? ((approvedCount / totalCount) * 100).toFixed(1) 
      : 0;

    // Count recent approvals (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentApprovals = entrepreneursList.filter(
      (e) => e.approval_status === 'approved' && e.approved_at && new Date(e.approved_at) >= sevenDaysAgo
    ).length;

    setStats({
      totalPending: pendingCount,
      totalApproved: approvedCount,
      totalRejected: rejectedCount,
      approvalRate: approvalRate,
      recentApprovals: recentApprovals,
    });
  };

  useEffect(() => {
    fetchEntrepreneurs();
  }, []);

  // Handle approve
  const handleApprove = async () => {
    try {
      const entrepreneurIds = bulkAction ? selectedEntrepreneurs : [selectedEntrepreneur._id];

      if (bulkAction) {
        // Approve multiple entrepreneurs
        const promises = entrepreneurIds.map(id =>
          apiClient.patch(`/api/entrepreneur/${id}/approve`, {
            approval_notes: approvalNotes,
            password: generatePassword(),
          })
        );
        
        const results = await Promise.allSettled(promises);
        const successful = results.filter(r => r.status === 'fulfilled').length;
        const failed = results.filter(r => r.status === 'rejected').length;
        
        if (successful > 0) {
          toast.success(`${successful} entrepreneur(s) approved successfully!`);
        }
        if (failed > 0) {
          toast.warning(`${failed} failed to approve`);
        }
      } else {
        // Approve single entrepreneur
        const response = await apiClient.patch(`/api/entrepreneur/${selectedEntrepreneur._id}/approve`, {
          approval_notes: approvalNotes,
          password: generatePassword(),
        });

        toast.success("Entrepreneur approved successfully!");
        
        // Show credentials if password was generated
        if (response.data.data.password) {
          setGeneratedCredentials([{
            email: response.data.data.email,
            temp_password: response.data.data.password,
          }]);
          setCredentialsDialog(true);
        }
      }

      setApproveDialog(false);
      setApprovalNotes("");
      fetchEntrepreneurs();
    } catch (error) {
      console.error("Error approving entrepreneur:", error);
      toast.error(error.response?.data?.message || "Failed to approve entrepreneur");
    }
  };
  
  // Generate random password
  const generatePassword = () => {
    const length = 10;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%";
    let password = "";
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
  };

  // Handle reject
  const handleReject = async () => {
    try {
      if (!rejectionReason.trim()) {
        toast.error("Please provide a rejection reason");
        return;
      }

      const entrepreneurIds = bulkAction
        ? selectedEntrepreneurs
        : [selectedEntrepreneur._id];

      if (bulkAction) {
        // Reject multiple entrepreneurs
        const promises = entrepreneurIds.map(id =>
          apiClient.patch(`/api/entrepreneur/${id}/reject`, {
            rejection_reason: rejectionReason,
          })
        );
        
        const results = await Promise.allSettled(promises);
        const successful = results.filter(r => r.status === 'fulfilled').length;
        
        toast.success(`${successful} entrepreneur(s) rejected`);
      } else {
        // Reject single entrepreneur
        await apiClient.patch(`/api/entrepreneur/${selectedEntrepreneur._id}/reject`, {
          rejection_reason: rejectionReason,
        });
        toast.success("Entrepreneur application rejected");
      }

      setRejectDialog(false);
      setRejectionReason("");
      fetchEntrepreneurs();
    } catch (error) {
      console.error("Error rejecting entrepreneur:", error);
      toast.error(error.response?.data?.message || "Failed to reject entrepreneur");
    }
  };

  // Handle delete
  const handleDelete = async (entrepreneurId) => {
    if (!window.confirm("Are you sure you want to delete this entrepreneur application?")) {
      return;
    }
    
    try {
      await apiClient.delete(`/api/entrepreneur/${entrepreneurId}`);
      toast.success("Entrepreneur application deleted successfully");
      fetchEntrepreneurs();
    } catch (error) {
      console.error("Error deleting entrepreneur:", error);
      toast.error(error.response?.data?.message || "Failed to delete entrepreneur");
    }
  };

  // Handle checkbox
  const handleSelectEntrepreneur = (entrepreneurId) => {
    setSelectedEntrepreneurs((prev) =>
      prev.includes(entrepreneurId)
        ? prev.filter((id) => id !== entrepreneurId)
        : [...prev, entrepreneurId]
    );
  };

  // Open approve dialog
  const openApproveDialog = (entrepreneur = null, bulk = false) => {
    setSelectedEntrepreneur(entrepreneur);
    setBulkAction(bulk);
    setApproveDialog(true);
  };

  // Open reject dialog
  const openRejectDialog = (entrepreneur = null, bulk = false) => {
    setSelectedEntrepreneur(entrepreneur);
    setBulkAction(bulk);
    setRejectDialog(true);
  };

  // Open detail dialog
  const openDetailDialog = (entrepreneur) => {
    setSelectedEntrepreneur(entrepreneur);
    setDetailDialog(true);
  };

  // Filter entrepreneurs based on search
  const filteredEntrepreneurs = entrepreneurs.filter((entrepreneur) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      entrepreneur.name?.toLowerCase().includes(search) ||
      entrepreneur.phone?.toLowerCase().includes(search) ||
      entrepreneur.email?.toLowerCase().includes(search) ||
      entrepreneur.cityTownVillage?.toLowerCase().includes(search)
    );
  });

  // Table columns for pending
  const pendingColumns = [
    {
      Header: (
        <Checkbox
          checked={
            selectedEntrepreneurs.length === filteredEntrepreneurs.length &&
            filteredEntrepreneurs.length > 0
          }
          indeterminate={
            selectedEntrepreneurs.length > 0 &&
            selectedEntrepreneurs.length < filteredEntrepreneurs.length
          }
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedEntrepreneurs(filteredEntrepreneurs.map((e) => e._id));
            } else {
              setSelectedEntrepreneurs([]);
            }
          }}
        />
      ),
      accessor: "select",
      width: "5%",
      Cell: ({ row }) => (
        <Checkbox
          checked={selectedEntrepreneurs.includes(row.original._id)}
          onChange={() => handleSelectEntrepreneur(row.original._id)}
        />
      ),
    },
    {
      Header: "Applicant",
      accessor: "applicant",
      align: "left",
      Cell: ({ row }) => (
        <MDBox display="flex" alignItems="center">
          <Avatar sx={{ mr: 2, bgcolor: "#4caf50" }}>
            {row.original.name?.charAt(0).toUpperCase()}
          </Avatar>
          <MDBox>
            <MDTypography variant="button" fontWeight="medium">
              {row.original.name}
            </MDTypography>
            <MDTypography variant="caption" color="text" display="block">
              {row.original.email}
            </MDTypography>
            <MDTypography variant="caption" color="text">
              {row.original.phone}
            </MDTypography>
          </MDBox>
        </MDBox>
      ),
    },
    {
      Header: "Gender",
      accessor: "gender",
      align: "center",
      Cell: ({ row }) => (
        <MDTypography variant="caption">{row.original.gender}</MDTypography>
      ),
    },
    {
      Header: "Location",
      accessor: "location",
      align: "left",
      Cell: ({ row }) => (
        <MDBox>
          <MDTypography variant="caption" display="block">
            {row.original.cityTownVillage}, {row.original.mandal}
          </MDTypography>
          <MDTypography variant="caption" color="text">
            {row.original.district}, {row.original.state}
          </MDTypography>
        </MDBox>
      ),
    },
    {
      Header: "Applied On",
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
              onClick={() => openDetailDialog(row.original)}
              size="small"
              color="info"
            >
              <Icon>visibility</Icon>
            </IconButton>
          </Tooltip>
          <Tooltip title="Approve & Create Account">
            <IconButton
              onClick={() => openApproveDialog(row.original, false)}
              size="small"
              color="success"
            >
              <Icon>check_circle</Icon>
            </IconButton>
          </Tooltip>
          <Tooltip title="Reject">
            <IconButton
              onClick={() => openRejectDialog(row.original, false)}
              size="small"
              color="error"
            >
              <Icon>cancel</Icon>
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton
              onClick={() => handleDelete(row.original._id)}
              size="small"
              color="error"
            >
              <Icon>delete</Icon>
            </IconButton>
          </Tooltip>
        </MDBox>
      ),
    },
  ];

  // Table columns for approved/rejected
  const historyColumns = [
    {
      Header: "Applicant",
      accessor: "applicant",
      align: "left",
      Cell: ({ row }) => (
        <MDBox display="flex" alignItems="center">
          <Avatar sx={{ mr: 2, bgcolor: "#4caf50" }}>
            {row.original.name?.charAt(0).toUpperCase()}
          </Avatar>
          <MDBox>
            <MDTypography variant="button" fontWeight="medium">
              {row.original.name}
            </MDTypography>
            <MDTypography variant="caption" color="text" display="block">
              {row.original.email}
            </MDTypography>
            <MDTypography variant="caption" color="text">
              {row.original.phone}
            </MDTypography>
          </MDBox>
        </MDBox>
      ),
    },
    {
      Header: "Location",
      accessor: "location",
      align: "left",
      Cell: ({ row }) => (
        <MDBox>
          <MDTypography variant="caption" display="block">
            {row.original.cityTownVillage}
          </MDTypography>
          <MDTypography variant="caption" color="text">
            {row.original.district}, {row.original.state}
          </MDTypography>
        </MDBox>
      ),
    },
    {
      Header: selectedTab === 1 ? "Approved By" : "Rejected By",
      accessor: "processed_by",
      align: "left",
      Cell: ({ row }) => (
        <MDTypography variant="caption">
          {row.original.approved_by?.name || "System"}
        </MDTypography>
      ),
    },
    {
      Header: selectedTab === 1 ? "Approved On" : "Rejected On",
      accessor: "date",
      align: "center",
      Cell: ({ row }) => (
        <MDTypography variant="caption">
          {new Date(
            row.original.approved_at || row.original.rejected_at
          ).toLocaleDateString()}
        </MDTypography>
      ),
    },
    {
      Header: "Actions",
      accessor: "actions",
      align: "center",
      Cell: ({ row }) => (
        <Tooltip title="View Details">
          <IconButton
            onClick={() => openDetailDialog(row.original)}
            size="small"
            color="info"
          >
            <Icon>visibility</Icon>
          </IconButton>
        </Tooltip>
      ),
    },
  ];

  const columns = selectedTab === 0 ? pendingColumns : historyColumns;
  const rows = filteredEntrepreneurs;

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
      {/* Statistics Cards */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} md={3}>
          <Card>
            <MDBox p={3} textAlign="center">
              <Badge badgeContent={stats.totalPending} color="error">
                <Icon fontSize="large" color="warning">
                  pending_actions
                </Icon>
              </Badge>
              <MDTypography variant="h4" fontWeight="bold" color="warning" mt={1}>
                {stats.totalPending}
              </MDTypography>
              <MDTypography variant="caption" color="text">
                Pending Applications
              </MDTypography>
            </MDBox>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <MDBox p={3} textAlign="center">
              <Icon fontSize="large" color="success">
                check_circle
              </Icon>
              <MDTypography variant="h4" fontWeight="bold" color="success" mt={1}>
                {stats.totalApproved}
              </MDTypography>
              <MDTypography variant="caption" color="text">
                Approved
              </MDTypography>
            </MDBox>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <MDBox p={3} textAlign="center">
              <Icon fontSize="large" color="error">
                cancel
              </Icon>
              <MDTypography variant="h4" fontWeight="bold" color="error" mt={1}>
                {stats.totalRejected}
              </MDTypography>
              <MDTypography variant="caption" color="text">
                Rejected
              </MDTypography>
            </MDBox>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <MDBox p={3} textAlign="center">
              <Icon fontSize="large" color="info">
                trending_up
              </Icon>
              <MDTypography variant="h4" fontWeight="bold" color="info" mt={1}>
                {stats.approvalRate}%
              </MDTypography>
              <MDTypography variant="caption" color="text">
                Approval Rate
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
              Entrepreneurs Dashboard
            </MDTypography>
          </MDBox>

          {/* Search */}
          <Grid container spacing={2} mb={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Search by name, email, phone, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                size="small"
              />
            </Grid>
          </Grid>

          {/* Custom Table */}
          <div
            style={{
              border: "1px solid #ddd",
              borderRadius: "6px",
              overflowX: "auto",
            }}
          >
            {/* Table Header */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "60px 150px 100px 130px 200px 120px 140px 120px 120px 120px 140px 120px 150px 200px",
                backgroundColor: "#f5f5f5",
                borderBottom: "1px solid #ddd",
              }}
            >
              {[
                "SL.NO",
                "Name",
                "Gender",
                "Phone",
                "Email",
                "User Type",
                "Source",
                "State",
                "District",
                "Mandal",
                "City/Village",
                "Status",
                "Created At",
                "Actions",
              ].map((heading, i) => (
                <div
                  key={i}
                  style={{
                    padding: "10px",
                    textAlign: "center",
                    whiteSpace: "nowrap",
                    fontSize: "13px",
                    fontWeight: "600",
                    borderRight: i !== 13 ? "1px solid #ddd" : "none",
                  }}
                >
                  {heading}
                </div>
              ))}
            </div>

            {/* Table Body */}
            {filteredEntrepreneurs.length > 0 ? (
              filteredEntrepreneurs.map((e, index) => (
                <div
                  key={e._id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "60px 150px 100px 130px 200px 120px 140px 120px 120px 120px 140px 120px 150px 200px",
                    borderBottom: "1px solid #ddd",
                    backgroundColor: index % 2 === 0 ? "#fff" : "#fafafa",
                  }}
                >
                  {/* Serial Number */}
                  <div style={{ padding: "8px", textAlign: "center", fontSize: "12px", borderRight: "1px solid #ddd" }}>
                    {index + 1}
                  </div>
                  
                  {/* Name */}
                  <div style={{ padding: "8px", fontSize: "12px", borderRight: "1px solid #ddd" }}>{e.name}</div>
                  
                  {/* Gender */}
                  <div style={{ padding: "8px", fontSize: "12px", borderRight: "1px solid #ddd" }}>{e.gender || '-'}</div>
                  
                  {/* Phone */}
                  <div style={{ padding: "8px", fontSize: "12px", borderRight: "1px solid #ddd" }}>{e.phone || e.mobile}</div>
                  
                  {/* Email */}
                  <div style={{ padding: "8px", fontSize: "12px", borderRight: "1px solid #ddd" }}>{e.email}</div>
                  
                  {/* User Type */}
                  <div style={{ padding: "8px", textAlign: "center", fontSize: "12px", borderRight: "1px solid #ddd" }}>
                    <Chip
                      label={e.user_type || 'Agent'}
                      size="small"
                      color={e.user_type === 'Agent' ? 'primary' : 'secondary'}
                      style={{ fontSize: "10px" }}
                    />
                  </div>
                  
                  {/* Source */}
                  <div style={{ padding: "8px", textAlign: "center", fontSize: "12px", borderRight: "1px solid #ddd" }}>
                    <Chip
                      label="Self-Reg"
                      size="small"
                      color="info"
                      icon={<Icon fontSize="small">person_add</Icon>}
                      style={{ fontSize: "10px" }}
                    />
                  </div>
                  
                  {/* State */}
                  <div style={{ padding: "8px", fontSize: "12px", borderRight: "1px solid #ddd" }}>{e.state || '-'}</div>
                  
                  {/* District */}
                  <div style={{ padding: "8px", fontSize: "12px", borderRight: "1px solid #ddd" }}>{e.district || '-'}</div>
                  
                  {/* Mandal */}
                  <div style={{ padding: "8px", fontSize: "12px", borderRight: "1px solid #ddd" }}>{e.mandal || '-'}</div>
                  
                  {/* City/Town/Village */}
                  <div style={{ padding: "8px", fontSize: "12px", borderRight: "1px solid #ddd" }}>{e.cityTownVillage || '-'}</div>
                  
                  {/* Status */}
                  <div style={{ padding: "8px", textAlign: "center", fontSize: "12px", borderRight: "1px solid #ddd" }}>
                    <Chip
                      label={e.approval_status?.toUpperCase() || "PENDING"}
                      size="small"
                      color={
                        e.approval_status === "approved"
                          ? "success"
                          : e.approval_status === "rejected"
                          ? "error"
                          : "warning"
                      }
                      style={{ fontSize: "10px" }}
                    />
                  </div>
                  
                  {/* Created At */}
                  <div style={{ padding: "8px", whiteSpace: "nowrap", fontSize: "12px", borderRight: "1px solid #ddd" }}>
                    {new Date(e.createdAt).toLocaleDateString()}
                  </div>
                  
                  {/* Actions */}
                  <div style={{ padding: "8px", textAlign: "center", display: "flex", gap: "4px", justifyContent: "center" }}>
                    <Tooltip title="View Details">
                      <IconButton
                        onClick={() => openDetailDialog(e)}
                        size="small"
                        color="info"
                      >
                        <Icon fontSize="small">visibility</Icon>
                      </IconButton>
                    </Tooltip>
                    
                    {e.approval_status === "pending" && (
                      <>
                        <Tooltip title="Approve">
                          <IconButton
                            onClick={() => openApproveDialog(e, false)}
                            size="small"
                            color="success"
                          >
                            <Icon fontSize="small">check_circle</Icon>
                          </IconButton>
                        </Tooltip>
                        
                        <Tooltip title="Reject">
                          <IconButton
                            onClick={() => openRejectDialog(e, false)}
                            size="small"
                            color="error"
                          >
                            <Icon fontSize="small">cancel</Icon>
                          </IconButton>
                        </Tooltip>
                        
                        <Tooltip title="Delete">
                          <IconButton
                            onClick={() => handleDelete(e._id)}
                            size="small"
                            color="error"
                          >
                            <Icon fontSize="small">delete</Icon>
                          </IconButton>
                        </Tooltip>
                      </>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div style={{ padding: "20px", textAlign: "center", fontSize: "14px", color: "#666" }}>
                {loading ? "Loading entrepreneurs..." : "No entrepreneurs found"}
              </div>
            )}
          </div>
        </MDBox>
      </Card>

      {/* Approve Dialog */}
      <Dialog open={approveDialog} onClose={() => setApproveDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {bulkAction
            ? `Approve ${selectedEntrepreneurs.length} Application(s)`
            : `Approve ${selectedEntrepreneur?.name}'s Application`}
        </DialogTitle>
        <DialogContent>
          <MDBox mt={2}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Approval Notes (Optional)"
              value={approvalNotes}
              onChange={(e) => setApprovalNotes(e.target.value)}
              placeholder="Add any notes for this approval..."
            />
            <MDBox
              mt={2}
              p={2}
              sx={{
                backgroundColor: "#e3f2fd",
                borderRadius: 1,
                border: "1px solid #2196f3",
              }}
            >
              <MDTypography variant="caption" fontWeight="bold" color="text">
                <Icon fontSize="small" sx={{ verticalAlign: "middle", mr: 0.5 }}>
                  info
                </Icon>
                Upon approval, a user account will be automatically created with:
                <ul style={{ marginTop: "8px", marginBottom: 0 }}>
                  <li>Mobile number as login ID</li>
                  <li>A temporary password (shown after approval)</li>
                  <li>User type: Entrepreneur</li>
                  <li>Account status: Active</li>
                </ul>
              </MDTypography>
            </MDBox>
          </MDBox>
        </DialogContent>
        <DialogActions>
          <MDButton onClick={() => setApproveDialog(false)} color="secondary">
            Cancel
          </MDButton>
          <MDButton onClick={handleApprove} variant="gradient" color="success">
            <Icon sx={{ mr: 1 }}>check_circle</Icon>
            Approve & Create Account
          </MDButton>
        </DialogActions>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialog} onClose={() => setRejectDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {bulkAction
            ? `Reject ${selectedEntrepreneurs.length} Application(s)`
            : `Reject ${selectedEntrepreneur?.name}'s Application`}
        </DialogTitle>
        <DialogContent>
          <MDBox mt={2}>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Rejection Reason *"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Please provide a reason for rejection..."
              required
            />
          </MDBox>
        </DialogContent>
        <DialogActions>
          <MDButton onClick={() => setRejectDialog(false)} color="secondary">
            Cancel
          </MDButton>
          <MDButton onClick={handleReject} variant="gradient" color="error">
            <Icon sx={{ mr: 1 }}>cancel</Icon>
            Reject
          </MDButton>
        </DialogActions>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={detailDialog} onClose={() => setDetailDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Entrepreneur Application Details</DialogTitle>
        <DialogContent>
          {selectedEntrepreneur && (
            <MDBox mt={2}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <MDBox display="flex" alignItems="center" mb={2}>
                    <Avatar sx={{ width: 60, height: 60, mr: 2, bgcolor: "#4caf50" }}>
                      {selectedEntrepreneur.name?.charAt(0).toUpperCase()}
                    </Avatar>
                    <MDBox>
                      <MDTypography variant="h6">{selectedEntrepreneur.name}</MDTypography>
                      <Chip
                        label={selectedEntrepreneur.approval_status?.toUpperCase()}
                        size="small"
                        color={
                          selectedEntrepreneur.approval_status === "approved"
                            ? "success"
                            : selectedEntrepreneur.approval_status === "rejected"
                            ? "error"
                            : "warning"
                        }
                      />
                    </MDBox>
                  </MDBox>
                </Grid>
                <Grid item xs={6}>
                  <MDTypography variant="caption" color="text">
                    Gender
                  </MDTypography>
                  <MDTypography variant="button" fontWeight="medium">
                    {selectedEntrepreneur.gender}
                  </MDTypography>
                </Grid>
                <Grid item xs={6}>
                  <MDTypography variant="caption" color="text">
                    Phone
                  </MDTypography>
                  <MDTypography variant="button" fontWeight="medium">
                    {selectedEntrepreneur.phone}
                  </MDTypography>
                </Grid>
                <Grid item xs={12}>
                  <MDTypography variant="caption" color="text">
                    Email
                  </MDTypography>
                  <MDTypography variant="button" fontWeight="medium">
                    {selectedEntrepreneur.email}
                  </MDTypography>
                </Grid>
                <Grid item xs={6}>
                  <MDTypography variant="caption" color="text">
                    State
                  </MDTypography>
                  <MDTypography variant="button" fontWeight="medium">
                    {selectedEntrepreneur.state}
                  </MDTypography>
                </Grid>
                <Grid item xs={6}>
                  <MDTypography variant="caption" color="text">
                    District
                  </MDTypography>
                  <MDTypography variant="button" fontWeight="medium">
                    {selectedEntrepreneur.district}
                  </MDTypography>
                </Grid>
                <Grid item xs={6}>
                  <MDTypography variant="caption" color="text">
                    Mandal
                  </MDTypography>
                  <MDTypography variant="button" fontWeight="medium">
                    {selectedEntrepreneur.mandal}
                  </MDTypography>
                </Grid>
                <Grid item xs={6}>
                  <MDTypography variant="caption" color="text">
                    City/Town/Village
                  </MDTypography>
                  <MDTypography variant="button" fontWeight="medium">
                    {selectedEntrepreneur.cityTownVillage}
                  </MDTypography>
                </Grid>
                <Grid item xs={6}>
                  <MDTypography variant="caption" color="text">
                    Applied On
                  </MDTypography>
                  <MDTypography variant="button" fontWeight="medium">
                    {new Date(selectedEntrepreneur.createdAt).toLocaleDateString()}
                  </MDTypography>
                </Grid>
                {selectedEntrepreneur.approved_at && (
                  <Grid item xs={6}>
                    <MDTypography variant="caption" color="text">
                      Approved On
                    </MDTypography>
                    <MDTypography variant="button" fontWeight="medium">
                      {new Date(selectedEntrepreneur.approved_at).toLocaleDateString()}
                    </MDTypography>
                  </Grid>
                )}
                {selectedEntrepreneur.rejected_at && (
                  <Grid item xs={6}>
                    <MDTypography variant="caption" color="text">
                      Rejected On
                    </MDTypography>
                    <MDTypography variant="button" fontWeight="medium">
                      {new Date(selectedEntrepreneur.rejected_at).toLocaleDateString()}
                    </MDTypography>
                  </Grid>
                )}
                {selectedEntrepreneur.rejection_reason && (
                  <Grid item xs={12}>
                    <MDTypography variant="caption" color="text">
                      Rejection Reason
                    </MDTypography>
                    <MDTypography variant="body2" color="error">
                      {selectedEntrepreneur.rejection_reason}
                    </MDTypography>
                  </Grid>
                )}
                {selectedEntrepreneur.approval_notes && (
                  <Grid item xs={12}>
                    <MDTypography variant="caption" color="text">
                      Approval Notes
                    </MDTypography>
                    <MDTypography variant="body2">
                      {selectedEntrepreneur.approval_notes}
                    </MDTypography>
                  </Grid>
                )}
              </Grid>
            </MDBox>
          )}
        </DialogContent>
        <DialogActions>
          <MDButton onClick={() => setDetailDialog(false)} color="secondary">
            Close
          </MDButton>
          {selectedEntrepreneur?.approval_status === "pending" && (
            <>
              <MDButton
                onClick={() => {
                  setDetailDialog(false);
                  openApproveDialog(selectedEntrepreneur, false);
                }}
                variant="gradient"
                color="success"
              >
                Approve
              </MDButton>
              <MDButton
                onClick={() => {
                  setDetailDialog(false);
                  openRejectDialog(selectedEntrepreneur, false);
                }}
                variant="gradient"
                color="error"
              >
                Reject
              </MDButton>
            </>
          )}
        </DialogActions>
      </Dialog>

      {/* Credentials Dialog */}
      <Dialog
        open={credentialsDialog}
        onClose={() => setCredentialsDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Icon fontSize="large" color="success" sx={{ verticalAlign: "middle", mr: 1 }}>
            check_circle
          </Icon>
          Entrepreneur Account(s) Created Successfully
        </DialogTitle>
        <DialogContent>
          <MDBox mt={2}>
            <MDBox
              p={2}
              mb={2}
              sx={{
                backgroundColor: "#fff3e0",
                borderRadius: 1,
                border: "1px solid #ff9800",
              }}
            >
              <MDTypography variant="caption" fontWeight="bold" color="text">
                <Icon fontSize="small" sx={{ verticalAlign: "middle", mr: 0.5 }}>
                  warning
                </Icon>
                IMPORTANT: Save these credentials now! The password will not be shown again.
              </MDTypography>
            </MDBox>

            {generatedCredentials &&
              generatedCredentials.map((cred, index) => (
                <MDBox key={index} mb={2} p={2} sx={{ border: "1px solid #e0e0e0", borderRadius: 1 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <MDTypography variant="caption" color="text">
                        Mobile (Login ID)
                      </MDTypography>
                      <MDTypography variant="button" fontWeight="bold" display="block">
                        {cred.mobile}
                      </MDTypography>
                    </Grid>
                    <Grid item xs={12}>
                      <MDTypography variant="caption" color="text">
                        Email
                      </MDTypography>
                      <MDTypography variant="button" fontWeight="bold" display="block">
                        {cred.email}
                      </MDTypography>
                    </Grid>
                    <Grid item xs={12}>
                      <MDTypography variant="caption" color="text">
                        Temporary Password
                      </MDTypography>
                      <MDTypography
                        variant="h6"
                        fontWeight="bold"
                        color="success"
                        display="block"
                      >
                        {cred.temp_password}
                      </MDTypography>
                    </Grid>
                  </Grid>
                </MDBox>
              ))}

            <MDBox mt={2} p={2} sx={{ backgroundColor: "#e3f2fd", borderRadius: 1 }}>
              <MDTypography variant="caption" color="text">
                <strong>Next Steps:</strong>
                <ul style={{ marginTop: "8px", marginBottom: 0 }}>
                  <li>Share these credentials with the entrepreneur via phone or email</li>
                  <li>Instruct them to login using their mobile number and this password</li>
                  <li>Recommend changing the password after first login</li>
                </ul>
              </MDTypography>
            </MDBox>
          </MDBox>
        </DialogContent>
        <DialogActions>
          <MDButton onClick={() => setCredentialsDialog(false)} variant="gradient" color="info">
            Close
          </MDButton>
        </DialogActions>
      </Dialog>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default EntrepreneurDashboard;

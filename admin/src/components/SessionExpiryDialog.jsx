import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  LinearProgress,
  Alert,
} from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import RefreshIcon from "@mui/icons-material/Refresh";

/**
 * Session Expiry Dialog Component
 * 
 * Shows a dialog 2 minutes before session expires
 * Gives user option to:
 * - Continue Session (refreshes token)
 * - Logout (ends session)
 * 
 * Auto-logout if no action taken within 2 minutes
 */
const SessionExpiryDialog = ({ 
  open, 
  onContinue, 
  onLogout, 
  timeRemaining // in seconds
}) => {
  const [countdown, setCountdown] = useState(timeRemaining);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (open && countdown > 0) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            // Auto-logout when timer reaches 0
            onLogout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [open, countdown, onLogout]);

  // Reset countdown when dialog opens
  useEffect(() => {
    if (open) {
      setCountdown(timeRemaining);
    }
  }, [open, timeRemaining]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const progressValue = ((timeRemaining - countdown) / timeRemaining) * 100;

  const handleContinue = async () => {
    setIsRefreshing(true);
    try {
      await onContinue();
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <Dialog
      open={open}
      disableEscapeKeyDown
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
        },
      }}
    >
      <DialogTitle
        sx={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        <AccessTimeIcon />
        <Typography variant="h6" fontWeight="bold">
          Session Expiring Soon
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ mt: 3, pb: 2 }}>
        <Alert severity="warning" sx={{ mb: 3 }}>
          Your session is about to expire due to inactivity
        </Alert>

        <Box textAlign="center" mb={3}>
          <Typography variant="h2" fontWeight="bold" color="error" sx={{ mb: 1 }}>
            {formatTime(countdown)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Time remaining before auto-logout
          </Typography>
        </Box>

        <Box sx={{ width: "100%", mb: 2 }}>
          <LinearProgress
            variant="determinate"
            value={progressValue}
            color={countdown < 30 ? "error" : "warning"}
            sx={{
              height: 10,
              borderRadius: 5,
              backgroundColor: "rgba(0,0,0,0.1)",
            }}
          />
        </Box>

        <Typography variant="body2" color="text.secondary" textAlign="center">
          Click "Continue Session" to stay logged in, or "Logout" to end your session now.
        </Typography>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0, gap: 2 }}>
        <Button
          onClick={onLogout}
          variant="outlined"
          color="error"
          startIcon={<ExitToAppIcon />}
          fullWidth
          sx={{
            py: 1.5,
            borderRadius: 2,
            textTransform: "none",
            fontSize: "1rem",
          }}
        >
          Logout
        </Button>
        <Button
          onClick={handleContinue}
          variant="contained"
          color="primary"
          startIcon={<RefreshIcon />}
          disabled={isRefreshing}
          fullWidth
          sx={{
            py: 1.5,
            borderRadius: 2,
            textTransform: "none",
            fontSize: "1rem",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            "&:hover": {
              background: "linear-gradient(135deg, #5568d3 0%, #6941a0 100%)",
            },
          }}
        >
          {isRefreshing ? "Refreshing..." : "Continue Session"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SessionExpiryDialog;

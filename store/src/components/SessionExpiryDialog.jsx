import React, { useState, useEffect } from "react";
import { Clock, AlertTriangle } from "lucide-react";

/**
 * Session Expiry Warning Dialog
 * Shows warning 2 minutes before token expiry
 * Offers option to extend session or logout
 */
const SessionExpiryDialog = ({ onExtend, onLogout }) => {
  const [show, setShow] = useState(false);
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes in seconds
  
  useEffect(() => {
    // Check token expiry time from localStorage
    const checkTokenExpiry = () => {
      const csrfTokenExpiry = localStorage.getItem("csrfTokenExpiry");
      
      if (!csrfTokenExpiry) return;
      
      const expiryTime = new Date(csrfTokenExpiry).getTime();
      const currentTime = Date.now();
      const timeUntilExpiry = (expiryTime - currentTime) / 1000; // seconds
      
      // Show dialog 2 minutes (120 seconds) before expiry
      if (timeUntilExpiry > 0 && timeUntilExpiry <= 120) {
        setShow(true);
        setTimeLeft(Math.floor(timeUntilExpiry));
      } else {
        setShow(false);
      }
    };
    
    // Check every 10 seconds
    const interval = setInterval(checkTokenExpiry, 10000);
    checkTokenExpiry(); // Check immediately
    
    return () => clearInterval(interval);
  }, []);
  
  useEffect(() => {
    if (!show) return;
    
    // Countdown timer
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Auto logout when time runs out
          handleLogout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [show]);
  
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  const handleExtend = () => {
    setShow(false);
    if (onExtend) onExtend();
  };
  
  const handleLogout = () => {
    setShow(false);
    if (onLogout) onLogout();
  };
  
  if (!show) return null;
  
  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in">
      <div className="bg-white rounded-lg shadow-2xl border-2 border-orange-500 p-4 w-80">
        {/* Header */}
        <div className="flex items-center gap-2 mb-3">
          <div className="bg-orange-100 p-2 rounded-full">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
          </div>
          <h3 className="font-semibold text-gray-900">Session Expiring Soon</h3>
        </div>
        
        {/* Message */}
        <p className="text-sm text-gray-600 mb-3">
          Your session will expire in:
        </p>
        
        {/* Countdown */}
        <div className="flex items-center justify-center gap-2 bg-orange-50 rounded-lg p-3 mb-4">
          <Clock className="w-5 h-5 text-orange-600" />
          <span className="text-2xl font-bold text-orange-600">
            {formatTime(timeLeft)}
          </span>
        </div>
        
        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={handleExtend}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Extend Session
          </button>
          <button
            onClick={handleLogout}
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Logout
          </button>
        </div>
        
        {/* Progress bar */}
        <div className="mt-3 h-1 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-orange-500 transition-all duration-1000"
            style={{ width: `${(timeLeft / 120) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default SessionExpiryDialog;

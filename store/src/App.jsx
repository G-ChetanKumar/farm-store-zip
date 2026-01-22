import React, { useEffect } from "react";
import "react-multi-carousel/lib/styles.css";
import HomeBanner from "./ui/HomeBanner";
import Categories from "./ui/Categories";
import ProductList from "./ui/ProductList";
import BrandSection from "./ui/BrandSection";
import CropDiagnosis from "./ui/CropDiagnosis";
import CropsSection from "./ui/Crops";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ExclusiveDeals from "./ui/ExclusiveDeals";
import Pesticides from "./ui/Pesticides";
import Fertilizers from "./ui/Fertilizers";
import Seeds from "./ui/Seeds";
import Gardening from "./ui/Gardening";
import FarmImplements from "./ui/FarmImplements";
import HouseholdPublic from "./ui/HouseholdPublic";
import Irrigation from "./ui/Irrigation";
import IntegratedPestManagement from "./ui/IntegratedPest";
import SessionExpiryDialog from "./components/SessionExpiryDialog";
import BASE_URL from "./Helper/Helper";

function App() {
  // Handle session extension
  const handleExtendSession = async () => {
    try {
      const response = await fetch(`${BASE_URL}/v1/auth/refresh-token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.csrfToken) {
          localStorage.setItem("csrfToken", data.csrfToken);
          
          // Update expiry time
          const expiresIn = data.expiresIn || 1800;
          const expiryTime = new Date(Date.now() + expiresIn * 1000);
          localStorage.setItem("csrfTokenExpiry", expiryTime.toISOString());
          
          toast.success("Session extended successfully!");
        }
      } else {
        toast.error("Failed to extend session. Please login again.");
        handleLogout();
      }
    } catch (error) {
      console.error("Failed to extend session:", error);
      toast.error("Failed to extend session");
      handleLogout();
    }
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("authToken");
    localStorage.removeItem("csrfToken");
    localStorage.removeItem("csrfTokenExpiry");
    localStorage.removeItem("userType");
    window.location.href = "/login";
  };

 // ─── SAVE & RESTORE HERE ───────────────────────────
 useEffect(() => {
  // restore last position
  const saved = sessionStorage.getItem("homeScrollY");
  if (saved) {
    window.scrollTo(0, parseInt(saved, 10));
  }

  // on scroll, keep updating
  const onScroll = () => {
    sessionStorage.setItem("homeScrollY", window.scrollY.toString());
  };
  window.addEventListener("scroll", onScroll);

  return () => {
    // cleanup & final snapshot
    window.removeEventListener("scroll", onScroll);
    sessionStorage.setItem("homeScrollY", window.scrollY.toString());
  };
}, []);
// ───────────────────────────────────────────────────

  return (
    <main>
      <ToastContainer />
      <SessionExpiryDialog 
        onExtend={handleExtendSession}
        onLogout={handleLogout}
      />
      <HomeBanner />
      <ExclusiveDeals/>
      <Categories />
      <BrandSection/>
      <CropsSection/>
      <ProductList />
      <CropDiagnosis/>
      <Pesticides/>
      <Fertilizers/>
      <Seeds/>
      <IntegratedPestManagement/>
      <Gardening/>
      <FarmImplements/>
      <HouseholdPublic/>
      <Irrigation/>
      <br/>

      {/* <Blog /> */}
    </main>
  );
}

export default App;

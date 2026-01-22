import React, { useEffect } from "react";
import "react-multi-carousel/lib/styles.css";
import HomeBanner from "./ui/HomeBanner";
import Categories from "./ui/Categories";
import ProductList from "./ui/ProductList";
import BrandSection from "./ui/BrandSection";
import CropDiagnosis from "./ui/CropDiagnosis";
import CropsSection from "./ui/Crops";
import { ToastContainer } from "react-toastify";
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

function App() {
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

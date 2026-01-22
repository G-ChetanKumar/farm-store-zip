import { useEffect, useMemo, useState } from "react";

import { Navigate, Route, Routes, useLocation } from "react-router-dom";

import CssBaseline from "@mui/material/CssBaseline";
import Icon from "@mui/material/Icon";
import { ThemeProvider } from "@mui/material/styles";

import MDBox from "components/MDBox";

import Configurator from "examples/Configurator";
import Sidenav from "examples/Sidenav";

import theme from "assets/theme";
import themeRTL from "assets/theme/theme-rtl";

import themeDark from "assets/theme-dark";
import themeDarkRTL from "assets/theme-dark/theme-rtl";

import createCache from "@emotion/cache";
import { CacheProvider } from "@emotion/react";
import rtlPlugin from "stylis-plugin-rtl";

import routes from "routes";

import { setMiniSidenav, setOpenConfigurator, useMaterialUIController } from "context";

import brandDark from "assets/images/logo-ct-dark.png";
import brandWhite from "assets/images/logo-ct.png";
import MobileLogin from "layouts/authentication/mobile-login";
import BrandPage from "layouts/brand";
import BrandManagement from "layouts/brandManagement";
import CategoryPage from "layouts/category";
import Counter from "layouts/counter";
import CropManagement from "layouts/cropManagement";
import CropForm from "layouts/Crops";
import ManageCategories from "layouts/ManageCategory";
import CounterManagement from "layouts/ManageCounter";
import SuperCategoryManagement from "layouts/ManageSuperCategory";
import Product from "layouts/product";
import ProductManagement from "layouts/productmanagement";
import Subcategory from "layouts/subcategory";
import SubcategoryManagement from "layouts/SubcategoryManagement";
import SuperCategory from "layouts/superCategory";

export default function App() {
  const [controller, dispatch] = useMaterialUIController();
  const {
    miniSidenav,
    direction,
    layout,
    openConfigurator,
    sidenavColor,
    transparentSidenav,
    whiteSidenav,
    darkMode,
  } = controller;
  const [onMouseEnter, setOnMouseEnter] = useState(false);
  const [rtlCache, setRtlCache] = useState(null);
  const { pathname } = useLocation();

  useMemo(() => {
    const cacheRtl = createCache({
      key: "rtl",
      stylisPlugins: [rtlPlugin],
    });

    setRtlCache(cacheRtl);
  }, []);

  // Open sidenav when mouse enter on mini sidenav
  const handleOnMouseEnter = () => {
    if (miniSidenav && !onMouseEnter) {
      setMiniSidenav(dispatch, false);
      setOnMouseEnter(true);
    }
  };

  // Close sidenav when mouse leave mini sidenav
  const handleOnMouseLeave = () => {
    if (onMouseEnter) {
      setMiniSidenav(dispatch, true);
      setOnMouseEnter(false);
    }
  };

  const handleConfiguratorOpen = () => setOpenConfigurator(dispatch, !openConfigurator);

  useEffect(() => {
    document.body.setAttribute("dir", direction);
  }, [direction]);

  // Setting page scroll to 0 when changing the route
  useEffect(() => {
    document.documentElement.scrollTop = 0;
    document.scrollingElement.scrollTop = 0;
  }, [pathname]);

  const getRoutes = (allRoutes) =>
    allRoutes.map((route) => {
      if (route.collapse) {
        return getRoutes(route.collapse);
      }

      if (route.route) {
        return <Route exact path={route.route} element={route.component} key={route.key} />;
      }

      return null;
    });

  const configsButton = (
    <MDBox
      display="flex"
      justifyContent="center"
      alignItems="center"
      width="3.25rem"
      height="3.25rem"
      bgColor="white"
      shadow="sm"
      borderRadius="50%"
      position="fixed"
      right="2rem"
      bottom="2rem"
      zIndex={99}
      color="dark"
      sx={{ cursor: "pointer" }}
      onClick={handleConfiguratorOpen}
    >
      <Icon fontSize="small" color="inherit">
        settings
      </Icon>
    </MDBox>
  );

  return direction === "rtl" ? (
    <CacheProvider value={rtlCache}>
      <ThemeProvider theme={darkMode ? themeDarkRTL : themeRTL}>
        <CssBaseline />
        {layout === "dashboard" && (
          <>
            <Sidenav
              color={sidenavColor}
              brand={(transparentSidenav && !darkMode) || whiteSidenav ? brandDark : brandWhite}
              brandName="Farm E-store"
              routes={routes}
              onMouseEnter={handleOnMouseEnter}
              onMouseLeave={handleOnMouseLeave}
            />
            <Configurator />
            {configsButton}
          </>
        )}
        {layout === "vr" && <Configurator />}
        <Routes>
          {getRoutes(routes)}
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </ThemeProvider>
    </CacheProvider>
  ) : (
    <ThemeProvider theme={darkMode ? themeDark : theme}>
      <CssBaseline />
      {layout === "dashboard" && (
        <>
          <Sidenav
            color={sidenavColor}
            brand={(transparentSidenav && !darkMode) || whiteSidenav ? brandDark : brandWhite}
            brandName="Farm E-store"
            routes={routes}
            onMouseEnter={handleOnMouseEnter}
            onMouseLeave={handleOnMouseLeave}
          />
          <Configurator />
          {/* {configsButton} */}
        </>
      )}
      {layout === "vr" && <Configurator />}
      <Routes>
        {getRoutes(routes)}
        <Route path="/authentication/mobile-login" element={<MobileLogin />} />
        <Route path="/manage-categories" element={<ManageCategories />} />
        <Route path="/add-category" element={<CategoryPage />} />
        <Route path="/manage-counters" element={<CounterManagement />} />
        <Route path="/manage-super-categories" element={<SuperCategoryManagement />} />
        <Route path="/add-super-category" element={<SuperCategory />} />
        <Route path="/manage-subcategories" element={<SubcategoryManagement />} />
        <Route path="/add-subcategory" element={<Subcategory />} />
        <Route path="/manage-products" element={<ProductManagement />} />
        <Route path="/add-product" element={<Product />} />
        <Route path="/manage-brands" element={<BrandManagement />} />
        <Route path="/add-brand" element={<BrandPage />} />
        <Route path="/manage-crops" element={<CropManagement />} />
        <Route path="/add-crop" element={<CropForm />} />
        <Route path="/manage-counters" element={<CounterManagement />} />
        <Route path="/add-counter" element={<Counter />} />
        <Route path="/" element={<Navigate to="/authentication/mobile-login" />} />
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </ThemeProvider>
  );
}



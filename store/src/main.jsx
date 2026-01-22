import React from "react";
import ReactDOM from "react-dom/client";
import {
  Outlet,
  RouterProvider,
  ScrollRestoration,
  createBrowserRouter,
} from "react-router-dom";
import App from "./App";
import "./index.css";

import Category from "./ui/Categories";
import Subcategory from "./ui/SubCategory";
import NotFound from "./pages/NotFound";
import Layout from "./ui/Layout";
import AllCategories from "./ui/Allcategories";
import Productpage from "./ui/Productpage";
import ProductDetailsPage from "./ui/ProductDetailpage";
import AllBrands from "./ui/AllBrands";
import { CartProvider } from "./contexts/CartContext";
import { WishlistProvider } from "./contexts/WishlistContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import CartPage from "./ui/CartPage";
import Login from "./ui/Login";
import MobileLogin from "./ui/MobileLogin";
import CheckoutBtn from "./ui/CheckoutBtn";
import ProductSection from "./ui/ProductList";
import Allcrops from "./ui/AllCrops";
import { SearchProvider } from "./contexts/SearchContext";
import { EfreshSearch } from "./contexts/EfreshSearch";
import { EmedsSearch } from "./contexts/EmedsSearch";
import ComingSoonPage from "./ui/comingsoon";
import OrderDetails from "./ui/myorders";
import ProductsListDetail from "./ui/ProductsListDetail";
import WishlistPage from "./ui/Wishlist";
import UserProfile from "./ui/UserProfile";
import AllEfreshCategories from "./ui/efresh/AllEfreshCategories";
import EmedsLanding from "./ui/e-meds/EmedsLanding";
import AllEmedsCategories from "./ui/e-meds/AllEmedsCategories";
import ProductsPage from "./ui/efresh/ProductsPage";
import ProductDetail from "./ui/efresh/ProductDetail";
import MediProduct from "./ui/e-meds/MediProduct";
import ProductMediDetail from "./ui/e-meds/ProductMediDetail";
import EfreshDetailProduct from "./ui/efresh/EfreshDetailProduct";
import MedDetailProduct from "./ui/e-meds/MedDetailProduct";
import Locate from "./ui/Locate";
import EntrepreneurForm from "./Entreprenuer";
import Membership from "./ui/Membership";
import ScrollToPreviousPosition from "./ScrollToPreviousPosition";
import Aboutus from "./Aboutus";
import Careers from "./Careers";
import Contactus from "./Contactus";
import Privacypolicy from "./Privacypolicy";
import Refundpolicy from "./Refundpolicy";
import Shippingpolicy from "./Shippingpolicy";
import TermsConditions from "./TermsConditions";
import Faq from "./Faq";

const RouterLayout = () => {
  return (
    <Layout>
      <ScrollRestoration />
      <ScrollToPreviousPosition />
      <Outlet />
    </Layout>
  );
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <RouterLayout />,
    children: [
      {
        path: "/",
        element: <App />,
      },
      {
        path: "/become-entrepreneur",
        element: <EntrepreneurForm />,
      },
      {
        path: "/Aboutus",
        element: <Aboutus/>
      },
      {
        path: "/Careers",
        element: <Careers/>
      },
      {
        path: "/Contactus",
        element: <Contactus/>
      },
      {
        path: "/Privacypolicy",
        element: <Privacypolicy/>
      },
      {
        path: "/Shippingpolicy",
        element: <Shippingpolicy/>
      },
      {
        path: "/terms-conditions",
        element: <TermsConditions/>
      },
      {
        path: "/Faq",
        element: <Faq/>
      },
      {
        path: "/Refundpolicy",
        element: <Refundpolicy/>
      },
      {
        path: "/checkout",
        element: <CheckoutBtn />,
      },
      {
        path: "/all-brands",
        element: <AllBrands />,
      },
      {
        path: "/all-crops",
        element: <Allcrops />,
      },
      {
        path: "/myorders",
        element: <OrderDetails />,
      },
      {
        path: "/profile",
        element: <UserProfile />,
      },
      {
        path: "/cartpage",
        element: <CartPage />,
      },
      {
        path: "/e-fresh",
        element: <ComingSoonPage />,
      },
      {
        path: "/e-meds",
        element: <EmedsLanding />,
      },
      {
        path: "/locate",
        element: <Locate />,
      },
      {
        path: "/category/:id",
        element: <Category />,
      },
      {
        path: "/e-freshCategories",
        element: <AllEfreshCategories />,
      },
      {
        path: "/e-medsCategories",
        element: <AllEmedsCategories />,
      },
      {
        path: "/categories",
        element: <AllCategories />,
      },
      {
        path: "/wishlist",
        element: <WishlistPage />,
      },
      {
        path: "/category/:categoryId/subcategory",
        element: <Subcategory />, // Subcategory route
      },
      {
        path: "/medcategory/:categoryId/subcategory/:subcategoryId/products",
        element: <MediProduct />,
      },
      {
        path: "/categories/:categoryId/subcategory/:subcategoryId/products",
        element: <ProductsPage />,
      },
      {
        path: "/category/:categoryId/subcategory/:subcategoryId/products",
        element: <Productpage />, // Subcategory products route
      },
      {
        path: "/products/brand/:brandId",
        element: <Productpage />, // Brand products route
      },
      {
        path: "/products/crop/:cropId",
        element: <Productpage />, // Crop products route
      },
      {
        path: "/medproduct/:productId",
        element: <ProductMediDetail />, // Product details route
      },
      {
        path: "/productpage/:productId",
        element: <ProductDetail />, // Product details route
      },
      {
        path: "/product/:productId",
        element: <ProductDetailsPage />, // Product details route
      },
      {
        path: "/freshproducts",
        element: <EfreshDetailProduct />,
      },
      {
        path: "/medproducts",
        element: <MedDetailProduct />,
      },
      {
        path: "/products",
        element: <ProductsListDetail />,
      },
      // {
      //   path: "/favorite",
      //   element: <Favorite />,
      // },
      {
        path: "/login",
        element: <MobileLogin />, // Updated to use OTP login
      },
      {
        path: "/login-old",
        element: <Login />, // Old email/password login (backup)
      },
      {
        path: "/membership",
        element: <Membership />, // Membership plans (Farmer only)
      },
      {
        path: "*",
        element: <NotFound />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <LanguageProvider>
    <SearchProvider>
      <EfreshSearch>
        <EmedsSearch>
          <CartProvider>
            <WishlistProvider>
              <RouterProvider router={router} />
            </WishlistProvider>
          </CartProvider>
        </EmedsSearch>
      </EfreshSearch>
    </SearchProvider>
  </LanguageProvider>
);

// Material Dashboard 2 React layouts
import SignIn from "layouts/authentication/sign-in";
import Dashboard from "layouts/dashboard";
import Profile from "layouts/profile";
// import SignUp from "layouts/authentication/sign-up";
import CropManagement from "layouts/cropManagement";
import ManageCategories from "layouts/ManageCategory";
import ProductManagement from "layouts/productmanagement";
// @mui icons
import Icon from "@mui/material/Icon";
import BrandManagement from "layouts/brandManagement";
// import EntrepreneurDashboard from "layouts/entrepreneur"; // REMOVED - Merged into Approvals
import CounterManagement from "layouts/ManageCounter";
import CounterUsers from "layouts/CounterUsers";
import SuperCategoryManagement from "layouts/ManageSuperCategory";
import OrdersDashboard from "layouts/order";
import Pest from "layouts/pest";
import SubcategoryManagement from "layouts/SubcategoryManagement";
import PaymentManagement from "layouts/payment";
import ReturnsManagement from "layouts/returns";
import ShippingManagement from "layouts/shipping";
// import UsersManagement from "layouts/users"; // REMOVED - Managed through Approvals
import CouponsManagement from "layouts/coupons";
// import StoresManagement from "layouts/stores"; // REMOVED - Stores feature not needed
import KisanCreditsManagement from "layouts/credits";
import CropDiagnosisManagement from "layouts/diagnosis";
import ApprovalsManagement from "layouts/approvals";
import MembershipManagement from "layouts/membership";


const routes = [
  {
    type: "collapse",
    name: "Dashboard",
    key: "dashboard",
    icon: <Icon fontSize="small">dashboard</Icon>,
    route: "/dashboard",
    component: <Dashboard />,
  },
  {
    type: "collapse",
    name: "Super Category",
    key: "tables",
    icon: <Icon fontSize="small">category</Icon>,
    route: "/supercategory",
    component: <SuperCategoryManagement />,
  },
  {
    type: "collapse",
    name: "Category",
    key: "tables",
    icon: <Icon fontSize="small">category</Icon>,
    route: "/category",
    component: <ManageCategories />,
  },
  {
    type: "collapse",
    name: "Subcategory",
    key: "notifications",
    icon: <Icon fontSize="small">subdirectory_arrow_right</Icon>,
    route: "/Subcategory",
    component: <SubcategoryManagement />,
  },
  {
    type: "collapse",
    name: "Shop By Crops",
    key: "crops",
    icon: <Icon fontSize="small">agriculture</Icon>,
    route: "/Crops",
    component: <CropManagement />,
  },
  {
    type: "collapse",
    name: "Pests",
    key: "crops",
    icon: <Icon fontSize="small">bug_report</Icon>,
    route: "/Pests",
    component: <Pest />,
  },
  {
    type: "collapse",
    name: "Crop Diagnosis",
    key: "diagnosis",
    icon: <Icon fontSize="small">biotech</Icon>,
    route: "/diagnosis",
    component: <CropDiagnosisManagement />,
  },
  {
    type: "collapse",
    name: "Shop By Brands",
    key: "billing",
    icon: <Icon fontSize="small">storefront</Icon>,
    route: "/brand",
    component: <BrandManagement />,
  },
  {
    type: "collapse",
    name: "Locate",
    key: "billing",
    icon: <Icon fontSize="small">location_on</Icon>,
    route: "/counter",
    component: <CounterManagement />,
  },
  {
    type: "collapse",
    name: "Counter Users",
    key: "counter-users",
    icon: <Icon fontSize="small">people</Icon>,
    route: "/counter-users",
    component: <CounterUsers />,
  },
  // {
  //   type: "collapse",
  //   name: "RTL",
  //   key: "rtl",
  //   icon: <Icon fontSize="small">format_textdirection_r_to_l</Icon>,
  //   route: "/rtl",
  //   component: <RTL />,
  // },
  
  {
    type: "collapse",
    name: "Product",
    key: "product",
    icon: <Icon fontSize="small">inventory</Icon>,
    route: "/Product",
    component: <ProductManagement />,
  },
  // REMOVED - Entrepreneur merged into Approvals page
  // {
  //   type: "collapse",
  //   name: "Entrepreneur",
  //   key: "Profile",
  //   icon: <Icon fontSize="small">person</Icon>,
  //   route: "/entrepreneur",
  //   component: <EntrepreneurDashboard />,
  // },
  {
    type: "collapse",
    name: "Profile",
    key: "profile",
    icon: <Icon fontSize="small">person</Icon>,
    route: "/profile",
    component: <Profile />,
  },
  {
    type: "collapse",
    name: "Order",
    key: "Profile",
    icon: <Icon fontSize="small">shopping_cart</Icon>,
    route: "/order",
    component: <OrdersDashboard />,
  },
  {
    type: "collapse",
    name: "Payments",
    key: "payments",
    icon: <Icon fontSize="small">payment</Icon>,
    route: "/payments",
    component: <PaymentManagement />,
  },
  {
    type: "collapse",
    name: "Returns & Refunds",
    key: "returns",
    icon: <Icon fontSize="small">undo</Icon>,
    route: "/returns",
    component: <ReturnsManagement />,
  },
  {
    type: "collapse",
    name: "Shipping & Delivery",
    key: "shipping",
    icon: <Icon fontSize="small">local_shipping</Icon>,
    route: "/shipping",
    component: <ShippingManagement />,
  },
  // REMOVED: Users & Roles - Now managed through Approvals page
  // {
  //   type: "collapse",
  //   name: "Users & Roles",
  //   key: "users",
  //   icon: <Icon fontSize="small">people</Icon>,
  //   route: "/users",
  //   component: <UsersManagement />,
  // },
  {
    type: "collapse",
    name: "Approvals",
    key: "approvals",
    icon: <Icon fontSize="small">fact_check</Icon>,
    route: "/approvals",
    component: <ApprovalsManagement />,
  },
  {
    type: "collapse",
    name: "Coupons",
    key: "coupons",
    icon: <Icon fontSize="small">local_offer</Icon>,
    route: "/coupons",
    component: <CouponsManagement />,
  },
  {
    type: "collapse",
    name: "Kisan Cash Credits",
    key: "credits",
    icon: <Icon fontSize="small">account_balance_wallet</Icon>,
    route: "/credits",
    component: <KisanCreditsManagement />,
  },
  {
    type: "collapse",
    name: "Membership Plans",
    key: "membership",
    icon: <Icon fontSize="small">card_membership</Icon>,
    route: "/membership",
    component: <MembershipManagement />,
  },
  // REMOVED: Stores feature - not needed
  // {
  //   type: "collapse",
  //   name: "Stores",
  //   key: "stores",
  //   icon: <Icon fontSize="small">storefront</Icon>,
  //   route: "/stores",
  //   component: <StoresManagement />,
  // },
  // {
  //   type: "collapse",
  //   name: "Login",
  //   key: "mobile-login",
  //   icon: <Icon fontSize="small">login</Icon>,
  //   route: "/authentication/mobile-login",
  //   component: <MobileLogin />,
  // },
  {
    type: "collapse",
    name: "Logout",
    key: "sign-in",
    icon: <Icon fontSize="small">logout</Icon>,
    route: "/authentication/sign-in",
    component: <SignIn />,
  },
  // {
  //   type: "collapse",
  //   name: "Sign Up",
  //   key: "sign-up",
  //   icon: <Icon fontSize="small">assignment</Icon>,
  //   route: "/authentication/sign-up",
  //   component: <SignUp />,
  // },
];

export default routes;

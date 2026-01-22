import React, { useState, useEffect, useCallback, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FiHeart, FiEdit2, FiShoppingCart, FiMenu, FiX } from "react-icons/fi";
import farmLogo from "../assets/logo34.png";
import farmLogo1 from "../assets/farmLogo1.jpg";
import { useCart } from "../contexts/CartContext";
import CartPage from "./CartPage";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Menu, MenuItem } from "@mui/material";
import BASE_URL from "../Helper/Helper";
import { useSearch } from "../contexts/SearchContext";
import { useWishlist } from "../contexts/WishlistContext";
import { useLanguage } from "../contexts/LanguageContext";
import eFreshIcon from "../assets/images/e-fresh.png";
import eMedsIcon from "../assets/images/e-meds.png";
import locateIcon from "../assets/images/locate1.png";
import location2 from "../assets/images/location2.png";
import user1 from "../assets/images/user.png";
import search1 from "../assets/images/search1.png";
import CategoriesLaptopView from "./CategoriesLaptopView";
import CategoriesMobileView from "./CategoriesMobileView";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";
import deliveryBike from "../assets/images/deliveryBike.png";

// Helper function to get the first image URL from images array
const getFirstImageUrl = (product) => {
  if (product.images && product.images.length > 0) {
    return product.images[0].imageUrl;
  }
  return product.imageUrl || "";
};
const Navbar = () => {
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [isMenuOpen, setMenuOpen] = useState(false);
  const { language, changeLanguage, t } = useLanguage();
  const { cartCount, cartItems } = useCart();
  const { wishlistCount } = useWishlist();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation(); // Use React Router location for routing
  const { searchTerm, searchResults, handleSearch } = useSearch(); // Use the search context
  const [isCategoriesMenuOpen, setCategoriesMenuOpen] = useState(false); // Added state for categories menu visibility
  const dropdownRef = useRef(null);
  const [isPromoVisible, setIsPromoVisible] = useState(true);
  const [isServiceDropdownOpen, setServiceDropdownOpen] = useState(false);

  const [deliveryLocation, setDeliveryLocation] = useState({
    pincode: "",
    city: ""
  });
  const [manualMode, setManualMode] = useState(false);
  const [addressInput, setAddressInput] = useState("");
  const [pincodeInput, setPincodeInput] = useState("");

  const [locationDialogOpen, setLocationDialogOpen] = useState(false);

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const res = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${coords.latitude},${coords.longitude}&key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}`
          );
          const data = await res.json();
          const comp = data.results[0].address_components;
          const postal = comp.find(c => c.types.includes("postal_code"))?.long_name;
          const city =
            comp.find(c => c.types.includes("locality"))?.long_name ||
            comp.find(c => c.types.includes("administrative_area_level_2"))?.long_name;
          setDeliveryLocation({ pincode: postal || "", city: city || "" });
          setLocationDialogOpen(false);
        } catch (err) {
          toast.error("Could not reverse-geocode location");
        }
      },
      () => toast.error("Unable to fetch location")
    );
  };

  const handleManualSubmit = e => {
    e.preventDefault();
    if (!addressInput || !pincodeInput) {
      toast.error("Please fill both fields");
      return;
    }
    setDeliveryLocation({ pincode: pincodeInput, city: addressInput });
    setLocationDialogOpen(false);
    setManualMode(false);
  };


  const handleChooseDifferent = () => {
    // You could open a route, another modal, or inline address input
    navigate("/choose-location");
    setLocationDialogOpen(false);
  };

  const serviceDropdownRef = useRef(null);

  // close service dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        serviceDropdownRef.current &&
        !serviceDropdownRef.current.contains(event.target)
      ) {
        setServiceDropdownOpen(false);
      }
    }

    // only bind when open
    if (isServiceDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isServiceDropdownOpen]);

  const services = [
    { key: "estore", label: "e‑store", icon: farmLogo1, path: "/" },
    { key: "efresh", label: "e‑fresh", icon: eFreshIcon, path: "/e-fresh" },
    { key: "emed", label: "e‑meds", icon: eMedsIcon, path: "/e-meds" },
    // { key: "locate", label: "Locate",  icon: locateIcon,  path: "/locate" },
  ];

  const [selectedService, setSelectedService] = useState(services[0].key);

  useEffect(() => {
    const match = services.find(s => s.path === location.pathname);
    if (match) {
      setSelectedService(match.key);
    }
  }, [location.pathname]);


  const selected = services.find((s) => s.key === selectedService);

  const handleClosePromo = () => {
    setIsPromoVisible(false); // Hides promo, but only until refresh
  };


  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${BASE_URL}/category/get-category`);
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchSubCategories = async () => {
      try {
        const response = await fetch(
          `${BASE_URL}/subcategory/get-sub-category`
        );
        const data = await response.json();
        setSubCategories(data);
      } catch (error) {
        console.error("Error fetching subcategories:", error);
      }
    };
    fetchSubCategories();
  }, []);

  const fetchUserOrderDetails = useCallback(async () => {
    try {
      const storedUser = localStorage.getItem("user");
      if (!storedUser) return;

      const user = JSON.parse(storedUser);
      // First get all orders for the user
      const response = await fetch(`${BASE_URL}/order/get-orders`);
      const orders = await response.json();

      // Filter orders for current user and get the latest one
      const userOrders = orders.filter(order => order.user_id === user.id);
      if (userOrders.length > 0) {
        // Sort by date in descending order to get the latest order
        const latestOrder = userOrders.sort((a, b) => new Date(b.date) - new Date(a.date))[0];

        if (latestOrder.pincode && latestOrder.address) {
          setDeliveryLocation({
            pincode: latestOrder.pincode,
            city: latestOrder.address
          });
        }
      }
    } catch (error) {
      console.error("Error fetching user order details:", error);
    }
  }, []);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setIsLoggedIn(true);
      setUser(JSON.parse(storedUser));
      fetchUserOrderDetails();
    }
  }, [fetchUserOrderDetails]);

  const handleLogout = useCallback(() => {
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setUser(null);
    setAnchorEl(null);
    navigate("/login");
  }, [navigate]);

  const handleSearchResultClick = (productId) => {
    handleSearch("");
    navigate(`/product/${productId}`);
  };

  const handleCartClick = () => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      setIsCartOpen(true);
    } else {
      if (location.pathname !== "/login" && location.pathname !== "/signup") {
        toast.info("Please login to view your cart", {
          toastId: "login-cart-toast",
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
      navigate("/login");
    }
  };

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (searchResults.length > 0 && dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        handleSearch(""); // Clear search term to hide dropdown
      }
    };

    document.addEventListener("click", handleOutsideClick);
    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
  }, [handleSearch, searchResults.length]);

  const handleMenuClick = (event) => setAnchorEl(event.currentTarget);

  const handleMenuClose = () => setAnchorEl(null);

  // Check if the current path matches a given route
  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="relative">
      {/* Promotional Header */}
      {isPromoVisible && (
        <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white text-center py-2 px-4 flex items-center justify-between relative">
          {/* Promotional Text (Left-Aligned) */}
          <span className="text-sm font-medium">
            {/* 🎉 Get 10% off on your first order! Use code: <b>WELCOME10</b> */}
          </span>

          {/* Right-Aligned Container */}
          <div className="flex items-center gap-4">
            {/* Link to Become Entrepreneur */}
            <a href="/become-entrepreneur" className="text-white underline">
              {t('header.becomeEntrepreneur')}
            </a>

            {/* Close Button */}
            <button onClick={handleClosePromo} className="text-white">
              <FiX className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* MOBILE HEADER - Only visible on mobile */}
      <div className="block md:hidden bg-white border-b shadow-md z-40">
        {/* Top Row: Logo (left) + Search (right) + Hamburger/Profile/Cart/Wishlist */}
        <div className="flex items-center justify-between px-2 py-1">
          {/* Logo on the left */}
          <div className="flex items-center flex-shrink-0">
            <button onClick={() => setCategoriesMenuOpen(!isCategoriesMenuOpen)}>
              {isCategoriesMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
            </button>
            <Link to="/">
              <img src={farmLogo} alt="Logo" className="h-16 ml-2" />
            </Link>
          </div>
          {/* Search input to the right of logo */}
          <div className="flex-1 mx-2 relative">
            <input
              type="text"
              value={searchTerm}
              placeholder={t('header.search')}
              className="w-full border-2 border-green-500 rounded-md px-3 py-2"
              onChange={(e) => handleSearch(e.target.value)}
            />
            <div className="absolute right-3 top-2 flex items-center">
              <img src={search1} alt="search1" className="w-6 h-6" />
            </div>
            {searchResults.length > 0 && (
              <div
                ref={dropdownRef}
                className="absolute top-11 left-0 w-full h-auto max-w-xs transform bg-white px-2 py-1 shadow-xl transition-all rounded-lg z-50"
              >
                <p className="font-medium text-black mb-2">{t('header.searchResults')}</p>
                <div className="space-y-1">
                  {searchResults.map((product) => (
                    <div
                      key={product._id}
                      onClick={() => handleSearchResultClick(product._id)}
                      className="flex items-center space-x-2 mb-1 cursor-pointer hover:bg-gray-100 p-1 rounded"
                    >
                      <img
                        src={getFirstImageUrl(product)}
                        alt={product.title}
                        className="w-8 h-8 object-cover rounded"
                      />
                      <p className="text-sm font-medium text-black">
                        {product.title} - {product.sub_title}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          {/* Profile, Wishlist, Cart */}
          <div className="flex items-center space-x-2 flex-shrink-0">
            {/* Wishlist */}
            <Link to="/wishlist" className="relative">
              <FiHeart className="w-6 h-6" />
              {wishlistCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full text-xs w-4 h-4 flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>
            {/* Profile/Login Dropdown */}
            <div>
              {isLoggedIn ? (
                <button onClick={handleMenuClick} className="flex items-center">
                  <span className="text-sm font-medium">{user?.name.charAt(0).toUpperCase()}</span>
                </button>
              ) : (
                <button onClick={() => navigate("/login")} className="flex items-center text-sm font-medium text-gray-600">
                  <img src={user1} alt="user" className="w-6 h-6 mr-2" />
                </button>
              )}
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                PaperProps={{ style: { width: 230 } }}
              >
                <MenuItem>Welcome, {user?.name || "User"}</MenuItem>
                <MenuItem onClick={() => navigate("/myorders")}>My Orders</MenuItem>
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </Menu>
            </div>
            {/* Cart */}
            <button onClick={handleCartClick} className="relative">
              <FiShoppingCart className="w-6 h-6" />
              {cartCount() > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full text-xs w-4 h-4 flex items-center justify-center">
                  {cartCount()}
                </span>
              )}
            </button>
          </div>
        </div>
        {/* Service Dropdown & Locate Button */}
        <div className="flex items-center justify-between px-2 py-2">
          {/* Service Dropdown (replaced with EmedsHeader style) */}
          <div ref={serviceDropdownRef} className="relative inline-block text-left w-1/2 mr-1">
            <button
              type="button"
              onMouseDown={e => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                setServiceDropdownOpen(o => !o);
              }}
              className="flex items-center w-full px-7 py-2 border border-green-500 rounded-md bg-white text-gray-700 focus:outline-none"
            >
              <img src={selected.icon} alt={selected.label} className="w-5 h-5 mr-2" />
              <span className="font-bold flex-1 text-left">{selected.label}</span>
              {isServiceDropdownOpen ? <FiChevronUp className="w-4 h-4" /> : <FiChevronDown className="w-4 h-4" />}
            </button>
            {isServiceDropdownOpen && (
              <div
                onMouseDown={e => e.stopPropagation()}
                className="absolute mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg z-50"
              >
                {services.map((s) => (
                  <div
                    key={s.key}
                    onClick={() => {
                      setSelectedService(s.key);
                      setServiceDropdownOpen(false);
                      navigate(s.path);
                    }}
                    className="flex items-center w-full px-5 py-2 hover:bg-gray-100 cursor-pointer text-left"
                  >
                    <img src={s.icon} alt={s.label} className="w-5 h-5 mr-2" />
                    <span className="text-sm">{s.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          {/* Locate Button */}
          <button
            className="flex items-center border border-green-500 rounded-md px-7 py-2 w-1/2 ml-1"
            onClick={() => navigate("/locate")}
          >
            <img src={locateIcon} alt="Locate" className="w-5 h-5 mr-2" />
            <span className="font-bold">{t('header.locate')}</span>
          </button>
        </div>
        {/* Delivery Info */}
        <div className="flex items-center justify-between px-2 py-1">
          <div>
            <div className="flex items-center">
              <img src={location2} alt="Location" className="w-8 h-8" />
              <span className="text-md">Delivery to <span className="font-bold text-orange-500">{deliveryLocation.city}-{deliveryLocation.pincode}</span></span>
            </div>
            <div className="flex">
              <img src={deliveryBike} alt="user" className="w-6 h-6 mr-2" />
              <div className="text-s font-bold">Insta Delivery within <span className="text-green-600">30-60 Minutes</span></div>
            </div>
          </div>
          <button onClick={() => setLocationDialogOpen(true)} className="border border-blue-600 px-2 py-1 rounded text-black-600">{t('header.change')}</button>
        </div>
        {/* Hamburger menu for categories */}
        {isCategoriesMenuOpen && (
          <div className="lg:hidden">
            <CategoriesMobileView
              categories={categories}
              subCategories={subCategories}
              activeCategory={activeCategory}
              setActiveCategory={setActiveCategory}
              onClose={() => setCategoriesMenuOpen(false)}
            />
          </div>
        )}
        <CartPage isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      </div>

      {/* DESKTOP HEADER - Only visible on md+ */}
      <nav className="hidden md:block bg-white border-b shadow-md relative z-40">
        {locationDialogOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
            onClick={() => setLocationDialogOpen(false)}
          >
            <div
              className="relative bg-white rounded-lg w-full max-w-sm mx-auto"
              onClick={e => e.stopPropagation()}
            >
              <button
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                onClick={() => setLocationDialogOpen(false)}
              >
                <FiX className="w-5 h-5" />
              </button>
              <div className="px-6 py-4 border-b">
                <h2 className="text-lg font-semibold">{t('header.deliverTo')}</h2>
              </div>
              <div className="px-6 py-4 flex flex-col gap-4">
                {!manualMode ? (
                  <>
                    <button
                      className="w-full py-2 bg-green-500 text-white rounded-md"
                      onClick={handleUseCurrentLocation}
                    >
                      {t('header.useCurrentLocation')}
                    </button>
                    <div className="text-center text-gray-500">— or —</div>
                    <button
                      className="w-full py-2 border border-gray-300 rounded-md"
                      onClick={() => setManualMode(true)}
                    >
                      {t('header.chooseDifferentLocation')}
                    </button>
                  </>
                ) : (
                  <form onSubmit={handleManualSubmit} className="flex flex-col gap-3">
                    <input
                      type="text"
                      placeholder={t('header.areaAddress')}
                      value={addressInput}
                      onChange={e => setAddressInput(e.target.value)}
                      className="w-full border rounded px-3 py-2"
                    />
                    <input
                      type="text"
                      placeholder={t('header.pincode')}
                      value={pincodeInput}
                      onChange={e => setPincodeInput(e.target.value)}
                      className="w-full border rounded px-3 py-2"
                    />
                    <button
                      type="submit"
                      className="w-full py-2 bg-green-500 text-white rounded-md"
                    >
                      {t('header.save')}
                    </button>
                    <button
                      type="button"
                      className="mt-1 text-gray-600"
                      onClick={() => setManualMode(false)}
                    >
                      ← {t('header.back')}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col md:flex-row md:justify-between md:items-center lg:flex-row lg:justify-between lg:items-center px-3 py-1">
          {" "}
          <div className="flex justify-between items-center w-full lg:w-auto">
            <button
              onClick={() => setCategoriesMenuOpen(!isCategoriesMenuOpen)}
              className="text-black md:hidden lg:hidden mr-1"
            >
              {isCategoriesMenuOpen ? (
                <FiX className="w-6 h-6" />
              ) : (
                <FiMenu className="w-6 h-6" />
              )}
            </button>
            <Link to="/">
              <img src={farmLogo} alt="Logo" className="h-24" />
            </Link>
            <div className="flex md:hidden items-center gap-4 lg:hidden">

              <div>
                {isLoggedIn ? (
                  <button onClick={handleMenuClick}>
                    <div className="flex items-center">
                      <span className="text-sm font-medium">
                        {user?.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </button>
                ) : (
                  <button
                    onClick={() => navigate("/login")}
                    className="flex items-center text-sm font-medium text-gray-600"
                  >
                    <img src={user1} alt="user" className="w-6 h-6 mr-2" />
                  </button>
                )}

                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                  PaperProps={{ style: { width: 230 } }}
                >
                  <MenuItem>{t('header.welcome')}, {user?.name || "User"}</MenuItem>
                  <MenuItem onClick={() => navigate("/myorders")}>
                    {t('header.myOrders')}
                  </MenuItem>
                  <MenuItem onClick={handleLogout}>{t('header.logout')}</MenuItem>
                </Menu>
              </div>
              <Link to="/wishlist" className="relative">
                <FiHeart className="w-5 h-5" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full text-xs w-4 h-4 flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </Link>
              <button
                onClick={handleCartClick}
                className="relative text-gray-600 hover:text-gray-800 cart-icon flex items-center"
              >
                <div className="relative">
                  <FiShoppingCart className="w-5 h-5" />
                  {cartCount() > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full text-xs w-4 h-4 flex items-center justify-center">
                      {cartCount()}
                    </span>
                  )}
                </div>
                <span className="text-sm font-medium text-gray-600 ml-2">{t('header.cart')}</span>
              </button>
            </div>
          </div>
          <div className="flex flex-col items-center lg:mt-4 w-full lg:w-auto">
            <div className="flex items-center mr-2">
              <img src={location2} alt="Location" className="w-12 h-12" />
              <div className="flex flex-col">
                <span className="text-md font-medium">{t('header.delivering')}  <span className="text-md text-orange-500 font-medium">{deliveryLocation.pincode}</span></span>
                <span className="text-md flex items-center justify-center font-medium"><span className="text-md flex items-center justify-center text-orange-500 font-medium">{deliveryLocation.city}</span></span>
              </div>
              <FiEdit2
                className="ml-1 w-5 h-5 cursor-pointer"
                onClick={() => {
                  setManualMode(false);
                  setLocationDialogOpen(true);
                }}
              />

            </div>

            {/* Service Dropdown & Locate Button */}
            <div className="flex items-center justify-between px-2 py-2">
              {/* Service Dropdown */}
              <div ref={serviceDropdownRef} className="relative inline-block text-left w-1/2 mr-1">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setServiceDropdownOpen((o) => !o);
                  }}
                  className="flex items-center w-full px-3 py-2 border border-green-500 rounded-md bg-white text-gray-700 focus:outline-none"
                >
                  <img src={selected.icon} alt={selected.label} className="w-5 h-5 mr-2" />
                  <span className="font-bold flex-1 text-left">{selected.label}</span>
                  {isServiceDropdownOpen ? <FiChevronUp className="w-4 h-4" /> : <FiChevronDown className="w-4 h-4" />}
                </button>
                {isServiceDropdownOpen && (
                  <div
                    className="absolute mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg z-50"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {services.map((s) => (
                      <Link
                        key={s.key}
                        to={s.path}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedService(s.key);
                          setServiceDropdownOpen(false);
                        }}
                        className={`flex items-center w-full px-3 py-2 hover:bg-gray-100 cursor-pointer text-left ${selectedService === s.key ? 'bg-green-100 font-bold' : ''}`}
                      >
                        <img src={s.icon} alt={s.label} className="w-5 h-5 mr-2" />
                        <span className="text-sm">{s.label}</span>
                        {selectedService === s.key && <span className="ml-auto text-green-600">✓</span>}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
              {/* Locate Button */}
              <button
                className="flex items-center border border-green-500 rounded-md px-3 py-2 w-1/2 ml-1"
                onClick={() => navigate("/locate")}
              >
                <img src={locateIcon} alt="Locate" className="w-5 h-5 mr-2" />
                <span className="font-bold">{t('header.locate')}</span>
              </button>
            </div>
          </div>
          <div className="w-full flex-grow mx-1 relative lg:max-w-xs">
            <input
              type="text"
              value={searchTerm}
              placeholder={t('header.search')}
              className="w-full border-2 border-green-500 rounded-md px-3 py-2" // Adjusted padding
              onChange={(e) => handleSearch(e.target.value)} // Update search term on change
            />
            <div className="absolute right-0 top-0 bottom-0 flex items-center">
              <img src={search1} alt="search1" className="w-6 h-6 mr-2" />{" "}
              {/* Reduced size */}
            </div>

            {searchResults.length > 0 && (
              <div
                ref={dropdownRef}
                className="absolute top-11 left-0 w-full sm:w-80 h-auto max-w-xs transform bg-white px-2 py-1 shadow-xl transition-all rounded-lg z-50"
              >
                {" "}
                {/* Reduced padding */}
                <p className="font-medium text-black mb-2">{t('header.searchResults')}</p>{" "}
                {/* Reduced margin */}
                <div className="space-y-1">
                  {searchResults.map((product) => (
                    <div
                      key={product._id}
                      onClick={() => handleSearchResultClick(product._id)}
                      className="flex items-center space-x-2 mb-1 cursor-pointer hover:bg-gray-100 p-1 rounded" // Adjusted spacing and padding
                    >
                      <img
                        src={getFirstImageUrl(product)}
                        alt={product.title}
                        className="w-8 h-8 object-cover rounded"
                      />
                      <p className="text-sm font-medium text-black">
                        {product.title} - {product.sub_title}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="hidden md:flex items-center space-x-4 md:space-x-6">
            <div className="flex items-center">
              <span className="language-icon"></span>{" "}
              <select
                value={language}
                onChange={(e) => changeLanguage(e.target.value)}
                className="border border-green-400 bg-white rounded px-2 py-1 text-gray-600"
              >
                <option value="en">{t('common.english')}</option>
                <option value="hi">{t('common.hindi')}</option>
                <option value="te">{t('common.telugu')}</option>
              </select>
            </div>

            <div>
              {isLoggedIn ? (
                <button onClick={handleMenuClick}>
                  <div className="flex items-center">
                    <span className="text-sm font-medium">
                      {user?.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </button>
              ) : (
                <button
                  onClick={() => navigate("/login")}
                  className="flex items-center text-sm font-medium text-gray-600"
                >
                  <img src={user1} alt="user" className="w-6 h-6 mr-2" />
                  <span>{t('header.login')}</span>
                </button>
              )}

              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                PaperProps={{ style: { width: 230 } }}
              >
                <MenuItem>{t('header.welcome')}, {user?.name || "User"}</MenuItem>
                <MenuItem onClick={() => navigate("/myorders")}>
                  {t('header.myOrders')}
                </MenuItem>
                <MenuItem onClick={handleLogout}>{t('header.logout')}</MenuItem>
              </Menu>
            </div>
            <Link
              to="/wishlist"
              className="relative text-gray-600 hover:text-gray-800 cart-icon flex items-center"
            >
              <div className="relative">
                <FiHeart className="w-5 h-5" />

                {wishlistCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full text-xs w-4 h-4 flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </div>

              <span className="text-sm font-medium text-gray-600 ml-2">
                {t('header.wishlist')}
              </span>
            </Link>
            <button
              onClick={handleCartClick}
              className="relative text-gray-600 hover:text-gray-800 cart-icon flex items-center"
            >
              <div className="relative">
                <FiShoppingCart className="w-5 h-5" />
                {cartCount() > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full text-xs w-4 h-4 flex items-center justify-center">
                    {cartCount()}
                  </span>
                )}
              </div>
              <span className="text-sm font-medium text-gray-600 ml-2">{t('header.cart')}</span>
            </button>
          </div>
        </div>

        <div className="hidden md:block">
          <CategoriesLaptopView
            categories={categories}
            subCategories={subCategories}
          />
        </div>

        {isCategoriesMenuOpen && (
          <div className="lg:hidden">
            <CategoriesMobileView
              categories={categories}
              subCategories={subCategories}
              activeCategory={activeCategory}
              setActiveCategory={setActiveCategory}
              onClose={() => setCategoriesMenuOpen(false)}
            />
          </div>
        )}
        <CartPage isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      </nav>
    </div>
  );
};

export default Navbar;
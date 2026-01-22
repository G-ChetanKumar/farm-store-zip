import React, { useEffect, useState, useRef } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import { getData } from "../lib/index";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import block from "../assets/block.png";
import BASE_URL from "../Helper/Helper";
import Navbar from "./Header";
import { BiSort } from "react-icons/bi";
import { HiChevronDown } from "react-icons/hi";
import { useCart } from "../contexts/CartContext";
import { useWishlist } from "../contexts/WishlistContext";
import wishlistIcon from "../assets/wishlist.png";
import filledHeartIcon from "../assets/wishlist1.png";
import shareIcon from "../assets/share.png";
import discountBadge from "../assets/discountBadge.png";
import plusIcon from "../assets/plusIcon.png";
import minusIcon from "../assets/minusIcon.png";
import downArrow from "../assets/down-arrow1.png";
import medical from "../assets/medical.png";
import { MdViewList, MdGridView } from "react-icons/md";
import { FiFilter } from "react-icons/fi";

// Helper function to get the first image URL from images array
const getFirstImageUrl = (product) => {
  if (product.images && product.images.length > 0) {
    return product.images[0].imageUrl;
  }
  // Fallback to imageUrl if images array doesn't exist
  return product.imageUrl || "";
};

const Productpage = () => {
  const { categoryId, subcategoryId, brandId, cropId } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortOption, setSortOption] = useState("default");
  const [error, setError] = useState(null);
  const location = useLocation();
  const { addToWishlist, isItemInWishlist } = useWishlist();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [userType, setUserType] = useState(null);
  const [eStoreId, setEStoreId] = useState(null);
  const scrollRef = useRef();
  const getDefaultViewMode = () => {
      if (typeof window !== 'undefined' && window.innerWidth < 640) {
        return 'list';
      }
      return 'grid';
    };
    const [viewMode, setViewMode] = React.useState(getDefaultViewMode());
  const [showSortModal, setShowSortModal] = useState(false);
  const [discountFilter, setDiscountFilter] = useState(null); // New state for discount filter
  const [showFilterModal, setShowFilterModal] = useState(false); // For mobile filter modal

  // Extract brandName from the URL query parameters
  const searchParams = new URLSearchParams(location.search);
  const brandName = searchParams.get("brandName") || "Products";

  // Define a share handler (replace with your own sharing logic)
  const handleShare = (product) => {
    console.log("Share clicked", product);
    // For example, you might use the Web Share API or open a share modal.
    if (navigator.share) {
      navigator
        .share({
          title: product.title,
          text: product.sub_title,
          url: window.location.href,
        })
        .then(() => console.log("Shared successfully"))
        .catch((error) => console.error("Error sharing", error));
    } else {
      alert("Share functionality is not supported on this browser.");
    }
  };

  useEffect(() => {
    const getUserType = () => {
      const directUserType = localStorage.getItem("userType");
      if (directUserType) {
        return directUserType;
      }

      // If not, try to get it from the user object
      const userStr = localStorage.getItem("user");
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          if (user && user.user_type) {
            return user.user_type;
          }
        } catch (e) {
          console.error("Error parsing user JSON:", e);
        }
      }

      return null;
    };

    setUserType(getUserType());
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const endpoint = `${BASE_URL}/product/get-product`;
        const data = await getData(endpoint);

        let filteredProducts;

        if (cropId) {
          filteredProducts = data.filter(
            (product) => product.crop_id === cropId
          );
        } else if (brandId) {
          filteredProducts = data.filter(
            (product) => product.brand_id === brandId
          );
        } else if (categoryId && subcategoryId) {
          filteredProducts = data.filter(
            (product) =>
              product.category_id === categoryId &&
              product.sub_category_id === subcategoryId
          );
        } else {
          filteredProducts = data;
        }

        setProducts(filteredProducts);
      } catch (error) {
        console.error("Error fetching products:", error);
        setError("Failed to load products. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [categoryId, subcategoryId, brandId, cropId]);

  const handleSort = (value) => {
    setSortOption(value);
    let sortedProducts = [...products];

    if (value === "az") {
      sortedProducts.sort((a, b) => a.title.localeCompare(b.title));
    } else if (value === "za") {
      sortedProducts.sort((a, b) => b.title.localeCompare(a.title));
    } else if (value === "priceLowHigh") {
      sortedProducts.sort((a, b) => {
        const aPkg = getPackageData(a)[0];
        const bPkg = getPackageData(b)[0];
        if (!aPkg || !bPkg) return 0;
        return aPkg.sell_price - bPkg.sell_price;
      });
    } else if (value === "priceHighLow") {
      sortedProducts.sort((a, b) => {
        const aPkg = getPackageData(a)[0];
        const bPkg = getPackageData(b)[0];
        if (!aPkg || !bPkg) return 0;
        return bPkg.sell_price - aPkg.sell_price;
      });
    }
    setProducts(sortedProducts);

    // Use requestAnimationFrame to ensure DOM update before scrolling
    requestAnimationFrame(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTo({
          left: 0,
          behavior: "smooth",
        });
      }
    });
  };

  const getPackageData = (product) => {
    if (
      userType === "Agri-Retailer" &&
      product.retailer_package_qty &&
      product.retailer_package_qty.length > 0
    ) {
      return product.retailer_package_qty;
    }
    return product.package_qty;
  };

  // Helper function to get the default package prices
  const getDefaultPackagePrices = (product) => {
    if (product.package_qty && product.package_qty.length > 0) {
      const defaultPackage = product.package_qty[0];
      return {
        mrp: defaultPackage.mrp_price,
        sell: defaultPackage.sell_price,
        pkgInfo: `${defaultPackage.qty} ${defaultPackage.pkgName}`,
      };
    }
    return { mrp: "N/A", sell: "N/A", pkgInfo: "N/A" };
  };

  // Helper to calculate discount percentage for a product's default package
  const getDiscountPercent = (product) => {
    const pkg = getPackageData(product)[0];
    if (!pkg || !pkg.mrp_price || !pkg.sell_price) return 0;
    return Math.round(((pkg.mrp_price - pkg.sell_price) / pkg.mrp_price) * 100);
  };

  // Discount filter ranges
  const discountRanges = [
    { label: "0% - 10%", min: 0, max: 10 },
    { label: "11% - 20%", min: 11, max: 20 },
    { label: "21% - 30%", min: 21, max: 30 },
    { label: "31% - 40%", min: 31, max: 40 },
    { label: "41% - 50%", min: 41, max: 50 },
    { label: "51% - 60%", min: 51, max: 60 },
    { label: "61% And Above", min: 61, max: 1000 },
  ];

  // Filter and sort products
  const getFilteredSortedProducts = () => {
    let filtered = [...products];
    if (discountFilter) {
      filtered = filtered.filter((product) => {
        const discount = getDiscountPercent(product);
        return discount >= discountFilter.min && discount <= discountFilter.max;
      });
    }
    // Sorting logic (same as handleSort)
    if (sortOption === "az") {
      filtered.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortOption === "za") {
      filtered.sort((a, b) => b.title.localeCompare(a.title));
    } else if (sortOption === "priceLowHigh") {
      filtered.sort((a, b) => {
        const aPkg = getPackageData(a)[0];
        const bPkg = getPackageData(b)[0];
        if (!aPkg || !bPkg) return 0;
        return aPkg.sell_price - bPkg.sell_price;
      });
    } else if (sortOption === "priceHighLow") {
      filtered.sort((a, b) => {
        const aPkg = getPackageData(a)[0];
        const bPkg = getPackageData(b)[0];
        if (!aPkg || !bPkg) return 0;
        return bPkg.sell_price - aPkg.sell_price;
      });
    }
    return filtered;
  };

  const ProductDialog = ({ product, onClose, isOpen }) => {
    const dialogRef = useRef(null);
    const { addToCart, removeFromCart, isItemInCart, getItemQuantity } = useCart();
    const [localQuantities, setLocalQuantities] = useState({});

    useEffect(() => {
      if (isOpen) {
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "auto";
      }
      return () => {
        document.body.style.overflow = "auto";
      };
    }, [isOpen]);

    useEffect(() => {
      const handleOutsideClick = (event) => {
        if (dialogRef.current && !dialogRef.current.contains(event.target)) {
          onClose();
        }
      };
      if (isOpen) {
        document.addEventListener("mousedown", handleOutsideClick);
      }
      return () => {
        document.removeEventListener("mousedown", handleOutsideClick);
      };
    }, [isOpen, onClose]);

    // Reusing the same getPackageData function
    const getPackageDataDialog = (product) => {
      if (
        userType === "Agri-Retailer" &&
        product.retailer_package_qty &&
        product.retailer_package_qty.length > 0
      ) {
        return product.retailer_package_qty;
      }
      return product.package_qty;
    };

    useEffect(() => {
      if (isOpen && product) {
        const packageData = getPackageDataDialog(product);
        const quantities = {};
        packageData.forEach((pkg) => {
          const quantity = getItemQuantity(product._id, pkg._id);
          quantities[pkg._id] = quantity;
        });
        setLocalQuantities(quantities);
      }
    }, [isOpen, product, getItemQuantity]);

    const handleAddToCart = (product, pkg) => {
      const currentQuantity = localQuantities[pkg._id] || 0;
      const newQuantity = currentQuantity + 1;
      setLocalQuantities((prev) => ({
        ...prev,
        [pkg._id]: newQuantity,
      }));
      const cartItem = {
        id: product._id,
        title: product.title,
        sub_title: product.sub_title,
        mfg_by: product.mfg_by,
        imageUrl: getFirstImageUrl(product),
        variant: {
          originalPrice: pkg.mrp_price,
          price: pkg.sell_price,
          quantity: newQuantity,
          packageId: pkg._id,
          packageName: pkg.pkgName,
          packageQty: pkg.qty,
          mfgDate: pkg.mfg_date,
          expDate: pkg.exp_date,
        },
      };
      addToCart(cartItem);
    };

    const handleRemoveFromCart = (product, pkg) => {
      const currentQuantity = localQuantities[pkg._id] || 0;
      if (currentQuantity > 0) {
        const newQuantity = currentQuantity - 1;
        setLocalQuantities((prev) => ({
          ...prev,
          [pkg._id]: newQuantity,
        }));

        if (newQuantity === 0) {
          removeFromCart(product._id, pkg._id);
        } else {
          const cartItem = {
            id: product._id,
            title: product.title,
            sub_title: product.sub_title,
            mfg_by: product.mfg_by,
            imageUrl: getFirstImageUrl(product),
            variant: {
              originalPrice: pkg.mrp_price,
              price: pkg.sell_price,
              quantity: newQuantity,
              packageId: pkg._id,
              packageName: pkg.pkgName,
              packageQty: pkg.qty,
              mfgDate: pkg.mfg_date,
              expDate: pkg.exp_date,
            },
          };
          addToCart(cartItem);
        }
      }
    };

    if (!isOpen || !product) return null;
    const packageData = getPackageDataDialog(product);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
        <div
          ref={dialogRef}
          className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative"
        >
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-red-400 hover:text-red-500 text-lg"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-6 h-6"
            >
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="flex items-start mb-4">
            <img
              src={getFirstImageUrl(product)}
              alt={product.title}
              className="w-32 h-32 object-contain border rounded"
            />
            <div className="ml-4 flex-1">
              <h3 className="text-lg font-bold text-gray-800">
                {product.title}
              </h3>
              <h4 className="text-sm font-medium text-gray-600">
                {product.mfg_by}
              </h4>
            </div>
          </div>

          <div className="mt-4">
            <h4 className="text-md font-semibold text-gray-800 mb-2">
              Choose Variants
            </h4>
            <div
              style={{ maxHeight: "300px", overflowY: "auto" }}
              className="space-y-4 pr-1 scrollbar-thin"
            >
              {packageData.map((pkg) => (
                <div key={pkg._id}>
                  <div className="flex justify-between items-center border p-2 rounded border-gray-300">
                    <div>
                      <p className="text-black-800 text-md font-bold">
                        {pkg.qty} {pkg.pkgName}
                      </p>
                      <div className="flex items-center space-x-2">
                        <div className="text-base font-medium text-black-600">
                          ₹{pkg.sell_price}
                        </div>
                        <div className="text-xs text-gray-500 line-through">
                          ₹{pkg.mrp_price}
                        </div>
                        <div className="bg-orange-600 text-white text-xs font-bold px-2 py-1 rounded-md shadow-md">
                          {Math.round(
                            ((pkg.mrp_price - pkg.sell_price) / pkg.mrp_price) * 100
                          )}
                          % OFF
                        </div>
                      </div>
                      <p className="text-xs text-green-600">
                        Saved ₹{pkg.mrp_price - pkg.sell_price}
                      </p>
                      <span>
                        <span className="text-xs">Expiry :</span>{" "}
                        {pkg.exp_date ? (
                          <span className="text-xs text-red-600">
                            {new Date(pkg.exp_date).toLocaleDateString("en-GB")}
                          </span>
                        ) : (
                          "N/A"
                        )}
                      </span>
                    </div>

                    <div>
                      <p className="text-sm text-center text-orange-600">
                        ₹{(pkg.sell_price / pkg.qty).toFixed(2)}/{pkg.pkgName}
                      </p>
                      {localQuantities[pkg._id] > 0 ? (
                        <div className="flex items-center space-x-2 border-2 border-gray-300 px-3 py-1 rounded">
                          <button onClick={() => handleRemoveFromCart(product, pkg)}>
                            <img src={minusIcon} alt="Remove" className="w-4 h-4" />
                          </button>
                          <span className="w-8 text-center">{localQuantities[pkg._id]}</span>
                          <button onClick={() => handleAddToCart(product, pkg)}>
                            <img src={plusIcon} alt="Add" className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          className="bg-gray-600 hover:bg-orange-600 text-white px-4 py-1 rounded text-sm"
                          onClick={() => handleAddToCart(product, pkg)}
                        >
                          Add to Cart
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {(!Array.isArray(packageData) || packageData.length === 0) && (
                <p className="text-gray-500 text-sm">
                  No package sizes available for this product.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const handlePackageSelect = (productId) => {
    const product = products.find((p) => p._id === productId);
    if (product) {
      console.log("Selected product:", product);
      setSelectedProduct(product);
      setIsDialogOpen(true);
    } else {
      console.error(`Product with ID ${productId} not found`);
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
  };

  const handleWishlistClick = (e, product) => {
    e.preventDefault();
    const packageData = getPackageData(product);
    // Get the first package's pricing info (assuming we want to use the first package)
    const defaultPackage = packageData[0];

    addToWishlist({
      id: product._id,
      title: product.title,
      sub_title: product.sub_title,
      mfg_by: product.mfg_by,
      imageUrl: getFirstImageUrl(product),
      package_qty: packageData,
      selectedPackage: {
        id: defaultPackage._id,
        pkgName: defaultPackage.pkgName,
        qty: defaultPackage.qty,
        mrp_price: defaultPackage.mrp_price,
        sell_price: defaultPackage.sell_price,
        mfg_date: defaultPackage.mfg_date,
        exp_date: defaultPackage.exp_date,
      },
    });
  };

  return (
    <>
      <Navbar />
      <div className="p-3">
        {/* Full-width Banner */}
        <div
          className="w-full h-24 flex justify-center items-center"
          style={{
            background: "linear-gradient(to right, rgb(61, 165, 79), #C6861A)",
          }}
        >
          <h2 className="text-3xl md:text-4xl lg:text-4xl font-bold text-white">
            {brandName}
          </h2>
        </div>

        {/* Sorting/Filter and View Toggle Row (mobile: left=sort/filter, right=view toggle) */}
        <div className="flex justify-between items-center mt-4">
          {/* Left: Sort By and Filter By (mobile: block, desktop: hidden) */}
          <div className="flex items-center space-x-4 md:hidden">
            <div
              className="flex items-center cursor-pointer"
              onClick={() => setShowSortModal(true)}
            >
              <BiSort className="text-gray-500 w-5 h-5 mr-1" />
              <span className="text-sm font-medium text-gray-700">Sort By</span>
            </div>
            <div
              className="flex items-center cursor-pointer"
              onClick={() => setShowFilterModal(true)}
            >
              <FiFilter className="w-5 h-5 text-gray-500 mr-1" />
              <span className="text-sm font-medium text-gray-700">Filter By</span>
            </div>
          </div>
          {/* Right: Grid/List Toggle (mobile only) */}
          <div className="flex items-center space-x-2 md:hidden">
            <button
              className={`p-2 rounded ${viewMode === "grid" ? "bg-green-200" : "bg-gray-200"}`}
              onClick={() => setViewMode("grid")}
              aria-label="Grid View"
            >
              <MdGridView className={`w-6 h-6 ${viewMode === "grid" ? "text-green-700" : "text-gray-500"}`} />
            </button>
            <button
              className={`p-2 rounded ${viewMode === "list" ? "bg-green-200" : "bg-gray-200"}`}
              onClick={() => setViewMode("list")}
              aria-label="List View"
            >
              <MdViewList className={`w-6 h-6 ${viewMode === "list" ? "text-green-700" : "text-gray-500"}`} />
            </button>
          </div>
          {/* Desktop: Sorting and Filter Dropdowns */}
          <div className="relative inline-flex items-center hidden md:flex space-x-2">
            <div className="relative">
              <BiSort className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
              <select
                className="border border-black rounded pl-8 pr-8 bg-white py-2 text-sm appearance-none"
                value={sortOption}
                onChange={(e) => handleSort(e.target.value)}
              >
                <option value="default">Sort By</option>
                <option value="az">Alphabetical (A-Z)</option>
                <option value="za">Alphabetical (Z-A)</option>
                <option value="priceLowHigh">Price (Low to High)</option>
                <option value="priceHighLow">Price (High to Low)</option>
              </select>
              <HiChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
            </div>
            <div className="relative">
              <FiFilter className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
              <select
                className="border border-black rounded pl-8 pr-8 bg-white py-2 text-sm appearance-none"
                value={discountFilter ? discountFilter.label : ""}
                onChange={e => {
                  const selected = discountRanges.find(r => r.label === e.target.value);
                  setDiscountFilter(selected || null);
                }}
              >
                <option value="">Filter By Discount</option>
                {discountRanges.map(range => (
                  <option key={range.label} value={range.label}>{range.label}</option>
                ))}
                <option value="clear">Clear Filter</option>
              </select>
              <HiChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Add spacing below the dropdown */}
        <div className="mt-2"></div>
        
        {/* Mobile Sort Modal */}
        {showSortModal && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-end sm:items-center justify-center md:hidden">
            <div className="bg-white w-full sm:w-80 rounded-t-lg sm:rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-2">Sort By</h3>
              <ul>       
                <li>
                  <button className="w-full text-left py-2" onClick={() => { handleSort('az'); setShowSortModal(false); }}>Alphabetical (A-Z)</button>
                </li>
                <li>
                  <button className="w-full text-left py-2" onClick={() => { handleSort('za'); setShowSortModal(false); }}>Alphabetical (Z-A)</button>
                </li>
                <li>
                  <button className="w-full text-left py-2" onClick={() => { handleSort('priceLowHigh'); setShowSortModal(false); }}>Price (Low to High)</button>
                </li>
                <li>
                  <button className="w-full text-left py-2" onClick={() => { handleSort('priceHighLow'); setShowSortModal(false); }}>Price (High to Low)</button>
                </li>
              </ul>
              <button className="mt-2 w-full py-2 bg-gray-200 rounded" onClick={() => setShowSortModal(false)}>Cancel</button>
            </div>
          </div>
        )}
        
        {/* Mobile Filter Modal */}
        {showFilterModal && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-end sm:items-center justify-center md:hidden">
            <div className="bg-white w-full sm:w-80 rounded-t-lg sm:rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-2">Filter By Discount</h3>
              <ul>
                {discountRanges.map(range => (
                  <li key={range.label}>
                    <button
                      className="w-full text-left py-2"
                      onClick={() => {
                        setDiscountFilter(range);
                        setShowFilterModal(false);
                      }}
                    >
                      {range.label}
                    </button>
                  </li>
                ))}
                <li>
                  <button
                    className="w-full text-left py-2 text-red-500"
                    onClick={() => {
                      setDiscountFilter(null);
                      setShowFilterModal(false);
                    }}
                  >
                    Clear Filter
                  </button>
                </li>
              </ul>
              <button className="mt-2 w-full py-2 bg-gray-200 rounded" onClick={() => setShowFilterModal(false)}>Cancel</button>
            </div>
          </div>
        )}
        
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-8 lg:grid-cols-8 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white border rounded-lg shadow-md p-4">
                <Skeleton height={150} className="mb-2" />
                <Skeleton width={`60%`} className="mb-1" />
                <Skeleton width={`40%`} />
                <Skeleton width={`50%`} className="mt-2" />
              </div>
            ))}
          </div>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : getFilteredSortedProducts().length > 0 ? (
          viewMode === "grid" ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {getFilteredSortedProducts().map((product) => {
                // Get the appropriate package array based on user type
                const packageData = getPackageData(product);

                // Skip rendering this product if it doesn't have package data for this user type
                if (!packageData || packageData.length === 0) {
                  return null;
                }

                // Default to first package in the array
                const defaultPackage = packageData[0];

                return (
                  <Link
                    to={`/product/${product._id}`}
                    key={product._id}
                    className="w-full"
                  >
                    <div className="bg-white border border-gray-200 rounded-lg shadow-md p-4 sm:p-4 relative transform transition duration-300 hover:shadow-lg">
                      {/* Discount Badge */}
                      {defaultPackage && (
                        <div className="absolute top-2 left-2">
                          <div className="relative w-12 h-12">
                            <img
                              src={discountBadge}
                              alt="Discount Badge"
                              className="w-full h-full object-contain"
                            />
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                              <span className="text-white text-xs font-bold leading-none">
                                {Math.round(
                                  ((defaultPackage.mrp_price -
                                    defaultPackage.sell_price) /
                                    defaultPackage.mrp_price) *
                                    100
                                )}
                                %
                              </span>
                              <span className="text-white text-xs font-medium leading-none">
                                OFF
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="absolute top-2 right-2 flex flex-col items-center space-y-2">
                        <img
                          src={
                            isItemInWishlist(product._id)
                              ? filledHeartIcon
                              : wishlistIcon
                          }
                          alt={
                            isItemInWishlist(product._id)
                              ? "Remove from Wishlist"
                              : "Add to Wishlist"
                          }
                          className="w-6 h-6 cursor-pointer"
                          onClick={(e) => handleWishlistClick(e, product)}
                        />
                        <img
                          src={shareIcon}
                          alt="Share"
                          className="w-6 h-6 cursor-pointer"
                          onClick={() => handleShare(product)}
                        />
                      </div>
                      {/* Product Image */}
                      <img
                        src={getFirstImageUrl(product)}
                        alt={product.title}
                        className="w-full h-28 sm:h-36 object-contain rounded-lg"
                      />

                      {/* Product Details */}
                      <h3 className="text-sm font-semibold text-gray-800 truncate">
                        {product.title}
                      </h3>
                      <div className="flex space-x-1">
                      <img src={medical} alt="medical" className="w-4 h-4" />
                      <p className="text-gray-500 text-xs mb-1 truncate">{product.sub_title}</p>
                      </div>
                      <div className="flex items-center text-xs text-gray-600 mb-1 space-x-1">
                        <strong className="whitespace-nowrap flex-shrink-0">MFG/MKTD BY :</strong>
                        <span className="text-red-400 truncate flex-grow ml-1 min-w-0">{product.mfg_by}</span>
                      </div>
                      <div className="package-qty-list">
                        {defaultPackage && (
                          <div>
                            <div>
                              {/* Desktop/Laptop view (row) */}
                              <div className="hidden sm:flex flex-row text-xs text-gray-600 space-x-2">
                                <span>
                                  <strong>MFG :</strong>{" "}
                                  {defaultPackage.mfg_date ? (
                                    <span className="text-green-600">
                                      {new Date(defaultPackage.mfg_date).toLocaleDateString("en-GB")}
                                    </span>
                                  ) : (
                                    "N/A"
                                  )}
                                </span>
                                <span>
                                  <span className="hidden sm:inline">|</span> <strong>EXP :</strong>{" "}
                                  {defaultPackage.exp_date ? (
                                    <span className="text-red-600">
                                      {new Date(defaultPackage.exp_date).toLocaleDateString("en-GB")}
                                    </span>
                                  ) : (
                                    "N/A"
                                  )}
                                </span>
                              </div>
                              {/* Mobile view (column) */}
                              <div className="flex flex-col text-xs mb-1 sm:hidden">
                                <div className="flex">
                                  <span className="font-semibold text-black w-7">MFG</span>
                                  <span className="font-semibold text-black">:</span>
                                  <span className="ml-1 text-green-600 font-medium">
                                    {defaultPackage.mfg_date
                                      ? new Date(defaultPackage.mfg_date).toLocaleDateString("en-GB")
                                      : "N/A"}
                                  </span>
                                </div>
                                <div className="flex">
                                  <span className="font-semibold text-black w-7">EXP</span>
                                  <span className="font-semibold text-black">:</span>
                                  <span className="ml-1 text-red-500 font-medium">
                                    {defaultPackage.exp_date
                                      ? new Date(defaultPackage.exp_date).toLocaleDateString("en-GB")
                                      : "N/A"}
                                  </span>
                                </div>
                              </div>
                            </div>
                            {/* Price Details */}
                            <div className="flex items-center space-x-2">
                              <div className="text-base font-bold text-black-600">
                                ₹{defaultPackage.sell_price}
                              </div>
                              <div className="text-base font-bold text-gray-500 line-through">
                                ₹{defaultPackage.mrp_price}
                              </div>
                            </div>
                            <p className="text-xs text-green-500">
                              Saved Price ₹
                              {defaultPackage.mrp_price - defaultPackage.sell_price}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-semibold text-gray-600 w-1/3">
                          Select
                        </label>
                        <div className="flex items-center w-2/3">
                          <div
                            className="w-full border border-green-300 text-xs rounded px-2 py-1 appearance-none text-center cursor-pointer flex items-center justify-center"
                            onClick={(e) => {
                              e.preventDefault();
                              handlePackageSelect(product._id);
                            }}
                          >
                            {defaultPackage && (
                              <span className="flex items-center space-x-1">
                                <span>
                                  {defaultPackage.qty} {defaultPackage.pkgName}
                                </span>
                                {/* ChevronDown Icon */}
                                <img src={downArrow} alt="Remove" className="w-5 h-5" />
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {getFilteredSortedProducts().map((product) => {
                const packageData = getPackageData(product);
                if (!packageData || packageData.length === 0) {
                  return null;
                }
                const defaultPackage = packageData[0];
                return (
                  <Link to={`/product/${product._id}`} key={product._id} className="w-full">
                    <div className="relative flex bg-white border border-gray-200 rounded-lg shadow-md p-2 items-center">
                      {/* Discount Badge (smaller, left of image) */}
                      {defaultPackage && (
                        <div className="absolute top-2 left-2 z-10">
                          <div className="relative w-8 h-8">
                            <img
                              src={discountBadge}
                              alt="Discount Badge"
                              className="w-full h-full object-contain"
                            />
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                              <span className="text-white text-[10px] font-bold leading-none">
                                {Math.round(
                                  ((defaultPackage.mrp_price - defaultPackage.sell_price) / defaultPackage.mrp_price) * 100
                                )}
                                %
                              </span>
                              <span className="text-white text-[9px] font-medium leading-none">
                                OFF
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                      {/* Wishlist and share icons (smaller, top-right) */}
                      <div className="absolute top-2 right-2 flex flex-col items-center space-y-1 z-10">
                        <img
                          src={isItemInWishlist(product._id) ? filledHeartIcon : wishlistIcon}
                          alt={isItemInWishlist(product._id) ? "Remove from Wishlist" : "Add to Wishlist"}
                          className="w-5 h-5 cursor-pointer"
                          onClick={(e) => handleWishlistClick(e, product)}
                        />
                        <img
                          src={shareIcon}
                          alt="Share"
                          className="w-5 h-5 cursor-pointer"
                          onClick={() => handleShare(product)}
                        />
                      </div>
                      <img
                        src={getFirstImageUrl(product)}
                        alt={product.title}
                        className="w-24 h-24 object-contain rounded-lg mr-4 ml-8"
                      />
                      <div className="flex-1">
                        <h3 className="text-base font-semibold text-gray-800">{product.title}</h3>
                        <div className="flex items-center space-x-1 mb-1">
                          <img src={medical} alt="medical" className="w-6 h-6" />
                          <p className="text-gray-500 text-xs">{product.sub_title}</p>
                        </div>
                        <div className="flex items-center text-xs text-gray-600 mb-1">
                          <strong>MFG/MKTD BY :</strong>
                          <span className="text-red-400 ml-1">{product.mfg_by}</span>
                        </div>
                        <div className="package-qty-list">
                          {defaultPackage && (
                            <div>
                              <div>
                                {/* Desktop/Laptop view (row) */}
                                <div className="hidden sm:flex flex-row text-xs text-gray-600 space-x-2">
                                  <span>
                                    <strong>MFG :</strong>{" "}
                                    {defaultPackage.mfg_date ? (
                                      <span className="text-green-600">
                                        {new Date(defaultPackage.mfg_date).toLocaleDateString("en-GB")}
                                      </span>
                                    ) : (
                                      "N/A"
                                    )}
                                  </span>
                                  <span>
                                    <span className="hidden sm:inline">|</span> <strong>EXP :</strong>{" "}
                                    {defaultPackage.exp_date ? (
                                      <span className="text-red-600">
                                        {new Date(defaultPackage.exp_date).toLocaleDateString("en-GB")}
                                      </span>
                                    ) : (
                                      "N/A"
                                    )}
                                  </span>
                                </div>
                                {/* Mobile view (column) */}
                                <div className="flex flex-col text-xs mb-1 sm:hidden">
                                  <div className="flex">
                                    <span className="font-semibold text-black w-7">MFG</span>
                                    <span className="font-semibold text-black">:</span>
                                    <span className="ml-1 text-green-600 font-medium">
                                      {defaultPackage.mfg_date
                                        ? new Date(defaultPackage.mfg_date).toLocaleDateString("en-GB")
                                        : "N/A"}
                                    </span>
                                  </div>
                                  <div className="flex">
                                    <span className="font-semibold text-black w-7">EXP</span>
                                    <span className="font-semibold text-black">:</span>
                                    <span className="ml-1 text-red-500 font-medium">
                                      {defaultPackage.exp_date
                                        ? new Date(defaultPackage.exp_date).toLocaleDateString("en-GB")
                                        : "N/A"}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              {/* Price Details */}
                              <div className="flex items-center space-x-2">
                                <div className="text-base font-bold text-black-600">
                                  ₹{defaultPackage.sell_price}
                                </div>
                                <div className="text-base font-bold text-gray-500 line-through">
                                  ₹{defaultPackage.mrp_price}
                                </div>
                              </div>
                              <p className="text-xs text-green-500">
                                Saved Price ₹{defaultPackage.mrp_price - defaultPackage.sell_price}
                              </p>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between mt-2">
                          <label className="text-xs font-semibold text-gray-600 w-1/3">
                            Select
                          </label>
                          <div className="flex items-center w-2/3">
                            <div
                              className="w-full border border-green-300 text-xs rounded px-2 py-1 appearance-none text-center cursor-pointer flex items-center justify-center"
                              onClick={e => {
                                e.preventDefault();
                                handlePackageSelect(product._id);
                              }}
                            >
                              {defaultPackage && (
                                <span className="flex items-center space-x-1">
                                  <span>
                                    {defaultPackage.qty} {defaultPackage.pkgName}
                                  </span>
                                  {/* ChevronDown Icon */}
                                  <img src={downArrow} alt="Remove" className="w-5 h-5" />
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )
        ) : (
          <div className="flex flex-col items-center justify-center text-center bg-white border rounded-lg shadow-md p-8">
            <h3 className="text-2xl font-bold text-gray-700 mb-2">
              No Products Available
            </h3>
            <p className="text-gray-600">
              We couldn't find any products matching this selection. Please check back later or explore other categories.
            </p>
            <img src={block} alt="No products available" className="w-40 h-40 mb-4" />
          </div>
        )}
        <ProductDialog product={selectedProduct} onClose={handleDialogClose} isOpen={isDialogOpen} />
      </div>
    </>
  );
};

export default Productpage;

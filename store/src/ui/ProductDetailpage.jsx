import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getData } from "../lib/index";
import { FaChevronRight, FaHome } from "react-icons/fa";
import { FaRegCalendarAlt, FaRegClock } from "react-icons/fa";
import { useCart } from "../contexts/CartContext";
import { useWishlist } from "../contexts/WishlistContext";
import BASE_URL from "../Helper/Helper";
import plusIcon from "../assets/plusIcon.png";
import minusIcon from "../assets/minusIcon.png";
import trashIcon from "../assets/delete.png";
import discount from "../assets/discountBadge.png";
import wishlistIcon from "../assets/wishlist.png";
import filledHeartIcon from "../assets/wishlist1.png";
import shareIcon from "../assets/share.png";
import Navbar from "./Header";
import compoundIcon from "../assets/compound.png";
import scheduleIcon from "../assets/schedule.png";
import downArrow from "../assets/down-arrow1.png";
import medical from "../assets/medical.png";
import discount01 from "../assets/discount01.png";
// Helper function to get the first image URL from images array
const getFirstImageUrl = (product) => {
  if (product.images && product.images.length > 0) {
    return product.images[0].imageUrl;
  }
  // Fallback to imageUrl if images array doesn't exist
  return product.imageUrl || "";
};

// Helper function to get all image URLs from images array
const getAllImageUrls = (product) => {
  if (product.images && product.images.length > 0) {
    return product.images.map((img) => img.imageUrl);
  }
  // Fallback to imageUrl if images array doesn't exist
  return product.imageUrl ? [product.imageUrl] : [];
};

// ProductVariants Component - Fixed Version
const ProductVariants = ({
  product,
  userType,
  localQuantities,
  onAdd,
  onRemove,
  onBuyNow,
  onClearQuantity,
}) => {
  // Helper: choose package data based on user type
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
  const variants = getPackageData(product);
  const isWholesale = userType === "Agri-Retailer";

  // Responsive state for desktop/laptop
  const [isDesktop, setIsDesktop] = useState(
    typeof window !== "undefined" ? window.innerWidth >= 1024 : false
  );
  const [selectedVariant, setSelectedVariant] = useState(variants[0]?._id);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const calculateDiscount = (mrp, sellPrice) => {
    return Math.round(((mrp - sellPrice) / mrp) * 100);
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold">Select</h3>
        {isWholesale && (
          <span className="inline-block bg-blue-500 text-white text-xs px-3 py-1 rounded-md font-semibold">
            Wholesale Pricing
          </span>
        )}
      </div>
      <div
        className="w-full overflow-x-auto"
        style={{ scrollbarWidth: "thin", scrollbarColor: "#888 #f1f1f1" }}
      >
        <div className="flex space-x-4 pb-2">
          {variants.map((pkg) => (
            <div
              key={pkg._id}
              className={`flex-shrink-0 w-[170px] h-[100px] border-2 rounded-lg p-2 bg-white cursor-pointer transition-all duration-200 flex flex-col justify-center items-center
                ${
                  selectedVariant === pkg._id
                    ? "border-green-500"
                    : "border-gray-300 hover:border-gray-400"
                }`}
              onClick={() => setSelectedVariant(pkg._id)}
            >
              <div className="flex items-center w-full justify-between">
                <p className="text-md font-semibold text-gray-800">
                  {pkg.qty} {pkg.pkgName}
                </p>
                <p className="text-xs text-red-500 ml-2 whitespace-nowrap">
                  ₹{(pkg.sell_price / pkg.qty).toFixed(2)}/{pkg.pkgName}
                </p>
              </div>
              <span className="block w-full border-t border-gray-200 my-2"></span>
              <span className="text-xl font-bold text-gray-900">
                ₹{pkg.sell_price}
              </span>
            </div>
          ))}
        </div>
        <style jsx>{`
          .overflow-x-auto::-webkit-scrollbar {
            height: 8px;
          }
          .overflow-x-auto::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 4px;
          }
          .overflow-x-auto::-webkit-scrollbar-thumb {
            background: #888;
            border-radius: 4px;
          }
          .overflow-x-auto::-webkit-scrollbar-thumb:hover {
            background: #555;
          }
        `}</style>
      </div>
      <div className="flex justify-center">
        {selectedVariant && (
          <div className="w-full">
            <div className="flex items-center gap-2">
              {localQuantities[selectedVariant] > 0 ? (
                <div className="flex items-center gap-3 border-2 border-gray-300 rounded-lg px-4 py-2 flex-grow justify-center">
                  {localQuantities[selectedVariant] === 1 ? (
                    <button
                      onClick={() =>
                        onClearQuantity(
                          variants.find((v) => v._id === selectedVariant)
                        )
                      }
                      className="text-red-500 font-bold text-xl"
                    >
                      <img src={trashIcon} alt="Clear" className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() =>
                        onRemove(
                          variants.find((v) => v._id === selectedVariant)
                        )
                      }
                      className="text-orange-500 font-bold text-xl"
                    >
                      <img src={minusIcon} alt="Remove" className="w-4 h-4" />
                    </button>
                  )}
                  <span className="w-8 text-center font-medium">
                    {localQuantities[selectedVariant]}
                  </span>
                  <button
                    onClick={() =>
                      onAdd(variants.find((v) => v._id === selectedVariant))
                    }
                    className="text-orange-500 font-bold text-xl"
                  >
                    <img src={plusIcon} alt="Add" className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() =>
                    onAdd(variants.find((v) => v._id === selectedVariant))
                  }
                  className="flex-grow bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded-lg font-medium transition-colors"
                >
                  Add to Cart
                </button>
              )}
              <button
                onClick={() =>
                  onBuyNow(variants.find((v) => v._id === selectedVariant))
                }
                className="flex-grow bg-orange-500 hover:bg-orange-600 text-white px-2 py-1 rounded-lg font-medium transition-colors"
              >
                Buy Now
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Breadcrumb Component
const Breadcrumb = ({ product, category, subcategory }) => (
  <nav className="bg-white p-4 rounded-lg shadow-md mb-4">
    <ol className="flex flex-wrap items-center text-sm">
      <li className="flex items-center">
        <Link
          to="/"
          className="text-gray-600 hover:text-orange-500 flex items-center"
        >
          Home
        </Link>
      </li>
      <li className="flex items-center mx-2">
        <FaChevronRight className="text-green-600" size={12} />
      </li>
      <li className="flex items-center">
        <Link
          to={`/products?category=${category?.title}`}
          className="text-gray-600 hover:text-orange-500"
        >
          {category?.title || "Products"}
        </Link>
      </li>
      {subcategory && (
        <>
          <li className="flex items-center mx-2">
            <FaChevronRight className="text-green-600" size={12} />
          </li>
          <li className="flex items-center">
            <Link
              to={`/products?category=${category?.title}&subcategory=${subcategory?.title}`}
              className="text-gray-600 hover:text-orange-500"
            >
              {subcategory?.title}
            </Link>
          </li>
        </>
      )}
      <li className="flex items-center mx-2">
        <FaChevronRight className="text-green-600" size={12} />
      </li>
      <li className="text-orange-500 truncate">
        {product?.title || "Loading..."}
      </li>
    </ol>
  </nav>
);

// Product Details Tabs Component
const ProductDetailsTabs = ({ product }) => {
  const [activeTab, setActiveTab] = useState("description");

  const tabs = [
    { id: "description", label: "Product Description" },
    { id: "chemical", label: "Chemical Content" },
    { id: "features", label: "Features & Benefits" },
    { id: "mode", label: "Mode of Action" },
    { id: "application", label: "Method of Application" },
    { id: "recommendations", label: "Recommendations" },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "description":
        return (
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Product Description
            </h3>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              {product.description ? (
                product.description
                  .split("\n")
                  .map((point, index) => <li key={index}>{point}</li>)
              ) : (
                <li>No description available</li>
              )}
            </ul>
          </div>
        );

      case "chemical":
        return (
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Chemical Content
            </h3>
            <div className="text-gray-600">
              {product.chemical_content ? (
                <p>{product.chemical_content}</p>
              ) : (
                <p>No chemical content information available</p>
              )}
            </div>
          </div>
        );

      case "features":
        return (
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Features & Benefits
            </h3>
            <div className="text-gray-600">
              {product.features_benefits ? (
                <p>{product.features_benefits}</p>
              ) : (
                <p>No features and benefits information available</p>
              )}
            </div>
          </div>
        );

      case "mode":
        return (
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Mode of Action
            </h3>
            <div className="text-gray-600">
              {product.modes_of_use ? (
                <p>{product.modes_of_use}</p>
              ) : (
                <p>No mode of action information available</p>
              )}
            </div>
          </div>
        );

      case "application":
        return (
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Method of Application
            </h3>
            <div className="text-gray-600">
              {product.method_of_application ? (
                <p>{product.method_of_application}</p>
              ) : (
                <p>No application method information available</p>
              )}
            </div>
          </div>
        );

      case "recommendations":
        return (
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Recommendations
            </h3>
            <div className="text-gray-600">
              {product.recommendations ? (
                <p>{product.recommendations}</p>
              ) : (
                <p>No recommendations available</p>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="mt-6 bg-white border rounded-lg shadow-md">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex flex-nowrap -mb-px overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors duration-200 whitespace-nowrap flex-shrink-0 ${
                activeTab === tab.id
                  ? "border-green-500 text-green-600 bg-green-50"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-[200px]">{renderTabContent()}</div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

// BuyTogetherDialog component (adapted from Pesticides.jsx)
const BuyTogetherDialog = ({
  product,
  onClose,
  isOpen,
  userType,
  addToCart,
  removeFromCart,
  getItemQuantity,
}) => {
  const dialogRef = React.useRef(null);
  const [localQuantities, setLocalQuantities] = React.useState({});

  // Disable background scrolling when dialog is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  // Close the dialog if clicked outside
  React.useEffect(() => {
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

  React.useEffect(() => {
    if (isOpen && product) {
      const packageData = getPackageData(product);
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
    setLocalQuantities((prev) => ({ ...prev, [pkg._id]: newQuantity }));
    const cartItem = {
      id: product._id,
      title: product.title,
      sub_title: product.sub_title,
      mfg_by: product.mfg_by,
      imageUrl: getFirstImageUrl(product),
      source: "e-store",
      variant: {
        originalPrice: pkg.mrp_price,
        price: pkg.sell_price,
        quantity: newQuantity,
        packageId: pkg._id,
        packageName: pkg.pkgName,
        packageQty: pkg.qty,
        mfgDate: pkg.mfg_date,
        expDate: pkg.exp_date,
        source: "e-store",
      },
    };
    addToCart(cartItem);
  };

  const handleRemoveFromCart = (product, pkg) => {
    const currentQuantity = localQuantities[pkg._id] || 0;
    if (currentQuantity > 0) {
      const newQuantity = currentQuantity - 1;
      setLocalQuantities((prev) => ({ ...prev, [pkg._id]: newQuantity }));
      if (newQuantity === 0) {
        removeFromCart(product._id, pkg._id, "e-store");
      } else {
        const cartItem = {
          id: product._id,
          title: product.title,
          sub_title: product.sub_title,
          mfg_by: product.mfg_by,
          imageUrl: getFirstImageUrl(product),
          source: "e-store",
          variant: {
            originalPrice: pkg.mrp_price,
            price: pkg.sell_price,
            quantity: newQuantity,
            packageId: pkg._id,
            packageName: pkg.pkgName,
            packageQty: pkg.qty,
            mfgDate: pkg.mfg_date,
            expDate: pkg.exp_date,
            source: "e-store",
          },
        };
        addToCart(cartItem);
      }
    }
  };

  if (!isOpen || !product) return null;
  const packageData = getPackageData(product);
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
            <h3 className="text-lg font-bold text-gray-800">{product.title}</h3>
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
                          ((pkg.mrp_price - pkg.sell_price) / pkg.mrp_price) *
                            100
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
                        <button
                          onClick={() => handleRemoveFromCart(product, pkg)}
                        >
                          <img
                            src={minusIcon}
                            alt="Remove"
                            className="w-4 h-4"
                          />
                        </button>
                        <span className="w-8 text-center">
                          {localQuantities[pkg._id]}
                        </span>
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

// Main Product Details Page Component
const ProductDetailsPage = ({ onCartOpen }) => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const { addToCart, removeFromCart, getItemQuantity } = useCart();
  const { addToWishlist, isItemInWishlist } = useWishlist();
  const [localQuantities, setLocalQuantities] = useState({});
  const [userType, setUserType] = useState(null);
  const [buyTogetherProducts, setBuyTogetherProducts] = useState({
    sameTechnical: [],
    buyTogether: [],
  });
  const [eStoreId, setEStoreId] = useState(null);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [category, setCategory] = useState(null);
  const [subcategory, setSubcategory] = useState(null);
  const [brands, setBrands] = useState([]);
  const [productBrand, setProductBrand] = useState(null);
  const [selectedBuyTogetherProduct, setSelectedBuyTogetherProduct] =
    useState(null);
  const [isBuyTogetherDialogOpen, setIsBuyTogetherDialogOpen] = useState(false);

  useEffect(() => {
    const storedUserType = localStorage.getItem("userType");
    setUserType(storedUserType);
  }, []);

  // Fetch all categories and subcategories
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

    fetchCategories();
    fetchSubCategories();
  }, []);

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        // Add user_type parameter to fetch role-specific pricing
        const userType = localStorage.getItem("userType") || 
                         JSON.parse(localStorage.getItem("user") || "{}")?.user_type || 
                         "Farmer";
        const endpoint = `${BASE_URL}/product/get-id-product/${productId}?user_type=${userType}`;
        const data = await getData(endpoint);

        if (data) {
          setProduct(data);
          setSelectedImage(getFirstImageUrl(data));

          // Find category from the fetched categories
          const productCategory = categories.find(
            (cat) => cat._id === data.category_id
          );
          setCategory(productCategory);

          // Find subcategory from the fetched subcategories
          console.log("Product subcategory_id:", data.subcategory_id);
          console.log("All subcategories fetched:", subCategories);
          const productSubcategory = subCategories.find(
            (sub) => sub._id === data.subcategory_id
          );
          console.log("Found subcategory:", productSubcategory);
          setSubcategory(productSubcategory);

          const quantities = {};
          data.package_qty.forEach((pkg) => {
            const quantity = getItemQuantity(data._id, pkg._id);
            quantities[pkg._id] = quantity;
          });
          setLocalQuantities(quantities);
        } else {
          throw new Error("Invalid product data format.");
        }
      } catch (error) {
        console.error("Error fetching product details:", error);
        setError("Failed to load product details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (categories.length > 0 && subCategories.length > 0) {
      fetchProductDetails();
    }
  }, [productId, getItemQuantity, categories, subCategories]);

  useEffect(() => {
    const fetchEStoreId = async () => {
      try {
        const response = await fetch(
          `${BASE_URL}/super-category/get-super-category`
        );
        const data = await response.json();
        const eStoreCategory = data.find((cat) => cat.title === "e-store");
        if (eStoreCategory) {
          setEStoreId(eStoreCategory._id);
        }
      } catch (error) {
        // handle error if needed
      }
    };
    fetchEStoreId();
  }, []);

  useEffect(() => {
    const fetchBuyTogetherProducts = async () => {
      try {
        if (!eStoreId || !product) return;
        const endpoint = `${BASE_URL}/product/get-product`;
        const allProducts = await getData(endpoint);

        // Filter products with same sub_title for same technical products
        const sameTechnicalProducts = allProducts.filter(
          (p) =>
            p.super_cat_id === eStoreId &&
            p._id !== product._id &&
            p.sub_title === product.sub_title
        );

        // Filter products for buy together (keeping original logic)
        const buyTogetherFiltered = allProducts.filter(
          (p) => p.super_cat_id === eStoreId && p._id !== product._id
        );

        setBuyTogetherProducts({
          sameTechnical: sameTechnicalProducts,
          buyTogether: buyTogetherFiltered,
        });
      } catch (err) {
        // handle error if needed
      }
    };
    fetchBuyTogetherProducts();
  }, [product, eStoreId]);

  // Fetch all brands
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const response = await fetch(`${BASE_URL}/brand/get-brand`);
        const data = await response.json();
        setBrands(data);
      } catch (error) {
        // handle error if needed
      }
    };
    fetchBrands();
  }, []);

  // Find the brand for the current product
  useEffect(() => {
    if (product && brands.length > 0 && product.brand_id) {
      const foundBrand = brands.find((b) => b._id === product.brand_id);
      setProductBrand(foundBrand);
    }
  }, [product, brands]);

  const handleAddToCart = (pkg, buyNow = false) => {
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
      source: "e-store",
      variant: {
        originalPrice: pkg.mrp_price,
        price: pkg.sell_price,
        quantity: newQuantity,
        packageId: pkg._id,
        packageName: pkg.pkgName,
        packageQty: pkg.qty,
        mfgDate: pkg.mfg_date,
        expDate: pkg.exp_date,
        source: "e-store",
      },
    };

    addToCart(cartItem);
    setSnackbarVisible(true);
    setTimeout(() => setSnackbarVisible(false), 3000);

    if (buyNow && typeof onCartOpen === "function") {
      onCartOpen();
    }
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
  const handleRemoveFromCart = (pkg) => {
    const currentQuantity = localQuantities[pkg._id] || 0;
    if (currentQuantity > 0) {
      const newQuantity = currentQuantity - 1;

      setLocalQuantities((prev) => ({
        ...prev,
        [pkg._id]: newQuantity,
      }));

      if (newQuantity === 0) {
        removeFromCart(product._id, pkg._id, "e-store");
      } else {
        const cartItem = {
          id: product._id,
          title: product.title,
          sub_title: product.sub_title,
          mfg_by: product.mfg_by,
          imageUrl: getFirstImageUrl(product),
          source: "e-store",
          variant: {
            originalPrice: pkg.mrp_price,
            price: pkg.sell_price,
            quantity: newQuantity,
            packageId: pkg._id,
            packageName: pkg.pkgName,
            packageQty: pkg.qty,
            mfgDate: pkg.mfg_date,
            expDate: pkg.exp_date,
            source: "e-store",
          },
        };
        addToCart(cartItem);
      }
    }
  };

  const handleClearQuantity = (pkg) => {
    setLocalQuantities((prev) => ({
      ...prev,
      [pkg._id]: 0,
    }));
    removeFromCart(product._id, pkg._id, "e-store");
  };

  const handleThumbnailClick = (imageUrl) => {
    setSelectedImage(imageUrl);
  };

  const handleWishlistClick = (e, product) => {
    e.preventDefault();
    const packageData = getPackageData(product);
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

  const handleShare = (product) => {
    const shareUrl = `${window.location.origin}/product/${product._id}`;
    const shareText = `Check out this product: ${product.title}`;

    if (navigator.share) {
      navigator
        .share({
          title: product.title,
          text: shareText,
          url: shareUrl,
        })
        .then(() => console.log("Product shared successfully"))
        .catch((error) => console.error("Error sharing", error));
    } else {
      window.open(
        `https://api.whatsapp.com/send?text=${encodeURIComponent(
          `${shareText}\n${shareUrl}`
        )}`,
        "_blank"
      );
    }
  };

  // Handler for Buy Together dialog
  const handleBuyTogetherSelect = (product) => {
    setSelectedBuyTogetherProduct(product);
    setIsBuyTogetherDialogOpen(true);
  };
  const handleBuyTogetherDialogClose = () => {
    setIsBuyTogetherDialogOpen(false);
  };

  return (
    <>
      <Navbar />
      <div className="p-5">
        <div className="max-w-6xl mx-auto">
          <Breadcrumb
            product={product}
            category={category}
            subcategory={subcategory}
          />

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <p className="text-lg text-gray-600">Loading...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
              <p className="text-red-600">{error}</p>
            </div>
          ) : product ? (
            <>
              <div className="bg-white border rounded-lg shadow-md p-6 flex flex-col lg:flex-row gap-2">
                {/* Product Image Section */}
                <div className="flex-shrink-0 w-full lg:max-w-[500px] h-auto sm:h-[300px] md:h-[400px] lg:h-[450px] lg:border-r lg:border-green-300 bg-white p-2 sm:p-4">
                  {/* Inner container for responsive image layout */}
                  <div className="flex flex-col items-center gap-2 w-full h-full lg:flex-row lg:items-start">
                    {/* Main Image: order-1 on mobile/tablet, order-2 on desktop */}
                    <div className="flex items-center justify-center flex-1 h-[200px] sm:h-[250px] lg:h-full w-full order-1 lg:order-2 relative">
                      <img
                        src={selectedImage || getFirstImageUrl(product)}
                        alt={product.title}
                        className="object-contain w-full h-full rounded-lg"
                      />
                      {/* Wishlist and Share Icons */}
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
                    </div>
                    {/* Thumbnails: order-2 on mobile/tablet, order-1 on desktop */}
                    <div className="flex flex-row gap-2 justify-center py-2 w-full lg:flex-col lg:w-auto lg:h-full lg:justify-between order-2 lg:order-1">
                      {getAllImageUrls(product).map((thumb, index) => (
                        <img
                          key={index}
                          src={thumb}
                          alt={`${product.title} thumbnail ${index + 1}`}
                          className={`w-16 h-16 object-contain cursor-pointer border rounded-lg transition-all
                            ${
                              selectedImage === thumb
                                ? "border-orange-500 shadow-md"
                                : "border-gray-300 hover:border-orange-300"
                            } lg:w-24 lg:h-24`}
                          onClick={() => handleThumbnailClick(thumb)}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                {/* Vertical Separator (only on laptop/desktop) */}
                <div className="hidden lg:block w-0.5 h-full bg-green-300 mx-2" />
                {/* Product Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col gap-1">
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                      {product.title}
                      {productBrand && (
                        <img
                          src={productBrand.imageUrl}
                          alt={productBrand.title}
                          className="w-20 h-20 object-contain"
                        />
                      )}
                    </h2>
                    <span className="block w-full border-t border-green-300"></span>
                    <div className="flex items-center gap-2 mt-1">
                      <img
                        src={compoundIcon}
                        alt="Compound Icon"
                        className="w-6 h-6"
                      />
                      <span className="text-indigo-400 font-semibold">
                        {product.sub_title}
                      </span>
                    </div>
                    <span className="block w-full border-t border-green-300 my-1"></span>
                  </div>
                  {(() => {
                    const pkgArr = getPackageData(product);
                    const firstPkg = pkgArr && pkgArr[0];
                    return (
                      <div>
                        <div className="flex flex-row gap-4 text-gray-700">
                          <span className="flex items-center gap-1">
                            <span className="font-semibold text-sm text-green-700">
                              MFG:{" "}
                            </span>
                            {firstPkg?.mfg_date ? (
                              <span className="text-gray-900 font-medium text-sm">
                                {new Date(firstPkg.mfg_date).toLocaleDateString(
                                  "en-GB"
                                )}
                              </span>
                            ) : (
                              "N/A"
                            )}
                          </span>
                          <span className="flex items-center gap-1">
                            <img
                              src={scheduleIcon}
                              alt="Schedule Icon"
                              className="w-6 h-6"
                            />
                            <span className="font-semibold text-sm text-red-500">
                              EXP:{" "}
                            </span>
                            {firstPkg?.exp_date ? (
                              <span className="text-gray-900 font-medium text-sm">
                                {new Date(firstPkg.exp_date).toLocaleDateString(
                                  "en-GB"
                                )}
                              </span>
                            ) : (
                              "N/A"
                            )}
                          </span>
                        </div>
                        {userType === "Agent" && (
                          <div className="bg-white rounded-lg p-4">
                            {/* “Earn Commission” pill */}
                            <span className="inline-block bg-[#FF785C] text-white text-sm font-semibold uppercase px-3 py-1 rounded">
                              Earn Commission
                            </span>

                            {/* icon + amount row */}
                            <div className="mt-3 flex items-center">
                              <img
                                src={discount01}
                                alt="Commission Icon"
                                className="w-10 h-10 flex-shrink-0"
                              />
                              <div className="mx-2 h-12 w-px bg-gray-600" />
                              <span className="text-3xl font-extrabold text-orange-500">
                                ₹{product.agent_commission}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                  <ProductVariants
                    product={product}
                    userType={userType}
                    localQuantities={localQuantities}
                    onAdd={(pkg) => handleAddToCart(pkg, false)}
                    onRemove={handleRemoveFromCart}
                    onBuyNow={(pkg) => handleAddToCart(pkg, true)}
                    onClearQuantity={handleClearQuantity}
                  />
                  {/* Same Technical Products Section */}
                  {buyTogetherProducts.sameTechnical?.length > 0 && (
                    <div className="p-6 border-t mt-1">
                      <h3 className="text-xl font-semibold underline text-orange-500 mb-4">
                        Same Technical Products
                      </h3>

                      <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-4 overflow-x-auto">
                        <div
                          className="flex space-x-4 snap-x snap-mandatory pb-2"
                          style={{ minWidth: "100%" }}
                        >
                          {buyTogetherProducts.sameTechnical.map((item) => {
                            const pkg = item.package_qty?.[0];
                            if (!pkg) return null;
                            return (
                              <Link
                                key={item._id}
                                to={`/product/${item._id}`}
                                className="flex flex-row items-center w-[210px] h-[120px] snap-start border rounded-lg p-4 hover:shadow-lg transition bg-white"
                              >
                                {/* Image on the left */}
                                <div className="w-20 h-20 flex-shrink-0 flex items-center justify-center">
                                  <img
                                    src={getFirstImageUrl(item)}
                                    alt={item.title}
                                    className="w-full h-full object-contain"
                                  />
                                </div>
                                {/* Details on the right */}
                                <div className="ml-4 flex flex-col flex-1 min-w-0">
                                  <h4 className="font-semibold text-base mb-1 truncate overflow-hidden whitespace-nowrap">
                                    {item.title}
                                  </h4>
                                  <p className="text-xs text-gray-500 mb-2 truncate overflow-hidden whitespace-nowrap">
                                    {item.sub_title}
                                  </p>
                                  <div className="flex flex-wrap gap-2">
                                    {item.package_qty?.map((pkg, idx) => (
                                      <div
                                        key={idx}
                                        className="text-xs border rounded px-2 py-1 bg-gray-50"
                                      >
                                        <span className="font-bold">
                                          ₹{pkg.sell_price}
                                        </span>
                                        <span className="mx-1 text-gray-400">
                                          /
                                        </span>
                                        <span>
                                          {pkg.qty} {pkg.pkgName}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <ProductDetailsTabs product={product} />
              {/* Buy Together Section - e-meds only, Pesticides card style */}
              {buyTogetherProducts.buyTogether?.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-lg font-semibold mb-4 text-green-700">
                    Buy Together
                  </h3>
                  <div className="relative overflow-x-scroll flex space-x-4 snap-x snap-mandatory scrollbar-hide pb-2">
                    {buyTogetherProducts.buyTogether.map((item) => {
                      const pkgArr = getPackageData(item);
                      const pkg = pkgArr?.[0];
                      if (!pkg) return null;
                      return (
                        <Link
                          to={`/product/${item._id}`}
                          key={item._id}
                          className="flex-shrink-0 w-[calc(50%-0.5rem)] sm:w-60 snap-start"
                        >
                          <div className="bg-white border border-gray-200 rounded-lg shadow-md p-4 sm:p-4 relative transform transition duration-300 hover:shadow-lg">
                            {/* Discount Badge */}
                            <div className="absolute top-2 left-2">
                              <div className="relative w-12 h-12">
                                <img
                                  src={discount}
                                  alt="Discount Badge"
                                  className="w-full h-full object-contain"
                                />
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                  <span className="text-white text-xs font-bold leading-none">
                                    {Math.round(
                                      ((pkg.mrp_price - pkg.sell_price) /
                                        pkg.mrp_price) *
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
                            {/* Product Image */}
                            <img
                              src={getFirstImageUrl(item)}
                              alt={item.title}
                              className="w-full h-28 sm:h-36 object-contain rounded-lg"
                            />
                            {/* Product Details */}
                            <h3 className="text-sm font-semibold text-gray-800 truncate">
                              {item.title}
                            </h3>
                            <div className="flex space-x-1">
                              <img
                                src={medical}
                                alt="medical"
                                className="w-4 h-4"
                              />
                              <p className="text-gray-500 text-xs mb-1 truncate">
                                {item.sub_title}
                              </p>
                            </div>
                            <div className="flex items-center text-xs text-gray-600 mb-1 space-x-1">
                              <strong className="whitespace-nowrap flex-shrink-0">
                                MFG/MKTD BY :
                              </strong>
                              <span className="text-red-400 truncate flex-grow ml-1 min-w-0">
                                {product.mfg_by}
                              </span>
                            </div>
                            <div className="package-qty-list">
                              <div>
                                <div className="flex flex-col sm:flex-row text-xs text-gray-600 space-y-1 sm:space-y-0 sm:space-x-2">
                                  <span>
                                    <strong>MFG :</strong>{" "}
                                    {pkg.mfg_date ? (
                                      <span className="text-green-600">
                                        {new Date(
                                          pkg.mfg_date
                                        ).toLocaleDateString("en-GB")}
                                      </span>
                                    ) : (
                                      "N/A"
                                    )}
                                  </span>
                                  <span>
                                    <span className="hidden sm:inline">|</span>{" "}
                                    <strong>EXP :</strong>{" "}
                                    {pkg.exp_date ? (
                                      <span className="text-red-600">
                                        {new Date(
                                          pkg.exp_date
                                        ).toLocaleDateString("en-GB")}
                                      </span>
                                    ) : (
                                      "N/A"
                                    )}
                                  </span>
                                </div>
                                {/* Price Details */}
                                <div className="flex items-center space-x-2">
                                  <div className="text-base font-bold text-black-600">
                                    ₹{pkg.sell_price}
                                  </div>
                                  <div className="text-base font-bold text-gray-500 line-through">
                                    ₹{pkg.mrp_price}
                                  </div>
                                </div>
                                <p className="text-xs text-green-500">
                                  Saved Price ₹{pkg.mrp_price - pkg.sell_price}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center justify-between mb-2 mt-2">
                              <label className="text-xs font-semibold text-gray-600 w-1/3">
                                Select
                              </label>
                              <div className="flex items-center w-2/3">
                                <div
                                  className="w-full border border-green-300 text-xs rounded px-2 py-1 appearance-none text-center cursor-pointer flex items-center justify-center"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    handleBuyTogetherSelect(item);
                                  }}
                                >
                                  <span className="flex items-center space-x-1">
                                    <span>
                                      {pkg.qty} {pkg.pkgName}
                                    </span>
                                    <img
                                      src={downArrow}
                                      alt="Select"
                                      className="w-5 h-5"
                                    />
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                  <style jsx>{`
                    .scrollbar-hide::-webkit-scrollbar {
                      display: none;
                    }
                    .scrollbar-hide {
                      -ms-overflow-style: none;
                      scrollbar-width: none;
                    }
                  `}</style>
                </div>
              )}
            </>
          ) : (
            <div className="bg-gray-50 border p-4 rounded-lg">
              <p className="text-gray-600">Product not found.</p>
            </div>
          )}

          {/* Snackbar */}
          {snackbarVisible && (
            <div className="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg transition-opacity">
              Added to cart successfully
            </div>
          )}

          {/* Render BuyTogetherDialog */}
          <BuyTogetherDialog
            product={selectedBuyTogetherProduct}
            onClose={handleBuyTogetherDialogClose}
            isOpen={isBuyTogetherDialogOpen}
            userType={userType}
            addToCart={addToCart}
            removeFromCart={removeFromCart}
            getItemQuantity={getItemQuantity}
          />
        </div>
      </div>
    </>
  );
};

export default ProductDetailsPage;

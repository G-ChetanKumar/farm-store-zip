import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import BASE_URL from "../Helper/Helper";
import { useCart } from "../contexts/CartContext";
import { useLanguage } from "../contexts/LanguageContext";
import { ShoppingCartIcon } from "@heroicons/react/24/outline";
import leftArrow from "../assets/images/leftArrow1.png";
import rightArrow from "../assets/images/rightArrow.png";

// Helper function to get the first image URL from images array
const getFirstImageUrl = (product) => {
  if (product.images && product.images.length > 0) {
    return product.images[0].imageUrl;
  }
  return product.imageUrl || "";
};

const ExclusiveDeals = () => {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);
  const { addToCart, isItemInCart, getItemQuantity, cartItems } = useCart();
  const { t } = useLanguage();
  const scrollContainerRef = useRef(null);
  
  // Get the logged-in user type from localStorage
  const [userType, setUserType] = useState(null);
  const [localCartState, setLocalCartState] = useState({});

  useEffect(() => {
    const getUserType = () => {
      const directUserType = localStorage.getItem("userType");
      if (directUserType) {
        return directUserType;
      }
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

  // Update local cart state whenever cartItems changes
  useEffect(() => {
    const newCartState = {};
    cartItems.forEach(item => {
      newCartState[item.id] = true;
    });
    setLocalCartState(newCartState);
  }, [cartItems]);

  // Helper function: choose package data based on userType
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

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setError(null);
        const response = await axios.get(`${BASE_URL}/product/get-product`);
        setProducts(response.data.slice(0, 10));
      } catch (error) {
        console.error("Error fetching products:", error);
        setError(
          "Unable to fetch exclusive deals. Please check your internet connection."
        );
      }
    };
    fetchProducts();
  }, []);

  // Calculate total cart value for e-store items only
  const calculateCartValue = () => {
    return cartItems.reduce((total, item) => {
      if (item.source === 'e-store') {
        if (item.source === 'e-store') {
          return total + parseFloat(item.variant.price) * item.quantity;
        }
        return total;
      }
      return total;
    }, 0);
  };

  const shopLabels = [
    { label: "Shop For ₹1,000", minValue: 1000 },
    { label: "Shop For ₹2,000", minValue: 2000 },
    { label: "Shop For ₹3,500", minValue: 3500 },
    { label: "Shop For ₹4,500", minValue: 4500 },
    { label: "Shop For ₹5,000", minValue: 5000 },
    { label: "Shop For ₹6,000", minValue: 6000 },
    { label: "Shop For ₹7,000", minValue: 7000 },
    { label: "Shop For ₹8,000", minValue: 8000 },
    { label: "Shop For ₹9,000", minValue: 9000 },
    { label: "Shop For ₹10,000", minValue: 10000 },
  ];

const handleAddToCart = (product, shopLabel) => {
  const packageData = getPackageData(product);
  if (!packageData || packageData.length === 0) return;
  const defaultPackage = packageData[0];
  const cartItem = {
    id: product._id,
    title: product.title,
    sub_title: product.sub_title,
    mfg_by: product.mfg_by,
    imageUrl: product.imageUrl,
    source: 'e-store',
    variant: {
      originalPrice: defaultPackage.mrp_price,
      price: defaultPackage.sell_price,
      quantity: 1,
      packageId: defaultPackage._id,
      packageName: defaultPackage.pkgName,
      packageQty: defaultPackage.qty,
      mfgDate: defaultPackage.mfg_date,
      expDate: defaultPackage.exp_date,
      source: 'e-store'
    },
  };
  addToCart(cartItem);
  // Update local state immediately
  setLocalCartState(prev => ({
    ...prev,
    [product._id]: true
  }));
};

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -300, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 300, behavior: "smooth" });
    }
  };

  const cartValue = calculateCartValue();

  return (
    <div className="bg-white py-1 relative">
      <div className="px-4">
        <h2 className="text-center text-orange-500 font-bold text-3xl mb-2">
          {t('home.exclusiveDeals')}
        </h2>

        {error ? (
          <div className="text-center text-red-500 text-md font-medium">
            <p>{error}</p>
            <button
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md shadow hover:bg-blue-600"
              onClick={() => window.location.reload()}
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="relative">
            <button
              className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-white p-2 py-2 px-2 rounded-full shadow-md hover:bg-gray-200 z-10"
              onClick={scrollLeft}
            >
              <img src={leftArrow} alt="Scroll Left" className="w-8 h-8" />
            </button>

            <div
              ref={scrollContainerRef}
              className="flex overflow-x-auto space-x-4 px-2 md:px-0 scrollbar-hide"
            >
{products.map((product, index) => {
  const packageData = getPackageData(product);
  if (!packageData || packageData.length === 0) return null;
  const defaultPackage = packageData[0];
  const shopLabel = shopLabels[index % shopLabels.length];
  
  // Use the product threshold for add-to-cart enablement
  const isAddToCartVisible = cartValue >= shopLabel.minValue;
  
                return (
                  <Link key={product._id} to={`/product/${product._id}`} className="flex-shrink-0">

                    <div className="flex flex-col">
                      <div className="text-center p-1">
                        <p className="font-bold text-gray-800">
                          Shop For{" "}
                          <span className="text-red-600">
                            {shopLabel.label.split("Shop For ")[1]}
                          </span>
                        </p>
                      </div>

                      <div className="flex p-1 border border-green-500 rounded-lg shadow-lg flex-shrink-0 w-64">
                        <img
                          src={getFirstImageUrl(product)}
                          alt={product.title}
                          className="w-20 h-36 object-cover"
                        />

                        <div className="flex flex-col flex-grow pl-1 overflow-hidden">
                          <h3 className="font-bold text-gray-800 text-lg truncate">
                            {product.title}
                          </h3>

                          <p className="text-gray-600 text-sm line-clamp-2 truncate">
                            {product.sub_title}
                          </p>
                          <p className="text-gray-600 text-sm">
                            <span className="font-bold">
                              {defaultPackage.qty}&nbsp;
                              {defaultPackage.pkgName}
                            </span>
                          </p>

                          <p className="text-gray-600 text-sm">
                            Exp:{" "}
                            <span className="font-bold text-red-600">
                              {defaultPackage.exp_date
                                ? new Date(defaultPackage.exp_date).toLocaleDateString("en-GB")
                                : "N/A"}
                            </span>
                          </p>

                          <div className="flex items-center gap-2">
                            <p className="text-2xl font-bold">
                              ₹{defaultPackage.sell_price}
                            </p>
                            <p className="text-gray-500 line-through text-sm">
                              ₹{defaultPackage.mrp_price}
                            </p>
                          </div>

                          {isAddToCartVisible && (
                            <button
                            className={`flex items-center justify-center w-full py-2 text-white font-semibold rounded-lg text-xs sm:text-sm transition-colors duration-200 ${
                              localCartState[product._id] ? "bg-gray-400 cursor-not-allowed" : "bg-orange-400 hover:bg-orange-600"
                            }`}
                            onClick={(e) => {
                              e.preventDefault();
                              if (!localCartState[product._id]) {
                                handleAddToCart(product, shopLabel);
                              }
                            }}
                            disabled={localCartState[product._id]}
                          >
                            <ShoppingCartIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-1" />
                            {localCartState[product._id]
                              ? `${t('header.cart')} (${getItemQuantity(product._id)})`
                              : t('common.addToCart')}
                          </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            <button
              className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white p-2 py-2 px-2 rounded-full shadow-md hover:bg-gray-200 z-10"
              onClick={scrollRight}
            >
              <img src={rightArrow} alt="Scroll Right" className="w-8 h-8" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExclusiveDeals;

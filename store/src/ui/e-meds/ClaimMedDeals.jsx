import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
// Helper to get first image URL
const getFirstImageUrl = (product) => {
  if (product.images && product.images.length > 0 && product.images[0].imageUrl) {
    return product.images[0].imageUrl;
  }
  return product.imageUrl || "";
};
import { Link } from "react-router-dom";
import BASE_URL from "../../Helper/Helper";
import { useCart } from "../../contexts/CartContext";
import { ShoppingCartIcon } from "@heroicons/react/24/outline";
import leftArrow from "../../assets/images/leftArrow1.png";
import rightArrow from "../../assets/images/rightArrow.png";

const ClaimMedDeals = () => {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [eStoreId, setEStoreId] = useState(null);
  const { addToCart, isItemInCart, getItemQuantity, cartItems } = useCart();
  const scrollContainerRef = useRef(null);

  // State to store the logged-in user's type
  const [userType, setUserType] = useState(null);
  useEffect(() => {
    const getUserType = () => {
      const directUserType = localStorage.getItem("userType");
      if (directUserType) return directUserType;
      const userStr = localStorage.getItem("user");
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          if (user && user.user_type) return user.user_type;
        } catch (e) {
          console.error("Error parsing user JSON:", e);
        }
      }
      return null;
    };
    setUserType(getUserType());
  }, []);

  // Helper: choose the correct package data based on user type
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

  // Calculate total cart value for e-meds items only
  const calculateCartValue = () => {
    return cartItems.reduce((total, item) => {
      if (item.source === 'e-meds') {
        return total + parseFloat(item.variant.price) * item.quantity;
      }
      return total;
    }, 0);
  };

  // First, fetch the e-meds super-category ID
  useEffect(() => {
    const fetchEStoreId = async () => {
      try {
        const response = await fetch(`${BASE_URL}/super-category/get-super-category`);
        const data = await response.json();
        const eStoreCategory = data.find(
          (cat) => cat.title.toLowerCase() === "e-meds"
        );
        if (eStoreCategory) {
          setEStoreId(eStoreCategory._id);
        }
      } catch (error) {
        console.error("Error fetching super categories:", error);
        setError("Unable to fetch category information. Please try again.");
      }
    };
    fetchEStoreId();
  }, []);

  // Then, fetch and filter products based on the e-meds super-category
  useEffect(() => {
    if (!eStoreId) return;

    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(`${BASE_URL}/product/get-product`);
        // Filter products that belong to e-meds category
        const filteredProducts = response.data.filter(
          (product) => product.super_cat_id === eStoreId
        );
        // Take only the first 10 products
        setProducts(filteredProducts.slice(0, 10));
      } catch (error) {
        console.error("Error fetching products:", error);
        setError("Unable to fetch exclusive deals. Please check your internet connection.");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [eStoreId]);

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

  // Modified handleAddToCart: use the helper to choose the proper package array
  const handleAddToCart = (product, shopLabel) => {
    const packageData = getPackageData(product);
    if (!packageData || packageData.length === 0) return;
    const defaultPackage = packageData[0];
    addToCart({
      id: product._id,
      title: product.title,
      sub_title: product.sub_title,
      imageUrl: getFirstImageUrl(product),
      source: 'e-meds',
      variant: {
        originalPrice: defaultPackage.mrp_price,
        price: defaultPackage.sell_price,
        packageInfo: {
          name: defaultPackage.pkgName,
          quantity: defaultPackage.qty,
        },
        source: 'e-meds',
        // Mark this item as an exclusive deal with its own threshold:
        exclusiveThreshold: shopLabel.minValue,
      },
    });
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

  const handleRetry = () => {
    if (eStoreId) {
      setError(null);
      setLoading(true);
      const fetchProducts = async () => {
        try {
          const response = await axios.get(`${BASE_URL}/product/get-product`);
          const filteredProducts = response.data.filter(
            (product) => product.super_cat_id === eStoreId
          );
          setProducts(filteredProducts.slice(0, 10));
          setError(null);
        } catch (error) {
          console.error("Error fetching products:", error);
          setError("Unable to fetch exclusive deals. Please check your internet connection.");
        } finally {
          setLoading(false);
        }
      };
      fetchProducts();
    }
  };

  const cartValue = calculateCartValue();

  return (
    <div className="bg-white py-1 relative">
      <div className="px-4">
        <h2 className="text-center text-orange-500 font-bold text-3xl mb-2">
          Claim Exclusive Deals
        </h2>

        {loading ? (
          <div className="flex justify-center items-center min-h-[200px] flex-col">
            <div className="w-10 h-10 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mb-2"></div>
            <p className="text-gray-500 text-sm font-medium">
              Loading deals...
            </p>
          </div>
        ) : error ? (
          <div className="text-center text-red-500 text-md font-medium">
            <p>{error}</p>
            <button
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md shadow hover:bg-blue-600"
              onClick={handleRetry}
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="relative">
            <button
              className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-white p-2 rounded-full shadow-md hover:bg-gray-200 z-10"
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

                // Get the shop value threshold
                const shopLabel = shopLabels[index % shopLabels.length];

                // Determine if Add to Cart button should be visible
                const isAddToCartVisible = cartValue >= shopLabel.minValue;

                return (
                  <Link
                    key={product._id}
                    to={`/medproduct/${product._id}`}
                    className="flex-shrink-0"
                  >
                    <div className="flex flex-col">
                      <div className="text-center p-1">
                        <p className="font-bold text-gray-800">
                          Shop For{" "}
                          <span className="text-red-600">
                            {shopLabel.label.split("Shop For ")[1]}
                          </span>
                        </p>
                      </div>

                      <div className="flex p-1 border border-green-500 rounded-lg shadow-lg bg-white flex-shrink-0 w-64">
                        <img
                          src={getFirstImageUrl(product)}
                          alt={product.title}
                          className="w-28 h-30 object-cover"
                        />

                        <div className="flex flex-col flex-grow pl-2 overflow-hidden">
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
                                isItemInCart(product._id)
                                  ? "bg-gray-400 cursor-not-allowed"
                                  : "bg-orange-400 hover:bg-orange-600"
                              }`}
                              onClick={(e) => {
                                e.preventDefault();
                                if (!isItemInCart(product._id)) {
                                  handleAddToCart(product, shopLabel);
                                }
                              }}
                              disabled={isItemInCart(product._id)}
                            >
                              <ShoppingCartIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-1" />
                              {isItemInCart(product._id)
                                ? `In Cart (${getItemQuantity(product._id)})`
                                : "Add to Cart"}
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
              className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white p-2 rounded-full shadow-md hover:bg-gray-200 z-10"
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

export default ClaimMedDeals;

import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
// Helper to get first image URL
const getFirstImageUrl = (product) => {
  if (product.images && product.images.length > 0 && product.images[0].imageUrl) {
    return product.images[0].imageUrl;
  }
  return product.imageUrl || "";
};
// import { HiChevronDown } from "react-icons/hi";
import { useCart } from "../../contexts/CartContext";
import { useWishlist } from "../../contexts/WishlistContext";
import BASE_URL from "../../Helper/Helper";
import wishlistIcon from "../../assets/wishlist.png";
import filledHeartIcon from "../../assets/wishlist1.png";
import shareIcon from "../../assets/share.png";
import discountBadge from "../../assets/discountBadge.png";
import plusIcon from "../../assets/plusIcon.png";
import minusIcon from "../../assets/minusIcon.png";
import leftChevronIcon from "../../assets/images/leftArrows.png"; // Add your left-chevron icon path
import rightChevronIcon from "../../assets/images/rightArrows.png"; // Add your right-chevron icon path
import downArrow from "../../assets/down-arrow1.png";

const MotherCare = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true); // State to manage loading
  const { addToWishlist, isItemInWishlist } = useWishlist();
  const [error, setError] = useState(false);
  const [quantities, setQuantities] = useState({}); // State for product quantities
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [userType, setUserType] = useState(null);
  const scrollRef = useRef();

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

  // Fetch and filter products by category
  useEffect(() => {
    const fetchIrrigationProducts = async () => {
      try {
        setLoading(true);
        setError(false);
        const categoryResponse = await axios.get(
          `${BASE_URL}/category/get-category`
        );
        const categories = categoryResponse.data;

        // Find the "Irrigation" category
        const irrigationCategory = categories.find(
          (category) => category.title === "Mother/Baby Care"
        );

        if (irrigationCategory) {
          const categoryId = irrigationCategory._id;

          // Fetch products and filter by category_id
          const productResponse = await axios.get(
            `${BASE_URL}/product/get-product`
          );
          const allProducts = productResponse.data;

          const filteredProducts = allProducts.filter(
            (product) => product.category_id === categoryId
          );

          setProducts(filteredProducts);
        }
      } catch (error) {
        console.error("Error fetching Mother/Baby Care products:", error);
        setError(true);
      } finally {
        setLoading(false); // Stop loading
      }
    };

    fetchIrrigationProducts();
  }, []);

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

  const handleRetry = () => {
    setError(false);
    setLoading(true);
    const fetchIrrigationProducts = async () => {
      try {
        setLoading(true);
        setError(false);
        const categoryResponse = await axios.get(
          `${BASE_URL}/category/get-category`
        );
        const categories = categoryResponse.data;

        // Find the "Irrigation" category
        const irrigationCategory = categories.find(
          (category) => category.title === "Mother/Baby Care"
        );

        if (irrigationCategory) {
          const categoryId = irrigationCategory._id;

          // Fetch products and filter by category_id
          const productResponse = await axios.get(
            `${BASE_URL}/product/get-product`
          );
          const allProducts = productResponse.data;

          const filteredProducts = allProducts.filter(
            (product) => product.category_id === categoryId
          );

          setProducts(filteredProducts);
        }
      } catch (error) {
        console.error("Error fetching Mother & Baby Care products:", error);
        setError(true);
      } finally {
        setLoading(false); // Stop loading
      }
    };

    fetchIrrigationProducts();
  };

  const handlePackageSelect = (productId) => {
    const product = products.find((p) => p._id === productId);
    if (product) {
      console.log("Selected product:", product); // Check the full product object
      setSelectedProduct(product); // Ensure full product data is passed
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
      // Store the entire package_qty array
      package_qty: packageData,
      // Store the selected package info (using first package as default)
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

  const scrollLeft = () => {
    scrollRef.current.scrollBy({ left: -300, behavior: "smooth" });
  };

  const scrollRight = () => {
    scrollRef.current.scrollBy({ left: 300, behavior: "smooth" });
  };
  const handleShare = (product) => {
    const shareUrl = `${window.location.origin}/medproduct/${product._id}`;
    // Remove the URL from the text so it doesn't get duplicated.
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
      // Fallback for non-supporting browsers: open WhatsApp share with combined text.
      window.open(
        `https://api.whatsapp.com/send?text=${encodeURIComponent(
          `${shareText}\n${shareUrl}`
        )}`,
        "_blank"
      );
    }
  };
  const ProductDialog = ({ product, onClose, isOpen }) => {
    const dialogRef = useRef(null);
    const { addToCart, removeFromCart, isItemInCart, getItemQuantity, cart } =
      useCart();
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
        source: 'e-meds',
        variant: {
          originalPrice: pkg.mrp_price,
          price: pkg.sell_price,
          quantity: newQuantity,
          packageId: pkg._id,
          packageName: pkg.pkgName,
          packageQty: pkg.qty,
          mfgDate: pkg.mfg_date,
          expDate: pkg.exp_date,
          source: 'e-meds'
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
            source: 'e-meds',
            variant: {
              originalPrice: pkg.mrp_price,
              price: pkg.sell_price,
              quantity: newQuantity,
              packageId: pkg._id,
              packageName: pkg.pkgName,
              packageQty: pkg.qty,
              mfgDate: pkg.mfg_date,
              expDate: pkg.exp_date,
              source: 'e-meds'
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
              className="space-y-4 pr-1 scrollbar-thin" // pr-2 to add some right padding for scrollbar
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
              {!Array.isArray(packageData) || packageData.length === 0 ? (
                <p className="text-gray-500 text-sm">
                  No package sizes available for this product.
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <section className="py-1 bg-gray-100">
      <div className="px-2 sm:px-4">
        <div className="flex justify-between items-center mb-1">
          <h2 className="text-lg sm:text-2xl font-bold text-gray-800">
            Mother & Baby Care
          </h2>
          <div className="flex items-center space-x-1">
            <a
              href="/medproducts?category=Mother/Baby Care"
              className="text-gray-500 underline text-md font-medium"
            >
              View All
            </a>
            <button onClick={scrollLeft}>
              <img
                src={leftChevronIcon}
                alt="Scroll Left"
                className="w-6 h-6 cursor-pointer"
              />
            </button>
            <button onClick={scrollRight}>
              <img
                src={rightChevronIcon}
                alt="Scroll Right"
                className="w-6 h-6 cursor-pointer"
              />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center min-h-[200px] flex-col">
            <div className="w-10 h-10 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mb-2"></div>
            <p className="text-gray-500 text-sm font-medium">
              Loading Mother & Baby Care products...
            </p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center min-h-[200px] text-center">
            <p className="text-red-500 text-md font-medium">
              Unable to fetch Mother & Baby Care products. Please check your
              internet connection.
            </p>
            <button
              onClick={handleRetry}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md shadow hover:bg-blue-600"
            >
              Retry
            </button>
          </div>
        ) : (
          <div
            className="relative overflow-x-scroll flex space-x-4 snap-x snap-mandatory scrollbar-hide"
            ref={scrollRef}
          >
            {products.map((product) => {
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
                  to={`/medproduct/${product._id}`}
                  key={product._id}
                  className="flex-shrink-0 w-[calc(50%-0.5rem)] sm:w-60 snap-start"
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
                    <p className="text-gray-500 text-xs mb-1 truncate">
                      {product.sub_title}
                    </p>
                    <div className="flex items-center text-xs text-gray-600 mb-1 space-x-1">
                      <strong className="whitespace-nowrap flex-shrink-0">MFG/MKTD BY :</strong>
                      <span className="text-red-400 truncate flex-grow ml-1 min-w-0">{product.mfg_by}</span>
                    </div>
                    <div className="package-qty-list">
                      {defaultPackage && (
                        <div>
                         <div>
                          {/* Desktop/Laptop view (row) */}
                          <div className="hidden sm:flex flex-row text-xs text-gray-600 space-x-1">
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
                            {defaultPackage.mrp_price -
                              defaultPackage.sell_price}
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
                              <img
                                src={downArrow}
                                alt="Remove"
                                className="w-5 h-5"
                              />
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
        )}
      </div>
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-thin::-webkit-scrollbar {
          width: 4px;
          height: 4px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background-color: #aaa;
          border-radius: 2px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }
      `}</style>

      <ProductDialog
        product={selectedProduct}
        onClose={handleDialogClose}
        isOpen={isDialogOpen}
      />
    </section>
  );
};

export default MotherCare;

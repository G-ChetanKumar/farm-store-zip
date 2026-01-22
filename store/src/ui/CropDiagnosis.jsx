import React, { useState, useEffect } from "react";
import { useCart } from "../contexts/CartContext";
import { useLanguage } from "../contexts/LanguageContext";
import discount from "../assets/discountBadge.png";
import medical from "../assets/medical.png";
import scheduleIcon from "../assets/schedule.png";
import axios from "axios";

// Import the images
import selectPlant from "../assets/tomato.png";
import findPest from "../assets/pests.png";
import getExact from "../assets/pesticide.png";
import arrowIcon from "../assets/right-chevron1.png";
import BASE_URL from "../Helper/Helper";
import downArrow from "../assets/down-arrow1.png";
import plusIcon from "../assets/plusIcon.png";
import minusIcon from "../assets/minusIcon.png";

const CropDiagnosis = () => {
  // State for modal visibility
  const { addToCart, getItemQuantity, removeFromCart } = useCart();
  const { t } = useLanguage();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // State for diagnosis process
  const [currentStage, setCurrentStage] = useState(0);
  const [crops, setCrops] = useState([]);
  const [selectedCrop, setSelectedCrop] = useState(null);
  const [pests, setPests] = useState([]);
  const [selectedPest, setSelectedPest] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [eStoreId, setEStoreId] = useState(null);

  // Open the modal and initialize the diagnosis
  const startDiagnosis = () => {
    setCurrentStage(1);
    setIsModalOpen(true);
  };

  // Close the modal and reset the state
  const closeModal = () => {
    setIsModalOpen(false);
    resetDiagnosis();
  };

  // Reset diagnosis state
  const resetDiagnosis = (toStep1 = false) => {
    setSelectedCrop(null);
    setSelectedPest(null);
    setRecommendations([]);
    setError(null);
    setLoading(false);
    if (toStep1) {
      setCurrentStage(1);
    } else {
      setCurrentStage(0);
    }
  };

  // Fetch crops when entering the crop selection stage
  useEffect(() => {
    if (currentStage === 1 && isModalOpen) {
      fetchCrops();
    }
  }, [currentStage, isModalOpen]);

  // Fetch pests for selected crop when entering pest selection stage
  useEffect(() => {
    const fetchPests = async () => {
      if (!selectedCrop) return;
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(
          `${BASE_URL}/pest/get-pests/${selectedCrop._id}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch pests");
        }
        const data = await response.json();
        setPests(data);
      } catch (error) {
        setError("Failed to load pests. Please try again.");
        setPests([]);
      } finally {
        setLoading(false);
      }
    };
    if (selectedCrop && currentStage === 2) {
      fetchPests();
    }
  }, [selectedCrop, currentStage]);

  // When entering stage 3 (recommendations) and once eStoreId and selectedPest are available, fetch recommendations
  useEffect(() => {
    if (currentStage === 3 && eStoreId && selectedPest) {
      fetchRecommendations();
    }
  }, [currentStage, eStoreId, selectedPest]);

  // Fetch crops data from API
  const fetchCrops = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BASE_URL}/crop/get-crops`);
      if (!response.ok) {
        throw new Error("Failed to fetch crops");
      }
      const data = await response.json();
      // Filter out crops named "e-fresh" and sort alphabetically
      const sortedCrops = data
        .filter((crop) => crop.title.toLowerCase() !== "e-fresh")
        .sort((a, b) => a.title.localeCompare(b.title));
      setCrops(sortedCrops);
    } catch (error) {
      console.error("Error fetching crops:", error);
      setError("Failed to load crops. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch the eStore category id (for product filtering)
  useEffect(() => {
    const fetchEStoreId = async () => {
      try {
        const response = await fetch(
          `${BASE_URL}/super-category/get-super-category`
        );
        const data = await response.json();
        const eStoreCategory = data.find(
          (cat) => cat.title.toLowerCase() === "e-store"
        );
        if (eStoreCategory) {
          setEStoreId(eStoreCategory._id);
        }
      } catch (error) {
        console.error("Error fetching eStore category:", error);
      }
    };
    fetchEStoreId();
  }, []);

  // Fetch recommendations from product API and filter by eStoreId and selected pest
  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BASE_URL}/product/get-product`);
      const filteredProducts = response.data.filter(
        (product) =>
          product.super_cat_id === eStoreId &&
          product.pest_id === selectedPest._id
      );
      setRecommendations(filteredProducts);
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      setError("Failed to load recommendations. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Stage navigation functions
  const handleCropSelect = (crop) => {
    setSelectedCrop(crop);
    setCurrentStage(2);
  };

  const handlePestSelect = (pest) => {
    setSelectedPest(pest);
    setCurrentStage(3);
  };

  const goBack = () => {
    if (currentStage > 1) {
      setCurrentStage(currentStage - 1);
      if (currentStage === 3) {
        setSelectedPest(null);
        setRecommendations([]);
      } else if (currentStage === 2) {
        setSelectedCrop(null);
        setPests([]);
      }
    } else {
      closeModal();
    }
  };

  // Loader component
  const Loader = () => (
    <div className="flex justify-center items-center py-12">
      <div className="spinner"></div>
      <p className="text-gray-600 ml-4 font-medium">Loading...</p>
    </div>
  );

  // Error Message component
  const ErrorMessage = ({ message, retry }) => (
    <div className="flex flex-col items-center py-12 text-center bg-red-50 rounded-lg">
      <svg
        className="w-12 h-12 text-red-500 mb-3"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        ></path>
      </svg>
      <p className="text-red-600 font-medium mb-4">{message}</p>
      <button
        onClick={retry}
        className="px-5 py-2 bg-red-600 text-white rounded-md shadow hover:bg-red-700 transition duration-300 font-medium"
      >
        Try Again
      </button>
    </div>
  );

  // Progress indicator component
  const ProgressIndicator = () => (
    <div className="flex items-center justify-between w-full px-6 py-6 mb-8 bg-gray-50 rounded-lg">
      {/* Step 1 */}
      <div className="flex flex-col items-center">
        <div
          className={`w-16 h-16 flex items-center justify-center rounded-full mb-3 ${
            currentStage >= 1
              ? "bg-green-100 text-green-600"
              : "bg-gray-100 text-gray-400"
          }`}
        >
          <img src={selectPlant} alt="Select Plant" className="w-8 h-8" />
        </div>
        <div
          className={`w-8 h-8 flex items-center justify-center rounded-full border-2 mb-2 font-semibold ${
            currentStage >= 1
              ? "border-green-500 text-green-600"
              : "border-gray-400 text-gray-500"
          }`}
        >
          1
        </div>
        <p
          className={`text-sm font-medium ${
            currentStage >= 1 ? "text-green-600" : "text-gray-500"
          }`}
        >
          Select Plant
        </p>
      </div>

      {/* Connector Line */}
      <div
        className={`h-1 flex-1 mx-2 rounded ${
          currentStage >= 2 ? "bg-green-500" : "bg-gray-300"
        }`}
      ></div>

      {/* Step 2 */}
      <div className="flex flex-col items-center">
        <div
          className={`w-16 h-16 flex items-center justify-center rounded-full mb-3 ${
            currentStage >= 2
              ? "bg-green-100 text-green-600"
              : "bg-gray-100 text-gray-400"
          }`}
        >
          <img src={findPest} alt="Identify Pest" className="w-8 h-8" />
        </div>
        <div
          className={`w-8 h-8 flex items-center justify-center rounded-full border-2 mb-2 font-semibold ${
            currentStage >= 2
              ? "border-green-500 text-green-600"
              : "border-gray-400 text-gray-500"
          }`}
        >
          2
        </div>
        <p
          className={`text-sm font-medium ${
            currentStage >= 2 ? "text-green-600" : "text-gray-500"
          }`}
        >
          Identify Pest
        </p>
      </div>

      {/* Connector Line */}
      <div
        className={`h-1 flex-1 mx-2 rounded ${
          currentStage >= 3 ? "bg-green-500" : "bg-gray-300"
        }`}
      ></div>

      {/* Step 3 */}
      <div className="flex flex-col items-center">
        <div
          className={`w-16 h-16 flex items-center justify-center rounded-full mb-3 ${
            currentStage >= 3
              ? "bg-green-100 text-green-600"
              : "bg-gray-100 text-gray-400"
          }`}
        >
          <img src={getExact} alt="Get Products" className="w-8 h-8" />
        </div>
        <div
          className={`w-8 h-8 flex items-center justify-center rounded-full border-2 mb-2 font-semibold ${
            currentStage >= 3
              ? "border-green-500 text-green-600"
              : "border-gray-400 text-gray-500"
          }`}
        >
          3
        </div>
        <p
          className={`text-sm font-medium ${
            currentStage >= 3 ? "text-green-600" : "text-gray-500"
          }`}
        >
          Solutions
        </p>
      </div>
    </div>
  );

  // Product Package Dialog for package selection and add-to-cart (like Pesticides.jsx)
  const [dialogProduct, setDialogProduct] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const openProductDialog = (product) => {
    setDialogProduct(product);
    setIsDialogOpen(true);
  };
  const closeProductDialog = () => {
    setDialogProduct(null);
    setIsDialogOpen(false);
  };

  const ProductDialog = ({ product, isOpen, onClose }) => {
    const [localQuantities, setLocalQuantities] = useState({});
    useEffect(() => {
      if (isOpen && product) {
        const packageData = product.package_qty || [];
        const quantities = {};
        packageData.forEach((pkg) => {
          const quantity = getItemQuantity(product._id, pkg._id);
          quantities[pkg._id] = quantity;
        });
        setLocalQuantities(quantities);
      }
    }, [isOpen, product]);

    // Remove from cart logic: match Pesticides.jsx
    const handleRemoveFromCart = (product, pkg) => {
      const currentQuantity = localQuantities[pkg._id] || 0;
      if (currentQuantity > 1) {
        // Update cart with new quantity for this package
        addToCart({
          id: product._id,
          title: product.title,
          sub_title: product.sub_title,
          mfg_by: product.mfg_by,
          imageUrl: product.images && product.images.length > 0 ? product.images[0].imageUrl : product.imageUrl,
          source: "e-store",
          variant: {
            originalPrice: pkg.mrp_price,
            price: pkg.sell_price,
            quantity: currentQuantity - 1,
            packageId: pkg._id,
            packageName: pkg.pkgName,
            packageQty: pkg.qty,
            mfgDate: pkg.mfg_date,
            expDate: pkg.exp_date,
            source: "e-store",
          },
        });
        setLocalQuantities((prev) => ({ ...prev, [pkg._id]: currentQuantity - 1 }));
      } else if (currentQuantity === 1) {
        removeFromCart(product._id, pkg._id, "e-store");
        setLocalQuantities((prev) => ({ ...prev, [pkg._id]: 0 }));
      }
    };

    if (!isOpen || !product) return null;
    const packageData = product.package_qty || [];
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
        <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
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
              src={
                product.images && product.images.length > 0
                  ? product.images[0].imageUrl
                  : product.imageUrl
              }
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
                <div
                  key={pkg._id}
                  className="flex justify-between items-center border p-2 rounded border-gray-300"
                >
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
                        <button
                          onClick={() => {
                            addToCart({
                              id: product._id,
                              title: product.title,
                              sub_title: product.sub_title,
                              mfg_by: product.mfg_by,
                              imageUrl:
                                product.images && product.images.length > 0
                                  ? product.images[0].imageUrl
                                  : product.imageUrl,
                              source: "e-store",
                              variant: {
                                originalPrice: pkg.mrp_price,
                                price: pkg.sell_price,
                                quantity: (localQuantities[pkg._id] || 0) + 1,
                                packageId: pkg._id,
                                packageName: pkg.pkgName,
                                packageQty: pkg.qty,
                                mfgDate: pkg.mfg_date,
                                expDate: pkg.exp_date,
                                source: "e-store",
                              },
                            });
                            setLocalQuantities((prev) => ({
                              ...prev,
                              [pkg._id]: (prev[pkg._id] || 0) + 1,
                            }));
                          }}
                        >
                       <img src={plusIcon} alt="Add" className="w-4 h-4" />

                        </button>
                      </div>
                    ) : (
                      <button
                        className="bg-gray-600 hover:bg-orange-600 text-white px-4 py-1 rounded text-sm"
                        onClick={() => {
                          addToCart({
                            id: product._id,
                            title: product.title,
                            sub_title: product.sub_title,
                            mfg_by: product.mfg_by,
                            imageUrl:
                              product.images && product.images.length > 0
                                ? product.images[0].imageUrl
                                : product.imageUrl,
                            source: "e-store",
                            variant: {
                              originalPrice: pkg.mrp_price,
                              price: pkg.sell_price,
                              quantity: 1,
                              packageId: pkg._id,
                              packageName: pkg.pkgName,
                              packageQty: pkg.qty,
                              mfgDate: pkg.mfg_date,
                              expDate: pkg.exp_date,
                              source: "e-store",
                            },
                          });
                          setLocalQuantities((prev) => ({
                            ...prev,
                            [pkg._id]: 1,
                          }));
                        }}
                      >
                        Add to Cart
                      </button>
                    )}
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

  // Render modal content based on current stage
  const renderModalContent = () => {
    switch (currentStage) {
      case 1:
        return (
          <div className="w-full p-6">
            <ProgressIndicator />
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h3 className="text-xl font-bold text-green-700 mb-6">
                Step 1: Select Your Plant/Crop
              </h3>
              {loading ? (
                <Loader />
              ) : error ? (
                <ErrorMessage message={error} retry={fetchCrops} />
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {crops.map((crop) => (
                    <div
                      key={crop._id}
                      onClick={() => handleCropSelect(crop)}
                      className="flex flex-col items-center bg-white rounded-xl border border-gray-200 p-4 cursor-pointer hover:shadow-lg hover:border-green-300 transition-all group"
                    >
                      <div className="w-20 h-20 p-2 rounded-full bg-green-50 mb-3 flex items-center justify-center group-hover:bg-green-100 transition-colors">
                        <img
                          src={crop.imageUrl}
                          alt={crop.title}
                          className="w-14 h-14 object-contain"
                        />
                      </div>
                      <p className="text-sm font-medium text-gray-800 text-center group-hover:text-green-700 transition-colors">
                        {crop.title}
                      </p>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex justify-start mt-8">
                <button
                  onClick={goBack}
                  className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg border border-gray-300 hover:bg-gray-200 transition duration-300 flex items-center font-medium"
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M10 19l-7-7m0 0l7-7m-7 7h18"
                    ></path>
                  </svg>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="w-full p-6">
            <ProgressIndicator />
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h3 className="text-xl font-bold text-green-700 mb-4">
                Step 2: Identify the Pest or Disease
              </h3>
              <div className="flex items-center bg-green-50 p-3 rounded-lg mb-6">
                <svg
                  className="w-5 h-5 text-green-600 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
                <p className="text-base text-green-700">
                  Selected crop:{" "}
                  <span className="font-semibold">{selectedCrop?.title}</span>
                </p>
              </div>
              {loading ? (
                <Loader />
              ) : error ? (
                <ErrorMessage message={error} retry={() => {}} />
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {pests.map((pest) => (
                    <div
                      key={pest._id}
                      onClick={() => handlePestSelect(pest)}
                      className="flex flex-col items-center bg-white rounded-xl border border-gray-200 p-4 cursor-pointer hover:shadow-lg hover:border-green-300 transition-all group"
                    >
                      <div className="w-20 h-20 rounded-full bg-red-50 mb-3 flex items-center justify-center group-hover:bg-red-100 transition-colors p-2">
                        <img
                          src={pest.imageUrl}
                          alt={pest.name}
                          className="w-14 h-14 object-contain"
                        />
                      </div>
                      <p className="text-sm font-medium text-gray-800 text-center group-hover:text-red-700 transition-colors">
                        {pest.name}
                      </p>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex justify-start mt-8">
                <button
                  onClick={goBack}
                  className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg border border-gray-300 hover:bg-gray-200 transition duration-300 flex items-center font-medium"
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M10 19l-7-7m0 0l7-7m-7 7h18"
                    ></path>
                  </svg>
                  Back
                </button>
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="w-full p-6">
            <ProgressIndicator />
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h3 className="text-xl font-bold text-green-700 mb-4">
                Step 3: Recommended Products
              </h3>
              <div className="flex items-center bg-blue-50 p-4 rounded-lg mb-6">
                <svg
                  className="w-6 h-6 text-blue-600 mr-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
                <p className="text-base text-blue-700">
                  For{" "}
                  <span className="font-semibold">{selectedCrop?.title}</span>{" "}
                  affected by{" "}
                  <span className="font-semibold">{selectedPest?.name}</span>
                </p>
              </div>
              {loading ? (
                <Loader />
              ) : error ? (
                <ErrorMessage message={error} retry={fetchRecommendations} />
              ) : recommendations.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <svg
                    className="w-16 h-16 text-gray-400 mx-auto mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M20 12H4"
                    ></path>
                  </svg>
                  <h4 className="text-xl font-medium text-gray-600 mb-2">
                    No Products Found
                  </h4>
                  <p className="text-gray-500">
                    We couldn't find any products for this specific issue.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {recommendations.map((product) => {
                    const defaultPackage =
                      product.package_qty && product.package_qty.length > 0
                        ? product.package_qty[0]
                        : null;
                    return (
                      <div
                        key={product._id}
                        className="relative bg-white border border-gray-200 rounded-lg shadow-md p-4 sm:p-4 flex flex-col hover:shadow-lg transition"
                      >
                        {/* Discount Badge */}
                        <div className="absolute top-2 left-2">
                          <div className="relative w-12 h-12">
                            <img
                              src={discount}
                              alt="Discount Badge"
                              className="w-full h-full object-contain"
                            />
                            {defaultPackage && (
                              <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-white text-xs font-bold leading-none">
                                  {defaultPackage.mrp_price &&
                                  defaultPackage.sell_price
                                    ? Math.round(
                                        ((defaultPackage.mrp_price -
                                          defaultPackage.sell_price) /
                                          defaultPackage.mrp_price) *
                                          100
                                      )
                                    : 0}
                                  %
                                </span>
                                <span className="text-white text-xs font-medium leading-none">
                                  OFF
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        {/* Product Image */}
                        <img
                          src={
                            product.images && product.images.length > 0
                              ? product.images[0].imageUrl
                              : product.imageUrl
                          }
                          alt={product.title}
                          className="w-full h-28 sm:h-36 object-contain rounded-lg"
                        />
                        {/* Product Details */}
                        <h3 className="text-sm font-semibold text-gray-800 truncate mt-2">
                          {product.title}
                        </h3>
                        <div className="flex space-x-1 items-center mt-1">
                          <img
                            src={medical}
                            alt="medical"
                            className="w-4 h-4"
                          />
                          <p className="text-gray-500 text-xs mb-1 truncate">
                            {product.sub_title}
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
                        <div className="flex flex-col sm:flex-row text-xs text-gray-600 space-y-1 sm:space-y-0 sm:space-x-2">
                          <span>
                            <strong>MFG :</strong>{" "}
                            {defaultPackage?.mfg_date ? (
                              <span className="text-green-600">
                                {new Date(
                                  defaultPackage.mfg_date
                                ).toLocaleDateString("en-GB")}
                              </span>
                            ) : (
                              "N/A"
                            )}
                          </span>
                          <span>
                            <span className="hidden sm:inline">|</span>{" "}
                            <strong>EXP :</strong>{" "}
                            {defaultPackage?.exp_date ? (
                              <span className="text-red-600">
                                {new Date(
                                  defaultPackage.exp_date
                                ).toLocaleDateString("en-GB")}
                              </span>
                            ) : (
                              "N/A"
                            )}
                          </span>
                        </div>
                        {/* Price Details */}
                        <div className="flex items-center space-x-2 mt-1">
                          <div className="text-base font-bold text-black-600">
                            ₹{defaultPackage?.sell_price}
                          </div>
                          {defaultPackage?.mrp_price &&
                            defaultPackage?.mrp_price >
                              defaultPackage?.sell_price && (
                              <div className="text-base font-bold text-gray-500 line-through">
                                ₹{defaultPackage.mrp_price}
                              </div>
                            )}
                        </div>
                        <p className="text-xs text-green-500">
                          {defaultPackage?.mrp_price &&
                          defaultPackage?.sell_price
                            ? `Saved Price ₹${
                                defaultPackage.mrp_price -
                                defaultPackage.sell_price
                              }`
                            : null}
                        </p>
                        {/* Package selection button */}
                        <div className="flex items-center justify-between mb-2 mt-2">
                          <label className="text-xs font-semibold text-gray-600 w-1/3">
                            Select
                          </label>
                          <div className="flex items-center w-2/3">
                            <div
                              className="w-full border border-green-300 text-xs rounded px-2 py-1 appearance-none text-center cursor-pointer flex items-center justify-center"
                              onClick={() => openProductDialog(product)}
                            >
                              {defaultPackage && (
                                <span className="flex items-center space-x-1">
                                  <span>
                                    {defaultPackage.qty}{" "}
                                    {defaultPackage.pkgName}
                                  </span>
                                  <img
                                    src={downArrow}
                                    alt="Select"
                                    className="w-5 h-5"
                                  />
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              <div className="flex justify-between mt-8">
                <button
                  onClick={goBack}
                  className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg border border-gray-300 hover:bg-gray-200 transition duration-300 flex items-center font-medium"
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M10 19l-7-7m0 0l7-7m-7 7h18"
                    ></path>
                  </svg>
                  Back
                </button>
                <button
                  onClick={() => resetDiagnosis(true)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition duration-300 flex items-center font-medium"
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    ></path>
                  </svg>
                  Start New Diagnosis
                </button>
              </div>
            </div>
            {/* Product Dialog for package selection */}
            <ProductDialog
              product={dialogProduct}
              isOpen={isDialogOpen}
              onClose={closeProductDialog}
            />
          </div>
        );
      default:
        return null;
    }
  };

  // Modal component for the diagnosis flow
  // Replace your existing Modal definition with this:

  const Modal = ({ isOpen, onClose, children }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop: clicking here closes the modal */}
        <div
          className="absolute inset-0 bg-black bg-opacity-50"
          onClick={onClose}
        ></div>

        {/* Modal content: stop clicks from reaching the backdrop */}
        <div
          className="relative bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-auto z-50"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-gradient-to-r from-green-600 to-green-400 p-4 flex justify-between items-center rounded-t-2xl">
            <h2 className="text-xl font-bold text-white">
              Crop Diagnosis & Treatment
            </h2>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <div className="p-6">{children}</div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-0">
      {/* Main Component (First UI) */}
      <div className="flex flex-col items-center mx-1 bg-white rounded-lg shadow-md border border-green-300">
        <h2 className="text-xl font-bold text-orange-500 mb-2 mt-2">
          {t('cropDiagnosis.title')}
        </h2>
        <div className="w-full border-b-2 border-black-500 mb-4"></div>

        {/* Steps Container */}
        <div className="flex items-center justify-between w-full overflow-x-hidden lg:justify-around flex-nowrap px-4 pb-4">
          {/* Step 1 */}
          <div className="flex flex-col items-center flex-1">
            <img
              src={selectPlant}
              alt="Select Plant/Crop"
              className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 object-contain mb-2"
            />
            <div className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 flex items-center justify-center rounded-full border-2 border-orange-500 text-orange-500 font-bold text-xs sm:text-sm lg:text-base mb-2">
              1
            </div>
            <h3 className="text-xs sm:text-sm lg:text-base font-semibold text-gray-800 text-center">
              {t('cropDiagnosis.selectPlant')}
            </h3>
          </div>

          {/* Arrow 1 */}
          <div className="flex-shrink-0 mx-1">
            <img
              src={arrowIcon}
              alt="Arrow"
              className="w-8 h-8 sm:w-12 sm:h-12 lg:w-20 lg:h-20"
            />
          </div>

          {/* Step 2 */}
          <div className="flex flex-col items-center flex-1">
            <img
              src={findPest}
              alt="Find Pest"
              className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 object-contain mb-2"
            />
            <div className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 flex items-center justify-center rounded-full border-2 border-orange-500 text-orange-500 font-bold text-xs sm:text-sm lg:text-base mb-2">
              2
            </div>
            <h3 className="text-xs sm:text-sm lg:text-base font-semibold text-gray-800 text-center">
              {t('cropDiagnosis.findPest')}
            </h3>
          </div>

          {/* Arrow 2 */}
          <div className="flex-shrink-0 mx-1">
            <img
              src={arrowIcon}
              alt="Arrow"
              className="w-8 h-8 sm:w-12 sm:h-12 lg:w-20 lg:h-20"
            />
          </div>

          {/* Step 3 */}
          <div className="flex flex-col items-center flex-1">
            <img
              src={getExact}
              alt="Get Exact"
              className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 object-contain mb-2"
            />
            <div className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 flex items-center justify-center rounded-full border-2 border-orange-500 text-orange-500 font-bold text-xs sm:text-sm lg:text-base mb-2">
              3
            </div>
            <h3 className="text-xs sm:text-sm lg:text-base font-semibold text-gray-800 text-center">
              {t('cropDiagnosis.getProducts')}
            </h3>
          </div>
        </div>

        {/* Start Diagnosis Button */}
        <div className="w-full flex justify-center my-6">
          <button
            onClick={startDiagnosis}
            className="px-8 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition duration-300 flex items-center"
          >
            <span>{t('cropDiagnosis.startDiagnosis')}</span>
            <svg
              className="w-5 h-5 ml-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              ></path>
            </svg>
          </button>
        </div>
      </div>

      {/* Render the modal if isModalOpen is true */}
      <Modal isOpen={isModalOpen} onClose={closeModal}>
        {renderModalContent()}
      </Modal>

      <style jsx>{`
        .spinner {
          border: 3px solid rgba(0, 0, 0, 0.1);
          border-top: 3px solid #10b981;
          border-radius: 50%;
          width: 32px;
          height: 32px;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

export default CropDiagnosis;

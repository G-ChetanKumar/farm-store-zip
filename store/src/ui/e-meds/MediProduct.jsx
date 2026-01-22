// Helper to get first image URL
const getFirstImageUrl = (product) => {
  if (product.images && product.images.length > 0 && product.images[0].imageUrl) {
    return product.images[0].imageUrl;
  }
  return product.imageUrl || "";
};
import React, { useEffect, useState, useRef } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import { getData } from "../../lib/index";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import block from "../../assets/block.png";
import BASE_URL from "../../Helper/Helper";
import EmedsHeader from "./EmedsHeader";
import { BiSort } from "react-icons/bi";
import { HiChevronDown } from "react-icons/hi";
import { useCart } from "../../contexts/CartContext";
import { useWishlist } from "../../contexts/WishlistContext";
import wishlistIcon from "../../assets/wishlist.png";
import filledHeartIcon from "../../assets/wishlist1.png";
import shareIcon from "../../assets/share.png";
import discountBadge from "../../assets/discountBadge.png";
import plusIcon from "../../assets/plusIcon.png";
import minusIcon from "../../assets/minusIcon.png";

const MediProduct = () => {
  const { categoryId, subcategoryId, brandId, cropId } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortOption, setSortOption] = useState("default");
  const location = useLocation();
  const { addToWishlist, isItemInWishlist } = useWishlist();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [eStoreId, setEStoreId] = useState(null);
  const scrollRef = useRef();

  // Extract brandName from the URL query parameters
  const searchParams = new URLSearchParams(location.search);
  const brandName = searchParams.get("brandName") || "Products";

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
  const handleSortChange = (e) => {
    const value = e.target.value;
    setSortOption(value);
    let sortedProducts = [...products];

    if (value === "az") {
      sortedProducts.sort((a, b) => a.title.localeCompare(b.title));
    } else if (value === "za") {
      sortedProducts.sort((a, b) => b.title.localeCompare(a.title));
    } else if (value === "priceLowHigh") {
      sortedProducts.sort(
        (a, b) => a.package_qty[0].sell_price - b.package_qty[0].sell_price
      );
    } else if (value === "priceHighLow") {
      sortedProducts.sort(
        (a, b) => b.package_qty[0].sell_price - a.package_qty[0].sell_price
      );
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

    useEffect(() => {
      if (isOpen && product?.package_qty) {
        const quantities = {};
        product.package_qty.forEach((pkg) => {
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
              {product.package_qty.map((pkg) => (
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
              {!Array.isArray(product.package_qty) ||
              product.package_qty.length === 0 ? (
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
    // Get the first package's pricing info (assuming we want to use the first package)
    const defaultPackage = product.package_qty[0];

    addToWishlist({
      id: product._id,
      title: product.title,
      sub_title: product.sub_title,
      mfg_by: product.mfg_by,
      imageUrl: getFirstImageUrl(product),
      package_qty: product.package_qty,
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
      <EmedsHeader />
      <div className="p-3">
        {/* Full-width Banner */}
        <div
          className="w-full h-32 flex justify-center items-center"
          style={{
            background: "linear-gradient(to right,rgb(61, 165, 79), #C6861A)",
          }}
        >
          <h2 className="text-3xl md:text-4xl lg:text-4xl font-bold text-white">
            {brandName}
          </h2>
        </div>

        {/* Sorting Dropdown Positioned at Right */}
        <div className="flex justify-end mt-4">
          <div className="relative inline-flex items-center">
            <BiSort className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
            <select
              className="border border-black rounded pl-8 pr-8 bg-white py-2 text-sm appearance-none"
              value={sortOption}
              onChange={handleSortChange}
            >
              <option value="default">Sort B</option>
              <option value="az">Alphabetical (A-Z)</option>
              <option value="za">Alphabetical (Z-A)</option>
              <option value="priceLowHigh">Price (Low to High)</option>
              <option value="priceHighLow">Price (High to Low)</option>
            </select>
            <HiChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
          </div>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((product) => (
              <Link
                to={`/product/${product._id}`}
                key={product._id}
                className="flex-shrink-0 w-60 snap-start"
              >
                <div className="bg-white border border-gray-200 rounded-lg shadow-md p-4 sm:p-4 relative transform transition duration-300 hover:shadow-lg">
                  {/* Discount Badge */}
                  {product.package_qty && product.package_qty.length > 0 && (
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
                              ((product.package_qty[0].mrp_price -
                                product.package_qty[0].sell_price) /
                                product.package_qty[0].mrp_price) *
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
                  <p className="text-gray-500 text-xs">{product.sub_title}</p>
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>
                      <strong>MFG/MKTD BY :</strong>{" "}
                      <span className="text-red-400">{product.mfg_by}</span>
                    </span>
                  </div>
                  <div className="package-qty-list">
                    {product.package_qty && product.package_qty.length > 0 && (
                      <div>
                        <div className="flex justify-between text-xs text-gray-600">
                          <span>
                            <strong>MFG :</strong>{" "}
                            {product.package_qty[0].mfg_date ? (
                              <span className="text-green-600">
                                {new Date(
                                  product.package_qty[0].mfg_date
                                ).toLocaleDateString("en-GB")}
                              </span>
                            ) : (
                              "N/A"
                            )}
                          </span>
                          <span>
                            <strong>| EXP :</strong>{" "}
                            {product.package_qty[0].exp_date ? (
                              <span className="text-red-600">
                                {new Date(
                                  product.package_qty[0].exp_date
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
                            ₹{product.package_qty[0].sell_price}
                          </div>
                          <div className="text-xs text-gray-500 line-through">
                            ₹{product.package_qty[0].mrp_price}
                          </div>
                        </div>
                        <p className="text-xs text-green-500">
                          Saved Price ₹
                          {product.package_qty[0].mrp_price -
                            product.package_qty[0].sell_price}
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
                        className="w-full border text-xs rounded px-2 py-1 appearance-none text-center cursor-pointer flex items-center justify-center"
                        onClick={(e) => {
                          e.preventDefault();
                          handlePackageSelect(product._id);
                        }}
                      >
                        {product.package_qty &&
                          product.package_qty.length > 0 && (
                            <span className="flex items-center space-x-1">
                              <span>
                                {product.package_qty[0].qty}{" "}
                                {product.package_qty[0].pkgName}
                              </span>
                              {/* ChevronDown Icon */}
                              <HiChevronDown className="text-gray-600 w-4 h-4" />
                            </span>
                          )}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center bg-white border rounded-lg shadow-md p-8">
            <h3 className="text-2xl font-bold text-gray-700 mb-2">
              No Products Available
            </h3>
            <p className="text-gray-600">
              We couldn't find any products matching this selection. Please
              check back later or explore other categories.
            </p>
            <img
              src={block}
              alt="No products available"
              className="w-40 h-40 mb-4"
            />
          </div>
        )}
         <ProductDialog
          product={selectedProduct}
          onClose={handleDialogClose}
          isOpen={isDialogOpen}
        />
      </div>
    </>
  );
};

export default MediProduct;

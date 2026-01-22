import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getData } from "../../lib/index";
import { FaChevronRight, FaHome } from "react-icons/fa";
import { useCart } from "../../contexts/CartContext";
import BASE_URL from "../../Helper/Helper";
import plusIcon from "../../assets/plusIcon.png";
import minusIcon from "../../assets/minusIcon.png";
import EmedsHeader from "./EmedsHeader";
import discount from "../../assets/discountBadge.png";

// ProductVariants Component
const ProductVariants = ({ variants, localQuantities, onAdd, onRemove, onBuyNow }) => {
  const calculateDiscount = (mrp, sellPrice) => {
    return Math.round(((mrp - sellPrice) / mrp) * 100);
  };

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-4">Select Variants</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {variants.map((pkg) => (
          <div 
            key={pkg._id} 
            className="border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex flex-col h-full justify-between">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-lg font-semibold">
                      {pkg.qty} {pkg.pkgName}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xl font-bold text-gray-900">
                        ₹{pkg.sell_price}
                      </span>
                      <span className="text-sm text-gray-500 line-through">
                        ₹{pkg.mrp_price}
                      </span>
                    </div>
                  </div>
                  <div className="bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                    {calculateDiscount(pkg.mrp_price, pkg.sell_price)}% OFF
                  </div>
                </div>
                
                <div className="text-sm text-green-600 mb-2">
                  Saved ₹{pkg.mrp_price - pkg.sell_price}
                </div>
                
                <div className="text-sm text-gray-600 mb-4">
                  <span>Expiry : </span>
                  {pkg.exp_date ? (
                    <span className="text-red-600">
                      {new Date(pkg.exp_date).toLocaleDateString("en-GB")}
                    </span>
                  ) : (
                    "N/A"
                  )}
                </div>
              </div>

              <div className="flex justify-center">
                {localQuantities[pkg._id] > 0 ? (
                  <div className="flex items-center gap-3 border-2 border-gray-300 rounded-lg px-4 py-2">
                    <button 
                      onClick={() => onRemove(pkg)}
                      className="text-orange-500 font-bold text-xl"
                    >
                      <img src={minusIcon} alt="Remove" className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center font-medium">
                      {localQuantities[pkg._id]}
                    </span>
                    <button 
                      onClick={() => onAdd(pkg)}
                      className="text-orange-500 font-bold text-xl"
                    >
                      <img src={plusIcon} alt="Add" className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex w-full gap-2">
                    <button
                      onClick={() => onAdd(pkg)}
                      className="flex-1 bg-orange-500 hover:bg-orange-600 text-white px-2 py-1 rounded-lg font-medium transition-colors"
                    >
                      Add to Cart
                    </button>
                    <button
                      onClick={() => onBuyNow(pkg)}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded-lg font-medium transition-colors"
                    >
                      Buy Now
                    </button>
                  </div>                
                )}
              </div>
            </div>
          </div>
        ))}
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
        <Link to={`/products?category=${category?.title}`} className="text-gray-600 hover:text-orange-500">
          {category?.title || "Products"}
        </Link>
      </li>
      {subcategory && (
        <>
          <li className="flex items-center mx-2">
            <FaChevronRight className="text-green-600" size={12} />
          </li>
          <li className="flex items-center">
            <Link to={`/products?category=${category?.title}&subcategory=${subcategory?.title}`} className="text-gray-600 hover:text-orange-500">
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
// Product Description Points Component
const ProductDescriptionPoints = ({ description }) => (
  <div className="mt-6 p-6 bg-white border rounded-lg shadow-md">
    <h3 className="text-lg font-semibold text-gray-800 mb-4">
      Product Description
    </h3>
    <ul className="list-disc pl-6 text-gray-600 space-y-2">
      {description.split("\n").map((point, index) => (
        <li key={index}>{point}</li>
      ))}
    </ul>
  </div>
);

// Main Product Details Page Component
const ProductMediDetail = ({ onCartOpen }) => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const { addToCart, removeFromCart, getItemQuantity } = useCart();
  const [localQuantities, setLocalQuantities] = useState({});
  const [buyTogetherProducts, setBuyTogetherProducts] = useState([]);
  const [eStoreId, setEStoreId] = useState(null);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [category, setCategory] = useState(null);
  const [subcategory, setSubcategory] = useState(null);

  useEffect(() => {
    const fetchEStoreId = async () => {
      try {
        const response = await fetch(`${BASE_URL}/super-category/get-super-category`);
        const data = await response.json();
        const eStoreCategory = data.find((cat) => cat.title === "e-meds");
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
        // Only e-meds super category and not current product
        const filtered = allProducts.filter(p => p.super_cat_id === eStoreId && p._id !== product._id);
        setBuyTogetherProducts(filtered);
      } catch (err) {
        // handle error if needed
      }
    };
    fetchBuyTogetherProducts();
  }, [product, eStoreId]);

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
        const response = await fetch(`${BASE_URL}/subcategory/get-sub-category`);
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
        const endpoint = `${BASE_URL}/product/get-id-product/${productId}`;
        const data = await getData(endpoint);

        if (data) {
          setProduct(data);
          setSelectedImage(data.imageUrl);
          
          // Find category from the fetched categories
          const productCategory = categories.find(cat => cat._id === data.category_id);
          setCategory(productCategory);

          // Find subcategory from the fetched subcategories
          const productSubcategory = subCategories.find(sub => sub._id === data.subcategory_id);
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

  const handleAddToCart = (pkg, buyNow = false) => {
    const currentQuantity = localQuantities[pkg._id] || 0;
    const newQuantity = currentQuantity + 1;
    
    setLocalQuantities(prev => ({
      ...prev,
      [pkg._id]: newQuantity
    }));

    const cartItem = {
      id: product._id,
      title: product.title,
      sub_title: product.sub_title,
      mfg_by: product.mfg_by,
      imageUrl: product.imageUrl,
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
      }
    };

    addToCart(cartItem);
    setSnackbarVisible(true);
    setTimeout(() => setSnackbarVisible(false), 3000);
    
    if (buyNow && typeof onCartOpen === "function") {
      onCartOpen();
    }
  };

  const handleRemoveFromCart = (pkg) => {
    const currentQuantity = localQuantities[pkg._id] || 0;
    if (currentQuantity > 0) {
      const newQuantity = currentQuantity - 1;
      
      setLocalQuantities(prev => ({
        ...prev,
        [pkg._id]: newQuantity
      }));

      if (newQuantity === 0) {
        removeFromCart(product._id, pkg._id, 'e-meds');
      } else {
        const cartItem = {
          id: product._id,
          title: product.title,
          sub_title: product.sub_title,
          mfg_by: product.mfg_by,
          imageUrl: product.imageUrl,
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
          }
        };
        addToCart(cartItem);
      }
    }
  };

  const handleThumbnailClick = (imageUrl) => {
    setSelectedImage(imageUrl);
  };

  return (
    <>
      <EmedsHeader />
      <div className="p-5">
        <div className="max-w-6xl mx-auto">
          <Breadcrumb product={product} category={category} subcategory={subcategory} />

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
                        src={selectedImage || product.imageUrl}
                        alt={product.title}
                        className="object-contain w-full h-full rounded-lg"
                      />
                    </div>
                    {/* Thumbnails: order-2 on mobile/tablet, order-1 on desktop */}
                    <div className="flex flex-row gap-2 justify-center py-2 w-full lg:flex-col lg:w-auto lg:h-full lg:justify-between order-2 lg:order-1">
                      {[product.imageUrl, product.imageUrl, product.imageUrl].map((thumb, index) => (
                        <img
                          key={index}
                          src={thumb}
                          alt={`${product.title} thumbnail ${index + 1}`}
                          className={`w-16 h-16 object-contain cursor-pointer border rounded-lg transition-all
                            ${selectedImage === thumb
                              ? "border-orange-500 shadow-md"
                              : "border-gray-300 hover:border-orange-300"
                            } lg:w-24 lg:h-24`}
                          onClick={() => handleThumbnailClick(thumb)}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Product Details Section */}
                <div className="flex-1">
                  <div className="mb-4">
                    <h2 className="text-2xl font-bold text-gray-800">
                      {product.title}
                    </h2>
                    <p className="text-gray-600 mt-1">{product.sub_title}</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Manufactured by: {product.mfg_by}
                    </p>
                  </div>

                  <ProductVariants
                    variants={product.package_qty}
                    localQuantities={localQuantities}
                    onAdd={(pkg) => handleAddToCart(pkg, false)}
                    onRemove={handleRemoveFromCart}
                    onBuyNow={(pkg) => handleAddToCart(pkg, true)}
                  />

                  <div className="mt-6">
                    <p className="text-sm text-gray-500">
                      Inclusive of all taxes
                    </p>
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <p className="text-gray-700">
                        For bulk orders, please call us on{" "}
                        <a href="tel:9010189891" className="font-bold text-orange-500 hover:text-orange-600">
                          9010189891
                        </a>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <ProductDescriptionPoints description={product.description} />
              {/* Buy Together Section - e-meds only, Pesticides card style */}
              {buyTogetherProducts.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-lg font-semibold mb-4 text-green-700">Buy Together</h3>
                  <div className="relative overflow-x-scroll flex space-x-4 snap-x snap-mandatory scrollbar-hide pb-2">
                    {buyTogetherProducts.map((item) => {
                      const pkg = item.package_qty?.[0]; // Use first package as default
                      if (!pkg) return null;
                      return (
                        <Link
                          to={`/medproduct/${item._id}`}
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
                                    {Math.round(((pkg.mrp_price - pkg.sell_price) / pkg.mrp_price) * 100)}%
                                  </span>
                                  <span className="text-white text-xs font-medium leading-none">OFF</span>
                                </div>
                              </div>
                            </div>
                            {/* Product Image */}
                            <img
                              src={item.imageUrl}
                              alt={item.title}
                              className="w-full h-28 sm:h-36 object-contain rounded-lg"
                            />
                            {/* Product Details */}
                            <h3 className="text-sm font-semibold text-gray-800 truncate">{item.title}</h3>
                            <p className="text-gray-500 text-xs mb-1 truncate">{item.sub_title}</p>
                            <div className="flex items-center text-xs text-gray-600 mb-1 space-x-1">
                              <strong className="whitespace-nowrap flex-shrink-0">MFG/MKTD BY :</strong>
                              <span className="text-red-400 truncate flex-grow ml-1 min-w-0">{product.mfg_by}</span>
                            </div>
                            <div className="package-qty-list">
                              <div>
                                <div className="flex flex-col sm:flex-row text-xs text-gray-600 space-y-1 sm:space-y-0 sm:space-x-2">
                                  <span>
                                    <strong>MFG :</strong> {pkg.mfg_date ? (<span className="text-green-600">{new Date(pkg.mfg_date).toLocaleDateString("en-GB")}</span>) : ("N/A")}
                                  </span>
                                  <span>
                                    <strong>| EXP :</strong> {pkg.exp_date ? (<span className="text-red-600">{new Date(pkg.exp_date).toLocaleDateString("en-GB")}</span>) : ("N/A")}
                                  </span>
                                </div>
                                {/* Price Details */}
                                <div className="flex items-center space-x-2">
                                  <div className="text-base font-bold text-black-600">₹{pkg.sell_price}</div>
                                  <div className="text-base font-bold text-gray-500 line-through">₹{pkg.mrp_price}</div>
                                </div>
                                <p className="text-xs text-green-500">Saved Price ₹{pkg.mrp_price - pkg.sell_price}</p>
                              </div>
                            </div>
                            <div className="flex items-center justify-between mb-2 mt-2">
                              <label className="text-xs font-semibold text-gray-600 w-1/3">Select</label>
                              <div className="flex items-center w-2/3">
                                <div className="w-full border border-green-300 text-xs rounded px-2 py-1 appearance-none text-center cursor-pointer flex items-center justify-center">
                                  <span className="flex items-center space-x-1">
                                    <span>{pkg.qty} {pkg.pkgName}</span>
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
        </div>
      </div>
    </>
  );
};

export default ProductMediDetail;


import React from "react";
import { useWishlist } from "../contexts/WishlistContext";
import { useCart } from "../contexts/CartContext";
import { ShoppingCartIcon } from "@heroicons/react/24/outline";
import Navbar from "./Header";

const WishlistPage = () => {

  const { wishlist, removeFromWishlist } = useWishlist();
  const { addToCart, isItemInCart, getItemQuantity } = useCart();

  // Helper function to safely parse price values
  const formatPrice = (price) => {
    if (!price) return 0;
    const parsed = parseFloat(price);
    return isNaN(parsed) ? 0 : parsed;
  };

  // Add to cart logic matching Pesticides.jsx (handles quantity, package, etc)
  const handleAddToCart = (product) => {
    if (!product || !product.id || !product.selectedPackage) {
      console.error("Invalid product data:", product);
      return;
    }
    const pkg = product.selectedPackage;
    // Get current quantity in cart for this product/package
    const currentQty = getItemQuantity(product.id, pkg.id) || 0;
    const cartItem = {
      id: product.id,
      title: product.title || "Untitled",
      sub_title: product.sub_title || "",
      mfg_by: product.mfg_by || "",
      imageUrl: product.imageUrl || "",
      source: "e-store",
      variant: {
        originalPrice: formatPrice(pkg.mrp_price),
        price: formatPrice(pkg.sell_price),
        quantity: currentQty + 1,
        packageId: pkg.id,
        packageName: pkg.pkgName,
        packageQty: pkg.qty,
        mfgDate: pkg.mfg_date,
        expDate: pkg.exp_date,
        source: "e-store",
      },
    };
    addToCart(cartItem);
  };

  const handleRemoveFromWishlist = (productId) => {
    if (!productId) return;
    removeFromWishlist(productId);
  };

  return (
    <>
    <Navbar/>
    <section className="py-8 bg-gray-100">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Wishlist</h2>

        {wishlist.length === 0 ? (
          <p className="text-gray-600">Your wishlist is empty!</p>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            {wishlist.map((product) => {
              // Get pricing from selectedPackage
              const sellPrice = formatPrice(product.selectedPackage?.sell_price);
              const mrpPrice = formatPrice(product.selectedPackage?.mrp_price);

              return (
                <div
                  key={product.id}
                  className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
                >
                  {/* Image Container */}
                  <div className="w-full h-32 p-2">
                    <img
                      src={product.imageUrl}
                      alt={product.title}
                      className="w-full h-full object-contain"
                    />
                  </div>

                  {/* Product Details */}
                  <div className="p-2 border-t">
                    <h3 className="text-sm font-medium text-gray-800 line-clamp-1 mb-1">
                      {product.title || "Untitled"}
                    </h3>

                    {/* Package Details */}
                    {product.selectedPackage && (
                      <p className="text-xs text-gray-600 mb-1">
                        {product.selectedPackage.qty} {product.selectedPackage.pkgName}
                      </p>
                    )}

                    {/* Price Display */}
                    <div className="flex items-baseline gap-1 mb-2">
                      {sellPrice > 0 && (
                        <span className="text-base font-bold text-gray-900">
                          ₹{sellPrice.toFixed(2)}
                        </span>
                      )}
                      {mrpPrice > 0 && mrpPrice !== sellPrice && (
                        <span className="text-xs text-gray-500 line-through">
                          ₹{mrpPrice.toFixed(2)}
                        </span>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-1">
                      <button
                        className={`flex-1 flex items-center justify-center py-1.5 px-1 rounded text-xs font-medium ${
                          isItemInCart(product.id, product.selectedPackage?.id)
                            ? "bg-green-50 text-green-600 border border-green-200"
                            : "bg-orange-500 text-white hover:bg-orange-600"
                        }`}
                        onClick={(e) => {
                          e.preventDefault();
                          if (!isItemInCart(product.id, product.selectedPackage?.id)) {
                            handleAddToCart(product);
                          }
                        }}
                        disabled={isItemInCart(product.id, product.selectedPackage?.id)}
                      >
                        <ShoppingCartIcon className="w-3 h-3 mr-1" />
                        {isItemInCart(product.id, product.selectedPackage?.id)
                          ? `Added (${getItemQuantity(product.id, product.selectedPackage?.id)})`
                          : "Add"}
                      </button>

                      <button
                        onClick={() => handleRemoveFromWishlist(product.id)}
                        className="px-2 py-1.5 rounded text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
    </>
  );
};

export default WishlistPage;
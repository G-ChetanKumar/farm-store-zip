import React, { createContext, useContext, useState, useEffect } from "react";

// Create Wishlist Context
const WishlistContext = createContext();

export const useWishlist = () => useContext(WishlistContext);

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]);

  // Load wishlist from localStorage on first render
  useEffect(() => {
    const savedWishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
    setWishlist(savedWishlist);
  }, []);

  // Save wishlist to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  const addToWishlist = (product) => {
    if (!product.id) {
      console.error("Invalid product format:", product);
      return; // Prevent invalid items from being added
    }

    setWishlist((prevWishlist) => {
      const isProductInWishlist = prevWishlist.some(
        (item) => item.id === product.id
      );
      if (isProductInWishlist) {
        // Remove from wishlist
        return prevWishlist.filter((item) => item.id !== product.id);
      } else {
        // Add to wishlist
        return [...prevWishlist, product];
      }
    });
  };

  const isItemInWishlist = (id) => {
    return wishlist.some((item) => item.id === id);
  };

  const removeFromWishlist = (id) => {
    setWishlist((prevWishlist) => {
      return prevWishlist.filter((item) => item.id !== id);
    });
  };

  const wishlistCount = wishlist.length;

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        addToWishlist,
        isItemInWishlist,
        removeFromWishlist,
        wishlistCount,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

import React, { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const savedCart = localStorage.getItem("cartItems");
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (error) {
      console.error("Error loading cart from localStorage:", error);
      return [];
    }
  });

  // Save cartItems to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem("cartItems", JSON.stringify(cartItems));
    } catch (error) {
      console.error("Error saving cart to localStorage:", error);
    }
  }, [cartItems]);

  useEffect(() => {
    // Calculate the current total cart value
    const totalCartValue = cartItems.reduce(
      (sum, item) => sum + parseFloat(item.variant.price) * item.quantity,
      0
    );
    
    // Loop over cart items to identify exclusive deal items
    cartItems.forEach((item) => {
      if (item.variant.exclusiveThreshold && totalCartValue < item.variant.exclusiveThreshold) {
        removeFromCart(item.id, item.variant.packageInfo?.packageId);
      }
    });
  }, [cartItems]);
  
  const addToCart = (newItem) => {
    // Determine the source based on the component path
    let source = 'e-store'; // default source
    
    // Check if the item is from e-meds components
    if (newItem.source === 'e-meds' || 
        (newItem.variant && newItem.variant.source === 'e-meds')) {
      source = 'e-meds';
    }
    // Check if the item is from e-fresh components
    else if (newItem.source === 'e-fresh' || 
             (newItem.variant && newItem.variant.source === 'e-fresh')) {
      source = 'e-fresh';
    }

    setCartItems((prevItems) => {
      // Check if the item already exists in the cart
      const existingItemIndex = prevItems.findIndex(
        (item) =>
          item.id === newItem.id &&
          item.variant?.packageId === newItem.variant?.packageId &&
          item.source === source
      );

      if (existingItemIndex > -1) {
        // If item exists, update its quantity
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: newItem.variant.quantity || 1,
          variant: {
            ...updatedItems[existingItemIndex].variant,
            quantity: newItem.variant.quantity || 1
          }
        };
        return updatedItems;
      } else {
        // If item doesn't exist, add it as a new item with source
        return [...prevItems, { 
          ...newItem, 
          source,
          quantity: newItem.variant.quantity || 1,
          variant: {
            ...newItem.variant,
            quantity: newItem.variant.quantity || 1
          }
        }];
      }
    });
  };
  
  const getItemQuantity = (itemId, packageId = null, source = null) => {
    const item = cartItems.find(
      (item) =>
        item.id === itemId &&
        (!packageId || item.variant?.packageId === packageId) &&
        (!source || item.source === source)
    );
    return item?.quantity || 0;
  };

  const removeFromCart = (itemId, packageId = null, source = null) => {
    setCartItems(prevItems => {
      if (packageId && source) {
        return prevItems.filter(item => 
          !(item.id === itemId && item.variant.packageId === packageId && item.source === source)
        );
      }
      return prevItems.filter(item => item.id !== itemId);
    });
  };

  const updateItemQuantity = (itemId, newQuantity, source = null) => {
    if (newQuantity < 1) {
      return removeFromCart(itemId, null, source);
    }

    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === itemId && (!source || item.source === source)
          ? { 
              ...item, 
              quantity: newQuantity,
              variant: {
                ...item.variant,
                quantity: newQuantity
              }
            }
          : item
      )
    );
  };

  const clearCart = (source = null) => {
    if (source) {
      setCartItems(prevItems => prevItems.filter(item => item.source !== source));
    } else {
      setCartItems([]);
      localStorage.removeItem("cartItems");
    }
  };

  const cartCount = (source = null) => {
    if (source) {
      return cartItems
        .filter(item => item.source === source)
        .reduce((total, item) => total + (item.quantity || 0), 0);
    }
    // Calculate total count across all sources
    const totalCount = cartItems.reduce((total, item) => {
      const quantity = item.quantity || 0;
      return total + quantity;
    }, 0);
    return totalCount;
  };

  const cartSubtotal = (source = null) => {
    if (source) {
      return cartItems
        .filter(item => item.source === source)
        .reduce((total, item) => {
          const quantity = item.quantity || 0;
          const price = item.variant?.price || 0;
          return total + (quantity * price);
        }, 0);
    }
    return cartItems.reduce((total, item) => {
      const quantity = item.quantity || 0;
      const price = item.variant?.price || 0;
      return total + (quantity * price);
    }, 0);
  };

  const totalSavings = (source = null) => {
    if (source) {
      return cartItems
        .filter(item => item.source === source)
        .reduce((total, item) => {
          const quantity = item.quantity || 0;
          const originalPrice = item.variant?.originalPrice || 0;
          const price = item.variant?.price || 0;
          return total + (quantity * (originalPrice - price));
        }, 0);
    }
    return cartItems.reduce((total, item) => {
      const quantity = item.quantity || 0;
      const originalPrice = item.variant?.originalPrice || 0;
      const price = item.variant?.price || 0;
      return total + (quantity * (originalPrice - price));
    }, 0);
  };

  const getItemsBySource = (source) => {
    return cartItems.filter(item => item.source === source);
  };

  const contextValue = {
    cartItems,
    addToCart,
    removeFromCart,
    updateItemQuantity,
    clearCart,
    cartCount,
    cartSubtotal,
    totalSavings,
    hasItems: cartItems.length > 0,
    getItemQuantity,
    isItemInCart: (itemId, packageId, source) => cartItems.some(
      item => item.id === itemId && item.variant.packageId === packageId && (!source || item.source === source)
    ),
    getItemsBySource
  };

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

export default CartContext;

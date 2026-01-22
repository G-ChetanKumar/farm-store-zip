import React, { useState, useEffect } from "react";
import { useCart } from "../contexts/CartContext";
import { FiTrash2, FiEdit3, FiX, FiCheck } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import plusIcon from "../assets/plusIcon.png";
import minusIcon from "../assets/minusIcon.png";
import delete1 from "../assets/images/delete1.png";

const Snackbar = ({ message, isVisible, onClose, type = "success" }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  const bgColor = type === "success" ? "bg-green-500" : "bg-red-500";

  return (
    <div
      className={`fixed bottom-4 right-4 flex items-center ${bgColor} text-white px-4 py-2 rounded-lg shadow-lg transform transition-transform duration-300 ease-in-out z-50`}
      style={{ minWidth: "200px" }}
    >
      <div className="mr-2">
        <FiCheck size={18} />
      </div>
      <p className="flex-grow text-sm">{message}</p>
      <button
        onClick={onClose}
        className="ml-4 hover:opacity-80 transition-opacity"
        aria-label="Close notification"
      >
        <FiX size={18} />
      </button>
    </div>
  );
};

const CartPage = ({ isOpen, onClose }) => {
  const { 
    cartItems, 
    removeFromCart, 
    updateItemQuantity, 
    cartCount, 
    cartSubtotal, 
    totalSavings,
    getItemsBySource 
  } = useCart();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('e-store');
  const [snackbar, setSnackbar] = useState({
    visible: false,
    message: "",
    type: "success",
  });
  const [termsAccepted, setTermsAccepted] = useState(true);
  const [error, setError] = useState("");

  const showSnackbar = (message, type = "success") => {
    setSnackbar({
      visible: true,
      message,
      type,
    });
  };

  const hideSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, visible: false }));
  };

  const handleRemoveItem = (itemId, itemTitle, source) => {
    removeFromCart(itemId, null, source);
    showSnackbar(`${itemTitle} removed from cart successfully`);
  };

  const handleQuantityUpdate = (itemId, newQuantity, source, packageId) => {
    if (newQuantity >= 1 && newQuantity <= 99) {
      updateItemQuantity(itemId, newQuantity, source, packageId);
      showSnackbar("Quantity updated successfully");
    }
  };

  const handleCheckout = () => {
    if (!termsAccepted) {
      setError("You must accept the terms and conditions to proceed.");
      return;
    }
    setError(""); 
    onClose(); 
    navigate("/checkout"); 
  };

  const renderCartItems = (source) => {
    const items = getItemsBySource(source);
    
    if (items.length === 0) {
      return <p className="text-center text-gray-500">Your {source} cart is empty.</p>;
    }

    return items.map((item, index) => (
      <div key={`${item.id}-${item.variant?.packageId || item.variant?.packageName || index}`} className="border-b pb-4 mb-4">
        <div className="flex items-center justify-between">
          <img
            src={item.imageUrl}
            alt={item.title}
            className="w-20 h-20 object-cover border rounded"
          />
          <div className="ml-4 flex-grow">
            <h3 className="text-sm font-semibold">{item.title}</h3>
            {/* Show package name and quantity if available */}
            {item.variant && (item.variant.packageName || item.variant.packageQty) && (
              <p className="text-xs text-gray-700 mb-1">
                <span className="font-semibold">{item.variant.packageQty} {item.variant.packageName}</span> 
              </p>
            )}
            <p className="text-xs text-gray-600">{item.sub_title}</p>
            <p className="text-sm font-bold text-green-600">
              ₹{parseFloat(item.variant.price).toFixed(2)}
            </p>
            <p className="text-xs text-gray-500 line-through">
              ₹{parseFloat(item.variant.originalPrice).toFixed(2)}
            </p>
            <p className="text-xs text-green-600">
              Save: ₹
              {(
                parseFloat(item.variant.originalPrice) -
                parseFloat(item.variant.price)
              ).toFixed(2)}
            </p>
          </div>
          <button
            onClick={() => handleRemoveItem(item.id, item.title, source)}
            className="text-red-500 p-1 hover:bg-red-50 rounded transition-colors"
            aria-label={`Remove ${item.title} from cart`}
          >
            <img src={delete1} alt="Remove" className="w-5 h-5" />
          </button>
        </div>
        <div className="flex items-center mt-2">
          <button
            onClick={() => handleQuantityUpdate(item.id, item.quantity - 1, source, item.variant?.packageId)}
            className="px-2 py-1 rounded hover:bg-gray-300 transition-colors"
            disabled={item.quantity <= 1}
            aria-label="Decrease quantity"
          >
            <img src={minusIcon} alt="Remove" className="w-4 h-4" />
          </button>
          <span className="mx-2">{item.quantity}</span>
          <button
            onClick={() => handleQuantityUpdate(item.id, item.quantity + 1, source, item.variant?.packageId)}
            className="px-2 py-1 rounded hover:bg-gray-300 transition-colors"
            disabled={item.quantity >= 99}
            aria-label="Increase quantity"
          >
            <img src={plusIcon} alt="Add" className="w-4 h-4" />
          </button>
          <span className="ml-2 text-sm text-gray-600">
            ₹
            {(parseFloat(item.variant.price) * item.quantity).toFixed(2)}
          </span>
        </div>
      </div>
    ));
  };

  const renderCartSummary = (source) => {
    const items = getItemsBySource(source);
    if (items.length === 0) return null;

    return (
      <div className="mt-auto border-t pt-4">
        <div className="flex items-center mb-4">
          <FiEdit3 className="mr-2 text-green-500" />
          <textarea
            placeholder="Add order notes"
            className="w-full p-2 border rounded text-sm"
            rows="2"
            aria-label="Order notes"
          />
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span>Items Total</span>
            <span>₹{cartSubtotal(source).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm text-green-600">
            <span>Total Savings</span>
            <span>₹{totalSavings(source).toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold text-lg">
            <span>Sub Total</span>
            <span>₹{cartSubtotal(source).toFixed(2)}</span>
          </div>
        </div>

        <div className="flex items-center mb-4">
          <input
            type="checkbox"
            id="terms"
            className="mr-2"
            checked={termsAccepted}
            onChange={(e) => setTermsAccepted(e.target.checked)}
            aria-label="Accept terms and conditions"
          />
          <label htmlFor="terms" className="text-xs">
            I accept the{" "}
            <a href="#" className="text-blue-500 underline">
              terms and conditions
            </a>
          </label>
        </div>
        {error && <p className="text-xs text-red-500 mb-2">{error}</p>}

        <button
          onClick={handleCheckout}
          className="w-full p-3 bg-green-500 text-white rounded text-sm font-semibold hover:bg-green-600 transition-colors"
          aria-label="Proceed to checkout"
        >
          Checkout
        </button>
        <p className="text-xs text-gray-500 mt-2">
          Shipping, taxes, and discount codes calculated at checkout.
        </p>
      </div>
    );
  };

  return (
    <>
      <Snackbar
        message={snackbar.message}
        isVisible={snackbar.visible}
        onClose={hideSnackbar}
        type={snackbar.type}
      />

      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
          aria-label="Close cart"
          role="button"
        />
      )}

      <div
        className={`fixed top-0 right-0 w-80 h-full bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ zIndex: 1000 }}
      >
        <div className="p-4 h-full flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">
              Cart ({cartCount()} Items)
            </h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Close cart"
            >
              <FiX size={24} />
            </button>
          </div>

          <div className="flex border-b mb-4">
            <button
              className={`flex-1 py-2 text-sm font-medium ${
                activeTab === 'e-store' ? 'text-green-500 border-b-2 border-green-500' : 'text-gray-500'
              }`}
              onClick={() => setActiveTab('e-store')}
            >
              e-Store ({cartCount('e-store')})
            </button>
            <button
              className={`flex-1 py-2 text-sm font-medium ${
                activeTab === 'e-fresh' ? 'text-green-500 border-b-2 border-green-500' : 'text-gray-500'
              }`}
              onClick={() => setActiveTab('e-fresh')}
            >
              e-Fresh ({cartCount('e-fresh')})
            </button>
            <button
              className={`flex-1 py-2 text-sm font-medium ${
                activeTab === 'e-meds' ? 'text-green-500 border-b-2 border-green-500' : 'text-gray-500'
              }`}
              onClick={() => setActiveTab('e-meds')}
            >
              e-Meds ({cartCount('e-meds')})
            </button>
          </div>

          <div className="flex-grow overflow-y-auto">
            {renderCartItems(activeTab)}
          </div>

          {renderCartSummary(activeTab)}
        </div>
      </div>
    </>
  );
};

export default CartPage;

import React, { useState, useEffect } from "react";
import ebookingIcon from "../assets/images/e-booking.png";
import shopIcon from "../assets/images/shop.png";
import estoreLogo from "../assets/images/Logowith.png";
import { FaPhoneAlt } from "react-icons/fa";
import twoArrow from "../assets/images/twoArrow.png";
import Navbar from "./Header";
import { counterService } from "../services/counterService";
import { toast } from "react-toastify";

const Locate = () => {
  const [activeFilter, setActiveFilter] = useState("booking");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCounter, setSelectedCounter] = useState(null);
  const [pincodeFilter, setPincodeFilter] = useState("");

  // update isMobile on resize
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch counters from API
  useEffect(() => {
    const fetchCounters = async () => {
      try {
        setLoading(true);
        const counters = await counterService.getAllCounters();
        
        // Format counters for display
        const formattedStores = counters.map((counter) => ({
          _id: counter._id,
          type: counter.counterName,
          agent: counter.agentName,
          role: "Agent",
          address: counter.address,
          landmark: counter.landMark,
          pincode: counter.pinCode,
          phone: counter.agentNumber,
          locationDirection: counter.location_direction,
          storeType: counterService.getStoreType(counter),
          buttonText: counterService.getStoreType(counter) === "store" ? "Call Store" : "Call Agent",
        }));

        setStores(formattedStores);
        
        // Get selected counter from localStorage
        const savedCounter = counterService.getSelectedCounter();
        if (savedCounter) {
          setSelectedCounter(savedCounter);
        }
      } catch (error) {
        console.error("Error fetching counters:", error);
        toast.error("Failed to load stores. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchCounters();
  }, []);

  const handleFilterClick = (filter) => {
    setActiveFilter(filter);
  };

  const handleSelectCounter = async (store) => {
    try {
      // Check if clicking on already selected store (unselect)
      if (selectedCounter && selectedCounter._id === store._id) {
        // Unselect the store
        counterService.clearSelectedCounter();
        setSelectedCounter(null);
        toast.info(`Unselected: ${store.type}`);
      } else {
        // Select the store
        await counterService.setSelectedCounter(store);
        setSelectedCounter(store);
        toast.success(`Selected: ${store.type}`);
      }
    } catch (error) {
      console.error('Error selecting counter:', error);
      toast.error('Failed to save counter selection');
    }
  };

  const handleCallAgent = (phone) => {
    if (phone) {
      window.location.href = `tel:${phone}`;
    }
  };

  const handleGetDirections = (address, landmark, pincode) => {
    const query = encodeURIComponent(`${address}, ${landmark}, ${pincode}`);
    const url = `https://www.google.com/maps/search/?api=1&query=${query}`;
    window.open(url, "_blank");
  };

  // Filter stores by store type (mobile) and pincode
  const filteredStores = stores.filter((store) => {
    const matchesType = isMobile ? store.storeType === activeFilter : true;
    const matchesPincode = pincodeFilter
      ? store.pincode?.includes(pincodeFilter)
      : true;
    return matchesType && matchesPincode;
  });

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="w-full max-w-4xl mx-auto px-4 py-6 flex justify-center items-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading stores...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <div className="w-full max-w-6xl mx-auto px-4 py-6 flex flex-col">
        {/* Location Filter Section */}
        <div className="mb-6 bg-white rounded-lg shadow-md p-4">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="flex items-center gap-2 flex-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <input
                type="text"
                placeholder="Enter pincode to find stores..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                value={pincodeFilter}
                onChange={(e) => setPincodeFilter(e.target.value)}
              />
            </div>
            <button
              onClick={() => setPincodeFilter('')}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              Clear Filter
            </button>
          </div>
          
          {pincodeFilter && (
            <div className="mt-3 text-sm text-gray-600">
              Showing stores for pincode: <span className="font-semibold text-orange-600">{pincodeFilter}</span>
              {filteredStores.length === 0 && (
                <span className="ml-2 text-red-600">- No stores found</span>
              )}
            </div>
          )}
        </div>

        {/* Header Section */}
        <div className="mb-6 w-full">
          {/* mobile toggles */}
          <div className="flex md:hidden justify-center space-x-8">
            <button
              onClick={() => handleFilterClick("booking")}
              className="flex flex-col items-center"
            >
              <img
                src={ebookingIcon}
                alt="e-booking"
                className="w-16 mb-2"
              />
              <span className="text-orange-600 font-semibold text-sm text-center">
                e-booking<br/>Counter
              </span>
            </button>

            <button
              onClick={() => handleFilterClick("store")}
              className="flex flex-col items-center"
            >
              <img src={shopIcon} alt="shop" className="w-16 mb-2" />
              <img
                src={estoreLogo}
                alt="logo"
                className="w-28 h-8"
              />
            </button>
          </div>

          {/* desktop header */}
          <div className="hidden md:flex items-center justify-between w-full">
            <div className="flex items-center ml-28">
              <img
                src={ebookingIcon}
                alt="e-booking"
                className="w-16 mr-2"
              />
              <h1 className="text-orange-600 font-semibold text-lg text-center">
                e-booking<br/>Counter
              </h1>
            </div>

            <div className="flex items-center mr-24">
              <img src={shopIcon} alt="shop" className="w-16 mr-2" />
              <img
                src={estoreLogo}
                alt="logo"
                className="w-28 h-auto"
              />
            </div>
          </div>
        </div>

        {/* Store Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
          {filteredStores.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-600 text-lg">No stores found in your area.</p>
              <p className="text-gray-500 text-sm mt-2">Please try a different location or contact support.</p>
            </div>
          ) : (
            filteredStores.map((store, index) => (
              <div
                key={store._id || index}
                className={`bg-[#e2f2c3] border-2 rounded-lg p-4 shadow-md flex flex-col justify-between h-full transition-all ${
                  selectedCounter?._id === store._id
                    ? "border-green-600 shadow-lg"
                    : "border-green-300 hover:border-green-400"
                }`}
              >
                {/* Icon + Title + Select */}
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center">
                    <div className="bg-white p-2 rounded-lg shadow-md flex items-center justify-center">
                      <img
                        src={
                          store.storeType === "booking" ? ebookingIcon : shopIcon
                        }
                        alt={store.storeType}
                        className="w-8 h-10"
                      />
                    </div>
                    <h3 className="font-semibold text-gray-700 ml-3">
                      {store.type}
                    </h3>
                  </div>
                  {selectedCounter?._id === store._id && (
                    <div className="bg-green-600 text-white text-xs px-2 py-1 rounded-full">
                      Selected
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="mb-3">
                  <p className="text-sm text-gray-700">
                    <strong>{store.role}:</strong> {store.agent}
                  </p>
                  <p className="text-sm text-gray-700">
                    Address : {store.address}
                  </p>
                  <p className="text-sm text-gray-700">
                    Landmark : {store.landmark}
                  </p>
                  {store.pincode && (
                    <p className="text-sm text-gray-700">
                      Pincode : {store.pincode}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="space-y-2">
                  <div className="flex justify-between gap-2">
                    <button 
                      onClick={() => handleGetDirections(store.address, store.landmark, store.pincode)}
                      className="flex items-center bg-white border border-green-500 text-green-600 px-4 py-2 rounded-md text-sm shadow-md hover:bg-green-50 transition-colors flex-1"
                    >
                      <img src={twoArrow} className="w-4 h-4 mr-2" alt="Directions" />
                      Directions
                    </button>
                    <button 
                      onClick={() => handleCallAgent(store.phone)}
                      className="flex items-center bg-green-600 text-white px-4 py-2 rounded-md text-sm shadow-md hover:bg-green-700 transition-colors flex-1"
                    >
                      <FaPhoneAlt className="mr-2 h-4 w-4" />
                      {store.buttonText}
                    </button>
                  </div>
                  
                  <button
                    onClick={() => handleSelectCounter(store)}
                    className={`w-full py-2 rounded-md text-sm font-semibold shadow-md transition-colors ${
                      selectedCounter?._id === store._id
                        ? 'bg-red-500 text-white hover:bg-red-600'
                        : 'bg-orange-500 text-white hover:bg-orange-600'
                    }`}
                  >
                    {selectedCounter?._id === store._id ? 'Unselect Store' : 'Select this Store'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default Locate;

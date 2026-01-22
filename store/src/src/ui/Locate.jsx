import React, { useState, useEffect } from "react";
import ebookingIcon from "../assets/images/e-booking.png";
import shopIcon from "../assets/images/shop.png";
import estoreLogo from "../assets/images/Logowith.png";
import { FaPhoneAlt } from "react-icons/fa";
import twoArrow from "../assets/images/twoArrow.png";
import Navbar from "./Header";

const Locate = () => {
  const [activeFilter, setActiveFilter] = useState("booking");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // update isMobile on resize
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleFilterClick = (filter) => {
    setActiveFilter(filter);
  };

  const stores = [
    {
      type: "Farm Fresh Agros",
      agent: "Rajagopal Naidu",
      role: "Agent",
      address: "6-237-G-8 BRR Colony",
      landmark: "Malik Function Hall",
      pincode: "517325",
      storeType: "booking",
      buttonText: "Call Agent",
    },
    {
      type: "Farm E-Store Private Limited",
      agent: "L.Kamal Chowdary",
      role: "Employee",
      address: "6-237-G-8-X BRR Colony",
      landmark: "OPP.Malik Function Hall",
      pincode: "",
      storeType: "store",
      buttonText: "Call Store",
    },
    {
      type: "Kisan Agro Services",
      agent: "Sravanth Peravali",
      role: "Agent",
      address: "9-101 Kamma Street",
      landmark: "OPP.KVB Bank",
      pincode: "517325",
      storeType: "booking",
      buttonText: "Call Agent",
    },
    {
      type: "Farm E-Store Private Limited",
      agent: "J.Poojith Chowdary",
      role: "Employee",
      address: "1-143 Kadiri Road",
      landmark: "Chicken Affair",
      pincode: "",
      storeType: "store",
      buttonText: "Call Store",
    },
  ];

  const filteredStores = stores.filter((store) =>
    isMobile ? store.storeType === activeFilter : true
  );

  return (
    <>
      <Navbar />

      <div className="w-full max-w-4xl mx-auto px-4 py-6 flex flex-col">
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
          {filteredStores.map((store, index) => (
            <div
              key={index}
              className="bg-[#e2f2c3] border border-green-300 rounded-lg p-4 shadow-md flex flex-col justify-between h-full"
            >
              {/* Icon + Title */}
              <div className="flex items-center mb-1">
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

              {/* Details */}
              <div>
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
              <div className="flex justify-between">
                <button className="flex items-center bg-white border border-green-500 text-green-600 px-4 py-2 rounded-md text-sm shadow-md">
                  <img src={twoArrow} className="w-4 h-4 mr-2" alt="Directions" />
                  Directions
                </button>
                <button className="flex items-center bg-green-600 text-white px-4 py-2 rounded-md text-sm shadow-md">
                  <FaPhoneAlt className="mr-2 h-4 w-4" />
                  {store.buttonText}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Locate;

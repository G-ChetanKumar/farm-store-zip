import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import BASE_URL from "../Helper/Helper";
import leftChevronIcon from "../assets/images/leftArrows.png"; // Add your left-chevron icon path
import rightChevronIcon from "../assets/images/rightArrows.png"; // Add your right-chevron icon path

const CropsSection = () => {
  const [crops, setCrops] = useState([]);
  const [isPaused, setIsPaused] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false); // Error state
  const scrollRef = useRef();

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -300, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 300, behavior: "smooth" });
    }
  };

  // Check if viewport is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Fetch crops data from the API and sort alphabetically
  useEffect(() => {
    const fetchCrops = async () => {
      try {
        setLoading(true);
        setError(false); // Reset error state
        const response = await fetch(`${BASE_URL}/crop/get-crops`);
        if (!response.ok) {
          throw new Error("Failed to fetch crops");
        }
        const data = await response.json();
  
        // Filter out crops named "e-fresh" and sort alphabetically by title
        const sortedCrops = data
          .filter((crop) => crop.title.toLowerCase() !== "e-fresh")
          .sort((a, b) => a.title.localeCompare(b.title));
  
        setCrops(sortedCrops);
      } catch (error) {
        console.error("Error fetching crops:", error);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
  
    fetchCrops();
  }, []);
  

  const handleRetry = () => {
    setError(false); // Reset error state
    setLoading(true); // Trigger re-fetch
    // Re-trigger fetch logic
    const fetchCrops = async () => {
      try {
        const response = await fetch(`${BASE_URL}/crop/get-crops`);
        if (!response.ok) {
          throw new Error("Failed to fetch crops");
        }
        const data = await response.json();
        const sortedCrops = data.sort((a, b) => a.title.localeCompare(b.title));
        setCrops(sortedCrops);
      } catch (error) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchCrops();
  };

  return (
    <div className="bg-gray-100">
      <div className="px-2">
        <div className="flex justify-between items-center mb-1">
          <h2 className="text-lg sm:text-2xl font-semibold text-gray-800">
            Shop By Crops
          </h2>
          <div className="flex items-center space-x-1">
            <a
              href="/all-crops"
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

        {/* Loading, Error, or Data */}
        {loading ? (
          // Show spinner loader while data is being fetched
          <div className="flex justify-center items-center min-h-[200px]">
            <div className="loader-spinner"></div>&nbsp;
            <p className="text-gray-500 text-sm font-medium">
              Loading crops...
            </p>
          </div>
        ) : error ? (
          // Show error message with retry button
          <div className="flex flex-col items-center min-h-[200px] text-center">
            <p className="text-red-500 text-md font-medium">
              Unable to fetch crops. Please check your internet connection.
            </p>
            <button
              onClick={handleRetry}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md shadow hover:bg-blue-600"
            >
              Retry
            </button>
          </div>
        ) : (
          <>
            {/* Mobile View: Show only 2 cards */}
            {isMobile ? (
              <div className="grid grid-cols-3 gap-2">
                {crops.slice(0, 3).map((crop) => (
                  <Link
                    key={crop._id}
                    to={`/products/crop/${crop._id}?brandName=${encodeURIComponent(crop.title)}`}
                    className="bg-white rounded-lg w-28 h-28 border border-gray-200 p-6 flex flex-col items-center justify-center"
                  >
                    <img
                      src={crop.imageUrl}
                      alt={crop.title}
                      className="w-full h-24 object-contain mb-2"
                    />
                    <p className="text-sm font-medium text-gray-700 text-center mt-2">
                      {crop.title}
                    </p>
                  </Link>
                ))}
              </div>
            ) : (
              // Laptop/Desktop View: Horizontal Auto-Scroller
              <div className="relative overflow-hidden">
                <div
                  className="flex space-x-4 overflow-x-auto scrollbar-hide"
                  ref={scrollRef}
                >
                  {crops.map((crop, index) => (
                    <Link
                      key={`${crop._id}-${index}`}
                      to={`/products/crop/${crop._id}?brandName=${encodeURIComponent(crop.title)}`}
                      className="flex-shrink-0 w-32 h-32 bg-white rounded-lg border border-gray-200 p-6 flex flex-col items-center justify-center"
                    >
                      <img
                        src={crop.imageUrl}
                        alt={crop.title}
                        className="w-full h-full object-contain mb-2"
                      />
                      <p className="text-sm font-medium text-gray-700 text-center mt-2">
                        {crop.title}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <style jsx>{`
        /* Spinner Loader */
        .loader-spinner {
          border: 4px solid rgba(0, 0, 0, 0.1);
          border-top: 4px solid #4a90e2;
          border-radius: 50%;
          width: 36px;
          height: 36px;
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

        /* Hide scrollbar for the horizontal container */
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none; /* IE and Edge */
          scrollbar-width: none; /* Firefox */
        }
      `}</style>
    </div>
  );
};

export default CropsSection;

import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import BASE_URL from "../Helper/Helper";
import leftChevronIcon from "../assets/images/leftArrows.png"; // Add your left-chevron icon path
import rightChevronIcon from "../assets/images/rightArrows.png"; // Add your right-chevron icon path

const BrandSection = () => {
  const [brands, setBrands] = useState([]);
  const [isMobile, setIsMobile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
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

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        setLoading(true);
        setError(false);
        const response = await axios.get(`${BASE_URL}/brand/get-brand`);
        const sortedBrands = response.data
          .filter((brand) => brand.title.toLowerCase() !== "e-fresh")
          .sort((a, b) => a.title.localeCompare(b.title));

        setBrands(sortedBrands);
      } catch (error) {
        console.error("Error fetching brands:", error);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchBrands();
  }, []);

  const handleRetry = () => {
    setError(false);
    setLoading(true);
    fetchBrands();
  };

  return (
    <div className="bg-gray-100">
      <div className="px-2">
        <div className="flex justify-between items-center mb-1">
          <h2 className="text-lg sm:text-2xl font-semibold text-gray-800">
            Shop By Brands
          </h2>
          <div className="flex items-center space-x-1">
            <a
              href="/all-brands"
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

        {loading ? (
          <div className="flex justify-center items-center min-h-[200px]">
            <div className="loader-spinner"></div>&nbsp;
            <p className="text-gray-500 text-sm font-medium">
              Loading brands...
            </p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center min-h-[200px] text-center">
            <p className="text-red-500 text-md font-medium">
              Unable to fetch brands. Please check your internet connection.
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
            {isMobile ? (
              <div className="grid grid-cols-3 gap-2">
                {brands.slice(0, 3).map((brand) => (
                  <Link
                    key={brand._id}
                    to={`/products/brand/${
                      brand._id
                    }?brandName=${encodeURIComponent(brand.title)}`}
                    className="flex-shrink-0 w-28 h-28 bg-white rounded-lg border border-gray-200 p-4 flex flex-col items-center justify-center"
                  >
                    <img
                      src={brand.imageUrl}
                      alt={brand.title}
                      className="w-full h-full object-contain mb-2"
                    />
                    <p className="text-xs font-medium text-gray-700 text-center mt-2">
                      {brand.title}
                    </p>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="relative overflow-hidden">
                <div
                  className="flex space-x-4 overflow-x-auto scrollbar-hide"
                  ref={scrollRef}
                >
                  {brands.map((brand) => (
                    <Link
                      key={brand._id}
                      to={`/products/brand/${
                        brand._id
                      }?brandName=${encodeURIComponent(brand.title)}`}
                      className="flex-shrink-0 w-32 h-32 bg-white rounded-lg border border-gray-200 p-6 flex flex-col items-center justify-center"
                    >
                      <img
                        src={brand.imageUrl}
                        alt={brand.title}
                        className="w-full h-full object-contain mb-2"
                      />
                      <p className="text-sm font-medium text-gray-700 text-center mt-2">
                        {brand.title}
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

export default BrandSection;

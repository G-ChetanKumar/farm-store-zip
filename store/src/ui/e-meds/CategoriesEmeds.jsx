import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Title from "./../Title";
import BASE_URL from "../../Helper/Helper";

const CategoriesEmeds = () => {
  const [categories, setCategories] = useState([]);
  const [eStoreId, setEStoreId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Fetch e-store supercategory ID
  useEffect(() => {
    const fetchEStoreId = async () => {
      try {
        const response = await fetch(`${BASE_URL}/super-category/get-super-category`);
        const data = await response.json();
        const eStoreCategory = data.find(cat => cat.title === "e-meds");
        if (eStoreCategory) {
          setEStoreId(eStoreCategory._id);
        }
      } catch (error) {
        console.error("Error fetching super categories:", error);
      }
    };
    fetchEStoreId();
  }, []);

  // Fetch and filter subcategories based on the e-store supercategory
  useEffect(() => {
    if (!eStoreId) return;

    const fetchData = async () => {
      const endpoint = `${BASE_URL}/subcategory/get-sub-category`;
      try {
        setLoading(true);
        setError(false);
        const response = await fetch(endpoint);
        if (!response.ok) {
          throw new Error("Failed to fetch subcategories");
        }
        const data = await response.json();
        const filteredSubcategories = data.filter(
          subcategory => subcategory.super_cat_id === eStoreId
        );
        setCategories(filteredSubcategories);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [eStoreId]);

  // Handle viewport resizing
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleRetry = () => {
    setError(false);
    setLoading(true);
  };

  const displayedCategories = isMobile ? categories.slice(0, 9) : categories;

  return (
    <div className="w-full border border-gray-300 box-border rounded-md relative bg-white">
      <div className="flex justify-center items-center relative mt-2">
        <Title
          text="Shop By Categories"
          className="text-lg md:text-xl underline"
        />
        <Link
          to="/e-medsCategories"
          className="absolute right-2 text-sm md:text-base font-semibold text-gray-500 underline"
        >
          View All
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center items-center min-h-[200px]">
          <p className="text-lg font-medium">Loading categories...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center min-h-[200px] text-center">
          <p className="text-red-500 text-md font-medium">
            Unable to fetch categories. Please check your internet connection.
          </p>
          <button
            onClick={handleRetry}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md shadow hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      ) : categories.length === 0 ? (
        <div className="flex justify-center items-center min-h-[200px]">
          <p className="text-gray-500 text-md font-medium">
            No categories available.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-3 md:grid-cols-8 gap-3 p-1">
          {displayedCategories.map((item) => (
            <Link
              to={`/medcategory/${item.category_id}/subcategory/${item._id}/products?brandName=${encodeURIComponent(item.title)}`}
              key={item._id}
              className="flex flex-col items-center text-center"
            >
              <div className="w-28 h-28 bg-gray-200 overflow-hidden rounded-md">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="mt-2 text-sm font-medium text-gray-700 w-28 truncate">
                {item.title}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoriesEmeds;

import React, { useEffect, useState } from "react";
import { getData } from "../../lib/index";
import { Link } from "react-router-dom";
import BASE_URL from "../../Helper/Helper";
// import Navbar from "./../Header";
import EmedsHeader from "./EmedsHeader";

const AllEmedsCategories = () => {
  const [categories, setCategories] = useState([]);
  const [eStoreId, setEStoreId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch e-store supercategory ID
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
        console.error("Error fetching super categories:", error);
        setError("Failed to load e-store supercategory");
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
        const data = await getData(endpoint);
        const filteredSubcategories = data.filter(
          (subcategory) => subcategory.super_cat_id === eStoreId
        );

        // Reorder categories if "Combo Offers" exists
        const reorderedCategories = reorderCategories(filteredSubcategories);
        setCategories(reorderedCategories);
      } catch (error) {
        console.error("Error fetching data", error);
        setError("Failed to load categories");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [eStoreId]);

  const reorderCategories = (data) => {
    const comboOfferCategory = data.find((item) =>
      item.title.trim().toLowerCase().startsWith("combo offers")
    );
    if (comboOfferCategory) {
      const filteredCategories = data.filter(
        (item) => item._id !== comboOfferCategory._id
      );
      return [comboOfferCategory, ...filteredCategories];
    }
    return data;
  };

  return (
    <>
      <EmedsHeader />
      <div className="p-5">
        <h2 className="text-xl font-bold mb-4">All Categories</h2>
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : categories.length === 0 ? (
          <p>No categories available for e-store.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
            {categories.map((item) => (
              <Link
                to={`/category/${item.category_id}/subcategory/${item._id}/products`}
                key={item._id}
                className="flex flex-col items-center text-center border rounded-lg p-4 hover:shadow-lg transition-shadow"
              >
                <div className="w-24 h-24 bg-gray-200 overflow-hidden mb-2">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-md font-semibold">{item.title}</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default AllEmedsCategories;

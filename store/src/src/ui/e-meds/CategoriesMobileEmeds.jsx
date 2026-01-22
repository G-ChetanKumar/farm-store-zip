import React, { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, X } from "lucide-react";
import { Link } from "react-router-dom";
import BASE_URL from "../../Helper/Helper";

const CategoriesMobileEmeds = ({
  categories,
  subCategories,
  activeCategory,
  setActiveCategory,
  onClose,
}) => {
  const [eStoreId, setEStoreId] = useState(null);
  const [filteredCategories, setFilteredCategories] = useState([]);

  // Fetch e-store super category ID
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
      }
    };
    fetchEStoreId();
  }, []);

  // Filter categories based on e-store super category
  useEffect(() => {
    if (eStoreId) {
      const filtered = categories.filter(
        (category) => category.super_cat_id === eStoreId
      );
      setFilteredCategories(filtered);
    }
  }, [eStoreId, categories]);

  // Helper function to get filtered subcategories
  const getFilteredSubCategories = (categoryId) => {
    return subCategories.filter(
      (sub) => sub.category_id === categoryId && sub.super_cat_id === eStoreId
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black bg-opacity-60"
      onClick={onClose}
    >
      <div
        className="fixed inset-y-0 left-0 w-80 bg-white shadow-lg border border-green-300 rounded-l-xl transition-all transform ease-in-out duration-300 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-300">
          <h2 className="text-lg font-semibold text-gray-800">Categories</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto transition-all duration-300">
          <div className="p-4 space-y-3">
            {filteredCategories.map((category) => {
              const filteredSubCategories = getFilteredSubCategories(category._id);
              const hasSubcategories = filteredSubCategories.length > 0;
              
              return (
                <div
                  key={category._id}
                  className="border-b border-gray-200 last:border-0 transition-all duration-300"
                >
                  <div className="flex items-center justify-between py-1 hover:bg-gray-50 rounded-md transition-all duration-200">
                    <Link
                      to="#"
                      className="text-sm text-gray-700 hover:text-gray-900 font-medium"
                      onClick={() => !hasSubcategories && onClose()}
                    >
                      {category.title}
                    </Link>

                    {hasSubcategories && (
                      <button
                        onClick={() =>
                          setActiveCategory(
                            activeCategory === category._id ? null : category._id
                          )
                        }
                        className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                      >
                        {activeCategory === category._id ? (
                          <ChevronUp className="w-5 h-5 text-gray-600" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-600" />
                        )}
                      </button>
                    )}
                  </div>
                  {hasSubcategories && activeCategory === category._id && (
                    <div className="ml-4 pb-2">
                      <ul className="space-y-1">
                        {filteredSubCategories.map((sub) => (
                          <li key={sub._id}>
                            <Link
                              to={`/medcategory/${category._id}/subcategory/${sub._id}/products?brandName=${encodeURIComponent(sub.title)}`}
                              className="block py-2 px-3 text-sm text-green-600 hover:bg-gray-100 rounded-md transition-all duration-200"
                              onClick={onClose}
                            >
                              {sub.title}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoriesMobileEmeds;

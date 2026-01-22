import React, { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import ChevronLeftImg from "../../assets/images/left.png";
import ChevronRightImg from "../../assets/images/right.png";
import { ChevronDown } from "lucide-react";
import BASE_URL from "../../Helper/Helper";

const CategoriesLaptopEfresh = ({ categories, subCategories }) => {
  const scrollContainerRef = useRef(null);
  const [activeCategory, setActiveCategory] = useState(null);
  const [dropdownPosition, setDropdownPosition] = useState({ left: 0, top: 0 });
  const [eStoreId, setEStoreId] = useState(null);
  const [filteredCategories, setFilteredCategories] = useState([]);

  // Fetch e-store super category ID
  useEffect(() => {
    const fetchEStoreId = async () => {
      try {
        const response = await fetch(
          `${BASE_URL}/super-category/get-super-category`
        );

        // const response = await fetch(`${BASE_URL}/super-category/get-super-category`);
        const data = await response.json();
        const eStoreCategory = data.find((cat) => cat.title === "e-fresh");
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

  const scroll = (direction) => {
    const container = scrollContainerRef.current;
    const scrollAmount = direction === "left" ? -200 : 200;
    container.scrollBy({ left: scrollAmount, behavior: "smooth" });
  };

  const handleCategoryMouseEnter = (e, categoryId) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setDropdownPosition({
      left: rect.left,
      top: rect.bottom,
    });
    setActiveCategory(categoryId);
  };

  const handleCategoryMouseLeave = (e) => {
    const relatedTarget = e.relatedTarget;
    const dropdown = document.getElementById("category-dropdown");
    if (
      dropdown &&
      (dropdown === relatedTarget || dropdown.contains(relatedTarget))
    ) {
      return;
    }
    setActiveCategory(null);
  };

  const handleDropdownMouseLeave = (e) => {
    const relatedTarget = e.relatedTarget;
    const categoryElements = document.querySelectorAll(".category-item");
    const isMovingToCategory = Array.from(categoryElements).some(
      (elem) => elem === relatedTarget || elem.contains(relatedTarget)
    );

    if (!isMovingToCategory) {
      setActiveCategory(null);
    }
  };

  const getFilteredSubCategories = (categoryId) => {
    return subCategories.filter(
      (sub) => sub.category_id === categoryId && sub.super_cat_id === eStoreId
    );
  };

  return (
    <div className="relative overflow-hidden">
      <button
        onClick={() => scroll("left")}
        className="absolute left-1.5 top-1/2 -translate-y-1/2 bg-white z-10 rounded-full"
      >
        <img src={ChevronLeftImg} alt="Chevron Left" className="w-8 h-8" />
      </button>

      <div
        ref={scrollContainerRef}
        className="flex overflow-x-auto scrollbar-hide space-x-6 py-2 px-8 text-gray-600 mx-1 font-semibold text-sm border rounded-md border-green-500"
      >
        {filteredCategories.map((category) => {
          const subCategoriesForCategory = getFilteredSubCategories(
            category._id
          );
          const hasSubcategories = subCategoriesForCategory.length > 0;
          const isActive = category._id === activeCategory;

          return (
            <div
              key={category._id}
              data-category={category._id}
              className={`category-item relative whitespace-nowrap transition duration-200 ${
                isActive ? "bg-green-200" : "hover:bg-green-200"
              }`}
              onMouseEnter={(e) => handleCategoryMouseEnter(e, category._id)}
              onMouseLeave={handleCategoryMouseLeave}
            >
              <div className="flex items-center space-x-1">
                <Link
                  to="#"
                  className="hover:text-gray-800 py-2 transition duration-200"
                >
                  {category.title}
                </Link>
                {hasSubcategories && (
                  <ChevronDown className="w-4 h-4 text-gray-600" />
                )}
              </div>
            </div>
          );
        })}
      </div>

      <button
        onClick={() => scroll("right")}
        className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-white z-10 rounded-full"
      >
        <img src={ChevronRightImg} alt="Chevron Right" className="w-8 h-8" />
      </button>

      {/* Dropdown */}
      {activeCategory && (
        <div
          id="category-dropdown"
          className="fixed bg-white shadow-lg rounded-md p-2 min-w-[200px] z-50"
          style={{
            left: `${dropdownPosition.left}px`,
            top: `${dropdownPosition.top}px`,
            marginTop: "1px",
          }}
          onMouseLeave={handleDropdownMouseLeave}
        >
          <ul>
            {getFilteredSubCategories(activeCategory).map((sub) => (
              <li
                key={sub._id}
                className="py-1 px-2 text-sm hover:bg-gray-300 transition duration-200"
              >
                <Link
                  to={`/categories/${activeCategory}/subcategory/${sub._id}/products?brandName=${encodeURIComponent(sub.title)}`}
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
};

export default CategoriesLaptopEfresh;

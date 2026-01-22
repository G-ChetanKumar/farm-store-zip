import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getData } from "../lib/index";
import { FaHome, FaChevronRight } from "react-icons/fa";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import block from "../assets/block.png";
import BASE_URL from "../Helper/Helper";

const Breadcrumb = ({ categoryTitle }) => (
  <nav className="bg-white p-4 rounded-lg shadow-md mb-4">
    <ol className="flex flex-wrap items-center text-sm">
      <li className="flex items-center">
        <Link to="/" className="text-gray-600 hover:text-orange-500 flex items-center">
          <FaHome className="mr-1" />
          Home
        </Link>
      </li>
      <li className="flex items-center mx-2">
        <FaChevronRight className="text-gray-400" size={12} />
      </li>
      <li className="flex items-center">
        <Link to="/categories" className="text-gray-600 hover:text-orange-500">
          Categories
        </Link>
      </li>
      <li className="flex items-center mx-2">
        <FaChevronRight className="text-gray-400" size={12} />
      </li>
      <li className="text-orange-500 truncate">
        {categoryTitle || <Skeleton width={100} />}
      </li>
    </ol>
  </nav>
);

const SubCategory = () => {
  const { categoryId } = useParams();
  const [subcategories, setSubcategories] = useState([]);
  const [categoryTitle, setCategoryTitle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const subcategoryEndpoint =
          `${BASE_URL}/subcategory/get-sub-category`;
        const subcategoriesData = await getData(subcategoryEndpoint);
        const filteredSubcategories = subcategoriesData.filter(
          (subcategory) => subcategory.category_id === categoryId
        );
        setSubcategories(filteredSubcategories);

        const categoryEndpoint =
          `${BASE_URL}/category/get-category`;
        const categories = await getData(categoryEndpoint);
        const category = categories.find((cat) => cat._id === categoryId);
        if (category) {
          setCategoryTitle(category.title);
        }
      } catch (error) {
        console.error("Error fetching subcategories", error);
        setError("Failed to load subcategories. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [categoryId]);

  return (
    <div className="p-5">
      <div className="bg-gradient-to-r from-orange-500 to-yellow-500 py-8 px-4 rounded-lg shadow-md mb-4">
        <center>
          <h2 className="text-2xl font-bold text-white">
            {categoryTitle ? `${categoryTitle} Subcategories` : <Skeleton width={200} />}
          </h2>
        </center>
      </div>
      <Breadcrumb categoryTitle={categoryTitle} />
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="flex flex-col items-center bg-white border border-gray-200 rounded-lg shadow-md p-4"
            >
              <Skeleton circle={true} height={128} width={128} />
              <Skeleton width={100} height={20} className="mt-2" />
            </div>
          ))}
        </div>
      ) : error ? (
        <p className="text-red-500 text-center">{error}</p>
      ) : subcategories.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {subcategories.map((subcategory) => (
            <Link
              key={subcategory._id}
              to={`/category/${categoryId}/subcategory/${subcategory._id}/products`}
              className="flex flex-col items-center bg-white border border-gray-200 rounded-lg shadow-md p-4 transition-transform transform hover:scale-105"
            >
              <img
                src={subcategory.imageUrl}
                alt={subcategory.title}
                className="w-32 h-32 object-cover rounded-full mb-2"
              />
              <h3 className="text-lg font-semibold text-center">{subcategory.title}</h3>
            </Link>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-center border border-gray-200 bg-white rounded-lg p-6 shadow-md">
          <h3 className="text-2xl font-semibold text-gray-700 mb-2">
            No Subcategories Found
          </h3>
          <p className="text-gray-500 mb-4">
            There are currently no subcategories available for this category. Please check
            back later for updates.
          </p>
          <img src={block} alt="No data" className="w-40 h-40" />
        </div>
      )}
    </div>
  );
};

export default SubCategory;

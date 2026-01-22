import React, {
  createContext,
  useState,
  useContext,
  useCallback,
  useEffect,
} from "react";
import BASE_URL from "../Helper/Helper";

const SearchContext = createContext();

export const useSearch = () => {
  return useContext(SearchContext);
};

export const EfreshSearch = ({ children }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [eStoreId, setEStoreId] = useState(null);

  // Fetch the e-store super category ID on mount
  useEffect(() => {
    const fetchEStoreId = async () => {
      try {
        const response = await fetch(
          `${BASE_URL}/super-category/get-super-category`
        );
        const data = await response.json();
        const eStoreCategory = data.find(
          (cat) => cat.title.toLowerCase() === "e-fresh"
        );
        if (eStoreCategory) {
          setEStoreId(eStoreCategory._id);
        }
      } catch (error) {
        console.error("Error fetching super categories:", error);
      }
    };
    fetchEStoreId();
  }, []);

  // Modified handleSearch to filter only e-store products
  const handleSearch = useCallback(
    async (term) => {
      setSearchTerm(term);
      if (term.trim() && eStoreId) {
        try {
          const response = await fetch(
            `${BASE_URL}/product/get-product?search=${term}`
          );
          const data = await response.json();
          // Filter products that match the search term AND have the e-store super_cat_id
          const filteredResults = data.filter(
            (product) =>
              (product.title.toLowerCase().includes(term.toLowerCase()) ||
                (product.sub_title &&
                  product.sub_title
                    .toLowerCase()
                    .includes(term.toLowerCase()))) &&
              product.super_cat_id === eStoreId
          );
          setSearchResults(filteredResults);
        } catch (error) {
          console.error("Error fetching products:", error);
        }
      } else {
        setSearchResults([]);
      }
    },
    [eStoreId]
  );

  return (
    <SearchContext.Provider value={{ searchTerm, searchResults, handleSearch }}>
      {children}
    </SearchContext.Provider>
  );
};

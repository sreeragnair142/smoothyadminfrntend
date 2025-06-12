import React, { useState, useEffect } from 'react';
import { Category, ProductPage } from '../types/index'; // Ensure both types are imported

const API_BASE_URL = 'http://localhost:5000/api';

const ProductDropdown: React.FC = () => {
  const [productPages, setProductPages] = useState<ProductPage[]>([]);
  const [selectedProductPage, setSelectedProductPage] = useState<string>('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);

  // Fetch all unique product pages
  const fetchProductPages = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/product-pages`);
      if (!response.ok) {
        throw new Error('Failed to fetch product pages');
      }
      const data: ProductPage[] = await response.json();
      setProductPages(data);
    } catch (err) {
      console.error('Failed to fetch product pages:', err);
    }
  };

  // Fetch categories for the selected product page
  const fetchCategoriesForProductPage = async (productPageUrl: string) => {
    if (!productPageUrl) {
      setCategories([]);
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/categories?productPageUrl=${encodeURIComponent(productPageUrl)}`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      const data: Category[] = await response.json();
      setCategories(data);
    } catch (err) {
      console.error('Failed to fetch categories for product page:', err);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductPages();
  }, []);

  useEffect(() => {
    fetchCategoriesForProductPage(selectedProductPage);
  }, [selectedProductPage]);

  const handleMouseEnter = () => {
    setIsDropdownOpen(true);
  };

  const handleMouseLeave = () => {
    setIsDropdownOpen(false);
    setSelectedProductPage(''); // Reset selection when closing
  };

  const handleProductPageSelect = (url: string) => {
    setSelectedProductPage(url);
  };

  return (
    <div
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button className="text-gray-700 hover:text-gray-900">
        Our Products
      </button>
      {isDropdownOpen && (
        <div className="absolute mt-2 w-48 bg-white shadow-lg rounded-md py-2 z-10">
          {productPages.length > 0 ? (
            productPages.map((page, index) => (
              <div key={index} className="relative group">
                <button
                  onClick={() => handleProductPageSelect(page.url)}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  {page.name}
                </button>
                {selectedProductPage === page.url && (
                  <div className="absolute left-full top-0 mt-0 ml-2 w-48 bg-white shadow-lg rounded-md py-2 z-20">
                    {loading ? (
                      <p className="px-4 py-2 text-sm text-gray-500">Loading...</p>
                    ) : categories.length > 0 ? (
                      categories.map(category => (
                        <a
                          key={category.id}
                          href={`/category/${category.id}`}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          {category.name}
                        </a>
                      ))
                    ) : (
                      <p className="px-4 py-2 text-sm text-gray-500">No categories found</p>
                    )}
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="px-4 py-2 text-sm text-gray-500">No product pages found</p>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductDropdown;
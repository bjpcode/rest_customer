import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getMenuItems, getMenuCategories } from '../../services/menuService';
import MenuItem from './MenuItem';

const MenuList = () => {
  const { t, i18n } = useTranslation(); // Add i18n to get current language
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Get current language
  const currentLanguage = i18n.language;

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesData = await getMenuCategories();
        setCategories(categoriesData);
      } catch (err) {
        setError('Failed to load categories');
        console.error(err);
      }
    };

    fetchCategories();
  }, [currentLanguage]); // Add currentLanguage as dependency

  useEffect(() => {
    const fetchMenuItems = async () => {
      setLoading(true);
      try {
        const items = await getMenuItems(selectedCategory);
        setMenuItems(items);
        setError(null);
      } catch (err) {
        setError('Failed to load menu items');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMenuItems();
  }, [selectedCategory, currentLanguage]); // Add currentLanguage as dependency

  return (
    <div className="py-6">
      <div className="container">
        <h2 className="text-2xl font-bold mb-6">{t('menu')}</h2>
        
        {/* Category tabs */}
        <div className="flex overflow-x-auto pb-2 mb-6 scrollbar-hide">
          <button
            className={`px-4 py-2 mr-2 rounded-full whitespace-nowrap ${
              selectedCategory === null
                ? 'bg-primary text-white'
                : 'bg-gray-200 text-gray-800'
            }`}
            onClick={() => setSelectedCategory(null)}
          >
            {t('all')}
          </button>
          
          {categories.map((category) => (
            <button
              key={category.key || category}
              className={`px-4 py-2 mr-2 rounded-full whitespace-nowrap ${
                selectedCategory === (category.key || category)
                  ? 'bg-primary text-white'
                  : 'bg-gray-200 text-gray-800'
              }`}
              onClick={() => setSelectedCategory(category.key || category)}
            >
              {/* Use t() function to translate category names */}
              {category.name || t(category)}
            </button>
          ))}
        </div>

        {/* 错误信息 */}
        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-md mb-6">
            {error}
          </div>
        )}

        {/* 加载状态 */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {menuItems.map((item) => (
              <MenuItem key={item.id} item={item} />
            ))}
            
            {menuItems.length === 0 && !loading && !error && (
              <div className="col-span-full text-center py-12 text-gray-500">
                No menu items found.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MenuList;
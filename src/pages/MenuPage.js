import React, { useState, useEffect } from 'react';
import { useSession } from '../context/SessionContext';
import { useCart } from '../context/CartContext';
import { getMenuItems } from '../services/menuService';

const MenuPage = () => {
  const { tableNumber, sessionId, isSessionActive, loading: sessionLoading } = useSession();
  const { addItem } = useCart();
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        setLoading(true);
        const items = await getMenuItems();
        setMenuItems(items);
        
        // Extract unique categories
        const uniqueCategories = [...new Set(items.map(item => item.category))];
        setCategories(uniqueCategories);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching menu:', err);
        setError('Failed to load menu. Please try again.');
        setLoading(false);
      }
    };

    fetchMenu();
  }, []);

  const handleAddToCart = (item) => {
    addItem(item, 1);
    // You could add a toast notification here
  };

  const filteredItems = activeCategory === 'all' 
    ? menuItems 
    : menuItems.filter(item => item.category === activeCategory);

  if (sessionLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isSessionActive) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md text-center">
          <h2 className="text-2xl font-bold mb-4">No Active Session</h2>
          <p className="text-gray-600 mb-6">
            Please scan the QR code or enter your table number to start ordering.
          </p>
          <a 
            href="/" 
            className="inline-block px-6 py-3 bg-primary text-white rounded-md hover:bg-primary-dark"
          >
            Go to Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Menu</h1>
        <div className="text-sm text-gray-600">
          Table: {tableNumber}
        </div>
      </div>

      {/* Category tabs */}
      <div className="flex overflow-x-auto mb-6 pb-2">
        <button
          className={`px-4 py-2 mr-2 rounded-md whitespace-nowrap ${
            activeCategory === 'all' 
              ? 'bg-primary text-white' 
              : 'bg-gray-200 text-gray-800'
          }`}
          onClick={() => setActiveCategory('all')}
        >
          All Items
        </button>
        {categories.map(category => (
          <button
            key={category}
            className={`px-4 py-2 mr-2 rounded-md whitespace-nowrap ${
              activeCategory === category 
                ? 'bg-primary text-white' 
                : 'bg-gray-200 text-gray-800'
            }`}
            onClick={() => setActiveCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <div className="text-center py-12 text-red-600">
          {error}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map(item => (
            <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              {item.image_url && (
                <img 
                  src={item.image_url} 
                  alt={item.name} 
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-4">
                <h3 className="text-lg font-semibold">{item.name}</h3>
                <p className="text-gray-600 text-sm mb-2">{item.description}</p>
                <div className="flex justify-between items-center mt-4">
                  <span className="text-lg font-bold">${item.price.toFixed(2)}</span>
                  <button
                    onClick={() => handleAddToCart(item)}
                    className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MenuPage;
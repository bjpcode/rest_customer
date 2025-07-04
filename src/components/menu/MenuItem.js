import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCart } from '../../context/CartContext';
import MenuItemDetail from './MenuItemDetail';
import { PlusIcon, MinusIcon } from '@heroicons/react/24/outline';

const MenuItem = ({ item }) => {
  const { t } = useTranslation();
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [showDetail, setShowDetail] = useState(false);
  const [instructions, setInstructions] = useState('');

  const handleAddToCart = () => {
    addItem(item, quantity);
    setQuantity(1);
  };

  const incrementQuantity = () => {
    setQuantity(prev => prev + 1);
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  return (
    <>
      <div className="card hover:shadow-lg transition-shadow">
        <div 
          className="cursor-pointer" 
          onClick={() => setShowDetail(true)}
        >
          {item.image_url && (
            <div className="h-48 overflow-hidden">
              <img 
                src={item.image_url} 
                alt={item.name} 
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          <div className="p-4">
            <h3 className="text-lg font-medium mb-1 cursor-pointer">
              {item.name}
            </h3>
            <p className="text-gray-600 text-sm mb-2 line-clamp-2">{item.description}</p>
            <div className="flex justify-between items-center">
              <span className="text-primary font-medium">${item.price.toFixed(2)}</span>
              {/* Category tag */}
              {item.category && (
                <span className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                  {t(item.category)}
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="p-4 pt-0 flex items-center justify-between">
          <div className="flex items-center">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                decrementQuantity();
              }}
              className="p-1 rounded-full bg-gray-200 hover:bg-gray-300"
            >
              <MinusIcon className="h-4 w-4" />
            </button>
            
            <span className="mx-2 w-6 text-center">{quantity}</span>
            
            <button 
              onClick={(e) => {
                e.stopPropagation();
                incrementQuantity();
              }}
              className="p-1 rounded-full bg-gray-200 hover:bg-gray-300"
            >
              <PlusIcon className="h-4 w-4" />
            </button>
          </div>
          
          <button 
            onClick={(e) => {
              e.stopPropagation();
              handleAddToCart();
            }}
            className="btn btn-primary text-sm"
          >
            {t('addToCart')}
          </button>
        </div>
      </div>

      {showDetail && (
        <MenuItemDetail 
          item={item} 
          onClose={() => setShowDetail(false)} 
          onAddToCart={handleAddToCart}
          quantity={quantity}
          onIncrement={incrementQuantity}
          onDecrement={decrementQuantity}
        />
      )}
    </>
  );
};

export default MenuItem;
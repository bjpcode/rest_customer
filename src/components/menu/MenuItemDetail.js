import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { XMarkIcon, PlusIcon, MinusIcon } from '@heroicons/react/24/outline';
import { useCart } from '../../context/CartContext';

const MenuItemDetail = ({ 
  item, 
  onClose, 
  quantity = 1,
  onIncrement,
  onDecrement
}) => {
  const { addItem } = useCart();
  const [specialInstructions, setSpecialInstructions] = useState('');

  const handleAddToCart = () => {
    addItem(item, quantity, specialInstructions);
    onClose();
  };

  return (
    <Dialog
      open={true}
      onClose={onClose}
      className="fixed inset-0 z-10 overflow-y-auto"
    >
      <div className="min-h-screen px-4 text-center">
        <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />

        {/* This element is to trick the browser into centering the modal contents. */}
        <span
          className="inline-block h-screen align-middle"
          aria-hidden="true"
        >
          &#8203;
        </span>
        
        <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
          <div className="flex justify-between items-start">
            <Dialog.Title
              as="h3"
              className="text-lg font-medium leading-6 text-gray-900"
            >
              {item.name}
            </Dialog.Title>
            
            <button
              type="button"
              className="bg-white rounded-md text-gray-400 hover:text-gray-500"
              onClick={onClose}
            >
              <span className="sr-only">Close</span>
              <XMarkIcon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>

          {item.image_url && (
            <div className="mt-4 h-48 overflow-hidden rounded-lg">
              <img 
                src={item.image_url} 
                alt={item.name} 
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="mt-4">
            <p className="text-sm text-gray-500">{item.description}</p>
          </div>

          {item.allergens && item.allergens.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-900">Allergens:</h4>
              <div className="flex flex-wrap gap-1 mt-1">
                {item.allergens.map((allergen, index) => (
                  <span 
                    key={index} 
                    className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800"
                  >
                    {allergen}
                  </span>
                ))}
              </div>
            </div>
          )}

          {item.nutritional_info && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-900">Nutritional Info:</h4>
              <div className="grid grid-cols-2 gap-2 mt-1 text-xs text-gray-500">
                {Object.entries(item.nutritional_info).map(([key, value]) => (
                  <div key={key}>
                    <span className="font-medium capitalize">{key}: </span>
                    <span>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-4">
            <label htmlFor="special-instructions" className="block text-sm font-medium text-gray-700">
              Special Instructions
            </label>
            <div className="mt-1">
              <textarea
                id="special-instructions"
                name="special-instructions"
                rows={3}
                className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                placeholder="Any special requests?"
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
              />
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between">
            <div className="flex items-center">
              <button 
                onClick={onDecrement}
                className="p-1 rounded-full bg-gray-200 hover:bg-gray-300"
                disabled={quantity <= 1}
              >
                <MinusIcon className="h-5 w-5" />
              </button>
              
              <span className="mx-3 w-6 text-center">{quantity}</span>
              
              <button 
                onClick={onIncrement}
                className="p-1 rounded-full bg-gray-200 hover:bg-gray-300"
              >
                <PlusIcon className="h-5 w-5" />
              </button>
            </div>
            
            <div className="text-lg font-bold text-primary">
              ${(item.price * quantity).toFixed(2)}
            </div>
          </div>

          <div className="mt-6">
            <button
              type="button"
              className="w-full btn btn-primary py-3"
              onClick={handleAddToCart}
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </Dialog>
  );
};

export default MenuItemDetail;
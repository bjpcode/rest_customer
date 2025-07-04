import React from 'react';
import { useCart } from '../../context/CartContext';
import { PlusIcon, MinusIcon, TrashIcon } from '@heroicons/react/24/outline';

const CartItem = ({ item }) => {
  const { updateItemQuantity, removeItem, updateItemInstructions } = useCart();

  return (
    <div className="border-b border-gray-200 py-4">
      <div className="flex items-start">
        {item.image_url && (
          <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md">
            <img
              src={item.image_url}
              alt={item.name}
              className="h-full w-full object-cover"
            />
          </div>
        )}
        
        <div className="ml-4 flex-1">
          <div className="flex justify-between">
            <h3 className="text-base font-medium text-gray-900">{item.name}</h3>
            <p className="text-base font-medium text-gray-900">
              ${(item.price * item.quantity).toFixed(2)}
            </p>
          </div>
          
          <p className="mt-1 text-sm text-gray-500 line-clamp-1">{item.description}</p>
          
          {item.instructions && (
            <p className="mt-1 text-xs text-gray-500 italic">
              "{item.instructions}"
            </p>
          )}
          
          <div className="mt-2 flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
                className="p-1 rounded-full bg-gray-200 hover:bg-gray-300"
              >
                <MinusIcon className="h-4 w-4" />
              </button>
              
              <span className="mx-2 w-6 text-center">{item.quantity}</span>
              
              <button
                onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                className="p-1 rounded-full bg-gray-200 hover:bg-gray-300"
              >
                <PlusIcon className="h-4 w-4" />
              </button>
            </div>
            
            <button
              onClick={() => removeItem(item.id)}
              className="text-red-500 hover:text-red-700"
            >
              <TrashIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
      
      <div className="mt-2">
        <textarea
          className="w-full text-sm border border-gray-300 rounded-md p-2 focus:ring-primary focus:border-primary"
          placeholder="Special instructions..."
          value={item.instructions || ''}
          onChange={(e) => updateItemInstructions(item.id, e.target.value)}
          rows={1}
        />
      </div>
    </div>
  );
};

export default CartItem;
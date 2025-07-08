import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCart } from '../context/CartContext';
import { useSession } from '../context/SessionContext';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { toast } from 'react-hot-toast';

// Create a simple CartItem component if you don't have one yet
const CartItem = ({ item, updateQuantity, removeItem }) => {
  return (
    <div className="flex justify-between items-center py-4">
      <div className="flex-1">
        <h3 className="font-medium">{item.name}</h3>
        <p className="text-sm text-gray-500">${item.price.toFixed(2)}</p>
      </div>
      
      <div className="flex items-center">
        <button 
          onClick={() => updateQuantity(item.id, item.quantity - 1)}
          className="px-2 py-1 bg-gray-200 rounded-l"
          disabled={item.quantity <= 1}
        >
          -
        </button>
        <span className="px-4 py-1 bg-gray-100">{item.quantity}</span>
        <button 
          onClick={() => updateQuantity(item.id, item.quantity + 1)}
          className="px-2 py-1 bg-gray-200 rounded-r"
        >
          +
        </button>
        
        <button 
          onClick={() => removeItem(item.id)}
          className="ml-4 text-red-500"
        >
          Remove
        </button>
      </div>
    </div>
  );
};

const CartPage = () => {
  const { t } = useTranslation();
  const { items, updateItemQuantity, removeItem, specialInstructions, setSpecialInstructions, getTotal, clearCart } = useCart();
  const { tableNumber, sessionId, isSessionActive } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitOrder = async () => {
    // Check for active session first
    if (!sessionId || !isSessionActive) {
      toast.error('No active session. Please scan QR code again.');
      return;
    }

    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Create order data
      const orderData = {
        table_number: tableNumber,
        session_id: sessionId,
        items: items,
        total_amount: getTotal(),
        special_instructions: specialInstructions,
        status: 'pending'
      };

      // Here you would normally call your API to create an order
      // For now, we'll just simulate a successful order
      console.log('Order data:', orderData); // For debugging
      
      setTimeout(() => {
        toast.success('Order placed successfully!');
        clearCart();
        setSpecialInstructions('');
        setIsSubmitting(false);
      }, 1500);
    } catch (error) {
      console.error('Error submitting order:', error);
      toast.error('Failed to place order. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <div className="container mx-auto px-4 py-8 flex-grow">
        <h1 className="text-2xl font-bold mb-6">{t('cart', 'Your Cart')}</h1>
        
        {items.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <p className="text-gray-500 mb-4">{t('emptyCart', 'Your cart is empty')}</p>
            <Link to="/" className="inline-block px-6 py-3 bg-primary text-white rounded-md hover:bg-primary-dark">
              {t('browseMenu', 'Browse Menu')}
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <div className="divide-y divide-gray-200">
                {items.map((item) => (
                  <CartItem 
                    key={item.id} 
                    item={item} 
                    updateQuantity={updateItemQuantity}
                    removeItem={removeItem}
                  />
                ))}
              </div>
              
              <div className="mt-6">
                <label htmlFor="order-instructions" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('specialInstructionsOrder', 'Special Instructions for the Order')}
                </label>
                <textarea
                  id="order-instructions"
                  className="w-full border border-gray-300 rounded-md p-2 focus:ring-primary focus:border-primary"
                  placeholder={t('anySpecialRequests', 'Any special requests?')}
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
            
            <div className="bg-gray-50 p-6">
              <div className="flex justify-between text-base font-medium text-gray-900 mb-4">
                <p>{t('subtotal', 'Subtotal')}</p>
                <p>${getTotal().toFixed(2)}</p>
              </div>
              
              <button
                type="button"
                className="w-full px-6 py-3 bg-primary text-white rounded-md hover:bg-primary-dark"
                onClick={handleSubmitOrder}
                disabled={isSubmitting}
              >
                {isSubmitting ? t('placingOrder', 'Placing Order...') : t('placeOrder', 'Place Order')}
              </button>
              
              <div className="mt-4">
                <Link
                  to="/"
                  className="text-sm text-primary hover:text-primary-dark flex justify-center"
                >
                  {t('continueShopping', 'Continue Shopping')}
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
};

export default CartPage;
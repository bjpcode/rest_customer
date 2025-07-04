import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCart } from '../context/CartContext';
import { useSession } from '../context/SessionContext';
import CartItem from '../components/cart/CartItem';
import { createOrder } from '../services/orderService';
import { toast } from 'react-hot-toast';

const CartPage = () => {
  const { t } = useTranslation();
  const { items, specialInstructions, setSpecialInstructions, getTotal, clearCart } = useCart();
  const { tableNumber, sessionId } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmitOrder = async () => {
    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const orderData = {
        table_number: tableNumber,
        order_items: items,
        total_amount: getTotal(),
        special_instructions: specialInstructions,
        session_id: sessionId,
        status: 'pending'
      };
      
      await createOrder(orderData);
      
      toast.success('Order placed successfully!');
      clearCart();
      navigate('/orders');
    } catch (error) {
      console.error('Error submitting order:', error);
      toast.error('Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-6">{t('cart')}</h1>
      
      {items.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-6">{t('emptyCart')}</p>
          <Link to="/" className="btn btn-primary">
            {t('browseMenu')}
          </Link>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
            <div className="p-6">
              <h2 className="text-lg font-medium mb-4">{t('orderItems')}</h2>
              
              <div className="divide-y divide-gray-200">
                {items.map((item) => (
                  <CartItem key={item.id} item={item} />
                ))}
              </div>
              
              <div className="mt-6">
                <label htmlFor="order-instructions" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('specialInstructionsOrder')}
                </label>
                <textarea
                  id="order-instructions"
                  className="w-full border border-gray-300 rounded-md p-2 focus:ring-primary focus:border-primary"
                  placeholder={t('anySpecialRequests')}
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
            
            <div className="bg-gray-50 p-6">
              <div className="flex justify-between text-base font-medium text-gray-900 mb-4">
                <p>{t('subtotal')}</p>
                <p>${getTotal().toFixed(2)}</p>
              </div>
              
              <button
                type="button"
                className="w-full btn btn-primary py-3"
                onClick={handleSubmitOrder}
                disabled={isSubmitting}
              >
                {isSubmitting ? t('placingOrder') : t('placeOrder')}
              </button>
              
              <div className="mt-4">
                <Link
                  to="/"
                  className="text-sm text-primary hover:text-primary-dark flex justify-center"
                >
                  {t('continueShopping')}
                </Link>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CartPage;
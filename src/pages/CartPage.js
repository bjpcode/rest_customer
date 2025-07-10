import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCart } from '../context/CartContext';
import { useSession } from '../context/SessionContext';
import { createOrder, getOrders } from '../services/orderService';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { toast } from 'react-hot-toast';
import { supabase } from '../services/supabase';

// Create a simple CartItem component
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
  const navigate = useNavigate();
  const { 
    items, 
    updateItemQuantity, 
    removeItem, 
    specialInstructions, 
    setSpecialInstructions, 
    getTotal, 
    clearCart 
  } = useCart();
  const { tableNumber, sessionId, isSessionActive } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previousOrders, setPreviousOrders] = useState([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);

  // Fetch previous orders for this session
  useEffect(() => {
    if (sessionId && isSessionActive) {
      console.log('Fetching session orders with tableNumber:', tableNumber, 'sessionId:', sessionId);
      fetchSessionOrders();
    }
  }, [sessionId, isSessionActive, tableNumber]); // Added tableNumber to dependencies
  
  const fetchSessionOrders = async () => {
    setIsLoadingOrders(true);
    try {
      console.log('Fetching orders with sessionId:', sessionId, 'tableNumber:', tableNumber);
      // Filter by both sessionId and tableNumber for more accurate results
      const orders = await getOrders({ 
        sessionId: sessionId,
        tableNumber: tableNumber 
      });
      console.log('Fetched orders:', orders);
      setPreviousOrders(orders || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load previous orders');
    } finally {
      setIsLoadingOrders(false);
    }
  };

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
      // Format the items to be stored in the database
      const formattedItems = items.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        instructions: item.instructions || ''
      }));

      // Create order data
      const orderData = {
        table_number: tableNumber,
        session_id: sessionId,
        order_items: JSON.stringify(formattedItems),
        total_amount: getTotal(),
        special_instructions: specialInstructions || '',
        status: 'pending'
      };

      console.log('Submitting order with data:', orderData);
      
      // Call the API to create an order
      const createdOrder = await createOrder(orderData);
      console.log('Order created successfully:', createdOrder);
      
      toast.success('Order placed successfully!');
      clearCart();
      setSpecialInstructions('');
      
      // Refresh the orders list before navigating
      await fetchSessionOrders();
      
      // Navigate back to menu with table parameter preserved
      if (tableNumber) {
        navigate(`/menu?table=${tableNumber}`);
      } else {
        navigate('/'); // Fallback if no table number
      }
    } catch (error) {
      console.error('Error submitting order:', error);
      toast.error(`Failed to place order: ${error.message || 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <div className="container mx-auto px-4 py-8 flex-grow">
        <h1 className="text-2xl font-bold mb-6">{t('cart', 'Your Cart')}</h1>
        
        {/* Current Cart Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">{t('currentOrder', 'Current Order')}</h2>
          {items.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <p className="text-gray-500 mb-4">{t('emptyCart', 'Your cart is empty')}</p>
              <Link to={tableNumber ? `/menu?table=${tableNumber}` : "/"} className="inline-block px-6 py-3 bg-primary text-white rounded-md hover:bg-primary-dark">
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
                    to={tableNumber ? `/menu?table=${tableNumber}` : "/"}
                    className="text-sm text-primary hover:text-primary-dark flex justify-center"
                  >
                    {t('continueShopping', 'Continue Shopping')}
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Previous Orders Section */}
        {previousOrders.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">{t('previousOrders', 'Previous Orders This Session')}</h2>
            {isLoadingOrders ? (
              <p className="text-gray-500">Loading orders...</p>
            ) : (
              <>
                <div className="space-y-4">
                  {previousOrders.map((order) => (
                    <div key={order.id} className="bg-white rounded-lg shadow-md p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <p className="text-sm text-gray-500">Order #{order.id}</p>
                          <p className="text-sm text-gray-500">
                            {(() => {
                              const orderDate = new Date(order.created_at);
                              // Add 2 hours to the time
                              orderDate.setHours(orderDate.getHours() + 2);
                              return orderDate.toLocaleString();
                            })()}
                          </p>
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          order.status === 'completed' ? 'bg-green-100 text-green-800' :
                          order.status === 'preparing' ? 'bg-yellow-100 text-yellow-800' :
                          order.status === 'pending' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                      
                      <div className="divide-y divide-gray-200">
                        {order.order_items && (() => {
                          try {
                            let items;
                            
                            // Handle both string and object formats
                            if (typeof order.order_items === 'string') {
                              items = JSON.parse(order.order_items);
                            } else if (Array.isArray(order.order_items)) {
                              // Already an array, use as is
                              items = order.order_items;
                            } else {
                              console.error('Invalid order_items format:', order.order_items);
                              return <p className="text-gray-500">No items to display</p>;
                            }
                            
                            return items.map((item, index) => (
                              <div key={index} className="py-2">
                                <div className="flex justify-between">
                                  <span>{item.name} x{item.quantity}</span>
                                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                                </div>
                                {item.instructions && (
                                  <p className="text-sm text-gray-500 mt-1">{item.instructions}</p>
                                )}
                              </div>
                            ));
                          } catch (e) {
                            console.error('Error parsing order items:', e, 'order_items:', order.order_items);
                            return <p className="text-red-500">Error displaying order items</p>;
                          }
                        })()}
                      </div>
                      
                      <div className="mt-4 pt-4 border-t">
                        <div className="flex justify-between font-semibold">
                          <span>Total</span>
                          <span>${order.total_amount.toFixed(2)}</span>
                        </div>
                        {order.special_instructions && (
                          <p className="text-sm text-gray-500 mt-2">
                            <strong>Special Instructions:</strong> {order.special_instructions}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Session Total */}
                <div className="mt-6 bg-white rounded-lg shadow-md p-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-bold">{t('sessionTotal', 'Session Total')}</h3>
                    <span className="text-xl font-bold text-primary">
                      ${previousOrders.reduce((total, order) => total + Number(order.total_amount), 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
};

export default CartPage;
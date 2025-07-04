import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSession } from '../context/SessionContext';
import { getOrdersBySession } from '../services/orderService';

const OrdersPage = () => {
  const { t } = useTranslation();
  const { sessionId } = useSession();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!sessionId) return;
      
      setLoading(true);
      try {
        const ordersData = await getOrdersBySession(sessionId);
        setOrders(ordersData);
        setError(null);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Failed to load your orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
    
    // Set up polling to check for order updates
    const intervalId = setInterval(fetchOrders, 30000); // Check every 30 seconds
    
    return () => clearInterval(intervalId);
  }, [sessionId]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'preparing':
        return 'bg-blue-100 text-blue-800';
      case 'served':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-6">{t('orders')}</h1>
      
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 text-red-700 p-4 rounded-md mb-6">
          {error}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-6">{t('noOrders')}</p>
          <Link to="/" className="btn btn-primary">
            {t('browseMenu')}
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-lg font-medium">{t('order')} #{order.id.slice(-6)}</h2>
                    <p className="text-sm text-gray-500">
                      {t('placedAt')} {formatDate(order.created_at)}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                    {t(order.status)}
                  </span>
                </div>
                
                <div className="divide-y divide-gray-200">
                  {order.order_items.map((item, index) => (
                    <div key={index} className="py-3 flex justify-between">
                      <div>
                        <span className="font-medium">{item.quantity}x </span>
                        <span>{item.name}</span>
                        {item.instructions && (
                          <p className="text-xs text-gray-500 italic mt-1">
                            "{item.instructions}"
                          </p>
                        )}
                      </div>
                      <span>${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                
                {order.special_instructions && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-md">
                    <h3 className="text-sm font-medium text-gray-700">{t('specialInstructions')}:</h3>
                    <p className="text-sm text-gray-600 mt-1">{order.special_instructions}</p>
                  </div>
                )}
                
                <div className="mt-6 flex justify-between text-base font-medium text-gray-900">
                  <p>{t('total')}</p>
                  <p>${order.total_amount.toFixed(2)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="mt-8 text-center">
        <Link to="/" className="text-primary hover:underline">
          {t('backToMenu')}
        </Link>
      </div>
    </div>
  );
};

export default OrdersPage;
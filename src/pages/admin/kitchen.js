import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getActiveOrders, updateOrderStatus } from '../../services/orderService';
import { toast } from 'react-hot-toast';

const KitchenPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshInterval, setRefreshInterval] = useState(30); // seconds
  
  useEffect(() => {
    fetchOrders();
    
    // Set up auto-refresh
    const intervalId = setInterval(fetchOrders, refreshInterval * 1000);
    
    // Clean up on unmount
    return () => clearInterval(intervalId);
  }, [refreshInterval]);
  
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const activeOrders = await getActiveOrders();
      
      // Group orders by table
      const groupedOrders = activeOrders.reduce((acc, order) => {
        const tableNumber = order.table_number;
        if (!acc[tableNumber]) {
          acc[tableNumber] = [];
        }
        acc[tableNumber].push(order);
        return acc;
      }, {});
      
      setOrders(groupedOrders);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to load orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      toast.success(`Order marked as ${newStatus}`);
      fetchOrders(); // Refresh orders
    } catch (err) {
      console.error('Error updating order status:', err);
      toast.error('Failed to update order status');
    }
  };
  
  const getOrderTime = (createdAt) => {
    const orderTime = new Date(createdAt);
    const now = new Date();
    const diffMinutes = Math.floor((now - orderTime) / (1000 * 60));
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes === 1) return '1 minute ago';
    return `${diffMinutes} minutes ago`;
  };
  
  const parseOrderItems = (orderItems) => {
    if (!orderItems) return [];
    
    try {
      if (typeof orderItems === 'string') {
        return JSON.parse(orderItems);
      }
      return Array.isArray(orderItems) ? orderItems : [];
    } catch (e) {
      console.error('Error parsing order items:', e);
      return [];
    }
  };
  
  if (loading && !Object.keys(orders).length) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Kitchen Dashboard</h1>
            <Link to="/admin" className="bg-gray-600 text-white px-4 py-2 rounded-md">
              Back to Admin
            </Link>
          </div>
          <div className="bg-white p-8 rounded-lg shadow-md">
            <p className="text-center text-gray-500">Loading orders...</p>
          </div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Kitchen Dashboard</h1>
            <Link to="/admin" className="bg-gray-600 text-white px-4 py-2 rounded-md">
              Back to Admin
            </Link>
          </div>
          <div className="bg-white p-8 rounded-lg shadow-md">
            <p className="text-center text-red-500">{error}</p>
            <button 
              onClick={fetchOrders}
              className="mt-4 mx-auto block bg-blue-600 text-white px-4 py-2 rounded-md"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Kitchen Dashboard</h1>
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <label htmlFor="refresh" className="mr-2 text-sm">Auto-refresh:</label>
              <select 
                id="refresh"
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(Number(e.target.value))}
                className="border rounded px-2 py-1"
              >
                <option value={10}>10s</option>
                <option value={30}>30s</option>
                <option value={60}>1m</option>
                <option value={300}>5m</option>
              </select>
            </div>
            <button 
              onClick={fetchOrders}
              className="bg-blue-600 text-white px-4 py-2 rounded-md"
            >
              Refresh Now
            </button>
            <Link to="/admin" className="bg-gray-600 text-white px-4 py-2 rounded-md">
              Back to Admin
            </Link>
          </div>
        </div>
        
        {Object.keys(orders).length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow-md">
            <p className="text-center text-gray-500">No active orders at the moment</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(orders).map(([tableNumber, tableOrders]) => (
              <div key={tableNumber} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="bg-blue-600 text-white p-4">
                  <h2 className="text-xl font-bold">Table {tableNumber}</h2>
                  <p className="text-sm">{tableOrders.length} active order(s)</p>
                </div>
                
                <div className="divide-y divide-gray-200">
                  {tableOrders.map((order) => {
                    const orderItems = parseOrderItems(order.order_items);
                    return (
                      <div key={order.id} className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <span className="text-sm text-gray-600">
                              Order #{order.id.slice(0, 8)} - {getOrderTime(order.created_at)}
                            </span>
                            <span className={`ml-2 px-2 py-1 text-xs rounded ${
                              order.status === 'completed' ? 'bg-green-100 text-green-800' :
                              order.status === 'preparing' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {order.status}
                            </span>
                          </div>
                        </div>
                        
                        <div className="space-y-2 mb-4">
                          {orderItems.length > 0 ? (
                            orderItems.map((item, index) => (
                              <div key={index} className="flex justify-between items-center py-1 border-b border-gray-100">
                                <div className="flex-1">
                                  <span className="font-medium">
                                    {item.quantity}x {item.name}
                                  </span>
                                  {item.instructions && (
                                    <p className="text-sm text-gray-500 mt-1">
                                      Note: {item.instructions}
                                    </p>
                                  )}
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-gray-500">No item details available</p>
                          )}
                        </div>
                        
                        <div className="flex space-x-2 mt-3">
                          {order.status !== 'preparing' && (
                            <button
                              onClick={() => handleStatusChange(order.id, 'preparing')}
                              className="bg-yellow-500 text-white px-3 py-1 rounded-md text-sm"
                            >
                              Mark Preparing
                            </button>
                          )}
                          {order.status !== 'completed' && (
                            <button
                              onClick={() => handleStatusChange(order.id, 'completed')}
                              className="bg-green-600 text-white px-3 py-1 rounded-md text-sm"
                            >
                              Mark Completed
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default KitchenPage;
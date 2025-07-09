import React, { useState, useEffect } from 'react';
import QRCode from 'react-qr-code';
import { openTableSession, endSession, getTableSession } from '../../services/sessionService';
import { getOrdersByTableAndSession, getSessionTotal, createOrder, deleteOrderItem } from '../../services/orderService';
import { getMenuItems } from '../../services/menuService';
import { createTransaction } from '../../services/transactionService';
import { updateTableStatus } from '../../services/tableService';
import { toast } from 'react-hot-toast';

const TableSessionPopup = ({ isOpen, onClose, table, onSessionStart, onSessionEnd }) => {
  const [session, setSession] = useState(null);
  const [sessionTotal, setSessionTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [showQRCode, setShowQRCode] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  
  const qrUrl = `${window.location.origin}/menu?table=${table?.table_number}`;
  
  useEffect(() => {
    if (isOpen && table?.status === 'Occupied') {
      fetchSessionDetails();
      fetchMenuItems();
    }
  }, [isOpen, table]);
  
  const fetchSessionDetails = async () => {
    try {
      const sessionData = await getTableSession(table.table_number);
      if (sessionData) {
        setSession(sessionData);
        await fetchSessionOrders(sessionData.id);
      }
    } catch (error) {
      console.error('Error fetching session:', error);
    }
  };
  
  const fetchSessionOrders = async (sessionId) => {
    try {
      const ordersData = await getOrdersByTableAndSession(table.table_number, sessionId);
      setOrders(ordersData);
      
      // Calculate total
      const total = ordersData.reduce((sum, order) => sum + order.total_amount, 0);
      setSessionTotal(total);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };
  
  const fetchMenuItems = async () => {
    try {
      const items = await getMenuItems();
      setMenuItems(items);
      
      // Extract unique categories
      const uniqueCategories = [...new Set(items.map(item => item.category || 'Main Menu'))];
      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Error fetching menu items:', error);
    }
  };
  
  const handleStartSession = async () => {
    setLoading(true);
    try {
      await openTableSession(table.table_number);
      toast.success(`Session started for Table ${table.table_number}`);
      onSessionStart();
      onClose();
    } catch (error) {
      toast.error('Failed to start session');
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeleteItem = async (orderId) => {
    if (!window.confirm('Are you sure you want to delete this item?')) {
      return;
    }
    
    try {
      await deleteOrderItem(orderId);
      toast.success('Item deleted successfully');
      fetchSessionDetails(); // Refresh orders
    } catch (error) {
      toast.error('Failed to delete item');
    }
  };
  
  const handleAddMenuItem = async (menuItem) => {
    try {
      const orderData = {
        session_id: session.id,
        table_number: table.table_number,
        items: [{
          menu_item_id: menuItem.id,
          name: menuItem.name,
          price: menuItem.price,
          quantity: 1
        }],
        total_amount: menuItem.price,
        status: 'pending'
      };
      
      await createOrder(orderData);
      toast.success(`${menuItem.name} added to order`);
      fetchSessionDetails(); // Refresh orders
    } catch (error) {
      toast.error('Failed to add item');
    }
  };
  
  const handleCheckout = async () => {
    if (!window.confirm(`Checkout Table ${table.table_number}?\nTotal: $${sessionTotal.toFixed(2)}\nPayment Method: ${paymentMethod}`)) {
      return;
    }
    
    setLoading(true);
    try {
      // Create transaction record
      const orderDetails = orders.map(order => ({
        id: order.id,
        items: order.items,
        total_amount: order.total_amount,
        created_at: order.created_at
      }));
      
      await createTransaction({
        session_id: session.id,
        table_number: table.table_number,
        total_amount: sessionTotal,
        payment_method: paymentMethod,
        order_details: orderDetails
      });
      
      // End the session
      await endSession(table.table_number);
      
      toast.success('Checkout completed successfully');
      onSessionEnd();
      onClose();
    } catch (error) {
      toast.error('Failed to complete checkout');
    } finally {
      setLoading(false);
    }
  };
  
  const handleEndSession = async () => {
    if (!window.confirm(`End session for Table ${table.table_number} without checkout?`)) {
      return;
    }
    
    setLoading(true);
    try {
      await endSession(table.table_number);
      toast.success('Session ended successfully');
      onSessionEnd();
      onClose();
    } catch (error) {
      toast.error('Failed to end session');
    } finally {
      setLoading(false);
    }
  };
  
  const filteredMenuItems = activeCategory === 'all' 
    ? menuItems 
    : menuItems.filter(item => item.category === activeCategory);
  
  if (!isOpen || !table) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full m-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">Table {table.table_number} Management</h2>
        
        <div className="mb-4 grid grid-cols-3 gap-4">
          <div>
            <p className="text-gray-600">Section: {table.section}</p>
            <p className="text-gray-600">Capacity: {table.capacity}</p>
          </div>
          <div>
            <p className="text-gray-600">Status: <span className={table.status === 'Available' ? 'text-green-600' : 'text-red-600'}>{table.status}</span></p>
            {session && <p className="text-gray-600">Started: {new Date(session.started_at).toLocaleString()}</p>}
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">Total: ${sessionTotal.toFixed(2)}</p>
          </div>
        </div>
        
        {table.status === 'Available' ? (
          <button
            onClick={handleStartSession}
            disabled={loading}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'Starting...' : 'Start Session'}
          </button>
        ) : (
          <>
            {/* Current Orders Section */}
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-3">Current Orders</h3>
              <div className="max-h-64 overflow-y-auto border rounded-lg">
                {orders.length === 0 ? (
                  <p className="p-4 text-gray-500 text-center">No orders yet</p>
                ) : (
                  <table className="w-full">
                    <thead className="bg-gray-100 sticky top-0">
                      <tr>
                        <th className="p-2 text-left">Time</th>
                        <th className="p-2 text-left">Items</th>
                        <th className="p-2 text-right">Amount</th>
                        <th className="p-2 text-center">Status</th>
                        <th className="p-2 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => (
                        <tr key={order.id} className="border-b">
                          <td className="p-2 text-sm">{new Date(order.created_at).toLocaleTimeString()}</td>
                          <td className="p-2">
                            {order.items.map((item, index) => (
                              <div key={index} className="text-sm">
                                {item.quantity}x {item.name} (${item.price})
                              </div>
                            ))}
                          </td>
                          <td className="p-2 text-right font-semibold">${order.total_amount.toFixed(2)}</td>
                          <td className="p-2 text-center">
                            <span className={`px-2 py-1 text-xs rounded ${
                              order.status === 'completed' ? 'bg-green-100 text-green-800' :
                              order.status === 'preparing' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="p-2 text-center">
                            <button
                              onClick={() => handleDeleteItem(order.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="mb-4 flex gap-2">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                {showMenu ? 'Hide Menu' : 'Add Items from Menu'}
              </button>
              <button
                onClick={() => setShowQRCode(!showQRCode)}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                {showQRCode ? 'Hide QR Code' : 'Show QR Code'}
              </button>
            </div>
            
            {/* QR Code Section (Hidden by default) */}
            {showQRCode && (
              <div className="mb-6 flex flex-col items-center p-4 bg-gray-100 rounded-lg">
                <p className="text-sm text-gray-500 mb-2">Customer QR Code:</p>
                <QRCode value={qrUrl} size={150} />
                <p className="text-xs text-gray-400 mt-2">{qrUrl}</p>
              </div>
            )}
            
            {/* Menu Section (Hidden by default) */}
            {showMenu && (
              <div className="mb-6 border rounded-lg p-4">
                <h4 className="font-semibold mb-3">Add Items from Menu</h4>
                
                {/* Category Tabs */}
                <div className="flex overflow-x-auto mb-4 pb-2">
                  <button
                    className={`px-3 py-1 mr-2 rounded-md whitespace-nowrap text-sm ${
                      activeCategory === 'all' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-200 text-gray-800'
                    }`}
                    onClick={() => setActiveCategory('all')}
                  >
                    All Items
                  </button>
                  {categories.map(category => (
                    <button
                      key={category}
                      className={`px-3 py-1 mr-2 rounded-md whitespace-nowrap text-sm ${
                        activeCategory === category 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-200 text-gray-800'
                      }`}
                      onClick={() => setActiveCategory(category)}
                    >
                      {category}
                    </button>
                  ))}
                </div>
                
                {/* Menu Items Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-64 overflow-y-auto">
                  {filteredMenuItems.map(item => (
                    <div key={item.id} className="border rounded p-3">
                      <h5 className="font-semibold text-sm">{item.name}</h5>
                      <p className="text-gray-600 text-xs mb-2">${item.price.toFixed(2)}</p>
                      <button
                        onClick={() => handleAddMenuItem(item)}
                        className="w-full text-sm px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                      >
                        Add
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Checkout Section */}
            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <label className="font-semibold mr-4">Payment Method:</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="px-3 py-1 border rounded-md"
                  >
                    <option value="cash">Cash</option>
                    <option value="card">Card</option>
                  </select>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold">Final Total: ${sessionTotal.toFixed(2)}</p>
                </div>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={handleCheckout}
                  disabled={loading || orders.length === 0}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Processing...' : 'Checkout & End Session'}
                </button>
                <button
                  onClick={handleEndSession}
                  disabled={loading}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                >
                  End Without Checkout
                </button>
              </div>
            </div>
          </>
        )}
        
        <button
          onClick={onClose}
          className="w-full mt-4 bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default TableSessionPopup;
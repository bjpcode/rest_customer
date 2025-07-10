import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getOrders } from '../../services/orderService';
import { getTableSessions } from '../../services/sessionService';

const AdminDashboard = () => {
  const [recentOrders, setRecentOrders] = useState([]);
  const [activeSessions, setActiveSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch recent orders
        const orders = await getOrders({ limit: 5 });
        setRecentOrders(orders);
        
        // Fetch active sessions
        const sessions = await getTableSessions(true);
        setActiveSessions(sessions);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data');
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Active Sessions */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Active Sessions</h2>
            <Link to="/admin/tables" className="text-blue-600 hover:underline">
              View All
            </Link>
          </div>
          
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : activeSessions.length === 0 ? (
            <p className="text-gray-500 py-4">No active sessions</p>
          ) : (
            <div className="space-y-4">
              {activeSessions.map(session => (
                <div key={session.id} className="border-b pb-3">
                  <div className="flex justify-between">
                    <span className="font-medium">Table {session.table_number}</span>
                    <span className="text-gray-500">
                      {new Date(session.created_at).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Recent Orders</h2>
            <Link to="/admin/orders" className="text-blue-600 hover:underline">
              View All
            </Link>
          </div>
          
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : recentOrders.length === 0 ? (
            <p className="text-gray-500 py-4">No recent orders</p>
          ) : (
            <div className="space-y-4">
              {recentOrders.map(order => (
                <div key={order.id} className="border-b pb-3">
                  <div className="flex justify-between">
                    <span className="font-medium">Table {order.table_number}</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      order.status === 'completed' ? 'bg-green-100 text-green-800' :
                      order.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {order.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(order.created_at).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
        <Link to="/admin/orders" className="bg-blue-600 text-white rounded-lg p-6 text-center hover:bg-blue-700">
          <h3 className="text-xl font-semibold mb-2">Manage Orders</h3>
          <p>View and update order status</p>
        </Link>
        
        <Link to="/admin/tables" className="bg-green-600 text-white rounded-lg p-6 text-center hover:bg-green-700">
          <h3 className="text-xl font-semibold mb-2">Manage Tables</h3>
          <p>View active sessions and QR codes</p>
        </Link>
        
        <Link to="/admin/menu" className="bg-purple-600 text-white rounded-lg p-6 text-center hover:bg-purple-700">
          <h3 className="text-xl font-semibold mb-2">Manage Menu</h3>
          <p>Add, edit, or remove menu items</p>
        </Link>
        
        <Link to="/admin/kitchen" className="bg-orange-600 text-white rounded-lg p-6 text-center hover:bg-orange-700">
          <h3 className="text-xl font-semibold mb-2">Kitchen Dashboard</h3>
          <p>Manage and track food preparation</p>
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboard;
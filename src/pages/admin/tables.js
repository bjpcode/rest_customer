import React, { useState, useEffect } from 'react';
import { getTableSessions, closeTableSession, openTableSession } from '../../services/sessionService';

const TablesManagement = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newTableNumber, setNewTableNumber] = useState('');

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const data = await getTableSessions();
      setSessions(data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching sessions:', err);
      setError('Failed to load table sessions');
      setLoading(false);
    }
  };

  const handleCloseSession = async (tableNumber) => {
    try {
      await closeTableSession(tableNumber);
      fetchSessions();
    } catch (err) {
      console.error('Error closing session:', err);
      setError('Failed to close session');
    }
  };

  const handleOpenSession = async (e) => {
    e.preventDefault();
    
    const tableNum = parseInt(newTableNumber);
    if (!newTableNumber || isNaN(tableNum) || tableNum <= 0) {
      setError('Please enter a valid table number');
      return;
    }
    
    try {
      await openTableSession(tableNum);
      setNewTableNumber('');
      fetchSessions();
    } catch (err) {
      console.error('Error opening session:', err);
      setError('Failed to open session');
    }
  };

  const getQRCodeUrl = (tableNumber, sessionId) => {
    const baseUrl = window.location.origin;
    return `${baseUrl}?table=${tableNumber}&session=${sessionId}`;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Table Management</h1>
      
      {/* Create new session */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Open New Session</h2>
        
        <form onSubmit={handleOpenSession} className="flex items-end space-x-4">
          <div className="flex-1">
            <label htmlFor="tableNumber" className="block text-sm font-medium text-gray-700 mb-1">
              Table Number
            </label>
            <input
              type="number"
              id="tableNumber"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              value={newTableNumber}
              onChange={(e) => setNewTableNumber(e.target.value)}
              min="1"
              required
            />
          </div>
          
          <button
            type="submit"
            className="bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Open Session
          </button>
        </form>
        
        {error && (
          <div className="mt-4 text-red-600">
            {error}
          </div>
        )}
      </div>
      
      {/* Sessions list */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Table
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created At
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                QR Code
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center">
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                </td>
              </tr>
            ) : sessions.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                  No sessions found
                </td>
              </tr>
            ) : (
              sessions.map(session => (
                <tr key={session.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      Table {session.table_number}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      session.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {session.is_active ? 'Active' : 'Closed'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(session.created_at).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {session.is_active && (
                      <a 
                        href={getQRCodeUrl(session.table_number, session.id)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View QR Link
                      </a>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {session.is_active && (
                      <button
                        onClick={() => handleCloseSession(session.table_number)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Close Session
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TablesManagement;
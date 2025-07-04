import React, { useState } from 'react';
import { useSession } from '../context/SessionContext';
import { openTableSession } from '../services/sessionService';
import { useNavigate } from 'react-router-dom';

const TableSelection = () => {
  const { tableNumber, sessionId, isSessionActive } = useSession();
  const [tableInput, setTableInput] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const tableNum = parseInt(tableInput);
    if (!tableInput || isNaN(tableNum) || tableNum <= 0) {
      setError('Please enter a valid table number');
      return;
    }
    
    setLoading(true);
    try {
      const session = await openTableSession(tableNum);
      setError('');
      
      // Redirect to the menu page with table and session parameters
      navigate(`/menu?table=${tableNum}&session=${session.id}`);
    } catch (err) {
      console.error('Error opening table session:', err);
      setError('Failed to start session. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6">Welcome to BBQ Restaurant</h2>
        
        <p className="text-gray-600 mb-6 text-center">
          Please enter your table number to start ordering
        </p>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="tableNumber" className="block text-sm font-medium text-gray-700 mb-1">
              Table Number
            </label>
            <input
              type="number"
              id="tableNumber"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
              value={tableInput}
              onChange={(e) => setTableInput(e.target.value)}
              placeholder="Enter your table number"
              min="1"
              disabled={loading}
            />
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
          </div>
          
          <button
            type="submit"
            className="w-full btn btn-primary py-3"
            disabled={loading}
          >
            {loading ? 'Starting Session...' : 'Start Ordering'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default TableSelection;
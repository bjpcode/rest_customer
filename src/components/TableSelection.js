import React, { useState } from 'react';
import { useSession } from '../context/SessionContext';

const TableSelection = () => {
  const [tableNumber, setTableNumber] = useState('');
  const [error, setError] = useState('');
  const { startSession } = useSession();

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const tableNum = parseInt(tableNumber);
    if (!tableNumber || isNaN(tableNum) || tableNum <= 0) {
      setError('Please enter a valid table number');
      return;
    }
    
    startSession(tableNum);
    setError('');
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
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
              placeholder="Enter your table number"
              min="1"
            />
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
          </div>
          
          <button
            type="submit"
            className="w-full btn btn-primary py-3"
          >
            Start Ordering
          </button>
        </form>
      </div>
    </div>
  );
};

export default TableSelection;
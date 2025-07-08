import React, { useState, useEffect } from 'react';
import QRCode from 'react-qr-code';
import { openTableSession, endSession, getTableSession } from '../../services/sessionService';
import { getSessionTotal } from '../../services/orderService';
import { updateTableStatus } from '../../services/tableService';
import { toast } from 'react-hot-toast';

const TableSessionPopup = ({ isOpen, onClose, table, onSessionStart, onSessionEnd }) => {
  const [session, setSession] = useState(null);
  const [sessionTotal, setSessionTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  
  const qrUrl = `${window.location.origin}/menu?table=${table?.table_number}`;
  
  useEffect(() => {
    if (isOpen && table?.status === 'Occupied') {
      fetchSessionDetails();
    }
  }, [isOpen, table]);
  
  const fetchSessionDetails = async () => {
    try {
      const sessionData = await getTableSession(table.table_number);
      if (sessionData) {
        setSession(sessionData);
        const total = await getSessionTotal(sessionData.id);
        setSessionTotal(total);
      }
    } catch (error) {
      console.error('Error fetching session:', error);
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
  
  const handleEndSession = async () => {
    if (!window.confirm(`End session for Table ${table.table_number}? Total: $${sessionTotal.toFixed(2)}`)) {
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
  
  if (!isOpen || !table) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">Table {table.table_number}</h2>
        
        <div className="mb-4">
          <p className="text-gray-600">Section: {table.section}</p>
          <p className="text-gray-600">Capacity: {table.capacity}</p>
          <p className="text-gray-600">Status: <span className={table.status === 'Available' ? 'text-green-600' : 'text-red-600'}>{table.status}</span></p>
        </div>
        
        <div className="mb-6 flex flex-col items-center">
          <p className="text-sm text-gray-500 mb-2">QR Code for this table:</p>
          <QRCode value={qrUrl} size={200} />
          <p className="text-xs text-gray-400 mt-2">{qrUrl}</p>
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
            {session && (
              <div className="mb-4 p-4 bg-gray-100 rounded">
                <p className="text-sm">Started: {new Date(session.started_at).toLocaleString()}</p>
                <p className="text-lg font-bold">Total: ${sessionTotal.toFixed(2)}</p>
              </div>
            )}
            <button
              onClick={handleEndSession}
              disabled={loading}
              className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 disabled:opacity-50"
            >
              {loading ? 'Ending...' : 'End Session'}
            </button>
          </>
        )}
        
        <button
          onClick={onClose}
          className="w-full mt-2 bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default TableSessionPopup;
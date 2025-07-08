import React, { createContext, useContext, useState, useEffect } from 'react';
import { getTableSession } from '../services/sessionService';

const SessionContext = createContext();

export const SessionProvider = ({ children }) => {
  const [tableNumber, setTableNumber] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initSession = async () => {
      try {
        setLoading(true);
        
        // Get table number from URL query params
        const searchParams = new URLSearchParams(window.location.search);
        const table = searchParams.get('table');
        
        if (table) {
          const tableNum = parseInt(table);
          setTableNumber(tableNum);
          
          // Check if there's an active session for this table
          const activeSession = await getTableSession(tableNum);
          
          if (activeSession) {
            setSessionId(activeSession.id);
            setIsSessionActive(true);
          } else {
            setIsSessionActive(false);
            setError('Table is not open. Please ask staff to open your table.');
          }
        }
      } catch (err) {
        console.error('Error initializing session:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    initSession();
  }, []);

  const value = {
    tableNumber,
    sessionId,
    isSessionActive,
    loading,
    error,
  };

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
};
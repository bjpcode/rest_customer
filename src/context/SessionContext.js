import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

const SessionContext = createContext();

export const useSession = () => useContext(SessionContext);

export const SessionProvider = ({ children }) => {
  const [tableNumber, setTableNumber] = useState(null);
  const [sessionId, setSessionId] = useState(null);

  useEffect(() => {
    // Check if we have a session in localStorage
    const storedSessionId = localStorage.getItem('sessionId');
    const storedTableNumber = localStorage.getItem('tableNumber');
    
    if (storedSessionId && storedTableNumber) {
      setSessionId(storedSessionId);
      setTableNumber(parseInt(storedTableNumber));
    }
  }, []);

  const startSession = (tableNum) => {
    const newSessionId = uuidv4();
    setTableNumber(tableNum);
    setSessionId(newSessionId);
    
    // Store in localStorage
    localStorage.setItem('sessionId', newSessionId);
    localStorage.setItem('tableNumber', tableNum.toString());
  };

  const endSession = () => {
    setTableNumber(null);
    setSessionId(null);
    localStorage.removeItem('sessionId');
    localStorage.removeItem('tableNumber');
  };

  return (
    <SessionContext.Provider value={{ 
      tableNumber, 
      sessionId, 
      startSession, 
      endSession,
      isActive: !!sessionId && !!tableNumber
    }}>
      {children}
    </SessionContext.Provider>
  );
};
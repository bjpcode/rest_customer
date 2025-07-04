import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSession } from './SessionContext';
import { getOrdersByTableAndSession } from '../services/orderService';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { tableNumber, sessionId, isSessionActive } = useSession();
  const [items, setItems] = useState([]);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [previousOrders, setPreviousOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load previous orders when session is active
  useEffect(() => {
    const loadPreviousOrders = async () => {
      if (isSessionActive && tableNumber && sessionId) {
        setLoading(true);
        try {
          const orders = await getOrdersByTableAndSession(tableNumber, sessionId);
          setPreviousOrders(orders);
        } catch (error) {
          console.error('Error loading previous orders:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    loadPreviousOrders();
  }, [isSessionActive, tableNumber, sessionId]);

  const addItem = (item, quantity = 1, instructions = '') => {
    setItems(prevItems => {
      // Check if item already exists in cart
      const existingItemIndex = prevItems.findIndex(i => i.id === item.id);
      
      if (existingItemIndex >= 0) {
        // Update quantity of existing item
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + quantity,
          instructions: instructions || updatedItems[existingItemIndex].instructions
        };
        return updatedItems;
      } else {
        // Add new item
        return [...prevItems, { ...item, quantity, instructions }];
      }
    });
  };

  const removeItem = (itemId) => {
    setItems(prevItems => prevItems.filter(item => item.id !== itemId));
  };

  const updateItemQuantity = (itemId, quantity) => {
    if (quantity <= 0) {
      removeItem(itemId);
      return;
    }
    
    setItems(prevItems => 
      prevItems.map(item => 
        item.id === itemId ? { ...item, quantity } : item
      )
    );
  };

  const updateItemInstructions = (itemId, instructions) => {
    setItems(prevItems => 
      prevItems.map(item => 
        item.id === itemId ? { ...item, instructions } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
    setSpecialInstructions('');
  };

  const getTotal = () => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const value = {
    items,
    specialInstructions,
    setSpecialInstructions,
    previousOrders,
    loading,
    addItem,
    removeItem,
    updateItemQuantity,
    updateItemInstructions,
    clearCart,
    getTotal,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
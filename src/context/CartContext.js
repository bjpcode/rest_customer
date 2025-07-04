import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSession } from './SessionContext';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const { sessionId, tableNumber } = useSession();

  // Load cart from localStorage when session changes
  useEffect(() => {
    if (sessionId) {
      const savedCart = localStorage.getItem(`cart_${sessionId}`);
      if (savedCart) {
        try {
          const { items: savedItems, instructions } = JSON.parse(savedCart);
          setItems(savedItems || []);
          setSpecialInstructions(instructions || '');
        } catch (error) {
          console.error('Error parsing saved cart:', error);
        }
      }
    }
  }, [sessionId]);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (sessionId) {
      localStorage.setItem(`cart_${sessionId}`, JSON.stringify({
        items,
        instructions: specialInstructions
      }));
    }
  }, [items, specialInstructions, sessionId]);

  const addItem = (item, quantity = 1, itemInstructions = '') => {
    setItems(prevItems => {
      const existingItemIndex = prevItems.findIndex(i => i.id === item.id);
      
      if (existingItemIndex >= 0) {
        // Item exists, update quantity
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + quantity,
          instructions: itemInstructions || updatedItems[existingItemIndex].instructions
        };
        return updatedItems;
      } else {
        // Item doesn't exist, add new item
        return [...prevItems, { 
          ...item, 
          quantity, 
          instructions: itemInstructions 
        }];
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

  const getItemCount = () => {
    return items.reduce((count, item) => count + item.quantity, 0);
  };

  return (
    <CartContext.Provider value={{
      items,
      specialInstructions,
      setSpecialInstructions,
      addItem,
      removeItem,
      updateItemQuantity,
      updateItemInstructions,
      clearCart,
      getTotal,
      getItemCount,
      tableNumber
    }}>
      {children}
    </CartContext.Provider>
  );
};
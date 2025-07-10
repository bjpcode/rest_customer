import { supabase } from './supabase';

export const getOrders = async (filters = {}) => {
  let query = supabase
    .from('orders_rest')
    .select('*') // Simplified select statement - no table joins
    .order('created_at', { ascending: false });
  
  // Apply filters
  if (filters.sessionId) {
    query = query.eq('session_id', filters.sessionId);
  }
  
  if (filters.tableNumber) {
    query = query.eq('table_number', filters.tableNumber);
  }
  
  if (filters.status && filters.status !== 'all') {
    query = query.eq('status', filters.status);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
  
  return data;
};

export const getOrderById = async (orderId) => {
  const { data, error } = await supabase
    .from('orders_rest')
    .select('*')
    .eq('id', orderId)
    .single();
  
  if (error) {
    console.error('Error fetching order:', error);
    throw error;
  }
  
  return data;
};

export const getActiveOrders = async () => {
  try {
    const { data, error } = await supabase
      .from('orders_rest')
      .select('*')
      .in('status', ['pending', 'preparing'])
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching active orders:', error);
    throw error;
  }
};

// Make sure your updateOrderStatus function only allows 'preparing' or 'completed'
export const updateOrderStatus = async (orderId, status) => {
  // Validate status
  if (!['preparing', 'completed'].includes(status)) {
    throw new Error('Invalid status. Must be "preparing" or "completed"');
  }
  
  try {
    const { error } = await supabase
      .from('orders_rest')
      .update({ status, updated_at: new Date() })
      .eq('id', orderId);
      
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
};

export const getOrdersByTableAndSession = async (tableNumber, sessionId) => {
  const { data, error } = await supabase
    .from('orders_rest')
    .select('*')
    .eq('table_number', tableNumber)
    .eq('session_id', sessionId)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching orders for table and session:', error);
    throw error;
  }
  
  return data;
};

export const createOrder = async (orderData) => {
    // Ensure order_items is a JSON string
    const processedOrderData = {
      ...orderData,
      order_items: typeof orderData.order_items === 'string' 
        ? orderData.order_items 
        : JSON.stringify(orderData.order_items)
    };
    
    const { data, error } = await supabase
      .from('orders_rest')
      .insert([processedOrderData])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating order:', error);
      throw error;
    }
    
    return data;
  };

export const getSessionTotal = async (sessionId) => {
  const { data, error } = await supabase
    .from('orders_rest')
    .select('total_amount')
    .eq('session_id', sessionId);
  
  if (error) {
    console.error('Error fetching session total:', error);
    throw error;
  }
  
  const total = data.reduce((sum, order) => sum + order.total_amount, 0);
  return total;
};

// Add this function to your existing orderService.js
export const deleteOrderItem = async (orderId) => {
  const { error } = await supabase
    .from('orders_rest')
    .delete()
    .eq('id', orderId);
  
  if (error) {
    console.error('Error deleting order item:', error);
    throw error;
  }
  
  return { success: true };
};

// Add these functions to your existing orderService.js
export const updateOrderItems = async (orderId, updatedItems, newTotalAmount) => {
    const { data, error } = await supabase
      .from('orders_rest')
      .update({ 
        order_items: JSON.stringify(updatedItems), // Convert to JSON string
        total_amount: newTotalAmount 
      })
      .eq('id', orderId)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating order items:', error);
      throw error;
    }
    
    return data;
  };

export const deleteOrderIfEmpty = async (orderId) => {
  const { error } = await supabase
    .from('orders_rest')
    .delete()
    .eq('id', orderId);
  
  if (error) {
    console.error('Error deleting empty order:', error);
    throw error;
  }
  
  return { success: true };
};
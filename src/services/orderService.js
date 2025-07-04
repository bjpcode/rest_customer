import { supabase } from './supabase';

export const getOrders = async (filters = {}) => {
  let query = supabase
    .from('orders_rest')
    .select(`
      *,
      table_sessions(*)
    `)
    .order('created_at', { ascending: false });
  
  // Apply filters
  if (filters.status && filters.status !== 'all') {
    query = query.eq('status', filters.status);
  }
  
  if (filters.tableNumber && filters.tableNumber !== 'all') {
    query = query.eq('table_number', parseInt(filters.tableNumber));
  }
  
  if (filters.sessionId) {
    query = query.eq('session_id', filters.sessionId);
  }
  
  if (filters.startDate) {
    query = query.gte('created_at', filters.startDate.toISOString());
  }
  
  if (filters.endDate) {
    query = query.lte('created_at', filters.endDate.toISOString());
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

export const updateOrderStatus = async (orderId, status) => {
  const { data, error } = await supabase
    .from('orders_rest')
    .update({ status })
    .eq('id', orderId)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
  
  return data;
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

// Add the missing function
export const getOrdersBySession = async (sessionId) => {
  const { data, error } = await supabase
    .from('orders_rest')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching orders for session:', error);
    throw error;
  }
  
  return data;
};

export const createOrder = async (orderData) => {
  const { data, error } = await supabase
    .from('orders_rest')
    .insert([orderData])
    .select()
    .single();
  
  if (error) {
    console.error('Error creating order:', error);
    throw error;
  }
  
  return data;
};
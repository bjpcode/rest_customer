import { supabase } from './supabase';

export const createOrder = async (orderData) => {
  const { data, error } = await supabase
    .from('orders_rest')
    .insert([orderData])
    .select();
  
  if (error) {
    console.error('Error creating order:', error);
    throw error;
  }
  
  return data[0];
};

export const getOrdersBySession = async (sessionId) => {
  const { data, error } = await supabase
    .from('orders_rest')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: false });
  
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
    .select();
  
  if (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
  
  return data[0];
};
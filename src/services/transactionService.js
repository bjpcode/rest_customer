// services/transactionService.js
import { supabase } from './supabase';

export const createTransaction = async (transactionData) => {
  const { data, error } = await supabase
    .from('transactions')
    .insert([transactionData])
    .select()
    .single();
  
  if (error) {
    console.error('Error creating transaction:', error);
    throw error;
  }
  
  return data;
};

export const getTransactionsByTable = async (tableNumber) => {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('table_number', tableNumber)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching transactions:', error);
    throw error;
  }
  
  return data;
};
import { supabase } from './supabase';

export const getTables = async () => {
  const { data, error } = await supabase
    .from('restaurant_tables')
    .select('*')
    .order('table_number', { ascending: true });
    
  if (error) {
    console.error('Error fetching tables:', error);
    throw error;
  }
  
  return data || [];
};

export const addTable = async (tableData) => {
  const { data, error } = await supabase
    .from('restaurant_tables')
    .insert([tableData])
    .select();
    
  if (error) {
    console.error('Error adding table:', error);
    throw error;
  }
  
  return data[0];
};

export const deleteTable = async (tableId) => {
  const { error } = await supabase
    .from('restaurant_tables')
    .delete()
    .eq('id', tableId);
    
  if (error) {
    console.error('Error deleting table:', error);
    throw error;
  }
  
  return true;
};

export const updateTableStatus = async (tableId, status) => {
  const { data, error } = await supabase
    .from('restaurant_tables')
    .update({ status })
    .eq('id', tableId)
    .select();
    
  if (error) {
    console.error('Error updating table status:', error);
    throw error;
  }
  
  return data[0];
};
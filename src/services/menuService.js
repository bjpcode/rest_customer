import { supabase } from './supabase';

export const getMenuItems = async () => {
  const { data, error } = await supabase
    .from('menu_items')
    .select('*')
    .order('category')
    .order('name');
  
  if (error) {
    console.error('Error fetching menu items:', error);
    throw error;
  }
  
  return data;
};

export const getMenuItemById = async (itemId) => {
  const { data, error } = await supabase
    .from('menu_items')
    .select('*')
    .eq('id', itemId)
    .single();
  
  if (error) {
    console.error('Error fetching menu item:', error);
    throw error;
  }
  
  return data;
};

export const getMenuCategories = async () => {
  const { data, error } = await supabase
    .from('menu_items')
    .select('category')
    .order('category');
  
  if (error) {
    console.error('Error fetching menu categories:', error);
    throw error;
  }
  
  // Extract unique categories
  const categories = [...new Set(data.map(item => item.category))];
  return categories;
};
import { supabase } from './supabase';
import i18n from '../i18n';

// Test function to check Supabase connection
export const testSupabaseConnection = async () => {
  try {
    console.log('Testing Supabase connection...');
    // Update table name to menu_rest
    const { data, error } = await supabase.from('menu_rest').select('count');
    
    if (error) {
      console.error('Supabase connection test error:', error);
      return false;
    }
    
    console.log('Supabase connection successful');
    return true;
  } catch (error) {
    console.error('Supabase connection test exception:', error);
    return false;
  }
};

// Get current language
const getCurrentLanguage = () => {
  return i18n.language?.substring(0, 2) || 'en';
};

export const getMenuItems = async () => {
  console.log('Fetching menu items...');
  try {
    const currentLang = getCurrentLanguage();
    console.log(`Current language: ${currentLang}`);
    
    // Fetch menu items with translations
    const { data, error } = await supabase
      .from('menu_rest')
      .select(`
        *,
        translations:menu_translations(*)
      `)
      .order('category', { ascending: true });
    
    if (error) {
      console.error('Supabase error fetching menu items:', error);
      throw error;
    }
    
    console.log('Successfully fetched menu items with translations:', data);
    
    // Process items to use translations when available
    const processedItems = data.map(item => {
      // Find translation for current language
      const translation = item.translations?.find(t => t.language_code === currentLang);
      
      return {
        ...item,
        // Use translated name and description if available
        name: translation?.name || item.name,
        description: translation?.description || item.description,
        allergens: translation?.allergens || item.allergens,
        // Keep original category for filtering
        category: item.category || 'Main Menu'
      };
    });
    
    return processedItems;
  } catch (error) {
    console.error('Error in getMenuItems:', error);
    throw error;
  }
};

export const getMenuItemById = async (itemId) => {
  // Update table name to menu_rest
  const { data, error } = await supabase
    .from('menu_rest')
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
  // Update table name to menu_rest
  const { data, error } = await supabase
    .from('menu_rest')
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
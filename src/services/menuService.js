import { supabase } from './supabase';
import i18n from '../i18n';

export const getMenuItems = async (category = null) => {
  const currentLang = i18n.language || 'en';
  
  // First, get the base menu items
  let query = supabase
    .from('menu_rest')
    .select(`
      *,
      translations:menu_translations(*)
    `)
    .eq('is_available', true);
  
  if (category) {
    query = query.eq('category', category);
  }
  
  const { data, error } = await query.order('name');
  
  if (error) {
    console.error('Error fetching menu items:', error);
    throw error;
  }
  
  // Process the data to include translations
  const processedData = data.map(item => {
    // Find translation for current language
    const translation = item.translations?.find(t => t.language_code === currentLang);
    
    if (translation) {
      return {
        ...item,
        name: translation.name || item.name,
        description: translation.description || item.description,
        allergens: translation.allergens || item.allergens,
        // Keep original translations for reference
        original: {
          name: item.name,
          description: item.description,
          allergens: item.allergens
        }
      };
    }
    
    return item;
  });
  
  return processedData;
};

export const getMenuCategories = async () => {
  const currentLang = i18n.language || 'en';
  
  // Get all available categories
  const { data: menuData, error: menuError } = await supabase
    .from('menu_rest')
    .select('category')
    .eq('is_available', true)
    .order('category');
  
  if (menuError) {
    console.error('Error fetching categories:', menuError);
    throw menuError;
  }
  
  // Extract unique categories
  const categoryKeys = [...new Set(menuData.map(item => item.category))];
  
  // Get category translations for current language
  const { data: translationsData, error: translationsError } = await supabase
    .from('category_translations')
    .select('*')
    .eq('language_code', currentLang)
    .in('category_key', categoryKeys);
  
  if (translationsError) {
    console.error('Error fetching category translations:', translationsError);
    throw translationsError;
  }
  
  // Create mapping from category key to translated name
  const translationsMap = {};
  translationsData.forEach(translation => {
    translationsMap[translation.category_key] = translation.name;
  });
  
  // Return array of category objects with key and translated name
  return categoryKeys.map(key => ({
    key,
    name: translationsMap[key] || key.charAt(0).toUpperCase() + key.slice(1) // Fallback to formatted key
  }));
};
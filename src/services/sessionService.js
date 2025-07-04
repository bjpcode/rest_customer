import { supabase } from './supabase';

export const getTableSessions = async (activeOnly = false) => {
  let query = supabase
    .from('table_sessions')
    .select('*')
    .order('table_number');
  
  if (activeOnly) {
    query = query.eq('is_active', true);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching table sessions:', error);
    throw error;
  }
  
  return data;
};

export const getTableSession = async (tableNumber) => {
  const { data, error } = await supabase
    .from('table_sessions')
    .select('*')
    .eq('table_number', tableNumber)
    .eq('is_active', true)
    .single();
  
  if (error && error.code !== 'PGRST116') { // PGRST116 is the error code for no rows returned
    console.error('Error fetching table session:', error);
    throw error;
  }
  
  return data;
};

export const openTableSession = async (tableNumber) => {
  // Check if table already has an active session
  const existingSession = await getTableSession(tableNumber);
  
  if (existingSession) {
    return existingSession;
  }
  
  // Create new session
  const { data, error } = await supabase
    .from('table_sessions')
    .insert([
      { table_number: tableNumber, is_active: true }
    ])
    .select()
    .single();
  
  if (error) {
    console.error('Error opening table session:', error);
    throw error;
  }
  
  return data;
};

export const closeTableSession = async (tableNumber) => {
  // Find active session for this table
  const session = await getTableSession(tableNumber);
  
  if (!session) {
    throw new Error(`No active session found for table ${tableNumber}`);
  }
  
  // Update session to inactive
  const { data, error } = await supabase
    .from('table_sessions')
    .update({ 
      is_active: false,
      ended_at: new Date().toISOString()
    })
    .eq('id', session.id)
    .select()
    .single();
  
  if (error) {
    console.error('Error closing table session:', error);
    throw error;
  }
  
  return data;
};

export const getSessionQRCode = (tableNumber, sessionId, baseUrl) => {
  return `${baseUrl}?table=${tableNumber}&session=${sessionId}`;
};

// Add this function to your existing sessionService.js
export const startSession = async (tableNumber) => {
  try {
    // Check if table already has an active session
    const { data: existingSession, error: checkError } = await supabase
      .from('table_sessions')
      .select('*')
      .eq('table_number', tableNumber)
      .eq('is_active', true)
      .single();
    
    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      console.error('Error checking existing session:', checkError);
      throw checkError;
    }
    
    if (existingSession) {
      return existingSession;
    }
    
    // Create new session
    const { data, error } = await supabase
      .from('table_sessions')
      .insert([
        { table_number: tableNumber, is_active: true }
      ])
      .select()
      .single();
    
    if (error) {
      console.error('Error starting session:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error in startSession:', error);
    throw error;
  }
};
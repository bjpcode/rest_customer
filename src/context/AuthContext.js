import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../services/supabase';

const AuthContext = createContext();

// Cache for admin status to prevent repeated DB calls
const adminStatusCache = new Map();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [initialCheckDone, setInitialCheckDone] = useState(false);
  
  // Track if we're currently checking to prevent duplicates
  const isCheckingRef = useRef(false);

  const checkAdminStatus = useCallback(async (userId) => {
    if (!userId) return false;
    
    // Check cache first
    if (adminStatusCache.has(userId)) {
      console.log('Using cached admin status for:', userId);
      return adminStatusCache.get(userId);
    }
    
    try {
      console.log('Checking admin status for user:', userId);
      
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error checking admin status:', error);
        adminStatusCache.set(userId, false);
        return false;
      }
      
      const isAdminUser = !!data;
      console.log('Admin check result:', isAdminUser);
      adminStatusCache.set(userId, isAdminUser);
      return isAdminUser;
    } catch (error) {
      console.error('Error in checkAdminStatus:', error);
      adminStatusCache.set(userId, false);
      return false;
    }
  }, []);

  // Initialize auth state - runs only once on mount
  useEffect(() => {
    let mounted = true;
    
    const initializeAuth = async () => {
      // Prevent duplicate initialization
      if (isCheckingRef.current) {
        console.log('Auth check already in progress, skipping...');
        return;
      }
      
      isCheckingRef.current = true;
      
      try {
        console.log('Starting auth initialization...');
        
        // Get current session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          return;
        }
        
        if (session?.user && mounted) {
          console.log('Found existing session for user:', session.user.id);
          setUser(session.user);
          
          // Check admin status
          const adminStatus = await checkAdminStatus(session.user.id);
          if (mounted) {
            setIsAdmin(adminStatus);
          }
        } else {
          console.log('No existing session found');
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        if (mounted) {
          console.log('Auth initialization complete');
          setLoading(false);
          setInitialCheckDone(true);
          isCheckingRef.current = false;
        }
      }
    };
    
    // Small delay to ensure Supabase client is ready
    const timer = setTimeout(() => {
      initializeAuth();
    }, 100);
    
    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, []); // Empty deps - run only once

  // Set up auth state listener
  useEffect(() => {
    let mounted = true;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // Skip if component unmounted or still initializing
        if (!mounted || !initialCheckDone) return;
        
        console.log('Auth state changed:', event);
        
        switch (event) {
          case 'SIGNED_IN':
            if (session?.user) {
              console.log('User signed in:', session.user.id);
              setUser(session.user);
              
              const adminStatus = await checkAdminStatus(session.user.id);
              if (mounted) {
                setIsAdmin(adminStatus);
              }
            }
            break;
            
          case 'SIGNED_OUT':
            console.log('User signed out');
            setUser(null);
            setIsAdmin(false);
            // Clear admin cache for this user
            if (user?.id) {
              adminStatusCache.delete(user.id);
            }
            break;
            
          case 'TOKEN_REFRESHED':
          case 'USER_UPDATED':
            if (session?.user) {
              setUser(session.user);
            }
            break;
        }
      }
    );
    
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [initialCheckDone, checkAdminStatus, user?.id]);

  // Auth methods
  const signIn = async ({ email, password }) => {
    try {
      console.log('Signing in user:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      console.log('Sign in successful');
      
      // Wait a bit for auth state to propagate
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return { data, error: null };
    } catch (error) {
      console.error('Sign in error:', error);
      return { data: null, error };
    }
  };

  const signUp = async ({ email, password, ...metadata }) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        },
      });
      
      if (error) throw error;
      
      return { data, error: null };
    } catch (error) {
      console.error('Sign up error:', error);
      return { data: null, error };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Clear state immediately
      setUser(null);
      setIsAdmin(false);
      
      // Clear admin cache
      adminStatusCache.clear();
      
      return { error: null };
    } catch (error) {
      console.error('Sign out error:', error);
      return { error };
    }
  };

  const value = {
    user,
    isAdmin,
    loading,
    signIn,
    signUp,
    signOut,
    isAuthenticated: !!user,
    initialCheckDone,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
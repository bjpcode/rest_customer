import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user, isAdmin, loading, initialCheckDone } = useAuth();
  const location = useLocation();
  const [timeoutOccurred, setTimeoutOccurred] = useState(false);
  
  // Add a timeout to prevent infinite loading
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (!initialCheckDone) {
        console.log('Protected route timeout - redirecting to login');
        setTimeoutOccurred(true);
      }
    }, 15000); // 15 seconds timeout
    
    return () => clearTimeout(timeoutId);
  }, [initialCheckDone]);

  // Debug logging
  useEffect(() => {
    console.log('ProtectedRoute state:', { 
      user: !!user, 
      isAdmin, 
      loading, 
      initialCheckDone, 
      timeoutOccurred,
      path: location.pathname
    });
  }, [user, isAdmin, loading, initialCheckDone, timeoutOccurred, location]);

  if (!initialCheckDone && !timeoutOccurred) {
    // Show loading state while checking authentication
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }
  
  // If timeout occurred or auth check is done but user is not authenticated
  if (timeoutOccurred || (initialCheckDone && !user)) {
    // Redirect to login
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }
  
  // If admin access is required but user is not admin
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }
  
  // If all checks pass, render the protected content
  return children;
};

export default ProtectedRoute;
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Spinner } from '@chakra-ui/react';

function ProtectedRoute({ children, allowedRoles = [] }) {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking auth state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="xl" />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user has required role
  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = currentUser.role;
    const hasRequiredRole = allowedRoles.includes(userRole);
    
    // Special case for admin - check by email
    const isAdmin = userRole === 'admin';
    const isRescue = userRole === 'rescue';
    
    // Allow access if user has required role
    if (hasRequiredRole) {
      return children;
    }
    
    // Redirect to appropriate dashboard if user tries to access wrong dashboard
    if (isAdmin && location.pathname.startsWith('/rescue-dashboard')) {
      return <Navigate to="/admin-dashboard" replace />;
    }
    
    if (isRescue && location.pathname.startsWith('/admin-dashboard')) {
      return <Navigate to="/rescue-dashboard" replace />;
    }
    
    // If user doesn't have required role, redirect to unauthorized
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}

export default ProtectedRoute;

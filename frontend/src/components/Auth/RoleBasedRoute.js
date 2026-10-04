import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import PrivateRoute from './PrivateRoute';

const RoleBasedRoute = ({ children, roles }) => {
  const { user } = useAuth();

  // If no specific roles required, just render children
  if (!roles || roles.length === 0) {
    return <PrivateRoute>{children}</PrivateRoute>;
  }

  // Check if user has required role
  if (!roles.includes(user?.role)) {
    return <Navigate to="/" />;
  }

  return <PrivateRoute>{children}</PrivateRoute>;
};

export default RoleBasedRoute;
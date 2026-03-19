import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const AdminRoute = ({ element: Component, ...rest }) => {
  const { authData } = useContext(AuthContext);

  if (!authData || !authData.token || !authData.user || !authData.user.isAdmin) {
    return <Navigate to="/" />; // Redirect to home or a 404 page
  }

  return Component;
};

export default AdminRoute;
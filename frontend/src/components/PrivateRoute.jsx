import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const PrivateRoute = ({ element: Component, ...rest }) => {
  const { authData } = useContext(AuthContext);

  if (!authData || !authData.token) {
    return <Navigate to="/login" />;
  }

  return Component;
};

export default PrivateRoute;
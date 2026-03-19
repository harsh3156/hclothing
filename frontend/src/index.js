import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import AuthProvider from "./context/AuthContext"; 
// 🔑 IMPORT THE CART PROVIDER
import { CartProvider } from "./context/CartContext"; 
import App from './App';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Router>
      <AuthProvider>
        {/* 🚀 FIX: WRAP <App /> WITH <CartProvider> */}
        <CartProvider>
          <App />
        </CartProvider>
      </AuthProvider>
    </Router>
  </React.StrictMode>
);
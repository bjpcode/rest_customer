import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { SessionProvider } from './context/SessionContext';
import { CartProvider } from './context/CartContext';
import HomePage from './pages/HomePage';
import MenuPage from './pages/MenuPage';
// Uncomment and import admin pages
import AdminDashboard from './pages/admin/index';
import AdminLogin from './pages/admin/login';
import TablesManagement from './pages/admin/tables';
import OrdersManagement from './pages/admin/orders';

function App() {
  return (
    <SessionProvider>
      <CartProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/menu" element={<MenuPage />} />
          {/* Uncomment admin routes */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/tables" element={<TablesManagement />} />
          <Route path="/admin/orders" element={<OrdersManagement />} />
        </Routes>
      </CartProvider>
    </SessionProvider>
  );
}

export default App;

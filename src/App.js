import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SessionProvider } from './context/SessionContext';
import { CartProvider } from './context/CartContext';
import HomePage from './pages/HomePage';
import MenuPage from './pages/MenuPage';
import CartPage from './pages/CartPage';
import AdminDashboard from './pages/admin/index';
import AdminLogin from './pages/admin/login';
import AdminRegister from './pages/admin/register';
import AdminProfile from './pages/admin/profile';
import TablesManagement from './pages/admin/tables';
import OrdersManagement from './pages/admin/orders';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <SessionProvider>
        <CartProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/menu" element={<MenuPage />} />
            <Route path="/cart" element={<CartPage />} />
            
            {/* Admin auth routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/register" element={<AdminRegister />} />
            
            {/* Protected admin routes */}
            <Route path="/admin" element={
              <ProtectedRoute requireAdmin={true}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/profile" element={
              <ProtectedRoute requireAdmin={true}>
                <AdminProfile />
              </ProtectedRoute>
            } />
            <Route path="/admin/tables" element={
              <ProtectedRoute requireAdmin={true}>
                <TablesManagement />
              </ProtectedRoute>
            } />
            <Route path="/admin/orders" element={
              <ProtectedRoute requireAdmin={true}>
                <OrdersManagement />
              </ProtectedRoute>
            } />
          </Routes>
        </CartProvider>
      </SessionProvider>
    </AuthProvider>
  );
}

export default App;
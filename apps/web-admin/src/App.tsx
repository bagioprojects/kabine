import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './components/AdminLayout';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import UserManager from './pages/UserManager';
import MarketManager from './pages/MarketManager';
import LawManager from './pages/LawManager';
import LogisticsManager from './pages/LogisticsManager';
import MapManager from './pages/MapManager';
import ModelManager from './pages/ModelManager';

// Korumalı Rotalar için Yetkilendirme Kontrolü
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('adminToken');
  const userStr = localStorage.getItem('adminUser');
  
  if (!token || !userStr) {
    return <Navigate to="/login" replace />;
  }

  try {
    const user = JSON.parse(userStr);
    if (!user.isAdmin) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      return <Navigate to="/login" replace />;
    }
  } catch (e) {
    return <Navigate to="/login" replace />;
  }

  return <AdminLayout>{children}</AdminLayout>;
}

export default function App() {
  return (
    <BrowserRouter basename="/websc-admin">
      <Routes>
        {/* Giriş Sayfası */}
        <Route path="/login" element={<AdminLogin />} />

        {/* Korumalı Yönetim Rotaları */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/users" 
          element={
            <ProtectedRoute>
              <UserManager />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/market" 
          element={
            <ProtectedRoute>
              <MarketManager />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/politics" 
          element={
            <ProtectedRoute>
              <LawManager />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/logistics" 
          element={
            <ProtectedRoute>
              <LogisticsManager />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/maps" 
          element={
            <ProtectedRoute>
              <MapManager />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/models" 
          element={
            <ProtectedRoute>
              <ModelManager />
            </ProtectedRoute>
          } 
        />

        {/* Catch-all - Bilinmeyen rotaları dashboard'a yönlendir */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

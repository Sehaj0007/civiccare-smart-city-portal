import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { ProtectedRoute, AdminRoute } from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { RaiseComplaintPage } from './pages/RaiseComplaintPage';
import { MyComplaintsPage } from './pages/MyComplaintsPage';
import { ComplaintDetailPage } from './pages/ComplaintDetailPage';
import { AdminDashboard } from './pages/AdminDashboard';
import TermsAndConditions from './pages/TermsAndConditions';
import PrivacyPolicy from './pages/PrivacyPolicy';


import './index.css';

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <Navbar />
          <Toaster position="top-right" />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage isAdmin={false} />} />
            <Route path="/admin-login" element={<LoginPage isAdmin={true} />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />

            {/* User Routes */}
            <Route
              path="/raise-complaint"
              element={
                <ProtectedRoute requiredRole="USER">
                  <RaiseComplaintPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-complaints"
              element={
                <ProtectedRoute requiredRole="USER">
                  <MyComplaintsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/complaint/:id"
              element={
                <ProtectedRoute requiredRole="USER">
                  <ComplaintDetailPage />
                </ProtectedRoute>
              }
            />

            {/* Admin Routes */}
            <Route
              path="/admin-dashboard"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />

            {/* Catch All */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;

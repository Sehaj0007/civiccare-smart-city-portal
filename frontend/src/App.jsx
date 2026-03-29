import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { ProtectedRoute, AdminRoute, StaffRoute } from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { RaiseComplaintPage } from './pages/RaiseComplaintPage';
import { MyComplaintsPage } from './pages/MyComplaintsPage';
import { ComplaintDetailPage } from './pages/ComplaintDetailPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { Supervisor } from './pages/Supervisor';
import { SupervisorLoginPage } from './pages/SupervisorLoginPage';
import { SupervisorDashboard } from './pages/SupervisorDashboard';
import { DepartmentComplaints } from './pages/DepartmentComplaints';
import { StaffDashboard } from './pages/StaffDashboard';
import TermsAndConditions from './pages/TermsAndConditions';
import PrivacyPolicy from './pages/PrivacyPolicy';


import './index.css';

function App() {
  return (
    <ErrorBoundary>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AuthProvider>
          <Navbar />
          <Toaster position="top-right" />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage isAdmin={false} />} />
            <Route path="/admin-login" element={<LoginPage isAdmin={true} />} />
            <Route path="/staff-login" element={<LoginPage isStaff={true} />} />
            <Route path="/supervisor-login" element={<SupervisorLoginPage />} />
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
            <Route
              path="/supervisor"
              element={
                <AdminRoute>
                  <Supervisor />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/department/:categoryId"
              element={
                <AdminRoute>
                  <DepartmentComplaints />
                </AdminRoute>
              }
            />

            {/* Supervisor Routes */}
            <Route
              path="/supervisor-dashboard"
              element={
                <ProtectedRoute requiredRole="SUPERVISOR">
                  <SupervisorDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/staff-dashboard"
              element={
                <StaffRoute>
                  <StaffDashboard />
                </StaffRoute>
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

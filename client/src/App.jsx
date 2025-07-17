import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Context Providers
import { AuthProvider } from './context/AuthContext';

// Components
import Navbar from './components/layout/Navbar';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Dashboard Pages
import CustomerDashboard from './pages/dashboard/CustomerDashboard';
import BarberDashboard from './pages/dashboard/BarberDashboard';
import AdminDashboard from './pages/dashboard/AdminDashboard';

// Customer Pages
import BookAppointment from './pages/customer/BookAppointment';
import MyBookings from './pages/customer/MyBookings';

// Barber Pages
import Appointments from './pages/barber/Appointments';
import Availability from './pages/barber/Availability';

// Admin Pages
import Users from './pages/admin/Users';
import AllBookings from './pages/admin/AllBookings';

// Common Pages
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Unauthorized from './pages/Unauthorized';
import NotFound from './pages/NotFound';

// Protected Route Component
import ProtectedRoute from './components/auth/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gradient-primary">
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected Routes with Layout */}
            <Route path="/*" element={
              <ProtectedRoute>
                <div className="min-h-screen">
                  <Navbar />
                  <main className="pb-8">
                    <Routes>
                      {/* Dashboard Routes */}
                      <Route path="/dashboard" element={<DashboardRouter />} />
                      
                      {/* Customer Routes */}
                      <Route path="/book" element={
                        <ProtectedRoute roles={['customer']}>
                          <BookAppointment />
                        </ProtectedRoute>
                      } />
                      <Route path="/bookings" element={
                        <ProtectedRoute roles={['customer']}>
                          <MyBookings />
                        </ProtectedRoute>
                      } />
                      
                      {/* Barber Routes */}
                      <Route path="/appointments" element={
                        <ProtectedRoute roles={['barber']}>
                          <Appointments />
                        </ProtectedRoute>
                      } />
                      <Route path="/availability" element={
                        <ProtectedRoute roles={['barber']}>
                          <Availability />
                        </ProtectedRoute>
                      } />
                      
                      {/* Admin Routes */}
                      <Route path="/users" element={
                        <ProtectedRoute roles={['admin']}>
                          <Users />
                        </ProtectedRoute>
                      } />
                      <Route path="/all-bookings" element={
                        <ProtectedRoute roles={['admin']}>
                          <AllBookings />
                        </ProtectedRoute>
                      } />
                      
                      {/* Common Routes */}
                      <Route path="/profile" element={<Profile />} />
                      <Route path="/settings" element={<Settings />} />
                      
                      {/* Error Routes */}
                      <Route path="/unauthorized" element={<Unauthorized />} />
                      <Route path="/404" element={<NotFound />} />
                      
                      {/* Redirects */}
                      <Route path="/" element={<Navigate to="/dashboard" replace />} />
                      <Route path="*" element={<Navigate to="/404" replace />} />
                    </Routes>
                  </main>
                </div>
              </ProtectedRoute>
            } />
          </Routes>
          
          {/* Toast Notifications */}
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '12px',
                color: '#1e293b',
                fontSize: '14px',
                fontWeight: '500',
                padding: '12px 16px',
              },
              success: {
                iconTheme: {
                  primary: '#22c55e',
                  secondary: '#ffffff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#ffffff',
                },
              },
            }}
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

// Dashboard Router - Routes to appropriate dashboard based on role
const DashboardRouter = () => {
  const { user } = useAuth();
  
  switch (user?.role) {
    case 'customer':
      return <CustomerDashboard />;
    case 'barber':
      return <BarberDashboard />;
    case 'admin':
      return <AdminDashboard />;
    default:
      return <Navigate to="/login" replace />;
  }
};

export default App;

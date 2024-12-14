import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { Sidebar } from './components/Sidebar1';
import { Home } from './pages/Home';
import { Transaction } from './pages/Transaction';
import { History } from './pages/History';
import { Fees } from './pages/Fees';
import { Notification } from './pages/Notification';
import { Signin } from './pages/Signin';
import { Signup } from './pages/Signup';
import { Profile } from './pages/Profile';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminSignup } from './pages/admin/AdminSignup';
import { AdminSignin } from './pages/admin/AdminSignin';
import { AdminSidebar } from './components/AdminSidebar';
import { AdminStudents } from './pages/admin/AdminStudents';
import { AdminFees } from './pages/admin/AdminFees';
import { AdminNotifications } from './pages/admin/AdminNotifications';
import { AdminReports } from './pages/admin/AdminReports';
import { AdminProfile } from './pages/admin/AdminProfile';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/signin" />;
  }
  return children;
};


const AdminProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/admin/signin" />;
  }
  return children;
};

function MainLayout() {
  const location = useLocation();
  const isAuthPage = ["/signin", "/signup", "/admin/signin", "/admin/signup"].includes(location.pathname);
  const isAdminRoute = location.pathname.startsWith('/admin');

  // Add this to handle initial redirect
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && location.pathname === '/admin/signin') {
      navigate('/admin/dashboard');
    }
  }, [location]);

  return (
    <div className="flex">
      {!isAuthPage && !isAdminRoute && <Sidebar />}
      {!isAuthPage && isAdminRoute && <AdminSidebar />}
      <main className={`flex-1 bg-gray-50 min-h-screen ${isAuthPage ? "" : "p-4"}`}>
        <Routes>
          {/* Auth Routes */}
          <Route path="/signin" element={<Signin />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/admin/signin" element={<AdminSignin />} />
          <Route path="/admin/signup" element={<AdminSignup />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/admin/dashboard" element={<AdminProtectedRoute><AdminDashboard /></AdminProtectedRoute>} />
          <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/transaction" element={<ProtectedRoute><Transaction /></ProtectedRoute>} />
          <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
          <Route path="/fees" element={<ProtectedRoute><Fees /></ProtectedRoute>} />
          <Route path="/notification" element={<ProtectedRoute><Notification /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

          <Route path="/admin/students" element={<AdminProtectedRoute><AdminStudents /></AdminProtectedRoute>} />
          <Route path="/admin/fees" element={<AdminProtectedRoute> <AdminFees /></AdminProtectedRoute>} />
          <Route path="/admin/notifications" element={<AdminProtectedRoute><AdminNotifications /></AdminProtectedRoute>} />
          <Route path="/admin/reports" element={<AdminProtectedRoute><AdminReports /></AdminProtectedRoute>} />
          <Route path="/admin/profile" element={<AdminProtectedRoute><AdminProfile /></AdminProtectedRoute>} />

          {/* Root redirect */}
          <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <MainLayout />
    </Router>
  );
}

export default App;
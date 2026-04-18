import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import FloatingChat from './components/FloatingChat';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Layout from './components/layout/Layout';

// Pages
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import AdminLogin from './pages/auth/AdminLogin';
import Dashboard from './pages/Dashboard';
import CollegeSearch from './pages/CollegeSearch';
import CollegeDetails from './pages/CollegeDetails';
import Profile from './pages/Profile';
import CollegeRegistration from './pages/CollegeRegistration';
import AdminLayout from './components/layout/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminStudents from './pages/admin/AdminStudents';
import AdminColleges from './pages/admin/AdminColleges';
import AdminManageColleges from './pages/admin/AdminManageColleges';
import AdminCollegeRequests from './pages/admin/AdminCollegeRequests';
import AdminChatbot from './pages/admin/AdminChatbot';
import AdminSubscriptions from './pages/admin/AdminSubscriptions';
import AdminSubscriptionManagement from './pages/admin/AdminSubscriptionManagement';
import CollegeAdminDashboard from './pages/admin/CollegeAdminDashboard';
import CollegeProfile from './pages/CollegeProfile';
import CollegeCourses from './pages/CollegeCourses';
import CollegeMedia from './pages/CollegeMedia';
import CollegePayment from './pages/CollegePayment';
import ManageMedia from './pages/admin/ManageMedia';
import ViewApplications from './pages/admin/ViewApplications';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <div className="min-h-screen bg-gray-900">
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/admin-login" element={<AdminLogin />} />
            <Route path="/college-registration" element={<CollegeRegistration />} />
            <Route path="/colleges" element={<CollegeSearch />} />
            <Route path="/colleges/:id" element={<CollegeDetails />} />
            
            {/* Protected routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            } />
            
            
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            
            {/* Admin routes - Protected with authentication */}
            <Route path="/admin" element={
              <ProtectedRoute allowedRoles={['super_admin']}>
                <AdminLayout />
              </ProtectedRoute>
            }>
              <Route index element={<AdminDashboard />} />
              <Route path="students" element={<AdminStudents />} />
              <Route path="colleges" element={<AdminColleges />} />
              <Route path="colleges/manage" element={<AdminManageColleges />} />
              <Route path="colleges/requests" element={<AdminCollegeRequests />} />
              <Route path="chatbot" element={<AdminChatbot />} />
            </Route>
            
            <Route path="/college/payment" element={
              <ProtectedRoute allowedRoles={['college_admin', 'college']}>
                <CollegePayment />
              </ProtectedRoute>
            } />
            
            <Route path="/college/dashboard" element={
              <ProtectedRoute allowedRoles={['college_admin', 'college']}>
                <CollegeAdminDashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/college/profile" element={
              <ProtectedRoute allowedRoles={['college_admin', 'college']}>
                <CollegeProfile />
              </ProtectedRoute>
            } />
            
            <Route path="/college/courses" element={
              <ProtectedRoute allowedRoles={['college_admin', 'college']}>
                <CollegeCourses />
              </ProtectedRoute>
            } />
            
            <Route path="/college/media" element={
              <ProtectedRoute allowedRoles={['college_admin', 'college']}>
                <CollegeMedia />
              </ProtectedRoute>
            } />
            
            <Route path="/college/manage-media" element={
              <ProtectedRoute allowedRoles={['college_admin', 'college']}>
                <ManageMedia />
              </ProtectedRoute>
            } />
            
            <Route path="/college/view-applications" element={
              <ProtectedRoute allowedRoles={['college_admin', 'college']}>
                <ViewApplications />
              </ProtectedRoute>
            } />
          </Routes>
          <FloatingChat />
        </div>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

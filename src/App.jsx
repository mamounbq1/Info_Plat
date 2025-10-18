import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { NotificationProvider } from './contexts/NotificationContext';
import FirebaseSetupPrompt from './components/FirebaseSetupPrompt';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import SetupAdmin from './pages/SetupAdmin';
import CreateProfile from './pages/CreateProfile';
import PendingApproval from './pages/PendingApproval';
import StudentDashboard from './pages/StudentDashboard';
import EnhancedStudentDashboard from './pages/EnhancedStudentDashboard';
import AdminDashboard from './pages/AdminDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import CourseView from './pages/CourseView';
import Settings from './pages/Settings';
import MyCourses from './pages/MyCourses';
import AchievementsPage from './pages/AchievementsPage';
import Bookmarks from './pages/Bookmarks';
import AddSampleCourses from './pages/AddSampleCourses';

// Check if Firebase is configured
const isFirebaseConfigured = import.meta.env.VITE_FIREBASE_API_KEY && 
                              import.meta.env.VITE_FIREBASE_API_KEY !== "demo-api-key" &&
                              import.meta.env.VITE_FIREBASE_API_KEY !== "YOUR_API_KEY";

// Protected Route Component
function ProtectedRoute({ children, adminOnly = false }) {
  const { currentUser, isAdmin } = useAuth();
  
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  
  if (adminOnly && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
}

// Dashboard Router - redirects based on user role (student/teacher/admin) with approval check
function DashboardRouter() {
  const { userProfile, currentUser, isApproved, userStatus } = useAuth();
  const [profileCheckComplete, setProfileCheckComplete] = useState(false);
  
  useEffect(() => {
    // Wait a moment to see if profile loads
    const timer = setTimeout(() => {
      setProfileCheckComplete(true);
    }, 2000); // Wait 2 seconds for profile to load
    
    return () => clearTimeout(timer);
  }, []);
  
  // Show loading spinner while user profile is being fetched
  if (currentUser && !userProfile && !profileCheckComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Chargement de votre profil...</p>
        </div>
      </div>
    );
  }
  
  // If profile still doesn't exist after waiting, redirect to create profile
  if (currentUser && !userProfile && profileCheckComplete) {
    return <Navigate to="/create-profile" replace />;
  }
  
  // Route based on user role
  if (!userProfile?.role) {
    // If no role is set, redirect to create profile
    return <Navigate to="/create-profile" replace />;
  }
  
  // Check if student needs approval (students only, not teachers or admins)
  if (userProfile.role === 'student' && (!isApproved || userStatus === 'pending' || userStatus === 'rejected')) {
    return <Navigate to="/pending-approval" replace />;
  }
  
  switch(userProfile.role) {
    case 'admin':
      return <AdminDashboard />;
    case 'teacher':
      return <TeacherDashboard />;
    case 'student':
    default:
      return <EnhancedStudentDashboard />;
  }
}

function App() {
  // Show setup prompt if Firebase is not configured
  if (!isFirebaseConfigured) {
    return (
      <LanguageProvider>
        <FirebaseSetupPrompt />
      </LanguageProvider>
    );
  }

  return (
    <Router>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <NotificationProvider>
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 transition-all duration-200">
            <Toaster 
              position="top-center"
              toastOptions={{
                duration: 3000,
                style: {
                  background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                  color: '#fff',
                  borderRadius: '1rem',
                  padding: '16px 24px',
                  fontWeight: '500',
                  boxShadow: '0 10px 40px -10px rgba(99, 102, 241, 0.4)',
                },
                success: {
                  duration: 3000,
                  iconTheme: {
                    primary: '#10b981',
                    secondary: '#fff',
                  },
                },
                error: {
                  duration: 4000,
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
            
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/setup-admin" element={<SetupAdmin />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/create-profile" element={<CreateProfile />} />
              <Route 
                path="/pending-approval" 
                element={
                  <ProtectedRoute>
                    <PendingApproval />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <DashboardRouter />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/course/:courseId" 
                element={
                  <ProtectedRoute>
                    <CourseView />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/settings" 
                element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/my-courses" 
                element={
                  <ProtectedRoute>
                    <MyCourses />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/achievements" 
                element={
                  <ProtectedRoute>
                    <AchievementsPage />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/bookmarks" 
                element={
                  <ProtectedRoute>
                    <Bookmarks />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/add-sample-courses" 
                element={
                  <ProtectedRoute adminOnly={true}>
                    <AddSampleCourses />
                  </ProtectedRoute>
                } 
              />
              
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            </div>
            </NotificationProvider>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;

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
import PendingApproval from './pages/PendingApproval';
import StudentDashboard from './pages/StudentDashboard';
import EnhancedStudentDashboard from './pages/EnhancedStudentDashboard';
import StudentPerformance from './pages/StudentPerformance';
import StudentQuizzes from './pages/StudentQuizzes';
import StudentExercises from './pages/StudentExercises';
import AdminDashboard from './pages/AdminDashboard';
import AdminAnalytics from './pages/AdminAnalytics';
import AdminCourses from './pages/AdminCourses';
import AdminUsers from './pages/AdminUsers';
import AdminQuizzes from './pages/AdminQuizzes';
import AdminExercises from './pages/AdminExercises';
import TeacherDashboard from './pages/TeacherDashboard';
import CourseView from './pages/CourseView';
import QuizTaking from './pages/QuizTaking';
import QuizResults from './pages/QuizResults';
import Settings from './pages/Settings';
import MyCourses from './pages/MyCourses';
import AchievementsPage from './pages/AchievementsPage';
import Bookmarks from './pages/Bookmarks';
import AddSampleCourses from './pages/AddSampleCourses';
import DatabaseSeeder from './pages/DatabaseSeeder';
import AddTestData from './pages/AddTestData';
import TestStudentClass from './pages/TestStudentClass';
import VerifyStudentsClasses from './pages/VerifyStudentsClasses';
import FixClassesLevelBranch from './pages/FixClassesLevelBranch';
import DiagnoseClassesStructure from './pages/DiagnoseClassesStructure';
import FixExistingStudents from './pages/FixExistingStudents';

// Public Pages
import AboutPage from './pages/AboutPage';
import NewsPage from './pages/NewsPage';
import NewsDetailPage from './pages/NewsDetailPage';
import GalleryPage from './pages/GalleryPage';
import ClubsPage from './pages/ClubsPage';
import ClubDetailPage from './pages/ClubDetailPage';
import ContactPage from './pages/ContactPage';
import AnnouncementsPage from './pages/AnnouncementsPage';
import EventsPage from './pages/EventsPage';
import TeachersPage from './pages/TeachersPage';

// New Public Pages
import AcademicCalendarPage from './pages/AcademicCalendarPage';
import CourseCatalogPage from './pages/CourseCatalogPage';
import EnrollmentPage from './pages/EnrollmentPage';
import ResultsPortalPage from './pages/ResultsPortalPage';
import TimetablePage from './pages/TimetablePage';
import FAQPage from './pages/FAQPage';
import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';
import DocsPage from './pages/DocsPage';
import SitemapPage from './pages/SitemapPage';
import SearchPage from './pages/SearchPage';
import LibraryPage from './pages/LibraryPage';

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
  
  // If profile still doesn't exist after waiting, redirect to login
  if (currentUser && !userProfile && profileCheckComplete) {
    return <Navigate to="/login" replace />;
  }
  
  // Route based on user role
  if (!userProfile?.role) {
    // If no role is set, redirect to login
    return <Navigate to="/login" replace />;
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
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/news" element={<NewsPage />} />
              <Route path="/news/:id" element={<NewsDetailPage />} />
              <Route path="/gallery" element={<GalleryPage />} />
              <Route path="/clubs" element={<ClubsPage />} />
              <Route path="/clubs/:id" element={<ClubDetailPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/announcements" element={<AnnouncementsPage />} />
              <Route path="/events" element={<EventsPage />} />
              <Route path="/teachers" element={<TeachersPage />} />
              
              {/* New Public Pages */}
              <Route path="/calendar" element={<AcademicCalendarPage />} />
              <Route path="/courses" element={<CourseCatalogPage />} />
              <Route path="/enroll" element={<EnrollmentPage />} />
              <Route path="/results" element={<ResultsPortalPage />} />
              <Route path="/timetable" element={<TimetablePage />} />
              <Route path="/faq" element={<FAQPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/docs" element={<DocsPage />} />
              <Route path="/sitemap" element={<SitemapPage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/library" element={<LibraryPage />} />
              
              {/* Auth Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
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
                path="/student/performance" 
                element={
                  <ProtectedRoute>
                    <StudentPerformance />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/student/quizzes" 
                element={
                  <ProtectedRoute>
                    <StudentQuizzes />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/student/exercises" 
                element={
                  <ProtectedRoute>
                    <StudentExercises />
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
                path="/quiz/:quizId" 
                element={
                  <ProtectedRoute>
                    <QuizTaking />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/quiz-results/:quizId/:attemptIndex" 
                element={
                  <ProtectedRoute>
                    <QuizResults />
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
              
              <Route 
                path="/seed-database" 
                element={
                  <ProtectedRoute adminOnly={true}>
                    <DatabaseSeeder />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/add-test-data" 
                element={
                  <ProtectedRoute>
                    <AddTestData />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/test-student-class" 
                element={
                  <ProtectedRoute>
                    <TestStudentClass />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/verify-students-classes" 
                element={
                  <ProtectedRoute>
                    <VerifyStudentsClasses />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/fix-classes-level-branch" 
                element={
                  <ProtectedRoute>
                    <FixClassesLevelBranch />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/diagnose-classes" 
                element={
                  <ProtectedRoute>
                    <DiagnoseClassesStructure />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/fix-existing-students" 
                element={
                  <ProtectedRoute>
                    <FixExistingStudents />
                  </ProtectedRoute>
                } 
              />
              
              {/* Admin Routes */}
              <Route 
                path="/admin/analytics" 
                element={
                  <ProtectedRoute adminOnly={true}>
                    <AdminAnalytics />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/admin/courses" 
                element={
                  <ProtectedRoute adminOnly={true}>
                    <AdminCourses />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/admin/users" 
                element={
                  <ProtectedRoute adminOnly={true}>
                    <AdminUsers />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/admin/quizzes" 
                element={
                  <ProtectedRoute adminOnly={true}>
                    <AdminQuizzes />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/admin/exercises" 
                element={
                  <ProtectedRoute adminOnly={true}>
                    <AdminExercises />
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

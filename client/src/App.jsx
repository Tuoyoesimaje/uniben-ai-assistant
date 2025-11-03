import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import LoginPage from './components/auth/LoginPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import ChatPage from './components/chat/ChatPage';
import MapPage from './pages/MapPage';
import NewsPage from './pages/NewsPage';
import QuizUpload from './components/quiz/QuizUpload';
import QuizStart from './components/quiz/QuizStart';
import QuizInterface from './components/quiz/QuizInterface';
import QuizResults from './components/quiz/QuizResults';
import Navbar from './components/shared/Navbar';
import AdminRedirect from './pages/AdminRedirect';
import SystemAdminPage from './pages/SystemAdminPage';
import DepartmentAdminPage from './pages/DepartmentAdminPage';
import LecturerAdminPage from './pages/LecturerAdminPage';
import BursaryAdminPage from './pages/BursaryAdminPage';
import './styles/globals.css';

// Dashboard component for authenticated users
const Dashboard = () => (
  <div className="min-h-screen w-full bg-gradient-to-br from-emerald-50 to-teal-100">
    <Navbar />
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20">
        <h1 className="text-3xl font-bold text-[#111816] mb-4">
          Welcome to UNIBEN AI Assistant
        </h1>
        <p className="text-slate-600 mb-8">
          You are successfully logged in. Start exploring the campus with our AI assistant!
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl border border-emerald-200 hover:shadow-lg transition-all duration-300">
            <h3 className="font-semibold text-emerald-800 mb-2 text-lg">💬 AI Chat</h3>
            <p className="text-emerald-700 text-sm">Ask questions about campus, courses, and departments</p>
          </div>
          <div className="p-6 bg-gradient-to-br from-teal-50 to-teal-100 rounded-xl border border-teal-200 hover:shadow-lg transition-all duration-300">
            <h3 className="font-semibold text-teal-800 mb-2 text-lg">🗺️ Navigation</h3>
            <p className="text-teal-700 text-sm">Get directions to buildings and facilities</p>
          </div>
          <div className="p-6 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border border-slate-200 hover:shadow-lg transition-all duration-300">
            <h3 className="font-semibold text-slate-800 mb-2 text-lg">📚 Study Tools</h3>
            <p className="text-slate-700 text-sm">Generate quizzes and find study resources</p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />

            {/* Protected routes */}
            <Route
              path="/chat"
              element={
                <ProtectedRoute>
                  <ChatPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/map"
              element={
                <ProtectedRoute>
                  <MapPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/navigate"
              element={
                <ProtectedRoute>
                  <MapPage />
                </ProtectedRoute>
              }
            />

            {/* Admin landing route - redirects based on role */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute requireAuth={true}>
                  <AdminRedirect />
                </ProtectedRoute>
              }
            />

            {/* Role specific admin routes */}
            <Route
              path="/admin/system"
              element={
                <ProtectedRoute allowedRoles={["system_admin"]}>
                  <SystemAdminPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/department"
              element={
                <ProtectedRoute allowedRoles={["departmental_admin"]}>
                  <DepartmentAdminPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/lecturer"
              element={
                <ProtectedRoute allowedRoles={["lecturer_admin"]}>
                  <LecturerAdminPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/bursary"
              element={
                <ProtectedRoute allowedRoles={["bursary_admin"]}>
                  <BursaryAdminPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/news"
              element={
                <ProtectedRoute allowedRoles={['student', 'staff', 'system_admin', 'bursary_admin', 'departmental_admin', 'lecturer_admin']}>
                  <NewsPage />
                </ProtectedRoute>
              }
            />

            {/* Quiz routes */}
            <Route
              path="/quiz"
              element={<QuizUpload />}
            />

            <Route
              path="/quiz/start/:id"
              element={
                <ProtectedRoute allowedRoles={['student', 'staff']}>
                  <QuizStart />
                </ProtectedRoute>
              }
            />

            <Route
              path="/quiz/take/:id"
              element={
                <ProtectedRoute allowedRoles={['student', 'staff']}>
                  <QuizInterface />
                </ProtectedRoute>
              }
            />

            <Route
              path="/quiz/results/:id"
              element={
                <ProtectedRoute allowedRoles={['student', 'staff']}>
                  <QuizResults />
                </ProtectedRoute>
              }
            />

            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* Catch all route */}
            <Route
              path="*"
              element={
                <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center p-4">
                  <div className="login-card p-8 text-center">
                    <h1 className="text-2xl font-bold text-[#111816] mb-4">
                      404 - Page Not Found
                    </h1>
                    <p className="text-slate-600 mb-6">
                      The page you're looking for doesn't exist.
                    </p>
                    <button
                      onClick={() => window.location.href = '/login'}
                      className="btn-login"
                    >
                      Go to Login
                    </button>
                  </div>
                </div>
              }
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
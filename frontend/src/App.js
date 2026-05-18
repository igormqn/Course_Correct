import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages publiques
import Home from './pages/Home';
import CoursesPublic from './pages/CoursesPublic';
import CourseDetail from './pages/CourseDetail';

// Pages d'authentification
import Login from './pages/Login';
import Register from './pages/Register';

// Pages Étudiant
import StudentDashboard from './pages/StudentDashboard';
import SubmitAssignment from './pages/Submitassignment';
import AssignmentDetail from './pages/Assignmentcomplete';

// Pages Tuteur
import TutorDashboard from './pages/TutorDashboard';
import CorrectAssignment from './pages/Correctassignment';

// Pages Admin
import AdminDashboard from './pages/AdminDashboard';

// Route protégée avec vérification de rôle
function ProtectedRoute({ children, allowedRoles }) {
  const { loading, user } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⟳</div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  // Vérifier si l'utilisateur a le bon rôle
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Rediriger vers le dashboard approprié
    if (user.role === 'STUDENT') {
      return <Navigate to="/student/dashboard" />;
    } else if (user.role === 'TUTOR') {
      return <Navigate to="/tutor/dashboard" />;
    } else if (user.role === 'ADMIN') {
      return <Navigate to="/admin/dashboard" />;
    }
    return <Navigate to="/login" />;
  }

  return children;
}


function AppRoutes() {
  return (
    <Routes>
      {/* ===== ROUTES PUBLIQUES ===== */}
      <Route path="/" element={<Home />} />
      <Route path="/courses" element={<CoursesPublic />} />
      <Route path="/courses/:id" element={<CourseDetail />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* ===== ROUTES ÉTUDIANT ===== */}
      <Route
        path="/student/dashboard"
        element={
          <ProtectedRoute allowedRoles={['STUDENT']}>
            <StudentDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/submit"
        element={
          <ProtectedRoute allowedRoles={['STUDENT']}>
            <SubmitAssignment />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/assignment/:id"
        element={
          <ProtectedRoute allowedRoles={['STUDENT']}>
            <AssignmentDetail />
          </ProtectedRoute>
        }
      />

      {/* ===== ROUTES TUTEUR ===== */}
      <Route
        path="/tutor/dashboard"
        element={
          <ProtectedRoute allowedRoles={['TUTOR']}>
            <TutorDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/tutor/correct/:id"
        element={
          <ProtectedRoute allowedRoles={['TUTOR']}>
            <CorrectAssignment />
          </ProtectedRoute>
        }
      />

      {/* ===== ROUTES ADMIN ===== */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      {/* ===== 404 - PAGE NON TROUVÉE ===== */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;
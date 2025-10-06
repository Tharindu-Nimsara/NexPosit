import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Contexts from './pages/Contexts';
import ContextDashboard from './pages/ContextDashboard';
import JoinContext from './pages/JoinContext';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/join/:code" element={<JoinContext />} />
          
          {/* Protected Routes */}
          <Route
            path="/contexts"
            element={
              <ProtectedRoute>
                <Contexts />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/contexts/:contextId/dashboard"
            element={
              <ProtectedRoute>
                <ContextDashboard />
              </ProtectedRoute>
            }
          />
          
          {/* Redirect old dashboard to contexts */}
          <Route
            path="/dashboard"
            element={<Navigate to="/contexts" replace />}
          />
          
          {/* Default Route */}
          <Route path="/" element={<Navigate to="/contexts" replace />} />
          
          {/* 404 */}
          <Route path="*" element={<Navigate to="/contexts" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
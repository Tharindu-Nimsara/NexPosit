import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { DarkModeProvider } from "./context/DarkModeContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Contexts from "./pages/Contexts";
import ContextDashboard from "./pages/ContextDashboard";
import ProjectDetail from "./pages/ProjectDetail";
import MainGrid from "./pages/MainGrid";
import JoinContext from "./pages/JoinContext";
import About from "./pages/About";
import PublicContextDashboard from "./pages/PublicContextDashboard";

function App() {
  return (
    <Router>
      <DarkModeProvider>
        <AuthProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/join/:code" element={<JoinContext />} />
            <Route path="/about" element={<About />} />

            {/* Public Dashboard - No auth required */}
            <Route
              path="/public/:contextId/dashboard"
              element={<PublicContextDashboard />}
            />

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

            <Route
              path="/contexts/:contextId/grid"
              element={
                <ProtectedRoute>
                  <MainGrid />
                </ProtectedRoute>
              }
            />

            <Route
              path="/contexts/:contextId/projects/:projectId"
              element={
                <ProtectedRoute>
                  <ProjectDetail />
                </ProtectedRoute>
              }
            />

            {/* Redirect old dashboard to contexts */}
            <Route
              path="/dashboard"
              element={<Navigate to="/contexts" replace />}
            />

            {/* Default Route */}
            <Route path="/" element={<Navigate to="/about" replace />} />

            {/* 404 */}
            <Route path="*" element={<Navigate to="/about" replace />} />
          </Routes>
        </AuthProvider>
      </DarkModeProvider>
    </Router>
  );
}

export default App;

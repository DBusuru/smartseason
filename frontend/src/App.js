import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import FieldsPage from "./pages/FieldsPage";
import FieldDetailPage from "./pages/FieldDetailPage";
import FieldFormPage from "./pages/FieldFormPage";
import AgentsPage from "./pages/AgentsPage";
import "./index.css";

function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading">Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function RequireAdmin({ children }) {
  const { user } = useAuth();
  if (user?.role !== "admin") return <Navigate to="/dashboard" replace />;
  return children;
}

function RedirectIfAuth() {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading">Loading…</div>;
  if (user) return <Navigate to="/dashboard" replace />;
  return <LoginPage />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<RedirectIfAuth />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          <Route path="/dashboard" element={
            <RequireAuth><DashboardPage /></RequireAuth>
          } />

          <Route path="/fields" element={
            <RequireAuth><FieldsPage /></RequireAuth>
          } />

          <Route path="/fields/new" element={
            <RequireAuth><RequireAdmin><FieldFormPage /></RequireAdmin></RequireAuth>
          } />

          <Route path="/fields/:id" element={
            <RequireAuth><FieldDetailPage /></RequireAuth>
          } />

          <Route path="/fields/:id/edit" element={
            <RequireAuth><RequireAdmin><FieldFormPage /></RequireAdmin></RequireAuth>
          } />

          <Route path="/agents" element={
            <RequireAuth><RequireAdmin><AgentsPage /></RequireAdmin></RequireAuth>
          } />

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

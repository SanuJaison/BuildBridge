import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { LoadingBlock } from "../ui/Feedback";

export default function ProtectedRoute({ role }) {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink-950">
        <LoadingBlock label="Preparing your workspace" />
      </div>
    );
  }

  if (!isAuthenticated) {
    const next = `${location.pathname}${location.search}`;
    return <Navigate to={`/login?next=${encodeURIComponent(next)}`} replace />;
  }

  if (role && user.role !== role) {
    if (user.role === "admin") return <Navigate to="/admin" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  if (!role && user.role === "admin") {
    return <Navigate to="/admin" replace />;
  }

  return <Outlet />;
}

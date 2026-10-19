import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../useAuth.js";

export function RequireAuth() {
  const { authed, checking } = useAuth();
  const location = useLocation();

  if (checking) return null;

  if (!authed) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}

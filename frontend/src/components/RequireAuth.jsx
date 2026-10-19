import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../useAuth.js";

export function RequireAuth() {
  const { authed } = useAuth();
  const location = useLocation();

  if (!authed) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}

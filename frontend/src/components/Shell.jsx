import { useEffect } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { api } from "../api.js";
import { useAuth } from "../useAuth.js";

export default function Shell() {
  const { email, authed, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const onExpire = () => {
      navigate("/login", { replace: true, state: { reason: "session" } });
    };
    window.addEventListener("auth:expired", onExpire);
    return () => window.removeEventListener("auth:expired", onExpire);
  }, [navigate]);

  async function leave() {
    try {
      await api("/api/logout", { method: "POST", auth: true });
    } catch {
      // The local session still ends if the cookie is already gone.
    }
    signOut();
  }

  return (
    <div className="app">
      <div className="grain" aria-hidden="true" />
      <header className="topbar">
        <NavLink to="/" className="brand" end>
          <span className="brand-mark" aria-hidden="true" />
          Marquee
        </NavLink>
        <nav className="nav">
          <NavLink to="/book" className="nav-link">
            Hall
          </NavLink>
          {authed ? (
            <>
              <span className="who" title={email}>
                {email}
              </span>
              <button type="button" className="btn btn-ghost btn-small" onClick={leave}>
                Sign out
              </button>
            </>
          ) : (
            <NavLink to="/login" className="btn btn-small">
              Sign in
            </NavLink>
          )}
        </nav>
      </header>
      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}

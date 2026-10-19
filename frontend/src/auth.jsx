import { useEffect, useMemo, useState } from "react";
import { api } from "./api.js";
import { AuthContext } from "./auth-context.js";

const EMAIL_KEY = "marquee-email";
const AUTH_KEY = "marquee-authed";

export function AuthProvider({ children }) {
  const [email, setEmail] = useState(() => sessionStorage.getItem(EMAIL_KEY) || "");
  const [authed, setAuthed] = useState(() => sessionStorage.getItem(AUTH_KEY) === "1");
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const onExpire = () => {
      sessionStorage.removeItem(AUTH_KEY);
      setAuthed(false);
    };
    window.addEventListener("auth:expired", onExpire);
    return () => window.removeEventListener("auth:expired", onExpire);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      try {
        const payload = await api("/api/get-profile");
        const user = payload?.data?.user;
        if (cancelled) return;
        if (user?.email) {
          sessionStorage.setItem(EMAIL_KEY, user.email);
          sessionStorage.setItem(AUTH_KEY, "1");
          setEmail(user.email);
          setAuthed(true);
        } else {
          sessionStorage.removeItem(AUTH_KEY);
          setAuthed(false);
        }
      } catch {
        if (cancelled) return;
        sessionStorage.removeItem(AUTH_KEY);
        setAuthed(false);
      } finally {
        if (!cancelled) setChecking(false);
      }
    }

    loadProfile();
    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo(
    () => ({
      email,
      authed,
      checking,
      rememberEmail(next) {
        sessionStorage.setItem(EMAIL_KEY, next);
        setEmail(next);
      },
      markAuthed() {
        sessionStorage.setItem(AUTH_KEY, "1");
        setAuthed(true);
      },
      signOut() {
        sessionStorage.removeItem(AUTH_KEY);
        setAuthed(false);
      },
    }),
    [email, authed, checking],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

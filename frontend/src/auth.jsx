import { useEffect, useMemo, useState } from "react";
import { AuthContext } from "./auth-context.js";
const EMAIL_KEY = "marquee-email";
const AUTH_KEY = "marquee-authed";

export function AuthProvider({ children }) {
  const [email, setEmail] = useState(() => sessionStorage.getItem(EMAIL_KEY) || "");
  const [authed, setAuthed] = useState(() => sessionStorage.getItem(AUTH_KEY) === "1");

  useEffect(() => {
    const onExpire = () => {
      sessionStorage.removeItem(AUTH_KEY);
      setAuthed(false);
    };
    window.addEventListener("auth:expired", onExpire);
    return () => window.removeEventListener("auth:expired", onExpire);
  }, []);

  const value = useMemo(
    () => ({
      email,
      authed,
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
    [email, authed],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

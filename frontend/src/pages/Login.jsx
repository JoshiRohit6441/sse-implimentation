import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { api } from "../api.js";
import { useAuth } from "../useAuth.js";
import AuthStage from "../components/AuthStage.jsx";

export default function Login() {
  const { rememberEmail, email: savedEmail } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState(savedEmail);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(event) {
    event.preventDefault();
    const next = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(next)) {
      setError("Enter a valid email.");
      return;
    }

    setBusy(true);
    setError("");
    try {
      const result = await api("/api/register-login", {
        method: "POST",
        body: { email: next },
      });
      rememberEmail(next);
      navigate("/verify", { state: { message: result.message } });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthStage
      eyebrow="Sign in"
      title="Enter your email"
      lede="We send this to the server. It returns a code for the next step."
    >
      {location.state?.reason === "session" ? (
        <p className="banner">Your session ended. Sign in again.</p>
      ) : null}
      <form className="form" onSubmit={onSubmit}>
        <label className="field">
          Email
          <input
            type="email"
            autoComplete="email"
            placeholder="you@email.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </label>
        {error ? <p className="banner">{error}</p> : null}
        <button className="btn" type="submit" disabled={busy}>
          {busy ? "Sending code…" : "Send code"}
        </button>
      </form>
    </AuthStage>
  );
}

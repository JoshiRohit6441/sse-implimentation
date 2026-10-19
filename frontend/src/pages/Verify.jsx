import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { api } from "../api.js";
import { useAuth } from "../useAuth.js";
import AuthStage from "../components/AuthStage.jsx";

export default function Verify() {
  const { email, markAuthed } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState(location.state?.message || "");
  const [busy, setBusy] = useState(false);
  const [resending, setResending] = useState(false);

  if (!email) return <Navigate to="/login" replace />;

  async function onSubmit(event) {
    event.preventDefault();
    const code = otp.trim();
    if (!/^\d{6}$/.test(code)) {
      setError("Enter the 6-digit code.");
      return;
    }

    setBusy(true);
    setError("");
    try {
      await api("/api/verify-otp", {
        method: "POST",
        body: { otp: code },
      });
      markAuthed();
      navigate("/book", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function resend() {
    setResending(true);
    setError("");
    try {
      const result = await api("/api/register-login", {
        method: "POST",
        body: { email },
      });
      setInfo(result.message || "A new code was requested.");
      setOtp("");
    } catch (err) {
      setError(err.message);
    } finally {
      setResending(false);
    }
  }

  return (
    <AuthStage
      eyebrow="Confirm"
      title="Enter the code"
      lede={`Sent for ${email}.`}
    >
      {info ? <p className="banner is-quiet">{info}</p> : null}
      <form className="form" onSubmit={onSubmit}>
        <label className="field">
          6-digit code
          <input
            className="otp"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            placeholder="000000"
            value={otp}
            onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))}
          />
        </label>
        <p className="hint">
          The API does not return the code. Until email is connected, read the Redis key{" "}
          <code>{email}-otp</code>.
        </p>
        {error ? <p className="banner">{error}</p> : null}
        <button className="btn" type="submit" disabled={busy || otp.length !== 6}>
          {busy ? "Checking…" : "Open the hall"}
        </button>
        <button className="btn btn-ghost" type="button" onClick={resend} disabled={resending}>
          {resending ? "Requesting…" : "Send a new code"}
        </button>
      </form>
    </AuthStage>
  );
}

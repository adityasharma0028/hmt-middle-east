import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [forgotPassword, setForgotPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    window.location.href = "/admin/dashboard";
  }

  async function handleForgotPassword(e) {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setLoading(false);

    if (error) {
      setMessage(error.message);
    } else {
      setMessage(
        "Password reset email requested. Check your inbox and spam folder."
      );
    }
  }

  return (
    <div
      style={{
        maxWidth: "420px",
        margin: "80px auto",
        padding: "30px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1>{forgotPassword ? "Reset Password" : "Admin Login"}</h1>

      <p>
        {forgotPassword
          ? "Enter your admin email to receive a password reset link."
          : "Sign in to manage HMT Middle East products."}
      </p>

      <form onSubmit={forgotPassword ? handleForgotPassword : handleLogin}>
        <label htmlFor="admin-email">Email address</label>
        <input
          id="admin-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          style={{
            display: "block",
            width: "100%",
            boxSizing: "border-box",
            padding: "12px",
            margin: "8px 0 18px",
          }}
        />

        {!forgotPassword && (
          <>
            <label htmlFor="admin-password">Password</label>
            <input
              id="admin-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              style={{
                display: "block",
                width: "100%",
                boxSizing: "border-box",
                padding: "12px",
                margin: "8px 0 18px",
              }}
            />
          </>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "12px",
            cursor: loading ? "wait" : "pointer",
          }}
        >
          {loading
            ? "Please wait..."
            : forgotPassword
              ? "Send Reset Link"
              : "Log In"}
        </button>
      </form>

      {message && (
        <p role="status" style={{ marginTop: "18px", overflowWrap: "anywhere" }}>
          {message}
        </p>
      )}

      <p style={{ marginTop: "20px" }}>
        {forgotPassword ? (
          <button type="button" onClick={() => {
            setForgotPassword(false);
            setMessage("");
          }}>
            Back to login
          </button>
        ) : (
          <button type="button" onClick={() => {
            setForgotPassword(true);
            setMessage("");
          }}>
            Forgot password?
          </button>
        )}
      </p>

      <p>
        <Link to="/">Return to website</Link>
      </p>
    </div>
  );
}
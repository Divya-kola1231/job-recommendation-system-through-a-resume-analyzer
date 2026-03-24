import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      setError("Please enter both username and password.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/admin-login/`,
        { username: username.trim(), password },
        { headers: { "Content-Type": "application/json" } }
      );

      if (res.data.success) {
        // Store admin session in localStorage
        localStorage.setItem("admin_auth", "admin-authenticated");
        localStorage.setItem("admin_name", res.data.admin);
        navigate("/admin/dashboard");
      } else {
        setError(res.data.message || "Login failed.");
      }
    } catch (err) {
      if (err.response?.status === 401) {
        setError("Invalid credentials or not an admin.");
      } else {
        setError("Server error. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    <div className="page" style={{
      display: "flex", alignItems: "center", justifyContent: "center",
      minHeight: "calc(100vh - 68px)",
      background: "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(0,212,184,0.06) 0%, transparent 70%)",
    }}>
      <div style={{ width: "100%", maxWidth: 420, padding: "0 24px" }}>

        {/* Card */}
        <div className="card animate-fadeUp" style={{ padding: "40px 36px" }}>

          {/* Icon + title */}
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={{
              width: 64, height: 64, borderRadius: 16,
              background: "rgba(0,212,184,0.1)",
              border: "1px solid rgba(0,212,184,0.3)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 28, margin: "0 auto 16px",
            }}>
              🔐
            </div>
            <h1 style={{
              fontFamily: "var(--font-display)",
              fontSize: 28, letterSpacing: "-0.5px", marginBottom: 6,
            }}>
              Admin Login
            </h1>
            <p style={{ fontSize: 14, color: "var(--white-dim)" }}>
              Sign in with your Django superuser credentials
            </p>
          </div>

          {/* Error */}
          {error && <p className="error-msg" style={{ marginBottom: 16 }}>⚠ {error}</p>}

          {/* Fields */}
          <div className="field">
            <label>Username</label>
            <input
              type="text"
              placeholder="admin username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>

          <div className="field" style={{ marginBottom: 28 }}>
            <label>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>

          {/* Login button */}
          <button
            className="btn-find"
            onClick={handleLogin}
            disabled={loading}
            style={{ width: "100%", justifyContent: "center" }}
          >
            {loading
              ? <><span className="btn-find__spinner" /> Signing in...</>
              : "Sign In →"}
          </button>

          {/* Hint */}
          <p style={{ fontSize: 12, color: "var(--white-dim)", textAlign: "center", marginTop: 20 }}>
            Use the superuser account created via{" "}
            <code style={{ color: "var(--teal)", background: "rgba(0,212,184,0.1)", padding: "1px 6px", borderRadius: 4 }}>
              python manage.py createsuperuser
            </code>
          </p>
        </div>

        {/* Back link */}
        <p style={{ textAlign: "center", marginTop: 20, fontSize: 14, color: "var(--white-dim)" }}>
          <span
            style={{ color: "var(--teal)", cursor: "pointer" }}
            onClick={() => navigate("/")}
          >
            ← Back to Home
          </span>
        </p>
      </div>
    </div>
  );
}
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function AdminDashboard() {
  const navigate  = useNavigate();
  const adminName = localStorage.getItem("admin_name") || "Admin";
  const authToken = localStorage.getItem("admin_auth");

  const [users,    setUsers]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState("");
  const [search,   setSearch]   = useState("");
  const [expanded, setExpanded] = useState(null);

  // Guard — redirect if not logged in
  useEffect(() => {
    if (!authToken) {
      navigate("/admin-login");
      return;
    }
    fetchDashboard();
    // eslint-disable-next-line
  }, []);

  const fetchDashboard = async () => {
    setLoading(true);
    setError("");
    try {
      // ── FIX: send token in POST body instead of custom header ──
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/admin-dashboard/`,
        { token: "admin-authenticated" },
        { headers: { "Content-Type": "application/json" } }
      );
      setUsers(res.data.users || []);
    } catch (err) {
      console.error("Dashboard error:", err.response?.data || err.message);
      if (err.response?.status === 401) {
        setError("Session expired. Please log in again.");
        setTimeout(() => navigate("/admin-login"), 2000);
      } else {
        setError("Failed to load dashboard data.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_auth");
    localStorage.removeItem("admin_name");
    navigate("/admin-login");
  };

  const toggleExpand = (id) =>
    setExpanded((prev) => (prev === id ? null : id));

  const filtered = users.filter(
    (u) =>
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page">
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "48px 32px" }}>

        {/* ── Header ── */}
        <div style={{
          display: "flex", justifyContent: "space-between",
          alignItems: "flex-start", marginBottom: 40,
          flexWrap: "wrap", gap: 16,
        }}>
          <div>
            <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "var(--teal)", marginBottom: 8 }}>
              Admin Panel
            </p>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: 36, letterSpacing: "-0.5px", marginBottom: 6 }}>
              Dashboard
            </h1>
            <p style={{ fontSize: 15, color: "var(--white-dim)" }}>
              Welcome back,{" "}
              <span style={{ color: "var(--white)", fontWeight: 600 }}>{adminName}</span>
            </p>
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            <button
              onClick={fetchDashboard}
              style={{
                padding: "10px 20px", borderRadius: 8,
                background: "rgba(0,212,184,0.1)",
                border: "1px solid rgba(0,212,184,0.3)",
                color: "var(--teal)", fontSize: 14, fontWeight: 600,
                cursor: "pointer", fontFamily: "var(--font-body)",
              }}
            >
              ↻ Refresh
            </button>
            <button
              onClick={handleLogout}
              style={{
                padding: "10px 20px", borderRadius: 8,
                background: "transparent",
                border: "1.5px solid var(--border)",
                color: "var(--white-dim)", fontSize: 14,
                cursor: "pointer", fontFamily: "var(--font-body)",
              }}
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* ── Stats ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20, marginBottom: 36 }}>
          {[
            { icon: "👥", label: "Total Users",       value: users.length },
            { icon: "📄", label: "Total Resumes",     value: users.reduce((a, u) => a + u.total_uploads, 0) },
            { icon: "📊", label: "Avg Uploads / User", value: users.length ? (users.reduce((a, u) => a + u.total_uploads, 0) / users.length).toFixed(1) : 0 },
          ].map((s, i) => (
            <div key={i} className="card" style={{ padding: "24px 28px", marginBottom: 0 }}>
              <div style={{ fontSize: 28, marginBottom: 12 }}>{s.icon}</div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 32, color: "var(--teal)", marginBottom: 4 }}>
                {s.value}
              </div>
              <div style={{ fontSize: 13, color: "var(--white-dim)" }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* ── Search ── */}
        <div className="field" style={{ marginBottom: 24 }}>
          <input
            type="text"
            placeholder="🔍  Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ maxWidth: "100%", fontSize: 15 }}
          />
        </div>

        {/* ── Error ── */}
        {error && <p className="error-msg">⚠ {error}</p>}

        {/* ── Loading skeleton ── */}
        {loading && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {[1, 2, 3].map((n) => (
              <div key={n} style={{
                height: 80, borderRadius: 14,
                background: "linear-gradient(90deg, var(--navy-3) 25%, rgba(0,212,184,0.05) 50%, var(--navy-3) 75%)",
                backgroundSize: "200% 100%",
                animation: "shimmer 1.4s infinite",
                border: "1px solid var(--border)",
              }} />
            ))}
          </div>
        )}

        {/* ── User rows ── */}
        {!loading && filtered.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

            {/* Table header */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "2fr 2.5fr 1fr 1.8fr 24px",
              gap: 16, padding: "10px 20px",
              fontSize: 11, fontWeight: 700,
              letterSpacing: 1.5, textTransform: "uppercase",
              color: "var(--white-dim)",
            }}>
              <span>Name</span>
              <span>Email</span>
              <span>Uploads</span>
              <span>Joined</span>
              <span></span>
            </div>

            {filtered.map((user) => (
              <div key={user.id} className="card animate-fadeUp"
                style={{ padding: 0, overflow: "hidden", marginBottom: 0 }}>

                {/* Row */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "2fr 2.5fr 1fr 1.8fr 24px",
                    gap: 16, padding: "18px 20px",
                    alignItems: "center", cursor: "pointer",
                    transition: "background 0.2s",
                  }}
                  onClick={() => toggleExpand(user.id)}
                  onMouseOver={(e) => e.currentTarget.style.background = "rgba(0,212,184,0.04)"}
                  onMouseOut={(e)  => e.currentTarget.style.background = "transparent"}
                >
                  {/* Avatar + name */}
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: "50%",
                      background: "rgba(0,212,184,0.15)",
                      border: "1px solid rgba(0,212,184,0.3)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 14, fontWeight: 700, color: "var(--teal)", flexShrink: 0,
                    }}>
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <span style={{ fontSize: 15, fontWeight: 600 }}>{user.username}</span>
                  </div>

                  <span style={{ fontSize: 14, color: "var(--white-dim)" }}>{user.email}</span>

                  <span style={{
                    fontSize: 13, fontWeight: 600,
                    color: user.total_uploads > 0 ? "var(--teal)" : "var(--white-dim)",
                  }}>
                    📄 {user.total_uploads}
                  </span>

                  <span style={{ fontSize: 13, color: "var(--white-dim)" }}>{user.created_at}</span>

                  <span style={{
                    fontSize: 11, color: "var(--white-dim)",
                    display: "inline-block",
                    transition: "transform 0.2s",
                    transform: expanded === user.id ? "rotate(180deg)" : "rotate(0deg)",
                  }}>▼</span>
                </div>

                {/* ── Expanded resume details ── */}
                {expanded === user.id && (
                  <div style={{
                    borderTop: "1px solid var(--border)",
                    padding: "20px 24px",
                    background: "rgba(0,0,0,0.2)",
                  }}>
                    {user.resumes.length === 0 ? (
                      <p style={{ fontSize: 14, color: "var(--white-dim)", fontStyle: "italic" }}>
                        No resumes uploaded yet.
                      </p>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                        <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: "var(--teal)" }}>
                          Resume Uploads ({user.resumes.length})
                        </p>

                        {user.resumes.map((r) => (
                          <div key={r.id} style={{
                            padding: "16px 20px", borderRadius: 10,
                            background: "rgba(255,255,255,0.03)",
                            border: "1px solid var(--border)",
                          }}>
                            {/* File header */}
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                <span style={{ fontSize: 20 }}>📎</span>
                                <div>
                                  <p style={{ fontSize: 14, fontWeight: 600 }}>{r.filename}</p>
                                  <p style={{ fontSize: 12, color: "var(--white-dim)" }}>{r.uploaded_at}</p>
                                </div>
                              </div>
                              {r.experience_level && (
                                <span style={{
                                  padding: "3px 12px", borderRadius: 100,
                                  background: "rgba(0,212,184,0.1)",
                                  border: "1px solid rgba(0,212,184,0.3)",
                                  fontSize: 11, fontWeight: 600, color: "var(--teal)",
                                }}>
                                  {r.experience_level}
                                </span>
                              )}
                            </div>

                            {/* Skills */}
                            {r.skills && (
                              <div style={{ marginBottom: 14 }}>
                                <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: "var(--white-dim)", marginBottom: 8 }}>
                                  Skills Extracted
                                </p>
                                <div className="tags">
                                  {r.skills.split("\n").filter(Boolean).map((s, j) => (
                                    <span key={j} className="tag" style={{ fontSize: 11 }}>{s}</span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Suggested roles */}
                            {r.suggested_roles && (
                              <div>
                                <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: "var(--white-dim)", marginBottom: 8 }}>
                                  Suggested Roles
                                </p>
                                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                                  {r.suggested_roles.split("\n").filter(Boolean).map((role, j) => (
                                    <span key={j} style={{
                                      padding: "4px 12px", borderRadius: 100,
                                      background: "rgba(255,255,255,0.05)",
                                      border: "1px solid var(--border)",
                                      fontSize: 12, color: "var(--white)",
                                    }}>
                                      {role}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── Empty state ── */}
        {!loading && !error && filtered.length === 0 && (
          <div style={{
            textAlign: "center", padding: "64px 32px",
            background: "var(--card-bg)", borderRadius: 16,
            border: "1px solid var(--border)",
          }}>
            <p style={{ fontSize: 48, marginBottom: 16 }}>👥</p>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: 24, marginBottom: 10 }}>
              {search ? "No users match your search" : "No users yet"}
            </h3>
            <p style={{ color: "var(--white-dim)", fontSize: 15 }}>
              {search
                ? "Try a different name or email."
                : "Users will appear here once they upload resumes."}
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
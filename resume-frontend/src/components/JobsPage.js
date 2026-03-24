import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

const EXPERIENCE_LEVELS = [
  { label: "Fresher (0-1 years)",   emoji: "🌱" },
  { label: "Junior (1-3 years)",    emoji: "🚀" },
  { label: "Mid-level (3-5 years)", emoji: "💼" },
  { label: "Senior (5+ years)",     emoji: "🏆" },
];

export default function JobsPage() {
  const location = useLocation();
  const navigate = useNavigate();

  // Data passed from UploadResume page
  const {
    selectedRoles    = [],
    selectedExperience = "",
    skills           = [],
    username         = "",
  } = location.state || {};

  // If someone navigates directly without state, send them back
  useEffect(() => {
    if (!selectedRoles.length) navigate("/upload");
  }, [selectedRoles, navigate]);

  // Active filter state (can change experience on this page)
  const [activeExp,  setActiveExp]  = useState(selectedExperience);
  const [activeRoles, setActiveRoles] = useState(selectedRoles);
  const [jobs, setJobs]             = useState([]);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState("");
  const [fetched, setFetched]       = useState(false);

  const fetchJobs = async (roles, experience) => {
    setLoading(true);
    setError("");
    setFetched(false);
    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/jobs/`,
        { roles, location: "India", experience },
        { headers: { "Content-Type": "application/json" } }
      );
      setJobs(res.data.jobs || []);
      setFetched(true);
    } catch {
      setError("Failed to fetch jobs. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Auto-fetch whenever activeExp or activeRoles changes
  useEffect(() => {
    if (activeRoles.length && activeExp) {
      fetchJobs(activeRoles, activeExp);
    }
  // eslint-disable-next-line
  }, [activeExp, activeRoles]);

  const toggleRole = (role) => {
    setActiveRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  };

  return (
    <div className="page">
      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "48px 32px", display: "grid", gridTemplateColumns: "260px 1fr", gap: 32, alignItems: "start" }}>

        {/* ── Sidebar filters ── */}
        <aside style={{ position: "sticky", top: 88 }}>

          {/* Greeting */}
          {username && (
            <div style={{ marginBottom: 24 }}>
              <p style={{ fontSize: 13, color: "var(--white-dim)" }}>Results for</p>
              <p style={{ fontSize: 17, fontWeight: 700, color: "var(--teal)" }}>
                {username}
              </p>
            </div>
          )}

          {/* Skills summary */}
          {skills.length > 0 && (
            <div className="card" style={{ marginBottom: 20, padding: "20px 20px" }}>
              <div className="card__title" style={{ fontSize: 14 }}>📋 Your Skills</div>
              <div className="tags" style={{ marginTop: 12 }}>
                {skills.slice(0, 8).map((s, i) => (
                  <span key={i} className="tag" style={{ fontSize: 11 }}>{s}</span>
                ))}
                {skills.length > 8 && (
                  <span className="tag" style={{ fontSize: 11, background: "rgba(255,255,255,0.05)", color: "var(--white-dim)", border: "1px solid var(--border)" }}>
                    +{skills.length - 8} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Experience filter */}
          <div className="card" style={{ marginBottom: 20, padding: "20px 20px" }}>
            <div className="card__title" style={{ fontSize: 14, marginBottom: 4 }}>🎓 Experience</div>
            <div className="card__sub" style={{ fontSize: 12, marginBottom: 14 }}>Filter by level</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {EXPERIENCE_LEVELS.map(({ label, emoji }) => (
                <button
                  key={label}
                  onClick={() => setActiveExp(label)}
                  style={{
                    padding: "10px 12px",
                    borderRadius: 8, cursor: "pointer",
                    display: "flex", alignItems: "center", gap: 8,
                    background: activeExp === label ? "rgba(0,212,184,0.1)" : "transparent",
                    border: activeExp === label ? "1.5px solid var(--teal)" : "1.5px solid var(--border)",
                    color: activeExp === label ? "var(--white)" : "var(--white-dim)",
                    fontSize: 13, fontWeight: activeExp === label ? 600 : 400,
                    fontFamily: "var(--font-body)",
                    transition: "all 0.2s ease", textAlign: "left",
                  }}
                >
                  <span style={{ fontSize: 16 }}>{emoji}</span>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Roles filter */}
          <div className="card" style={{ marginBottom: 20, padding: "20px 20px" }}>
            <div className="card__title" style={{ fontSize: 14, marginBottom: 4 }}>🎯 Roles</div>
            <div className="card__sub" style={{ fontSize: 12, marginBottom: 14 }}>Toggle roles to filter</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {selectedRoles.map((role, i) => {
                const active = activeRoles.includes(role);
                return (
                  <button
                    key={i}
                    onClick={() => toggleRole(role)}
                    style={{
                      padding: "9px 12px",
                      borderRadius: 8, cursor: "pointer",
                      display: "flex", alignItems: "center", gap: 8,
                      background: active ? "rgba(0,212,184,0.1)" : "transparent",
                      border: active ? "1.5px solid var(--teal)" : "1.5px solid var(--border)",
                      color: active ? "var(--white)" : "var(--white-dim)",
                      fontSize: 13, fontWeight: active ? 600 : 400,
                      fontFamily: "var(--font-body)",
                      transition: "all 0.2s ease", textAlign: "left",
                    }}
                  >
                    <span style={{
                      width: 8, height: 8, borderRadius: "50%", flexShrink: 0,
                      background: active ? "var(--teal)" : "var(--border)",
                    }} />
                    {role}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Auto-updating indicator */}
          {loading && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 0", fontSize: 13, color: "var(--teal)" }}>
              <span className="btn-find__spinner" style={{ borderTopColor: "var(--teal)", borderColor: "rgba(0,212,184,0.2)" }} />
              Updating results...
            </div>
          )}


          {/* Back button */}
          <button
            onClick={() => navigate("/upload")}
            style={{
              width: "100%", marginTop: 12,
              padding: "11px", borderRadius: 8,
              background: "transparent",
              border: "1.5px solid var(--border)",
              color: "var(--white-dim)", fontSize: 13,
              fontFamily: "var(--font-body)", cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onMouseOver={(e) => e.currentTarget.style.borderColor = "var(--teal)"}
            onMouseOut={(e)  => e.currentTarget.style.borderColor = "var(--border)"}
          >
            ← Back to Analyzer
          </button>
        </aside>

        {/* ── Main results ── */}
        <main>
          {/* Header */}
          <div style={{ marginBottom: 32 }}>
            <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "var(--teal)", marginBottom: 8 }}>
              Job Matches
            </p>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: 36, letterSpacing: "-0.5px", marginBottom: 8 }}>
              Openings for You
            </h1>
            <p style={{ fontSize: 15, color: "var(--white-dim)" }}>
              {fetched
                ? `${jobs.length} job${jobs.length !== 1 ? "s" : ""} found · ${activeExp}`
                : "Finding the best matches for your profile..."}
            </p>
          </div>

          {/* Active filters pills */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 28 }}>
            <span style={{
              padding: "4px 12px", borderRadius: 100,
              background: "rgba(0,212,184,0.1)",
              border: "1px solid rgba(0,212,184,0.3)",
              fontSize: 12, color: "var(--teal)", fontWeight: 600,
            }}>
              {activeExp}
            </span>
            {activeRoles.map((r, i) => (
              <span key={i} style={{
                padding: "4px 12px", borderRadius: 100,
                background: "rgba(255,255,255,0.05)",
                border: "1px solid var(--border)",
                fontSize: 12, color: "var(--white-dim)",
              }}>
                {r}
              </span>
            ))}
          </div>

          {/* Error */}
          {error && <p className="error-msg">⚠ {error}</p>}

          {/* Loading skeleton */}
          {loading && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {[1, 2, 3, 4].map((n) => (
                <div key={n} style={{
                  height: 140, borderRadius: 14,
                  background: "linear-gradient(90deg, var(--navy-3) 25%, rgba(0,212,184,0.05) 50%, var(--navy-3) 75%)",
                  backgroundSize: "200% 100%",
                  animation: "shimmer 1.4s infinite",
                  border: "1px solid var(--border)",
                }} />
              ))}
            </div>
          )}

          {/* Job cards */}
          {!loading && fetched && jobs.length > 0 && (
            <div className="job-grid">
              {jobs.map((job, i) => (
                <div
                  key={job.id || i}
                  className="job-card animate-fadeUp"
                  style={{ animationDelay: `${i * 0.07}s`, opacity: 0 }}
                >
                  <div className="job-card__header">
                    <span className="job-card__title">{job.title}</span>
                    <span className="job-card__badge">{job.experience}</span>
                  </div>
                  <p className="job-card__company">{job.company} · {job.location}</p>
                  <p className="job-card__type">{job.type}</p>
                  {job.description && (
                    <p className="job-card__desc">{job.description}</p>
                  )}
                  <a
                    href={job.link}
                    target="_blank"
                    rel="noreferrer"
                    className="job-card__link"
                  >
                    View & Apply →
                  </a>
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!loading && fetched && jobs.length === 0 && (
            <div style={{
              textAlign: "center", padding: "64px 32px",
              background: "var(--card-bg)", borderRadius: 16,
              border: "1px solid var(--border)",
            }}>
              <p style={{ fontSize: 48, marginBottom: 16 }}>🔍</p>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: 24, marginBottom: 10 }}>
                No Jobs Found
              </h3>
              <p style={{ color: "var(--white-dim)", fontSize: 15, marginBottom: 28 }}>
                Try changing the experience level or selecting different roles in the filters.
              </p>
              <button className="btn-primary" onClick={() => navigate("/upload")}>
                Try Different Roles →
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
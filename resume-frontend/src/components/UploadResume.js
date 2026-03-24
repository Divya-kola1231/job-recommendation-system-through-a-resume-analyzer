import React, { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const EXPERIENCE_LEVELS = [
  { label: "Fresher (0-1 years)",   emoji: "🌱" },
  { label: "Junior (1-3 years)",    emoji: "🚀" },
  { label: "Mid-level (3-5 years)", emoji: "💼" },
  { label: "Senior (5+ years)",     emoji: "🏆" },
];

function StepBar({ current }) {
  const steps = ["Upload Resume", "Select Roles", "Job Matches"];
  return (
    <div className="steps">
      {steps.map((label, i) => {
        const num   = i + 1;
        const state = num < current ? "done" : num === current ? "active" : "";
        return (
          <React.Fragment key={i}>
            <div className={`step ${state}`}>
              <div className="step__circle">
                {num < current ? "✓" : num}
              </div>
              <span className="step__label">{label}</span>
            </div>
            {i < steps.length - 1 && (
              <div className={`step__line ${num < current ? "done" : ""}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

export default function UploadResume() {
  const navigate = useNavigate();

  // User info
  const [username, setUsername] = useState("");
  const [email, setEmail]       = useState("");

  // File
  const [resume, setResume]     = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef            = useRef(null);

  // Data
  const [skills, setSkills]                   = useState([]);
  const [suggestedRoles, setSuggestedRoles]   = useState([]);
  const [selectedRoles, setSelectedRoles]     = useState([]);
  const [selectedExperience, setSelectedExperience] = useState("");

  // UI
  const [step, setStep]       = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [savedMsg, setSavedMsg] = useState("");

  // ── Drag & Drop ────────────────────────────────────────────────────────────
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && (file.name.endsWith(".pdf") || file.name.endsWith(".docx"))) {
      setResume(file);
      setError("");
    } else {
      setError("Please drop a PDF or DOCX file.");
    }
  }, []);

  const handleDragOver  = (e) => { e.preventDefault(); setDragOver(true); };
  const handleDragLeave = ()  => setDragOver(false);
  const handleFileChange = (e) => { if (e.target.files[0]) setResume(e.target.files[0]); };

  const formatSize = (bytes) => {
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  // ── Step 1: Analyze resume ─────────────────────────────────────────────────
  const handleAnalyze = async () => {
    if (!username.trim()) { setError("Please enter your name."); return; }
    if (!email.trim())    { setError("Please enter your email."); return; }
    if (!resume)          { setError("Please upload your resume."); return; }

    setError(""); setSavedMsg(""); setLoading(true);

    try {
      const formData = new FormData();
      formData.append("resume", resume);
      formData.append("username", username.trim());
      formData.append("email", email.trim());

      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/analyze/`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      const raw    = res.data.analysis || "";
      const parsed = raw.split("\n").map((s) => s.trim()).filter(Boolean);
      setSkills(parsed);
      setSuggestedRoles(res.data.suggested_roles || []);
      setSavedMsg("✅ Resume saved to your profile!");
      setStep(2);
    } catch {
      setError("Failed to analyze resume. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Skill add / remove ───────────────────────────────────────────────────
  const [newSkill, setNewSkill] = useState("");

  const handleAddSkill = () => {
    const trimmed = newSkill.trim();
    if (!trimmed) return;
    if (skills.map((s) => s.toLowerCase()).includes(trimmed.toLowerCase())) return;
    setSkills((prev) => [...prev, trimmed]);
    setNewSkill("");
  };

  const handleRemoveSkill = (index) => {
    setSkills((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSkillKeyDown = (e) => {
    if (e.key === "Enter") handleAddSkill();
  };

  // ── Toggle role ────────────────────────────────────────────────────────────
  const toggleRole = (role) =>
    setSelectedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );

  const canProceed = selectedRoles.length > 0 && selectedExperience !== "";

  // ── Step 2: Go to Jobs page ─────────────────────────────────────────────────
  const handleFindJobs = () => {
    if (!canProceed) {
      setError("Please select at least one role and an experience level.");
      return;
    }
    // Pass all data via router state to JobsPage
    navigate("/jobs", {
      state: {
        selectedRoles,
        selectedExperience,
        skills,
        username,
      },
    });
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="page">
      <div className="upload-page">

        <div className="upload-page__header animate-fadeUp">
          <h1 className="upload-page__title">
            Analyze Your <span>Resume</span>
          </h1>
          <p className="upload-page__sub">
            Upload your resume, pick your roles and experience level, then see live job matches.
          </p>
        </div>

        <StepBar current={step} />

        {error && <p className="error-msg">⚠ {error}</p>}

        {/* ── STEP 1: Details + Upload ── */}
        <div className="card animate-fadeUp">
          <div className="card__title">👤 Your Details</div>
          <div className="card__sub">Enter your name and email before we analyze.</div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
            <div className="field">
              <label>Full Name</label>
              <input
                type="text"
                placeholder="e.g. Divya Kola"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={step > 1}
              />
            </div>
            <div className="field">
              <label>Email Address</label>
              <input
                type="email"
                placeholder="e.g. divya@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={step > 1}
              />
            </div>
          </div>

          {/* Drag & Drop */}
          {step === 1 && (
            <>
              <div
                className={`dropzone ${dragOver ? "drag-over" : ""}`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
              >
                <input ref={fileInputRef} type="file" accept=".pdf,.docx" onChange={handleFileChange} />
                {!resume ? (
                  <>
                    <span className="dropzone__icon">📄</span>
                    <p className="dropzone__title">Drag & drop your resume here</p>
                    <p className="dropzone__sub">Supports PDF and DOCX · Max 5MB</p>
                    <span className="dropzone__btn">📁 Browse Files</span>
                  </>
                ) : (
                  <>
                    <span className="dropzone__icon">✅</span>
                    <p className="dropzone__title">File ready to analyze!</p>
                    <div className="dropzone__file" onClick={(e) => e.stopPropagation()}>
                      <span>📎</span>
                      <span className="dropzone__file-name">{resume.name}</span>
                      <span className="dropzone__file-size">{formatSize(resume.size)}</span>
                      <span
                        style={{ marginLeft: "auto", cursor: "pointer", color: "var(--white-dim)", fontSize: 12 }}
                        onClick={(e) => { e.stopPropagation(); setResume(null); }}
                      >
                        ✕ Remove
                      </span>
                    </div>
                  </>
                )}
              </div>

              <div className="action-bar">
                <button className="btn-find" onClick={handleAnalyze} disabled={loading}>
                  {loading
                    ? <><span className="btn-find__spinner" /> Analyzing...</>
                    : "Analyze Resume →"}
                </button>
              </div>
            </>
          )}

          {step > 1 && savedMsg && <p className="success-msg">{savedMsg}</p>}
        </div>

        {/* ── STEP 2: Skills + Roles + Experience ── */}
        {step >= 2 && (
          <>
            {/* Skills */}
            <div className="card animate-fadeUp">
              <div className="card__title">📋 Skills Extracted</div>
              <div className="card__sub">
                {skills.length} skills found · click ✕ to remove, or add your own below.
              </div>

              {/* Skill tags with remove button */}
              <div className="tags" style={{ marginBottom: 20 }}>
                {skills.map((s, i) => (
                  <span key={i} style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    padding: "5px 10px 5px 14px",
                    background: "rgba(0,212,184,0.1)",
                    border: "1px solid rgba(0,212,184,0.25)",
                    borderRadius: 100, fontSize: 13, color: "var(--teal)",
                  }}>
                    {s}
                    <button
                      onClick={() => handleRemoveSkill(i)}
                      title="Remove skill"
                      style={{
                        background: "rgba(0,212,184,0.2)", border: "none",
                        borderRadius: "50%", width: 18, height: 18,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        cursor: "pointer", color: "var(--teal)",
                        fontSize: 10, fontWeight: 700, lineHeight: 1,
                        flexShrink: 0, transition: "background 0.15s",
                      }}
                      onMouseOver={(e) => e.currentTarget.style.background = "rgba(248,113,113,0.3)"}
                      onMouseOut={(e)  => e.currentTarget.style.background = "rgba(0,212,184,0.2)"}
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>

              {/* Add custom skill */}
              <div style={{
                display: "flex", gap: 10, alignItems: "center",
                padding: "14px 16px",
                background: "rgba(255,255,255,0.02)",
                border: "1.5px dashed var(--border)",
                borderRadius: 10,
              }}>
                <span style={{ fontSize: 16 }}>➕</span>
                <input
                  type="text"
                  placeholder="Add a skill (e.g. Docker, Figma)..."
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={handleSkillKeyDown}
                  style={{
                    flex: 1, background: "transparent", border: "none",
                    outline: "none", fontSize: 14, color: "var(--white)",
                    fontFamily: "var(--font-body)",
                  }}
                />
                <button
                  onClick={handleAddSkill}
                  disabled={!newSkill.trim()}
                  style={{
                    padding: "7px 16px", borderRadius: 8,
                    background: newSkill.trim() ? "var(--teal)" : "rgba(255,255,255,0.05)",
                    color: newSkill.trim() ? "var(--navy)" : "var(--white-dim)",
                    border: "none", cursor: newSkill.trim() ? "pointer" : "not-allowed",
                    fontSize: 13, fontWeight: 700,
                    fontFamily: "var(--font-body)",
                    transition: "all 0.15s ease",
                  }}
                >
                  Add
                </button>
              </div>
            </div>

            {/* Roles */}
            <div className="card animate-fadeUp">
              <div className="card__title">✅ Suggested Roles</div>
              <div className="card__sub">Select the roles you want to explore.</div>
              <div className="role-list">
                {suggestedRoles.map((role, i) => {
                  const checked = selectedRoles.includes(role);
                  return (
                    <div
                      key={i}
                      className={`role-item ${checked ? "checked" : ""}`}
                      onClick={() => toggleRole(role)}
                    >
                      <div className="role-item__check">
                        {checked && (
                          <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                            <path d="M2 6l3 3 5-5" stroke="var(--navy)" strokeWidth="2.5"
                              strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </div>
                      <span className="role-item__label">{role}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Experience */}
            <div className="card animate-fadeUp">
              <div className="card__title">🎓 Experience Level</div>
              <div className="card__sub">Filter jobs by your experience level.</div>
              <div className="exp-grid">
                {EXPERIENCE_LEVELS.map(({ label, emoji }) => (
                  <button
                    key={label}
                    className={`exp-btn ${selectedExperience === label ? "selected" : ""}`}
                    onClick={() => setSelectedExperience(label)}
                  >
                    <span className="exp-btn__emoji">{emoji}</span>
                    {label}
                  </button>
                ))}
              </div>

              {selectedRoles.length > 0 && !selectedExperience && (
                <p className="hint">⚠ Please also select an experience level.</p>
              )}
              {selectedRoles.length === 0 && selectedExperience && (
                <p className="hint">⚠ Please also select at least one role.</p>
              )}

              <div className="action-bar">
                <button
                  className="btn-find"
                  onClick={handleFindJobs}
                  disabled={!canProceed}
                >
                  Find Matching Jobs →
                </button>
                {canProceed && (
                  <span className="action-summary">
                    {selectedRoles.length} role{selectedRoles.length > 1 ? "s" : ""} · {selectedExperience}
                  </span>
                )}
              </div>
            </div>
          </>
        )}

      </div>
    </div>
  );
}
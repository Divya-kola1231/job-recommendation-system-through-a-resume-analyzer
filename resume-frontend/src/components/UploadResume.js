import React, { useState } from "react";
import axios from "axios";

const ROLE_INTERESTS = [
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "Data Scientist",
  "Machine Learning Engineer",
  "DevOps Engineer",
  "Cloud Engineer",
  "Mobile Developer",
  "UI/UX Designer",
  "Product Manager",
  "Cybersecurity Analyst",
  "Data Analyst",
];

function UploadResume() {
  const [resume, setResume] = useState(null);
  const [skills, setSkills] = useState([]);
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [suggestedRoles, setSuggestedRoles] = useState([]);
  const [matchingJobs, setMatchingJobs] = useState([]);
  const [loadingSkills, setLoadingSkills] = useState(false);
  const [loadingRoles, setLoadingRoles] = useState(false);
  const [error, setError] = useState("");

  // Step 1: Extract skills
  const handleAnalyze = async () => {
    if (!resume) { setError("Please select a resume file."); return; }
    setError("");
    setSkills([]);
    setSuggestedRoles([]);
    setSelectedInterests([]);
    setMatchingJobs([]);
    setLoadingSkills(true);
    try {
      const formData = new FormData();
      formData.append("resume", resume);
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/analyze/`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      const raw = response.data.analysis || "";
      const parsed = raw.split("\n").map((s) => s.trim()).filter((s) => s.length > 0);
      setSkills(parsed);
    } catch {
      setError("Failed to analyze resume. Please try again.");
    } finally {
      setLoadingSkills(false);
    }
  };

  // Step 2: Toggle interest
  const toggleInterest = (role) => {
    setSelectedInterests((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  };

  // Step 3: Get role suggestions + match jobs
  const handleSuggestRoles = async () => {
    if (selectedInterests.length === 0) { setError("Please select at least one interest."); return; }
    setError("");
    setSuggestedRoles([]);
    setMatchingJobs([]);
    setLoadingRoles(true);
    try {
      // 1. Get role suggestions
      const responseRoles = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/suggest-roles/`,
        { skills, interests: selectedInterests },
        { headers: { "Content-Type": "application/json" } }
      );
      const roles = responseRoles.data.roles || [];
      setSuggestedRoles(roles);

      // 2. Fetch live job openings
      if (roles.length > 0) {
        const responseJobs = await axios.post(
          `${process.env.REACT_APP_API_URL}/api/jobs/`,
          { roles: roles.slice(0, 3), location: "India" }, // search top 3 roles
          { headers: { "Content-Type": "application/json" } }
        );
        setMatchingJobs(responseJobs.data.jobs || []);
      }
    } catch {
      setError("Failed to get role suggestions or jobs. Please try again.");
    } finally {
      setLoadingRoles(false);
    }
  };

  return (
    <div style={{ maxWidth: 660, margin: "40px auto", fontFamily: "sans-serif", padding: "0 20px" }}>
      <h2>📄 Resume Analyzer</h2>

      {/* Step 1 */}
      <div style={{ marginBottom: 20 }}>
        <input type="file" accept=".pdf,.docx" onChange={(e) => setResume(e.target.files[0])} />
        <button onClick={handleAnalyze} disabled={loadingSkills} style={btnStyle("#1565c0")}>
          {loadingSkills ? "Extracting..." : "Analyze Resume"}
        </button>
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* Skills */}
      {skills.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <h3>📋 Skills Found</h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {skills.map((skill, i) => (
              <span key={i} style={tagStyle}>{skill}</span>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Role Interests */}
      {skills.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <h3>🎯 Select Your Role Interests</h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {ROLE_INTERESTS.map((role) => {
              const selected = selectedInterests.includes(role);
              return (
                <button key={role} onClick={() => toggleInterest(role)} style={{
                  padding: "6px 14px", borderRadius: 20, cursor: "pointer", fontSize: 14,
                  border: selected ? "2px solid #1565c0" : "1px solid #ccc",
                  background: selected ? "#1565c0" : "#fff",
                  color: selected ? "#fff" : "#333",
                }}>
                  {selected ? "✓ " : ""}{role}
                </button>
              );
            })}
          </div>
          {selectedInterests.length > 0 && (
            <button onClick={handleSuggestRoles} disabled={loadingRoles} style={{ ...btnStyle("#2e7d32"), marginTop: 16 }}>
              {loadingRoles ? "Suggesting..." : "Get Role Suggestions →"}
            </button>
          )}
        </div>
      )}

      {/* Step 3: Suggested Roles */}
      {suggestedRoles.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <h3>✅ Suggested Roles for You</h3>
          <ul style={{ paddingLeft: 20 }}>
            {suggestedRoles.map((role, i) => (
              <li key={i} style={{ marginBottom: 6, fontSize: 15 }}>{role}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Step 4: Job Openings */}
      {matchingJobs.length > 0 && (
        <div>
          <h3>💼 Job Openings for You</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {matchingJobs.map((job) => (
              <div key={job.id} style={cardStyle}>
                <div style={{ fontWeight: "bold", fontSize: 16 }}>{job.title}</div>
                <div style={{ color: "#555", fontSize: 14 }}>{job.company} · {job.location}</div>
                <div style={{ fontSize: 13, color: "#888" }}>{job.type}</div>
                <a href={job.link} target="_blank" rel="noreferrer" style={{ marginTop: 6, display: "inline-block", color: "#1565c0", fontSize: 14 }}>
                  View & Apply →
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const btnStyle = (bg) => ({
  marginLeft: 10, padding: "8px 20px", background: bg,
  color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 14,
});

const tagStyle = {
  background: "#e3f2fd", border: "1px solid #90caf9",
  borderRadius: 16, padding: "4px 12px", fontSize: 13,
};

const cardStyle = {
  border: "1px solid #e0e0e0", borderRadius: 10,
  padding: "14px 16px", background: "#fafafa",
};

export default UploadResume;
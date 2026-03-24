import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const PROCESS_STEPS = [
  {
    num: "1",
    step: "Step One",
    name: "Upload Your Resume",
    text: "Drag and drop your PDF or DOCX resume. Our parser instantly reads every line — experience, education, projects, and skills.",
  },
  {
    num: "2",
    step: "Step Two",
    name: "AI Skill Extraction",
    text: "Gemini AI scans your resume and extracts all technical and soft skills automatically. No manual input needed.",
  },
  {
    num: "3",
    step: "Step Three",
    name: "Role Suggestions",
    text: "Based on your skills, the AI recommends the most suitable job roles tailored specifically to your profile.",
  },
  {
    num: "4",
    step: "Step Four",
    name: "Select & Filter",
    text: "Pick the roles you're interested in and choose your experience level — fresher to senior.",
  },
  {
    num: "5",
    step: "Step Five",
    name: "Live Job Openings",
    text: "We fetch real-time job listings from across India matching your selected roles and experience level.",
  },
];

const FEATURES = [
  { icon: "🧠", title: "AI-Powered Analysis", text: "Powered by Google Gemini, your resume is analyzed with the same intelligence as a senior recruiter." },
  { icon: "⚡", title: "Instant Results", text: "Skills extracted and roles suggested in seconds. No waiting, no manual forms." },
  { icon: "🎯", title: "Precision Matching", text: "Jobs are filtered by your exact role preferences and experience level for maximum relevance." },
  { icon: "🌐", title: "Live Job Feed", text: "Real-time listings pulled from JSearch API — always up to date, never stale." },
  { icon: "🔒", title: "Secure Storage", text: "Your data is stored securely in Supabase PostgreSQL. Accessible only to you and admins." },
  { icon: "📊", title: "Admin Dashboard", text: "Full Django admin panel to manage user profiles, resumes, and analytics." },
];

export default function HomePage() {
  const navigate   = useNavigate();
  const processRef = useRef(null);

  // Scroll-triggered animation for process items
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-fadeUp");
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.15 }
    );

    const items = document.querySelectorAll(".process__item, .feature-card, .stats__item");
    items.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="page">

      {/* ── Hero ── */}
      <section className="hero">
        <div className="hero__bg" />
        <div className="hero__grid" />

        <div className="hero__content">
          <div className="animate-fadeUp delay-1 hero__badge">
            <span className="hero__badge-dot" />
            AI-Powered Job Matching
          </div>

          <h1 className="animate-fadeUp delay-2 hero__title">
            Your Resume,<br />
            <em>Smarter</em> Job Matches.
          </h1>

          <p className="animate-fadeUp delay-3 hero__desc">
            Upload your resume and let AI extract your skills, suggest the best-fit roles,
            and surface real job openings — all in under 30 seconds.
          </p>

          <div className="animate-fadeUp delay-4 hero__actions">
            <button className="btn-primary" onClick={() => navigate("/upload")}>
              Analyze My Resume →
            </button>
            <button className="btn-secondary" onClick={() => {
              document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" });
            }}>
              How it works
            </button>
          </div>
        </div>

        {/* Floating preview card */}
        <div className="hero__visual animate-fadeIn delay-5">
          <div className="hero__card">
            <p className="hero__card-title">✨ Skills extracted from resume</p>
            <div className="hero__skill-tags">
              {["React", "Python", "Django", "SQL", "MongoDB", "Git", "REST API"].map((s) => (
                <span key={s} className="hero__skill-tag">{s}</span>
              ))}
            </div>
            <p className="hero__card-title" style={{ marginBottom: 12 }}>🎯 Suggested roles</p>
            {["Full Stack Developer", "Backend Engineer", "Software Developer"].map((r) => (
              <div key={r} className="hero__role-item">
                <span className="hero__role-dot" />
                {r}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <div className="stats">
        {[
          { num: "10K+", label: "Resumes Analyzed" },
          { num: "95%",  label: "Match Accuracy" },
          { num: "500+", label: "Job Roles Covered" },
          { num: "< 30s", label: "Average Analysis Time" },
        ].map((s) => (
          <div key={s.label} className="stats__item">
            <span className="stats__num">{s.num}</span>
            <span className="stats__label">{s.label}</span>
          </div>
        ))}
      </div>

      {/* ── How It Works (Process Tree) ── */}
      <section className="section" id="how-it-works">
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <p className="section__label">The Process</p>
          <h2 className="section__title">How ResumeAI Works</h2>
          <p className="section__desc" style={{ margin: "0 auto" }}>
            From resume upload to real job matches — five steps, fully automated.
          </p>
        </div>

        <div className="process" ref={processRef}>
          {PROCESS_STEPS.map((step, i) => (
            <div key={i} className="process__item">
              <div className="process__node">{step.num}</div>
              <div className="process__body">
                <p className="process__step">{step.step}</p>
                <h3 className="process__name">{step.name}</h3>
                <p className="process__text">{step.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section className="section section--alt">
        <p className="section__label">Why ResumeAI</p>
        <h2 className="section__title">Everything You Need</h2>
        <p className="section__desc">
          Built for students, freshers, and professionals looking for their next opportunity.
        </p>

        <div className="features">
          {FEATURES.map((f, i) => (
            <div key={i} className="feature-card">
              <div className="feature-card__icon">{f.icon}</div>
              <h3 className="feature-card__title">{f.title}</h3>
              <p className="feature-card__text">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="section" style={{ textAlign: "center" }}>
        <p className="section__label">Get Started</p>
        <h2 className="section__title">Ready to find your<br /><em style={{ fontStyle:"italic", color:"var(--teal)" }}>dream job?</em></h2>
        <p className="section__desc" style={{ margin: "0 auto 40px" }}>
          Upload your resume now and get matched with real job openings in seconds.
        </p>
        <button className="btn-primary" style={{ fontSize: 16, padding: "16px 40px" }} onClick={() => navigate("/upload")}>
          Start Analyzing →
        </button>
      </section>

      {/* ── Footer ── */}
      <footer className="footer">
        <span className="footer__brand">ResumeAI</span>
        <span className="footer__text">© 2026.DivyaKola</span>
      </footer>
    </div>
  );
}
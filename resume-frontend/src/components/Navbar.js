import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function Navbar() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const isAdmin   = location.pathname.startsWith("/admin");
  const adminName = localStorage.getItem("admin_name");

  const handleAdminLogout = () => {
    localStorage.removeItem("admin_auth");
    localStorage.removeItem("admin_name");
    navigate("/admin-login");
  };

  return (
    <nav className="navbar">
      {/* Logo */}
      <div
        className="navbar__logo"
        onClick={() => navigate("/")}
        style={{ cursor: "pointer" }}
      >
        Resume<span>AI</span>
      </div>

      {/* Links */}
      <div className="navbar__links">
        {/* Hide public links on admin pages */}
        {!isAdmin && (
          <>
            <button
              className={`navbar__link ${location.pathname === "/" ? "active" : ""}`}
              onClick={() => navigate("/")}
            >
              Home
            </button>
            <button
              className={`navbar__link ${location.pathname === "/upload" ? "active" : ""}`}
              onClick={() => navigate("/upload")}
            >
              Analyzer
            </button>
          </>
        )}

        {/* Show admin name + logout if logged in */}
        {isAdmin && adminName ? (
          <>
            <span style={{ fontSize: 13, color: "var(--white-dim)", padding: "8px 12px" }}>
              👤 {adminName}
            </span>
            <button className="navbar__link" onClick={handleAdminLogout}>
              Sign Out
            </button>
          </>
        ) : (
          <>
            {/* Admin login link — subtle, for non-admin pages */}
            {!isAdmin && (
              <button
                className="navbar__link"
                onClick={() => navigate("/admin-login")}
                style={{ fontSize: 13 }}
              >
                Admin
              </button>
            )}
            {/* CTA */}
            {!isAdmin && (
              <button className="navbar__cta" onClick={() => navigate("/upload")}>
                Get Started →
              </button>
            )}
          </>
        )}
      </div>
    </nav>
  );
}
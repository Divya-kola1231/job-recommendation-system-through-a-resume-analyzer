import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";

import Navbar          from "./components/Navbar";
import HomePage        from "./components/HomePage";
import UploadResume    from "./components/UploadResume";
import JobsPage        from "./components/JobsPage";
import AdminLogin      from "./components/AdminLogin";
import AdminDashboard  from "./components/admindashboard";

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        {/* Public routes */}
        <Route path="/"               element={<HomePage />} />
        <Route path="/upload"         element={<UploadResume />} />
        <Route path="/jobs"           element={<JobsPage />} />

        {/* Admin routes */}
        <Route path="/admin-login"    element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />

        {/* Catch-all */}
        <Route path="*"               element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
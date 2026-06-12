import React, { useState, useEffect, useContext } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { AuthContext } from "./AuthContext";
import API from "./api";
import jsPDF from "jspdf";
import {
  Upload,
  Briefcase,
  User as UserIcon,
  LogOut,
  Plus,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  MapPin,
  DollarSign,
  Star,
  Settings,
  Eye,
  EyeOff,
  LayoutDashboard,
  History,
  Sparkles,
  Download,
  Trash2,
  Moon,
  Sun,
  Check,
  X
} from "lucide-react";

const getBackendUrl = (path) => {
  if (!path) return "#";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const base = import.meta.env.VITE_API_BASE_URL 
    ? import.meta.env.VITE_API_BASE_URL.replace(/\/api$/, "")
    : (import.meta.env.MODE === "development" ? "http://localhost:5000" : "");
  return `${base}/${path}`;
};

export default function App() {
  const { user, token } = useContext(AuthContext);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark-theme");
    } else {
      document.body.classList.remove("dark-theme");
    }
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  return (
    <Routes>
      <Route
        path="/"
        element={
          token ? (
            user?.role === "admin" ? (
              <Navigate to="/admin" />
            ) : user?.role === "recruiter" ? (
              <Navigate to="/recruiter" />
            ) : (
              <Navigate to="/dashboard" />
            )
          ) : (
            <AuthScreen />
          )
        }
      />
      <Route
        path="/dashboard"
        element={
          token ? (
            <StudentDashboard darkMode={darkMode} setDarkMode={setDarkMode} />
          ) : (
            <Navigate to="/" />
          )
        }
      />
      <Route
        path="/recruiter"
        element={
          token ? (
            user?.role === "recruiter" || user?.role === "admin" ? (
              <RecruiterDashboard darkMode={darkMode} setDarkMode={setDarkMode} />
            ) : (
              <Navigate to="/dashboard" />
            )
          ) : (
            <Navigate to="/" />
          )
        }
      />
      <Route
        path="/admin"
        element={
          token ? (
            user?.role === "admin" ? (
              <AdminDashboard darkMode={darkMode} setDarkMode={setDarkMode} />
            ) : (
              <Navigate to="/dashboard" />
            )
          ) : (
            <Navigate to="/" />
          )
        }
      />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

function AuthScreen() {
  const { login, signup, forgotPassword, resetPassword } = useContext(AuthContext);
  const [tab, setTab] = useState("login");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [skills, setSkills] = useState("");
  const [role, setRole] = useState("user");
  const [company, setCompany] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (tab === "login") {
      const res = await login(email, password);
      if (!res.success) setError(res.error);
    } else if (tab === "signup") {
      const res = await signup(name, email, password, skills, role, company);
      if (!res.success) setError(res.error);
    } else if (tab === "forgot") {
      const res = await forgotPassword(email);
      if (res.success) {
        setSuccess(res.msg || "Password reset token sent to your email.");
        setTab("reset");
      } else {
        setError(res.error);
      }
    } else if (tab === "reset") {
      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }
      const res = await resetPassword(email, resetCode, password);
      if (res.success) {
        setSuccess(res.msg || "Password reset successful! You can now log in.");
        setTab("login");
        setResetCode("");
        setPassword("");
        setConfirmPassword("");
      } else {
        setError(res.error);
      }
    }
  };

  return (
    <div className="container" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "80vh" }}>
      <div className="auth-container glass" style={{ width: "100%", maxWidth: "480px", margin: "2rem auto", padding: "2.5rem 3rem" }}>
        <div className="auth-header">
          <div style={{ 
            display: "inline-flex", 
            marginBottom: "1rem",
            width: "50px",
            height: "50px",
            fontSize: "1.5rem",
            borderRadius: "14px"
          }} className="logo">
            IN
          </div>
          <h2 className="auth-title" style={{ fontSize: "2.25rem", fontWeight: 800 }}>Internify</h2>
          <p className="brand-tag" style={{ color: "var(--accent-color)", letterSpacing: "1px", fontWeight: 700 }}>
            Elevate Your Career Path
          </p>
        </div>

        {(tab === "login" || tab === "signup") && (
          <div className="nav-tabs" style={{ marginBottom: "2rem", padding: "0.25rem", borderRadius: "14px" }}>
            <button
              className={`nav-tab-btn ${tab === "login" ? "active" : ""}`}
              style={{ flexGrow: 1, padding: "0.6rem", borderRadius: "10px", fontSize: "0.9rem" }}
              onClick={() => {
                setTab("login");
                setError("");
                setSuccess("");
                setShowPassword(false);
              }}
            >
              Login Account
            </button>
            <button
              className={`nav-tab-btn ${tab === "signup" ? "active" : ""}`}
              style={{ flexGrow: 1, padding: "0.6rem", borderRadius: "10px", fontSize: "0.9rem" }}
              onClick={() => {
                setTab("signup");
                setError("");
                setSuccess("");
                setShowPassword(false);
              }}
            >
              Join Internify
            </button>
          </div>
        )}

        {tab === "forgot" && (
          <div style={{ marginBottom: "1.5rem", textAlign: "center" }}>
            <h3 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.25rem" }}>Recover Password</h3>
            <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>Enter your email to receive a password reset token.</p>
          </div>
        )}

        {tab === "reset" && (
          <div style={{ marginBottom: "1.5rem", textAlign: "center" }}>
            <h3 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.25rem" }}>Reset Password</h3>
            <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>Enter the 6-digit verification token sent to your email.</p>
          </div>
        )}

        {error && (
          <div className="alert-banner alert-error">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="alert-banner alert-success" style={{ 
            background: "rgba(5, 150, 105, 0.1)", 
            color: "var(--success-color)",
            padding: "0.75rem 1rem",
            borderRadius: "10px",
            marginBottom: "1.25rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            fontSize: "0.875rem",
            border: "1px solid rgba(5, 150, 105, 0.2)"
          }}>
            <CheckCircle size={18} />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {tab === "signup" && (
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Himanshu Tiwari"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          )}

          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              className="form-control"
              placeholder="e.g. student@college.edu"
              required
              disabled={tab === "reset"}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {tab === "reset" && (
            <div className="form-group">
              <label>Verification Token</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. 123456"
                required
                value={resetCode}
                onChange={(e) => setResetCode(e.target.value)}
              />
            </div>
          )}

          {tab !== "forgot" && (
            <div className="form-group">
              <label>{tab === "reset" ? "New Password" : "Security Password"}</label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  className="form-control"
                  placeholder="••••••••"
                  required
                  style={{ paddingRight: "2.75rem", width: "100%" }}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: "0.75rem",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--text-muted)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "0.25rem"
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              
              {tab === "login" && (
                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "0.25rem" }}>
                  <button
                    type="button"
                    onClick={() => {
                      setTab("forgot");
                      setError("");
                      setSuccess("");
                    }}
                    style={{
                      background: "none",
                      border: "none",
                      color: "var(--accent-color)",
                      fontSize: "0.85rem",
                      cursor: "pointer",
                      padding: 0,
                      fontWeight: 600
                    }}
                  >
                    Forgot Password?
                  </button>
                </div>
              )}
            </div>
          )}

          {tab === "reset" && (
            <div className="form-group">
              <label>Confirm New Password</label>
              <input
                type="password"
                className="form-control"
                placeholder="••••••••"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          )}

          {tab === "signup" && (
            <>
              {role === "user" && (
                <div className="form-group">
                  <label>Skills (comma-separated)</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="React, Node.js, Python, CSS"
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                  />
                </div>
              )}

              <div className="form-group">
                <label>Register As</label>
                <select
                  className="form-control"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  style={{ cursor: "pointer" }}
                >
                  <option value="user">Student / Candidate</option>
                  <option value="recruiter">Recruiter</option>
                </select>
              </div>

              {role === "recruiter" && (
                <div className="form-group">
                  <label>Company / Organization</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Google, PW Skills, Apna College"
                    required
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                  />
                </div>
              )}
            </>
          )}

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ 
              marginTop: "0.75rem",
              padding: "0.85rem 1.5rem",
              fontSize: "1rem",
              borderRadius: "12px",
              fontWeight: 700
            }}
          >
            {tab === "login" 
              ? "Sign In to Portal" 
              : tab === "signup" 
              ? "Create Free Account"
              : tab === "forgot"
              ? "Send Reset Token"
              : "Reset Password"}
          </button>

          {(tab === "forgot" || tab === "reset") && (
            <div style={{ textAlign: "center", marginTop: "0.5rem" }}>
              <button
                type="button"
                onClick={() => {
                  setTab("login");
                  setError("");
                  setSuccess("");
                }}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--text-muted)",
                  fontSize: "0.9rem",
                  cursor: "pointer",
                  fontWeight: 600,
                  textDecoration: "underline"
                }}
              >
                Back to Login
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

// ================= STUDENT DASHBOARD =================
function StudentDashboard({ darkMode, setDarkMode }) {
  const { user, logout, uploadResume, updateProfile } = useContext(AuthContext);
  const navigate = useNavigate();
  const isRecruiterMode = user?.role === "admin" || user?.role === "recruiter";
  
  // 5 Restructured Menu Tabs: "dashboard", "search", "applications", "upload", "ats"
  const [activeTab, setActiveTab] = useState(isRecruiterMode ? "search" : "dashboard");
  const [searchSubTab, setSearchSubTab] = useState("all"); // "all" or "recommended"
  
  // Data list states
  const [internships, setInternships] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [applications, setApplications] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Edit states (for Profile settings edit form in Upload Resume tab)
  const [editName, setEditName] = useState(user?.name || "");
  const [editSkills, setEditSkills] = useState(user?.skills?.join(", ") || "");
  const [editBio, setEditBio] = useState(user?.bio || "");

  // Details Modal State
  const [selectedInternship, setSelectedInternship] = useState(null);

  // ATS Resume Analyzer state
  const [atsHistory, setAtsHistory] = useState([]);
  const [atsError, setAtsError] = useState("");
  const [atsSuccess, setAtsSuccess] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [atsFile, setAtsFile] = useState(null);
  const [atsCompany, setAtsCompany] = useState("");
  const [atsRole, setAtsRole] = useState("");
  const [atsSkills, setAtsSkills] = useState("");
  const [analysisResult, setAnalysisResult] = useState(null);
  const [selectedAnalysesForCompare, setSelectedAnalysesForCompare] = useState([]);
  const [comparisonResult, setComparisonResult] = useState(null);

  // API fetches
  const fetchInternships = async () => {
    try {
      const res = await API.get("/internships");
      setInternships(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchRecommendations = async () => {
    try {
      const res = await API.get("/internships/recommend");
      setRecommendations(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchApplications = async () => {
    try {
      const res = await API.get("/apply");
      setApplications(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAtsHistory = async () => {
    try {
      const res = await API.get("/ats/history");
      setAtsHistory(res.data);
    } catch (err) {
      console.error("Error fetching ATS history:", err);
    }
  };

  useEffect(() => {
    fetchInternships();
    if (!isRecruiterMode) {
      fetchRecommendations();
      fetchApplications();
      fetchAtsHistory();
    }
  }, [isRecruiterMode]);

  useEffect(() => {
    if (user) {
      setEditName(user.name || "");
      setEditSkills(user.skills?.join(", ") || "");
      setEditBio(user.bio || "");
    }
  }, [user]);

  const handleApply = async (internshipId) => {
    if (isRecruiterMode) return;
    setError("");
    setSuccess("");
    try {
      await API.post("/apply", { internshipId });
      setSuccess("Applied successfully! Good luck.");
      fetchApplications();
      fetchRecommendations();
      fetchInternships();
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to apply.");
    }
  };

  const handleResumeUpload = async (e) => {
    if (isRecruiterMode) return;
    const file = e.target.files[0];
    if (!file) return;
    setError("");
    setSuccess("");
    const res = await uploadResume(file);
    if (res.success) {
      setSuccess("Resume uploaded successfully!");
    } else {
      setError(res.error);
    }
  };

  const handleSaveProfile = async (e) => {
    if (isRecruiterMode) return;
    e.preventDefault();
    setError("");
    setSuccess("");
    const res = await updateProfile(editName, editSkills, editBio);
    if (res.success) {
      setSuccess("Profile settings saved successfully!");
      fetchInternships();
      fetchRecommendations();
    } else {
      setError(res.error);
    }
  };

  // Helper to check if already applied
  const hasApplied = (internshipId) => {
    return applications.some(app => app.internship?._id === internshipId);
  };

  // Generate initials for avatar
  const getInitials = (fullName) => {
    if (!fullName) return "ST";
    return fullName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  // Score category label & color helpers
  const getScoreCategory = (score) => {
    if (score >= 90) return { label: "Excellent", color: "var(--success-color)", bg: "rgba(5, 150, 105, 0.1)" };
    if (score >= 75) return { label: "Good", color: "var(--primary-color)", bg: "var(--primary-glow)" };
    if (score >= 60) return { label: "Average", color: "var(--purple-color)", bg: "var(--purple-glow)" };
    return { label: "Needs Improvement", color: "var(--error-color)", bg: "rgba(220, 38, 38, 0.1)" };
  };

  // ATS Analysis Action
  const handleAtsAnalyze = async (e) => {
    e.preventDefault();
    if (!atsFile) {
      setAtsError("Please upload a PDF or DOCX file first.");
      return;
    }
    setAtsError("");
    setAtsSuccess("");
    setIsParsing(true);
    setComparisonResult(null);
    
    try {
      // Step 1: Parse resume file to extract text
      const formData = new FormData();
      formData.append("resume", atsFile);
      
      const parseRes = await API.post("/ats/parse", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      
      const { text, filename } = parseRes.data;
      setIsParsing(false);
      setIsAnalyzing(true);
      
      // Step 2: Request AI analysis of text
      const skillsArray = atsSkills.split(",").map(s => s.trim()).filter(Boolean);
      const analyzeRes = await API.post("/ats/analyze", {
        companyName: atsCompany,
        jobRole: atsRole,
        requiredSkills: skillsArray,
        resumeText: text,
        resumeName: filename
      });
      
      setAnalysisResult(analyzeRes.data);
      setAtsSuccess("ATS resume analysis completed successfully!");
      fetchAtsHistory();
      
      // Clear HTML input value so selecting the same file again fires onChange
      const fileInput = document.getElementById("ats-file-input");
      if (fileInput) {
        fileInput.value = "";
      }
    } catch (err) {
      console.error(err);
      setAtsError(err.response?.data?.msg || err.response?.data?.error || "Resume analysis failed. Please try again.");
      setIsParsing(false);
      setIsAnalyzing(false);
    } finally {
      setIsParsing(false);
      setIsAnalyzing(false);
    }
  };

  // PDF Report Download
  const handleDownloadPdf = (result) => {
    if (!result) return;
    try {
      // Resolve jsPDF class safely across various ESM, CommonJS, and Window configurations
      const PDFClass = jsPDF.jsPDF || jsPDF.default || (window.jspdf && window.jspdf.jsPDF) || jsPDF;
      if (!PDFClass) {
        throw new Error("jsPDF constructor is not defined. Type: " + typeof jsPDF);
      }
      
      const doc = new PDFClass();
      
      // Header Banner
      doc.setFillColor(37, 99, 235);
      doc.rect(0, 0, 210, 42, "F");
      
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.text("INTERNIFY ATS REPORT", 20, 26);
      
      // Metadata Details
      doc.setTextColor(51, 65, 85);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      
      const scanDate = result.createdAt ? new Date(result.createdAt).toLocaleString() : "N/A";
      doc.text(`Generated on: ${scanDate}`, 20, 52);
      doc.text(`Company Context: ${result.companyName || "General / Not Specified"}`, 20, 58);
      doc.text(`Job Role Context: ${result.jobRole || "General / Not Specified"}`, 20, 64);
      doc.text(`Scanned Resume: ${result.resumeName || "Resume"}`, 20, 70);
      
      // Score box panel
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.rect(130, 48, 60, 26, "FD");
      
      doc.setTextColor(37, 99, 235);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(26);
      doc.text(`${result.atsScore || 0}%`, 140, 64);
      
      const cat = getScoreCategory(result.atsScore || 0);
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text(`Category: ${cat.label}`, 134, 70);
      
      // Summary Feedback Section
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(13);
      doc.setFont("helvetica", "bold");
      doc.text("Overall Feedback & Analysis", 20, 84);
      doc.line(20, 86, 190, 86);
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(51, 65, 85);
      const splitFeedback = doc.splitTextToSize(result.overallFeedback || "No feedback summary generated.", 170);
      doc.text(splitFeedback, 20, 92);
      
      let yPos = 92 + (splitFeedback.length * 5) + 10;
      
      // Skills Mapping Section
      if (yPos > 260) {
        doc.addPage();
        yPos = 20;
      }
      doc.setTextColor(15, 23, 42);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.text("Job Skills Mapping", 20, yPos);
      doc.line(20, yPos + 2, 190, yPos + 2);
      yPos += 8;
      
      doc.setFontSize(10);
      doc.setTextColor(5, 150, 105);
      doc.text("Matched Skills (Found):", 20, yPos);
      doc.setTextColor(220, 38, 38);
      doc.text("Missing Skills (Not Found):", 110, yPos);
      yPos += 6;
      
      doc.setFont("helvetica", "normal");
      const matched = result.matchedSkills || [];
      const missing = result.missingSkills || [];
      const maxSkills = Math.max(matched.length, missing.length);
      
      for (let i = 0; i < maxSkills; i++) {
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
        if (matched[i]) {
          doc.setTextColor(5, 150, 105);
          doc.text(`[x] ${matched[i]}`, 20, yPos);
        }
        if (missing[i]) {
          doc.setTextColor(220, 38, 38);
          doc.text(`[ ] ${missing[i]}`, 110, yPos);
        }
        yPos += 5;
      }
      yPos += 5;
      
      // Mistakes Section
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }
      
      doc.setTextColor(15, 23, 42);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.text("Identified Resume Mistakes", 20, yPos);
      doc.line(20, yPos + 2, 190, yPos + 2);
      yPos += 8;
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      doc.setTextColor(220, 38, 38);
      
      const mistakes = result.mistakes || [];
      if (mistakes.length === 0) {
        doc.setTextColor(5, 150, 105);
        doc.text("Excellent: No formatting or section mistakes detected in the resume file.", 20, yPos);
        yPos += 5;
      } else {
        mistakes.forEach(mis => {
          if (yPos > 270) {
            doc.addPage();
            yPos = 20;
          }
          doc.text(`- ${mis}`, 20, yPos);
          yPos += 5;
        });
      }
      yPos += 5;
      
      // Suggestions Section
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }
      
      doc.setTextColor(15, 23, 42);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.text("AI Improvement Suggestions", 20, yPos);
      doc.line(20, yPos + 2, 190, yPos + 2);
      yPos += 8;
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      doc.setTextColor(51, 65, 85);
      
      const suggestions = result.suggestions || [];
      if (suggestions.length === 0) {
        doc.text("No modifications suggested. The resume fits target guidelines.", 20, yPos);
        yPos += 5;
      } else {
        suggestions.forEach(sug => {
          if (yPos > 270) {
            doc.addPage();
            yPos = 20;
          }
          doc.text(`* ${sug}`, 20, yPos);
          yPos += 5;
        });
      }
      
      doc.save(`ATS-Report-${result.companyName || "General"}-${result.jobRole || "Resume"}.pdf`);
    } catch (pdfErr) {
      console.error("PDF download function error:", pdfErr);
      alert("Failed to download PDF report: " + pdfErr.message);
    }
  };

  // Handle history record deletion
  const handleDeleteHistory = async (id, e) => {
    e.stopPropagation(); // Avoid triggering details loading
    if (!window.confirm("Are you sure you want to delete this scan from your history?")) return;
    try {
      await API.delete(`/ats/history/${id}`);
      fetchAtsHistory();
      if (analysisResult?._id === id) {
        setAnalysisResult(null);
      }
      // Remove from comparison selection
      setSelectedAnalysesForCompare(prev => prev.filter(x => x._id !== id));
      setComparisonResult(null);
    } catch (err) {
      console.error(err);
      alert("Failed to delete history record.");
    }
  };

  // Toggle selection for comparison
  const handleSelectForCompare = (analysis, e) => {
    e.stopPropagation();
    setSelectedAnalysesForCompare(prev => {
      const exists = prev.find(a => a._id === analysis._id);
      if (exists) {
        const filtered = prev.filter(a => a._id !== analysis._id);
        if (filtered.length < 2) setComparisonResult(null);
        return filtered;
      }
      if (prev.length >= 2) {
        // Queue FIFO: drop oldest, add new
        return [prev[1], analysis];
      }
      return [...prev, analysis];
    });
  };

  const handleCompare = () => {
    if (selectedAnalysesForCompare.length !== 2) {
      setAtsError("Please select exactly 2 scans to run a comparison.");
      return;
    }
    setAtsError("");
    // Sort oldest first
    const sorted = [...selectedAnalysesForCompare].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    const [scanA, scanB] = sorted;
    
    setComparisonResult({
      scanA,
      scanB,
      scoreDiff: scanB.atsScore - scanA.atsScore,
      skillsADiff: scanA.matchedSkills.length,
      skillsBDiff: scanB.matchedSkills.length,
      mistakesADiff: scanA.mistakes.length,
      mistakesBDiff: scanB.mistakes.length
    });
  };

  return (
    <div className="container">
      {/* Header */}
      <header className="glass" style={{ backdropFilter: "blur(20px)", boxShadow: "0 10px 30px rgba(0,0,0,0.2)" }}>
        <div className="brand">
          <div className="logo" style={{ borderRadius: "10px" }}>IN</div>
          <div>
            <h1 className="brand-name" style={{ fontSize: "1.45rem" }}>Internify</h1>
            <p className="brand-tag">{isRecruiterMode ? "Student Board" : "Student Hub"}</p>
          </div>
        </div>

        <div style={{ display: "flex", gap: "0.85rem", alignItems: "center" }}>
          <button 
            className="btn" 
            onClick={() => setDarkMode(!darkMode)}
            style={{ padding: "0.55rem 0.85rem", borderRadius: "10px", fontSize: "0.85rem" }}
            title="Toggle Dark Mode"
          >
            {darkMode ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          {user?.role === "admin" && (
            <button
              className="btn btn-primary"
              onClick={() => navigate("/admin")}
              style={{
                background: "var(--gradient-indigo-purple)",
                boxShadow: "0 4px 12px rgba(99, 102, 241, 0.2)",
                border: "none",
                padding: "0.55rem 1.15rem",
                borderRadius: "10px",
                fontSize: "0.85rem"
              }}
            >
              <span>Admin Console 🛠️</span>
            </button>
          )}
          {(user?.role === "recruiter" || user?.role === "admin") && (
            <button
              className="btn btn-primary"
              onClick={() => navigate("/recruiter")}
              style={{
                background: "var(--gradient-emerald)",
                boxShadow: "0 4px 12px rgba(16, 185, 129, 0.25)",
                border: "none",
                padding: "0.55rem 1.15rem",
                borderRadius: "10px",
                fontSize: "0.85rem"
              }}
            >
              <span>Recruiter Console 💼</span>
            </button>
          )}
          <button 
            className="btn btn-danger" 
            onClick={logout}
            style={{ padding: "0.55rem 1.15rem", borderRadius: "10px", fontSize: "0.85rem" }}
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* Main Student Portal Tabs */}
      {!isRecruiterMode && (
        <div className="nav-tabs" style={{ marginBottom: "2rem" }}>
          <button
            className={`nav-tab-btn ${activeTab === "dashboard" ? "active" : ""}`}
            onClick={() => setActiveTab("dashboard")}
          >
            <LayoutDashboard size={16} />
            <span>Dashboard</span>
          </button>
          <button
            className={`nav-tab-btn ${activeTab === "search" ? "active" : ""}`}
            onClick={() => setActiveTab("search")}
          >
            <Briefcase size={16} />
            <span>Internship Search</span>
          </button>
          <button
            className={`nav-tab-btn ${activeTab === "applications" ? "active" : ""}`}
            onClick={() => setActiveTab("applications")}
          >
            <CheckCircle size={16} />
            <span>Applications ({applications.length})</span>
          </button>
          <button
            className={`nav-tab-btn ${activeTab === "upload" ? "active" : ""}`}
            onClick={() => setActiveTab("upload")}
          >
            <Upload size={16} />
            <span>Resume Upload</span>
          </button>
          <button
            className={`nav-tab-btn ${activeTab === "ats" ? "active" : ""}`}
            onClick={() => setActiveTab("ats")}
          >
            <Sparkles size={16} />
            <span>ATS Resume Analyzer</span>
          </button>
        </div>
      )}

      {/* Global Notifications */}
      {success && (
        <div className="alert-banner alert-success">
          <CheckCircle size={18} />
          <span>{success}</span>
        </div>
      )}
      {error && (
        <div className="alert-banner alert-error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* 1. DASHBOARD TAB VIEW */}
      {activeTab === "dashboard" && !isRecruiterMode && (
        <div style={{ animation: "modalFadeIn 0.3s" }}>
          {/* Welcome Banner */}
          <div className="welcome-banner">
            <div className="welcome-text">
              <h2>Welcome back, {user?.name || "Student"}! 👋</h2>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", maxWidth: "600px", marginTop: "0.5rem" }}>
                Explore premium internships tailored to your profile. Keep your skills up to date to increase your match compatibility score.
              </p>
            </div>
            <div className="welcome-stats">
              <div className="stat-item">
                <div className="stat-val">{applications.length}</div>
                <div className="stat-label">Applications</div>
              </div>
              <div className="stat-item">
                <div className="stat-val">
                  {recommendations.length > 0
                    ? Math.round(recommendations.reduce((acc, curr) => acc + (curr.matchPercentage || 0), 0) / recommendations.length)
                    : 0}%
                </div>
                <div className="stat-label">Avg Match Score</div>
              </div>
              <div className="stat-item">
                <div className="stat-val">{user?.skills?.length || 0}</div>
                <div className="stat-label">My Skills</div>
              </div>
            </div>
          </div>

          {/* Profile Overview (Read-Only) */}
          <div className="profile-card glass">
            <div style={{ display: "flex", gap: "1.5rem", alignItems: "flex-start" }}>
              <div style={{
                background: "var(--gradient-indigo-purple)",
                borderRadius: "50%",
                width: "72px",
                height: "72px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.75rem",
                fontWeight: 800,
                color: "#fff",
                boxShadow: "0 8px 24px rgba(99, 102, 241, 0.35)",
                flexShrink: 0
              }}>
                {getInitials(user?.name)}
              </div>
              <div>
                <h2 style={{ fontWeight: 800, fontSize: "1.5rem", color: "var(--text-main)", marginBottom: "0.25rem" }}>
                  {user?.name || "Student User"}
                </h2>
                <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "0.85rem" }}>{user?.email}</p>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", marginBottom: "1.25rem" }}>
                  {user?.bio || "No summary added. Go to the 'Resume Upload' tab to write a bio and describe your goals!"}
                </p>
                
                <h4 style={{ marginBottom: "0.65rem", fontSize: "0.9rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", color: "var(--text-muted)" }}>My Tech Stack</h4>
                <div className="skills-list">
                  {user?.skills && user.skills.length > 0 ? (
                    user.skills.map((s, idx) => (
                      <span key={idx} className="skill-badge matched">
                        {s}
                      </span>
                    ))
                  ) : (
                    <span className="text-muted" style={{ fontSize: "0.9rem" }}>No skills listed yet. Go to 'Resume Upload' to configure your profile.</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. INTERNSHIP SEARCH TAB VIEW */}
      {activeTab === "search" && (
        <div style={{ animation: "modalFadeIn 0.3s" }}>
          {!isRecruiterMode && (
            <div className="nav-tabs" style={{ display: "inline-flex", marginBottom: "1.5rem", padding: "0.25rem" }}>
              <button
                className={`nav-tab-btn ${searchSubTab === "all" ? "active" : ""}`}
                style={{ padding: "0.5rem 1rem", borderRadius: "10px", fontSize: "0.85rem" }}
                onClick={() => setSearchSubTab("all")}
              >
                All Opportunities ({internships.length})
              </button>
              <button
                className={`nav-tab-btn ${searchSubTab === "recommended" ? "active" : ""}`}
                style={{ padding: "0.5rem 1rem", borderRadius: "10px", fontSize: "0.85rem" }}
                onClick={() => setSearchSubTab("recommended")}
              >
                Recommended ({recommendations.length})
              </button>
            </div>
          )}

          {/* Sub-tab 2a: All Internships */}
          {(searchSubTab === "all" || isRecruiterMode) && (
            <div>
              <div style={{ marginBottom: "1.5rem" }}>
                <h3 style={{ fontSize: "1.5rem", fontWeight: 800 }}>Explore Job Opportunities</h3>
                <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>Find open internship posts and click to view full specifications.</p>
              </div>

              {internships.length === 0 ? (
                <div className="glass" style={{ padding: "4rem 2rem", textAlign: "center", color: "var(--text-muted)", borderRadius: "20px" }}>
                  <Briefcase size={40} style={{ color: "var(--text-muted)", marginBottom: "1rem", opacity: 0.5 }} />
                  <p style={{ fontWeight: 600 }}>No internships available at the moment.</p>
                  <p style={{ fontSize: "0.9rem", marginTop: "0.25rem" }}>Check back later or configure an admin profile to add new posts.</p>
                </div>
              ) : (
                <div className="grid-3">
                  {internships.map((it) => {
                    const applied = hasApplied(it._id);
                    return (
                      <div key={it._id} className="card glass glass-interactive" onClick={() => setSelectedInternship(it)} style={{ cursor: "pointer" }}>
                        <div className="card-header">
                          <span className="card-tag">{it.location}</span>
                          <h4 className="card-title">{it.title}</h4>
                          <p className="card-subtitle">{it.company}</p>
                        </div>
                        <div className="card-body">
                          <p style={{ marginBottom: "1.25rem", fontSize: "0.95rem", height: "70px", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {it.description}
                          </p>
                          
                          <div style={{ display: "flex", gap: "1.5rem", marginBottom: "1.25rem", fontSize: "0.85rem", fontWeight: 600 }}>
                            <span style={{ display: "flex", alignItems: "center", gap: "0.35rem", color: "var(--success-color)" }}>
                              <DollarSign size={15} />
                              <span>₹{(it.stipend || 0).toLocaleString()}/mo</span>
                            </span>
                            <span style={{ display: "flex", alignItems: "center", gap: "0.35rem", color: "var(--text-muted)" }}>
                              <MapPin size={15} />
                              <span>{it.location}</span>
                            </span>
                          </div>

                          {!isRecruiterMode && (
                            <div className="match-widget">
                              <div className="progress-container">
                                <div
                                  className="progress-bar"
                                  style={{ 
                                    width: `${it.matchPercentage || 0}%`,
                                    background: "linear-gradient(90deg, var(--primary-color), var(--purple-color))"
                                  }}
                                ></div>
                              </div>
                              <span style={{ fontSize: "0.85rem", fontWeight: 800, color: "var(--primary-color)" }}>{it.matchPercentage || 0}% match</span>
                            </div>
                          )}

                          <p style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "0.5rem" }}>Required Stack:</p>
                          <div className="skills-list">
                            {it.skillsRequired.map((skill, sIdx) => {
                              const matched = !isRecruiterMode && user?.skills?.some(s => s.toLowerCase() === skill.toLowerCase());
                              return (
                                <span key={sIdx} className={`skill-badge ${isRecruiterMode ? "matched" : matched ? "matched" : "missing"}`}>
                                  {skill}
                                </span>
                              );
                            })}
                          </div>
                        </div>

                        {!isRecruiterMode && (
                          <button
                            className={`btn ${applied ? "" : "btn-primary"}`}
                            disabled={applied || !user?.resumeUrl}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleApply(it._id);
                            }}
                            style={{ width: "100%", marginTop: "auto", borderRadius: "12px", padding: "0.75rem" }}
                          >
                            {applied ? "Applied" : user?.resumeUrl ? "Apply Now" : "Upload PDF to Apply"}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Sub-tab 2b: Recommended Internships */}
          {searchSubTab === "recommended" && !isRecruiterMode && (
            <div>
              <div style={{ marginBottom: "1.5rem" }}>
                <h3 style={{ fontSize: "1.5rem", fontWeight: 800 }}>Smart Match Recommendations</h3>
                <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>High-matching jobs sorted based on your skills profile. Discards non-matches.</p>
              </div>

              {recommendations.length === 0 ? (
                <div className="glass" style={{ padding: "4rem 2rem", textAlign: "center", color: "var(--text-muted)", borderRadius: "20px" }}>
                  <Star size={40} style={{ color: "var(--text-muted)", marginBottom: "1rem", opacity: 0.5 }} />
                  <p style={{ fontWeight: 600 }}>No matched recommendation options.</p>
                  <p style={{ fontSize: "0.9rem", marginTop: "0.25rem" }}>Try adding more skills in settings to trigger new matching profiles!</p>
                </div>
              ) : (
                <div className="grid-3">
                  {recommendations.map((it) => {
                    const applied = hasApplied(it._id);
                    return (
                      <div key={it._id} className="card glass glass-interactive" onClick={() => setSelectedInternship(it)} style={{ cursor: "pointer", borderLeft: "2px solid var(--primary-color)" }}>
                        <div className="card-header">
                          <span className="card-tag" style={{ background: "rgba(245, 158, 11, 0.1)", color: "var(--accent-color)", borderColor: "rgba(245, 158, 11, 0.2)" }}>{it.location}</span>
                          <h4 className="card-title">{it.title}</h4>
                          <p className="card-subtitle">{it.company}</p>
                        </div>
                        <div className="card-body">
                          <p style={{ marginBottom: "1.25rem", fontSize: "0.95rem", height: "70px", overflow: "hidden", textOverflow: "ellipsis" }}>{it.description}</p>
                          
                          <div className="match-widget" style={{ border: "1px dashed rgba(245,158,11,0.2)", background: "rgba(245,158,11,0.02)" }}>
                            <div className="progress-container">
                              <div
                                className="progress-bar"
                                style={{ 
                                  width: `${it.matchPercentage}%`,
                                  background: "var(--gradient-gold)"
                                }}
                              ></div>
                            </div>
                            <span style={{ fontSize: "0.85rem", fontWeight: 800, display: "flex", alignItems: "center", gap: "0.25rem", color: "var(--accent-color)" }}>
                              <Star size={14} fill="var(--accent-color)" color="var(--accent-color)" />
                              <span>{it.matchPercentage}% fit</span>
                            </span>
                          </div>

                          {it.missingSkills.length > 0 && (
                            <div style={{ marginBottom: "1.25rem" }}>
                              <p style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "0.4rem" }}>Missing Skills Gap:</p>
                              <div className="skills-list">
                                {it.missingSkills.map((sk, idx) => (
                                  <span key={idx} className="skill-badge missing">
                                    {sk}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          <p style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "0.4rem" }}>Skills Map:</p>
                          <div className="skills-list">
                            {it.skillsRequired.map((skill, sIdx) => {
                              const matched = user?.skills?.includes(skill);
                              return (
                                <span key={sIdx} className={`skill-badge ${matched ? "matched" : "missing"}`}>
                                  {skill}
                                </span>
                              );
                            })}
                          </div>
                        </div>

                        <button
                          className={`btn ${applied ? "" : "btn-primary"}`}
                          disabled={applied || !user?.resumeUrl}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleApply(it._id);
                          }}
                          style={{ width: "100%", marginTop: "auto", borderRadius: "12px", padding: "0.75rem" }}
                        >
                          {applied ? "Applied" : user?.resumeUrl ? "Apply Now" : "Upload PDF to Apply"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 3. APPLICATIONS TAB VIEW */}
      {activeTab === "applications" && !isRecruiterMode && (
        <div className="glass" style={{ padding: "2.25rem", overflowX: "auto", borderRadius: "20px", animation: "modalFadeIn 0.3s" }}>
          <div style={{ marginBottom: "1.5rem" }}>
            <h3 style={{ fontSize: "1.5rem", fontWeight: 800 }}>Application Pipeline Tracker</h3>
            <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>Real-time recruitment tracking and approval pipelines.</p>
          </div>

          {applications.length === 0 ? (
            <p style={{ color: "var(--text-muted)", padding: "1rem 0" }}>You have not applied to any internships yet.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Employer</th>
                  <th>Position Role</th>
                  <th>Est. Stipend</th>
                  <th>Job Location</th>
                  <th>Application Date</th>
                  <th>Recruitment Status</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => (
                  <tr key={app._id}>
                    <td><strong>{app.internship?.company || "Deleted Company"}</strong></td>
                    <td>{app.internship?.title || "Deleted Internship"}</td>
                    <td style={{ color: "var(--success-color)", fontWeight: 600 }}>
                      {app.internship?.stipend ? `₹${app.internship.stipend.toLocaleString()}/mo` : "—"}
                    </td>
                    <td>{app.internship?.location || "—"}</td>
                    <td>{new Date(app.appliedAt).toLocaleDateString()}</td>
                    <td>
                      <span className={`status-pill ${app.status.toLowerCase()}`}>
                        <span className={`pulse-dot ${app.status === "Pending" ? "animating" : ""}`} />
                        <span>{app.status}</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* 4. RESUME UPLOAD TAB VIEW */}
      {activeTab === "upload" && !isRecruiterMode && (
        <div style={{ animation: "modalFadeIn 0.3s", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2.5rem" }}>
          {/* Edit Profile Form */}
          <div className="profile-card glass">
            <h3 style={{ marginBottom: "1.5rem", fontWeight: 700, color: "var(--text-main)" }}>Edit Profile Settings</h3>
            <form onSubmit={handleSaveProfile}>
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Technical Skills (comma separated)</label>
                <input
                  type="text"
                  className="form-control"
                  value={editSkills}
                  onChange={(e) => setEditSkills(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Bio / Profile Summary</label>
                <textarea
                  className="form-control"
                  value={editBio}
                  rows={4}
                  onChange={(e) => setEditBio(e.target.value)}
                  placeholder="Briefly describe your tech stack or experience..."
                  style={{ resize: "vertical" }}
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: "1rem", padding: "0.75rem" }}>
                Save Profile Changes
              </button>
            </form>
          </div>

          {/* Profile Resume PDF Upload Card */}
          <div className="profile-card glass" style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <h4 style={{ marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: 700, color: "var(--text-main)" }}>
              <FileText size={18} style={{ color: "var(--primary-color)" }} />
              <span>Resume File Profile</span>
            </h4>
            
            {user?.resumeUrl ? (
              <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
                <a
                  href={getBackendUrl(user.resumeUrl)}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-primary"
                  style={{ gap: "0.5rem", borderRadius: "10px", padding: "0.55rem 1.25rem" }}
                >
                  <FileText size={16} />
                  <span>View Current Resume</span>
                </a>
                <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Drag-drop to replace</span>
              </div>
            ) : (
              <div style={{ color: "var(--error-color)", marginBottom: "1.5rem", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.95rem" }}>
                <AlertCircle size={16} />
                <span>No resume uploaded. Please upload a PDF to start applying.</span>
              </div>
            )}

            <label className="uploader">
              <Upload size={28} style={{ color: "var(--primary-color)", marginBottom: "0.75rem" }} />
              <p style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--text-main)", marginBottom: "0.25rem" }}>Drag & Drop PDF or Click to Upload</p>
              <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>PDF format only • Max file size 5MB</p>
              <input type="file" accept="application/pdf" onChange={handleResumeUpload} style={{ display: "none" }} />
            </label>
          </div>
        </div>
      )}

      {/* 5. ATS RESUME ANALYZER TAB VIEW */}
      {activeTab === "ats" && !isRecruiterMode && (
        <div style={{ animation: "modalFadeIn 0.3s", display: "flex", flexDirection: "column", gap: "2.5rem" }}>
          
          {/* Grid Layout: Input Form + Result Display */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2.5rem" }}>
            
            {/* Left: Input Analysis Form */}
            <div className="profile-card glass">
              <h3 style={{ marginBottom: "1.5rem", fontWeight: 800, display: "flex", alignItems: "center", gap: "0.6rem" }}>
                <Sparkles size={20} style={{ color: "var(--primary-color)" }} />
                <span>Analyze New Resume</span>
              </h3>

              {atsError && (
                <div className="alert-banner alert-error" style={{ padding: "0.75rem 1.25rem", marginBottom: "1.25rem" }}>
                  <AlertCircle size={16} />
                  <span>{atsError}</span>
                </div>
              )}

              {atsSuccess && (
                <div className="alert-banner alert-success" style={{ padding: "0.75rem 1.25rem", marginBottom: "1.25rem" }}>
                  <CheckCircle size={16} />
                  <span>{atsSuccess}</span>
                </div>
              )}

              <form onSubmit={handleAtsAnalyze}>
                <div className="form-group">
                  <label>Company Name (optional)</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Google, TCS, PW Skills"
                    value={atsCompany}
                    onChange={(e) => setAtsCompany(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Job Role (optional)</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Frontend Developer, Fullstack Intern"
                    value={atsRole}
                    onChange={(e) => setAtsRole(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Required Skills (comma-separated)</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="React, JavaScript, HTML, CSS, Git, Tailwind"
                    value={atsSkills}
                    onChange={(e) => setAtsSkills(e.target.value)}
                  />
                </div>

                <div className="form-group" style={{ marginTop: "1rem" }}>
                  <label>Upload Resume File (PDF / DOCX)</label>
                  <div 
                    className="uploader" 
                    onClick={() => {
                      if (!atsFile) {
                        document.getElementById("ats-file-input").click();
                      }
                    }}
                    style={{ 
                      padding: "1.75rem", 
                      borderStyle: atsFile ? "solid" : "dashed",
                      borderColor: atsFile ? "var(--primary-color)" : "rgba(37,99,235,0.2)",
                      cursor: atsFile ? "default" : "pointer"
                    }}
                  >
                    {atsFile ? (
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }} onClick={(e) => e.stopPropagation()}>
                        <FileText size={32} style={{ color: "var(--primary-color)", marginBottom: "0.5rem" }} />
                        <p style={{ fontWeight: 700, fontSize: "0.9rem", wordBreak: "break-all" }}>{atsFile.name}</p>
                        <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{(atsFile.size / 1024).toFixed(1)} KB</p>
                        <button 
                          type="button" 
                          className="btn" 
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setAtsFile(null); }}
                          style={{ padding: "0.25rem 0.65rem", fontSize: "0.75rem", marginTop: "0.5rem", borderRadius: "6px" }}
                        >
                          Change File
                        </button>
                      </div>
                    ) : (
                      <>
                        <Upload size={24} style={{ color: "var(--primary-color)", marginBottom: "0.5rem" }} />
                        <p style={{ fontWeight: 700, fontSize: "0.85rem" }}>Click to upload PDF or DOCX file</p>
                        <p style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Max file size 5MB</p>
                      </>
                    )}
                    <input 
                      type="file" 
                      id="ats-file-input"
                      accept=".pdf,.docx,.doc,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword" 
                      onChange={(e) => setAtsFile(e.target.files[0])} 
                      style={{ display: "none" }} 
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  disabled={isParsing || isAnalyzing || !atsFile}
                  style={{ width: "100%", marginTop: "1rem", padding: "0.8rem", fontWeight: 700 }}
                >
                  {isParsing ? "Extracting Text..." : isAnalyzing ? "AI Analyzing Resume..." : "Analyze Resume"}
                </button>
              </form>
            </div>

            {/* Right: Display Selected/Current Analysis Result */}
            <div className="profile-card glass" style={{ minHeight: "350px", display: "flex", flexDirection: "column" }}>
              {analysisResult ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", height: "100%" }}>
                  {/* Score header */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <h3 style={{ fontWeight: 800, fontSize: "1.35rem" }}>ATS Scan Report</h3>
                      <p style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>
                        Scanned: {new Date(analysisResult.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <button 
                      className="btn" 
                      onClick={() => handleDownloadPdf(analysisResult)} 
                      style={{ padding: "0.45rem 0.85rem", fontSize: "0.8rem", gap: "0.35rem", borderRadius: "8px" }}
                    >
                      <Download size={14} />
                      <span>Download PDF</span>
                    </button>
                  </div>

                  {/* Circular Dial and Category */}
                  <div style={{ display: "flex", gap: "1.5rem", alignItems: "center", background: "rgba(255,255,255,0.02)", padding: "1rem", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.05)" }}>
                    <div style={{ position: "relative", width: "80px", height: "80px", flexShrink: 0 }}>
                      <svg width="80" height="80" viewBox="0 0 80 80">
                        <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(0,0,0,0.05)" strokeWidth="6" />
                        <circle cx="40" cy="40" r="34" fill="none" 
                                stroke={getScoreCategory(analysisResult.atsScore).color} 
                                strokeWidth="6" 
                                strokeDasharray="213.63" 
                                strokeDashoffset={213.63 - (213.63 * analysisResult.atsScore) / 100}
                                strokeLinecap="round" 
                                transform="rotate(-90 40 40)" 
                                style={{ transition: "stroke-dashoffset 0.5s ease" }} />
                        <text x="40" y="46" textAnchor="middle" fontSize="15" fontWeight="800" fill="var(--text-main)">
                          {analysisResult.atsScore}%
                        </text>
                      </svg>
                    </div>
                    <div>
                      <span 
                        style={{ 
                          display: "inline-block", 
                          padding: "0.25rem 0.65rem", 
                          borderRadius: "50px", 
                          fontSize: "0.75rem", 
                          fontWeight: 800, 
                          color: getScoreCategory(analysisResult.atsScore).color, 
                          background: getScoreCategory(analysisResult.atsScore).bg, 
                          marginBottom: "0.35rem"
                        }}
                      >
                        {getScoreCategory(analysisResult.atsScore).label}
                      </span>
                      <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                        Matched against <strong>{analysisResult.jobRole || "Role"}</strong> at <strong>{analysisResult.companyName || "Company"}</strong>.
                      </p>
                    </div>
                  </div>

                  {/* Scrollable details panel */}
                  <div style={{ flexGrow: 1, overflowY: "auto", maxHeight: "300px", paddingRight: "0.5rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                    
                    <div>
                      <h4 style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "0.5rem" }}>Overall Feedback</h4>
                      <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", lineHeight: "1.5" }}>{analysisResult.overallFeedback}</p>
                    </div>

                    {/* Matched vs Missing Skills */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                      <div>
                        <h4 style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--success-color)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "0.5rem" }}>Matched Skills</h4>
                        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                          {analysisResult.matchedSkills && analysisResult.matchedSkills.length > 0 ? (
                            analysisResult.matchedSkills.map((sk, idx) => (
                              <span key={idx} style={{ fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "4px", color: "var(--text-secondary)" }}>
                                <Check size={14} style={{ color: "var(--success-color)", strokeWidth: 3 }} />
                                <span>{sk}</span>
                              </span>
                            ))
                          ) : (
                            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontStyle: "italic" }}>None matched</span>
                          )}
                        </div>
                      </div>
                      <div>
                        <h4 style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--error-color)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "0.5rem" }}>Missing Skills</h4>
                        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                          {analysisResult.missingSkills && analysisResult.missingSkills.length > 0 ? (
                            analysisResult.missingSkills.map((sk, idx) => (
                              <span key={idx} style={{ fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "4px", color: "var(--text-secondary)" }}>
                                <X size={14} style={{ color: "var(--error-color)", strokeWidth: 3 }} />
                                <span>{sk}</span>
                              </span>
                            ))
                          ) : (
                            <span style={{ fontSize: "0.8rem", color: "var(--success-color)", fontWeight: 600 }}>No missing skills! 🎉</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Mistakes */}
                    <div>
                      <h4 style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "0.5rem" }}>Resume Mistakes</h4>
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        {analysisResult.mistakes && analysisResult.mistakes.length > 0 ? (
                          analysisResult.mistakes.map((mis, idx) => (
                            <span key={idx} style={{ fontSize: "0.85rem", display: "flex", alignItems: "flex-start", gap: "6px", color: "var(--error-color)", fontWeight: 500 }}>
                              <span style={{ marginTop: "3px", width: "5px", height: "5px", borderRadius: "50%", background: "var(--error-color)", flexShrink: 0 }} />
                              <span>{mis}</span>
                            </span>
                          ))
                        ) : (
                          <span style={{ fontSize: "0.85rem", color: "var(--success-color)", fontWeight: 600 }}>Perfect formatting! No mistakes identified.</span>
                        )}
                      </div>
                    </div>

                    {/* Suggestions */}
                    <div>
                      <h4 style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "0.5rem" }}>AI Suggestions</h4>
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        {analysisResult.suggestions && analysisResult.suggestions.length > 0 ? (
                          analysisResult.suggestions.map((sug, idx) => (
                            <span key={idx} style={{ fontSize: "0.85rem", display: "flex", alignItems: "flex-start", gap: "6px", color: "var(--text-secondary)" }}>
                              <span style={{ marginTop: "3px", width: "5px", height: "5px", borderRadius: "50%", background: "var(--primary-color)", flexShrink: 0 }} />
                              <span>{sug}</span>
                            </span>
                          ))
                        ) : (
                          <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>No recommendations available.</span>
                        )}
                      </div>
                    </div>

                  </div>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexGrow: 1, color: "var(--text-muted)", padding: "2rem", textAlign: "center" }}>
                  <Sparkles size={44} style={{ opacity: 0.25, marginBottom: "1rem" }} />
                  <p style={{ fontWeight: 600 }}>No active scan results.</p>
                  <p style={{ fontSize: "0.8rem", marginTop: "0.25rem" }}>Provide target requirements on the left, upload a resume and trigger 'Analyze Resume' to review.</p>
                </div>
              )}
            </div>

          </div>

          {/* Resume Version Comparison Panel */}
          {comparisonResult && (
            <div className="glass" style={{ padding: "2rem", borderRadius: "20px", borderLeft: "4px solid var(--primary-color)", animation: "modalFadeIn 0.3s" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                <div>
                  <h3 style={{ fontSize: "1.25rem", fontWeight: 800 }}>Resume version comparison</h3>
                  <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Side-by-side progression analysis between two selected scans</p>
                </div>
                <button 
                  className="btn" 
                  onClick={() => setComparisonResult(null)} 
                  style={{ padding: "0.35rem 0.65rem", fontSize: "0.75rem" }}
                >
                  Close Compare
                </button>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
                {/* Scan A */}
                <div style={{ borderRight: "1px solid var(--border-color)", paddingRight: "2rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                    <div>
                      <h4 style={{ fontWeight: 700, fontSize: "0.95rem" }}>Version A (Older)</h4>
                      <p style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>
                        Scanned: {new Date(comparisonResult.scanA.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--text-secondary)" }}>
                      {comparisonResult.scanA.atsScore}%
                    </span>
                  </div>
                  
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "0.85rem" }}>
                    <div>
                      <strong>Company/Role:</strong> {comparisonResult.scanA.companyName || "N/A"} - {comparisonResult.scanA.jobRole || "N/A"}
                    </div>
                    <div>
                      <strong>Matched Skills ({comparisonResult.scanA.matchedSkills.length}):</strong>
                      <p style={{ color: "var(--text-muted)" }}>{comparisonResult.scanA.matchedSkills.join(", ") || "None"}</p>
                    </div>
                    <div>
                      <strong>Missing Skills ({comparisonResult.scanA.missingSkills.length}):</strong>
                      <p style={{ color: "var(--text-muted)" }}>{comparisonResult.scanA.missingSkills.join(", ") || "None"}</p>
                    </div>
                    <div>
                      <strong>Reported Mistakes ({comparisonResult.scanA.mistakes.length}):</strong>
                      <ul style={{ paddingLeft: "15px", color: "var(--text-muted)" }}>
                        {comparisonResult.scanA.mistakes.slice(0, 3).map((m, i) => <li key={i}>{m}</li>)}
                        {comparisonResult.scanA.mistakes.length > 3 && <li>And {comparisonResult.scanA.mistakes.length - 3} more...</li>}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Scan B */}
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                    <div>
                      <h4 style={{ fontWeight: 700, fontSize: "0.95rem" }}>Version B (Newer)</h4>
                      <p style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>
                        Scanned: {new Date(comparisonResult.scanB.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span style={{ fontSize: "1.2rem", fontWeight: 800, color: getScoreCategory(comparisonResult.scanB.atsScore).color }}>
                        {comparisonResult.scanB.atsScore}%
                      </span>
                      <span 
                        style={{ 
                          fontSize: "0.75rem", 
                          fontWeight: 700, 
                          color: comparisonResult.scoreDiff >= 0 ? "var(--success-color)" : "var(--error-color)",
                          background: comparisonResult.scoreDiff >= 0 ? "rgba(5, 150, 105, 0.1)" : "rgba(220, 38, 38, 0.1)",
                          padding: "2px 6px",
                          borderRadius: "4px"
                        }}
                      >
                        {comparisonResult.scoreDiff >= 0 ? `+${comparisonResult.scoreDiff}` : comparisonResult.scoreDiff}
                      </span>
                    </div>
                  </div>
                  
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "0.85rem" }}>
                    <div>
                      <strong>Company/Role:</strong> {comparisonResult.scanB.companyName || "N/A"} - {comparisonResult.scanB.jobRole || "N/A"}
                    </div>
                    <div>
                      <strong>Matched Skills ({comparisonResult.scanB.matchedSkills.length}):</strong>
                      <p style={{ color: "var(--text-muted)" }}>{comparisonResult.scanB.matchedSkills.join(", ") || "None"}</p>
                    </div>
                    <div>
                      <strong>Missing Skills ({comparisonResult.scanB.missingSkills.length}):</strong>
                      <p style={{ color: "var(--text-muted)" }}>{comparisonResult.scanB.missingSkills.join(", ") || "None"}</p>
                    </div>
                    <div>
                      <strong>Reported Mistakes ({comparisonResult.scanB.mistakes.length}):</strong>
                      <ul style={{ paddingLeft: "15px", color: "var(--text-muted)" }}>
                        {comparisonResult.scanB.mistakes.slice(0, 3).map((m, i) => <li key={i}>{m}</li>)}
                        {comparisonResult.scanB.mistakes.length > 3 && <li>And {comparisonResult.scanB.mistakes.length - 3} more...</li>}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress Summary Message */}
              <div style={{ marginTop: "1.5rem", padding: "0.75rem 1rem", background: "rgba(255,255,255,0.02)", borderRadius: "10px", fontSize: "0.9rem", textAlign: "center" }}>
                {comparisonResult.scoreDiff > 0 ? (
                  <span>🔥 Awesome progression! Score increased by <strong>{comparisonResult.scoreDiff} points</strong>. Matched skills improved by {comparisonResult.skillsBDiff - comparisonResult.skillsADiff} and mistakes reduced by {comparisonResult.mistakesADiff - comparisonResult.mistakesBDiff}.</span>
                ) : comparisonResult.scoreDiff === 0 ? (
                  <span>No score changes detected. Review suggestions in Version B and optimize keywords or skills gaps.</span>
                ) : (
                  <span>⚠️ Score decreased by <strong>{Math.abs(comparisonResult.scoreDiff)} points</strong>. Version B might lack target keywords or required skills relevant to this role.</span>
                )}
              </div>
            </div>
          )}

          {/* Analysis History Section */}
          <div className="glass" style={{ padding: "2.25rem", overflowX: "auto", borderRadius: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <div>
                <h3 style={{ fontSize: "1.25rem", fontWeight: 800 }}>Analysis History Log</h3>
                <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Select 2 logs below and click compare to evaluate version improvements.</p>
              </div>
              
              {selectedAnalysesForCompare.length === 2 && (
                <button 
                  className="btn btn-primary" 
                  onClick={handleCompare}
                  style={{ padding: "0.45rem 1rem", fontSize: "0.85rem" }}
                >
                  Compare Selected Resumes
                </button>
              )}
            </div>

            {atsHistory.length === 0 ? (
              <div style={{ color: "var(--text-muted)", padding: "1.5rem 0", textAlign: "center" }}>
                No past resume analyses recorded. Scanned results will accumulate here.
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th style={{ width: "60px", textAlign: "center" }}>Select</th>
                    <th>Scanned On</th>
                    <th>Resume File</th>
                    <th>Company / Role</th>
                    <th>ATS Score</th>
                    <th>Category</th>
                    <th style={{ textAlign: "right" }}>Inspect / Delete</th>
                  </tr>
                </thead>
                <tbody>
                  {atsHistory.map((historyItem) => {
                    const isSelected = selectedAnalysesForCompare.some(x => x._id === historyItem._id);
                    const cat = getScoreCategory(historyItem.atsScore);
                    const isActive = analysisResult?._id === historyItem._id;
                    return (
                      <tr 
                        key={historyItem._id} 
                        onClick={() => {
                          setAnalysisResult(historyItem);
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        className={isActive ? "active-row" : ""}
                        style={{ cursor: "pointer" }}
                      >
                        <td style={{ textAlign: "center" }} onClick={(e) => e.stopPropagation()}>
                          <input 
                            type="checkbox" 
                            style={{ cursor: "pointer", width: "16px", height: "16px" }}
                            checked={isSelected}
                            onChange={(e) => handleSelectForCompare(historyItem, e)} 
                          />
                        </td>
                        <td>{new Date(historyItem.createdAt).toLocaleDateString()}</td>
                        <td>
                          <span style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>
                            {historyItem.resumeName || "Resume"}
                          </span>
                        </td>
                        <td>
                          <strong>{historyItem.companyName || "General"}</strong> - {historyItem.jobRole || "Analysis"}
                        </td>
                        <td>
                          <strong style={{ color: cat.color }}>{historyItem.atsScore}%</strong>
                        </td>
                        <td>
                          <span 
                            style={{ 
                                display: "inline-block", 
                                padding: "2px 8px", 
                                borderRadius: "4px", 
                                fontSize: "0.75rem", 
                                fontWeight: 800, 
                                color: cat.color, 
                                background: cat.bg 
                            }}
                          >
                            {cat.label}
                          </span>
                        </td>
                        <td style={{ textAlign: "right" }} onClick={(e) => e.stopPropagation()}>
                          <div style={{ display: "inline-flex", gap: "0.5rem" }}>
                            <button
                              className="btn"
                              onClick={() => {
                                setAnalysisResult(historyItem);
                                window.scrollTo({ top: 0, behavior: "smooth" });
                              }}
                              style={{ padding: "0.35rem 0.65rem", fontSize: "0.75rem", borderRadius: "6px" }}
                            >
                              View
                            </button>
                            <button
                              className="btn btn-danger"
                              onClick={(e) => handleDeleteHistory(historyItem._id, e)}
                              style={{ padding: "0.35rem 0.65rem", fontSize: "0.75rem", borderRadius: "6px" }}
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

        </div>
      )}

      {/* Internship Details Modal Overlay */}
      {selectedInternship && (
        <div className="modal-overlay" onClick={() => setSelectedInternship(null)}>
          <div className="modal-card glass" style={{ width: "95%", maxWidth: "640px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <Briefcase size={24} style={{ color: "var(--primary-color)" }} />
                <h3 style={{ color: "var(--text-main)", fontWeight: 800, fontSize: "1.6rem" }}>Internship Details</h3>
              </div>
              <button 
                className="btn" 
                onClick={() => setSelectedInternship(null)}
                style={{ padding: "0.4rem 0.8rem", borderRadius: "8px", fontSize: "0.85rem" }}
              >
                ✕ Close
              </button>
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              <div>
                <span className="card-tag" style={{ display: "inline-block", marginBottom: "0.5rem" }}>
                  {selectedInternship.location}
                </span>
                <h2 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--text-main)", marginBottom: "0.25rem" }}>
                  {selectedInternship.title}
                </h2>
                <p style={{ color: "var(--primary-color)", fontWeight: 700, fontSize: "1.1rem" }}>
                  {selectedInternship.company}
                </p>
              </div>

              <div style={{ 
                display: "grid", 
                gridTemplateColumns: "1fr 1fr", 
                gap: "1rem", 
                padding: "1rem", 
                background: "rgba(255,255,255,0.02)", 
                borderRadius: "12px",
                border: "1px solid rgba(255,255,255,0.05)"
              }}>
                <div>
                  <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block", textTransform: "uppercase" }}>Monthly Stipend</span>
                  <strong style={{ color: "var(--success-color)", fontSize: "1.15rem" }}>
                    ₹{(selectedInternship.stipend || 0).toLocaleString()}/mo
                  </strong>
                </div>
                <div>
                  <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block", textTransform: "uppercase" }}>Location Type</span>
                  <strong style={{ color: "var(--text-main)", fontSize: "1.15rem" }}>{selectedInternship.location}</strong>
                </div>
              </div>

              <div>
                <h4 style={{ color: "var(--text-main)", marginBottom: "0.5rem", fontWeight: 700 }}>Role Description</h4>
                <p style={{ 
                  color: "var(--text-secondary)", 
                  lineHeight: "1.6", 
                  fontSize: "0.95rem", 
                  maxHeight: "200px", 
                  overflowY: "auto",
                  paddingRight: "0.5rem"
                }}>
                  {selectedInternship.description}
                </p>
              </div>

              <div>
                <h4 style={{ color: "var(--text-main)", marginBottom: "0.5rem", fontWeight: 700 }}>Required Skills Stack</h4>
                <div className="skills-list">
                  {selectedInternship.skillsRequired.map((skill, sIdx) => {
                    const matched = !isRecruiterMode && user?.skills?.some(s => s.toLowerCase() === skill.toLowerCase());
                    return (
                      <span key={sIdx} className={`skill-badge ${isRecruiterMode ? "matched" : matched ? "matched" : "missing"}`}>
                        {skill}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Action Button */}
              {user?.role === "user" ? (
                <button
                  className={`btn ${hasApplied(selectedInternship._id) ? "" : "btn-primary"}`}
                  disabled={hasApplied(selectedInternship._id) || !user?.resumeUrl}
                  onClick={() => {
                    handleApply(selectedInternship._id);
                    setSelectedInternship(null);
                  }}
                  style={{ width: "100%", padding: "0.8rem", borderRadius: "12px", fontWeight: 700 }}
                >
                  {hasApplied(selectedInternship._id) ? "Already Applied" : user?.resumeUrl ? "Apply Now" : "Upload PDF to Apply"}
                </button>
              ) : (
                <div style={{ color: "var(--text-muted)", fontSize: "0.85rem", fontStyle: "italic", textAlign: "center" }}>
                  Viewing as {user?.role === "admin" ? "Admin" : "Recruiter"} (Read-Only Preview)
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ================= RECRUITER DASHBOARD =================
function RecruiterDashboard({ darkMode, setDarkMode }) {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("applications");
  
  // List states
  const [applications, setApplications] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Email Acceptance Modal states
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");

  // Post form states
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState(user?.company || "");
  const [description, setDescription] = useState("");
  const [skillsRequired, setSkillsRequired] = useState("");
  const [location, setLocation] = useState("");
  const [stipend, setStipend] = useState("");

  useEffect(() => {
    if (user?.company) {
      setCompany(user.company);
    }
  }, [user]);

  const fetchApplications = async () => {
    try {
      const res = await API.get("/admin/applications");
      setApplications(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleCreateInternship = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      await API.post("/admin/internship", {
        title,
        company,
        description,
        skillsRequired,
        location,
        stipend: Number(stipend)
      });
      setSuccess("Internship opportunity posted successfully!");
      // Reset form
      setTitle("");
      setCompany("");
      setDescription("");
      setSkillsRequired("");
      setLocation("");
      setStipend("");
      setActiveTab("applications"); // Switch tab to review applications
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to post internship.");
    }
  };

  const handleStatusChange = async (appId, newStatus) => {
    setError("");
    setSuccess("");

    if (newStatus === "Accepted") {
      const appObj = applications.find(a => a._id === appId);
      if (appObj) {
        const subject = `Congratulations! You have been accepted at ${appObj.internship?.company || "Company"} for ${appObj.internship?.title || "Role"}`;
        const body = `Dear ${appObj.user?.name || "Student"},\n\nWe are thrilled to inform you that your application for the "${appObj.internship?.title || "Role"}" position at ${appObj.internship?.company || "Company"} has been accepted!\n\nWe were highly impressed by your profile and matching score of ${appObj.matchPercentage || 0}%.\n\nNext steps:\n1. Our HR team will reach out to you within 2 business days to discuss the onboarding process.\n2. Please keep your resume and academic transcripts ready for verification.\n\nWe look forward to having you on board!\n\nBest regards,\nThe HR Team\n${appObj.internship?.company || "Company"}`;
        
        setSelectedApp(appObj);
        setEmailSubject(subject);
        setEmailBody(body);
        setShowEmailModal(true);
      }
      return;
    }

    try {
      await API.put(`/admin/applications/${appId}/status`, { status: newStatus });
      setSuccess(`Application status updated to ${newStatus}`);
      fetchApplications();
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to update status.");
    }
  };

  const handleSendEmailAcceptance = async (e) => {
    e.preventDefault();
    if (!selectedApp) return;
    setError("");
    setSuccess("");
    try {
      await API.put(`/admin/applications/${selectedApp._id}/status`, {
        status: "Accepted",
        emailSubject,
        emailBody
      });
      setSuccess(`Application approved & acceptance email sent to ${selectedApp.user?.email}!`);
      setShowEmailModal(false);
      setSelectedApp(null);
      fetchApplications();
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to approve application and send email.");
    }
  };

  return (
    <div className="container">
      {/* Header */}
      <header className="glass" style={{ backdropFilter: "blur(20px)", boxShadow: "0 10px 30px rgba(0,0,0,0.2)" }}>
        <div className="brand">
          <div className="logo" style={{ borderRadius: "10px" }}>IN</div>
          <div>
            <h1 className="brand-name" style={{ fontSize: "1.45rem" }}>Internify</h1>
            <p className="brand-tag">Employer Hub</p>
          </div>
        </div>

        <div style={{ display: "flex", gap: "0.85rem", alignItems: "center" }}>
          <button 
            className="btn" 
            onClick={() => setDarkMode(!darkMode)} 
            style={{ padding: "0.55rem 0.85rem", borderRadius: "10px", fontSize: "0.85rem" }}
            title="Toggle Dark Mode"
          >
            {darkMode ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          {user?.role === "admin" && (
            <button className="btn btn-primary" onClick={() => navigate("/admin")} style={{ background: "var(--gradient-indigo-purple)", padding: "0.55rem 1.15rem", borderRadius: "10px", fontSize: "0.85rem", border: "none" }}>
              <span>Admin Console 🛠️</span>
            </button>
          )}
          <button className="btn btn-primary" onClick={() => navigate("/dashboard")} style={{ padding: "0.55rem 1.15rem", borderRadius: "10px", fontSize: "0.85rem" }}>
            <span>Student View 🎓</span>
          </button>
          <button className="btn btn-danger" onClick={logout} style={{ padding: "0.55rem 1.15rem", borderRadius: "10px", fontSize: "0.85rem" }}>
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* Recruiter Welcome Banner */}
      <div className="welcome-banner" style={{ background: "linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)", border: "1px solid rgba(139, 92, 246, 0.12)" }}>
        <div className="welcome-text">
          <h2>Recruiter Workspace 💼</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", maxWidth: "600px", marginTop: "0.5rem" }}>
            Review applicants, analyze match compatibility scores, and trigger custom onboarding workflows for {user?.company || "your organization"}.
          </p>
        </div>
        <div className="welcome-stats">
          <div className="stat-item">
            <div className="stat-val">{applications.length}</div>
            <div className="stat-label">Total Applicants</div>
          </div>
          <div className="stat-item">
            <div className="stat-val">
              {applications.filter(a => a.status === "Pending").length}
            </div>
            <div className="stat-label">Pending Review</div>
          </div>
          <div className="stat-item">
            <div className="stat-val">
              {applications.filter(a => a.status === "Accepted").length}
            </div>
            <div className="stat-label">Accepted Offers</div>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {success && (
        <div className="alert-banner alert-success">
          <CheckCircle size={18} />
          <span>{success}</span>
        </div>
      )}
      {error && (
        <div className="alert-banner alert-error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="nav-tabs" style={{ marginBottom: "2rem" }}>
        <button
          className={`nav-tab-btn ${activeTab === "applications" ? "active" : ""}`}
          onClick={() => setActiveTab("applications")}
        >
          <UserIcon size={16} />
          <span>Review Student Applications ({applications.length})</span>
        </button>
        <button
          className={`nav-tab-btn ${activeTab === "post" ? "active" : ""}`}
          onClick={() => setActiveTab("post")}
        >
          <Plus size={16} />
          <span>Post Internship Opportunity</span>
        </button>
      </div>

      {/* Review Student Applications Workspace */}
      {activeTab === "applications" && (
        <div className="glass" style={{ padding: "2.25rem", overflowX: "auto", borderRadius: "20px", animation: "modalFadeIn 0.3s" }}>
          <div style={{ marginBottom: "1.5rem" }}>
            <h3 style={{ fontSize: "1.5rem", fontWeight: 800 }}>Applicant Workspace</h3>
            <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>Review applications, verify resume files, and accept/reject candidates.</p>
          </div>

          {applications.length === 0 ? (
            <p style={{ color: "var(--text-muted)", padding: "1rem 0" }}>No student applications received yet.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Student Candidate</th>
                  <th>Position Applied</th>
                  <th>Match Score</th>
                  <th>Skills Gap</th>
                  <th>Resume PDF</th>
                  <th>Action / Status</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => {
                  const isOwner = user?._id === (app.internship?.postedBy?._id || app.internship?.postedBy);
                  return (
                    <tr key={app._id}>
                      <td>
                        <div><strong style={{ color: "var(--text-main)", fontSize: "0.95rem" }}>{app.user?.name || "Deleted Student"}</strong></div>
                        <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{app.user?.email || ""}</div>
                      </td>
                      <td>
                        <div><strong style={{ color: "var(--text-main)", fontSize: "0.95rem" }}>{app.internship?.title || "Deleted Internship"}</strong></div>
                        <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "flex", flexDirection: "column", gap: "2px" }}>
                          <span>{app.internship?.company || ""}</span>
                          {user?.role === "admin" && app.internship?.postedBy && (
                            <span style={{ fontSize: "0.75rem", color: "var(--accent-color)", fontWeight: 500 }}>
                              Posted by: {app.internship.postedBy.name} ({app.internship.postedBy.role === "admin" ? "Admin" : "Recruiter"})
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          <div className="progress-container" style={{ width: "60px" }}>
                            <div
                              className="progress-bar"
                              style={{ 
                                width: `${app.matchPercentage}%`,
                                background: "linear-gradient(90deg, var(--primary-color), var(--purple-color))"
                              }}
                            ></div>
                          </div>
                          <span style={{ fontWeight: 800, color: "var(--primary-color)", fontSize: "0.9rem" }}>{app.matchPercentage}%</span>
                        </div>
                      </td>
                      <td>
                        <div className="skills-list" style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                          {app.missingSkills && app.missingSkills.length > 0 ? (
                            app.missingSkills.map((sk, idx) => (
                              <span key={idx} className="skill-badge missing" style={{ fontSize: "0.75rem", padding: "0.2rem 0.5rem" }}>
                                {sk}
                              </span>
                            ))
                          ) : (
                            <span style={{ color: "var(--success-color)", fontSize: "0.85rem", fontWeight: 600 }}>Perfect Match! 🎉</span>
                          )}
                        </div>
                      </td>
                      <td>
                        {app.user?.resumeUrl ? (
                          <a
                            href={getBackendUrl(app.user.resumeUrl)}
                            target="_blank"
                            rel="noreferrer"
                            className="btn"
                            style={{ padding: "0.45rem 0.85rem", fontSize: "0.85rem", gap: "0.35rem", borderRadius: "8px" }}
                          >
                            <FileText size={14} style={{ color: "var(--primary-color)" }} />
                            <span>View Resume</span>
                          </a>
                        ) : (
                          <span style={{ color: "var(--error-color)", fontSize: "0.85rem", fontWeight: 600 }}>No Resume</span>
                        )}
                      </td>
                      <td>
                        <div style={{ display: "inline-flex", alignItems: "center", position: "relative" }}>
                          <select
                            className="form-control"
                            disabled={!isOwner}
                            style={{ 
                              padding: "0.45rem 1.75rem 0.45rem 0.75rem", 
                              borderRadius: "10px", 
                              width: "135px", 
                              fontWeight: 700,
                              fontSize: "0.85rem",
                              cursor: !isOwner ? "default" : "pointer",
                              background: !isOwner ? "rgba(255,255,255,0.05)" : "#ffffff",
                              borderColor: "rgba(0, 0, 0, 0.12)",
                              color: "var(--text-main)",
                              opacity: !isOwner ? 0.7 : 1
                            }}
                            value={app.status}
                            onChange={(e) => handleStatusChange(app._id, e.target.value)}
                          >
                            <option value="Pending">Pending ⌛</option>
                            <option value="Accepted">Accepted ✅</option>
                            <option value="Rejected">Rejected ❌</option>
                          </select>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Post Internship Form */}
      {activeTab === "post" && (
        <div className="profile-card glass" style={{ maxWidth: "600px", margin: "0 auto", animation: "modalFadeIn 0.3s" }}>
          <h3 style={{ marginBottom: "1.5rem", fontWeight: 800 }}>Post New Internship Opportunity</h3>
          <form onSubmit={handleCreateInternship}>
            <div className="form-group">
              <label>Internship Title</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. React Developer Intern"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Company Name</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. TechCorp"
                required
                disabled={!!user?.company}
                value={company}
                onChange={(e) => setCompany(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Role Description</label>
              <textarea
                className="form-control"
                placeholder="Describe role responsibilities, team details, etc..."
                required
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{ resize: "vertical" }}
              />
            </div>

            <div className="form-group">
              <label>Required Skills (comma separated)</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. React, JavaScript, Node.js, CSS"
                required
                value={skillsRequired}
                onChange={(e) => setSkillsRequired(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Location</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Remote / Bangalore / New Delhi"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Stipend (INR per month)</label>
              <input
                type="number"
                className="form-control"
                placeholder="e.g. 15000"
                required
                value={stipend}
                onChange={(e) => setStipend(e.target.value)}
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: "1rem", borderRadius: "12px", padding: "0.8rem", fontWeight: 700 }}>
              Publish Opportunity
            </button>
          </form>
        </div>
      )}

      {/* Email Modal Overlay */}
      {showEmailModal && (
        <div className="modal-overlay">
          <div className="modal-card glass" style={{ width: "95%", maxWidth: "580px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
              <CheckCircle size={22} style={{ color: "var(--success-color)" }} />
              <h3 style={{ color: "var(--text-main)", fontWeight: 800, fontSize: "1.45rem" }}>Send Acceptance Email</h3>
            </div>
            
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
              Approve <strong>{selectedApp?.user?.name}</strong>'s application for the role of <strong>{selectedApp?.internship?.title}</strong> and send an automated onboarding email.
            </p>
            
            <form onSubmit={handleSendEmailAcceptance}>
              <div className="form-group">
                <label>Email Subject</label>
                <input
                  type="text"
                  className="form-control"
                  required
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Email Body</label>
                <textarea
                  className="form-control"
                  required
                  rows={8}
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  style={{ fontFamily: "inherit", lineHeight: "1.5", fontSize: "0.9rem", resize: "none" }}
                />
              </div>
              <div style={{ display: "flex", gap: "1rem", marginTop: "1.75rem" }}>
                <button type="submit" className="btn btn-primary" style={{ background: "var(--gradient-emerald)", boxShadow: "0 4px 12px rgba(16, 185, 129, 0.25)" }}>
                  Send Email & Approve
                </button>
                <button
                  type="button"
                  className="btn"
                  onClick={() => {
                    setShowEmailModal(false);
                    setSelectedApp(null);
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ================= ADMIN DASHBOARD =================
function AdminDashboard({ darkMode, setDarkMode }) {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("internships");
  
  // List states
  const [internships, setInternships] = useState([]);
  const [applications, setApplications] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Details Modal State
  const [selectedInternship, setSelectedInternship] = useState(null);

  const fetchInternships = async () => {
    try {
      const res = await API.get("/internships");
      setInternships(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchApplications = async () => {
    try {
      const res = await API.get("/admin/applications");
      setApplications(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchInternships();
    fetchApplications();
  }, []);

  const handleDeleteInternship = async (id) => {
    if (!window.confirm("Are you sure you want to delete this internship post? This will also remove all candidate applications for it.")) return;
    setError("");
    setSuccess("");
    try {
      await API.delete(`/admin/internship/${id}`);
      setSuccess("Internship post deleted successfully.");
      fetchInternships();
      fetchApplications();
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to delete internship.");
    }
  };

  return (
    <div className="container">
      {/* Header */}
      <header className="glass" style={{ backdropFilter: "blur(20px)", boxShadow: "0 10px 30px rgba(0,0,0,0.2)" }}>
        <div className="brand">
          <div className="logo" style={{ borderRadius: "10px" }}>IN</div>
          <div>
            <h1 className="brand-name" style={{ fontSize: "1.45rem" }}>Internify</h1>
            <p className="brand-tag">Developer Admin Console 🛠️</p>
          </div>
        </div>

        <div style={{ display: "flex", gap: "0.85rem", alignItems: "center" }}>
          <button 
            className="btn" 
            onClick={() => setDarkMode(!darkMode)} 
            style={{ padding: "0.55rem 0.85rem", borderRadius: "10px", fontSize: "0.85rem" }}
            title="Toggle Dark Mode"
          >
            {darkMode ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <button className="btn btn-primary" onClick={() => navigate("/recruiter")} style={{ background: "var(--gradient-emerald)", padding: "0.55rem 1.15rem", borderRadius: "10px", fontSize: "0.85rem", border: "none" }}>
            <span>Recruiter Console 💼</span>
          </button>
          <button className="btn btn-primary" onClick={() => navigate("/dashboard")} style={{ padding: "0.55rem 1.15rem", borderRadius: "10px", fontSize: "0.85rem" }}>
            <span>Student View 🎓</span>
          </button>
          <button className="btn btn-danger" onClick={logout} style={{ padding: "0.55rem 1.15rem", borderRadius: "10px", fontSize: "0.85rem" }}>
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* Admin Welcome Banner */}
      <div className="welcome-banner" style={{ background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)", border: "1px solid rgba(34, 197, 94, 0.12)" }}>
        <div className="welcome-text">
          <h2 style={{ color: "#166534" }}>System Control Panel 🖥️</h2>
          <p style={{ color: "#1b4332", fontSize: "0.95rem", maxWidth: "600px", marginTop: "0.5rem" }}>
            Platform-wide management portal. You can view all internships, monitor student applications, and delete/remove active posts.
          </p>
        </div>
        <div className="welcome-stats">
          <div className="stat-item" style={{ background: "rgba(22, 101, 52, 0.05)", border: "1px solid rgba(22, 101, 52, 0.1)" }}>
            <div className="stat-val" style={{ color: "#166534" }}>{internships.length}</div>
            <div className="stat-label" style={{ color: "#166534" }}>Total Internships</div>
          </div>
          <div className="stat-item" style={{ background: "rgba(22, 101, 52, 0.05)", border: "1px solid rgba(22, 101, 52, 0.1)" }}>
            <div className="stat-val" style={{ color: "#166534" }}>{applications.length}</div>
            <div className="stat-label" style={{ color: "#166534" }}>Total Applications</div>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {success && (
        <div className="alert-banner alert-success">
          <CheckCircle size={18} />
          <span>{success}</span>
        </div>
      )}
      {error && (
        <div className="alert-banner alert-error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="nav-tabs" style={{ marginBottom: "2rem" }}>
        <button
          className={`nav-tab-btn ${activeTab === "internships" ? "active" : ""}`}
          onClick={() => setActiveTab("internships")}
        >
          <Briefcase size={16} />
          <span>Manage Active Posts ({internships.length})</span>
        </button>
        <button
          className={`nav-tab-btn ${activeTab === "applications" ? "active" : ""}`}
          onClick={() => setActiveTab("applications")}
        >
          <UserIcon size={16} />
          <span>Monitor Applications ({applications.length})</span>
        </button>
      </div>

      {/* Manage Internships Workspace */}
      {activeTab === "internships" && (
        <div className="glass" style={{ padding: "2.25rem", overflowX: "auto", borderRadius: "20px", animation: "modalFadeIn 0.3s" }}>
          <div style={{ marginBottom: "1.5rem" }}>
            <h3 style={{ fontSize: "1.5rem", fontWeight: 800 }}>Platform Internship Opportunities</h3>
            <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>Monitor, inspect, or delete active internship listings on the platform.</p>
          </div>

          {internships.length === 0 ? (
            <p style={{ color: "var(--text-muted)", padding: "1rem 0" }}>No internships posted on the platform yet.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Job Title / Company</th>
                  <th>Location</th>
                  <th>Monthly Stipend</th>
                  <th>Date Posted</th>
                  <th>Inspect Details</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {internships.map((it) => (
                  <tr key={it._id}>
                    <td>
                      <div><strong style={{ color: "var(--text-main)", fontSize: "0.95rem" }}>{it.title}</strong></div>
                      <div style={{ fontSize: "0.85rem", color: "var(--primary-color)", fontWeight: 600 }}>{it.company}</div>
                    </td>
                    <td>{it.location}</td>
                    <td style={{ color: "var(--success-color)", fontWeight: 600 }}>
                      ₹{(it.stipend || 0).toLocaleString()}/mo
                    </td>
                    <td>{new Date(it.postedAt).toLocaleDateString()}</td>
                    <td>
                      <button 
                        className="btn" 
                        onClick={() => setSelectedInternship(it)}
                        style={{ padding: "0.4rem 0.85rem", fontSize: "0.85rem", borderRadius: "8px" }}
                      >
                        <Eye size={14} style={{ color: "var(--primary-color)" }} />
                        <span>View Details</span>
                      </button>
                    </td>
                    <td>
                      <button 
                        className="btn btn-danger" 
                        onClick={() => handleDeleteInternship(it._id)}
                        style={{ padding: "0.4rem 0.85rem", fontSize: "0.85rem", borderRadius: "8px", fontWeight: 700 }}
                      >
                        ✕ Remove Post
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Monitor Applications Workspace */}
      {activeTab === "applications" && (
        <div className="glass" style={{ padding: "2.25rem", overflowX: "auto", borderRadius: "20px", animation: "modalFadeIn 0.3s" }}>
          <div style={{ marginBottom: "1.5rem" }}>
            <h3 style={{ fontSize: "1.5rem", fontWeight: 800 }}>Platform Applications Monitor</h3>
            <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>Read-only tracking log of all candidate submissions. Approvals are recruiter-managed.</p>
          </div>

          {applications.length === 0 ? (
            <p style={{ color: "var(--text-muted)", padding: "1rem 0" }}>No applications submitted yet.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Student Candidate</th>
                  <th>Position Applied</th>
                  <th>Match Score</th>
                  <th>Resume PDF</th>
                  <th>Applied Date</th>
                  <th>Current Status</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => (
                  <tr key={app._id}>
                    <td>
                      <div><strong style={{ color: "var(--text-main)", fontSize: "0.95rem" }}>{app.user?.name || "Deleted Student"}</strong></div>
                      <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{app.user?.email || ""}</div>
                    </td>
                    <td>
                      <div><strong style={{ color: "var(--text-main)", fontSize: "0.95rem" }}>{app.internship?.title || "Deleted Internship"}</strong></div>
                      <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{app.internship?.company || ""}</div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 800, color: "var(--primary-color)" }}>{app.matchPercentage}%</span>
                    </td>
                    <td>
                      {app.user?.resumeUrl ? (
                        <a
                          href={getBackendUrl(app.user.resumeUrl)}
                          target="_blank"
                          rel="noreferrer"
                          className="btn"
                          style={{ padding: "0.4rem 0.85rem", fontSize: "0.85rem", borderRadius: "8px" }}
                        >
                          <FileText size={14} style={{ color: "var(--primary-color)" }} />
                          <span>View PDF</span>
                        </a>
                      ) : (
                        <span style={{ color: "var(--error-color)", fontSize: "0.85rem", fontWeight: 600 }}>No Resume</span>
                      )}
                    </td>
                    <td>{new Date(app.appliedAt).toLocaleDateString()}</td>
                    <td>
                      <span className={`status-pill ${app.status.toLowerCase()}`}>
                        <span className={`pulse-dot ${app.status === "Pending" ? "animating" : ""}`} />
                        <span>{app.status}</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Internship Details Modal */}
      {selectedInternship && (
        <div className="modal-overlay" onClick={() => setSelectedInternship(null)}>
          <div className="modal-card glass" style={{ width: "95%", maxWidth: "640px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <Briefcase size={24} style={{ color: "var(--primary-color)" }} />
                <h3 style={{ color: "var(--text-main)", fontWeight: 800, fontSize: "1.6rem" }}>Internship Details</h3>
              </div>
              <button 
                className="btn" 
                onClick={() => setSelectedInternship(null)}
                style={{ padding: "0.4rem 0.8rem", borderRadius: "8px", fontSize: "0.85rem" }}
              >
                ✕ Close
              </button>
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              <div>
                <span className="card-tag" style={{ display: "inline-block", marginBottom: "0.5rem" }}>
                  {selectedInternship.location}
                </span>
                <h2 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--text-main)", marginBottom: "0.25rem" }}>
                  {selectedInternship.title}
                </h2>
                <p style={{ color: "var(--primary-color)", fontWeight: 700, fontSize: "1.1rem" }}>
                  {selectedInternship.company}
                </p>
              </div>

              <div style={{ 
                display: "grid", 
                gridTemplateColumns: "1fr 1fr", 
                gap: "1rem", 
                padding: "1rem", 
                background: "rgba(255,255,255,0.02)", 
                borderRadius: "12px",
                border: "1px solid rgba(255,255,255,0.05)"
              }}>
                <div>
                  <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block", textTransform: "uppercase" }}>Monthly Stipend</span>
                  <strong style={{ color: "var(--success-color)", fontSize: "1.15rem" }}>
                    ₹{(selectedInternship.stipend || 0).toLocaleString()}/mo
                  </strong>
                </div>
                <div>
                  <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block", textTransform: "uppercase" }}>Location Type</span>
                  <strong style={{ color: "var(--text-main)", fontSize: "1.15rem" }}>{selectedInternship.location}</strong>
                </div>
              </div>

              <div>
                <h4 style={{ color: "var(--text-main)", marginBottom: "0.5rem", fontWeight: 700 }}>Role Description</h4>
                <p style={{ 
                  color: "var(--text-secondary)", 
                  lineHeight: "1.6", 
                  fontSize: "0.95rem", 
                  maxHeight: "200px", 
                  overflowY: "auto",
                  paddingRight: "0.5rem"
                }}>
                  {selectedInternship.description}
                </p>
              </div>

              <div>
                <h4 style={{ color: "var(--text-main)", marginBottom: "0.5rem", fontWeight: 700 }}>Required Skills Stack</h4>
                <div className="skills-list">
                  {selectedInternship.skillsRequired.map((skill, sIdx) => {
                    return (
                      <span key={sIdx} className="skill-badge matched">
                        {skill}
                      </span>
                    );
                  })}
                </div>
              </div>

              <div style={{ color: "var(--text-muted)", fontSize: "0.85rem", fontStyle: "italic", textAlign: "center" }}>
                Viewing as System Developer Admin (Read-Only Preview)
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

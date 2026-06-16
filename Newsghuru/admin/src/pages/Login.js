import React, { useState } from "react";
import API from "../config/api";
import { useNavigate } from "react-router-dom";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaBolt, FaShieldAlt, FaGlobe, FaEdit, FaMicrophone, FaCheckCircle } from "react-icons/fa";
import "../styles/Login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("reporter");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const res = await API.post("/api/login", {
        email,
        password,
        role,
      });

      const token = res.data?.token;
      const verifiedRole = res.data?.user?.role;

      if (!token) {
        throw new Error("Token not received");
      }

      // store token and role
      localStorage.setItem("token", token);
      localStorage.setItem("role", verifiedRole);
      if (res.data?.user?.name) {
        localStorage.setItem("userName", res.data.user.name);
      }

      alert("Login successful 🎉");

      // Redirect based on role
      if (verifiedRole === "admin") {
        navigate("/admin/dashboard");
      } else if (verifiedRole === "editor") {
        navigate("/editor/pending");
      } else if (verifiedRole === "reporter") {
        navigate("/reporter/create-news");
      } else {
        navigate("/");
      }

      // Force a page reload to update App layout state
      window.location.reload();

    } catch (error) {
      console.error("Login Error:", error);
      alert("Invalid email, password, or role ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page-wrapper">
      
      {/* LEFT COLUMN: BRANDING BANNER */}
      <div className="login-side-banner">
        <div className="banner-content">
          <div className="brand-logo-name">
            <span className="brand-dot"></span>
            <h1>NewsGhuru</h1>
          </div>
          <div className="brand-underline"></div>
          
          <h2 className="banner-slogan">
            Stay <span className="highlight">Informed.</span><br />
            Stay <span className="highlight-orange">Ahead.</span>
          </h2>
          
          <p className="banner-description">
            Your trusted source for news, latest stories and updates from around the world.
          </p>
          
          <div className="features-list">
            <div className="feature-item">
              <span className="feature-icon">
                <FaBolt />
              </span>
              <div className="feature-text">
                <h4>Stay Up-to-date</h4>
                <p>Get instant access to breaking news.</p>
              </div>
            </div>
            
            <div className="feature-item">
              <span className="feature-icon">
                <FaShieldAlt />
              </span>
              <div className="feature-text">
                <h4>Trusted Reporting</h4>
                <p>We verify facts, you stay informed.</p>
              </div>
            </div>
            
            <div className="feature-item">
              <span className="feature-icon">
                <FaGlobe />
              </span>
              <div className="feature-text">
                <h4>Multi-category</h4>
                <p>Sports, Politics, Tech & Entertainment.</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Themed glowing globe visual */}
        <div className="globe-graphic-container">
          <div className="glowing-globe"></div>
          <div className="globe-grid"></div>
        </div>
      </div>
      
      {/* RIGHT COLUMN: LOGIN FORM */}
      <div className="login-form-pane">
        <form className="login-form-card" onSubmit={handleLogin}>
          
          <div className="avatar-header">
            <div className="avatar-circle">
              <span className="avatar-icon">
                <FaLock />
              </span>
            </div>
            <h2>Welcome Back!</h2>
            <p>To keep connected with us</p>
          </div>

          {/* Role selection cards */}
          <div className="role-selection-container">
            <p className="role-selection-label">Select Your Role</p>
            <div className="role-cards-grid">
              <div
                className={`role-card ${role === "admin" ? "selected" : ""}`}
                onClick={() => setRole("admin")}
              >
                {role === "admin" && (
                  <span className="role-card-badge">
                    <FaCheckCircle />
                  </span>
                )}
                <div className="role-card-icon">
                  <FaShieldAlt />
                </div>
                <h4 className="role-card-title">Super Admin</h4>
                <p className="role-card-description">Full access to all modules and settings</p>
              </div>

              <div
                className={`role-card ${role === "editor" ? "selected" : ""}`}
                onClick={() => setRole("editor")}
              >
                {role === "editor" && (
                  <span className="role-card-badge">
                    <FaCheckCircle />
                  </span>
                )}
                <div className="role-card-icon">
                  <FaEdit />
                </div>
                <h4 className="role-card-title">Editor</h4>
                <p className="role-card-description">Manage and edit news contents</p>
              </div>

              <div
                className={`role-card ${role === "reporter" ? "selected" : ""}`}
                onClick={() => setRole("reporter")}
              >
                {role === "reporter" && (
                  <span className="role-card-badge">
                    <FaCheckCircle />
                  </span>
                )}
                <div className="role-card-icon">
                  <FaMicrophone />
                </div>
                <h4 className="role-card-title">Reporter</h4>
                <p className="role-card-description">Create and submit news articles</p>
              </div>
            </div>
          </div>

          <div className="form-group-with-icon">
            <span className="input-icon">
              <FaEnvelope />
            </span>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group-with-icon password-group">
            <span className="input-icon">
              <FaLock />
            </span>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
            <button
              type="button"
              className="password-toggle-btn"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          <button type="submit" className="login-action-btn" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
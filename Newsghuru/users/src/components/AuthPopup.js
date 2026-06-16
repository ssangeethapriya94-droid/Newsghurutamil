import React, { useState } from "react";
import { FaTimes } from "react-icons/fa";
import API from "../config/api";
import "../styles/AuthPopup.css";
import { generateFCMToken } from "../firebase";

const AuthPopup = ({ onClose, onLoginSuccess, isSubscribeFlow }) => {
  const [activeTab, setActiveTab] = useState("login"); // 'login' or 'register'
  
  // Form States
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [highlight, setHighlight] = useState(false);

  const handleCloseClick = () => {
    const token = localStorage.getItem("readerToken");
    if (!token) {
      setHighlight(true);
      setTimeout(() => setHighlight(false), 1000); // Remove highlight after 1 second
    } else {
      if (onClose) onClose();
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    setError("");
    setSuccess("");
    
    if (activeTab === "register") {
      if (!formData.name || !formData.email || !formData.password) {
        setError("Please fill all required fields");
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match");
        return false;
      }
      if (formData.password.length < 6) {
        setError("Password must be at least 6 characters");
        return false;
      }
    } else {
      if (!formData.email || !formData.password) {
        setError("Please enter email and password");
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      if (activeTab === "register") {
        const payload = {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: "reader" // Hardcode role to reader for public signups
        };
        
        await API.post("/api/register", payload);
        
        if (isSubscribeFlow) {
          // Auto-login to process subscription immediately
          const loginRes = await API.post("/api/login", {
            email: formData.email,
            password: formData.password
          });
          const token = loginRes.data.token;
          localStorage.setItem("readerToken", token);
          localStorage.setItem("readerData", JSON.stringify(loginRes.data.user));

          try {
            const fcmToken = await generateFCMToken();
            if (!fcmToken) {
              setError("❌ Please allow notifications in your browser settings to subscribe.");
              setLoading(false);
              return;
            }
            const subPayload = { fcmToken };
            await API.post("/api/users/subscribe", subPayload, {
              headers: { Authorization: `Bearer ${token}` }
            });
            
            setSuccess("✅ Registration & Subscription Successful");
            setTimeout(() => {
              onLoginSuccess();
              if (onClose) onClose();
            }, 2000);
          } catch (subErr) {
            console.error("Subscription after registration failed", subErr);
            onLoginSuccess();
            if (onClose) onClose();
          }
        } else {
          setSuccess("Account created successfully! Please login to continue.");
          
          // Switch to login tab after registration
          setTimeout(() => {
            setActiveTab("login");
            setSuccess("");
            // Clear registration fields but keep email
            setFormData(prev => ({
              ...prev,
              name: "",
              password: "",
              confirmPassword: ""
            }));
          }, 2000);
        }
        
      } else {
        // Login
        const loginRes = await API.post("/api/login", {
          email: formData.email,
          password: formData.password
        });
        
        const token = loginRes.data.token;
        localStorage.setItem("readerToken", token);
        localStorage.setItem("readerData", JSON.stringify(loginRes.data.user));
        
        if (isSubscribeFlow) {
          try {
            const fcmToken = await generateFCMToken();
            if (!fcmToken) {
              setError("❌ Please allow notifications in your browser settings to subscribe.");
              setLoading(false);
              return;
            }
            const payload = { fcmToken };
            await API.post("/api/users/subscribe", payload, {
              headers: { Authorization: `Bearer ${token}` }
            });
            
            setSuccess("✅ Subscription Successful");
            setTimeout(() => {
              onLoginSuccess();
              if (onClose) onClose();
            }, 2000);
          } catch (subErr) {
            console.error("Subscription after login failed", subErr);
            onLoginSuccess();
            if (onClose) onClose();
          }
        } else {
          onLoginSuccess();
          if (onClose) onClose();
        }
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || "An error occurred. Please try again.";
      if (activeTab === "login" && errorMsg === "Invalid credentials") {
        setError("Invalid credentials. Account not found. Please register first.");
      } else {
        setError(errorMsg);
      }
    } finally {
      if (activeTab === "login" || error) {
        setLoading(false);
      }
    }
  };

  return (
    <div className="auth-popup-overlay">
      <div className="auth-popup-container">
        <div className="auth-popup-header" style={{
          background: highlight ? '#991b1b' : '#d32f2f', 
          color: highlight ? '#ffeb3b' : 'white', 
          padding: '12px 15px', 
          textAlign: 'center', fontWeight: '600', fontSize: '1rem', 
          position: 'relative',
          transition: 'all 0.3s ease',
          transform: highlight ? 'scale(1.02)' : 'scale(1)'
        }}>
          <span>{isSubscribeFlow ? "Login to Subscribe" : "Login Required"}</span>
          <button 
            className="auth-close-btn" 
            onClick={handleCloseClick}
            style={{
              position: 'absolute', top: '50%', right: '15px', transform: 'translateY(-50%)',
              background: 'transparent', border: 'none', color: 'white', fontSize: '1.2rem',
              cursor: 'pointer'
            }}
          >
            <FaTimes />
          </button>
        </div>
        
        <div className="auth-tabs">
          <button 
            className={`auth-tab ${activeTab === "login" ? "active" : ""}`}
            onClick={() => { setActiveTab("login"); setError(""); setSuccess(""); }}
          >
            Login
          </button>
          <button 
            className={`auth-tab ${activeTab === "register" ? "active" : ""}`}
            onClick={() => { setActiveTab("register"); setError(""); setSuccess(""); }}
          >
            Register
          </button>
        </div>

        <div className="auth-form-container">
          <h2>{activeTab === "login" ? "Welcome Back!" : "Create an Account"}</h2>
          
          {error && (
            <div className="auth-error" style={{ display: "flex", flexDirection: "column", gap: "10px", alignItems: "center" }}>
              <span>{error}</span>
              {error.includes("Please register first") && (
                <button 
                  type="button"
                  className="auth-btn" 
                  onClick={() => { setActiveTab("register"); setError(""); }}
                  style={{ width: "fit-content", padding: "6px 12px", fontSize: "0.85rem" }}
                >
                  Go to Register
                </button>
              )}
            </div>
          )}
          {success && <div className="auth-success">{success}</div>}
          
          <form className="auth-form" onSubmit={handleSubmit}>
            {activeTab === "register" && (
              <input 
                type="text" 
                name="name" 
                placeholder="Full Name *" 
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            )}
            
            <input 
              type="email" 
              name="email" 
              placeholder="Email Address *" 
              value={formData.email}
              onChange={handleInputChange}
              required
            />
            
            <input 
              type="password" 
              name="password" 
              placeholder="Password *" 
              value={formData.password}
              onChange={handleInputChange}
              required
            />
            
            {activeTab === "register" && (
              <input 
                type="password" 
                name="confirmPassword" 
                placeholder="Confirm Password *" 
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
              />
            )}
            
            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? "Processing..." : (activeTab === "login" ? "Login" : "Register")}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AuthPopup;

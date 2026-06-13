import React, { useState } from "react";
import { FaTimes } from "react-icons/fa";
import API from "../config/api";
import "../styles/AuthPopup.css";

const AuthPopup = ({ onClose, onLoginSuccess }) => {
  const [activeTab, setActiveTab] = useState("login"); // 'login' or 'register'
  
  // Form States
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: ""
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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
          phone: formData.phone,
          password: formData.password,
          role: "reader" // Hardcode role to reader for public signups
        };
        
        await API.post("/api/register", payload);
        
        setSuccess("Registration Successful! Please login to continue.");
        
        // Switch to login tab after registration
        setTimeout(() => {
          setActiveTab("login");
          setSuccess("");
          // Clear registration fields but keep email
          setFormData(prev => ({
            ...prev,
            name: "",
            phone: "",
            password: "",
            confirmPassword: ""
          }));
        }, 2000);
        
      } else {
        // Login
        const loginRes = await API.post("/api/login", {
          email: formData.email,
          password: formData.password
        });
        
        localStorage.setItem("readerToken", loginRes.data.token);
        localStorage.setItem("readerData", JSON.stringify(loginRes.data.user));
        onLoginSuccess();
      }
    } catch (err) {
      console.error("Auth error:", err);
      setError(err.response?.data?.message || "An error occurred. Please try again.");
    } finally {
      if (activeTab === "login" || error) {
        setLoading(false);
      }
    }
  };

  return (
    <div className="auth-popup-overlay">
      <div className="auth-popup-container">
        <button className="auth-close-btn" onClick={onClose}><FaTimes /></button>
        
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
          
          {error && <div className="auth-error">{error}</div>}
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
            
            {activeTab === "register" && (
              <input 
                type="tel" 
                name="phone" 
                placeholder="Phone Number (Optional)" 
                value={formData.phone}
                onChange={handleInputChange}
              />
            )}
            
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

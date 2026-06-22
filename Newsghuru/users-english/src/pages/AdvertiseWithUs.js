import React, { useState, useEffect } from "react";
import API from "../config/api";
import { FiSend, FiCheckCircle, FiAlertCircle } from "react-icons/fi";
import useSEO from "../hooks/useSEO";
import "../styles/InfoPages.css";

const AdvertiseWithUs = () => {
  useSEO({
    title: "Advertise With Us | Newsghuru",
    description: "Contact us to advertise your business on Newsghuru news portal.",
    keywords: "advertise, advertise with us, news advertising, NewsGhuru Advertising",
  });

  const [formData, setFormData] = useState({
    companyName: "",
    contactPerson: "",
    email: "",
    phone: "",
    website: "",
    advertisementType: "TOP_BANNER",
    message: ""
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [descriptionContent, setDescriptionContent] = useState("");
  const [descLoading, setDescLoading] = useState(true);

  useEffect(() => {
    const fetchAdPageContent = async () => {
      try {
        setDescLoading(true);
        const res = await API.get("/api/pages/advertise?language=en");
        if (res.data && res.data.success) {
          setDescriptionContent(res.data.content || "");
        }
      } catch (err) {
        console.error("Error fetching advertise page description:", err);
      } finally {
        setDescLoading(false);
      }
    };
    fetchAdPageContent();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!formData.companyName || !formData.contactPerson || !formData.email || !formData.phone || !formData.advertisementType) {
      setError("Please fill in all the required details.");
      return;
    }

    try {
      setLoading(true);
      const res = await API.post("/api/ads/requests", formData);
      if (res.data.success) {
        setSuccess(true);
        setFormData({
          companyName: "",
          contactPerson: "",
          email: "",
          phone: "",
          website: "",
          advertisementType: "TOP_BANNER",
          message: ""
        });
      }
    } catch (err) {
      console.error("Ad request submission failed:", err);
      setError(err.response?.data?.message || "Failed to submit inquiry. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="contact-page" style={{ padding: "40px 20px", maxWidth: "800px", margin: "0 auto" }}>
      
      {/* HEADER */}
      <div className="contact-header" style={{ textAlign: "center", marginBottom: "35px" }}>
        <h1 style={{ fontSize: "32px", color: "var(--primary-color)", margin: "0 0 10px 0" }}>Advertise With Us 📢</h1>
        <p style={{ color: "#64748b", fontSize: "16px", maxWidth: "600px", margin: "0 auto" }}>
          Advertise your business on Newsghuru and reach millions of readers.
        </p>
      </div>

      {/* DYNAMIC CMS CONTENT BLOCK */}
      {!descLoading && descriptionContent && (
        <div 
          className="advertise-cms-content"
          dangerouslySetInnerHTML={{ __html: descriptionContent }}
          style={{ 
            background: "var(--bg-light)", padding: "24px", borderRadius: "12px", 
            border: "1px solid var(--border-color)", marginBottom: "30px", 
            color: "var(--text-secondary)", lineHeight: "1.8", fontSize: "15px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.02)"
          }}
        />
      )}

      <div className="contact-container" style={{ background: "white", padding: "30px", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
        
        {success && (
          <div style={{
            background: "#ecfdf5",
            borderLeft: "4px solid #10b981",
            color: "#065f46",
            padding: "16px",
            borderRadius: "6px",
            marginBottom: "25px",
            display: "flex",
            alignItems: "center",
            gap: "12px"
          }}>
            <FiCheckCircle size={24} style={{ color: "#10b981", flexShrink: 0 }} />
            <div>
              <strong style={{ display: "block" }}>Inquiry submitted successfully! 🎉</strong>
              <span style={{ fontSize: "14px" }}>Our team will contact you shortly to share advertising details.</span>
            </div>
          </div>
        )}

        {error && (
          <div style={{
            background: "#fef2f2",
            borderLeft: "4px solid #ef4444",
            color: "#b91c1c",
            padding: "16px",
            borderRadius: "6px",
            marginBottom: "25px",
            display: "flex",
            alignItems: "center",
            gap: "12px"
          }}>
            <FiAlertCircle size={24} style={{ color: "#ef4444", flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="contact-form" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }} className="form-grid-nested">
            <div className="form-group">
              <label style={{ fontWeight: 600, display: "block", marginBottom: "6px" }}>Company Name *</label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleInputChange}
                placeholder="e.g. ABC Textiles"
                required
              />
            </div>

            <div className="form-group">
              <label style={{ fontWeight: 600, display: "block", marginBottom: "6px" }}>Contact Person *</label>
              <input
                type="text"
                name="contactPerson"
                value={formData.contactPerson}
                onChange={handleInputChange}
                placeholder="e.g. Rajesh Kumar"
                required
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }} className="form-grid-nested">
            <div className="form-group">
              <label style={{ fontWeight: 600, display: "block", marginBottom: "6px" }}>Email Address *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="rajesh@company.com"
                required
              />
            </div>

            <div className="form-group">
              <label style={{ fontWeight: 600, display: "block", marginBottom: "6px" }}>Phone Number *</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="9876543210"
                required
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }} className="form-grid-nested">
            <div className="form-group">
              <label style={{ fontWeight: 600, display: "block", marginBottom: "6px" }}>Website URL</label>
              <input
                type="url"
                name="website"
                value={formData.website}
                onChange={handleInputChange}
                placeholder="www.company.com (optional)"
              />
            </div>

            <div className="form-group">
              <label style={{ fontWeight: 600, display: "block", marginBottom: "6px" }}>Preferred Slot *</label>
              <select 
                name="advertisementType" 
                value={formData.advertisementType} 
                onChange={handleInputChange}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: "6px",
                  border: "1px solid #cbd5e1",
                  fontSize: "14px",
                  outline: "none"
                }}
              >
                <option value="HEADER_BANNER">HEADER_BANNER (Top-level Banner / Header)</option>
                <option value="TOP_BANNER">TOP_BANNER (Title Banner)</option>
                <option value="SIDEBAR">SIDEBAR (Right Sidebar)</option>
                <option value="SECTION_BANNER">SECTION_BANNER (Between Sections)</option>
                <option value="ARTICLE_ADVERTISEMENT">ARTICLE_ADVERTISEMENT (Within Article)</option>
                <option value="POPUP_ADVERTISEMENT">POPUP_ADVERTISEMENT (Homepage Popup)</option>
                <option value="FLOATING_ADVERTISEMENT">FLOATING_ADVERTISEMENT (Floating Ad)</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label style={{ fontWeight: 600, display: "block", marginBottom: "6px" }}>Message / Additional Info</label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              placeholder="Enter details about your product or advertisement..."
              rows={4}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "6px",
                border: "1px solid #cbd5e1",
                fontSize: "14px",
                outline: "none",
                resize: "vertical"
              }}
            />
          </div>

          <button 
            type="submit" 
            className="contact-submit-btn" 
            disabled={loading}
            style={{ 
              display: "inline-flex", 
              alignItems: "center", 
              justifyContent: "center", 
              gap: "8px", 
              padding: "12px 24px",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: "16px",
              border: "none",
              background: "linear-gradient(135deg, #f97316, #ea580c)",
              color: "white",
              borderRadius: "6px"
            }}
          >
            <FiSend /> {loading ? "Sending..." : "Submit Inquiry"}
          </button>

        </form>

      </div>
    </section>
  );
};

export default AdvertiseWithUs;

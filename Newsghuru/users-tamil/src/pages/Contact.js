import React, { useState, useEffect } from "react";
import API from "../config/api";
import "../styles/InfoPages.css";
import { FaPaperPlane } from "react-icons/fa";

const Contact = () => {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [descriptionContent, setDescriptionContent] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContactDetails = async () => {
      try {
        setLoading(true);
        const res = await API.get("/api/pages/contact");
        if (res.data && res.data.success) {
          setDescriptionContent(res.data.content || "");
        }
      } catch (err) {
        console.error("Error fetching contact page content:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchContactDetails();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.name && form.email && form.message) {
      try {
        await API.post("/api/contact", form);
        setSubmitted(true);
        setForm({ name: "", email: "", message: "" });
        setTimeout(() => setSubmitted(false), 5000);
      } catch (error) {
        console.error("Submit error:", error);
        alert("Error sending message. Please try again.");
      }
    }
  };

  return (
    <div className="info-page">
      <div className="info-header">
        <h1>தொடர்பு கொள்ள (Contact Us)</h1>
        <p>உங்களுக்கு ஏதேனும் கேள்விகள் அல்லது செய்திகள் இருந்தால் எங்களைத் தொடர்பு கொள்ளவும்</p>
      </div>

      <div className="info-card">
        <div className="contact-grid">
          {/* DYNAMIC CONTACT INFO FROM CMS */}
          <div className="contact-info" style={{ display: "block", color: "var(--text-secondary)", lineHeight: "1.8" }}>
            {loading ? (
              <p>தகவல்கள் ஏற்றப்படுகின்றன...</p>
            ) : (
              <div 
                className="contact-cms-content"
                dangerouslySetInnerHTML={{ __html: descriptionContent }}
                style={{ fontSize: "16px" }}
              />
            )}
          </div>

          {/* CONTACT FORM */}
          <div className="contact-form-container">
            <h3>செய்தி அனுப்பவும்</h3>
            {submitted && (
              <div className="alert-success">
                உங்கள் செய்தி வெற்றிகரமாக அனுப்பப்பட்டது! நன்றி.
              </div>
            )}
            <form onSubmit={handleSubmit} className="contact-form">
              <div className="form-group">
                <label>பெயர்</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="உங்கள் பெயர்"
                />
              </div>

              <div className="form-group">
                <label>மின்னஞ்சல்</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="உங்களது மின்னஞ்சல்"
                />
              </div>

              <div className="form-group">
                <label>செய்தி</label>
                <textarea
                  rows="5"
                  required
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="உங்கள் செய்தியை இங்கு தட்டச்சு செய்யவும்..."
                ></textarea>
              </div>

              <button type="submit" className="submit-btn">
                <FaPaperPlane /> அனுப்பவும்
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;

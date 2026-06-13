import React, { useState } from "react";
import "../styles/InfoPages.css";
import { FaEnvelope, FaMapMarkerAlt, FaBuilding, FaPaperPlane } from "react-icons/fa";

const Contact = () => {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.name && form.email && form.message) {
      setSubmitted(true);
      setForm({ name: "", email: "", message: "" });
      setTimeout(() => setSubmitted(false), 5000);
    }
  };

  return (
    <div className="info-page">
      <div className="info-header">
        <h1>தொடர்பு கொள்ள</h1>
        <p>உங்களுக்கு ஏதேனும் கேள்விகள் அல்லது செய்திகள் இருந்தால் எங்களைத் தொடர்பு கொள்ளவும்</p>
      </div>

      <div className="info-card">
        <div className="contact-grid">
          {/* CONTACT INFO */}
          <div className="contact-info">
            <div className="contact-item">
              <div className="contact-icon">
                <FaEnvelope />
              </div>
              <div className="contact-details">
                <h3>மின்னஞ்சல் முகவரி</h3>
                <a href="mailto:info@newsghuru.in">info@newsghuru.in</a>
              </div>
            </div>

            <div className="contact-item">
              <div className="contact-icon">
                <FaMapMarkerAlt />
              </div>
              <div className="contact-details">
                <h3>முகவரி</h3>
                <p>சென்னை, தமிழ்நாடு, இந்தியா</p>
              </div>
            </div>

            <div className="contact-item">
              <div className="contact-icon">
                <FaBuilding />
              </div>
              <div className="contact-details">
                <h3>நிறுவனம்</h3>
                <p>
                  நியூஸ் குரு என்பது குருதேவா என்டர்டெயின்மென்ட்ஸ் பிரைவேட் லிமிடெட் மூலம் நடத்தப்படும் ஒரு டிஜிட்டல் ஊடக பிராண்ட் ஆகும்.
                </p>
              </div>
            </div>
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

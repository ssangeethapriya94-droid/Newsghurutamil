import React, { useState } from "react";
import "../styles/ContactModal.css";
import { FaTimes, FaEnvelope, FaMapMarkerAlt, FaBuilding, FaPaperPlane } from "react-icons/fa";
import API from "../config/api";

const ContactModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    category: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await API.post("/api/contact", formData);
      alert("உங்கள் செய்தி வெற்றிகரமாக அனுப்பப்பட்டது! (Message sent successfully!)");
      setFormData({ name: "", email: "", phone: "", category: "", message: "" });
      onClose();
    } catch (error) {
      console.error("Contact submission error:", error);
      alert("Error sending message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-modal-overlay" onClick={onClose}>
      <div className="contact-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="contact-modal-close" onClick={onClose}>
          <FaTimes />
        </button>

        {/* Left Side: Contact Info */}
        <div className="contact-modal-left">
          <div className="contact-info-item">
            <div className="contact-icon-box">
              <FaEnvelope />
            </div>
            <div className="contact-info-text">
              <h4>மின்னஞ்சல் முகவரி</h4>
              <p>info@newsghuru.in</p>
            </div>
          </div>

          <div className="contact-info-item">
            <div className="contact-icon-box">
              <FaMapMarkerAlt />
            </div>
            <div className="contact-info-text">
              <h4>முகவரி</h4>
              <p>சென்னை, தமிழ்நாடு, இந்தியா</p>
            </div>
          </div>

          <div className="contact-info-item">
            <div className="contact-icon-box">
              <FaBuilding />
            </div>
            <div className="contact-info-text">
              <h4>நிறுவனம்</h4>
              <p>
                நியூஸ் குரு என்பது குருதேவா என்டர்டெயின்மென்ட்ஸ் பிரைவேட் லிமிடெட் மூலம் நடத்தப்படும் ஒரு டிஜிட்டல் ஊடக பிராண்ட் ஆகும்.
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="contact-modal-right">
          <h2>செய்தி அனுப்பவும்</h2>
          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>பெயர் <span style={{color: "#ef4444"}}>*</span></label>
              <input 
                type="text" 
                name="name" 
                placeholder="உங்கள் பெயர்" 
                value={formData.name} 
                onChange={handleChange} 
                required 
              />
            </div>

            <div className="form-group">
              <label>மின்னஞ்சல் <span style={{color: "#ef4444"}}>*</span></label>
              <input 
                type="email" 
                name="email" 
                placeholder="உங்களது மின்னஞ்சல்" 
                value={formData.email} 
                onChange={handleChange} 
                required 
              />
            </div>

            <div className="form-group" style={{ display: "flex", gap: "15px" }}>
              <div style={{ flex: 1 }}>
                <label>தொலைபேசி எண்</label>
                <input 
                  type="text" 
                  name="phone" 
                  placeholder="தொலைபேசி எண் (விருப்பம்)" 
                  value={formData.phone} 
                  onChange={handleChange} 
                />
              </div>
              <div style={{ flex: 1 }}>
                <label>பிரிவு</label>
                <select name="category" value={formData.category} onChange={handleChange}>
                  <option value="">பிரிவைத் தேர்ந்தெடுக்கவும்</option>
                  <option value="General Query">பொது விசாரணை (General)</option>
                  <option value="News Tip">செய்தி குறிப்பு (News Tip)</option>
                  <option value="Advertisement">விளம்பரம் (Advertisement)</option>
                  <option value="Feedback">பின்னூட்டம் (Feedback)</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>செய்தி</label>
              <textarea 
                name="message" 
                placeholder="உங்கள் செய்தியை இங்கு தட்டச்சு செய்யவும்..." 
                value={formData.message} 
                onChange={handleChange} 
              />
            </div>

            <button type="submit" className="contact-submit-btn" disabled={loading}>
              <FaPaperPlane /> {loading ? "அனுப்பப்படுகிறது..." : "அனுப்பவும்"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ContactModal;

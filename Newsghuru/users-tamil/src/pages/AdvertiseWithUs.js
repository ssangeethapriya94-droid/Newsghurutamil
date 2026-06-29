import React, { useState, useEffect } from "react";
import API from "../config/api";
import { FiSend, FiCheckCircle, FiAlertCircle, FiStar, FiLayers, FiDollarSign, FiPhone, FiMail, FiGlobe } from "react-icons/fi";
import useSEO from "../hooks/useSEO";
import "../styles/InfoPages.css";

const AdvertiseWithUs = () => {
  useSEO({
    title: "எங்களுடன் விளம்பரம் செய்யுங்கள் | நியூஸ் குரு",
    description: "நியூஸ் குரு செய்தி போர்ட்டலில் உங்கள் வணிகத்தை விளம்பரம் செய்ய எங்களைத் தொடர்பு கொள்ளவும்.",
    keywords: "விளம்பரம், எங்களுடன் விளம்பரம் செய்யுங்கள், செய்தி விளம்பரம், நியூஸ் குரு விளம்பரம்",
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

  const [salesInfo, setSalesInfo] = useState({
    salesEmail: "ads@newsghuru.in",
    salesPhone: "+91 88259 48859",
    salesWebsite: "newsghuru.in"
  });

  useEffect(() => {
    const fetchAdPageContent = async () => {
      try {
        setDescLoading(true);
        const res = await API.get("/api/pages/advertise?language=ta");
        if (res.data && res.data.success) {
          setDescriptionContent(res.data.content || "");
        }
      } catch (err) {
        console.error("Error fetching advertise page description:", err);
      } finally {
        setDescLoading(false);
      }
    };

    const fetchPublicSettings = async () => {
      try {
        const res = await API.get("/api/ads/settings/public");
        if (res.data && res.data.success && res.data.settings) {
          setSalesInfo({
            salesEmail: res.data.settings.salesEmail || "ads@newsghuru.in",
            salesPhone: res.data.settings.salesPhone || "+91 88259 48859",
            salesWebsite: res.data.settings.salesWebsite || "newsghuru.in"
          });
        }
      } catch (err) {
        console.error("Error fetching public ad settings:", err);
      }
    };

    fetchAdPageContent();
    fetchPublicSettings();
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
      setError("தயவுசெய்து தேவையான அனைத்து விவரங்களையும் நிரப்பவும்.");
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
      setError(err.response?.data?.message || "கோரிக்கையை சமர்ப்பிப்பதில் தோல்வி ஏற்பட்டது. பின்னர் மீண்டும் முயற்சிக்கவும்.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="contact-page" style={{ padding: "40px 20px", maxWidth: "1150px", margin: "0 auto", fontFamily: "inherit" }}>
      
      {/* BRAND HERO HEADER */}
      <div style={{ textAlign: "center", marginBottom: "40px", background: "var(--bg-secondary, #fff)", padding: "40px 20px", borderRadius: "20px", border: "1px solid var(--border-color, #e2e8f0)", boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>
        <span style={{ display: "inline-block", background: "rgba(245, 158, 11, 0.1)", color: "var(--accent-orange, #ea580c)", padding: "6px 16px", borderRadius: "20px", fontWeight: "800", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "12px" }}>
          📢 உங்கள் வணிகத்தை விரிவுபடுத்துங்கள்
        </span>
        <h1 style={{ fontSize: "2.4rem", fontWeight: "900", color: "var(--text-primary, #0f172a)", margin: "0 0 12px 0", lineHeight: "1.2" }}>
          நியூஸ் குருவுடன் விளம்பரம் செய்யுங்கள்
        </h1>
        <p style={{ color: "var(--text-muted, #64748b)", fontSize: "1.1rem", maxWidth: "700px", margin: "0 auto", lineHeight: "1.6" }}>
          உயர்தர டிஜிட்டல் விளம்பர இடங்கள் மூலம் தமிழகம் மற்றும் உலகெங்கிலும் உள்ள மில்லியன் கணக்கான வாசகர்களைச் சென்றடையுங்கள்.
        </p>
      </div>

      {/* DYNAMIC CMS CONTENT BLOCK */}
      {!descLoading && descriptionContent && (
        <div 
          className="advertise-cms-content"
          dangerouslySetInnerHTML={{ __html: descriptionContent }}
          style={{ 
            background: "var(--bg-secondary, #ffffff)", padding: "24px", borderRadius: "16px", 
            border: "1px solid var(--border-color, #e2e8f0)", marginBottom: "40px", 
            color: "var(--text-primary, #334155)", lineHeight: "1.8", fontSize: "15px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.02)"
          }}
        />
      )}

      {/* SPLIT LAYOUT: INQUIRY FORM & GUIDELINES */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "30px", alignItems: "start" }}>
        
        {/* LEFT COLUMN: INQUIRY FORM */}
        <div style={{ background: "var(--bg-secondary, #ffffff)", padding: "32px", borderRadius: "20px", border: "1.5px solid var(--border-color, #e2e8f0)", boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>
          <h2 style={{ fontSize: "1.4rem", fontWeight: "800", color: "var(--text-primary, #0f172a)", margin: "0 0 8px 0" }}>
            விளம்பரக் கோரிக்கை படிவம்
          </h2>
          <p style={{ fontSize: "0.9rem", color: "var(--text-muted, #64748b)", marginBottom: "24px" }}>
            கீழே உள்ள விவரங்களை நிரப்பவும், எங்கள் விளம்பரப் பிரிவு உங்களை விரைவில் தொடர்பு கொள்ளும்.
          </p>

          {success && (
            <div style={{
              background: "rgba(16, 185, 129, 0.08)",
              borderLeft: "4px solid #10b981",
              color: "#065f46",
              padding: "16px",
              borderRadius: "10px",
              marginBottom: "25px",
              display: "flex",
              alignItems: "center",
              gap: "12px"
            }}>
              <FiCheckCircle size={24} style={{ color: "#10b981", flexShrink: 0 }} />
              <div>
                <strong style={{ display: "block" }}>கோரிக்கை வெற்றிகரமாக சமர்ப்பிக்கப்பட்டது! 🎉</strong>
                <span style={{ fontSize: "14px" }}>எங்கள் விளம்பரப் பிரதிநிதி 24 மணி நேரத்திற்குள் உங்களைத் தொடர்பு கொள்வார்.</span>
              </div>
            </div>
          )}

          {error && (
            <div style={{
              background: "rgba(239, 68, 68, 0.08)",
              borderLeft: "4px solid #ef4444",
              color: "#b91c1c",
              padding: "16px",
              borderRadius: "10px",
              marginBottom: "25px",
              display: "flex",
              alignItems: "center",
              gap: "12px"
            }}>
              <FiAlertCircle size={24} style={{ color: "#ef4444", flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            
            <div className="form-group">
              <label style={{ fontWeight: "700", display: "block", marginBottom: "6px", fontSize: "0.9rem", color: "var(--text-primary)" }}>நிறுவனத்தின் பெயர் *</label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleInputChange}
                placeholder="எ.கா. ஏபிசி டெக்ஸ்டைல்ஸ்"
                required
                style={{ width: "100%", padding: "12px 14px", borderRadius: "10px", border: "1px solid var(--border-color, #cbd5e1)", background: "var(--bg-primary, #fff)", color: "var(--text-primary)", fontSize: "0.95rem", outline: "none", boxSizing: "border-box" }}
              />
            </div>

            <div className="form-group">
              <label style={{ fontWeight: "700", display: "block", marginBottom: "6px", fontSize: "0.9rem", color: "var(--text-primary)" }}>தொடர்பு கொள்ள வேண்டியவர் பெயர் *</label>
              <input
                type="text"
                name="contactPerson"
                value={formData.contactPerson}
                onChange={handleInputChange}
                placeholder="எ.கா. ராஜேஷ் குமார்"
                required
                style={{ width: "100%", padding: "12px 14px", borderRadius: "10px", border: "1px solid var(--border-color, #cbd5e1)", background: "var(--bg-primary, #fff)", color: "var(--text-primary)", fontSize: "0.95rem", outline: "none", boxSizing: "border-box" }}
              />
            </div>

            <div className="form-group">
              <label style={{ fontWeight: "700", display: "block", marginBottom: "6px", fontSize: "0.9rem", color: "var(--text-primary)" }}>மின்னஞ்சல் முகவரி *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="rajesh@company.com"
                required
                style={{ width: "100%", padding: "12px 14px", borderRadius: "10px", border: "1px solid var(--border-color, #cbd5e1)", background: "var(--bg-primary, #fff)", color: "var(--text-primary)", fontSize: "0.95rem", outline: "none", boxSizing: "border-box" }}
              />
            </div>

            <div className="form-group">
              <label style={{ fontWeight: "700", display: "block", marginBottom: "6px", fontSize: "0.9rem", color: "var(--text-primary)" }}>தொலைபேசி எண் *</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="9876543210"
                required
                style={{ width: "100%", padding: "12px 14px", borderRadius: "10px", border: "1px solid var(--border-color, #cbd5e1)", background: "var(--bg-primary, #fff)", color: "var(--text-primary)", fontSize: "0.95rem", outline: "none", boxSizing: "border-box" }}
              />
            </div>

            <div className="form-group">
              <label style={{ fontWeight: "700", display: "block", marginBottom: "6px", fontSize: "0.9rem", color: "var(--text-primary)" }}>இணையதள முகவரி (விருப்பப்பட்டால்)</label>
              <input
                type="url"
                name="website"
                value={formData.website}
                onChange={handleInputChange}
                placeholder="www.company.com"
                style={{ width: "100%", padding: "12px 14px", borderRadius: "10px", border: "1px solid var(--border-color, #cbd5e1)", background: "var(--bg-primary, #fff)", color: "var(--text-primary)", fontSize: "0.95rem", outline: "none", boxSizing: "border-box" }}
              />
            </div>

            <div className="form-group">
              <label style={{ fontWeight: "700", display: "block", marginBottom: "6px", fontSize: "0.9rem", color: "var(--text-primary)" }}>விருப்பமான விளம்பர இடம் *</label>
              <select 
                name="advertisementType" 
                value={formData.advertisementType} 
                onChange={handleInputChange}
                style={{ width: "100%", padding: "12px 14px", borderRadius: "10px", border: "1px solid var(--border-color, #cbd5e1)", background: "var(--bg-primary, #fff)", color: "var(--text-primary)", fontSize: "0.95rem", outline: "none", boxSizing: "border-box" }}
              >
                <option value="HEADER_BANNER">ஹெடர் பேனர் (HEADER BANNER)</option>
                <option value="TOP_BANNER">டாப் பேனர் (TOP BANNER)</option>
                <option value="SIDEBAR">சைட்பார் பேனர் (SIDEBAR BANNER)</option>
                <option value="SECTION_BANNER">செக்ஷன் பேனர் (SECTION BANNER)</option>
                <option value="FOOTER_BANNER">புட்டர் பேனர் (FOOTER BANNER)</option>
                <option value="ARTICLE_ADVERTISEMENT">செய்தி கட்டுரை விளம்பரம் (IN-ARTICLE)</option>
                <option value="POPUP_ADVERTISEMENT">பாப்-அப் விளம்பரம் (POPUP BANNER)</option>
                <option value="FLOATING_ADVERTISEMENT">மிதக்கும் விளம்பரம் (FLOATING BANNER)</option>
              </select>
            </div>

            <div className="form-group">
              <label style={{ fontWeight: "700", display: "block", marginBottom: "6px", fontSize: "0.9rem", color: "var(--text-primary)" }}>கூடுதல் விவரங்கள்</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                placeholder="உங்கள் விளம்பர தேவைகள் பற்றிய கூடுதல் தகவல்கள்..."
                rows={3}
                style={{ width: "100%", padding: "12px 14px", borderRadius: "10px", border: "1px solid var(--border-color, #cbd5e1)", background: "var(--bg-primary, #fff)", color: "var(--text-primary)", fontSize: "0.95rem", outline: "none", resize: "vertical", boxSizing: "border-box" }}
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              style={{ 
                display: "inline-flex", 
                alignItems: "center", 
                justifyContent: "center", 
                gap: "10px", 
                padding: "14px 28px",
                cursor: loading ? "not-allowed" : "pointer",
                fontWeight: "800",
                fontSize: "1rem",
                border: "none",
                background: loading ? "#94a3b8" : "linear-gradient(135deg, var(--accent-orange, #ea580c) 0%, #d97706 100%)",
                color: "white",
                borderRadius: "12px",
                boxShadow: "0 6px 20px rgba(234,88,12,0.35)",
                marginTop: "10px",
                transition: "all 0.2s ease"
              }}
            >
              <FiSend /> {loading ? "அனுப்பப்படுகிறது..." : "விளம்பர கோரிக்கையை சமர்ப்பிக்கவும்"}
            </button>

          </form>
        </div>

        {/* RIGHT COLUMN: GUIDELINES & SPECS matching website theme */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          
          {/* BENEFITS CARD */}
          <div style={{ background: "var(--bg-secondary, #ffffff)", padding: "24px", borderRadius: "20px", border: "1.5px solid var(--border-color, #e2e8f0)", boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>
            <h3 style={{ fontWeight: "800", fontSize: "1.15rem", color: "var(--accent-orange, #ea580c)", margin: "0 0 16px 0", display: "flex", alignItems: "center", gap: "8px" }}>
              <FiStar /> விளம்பர பலன்கள் (Benefits)
            </h3>
            <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
              {[
                "முன்னுரிமை வெளியீடு (Priority publishing)",
                "பிரத்யேக கணக்கு மேலாளர் (Dedicated account manager)",
                "முகப்பு பக்கத்தில் சிறந்த பார்வைத் திறன் (Premium homepage visibility)",
                "மாதாந்திர பகுப்பாய்வு அறிக்கைகள் (Monthly analytics reports)",
                "தனிப்பயனாக்கப்பட்ட விளம்பரங்கள் (Customized campaigns)",
                "இணை பிராண்டிங் வாய்ப்புகள் (Co-branded opportunities)"
              ].map((benefit, idx) => (
                <li key={idx} style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "0.92rem", fontWeight: "700", color: "var(--text-primary, #1e293b)", background: "rgba(245, 158, 11, 0.04)", padding: "8px 12px", borderRadius: "10px", border: "1px solid rgba(245, 158, 11, 0.12)" }}>
                  <span style={{ width: "20px", height: "20px", borderRadius: "50%", background: "var(--accent-orange, #ea580c)", color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: "900", flexShrink: 0 }}>
                    ✓
                  </span>
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* CREATIVE SPECS CARD */}
          <div style={{ background: "var(--bg-secondary, #ffffff)", padding: "24px", borderRadius: "20px", border: "1.5px solid var(--border-color, #e2e8f0)", boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>
            <h3 style={{ fontWeight: "800", fontSize: "1.15rem", color: "var(--text-primary, #0f172a)", margin: "0 0 14px 0", display: "flex", alignItems: "center", gap: "8px" }}>
              <FiLayers /> விளம்பர வடிவமைப்பு விதிகள் (Creative Specifications)
            </h3>
            <table style={{ width: "100%", fontSize: "0.9rem", borderCollapse: "collapse", color: "var(--text-primary, #334155)" }}>
              <thead>
                <tr style={{ borderBottom: "1.5px solid var(--border-color, #cbd5e1)", textAlign: "left" }}>
                  <th style={{ padding: "8px 0", fontWeight: "700" }}>அம்சம் / வகை</th>
                  <th style={{ padding: "8px 0", fontWeight: "700" }}>தேவை / அளவு</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: "1px solid var(--border-color, #e2e8f0)" }}>
                  <td style={{ padding: "8px 0", fontWeight: "600" }}>பட வடிவங்கள் (Image Format)</td>
                  <td style={{ padding: "8px 0" }}>JPG, PNG, WebP</td>
                </tr>
                <tr style={{ borderBottom: "1px solid var(--border-color, #e2e8f0)" }}>
                  <td style={{ padding: "8px 0", fontWeight: "600" }}>HTML பேனர்</td>
                  <td style={{ padding: "8px 0" }}>HTML5</td>
                </tr>
                <tr style={{ borderBottom: "1px solid var(--border-color, #e2e8f0)" }}>
                  <td style={{ padding: "8px 0", fontWeight: "600" }}>வீடியோ வடிவம் (Video Format)</td>
                  <td style={{ padding: "8px 0" }}>MP4</td>
                </tr>
                <tr style={{ borderBottom: "1px solid var(--border-color, #e2e8f0)" }}>
                  <td style={{ padding: "8px 0", fontWeight: "600" }}>அதிகபட்ச பட அளவு (Max Image Size)</td>
                  <td style={{ padding: "8px 0", fontWeight: "800", color: "var(--accent-orange, #ea580c)" }}>500 KB</td>
                </tr>
                <tr>
                  <td style={{ padding: "8px 0", fontWeight: "600" }}>அதிகபட்ச வீடியோ அளவு (Max Video Size)</td>
                  <td style={{ padding: "8px 0", fontWeight: "800", color: "var(--accent-orange, #ea580c)" }}>100 MB</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* PAYMENT TERMS CARD */}
          <div style={{ background: "var(--bg-secondary, #ffffff)", padding: "24px", borderRadius: "20px", border: "1.5px solid var(--border-color, #e2e8f0)", boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>
            <h3 style={{ fontWeight: "800", fontSize: "1.15rem", color: "var(--text-primary, #0f172a)", margin: "0 0 16px 0", display: "flex", alignItems: "center", gap: "8px" }}>
              <FiDollarSign /> கட்டண விதிமுறைகள் (Payment Terms)
            </h3>
            <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "12px" }}>
              {[
                "விதிகளின்படி ஜிஎஸ்டி (GST) தனியாக வசூலிக்கப்படும்.",
                "விளம்பரம் நேரலையாவதற்கு முன் 100% முன்பணம் செலுத்தப்பட வேண்டும்.",
                "திட்டமிடப்பட்ட வெளியீட்டிற்கு குறைந்தபட்சம் 48 மணிநேரத்திற்கு முன்பே விளம்பர படங்கள் சமர்ப்பிக்கப்பட வேண்டும்.",
                "ஸ்பான்சர் செய்யப்பட்ட கட்டுரைகள் Sponsored, Partner Content அல்லது Advertisement எனத் தெளிவாகக் குறிப்பிடப்படும்.",
                "சட்டம், நெறிமுறைகளுக்கு இணங்காத விளம்பரங்களை நிராகரிக்கும் உரிமை நியூஸ் குருவுக்கு உண்டு."
              ].map((term, idx) => (
                <li key={idx} style={{ display: "flex", alignItems: "flex-start", gap: "10px", fontSize: "0.88rem", lineHeight: "1.6", color: "var(--text-primary, #334155)" }}>
                  <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--accent-orange, #ea580c)", marginTop: "7px", flexShrink: 0 }} />
                  <div>{term}</div>
                </li>
              ))}
            </ul>
          </div>

          {/* BRAND CONTACT CARD (Theme Styled & Dynamic) */}
          <div style={{ background: "rgba(245, 158, 11, 0.05)", padding: "24px", borderRadius: "20px", border: "1.5px solid rgba(245, 158, 11, 0.2)" }}>
            <h3 style={{ fontWeight: "800", fontSize: "1.15rem", color: "var(--accent-orange, #ea580c)", margin: "0 0 6px 0" }}>
              📞 தொடர்புகொள்ள (Contact for Advertising)
            </h3>
            <div style={{ fontWeight: "700", fontSize: "0.95rem", marginBottom: "14px", color: "var(--text-primary, #0f172a)" }}>
              விளம்பரம் மற்றும் ஊடக விற்பனை பிரிவு — நியூஸ் குரு
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "0.92rem", color: "var(--text-primary, #334155)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <FiMail style={{ color: "var(--accent-orange)" }} /> 
                <span>மின்னஞ்சல்: <a href={`mailto:${salesInfo.salesEmail}`} style={{ color: "var(--accent-orange)", textDecoration: "none", fontWeight: "700" }}>{salesInfo.salesEmail}</a></span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <FiPhone style={{ color: "var(--accent-orange)" }} /> 
                <span>தொலைபேசி: <a href={`tel:${salesInfo.salesPhone.replace(/\s+/g, '')}`} style={{ color: "var(--accent-orange)", textDecoration: "none", fontWeight: "700" }}>{salesInfo.salesPhone}</a></span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <FiGlobe style={{ color: "var(--accent-orange)" }} /> 
                <span>இணையதளம்: <a href={salesInfo.salesWebsite.startsWith("http") ? salesInfo.salesWebsite : `https://${salesInfo.salesWebsite}`} target="_blank" rel="noreferrer" style={{ color: "var(--accent-orange)", textDecoration: "none", fontWeight: "700" }}>{salesInfo.salesWebsite}</a></span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};

export default AdvertiseWithUs;

import React, { useState, useEffect, useCallback } from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import API from "../config/api";
import "../styles/Account.css";
import { 
  FiEye, FiEdit2, FiGlobe, FiClock, FiFileText, FiShield, FiLock, FiAlertTriangle, FiMail, FiPlus, FiTrash2, FiStar, FiLayers, FiDollarSign, FiUpload, FiDownload
} from "react-icons/fi";

const PAGE_OPTIONS = [
  { slug: "about", title: "About Us", icon: <FiFileText />, desc: "Manage and publish information about NewsGhuru" },
  { slug: "privacy", title: "Privacy Policy", icon: <FiShield />, desc: "Manage and publish the Privacy Policy for NewsGhuru" },
  { slug: "terms", title: "Terms & Conditions", icon: <FiLock />, desc: "Manage and publish terms of service and usage guidelines" },
  { slug: "disclaimer", title: "Disclaimer", icon: <FiAlertTriangle />, desc: "Manage and publish legal disclaimers" },
  { slug: "contact", title: "Contact Us", icon: <FiMail />, desc: "Manage contact information and instructions" },
  { slug: "advertise", title: "Advertise With Us", icon: <FiGlobe />, desc: "Manage details about advertisement options" }
];

// Default lists to fallback on if database records are empty
const defaultBenefitsEn = [
  "Priority publishing",
  "Dedicated account manager",
  "Premium homepage visibility",
  "Monthly analytics reports",
  "Customized campaigns",
  "Co-branded opportunities"
];

const defaultBenefitsTa = [
  "முன்னுரிமை வெளியீடு (Priority publishing)",
  "பிரத்யேக கணக்கு மேலாளர் (Dedicated account manager)",
  "முகப்பு பக்கத்தில் சிறந்த பார்வைத் திறன் (Premium homepage visibility)",
  "மாதாந்திர பகுப்பாய்வு அறிக்கைகள் (Monthly analytics reports)",
  "தனிப்பயனாக்கப்பட்ட விளம்பரங்கள் (Customized campaigns)",
  "இணை பிராண்டிங் வாய்ப்புகள் (Co-branded opportunities)"
];

const defaultPaymentTermsEn = [
  "GST will be charged extra as applicable.",
  "100% advance payment is required before campaign activation.",
  "Creative assets should be submitted at least 48 hours before scheduled publication.",
  "Sponsored content will be clearly labeled as Sponsored, Partner Content, or Advertisement.",
  "News Ghuru reserves the right to reject advertisements that do not comply with legal or ethical guidelines."
];

const defaultPaymentTermsTa = [
  "விதிகளின்படி ஜிஎஸ்டி (GST) தனியாக வசூலிக்கப்படும்.",
  "விளம்பரம் நேரலையாவதற்கு முன் 100% முன்பணம் செலுத்தப்பட வேண்டும்.",
  "திட்டமிடப்பட்ட வெளியீட்டிற்கு குறைந்தபட்சம் 48 மணிநேரத்திற்கு முன்பே விளம்பர படங்கள் சமர்ப்பிக்கப்பட வேண்டும்.",
  "ஸ்பான்சர் செய்யப்பட்ட கட்டுரைகள் Sponsored, Partner Content அல்லது Advertisement எனத் தெளிவாகக் குறிப்பிடப்படும்.",
  "சட்டம், நெறிமுறைகளுக்கு இணங்காத விளம்பரங்களை நிராகரிக்கும் உரிமை நியூஸ் குருவுக்கு உண்டு."
];

const defaultCreativeSpecsEn = [
  { item: "Image Format", requirement: "JPG, PNG, WebP" },
  { item: "HTML Banner", requirement: "HTML5" },
  { item: "Video Format", requirement: "MP4" },
  { item: "Max Image Size", requirement: "500 KB" },
  { item: "Max Video Size", requirement: "100 MB" }
];

const defaultCreativeSpecsTa = [
  { item: "பட வடிவம் (Image Format)", requirement: "JPG, PNG, WebP" },
  { item: "HTML பேனர் (HTML Banner)", requirement: "HTML5" },
  { item: "வீдео வடிவம் (Video Format)", requirement: "MP4" },
  { item: "அதிகபட்ச பட அளவு (Max Image Size)", requirement: "500 KB" },
  { item: "அதிகபட்ச வீடியோ அளவு (Max Video Size)", requirement: "100 MB" }
];

function WebsiteSettings() {
  const [selectedSlug, setSelectedSlug] = useState("about");
  const [selectedLang, setSelectedLang] = useState("ta");
  const [content, setContent] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("edit"); // "edit" or "preview"

  const [tariffFile, setTariffFile] = useState(null);
  const [uploadingTariff, setUploadingTariff] = useState(false);

  const [adSettings, setAdSettings] = useState({
    salesEmail: "ads@newsghuru.in",
    salesPhone: "+91 88259 48859",
    salesWebsite: "newsghuru.in",
    benefitsEn: [],
    benefitsTa: [],
    paymentTermsEn: [],
    paymentTermsTa: [],
    creativeSpecsEn: [],
    creativeSpecsTa: [],
    tariffCardPdf: ""
  });

  const fetchPageContent = useCallback(async () => {
    try {
      setLoading(true);
      const res = await API.get(`/api/pages/${selectedSlug}`, { params: { language: selectedLang } });
      if (res.data && res.data.success) {
        setContent(res.data.content || "");
        setLastUpdated(res.data.lastUpdated);
      }

      if (selectedSlug === "advertise") {
        const adRes = await API.get("/api/ads/settings");
        if (adRes.data.success && adRes.data.settings) {
          const s = adRes.data.settings;
          setAdSettings({
            salesEmail: s.salesEmail || "ads@newsghuru.in",
            salesPhone: s.salesPhone || "+91 88259 48859",
            salesWebsite: s.salesWebsite || "newsghuru.in",
            benefitsEn: s.benefitsEn && s.benefitsEn.length > 0 ? s.benefitsEn : defaultBenefitsEn,
            benefitsTa: s.benefitsTa && s.benefitsTa.length > 0 ? s.benefitsTa : defaultBenefitsTa,
            paymentTermsEn: s.paymentTermsEn && s.paymentTermsEn.length > 0 ? s.paymentTermsEn : defaultPaymentTermsEn,
            paymentTermsTa: s.paymentTermsTa && s.paymentTermsTa.length > 0 ? s.paymentTermsTa : defaultPaymentTermsTa,
            creativeSpecsEn: s.creativeSpecsEn && s.creativeSpecsEn.length > 0 ? s.creativeSpecsEn : defaultCreativeSpecsEn,
            creativeSpecsTa: s.creativeSpecsTa && s.creativeSpecsTa.length > 0 ? s.creativeSpecsTa : defaultCreativeSpecsTa,
            tariffCardPdf: s.tariffCardPdf || ""
          });
        }
      }
    } catch (err) {
      console.error(`Error fetching page ${selectedSlug}:`, err);
      alert("Failed to load page content.");
    } finally {
      setLoading(false);
    }
  }, [selectedSlug, selectedLang]);

  useEffect(() => {
    fetchPageContent();
  }, [fetchPageContent]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAdSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTariffUpload = async () => {
    if (!tariffFile) {
      alert("Please select a tariff card file (PDF or Image) first.");
      return;
    }

    try {
      setUploadingTariff(true);
      const formData = new FormData();
      formData.append("tariff", tariffFile);

      const res = await API.post("/api/ads/settings/tariff-upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });

      if (res.data.success) {
        setAdSettings(prev => ({
          ...prev,
          tariffCardPdf: res.data.url
        }));
        setTariffFile(null);
        alert("Tariff card file uploaded successfully! 📁 Make sure to click 'Publish Updates' at the bottom to save your settings.");
      }
    } catch (err) {
      console.error("Error uploading tariff card:", err);
      alert(err.response?.data?.message || "Failed to upload tariff card file.");
    } finally {
      setUploadingTariff(false);
    }
  };

  const handleArrayChange = (field, index, value) => {
    setAdSettings(prev => {
      const updated = [...(prev[field] || [])];
      updated[index] = value;
      return { ...prev, [field]: updated };
    });
  };

  const addArrayItem = (field) => {
    setAdSettings(prev => ({
      ...prev,
      [field]: [...(prev[field] || []), ""]
    }));
  };

  const removeArrayItem = (field, index) => {
    setAdSettings(prev => ({
      ...prev,
      [field]: (prev[field] || []).filter((_, idx) => idx !== index)
    }));
  };

  const handleSpecChange = (field, index, key, value) => {
    setAdSettings(prev => {
      const updated = [...(prev[field] || [])];
      updated[index] = { ...updated[index], [key]: value };
      return { ...prev, [field]: updated };
    });
  };

  const addSpecItem = (field) => {
    setAdSettings(prev => ({
      ...prev,
      [field]: [...(prev[field] || []), { item: "", requirement: "" }]
    }));
  };

  const removeSpecItem = (field, index) => {
    setAdSettings(prev => ({
      ...prev,
      [field]: (prev[field] || []).filter((_, idx) => idx !== index)
    }));
  };

  const handlePublish = async (e) => {
    e.preventDefault();
    if (!content.trim()) {
      alert("Page content cannot be empty.");
      return;
    }

    const currentPage = PAGE_OPTIONS.find(p => p.slug === selectedSlug);
    const title = currentPage ? currentPage.title : "Static Page";

    try {
      setSaving(true);
      const res = await API.put(`/api/admin/pages/${selectedSlug}`, {
        title,
        content,
        language: selectedLang
      });

      if (selectedSlug === "advertise") {
        await API.put(`/api/ads/settings`, adSettings);
      }

      if (res.data && res.data.success) {
        setContent(res.data.page?.content || "");
        setLastUpdated(res.data.page?.lastUpdated);
        alert(`"${title}" published successfully! 🚀`);
      }
    } catch (err) {
      console.error(`Error publishing page ${selectedSlug}:`, err);
      alert(err.response?.data?.message || "Failed to publish page content.");
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "Never";
    return new Date(dateStr).toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ color: [] }, { background: [] }],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ align: [] }],
      ["link", "clean"],
    ],
  };

  const renderArrayEditor = (field, title, placeholder) => {
    const list = adSettings[field] || [];
    return (
      <div style={{ marginBottom: "15px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
          <label style={{ fontWeight: "700", margin: 0, color: "var(--text-main, #1e293b)" }}>{title}</label>
          <button
            type="button"
            onClick={() => addArrayItem(field)}
            style={{
              padding: "5px 10px",
              background: "#3b82f6",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              fontSize: "0.78rem",
              fontWeight: "600",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "4px"
            }}
          >
            <FiPlus /> Add Row
          </button>
        </div>
        {list.length === 0 ? (
          <div style={{ fontStyle: "italic", color: "var(--text-muted)", fontSize: "0.82rem", padding: "5px 0" }}>
            No items added yet. Click 'Add Row' to begin.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {list.map((item, index) => (
              <div key={index} style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <input
                  type="text"
                  value={item}
                  onChange={(e) => handleArrayChange(field, index, e.target.value)}
                  placeholder={placeholder}
                  style={{ flex: 1, padding: "8px 10px", borderRadius: "6px", border: "1px solid var(--border-color)", background: "var(--bg-input)", color: "var(--text-main)", fontSize: "0.9rem" }}
                  required
                />
                <button
                  type="button"
                  onClick={() => removeArrayItem(field, index)}
                  style={{
                    padding: "8px",
                    background: "rgba(239, 68, 68, 0.1)",
                    color: "#ef4444",
                    border: "1px solid rgba(239, 68, 68, 0.2)",
                    borderRadius: "6px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                  title="Delete Item"
                >
                  <FiTrash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderSpecsEditor = (field, title) => {
    const list = adSettings[field] || [];
    return (
      <div style={{ marginBottom: "15px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
          <label style={{ fontWeight: "700", margin: 0, color: "var(--text-main, #1e293b)" }}>{title}</label>
          <button
            type="button"
            onClick={() => addSpecItem(field)}
            style={{
              padding: "5px 10px",
              background: "#3b82f6",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              fontSize: "0.78rem",
              fontWeight: "600",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "4px"
            }}
          >
            <FiPlus /> Add Spec
          </button>
        </div>
        {list.length === 0 ? (
          <div style={{ fontStyle: "italic", color: "var(--text-muted)", fontSize: "0.82rem", padding: "5px 0" }}>
            No specifications added yet.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <div style={{ display: "flex", gap: "8px", fontWeight: "700", fontSize: "0.8rem", color: "var(--text-muted)" }}>
              <div style={{ flex: 1 }}>Item</div>
              <div style={{ flex: 1 }}>Requirement</div>
              <div style={{ width: "32px" }}></div>
            </div>
            {list.map((spec, index) => (
              <div key={index} style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <input
                  type="text"
                  value={spec.item}
                  onChange={(e) => handleSpecChange(field, index, "item", e.target.value)}
                  placeholder="e.g. Image Format"
                  style={{ flex: 1, padding: "8px 10px", borderRadius: "6px", border: "1px solid var(--border-color)", background: "var(--bg-input)", color: "var(--text-main)", fontSize: "0.9rem" }}
                  required
                />
                <input
                  type="text"
                  value={spec.requirement}
                  onChange={(e) => handleSpecChange(field, index, "requirement", e.target.value)}
                  placeholder="e.g. JPG, PNG, WebP"
                  style={{ flex: 1, padding: "8px 10px", borderRadius: "6px", border: "1px solid var(--border-color)", background: "var(--bg-input)", color: "var(--text-main)", fontSize: "0.9rem" }}
                  required
                />
                <button
                  type="button"
                  onClick={() => removeSpecItem(field, index)}
                  style={{
                    padding: "8px",
                    background: "rgba(239, 68, 68, 0.1)",
                    color: "#ef4444",
                    border: "1px solid rgba(239, 68, 68, 0.2)",
                    borderRadius: "6px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                  title="Delete Spec"
                >
                  <FiTrash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const currentPageInfo = PAGE_OPTIONS.find(p => p.slug === selectedSlug) || {};

  return (
    <div className="account-page">
      <div className="account-header">
        <h1 className="account-title">{currentPageInfo.title}</h1>
        <p className="account-subtitle">{currentPageInfo.desc}</p>
      </div>

      {/* Pages Tabs selector */}
      <div className="settings-tabs-container">
        {PAGE_OPTIONS.map((page) => (
          <button
            key={page.slug}
            className={`settings-tab ${selectedSlug === page.slug ? "active" : ""}`}
            onClick={() => setSelectedSlug(page.slug)}
          >
            {page.icon} {page.title}
          </button>
        ))}
      </div>

      {/* Language Toggle */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
        <button
          type="button"
          className={`settings-tab ${selectedLang === "ta" ? "active" : ""}`}
          onClick={() => setSelectedLang("ta")}
          style={{ padding: "8px 20px", borderRadius: "8px", border: "1px solid var(--border-color)", cursor: "pointer", fontWeight: 600, fontSize: "14px", background: selectedLang === "ta" ? "var(--accent-orange)" : "var(--card-bg)", color: selectedLang === "ta" ? "#fff" : "var(--text-main)" }}
        >
          🇮🇳 தமிழ் (Tamil)
        </button>
        <button
          type="button"
          className={`settings-tab ${selectedLang === "en" ? "active" : ""}`}
          onClick={() => setSelectedLang("en")}
          style={{ padding: "8px 20px", borderRadius: "8px", border: "1px solid var(--border-color)", cursor: "pointer", fontWeight: 600, fontSize: "14px", background: selectedLang === "en" ? "var(--accent-orange)" : "var(--card-bg)", color: selectedLang === "en" ? "#fff" : "var(--text-main)" }}
        >
          🇬🇧 English
        </button>
      </div>

      <div className="cms-editor-container">
        {loading ? (
          <div style={{ padding: "80px", textAlign: "center", color: "var(--text-muted)", background: "var(--card-bg)", borderRadius: "12px", border: "1px solid var(--border-color)" }}>
            Loading page content...
          </div>
        ) : (
          <div className="account-card" style={{ display: "block" }}>
            <div className="cms-toolbar">
              <div className="last-published-info">
                <FiClock style={{ color: "#f97316" }} />
                <span><strong>Last Published:</strong> {formatDate(lastUpdated)}</span>
              </div>
              
              <div className="editor-mode-toggle">
                <button 
                  type="button"
                  className={`mode-toggle-btn ${activeTab === "edit" ? "active" : ""}`}
                  onClick={() => setActiveTab("edit")}
                >
                  <FiEdit2 size={14} /> Edit
                </button>
                <button 
                  type="button"
                  className={`mode-toggle-btn ${activeTab === "preview" ? "active" : ""}`}
                  onClick={() => setActiveTab("preview")}
                >
                  <FiEye size={14} /> Preview
                </button>
              </div>
            </div>

            <form onSubmit={handlePublish}>
              {activeTab === "edit" ? (
                <div style={{ marginBottom: "25px" }}>
                  <label style={{ display: "block", fontWeight: 600, marginBottom: "12px", fontSize: "14px", color: "var(--text-main)" }}>
                    Rich Text Content Editor
                  </label>
                  <div className="quill-editor-wrapper">
                    <ReactQuill
                      theme="snow"
                      value={content}
                      onChange={setContent}
                      modules={modules}
                      style={{ color: "black" }}
                    />
                  </div>
                </div>
              ) : (
                <div style={{ marginBottom: "25px" }}>
                  <label style={{ display: "block", fontWeight: 600, marginBottom: "15px", fontSize: "14px", color: "var(--text-main)" }}>
                    Live Preview (NewsGhuru Client View)
                  </label>
                  <div 
                    className="preview-container"
                    dangerouslySetInnerHTML={{ __html: content || "<p style='color: #888;'>No content written yet. Use the Edit tab to write some.</p>" }}
                  />
                </div>
              )}

              {/* DYNAMIC SECTIONS CONTROL (Only edit mode & when Advertise tab is selected) */}
              {selectedSlug === "advertise" && activeTab === "edit" && (
                <div style={{ marginTop: "40px", borderTop: "2px dashed var(--border-color, #e2e8f0)", paddingTop: "30px", display: "flex", flexDirection: "column", gap: "25px" }}>
                  <h3 style={{ fontSize: "1.2rem", fontWeight: "800", color: "var(--text-main, #1f2937)", margin: "0 0 5px 0" }}>
                    💼 Structured Advertising Settings ({selectedLang === "en" ? "English" : "Tamil"})
                  </h3>

                  {/* TARIFF CARD DOCUMENT UPLOAD */}
                  <div style={{ background: "var(--card-bg, #ffffff)", padding: "20px", borderRadius: "12px", border: "1px solid var(--border-color, #e2e8f0)" }}>
                    <h4 style={{ fontWeight: "700", fontSize: "1rem", color: "var(--text-main)", margin: "0 0 4px 0", display: "flex", alignItems: "center", gap: "8px" }}><FiFileText size={15} /> Advertising Tariff Card (PDF / Image)</h4>
                    <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", margin: "0 0 16px 0" }}>
                      Upload the official pricing sheet (PDF or image file) containing details about the sponsor advertising packages, rates, and placements.
                    </p>
                    
                    <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                      {/* Current file status */}
                      <div style={{ padding: "12px 16px", borderRadius: "8px", background: "var(--bg-secondary, #f8fafc)", border: "1px solid var(--border-color)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <span style={{ fontSize: "0.82rem", fontWeight: "600", color: "var(--text-muted)", display: "block" }}>CURRENT TARIFF FILE</span>
                          {adSettings.tariffCardPdf ? (
                            <a href={adSettings.tariffCardPdf.startsWith("http") ? adSettings.tariffCardPdf : `${API.defaults.baseURL}${adSettings.tariffCardPdf}`} target="_blank" rel="noreferrer" style={{ fontSize: "0.9rem", color: "var(--accent-orange)", fontWeight: "700", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "4px", marginTop: "2px" }}>
                              <FiDownload size={14} /> View / Download Uploaded Document
                            </a>
                          ) : (
                            <span style={{ fontSize: "0.88rem", color: "var(--text-muted)", fontStyle: "italic" }}>No custom document uploaded. Using default rates page tables.</span>
                          )}
                        </div>
                        {adSettings.tariffCardPdf && (
                          <button type="button" onClick={() => setAdSettings(prev => ({ ...prev, tariffCardPdf: "" }))} style={{ padding: "6px 12px", border: "1.5px solid #ef4444", background: "none", color: "#ef4444", borderRadius: "6px", fontSize: "0.78rem", fontWeight: "700", cursor: "pointer" }}>
                            Remove Link
                          </button>
                        )}
                      </div>

                      {/* File upload action */}
                      <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
                        <div style={{ flex: 1, minWidth: "220px" }}>
                          <input 
                            type="file" 
                            accept=".pdf,image/*" 
                            onChange={(e) => setTariffFile(e.target.files[0])}
                            style={{ width: "100%", padding: "8px", border: "1.5px dashed var(--border-color)", borderRadius: "8px", background: "var(--bg-input)", color: "var(--text-main)" }} 
                          />
                        </div>
                        <button 
                          type="button" 
                          onClick={handleTariffUpload}
                          disabled={uploadingTariff || !tariffFile}
                          style={{ padding: "10px 20px", background: "var(--accent-orange)", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "700", cursor: (uploadingTariff || !tariffFile) ? "not-allowed" : "pointer", display: "inline-flex", alignItems: "center", gap: "6px", opacity: (uploadingTariff || !tariffFile) ? 0.6 : 1 }}
                        >
                          <FiUpload size={14} /> {uploadingTariff ? "Uploading..." : "Upload Tariff Document"}
                        </button>
                        {tariffFile && (
                          <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginLeft: "8px" }}>Selected: {tariffFile.name}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* CONTACT INFO (Global) */}
                  <div style={{ background: "var(--card-bg, #ffffff)", padding: "20px", borderRadius: "12px", border: "1px solid var(--border-color, #e2e8f0)" }}>
                    <h4 style={{ fontWeight: "700", fontSize: "1rem", color: "var(--text-main)", margin: "0 0 12px 0", display: "flex", alignItems: "center", gap: "8px" }}><FiMail size={15} /> Global Media Sales Contact</h4>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "15px" }}>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label style={{ fontWeight: 600, fontSize: "0.85rem", display: "block", marginBottom: "4px" }}>Sales Email *</label>
                        <input 
                          type="email" 
                          name="salesEmail" 
                          value={adSettings.salesEmail} 
                          onChange={handleInputChange} 
                          style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--border-color)", background: "var(--bg-input)", color: "var(--text-main)" }} 
                          required 
                        />
                      </div>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label style={{ fontWeight: 600, fontSize: "0.85rem", display: "block", marginBottom: "4px" }}>Sales Phone *</label>
                        <input 
                          type="text" 
                          name="salesPhone" 
                          value={adSettings.salesPhone} 
                          onChange={handleInputChange} 
                          style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--border-color)", background: "var(--bg-input)", color: "var(--text-main)" }} 
                          required 
                        />
                      </div>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label style={{ fontWeight: 600, fontSize: "0.85rem", display: "block", marginBottom: "4px" }}>Sales Website *</label>
                        <input 
                          type="text" 
                          name="salesWebsite" 
                          value={adSettings.salesWebsite} 
                          onChange={handleInputChange} 
                          style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--border-color)", background: "var(--bg-input)", color: "var(--text-main)" }} 
                          required 
                        />
                      </div>
                    </div>
                  </div>

                  {/* BENEFITS EDITOR */}
                  <div style={{ background: "var(--card-bg, #ffffff)", padding: "20px", borderRadius: "12px", border: "1px solid var(--border-color, #e2e8f0)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--accent-orange, #ea580c)", fontWeight: "800", fontSize: "1rem", marginBottom: "15px" }}><FiStar /> Benefits Configuration</div>
                    {renderArrayEditor(
                      selectedLang === "en" ? "benefitsEn" : "benefitsTa",
                      selectedLang === "en" ? "Advertiser Benefits (English)" : "விளம்பர பலன்கள் (Tamil)",
                      "e.g. Priority publishing"
                    )}
                  </div>

                  {/* CREATIVE SPECS EDITOR */}
                  <div style={{ background: "var(--card-bg, #ffffff)", padding: "20px", borderRadius: "12px", border: "1px solid var(--border-color, #e2e8f0)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--text-main)", fontWeight: "800", fontSize: "1rem", marginBottom: "15px" }}><FiLayers /> Creative Specifications</div>
                    {renderSpecsEditor(
                      selectedLang === "en" ? "creativeSpecsEn" : "creativeSpecsTa",
                      selectedLang === "en" ? "Creative Specifications (English)" : "விளம்பர வடிவமைப்பு விதிகள் (Tamil)"
                    )}
                  </div>

                  {/* PAYMENT TERMS EDITOR */}
                  <div style={{ background: "var(--card-bg, #ffffff)", padding: "20px", borderRadius: "12px", border: "1px solid var(--border-color, #e2e8f0)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--text-main)", fontWeight: "800", fontSize: "1rem", marginBottom: "15px" }}><FiDollarSign /> Guidelines & Payment Rules</div>
                    {renderArrayEditor(
                      selectedLang === "en" ? "paymentTermsEn" : "paymentTermsTa",
                      selectedLang === "en" ? "Payment Terms & Guidelines (English)" : "கட்டண விதிமுறைகள் (Tamil)",
                      "e.g. GST will be charged extra."
                    )}
                  </div>

                </div>
              )}

              <div className="cms-actions-footer">
                <button
                  type="button"
                  className="save-btn discard-btn"
                  onClick={fetchPageContent}
                  disabled={saving}
                >
                  Discard Changes
                </button>
                
                <button
                  type="submit"
                  className="save-btn publish-btn"
                  disabled={saving}
                >
                  <FiGlobe /> {saving ? "Publishing..." : "Publish Updates"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default WebsiteSettings;

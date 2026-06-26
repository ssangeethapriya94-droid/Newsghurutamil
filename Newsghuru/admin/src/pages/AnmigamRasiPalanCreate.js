import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../config/api";
import { 
  TbZodiacAries, TbZodiacTaurus, TbZodiacGemini, TbZodiacCancer, 
  TbZodiacLeo, TbZodiacVirgo, TbZodiacLibra, TbZodiacScorpio, 
  TbZodiacSagittarius, TbZodiacCapricorn, TbZodiacAquarius, TbZodiacPisces 
} from "react-icons/tb";
import "../styles/AnmigamRasiPalan.css";

const RASI_SIGNS = {
  ta: [
    { key: "aries", name: "மேஷம்", period: "21 மார்ச் - 19 ஏப்ரல்", color: "#ef4444" },
    { key: "taurus", name: "ரிஷபம்", period: "20 ஏப்ரல் - 20 மே", color: "#ea580c" },
    { key: "gemini", name: "மிதுனம்", period: "21 மே - 20 ஜூன்", color: "#10b981" },
    { key: "cancer", name: "கடகம்", period: "21 ஜூன் - 22 ஜூலை", color: "#2563eb" },
    { key: "leo", name: "சிம்மம்", period: "23 ஜூலை - 22 ஆகஸ்ட்", color: "#f97316" },
    { key: "virgo", name: "கன்னி", period: "23 ஆகஸ்ட் - 22 செப்", color: "#8b5cf6" },
    { key: "libra", name: "துலாம்", period: "23 செப் - 22 அக்டோபர்", color: "#84cc16" },
    { key: "scorpio", name: "விருச்சிகம்", period: "23 அக்டோபர் - 21 நவம்பர்", color: "#db2777" },
    { key: "sagittarius", name: "தனுசு", period: "22 நவம்பர் - 21 டிசம்பர்", color: "#d97706" },
    { key: "capricorn", name: "மகரம்", period: "22 டிசம்பர் - 19 ஜனவரி", color: "#78350f" },
    { key: "aquarius", name: "கும்பம்", period: "20 ஜனவரி - 18 பிப்ரவரி", color: "#0891b2" },
    { key: "pisces", name: "மீனம்", period: "19 பிப்ரவரி - 20 மார்ச்", color: "#4f46e5" }
  ],
  en: [
    { key: "aries", name: "Aries", period: "Mar 21 - Apr 19", color: "#ef4444" },
    { key: "taurus", name: "Taurus", period: "Apr 20 - May 20", color: "#ea580c" },
    { key: "gemini", name: "Gemini", period: "May 21 - Jun 20", color: "#10b981" },
    { key: "cancer", name: "Cancer", period: "Jun 21 - Jul 22", color: "#2563eb" },
    { key: "leo", name: "Leo", period: "Jul 23 - Aug 22", color: "#f97316" },
    { key: "virgo", name: "Virgo", period: "Aug 23 - Sep 22", color: "#8b5cf6" },
    { key: "libra", name: "Libra", period: "Sep 23 - Oct 22", color: "#84cc16" },
    { key: "scorpio", name: "Scorpio", period: "Oct 23 - Nov 21", color: "#db2777" },
    { key: "sagittarius", name: "Sagittarius", period: "Nov 22 - Dec 21", color: "#d97706" },
    { key: "capricorn", name: "Capricorn", period: "Dec 22 - Jan 19", color: "#78350f" },
    { key: "aquarius", name: "Aquarius", period: "Jan 20 - Feb 18", color: "#0891b2" },
    { key: "pisces", name: "Pisces", period: "Feb 19 - Mar 20", color: "#4f46e5" }
  ]
};

const ZODIAC_ICONS = {
  aries: TbZodiacAries,
  taurus: TbZodiacTaurus,
  gemini: TbZodiacGemini,
  cancer: TbZodiacCancer,
  leo: TbZodiacLeo,
  virgo: TbZodiacVirgo,
  libra: TbZodiacLibra,
  scorpio: TbZodiacScorpio,
  sagittarius: TbZodiacSagittarius,
  capricorn: TbZodiacCapricorn,
  aquarius: TbZodiacAquarius,
  pisces: TbZodiacPisces
};

const getDayName = (dateStr, lang) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const formatter = new Intl.DateTimeFormat(lang === "ta" ? "ta-IN" : "en-US", { weekday: "long" });
  return formatter.format(date);
};

const getTamilDateString = (dateStr) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const formatter = new Intl.DateTimeFormat("ta-IN", { day: "numeric", month: "long", year: "numeric" });
  return formatter.format(date);
};

const getEnglishDateString = (dateStr) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const formatter = new Intl.DateTimeFormat("en-US", { day: "numeric", month: "long", year: "numeric" });
  return formatter.format(date);
};

function AnmigamRasiPalanCreate() {
  const navigate = useNavigate();
  const { id } = useParams();
  const role = localStorage.getItem("role");

  const [language, setLanguage] = useState("ta");
  const [periodType, setPeriodType] = useState("day");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState("");
  const [dayName, setDayName] = useState("");
  const [title, setTitle] = useState("");
  const [predictions, setPredictions] = useState({});
  const [status, setStatus] = useState("draft");
  const [creatorInfo, setCreatorInfo] = useState(null);
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize predictions object when language changes
  useEffect(() => {
    const signs = RASI_SIGNS[language];
    const initialPredictions = {};
    signs.forEach(sign => {
      initialPredictions[sign.key] = predictions[sign.key] || "";
    });
    setPredictions(initialPredictions);
    
    // Auto set dayName
    if (periodType === "day" && date) {
      setDayName(getDayName(date, language));
    } else {
      setDayName("");
    }
  }, [language, date, periodType]);

  // Load entry if editing
  useEffect(() => {
    if (id) {
      const fetchEntry = async () => {
        try {
          const res = await API.get(`/api/anmigam/rasi-palan/${id}`);
          const data = res.data;
          setLanguage(data.language);
          setPeriodType(data.periodType);
          setDate(data.date ? new Date(data.date).toISOString().split("T")[0] : "");
          setEndDate(data.endDate ? new Date(data.endDate).toISOString().split("T")[0] : "");
          setDayName(data.dayName || "");
          setTitle(data.title || "");
          setStatus(data.status);
          setCreatorInfo(data.createdBy);

          const predMap = {};
          data.predictions.forEach(p => {
            predMap[p.rasiKey] = p.description;
          });
          setPredictions(predMap);
        } catch (error) {
          console.error("Error fetching record:", error);
          alert("Failed to load horoscope entry");
        }
      };
      fetchEntry();
    }
  }, [id]);

  const handlePredictionChange = (key, val) => {
    setPredictions(prev => ({
      ...prev,
      [key]: val
    }));
    if (errors[key]) {
      setErrors(prev => ({ ...prev, [key]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!date) newErrors.date = "Date is required";
    if (periodType !== "day" && !endDate) newErrors.endDate = "End date is required";

    const signs = RASI_SIGNS[language];
    signs.forEach(sign => {
      if (!predictions[sign.key] || !predictions[sign.key].trim()) {
        newErrors[sign.key] = `${sign.name} prediction is required`;
      } else if (predictions[sign.key].length > 500) {
        newErrors[sign.key] = "Maximum 500 characters allowed";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (submitStatus) => {
    if (!validate()) {
      alert("Please fix validation errors first.");
      return;
    }

    try {
      setIsSubmitting(true);
      const signs = RASI_SIGNS[language];
      const predictionsPayload = signs.map(sign => ({
        rasiKey: sign.key,
        name: sign.name,
        description: predictions[sign.key] || ""
      }));

      // Generate localized title if empty
      let finalTitle = title;
      if (!finalTitle) {
        if (periodType === "day") {
          finalTitle = language === "ta" ? "இன்றைய ராசிபலன்" : "Today's Horoscope";
        } else if (periodType === "week") {
          finalTitle = language === "ta" ? "வார ராசிபலன்" : "Weekly Horoscope";
        } else {
          finalTitle = language === "ta" ? "மாத ராசிபலன்" : "Monthly Horoscope";
        }
      }

      const payload = {
        language,
        periodType,
        date,
        endDate: periodType !== "day" ? endDate : undefined,
        dayName: periodType === "day" ? dayName : undefined,
        title: finalTitle,
        predictions: predictionsPayload,
        status: submitStatus
      };

      if (id) {
        await API.put(`/api/anmigam/rasi-palan/${id}`, payload);
        alert("Horoscope entry updated successfully!");
      } else {
        await API.post("/api/anmigam/rasi-palan", payload);
        alert("Horoscope entry saved successfully!");
      }

      navigate("/admin/anmigam/rasi-palan");
    } catch (error) {
      console.error("Save error:", error);
      alert(error.response?.data?.message || "Server error saving horoscope");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAdminAction = async (action) => {
    if (!id) return;
    try {
      setIsSubmitting(true);
      if (action === "reject") {
        const reason = window.prompt("Enter rejection reason:");
        if (reason === null) return;
        if (!reason.trim()) {
          alert("Rejection reason is required");
          return;
        }
        await API.put(`/api/anmigam/rasi-palan/${id}/reject`, { reason });
      } else {
        await API.put(`/api/anmigam/rasi-palan/${id}/${action}`);
      }
      alert(`Horoscope ${action}ed successfully!`);
      navigate("/admin/anmigam/rasi-palan");
    } catch (error) {
      console.error(`Error performing ${action}:`, error);
      alert(error.response?.data?.message || `Failed to ${action}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentSigns = RASI_SIGNS[language] || [];
  
  // Format Preview Date text
  const getPreviewDateText = () => {
    if (periodType === "day") {
      return language === "ta" 
        ? `${getTamilDateString(date)}, ${dayName}`
        : `${getEnglishDateString(date)}, ${dayName}`;
    } else {
      const startStr = language === "ta" ? getTamilDateString(date) : getEnglishDateString(date);
      const endStr = language === "ta" ? getTamilDateString(endDate) : getEnglishDateString(endDate);
      return `${startStr} - ${endStr}`;
    }
  };

  const getPreviewTitle = () => {
    if (title) return title;
    if (periodType === "day") {
      return language === "ta" ? "இன்றைய ராசிபலன்" : "Today's Horoscope";
    } else if (periodType === "week") {
      return language === "ta" ? "வார ராசிபலன்" : "Weekly Horoscope";
    } else {
      return language === "ta" ? "மாத ராசிபலன்" : "Monthly Horoscope";
    }
  };

  return (
    <div className="anmigam-editor-container">
      
      {/* Top Header Buttons */}
      <div className="editor-top-actions">
        <div>
          <h2>Rasi Palan - {id ? "Edit Record" : "Create New"}</h2>
        </div>
        <div className="action-buttons-group">
          {role === "editor" && (
            <>
              {(status === "draft" || status === "rejected") && (
                <>
                  <button className="btn-save-draft" disabled={isSubmitting} onClick={() => handleSave("draft")}>
                    Save Draft
                  </button>
                  <button className="btn-submit" disabled={isSubmitting} onClick={() => handleSave("submitted")}>
                    Submit to Admin
                  </button>
                </>
              )}
            </>
          )}

          {role === "admin" && (
            <>
              {(!id || status === "draft" || status === "rejected") && (
                <>
                  <button className="btn-save-draft" disabled={isSubmitting} onClick={() => handleSave("draft")}>
                    Save Draft
                  </button>
                  <button className="btn-submit" disabled={isSubmitting} onClick={() => handleSave("published")}>
                    Publish Directly
                  </button>
                </>
              )}
              {id && status === "submitted" && (
                <>
                  <button className="btn-save-draft" disabled={isSubmitting} onClick={() => handleSave("submitted")}>
                    Save Changes
                  </button>
                  <button className="btn-approve" disabled={isSubmitting} onClick={() => handleAdminAction("approve")}>
                    Approve
                  </button>
                  <button className="btn-reject" disabled={isSubmitting} onClick={() => handleAdminAction("reject")}>
                    Reject
                  </button>
                </>
              )}
              {id && status === "approved" && (
                <>
                  <button className="btn-save-draft" disabled={isSubmitting} onClick={() => handleSave("approved")}>
                    Save Changes
                  </button>
                  <button className="btn-publish" disabled={isSubmitting} onClick={() => handleAdminAction("publish")}>
                    Publish Live
                  </button>
                </>
              )}
              {id && status === "published" && (
                <button className="btn-submit" disabled={isSubmitting} onClick={() => handleSave("published")}>
                  Save Changes
                </button>
              )}
            </>
          )}
          <button className="btn-cancel" onClick={() => navigate("/admin/anmigam/rasi-palan")}>
            Cancel
          </button>
        </div>
      </div>

      <div className="editor-layout">
        
        {/* Left Side: Creation Form */}
        <div className="editor-form-panel card-panel">
          <h3>Horoscope Details</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label>Language *</label>
              <select value={language} onChange={(e) => setLanguage(e.target.value)}>
                <option value="ta">Tamil</option>
                <option value="en">English</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>Period Type *</label>
              <select value={periodType} onChange={(e) => setPeriodType(e.target.value)}>
                <option value="day">Daily</option>
                <option value="week">Weekly</option>
                <option value="month">Monthly</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>{periodType === "day" ? "Date *" : "Start Date *"}</label>
              <input 
                type="date" 
                value={date} 
                onChange={(e) => setDate(e.target.value)}
              />
              {errors.date && <span className="error-text">{errors.date}</span>}
            </div>

            {periodType !== "day" && (
              <div className="form-group">
                <label>End Date *</label>
                <input 
                  type="date" 
                  value={endDate} 
                  onChange={(e) => setEndDate(e.target.value)}
                />
                {errors.endDate && <span className="error-text">{errors.endDate}</span>}
              </div>
            )}

            {periodType === "day" && (
              <div className="form-group">
                <label>Day Name</label>
                <input 
                  type="text" 
                  value={dayName} 
                  readOnly 
                  style={{ backgroundColor: "rgba(0,0,0,0.05)" }}
                />
              </div>
            )}
          </div>

          <div className="form-group">
            <label>Title (Optional)</label>
            <input 
              type="text" 
              placeholder={language === "ta" ? "எ.கா. இன்றைய ராசிபலன்" : "e.g. Today's Horoscope"}
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
            />
          </div>

          <hr style={{ margin: "20px 0", borderColor: "var(--border-color)" }} />
          
          <h3>Rasi Palan Predictions ({language === "ta" ? "Tamil" : "English"})</h3>
          <div className="predictions-list">
            {currentSigns.map((sign) => {
              const Icon = ZODIAC_ICONS[sign.key] || TbZodiacAries;
              const charCount = (predictions[sign.key] || "").length;
              return (
                <div key={sign.key} className="prediction-input-card">
                  <div className="sign-header" style={{ borderLeft: `4px solid ${sign.color}` }}>
                    <div className="sign-badge" style={{ backgroundColor: sign.color }}>
                      <Icon size={20} />
                    </div>
                    <span className="sign-name">{sign.name}</span>
                    <span className="char-counter">{charCount}/500</span>
                  </div>
                  <textarea 
                    value={predictions[sign.key] || ""} 
                    onChange={(e) => handlePredictionChange(sign.key, e.target.value)}
                    placeholder={`Enter horoscope prediction for ${sign.name}...`}
                    rows={3}
                  />
                  {errors[sign.key] && <span className="error-text">{errors[sign.key]}</span>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Middle: Live Frontend Preview */}
        <div className="editor-preview-panel">
          <div className="preview-header-label">
            <span>PREVIEW - {language === "ta" ? "TAMIL" : "ENGLISH"}</span>
          </div>

          <div className="website-preview-card">
            
            {/* Localized Banner Header */}
            <div className="horoscope-banner">
              <h2>{getPreviewTitle()}</h2>
              <div className="banner-date">
                📅 {getPreviewDateText()}
              </div>
            </div>

            {/* 12 Signs Grid */}
            <div className="horoscope-grid">
              {currentSigns.map((sign) => {
                const Icon = ZODIAC_ICONS[sign.key] || TbZodiacAries;
                return (
                  <div key={sign.key} className="horoscope-item-card">
                    <div className="horoscope-item-header">
                      <div className="horoscope-item-badge" style={{ backgroundColor: sign.color }}>
                        <Icon size={20} />
                      </div>
                      <div>
                        <div className="horoscope-item-name">{sign.name}</div>
                        <div className="horoscope-item-period">{sign.period}</div>
                      </div>
                    </div>
                    <div className="horoscope-item-description">
                      {predictions[sign.key] || (language === "ta" ? "பலன்கள் இன்னும் சேர்க்கப்படவில்லை..." : "Predictions not added yet...")}
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* View Full Button */}
            <div style={{ textAlign: "center", marginTop: "20px" }}>
              <button className="preview-action-btn">
                {language === "ta" ? "முழு பலன் படிக்க" : "Read Full Horoscope"}
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Status Tracker Widget */}
        <div className="editor-status-sidebar">
          
          <div className="status-widget-card card-panel">
            <h3>Rasi Palan Status</h3>
            
            <div className="status-row">
              <span className="status-label">Current Status:</span>
              <span className={`status-badge-widget status-${status}`}>
                {status.toUpperCase()}
              </span>
            </div>

            <div className="creator-details">
              <strong>Created By:</strong>
              <div>{creatorInfo ? creatorInfo.name : "You (Editor)"}</div>
              <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>
                {id ? "Active record" : "New record"}
              </div>
            </div>

            <hr style={{ margin: "16px 0", borderColor: "var(--border-color)" }} />
            
            <strong>Workflow Steps:</strong>
            <div className="workflow-steps">
              <div className={`step-item ${status === "draft" ? "active" : "completed"}`}>
                <div className="step-number">1</div>
                <div>
                  <strong>Editor</strong>
                  <div>Create &amp; Save Draft</div>
                </div>
              </div>

              <div className={`step-item ${status === "submitted" ? "active" : status === "approved" || status === "published" ? "completed" : ""}`}>
                <div className="step-number">2</div>
                <div>
                  <strong>Admin Review</strong>
                  <div>Verify &amp; Approve / Reject</div>
                </div>
              </div>

              <div className={`step-item ${status === "published" ? "active" : ""}`}>
                <div className="step-number">3</div>
                <div>
                  <strong>Publish</strong>
                  <div>Live on Website</div>
                </div>
              </div>
            </div>

            <div className="widget-notice">
              * Only Admin can approve and publish horoscope predictions live.
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

export default AnmigamRasiPalanCreate;

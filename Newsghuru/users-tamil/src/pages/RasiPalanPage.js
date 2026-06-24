import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import API from "../config/api";
import useSEO from "../hooks/useSEO";
import AdZone from "../components/AdZone";

const RASI_SIGNS = [
  { key: "aries", name: "மேஷம்", period: "21 மார்ச் - 19 ஏப்ரல்", color: "#e87830" },
  { key: "taurus", name: "ரிஷபம்", period: "20 ஏப்ரல் - 20 மே", color: "#e87830" },
  { key: "gemini", name: "மிதுனம்", period: "21 மே - 20 ஜூன்", color: "#e87830" },
  { key: "cancer", name: "கடகம்", period: "21 ஜூன் - 22 ஜூலை", color: "#e87830" },
  { key: "leo", name: "சிம்மம்", period: "23 ஜூலை - 22 ஆகஸ்ட்", color: "#e87830" },
  { key: "virgo", name: "கன்னி", period: "23 ஆகஸ்ட் - 22 செப்", color: "#e87830" },
  { key: "libra", name: "துலாம்", period: "23 செப் - 22 அக்டோபர்", color: "#e87830" },
  { key: "scorpio", name: "விருச்சிகம்", period: "23 அக்டோபர் - 21 நவம்பர்", color: "#e87830" },
  { key: "sagittarius", name: "தனுசு", period: "22 நவம்பர் - 21 டிசம்பர்", color: "#e87830" },
  { key: "capricorn", name: "மகரம்", period: "22 டிசம்பர் - 19 ஜனவரி", color: "#e87830" },
  { key: "aquarius", name: "கும்பம்", period: "20 ஜனவரி - 18 பிப்ரவரி", color: "#e87830" },
  { key: "pisces", name: "மீனம்", period: "19 பிப்ரவரி - 20 மார்ச்", color: "#e87830" }
];

// Real vector zodiac icons matching reference image exactly (scaled up to overlap circle boundaries)
const ZODIAC_IMG = (sign, size = "80%") => (
  <img
    src={`/icons/zodiac/${sign}.svg`}
    alt={sign}
    style={{
      width: size,
      height: size,
      objectFit: "contain",
      display: "block",
      flexShrink: 0
    }}
  />
);


function RasiPalanPage() {
  useSEO({
    title: "இன்றைய ராசிபலன் | வார மற்றும் மாத ராசிபலன்கள் - நியூஸ் குரு",
    description: "தினசரி ராசிபலன், வார ராசிபலன் மற்றும் மாத ராசிபலன்களை துல்லியமாக படியுங்கள்.",
    keywords: "ராசிபலன், ஜோசியம், தினசரி ராசிபலன், வார ராசிபலன், ஆன்மீகம், Rasi Palan Tamil",
  });

  const [activeTab, setActiveTab] = useState("day"); // day, week, month
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [rasiRecord, setRasiRecord] = useState(null);
  const [allRecords, setAllRecords] = useState([]); // Used to populate weekly/monthly range selects
  const [selectedSign, setSelectedSign] = useState(RASI_SIGNS[0].key);
  const [loading, setLoading] = useState(false);

  // Fetch available weekly/monthly records to let user choose date ranges
  useEffect(() => {
    const fetchAllRanges = async () => {
      try {
        const res = await API.get(`/api/anmigam/rasi-palan?language=ta&periodType=${activeTab}`);
        setAllRecords(res.data || []);
        if (res.data && res.data.length > 0) {
          // Default to the latest one
          const latest = res.data[0];
          setSelectedDate(new Date(latest.date).toISOString().split("T")[0]);
        } else {
          setRasiRecord(null);
        }
      } catch (err) {
        console.error("Error fetching ranges:", err);
      }
    };

    if (activeTab === "day") {
      // For daily, we query by today's date directly
      setSelectedDate(new Date().toISOString().split("T")[0]);
    } else {
      fetchAllRanges();
    }
  }, [activeTab]);

  // Fetch the active record based on activeTab and selectedDate
  useEffect(() => {
    const fetchActiveRecord = async () => {
      try {
        setLoading(true);
        const res = await API.get(`/api/anmigam/rasi-palan/latest?language=ta&periodType=${activeTab}&date=${selectedDate}`);
        setRasiRecord(res.data);
      } catch (err) {
        console.error("Error fetching rasi record:", err);
        setRasiRecord(null);
      } finally {
        setLoading(false);
      }
    };

    if (selectedDate) {
      fetchActiveRecord();
    }
  }, [selectedDate, activeTab]);

  const getPredictionForSign = (key) => {
    if (!rasiRecord || !rasiRecord.predictions) return "";
    const p = rasiRecord.predictions.find(item => item.rasiKey === key);
    return p ? p.description : "";
  };

  const formatDateText = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("ta-IN", { day: "numeric", month: "long", year: "numeric" });
  };

  const getPeriodText = () => {
    if (!rasiRecord) return "";
    if (rasiRecord.periodType === "day") {
      return `${formatDateText(rasiRecord.date)} (${rasiRecord.dayName || ""})`;
    }
    return `${formatDateText(rasiRecord.date)} முதல் ${formatDateText(rasiRecord.endDate)} வரை`;
  };

  return (
    <div className="spiritual-page-container" style={{ padding: "30px var(--padding-x)", maxWidth: "1200px", margin: "0 auto", minHeight: "80vh" }}>
      <style>{`
        .rasi-scroll-container::-webkit-scrollbar {
          display: none;
        }
        .rasi-scroll-container {
          -ms-overflow-style: none;
          scrollbar-width: none;
          display: flex;
          gap: 18px;
          overflow-x: auto;
          padding: 15px 5px;
          margin-bottom: 30px;
        }
        
        /* Zodiac Item Wrapper */
        .zodiac-item-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          cursor: pointer;
          width: 95px;
          flex-shrink: 0;
          transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .zodiac-item-wrapper:hover {
          transform: translateY(-5px);
        }
        
        /* Circle Design */
        .zodiac-circle-container {
          width: 72px;
          height: 72px;
          border-radius: 50%;
          background-color: #fff;
          border: 2px solid rgba(232, 120, 48, 0.3);
          box-shadow: 0 4px 10px rgba(232, 120, 48, 0.08);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: visible;
          transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .dark-theme .zodiac-circle-container {
          background-color: var(--bg-secondary);
          border-color: rgba(232, 120, 48, 0.25);
        }
        
        /* Hover State */
        .zodiac-item-wrapper:hover .zodiac-circle-container {
          transform: scale(1.12);
          border: 3px solid #e87830;
          box-shadow: 0 0 20px rgba(232, 120, 48, 0.6), 0 6px 12px rgba(232, 120, 48, 0.2);
        }
        
        /* Active / Selected State: premium orange gradient background, strong glow */
        .zodiac-circle-container.active {
          background: linear-gradient(135deg, #f97316 0%, #ea580c 100%) !important;
          border: 3px solid #ea580c !important;
          box-shadow: 0 0 25px rgba(234, 88, 12, 0.8), 0 6px 15px rgba(234, 88, 12, 0.4) !important;
          transform: scale(1.15) !important;
        }
        
        /* Turn active SVG icon to pure white */
        .zodiac-circle-container.active img {
          filter: brightness(0) invert(1) !important;
        }
        
        /* Text Label */
        .zodiac-label {
          font-size: 0.85rem;
          margin-top: 10px;
          font-weight: 600;
          color: var(--text-secondary);
          transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .zodiac-item-wrapper:hover .zodiac-label {
          color: #e87830 !important;
          font-weight: 700;
        }
        
        .zodiac-label.active {
          color: #e87830 !important;
          font-weight: 700;
        }
        
        /* Bottom Grid Card Styles */
        .zodiac-grid-card {
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 20px;
          cursor: pointer;
          transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .zodiac-grid-card:hover {
          transform: translateY(-5px);
          border-color: #e87830 !important;
          box-shadow: 0 8px 30px rgba(232, 120, 48, 0.15);
        }
        
        .zodiac-grid-circle {
          width: 54px;
          height: 54px;
          border-radius: 50%;
          background-color: #fff;
          border: 2px solid rgba(232, 120, 48, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .dark-theme .zodiac-grid-circle {
          background-color: var(--bg-primary);
        }
        
        .zodiac-grid-card:hover .zodiac-grid-circle {
          transform: scale(1.1);
          border-color: #e87830;
          box-shadow: 0 0 15px rgba(232, 120, 48, 0.5);
        }
      `}</style>
      
      {/* Subcategory Navigation Menu */}
      <div style={{
        display: "flex",
        justifyContent: "center",
        gap: "15px",
        marginBottom: "35px",
        borderBottom: "1px solid var(--border-color)",
        paddingBottom: "12px"
      }}>
        <NavLink 
          to="/anmigam/rasi-palan" 
          style={({ isActive }) => ({
            textDecoration: "none",
            color: isActive ? "var(--accent-orange)" : "var(--text-secondary)",
            fontWeight: "700",
            fontSize: "1.05rem",
            padding: "6px 18px",
            borderRadius: "20px",
            background: isActive ? "rgba(245, 158, 11, 0.12)" : "transparent",
            transition: "all 0.3s ease"
          })}
        >
          ராசி பலன் (Horoscope)
        </NavLink>
        <NavLink 
          to="/anmigam/temple-blogs" 
          style={({ isActive }) => ({
            textDecoration: "none",
            color: isActive ? "var(--accent-orange)" : "var(--text-secondary)",
            fontWeight: "700",
            fontSize: "1.05rem",
            padding: "6px 18px",
            borderRadius: "20px",
            background: isActive ? "rgba(245, 158, 11, 0.12)" : "transparent",
            transition: "all 0.3s ease"
          })}
        >
          கோவில் பதிவுகள் (Temple Blogs)
        </NavLink>
      </div>

      {/* Title */}
      <div style={{ textAlign: "center", marginBottom: "30px" }}>
        <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "2.4rem", color: "var(--text-primary)", marginBottom: "8px" }}>
          ஆன்மீக ராசி பலன்
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "1.05rem" }}>
          இன்றைய, வார மற்றும் மாத பலன்களை உடனுக்குடன் அறிந்து கொள்ளுங்கள்.
        </p>
      </div>

      {/* Tabs */}
      <div className="spiritual-tabs" style={{ display: "flex", justifyContent: "center", borderBottom: "2px solid var(--border-color)", marginBottom: "25px", gap: "20px" }}>
        <button 
          onClick={() => { setActiveTab("day"); }}
          style={{ padding: "12px 24px", background: "none", border: "none", color: activeTab === "day" ? "var(--accent-orange)" : "var(--text-secondary)", fontWeight: "700", fontSize: "1.1rem", borderBottom: activeTab === "day" ? "3px solid var(--accent-orange)" : "3px solid transparent", cursor: "pointer", transition: "all 0.2s" }}
        >
          இன்றைய ராசி
        </button>
        <button 
          onClick={() => { setActiveTab("week"); }}
          style={{ padding: "12px 24px", background: "none", border: "none", color: activeTab === "week" ? "var(--accent-orange)" : "var(--text-secondary)", fontWeight: "700", fontSize: "1.1rem", borderBottom: activeTab === "week" ? "3px solid var(--accent-orange)" : "3px solid transparent", cursor: "pointer", transition: "all 0.2s" }}
        >
          வார ராசிபலன்
        </button>
        <button 
          onClick={() => { setActiveTab("month"); }}
          style={{ padding: "12px 24px", background: "none", border: "none", color: activeTab === "month" ? "var(--accent-orange)" : "var(--text-secondary)", fontWeight: "700", fontSize: "1.1rem", borderBottom: activeTab === "month" ? "3px solid var(--accent-orange)" : "3px solid transparent", cursor: "pointer", transition: "all 0.2s" }}
        >
          மாத ராசிபலன்
        </button>
      </div>

      {/* Date Select Dropdown for Weekly / Monthly */}
      {activeTab !== "day" && allRecords.length > 0 && (
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "25px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontWeight: "600", color: "var(--text-primary)" }}>காலத்தை தேர்வு செய்யவும்:</span>
            <select 
              value={selectedDate} 
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{ padding: "8px 16px", borderRadius: "8px", border: "1px solid var(--border-color)", background: "var(--bg-secondary)", color: "var(--text-primary)", outline: "none", fontWeight: "600" }}
            >
              {allRecords.map((rec) => {
                const sDate = new Date(rec.date).toLocaleDateString("ta-IN", { day: "numeric", month: "short" });
                const eDate = rec.endDate ? " - " + new Date(rec.endDate).toLocaleDateString("ta-IN", { day: "numeric", month: "short", year: "numeric" }) : "";
                return (
                  <option key={rec._id} value={new Date(rec.date).toISOString().split("T")[0]}>
                    {sDate}{eDate}
                  </option>
                );
              })}
            </select>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ padding: "60px 0", textAlign: "center", color: "var(--text-muted)" }}>
          <h3>ராசிபலன் தகவல்கள் ஏற்றப்படுகின்றன...</h3>
        </div>
      ) : !rasiRecord ? (
        <div className="glass-panel" style={{ padding: "60px 20px", textAlign: "center", borderRadius: "16px", border: "1px solid var(--border-color)", background: "var(--bg-secondary)" }}>
          <h3 style={{ color: "var(--text-secondary)", marginBottom: "10px" }}>தகவல்கள் ஏதும் இல்லை 😔</h3>
          <p style={{ color: "var(--text-muted)" }}>தேர்வு செய்யப்பட்ட தேதிக்கான ராசிபலன்கள் இன்னும் வெளியிடப்படவில்லை.</p>
        </div>
      ) : (
        <div>
          {/* Banner */}
          <div style={{ background: "var(--brand-gradient)", borderRadius: "16px", padding: "30px 20px", textAlign: "center", color: "white", marginBottom: "30px", boxShadow: "0 8px 30px rgba(0,0,0,0.15)", position: "relative", overflow: "hidden" }}>
            <h2 style={{ fontSize: "2.1rem", fontWeight: "700", marginBottom: "10px", fontFamily: "serif" }}>
              {rasiRecord.title}
            </h2>
            <div style={{ display: "inline-block", backgroundColor: "rgba(255,255,255,0.15)", padding: "6px 20px", borderRadius: "20px", fontSize: "0.95rem", backdropFilter: "blur(5px)" }}>
              {getPeriodText()}
            </div>
          </div>

          {/* Rasi Circular Icons Row (For Selection) - Real bubble icons style */}
          <div className="rasi-scroll-container">
            {RASI_SIGNS.map((sign) => {
              const isSelected = selectedSign === sign.key;
              return (
                <div 
                  key={sign.key}
                  onClick={() => setSelectedSign(sign.key)}
                  className="zodiac-item-wrapper"
                >
                  <div className={`zodiac-circle-container ${isSelected ? "active" : ""}`}>
                    {ZODIAC_IMG(sign.key, "68%")}
                  </div>
                  <span className={`zodiac-label ${isSelected ? "active" : ""}`}>
                    {sign.name}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Two-Column layout: Prediction + Sidebar Ad */}
          {(() => {
            const activeSign = RASI_SIGNS.find(s => s.key === selectedSign);
            const predictionText = getPredictionForSign(selectedSign);
            
            const readerData = (() => {
              try {
                const dataStr = localStorage.getItem("readerData");
                return dataStr ? JSON.parse(dataStr) : null;
              } catch (e) {
                return null;
              }
            })();
            const isPremium = readerData?.isPremium || false;

            return (
              <div style={{ display: "grid", gridTemplateColumns: !isPremium ? "1fr 300px" : "1fr", gap: "30px", alignItems: "start" }}>
                {/* Left: Detail Card */}
                <div 
                  className="glass-panel"
                  style={{ 
                    padding: "35px", 
                    borderRadius: "16px", 
                    border: "1px solid var(--border-color)", 
                    background: "var(--bg-secondary)",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.03)",
                    position: "relative",
                    borderLeft: `8px solid ${activeSign.color}`
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "20px" }}>
                    <div style={{
                      width: "64px",
                      height: "64px",
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
                      border: "3px solid #ea580c",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 0 20px rgba(234, 88, 12, 0.6), 0 4px 12px rgba(234, 88, 12, 0.3)",
                      position: "relative",
                      overflow: "visible"
                    }}>
                      <div style={{ filter: "brightness(0) invert(1)", display: "flex", alignItems: "center", justifyContent: "center", width: "100%", height: "100%" }}>
                        {ZODIAC_IMG(selectedSign, "68%")}
                      </div>
                    </div>
                    <div>
                      <h3 style={{ fontSize: "1.6rem", fontWeight: "800", color: "var(--text-primary)" }}>
                        {activeSign.name} ({activeSign.period})
                      </h3>
                      <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "2px" }}>
                        {activeTab === "day" ? "இன்றைய பலன்" : activeTab === "week" ? "வாரப் பலன்" : "மாதப் பலன்"}
                      </div>
                    </div>
                  </div>

                  <p style={{ fontSize: "1.1rem", lineHeight: "1.8", color: "var(--text-primary)", whiteSpace: "pre-line" }}>
                    {predictionText || "இந்தப் ராசிக்கான பலன்கள் இன்னும் சேர்க்கப்படவில்லை."}
                  </p>
                </div>

                {/* Right: Sidebar Ad */}
                {!isPremium && (
                  <div style={{ position: "sticky", top: "20px", background: "var(--bg-secondary)", border: "1px solid var(--border-color)", borderRadius: "var(--border-radius-md)", padding: "15px", display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <AdZone position="SIDEBAR" />
                  </div>
                )}
              </div>
            );
          })()}

          {/* Grid view of all signs below */}
          <div style={{ marginTop: "50px", marginBottom: "20px" }}>
            <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1.6rem", color: "var(--text-primary)", marginBottom: "20px", textAlign: "center" }}>
              அனைத்து ராசிகளின் பலன்கள்
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "20px" }}>
              {RASI_SIGNS.map((sign) => {
                const pred = getPredictionForSign(sign.key);
                return (
                  <div 
                    key={sign.key}
                    onClick={() => {
                      setSelectedSign(sign.key);
                      window.scrollTo({ top: 350, behavior: "smooth" });
                    }}
                    className="zodiac-grid-card"
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                      <div className="zodiac-grid-circle">
                        {ZODIAC_IMG(sign.key, "68%")}
                      </div>
                      <div>
                        <div style={{ fontWeight: "700", color: "var(--text-primary)" }}>{sign.name}</div>
                        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{sign.period}</div>
                      </div>
                    </div>
                    <p style={{ fontSize: "0.9rem", lineHeight: "1.6", color: "var(--text-secondary)", minHeight: "96px", overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 4, WebkitBoxOrient: "vertical" }}>
                      {pred || "விரைவில் சேர்க்கப்படும்..."}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default RasiPalanPage;

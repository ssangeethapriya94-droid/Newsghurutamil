import React, { useState, useEffect } from "react";
import API from "../config/api";
import useSEO from "../hooks/useSEO";
import AdZone from "../components/AdZone";
import { FaPlay } from "react-icons/fa";

const RASI_SIGNS = [
  { key: "aries", name: "Aries", period: "Mar 21 - Apr 19", color: "#e87830" },
  { key: "taurus", name: "Taurus", period: "Apr 20 - May 20", color: "#e87830" },
  { key: "gemini", name: "Gemini", period: "May 21 - Jun 20", color: "#e87830" },
  { key: "cancer", name: "Cancer", period: "Jun 21 - Jul 22", color: "#e87830" },
  { key: "leo", name: "Leo", period: "Jul 23 - Aug 22", color: "#e87830" },
  { key: "virgo", name: "Virgo", period: "Aug 23 - Sep 22", color: "#e87830" },
  { key: "libra", name: "Libra", period: "Sep 23 - Oct 22", color: "#e87830" },
  { key: "scorpio", name: "Scorpio", period: "Oct 23 - Nov 21", color: "#e87830" },
  { key: "sagittarius", name: "Sagittarius", period: "Nov 22 - Dec 21", color: "#e87830" },
  { key: "capricorn", name: "Capricorn", period: "Dec 22 - Jan 19", color: "#e87830" },
  { key: "aquarius", name: "Aquarius", period: "Jan 20 - Feb 18", color: "#e87830" },
  { key: "pisces", name: "Pisces", period: "Feb 19 - Mar 20", color: "#e87830" }
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


function HoroscopePage() {
  useSEO({
    title: "Today's Horoscope | Weekly & Monthly Horoscope - NewsGhuru",
    description: "Read daily horoscope, weekly predictions, and monthly zodiac forecasts accurately.",
    keywords: "horoscope, astrology, daily horoscope, weekly horoscope, zodiac signs, NewsGhuru spiritual",
  });

  const [activeTab, setActiveTab] = useState("day"); // day, week, month
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [rasiRecord, setRasiRecord] = useState(null);
  const [allRecords, setAllRecords] = useState([]);
  const [selectedSign, setSelectedSign] = useState(RASI_SIGNS[0].key);
  const [loading, setLoading] = useState(false);
  const [spiritualVideos, setSpiritualVideos] = useState([]);
  const [playingVideoId, setPlayingVideoId] = useState(null);

  // Fetch available ranges for week/month
  useEffect(() => {
    const fetchAllRanges = async () => {
      try {
        const res = await API.get(`/api/anmigam/rasi-palan?language=en&periodType=${activeTab}`);
        setAllRecords(res.data || []);
        if (res.data && res.data.length > 0) {
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
      setSelectedDate(new Date().toISOString().split("T")[0]);
    } else {
      fetchAllRanges();
    }
  }, [activeTab]);

  // Fetch the record based on date & period
  useEffect(() => {
    const fetchActiveRecord = async () => {
      try {
        setLoading(true);
        const res = await API.get(`/api/anmigam/rasi-palan/latest?language=en&periodType=${activeTab}&date=${selectedDate}`);
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

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const res = await API.get("/api/videos?category=jothidam&language=en");
        setSpiritualVideos(res.data || []);
      } catch (err) {
        console.error("Error loading spiritual videos:", err);
      }
    };
    fetchVideos();
  }, []);

  const getPredictionForSign = (key) => {
    if (!rasiRecord || !rasiRecord.predictions) return "";
    const p = rasiRecord.predictions.find(item => item.rasiKey === key);
    return p ? p.description : "";
  };

  const formatDateText = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" });
  };

  const getPeriodText = () => {
    if (!rasiRecord) return "";
    if (rasiRecord.periodType === "day") {
      return `${formatDateText(rasiRecord.date)} (${rasiRecord.dayName || ""})`;
    }
    return `${formatDateText(rasiRecord.date)} to ${formatDateText(rasiRecord.endDate)}`;
  };

  return (
    <div className="spiritual-page-container" style={{ padding: "40px 5% 80px", maxWidth: "1200px", margin: "0 auto", minHeight: "80vh" }}>
      <AdZone position="TOP_BANNER" />
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

        /* Detail Section Grid */
        .zodiac-detail-section {
          display: grid;
          grid-template-columns: 1fr 300px;
          gap: 30px;
          align-items: start;
        }
        .zodiac-detail-section.premium {
          grid-template-columns: 1fr;
        }
        @media (max-width: 768px) {
          .zodiac-detail-section {
            grid-template-columns: 1fr !important;
            gap: 20px;
          }
        }
        
        /* Tabs Scrollability */
        .spiritual-tabs {
          display: flex;
          justify-content: center;
          border-bottom: 2px solid var(--border-color);
          margin-bottom: 25px;
          gap: 20px;
          overflow-x: auto;
          scrollbar-width: none;
          -ms-overflow-style: none;
          white-space: nowrap;
        }
        .spiritual-tabs::-webkit-scrollbar {
          display: none;
        }
        @media (max-width: 600px) {
          .spiritual-tabs {
            justify-content: flex-start !important;
            padding: 0 5px;
            gap: 10px;
          }
          .spiritual-tabs button {
            padding: 10px 14px !important;
            font-size: 0.95rem !important;
            flex-shrink: 0;
          }
        }

        /* Redesigned Large Video Layout (At the top of the page) */
        .spiritual-video-section-large {
          max-width: 800px;
          margin: 10px auto 40px;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 30px;
        }
        
        .spiritual-featured-video-container {
          width: 100%;
          margin-bottom: 24px;
          background: var(--bg-secondary);
          border-radius: 20px;
          overflow: hidden;
          border: 1px solid var(--border-color);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .spiritual-featured-video-container:hover {
          transform: translateY(-4px);
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
        }
        
        .spiritual-featured-video-player {
          position: relative;
          padding-bottom: 56.25%;
          height: 0;
          overflow: hidden;
          background-color: #000;
        }
        
        .spiritual-featured-video-player iframe {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border: none;
        }
        
        .spiritual-featured-video-info {
          padding: 24px;
        }
        
        .spiritual-featured-video-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: linear-gradient(90deg, #ef4444, #f97316);
          color: #ffffff;
          font-size: 0.8rem;
          font-weight: 700;
          padding: 4px 12px;
          border-radius: 20px;
          margin-bottom: 12px;
        }
        
        .spiritual-featured-video-title {
          font-size: 1.6rem;
          font-weight: 800;
          line-height: 1.4;
          margin: 0 0 10px 0;
          color: var(--text-primary);
        }
        
        .spiritual-featured-video-time {
          font-size: 0.9rem;
          color: #64748b;
        }
        
        /* Grid of other videos */
        .spiritual-video-grid-large {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 24px;
        }
        
        @media (max-width: 768px) {
          .spiritual-video-grid-large {
            grid-template-columns: 1fr;
          }
          .spiritual-featured-video-title {
            font-size: 1.3rem;
          }
        }
        
        .spiritual-video-card-large {
          display: flex;
          flex-direction: column;
          background: var(--bg-secondary);
          border-radius: 16px;
          overflow: hidden;
          border: 1px solid var(--border-color);
          transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
        }
        
        .spiritual-video-card-large:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.08);
          border-color: #f97316;
        }
        
        .spiritual-video-wrapper-large {
          position: relative;
          padding-bottom: 56.25%;
          height: 0;
          overflow: hidden;
          background-color: #000;
        }
        
        .spiritual-video-wrapper-large iframe {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border: none;
        }
        
        .spiritual-video-body-large {
          padding: 18px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          flex-grow: 1;
        }
        
        .spiritual-video-title-large {
          font-size: 1.1rem;
          font-weight: 700;
          margin: 0;
          line-height: 1.4;
          color: var(--text-primary);
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          height: 2.8em;
        }
        
        .spiritual-video-time-large {
          font-size: 0.85rem;
          color: #64748b;
        }
        
        /* Lazy loading elements */
        .spiritual-video-placeholder-large {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          cursor: pointer;
          overflow: hidden;
          background-color: #000;
          display: block;
        }
        
        .spiritual-video-placeholder-large img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }
        
        .spiritual-video-placeholder-large:hover img {
          transform: scale(1.05);
        }
        
        .spiritual-play-overlay-large {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.3s ease;
        }
        
        .spiritual-video-placeholder-large:hover .spiritual-play-overlay-large {
          background: rgba(0, 0, 0, 0.35);
        }
        
        .spiritual-play-btn-large {
          width: 68px;
          height: 68px;
          background: linear-gradient(135deg, #ef4444, #f97316);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          font-size: 1.5rem;
          box-shadow: 0 8px 24px rgba(239, 68, 68, 0.4);
          transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.3s ease;
          padding-left: 4px;
        }
        
        .spiritual-video-placeholder-large:hover .spiritual-play-btn-large {
          transform: scale(1.12);
          box-shadow: 0 12px 28px rgba(239, 68, 68, 0.6);
        }
        
        .spiritual-play-btn-small-large {
          width: 52px;
          height: 52px;
          background: linear-gradient(135deg, #ef4444, #f97316);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          font-size: 1.15rem;
          box-shadow: 0 6px 16px rgba(239, 68, 68, 0.4);
          transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.3s ease;
          padding-left: 3px;
        }
        
        .spiritual-video-placeholder-large:hover .spiritual-play-btn-small-large {
          transform: scale(1.12);
          box-shadow: 0 10px 20px rgba(239, 68, 68, 0.6);
        }
      `}</style>
      


      {/* Title */}
      <div style={{ textAlign: "center", marginBottom: "30px" }}>
        <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "2.4rem", color: "var(--text-primary)", marginBottom: "8px" }}>
          Zodiac Horoscope
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "1.05rem" }}>
          Read your daily, weekly and monthly predictions instantly.
        </p>
      </div>



      {/* Tabs */}
      <div className="spiritual-tabs">
        <button 
          onClick={() => { setActiveTab("day"); }}
          style={{ padding: "12px 24px", background: "none", border: "none", color: activeTab === "day" ? "var(--accent-orange)" : "var(--text-secondary)", fontWeight: "700", fontSize: "1.1rem", borderBottom: activeTab === "day" ? "3px solid var(--accent-orange)" : "3px solid transparent", cursor: "pointer", transition: "all 0.2s" }}
        >
          Today's Horoscope
        </button>
        <button 
          onClick={() => { setActiveTab("week"); }}
          style={{ padding: "12px 24px", background: "none", border: "none", color: activeTab === "week" ? "var(--accent-orange)" : "var(--text-secondary)", fontWeight: "700", fontSize: "1.1rem", borderBottom: activeTab === "week" ? "3px solid var(--accent-orange)" : "3px solid transparent", cursor: "pointer", transition: "all 0.2s" }}
        >
          Weekly Horoscope
        </button>
        <button 
          onClick={() => { setActiveTab("month"); }}
          style={{ padding: "12px 24px", background: "none", border: "none", color: activeTab === "month" ? "var(--accent-orange)" : "var(--text-secondary)", fontWeight: "700", fontSize: "1.1rem", borderBottom: activeTab === "month" ? "3px solid var(--accent-orange)" : "3px solid transparent", cursor: "pointer", transition: "all 0.2s" }}
        >
          Monthly Horoscope
        </button>
      </div>

      {/* Date Select Dropdown */}
      {activeTab !== "day" && allRecords.length > 0 && (
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "25px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontWeight: "600", color: "var(--text-primary)" }}>Select Range:</span>
            <select 
              value={selectedDate} 
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{ padding: "8px 16px", borderRadius: "8px", border: "1px solid var(--border-color)", background: "var(--bg-secondary)", color: "var(--text-primary)", outline: "none", fontWeight: "600" }}
            >
              {allRecords.map((rec) => {
                const sDate = new Date(rec.date).toLocaleDateString("en-US", { day: "numeric", month: "short" });
                const eDate = rec.endDate ? " - " + new Date(rec.endDate).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" }) : "";
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
          <h3>Loading horoscope forecasts...</h3>
        </div>
      ) : !rasiRecord ? (
        <div className="glass-panel" style={{ padding: "60px 20px", textAlign: "center", borderRadius: "16px", border: "1px solid var(--border-color)", background: "var(--bg-secondary)" }}>
          <h3 style={{ color: "var(--text-secondary)", marginBottom: "10px" }}>No Forecasts Found 😔</h3>
          <p style={{ color: "var(--text-muted)" }}>Zodiac predictions for the selected date have not been published yet.</p>
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

          {/* Rasi Circular Icons Row - Real bubble icons style */}
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
              <div className={`zodiac-detail-section ${isPremium ? "premium" : ""}`}>
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
                        {activeTab === "day" ? "Daily Forecast" : activeTab === "week" ? "Weekly Forecast" : "Monthly Forecast"}
                      </div>
                    </div>
                  </div>

                  <p style={{ fontSize: "1.1rem", lineHeight: "1.8", color: "var(--text-primary)", whiteSpace: "pre-line" }}>
                    {predictionText || "Predictions for this zodiac sign have not been added yet."}
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
              All Zodiac Signs Forecasts
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
                      {pred || "Coming soon..."}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Spiritual Videos Section (At the bottom) */}
      {spiritualVideos.length > 0 && (
        <div className="spiritual-video-section-large" style={{ borderTop: "1px solid var(--border-color)", borderBottom: "none", paddingTop: "40px", marginTop: "50px" }}>
          
          {/* 1. Large Featured Video (Newest Upload) */}
          {(() => {
            const featuredVid = spiritualVideos[0];
            const videoId = featuredVid.youtubeVideoId || ((featuredVid.youtubeUrl || featuredVid.videoUrl || "").match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/)?.[2] || "");
            return (
              <div className="spiritual-featured-video-container">
                <div className="spiritual-featured-video-player">
                  {playingVideoId === featuredVid._id ? (
                    <iframe
                      src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1`}
                      title={featuredVid.title}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  ) : (
                    <div className="spiritual-video-placeholder-large" onClick={() => setPlayingVideoId(featuredVid._id)}>
                      <img src={featuredVid.thumbnail} alt={featuredVid.title} />
                      <div className="spiritual-play-overlay-large">
                        <div className="spiritual-play-btn-large">
                          <FaPlay />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="spiritual-featured-video-info">
                  <div className="spiritual-featured-video-badge">
                    🎥 Horoscope & Spiritual
                  </div>
                  <h2 className="spiritual-featured-video-title">{featuredVid.title}</h2>
                  <div className="spiritual-featured-video-time">
                    📅 {formatDateText(featuredVid.publishedAt || featuredVid.createdAt)}
                  </div>
                </div>
              </div>
            );
          })()}

          {/* 2. Grid of next videos */}
          {spiritualVideos.length > 1 && (
            <div className="spiritual-video-grid-large">
              {spiritualVideos.slice(1, 5).map((vid) => {
                const videoId = vid.youtubeVideoId || ((vid.youtubeUrl || vid.videoUrl || "").match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/)?.[2] || "");
                return (
                  <div key={vid._id} className="spiritual-video-card-large">
                    <div className="spiritual-video-wrapper-large">
                      {playingVideoId === vid._id ? (
                        <iframe
                          src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1`}
                          title={vid.title}
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        ></iframe>
                      ) : (
                        <div className="spiritual-video-placeholder-large" onClick={() => setPlayingVideoId(vid._id)}>
                          <img src={vid.thumbnail} alt={vid.title} />
                          <div className="spiritual-play-overlay-large">
                            <div className="spiritual-play-btn-small-large">
                              <FaPlay />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="spiritual-video-body-large">
                      <h3 className="spiritual-video-title-large">{vid.title}</h3>
                      <div className="spiritual-video-time-large">
                        📅 {formatDateText(vid.publishedAt || vid.createdAt)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

    </div>
  );
}

export default HoroscopePage;

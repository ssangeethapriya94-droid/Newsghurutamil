import React, { useState, useEffect } from "react";
import API from "../config/api";
import useSEO from "../hooks/useSEO";
import { FaShieldAlt } from "react-icons/fa";
import "../styles/InfoPages.css";

const Disclaimer = () => {
  const [content, setContent] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);
  const [loading, setLoading] = useState(true);

  useSEO({
    title: "மறுப்புரை",
    description: "நியூஸ் குரு வலைத்தளத்தின் பொறுப்புத் துறப்பு கொள்கை மற்றும் விதிமுறைகள்",
    keywords: "மறுப்புரை, பொறுப்புத் துறப்பு, நியூஸ் குரு",
  });

  useEffect(() => {
    const fetchDisclaimer = async () => {
      try {
        setLoading(true);
        const res = await API.get("/api/pages/disclaimer");
        if (res.data && res.data.success) {
          setContent(res.data.content || "");
          setLastUpdated(res.data.lastUpdated);
        }
      } catch (err) {
        console.error("Error fetching disclaimer:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDisclaimer();
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("ta-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="info-page">
      <div className="info-header">
        <h1>மறுப்புரை</h1>
        <p>நியூஸ் குரு வலைத்தளத்தின் பொறுப்புத் துறப்பு கொள்கை விவரங்கள்</p>
      </div>

      <div className="info-card">
        {loading ? (
          <div style={{ textAlign: "center", padding: "40px 0", color: "var(--text-secondary)" }}>
            மறுப்புரை விவரங்கள் ஏற்றப்படுகின்றன...
          </div>
        ) : (
          <>
            <div 
              className="disclaimer-rich-text"
              dangerouslySetInnerHTML={{ __html: content }} 
              style={{ color: "var(--text-secondary)", lineHeight: "1.8", fontSize: "16px" }}
            />
            {lastUpdated && (
              <div 
                style={{ 
                  marginTop: "40px", 
                  paddingTop: "20px", 
                  borderTop: "1px solid var(--border-color)", 
                  fontSize: "14px", 
                  color: "var(--text-muted)",
                  fontStyle: "italic",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px"
                }}
              >
                <FaShieldAlt style={{ color: "var(--accent-orange)" }} />
                <span>கடைசியாக புதுப்பிக்கப்பட்டது: {formatDate(lastUpdated)}</span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Disclaimer;

import React, { useState, useEffect } from "react";
import API from "../config/api";
import useSEO from "../hooks/useSEO";
import { FaInfoCircle } from "react-icons/fa";
import "../styles/InfoPages.css";

const AboutUs = () => {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  useSEO({
    title: "எங்களைப் பற்றி (About Us)",
    description: "நியூஸ் குரு தமிழ் செய்திகள் வலைத்தளத்தின் அறிமுகம் மற்றும் நோக்கம்.",
    keywords: "எங்களைப் பற்றி, about us, நியூஸ் குரு, newsghuru about, தமிழ் செய்திகள்",
  });

  useEffect(() => {
    const fetchAbout = async () => {
      try {
        setLoading(true);
        const res = await API.get("/api/pages/about");
        if (res.data && res.data.success) {
          setContent(res.data.content || "");
          setLastUpdated(res.data.lastUpdated);
        }
      } catch (err) {
        console.error("Error fetching about page:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAbout();
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
        <h1>எங்களைப் பற்றி (About Us)</h1>
        <p>நியூஸ் குரு செய்தித் தளம் குறித்த அறிமுகம் மற்றும் எங்கள் நோக்கம்</p>
      </div>

      <div className="info-card">
        {loading ? (
          <div style={{ textAlign: "center", padding: "40px 0", color: "var(--text-secondary)" }}>
            விவரங்கள் ஏற்றப்படுகின்றன...
          </div>
        ) : (
          <>
            <div 
              className="about-rich-text"
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
                <FaInfoCircle style={{ color: "var(--accent-orange)" }} />
                <span>கடைசியாக புதுப்பிக்கப்பட்டது: {formatDate(lastUpdated)}</span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AboutUs;

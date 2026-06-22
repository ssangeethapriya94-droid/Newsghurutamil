import React, { useState, useEffect } from "react";
import API from "../config/api";
import useSEO from "../hooks/useSEO";
import { FaShieldAlt } from "react-icons/fa";
import "../styles/InfoPages.css";

const Terms = () => {
  const [content, setContent] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);
  const [loading, setLoading] = useState(true);

  useSEO({
    title: "விதிமுறைகள் மற்றும் நிபந்தனைகள் (Terms & Conditions)",
    description: "நியூஸ் குரு சேவைகளைப் பயன்படுத்துவதற்கான விதிகள் மற்றும் விதிமுறைகள்",
    keywords: "விதிமுறைகள், நிபந்தனைகள், terms and conditions, நியூஸ் குரு, newsghuru terms",
  });

  useEffect(() => {
    const fetchTerms = async () => {
      try {
        setLoading(true);
        const res = await API.get("/api/pages/terms");
        if (res.data && res.data.success) {
          setContent(res.data.content || "");
          setLastUpdated(res.data.lastUpdated);
        }
      } catch (err) {
        console.error("Error fetching terms and conditions:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTerms();
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
        <h1>விதிமுறைகள் மற்றும் நிபந்தனைகள் (Terms & Conditions)</h1>
        <p>நியூஸ் குரு சேவைகளைப் பயன்படுத்துவதற்கான விதிகள்</p>
      </div>

      <div className="info-card">
        {loading ? (
          <div style={{ textAlign: "center", padding: "40px 0", color: "var(--text-secondary)" }}>
            விதிமுறைகள் மற்றும் நிபந்தனைகள் விவரங்கள் ஏற்றப்படுகின்றன...
          </div>
        ) : (
          <>
            <div 
              className="terms-rich-text"
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

export default Terms;

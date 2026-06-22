import React, { useState, useEffect } from "react";
import API from "../config/api";
import useSEO from "../hooks/useSEO";
import { FaShieldAlt } from "react-icons/fa";
import "../styles/InfoPages.css";

const Privacy = () => {
  const [content, setContent] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);
  const [loading, setLoading] = useState(true);

  useSEO({
    title: "Privacy Policy | Newsghuru",
    description: "Privacy policy details and terms of use for Newsghuru.",
    keywords: "privacy policy, privacy, newsghuru privacy, terms",
  });

  useEffect(() => {
    const fetchPrivacy = async () => {
      try {
        setLoading(true);
        const res = await API.get("/api/pages/privacy");
        if (res.data && res.data.success) {
          setContent(res.data.content || "");
          setLastUpdated(res.data.lastUpdated);
        }
      } catch (err) {
        console.error("Error fetching privacy policy:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPrivacy();
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="info-page">
      <div className="info-header">
        <h1>Privacy Policy</h1>
        <p>Privacy policy details and rules of Newsghuru portal</p>
      </div>

      <div className="info-card">
        {loading ? (
          <div style={{ textAlign: "center", padding: "40px 0", color: "var(--text-secondary)" }}>
            Loading privacy policy details...
          </div>
        ) : (
          <>
            <div 
              className="privacy-rich-text"
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
                <span>Last Updated: {formatDate(lastUpdated)}</span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Privacy;

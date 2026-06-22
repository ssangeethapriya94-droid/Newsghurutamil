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
    title: "About Us | Newsghuru",
    description: "Introduction and mission of Newsghuru news portal.",
    keywords: "about us, newsghuru, newsghuru about, english news",
  });

  useEffect(() => {
    const fetchAbout = async () => {
      try {
        setLoading(true);
        const res = await API.get("/api/pages/about?language=en");
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
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="info-page">
      <div className="info-header">
        <h1>About Us</h1>
        <p>Introduction and mission of Newsghuru news portal</p>
      </div>

      <div className="info-card">
        {loading ? (
          <div style={{ textAlign: "center", padding: "40px 0", color: "var(--text-secondary)" }}>
            Loading details...
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
                <span>Last Updated: {formatDate(lastUpdated)}</span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AboutUs;

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
    title: "Terms & Conditions | Newsghuru",
    description: "Terms and conditions for using Newsghuru services.",
    keywords: "terms, conditions, terms and conditions, newsghuru",
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
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="info-page">
      <div className="info-header">
        <h1>Terms & Conditions</h1>
        <p>Rules and regulations for using Newsghuru services</p>
      </div>

      <div className="info-card">
        {loading ? (
          <div style={{ textAlign: "center", padding: "40px 0", color: "var(--text-secondary)" }}>
            Loading terms and conditions details...
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
                <span>Last Updated: {formatDate(lastUpdated)}</span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Terms;

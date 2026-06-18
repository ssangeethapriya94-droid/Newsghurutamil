import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaBookmark, FaTrash, FaClock } from "react-icons/fa";
import RelativeTime from "../components/RelativeTime";
import useSEO from "../hooks/useSEO";

const Bookmarks = () => {
  const [savedArticles, setSavedArticles] = useState([]);
  const navigate = useNavigate();

  useSEO({
    title: "சேமித்த செய்திகள் | Bookmarks",
    description: "சேமிக்கப்பட்ட முக்கிய தமிழ் செய்திகள் மற்றும் தகவல்கள்",
  });

  useEffect(() => {
    const bookmarks = localStorage.getItem("newsBookmarks");
    if (bookmarks) {
      try {
        setSavedArticles(JSON.parse(bookmarks));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const removeBookmark = (id, e) => {
    e.stopPropagation();
    const updated = savedArticles.filter(item => item._id !== id);
    setSavedArticles(updated);
    localStorage.setItem("newsBookmarks", JSON.stringify(updated));
  };

  const clearAll = () => {
    if (window.confirm("அனைத்து சேமித்த செய்திகளையும் அழிக்க வேண்டுமா?")) {
      setSavedArticles([]);
      localStorage.removeItem("newsBookmarks");
    }
  };

  return (
    <div className="bookmarks-page" style={{ maxWidth: "1200px", margin: "30px auto", padding: "0 15px", minHeight: "60vh" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "2px solid var(--border-color)", paddingBottom: "15px", marginBottom: "30px" }}>
        <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "2rem", display: "flex", alignItems: "center", gap: "10px", margin: 0 }}>
          <FaBookmark style={{ color: "var(--accent-orange)" }} /> சேமித்த செய்திகள்
        </h1>
        {savedArticles.length > 0 && (
          <button 
            onClick={clearAll}
            style={{ padding: "8px 16px", background: "none", border: "1px solid var(--accent-red)", color: "var(--accent-red)", borderRadius: "var(--border-radius-sm)", fontWeight: "600", cursor: "pointer" }}
          >
            அனைத்தும் அழி
          </button>
        )}
      </div>

      {savedArticles.length === 0 ? (
        <div style={{ textAlign: "center", padding: "50px 20px" }}>
          <p style={{ fontSize: "1.1rem", color: "var(--text-muted)" }}>செய்திகள் எதுவும் சேமிக்கப்படவில்லை.</p>
          <button 
            onClick={() => navigate("/")}
            style={{ marginTop: "15px", background: "var(--brand-gradient)", color: "#fff", border: "none", padding: "10px 20px", borderRadius: "var(--border-radius-sm)", fontWeight: "600", cursor: "pointer" }}
          >
            முகப்புக்குச் செல்ல
          </button>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "20px" }}>
          {savedArticles.map((article) => (
            <div 
              key={article._id}
              className="premium-card"
              onClick={() => navigate(`/news/${article._id}`, { state: article })}
            >
              <div className="card-media-box" style={{ height: "180px" }}>
                <img src={article.image} alt={article.title} />
              </div>
              <div className="card-body-content">
                <h3 className="card-headline line-clamp-2" style={{ fontSize: "1.1rem" }}>
                  {article.titleTa || article.title}
                </h3>
                <div className="card-bottom-actions">
                  <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "6px" }}>
                    <FaClock />
                    <RelativeTime createdAt={article.createdAt} fallback={article.time} />
                  </span>
                  <button 
                    className="card-action-btn"
                    onClick={(e) => removeBookmark(article._id, e)}
                    title="நீக்கு"
                  >
                    <FaTrash style={{ color: "var(--accent-red)" }} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Bookmarks;

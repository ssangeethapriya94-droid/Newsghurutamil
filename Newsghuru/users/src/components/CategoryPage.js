import React, { useEffect, useState, useCallback } from "react";
import API from "../config/api";
import RelativeTime from "../components/RelativeTime";
import AdZone from "../components/AdZone";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { FaArrowRight, FaClock, FaFire } from "react-icons/fa";
import "../styles/CategoryPage.css";

// A generic, beautiful category page used by all section pages
const CategoryPage = ({
  categorySlug,   // e.g. "tamil", "sports", "health"
  title,          // Tamil title shown in header  e.g. "தமிழகம்"
  subtitle,       // subtitle sentence
  headerColor,    // CSS gradient string for the header accent bar
  icon,           // emoji icon shown in header
}) => {
  const navigate = useNavigate();
  const params = useParams();
  const [searchParams] = useSearchParams();

  // Allow passing category via URL param if used with GenericCategory
  const resolvedSlug = categorySlug || params.categoryName;

  const [news, setNews] = useState([]);
  const [latestNews, setLatestNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const selectedDate = (() => {
    const d = searchParams.get("date");
    if (d) { const dt = new Date(d); if (!isNaN(dt)) return dt; }
    return null;
  })();

  const filterByDate = useCallback((list) => {
    if (!selectedDate) return list;
    return list.filter((item) => {
      const d = new Date(item.createdAt || item.time);
      return (
        d.getFullYear() === selectedDate.getFullYear() &&
        d.getMonth() === selectedDate.getMonth() &&
        d.getDate() === selectedDate.getDate()
      );
    });
  }, [selectedDate]);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        setError("");
        const [catRes, latestRes] = await Promise.all([
          API.get(`/api/news/category/${resolvedSlug}`),
          API.get("/api/news").catch(() => ({ data: [] }))
        ]);
        setNews(catRes.data || []);
        setLatestNews((latestRes.data || []).slice(0, 8));
      } catch (err) {
        console.error("Category page fetch error:", err);
        setError("செய்திகளை ஏற்றுவதில் தோல்வி. மீண்டும் முயலவும்.");
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [resolvedSlug]);

  const filtered = filterByDate(news);

  const goToNews = (item) => navigate(`/news/${item._id}`, { state: item });

  if (loading) {
    return (
      <div className="cat-page-loading">
        <div className="cat-loading-spinner"></div>
        <p>செய்திகள் ஏற்றப்படுகின்றன...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="cat-page-error">
        <span>⚠️</span>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>மீண்டும் முயல்</button>
      </div>
    );
  }

  const featured = filtered[0];
  const secondRow = filtered.slice(1, 4);
  const restNews = filtered.slice(4);

  return (
    <div className="cat-page-wrapper">

      {/* ── HERO SECTION HEADER ── */}
      <div className="cat-hero-header" style={{ "--cat-color": headerColor || "linear-gradient(135deg, #ea580c, #f59e0b)" }}>
        <div className="cat-hero-accent"></div>
        <div className="cat-hero-content">
          <span className="cat-hero-icon">{icon || "📰"}</span>
          <div>
            <h1 className="cat-hero-title">{title || resolvedSlug}</h1>
            <p className="cat-hero-sub">{subtitle || `${title} குறித்த உடனடி செய்திகள் மற்றும் புதிய தகவல்கள்`}</p>
          </div>
        </div>
        <div className="cat-hero-stat">
          <FaFire className="stat-fire" /> {filtered.length} செய்திகள்
        </div>
      </div>

      <AdZone position="TOP_BANNER" />

      {filtered.length === 0 ? (
        <div className="cat-empty-state">
          <span>📭</span>
          <h3>இன்று {title} செய்திகள் இல்லை</h3>
          <p>புதிய செய்திகள் விரைவில் வரும்.</p>
        </div>
      ) : (
        <div className="cat-main-layout">

          {/* ── LEFT MAIN CONTENT ── */}
          <div className="cat-main-content">

            {/* FEATURED BIG STORY */}
            {featured && (
              <div className="cat-featured-card" onClick={() => goToNews(featured)}>
                <div className="cat-featured-img-wrap">
                  <img src={featured.image} alt={featured.titleTa || featured.title} className="cat-featured-img" />
                  <div className="cat-featured-overlay">
                    <span className="cat-badge">{title}</span>
                  </div>
                </div>
                <div className="cat-featured-body">
                  <h2 className="cat-featured-title">{featured.titleTa || featured.title}</h2>
                  <p className="cat-featured-desc">
                    {(featured.shortDescriptionTa || featured.description || "")
                      .replace(/<[^>]+>/g, "")
                      .replace(/&nbsp;/g, " ")
                      .slice(0, 180)}...
                  </p>
                  <div className="cat-featured-meta">
                    <FaClock className="meta-clock" />
                    <RelativeTime createdAt={featured.createdAt} fallback={featured.time} />
                    <span className="cat-read-more">மேலும் வாசிக்க <FaArrowRight /></span>
                  </div>
                </div>
              </div>
            )}

            <AdZone position="SECTION_BANNER" />

            {/* SECOND ROW - 3 CARDS */}
            {secondRow.length > 0 && (
              <div className="cat-row-three">
                {secondRow.map((item) => (
                  <div key={item._id} className="cat-mid-card" onClick={() => goToNews(item)}>
                    <div className="cat-mid-img-wrap">
                      <img src={item.image} alt={item.titleTa || item.title} className="cat-mid-img" />
                      <span className="cat-mini-badge">{title}</span>
                    </div>
                    <div className="cat-mid-body">
                      <h3 className="cat-mid-title">{item.titleTa || item.title}</h3>
                      <p className="cat-mid-desc">
                        {(item.shortDescriptionTa || item.description || "")
                          .replace(/<[^>]+>/g, "")
                          .replace(/&nbsp;/g, " ")
                          .slice(0, 90)}...
                      </p>
                      <div className="cat-mid-meta">
                        <FaClock size={11} />
                        <RelativeTime createdAt={item.createdAt} fallback={item.time} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* REST - LIST FORMAT */}
            {restNews.length > 0 && (
              <div className="cat-list-section">
                <h3 className="cat-list-heading">மேலும் செய்திகள்</h3>
                <div className="cat-list-grid">
                  {restNews.map((item) => (
                    <div key={item._id} className="cat-list-card" onClick={() => goToNews(item)}>
                      <img src={item.image} alt={item.titleTa || item.title} className="cat-list-img" />
                      <div className="cat-list-body">
                        <h4 className="cat-list-title">{item.titleTa || item.title}</h4>
                        <div className="cat-list-meta">
                          <FaClock size={11} />
                          <RelativeTime createdAt={item.createdAt} fallback={item.time} />
                        </div>
                      </div>
                      <FaArrowRight className="cat-list-arrow" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── RIGHT SIDEBAR ── */}
          <aside className="cat-sidebar">
            <AdZone position="SIDEBAR" />

            {/* LATEST NEWS SIDEBAR WIDGET */}
            <div className="cat-sidebar-widget">
              <div className="cat-widget-header">
                <FaFire className="widget-fire" />
                <h4>சமீபத்திய செய்திகள்</h4>
              </div>
              <div className="cat-widget-list">
                {latestNews.map((item, idx) => (
                  <div key={item._id} className="cat-widget-item" onClick={() => goToNews(item)}>
                    <span className="cat-widget-num">{String(idx + 1).padStart(2, "0")}</span>
                    <div className="cat-widget-info">
                      <p className="cat-widget-title">{item.titleTa || item.title}</p>
                      <span className="cat-widget-time">
                        <RelativeTime createdAt={item.createdAt} fallback={item.time} />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <AdZone position="SIDEBAR" />
          </aside>
        </div>
      )}
    </div>
  );
};

export default CategoryPage;

import React, { useEffect, useState, useCallback } from "react";
import API from "../config/api";
import RelativeTime from "../components/RelativeTime";
import AdZone from "../components/AdZone";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { 
  FaArrowRight, FaClock, FaFire, FaGlobe, FaFutbol, FaBriefcase, FaFilm, 
  FaGraduationCap, FaLandmark, FaMobileAlt, FaMapMarkerAlt, FaFlag, FaNewspaper 
} from "react-icons/fa";
import "../styles/CategoryPage.css";

const getProfessionalIcon = (iconStr, slug) => {
  switch (iconStr) {
    case "🏆":
      return <FaFutbol />;
    case "💼":
      return <FaBriefcase />;
    case "📚":
      return <FaGraduationCap />;
    case "🏛":
      return <FaLandmark />;
    case "🎬":
      return <FaFilm />;
    case "💻":
    case "📱":
      return <FaMobileAlt />;
    case "🏔":
    case "🗺":
      return <FaMapMarkerAlt />;
    case "🇮🇳":
    case "🚩":
      return <FaFlag />;
    case "🌍":
    case "🌎":
    case "🌏":
      return <FaGlobe />;
    default:
      const lowerSlug = slug?.toLowerCase() || "";
      if (lowerSlug.includes("sport")) return <FaFutbol />;
      if (lowerSlug.includes("business")) return <FaBriefcase />;
      if (lowerSlug.includes("education")) return <FaGraduationCap />;
      if (lowerSlug.includes("politics")) return <FaLandmark />;
      if (lowerSlug.includes("cinema")) return <FaFilm />;
      if (lowerSlug.includes("tech")) return <FaMobileAlt />;
      if (lowerSlug.includes("tamil")) return <FaMapMarkerAlt />;
      if (lowerSlug.includes("india")) return <FaFlag />;
      if (lowerSlug.includes("world")) return <FaGlobe />;
      return <FaNewspaper />;
  }
};

// A generic, beautiful category page used by all section pages
const CategoryPage = ({
  categorySlug,   // e.g. "tamil", "sports", "health"
  title,          // title shown in header  e.g. "Tamil Nadu"
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
        setError("Failed to load news. Please try again.");
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
        <p>Loading news...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="cat-page-error">
        <span>⚠️</span>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  const featured = filtered[0];
  const secondRow = filtered.slice(1, 4);
  const restNews = filtered.slice(4);

  return (
    <div className="cat-page-wrapper">

      {/* ── HERO SECTION HEADER ── */}
      <div className="cat-hero-header" style={{ "--cat-color": "var(--brand-gradient)" }}>
        <div className="cat-hero-accent"></div>
        <div className="cat-hero-content">
          <span className="cat-hero-icon">
            {getProfessionalIcon(icon, resolvedSlug)}
          </span>
          <div>
            <h1 className="cat-hero-title">{title || resolvedSlug}</h1>
            <p className="cat-hero-sub">{subtitle || `Read the latest updates and breaking news for ${title || resolvedSlug}`}</p>
          </div>
        </div>
        <div className="cat-hero-stat">
          <FaFire className="stat-fire" /> {filtered.length} articles
        </div>
      </div>

      <AdZone position="TOP_BANNER" />

      {filtered.length === 0 ? (
        <div className="cat-empty-state">
          <span>📭</span>
          <h3>No news in {title} today</h3>
          <p>New articles will be posted soon.</p>
        </div>
      ) : (
        <div className="cat-main-layout">

          {/* ── LEFT MAIN CONTENT ── */}
          <div className="cat-main-content">

            {/* FEATURED BIG STORY */}
            {featured && (
              <div className="cat-featured-card" onClick={() => goToNews(featured)}>
                <div className="cat-featured-img-wrap">
                  <img src={featured.image} alt={featured.title} className="cat-featured-img" />
                  <div className="cat-featured-overlay">
                    <span className="cat-badge">{title}</span>
                  </div>
                </div>
                <div className="cat-featured-body">
                  <h2 className="cat-featured-title">{featured.title}</h2>
                  <p className="cat-featured-desc">
                    {(featured.description || "")
                      .replace(/<[^>]+>/g, "")
                      .replace(/&nbsp;/g, " ")
                      .slice(0, 180)}...
                  </p>
                  <div className="cat-featured-meta">
                    <FaClock className="meta-clock" />
                    <RelativeTime createdAt={featured.createdAt} fallback={featured.time} />
                    <span className="cat-read-more">Read More <FaArrowRight /></span>
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
                      <img src={item.image} alt={item.title} className="cat-mid-img" />
                      <span className="cat-mini-badge">{title}</span>
                    </div>
                    <div className="cat-mid-body">
                      <h3 className="cat-mid-title">{item.title}</h3>
                      <p className="cat-mid-desc">
                        {(item.description || "")
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
                <h3 className="cat-list-heading">More News</h3>
                <div className="cat-list-grid">
                  {restNews.map((item) => (
                    <div key={item._id} className="cat-list-card" onClick={() => goToNews(item)}>
                      <img src={item.image} alt={item.title} className="cat-list-img" />
                      <div className="cat-list-body">
                        <h4 className="cat-list-title">{item.title}</h4>
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
                <h4>Latest News</h4>
              </div>
              <div className="cat-widget-list">
                {latestNews.map((item, idx) => (
                  <div key={item._id} className="cat-widget-item" onClick={() => goToNews(item)}>
                    <span className="cat-widget-num">{String(idx + 1).padStart(2, "0")}</span>
                    <div className="cat-widget-info">
                      <p className="cat-widget-title">{item.title}</p>
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

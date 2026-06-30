import React, { useEffect, useState, useCallback } from "react";
import API from "../config/api";
import RelativeTime from "../components/RelativeTime";
import AdZone from "../components/AdZone";
import YouTubeFacade from "../components/YouTubeFacade";
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
  const [videos, setVideos] = useState([]);
  const [activeVideo, setActiveVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sponsoredNews, setSponsoredNews] = useState([]);

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
        const [catRes, latestRes, videosRes, sponsoredRes] = await Promise.all([
          API.get(`/api/news/category/${resolvedSlug}`),
          API.get("/api/news").catch(() => ({ data: [] })),
          API.get(`/api/videos?category=${resolvedSlug}`).catch(() => ({ data: [] })),
          API.get("/api/sponsored/published").catch(() => ({ data: { articles: [] } }))
        ]);
        setNews(catRes.data || []);
        setLatestNews((latestRes.data || []).slice(0, 8));
        const fetchedVideos = (videosRes.data || []).slice(0, 10);
        setVideos(fetchedVideos);
        if (fetchedVideos.length > 0) {
          setActiveVideo(fetchedVideos[0]);
        }

        // Filter sponsored articles by category target
        const catSponsored = (sponsoredRes.data?.articles || []).filter(
          a => a.placement === "category_sponsored" && a.category?.toLowerCase() === resolvedSlug?.toLowerCase()
        );
        setSponsoredNews(catSponsored);
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

            {/* ── DHINAMALAR STYLE VIDEOS SECTION ── */}
            {videos.length > 0 && activeVideo && (
              <div className="cat-video-gallery-section" style={{ marginBottom: "40px" }}>
                <div className="cat-video-layout" style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
                  
                  {/* Left Main Player */}
                  <div className="cat-video-main-player" style={{ flex: "2 1 450px", minWidth: "300px", display: "flex", flexDirection: "column" }}>
                  {/* Active video player — facade loads iframe only on click */}
                  <YouTubeFacade
                    videoId={activeVideo.youtubeVideoId || (activeVideo.youtubeUrl ? (activeVideo.youtubeUrl.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/)?.[2] || "") : "")}
                    title={activeVideo.title}
                    autoplay={true}
                    style={{ borderRadius: "12px", boxShadow: "0 4px 15px rgba(0,0,0,0.15)" }}
                  />
                    <h4 style={{ 
                      fontSize: "1.15rem", 
                      fontWeight: "700", 
                      marginTop: "12px", 
                      marginBottom: "4px", 
                      color: "var(--text-primary)",
                      fontFamily: "inherit",
                      lineHeight: "1.4"
                    }}>
                      {activeVideo.title}
                    </h4>
                  </div>

                  {/* Right Related Videos List */}
                  <div className="cat-video-sidebar" style={{ flex: "1 1 250px", minWidth: "250px", display: "flex", flexDirection: "column", gap: "12px", maxHeight: "420px", overflowY: "auto", paddingRight: "5px", scrollbarWidth: "thin" }}>
                    <h5 style={{ fontSize: "0.95rem", fontWeight: "700", margin: "0 0 5px 0", color: "var(--text-primary)", borderBottom: "2px solid var(--accent-color, #ea580c)", paddingBottom: "6px" }}>
                      Related Videos
                    </h5>
                    {videos.map((vid) => {
                      const isActive = vid._id === activeVideo._id;
                      return (
                        <div 
                          key={vid._id}
                          onClick={() => setActiveVideo(vid)}
                          style={{ 
                            display: "flex", 
                            gap: "10px", 
                            cursor: "pointer", 
                            padding: "6px", 
                            borderRadius: "8px", 
                            background: isActive ? "var(--bg-secondary, rgba(0,0,0,0.05))" : "transparent",
                            border: isActive ? "1px solid var(--border-color)" : "1px solid transparent",
                            transition: "background 0.2s"
                          }}
                          onMouseEnter={(e) => { if(!isActive) e.currentTarget.style.background = "var(--bg-secondary, rgba(0,0,0,0.02))"; }}
                          onMouseLeave={(e) => { if(!isActive) e.currentTarget.style.background = "transparent"; }}
                        >
                          <div style={{ position: "relative", width: "90px", height: "55px", flexShrink: 0, borderRadius: "6px", overflow: "hidden", backgroundColor: "#000" }}>
                            <img src={vid.thumbnail} alt={vid.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                              <span style={{ backgroundColor: "rgba(0,0,0,0.7)", color: "white", width: "20px", height: "20px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "8px" }}>▶</span>
                            </div>
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                            <h6 style={{ 
                              fontSize: "0.8rem", 
                              fontWeight: isActive ? "700" : "500", 
                              margin: 0, 
                              color: isActive ? "var(--accent-color, #ea580c)" : "var(--text-primary)",
                              display: "-webkit-box", 
                              WebkitLineClamp: 2, 
                              WebkitBoxOrient: "vertical", 
                              overflow: "hidden", 
                              lineHeight: "1.3" 
                            }}>
                              {vid.title}
                            </h6>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                </div>
              </div>
            )}

            {/* SPONSORED CATEGORY FEATURES AT THE VERY TOP */}
            {sponsoredNews && sponsoredNews.length > 0 && (
              <div className="cat-sponsored-row-section" style={{ marginBottom: "30px", padding: "16px", borderRadius: "14px", background: "rgba(234,88,12,0.04)", border: "1.5px solid rgba(234,88,12,0.18)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                  <h3 style={{ fontSize: "1.05rem", fontWeight: "800", color: "var(--accent-orange, #ea580c)", margin: 0, textTransform: "uppercase", letterSpacing: "0.5px", display: "flex", alignItems: "center", gap: "6px" }}>
                    🌟 Featured Partner Content
                  </h3>
                  <span style={{ background: "var(--accent-orange, #ea580c)", color: "#fff", padding: "3px 10px", borderRadius: "20px", fontSize: "0.68rem", fontWeight: "800", textTransform: "uppercase" }}>Sponsored</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
                  {sponsoredNews.map((art) => (
                    <div
                      key={art._id}
                      onClick={() => navigate(`/sponsored/${art._id}`)}
                      style={{ cursor: "pointer", display: "flex", gap: "12px", background: "var(--bg-secondary)", borderRadius: "10px", padding: "12px", border: "1px solid var(--border-color)", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}
                    >
                      {art.image && (
                        <img src={art.image} alt={art.title} style={{ width: "90px", height: "80px", borderRadius: "8px", objectFit: "cover" }} />
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: "0.72rem", fontWeight: "800", color: "var(--accent-orange, #ea580c)", textTransform: "uppercase", marginBottom: "4px" }}>{art.companyName}</div>
                        <h4 style={{ fontSize: "0.88rem", fontWeight: "700", margin: "0 0 6px 0", lineHeight: "1.35", color: "var(--text-primary)", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{art.title}</h4>
                        <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontWeight: "600" }}>{art.sponsoredLabel || "Partner Link"}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

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

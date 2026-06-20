import React, { useEffect, useState } from "react";
import API from "../config/api";
import RelativeTime from "../components/RelativeTime";
import AdZone from "../components/AdZone";
import PopupAd from "../components/PopupAd";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FaBolt, FaFire, FaMapMarkedAlt, FaFlag, FaGlobe, FaFutbol, 
  FaBriefcase, FaFilm, FaGraduationCap, FaLandmark, FaHeart, 
  FaBookmark, FaShareAlt, FaPlay, FaImage, FaChevronRight, 
  FaStar, FaCloudSun, FaArrowUp, FaArrowDown, FaMobileAlt,
  FaRegLightbulb, FaTimes, FaChevronLeft, FaTimesCircle
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import useSEO from "../hooks/useSEO";
import "../styles/Home.css";

const stripHtml = (html) => {
  if (!html) return "";
  const doc = new DOMParser().parseFromString(html, "text/html");
  return doc.body.textContent || "";
};

const getReadingTime = (text) => {
  const words = stripHtml(text).split(/\s+/).length;
  const time = Math.max(1, Math.ceil(words / 150));
  return `${time} நிமிடம்`;
};

const Home = () => {
  const navigate = useNavigate();

  const token = localStorage.getItem("readerToken");
  let readerData = null;
  try {
    const dataStr = localStorage.getItem("readerData");
    if (dataStr) readerData = JSON.parse(dataStr);
  } catch (e) {}

  useSEO({
    title: "நியூஸ் குரு | தமிழ் செய்திகள்",
    description: "தமிழகம், இந்தியா மற்றும் உலக அளவிலான உடனடி மற்றும் நம்பகமான தமிழ் செய்திகள் - நியூஸ் குரு",
    keywords: "முகப்பு செய்தி, தமிழ் செய்திகள், தமிழக செய்திகள், பிரேக்கிங் நியூஸ், நியூஸ் குரு",
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth >= 1024);

  // Published News Lists
  const [breakingNews, setBreakingNews] = useState([]);
  const [tamilNews, setTamilNews] = useState([]);
  const [indiaNews, setIndiaNews] = useState([]);
  const [worldNews, setWorldNews] = useState([]);
  const [sportsNews, setSportsNews] = useState([]);
  const [politicsNews, setPoliticsNews] = useState([]);
  const [businessNews, setBusinessNews] = useState([]);
  const [educationNews, setEducationNews] = useState([]);
  const [cinemaNews, setCinemaNews] = useState([]);
  const [techNews, setTechNews] = useState([]);
  const [allNews, setAllNews] = useState([]);

  // Premium CMS lists & configs
  const [homepageConfig, setHomepageConfig] = useState(null);
  const [videos, setVideos] = useState([]);
  const [shorts, setShorts] = useState([]);
  const [photoStories, setPhotoStories] = useState([]);

  // Interactive page states
  const [activeVideoUrl, setActiveVideoUrl] = useState("");
  const [activeVideoTitle, setActiveVideoTitle] = useState("");
  const [activeShort, setActiveShort] = useState(null);
  const [activePhotoStory, setActivePhotoStory] = useState(null);
  const [photoStoryIndex, setPhotoStoryIndex] = useState(0);
  const [visibleFeedCount, setVisibleFeedCount] = useState(6);
  const [likedArticles, setLikedArticles] = useState({});
  const [bookmarkedArticles, setBookmarkedArticles] = useState({});
  const [activePollVote, setActivePollVote] = useState(null);
  const [activeScoreTab, setActiveScoreTab] = useState("match1");

  useEffect(() => {
    const handleResize = () => setIsLargeScreen(window.innerWidth >= 1024);
    window.addEventListener("resize", handleResize);
    
    // Load local likes/bookmarks states
    const savedBookmarks = localStorage.getItem("newsBookmarks");
    if (savedBookmarks) {
      try {
        const parsed = JSON.parse(savedBookmarks);
        const map = {};
        parsed.forEach(item => { map[item._id] = true; });
        setBookmarkedArticles(map);
      } catch (e) { console.error(e); }
    }
    
    const savedLikes = localStorage.getItem("newsLikes");
    if (savedLikes) {
      try {
        setLikedArticles(JSON.parse(savedLikes));
      } catch (e) { console.error(e); }
    }

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const categoryTamilMap = {
    breaking: "முக்கிய செய்திகள்",
    tamil: "தமிழகம்",
    india: "இந்தியா",
    world: "உலகம்",
    business: "வணிகம்",
    sports: "விளையாட்டு",
    education: "கல்வி",
    politics: "அரசியல்",
    cinema: "சினிமா",
    technology: "தொழில்நுட்பம்",
    tech: "தொழில்நுட்பம்",
  };

  const getCategoryLabel = (category) =>
    categoryTamilMap[category?.toLowerCase()] || category;

  const fetchAll = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      setError("");

      // Parallel data fetching
      const [newsRes, configRes, videosRes, shortsRes, photosRes] = await Promise.all([
        API.get("/api/news/published"),
        API.get("/api/homepage-config"),
        API.get("/api/videos"),
        API.get("/api/shorts"),
        API.get("/api/photo-stories")
      ]);

      const allPublished = newsRes.data || [];
      setAllNews(allPublished);

      const filterCat = (cat) => allPublished.filter(n => n.category && n.category.trim().toLowerCase() === cat);

      setBreakingNews(filterCat("breaking"));
      setTamilNews(filterCat("tamil"));
      setWorldNews(filterCat("world"));
      setIndiaNews(filterCat("india"));
      setSportsNews(filterCat("sports"));
      setPoliticsNews(filterCat("politics"));
      setBusinessNews(filterCat("business"));
      setEducationNews(filterCat("education"));
      setCinemaNews(filterCat("cinema"));
      setTechNews(filterCat("tech").concat(filterCat("technology")));

      // Set dynamic dashboard layouts
      const configData = configRes.data || {};
      setHomepageConfig(configData);
      setVideos(videosRes.data || []);
      setShorts((shortsRes.data || []).filter(s => s.isEnabled));
      setPhotoStories(photosRes.data || []);

      // Initialize active video player
      const featuredVideo = configData.featuredVideos?.[0] || videosRes.data?.[0];
      if (featuredVideo) {
        setActiveVideoUrl(featuredVideo.youtubeUrl);
        setActiveVideoTitle(featuredVideo.title);
      }

    } catch (err) {
      console.error("Home API Error:", err);
      if (showLoading) setError("செய்திகளை ஏற்றுவதில் தோல்வி");
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  // Filter by Date engine
  const getSelectedDate = () => {
    const params = new URLSearchParams(window.location.search);
    const dateParam = params.get("date");
    if (dateParam) {
      const d = new Date(dateParam);
      if (!isNaN(d.getTime())) return d;
    }
    return null;
  };

  const filterByDate = (list, selectedDate) => {
    if (!selectedDate) return list;
    return list.filter((item) => {
      const itemDate = new Date(item.createdAt || item.time);
      return (
        itemDate.getFullYear() === selectedDate.getFullYear() &&
        itemDate.getMonth() === selectedDate.getMonth() &&
        itemDate.getDate() === selectedDate.getDate()
      );
    });
  };

  const selectedDate = getSelectedDate();

  const filteredBreaking = filterByDate(breakingNews, selectedDate);
  const filteredTamil = filterByDate(tamilNews, selectedDate);
  const filteredWorld = filterByDate(worldNews, selectedDate);
  const filteredIndia = filterByDate(indiaNews, selectedDate);
  const filteredSports = filterByDate(sportsNews, selectedDate);
  const filteredPolitics = filterByDate(politicsNews, selectedDate);
  const filteredBusiness = filterByDate(businessNews, selectedDate);
  const filteredEducation = filterByDate(educationNews, selectedDate);
  const filteredCinema = filterByDate(cinemaNews, selectedDate);
  const filteredTech = filterByDate(techNews, selectedDate);
  const filteredAll = filterByDate(allNews, selectedDate);

  // Fallbacks to keep layouts fully populated with news
  const getStoriesOrFallback = (list, count = 4) => {
    if (list && list.length > 0) return list.slice(0, count);
    return filteredAll.slice(0, count);
  };

  // Actions
  const handleLike = (article, e) => {
    e.stopPropagation();
    const id = article._id;
    const isLiked = likedArticles[id];
    const newLikes = { ...likedArticles, [id]: !isLiked };
    setLikedArticles(newLikes);
    localStorage.setItem("newsLikes", JSON.stringify(newLikes));
  };

  const handleBookmark = (article, e) => {
    e.stopPropagation();
    const id = article._id;
    const isBookmarked = bookmarkedArticles[id];
    const newBookmarks = { ...bookmarkedArticles, [id]: !isBookmarked };
    setBookmarkedArticles(newBookmarks);
    
    let currentBookmarks = [];
    const saved = localStorage.getItem("newsBookmarks");
    if (saved) {
      try { currentBookmarks = JSON.parse(saved); } catch(e){}
    }
    
    if (isBookmarked) {
      currentBookmarks = currentBookmarks.filter(item => item._id !== id);
    } else {
      currentBookmarks.push(article);
    }
    localStorage.setItem("newsBookmarks", JSON.stringify(currentBookmarks));
  };

  const handleShare = (article, e) => {
    e.stopPropagation();
    const url = `${window.location.origin}/news/${article._id}`;
    if (navigator.share) {
      navigator.share({
        title: article.titleTa || article.title,
        url: url
      }).catch(err => console.log(err));
    } else {
      navigator.clipboard.writeText(url);
      alert("செய்தி இணைப்பு நகலெடுக்கப்பட்டது (Link copied to clipboard!)");
    }
  };

  // Default Sections Visibilities & Ordering
  const DEFAULT_SECTIONS = [
    { id: "breaking", titleTa: "முக்கிய செய்திகள்", titleEn: "Breaking News", isEnabled: true, order: 1 },
    { id: "hero", titleTa: "தலைப்புச் செய்திகள்", titleEn: "Top Stories", isEnabled: true, order: 2 },
    { id: "latest", titleTa: "சமீபத்திய செய்திகள்", titleEn: "Latest News", isEnabled: true, order: 3 },
    { id: "politics", titleTa: "அரசியல்", titleEn: "Politics", isEnabled: true, order: 4 },
    { id: "cinema", titleTa: "சினிமா", titleEn: "Cinema", isEnabled: true, order: 5 },
    { id: "sports", titleTa: "விளையாட்டு", titleEn: "Sports", isEnabled: true, order: 6 },
    { id: "tech", titleTa: "தொழில்நுட்பம்", titleEn: "Technology", isEnabled: true, order: 7 },
    { id: "business", titleTa: "வணிகம் & வர்த்தகம்", titleEn: "Business & Markets", isEnabled: true, order: 8 },
    { id: "videos", titleTa: "வீடியோக்கள்", titleEn: "Video News", isEnabled: true, order: 9 },
    { id: "shorts", titleTa: "சார்ட்ஸ்", titleEn: "Shorts Reels", isEnabled: true, order: 10 },
    { id: "photos", titleTa: "புகைப்படக் கதைகள்", titleEn: "Photo Stories", isEnabled: true, order: 11 },
    { id: "editors", titleTa: "ஆசிரியர் தேர்வு", titleEn: "Editor's Picks", isEnabled: true, order: 12 }
  ];

  const activeSections = homepageConfig?.sections
    ? [...homepageConfig.sections].filter(s => s.isEnabled).sort((a, b) => a.order - b.order)
    : DEFAULT_SECTIONS;

  // Resolved dynamic configurations
  const resolvedHeroStory = homepageConfig?.heroStory || filteredBreaking[0] || filteredAll[0];
  
  const resolvedSecondaryStories = getStoriesOrFallback(
    filteredBreaking.filter(n => n._id !== resolvedHeroStory?._id), 
    4
  );

  const resolvedTrendingStories = homepageConfig?.trendingStories && homepageConfig.trendingStories.length > 0
    ? homepageConfig.trendingStories
    : filteredAll.slice(0, 5);

  const resolvedEditorPicks = homepageConfig?.editorPicks && homepageConfig.editorPicks.length > 0
    ? homepageConfig.editorPicks
    : filteredAll.slice(1, 4);

  const resolvedFeaturedVideos = homepageConfig?.featuredVideos && homepageConfig.featuredVideos.length > 0
    ? homepageConfig.featuredVideos
    : videos.slice(0, 4);

  const resolvedFeaturedShorts = (() => {
    const featured = (homepageConfig?.featuredShorts || []).filter(s => s && s.isEnabled);
    const featuredIds = new Set(featured.map(s => s._id.toString()));
    const remaining = shorts.filter(s => s && s._id && !featuredIds.has(s._id.toString()));
    return [...featured, ...remaining];
  })();

  // Standard News Card Component
  const renderNewsCard = (article) => {
    if (!article) return null;
    const isLiked = likedArticles[article._id];
    const isBookmarked = bookmarkedArticles[article._id];
    const viewCount = article.views && article.views !== "0" ? article.views : Math.floor(180 + (article.title.length * 6));

    return (
      <motion.div 
        key={article._id} 
        className="premium-card"
        onClick={() => navigate(`/news/${article._id}`, { state: article })}
        whileHover={{ y: -6, boxShadow: "0 12px 24px rgba(0,0,0,0.12)" }}
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
      >
        <div className="card-media-box" style={{ height: "195px", overflow: "hidden", position: "relative" }}>
          <img 
            src={article.image || article.coverImage} 
            alt={article.titleTa || article.title} 
            style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.5s ease" }}
            className="hover-zoom"
          />
          <div className="card-gradient-overlay"></div>
          <span className="card-cat-badge">{getCategoryLabel(article.category)}</span>
          <div className="card-info-overlay">
            <span>👁 {viewCount} வியூஸ்</span>
            <span>⏱ {getReadingTime(article.description)}</span>
          </div>
        </div>
        <div className="card-body-content">
          <div>
            <h3 className="card-headline line-clamp-2" style={{ fontSize: "1.05rem", fontWeight: "700" }}>
              {article.titleTa || article.title}
            </h3>
            <p className="card-excerpt line-clamp-2">
              {stripHtml(article.shortDescription || article.description).slice(0, 100)}...
            </p>
          </div>
          <div className="card-bottom-actions">
            <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", fontWeight: "600" }}>
              <RelativeTime createdAt={article.createdAt} fallback={article.time} />
            </span>
            <div style={{ display: "flex", gap: "8px" }}>
              <button className={`card-action-btn ${isLiked ? "active" : ""}`} onClick={(e) => handleLike(article, e)}>
                <FaHeart style={isLiked ? { color: "var(--accent-red)" } : {}} />
              </button>
              <button className={`card-action-btn ${isBookmarked ? "active" : ""}`} onClick={(e) => handleBookmark(article, e)}>
                <FaBookmark style={isBookmarked ? { color: "var(--accent-orange)" } : {}} />
              </button>
              <button className="card-action-btn" onClick={(e) => handleShare(article, e)}>
                <FaShareAlt />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  // Section Render Map
  const renderBreakingNewsBar = (titleTa) => {
    return null;
  };

  const renderHeroSection = () => {
    return (
      <div className="above-fold-container" style={{ display: "grid", gridTemplateColumns: isLargeScreen ? "1.2fr 0.8fr 0.8fr" : "1fr", gap: "24px", minHeight: "480px", marginBottom: "30px" }}>
        {/* Left column: Big Hero Card */}
        {resolvedHeroStory ? (
          <motion.div 
            className="premium-card hero-main-banner"
            onClick={() => navigate(`/news/${resolvedHeroStory._id}`, { state: resolvedHeroStory })}
            whileHover={{ scale: 1.005 }}
            transition={{ duration: 0.3 }}
            style={{ cursor: "pointer", position: "relative", borderRadius: "12px", overflow: "hidden", minHeight: "360px" }}
          >
            <div className="card-media-box" style={{ height: "100%", width: "100%" }}>
              <img 
                src={resolvedHeroStory.image || resolvedHeroStory.coverImage} 
                alt={resolvedHeroStory.titleTa || resolvedHeroStory.title} 
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
              <div className="card-gradient-overlay" style={{ height: "100%", position: "absolute", bottom: 0, left: 0, right: 0, background: "linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.4) 60%, rgba(0,0,0,0.1) 100%)", zIndex: 2 }}></div>
              <span className="card-cat-badge" style={{ top: "20px", left: "20px", zIndex: 3 }}>{getCategoryLabel(resolvedHeroStory.category)}</span>
              
              <div style={{ position: "absolute", bottom: "24px", left: "24px", right: "24px", zIndex: 10, color: "#fff" }}>
                <span style={{ fontSize: "0.82rem", background: "var(--accent-red)", padding: "4px 10px", borderRadius: "4px", fontWeight: "700", display: "inline-flex", alignItems: "center", gap: "6px", marginBottom: "12px", boxShadow: "0 2px 8px rgba(239, 68, 68, 0.4)" }}>
                  <FaBolt /> தலைப்புச் செய்தி
                </span>
                <h2 style={{ fontFamily: "var(--font-serif)", fontSize: isLargeScreen ? "2rem" : "1.5rem", fontWeight: "800", lineHeight: "1.25", marginBottom: "10px" }}>
                  {resolvedHeroStory.titleTa || resolvedHeroStory.title}
                </h2>
                <p style={{ fontSize: "0.95rem", opacity: "0.9", display: "-webkit-box", WebkitLineClamp: "2", WebkitBoxOrient: "vertical", overflow: "hidden", marginBottom: "12px" }}>
                  {stripHtml(resolvedHeroStory.shortDescription || resolvedHeroStory.description)}
                </p>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.82rem", opacity: "0.8" }}>
                  <span>⏱ {getReadingTime(resolvedHeroStory.description)}  •  <RelativeTime createdAt={resolvedHeroStory.createdAt} fallback={resolvedHeroStory.time} /></span>
                  <span>👁 {resolvedHeroStory.views || "1420"} வியூஸ்</span>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <div style={{ background: "var(--bg-hover)", borderRadius: "var(--border-radius-md)", height: "480px" }}></div>
        )}

        {/* Center column: Stack of 4 Secondary Stories */}
        <div className="above-fold-center secondary-stack" style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1.15rem", borderBottom: "2px solid var(--border-color)", paddingBottom: "8px", margin: 0, fontWeight: "800", color: "var(--accent-orange)" }}>
            முக்கியப் பதிவுகள்
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", overflowY: "auto", flex: 1, maxHeight: "420px" }}>
            {resolvedSecondaryStories.map(story => (
              <div 
                key={story._id}
                className="secondary-story-card"
                onClick={() => navigate(`/news/${story._id}`, { state: story })}
                style={{ display: "flex", gap: "12px", padding: "8px", borderRadius: "8px", border: "1px solid var(--border-color)", cursor: "pointer", background: "var(--bg-secondary)" }}
              >
                <img src={story.image} alt={story.title} className="sec-card-img" style={{ width: "80px", height: "65px", objectFit: "cover", borderRadius: "4px" }} />
                <div className="sec-card-info" style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                  <span style={{ fontSize: "0.72rem", color: "var(--accent-red)", fontWeight: "700", textTransform: "uppercase" }}>
                    {getCategoryLabel(story.category)}
                  </span>
                  <h4 className="sec-card-title" style={{ fontSize: "0.88rem", fontWeight: "700", margin: "4px 0 0 0", color: "var(--text-primary)", display: "-webkit-box", WebkitLineClamp: "2", WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                    {story.titleTa || story.title}
                  </h4>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right column: Widgets & Live Feeds */}
        <div className="above-fold-right right-widget-stack" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Trending Widget */}
          <div className="premium-widget" style={{ padding: "16px", borderRadius: "8px", border: "1px solid var(--border-color)", background: "var(--bg-secondary)" }}>
            <h3 className="widget-title-serif" style={{ fontSize: "1.05rem", fontWeight: "800", borderBottom: "2px solid var(--border-color)", paddingBottom: "8px", marginTop: 0, color: "var(--accent-orange)" }}>டிரெண்டிங் <span>🔥</span></h3>
            <div className="trending-list" style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "10px" }}>
              {resolvedTrendingStories.map((story, index) => (
                <div 
                  key={story._id}
                  className="trending-list-item"
                  onClick={() => navigate(`/news/${story._id}`, { state: story })}
                  style={{ display: "flex", gap: "12px", cursor: "pointer", alignItems: "center", borderBottom: index < resolvedTrendingStories.length - 1 ? "1px solid var(--border-color)" : "none", paddingBottom: "6px" }}
                >
                  <span className="trending-number" style={{ fontSize: "1.2rem", fontWeight: "900", color: "var(--accent-orange)" }}>0{index + 1}</span>
                  <span className="trending-text" style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--text-primary)", display: "-webkit-box", WebkitLineClamp: "2", WebkitBoxOrient: "vertical", overflow: "hidden" }}>{story.titleTa || story.title}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderLatestNewsSection = (titleTa) => {
    return (
      <div style={{ marginBottom: "40px" }}>
        <div className="section-headline-bar">
          <h2 className="section-title-premium">
            <FaRegLightbulb style={{ color: "var(--accent-orange)" }} /> {titleTa || "சமீபத்திய செய்திகள்"}
          </h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: isLargeScreen ? "repeat(2, 1fr)" : "1fr", gap: "20px" }}>
          {filteredAll.slice(0, visibleFeedCount).map(article => renderNewsCard(article))}
        </div>
        {visibleFeedCount < filteredAll.length && (
          <div style={{ textAlign: "center", marginTop: "25px" }}>
            <button 
              onClick={() => setVisibleFeedCount(prev => prev + 4)}
              style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-color)", color: "var(--text-primary)", padding: "10px 24px", borderRadius: "var(--border-radius-md)", fontWeight: "600", cursor: "pointer", transition: "all 0.2s" }}
            >
              மேலும் செய்திகளை ஏற்றுக
            </button>
          </div>
        )}
      </div>
    );
  };

  const renderPoliticsSection = (titleTa) => {
    const pStories = getStoriesOrFallback(filteredPolitics, 4);
    if (pStories.length === 0) return null;

    return (
      <div style={{ marginBottom: "40px", borderTop: "3px solid #dc2626", paddingTop: "15px" }}>
        <div className="section-headline-bar" style={{ border: "none", marginBottom: "15px" }}>
          <h2 className="section-title-premium" style={{ color: "#dc2626", fontSize: "1.4rem" }}>
            <FaLandmark style={{ color: "#dc2626" }} /> {titleTa || "அரசியல்"}
          </h2>
          <span className="section-see-all" onClick={() => navigate("/politics")} style={{ color: "#dc2626" }}>
            அனைத்தும் பார்க்க <FaChevronRight size={10} />
          </span>
        </div>

        {/* Thick headline feature story */}
        <div style={{ display: "grid", gridTemplateColumns: isLargeScreen ? "1.2fr 0.8fr" : "1fr", gap: "25px" }}>
          <div 
            style={{ cursor: "pointer", borderRight: isLargeScreen ? "1px solid var(--border-color)" : "none", paddingRight: isLargeScreen ? "20px" : "0" }}
            onClick={() => navigate(`/news/${pStories[0]._id}`, { state: pStories[0] })}
          >
            <img src={pStories[0].image} alt="politics" style={{ width: "100%", height: "230px", objectFit: "cover", borderRadius: "6px" }} />
            <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1.25rem", fontWeight: "800", margin: "12px 0 8px 0", color: "var(--text-main)" }}>
              {pStories[0].titleTa || pStories[0].title}
            </h3>
            <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", lineHeight: "1.5" }}>
              {stripHtml(pStories[0].shortDescription || pStories[0].description).slice(0, 150)}...
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            {pStories.slice(1).map(story => (
              <div 
                key={story._id} 
                style={{ display: "flex", gap: "12px", cursor: "pointer" }}
                onClick={() => navigate(`/news/${story._id}`, { state: story })}
              >
                <img src={story.image} alt={story.title} style={{ width: "90px", height: "65px", objectFit: "cover", borderRadius: "4px" }} />
                <div>
                  <h4 style={{ fontSize: "0.88rem", fontWeight: "700", margin: "0 0 4px 0", color: "var(--text-primary)", display: "-webkit-box", WebkitLineClamp: "2", WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                    {story.titleTa || story.title}
                  </h4>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                    <RelativeTime createdAt={story.createdAt} fallback={story.time} />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderCinemaSection = (titleTa) => {
    const cStories = getStoriesOrFallback(filteredCinema, 4);
    if (cStories.length === 0) return null;

    return (
      <div style={{ marginBottom: "40px", padding: "20px", background: "#0d0d15", color: "#fff", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="section-headline-bar" style={{ borderColor: "rgba(255,255,255,0.1)", marginBottom: "20px" }}>
          <h2 className="section-title-premium" style={{ color: "#db2777" }}>
            <FaFilm style={{ color: "#db2777" }} /> {titleTa || "சினிமா"}
          </h2>
          <span className="section-see-all" onClick={() => navigate("/cinema")} style={{ color: "#db2777" }}>
            கோலிவுட் செய்திகள் <FaChevronRight size={10} />
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: isLargeScreen ? "1.4fr 1fr" : "1fr", gap: "25px" }}>
          {/* Main Film review card */}
          <div 
            style={{ cursor: "pointer", position: "relative", borderRadius: "8px", overflow: "hidden", height: "280px" }}
            onClick={() => navigate(`/news/${cStories[0]._id}`, { state: cStories[0] })}
          >
            <img src={cStories[0].image} alt="Cinema featured" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "16px", background: "linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.2) 100%)" }}>
              <div style={{ display: "flex", gap: "4px", color: "#fbbf24", fontSize: "12px", marginBottom: "4px" }}>
                <FaStar /><FaStar /><FaStar /><FaStar /><FaStar /> <span style={{ color: "#fff", marginLeft: "4px", fontWeight: "700" }}>4.5/5 விமர்சனம்</span>
              </div>
              <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1.2rem", margin: 0, color: "#fff" }}>
                {cStories[0].titleTa || cStories[0].title}
              </h3>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <span style={{ fontSize: "13px", fontWeight: "700", color: "#db2777" }}>பிரபல செய்திகள் & OTT அப்டேட்ஸ்:</span>
            {cStories.slice(1).map(story => (
              <div 
                key={story._id}
                style={{ display: "flex", gap: "10px", paddingBottom: "10px", borderBottom: "1px dashed rgba(255,255,255,0.08)", cursor: "pointer" }}
                onClick={() => navigate(`/news/${story._id}`, { state: story })}
              >
                <img src={story.image} alt={story.title} style={{ width: "80px", height: "60px", objectFit: "cover", borderRadius: "4px" }} />
                <div>
                  <h4 style={{ fontSize: "0.85rem", fontWeight: "600", color: "#e2e8f0", margin: "0 0 2px 0", display: "-webkit-box", WebkitLineClamp: "2", WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                    {story.titleTa || story.title}
                  </h4>
                  <span style={{ fontSize: "11px", color: "#cbd5e1" }}>கோலிவுட் கேலரி</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderSportsSection = (titleTa) => {
    const sStories = getStoriesOrFallback(filteredSports, 3);
    if (sStories.length === 0) return null;

    return (
      <div style={{ marginBottom: "40px" }}>
        <div className="section-headline-bar" style={{ borderColor: "#7c3aed" }}>
          <h2 className="section-title-premium" style={{ color: "#7c3aed" }}>
            <FaFutbol style={{ color: "#7c3aed" }} /> {titleTa || "விளையாட்டு"}
          </h2>
          <span className="section-see-all" onClick={() => navigate("/sports")} style={{ color: "#7c3aed" }}>
            அனைத்தும் பார்க்க <FaChevronRight size={10} />
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: isLargeScreen ? "2fr 1fr" : "1fr", gap: "25px" }}>
          <div style={{ display: "grid", gridTemplateColumns: isLargeScreen ? "1fr 1fr" : "1fr", gap: "15px" }}>
            {sStories.slice(0, 2).map(story => renderNewsCard(story))}
          </div>

          {/* Interactive Scoreboard */}
          <div style={{ border: "1px solid var(--border-color)", borderRadius: "10px", padding: "15px", background: "var(--bg-secondary)" }}>
            <h4 style={{ margin: "0 0 10px 0", borderBottom: "1px solid var(--border-color)", paddingBottom: "6px", fontSize: "0.95rem", color: "#7c3aed", fontWeight: "800" }}>
              விளையாட்டு ஸ்கோர்போர்டு 🏆
            </h4>
            <div style={{ display: "flex", gap: "10px", marginBottom: "12px" }}>
              <button 
                onClick={() => setActiveScoreTab("match1")}
                style={{ flex: 1, padding: "5px 8px", fontSize: "11px", borderRadius: "4px", border: "1px solid var(--border-color)", background: activeScoreTab === "match1" ? "#7c3aed" : "transparent", color: activeScoreTab === "match1" ? "white" : "var(--text-primary)", fontWeight: "bold", cursor: "pointer" }}
              >
                IND vs PAK
              </button>
              <button 
                onClick={() => setActiveScoreTab("match2")}
                style={{ flex: 1, padding: "5px 8px", fontSize: "11px", borderRadius: "4px", border: "1px solid var(--border-color)", background: activeScoreTab === "match2" ? "#7c3aed" : "transparent", color: activeScoreTab === "match2" ? "white" : "var(--text-primary)", fontWeight: "bold", cursor: "pointer" }}
              >
                CSK vs MI
              </button>
            </div>

            {activeScoreTab === "match1" ? (
              <div style={{ textAlign: "center" }}>
                <span style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase" }}>T20 World Cup 2026</span>
                <div style={{ display: "flex", justifyContent: "space-around", alignItems: "center", margin: "10px 0" }}>
                  <div>
                    <span style={{ fontWeight: "800", display: "block" }}>IND</span>
                    <span style={{ fontSize: "12px" }}>172/6 (20)</span>
                  </div>
                  <span style={{ fontSize: "12px", color: "red", fontWeight: "bold" }}>VS</span>
                  <div>
                    <span style={{ fontWeight: "800", display: "block" }}>PAK</span>
                    <span style={{ fontSize: "12px" }}>168/9 (20)</span>
                  </div>
                </div>
                <div style={{ fontSize: "12px", color: "#10b981", fontWeight: "700" }}>இந்தியா 4 ரன்களில் வென்றது!</div>
              </div>
            ) : (
              <div style={{ textAlign: "center" }}>
                <span style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase" }}>IPL 2026 - Live Score</span>
                <div style={{ display: "flex", justifyContent: "space-around", alignItems: "center", margin: "10px 0" }}>
                  <div>
                    <span style={{ fontWeight: "800", display: "block" }}>CSK</span>
                    <span style={{ fontSize: "12px" }}>195/3 (18.2)</span>
                  </div>
                  <span style={{ fontSize: "12px", color: "red", fontWeight: "bold" }}>VS</span>
                  <div>
                    <span style={{ fontWeight: "800", display: "block" }}>MI</span>
                    <span style={{ fontSize: "12px" }}>194/6 (20)</span>
                  </div>
                </div>
                <div style={{ fontSize: "12px", color: "#fbbf24", fontWeight: "700" }}>சிஎஸ்கே அணிக்கு 7 விக்கெட் வித்தியாசத்தில் வெற்றி!</div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderTechSection = (titleTa) => {
    const tStories = getStoriesOrFallback(filteredTech, 3);
    if (tStories.length === 0) return null;

    return (
      <div style={{ marginBottom: "40px" }}>
        <div className="section-headline-bar" style={{ borderColor: "#0f172a" }}>
          <h2 className="section-title-premium">
            <FaMobileAlt style={{ color: "var(--accent-orange)" }} /> {titleTa || "தொழில்நுட்பம்"}
          </h2>
        </div>

        {/* Glassmorphism panel */}
        <div style={{ display: "grid", gridTemplateColumns: isLargeScreen ? "repeat(3, 1fr)" : "1fr", gap: "20px" }}>
          {tStories.map(story => (
            <div 
              key={story._id}
              onClick={() => navigate(`/news/${story._id}`, { state: story })}
              style={{
                cursor: "pointer",
                background: "rgba(255, 255, 255, 0.03)",
                backdropFilter: "blur(12px)",
                borderRadius: "12px",
                border: "1px solid var(--border-color)",
                padding: "16px",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                transition: "0.3s ease"
              }}
              onMouseOver={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.06)"}
              onMouseOut={(e) => e.currentTarget.style.background = "rgba(255, 255, 255, 0.03)"}
            >
              <img src={story.image} alt={story.title} style={{ width: "100%", height: "130px", objectFit: "cover", borderRadius: "6px" }} />
              <span style={{ fontSize: "10px", padding: "2px 6px", background: "var(--accent-orange)", color: "white", borderRadius: "4px", width: "fit-content", fontWeight: "bold" }}>TECH BADGE</span>
              <h4 style={{ fontSize: "0.95rem", margin: 0, fontWeight: "700", color: "var(--text-primary)", display: "-webkit-box", WebkitLineClamp: "2", WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                {story.titleTa || story.title}
              </h4>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderBusinessSection = (titleTa) => {
    const bStories = getStoriesOrFallback(filteredBusiness, 3);
    if (bStories.length === 0) return null;

    return (
      <div style={{ marginBottom: "40px" }}>
        <div className="section-headline-bar" style={{ borderColor: "#059669" }}>
          <h2 className="section-title-premium" style={{ color: "#059669" }}>
            <FaBriefcase style={{ color: "#059669" }} /> {titleTa || "வணிகம்"}
          </h2>
          <span className="section-see-all" onClick={() => navigate("/business")} style={{ color: "#059669" }}>
            வணிகம் <FaChevronRight size={10} />
          </span>
        </div>

        {/* Stock price rates ticker widget */}
        <div className="business-rates-bar" style={{ display: "grid", gridTemplateColumns: isLargeScreen ? "repeat(4, 1fr)" : "repeat(2, 1fr)", gap: "10px", marginBottom: "20px" }}>
          <div style={{ border: "1px solid var(--border-color)", borderRadius: "6px", padding: "8px 12px", background: "var(--bg-secondary)", fontSize: "11px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontWeight: "700" }}>SENSEX:</span>
            <span style={{ color: "#10b981", fontWeight: "700", display: "flex", alignItems: "center" }}>73,240 <FaArrowUp size={8} /></span>
          </div>
          <div style={{ border: "1px solid var(--border-color)", borderRadius: "6px", padding: "8px 12px", background: "var(--bg-secondary)", fontSize: "11px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontWeight: "700" }}>Gold (22K 1g):</span>
            <span style={{ color: "#ef4444", fontWeight: "700", display: "flex", alignItems: "center" }}>₹7,230 <FaArrowDown size={8} /></span>
          </div>
          <div style={{ border: "1px solid var(--border-color)", borderRadius: "6px", padding: "8px 12px", background: "var(--bg-secondary)", fontSize: "11px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontWeight: "700" }}>Petrol (Ltr):</span>
            <span style={{ fontWeight: "700" }}>₹102.63</span>
          </div>
          <div style={{ border: "1px solid var(--border-color)", borderRadius: "6px", padding: "8px 12px", background: "var(--bg-secondary)", fontSize: "11px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontWeight: "700" }}>Diesel (Ltr):</span>
            <span style={{ fontWeight: "700" }}>₹94.24</span>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: isLargeScreen ? "repeat(3, 1fr)" : "1fr", gap: "15px" }}>
          {bStories.map(story => (
            <div 
              key={story._id}
              onClick={() => navigate(`/news/${story._id}`, { state: story })}
              style={{ display: "flex", gap: "10px", cursor: "pointer", borderBottom: "1px solid var(--border-color)", paddingBottom: "10px" }}
            >
              <img src={story.image} alt={story.title} style={{ width: "90px", height: "65px", objectFit: "cover", borderRadius: "4px" }} />
              <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <h4 style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--text-primary)", display: "-webkit-box", WebkitLineClamp: "2", WebkitBoxOrient: "vertical", overflow: "hidden", margin: 0 }}>
                  {story.titleTa || story.title}
                </h4>
                <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                  <RelativeTime createdAt={story.createdAt} fallback={story.time} />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };


  const renderShortsSection = (titleTa) => {
    if (resolvedFeaturedShorts.length === 0) return null;

    const isVideoUrl = (url) => {
      if (!url) return false;
      const lower = url.toLowerCase();
      return (
        lower.endsWith(".mp4") ||
        lower.endsWith(".webm") ||
        lower.endsWith(".ogg") ||
        lower.endsWith(".mov") ||
        lower.endsWith(".m4v") ||
        lower.includes("video") ||
        lower.includes("/uploads/")
      );
    };

    return (
      <div style={{ marginBottom: "40px" }}>
        <div className="section-headline-bar">
          <h2 className="section-title-premium" style={{ color: "var(--accent-red)" }}>
            <FaMobileAlt style={{ color: "var(--accent-red)", marginRight: "8px" }} /> {titleTa || "சார்ட்ஸ்"}
          </h2>
        </div>

        {/* Horizontal scroll of vertical reels */}
        <div className="shorts-scroll-container" style={{ display: "flex", gap: "15px", overflowX: "auto", paddingBottom: "15px", scrollSnapType: "x mandatory" }}>
          {resolvedFeaturedShorts.map(sh => (
            <motion.div 
              key={sh._id}
              onClick={() => setActiveShort(sh)}
              style={{
                width: "200px",
                height: "330px",
                borderRadius: "10px",
                overflow: "hidden",
                position: "relative",
                cursor: "pointer",
                flexShrink: 0,
                scrollSnapAlign: "start",
                border: "1px solid var(--border-color)"
              }}
              whileHover={{ scale: 1.03 }}
            >
              {sh.thumbnail && isVideoUrl(sh.thumbnail) ? (
                <video 
                  src={sh.thumbnail} 
                  muted 
                  playsInline 
                  autoPlay 
                  loop 
                  style={{ width: "100%", height: "100%", objectFit: "cover" }} 
                />
              ) : (
                <img src={sh.thumbnail} alt={sh.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              )}
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.1) 60%)", zIndex: 1 }}></div>
              <div style={{ position: "absolute", bottom: "10px", left: "10px", right: "10px", zIndex: 2, color: "white" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "4px", marginBottom: "4px" }}>
                  <FaPlay size={10} />
                  <span style={{ fontSize: "10px", fontWeight: "bold" }}>Play Reel</span>
                </div>
                <h4 style={{ fontSize: "0.8rem", fontWeight: "700", margin: 0, display: "-webkit-box", WebkitLineClamp: "2", WebkitBoxOrient: "vertical", overflow: "hidden", textShadow: "1px 1px 2px rgba(0,0,0,0.8)" }}>
                  {sh.title}
                </h4>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  };

  const renderPhotosSection = (titleTa) => {
    if (photoStories.length === 0) return null;

    return (
      <div style={{ marginBottom: "40px" }}>
        <div className="section-headline-bar">
          <h2 className="section-title-premium" style={{ color: "var(--accent-orange)" }}>
            <FaImage style={{ color: "var(--accent-orange)", marginRight: "8px" }} /> {titleTa || "புகைப்படக் கதைகள்"}
          </h2>
        </div>

        {/* Pinterest-style masonry grid */}
        <div style={{ display: "grid", gridTemplateColumns: isLargeScreen ? "repeat(3, 1fr)" : "1fr", gap: "20px" }}>
          {photoStories.map((story) => (
            <motion.div 
              key={story._id}
              onClick={() => {
                setActivePhotoStory(story);
                setPhotoStoryIndex(0);
              }}
              style={{
                cursor: "pointer",
                borderRadius: "10px",
                overflow: "hidden",
                position: "relative",
                border: "1px solid var(--border-color)",
                boxShadow: "0 4px 6px rgba(0,0,0,0.05)"
              }}
              whileHover={{ y: -5, boxShadow: "0 10px 15px rgba(0,0,0,0.1)" }}
            >
              <img src={story.coverImage} alt={story.title} style={{ width: "100%", height: "200px", objectFit: "cover" }} />
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 60%)", zIndex: 1 }}></div>
              
              {/* Badge for total images */}
              <div style={{ position: "absolute", top: "10px", right: "10px", background: "rgba(0,0,0,0.7)", color: "white", padding: "4px 8px", borderRadius: "15px", fontSize: "11px", fontWeight: "bold", zIndex: 2, display: "flex", alignItems: "center", gap: "4px" }}>
                <FaImage size={10} /> {(story.images || []).length} படங்கள்
              </div>

              <div style={{ position: "absolute", bottom: "12px", left: "12px", right: "12px", zIndex: 2, color: "white" }}>
                <h4 style={{ fontSize: "0.95rem", fontWeight: "700", margin: 0, textShadow: "1px 1px 2px rgba(0,0,0,0.8)" }}>
                  {story.title}
                </h4>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  };

  const renderEditorsPicksSection = (titleTa) => {
    if (resolvedEditorPicks.length === 0) return null;

    return (
      <div style={{ marginBottom: "40px" }}>
        <div className="section-headline-bar">
          <h2 className="section-title-premium">
            <FaRegLightbulb style={{ color: "var(--accent-orange)", marginRight: "8px" }} /> {titleTa || "ஆசிரியர் தேர்வுகள்"}
          </h2>
        </div>

        {/* Minimalist Editorial Row */}
        <div style={{ display: "grid", gridTemplateColumns: isLargeScreen ? "repeat(3, 1fr)" : "1fr", gap: "20px" }}>
          {resolvedEditorPicks.map(article => (
            <div 
              key={article._id}
              onClick={() => navigate(`/news/${article._id}`, { state: article })}
              style={{
                cursor: "pointer",
                padding: "20px",
                borderRadius: "10px",
                border: "1px solid var(--border-color)",
                background: "var(--bg-secondary)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                minHeight: "180px",
                borderLeft: "4px solid var(--accent-orange)",
                transition: "0.2s"
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = "translateY(-3px)"}
              onMouseOut={(e) => e.currentTarget.style.transform = "translateY(0)"}
            >
              <div>
                <span style={{ fontSize: "11px", fontWeight: "bold", textTransform: "uppercase", color: "var(--accent-orange)" }}>ஆசிரியர் பரிந்துரை</span>
                <p style={{ margin: "10px 0 0 0", fontFamily: "var(--font-serif)", fontSize: "1rem", fontWeight: "700", lineHeight: "1.4", color: "var(--text-primary)" }}>
                  "{article.titleTa || article.title}"
                </p>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "15px", borderTop: "1px solid var(--border-color)", paddingTop: "10px" }}>
                <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>நியூஸ்குரு எடிட்டோரியல்</span>
                <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>✏️</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderSectionById = (id, titleTa) => {
    switch (id) {
      case "breaking":
        return renderBreakingNewsBar(titleTa);
      case "latest":
        return renderLatestNewsSection(titleTa);
      case "politics":
        return renderPoliticsSection(titleTa);
      case "cinema":
        return renderCinemaSection(titleTa);
      case "sports":
        return renderSportsSection(titleTa);
      case "tech":
        return renderTechSection(titleTa);
      case "business":
        return renderBusinessSection(titleTa);
      case "videos":
        return null;
      case "shorts":
        return renderShortsSection(titleTa);
      case "photos":
        return renderPhotosSection(titleTa);
      case "editors":
        return renderEditorsPicksSection(titleTa);
      default:
        return null;
    }
  };

  return (
    <section className="home-user-page" style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 15px 30px 15px", position: "relative" }}>
      <PopupAd />
      <AdZone position="TOP_BANNER" />

      {/* RENDER TOP SECTIONS: Breaking Ticker & Hero Above-the-fold */}
      {activeSections.map(sec => {
        if (sec.id === "breaking") return <div key={sec.id}>{renderBreakingNewsBar(sec.titleTa)}</div>;
        if (sec.id === "hero") return <div key={sec.id}>{renderHeroSection()}</div>;
        return null;
      })}

      <AdZone position="SECTION_BANNER" />

      {/* Two-Column Body Grid */}
      <div style={isLargeScreen ? { display: "grid", gridTemplateColumns: "1fr 300px", gap: "30px", alignItems: "start", marginTop: "20px" } : { display: "flex", flexDirection: "column", gap: "30px", marginTop: "20px" }}>
        
        {/* Left Column: All other categories loaded in dynamic order */}
        <div style={{ minWidth: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
          {activeSections.map(sec => {
            if (sec.id !== "breaking" && sec.id !== "hero") {
              return <div key={sec.id}>{renderSectionById(sec.id, sec.titleTa)}</div>;
            }
            return null;
          })}
        </div>

        {/* Right Column: Sticky Sidebar with ads & widgets */}
        <aside style={{ 
          display: "flex", 
          flexDirection: "column", 
          gap: "25px", 
          width: isLargeScreen ? "300px" : "100%",
          position: isLargeScreen ? "sticky" : "static", 
          top: isLargeScreen ? "20px" : "auto",
          minWidth: "300px"
        }}>
          <AdZone position="SIDEBAR" />

          {/* Go Premium promotion card */}
          {(!token || !readerData?.isPremium) && (
            <motion.div 
              className="premium-widget go-premium-promo-widget" 
              style={{ 
                padding: "24px 20px", 
                borderRadius: "10px", 
                background: "linear-gradient(135deg, #ea580c 0%, #ca8a04 100%)", 
                color: "#ffffff",
                border: "none",
                boxShadow: "0 10px 15px -3px rgba(234, 88, 12, 0.25)",
                cursor: "pointer",
                textAlign: "center"
              }} 
              onClick={() => navigate("/subscribe")}
              whileHover={{ scale: 1.02 }}
            >
              <h3 style={{ margin: "0 0 10px 0", fontSize: "1.3rem", fontWeight: "900", fontFamily: "var(--font-serif)" }}>நியூஸ்குரு பிரீமியம் 👑</h3>
              <p style={{ margin: "0 0 18px 0", fontSize: "0.85rem", opacity: "0.9", lineHeight: "1.4" }}>முழுமையான விளம்பரங்கள் இல்லாத தடையற்ற செய்தி வாசிப்பு அனுபவத்தை இப்போதே பெற சந்தா சேருங்கள்!</p>
              <button style={{ 
                background: "#ffffff", 
                color: "#ea580c", 
                border: "none", 
                padding: "10px 20px", 
                borderRadius: "25px", 
                fontWeight: "800", 
                fontSize: "0.82rem",
                cursor: "pointer",
                boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
              }}>இப்போது இணைவோம் &rarr;</button>
            </motion.div>
          )}


          <AdZone position="SIDEBAR" />

          {/* Reader Poll Widget */}
          <div className="premium-widget" style={{ padding: "16px", borderRadius: "8px", border: "1px solid var(--border-color)", background: "var(--bg-secondary)" }}>
            <h3 className="widget-title-serif" style={{ fontSize: "1.05rem", fontWeight: "700", borderBottom: "2px solid var(--border-color)", paddingBottom: "8px", marginTop: 0 }}>கருத்துக் கணிப்பு 📊</h3>
            <div style={{ fontSize: "0.85rem", marginTop: "12px" }}>
              <p style={{ fontWeight: "700", marginBottom: "12px", color: "var(--text-primary)" }}>இணைய வழிக் கல்வி மாணவர்களுக்கு உகந்ததா?</p>
              {activePollVote === null ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <button 
                    onClick={() => setActivePollVote("yes")}
                    style={{ width: "100%", padding: "8px", background: "var(--bg-hover)", border: "1px solid var(--border-color)", borderRadius: "4px", color: "var(--text-primary)", cursor: "pointer", textAlign: "left", fontSize: "0.82rem" }}
                  >
                    ஆம், மிகவும் உகந்தது
                  </button>
                  <button 
                    onClick={() => setActivePollVote("no")}
                    style={{ width: "100%", padding: "8px", background: "var(--bg-hover)", border: "1px solid var(--border-color)", borderRadius: "4px", color: "var(--text-primary)", cursor: "pointer", textAlign: "left", fontSize: "0.82rem" }}
                  >
                    இல்லை, நேரடி கல்வியே சிறந்தது
                  </button>
                </div>
              ) : (
                <div>
                  <div style={{ marginBottom: "8px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                      <span>ஆம்</span>
                      <span style={{ fontWeight: "700" }}>34%</span>
                    </div>
                    <div style={{ width: "100%", height: "8px", background: "var(--border-color)", borderRadius: "4px", overflow: "hidden" }}>
                      <div style={{ width: "34%", height: "100%", background: "var(--accent-orange)" }}></div>
                    </div>
                  </div>
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                      <span>இல்லை</span>
                      <span style={{ fontWeight: "700" }}>66%</span>
                    </div>
                    <div style={{ width: "100%", height: "8px", background: "var(--border-color)", borderRadius: "4px", overflow: "hidden" }}>
                      <div style={{ width: "66%", height: "100%", background: "var(--accent-orange)" }}></div>
                    </div>
                  </div>
                  <p style={{ fontSize: "0.75rem", color: "#10b981", marginTop: "10px", fontWeight: "700" }}>வாக்களித்தமைக்கு நன்றி!</p>
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>

      <AdZone position="FLOATING_ADVERTISEMENT" />

      {/* FULLSCREEN SHORTS REELS MODAL */}
      <AnimatePresence>
        {activeShort && (
          <motion.div 
            style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.9)", zIndex: 99999, display: "flex", alignItems: "center", justifyContent: "center", padding: "10px" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div style={{ width: "100%", maxWidth: "380px", height: "90vh", position: "relative", background: "black", borderRadius: "16px", overflow: "hidden", display: "flex", flexDirection: "column" }}>
              {/* Top controls */}
              <div style={{ position: "absolute", top: "15px", left: "15px", right: "15px", zIndex: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ background: "rgba(0,0,0,0.6)", color: "white", padding: "4px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "bold" }}>
                  {activeShort.category || "General"}
                </span>
                <button 
                  onClick={() => setActiveShort(null)}
                  style={{ background: "none", border: "none", color: "white", cursor: "pointer", fontSize: "20px" }}
                >
                  <FaTimes />
                </button>
              </div>

              {/* Video Player */}
              {activeShort.videoUrl.includes("youtube.com") || activeShort.videoUrl.includes("youtu.be") || activeShort.videoUrl.includes("embed") ? (
                <iframe
                  src={`${activeShort.videoUrl}?autoplay=1&mute=0`}
                  title={activeShort.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  style={{ width: "100%", height: "100%", flex: 1 }}
                ></iframe>
              ) : (
                <video
                  src={activeShort.videoUrl}
                  controls
                  autoPlay
                  style={{ width: "100%", height: "100%", objectFit: "cover", flex: 1, background: "#000" }}
                ></video>
              )}

              {/* Overlay details */}
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "20px", background: "linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0) 100%)", color: "white", zIndex: 5 }}>
                <h3 style={{ fontSize: "1rem", margin: "0 0 5px 0" }}>{activeShort.title}</h3>
                <p style={{ fontSize: "0.8rem", opacity: "0.8", margin: 0 }}>{activeShort.description}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PHOTO GALLERY CAROUSEL LIGHTBOX MODAL */}
      <AnimatePresence>
        {activePhotoStory && (
          <motion.div 
            style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.95)", zIndex: 99999, display: "flex", alignItems: "center", justifyContent: "center" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Main lightbox container */}
            <div style={{ width: "100%", maxWidth: "800px", position: "relative", textAlign: "center", padding: "20px" }}>
              {/* Close Button */}
              <button 
                onClick={() => setActivePhotoStory(null)}
                style={{ position: "absolute", top: "-40px", right: "20px", background: "none", border: "none", color: "white", cursor: "pointer", fontSize: "24px" }}
              >
                <FaTimes /> Close Gallery
              </button>

              <h2 style={{ color: "white", fontFamily: "var(--font-serif)", fontSize: "1.3rem", marginBottom: "15px" }}>{activePhotoStory.title}</h2>

              {/* Image slide viewer */}
              {activePhotoStory.images && activePhotoStory.images.length > 0 ? (
                <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", background: "#0a0a0a", borderRadius: "10px", overflow: "hidden", minHeight: "350px", border: "1px solid rgba(255,255,255,0.05)" }}>
                  <img 
                    src={activePhotoStory.images[photoStoryIndex]} 
                    alt={`Slide ${photoStoryIndex + 1}`} 
                    style={{ maxWidth: "100%", maxHeight: "55vh", objectFit: "contain" }} 
                  />

                  {/* Left / Right buttons */}
                  {photoStoryIndex > 0 && (
                    <button 
                      onClick={() => setPhotoStoryIndex(prev => prev - 1)}
                      style={{ position: "absolute", left: "15px", background: "rgba(0,0,0,0.6)", border: "none", color: "white", width: "40px", height: "40px", borderRadius: "50%", cursor: "pointer", fontSize: "16px", display: "flex", alignItems: "center", justifyContent: "center" }}
                    >
                      <FaChevronLeft />
                    </button>
                  )}
                  {photoStoryIndex < activePhotoStory.images.length - 1 && (
                    <button 
                      onClick={() => setPhotoStoryIndex(prev => prev + 1)}
                      style={{ position: "absolute", right: "15px", background: "rgba(0,0,0,0.6)", border: "none", color: "white", width: "40px", height: "40px", borderRadius: "50%", cursor: "pointer", fontSize: "16px", display: "flex", alignItems: "center", justifyContent: "center" }}
                    >
                      <FaChevronRight />
                    </button>
                  )}
                </div>
              ) : (
                <div style={{ color: "white", padding: "40px" }}>No images logged in this gallery.</div>
              )}

              {/* Index counter & description */}
              {activePhotoStory.images && (
                <div style={{ marginTop: "15px", color: "white" }}>
                  <div style={{ fontSize: "14px", fontWeight: "bold", color: "var(--accent-orange)" }}>
                    చిత్రం {photoStoryIndex + 1} of {activePhotoStory.images.length}
                  </div>
                  <p style={{ fontSize: "13px", opacity: 0.9, marginTop: "8px", maxWidth: "600px", margin: "8px auto 0 auto" }}>
                    {activePhotoStory.description}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </section>
  );
};

export default Home;

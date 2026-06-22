import React, { useEffect, useState, useRef } from "react";
import API from "../config/api";
import RelativeTime from "../components/RelativeTime";
import AdZone from "../components/AdZone";
import PopupAd from "../components/PopupAd";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FaBolt, FaFire, FaMapMarkedAlt, FaFlag, FaGlobe, FaFutbol, 
  FaBriefcase, FaFilm, FaGraduationCap, FaLandmark, FaHeart, 
  FaBookmark, FaShareAlt, FaPlay, FaImage, FaChevronRight, 
  FaStar, FaMobileAlt,
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


const Home = () => {
  const navigate = useNavigate();

  const token = localStorage.getItem("readerToken");
  let readerData = null;
  try {
    const dataStr = localStorage.getItem("readerData");
    if (dataStr) readerData = JSON.parse(dataStr);
  } catch (e) {}

  useSEO({
    title: "Newsghuru | English News",
    description: "Breaking news, politics, cricket, business and international updates - Newsghuru",
    keywords: "newsghuru, english news, breaking news, live news, politics, business",
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
  const [shorts, setShorts] = useState([]);
  const [photoStories, setPhotoStories] = useState([]);

  // Interactive page states
  const [activeShort, setActiveShort] = useState(null);
  const [activePhotoStory, setActivePhotoStory] = useState(null);
  const [photoStoryIndex, setPhotoStoryIndex] = useState(0);
  const [visibleFeedCount, setVisibleFeedCount] = useState(6);
  const [likedArticles, setLikedArticles] = useState({});

  const leftRef = useRef(null);
  const sidebarBaseRef = useRef(null);
  const [extraAdsCount, setExtraAdsCount] = useState(0);

  // Dynamically calculate extra advertisements based on left column vs base sidebar height
  useEffect(() => {
    if (!isLargeScreen) {
      setExtraAdsCount(0);
      return;
    }

    const calculateExtraAds = () => {
      if (!leftRef.current || !sidebarBaseRef.current) return;
      const leftHeight = leftRef.current.offsetHeight;
      const baseSidebarHeight = sidebarBaseRef.current.offsetHeight;
      const diff = leftHeight - baseSidebarHeight;
      
      // Each extra sidebar advertisement widget is ~500px high
      const count = Math.max(0, Math.floor(diff / 500));
      setExtraAdsCount(count);
    };

    calculateExtraAds();

    const observer = new ResizeObserver(() => {
      calculateExtraAds();
    });

    if (leftRef.current) observer.observe(leftRef.current);
    if (sidebarBaseRef.current) observer.observe(sidebarBaseRef.current);

    window.addEventListener("resize", calculateExtraAds);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", calculateExtraAds);
    };
  }, [isLargeScreen]);
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

  const categoryEnglishMap = {
    breaking: "Breaking News",
    tamil: "Tamil Nadu",
    india: "India",
    world: "World",
    business: "Business",
    sports: "Sports",
    education: "Education",
    politics: "Politics",
    cinema: "Cinema",
    technology: "Technology",
    tech: "Technology",
  };

  const getCategoryLabel = (category) =>
    categoryEnglishMap[category?.toLowerCase()] || category;

  const fetchAll = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      setError("");

      // Parallel data fetching
      const [newsRes, configRes, shortsRes, photosRes] = await Promise.all([
        API.get("/api/news/published"),
        API.get("/api/homepage-config"),
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
      setShorts((shortsRes.data || []).filter(s => s.isEnabled));
      setPhotoStories(photosRes.data || []);

    } catch (err) {
      console.error("Home API Error:", err);
      if (showLoading) setError("Failed to load news");
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
        title: article.title || article.titleTa,
        url: url
      }).catch(err => console.log(err));
    } else {
      navigator.clipboard.writeText(url);
      alert("Link copied to clipboard!");
    }
  };

  // Default Sections Visibilities & Ordering
  const DEFAULT_SECTIONS = [
    { id: "breaking", titleTa: "Breaking News", titleEn: "Breaking News", isEnabled: true, order: 1 },
    { id: "hero", titleTa: "Top Stories", titleEn: "Top Stories", isEnabled: true, order: 2 },
    { id: "latest", titleTa: "Latest News", titleEn: "Latest News", isEnabled: true, order: 3 },
    { id: "politics", titleTa: "Politics", titleEn: "Politics", isEnabled: true, order: 4 },
    { id: "cinema", titleTa: "Cinema", titleEn: "Cinema", isEnabled: true, order: 5 },
    { id: "sports", titleTa: "Sports", titleEn: "Sports", isEnabled: true, order: 6 },
    { id: "tech", titleTa: "Technology", titleEn: "Technology", isEnabled: true, order: 7 },
    { id: "business", titleTa: "Business & Markets", titleEn: "Business & Markets", isEnabled: true, order: 8 },
    { id: "tamil", titleTa: "Tamil Nadu", titleEn: "Tamil Nadu", isEnabled: true, order: 9 },
    { id: "shorts", titleTa: "Shorts Reels", titleEn: "Shorts Reels", isEnabled: true, order: 10 },
    { id: "photos", titleTa: "Photo Stories", titleEn: "Photo Stories", isEnabled: true, order: 11 },
    { id: "editors", titleTa: "Editor's Picks", titleEn: "Editor's Picks", isEnabled: true, order: 12 }
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

  const resolvedFeaturedShorts = (() => {
    // Only include active, published/enabled shorts
    const activeShortsMap = new Map(shorts.map((s) => [s._id.toString(), s]));

    const featured = (homepageConfig?.featuredShorts || [])
      .filter((s) => s && s.isEnabled && activeShortsMap.has(s._id.toString()))
      .map((s) => activeShortsMap.get(s._id.toString()));

    const featuredIds = new Set(featured.map((s) => s._id.toString()));
    const remaining = shorts.filter((s) => s && s._id && !featuredIds.has(s._id.toString()));

    // Combine featured and remaining, then sort by creation date descending (newest first)
    const combined = [...featured, ...remaining];
    return combined.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  })();

  // Standard News Card Component
  const renderNewsCard = (article) => {
    if (!article) return null;
    const isLiked = likedArticles[article._id];
    const isBookmarked = bookmarkedArticles[article._id];
    const viewCount = parseInt(article.views) || 0;

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
            alt={article.title || article.titleTa} 
            style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.5s ease" }}
            className="hover-zoom"
          />
          <div className="card-gradient-overlay"></div>
          <span className="card-cat-badge">{getCategoryLabel(article.category)}</span>
          <div className="card-info-overlay">
            {viewCount > 0 && <span>👁 {viewCount.toLocaleString()} Views</span>}
          </div>
        </div>
        <div className="card-body-content">
          <div>
            <h3 className="card-headline line-clamp-2" style={{ fontSize: "1.05rem", fontWeight: "700" }}>
              {article.title || article.titleTa}
            </h3>
            <p className="card-excerpt line-clamp-2">
              {stripHtml(article.description || article.shortDescription).slice(0, 100)}...
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
  const renderBreakingNewsBar = (titleEn) => {
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
                alt={resolvedHeroStory.title || resolvedHeroStory.titleTa} 
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
              <div className="card-gradient-overlay" style={{ height: "100%", position: "absolute", bottom: 0, left: 0, right: 0, background: "linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.4) 60%, rgba(0,0,0,0.1) 100%)", zIndex: 2 }}></div>
              <span className="card-cat-badge" style={{ top: "20px", left: "20px", zIndex: 3 }}>{getCategoryLabel(resolvedHeroStory.category)}</span>
              
              <div style={{ position: "absolute", bottom: "24px", left: "24px", right: "24px", zIndex: 10, color: "#fff" }}>
                <span style={{ fontSize: "0.82rem", background: "var(--accent-red)", padding: "4px 10px", borderRadius: "4px", fontWeight: "700", display: "inline-flex", alignItems: "center", gap: "6px", marginBottom: "12px", boxShadow: "0 2px 8px rgba(239, 68, 68, 0.4)" }}>
                  <FaBolt /> Top Story
                </span>
                <h2 style={{ fontFamily: "var(--font-serif)", fontSize: isLargeScreen ? "2rem" : "1.5rem", fontWeight: "800", lineHeight: "1.25", marginBottom: "10px" }}>
                  {resolvedHeroStory.title || resolvedHeroStory.titleTa}
                </h2>
                <p style={{ fontSize: "0.95rem", opacity: "0.9", display: "-webkit-box", WebkitLineClamp: "2", WebkitBoxOrient: "vertical", overflow: "hidden", marginBottom: "12px" }}>
                  {stripHtml(resolvedHeroStory.description || resolvedHeroStory.shortDescription)}
                </p>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.82rem", opacity: "0.8" }}>
                  <span><RelativeTime createdAt={resolvedHeroStory.createdAt} fallback={resolvedHeroStory.time} /></span>
                  {parseInt(resolvedHeroStory.views) > 0 && (
                    <span>👁 {parseInt(resolvedHeroStory.views).toLocaleString()} Views</span>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <div style={{ background: "var(--bg-hover)", borderRadius: "var(--border-radius-md)", height: "480px" }}></div>
        )}

        {/* Center column: Stack of 4 Secondary Stories */}
        <div className="above-fold-center secondary-stack" style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1.15rem", borderBottom: "2px solid var(--accent-orange)", paddingBottom: "8px", margin: 0, fontWeight: "800", color: "var(--text-primary)" }}>
            Top Stories
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
                    {story.title || story.titleTa}
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
            <h3 className="widget-title-serif" style={{ marginTop: 0 }}>Trending <span>🔥</span></h3>
            <div className="trending-list" style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "10px" }}>
              {resolvedTrendingStories.map((story, index) => (
                <div 
                  key={story._id}
                  className="trending-list-item"
                  onClick={() => navigate(`/news/${story._id}`, { state: story })}
                  style={{ display: "flex", gap: "12px", cursor: "pointer", alignItems: "center", borderBottom: index < resolvedTrendingStories.length - 1 ? "1px solid var(--border-color)" : "none", paddingBottom: "6px" }}
                >
                  <span className="trending-number" style={{ fontSize: "1.2rem", fontWeight: "900", color: "var(--accent-orange)" }}>0{index + 1}</span>
                  <span className="trending-text" style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--text-primary)", display: "-webkit-box", WebkitLineClamp: "2", WebkitBoxOrient: "vertical", overflow: "hidden" }}>{story.title || story.titleTa}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderLatestNewsSection = (titleEn) => {
    return (
      <div style={{ marginBottom: "40px" }}>
        <div className="section-headline-bar">
          <h2 className="section-title-premium">
            <FaRegLightbulb style={{ color: "var(--accent-orange)" }} /> {titleEn || "Latest News"}
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
              Load More News
            </button>
          </div>
        )}
      </div>
    );
  };

  const renderPoliticsSection = (titleEn) => {
    const pStories = getStoriesOrFallback(filteredPolitics, 4);
    if (pStories.length === 0) return null;

    return (
      <div style={{ marginBottom: "40px", borderTop: "3px solid var(--accent-orange)", paddingTop: "15px" }}>
        <div className="section-headline-bar" style={{ border: "none", marginBottom: "15px" }}>
          <h2 className="section-title-premium" style={{ fontSize: "1.4rem" }}>
            <FaLandmark style={{ color: "var(--accent-orange)" }} /> {titleEn || "Politics"}
          </h2>
          <span className="section-see-all" onClick={() => navigate("/politics")} style={{ color: "var(--accent-orange)" }}>
            View All <FaChevronRight size={10} />
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
              {pStories[0].title || pStories[0].titleTa}
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
                    {story.title || story.titleTa}
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

  const renderTamilSection = (titleEn) => {
    const tStories = getStoriesOrFallback(filteredTamil, 4);
    if (tStories.length === 0) return null;

    return (
      <div style={{ marginBottom: "40px", borderTop: "3px solid var(--accent-orange)", paddingTop: "15px" }}>
        <div className="section-headline-bar" style={{ border: "none", marginBottom: "15px" }}>
          <h2 className="section-title-premium" style={{ fontSize: "1.4rem" }}>
            <FaMapMarkedAlt style={{ color: "var(--accent-orange)", marginRight: "8px" }} /> {titleEn || "Tamil Nadu"}
          </h2>
          <span className="section-see-all" onClick={() => navigate("/tamil")} style={{ color: "var(--accent-orange)" }}>
            View All <FaChevronRight size={10} />
          </span>
        </div>

        {/* Thick headline feature story */}
        <div style={{ display: "grid", gridTemplateColumns: isLargeScreen ? "1.2fr 0.8fr" : "1fr", gap: "25px" }}>
          <div 
            style={{ cursor: "pointer", borderRight: isLargeScreen ? "1px solid var(--border-color)" : "none", paddingRight: isLargeScreen ? "20px" : "0" }}
            onClick={() => navigate(`/news/${tStories[0]._id}`, { state: tStories[0] })}
          >
            <img src={tStories[0].image || tStories[0].coverImage} alt="tamil" style={{ width: "100%", height: "230px", objectFit: "cover", borderRadius: "6px" }} />
            <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1.25rem", fontWeight: "800", margin: "12px 0 8px 0", color: "var(--text-main)" }}>
              {tStories[0].title || tStories[0].titleTa}
            </h3>
            <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", lineHeight: "1.5" }}>
              {stripHtml(tStories[0].description || tStories[0].shortDescription).slice(0, 150)}...
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            {tStories.slice(1).map(story => (
              <div 
                key={story._id} 
                style={{ display: "flex", gap: "12px", cursor: "pointer" }}
                onClick={() => navigate(`/news/${story._id}`, { state: story })}
              >
                <img src={story.image || story.coverImage} alt={story.title} style={{ width: "90px", height: "65px", objectFit: "cover", borderRadius: "4px" }} />
                <div>
                  <h4 style={{ fontSize: "0.88rem", fontWeight: "700", margin: "0 0 4px 0", color: "var(--text-primary)", display: "-webkit-box", WebkitLineClamp: "2", WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                    {story.title || story.titleTa}
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

  const renderCinemaSection = (titleEn) => {
    const cStories = getStoriesOrFallback(filteredCinema, 4);
    if (cStories.length === 0) return null;

    return (
      <div style={{ marginBottom: "40px", padding: "20px", background: "#0d0d15", color: "#fff", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="section-headline-bar" style={{ borderColor: "rgba(255,255,255,0.1)", marginBottom: "20px" }}>
          <h2 className="section-title-premium" style={{ color: "#fff" }}>
            <FaFilm style={{ color: "var(--accent-orange)" }} /> {titleEn || "Cinema"}
          </h2>
          <span className="section-see-all" onClick={() => navigate("/cinema")} style={{ color: "var(--accent-orange)" }}>
            Cinema News <FaChevronRight size={10} />
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
                <FaStar /><FaStar /><FaStar /><FaStar /><FaStar /> <span style={{ color: "#fff", marginLeft: "4px", fontWeight: "700" }}>4.5/5 Review</span>
              </div>
              <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1.2rem", margin: 0, color: "#fff" }}>
                {cStories[0].title || cStories[0].titleTa}
              </h3>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <span style={{ fontSize: "13px", fontWeight: "700", color: "var(--accent-orange)" }}>Popular News & OTT Updates:</span>
            {cStories.slice(1).map(story => (
              <div 
                key={story._id}
                style={{ display: "flex", gap: "10px", paddingBottom: "10px", borderBottom: "1px dashed rgba(255,255,255,0.08)", cursor: "pointer" }}
                onClick={() => navigate(`/news/${story._id}`, { state: story })}
              >
                <img src={story.image} alt={story.title} style={{ width: "80px", height: "60px", objectFit: "cover", borderRadius: "4px" }} />
                <div>
                  <h4 style={{ fontSize: "0.85rem", fontWeight: "600", color: "#e2e8f0", margin: "0 0 2px 0", display: "-webkit-box", WebkitLineClamp: "2", WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                    {story.title || story.titleTa}
                  </h4>
                  <span style={{ fontSize: "11px", color: "#cbd5e1" }}>Cinema Gallery</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderSportsSection = (titleEn) => {
    const sStories = getStoriesOrFallback(filteredSports, 3);
    if (sStories.length === 0) return null;

    return (
      <div style={{ marginBottom: "40px" }}>
        <div className="section-headline-bar">
          <h2 className="section-title-premium">
            <FaFutbol style={{ color: "var(--accent-orange)" }} /> {titleEn || "Sports"}
          </h2>
          <span className="section-see-all" onClick={() => navigate("/sports")} style={{ color: "var(--accent-orange)" }}>
            View All <FaChevronRight size={10} />
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: isLargeScreen ? "2fr 1fr" : "1fr", gap: "25px" }}>
          <div style={{ display: "grid", gridTemplateColumns: isLargeScreen ? "1fr 1fr" : "1fr", gap: "15px" }}>
            {sStories.slice(0, 2).map(story => renderNewsCard(story))}
          </div>

          {/* Interactive Scoreboard */}
          <div style={{ border: "1px solid var(--border-color)", borderRadius: "10px", padding: "15px", background: "var(--bg-secondary)" }}>
            <h4 style={{ margin: "0 0 10px 0", borderBottom: "1px solid var(--border-color)", paddingBottom: "6px", fontSize: "0.95rem", color: "var(--accent-orange)", fontWeight: "800" }}>
              Sports Scoreboard 🏆
            </h4>
            <div style={{ display: "flex", gap: "10px", marginBottom: "12px" }}>
              <button 
                onClick={() => setActiveScoreTab("match1")}
                style={{ flex: 1, padding: "5px 8px", fontSize: "11px", borderRadius: "4px", border: "1px solid var(--border-color)", background: activeScoreTab === "match1" ? "var(--accent-orange)" : "transparent", color: activeScoreTab === "match1" ? "white" : "var(--text-primary)", fontWeight: "bold", cursor: "pointer" }}
              >
                IND vs PAK
              </button>
              <button 
                onClick={() => setActiveScoreTab("match2")}
                style={{ flex: 1, padding: "5px 8px", fontSize: "11px", borderRadius: "4px", border: "1px solid var(--border-color)", background: activeScoreTab === "match2" ? "var(--accent-orange)" : "transparent", color: activeScoreTab === "match2" ? "white" : "var(--text-primary)", fontWeight: "bold", cursor: "pointer" }}
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
                <div style={{ fontSize: "12px", color: "#10b981", fontWeight: "700" }}>India won by 4 runs!</div>
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
                <div style={{ fontSize: "12px", color: "#fbbf24", fontWeight: "700" }}>CSK won by 7 wickets!</div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderTechSection = (titleEn) => {
    const tStories = getStoriesOrFallback(filteredTech, 3);
    if (tStories.length === 0) return null;

    return (
      <div style={{ marginBottom: "40px" }}>
        <div className="section-headline-bar">
          <h2 className="section-title-premium">
            <FaMobileAlt style={{ color: "var(--accent-orange)" }} /> {titleEn || "Technology"}
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
                {story.title || story.titleTa}
              </h4>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderBusinessSection = (titleEn) => {
    const bStories = getStoriesOrFallback(filteredBusiness, 3);
    if (bStories.length === 0) return null;

    return (
      <div style={{ marginBottom: "40px" }}>
        <div className="section-headline-bar">
          <h2 className="section-title-premium">
            <FaBriefcase style={{ color: "var(--accent-orange)" }} /> {titleEn || "Business"}
          </h2>
          <span className="section-see-all" onClick={() => navigate("/business")} style={{ color: "var(--accent-orange)" }}>
            Business <FaChevronRight size={10} />
          </span>
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
                  {story.title || story.titleTa}
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


  const renderShortsSection = (titleEn) => {
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
          <h2 className="section-title-premium">
            <FaMobileAlt style={{ color: "var(--accent-orange)", marginRight: "8px" }} /> {titleEn || "Shorts"}
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

  const renderPhotosSection = (titleEn) => {
    if (photoStories.length === 0) return null;

    return (
      <div style={{ marginBottom: "40px" }}>
        <div className="section-headline-bar">
          <h2 className="section-title-premium">
            <FaImage style={{ color: "var(--accent-orange)", marginRight: "8px" }} /> {titleEn || "Photo Stories"}
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
                <FaImage size={10} /> {(story.images || []).length} images
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

  const renderEditorsPicksSection = (titleEn) => {
    if (resolvedEditorPicks.length === 0) return null;

    return (
      <div style={{ marginBottom: "40px" }}>
        <div className="section-headline-bar">
          <h2 className="section-title-premium">
            <FaRegLightbulb style={{ color: "var(--accent-orange)", marginRight: "8px" }} /> {titleEn || "Editor's Picks"}
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
                <span style={{ fontSize: "11px", fontWeight: "bold", textTransform: "uppercase", color: "var(--accent-orange)" }}>Editor's Recommendation</span>
                <p style={{ margin: "10px 0 0 0", fontFamily: "var(--font-serif)", fontSize: "1rem", fontWeight: "700", lineHeight: "1.4", color: "var(--text-primary)" }}>
                  "{article.title || article.titleTa}"
                </p>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "15px", borderTop: "1px solid var(--border-color)", paddingTop: "10px" }}>
                <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Newsghuru Editorial</span>
                <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>✏️</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderSidebarWidget = (widget) => {
    if (!widget.isEnabled) return null;

    switch (widget.id) {
      case "ad1":
        return (
          <div key={widget.id} className="premium-widget-card" style={{ padding: "12px" }}>
            <AdZone position="SIDEBAR" />
          </div>
        );
      case "ad2":
        return (
          <div key={widget.id} className="premium-widget-card" style={{ padding: "12px" }}>
            <AdZone position="SIDEBAR" />
          </div>
        );
      case "ad3":
        return (
          <div key={widget.id} className="premium-widget-card sticky-ad-wrapper" style={{ position: "sticky", top: "80px", padding: "12px", zIndex: 10 }}>
            <AdZone position="SIDEBAR" />
          </div>
        );
      case "ad4":
        return (
          <div key={widget.id} className="premium-widget-card" style={{ padding: "12px" }}>
            <AdZone position="SIDEBAR" />
          </div>
        );
      case "trending":
        return renderTrendingWidget(widget.titleEn || widget.titleTa || "Trending News");
      case "mostRead":
        return renderMostReadWidget(widget.titleEn || widget.titleTa || "Most Read");
      case "shorts":
        return null;
      case "cinema":
        return renderSidebarCinemaWidget(widget.titleEn || widget.titleTa || "Cinema News");
      case "weather":
        return null;
      case "rates":
        return null;
      case "poll":
        return renderPollWidget();
      case "score":
        return renderScoreWidget();
      default:
        return null;
    }
  };

  const renderTrendingWidget = (title) => {
    const list = homepageConfig?.trendingStories || filteredBreaking.slice(0, 5);
    if (!list || list.length === 0) return null;

    return (
      <div key="trending" className="premium-widget-card" style={{ padding: "20px" }}>
        <h3 className="widget-title-serif" style={{ marginTop: 0, marginBottom: "15px", display: "flex", alignItems: "center", gap: "8px" }}>
          <span>🔥</span> {title}
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {list.slice(0, 5).map((story, index) => {
            const rank = index + 1 < 10 ? `0${index + 1}` : index + 1;
            return (
              <div 
                key={story._id}
                onClick={() => navigate(`/news/${story._id}`, { state: story })}
                style={{ display: "flex", gap: "15px", cursor: "pointer", borderBottom: index < 4 ? "1px solid var(--border-color)" : "none", paddingBottom: "10px", transition: "transform 0.2s" }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = "translateX(4px)";
                  const headline = e.currentTarget.querySelector(".trending-headline");
                  if (headline) headline.style.color = "var(--accent-orange)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = "translateX(0)";
                  const headline = e.currentTarget.querySelector(".trending-headline");
                  if (headline) headline.style.color = "var(--text-primary)";
                }}
              >
                <span style={{ fontSize: "1.6rem", fontWeight: "900", color: "var(--accent-orange)", fontFamily: "var(--font-serif)", lineHeight: "1" }}>
                  {rank}
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", gap: "6px", alignItems: "center", marginBottom: "4px" }}>
                    <span style={{ fontSize: "10px", padding: "2px 6px", background: "rgba(245, 158, 11, 0.08)", color: "var(--accent-orange)", borderRadius: "4px", fontWeight: "bold" }}>
                      {getCategoryLabel(story.category)}
                    </span>
                    <span style={{ fontSize: "10px", color: "var(--text-muted)", fontWeight: "600" }}>
                      <RelativeTime createdAt={story.createdAt} fallback={story.time} />
                    </span>
                  </div>
                  <h4 className="trending-headline" style={{ fontSize: "0.9rem", fontWeight: "700", margin: 0, lineHeight: "1.4", color: "var(--text-primary)" }}>
                    {story.title || story.titleTa}
                  </h4>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderMostReadWidget = (title) => {
    const sorted = [...allNews]
      .filter(n => n.status === "published")
      .map(n => ({
        ...n,
        viewNum: parseInt(n.views) || 0
      }))
      .filter(n => n.viewNum >= (homepageConfig?.mostReadSettings?.minViews || 0))
      .sort((a, b) => b.viewNum - a.viewNum);

    const limit = homepageConfig?.mostReadSettings?.limit || 5;
    const showViews = homepageConfig?.mostReadSettings?.showViews !== false;
    const list = sorted.slice(0, limit);

    if (list.length === 0) return null;

    const formatViews = (num) => {
      if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
      return num.toString();
    };

    return (
      <div key="mostRead" className="premium-widget-card" style={{ padding: "20px" }}>
        <h3 className="widget-title-serif" style={{ marginTop: 0, marginBottom: "15px", display: "flex", alignItems: "center", gap: "8px" }}>
          <span>📈</span> {title}
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {list.map((story, index) => {
            return (
              <div 
                key={story._id}
                onClick={() => navigate(`/news/${story._id}`, { state: story })}
                style={{ display: "flex", gap: "10px", cursor: "pointer", borderBottom: index < list.length - 1 ? "1px solid var(--border-color)" : "none", paddingBottom: "10px" }}
                onMouseOver={(e) => {
                  const headline = e.currentTarget.querySelector(".mostread-headline");
                  if (headline) headline.style.color = "var(--accent-orange)";
                }}
                onMouseOut={(e) => {
                  const headline = e.currentTarget.querySelector(".mostread-headline");
                  if (headline) headline.style.color = "var(--text-primary)";
                }}
              >
                <img 
                  src={story.image || story.coverImage} 
                  alt={story.title} 
                  style={{ width: "65px", height: "50px", objectFit: "cover", borderRadius: "6px" }} 
                />
                <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                  <h4 className="mostread-headline" style={{ fontSize: "0.85rem", fontWeight: "700", margin: 0, lineHeight: "1.35", color: "var(--text-primary)", display: "-webkit-box", WebkitLineClamp: "2", WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                    {story.title || story.titleTa}
                  </h4>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "4px" }}>
                    <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>
                      <RelativeTime createdAt={story.createdAt} fallback={story.time} />
                    </span>
                    {showViews && (
                      <span style={{ fontSize: "10px", background: "rgba(245, 158, 11, 0.08)", color: "var(--accent-orange)", padding: "2px 6px", borderRadius: "4px", fontWeight: "bold" }}>
                        {formatViews(story.viewNum)} Views
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderSidebarCinemaWidget = (title) => {
    const list = cinemaNews.slice(0, 3);
    if (list.length === 0) return null;

    return (
      <div key="cinema-sidebar" className="premium-widget-card" style={{ padding: "20px" }}>
        <h3 className="widget-title-serif" style={{ marginTop: 0, marginBottom: "15px", display: "flex", alignItems: "center", gap: "8px" }}>
          <span>🎬</span> {title}
        </h3>
        
        <div 
          onClick={() => navigate(`/news/${list[0]._id}`, { state: list[0] })}
          style={{ position: "relative", borderRadius: "8px", overflow: "hidden", height: "140px", cursor: "pointer", marginBottom: "12px", border: "1px solid var(--border-color)" }}
        >
          <img src={list[0].image} alt={list[0].title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "8px 12px", background: "linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%)", color: "white" }}>
            <h4 style={{ fontSize: "0.8rem", fontWeight: "bold", margin: 0, textShadow: "1px 1px 2px rgba(0,0,0,0.8)" }}>{list[0].title || list[0].titleTa}</h4>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {list.slice(1).map(story => (
            <div 
              key={story._id}
              onClick={() => navigate(`/news/${story._id}`, { state: story })}
              style={{ display: "flex", gap: "10px", cursor: "pointer", alignItems: "center" }}
            >
              <img src={story.image} alt={story.title} style={{ width: "70px", height: "45px", objectFit: "cover", borderRadius: "4px", flexShrink: 0 }} />
              <h5 style={{ fontSize: "0.8rem", fontWeight: "700", margin: 0, color: "var(--text-primary)", display: "-webkit-box", WebkitLineClamp: "2", WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                {story.title || story.titleTa}
              </h5>
            </div>
          ))}
        </div>

        <button 
          onClick={() => navigate("/cinema")}
          style={{ width: "100%", marginTop: "12px", padding: "8px", background: "none", border: "1px solid var(--accent-orange)", color: "var(--accent-orange)", borderRadius: "6px", fontSize: "0.78rem", fontWeight: "bold", cursor: "pointer" }}
        >
          View All Cinema News
        </button>
      </div>
    );
  };

  const renderPollWidget = () => {
    return (
      <div key="poll" className="premium-widget-card" style={{ padding: "20px" }}>
        <h3 className="widget-title-serif" style={{ marginTop: 0, marginBottom: "15px" }}>
          📊 Opinion Poll
        </h3>
        <div style={{ fontSize: "0.85rem" }}>
          <p style={{ fontWeight: "700", marginBottom: "12px", color: "var(--text-primary)" }}>Is online education suitable for students?</p>
          {activePollVote === null ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <button 
                onClick={() => setActivePollVote("yes")}
                style={{ width: "100%", padding: "8px", background: "var(--bg-hover)", border: "1px solid var(--border-color)", borderRadius: "4px", color: "var(--text-primary)", cursor: "pointer", textAlign: "left", fontSize: "0.82rem" }}
              >
                Yes, highly suitable
              </button>
              <button 
                onClick={() => setActivePollVote("no")}
                style={{ width: "100%", padding: "8px", background: "var(--bg-hover)", border: "1px solid var(--border-color)", borderRadius: "4px", color: "var(--text-primary)", cursor: "pointer", textAlign: "left", fontSize: "0.82rem" }}
              >
                No, direct education is better
              </button>
            </div>
          ) : (
            <div>
              <div style={{ marginBottom: "8px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                  <span>Yes</span>
                  <span style={{ fontWeight: "700" }}>34%</span>
                </div>
                <div style={{ width: "100%", height: "8px", background: "var(--border-color)", borderRadius: "4px", overflow: "hidden" }}>
                  <div style={{ width: "34%", height: "100%", background: "var(--accent-orange)" }}></div>
                </div>
              </div>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                  <span>No</span>
                  <span style={{ fontWeight: "700" }}>66%</span>
                </div>
                <div style={{ width: "100%", height: "8px", background: "var(--border-color)", borderRadius: "4px", overflow: "hidden" }}>
                  <div style={{ width: "66%", height: "100%", background: "var(--accent-orange)" }}></div>
                </div>
              </div>
              <p style={{ fontSize: "0.75rem", color: "#10b981", marginTop: "10px", fontWeight: "700" }}>Thank you for voting!</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderScoreWidget = () => {
    return (
      <div key="score" className="premium-widget-card" style={{ padding: "20px" }}>
        <h4 style={{ margin: "0 0 10px 0", borderBottom: "1px solid var(--border-color)", paddingBottom: "8px", fontSize: "0.95rem", color: "var(--accent-orange)", fontWeight: "800" }}>
          Sports Scoreboard 🏆
        </h4>
        <div style={{ display: "flex", gap: "10px", marginBottom: "12px" }}>
          <button 
            onClick={() => setActiveScoreTab("match1")}
            style={{ flex: 1, padding: "5px 8px", fontSize: "11px", borderRadius: "4px", border: "1px solid var(--border-color)", background: activeScoreTab === "match1" ? "var(--accent-orange)" : "transparent", color: activeScoreTab === "match1" ? "white" : "var(--text-primary)", fontWeight: "bold", cursor: "pointer" }}
          >
            IND vs PAK
          </button>
          <button 
            onClick={() => setActiveScoreTab("match2")}
            style={{ flex: 1, padding: "5px 8px", fontSize: "11px", borderRadius: "4px", border: "1px solid var(--border-color)", background: activeScoreTab === "match2" ? "var(--accent-orange)" : "transparent", color: activeScoreTab === "match2" ? "white" : "var(--text-primary)", fontWeight: "bold", cursor: "pointer" }}
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
            <div style={{ fontSize: "12px", color: "#10b981", fontWeight: "700" }}>India won by 4 runs!</div>
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
            <div style={{ fontSize: "12px", color: "#fbbf24", fontWeight: "700" }}>CSK won by 7 wickets!</div>
          </div>
        )}
      </div>
    );
  };

  const renderSectionById = (id, titleEn) => {
    switch (id) {
      case "breaking":
        return renderBreakingNewsBar(titleEn);
      case "latest":
        return renderLatestNewsSection(titleEn);
      case "politics":
        return renderPoliticsSection(titleEn);
      case "cinema":
        return renderCinemaSection(titleEn);
      case "sports":
        return renderSportsSection(titleEn);
      case "tech":
        return renderTechSection(titleEn);
      case "business":
        return renderBusinessSection(titleEn);
      case "tamil":
        return renderTamilSection(titleEn);
      case "shorts":
        return renderShortsSection(titleEn);
      case "photos":
        return renderPhotosSection(titleEn);
      case "editors":
        return renderEditorsPicksSection(titleEn);
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
        if (sec.id === "breaking") return <div key={sec.id}>{renderBreakingNewsBar(sec.titleEn)}</div>;
        if (sec.id === "hero") return <div key={sec.id}>{renderHeroSection()}</div>;
        return null;
      })}

      <AdZone position="SECTION_BANNER" />

      {/* Two-Column Body Grid */}
      <div style={isLargeScreen ? { display: "grid", gridTemplateColumns: "1fr 320px", gap: "30px", alignItems: "start", marginTop: "20px" } : { display: "flex", flexDirection: "column", gap: "30px", marginTop: "20px" }}>
        
        {/* Left Column: All other categories loaded in dynamic order */}
        <div ref={leftRef} style={{ minWidth: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
          {activeSections.map(sec => {
            if (sec.id !== "breaking" && sec.id !== "hero") {
              return <div key={sec.id}>{renderSectionById(sec.id, sec.titleEn)}</div>;
            }
            return null;
          })}
        </div>

        {/* Right Column: Dynamic Sidebar with ads & widgets */}
        <aside style={{ 
          display: "flex", 
          flexDirection: "column", 
          gap: "25px", 
          width: isLargeScreen ? "320px" : "100%",
          minWidth: isLargeScreen ? "320px" : "100%"
        }}>
          <div ref={sidebarBaseRef} style={{ display: "flex", flexDirection: "column", gap: "25px" }}>
            {/* Go Premium promotion card */}
            {(!token || !readerData?.isPremium) && (
              <motion.div 
                className="premium-widget go-premium-promo-widget" 
                style={{ 
                  padding: "24px 20px", 
                  borderRadius: "12px", 
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
                <h3 style={{ margin: "0 0 10px 0", fontSize: "1.3rem", fontWeight: "900", fontFamily: "var(--font-serif)" }}>Newsghuru Premium 👑</h3>
                <p style={{ margin: "0 0 18px 0", fontSize: "0.85rem", opacity: "0.9", lineHeight: "1.4" }}>Subscribe now for a seamless, completely ad-free news reading experience!</p>
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
                }}>Join Now &rarr;</button>
              </motion.div>
            )}

            {/* Render dynamic sidebar widgets sorted by order */}
            {homepageConfig?.sidebarWidgets && homepageConfig.sidebarWidgets.length > 0 ? (
              [...homepageConfig.sidebarWidgets]
                .sort((a, b) => a.order - b.order)
                .map(widget => renderSidebarWidget(widget))
            ) : (
              // Fallback default sidebar widgets if homepageConfig isn't loaded/migrated
              <>
                <div className="premium-widget-card" style={{ padding: "12px" }}>
                  <AdZone position="SIDEBAR" />
                </div>
                {renderTrendingWidget("Trending News")}
                <div className="premium-widget-card" style={{ padding: "12px" }}>
                  <AdZone position="SIDEBAR" />
                </div>
                {renderMostReadWidget("Most Read")}
                <div className="premium-widget-card sticky-ad-wrapper" style={{ position: "sticky", top: "80px", padding: "12px", zIndex: 10 }}>
                  <AdZone position="SIDEBAR" />
                </div>
                <div className="premium-widget-card" style={{ padding: "12px" }}>
                  <AdZone position="SIDEBAR" />
                </div>
                {renderSidebarCinemaWidget("Cinema News")}
              </>
            )}
          </div>

          {/* Dynamically appended extra ads based on page height */}
          {isLargeScreen && Array.from({ length: extraAdsCount }).map((_, idx) => (
            <div key={`extra-ad-${idx}`} className="premium-widget-card" style={{ padding: "12px" }}>
              <AdZone position="SIDEBAR" />
            </div>
          ))}
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
                  style={{
                    background: "rgba(0, 0, 0, 0.6)",
                    border: "none",
                    color: "white",
                    cursor: "pointer",
                    fontSize: "18px",
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.3)",
                    transition: "background 0.2s"
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(0, 0, 0, 0.8)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(0, 0, 0, 0.6)"; }}
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

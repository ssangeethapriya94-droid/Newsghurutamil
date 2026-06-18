import React, { useEffect, useState } from "react";
import API from "../config/api";
import RelativeTime from "../components/RelativeTime";
import AdZone from "../components/AdZone";
import PopupAd from "../components/PopupAd";
import { 
  FaBolt, FaFire, FaMapMarkedAlt, FaFlag, FaGlobe, FaFutbol, 
  FaBriefcase, FaFilm, FaGraduationCap, FaLandmark, FaHeart, 
  FaBookmark, FaShareAlt, FaPlay, FaImage, FaChevronRight, 
  FaStar, FaCloudSun, FaArrowUp, FaArrowDown, FaMobileAlt,
  FaRegLightbulb
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import useSEO from "../hooks/useSEO";

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

  // News states
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

  // Feed states for infinite scroll / pagination
  const [visibleFeedCount, setVisibleFeedCount] = useState(6);
  const [likedArticles, setLikedArticles] = useState({});
  const [bookmarkedArticles, setBookmarkedArticles] = useState({});
  const [activePollVote, setActivePollVote] = useState(null);

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

      const response = await API.get("/api/news/published");
      const allPublished = response.data || [];
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

  // Fallbacks to keep layouts fully populated with beautiful digital news
  const getStoriesOrFallback = (list, count = 4) => {
    if (list && list.length > 0) return list.slice(0, count);
    return filteredAll.slice(0, count);
  };

  // Above the Fold stories
  const heroStory = filteredBreaking[0] || filteredAll[0];
  const secondaryStories = getStoriesOrFallback(filteredBreaking.slice(1), 4);
  const trendingStories = filteredAll.slice(0, 5);

  // Like action handler
  const handleLike = (article, e) => {
    e.stopPropagation();
    const id = article._id;
    const isLiked = likedArticles[id];
    const newLikes = { ...likedArticles, [id]: !isLiked };
    setLikedArticles(newLikes);
    localStorage.setItem("newsLikes", JSON.stringify(newLikes));
  };

  // Bookmark action handler
  const handleBookmark = (article, e) => {
    e.stopPropagation();
    const id = article._id;
    const isBookmarked = bookmarkedArticles[id];
    const newBookmarks = { ...bookmarkedArticles, [id]: !isBookmarked };
    setBookmarkedArticles(newBookmarks);
    
    // Update local storage arrays
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

  // Share action handler
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

  // News Card Sub-Component
  const renderNewsCard = (article) => {
    if (!article) return null;
    const isLiked = likedArticles[article._id];
    const isBookmarked = bookmarkedArticles[article._id];
    const words = stripHtml(article.description || "").split(/\s+/).length;
    const viewCount = article.views && article.views !== "0" ? article.views : Math.floor(180 + (article.title.length * 6));

    return (
      <div 
        key={article._id} 
        className="premium-card"
        onClick={() => navigate(`/news/${article._id}`, { state: article })}
      >
        <div className="card-media-box" style={{ height: "190px" }}>
          <img src={article.image || article.coverImage} alt={article.titleTa || article.title} />
          <div className="card-gradient-overlay"></div>
          <span className="card-cat-badge">{getCategoryLabel(article.category)}</span>
          <div className="card-info-overlay">
            <span>👁 {viewCount} வியூஸ்</span>
            <span>⏱ {getReadingTime(article.description)}</span>
          </div>
        </div>
        <div className="card-body-content">
          <div>
            <h3 className="card-headline line-clamp-2" style={{ fontSize: "1.05rem" }}>
              {article.titleTa || article.title}
            </h3>
            <p className="card-excerpt line-clamp-2">
              {stripHtml(article.shortDescription || article.description).slice(0, 100)}...
            </p>
          </div>
          <div className="card-bottom-actions">
            <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", fontWeight: "500" }}>
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
      </div>
    );
  };

  if (loading) {
    return (
      <div className="home-user-loader" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
        <div className="loader-spinner" style={{ border: "4px solid var(--border-color)", borderTop: "4px solid var(--accent-orange)", borderRadius: "50%", width: "40px", height: "40px", animation: "spin 1s linear infinite" }}></div>
        <h2 style={{ fontFamily: "var(--font-serif)", marginTop: "20px" }}>செய்திகளை ஏற்றுகிறது...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="home-user-error" style={{ textAlign: "center", padding: "50px 20px" }}>
        <h2>{error}</h2>
        <button onClick={() => fetchAll()} style={{ marginTop: "15px", background: "var(--brand-gradient)", border: "none", color: "#fff", padding: "8px 18px", borderRadius: "4px", cursor: "pointer" }}>மீண்டும் முயற்சிக்கவும்</button>
      </div>
    );
  }

  return (
    <section className="home-user-page" style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 15px 30px 15px" }}>
      <PopupAd />
      <AdZone position="TOP_BANNER" />

      {/* =========================================
         ABOVE THE FOLD SECTION (60/20/20 Layout)
      ========================================= */}
      <div className="above-fold-container">
        {/* Left 60%: Large Hero Card */}
        {heroStory ? (
          <div 
            className="premium-card hero-main-banner"
            onClick={() => navigate(`/news/${heroStory._id}`, { state: heroStory })}
          >
            <div className="card-media-box" style={{ height: "100%" }}>
              <img src={heroStory.image || heroStory.coverImage} alt={heroStory.titleTa || heroStory.title} />
              <div className="card-gradient-overlay" style={{ height: "100%", background: "linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.1) 100%)" }}></div>
              <span className="card-cat-badge" style={{ top: "20px", left: "20px" }}>{getCategoryLabel(heroStory.category)}</span>
              
              <div style={{ position: "absolute", bottom: "24px", left: "24px", right: "24px", zIndex: 10, color: "#fff" }}>
                <span style={{ fontSize: "0.82rem", background: "var(--accent-red)", padding: "3px 8px", borderRadius: "3px", fontWeight: "700", display: "inline-flex", alignItems: "center", gap: "4px", marginBottom: "12px" }}>
                  <FaBolt /> பிரேக்கிங் செய்தி
                </span>
                <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "1.9rem", fontWeight: "800", lineHeight: "1.25", marginBottom: "10px" }}>
                  {heroStory.titleTa || heroStory.title}
                </h2>
                <p style={{ fontSize: "0.95rem", opacity: "0.85", display: "-webkit-box", WebkitLineClamp: "2", WebkitBoxOrient: "vertical", overflow: "hidden", marginBottom: "12px" }}>
                  {stripHtml(heroStory.shortDescription || heroStory.description)}
                </p>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.82rem", opacity: "0.8" }}>
                  <span>⏱ {getReadingTime(heroStory.description)}  •  <RelativeTime createdAt={heroStory.createdAt} fallback={heroStory.time} /></span>
                  <span>👁 {heroStory.views || "450"} வியூஸ்</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ background: "var(--bg-hover)", borderRadius: "var(--border-radius-md)", height: "480px" }}></div>
        )}

        {/* Center 20%: Stack of 4 Secondary Stories */}
        <div className="above-fold-center secondary-stack">
          <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1.1rem", borderBottom: "2px solid var(--border-color)", paddingBottom: "8px", margin: 0 }}>
            முக்கியப் பதிவுகள்
          </h3>
          {secondaryStories.map(story => (
            <div 
              key={story._id}
              className="secondary-story-card"
              onClick={() => navigate(`/news/${story._id}`, { state: story })}
            >
              <img src={story.image} alt={story.title} className="sec-card-img" />
              <div className="sec-card-info">
                <span style={{ fontSize: "0.72rem", color: "var(--accent-orange)", fontWeight: "700", textTransform: "uppercase" }}>
                  {getCategoryLabel(story.category)}
                </span>
                <h4 className="sec-card-title">{story.titleTa || story.title}</h4>
              </div>
            </div>
          ))}
        </div>

        {/* Right 20%: Stack of Widgets */}
        <div className="above-fold-right right-widget-stack">
          {/* Widget 1: Trending list */}
          <div className="premium-widget">
            <h3 className="widget-title-serif">டிரெண்டிங் <span>🔥</span></h3>
            <div className="trending-list">
              {trendingStories.map((story, index) => (
                <div 
                  key={story._id}
                  className="trending-list-item"
                  onClick={() => navigate(`/news/${story._id}`, { state: story })}
                >
                  <span className="trending-number">0{index + 1}</span>
                  <span className="trending-text">{story.titleTa || story.title}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Widget 2: Live updates feed */}
          <div className="premium-widget">
            <h3 className="widget-title-serif">நேரலைத் தகவல்கள் <span className="live-dot"></span></h3>
            <div className="live-updates-feed">
              <div className="live-update-item">
                <span className="live-update-time">10:30 AM</span>
                <span className="live-update-text">தமிழக அமைச்சரவைக் கூட்டம் இன்று கூடி விவாதிக்கிறது.</span>
              </div>
              <div className="live-update-item">
                <span className="live-update-time">10:15 AM</span>
                <span className="live-update-text">ஆபரணத் தங்கம் விலை சவரனுக்கு ரூ.120 குறைந்தது.</span>
              </div>
              <div className="live-update-item">
                <span className="live-update-time">09:40 AM</span>
                <span className="live-update-text">இஸ்ரோ புதிய விண்கலத் திட்ட அறிவிப்பை வெளியிட்டது.</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AdZone position="SECTION_BANNER" />

      {/* Main Two-Column Layout (Content left, Sidebar right) to prevent empty space and keep sidebar ads bounded */}
      <div style={isLargeScreen ? { display: "grid", gridTemplateColumns: "1fr 300px", gap: "30px", alignItems: "start", marginTop: "20px" } : { display: "flex", flexDirection: "column", gap: "30px", marginTop: "20px" }}>
        
        {/* Left Column - Main Content */}
        <div style={{ minWidth: 0, display: "flex", flexDirection: "column", gap: "30px" }}>

          {/* =========================================
             SECTION 1: TOP STORIES GRID
      ========================================= */}
      <div style={{ marginBottom: "40px" }}>
        <div className="section-headline-bar">
          <h2 className="section-title-premium">
            <FaFire style={{ color: "var(--accent-red)" }} /> முக்கிய செய்திகள்
          </h2>
          <span className="section-see-all" onClick={() => navigate("/latest-news")}>
            அனைத்தும் பார்க்க <FaChevronRight size={10} />
          </span>
        </div>

        <div className="top-stories-layout">
          <div className="top-stories-left">
            {filteredAll[1] && (
              <div 
                className="premium-card"
                onClick={() => navigate(`/news/${filteredAll[1]._id}`, { state: filteredAll[1] })}
                style={{ flex: 1 }}
              >
                <div className="card-media-box" style={{ height: "300px" }}>
                  <img src={filteredAll[1].image} alt={filteredAll[1].title} />
                  <div className="card-gradient-overlay"></div>
                  <span className="card-cat-badge">{getCategoryLabel(filteredAll[1].category)}</span>
                </div>
                <div className="card-body-content">
                  <h3 className="card-headline" style={{ fontSize: "1.3rem" }}>{filteredAll[1].titleTa || filteredAll[1].title}</h3>
                  <p className="card-excerpt line-clamp-3">{stripHtml(filteredAll[1].description)}</p>
                  <div className="card-bottom-actions">
                    <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                      <RelativeTime createdAt={filteredAll[1].createdAt} fallback={filteredAll[1].time} />
                    </span>
                    <span>⏱ {getReadingTime(filteredAll[1].description)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="top-stories-right">
            {filteredAll.slice(2, 5).map(article => (
              <div 
                key={article._id}
                style={{ display: "flex", gap: "15px", borderBottom: "1px solid var(--border-color)", paddingBottom: "15px", cursor: "pointer" }}
                onClick={() => navigate(`/news/${article._id}`, { state: article })}
              >
                <img src={article.image} alt={article.title} style={{ width: "120px", height: "85px", objectFit: "cover", borderRadius: "var(--border-radius-sm)" }} />
                <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "0.72rem", color: "var(--accent-orange)", fontWeight: "700" }}>{getCategoryLabel(article.category)}</span>
                  <h4 style={{ fontFamily: "var(--font-serif)", fontSize: "0.95rem", fontWeight: "700", color: "var(--text-primary)", display: "-webkit-box", WebkitLineClamp: "2", WebkitBoxOrient: "vertical", overflow: "hidden", margin: "4px 0" }}>
                    {article.titleTa || article.title}
                  </h4>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                    <RelativeTime createdAt={article.createdAt} fallback={article.time} />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* =========================================
         SECTION 2: LATEST NEWS INFINITE FEED
      ========================================= */}
      <div style={{ marginBottom: "40px" }}>
        <div className="section-headline-bar">
          <h2 className="section-title-premium">
            <FaRegLightbulb style={{ color: "var(--accent-orange)" }} /> சமீபத்திய செய்திகள்
          </h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "20px" }}>
          {filteredAll.slice(0, visibleFeedCount).map(article => renderNewsCard(article))}
        </div>
        {visibleFeedCount < filteredAll.length && (
          <div style={{ textAlign: "center", marginTop: "25px" }}>
            <button 
              onClick={() => setVisibleFeedCount(prev => prev + 6)}
              style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-color)", color: "var(--text-primary)", padding: "10px 24px", borderRadius: "var(--border-radius-md)", fontWeight: "600", cursor: "pointer", transition: "all 0.2s" }}
              onMouseOver={(e) => { e.target.style.background = "var(--accent-orange)"; e.target.style.color = "#fff"; }}
              onMouseOut={(e) => { e.target.style.background = "var(--bg-secondary)"; e.target.style.color = "var(--text-primary)"; }}
            >
              மேலும் செய்திகளை ஏற்றுக
            </button>
          </div>
        )}
      </div>

      <AdZone position="SECTION_BANNER" />

      {/* =========================================
         SECTION 3: TAMIL NADU NEWS LAYOUT
      ========================================= */}
      <div style={{ marginBottom: "40px" }}>
        <div className="section-headline-bar">
          <h2 className="section-title-premium">
            <FaMapMarkedAlt style={{ color: "#06b6d4" }} /> தமிழகச் செய்திகள்
          </h2>
          <span className="section-see-all" onClick={() => navigate("/tamil")}>
            தமிழகச் செய்திகள் <FaChevronRight size={10} />
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "25px" }}>
          {/* Featured TN story */}
          {getStoriesOrFallback(filteredTamil, 1)[0] && (
            <div 
              className="premium-card"
              onClick={() => navigate(`/news/${getStoriesOrFallback(filteredTamil, 1)[0]._id}`, { state: getStoriesOrFallback(filteredTamil, 1)[0] })}
            >
              <div className="card-media-box" style={{ height: "260px" }}>
                <img src={getStoriesOrFallback(filteredTamil, 1)[0].image} alt={getStoriesOrFallback(filteredTamil, 1)[0].title} />
                <div className="card-gradient-overlay"></div>
              </div>
              <div className="card-body-content">
                <h3 className="card-headline" style={{ fontSize: "1.25rem" }}>{getStoriesOrFallback(filteredTamil, 1)[0].titleTa || getStoriesOrFallback(filteredTamil, 1)[0].title}</h3>
                <p className="card-excerpt line-clamp-3">{stripHtml(getStoriesOrFallback(filteredTamil, 1)[0].description)}</p>
                <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                  <RelativeTime createdAt={getStoriesOrFallback(filteredTamil, 1)[0].createdAt} fallback={getStoriesOrFallback(filteredTamil, 1)[0].time} />
                </span>
              </div>
            </div>
          )}

          {/* TN Side Stories */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {getStoriesOrFallback(filteredTamil, 5).slice(1).map(article => (
              <div 
                key={article._id}
                style={{ display: "flex", gap: "15px", borderBottom: "1px solid var(--border-color)", paddingBottom: "12px", cursor: "pointer" }}
                onClick={() => navigate(`/news/${article._id}`, { state: article })}
              >
                <img src={article.image} alt={article.title} style={{ width: "100px", height: "75px", objectFit: "cover", borderRadius: "var(--border-radius-sm)" }} />
                <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                  <h4 style={{ fontFamily: "var(--font-serif)", fontSize: "0.95rem", fontWeight: "700", color: "var(--text-primary)", display: "-webkit-box", WebkitLineClamp: "2", WebkitBoxOrient: "vertical", overflow: "hidden", margin: "0 0 4px 0" }}>
                    {article.titleTa || article.title}
                  </h4>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                    <RelativeTime createdAt={article.createdAt} fallback={article.time} />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* =========================================
         SECTION 4: INDIA NEWS GRID
      ========================================= */}
      <div style={{ marginBottom: "40px" }}>
        <div className="section-headline-bar">
          <h2 className="section-title-premium">
            <FaFlag style={{ color: "#f97316" }} /> இந்தியச் செய்திகள்
          </h2>
          <span className="section-see-all" onClick={() => navigate("/india")}>
            அனைத்தும் பார்க்க <FaChevronRight size={10} />
          </span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "20px" }}>
          {getStoriesOrFallback(filteredIndia, 4).map(article => renderNewsCard(article))}
        </div>
      </div>

      {/* =========================================
         SECTION 5: WORLD NEWS MAGAZINE LAYOUT
      ========================================= */}
      <div style={{ marginBottom: "40px" }}>
        <div className="section-headline-bar">
          <h2 className="section-title-premium">
            <FaGlobe style={{ color: "#3b82f6" }} /> உலகச் செய்திகள்
          </h2>
          <span className="section-see-all" onClick={() => navigate("/world")}>
            அனைத்தும் பார்க்க <FaChevronRight size={10} />
          </span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "20px" }}>
          {getStoriesOrFallback(filteredWorld, 3).map(article => renderNewsCard(article))}
        </div>
      </div>

      {/* =========================================
         SECTION 6: CINEMA SECTION (Vikatan Style)
      ========================================= */}
      <div style={{ marginBottom: "40px", padding: "24px", background: "rgba(168, 85, 247, 0.04)", borderRadius: "var(--border-radius-md)", border: "1px solid rgba(168, 85, 247, 0.1)" }}>
        <div className="section-headline-bar" style={{ borderColor: "rgba(168, 85, 247, 0.2)" }}>
          <h2 className="section-title-premium" style={{ color: "#a855f7" }}>
            <FaFilm style={{ color: "#a855f7" }} /> சினிமா மற்றும் பொழுதுபோக்கு
          </h2>
          <span className="section-see-all" onClick={() => navigate("/cinema")} style={{ color: "#a855f7" }}>
            சினிமா செய்திகள் <FaChevronRight size={10} />
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "25px" }}>
          {/* Cinema banner */}
          {getStoriesOrFallback(filteredCinema, 1)[0] && (
            <div 
              className="premium-card"
              onClick={() => navigate(`/news/${getStoriesOrFallback(filteredCinema, 1)[0]._id}`, { state: getStoriesOrFallback(filteredCinema, 1)[0] })}
            >
              <div className="card-media-box" style={{ height: "280px" }}>
                <img src={getStoriesOrFallback(filteredCinema, 1)[0].image} alt="Cinema Banner" />
                <div className="card-gradient-overlay"></div>
                <div style={{ position: "absolute", bottom: "16px", left: "16px", zIndex: 10, color: "#fff" }}>
                  <span className="movie-rating"><FaStar /> 4.2 / 5 Movie Review</span>
                  <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1.4rem", margin: "8px 0 0 0" }}>{getStoriesOrFallback(filteredCinema, 1)[0].titleTa || getStoriesOrFallback(filteredCinema, 1)[0].title}</h3>
                </div>
              </div>
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <h4 style={{ fontFamily: "var(--font-serif)", color: "var(--text-primary)", fontSize: "1rem" }}>சினிமா விமர்சனங்கள் & செய்திகள்:</h4>
            {getStoriesOrFallback(filteredCinema, 4).slice(1).map(article => (
              <div 
                key={article._id}
                style={{ display: "flex", gap: "12px", borderBottom: "1px dashed var(--border-color)", paddingBottom: "10px", cursor: "pointer" }}
                onClick={() => navigate(`/news/${article._id}`, { state: article })}
              >
                <img src={article.image} alt={article.title} style={{ width: "90px", height: "65px", objectFit: "cover", borderRadius: "4px" }} />
                <div>
                  <h5 style={{ fontFamily: "var(--font-serif)", fontSize: "0.88rem", fontWeight: "700", margin: "0 0 4px 0", color: "var(--text-primary)" }}>{article.titleTa || article.title}</h5>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>விமர்சனம் & செய்திகள்</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* =========================================
         SECTION 7: SPORTS SECTION
      ========================================= */}
      <div style={{ marginBottom: "40px" }}>
        <div className="section-headline-bar">
          <h2 className="section-title-premium" style={{ color: "#10b981" }}>
            <FaFutbol style={{ color: "#10b981" }} /> விளையாட்டுச் செய்திகள்
          </h2>
          <span className="section-see-all" onClick={() => navigate("/sports")} style={{ color: "#10b981" }}>
            விளையாட்டு <FaChevronRight size={10} />
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "25px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            {getStoriesOrFallback(filteredSports, 2).map(article => renderNewsCard(article))}
          </div>

          {/* Cricket Scoreboard Widget */}
          <div className="premium-widget" style={{ borderColor: "#10b981", height: "fit-content" }}>
            <h3 className="widget-title-serif" style={{ borderLeftColor: "#10b981" }}>கிரிக்கெட் நேரலை 🏏</h3>
            <div style={{ background: "var(--bg-secondary)", borderRadius: "var(--border-radius-md)", padding: "12px", textAlign: "center", border: "1px solid var(--border-color)" }}>
              <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", margin: "0 0 8px 0" }}>T20 WORLD CUP - MATCH 42</p>
              <div style={{ display: "flex", justifyContent: "space-around", alignItems: "center", margin: "10px 0" }}>
                <div>
                  <span style={{ fontWeight: "700", display: "block" }}>IND</span>
                  <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>168/5 (20)</span>
                </div>
                <span style={{ fontSize: "0.8rem", color: "var(--accent-red)", fontWeight: "700" }}>VS</span>
                <div>
                  <span style={{ fontWeight: "700", display: "block" }}>PAK</span>
                  <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>165/8 (20)</span>
                </div>
              </div>
              <p style={{ margin: "10px 0 0 0", fontSize: "0.82rem", color: "#10b981", fontWeight: "700" }}>இந்தியா 3 ரன்கள் வித்தியாசத்தில் வெற்றி!</p>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================
         SECTION 8: BUSINESS SECTION
      ========================================= */}
      <div style={{ marginBottom: "40px" }}>
        <div className="section-headline-bar">
          <h2 className="section-title-premium" style={{ color: "#f59e0b" }}>
            <FaBriefcase style={{ color: "#f59e0b" }} /> வணிகம் & வர்த்தகம்
          </h2>
          <span className="section-see-all" onClick={() => navigate("/business")} style={{ color: "#f59e0b" }}>
            வணிகம் <FaChevronRight size={10} />
          </span>
        </div>

        {/* Stock / Rates ticker bar */}
        <div className="business-rates-bar">
          <div className="rate-chip">
            <span>BSE SENSEX:</span>
            <span className="rate-up">73,240.50 (+1.25%) <FaArrowUp /></span>
          </div>
          <div className="rate-chip">
            <span>NSE NIFTY:</span>
            <span className="rate-up">22,310.20 (+1.10%) <FaArrowUp /></span>
          </div>
          <div className="rate-chip">
            <span>தங்கம் (22K 1 கிராம்):</span>
            <span className="rate-down">₹7,230 (-₹15) <FaArrowDown /></span>
          </div>
          <div className="rate-chip">
            <span>பெட்ரோல் (லிட்டர்):</span>
            <span>₹102.63</span>
          </div>
          <div className="rate-chip">
            <span>டீசல் (லிட்டர்):</span>
            <span>₹94.24</span>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "20px" }}>
          {getStoriesOrFallback(filteredBusiness, 3).map(article => renderNewsCard(article))}
        </div>
      </div>

      {/* =========================================
         SECTION 9: TECHNOLOGY SECTION
      ========================================= */}
      <div style={{ marginBottom: "40px" }}>
        <div className="section-headline-bar">
          <h2 className="section-title-premium">
            <FaMobileAlt style={{ color: "var(--accent-orange)" }} /> தொழில்நுட்பம்
          </h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "20px" }}>
          {getStoriesOrFallback(filteredTech, 3).map(article => renderNewsCard(article))}
        </div>
      </div>

      {/* =========================================
         SECTION 10: VIDEO NEWS CAROUSEL
      ========================================= */}
      <div style={{ marginBottom: "40px" }}>
        <div className="section-headline-bar">
          <h2 className="section-title-premium" style={{ color: "var(--accent-red)" }}>
            <FaPlay style={{ color: "var(--accent-red)", marginRight: "8px" }} /> வீடியோ செய்திகள்
          </h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "20px" }}>
          {filteredAll.slice(0, 4).map((article, idx) => (
            <div 
              key={idx} 
              className="premium-card"
              onClick={() => navigate(`/news/${article._id}`, { state: article })}
            >
              <div className="video-card-hover">
                <img src={article.image} alt={article.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <div className="video-play-overlay">
                  <FaPlay />
                </div>
              </div>
              <div style={{ padding: "12px" }}>
                <h4 style={{ fontFamily: "var(--font-serif)", fontSize: "0.95rem", margin: 0, color: "var(--text-primary)", display: "-webkit-box", WebkitLineClamp: "2", WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                  {article.titleTa || article.title}
                </h4>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* =========================================
         SECTION 11: PHOTO STORIES GALLERY
      ========================================= */}
      <div style={{ marginBottom: "40px" }}>
        <div className="section-headline-bar">
          <h2 className="section-title-premium" style={{ color: "var(--accent-orange)" }}>
            <FaImage style={{ color: "var(--accent-orange)", marginRight: "8px" }} /> படக் காட்சியகம்
          </h2>
        </div>

        <div className="photo-gallery-grid">
          {filteredAll.slice(2, 6).map((article, idx) => (
            <div 
              key={idx} 
              className="gallery-card"
              onClick={() => navigate(`/news/${article._id}`, { state: article })}
            >
              <img src={article.image} alt={article.title} />
              <div className="gallery-overlay">
                <div className="gallery-title">{article.titleTa || article.title}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* =========================================
         SECTION 12: EDITOR'S PICKS
      ========================================= */}
      <div style={{ marginBottom: "40px" }}>
        <div className="section-headline-bar">
          <h2 className="section-title-premium">
            <FaRegLightbulb style={{ color: "var(--accent-orange)", marginRight: "8px" }} /> ஆசிரியர் தேர்வுகள் (Editor's Picks)
          </h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "20px" }}>
          {filteredAll.slice(1, 4).map(article => renderNewsCard(article))}
        </div>
      </div>

        </div>

        {/* Right Column - Sidebar (Houses all Sidebar Ads and widgets vertically next to main content, eliminating empty divider rows) */}
        <aside style={{ 
          display: "flex", 
          flexDirection: "column", 
          gap: "25px", 
          width: isLargeScreen ? "300px" : "100%",
          position: isLargeScreen ? "sticky" : "static", 
          top: isLargeScreen ? "20px" : "auto",
          minWidth: "300px"
        }}>
          {/* Sidebar Ad 1 */}
          <AdZone position="SIDEBAR" />

          {/* Go Premium Sidebar Promotion Banner */}
          {(!token || !readerData?.isPremium) && (
            <div 
              className="premium-widget go-premium-promo-widget" 
              style={{ 
                padding: "24px 20px", 
                borderRadius: "10px", 
                background: "linear-gradient(135deg, #ea580c 0%, #ca8a04 100%)", 
                color: "#ffffff",
                border: "none",
                boxShadow: "0 10px 15px -3px rgba(234, 88, 12, 0.25)",
                cursor: "pointer",
                textAlign: "center",
                transition: "transform 0.2s ease"
              }} 
              onClick={() => navigate("/subscribe")}
              onMouseOver={(e) => e.currentTarget.style.transform = "scale(1.02)"}
              onMouseOut={(e) => e.currentTarget.style.transform = "scale(1)"}
            >
              <h3 style={{ margin: "0 0 10px 0", fontSize: "1.3rem", fontWeight: "850", fontFamily: "var(--font-serif)", letterSpacing: "0.5px" }}>நியூஸ்குரு பிரீமியம் 👑</h3>
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
            </div>
          )}

          {/* Widget 1: Stock Market & Fuel Rates */}
          <div className="premium-widget" style={{ padding: "16px", borderRadius: "8px", border: "1px solid var(--border-color)", background: "var(--bg-secondary, #f8fafc)" }}>
            <h3 className="widget-title-serif" style={{ fontSize: "1.05rem", fontWeight: "700", borderBottom: "2px solid var(--border-color)", paddingBottom: "8px", marginTop: 0 }}>பங்குச் சந்தை & எரிபொருள் 📈</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.85rem", borderBottom: "1px solid var(--border-color)", paddingBottom: "8px" }}>
                <span style={{ fontWeight: 600 }}>BSE SENSEX:</span>
                <span style={{ color: "#10b981", fontWeight: 700, display: "flex", alignItems: "center", gap: "2px" }}>73,240.50 (+1.25%) <FaArrowUp size={10} /></span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.85rem", borderBottom: "1px solid var(--border-color)", paddingBottom: "8px" }}>
                <span style={{ fontWeight: 600 }}>NSE NIFTY:</span>
                <span style={{ color: "#10b981", fontWeight: 700, display: "flex", alignItems: "center", gap: "2px" }}>22,310.20 (+1.10%) <FaArrowUp size={10} /></span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.85rem", borderBottom: "1px solid var(--border-color)", paddingBottom: "8px" }}>
                <span style={{ fontWeight: 600 }}>தங்கம் (22K 1கி):</span>
                <span style={{ color: "#ef4444", fontWeight: 700, display: "flex", alignItems: "center", gap: "2px" }}>₹7,230 (-₹15) <FaArrowDown size={10} /></span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.85rem" }}>
                <span style={{ fontWeight: 600 }}>பெட்ரோல் (லி):</span>
                <span style={{ fontWeight: "700" }}>₹102.63</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.85rem" }}>
                <span style={{ fontWeight: 600 }}>டீசல் (லி):</span>
                <span style={{ fontWeight: "700" }}>₹94.24</span>
              </div>
            </div>
          </div>

          {/* Weather Widget */}
          <div className="premium-widget" style={{ padding: "16px", borderRadius: "8px", border: "1px solid var(--border-color)", background: "var(--bg-secondary, #f8fafc)" }}>
            <h3 className="widget-title-serif" style={{ fontSize: "1.05rem", fontWeight: "700", borderBottom: "2px solid var(--border-color)", paddingBottom: "8px", marginTop: 0 }}>வானிலை அறிக்கை <FaCloudSun /></h3>
            <div style={{ display: "flex", alignItems: "center", gap: "20px", marginTop: "12px" }}>
              <span style={{ fontSize: "2.5rem" }}>☀️</span>
              <div>
                <span style={{ fontSize: "1.4rem", fontWeight: "800", display: "block" }}>31°C</span>
                <span style={{ color: "var(--text-muted)", fontSize: "0.82rem", display: "block" }}>சென்னை, தமிழ்நாடு</span>
                <span style={{ color: "#10b981", fontSize: "0.78rem", display: "block", marginTop: "4px" }}>ஈரப்பதம்: 62%  |  காற்று: 14 km/h</span>
              </div>
            </div>
          </div>

          {/* Sidebar Ad 2 */}
          <AdZone position="SIDEBAR" />

          {/* Horoscope Widget */}
          <div className="premium-widget" style={{ padding: "16px", borderRadius: "8px", border: "1px solid var(--border-color)", background: "var(--bg-secondary, #f8fafc)" }}>
            <h3 className="widget-title-serif" style={{ fontSize: "1.05rem", fontWeight: "700", borderBottom: "2px solid var(--border-color)", paddingBottom: "8px", marginTop: 0 }}>இன்றைய இராசி பலன் 🌌</h3>
            <div className="horoscope-grid" style={{ marginTop: "12px" }}>
              <div className="horoscope-item" onClick={() => alert("மேஷம்: இன்று நன்மை கிட்டும்.")}><span className="horoscope-icon">♈</span><span>மேஷம்</span></div>
              <div className="horoscope-item" onClick={() => alert("ரிஷபம்: நிதானம் தேவை.")}><span className="horoscope-icon">♉</span><span>ரிஷபம்</span></div>
              <div className="horoscope-item" onClick={() => alert("மிதுனம்: வெற்றி உண்டாகும்.")}><span className="horoscope-icon">♊</span><span>மிதுனம்</span></div>
              <div className="horoscope-item" onClick={() => alert("கடகம்: வரவு கூடும்.")}><span className="horoscope-icon">♋</span><span>கடகம்</span></div>
              <div className="horoscope-item" onClick={() => alert("சிம்மம்: மகிழ்ச்சி கிட்டும்.")}><span className="horoscope-icon">♌</span><span>சிம்மம்</span></div>
              <div className="horoscope-item" onClick={() => alert("கன்னி: பாராட்டு கிடைக்கும்.")}><span className="horoscope-icon">♍</span><span>கன்னி</span></div>
              <div className="horoscope-item" onClick={() => alert("துலாம்: ஆதாயம் கிட்டும்.")}><span className="horoscope-icon">♎</span><span>துலாம்</span></div>
              <div className="horoscope-item" onClick={() => alert("விருச்சிகம்: தனவரவு உண்டு.")}><span className="horoscope-icon">♏</span><span>விருச்.</span></div>
            </div>
          </div>

          {/* Reader Poll Widget */}
          <div className="premium-widget" style={{ padding: "16px", borderRadius: "8px", border: "1px solid var(--border-color)", background: "var(--bg-secondary, #f8fafc)" }}>
            <h3 className="widget-title-serif" style={{ fontSize: "1.05rem", fontWeight: "700", borderBottom: "2px solid var(--border-color)", paddingBottom: "8px", marginTop: 0 }}>கருத்துக் கணிப்பு 📊</h3>
            <div style={{ fontSize: "0.85rem", marginTop: "12px" }}>
              <p style={{ fontWeight: "700", marginBottom: "12px", color: "var(--text-primary)" }}>இணைய வழிக் கல்வி மாணவர்களுக்கு உகந்ததா?</p>
              {activePollVote === null ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <button 
                    onClick={() => setActivePollVote("yes")}
                    style={{ width: "100%", padding: "8px", background: "var(--bg-hover, #f1f5f9)", border: "1px solid var(--border-color)", borderRadius: "4px", color: "var(--text-primary)", cursor: "pointer", textAlign: "left", fontSize: "0.82rem" }}
                  >
                    ஆம், மிகவும் உகந்தது
                  </button>
                  <button 
                    onClick={() => setActivePollVote("no")}
                    style={{ width: "100%", padding: "8px", background: "var(--bg-hover, #f1f5f9)", border: "1px solid var(--border-color)", borderRadius: "4px", color: "var(--text-primary)", cursor: "pointer", textAlign: "left", fontSize: "0.82rem" }}
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

          {/* Sidebar Ad 3 */}
          <AdZone position="SIDEBAR" />
        </aside>
      </div>

      <AdZone position="FLOATING_ADVERTISEMENT" />
    </section>
  );
};

export default Home;

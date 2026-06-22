import React, { useEffect, useState } from "react";
import API from "../config/api";
import RelativeTime from "../components/RelativeTime";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import useSEO from "../hooks/useSEO";
import AdZone from "../components/AdZone";

import {
  FaArrowLeft, FaFacebookF, FaTwitter, FaUserAlt,
  FaInstagram, FaYoutube, FaHeart, FaBookmark, FaShareAlt,
  FaPlus, FaCheck, FaEye, FaRegComment
} from "react-icons/fa";

const stripHtml = (html) => {
  if (!html) return "";
  const doc = new DOMParser().parseFromString(html, "text/html");
  return doc.body.textContent || "";
};

const NewsDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();

  const token = localStorage.getItem("readerToken");
  let readerData = null;
  try {
    const dataStr = localStorage.getItem("readerData");
    if (dataStr) readerData = JSON.parse(dataStr);
  } catch (e) {}

  const [news, setNews] = useState(location.state || null);
  const [loading, setLoading] = useState(!location.state);
  const [error, setError] = useState("");
  const [relatedNews, setRelatedNews] = useState([]);

  // Engagement states
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [likeCount, setLikeCount] = useState(24);
  const [viewCount, setViewCount] = useState(() => {
    // Initialize from state (article passed from navigation) if available
    const stateViews = location.state?.views;
    return stateViews ? parseInt(stateViews) || 0 : 0;
  });

  // Comments state
  const [comments, setComments] = useState([]);
  const [commentName, setCommentName] = useState("");
  const [commentText, setCommentText] = useState("");

  const currentUrl = window.location.href;

  useSEO({
    title: news ? (news.titleTa || news.title) : "செய்தி விவரங்கள்",
    description: news ? (news.shortDescription || news.description)?.substring(0, 160) : "செய்தி விவரங்கள் மற்றும் முழுமையான தகவல்கள்",
    keywords: news && (news.seoKeywords || news.keywords) ? (news.seoKeywords || news.keywords) : "தமிழ் செய்தி, செய்திகள், நியூஸ் குரு",
  });

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

  // Load article details
  useEffect(() => {
    const fetchNewsById = async () => {
      if (location.state) {
        setNews(location.state);
        return;
      }
      try {
        setLoading(true);
        setError("");
        const res = await API.get(`/api/news/${id}`);
        setNews(res.data || null);
      } catch (err) {
        console.error("News Details Error:", err);
        setError("செய்தி விவரங்களை ஏற்றுவதில் தோல்வி");
      } finally {
        setLoading(false);
      }
    };
    fetchNewsById();
  }, [id, location.state]);

  // Load related news & local user states (likes, bookmarks, comments)
  useEffect(() => {
    if (!news) return;

    // Related news
    API.get(`/api/news/category/${news.category.toLowerCase()}`)
      .then(res => {
        const list = res.data || [];
        setRelatedNews(list.filter(n => n._id !== news._id).slice(0, 3));
      })
      .catch(err => console.error("Error fetching related news", err));

    // Increment and fetch real views from backend
    API.put(`/api/news/${news._id}/view`)
      .then(res => {
        if (res.data && res.data.success) {
          setViewCount(res.data.views);
        } else {
          // Fallback to existing views value
          setViewCount(news.views ? parseInt(news.views) || 0 : 0);
        }
      })
      .catch(() => {
        // Fallback on error
        setViewCount(news.views ? parseInt(news.views) || 0 : 0);
      });

    // Likes count state
    setLikeCount(Math.floor(25 + (news.title.length % 7) * 4));

    // Bookmarks and likes checked status from LocalStorage
    const savedBookmarks = localStorage.getItem("newsBookmarks");
    if (savedBookmarks) {
      try {
        const parsed = JSON.parse(savedBookmarks);
        setIsBookmarked(parsed.some(item => item._id === news._id));
      } catch (e) {}
    }

    const savedLikes = localStorage.getItem("newsLikes");
    if (savedLikes) {
      try {
        const parsed = JSON.parse(savedLikes);
        setIsLiked(!!parsed[news._id]);
        if (parsed[news._id]) {
          setLikeCount(prev => prev + 1);
        }
      } catch (e) {}
    }

    // Follow topic state
    const followedTopics = localStorage.getItem("followedTopics");
    if (followedTopics) {
      try {
        const parsed = JSON.parse(followedTopics);
        setIsFollowing(parsed.includes(news.category));
      } catch (e) {}
    }

    // Comments load from LocalStorage
    const savedComments = localStorage.getItem(`comments_${news._id}`);
    if (savedComments) {
      try {
        setComments(JSON.parse(savedComments));
      } catch (e) {}
    } else {
      // Default sample comment
      setComments([
        {
          name: "செந்தில் குமார்",
          text: "அருமையான செய்தித் தொகுப்பு. தகவல்கள் தெளிவாக கொடுக்கப்பட்டுள்ளது.",
          date: new Date(Date.now() - 3600000).toLocaleString("ta-IN")
        }
      ]);
    }

  }, [news]);

  // Like action toggle
  const toggleLike = () => {
    const nextState = !isLiked;
    setIsLiked(nextState);
    setLikeCount(prev => nextState ? prev + 1 : prev - 1);
    
    let likesMap = {};
    const saved = localStorage.getItem("newsLikes");
    if (saved) {
      try { likesMap = JSON.parse(saved); } catch(e){}
    }
    likesMap[news._id] = nextState;
    localStorage.setItem("newsLikes", JSON.stringify(likesMap));
  };

  // Bookmark / Save For Later toggle
  const toggleBookmark = () => {
    const nextState = !isBookmarked;
    setIsBookmarked(nextState);

    let bookmarksList = [];
    const saved = localStorage.getItem("newsBookmarks");
    if (saved) {
      try { bookmarksList = JSON.parse(saved); } catch (e) {}
    }

    if (nextState) {
      bookmarksList.push(news);
    } else {
      bookmarksList = bookmarksList.filter(item => item._id !== news._id);
    }
    localStorage.setItem("newsBookmarks", JSON.stringify(bookmarksList));
  };

  // Follow Topic toggle
  const toggleFollow = () => {
    const nextState = !isFollowing;
    setIsFollowing(nextState);

    let followed = [];
    const saved = localStorage.getItem("followedTopics");
    if (saved) {
      try { followed = JSON.parse(saved); } catch (e) {}
    }

    if (nextState) {
      if (!followed.includes(news.category)) followed.push(news.category);
    } else {
      followed = followed.filter(c => c !== news.category);
    }
    localStorage.setItem("followedTopics", JSON.stringify(followed));
  };

  // Submit comment
  const handleSubmitComment = (e) => {
    e.preventDefault();
    if (!commentName.trim() || !commentText.trim()) return;

    const newComment = {
      name: commentName.trim(),
      text: commentText.trim(),
      date: new Date().toLocaleString("ta-IN")
    };

    const updated = [newComment, ...comments];
    setComments(updated);
    localStorage.setItem(`comments_${news._id}`, JSON.stringify(updated));

    setCommentName("");
    setCommentText("");
  };

  // Share action
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: news.titleTa || news.title,
        url: currentUrl
      }).catch(err => console.log(err));
    } else {
      navigator.clipboard.writeText(currentUrl);
      alert("செய்தி இணைப்பு நகலெடுக்கப்பட்டது (Link copied to clipboard!)");
    }
  };

  // In-article rendering with drop cap, pull quotes, and ads
  const renderInArticleContent = (htmlContent) => {
    if (!htmlContent) return "விவரங்கள் எதுவும் கிடைக்கவில்லை";
    
    const plainText = stripHtml(htmlContent);
    // Extrapolate a sentence for pull quote
    const sentences = plainText.split(/[.।]/).filter(s => s.trim().length > 15);
    const quoteSentence = sentences[Math.min(2, sentences.length - 1)] || "முக்கிய தகவல்கள் இந்த செய்தியில் கொடுக்கப்பட்டுள்ளது.";

    const paras = htmlContent.split("</p>");
    return (
      <div className="editorial-body">
        {paras.map((para, index) => {
          if (!para.trim()) return null;
          let paraHtml = para + "</p>";
          
          // Drop cap for first paragraph
          if (index === 0) {
            const tempDiv = document.createElement("div");
            tempDiv.innerHTML = paraHtml;
            const text = tempDiv.textContent || tempDiv.innerText || "";
            if (text.length > 0) {
              const firstLetter = text.charAt(0);
              const restText = text.slice(1);
              paraHtml = `<p><span style="float: left; font-size: 3.5rem; line-height: 0.85; font-weight: bold; margin-right: 8px; color: var(--accent-orange); font-family: var(--font-serif);">${firstLetter}</span>${restText}</p>`;
            }
          }

          return (
            <React.Fragment key={index}>
              <div dangerouslySetInnerHTML={{ __html: paraHtml }} style={{ marginBottom: "16px" }} />
              {index === 1 && <AdZone position="ARTICLE_ADVERTISEMENT" />}
              {index === 2 && (
                <blockquote className="premium-pull-quote">
                  “ {quoteSentence.trim()} ”
                </blockquote>
              )}
              {index === 4 && <AdZone position="ARTICLE_ADVERTISEMENT" />}
            </React.Fragment>
          );
        })}
      </div>
    );
  };

  const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth >= 1024);
  useEffect(() => {
    const handleResize = () => setIsLargeScreen(window.innerWidth >= 1024);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (loading) {
    return (
      <div className="news-not-found" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
        <h2>செய்திகளை ஏற்றுகிறது...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="news-not-found" style={{ textAlign: "center", padding: "50px 20px" }}>
        <h2>{error}</h2>
      </div>
    );
  }

  if (!news) {
    return (
      <div className="news-not-found" style={{ textAlign: "center", padding: "50px 20px" }}>
        <h2>செய்தி கிடைக்கவில்லை</h2>
      </div>
    );
  }

  return (
    <div className="news-details-page" style={{ maxWidth: "1200px", margin: "20px auto", padding: "0 15px 40px 15px" }}>
      
      {/* BACK BUTTON */}
      <button
        className="back-btn"
        onClick={() => navigate(-1)}
        style={{ display: "flex", alignItems: "center", gap: "8px", background: "none", border: "none", color: "var(--accent-orange)", cursor: "pointer", fontSize: "0.95rem", fontWeight: "700", marginBottom: "20px" }}
      >
        <FaArrowLeft /> பின்செல்ல
      </button>

      {/* =========================================
         EDITORIAL ARTICLE HEADER
      ========================================= */}
      <header className="article-editorial-header">
        <button className="card-cat-badge" style={{ position: "static", marginBottom: "12px" }}>
          {getCategoryLabel(news.category)}
        </button>

        <h1 className="article-headline">{news.titleTa || news.title}</h1>
        
        {news.subtitle && (
          <p className="article-subheadline">{news.subtitle}</p>
        )}

        <div className="author-profile-row">
          <div className="author-info-block">
            <div className="author-avatar-circle">
              <FaUserAlt size={16} />
            </div>
            <div className="author-meta-details">
              <span className="author-name-text">நியூஸ் குரு சிறப்பு செய்தியாளர்</span>
              <span className="author-date-text">
                வெளியிடப்பட்டது: <RelativeTime createdAt={news.createdAt} fallback={news.time} />
              </span>
            </div>
            <button className="follow-topic-btn" onClick={toggleFollow}>
              {isFollowing ? <><FaCheck size={10} /> ஃபாலோ செய்கிறீர்கள்</> : <><FaPlus size={10} /> ஃபாலோ செய்க</>}
            </button>
          </div>

          <div className="article-metrics-box">
            <span><FaEye /> {viewCount} பார்வைகள்</span>
          </div>
        </div>
      </header>

      {/* =========================================
         LAYOUT BODY (Content + Sidebar)
      ========================================= */}
      <div style={isLargeScreen ? { display: "grid", gridTemplateColumns: "1fr 300px", gap: "30px", alignItems: "start" } : { display: "flex", flexDirection: "column", gap: "30px" }}>
        
        <div className="details-content" style={{ padding: 0 }}>
          
          {/* HERO MAIN IMAGE */}
          <div className="details-image-wrapper" style={{ borderRadius: "var(--border-radius-md)", overflow: "hidden", marginBottom: "25px", boxShadow: "var(--shadow-color)" }}>
            <img
              src={news.image}
              alt={news.titleTa || news.title}
              className="details-image"
              style={{ width: "100%", maxHeight: "500px", objectFit: "cover" }}
              onError={(e) => {
                e.target.src = "https://placehold.co/1200x700?text=News+Image";
              }}
            />
          </div>

          {/* PARAGRAPH CONTENT */}
          <div className="details-section">
            {renderInArticleContent(news.fullDescriptionTa || news.fullDescription || news.description)}
          </div>

          {/* ADVERTISEMENT PLACEMENT */}
          <AdZone position="ARTICLE_ADVERTISEMENT" />

          {/* =========================================
             ENGAGEMENT BAR
          ========================================= */}
          <div className="article-interaction-bar">
            <div className="interact-btn-group">
              <button className={`interact-btn-action ${isLiked ? "active" : ""}`} onClick={toggleLike}>
                <FaHeart /> <span>{likeCount} லைக்</span>
              </button>
              <button className={`interact-btn-action ${isBookmarked ? "active" : ""}`} onClick={toggleBookmark}>
                <FaBookmark /> <span>{isBookmarked ? "சேமிக்கப்பட்டது" : "சேமிக்க"}</span>
              </button>
              <button className="interact-btn-action" onClick={handleShare}>
                <FaShareAlt /> <span>பகிர்க</span>
              </button>
            </div>
            <div style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
              <FaRegComment /> {comments.length} கருத்துகள்
            </div>
          </div>

          {/* =========================================
             COMMENTS SYSTEM
          ========================================= */}
          <div style={{ marginTop: "35px", borderBottom: "1px solid var(--border-color)", paddingBottom: "25px" }}>
            <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1.4rem", marginBottom: "20px" }}>கருத்துப் பெட்டி (Comments)</h3>
            
            <form onSubmit={handleSubmitComment} style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "25px" }}>
              <input 
                type="text" 
                placeholder="உங்கள் பெயர்"
                value={commentName}
                onChange={(e) => setCommentName(e.target.value)}
                style={{ width: "100%", padding: "10px 14px", background: "var(--bg-secondary)", border: "1px solid var(--border-color)", borderRadius: "var(--border-radius-sm)", color: "var(--text-primary)", outline: "none" }}
                required
              />
              <textarea 
                placeholder="கருத்துக்களைப் பகிருங்கள்..." 
                rows="4"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                style={{ width: "100%", padding: "12px 14px", background: "var(--bg-secondary)", border: "1px solid var(--border-color)", borderRadius: "var(--border-radius-sm)", color: "var(--text-primary)", outline: "none" }}
                required
              ></textarea>
              <button 
                type="submit" 
                style={{ alignSelf: "flex-start", background: "var(--brand-gradient)", color: "#fff", border: "none", padding: "10px 24px", borderRadius: "var(--border-radius-sm)", fontWeight: "600", cursor: "pointer" }}
              >
                பதிவிடுக
              </button>
            </form>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {comments.map((c, i) => (
                <div key={i} style={{ display: "flex", gap: "12px", background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: "var(--border-radius-md)", padding: "16px" }}>
                  <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "var(--bg-hover)", color: "var(--accent-orange)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700" }}>
                    {c.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h5 style={{ margin: "0 0 4px 0", fontSize: "0.9rem", color: "var(--text-primary)" }}>{c.name}</h5>
                    <p style={{ margin: "0 0 6px 0", fontSize: "0.85rem", color: "var(--text-secondary)" }}>{c.text}</p>
                    <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>{c.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* =========================================
             RELATED STORIES
          ========================================= */}
          {relatedNews.length > 0 && (
            <div style={{ marginTop: "35px" }}>
              <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1.4rem", color: "var(--text-primary)", margin: "0 0 15px 0" }}>தொடர்புடைய செய்திகள்</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px" }}>
                {relatedNews.map(item => (
                  <div 
                    key={item._id} 
                    style={{ cursor: "pointer", background: "var(--bg-card)", borderRadius: "var(--border-radius-md)", overflow: "hidden", border: "1px solid var(--border-color)", transition: "all 0.2s" }}
                    onClick={() => navigate(`/news/${item._id}`, { state: item })}
                  >
                    <img src={item.image} alt={item.title} style={{ width: "100%", height: "130px", objectFit: "cover" }} />
                    <div style={{ padding: "12px" }}>
                      <h4 style={{ margin: 0, fontFamily: "var(--font-serif)", fontSize: "0.92rem", lineClamp: "2", display: "-webkit-box", WebkitLineClamp: "2", WebkitBoxOrient: "vertical", overflow: "hidden", color: "var(--text-primary)" }}>
                        {item.titleTa || item.title}
                      </h4>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* SIDEBAR COL */}
        <div style={isLargeScreen ? { position: "sticky", top: "20px", display: "flex", flexDirection: "column", gap: "20px" } : { display: "flex", flexDirection: "column", gap: "20px" }}>
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
              <h3 style={{ margin: "0 0 10px 0", fontSize: "1.25rem", fontWeight: "850", fontFamily: "var(--font-serif)", letterSpacing: "0.5px" }}>நியூஸ்குரு பிரீமியம் 👑</h3>
              <p style={{ margin: "0 0 18px 0", fontSize: "0.82rem", opacity: "0.9", lineHeight: "1.4" }}>முழுமையான விளம்பரங்கள் இல்லாத தடையற்ற செய்தி வாசிப்பு அனுபவத்தை இப்போதே பெற சந்தா சேருங்கள்!</p>
              <button style={{ 
                background: "#ffffff", 
                color: "#ea580c", 
                border: "none", 
                padding: "8px 18px", 
                borderRadius: "25px", 
                fontWeight: "800", 
                fontSize: "0.8rem",
                cursor: "pointer",
                boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
              }}>இப்போது இணைவோம் &rarr;</button>
            </div>
          )}

          <AdZone position="SIDEBAR" />
        </div>

      </div>

      <AdZone position="FLOATING_ADVERTISEMENT" />
    </div>
  );
};

export default NewsDetails;
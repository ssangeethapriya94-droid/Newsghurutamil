import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../config/api";
import useSEO from "../hooks/useSEO";
import { FaPlay } from "react-icons/fa";
import AdZone from "../components/AdZone";

function TempleBlogsPage() {
  useSEO({
    title: "Temple Blogs | Historical Places & Spiritual Sites - NewsGhuru",
    description: "Discover the history, architecture, and spiritual significance of famous temples around the world.",
    keywords: "temple history, spiritual sites, temple blogs, famous temples, NewsGhuru spiritual",
  });

  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [spiritualVideos, setSpiritualVideos] = useState([]);
  const [playingVideoId, setPlayingVideoId] = useState(null);
  const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth >= 1024);
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => setIsLargeScreen(window.innerWidth >= 1024);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        const res = await API.get("/api/anmigam/temple-blogs?language=en");
        setBlogs(res.data || []);
      } catch (err) {
        console.error("Error loading temple blogs:", err);
      } finally {
        setLoading(false);
      }
    };
    const fetchVideos = async () => {
      try {
        const res = await API.get("/api/videos?category=anmigam&language=en");
        setSpiritualVideos(res.data || []);
      } catch (err) {
        console.error("Error loading spiritual videos:", err);
      }
    };
    fetchBlogs();
    fetchVideos();
  }, []);

  return (
    <div style={{ padding: "40px 5% 80px", maxWidth: "1200px", margin: "0 auto", minHeight: "80vh" }}>
      <AdZone position="TOP_BANNER" />
      <style>{`
        /* Redesigned Large Video Layout (At the bottom of the page) */
        .spiritual-video-section-large {
          max-width: 800px;
          margin: 10px auto 40px;
          border-top: 1px solid var(--border-color);
          padding-top: 40px;
          margin-top: 50px;
        }
        
        .spiritual-featured-video-container {
          width: 100%;
          margin-bottom: 24px;
          background: var(--bg-secondary);
          border-radius: 20px;
          overflow: hidden;
          border: 1px solid var(--border-color);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .spiritual-featured-video-container:hover {
          transform: translateY(-4px);
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
        }
        
        .spiritual-featured-video-player {
          position: relative;
          padding-bottom: 56.25%;
          height: 0;
          overflow: hidden;
          background-color: #000;
        }
        
        .spiritual-featured-video-player iframe {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border: none;
        }
        
        .spiritual-featured-video-info {
          padding: 24px;
        }
        
        .spiritual-featured-video-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: linear-gradient(90deg, #ef4444, #f97316);
          color: #ffffff;
          font-size: 0.8rem;
          font-weight: 700;
          padding: 4px 12px;
          border-radius: 20px;
          margin-bottom: 12px;
        }
        
        .spiritual-featured-video-title {
          font-size: 1.6rem;
          font-weight: 800;
          line-height: 1.4;
          margin: 0 0 10px 0;
          color: var(--text-primary);
        }
        
        .spiritual-featured-video-time {
          font-size: 0.9rem;
          color: #64748b;
        }
        
        /* Grid of other videos */
        .spiritual-video-grid-large {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 24px;
        }
        
        @media (max-width: 768px) {
          .spiritual-video-grid-large {
            grid-template-columns: 1fr;
          }
          .spiritual-featured-video-title {
            font-size: 1.3rem;
          }
        }
        
        .spiritual-video-card-large {
          display: flex;
          flex-direction: column;
          background: var(--bg-secondary);
          border-radius: 16px;
          overflow: hidden;
          border: 1px solid var(--border-color);
          transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
        }
        
        .spiritual-video-card-large:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.08);
          border-color: #f97316;
        }
        
        .spiritual-video-wrapper-large {
          position: relative;
          padding-bottom: 56.25%;
          height: 0;
          overflow: hidden;
          background-color: #000;
        }
        
        .spiritual-video-wrapper-large iframe {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border: none;
        }
        
        .spiritual-video-body-large {
          padding: 18px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          flex-grow: 1;
        }
        
        .spiritual-video-title-large {
          font-size: 1.1rem;
          font-weight: 700;
          margin: 0;
          line-height: 1.4;
          color: var(--text-primary);
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          height: 2.8em;
        }
        
        .spiritual-video-time-large {
          font-size: 0.85rem;
          color: #64748b;
        }
        
        /* Lazy loading elements */
        .spiritual-video-placeholder-large {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          cursor: pointer;
          overflow: hidden;
          background-color: #000;
          display: block;
        }
        
        .spiritual-video-placeholder-large img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }
        
        .spiritual-video-placeholder-large:hover img {
          transform: scale(1.05);
        }
        
        .spiritual-play-overlay-large {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.3s ease;
        }
        
        .spiritual-video-placeholder-large:hover .spiritual-play-overlay-large {
          background: rgba(0, 0, 0, 0.35);
        }
        
        .spiritual-play-btn-large {
          width: 68px;
          height: 68px;
          background: linear-gradient(135deg, #ef4444, #f97316);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          font-size: 1.5rem;
          box-shadow: 0 8px 24px rgba(239, 68, 68, 0.4);
          transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.3s ease;
          padding-left: 4px;
        }
        
        .spiritual-video-placeholder-large:hover .spiritual-play-btn-large {
          transform: scale(1.12);
          box-shadow: 0 12px 28px rgba(239, 68, 68, 0.6);
        }
        
        .spiritual-play-btn-small-large {
          width: 52px;
          height: 52px;
          background: linear-gradient(135deg, #ef4444, #f97316);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          font-size: 1.15rem;
          box-shadow: 0 6px 16px rgba(239, 68, 68, 0.4);
          transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.3s ease;
          padding-left: 3px;
        }
        
        .spiritual-video-placeholder-large:hover .spiritual-play-btn-small-large {
          transform: scale(1.12);
          box-shadow: 0 10px 20px rgba(239, 68, 68, 0.6);
        }
      `}</style>
      
      {/* Title Header */}
      <div style={{ textAlign: "center", marginBottom: "40px" }}>
        <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "2.4rem", color: "var(--text-primary)", marginBottom: "8px" }}>
          Temple Blogs
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "1.05rem" }}>
          Historical insights, architectural features, and worship guidelines for sacred sites.
        </p>
      </div>

      <div style={isLargeScreen ? { display: "grid", gridTemplateColumns: "1fr 300px", gap: "25px", alignItems: "start" } : { display: "flex", flexDirection: "column", gap: "25px" }}>
        {/* Left Column */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {loading ? (
            <div style={{ padding: "60px 0", textAlign: "center", color: "var(--text-muted)" }}>
              <h3>Loading blogs...</h3>
            </div>
          ) : blogs.length === 0 ? (
            <div className="glass-panel" style={{ padding: "60px 20px", textAlign: "center", borderRadius: "16px", border: "1px solid var(--border-color)", background: "var(--bg-secondary)" }}>
              <h3 style={{ color: "var(--text-secondary)", marginBottom: "10px" }}>No Blogs Found 😔</h3>
              <p style={{ color: "var(--text-muted)" }}>Spiritual histories and travelogues will be added soon.</p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "25px" }}>
              {blogs.map((blog) => (
                <div 
                  key={blog._id}
                  onClick={() => navigate(`/anmigam/temple-blogs/${blog._id}`)}
                  style={{ 
                    background: "var(--bg-secondary)", 
                    border: "1px solid var(--border-color)", 
                    borderRadius: "16px", 
                    overflow: "hidden",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.05)"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-5px)";
                    e.currentTarget.style.boxShadow = "0 8px 30px rgba(0,0,0,0.12)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "none";
                    e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.05)";
                  }}
                >
                  {/* Blog Image */}
                  <div style={{ height: "200px", width: "100%", overflow: "hidden", position: "relative", backgroundColor: "#1e293b" }}>
                    <img 
                      src={blog.image || "/NEWS GHURU LOGO PNG.png"} 
                      alt={blog.title} 
                      style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.5s ease" }}
                      onMouseEnter={(e) => e.target.style.transform = "scale(1.08)"}
                      onMouseLeave={(e) => e.target.style.transform = "scale(1)"}
                    />
                    <div style={{ position: "absolute", bottom: "10px", left: "10px", backgroundColor: "rgba(0,0,0,0.7)", color: "white", padding: "4px 10px", borderRadius: "20px", fontSize: "0.75rem", fontWeight: "600", backdropFilter: "blur(4px)" }}>
                      📍 {blog.location || "Spiritual Site"}
                    </div>
                  </div>

                  {/* Blog Info */}
                  <div style={{ padding: "20px" }}>
                    {blog.templeName && (
                      <span style={{ fontSize: "0.8rem", color: "var(--accent-orange)", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        {blog.templeName}
                      </span>
                    )}
                    <h3 style={{ fontSize: "1.3rem", fontWeight: "700", color: "var(--text-primary)", marginTop: "6px", marginBottom: "10px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", minHeight: "2.8em", lineHeight: "1.4" }}>
                      {blog.title}
                    </h3>
                    <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", lineHeight: "1.6", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden", minHeight: "4.8em", marginBottom: "15px" }}>
                      {blog.description || "Learn about the history, architecture, and timings of this spiritual site."}
                    </p>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                        📅 {new Date(blog.publishedAt || blog.createdAt).toLocaleDateString("en-US")}
                      </span>
                      <span style={{ color: "var(--accent-orange)", fontWeight: "700", fontSize: "0.88rem" }}>
                        Read &rarr;
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Spiritual Videos Section (Moved to the bottom) */}
          {spiritualVideos.length > 0 && (
            <div className="spiritual-video-section-large">
              {/* 1. Large Featured Video (Newest Upload) */}
              {(() => {
                const featuredVid = spiritualVideos[0];
                const videoId = featuredVid.youtubeVideoId || ((featuredVid.youtubeUrl || featuredVid.videoUrl || "").match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/)?.[2] || "");
                return (
                  <div className="spiritual-featured-video-container">
                    <div className="spiritual-featured-video-player">
                      {playingVideoId === featuredVid._id ? (
                        <iframe
                          src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1`}
                          title={featuredVid.title}
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        ></iframe>
                      ) : (
                        <div className="spiritual-video-placeholder-large" onClick={() => setPlayingVideoId(featuredVid._id)}>
                          <img src={featuredVid.thumbnail} alt={featuredVid.title} />
                          <div className="spiritual-play-overlay-large">
                            <div className="spiritual-play-btn-large">
                              <FaPlay />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="spiritual-featured-video-info">
                      <div className="spiritual-featured-video-badge">
                        🎥 Temple & Spiritual Videos
                      </div>
                      <h2 className="spiritual-featured-video-title">{featuredVid.title}</h2>
                      <div className="spiritual-featured-video-time">
                        📅 {new Date(featuredVid.publishedAt || featuredVid.createdAt).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" })}
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* 2. Grid of next videos */}
              {spiritualVideos.length > 1 && (
                <div className="spiritual-video-grid-large">
                  {spiritualVideos.slice(1, 5).map((vid) => {
                    const videoId = vid.youtubeVideoId || ((vid.youtubeUrl || vid.videoUrl || "").match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/)?.[2] || "");
                    return (
                      <div key={vid._id} className="spiritual-video-card-large">
                        <div className="spiritual-video-wrapper-large">
                          {playingVideoId === vid._id ? (
                            <iframe
                              src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1`}
                              title={vid.title}
                              frameBorder="0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            ></iframe>
                          ) : (
                            <div className="spiritual-video-placeholder-large" onClick={() => setPlayingVideoId(vid._id)}>
                              <img src={vid.thumbnail} alt={vid.title} />
                              <div className="spiritual-play-overlay-large">
                                <div className="spiritual-play-btn-small-large">
                                  <FaPlay />
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="spiritual-video-body-large">
                          <h3 className="spiritual-video-title-large">{vid.title}</h3>
                          <div className="spiritual-video-time-large">
                            📅 {new Date(vid.publishedAt || vid.createdAt).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column (Sidebar Advertisements) */}
        <div style={isLargeScreen ? { position: "sticky", top: "20px", display: "flex", flexDirection: "column", gap: "20px" } : { display: "flex", flexDirection: "column", gap: "20px" }}>
          <AdZone position="SIDEBAR" />
          <AdZone position="SIDEBAR" />
        </div>
      </div>
    </div>
  );
}

export default TempleBlogsPage;

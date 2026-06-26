import React, { useEffect, useState } from "react";
import API from "../config/api";
import "../styles/LatestNews.css";
import RelativeTime from "../components/RelativeTime";

import {
  FaVolumeUp,
  FaArrowRight,
  FaFire,
  FaPlay,
} from "react-icons/fa";

import { useNavigate } from "react-router-dom";
import useSEO from "../hooks/useSEO";
import AdZone from "../components/AdZone";

const LatestNews = () => {
  const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth >= 1024);

  useEffect(() => {
    const handleResize = () => setIsLargeScreen(window.innerWidth >= 1024);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const navigate = useNavigate();

  useSEO({
    title: "Latest News | Newsghuru",
    description: "Breaking news, updates and live reports from India and around the globe.",
    keywords: "latest news, breaking news, live news, newsghuru",
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [breaking, setBreaking] = useState([]);
  const [youtubeVideos, setYoutubeVideos] = useState([]);
  const [playingVideoId, setPlayingVideoId] = useState(null);

  useEffect(() => {
    fetchBreakingNews();
  }, []);

  const fetchBreakingNews = async () => {
    try {
      setLoading(true);
      setError("");

      const [newsRes, videosRes] = await Promise.all([
        API.get("/api/news/category/breaking"),
        API.get("/api/videos").catch(() => ({ data: [] }))
      ]);

      setBreaking(newsRes.data || []);
      const sortedVids = (videosRes.data || [])
        .filter(vid => vid.publishedAt || vid.createdAt)
        .sort((a, b) => new Date(b.publishedAt || b.createdAt) - new Date(a.publishedAt || a.createdAt));
      setYoutubeVideos(sortedVids);

    } catch (err) {
      console.error("Latest News Error:", err);
      setError("Failed to load news");
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // ✅ DATE FILTER ENGINE
  // =========================
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
  const filteredBreaking = filterByDate(breaking, selectedDate);

  // LOADING
  if (loading) {
    return (
      <div style={{ textAlign: "center", marginTop: "100px" }}>
        Loading news...
      </div>
    );
  }

  // ERROR
  if (error) {
    return (
      <div
        style={{
          textAlign: "center",
          marginTop: "100px",
          color: "red",
        }}
      >
        {error}
      </div>
    );
  }

  return (
    <section className="breaking-news-page" style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 15px" }}>
      <AdZone position="TOP_BANNER" />

      {/* TITLE */}
      <div className="breaking-page-title">
        <h1>Latest News</h1>

        <span className="live-badge">
          <FaFire /> Live
        </span>
      </div>

      {/* EMPTY STATE */}
      {filteredBreaking.length === 0 ? (
        <div style={{ padding: "20px" }}>
          No breaking news available for the selected date...
        </div>
      ) : (
        <div style={isLargeScreen ? { display: "grid", gridTemplateColumns: "1fr 300px", gap: "25px", alignItems: "start" } : { display: "flex", flexDirection: "column", gap: "25px" }}>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            
            {/* REDESIGNED BROADCAST NEWS SECTION (LARGE FORMAT) */}
            {youtubeVideos.length > 0 && (
              <div className="broadcast-section-premium">
                
                {/* 1. Large Featured Video (Newest Upload) */}
                {(() => {
                  const featuredVid = youtubeVideos[0];
                  const videoId = featuredVid.youtubeVideoId || ((featuredVid.youtubeUrl || featuredVid.videoUrl || "").match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/)?.[2] || "");
                  return (
                    <div className="featured-video-container">
                      <div className="featured-video-player">
                        {playingVideoId === featuredVid._id ? (
                          <iframe
                            src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1`}
                            title={featuredVid.title}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          ></iframe>
                        ) : (
                          <div className="video-thumbnail-placeholder" onClick={() => setPlayingVideoId(featuredVid._id)}>
                            <img src={featuredVid.thumbnail} alt={featuredVid.title} />
                            <div className="video-play-overlay">
                              <div className="play-button-icon-wrapper">
                                <FaPlay />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="featured-video-info">
                        <div className="featured-video-badge">
                          <span className="broadcast-live-dot"></span> Live Broadcast
                        </div>
                        <h2 className="featured-video-title">{featuredVid.title}</h2>
                        <div className="featured-video-time">
                          <RelativeTime createdAt={featuredVid.publishedAt || featuredVid.createdAt} />
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* 2. Grid of next 4 large videos */}
                {youtubeVideos.length > 1 && (
                  <div className="broadcast-grid-large">
                    {youtubeVideos.slice(1, 5).map((vid) => {
                      const videoId = vid.youtubeVideoId || ((vid.youtubeUrl || vid.videoUrl || "").match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/)?.[2] || "");
                      return (
                        <div key={vid._id} className="broadcast-card-large">
                          <div className="broadcast-video-wrapper-large">
                            {playingVideoId === vid._id ? (
                              <iframe
                                src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1`}
                                title={vid.title}
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                              ></iframe>
                            ) : (
                              <div className="video-thumbnail-placeholder" onClick={() => setPlayingVideoId(vid._id)}>
                                <img src={vid.thumbnail} alt={vid.title} />
                                <div className="video-play-overlay">
                                  <div className="play-button-icon-wrapper-small">
                                    <FaPlay />
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="broadcast-card-body-large">
                            <h3 className="broadcast-card-title-large">{vid.title}</h3>
                            <div className="broadcast-card-time-large">
                              <RelativeTime createdAt={vid.publishedAt || vid.createdAt} />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* FEATURED NEWS */}
            <div
              className="main-breaking-card"
              onClick={() =>
                navigate(`/news/${filteredBreaking[0]._id}`, {
                  state: filteredBreaking[0],
                })
              }
            >
              <div className="main-breaking-image-wrapper">
                <img
                  src={filteredBreaking[0].image}
                  className="main-breaking-image"
                  alt={filteredBreaking[0].title || filteredBreaking[0].titleTa}
                />
              </div>

              <div className="main-breaking-content">
                <div className="main-breaking-header">
                  <button className="breaking-category-btn">
                    <FaFire /> Breaking News
                  </button>
                  <h2>{filteredBreaking[0].title || filteredBreaking[0].titleTa}</h2>
                  <p>
                    {(filteredBreaking[0].description || filteredBreaking[0].shortDescriptionTa)?.replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").substring(0, 180)}...
                  </p>
                </div>

                <div className="main-breaking-footer">
                  <div className="main-breaking-meta">
                    <RelativeTime
                      createdAt={filteredBreaking[0].createdAt}
                      fallback={filteredBreaking[0].time}
                    />
                  </div>
                  <span className="main-breaking-read-more">
                    Read full story <FaArrowRight />
                  </span>
                </div>
              </div>
            </div>

          <AdZone position="SECTION_BANNER" />
          <div className="breaking-news-grid">

            {filteredBreaking.slice(1).map((item) => (
              <div
                key={item._id}
                className="breaking-news-card"
                onClick={() =>
                  navigate(`/news/${item._id}`, {
                    state: item,
                  })
                }
              >

                <img
                  src={item.image}
                  className="breaking-news-image"
                  alt={item.title || item.titleTa}
                />

                <div className="breaking-news-content">

                  <button className="breaking-category-btn">
                    <FaFire /> Breaking News
                  </button>

                  <h3>{item.title || item.titleTa}</h3>

                  <p>
                    {(item.description || item.shortDescriptionTa)?.replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").substring(0, 140)}...
                  </p>

                  <div className="breaking-news-footer">

                    <div className="footer-left">
                      <RelativeTime
                        createdAt={item.createdAt}
                        fallback={item.time}
                      />
                    </div>

                    <div className="breaking-icons">
                      <FaVolumeUp />

                      <div className="read-more">
                        Read More <FaArrowRight />
                      </div>
                    </div>

                  </div>

                </div>

              </div>
            ))}

          </div>

          </div>
          
          <div style={isLargeScreen ? { position: "sticky", top: "20px", display: "flex", flexDirection: "column", gap: "20px" } : { display: "flex", flexDirection: "column", gap: "20px" }}>
            <AdZone position="SIDEBAR" />
            <AdZone position="SIDEBAR" />
          </div>

        </div>
      )}

    </section>
  );
};

export default LatestNews;
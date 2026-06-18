import React, { useEffect, useState } from "react";
import API from "../config/api";
import "../styles/LatestNews.css";
import RelativeTime from "../components/RelativeTime";

import {
  FaVolumeUp,
  FaArrowRight,
  FaFire,
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
    title: "முக்கிய செய்திகள்",
    description: "உடனுக்குடன் உடையும் தமிழகம் மற்றும் இந்திய தற்போதைய செய்திகள், நேரலை செய்திகள்",
    keywords: "தற்போதைய செய்திகள், நேரலை செய்திகள், பிரேக்கிங் நியூஸ், தமிழ் செய்திகள்",
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [breaking, setBreaking] = useState([]);

  useEffect(() => {
    fetchBreakingNews();
  }, []);

  const fetchBreakingNews = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get("/api/news/category/breaking");
      setBreaking(response.data || []);

    } catch (err) {
      console.error("Latest News Error:", err);
      setError("செய்திகளை ஏற்றுவதில் தோல்வி");
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
        செய்திகளை ஏற்றுகிறது...
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
        <h1>முக்கிய செய்திகள்</h1>

        <span className="live-badge">
          <FaFire /> நேரலை
        </span>
      </div>

      {/* EMPTY STATE */}
      {filteredBreaking.length === 0 ? (
        <div style={{ padding: "20px" }}>
          தேர்ந்தெடுக்கப்பட்ட தேதியில் முக்கிய செய்திகள் எதுவும் இல்லை...
        </div>
      ) : (
        <div style={isLargeScreen ? { display: "grid", gridTemplateColumns: "1fr 300px", gap: "25px", alignItems: "start" } : { display: "flex", flexDirection: "column", gap: "25px" }}>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {/* FEATURED NEWS */}
          <div
            className="main-breaking-card"
            onClick={() =>
              navigate(`/news/${filteredBreaking[0]._id}`, {
                state: filteredBreaking[0],
              })
            }
          >
            <img
              src={filteredBreaking[0].image}
              className="main-breaking-image"
              alt={filteredBreaking[0].titleTa || filteredBreaking[0].title}
            />

            <div className="main-breaking-content">

              <button className="breaking-category-btn">
                <FaFire /> முக்கிய செய்திகள்
              </button>

              <h2>{filteredBreaking[0].titleTa || filteredBreaking[0].title}</h2>

              <p>
                {(filteredBreaking[0].shortDescriptionTa || filteredBreaking[0].description)?.replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").substring(0, 180)}...
              </p>

              <div className="breaking-meta">
                <RelativeTime
                  createdAt={filteredBreaking[0].createdAt}
                  fallback={filteredBreaking[0].time}
                />
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
                  alt={item.titleTa || item.title}
                />

                <div className="breaking-news-content">

                  <button className="breaking-category-btn">
                    <FaFire /> முக்கிய செய்திகள்
                  </button>

                  <h3>{item.titleTa || item.title}</h3>

                  <p>
                    {(item.shortDescriptionTa || item.description)?.replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").substring(0, 140)}...
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
                        மேலும் வாசிக்க <FaArrowRight />
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
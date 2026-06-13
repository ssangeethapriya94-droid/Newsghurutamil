import React, { useEffect, useState } from "react";
import API from "../config/api";
import "../styles/World.css";
import RelativeTime from "../components/RelativeTime";

import {
  FaGlobe,
  FaArrowRight,
} from "react-icons/fa";

import { useNavigate } from "react-router-dom";
import useSEO from "../hooks/useSEO";

const World = () => {
  const navigate = useNavigate();

  useSEO({
    title: "உலகம்",
    description: "உலக நாடுகள், சர்வதேச செய்திகள், அமெரிக்கா, ஐரோப்பிய செய்திகள் மற்றும் உலக நிகழ்வுகள்",
    keywords: "உலகச் செய்திகள், சர்வதேச செய்திகள், உலக நிகழ்வுகள், வெளிநாட்டுச் செய்திகள்",
  });

  const [worldNews, setWorldNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const categoryTamilMap = {
    world: "உலகம்",
  };

  const getCategoryLabel = (category) =>
    categoryTamilMap[category?.toLowerCase()] || category;

  useEffect(() => {
    fetchWorldNews();
  }, []);

  const fetchWorldNews = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await API.get("/api/news/category/world");
      setWorldNews(res.data || []);

    } catch (err) {
      console.error("World API Error:", err);
      setError("உலகச் செய்திகளை ஏற்றுவதில் தோல்வி");
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
  const filteredWorldNews = filterByDate(worldNews, selectedDate);

  // LOADING
  if (loading) {
    return <div style={{ padding: "30px", textAlign: "center" }}>செய்திகளை ஏற்றுகிறது...</div>;
  }

  // ERROR
  if (error) {
    return (
      <div style={{ padding: "30px", color: "red" }}>
        {error}
      </div>
    );
  }

  return (
    <section className="world-page">

      {/* HEADER */}
      <div className="world-header">

        <div>
          <h1>உலகம்</h1>
          <p>உலக நாடுகளின் முக்கிய செய்திகளை உடனுக்குடன் அறியுங்கள்</p>
        </div>

        <button className="world-live-btn">
          <FaGlobe /> உலகம் நேரலை
        </button>

      </div>

      {/* EMPTY STATE */}
      {filteredWorldNews.length === 0 ? (
        <div style={{ padding: "30px" }}>
          தேர்ந்தெடுக்கப்பட்ட தேதியில் உலகச் செய்திகள் எதுவும் இல்லை
        </div>
      ) : (
        <>
          {/* FEATURED NEWS */}
          <div
            className="featured-world-news"
            onClick={() =>
              navigate(`/news/${filteredWorldNews[0]._id}`, {
                state: filteredWorldNews[0],
              })
            }
          >

            <img
              src={filteredWorldNews[0].image}
              alt={filteredWorldNews[0].titleTa || filteredWorldNews[0].title}
              className="featured-world-image"
            />

            <div className="featured-world-content">

              <button className="world-category-btn">
                <FaGlobe /> {getCategoryLabel(filteredWorldNews[0].category)}
              </button>

              <h2>{filteredWorldNews[0].titleTa || filteredWorldNews[0].title}</h2>

              <div className="featured-world-meta">
                <span>
                  <RelativeTime
                    createdAt={filteredWorldNews[0].createdAt}
                    fallback={filteredWorldNews[0].time}
                  />
                </span>
              </div>

            </div>

          </div>

          {/* GRID NEWS */}
          <div className="world-news-grid">

            {filteredWorldNews.map((news) => (

              <div
                className="world-news-card"
                key={news._id}
                onClick={() =>
                  navigate(`/news/${news._id}`, {
                    state: news,
                  })
                }
              >

                <img
                  src={news.image}
                  alt={news.titleTa || news.title}
                  className="world-news-image"
                />

                <div className="world-news-content">

                  <button className="world-category-btn">
                    <FaGlobe /> {getCategoryLabel(news.category)}
                  </button>

                  <h3>{news.titleTa || news.title}</h3>

                  <p>
                    {(news.shortDescriptionTa || news.description)?.replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").slice(0, 100)}...
                  </p>

                  <div className="world-news-footer">

                    <div className="world-footer-left">
                      <span>
                        <RelativeTime
                          createdAt={news.createdAt}
                          fallback={news.time}
                        />
                      </span>
                    </div>

                    <div className="world-read-more">
                      மேலும் வாசிக்க <FaArrowRight />
                    </div>

                  </div>

                </div>

              </div>

            ))}

          </div>
        </>
      )}

    </section>
  );
};

export default World;
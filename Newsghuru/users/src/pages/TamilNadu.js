import React, { useEffect, useState } from "react";
import API from "../config/api";
import "../styles/TamilNadu.css";
import RelativeTime from "../components/RelativeTime";

import {
  FaArrowRight,
  FaMapMarkedAlt,
} from "react-icons/fa";

import { useNavigate } from "react-router-dom";
import useSEO from "../hooks/useSEO";

const TamilNadu = () => {
  const navigate = useNavigate();

  useSEO({
    title: "தமிழகம்",
    description: "தமிழகத்தின் முக்கிய செய்திகள், மாவட்ட செய்திகள் மற்றும் சென்னை செய்திகள்",
    keywords: "தமிழகம் செய்திகள், மாவட்ட செய்திகள், சென்னை செய்திகள், தமிழ்நாடு",
  });

  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const categoryTamilMap = {
    tamil: "தமிழகம்",
  };

  const getCategoryLabel = (category) =>
    categoryTamilMap[category?.toLowerCase()] || category;

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await API.get("/api/news/category/tamil");
      setNews(res.data || []);

    } catch (err) {
      console.error("Tamil Nadu API Error:", err);
      setError("தமிழகச் செய்திகளை ஏற்றுவதில் தோல்வி");
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
  const filteredNews = filterByDate(news, selectedDate);

  // LOADING
  if (loading) {
    return (
      <div style={{ textAlign: "center", marginTop: "100px", fontSize: "20px" }}>
        தமிழகச் செய்திகளை ஏற்றுகிறது...
      </div>
    );
  }

  // ERROR
  if (error) {
    return (
      <div style={{ textAlign: "center", marginTop: "100px", color: "red" }}>
        {error}
      </div>
    );
  }

  return (
    <section className="tamil-page">

      {/* HEADER */}
      <div className="tamil-header">

        <div>
          <h1>தமிழகம்</h1>
          <p>தமிழகத்தின் முக்கிய அரசியல் மற்றும் உடனடி செய்திகளை அறியுங்கள்</p>
        </div>

        <button className="state-live-btn">
          <FaMapMarkedAlt /> தமிழகம் நேரலை
        </button>

      </div>

      {/* EMPTY STATE */}
      {filteredNews.length === 0 ? (
        <div style={{ padding: "20px" }}>
          தேர்ந்தெடுக்கப்பட்ட தேதியில் தமிழகச் செய்திகள் எதுவும் இல்லை...
        </div>
      ) : (
        <>
          {/* FEATURED NEWS */}
          <div
            className="featured-tamil-news"
            onClick={() =>
              navigate(`/news/${filteredNews[0]._id}`, {
                state: filteredNews[0],
              })
            }
          >

            <img
              src={filteredNews[0].image}
              alt={filteredNews[0].titleTa || filteredNews[0].title}
              className="featured-tamil-image"
            />

            <div className="featured-tamil-content">

              <button className="district-btn">
                <FaMapMarkedAlt /> {getCategoryLabel(filteredNews[0].category)}
              </button>

              <h2>{filteredNews[0].titleTa || filteredNews[0].title}</h2>

              <div className="featured-meta">
                <span>
                  <RelativeTime
                    createdAt={filteredNews[0].createdAt}
                    fallback={filteredNews[0].time}
                  />
                </span>
              </div>

            </div>

          </div>

          {/* GRID */}
          <div className="tamil-news-grid">

            {filteredNews.map((newsItem) => (

              <div
                key={newsItem._id}
                className="tamil-news-card"
                onClick={() =>
                  navigate(`/news/${newsItem._id}`, {
                    state: newsItem,
                  })
                }
              >

                <img
                  src={newsItem.image}
                  alt={newsItem.titleTa || newsItem.title}
                  className="tamil-news-image"
                />

                <div className="tamil-news-content">

                  <button className="district-btn">
                    <FaMapMarkedAlt /> {getCategoryLabel(newsItem.category)}
                  </button>

                  <h3>{newsItem.titleTa || newsItem.title}</h3>

                  <p>{(newsItem.shortDescriptionTa || newsItem.description)?.replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").slice(0, 120)}...</p>

                  <div className="tamil-news-footer">

                    <div className="footer-left">
                      <span>
                        <RelativeTime
                          createdAt={newsItem.createdAt}
                          fallback={newsItem.time}
                        />
                      </span>
                    </div>

                    <div className="read-more">
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

export default TamilNadu;
import React, { useEffect, useState } from "react";
import API from "../config/api";
import "../styles/Business.css";
import RelativeTime from "../components/RelativeTime";

import {
  FaBriefcase,
  FaArrowRight,
} from "react-icons/fa";

import { useNavigate } from "react-router-dom";
import useSEO from "../hooks/useSEO";

const Business = () => {
  const navigate = useNavigate();

  useSEO({
    title: "வணிகம்",
    description: "வணிக செய்திகள், பங்குச்சந்தை நிலவரம், தங்கம் மற்றும் வெள்ளி விலை விவரங்கள்",
    keywords: "வணிக செய்திகள், பங்குச்சந்தை, தங்கம் விலை, வெள்ளி விலை, வர்த்தகம்",
  });

  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const categoryTamilMap = {
    business: "வணிகம்",
  };

  const getCategoryLabel = (category) =>
    categoryTamilMap[category?.toLowerCase()] || category;

  useEffect(() => {
    fetchBusinessNews();
  }, []);

  const fetchBusinessNews = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await API.get("/api/news/category/business");
      setNews(res.data || []);

    } catch (err) {
      console.error("Business News Error:", err);
      setError("வணிகச் செய்திகளை ஏற்றுவதில் தோல்வி");
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
      <div style={{ textAlign: "center", marginTop: "100px" }}>
        வணிகச் செய்திகளை ஏற்றுகிறது...
      </div>
    );
  }

  // ERROR STATE
  if (error) {
    return (
      <div style={{ textAlign: "center", marginTop: "100px", color: "red" }}>
        {error}
      </div>
    );
  }

  return (
    <section className="business-page">

      {/* HEADER */}
      <div className="business-header">

        <div>
          <h1>வணிகம்</h1>
          <p>இந்தியா மற்றும் உலக வணிகத்தின் முக்கிய செய்திகளை அறியுங்கள்</p>
        </div>

        <button className="business-live-btn">
          <FaBriefcase /> சந்தை நிலவரம் நேரலை
        </button>

      </div>

      {/* EMPTY STATE */}
      {filteredNews.length === 0 ? (
        <div style={{ padding: "20px" }}>
          தேர்ந்தெடுக்கப்பட்ட தேதியில் வணிகச் செய்திகள் எதுவும் இல்லை...
        </div>
      ) : (
        <>
          {/* FEATURED NEWS */}
          <div
            className="featured-business-news"
            onClick={() =>
              navigate(`/news/${filteredNews[0]._id}`, {
                state: filteredNews[0],
              })
            }
          >

            <img
              src={filteredNews[0].image}
              alt={filteredNews[0].titleTa || filteredNews[0].title}
              className="featured-business-image"
            />

            <div className="featured-business-content">

              <button className="business-category-btn">
                <FaBriefcase /> {getCategoryLabel(filteredNews[0].category)}
              </button>

              <h2>{filteredNews[0].titleTa || filteredNews[0].title}</h2>

              <div className="featured-business-meta">
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
          <div className="business-news-grid">

            {filteredNews.map((item) => (
              <div
                key={item._id}
                className="business-news-card"
                onClick={() =>
                  navigate(`/news/${item._id}`, {
                    state: item,
                  })
                }
              >

                <img
                  src={item.image}
                  alt={item.titleTa || item.title}
                  className="business-news-image"
                />

                <div className="business-news-content">

                  <button className="business-category-btn">
                    <FaBriefcase /> {getCategoryLabel(item.category)}
                  </button>

                  <h3>{item.titleTa || item.title}</h3>

                  <p>
                    {(item.shortDescriptionTa || item.description)?.replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").substring(0, 120)}...
                  </p>

                  <div className="business-news-footer">

                    <div className="business-footer-left">
                      <span>
                        <RelativeTime
                          createdAt={item.createdAt}
                          fallback={item.time}
                        />
                      </span>
                    </div>

                    <div className="business-read-more">
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

export default Business;
import React, { useEffect, useState } from "react";
import API from "../config/api";
import "../styles/India.css";
import RelativeTime from "../components/RelativeTime";

import {
  FaFlag,
  FaArrowRight,
} from "react-icons/fa";

import { useNavigate } from "react-router-dom";
import useSEO from "../hooks/useSEO";

const India = () => {
  const navigate = useNavigate();

  useSEO({
    title: "இந்தியா",
    description: "இந்தியாவின் தேசிய செய்திகள், தலைநகர செய்திகள், அரசியல் மற்றும் முக்கியமான நிகழ்வுகள்",
    keywords: "இந்தியா செய்திகள், டெல்லி செய்திகள், தேசிய செய்திகள், இந்திய அரசியல்",
  });

  const [indiaNews, setIndiaNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const categoryTamilMap = {
    india: "இந்தியா",
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

      const res = await API.get("/api/news/category/india");
      setIndiaNews(res.data || []);

    } catch (err) {
      console.error("India API Error:", err);
      setError("இந்தியச் செய்திகளை ஏற்றுவதில் தோல்வி");
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
  const filteredIndiaNews = filterByDate(indiaNews, selectedDate);

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
    <section className="india-page">

      {/* HEADER */}
      <div className="india-header">

        <div>
          <h1>இந்தியா</h1>
          <p>இந்தியாவின் முக்கிய தேசிய செய்திகளை அறியுங்கள்</p>
        </div>

        <button className="india-live-btn">
          <FaFlag /> இந்தியா நேரலை
        </button>

      </div>

      {/* EMPTY STATE */}
      {filteredIndiaNews.length === 0 ? (
        <div style={{ padding: "30px" }}>
          தேர்ந்தெடுக்கப்பட்ட தேதியில் இந்தியச் செய்திகள் எதுவும் இல்லை
        </div>
      ) : (
        <>
          {/* FEATURED NEWS */}
          <div
            className="featured-india-news"
            onClick={() =>
              navigate(`/news/${filteredIndiaNews[0]._id}`, {
                state: filteredIndiaNews[0],
              })
            }
          >

            <img
              src={filteredIndiaNews[0].image}
              alt={filteredIndiaNews[0].titleTa || filteredIndiaNews[0].title}
              className="featured-india-image"
            />

            <div className="featured-india-content">

              <button className="india-category-btn">
                <FaFlag /> {getCategoryLabel(filteredIndiaNews[0].category)}
              </button>

              <h2>{filteredIndiaNews[0].titleTa || filteredIndiaNews[0].title}</h2>

              <div className="featured-india-meta">
                <span>
                  <RelativeTime
                    createdAt={filteredIndiaNews[0].createdAt}
                    fallback={filteredIndiaNews[0].time}
                  />
                </span>
              </div>

            </div>

          </div>

          {/* GRID NEWS */}
          <div className="india-news-grid">

            {filteredIndiaNews.map((news) => (

              <div
                className="india-news-card"
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
                  className="india-news-image"
                />

                <div className="india-news-content">

                  <button className="india-category-btn">
                    <FaFlag /> {getCategoryLabel(news.category)}
                  </button>

                  <h3>{news.titleTa || news.title}</h3>

                  <p>
                    {(news.shortDescriptionTa || news.description)?.replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").slice(0, 110)}...
                  </p>

                  <div className="india-news-footer">

                    <div className="india-footer-left">
                      <span>
                        <RelativeTime
                          createdAt={news.createdAt}
                          fallback={news.time}
                        />
                      </span>
                    </div>

                    <div className="india-read-more">
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

export default India;
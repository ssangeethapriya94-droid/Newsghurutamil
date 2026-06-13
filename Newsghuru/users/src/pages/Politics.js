import React, { useEffect, useState } from "react";
import API from "../config/api";
import "../styles/Politics.css";
import RelativeTime from "../components/RelativeTime";

import {
  FaLandmark,
  FaArrowRight,
} from "react-icons/fa";

import { useNavigate } from "react-router-dom";
import useSEO from "../hooks/useSEO";

const Politics = () => {
  const navigate = useNavigate();

  useSEO({
    title: "அரசியல்",
    description: "தமிழக மற்றும் இந்திய அரசியல் செய்திகளை அறியுங்கள், அரசியல் தலைவர்கள் மற்றும் கட்சி நிகழ்வுகள்",
    keywords: "அரசியல் செய்திகள், இந்திய அரசியல், தமிழக அரசியல், தேர்தல் செய்திகள்",
  });

  const [politicsNews, setPoliticsNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const categoryTamilMap = {
    politics: "அரசியல்",
  };

  const getCategoryLabel = (category) =>
    categoryTamilMap[category?.toLowerCase()] || category;

  useEffect(() => {
    fetchPoliticsNews();
  }, []);

  const fetchPoliticsNews = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await API.get("/api/news/category/politics");
      setPoliticsNews(res.data || []);

    } catch (err) {
      console.error("Politics API Error:", err);
      setError("அரசியல் செய்திகளை ஏற்றுவதில் தோல்வி");
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
  const filteredPoliticsNews = filterByDate(politicsNews, selectedDate);

  // LOADING
  if (loading) {
    return <div style={{ padding: "20px", textAlign: "center" }}>அரசியல் செய்திகளை ஏற்றுகிறது...</div>;
  }

  // ERROR
  if (error) {
    return (
      <div style={{ padding: "20px", color: "red" }}>
        {error}
      </div>
    );
  }

  return (
    <section className="politics-page">

      {/* HEADER */}
      <div className="politics-header">

        <div>
          <h1>அரசியல்</h1>
          <p>தமிழக மற்றும் இந்திய அரசியல் செய்திகளை அறியுங்கள்</p>
        </div>

        <button className="politics-live-btn">
          <FaLandmark /> அரசியல் நேரலை
        </button>

      </div>

      {/* EMPTY STATE */}
      {filteredPoliticsNews.length === 0 ? (
        <div style={{ padding: "20px" }}>
          தேர்ந்தெடுக்கப்பட்ட தேதியில் அரசியல் செய்திகள் எதுவும் இல்லை...
        </div>
      ) : (
        <>
          {/* FEATURED NEWS */}
          <div
            className="featured-politics-news"
            onClick={() =>
              navigate(`/news/${filteredPoliticsNews[0]._id}`, {
                state: filteredPoliticsNews[0],
              })
            }
          >

            <img
              src={filteredPoliticsNews[0].image}
              className="featured-politics-image"
              alt={filteredPoliticsNews[0].titleTa || filteredPoliticsNews[0].title}
            />

            <div className="featured-politics-content">

              <button className="politics-category-btn">
                <FaLandmark /> {getCategoryLabel(filteredPoliticsNews[0].category)}
              </button>

              <h2>{filteredPoliticsNews[0].titleTa || filteredPoliticsNews[0].title}</h2>

              <div className="featured-politics-meta">
                <span>
                  <RelativeTime
                    createdAt={filteredPoliticsNews[0].createdAt}
                    fallback={filteredPoliticsNews[0].time}
                  />
                </span>
              </div>

            </div>

          </div>

          {/* GRID */}
          <div className="politics-news-grid">

            {filteredPoliticsNews.map((news) => (

              <div
                className="politics-news-card"
                key={news._id}
                onClick={() =>
                  navigate(`/news/${news._id}`, {
                    state: news,
                  })
                }
              >

                <img
                  src={news.image}
                  className="politics-news-image"
                  alt={news.titleTa || news.title}
                />

                <div className="politics-news-content">

                  <button className="politics-category-btn">
                    <FaLandmark /> {getCategoryLabel(news.category)}
                  </button>

                  <h3>{news.titleTa || news.title}</h3>

                  <p>
                    {(news.shortDescriptionTa || news.description)?.replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").slice(0, 100)}...
                  </p>

                  <div className="politics-news-footer">

                    <div className="politics-footer-left">
                      <span>
                        <RelativeTime
                          createdAt={news.createdAt}
                          fallback={news.time}
                        />
                      </span>
                    </div>

                    <div className="politics-read-more">
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

export default Politics;
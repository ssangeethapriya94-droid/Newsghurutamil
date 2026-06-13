import React, { useEffect, useState } from "react";
import API from "../config/api";
import "../styles/Sports.css";
import RelativeTime from "../components/RelativeTime";

import {
  FaFutbol,
  FaArrowRight,
} from "react-icons/fa";

import { useNavigate } from "react-router-dom";
import useSEO from "../hooks/useSEO";

const Sports = () => {
  const navigate = useNavigate();

  useSEO({
    title: "விளையாட்டு",
    description: "உலக விளையாட்டு மற்றும் இந்திய அணிகளின் முக்கிய செய்திகளை அறியுங்கள்",
    keywords: "விளையாட்டு செய்திகள், கிரிக்கெட், கால்பந்து, ஒலிம்பிக்ஸ், விளையாட்டு",
  });

  const [sportsNews, setSportsNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const categoryTamilMap = {
    sports: "விளையாட்டு",
  };

  const getCategoryLabel = (category) =>
    categoryTamilMap[category?.toLowerCase()] || category;

  useEffect(() => {
    fetchSportsNews();
  }, []);

  const fetchSportsNews = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await API.get("/api/news/category/sports");
      setSportsNews(res.data || []);

    } catch (err) {
      console.error("Sports API Error:", err);
      setError("விளையாட்டுச் செய்திகளை ஏற்றுவதில் தோல்வி");
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
  const filteredSportsNews = filterByDate(sportsNews, selectedDate);

  // LOADING
  if (loading) {
    return <div style={{ padding: "20px", textAlign: "center" }}>விளையாட்டுச் செய்திகளை ஏற்றுகிறது...</div>;
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
    <section className="sports-page">

      {/* HEADER */}
      <div className="sports-header">

        <div>
          <h1>விளையாட்டு</h1>
          <p>
            உலக விளையாட்டு மற்றும் இந்திய அணிகளின் முக்கிய செய்திகளை அறியுங்கள்
          </p>
        </div>

        <button className="sports-live-btn">
          <FaFutbol /> விளையாட்டு நேரலை
        </button>

      </div>

      {/* EMPTY STATE */}
      {filteredSportsNews.length === 0 ? (
        <div style={{ padding: "20px" }}>
          தேர்ந்தெடுக்கப்பட்ட தேதியில் விளையாட்டுச் செய்திகள் எதுவும் இல்லை...
        </div>
      ) : (
        <>
          {/* FEATURED NEWS */}
          <div
            className="featured-sports-news"
            onClick={() =>
              navigate(`/news/${filteredSportsNews[0]._id}`, {
                state: filteredSportsNews[0],
              })
            }
          >

            <img
              src={filteredSportsNews[0].image}
              alt={filteredSportsNews[0].titleTa || filteredSportsNews[0].title}
              className="featured-sports-image"
            />

            <div className="featured-sports-content">

              <button className="sports-category-btn">
                <FaFutbol /> {getCategoryLabel(filteredSportsNews[0].category)}
              </button>

              <h2>{filteredSportsNews[0].titleTa || filteredSportsNews[0].title}</h2>

              <div className="featured-sports-meta">
                <span>
                  <RelativeTime
                    createdAt={filteredSportsNews[0].createdAt}
                    fallback={filteredSportsNews[0].time}
                  />
                </span>
              </div>

            </div>

          </div>

          {/* GRID */}
          <div className="sports-news-grid">

            {filteredSportsNews.map((news) => (

              <div
                className="sports-news-card"
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
                  className="sports-news-image"
                />

                <div className="sports-news-content">

                  <button className="sports-category-btn">
                    <FaFutbol /> {getCategoryLabel(news.category)}
                  </button>

                  <h3>{news.titleTa || news.title}</h3>

                  <p>
                    {(news.shortDescriptionTa || news.description)?.replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").slice(0, 100)}...
                  </p>

                  <div className="sports-news-footer">

                    <div className="sports-footer-left">
                      <span>
                        <RelativeTime
                          createdAt={news.createdAt}
                          fallback={news.time}
                        />
                      </span>
                    </div>

                    <div className="sports-read-more">
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

export default Sports;
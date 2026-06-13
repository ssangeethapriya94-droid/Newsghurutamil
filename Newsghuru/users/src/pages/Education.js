import React, { useEffect, useState } from "react";
import API from "../config/api";
import "../styles/Education.css";
import RelativeTime from "../components/RelativeTime";

import {
  FaGraduationCap,
  FaArrowRight,
} from "react-icons/fa";

import { useNavigate } from "react-router-dom";
import useSEO from "../hooks/useSEO";

const Education = () => {
  const navigate = useNavigate();

  useSEO({
    title: "கல்வி",
    description: "கல்வி, மாணவர்கள் மற்றும் பல்கலைக்கழகங்களின் முக்கிய செய்திகளை அறியுங்கள்",
    keywords: "கல்வி செய்திகள், பள்ளி செய்திகள், கல்லூரி செய்திகள், தேர்வு முடிவுகள்",
  });

  const [educationNews, setEducationNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const categoryTamilMap = {
    education: "கல்வி",
  };

  const getCategoryLabel = (category) =>
    categoryTamilMap[category?.toLowerCase()] || category;

  useEffect(() => {
    fetchEducationNews();
  }, []);

  const fetchEducationNews = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await API.get("/api/news/category/education");
      setEducationNews(res.data || []);

    } catch (err) {
      console.error("Education API Error:", err);
      setError("கல்விச் செய்திகளை ஏற்றுவதில் தோல்வி");
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
  const filteredEducationNews = filterByDate(educationNews, selectedDate);

  // LOADING
  if (loading) {
    return (
      <div style={{ textAlign: "center", marginTop: "100px" }}>
        கல்விச் செய்திகளை ஏற்றுகிறது...
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
    <section className="education-page">

      {/* HEADER */}
      <div className="education-header">

        <div>
          <h1>கல்வி</h1>
          <p>
            கல்வி, மாணவர்கள் மற்றும் பல்கலைக்கழகங்களின் முக்கிய செய்திகளை அறியுங்கள்
          </p>
        </div>

        <button className="education-live-btn">
          <FaGraduationCap /> கல்வி நேரலை
        </button>

      </div>

      {/* EMPTY STATE */}
      {filteredEducationNews.length === 0 ? (
        <div style={{ padding: "20px" }}>
          தேர்ந்தெடுக்கப்பட்ட தேதியில் கல்விச் செய்திகள் எதுவும் இல்லை...
        </div>
      ) : (
        <>
          {/* FEATURED NEWS */}
          <div
            className="featured-education-news"
            onClick={() =>
              navigate(`/news/${filteredEducationNews[0]._id}`, {
                state: filteredEducationNews[0],
              })
            }
          >

            <img
              src={filteredEducationNews[0].image}
              alt={filteredEducationNews[0].titleTa || filteredEducationNews[0].title}
              className="featured-education-image"
            />

            <div className="featured-education-content">

              <button className="education-category-btn">
                <FaGraduationCap /> {getCategoryLabel(filteredEducationNews[0].category)}
              </button>

              <h2>{filteredEducationNews[0].titleTa || filteredEducationNews[0].title}</h2>

              <div className="featured-education-meta">
                <span>
                  <RelativeTime
                    createdAt={filteredEducationNews[0].createdAt}
                    fallback={filteredEducationNews[0].time}
                  />
                </span>
              </div>

            </div>

          </div>

          {/* GRID */}
          <div className="education-news-grid">

            {filteredEducationNews.map((news) => (

              <div
                key={news._id}
                className="education-news-card"
                onClick={() =>
                  navigate(`/news/${news._id}`, {
                    state: news,
                  })
                }
              >

                <img
                  src={news.image}
                  alt={news.titleTa || news.title}
                  className="education-news-image"
                />

                <div className="education-news-content">

                  <button className="education-category-btn">
                    <FaGraduationCap /> {getCategoryLabel(news.category)}
                  </button>

                  <h3>{news.titleTa || news.title}</h3>

                  <p>
                    {(news.shortDescriptionTa || news.description)?.replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").substring(0, 100)}...
                  </p>

                  <div className="education-news-footer">

                    <div className="education-footer-left">
                      <span>
                        <RelativeTime
                          createdAt={news.createdAt}
                          fallback={news.time}
                        />
                      </span>
                    </div>

                    <div className="education-read-more">
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

export default Education;
import React, { useEffect, useState } from "react";
import API from "../config/api";
import "../styles/Business.css";
import { FaClock, FaFilm, FaArrowRight } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import RelativeTime from "../components/RelativeTime";
import useSEO from "../hooks/useSEO";

const Cinema = () => {
  const navigate = useNavigate();

  useSEO({
    title: "சினிமா",
    description: "சினிமா மற்றும் கலை உலகின் முக்கிய செய்திகளை உடனுக்குடன் அறியுங்கள், திரைப்பட விமர்சனங்கள் மற்றும் நடிகர் செய்திகள்",
    keywords: "சினிமா செய்திகள், திரைப்பட விமர்சனங்கள், தமிழ் நடிகர்கள், புதிய திரைப்படங்கள்",
  });

  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const categoryTamilMap = {
    cinema: "சினிமா",
  };

  const getCategoryLabel = (category) =>
    categoryTamilMap[category?.toLowerCase()] || category;

  useEffect(() => {
    fetchCinemaNews();
  }, []);

  const fetchCinemaNews = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await API.get("/api/news/category/cinema");
      setNews(res.data || []);

    } catch (err) {
      console.error("Cinema News Error:", err);
      setError("சினிமா செய்திகளை ஏற்றுவதில் தோல்வி");
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
        சினிமா செய்திகளை ஏற்றுகிறது...
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
    <section className="business-page">

      {/* HEADER */}
      <div className="business-header">

        <div>
          <h1>சினிமா</h1>
          <p>சினிமா மற்றும் கலை உலகின் முக்கிய செய்திகளை உடனுக்குடன் அறியுங்கள்</p>
        </div>

        <button className="business-live-btn">
          <FaFilm /> சினிமா செய்திகள்
        </button>

      </div>

      {/* EMPTY STATE */}
      {filteredNews.length === 0 ? (
        <div style={{ padding: "20px" }}>
          தேர்ந்தெடுக்கப்பட்ட தேதியில் சினிமா செய்திகள் எதுவும் இல்லை...
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
                <FaFilm /> {getCategoryLabel(filteredNews[0].category)}
              </button>

              <h2>{filteredNews[0].titleTa || filteredNews[0].title}</h2>

              <div className="featured-business-meta">
                <span>
                  <FaClock />{" "}
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
                    <FaFilm /> {getCategoryLabel(item.category)}
                  </button>

                  <h3>{item.titleTa || item.title}</h3>

                  <p>{(item.shortDescriptionTa || item.description)?.replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").substring(0, 120)}...</p>

                  <div className="business-news-footer">

                    <div className="business-footer-left">
                      <span>
                        <FaClock />{" "}
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

export default Cinema;
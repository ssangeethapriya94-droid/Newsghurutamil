import React, { useEffect, useState } from "react";
import API from "../config/api";
import "../styles/Home.css";
import RelativeTime from "../components/RelativeTime";

import {
  FaArrowRight,
  FaBolt,
  FaChartLine,
  FaGlobe,
  FaFutbol,
  FaNewspaper,
  FaFire,
  FaGraduationCap,
  FaMapMarkedAlt,
  FaFlag,
  FaLandmark,
  FaFilm,
  FaPlayCircle
} from "react-icons/fa";

import { useNavigate } from "react-router-dom";
import useSEO from "../hooks/useSEO";

const stripHtml = (html) => {
  if (!html) return "";
  const doc = new DOMParser().parseFromString(html, "text/html");
  return doc.body.textContent || "";
};

const Home = () => {
  const navigate = useNavigate();

  useSEO({
    title: "முகப்பு (Home)",
    description: "தமிழகம், இந்தியா மற்றும் உலக அளவிலான உடனடி மற்றும் நம்பகமான தமிழ் செய்திகள் - நியூஸ் குரு",
    keywords: "முகப்பு செய்தி, தமிழ் செய்திகள், தமிழக செய்திகள், பிரேக்கிங் நியூஸ், நியூஸ் குரு",
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [breakingNews, setBreakingNews] = useState([]);
  const [tamilNews, setTamilNews] = useState([]);
  const [worldNews, setWorldNews] = useState([]);
  const [indiaNews, setIndiaNews] = useState([]);
  const [sportsNews, setSportsNews] = useState([]);
  const [politicsNews, setPoliticsNews] = useState([]);
  const [businessNews, setBusinessNews] = useState([]);
  const [educationNews, setEducationNews] = useState([]);
  const [cinemaNews, setCinemaNews] = useState([]);

  const categoryTamilMap = {
    breaking: "முக்கிய செய்திகள்",
    tamil: "தமிழகம்",
    india: "இந்தியா",
    world: "உலகம்",
    business: "வணிகம்",
    sports: "விளையாட்டு",
    education: "கல்வி",
    politics: "அரசியல்",
    cinema: "சினிமா",
    technology: "தொழில்நுட்பம்",
    tech: "தொழில்நுட்பம்",
  };

  const getCategoryLabel = (category) =>
    categoryTamilMap[category?.toLowerCase()] || category;

  const getIcon = (category) => {
    switch ((category || "").toLowerCase()) {
      case "breaking":
        return <FaFire />;
      case "tamil":
        return <FaMapMarkedAlt />;
      case "india":
        return <FaFlag />;
      case "world":
        return <FaGlobe />;
      case "sports":
        return <FaFutbol />;
      case "politics":
        return <FaLandmark />;
      case "business":
        return <FaChartLine />;
      case "education":
        return <FaGraduationCap />;
      case "cinema":
        return <FaFilm />;
      default:
        return <FaNewspaper />;
    }
  };

  useEffect(() => {
    fetchAll();
    // Auto-refresh published news every 10 seconds
    const interval = setInterval(() => {
      fetchAll(false);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchAll = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      setError("");

      const response = await API.get("/api/news/published");
      const allPublished = response.data || [];

      const filterCat = (cat) => allPublished.filter(n => n.category && n.category.trim().toLowerCase() === cat);

      setBreakingNews(filterCat("breaking"));
      setTamilNews(filterCat("tamil"));
      setWorldNews(filterCat("world"));
      setIndiaNews(filterCat("india"));
      setSportsNews(filterCat("sports"));
      setPoliticsNews(filterCat("politics"));
      setBusinessNews(filterCat("business"));
      setEducationNews(filterCat("education"));
      setCinemaNews(filterCat("cinema"));
    } catch (err) {
      console.error("Home API Error:", err);
      if (showLoading) setError("செய்திகளை ஏற்றுவதில் தோல்வி");
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  // ✅ DATE FILTER ENGINE (CORE FIX)
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

  // ✅ FILTERED DATA (USED EVERYWHERE)
  const filteredBreaking = filterByDate(breakingNews, selectedDate);
  const filteredTamil = filterByDate(tamilNews, selectedDate);
  const filteredWorld = filterByDate(worldNews, selectedDate);
  const filteredIndia = filterByDate(indiaNews, selectedDate);
  const filteredSports = filterByDate(sportsNews, selectedDate);
  const filteredPolitics = filterByDate(politicsNews, selectedDate);
  const filteredBusiness = filterByDate(businessNews, selectedDate);
  const filteredEducation = filterByDate(educationNews, selectedDate);
  const filteredCinema = filterByDate(cinemaNews, selectedDate);

  const trendingNews = [
    filteredBreaking[0],
    filteredTamil[0],
    filteredIndia[0],
    filteredPolitics[0],
    filteredSports[0],
    filteredBusiness[0],
    filteredEducation[0],
    filteredWorld[0],
  ].filter(Boolean);

  const categoryNews = [
    filteredBreaking[1],
    filteredTamil[1],
    filteredWorld[1],
    filteredIndia[1],
    filteredSports[1],
    filteredPolitics[1],
    filteredBusiness[1],
    filteredEducation[1],
  ]
    .filter(Boolean)
    .map((n) => ({
      ...n,
      icon: getIcon(n.category),
    }));

  if (loading) {
    return (
      <div className="home-user-loader">
        <div className="loader-spinner"></div>
        <h2>செய்திகளை ஏற்றுகிறது...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="home-user-error">
        <h2>{error}</h2>
      </div>
    );
  }

  return (
    <section className="home-user-page">
      
      {/* HERO SECTION */}
      <div className="home-user-hero">
        {filteredBreaking[0] && (
          <div
            className="home-user-hero-main"
            onClick={() =>
              navigate(`/news/${filteredBreaking[0]._id}`, {
                state: filteredBreaking[0],
              })
            }
          >
            <div className="img-wrapper">
              <img
                src={filteredBreaking[0].image || filteredBreaking[0].coverImage}
                alt={filteredBreaking[0].titleTa || filteredBreaking[0].title}
                className="hero-main-img"
              />
              <div className="hero-gradient-overlay"></div>
            </div>
            
            <div className="hero-main-content">
              <span className="live-badge">
                <FaBolt className="live-icon" /> {getCategoryLabel("breaking")}
              </span>
              <h1 className="hero-title">{filteredBreaking[0].titleTa || filteredBreaking[0].title}</h1>
              {(filteredBreaking[0].subtitleTa || filteredBreaking[0].subtitle) && (
                <p className="hero-subtitle">{stripHtml(filteredBreaking[0].subtitleTa || filteredBreaking[0].subtitle)}</p>
              )}
              <div className="hero-meta">
                <span className="hero-time">
                  <RelativeTime
                    createdAt={filteredBreaking[0].createdAt}
                    fallback={filteredBreaking[0].time}
                  />
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="home-user-hero-side">
          {filteredBreaking.slice(1, 3).map((n) => (
            <div
              key={n._id}
              className="side-hero-card"
              onClick={() => navigate(`/news/${n._id}`, { state: n })}
            >
              <div className="side-img-wrapper">
                <img src={n.image || n.coverImage} alt={n.titleTa || n.title} />
              </div>
              <div className="side-hero-content">
                <span className="mini-badge">
                  <FaFire /> {getCategoryLabel(n.category)}
                </span>
                <h3 className="side-title line-clamp-2">{n.titleTa || n.title}</h3>
                <span className="side-time">
                  <RelativeTime createdAt={n.createdAt} fallback={n.time} />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>


      {/* CATEGORY HIGHLIGHTS */}
      {categoryNews.length > 0 && (
        <div className="home-user-section bg-light-gray">
          <div className="home-user-section-header">
            <h2><FaNewspaper className="header-icon text-blue" /> முக்கிய செய்திகள்</h2>
            <div className="header-line"></div>
          </div>

          <div className="home-user-grid-4">
            {categoryNews.map((n) => (
              <div
                key={n._id}
                className="home-user-card small-vertical-card"
                onClick={() => {
                  const { icon, ...stateData } = n;
                  navigate(`/news/${n._id}`, { state: stateData });
                }}
              >
                <div className="card-img-container small-vertical-img">
                  <img src={n.image || n.coverImage} alt={n.titleTa || n.title} />
                </div>
                <div className="card-body">
                  <button className="trending-category-btn">
                    {n.icon} {getCategoryLabel(n.category)}
                  </button>
                  <h3 className="card-title line-clamp-2">{n.titleTa || n.title}</h3>
                  <span className="card-time">
                    <RelativeTime createdAt={n.createdAt} fallback={n.time} />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CINEMA & ENTERTAINMENT */}
      {filteredCinema.length > 0 && (
        <div className="home-user-section">
          <div className="home-user-section-header">
            <h2><FaFilm className="header-icon text-purple" /> சினிமா செய்திகள்</h2>
            <div className="header-line"></div>
          </div>

          <div className="home-user-grid-3">
            {filteredCinema.slice(0, 6).map((n) => (
              <div
                key={n._id}
                className="home-user-card cinema-card"
                onClick={() => navigate(`/news/${n._id}`, { state: n })}
              >
                <div className="card-img-container cinema-img">
                  <img src={n.image || n.coverImage} alt={n.titleTa || n.title} />
                  <FaPlayCircle className="cinema-play-icon" />
                </div>
                <div className="card-body cinema-body">
                  <h3 className="card-title line-clamp-2">{n.titleTa || n.title}</h3>
                  <span className="card-time">
                    <RelativeTime createdAt={n.createdAt} fallback={n.time} />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* LATEST UPDATES TICKER / LIST */}
      <div className="home-user-section">
        <div className="home-user-section-header">
          <h2><FaBolt className="header-icon text-orange" /> சமீபத்திய செய்திகள்</h2>
          <div className="header-line"></div>
        </div>

        <div className="home-user-list-wrapper">
          {filteredBreaking.slice(0, 5).map((n) => (
            <div
              key={n._id}
              className="home-user-list-item"
              onClick={() => navigate(`/news/${n._id}`, { state: n })}
            >
              <div className="list-dot"></div>
              <div className="list-content">
                <h4 className="list-title">{n.titleTa || n.title}</h4>
                <span className="list-time">
                  <RelativeTime createdAt={n.createdAt} fallback={n.time} />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </section>
  );
};

export default Home;
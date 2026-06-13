import React, { useEffect, useState } from "react";
import API from "../config/api";
import "../styles/NewsDetails.css";
import RelativeTime from "../components/RelativeTime";

import { useLocation, useNavigate, useParams } from "react-router-dom";
import useSEO from "../hooks/useSEO";

import {
  FaClock,
  FaArrowLeft,
  FaFacebookF,
  FaTwitter,
  FaUserAlt,
  FaInstagram,
  FaYoutube,
} from "react-icons/fa";

const NewsDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();

  const [news, setNews] = useState(location.state || null);

  useSEO({
    title: news ? (news.titleTa || news.title) : "செய்தி விவரங்கள்",
    description: news ? (news.shortDescriptionTa || news.description)?.substring(0, 160) : "செய்தி விவரங்கள் மற்றும் முழுமையான தகவல்கள்",
    keywords: news && (news.seoKeywords || news.keywords) ? (news.seoKeywords || news.keywords) : (news ? `${(news.titleTa || news.title)?.split(" ").slice(0, 5).join(", ")}, தமிழ் செய்தி` : "தமிழ் செய்தி, செய்திகள், நியூஸ் குரு"),
  });

  const [loading, setLoading] = useState(!location.state);
  const [error, setError] = useState("");

  const currentUrl = window.location.href;

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

  useEffect(() => {
    const fetchNewsById = async () => {
      if (location.state) return;

      try {
        setLoading(true);
        setError("");

        const res = await API.get(`/api/news/${id}`);

        setNews(res.data || null);
      } catch (err) {
        console.error("News Details Error:", err);
        setError("செய்தி விவரங்களை ஏற்றுவதில் தோல்வி");
      } finally {
        setLoading(false);
      }
    };

    fetchNewsById();
  }, [id, location.state]);

  if (loading) {
    return (
      <div className="news-not-found">
        <h2>செய்திகளை ஏற்றுகிறது...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="news-not-found">
        <h2>{error}</h2>
      </div>
    );
  }

  if (!news) {
    return (
      <div className="news-not-found">
        <h2>செய்தி கிடைக்கவில்லை</h2>
      </div>
    );
  }

  return (
    <div className="news-details-page">

      {/* BACK BUTTON */}
      <button
        className="back-btn"
        onClick={() => navigate(-1)}
      >
        <FaArrowLeft />
        பின்செல்ல
      </button>

      {/* FEATURE IMAGE */}
      <div className="details-image-wrapper">
        <img
          src={news.image}
          alt={news.titleTa || news.title}
          className="details-image"
          onError={(e) => {
            e.target.src =
              "https://placehold.co/1200x700?text=News+Image";
          }}
        />
      </div>

      {/* CONTENT */}
      <div className="details-content">

        {/* CATEGORY */}
        <button className="category-btn">
          {getCategoryLabel(news.category)}
        </button>

        {/* TITLE */}
        <h1 className="details-title">
          {news.titleTa || news.title}
        </h1>

        {/* META */}
        <div className="details-meta">

          <span>
            <FaClock />
            <RelativeTime
              createdAt={news.createdAt}
              fallback={news.time}
            />
          </span>

          <span>
            <FaUserAlt />
            நிர்வாக செய்தியாளர்
          </span>

        </div>

        {/* DESCRIPTION */}
        <div className="details-section">
          <div
            className="rich-text-content"
            dangerouslySetInnerHTML={{
              __html: news.fullDescriptionTa || news.fullDescription || news.description || "விவரங்கள் எதுவும் கிடைக்கவில்லை",
            }}
          />
        </div>

        {/* SHARE SECTION */}
        <div className="share-section">

          <h3 className="share-title">
            இந்த செய்தியை பகிரவும்
          </h3>

          <div className="share-buttons">

            {/* FACEBOOK */}
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                currentUrl
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="share-btn"
            >
              <FaFacebookF />
              Facebook
            </a>

            {/* TWITTER / X */}
            <a
              href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(
                currentUrl
              )}&text=${encodeURIComponent(news.title)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="share-btn"
            >
              <FaTwitter />
              Twitter
            </a>

            {/* INSTAGRAM */}
            <a
              href="https://www.instagram.com/newsghuru_tamil/"
              target="_blank"
              rel="noopener noreferrer"
              className="share-btn"
            >
              <FaInstagram />
              Instagram
            </a>

            {/* YOUTUBE */}
            <a
              href="https://youtube.com/@newsghurutamil"
              target="_blank"
              rel="noopener noreferrer"
              className="share-btn"
            >
              <FaYoutube />
              YouTube
            </a>

          </div>

        </div>

      </div>

    </div>
  );
};

export default NewsDetails;
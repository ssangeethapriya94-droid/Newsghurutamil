import React from "react";

import "../styles/NewsGuru.css";

import {
  FaClock,
  FaComment,
  FaFire,
  FaPlayCircle,
  FaEye,
} from "react-icons/fa";

import { useNavigate } from "react-router-dom";
import useSEO from "../hooks/useSEO";

const NewsGuru = () => {

  const navigate = useNavigate();

  useSEO({
    title: "நியூஸ் குரு (News Guru)",
    description: "நியூஸ் குரு - முக்கிய செய்திகளை உடனுக்குடன் தமிழ் மொழியில் அறியுங்கள்",
    keywords: "நியூஸ் குரு, முக்கிய செய்திகள், நேரலை செய்திகள், தமிழ் செய்திகள்",
  });

  /* =========================================
     NEWS GURU DATA
  ========================================= */

  const guruNews = [

    {
      id: 101,
      image: "/images/guru1.jpg",

      title:
        "நியூஸ் குரு: தமிழக அரசியலில் புதிய மாற்றம்",

      description:
        "தமிழக அரசியலில் இன்று முக்கிய அரசியல் மாற்றங்கள் உருவாகியுள்ளதாக தகவல்கள் வெளியாகியுள்ளன.",

      category: "அரசியல்",

      time: "30 நிமிடங்கள் முன்பு",

      comments: 18,

      views: "15K",
    },

    {
      id: 102,
      image: "/images/guru2.jpg",

      title:
        "சென்னையில் தொழில்நுட்ப மாநாடு தொடக்கம்",

      description:
        "இந்தியாவின் மிகப்பெரிய AI மற்றும் தொழில்நுட்ப மாநாடு சென்னையில் தொடங்கியது.",

      category: "டெக்னாலஜி",

      time: "1 மணி நேரம் முன்பு",

      comments: 12,

      views: "10K",
    },

    {
      id: 103,
      image: "/images/guru3.jpg",

      title:
        "உலக சந்தையில் திடீர் சரிவு",

      description:
        "சர்வதேச பங்குச்சந்தையில் இன்று திடீர் வீழ்ச்சி ஏற்பட்டுள்ளது.",

      category: "வணிகம்",

      time: "45 நிமிடங்கள் முன்பு",

      comments: 20,

      views: "21K",
    },

    {
      id: 104,
      image: "/images/guru4.jpg",

      title:
        "இந்திய அணியின் புதிய சாதனை",

      description:
        "இந்திய கிரிக்கெட் அணி உலக சாதனையை படைத்துள்ளது.",

      category: "விளையாட்டு",

      time: "2 மணி நேரம் முன்பு",

      comments: 30,

      views: "35K",
    },

  ];

  return (

    <section className="guru-page">

      {/* =========================================
          PAGE HEADER
      ========================================= */}

      <div className="guru-header">

        <div>

          <h1>நியூஸ் குரு</h1>

          <p>
            முக்கிய செய்திகளை உடனுக்குடன் அறியுங்கள்
          </p>

        </div>

        <div className="guru-live">

          <FaFire />

          Trending Now

        </div>

      </div>

      {/* =========================================
          FEATURED NEWS
      ========================================= */}

      <div
        className="guru-featured-news"
        onClick={() =>
          navigate(`/news/${guruNews[0].id}`, {
            state: guruNews[0],
          })
        }
      >

        <img
          src={guruNews[0].image}
          alt=""
          className="guru-featured-image"
        />

        <div className="guru-featured-content">

          <button className="guru-category-btn">
            {guruNews[0].category}
          </button>

          <h2>
            {guruNews[0].title}
          </h2>

          <p>
            {guruNews[0].description}
          </p>

          <div className="guru-meta">

            <span>
              <FaClock />
              {guruNews[0].time}
            </span>

            <span>
              <FaComment />
              {guruNews[0].comments}
            </span>

            <span>
              <FaEye />
              {guruNews[0].views}
            </span>

          </div>

        </div>

      </div>

      {/* =========================================
          TRENDING NEWS GRID
      ========================================= */}

      <div className="guru-news-grid">

        {guruNews.map((news) => (

          <div
            className="guru-news-card"
            key={news.id}
            onClick={() =>
              navigate(`/news/${news.id}`, {
                state: news,
              })
            }
          >

            {/* IMAGE */}

            <div className="guru-image-wrapper">

              <img
                src={news.image}
                alt=""
                className="guru-news-image"
              />

              <div className="play-icon">

                <FaPlayCircle />

              </div>

            </div>

            {/* CONTENT */}

            <div className="guru-news-content">

              <button className="guru-category-btn">
                {news.category}
              </button>

              <h3>
                {news.title}
              </h3>

              <p>
                {news.description}
              </p>

              {/* FOOTER */}

              <div className="guru-news-footer">

                <span>
                  <FaClock />
                  {news.time}
                </span>

                <span>
                  <FaComment />
                  {news.comments}
                </span>

                <span>
                  <FaEye />
                  {news.views}
                </span>

              </div>

            </div>

          </div>

        ))}

      </div>

    </section>

  );
};

export default NewsGuru;
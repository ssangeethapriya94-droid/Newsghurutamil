import React from "react";
import "../styles/News.css";
import { FaVolumeUp, FaComment } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const News = ({ selectedCategory }) => {

  const navigate = useNavigate();

  const newsData = {
    "தற்போதைய செய்தி": [
      {
        id: 1,
        image: "/images/news1.jpg",
        title: "BREAKING: முக்கிய அரசியல் நிகழ்வு இன்று நடந்தது",
        description:
          "தமிழக அரசியலில் இன்று முக்கியமான நிகழ்வு நடைபெற்றுள்ளது...",
        category: "தமிழகம்",
        time: "2 மணி நேரம் முன்பு",
        comments: 10,
      },
      {
        id: 2,
        image: "/images/news2.jpg",
        title: "உலக சந்தையில் புதிய மாற்றங்கள்",
        description:
          "உலக பொருளாதாரத்தில் புதிய மாற்றங்கள் உருவாகி வருகின்றன...",
        category: "உலகம்",
        time: "1 மணி நேரம் முன்பு",
        comments: 8,
      },
    ],

    "தமிழகம்": [
      {
        id: 3,
        image: "/images/tamil1.jpg",
        title: "சென்னையில் மெட்ரோ விரிவாக்கம் தொடக்கம்",
        description:
          "சென்னையில் புதிய மெட்ரோ பாதை விரிவாக்க பணிகள் தொடங்கப்பட்டன...",
        category: "தமிழகம்",
        time: "2 மணி நேரம் முன்பு",
        comments: 9,
      },
    ],
  };

  const currentNews =
    newsData[selectedCategory] || newsData["தற்போதைய செய்தி"];

  return (
    <section className="breaking-section">

      <div className="left-news">

        <div className="section-title">
          {selectedCategory} <span className="live-badge">LIVE</span>
        </div>

        {/* MAIN NEWS CARD */}

        <div
          className="main-news-card"
          onClick={() =>
            navigate(`/news/${currentNews[0].id}`, {
              state: currentNews[0],
            })
          }
        >
          <img
            src={currentNews[0]?.image}
            alt=""
            className="main-news-image"
          />

          <div className="main-news-content">
            <h2>{currentNews[0]?.title}</h2>
            <p>Live now</p>
          </div>
        </div>

        {/* NEWS GRID */}

        <div className="news-grid">

          {currentNews.map((news, index) => (

            <div
              className="news-card"
              key={index}
              onClick={() =>
                navigate(`/news/${news.id}`, {
                  state: news,
                })
              }
            >
              <img
                src={news.image}
                alt=""
                className="news-image"
              />

              <div className="news-content">

                <h3>{news.title}</h3>

                <button className="category-btn">
                  {news.category}
                </button>

                <div className="news-footer">

                  <span>{news.time}</span>

                  <div className="news-icons">
                    <FaVolumeUp />

                    <span>
                      <FaComment /> {news.comments}
                    </span>

                  </div>

                </div>

              </div>

            </div>

          ))}

        </div>

      </div>

      {/* ADS */}

      <div className="right-ads">
        <img
          src="/images/ad1.jpg"
          alt=""
          className="ad-image small-ad"
        />

        <img
          src="/images/ad2.jpg"
          alt=""
          className="ad-image"
        />
      </div>

    </section>
  );
};

export default News;
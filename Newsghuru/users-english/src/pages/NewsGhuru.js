import React from "react";

import "../styles/NewsGhuru.css";

import {
  FaClock,
  FaComment,
  FaFire,
  FaPlayCircle,
  FaEye,
} from "react-icons/fa";

import { useNavigate } from "react-router-dom";
import useSEO from "../hooks/useSEO";

const NewsGhuru = () => {

  const navigate = useNavigate();

  useSEO({
    title: "News Ghuru | Special Feature",
    description: "News Ghuru - Get breaking news and stories from around the globe.",
    keywords: "news ghuru, special features, breaking news, newsghuru",
  });

  /* =========================================
     NEWS GHURU DATA
  ========================================= */

  const ghuruNews = [

    {
      id: 101,
      image: "/images/guru1.jpg",

      title:
        "News Ghuru: A new paradigm in state politics",

      description:
        "Reports suggest significant political transformations are unfolding today.",

      category: "Politics",

      time: "30 mins ago",

      comments: 18,

      views: "15K",
    },

    {
      id: 102,
      image: "/images/guru2.jpg",

      title:
        "Tech Conference kicks off in Chennai",

      description:
        "India's largest AI and technology conference has commenced in Chennai.",

      category: "Technology",

      time: "1 hour ago",

      comments: 12,

      views: "10K",
    },

    {
      id: 103,
      image: "/images/guru3.jpg",

      title:
        "Sudden dip in global markets",

      description:
        "A sharp decline was witnessed in the international stock markets today.",

      category: "Business",

      time: "45 mins ago",

      comments: 20,

      views: "21K",
    },

    {
      id: 104,
      image: "/images/guru4.jpg",

      title:
        "New record set by Team India",

      description:
        "Indian cricket team has set a new world record with their latest victory.",

      category: "Sports",

      time: "2 hours ago",

      comments: 30,

      views: "35K",
    },

  ];

  return (

    <section className="ghuru-page">

      {/* =========================================
          PAGE HEADER
      ========================================= */}

      <div className="ghuru-header">

        <div>

          <h1>NEWS GHURU</h1>

          <p>
            Get breaking news and updates instantly
          </p>

        </div>

        <div className="ghuru-live">

          <FaFire />

          Trending Now

        </div>

      </div>

      {/* =========================================
          FEATURED NEWS
      ========================================= */}

      <div
        className="ghuru-featured-news"
        onClick={() =>
          navigate(`/news/${ghuruNews[0].id}`, {
            state: ghuruNews[0],
          })
        }
      >

        <img
          src={ghuruNews[0].image}
          alt=""
          className="ghuru-featured-image"
        />

        <div className="ghuru-featured-content">

          <button className="ghuru-category-btn">
            {ghuruNews[0].category}
          </button>

          <h2>
            {ghuruNews[0].title}
          </h2>

          <p>
            {ghuruNews[0].description}
          </p>

          <div className="ghuru-meta">

            <span>
              <FaClock />
              {ghuruNews[0].time}
            </span>

            <span>
              <FaComment />
              {ghuruNews[0].comments}
            </span>

            <span>
              <FaEye />
              {ghuruNews[0].views}
            </span>

          </div>

        </div>

      </div>

      {/* =========================================
          TRENDING NEWS GRID
      ========================================= */}

      <div className="ghuru-news-grid">

        {ghuruNews.map((news) => (

          <div
            className="ghuru-news-card"
            key={news.id}
            onClick={() =>
              navigate(`/news/${news.id}`, {
                state: news,
              })
            }
          >

            {/* IMAGE */}

            <div className="ghuru-image-wrapper">

              <img
                src={news.image}
                alt=""
                className="ghuru-news-image"
              />

              <div className="play-icon">

                <FaPlayCircle />

              </div>

            </div>

            {/* CONTENT */}

            <div className="ghuru-news-content">

              <button className="ghuru-category-btn">
                {news.category}
              </button>

              <h3>
                {news.title}
              </h3>

              <p>
                {news.description}
              </p>

              {/* FOOTER */}

              <div className="ghuru-news-footer">

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

      {/* =========================================
          FOOTER / BOTTOM SECTION
      ========================================= */}

    </section>

  );
};

export default NewsGhuru;
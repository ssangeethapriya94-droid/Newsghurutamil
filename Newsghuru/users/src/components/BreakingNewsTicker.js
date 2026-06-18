import React, { useEffect, useState } from "react";
import { FaBolt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import API from "../config/api";
import "../styles/BreakingNewsTicker.css";

const BreakingNewsTicker = () => {
  const [breakingNews, setBreakingNews] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBreakingNews = async () => {
      try {
        const { data } = await API.get("/api/news/category/breaking");
        if (data && data.length > 0) {
          setBreakingNews(data);
        }
      } catch (err) {
        console.error("Error fetching breaking news:", err);
      }
    };
    fetchBreakingNews();
  }, []);

  const displayNews = breakingNews.length > 0 ? breakingNews : [
    { _id: 'default', title: 'காத்திருக்கவும்... செய்திகள் ஏற்றப்படுகின்றன...' }
  ];

  return (
    <div className="ticker-container">
      <div className="ticker-label">
        <FaBolt className="live-dot" style={{ color: "#fff", animation: "blink 1s infinite" }} />
        <span>முக்கிய செய்திகள்</span>
      </div>

      <div className="ticker-scroll-wrapper">
        <div className="ticker-scroll-content">
          {displayNews.map((news, index) => (
            <span key={news._id} className="ticker-item">
              <span
                className="ticker-title"
                onClick={() => {
                  if (news._id !== 'default') navigate(`/news/${news._id}`, { state: news });
                }}
              >
                {news.titleTa || news.title}
              </span>
              <span className="ticker-separator">✦</span>
            </span>
          ))}
          {/* Duplicate for infinite loop scroll */}
          {displayNews.map((news, index) => (
            <span key={`dup-${news._id}`} className="ticker-item">
              <span
                className="ticker-title"
                onClick={() => {
                  if (news._id !== 'default') navigate(`/news/${news._id}`, { state: news });
                }}
              >
                {news.titleTa || news.title}
              </span>
              <span className="ticker-separator">✦</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BreakingNewsTicker;

import React from "react";
import "../styles/Sidebar.css";


import {
  FaTimes,
  FaHome,
  FaFlag ,
  FaFutbol,
  FaGraduationCap,
  FaBriefcase,
  FaNewspaper,
  FaLandmark,
  FaMapMarkedAlt,
  FaGlobe,
  FaFilm,
  FaAward,
  FaOm
} from "react-icons/fa";

import { Link, useLocation } from "react-router-dom";

const Sidebar = ({ sidebar, setSidebar }) => {
  const location = useLocation();

  const sidebarMenu = [
    {
      name: "Home",
      icon: <FaHome />,
      path: "/",
    },
    {
      name: "Latest News",
      icon: <FaNewspaper />,
      path: "/latest-news",
    },
    {
      name: "Tamil Nadu",
      icon: <FaMapMarkedAlt />,
      path: "/tamilnadu",
    },
    {
      name: "India",
      icon: <FaFlag />,
      path: "/india",
    },
    {
      name: "World",
      icon: <FaGlobe />,
      path: "/world",
    },
    {
      name: "Sports",
      icon: <FaFutbol />,
      path: "/sports",
    },
    {
      name: "Business",
      icon: <FaBriefcase />,
      path: "/business",
    },
    {
      name: "Education",
      icon: <FaGraduationCap />,
      path: "/education",
    },

    // ✅ NEW CATEGORY ADDED
    {
      name: "Politics",
      icon: <FaLandmark />,
      path: "/politics",
    },
    {
      name: "Cinema",
      icon: <FaFilm />,
      path: "/cinema",
    },
    {
      name: "Horoscope",
      icon: <FaOm />,
      path: "/anmigam/rasi-palan",
    },
    {
      name: "Temple Blogs",
      icon: <FaLandmark />,
      path: "/anmigam/temple-blogs",
    },
    {
      name: "Subscription Plans",
      icon: <FaAward />,
      path: "/subscribe",
    }
  ];

  return (
    <>
      {sidebar && (
        <div className="overlay" onClick={() => setSidebar(false)} />
      )}

      <div className={`sidebar ${sidebar ? "show-sidebar" : ""}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo-section">
            <img
              src="/NEWS GHURU LOGO English.png"
              alt="Logo"
              className="sidebar-logo"
            />
            <h2 className="logo-title" style={{ fontSize: "22px" }}>NEWS GHURU</h2>
          </div>

          <FaTimes
            className="close-icon"
            onClick={() => setSidebar(false)}
          />
        </div>

        <div className="sidebar-menu">
          {sidebarMenu.map((item, index) => (
            <Link
              to={item.path}
              key={index}
              className={`sidebar-item ${
                location.pathname === item.path
                  ? "active-sidebar-item"
                  : ""
              }`}
              onClick={() => setSidebar(false)}
            >
              <span className="sidebar-icon">{item.icon}</span>
              <span>{item.name}</span>
            </Link>
          ))}
        </div>

        <div className="sidebar-footer">
          <p>Stay updated with the latest English news.</p>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
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
} from "react-icons/fa";

import { Link, useLocation } from "react-router-dom";

const Sidebar = ({ sidebar, setSidebar }) => {
  const location = useLocation();

  const sidebarMenu = [
    {
      name: "முகப்பு",
      icon: <FaHome />,
      path: "/",
    },
    {
      name: "தற்போதைய செய்தி",
      icon: <FaNewspaper />,
      path: "/latest-news",
    },
    {
      name: "தமிழகம்",
      icon: <FaMapMarkedAlt />,
      path: "/tamilnadu",
    },
    {
      name: "இந்தியா",
      icon: <FaFlag />,
      path: "/india",
    },
    {
      name: "உலகம்",
      icon: <FaGlobe />,
      path: "/world",
    },
    {
      name: "விளையாட்டு",
      icon: <FaFutbol />,
      path: "/sports",
    },
    {
      name: "வணிகம்",
      icon: <FaBriefcase />,
      path: "/business",
    },
    {
      name: "கல்வி",
      icon: <FaGraduationCap />,
      path: "/education",
    },

    // ✅ NEW CATEGORY ADDED
    {
      name: "அரசியல்",
      icon: <FaLandmark />,
      path: "/politics",
    },
    {
      name: "சினிமா",
      icon: <FaFilm />,
      path: "/cinema",
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
              src="/NEWS GHURU LOGO PNG.png"
              alt="Logo"
              className="sidebar-logo"
            />
            <h2 className="logo-title" style={{ fontSize: "22px" }}>நியூஸ் குரு</h2>
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
          <p>தமிழ் செய்திகளை உடனுக்குடன் தெரிந்துகொள்ளுங்கள்.</p>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
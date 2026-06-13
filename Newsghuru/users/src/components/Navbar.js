import React from "react";
import "../styles/Navbar.css";
import {
  FaHome,
  FaNewspaper,
  FaMapMarkedAlt,
  FaFlag,
  FaGlobe,
  FaBriefcase,
  FaFutbol,
  FaGraduationCap,
  FaLandmark,
  FaFilm,
} from "react-icons/fa";
import { NavLink } from "react-router-dom";

const Navbar = () => {
  const topMenu = [
    {
      name: "முகப்பு", // Fixed: Added missing home label
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
      name: "வணிகம்",
      icon: <FaBriefcase />,
      path: "/business",
    },
    {
      name: "விளையாட்டு",
      icon: <FaFutbol />,
      path: "/sports",
    },
    {
      name: "கல்வி",
      icon: <FaGraduationCap />,
      path: "/education",
    },
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
    <nav className="top-nav">
      {topMenu.map((item, index) => (
        <NavLink
          key={index}
          to={item.path}
          className={({ isActive }) =>
            isActive ? "nav-item active-nav" : "nav-item"
          }
        >
          <span className="nav-icon">{item.icon}</span>
          <span className="nav-text">{item.name}</span>
        </NavLink>
      ))}
    </nav>
  );
};

export default Navbar;
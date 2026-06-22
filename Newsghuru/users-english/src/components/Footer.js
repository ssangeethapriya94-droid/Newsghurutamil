import React from "react";
import "../styles/Footer.css";
import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaYoutube,
  FaTelegramPlane,
  FaWhatsapp,
  FaChevronRight,
  FaMapMarkerAlt,
  FaGlobeAmericas,
  FaChartLine,
  FaRunning,
  FaMicrochip,
  FaPlayCircle,
  FaFutbol,
  FaBriefcase,
  FaGraduationCap,
  FaLandmark,
  FaFilm
} from "react-icons/fa";
import { Link } from "react-router-dom";

const Footer = ({ visitorCount }) => {
  return (
    <footer className="footer">
      <div className="footer-top">
        {/* COLUMN 1: BRAND SECTION */}
        <div className="footer-brand-col">
          <div className="footer-logo-container">
            <img
              src="/NEWS GHURU LOGO PNG.png"
              alt="News Ghuru Logo"
              className="footer-logo"
            />
            <div className="footer-title-wrap">
              <h2>News Ghuru</h2>
              <span className="footer-tagline">Your News Your Voice</span>
            </div>
          </div>
          <p className="footer-desc">
            Honest news, reliable information.
            We bring you every story of your nation.
          </p>

          <div className="footer-socials">
            <a href="https://www.facebook.com/share/1JWbyTwjG3/" target="_blank" rel="noopener noreferrer" className="fb"><FaFacebookF /></a>
            <a href="https://x.com/news_ghuruTamil" target="_blank" rel="noopener noreferrer" className="tw"><FaTwitter /></a>
            <a href="https://www.instagram.com/newsghuru_tamil/" target="_blank" rel="noopener noreferrer" className="ig"><FaInstagram /></a>
            <a href="https://youtube.com/@newsghurutamil?si=6FgN4CcfJbiD698y" target="_blank" rel="noopener noreferrer" className="yt"><FaYoutube /></a>
          </div>
        </div>

        {/* COLUMN 2: QUICK LINKS */}
        <div className="footer-links-col">
          <h3>Quick Links</h3>
          <ul>
            <li><Link to="/"><FaChevronRight className="chevron-link-icon" /> Home</Link></li>
            <li><Link to="/latest-news"><FaChevronRight className="chevron-link-icon" /> Latest News</Link></li>
            <li><Link to="/about-us"><FaChevronRight className="chevron-link-icon" /> About Us</Link></li>
            <li><Link to="/advertise-with-us"><FaChevronRight className="chevron-link-icon" /> Advertise With Us</Link></li>
          </ul>
        </div>

        {/* COLUMN 3: POPULAR CATEGORIES */}
        <div className="footer-links-col">
          <h3>Popular Categories</h3>
          <ul className="category-links">
            <li><Link to="/sports"><FaFutbol className="cat-icon" /> Sports</Link></li>
            <li><Link to="/business"><FaBriefcase className="cat-icon" /> Business</Link></li>
            <li><Link to="/education"><FaGraduationCap className="cat-icon" /> Education</Link></li>
            <li><Link to="/politics"><FaLandmark className="cat-icon" /> Politics</Link></li>
            <li><Link to="/cinema"><FaFilm className="cat-icon" /> Cinema</Link></li>
          </ul>
        </div>

        {/* COLUMN 4: CONTACT SECTION */}
        <div className="footer-contact">
          <h3><Link to="/contact">Contact Us</Link></h3>
          <p>
            Email:{" "}
            <a href="mailto:info@newsghuru.in" className="footer-email">
              info@newsghuru.in
            </a>
          </p>
          <p>
            Chennai, Tamil Nadu, India
          </p>
          <p className="footer-company">
            News Ghuru is a digital media brand run by Gurudeva Entertainments Private Limited.
          </p>
        </div>
      </div>

      {/* COPYRIGHT BOTTOM BAR */}
      <div className="footer-bottom">
        <div className="footer-bottom-container">
          <p>© 2026 News Ghuru. All Rights Reserved.</p>
          {visitorCount > 0 && (
            <p className="visitor-count-display" style={{ fontSize: "0.8rem", opacity: 0.75, marginTop: "4px" }}>
              🌐 Total Website Visitors: <strong>{visitorCount.toLocaleString()}</strong>
            </p>
          )}
          <div className="footer-bottom-links">
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms & Conditions</Link>
            <Link to="/disclaimer">Disclaimer</Link>
            <Link to="/contact">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
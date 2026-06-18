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

const Footer = () => {
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
              <h2>நியூஸ் குரு</h2>
              <span className="footer-tagline">உங்கள் செய்தி உங்கள் குரல்</span>
            </div>
          </div>
          <p className="footer-desc">
            நேர்மையான செய்திகள், நம்பகமான தகவல்கள்.
            உங்கள் நாட்டின் ஒவ்வொரு கதையும் எங்களிடம்.
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
          <h3>விரைவான இணைப்புகள்</h3>
          <ul>
            <li><Link to="/"><FaChevronRight className="chevron-link-icon" /> முகப்பு</Link></li>
            <li><Link to="/latest-news"><FaChevronRight className="chevron-link-icon" /> தற்போதைய செய்தி</Link></li>
            <li><Link to="/about-us"><FaChevronRight className="chevron-link-icon" /> எங்களைப் பற்றி (About Us)</Link></li>
            <li><Link to="/advertise-with-us"><FaChevronRight className="chevron-link-icon" /> விளம்பரம் செய்ய</Link></li>
          </ul>
        </div>

        {/* COLUMN 3: POPULAR CATEGORIES */}
        <div className="footer-links-col">
          <h3>பிரபலமான பிரிவுகள்</h3>
          <ul className="category-links">
            <li><Link to="/sports"><FaFutbol className="cat-icon" /> விளையாட்டு</Link></li>
            <li><Link to="/business"><FaBriefcase className="cat-icon" /> வணிகம்</Link></li>
            <li><Link to="/education"><FaGraduationCap className="cat-icon" /> கல்வி</Link></li>
            <li><Link to="/politics"><FaLandmark className="cat-icon" /> அரசியல்</Link></li>
            <li><Link to="/cinema"><FaFilm className="cat-icon" /> சினிமா</Link></li>
          </ul>
        </div>

        {/* COLUMN 4: CONTACT SECTION */}
        <div className="footer-contact">
          <h3><Link to="/contact">தொடர்பு கொள்ள</Link></h3>
          <p>
            மின்னஞ்சல்:{" "}
            <a href="mailto:info@newsghuru.in" className="footer-email">
              info@newsghuru.in
            </a>
          </p>
          <p>
            சென்னை, தமிழ்நாடு, இந்தியா
          </p>
          <p className="footer-company">
            நியூஸ் குரு என்பது குருதேவா என்டர்டெயின்மென்ட்ஸ் பிரைவேட் லிமிடெட் மூலம் நடத்தப்படும் ஒரு டிஜிட்டல் ஊடக பிராண்ட் ஆகும்.
          </p>
        </div>
      </div>

      {/* COPYRIGHT BOTTOM BAR */}
      <div className="footer-bottom">
        <div className="footer-bottom-container">
          <p>© 2026 நியூஸ் குரு. அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை.</p>
          <div className="footer-bottom-links">
            <Link to="/privacy">தனியுரிமைக் கொள்கை</Link>
            <Link to="/terms">விதிமுறைகள் மற்றும் நிபந்தனைகள்</Link>
            <Link to="/disclaimer">மறுப்புரை (Disclaimer)</Link>
            <Link to="/contact">தொடர்பு</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
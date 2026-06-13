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
      {/* Premium Decorative Background Elements */}
      <div className="footer-deco footer-deco-left">
        <svg viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="goldGradLeft" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="var(--svg-stop-1, #ea580c)" stopOpacity="var(--svg-op-1, 0.95)" />
              <stop offset="50%" stopColor="var(--svg-stop-2, #facc15)" stopOpacity="var(--svg-op-2, 0.75)" />
              <stop offset="100%" stopColor="var(--svg-stop-3, #ef4444)" stopOpacity="var(--svg-op-3, 0.2)" />
            </linearGradient>
            <radialGradient id="globeGlowLeft" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="var(--svg-stop-1, #ea580c)" stopOpacity="0.35" />
              <stop offset="100%" stopColor="var(--svg-stop-1, #ea580c)" stopOpacity="0" />
            </radialGradient>
          </defs>
          {/* Left Globe Background Glow */}
          <circle cx="100" cy="220" r="100" fill="url(#globeGlowLeft)" />
          {/* Left Tilted Wireframe Globe */}
          <circle cx="100" cy="220" r="90" stroke="url(#goldGradLeft)" strokeWidth="2.2" opacity="var(--svg-globe-op, 0.5)" />
          <ellipse cx="100" cy="220" rx="90" ry="30" stroke="url(#goldGradLeft)" strokeWidth="1.5" opacity="var(--svg-globe-op, 0.5)" transform="rotate(15 100 220)" />
          <ellipse cx="100" cy="220" rx="90" ry="60" stroke="url(#goldGradLeft)" strokeWidth="1.5" opacity="var(--svg-globe-op, 0.5)" transform="rotate(15 100 220)" />
          <ellipse cx="100" cy="220" rx="30" ry="90" stroke="url(#goldGradLeft)" strokeWidth="1.5" opacity="var(--svg-globe-op, 0.5)" transform="rotate(15 100 220)" />
          <ellipse cx="100" cy="220" rx="60" ry="90" stroke="url(#goldGradLeft)" strokeWidth="1.5" opacity="var(--svg-globe-op, 0.5)" transform="rotate(15 100 220)" />
          <line x1="100" y1="130" x2="100" y2="310" stroke="url(#goldGradLeft)" strokeWidth="1.5" opacity="var(--svg-globe-op, 0.5)" transform="rotate(15 100 220)" />
          <line x1="10" y1="220" x2="190" y2="220" stroke="url(#goldGradLeft)" strokeWidth="1.5" opacity="var(--svg-globe-op, 0.5)" transform="rotate(15 100 220)" />
          
          {/* Sweeping Waves on Left */}
          <path d="M 0 340 C 80 280, 140 300, 190 230 C 240 160, 280 180, 340 120" stroke="url(#goldGradLeft)" strokeWidth="4.0" fill="none" opacity="var(--svg-line-op-1, 0.9)" />
          <path d="M 0 325 C 80 265, 140 285, 190 215 C 240 145, 280 165, 340 105" stroke="url(#goldGradLeft)" strokeWidth="3.0" fill="none" opacity="var(--svg-line-op-2, 0.75)" />
          <path d="M 0 310 C 80 250, 140 270, 190 200 C 240 130, 280 150, 340 90" stroke="url(#goldGradLeft)" strokeWidth="2.0" fill="none" opacity="var(--svg-line-op-3, 0.6)" />
          <path d="M 0 355 C 80 295, 140 315, 190 245 C 240 175, 280 195, 340 135" stroke="url(#goldGradLeft)" strokeWidth="5.0" fill="none" opacity="var(--svg-line-op-4, 0.3)" />
          <path d="M 0 295 C 80 235, 140 255, 190 185 C 240 115, 280 135, 340 75" stroke="url(#goldGradLeft)" strokeWidth="1.5" fill="none" opacity="var(--svg-line-op-5, 0.5)" />
        </svg>
      </div>

      <div className="footer-deco footer-deco-right">
        <svg viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="goldGradRight" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="var(--svg-stop-1, #ea580c)" stopOpacity="var(--svg-op-1, 0.95)" />
              <stop offset="50%" stopColor="var(--svg-stop-2, #facc15)" stopOpacity="var(--svg-op-2, 0.75)" />
              <stop offset="100%" stopColor="var(--svg-stop-3, #ef4444)" stopOpacity="var(--svg-op-3, 0.2)" />
            </linearGradient>
            <radialGradient id="globeGlowRight" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="var(--svg-stop-1, #ea580c)" stopOpacity="0.35" />
              <stop offset="100%" stopColor="var(--svg-stop-1, #ea580c)" stopOpacity="0" />
            </radialGradient>
          </defs>
          {/* Right Globe Background Glow */}
          <circle cx="280" cy="180" r="100" fill="url(#globeGlowRight)" />
          {/* Right Tilted Wireframe Globe */}
          <circle cx="280" cy="180" r="90" stroke="url(#goldGradRight)" strokeWidth="2.2" opacity="var(--svg-globe-op, 0.5)" />
          <ellipse cx="280" cy="180" rx="90" ry="30" stroke="url(#goldGradRight)" strokeWidth="1.5" opacity="var(--svg-globe-op, 0.5)" transform="rotate(-15 280 180)" />
          <ellipse cx="280" cy="180" rx="90" ry="60" stroke="url(#goldGradRight)" strokeWidth="1.5" opacity="var(--svg-globe-op, 0.5)" transform="rotate(-15 280 180)" />
          <ellipse cx="280" cy="180" rx="30" ry="90" stroke="url(#goldGradRight)" strokeWidth="1.5" opacity="var(--svg-globe-op, 0.5)" transform="rotate(-15 280 180)" />
          <ellipse cx="280" cy="180" rx="60" ry="90" stroke="url(#goldGradRight)" strokeWidth="1.5" opacity="var(--svg-globe-op, 0.5)" transform="rotate(-15 280 180)" />
          <line x1="280" y1="90" x2="280" y2="270" stroke="url(#goldGradRight)" strokeWidth="1.5" opacity="var(--svg-globe-op, 0.5)" transform="rotate(-15 280 180)" />
          <line x1="190" y1="180" x2="370" y2="180" stroke="url(#goldGradRight)" strokeWidth="1.5" opacity="var(--svg-globe-op, 0.5)" transform="rotate(-15 280 180)" />
          
          {/* Sweeping Waves on Right */}
          <path d="M 80 360 C 160 300, 220 280, 270 210 C 320 140, 360 160, 420 100" stroke="url(#goldGradRight)" strokeWidth="4.0" fill="none" opacity="var(--svg-line-op-1, 0.9)" />
          <path d="M 80 345 C 160 285, 220 265, 270 195 C 320 125, 360 145, 420 85" stroke="url(#goldGradRight)" strokeWidth="3.0" fill="none" opacity="var(--svg-line-op-2, 0.75)" />
          <path d="M 80 330 C 160 270, 220 250, 270 180 C 320 110, 360 130, 420 70" stroke="url(#goldGradRight)" strokeWidth="2.0" fill="none" opacity="var(--svg-line-op-3, 0.6)" />
          <path d="M 80 375 C 160 315, 220 295, 270 225 C 320 155, 360 175, 420 115" stroke="url(#goldGradRight)" strokeWidth="5.0" fill="none" opacity="var(--svg-line-op-4, 0.3)" />
          <path d="M 80 315 C 160 255, 220 235, 270 165 C 320 95, 360 115, 420 55" stroke="url(#goldGradRight)" strokeWidth="1.5" fill="none" opacity="var(--svg-line-op-5, 0.5)" />
        </svg>
      </div>

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

          <div className="footer-newsletter">
            <span className="newsletter-title">— எங்கள் செய்திமடலுக்கு குழுசேரவும்</span>
            <div className="newsletter-input-group">
              <input type="email" placeholder="மின்னஞ்சல் முகவரியை உள்ளிடவும்" />
              <button className="subscribe-btn">
                சந்தா செய்க <FaTelegramPlane />
              </button>
            </div>
          </div>
        </div>

        {/* COLUMN 2: QUICK LINKS */}
        <div className="footer-links-col">
          <h3>விரைவான இணைப்புகள்</h3>
          <ul>
            <li><Link to="/"><FaChevronRight className="chevron-link-icon" /> முகப்பு</Link></li>
            <li><Link to="/latest-news"><FaChevronRight className="chevron-link-icon" /> தற்போதைய செய்தி</Link></li>
            <li><Link to="/tamilnadu"><FaChevronRight className="chevron-link-icon" /> தமிழகம்</Link></li>
            <li><Link to="/india"><FaChevronRight className="chevron-link-icon" /> இந்தியா</Link></li>
            <li><Link to="/world"><FaChevronRight className="chevron-link-icon" /> உலகம்</Link></li>
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
          <h3>தொடர்பு கொள்ள</h3>
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
          <Link to="/contact" className="footer-btn">
            இப்போது குழுசேரவும்
          </Link>
        </div>
      </div>

      {/* COPYRIGHT BOTTOM BAR */}
      <div className="footer-bottom">
        <div className="footer-bottom-container">
          <p>© 2026 நியூஸ் குரு. அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை.</p>
          <div className="footer-bottom-links">
            <Link to="/privacy">தனியுரிமைக் கொள்கை</Link>
            <Link to="/terms">விதிமுறைகள் மற்றும் நிபந்தனைகள்</Link>
            <Link to="/contact">தொடர்பு</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
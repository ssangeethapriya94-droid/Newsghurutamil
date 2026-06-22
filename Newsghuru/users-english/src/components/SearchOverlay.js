import React, { useState, useEffect, useRef } from "react";
import { FaSearch, FaTimes, FaMicrophone, FaHistory, FaArrowRight } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import API from "../config/api";

const SearchOverlay = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [allNews, setAllNews] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const navigate = useNavigate();
  const inputRef = useRef(null);

  const trendingTopics = [
    "IPL Cricket",
    "Tamil Nadu",
    "Cinema",
    "New Education Policy",
    "Development Schemes",
    "Space"
  ];

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      if (inputRef.current) inputRef.current.focus();
      // Load recent searches from localStorage
      const saved = localStorage.getItem("recentSearches");
      if (saved) {
        try {
          setRecentSearches(JSON.parse(saved));
        } catch (e) {
          console.error(e);
        }
      }
      // Load published news to generate autocomplete suggestions
      API.get("/api/news/published")
        .then((res) => {
          setAllNews(res.data || []);
        })
        .catch((err) => console.error("Error loading news for search:", err));
    }
  }, [isOpen]);

  // Handle auto-suggestions as user types
  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }
    const term = query.toLowerCase().trim();
    const filtered = allNews.filter((item) => {
      const title = (item.title || "").toLowerCase();
      const desc = (item.shortDescription || item.description || "").toLowerCase();
      return title.includes(term) || desc.includes(term);
    }).slice(0, 5);
    setSuggestions(filtered);
  }, [query, allNews]);

  if (!isOpen) return null;

  const saveRecentSearch = (term) => {
    const updated = [term, ...recentSearches.filter((t) => t !== term)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem("recentSearches", JSON.stringify(updated));
  };

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    saveRecentSearch(query.trim());

    // Category mapping
    const categoryMap = {
      "breaking": "latest-news",
      "latest news": "latest-news",
      "breaking news": "latest-news",
      "tamil": "tamilnadu",
      "tamilnadu": "tamilnadu",
      "tamil nadu": "tamilnadu",
      "india": "india",
      "national": "india",
      "world": "world",
      "international": "world",
      "business": "business",
      "finance": "business",
      "markets": "business",
      "sports": "sports",
      "education": "education",
      "politics": "politics",
      "cinema": "cinema",
      "movies": "cinema",
      "technology": "tech",
      "tech": "tech",
    };

    const term = query.toLowerCase().trim();
    const route = categoryMap[term];
    if (route) {
      navigate(`/${route}`);
    } else {
      // Find matching article to navigate directly or route to home
      const match = allNews.find(n => (n.title || "").toLowerCase().includes(term));
      if (match) {
        navigate(`/news/${match._id}`, { state: match });
      } else {
        navigate(`/?search=${encodeURIComponent(query.trim())}`);
      }
    }
    onClose();
  };

  const handleVoiceSearch = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN"; // English language code
    recognition.start();
    setIsListening(true);

    recognition.onresult = (event) => {
      const speechToText = event.results[0][0].transcript;
      setQuery(speechToText);
      setIsListening(false);
    };

    recognition.onerror = (err) => {
      console.error(err);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };
  };

  return (
    <div className="search-fullscreen-overlay">
      <button className="header-icon-btn" style={{ position: "absolute", top: "20px", right: "20px", fontSize: "1.8rem", color: "#fff" }} onClick={onClose}>
        <FaTimes />
      </button>

      <div className="search-dialog-box">
        <form onSubmit={handleSearchSubmit} className="search-input-group">
          <input
            ref={inputRef}
            type="text"
            className="search-input-field"
            placeholder="Search news..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="button" className={`search-field-btn ${isListening ? "active" : ""}`} onClick={handleVoiceSearch} title="Voice Search">
            <FaMicrophone style={isListening ? { color: "var(--accent-red)", animation: "blink 1s infinite" } : {}} />
          </button>
          <button type="submit" className="search-field-btn">
            <FaSearch />
          </button>
        </form>

        {isListening && (
          <p style={{ color: "var(--accent-red)", fontSize: "0.9rem", textAlign: "center", marginTop: "-15px" }}>
            Listening... Recording voice...
          </p>
        )}

        {/* AUTO-SUGGESTIONS DISPLAY */}
        {suggestions.length > 0 && (
          <div style={{ background: "var(--bg-secondary)", borderRadius: "var(--border-radius-md)", border: "1px solid var(--border-color)", overflow: "hidden", display: "flex", flexDirection: "column" }}>
            {suggestions.map((item) => (
              <div
                key={item._id}
                style={{ padding: "12px 18px", borderBottom: "1px solid var(--border-color)", cursor: "pointer", display: "flex", alignItems: "center", justifyBetween: "space-between", gap: "12px" }}
                onClick={() => {
                  navigate(`/news/${item._id}`, { state: item });
                  saveRecentSearch(item.title);
                  onClose();
                }}
              >
                <img src={item.image} alt={item.title} style={{ width: "40px", height: "40px", objectFit: "cover", borderRadius: "4px" }} />
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontSize: "0.92rem", fontWeight: "600", color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "480px" }}>
                    {item.title}
                  </p>
                </div>
                <FaArrowRight size={12} style={{ color: "var(--accent-orange)" }} />
              </div>
            ))}
          </div>
        )}

        {/* TRENDING TOPICS */}
        <div className="trending-searches-box">
          <h4 style={{ fontFamily: "var(--font-serif)", color: "var(--text-muted)", fontSize: "0.95rem" }}>Trending Topics:</h4>
          <div className="trending-search-chips">
            {trendingTopics.map((term) => (
              <span
                key={term}
                className="search-tag-chip"
                onClick={() => {
                  setQuery(term);
                  inputRef.current?.focus();
                }}
              >
                {term}
              </span>
            ))}
          </div>
        </div>

        {/* RECENT SEARCHES */}
        {recentSearches.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <h4 style={{ fontFamily: "var(--font-serif)", color: "var(--text-muted)", fontSize: "0.95rem" }}>Recent Searches:</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {recentSearches.map((term, index) => (
                <div
                  key={index}
                  style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "0.9rem", color: "var(--text-secondary)", cursor: "pointer" }}
                  onClick={() => {
                    setQuery(term);
                  }}
                >
                  <FaHistory style={{ color: "var(--text-muted)", fontSize: "0.8rem" }} />
                  <span>{term}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchOverlay;

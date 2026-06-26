import React, { useState, useEffect, useRef } from "react";
import { FaSearch, FaTimes, FaMicrophone, FaHistory, FaArrowRight } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import API from "../config/api";

const SearchOverlay = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
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

  const categoryEnglishMap = {
    breaking: "Breaking News",
    tamil: "Tamil Nadu",
    india: "India",
    world: "World",
    business: "Business",
    sports: "Sports",
    education: "Education",
    politics: "Politics",
    cinema: "Cinema",
    tech: "Technology",
    technology: "Technology"
  };

  const getCategoryLabel = (cat) => categoryEnglishMap[cat?.toLowerCase()] || cat;

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

  // Handle in-overlay search results as user types
  useEffect(() => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    const queryWords = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
    const matched = allNews.filter((item) => {
      const title = (item.title || "").toLowerCase();
      const desc = (item.shortDescription || item.description || "").toLowerCase();
      const category = (item.category || "").toLowerCase();
      const tags = Array.isArray(item.tags) ? item.tags.map(t => t.toLowerCase()).join(" ") : (item.tags || "").toLowerCase();
      const content = (item.content || "").toLowerCase();

      return queryWords.every(word => 
        title.includes(word) ||
        desc.includes(word) ||
        category.includes(word) ||
        tags.includes(word) ||
        content.includes(word)
      );
    });
    setSearchResults(matched);
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

    // Category mapping via helper
    const getCategoryRouteFromTerm = (term) => {
      // Spiritual mappings
      if (/spiritual|spirituality|anmigam/i.test(term)) return "spiritual";
      if (/horoscope|astrology|rasi\s*palan/i.test(term)) return "anmigam/rasi-palan";
      if (/temple|kovil|temple\s*blogs/i.test(term)) return "anmigam/temple-blogs";

      // Regular category mappings
      if (/breaking|latest\s*news/i.test(term)) return "latest-news";
      if (/tamil\s*nadu|tamilnadu|tamil/i.test(term)) return "tamilnadu";
      if (/india|national/i.test(term)) return "india";
      if (/world|international/i.test(term)) return "world";
      if (/business|finance|markets/i.test(term)) return "business";
      if (/sports/i.test(term)) return "sports";
      if (/education/i.test(term)) return "education";
      if (/politics/i.test(term)) return "politics";
      if (/cinema|movies/i.test(term)) return "cinema";
      if (/tech|technology/i.test(term)) return "tech";
      return null;
    };

    const term = query.toLowerCase().trim();
    const route = getCategoryRouteFromTerm(term);
    if (route) {
      navigate(`/${route}`);
      onClose();
    }
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

  return createPortal(
    <div className="search-fullscreen-overlay">
      <button className="header-icon-btn search-close-btn" style={{ position: "absolute", top: "20px", right: "20px", fontSize: "1.8rem" }} onClick={onClose}>
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

        {/* IN-OVERLAY SEARCH RESULTS */}
        {query.trim() && (
          <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            <h4 style={{ fontFamily: "var(--font-serif)", color: "var(--text-muted)", fontSize: "0.95rem", margin: "0 0 5px 0" }}>
              Search Results ({searchResults.length} articles):
            </h4>
            {searchResults.length > 0 ? (
              <div style={{ 
                display: "flex", 
                flexDirection: "column", 
                gap: "12px", 
                maxHeight: "55vh", 
                overflowY: "auto", 
                paddingRight: "5px",
                scrollbarWidth: "thin"
              }}>
                {searchResults.map((item) => (
                  <div
                    key={item._id}
                    className="search-result-card"
                    style={{ 
                      padding: "10px", 
                      borderRadius: "8px", 
                      border: "1px solid var(--border-color)", 
                      cursor: "pointer", 
                      display: "flex", 
                      gap: "15px",
                      background: "var(--bg-secondary)",
                      transition: "all 0.2s"
                    }}
                    onClick={() => {
                      navigate(`/news/${item._id}`, { state: item });
                      saveRecentSearch(query.trim());
                      onClose();
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "var(--accent-orange)";
                      e.currentTarget.style.transform = "translateX(4px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "var(--border-color)";
                      e.currentTarget.style.transform = "translateX(0)";
                    }}
                  >
                    <img 
                      src={item.image} 
                      alt={item.title} 
                      style={{ width: "90px", height: "65px", objectFit: "cover", borderRadius: "6px", flexShrink: 0 }} 
                    />
                    <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", flex: 1, minWidth: 0 }}>
                      <span style={{ fontSize: "0.7rem", color: "var(--accent-orange)", fontWeight: "bold", textTransform: "uppercase" }}>
                        {getCategoryLabel(item.category)}
                      </span>
                      <h4 style={{ 
                        margin: "4px 0 0 0", 
                        fontSize: "0.9rem", 
                        fontWeight: "700", 
                        color: "var(--text-primary)", 
                        display: "-webkit-box", 
                        WebkitLineClamp: "2", 
                        WebkitBoxOrient: "vertical", 
                        overflow: "hidden",
                        lineHeight: "1.3"
                      }}>
                        {item.title}
                      </h4>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "40px 20px", background: "var(--bg-secondary)", borderRadius: "10px", border: "1px solid var(--border-color)" }}>
                <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--text-muted)" }}>
                  No articles found matching "{query}"
                </p>
              </div>
            )}
          </div>
        )}

        {/* DEFAULT VIEW: TRENDING & RECENT */}
        {!query.trim() && (
          <>
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
          </>
        )}
      </div>
    </div>,
    document.body
  );
};

export default SearchOverlay;

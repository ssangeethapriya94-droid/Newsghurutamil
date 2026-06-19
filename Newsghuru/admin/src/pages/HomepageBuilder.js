import React, { useState, useEffect } from "react";
import API from "../config/api";
import "../styles/ReporterMyArticles.css";

function HomepageBuilder() {
  const [config, setConfig] = useState(null);
  const [newsList, setNewsList] = useState([]);
  const [videoList, setVideoList] = useState([]);
  const [shortList, setShortList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Search filter states
  const [heroSearch, setHeroSearch] = useState("");
  const [trendingSearch, setTrendingSearch] = useState("");
  const [editorSearch, setEditorSearch] = useState("");
  const [videoSearch, setVideoSearch] = useState("");
  const [shortSearch, setShortSearch] = useState("");

  // Selections
  const [selectedHero, setSelectedHero] = useState("");
  const [selectedTrending, setSelectedTrending] = useState([]);
  const [selectedEditors, setSelectedEditors] = useState([]);
  const [selectedVideos, setSelectedVideos] = useState([]);
  const [selectedShorts, setSelectedShorts] = useState([]);
  const [sections, setSections] = useState([]);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch Homepage Config
      const configRes = await API.get("/api/homepage-config");
      const currentConfig = configRes.data || {};
      setConfig(currentConfig);

      // Initialize selections
      setSelectedHero(currentConfig.heroStory?._id || "");
      setSelectedTrending((currentConfig.trendingStories || []).map(s => s._id));
      setSelectedEditors((currentConfig.editorPicks || []).map(s => s._id));
      setSelectedVideos((currentConfig.featuredVideos || []).map(v => v._id));
      setSelectedShorts((currentConfig.featuredShorts || []).map(s => s._id));
      
      // Sort sections by order
      const sortedSections = [...(currentConfig.sections || [])].sort((a, b) => a.order - b.order);
      setSections(sortedSections);

      // Fetch news, videos, shorts
      const [newsRes, videoRes, shortRes] = await Promise.all([
        API.get("/api/news"),
        API.get("/api/videos"),
        API.get("/api/shorts")
      ]);

      // Only published news should be selectable for hero/trending/editors
      const publishedNews = (newsRes.data || []).filter(n => n.status === "published");
      setNewsList(publishedNews);
      setVideoList(videoRes.data || []);
      setShortList((shortRes.data || []).filter(s => s.isEnabled));
    } catch (error) {
      console.error("Error loading builder data:", error);
      alert("Failed to load layout builder configuration");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      const payload = {
        heroStory: selectedHero || null,
        trendingStories: selectedTrending,
        editorPicks: selectedEditors,
        featuredVideos: selectedVideos,
        featuredShorts: selectedShorts,
        sections: sections.map((sec, idx) => ({
          ...sec,
          order: idx + 1 // reset order incrementally
        }))
      };

      const res = await API.put("/api/homepage-config", payload);
      alert("Homepage layout configuration saved successfully! 🎉");
      
      // Refresh state
      const newConfig = res.data;
      setConfig(newConfig);
      setSelectedHero(newConfig.heroStory?._id || "");
      setSelectedTrending((newConfig.trendingStories || []).map(s => s._id));
      setSelectedEditors((newConfig.editorPicks || []).map(s => s._id));
      setSelectedVideos((newConfig.featuredVideos || []).map(v => v._id));
      setSelectedShorts((newConfig.featuredShorts || []).map(s => s._id));
      
      const sortedSections = [...(newConfig.sections || [])].sort((a, b) => a.order - b.order);
      setSections(sortedSections);
    } catch (error) {
      console.error("Save config error:", error);
      alert(error.response?.data?.message || "Failed to save layout configurations");
    } finally {
      setSaving(false);
    }
  };

  // Section arrangement helpers (Up/Down)
  const moveSection = (index, direction) => {
    const nextIndex = direction === "up" ? index - 1 : index + 1;
    if (nextIndex < 0 || nextIndex >= sections.length) return;

    const updated = [...sections];
    const temp = updated[index];
    updated[index] = updated[nextIndex];
    updated[nextIndex] = temp;

    // Recalculate orders
    updated.forEach((sec, idx) => {
      sec.order = idx + 1;
    });

    setSections(updated);
  };

  const handleSectionTextChange = (index, lang, value) => {
    const updated = [...sections];
    if (lang === "ta") {
      updated[index].titleTa = value;
    } else {
      updated[index].titleEn = value;
    }
    setSections(updated);
  };

  const toggleSectionEnabled = (index) => {
    const updated = [...sections];
    updated[index].isEnabled = !updated[index].isEnabled;
    setSections(updated);
  };

  // Checkbox list helper toggles
  const toggleSelection = (id, list, setList) => {
    if (list.includes(id)) {
      setList(list.filter(item => item !== id));
    } else {
      setList([...list, id]);
    }
  };

  if (loading) {
    return (
      <div className="reporter-my-articles" style={{ padding: "40px", textAlign: "center" }}>
        <h2>Loading Homepage Builder...</h2>
        <div style={{ marginTop: "20px" }}>Fetching configuration, articles database, and video layouts.</div>
      </div>
    );
  }

  // Filtered lists for search boxes
  const filteredHeroNews = newsList.filter(n => n.title.toLowerCase().includes(heroSearch.toLowerCase()));
  const filteredTrendingNews = newsList.filter(n => n.title.toLowerCase().includes(trendingSearch.toLowerCase()));
  const filteredEditorNews = newsList.filter(n => n.title.toLowerCase().includes(editorSearch.toLowerCase()));
  const filteredVideos = videoList.filter(v => v.title.toLowerCase().includes(videoSearch.toLowerCase()));
  const filteredShorts = shortList.filter(s => s.title.toLowerCase().includes(shortSearch.toLowerCase()));

  return (
    <div className="reporter-my-articles">
      <div className="header-actions">
        <h2>🛠️ Dynamic Homepage Builder</h2>
        <button 
          onClick={handleSave} 
          className="btn-primary add-category-btn" 
          style={{ height: "45px", background: saving ? "#64748b" : "var(--primary-blue, #2563eb)" }}
          disabled={saving}
        >
          {saving ? "Saving Changes..." : "Save Configuration"}
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "30px", marginTop: "20px" }}>
        
        {/* LEFT COLUMN: HERO, TRENDING, VIDEO SELECTIONS */}
        <div style={{ display: "flex", flexDirection: "column", gap: "30px" }}>
          
          {/* HERO STORY SELECTION */}
          <div style={{ background: "rgba(255,255,255,0.02)", padding: "20px", borderRadius: "12px", border: "1px solid var(--border-color)" }}>
            <h3 style={{ margin: "0 0 10px 0", color: "var(--text-main)", display: "flex", alignItems: "center", gap: "8px" }}>
              🏆 Hero Story (தலைப்புச் செய்தி)
            </h3>
            <p style={{ fontSize: "13px", color: "var(--text-muted)", margin: "0 0 15px 0" }}>
              Choose the primary large story displayed at the absolute top layout of the home page.
            </p>
            <input 
              type="text" 
              placeholder="Search news..." 
              value={heroSearch} 
              onChange={(e) => setHeroSearch(e.target.value)}
              style={{ width: "100%", padding: "10px 14px", borderRadius: "6px", border: "1px solid var(--border-color)", marginBottom: "10px", boxSizing: "border-box" }}
            />
            <select
              value={selectedHero}
              onChange={(e) => setSelectedHero(e.target.value)}
              style={{
                width: "100%",
                padding: "12px 14px",
                borderRadius: "6px",
                border: "1px solid var(--border-color)",
                backgroundColor: "var(--card-bg)",
                color: "var(--text-main)",
                fontSize: "15px"
              }}
            >
              <option value="">-- Select Hero Article --</option>
              {filteredHeroNews.map(n => (
                <option key={n._id} value={n._id}>
                  [{n.category.name}] {n.title}
                </option>
              ))}
            </select>
            {selectedHero && (
              <div style={{ marginTop: "10px", fontSize: "13px", color: "#10b981", fontWeight: "600" }}>
                ✓ Currently Selected Hero: {newsList.find(n => n._id === selectedHero)?.title}
              </div>
            )}
          </div>

          {/* TRENDING STORIES SELECTION */}
          <div style={{ background: "rgba(255,255,255,0.02)", padding: "20px", borderRadius: "12px", border: "1px solid var(--border-color)" }}>
            <h3 style={{ margin: "0 0 10px 0", color: "var(--text-main)" }}>🔥 Trending News (பிரபலமானவை)</h3>
            <p style={{ fontSize: "13px", color: "var(--text-muted)", margin: "0 0 15px 0" }}>
              Select multiple stories to be displayed in the trending side sidebar panels.
            </p>
            <input 
              type="text" 
              placeholder="Search news..." 
              value={trendingSearch} 
              onChange={(e) => setTrendingSearch(e.target.value)}
              style={{ width: "100%", padding: "10px 14px", borderRadius: "6px", border: "1px solid var(--border-color)", marginBottom: "15px", boxSizing: "border-box" }}
            />
            <div style={{ maxHeight: "180px", overflowY: "auto", border: "1px solid var(--border-color)", borderRadius: "6px", padding: "10px" }}>
              {filteredTrendingNews.map(n => (
                <label key={n._id} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "6px 0", cursor: "pointer", fontSize: "14px" }}>
                  <input
                    type="checkbox"
                    checked={selectedTrending.includes(n._id)}
                    onChange={() => toggleSelection(n._id, selectedTrending, setSelectedTrending)}
                  />
                  <span>[{n.category.name}] {n.title}</span>
                </label>
              ))}
            </div>
            <div style={{ marginTop: "10px", fontSize: "13px", color: "var(--text-muted)" }}>
              {selectedTrending.length} articles selected.
            </div>
          </div>

          {/* EDITOR'S PICKS SELECTION */}
          <div style={{ background: "rgba(255,255,255,0.02)", padding: "20px", borderRadius: "12px", border: "1px solid var(--border-color)" }}>
            <h3 style={{ margin: "0 0 10px 0", color: "var(--text-main)" }}>✍ Editor's Picks (ஆசிரியர் தேர்வு)</h3>
            <p style={{ fontSize: "13px", color: "var(--text-muted)", margin: "0 0 15px 0" }}>
              Select prime articles containing editor commentaries or featured layouts.
            </p>
            <input 
              type="text" 
              placeholder="Search news..." 
              value={editorSearch} 
              onChange={(e) => setEditorSearch(e.target.value)}
              style={{ width: "100%", padding: "10px 14px", borderRadius: "6px", border: "1px solid var(--border-color)", marginBottom: "15px", boxSizing: "border-box" }}
            />
            <div style={{ maxHeight: "180px", overflowY: "auto", border: "1px solid var(--border-color)", borderRadius: "6px", padding: "10px" }}>
              {filteredEditorNews.map(n => (
                <label key={n._id} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "6px 0", cursor: "pointer", fontSize: "14px" }}>
                  <input
                    type="checkbox"
                    checked={selectedEditors.includes(n._id)}
                    onChange={() => toggleSelection(n._id, selectedEditors, setSelectedEditors)}
                  />
                  <span>[{n.category.name}] {n.title}</span>
                </label>
              ))}
            </div>
            <div style={{ marginTop: "10px", fontSize: "13px", color: "var(--text-muted)" }}>
              {selectedEditors.length} articles selected.
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: DYNAMIC SECTIONS ARRANGEMENT & CMS LINKS */}
        <div style={{ display: "flex", flexDirection: "column", gap: "30px" }}>
          
          {/* HOMEPAGE SECTIONS MANAGER */}
          <div style={{ background: "rgba(255,255,255,0.02)", padding: "20px", borderRadius: "12px", border: "1px solid var(--border-color)" }}>
            <h3 style={{ margin: "0 0 10px 0", color: "var(--text-main)" }}>🔄 Homepage Section Manager</h3>
            <p style={{ fontSize: "13px", color: "var(--text-muted)", margin: "0 0 15px 0" }}>
              Hide, rename, and arrange the flow order of the homepage sections dynamically.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {sections.map((sec, idx) => (
                <div 
                  key={sec.id} 
                  style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    gap: "12px", 
                    padding: "12px", 
                    background: sec.isEnabled ? "rgba(255, 255, 255, 0.03)" : "rgba(255,255,255,0.01)", 
                    borderRadius: "8px", 
                    border: `1px solid ${sec.isEnabled ? "var(--border-color)" : "rgba(239,68,68,0.2)"}`,
                    opacity: sec.isEnabled ? 1 : 0.6
                  }}
                >
                  {/* ENABLE CHECKBOX */}
                  <input 
                    type="checkbox" 
                    checked={sec.isEnabled} 
                    onChange={() => toggleSectionEnabled(idx)}
                    style={{ width: "18px", height: "18px", cursor: "pointer" }}
                    title={sec.isEnabled ? "Visible on Homepage" : "Hidden"}
                  />

                  {/* INFO */}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", gap: "10px", marginBottom: "6px" }}>
                      <input
                        type="text"
                        value={sec.titleTa}
                        onChange={(e) => handleSectionTextChange(idx, "ta", e.target.value)}
                        placeholder="Tamil Title"
                        style={{ flex: 1, padding: "6px 8px", fontSize: "13px", borderRadius: "4px", border: "1px solid var(--border-color)", backgroundColor: "var(--card-bg)", color: "var(--text-main)" }}
                      />
                      <input
                        type="text"
                        value={sec.titleEn}
                        onChange={(e) => handleSectionTextChange(idx, "en", e.target.value)}
                        placeholder="English Identifier"
                        style={{ flex: 1, padding: "6px 8px", fontSize: "13px", borderRadius: "4px", border: "1px solid var(--border-color)", backgroundColor: "var(--card-bg)", color: "var(--text-main)" }}
                      />
                    </div>
                    <span style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: "700" }}>
                      Block ID: {sec.id}
                    </span>
                  </div>

                  {/* ARRANGEMENT ARROWS */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <button 
                      type="button" 
                      onClick={() => moveSection(idx, "up")} 
                      disabled={idx === 0}
                      style={{ padding: "4px 8px", fontSize: "11px", cursor: idx === 0 ? "not-allowed" : "pointer" }}
                      title="Move Up"
                    >
                      ▲
                    </button>
                    <button 
                      type="button" 
                      onClick={() => moveSection(idx, "down")} 
                      disabled={idx === sections.length - 1}
                      style={{ padding: "4px 8px", fontSize: "11px", cursor: idx === sections.length - 1 ? "not-allowed" : "pointer" }}
                      title="Move Down"
                    >
                      ▼
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* VIDEOS & SHORTS CMS PICKERS */}
          <div style={{ background: "rgba(255,255,255,0.02)", padding: "20px", borderRadius: "12px", border: "1px solid var(--border-color)" }}>
            <h3 style={{ margin: "0 0 10px 0", color: "var(--text-main)" }}>📹 Featured Video News Track</h3>
            <input 
              type="text" 
              placeholder="Search videos..." 
              value={videoSearch} 
              onChange={(e) => setVideoSearch(e.target.value)}
              style={{ width: "100%", padding: "10px 14px", borderRadius: "6px", border: "1px solid var(--border-color)", marginBottom: "15px", boxSizing: "border-box" }}
            />
            <div style={{ maxHeight: "150px", overflowY: "auto", border: "1px solid var(--border-color)", borderRadius: "6px", padding: "10px", marginBottom: "20px" }}>
              {filteredVideos.map(v => (
                <label key={v._id} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "6px 0", cursor: "pointer", fontSize: "14px" }}>
                  <input
                    type="checkbox"
                    checked={selectedVideos.includes(v._id)}
                    onChange={() => toggleSelection(v._id, selectedVideos, setSelectedVideos)}
                  />
                  <span>[{v.category}] {v.title}</span>
                </label>
              ))}
            </div>

            <h3 style={{ margin: "0 0 10px 0", color: "var(--text-main)" }}>📱 Featured Shorts Reels</h3>
            <input 
              type="text" 
              placeholder="Search shorts..." 
              value={shortSearch} 
              onChange={(e) => setShortSearch(e.target.value)}
              style={{ width: "100%", padding: "10px 14px", borderRadius: "6px", border: "1px solid var(--border-color)", marginBottom: "15px", boxSizing: "border-box" }}
            />
            <div style={{ maxHeight: "150px", overflowY: "auto", border: "1px solid var(--border-color)", borderRadius: "6px", padding: "10px" }}>
              {filteredShorts.map(s => (
                <label key={s._id} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "6px 0", cursor: "pointer", fontSize: "14px" }}>
                  <input
                    type="checkbox"
                    checked={selectedShorts.includes(s._id)}
                    onChange={() => toggleSelection(s._id, selectedShorts, setSelectedShorts)}
                  />
                  <span>[{s.category || "General"}] {s.title}</span>
                </label>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

export default HomepageBuilder;

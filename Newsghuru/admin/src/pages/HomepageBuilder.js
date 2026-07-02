/* eslint-disable no-unused-vars */
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
  const [languageBuilder, setLanguageBuilder] = useState("ta");

  // Tab state: "sections", "sidebar", "trending", "mostread"
  const [activeTab, setActiveTab] = useState("sections");

  // Search filter states
  const [heroSearch, setHeroSearch] = useState("");
  const [editorSearch, setEditorSearch] = useState("");
  const [videoSearch, setVideoSearch] = useState("");
  const [shortSearch, setShortSearch] = useState("");
  const [trendingSearch, setTrendingSearch] = useState("");

  // Selections & Layout states
  const [selectedHero, setSelectedHero] = useState("");
  const [selectedTrending, setSelectedTrending] = useState([]);
  const [selectedEditors, setSelectedEditors] = useState([]);
  const [selectedVideos, setSelectedVideos] = useState([]);
  const [selectedShorts, setSelectedShorts] = useState([]);
  const [sections, setSections] = useState([]);
  const [sidebarWidgets, setSidebarWidgets] = useState([]);
  const [mostReadSettings, setMostReadSettings] = useState({ limit: 5, showViews: true, minViews: 0 });

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch Homepage Config
      const configRes = await API.get(`/api/homepage-config?language=${languageBuilder}`);
      const currentConfig = configRes.data || {};
      setConfig(currentConfig);

      // Initialize selections
      setSelectedHero(currentConfig.heroStory?._id || "");
      setSelectedTrending((currentConfig.trendingStories || []).map(s => s._id));
      setSelectedEditors((currentConfig.editorPicks || []).map(s => s._id));
      setSelectedVideos((currentConfig.featuredVideos || []).map(v => v._id));
      setSelectedShorts((currentConfig.featuredShorts || []).map(s => s._id));
      
      // Sort sections and widgets by order
      const sortedSections = [...(currentConfig.sections || [])].sort((a, b) => a.order - b.order);
      setSections(sortedSections);

      const sortedWidgets = [...(currentConfig.sidebarWidgets || [])].sort((a, b) => a.order - b.order);
      setSidebarWidgets(sortedWidgets);

      setMostReadSettings(currentConfig.mostReadSettings || { limit: 5, showViews: true, minViews: 0 });

      // Fetch news, videos, shorts matching target language
      const [newsRes, videoRes, shortRes] = await Promise.all([
        API.get(`/api/news?language=${languageBuilder}`),
        API.get(`/api/videos?language=${languageBuilder}`),
        API.get(`/api/shorts?language=${languageBuilder}`)
      ]);

      // Only published news should be selectable
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [languageBuilder]);

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
          order: idx + 1
        })),
        sidebarWidgets: sidebarWidgets.map((wid, idx) => ({
          ...wid,
          order: idx + 1
        })),
        mostReadSettings,
        language: languageBuilder
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

      const sortedWidgets = [...(newConfig.sidebarWidgets || [])].sort((a, b) => a.order - b.order);
      setSidebarWidgets(sortedWidgets);

      setMostReadSettings(newConfig.mostReadSettings || { limit: 5, showViews: true, minViews: 0 });
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

  // Sidebar widget arrangement helpers
  const moveSidebarWidget = (index, direction) => {
    const nextIndex = direction === "up" ? index - 1 : index + 1;
    if (nextIndex < 0 || nextIndex >= sidebarWidgets.length) return;

    const updated = [...sidebarWidgets];
    const temp = updated[index];
    updated[index] = updated[nextIndex];
    updated[nextIndex] = temp;

    updated.forEach((wid, idx) => {
      wid.order = idx + 1;
    });

    setSidebarWidgets(updated);
  };

  const toggleSidebarWidgetEnabled = (index) => {
    const updated = [...sidebarWidgets];
    updated[index].isEnabled = !updated[index].isEnabled;
    setSidebarWidgets(updated);
  };

  const handleSidebarWidgetTextChange = (index, lang, value) => {
    const updated = [...sidebarWidgets];
    if (lang === "ta") {
      updated[index].titleTa = value;
    } else {
      updated[index].titleEn = value;
    }
    setSidebarWidgets(updated);
  };

  // Trending News list helpers
  const moveTrendingStory = (index, direction) => {
    const nextIndex = direction === "up" ? index - 1 : index + 1;
    if (nextIndex < 0 || nextIndex >= selectedTrending.length) return;

    const updated = [...selectedTrending];
    const temp = updated[index];
    updated[index] = updated[nextIndex];
    updated[nextIndex] = temp;
    setSelectedTrending(updated);
  };

  const removeTrendingStory = (id) => {
    setSelectedTrending(selectedTrending.filter(item => item !== id));
  };

  const addTrendingStory = (id) => {
    if (!selectedTrending.includes(id)) {
      setSelectedTrending([...selectedTrending, id]);
    }
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
  const filteredEditorNews = newsList.filter(n => n.title.toLowerCase().includes(editorSearch.toLowerCase()));
  const filteredVideos = videoList.filter(v => v.title.toLowerCase().includes(videoSearch.toLowerCase()));
  const filteredShorts = shortList.filter(s => s.title.toLowerCase().includes(shortSearch.toLowerCase()));
  
  // Trending manager list filter (exclude currently selected)
  const remainingNewsForTrending = newsList.filter(
    n => !selectedTrending.includes(n._id) && n.title.toLowerCase().includes(trendingSearch.toLowerCase())
  );

  const selectedTrendingNewsObjects = selectedTrending
    .map(id => newsList.find(n => n._id === id))
    .filter(Boolean);

  const getWidgetBadge = (id) => {
    if (id.startsWith("ad")) return { text: "ADVERTISEMENT (விளம்பரம்)", color: "#ea580c" };
    if (id === "trending") return { text: "TRENDING NEWS (பிரபலம்)", color: "#ef4444" };
    if (id === "mostRead") return { text: "MOST READ (அதிக வாசிப்பு)", color: "#10b981" };
    if (id === "shorts") return { text: "SHORTS REELS (சார்ட்ஸ்)", color: "#ec4899" };
    if (id === "cinema") return { text: "CINEMA NEWS (சினிமா)", color: "#db2777" };
    return { text: "OPTIONAL WIDGET (பயனுள்ளவை)", color: "#7c3aed" };
  };

  return (
    <div className="reporter-my-articles">
      <div className="header-actions">
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <h2>🛠️ Dynamic Homepage & Sidebar Builder</h2>
          <select
            value={languageBuilder}
            onChange={(e) => setLanguageBuilder(e.target.value)}
            style={{
              padding: "10px 14px",
              borderRadius: "8px",
              border: "1px solid var(--border-color)",
              outline: "none",
              fontSize: "14px",
              backgroundColor: "var(--card-bg)",
              color: "var(--text-main)",
              height: "40px",
              cursor: "pointer"
            }}
          >
            <option value="ta">Tamil Website Homepage</option>
            <option value="en">English Website Homepage</option>
          </select>
        </div>
        <button 
          onClick={handleSave} 
          className="btn-primary add-category-btn" 
          style={{ height: "45px", background: saving ? "#64748b" : "var(--primary-blue, #2563eb)", margin: 0 }}
          disabled={saving}
        >
          {saving ? "Saving Changes..." : "Save Configuration"}
        </button>
      </div>

      {/* Tabs navigation */}
      <div style={{ display: "flex", gap: "10px", margin: "20px 0", borderBottom: "1px solid var(--border-color)", paddingBottom: "10px" }}>
        <button
          onClick={() => setActiveTab("sections")}
          style={{
            padding: "10px 18px",
            borderRadius: "6px",
            border: activeTab === "sections" ? "1px solid var(--primary-blue, #2563eb)" : "1px solid var(--border-color)",
            background: activeTab === "sections" ? "var(--primary-blue, #2563eb)" : "transparent",
            color: activeTab === "sections" ? "white" : "var(--text-primary)",
            fontWeight: "bold",
            cursor: "pointer"
          }}
        >
          📰 Homepage Sections
        </button>
        <button
          onClick={() => setActiveTab("sidebar")}
          style={{
            padding: "10px 18px",
            borderRadius: "6px",
            border: activeTab === "sidebar" ? "1px solid var(--primary-blue, #2563eb)" : "1px solid var(--border-color)",
            background: activeTab === "sidebar" ? "var(--primary-blue, #2563eb)" : "transparent",
            color: activeTab === "sidebar" ? "white" : "var(--text-primary)",
            fontWeight: "bold",
            cursor: "pointer"
          }}
        >
          📱 Right Sidebar Manager
        </button>
        <button
          onClick={() => setActiveTab("trending")}
          style={{
            padding: "10px 18px",
            borderRadius: "6px",
            border: activeTab === "trending" ? "1px solid var(--primary-blue, #2563eb)" : "1px solid var(--border-color)",
            background: activeTab === "trending" ? "var(--primary-blue, #2563eb)" : "transparent",
            color: activeTab === "trending" ? "white" : "var(--text-primary)",
            fontWeight: "bold",
            cursor: "pointer"
          }}
        >
          🔥 Trending News Manager
        </button>
        <button
          onClick={() => setActiveTab("mostread")}
          style={{
            padding: "10px 18px",
            borderRadius: "6px",
            border: activeTab === "mostread" ? "1px solid var(--primary-blue, #2563eb)" : "1px solid var(--border-color)",
            background: activeTab === "mostread" ? "var(--primary-blue, #2563eb)" : "transparent",
            color: activeTab === "mostread" ? "white" : "var(--text-primary)",
            fontWeight: "bold",
            cursor: "pointer"
          }}
        >
          📈 Most Read Settings
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === "sections" && (
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "30px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "30px" }}>
            {/* HERO STORY */}
            <div style={{ background: "rgba(255,255,255,0.02)", padding: "20px", borderRadius: "12px", border: "1px solid var(--border-color)" }}>
              <h3 style={{ margin: "0 0 10px 0", color: "var(--text-main)" }}>🏆 Hero Story (தலைப்புச் செய்தி)</h3>
              <p style={{ fontSize: "13px", color: "var(--text-muted)", margin: "0 0 15px 0" }}>Choose the primary large story displayed at the top of the homepage.</p>
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
                style={{ width: "100%", padding: "12px 14px", borderRadius: "6px", border: "1px solid var(--border-color)", backgroundColor: "var(--card-bg)", color: "var(--text-main)", fontSize: "15px" }}
              >
                <option value="">-- Select Hero Article --</option>
                {filteredHeroNews.map(n => (
                  <option key={n._id} value={n._id}>[{n.category}] {n.title}</option>
                ))}
              </select>
            </div>

            {/* EDITOR'S PICKS */}
            <div style={{ background: "rgba(255,255,255,0.02)", padding: "20px", borderRadius: "12px", border: "1px solid var(--border-color)" }}>
              <h3 style={{ margin: "0 0 10px 0", color: "var(--text-main)" }}>✍ Editor's Picks (ஆசிரியர் தேர்வு)</h3>
              <p style={{ fontSize: "13px", color: "var(--text-muted)", margin: "0 0 15px 0" }}>Select prime articles containing editor commentaries.</p>
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
                    <span>[{n.category}] {n.title}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "30px" }}>
            {/* SECTIONS MANAGER */}
            <div style={{ background: "rgba(255,255,255,0.02)", padding: "20px", borderRadius: "12px", border: "1px solid var(--border-color)" }}>
              <h3 style={{ margin: "0 0 10px 0", color: "var(--text-main)" }}>🔄 Homepage Section Manager</h3>
              <p style={{ fontSize: "13px", color: "var(--text-muted)", margin: "0 0 15px 0" }}>Hide, rename, and arrange the flow order of the homepage sections.</p>
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
                    <input 
                      type="checkbox" 
                      checked={sec.isEnabled} 
                      onChange={() => toggleSectionEnabled(idx)}
                      style={{ width: "18px", height: "18px", cursor: "pointer" }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", gap: "10px", marginBottom: "6px" }}>
                        <input
                          type="text"
                          value={sec.titleTa}
                          onChange={(e) => handleSectionTextChange(idx, "ta", e.target.value)}
                          style={{ flex: 1, padding: "6px 8px", fontSize: "13px", borderRadius: "4px", border: "1px solid var(--border-color)", backgroundColor: "var(--card-bg)", color: "var(--text-main)" }}
                          placeholder="Tamil Title"
                        />
                        <input
                          type="text"
                          value={sec.titleEn}
                          onChange={(e) => handleSectionTextChange(idx, "en", e.target.value)}
                          style={{ flex: 1, padding: "6px 8px", fontSize: "13px", borderRadius: "4px", border: "1px solid var(--border-color)", backgroundColor: "var(--card-bg)", color: "var(--text-main)" }}
                          placeholder="English Identifier"
                        />
                      </div>
                      <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: "bold" }}>BLOCK ID: {sec.id}</span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      <button type="button" onClick={() => moveSection(idx, "up")} disabled={idx === 0} style={{ padding: "2px 6px", fontSize: "10px" }}>▲</button>
                      <button type="button" onClick={() => moveSection(idx, "down")} disabled={idx === sections.length - 1} style={{ padding: "2px 6px", fontSize: "10px" }}>▼</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* FEATURED VIDEOS & SHORTS */}
            <div style={{ background: "rgba(255,255,255,0.02)", padding: "20px", borderRadius: "12px", border: "1px solid var(--border-color)" }}>
              <h3 style={{ margin: "0 0 10px 0", color: "var(--text-main)" }}>🎬 Featured Shorts Reels</h3>
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
      )}

      {activeTab === "sidebar" && (
        <div style={{ background: "rgba(255,255,255,0.02)", padding: "25px", borderRadius: "12px", border: "1px solid var(--border-color)" }}>
          <h3 style={{ margin: "0 0 10px 0", color: "var(--text-main)" }}>📱 Right Sidebar Widget Manager</h3>
          <p style={{ fontSize: "13px", color: "var(--text-muted)", margin: "0 0 20px 0" }}>
            Enable/Disable, rename, and change the ordering flow of right sidebar widgets dynamically without touching code.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            {sidebarWidgets.map((wid, idx) => {
              const badge = getWidgetBadge(wid.id);
              return (
                <div 
                  key={wid.id} 
                  style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    gap: "15px", 
                    padding: "15px", 
                    background: wid.isEnabled ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.01)", 
                    borderRadius: "10px", 
                    border: `1px solid ${wid.isEnabled ? "var(--border-color)" : "rgba(239,68,68,0.2)"}`,
                    opacity: wid.isEnabled ? 1 : 0.6
                  }}
                >
                  {/* Enabled Checkbox */}
                  <input 
                    type="checkbox" 
                    checked={wid.isEnabled} 
                    onChange={() => toggleSidebarWidgetEnabled(idx)}
                    style={{ width: "20px", height: "20px", cursor: "pointer" }}
                    title={wid.isEnabled ? "Widget Active" : "Widget Hidden"}
                  />

                  {/* Widget Details & Rename */}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", gap: "15px", marginBottom: "8px", alignItems: "center" }}>
                      <span style={{ fontSize: "11px", fontWeight: "900", padding: "4px 8px", background: badge.color, color: "white", borderRadius: "4px", textTransform: "uppercase" }}>
                        {badge.text}
                      </span>
                      <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Widget ID: {wid.id}</span>
                    </div>
                    <div style={{ display: "flex", gap: "10px" }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: "11px", fontWeight: "bold", display: "block", marginBottom: "3px" }}>Tamil Title</label>
                        <input
                          type="text"
                          value={wid.titleTa}
                          onChange={(e) => handleSidebarWidgetTextChange(idx, "ta", e.target.value)}
                          style={{ width: "100%", padding: "8px 10px", fontSize: "13px", borderRadius: "6px", border: "1px solid var(--border-color)", backgroundColor: "var(--card-bg)", color: "var(--text-main)", boxSizing: "border-box" }}
                        />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: "11px", fontWeight: "bold", display: "block", marginBottom: "3px" }}>English Title</label>
                        <input
                          type="text"
                          value={wid.titleEn}
                          onChange={(e) => handleSidebarWidgetTextChange(idx, "en", e.target.value)}
                          style={{ width: "100%", padding: "8px 10px", fontSize: "13px", borderRadius: "6px", border: "1px solid var(--border-color)", backgroundColor: "var(--card-bg)", color: "var(--text-main)", boxSizing: "border-box" }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Up / Down controllers */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <button 
                      type="button" 
                      onClick={() => moveSidebarWidget(idx, "up")} 
                      disabled={idx === 0} 
                      style={{ padding: "6px 10px", fontSize: "12px", fontWeight: "bold" }}
                    >
                      ▲
                    </button>
                    <button 
                      type="button" 
                      onClick={() => moveSidebarWidget(idx, "down")} 
                      disabled={idx === sidebarWidgets.length - 1} 
                      style={{ padding: "6px 10px", fontSize: "12px", fontWeight: "bold" }}
                    >
                      ▼
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === "trending" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "30px" }}>
          {/* Active Pinned Trending News */}
          <div style={{ background: "rgba(255,255,255,0.02)", padding: "25px", borderRadius: "12px", border: "1px solid var(--border-color)" }}>
            <h3 style={{ margin: "0 0 10px 0", color: "var(--text-main)" }}>🔥 Current Pinned Trending Stories</h3>
            <p style={{ fontSize: "13px", color: "var(--text-muted)", margin: "0 0 20px 0" }}>
              These articles will be ranked 01 to 05 on the website sidebar in this exact order.
            </p>

            {selectedTrendingNewsObjects.length === 0 ? (
              <div style={{ padding: "30px", textAlign: "center", border: "1px dashed var(--border-color)", borderRadius: "8px", color: "var(--text-muted)" }}>
                No trending stories pinned yet. Select articles from the right column.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {selectedTrendingNewsObjects.map((news, idx) => (
                  <div 
                    key={news._id}
                    style={{ 
                      display: "flex", 
                      alignItems: "center", 
                      gap: "12px", 
                      padding: "12px", 
                      background: "rgba(255,255,255,0.03)", 
                      borderRadius: "8px", 
                      border: "1px solid var(--border-color)" 
                    }}
                  >
                    <span style={{ fontSize: "1.2rem", fontWeight: "900", color: "#ef4444", minWidth: "25px" }}>
                      {idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                    </span>
                    <div style={{ flex: 1 }}>
                      <span className="category-tag" style={{ fontSize: "10px", padding: "2px 6px" }}>{news.category}</span>
                      <h4 style={{ margin: "4px 0 0 0", fontSize: "13px", color: "var(--text-main)", fontWeight: "600" }}>{news.title}</h4>
                    </div>
                    <div style={{ display: "flex", gap: "4px" }}>
                      <button 
                        type="button" 
                        onClick={() => moveTrendingStory(idx, "up")} 
                        disabled={idx === 0} 
                        style={{ padding: "4px 8px", fontSize: "10px" }}
                      >
                        ▲
                      </button>
                      <button 
                        type="button" 
                        onClick={() => moveTrendingStory(idx, "down")} 
                        disabled={idx === selectedTrendingNewsObjects.length - 1} 
                        style={{ padding: "4px 8px", fontSize: "10px" }}
                      >
                        ▼
                      </button>
                      <button 
                        type="button" 
                        onClick={() => removeTrendingStory(news._id)} 
                        style={{ padding: "4px 8px", fontSize: "10px", color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)", background: "rgba(239,68,68,0.05)" }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add News to Pinned list */}
          <div style={{ background: "rgba(255,255,255,0.02)", padding: "25px", borderRadius: "12px", border: "1px solid var(--border-color)" }}>
            <h3 style={{ margin: "0 0 10px 0", color: "var(--text-main)" }}>➕ Add Stories to Pinned Trending</h3>
            <p style={{ fontSize: "13px", color: "var(--text-muted)", margin: "0 0 20px 0" }}>
              Search published news articles and click "Add" to pin them to the trending list.
            </p>

            <input 
              type="text" 
              placeholder="Search news..." 
              value={trendingSearch} 
              onChange={(e) => setTrendingSearch(e.target.value)}
              style={{ width: "100%", padding: "10px 14px", borderRadius: "6px", border: "1px solid var(--border-color)", marginBottom: "15px", boxSizing: "border-box" }}
            />

            <div style={{ maxHeight: "400px", overflowY: "auto", border: "1px solid var(--border-color)", borderRadius: "8px", padding: "10px", display: "flex", flexDirection: "column", gap: "8px" }}>
              {remainingNewsForTrending.length === 0 ? (
                <div style={{ padding: "20px", textAlign: "center", color: "var(--text-muted)" }}>No published articles match.</div>
              ) : (
                remainingNewsForTrending.map(news => (
                  <div 
                    key={news._id}
                    style={{ 
                      display: "flex", 
                      justifyContent: "space-between", 
                      alignItems: "center", 
                      padding: "8px 10px", 
                      borderRadius: "6px", 
                      background: "rgba(255,255,255,0.01)", 
                      border: "1px solid rgba(255,255,255,0.03)" 
                    }}
                  >
                    <div style={{ flex: 1, marginRight: "10px" }}>
                      <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>[{news.category}]</span>
                      <h4 style={{ margin: "2px 0 0 0", fontSize: "12px", color: "var(--text-main)", display: "-webkit-box", WebkitLineClamp: "2", WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        {news.title}
                      </h4>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => addTrendingStory(news._id)}
                      className="btn-primary"
                      style={{ padding: "6px 12px", fontSize: "11px", height: "auto", margin: 0 }}
                    >
                      + Add
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === "mostread" && (
        <div style={{ background: "rgba(255,255,255,0.02)", padding: "25px", borderRadius: "12px", border: "1px solid var(--border-color)", maxWidth: "600px" }}>
          <h3 style={{ margin: "0 0 10px 0", color: "var(--text-main)" }}>📈 Most Read Settings (அதிகம் வாசிப்பு)</h3>
          <p style={{ fontSize: "13px", color: "var(--text-muted)", margin: "0 0 20px 0" }}>
            Configure default settings for the analytics-driven "Most Read" news list widget.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div>
              <label style={{ fontSize: "14px", fontWeight: "bold", display: "block", marginBottom: "6px" }}>Show Articles Count Limit</label>
              <input
                type="number"
                min="1"
                max="10"
                value={mostReadSettings.limit || 5}
                onChange={(e) => setMostReadSettings({ ...mostReadSettings, limit: parseInt(e.target.value) || 5 })}
                style={{ width: "100%", padding: "10px 12px", borderRadius: "6px", border: "1px solid var(--border-color)", backgroundColor: "var(--card-bg)", color: "var(--text-main)", boxSizing: "border-box" }}
              />
            </div>

            <div>
              <label style={{ fontSize: "14px", fontWeight: "bold", display: "block", marginBottom: "6px" }}>Minimum Views Threshold</label>
              <input
                type="number"
                min="0"
                value={mostReadSettings.minViews || 0}
                onChange={(e) => setMostReadSettings({ ...mostReadSettings, minViews: parseInt(e.target.value) || 0 })}
                style={{ width: "100%", padding: "10px 12px", borderRadius: "6px", border: "1px solid var(--border-color)", backgroundColor: "var(--card-bg)", color: "var(--text-main)", boxSizing: "border-box" }}
              />
              <span style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px", display: "block" }}>
                Filter out articles with views counts below this threshold.
              </span>
            </div>

            <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", fontSize: "14px", fontWeight: "bold" }}>
              <input
                type="checkbox"
                checked={mostReadSettings.showViews !== false}
                onChange={(e) => setMostReadSettings({ ...mostReadSettings, showViews: e.target.checked })}
                style={{ width: "18px", height: "18px" }}
              />
              Display Views Count Badge on Frontend
            </label>
          </div>
        </div>
      )}
    </div>
  );
}

export default HomepageBuilder;

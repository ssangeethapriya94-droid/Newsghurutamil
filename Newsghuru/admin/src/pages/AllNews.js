import { useEffect, useState } from "react";
import API from "../config/api";
import "../styles/AllNews.css";
import RelativeTime from "../components/RelativeTime";

function AllNews() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Bulk selection state
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [selectMode, setSelectMode] = useState(false);

  // FETCH NEWS
  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const res = await API.get("/api/news");
      setNews(res.data || []);
    } catch (error) {
      console.error("Fetch Error:", error);
      alert("Failed to load news");
    } finally {
      setLoading(false);
    }
  };

  // ─── SELECTION HELPERS ─────────────────────────────────────────
  const toggleSelectMode = () => {
    setSelectMode((prev) => !prev);
    setSelectedIds(new Set());
  };

  const toggleSelectOne = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAllInGroup = (groupItems) => {
    const groupIds = groupItems.map((i) => i._id);
    setSelectedIds((prev) => {
      const next = new Set(prev);
      const allSelected = groupIds.every((id) => next.has(id));
      if (allSelected) {
        groupIds.forEach((id) => next.delete(id));
      } else {
        groupIds.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  const selectAll = () => {
    if (selectedIds.size === news.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(news.map((n) => n._id)));
    }
  };

  // ─── DELETE HANDLERS ────────────────────────────────────────────

  // DELETE SINGLE NEWS
  const deleteNews = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this news?");
    if (!confirmDelete) return;
    try {
      await API.delete(`/api/news/${id}`);
      setNews((prev) => prev.filter((item) => item._id !== id));
      setSelectedIds((prev) => { const n = new Set(prev); n.delete(id); return n; });
    } catch (error) {
      console.error("Delete Error:", error);
      alert("Delete Failed");
    }
  };

  // DELETE SELECTED (BULK)
  const deleteSelected = async () => {
    if (selectedIds.size === 0) return;
    const confirmDelete = window.confirm(
      `⚠️ Are you sure you want to delete ${selectedIds.size} selected news item${selectedIds.size > 1 ? "s" : ""}? This cannot be undone!`
    );
    if (!confirmDelete) return;

    try {
      // Delete all selected in parallel
      await Promise.all([...selectedIds].map((id) => API.delete(`/api/news/${id}`)));
      setNews((prev) => prev.filter((item) => !selectedIds.has(item._id)));
      setSelectedIds(new Set());
      alert(`✅ ${selectedIds.size > 0 ? "Selected" : ""} News deleted successfully!`);
    } catch (error) {
      console.error("Bulk Delete Error:", error);
      alert("Bulk delete failed. Some items may not have been deleted.");
    }
  };

  // DELETE ALL NEWS
  const deleteAllNews = async () => {
    if (news.length === 0) { alert("No news to delete"); return; }
    const confirmDelete = window.confirm("⚠️ Are you sure you want to DELETE ALL news? This action cannot be undone!");
    if (!confirmDelete) return;
    try {
      await API.delete("/api/news");
      setNews([]);
      setSelectedIds(new Set());
    } catch (error) {
      console.error("Delete All Error:", error);
      alert("Delete All Failed — Check backend route");
    }
  };

  // DELETE NEWS BY DATE
  const deleteNewsByDate = async (dateHeading, groupedItems) => {
    if (!groupedItems || groupedItems.length === 0) return;
    const confirmDelete = window.confirm(`Are you sure you want to delete all news for ${dateHeading}?`);
    if (!confirmDelete) return;
    try {
      const firstItem = groupedItems[0];
      const dateObj = new Date(firstItem.date || firstItem.createdAt);
      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, "0");
      const day = String(dateObj.getDate()).padStart(2, "0");
      const dateString = `${year}-${month}-${day}`;

      await API.delete(`/api/news/date/${dateString}`);

      const deletedIds = new Set(groupedItems.map((i) => i._id));
      setNews((prev) => prev.filter((item) => {
        const itemDate = new Date(item.date || item.createdAt);
        const itemYear = itemDate.getFullYear();
        const itemMonth = String(itemDate.getMonth() + 1).padStart(2, "0");
        const itemDay = String(itemDate.getDate()).padStart(2, "0");
        return `${itemYear}-${itemMonth}-${itemDay}` !== dateString;
      }));
      setSelectedIds((prev) => { const n = new Set(prev); deletedIds.forEach((id) => n.delete(id)); return n; });
    } catch (error) {
      console.error("Delete Date Error:", error);
      alert("Delete Date Failed");
    }
  };

  // ─── GROUPING HELPERS ───────────────────────────────────────────
  const getGroupedDateString = (dateInput) => {
    if (!dateInput) return "Unknown Date";
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return "Unknown Date";
    const dateAndYear = d.toLocaleDateString("ta-IN", { day: "numeric", month: "long", year: "numeric" });
    const dayName = d.toLocaleDateString("ta-IN", { weekday: "long" });
    return `${dateAndYear} | ${dayName}`;
  };

  const getGroupedNews = () => {
    const groups = {};
    const sortedNews = [...news].sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt));
    sortedNews.forEach((item) => {
      const dateKey = getGroupedDateString(item.date || item.createdAt || item.time);
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(item);
    });
    return groups;
  };

  // LOADING STATE
  if (loading) return <div className="loading-text">Loading News...</div>;

  const groupedNews = getGroupedNews();

  return (
    <div className="all-news-page">

      {/* ── HEADER ── */}
      <div className="all-news-header">
        <h1 className="all-news-title">All News</h1>
        <div className="header-actions">
          <div className="news-count">Total: {news.length}</div>

          {/* SELECT MODE TOGGLE */}
          <button
            className={`select-mode-btn ${selectMode ? "select-mode-active" : ""}`}
            onClick={toggleSelectMode}
          >
            {selectMode ? "✕ Cancel" : "☑ Select"}
          </button>

          {/* SELECT ALL (only in select mode) */}
          {selectMode && (
            <button className="select-all-btn" onClick={selectAll}>
              {selectedIds.size === news.length ? "Deselect All" : "Select All"}
            </button>
          )}

          {/* DELETE SELECTED (only when items are selected) */}
          {selectMode && selectedIds.size > 0 && (
            <button className="delete-selected-btn" onClick={deleteSelected}>
              🗑️ Delete Selected ({selectedIds.size})
            </button>
          )}

          <button className="delete-all-btn" onClick={deleteAllNews} disabled={news.length === 0}>
            🗑️ Delete All
          </button>
        </div>
      </div>

      {/* ── BULK SELECTION INFO BAR ── */}
      {selectMode && (
        <div className="bulk-info-bar">
          <span>
            {selectedIds.size === 0
              ? "Click checkboxes or cards to select news for bulk deletion."
              : `${selectedIds.size} item${selectedIds.size > 1 ? "s" : ""} selected`}
          </span>
          {selectedIds.size > 0 && (
            <button className="bulk-clear-btn" onClick={() => setSelectedIds(new Set())}>
              Clear selection
            </button>
          )}
        </div>
      )}

      {/* ── EMPTY STATE ── */}
      {news.length === 0 ? (
        <div className="empty-news">
          <h2>No News Found</h2>
          <p>Upload your first news 🚀</p>
        </div>
      ) : (
        <div className="news-timeline">
          {Object.keys(groupedNews).map((dateHeading) => {
            const groupItems = groupedNews[dateHeading];
            const groupIds = groupItems.map((i) => i._id);
            const allGroupSelected = selectMode && groupIds.every((id) => selectedIds.has(id));
            const someGroupSelected = selectMode && groupIds.some((id) => selectedIds.has(id));

            return (
              <div key={dateHeading} className="news-date-section">

                {/* SECTION HEADER */}
                <div className="news-date-section-header">
                  <div className="section-header-left">
                    {/* Group-level select checkbox */}
                    {selectMode && (
                      <input
                        type="checkbox"
                        className="group-checkbox"
                        checked={allGroupSelected}
                        ref={(el) => { if (el) el.indeterminate = someGroupSelected && !allGroupSelected; }}
                        onChange={() => selectAllInGroup(groupItems)}
                        title="Select / deselect all in this date group"
                      />
                    )}
                    <h2 className="news-section-title">📅 {dateHeading}</h2>
                  </div>
                  <button
                    onClick={() => deleteNewsByDate(dateHeading, groupItems)}
                    className="delete-date-btn"
                  >
                    🗑️ Delete Day's News
                  </button>
                </div>

                {/* GRID */}
                <div className="news-grid">
                  {groupItems.map((item) => {
                    const isSelected = selectedIds.has(item._id);
                    return (
                      <div
                        key={item._id}
                        className={`news-card ${selectMode ? "selectable" : ""} ${isSelected ? "card-selected" : ""}`}
                        onClick={() => selectMode && toggleSelectOne(item._id)}
                      >
                        {/* CHECKBOX OVERLAY */}
                        {selectMode && (
                          <div className="card-checkbox-wrapper">
                            <input
                              type="checkbox"
                              className="card-checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelectOne(item._id)}
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                        )}

                        {/* IMAGE */}
                        <img src={item.image} alt={item.title} className="news-image" />

                        {/* CONTENT */}
                        <div className="news-content">
                          <span className="news-category">{item.category}</span>
                          <h2 className="news-title">{item.title}</h2>
                          <p className="news-description">{item.description?.substring(0, 140)}...</p>

                          {/* META */}
                          <div className="news-meta">
                            <div className="meta-box">
                              ⏰ <RelativeTime createdAt={item.createdAt} fallback={item.time} />
                            </div>
                          </div>

                          {/* ACTIONS — hide delete button when in select mode */}
                          {!selectMode && (
                            <div className="news-actions">
                              <button
                                onClick={(e) => { e.stopPropagation(); deleteNews(item._id); }}
                                className="delete-btn"
                              >
                                Delete News
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default AllNews;
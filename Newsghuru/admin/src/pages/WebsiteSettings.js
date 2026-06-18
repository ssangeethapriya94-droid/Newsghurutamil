import React, { useState, useEffect, useCallback } from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import API from "../config/api";
import "../styles/Account.css";
import { 
  FiEye, FiEdit2, FiGlobe, FiClock, FiFileText, FiShield, FiLock, FiAlertTriangle, FiMail 
} from "react-icons/fi";

const PAGE_OPTIONS = [
  { slug: "about", title: "About Us", icon: <FiFileText />, desc: "Manage and publish information about NewsGhuru" },
  { slug: "privacy", title: "Privacy Policy", icon: <FiShield />, desc: "Manage and publish the Privacy Policy for NewsGhuru" },
  { slug: "terms", title: "Terms & Conditions", icon: <FiLock />, desc: "Manage and publish terms of service and usage guidelines" },
  { slug: "disclaimer", title: "Disclaimer", icon: <FiAlertTriangle />, desc: "Manage and publish legal disclaimers" },
  { slug: "contact", title: "Contact Us", icon: <FiMail />, desc: "Manage contact information and instructions" },
  { slug: "advertise", title: "Advertise With Us", icon: <FiGlobe />, desc: "Manage details about advertisement options" }
];

function WebsiteSettings() {
  const [selectedSlug, setSelectedSlug] = useState("about");
  const [content, setContent] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("edit"); // "edit" or "preview"

  const fetchPageContent = useCallback(async () => {
    try {
      setLoading(true);
      const res = await API.get(`/api/pages/${selectedSlug}`);
      if (res.data && res.data.success) {
        setContent(res.data.content || "");
        setLastUpdated(res.data.lastUpdated);
      }
    } catch (err) {
      console.error(`Error fetching page ${selectedSlug}:`, err);
      alert("Failed to load page content.");
    } finally {
      setLoading(false);
    }
  }, [selectedSlug]);

  useEffect(() => {
    fetchPageContent();
  }, [fetchPageContent]);

  const handlePublish = async (e) => {
    e.preventDefault();
    if (!content.trim()) {
      alert("Page content cannot be empty.");
      return;
    }

    const currentPage = PAGE_OPTIONS.find(p => p.slug === selectedSlug);
    const title = currentPage ? currentPage.title : "Static Page";

    try {
      setSaving(true);
      const res = await API.put(`/api/admin/pages/${selectedSlug}`, {
        title,
        content
      });
      if (res.data && res.data.success) {
        setContent(res.data.page?.content || "");
        setLastUpdated(res.data.page?.lastUpdated);
        alert(`"${title}" published successfully! 🚀`);
      }
    } catch (err) {
      console.error(`Error publishing page ${selectedSlug}:`, err);
      alert(err.response?.data?.message || "Failed to publish page content.");
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "Never";
    return new Date(dateStr).toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ color: [] }, { background: [] }],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ align: [] }],
      ["link", "clean"],
    ],
  };

  const currentPageInfo = PAGE_OPTIONS.find(p => p.slug === selectedSlug) || {};

  return (
    <div className="account-page">
      <div className="account-header">
        <h1 className="account-title">{currentPageInfo.title}</h1>
        <p className="account-subtitle">{currentPageInfo.desc}</p>
      </div>

      {/* Pages Tabs selector */}
      <div className="settings-tabs-container">
        {PAGE_OPTIONS.map((page) => (
          <button
            key={page.slug}
            className={`settings-tab ${selectedSlug === page.slug ? "active" : ""}`}
            onClick={() => setSelectedSlug(page.slug)}
          >
            {page.icon} {page.title}
          </button>
        ))}
      </div>

      <div className="cms-editor-container">
        {loading ? (
          <div style={{ padding: "80px", textAlign: "center", color: "var(--text-muted)", background: "var(--card-bg)", borderRadius: "12px", border: "1px solid var(--border-color)" }}>
            Loading page content...
          </div>
        ) : (
          <div className="account-card" style={{ display: "block" }}>
            <div className="cms-toolbar">
              <div className="last-published-info">
                <FiClock style={{ color: "#f97316" }} />
                <span><strong>Last Published:</strong> {formatDate(lastUpdated)}</span>
              </div>
              
              <div className="editor-mode-toggle">
                <button 
                  type="button"
                  className={`mode-toggle-btn ${activeTab === "edit" ? "active" : ""}`}
                  onClick={() => setActiveTab("edit")}
                >
                  <FiEdit2 size={14} /> Edit
                </button>
                <button 
                  type="button"
                  className={`mode-toggle-btn ${activeTab === "preview" ? "active" : ""}`}
                  onClick={() => setActiveTab("preview")}
                >
                  <FiEye size={14} /> Preview
                </button>
              </div>
            </div>

            <form onSubmit={handlePublish}>
              {activeTab === "edit" ? (
                <div style={{ marginBottom: "25px" }}>
                  <label style={{ display: "block", fontWeight: 600, marginBottom: "12px", fontSize: "14px", color: "var(--text-main)" }}>
                    Rich Text Content Editor
                  </label>
                  <div className="quill-editor-wrapper">
                    <ReactQuill
                      theme="snow"
                      value={content}
                      onChange={setContent}
                      modules={modules}
                      style={{ color: "black" }}
                    />
                  </div>
                </div>
              ) : (
                <div style={{ marginBottom: "25px" }}>
                  <label style={{ display: "block", fontWeight: 600, marginBottom: "15px", fontSize: "14px", color: "var(--text-main)" }}>
                    Live Preview (NewsGhuru Client View)
                  </label>
                  <div 
                    className="preview-container"
                    dangerouslySetInnerHTML={{ __html: content || "<p style='color: #888;'>No content written yet. Use the Edit tab to write some.</p>" }}
                  />
                </div>
              )}

              <div className="cms-actions-footer">
                <button
                  type="button"
                  className="save-btn discard-btn"
                  onClick={fetchPageContent}
                  disabled={saving}
                >
                  Discard Changes
                </button>
                
                <button
                  type="submit"
                  className="save-btn publish-btn"
                  disabled={saving}
                >
                  <FiGlobe /> {saving ? "Publishing..." : "Publish Updates"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default WebsiteSettings;

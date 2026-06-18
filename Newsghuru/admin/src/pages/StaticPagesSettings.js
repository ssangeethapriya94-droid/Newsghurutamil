import React, { useState, useEffect } from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import API from "../config/api";
import { FiEye, FiEdit2, FiGlobe, FiClock, FiLayers } from "react-icons/fi";
import "../styles/ReporterCreateNews.css"; // Reuse forms
import "../styles/Sidebar.css"; // Reuse color variables

const PAGE_OPTIONS = [
  { slug: "about", title: "About Us" },
  { slug: "privacy", title: "Privacy Policy" },
  { slug: "terms", title: "Terms & Conditions" },
  { slug: "disclaimer", title: "Disclaimer" },
  { slug: "contact", title: "Contact Us" },
  { slug: "advertise", title: "Advertise With Us" }
];

function StaticPagesSettings() {
  const [selectedSlug, setSelectedSlug] = useState("about");
  const [content, setContent] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("edit"); // "edit" or "preview"

  useEffect(() => {
    fetchPageContent();
  }, [selectedSlug]);

  const fetchPageContent = async () => {
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
  };

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

  return (
    <div className="reporter-create-news" style={{ padding: "30px", maxWidth: "1100px", margin: "0 auto" }}>
      <div className="header-actions" style={{ marginBottom: "30px" }}>
        <div>
          <h2>⚙️ Static Pages CMS</h2>
          <div style={{ color: "var(--text-muted)", fontSize: "14px", marginTop: "5px" }}>
            Create, Edit, and Publish legal policies and static informational pages for NewsGhuru.
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: "25px", flexWrap: "wrap", width: "100%" }}>
        
        {/* Left Side: Page Selector */}
        <div style={{ flex: "1 1 250px", minWidth: "220px" }}>
          <div className="form-card" style={{ background: "var(--bg-light)", padding: "20px", borderRadius: "10px", border: "1px solid var(--border-color)", position: "sticky", top: "20px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: 600, display: "flex", alignItems: "center", gap: "8px", margin: "0 0 15px 0" }}>
              <FiLayers style={{ color: "#f97316" }} /> Select Page
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {PAGE_OPTIONS.map(page => (
                <button
                  key={page.slug}
                  type="button"
                  onClick={() => setSelectedSlug(page.slug)}
                  style={{
                    textAlign: "left",
                    padding: "10px 14px",
                    borderRadius: "6px",
                    border: "1px solid",
                    borderColor: selectedSlug === page.slug ? "#f97316" : "var(--border-color)",
                    background: selectedSlug === page.slug ? "linear-gradient(135deg, rgba(249, 115, 22, 0.08), rgba(234, 88, 12, 0.08))" : "white",
                    color: selectedSlug === page.slug ? "#ea580c" : "var(--text-secondary)",
                    fontWeight: selectedSlug === page.slug ? 700 : 500,
                    cursor: "pointer",
                    fontSize: "14px",
                    transition: "0.2s"
                  }}
                >
                  {page.title}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Rich Text Editor & Live Preview */}
        <div style={{ flex: "3 1 600px", minWidth: "300px" }}>
          {loading ? (
            <div style={{ padding: "80px", textAlign: "center", color: "var(--text-muted)", background: "var(--bg-light)", borderRadius: "12px", border: "1px solid var(--border-color)" }}>
              Loading page content...
            </div>
          ) : (
            <div className="form-card" style={{ background: "var(--bg-light)", padding: "30px", borderRadius: "12px", border: "1px solid var(--border-color)", boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
              
              {/* Toolbar */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "25px", paddingBottom: "15px", borderBottom: "1px solid var(--border-color)", flexWrap: "wrap", gap: "10px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", color: "var(--text-muted)" }}>
                  <FiClock style={{ color: "#f97316" }} />
                  <span><strong>Last Published:</strong> {formatDate(lastUpdated)}</span>
                </div>
                
                {/* Tabs */}
                <div style={{ display: "flex", background: "rgba(0,0,0,0.05)", padding: "4px", borderRadius: "8px" }}>
                  <button 
                    type="button"
                    onClick={() => setActiveTab("edit")}
                    style={{ 
                      display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px", border: "none", borderRadius: "6px", 
                      background: activeTab === "edit" ? "white" : "transparent", 
                      color: activeTab === "edit" ? "black" : "var(--text-muted)", 
                      fontWeight: 600, cursor: "pointer", transition: "0.2s" 
                    }}
                  >
                    <FiEdit2 size={14} /> Edit
                  </button>
                  <button 
                    type="button"
                    onClick={() => setActiveTab("preview")}
                    style={{ 
                      display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px", border: "none", borderRadius: "6px", 
                      background: activeTab === "preview" ? "white" : "transparent", 
                      color: activeTab === "preview" ? "black" : "var(--text-muted)", 
                      fontWeight: 600, cursor: "pointer", transition: "0.2s" 
                    }}
                  >
                    <FiEye size={14} /> Preview
                  </button>
                </div>
              </div>

              <form onSubmit={handlePublish}>
                {activeTab === "edit" ? (
                  <div style={{ marginBottom: "25px" }}>
                    <label style={{ display: "block", fontWeight: 600, marginBottom: "10px", fontSize: "14px" }}>
                      HTML Content Editor
                    </label>
                    <div style={{ background: "white", borderRadius: "8px", overflow: "hidden" }}>
                      <ReactQuill
                        theme="snow"
                        value={content}
                        onChange={setContent}
                        modules={modules}
                        style={{ height: "400px", color: "black" }}
                      />
                    </div>
                    {/* Spacer to offset Quill absolute height */}
                    <div style={{ height: "50px" }}></div>
                  </div>
                ) : (
                  <div style={{ marginBottom: "25px" }}>
                    <label style={{ display: "block", fontWeight: 600, marginBottom: "15px", fontSize: "14px" }}>
                      Live Preview (NewsGhuru Client View)
                    </label>
                    <div 
                      style={{ 
                        background: "white", border: "1px solid var(--border-color)", borderRadius: "8px", 
                        padding: "30px", minHeight: "450px", overflowY: "auto", color: "black",
                        lineHeight: "1.8", fontFamily: "Inter, sans-serif" 
                      }}
                      dangerouslySetInnerHTML={{ __html: content || "<p style='color: #888;'>No content written yet. Use the Edit tab to write some.</p>" }}
                    />
                  </div>
                )}

                {/* Actions */}
                <div style={{ display: "flex", gap: "15px", justifyContent: "flex-end", marginTop: "20px" }}>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={fetchPageContent}
                    disabled={saving}
                    style={{ display: "flex", alignItems: "center", gap: "8px", height: "42px", padding: "0 20px", borderRadius: "6px", fontWeight: 600, cursor: "pointer" }}
                  >
                    Discard Changes
                  </button>
                  
                  <button
                    type="submit"
                    disabled={saving}
                    style={{ 
                      display: "flex", alignItems: "center", gap: "8px", height: "42px", padding: "0 24px", borderRadius: "6px", 
                      background: "linear-gradient(135deg, #f97316, #ea580c)", color: "white", border: "none",
                      fontWeight: 600, cursor: "pointer", boxShadow: "0 4px 10px rgba(249, 115, 22, 0.3)", transition: "0.2s"
                    }}
                  >
                    <FiGlobe /> {saving ? "Publishing..." : "Publish Updates"}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default StaticPagesSettings;

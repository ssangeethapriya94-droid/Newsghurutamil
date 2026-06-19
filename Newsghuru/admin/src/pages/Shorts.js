import React, { useState, useEffect } from "react";
import API from "../config/api";
import "../styles/ReporterMyArticles.css";
import { FaTimes, FaEye } from "react-icons/fa";

function Shorts() {
  const [shorts, setShorts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth >= 1024);

  // Form states
  const [title, setTitle] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [category, setCategory] = useState("General");
  const [description, setDescription] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [isEnabled, setIsEnabled] = useState(true);

  // Uploading states
  const [uploadingVideo, setUploadingVideo] = useState(false);

  // Edit states
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editVideoUrl, setEditVideoUrl] = useState("");
  const [editCategory, setEditCategory] = useState("General");
  const [editDescription, setEditDescription] = useState("");
  const [editIsFeatured, setEditIsFeatured] = useState(false);
  const [editIsEnabled, setEditIsEnabled] = useState(true);
  const [editUploadingVideo, setEditUploadingVideo] = useState(false);

  // Preview Modal state
  const [previewShort, setPreviewShort] = useState(null);

  const fetchShorts = async () => {
    try {
      setLoading(true);
      const res = await API.get("/api/shorts");
      setShorts(res.data || []);
    } catch (error) {
      console.error("Fetch shorts error:", error);
      alert("Failed to load shorts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShorts();
    const handleResize = () => setIsLargeScreen(window.innerWidth >= 1024);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Video File Uploader
  const handleVideoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file); // key matches backend upload multer field name

    try {
      setUploadingVideo(true);
      const res = await API.post("/api/media/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setVideoUrl(res.data.url);
      alert("Shorts video file uploaded successfully! 🎥");
    } catch (error) {
      console.error("Shorts video upload error:", error);
      alert("Failed to upload shorts video file");
    } finally {
      setUploadingVideo(false);
    }
  };

  // Edit Video Uploader
  const handleEditVideoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    try {
      setEditUploadingVideo(true);
      const res = await API.post("/api/media/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setEditVideoUrl(res.data.url);
      alert("Edit shorts video file uploaded successfully! 🎥");
    } catch (error) {
      console.error("Edit video upload error:", error);
      alert("Failed to upload edit video");
    } finally {
      setEditUploadingVideo(false);
    }
  };

  const isVideoUrl = (url) => {
    if (!url) return false;
    const lower = url.toLowerCase();
    return (
      lower.endsWith(".mp4") ||
      lower.endsWith(".webm") ||
      lower.endsWith(".ogg") ||
      lower.endsWith(".mov") ||
      lower.endsWith(".m4v") ||
      lower.includes("video")
    );
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title.trim() || !videoUrl.trim()) {
      alert("Title and video file are required. Please upload the video file first.");
      return;
    }

    try {
      await API.post("/api/shorts", {
        title: title.trim(),
        thumbnail: videoUrl.trim(),
        videoUrl: videoUrl.trim(),
        category,
        description: description.trim(),
        isFeatured,
        isEnabled
      });

      // Clear fields
      setTitle("");
      setVideoUrl("");
      setDescription("");
      setCategory("General");
      setIsFeatured(false);
      setIsEnabled(true);

      // Reset file input fields
      const fileInputs = document.querySelectorAll('input[type="file"]');
      fileInputs.forEach(input => { input.value = ""; });

      alert("Short created successfully 🎉");
      fetchShorts();
    } catch (error) {
      console.error("Create short error:", error);
      alert(error.response?.data?.message || "Failed to create short");
    }
  };

  const handleUpdate = async (id) => {
    if (!editTitle.trim() || !editVideoUrl.trim()) {
      alert("Title and video URL cannot be empty");
      return;
    }

    try {
      await API.put(`/api/shorts/${id}`, {
        title: editTitle.trim(),
        thumbnail: editVideoUrl.trim(),
        videoUrl: editVideoUrl.trim(),
        category: editCategory,
        description: editDescription.trim(),
        isFeatured: editIsFeatured,
        isEnabled: editIsEnabled
      });
      setEditingId(null);
      alert("Short updated successfully");
      fetchShorts();
    } catch (error) {
      console.error("Update short error:", error);
      alert(error.response?.data?.message || "Failed to update short");
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete the short "${name}"?`)) {
      return;
    }

    try {
      await API.delete(`/api/shorts/${id}`);
      alert("Short deleted successfully");
      fetchShorts();
    } catch (error) {
      console.error("Delete short error:", error);
      alert(error.response?.data?.message || "Failed to delete short");
    }
  };

  const toggleStatus = async (item) => {
    try {
      await API.put(`/api/shorts/${item._id}`, {
        ...item,
        isEnabled: !item.isEnabled
      });
      fetchShorts();
    } catch (error) {
      console.error("Toggle short status error:", error);
      alert("Failed to toggle short status");
    }
  };

  const startEdit = (sh) => {
    setEditingId(sh._id);
    setEditTitle(sh.title);
    setEditVideoUrl(sh.videoUrl);
    setEditCategory(sh.category || "General");
    setEditDescription(sh.description || "");
    setEditIsFeatured(sh.isFeatured || false);
    setEditIsEnabled(sh.isEnabled || false);
  };

  // Checks if URL is YouTube link or direct video file
  const renderShortVideoPlayer = (url, title) => {
    if (!url) return null;
    const isYoutube = url.includes("youtube.com") || url.includes("youtu.be") || url.includes("embed");
    if (isYoutube) {
      return (
        <iframe
          src={url}
          title={title || "Short Reel"}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          style={{ width: "100%", height: "100%" }}
        ></iframe>
      );
    } else {
      return (
        <video
          src={url}
          controls
          autoPlay
          style={{ width: "100%", height: "100%", objectFit: "cover", background: "#000" }}
        ></video>
      );
    }
  };

  return (
    <div className="reporter-my-articles">
      <div className="header-actions">
        <h2>📱 Shorts Reels Management</h2>
        <div className="header-subtitle">
          Upload 9:16 vertical shorts video reels for mobile-style video feeds.
        </div>
      </div>

      {/* CREATE FORM - styled compactly to eliminate empty spaces */}
      <form onSubmit={handleCreate} className="categories-create-form" style={{ display: "flex", flexDirection: "column", gap: "15px", alignItems: "stretch", padding: "20px", background: "rgba(255,255,255,0.02)", borderRadius: "8px", border: "1px solid var(--border-color)" }}>
        <h3 style={{ margin: 0, color: "var(--text-main)", fontSize: "1.1rem" }}>Add New Short Reel</h3>
        
        {/* Row 1: Title & Category */}
        <div style={{ display: "grid", gridTemplateColumns: isLargeScreen ? "2.5fr 1fr" : "1fr", gap: "15px" }}>
          <div className="form-group" style={{ flex: "none", minWidth: "auto", margin: 0 }}>
            <label style={{ fontSize: "14px", fontWeight: "600", marginBottom: "4px", color: "var(--text-main)" }}>Short Title (Tamil)</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. தங்கம் விலை அதிரடி சரிவு..."
              style={{ padding: "10px 14px", fontSize: "14px", height: "40px" }}
            />
          </div>

          <div className="form-group" style={{ flex: "none", minWidth: "auto", margin: 0 }}>
            <label style={{ fontSize: "14px", fontWeight: "600", marginBottom: "4px", color: "var(--text-main)" }}>Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{
                padding: "10px 14px",
                borderRadius: "8px",
                border: "1px solid var(--border-color)",
                outline: "none",
                fontSize: "14px",
                backgroundColor: "var(--card-bg)",
                color: "var(--text-main)",
                height: "40px"
              }}
            >
              <option value="General">General (பொது)</option>
              <option value="Politics">Politics (அரசியல்)</option>
              <option value="Sports">Sports (விளையாட்டு)</option>
              <option value="Cinema">Cinema (சினிமா)</option>
              <option value="Business">Business (வணிகம்)</option>
            </select>
          </div>
        </div>

        {/* Row 2: File Uploads & Live Previews */}
        <div className="form-group" style={{ flex: "none", minWidth: "auto", margin: 0 }}>
          <label style={{ fontSize: "14px", fontWeight: "600", marginBottom: "4px", color: "var(--text-main)" }}>Upload Shorts Video File</label>
          <input
            type="file"
            accept="video/*"
            onChange={handleVideoUpload}
            style={{ padding: "8px", fontSize: "13px", border: "1px dashed var(--border-color)", borderRadius: "8px", background: "var(--card-bg)", color: "var(--text-main)", width: "100%" }}
          />
          {uploadingVideo && <span style={{ fontSize: "12px", color: "var(--accent-orange)", marginTop: "4px" }}>Uploading video...</span>}
          {videoUrl && (
            <div style={{ marginTop: "8px" }}>
              <span style={{ fontSize: "12px", color: "#10b981", fontWeight: "bold", display: "block" }}>✓ Video Uploaded (Preview below):</span>
              <video src={videoUrl} controls style={{ width: "100%", maxHeight: "200px", borderRadius: "6px", background: "#000", marginTop: "4px" }} />
            </div>
          )}
        </div>

        {/* Row 3: Caption / Mini Description */}
        <div className="form-group" style={{ flex: "none", minWidth: "auto", margin: 0 }}>
          <label style={{ fontSize: "14px", fontWeight: "600", marginBottom: "4px", color: "var(--text-main)" }}>Caption / Mini Description</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Write a brief caption for this short..."
            style={{
              padding: "10px 14px",
              borderRadius: "8px",
              border: "1px solid var(--border-color)",
              outline: "none",
              fontSize: "14px",
              backgroundColor: "var(--card-bg)",
              color: "var(--text-main)",
              height: "40px"
            }}
          />
        </div>

        {/* Row 4: Status Checkboxes & Save button */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "15px", marginTop: "5px" }}>
          <div style={{ display: "flex", gap: "20px" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", cursor: "pointer", fontWeight: "600" }}>
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                style={{ width: "16px", height: "16px" }}
              />
              Featured Short
            </label>

            <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", cursor: "pointer", fontWeight: "600" }}>
              <input
                type="checkbox"
                checked={isEnabled}
                onChange={(e) => setIsEnabled(e.target.checked)}
                style={{ width: "16px", height: "16px" }}
              />
              Enable Short Reel Immediately
            </label>
          </div>

          <button type="submit" className="btn-primary add-category-btn" style={{ height: "40px", padding: "0 22px", fontSize: "14px", margin: 0 }}>
            Publish Short Reel
          </button>
        </div>
      </form>

      {/* LIST TABLE */}
      <div className="table-container" style={{ marginTop: "30px" }}>
        {loading && shorts.length === 0 ? (
          <div style={{ padding: "20px", textAlign: "center" }}>Loading shorts database...</div>
        ) : shorts.length === 0 ? (
          <div style={{ padding: "20px", textAlign: "center", color: "var(--text-muted)" }}>No shorts logged yet.</div>
        ) : (
          <table className="articles-table">
            <thead>
              <tr>
                <th style={{ width: "100px" }}>Cover Image</th>
                <th>Short Details</th>
                <th>Category</th>
                <th>Flags</th>
                <th>Status</th>
                <th style={{ width: "220px" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {shorts.map((sh) => (
                <tr key={sh._id}>
                  <td>
                    {sh.thumbnail && isVideoUrl(sh.thumbnail) ? (
                      <video 
                        src={sh.thumbnail} 
                        muted 
                        style={{ width: "60px", height: "100px", objectFit: "cover", borderRadius: "4px", border: "1px solid var(--border-color)" }} 
                      />
                    ) : (
                      <img 
                        src={sh.thumbnail} 
                        alt="preview" 
                        style={{ width: "60px", height: "100px", objectFit: "cover", borderRadius: "4px", border: "1px solid var(--border-color)" }} 
                        onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=200"; }}
                      />
                    )}
                  </td>
                  <td>
                    {editingId === sh._id ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          style={{ padding: "6px 10px", borderRadius: "4px", border: "1px solid var(--border-color)", fontSize: "14px" }}
                          placeholder="Title"
                        />
                        <div style={{ background: "rgba(255,255,255,0.02)", padding: "10px", borderRadius: "6px", border: "1px solid var(--border-color)", display: "flex", flexDirection: "column", gap: "6px" }}>
                          <label style={{ fontSize: "11px", fontWeight: "bold" }}>Edit Video File:</label>
                          <input type="file" accept="video/*" onChange={handleEditVideoUpload} style={{ fontSize: "11px" }} />
                          {editUploadingVideo && <span style={{ fontSize: "11px", color: "orange" }}>Uploading video...</span>}
                          <input
                            type="text"
                            value={editVideoUrl}
                            onChange={(e) => setEditVideoUrl(e.target.value)}
                            style={{ padding: "4px 8px", borderRadius: "4px", border: "1px solid var(--border-color)", fontSize: "11px" }}
                            placeholder="Video Link/URL"
                          />
                        </div>
                        <input
                          type="text"
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                          style={{ padding: "6px 10px", borderRadius: "4px", border: "1px solid var(--border-color)", fontSize: "12px" }}
                          placeholder="Caption"
                        />
                      </div>
                    ) : (
                      <div>
                        <div style={{ fontWeight: 600, color: "var(--text-main)" }}>{sh.title}</div>
                        <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>
                          {sh.description || "No caption written."}
                        </div>
                      </div>
                    )}
                  </td>
                  <td>
                    {editingId === sh._id ? (
                      <select
                        value={editCategory}
                        onChange={(e) => setEditCategory(e.target.value)}
                        style={{ padding: "6px 10px", borderRadius: "4px", border: "1px solid var(--border-color)" }}
                      >
                        <option value="General">General</option>
                        <option value="Politics">Politics</option>
                        <option value="Sports">Sports</option>
                        <option value="Cinema">Cinema</option>
                        <option value="Business">Business</option>
                      </select>
                    ) : (
                      <span className="category-tag">{sh.category}</span>
                    )}
                  </td>
                  <td>
                    {editingId === sh._id ? (
                      <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px" }}>
                        <input type="checkbox" checked={editIsFeatured} onChange={(e) => setEditIsFeatured(e.target.checked)} />
                        Featured
                      </label>
                    ) : (
                      sh.isFeatured ? (
                        <span className="status-badge badge-published" style={{ textAlign: "center" }}>Featured</span>
                      ) : (
                        <span style={{ color: "var(--text-muted)", fontSize: "12px" }}>Standard</span>
                      )
                    )}
                  </td>
                  <td>
                    {editingId === sh._id ? (
                      <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px" }}>
                        <input type="checkbox" checked={editIsEnabled} onChange={(e) => setEditIsEnabled(e.target.checked)} />
                        Enabled
                      </label>
                    ) : (
                      <button
                        onClick={() => toggleStatus(sh)}
                        className={`status-badge ${sh.isEnabled ? "badge-approved" : "badge-rejected"}`}
                        style={{ border: "none", cursor: "pointer", display: "inline-block", width: "80px", textAlign: "center" }}
                      >
                        {sh.isEnabled ? "Active" : "Disabled"}
                      </button>
                    )}
                  </td>
                  <td>
                    {editingId === sh._id ? (
                      <div style={{ display: "flex", gap: "10px" }}>
                        <button
                          className="action-btn edit"
                          onClick={() => handleUpdate(sh._id)}
                          style={{ color: "#10b981" }}
                        >
                          Save
                        </button>
                        <button
                          className="action-btn delete"
                          onClick={() => setEditingId(null)}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                        <button
                          className="action-btn edit"
                          onClick={() => startEdit(sh)}
                        >
                          Edit
                        </button>

                        {/* Preview Option Button */}
                        <button
                          className="action-btn edit"
                          onClick={() => setPreviewShort(sh)}
                          style={{ color: "var(--accent-orange)", display: "flex", alignItems: "center", gap: "4px" }}
                        >
                          <FaEye /> Preview
                        </button>

                        <button
                          className="action-btn delete"
                          onClick={() => handleDelete(sh._id, sh.title)}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* PREVIEW SHORTS MODAL OPTION */}
      {previewShort && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.85)", zIndex: 999999,
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "20px"
        }}>
          <div style={{
            background: "var(--bg-secondary, #1e1e24)",
            padding: "20px", borderRadius: "12px",
            width: "100%", maxWidth: "380px",
            border: "1px solid var(--border-color)",
            position: "relative"
          }}>
            <button
              onClick={() => setPreviewShort(null)}
              style={{
                position: "absolute", top: "10px", right: "15px",
                background: "none", border: "none", color: "var(--text-main, #fff)",
                fontSize: "20px", cursor: "pointer"
              }}
            >
              <FaTimes />
            </button>
            <h3 style={{ color: "var(--text-main)", marginBottom: "15px", fontSize: "1.1rem", paddingRight: "30px" }}>
              📱 Preview Short: {previewShort.title}
            </h3>
            <div style={{ width: "100%", height: "450px", borderRadius: "8px", overflow: "hidden", background: "#000" }}>
              {renderShortVideoPlayer(previewShort.videoUrl, previewShort.title)}
            </div>
            <div style={{ marginTop: "15px" }}>
              <span className="category-tag">{previewShort.category}</span>
              <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "10px" }}>
                {previewShort.description || "No caption written."}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Shorts;

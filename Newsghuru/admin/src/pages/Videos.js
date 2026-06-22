import React, { useState, useEffect } from "react";
import API from "../config/api";
import "../styles/ReporterMyArticles.css";
import { FaPlay, FaImage, FaTrash, FaCheck, FaTimes, FaEye } from "react-icons/fa";

function Videos() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth >= 1024);

  // Form states
  const [title, setTitle] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Politics");
  const [isFeatured, setIsFeatured] = useState(false);
  const [isTrending, setIsTrending] = useState(false);
  const [language, setLanguage] = useState("ta");
  const [languageFilter, setLanguageFilter] = useState("all");

  // Uploading states
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);

  // Edit states
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editThumbnail, setEditThumbnail] = useState("");
  const [editYoutubeUrl, setEditYoutubeUrl] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editCategory, setEditCategory] = useState("Politics");
  const [editIsFeatured, setEditIsFeatured] = useState(false);
  const [editIsTrending, setEditIsTrending] = useState(false);
  const [editLanguage, setEditLanguage] = useState("ta");
  const [editUploadingVideo, setEditUploadingVideo] = useState(false);
  const [editUploadingThumbnail, setEditUploadingThumbnail] = useState(false);

  // Preview Modal state
  const [previewVideo, setPreviewVideo] = useState(null);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/api/videos?language=${languageFilter}`);
      setVideos(res.data || []);
    } catch (error) {
      console.error("Fetch videos error:", error);
      alert("Failed to load videos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, [languageFilter]);

  useEffect(() => {
    const handleResize = () => setIsLargeScreen(window.innerWidth >= 1024);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Video File Uploader
  const handleVideoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file); // Key matches backend single("image") multer field name

    try {
      setUploadingVideo(true);
      const res = await API.post("/api/media/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setYoutubeUrl(res.data.url);
      alert("Video file uploaded successfully! 🎥");
    } catch (error) {
      console.error("Video upload error:", error);
      alert("Failed to upload video file");
    } finally {
      setUploadingVideo(false);
    }
  };

  // Thumbnail Image Uploader
  const handleThumbnailUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    try {
      setUploadingThumbnail(true);
      const res = await API.post("/api/media/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setThumbnail(res.data.url);
      alert("Thumbnail image uploaded successfully! 🖼️");
    } catch (error) {
      console.error("Thumbnail upload error:", error);
      alert("Failed to upload thumbnail image");
    } finally {
      setUploadingThumbnail(false);
    }
  };

  // Inline Edit Video Uploader
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
      setEditYoutubeUrl(res.data.url);
      alert("Edit video file uploaded successfully! 🎥");
    } catch (error) {
      console.error("Edit video upload error:", error);
      alert("Failed to upload edit video file");
    } finally {
      setEditUploadingVideo(false);
    }
  };

  // Inline Edit Thumbnail Uploader
  const handleEditThumbnailUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    try {
      setEditUploadingThumbnail(true);
      const res = await API.post("/api/media/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setEditThumbnail(res.data.url);
      alert("Edit thumbnail image uploaded successfully! 🖼️");
    } catch (error) {
      console.error("Edit thumbnail upload error:", error);
      alert("Failed to upload edit thumbnail image");
    } finally {
      setEditUploadingThumbnail(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title.trim() || !thumbnail.trim() || !youtubeUrl.trim()) {
      alert("Title, thumbnail, and video file are required. Please upload both files first.");
      return;
    }

    try {
      await API.post("/api/videos", {
        title: title.trim(),
        thumbnail: thumbnail.trim(),
        youtubeUrl: youtubeUrl.trim(),
        description: description.trim(),
        category,
        isFeatured,
        isTrending,
        language
      });

      // Clear fields
      setTitle("");
      setThumbnail("");
      setYoutubeUrl("");
      setDescription("");
      setCategory("Politics");
      setIsFeatured(false);
      setIsTrending(false);
      setLanguage("ta");

      // Reset file input fields
      const fileInputs = document.querySelectorAll('input[type="file"]');
      fileInputs.forEach(input => { input.value = ""; });

      alert("Video created successfully 🎉");
      fetchVideos();
    } catch (error) {
      console.error("Create video error:", error);
      alert(error.response?.data?.message || "Failed to create video");
    }
  };

  const handleUpdate = async (id) => {
    if (!editTitle.trim() || !editThumbnail.trim() || !editYoutubeUrl.trim()) {
      alert("Title, thumbnail, and video URL cannot be empty");
      return;
    }

    try {
      await API.put(`/api/videos/${id}`, {
        title: editTitle.trim(),
        thumbnail: editThumbnail.trim(),
        youtubeUrl: editYoutubeUrl.trim(),
        description: editDescription.trim(),
        category: editCategory,
        isFeatured: editIsFeatured,
        isTrending: editIsTrending,
        language: editLanguage
      });
      setEditingId(null);
      alert("Video updated successfully");
      fetchVideos();
    } catch (error) {
      console.error("Update video error:", error);
      alert(error.response?.data?.message || "Failed to update video");
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete the video news "${name}"?`)) {
      return;
    }

    try {
      await API.delete(`/api/videos/${id}`);
      alert("Video deleted successfully");
      fetchVideos();
    } catch (error) {
      console.error("Delete video error:", error);
      alert(error.response?.data?.message || "Failed to delete video");
    }
  };

  const startEdit = (vid) => {
    setEditingId(vid._id);
    setEditTitle(vid.title);
    setEditThumbnail(vid.thumbnail);
    setEditYoutubeUrl(vid.youtubeUrl);
    setEditDescription(vid.description || "");
    setEditCategory(vid.category || "Politics");
    setEditIsFeatured(vid.isFeatured || false);
    setEditIsTrending(vid.isTrending || false);
    setEditLanguage(vid.language || "ta");
  };

  // Checks if URL is YouTube link or direct video file
  const renderVideoPlayer = (url, title) => {
    if (!url) return null;
    const isYoutube = url.includes("youtube.com") || url.includes("youtu.be") || url.includes("embed");
    if (isYoutube) {
      return (
        <iframe
          src={url}
          title={title || "Video"}
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
          style={{ width: "100%", height: "100%", objectFit: "contain", background: "#000" }}
        ></video>
      );
    }
  };

  return (
    <div className="reporter-my-articles">
      <div className="header-actions" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2>🎥 Video News Management</h2>
          <div className="header-subtitle">
            Upload video clips and news logs for the video marquee track.
          </div>
        </div>
        <div>
          <select 
            value={languageFilter} 
            onChange={(e) => setLanguageFilter(e.target.value)} 
            style={{ padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "14px", cursor: "pointer" }}
          >
            <option value="all">All Languages</option>
            <option value="ta">Tamil</option>
            <option value="en">English</option>
          </select>
        </div>
      </div>

      {/* CREATE FORM - styled with flex column, flex none elements to eliminate empty space */}
      <form onSubmit={handleCreate} className="categories-create-form" style={{ display: "flex", flexDirection: "column", gap: "15px", alignItems: "stretch", padding: "20px", background: "rgba(255,255,255,0.02)", borderRadius: "8px", border: "1px solid var(--border-color)" }}>
        <h3 style={{ margin: 0, color: "var(--text-main)", fontSize: "1.1rem" }}>Add New Video</h3>
        
        {/* Row 1: Title & Category & Language */}
        <div style={{ display: "grid", gridTemplateColumns: isLargeScreen ? "2.5fr 1fr 1fr" : "1fr", gap: "15px" }}>
          <div className="form-group" style={{ flex: "none", minWidth: "auto", margin: 0 }}>
            <label style={{ fontSize: "14px", fontWeight: "600", marginBottom: "4px", color: "var(--text-main)" }}>Video Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter video news headline..."
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
              <option value="Politics">Politics (அரசியல்)</option>
              <option value="Sports">Sports (விளையாட்டு)</option>
              <option value="Cinema">Cinema (சினிமா)</option>
              <option value="Technology">Technology (தொழில்நுட்பம்)</option>
              <option value="Business">Business (வணிகம்)</option>
              <option value="General">General (பொது)</option>
            </select>
          </div>

          <div className="form-group" style={{ flex: "none", minWidth: "auto", margin: 0 }}>
            <label style={{ fontSize: "14px", fontWeight: "600", marginBottom: "4px", color: "var(--text-main)" }}>Language</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
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
              <option value="ta">Tamil</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>

        {/* Row 2: File Uploads & Previews */}
        <div style={{ display: "grid", gridTemplateColumns: isLargeScreen ? "1fr 1fr" : "1fr", gap: "15px" }}>
          
          {/* Video Uploader & Live Preview */}
          <div className="form-group" style={{ flex: "none", minWidth: "auto", margin: 0 }}>
            <label style={{ fontSize: "14px", fontWeight: "600", marginBottom: "4px", color: "var(--text-main)" }}>Upload Video File</label>
            <input
              type="file"
              accept="video/*"
              onChange={handleVideoUpload}
              style={{ padding: "8px", fontSize: "13px", border: "1px dashed var(--border-color)", borderRadius: "8px", background: "var(--card-bg)", color: "var(--text-main)" }}
            />
            {uploadingVideo && <span style={{ fontSize: "12px", color: "var(--accent-orange)", marginTop: "4px" }}>Uploading video...</span>}
            {youtubeUrl && (
              <div style={{ marginTop: "8px" }}>
                <span style={{ fontSize: "12px", color: "#10b981", fontWeight: "bold", display: "block" }}>✓ Video Uploaded (Preview Option below):</span>
                <video src={youtubeUrl} controls style={{ width: "100%", maxHeight: "120px", borderRadius: "6px", background: "#000", marginTop: "4px" }} />
              </div>
            )}
          </div>

          {/* Thumbnail Uploader & Live Preview */}
          <div className="form-group" style={{ flex: "none", minWidth: "auto", margin: 0 }}>
            <label style={{ fontSize: "14px", fontWeight: "600", marginBottom: "4px", color: "var(--text-main)" }}>Upload Thumbnail Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleThumbnailUpload}
              style={{ padding: "8px", fontSize: "13px", border: "1px dashed var(--border-color)", borderRadius: "8px", background: "var(--card-bg)", color: "var(--text-main)" }}
            />
            {uploadingThumbnail && <span style={{ fontSize: "12px", color: "var(--accent-orange)", marginTop: "4px" }}>Uploading image...</span>}
            {thumbnail && (
              <div style={{ marginTop: "8px" }}>
                <span style={{ fontSize: "12px", color: "#10b981", fontWeight: "bold", display: "block" }}>✓ Image Uploaded (Preview below):</span>
                <img src={thumbnail} alt="Preview" style={{ width: "110px", height: "65px", objectFit: "cover", borderRadius: "6px", border: "1px solid var(--border-color)", marginTop: "4px" }} />
              </div>
            )}
          </div>

        </div>

        {/* Row 3: Description */}
        <div className="form-group" style={{ flex: "none", minWidth: "auto", margin: 0 }}>
          <label style={{ fontSize: "14px", fontWeight: "600", marginBottom: "4px", color: "var(--text-main)" }}>Description / Summary</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Write a brief summary of the video news..."
            style={{
              padding: "10px 14px",
              borderRadius: "8px",
              border: "1px solid var(--border-color)",
              outline: "none",
              fontSize: "14px",
              backgroundColor: "var(--card-bg)",
              color: "var(--text-main)",
              minHeight: "60px",
              fontFamily: "inherit"
            }}
          />
        </div>

        {/* Row 4: Toggles & Action buttons */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "15px", marginTop: "5px" }}>
          <div style={{ display: "flex", gap: "20px" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", cursor: "pointer", fontWeight: "600" }}>
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                style={{ width: "16px", height: "16px" }}
              />
              Featured on Home Track
            </label>

            <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", cursor: "pointer", fontWeight: "600" }}>
              <input
                type="checkbox"
                checked={isTrending}
                onChange={(e) => setIsTrending(e.target.checked)}
                style={{ width: "16px", height: "16px" }}
              />
              Trending Video
            </label>
          </div>

          <button type="submit" className="btn-primary add-category-btn" style={{ height: "40px", padding: "0 22px", fontSize: "14px", margin: 0 }}>
            Publish Video News
          </button>
        </div>
      </form>

      {/* LIST TABLE */}
      <div className="table-container" style={{ marginTop: "30px" }}>
        {loading && videos.length === 0 ? (
          <div style={{ padding: "20px", textAlign: "center" }}>Loading video database...</div>
        ) : videos.length === 0 ? (
          <div style={{ padding: "20px", textAlign: "center", color: "var(--text-muted)" }}>No videos logged yet.</div>
        ) : (
          <table className="articles-table">
            <thead>
              <tr>
                <th style={{ width: "120px" }}>Thumbnail</th>
                <th>Video Title</th>
                <th>Category</th>
                <th>Language</th>
                <th>Badges</th>
                <th>Views</th>
                <th style={{ width: "220px" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {videos.map((vid) => (
                <tr key={vid._id}>
                  <td>
                    <img 
                      src={vid.thumbnail} 
                      alt="preview" 
                      style={{ width: "100px", height: "60px", objectFit: "cover", borderRadius: "4px", border: "1px solid var(--border-color)" }} 
                      onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=200"; }}
                    />
                  </td>
                  <td>
                    {editingId === vid._id ? (
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
                            value={editYoutubeUrl}
                            onChange={(e) => setEditYoutubeUrl(e.target.value)}
                            style={{ padding: "4px 8px", borderRadius: "4px", border: "1px solid var(--border-color)", fontSize: "11px" }}
                            placeholder="Video Link/URL"
                          />
                        </div>
                        <div style={{ background: "rgba(255,255,255,0.02)", padding: "10px", borderRadius: "6px", border: "1px solid var(--border-color)", display: "flex", flexDirection: "column", gap: "6px" }}>
                          <label style={{ fontSize: "11px", fontWeight: "bold" }}>Edit Thumbnail File:</label>
                          <input type="file" accept="image/*" onChange={handleEditThumbnailUpload} style={{ fontSize: "11px" }} />
                          {editUploadingThumbnail && <span style={{ fontSize: "11px", color: "orange" }}>Uploading image...</span>}
                          <input
                            type="text"
                            value={editThumbnail}
                            onChange={(e) => setEditThumbnail(e.target.value)}
                            style={{ padding: "4px 8px", borderRadius: "4px", border: "1px solid var(--border-color)", fontSize: "11px" }}
                            placeholder="Thumbnail Link/URL"
                          />
                        </div>
                        <textarea
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                          style={{ padding: "6px 10px", borderRadius: "4px", border: "1px solid var(--border-color)", fontSize: "12px", minHeight: "50px", fontFamily: "inherit" }}
                          placeholder="Description"
                        />
                      </div>
                    ) : (
                      <div>
                        <div style={{ fontWeight: 600, color: "var(--text-main)" }}>{vid.title}</div>
                        <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px", maxWidth: "400px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {vid.description || "No description provided."}
                        </div>
                      </div>
                    )}
                  </td>
                  <td>
                    {editingId === vid._id ? (
                      <select
                        value={editCategory}
                        onChange={(e) => setEditCategory(e.target.value)}
                        style={{ padding: "6px 10px", borderRadius: "4px", border: "1px solid var(--border-color)" }}
                      >
                        <option value="Politics">Politics</option>
                        <option value="Sports">Sports</option>
                        <option value="Cinema">Cinema</option>
                        <option value="Technology">Technology</option>
                        <option value="Business">Business</option>
                        <option value="General">General</option>
                      </select>
                    ) : (
                      <span className="category-tag">{vid.category}</span>
                    )}
                  </td>
                  <td>
                    {editingId === vid._id ? (
                      <select
                        value={editLanguage}
                        onChange={(e) => setEditLanguage(e.target.value)}
                        style={{ padding: "6px 10px", borderRadius: "4px", border: "1px solid var(--border-color)" }}
                      >
                        <option value="ta">Tamil</option>
                        <option value="en">English</option>
                      </select>
                    ) : (
                      <span 
                        style={{
                          background: vid.language === "en" ? "#e0f2fe" : "#fef3c7",
                          color: vid.language === "en" ? "#0369a1" : "#b45309",
                          fontSize: "11px",
                          fontWeight: "600",
                          padding: "2px 6px",
                          borderRadius: "4px",
                          textTransform: "uppercase"
                        }}
                      >
                        {vid.language === "en" ? "English" : "Tamil"}
                      </span>
                    )}
                  </td>
                  <td>
                    {editingId === vid._id ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px" }}>
                          <input type="checkbox" checked={editIsFeatured} onChange={(e) => setEditIsFeatured(e.target.checked)} />
                          Featured
                        </label>
                        <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px" }}>
                          <input type="checkbox" checked={editIsTrending} onChange={(e) => setEditIsTrending(e.target.checked)} />
                          Trending
                        </label>
                      </div>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        {vid.isFeatured && <span className="status-badge badge-published" style={{ textAlign: "center" }}>Featured</span>}
                        {vid.isTrending && <span className="status-badge badge-approved" style={{ textAlign: "center" }}>Trending</span>}
                        {!vid.isFeatured && !vid.isTrending && <span style={{ color: "var(--text-muted)", fontSize: "12px" }}>Standard</span>}
                      </div>
                    )}
                  </td>
                  <td>
                    <span style={{ fontWeight: "bold" }}>{vid.views}</span>
                  </td>
                  <td>
                    {editingId === vid._id ? (
                      <div style={{ display: "flex", gap: "10px" }}>
                        <button
                          className="action-btn edit"
                          onClick={() => handleUpdate(vid._id)}
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
                      <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "nowrap", whiteSpace: "nowrap" }}>
                        <button
                          className="action-btn edit"
                          onClick={() => startEdit(vid)}
                        >
                          Edit
                        </button>
                        
                        {/* Play Preview Option Button */}
                        <button
                          className="action-btn edit"
                          onClick={() => setPreviewVideo(vid)}
                          style={{ color: "var(--accent-orange)", display: "flex", alignItems: "center", gap: "4px" }}
                        >
                          <FaEye /> Preview
                        </button>

                        <button
                          className="action-btn delete"
                          onClick={() => handleDelete(vid._id, vid.title)}
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

      {/* PREVIEW VIDEO MODAL OPTION */}
      {previewVideo && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.85)", zIndex: 999999,
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "20px"
        }}>
          <div style={{
            background: "var(--card-bg, #ffffff)",
            padding: "20px", borderRadius: "12px",
            width: "100%", maxWidth: "640px",
            border: "1px solid var(--border-color, #cbd5e1)",
            position: "relative",
            color: "var(--text-main, #000000)"
          }}>
            <button
              onClick={() => setPreviewVideo(null)}
              style={{
                position: "absolute", top: "10px", right: "15px",
                background: "none", border: "none", color: "var(--text-main, #000000)",
                fontSize: "20px", cursor: "pointer"
              }}
            >
              <FaTimes />
            </button>
            <h3 style={{ color: "var(--text-main)", marginBottom: "15px", fontSize: "1.1rem", paddingRight: "30px" }}>
              🎬 Preview: {previewVideo.title}
            </h3>
            <div style={{ width: "100%", height: "320px", borderRadius: "8px", overflow: "hidden", background: "#000" }}>
              {renderVideoPlayer(previewVideo.youtubeUrl, previewVideo.title)}
            </div>
            <div style={{ marginTop: "15px" }}>
              <span className="category-tag">{previewVideo.category}</span>
              <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "10px", lineHeight: "1.4" }}>
                {previewVideo.description || "No description provided."}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Videos;

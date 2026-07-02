import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import API from "../config/api";
import "../styles/ReporterMyArticles.css";
import { FaTimes, FaEye, FaEdit } from "react-icons/fa";
import { FiSliders } from "react-icons/fi";

function Shorts() {
  const location = useLocation();
  const [shorts, setShorts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth >= 1024);

  const role = localStorage.getItem("role");
  const token = localStorage.getItem("token");

  // Decoded userId from JWT token
  let userId = "";
  if (token) {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        window
          .atob(base64)
          .split("")
          .map(function (c) {
            return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join("")
      );
      userId = JSON.parse(jsonPayload).userId;
    } catch (e) {
      console.error("Error decoding token:", e);
    }
  }

  // Form states
  const [title, setTitle] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [category, setCategory] = useState("General");
  const [description, setDescription] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [isEnabled, setIsEnabled] = useState(role === "admin");
  const [status, setStatus] = useState(role === "editor" ? "Draft" : "Published");
  const [language, setLanguage] = useState("ta");

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
  const [editStatus, setEditStatus] = useState("Draft");
  const [editUploadingVideo, setEditUploadingVideo] = useState(false);
  const [editLanguage, setEditLanguage] = useState("ta");

  // Edit Modal state
  const [showEditModal, setShowEditModal] = useState(false);

  // Filter state
  const [statusFilter, setStatusFilter] = useState((location.state && location.state.statusFilter) || "all");
  const [languageFilter, setLanguageFilter] = useState("all");

  // Preview Modal state
  const [previewShort, setPreviewShort] = useState(null);

  // Bulk selection states
  const [selectedIds, setSelectedIds] = useState([]);

  // Reset selected IDs when filter status changes
  useEffect(() => {
    setSelectedIds([]);
  }, [statusFilter]);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(filteredShorts.map((sh) => sh._id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    const confirmDelete = window.confirm(
      `Are you sure you want to delete the ${selectedIds.length} selected shorts? This action cannot be undone.`
    );
    if (!confirmDelete) return;

    try {
      await API.post("/api/shorts/bulk-delete", { ids: selectedIds });
      alert("Selected shorts deleted successfully");
      setSelectedIds([]);
      fetchShorts();
    } catch (error) {
      console.error("Bulk delete shorts error:", error);
      alert(error.response?.data?.message || "Failed to delete selected shorts");
    }
  };

  const fetchShorts = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/api/shorts?language=${languageFilter}`);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        isEnabled: role === "admin" ? isEnabled : false,
        status: role === "editor" ? status : "Published",
        language
      });

      // Clear fields
      setTitle("");
      setVideoUrl("");
      setDescription("");
      setCategory("General");
      setIsFeatured(false);
      setIsEnabled(role === "admin");
      setStatus(role === "editor" ? "Draft" : "Published");
      setLanguage("ta");

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
      const updateData = {
        title: editTitle.trim(),
        thumbnail: editVideoUrl.trim(),
        videoUrl: editVideoUrl.trim(),
        category: editCategory,
        description: editDescription.trim(),
        isFeatured: editIsFeatured,
        language: editLanguage
      };

      if (role === "admin") {
        updateData.isEnabled = editIsEnabled;
        updateData.status = editStatus;
      } else {
        updateData.status = editStatus; // Editor can choose Draft or Pending Approval
      }

      await API.put(`/api/shorts/${id}`, updateData);
      setEditingId(null);
      setShowEditModal(false);
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

  const handleToggleEnable = async (item) => {
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

  const handleSubmitForApproval = async (id) => {
    try {
      await API.put(`/api/shorts/${id}`, { status: "Pending Approval" });
      alert("Short submitted for approval successfully 🎉");
      fetchShorts();
    } catch (error) {
      console.error("Submit short error:", error);
      alert("Failed to submit short for approval");
    }
  };

  const handleApprove = async (id) => {
    try {
      await API.put(`/api/shorts/${id}/approve`);
      alert("Short approved successfully!");
      fetchShorts();
    } catch (error) {
      console.error("Approve short error:", error);
      alert("Failed to approve short");
    }
  };

  const handleReject = async (id) => {
    const reason = window.prompt("Please enter a rejection reason:");
    if (reason === null) return;
    if (!reason.trim()) {
      alert("A rejection reason is required.");
      return;
    }

    try {
      await API.put(`/api/shorts/${id}/reject`, { rejectionReason: reason });
      alert("Short rejected successfully.");
      fetchShorts();
    } catch (error) {
      console.error("Reject short error:", error);
      alert("Failed to reject short");
    }
  };

  const handlePublish = async (id) => {
    try {
      await API.put(`/api/shorts/${id}/publish`);
      alert("Short published successfully!");
      fetchShorts();
    } catch (error) {
      console.error("Publish short error:", error);
      alert("Failed to publish short");
    }
  };

  const handleUnpublish = async (id) => {
    try {
      await API.put(`/api/shorts/${id}/unpublish`);
      alert("Short unpublished successfully.");
      fetchShorts();
    } catch (error) {
      console.error("Unpublish short error:", error);
      alert("Failed to unpublish short");
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
    setEditStatus(sh.status || "Draft");
    setEditLanguage(sh.language || "ta");
    setShowEditModal(true);
  };

  const getStatusStyle = (statusVal, isEnabledVal) => {
    const resolvedStatus = statusVal || (isEnabledVal ? "Published" : "Draft");
    switch (resolvedStatus) {
      case "Published":
        return { background: "#e6f4ea", color: "#137333", padding: "4px 8px", borderRadius: "12px", fontSize: "12px", fontWeight: 600 };
      case "Approved":
        return { background: "#e0f2fe", color: "#0369a1", padding: "4px 8px", borderRadius: "12px", fontSize: "12px", fontWeight: 600 };
      case "Pending Approval":
        return { background: "#feefe3", color: "#b06000", padding: "4px 8px", borderRadius: "12px", fontSize: "12px", fontWeight: 600 };
      case "Rejected":
        return { background: "#fee2e2", color: "#ef4444", padding: "4px 8px", borderRadius: "12px", fontSize: "12px", fontWeight: 600 };
      case "Draft":
      default:
        return { background: "#f1f3f4", color: "#3c4043", padding: "4px 8px", borderRadius: "12px", fontSize: "12px", fontWeight: 600 };
    }
  };

  // Filter shorts based on status Filter
  const filteredShorts = shorts.filter((sh) => {
    const resolvedStatus = sh.status || (sh.isEnabled ? "Published" : "Draft");
    return statusFilter === "all" || resolvedStatus === statusFilter;
  });

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
      {role === "editor" && (
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

        {/* Row 3: Caption / Mini Description & Status Selection (Editor) */}
        <div style={{ display: "grid", gridTemplateColumns: role === "editor" ? "2fr 1fr 1fr" : "3fr 1fr", gap: "15px" }}>
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

          {role === "editor" && (
            <div className="form-group" style={{ flex: "none", minWidth: "auto", margin: 0 }}>
              <label style={{ fontSize: "14px", fontWeight: "600", marginBottom: "4px", color: "var(--text-main)" }}>Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
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
                <option value="Draft">Draft</option>
                <option value="Pending Approval">Pending Approval</option>
              </select>
            </div>
          )}
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

            {role === "admin" && (
              <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", cursor: "pointer", fontWeight: "600" }}>
                <input
                  type="checkbox"
                  checked={isEnabled}
                  onChange={(e) => setIsEnabled(e.target.checked)}
                  style={{ width: "16px", height: "16px" }}
                />
                Enable Short Reel Immediately
              </label>
            )}
          </div>

          <button type="submit" className="btn-primary add-category-btn" style={{ height: "40px", padding: "0 22px", fontSize: "14px", margin: 0 }}>
            {role === "editor" ? "Save Short Reel" : "Publish Short Reel"}
          </button>
        </div>
      </form>
      )}

      {/* FILTER & BULK ACTIONS BAR */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "20px 0 0 0", flexWrap: "wrap", gap: "10px" }}>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "5px" }}>
            <FiSliders /> Filter Status:
          </span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="dropdown-field"
            style={{ padding: "8px 12px", borderRadius: "8px", fontSize: "14px" }}
          >
            <option value="all">All Statuses</option>
            <option value="Draft">Draft</option>
            <option value="Pending Approval">Pending Approval</option>
            <option value="Approved">Approved</option>
            <option value="Published">Published</option>
            <option value="Rejected">Rejected</option>
          </select>

          <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "5px", marginLeft: "15px" }}>
            Language:
          </span>
          <select
            value={languageFilter}
            onChange={(e) => setLanguageFilter(e.target.value)}
            className="dropdown-field"
            style={{ padding: "8px 12px", borderRadius: "8px", fontSize: "14px" }}
          >
            <option value="all">All Languages</option>
            <option value="ta">Tamil</option>
            <option value="en">English</option>
          </select>
        </div>

        {selectedIds.length > 0 && (
          <button
            onClick={handleBulkDelete}
            style={{
              background: "#ef4444",
              color: "white",
              padding: "8px 16px",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: "600",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              border: "none",
              cursor: "pointer",
              boxShadow: "0 2px 4px rgba(239, 68, 68, 0.2)",
              transition: "all 0.2s"
            }}
          >
            🗑️ Delete Selected ({selectedIds.length})
          </button>
        )}
      </div>

      {/* LIST TABLE */}
      <div className="table-container" style={{ marginTop: "15px" }}>
        {loading && shorts.length === 0 ? (
          <div style={{ padding: "20px", textAlign: "center" }}>Loading shorts database...</div>
        ) : filteredShorts.length === 0 ? (
          <div style={{ padding: "20px", textAlign: "center", color: "var(--text-muted)" }}>No shorts found.</div>
        ) : (
          <table className="articles-table">
            <thead>
              <tr>
                <th style={{ width: "40px", textAlign: "center" }}>
                  <input
                    type="checkbox"
                    checked={filteredShorts.length > 0 && selectedIds.length === filteredShorts.length}
                    onChange={handleSelectAll}
                    style={{ width: "16px", height: "16px", cursor: "pointer" }}
                  />
                </th>
                <th style={{ width: "100px" }}>Cover Image</th>
                <th>Short Details</th>
                <th>Category</th>
                <th>Flags</th>
                <th>Status</th>
                <th style={{ width: "300px" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredShorts.map((sh) => {
                const createdByStr = sh.createdBy ? (typeof sh.createdBy === "object" ? sh.createdBy._id : sh.createdBy) : "";
                const isOwnShort = role === "editor" && createdByStr === userId;
                const resolvedStatus = sh.status || (sh.isEnabled ? "Published" : "Draft");

                const canEdit = role === "admin" || (role === "editor" && isOwnShort && (resolvedStatus === "Draft" || resolvedStatus === "Rejected"));
                const canDelete = role === "admin" || (role === "editor" && isOwnShort && resolvedStatus === "Draft");

                return (
                  <tr key={sh._id}>
                    <td style={{ textAlign: "center" }}>
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(sh._id)}
                        onChange={() => handleSelectOne(sh._id)}
                        style={{ width: "16px", height: "16px", cursor: "pointer" }}
                      />
                    </td>
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
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span style={{ fontWeight: 600, color: "var(--text-main)" }}>{sh.title}</span>
                          <span style={{
                            background: sh.language === "en" ? "#e0f2fe" : "#fef3c7",
                            color: sh.language === "en" ? "#0369a1" : "#b45309",
                            fontSize: "10px",
                            fontWeight: "bold",
                            padding: "2px 6px",
                            borderRadius: "4px",
                            textTransform: "uppercase"
                          }}>
                            {sh.language === "en" ? "English" : "Tamil"}
                          </span>
                        </div>
                        <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>
                          {sh.description || "No caption written."}
                        </div>
                        {sh.rejectionReason && resolvedStatus === "Rejected" && (
                          <div style={{ fontSize: "11px", color: "#ef4444", marginTop: "4px" }}>
                            Rejection Reason: {sh.rejectionReason}
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className="category-tag">{sh.category}</span>
                    </td>
                    <td>
                      {sh.isFeatured ? (
                        <span className="status-badge badge-published" style={{ textAlign: "center" }}>Featured</span>
                      ) : (
                        <span style={{ color: "var(--text-muted)", fontSize: "12px" }}>Standard</span>
                      )}
                    </td>
                    <td>
                      <span style={getStatusStyle(sh.status, sh.isEnabled)}>
                        {resolvedStatus}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "nowrap", whiteSpace: "nowrap" }}>
                          
                          {/* Toggle Active state (Admin only) */}
                          {role === "admin" && (
                            <button
                              onClick={() => handleToggleEnable(sh)}
                              className={`status-badge ${sh.isEnabled ? "badge-approved" : "badge-rejected"}`}
                              style={{ border: "none", cursor: "pointer", display: "inline-block", padding: "4px 8px", fontSize: "11px", fontWeight: "bold" }}
                            >
                              {sh.isEnabled ? "ON" : "OFF"}
                            </button>
                          )}

                          {/* Preview Option Button */}
                          <button
                            className="action-btn edit"
                            onClick={() => setPreviewShort(sh)}
                            style={{ color: "var(--accent-orange)", display: "flex", alignItems: "center", gap: "4px" }}
                          >
                            <FaEye /> Preview
                          </button>

                          {/* Edit Button */}
                          {canEdit && (
                            <button
                              className="action-btn edit"
                              onClick={() => startEdit(sh)}
                            >
                              Edit
                            </button>
                          )}

                          {/* Delete Button */}
                          {canDelete && (
                            <button
                              className="action-btn delete"
                              onClick={() => handleDelete(sh._id, sh.title)}
                            >
                              Delete
                            </button>
                          )}

                          {/* Submit for Approval (Editor own drafts/rejected) */}
                          {role === "editor" && isOwnShort && (resolvedStatus === "Draft" || resolvedStatus === "Rejected") && (
                            <button
                              onClick={() => handleSubmitForApproval(sh._id)}
                              style={{
                                background: "#3b82f6",
                                color: "white",
                                border: "none",
                                padding: "4px 8px",
                                borderRadius: "4px",
                                cursor: "pointer",
                                fontSize: "11px",
                                fontWeight: 600
                              }}
                            >
                              Submit
                            </button>
                          )}

                          {/* Admin approval / publishing controls */}
                          {role === "admin" && resolvedStatus === "Pending Approval" && (
                            <>
                              <button
                                onClick={() => handleApprove(sh._id)}
                                style={{
                                  background: "#10b981",
                                  color: "white",
                                  border: "none",
                                  padding: "4px 8px",
                                  borderRadius: "4px",
                                  cursor: "pointer",
                                  fontSize: "11px",
                                  fontWeight: 600
                                }}
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleReject(sh._id)}
                                style={{
                                  background: "#ef4444",
                                  color: "white",
                                  border: "none",
                                  padding: "4px 8px",
                                  borderRadius: "4px",
                                  cursor: "pointer",
                                  fontSize: "11px",
                                  fontWeight: 600
                                }}
                              >
                                Reject
                              </button>
                            </>
                          )}

                          {role === "admin" && resolvedStatus === "Approved" && (
                            <button
                              onClick={() => handlePublish(sh._id)}
                              style={{
                                background: "#ea580c",
                                color: "white",
                                border: "none",
                                padding: "4px 8px",
                                borderRadius: "4px",
                                cursor: "pointer",
                                fontSize: "11px",
                                fontWeight: 600
                              }}
                            >
                              Publish
                            </button>
                          )}

                          {role === "admin" && resolvedStatus === "Published" && (
                            <button
                              onClick={() => handleUnpublish(sh._id)}
                              style={{
                                background: "#6b7280",
                                color: "white",
                                border: "none",
                                padding: "4px 8px",
                                borderRadius: "4px",
                                cursor: "pointer",
                                fontSize: "11px",
                                fontWeight: 600
                              }}
                            >
                              Unpublish
                            </button>
                          )}

                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* EDIT MODAL POPUP */}
      {showEditModal && editingId && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.7)", zIndex: 999998,
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "20px"
        }} onClick={(e) => { if (e.target === e.currentTarget) { setShowEditModal(false); setEditingId(null); } }}>
          <div style={{
            background: "var(--card-bg, #1e1e2e)",
            padding: "28px", borderRadius: "14px",
            width: "100%", maxWidth: "580px",
            border: "1px solid var(--border-color, #334155)",
            position: "relative",
            color: "var(--text-main)",
            maxHeight: "90vh",
            overflowY: "auto",
            boxShadow: "0 25px 60px rgba(0,0,0,0.5)"
          }}>
            {/* Modal Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "22px", borderBottom: "1px solid var(--border-color)", paddingBottom: "14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <FaEdit style={{ color: "var(--accent-orange)", fontSize: "18px" }} />
                <h3 style={{ margin: 0, color: "var(--text-main)", fontSize: "1.15rem", fontWeight: 700 }}>Edit Short Reel</h3>
              </div>
              <button
                onClick={() => { setShowEditModal(false); setEditingId(null); }}
                style={{ background: "rgba(239,68,68,0.15)", border: "1.5px solid rgba(239,68,68,0.5)", color: "#dc2626", fontSize: "20px", fontWeight: 700, lineHeight: 1, cursor: "pointer", borderRadius: "8px", width: "36px", height: "36px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
              >
                &times;
              </button>
            </div>

            {/* Form Fields */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px", color: "var(--text-muted)" }}>Title</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid var(--border-color)", fontSize: "14px", backgroundColor: "var(--card-bg)", color: "var(--text-main)", boxSizing: "border-box" }}
                  placeholder="Short Title"
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px", color: "var(--text-muted)" }}>Video File</label>
                <div style={{ background: "rgba(255,255,255,0.03)", padding: "12px", borderRadius: "8px", border: "1px dashed var(--border-color)", display: "flex", flexDirection: "column", gap: "8px" }}>
                  <input type="file" accept="video/*" onChange={handleEditVideoUpload} style={{ fontSize: "13px", color: "var(--text-main)" }} />
                  {editUploadingVideo && <span style={{ fontSize: "12px", color: "var(--accent-orange)" }}>Uploading video...</span>}
                  <input
                    type="text"
                    value={editVideoUrl}
                    onChange={(e) => setEditVideoUrl(e.target.value)}
                    style={{ padding: "8px 12px", borderRadius: "6px", border: "1px solid var(--border-color)", fontSize: "12px", backgroundColor: "var(--card-bg)", color: "var(--text-main)" }}
                    placeholder="Or paste Video URL directly"
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px", color: "var(--text-muted)" }}>Caption / Description</label>
                <input
                  type="text"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid var(--border-color)", fontSize: "14px", backgroundColor: "var(--card-bg)", color: "var(--text-main)", boxSizing: "border-box" }}
                  placeholder="Caption"
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px", color: "var(--text-muted)" }}>Category</label>
                  <select value={editCategory} onChange={(e) => setEditCategory(e.target.value)} style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid var(--border-color)", fontSize: "14px", backgroundColor: "var(--card-bg)", color: "var(--text-main)" }}>
                    <option value="General">General</option>
                    <option value="Politics">Politics</option>
                    <option value="Sports">Sports</option>
                    <option value="Cinema">Cinema</option>
                    <option value="Business">Business</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px", color: "var(--text-muted)" }}>Language</label>
                  <select value={editLanguage} onChange={(e) => setEditLanguage(e.target.value)} style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid var(--border-color)", fontSize: "14px", backgroundColor: "var(--card-bg)", color: "var(--text-main)" }}>
                    <option value="ta">Tamil (தமிழ்)</option>
                    <option value="en">English</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px", color: "var(--text-muted)" }}>Status</label>
                <select value={editStatus} onChange={(e) => setEditStatus(e.target.value)} style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid var(--border-color)", fontSize: "14px", backgroundColor: "var(--card-bg)", color: "var(--text-main)" }}>
                  <option value="Draft">Draft</option>
                  <option value="Pending Approval">Pending Approval</option>
                  {role === "admin" && <option value="Approved">Approved</option>}
                  {role === "admin" && <option value="Published">Published</option>}
                  {role === "admin" && <option value="Rejected">Rejected</option>}
                </select>
              </div>

              <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", cursor: "pointer", fontWeight: 600 }}>
                  <input type="checkbox" checked={editIsFeatured} onChange={(e) => setEditIsFeatured(e.target.checked)} style={{ width: "16px", height: "16px" }} />
                  Featured Short
                </label>
                {role === "admin" && (
                  <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", cursor: "pointer", fontWeight: 600 }}>
                    <input type="checkbox" checked={editIsEnabled} onChange={(e) => setEditIsEnabled(e.target.checked)} style={{ width: "16px", height: "16px" }} />
                    Enabled
                  </label>
                )}
              </div>

              <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "8px", paddingTop: "16px", borderTop: "1px solid var(--border-color)" }}>
                <button
                  onClick={() => { setShowEditModal(false); setEditingId(null); }}
                  style={{ padding: "10px 22px", borderRadius: "8px", border: "1px solid var(--border-color)", background: "transparent", color: "var(--text-main)", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleUpdate(editingId)}
                  style={{ padding: "10px 22px", borderRadius: "8px", background: "var(--accent-orange, #f97316)", color: "white", border: "none", fontSize: "14px", fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 12px rgba(249,115,22,0.3)" }}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PREVIEW SHORTS MODAL OPTION */}
      {previewShort && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.85)", zIndex: 999999,
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "20px"
        }}>
          <div style={{
            background: "var(--card-bg, #ffffff)",
            padding: "20px", borderRadius: "12px",
            width: "100%", maxWidth: "380px",
            border: "1px solid var(--border-color, #cbd5e1)",
            position: "relative",
            color: "var(--text-main, #000000)"
          }}>
            <button
              onClick={() => setPreviewShort(null)}
              style={{
                position: "absolute", top: "10px", right: "15px",
                background: "none", border: "none", color: "var(--text-main, #000000)",
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

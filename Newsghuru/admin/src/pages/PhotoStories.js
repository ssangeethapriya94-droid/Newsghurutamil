import React, { useState, useEffect } from "react";
import API from "../config/api";
import "../styles/ReporterMyArticles.css";
import { FaTimes, FaEye, FaChevronLeft, FaChevronRight, FaImage, FaEdit } from "react-icons/fa";
import { FiSliders } from "react-icons/fi";

function PhotoStories() {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(false);

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
  const [description, setDescription] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [status, setStatus] = useState(role === "editor" ? "Draft" : "Published");
  const [language, setLanguage] = useState("ta");

  // Edit states
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editCoverImage, setEditCoverImage] = useState("");
  const [editImages, setEditImages] = useState([]); // Array of existing image URLs
  const [editIsFeatured, setEditIsFeatured] = useState(false);
  const [editStatus, setEditStatus] = useState("Draft");
  const [editLanguage, setEditLanguage] = useState("ta");

  // File upload states
  const [coverFile, setCoverFile] = useState(null);
  const [galleryFiles, setGalleryFiles] = useState([]);
  const [editCoverFile, setEditCoverFile] = useState(null);
  const [editGalleryFiles, setEditGalleryFiles] = useState([]);

  // File change handlers (Create)
  const handleCoverChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCoverFile(file);
      setCoverImage(URL.createObjectURL(file));
    }
  };

  const removeCoverImage = () => {
    setCoverFile(null);
    setCoverImage("");
  };

  const handleGalleryChange = (e) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setGalleryFiles((prev) => prev.concat(filesArray));
    }
  };

  const removeGalleryFile = (indexToRemove) => {
    setGalleryFiles((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  // File change handlers (Edit)
  const handleEditCoverChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setEditCoverFile(file);
      setEditCoverImage(URL.createObjectURL(file));
    }
  };

  const removeEditCoverImage = () => {
    setEditCoverFile(null);
    setEditCoverImage("");
  };

  const handleEditGalleryChange = (e) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setEditGalleryFiles((prev) => prev.concat(filesArray));
    }
  };

  const removeEditExistingImage = (indexToRemove) => {
    setEditImages((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const removeEditGalleryFile = (indexToRemove) => {
    setEditGalleryFiles((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  // Filter state
  const [statusFilter, setStatusFilter] = useState("all");
  const [languageFilter, setLanguageFilter] = useState("all");

  // Edit Modal state
  const [showEditModal, setShowEditModal] = useState(false);

  // Preview Lightbox state
  const [previewStory, setPreviewStory] = useState(null);
  const [previewIndex, setPreviewIndex] = useState(0);

  const fetchStories = async () => {
    try {
      setLoading(true);
      const res = await API.get("/api/photo-stories");
      setStories(res.data || []);
    } catch (error) {
      console.error("Fetch photo stories error:", error);
      alert("Failed to load photo stories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStories();
  }, []);


  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      alert("Title is required");
      return;
    }
    if (!coverFile) {
      alert("Cover image is required");
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("title", title.trim());
      formDataToSend.append("description", description.trim());
      formDataToSend.append("isFeatured", isFeatured);
      formDataToSend.append("status", role === "editor" ? status : "Published");
      formDataToSend.append("language", language);
      formDataToSend.append("coverImage", coverFile);

      galleryFiles.forEach((file) => {
        formDataToSend.append("galleryImages", file);
      });

      await API.post("/api/photo-stories", formDataToSend, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      // Clear fields
      setTitle("");
      setDescription("");
      setCoverImage("");
      setCoverFile(null);
      setGalleryFiles([]);
      setIsFeatured(false);
      setStatus(role === "editor" ? "Draft" : "Published");
      setLanguage("ta");

      alert("Photo story created successfully 🎉");
      fetchStories();
    } catch (error) {
      console.error("Create photo story error:", error);
      alert(error.response?.data?.message || "Failed to create photo story");
    }
  };

  const handleUpdate = async (id) => {
    if (!editTitle.trim()) {
      alert("Title is required");
      return;
    }
    if (!editCoverImage && !editCoverFile) {
      alert("Cover image cannot be empty");
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("title", editTitle.trim());
      formDataToSend.append("description", editDescription.trim());
      formDataToSend.append("isFeatured", editIsFeatured);
      formDataToSend.append("status", editStatus);
      formDataToSend.append("language", editLanguage);
      
      if (editCoverFile) {
        formDataToSend.append("coverImage", editCoverFile);
      } else {
        formDataToSend.append("coverImage", editCoverImage);
      }

      formDataToSend.append("images", JSON.stringify(editImages));

      editGalleryFiles.forEach((file) => {
        formDataToSend.append("galleryImages", file);
      });

      await API.put(`/api/photo-stories/${id}`, formDataToSend, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      setEditingId(null);
      setShowEditModal(false);
      alert("Photo story updated successfully");
      fetchStories();
    } catch (error) {
      console.error("Update photo story error:", error);
      alert(error.response?.data?.message || "Failed to update photo story");
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete the photo gallery "${name}"?`)) {
      return;
    }

    try {
      await API.delete(`/api/photo-stories/${id}`);
      alert("Photo story deleted successfully");
      fetchStories();
    } catch (error) {
      console.error("Delete photo story error:", error);
      alert(error.response?.data?.message || "Failed to delete photo story");
    }
  };

  const handleSubmitForApproval = async (id) => {
    try {
      await API.put(`/api/photo-stories/${id}`, { status: "Pending Approval" });
      alert("Photo story submitted for approval successfully 🎉");
      fetchStories();
    } catch (error) {
      console.error("Submit photo story error:", error);
      alert("Failed to submit photo story");
    }
  };

  const handleApprove = async (id) => {
    try {
      await API.put(`/api/photo-stories/${id}/approve`);
      alert("Photo story approved successfully!");
      fetchStories();
    } catch (error) {
      console.error("Approve photo story error:", error);
      alert("Failed to approve photo story");
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
      await API.put(`/api/photo-stories/${id}/reject`, { rejectionReason: reason });
      alert("Photo story rejected successfully.");
      fetchStories();
    } catch (error) {
      console.error("Reject photo story error:", error);
      alert("Failed to reject photo story");
    }
  };

  const handlePublish = async (id) => {
    try {
      await API.put(`/api/photo-stories/${id}/publish`);
      alert("Photo story published successfully!");
      fetchStories();
    } catch (error) {
      console.error("Publish photo story error:", error);
      alert("Failed to publish photo story");
    }
  };

  const handleUnpublish = async (id) => {
    try {
      await API.put(`/api/photo-stories/${id}/unpublish`);
      alert("Photo story unpublished successfully.");
      fetchStories();
    } catch (error) {
      console.error("Unpublish photo story error:", error);
      alert("Failed to unpublish photo story");
    }
  };

  const startEdit = (st) => {
    setEditingId(st._id);
    setEditTitle(st.title);
    setEditDescription(st.description || "");
    setEditCoverImage(st.coverImage);
    setEditCoverFile(null);
    setEditImages(st.images || []);
    setEditGalleryFiles([]);
    setEditIsFeatured(st.isFeatured || false);
    setEditStatus(st.status || "Draft");
    setEditLanguage(st.language || "ta");
    setShowEditModal(true);
  };

  const getStatusStyle = (statusVal) => {
    const resolvedStatus = statusVal || "Published";
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

  const getLanguageLabel = (lang) => {
    return lang === "en" ? "English" : "Tamil";
  };

  // Filter photo stories based on status Filter and language filter
  const filteredStories = stories.filter((st) => {
    const resolvedStatus = st.status || "Published";
    const statusMatch = statusFilter === "all" || resolvedStatus === statusFilter;
    const langMatch = languageFilter === "all" || (st.language || "ta") === languageFilter;
    return statusMatch && langMatch;
  });

  // Language field select element (reusable)
  const LanguageSelect = ({ value, onChange, style }) => (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={style || {
        padding: "6px 12px",
        borderRadius: "8px",
        border: "1px solid var(--border-color)",
        outline: "none",
        fontSize: "14px",
        backgroundColor: "var(--card-bg)",
        color: "var(--text-main)",
        height: "36px"
      }}
    >
      <option value="ta">Tamil (தமிழ்)</option>
      <option value="en">English</option>
    </select>
  );

  return (
    <div className="reporter-my-articles">
      <div className="header-actions">
        <h2>📸 Photo Story Gallery CMS</h2>
        <div className="header-subtitle">
          Manage beautiful masonry image grids and pictorial news updates.
        </div>
      </div>

      {/* CREATE FORM - shown only for editor role */}
      {role === "editor" && (
        <form onSubmit={handleCreate} className="categories-create-form" style={{ display: "flex", flexDirection: "column", gap: "15px", alignItems: "stretch", padding: "20px", background: "rgba(255,255,255,0.02)", borderRadius: "8px", border: "1px solid var(--border-color)" }}>
          <h3 style={{ margin: 0, color: "var(--text-main)", fontSize: "1.1rem" }}>Create New Photo Story</h3>
          
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
            <div className="form-group" style={{ minWidth: "auto", margin: 0 }}>
              <label style={{ fontSize: "14px", fontWeight: "600", marginBottom: "4px", color: "var(--text-main)" }}>Gallery Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. மதுரை சித்திரை திருவிழா 2026..."
                style={{ padding: "10px 14px", fontSize: "14px", height: "40px" }}
              />
            </div>

            <div className="form-group" style={{ minWidth: "auto", margin: 0 }}>
              <label style={{ fontSize: "14px", fontWeight: "600", marginBottom: "4px", color: "var(--text-main)" }}>Cover/Thumbnail Image</label>
              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCoverChange}
                  style={{ display: "none" }}
                  id="cover-upload-create"
                />
                <label htmlFor="cover-upload-create" style={{ display: "inline-block", padding: "8px 16px", borderRadius: "8px", background: "var(--accent-orange, #f97316)", color: "white", cursor: "pointer", fontWeight: 600, fontSize: "13px" }}>
                  Upload Cover
                </label>
                {coverImage && (
                  <div style={{ position: "relative", display: "inline-block" }}>
                    <img src={coverImage} alt="Cover Preview" style={{ height: "40px", borderRadius: "4px", objectFit: "cover", border: "1px solid var(--border-color)" }} />
                    <button
                      type="button"
                      onClick={removeCoverImage}
                      style={{
                        position: "absolute", top: "-8px", right: "-8px", background: "#ef4444", color: "white",
                        border: "none", borderRadius: "50%", width: "16px", height: "16px", display: "flex",
                        alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: "10px"
                      }}
                    >
                      &times;
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label style={{ fontSize: "14px", fontWeight: "600", marginBottom: "4px", color: "var(--text-main)" }}>Short Description / Narrative</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Write a brief narrative caption describing the event..."
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

          <div className="form-group" style={{ margin: 0 }}>
            <label style={{ fontSize: "14px", fontWeight: "600", marginBottom: "4px", color: "var(--text-main)" }}>Gallery Images</label>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleGalleryChange}
                style={{ display: "none" }}
                id="gallery-upload-create"
              />
              <label htmlFor="gallery-upload-create" style={{ display: "inline-block", alignSelf: "flex-start", padding: "8px 16px", borderRadius: "8px", background: "var(--accent-orange, #f97316)", color: "white", cursor: "pointer", fontWeight: 600, fontSize: "13px" }}>
                Choose Gallery Images
              </label>
              
              {galleryFiles.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "5px", padding: "10px", borderRadius: "8px", border: "1px dashed var(--border-color)", background: "rgba(255,255,255,0.01)" }}>
                  {galleryFiles.map((file, index) => {
                    const url = URL.createObjectURL(file);
                    return (
                      <div key={index} style={{ position: "relative", display: "inline-block" }}>
                        <img src={url} alt={`Gallery Preview ${index}`} style={{ width: "60px", height: "60px", borderRadius: "4px", objectFit: "cover", border: "1px solid var(--border-color)" }} />
                        <button
                          type="button"
                          onClick={() => removeGalleryFile(index)}
                          style={{
                            position: "absolute", top: "-5px", right: "-5px", background: "#ef4444", color: "white",
                            border: "none", borderRadius: "50%", width: "16px", height: "16px", display: "flex",
                            alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: "10px"
                          }}
                        >
                          &times;
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
              
              <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                Upload one or more slides for this photo story.
              </span>
            </div>
          </div>

          {/* Row: Language, Status (Editor) & Save button */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "15px", marginTop: "5px" }}>
            <div style={{ display: "flex", gap: "20px", alignItems: "center", flexWrap: "wrap" }}>

              {/* Language selector - shown for both admin and editor */}
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <label style={{ fontSize: "14px", fontWeight: "600", color: "var(--text-main)" }}>Language:</label>
                <LanguageSelect value={language} onChange={setLanguage} />
              </div>

              {role === "editor" && (
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <label style={{ fontSize: "14px", fontWeight: "600", color: "var(--text-main)" }}>Status:</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    style={{
                      padding: "6px 12px",
                      borderRadius: "8px",
                      border: "1px solid var(--border-color)",
                      outline: "none",
                      fontSize: "14px",
                      backgroundColor: "var(--card-bg)",
                      color: "var(--text-main)",
                      height: "36px"
                    }}
                  >
                    <option value="Draft">Draft</option>
                    <option value="Pending Approval">Pending Approval</option>
                  </select>
                </div>
              )}
            </div>

            <button type="submit" className="btn-primary add-category-btn" style={{ height: "40px", padding: "0 22px", fontSize: "14px", margin: 0 }}>
              Save Photo Gallery
            </button>
          </div>
        </form>
      )}

      {/* FILTER CONTROL BAR */}
      <div style={{ display: "flex", gap: "10px", margin: "20px 0 0 0", alignItems: "center", flexWrap: "wrap" }}>
        <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "5px" }}>
          <FiSliders /> Filter:
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

      {/* LIST TABLE */}
      <div className="table-container" style={{ marginTop: "15px" }}>
        {loading && stories.length === 0 ? (
          <div style={{ padding: "20px", textAlign: "center" }}>Loading photo stories...</div>
        ) : filteredStories.length === 0 ? (
          <div style={{ padding: "20px", textAlign: "center", color: "var(--text-muted)" }}>No photo galleries found.</div>
        ) : (
          <table className="articles-table">
            <thead>
              <tr>
                <th style={{ width: "120px" }}>Cover</th>
                <th>Photo Story Details</th>
                <th>Language</th>
                <th>Image Count</th>
                <th>Flags</th>
                <th>Status</th>
                <th style={{ width: "280px" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStories.map((st) => {
                const createdByStr = st.createdBy ? (typeof st.createdBy === "object" ? st.createdBy._id : st.createdBy) : "";
                const isOwnStory = role === "editor" && createdByStr === userId;
                const resolvedStatus = st.status || "Published";

                // Editor: can only edit/delete own draft/rejected stories
                const editorCanEdit = role === "editor" && isOwnStory && (resolvedStatus === "Draft" || resolvedStatus === "Rejected");
                const editorCanDelete = role === "editor" && isOwnStory && resolvedStatus === "Draft";
                // Admin: can edit/delete any story
                const adminCanEdit = role === "admin";
                const adminCanDelete = role === "admin";

                const canEdit = editorCanEdit || adminCanEdit;
                const canDelete = editorCanDelete || adminCanDelete;

                return (
                  <tr key={st._id}>
                    <td>
                      <img 
                        src={st.coverImage} 
                        alt="cover" 
                        style={{ width: "100px", height: "65px", objectFit: "cover", borderRadius: "6px", border: "1px solid var(--border-color)" }} 
                        onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=200"; }}
                      />
                    </td>
                    <td>
                      <div>
                        <div style={{ fontWeight: 600, color: "var(--text-main)" }}>{st.title}</div>
                        <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px", maxWidth: "450px" }}>
                          {st.description || "No narrative content loaded."}
                        </div>
                        {st.rejectionReason && resolvedStatus === "Rejected" && (
                          <div style={{ fontSize: "11px", color: "#ef4444", marginTop: "4px" }}>
                            Rejection Reason: {st.rejectionReason}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Language Column */}
                    <td>
                      <span
                        style={{
                          padding: "4px 8px",
                          borderRadius: "12px",
                          fontSize: "12px",
                          fontWeight: 600,
                          background: (st.language || "ta") === "en" ? "#e0f2fe" : "#f0fdf4",
                          color: (st.language || "ta") === "en" ? "#0369a1" : "#166534"
                        }}
                      >
                        {getLanguageLabel(st.language || "ta")}
                      </span>
                    </td>

                    <td>
                      <span className="category-tag" style={{ background: "rgba(16, 185, 129, 0.15)", color: "#10b981", border: "1px solid #10b981", display: "inline-block", whiteSpace: "nowrap" }}>
                        {`${(st.images || []).length} ${(st.images || []).length === 1 ? 'Image' : 'Images'}`}
                      </span>
                    </td>
                    <td>
                      {st.isFeatured ? (
                        <span className="status-badge badge-published" style={{ textAlign: "center" }}>Featured</span>
                      ) : (
                        <span style={{ color: "var(--text-muted)", fontSize: "12px" }}>Standard</span>
                      )}
                    </td>
                    <td>
                      <span style={getStatusStyle(st.status)}>
                        {resolvedStatus}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "nowrap", whiteSpace: "nowrap" }}>
                          
                          {/* Preview Option Button */}
                          <button
                            className="action-btn edit"
                            onClick={() => {
                              setPreviewStory(st);
                              setPreviewIndex(0);
                            }}
                            style={{ color: "var(--accent-orange)", display: "flex", alignItems: "center", gap: "4px" }}
                          >
                            <FaEye /> Preview
                          </button>

                          {/* Edit Button */}
                          {canEdit && (
                            <button
                              className="action-btn edit"
                              onClick={() => startEdit(st)}
                            >
                              Edit
                            </button>
                          )}

                          {/* Delete Button */}
                          {canDelete && (
                            <button
                              className="action-btn delete"
                              onClick={() => handleDelete(st._id, st.title)}
                            >
                              Delete
                            </button>
                          )}

                          {/* Submit for Approval (Editor own drafts/rejected) */}
                          {role === "editor" && isOwnStory && (resolvedStatus === "Draft" || resolvedStatus === "Rejected") && (
                            <button
                              onClick={() => handleSubmitForApproval(st._id)}
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
                                onClick={() => handleApprove(st._id)}
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
                                onClick={() => handleReject(st._id)}
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
                              onClick={() => handlePublish(st._id)}
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
                              onClick={() => handleUnpublish(st._id)}
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
            width: "100%", maxWidth: "600px",
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
                <h3 style={{ margin: 0, color: "var(--text-main)", fontSize: "1.15rem", fontWeight: 700 }}>Edit Photo Story</h3>
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
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px", color: "var(--text-muted)" }}>Gallery Title</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid var(--border-color)", fontSize: "14px", backgroundColor: "var(--card-bg)", color: "var(--text-main)", boxSizing: "border-box" }}
                  placeholder="Gallery Title"
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px", color: "var(--text-muted)" }}>Cover Image</label>
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleEditCoverChange}
                    style={{ display: "none" }}
                    id="cover-upload-edit"
                  />
                  <label htmlFor="cover-upload-edit" style={{ display: "inline-block", padding: "8px 16px", borderRadius: "8px", background: "var(--accent-orange, #f97316)", color: "white", cursor: "pointer", fontWeight: 600, fontSize: "13px" }}>
                    Choose File
                  </label>
                  {editCoverImage && (
                    <div style={{ position: "relative", display: "inline-block" }}>
                      <img src={editCoverImage} alt="Cover Preview" style={{ height: "40px", borderRadius: "4px", objectFit: "cover", border: "1px solid var(--border-color)" }} />
                      <button
                        type="button"
                        onClick={removeEditCoverImage}
                        style={{
                          position: "absolute", top: "-8px", right: "-8px", background: "#ef4444", color: "white",
                          border: "none", borderRadius: "50%", width: "16px", height: "16px", display: "flex",
                          alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: "10px"
                        }}
                      >
                        &times;
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px", color: "var(--text-muted)" }}>Description / Narrative</label>
                <input
                  type="text"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid var(--border-color)", fontSize: "14px", backgroundColor: "var(--card-bg)", color: "var(--text-main)", boxSizing: "border-box" }}
                  placeholder="Brief description..."
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px", color: "var(--text-muted)" }}>Gallery Images</label>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleEditGalleryChange}
                    style={{ display: "none" }}
                    id="gallery-upload-edit"
                  />
                  <label htmlFor="gallery-upload-edit" style={{ display: "inline-block", alignSelf: "flex-start", padding: "8px 16px", borderRadius: "8px", background: "var(--accent-orange, #f97316)", color: "white", cursor: "pointer", fontWeight: 600, fontSize: "13px" }}>
                    Add Images
                  </label>

                  {(editImages.length > 0 || editGalleryFiles.length > 0) && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "5px", padding: "10px", borderRadius: "8px", border: "1px dashed var(--border-color)", background: "rgba(255,255,255,0.01)" }}>
                      {editImages.map((src, index) => (
                        <div key={`existing-${index}`} style={{ position: "relative", display: "inline-block" }}>
                          <img src={src} alt={`Existing ${index}`} style={{ width: "60px", height: "60px", borderRadius: "4px", objectFit: "cover", border: "1px solid var(--border-color)" }} />
                          <button
                            type="button"
                            onClick={() => removeEditExistingImage(index)}
                            style={{
                              position: "absolute", top: "-5px", right: "-5px", background: "#ef4444", color: "white",
                              border: "none", borderRadius: "50%", width: "16px", height: "16px", display: "flex",
                              alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: "10px"
                            }}
                          >
                            &times;
                          </button>
                        </div>
                      ))}
                      {editGalleryFiles.map((file, index) => {
                        const url = URL.createObjectURL(file);
                        return (
                          <div key={`new-${index}`} style={{ position: "relative", display: "inline-block" }}>
                            <img src={url} alt={`New ${index}`} style={{ width: "60px", height: "60px", borderRadius: "4px", objectFit: "cover", border: "1px solid var(--border-color)" }} />
                            <button
                              type="button"
                              onClick={() => removeEditGalleryFile(index)}
                              style={{
                                position: "absolute", top: "-5px", right: "-5px", background: "#ef4444", color: "white",
                                border: "none", borderRadius: "50%", width: "16px", height: "16px", display: "flex",
                                alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: "10px"
                              }}
                            >
                              &times;
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  
                  <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                    Total: {editImages.length} existing + {editGalleryFiles.length} new = {editImages.length + editGalleryFiles.length} {editImages.length + editGalleryFiles.length === 1 ? 'image' : 'images'}
                  </span>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px", color: "var(--text-muted)" }}>Language</label>
                  <select value={editLanguage} onChange={(e) => setEditLanguage(e.target.value)} style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid var(--border-color)", fontSize: "14px", backgroundColor: "var(--card-bg)", color: "var(--text-main)" }}>
                    <option value="ta">Tamil (தமிழ்)</option>
                    <option value="en">English</option>
                  </select>
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
              </div>

              {role === "admin" && (
                <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", cursor: "pointer", fontWeight: 600 }}>
                    <input type="checkbox" checked={editIsFeatured} onChange={(e) => setEditIsFeatured(e.target.checked)} style={{ width: "16px", height: "16px" }} />
                    Featured Photo Story
                  </label>
                </div>
              )}

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

      {/* FULLSCREEN PHOTO STORY PREVIEW MODAL */}
      {previewStory && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.9)", zIndex: 999999,
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "20px"
        }}>
          <div style={{
            background: "var(--card-bg, #ffffff)",
            padding: "20px", borderRadius: "12px",
            width: "100%", maxWidth: "600px",
            border: "1px solid var(--border-color, #cbd5e1)",
            position: "relative",
            color: "var(--text-main, #000000)"
          }}>
            <button
              onClick={() => setPreviewStory(null)}
              style={{
                position: "absolute", top: "10px", right: "15px",
                background: "none", border: "none", color: "var(--text-main, #000000)",
                fontSize: "20px", cursor: "pointer", zIndex: 10
              }}
            >
              <FaTimes />
            </button>
            <h3 style={{ color: "var(--text-main)", marginBottom: "15px", fontSize: "1.2rem", paddingRight: "30px", fontFamily: "var(--font-serif)" }}>
              📸 Preview: {previewStory.title}
            </h3>

            {/* Slider view of images */}
            {previewStory.images && previewStory.images.length > 0 ? (
              <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", background: "#0a0a0a", borderRadius: "8px", overflow: "hidden", minHeight: "300px", border: "1px solid rgba(255,255,255,0.05)" }}>
                <img 
                  src={previewStory.images[previewIndex]} 
                  alt={`Slide ${previewIndex + 1}`} 
                  style={{ maxWidth: "100%", maxHeight: "40vh", objectFit: "contain" }} 
                />

                {/* Left/Right scroll buttons */}
                {previewIndex > 0 && (
                  <button 
                    onClick={() => setPreviewIndex(prev => prev - 1)}
                    style={{ position: "absolute", left: "15px", background: "rgba(0,0,0,0.6)", border: "none", color: "white", width: "36px", height: "36px", borderRadius: "50%", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                  >
                    <FaChevronLeft />
                  </button>
                )}
                {previewIndex < previewStory.images.length - 1 && (
                  <button 
                    onClick={() => setPreviewIndex(prev => prev + 1)}
                    style={{ position: "absolute", right: "15px", background: "rgba(0,0,0,0.6)", border: "none", color: "white", width: "36px", height: "36px", borderRadius: "50%", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                  >
                    <FaChevronRight />
                  </button>
                )}
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "200px", color: "var(--text-muted)" }}>
                <FaImage size={32} style={{ marginBottom: "10px" }} />
                <span>No gallery images uploaded. Showing cover image below.</span>
                <img src={previewStory.coverImage} alt="Cover fallback" style={{ maxWidth: "100%", maxHeight: "25vh", objectFit: "contain", marginTop: "15px", borderRadius: "6px" }} />
              </div>
            )}

            {/* Narrative & Index count */}
            {previewStory.images && previewStory.images.length > 0 && (
              <div style={{ marginTop: "12px", textAlign: "center" }}>
                <span style={{ fontSize: "13px", fontWeight: "bold", color: "var(--accent-orange)" }}>
                  Image {previewIndex + 1} of {previewStory.images.length}
                </span>
              </div>
            )}

            <div style={{ marginTop: "15px", borderTop: "1px solid var(--border-color)", paddingTop: "12px" }}>
              <p style={{ fontSize: "14px", color: "var(--text-primary)", lineHeight: "1.5", margin: 0 }}>
                <strong>Narrative:</strong> {previewStory.description || "No description provided."}
              </p>
              <div style={{ display: "flex", gap: "10px", marginTop: "10px", flexWrap: "wrap" }}>
                <span className="category-tag">Status: {previewStory.status || "Published"}</span>
                <span className="category-tag" style={{ background: (previewStory.language || "ta") === "en" ? "#e0f2fe" : "#f0fdf4", color: (previewStory.language || "ta") === "en" ? "#0369a1" : "#166534" }}>
                  Language: {getLanguageLabel(previewStory.language || "ta")}
                </span>
                {previewStory.isFeatured && <span className="category-tag" style={{ background: "orange", color: "white" }}>Featured</span>}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PhotoStories;

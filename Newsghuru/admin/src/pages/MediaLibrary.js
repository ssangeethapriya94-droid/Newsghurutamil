import React, { useState, useEffect } from "react";
import API from "../config/api";
import "../styles/ReporterMyArticles.css";

function MediaLibrary() {
  const [mediaFiles, setMediaFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fileToUpload, setFileToUpload] = useState(null);

  // Bulk selection states
  const [selectMode, setSelectMode] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState(new Set());

  const toggleSelectMode = () => {
    setSelectMode((prev) => !prev);
    setSelectedFiles(new Set());
  };

  const toggleSelectOne = (filename) => {
    setSelectedFiles((prev) => {
      const next = new Set(prev);
      if (next.has(filename)) next.delete(filename);
      else next.add(filename);
      return next;
    });
  };

  const selectAll = () => {
    if (selectedFiles.size === mediaFiles.length) {
      setSelectedFiles(new Set());
    } else {
      setSelectedFiles(new Set(mediaFiles.map((f) => f.filename)));
    }
  };

  const deleteSelected = async () => {
    if (selectedFiles.size === 0) return;
    const confirmDelete = window.confirm(
      `⚠️ Are you sure you want to permanently delete ${selectedFiles.size} selected media file${selectedFiles.size > 1 ? "s" : ""}? This cannot be undone and will break images in existing articles!`
    );
    if (!confirmDelete) return;

    try {
      setLoading(true);
      await Promise.all([...selectedFiles].map((filename) => API.delete(`/api/media/${filename}`)));
      setSelectedFiles(new Set());
      setSelectMode(false);
      alert("✅ Selected media files deleted successfully!");
      fetchMedia();
    } catch (error) {
      console.error("Bulk delete media error:", error);
      alert("Failed to delete some files");
      fetchMedia();
    } finally {
      setLoading(false);
    }
  };

  const fetchMedia = async () => {
    try {
      setLoading(true);
      const res = await API.get("/api/media");
      setMediaFiles(res.data || []);
    } catch (error) {
      console.error("Fetch media error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFileToUpload(e.target.files[0]);
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!fileToUpload) {
      alert("Please select a file to upload first");
      return;
    }

    const formData = new FormData();
    formData.append("image", fileToUpload);

    try {
      setUploading(true);
      await API.post("/api/media/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setFileToUpload(null);
      // Reset input element
      document.getElementById("media-upload-input").value = "";
      alert("Image uploaded successfully 🎉");
      fetchMedia();
    } catch (error) {
      console.error("Upload media error:", error);
      alert("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (filename) => {
    if (!window.confirm("Are you sure you want to permanently delete this media file?")) {
      return;
    }

    try {
      await API.delete(`/api/media/${filename}`);
      alert("File deleted successfully");
      fetchMedia();
    } catch (error) {
      console.error("Delete media error:", error);
      alert("Failed to delete file");
    }
  };

  const handleDeleteAll = async () => {
    if (mediaFiles.length === 0) {
      alert("No files to delete.");
      return;
    }
    if (!window.confirm("Are you SURE you want to delete ALL media files? This action cannot be undone and will break images in existing articles!")) {
      return;
    }

    try {
      await API.delete("/api/media");
      alert("All files deleted successfully");
      fetchMedia();
    } catch (error) {
      console.error("Delete all media error:", error);
      alert("Failed to delete all files");
    }
  };

  const copyToClipboard = (url) => {
    navigator.clipboard.writeText(url);
    alert("Image URL copied to clipboard! 📋");
  };

  const formatSize = (bytes) => {
    if (!bytes) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const isVideoFile = (filename) => {
    if (!filename) return false;
    return /\.(mp4|webm|ogg|mov|m4v|avi)$/i.test(filename);
  };

  return (
    <div className="reporter-my-articles">
      <div className="header-actions" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
        <div>
          <h2>🖼️ Media Library</h2>
          <div style={{ color: "var(--text-muted)", fontSize: "14px" }}>
            Upload news images and copy their direct links.
          </div>
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
          {mediaFiles.length > 0 && (
            <>
              {/* Select Mode Toggle */}
              <button
                type="button"
                className={`select-mode-btn ${selectMode ? "select-mode-active" : ""}`}
                onClick={toggleSelectMode}
              >
                {selectMode ? "✕ Cancel" : "☑ Select"}
              </button>

              {/* Select All */}
              {selectMode && (
                <button
                  type="button"
                  className="select-all-btn"
                  onClick={selectAll}
                >
                  {selectedFiles.size === mediaFiles.length ? "Deselect All" : "Select All"}
                </button>
              )}

              {/* Delete Selected */}
              {selectMode && selectedFiles.size > 0 && (
                <button
                  type="button"
                  className="delete-selected-btn"
                  onClick={deleteSelected}
                >
                  🗑️ Delete Selected ({selectedFiles.size})
                </button>
              )}

              {/* Delete All (only visible when not in select mode) */}
              {!selectMode && (
                <button 
                  type="button"
                  onClick={handleDeleteAll}
                  style={{ background: "#ef4444", color: "white", padding: "10px 20px", border: "none", borderRadius: "6px", fontWeight: "bold", cursor: "pointer" }}
                >
                  🗑️ Delete All Media
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* BULK SELECTION INFO BAR */}
      {selectMode && (
        <div className="bulk-info-bar" style={{ marginTop: "15px" }}>
          <span>
            {selectedFiles.size === 0
              ? "Click checkboxes or cards to select media files for bulk deletion."
              : `${selectedFiles.size} file${selectedFiles.size > 1 ? "s" : ""} selected`}
          </span>
          {selectedFiles.size > 0 && (
            <button type="button" className="bulk-clear-btn" onClick={() => setSelectedFiles(new Set())}>
              Clear selection
            </button>
          )}
        </div>
      )}

      {/* UPLOAD PANEL */}
      <form onSubmit={handleUploadSubmit} style={{ display: "flex", gap: "15px", marginBottom: "30px", background: "var(--bg-light)", padding: "20px", borderRadius: "8px", border: "1px solid var(--border-color)", alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
          <label style={{ fontWeight: 600, fontSize: "13px" }}>Upload New Image</label>
          <input
            id="media-upload-input"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{ fontSize: "14px" }}
          />
        </div>
        <button
          type="submit"
          className="btn-primary"
          disabled={uploading || !fileToUpload}
          style={{ height: "38px", background: uploading || !fileToUpload ? "#94a3b8" : "var(--primary-blue)", color: "white", border: "none", padding: "0 20px", borderRadius: "6px", fontWeight: 600, cursor: uploading || !fileToUpload ? "not-allowed" : "pointer", marginTop: "20px" }}
        >
          {uploading ? "Uploading..." : "Upload Image"}
        </button>
      </form>

      {/* MEDIA GRID */}
      {loading && mediaFiles.length === 0 ? (
        <div style={{ padding: "40px", textAlign: "center" }}>Loading media files...</div>
      ) : mediaFiles.length === 0 ? (
        <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)", border: "2px dashed var(--border-color)", borderRadius: "8px" }}>
          No media files found in the library. Upload one above!
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "20px" }}>
          {mediaFiles.map((file) => {
            const isSelected = selectedFiles.has(file.filename);
            const cardStyle = {
              background: isSelected ? "#fff7ed" : "white",
              border: isSelected ? "2px solid #ea580c" : "1px solid var(--border-color)",
              borderRadius: "8px",
              overflow: "hidden",
              boxShadow: isSelected ? "0 0 0 3px rgba(234, 88, 12, 0.2)" : "0 1px 3px rgba(0,0,0,0.05)",
              display: "flex",
              flexDirection: "column",
              position: "relative",
              cursor: selectMode ? "pointer" : "default",
              userSelect: selectMode ? "none" : "auto",
              transition: "all 0.2s ease"
            };

            return (
              <div
                key={file.filename}
                style={cardStyle}
                onClick={selectMode ? () => toggleSelectOne(file.filename) : undefined}
                className={selectMode ? "selectable" : ""}
              >
                {/* CHECKBOX OVERLAY */}
                {selectMode && (
                  <div className="card-checkbox-wrapper" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      className="card-checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelectOne(file.filename)}
                    />
                  </div>
                )}

                {/* IMAGE / VIDEO THUMBNAIL */}
                <div style={{ width: "100%", height: "150px", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                  {isVideoFile(file.filename) ? (
                    <video
                      src={file.url.startsWith("http") ? file.url : `${API.defaults.baseURL}${file.url}`}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      controls={!selectMode}
                      preload="metadata"
                    />
                  ) : (
                    <img
                      src={file.url.startsWith("http") ? file.url : `${API.defaults.baseURL}${file.url}`}
                      alt={file.filename}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://placehold.co/150x150?text=No+Image";
                      }}
                    />
                  )}
                </div>

                {/* DETAILS & ACTIONS */}
                <div style={{ padding: "12px", display: "flex", flexDirection: "column", gap: "8px", flex: 1 }}>
                  <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-main)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={file.filename}>
                    {file.filename}
                  </div>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)", display: "flex", justifyContent: "space-between" }}>
                    <span>{formatSize(file.size)}</span>
                    <span>{new Date(file.createdAt).toLocaleDateString("en-GB")}</span>
                  </div>
                  {!selectMode && (
                    <div style={{ display: "flex", gap: "8px", marginTop: "auto", paddingTop: "8px", borderTop: "1px solid var(--border-color)" }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          copyToClipboard(file.url.startsWith("http") ? file.url : `${API.defaults.baseURL}${file.url}`);
                        }}
                        style={{ flex: 1, padding: "6px", background: "#eff6ff", color: "var(--primary-blue)", border: "none", borderRadius: "4px", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}
                      >
                        Copy Link
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(file.filename);
                        }}
                        style={{ padding: "6px 10px", background: "#fef2f2", color: "#ef4444", border: "none", borderRadius: "4px", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default MediaLibrary;

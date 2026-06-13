import React, { useState, useEffect } from "react";
import API from "../config/api";
import "../styles/ReporterMyArticles.css";

function MediaLibrary() {
  const [mediaFiles, setMediaFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fileToUpload, setFileToUpload] = useState(null);

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

  return (
    <div className="reporter-my-articles">
      <div className="header-actions">
        <h2>🖼️ Media Library</h2>
        <div style={{ color: "var(--text-muted)", fontSize: "14px" }}>
          Upload news images and copy their direct links.
        </div>
      </div>

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
          {mediaFiles.map((file) => (
            <div key={file.filename} style={{ background: "white", border: "1px solid var(--border-color)", borderRadius: "8px", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", display: "flex", flexDirection: "column" }}>
              {/* IMAGE THUMBNAIL */}
              <div style={{ width: "100%", height: "150px", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                <img
                  src={file.url}
                  alt={file.filename}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://via.placeholder.com/150?text=No+Image";
                  }}
                />
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
                <div style={{ display: "flex", gap: "8px", marginTop: "auto", paddingTop: "8px", borderTop: "1px solid var(--border-color)" }}>
                  <button
                    onClick={() => copyToClipboard(file.url)}
                    style={{ flex: 1, padding: "6px", background: "#eff6ff", color: "var(--primary-blue)", border: "none", borderRadius: "4px", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}
                  >
                    Copy Link
                  </button>
                  <button
                    onClick={() => handleDelete(file.filename)}
                    style={{ padding: "6px 10px", background: "#fef2f2", color: "#ef4444", border: "none", borderRadius: "4px", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MediaLibrary;

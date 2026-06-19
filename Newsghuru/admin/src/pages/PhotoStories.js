import React, { useState, useEffect } from "react";
import API from "../config/api";
import "../styles/ReporterMyArticles.css";

function PhotoStories() {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [imagesText, setImagesText] = useState(""); // Comma separated image URLs
  const [isFeatured, setIsFeatured] = useState(false);

  // Edit states
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editCoverImage, setEditCoverImage] = useState("");
  const [editImagesText, setEditImagesText] = useState(""); // Comma separated
  const [editIsFeatured, setEditIsFeatured] = useState(false);

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

  const parseImages = (text) => {
    return text
      .split("\n")
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .flatMap(line => line.split(","))
      .map(url => url.trim())
      .filter(url => url.startsWith("http"));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title.trim() || !coverImage.trim()) {
      alert("Title and cover image URL are required");
      return;
    }

    const imagesArray = parseImages(imagesText);

    try {
      await API.post("/api/photo-stories", {
        title: title.trim(),
        description: description.trim(),
        coverImage: coverImage.trim(),
        images: imagesArray,
        isFeatured
      });

      // Clear fields
      setTitle("");
      setDescription("");
      setCoverImage("");
      setImagesText("");
      setIsFeatured(false);

      alert("Photo story created successfully 🎉");
      fetchStories();
    } catch (error) {
      console.error("Create photo story error:", error);
      alert(error.response?.data?.message || "Failed to create photo story");
    }
  };

  const handleUpdate = async (id) => {
    if (!editTitle.trim() || !editCoverImage.trim()) {
      alert("Title and cover image cannot be empty");
      return;
    }

    const imagesArray = parseImages(editImagesText);

    try {
      await API.put(`/api/photo-stories/${id}`, {
        title: editTitle.trim(),
        description: editDescription.trim(),
        coverImage: editCoverImage.trim(),
        images: imagesArray,
        isFeatured: editIsFeatured
      });
      setEditingId(null);
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

  const startEdit = (st) => {
    setEditingId(st._id);
    setEditTitle(st.title);
    setEditDescription(st.description || "");
    setEditCoverImage(st.coverImage);
    setEditImagesText((st.images || []).join(",\n"));
    setEditIsFeatured(st.isFeatured || false);
  };

  return (
    <div className="reporter-my-articles">
      <div className="header-actions">
        <h2>📸 Photo Story Gallery CMS</h2>
        <div className="header-subtitle">
          Manage beautiful masonry image grids and pictorial news updates.
        </div>
      </div>

      {/* CREATE FORM */}
      <form onSubmit={handleCreate} className="categories-create-form" style={{ flexDirection: "column", alignItems: "stretch" }}>
        <h3 style={{ margin: "0 0 15px 0", color: "var(--text-main)" }}>Create New Photo Story</h3>
        
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px", marginBottom: "20px" }}>
          <div className="form-group" style={{ minWidth: "auto" }}>
            <label>Gallery Title (Tamil)</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. மதுரை சித்திரை திருவிழா 2026..."
            />
          </div>

          <div className="form-group" style={{ minWidth: "auto" }}>
            <label>Cover/Thumbnail URL</label>
            <input
              type="text"
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              placeholder="e.g. https://images.unsplash.com/cover-image-url"
            />
          </div>
        </div>

        <div className="form-group" style={{ marginBottom: "20px" }}>
          <label>Short Description / Narrative</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Write a brief narrative caption describing the event..."
            style={{
              padding: "14px 18px",
              borderRadius: "8px",
              border: "1px solid var(--border-color)",
              outline: "none",
              fontSize: "16px",
              backgroundColor: "var(--card-bg)",
              color: "var(--text-main)"
            }}
          />
        </div>

        <div className="form-group" style={{ marginBottom: "20px" }}>
          <label>Gallery Images (URLs - One per line, or comma separated)</label>
          <textarea
            value={imagesText}
            onChange={(e) => setImagesText(e.target.value)}
            placeholder="https://images.unsplash.com/photo-1&#13;&#10;https://images.unsplash.com/photo-2&#13;&#10;https://images.unsplash.com/photo-3"
            style={{
              padding: "14px 18px",
              borderRadius: "8px",
              border: "1px solid var(--border-color)",
              outline: "none",
              fontSize: "15px",
              backgroundColor: "var(--card-bg)",
              color: "var(--text-main)",
              minHeight: "100px",
              fontFamily: "monospace"
            }}
          />
          <span style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>
            Provide URLs for the interior slide pages of this photo story. Make sure each starts with http:// or https://
          </span>
        </div>

        <div style={{ display: "flex", gap: "30px", flexWrap: "wrap", alignItems: "center", marginBottom: "20px" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "16px", cursor: "pointer", fontWeight: "600" }}>
            <input
              type="checkbox"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
              style={{ width: "20px", height: "20px" }}
            />
            Featured Photo Story (Large Highlight Card)
          </label>
        </div>

        <div className="form-submit" style={{ justifyContent: "flex-end" }}>
          <button type="submit" className="btn-primary add-category-btn">
            Publish Photo Gallery
          </button>
        </div>
      </form>

      {/* LIST TABLE */}
      <div className="table-container" style={{ marginTop: "30px" }}>
        {loading && stories.length === 0 ? (
          <div style={{ padding: "20px", textAlign: "center" }}>Loading photo stories...</div>
        ) : stories.length === 0 ? (
          <div style={{ padding: "20px", textAlign: "center", color: "var(--text-muted)" }}>No photo galleries logged yet.</div>
        ) : (
          <table className="articles-table">
            <thead>
              <tr>
                <th style={{ width: "120px" }}>Cover</th>
                <th>Photo Story Details</th>
                <th>Image Count</th>
                <th>Flags</th>
                <th style={{ width: "220px" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {stories.map((st) => (
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
                    {editingId === st._id ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          style={{ padding: "6px 10px", borderRadius: "4px", border: "1px solid var(--border-color)", fontSize: "14px" }}
                          placeholder="Gallery Title"
                        />
                        <input
                          type="text"
                          value={editCoverImage}
                          onChange={(e) => setEditCoverImage(e.target.value)}
                          style={{ padding: "6px 10px", borderRadius: "4px", border: "1px solid var(--border-color)", fontSize: "12px" }}
                          placeholder="Cover Image URL"
                        />
                        <input
                          type="text"
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                          style={{ padding: "6px 10px", borderRadius: "4px", border: "1px solid var(--border-color)", fontSize: "12px" }}
                          placeholder="Description"
                        />
                        <textarea
                          value={editImagesText}
                          onChange={(e) => setEditImagesText(e.target.value)}
                          style={{ padding: "6px 10px", borderRadius: "4px", border: "1px solid var(--border-color)", fontSize: "12px", minHeight: "80px", fontFamily: "monospace" }}
                          placeholder="Gallery Images (comma separated)"
                        />
                      </div>
                    ) : (
                      <div>
                        <div style={{ fontWeight: 600, color: "var(--text-main)" }}>{st.title}</div>
                        <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px", maxWidth: "450px" }}>
                          {st.description || "No narrative content loaded."}
                        </div>
                      </div>
                    )}
                  </td>
                  <td>
                    <span className="category-tag" style={{ background: "rgba(16, 185, 129, 0.15)", color: "#10b981", border: "1px solid #10b981" }}>
                      {editingId === st._id ? parseImages(editImagesText).length : (st.images || []).length} Images
                    </span>
                  </td>
                  <td>
                    {editingId === st._id ? (
                      <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px" }}>
                        <input type="checkbox" checked={editIsFeatured} onChange={(e) => setEditIsFeatured(e.target.checked)} />
                        Featured
                      </label>
                    ) : (
                      st.isFeatured ? (
                        <span className="status-badge badge-published" style={{ textAlign: "center" }}>Featured</span>
                      ) : (
                        <span style={{ color: "var(--text-muted)", fontSize: "12px" }}>Standard</span>
                      )
                    )}
                  </td>
                  <td>
                    {editingId === st._id ? (
                      <div style={{ display: "flex", gap: "10px" }}>
                        <button
                          className="action-btn edit"
                          onClick={() => handleUpdate(st._id)}
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
                      <div style={{ display: "flex", gap: "15px" }}>
                        <button
                          className="action-btn edit"
                          onClick={() => startEdit(st)}
                        >
                          Edit
                        </button>
                        <button
                          className="action-btn delete"
                          onClick={() => handleDelete(st._id, st.title)}
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
    </div>
  );
}

export default PhotoStories;

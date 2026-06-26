import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import API from "../config/api";
import "../styles/AnmigamRasiPalan.css"; // Reuse layouts and classes

function AnmigamTempleBlogCreate() {
  const navigate = useNavigate();
  const { id } = useParams();
  const role = localStorage.getItem("role");

  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [templeName, setTempleName] = useState("");
  const [location, setLocation] = useState("");
  const [language, setLanguage] = useState("ta");
  const [status, setStatus] = useState("draft");
  const [creatorInfo, setCreatorInfo] = useState(null);

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      const fetchBlog = async () => {
        try {
          const res = await API.get(`/api/anmigam/temple-blogs/${id}`);
          const data = res.data;
          setTitle(data.title);
          setSubtitle(data.subtitle || "");
          setDescription(data.description || "");
          setContent(data.content);
          setImage(data.image || "");
          setImagePreview(data.image || "");
          setTempleName(data.templeName || "");
          setLocation(data.location || "");
          setLanguage(data.language);
          setStatus(data.status);
          setCreatorInfo(data.createdBy);
        } catch (error) {
          console.error("Error loading Temple Blog:", error);
          alert("Failed to load Temple Blog");
        }
      };
      fetchBlog();
    }
  }, [id]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await API.post("/api/media/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      // Set image URLs
      setImage(res.data.url);
      setImagePreview(res.data.url);
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Failed to upload image");
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!title.trim()) newErrors.title = "Title is required";
    if (!content.trim() || content === "<p><br></p>") newErrors.content = "Content is required";
    if (!language) newErrors.language = "Language is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (submitStatus) => {
    if (!validate()) {
      alert("Please fix validation errors first.");
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        title,
        subtitle,
        description,
        content,
        image,
        templeName,
        location,
        language,
        status: submitStatus
      };

      if (id) {
        await API.put(`/api/anmigam/temple-blogs/${id}`, payload);
        alert("Temple Blog updated successfully!");
      } else {
        await API.post("/api/anmigam/temple-blogs", payload);
        alert("Temple Blog saved successfully!");
      }

      navigate("/admin/anmigam/temple-blogs");
    } catch (error) {
      console.error("Save error:", error);
      alert(error.response?.data?.message || "Server error saving temple blog");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAdminAction = async (action) => {
    if (!id) return;
    try {
      setIsSubmitting(true);
      if (action === "reject") {
        const reason = window.prompt("Enter rejection reason:");
        if (reason === null) return;
        if (!reason.trim()) {
          alert("Rejection reason is required");
          return;
        }
        await API.put(`/api/anmigam/temple-blogs/${id}/reject`, { reason });
      } else {
        await API.put(`/api/anmigam/temple-blogs/${id}/${action}`);
      }
      alert(`Temple Blog ${action}ed successfully!`);
      navigate("/admin/anmigam/temple-blogs");
    } catch (error) {
      console.error(`Error performing ${action}:`, error);
      alert(error.response?.data?.message || `Failed to ${action}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="anmigam-editor-container">
      
      {/* Top Header Buttons */}
      <div className="editor-top-actions">
        <div>
          <h2>Temple Blog - {id ? "Edit Post" : "Create New"}</h2>
        </div>
        <div className="action-buttons-group">
          {role === "editor" && (
            <>
              {(status === "draft" || status === "rejected") && (
                <>
                  <button className="btn-save-draft" disabled={isSubmitting} onClick={() => handleSave("draft")}>
                    Save Draft
                  </button>
                  <button className="btn-submit" disabled={isSubmitting} onClick={() => handleSave("submitted")}>
                    Submit to Admin
                  </button>
                </>
              )}
            </>
          )}

          {role === "admin" && (
            <>
              {(!id || status === "draft" || status === "rejected") && (
                <>
                  <button className="btn-save-draft" disabled={isSubmitting} onClick={() => handleSave("draft")}>
                    Save Draft
                  </button>
                  <button className="btn-submit" disabled={isSubmitting} onClick={() => handleSave("published")}>
                    Publish Directly
                  </button>
                </>
              )}
              {id && status === "submitted" && (
                <>
                  <button className="btn-save-draft" disabled={isSubmitting} onClick={() => handleSave("submitted")}>
                    Save Changes
                  </button>
                  <button className="btn-approve" disabled={isSubmitting} onClick={() => handleAdminAction("approve")}>
                    Approve
                  </button>
                  <button className="btn-reject" disabled={isSubmitting} onClick={() => handleAdminAction("reject")}>
                    Reject
                  </button>
                </>
              )}
              {id && status === "approved" && (
                <>
                  <button className="btn-save-draft" disabled={isSubmitting} onClick={() => handleSave("approved")}>
                    Save Changes
                  </button>
                  <button className="btn-publish" disabled={isSubmitting} onClick={() => handleAdminAction("publish")}>
                    Publish Live
                  </button>
                </>
              )}
              {id && status === "published" && (
                <button className="btn-submit" disabled={isSubmitting} onClick={() => handleSave("published")}>
                  Save Changes
                </button>
              )}
            </>
          )}
          <button className="btn-cancel" onClick={() => navigate("/admin/anmigam/temple-blogs")}>
            Cancel
          </button>
        </div>
      </div>

      <div className="editor-layout" style={{ gridTemplateColumns: "1.7fr 0.6fr" }}>
        
        {/* Left Side: Creation Form */}
        <div className="editor-form-panel card-panel">
          <h3>Blog Content</h3>

          <div className="form-group">
            <label>Blog Title *</label>
            <input 
              type="text" 
              placeholder="Enter temple blog title..."
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
            />
            {errors.title && <span className="error-text">{errors.title}</span>}
          </div>

          <div className="form-group">
            <label>Subtitle (Optional)</label>
            <input 
              type="text" 
              placeholder="Enter subtitle..."
              value={subtitle} 
              onChange={(e) => setSubtitle(e.target.value)} 
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Temple Name</label>
              <input 
                type="text" 
                placeholder="e.g. Meenakshi Temple"
                value={templeName} 
                onChange={(e) => setTempleName(e.target.value)} 
              />
            </div>
            <div className="form-group">
              <label>Location</label>
              <input 
                type="text" 
                placeholder="e.g. Madurai, Tamil Nadu"
                value={location} 
                onChange={(e) => setLocation(e.target.value)} 
              />
            </div>
            <div className="form-group">
              <label>Language *</label>
              <select value={language} onChange={(e) => setLanguage(e.target.value)}>
                <option value="ta">Tamil</option>
                <option value="en">English</option>
              </select>
              {errors.language && <span className="error-text">{errors.language}</span>}
            </div>
          </div>

          <div className="form-group">
            <label>Short Description (Optional)</label>
            <textarea 
              placeholder="Brief summary of the blog post..."
              value={description} 
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>

          <div className="form-group">
            <label>Cover Image</label>
            <div style={{ display: "flex", gap: "15px", alignItems: "center", flexWrap: "wrap" }}>
              <input 
                type="file" 
                accept="image/*"
                onChange={handleImageUpload} 
              />
              {imagePreview && (
                <div style={{ position: "relative", width: "120px", height: "80px", borderRadius: "8px", overflow: "hidden", border: "1px solid var(--border-color)" }}>
                  <img src={imagePreview} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  <button 
                    type="button" 
                    onClick={() => { setImage(""); setImagePreview(""); }}
                    style={{ position: "absolute", top: "4px", right: "4px", background: "rgba(0,0,0,0.6)", color: "#fff", border: "none", borderRadius: "50%", width: "20px", height: "20px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: "12px" }}
                  >
                    &times;
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="form-group">
            <label>Content *</label>
            <div style={{ backgroundColor: "var(--card-bg, #fff)", color: "#000" }}>
              <ReactQuill 
                value={content} 
                onChange={setContent} 
                placeholder="Write the full temple history, details, opening times, etc..."
                modules={{
                  toolbar: [
                    [{ 'header': [1, 2, 3, false] }],
                    ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                    [{'list': 'ordered'}, {'list': 'bullet'}],
                    ['link', 'image'],
                    ['clean']
                  ],
                }}
              />
            </div>
            {errors.content && <span className="error-text">{errors.content}</span>}
          </div>
        </div>

        {/* Right Side: Status Tracker Widget */}
        <div className="editor-status-sidebar">
          
          <div className="status-widget-card card-panel">
            <h3>Blog Status</h3>
            
            <div className="status-row">
              <span className="status-label">Current Status:</span>
              <span className={`status-badge-widget status-${status}`}>
                {status.toUpperCase()}
              </span>
            </div>

            <div className="creator-details">
              <strong>Created By:</strong>
              <div>{creatorInfo ? creatorInfo.name : "You (Editor)"}</div>
              <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>
                {id ? "Active record" : "New record"}
              </div>
            </div>

            <hr style={{ margin: "16px 0", borderColor: "var(--border-color)" }} />
            
            <strong>Workflow Steps:</strong>
            <div className="workflow-steps">
              <div className={`step-item ${status === "draft" ? "active" : "completed"}`}>
                <div className="step-number">1</div>
                <div>
                  <strong>Editor</strong>
                  <div>Create &amp; Save Draft</div>
                </div>
              </div>

              <div className={`step-item ${status === "submitted" ? "active" : status === "approved" || status === "published" ? "completed" : ""}`}>
                <div className="step-number">2</div>
                <div>
                  <strong>Admin Review</strong>
                  <div>Verify &amp; Approve / Reject</div>
                </div>
              </div>

              <div className={`step-item ${status === "published" ? "active" : ""}`}>
                <div className="step-number">3</div>
                <div>
                  <strong>Publish</strong>
                  <div>Live on Website</div>
                </div>
              </div>
            </div>

            <div className="widget-notice">
              * Only Admin can approve and publish temple blogs live on the website.
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

export default AnmigamTempleBlogCreate;

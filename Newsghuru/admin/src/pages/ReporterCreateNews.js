import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import API from "../config/api";
import "../styles/ReporterCreateNews.css";

function ReporterCreateNews() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    category: "",
    location: "",
    shortDescription: "",
    fullDescription: "",
    tags: "",
    seoKeywords: "",
    language: "ta",
  });

  const [coverImage, setCoverImage] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [galleryImages, setGalleryImages] = useState([]);
  const [galleryFiles, setGalleryFiles] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState({});
  const [categories, setCategories] = useState([]);
  const [currentStatus, setCurrentStatus] = useState("");

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await API.get(`/api/categories?language=${formData.language}`);
        setCategories(res.data || []);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, [formData.language]);

  useEffect(() => {
    if (isEditMode) {
      const fetchArticle = async () => {
        try {
          const res = await API.get(`/api/news/${id}`);
          const article = res.data;
          setFormData({
            title: article.title || "",
            subtitle: article.subtitle || "",
            category: article.category || "",
            location: article.location || "",
            shortDescription: article.shortDescription || "",
            fullDescription: article.description || "",
            tags: article.tags || "",
            seoKeywords: article.seoKeywords || "",
            language: article.language || "ta",
          });
          setCoverImage(article.coverImage || article.image || null);
          setGalleryImages(article.galleryImages || []);
          setCurrentStatus(article.status || "draft");
        } catch (error) {
          console.error("Error fetching article for editing:", error);
          alert("Failed to load article details ❌");
        }
      };
      fetchArticle();
    }
  }, [id, isEditMode]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: null });
    }
  };

  const handleQuillChange = (value) => {
    setFormData({ ...formData, fullDescription: value });
    if (errors.fullDescription) setErrors({ ...errors, fullDescription: null });
  };

  const handleCoverChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCoverFile(file);
      setCoverImage(URL.createObjectURL(file));
      if (errors.coverImage) setErrors({ ...errors, coverImage: null });
    }
  };

  const handleGalleryChange = (e) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setGalleryFiles((prev) => prev.concat(filesArray));
      
      const urlsArray = filesArray.map((file) =>
        URL.createObjectURL(file)
      );
      setGalleryImages((prevImages) => prevImages.concat(urlsArray));
      if (errors.galleryImages) setErrors({ ...errors, galleryImages: null });
    }
  };

  const removeCoverImage = () => {
    setCoverImage(null);
    setCoverFile(null);
  };

  const removeGalleryImage = (indexToRemove) => {
    setGalleryFiles(prev => prev.filter((_, index) => index !== indexToRemove));
    setGalleryImages(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.subtitle.trim()) newErrors.subtitle = "Subtitle is required";
    if (!formData.category) newErrors.category = "Category is required";
    if (!formData.location.trim()) newErrors.location = "Location is required";
    if (!formData.shortDescription.trim()) newErrors.shortDescription = "Short description is required";
    if (!formData.fullDescription || formData.fullDescription === "<p><br></p>") newErrors.fullDescription = "Full description is required";
    if (!formData.tags.trim()) newErrors.tags = "Tags are required";
    if (!formData.seoKeywords.trim()) newErrors.seoKeywords = "SEO keywords are required";
    if (!coverImage) newErrors.coverImage = "Cover image is required";
    if (galleryImages.length === 0) newErrors.galleryImages = "At least one gallery image is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const saveNews = async (status) => {
    if (!validateForm()) return;

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title);
      formDataToSend.append("subtitle", formData.subtitle);
      formDataToSend.append("category", formData.category);
      formDataToSend.append("location", formData.location);
      formDataToSend.append("shortDescription", formData.shortDescription);
      formDataToSend.append("fullDescription", formData.fullDescription);
      formDataToSend.append("tags", formData.tags);
      formDataToSend.append("seoKeywords", formData.seoKeywords);
      formDataToSend.append("status", status);
      formDataToSend.append("language", formData.language);

      if (coverFile) {
        formDataToSend.append("coverImage", coverFile);
      }

      galleryFiles.forEach((file) => {
        formDataToSend.append("galleryImages", file);
      });

      const res = isEditMode
        ? await API.put(`/api/news/${id}`, formDataToSend, {
            headers: { "Content-Type": "multipart/form-data" },
          })
        : await API.post("/api/news/create", formDataToSend, {
            headers: { "Content-Type": "multipart/form-data" },
          });

      if (res.data) {
        const isAdmin = localStorage.getItem("role") === "admin";
        if (status === "draft") {
          alert(isEditMode ? "Article updated successfully! 💾" : "Draft saved successfully! 💾");
          if (isEditMode) {
            navigate(isAdmin ? "/admin/all-news" : "/reporter/drafts");
          } else {
            setFormData({
              title: "",
              subtitle: "",
              category: "",
              location: "",
              shortDescription: "",
              fullDescription: "",
              tags: "",
              seoKeywords: "",
              language: "ta",
            });
            setCoverImage(null);
            setCoverFile(null);
            setGalleryImages([]);
            setGalleryFiles([]);
          }
        } else {
          if (isAdmin) {
            alert("Article updated successfully! 🎉");
            navigate("/admin/all-news");
          } else {
            setIsSubmitted(true);
          }
        }
      }
    } catch (error) {
      console.error("Error saving news:", error);
      alert(error.response?.data?.message || "Failed to submit news article ❌");
    }
  };

  const handleSaveDraft = () => {
    saveNews("draft");
  };

  const triggerSubmitConfirm = (e) => {
    e.preventDefault();
    if (validateForm()) {
      setShowConfirm(true);
    }
  };

  const confirmSubmit = () => {
    setShowConfirm(false);
    saveNews("pending_editor_review");
  };

  if (isSubmitted) {
    return (
      <div className="success-message-container">
        <div className="success-box">
          <h2>News submitted successfully! 🎉</h2>
          <p>Waiting for editor review.</p>
          <div className="status-badge pending">Status: Pending Editor Review</div>
          <button className="btn-primary mt-4" onClick={() => {
            setIsSubmitted(false);
            setFormData({title: "", subtitle: "", category: "", location: "", shortDescription: "", fullDescription: "", tags: "", seoKeywords: "", language: "ta"});
            setCoverImage(null);
            setCoverFile(null);
            setGalleryImages([]);
            setGalleryFiles([]);
          }}>
            Create Another News
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="reporter-create-news">
      <div className="header-actions">
        <h2>{isEditMode ? "Edit News Article" : "Create News Article"}</h2>
        <div className="action-buttons">
          {localStorage.getItem("role") === "admin" ? (
            <>
              <button className="btn-secondary" onClick={(e) => { e.preventDefault(); navigate("/admin/all-news"); }}>Cancel</button>
              <button className="btn-secondary" onClick={(e) => { e.preventDefault(); setShowPreview(true); }}>Preview</button>
              <button className="btn-primary" onClick={() => saveNews(currentStatus || "published")}>Save Changes</button>
            </>
          ) : (
            <>
              <button className="btn-secondary" onClick={handleSaveDraft}>Save Draft</button>
              <button className="btn-secondary" onClick={(e) => { e.preventDefault(); setShowPreview(true); }}>Preview</button>
              <button className="btn-primary" onClick={triggerSubmitConfirm}>Submit to Editor</button>
            </>
          )}
        </div>
      </div>

      <form className="news-form">
        <div className="form-grid">
          
          <div className="form-group full-width">
            <label>Title <span className="required">*</span></label>
            <input type="text" name="title" className={errors.title ? "error-input" : ""} value={formData.title} onChange={handleChange} placeholder="Enter main headline" />
            {errors.title && <span className="error-text">{errors.title}</span>}
          </div>

          <div className="form-group full-width">
            <label>Subtitle <span className="required">*</span></label>
            <input type="text" name="subtitle" className={errors.subtitle ? "error-input" : ""} value={formData.subtitle} onChange={handleChange} placeholder="Enter subtitle" />
            {errors.subtitle && <span className="error-text">{errors.subtitle}</span>}
          </div>

          <div className="form-group">
            <label>Language / மொழி <span className="required">*</span></label>
            <select name="language" value={formData.language} onChange={handleChange}>
              <option value="ta">Tamil / தமிழ்</option>
              <option value="en">English / ஆங்கிலம்</option>
            </select>
          </div>

          <div className="form-group">
            <label>Category / வகை <span className="required">*</span></label>
            <select name="category" className={errors.category ? "error-input" : ""} value={formData.category} onChange={handleChange}>
              <option value="">Select Category / வகையைத் தேர்ந்தெடுக்கவும்</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat.slug}>
                  {cat.name}
                </option>
              ))}
            </select>
            {errors.category && <span className="error-text">{errors.category}</span>}
          </div>

          <div className="form-group">
            <label>Location <span className="required">*</span></label>
            <input type="text" name="location" className={errors.location ? "error-input" : ""} value={formData.location} onChange={handleChange} placeholder="e.g., Chennai, Tamil Nadu" />
            {errors.location && <span className="error-text">{errors.location}</span>}
          </div>

          <div className="form-group full-width">
            <label>Short Description (Summary) <span className="required">*</span></label>
            <textarea name="shortDescription" className={errors.shortDescription ? "error-input" : ""} rows="3" value={formData.shortDescription} onChange={handleChange} placeholder="Brief summary of the news..."></textarea>
            {errors.shortDescription && <span className="error-text">{errors.shortDescription}</span>}
          </div>

          <div className="form-group full-width quill-container">
            <label>Full Description <span className="required">*</span></label>
            <div className={errors.fullDescription ? "error-editor" : ""}>
              <ReactQuill theme="snow" value={formData.fullDescription} onChange={handleQuillChange} style={{height: '300px', marginBottom: '50px'}} />
            </div>
            {errors.fullDescription && <span className="error-text quill-error">{errors.fullDescription}</span>}
          </div>

          <div className="form-group">
            <label>Tags <span className="required">*</span></label>
            <input type="text" name="tags" className={errors.tags ? "error-input" : ""} value={formData.tags} onChange={handleChange} placeholder="e.g., breaking, news (comma separated)" />
            {errors.tags && <span className="error-text">{errors.tags}</span>}
          </div>

          <div className="form-group">
            <label>SEO Keywords <span className="required">*</span></label>
            <input type="text" name="seoKeywords" className={errors.seoKeywords ? "error-input" : ""} value={formData.seoKeywords} onChange={handleChange} placeholder="Keywords for search engines" />
            {errors.seoKeywords && <span className="error-text">{errors.seoKeywords}</span>}
          </div>

          <div className="form-group">
            <label>Cover Image Upload <span className="required">*</span></label>
            <div className={`upload-box ${errors.coverImage ? "error-box" : ""}`}>
              <input type="file" accept="image/*" onChange={handleCoverChange} />
              {coverImage && (
                <div style={{ position: 'relative', display: 'inline-block', marginTop: '10px' }}>
                  <img src={coverImage} alt="Cover Preview" className="img-preview" />
                  <button 
                    type="button"
                    onClick={removeCoverImage}
                    style={{
                      position: 'absolute', top: '-10px', right: '-10px', background: '#ef4444', color: 'white',
                      border: 'none', borderRadius: '50%', width: '24px', height: '24px', display: 'flex',
                      alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '14px',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                    }}
                  >
                    &times;
                  </button>
                </div>
              )}
            </div>
            {errors.coverImage && <span className="error-text mt-1">{errors.coverImage}</span>}
          </div>

          <div className="form-group">
            <label>Gallery Images Upload <span className="required">*</span></label>
            <div className={`upload-box ${errors.galleryImages ? "error-box" : ""}`}>
              <input type="file" accept="image/*" multiple onChange={handleGalleryChange} />
              <div className="gallery-preview">
                {galleryImages.map((src, index) => (
                  <div key={index} style={{ position: 'relative', display: 'inline-block', margin: '5px' }}>
                    <img src={src} alt={`Gallery ${index}`} className="img-preview small" />
                    <button 
                      type="button"
                      onClick={() => removeGalleryImage(index)}
                      style={{
                        position: 'absolute', top: '-5px', right: '-5px', background: '#ef4444', color: 'white',
                        border: 'none', borderRadius: '50%', width: '20px', height: '20px', display: 'flex',
                        alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '12px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                      }}
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            </div>
            {errors.galleryImages && <span className="error-text mt-1">{errors.galleryImages}</span>}
          </div>

        </div>
      </form>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Confirm Submission</h3>
            <p>Are you sure you want to submit this article for editor review?</p>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowConfirm(false)}>Cancel</button>
              <button className="btn-primary" onClick={confirmSubmit}>Submit</button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && (
        <div className="modal-overlay">
          <div className="modal-content preview-modal">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #e2e8f0", paddingBottom: "15px", marginBottom: "20px" }}>
              <h2 style={{ margin: 0, fontSize: "22px", color: "#0f172a" }}>Article Preview</h2>
              <button 
                className="btn-secondary" 
                onClick={() => setShowPreview(false)}
                style={{ padding: "6px 12px", minWidth: "auto" }}
              >
                Close Preview
              </button>
            </div>

            {/* Cover Image */}
            {coverImage ? (
              <img src={coverImage} alt="Cover Preview" style={{ width: '100%', maxHeight: '350px', objectFit: 'cover', borderRadius: '8px', marginBottom: '20px' }} />
            ) : (
              <div style={{ width: '100%', height: '200px', background: '#f1f5f9', borderRadius: '8px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                No Cover Image Selected
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
              <span className="category-tag" style={{ background: '#3b82f6', color: '#ffffff', padding: '4px 10px', borderRadius: '4px', fontSize: '12px', fontWeight: 600 }}>
                {formData.category || "No Category"}
              </span>
              <span style={{ color: '#64748b', fontSize: '13px', alignSelf: 'center' }}>
                {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
              </span>
            </div>

            <h1 style={{ fontSize: '28px', fontWeight: 700, margin: '0 0 10px 0', color: '#0f172a', lineHeight: '1.3' }}>
              {formData.title || "Untitled Article"}
            </h1>
            <h3 style={{ fontSize: '18px', fontWeight: 400, color: '#475569', margin: '0 0 20px 0', lineHeight: '1.4' }}>
              {formData.subtitle || "No subtitle provided."}
            </h3>

            <div className="preview-modal-meta">
              <div><strong>Reporter:</strong> <span style={{ color: '#3b82f6' }}>{localStorage.getItem("userName") || "Reporter User"}</span></div>
              <div><strong>Editor:</strong> <span style={{ color: '#64748b' }}>Not Assigned</span></div>
              <div><strong>Location:</strong> {formData.location || "Not specified"}</div>
            </div>

            {/* Short Description */}
            {formData.shortDescription && (
              <div style={{ padding: '15px', background: '#f8fafc', borderLeft: '4px solid #3b82f6', borderRadius: '4px', marginBottom: '20px', fontStyle: 'italic', color: '#475569' }}>
                <strong>Summary: </strong>{formData.shortDescription}
              </div>
            )}

            {/* Full Content */}
            <div className="preview-modal-body" dangerouslySetInnerHTML={{ __html: formData.fullDescription || "<p>No content written yet.</p>" }}>
            </div>

            {/* Gallery Images */}
            {galleryImages && galleryImages.length > 0 && (
              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '20px', marginBottom: '20px' }}>
                <strong>Gallery:</strong>
                <div className="preview-gallery">
                  {galleryImages.map((src, index) => (
                    <img key={index} src={src} alt={`Gallery ${index}`} className="preview-gallery-img" style={{ height: '120px', width: '120px', objectFit: 'cover', borderRadius: '6px' }} />
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '20px', borderTop: '1px solid #e2e8f0', paddingTop: '20px', fontSize: '13px', color: '#64748b' }}>
              <div><strong>Tags:</strong> {formData.tags || "None"}</div>
              <div><strong>SEO Keywords:</strong> {formData.seoKeywords || "None"}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ReporterCreateNews;

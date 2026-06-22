import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import API from "../config/api";
import "../styles/ReporterCreateNews.css"; // Reuse styling
import "../styles/EditorReviewNews.css"; // Specific editor styling for modals

function EditorReviewNews() {
  const { id } = useParams();
  const navigate = useNavigate();
  
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

  const [article, setArticle] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [errors, setErrors] = useState({});
  
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [approveComment, setApproveComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // AI Grammar Check States
  const [grammarIssues, setGrammarIssues] = useState([]);
  const [checkingGrammar, setCheckingGrammar] = useState(false);
  const [grammarChecked, setGrammarChecked] = useState(false);

  // Cover & Gallery Images
  const [coverImage, setCoverImage] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [galleryImages, setGalleryImages] = useState([]);
  const [galleryFiles, setGalleryFiles] = useState([]);
  const [categories, setCategories] = useState([]);

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

  const stripHtml = (html) => {
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  const runGrammarCheck = async () => {
    setCheckingGrammar(true);
    setGrammarIssues([]);
    
    const fieldsToCheck = [
      { key: "title", label: "Title", text: formData.title },
      { key: "subtitle", label: "Subtitle", text: formData.subtitle },
      { key: "shortDescription", label: "Short Description", text: formData.shortDescription },
      { key: "fullDescription", label: "Full Description", text: stripHtml(formData.fullDescription) }
    ];

    let allIssues = [];

    try {
      for (const field of fieldsToCheck) {
        if (!field.text || !field.text.trim()) continue;

        const apiUrl = process.env.REACT_APP_LANGUAGETOOL_API_URL || "https://api.languagetool.org/v2/check";
        const response = await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            text: field.text,
            language: "auto",
          }),
        });

        const data = await response.json();
        
        if (data.matches && data.matches.length > 0) {
          const issues = data.matches.map((match, index) => ({
            id: `${field.key}-${index}`,
            fieldKey: field.key,
            fieldLabel: field.label,
            message: match.message,
            context: match.context.text,
            offset: match.context.offset,
            length: match.context.length,
            replacements: match.replacements.slice(0, 3), // top 3 suggestions
            originalText: field.text.substring(match.offset, match.offset + match.length),
            matchOffset: match.offset,
            matchLength: match.length
          }));
          allIssues = [...allIssues, ...issues];
        }
      }
      
      setGrammarIssues(allIssues);
      setGrammarChecked(true);
    } catch (error) {
      console.error("Grammar check failed:", error);
      alert("Failed to run AI Grammar Check ❌");
    } finally {
      setCheckingGrammar(false);
    }
  };

  const applyFix = (issue, replacement) => {
    const currentText = formData[issue.fieldKey] || "";
    
    // Create a robust regex that ignores HTML tags and &nbsp; between words
    const escapeRegExp = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regexStr = escapeRegExp(issue.originalText).replace(/\s+/g, '(?:\\s|&nbsp;|<[^>]+>)+');
    const regex = new RegExp(regexStr);
    
    const newText = currentText.replace(regex, replacement.value);
    
    if (newText === currentText && issue.fieldKey === "fullDescription") {
      alert("Could not auto-fix this issue because of complex rich text formatting. Please scroll down and manually edit it in the editor.");
      return;
    }
    
    setFormData({ ...formData, [issue.fieldKey]: newText });
    setGrammarIssues(grammarIssues.filter(i => i.id !== issue.id));
  };

  const dismissFix = (issueId) => {
    setGrammarIssues(grammarIssues.filter(i => i.id !== issueId));
  };

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const res = await API.get(`/api/news/${id}`);
        const found = res.data;
        if (found) {
          setArticle(found);
          setFormData({
            title: found.title || "",
            subtitle: found.subtitle || "",
            category: found.category || "",
            location: found.location || "",
            shortDescription: found.shortDescription || "",
            fullDescription: found.description || "",
            tags: found.tags || "",
            seoKeywords: found.seoKeywords || "",
            language: found.language || "ta",
          });
          setCoverImage(found.coverImage || found.image || null);
          setGalleryImages(found.galleryImages || []);
        }
      } catch (error) {
        console.error("Error fetching article for review:", error);
        alert("Failed to load article details ❌");
      }
    };
    fetchArticle();
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: null });
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
    }
  };

  const handleGalleryChange = (e) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setGalleryFiles((prev) => prev.concat(filesArray));
      
      const urlsArray = filesArray.map((file) => URL.createObjectURL(file));
      setGalleryImages((prevImages) => prevImages.concat(urlsArray));
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      const data = new FormData();
      data.append("title", formData.title);
      data.append("subtitle", formData.subtitle);
      data.append("category", formData.category);
      data.append("location", formData.location);
      data.append("shortDescription", formData.shortDescription);
      data.append("fullDescription", formData.fullDescription);
      data.append("tags", formData.tags);
      data.append("seoKeywords", formData.seoKeywords);
      data.append("language", formData.language);

      if (coverFile) {
        data.append("coverImage", coverFile);
      }
      galleryFiles.forEach((file) => {
        data.append("galleryImages", file);
      });

      await API.put(`/api/news/editor/save/${id}`, data, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      alert("Changes saved successfully! 💾");
    } catch (error) {
      console.error("Error saving changes:", error);
      alert(error.response?.data?.message || "Failed to save changes ❌");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      alert("Please provide a reason for rejection.");
      return;
    }
    try {
      setSubmitting(true);
      await API.put(`/api/news/editor/reject/${id}`, {
        rejectionReason: rejectReason
      });
      alert("Article rejected and returned to reporter 🗑️");
      setShowRejectModal(false);
      navigate("/editor/rejected");
    } catch (error) {
      console.error("Error rejecting article:", error);
      alert(error.response?.data?.message || "Failed to reject article ❌");
    } finally {
      setSubmitting(false);
    }
  };

  const handleApprove = async () => {
    try {
      setSubmitting(true);
      await API.put(`/api/news/editor/approve/${id}`, {
        comment: approveComment // Optional comment
      });
      alert("Article approved and forwarded to Admin! 🎉");
      setShowApproveModal(false);
      navigate("/editor/approved");
    } catch (error) {
      console.error("Error approving article:", error);
      alert(error.response?.data?.message || "Failed to approve article ❌");
    } finally {
      setSubmitting(false);
    }
  };

  if (!article) return <div style={{padding: '50px'}}>Loading article...</div>;

  const getStatusLabel = (status) => {
    switch (status) {
      case "published": return "Published";
      case "pending_editor_review": return "Pending Review";
      case "pending_admin_verification": return "Pending Approval";
      case "rejected": return "Rejected";
      case "draft": return "Draft";
      default: return status;
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "published": return "badge-published";
      case "pending_editor_review": return "badge-pending";
      case "pending_admin_verification": return "badge-approved";
      case "rejected": return "badge-rejected";
      case "draft": return "badge-draft";
      default: return "";
    }
  };

  return (
    <div className="reporter-create-news">
      <div className="header-actions">
        <div>
          <h2>Review Article</h2>
          <span className={`status-badge ${getStatusClass(article.status)}`}>
            Status: {getStatusLabel(article.status)}
          </span>
        </div>
        <div className="action-buttons">
          <button className="btn-secondary" onClick={handleSave} disabled={submitting}>
            {submitting ? "Saving..." : "Save Changes"}
          </button>
          <button className="btn-secondary" onClick={(e) => { e.preventDefault(); setShowPreview(true); }}>Preview</button>
          {article.status === "pending_editor_review" && (
            <>
              <button 
                className="btn-primary" 
                onClick={runGrammarCheck} 
                disabled={checkingGrammar}
                style={{background: '#8b5cf6'}}
              >
                {checkingGrammar ? "Checking..." : "Run AI Grammar Check"}
              </button>
              <button 
                className="btn-danger" 
                onClick={() => { if (validateForm()) setShowRejectModal(true); }} 
                style={{background: '#ef4444', color: '#ffffff', border:'none', padding:'10px 20px', borderRadius:'6px', fontWeight: 600, cursor:'pointer'}}
              >
                Reject
              </button>
              <button 
                className="btn-primary" 
                onClick={() => { 
                  if (!grammarChecked) {
                    alert("Please run the AI Grammar Check first.");
                    return;
                  }
                  if (grammarIssues.length > 0) {
                    alert("Please fix or dismiss all grammar issues before approving.");
                    return;
                  }
                  if (validateForm()) setShowApproveModal(true); 
                }} 
                style={{background: (grammarChecked && grammarIssues.length === 0) ? '#10b981' : '#94a3b8', cursor: (grammarChecked && grammarIssues.length === 0) ? 'pointer' : 'not-allowed'}}
                disabled={!grammarChecked || grammarIssues.length > 0}
              >
                Approve & Send to Admin
              </button>
            </>
          )}
        </div>
      </div>

      {grammarChecked && (
        <div style={{background: '#f8fafc', padding: '20px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #e2e8f0'}}>
          <h3 style={{margin: '0 0 15px 0', color: '#0f172a'}}>AI Grammar & Spelling Check</h3>
          {grammarIssues.length === 0 ? (
            <div style={{color: '#10b981', fontWeight: 600}}>✅ No grammar issues found! You can now send to Admin.</div>
          ) : (
            <div style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
              <div style={{color: '#ef4444', fontWeight: 600}}>Found {grammarIssues.length} issue(s). Please fix or dismiss them.</div>
              {grammarIssues.map(issue => (
                <div key={issue.id} style={{background: '#ffffff', padding: '15px', borderRadius: '6px', border: '1px solid #cbd5e1', display: 'flex', flexDirection: 'column', gap: '10px'}}>
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <strong>{issue.fieldLabel}</strong>
                    <button onClick={() => dismissFix(issue.id)} style={{background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '14px', textDecoration: 'underline'}}>Dismiss</button>
                  </div>
                  <div style={{color: '#ef4444', fontSize: '14px'}}>{issue.message}</div>
                  <div style={{background: '#f1f5f9', padding: '10px', borderRadius: '4px', fontSize: '14px', fontStyle: 'italic'}}>
                    "...{issue.context}..."
                  </div>
                  {issue.replacements.length > 0 && (
                    <div style={{display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '5px'}}>
                      <span style={{fontSize: '13px', color: '#475569', alignSelf: 'center'}}>Suggestions:</span>
                      {issue.replacements.map((rep, i) => (
                        <button 
                          key={i} 
                          onClick={(e) => { e.preventDefault(); applyFix(issue, rep); }}
                          style={{background: '#e0e7ff', color: '#4f46e5', border: '1px solid #c7d2fe', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', fontWeight: 600}}
                        >
                          {rep.value}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <form className="news-form">
        <div className="form-grid">
          
          <div className="form-group full-width">
            <label>Title <span className="required">*</span></label>
            <input type="text" name="title" className={errors.title ? "error-input" : ""} value={formData.title} onChange={handleChange} />
            {errors.title && <span className="error-text">{errors.title}</span>}
          </div>

          <div className="form-group full-width">
            <label>Subtitle <span className="required">*</span></label>
            <input type="text" name="subtitle" className={errors.subtitle ? "error-input" : ""} value={formData.subtitle} onChange={handleChange} />
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
            <input type="text" name="location" className={errors.location ? "error-input" : ""} value={formData.location} onChange={handleChange} />
            {errors.location && <span className="error-text">{errors.location}</span>}
          </div>

          <div className="form-group full-width">
            <label>Short Description (Summary) <span className="required">*</span></label>
            <textarea name="shortDescription" className={errors.shortDescription ? "error-input" : ""} rows="3" value={formData.shortDescription} onChange={handleChange}></textarea>
            {errors.shortDescription && <span className="error-text">{errors.shortDescription}</span>}
          </div>

          <div className="form-group full-width quill-container">
            <label>Full Description (Editor) <span className="required">*</span></label>
            <div className={errors.fullDescription ? "error-editor" : ""}>
              <ReactQuill theme="snow" value={formData.fullDescription} onChange={handleQuillChange} style={{height: '400px', marginBottom: '50px'}} />
            </div>
            {errors.fullDescription && <span className="error-text quill-error">{errors.fullDescription}</span>}
          </div>

          <div className="form-group">
            <label>Tags <span className="required">*</span></label>
            <input type="text" name="tags" className={errors.tags ? "error-input" : ""} value={formData.tags} onChange={handleChange} />
            {errors.tags && <span className="error-text">{errors.tags}</span>}
          </div>

          <div className="form-group">
            <label>SEO Keywords <span className="required">*</span></label>
            <input type="text" name="seoKeywords" className={errors.seoKeywords ? "error-input" : ""} value={formData.seoKeywords} onChange={handleChange} />
            {errors.seoKeywords && <span className="error-text">{errors.seoKeywords}</span>}
          </div>

          <div className="form-group">
            <label>Cover Image Upload</label>
            <div className="upload-box">
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
          </div>

          <div className="form-group">
            <label>Gallery Images Upload</label>
            <div className="upload-box">
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
          </div>
        </div>
      </form>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 style={{color: '#ef4444'}}>Reject Article</h3>
            <p>Please provide a reason for rejecting this article. It will be sent back to the reporter.</p>
            <textarea 
              rows="4" 
              style={{width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc', marginTop: '10px'}}
              placeholder="e.g., Please verify the primary source quotation..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            ></textarea>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowRejectModal(false)}>Cancel</button>
              <button className="btn-danger" onClick={handleReject} style={{background: '#ef4444', color: '#ffffff', border:'none', padding:'10px 20px', borderRadius:'6px', fontWeight: 600, cursor:'pointer'}} disabled={submitting}>
                {submitting ? "Rejecting..." : "Confirm Rejection"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Approve Modal */}
      {showApproveModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{maxWidth: '500px', textAlign: 'left'}}>
            <h3 style={{color: '#10b981', textAlign: 'center'}}>Approve Article</h3>
            <p style={{textAlign: 'center', marginBottom: '20px'}}>Are you sure you want to approve this article and send it to the Admin? AI Grammar Check has passed.</p>
            
            <div style={{marginTop: '20px'}}>
              <label style={{fontWeight: 600, fontSize: '14px', color: 'var(--text-main)'}}>Optional Editor Comment to Admin</label>
              <textarea 
                rows="4" 
                style={{width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc', marginTop: '5px'}}
                placeholder="Looks good..."
                value={approveComment}
                onChange={(e) => setApproveComment(e.target.value)}
              ></textarea>
            </div>

            <div className="modal-actions" style={{justifyContent: 'center', marginTop: '30px'}}>
              <button className="btn-secondary" onClick={() => setShowApproveModal(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleApprove} disabled={submitting} style={{background: '#10b981', cursor: 'pointer'}}>
                {submitting ? "Approving..." : "Send to Admin"}
              </button>
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
                {article.date || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
              </span>
            </div>

            <h1 style={{ fontSize: '28px', fontWeight: 700, margin: '0 0 10px 0', color: '#0f172a', lineHeight: '1.3' }}>
              {formData.title || "Untitled Article"}
            </h1>
            <h3 style={{ fontSize: '18px', fontWeight: 400, color: '#475569', margin: '0 0 20px 0', lineHeight: '1.4' }}>
              {formData.subtitle || "No subtitle provided."}
            </h3>

            <div className="preview-modal-meta">
              <div><strong>Reporter:</strong> <span style={{ color: '#3b82f6' }}>{article.reporterId?.name || "Reporter User"}</span></div>
              <div><strong>Editor:</strong> <span style={{ color: '#10b981' }}>{localStorage.getItem("userName") || "Editor User"}</span></div>
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

export default EditorReviewNews;

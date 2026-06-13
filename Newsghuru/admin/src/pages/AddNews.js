import React, { useState } from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import "../styles/ReporterCreateNews.css"; // Reuse styling
import API from "../config/api";
import { useNavigate } from "react-router-dom";

function AddNews() {
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
    date: new Date().toISOString().split("T")[0],
  });

  const [coverImage, setCoverImage] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [galleryImages, setGalleryImages] = useState([]);
  const [galleryFiles, setGalleryFiles] = useState([]);
  const [errors, setErrors] = useState({});

  // AI Grammar Check States
  const [grammarIssues, setGrammarIssues] = useState([]);
  const [checkingGrammar, setCheckingGrammar] = useState(false);
  const [grammarChecked, setGrammarChecked] = useState(false);

  const stripHtml = (html) => {
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  const runGrammarCheck = async (e) => {
    if (e) e.preventDefault();
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
      alert("Failed to run AI Grammar Check \u274c");
    } finally {
      setCheckingGrammar(false);
    }
  };

  const applyFix = (issue, replacement) => {
    const currentText = formData[issue.fieldKey] || "";
    
    const escapeRegExp = (string) => string.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&');
    const regexStr = escapeRegExp(issue.originalText).replace(/\\s+/g, '(?:\\\\s|&nbsp;|<[^>]+>)+');
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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: null });
  };

  const handleQuillChange = (value) => {
    setFormData({ ...formData, fullDescription: value });
    if (errors.fullDescription) setErrors({ ...errors, fullDescription: null });
  };

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverImage(file);
      setCoverPreview(URL.createObjectURL(file));
      if (errors.coverImage) setErrors({ ...errors, coverImage: null });
    }
  };

  const handleGalleryChange = (e) => {
    const files = Array.from(e.target.files);
    setGalleryFiles((prev) => prev.concat(files));
    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setGalleryImages((prev) => [...prev, ...newPreviews]);
    if (errors.galleryImages) setErrors({ ...errors, galleryImages: null });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.category) newErrors.category = "Category is required";
    if (!formData.shortDescription.trim()) newErrors.shortDescription = "Short description is required";
    if (!formData.fullDescription || formData.fullDescription === "<p><br></p>") newErrors.fullDescription = "Full description is required";
    if (!coverImage) newErrors.coverImage = "Cover image is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const newsData = new FormData();
      newsData.append("title", formData.title);
      newsData.append("subtitle", formData.subtitle);
      newsData.append("category", formData.category.toLowerCase());
      newsData.append("location", formData.location);
      newsData.append("shortDescription", formData.shortDescription);
      newsData.append("fullDescription", formData.fullDescription);
      newsData.append("tags", formData.tags);
      newsData.append("seoKeywords", formData.seoKeywords);
      newsData.append("status", "published");
      
      if (coverImage) {
        newsData.append("coverImage", coverImage);
      }
      
      galleryFiles.forEach((file) => {
        newsData.append("galleryImages", file);
      });

      await API.post("/api/news/create", newsData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("News Added and Published Successfully 🎉");
      navigate("/admin/published");

    } catch (error) {
      console.error("Upload Error:", error);
      alert("Upload Failed ❌");
    }
  };

  return (
    <div className="reporter-create-news">
      <div className="header-actions">
        <h2>Direct Admin Publish</h2>
        <div className="action-buttons">
          <button 
            className="btn-primary" 
            onClick={runGrammarCheck} 
            disabled={checkingGrammar}
            style={{background: '#8b5cf6', marginRight: '10px'}}
          >
            {checkingGrammar ? "Checking..." : "Run AI Grammar Check"}
          </button>
          <button 
            className="btn-primary" 
            onClick={handleSubmit}
            disabled={!grammarChecked || grammarIssues.length > 0}
            style={(!grammarChecked || grammarIssues.length > 0) ? { opacity: 0.5, cursor: "not-allowed" } : {}}
          >
            Publish News Immediately
          </button>
        </div>
      </div>

      {grammarChecked && (
        <div style={{background: '#f8fafc', padding: '20px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #e2e8f0'}}>
          <h3 style={{margin: '0 0 15px 0', color: '#0f172a'}}>AI Grammar & Spelling Check</h3>
          {grammarIssues.length === 0 ? (
            <div style={{color: '#10b981', fontWeight: 600}}>✅ No grammar issues found! You can now publish the news.</div>
          ) : (
            <div style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
              <div style={{color: '#ef4444', fontWeight: 600}}>Found {grammarIssues.length} issue(s). Please fix or dismiss them.</div>
              {grammarIssues.map(issue => (
                <div key={issue.id} style={{background: '#ffffff', padding: '15px', borderRadius: '6px', border: '1px solid #cbd5e1', display: 'flex', flexDirection: 'column', gap: '10px'}}>
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <strong>{issue.fieldLabel}</strong>
                    <button onClick={(e) => { e.preventDefault(); dismissFix(issue.id); }} style={{background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '14px', textDecoration: 'underline'}}>Dismiss</button>
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

      <form className="news-form" onSubmit={handleSubmit}>
        <div className="form-grid">
          
          <div className="form-group full-width">
            <label>Title <span className="required">*</span></label>
            <input type="text" name="title" className={errors.title ? "error-input" : ""} value={formData.title} onChange={handleChange} placeholder="Enter news headline" />
            {errors.title && <span className="error-text">{errors.title}</span>}
          </div>

          <div className="form-group full-width">
            <label>Subtitle</label>
            <input type="text" name="subtitle" className={errors.subtitle ? "error-input" : ""} value={formData.subtitle} onChange={handleChange} placeholder="Enter subtitle" />
          </div>

          <div className="form-group">
            <label>Category <span className="required">*</span></label>
            <select name="category" className={errors.category ? "error-input" : ""} value={formData.category} onChange={handleChange}>
              <option value="">Select Category</option>
              <option value="Politics">Politics</option>
              <option value="Sports">Sports</option>
              <option value="Entertainment">Entertainment</option>
              <option value="Technology">Technology</option>
              <option value="Education">Education</option>
              <option value="India">India</option>
              <option value="World">World</option>
              <option value="Cinema">Cinema</option>
              <option value="Tamil">Tamil</option>
              <option value="breaking">Breaking</option>
            </select>
            {errors.category && <span className="error-text">{errors.category}</span>}
          </div>

          <div className="form-group">
            <label>Location</label>
            <input type="text" name="location" className={errors.location ? "error-input" : ""} value={formData.location} onChange={handleChange} placeholder="e.g., Chennai, Tamil Nadu" />
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
            <label>Tags</label>
            <input type="text" name="tags" className={errors.tags ? "error-input" : ""} value={formData.tags} onChange={handleChange} placeholder="e.g., breaking, news" />
          </div>

          <div className="form-group">
            <label>SEO Keywords</label>
            <input type="text" name="seoKeywords" className={errors.seoKeywords ? "error-input" : ""} value={formData.seoKeywords} onChange={handleChange} placeholder="Keywords for search engines" />
          </div>

          <div className="form-group">
            <label>Cover Image Upload <span className="required">*</span></label>
            <div className={`upload-box ${errors.coverImage ? "error-box" : ""}`}>
              <input type="file" accept="image/*" onChange={handleCoverChange} />
              {coverPreview && <img src={coverPreview} alt="Cover Preview" className="img-preview" />}
            </div>
            {errors.coverImage && <span className="error-text mt-1">{errors.coverImage}</span>}
          </div>

          <div className="form-group">
            <label>Gallery Images Upload</label>
            <div className={`upload-box ${errors.galleryImages ? "error-box" : ""}`}>
              <input type="file" accept="image/*" multiple onChange={handleGalleryChange} />
              <div className="gallery-preview">
                {galleryImages.map((src, index) => (
                  <img key={index} src={src} alt={`Gallery ${index}`} className="img-preview small" />
                ))}
              </div>
            </div>
          </div>

        </div>
      </form>
    </div>
  );
}

export default AddNews;
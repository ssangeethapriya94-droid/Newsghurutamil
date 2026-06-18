import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../config/api";
import { FiUpload, FiTrash2, FiSave, FiArrowLeft, FiAlertCircle } from "react-icons/fi";
import "../styles/ReporterCreateNews.css"; // Reuse existing news form styles for consistency

function AddAd() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    title: "",
    advertiserName: "",
    advertiserEmail: "",
    advertiserPhone: "",
    companyName: "",
    description: "",
    image: "",
    targetUrl: "",
    position: "TOP_BANNER",
    priority: "Medium",
    status: "Active",
    popupDelay: 3,
    popupAutoClose: 10,
    rotationInterval: 10,
    startDate: "",
    startTime: "00:00",
    endDate: "",
    endTime: "23:59"
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(isEditMode);
  const [error, setError] = useState("");
  const [aspectRatioWarning, setAspectRatioWarning] = useState("");
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });

  // Check if we came from Ad Request conversion
  useEffect(() => {
    const prefillData = localStorage.getItem("convert_ad_prefill");
    if (prefillData && !isEditMode) {
      try {
        const parsed = JSON.parse(prefillData);
        setFormData(prev => ({
          ...prev,
          ...parsed
        }));
        // Clean up
        localStorage.removeItem("convert_ad_prefill");
      } catch (err) {
        console.error("Error parsing prefill data", err);
      }
    }
  }, [isEditMode]);

  useEffect(() => {
    if (isEditMode) {
      const fetchAd = async () => {
        try {
          setLoading(true);
          const res = await API.get(`/api/ads/${id}`);
          if (res.data.success) {
            const ad = res.data.ad;
            // Format dates for date inputs (YYYY-MM-DD)
            const fmtDate = (d) => {
              if (!d) return "";
              const dateObj = new Date(d);
              return dateObj.toISOString().split("T")[0];
            };
            setFormData({
              title: ad.title || "",
              advertiserName: ad.advertiserName || "",
              advertiserEmail: ad.advertiserEmail || "",
              advertiserPhone: ad.advertiserPhone || "",
              companyName: ad.companyName || "",
              description: ad.description || "",
              image: ad.image || "",
              targetUrl: ad.targetUrl || "",
              position: ad.position || "TOP_BANNER",
              priority: ad.priority || "Medium",
              status: ad.status || "Active",
              popupDelay: ad.popupDelay !== undefined ? ad.popupDelay : 3,
              popupAutoClose: ad.popupAutoClose !== undefined ? ad.popupAutoClose : 10,
              rotationInterval: ad.rotationInterval !== undefined ? ad.rotationInterval : 10,
              startDate: fmtDate(ad.startDate),
              startTime: ad.startTime || "00:00",
              endDate: fmtDate(ad.endDate),
              endTime: ad.endTime || "23:59"
            });
            if (ad.image) {
              const fullUrl = ad.image.startsWith("http") ? ad.image : `${API.defaults.baseURL || "http://localhost:5000"}${ad.image}`;
              setImagePreview(fullUrl);
              const img = new Image();
              img.onload = () => {
                setImageDimensions({ width: img.naturalWidth, height: img.naturalHeight });
              };
              img.src = fullUrl;
            }
          }
        } catch (err) {
          console.error("Error fetching ad data", err);
          setError("Failed to load advertisement data");
        } finally {
          setLoading(false);
        }
      };
      fetchAd();
    }
  }, [id, isEditMode]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const checkAdAspectRatio = (pos, width, height) => {
    if (!width || !height) {
      setAspectRatioWarning("");
      return;
    }

    const isHorizontal = width > height * 1.25;

    let warning = "";

    if (["TOP_BANNER", "SECTION_BANNER", "ARTICLE_ADVERTISEMENT"].includes(pos)) {
      if (!isHorizontal) {
        warning = `Warning: The selected image is vertical or square (${width}x${height}px). Horizontal banner positions (${pos}) display best with landscape images (recommended e.g., 970x250 or 728x90). The image will be letterboxed on the user site to prevent stretching.`;
      }
    } else if (["SIDEBAR", "FLOATING_ADVERTISEMENT"].includes(pos)) {
      if (isHorizontal) {
        warning = `Warning: The selected image is landscape/horizontal (${width}x${height}px). Sidebar and floating positions display best with square or vertical images (recommended e.g., 300x250).`;
      }
    }

    setAspectRatioWarning(warning);
  };

  useEffect(() => {
    if (imageDimensions.width && imageDimensions.height) {
      checkAdAspectRatio(formData.position, imageDimensions.width, imageDimensions.height);
    }
  }, [formData.position, imageDimensions]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      
      const img = new Image();
      img.onload = () => {
        const width = img.naturalWidth;
        const height = img.naturalHeight;
        setImageDimensions({ width, height });
      };
      img.src = previewUrl;
    }
  };

  const handleUploadImage = async () => {
    if (!imageFile) return formData.image;

    try {
      setUploading(true);
      const data = new FormData();
      data.append("image", imageFile);

      const res = await API.post("/api/ads/upload", data, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      if (res.data.success) {
        return res.data.url;
      }
      throw new Error(res.data.message || "Upload failed");
    } catch (err) {
      console.error("Image upload failed", err);
      alert("Image upload failed. Please try again.");
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.title || !formData.advertiserName || !formData.advertiserEmail || !formData.advertiserPhone || !formData.targetUrl || !formData.startDate || !formData.endDate) {
      setError("Please fill in all required fields marked with *");
      return;
    }

    if (!imageFile && !formData.image) {
      setError("Please upload a banner image");
      return;
    }

    try {
      setLoading(true);
      const imageUrl = await handleUploadImage();
      if (!imageUrl) {
        setLoading(false);
        return;
      }

      const submissionData = {
        ...formData,
        image: imageUrl
      };

      let res;
      if (isEditMode) {
        res = await API.put(`/api/ads/${id}`, submissionData);
      } else {
        res = await API.post("/api/ads", submissionData);
      }

      if (res.data.success) {
        alert(isEditMode ? "Advertisement updated successfully! 🎉" : "Advertisement created successfully! 🎉");
        navigate("/admin/ads/all");
      } else {
        setError(res.data.message || "Failed to save advertisement");
      }
    } catch (err) {
      console.error("Error saving ad", err);
      setError(err.response?.data?.message || "Server error while saving advertisement");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !uploading) {
    return <div style={{ padding: "40px", textAlign: "center" }}>Loading Campaign Manager...</div>;
  }

  return (
    <div className="reporter-create-news">
      <div className="header-actions">
        <div>
          <h2>{isEditMode ? "✏️ Edit Advertisement Campaign" : "📢 Create New Advertisement"}</h2>
          <div className="header-subtitle">
            Configure publication dates, image sizes, targeting URLs, priority, and layouts.
          </div>
        </div>
        <button onClick={() => navigate("/admin/ads/all")} className="btn-secondary" style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
          <FiArrowLeft /> Back to List
        </button>
      </div>

      {error && (
        <div style={{ background: "#fef2f2", borderLeft: "4px solid #ef4444", color: "#b91c1c", padding: "12px 16px", borderRadius: "6px", marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
          <FiAlertCircle />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {/* SECTION 1: CAMPAIGN INFO */}
        <div className="form-card" style={{ background: "var(--card-bg)", padding: "24px", borderRadius: "8px", border: "1px solid var(--border-color)" }}>
          <h3 style={{ borderBottom: "1px solid var(--border-color)", paddingBottom: "10px", marginBottom: "20px", color: "var(--text-main)" }}>1. Campaign Details</h3>
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            <div className="form-group">
              <label>Advertisement Campaign Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g. Diwalii Mega Sale Offer 2026"
                required
              />
            </div>

            <div className="form-group">
              <label>Company/Brand Name</label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleInputChange}
                placeholder="e.g. ABC Textiles Pvt Ltd"
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginTop: "15px" }}>
            <div className="form-group">
              <label>Target URL (Destination Link) *</label>
              <input
                type="text"
                name="targetUrl"
                value={formData.targetUrl}
                onChange={handleInputChange}
                placeholder="e.g. https://www.abctextiles.com/diwali-offers"
                required
              />
            </div>

            <div className="form-group">
              <label>Campaign Description</label>
              <input
                type="text"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="e.g. Promotional campaign for festival offers"
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: ADVERTISER INFO */}
        <div className="form-card" style={{ background: "var(--card-bg)", padding: "24px", borderRadius: "8px", border: "1px solid var(--border-color)" }}>
          <h3 style={{ borderBottom: "1px solid var(--border-color)", paddingBottom: "10px", marginBottom: "20px", color: "var(--text-main)" }}>2. Advertiser Contact Information</h3>
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "20px" }}>
            <div className="form-group">
              <label>Advertiser Name *</label>
              <input
                type="text"
                name="advertiserName"
                value={formData.advertiserName}
                onChange={handleInputChange}
                placeholder="e.g. Rajesh Kumar"
                required
              />
            </div>

            <div className="form-group">
              <label>Email Address *</label>
              <input
                type="email"
                name="advertiserEmail"
                value={formData.advertiserEmail}
                onChange={handleInputChange}
                placeholder="e.g. rajesh@abctextiles.com"
                required
              />
            </div>

            <div className="form-group">
              <label>Phone Number *</label>
              <input
                type="text"
                name="advertiserPhone"
                value={formData.advertiserPhone}
                onChange={handleInputChange}
                placeholder="e.g. 9876543210"
                required
              />
            </div>
          </div>
        </div>

        {/* SECTION 3: MEDIA & BANNER UPLOAD */}
        <div className="form-card" style={{ background: "var(--card-bg)", padding: "24px", borderRadius: "8px", border: "1px solid var(--border-color)" }}>
          <h3 style={{ borderBottom: "1px solid var(--border-color)", paddingBottom: "10px", marginBottom: "20px", color: "var(--text-main)" }}>3. Banner Image Upload</h3>
          
          <div style={{ display: "flex", gap: "30px", alignItems: "flex-start" }}>
            <div style={{ flex: "1" }}>
              <div className="form-group">
                <label>Select Banner Image *</label>
                <div style={{ border: "2px dashed var(--border-color)", borderRadius: "8px", padding: "30px", textAlign: "center", cursor: "pointer", background: "var(--bg-light)", position: "relative" }}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", opacity: 0, cursor: "pointer" }}
                  />
                  <FiUpload size={32} style={{ color: "var(--text-muted)", marginBottom: "10px" }} />
                  <p style={{ margin: "5px 0", color: "var(--text-main)", fontWeight: 600 }}>Click to upload files</p>
                  <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "12px" }}>PNG, JPG, JPEG, GIF up to 5MB</p>
                </div>
              </div>

              <div style={{ marginTop: "15px", background: "var(--bg-light)", border: "1px solid var(--border-color)", padding: "12px", borderRadius: "6px" }}>
                <h4 style={{ margin: "0 0 5px 0", color: "var(--accent-orange)", fontSize: "13px" }}>Recommended Dimensions:</h4>
                <ul style={{ margin: 0, paddingLeft: "20px", color: "var(--text-muted)", fontSize: "12px" }}>
                  <li><strong>TOP_BANNER:</strong> 970 x 250 px</li>
                  <li><strong>SIDEBAR:</strong> 300 x 250 px</li>
                  <li><strong>SECTION_BANNER:</strong> 728 x 90 px or 970 x 90 px</li>
                  <li><strong>ARTICLE_ADVERTISEMENT:</strong> 728 x 90 px or 300 x 250 px</li>
                  <li><strong>POPUP_ADVERTISEMENT:</strong> 600 x 500 px or 500 x 500 px</li>
                  <li><strong>FLOATING_ADVERTISEMENT:</strong> 300 x 250 px</li>
                </ul>
              </div>

              {aspectRatioWarning && (
                <div style={{ marginTop: "15px", background: "#fffbeb", borderLeft: "4px solid #f59e0b", color: "#b45309", padding: "12px 16px", borderRadius: "6px", fontSize: "13px", display: "flex", alignItems: "flex-start", gap: "10px", textAlign: "left" }}>
                  <FiAlertCircle style={{ flexShrink: 0, marginTop: "2px", color: "#d97706" }} />
                  <span>{aspectRatioWarning}</span>
                </div>
              )}
            </div>

            <div style={{ width: "320px", display: "flex", flexDirection: "column", gap: "10px" }}>
              <label style={{ display: "block", color: "var(--text-muted)", fontWeight: 600, fontSize: "13px" }}>Image Preview</label>
              {imagePreview ? (
                <div style={{ width: "100%", height: "200px", border: "1px solid var(--border-color)", borderRadius: "8px", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-light)" }}>
                  <img src={imagePreview} alt="Banner Preview" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
                </div>
              ) : (
                <div style={{ width: "100%", height: "200px", border: "1px dashed var(--border-color)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", background: "var(--bg-light)" }}>
                  No Image Selected
                </div>
              )}
            </div>
          </div>
        </div>

        {/* SECTION 4: PLACEMENT & SCHEDULING */}
        <div className="form-card" style={{ background: "var(--card-bg)", padding: "24px", borderRadius: "8px", border: "1px solid var(--border-color)" }}>
          <h3 style={{ borderBottom: "1px solid var(--border-color)", paddingBottom: "10px", marginBottom: "20px", color: "var(--text-main)" }}>4. Placement & Settings</h3>
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "20px" }}>
            <div className="form-group">
              <label>Ad Position / Location *</label>
              <select name="position" value={formData.position} onChange={handleInputChange}>
                <option value="TOP_BANNER">TOP_BANNER (Below Navbar)</option>
                <option value="SIDEBAR">SIDEBAR (Right Sidebar)</option>
                <option value="SECTION_BANNER">SECTION_BANNER (In-Between News Sections)</option>
                <option value="ARTICLE_ADVERTISEMENT">ARTICLE_ADVERTISEMENT (In-Article)</option>
                <option value="POPUP_ADVERTISEMENT">POPUP_ADVERTISEMENT (Center Screen Popup)</option>
                <option value="FLOATING_ADVERTISEMENT">FLOATING_ADVERTISEMENT (Bottom Right Float)</option>
              </select>
            </div>

            <div className="form-group">
              <label>Ad Priority *</label>
              <select name="priority" value={formData.priority} onChange={handleInputChange}>
                <option value="High">High (More Display Frequency)</option>
                <option value="Medium">Medium (Regular Frequency)</option>
                <option value="Low">Low (Less Display Frequency)</option>
              </select>
            </div>

            <div className="form-group">
              <label>Status *</label>
              <select name="status" value={formData.status} onChange={handleInputChange}>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Scheduled">Scheduled</option>
              </select>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "15px", marginTop: "15px" }}>
            <div className="form-group">
              <label>Start Date *</label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Start Time *</label>
              <input
                type="time"
                name="startTime"
                value={formData.startTime}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label>End Date *</label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label>End Time *</label>
              <input
                type="time"
                name="endTime"
                value={formData.endTime}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          {/* Conditional Fields based on Positions */}
          {formData.position === "POPUP_ADVERTISEMENT" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginTop: "20px", padding: "15px", background: "var(--bg-light)", borderRadius: "6px", border: "1px solid var(--border-color)", borderLeft: "4px solid #3b82f6" }}>
              <div className="form-group">
                <label>Popup Display Delay (seconds)</label>
                <input
                  type="number"
                  name="popupDelay"
                  value={formData.popupDelay}
                  onChange={handleInputChange}
                  min="0"
                />
              </div>
              <div className="form-group">
                <label>Popup Auto Close Duration (seconds)</label>
                <input
                  type="number"
                  name="popupAutoClose"
                  value={formData.popupAutoClose}
                  onChange={handleInputChange}
                  min="1"
                />
              </div>
            </div>
          )}

          {["TOP_BANNER", "SIDEBAR", "SECTION_BANNER", "ARTICLE_ADVERTISEMENT", "FLOATING_ADVERTISEMENT"].includes(formData.position) && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "20px", marginTop: "20px", padding: "15px", background: "var(--bg-light)", borderRadius: "6px", border: "1px solid var(--border-color)", borderLeft: "4px solid #10b981" }}>
              <div className="form-group">
                <label>Rotation Duration Interval (Seconds, when multiple ads exist) *</label>
                <select name="rotationInterval" value={formData.rotationInterval} onChange={handleInputChange}>
                  <option value={10}>10 Seconds</option>
                  <option value={15}>15 Seconds</option>
                  <option value={20}>20 Seconds</option>
                  <option value={30}>30 Seconds</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* SUBMIT BUTTON */}
        <div style={{ display: "flex", gap: "15px", justifyContent: "flex-end", marginTop: "10px" }}>
          <button type="button" onClick={() => navigate("/admin/ads/all")} className="btn-secondary" style={{ padding: "12px 24px" }}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={loading} style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "12px 24px" }}>
            <FiSave /> {isEditMode ? "Save Changes" : "Publish Advertisement"}
          </button>
        </div>

      </form>
    </div>
  );
}

export default AddAd;

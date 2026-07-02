import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../config/api";
import "../styles/EditorReviewNews.css"; // Reuse modal styling

function AdminReviewNews() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Modals
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [publishComment, setPublishComment] = useState("");
  const [sendNotification, setSendNotification] = useState(false);

  const fetchArticleDetails = useCallback(async () => {
    try {
      setLoading(true);
      const res = await API.get(`/api/news/${id}`);
      if (res.data) {
        // Map backend properties to frontend
        const art = res.data;
        setArticle({
          id: art._id,
          title: art.title,
          subtitle: art.subtitle,
          category: art.category,
          location: art.location,
          shortDescription: art.shortDescription,
          fullDescription: art.description,
          tags: art.tags,
          seoKeywords: art.seoKeywords,
          reporter: art.reporterId ? (art.reporterId.name || "Reporter") : "Reporter",
          editor: art.editorId ? (art.editorId.name || "Editor") : "Editor",
          status: art.status === "pending_admin_verification" ? "Pending Admin Verification" :
                  art.status === "published" ? "Published" :
                  art.status === "rejected" ? "Rejected" :
                  art.status === "admin_rejected" ? "Returned to Editor" :
                  art.status === "pending_editor_review" ? "Pending Review" : "Draft",
          date: new Date(art.date || art.createdAt).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric"
          }),
          coverImage: art.coverImage || art.image,
          galleryImages: art.galleryImages || []
        });
      }
    } catch (error) {
      console.error("Error loading article details:", error);
      alert("Failed to load article details");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchArticleDetails();
  }, [fetchArticleDetails]);

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      alert("Please provide a reason for rejecting this article.");
      return;
    }
    try {
      await API.put(`/api/news/admin/reject/${id}`, {
        rejectionReason: rejectReason.trim()
      });
      setShowRejectModal(false);
      alert("Article rejected and returned to editor");
      navigate("/admin/pending");
    } catch (error) {
      console.error("Error rejecting article:", error);
      alert(error.response?.data?.message || "Failed to reject article");
    }
  };

  const handlePublish = async () => {
    try {
      await API.put(`/api/news/admin/publish/${id}`, {
        comment: publishComment,
        sendNotification: sendNotification,
        sendBrowserNotification: sendNotification
      });
      setShowVerifyModal(false);
      alert("Article published live! 🎉");
      navigate("/admin/published");
    } catch (error) {
      console.error("Error publishing article:", error);
      alert(error.response?.data?.message || "Failed to publish article");
    }
  };

  if (loading) return <div style={{padding: '50px', color: 'var(--text-muted)'}}>Loading article preview...</div>;
  if (!article) return <div style={{padding: '50px', color: 'var(--text-muted)'}}>Article not found.</div>;

  return (
    <div className="reporter-create-news">
      <div className="header-actions" style={{marginBottom: '30px'}}>
        <div>
          <h2>Final Verification: Preview</h2>
          <span className={`status-badge ${article.status === 'Published' ? 'badge-published' : 'badge-approved'}`}>
            Status: {article.status === 'Pending Admin Verification' ? 'Pending Approval' : article.status}
          </span>
        </div>
        {article.status === "Pending Admin Verification" && (
          <div className="action-buttons">
            <button className="btn-secondary" onClick={() => navigate("/admin/pending")}>Back to List</button>
            <button className="btn-danger" onClick={() => setShowRejectModal(true)} style={{background: '#ef4444', color: '#ffffff', border:'none', padding:'10px 20px', borderRadius:'6px', fontWeight: 600, cursor:'pointer'}}>Reject</button>
            <button className="btn-primary" onClick={() => setShowVerifyModal(true)} style={{background: '#3b82f6'}}>Verify & Publish</button>
          </div>
        )}
      </div>

      <div className="preview-container" style={{background: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)'}}>
        
        {/* Cover Image Display */}
        {article.coverImage ? (
          <div style={{ width: '100%', maxHeight: '450px', overflow: 'hidden', borderRadius: '8px', marginBottom: '25px', display: 'flex', justifyContent: 'center', background: '#f1f5f9' }}>
            <img src={article.coverImage} alt={article.title} style={{ width: '100%', height: 'auto', maxHeight: '450px', objectFit: 'contain' }} />
          </div>
        ) : (
          <div style={{width: '100%', height: '200px', background: '#e2e8f0', borderRadius: '8px', marginBottom: '25px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b'}}>
            No Cover Image Uploaded
          </div>
        )}

        <div style={{display: 'flex', gap: '10px', marginBottom: '20px'}}>
          <span className="category-tag">{article.category}</span>
          <span className="status-badge" style={{background: '#f1f5f9', color: '#475569'}}>{article.date}</span>
        </div>

        <h1 style={{fontSize: '32px', color: '#0f172a', marginBottom: '10px'}}>{article.title}</h1>
        <h3 style={{fontSize: '20px', color: '#475569', fontWeight: 400, marginBottom: '20px'}}>{article.subtitle || "No subtitle provided."}</h3>

        <div style={{display: 'flex', gap: '20px', padding: '15px', background: '#f8fafc', borderRadius: '8px', marginBottom: '30px', border: '1px solid #e2e8f0', flexWrap: 'wrap'}}>
          <div><strong>Reporter:</strong> <span style={{color: '#3b82f6'}}>{article.reporter}</span></div>
          <div><strong>Editor:</strong> <span style={{color: '#10b981'}}>{article.editor}</span></div>
          <div><strong>Location:</strong> {article.location || "N/A"}</div>
        </div>

        <div 
          style={{fontSize: '16px', lineHeight: '1.8', color: 'var(--text-main)', marginBottom: '40px'}} 
          dangerouslySetInnerHTML={{ __html: article.fullDescription }}
        >
        </div>

        {/* Gallery Images */}
        {article.galleryImages && article.galleryImages.length > 0 && (
          <div style={{ marginBottom: '40px' }}>
            <h4 style={{ fontSize: '18px', color: '#0f172a', marginBottom: '15px' }}>Gallery Images</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '15px' }}>
              {article.galleryImages.map((src, idx) => (
                <div key={idx} style={{ height: '110px', borderRadius: '6px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                  <img src={src} alt={`Gallery ${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{display: 'flex', gap: '20px', borderTop: '1px solid #e2e8f0', paddingTop: '20px', flexWrap: 'wrap'}}>
          <div><strong>Tags:</strong> {article.tags || "None"}</div>
          <div><strong>SEO Keywords:</strong> {article.seoKeywords || "None"}</div>
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 style={{color: '#ef4444'}}>Reject Article</h3>
            <p>Please provide a reason for rejecting this article. It will be returned to the Editor.</p>
            <textarea 
              rows="4" 
              style={{width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc', marginTop: '10px'}}
              placeholder="e.g., The fact check failed on the third paragraph..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            ></textarea>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowRejectModal(false)}>Cancel</button>
              <button className="btn-danger" onClick={handleReject} style={{background: '#ef4444', color: '#ffffff', border:'none', padding:'10px 20px', borderRadius:'6px', fontWeight: 600, cursor:'pointer'}}>Reject & Return to Editor</button>
            </div>
          </div>
        </div>
      )}

      {/* Verify Modal */}
      {showVerifyModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{maxWidth: '500px', textAlign: 'left'}}>
            <h3 style={{color: '#3b82f6', textAlign: 'center'}}>Final Verification</h3>
            <p style={{textAlign: 'center', marginBottom: '20px'}}>Are you sure you want to publish this article live?</p>

            <div style={{marginTop: '20px'}}>
              <label style={{fontWeight: 600, fontSize: '14px', color: 'var(--text-main)'}}>Comment (Optional)</label>
              <textarea 
                rows="2" 
                style={{width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc', marginTop: '5px'}}
                placeholder="Publishing notes..."
                value={publishComment}
                onChange={(e) => setPublishComment(e.target.value)}
              ></textarea>
            </div>

            <div style={{marginTop: '20px'}}>
              <label style={{fontWeight: 600, fontSize: '14px', color: 'var(--text-main)'}}>Notification Settings</label>
              <div style={{marginTop: '8px'}}>
                <label style={{display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', color: 'var(--text-main)'}}>
                  <input 
                    type="checkbox" 
                    checked={sendNotification} 
                    onChange={(e) => setSendNotification(e.target.checked)} 
                    style={{width: '18px', height: '18px', cursor: 'pointer'}}
                  />
                  Send Browser Push Notification
                </label>
              </div>
            </div>

            <div className="modal-actions" style={{justifyContent: 'center', marginTop: '30px'}}>
              <button className="btn-secondary" onClick={() => setShowVerifyModal(false)}>Cancel</button>
              <button className="btn-primary" onClick={handlePublish} style={{background: '#3b82f6', cursor: 'pointer'}}>
                Publish Article
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminReviewNews;

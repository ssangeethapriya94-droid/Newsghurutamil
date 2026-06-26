import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../config/api";
import useSEO from "../hooks/useSEO";
import AdZone from "../components/AdZone";

function TempleBlogDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth >= 1024);

  useEffect(() => {
    const handleResize = () => setIsLargeScreen(window.innerWidth >= 1024);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchBlogDetails = async () => {
      try {
        setLoading(true);
        const res = await API.get(`/api/anmigam/temple-blogs/${id}`);
        setBlog(res.data);
      } catch (err) {
        console.error("Error loading blog details:", err);
      } finally {
        setLoading(false);
      }
    };
    if (id) {
      fetchBlogDetails();
    }
  }, [id]);

  useSEO({
    title: blog ? `${blog.title} - கோவில் பதிவுகள் | நியூஸ் குரு` : "கோவில் பதிவுகள் | நியூஸ் குரு",
    description: blog ? blog.description : "கோவில் ஆன்மீகத் தல வரலாறு மற்றும் சிறப்புத் தகவல்கள்.",
    keywords: "கோவில் வரலாறு, ஆன்மீகம், கோவில் பதிவுகள், தமிழ் கோவில்கள், Temple History Tamil",
  });

  const renderBlogContent = (htmlContent) => {
    if (!htmlContent) return "";
    
    const cleanedContent = htmlContent.replace(/&nbsp;/g, " ").replace(/\u00a0/g, " ");
    // Split into paragraphs by </p>
    const paras = cleanedContent.split("</p>");
    return (
      <div className="editorial-body">
        {paras.map((para, index) => {
          if (!para.trim()) return null;
          let paraHtml = para + "</p>";

          return (
            <React.Fragment key={index}>
              <div 
                dangerouslySetInnerHTML={{ __html: paraHtml }} 
                style={{ 
                  marginBottom: "16px",
                  fontSize: "1.1rem", 
                  lineHeight: "1.8", 
                  color: "var(--text-primary)",
                  textAlign: "left",
                  wordBreak: "normal",
                  overflowWrap: "break-word"
                }} 
              />
              {index === 1 && <AdZone position="ARTICLE_ADVERTISEMENT" />}
              {index === 3 && <AdZone position="ARTICLE_ADVERTISEMENT" />}
            </React.Fragment>
          );
        })}
      </div>
    );
  };

  const renderPremiumWidget = () => {
    const token = localStorage.getItem("readerToken");
    let readerData = null;
    try {
      const dataStr = localStorage.getItem("readerData");
      if (dataStr) readerData = JSON.parse(dataStr);
    } catch (e) {}

    if (token && readerData?.isPremium) return null;

    return (
      <div 
        className="premium-widget go-premium-promo-widget" 
        style={{ 
          padding: "24px 20px", 
          borderRadius: "10px", 
          background: "linear-gradient(135deg, #ea580c 0%, #ca8a04 100%)", 
          color: "#ffffff",
          border: "none",
          boxShadow: "0 10px 15px -3px rgba(234, 88, 12, 0.25)",
          cursor: "pointer",
          textAlign: "center",
          transition: "transform 0.2s ease"
        }} 
        onClick={() => navigate("/subscribe")}
        onMouseOver={(e) => e.currentTarget.style.transform = "scale(1.02)"}
        onMouseOut={(e) => e.currentTarget.style.transform = "scale(1)"}
      >
        <h3 style={{ margin: "0 0 10px 0", fontSize: "1.25rem", fontWeight: "850", fontFamily: "var(--font-serif)", letterSpacing: "0.5px" }}>நியூஸ்குரு பிரீமியம் 👑</h3>
        <p style={{ margin: "0 0 18px 0", fontSize: "0.82rem", opacity: "0.9", lineHeight: "1.4" }}>முழுமையான விளம்பரங்கள் இல்லாத தடையற்ற செய்தி வாசிப்பு அனுபவத்தை இப்போதே பெற சந்தா சேருங்கள்!</p>
        <button style={{ 
          background: "#ffffff", 
          color: "#ea580c", 
          border: "none", 
          padding: "8px 18px", 
          borderRadius: "25px", 
          fontWeight: "800", 
          fontSize: "0.8rem",
          cursor: "pointer",
          boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
        }}>இப்போது இணைவோம் &rarr;</button>
      </div>
    );
  };

  if (loading) {
    return (
      <div style={{ padding: "80px 0", textAlign: "center", color: "var(--text-muted)" }}>
        <h3>தகவல்கள் ஏற்றப்படுகின்றன...</h3>
      </div>
    );
  }

  if (!blog) {
    return (
      <div style={{ padding: "80px 20px", textAlign: "center", maxWidth: "600px", margin: "0 auto" }}>
        <h2 style={{ color: "var(--text-secondary)", marginBottom: "15px" }}>பதிவு கிடைக்கவில்லை 😔</h2>
        <button 
          onClick={() => navigate("/anmigam/temple-blogs")}
          style={{ background: "var(--brand-gradient)", color: "white", padding: "10px 24px", border: "none", borderRadius: "20px", cursor: "pointer", fontWeight: "600" }}
        >
          கோவில் பதிவுகளுக்குச் செல்லவும்
        </button>
      </div>
    );
  }

  return (
    <div className="news-details-page" style={{ maxWidth: "1200px", margin: "20px auto", padding: "0 15px 40px 15px", minHeight: "80vh" }}>
      
      {/* Back Button */}
      <button 
        onClick={() => navigate("/anmigam/temple-blogs")}
        style={{ background: "none", border: "none", color: "var(--accent-orange)", cursor: "pointer", fontWeight: "700", display: "flex", alignItems: "center", gap: "5px", marginBottom: "20px", fontSize: "0.95rem", padding: 0 }}
      >
        &larr; கோவில் பதிவுகள்
      </button>

      {/* Header Info */}
      <header className="article-editorial-header" style={{ marginBottom: "25px" }}>
        {blog.templeName && (
          <button className="card-cat-badge" style={{ position: "static", marginBottom: "12px", background: "linear-gradient(90deg, #ea580c, #ef4444)", color: "#fff", border: "none", padding: "6px 16px", borderRadius: "20px", fontSize: "0.8rem", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            📍 {blog.templeName} ({blog.location || "ஆன்மீகத் தலம்"})
          </button>
        )}
        <h1 className="article-headline" style={{ fontFamily: "var(--font-serif)", fontSize: "2.4rem", color: "var(--text-primary)", marginTop: "10px", marginBottom: "12px", lineHeight: "1.3", fontWeight: "800" }}>
          {blog.title}
        </h1>
        {blog.subtitle && (
          <p className="article-subheadline" style={{ fontSize: "1.2rem", fontWeight: "500", color: "var(--text-muted)", marginBottom: "15px", lineHeight: "1.4" }}>
            {blog.subtitle}
          </p>
        )}
        <div style={{ display: "flex", gap: "15px", fontSize: "0.85rem", color: "var(--text-muted)", borderBottom: "1px solid var(--border-color)", paddingBottom: "15px" }}>
          <span>எழுதியவர்: <strong>{blog.createdBy?.name || "நியூஸ் குரு"}</strong></span>
          <span>•</span>
          <span>வெளியிடப்பட்டது: <strong>{new Date(blog.publishedAt || blog.createdAt).toLocaleDateString("ta-IN")}</strong></span>
        </div>
      </header>

      {/* Main Layout Grid */}
      <div style={isLargeScreen ? { display: "grid", gridTemplateColumns: "minmax(0, 1fr) 300px", gap: "30px", alignItems: "start" } : { display: "flex", flexDirection: "column", gap: "30px" }}>
        
        {/* Left Column: Details Content */}
        <div className="details-content" style={{ padding: 0 }}>
          {/* Cover Image */}
          {blog.image && (
            <div className="details-image-wrapper" style={{ borderRadius: "16px", overflow: "hidden", marginBottom: "25px", boxShadow: "0 10px 30px rgba(0,0,0,0.08)" }}>
              <img 
                src={blog.image} 
                alt={blog.title} 
                className="details-image"
                style={{ width: "100%", maxHeight: "500px", objectFit: "cover" }} 
              />
            </div>
          )}

          {/* Paragraph Content */}
          <div className="details-section">
            <style>{`
              .details-section, .editorial-body {
                text-align: left !important;
              }
              .details-section *, .editorial-body * {
                max-width: 100% !important;
                box-sizing: border-box !important;
                word-break: normal !important;
                overflow-wrap: break-word !important;
                hyphens: none !important;
              }
              .details-section p, .editorial-body p {
                text-align: left !important;
                margin-bottom: 1.5rem;
              }
              .details-section img, .editorial-body img {
                height: auto !important;
                border-radius: 8px;
                margin: 15px 0;
              }
            `}</style>
            {renderBlogContent(blog.content)}
          </div>
        </div>

        {/* Right Column: Sticky Sidebar Ads */}
        <div style={isLargeScreen ? { position: "sticky", top: "20px", display: "flex", flexDirection: "column", gap: "20px" } : { display: "flex", flexDirection: "column", gap: "20px" }}>
          <AdZone position="SIDEBAR" />
          {renderPremiumWidget()}
          <AdZone position="SIDEBAR" />
        </div>

      </div>

      <AdZone position="FLOATING_ADVERTISEMENT" />
    </div>
  );
}

export default TempleBlogDetailsPage;

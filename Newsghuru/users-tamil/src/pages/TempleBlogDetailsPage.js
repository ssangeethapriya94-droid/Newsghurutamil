import React, { useState, useEffect } from "react";
import { useParams, useNavigate, NavLink } from "react-router-dom";
import API from "../config/api";
import useSEO from "../hooks/useSEO";

function TempleBlogDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(false);

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
    <div style={{ padding: "30px var(--padding-x)", maxWidth: "800px", margin: "0 auto", minHeight: "80vh" }}>
      


      {/* Back Button */}
      <button 
        onClick={() => navigate("/anmigam/temple-blogs")}
        style={{ background: "none", border: "none", color: "var(--accent-orange)", cursor: "pointer", fontWeight: "700", display: "flex", alignItems: "center", gap: "5px", marginBottom: "20px", fontSize: "0.95rem", padding: 0 }}
      >
        &larr; கோவில் பதிவுகள்
      </button>

      {/* Header Info */}
      <div style={{ marginBottom: "25px" }}>
        {blog.templeName && (
          <span style={{ fontSize: "0.85rem", color: "var(--accent-orange)", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            📍 {blog.templeName} ({blog.location || "ஆன்மீகத் தலம்"})
          </span>
        )}
        <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "2.5rem", color: "var(--text-primary)", marginTop: "10px", marginBottom: "12px", lineHeight: "1.3" }}>
          {blog.title}
        </h1>
        {blog.subtitle && (
          <h2 style={{ fontSize: "1.25rem", fontWeight: "500", color: "var(--text-muted)", marginBottom: "15px", lineHeight: "1.4" }}>
            {blog.subtitle}
          </h2>
        )}
        <div style={{ display: "flex", gap: "15px", fontSize: "0.85rem", color: "var(--text-muted)", borderBottom: "1px solid var(--border-color)", paddingBottom: "15px" }}>
          <span>எழுதியவர்: <strong>{blog.createdBy?.name || "நியூஸ் குரு"}</strong></span>
          <span>•</span>
          <span>வெளியிடப்பட்டது: <strong>{new Date(blog.publishedAt || blog.createdAt).toLocaleDateString("ta-IN")}</strong></span>
        </div>
      </div>

      {/* Large Cover Image */}
      {blog.image && (
        <div style={{ width: "100%", height: "450px", borderRadius: "16px", overflow: "hidden", marginBottom: "30px", boxShadow: "0 10px 30px rgba(0,0,0,0.08)" }}>
          <img src={blog.image} alt={blog.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
      )}

      {/* Rich Text Content */}
      <div 
        className="blog-content-body-html"
        style={{ 
          fontSize: "1.15rem", 
          lineHeight: "1.9", 
          color: "var(--text-primary)",
          textAlign: "justify"
        }}
        dangerouslySetInnerHTML={{ __html: blog.content }}
      />

    </div>
  );
}

export default TempleBlogDetailsPage;

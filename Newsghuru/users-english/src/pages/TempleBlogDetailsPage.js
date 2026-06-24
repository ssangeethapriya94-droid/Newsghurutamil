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
    title: blog ? `${blog.title} - Temple Blogs | NewsGhuru` : "Temple Blogs | NewsGhuru",
    description: blog ? blog.description : "Historical insights and architectural analysis of famous temple architectures.",
    keywords: "temple history, spiritual sites, temple architecture, NewsGhuru spiritual",
  });

  if (loading) {
    return (
      <div style={{ padding: "80px 0", textAlign: "center", color: "var(--text-muted)" }}>
        <h3>Loading details...</h3>
      </div>
    );
  }

  if (!blog) {
    return (
      <div style={{ padding: "80px 20px", textAlign: "center", maxWidth: "600px", margin: "0 auto" }}>
        <h2 style={{ color: "var(--text-secondary)", marginBottom: "15px" }}>Blog Post Not Found 😔</h2>
        <button 
          onClick={() => navigate("/anmigam/temple-blogs")}
          style={{ background: "var(--brand-gradient)", color: "white", padding: "10px 24px", border: "none", borderRadius: "20px", cursor: "pointer", fontWeight: "600" }}
        >
          Back to Temple Blogs
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: "30px var(--padding-x)", maxWidth: "800px", margin: "0 auto", minHeight: "80vh" }}>
      
      {/* Subcategory Navigation Menu */}
      <div style={{
        display: "flex",
        justifyContent: "center",
        gap: "15px",
        marginBottom: "35px",
        borderBottom: "1px solid var(--border-color)",
        paddingBottom: "12px"
      }}>
        <NavLink 
          to="/anmigam/rasi-palan" 
          style={({ isActive }) => ({
            textDecoration: "none",
            color: isActive ? "var(--accent-orange)" : "var(--text-secondary)",
            fontWeight: "700",
            fontSize: "1.05rem",
            padding: "6px 18px",
            borderRadius: "20px",
            background: isActive ? "rgba(245, 158, 11, 0.12)" : "transparent",
            transition: "all 0.3s ease"
          })}
        >
          Horoscope
        </NavLink>
        <NavLink 
          to="/anmigam/temple-blogs" 
          style={({ isActive }) => ({
            textDecoration: "none",
            color: isActive ? "var(--accent-orange)" : "var(--text-secondary)",
            fontWeight: "700",
            fontSize: "1.05rem",
            padding: "6px 18px",
            borderRadius: "20px",
            background: isActive ? "rgba(245, 158, 11, 0.12)" : "transparent",
            transition: "all 0.3s ease"
          })}
        >
          Temple Blogs
        </NavLink>
      </div>

      {/* Back Button */}
      <button 
        onClick={() => navigate("/anmigam/temple-blogs")}
        style={{ background: "none", border: "none", color: "var(--accent-orange)", cursor: "pointer", fontWeight: "700", display: "flex", alignItems: "center", gap: "5px", marginBottom: "20px", fontSize: "0.95rem", padding: 0 }}
      >
        &larr; Back to Temple Blogs
      </button>

      {/* Header Info */}
      <div style={{ marginBottom: "25px" }}>
        {blog.templeName && (
          <span style={{ fontSize: "0.85rem", color: "var(--accent-orange)", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            📍 {blog.templeName} ({blog.location || "Spiritual Site"})
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
          <span>Written by: <strong>{blog.createdBy?.name || "NewsGhuru"}</strong></span>
          <span>•</span>
          <span>Published on: <strong>{new Date(blog.publishedAt || blog.createdAt).toLocaleDateString("en-US")}</strong></span>
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

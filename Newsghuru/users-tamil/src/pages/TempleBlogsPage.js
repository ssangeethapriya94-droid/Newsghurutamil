import React, { useState, useEffect } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import API from "../config/api";
import useSEO from "../hooks/useSEO";

function TempleBlogsPage() {
  useSEO({
    title: "கோவில் பதிவுகள் | ஆன்மீகத் தலம் மற்றும் கோவில்கள் வரலாறு - நியூஸ் குரு",
    description: "தமிழக மற்றும் உலகப் பிரசித்தி பெற்ற கோவில்களின் வரலாறு, சிறப்புகள் மற்றும் சிறப்பம்சங்களை அறிந்து கொள்ளுங்கள்.",
    keywords: "கோவில் வரலாறு, ஆன்மீகம், கோவில் பதிவுகள், தமிழ் கோவில்கள், Temple Blogs Tamil",
  });

  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        const res = await API.get("/api/anmigam/temple-blogs?language=ta");
        setBlogs(res.data || []);
      } catch (err) {
        console.error("Error loading temple blogs:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  return (
    <div style={{ padding: "30px var(--padding-x)", maxWidth: "1200px", margin: "0 auto", minHeight: "80vh" }}>
      
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
          ராசி பலன் (Horoscope)
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
          கோவில் பதிவுகள் (Temple Blogs)
        </NavLink>
      </div>

      {/* Title Header */}
      <div style={{ textAlign: "center", marginBottom: "40px" }}>
        <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "2.4rem", color: "var(--text-primary)", marginBottom: "8px" }}>
          கோவில் பதிவுகள்
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "1.05rem" }}>
          புகழ்பெற்ற ஆன்மீகத் தலங்களின் வரலாற்றுச் சிறப்புகள் மற்றும் வழிபாட்டு விவரங்கள்.
        </p>
      </div>

      {loading ? (
        <div style={{ padding: "60px 0", textAlign: "center", color: "var(--text-muted)" }}>
          <h3>பதிவுகள் ஏற்றப்படுகின்றன...</h3>
        </div>
      ) : blogs.length === 0 ? (
        <div className="glass-panel" style={{ padding: "60px 20px", textAlign: "center", borderRadius: "16px", border: "1px solid var(--border-color)", background: "var(--bg-secondary)" }}>
          <h3 style={{ color: "var(--text-secondary)", marginBottom: "10px" }}>பதிவுகள் ஏதும் இல்லை 😔</h3>
          <p style={{ color: "var(--text-muted)" }}>விரைவில் புதிய கோவில் வரலாற்றுப் பதிவுகள் சேர்க்கப்படும்.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "25px" }}>
          {blogs.map((blog) => (
            <div 
              key={blog._id}
              onClick={() => navigate(`/anmigam/temple-blogs/${blog._id}`)}
              style={{ 
                background: "var(--bg-secondary)", 
                border: "1px solid var(--border-color)", 
                borderRadius: "16px", 
                overflow: "hidden",
                cursor: "pointer",
                transition: "all 0.3s ease",
                boxShadow: "0 4px 20px rgba(0,0,0,0.05)"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-5px)";
                e.currentTarget.style.boxShadow = "0 8px 30px rgba(0,0,0,0.12)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "none";
                e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.05)";
              }}
            >
              {/* Blog Image */}
              <div style={{ height: "200px", width: "100%", overflow: "hidden", position: "relative", backgroundColor: "#1e293b" }}>
                <img 
                  src={blog.image || "/NEWS GHURU LOGO PNG.png"} 
                  alt={blog.title} 
                  style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.5s ease" }}
                  onMouseEnter={(e) => e.target.style.transform = "scale(1.08)"}
                  onMouseLeave={(e) => e.target.style.transform = "scale(1)"}
                />
                <div style={{ position: "absolute", bottom: "10px", left: "10px", backgroundColor: "rgba(0,0,0,0.7)", color: "white", padding: "4px 10px", borderRadius: "20px", fontSize: "0.75rem", fontWeight: "600", backdropFilter: "blur(4px)" }}>
                  📍 {blog.location || "ஆன்மீகத் தலம்"}
                </div>
              </div>

              {/* Blog Info */}
              <div style={{ padding: "20px" }}>
                {blog.templeName && (
                  <span style={{ fontSize: "0.8rem", color: "var(--accent-orange)", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    {blog.templeName}
                  </span>
                )}
                <h3 style={{ fontSize: "1.3rem", fontWeight: "700", color: "var(--text-primary)", marginTop: "6px", marginBottom: "10px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", height: "48px", lineHeight: "1.4" }}>
                  {blog.title}
                </h3>
                <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", lineHeight: "1.6", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden", height: "64px", marginBottom: "15px" }}>
                  {blog.description || "கோவிலின் வரலாறு மற்றும் வழிபாடு பற்றிய முழுமையான தகவல்கள்."}
                </p>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                    📅 {new Date(blog.publishedAt || blog.createdAt).toLocaleDateString("ta-IN")}
                  </span>
                  <span style={{ color: "var(--accent-orange)", fontWeight: "700", fontSize: "0.88rem" }}>
                    படிக்க &rarr;
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}

export default TempleBlogsPage;

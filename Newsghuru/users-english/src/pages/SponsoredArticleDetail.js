import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import API from "../config/api";
import { FiPlay } from "react-icons/fi";
import { 
  FaGlobe, FaPhone, FaEnvelope, FaFacebookF, FaTwitter, 
  FaLinkedinIn, FaWhatsapp, FaInstagram, FaYoutube 
} from "react-icons/fa";
import useSEO from "../hooks/useSEO";
import "../styles/InfoPages.css";

const SponsoredArticleDetail = () => {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth > 992);

  useEffect(() => {
    const handleResize = () => setIsLargeScreen(window.innerWidth > 992);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    API.get(`/api/sponsored/article/${id}`)
      .then((res) => {
        if (res.data.success) {
          setArticle(res.data.article);
        }
      })
      .catch((err) => {
        console.error(err);
        setError("Sponsored article not found or has expired.");
      })
      .finally(() => setLoading(false));
  }, [id]);

  useSEO({
    title: article ? `${article.title} | Newsghuru Sponsored` : "Sponsored Article | Newsghuru",
    description: article?.shortDescription || "Read sponsored content on Newsghuru.",
    keywords: "sponsored content, Newsghuru sponsorship, news feature",
  });

  if (loading) return <div style={{ padding: "60px", textAlign: "center" }}>Loading Sponsored Article...</div>;
  if (error || !article) return <div style={{ padding: "60px", textAlign: "center", color: "#ef4444" }}>{error || "Article not found"}</div>;

  const shareUrl = window.location.href;
  const shareText = encodeURIComponent(article.title);

  return (
    <article style={{ maxWidth: "1200px", margin: "0 auto", padding: "30px 20px", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      
      {/* BREADCRUMB */}
      <div style={{ fontSize: "0.85rem", color: "#64748b", marginBottom: "16px", display: "flex", gap: "6px", alignItems: "center" }}>
        <Link to="/" style={{ color: "inherit", textDecoration: "none" }}>Home</Link>
        <span>&gt;</span>
        <span style={{ color: "inherit" }}>{article.category || "Sponsored"}</span>
        <span>&gt;</span>
        <span style={{ color: "#0f172a", fontWeight: "600" }}>Sponsored Article</span>
      </div>

      {/* SPONSORED BADGE */}
      <div style={{ marginBottom: "16px" }}>
        <span style={{ background: "#ef4444", color: "#fff", padding: "6px 14px", borderRadius: "4px", fontWeight: "800", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "1px", display: "inline-block" }}>
          SPONSORED
        </span>
      </div>

      {/* TITLE */}
      <h1 style={{ fontSize: isLargeScreen ? "2.6rem" : "1.8rem", fontWeight: "800", color: "#0f172a", margin: "0 0 16px 0", lineHeight: "1.25", fontFamily: "inherit" }}>
        {article.title}
      </h1>

      {/* META BAR */}
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center", 
        borderBottom: "1.5px solid #e2e8f0", 
        paddingBottom: "16px", 
        marginBottom: "30px", 
        flexWrap: "wrap",
        gap: "16px"
      }}>
        <div style={{ fontSize: "0.9rem", color: "#64748b" }}>
          By <strong style={{ color: "#0f172a" }}>{article.reporterId?.name || "NewsGhuru Team"}</strong> &nbsp;•&nbsp; {new Date(article.publishedAt || article.createdAt).toLocaleDateString("en-US", { day: 'numeric', month: 'long', year: 'numeric' })}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "0.85rem", fontWeight: "700", color: "#64748b" }}>Share</span>
          <a href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`} target="_blank" rel="noreferrer" style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#3b5998", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none", fontSize: "0.85rem" }}>
            <FaFacebookF />
          </a>
          <a href={`https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareText}`} target="_blank" rel="noreferrer" style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#1da1f2", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none", fontSize: "0.85rem" }}>
            <FaTwitter />
          </a>
          <a href={`https://www.linkedin.com/shareArticle?mini=true&url=${shareUrl}&title=${shareText}`} target="_blank" rel="noreferrer" style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#0077b5", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none", fontSize: "0.85rem" }}>
            <FaLinkedinIn />
          </a>
          <a href={`https://api.whatsapp.com/send?text=${shareText}%20${shareUrl}`} target="_blank" rel="noreferrer" style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#25d366", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none", fontSize: "0.85rem" }}>
            <FaWhatsapp />
          </a>
        </div>
      </div>

      {/* TWO-COLUMN GRID */}
      <div style={{ display: "grid", gridTemplateColumns: isLargeScreen ? "1.8fr 1fr" : "1fr", gap: "40px", alignItems: "start" }}>
        
        {/* LEFT COLUMN: MAIN ARTICLE */}
        <div>
          {/* FEATURED IMAGE */}
          {article.image && (
            <div style={{ borderRadius: "12px", overflow: "hidden", marginBottom: "30px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
              <img src={article.image.startsWith("http") ? article.image : API.defaults.baseURL + article.image} alt={article.title} style={{ width: "100%", maxHeight: "400px", objectFit: "cover", display: "block" }} />
            </div>
          )}

          {/* PROMOTIONAL VIDEO */}
          {article.hasVideo && article.videoUrl && (
            <div style={{ background: "#000", borderRadius: "12px", overflow: "hidden", marginBottom: "30px", boxShadow: "0 4px 20px rgba(0,0,0,0.15)" }}>
              <div style={{ background: "#1e293b", padding: "10px 16px", color: "#fdba74", fontWeight: "800", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "8px" }}>
                <FiPlay /> Featured Promotional Video
              </div>
              {article.videoUrl.includes("youtube") || article.videoUrl.includes("embed") ? (
                <div style={{ position: "relative", paddingBottom: "56.25%", height: 0 }}>
                  <iframe src={article.videoUrl} title="Promotional Video" frameBorder="0" allowFullScreen style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }} />
                </div>
              ) : (
                <video controls style={{ width: "100%", height: "auto", display: "block" }}>
                  <source src={article.videoUrl.startsWith("http") ? article.videoUrl : API.defaults.baseURL + article.videoUrl} type="video/mp4" />
                </video>
              )}
            </div>
          )}

          {/* ARTICLE CONTENT */}
          <div
            className="sponsored-article-body"
            dangerouslySetInnerHTML={{ __html: article.description }}
            style={{ fontSize: "1.1rem", lineHeight: "1.8", color: "#334155" }}
          />
        </div>

        {/* RIGHT COLUMN: ABOUT SPONSOR PANEL */}
        <div>
          <div style={{ 
            background: "#fff", 
            border: "1px solid #e2e8f0", 
            borderRadius: "12px", 
            padding: "24px", 
            boxShadow: "0 4px 20px rgba(0,0,0,0.02)",
            position: "sticky",
            top: "20px"
          }}>
            <h3 style={{ fontSize: "1.15rem", fontWeight: "800", color: "#0f172a", margin: "0 0 20px 0", borderBottom: "1.5px solid #f1f5f9", paddingBottom: "10px" }}>
              About the Sponsor
            </h3>

            {/* LOGO */}
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "16px" }}>
              {article.companyLogo ? (
                <img src={article.companyLogo.startsWith("http") ? article.companyLogo : API.defaults.baseURL + article.companyLogo} alt={article.companyName} style={{ maxHeight: "70px", maxWidth: "100%", objectFit: "contain" }} />
              ) : (
                <div style={{ width: "70px", height: "70px", borderRadius: "50%", background: "#eff6ff", color: "#2563eb", display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: "900", fontSize: "1.6rem" }}>
                  {article.companyName.charAt(0)}
                </div>
              )}
            </div>

            {/* NAME & SLOGAN */}
            <div style={{ textAlign: "center", marginBottom: "20px" }}>
              <h4 style={{ margin: "0 0 8px 0", fontSize: "1.15rem", fontWeight: "800", color: "#0f172a", lineHeight: "1.3" }}>
                {article.companyName}
              </h4>
              <p style={{ fontSize: "0.85rem", color: "#64748b", margin: 0, lineHeight: "1.5" }}>
                {article.eventDetails || "A leading partner committed to delivering quality products and professional services."}
              </p>
            </div>

            {/* CONTACT DETAIL LIST */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", borderTop: "1.5px solid #f1f5f9", paddingTop: "20px", marginBottom: "20px" }}>
              {article.website && (
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ width: "30px", height: "30px", borderRadius: "50%", background: "#f8fafc", color: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.85rem" }}>
                    <FaGlobe />
                  </div>
                  <a href={article.website.startsWith("http") ? article.website : `https://${article.website}`} target="_blank" rel="noreferrer" style={{ fontSize: "0.9rem", color: "#2563eb", fontWeight: "700", textDecoration: "none", wordBreak: "break-all" }}>
                    {article.website.replace(/https?:\/\//, "")}
                  </a>
                </div>
              )}
              {article.phone && (
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ width: "30px", height: "30px", borderRadius: "50%", background: "#f8fafc", color: "#64748b", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.85rem" }}>
                    <FaPhone />
                  </div>
                  <a href={`tel:${article.phone}`} style={{ fontSize: "0.9rem", color: "#334155", fontWeight: "600", textDecoration: "none" }}>
                    {article.phone}
                  </a>
                </div>
              )}
              {article.email && (
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ width: "30px", height: "30px", borderRadius: "50%", background: "#f8fafc", color: "#64748b", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.85rem" }}>
                    <FaEnvelope />
                  </div>
                  <a href={`mailto:${article.email}`} style={{ fontSize: "0.9rem", color: "#334155", fontWeight: "600", textDecoration: "none", wordBreak: "break-all" }}>
                    {article.email}
                  </a>
                </div>
              )}
            </div>

            {/* FOLLOW US — only shown when sponsor has provided at least one social link */}
            {(article.socialLinks?.facebook || article.socialLinks?.twitter || article.socialLinks?.instagram || article.socialLinks?.linkedin || article.socialLinks?.youtube) && (
              <div style={{ borderTop: "1.5px solid #f1f5f9", paddingTop: "20px" }}>
                <h5 style={{ fontSize: "0.88rem", fontWeight: "800", color: "#0f172a", margin: "0 0 12px 0" }}>
                  Follow Us
                </h5>
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                  {article.socialLinks?.facebook && (
                    <a href={article.socialLinks.facebook} target="_blank" rel="noreferrer" title="Follow on Facebook"
                      style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#3b5998", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none", fontSize: "0.85rem" }}>
                      <FaFacebookF />
                    </a>
                  )}
                  {article.socialLinks?.twitter && (
                    <a href={article.socialLinks.twitter} target="_blank" rel="noreferrer" title="Follow on Twitter / X"
                      style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#1da1f2", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none", fontSize: "0.85rem" }}>
                      <FaTwitter />
                    </a>
                  )}
                  {article.socialLinks?.instagram && (
                    <a href={article.socialLinks.instagram} target="_blank" rel="noreferrer" title="Follow on Instagram"
                      style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#e1306c", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none", fontSize: "0.85rem" }}>
                      <FaInstagram />
                    </a>
                  )}
                  {article.socialLinks?.linkedin && (
                    <a href={article.socialLinks.linkedin} target="_blank" rel="noreferrer" title="Follow on LinkedIn"
                      style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#0077b5", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none", fontSize: "0.85rem" }}>
                      <FaLinkedinIn />
                    </a>
                  )}
                  {article.socialLinks?.youtube && (
                    <a href={article.socialLinks.youtube} target="_blank" rel="noreferrer" title="Subscribe on YouTube"
                      style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#ff0000", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none", fontSize: "0.85rem" }}>
                      <FaYoutube />
                    </a>
                  )}
                </div>
              </div>
            )}

          </div>
        </div>

      </div>

    </article>
  );
};

export default SponsoredArticleDetail;

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../config/api";
import { FiMail, FiPhone, FiArrowRight, FiSend, FiPlay, FiDownload } from "react-icons/fi";
import useSEO from "../hooks/useSEO";
import "../styles/InfoPages.css";

const getFeatureEmoji = (feat) => {
  const f = feat.toLowerCase();
  if (f.includes("article")) return "📰 ";
  if (f.includes("banner")) return "🖥️ ";
  if (f.includes("reel") || f.includes("video")) return "🎥 ";
  if (f.includes("instagram") || f.includes("post") || f.includes("photo")) return "📸 ";
  if (f.includes("facebook") || f.includes("promotion") || f.includes("social")) return "👥 ";
  if (f.includes("whatsapp")) return "💬 ";
  if (f.includes("press") || f.includes("release")) return "📄 ";
  if (f.includes("youtube") || f.includes("community")) return "📢 ";
  return "✓ ";
};

const SponsoredArticlesLanding = () => {
  useSEO({
    title: "Sponsored Articles & Video Promotion | Newsghuru",
    description: "Promote your brand, college, event or product to millions of active readers on Newsghuru.",
    keywords: "sponsored articles, brand stories, product launch, video promotion, Newsghuru sponsorship",
  });

  const [packages, setPackages] = useState([]);
  const [tariffUrl, setTariffUrl] = useState("");

  useEffect(() => {
    API.get("/api/sponsored/packages")
      .then((res) => {
        if (res.data.success) {
          console.log("Fetched packages successfully:", res.data.packages);
          setPackages(res.data.packages || []);
        }
      })
      .catch((err) => console.error(err));

    API.get("/api/ads/settings/public")
      .then((res) => {
        if (res.data.success && res.data.settings?.tariffCardPdf) {
          setTariffUrl(res.data.settings.tariffCardPdf);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  const articlePackages = packages.filter((p) => !p.isVideoPackage && !p.isComboPackage);
  const videoPackages = packages.filter((p) => p.isVideoPackage);
  const comboPackages = packages.filter((p) => p.isComboPackage);

  // Standard inclusions from corporate rate card
  const standardInclusions = [
    { title: "Professionally Formatted Article", desc: "Crafted by our expert editorial desk" },
    { title: "SEO Optimization", desc: "High search authority & index ranking" },
    { title: "Featured HD Image", desc: "Custom media header & thumbnail" },
    { title: "Brand Backlink", desc: "Direct SEO link to your official website" },
    { title: "Category Placement", desc: "Targeted publishing in relevant news hub" },
    { title: "Social Media Sharing", desc: "Multi-platform push to active readers" },
    { title: "Permanent Website Publishing", desc: "Lifetime archives & indexing on Newsghuru" },
  ];

  return (
    <div style={{ maxWidth: "1150px", margin: "0 auto", padding: "40px 20px", fontFamily: "inherit" }}>
      
      {/* HERO BANNER MATCHING WEBSITE THEME */}
      <div
        style={{
          background: "var(--bg-secondary, #ffffff)",
          borderRadius: "20px",
          padding: "45px 30px",
          textAlign: "center",
          marginBottom: "40px",
          border: "1.5px solid var(--border-color, #e2e8f0)",
          boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
        }}
      >
        <span
          style={{
            background: "rgba(245, 158, 11, 0.1)",
            color: "var(--accent-orange, #ea580c)",
            padding: "6px 18px",
            borderRadius: "20px",
            fontWeight: "800",
            fontSize: "0.85rem",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            display: "inline-block",
            marginBottom: "14px",
          }}
        >
          🌟 Premium Corporate Sponsorships
        </span>
        <h1 style={{ fontSize: "2.5rem", fontWeight: "900", margin: "0 0 14px 0", lineHeight: "1.2", color: "var(--text-primary, #0f172a)" }}>
          Sponsored Articles & Video Promotion
        </h1>
        <p style={{ color: "var(--text-muted, #64748b)", fontSize: "1.1rem", maxWidth: "760px", margin: "0 auto 30px auto", lineHeight: "1.6" }}>
          Promote your brand, college events, product launches, educational achievements, or corporate story to millions of engaged readers across India.
        </p>
        <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
          <Link
            to="/sponsored-request"
            style={{
              background: "linear-gradient(135deg, var(--accent-orange, #ea580c) 0%, #d97706 100%)",
              color: "#fff",
              padding: "14px 32px",
              borderRadius: "12px",
              fontWeight: "800",
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              boxShadow: "0 6px 20px rgba(234,88,12,0.35)",
            }}
          >
            <FiSend /> Submit Sponsor Request
          </Link>
          {tariffUrl && (
            <a
              href={tariffUrl.startsWith("http") ? tariffUrl : `${API.defaults.baseURL}${tariffUrl}`}
              target="_blank"
              rel="noreferrer"
              style={{
                background: "var(--bg-primary, #ffffff)",
                color: "var(--accent-orange, #ea580c)",
                padding: "14px 28px",
                borderRadius: "12px",
                fontWeight: "800",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                border: "2px solid var(--accent-orange, #ea580c)",
                boxShadow: "0 4px 12px rgba(234,88,12,0.08)",
              }}
            >
              <FiDownload /> Download Tariff (PDF)
            </a>
          )}
          <a
            href="mailto:ads@newsghuru.in"
            style={{
              background: "var(--bg-primary, #ffffff)",
              color: "var(--text-primary, #0f172a)",
              padding: "14px 28px",
              borderRadius: "12px",
              fontWeight: "700",
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              border: "1.5px solid var(--border-color, #cbd5e1)",
            }}
          >
            <FiMail style={{ color: "var(--accent-orange)" }} /> Contact Admin / Get Quote
          </a>
        </div>
      </div>

      {/* FEATURE SPOTLIGHT: WHAT ALL ARTICLE PACKAGES INCLUDE */}
      <div style={{ background: "var(--bg-secondary, #ffffff)", borderRadius: "20px", padding: "35px 30px", border: "1.5px solid var(--border-color, #e2e8f0)", boxShadow: "0 4px 20px rgba(0,0,0,0.03)", marginBottom: "50px" }}>
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <span style={{ background: "rgba(245, 158, 11, 0.1)", color: "var(--accent-orange, #ea580c)", padding: "4px 14px", borderRadius: "14px", fontWeight: "800", fontSize: "0.8rem", textTransform: "uppercase" }}>
            ✨ All-Inclusive Benefits
          </span>
          <h2 style={{ fontSize: "1.8rem", fontWeight: "900", color: "var(--text-primary, #0f172a)", margin: "10px 0 6px 0" }}>
            Every Sponsored Article Package Includes
          </h2>
          <p style={{ color: "var(--text-muted, #64748b)", margin: 0, fontSize: "0.95rem" }}>
            All our publication tiers come standard with complete editorial, SEO, and multi-channel marketing support.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
          {standardInclusions.map((item, idx) => (
            <div key={idx} style={{ background: "var(--bg-primary, #ffffff)", padding: "16px 20px", borderRadius: "14px", border: "1.5px solid var(--border-color, #e2e8f0)", display: "flex", alignItems: "center", gap: "14px" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "linear-gradient(135deg, var(--accent-orange, #ea580c) 0%, #d97706 100%)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontWeight: "900", fontSize: "0.9rem" }}>
                ✓
              </div>
              <div>
                <div style={{ fontWeight: "800", fontSize: "0.95rem", color: "var(--text-primary, #0f172a)" }}>{item.title}</div>
                <div style={{ fontSize: "0.82rem", color: "var(--text-muted, #64748b)", marginTop: "2px" }}>{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ARTICLE PACKAGES GRID */}
      <div style={{ marginBottom: "50px" }}>
        <div style={{ textAlign: "center", marginBottom: "35px" }}>
          <h2 style={{ fontSize: "2rem", fontWeight: "900", color: "var(--text-primary, #0f172a)", margin: "0 0 8px 0" }}>
            📰 Sponsored Article Services & Pricing
          </h2>
          <p style={{ color: "var(--text-muted, #64748b)", fontSize: "1rem" }}>
            Select the specific publishing service tailored to your campaign objectives.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "25px" }}>
          {articlePackages.map((pkg) => (
            <div
              key={pkg.packageId}
              style={{
                background: "var(--bg-secondary, #ffffff)",
                padding: "28px",
                borderRadius: "20px",
                border: "1.5px solid var(--border-color, #e2e8f0)",
                boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                transition: "transform 0.3s ease",
              }}
            >
              <div>
                {/* CLEAN TITLE & BADGE HEADER */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px", marginBottom: "14px" }}>
                  <h3 style={{ fontSize: "1.3rem", fontWeight: "800", margin: 0, color: "var(--text-primary, #0f172a)", lineHeight: "1.3" }}>
                    {pkg.nameEn}
                  </h3>
                  {pkg.badgeEn && (
                    <span
                      style={{
                        background: "rgba(245, 158, 11, 0.1)",
                        color: "var(--accent-orange, #ea580c)",
                        padding: "4px 12px",
                        borderRadius: "10px",
                        fontSize: "0.75rem",
                        fontWeight: "800",
                        whiteSpace: "nowrap",
                        flexShrink: 0,
                      }}
                    >
                      {pkg.badgeEn}
                    </span>
                  )}
                </div>

                {/* PRICE DISPLAY */}
                <div style={{ display: "flex", alignItems: "baseline", gap: "6px", marginBottom: "20px" }}>
                  <span style={{ fontSize: "2.2rem", fontWeight: "900", color: "var(--accent-orange, #ea580c)" }}>
                    ₹{pkg.price.toLocaleString()}
                  </span>
                  <span style={{ fontSize: "0.85rem", color: "var(--text-muted, #64748b)", fontWeight: "600" }}>/ publication</span>
                </div>

                <div style={{ borderTop: "1.5px solid var(--border-color, #e2e8f0)", paddingTop: "18px", marginBottom: "24px" }}>
                  <div style={{ fontWeight: "800", fontSize: "0.88rem", marginBottom: "8px", color: "var(--text-primary, #0f172a)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    Core Highlight:
                  </div>
                  <p style={{ margin: 0, fontSize: "0.92rem", color: "var(--text-muted, #475569)", lineHeight: "1.5" }}>
                    {pkg.packageId === "article_basic" && "Standard corporate news coverage formatted for high reader engagement."}
                    {pkg.packageId === "article_seo" && "High-authority keyword targeting & search ranking optimization for maximum web discoverability."}
                    {pkg.packageId === "article_brand" && "In-depth brand story feature with photo gallery and homepage spotlight."}
                    {pkg.packageId === "article_interview" && "Exclusive CEO / Founder Q&A interview showcasing executive leadership & vision."}
                    {pkg.packageId === "article_launch" && "Dedicated product launch coverage with high-resolution imagery and direct purchase links."}
                    {pkg.packageId === "article_event" && "Complete event highlight writeup with photo highlights and registration backlinks."}
                    {pkg.packageId === "article_company" && "Comprehensive corporate overview and institutional milestone feature story."}
                  </p>
                </div>
              </div>

              <Link
                to="/sponsored-request"
                style={{
                  width: "100%",
                  textAlign: "center",
                  background: "linear-gradient(135deg, var(--accent-orange, #ea580c) 0%, #d97706 100%)",
                  color: "#fff",
                  padding: "14px 0",
                  borderRadius: "12px",
                  fontWeight: "800",
                  textDecoration: "none",
                  display: "block",
                  boxShadow: "0 4px 15px rgba(234,88,12,0.25)",
                  boxSizing: "border-box",
                  fontSize: "1rem",
                  marginTop: "auto",
                }}
              >
                Select Package
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* COMBO PACKAGES SECTION */}
      <div style={{ marginBottom: "50px" }}>
        <div style={{ textAlign: "center", marginBottom: "35px" }}>
          <span style={{ background: "rgba(16, 185, 129, 0.1)", color: "#10b981", padding: "6px 16px", borderRadius: "16px", fontWeight: "800", fontSize: "0.8rem", textTransform: "uppercase" }}>
            🔥 Best Value Bundles
          </span>
          <h2 style={{ fontSize: "2rem", fontWeight: "900", color: "var(--text-primary, #0f172a)", margin: "10px 0 8px 0" }}>
            🚀 Premium Combo Packages
          </h2>
          <p style={{ color: "var(--text-muted, #64748b)", fontSize: "1rem" }}>
            Maximize your brand's outreach with cross-platform promotions, social campaigns, and website sponsorships.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "25px" }}>
          {comboPackages.map((pkg) => {
            const isPopular = pkg.packageId === "combo_growth";
            return (
              <div
                key={pkg.packageId}
                style={{
                  background: "var(--bg-secondary, #ffffff)",
                  padding: "28px",
                  borderRadius: "20px",
                  border: isPopular ? "2px solid var(--accent-blue, #ea580c)" : "1.5px solid var(--border-color, #e2e8f0)",
                  boxShadow: isPopular ? "0 4px 20px rgba(234, 88, 12, 0.15)" : "0 4px 20px rgba(0,0,0,0.03)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  position: "relative"
                }}
              >
                {isPopular && (
                  <span style={{ position: "absolute", top: "-12px", right: "20px", background: "linear-gradient(135deg, var(--accent-blue, #ea580c) 0%, var(--accent-orange, #f59e0b) 100%)", color: "#fff", padding: "4px 12px", borderRadius: "12px", fontSize: "0.72rem", fontWeight: "800", textTransform: "uppercase" }}>
                    POPULAR
                  </span>
                )}
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                    <h3 style={{ fontSize: "1.3rem", fontWeight: "800", margin: 0, color: "var(--text-primary)" }}>{pkg.nameEn}</h3>
                    {pkg.badgeEn && (
                      <span style={{
                        background: pkg.packageId === "combo_starter" ? "rgba(245, 158, 11, 0.12)" : (pkg.packageId === "combo_premium" ? "rgba(16, 185, 129, 0.15)" : "rgba(234, 88, 12, 0.12)"),
                        color: pkg.packageId === "combo_starter" ? "#d97706" : (pkg.packageId === "combo_premium" ? "#10b981" : "var(--accent-blue, #ea580c)"),
                        padding: "4px 10px",
                        borderRadius: "10px",
                        fontSize: "0.75rem",
                        fontWeight: "800"
                      }}>
                        {pkg.badgeEn}
                      </span>
                    )}
                  </div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: "6px", marginBottom: "20px" }}>
                    <span style={{ fontSize: "2.2rem", fontWeight: "900", color: "var(--accent-orange)" }}>
                      ₹{pkg.price.toLocaleString()}
                    </span>
                    <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: "600" }}>/ campaign</span>
                  </div>
                  <ul style={{ listStyle: "none", padding: 0, fontSize: "0.92rem", color: "var(--text-muted)", lineHeight: "1.8", margin: "0 0 24px 0" }}>
                    {pkg.featuresEn.map((feat, idx) => (
                      <li key={idx} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span>{getFeatureEmoji(feat)}</span>
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <Link to={`/sponsored-request?combo=${pkg.nameEn}`} style={{ width: "100%", textAlign: "center", background: isPopular ? "linear-gradient(135deg, var(--accent-blue, #ea580c) 0%, var(--accent-orange, #f59e0b) 100%)" : "linear-gradient(135deg, var(--accent-orange) 0%, #d97706 100%)", color: "#fff", padding: "14px 0", borderRadius: "12px", fontWeight: "800", textDecoration: "none", display: "block", boxShadow: isPopular ? "0 4px 15px rgba(234, 88, 12, 0.25)" : "0 4px 15px rgba(234,88,12,0.2)" }}>
                  Choose Package
                </Link>
              </div>
            );
          })}
        </div>
      </div>

      {/* VIDEO PROMOTION SECTION MATCHING EXACT PAPER RATES */}
      <div style={{ background: "var(--bg-secondary, #ffffff)", padding: "35px 30px", borderRadius: "20px", border: "1.5px solid var(--border-color, #e2e8f0)", boxShadow: "0 4px 20px rgba(0,0,0,0.03)", marginBottom: "50px" }}>
        <div style={{ textAlign: "center", marginBottom: "35px" }}>
          <span style={{ background: "rgba(245, 158, 11, 0.1)", color: "var(--accent-orange, #ea580c)", padding: "6px 16px", borderRadius: "16px", fontWeight: "800", fontSize: "0.8rem", textTransform: "uppercase" }}>
            🎥 High-Conversion Video Media
          </span>
          <h2 style={{ fontSize: "2rem", fontWeight: "900", color: "var(--text-primary, #0f172a)", margin: "10px 0 0 0" }}>
            Video Promotion Rates
          </h2>
          <p style={{ color: "var(--text-muted, #64748b)", marginTop: "6px" }}>
            Pair your article with dedicated high-impact video media embeds and video channel highlights.
          </p>
        </div>

        {/* ELEGANT PROFESSIONAL PRICING TABLE */}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0", borderRadius: "14px", overflow: "hidden", border: "1.5px solid var(--border-color, #e2e8f0)" }}>
            <thead>
              <tr style={{ background: "rgba(245, 158, 11, 0.08)", textAlign: "left" }}>
                <th style={{ padding: "16px 20px", fontSize: "1rem", fontWeight: "800", color: "var(--text-primary, #0f172a)", borderBottom: "1.5px solid var(--border-color)" }}>Video Service Package</th>
                <th style={{ padding: "16px 20px", fontSize: "1rem", fontWeight: "800", color: "var(--text-primary, #0f172a)", borderBottom: "1.5px solid var(--border-color)" }}>Key Features</th>
                <th style={{ padding: "16px 20px", fontSize: "1rem", fontWeight: "800", color: "var(--accent-orange, #ea580c)", borderBottom: "1.5px solid var(--border-color)", textAlign: "right" }}>Price</th>
              </tr>
            </thead>
            <tbody>
              {videoPackages.map((vp, index) => (
                <tr key={vp.packageId} style={{ background: index % 2 === 0 ? "var(--bg-primary, #ffffff)" : "rgba(0,0,0,0.01)" }}>
                  <td style={{ padding: "18px 20px", fontWeight: "800", fontSize: "1.05rem", color: "var(--text-primary, #0f172a)", borderBottom: index === videoPackages.length - 1 ? "none" : "1px solid var(--border-color)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <FiPlay style={{ color: "var(--accent-orange)", flexShrink: 0 }} />
                      <span>{vp.nameEn}</span>
                    </div>
                  </td>
                  <td style={{ padding: "18px 20px", fontSize: "0.9rem", color: "var(--text-muted, #64748b)", borderBottom: index === videoPackages.length - 1 ? "none" : "1px solid var(--border-color)" }}>
                    {vp.featuresEn ? vp.featuresEn.join(" • ") : "HD Video Showcase"}
                  </td>
                  <td style={{ padding: "18px 20px", fontWeight: "900", fontSize: "1.3rem", color: "var(--accent-orange, #ea580c)", textAlign: "right", borderBottom: index === videoPackages.length - 1 ? "none" : "1px solid var(--border-color)" }}>
                    ₹{vp.price.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CONTACT INFO CARD MATCHING WEBSITE THEME */}
      <div style={{ background: "var(--bg-secondary, #ffffff)", border: "1.5px solid var(--border-color, #e2e8f0)", borderRadius: "20px", padding: "30px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "20px", boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>
        <div>
          <h3 style={{ fontSize: "1.5rem", fontWeight: "800", margin: "0 0 8px 0", color: "var(--accent-orange, #ea580c)" }}>Ready to Promote Your Brand?</h3>
          <p style={{ color: "var(--text-primary, #334155)", margin: 0, fontSize: "0.95rem", fontWeight: "600" }}>
            Reach out to our media sales team today for customized multi-channel campaign packages.
          </p>
          <div style={{ display: "flex", gap: "10px 20px", marginTop: "16px", fontSize: "0.9rem", color: "var(--text-primary, #334155)", flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}><FiMail style={{ color: "var(--accent-orange)" }} /> Email: <strong>ads@newsghuru.in</strong></div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}><FiPhone style={{ color: "var(--accent-orange)" }} /> Phone: <strong>+91 88259 48859</strong></div>
          </div>
        </div>
        <Link
          to="/sponsored-request"
          style={{
            background: "linear-gradient(135deg, var(--accent-orange, #ea580c) 0%, #d97706 100%)",
            color: "#fff",
            padding: "14px 28px",
            borderRadius: "12px",
            fontWeight: "800",
            textDecoration: "none",
            boxShadow: "0 4px 15px rgba(234,88,12,0.35)",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px"
          }}
        >
          Get Started Now <FiArrowRight />
        </Link>
      </div>

    </div>
  );
};

export default SponsoredArticlesLanding;

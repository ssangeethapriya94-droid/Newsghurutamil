import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../config/api";
import { FiMail, FiPhone, FiArrowRight, FiSend, FiPlay, FiDownload } from "react-icons/fi";
import useSEO from "../hooks/useSEO";
import "../styles/InfoPages.css";

const getFeatureEmoji = (feat) => {
  const f = feat.toLowerCase();
  if (f.includes("article") || f.includes("செய்தி") || f.includes("கட்டுரை")) return "📰 ";
  if (f.includes("banner") || f.includes("பேனர்")) return "🖥️ ";
  if (f.includes("reel") || f.includes("video") || f.includes("வீடியோ") || f.includes("ரீல்")) return "🎥 ";
  if (f.includes("instagram") || f.includes("post") || f.includes("photo") || f.includes("பதிவு")) return "📸 ";
  if (f.includes("facebook") || f.includes("promotion") || f.includes("social") || f.includes("விளம்பரம்")) return "👥 ";
  if (f.includes("whatsapp") || f.includes("வாட்ஸ்அப்")) return "💬 ";
  if (f.includes("press") || f.includes("release") || f.includes("பத்திரிக்கை")) return "📄 ";
  if (f.includes("youtube") || f.includes("community") || f.includes("யூடியூப்")) return "📢 ";
  return "✓ ";
};

const SponsoredArticlesLanding = () => {
  useSEO({
    title: "ஸ்பான்சர் கட்டுரைகள் & வீடியோ விளம்பரம் | நியூஸ் குரு",
    description: "உங்கள் பிராண்ட், கல்லூரி, நிகழ்ச்சி அல்லது தயாரிப்பை மில்லியன் கணக்கான வாசகர்களிடம் கொண்டு சேருங்கள்.",
    keywords: "ஸ்பான்சர் செய்திகள், பிராண்ட் கதைகள், தயாரிப்பு அறிமுகம், வீடியோ விளம்பரம், நியூஸ் குரு ஸ்பான்சர்ஷிப்",
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
    { title: "தொழில்முறை செய்தி வடிவமைப்பு", desc: "எங்கள் நிபுணர் செய்திப் பிரிவால் உருவாக்கப்படும்" },
    { title: "தேடுபொறி உகப்பாக்கம் (SEO)", desc: "கூகிள் தேடலில் முன்னணி இடம் பெறும் உகப்பாக்கம்" },
    { title: "சிறப்பு முகப்பு படம் (Featured Image)", desc: "உயர்தர படங்கள் மற்றும் பேனர் வடிவம்" },
    { title: "பிராண்ட் இணைப்பு (Backlink)", desc: "உங்கள் அதிகாரப்பூர்வ இணையதளத்திற்கு நேரடி இணைப்பு" },
    { title: "செய்திப் பிரிவு இடம் (Category Placement)", desc: "பொருத்தமான செய்திப் பிரிவில் பிரத்யேக இடம்" },
    { title: "சமூக ஊடக பகிர்வு", desc: "நியூஸ் குருவின் சமூக வலைத்தளங்களில் செய்தி பரப்புதல்" },
    { title: "நிரந்தர வெளியீடு (Permanent Publishing)", desc: "தளத்தில் வாழ்நாள் முழுவதும் பாதுகாக்கப்பட்ட பதிவு" },
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
          🌟 பிரீமியம் கார்ப்பரேட் ஸ்பான்சர்ஷிப்
        </span>
        <h1 style={{ fontSize: "2.5rem", fontWeight: "900", margin: "0 0 14px 0", lineHeight: "1.25", color: "var(--text-primary, #0f172a)" }}>
          ஸ்பான்சர் செய்யப்பட்ட கட்டுரைகள் & வீடியோ விளம்பரம்
        </h1>
        <p style={{ color: "var(--text-muted, #64748b)", fontSize: "1.1rem", maxWidth: "760px", margin: "0 auto 30px auto", lineHeight: "1.6" }}>
          உங்கள் வணிகம், கல்லூரி விழாக்கள், புதிய தயாரிப்புகள் அல்லது கார்ப்பரேட் செய்திகளை தமிழகம் மற்றும் உலகெங்கிலும் உள்ள மில்லியன் கணக்கான வாசகர்களிடம் கொண்டு சேருங்கள்.
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
            <FiSend /> ஸ்பான்சர் கோரிக்கை அனுப்பவும்
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
              <FiDownload /> கட்டணப்பட்டியல் (Tariff Card) பதிவிறக்கம்
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
            <FiMail style={{ color: "var(--accent-orange)" }} /> நிர்வாகியை தொடர்பு கொள்ள
          </a>
        </div>
      </div>

      {/* FEATURE SPOTLIGHT: WHAT ALL ARTICLE PACKAGES INCLUDE */}
      <div style={{ background: "var(--bg-secondary, #ffffff)", borderRadius: "20px", padding: "35px 30px", border: "1.5px solid var(--border-color, #e2e8f0)", boxShadow: "0 4px 20px rgba(0,0,0,0.03)", marginBottom: "50px" }}>
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <span style={{ background: "rgba(245, 158, 11, 0.1)", color: "var(--accent-orange, #ea580c)", padding: "4px 14px", borderRadius: "14px", fontWeight: "800", fontSize: "0.8rem", textTransform: "uppercase" }}>
            ✨ அனைத்து திட்டங்களிலும் சேருபவை
          </span>
          <h2 style={{ fontSize: "1.8rem", fontWeight: "900", color: "var(--text-primary, #0f172a)", margin: "10px 0 6px 0" }}>
            அனைத்து ஸ்பான்சர் செய்தி திட்டங்களிலும் அடங்குபவை (Includes)
          </h2>
          <p style={{ color: "var(--text-muted, #64748b)", margin: 0, fontSize: "0.95rem" }}>
            எங்கள் அனைத்து செய்தித் திட்டங்களிலும் கீழே குறிப்பிடப்பட்டுள்ள அனைத்து சிறப்பு வசதிகளும் இயல்பாகவே சேர்க்கப்படும்.
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
            📰 ஸ்பான்சர் செய்தி திட்டங்கள் மற்றும் கட்டணங்கள் (Sponsored Articles)
          </h2>
          <p style={{ color: "var(--text-muted, #64748b)", fontSize: "1rem" }}>
            உங்கள் நிறுவனத்தின் தேவைக்கேற்ற பிரத்யேக செய்தி திட்டத்தைத் தேர்வு செய்யவும்.
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
                    {pkg.nameTa || pkg.nameEn}
                  </h3>
                  {(pkg.badgeTa || pkg.badgeEn) && (
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
                      {pkg.badgeTa || pkg.badgeEn}
                    </span>
                  )}
                </div>

                {/* PRICE DISPLAY */}
                <div style={{ display: "flex", alignItems: "baseline", gap: "6px", marginBottom: "20px" }}>
                  <span style={{ fontSize: "2.2rem", fontWeight: "900", color: "var(--accent-orange, #ea580c)" }}>
                    ₹{pkg.price.toLocaleString()}
                  </span>
                  <span style={{ fontSize: "0.85rem", color: "var(--text-muted, #64748b)", fontWeight: "600" }}>/ வெளியீடு</span>
                </div>

                <div style={{ borderTop: "1.5px solid var(--border-color, #e2e8f0)", paddingTop: "18px", marginBottom: "24px" }}>
                  <div style={{ fontWeight: "800", fontSize: "0.88rem", marginBottom: "8px", color: "var(--text-primary, #0f172a)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    சிறப்பம்சம்:
                  </div>
                  <p style={{ margin: 0, fontSize: "0.92rem", color: "var(--text-muted, #475569)", lineHeight: "1.5" }}>
                    {pkg.packageId === "article_basic" && "அனைத்து வாசகர்களையும் ஈர்க்கும் தரநிலையான நிறுவன செய்தி வெளியீடு."}
                    {pkg.packageId === "article_seo" && "தேடுபொறி தரவரிசையில் முன்னணி இடம் பெற உதவும் கூகிள் எஸ்சிஓ உகப்பாக்கம்."}
                    {pkg.packageId === "article_brand" && "புகைப்பட கேலரி மற்றும் முகப்பு பக்க சிறப்பம்சத்துடன் கூடிய ஆழமான பிராண்ட் கதை."}
                    {pkg.packageId === "article_interview" && "நிறுவனத் தலைவர்கள் மற்றும் நிறுவனர்களின் நேர்காணல் மற்றும் பார்வை."}
                    {pkg.packageId === "article_launch" && "புதிய தயாரிப்பு அறிமுகம், உயர்தர படங்கள் மற்றும் நேரடி கொள்முதல் இணைப்பு."}
                    {pkg.packageId === "article_event" && "நிகழ்ச்சி சிறப்பம்சங்கள், புகைப்பட கேலரி மற்றும் பதிவு இணைப்புகள்."}
                    {pkg.packageId === "article_company" && "கார்ப்பரேட் கண்ணோட்டம் மற்றும் சாதனைகளை விளக்கும் பிரத்யேக கட்டுரை."}
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
                திட்டத்தைத் தேர்வு செய்க
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* COMBO PACKAGES SECTION */}
      <div style={{ marginBottom: "50px" }}>
        <div style={{ textAlign: "center", marginBottom: "35px" }}>
          <span style={{ background: "rgba(16, 185, 129, 0.1)", color: "#10b981", padding: "6px 16px", borderRadius: "16px", fontWeight: "800", fontSize: "0.8rem", textTransform: "uppercase" }}>
            🔥 காம்போ திட்டங்கள் (Combo Packages)
          </span>
          <h2 style={{ fontSize: "2rem", fontWeight: "900", color: "var(--text-primary, #0f172a)", margin: "10px 0 8px 0" }}>
            🚀 சிறந்த காம்போ விளம்பரத் திட்டங்கள்
          </h2>
          <p style={{ color: "var(--text-muted, #64748b)", fontSize: "1rem" }}>
            சமூக ஊடகங்கள், வலைத்தள பேனர்கள் மற்றும் ஸ்பான்சர் செய்திகள் மூலம் உங்கள் வணிகத்தை எளிய முறையில் வாடிக்கையாளர்களிடம் கொண்டு சேர்க்கவும்.
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
                    <h3 style={{ fontSize: "1.3rem", fontWeight: "800", margin: 0, color: "var(--text-primary)" }}>{pkg.nameTa || pkg.nameEn}</h3>
                    {(pkg.badgeTa || pkg.badgeEn) && (
                      <span style={{
                        background: pkg.packageId === "combo_starter" ? "rgba(245, 158, 11, 0.12)" : (pkg.packageId === "combo_premium" ? "rgba(16, 185, 129, 0.15)" : "rgba(234, 88, 12, 0.12)"),
                        color: pkg.packageId === "combo_starter" ? "#d97706" : (pkg.packageId === "combo_premium" ? "#10b981" : "var(--accent-blue, #ea580c)"),
                        padding: "4px 10px",
                        borderRadius: "10px",
                        fontSize: "0.75rem",
                        fontWeight: "800"
                      }}>
                        {pkg.badgeTa || pkg.badgeEn}
                      </span>
                    )}
                  </div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: "6px", marginBottom: "20px" }}>
                    <span style={{ fontSize: "2.2rem", fontWeight: "900", color: "var(--accent-orange)" }}>
                      ₹{pkg.price.toLocaleString()}
                    </span>
                    <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: "600" }}>/ பிரச்சாரம்</span>
                  </div>
                  <ul style={{ listStyle: "none", padding: 0, fontSize: "0.92rem", color: "var(--text-muted)", lineHeight: "1.8", margin: "0 0 24px 0" }}>
                    {(pkg.featuresTa || pkg.featuresEn).map((feat, idx) => (
                      <li key={idx} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span>{getFeatureEmoji(feat)}</span>
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <Link to={`/sponsored-request?combo=${pkg.nameEn}`} style={{ width: "100%", textAlign: "center", background: isPopular ? "linear-gradient(135deg, var(--accent-blue, #ea580c) 0%, var(--accent-orange, #f59e0b) 100%)" : "linear-gradient(135deg, var(--accent-orange) 0%, #d97706 100%)", color: "#fff", padding: "14px 0", borderRadius: "12px", fontWeight: "800", textDecoration: "none", display: "block", boxShadow: isPopular ? "0 4px 15px rgba(234, 88, 12, 0.25)" : "0 4px 15px rgba(234,88,12,0.2)" }}>
                  திட்டத்தைத் தேர்வு செய்க
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
            🎥 வீடியோ விளம்பரங்கள்
          </span>
          <h2 style={{ fontSize: "2rem", fontWeight: "900", color: "var(--text-primary, #0f172a)", margin: "10px 0 0 0" }}>
            வீடியோ விளம்பரத் திட்டங்கள் மற்றும் கட்டணங்கள் (Video Promotion)
          </h2>
          <p style={{ color: "var(--text-muted, #64748b)", marginTop: "6px" }}>
            உங்கள் செய்திகளுடன் உயர் தர வீடியோ மீடியாக்களை இணைத்து அதிக வாசகர்களை ஈர்க்கலாம்.
          </p>
        </div>

        {/* ELEGANT PROFESSIONAL PRICING TABLE */}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0", borderRadius: "14px", overflow: "hidden", border: "1.5px solid var(--border-color, #e2e8f0)" }}>
            <thead>
              <tr style={{ background: "rgba(245, 158, 11, 0.08)", textAlign: "left" }}>
                <th style={{ padding: "16px 20px", fontSize: "1rem", fontWeight: "800", color: "var(--text-primary, #0f172a)", borderBottom: "1.5px solid var(--border-color)" }}>வீடியோ சேவை (Package)</th>
                <th style={{ padding: "16px 20px", fontSize: "1rem", fontWeight: "800", color: "var(--text-primary, #0f172a)", borderBottom: "1.5px solid var(--border-color)" }}>சிறப்பம்சங்கள்</th>
                <th style={{ padding: "16px 20px", fontSize: "1rem", fontWeight: "800", color: "var(--accent-orange, #ea580c)", borderBottom: "1.5px solid var(--border-color)", textAlign: "right" }}>கட்டணம் (Price)</th>
              </tr>
            </thead>
            <tbody>
              {videoPackages.map((vp, index) => (
                <tr key={vp.packageId} style={{ background: index % 2 === 0 ? "var(--bg-primary, #ffffff)" : "rgba(0,0,0,0.01)" }}>
                  <td style={{ padding: "18px 20px", fontWeight: "800", fontSize: "1.05rem", color: "var(--text-primary, #0f172a)", borderBottom: index === videoPackages.length - 1 ? "none" : "1px solid var(--border-color)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <FiPlay style={{ color: "var(--accent-orange)", flexShrink: 0 }} />
                      <span>{vp.nameTa || vp.nameEn}</span>
                    </div>
                  </td>
                  <td style={{ padding: "18px 20px", fontSize: "0.9rem", color: "var(--text-muted, #64748b)", borderBottom: index === videoPackages.length - 1 ? "none" : "1px solid var(--border-color)" }}>
                    {(vp.featuresTa.length > 0 ? vp.featuresTa : vp.featuresEn).join(" • ")}
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
          <h3 style={{ fontSize: "1.5rem", fontWeight: "800", margin: "0 0 8px 0", color: "var(--accent-orange, #ea580c)" }}>உங்கள் பிராண்டை வளர்க்கத் தயாரா?</h3>
          <p style={{ color: "var(--text-primary, #334155)", margin: 0, fontSize: "0.95rem", fontWeight: "600" }}>
            சிறப்பு விளம்பரத் திட்டங்களைப் பெற எங்கள் ஊடகப் பிரிவை இன்றே தொடர்பு கொள்ளவும்.
          </p>
          <div style={{ display: "flex", gap: "10px 20px", marginTop: "16px", fontSize: "0.9rem", color: "var(--text-primary, #334155)", flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}><FiMail style={{ color: "var(--accent-orange)" }} /> மின்னஞ்சல்: <strong>ads@newsghuru.in</strong></div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}><FiPhone style={{ color: "var(--accent-orange)" }} /> தொலைபேசி: <strong>+91 88259 48859</strong></div>
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
          இப்போதே தொடங்கவும் <FiArrowRight />
        </Link>
      </div>

    </div>
  );
};

export default SponsoredArticlesLanding;

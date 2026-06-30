import React, { useState, useEffect } from "react";
import API from "../config/api";
import { FiSend, FiCheckCircle, FiAlertCircle } from "react-icons/fi";
import useSEO from "../hooks/useSEO";
import "../styles/InfoPages.css";

// Combo placement config — locked per package based on the invoice
const COMBO_PLACEMENT_CONFIG = {
  "Starter":        { placement: "sidebar_widget",    durationDays: 7,  label: "பக்கவாட்டு விளம்பரம் (Sidebar Widget)",    coverage: "Sidebar Banner (7 நாட்கள்)" },
  "Business Growth": { placement: "homepage_sponsored", durationDays: 15, label: "முகப்புப் பக்க ஸ்பான்சர் பிரிவு", coverage: "Homepage Banner (15 நாட்கள்)" },
  "Premium Brand":  { placement: "homepage_sponsored", durationDays: 30, label: "முகப்புப் பக்க ஸ்பான்சர் பிரிவு", coverage: "Homepage Banner (30 நாட்கள்)" },
};

const SponsoredRequestForm = () => {
  useSEO({
    title: "ஸ்பான்சர் போர்ட்டல் | Newsghuru",
    description: "உங்கள் நிறுவனம் அல்லது நிகழ்ச்சி விவரங்களைச் சமர்ப்பித்து விளம்பரம் செய்யவும்.",
    keywords: "sponsor request, sponsored article submission, brand feature request",
  });

  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const [comboName, setComboName] = useState(null);
  const [comboPrice, setComboPrice] = useState(0);
  const [comboServices, setComboServices] = useState([]);

  const [formData, setFormData] = useState({
    companyName: "",
    contactPerson: "",
    phone: "",
    email: "",
    website: "",
    packageType: "Sponsored News Article",
    packagePrice: 8000,
    videoPackage: "None",
    videoCharge: 0,
    preferredPlacement: "homepage_sponsored",
    durationDays: 7,
    preferredPublishDate: "",
    eventDetails: "",
    description: "",
    videoUrl: "",
    optionType: "Option 1",
    language: "ta"
  });

  const [files, setFiles] = useState({
    logo: null,
    image: null,
    video: null,
    documents: null,
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const combo = params.get("combo");
    if (combo) {
      setComboName(combo);
      let price = 25000;
      let services = [];
      const config = COMBO_PLACEMENT_CONFIG[combo] || { placement: "homepage_sponsored", durationDays: 7 };
      if (combo === "Starter") {
        price = 25000;
        services = ["1 Sponsored Article", "Instagram Post", "Facebook Post", "Sidebar Banner (7 Days)"];
      } else if (combo === "Business Growth") {
        price = 50000;
        services = ["2 Sponsored Articles", "Homepage Banner (15 Days)", "Instagram Reel", "Facebook Promotion", "WhatsApp Broadcast"];
      } else if (combo === "Premium Brand") {
        price = 100000;
        services = ["4 Sponsored Articles", "Homepage Banner (30 Days)", "Press Release", "Instagram Reel", "Facebook Promotion", "YouTube Community Post", "WhatsApp Promotion"];
      }
      setComboPrice(price);
      setComboServices(services);

      setFormData(prev => ({
        ...prev,
        packageType: combo,
        packagePrice: price,
        optionType: "Option 1",
        preferredPlacement: config.placement,
        durationDays: config.durationDays,
      }));
    }

    API.get("/api/sponsored/packages").then((res) => {
      if (res.data.success && res.data.packages) {
        setPackages(res.data.packages);
      }
    }).catch((err) => console.error(err));
  }, []);

  const handlePackageChange = (e) => {
    const pkgName = e.target.value;
    const selected = packages.find((p) => p.nameEn === pkgName || p.nameTa === pkgName);
    setFormData((prev) => ({
      ...prev,
      packageType: pkgName,
      packagePrice: selected ? selected.price : prev.packagePrice,
    }));
  };

  const handleVideoPackageChange = (e) => {
    const vName = e.target.value;
    const selected = packages.find((p) => p.nameEn === vName || p.nameTa === vName);
    setFormData((prev) => ({
      ...prev,
      videoPackage: vName,
      videoCharge: selected ? selected.price : 0,
    }));
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    const token = localStorage.getItem("readerToken");
    if (!token) {
      alert("விளம்பரக் கோரிக்கையைச் சமர்ப்பிக்க தயவுசெய்து முதலில் வாசகர்/ஸ்பான்சராக லாகின் செய்யவும்.");
      window.dispatchEvent(new CustomEvent("open-reader-login"));
      return;
    }

    if (!formData.companyName || !formData.contactPerson || !formData.phone || !formData.email) {
      setError("தயவுசெய்து தேவையான அனைத்து தொடர்பு விவரங்களையும் நிரப்பவும்.");
      return;
    }

    // Mandatory file uploads
    if (!files.logo) {
      setError("நிறுவன லோகோ (கட்டாயமானது). உங்கள் நிறுவன லோகோவை பதிவேற்றி சமர்ப்பிக்கவும்.");
      return;
    }
    if (!files.image) {
      setError("முகப்புப் படம் / பிராண்ட் பேனர் (கட்டாயமானது). ஒரு படத்தை பதிவேற்றி சமர்ப்பிக்கவும்.");
      return;
    }
    if (!files.documents || files.documents.length === 0) {
      setError("ஸ்பான்சர் ஆவணங்கள் (PDF/Word) கட்டாயமானது. குறைந்தது ஒரு ஆவணத்தைப் பதிவேற்றி சமர்ப்பிக்கவும்.");
      return;
    }

    try {
      setLoading(true);
      const postData = new FormData();
      Object.keys(formData).forEach((key) => postData.append(key, formData[key]));
      if (files.logo) postData.append("logo", files.logo);
      if (files.image) postData.append("image", files.image);
      if (files.video) postData.append("video", files.video);
      if (files.documents) {
        Array.from(files.documents).forEach((doc) => postData.append("documents", doc));
      }

      let endpoint = "/api/sponsored/request";
      if (comboName) {
        postData.append("packageName", comboName);
        postData.append("packagePrice", comboPrice);
        endpoint = "/api/sponsored/combo/request";
      }

      const res = await API.post(endpoint, postData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`
        },
      });

      if (res.data.success) {
        const { isMock, orderId, amount, currency, key, requestId } = res.data;

        if (isMock) {
          const verifyRoute = comboName ? "/api/sponsored/combo/verify-payment" : "/api/sponsored/verify-payment";
          const verifyRes = await API.post(
            verifyRoute,
            { requestId, isMock: true, razorpay_order_id: orderId, razorpay_payment_id: "mock_payment_id" },
            { headers: { Authorization: `Bearer ${token}` } }
          );

          if (verifyRes.data.success) {
            setSuccess(true);
            setFormData({
              companyName: "", contactPerson: "", phone: "", email: "", website: "",
              packageType: "Sponsored News Article", packagePrice: 8000, videoPackage: "None",
              videoCharge: 0, preferredPlacement: "homepage_sponsored", durationDays: 7,
              preferredPublishDate: "", eventDetails: "", description: "", videoUrl: "",
              optionType: "Option 1", language: "ta"
            });
            setFiles({ logo: null, image: null, video: null, documents: null });
          } else {
            setError("Sandbox கட்டணச் சரிபார்ப்பு தோல்வியடைந்தது. மீண்டும் முயற்சிக்கவும்.");
          }
        } else {
          const rzpLoaded = await loadRazorpayScript();
          if (!rzpLoaded) {
            setError("Razorpay SDK ஏற்றப்படவில்லை. உங்கள் இணைய இணைப்பைச் சரிபார்க்கவும்.");
            setLoading(false);
            return;
          }

          let readerData = {};
          try {
            readerData = JSON.parse(localStorage.getItem("readerData") || "{}");
          } catch (e) {}

          const options = {
            key,
            amount,
            currency,
            name: "NewsGhuru Sponsorship",
            description: comboName ? `Combo Campaign: ${comboName}` : `Sponsored Article: ${formData.packageType}`,
            image: `${window.location.origin}/NEWS GHURU LOGO English.png`,
            order_id: orderId,
            handler: async function (response) {
              try {
                const verifyRoute = comboName ? "/api/sponsored/combo/verify-payment" : "/api/sponsored/verify-payment";
                const verifyRes = await API.post(
                  verifyRoute,
                  {
                    requestId,
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_signature: response.razorpay_signature,
                  },
                  { headers: { Authorization: `Bearer ${token}` } }
                );

                if (verifyRes.data.success) {
                  setSuccess(true);
                  setFormData({
                    companyName: "", contactPerson: "", phone: "", email: "", website: "",
                    packageType: "Sponsored News Article", packagePrice: 8000, videoPackage: "None",
                    videoCharge: 0, preferredPlacement: "homepage_sponsored", durationDays: 7,
                    preferredPublishDate: "", eventDetails: "", description: "", videoUrl: "",
                    optionType: "Option 1", language: "ta"
                  });
                  setFiles({ logo: null, image: null, video: null, documents: null });
                } else {
                  setError("கட்டணச் சரிபார்ப்பு தோல்வியடைந்தது. ஆதரவைத் தொடர்பு கொள்ளவும்.");
                }
              } catch (err) {
                setError("கட்டணத்தை சர்வரில் சரிபார்க்க முடியவில்லை. ஆதரவைத் தொடர்பு கொள்ளவும்.");
              }
            },
            prefill: {
              name: readerData.name || formData.contactPerson,
              email: readerData.email || formData.email,
              contact: readerData.phone || formData.phone
            },
            theme: { color: "#ea580c" },
            modal: {
              ondismiss: function () {
                setError("கட்டணச் செயல்முறை ரத்து செய்யப்பட்டது.");
              }
            }
          };

          const rzp = new window.Razorpay(options);
          rzp.open();
        }
      }
    } catch (err) {
      console.error("Submit request error:", err);
      setError(err.response?.data?.message || "கோரிக்கையை சமர்ப்பிப்பதில் தோல்வி ஏற்பட்டது. பின்னர் மீண்டும் முயற்சிக்கவும்.");
    } finally {
      setLoading(false);
    }
  };

  const articlePackages = packages.filter((p) => !p.isVideoPackage && !p.isComboPackage);
  const videoPackages = packages.filter((p) => p.isVideoPackage);

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "40px 20px", fontFamily: "inherit" }}>
      
      <div style={{ background: "var(--bg-secondary, #fff)", padding: "35px", borderRadius: "20px", border: "1.5px solid var(--border-color, #e2e8f0)", boxShadow: "0 4px 25px rgba(0,0,0,0.04)" }}>
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <span style={{ background: "rgba(234, 88, 12, 0.1)", color: "var(--accent-orange, #ea580c)", padding: "4px 14px", borderRadius: "16px", fontWeight: "800", fontSize: "0.8rem", textTransform: "uppercase" }}>
            📋 ஸ்பான்சர் போர்ட்டல் (Sponsor Inquiry)
          </span>
          <h1 style={{ fontSize: "2.2rem", fontWeight: "900", margin: "10px 0 6px 0", color: "var(--text-primary, #0f172a)" }}>
            ஸ்பான்சர் கோரிக்கை படிவம்
          </h1>
          <p style={{ color: "var(--text-muted, #64748b)", fontSize: "0.95rem" }}>
            உங்கள் நிறுவன செய்திகள் அல்லது நிகழ்ச்சி விவரங்களைச் சமர்ப்பிக்கவும். எங்கள் செய்திப் பிரிவு கட்டுரையை உருவாக்கி நேரலை செய்யும்.
          </p>
        </div>

        {success && (
          <div style={{ background: "rgba(234, 88, 12, 0.08)", borderLeft: "4px solid var(--accent-orange, #ea580c)", color: "#9a3412", padding: "16px", borderRadius: "12px", marginBottom: "25px", display: "flex", alignItems: "center", gap: "12px" }}>
            <FiCheckCircle size={24} style={{ color: "var(--accent-orange, #ea580c)", flexShrink: 0 }} />
            <div>
              <strong style={{ display: "block" }}>விளம்பரக் கோரிக்கை வெற்றிகரமாகச் சமர்ப்பிக்கப்பட்டு, கட்டணம் செலுத்தப்பட்டது! 🎉</strong>
              <span style={{ fontSize: "14px" }}>எங்கள் குழு உங்களது தேவைகளை ஆய்வு செய்து விரைவில் செய்திப் பொறுப்பாளரை நியமிக்கும்.</span>
            </div>
          </div>
        )}

        {error && (
          <div style={{ background: "rgba(239, 68, 68, 0.08)", borderLeft: "4px solid #ef4444", color: "#b91c1c", padding: "16px", borderRadius: "12px", marginBottom: "25px", display: "flex", alignItems: "center", gap: "12px" }}>
            <FiAlertCircle size={24} style={{ color: "#ef4444", flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
          
          {/* COMBO PACKAGE CARD */}
          {comboName && (
            <div style={{ background: "rgba(234, 88, 12, 0.04)", border: "1.5px solid rgba(234, 88, 12, 0.25)", borderRadius: "16px", padding: "20px", marginBottom: "10px" }}>
              <div style={{ fontWeight: "800", color: "var(--accent-orange, #ea580c)", fontSize: "1.15rem", marginBottom: "6px" }}>தேர்வு செய்யப்பட்ட காம்போ திட்டம்: {comboName}</div>
              <div style={{ fontWeight: "900", color: "var(--accent-orange)", fontSize: "1.4rem", marginBottom: "14px" }}>கட்டணம்: ₹{comboPrice.toLocaleString()}</div>
              <div style={{ fontSize: "0.88rem", color: "var(--text-muted)" }}>
                <strong>அடங்கியுள்ள சேவைகள் (வாசிக்க மட்டும்):</strong>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "8px" }}>
                  {comboServices.map((s, i) => (
                    <span key={i} style={{ background: "rgba(234, 88, 12, 0.08)", color: "var(--accent-orange, #ea580c)", padding: "5px 12px", borderRadius: "15px", fontWeight: "700", fontSize: "0.78rem", border: "1px solid rgba(234, 88, 12, 0.15)" }}>{s}</span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* SECTION 1: SPONSOR INFO */}
          <div>
            <h3 style={{ fontSize: "1.1rem", fontWeight: "800", color: "var(--accent-orange)", borderBottom: "1px solid var(--border-color)", paddingBottom: "8px", marginBottom: "16px" }}>
              1. நிறுவனம் & தொடர்பு விவரங்கள்
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "16px" }}>
              <div>
                <label style={{ fontWeight: "700", display: "block", marginBottom: "6px", fontSize: "0.88rem" }}>நிறுவனத்தின் பெயர் *</label>
                <input type="text" value={formData.companyName} onChange={(e) => setFormData({ ...formData, companyName: e.target.value })} required placeholder="எ.கா. வேல் டெக் கல்லூரி" style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid #cbd5e1" }} />
              </div>
              <div>
                <label style={{ fontWeight: "700", display: "block", marginBottom: "6px", fontSize: "0.88rem" }}>தொடர்பு கொள்ள வேண்டியவர் *</label>
                <input type="text" value={formData.contactPerson} onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })} required placeholder="எ.கா. ராஜேஷ் ஆர்" style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid #cbd5e1" }} />
              </div>
              <div>
                <label style={{ fontWeight: "700", display: "block", marginBottom: "6px", fontSize: "0.88rem" }}>தொலைபேசி எண் *</label>
                <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} required placeholder="+91 9876543210" style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid #cbd5e1" }} />
              </div>
              <div>
                <label style={{ fontWeight: "700", display: "block", marginBottom: "6px", fontSize: "0.88rem" }}>மின்னஞ்சல் முகவரி *</label>
                <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required placeholder="info@company.com" style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid #cbd5e1" }} />
              </div>
              <div style={{ gridColumn: "span 2" }}>
                <label style={{ fontWeight: "700", display: "block", marginBottom: "6px", fontSize: "0.88rem" }}>இணையதள முகவரி</label>
                <input type="url" value={formData.website} onChange={(e) => setFormData({ ...formData, website: e.target.value })} placeholder="https://www.company.com" style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid #cbd5e1" }} />
              </div>
            </div>
          </div>

          {/* SECTION 2: SELECTION & PLACEMENT */}
          <div>
            <h3 style={{ fontSize: "1.1rem", fontWeight: "800", color: "var(--accent-orange)", borderBottom: "1px solid var(--border-color)", paddingBottom: "8px", marginBottom: "16px" }}>
              2. திட்டம், பணிப்பாய்வு & விளம்பர இடத்தேர்வு
            </h3>
            
            {comboName ? (
              // COMBO: show locked package info + placement — no dropdown needed
              <>
                <div style={{ background: "rgba(0,0,0,0.02)", padding: "16px", borderRadius: "10px", border: "1px solid var(--border-color)", marginBottom: "16px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div>
                    <span style={{ fontWeight: "700", display: "block", fontSize: "0.85rem", color: "var(--text-muted)" }}>தேர்வு செய்யப்பட்ட திட்டம்</span>
                    <span style={{ fontSize: "1.05rem", fontWeight: "800" }}>{comboName} Combo (₹{comboPrice.toLocaleString()})</span>
                  </div>
                  <div>
                    <span style={{ fontWeight: "700", display: "block", fontSize: "0.85rem", color: "var(--text-muted)" }}>விளம்பர பரவல்</span>
                    <span style={{ fontSize: "1.05rem", fontWeight: "800" }}>{COMBO_PLACEMENT_CONFIG[comboName]?.coverage || ""}</span>
                  </div>
                </div>

                {/* Locked placement display for combo */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "16px", marginBottom: "4px" }}>
                  <div>
                    <label style={{ fontWeight: "700", display: "block", marginBottom: "6px", fontSize: "0.88rem" }}>விருப்பமான விளம்பர இடம்</label>
                    <div style={{ padding: "12px", borderRadius: "10px", border: "1.5px solid rgba(234,88,12,0.3)", background: "rgba(234,88,12,0.04)", fontWeight: "700", color: "var(--accent-orange)", fontSize: "0.92rem", display: "flex", alignItems: "center", gap: "8px" }}>
                      📍 {COMBO_PLACEMENT_CONFIG[comboName]?.label || "முகப்புப் பக்க ஸ்பான்சர் பிரிவு"}
                      <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: "500" }}>· {COMBO_PLACEMENT_CONFIG[comboName]?.durationDays} நாட்கள்</span>
                    </div>
                  </div>
                  <div>
                    <label style={{ fontWeight: "700", display: "block", marginBottom: "6px", fontSize: "0.88rem" }}>விருப்பமான வெளியீட்டு தேதி</label>
                    <input type="date" value={formData.preferredPublishDate} onChange={(e) => setFormData({ ...formData, preferredPublishDate: e.target.value })} style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid #cbd5e1" }} />
                  </div>
                </div>
              </>
            ) : (
              // STANDALONE: show full package selector + placement dropdown
              <>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "16px", marginBottom: "16px" }}>
                  <div>
                    <label style={{ fontWeight: "700", display: "block", marginBottom: "6px", fontSize: "0.88rem" }}>விருப்பமான செய்தித் திட்டம் *</label>
                    <select value={formData.packageType} onChange={handlePackageChange} style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid #cbd5e1" }}>
                      {articlePackages.map((p) => (
                        <option key={p.packageId} value={p.nameEn}>{p.nameTa || p.nameEn} (₹{p.price.toLocaleString()})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontWeight: "700", display: "block", marginBottom: "6px", fontSize: "0.88rem" }}>வீдео விளம்பரம் (விருப்பப்பட்டால்)</label>
                    <select value={formData.videoPackage} onChange={handleVideoPackageChange} style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid #cbd5e1" }}>
                      <option value="None">வீдео விளம்பரம் வேண்டாம்</option>
                      {videoPackages.map((vp) => (
                        <option key={vp.packageId} value={vp.nameEn}>{vp.nameTa || vp.nameEn} (+₹{vp.price.toLocaleString()})</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "16px" }}>
                  <div>
                    <label style={{ fontWeight: "700", display: "block", marginBottom: "6px", fontSize: "0.88rem" }}>விருப்பமான விளம்பர இடம்</label>
                    <select value={formData.preferredPlacement} onChange={(e) => setFormData({ ...formData, preferredPlacement: e.target.value })} style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid #cbd5e1" }}>
                      <option value="homepage_sponsored">முகப்புப் பக்க ஸ்பான்சர் பிரிவு</option>
                      <option value="category_sponsored">செய்திப் பிரிவு ஸ்பான்சர் பகுதி</option>
                      <option value="sidebar_widget">பக்கவாட்டு விளம்பரம் (Sidebar Widget)</option>
                      <option value="featured_banner">முகப்புப் பக்க விளம்பரப் பேனர்</option>
                      <option value="normal_feed">சாதாரண செய்தி வரிசை</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontWeight: "700", display: "block", marginBottom: "6px", fontSize: "0.88rem" }}>விருப்பமான வெளியீட்டு தேதி</label>
                    <input type="date" value={formData.preferredPublishDate} onChange={(e) => setFormData({ ...formData, preferredPublishDate: e.target.value })} style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid #cbd5e1" }} />
                  </div>
                </div>
              </>
            )}
          </div>

          {/* SECTION 3: MEDIA & DETAILS */}
          <div>
            <h3 style={{ fontSize: "1.1rem", fontWeight: "800", color: "var(--accent-orange)", borderBottom: "1px solid var(--border-color)", paddingBottom: "8px", marginBottom: "16px" }}>
              3. நிகழ்ச்சி விவரங்கள் & ஊடகக் கோப்புகள்
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ fontWeight: "700", display: "block", marginBottom: "6px", fontSize: "0.88rem" }}>
                  கட்டுரை உள்ளடக்கம் / சிறு குறிப்பு *
                </label>
                <textarea rows={4} value={formData.eventDetails} onChange={(e) => setFormData({ ...formData, eventDetails: e.target.value, description: e.target.value })} required placeholder="உங்களது செய்தி அறிக்கை, கட்டுரை உரை அல்லது செய்தி தயாரிப்பதற்கான நிகழ்ச்சி குறிப்புகளை இங்கே உள்ளிடவும்..." style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid #cbd5e1" }} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
                <div>
                  <label style={{ fontWeight: "700", display: "block", marginBottom: "6px", fontSize: "0.85rem" }}>
                    நிறுவன லோகோ (Logo) <span style={{ color: "#ea580c" }}>*</span>
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setFiles({ ...files, logo: e.target.files[0] })}
                    style={{ width: "100%", outline: !files.logo ? "2px solid rgba(234,88,12,0.3)" : "none", borderRadius: "6px" }}
                  />
                  {!files.logo && <span style={{ fontSize: "0.75rem", color: "#ea580c", marginTop: "3px", display: "block" }}>கட்டாயமானது</span>}
                </div>
                <div>
                  <label style={{ fontWeight: "700", display: "block", marginBottom: "6px", fontSize: "0.85rem" }}>
                    முகப்புப் படம் / பிராண்ட் பேனர் <span style={{ color: "#ea580c" }}>*</span>
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setFiles({ ...files, image: e.target.files[0] })}
                    style={{ width: "100%", outline: !files.image ? "2px solid rgba(234,88,12,0.3)" : "none", borderRadius: "6px" }}
                  />
                  {!files.image && <span style={{ fontSize: "0.75rem", color: "#ea580c", marginTop: "3px", display: "block" }}>கட்டாயமானது</span>}
                </div>
                <div>
                  <label style={{ fontWeight: "700", display: "block", marginBottom: "6px", fontSize: "0.85rem" }}>விளம்பர வீடியோ (MP4)</label>
                  <input type="file" accept="video/mp4" onChange={(e) => setFiles({ ...files, video: e.target.files[0] })} style={{ width: "100%" }} />
                </div>
                <div>
                  <label style={{ fontWeight: "700", display: "block", marginBottom: "6px", fontSize: "0.85rem" }}>
                    ஆவணங்கள் (PDF/Word) <span style={{ color: "#ea580c" }}>*</span>
                  </label>
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => setFiles({ ...files, documents: e.target.files })}
                    style={{ width: "100%", outline: (!files.documents || files.documents.length === 0) ? "2px solid rgba(234,88,12,0.3)" : "none", borderRadius: "6px" }}
                  />
                  {(!files.documents || files.documents.length === 0) && <span style={{ fontSize: "0.75rem", color: "#ea580c", marginTop: "3px", display: "block" }}>கட்டாயமானது</span>}
                </div>
              </div>
            </div>
          </div>

          <div style={{ textAlign: "center", marginTop: "15px" }}>
            <button
              type="submit"
              disabled={loading}
              style={{
                background: "linear-gradient(135deg, var(--accent-orange, #ea580c) 0%, #d97706 100%)",
                color: "#fff",
                padding: "16px 40px",
                borderRadius: "12px",
                fontWeight: "800",
                fontSize: "1.1rem",
                border: "none",
                cursor: loading ? "not-allowed" : "pointer",
                boxShadow: "0 6px 20px rgba(234,88,12,0.35)",
              }}
            >
              <FiSend /> {loading ? "கட்டணம் செலுத்த பரிசீலிக்கப்படுகிறது..." : "கட்டணம் செலுத்தி சமர்ப்பிக்கவும்"}
            </button>
          </div>

        </form>
      </div>

    </div>
  );
};

export default SponsoredRequestForm;

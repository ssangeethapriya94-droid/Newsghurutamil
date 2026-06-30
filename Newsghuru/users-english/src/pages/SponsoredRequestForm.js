import React, { useState, useEffect } from "react";
import API from "../config/api";
import { FiSend, FiCheckCircle, FiAlertCircle } from "react-icons/fi";
import useSEO from "../hooks/useSEO";
import "../styles/InfoPages.css";

// Combo placement config — locked per package based on the invoice
const COMBO_PLACEMENT_CONFIG = {
  "Starter":        { placement: "sidebar_widget",    durationDays: 7,  label: "Sidebar Sticky Widget",    coverage: "Sidebar Banner (7 Days)" },
  "Business Growth": { placement: "homepage_sponsored", durationDays: 15, label: "Homepage Sponsored Section", coverage: "Homepage Banner (15 Days)" },
  "Premium Brand":  { placement: "homepage_sponsored", durationDays: 30, label: "Homepage Sponsored Section", coverage: "Homepage Banner (30 Days)" },
};

const SponsoredRequestForm = () => {
  useSEO({
    title: "Sponsor Request Portal | Newsghuru",
    description: "Submit your corporate sponsorship or event details for publishing on Newsghuru.",
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
    language: "en"
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
      alert("Please log in as a reader/sponsor before submitting your request.");
      window.dispatchEvent(new CustomEvent("open-reader-login"));
      return;
    }

    if (!formData.companyName || !formData.contactPerson || !formData.phone || !formData.email) {
      setError("Please fill in all required contact details.");
      return;
    }

    // Mandatory file uploads
    if (!files.logo) {
      setError("Company Logo is required. Please upload your company logo before submitting.");
      return;
    }
    if (!files.image) {
      setError("Featured Image / Brand Banner is required. Please upload a featured image before submitting.");
      return;
    }
    if (!files.documents || files.documents.length === 0) {
      setError("Sponsor Documents (PDF/Word) are required. Please upload at least one document before submitting.");
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
              optionType: "Option 1", language: "en"
            });
            setFiles({ logo: null, image: null, video: null, documents: null });
          } else {
            setError("Sandbox payment simulation failed. Please try again.");
          }
        } else {
          const rzpLoaded = await loadRazorpayScript();
          if (!rzpLoaded) {
            setError("Failed to load Razorpay payment SDK. Check your network.");
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
            description: comboName ? `Combo Campaign Package: ${comboName}` : `Sponsored Article: ${formData.packageType}`,
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
                    optionType: "Option 1", language: "en"
                  });
                  setFiles({ logo: null, image: null, video: null, documents: null });
                } else {
                  setError("Payment verification failed. Contact support.");
                }
              } catch (err) {
                setError("Failed to verify payment on server. Contact support.");
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
                setError("Payment checkout was cancelled.");
              }
            }
          };

          const rzp = new window.Razorpay(options);
          rzp.open();
        }
      }
    } catch (err) {
      console.error("Submit request error:", err);
      setError(err.response?.data?.message || "Failed to submit request. Please try again.");
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
            📋 Sponsor Inquiry Portal
          </span>
          <h1 style={{ fontSize: "2.2rem", fontWeight: "900", margin: "10px 0 6px 0", color: "var(--text-primary, #0f172a)" }}>
            Sponsor Request Portal
          </h1>
          <p style={{ color: "var(--text-muted, #64748b)", fontSize: "0.95rem" }}>
            Submit your business or event details. Our editorial & reporting team will draft your coverage and publish upon approval.
          </p>
        </div>
        {success && (
          <div style={{ background: "rgba(234, 88, 12, 0.08)", borderLeft: "4px solid var(--accent-orange, #ea580c)", color: "#9a3412", padding: "16px", borderRadius: "12px", marginBottom: "25px", display: "flex", alignItems: "center", gap: "12px" }}>
            <FiCheckCircle size={24} style={{ color: "var(--accent-orange, #ea580c)", flexShrink: 0 }} />
            <div>
              <strong style={{ display: "block" }}>Sponsor Request Submitted Successfully! 🎉</strong>
              <span style={{ fontSize: "14px" }}>Our team will review your requirements and assign a dedicated reporter shortly.</span>
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
              <div style={{ fontWeight: "800", color: "var(--accent-orange, #ea580c)", fontSize: "1.15rem", marginBottom: "6px" }}>Selected Combo Package: {comboName}</div>
              <div style={{ fontWeight: "900", color: "var(--accent-orange)", fontSize: "1.4rem", marginBottom: "14px" }}>Price: ₹{comboPrice.toLocaleString()}</div>
              <div style={{ fontSize: "0.88rem", color: "var(--text-muted)" }}>
                <strong>Included Services (Read-only):</strong>
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
              1. Organization & Contact Details
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "16px" }}>
              <div>
                <label style={{ fontWeight: "700", display: "block", marginBottom: "6px", fontSize: "0.88rem" }}>Company / Institution Name *</label>
                <input type="text" value={formData.companyName} onChange={(e) => setFormData({ ...formData, companyName: e.target.value })} required placeholder="e.g. Vel Tech College" style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid #cbd5e1" }} />
              </div>
              <div>
                <label style={{ fontWeight: "700", display: "block", marginBottom: "6px", fontSize: "0.88rem" }}>Contact Person *</label>
                <input type="text" value={formData.contactPerson} onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })} required placeholder="e.g. Rahul R" style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid #cbd5e1" }} />
              </div>
              <div>
                <label style={{ fontWeight: "700", display: "block", marginBottom: "6px", fontSize: "0.88rem" }}>Phone Number *</label>
                <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} required placeholder="+91 9876543210" style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid #cbd5e1" }} />
              </div>
              <div>
                <label style={{ fontWeight: "700", display: "block", marginBottom: "6px", fontSize: "0.88rem" }}>Email Address *</label>
                <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required placeholder="info@company.com" style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid #cbd5e1" }} />
              </div>
              <div style={{ gridColumn: "span 2" }}>
                <label style={{ fontWeight: "700", display: "block", marginBottom: "6px", fontSize: "0.88rem" }}>Website URL</label>
                <input type="url" value={formData.website} onChange={(e) => setFormData({ ...formData, website: e.target.value })} placeholder="https://www.company.com" style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid #cbd5e1" }} />
              </div>
            </div>
          </div>

          {/* SECTION 2: SELECTION & PLACEMENT */}
          <div>
            <h3 style={{ fontSize: "1.1rem", fontWeight: "800", color: "var(--accent-orange)", borderBottom: "1px solid var(--border-color)", paddingBottom: "8px", marginBottom: "16px" }}>
              2. Package, Workflow & Placement Settings
            </h3>
            
            {comboName ? (
              // COMBO: show locked package info + placement — no dropdown needed
              <>
                <div style={{ background: "rgba(0,0,0,0.02)", padding: "16px", borderRadius: "10px", border: "1px solid var(--border-color)", marginBottom: "16px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div>
                    <span style={{ fontWeight: "700", display: "block", fontSize: "0.85rem", color: "var(--text-muted)" }}>Selected Package</span>
                    <span style={{ fontSize: "1.05rem", fontWeight: "800" }}>{comboName} Combo (₹{comboPrice.toLocaleString()})</span>
                  </div>
                  <div>
                    <span style={{ fontWeight: "700", display: "block", fontSize: "0.85rem", color: "var(--text-muted)" }}>Placement Coverage</span>
                    <span style={{ fontSize: "1.05rem", fontWeight: "800" }}>{COMBO_PLACEMENT_CONFIG[comboName]?.coverage || ""}</span>
                  </div>
                </div>

                {/* Locked placement display for combo */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "16px", marginBottom: "4px" }}>
                  <div>
                    <label style={{ fontWeight: "700", display: "block", marginBottom: "6px", fontSize: "0.88rem" }}>Preferred Placement</label>
                    <div style={{ padding: "12px", borderRadius: "10px", border: "1.5px solid rgba(234,88,12,0.3)", background: "rgba(234,88,12,0.04)", fontWeight: "700", color: "var(--accent-orange)", fontSize: "0.92rem", display: "flex", alignItems: "center", gap: "8px" }}>
                      📍 {COMBO_PLACEMENT_CONFIG[comboName]?.label || "Homepage Sponsored Section"}
                      <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: "500" }}>· {COMBO_PLACEMENT_CONFIG[comboName]?.durationDays} Days</span>
                    </div>
                  </div>
                  <div>
                    <label style={{ fontWeight: "700", display: "block", marginBottom: "6px", fontSize: "0.88rem" }}>Preferred Publish Date</label>
                    <input type="date" value={formData.preferredPublishDate} onChange={(e) => setFormData({ ...formData, preferredPublishDate: e.target.value })} style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid #cbd5e1" }} />
                  </div>
                </div>
              </>
            ) : (
              // STANDALONE: show full package selector + placement dropdown
              <>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "16px", marginBottom: "16px" }}>
                  <div>
                    <label style={{ fontWeight: "700", display: "block", marginBottom: "6px", fontSize: "0.88rem" }}>Preferred Article Package *</label>
                    <select value={formData.packageType} onChange={handlePackageChange} style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid #cbd5e1" }}>
                      {articlePackages.map((p) => (
                        <option key={p.packageId} value={p.nameEn}>{p.nameEn} (₹{p.price.toLocaleString()})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontWeight: "700", display: "block", marginBottom: "6px", fontSize: "0.88rem" }}>Optional Video Promotion</label>
                    <select value={formData.videoPackage} onChange={handleVideoPackageChange} style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid #cbd5e1" }}>
                      <option value="None">No Video Promotion</option>
                      {videoPackages.map((vp) => (
                        <option key={vp.packageId} value={vp.nameEn}>{vp.nameEn} (+₹{vp.price.toLocaleString()})</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "16px" }}>
                  <div>
                    <label style={{ fontWeight: "700", display: "block", marginBottom: "6px", fontSize: "0.88rem" }}>Preferred Placement</label>
                    <select value={formData.preferredPlacement} onChange={(e) => setFormData({ ...formData, preferredPlacement: e.target.value })} style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid #cbd5e1" }}>
                      <option value="homepage_sponsored">Homepage Sponsored Section</option>
                      <option value="category_sponsored">Category Sponsored Section</option>
                      <option value="sidebar_widget">Sidebar Sticky Widget</option>
                      <option value="featured_banner">Featured Sponsored Banner</option>
                      <option value="normal_feed">Normal News Feed</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontWeight: "700", display: "block", marginBottom: "6px", fontSize: "0.88rem" }}>Preferred Publish Date</label>
                    <input type="date" value={formData.preferredPublishDate} onChange={(e) => setFormData({ ...formData, preferredPublishDate: e.target.value })} style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid #cbd5e1" }} />
                  </div>
                </div>
              </>
            )}
          </div>

          {/* SECTION 3: MEDIA & DETAILS */}
          <div>
            <h3 style={{ fontSize: "1.1rem", fontWeight: "800", color: "var(--accent-orange)", borderBottom: "1px solid var(--border-color)", paddingBottom: "8px", marginBottom: "16px" }}>
              3. Event Details & Media Assets
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ fontWeight: "700", display: "block", marginBottom: "6px", fontSize: "0.88rem" }}>
                  Article Content / Brief Description *
                </label>
                <textarea rows={4} value={formData.eventDetails} onChange={(e) => setFormData({ ...formData, eventDetails: e.target.value, description: e.target.value })} required placeholder="Enter your ready-made article content, press release, or brief event highlights for coverage..." style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid #cbd5e1" }} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
                <div>
                  <label style={{ fontWeight: "700", display: "block", marginBottom: "6px", fontSize: "0.85rem" }}>
                    Company Logo <span style={{ color: "#ea580c" }}>*</span>
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setFiles({ ...files, logo: e.target.files[0] })}
                    style={{ width: "100%", outline: !files.logo ? "2px solid rgba(234,88,12,0.3)" : "none", borderRadius: "6px" }}
                  />
                  {!files.logo && <span style={{ fontSize: "0.75rem", color: "#ea580c", marginTop: "3px", display: "block" }}>Required</span>}
                </div>
                <div>
                  <label style={{ fontWeight: "700", display: "block", marginBottom: "6px", fontSize: "0.85rem" }}>
                    Featured Image / Brand Banner <span style={{ color: "#ea580c" }}>*</span>
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setFiles({ ...files, image: e.target.files[0] })}
                    style={{ width: "100%", outline: !files.image ? "2px solid rgba(234,88,12,0.3)" : "none", borderRadius: "6px" }}
                  />
                  {!files.image && <span style={{ fontSize: "0.75rem", color: "#ea580c", marginTop: "3px", display: "block" }}>Required</span>}
                </div>
                <div>
                  <label style={{ fontWeight: "700", display: "block", marginBottom: "6px", fontSize: "0.85rem" }}>Promotional Video (MP4)</label>
                  <input type="file" accept="video/mp4" onChange={(e) => setFiles({ ...files, video: e.target.files[0] })} style={{ width: "100%" }} />
                </div>
                <div>
                  <label style={{ fontWeight: "700", display: "block", marginBottom: "6px", fontSize: "0.85rem" }}>
                    Sponsor Documents (PDF/Word) <span style={{ color: "#ea580c" }}>*</span>
                  </label>
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => setFiles({ ...files, documents: e.target.files })}
                    style={{ width: "100%", outline: (!files.documents || files.documents.length === 0) ? "2px solid rgba(234,88,12,0.3)" : "none", borderRadius: "6px" }}
                  />
                  {(!files.documents || files.documents.length === 0) && <span style={{ fontSize: "0.75rem", color: "#ea580c", marginTop: "3px", display: "block" }}>Required</span>}
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
              <FiSend /> {loading ? "Processing Payment Checkout..." : "Pay & Submit Request"}
            </button>
          </div>

        </form>
      </div>

    </div>
  );
};

export default SponsoredRequestForm;

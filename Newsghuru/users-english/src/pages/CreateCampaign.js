import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../config/api";
import { 
  FaCreditCard, FaWallet, FaArrowLeft, FaExclamationTriangle, 
  FaSpinner, FaCheckCircle, FaCloudUploadAlt, FaRocket, FaRegCheckCircle
} from "react-icons/fa";
import "../styles/CategoryPage.css";

const SLOT_DIMENSIONS = {
  TOP_BANNER: "970 × 250 px",
  HEADER_BANNER: "970 × 90 px",
  SECTION_BANNER: "728 × 90 px",
  FLOATING_ADVERTISEMENT: "300 × 250 px",
  SIDEBAR: "300 × 250 px",
  FOOTER_BANNER: "970 × 90 px",
  POPUP_ADVERTISEMENT: "600 × 500 px"
};

const CreateCampaign = ({ openLoginPopup }) => {
  const navigate = useNavigate();
  const readerData = (() => {
    try {
      const d = localStorage.getItem("readerData");
      return d ? JSON.parse(d) : null;
    } catch (e) { return null; }
  })();

  const [walletBalance, setWalletBalance] = useState(0);
  const [formData, setFormData] = useState({
    title: "",
    advertiserName: readerData?.name || "",
    advertiserEmail: readerData?.email || "",
    advertiserPhone: readerData?.phone || "",
    companyName: "",
    description: "",
    targetUrl: "",
    position: "TOP_BANNER",
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    language: "both",
    paymentMethod: "Razorpay"
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [slotPricingList, setSlotPricingList] = useState([
    { id: "TOP_BANNER", name: "Top / Hero Banner", priceWeekly: 19999, priceMonthly: 74999, desc: "High visibility hero banner located right above the main news content feed.", badge: "Most Popular" },
    { id: "HEADER_BANNER", name: "Header Banner", priceWeekly: 14999, priceMonthly: 44999, desc: "Prime position at the top header of every page for maximum brand visibility.", badge: "Top Value" },
    { id: "SECTION_BANNER", name: "Section Banner", priceWeekly: 7499, priceMonthly: 19999, desc: "Embedded within news category feeds and article reader pages.", badge: "Category Feed" },
    { id: "FLOATING_ADVERTISEMENT", name: "Floating Bar", priceWeekly: 17999, priceMonthly: 54999, desc: "Fixed sticky bar attached at the bottom of mobile & desktop views.", badge: "High Engagement" },
    { id: "SIDEBAR", name: "Sidebar Widget", priceWeekly: 7499, priceMonthly: 19999, desc: "Persistent sticky widget on desktop reader sidebars.", badge: "Steady Reach" },
    { id: "FOOTER_BANNER", name: "Footer Banner", priceWeekly: 4999, priceMonthly: 11999, desc: "Prominent ad placement situated at the bottom footer of every page.", badge: "Budget Friendly" },
    { id: "POPUP_ADVERTISEMENT", name: "Popup Advertisement", priceWeekly: 20000, priceMonthly: 0, desc: "Full-attention modal popup presented when readers open the portal (Weekly Only).", badge: "Direct Impact" }
  ]);

  useEffect(() => {
    API.get("/api/ads/pricing/all").then(res => {
      if (res.data.success && res.data.pricing && res.data.pricing.length > 0) {
        const mapped = res.data.pricing.map(p => ({
          id: p.slotId,
          name: p.nameEn || p.nameTa,
          priceWeekly: p.priceWeekly !== undefined && p.priceWeekly !== null ? p.priceWeekly : (p.price || 5000),
          priceMonthly: p.priceMonthly || 0,
          desc: p.descEn || p.descTa,
          badge: p.badgeEn || p.badgeTa || "Featured"
        }));
        setSlotPricingList(mapped);
      }
    }).catch(err => console.error("Error fetching live slot pricing", err));

    const activeToken = localStorage.getItem("readerToken");
    if (activeToken) {
      API.get("/api/ads/user-campaigns/my?language=en", {
        headers: { Authorization: `Bearer ${activeToken}` }
      }).then(res => {
        if (res.data.success) setWalletBalance(res.data.walletBalance || 0);
      }).catch(err => console.error(err));
    }
  }, []);

  const selectedSlot = slotPricingList.find(s => s.id === formData.position) || slotPricingList[0];

  const getSlotPrice = (slot, pkg) => {
    if (!slot) return 5000;
    if (pkg === "monthly" && slot.priceMonthly > 0 && slot.id !== "POPUP_ADVERTISEMENT") {
      return slot.priceMonthly;
    }
    return slot.priceWeekly !== undefined && slot.priceWeekly !== null ? slot.priceWeekly : (slot.price || 5000);
  };

  const currentPayableAmount = getSlotPrice(selectedSlot, formData.durationPackage || "weekly");

  const handleSlotSelect = (slotId) => {
    let nextPkg = formData.durationPackage || "weekly";
    if (slotId === "POPUP_ADVERTISEMENT") {
      nextPkg = "weekly";
    }
    const days = nextPkg === "monthly" ? 30 : 7;
    const start = new Date(formData.startDate || Date.now());
    const end = new Date(start.getTime() + days * 24 * 60 * 60 * 1000);
    setFormData(prev => ({
      ...prev,
      position: slotId,
      durationPackage: nextPkg,
      endDate: end.toISOString().split("T")[0]
    }));
  };

  const handleDurationSelect = (pkg) => {
    let nextPos = formData.position;
    if (pkg === "monthly" && formData.position === "POPUP_ADVERTISEMENT") {
      nextPos = "TOP_BANNER";
    }
    const days = pkg === "monthly" ? 30 : 7;
    const start = new Date(formData.startDate || Date.now());
    const end = new Date(start.getTime() + days * 24 * 60 * 60 * 1000);
    setFormData(prev => ({
      ...prev,
      position: nextPos,
      durationPackage: pkg,
      endDate: end.toISOString().split("T")[0]
    }));
  };

  const handleStartDateChange = (newStartDate) => {
    const days = formData.durationPackage === "monthly" ? 30 : 7;
    const start = new Date(newStartDate || Date.now());
    const end = new Date(start.getTime() + days * 24 * 60 * 60 * 1000);
    setFormData(prev => ({
      ...prev,
      startDate: newStartDate,
      endDate: end.toISOString().split("T")[0]
    }));
  };

  const activeDurationDays = formData.durationPackage === "monthly" ? 30 : 7;

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setError("");
    }
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
    if (e && e.preventDefault) e.preventDefault();
    setError("");

    const activeToken = localStorage.getItem("readerToken");
    if (!activeToken) {
      window.dispatchEvent(new CustomEvent("open-reader-login"));
      if (openLoginPopup) openLoginPopup();
      setError("Please login first to proceed with payment.");
      return;
    }

    if (!formData.title.trim()) {
      setError("Please enter a Campaign Title.");
      return;
    }
    if (!formData.advertiserName.trim()) {
      setError("Please enter Advertiser Name.");
      return;
    }
    if (!formData.advertiserEmail.trim()) {
      setError("Please enter Contact Email.");
      return;
    }
    if (!formData.targetUrl.trim()) {
      setError("Please enter Target Click URL.");
      return;
    }
    if (!imageFile && !imagePreview) {
      setError("Please upload a banner image.");
      return;
    }

    let finalTargetUrl = formData.targetUrl.trim();
    if (!finalTargetUrl.startsWith("http://") && !finalTargetUrl.startsWith("https://")) {
      finalTargetUrl = "https://" + finalTargetUrl;
    }

    try {
      setLoading(true);

      const submitData = new FormData();
      Object.keys(formData).forEach(key => {
        if (key === "targetUrl") {
          submitData.append(key, finalTargetUrl);
        } else {
          submitData.append(key, formData[key]);
        }
      });
      submitData.append("calculatedAmount", currentPayableAmount);
      if (imageFile) {
        submitData.append("image", imageFile);
      } else if (imagePreview) {
        submitData.append("image", imagePreview);
      }

      const res = await API.post("/api/ads/user-campaigns/create", submitData, {
        headers: {
          Authorization: `Bearer ${activeToken}`,
          "Content-Type": "multipart/form-data"
        }
      });

      if (res.data.success) {
        if (res.data.isWalletPayment) {
          alert("🎉 Campaign submitted successfully using Wallet balance! Awaiting Admin approval.");
          navigate("/campaigns");
          return;
        }

        const isScriptLoaded = await loadRazorpayScript();
        if (!isScriptLoaded && !res.data.isMock) {
          alert("Failed to load Razorpay SDK. Please check internet connection.");
          setLoading(false);
          return;
        }

        if (res.data.isMock || !window.Razorpay) {
          const mockVerify = await API.post("/api/ads/user-campaigns/verify-payment", {
            adId: res.data.adId,
            isMock: true
          }, { headers: { Authorization: `Bearer ${activeToken}` } });

          if (mockVerify.data.success) {
            alert("🎉 Mock payment successful! Your campaign is now awaiting Admin approval.");
            navigate("/campaigns");
          } else {
            setError(mockVerify.data.message || "Error verifying payment.");
          }
        } else {
          const options = {
            key: res.data.key,
            amount: res.data.amount,
            currency: res.data.currency,
            name: "NewsGhuru Ad Campaign",
            description: `Campaign Hosting: ${selectedSlot.name}`,
            order_id: res.data.orderId,
            handler: async function (response) {
              try {
                const verifyRes = await API.post("/api/ads/user-campaigns/verify-payment", {
                  adId: res.data.adId,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature
                }, { headers: { Authorization: `Bearer ${activeToken}` } });

                if (verifyRes.data.success) {
                  alert("🎉 Payment successful! Your campaign is now awaiting Admin approval.");
                  navigate("/campaigns");
                } else {
                  alert("Payment verification error: " + (verifyRes.data.message || ""));
                }
              } catch (vErr) {
                console.error("Verify err:", vErr);
                alert("Payment verification error.");
              } finally {
                setLoading(false);
              }
            },
            modal: {
              ondismiss: function () {
                setLoading(false);
              }
            },
            prefill: {
              name: formData.advertiserName,
              email: formData.advertiserEmail,
              contact: formData.advertiserPhone
            },
            theme: { color: "#ea580c" }
          };
          const rzp = new window.Razorpay(options);
          rzp.open();
        }
      } else {
        setError(res.data.message || "Failed to submit campaign.");
        setLoading(false);
      }
    } catch (err) {
      console.error("Submit campaign error:", err);
      setError(err.response?.data?.message || "Failed to submit campaign. Please check input fields.");
      setLoading(false);
    }
  };

  return (
    <div className="cat-page-container" style={{ padding: "40px 20px", maxWidth: "980px", margin: "0 auto", fontFamily: "var(--font-sans, system-ui)" }}>
      {/* BACK NAVIGATION */}
      <button 
        onClick={() => navigate("/campaigns")} 
        style={{ 
          background: "none", 
          border: "none", 
          color: "#ea580c", 
          fontWeight: "700", 
          fontSize: "0.95rem",
          cursor: "pointer", 
          display: "inline-flex", 
          alignItems: "center", 
          gap: "8px", 
          marginBottom: "25px",
          transition: "transform 0.2s ease"
        }}
        onMouseOver={(e) => e.currentTarget.style.transform = "translateX(-4px)"}
        onMouseOut={(e) => e.currentTarget.style.transform = "translateX(0)"}
      >
        <FaArrowLeft /> Back to My Campaigns
      </button>

      {/* HERO CARD CONTAINER */}
      <div className="campaign-studio-card">
        
        {/* HERO TITLE BLOCK */}
        <div style={{ borderBottom: "1px solid var(--border-color, #f1f5f9)", paddingBottom: "30px", marginBottom: "35px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(234, 88, 12, 0.1)", color: "#ea580c", padding: "6px 16px", borderRadius: "20px", fontWeight: "700", fontSize: "0.85rem", marginBottom: "12px" }}>
            <FaRocket /> Self-Service Campaign Studio
          </div>
          <h1 style={{ fontSize: "2.2rem", fontWeight: "800", margin: "0 0 10px 0", color: "var(--text-primary, #0f172a)", letterSpacing: "-0.5px" }}>
            Create New Advertisement Campaign
          </h1>
          <p style={{ color: "var(--text-muted, #64748b)", fontSize: "1rem", margin: 0, maxWidth: "700px", lineHeight: "1.6" }}>
            Launch your targeted brand advertisement in front of thousands of readers. Follow our 3-step studio below to select your slot, choose your hosting duration, and complete instant checkout.
          </p>
        </div>

        {/* ERROR NOTIFICATION BANNER */}
        {error && (
          <div style={{ padding: "16px 20px", background: "#fef2f2", borderLeft: "5px solid #ef4444", color: "#991b1b", borderRadius: "12px", marginBottom: "30px", display: "flex", alignItems: "center", gap: "12px", fontWeight: "600", fontSize: "0.95rem", boxShadow: "0 4px 12px rgba(239,68,68,0.1)" }}>
            <FaExclamationTriangle style={{ fontSize: "1.3rem", flexShrink: 0 }} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "35px" }}>
          
          {/* STEP 1: SLOT SELECTION & DURATION */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "18px" }}>
              <span style={{ background: "linear-gradient(135deg, #ea580c, #d97706)", color: "#fff", width: "32px", height: "32px", borderRadius: "50%", display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: "800", fontSize: "0.95rem", boxShadow: "0 4px 10px rgba(234,88,12,0.3)" }}>1</span>
              <h2 style={{ fontWeight: "800", fontSize: "1.2rem", margin: 0, color: "var(--text-primary, #0f172a)" }}>
                Select Hosting Duration & Advertisement Placement
              </h2>
            </div>

            {/* DURATION SELECTION PACKAGES AT TOP OF STEP 1 */}
            <div style={{ background: "var(--bg-secondary, #f8fafc)", border: "1.5px solid var(--border-color, #cbd5e1)", borderRadius: "16px", padding: "20px", marginBottom: "25px" }}>
              <label style={{ fontSize: "0.95rem", fontWeight: "800", display: "block", marginBottom: "12px", color: "var(--text-primary, #0f172a)" }}>
                🗓️ Choose Campaign Hosting Duration Plan:
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px" }}>
                <div 
                  onClick={() => handleDurationSelect("weekly")}
                  style={{
                    padding: "18px",
                    borderRadius: "14px",
                    border: (formData.durationPackage || "weekly") === "weekly" ? "2.5px solid #ea580c" : "1.5px solid #cbd5e1",
                    background: (formData.durationPackage || "weekly") === "weekly" ? "rgba(234, 88, 12, 0.08)" : "#fff",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "14px",
                    transition: "all 0.2s ease",
                    boxShadow: (formData.durationPackage || "weekly") === "weekly" ? "0 4px 15px rgba(234, 88, 12, 0.15)" : "none"
                  }}
                >
                  <input type="radio" checked={(formData.durationPackage || "weekly") === "weekly"} onChange={() => handleDurationSelect("weekly")} style={{ accentColor: "#ea580c", transform: "scale(1.2)" }} />
                  <div>
                    <strong style={{ display: "block", fontSize: "1rem", color: "#0f172a", fontWeight: "800" }}>Weekly Plan (7 Days)</strong>
                    <span style={{ fontSize: "0.85rem", color: "#64748b" }}>Shows 7-day hosting rates for banner slots</span>
                  </div>
                </div>

                <div 
                  onClick={() => handleDurationSelect("monthly")}
                  style={{
                    padding: "18px",
                    borderRadius: "14px",
                    border: formData.durationPackage === "monthly" ? "2.5px solid #ea580c" : "1.5px solid #cbd5e1",
                    background: formData.durationPackage === "monthly" ? "rgba(234, 88, 12, 0.08)" : "#fff",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "14px",
                    transition: "all 0.2s ease",
                    boxShadow: formData.durationPackage === "monthly" ? "0 4px 15px rgba(234, 88, 12, 0.15)" : "none"
                  }}
                >
                  <input type="radio" checked={formData.durationPackage === "monthly"} onChange={() => handleDurationSelect("monthly")} style={{ accentColor: "#ea580c", transform: "scale(1.2)" }} />
                  <div>
                    <strong style={{ display: "block", fontSize: "1rem", color: "#0f172a", fontWeight: "800" }}>Monthly Plan (30 Days)</strong>
                    <span style={{ fontSize: "0.85rem", color: "#64748b" }}>Shows 30-day hosting rates for banner slots</span>
                  </div>
                </div>
              </div>
            </div>

            {/* BANNER PLACEMENT CARDS GRID */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "18px" }}>
              {slotPricingList
                .filter(slot => !(formData.durationPackage === "monthly" && slot.id === "POPUP_ADVERTISEMENT"))
                .map((slot) => {
                  const isSelected = formData.position === slot.id;
                  const isMonthly = formData.durationPackage === "monthly";
                  const slotWeeklyPrice = slot.priceWeekly !== undefined && slot.priceWeekly !== null ? slot.priceWeekly : (slot.price || 5000);
                  const slotMonthlyPrice = slot.priceMonthly || 0;
                  
                  return (
                    <div
                      key={slot.id}
                      onClick={() => handleSlotSelect(slot.id)}
                      style={{
                        border: isSelected ? "2.5px solid #ea580c" : "1.5px solid var(--border-color, #e2e8f0)",
                        background: isSelected ? "rgba(234, 88, 12, 0.04)" : "var(--bg-secondary, #ffffff)",
                        borderRadius: "16px",
                        padding: "20px",
                        cursor: "pointer",
                        transition: "all 0.25s ease",
                        position: "relative",
                        boxShadow: isSelected ? "0 10px 25px rgba(234,88,12,0.15)" : "none",
                        transform: isSelected ? "translateY(-2px)" : "none"
                      }}
                    >
                      {isSelected && (
                        <div style={{ position: "absolute", top: "16px", right: "16px", color: "#ea580c", fontSize: "1.2rem" }}>
                          <FaCheckCircle />
                        </div>
                      )}
                      
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px", marginBottom: "10px" }}>
                        <div style={{ background: isSelected ? "#ea580c" : "#f1f5f9", color: isSelected ? "#fff" : "#475569", padding: "3px 10px", borderRadius: "12px", fontSize: "0.72rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                          {slot.badge}
                        </div>
                        <div style={{ background: "rgba(234, 88, 12, 0.1)", color: "#ea580c", padding: "3px 8px", borderRadius: "8px", fontSize: "0.75rem", fontWeight: "800" }}>
                          📐 {SLOT_DIMENSIONS[slot.id] || "970 × 250 px"}
                        </div>
                      </div>

                      <h3 style={{ fontWeight: "800", fontSize: "1.05rem", margin: "0 0 6px 0", color: "var(--text-primary, #0f172a)" }}>
                        {slot.name}
                      </h3>
                      
                      {/* SHOW ONLY ACTIVE DURATION PACKAGE AMOUNT */}
                      {isMonthly ? (
                        <div style={{ fontSize: "1.35rem", fontWeight: "800", color: "#ea580c", marginBottom: "8px" }}>
                          Monthly: ₹{slotMonthlyPrice.toLocaleString()}
                        </div>
                      ) : (
                        <div style={{ fontSize: "1.35rem", fontWeight: "800", color: "#ea580c", marginBottom: "8px" }}>
                          Weekly: ₹{slotWeeklyPrice.toLocaleString()}
                        </div>
                      )}
                      
                      <p style={{ fontSize: "0.82rem", color: "var(--text-muted, #64748b)", margin: 0, lineHeight: "1.5" }}>
                        {slot.desc}
                      </p>
                    </div>
                  );
                })}
            </div>
          </div>

          <hr style={{ border: "none", borderTop: "1px solid var(--border-color, #f1f5f9)" }} />

          {/* STEP 2: CAMPAIGN DETAILS */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
              <span style={{ background: "linear-gradient(135deg, #ea580c, #d97706)", color: "#fff", width: "32px", height: "32px", borderRadius: "50%", display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: "800", fontSize: "0.95rem", boxShadow: "0 4px 10px rgba(234,88,12,0.3)" }}>2</span>
              <h2 style={{ fontWeight: "800", fontSize: "1.2rem", margin: 0, color: "var(--text-primary, #0f172a)" }}>
                Campaign Creative & Advertiser Contact Details
              </h2>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "20px", marginBottom: "25px" }}>
              <div>
                <label style={{ fontSize: "0.88rem", fontWeight: "700", display: "block", marginBottom: "8px", color: "var(--text-primary, #1e293b)" }}>Campaign Title *</label>
                <input type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="e.g. Summer Special Offer 2026" style={{ width: "100%", padding: "12px 16px", borderRadius: "10px", border: "1.5px solid var(--border-color, #cbd5e1)", background: "var(--bg-secondary, #fff)", color: "var(--text-primary, #000)", fontSize: "0.95rem", outline: "none", boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ fontSize: "0.88rem", fontWeight: "700", display: "block", marginBottom: "8px", color: "var(--text-primary, #1e293b)" }}>Company / Business Name</label>
                <input type="text" value={formData.companyName} onChange={e => setFormData({ ...formData, companyName: e.target.value })} placeholder="e.g. TechCorp Solutions" style={{ width: "100%", padding: "12px 16px", borderRadius: "10px", border: "1.5px solid var(--border-color, #cbd5e1)", background: "var(--bg-secondary, #fff)", color: "var(--text-primary, #000)", fontSize: "0.95rem", outline: "none", boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ fontSize: "0.88rem", fontWeight: "700", display: "block", marginBottom: "8px", color: "var(--text-primary, #1e293b)" }}>Advertiser Contact Name *</label>
                <input type="text" value={formData.advertiserName} onChange={e => setFormData({ ...formData, advertiserName: e.target.value })} style={{ width: "100%", padding: "12px 16px", borderRadius: "10px", border: "1.5px solid var(--border-color, #cbd5e1)", background: "var(--bg-secondary, #fff)", color: "var(--text-primary, #000)", fontSize: "0.95rem", outline: "none", boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ fontSize: "0.88rem", fontWeight: "700", display: "block", marginBottom: "8px", color: "var(--text-primary, #1e293b)" }}>Contact Email Address *</label>
                <input type="email" value={formData.advertiserEmail} onChange={e => setFormData({ ...formData, advertiserEmail: e.target.value })} style={{ width: "100%", padding: "12px 16px", borderRadius: "10px", border: "1.5px solid var(--border-color, #cbd5e1)", background: "var(--bg-secondary, #fff)", color: "var(--text-primary, #000)", fontSize: "0.95rem", outline: "none", boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ fontSize: "0.88rem", fontWeight: "700", display: "block", marginBottom: "8px", color: "var(--text-primary, #1e293b)" }}>Contact Phone Number</label>
                <input type="text" value={formData.advertiserPhone} onChange={e => setFormData({ ...formData, advertiserPhone: e.target.value })} placeholder="+91 9876543210" style={{ width: "100%", padding: "12px 16px", borderRadius: "10px", border: "1.5px solid var(--border-color, #cbd5e1)", background: "var(--bg-secondary, #fff)", color: "var(--text-primary, #000)", fontSize: "0.95rem", outline: "none", boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ fontSize: "0.88rem", fontWeight: "700", display: "block", marginBottom: "8px", color: "var(--text-primary, #1e293b)" }}>Target Click Destination URL *</label>
                <input type="text" value={formData.targetUrl} onChange={e => setFormData({ ...formData, targetUrl: e.target.value })} placeholder="https://yourwebsite.com/landing" style={{ width: "100%", padding: "12px 16px", borderRadius: "10px", border: "1.5px solid var(--border-color, #cbd5e1)", background: "var(--bg-secondary, #fff)", color: "var(--text-primary, #000)", fontSize: "0.95rem", outline: "none", boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ fontSize: "0.88rem", fontWeight: "700", display: "block", marginBottom: "8px", color: "var(--text-primary, #1e293b)" }}>Campaign Start Date *</label>
                <input type="date" value={formData.startDate} onChange={e => handleStartDateChange(e.target.value)} style={{ width: "100%", padding: "12px 16px", borderRadius: "10px", border: "1.5px solid var(--border-color, #cbd5e1)", background: "var(--bg-secondary, #fff)", color: "var(--text-primary, #000)", fontSize: "0.95rem", outline: "none", boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ fontSize: "0.88rem", fontWeight: "700", display: "block", marginBottom: "8px", color: "var(--text-primary, #1e293b)" }}>Campaign End Date ({formData.durationPackage === "monthly" ? "30 Days Fixed" : "7 Days Fixed"}) *</label>
                <input type="date" value={formData.endDate} readOnly disabled style={{ width: "100%", padding: "12px 16px", borderRadius: "10px", border: "1.5px solid var(--border-color, #cbd5e1)", background: "#f1f5f9", color: "#64748b", fontSize: "0.95rem", outline: "none", boxSizing: "border-box", cursor: "not-allowed" }} />
              </div>
            </div>

            {/* BANNER UPLOAD ZONE */}
            <div style={{ background: "rgba(248, 250, 252, 0.8)", border: "2px dashed #cbd5e1", borderRadius: "16px", padding: "25px", textAlign: "center" }}>
              <FaCloudUploadAlt style={{ fontSize: "2.5rem", color: "#ea580c", marginBottom: "10px" }} />
              <h4 style={{ margin: "0 0 5px 0", fontWeight: "700", fontSize: "1rem" }}>Upload Advertisement Banner Image *</h4>
              <p style={{ color: "#64748b", fontSize: "0.85rem", margin: "0 0 10px 0" }}>
                Recommended dimensions for <strong>{selectedSlot.name}</strong>: <span style={{ color: "#ea580c", fontWeight: "800" }}>📐 {SLOT_DIMENSIONS[selectedSlot.id] || "970 × 250 px"}</span>
              </p>
              <p style={{ color: "#94a3b8", fontSize: "0.8rem", margin: "0 0 15px 0" }}>PNG, JPG, or WEBP formats supported (High resolution recommended)</p>
              <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: "none" }} id="banner-upload-input" />
              <label htmlFor="banner-upload-input" style={{ background: "#ea580c", color: "#fff", padding: "10px 20px", borderRadius: "20px", fontWeight: "700", fontSize: "0.88rem", cursor: "pointer", display: "inline-block", boxShadow: "0 4px 12px rgba(234,88,12,0.3)" }}>
                Choose File from Computer
              </label>

              {imagePreview && (
                <div style={{ marginTop: "20px", display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <span style={{ fontSize: "0.82rem", fontWeight: "700", color: "#166534", marginBottom: "8px", display: "inline-flex", alignItems: "center", gap: "5px" }}><FaRegCheckCircle /> Image Uploaded Ready for Campaign</span>
                  <div style={{ maxWidth: "340px", borderRadius: "12px", overflow: "hidden", border: "2px solid #ea580c", boxShadow: "0 8px 20px rgba(0,0,0,0.1)" }}>
                    <img src={imagePreview} alt="Banner Preview" style={{ width: "100%", display: "block" }} />
                  </div>
                </div>
              )}
            </div>
          </div>

          <hr style={{ border: "none", borderTop: "1px solid var(--border-color, #f1f5f9)" }} />

          {/* STEP 3: PAYMENT SUMMARY & METHOD */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
              <span style={{ background: "linear-gradient(135deg, #ea580c, #d97706)", color: "#fff", width: "32px", height: "32px", borderRadius: "50%", display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: "800", fontSize: "0.95rem", boxShadow: "0 4px 10px rgba(234,88,12,0.3)" }}>3</span>
              <h2 style={{ fontWeight: "800", fontSize: "1.2rem", margin: 0, color: "var(--text-primary, #0f172a)" }}>
                Review Hosting Summary & Payment Checkout
              </h2>
            </div>

            {/* BILLING SUMMARY CARD */}
            <div style={{ background: "linear-gradient(135deg, #ea580c 0%, #d97706 100%)", color: "#fff", padding: "25px", borderRadius: "18px", boxShadow: "0 10px 30px rgba(234, 88, 12, 0.3)", marginBottom: "25px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", fontSize: "0.98rem", color: "rgba(255, 255, 255, 0.9)" }}>
                <span>Selected Placement Slot:</span>
                <strong style={{ color: "#fff", fontWeight: "800" }}>{selectedSlot.name}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px", fontSize: "0.98rem", color: "rgba(255, 255, 255, 0.9)" }}>
                <span>Campaign Duration:</span>
                <strong style={{ color: "#fff", fontWeight: "800" }}>{activeDurationDays} Days ({formData.durationPackage === "monthly" ? "Monthly Package" : "Weekly Package"})</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(255,255,255,0.25)", paddingTop: "15px", fontWeight: "800", fontSize: "1.35rem" }}>
                <span>Total Payable Fee</span>
                <span style={{ color: "#fff", textShadow: "0 2px 4px rgba(0,0,0,0.2)" }}>₹{currentPayableAmount.toLocaleString()}</span>
              </div>
            </div>

            {/* PAYMENT METHOD SELECTOR CARDS */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "18px" }}>
              <label style={{ padding: "18px", borderRadius: "16px", border: formData.paymentMethod === "Razorpay" ? "2.5px solid #ea580c" : "1.5px solid var(--border-color, #e2e8f0)", background: formData.paymentMethod === "Razorpay" ? "rgba(234, 88, 12, 0.04)" : "var(--bg-secondary, #fff)", cursor: "pointer", display: "flex", alignItems: "center", gap: "14px", transition: "all 0.2s ease" }}>
                <input type="radio" name="paymentMethod" value="Razorpay" checked={formData.paymentMethod === "Razorpay"} onChange={e => setFormData({ ...formData, paymentMethod: e.target.value })} style={{ accentColor: "#ea580c" }} />
                <div style={{ background: "rgba(37, 99, 235, 0.1)", color: "#2563eb", width: "42px", height: "42px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.3rem" }}>
                  <FaCreditCard />
                </div>
                <div>
                  <div style={{ fontWeight: "800", fontSize: "0.98rem", color: "var(--text-primary, #0f172a)" }}>Razorpay Gateway</div>
                  <div style={{ fontSize: "0.78rem", color: "#64748b" }}>UPI, Credit/Debit Cards, NetBanking</div>
                </div>
              </label>

              <label style={{ padding: "18px", borderRadius: "16px", border: formData.paymentMethod === "Wallet" ? "2.5px solid #ea580c" : "1.5px solid var(--border-color, #e2e8f0)", background: formData.paymentMethod === "Wallet" ? "rgba(234, 88, 12, 0.04)" : "var(--bg-secondary, #fff)", cursor: "pointer", display: "flex", alignItems: "center", gap: "14px", transition: "all 0.2s ease" }}>
                <input type="radio" name="paymentMethod" value="Wallet" checked={formData.paymentMethod === "Wallet"} onChange={e => setFormData({ ...formData, paymentMethod: e.target.value })} style={{ accentColor: "#ea580c" }} />
                <div style={{ background: "rgba(234, 88, 12, 0.1)", color: "#ea580c", width: "42px", height: "42px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.3rem" }}>
                  <FaWallet />
                </div>
                <div>
                  <div style={{ fontWeight: "800", fontSize: "0.98rem", color: "var(--text-primary, #0f172a)" }}>Digital Wallet</div>
                  <div style={{ fontSize: "0.78rem", color: (walletBalance || 0) >= currentPayableAmount ? "#166534" : "#dc2626", fontWeight: "700" }}>
                    Balance: ₹{(walletBalance || 0).toLocaleString()} {(walletBalance || 0) < currentPayableAmount && "(Insufficient)"}
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* FINAL SUBMIT BUTTON */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            style={{
              background: loading ? "#94a3b8" : "linear-gradient(135deg, #ea580c 0%, #d97706 100%)",
              color: "#fff",
              border: "none",
              padding: "18px 32px",
              borderRadius: "35px",
              fontWeight: "800",
              fontSize: "1.15rem",
              cursor: loading ? "not-allowed" : "pointer",
              boxShadow: "0 8px 25px rgba(234,88,12,0.4)",
              marginTop: "20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "12px",
              transition: "all 0.25s ease",
              width: "100%"
            }}
            onMouseOver={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 12px 30px rgba(234,88,12,0.55)";
              }
            }}
            onMouseOut={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 8px 25px rgba(234,88,12,0.4)";
              }
            }}
          >
            {loading ? (
              <>
                <FaSpinner className="spin" style={{ animation: "spin 1s linear infinite" }} /> Initializing Campaign Checkout...
              </>
            ) : (
              `Proceed to Pay ₹${(currentPayableAmount || 0).toLocaleString()} & Launch Campaign`
            )}
          </button>
        </form>

        {/* ADVERTISING BENEFITS, CREATIVE SPECS, PAYMENT TERMS & CONTACT DETAILS */}
        <div style={{ marginTop: "40px", padding: "30px", background: "var(--bg-secondary, #ffffff)", borderRadius: "20px", border: "1.5px solid var(--border-color, #e2e8f0)", boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>
          <h3 style={{ fontWeight: "800", fontSize: "1.25rem", color: "#0f172a", marginBottom: "20px", borderBottom: "2px solid #ea580c", paddingBottom: "8px", display: "inline-block" }}>
            📋 Advertising Guidelines & Specifications
          </h3>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "25px", marginBottom: "25px" }}>
            {/* BENEFITS */}
            <div style={{ background: "rgba(234, 88, 12, 0.03)", padding: "20px", borderRadius: "14px", border: "1px solid rgba(234, 88, 12, 0.15)" }}>
              <h4 style={{ fontWeight: "800", fontSize: "1rem", color: "#ea580c", marginTop: 0, marginBottom: "14px" }}>
                🌟 Advertiser Benefits
              </h4>
              <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
                {[
                  "Priority publishing",
                  "Dedicated account manager",
                  "Premium homepage visibility",
                  "Monthly analytics reports",
                  "Customized campaigns",
                  "Co-branded opportunities"
                ].map((benefit, idx) => (
                  <li key={idx} style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "0.88rem", fontWeight: "700", color: "var(--text-primary, #1e293b)", background: "#fff", padding: "6px 10px", borderRadius: "8px", border: "1px solid rgba(245, 158, 11, 0.15)" }}>
                    <span style={{ width: "18px", height: "18px", borderRadius: "50%", background: "#ea580c", color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", fontWeight: "900", flexShrink: 0 }}>
                      ✓
                    </span>
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* CREATIVE SPECS */}
            <div style={{ background: "rgba(241, 245, 249, 0.6)", padding: "20px", borderRadius: "14px", border: "1px solid #e2e8f0" }}>
              <h4 style={{ fontWeight: "800", fontSize: "1rem", color: "#0f172a", marginTop: 0, marginBottom: "12px" }}>
                📐 Creative Specifications
              </h4>
              <table style={{ width: "100%", fontSize: "0.85rem", borderCollapse: "collapse", color: "#334155" }}>
                <thead>
                  <tr style={{ borderBottom: "1.5px solid #cbd5e1", textAlign: "left" }}>
                    <th style={{ padding: "6px 0", fontWeight: "700" }}>Item</th>
                    <th style={{ padding: "6px 0", fontWeight: "700" }}>Requirement</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
                    <td style={{ padding: "6px 0", fontWeight: "600" }}>Image Format</td>
                    <td style={{ padding: "6px 0" }}>JPG, PNG, WebP</td>
                  </tr>
                  <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
                    <td style={{ padding: "6px 0", fontWeight: "600" }}>HTML Banner</td>
                    <td style={{ padding: "6px 0" }}>HTML5</td>
                  </tr>
                  <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
                    <td style={{ padding: "6px 0", fontWeight: "600" }}>Video Format</td>
                    <td style={{ padding: "6px 0" }}>MP4</td>
                  </tr>
                  <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
                    <td style={{ padding: "6px 0", fontWeight: "600" }}>Max Image Size</td>
                    <td style={{ padding: "6px 0", fontWeight: "700", color: "#ea580c" }}>500 KB</td>
                  </tr>
                  <tr>
                    <td style={{ padding: "6px 0", fontWeight: "600" }}>Max Video Size</td>
                    <td style={{ padding: "6px 0", fontWeight: "700", color: "#ea580c" }}>100 MB</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* PAYMENT TERMS & CONTACT DETAILS */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "25px" }}>
            {/* PAYMENT TERMS */}
            <div style={{ background: "rgba(241, 245, 249, 0.6)", padding: "20px", borderRadius: "14px", border: "1px solid #e2e8f0" }}>
              <h4 style={{ fontWeight: "800", fontSize: "1rem", color: "#0f172a", marginTop: 0, marginBottom: "14px" }}>
                💳 Payment Terms & Guidelines
              </h4>
              <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
                {[
                  "GST will be charged extra as applicable.",
                  "100% advance payment is required before campaign activation.",
                  "Creative assets should be submitted at least 48 hours before scheduled publication.",
                  "Sponsored content will be clearly labeled as Sponsored, Partner Content, or Advertisement.",
                  "News Ghuru reserves the right to reject advertisements that do not comply with legal or ethical guidelines."
                ].map((term, idx) => (
                  <li key={idx} style={{ display: "flex", alignItems: "flex-start", gap: "10px", fontSize: "0.84rem", lineHeight: "1.6", color: "#334155" }}>
                    <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#ea580c", marginTop: "6px", flexShrink: 0 }} />
                    <div>{term}</div>
                  </li>
                ))}
              </ul>
            </div>

            {/* CONTACT FOR ADVERTISING */}
            <div style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)", color: "#fff", padding: "20px", borderRadius: "14px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <h4 style={{ fontWeight: "800", fontSize: "1rem", color: "#ea580c", marginTop: 0, marginBottom: "6px" }}>
                📞 Contact for Advertising
              </h4>
              <div style={{ fontWeight: "700", fontSize: "0.95rem", marginBottom: "12px", color: "#f8fafc" }}>
                Advertising & Media Sales Team — News Ghuru
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "0.88rem", color: "#cbd5e1" }}>
                <div>📧 Email: <a href="mailto:ads@newsghuru.in" style={{ color: "#fdba74", textDecoration: "none", fontWeight: "700" }}>ads@newsghuru.in</a></div>
                <div>📞 Phone: <a href="tel:+918825948859" style={{ color: "#fdba74", textDecoration: "none", fontWeight: "700" }}>+91 88259 48859</a></div>
                <div>🌐 Website: <a href="https://newsghuru.in" target="_blank" rel="noreferrer" style={{ color: "#fdba74", textDecoration: "none", fontWeight: "700" }}>newsghuru.in</a></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateCampaign;

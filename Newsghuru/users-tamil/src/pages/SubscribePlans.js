import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import API from "../config/api";
import { FaCheck, FaCrown, FaShieldAlt, FaAd, FaMobileAlt } from "react-icons/fa";
import "../styles/SubscribePlans.css";

// Helper function to dynamically load Razorpay script
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const SubscribePlans = () => {
  const navigate = useNavigate();
  
  // Default plans fallback list initialized directly in state
  const [plans, setPlans] = useState([
    {
      _id: "665f80e0c034b12345678901",
      name: "1 Month",
      price: 129,
      duration: "Month",
      durationMonths: 1,
      benefits: ["பிரீமியம் கட்டுரைகள்", "விளம்பரமற்ற வாசிப்பு"],
      isRecommended: false
    },
    {
      _id: "665f80e0c034b12345678902",
      name: "6 Months",
      price: 749,
      duration: "6 Months",
      durationMonths: 6,
      benefits: ["பிரீமியம் கட்டுரைகள்", "விளம்பரமற்ற வாசிப்பு"],
      isRecommended: false
    },
    {
      _id: "665f80e0c034b12345678903",
      name: "1 Year",
      price: 999,
      duration: "Year",
      durationMonths: 12,
      benefits: ["பிரீமியம் கட்டுரைகள்", "விளம்பரமற்ற வாசிப்பு"],
      isRecommended: true
    },
    {
      _id: "665f80e0c034b12345678904",
      name: "LIFETIME",
      price: 9999,
      duration: "Lifetime",
      durationMonths: 999,
      benefits: ["ஆயுட்கால கட்டுரைகள்", "விளம்பரமற்ற வாசிப்பு"],
      isRecommended: false
    }
  ]);
  
  // Initialize loading to true and toggle it in fetching
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentStep, setPaymentStep] = useState(""); // 'initiating', 'processing', 'success', 'failed'
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    try {
      const dataStr = localStorage.getItem("readerData");
      if (dataStr) {
        setUserData(JSON.parse(dataStr));
      }
    } catch (e) {
      console.error("Error loading readerData:", e);
    }
  }, []);

  useEffect(() => {
    const handlePaymentSuccess = (e) => {
      if (e.detail && e.detail.user) {
        setUserData(e.detail.user);
      }
    };
    window.addEventListener("payment-success", handlePaymentSuccess);
    return () => {
      window.removeEventListener("payment-success", handlePaymentSuccess);
    };
  }, []);


  // Fetch plans on mount to overwrite with latest DB config if available
  useEffect(() => {
    setLoading(true);
    API.get("/api/subscription/plans")
      .then((res) => {
        if (res.data && res.data.success && res.data.plans && res.data.plans.length > 0) {
          setPlans(res.data.plans);
        }
      })
      .catch((err) => {
        console.error("Error fetching plans, using hardcoded fallback plans:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Main subscribe button handler wrapped in useCallback
  const handleSubscribe = useCallback(async (planId) => {
    const activeToken = localStorage.getItem("readerToken");
    if (!activeToken) {
      // Save plan ID to session storage and prompt login
      sessionStorage.setItem("pendingSubscriptionPlanId", planId);
      window.dispatchEvent(new CustomEvent("open-reader-login"));
      return;
    }

    setProcessingPayment(true);
    setPaymentStep("initiating");

    try {
      // Create payment order
      const orderRes = await API.post(
        "/api/subscription/create-order",
        { planId },
        { headers: { Authorization: `Bearer ${localStorage.getItem("readerToken")}` } }
      );

      if (!orderRes.data.success) {
        throw new Error("Failed to create order");
      }

      const { isMock, orderId, amount, currency, key } = orderRes.data;

      if (isMock) {
        // Run mock Razorpay simulation
        setPaymentStep("processing");
        
        setTimeout(async () => {
          try {
            const verifyRes = await API.post(
              "/api/subscription/verify-mock-payment",
              { planId, orderId },
              { headers: { Authorization: `Bearer ${localStorage.getItem("readerToken")}` } }
            );

            if (verifyRes.data.success) {
              setPaymentStep("success");
              // Update local cached profile with the fresh user data from backend
              const updatedUser = verifyRes.data.user;
              localStorage.setItem("readerData", JSON.stringify(updatedUser));
              // Dispatch payment-success event so App.js updates currentUser state reactively
              window.dispatchEvent(new CustomEvent("payment-success", { detail: { user: updatedUser } }));
              
              setTimeout(() => {
                setProcessingPayment(false);
                navigate("/");
              }, 2000);
            } else {
              setPaymentStep("failed");
            }
          } catch (verifyErr) {
            console.error("Mock verify error:", verifyErr);
            setPaymentStep("failed");
          }
        }, 3000);

      } else {
        // Run Live Razorpay Checkout
        const rzpLoaded = await loadRazorpayScript();
        if (!rzpLoaded) {
          alert("Razorpay payment SDK failed to load. Please check your internet connection.");
          setProcessingPayment(false);
          return;
        }

        let readerData = {};
        try {
          readerData = JSON.parse(localStorage.getItem("readerData") || "{}");
        } catch (e) {}

        // Hide the initiating overlay - Razorpay modal takes over
        setProcessingPayment(false);

        const options = {
          key: key,
          amount: amount,
          currency: currency,
          name: "NewsGhuru Premium",
          description: "Premium Digital News Subscription",
          // Use absolute URL so Razorpay can load it in their modal
          image: `${window.location.origin}/NEWS GHURU LOGO PNG.png`,
          order_id: orderId,
          handler: async function (response) {
            // Payment done — show our processing overlay
            setProcessingPayment(true);
            setPaymentStep("processing");
            try {
              const verifyRes = await API.post(
                "/api/subscription/verify-payment",
                {
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  planId
                },
                { headers: { Authorization: `Bearer ${localStorage.getItem("readerToken")}` } }
              );

              if (verifyRes.data.success) {
                setPaymentStep("success");
                const updatedUser = verifyRes.data.user;
                localStorage.setItem("readerData", JSON.stringify(updatedUser));
                // Dispatch payment-success event so App.js updates currentUser state reactively
                window.dispatchEvent(new CustomEvent("payment-success", { detail: { user: updatedUser } }));
                setTimeout(() => {
                  setProcessingPayment(false);
                  navigate("/");
                }, 2000);
              } else {
                setPaymentStep("failed");
                setProcessingPayment(true); // keep overlay showing the failure state
              }
            } catch (err) {
              console.error("Live verify error:", err);
              setPaymentStep("failed");
              setProcessingPayment(true);
            }
          },
          prefill: {
            name: readerData.name || "",
            email: readerData.email || "",
            contact: readerData.phone || ""
          },
          theme: {
            color: "#ea580c"
          },
          modal: {
            ondismiss: function () {
              // User closed Razorpay modal without paying
              setProcessingPayment(false);
              setPaymentStep("");
            }
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.on("payment.failed", function (response) {
          console.error("Razorpay payment failed:", response.error);
          setPaymentStep("failed");
          setProcessingPayment(true);
        });
        rzp.open();
      }


    } catch (err) {
      console.error("Subscription initiate failed:", err);
      setPaymentStep("failed");
      setTimeout(() => setProcessingPayment(false), 2500);
    }
  }, [navigate]);

  // Clear any stale pending subscriptions when this page mounts
  useEffect(() => {
    sessionStorage.removeItem("pendingSubscriptionPlanId");
  }, []);

  // Listen for login success from AuthPopup (event-driven)
  useEffect(() => {
    const handleLoginSuccessEvent = () => {
      const pendingPlanId = sessionStorage.getItem("pendingSubscriptionPlanId");
      if (pendingPlanId) {
        sessionStorage.removeItem("pendingSubscriptionPlanId");
        handleSubscribe(pendingPlanId);
      }
    };

    window.addEventListener("reader-login-success", handleLoginSuccessEvent);
    return () => {
      window.removeEventListener("reader-login-success", handleLoginSuccessEvent);
    };
  }, [handleSubscribe]);

  if (loading) {
    return (
      <div className="subscribe-loading">
        <div className="loading-spinner"></div>
        <p>திட்டங்கள் ஏற்றப்படுகின்றன...</p>
      </div>
    );
  }

  // Filter plans into standard vs lifetime
  const standardPlans = plans.filter(p => p.name.toLowerCase() !== "lifetime" && p.name.toLowerCase() !== "ஆயுட்காலம்");
  const lifetimePlan = plans.find(p => p.name.toLowerCase() === "lifetime" || p.name.toLowerCase() === "ஆயுட்காலம்");

  return (
    <div className="subscribe-plans-page">
      {/* PREMIUM HERO HERO HEADER */}
      <div className="subscribe-hero-section">
        <div className="hero-gradient-overlay"></div>
        <div className="hero-content">
          <div className="premium-badge-wrapper">
            <span className="premium-crown-icon"><FaCrown /></span>
            <span className="premium-badge-text">NEWSGHURU PREMIUM</span>
          </div>
          <h1>முழுமையான செய்தி வாசிப்பு அனுபவம்</h1>
          <p>விளம்பரங்களற்ற தடையற்ற வாசிப்பு, ஆழமான சிறப்புக் கட்டுரைகள் மற்றும் பல சலுகைகளை உடனே பெறுங்கள்.</p>
        </div>
      </div>

      <div className="subscribe-store-container">
        {/* BRAND PROMOTION CARDS */}
        <div className="brand-features-section">
          <h2 className="section-title">ஏன் நியூஸ்குரு பிரீமியம்?</h2>
          <div className="brand-features-row">
            <div className="brand-feature-card">
              <div className="bf-icon-wrapper">
                <FaAd className="bf-icon disabled-ad-icon" />
              </div>
              <h4>முழு விளம்பரமற்ற வாசிப்பு</h4>
              <p>செய்திகளுக்கு நடுவே தோன்றும் தொல்லைதரும் விளம்பரங்கள் ஏதுமின்றி தடையின்றி வாசியுங்கள்.</p>
            </div>
            <div className="brand-feature-card">
              <div className="bf-icon-wrapper">
                <FaCrown className="bf-icon" />
              </div>
              <h4>சிறப்புக் கட்டுரைகள் & ஆய்வுகள்</h4>
              <p>அரசியல், சமூகம், வணிகம் மற்றும் உலகளாவிய செய்திகளின் ஆழமான அலசல்கள்.</p>
            </div>
            <div className="brand-feature-card">
              <div className="bf-icon-wrapper">
                <FaMobileAlt className="bf-icon" />
              </div>
              <h4>அனைத்து சாதனங்களிலும்</h4>
              <p>ஒரே கணக்கு மூலம் உங்கள் மொபைல், கணினி மற்றும் டேப்லெட் என அனைத்திலும் பயன்படுத்தலாம்.</p>
            </div>
          </div>
        </div>

        {/* LOYALTY DISCOUNT CARD */}
        <div className="coins-redeem-container">
          <label className="coins-checkbox-label">
            <span className="coins-left-badge-row">
              <span className="gold-coin-badge">🌟</span>
              <span className="coins-text">Redeem NewsGhuru Loyalty Points (Upto 20% Discount)</span>
            </span>
            <input type="checkbox" className="coins-checkbox-input" />
          </label>
        </div>

        {/* STANDARD 3-COLUMN PLANS */}
        <div className="plans-selection-section">
          <h2 className="section-title">சந்தா திட்டத்தைத் தேர்ந்தெடுக்கவும்</h2>
          <div className="standard-plans-grid">
            {standardPlans.map((plan) => {
              const isRec = plan.isRecommended;
              const isActive = userData?.isPremium && (
                userData.premiumPlan === plan._id || 
                userData.premiumPlan?._id === plan._id ||
                (typeof userData.premiumPlan === "object" && userData.premiumPlan !== null && (
                  userData.premiumPlan.durationMonths === plan.durationMonths ||
                  userData.premiumPlan.duration === plan.duration ||
                  userData.premiumPlan.name?.toLowerCase() === plan.name?.toLowerCase()
                ))
              );

              return (
                <div 
                  key={plan._id} 
                  className={`store-plan-card ${isActive ? "store-active" : isRec ? "store-recommended" : ""}`}
                >
                  {isActive ? (
                    <div className="store-rec-badge active-plan-badge">ACTIVE PLAN</div>
                  ) : (
                    isRec && <div className="store-rec-badge">RECOMMENDED</div>
                  )}
                  
                  <h3 className="store-plan-name">{plan.name}</h3>
                  
                  <div className="store-plan-price">
                    <span className="store-currency">₹</span>
                    <span className="store-amount">{plan.price}</span>
                    <span className="store-slash"> / {plan.duration === "Month" ? "Month" : plan.duration === "Year" ? "Year" : plan.duration}</span>
                  </div>

                  <div className="plan-benefits-list-custom">
                    {plan.benefits && plan.benefits.map((benefit, idx) => (
                      <div key={idx} className="plan-benefit-item-custom">
                        <FaCheck className="benefit-check-icon" />
                        <span>{benefit}</span>
                      </div>
                    ))}
                  </div>

                  <button 
                    className="store-subscribe-btn"
                    onClick={() => !isActive && handleSubscribe(plan._id)}
                    disabled={isActive}
                    style={isActive ? { background: "#10b981", cursor: "default", boxShadow: "none" } : {}}
                  >
                    {isActive ? "Active Plan" : "Subscribe Now"}
                  </button>

                  <div className="store-plan-footer">
                    {plan.duration === "1 Month" || plan.duration === "Month" ? "Renews Monthly" : ""}
                    {plan.duration === "6 Months" ? "Renews Every 6 Months" : ""}
                    {plan.duration === "1 Year" || plan.duration === "Year" ? "Renews Yearly" : ""}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* LIFETIME ACCESS CARD */}
        {lifetimePlan && (() => {
          const isLifetimeActive = userData?.isPremium && (
            userData.premiumPlan === lifetimePlan._id || 
            userData.premiumPlan?._id === lifetimePlan._id ||
            (typeof userData.premiumPlan === "object" && userData.premiumPlan !== null && (
              userData.premiumPlan.durationMonths === lifetimePlan.durationMonths ||
              userData.premiumPlan.duration === lifetimePlan.duration ||
              userData.premiumPlan.name?.toLowerCase() === lifetimePlan.name?.toLowerCase()
            ))
          );
          return (
            <div className={`lifetime-horizontal-card-custom ${isLifetimeActive ? "lifetime-active" : ""}`}>
              <div className="lifetime-badge-glow">
                {isLifetimeActive ? "ஆயுட்கால சந்தா (ACTIVE LIFETIME PLAN)" : "ஆயுட்கால சந்தா (LIFETIME ACCESS)"}
              </div>
              <div className="lifetime-card-content">
                <div className="lifetime-left-sec">
                  <h3>நியூஸ்குரு ஆயுட்கால பிரீமியம்</h3>
                  <p>ஒருமுறை செலுத்தும் சந்தா! எதிர்காலத்தில் எந்தவொரு கூடுதல் கட்டணமுமின்றி விளம்பரமற்ற செய்திகளை ஆயுட்காலத்திற்கும் பெற்று மகிழுங்கள்.</p>
                </div>
                
                <div className="lifetime-right-sec">
                  <div className="lifetime-price-box">
                    <span className="lt-currency">₹</span>
                    <span className="lt-price">{lifetimePlan.price}</span>
                    <span className="lt-period">/ Life</span>
                  </div>
                  <button 
                    className="lifetime-subscribe-btn-custom"
                    onClick={() => !isLifetimeActive && handleSubscribe(lifetimePlan._id)}
                    disabled={isLifetimeActive}
                    style={isLifetimeActive ? { background: "#10b981", cursor: "default", boxShadow: "none" } : {}}
                  >
                    {isLifetimeActive ? "Active Plan" : "Subscribe Lifetime"}
                  </button>
                </div>
              </div>
            </div>
          );
        })()}

        {/* COMPARISON MATRIX SECTION */}
        <div className="plans-comparison-section">
          <h2 className="section-title">அம்சங்கள் ஒப்பீடு (Free vs Premium)</h2>
          <div className="comparison-table-wrapper">
            <table className="comparison-table">
              <thead>
                <tr>
                  <th>அம்சங்கள் (Features)</th>
                  <th>இலவசம் (Free Account)</th>
                  <th>பிரீமியம் (Premium Account)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>தினசரி முக்கிய செய்திகள்</td>
                  <td className="check-val text-green"><FaCheck /></td>
                  <td className="check-val text-green"><FaCheck /></td>
                </tr>
                <tr>
                  <td>விளம்பரமற்ற செய்தி வாசிப்பு</td>
                  <td className="cross-val text-red">✕</td>
                  <td className="check-val text-green"><FaCheck /></td>
                </tr>
                <tr>
                  <td>பிரத்தியேக பிரீமியம் செய்திகள்</td>
                  <td className="cross-val text-red">✕</td>
                  <td className="check-val text-green"><FaCheck /></td>
                </tr>
                <tr>
                  <td>உடனடி பிரேக்கிங் நியூஸ் அறிவிப்புகள்</td>
                  <td className="cross-val text-muted">குறைந்த முன்னுரிமை</td>
                  <td className="check-val text-green">உடனடி முன்னுரிமை (Priority)</td>
                </tr>

                <tr>
                  <td>பன்முக சாதனங்கள் (Multi-device)</td>
                  <td className="cross-val text-muted">1 சாதனம்</td>
                  <td className="check-val text-green">வரம்பற்ற சாதனங்கள்</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* RAZORPAY CUSTOM MOCK PAYMENT OVERLAY SCREEN */}
      {processingPayment && (
        <div className="mock-payment-overlay">
          <div className="mock-payment-container">
            {paymentStep === "initiating" && (
              <div className="mock-payment-state">
                <div className="mock-spinner"></div>
                <h3>பணம் செலுத்தும் பக்கம் துவங்குகிறது...</h3>
                <p>பக்கத்தை புதுப்பிக்கவோ அல்லது பின்னோக்கி செல்லவோ வேண்டாம்.</p>
              </div>
            )}

            {paymentStep === "processing" && (
              <div className="mock-payment-state razorpay-replica">
                <div className="rzp-shield-container">
                  <FaShieldAlt className="rzp-shield-icon" />
                  <span className="rzp-shield-num">1</span>
                </div>
                
                <div className="rzp-processing-indicator">
                  <div className="rzp-progress-line"></div>
                </div>

                <h3>பரிவர்த்தனை பரிசீலிக்கப்படுகிறது</h3>
                <p>வங்கியிலிருந்து தகவலுக்காக காத்திருக்கிறது. பக்கத்தை மூட வேண்டாம்.</p>
                
                <div className="rzp-footer">
                  <span>Secured by</span>
                  <span className="rzp-brand">Razorpay</span>
                </div>
              </div>
            )}

            {paymentStep === "success" && (
              <div className="mock-payment-state payment-success">
                <div className="success-checkmark-circle">
                  <FaCheck className="success-icon" />
                </div>
                <h3>சந்தா வெற்றிகரமாக செலுத்தப்பட்டது!</h3>
                <p>விளம்பரங்கள் இல்லாத நியூஸ்குரு பிரீமியம் தளத்திற்கு உங்களை வரவேற்கிறோம்.</p>
              </div>
            )}

            {paymentStep === "failed" && (
              <div className="mock-payment-state payment-failed">
                <div className="failed-cross-circle">&times;</div>
                <h3>பரிவர்த்தனை தோல்வியடைந்தது</h3>
                <p>பணம் செலுத்துவதில் சிக்கல் ஏற்பட்டது. மீண்டும் முயலவும்.</p>
                <button 
                  className="retry-payment-btn"
                  onClick={() => setProcessingPayment(false)}
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscribePlans;

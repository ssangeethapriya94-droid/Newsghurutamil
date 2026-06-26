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

const translateBenefit = (benefit) => {
  const translations = {
    "பிரீமியம் கட்டுரைகள்": "Premium Articles",
    "விளம்பரமற்ற வாசிப்பு": "Ad-free Reading",
    "ஆயுட்கால கட்டுரைகள்": "Lifetime Articles",
    "பிரீமியம் செய்திகள்": "Premium News",
    "விளம்பரங்கள் இல்லை": "No Ads"
  };
  return translations[benefit] || benefit;
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
      benefits: ["Premium Articles", "Ad-free Reading"],
      isRecommended: false
    },
    {
      _id: "665f80e0c034b12345678902",
      name: "6 Months",
      price: 749,
      duration: "6 Months",
      durationMonths: 6,
      benefits: ["Premium Articles", "Ad-free Reading"],
      isRecommended: false
    },
    {
      _id: "665f80e0c034b12345678903",
      name: "1 Year",
      price: 999,
      duration: "Year",
      durationMonths: 12,
      benefits: ["Premium Articles", "Ad-free Reading"],
      isRecommended: true
    },
    {
      _id: "665f80e0c034b12345678904",
      name: "LIFETIME",
      price: 9999,
      duration: "Lifetime",
      durationMonths: 999,
      benefits: ["Lifetime Articles", "Ad-free Reading"],
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

    // Sync latest profile on mount to ensure active/upcoming plan states are updated
    const syncProfileOnMount = async () => {
      const token = localStorage.getItem("readerToken");
      if (token) {
        try {
          const res = await API.get("/api/users/profile", {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.data && res.data.success) {
            setUserData(res.data.user);
            localStorage.setItem("readerData", JSON.stringify(res.data.user));
            // Trigger app state update
            window.dispatchEvent(new CustomEvent("payment-success", { detail: { user: res.data.user } }));
          }
        } catch (err) {
          console.error("Error syncing profile on SubscribePlans mount:", err);
        }
      }
    };
    syncProfileOnMount();
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
    API.get("/api/subscription/plans?language=en")
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
          image: `${window.location.origin}/NEWS GHURU LOGO English.png`,
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
        <p>Loading subscription plans...</p>
      </div>
    );
  }

  // Filter plans into standard vs lifetime
  const standardPlans = plans.filter(p => p.name.toLowerCase() !== "lifetime" && p.name.toLowerCase() !== "lifetime access");
  const lifetimePlan = plans.find(p => p.name.toLowerCase() === "lifetime" || p.name.toLowerCase() === "lifetime access");

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
          <h1>Complete News Reading Experience</h1>
          <p>Get ad-free seamless reading, deep special analysis, and exclusive premium benefits today.</p>
        </div>
      </div>

      <div className="subscribe-store-container">
        {/* BRAND PROMOTION CARDS */}
        <div className="brand-features-section">
          <h2 className="section-title">Why Newsghuru Premium?</h2>
          <div className="brand-features-row">
            <div className="brand-feature-card">
              <div className="bf-icon-wrapper">
                <FaAd className="bf-icon disabled-ad-icon" />
              </div>
              <h4>Fully Ad-Free Reading</h4>
              <p>Read without annoying ads popping up between stories.</p>
            </div>
            <div className="brand-feature-card">
              <div className="bf-icon-wrapper">
                <FaCrown className="bf-icon" />
              </div>
              <h4>Special Features & Analysis</h4>
              <p>Deep analysis on politics, society, business, and international affairs.</p>
            </div>
            <div className="brand-feature-card">
              <div className="bf-icon-wrapper">
                <FaMobileAlt className="bf-icon" />
              </div>
              <h4>Across All Devices</h4>
              <p>Access on mobile, desktop, and tablet with a single account.</p>
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
          <h2 className="section-title">Select a Subscription Plan</h2>
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

              const isUpcoming = userData?.isPremium && (
                userData.upcomingPlan === plan._id ||
                userData.upcomingPlan?._id === plan._id ||
                (typeof userData.upcomingPlan === "object" && userData.upcomingPlan !== null && (
                  userData.upcomingPlan.durationMonths === plan.durationMonths ||
                  userData.upcomingPlan.duration === plan.duration ||
                  userData.upcomingPlan.name?.toLowerCase() === plan.name?.toLowerCase()
                ))
              );

              return (
                <div 
                  key={plan._id} 
                  className={`store-plan-card ${isActive ? "store-active" : isUpcoming ? "store-upcoming" : isRec ? "store-recommended" : ""}`}
                >
                  {isActive ? (
                    <div className="store-rec-badge active-plan-badge">ACTIVE PLAN</div>
                  ) : isUpcoming ? (
                    <div className="store-rec-badge upcoming-plan-badge" style={{ background: "#3b82f6" }}>UPCOMING PLAN</div>
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
                        <span>{translateBenefit(benefit)}</span>
                      </div>
                    ))}
                  </div>

                  <button 
                    className="store-subscribe-btn"
                    onClick={() => !isActive && !isUpcoming && handleSubscribe(plan._id)}
                    disabled={isActive || isUpcoming}
                    style={isActive ? { background: "#10b981", cursor: "default", boxShadow: "none" } : isUpcoming ? { background: "#3b82f6", cursor: "default", boxShadow: "none" } : {}}
                  >
                    {isActive ? "Active Plan" : isUpcoming ? "Upcoming Plan" : "Subscribe Now"}
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

          const isLifetimeUpcoming = userData?.isPremium && (
            userData.upcomingPlan === lifetimePlan._id || 
            userData.upcomingPlan?._id === lifetimePlan._id ||
            (typeof userData.upcomingPlan === "object" && userData.upcomingPlan !== null && (
              userData.upcomingPlan.durationMonths === lifetimePlan.durationMonths ||
              userData.upcomingPlan.duration === lifetimePlan.duration ||
              userData.upcomingPlan.name?.toLowerCase() === lifetimePlan.name?.toLowerCase()
            ))
          );

          return (
            <div className={`lifetime-horizontal-card-custom ${isLifetimeActive ? "lifetime-active" : isLifetimeUpcoming ? "lifetime-upcoming" : ""}`}>
              <div className="lifetime-badge-glow" style={isLifetimeUpcoming ? { background: "#3b82f6" } : {}}>
                {isLifetimeActive ? "ACTIVE LIFETIME PLAN" : isLifetimeUpcoming ? "UPCOMING LIFETIME PLAN" : "LIFETIME ACCESS"}
              </div>
              <div className="lifetime-card-content">
                <div className="lifetime-left-sec">
                  <h3>Newsghuru Lifetime Premium</h3>
                  <p>One-time payment! Enjoy ad-free news reading for a lifetime without any future subscription fee.</p>
                </div>
                
                <div className="lifetime-right-sec">
                  <div className="lifetime-price-box">
                    <span className="lt-currency">₹</span>
                    <span className="lt-price">{lifetimePlan.price}</span>
                    <span className="lt-period">/ Life</span>
                  </div>
                  <button 
                    className="lifetime-subscribe-btn-custom"
                    onClick={() => !isLifetimeActive && !isLifetimeUpcoming && handleSubscribe(lifetimePlan._id)}
                    disabled={isLifetimeActive || isLifetimeUpcoming}
                    style={isLifetimeActive ? { background: "#10b981", cursor: "default", boxShadow: "none" } : isLifetimeUpcoming ? { background: "#3b82f6", cursor: "default", boxShadow: "none" } : {}}
                  >
                    {isLifetimeActive ? "Active Plan" : isLifetimeUpcoming ? "Upcoming Plan" : "Subscribe Lifetime"}
                  </button>
                </div>
              </div>
            </div>
          );
        })()}

        {/* COMPARISON MATRIX SECTION */}
        <div className="plans-comparison-section">
          <h2 className="section-title">Features Comparison (Free vs Premium)</h2>
          <div className="comparison-table-wrapper">
            <table className="comparison-table">
              <thead>
                <tr>
                  <th>Features</th>
                  <th>Free Account</th>
                  <th>Premium Account</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Daily Top Stories</td>
                  <td className="check-val text-green"><FaCheck /></td>
                  <td className="check-val text-green"><FaCheck /></td>
                </tr>
                <tr>
                  <td>Ad-free news reading</td>
                  <td className="cross-val text-red">✕</td>
                  <td className="check-val text-green"><FaCheck /></td>
                </tr>
                <tr>
                  <td>Exclusive premium articles</td>
                  <td className="cross-val text-red">✕</td>
                  <td className="check-val text-green"><FaCheck /></td>
                </tr>
                <tr>
                  <td>Instant breaking news alerts</td>
                  <td className="cross-val text-muted">Low priority</td>
                  <td className="check-val text-green">Instant priority</td>
                </tr>

                <tr>
                  <td>Multi-device access</td>
                  <td className="cross-val text-muted">1 Device</td>
                  <td className="check-val text-green">Unlimited devices</td>
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
                <h3>Initiating payment gateway...</h3>
                <p>Do not refresh the page or click back button.</p>
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

                <h3>Processing Transaction</h3>
                <p>Waiting for bank confirmation. Do not close this page.</p>
                
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
                <h3>Subscription Paid Successfully!</h3>
                <p>Welcome to the ad-free Newsghuru Premium experience.</p>
              </div>
            )}

            {paymentStep === "failed" && (
              <div className="mock-payment-state payment-failed">
                <div className="failed-cross-circle">&times;</div>
                <h3>Transaction Failed</h3>
                <p>An error occurred during payment. Please try again.</p>
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

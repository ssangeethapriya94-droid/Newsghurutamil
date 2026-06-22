import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import API from "../config/api";

function PopupAd() {
  const navigate = useNavigate();
  const [currentAd, setCurrentAd] = useState(null);
  const [visible, setVisible] = useState(false);
  const showTimerRef = useRef(null);
  const closeTimerRef = useRef(null);
  const impressionLogged = useRef(false);

  const token = localStorage.getItem("readerToken");
  let readerData = null;
  try {
    const dataStr = localStorage.getItem("readerData");
    if (dataStr) readerData = JSON.parse(dataStr);
  } catch (e) {
    console.error("Error parsing readerData in PopupAd", e);
  }

  const isPremium = !!(token && readerData?.isPremium);

  useEffect(() => {
    if (isPremium) return;
    // For testing and validation convenience, allow the popup to show on every page reload/mount.
    // (To restrict once per session in production, uncomment the lines below)
    // const hasBeenShown = sessionStorage.getItem("newsghuru_popup_shown");
    // if (hasBeenShown === "true") return;

    let isMounted = true;

    // Fetch active ads and settings
    Promise.all([
      API.get("/api/ads/active").then(res => res.data.ads || []),
      API.get("/api/ads/settings/public").then(res => res.data.settings || null)
    ]).then(([allAds, publicSettings]) => {
      if (!isMounted) return;

      if (!publicSettings || !publicSettings.popupEnabled) return;

      const popups = allAds.filter(ad => ad.position === "POPUP_ADVERTISEMENT");
      if (popups.length === 0) return;

      // Weighted selection based on priority
      const pool = [];
      popups.forEach(ad => {
        let weight = 2;
        if (ad.priority === "High") weight = 3;
        if (ad.priority === "Low") weight = 1;
        for (let i = 0; i < weight; i++) {
          pool.push(ad);
        }
      });

      const randomIndex = Math.floor(Math.random() * pool.length);
      const selectedAd = pool[randomIndex];
      setCurrentAd(selectedAd);

      // Configure delays
      const startDelaySec = selectedAd.popupDelay !== undefined ? selectedAd.popupDelay : (publicSettings.popupDelay || 3);
      
      // Trigger delay timer
      showTimerRef.current = setTimeout(() => {
        setVisible(true);
        sessionStorage.setItem("newsghuru_popup_shown", "true");

        // Log impression
        if (!impressionLogged.current) {
          API.post(`/api/ads/${selectedAd._id}/impression`)
            .then(() => {
              impressionLogged.current = true;
            })
            .catch(err => console.error("Error logging popup impression:", err));
        }

        // Configure auto close duration
        const autoCloseSec = selectedAd.popupAutoClose !== undefined ? selectedAd.popupAutoClose : (publicSettings.popupAutoClose || 10);
        closeTimerRef.current = setTimeout(() => {
          setVisible(false);
        }, autoCloseSec * 1000);

      }, startDelaySec * 1000);

    }).catch(err => {
      console.error("Popup ad initialization failed:", err);
    });

    return () => {
      isMounted = false;
      if (showTimerRef.current) clearTimeout(showTimerRef.current);
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    };
  }, [isPremium]);

  const handleClose = () => {
    setVisible(false);
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
  };

  const handleAdClick = (e) => {
    const target = currentAd?.targetUrl || "";
    if (target.includes("/subscribe")) {
      e.preventDefault();
      // Track click in the background so stats are accurate
      API.get(`/api/ads/${currentAd._id}/click`)
        .catch(err => console.error("Error tracking click in background:", err));
      handleClose();
      // Route internally
      navigate("/subscribe");
    } else {
      handleClose();
    }
  };

  if (isPremium || !currentAd || !visible) return null;

  const adClickTrackUrl = `${API.defaults.baseURL || "http://localhost:5000"}/api/ads/${currentAd._id}/click`;
  const imgUrl = currentAd.image.startsWith("http") ? currentAd.image : `${API.defaults.baseURL || "http://localhost:5000"}${currentAd.image}`;

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      backgroundColor: "rgba(15, 23, 42, 0.8)", // Slate-900 with transparency
      backdropFilter: "blur(4px)",
      zIndex: 99999, // Render above everything, including dialogs
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px",
      animation: "fadeInAd 0.3s ease-out"
    }}>
      <div style={{
        position: "relative",
        background: "white",
        borderRadius: "12px",
        padding: "10px",
        maxWidth: "600px",
        width: "100%",
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.25), 0 10px 10px -5px rgba(0, 0, 0, 0.2)",
        animation: "scaleInAd 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)"
      }}>
        {/* CLOSE BUTTON */}
        <button 
          onClick={handleClose}
          style={{
            position: "absolute",
            top: "-15px",
            right: "-15px",
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            backgroundColor: "#ef4444",
            color: "white",
            border: "none",
            fontSize: "20px",
            fontWeight: "bold",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)",
            zIndex: 100000,
            transition: "background 0.2s"
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#dc2626"}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#ef4444"}
        >
          &times;
        </button>

        <div style={{ fontSize: "9px", color: "#94a3b8", textAlign: "center", textTransform: "uppercase", letterSpacing: "1px", margin: "5px 0 8px 0" }}>
          Sponsored Advertisement / விளம்பரம்
        </div>

        <a href={adClickTrackUrl} target="_blank" rel="noopener noreferrer" onClick={handleAdClick}>
          <img 
            src={imgUrl} 
            alt={currentAd.title} 
            style={{ 
              width: "100%", 
              height: "auto", 
              maxHeight: "500px",
              objectFit: "contain",
              display: "block",
              borderRadius: "8px"
            }} 
          />
        </a>
      </div>

      <style>{`
        @keyframes fadeInAd {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleInAd {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

export default PopupAd;

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import API from "../config/api";

// Module-level cache to share a single API promise across all mounted ad zones on a page load
let activeAdsPromise = null;
let adSettingsPromise = null;
const activeInstances = {};

const fetchActiveAdsCached = () => {
  if (!activeAdsPromise) {
    activeAdsPromise = API.get("/api/ads/active")
      .then(res => {
        if (res.data && res.data.success) {
          const adsList = res.data.ads || [];
          if (adsList.length === 0) {
            activeAdsPromise = null; // Do not cache empty results
          }
          return adsList;
        }
        activeAdsPromise = null;
        return [];
      })
      .catch(err => {
        console.error("AdZone API error:", err);
        activeAdsPromise = null;
        return [];
      });
  }
  return activeAdsPromise;
};

const fetchAdSettingsCached = () => {
  if (!adSettingsPromise) {
    adSettingsPromise = API.get("/api/ads/settings/public")
      .then(res => {
        if (res.data && res.data.success) {
          return res.data.settings || null;
        }
        adSettingsPromise = null;
        return null;
      })
      .catch(err => {
        console.error("AdZone Settings API error:", err);
        adSettingsPromise = null;
        return null;
      });
  }
  return adSettingsPromise;
};

// Clear promise cache when page changes/navigates (can be triggered externally if needed)
export const clearAdCache = () => {
  activeAdsPromise = null;
  adSettingsPromise = null;
};

function AdZone({ position }) {
  const navigate = useNavigate();
  const instanceId = useRef(Math.random().toString());
  const [ads, setAds] = useState([]);
  const [currentAd, setCurrentAd] = useState(null);
  const [settings, setSettings] = useState(null);
  const [closed, setClosed] = useState(false);
  const adRef = useRef(null);
  const loggedImpressions = useRef(new Set()); // Track impressions logged in this mount session

  const token = localStorage.getItem("readerToken");
  let readerData = null;
  try {
    const dataStr = localStorage.getItem("readerData");
    if (dataStr) readerData = JSON.parse(dataStr);
  } catch (e) {
    console.error("Error parsing readerData in AdZone", e);
  }

  const isPremium = !!(token && readerData?.isPremium);

  // Clean up global instance registry on unmount
  useEffect(() => {
    const currentId = instanceId.current;
    return () => {
      delete activeInstances[currentId];
    };
  }, []);

  // Helper to select a random weighted ad for this position,
  // avoiding ad IDs currently displayed in other AdZone instances for the same position.
  const selectAd = useCallback((filteredAds) => {
    if (!filteredAds || filteredAds.length === 0) return null;

    // Get ad IDs currently shown in other active AdZone instances for the same position
    const otherSelectedIds = Object.keys(activeInstances)
      .filter(id => id !== instanceId.current && activeInstances[id].position === position)
      .map(id => activeInstances[id].adId);

    // Filter available ads to exclude ones shown elsewhere
    let available = filteredAds.filter(ad => !otherSelectedIds.includes(ad._id));

    // Fallback if we have fewer ads than active slots: use all filtered ads
    if (available.length === 0) {
      available = filteredAds;
    }

    // Build weighted pool
    const pool = [];
    available.forEach(ad => {
      let weight = 2; // Medium default
      if (ad.priority === "High") weight = 3;
      if (ad.priority === "Low") weight = 1;
      for (let i = 0; i < weight; i++) {
        pool.push(ad);
      }
    });

    if (pool.length === 0) return null;

    const randomIndex = Math.floor(Math.random() * pool.length);
    const selected = pool[randomIndex];

    // Update global registry
    activeInstances[instanceId.current] = { position, adId: selected._id };

    return selected;
  }, [position]);

  // Fetch ads and settings
  useEffect(() => {
    if (isPremium) return;
    let isMounted = true;

    Promise.all([fetchActiveAdsCached(), fetchAdSettingsCached()]).then(([allAds, adSettings]) => {
      console.log(`[AdZone - ${position}] Loaded public active ads count:`, allAds.length);
      if (!isMounted) return;

      setSettings(adSettings);
      
      // Filter for this position
      const filtered = allAds.filter(ad => ad.position === position);
      console.log(`[AdZone - ${position}] Filtered for position:`, filtered.length);
      setAds(filtered);

      if (filtered.length > 0) {
        const selectedAd = selectAd(filtered);
        if (selectedAd) {
          console.log(`[AdZone - ${position}] Selected initial ad:`, selectedAd.title);
          setCurrentAd(selectedAd);
        }
      }
    });

    return () => {
      isMounted = false;
    };
  }, [position, isPremium, selectAd]);

  // Handle Rotation Timer
  useEffect(() => {
    if (isPremium || ads.length <= 1 || !currentAd) return;

    // Use ad-level rotationInterval, or fallback to global settings, or fallback to 10 seconds
    const intervalSec = currentAd.rotationInterval || settings?.globalRotationInterval || 10;
    
    const rotateAd = () => {
      // Re-build pool of OTHER ads to avoid selecting the same one consecutively if possible
      const otherAds = ads.filter(a => a._id !== currentAd._id);
      const poolSource = otherAds.length > 0 ? otherAds : ads;

      const selectedAd = selectAd(poolSource);
      if (selectedAd) {
        setCurrentAd(selectedAd);
      }
    };

    const timer = setInterval(rotateAd, intervalSec * 1000);
    return () => clearInterval(timer);
  }, [ads, currentAd, settings, isPremium, selectAd]);

  // Handle Impression Tracking using IntersectionObserver
  useEffect(() => {
    if (isPremium || !currentAd || !adRef.current) return;

    const adId = currentAd._id;

    // Create observer to log impression when ad remains visible for 1 second
    let timerId = null;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          // Ad is visible, start 1s timer to trigger impression
          timerId = setTimeout(() => {
            // Check if we already logged this ad in the current component mount lifecycle
            if (!loggedImpressions.current.has(adId)) {
              API.post(`/api/ads/${adId}/impression`)
                .then(() => {
                  loggedImpressions.current.add(adId);
                })
                .catch(err => console.error("Error logging impression:", err));
            }
          }, 1000);
        } else {
          // User scrolled away, cancel timer
          if (timerId) {
            clearTimeout(timerId);
          }
        }
      },
      { threshold: 0.5 } // Must be 50% visible in view
    );

    observer.observe(adRef.current);

    return () => {
      if (timerId) clearTimeout(timerId);
      observer.disconnect();
    };
  }, [currentAd, isPremium]);

  if (isPremium || !currentAd || closed) return null;

  const getAdImageStyle = () => {
    const baseImageStyle = {
      display: "block",
      borderRadius: "4px",
      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
      transition: "transform 0.2s",
      width: "100%",
      height: "auto",
    };

    switch (position) {
      case "HEADER_BANNER":
        return {
          ...baseImageStyle,
          maxHeight: "100px",
          objectFit: "contain"
        };
      case "TOP_BANNER":
        return {
          ...baseImageStyle,
          maxHeight: "clamp(90px, 20vw, 220px)",
          objectFit: "cover"
        };
      case "SIDEBAR":
        return {
          ...baseImageStyle,
          maxHeight: "450px",
          objectFit: "contain"
        };
      case "SECTION_BANNER":
        return {
          ...baseImageStyle,
          maxHeight: "clamp(80px, 15vw, 150px)",
          objectFit: "cover"
        };
      case "ARTICLE_ADVERTISEMENT":
        return {
          ...baseImageStyle,
          maxHeight: "clamp(75px, 12vw, 100px)",
          objectFit: "cover"
        };
      case "FLOATING_ADVERTISEMENT":
        return {
          ...baseImageStyle,
          maxHeight: "300px",
          objectFit: "contain"
        };
      default:
        return {
          ...baseImageStyle,
          objectFit: "contain"
        };
    }
  };

  // Format styles based on placement type
  const getContainerStyle = () => {
    const baseStyle = {
      background: "var(--bg-secondary, #f8fafc)",
      border: "1px solid var(--border-color, #e2e8f0)",
      borderRadius: "8px",
      padding: "6px",
      boxSizing: "border-box",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      overflow: "hidden",
      width: "100%",
      maxWidth: "100%",
      height: "auto"
    };

    switch (position) {
      case "HEADER_BANNER":
        return {
          ...baseStyle,
          maxWidth: "1150px",
          margin: "0",
          background: "transparent",
          border: "none",
          padding: 0,
          boxShadow: "none"
        };
      case "TOP_BANNER":
        return {
          ...baseStyle,
          maxWidth: "970px",
          margin: "15px auto"
        };
      case "SIDEBAR":
        return {
          ...baseStyle,
          maxWidth: "300px",
          margin: "15px auto"
        };
      case "SECTION_BANNER":
        return {
          ...baseStyle,
          maxWidth: "970px",
          margin: "20px auto"
        };
      case "ARTICLE_ADVERTISEMENT":
        return {
          ...baseStyle,
          maxWidth: "728px",
          margin: "20px auto"
        };
      case "FLOATING_ADVERTISEMENT":
        return {
          position: "fixed",
          bottom: "25px",
          right: "25px",
          width: "300px",
          height: "auto",
          zIndex: 9998,
          background: "var(--bg-secondary, #ffffff)",
          borderRadius: "12px",
          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.15)",
          padding: "12px",
          border: "1px solid var(--border-color, #e2e8f0)"
        };
      default:
        return {
          ...baseStyle,
          margin: "15px auto"
        };
    }
  };

  const getAdLabel = () => {
    return (
      <div style={{
        fontSize: "9px",
        color: "#94a3b8",
        textAlign: "center",
        textTransform: "uppercase",
        letterSpacing: "1px",
        margin: "0 0 3px 0",
        width: "100%"
      }}>
        Advertisement / விளம்பரம்
      </div>
    );
  };

  const handleAdClick = (e) => {
    const target = currentAd?.targetUrl || "";
    if (target.includes("/subscribe")) {
      e.preventDefault();
      // Track click in the background so stats are accurate
      API.get(`/api/ads/${currentAd._id}/click`)
        .catch(err => console.error("Error tracking click in background:", err));
      // Route internally
      navigate("/subscribe");
    }
  };

  // Redirection Link: directs through backend click-tracking route
  const adClickTrackUrl = `${API.defaults.baseURL || "http://localhost:5000"}/api/ads/${currentAd._id}/click`;
  const imgUrl = currentAd.image.startsWith("http") ? currentAd.image : `${API.defaults.baseURL || "http://localhost:5000"}${currentAd.image}`;

  return (
    <div style={getContainerStyle()} className={`ad-zone-${position.toLowerCase()}`}>
      <div style={{ 
        width: "100%", 
        height: "auto", 
        display: "flex", 
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        position: "relative" 
      }}>
        {position === "FLOATING_ADVERTISEMENT" && (
          <button 
            onClick={() => setClosed(true)}
            style={{
              position: "absolute",
              top: "-5px",
              right: "-5px",
              width: "22px",
              height: "22px",
              borderRadius: "50%",
              backgroundColor: "rgba(15, 23, 42, 0.7)",
              color: "white",
              border: "none",
              fontSize: "12px",
              fontWeight: "bold",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 10
            }}
          >
            &times;
          </button>
        )}
        {getAdLabel()}
        <a 
          href={adClickTrackUrl} 
          target="_blank" 
          rel="noopener noreferrer" 
          ref={adRef}
          onClick={handleAdClick}
          style={{ 
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
            height: "auto", 
            overflow: "hidden"
          }}
        >
          <img 
            src={imgUrl} 
            alt={currentAd.title} 
            style={getAdImageStyle()} 
            onMouseOver={(e) => e.currentTarget.style.transform = "scale(1.015)"}
            onMouseOut={(e) => e.currentTarget.style.transform = "scale(1)"}
          />
        </a>
      </div>
    </div>
  );
}

export default AdZone;

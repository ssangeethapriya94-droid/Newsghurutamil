import React, { useState, useEffect } from "react";
import { generateFCMToken } from "../firebase";
import API from "../config/api";
import "../styles/NotificationBanner.css";

function NotificationBanner() {
  const [visible, setVisible] = useState(false);
  const [status, setStatus] = useState("idle"); // idle | loading | success | denied

  useEffect(() => {
    if (!("Notification" in window)) return;

    if (Notification.permission === "default") {
      localStorage.removeItem("notif_banner_dismissed");
    }

    // If already granted, silently register token in background (no banner needed)
    // We do this REGARDLESS of the dismissed banner state so the token stays synchronized in the DB!
    if (Notification.permission === "granted") {
      registerToken();
      return;
    }

    // Show banner only if permission not yet decided and not previously dismissed
    const dismissed = localStorage.getItem("notif_banner_dismissed");
    if (dismissed) return;

    if (Notification.permission === "default") {
      // Small delay so it doesn't pop immediately on page load
      const timer = setTimeout(() => setVisible(true), 2500);
      return () => clearTimeout(timer);
    }
  }, []);

  const registerToken = async () => {
    try {
      const fcmToken = await generateFCMToken();
      if (fcmToken) {
        const readerToken = localStorage.getItem("readerToken");
        if (readerToken) {
          await API.post(
            "/api/users/subscribe",
            { fcmToken },
            { headers: { Authorization: `Bearer ${readerToken}` } }
          );
        } else {
          await API.post(
            "/api/users/subscribe-guest",
            { fcmToken, language: "ta" }
          );
        }
        // Store token locally for non-logged-in users too (backend can use it)
        localStorage.setItem("fcmToken", fcmToken);
      }
    } catch (err) {
      console.error("Failed to register FCM token:", err);
    }
  };

  const handleAllow = async () => {
    setStatus("loading");
    try {
      await registerToken();
      const currentPerm = Notification.permission;
      if (currentPerm === "granted") {
        setStatus("success");
        setTimeout(() => {
          setVisible(false);
          localStorage.setItem("notif_banner_dismissed", "1");
        }, 2000);
      } else {
        setStatus("denied");
      }
    } catch (err) {
      setStatus("denied");
    }
  };

  const handleDismiss = () => {
    setVisible(false);
    localStorage.setItem("notif_banner_dismissed", "1");
  };

  if (!visible) return null;

  return (
    <div className={`notif-banner ${status === "success" ? "notif-success" : ""}`}>
      {/* Left icon */}
      <div className="notif-banner-icon">
        {status === "loading" ? (
          <span className="notif-spinner" />
        ) : status === "success" ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
        )}
      </div>

      {/* Text */}
      <div className="notif-banner-text">
        {status === "success" ? (
          <>
            <strong>Subscribed!</strong>
            <span>You will now receive breaking news alerts.</span>
          </>
        ) : status === "denied" ? (
          <>
            <strong>Permission Denied</strong>
            <span>Enable notifications in your browser settings to receive alerts.</span>
          </>
        ) : (
          <>
            <strong>📰 Stay Updated with NewsGhuru!</strong>
            <span>Get instant breaking news alerts directly on your browser.</span>
          </>
        )}
      </div>

      {/* Actions */}
      {status === "idle" && (
        <div className="notif-banner-actions">
          <button className="notif-allow-btn" onClick={handleAllow}>
            Allow
          </button>
          <button className="notif-dismiss-btn" onClick={handleDismiss} title="Not now">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      )}

      {(status === "denied") && (
        <button className="notif-dismiss-btn" onClick={handleDismiss} title="Close">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      )}
    </div>
  );
}

export default NotificationBanner;

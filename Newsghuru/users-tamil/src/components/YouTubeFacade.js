import React, { useState } from "react";

/**
 * YouTubeFacade
 * -------------
 * Renders a thumbnail + play-button instead of loading the YouTube
 * iframe immediately. The real iframe is injected only when the user
 * clicks play, eliminating the continuous youtube-nocookie.com
 * log_event telemetry calls (and the resulting ERR_BLOCKED_BY_CLIENT
 * errors) until the user actually wants to watch the video.
 *
 * Props:
 *   videoId   – YouTube video ID (required)
 *   title     – accessible title string (optional)
 *   style     – extra inline styles for the outer wrapper (optional)
 *   className – extra class names for the outer wrapper (optional)
 *   autoplay  – if true, the iframe autoplays when activated (default: true)
 */
const YouTubeFacade = ({ videoId, title = "YouTube Video", style = {}, className = "", autoplay = true }) => {
  const [activated, setActivated] = useState(false);

  if (!videoId) return null;

  const thumbnailUrl = `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;
  const embedSrc = `https://www.youtube-nocookie.com/embed/${videoId}?${autoplay ? "autoplay=1&" : ""}rel=0&modestbranding=1`;

  const wrapperStyle = {
    position: "relative",
    paddingBottom: "56.25%",
    height: 0,
    overflow: "hidden",
    borderRadius: "8px",
    backgroundColor: "#000",
    cursor: "pointer",
    ...style,
  };

  return (
    <div
      className={`yt-facade-wrapper ${className}`}
      style={wrapperStyle}
      onClick={() => setActivated(true)}
      title={title}
    >
      {activated ? (
        /* ── Real iframe — loaded only after click ── */
        <iframe
          src={embedSrc}
          title={title}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            border: "none",
          }}
        />
      ) : (
        /* ── Facade: thumbnail + play button ── */
        <>
          {/* Thumbnail */}
          <img
            src={thumbnailUrl}
            alt={title}
            loading="lazy"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
            onError={(e) => {
              // Fallback chain: maxresdefault → sddefault → hqdefault → mqdefault
              const src = e.target.src;
              if (src.includes("maxresdefault")) {
                e.target.src = `https://i.ytimg.com/vi/${videoId}/sddefault.jpg`;
              } else if (src.includes("sddefault")) {
                e.target.src = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
              } else if (src.includes("hqdefault")) {
                e.target.src = `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`;
              }
            }}
          />

          {/* Dark overlay for better play button contrast */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(0,0,0,0.25)",
              transition: "background 0.2s",
            }}
            className="yt-facade-overlay"
          />

          {/* YouTube-style play button */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "64px",
              height: "44px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/* Red rounded rectangle */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                backgroundColor: "#FF0000",
                borderRadius: "12px",
                boxShadow: "0 2px 12px rgba(0,0,0,0.5)",
                transition: "transform 0.15s ease, background-color 0.15s ease",
              }}
              className="yt-facade-btn-bg"
            />
            {/* White triangle */}
            <svg
              style={{ position: "relative", zIndex: 1 }}
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="white"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>

          {/* Video title label at the bottom */}
          {title && (
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                padding: "28px 10px 8px",
                background: "linear-gradient(transparent, rgba(0,0,0,0.75))",
                color: "#fff",
                fontSize: "0.78rem",
                fontWeight: 600,
                lineHeight: 1.3,
                overflow: "hidden",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
              }}
            >
              {title}
            </div>
          )}
        </>
      )}

      {/* Hover effect via a tiny injected style block */}
      <style>{`
        .yt-facade-wrapper:hover .yt-facade-overlay {
          background: rgba(0,0,0,0.12) !important;
        }
        .yt-facade-wrapper:hover .yt-facade-btn-bg {
          transform: scale(1.1);
          background-color: #CC0000 !important;
        }
      `}</style>
    </div>
  );
};

export default YouTubeFacade;

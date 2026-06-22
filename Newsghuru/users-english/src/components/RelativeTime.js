import React, { useState, useEffect } from "react";

const RelativeTime = ({ createdAt, fallback }) => {
  const [relativeTime, setRelativeTime] = useState("");

  useEffect(() => {
    const getRelativeTimeText = () => {
      if (!createdAt) return fallback || "Just now";

      const createdDate = new Date(createdAt);
      const now = new Date();
      const diffMs = now - createdDate;
      const diffMins = Math.floor(diffMs / 60000);

      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins} mins ago`;

      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours} hours ago`;

      const diffDays = Math.floor(diffHours / 24);
      if (diffDays < 30) return `${diffDays} days ago`;

      return createdDate.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    };

    setRelativeTime(getRelativeTimeText());

    const interval = setInterval(() => {
      setRelativeTime(getRelativeTimeText());
    }, 30000); // update every 30 seconds

    return () => clearInterval(interval);
  }, [createdAt, fallback]);

  return <span>{relativeTime}</span>;
};

export default RelativeTime;
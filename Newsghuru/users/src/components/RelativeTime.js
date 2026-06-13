import React, { useState, useEffect } from "react";

const RelativeTime = ({ createdAt, fallback }) => {
  const [relativeTime, setRelativeTime] = useState("");

  useEffect(() => {
    const getRelativeTimeText = () => {
      if (!createdAt) return fallback || "இப்போதே";

      const createdDate = new Date(createdAt);
      const now = new Date();
      const diffMs = now - createdDate;
      const diffMins = Math.floor(diffMs / 60000);

      if (diffMins < 1) return "இப்போதே";
      if (diffMins < 60) return `${diffMins} நிமிடம் முன்பு`;

      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours} மணி நேரம் முன்பு`;

      const diffDays = Math.floor(diffHours / 24);
      if (diffDays < 30) return `${diffDays} நாட்கள் முன்பு`;

      return createdDate.toLocaleDateString("ta-IN", {
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
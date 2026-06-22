import { useEffect } from "react";

const useSEO = ({ title, description, keywords, ogTitle, ogDescription }) => {
  useEffect(() => {
    // Title
    if (title) {
      document.title = `${title} | நியூஸ் குரு`;
    } else {
      document.title = "நியூஸ் குரு | தமிழ் செய்திகள்";
    }

    // Description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        "content",
        description || "நியூஸ் குரு - தமிழ் செய்திகள், அரசியல், விளையாட்டு, சினிமா மற்றும் தொழில்நுட்ப செய்திகள்"
      );
    }

    // Keywords
    const metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords) {
      metaKeywords.setAttribute(
        "content",
        keywords || "தமிழ் செய்திகள், நியூஸ் குரு, பிரேக்கிங் நியூஸ், அரசியல், விளையாட்டு, சினிமா, தொழில்நுட்பம்"
      );
    }

    // OG Title
    const ogTitleTag = document.querySelector('meta[property="og:title"]');
    if (ogTitleTag) {
      ogTitleTag.setAttribute("content", ogTitle || title || "நியூஸ் குரு");
    }

    // OG Description
    const ogDescTag = document.querySelector('meta[property="og:description"]');
    if (ogDescTag) {
      ogDescTag.setAttribute(
        "content",
        ogDescription || description || "சமீபத்திய தமிழ் செய்திகள், முக்கிய செய்திகள், அரசியல், சினிமா, விளையாட்டு மற்றும் பல."
      );
    }
  }, [title, description, keywords, ogTitle, ogDescription]);
};

export default useSEO;

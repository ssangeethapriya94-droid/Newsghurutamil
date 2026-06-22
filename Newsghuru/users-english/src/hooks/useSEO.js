import { useEffect } from "react";

const useSEO = ({ title, description, keywords, ogTitle, ogDescription }) => {
  useEffect(() => {
    // Title
    if (title) {
      document.title = `${title} | News Ghuru`;
    } else {
      document.title = "News Ghuru | English News";
    }

    // Description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        "content",
        description || "News Ghuru - Latest English news, politics, sports, cinema, business, and technology news updates"
      );
    }

    // Keywords
    const metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords) {
      metaKeywords.setAttribute(
        "content",
        keywords || "English news, News Ghuru, breaking news, politics, sports, cinema, technology, business"
      );
    }

    // OG Title
    const ogTitleTag = document.querySelector('meta[property="og:title"]');
    if (ogTitleTag) {
      ogTitleTag.setAttribute("content", ogTitle || title || "News Ghuru");
    }

    // OG Description
    const ogDescTag = document.querySelector('meta[property="og:description"]');
    if (ogDescTag) {
      ogDescTag.setAttribute(
        "content",
        ogDescription || description || "Latest English news, breaking stories, politics, cinema, sports, technology, and more."
      );
    }
  }, [title, description, keywords, ogTitle, ogDescription]);
};

export default useSEO;

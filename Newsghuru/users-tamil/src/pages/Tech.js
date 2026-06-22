import React from "react";
import CategoryPage from "../components/CategoryPage";
import useSEO from "../hooks/useSEO";

const Tech = () => {
  useSEO({
    title: "தொழில்நுட்பம் செய்திகள் | நியூஸ் குரு",
    description: "AI, Mobile, Gadgets மற்றும் தொழில்நுட்ப செய்திகள்",
    keywords: "தொழில்நுட்பம் செய்திகள், AI, Technology News Tamil, Gadgets",
  });
  return (
    <CategoryPage
      categorySlug="tech"
      title="தொழில்நுட்பம்"
      subtitle="AI, மொபைல், கேட்ஜெட்கள் மற்றும் தொழில்நுட்ப உலக செய்திகள்"
      headerColor="linear-gradient(135deg, #0f172a, #334155)"
      icon="💻"
    />
  );
};
export default Tech;

import React from "react";
import CategoryPage from "../components/CategoryPage";
import useSEO from "../hooks/useSEO";

const Tech = () => {
  useSEO({
    title: "Technology News | Newsghuru",
    description: "AI, mobiles, gadgets, and tech industry news updates.",
    keywords: "technology news, AI, gadgets, mobiles, newsghuru",
  });
  return (
    <CategoryPage
      categorySlug="tech"
      title="Technology"
      subtitle="Latest updates from AI, mobiles, gadgets, and the tech world"
      headerColor="linear-gradient(135deg, #0f172a, #334155)"
      icon="💻"
    />
  );
};
export default Tech;

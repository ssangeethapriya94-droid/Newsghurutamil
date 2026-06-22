import React from "react";
import CategoryPage from "../components/CategoryPage";
import useSEO from "../hooks/useSEO";

const India = () => {
  useSEO({
    title: "India News | Newsghuru",
    description: "Major news stories and national events from India.",
    keywords: "india news, national news, new delhi, indian news, newsghuru",
  });
  return (
    <CategoryPage
      categorySlug="india"
      title="India"
      subtitle="Major national news and updates from India"
      headerColor="linear-gradient(135deg, #f97316, #fbbf24)"
      icon="🇮🇳"
    />
  );
};
export default India;
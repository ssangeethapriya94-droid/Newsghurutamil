import React from "react";
import CategoryPage from "../components/CategoryPage";
import useSEO from "../hooks/useSEO";

const World = () => {
  useSEO({
    title: "World News | Newsghuru",
    description: "Major news stories and international updates from around the globe.",
    keywords: "world news, international news, global updates, newsghuru",
  });
  return (
    <CategoryPage
      categorySlug="world"
      title="World"
      subtitle="Major news stories and international updates from around the globe"
      headerColor="linear-gradient(135deg, #0ea5e9, #6366f1)"
      icon="🌍"
    />
  );
};
export default World;
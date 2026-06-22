import React from "react";
import CategoryPage from "../components/CategoryPage";
import useSEO from "../hooks/useSEO";

const Sports = () => {
  useSEO({
    title: "Sports News | Newsghuru",
    description: "Cricket, football, tennis, IPL, and other sports news.",
    keywords: "sports news, cricket, football, IPL, newsghuru",
  });
  return (
    <CategoryPage
      categorySlug="sports"
      title="Sports"
      subtitle="Latest updates and live scores from the world of sports"
      headerColor="linear-gradient(135deg, #7c3aed, #a855f7)"
      icon="🏆"
    />
  );
};
export default Sports;
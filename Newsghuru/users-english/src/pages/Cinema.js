import React from "react";
import CategoryPage from "../components/CategoryPage";
import useSEO from "../hooks/useSEO";

const Cinema = () => {
  useSEO({
    title: "Cinema News | Newsghuru",
    description: "Entertainment, cinema reviews, and box office updates.",
    keywords: "cinema news, entertainment, reviews, newsghuru",
  });
  return (
    <CategoryPage
      categorySlug="cinema"
      title="Cinema"
      subtitle="Entertainment, cinema reviews, and box office updates"
      headerColor="linear-gradient(135deg, #db2777, #ec4899)"
      icon="🎬"
    />
  );
};
export default Cinema;
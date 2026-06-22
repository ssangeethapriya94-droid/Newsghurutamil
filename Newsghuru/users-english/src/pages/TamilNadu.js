import React from "react";
import CategoryPage from "../components/CategoryPage";
import useSEO from "../hooks/useSEO";

const TamilNadu = () => {
  useSEO({
    title: "Tamil Nadu News | Newsghuru",
    description: "Important news, district reports, and updates from Chennai and across Tamil Nadu.",
    keywords: "tamil nadu news, chennai news, district news, newsghuru",
  });

  return (
    <CategoryPage
      categorySlug="tamil"
      title="Tamil Nadu"
      subtitle="Latest politics, local updates, and breaking news from Tamil Nadu"
      headerColor="linear-gradient(135deg, #ea580c, #f59e0b)"
      icon="🗺"
    />
  );
};

export default TamilNadu;
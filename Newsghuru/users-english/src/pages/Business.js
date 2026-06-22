import React from "react";
import CategoryPage from "../components/CategoryPage";
import useSEO from "../hooks/useSEO";

const Business = () => {
  useSEO({
    title: "Business News | Newsghuru",
    description: "Stock market, industry, economic, and business news.",
    keywords: "business news, stock market, economy, newsghuru",
  });
  return (
    <CategoryPage
      categorySlug="business"
      title="Business"
      subtitle="Latest updates from stock market, industry, and economy"
      headerColor="linear-gradient(135deg, #059669, #10b981)"
      icon="💼"
    />
  );
};
export default Business;
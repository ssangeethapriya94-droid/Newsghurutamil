import React from "react";
import CategoryPage from "../components/CategoryPage";
import useSEO from "../hooks/useSEO";

const Politics = () => {
  useSEO({
    title: "Politics News | Newsghuru",
    description: "Major political news and updates from India and around the globe.",
    keywords: "politics news, political updates, government news, elections, newsghuru",
  });
  return (
    <CategoryPage
      categorySlug="politics"
      title="Politics"
      subtitle="Latest updates and insights on political developments"
      headerColor="linear-gradient(135deg, #dc2626, #b91c1c)"
      icon="🏛"
    />
  );
};
export default Politics;
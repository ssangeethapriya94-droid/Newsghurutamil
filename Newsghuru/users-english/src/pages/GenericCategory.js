import React from "react";
import { useParams } from "react-router-dom";
import CategoryPage from "../components/CategoryPage";
import useSEO from "../hooks/useSEO";

const categoryMetaMap = {
  health:     { title: "Health",      subtitle: "Health and medical news updates",           headerColor: "linear-gradient(135deg, #16a34a, #22c55e)", icon: "🏥" },
  lifestyle:  { title: "Lifestyle",   subtitle: "Lifestyle, wellness, and trends",            headerColor: "linear-gradient(135deg, #0d9488, #14b8a6)", icon: "🌿" },
  automobile: { title: "Automobile",  subtitle: "New vehicles, price reviews, and technology",  headerColor: "linear-gradient(135deg, #475569, #64748b)", icon: "🚗" },
};

const GenericCategory = () => {
  const { categoryName } = useParams();
  const meta = categoryMetaMap[categoryName?.toLowerCase()] || {
    title: categoryName || "News",
    subtitle: `${categoryName} news and updates`,
    headerColor: "linear-gradient(135deg, #ea580c, #f59e0b)",
    icon: "📰",
  };

  useSEO({
    title: `${meta.title} News | Newsghuru`,
    description: meta.subtitle,
  });

  return (
    <CategoryPage
      categorySlug={categoryName}
      title={meta.title}
      subtitle={meta.subtitle}
      headerColor={meta.headerColor}
      icon={meta.icon}
    />
  );
};

export default GenericCategory;

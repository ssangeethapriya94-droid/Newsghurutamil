import React from "react";
import { useParams } from "react-router-dom";
import CategoryPage from "../components/CategoryPage";
import useSEO from "../hooks/useSEO";

const categoryMetaMap = {
  health:     { title: "சுகாதாரம்",      subtitle: "ஆரோக்கியம் மற்றும் மருத்துவ செய்திகள்",           headerColor: "linear-gradient(135deg, #16a34a, #22c55e)", icon: "🏥" },
  lifestyle:  { title: "வாழ்க்கை முறை", subtitle: "வாழ்க்கை, உடல் நலம் மற்றும் பொழுதுபோக்கு",     headerColor: "linear-gradient(135deg, #0d9488, #14b8a6)", icon: "🌿" },
  spiritual:  { title: "ஆன்மீகம்",       subtitle: "ஆன்மீகம், ஜோதிடம் மற்றும் பண்பாட்டு செய்திகள்", headerColor: "linear-gradient(135deg, #d97706, #f59e0b)", icon: "🕉" },
  automobile: { title: "வாகனங்கள்",      subtitle: "புதிய வாகனங்கள், விலை மற்றும் தொழில்நுட்பம்",   headerColor: "linear-gradient(135deg, #475569, #64748b)", icon: "🚗" },
};

const GenericCategory = () => {
  const { categoryName } = useParams();
  const meta = categoryMetaMap[categoryName?.toLowerCase()] || {
    title: categoryName || "செய்திகள்",
    subtitle: `${categoryName} தொடர்பான செய்திகள்`,
    headerColor: "linear-gradient(135deg, #ea580c, #f59e0b)",
    icon: "📰",
  };

  useSEO({
    title: `${meta.title} செய்திகள் | நியூஸ் குரு`,
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

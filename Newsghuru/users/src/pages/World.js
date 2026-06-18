import React from "react";
import CategoryPage from "../components/CategoryPage";
import useSEO from "../hooks/useSEO";

const World = () => {
  useSEO({
    title: "உலக செய்திகள் | நியூஸ் குரு",
    description: "உலக நாடுகளில் நடக்கும் முக்கிய செய்திகள் மற்றும் சர்வதேச நிகழ்வுகள்",
    keywords: "உலக செய்திகள், சர்வதேச செய்திகள், World News, International",
  });
  return (
    <CategoryPage
      categorySlug="world"
      title="உலகம்"
      subtitle="உலக நாடுகளில் நடக்கும் முக்கிய சர்வதேச செய்திகள்"
      headerColor="linear-gradient(135deg, #0ea5e9, #6366f1)"
      icon="🌍"
    />
  );
};
export default World;
import React from "react";
import CategoryPage from "../components/CategoryPage";
import useSEO from "../hooks/useSEO";

const India = () => {
  useSEO({
    title: "இந்தியா செய்திகள் | நியூஸ் குரு",
    description: "இந்தியாவின் முக்கிய செய்திகள் மற்றும் தேசிய நிகழ்வுகள்",
    keywords: "இந்தியா செய்திகள், தேசிய செய்திகள், New Delhi, Indian News",
  });
  return (
    <CategoryPage
      categorySlug="india"
      title="இந்தியா"
      subtitle="இந்தியாவின் முக்கிய தேசிய செய்திகள் மற்றும் நிகழ்வுகள்"
      headerColor="linear-gradient(135deg, #f97316, #fbbf24)"
      icon="🇮🇳"
    />
  );
};
export default India;
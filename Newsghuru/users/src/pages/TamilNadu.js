import React from "react";
import CategoryPage from "../components/CategoryPage";
import useSEO from "../hooks/useSEO";

const TamilNadu = () => {
  useSEO({
    title: "தமிழகம் செய்திகள் | நியூஸ் குரு",
    description: "தமிழகத்தின் முக்கிய செய்திகள், மாவட்ட செய்திகள் மற்றும் சென்னை செய்திகள்",
    keywords: "தமிழகம் செய்திகள், மாவட்ட செய்திகள், சென்னை செய்திகள், தமிழ்நாடு",
  });

  return (
    <CategoryPage
      categorySlug="tamil"
      title="தமிழகம்"
      subtitle="தமிழகத்தின் முக்கிய அரசியல் மற்றும் உடனடி செய்திகளை அறியுங்கள்"
      headerColor="linear-gradient(135deg, #ea580c, #f59e0b)"
      icon="🗺"
    />
  );
};

export default TamilNadu;
import React from "react";
import CategoryPage from "../components/CategoryPage";
import useSEO from "../hooks/useSEO";

const Education = () => {
  useSEO({
    title: "கல்வி செய்திகள் | நியூஸ் குரு",
    description: "பள்ளி, கல்லூரி, தேர்வுகள் மற்றும் கல்வி செய்திகள்",
    keywords: "கல்வி செய்திகள், தேர்வு, Education News Tamil, Schools",
  });
  return (
    <CategoryPage
      categorySlug="education"
      title="கல்வி"
      subtitle="பள்ளி, கல்லூரி, தேர்வுகள் மற்றும் கல்வி தொடர்பான செய்திகள்"
      headerColor="linear-gradient(135deg, #0284c7, #0ea5e9)"
      icon="📚"
    />
  );
};
export default Education;
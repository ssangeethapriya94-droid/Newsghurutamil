import React from "react";
import CategoryPage from "../components/CategoryPage";
import useSEO from "../hooks/useSEO";

const Business = () => {
  useSEO({
    title: "வணிகம் செய்திகள் | நியூஸ் குரு",
    description: "பங்கு சந்தை, தொழில், பொருளாதார மற்றும் வணிக செய்திகள்",
    keywords: "வணிக செய்திகள், பங்கு சந்தை, Business News Tamil, Economy",
  });
  return (
    <CategoryPage
      categorySlug="business"
      title="வணிகம்"
      subtitle="பங்கு சந்தை, தொழில் மற்றும் பொருளாதார முக்கிய செய்திகள்"
      headerColor="linear-gradient(135deg, #059669, #10b981)"
      icon="💼"
    />
  );
};
export default Business;
import React from "react";
import CategoryPage from "../components/CategoryPage";
import useSEO from "../hooks/useSEO";

const Sports = () => {
  useSEO({
    title: "விளையாட்டு செய்திகள் | நியூஸ் குரு",
    description: "கிரிக்கெட், கால்பந்து, IPL மற்றும் விளையாட்டு செய்திகள்",
    keywords: "விளையாட்டு செய்திகள், கிரிக்கெட், IPL, Sports News Tamil",
  });
  return (
    <CategoryPage
      categorySlug="sports"
      title="விளையாட்டு"
      subtitle="கிரிக்கெட், கால்பந்து, IPL மற்றும் அனைத்து விளையாட்டு செய்திகள்"
      headerColor="linear-gradient(135deg, #7c3aed, #a855f7)"
      icon="🏆"
    />
  );
};
export default Sports;
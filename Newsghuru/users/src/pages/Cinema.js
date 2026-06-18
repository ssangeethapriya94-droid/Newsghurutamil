import React from "react";
import CategoryPage from "../components/CategoryPage";
import useSEO from "../hooks/useSEO";

const Cinema = () => {
  useSEO({
    title: "சினிமா செய்திகள் | நியூஸ் குரு",
    description: "தமிழ் சினிமா, கோலிவுட் மற்றும் திரை உலக செய்திகள்",
    keywords: "சினிமா செய்திகள், கோலிவுட், Tamil Cinema News, Kollywood",
  });
  return (
    <CategoryPage
      categorySlug="cinema"
      title="சினிமா"
      subtitle="தமிழ் சினிமா, கோலிவுட் மற்றும் திரை உலக செய்திகள்"
      headerColor="linear-gradient(135deg, #db2777, #ec4899)"
      icon="🎬"
    />
  );
};
export default Cinema;
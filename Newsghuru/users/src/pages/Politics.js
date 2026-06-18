import React from "react";
import CategoryPage from "../components/CategoryPage";
import useSEO from "../hooks/useSEO";

const Politics = () => {
  useSEO({
    title: "அரசியல் செய்திகள் | நியூஸ் குரு",
    description: "இந்தியா மற்றும் தமிழகத்தின் முக்கிய அரசியல் செய்திகள்",
    keywords: "அரசியல் செய்திகள், DMK, AIADMK, BJP, Politics News Tamil",
  });
  return (
    <CategoryPage
      categorySlug="politics"
      title="அரசியல்"
      subtitle="இந்தியா மற்றும் தமிழகத்தின் முக்கிய அரசியல் செய்திகள் மற்றும் கட்சி நிகழ்வுகள்"
      headerColor="linear-gradient(135deg, #dc2626, #b91c1c)"
      icon="🏛"
    />
  );
};
export default Politics;
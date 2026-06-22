import React from "react";
import CategoryPage from "../components/CategoryPage";
import useSEO from "../hooks/useSEO";

const Education = () => {
  useSEO({
    title: "Education News | Newsghuru",
    description: "School, college, exams, and education news.",
    keywords: "education news, exams, school news, college news, newsghuru",
  });
  return (
    <CategoryPage
      categorySlug="education"
      title="Education"
      subtitle="Latest updates from school, college, exams, and education sector"
      headerColor="linear-gradient(135deg, #7c3aed, #8b5cf6)"
      icon="🎓"
    />
  );
};
export default Education;
const express = require("express");
const router = express.Router();
const HomepageConfig = require("../models/HomepageConfig");
const { verifyToken, authorizeRoles } = require("../middleware/authMiddleware");

// Default sections for initialization
const DEFAULT_SECTIONS = [
  { id: "breaking", titleTa: "முக்கிய செய்திகள்", titleEn: "Breaking News", isEnabled: true, order: 1 },
  { id: "hero", titleTa: "தலைப்புச் செய்திகள்", titleEn: "Top Stories", isEnabled: true, order: 2 },
  { id: "latest", titleTa: "சமீபத்திய செய்திகள்", titleEn: "Latest News", isEnabled: true, order: 3 },
  { id: "politics", titleTa: "அரசியல்", titleEn: "Politics", isEnabled: true, order: 4 },
  { id: "cinema", titleTa: "சினிமா", titleEn: "Cinema", isEnabled: true, order: 5 },
  { id: "sports", titleTa: "விளையாட்டு", titleEn: "Sports", isEnabled: true, order: 6 },
  { id: "tech", titleTa: "தொழில்நுட்பம்", titleEn: "Technology", isEnabled: true, order: 7 },
  { id: "business", titleTa: "வணிகம் & வர்த்தகம்", titleEn: "Business & Markets", isEnabled: true, order: 8 },
  { id: "videos", titleTa: "வீடியோக்கள்", titleEn: "Video News", isEnabled: true, order: 9 },
  { id: "shorts", titleTa: "சார்ட்ஸ்", titleEn: "Shorts Reels", isEnabled: true, order: 10 },
  { id: "photos", titleTa: "புகைப்படக் கதைகள்", titleEn: "Photo Stories", isEnabled: true, order: 11 },
  { id: "editors", titleTa: "ஆசிரியர் தேர்வு", titleEn: "Editor's Picks", isEnabled: true, order: 12 }
];

// GET /api/homepage-config - Get the homepage layout and references
router.get("/", async (req, res) => {
  try {
    let config = await HomepageConfig.findOne()
      .populate("heroStory")
      .populate("trendingStories")
      .populate("editorPicks")
      .populate("featuredVideos")
      .populate("featuredShorts");

    if (!config) {
      // Create a default one if it doesn't exist
      config = new HomepageConfig({
        heroStory: null,
        trendingStories: [],
        editorPicks: [],
        featuredVideos: [],
        featuredShorts: [],
        sections: DEFAULT_SECTIONS
      });
      await config.save();
      
      // Populate it again
      config = await HomepageConfig.findOne()
        .populate("heroStory")
        .populate("trendingStories")
        .populate("editorPicks")
        .populate("featuredVideos")
        .populate("featuredShorts");
    }

    res.json(config);
  } catch (error) {
    console.error("Error fetching homepage config:", error);
    res.status(500).json({ message: "Server error fetching homepage configuration" });
  }
});

// PUT /api/homepage-config - Update homepage layout (Admin only)
router.put("/", verifyToken, authorizeRoles("admin"), async (req, res) => {
  try {
    const { heroStory, trendingStories, editorPicks, featuredVideos, featuredShorts, sections } = req.body;
    
    let config = await HomepageConfig.findOne();
    if (!config) {
      config = new HomepageConfig({
        sections: DEFAULT_SECTIONS
      });
    }

    if (heroStory !== undefined) config.heroStory = heroStory || null;
    if (trendingStories !== undefined) config.trendingStories = trendingStories;
    if (editorPicks !== undefined) config.editorPicks = editorPicks;
    if (featuredVideos !== undefined) config.featuredVideos = featuredVideos;
    if (featuredShorts !== undefined) config.featuredShorts = featuredShorts;
    if (sections !== undefined && Array.isArray(sections)) {
      config.sections = sections;
    }

    await config.save();

    // Return the populated updated config
    const updatedConfig = await HomepageConfig.findOne()
      .populate("heroStory")
      .populate("trendingStories")
      .populate("editorPicks")
      .populate("featuredVideos")
      .populate("featuredShorts");

    res.json(updatedConfig);
  } catch (error) {
    console.error("Error updating homepage config:", error);
    res.status(500).json({ message: "Server error updating homepage configuration" });
  }
});

module.exports = router;

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
  { id: "tamil", titleTa: "தமிழ்நாடு", titleEn: "Tamil Nadu", isEnabled: true, order: 9 },
  { id: "shorts", titleTa: "சார்ட்ஸ்", titleEn: "Shorts Reels", isEnabled: true, order: 10 },
  { id: "photos", titleTa: "புகைப்படக் கதைகள்", titleEn: "Photo Stories", isEnabled: true, order: 11 },
  { id: "editors", titleTa: "ஆசிரியர் தேர்வு", titleEn: "Editor's Picks", isEnabled: true, order: 12 }
];

const DEFAULT_SIDEBAR_WIDGETS = [
  { id: "ad1", titleTa: "விளம்பரம் 1", titleEn: "Advertisement 1", isEnabled: true, order: 1 },
  { id: "trending", titleTa: "டிரெண்டிங் செய்திகள்", titleEn: "Trending News", isEnabled: true, order: 2 },
  { id: "ad2", titleTa: "விளம்பரம் 2", titleEn: "Advertisement 2", isEnabled: true, order: 3 },
  { id: "mostRead", titleTa: "அதிகம் வாசிக்கப்பட்டவை", titleEn: "Most Read", isEnabled: true, order: 4 },
  { id: "ad3", titleTa: "விளம்பரம் 3 (தொடரும் விளம்பரம்)", titleEn: "Advertisement 3 (Sticky)", isEnabled: true, order: 5 },
  { id: "ad4", titleTa: "விளம்பரம் 4", titleEn: "Advertisement 4", isEnabled: true, order: 6 },
  { id: "cinema", titleTa: "சினிமா செய்திகள்", titleEn: "Cinema News", isEnabled: true, order: 7 },
  { id: "poll", titleTa: "கருத்துக் கணிப்பு", titleEn: "Reader Poll", isEnabled: true, order: 8 },
  { id: "score", titleTa: "விளையாட்டு ஸ்கோர்போர்டு", titleEn: "Cricket Scoreboard", isEnabled: true, order: 9 }
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
        sections: DEFAULT_SECTIONS,
        sidebarWidgets: DEFAULT_SIDEBAR_WIDGETS,
        mostReadSettings: {
          limit: 5,
          showViews: true,
          minViews: 0
        }
      });
      await config.save();
      
      // Populate it again
      config = await HomepageConfig.findOne()
        .populate("heroStory")
        .populate("trendingStories")
        .populate("editorPicks")
        .populate("featuredVideos")
        .populate("featuredShorts");
      let needsSave = false;
      if (!config.sidebarWidgets || config.sidebarWidgets.length === 0) {
        config.sidebarWidgets = DEFAULT_SIDEBAR_WIDGETS;
        needsSave = true;
      } else {
        const originalCount = config.sidebarWidgets.length;
        config.sidebarWidgets = config.sidebarWidgets.filter(
          w => w.id !== "rates" && w.id !== "weather" && w.id !== "shorts"
        );
        if (config.sidebarWidgets.length !== originalCount) {
          needsSave = true;
        }
      }
      if (!config.mostReadSettings) {
        config.mostReadSettings = {
          limit: 5,
          showViews: true,
          minViews: 0
        };
        needsSave = true;
      }
      if (needsSave) {
        await config.save();
      }

      // Migrate "videos" section to "tamil" (Tamil Nadu) in sections configuration
      if (config.sections && config.sections.length > 0) {
        let sectionsUpdated = false;
        config.sections = config.sections.map(sec => {
          if (sec.id === "videos") {
            sectionsUpdated = true;
            return {
              id: "tamil",
              titleTa: "தமிழ்நாடு",
              titleEn: "Tamil Nadu",
              isEnabled: sec.isEnabled,
              order: sec.order
            };
          }
          return sec;
        });
        if (sectionsUpdated) {
          config.markModified("sections");
          await config.save();
        }
      }
    }

    res.json(config);
  } catch (error) {
    console.error("Error fetching homepage config:", error);
    res.status(500).json({ message: "Server error fetching homepage configuration" });
  }
});

// PUT /api/homepage-config - Update homepage layout (Admin only)
router.put("/", verifyToken, authorizeRoles("admin", "editor"), async (req, res) => {
  try {
    const { heroStory, trendingStories, editorPicks, featuredVideos, featuredShorts, sections, sidebarWidgets, mostReadSettings } = req.body;
    
    let config = await HomepageConfig.findOne();
    if (!config) {
      config = new HomepageConfig({
        sections: DEFAULT_SECTIONS,
        sidebarWidgets: DEFAULT_SIDEBAR_WIDGETS,
        mostReadSettings: {
          limit: 5,
          showViews: true,
          minViews: 0
        }
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
    if (sidebarWidgets !== undefined && Array.isArray(sidebarWidgets)) {
      config.sidebarWidgets = sidebarWidgets.filter(
        w => w.id !== "rates" && w.id !== "weather" && w.id !== "shorts"
      );
    }
    if (mostReadSettings !== undefined && typeof mostReadSettings === "object") {
      config.mostReadSettings = mostReadSettings;
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

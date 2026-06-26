const express = require("express");
const router = express.Router();
const Video = require("../models/Video");
const { verifyToken, authorizeRoles } = require("../middleware/authMiddleware");

// GET /api/videos - Get all videos
router.get("/", async (req, res) => {
  try {
    const query = {};
    const lang = req.query.language || "ta";
    if (lang !== "all") {
      query.language = lang;
    }
    if (req.query.category) {
      query.category = { $regex: new RegExp(`^${req.query.category}$`, "i") };
    }
    const videos = await Video.find(query).sort({ publishedAt: -1, createdAt: -1 });
    res.json(videos);
  } catch (error) {
    console.error("Error fetching videos:", error);
    res.status(500).json({ message: "Server error fetching videos" });
  }
});

// GET /api/videos/:id - Get a single video
router.get("/:id", async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }
    // Increment view count
    video.views += 1;
    await video.save();
    res.json(video);
  } catch (error) {
    console.error("Error fetching video details:", error);
    res.status(500).json({ message: "Server error fetching video details" });
  }
});

// POST /api/videos - Create a video (Admin only)
router.post("/", verifyToken, authorizeRoles("admin"), async (req, res) => {
  try {
    const { title, thumbnail, youtubeUrl, description, category, isFeatured, isTrending, language } = req.body;
    if (!title || !thumbnail || !youtubeUrl) {
      return res.status(400).json({ message: "Title, thumbnail, and YouTube URL are required" });
    }

    const video = new Video({
      title,
      thumbnail,
      youtubeUrl,
      description,
      category,
      isFeatured: !!isFeatured,
      isTrending: !!isTrending,
      language: language || "ta"
    });

    const saved = await video.save();
    res.status(201).json(saved);
  } catch (error) {
    console.error("Error creating video:", error);
    res.status(500).json({ message: "Server error creating video" });
  }
});

// PUT /api/videos/:id - Update a video (Admin only)
router.put("/:id", verifyToken, authorizeRoles("admin"), async (req, res) => {
  try {
    const { title, thumbnail, youtubeUrl, description, category, isFeatured, isTrending, views, language } = req.body;
    const video = await Video.findById(req.params.id);
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    if (title !== undefined) video.title = title;
    if (thumbnail !== undefined) video.thumbnail = thumbnail;
    if (youtubeUrl !== undefined) video.youtubeUrl = youtubeUrl;
    if (description !== undefined) video.description = description;
    if (category !== undefined) video.category = category;
    if (isFeatured !== undefined) video.isFeatured = !!isFeatured;
    if (isTrending !== undefined) video.isTrending = !!isTrending;
    if (views !== undefined) video.views = Number(views);
    if (language !== undefined) video.language = language;

    const updated = await video.save();
    res.json(updated);
  } catch (error) {
    console.error("Error updating video:", error);
    res.status(500).json({ message: "Server error updating video" });
  }
});

// DELETE /api/videos/:id - Delete a video (Admin only)
router.delete("/:id", verifyToken, authorizeRoles("admin"), async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }
    await Video.findByIdAndDelete(req.params.id);
    res.json({ message: "Video deleted successfully" });
  } catch (error) {
    console.error("Error deleting video:", error);
    res.status(500).json({ message: "Server error deleting video" });
  }
});

module.exports = router;

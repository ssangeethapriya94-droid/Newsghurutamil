const express = require("express");
const router = express.Router();
const Short = require("../models/Short");
const { verifyToken, authorizeRoles } = require("../middleware/authMiddleware");

// GET /api/shorts - Get all enabled shorts (or all shorts if requested by an admin/moderator, but let's return all and let the client filter or show dashboard items)
router.get("/", async (req, res) => {
  try {
    // If we want public to only see enabled ones, we can check for custom query or just return all to simplify dashboard list, or return enabled only for users and all for admin. Let's return all, sorted by createdAt.
    const shorts = await Short.find().sort({ createdAt: -1 });
    res.json(shorts);
  } catch (error) {
    console.error("Error fetching shorts:", error);
    res.status(500).json({ message: "Server error fetching shorts" });
  }
});

// GET /api/shorts/:id - Get a single short
router.get("/:id", async (req, res) => {
  try {
    const short = await Short.findById(req.params.id);
    if (!short) {
      return res.status(404).json({ message: "Short not found" });
    }
    res.json(short);
  } catch (error) {
    console.error("Error fetching short details:", error);
    res.status(500).json({ message: "Server error fetching short details" });
  }
});

// POST /api/shorts - Create a short (Admin only)
router.post("/", verifyToken, authorizeRoles("admin"), async (req, res) => {
  try {
    const { title, thumbnail, videoUrl, category, description, isFeatured, isEnabled } = req.body;
    if (!title || !thumbnail || !videoUrl) {
      return res.status(400).json({ message: "Title, thumbnail, and video URL are required" });
    }

    const short = new Short({
      title,
      thumbnail,
      videoUrl,
      category,
      description,
      isFeatured: !!isFeatured,
      isEnabled: isEnabled !== undefined ? !!isEnabled : true
    });

    const saved = await short.save();
    res.status(201).json(saved);
  } catch (error) {
    console.error("Error creating short:", error);
    res.status(500).json({ message: "Server error creating short" });
  }
});

// PUT /api/shorts/:id - Update a short (Admin only)
router.put("/:id", verifyToken, authorizeRoles("admin"), async (req, res) => {
  try {
    const { title, thumbnail, videoUrl, category, description, isFeatured, isEnabled } = req.body;
    const short = await Short.findById(req.params.id);
    if (!short) {
      return res.status(404).json({ message: "Short not found" });
    }

    if (title !== undefined) short.title = title;
    if (thumbnail !== undefined) short.thumbnail = thumbnail;
    if (videoUrl !== undefined) short.videoUrl = videoUrl;
    if (category !== undefined) short.category = category;
    if (description !== undefined) short.description = description;
    if (isFeatured !== undefined) short.isFeatured = !!isFeatured;
    if (isEnabled !== undefined) short.isEnabled = !!isEnabled;

    const updated = await short.save();
    res.json(updated);
  } catch (error) {
    console.error("Error updating short:", error);
    res.status(500).json({ message: "Server error updating short" });
  }
});

// DELETE /api/shorts/:id - Delete a short (Admin only)
router.delete("/:id", verifyToken, authorizeRoles("admin"), async (req, res) => {
  try {
    const short = await Short.findById(req.params.id);
    if (!short) {
      return res.status(404).json({ message: "Short not found" });
    }
    await Short.findByIdAndDelete(req.params.id);
    res.json({ message: "Short deleted successfully" });
  } catch (error) {
    console.error("Error deleting short:", error);
    res.status(500).json({ message: "Server error deleting short" });
  }
});

module.exports = router;

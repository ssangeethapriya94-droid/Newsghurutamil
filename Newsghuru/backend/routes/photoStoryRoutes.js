const express = require("express");
const router = express.Router();
const PhotoStory = require("../models/PhotoStory");
const { verifyToken, authorizeRoles } = require("../middleware/authMiddleware");

// GET /api/photo-stories - Get all photo stories
router.get("/", async (req, res) => {
  try {
    const stories = await PhotoStory.find().sort({ createdAt: -1 });
    res.json(stories);
  } catch (error) {
    console.error("Error fetching photo stories:", error);
    res.status(500).json({ message: "Server error fetching photo stories" });
  }
});

// GET /api/photo-stories/:id - Get a single photo story
router.get("/:id", async (req, res) => {
  try {
    const story = await PhotoStory.findById(req.params.id);
    if (!story) {
      return res.status(404).json({ message: "Photo story not found" });
    }
    res.json(story);
  } catch (error) {
    console.error("Error fetching photo story details:", error);
    res.status(500).json({ message: "Server error fetching photo story details" });
  }
});

// POST /api/photo-stories - Create a photo story (Admin only)
router.post("/", verifyToken, authorizeRoles("admin"), async (req, res) => {
  try {
    const { title, description, coverImage, images, isFeatured } = req.body;
    if (!title || !coverImage) {
      return res.status(400).json({ message: "Title and cover image are required" });
    }

    const story = new PhotoStory({
      title,
      description,
      coverImage,
      images: Array.isArray(images) ? images : [],
      isFeatured: !!isFeatured
    });

    const saved = await story.save();
    res.status(201).json(saved);
  } catch (error) {
    console.error("Error creating photo story:", error);
    res.status(500).json({ message: "Server error creating photo story" });
  }
});

// PUT /api/photo-stories/:id - Update a photo story (Admin only)
router.put("/:id", verifyToken, authorizeRoles("admin"), async (req, res) => {
  try {
    const { title, description, coverImage, images, isFeatured } = req.body;
    const story = await PhotoStory.findById(req.params.id);
    if (!story) {
      return res.status(404).json({ message: "Photo story not found" });
    }

    if (title !== undefined) story.title = title;
    if (description !== undefined) story.description = description;
    if (coverImage !== undefined) story.coverImage = coverImage;
    if (images !== undefined) story.images = Array.isArray(images) ? images : [];
    if (isFeatured !== undefined) story.isFeatured = !!isFeatured;

    const updated = await story.save();
    res.json(updated);
  } catch (error) {
    console.error("Error updating photo story:", error);
    res.status(500).json({ message: "Server error updating photo story" });
  }
});

// DELETE /api/photo-stories/:id - Delete a photo story (Admin only)
router.delete("/:id", verifyToken, authorizeRoles("admin"), async (req, res) => {
  try {
    const story = await PhotoStory.findById(req.params.id);
    if (!story) {
      return res.status(404).json({ message: "Photo story not found" });
    }
    await PhotoStory.findByIdAndDelete(req.params.id);
    res.json({ message: "Photo story deleted successfully" });
  } catch (error) {
    console.error("Error deleting photo story:", error);
    res.status(500).json({ message: "Server error deleting photo story" });
  }
});

module.exports = router;

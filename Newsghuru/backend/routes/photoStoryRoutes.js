const express = require("express");
const router = express.Router();
const PhotoStory = require("../models/PhotoStory");
const { verifyToken, authorizeRoles } = require("../middleware/authMiddleware");

// GET /api/photo-stories - Get all photo stories (public gets published, admin/editor gets all)
router.get("/", async (req, res) => {
  try {
    let query = {};
    
    // Check if user is admin or editor
    let isAdminOrEditor = false;
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      try {
        const token = req.headers.authorization.split(" ")[1];
        const jwt = require("jsonwebtoken");
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "default_super_secret_key");
        const User = require("../models/User");
        const user = await User.findById(decoded.userId);
        if (user && (user.role === "admin" || user.role === "editor")) {
          isAdminOrEditor = true;
        }
      } catch (err) {
        // Ignore JWT verify errors
      }
    }

    const conditions = [];

    if (!isAdminOrEditor) {
      conditions.push({
        $or: [
          { status: "Published" },
          { status: { $exists: false } }
        ]
      });
    }

    const language = req.query.language || req.query.lang;
    if (language && language !== "all") {
      if (language === "ta") {
        conditions.push({
          $or: [
            { language: "ta" },
            { language: { $exists: false } },
            { language: null }
          ]
        });
      } else {
        conditions.push({ language: language });
      }
    }

    if (conditions.length > 0) {
      query = { $and: conditions };
    }

    const stories = await PhotoStory.find(query).sort({ createdAt: -1 });
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

// POST /api/photo-stories - Create a photo story (Admin and Editor)
router.post("/", verifyToken, authorizeRoles("admin", "editor"), async (req, res) => {
  try {
    const { title, description, coverImage, images, isFeatured, status, language } = req.body;
    if (!title || !coverImage) {
      return res.status(400).json({ message: "Title and cover image are required" });
    }

    const storyStatus = req.user.role === "editor"
      ? (["Draft", "Pending Approval"].includes(status) ? status : "Draft")
      : (status || "Published");

    const story = new PhotoStory({
      title,
      description,
      coverImage,
      images: Array.isArray(images) ? images : [],
      isFeatured: req.user.role === "admin" ? !!isFeatured : false,
      status: storyStatus,
      language: ["ta", "en"].includes(language) ? language : "ta",
      createdBy: req.user._id
    });

    const saved = await story.save();

    if (saved.status === "Pending Approval") {
      try {
        const User = require("../models/User");
        const Notification = require("../models/Notification");
        const admins = await User.find({ role: "admin" });
        const notificationPromises = admins.map((admin) =>
          Notification.create({
            recipientId: admin._id,
            type: "submitted",
            text: `New photo story "${saved.title}" submitted by Editor ${req.user.name} is pending approval.`,
          })
        );
        await Promise.all(notificationPromises);
      } catch (notifErr) {
        console.error("Failed to create submission notification:", notifErr);
      }
    }

    res.status(201).json(saved);
  } catch (error) {
    console.error("Error creating photo story:", error);
    res.status(500).json({ message: "Server error creating photo story" });
  }
});

// PUT /api/photo-stories/:id - Update a photo story (Admin and Editor)
router.put("/:id", verifyToken, authorizeRoles("admin", "editor"), async (req, res) => {
  try {
    const { title, description, coverImage, images, isFeatured, status, language } = req.body;
    const story = await PhotoStory.findById(req.params.id);
    if (!story) {
      return res.status(404).json({ message: "Photo story not found" });
    }

    if (req.user.role === "editor") {
      if (story.status !== "Draft" && story.status !== "Rejected" && story.status !== undefined) {
        return res.status(403).json({ message: "Not authorized. Editors can only edit Draft or Rejected photo stories." });
      }
    }

    const oldStatus = story.status;

    if (title !== undefined) story.title = title;
    if (description !== undefined) story.description = description;
    if (coverImage !== undefined) story.coverImage = coverImage;
    if (images !== undefined) story.images = Array.isArray(images) ? images : [];
    if (language !== undefined && ["ta", "en"].includes(language)) story.language = language;
    
    if (req.user.role === "admin") {
      if (isFeatured !== undefined) story.isFeatured = !!isFeatured;
      if (status !== undefined) story.status = status;
    } else {
      // Editor can save as draft or submit for approval
      if (status !== undefined) {
        if (["Draft", "Pending Approval"].includes(status)) {
          story.status = status;
        } else {
          story.status = "Draft";
        }
      }
    }

    const updated = await story.save();

    if (status === "Pending Approval" && oldStatus !== "Pending Approval") {
      try {
        const User = require("../models/User");
        const Notification = require("../models/Notification");
        const admins = await User.find({ role: "admin" });
        const notificationPromises = admins.map((admin) =>
          Notification.create({
            recipientId: admin._id,
            type: "submitted",
            text: `Photo story "${story.title}" submitted by Editor ${req.user.name} is pending approval.`,
          })
        );
        await Promise.all(notificationPromises);
      } catch (notifErr) {
        console.error("Failed to create submission notification:", notifErr);
      }
    }

    res.json(updated);
  } catch (error) {
    console.error("Error updating photo story:", error);
    res.status(500).json({ message: "Server error updating photo story" });
  }
});

// DELETE /api/photo-stories/:id - Delete a photo story (Admin and Editor)
router.delete("/:id", verifyToken, authorizeRoles("admin", "editor"), async (req, res) => {
  try {
    const story = await PhotoStory.findById(req.params.id);
    if (!story) {
      return res.status(404).json({ message: "Photo story not found" });
    }

    if (req.user.role === "editor") {
      const createdByStr = story.createdBy ? story.createdBy.toString() : "";
      if (story.status !== "Draft" || createdByStr !== req.user._id.toString()) {
        return res.status(403).json({ message: "Not authorized. Editors can only delete their own Draft photo stories." });
      }
    }

    await PhotoStory.findByIdAndDelete(req.params.id);
    res.json({ message: "Photo story deleted successfully" });
  } catch (error) {
    console.error("Error deleting photo story:", error);
    res.status(500).json({ message: "Server error deleting photo story" });
  }
});

// PUT /api/photo-stories/:id/approve - Admin Approve Photo Story
router.put("/:id/approve", verifyToken, authorizeRoles("admin"), async (req, res) => {
  try {
    const story = await PhotoStory.findById(req.params.id);
    if (!story) {
      return res.status(404).json({ message: "Photo story not found" });
    }

    story.status = "Approved";
    story.approvedBy = req.user._id;
    story.approvedAt = new Date();
    await story.save();

    // Notify the creator Editor
    if (story.createdBy) {
      try {
        const Notification = require("../models/Notification");
        await Notification.create({
          recipientId: story.createdBy,
          type: "approved",
          text: `Your photo story "${story.title}" has been approved by the Admin.`
        });
      } catch (notifErr) {
        console.error("Failed to notify creator editor:", notifErr);
      }
    }

    res.json({ success: true, message: "Photo story approved successfully", story });
  } catch (error) {
    console.error("Approve photo story error:", error);
    res.status(500).json({ success: false, message: "Server error approving photo story" });
  }
});

// PUT /api/photo-stories/:id/reject - Admin Reject Photo Story
router.put("/:id/reject", verifyToken, authorizeRoles("admin"), async (req, res) => {
  try {
    const { rejectionReason } = req.body;
    if (!rejectionReason) {
      return res.status(400).json({ message: "Rejection reason is required" });
    }

    const story = await PhotoStory.findById(req.params.id);
    if (!story) {
      return res.status(404).json({ message: "Photo story not found" });
    }

    story.status = "Rejected";
    story.rejectedAt = new Date();
    story.rejectionReason = rejectionReason;
    await story.save();

    // Notify the creator Editor
    if (story.createdBy) {
      try {
        const Notification = require("../models/Notification");
        await Notification.create({
          recipientId: story.createdBy,
          type: "rejected",
          text: `Your photo story "${story.title}" was rejected by the Admin. Reason: ${rejectionReason}`,
          reason: rejectionReason
        });
      } catch (notifErr) {
        console.error("Failed to notify creator editor:", notifErr);
      }
    }

    res.json({ success: true, message: "Photo story rejected successfully", story });
  } catch (error) {
    console.error("Reject photo story error:", error);
    res.status(500).json({ success: false, message: "Server error rejecting photo story" });
  }
});

// PUT /api/photo-stories/:id/publish - Admin Publish Photo Story
router.put("/:id/publish", verifyToken, authorizeRoles("admin"), async (req, res) => {
  try {
    const story = await PhotoStory.findById(req.params.id);
    if (!story) {
      return res.status(404).json({ message: "Photo story not found" });
    }

    story.status = "Published";
    story.publishedBy = req.user._id;
    story.publishedAt = new Date();
    await story.save();

    // Notify the creator Editor
    if (story.createdBy) {
      try {
        const Notification = require("../models/Notification");
        await Notification.create({
          recipientId: story.createdBy,
          type: "published",
          text: `Your photo story "${story.title}" has been published by the Admin.`
        });
      } catch (notifErr) {
        console.error("Failed to notify creator editor:", notifErr);
      }
    }

    res.json({ success: true, message: "Photo story published successfully", story });
  } catch (error) {
    console.error("Publish photo story error:", error);
    res.status(500).json({ success: false, message: "Server error publishing photo story" });
  }
});

// PUT /api/photo-stories/:id/unpublish - Admin Unpublish Photo Story
router.put("/:id/unpublish", verifyToken, authorizeRoles("admin"), async (req, res) => {
  try {
    const story = await PhotoStory.findById(req.params.id);
    if (!story) {
      return res.status(404).json({ message: "Photo story not found" });
    }

    story.status = "Draft";
    await story.save();

    res.json({ success: true, message: "Photo story unpublished successfully", story });
  } catch (error) {
    console.error("Unpublish photo story error:", error);
    res.status(500).json({ success: false, message: "Server error unpublishing photo story" });
  }
});

module.exports = router;

const express = require("express");
const router = express.Router();
const Short = require("../models/Short");
const { verifyToken, authorizeRoles } = require("../middleware/authMiddleware");

// GET /api/shorts - Get all enabled shorts (or all shorts if requested by an admin/editor)
router.get("/", async (req, res) => {
  try {
    let query = {};
    
    // Check if the user is authenticated as admin or editor
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
        // Ignore token verify error and treat as guest
      }
    }
    
    if (!isAdminOrEditor) {
      // Public users should only see published/enabled shorts
      query = {
        $or: [
          { status: "Published" },
          { status: { $exists: false }, isEnabled: true }
        ]
      };
    }
    
    const lang = req.query.language || "ta";
    if (lang !== "all") {
      query.language = lang;
    }
    
    const shorts = await Short.find(query).sort({ publishedAt: -1, createdAt: -1 });
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

// POST /api/shorts - Create a short (Admin and Editor)
router.post("/", verifyToken, authorizeRoles("admin", "editor"), async (req, res) => {
  try {
    const { title, thumbnail, videoUrl, category, description, isFeatured, isEnabled, status, language } = req.body;
    if (!title || !thumbnail || !videoUrl) {
      return res.status(400).json({ message: "Title, thumbnail, and video URL are required" });
    }

    const shortStatus = req.user.role === "editor"
      ? (["Draft", "Pending Approval"].includes(status) ? status : "Draft")
      : (status || "Published");

    const short = new Short({
      title,
      thumbnail,
      videoUrl,
      category,
      description,
      isFeatured: !!isFeatured,
      isEnabled: req.user.role === "admin" ? (isEnabled !== undefined ? !!isEnabled : true) : false,
      status: shortStatus,
      createdBy: req.user._id,
      language: language || "ta"
    });

    const saved = await short.save();

    if (saved.status === "Pending Approval") {
      try {
        const User = require("../models/User");
        const Notification = require("../models/Notification");
        const admins = await User.find({ role: "admin" });
        const notificationPromises = admins.map((admin) =>
          Notification.create({
            recipientId: admin._id,
            type: "submitted",
            text: `New news short reel "${saved.title}" submitted by Editor ${req.user.name} is pending approval.`,
            language: saved.language || "ta",
          })
        );
        await Promise.all(notificationPromises);
      } catch (notifErr) {
        console.error("Failed to create submission notification:", notifErr);
      }
    }

    res.status(201).json(saved);
  } catch (error) {
    console.error("Error creating short:", error);
    res.status(500).json({ message: "Server error creating short" });
  }
});

// PUT /api/shorts/:id - Update a short (Admin and Editor)
router.put("/:id", verifyToken, authorizeRoles("admin", "editor"), async (req, res) => {
  try {
    const { title, thumbnail, videoUrl, category, description, isFeatured, isEnabled, status, language } = req.body;
    const short = await Short.findById(req.params.id);
    if (!short) {
      return res.status(404).json({ message: "Short not found" });
    }

    if (req.user.role === "editor") {
      if (short.status !== "Draft" && short.status !== "Rejected" && short.status !== undefined) {
        return res.status(403).json({ message: "Not authorized. Editors can only edit Draft or Rejected shorts." });
      }
    }

    const oldStatus = short.status;

    if (title !== undefined) short.title = title;
    if (thumbnail !== undefined) short.thumbnail = thumbnail;
    if (videoUrl !== undefined) short.videoUrl = videoUrl;
    if (category !== undefined) short.category = category;
    if (description !== undefined) short.description = description;
    if (isFeatured !== undefined) short.isFeatured = !!isFeatured;
    if (language !== undefined) short.language = language;
    
    if (req.user.role === "admin") {
      if (isEnabled !== undefined) short.isEnabled = !!isEnabled;
      if (status !== undefined) short.status = status;
    } else {
      // Editor can save as draft or submit for approval
      if (status !== undefined) {
        if (["Draft", "Pending Approval"].includes(status)) {
          short.status = status;
        } else {
          short.status = "Draft";
        }
      }
    }

    const updated = await short.save();

    if (status === "Pending Approval" && oldStatus !== "Pending Approval") {
      try {
        const User = require("../models/User");
        const Notification = require("../models/Notification");
        const admins = await User.find({ role: "admin" });
        const notificationPromises = admins.map((admin) =>
          Notification.create({
            recipientId: admin._id,
            type: "submitted",
            text: `News short reel "${short.title}" submitted by Editor ${req.user.name} is pending approval.`,
            language: short.language || "ta",
          })
        );
        await Promise.all(notificationPromises);
      } catch (notifErr) {
        console.error("Failed to create submission notification:", notifErr);
      }
    }

    res.json(updated);
  } catch (error) {
    console.error("Error updating short:", error);
    res.status(500).json({ message: "Server error updating short" });
  }
});

// POST /api/shorts/bulk-delete - Bulk delete shorts (Admin and Editor)
router.post("/bulk-delete", verifyToken, authorizeRoles("admin", "editor"), async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: "No IDs provided for deletion" });
    }

    if (req.user.role === "editor") {
      // Editors can only delete their own Draft shorts
      const shortsToDelete = await Short.find({ _id: { $in: ids } });
      for (const short of shortsToDelete) {
        const createdByStr = short.createdBy ? short.createdBy.toString() : "";
        if (short.status !== "Draft" || createdByStr !== req.user._id.toString()) {
          return res.status(403).json({ message: "Not authorized. Editors can only delete their own Draft shorts." });
        }
      }
    }

    await Short.deleteMany({ _id: { $in: ids } });
    res.json({ message: "Shorts deleted successfully" });
  } catch (error) {
    console.error("Error bulk deleting shorts:", error);
    res.status(500).json({ message: "Server error bulk deleting shorts" });
  }
});

// DELETE /api/shorts/:id - Delete a short (Admin and Editor)
router.delete("/:id", verifyToken, authorizeRoles("admin", "editor"), async (req, res) => {
  try {
    const short = await Short.findById(req.params.id);
    if (!short) {
      return res.status(404).json({ message: "Short not found" });
    }

    if (req.user.role === "editor") {
      const createdByStr = short.createdBy ? short.createdBy.toString() : "";
      if (short.status !== "Draft" || createdByStr !== req.user._id.toString()) {
        return res.status(403).json({ message: "Not authorized. Editors can only delete their own Draft shorts." });
      }
    }

    await Short.findByIdAndDelete(req.params.id);
    res.json({ message: "Short deleted successfully" });
  } catch (error) {
    console.error("Error deleting short:", error);
    res.status(500).json({ message: "Server error deleting short" });
  }
});

// PUT /api/shorts/:id/approve - Admin Approve News Short
router.put("/:id/approve", verifyToken, authorizeRoles("admin"), async (req, res) => {
  try {
    const short = await Short.findById(req.params.id);
    if (!short) {
      return res.status(404).json({ message: "Short not found" });
    }

    short.status = "Approved";
    short.approvedBy = req.user._id;
    short.approvedAt = new Date();
    await short.save();

    // Notify the creator Editor
    if (short.createdBy) {
      try {
        const Notification = require("../models/Notification");
        await Notification.create({
          recipientId: short.createdBy,
          type: "approved",
          text: `Your news short reel "${short.title}" has been approved by the Admin/Editor.`,
          language: short.language || "ta",
        });
      } catch (notifErr) {
        console.error("Failed to notify creator editor:", notifErr);
      }
    }

    res.json({ success: true, message: "Short approved successfully", short });
  } catch (error) {
    console.error("Approve short error:", error);
    res.status(500).json({ success: false, message: "Server error approving short" });
  }
});

// PUT /api/shorts/:id/reject - Admin Reject News Short
router.put("/:id/reject", verifyToken, authorizeRoles("admin"), async (req, res) => {
  try {
    const { rejectionReason } = req.body;
    if (!rejectionReason) {
      return res.status(400).json({ message: "Rejection reason is required" });
    }

    const short = await Short.findById(req.params.id);
    if (!short) {
      return res.status(404).json({ message: "Short not found" });
    }

    short.status = "Rejected";
    short.rejectedAt = new Date();
    short.rejectionReason = rejectionReason;
    await short.save();

    // Notify the creator Editor
    if (short.createdBy) {
      try {
        const Notification = require("../models/Notification");
        await Notification.create({
          recipientId: short.createdBy,
          type: "rejected",
          text: `Your news short reel "${short.title}" was rejected. Reason: ${rejectionReason}`,
          reason: rejectionReason,
          language: short.language || "ta",
        });
      } catch (notifErr) {
        console.error("Failed to notify creator editor:", notifErr);
      }
    }

    res.json({ success: true, message: "Short rejected successfully", short });
  } catch (error) {
    console.error("Reject short error:", error);
    res.status(500).json({ success: false, message: "Server error rejecting short" });
  }
});

// PUT /api/shorts/:id/publish - Admin Publish News Short
router.put("/:id/publish", verifyToken, authorizeRoles("admin"), async (req, res) => {
  try {
    const short = await Short.findById(req.params.id);
    if (!short) {
      return res.status(404).json({ message: "Short not found" });
    }

    short.status = "Published";
    short.isEnabled = true;
    short.publishedBy = req.user._id;
    short.publishedAt = new Date();
    await short.save();

    // Notify the creator Editor
    if (short.createdBy) {
      try {
        const Notification = require("../models/Notification");
        await Notification.create({
          recipientId: short.createdBy,
          type: "published",
          text: `Your news short reel "${short.title}" has been published.`,
          language: short.language || "ta",
        });
      } catch (notifErr) {
        console.error("Failed to notify creator editor:", notifErr);
      }
    }

    res.json({ success: true, message: "Short published successfully", short });
  } catch (error) {
    console.error("Publish short error:", error);
    res.status(500).json({ success: false, message: "Server error publishing short" });
  }
});

// PUT /api/shorts/:id/unpublish - Admin Unpublish News Short
router.put("/:id/unpublish", verifyToken, authorizeRoles("admin"), async (req, res) => {
  try {
    const short = await Short.findById(req.params.id);
    if (!short) {
      return res.status(404).json({ message: "Short not found" });
    }

    short.status = "Draft";
    short.isEnabled = false;
    await short.save();

    res.json({ success: true, message: "Short unpublished successfully", short });
  } catch (error) {
    console.error("Unpublish short error:", error);
    res.status(500).json({ success: false, message: "Server error unpublishing short" });
  }
});

// POST /api/shorts/youtube-sync - Manually trigger YouTube sync (Admin only)
router.post("/youtube-sync", verifyToken, authorizeRoles("admin"), async (req, res) => {
  try {
    const { runSync } = require("../utils/youtubeSync");
    console.log("[YouTube Sync] Manual sync triggered by admin.");
    await runSync();
    res.json({ success: true, message: "YouTube video and shorts sync completed successfully." });
  } catch (error) {
    console.error("Error running manual YouTube sync:", error);
    res.status(500).json({ message: "Server error triggering manual YouTube sync" });
  }
});

module.exports = router;

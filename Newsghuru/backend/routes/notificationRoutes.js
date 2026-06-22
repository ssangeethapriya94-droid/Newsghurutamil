const express = require("express");
const router = express.Router();
const Notification = require("../models/Notification");
const { verifyToken } = require("../middleware/authMiddleware");

// GET /api/notifications - Get current user's notifications (with optional pagination)
router.get("/", verifyToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit) || 10;
    const query = { recipientId: req.user._id };

    const lang = req.query.language || "ta";
    if (lang !== "all") {
      query.language = lang;
    }

    if (page) {
      const skip = (page - 1) * limit;
      const total = await Notification.countDocuments(query);
      const notifications = await Notification.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      res.json({
        notifications,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit)
        }
      });
    } else {
      const notifications = await Notification.find(query)
        .sort({ createdAt: -1 })
        .limit(50);
      res.json(notifications);
    }
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ message: "Server error fetching notifications" });
  }
});

// PUT /api/notifications/mark-read - Mark all notifications of current user as read
router.put("/mark-read", verifyToken, async (req, res) => {
  try {
    await Notification.updateMany(
      { recipientId: req.user._id, read: false },
      { $set: { read: true } }
    );
    res.json({ success: true, message: "Notifications marked as read" });
  } catch (error) {
    console.error("Error marking notifications read:", error);
    res.status(500).json({ message: "Server error marking notifications read" });
  }
});

// DELETE /api/notifications/:id - Delete a specific notification
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      recipientId: req.user._id
    });

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    await Notification.deleteOne({ _id: req.params.id });
    res.json({ success: true, message: "Notification deleted" });
  } catch (error) {
    console.error("Error deleting notification:", error);
    res.status(500).json({ message: "Server error deleting notification" });
  }
});

module.exports = router;

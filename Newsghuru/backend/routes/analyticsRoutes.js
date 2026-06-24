const express = require("express");
const router = express.Router();

const VisitorStats = require("../models/VisitorStats");
const User = require("../models/User");
const { verifyToken, authorizeRoles } = require("../middleware/authMiddleware");

// ─── POST /api/analytics/visitors/increment ──────────────────────────────────
// Called once per browser session from client website.
// Increments global visitor count atomically and returns the new total.
router.post("/visitors/increment", async (req, res) => {
  try {
    const { language } = req.body;
    const incField = { count: 1 };
    if (language === "en") {
      incField.englishCount = 1;
    } else if (language === "ta") {
      incField.tamilCount = 1;
    } else {
      incField.tamilCount = 1; // Default to tamil if unspecified
    }

    const doc = await VisitorStats.findOneAndUpdate(
      {},
      { $inc: incField },
      { upsert: true, new: true }
    );
    res.json({
      success: true,
      count: doc.count,
      englishCount: doc.englishCount || 0,
      tamilCount: doc.tamilCount || 0
    });
  } catch (error) {
    console.error("Visitor increment error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ─── GET /api/analytics/visitors ─────────────────────────────────────────────
// Returns the current total visitor count (no increment).
router.get("/visitors", async (req, res) => {
  try {
    const doc = await VisitorStats.findOne();
    res.json({
      success: true,
      count: doc ? doc.count : 0,
      englishCount: doc ? (doc.englishCount || 0) : 0,
      tamilCount: doc ? (doc.tamilCount || 0) : 0
    });
  } catch (error) {
    console.error("Visitor fetch error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ─── GET /api/analytics/dashboard ────────────────────────────────────────────
// Returns user-level analytics for the admin dashboard.
// Restricted to admin and editor roles.
router.get("/dashboard", verifyToken, authorizeRoles("admin", "editor"), async (req, res) => {
  try {
    // Total website visitors
    const visitorDoc = await VisitorStats.findOne();
    const totalViewers = visitorDoc ? visitorDoc.count : 0;
    const englishViewers = visitorDoc ? (visitorDoc.englishCount || 0) : 0;
    const tamilViewers = visitorDoc ? (visitorDoc.tamilCount || 0) : 0;

    // Registered users
    const totalUsers = await User.countDocuments();
    const englishUsers = await User.countDocuments({ language: "en" });
    const tamilUsers = await User.countDocuments({ $or: [{ language: "ta" }, { language: { $exists: false } }, { language: "" }] });

    // Login users: users active in the last 15 minutes
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
    const loginUsers = await User.countDocuments({
      lastActiveAt: { $gte: fifteenMinutesAgo },
    });

    // Subscribers: users with isSubscribed = true OR isPremium = true
    const subscribersCount = await User.countDocuments({
      $or: [{ isSubscribed: true }, { isPremium: true }],
    });

    res.json({
      success: true,
      totalViewers,
      englishViewers,
      tamilViewers,
      totalUsers,
      englishUsers,
      tamilUsers,
      loginUsers,
      subscribersCount,
    });
  } catch (error) {
    console.error("Analytics dashboard error:", error);
    res.status(500).json({ success: false, message: "Server error fetching analytics" });
  }
});

module.exports = router;

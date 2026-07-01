const express = require("express");
const router = express.Router();
const EmailSchedule = require("../models/EmailSchedule");
const { verifyToken, authorizeRoles } = require("../middleware/authMiddleware");

// GET /api/email-schedule
// Get schedules for both languages
router.get("/", verifyToken, authorizeRoles("admin"), async (req, res) => {
  try {
    let taSchedule = await EmailSchedule.findOne({ language: "ta" });
    if (!taSchedule) {
      taSchedule = await EmailSchedule.create({ language: "ta", isEnabled: false });
    }

    let enSchedule = await EmailSchedule.findOne({ language: "en" });
    if (!enSchedule) {
      enSchedule = await EmailSchedule.create({ language: "en", isEnabled: false });
    }

    res.json({
      success: true,
      schedules: {
        ta: taSchedule,
        en: enSchedule
      }
    });
  } catch (error) {
    console.error("Error fetching email schedules:", error);
    res.status(500).json({ success: false, message: "Server error fetching schedules" });
  }
});

// PUT /api/email-schedule/:lang
// Update schedule for a language
router.put("/:lang", verifyToken, authorizeRoles("admin"), async (req, res) => {
  try {
    const { lang } = req.params;
    if (!["ta", "en"].includes(lang)) {
      return res.status(400).json({ success: false, message: "Invalid language specified" });
    }

    const { scheduleType, time, dateTime, isEnabled } = req.body;

    let schedule = await EmailSchedule.findOne({ language: lang });
    if (!schedule) {
      schedule = new EmailSchedule({ language: lang });
    }

    if (scheduleType !== undefined) schedule.scheduleType = scheduleType;
    if (time !== undefined) schedule.time = time;
    
    if (dateTime !== undefined) {
      // If datetime has changed, reset the isSent status so it will fire at the new time
      if (schedule.dateTime && new Date(schedule.dateTime).getTime() !== new Date(dateTime).getTime()) {
        schedule.isSent = false;
      }
      schedule.dateTime = dateTime;
    }
    
    if (isEnabled !== undefined) schedule.isEnabled = isEnabled;

    // Reset isSent if enabling a one-time schedule
    if (isEnabled === true && schedule.scheduleType === "one-time") {
      schedule.isSent = false;
    }

    // Always reset lastSent on daily schedule updates so it can trigger at the new scheduled time today
    if (schedule.scheduleType === "daily") {
      schedule.lastSent = null;
    }

    await schedule.save();

    res.json({
      success: true,
      message: `${lang === "en" ? "English" : "Tamil"} email schedule updated successfully`,
      schedule
    });
  } catch (error) {
    console.error("Error updating email schedule:", error);
    res.status(500).json({ success: false, message: "Server error updating schedule" });
  }
});

module.exports = router;

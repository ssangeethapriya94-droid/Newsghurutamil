const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const { verifyToken, authorizeRoles } = require("../middleware/authMiddleware");

// Models
const Advertisement = require("../models/Advertisement");
const AdRequest = require("../models/AdRequest");
const AdSettings = require("../models/AdSettings");
const AdEvent = require("../models/AdEvent");

// Configure Multer for Advertisement banner image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, "../uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, "ad-" + Date.now() + "-" + file.originalname);
  }
});
const upload = multer({ storage });

// Helper to determine status dynamically
const updateAdStatuses = async () => {
  const now = new Date();
  const ads = await Advertisement.find({
    status: { $in: ["Active", "Scheduled", "Expired", "Published"] }
  });
  for (let ad of ads) {
    if (!ad.isActive || ad.status === "Inactive") {
      if (ad.status !== "Inactive") {
        ad.status = "Inactive";
        await ad.save();
      }
      continue;
    }
    
    // Parse combined date and time strings (local-friendly parsing)
    const startStr = ad.startDate.toISOString().split("T")[0];
    const endStr = ad.endDate.toISOString().split("T")[0];
    const start = new Date(`${startStr}T${ad.startTime || "00:00"}:00+05:30`);
    const end = new Date(`${endStr}T${ad.endTime || "23:59"}:59+05:30`);
    
    let newStatus = "Active";
    if (now < start) {
      newStatus = "Scheduled";
    } else if (now > end) {
      newStatus = "Expired";
    }
    if (ad.status !== newStatus) {
      ad.status = newStatus;
      await ad.save();
    }
  }
};

/* =========================================
   PUBLIC ROUTES
========================================= */

// GET /api/ads/active - Get all active advertisements for frontend
router.get("/active", async (req, res) => {
  try {
    await updateAdStatuses(); // Resync dynamic statuses based on exact times
    
    const query = {
      isActive: true,
      status: "Active"
    };

    const lang = req.query.language || "ta";
    if (lang !== "all") {
      query.language = { $in: [lang, "both"] };
    }

    // Fetch ads that are active and marked as "Active" by status manager
    const activeAds = await Advertisement.find(query);

    res.json({ success: true, ads: activeAds });
  } catch (error) {
    console.error("Fetch active ads error:", error);
    res.status(500).json({ success: false, message: "Server error fetching active ads" });
  }
});

// GET /api/ads/settings/public - Get public ad settings (like global rotation interval)
router.get("/settings/public", async (req, res) => {
  try {
    let settings = await AdSettings.findOne();
    if (!settings) {
      settings = await AdSettings.create({
        globalRotationInterval: 10,
        popupEnabled: true,
        popupDelay: 3,
        popupAutoClose: 10
      });
    }
    res.json({ success: true, settings });
  } catch (error) {
    console.error("Fetch settings error:", error);
    res.status(500).json({ success: false, message: "Server error fetching settings" });
  }
});

// POST /api/ads/:id/impression - Record an impression event (throttled/called when visible)
router.post("/:id/impression", async (req, res) => {
  try {
    const adId = req.params.id;
    const ad = await Advertisement.findById(adId);
    if (!ad) {
      return res.status(404).json({ success: false, message: "Advertisement not found" });
    }

    ad.impressions += 1;
    // Recalculate CTR: (clicks / impressions) * 100
    if (ad.impressions > 0) {
      ad.ctr = parseFloat(((ad.clicks / ad.impressions) * 100).toFixed(2));
    }
    await ad.save();

    // Log AdEvent
    await AdEvent.create({
      adId,
      eventType: "impression"
    });

    res.json({ success: true, impressions: ad.impressions });
  } catch (error) {
    console.error("Track impression error:", error);
    res.status(500).json({ success: false, message: "Server error tracking impression" });
  }
});

// GET /api/ads/:id/click - Track click (increment counter, record event, redirect to URL)
router.get("/:id/click", async (req, res) => {
  try {
    const adId = req.params.id;
    const ad = await Advertisement.findById(adId);
    if (!ad) {
      return res.status(404).send("Advertisement not found");
    }

    ad.clicks += 1;
    if (ad.impressions > 0) {
      ad.ctr = parseFloat(((ad.clicks / ad.impressions) * 100).toFixed(2));
    } else {
      ad.ctr = 100;
    }
    await ad.save();

    // Log AdEvent
    await AdEvent.create({
      adId,
      eventType: "click"
    });

    // Make sure targetUrl has protocol prefix (http/https)
    let url = ad.targetUrl;
    if (!/^https?:\/\//i.test(url)) {
      url = "http://" + url;
    }

    res.redirect(url);
  } catch (error) {
    console.error("Track click error:", error);
    res.status(500).send("Server error tracking click");
  }
});

// POST /api/ads/requests - Submit a request from public "Advertise With Us" page
router.post("/requests", async (req, res) => {
  try {
    const { companyName, contactPerson, email, phone, website, advertisementType, message } = req.body;

    if (!companyName || !contactPerson || !email || !phone || !advertisementType) {
      return res.status(400).json({ success: false, message: "Please fill in all required fields" });
    }

    const request = await AdRequest.create({
      companyName,
      contactPerson,
      email,
      phone,
      website,
      advertisementType,
      message
    });

    res.status(201).json({ success: true, message: "Request submitted successfully 🎉", request });
  } catch (error) {
    console.error("Submit ad request error:", error);
    res.status(500).json({ success: false, message: "Server error submitting request" });
  }
});


/* =========================================
   ADMIN SECURE ROUTES (ADMIN ONLY)
========================================= */

// POST /api/ads/upload - Upload ad image (returns URL)
router.post("/upload", verifyToken, authorizeRoles("admin", "editor"), upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }
    res.status(201).json({
      success: true,
      message: "Image uploaded successfully",
      url: `/uploads/${req.file.filename}`
    });
  } catch (error) {
    console.error("Upload ad image error:", error);
    res.status(500).json({ success: false, message: "Server error uploading image" });
  }
});

// GET /api/ads - Get all advertisements
router.get("/", verifyToken, authorizeRoles("admin", "editor"), async (req, res) => {
  try {
    await updateAdStatuses(); // Sync status with dates on list fetch
    const query = {};
    const lang = req.query.language;
    if (lang && lang !== "all") {
      query.language = lang;
    }
    const ads = await Advertisement.find(query).sort({ createdAt: -1 });
    res.json({ success: true, ads });
  } catch (error) {
    console.error("Fetch advertisements error:", error);
    res.status(500).json({ success: false, message: "Server error fetching advertisements" });
  }
});

// GET /api/ads/analytics/dashboard - Analytics dashboard metrics & charts
router.get("/analytics/dashboard", verifyToken, authorizeRoles("admin"), async (req, res) => {
  try {
    await updateAdStatuses();
    const totalAds = await Advertisement.countDocuments();
    const activeAds = await Advertisement.countDocuments({ status: "Active" });
    const scheduledAds = await Advertisement.countDocuments({ status: "Scheduled" });
    const expiredAds = await Advertisement.countDocuments({ status: "Expired" });

    // Aggregate lifetime stats
    const stats = await Advertisement.aggregate([
      {
        $group: {
          _id: null,
          totalClicks: { $sum: "$clicks" },
          totalImpressions: { $sum: "$impressions" }
        }
      }
    ]);

    const totalClicks = stats[0]?.totalClicks || 0;
    const totalImpressions = stats[0]?.totalImpressions || 0;
    const ctrPercent = totalImpressions > 0 ? parseFloat(((totalClicks / totalImpressions) * 100).toFixed(2)) : 0;

    // Daily Click & Impression logs (Last 30 Days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    const dailyStats = await AdEvent.aggregate([
      { $match: { timestamp: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
            type: "$eventType"
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.date": 1 } }
    ]);

    // Format dailyStats for Recharts: [{ date: 'YYYY-MM-DD', clicks: X, impressions: Y }]
    const dailyChartMap = {};
    // Populate map with last 30 days
    for (let i = 0; i < 30; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      dailyChartMap[dateStr] = { date: dateStr, clicks: 0, impressions: 0 };
    }

    dailyStats.forEach(item => {
      const date = item._id.date;
      const type = item._id.type;
      if (dailyChartMap[date]) {
        if (type === "click") dailyChartMap[date].clicks = item.count;
        if (type === "impression") dailyChartMap[date].impressions = item.count;
      }
    });

    const dailyChartData = Object.values(dailyChartMap).sort((a, b) => a.date.localeCompare(b.date));

    // Advertisement Performance (CTR comparison)
    const performanceAds = await Advertisement.find()
      .select("title clicks impressions ctr position")
      .sort({ ctr: -1 })
      .limit(10);

    // Most Viewed Ads
    const mostViewedAds = await Advertisement.find()
      .select("title advertiserName position status impressions clicks ctr")
      .sort({ impressions: -1 })
      .limit(10);

    res.json({
      success: true,
      summary: {
        totalAds,
        activeAds,
        scheduledAds,
        expiredAds,
        totalClicks,
        totalImpressions,
        ctrPercent
      },
      dailyChartData,
      performanceAds,
      mostViewedAds
    });
  } catch (error) {
    console.error("Dashboard analytics error:", error);
    res.status(500).json({ success: false, message: "Server error fetching analytics" });
  }
});

// GET /api/ads/settings - Get settings
router.get("/settings", verifyToken, authorizeRoles("admin"), async (req, res) => {
  try {
    let settings = await AdSettings.findOne();
    if (!settings) {
      settings = await AdSettings.create({
        globalRotationInterval: 10,
        popupEnabled: true,
        popupDelay: 3,
        popupAutoClose: 10
      });
    }
    res.json({ success: true, settings });
  } catch (error) {
    console.error("Get settings error:", error);
    res.status(500).json({ success: false, message: "Server error fetching settings" });
  }
});

// PUT /api/ads/settings - Update settings
router.put("/settings", verifyToken, authorizeRoles("admin"), async (req, res) => {
  try {
    const { globalRotationInterval, popupEnabled, popupDelay, popupAutoClose } = req.body;
    let settings = await AdSettings.findOne();
    if (!settings) {
      settings = new AdSettings();
    }

    if (globalRotationInterval !== undefined) settings.globalRotationInterval = globalRotationInterval;
    if (popupEnabled !== undefined) settings.popupEnabled = popupEnabled;
    if (popupDelay !== undefined) settings.popupDelay = popupDelay;
    if (popupAutoClose !== undefined) settings.popupAutoClose = popupAutoClose;

    await settings.save();
    res.json({ success: true, message: "Settings updated successfully", settings });
  } catch (error) {
    console.error("Update settings error:", error);
    res.status(500).json({ success: false, message: "Server error updating settings" });
  }
});

// GET /api/ads/requests - Get all requests
router.get("/requests", verifyToken, authorizeRoles("admin"), async (req, res) => {
  try {
    const requests = await AdRequest.find().sort({ createdAt: -1 });
    res.json({ success: true, requests });
  } catch (error) {
    console.error("Fetch requests error:", error);
    res.status(500).json({ success: false, message: "Server error fetching requests" });
  }
});

// PUT /api/ads/requests/:id/status - Approve or reject a request
router.put("/requests/:id/status", verifyToken, authorizeRoles("admin"), async (req, res) => {
  try {
    const { status } = req.body;
    if (!["Approved", "Rejected", "Pending"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status value" });
    }

    const request = await AdRequest.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!request) {
      return res.status(404).json({ success: false, message: "Request not found" });
    }

    res.json({ success: true, message: `Request status updated to ${status}`, request });
  } catch (error) {
    console.error("Update request status error:", error);
    res.status(500).json({ success: false, message: "Server error updating request" });
  }
});

// POST /api/ads/requests/:id/convert - Convert request to Advertisement
router.post("/requests/:id/convert", verifyToken, authorizeRoles("admin"), async (req, res) => {
  try {
    const request = await AdRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, message: "Request not found" });
    }

    request.status = "Approved";
    await request.save();

    res.json({
      success: true,
      message: "Request marked as Approved. Form fields ready to prefill.",
      prefill: {
        title: `${request.companyName} Campaign`,
        advertiserName: request.contactPerson,
        advertiserEmail: request.email,
        advertiserPhone: request.phone,
        companyName: request.companyName,
        position: request.advertisementType,
        targetUrl: request.website || ""
      }
    });
  } catch (error) {
    console.error("Convert request error:", error);
    res.status(500).json({ success: false, message: "Server error converting request" });
  }
});

// POST /api/ads - Create advertisement
router.post("/", verifyToken, authorizeRoles("admin", "editor"), async (req, res) => {
  try {
    const {
      title,
      advertiserName,
      advertiserEmail,
      advertiserPhone,
      companyName,
      description,
      image,
      targetUrl,
      position,
      priority,
      status,
      popupDelay,
      popupAutoClose,
      rotationInterval,
      startDate,
      startTime,
      endDate,
      endTime
    } = req.body;

    if (!title || !advertiserName || !advertiserEmail || !advertiserPhone || !image || !targetUrl || !position || !startDate || !endDate) {
      return res.status(400).json({ success: false, message: "All required fields must be provided" });
    }

    const adStatus = req.user.role === "editor"
      ? (["Draft", "Pending Approval"].includes(status) ? status : "Draft")
      : (status || "Active");

    const newAd = new Advertisement({
      title,
      advertiserName,
      advertiserEmail,
      advertiserPhone,
      companyName,
      description,
      image,
      targetUrl,
      position,
      priority: priority || "Medium",
      status: adStatus,
      popupDelay: popupDelay !== undefined ? popupDelay : 3,
      popupAutoClose: popupAutoClose !== undefined ? popupAutoClose : 10,
      rotationInterval: rotationInterval !== undefined ? rotationInterval : 10,
      startDate,
      startTime: startTime || "00:00",
      endDate,
      endTime: endTime || "23:59",
      isActive: req.user.role === "admin" ? (status !== "Inactive") : false,
      createdBy: req.user._id,
      language: req.body.language || "both"
    });

    await newAd.save();
    await updateAdStatuses(); // Sync status on save

    if (newAd.status === "Pending Approval") {
      try {
        const User = require("../models/User");
        const Notification = require("../models/Notification");
        const admins = await User.find({ role: "admin" });
        const notificationPromises = admins.map((admin) =>
          Notification.create({
            recipientId: admin._id,
            type: "submitted",
            text: `New advertisement campaign "${newAd.title}" submitted by Editor ${req.user.name} is pending approval.`,
            language: (newAd.language && ["ta", "en", "hi", "te", "ml"].includes(newAd.language)) ? newAd.language : "ta",
          })
        );
        await Promise.all(notificationPromises);
      } catch (notifErr) {
        console.error("Failed to create submission notification:", notifErr);
      }
    }

    res.status(201).json({ success: true, message: "Advertisement created successfully 🎉", ad: newAd });
  } catch (error) {
    console.error("Create ad error:", error);
    res.status(500).json({ success: false, message: "Server error creating advertisement" });
  }
});

// GET /api/ads/:id - Get single advertisement
router.get("/:id", verifyToken, authorizeRoles("admin", "editor"), async (req, res) => {
  try {
    const ad = await Advertisement.findById(req.params.id);
    if (!ad) {
      return res.status(404).json({ success: false, message: "Advertisement not found" });
    }
    res.json({ success: true, ad });
  } catch (error) {
    console.error("Fetch single ad error:", error);
    res.status(500).json({ success: false, message: "Server error fetching advertisement" });
  }
});

// PUT /api/ads/:id - Update advertisement
router.put("/:id", verifyToken, authorizeRoles("admin", "editor"), async (req, res) => {
  try {
    const adId = req.params.id;
    const updates = req.body;

    const ad = await Advertisement.findById(adId);
    if (!ad) {
      return res.status(404).json({ success: false, message: "Advertisement not found" });
    }

    if (req.user.role === "editor") {
      if (ad.status !== "Draft" && ad.status !== "Rejected" && ad.status !== undefined) {
        return res.status(403).json({ success: false, message: "Not authorized. Editors can only edit Draft or Rejected advertisements." });
      }

      if (updates.status !== undefined) {
        if (!["Draft", "Pending Approval"].includes(updates.status)) {
          updates.status = "Draft";
        }
      }
    }

    const oldStatus = ad.status;

    // Apply updates
    Object.keys(updates).forEach(key => {
      if (updates[key] !== undefined) {
        ad[key] = updates[key];
      }
    });

    // Handle manual isActive sync
    if (updates.status === "Inactive") {
      ad.isActive = false;
    } else if (updates.status && updates.status !== "Inactive" && req.user.role === "admin") {
      ad.isActive = true;
    }

    await ad.save();
    await updateAdStatuses(); // Resync status dynamically

    if (updates.status === "Pending Approval" && oldStatus !== "Pending Approval") {
      try {
        const User = require("../models/User");
        const Notification = require("../models/Notification");
        const admins = await User.find({ role: "admin" });
        const notificationPromises = admins.map((admin) =>
          Notification.create({
            recipientId: admin._id,
            type: "submitted",
            text: `Advertisement campaign "${ad.title}" submitted by Editor ${req.user.name} is pending approval.`,
            language: (ad.language && ["ta", "en", "hi", "te", "ml"].includes(ad.language)) ? ad.language : "ta",
          })
        );
        await Promise.all(notificationPromises);
      } catch (notifErr) {
        console.error("Failed to create submission notification:", notifErr);
      }
    }

    res.json({ success: true, message: "Advertisement updated successfully", ad });
  } catch (error) {
    console.error("Update ad error:", error);
    res.status(500).json({ success: false, message: "Server error updating advertisement" });
  }
});

// PUT /api/ads/:id/toggle - Toggle advertisement active state
router.put("/:id/toggle", verifyToken, authorizeRoles("admin"), async (req, res) => {
  try {
    const ad = await Advertisement.findById(req.params.id);
    if (!ad) {
      return res.status(404).json({ success: false, message: "Advertisement not found" });
    }

    ad.isActive = !ad.isActive;
    ad.status = ad.isActive ? "Active" : "Inactive";
    await ad.save();
    await updateAdStatuses(); // Resync

    res.json({ success: true, message: `Advertisement ${ad.isActive ? "activated" : "deactivated"}`, ad });
  } catch (error) {
    console.error("Toggle ad state error:", error);
    res.status(500).json({ success: false, message: "Server error toggling active state" });
  }
});

// DELETE /api/ads/:id - Delete advertisement campaign
router.delete("/:id", verifyToken, authorizeRoles("admin", "editor"), async (req, res) => {
  try {
    const ad = await Advertisement.findById(req.params.id);
    if (!ad) {
      return res.status(404).json({ success: false, message: "Advertisement not found" });
    }

    if (req.user.role === "editor") {
      const createdByStr = ad.createdBy ? ad.createdBy.toString() : "";
      if (ad.status !== "Draft" || createdByStr !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: "Not authorized. Editors can only delete their own Draft advertisements." });
      }
    }

    await Advertisement.findByIdAndDelete(req.params.id);

    // Clean up related analytics events to keep DB neat
    await AdEvent.deleteMany({ adId: req.params.id });

    res.json({ success: true, message: "Advertisement and its analytics deleted successfully" });
  } catch (error) {
    console.error("Delete ad error:", error);
    res.status(500).json({ success: false, message: "Server error deleting advertisement" });
  }
});

// PUT /api/ads/:id/approve - Admin Approve Advertisement
router.put("/:id/approve", verifyToken, authorizeRoles("admin"), async (req, res) => {
  try {
    const ad = await Advertisement.findById(req.params.id);
    if (!ad) {
      return res.status(404).json({ success: false, message: "Advertisement not found" });
    }

    ad.status = "Approved";
    ad.approvedBy = req.user._id;
    ad.approvedAt = new Date();
    await ad.save();

    // Notify the creator Editor
    if (ad.createdBy) {
      try {
        const Notification = require("../models/Notification");
        await Notification.create({
          recipientId: ad.createdBy,
          type: "approved",
          text: `Your advertisement campaign "${ad.title}" has been approved by the Admin.`,
          language: (ad.language && ["ta", "en", "hi", "te", "ml"].includes(ad.language)) ? ad.language : "ta",
        });
      } catch (notifErr) {
        console.error("Failed to notify creator editor:", notifErr);
      }
    }

    res.json({ success: true, message: "Advertisement approved successfully", ad });
  } catch (error) {
    console.error("Approve ad error:", error);
    res.status(500).json({ success: false, message: "Server error approving advertisement" });
  }
});

// PUT /api/ads/:id/reject - Admin Reject Advertisement
router.put("/:id/reject", verifyToken, authorizeRoles("admin"), async (req, res) => {
  try {
    const { rejectionReason } = req.body;
    if (!rejectionReason) {
      return res.status(400).json({ success: false, message: "Rejection reason is required" });
    }

    const ad = await Advertisement.findById(req.params.id);
    if (!ad) {
      return res.status(404).json({ success: false, message: "Advertisement not found" });
    }

    ad.status = "Rejected";
    ad.rejectedAt = new Date();
    ad.rejectionReason = rejectionReason;
    await ad.save();

    // Notify the creator Editor
    if (ad.createdBy) {
      try {
        const Notification = require("../models/Notification");
        await Notification.create({
          recipientId: ad.createdBy,
          type: "rejected",
          text: `Your advertisement campaign "${ad.title}" was rejected by the Admin. Reason: ${rejectionReason}`,
          reason: rejectionReason,
          language: (ad.language && ["ta", "en", "hi", "te", "ml"].includes(ad.language)) ? ad.language : "ta",
        });
      } catch (notifErr) {
        console.error("Failed to notify creator editor:", notifErr);
      }
    }

    res.json({ success: true, message: "Advertisement rejected successfully", ad });
  } catch (error) {
    console.error("Reject ad error:", error);
    res.status(500).json({ success: false, message: "Server error rejecting advertisement" });
  }
});

// PUT /api/ads/:id/publish - Admin Publish Advertisement
router.put("/:id/publish", verifyToken, authorizeRoles("admin"), async (req, res) => {
  try {
    const ad = await Advertisement.findById(req.params.id);
    if (!ad) {
      return res.status(404).json({ success: false, message: "Advertisement not found" });
    }

    ad.status = "Active"; // Active is the published state
    ad.isActive = true;
    ad.publishedBy = req.user._id;
    ad.publishedAt = new Date();
    await ad.save();
    await updateAdStatuses(); // Sync status on publish

    // Notify the creator Editor
    if (ad.createdBy) {
      try {
        const Notification = require("../models/Notification");
        await Notification.create({
          recipientId: ad.createdBy,
          type: "published",
          text: `Your advertisement campaign "${ad.title}" has been published by the Admin.`,
          language: (ad.language && ["ta", "en", "hi", "te", "ml"].includes(ad.language)) ? ad.language : "ta",
        });
      } catch (notifErr) {
        console.error("Failed to notify creator editor:", notifErr);
      }
    }

    res.json({ success: true, message: "Advertisement published successfully", ad });
  } catch (error) {
    console.error("Publish ad error:", error);
    res.status(500).json({ success: false, message: "Server error publishing advertisement" });
  }
});

// PUT /api/ads/:id/unpublish - Admin Unpublish Advertisement (deletes/removes ad from DB)
router.put("/:id/unpublish", verifyToken, authorizeRoles("admin"), async (req, res) => {
  try {
    const ad = await Advertisement.findById(req.params.id);
    if (!ad) {
      return res.status(404).json({ success: false, message: "Advertisement not found" });
    }

    await Advertisement.findByIdAndDelete(req.params.id);
    await AdEvent.deleteMany({ adId: req.params.id });

    res.json({ success: true, message: "Advertisement unpublished and removed from database successfully" });
  } catch (error) {
    console.error("Unpublish ad error:", error);
    res.status(500).json({ success: false, message: "Server error unpublishing advertisement" });
  }
});

module.exports = router;

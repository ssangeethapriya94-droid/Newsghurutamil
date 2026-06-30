const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const { verifyToken, authorizeRoles } = require("../middleware/authMiddleware");

// Models & Dependencies
const Advertisement = require("../models/Advertisement");
const AdRequest = require("../models/AdRequest");
const AdSettings = require("../models/AdSettings");
const AdEvent = require("../models/AdEvent");
const AdPricing = require("../models/AdPricing");
const User = require("../models/User");
const Notification = require("../models/Notification");
const Razorpay = require("razorpay");
const crypto = require("crypto");

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
    const sanitized = file.originalname.replace(/\s+/g, '-');
    cb(null, "ad-" + Date.now() + "-" + sanitized);
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

// POST /api/ads/settings/tariff-upload - Upload tariff card document (PDF/Image)
router.post("/settings/tariff-upload", verifyToken, authorizeRoles("admin"), upload.single("tariff"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }
    res.status(201).json({
      success: true,
      message: "Tariff card uploaded successfully",
      url: `/uploads/${req.file.filename}`
    });
  } catch (error) {
    console.error("Upload tariff card error:", error);
    res.status(500).json({ success: false, message: "Server error uploading tariff card" });
  }
});

// PUT /api/ads/settings - Update settings
router.put("/settings", verifyToken, authorizeRoles("admin"), async (req, res) => {
  try {
    const { 
      globalRotationInterval, popupEnabled, popupDelay, popupAutoClose,
      salesEmail, salesPhone, salesWebsite,
      benefitsEn, benefitsTa, paymentTermsEn, paymentTermsTa,
      creativeSpecsEn, creativeSpecsTa, tariffCardPdf
    } = req.body;
    let settings = await AdSettings.findOne();
    if (!settings) {
      settings = new AdSettings();
    }

    if (globalRotationInterval !== undefined) settings.globalRotationInterval = globalRotationInterval;
    if (popupEnabled !== undefined) settings.popupEnabled = popupEnabled;
    if (popupDelay !== undefined) settings.popupDelay = popupDelay;
    if (popupAutoClose !== undefined) settings.popupAutoClose = popupAutoClose;

    if (salesEmail !== undefined) settings.salesEmail = salesEmail;
    if (salesPhone !== undefined) settings.salesPhone = salesPhone;
    if (salesWebsite !== undefined) settings.salesWebsite = salesWebsite;
    if (benefitsEn !== undefined) settings.benefitsEn = benefitsEn;
    if (benefitsTa !== undefined) settings.benefitsTa = benefitsTa;
    if (paymentTermsEn !== undefined) settings.paymentTermsEn = paymentTermsEn;
    if (paymentTermsTa !== undefined) settings.paymentTermsTa = paymentTermsTa;
    if (creativeSpecsEn !== undefined) settings.creativeSpecsEn = creativeSpecsEn;
    if (creativeSpecsTa !== undefined) settings.creativeSpecsTa = creativeSpecsTa;
    if (tariffCardPdf !== undefined) settings.tariffCardPdf = tariffCardPdf;

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

// =========================================================================
// SELF-SERVICE USER AD CAMPAIGNS & WALLET REFUNDS
// =========================================================================

const SLOT_PRICING = {
  HEADER_BANNER: 14999,
  TOP_BANNER: 9999,
  SECTION_BANNER: 6999,
  POPUP_ADVERTISEMENT: 4999,
  SIDEBAR: 3499,
  FLOATING_ADVERTISEMENT: 2499
};

// GET /api/ads/user-campaigns/pricing - Get pricing structure for ad slots
router.get("/user-campaigns/pricing", (req, res) => {
  res.json({ success: true, pricing: SLOT_PRICING });
});

// GET /api/ads/user-campaigns/my - Get user's campaigns and wallet balance
router.get("/user-campaigns/my", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("name email phone walletBalance");
    const query = { createdBy: req.user._id };
    if (req.query.language) {
      query.language = req.query.language;
    }
    const campaigns = await Advertisement.find(query).sort({ createdAt: -1 });
    res.json({
      success: true,
      walletBalance: user ? user.walletBalance || 0 : 0,
      campaigns
    });
  } catch (error) {
    console.error("Fetch user campaigns error:", error);
    res.status(500).json({ success: false, message: "Server error fetching campaigns" });
  }
});

// POST /api/ads/user-campaigns/create - Submit user campaign (Wallet or Razorpay order creation)
router.post("/user-campaigns/create", verifyToken, upload.single("image"), async (req, res) => {
  try {
    const {
      title, advertiserName, advertiserEmail, advertiserPhone,
      companyName, description, targetUrl, position,
      startDate, endDate, language, paymentMethod
    } = req.body;

    if (!title || !advertiserName || !advertiserEmail || !targetUrl || !position || !startDate || !endDate) {
      const missing = [];
      if (!title) missing.push("Title");
      if (!advertiserName) missing.push("Advertiser Name");
      if (!advertiserEmail) missing.push("Advertiser Email");
      if (!targetUrl) missing.push("Target URL");
      if (!position) missing.push("Position");
      if (!startDate) missing.push("Start Date");
      if (!endDate) missing.push("End Date");
      return res.status(400).json({ success: false, message: `Please fill in required fields: ${missing.join(", ")}` });
    }

    if (!req.file && !req.body.image) {
      return res.status(400).json({ success: false, message: "Advertisement banner image file is required." });
    }

    const imagePath = req.file ? `/uploads/${req.file.filename}` : req.body.image;
    
    // Dynamic duration-based price resolution from DB
    const adPricingDoc = await AdPricing.findOne({ slotId: position });
    let price = 5000;
    const durationPkg = req.body.durationPackage || "weekly";
    if (adPricingDoc) {
      if (durationPkg === "monthly" && adPricingDoc.priceMonthly > 0) {
        price = adPricingDoc.priceMonthly;
      } else {
        price = adPricingDoc.priceWeekly || adPricingDoc.price || 5000;
      }
    } else if (req.body.calculatedAmount) {
      price = Number(req.body.calculatedAmount);
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Process Wallet Payment
    if (paymentMethod === "Wallet") {
      if ((user.walletBalance || 0) < price) {
        return res.status(400).json({
          success: false,
          message: `Insufficient wallet balance. Required: ₹${price.toLocaleString()}, Available: ₹${(user.walletBalance || 0).toLocaleString()}`
        });
      }

      // Deduct wallet balance
      user.walletBalance = (user.walletBalance || 0) - price;
      await user.save();

      // Create advertisement with Paid status and Pending Approval
      const newAd = new Advertisement({
        title,
        advertiserName,
        advertiserEmail,
        advertiserPhone: advertiserPhone || "",
        companyName: companyName || "",
        description: description || "",
        image: imagePath,
        targetUrl,
        position,
        priority: "Medium",
        status: "Pending Approval",
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        language: language || "both",
        createdBy: user._id,
        amountPaid: price,
        paymentStatus: "Paid",
        paymentMethod: "Wallet",
        isActive: false
      });

      await newAd.save();

      return res.status(201).json({
        success: true,
        message: "Campaign submitted successfully using Wallet balance! Awaiting Admin approval.",
        ad: newAd,
        isWalletPayment: true,
        remainingWalletBalance: user.walletBalance
      });
    }

    // Process Razorpay Checkout Order Creation
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    // Save initial Ad draft with pending payment
    const newAd = new Advertisement({
      title,
      advertiserName,
      advertiserEmail,
      advertiserPhone: advertiserPhone || "",
      companyName: companyName || "",
      description: description || "",
      image: imagePath,
      targetUrl,
      position,
      priority: "Medium",
      status: "Draft",
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      language: language || "both",
      createdBy: user._id,
      amountPaid: price,
      paymentStatus: "Pending",
      paymentMethod: "Razorpay",
      isActive: false
    });

    await newAd.save();

    if (keyId && keySecret && keyId !== "your_key_id" && keySecret !== "your_key_secret") {
      try {
        const instance = new Razorpay({ key_id: keyId, key_secret: keySecret });
        const options = {
          amount: Math.round(price * 100),
          currency: "INR",
          receipt: `ad_rcpt_${newAd._id.toString().slice(-6)}_${Date.now()}`,
          notes: { adId: newAd._id.toString(), userId: user._id.toString() }
        };
        const order = await instance.orders.create(options);
        return res.json({
          success: true,
          isMock: false,
          orderId: order.id,
          amount: order.amount,
          currency: order.currency,
          key: keyId,
          adId: newAd._id
        });
      } catch (rzpErr) {
        console.error("Razorpay order creation failed, falling back to sandbox mock:", rzpErr.message);
      }
    }

    // Mock mode fallback
    return res.json({
      success: true,
      isMock: true,
      orderId: `mock_ad_order_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`,
      amount: Math.round(price * 100),
      currency: "INR",
      key: "rzp_test_mockkey_newsghuru",
      adId: newAd._id
    });

  } catch (error) {
    console.error("Create user campaign error:", error);
    res.status(500).json({ success: false, message: error.message || "Server error submitting campaign" });
  }
});

// POST /api/ads/user-campaigns/verify-payment - Verify Razorpay payment for campaign
router.post("/user-campaigns/verify-payment", verifyToken, async (req, res) => {
  try {
    const { adId, razorpay_order_id, razorpay_payment_id, razorpay_signature, isMock } = req.body;
    if (!adId) {
      return res.status(400).json({ success: false, message: "Ad ID is required" });
    }

    const ad = await Advertisement.findById(adId);
    if (!ad) {
      return res.status(404).json({ success: false, message: "Campaign not found" });
    }

    if (!isMock && razorpay_signature) {
      const keySecret = process.env.RAZORPAY_KEY_SECRET;
      if (keySecret) {
        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto.createHmac("sha256", keySecret).update(body.toString()).digest("hex");
        if (expectedSignature !== razorpay_signature) {
          return res.status(400).json({ success: false, message: "Invalid payment signature" });
        }
      }
    }

    // Update Ad status to Pending Approval and Paid
    ad.paymentStatus = "Paid";
    ad.status = "Pending Approval";
    await ad.save();

    // Create Admin Notification
    try {
      const adminUsers = await User.find({ role: "admin" }).select("_id");
      for (let admin of adminUsers) {
        await Notification.create({
          recipientId: admin._id,
          type: "campaign_submitted",
          text: `New user advertisement campaign "${ad.title}" (₹${ad.amountPaid}) submitted for approval.`,
          language: "ta"
        });
      }
    } catch (notifErr) {
      console.error("Failed to send admin notification:", notifErr);
    }

    res.json({
      success: true,
      message: "Payment verified successfully! Your campaign is now awaiting Admin approval.",
      ad
    });
  } catch (error) {
    console.error("Verify campaign payment error:", error);
    res.status(500).json({ success: false, message: "Server error verifying payment" });
  }
});

// PUT /api/ads/:id/approve-campaign - Admin approves user campaign
router.put("/:id/approve-campaign", verifyToken, authorizeRoles("admin", "editor"), async (req, res) => {
  try {
    const ad = await Advertisement.findById(req.params.id);
    if (!ad) {
      return res.status(404).json({ success: false, message: "Advertisement campaign not found" });
    }

    const now = new Date();
    let newStatus = "Active";
    if (ad.startDate && now < new Date(ad.startDate)) {
      newStatus = "Scheduled";
    }

    ad.status = newStatus;
    ad.isActive = true;
    ad.approvedBy = req.user._id;
    ad.approvedAt = now;
    await ad.save();

    // Notify user
    if (ad.createdBy) {
      try {
        await Notification.create({
          recipientId: ad.createdBy,
          type: "campaign_approved",
          text: `🎉 Great news! Your ad campaign "${ad.title}" has been approved and is now ${newStatus}.`,
          language: ad.language === "ta" ? "ta" : "en"
        });
      } catch (nErr) {}
    }

    res.json({ success: true, message: `Campaign approved and set to ${newStatus}!`, ad });
  } catch (error) {
    console.error("Approve campaign error:", error);
    res.status(500).json({ success: false, message: "Server error approving campaign" });
  }
});

// PUT /api/ads/:id/reject-campaign - Admin rejects user campaign with AUTOMATIC WALLET REFUND
router.put("/:id/reject-campaign", verifyToken, authorizeRoles("admin", "editor"), async (req, res) => {
  try {
    const { rejectionReason } = req.body;
    const ad = await Advertisement.findById(req.params.id);
    if (!ad) {
      return res.status(404).json({ success: false, message: "Advertisement campaign not found" });
    }

    ad.status = "Rejected";
    ad.isActive = false;
    ad.rejectedAt = new Date();
    ad.rejectionReason = rejectionReason || "Campaign content did not meet guidelines.";

    let refundAmount = 0;
    let refundedToWallet = false;

    // Refund money to user wallet if ad was paid and not already refunded
    if (ad.paymentStatus === "Paid" && ad.amountPaid > 0 && ad.createdBy) {
      const user = await User.findById(ad.createdBy);
      if (user) {
        refundAmount = ad.amountPaid;
        user.walletBalance = (user.walletBalance || 0) + refundAmount;
        await user.save();
        ad.paymentStatus = "Refunded";
        refundedToWallet = true;

        // Notify user about rejection and refund
        try {
          await Notification.create({
            recipientId: user._id,
            type: "campaign_rejected",
            text: `Your campaign "${ad.title}" was rejected. Reason: ${ad.rejectionReason}. ₹${refundAmount.toLocaleString()} has been refunded to your wallet balance!`,
            language: ad.language === "ta" ? "ta" : "en"
          });
        } catch (nErr) {}
      }
    }

    await ad.save();

    res.json({
      success: true,
      message: refundedToWallet 
        ? `Campaign rejected. ₹${refundAmount.toLocaleString()} successfully refunded to user's wallet!`
        : "Campaign rejected.",
      ad,
      refundedToWallet,
      refundAmount
    });
  } catch (error) {
    console.error("Reject campaign error:", error);
    res.status(500).json({ success: false, message: "Server error rejecting campaign" });
  }
});

// Default seed slots
const DEFAULT_SLOT_PRICING = [
  { slotId: "TOP_BANNER", nameEn: "Top / Hero Banner", nameTa: "Top Banner (மேல் / ஹீரோ பேனர்)", priceWeekly: 19999, priceMonthly: 74999, descEn: "High visibility hero banner located right above the main news content feed.", descTa: "செய்திகளுக்கு மேலே அதிக பார்வை திறன் கொண்ட பிரதான பேனர்.", badgeEn: "Most Popular", badgeTa: "அதிக ஆதரவு" },
  { slotId: "HEADER_BANNER", nameEn: "Header Banner", nameTa: "Header Banner (தலைப்பு பேனர்)", priceWeekly: 14999, priceMonthly: 44999, descEn: "Prime position at the top header of every page for maximum brand visibility.", descTa: "ஒவ்வொரு பக்கத்தின் மேல் பகுதியில் உயர்ந்த முன்னுரிமையுடன் தோன்றும்.", badgeEn: "Top Value", badgeTa: "சிறந்த இடம்" },
  { slotId: "SECTION_BANNER", nameEn: "Section Banner", nameTa: "Section Banner (பிரிவு பேனர்)", priceWeekly: 7499, priceMonthly: 19999, descEn: "Embedded within news category feeds and article reader pages.", descTa: "செய்தி பிரிவுகள் மற்றும் கட்டுரைகளுக்கு நடுவே தோன்றும் பேனர்.", badgeEn: "Category Feed", badgeTa: "பிரிவு விளம்பரம்" },
  { slotId: "FLOATING_ADVERTISEMENT", nameEn: "Floating Bar", nameTa: "Floating Bar (மிதக்கும் விளம்பரம்)", priceWeekly: 17999, priceMonthly: 54999, descEn: "Fixed sticky bar attached at the bottom of mobile & desktop views.", descTa: "திரையின் கீழ் பகுதியில் நிலையாக இருக்கும் விளம்பரம்.", badgeEn: "High Engagement", badgeTa: "சிறந்த ஈர்ப்பு" },
  { slotId: "SIDEBAR", nameEn: "Sidebar Widget", nameTa: "Sidebar (பக்கவாட்டு பேனர்)", priceWeekly: 7499, priceMonthly: 19999, descEn: "Persistent sticky widget on desktop reader sidebars.", descTa: "கணினி திரையின் பக்கவாட்டில் நிலைத்திருக்கும் விளம்பரம்.", badgeEn: "Steady Reach", badgeTa: "நிலையான பார்வை" },
  { slotId: "FOOTER_BANNER", nameEn: "Footer Banner", nameTa: "Footer Banner (அடிக்குறிப்பு பேனர்)", priceWeekly: 4999, priceMonthly: 11999, descEn: "Prominent ad placement situated at the bottom footer of every page.", descTa: "தளத்தின் கீழ் பகுதியில் தோன்றும் அடிக்குறிப்பு விளம்பரம்.", badgeEn: "Budget Friendly", badgeTa: "குறைந்த கட்டணம்" },
  { slotId: "POPUP_ADVERTISEMENT", nameEn: "Popup Advertisement", nameTa: "Popup Advertisement (பாப்-அப் விளம்பரம்)", priceWeekly: 20000, priceMonthly: 0, descEn: "Full-attention modal popup presented when readers open the portal (Weekly Only).", descTa: "வாசகர்கள் தளத்திற்கு வரும்போது பாப்-அப் ஆக தோன்றும் (வாராந்திரம் மட்டும்).", badgeEn: "Direct Impact", badgeTa: "நேரடி பார்வை" }
];

// GET /api/ads/pricing/all - Public endpoint to get slot pricing definitions
router.get("/pricing/all", async (req, res) => {
  try {
    let pricing = await AdPricing.find();
    if (!pricing || pricing.length === 0) {
      pricing = await AdPricing.insertMany(DEFAULT_SLOT_PRICING);
    } else {
      // Auto-migration sync to ensure new slots and priceWeekly/priceMonthly are active
      for (let def of DEFAULT_SLOT_PRICING) {
        const existing = pricing.find(p => p.slotId === def.slotId);
        if (!existing) {
          await AdPricing.create(def);
        } else if (!existing.priceMonthly || (existing.priceWeekly !== def.priceWeekly && existing.priceWeekly < 10000 && def.priceWeekly >= 10000)) {
          existing.priceWeekly = def.priceWeekly;
          existing.priceMonthly = def.priceMonthly;
          existing.nameEn = def.nameEn;
          await existing.save();
        }
      }
      pricing = await AdPricing.find();
    }
    res.json({ success: true, pricing });
  } catch (error) {
    console.error("Fetch ad pricing error:", error);
    res.status(500).json({ success: false, message: "Server error fetching ad pricing" });
  }
});

// PUT /api/ads/pricing/update - Admin endpoint to update slot pricing
router.put("/pricing/update", verifyToken, authorizeRoles("admin"), async (req, res) => {
  try {
    const { slotPricing } = req.body;
    if (!Array.isArray(slotPricing)) {
      return res.status(400).json({ success: false, message: "Invalid slot pricing data format" });
    }

    for (let item of slotPricing) {
      if (!item.slotId) continue;
      await AdPricing.findOneAndUpdate(
        { slotId: item.slotId },
        { 
          priceWeekly: Number(item.priceWeekly || 0),
          priceMonthly: Number(item.priceMonthly || 0),
          nameEn: item.nameEn || item.name || item.slotId,
          nameTa: item.nameTa || item.name || item.slotId,
          descEn: item.descEn || item.desc || "",
          descTa: item.descTa || item.desc || "",
          badgeEn: item.badgeEn || item.badge || "",
          badgeTa: item.badgeTa || item.badge || ""
        },
        { upsert: true, returnDocument: 'after' }
      );
    }

    const updatedPricing = await AdPricing.find();
    res.json({ success: true, message: "🎉 Advertisement slot pricing updated successfully!", pricing: updatedPricing });
  } catch (error) {
    console.error("Update ad pricing error:", error);
    res.status(500).json({ success: false, message: error.message || "Server error updating ad pricing" });
  }
});

module.exports = router;

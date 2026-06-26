const express = require("express");
const router = require("express").Router();

const multer = require("multer");
const News = require("../models/News");
const User = require("../models/User");
const Notification = require("../models/Notification");
const VisitorStats = require("../models/VisitorStats");
const { verifyToken, authorizeRoles } = require("../middleware/authMiddleware");
const messaging = require("../config/firebaseAdmin");
const { sendNewsPublishEmail, getTransporter } = require("../utils/emailService");

const fs = require('fs');
const path = require('path');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const sanitized = file.originalname.replace(/\s+/g, '-');
    cb(null, Date.now() + '-' + sanitized);
  }
});

const upload = multer({ storage });

const uploadFields = upload.fields([
  { name: "coverImage", maxCount: 1 },
  { name: "galleryImages", maxCount: 10 }
]);

// Helper to write FCM debug logs to a file
const logFCM = (message) => {
  const logMsg = `[${new Date().toLocaleString()}] ${message}\n`;
  console.log(message);
  try {
    fs.appendFileSync(path.join(__dirname, "../fcm-debug.log"), logMsg);
  } catch (err) {
    console.error("Failed to write to fcm-debug.log:", err);
  }
};

// Helper to send FCM notifications to all subscribed users
const sendFCMPushNotification = async (news) => {
  logFCM(`📣 sendFCMPushNotification helper triggered for news article: "${news.title}" (ID: ${news._id})`);
  if (!news.sendBrowserNotification) {
    logFCM(`ℹ️ FCM Delivery skipped: sendBrowserNotification is false or undefined for news ID: ${news._id}`);
    return;
  }
  try {
    const newsLang = news.language || "ta";
    const subscribedUsers = await User.find({
      fcmToken: { $nin: [null, ""] }
    });
    
    const GuestSubscription = require("../models/GuestSubscription");
    const guestSubs = await GuestSubscription.find({
      fcmToken: { $nin: [null, ""] }
    });
    
    logFCM(`🔍 Found ${subscribedUsers.length} users and ${guestSubs.length} guests with notifications enabled in DB.`);
    
    const allTokens = [
      ...subscribedUsers.map(u => u.fcmToken),
      ...guestSubs.map(g => g.fcmToken)
    ];
    
    const tokens = Array.from(new Set(allTokens))
      .filter(t => typeof t === "string" && t.trim() !== "");
    
    logFCM(`🎯 Validated FCM tokens to notify: ${JSON.stringify(tokens)}`);
    
    // Validate image URL — must be an absolute https:// URL with a real hostname
    // (localhost URLs and relative paths are rejected by FCM notification.imageUrl)
    const isValidImageUrl = (url) => {
      if (typeof url !== "string" || !url.trim()) return false;
      try {
        const parsed = new URL(url);
        // Allow http/https and localhost for local testing
        return parsed.protocol === "https:" || parsed.protocol === "http:";
      } catch {
        return false;
      }
    };
    const imageUrl = isValidImageUrl(news.image) ? encodeURI(news.image) : null;

    if (tokens.length > 0 && messaging) {
      const frontendUrl = newsLang === "en" 
        ? (process.env.FRONTEND_URL || "http://localhost:3001")
        : (process.env.FRONTEND_URL_TA || "http://localhost:3002");
      
      const newsLink = `${frontendUrl}/news/${news._id}`;
      
      const isEnglish = newsLang === "en";
      const titleText = isEnglish ? "📰 NewsGhuru — New Article" : "📰 நியூஸ் குரு — புதிய செய்தி";
      const bodyText = isEnglish 
        ? (news.title || "New article published. Tap to read.")
        : (news.title || "புதிய செய்தி வெளியிடப்பட்டது. படிக்க தொடவும்.");
      const bodyWebText = isEnglish
        ? (news.title || "New article published.")
        : (news.title || "புதிய செய்தி வெளியிடப்பட்டது.");
      const faviconFile = isEnglish ? "faviconeng.png" : "favicontam.png";

      const message = {
        // Top-level notification: NO imageUrl — FCM rejects non-https external URLs
        notification: {
          title: titleText,
          body: bodyText,
        },
        data: {
          link: newsLink,
          newsId: news._id.toString(),
          title: news.title || "",
          ...(imageUrl ? { image: imageUrl } : {}),
        },
        webpush: {
          notification: {
            title: titleText,
            body: bodyWebText,
            icon: `${frontendUrl}/${faviconFile}`,
            badge: `${frontendUrl}/${faviconFile}`,
            requireInteraction: false,
            ...(imageUrl ? { image: imageUrl } : {}),
          },
          fcmOptions: {
            link: newsLink,
          },
          headers: {
            Urgency: "high",
          },
        },
        tokens: tokens,
      };
      
      logFCM("🚀 Dispatching FCM multicast payload...");
      const response = await messaging.sendEachForMulticast(message);
      logFCM(`✅ FCM Delivery Result: ${response.successCount} messages sent successfully, ${response.failureCount} failed.`);
      if (response.responses && response.responses.length > 0) {
        logFCM(`Detailed Responses: ${JSON.stringify(response.responses)}`);
      }
      return response;
    } else if (tokens.length > 0) {
      logFCM("⚠️ FCM Delivery skipped: firebase-admin messaging is null or not initialized.");
    } else {
      logFCM("ℹ️ FCM Delivery skipped: no valid FCM tokens found in subscribers list.");
    }
  } catch (fcmErr) {
    logFCM(`❌ Failed to send FCM notifications: ${fcmErr.stack || fcmErr.message || fcmErr}`);
  }
};

// GET /api/news/reporter/my-articles - Fetch articles for the logged-in reporter
router.get("/reporter/my-articles", verifyToken, async (req, res) => {
  try {
    const query = { reporterId: req.user._id };
    
    if (req.query.status) {
      if (req.query.status === "submitted") {
        query.status = "pending_editor_review";
      } else if (req.query.status === "rejected") {
        // Reporters no longer handle rejected articles — all rejections are handled by editor
        // Return empty result for rejected filter to avoid confusion
        return res.json([]);
      } else {
        query.status = req.query.status;
      }
    } else {
      // When fetching "all", exclude all rejected statuses — only editor handles those
      query.status = { $nin: ["rejected", "admin_rejected"] };
    }
    
    const articles = await News.find(query).sort({ createdAt: -1 });
    res.json(articles);
  } catch (error) {
    console.error("Error fetching reporter articles:", error);
    res.status(500).json({ message: error.message });
  }
});

// POST /api/news/create - Create news article (Save Draft or Submit to Editor)
router.post("/create", verifyToken, uploadFields, async (req, res) => {
  try {
    const {
      title,
      subtitle,
      category,
      location,
      shortDescription,
      fullDescription,
      tags,
      seoKeywords,
      status,
      language,
    } = req.body;

    const baseUrl = req.protocol + '://' + req.get('host');
    let coverImagePath = "";
    if (req.files && req.files["coverImage"] && req.files["coverImage"][0]) {
      coverImagePath = baseUrl + "/uploads/" + req.files["coverImage"][0].filename;
    }

    let galleryImagePaths = [];
    if (req.files && req.files["galleryImages"]) {
      galleryImagePaths = req.files["galleryImages"].map(
        (file) => baseUrl + "/uploads/" + file.filename
      );
    }

    const newsDate = new Date();
    const timeString = newsDate.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    let finalStatus = status || "draft";
    if (req.user.role === "reporter") {
      if (finalStatus !== "draft" && finalStatus !== "pending_editor_review") {
        finalStatus = "pending_editor_review";
      }
    }

    const news = new News({
      title,
      subtitle,
      description: fullDescription || "",
      shortDescription: shortDescription || "",
      image: coverImagePath, // Legacy fallback
      coverImage: coverImagePath,
      galleryImages: galleryImagePaths,
      category: category || "politics",
      location: location || "",
      tags: tags || "",
      seoKeywords: seoKeywords || "",
      reporterId: req.user._id,
      status: finalStatus,
      date: newsDate,
      time: timeString,
      submittedAt: finalStatus === "pending_editor_review" ? newsDate : undefined,
      adminId: finalStatus === "published" ? req.user._id : undefined,
      publishedAt: finalStatus === "published" ? newsDate : undefined,
      language: language || "ta",
      sendBrowserNotification: req.body.sendBrowserNotification === true || req.body.sendBrowserNotification === "true" || req.body.sendNotification === true || req.body.sendNotification === "true",
      sendNotification: req.body.sendBrowserNotification === true || req.body.sendBrowserNotification === "true" || req.body.sendNotification === true || req.body.sendNotification === "true",
    });

    const savedNews = await news.save();

    // Notify all editors if submitted for review
    if (savedNews.status === "pending_editor_review") {
      try {
        const editors = await User.find({ role: "editor" });
        const notificationPromises = editors.map((editor) =>
          Notification.create({
            recipientId: editor._id,
            type: "submitted",
            text: `New article "${savedNews.title}" submitted by Reporter ${req.user.name} is pending review.`,
            language: savedNews.language || "ta",
          })
        );
        await Promise.all(notificationPromises);
      } catch (notifErr) {
        console.error("Failed to send submission notifications to editors:", notifErr);
      }
    } else if (savedNews.status === "published") {
      // Direct Admin Publish: Create in-app notification in DB
      try {
        await Notification.create({
          recipientId: savedNews.reporterId,
          type: "published",
          text: `Your article "${savedNews.title}" has been published.`,
          language: savedNews.language || "ta",
        });
      } catch (notifErr) {
        console.error("Failed to create publish notification:", notifErr);
      }

      // Direct Admin Publish: Send push notifications immediately
      await sendFCMPushNotification(savedNews);

      // --- NEW EMAIL NOTIFICATION CODE (Runs safely in the background) ---
      try {
        const EmailSchedule = require("../models/EmailSchedule");
        const schedule = await EmailSchedule.findOne({ language: savedNews.language || "ta" });
        if (!schedule || !schedule.isEnabled) {
          sendNewsPublishEmail(savedNews.language || "ta");
        } else {
          console.log(`ℹ️ [EMAIL] Scheduling is enabled for ${savedNews.language || "ta"}. Email will be sent at the scheduled time.`);
        }
      } catch (mailErr) {
        console.error("❌ Failed to trigger email notifications:", mailErr);
      }
      // --- END NEW EMAIL NOTIFICATION CODE ---
    }

    res.status(201).json(savedNews);
  } catch (error) {
    console.error("Error creating news:", error);
    res.status(500).json({ message: error.message });
  }
});

// ADD NEWS
router.post("/", upload.single("image"), async (req, res) => {
  try {
    const newsDate = req.body.date ? new Date(req.body.date) : new Date();
    const news = new News({
      title: req.body.title,
      description: req.body.description,
      category: req.body.category,
      time: req.body.time,
      comments: req.body.comments,
      views: req.body.views,
      date: newsDate,
      createdAt: newsDate,
      keywords: req.body.keywords,
      image: req.file ? req.protocol + '://' + req.get('host') + "/uploads/" + req.file.filename : "",
    });

    const savedNews = await news.save();
    res.json(savedNews);

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});


// GET ALL NEWS
router.get("/", async (req, res) => {
  try {
    const query = {};
    const lang = req.query.language || "ta";
    if (lang !== "all") {
      query.language = lang;
    }
    
    if (req.query.status) {
      query.status = req.query.status;
    }
    
    const news = await News.find(query).sort({ createdAt: -1 });
    res.json(news);

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});


// GET CATEGORY NEWS
router.get("/category/:category", async (req, res) => {
  try {
    const categoryParam = req.params.category;
    const query = {
      category: { $regex: new RegExp("^" + categoryParam + "$", "i") },
      status: "published"
    };
    
    const lang = req.query.language || "ta";
    if (lang !== "all") {
      query.language = lang;
    }
    
    const news = await News.find(query).sort({ createdAt: -1 });

    res.json(news);

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});


// GET /api/news/test-email - Test email sending functionality
router.get("/test-email", async (req, res) => {
  const targetEmail = req.query.email || process.env.SMTP_EMAIL;
  const email = process.env.SMTP_EMAIL;
  const password = process.env.SMTP_PASSWORD;

  const diagnostics = {
    env: {
      smtpEmailLength: email ? email.length : 0,
      smtpPasswordLength: password ? password.length : 0,
      hasEmailPlaceholder: email ? email.includes("your_email_here") : false,
      hasPasswordPlaceholder: password ? password.includes("your_16_character_app_password_here") : false,
      emailHasSpaces: email ? /^\s|\s$/.test(email) : false,
      passwordHasSpaces: password ? /^\s|\s$/.test(password) : false,
    },
    transporterVerified: false,
    emailSent: false,
    error: null,
  };

  try {
    if (diagnostics.env.hasEmailPlaceholder || diagnostics.env.hasPasswordPlaceholder) {
      throw new Error("SMTP credentials in .env are still set to placeholder values. Please update backend/.env with your actual Gmail address and App Password.");
    }

    const testTransporter = getTransporter();
    
    // Verify connection configuration
    await testTransporter.verify();
    diagnostics.transporterVerified = true;

    // Send a test mail to the specified email (or the sender email)
    if (targetEmail) {
      const info = await testTransporter.sendMail({
        from: `"NewsGhuru Test" <${email}>`,
        to: targetEmail,
        subject: "NewsGhuru SMTP Test Email",
        text: "If you receive this, Nodemailer is configured successfully for NewsGhuru!",
        html: "<p>If you receive this, Nodemailer is configured successfully for NewsGhuru!</p>",
      });
      diagnostics.emailSent = true;
      diagnostics.info = info;
    } else {
      diagnostics.message = "Transporter verified, but email send was skipped because recipient is invalid.";
    }

    res.json({ success: true, diagnostics });
  } catch (err) {
    diagnostics.error = {
      message: err.message,
      code: err.code,
      response: err.response,
      responseCode: err.responseCode,
    };
    res.status(500).json({ success: false, diagnostics });
  }
});


// GET PUBLISHED NEWS (for public users frontend)
router.get("/published", async (req, res) => {
  try {
    const query = { status: "published" };
    const lang = req.query.language || "ta";
    if (lang !== "all") {
      query.language = lang;
    }
    const news = await News.find(query).sort({ publishedAt: -1, createdAt: -1 });
    res.json(news);
  } catch (error) {
    console.error("Error fetching published news:", error);
    res.status(500).json({ message: error.message });
  }
});



// NOTE: Generic /:id routes are defined at the END of this file (after all specific routes)
// to prevent them from intercepting requests meant for /editor/* and /admin/* routes.

// GET /api/news/editor/review-queue - Fetch articles for the editor queue
router.get("/editor/review-queue", verifyToken, authorizeRoles("editor"), async (req, res) => {
  try {
    const { status, language } = req.query;
    let query = {};

    if (status === "pending") {
      // Pending includes: articles awaiting review AND articles rejected by admin (need editor revision)
      query.status = { $in: ["pending_editor_review", "admin_rejected"] };
    } else if (status === "approved") {
      query.status = { $in: ["pending_admin_verification", "published"] };
    } else if (status === "rejected") {
      // Editor's "rejected" list = articles the editor themselves rejected (sent back to reporter)
      query.status = "rejected";
    } else {
      // "all" — exclude drafts
      query.status = { $nin: ["draft"] };
    }

    if (language && language !== "all") {
      query.language = language;
    }

    const articles = await News.find(query)
      .populate("reporterId", "name email")
      .sort({ createdAt: -1 });

    res.json(articles);
  } catch (error) {
    console.error("Error fetching editor queue:", error);
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/news/editor/save/:id - Editor saves changes to article without status modification
router.put("/editor/save/:id", verifyToken, authorizeRoles("editor"), uploadFields, async (req, res) => {
  try {
    const {
      title,
      subtitle,
      category,
      location,
      shortDescription,
      fullDescription,
      tags,
      seoKeywords,
      language,
    } = req.body;

    const news = await News.findById(req.params.id);
    if (!news) {
      return res.status(404).json({ message: "Article not found" });
    }

    if (title !== undefined) news.title = title;
    if (subtitle !== undefined) news.subtitle = subtitle;
    if (category !== undefined) news.category = category;
    if (location !== undefined) news.location = location;
    if (shortDescription !== undefined) news.shortDescription = shortDescription;
    if (fullDescription !== undefined) news.description = fullDescription;
    if (tags !== undefined) news.tags = tags;
    if (seoKeywords !== undefined) news.seoKeywords = seoKeywords;
    if (language !== undefined) news.language = language;

    if (req.files) {
      const baseUrl = req.protocol + '://' + req.get('host');
      if (req.files["coverImage"] && req.files["coverImage"][0]) {
        const coverPath = baseUrl + "/uploads/" + req.files["coverImage"][0].filename;
        news.image = coverPath;
        news.coverImage = coverPath;
      }
      if (req.files["galleryImages"]) {
        const galleryPaths = req.files["galleryImages"].map(
          (file) => baseUrl + "/uploads/" + file.filename
        );
        news.galleryImages = galleryPaths;
      }
    }

    const savedNews = await news.save();
    res.json(savedNews);
  } catch (error) {
    console.error("Error saving changes as editor:", error);
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/news/editor/reject/:id - Editor rejects article
router.put("/editor/reject/:id", verifyToken, authorizeRoles("editor"), async (req, res) => {
  try {
    const { rejectionReason } = req.body;
    if (!rejectionReason) {
      return res.status(400).json({ message: "Rejection reason is required" });
    }

    const news = await News.findById(req.params.id);
    if (!news) {
      return res.status(404).json({ message: "Article not found" });
    }

    news.status = "rejected";
    news.rejectionReason = rejectionReason;
    news.rejectedAt = new Date();

    const savedNews = await news.save();

    // Create notification for original reporter
    await Notification.create({
      recipientId: news.reporterId,
      type: "rejected",
      text: `Your article "${news.title}" was rejected by the Editor.`,
      reason: rejectionReason,
      language: news.language || "ta",
    });

    res.json(savedNews);
  } catch (error) {
    console.error("Error rejecting article:", error);
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/news/editor/approve/:id - Editor approves article
router.put("/editor/approve/:id", verifyToken, authorizeRoles("editor"), async (req, res) => {
  try {
    const news = await News.findById(req.params.id);
    if (!news) {
      return res.status(404).json({ message: "Article not found" });
    }

    news.status = "pending_admin_verification";
    news.editorId = req.user._id;
    news.approvedAt = new Date();

    const savedNews = await news.save();

    // Notify all admin users
    try {
      const admins = await User.find({ role: "admin" });
      const notificationPromises = admins.map((admin) =>
        Notification.create({
          recipientId: admin._id,
          type: "approved",
          text: `Article "${savedNews.title}" has been approved by Editor ${req.user.name} and is pending admin verification.`,
          language: savedNews.language || "ta",
        })
      );
      await Promise.all(notificationPromises);
    } catch (notifErr) {
      console.error("Failed to notify admins of approval:", notifErr);
    }

    res.json(savedNews);
  } catch (error) {
    console.error("Error approving article:", error);
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/news/editor/resubmit/:id - Editor resubmits rejected article back to admin after revision
router.put("/editor/resubmit/:id", verifyToken, authorizeRoles("editor"), async (req, res) => {
  try {
    const news = await News.findById(req.params.id);
    if (!news) {
      return res.status(404).json({ message: "Article not found" });
    }

    if (news.status !== "admin_rejected" && news.status !== "rejected") {
      return res.status(400).json({ message: "Only rejected articles can be resubmitted." });
    }

    news.status = "pending_admin_verification";
    news.editorId = req.user._id;
    news.approvedAt = new Date();
    // Clear the rejection reason since it's being resubmitted
    news.rejectionReason = undefined;
    news.rejectedAt = undefined;

    const savedNews = await news.save();

    // Notify all admin users
    try {
      const admins = await User.find({ role: "admin" });
      const notificationPromises = admins.map((admin) =>
        Notification.create({
          recipientId: admin._id,
          type: "approved",
          text: `Article "${savedNews.title}" has been revised by Editor ${req.user.name} and resubmitted for admin verification.`,
          language: savedNews.language || "ta",
        })
      );
      await Promise.all(notificationPromises);
    } catch (notifErr) {
      console.error("Failed to notify admins of resubmission:", notifErr);
    }

    res.json(savedNews);
  } catch (error) {
    console.error("Error resubmitting article to admin:", error);
    res.status(500).json({ message: error.message });
  }
});

// Admin stats endpoint
router.get("/admin/stats", verifyToken, authorizeRoles("admin"), async (req, res) => {
  try {
    const Advertisement = require("../models/Advertisement");
    const Short = require("../models/Short");
    const PhotoStory = require("../models/PhotoStory");

    const totalNews = await News.countDocuments();
    const pendingApproval = await News.countDocuments({ status: "pending_admin_verification" });
    const publishedNews = await News.countDocuments({ status: "published" });
    const rejectedNews = await News.countDocuments({ status: "rejected" });
    const totalReporters = await User.countDocuments({ role: "reporter" });
    const totalEditors = await User.countDocuments({ role: "editor" });
    const totalUsers = await User.countDocuments();
    const englishUsers = await User.countDocuments({ language: "en" });
    const tamilUsers = await User.countDocuments({ $or: [{ language: "ta" }, { language: { $exists: false } }, { language: "" }] });
    const pendingAdvertisementsCount = await Advertisement.countDocuments({ status: "Pending Approval" });
    const pendingNewsShortsCount = await Short.countDocuments({ status: "Pending Approval" });
    const pendingPhotoStoriesCount = await PhotoStory.countDocuments({ status: "Pending Approval" });
    
    // Category distribution stats
    const categoriesData = await News.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } }
    ]);
    const categoryStats = categoriesData.map(c => ({
      category: c._id ? (c._id.charAt(0).toUpperCase() + c._id.slice(1)) : "Others",
      count: c.count
    }));
    
    // Breaking News count: published news with category exactly "breaking"
    const breakingNewsCount = await News.countDocuments({ 
      category: { $regex: /^breaking$/i }, 
      status: "published" 
    });

    // Weekly graph data (Mon-Sun)
    const today = new Date();
    const currentDay = today.getDay();
    const distanceToMonday = currentDay === 0 ? 6 : currentDay - 1;
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - distanceToMonday);
    startOfWeek.setHours(0, 0, 0, 0);

    const weeklyStats = [];
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    for (let i = 0; i < 7; i++) {
      const dayStart = new Date(startOfWeek);
      dayStart.setDate(startOfWeek.getDate() + i);
      const dayEnd = new Date(dayStart);
      dayEnd.setHours(23, 59, 59, 999);

      const submissions = await News.countDocuments({
        createdAt: { $gte: dayStart, $lte: dayEnd }
      });

      const published = await News.countDocuments({
        status: "published",
        publishedAt: { $gte: dayStart, $lte: dayEnd }
      });

      weeklyStats.push({ name: days[i], submissions, published });
    }

    // Recent Activities (from notifications)
    const notifications = await Notification.find()
      .sort({ createdAt: -1 })
      .limit(10);

    const recentActivities = notifications.map(n => {
      const diffMins = Math.floor((new Date() - new Date(n.createdAt)) / 60000);
      let timeDesc = "Just now";
      if (diffMins >= 1 && diffMins < 60) timeDesc = `${diffMins} mins ago`;
      else if (diffMins >= 60 && diffMins < 1440) timeDesc = `${Math.floor(diffMins / 60)} hours ago`;
      else if (diffMins >= 1440) timeDesc = `${Math.floor(diffMins / 1440)} days ago`;

      return {
        id: n._id,
        text: n.text,
        time: timeDesc,
        type: n.type
      };
    });

    // Pending List snippet (limit 5)
    const pendingArticles = await News.find({ status: "pending_admin_verification" })
      .populate("reporterId", "name")
      .sort({ createdAt: -1 })
      .limit(5);

    const pendingMapped = pendingArticles.map(art => ({
      id: art._id,
      title: art.title,
      reporter: art.reporterId ? art.reporterId.name : "Reporter",
      date: new Date(art.createdAt).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric"
      })
    }));

    // Total viewers from VisitorStats
    const visitorDoc = await VisitorStats.findOne();
    const totalViewers = visitorDoc ? visitorDoc.count : 0;
    const englishViewers = visitorDoc ? (visitorDoc.englishCount || 0) : 0;
    const tamilViewers = visitorDoc ? (visitorDoc.tamilCount || 0) : 0;

    // Login users: active in last 15 minutes
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
    const loginUsers = await User.countDocuments({
      lastActiveAt: { $gte: fifteenMinutesAgo },
    });

    // Subscribers count
    const subscribersCount = await User.countDocuments({
      $or: [{ isSubscribed: true }, { isPremium: true }],
    });

    res.json({
      success: true,
      totalNews,
      pendingApproval,
      publishedNews,
      rejectedNews,
      totalReporters,
      totalEditors,
      totalUsers,
      englishUsers,
      tamilUsers,
      totalViewers,
      englishViewers,
      tamilViewers,
      loginUsers,
      subscribersCount,
      pendingAdvertisementsCount,
      pendingNewsShortsCount,
      pendingPhotoStoriesCount,
      breakingNewsCount,
      weeklyStats,
      recentActivities,
      categoryStats,
      pendingArticles: pendingMapped
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    res.status(500).json({ message: "Server error fetching stats" });
  }
});

// Admin fetch articles
router.get("/admin/articles", verifyToken, authorizeRoles("admin"), async (req, res) => {
  try {
    const { filter, language } = req.query;
    let query = {};
    
    if (filter === "pending") {
      query.status = "pending_admin_verification";
    } else if (filter === "published") {
      query.status = "published";
    } else {
      // all
      query.status = { $in: ["pending_admin_verification", "published", "rejected"] };
    }

    if (language && language !== "all") {
      query.language = language;
    }

    const articles = await News.find(query)
      .populate("reporterId", "name")
      .populate("editorId", "name")
      .sort({ createdAt: -1 });

    const mapped = articles.map(art => ({
      id: art._id,
      title: art.title,
      subtitle: art.subtitle,
      category: art.category,
      location: art.location,
      shortDescription: art.shortDescription,
      fullDescription: art.description,
      tags: art.tags,
      seoKeywords: art.seoKeywords,
      reporter: art.reporterId ? art.reporterId.name : "-",
      editor: art.editorId ? art.editorId.name : "-",
      views: art.views || 0,
      status: art.status === "pending_admin_verification" ? "Pending Admin Verification" :
              art.status === "published" ? "Published" :
              art.status === "rejected" ? "Rejected" :
              art.status === "admin_rejected" ? "Returned to Editor" :
              art.status === "pending_editor_review" ? "Pending Review" : "Draft",
      date: new Date(art.date || art.createdAt).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric"
      }),
      coverImage: art.coverImage || art.image,
      galleryImages: art.galleryImages || [],
      language: art.language || "ta"
    }));

    res.json(mapped);
  } catch (error) {
    console.error("Admin fetch articles error:", error);
    res.status(500).json({ message: "Server error fetching articles" });
  }
});

// Admin Publish route
router.put("/admin/publish/:id", verifyToken, authorizeRoles("admin"), async (req, res) => {
  try {
    const news = await News.findById(req.params.id);
    if (!news) {
      return res.status(404).json({ message: "Article not found" });
    }

    const now = new Date();
    const timeString = now.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    news.status = "published";
    news.adminId = req.user._id;
    news.publishedAt = now;
    news.date = now;
    news.time = timeString;
    
    logFCM(`[Admin Publish /${req.params.id}] req.body: ${JSON.stringify(req.body)}`);
    
    if (req.body.sendNotification !== undefined) {
      news.sendNotification = req.body.sendNotification === true || req.body.sendNotification === "true";
      news.sendBrowserNotification = news.sendNotification;
      logFCM(`[Admin Publish /${req.params.id}] Set from sendNotification: ${news.sendNotification}`);
    } else if (req.body.sendBrowserNotification !== undefined) {
      news.sendBrowserNotification = req.body.sendBrowserNotification === true || req.body.sendBrowserNotification === "true";
      news.sendNotification = news.sendBrowserNotification;
      logFCM(`[Admin Publish /${req.params.id}] Set from sendBrowserNotification: ${news.sendBrowserNotification}`);
    } else {
      logFCM(`[Admin Publish /${req.params.id}] Neither sendNotification nor sendBrowserNotification was defined in request body`);
    }
    
    const saved = await news.save();

    // Create notifications for reporter and editor
    try {
      if (news.reporterId) {
        await Notification.create({
          recipientId: news.reporterId,
          type: "published",
          text: `Your article "${news.title}" has been published by the Admin.`,
          language: news.language || "ta",
        });
      }
      if (news.editorId) {
        await Notification.create({
          recipientId: news.editorId,
          type: "published",
          text: `The article "${news.title}" you approved has been published by the Admin.`,
          language: news.language || "ta",
        });
      }
    } catch (notifErr) {
      console.error("Failed to create notifications for publishing:", notifErr);
    }

    // --- FIREBASE FCM PUSH NOTIFICATION ---
    await sendFCMPushNotification(saved);
    // ----------------------------------------

    // --- NEW EMAIL NOTIFICATION CODE (Runs safely in the background) ---
    try {
      const EmailSchedule = require("../models/EmailSchedule");
      const schedule = await EmailSchedule.findOne({ language: saved.language || "ta" });
      if (!schedule || !schedule.isEnabled) {
        sendNewsPublishEmail(saved.language || "ta");
      } else {
        console.log(`ℹ️ [EMAIL] Scheduling is enabled for ${saved.language || "ta"}. Email will be sent at the scheduled time.`);
      }
    } catch (mailErr) {
      console.error("❌ Failed to trigger email notifications:", mailErr);
    }
    // --- END NEW EMAIL NOTIFICATION CODE ---




    res.json(saved);
  } catch (error) {
    console.error("Admin publish error:", error);
    res.status(500).json({ message: error.message });
  }
});

// Admin Reject route — sets status to 'admin_rejected' so the article goes back to the Editor for revision
router.put("/admin/reject/:id", verifyToken, authorizeRoles("admin"), async (req, res) => {
  try {
    const { rejectionReason } = req.body;
    if (!rejectionReason) {
      return res.status(400).json({ message: "Rejection reason is required" });
    }

    const news = await News.findById(req.params.id);
    if (!news) {
      return res.status(404).json({ message: "Article not found" });
    }

    // Use 'admin_rejected' so the article appears in the Editor's queue for revision
    // (not 'rejected' which is the editor→reporter rejection flow)
    news.status = "admin_rejected";
    news.rejectionReason = rejectionReason;
    news.rejectedAt = new Date();

    const saved = await news.save();

    // Notify the Editor so they can revise and resubmit
    try {
      if (news.editorId) {
        await Notification.create({
          recipientId: news.editorId,
          type: "rejected",
          text: `The article "${news.title}" you approved was rejected by the Admin. Please revise and resubmit. Reason: ${rejectionReason}`,
          reason: rejectionReason,
          language: news.language || "ta",
        });
      }
    } catch (notifErr) {
      console.error("Failed to notify editor of admin rejection:", notifErr);
    }

    res.json(saved);
  } catch (error) {
    console.error("Admin reject error:", error);
    res.status(500).json({ message: error.message });
  }
});

// ============================================================
// GENERIC /:id ROUTES — Must be defined LAST so specific routes
// like /editor/*, /admin/*, /reporter/* are matched first.
// ============================================================

// GET SINGLE NEWS BY ID
router.get("/:id", async (req, res) => {
  try {
    const news = await News.findById(req.params.id);
    if (!news) {
      return res.status(404).json({
        message: "News not found",
      });
    }

    res.json(news);

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// PUT /api/news/:id/view - Increment news article view count (public)
router.put("/:id/view", async (req, res) => {
  try {
    const news = await News.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    );
    if (!news) {
      return res.status(404).json({ message: "News not found" });
    }
    res.json({ success: true, views: news.views });
  } catch (error) {
    console.error("Error incrementing views:", error);
    res.status(500).json({ message: error.message });
  }
});

// DELETE SINGLE NEWS
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const news = await News.findById(req.params.id);
    if (!news) {
      return res.status(404).json({ message: "News not found" });
    }

    // Secure database mutation: allow admin OR the original reporter who created it
    if (req.user.role !== "admin" && news.reporterId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this article" });
    }

    await News.findByIdAndDelete(req.params.id);

    res.json({
      message: "News Deleted",
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// PUT /api/news/:id - Update news article (Edit) — reporter/admin generic update
router.put("/:id", verifyToken, uploadFields, async (req, res) => {
  try {
    const {
      title,
      subtitle,
      category,
      location,
      shortDescription,
      fullDescription,
      tags,
      seoKeywords,
      status,
      language,
    } = req.body;

    const news = await News.findById(req.params.id);
    if (!news) {
      return res.status(404).json({ message: "Article not found" });
    }

    // Verify ownership: only the reporter who created it can edit it, or an admin!
    if (req.user.role !== "admin" && news.reporterId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to edit this article" });
    }

    // Update fields if provided
    if (title !== undefined) news.title = title;
    if (subtitle !== undefined) news.subtitle = subtitle;
    if (category !== undefined) news.category = category;
    if (location !== undefined) news.location = location;
    if (shortDescription !== undefined) news.shortDescription = shortDescription;
    if (fullDescription !== undefined) news.description = fullDescription;
    if (tags !== undefined) news.tags = tags;
    if (seoKeywords !== undefined) news.seoKeywords = seoKeywords;
    if (language !== undefined) news.language = language;

    // Update status and timestamps
    if (status !== undefined) {
      let finalStatus = status;
      if (req.user.role === "reporter") {
        if (finalStatus !== "draft" && finalStatus !== "pending_editor_review") {
          finalStatus = "pending_editor_review";
        }
      }
      if (finalStatus === "published" && news.status !== "published") {
        const now = new Date();
        news.publishedAt = now;
        news.date = now;
        news.time = now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        });
      }
      news.status = finalStatus;
      if (finalStatus === "pending_editor_review") {
        news.submittedAt = new Date();
      }
    }

    // Handle files if uploaded
    if (req.files) {
      const baseUrl = req.protocol + '://' + req.get('host');
      if (req.files["coverImage"] && req.files["coverImage"][0]) {
        const coverPath = baseUrl + "/uploads/" + req.files["coverImage"][0].filename;
        news.image = coverPath;
        news.coverImage = coverPath;
      }
      if (req.files["galleryImages"]) {
        const galleryPaths = req.files["galleryImages"].map(
          (file) => baseUrl + "/uploads/" + file.filename
        );
        news.galleryImages = galleryPaths;
      }
    }

    const updatedNews = await news.save();

    // Notify all editors if submitted for review
    if (status === "pending_editor_review") {
      try {
        const editors = await User.find({ role: "editor" });
        const notificationPromises = editors.map((editor) =>
          Notification.create({
            recipientId: editor._id,
            type: "submitted",
            text: `Article "${updatedNews.title}" resubmitted by Reporter ${req.user.name} is pending review.`,
            language: updatedNews.language || "ta",
          })
        );
        await Promise.all(notificationPromises);
      } catch (notifErr) {
        console.error("Failed to send submission notifications to editors:", notifErr);
      }
    }

    res.json(updatedNews);
  } catch (error) {
    console.error("Error updating article:", error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
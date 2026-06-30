const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const { verifyToken, authorizeRoles } = require("../middleware/authMiddleware");

const crypto = require("crypto");
const Razorpay = require("razorpay");
const SponsoredArticle = require("../models/SponsoredArticle");
const SponsoredPackage = require("../models/SponsoredPackage");
const User = require("../models/User");
const Notification = require("../models/Notification");
const ComboPackageRequest = require("../models/ComboPackageRequest");

// Multer configuration for file uploads (images, videos, docs)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, "../uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const sanitized = file.originalname.replace(/\s+/g, "-");
    cb(null, "sponsored-" + Date.now() + "-" + sanitized);
  },
});
const upload = multer({ storage });

// Default packages configuration
const DEFAULT_PACKAGES = [
  {
    packageId: "article_basic",
    nameEn: "Sponsored News Article",
    nameTa: "ஸ்பான்சர் செய்யப்பட்ட செய்தி கட்டுரை",
    price: 8000,
    featuresEn: ["Professionally formatted article", "SEO Optimization", "Featured Image", "Brand Backlink", "Category Placement", "Social Media Sharing", "Permanent Website Publishing"],
    featuresTa: ["தொழில்முறை வடிவமைப்பு", "தேடுபொறி உகப்பாக்கம் (SEO)", "சிறப்புப் படம்", "பிராண்ட் பேக்லிங்க்", "பிரிவு இடம்", "சமூக ஊடக பகிர்வு", "நிரந்தர வெளியீடு"],
    badgeEn: "Standard",
    badgeTa: "தரநிலையானது",
    isVideoPackage: false,
  },
  {
    packageId: "article_seo",
    nameEn: "SEO Premium Article",
    nameTa: "எஸ்சிஓ பிரீமியம் கட்டுரை",
    price: 15000,
    featuresEn: ["High authority keyword targeting", "SEO Optimization", "Featured Image", "Brand Backlink", "Category Placement", "Social Media Sharing", "Permanent Website Publishing"],
    featuresTa: ["முக்கிய சொல் இலக்கு", "தேடுபொறி உகப்பாக்கம் (SEO)", "சிறப்புப் படம்", "பிராண்ட் பேக்லிங்க்", "பிரிவு இடம்", "சமூக ஊடக பகிர்வு", "நிரந்தர வெளியீடு"],
    badgeEn: "Popular",
    badgeTa: "பிரபலம்",
    isVideoPackage: false,
  },
  {
    packageId: "article_brand",
    nameEn: "Brand Story",
    nameTa: "பிராண்ட் கதை (Brand Story)",
    price: 20000,
    featuresEn: ["In-depth corporate feature", "SEO Optimization", "Featured Image & Gallery", "Brand Backlink", "Homepage Feature", "Social Media Campaign", "Permanent Publishing"],
    featuresTa: ["ஆழமான கார்ப்பரேட் அம்சம்", "எஸ்சிஓ உகப்பாக்கம்", "புகைப்பட கேலரி", "பிராண்ட் இணைப்பு", "முகப்பு பக்க இடம்", "சமூக ஊடக பிரச்சாரம்", "நிரந்தர வெளியீடு"],
    badgeEn: "High Impact",
    badgeTa: "உயர் தாக்கம்",
    isVideoPackage: false,
  },
  {
    packageId: "article_interview",
    nameEn: "CEO / Founder Interview",
    nameTa: "சிஇஓ / நிறுவனர் நேர்காணல்",
    price: 25000,
    featuresEn: ["Leadership spotlight Q&A", "SEO Optimization", "Featured Image", "Executive Backlink", "Category & Homepage Visibility", "Social Media Push", "Permanent Publishing"],
    featuresTa: ["தலைவர் சிறப்பு நேர்காணல்", "எஸ்சிஓ உகப்பாக்கம்", "சிறப்பு படம்", "கார்ப்பரேட் இணைப்பு", "முகப்பு பக்க பார்வை", "சமூக ஊடக தள்ளு", "நிரந்தர வெளியீடு"],
    badgeEn: "Executive",
    badgeTa: "நிர்வாகி",
    isVideoPackage: false,
  },
  {
    packageId: "article_launch",
    nameEn: "Product Launch Coverage",
    nameTa: "தயாரிப்பு தொடக்க செய்தி",
    price: 20000,
    featuresEn: ["New product unveil article", "SEO Optimization", "Multiple High-Res Images", "Direct Buy Backlink", "Category Placement", "Social Media Push", "Permanent Publishing"],
    featuresTa: ["புதிய தயாரிப்பு அறிமுகம்", "எஸ்சிஓ உகப்பாக்கம்", "உயர்தர படங்கள்", "நேரடி கொள்முதல் இணைப்பு", "பிரிவு இடம்", "சமூக ஊடக தள்ளு", "நிரந்தர வெளியீடு"],
    badgeEn: "New Launch",
    badgeTa: "புதிய அறிமுகம்",
    isVideoPackage: false,
  },
  {
    packageId: "article_event",
    nameEn: "Event Coverage",
    nameTa: "நிகழ்ச்சி செய்தி வெளியீடு",
    price: 15000,
    featuresEn: ["Event highlight writeup", "SEO Optimization", "Event Photo Highlights", "Ticket/Registration Backlink", "Category Placement", "Social Media Sharing", "Permanent Publishing"],
    featuresTa: ["நிகழ்ச்சி சிறப்பம்சங்கள்", "எஸ்சிஓ உகப்பாக்கம்", "நிகழ்ச்சி புகைப்படங்கள்", "பதிவு இணைப்பு", "பிரிவு இடம்", "சமூக ஊடக பகிர்வு", "நிரந்தர வெளியீடு"],
    badgeEn: "Event Special",
    badgeTa: "நிகழ்ச்சி சிறப்பு",
    isVideoPackage: false,
  },
  {
    packageId: "article_company",
    nameEn: "Company Profile Feature",
    nameTa: "நிறுவன அறிமுக கட்டுரை",
    price: 18000,
    featuresEn: ["Corporate overview story", "SEO Optimization", "Featured Image", "Official Website Backlink", "Category Placement", "Social Media Sharing", "Permanent Publishing"],
    featuresTa: ["கார்ப்பரேட் கண்ணோட்டம்", "எஸ்சிஓ உகப்பாக்கம்", "சிறப்புப் படம்", "அதிகாரப்பூர்வ இணைப்பு", "பிரிவு இடம்", "சமூக ஊடக பகிர்வு", "நிரந்தர வெளியீடு"],
    badgeEn: "Corporate",
    badgeTa: "கார்ப்பரேட்",
    isVideoPackage: false,
  },
  // Video Promotion Packages
  {
    packageId: "video_embed",
    nameEn: "Promotional Video Embed",
    nameTa: "விளம்பர வீடியோ இணைப்பு",
    price: 10000,
    featuresEn: ["HD Video Embed inside article", "Autoplay enabled on desktop", "Responsive mobile player"],
    featuresTa: ["கட்டுரையில் HD வீடியோ இணைப்பு", "ஆட்டோபிளே வசதி", "மொபைல் பிளேயர்"],
    badgeEn: "Add-on",
    badgeTa: "கூடுதல் சேர்க்கை",
    isVideoPackage: true,
  },
  {
    packageId: "video_featured",
    nameEn: "Homepage Featured Video",
    nameTa: "முகப்பு பக்க வீடியோ விளம்பரம்",
    price: 20000,
    featuresEn: ["Prime placement in Homepage Video section", "High conversion player", "Dedicated Video Tag"],
    featuresTa: ["முகப்பு பக்க வீடியோ பிரிவில் இடம்", "உயர் மாற்று பிளேயர்", "பிரத்யேக டேக்"],
    badgeEn: "Top Video",
    badgeTa: "பிரதான வீடியோ",
    isVideoPackage: true,
  },
  {
    packageId: "video_interview",
    nameEn: "Business Interview Video",
    nameTa: "வணிக நேர்காணல் வீடியோ",
    price: 35000,
    featuresEn: ["Exclusive Video Interview Embed", "Cover Story Integration", "Social Video Highlights"],
    featuresTa: ["பிரத்யேக வீடியோ நேர்காணல்", "கவர் ஸ்டோரி இணைப்பு", "சமூக வீடியோக்கள்"],
    badgeEn: "Exclusive",
    badgeTa: "பிரத்யேகமானது",
    isVideoPackage: true,
  },
  {
    packageId: "video_event",
    nameEn: "Event Video Coverage",
    nameTa: "நிகழ்ச்சி வீடியோ கவரேஜ்",
    price: 40000,
    featuresEn: ["Event summary reel embed", "Multi-platform distribution", "High visibility tag"],
    featuresTa: ["நிகழ்ச்சி வீடியோ ரீல்", "பல தள பகிர்வு", "உயர் பார்வை டேக்"],
    badgeEn: "Event Highlight",
    badgeTa: "நிகழ்ச்சி ரீல்",
    isVideoPackage: true,
  },
  {
    packageId: "video_documentary",
    nameEn: "Documentary / Brand Film",
    nameTa: "ஆவணப்படம் / பிராண்ட் படம்",
    price: 75000,
    featuresEn: ["Full-length brand documentary showcase", "Custom landing highlight", "VIP Distribution"],
    featuresTa: ["முழு நீள பிராண்ட் படம்", "தனிப்பயன் லேண்டிங் சிறப்பம்சம்", "விஐபி பகிர்வு"],
    badgeEn: "Premium Film",
    badgeTa: "பிரீமியம் பிலிம்",
    isVideoPackage: true,
    isComboPackage: false,
  },
  {
    packageId: "combo_starter",
    nameEn: "Starter Combo",
    nameTa: "ஸ்டார்ட்டர் காம்போ",
    price: 25000,
    featuresEn: ["1 Sponsored Article", "Instagram Post", "Facebook Post", "Sidebar Banner (7 Days)"],
    featuresTa: ["1 ஸ்பான்சர் செய்யப்பட்ட செய்தி", "இன்ஸ்டாகிராம் பதிவு (Instagram Post)", "ஃபேஸ்புக் பதிவு (Facebook Post)", "சைட்பார் பேனர் (7 நாட்கள்)"],
    badgeEn: "Starter",
    badgeTa: "ஸ்டார்ட்டர்",
    isVideoPackage: false,
    isComboPackage: true,
  },
  {
    packageId: "combo_growth",
    nameEn: "Business Growth",
    nameTa: "பிசினஸ் வளர்ச்சி காம்போ",
    price: 50000,
    featuresEn: ["2 Sponsored Articles", "Homepage Banner (15 Days)", "Instagram Reel", "Facebook Promotion", "WhatsApp Broadcast"],
    featuresTa: ["2 ஸ்பான்சர் செய்யப்பட்ட செய்திகள்", "முகப்பு பக்க பேனர் (15 நாட்கள்)", "இன்ஸ்டாகிராம் ரீல் (Reel)", "ஃபேஸ்புக் விளம்பரம் (Facebook Promotion)", "வாட்ஸ்அப் விளம்பரம் (WhatsApp Broadcast)"],
    badgeEn: "Growth",
    badgeTa: "வளர்ச்சி",
    isVideoPackage: false,
    isComboPackage: true,
  },
  {
    packageId: "combo_premium",
    nameEn: "Premium Brand",
    nameTa: "பிரீமியம் பிராண்ட் காம்போ",
    price: 100000,
    featuresEn: ["4 Sponsored Articles", "Homepage Banner (30 Days)", "Press Release", "Instagram Reel", "Facebook Promotion", "YouTube Community Post", "WhatsApp Promotion"],
    featuresTa: ["4 ஸ்பான்சர் செய்யப்பட்ட செய்திகள்", "முகப்பு பக்க பேனர் (30 நாட்கள்)", "பத்திரிக்கை செய்தி (Press Release)", "இன்ஸ்டாகிராம் ரீல் (Reel)", "ஃபேஸ்புக் விளம்பரம் (Facebook Promotion)", "யூடியூப் கம்யூனிட்டி போஸ்ட்", "வாட்ஸ்அப் விளம்பரம்"],
    badgeEn: "Premium",
    badgeTa: "பிரீமியம்",
    isVideoPackage: false,
    isComboPackage: true,
  },
];

// Seed packages helper
const ensurePackages = async () => {
  try {
    const count = await SponsoredPackage.countDocuments();
    if (count < DEFAULT_PACKAGES.length) {
      await SponsoredPackage.deleteMany({});
      await SponsoredPackage.insertMany(DEFAULT_PACKAGES);
      console.log("Reseeded sponsored packages with combo packages!");
    }
  } catch (err) {
    console.error("Error ensuring sponsored packages:", err);
  }
};
// NOTE: ensurePackages() is NOT called here at module load time because MongoDB
// may not be connected yet. It is called from server.js inside connectDB().then(...)
// after the DB connection is established.

// =========================================================================
// PUBLIC ENDPOINTS
// =========================================================================

// GET /api/sponsored/packages - Get all packages and video promotion rates
router.get("/packages", async (req, res) => {
  try {
    await ensurePackages();
    const packages = await SponsoredPackage.find().sort({ price: 1 });
    res.json({ success: true, packages });
  } catch (error) {
    console.error("Fetch packages error:", error);
    res.status(500).json({ success: false, message: "Server error fetching packages" });
  }
});

// POST /api/sponsored/request - Sponsor Request Portal submission (Method 2) with Razorpay order creation
router.post(
  "/request",
  verifyToken,
  upload.fields([
    { name: "logo", maxCount: 1 },
    { name: "image", maxCount: 1 },
    { name: "video", maxCount: 1 },
    { name: "documents", maxCount: 5 },
  ]),
  async (req, res) => {
    try {
      const {
        companyName,
        contactPerson,
        phone,
        email,
        website,
        packageType,
        packagePrice,
        videoPackage,
        videoCharge,
        preferredPlacement,
        durationDays,
        preferredPublishDate,
        eventDetails,
        description,
        language,
      } = req.body;

      if (!companyName || !contactPerson || !phone || !email) {
        return res.status(400).json({ success: false, message: "Please fill in all required contact details." });
      }

      const logoFile = req.files && req.files.logo ? `/uploads/${req.files.logo[0].filename}` : "";
      const imageFile = req.files && req.files.image ? `/uploads/${req.files.image[0].filename}` : "";
      const videoFile = req.files && req.files.video ? `/uploads/${req.files.video[0].filename}` : (req.body.videoUrl || "");
      const docFiles = req.files && req.files.documents ? req.files.documents.map(f => `/uploads/${f.filename}`) : [];

      const pPrice = Number(packagePrice) || 8000;
      const vCharge = Number(videoCharge) || 0;
      const hasVid = !!videoFile || (videoPackage && videoPackage !== "None");
      const totalPrice = pPrice + vCharge;

      const newRequest = new SponsoredArticle({
        userId: req.user._id,
        companyName,
        contactPerson,
        phone,
        email,
        website: website || "",
        companyLogo: logoFile,
        packageType: packageType || "Sponsored News Article",
        packagePrice: pPrice,
        placement: preferredPlacement || "homepage_sponsored",
        durationDays: Number(durationDays) || 7,
        videoPackage: videoPackage || "None",
        videoCharge: vCharge,
        hasVideo: hasVid,
        videoUrl: videoFile,
        status: "request_submitted",
        paymentStatus: "Pending",
        articleSource: "reporter_created",
        language: language && ["ta", "en", "both"].includes(language) ? language : "both",
        title: `${companyName} - ${packageType || "Sponsored Request"}`,
        eventDetails: eventDetails || description || "",
        shortDescription: description ? description.substring(0, 200) : "",
        image: imageFile,
        documents: docFiles,
        preferredPublishDate: preferredPublishDate ? new Date(preferredPublishDate) : null,
      });

      await newRequest.save();

      const keyId = process.env.RAZORPAY_KEY_ID;
      const keySecret = process.env.RAZORPAY_KEY_SECRET;

      if (keyId && keySecret && keyId !== "your_key_id" && keySecret !== "your_key_secret") {
        try {
          const instance = new Razorpay({ key_id: keyId, key_secret: keySecret });
          const options = {
            amount: Math.round(totalPrice * 100),
            currency: "INR",
            receipt: `spons_rcpt_${newRequest._id.toString().slice(-6)}_${Date.now()}`,
            notes: { requestId: newRequest._id.toString(), userId: req.user._id.toString() }
          };
          const order = await instance.orders.create(options);
          newRequest.orderId = order.id;
          await newRequest.save();

          return res.status(201).json({
            success: true,
            isMock: false,
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            key: keyId,
            requestId: newRequest._id,
            message: "Razorpay order created successfully!"
          });
        } catch (rzpErr) {
          console.error("Razorpay order creation failed, falling back to mock sandbox:", rzpErr.message);
        }
      }

      // Mock Sandbox Fallback
      return res.status(201).json({
        success: true,
        isMock: true,
        orderId: `mock_spons_order_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`,
        amount: Math.round(totalPrice * 100),
        currency: "INR",
        key: "rzp_test_mockkey_newsghuru",
        requestId: newRequest._id,
        message: "Mock Sandbox payment order generated."
      });
    } catch (error) {
      console.error("Submit sponsored request error:", error);
      res.status(500).json({ success: false, message: error.message || "Server error submitting request" });
    }
  }
);

// GET /api/sponsored/published - Public retrieval of published sponsored articles
router.get("/published", async (req, res) => {
  try {
    const { placement, language, limit } = req.query;
    const filter = { status: "published" };
    
    if (placement) {
      filter.placement = placement;
    }

    const now = new Date();
    // Build $and conditions: expiry check + optional language filter
    const andConditions = [
      { $or: [{ expiryDate: { $exists: false } }, { expiryDate: null }, { expiryDate: { $gte: now } }] }
    ];

    // Add language filter inside $and so it doesn't conflict with the expiry $or
    if (language && language !== "both") {
      andConditions.push({ $or: [{ language }, { language: "both" }] });
    }

    filter.$and = andConditions;

    let query = SponsoredArticle.find(filter)
      .populate("reporterId", "name avatar")
      .sort({ publishedAt: -1, createdAt: -1 });

    if (limit) {
      query = query.limit(Number(limit));
    }

    const articles = await query;
    res.json({ success: true, articles });
  } catch (error) {
    console.error("Fetch published sponsored error:", error);
    res.status(500).json({ success: false, message: "Server error fetching sponsored articles" });
  }
});

// GET /api/sponsored/article/:id - Public single reader view
router.get("/article/:id", async (req, res) => {
  try {
    const article = await SponsoredArticle.findById(req.params.id)
      .populate("reporterId", "name avatar bio");
    
    if (!article || article.status !== "published") {
      return res.status(404).json({ success: false, message: "Sponsored article not found or inactive" });
    }

    // Increment view count
    article.views = (article.views || 0) + 1;
    await article.save();

    res.json({ success: true, article });
  } catch (error) {
    console.error("Fetch single sponsored article error:", error);
    res.status(500).json({ success: false, message: "Server error fetching article details" });
  }
});

// =========================================================================
// PROTECTED WORKFLOW ENDPOINTS (REPORTER, EDITOR, ADMIN)
// =========================================================================

// GET /api/sponsored/reporter/assigned - Reporter views assigned tasks
router.get("/reporter/assigned", verifyToken, authorizeRoles("reporter", "editor", "admin"), async (req, res) => {
  try {
    const query = { reporterId: req.user._id };
    const tasks = await SponsoredArticle.find(query).sort({ updatedAt: -1 });
    res.json({ success: true, tasks });
  } catch (error) {
    console.error("Reporter assigned fetch error:", error);
    res.status(500).json({ success: false, message: "Server error fetching assignments" });
  }
});

// PUT /api/sponsored/reporter/draft/:id - Reporter updates draft and optionally submits to Editor
router.put(
  "/reporter/draft/:id",
  verifyToken,
  authorizeRoles("reporter", "editor", "admin"),
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "video", maxCount: 1 },
    { name: "galleryImages", maxCount: 10 },
  ]),
  async (req, res) => {
    try {
      const article = await SponsoredArticle.findById(req.params.id);
      if (!article) {
        return res.status(404).json({ success: false, message: "Task not found" });
      }

      if (req.user.role === "reporter" && String(article.reporterId) !== String(req.user._id)) {
        return res.status(403).json({ success: false, message: "Unauthorized to edit this assignment" });
      }

      const { title, subtitle, description, shortDescription, category, language, submitToEditor, videoUrl } = req.body;

      if (title) article.title = title;
      if (subtitle !== undefined) article.subtitle = subtitle;
      if (description) article.description = description;
      if (shortDescription !== undefined) article.shortDescription = shortDescription;
      if (category) article.category = category;
      if (language) article.language = language;

      if (req.files && req.files.image) {
        article.image = `/uploads/${req.files.image[0].filename}`;
      }
      if (req.files && req.files.video) {
        article.videoUrl = `/uploads/${req.files.video[0].filename}`;
        article.hasVideo = true;
      } else if (videoUrl !== undefined) {
        article.videoUrl = videoUrl;
        if (videoUrl) article.hasVideo = true;
      }

      if (req.files && req.files.galleryImages) {
        const newImgs = req.files.galleryImages.map(f => `/uploads/${f.filename}`);
        article.galleryImages = [...article.galleryImages, ...newImgs];
      }

      if (submitToEditor === "true" || submitToEditor === true) {
        article.status = "pending_editor_review";
        
        // Notify Editors
        try {
          const editors = await User.find({ role: { $in: ["editor", "admin"] } });
          for (let ed of editors) {
            await Notification.create({
              recipientId: ed._id,
              type: "submitted",
              text: `Sponsored article draft "${article.title}" submitted by Reporter ${req.user.name} for review.`,
              language: "ta",
            });
          }
        } catch (nErr) {}
      } else {
        article.status = "draft";
      }

      await article.save();
      res.json({
        success: true,
        message: article.status === "pending_editor_review" ? "Article submitted to Editor for review! 🚀" : "Draft saved successfully! 💾",
        article,
      });
    } catch (error) {
      console.error("Reporter draft update error:", error);
      res.status(500).json({ success: false, message: "Server error saving draft" });
    }
  }
);

// GET /api/sponsored/editor/review - Editor views pending reviews
router.get("/editor/review", verifyToken, authorizeRoles("editor", "admin"), async (req, res) => {
  try {
    const reviews = await SponsoredArticle.find({
      status: { $in: ["pending_editor_review", "draft", "request_submitted", "assigned_to_reporter"] }
    }).populate("reporterId", "name email").sort({ updatedAt: -1 });
    res.json({ success: true, reviews });
  } catch (error) {
    console.error("Editor review fetch error:", error);
    res.status(500).json({ success: false, message: "Server error fetching review tasks" });
  }
});

// PUT /api/sponsored/editor/verify/:id - Editor edits & verifies article, submits to Admin
router.put(
  "/editor/verify/:id",
  verifyToken,
  authorizeRoles("editor", "admin"),
  upload.fields([{ name: "image", maxCount: 1 }, { name: "video", maxCount: 1 }]),
  async (req, res) => {
    try {
      const article = await SponsoredArticle.findById(req.params.id);
      if (!article) {
        return res.status(404).json({ success: false, message: "Article not found" });
      }

      const { title, subtitle, description, shortDescription, category, sponsoredLabel, submitToAdmin, rejectionReason } = req.body;

      if (req.body.action === "reject") {
        article.status = "rejected";
        article.rejectionReason = rejectionReason || "Editor returned for changes.";
        await article.save();
        return res.json({ success: true, message: "Article returned to reporter / rejected.", article });
      }

      if (title) article.title = title;
      if (subtitle !== undefined) article.subtitle = subtitle;
      if (description) article.description = description;
      if (shortDescription !== undefined) article.shortDescription = shortDescription;
      if (category) article.category = category;
      if (sponsoredLabel) article.sponsoredLabel = sponsoredLabel;

      if (req.files && req.files.image) {
        article.image = `/uploads/${req.files.image[0].filename}`;
      }
      if (req.files && req.files.video) {
        article.videoUrl = `/uploads/${req.files.video[0].filename}`;
        article.hasVideo = true;
      }

      article.editorId = req.user._id;

      if (submitToAdmin === "true" || submitToAdmin === true) {
        article.status = "pending_admin_approval";
        
        // Notify Admins
        try {
          const admins = await User.find({ role: "admin" });
          for (let adm of admins) {
            await Notification.create({
              recipientId: adm._id,
              type: "submitted",
              text: `Sponsored article "${article.title}" verified by Editor ${req.user.name} and pending final approval.`,
              language: "ta",
            });
          }
        } catch (nErr) {}
      }

      await article.save();
      res.json({ success: true, message: "Verified by Editor and sent for Admin final approval! ✅", article });
    } catch (error) {
      console.error("Editor verify error:", error);
      res.status(500).json({ success: false, message: "Server error verifying article" });
    }
  }
);

// =========================================================================
// ADMIN CONTROL ENDPOINTS
// =========================================================================

// GET /api/sponsored/admin/all - Admin views all requests, drafts, published
router.get("/admin/all", verifyToken, authorizeRoles("admin"), async (req, res) => {
  try {
    const articles = await SponsoredArticle.find()
      .populate("reporterId", "name email phone")
      .populate("editorId", "name email")
      .sort({ createdAt: -1 });

    const reporters = await User.find({ role: { $in: ["reporter", "editor", "admin"] } }).select("name email role");

    res.json({ success: true, articles, reporters });
  } catch (error) {
    console.error("Admin fetch all error:", error);
    res.status(500).json({ success: false, message: "Server error fetching admin sponsored list" });
  }
});

// POST /api/sponsored/admin/create-direct - Method 1: Sponsor provided content directly created by Admin
router.post(
  "/admin/create-direct",
  verifyToken,
  authorizeRoles("admin"),
  upload.fields([
    { name: "logo", maxCount: 1 },
    { name: "image", maxCount: 1 },
    { name: "video", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const {
        companyName,
        contactPerson,
        phone,
        email,
        website,
        title,
        subtitle,
        description,
        category,
        packageType,
        packagePrice,
        placement,
        durationDays,
        videoPackage,
        videoCharge,
        sponsoredLabel,
        paymentStatus,
        language,
        socialFacebook,
        socialTwitter,
        socialLinkedin,
        socialInstagram,
      } = req.body;

      if (!companyName || !title || !description) {
        return res.status(400).json({ success: false, message: "Company Name, Title, and Description are required." });
      }

      const logoFile = req.files && req.files.logo ? `/uploads/${req.files.logo[0].filename}` : "";
      const imageFile = req.files && req.files.image ? `/uploads/${req.files.image[0].filename}` : "";
      const videoFile = req.files && req.files.video ? `/uploads/${req.files.video[0].filename}` : (req.body.videoUrl || "");

      const startDate = new Date();
      const durDays = Number(durationDays) || 30;
      const expDate = new Date(startDate.getTime() + durDays * 24 * 60 * 60 * 1000);

      const newArticle = new SponsoredArticle({
        companyName,
        contactPerson: contactPerson || "Admin Direct",
        phone: phone || "",
        email: email || "",
        website: website || "",
        companyLogo: logoFile,
        socialLinks: {
          facebook: socialFacebook || "",
          twitter: socialTwitter || "",
          linkedin: socialLinkedin || "",
          instagram: socialInstagram || "",
        },
        packageType: packageType || "Sponsored News Article",
        packagePrice: Number(packagePrice) || 8000,
        placement: placement || "homepage_sponsored",
        durationDays: durDays,
        publishStartDate: startDate,
        expiryDate: expDate,
        videoPackage: videoPackage || "None",
        videoCharge: Number(videoCharge) || 0,
        hasVideo: !!videoFile,
        videoUrl: videoFile,
        adminId: req.user._id,
        status: "published",
        paymentStatus: paymentStatus || "Paid",
        sponsoredLabel: sponsoredLabel || "Sponsored Content",
        articleSource: "sponsor_provided",
        title,
        subtitle: subtitle || "",
        description,
        shortDescription: description.replace(/<[^>]*>?/gm, "").substring(0, 200),
        category: category || "General",
        image: imageFile,
        language: language || "both",
        publishedAt: startDate,
      });

      await newArticle.save();
      res.status(201).json({ success: true, message: "Sponsored article created and published directly! 🎉", article: newArticle });
    } catch (error) {
      console.error("Admin create direct error:", error);
      res.status(500).json({ success: false, message: error.message || "Server error creating sponsored article" });
    }
  }
);

// PUT /api/sponsored/admin/assign/:id - Admin assigns Reporter and sets packages/placement
router.put("/admin/assign/:id", verifyToken, authorizeRoles("admin"), async (req, res) => {
  try {
    const { reporterId, packageType, packagePrice, placement, durationDays, videoPackage, videoCharge, paymentStatus } = req.body;
    const article = await SponsoredArticle.findById(req.params.id);
    if (!article) {
      return res.status(404).json({ success: false, message: "Sponsored request not found" });
    }

    if (reporterId) {
      article.reporterId = reporterId;
      article.status = "assigned_to_reporter";
    }
    if (packageType) article.packageType = packageType;
    if (packagePrice !== undefined) article.packagePrice = Number(packagePrice);
    if (placement) article.placement = placement;
    if (durationDays) article.durationDays = Number(durationDays);
    if (videoPackage) article.videoPackage = videoPackage;
    if (videoCharge !== undefined) article.videoCharge = Number(videoCharge);
    if (paymentStatus) article.paymentStatus = paymentStatus;

    await article.save();

    // Notify assigned Reporter
    if (reporterId) {
      try {
        await Notification.create({
          recipientId: reporterId,
          type: "submitted",
          text: `You have been assigned to cover a new sponsored story for ${article.companyName}.`,
          language: "ta",
        });
      } catch (nErr) {}
    }

    res.json({ success: true, message: "Reporter assigned and settings updated successfully! 🎯", article });
  } catch (error) {
    console.error("Admin assign error:", error);
    res.status(500).json({ success: false, message: "Server error assigning reporter" });
  }
});

// PUT /api/sponsored/admin/publish/:id - Admin final approval and publication
router.put("/admin/publish/:id", verifyToken, authorizeRoles("admin"), async (req, res) => {
  try {
    const { placement, publishStartDate, durationDays, sponsoredLabel, paymentStatus, title, description, category } = req.body;
    const article = await SponsoredArticle.findById(req.params.id);
    if (!article) {
      return res.status(404).json({ success: false, message: "Sponsored article not found" });
    }

    if (placement) article.placement = placement;
    if (sponsoredLabel) article.sponsoredLabel = sponsoredLabel;
    if (paymentStatus) article.paymentStatus = paymentStatus;
    if (title) article.title = title;
    if (description) article.description = description;
    if (category) article.category = category;

    const start = publishStartDate ? new Date(publishStartDate) : new Date();
    const dur = Number(durationDays) || article.durationDays || 30;
    const expiry = new Date(start.getTime() + dur * 24 * 60 * 60 * 1000);

    article.publishStartDate = start;
    article.expiryDate = expiry;
    article.durationDays = dur;
    article.status = "published";
    article.adminId = req.user._id;
    article.publishedAt = start;

    await article.save();

    res.json({ success: true, message: "Sponsored article approved and published live! 🌟", article });
  } catch (error) {
    console.error("Admin publish error:", error);
    res.status(500).json({ success: false, message: "Server error publishing article" });
  }
});

// PUT /api/sponsored/admin/packages - Admin updates package pricing
router.put("/admin/packages", verifyToken, authorizeRoles("admin"), async (req, res) => {
  try {
    const { packages } = req.body;
    if (!Array.isArray(packages)) {
      return res.status(400).json({ success: false, message: "Invalid packages array format" });
    }

    for (let pkg of packages) {
      if (!pkg.packageId) continue;
      await SponsoredPackage.findOneAndUpdate(
        { packageId: pkg.packageId },
        {
          nameEn: pkg.nameEn,
          nameTa: pkg.nameTa,
          price: Number(pkg.price || 0),
          featuresEn: pkg.featuresEn || [],
          featuresTa: pkg.featuresTa || [],
          badgeEn: pkg.badgeEn || "",
          badgeTa: pkg.badgeTa || "",
          isVideoPackage: !!pkg.isVideoPackage,
          isComboPackage: !!pkg.isComboPackage,
        },
        { upsert: true, returnDocument: 'after' }
      );
    }

    const updated = await SponsoredPackage.find().sort({ price: 1 });
    res.json({ success: true, message: "Package rates updated successfully! 💰", packages: updated });
  } catch (error) {
    console.error("Update packages error:", error);
    res.status(500).json({ success: false, message: error.message || "Server error updating packages" });
  }
});

// GET /api/sponsored/admin/analytics - Admin financial and article stats
router.get("/admin/analytics", verifyToken, authorizeRoles("admin"), async (req, res) => {
  try {
    const totalArticles = await SponsoredArticle.countDocuments();
    const requestsCount = await SponsoredArticle.countDocuments({ status: "request_submitted" });
    const pendingCount = await SponsoredArticle.countDocuments({ status: { $in: ["pending_editor_review", "pending_admin_approval"] } });
    const activeCount = await SponsoredArticle.countDocuments({ status: "published" });

    const now = new Date();
    const expiredCount = await SponsoredArticle.countDocuments({
      $or: [{ status: "expired" }, { expiryDate: { $lt: now } }],
    });

    // Calculate revenue from paid sponsored articles
    const paidArticles = await SponsoredArticle.find({ paymentStatus: "Paid" });
    let totalRevenue = 0;
    let packageRevenue = 0;
    let videoRevenue = 0;

    paidArticles.forEach(a => {
      const pPrice = a.packagePrice || 0;
      const vCharge = a.videoCharge || 0;
      packageRevenue += pPrice;
      videoRevenue += vCharge;
      totalRevenue += pPrice + vCharge;
    });

    res.json({
      success: true,
      analytics: {
        totalArticles,
        requestsCount,
        pendingCount,
        activeCount,
        expiredCount,
        totalRevenue,
        packageRevenue,
        videoRevenue,
      },
    });
  } catch (error) {
    console.error("Admin sponsored analytics error:", error);
    res.status(500).json({ success: false, message: "Server error retrieving analytics" });
  }
});

// DELETE /api/sponsored/admin/delete/:id - Admin deletes article
router.delete("/admin/delete/:id", verifyToken, authorizeRoles("admin"), async (req, res) => {
  try {
    const article = await SponsoredArticle.findByIdAndDelete(req.params.id);
    if (!article) {
      return res.status(404).json({ success: false, message: "Sponsored article not found" });
    }
    res.json({ success: true, message: "Sponsored article deleted successfully! 🗑️" });
  } catch (error) {
    console.error("Delete article error:", error);
    res.status(500).json({ success: false, message: "Server error deleting article" });
  }
});

// PUT /api/sponsored/admin/edit/:id - Admin edits/updates published article
router.put(
  "/admin/edit/:id",
  verifyToken,
  authorizeRoles("admin"),
  upload.fields([
    { name: "logo", maxCount: 1 },
    { name: "image", maxCount: 1 },
    { name: "video", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const {
        companyName,
        contactPerson,
        phone,
        email,
        website,
        title,
        subtitle,
        description,
        category,
        packageType,
        packagePrice,
        placement,
        durationDays,
        sponsoredLabel,
        paymentStatus,
        language,
        videoUrl,
      } = req.body;

      const article = await SponsoredArticle.findById(req.params.id);
      if (!article) {
        return res.status(404).json({ success: false, message: "Sponsored article not found" });
      }

      if (companyName) article.companyName = companyName;
      if (contactPerson) article.contactPerson = contactPerson;
      if (phone) article.phone = phone;
      if (email) article.email = email;
      if (website) article.website = website;
      if (title) article.title = title;
      if (subtitle) article.subtitle = subtitle;
      if (description) article.description = description;
      if (category) article.category = category;
      if (packageType) article.packageType = packageType;
      if (packagePrice !== undefined) article.packagePrice = Number(packagePrice);
      if (placement) article.placement = placement;
      if (durationDays) {
        article.durationDays = Number(durationDays);
        if (article.publishedAt) {
          article.expiryDate = new Date(article.publishedAt.getTime() + Number(durationDays) * 24 * 60 * 60 * 1000);
        }
      }
      if (sponsoredLabel) article.sponsoredLabel = sponsoredLabel;
      if (paymentStatus) article.paymentStatus = paymentStatus;
      if (language) article.language = language;

      if (req.files && req.files.logo) {
        article.companyLogo = `/uploads/${req.files.logo[0].filename}`;
      }
      if (req.files && req.files.image) {
        article.image = `/uploads/${req.files.image[0].filename}`;
      }
      if (req.files && req.files.video) {
        article.videoUrl = `/uploads/${req.files.video[0].filename}`;
      } else if (videoUrl !== undefined) {
        article.videoUrl = videoUrl;
      }

      await article.save();
      res.json({ success: true, message: "Sponsored article updated successfully! 💾", article });
    } catch (error) {
      console.error("Edit article error:", error);
      res.status(500).json({ success: false, message: "Server error updating article" });
    }
  }
);

// POST /api/sponsored/verify-payment - Verify payment for regular sponsored request
router.post("/verify-payment", verifyToken, async (req, res) => {
  try {
    const { requestId, razorpay_order_id, razorpay_payment_id, razorpay_signature, isMock } = req.body;
    if (!requestId) {
      return res.status(400).json({ success: false, message: "Request ID is required" });
    }

    const request = await SponsoredArticle.findById(requestId);
    if (!request) {
      return res.status(404).json({ success: false, message: "Request not found" });
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

    request.paymentStatus = "Paid";
    request.paymentId = razorpay_payment_id || "mock_payment_id";
    request.status = "request_submitted";
    await request.save();

    // Notify Admins
    try {
      const admins = await User.find({ role: "admin" });
      for (let admin of admins) {
        await Notification.create({
          recipientId: admin._id,
          type: "submitted",
          text: `Paid Sponsored Request (₹${(request.packagePrice + request.videoCharge).toLocaleString()}) received from ${request.companyName}.`,
          language: "ta",
        });
      }
    } catch (nErr) {}

    res.json({ success: true, message: "Payment verified successfully!", request });
  } catch (error) {
    console.error("Verify payment error:", error);
    res.status(500).json({ success: false, message: "Server error verifying payment" });
  }
});

// POST /api/sponsored/combo/request - Submit a Combo Package request
router.post(
  "/combo/request",
  verifyToken,
  upload.fields([
    { name: "logo", maxCount: 1 },
    { name: "image", maxCount: 5 },
    { name: "video", maxCount: 1 },
    { name: "documents", maxCount: 5 },
  ]),
  async (req, res) => {
    try {
      const {
        companyName,
        contactPerson,
        phone,
        email,
        website,
        packageName,
        packagePrice,
        optionType,
        eventDetails,
        description,
        preferredPublishDate,
        durationDays,
        language,
      } = req.body;

      if (!companyName || !contactPerson || !phone || !email || !packageName) {
        return res.status(400).json({ success: false, message: "Please fill in all required details." });
      }

      const logoFile = req.files && req.files.logo ? `/uploads/${req.files.logo[0].filename}` : "";
      const imageFiles = req.files && req.files.image ? req.files.image.map(f => `/uploads/${f.filename}`) : [];
      const videoFile = req.files && req.files.video ? `/uploads/${req.files.video[0].filename}` : (req.body.videoUrl || "");
      const docFiles = req.files && req.files.documents ? req.files.documents.map(f => `/uploads/${f.filename}`) : [];

      const price = Number(packagePrice) || 25000;

      // Define default inclusions
      let includedServices = [];
      if (packageName === "Starter") {
        includedServices = ["1 Sponsored Article", "Instagram Post", "Facebook Post", "Sidebar Banner (7 Days)"];
      } else if (packageName === "Business Growth") {
        includedServices = ["2 Sponsored Articles", "Homepage Banner (15 Days)", "Instagram Reel", "Facebook Promotion", "WhatsApp Broadcast"];
      } else if (packageName === "Premium Brand") {
        includedServices = ["4 Sponsored Articles", "Homepage Banner (30 Days)", "Press Release", "Instagram Reel", "Facebook Promotion", "YouTube Community Post", "WhatsApp Promotion"];
      }

      const newCombo = new ComboPackageRequest({
        userId: req.user._id,
        companyName,
        contactPerson,
        phone,
        email,
        website: website || "",
        logo: logoFile,
        images: imageFiles,
        videoUrl: req.body.videoUrl || "",
        video: videoFile,
        documents: docFiles,
        packageName,
        packagePrice: price,
        includedServices,
        optionType,
        eventDetails: eventDetails || description || "",
        description: description || "",
        preferredPublishDate: preferredPublishDate ? new Date(preferredPublishDate) : null,
        durationDays: Number(durationDays) || 30,
        language: language && ["ta", "en", "both"].includes(language) ? language : "both",
        paymentStatus: "Pending",
        status: "pending_review"
      });

      await newCombo.save();

      const keyId = process.env.RAZORPAY_KEY_ID;
      const keySecret = process.env.RAZORPAY_KEY_SECRET;

      if (keyId && keySecret && keyId !== "your_key_id" && keySecret !== "your_key_secret") {
        try {
          const instance = new Razorpay({ key_id: keyId, key_secret: keySecret });
          const options = {
            amount: Math.round(price * 100),
            currency: "INR",
            receipt: `combo_rcpt_${newCombo._id.toString().slice(-6)}_${Date.now()}`,
            notes: { comboId: newCombo._id.toString(), userId: req.user._id.toString() }
          };
          const order = await instance.orders.create(options);
          newCombo.orderId = order.id;
          await newCombo.save();

          return res.status(201).json({
            success: true,
            isMock: false,
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            key: keyId,
            requestId: newCombo._id,
            message: "Razorpay combo order created!"
          });
        } catch (rzpErr) {
          console.error("Razorpay combo order creation failed:", rzpErr.message);
        }
      }

      return res.status(201).json({
        success: true,
        isMock: true,
        orderId: `mock_combo_order_${Date.now()}`,
        amount: Math.round(price * 100),
        currency: "INR",
        key: "rzp_test_mockkey_newsghuru",
        requestId: newCombo._id,
        message: "Mock combo sandbox payment generated."
      });
    } catch (error) {
      console.error("Submit combo error:", error);
      res.status(500).json({ success: false, message: error.message || "Server error submitting combo request" });
    }
  }
);

// POST /api/sponsored/combo/verify-payment - Verify payment and map campaign services
router.post("/combo/verify-payment", verifyToken, async (req, res) => {
  try {
    const { requestId, razorpay_order_id, razorpay_payment_id, razorpay_signature, isMock } = req.body;
    if (!requestId) {
      return res.status(400).json({ success: false, message: "Request ID is required" });
    }

    const combo = await ComboPackageRequest.findById(requestId);
    if (!combo) {
      return res.status(404).json({ success: false, message: "Combo Campaign not found" });
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

    combo.paymentStatus = "Paid";
    combo.paymentId = razorpay_payment_id || "mock_combo_payment_id";
    combo.status = "active";

    // AUTOMATIC SERVICE MAPPING
    // 1. Spawning sub-articles
    let articleCount = 1;
    if (combo.packageName === "Business Growth") articleCount = 2;
    if (combo.packageName === "Premium Brand") articleCount = 4;

    const spawnedArticleIds = [];
    // Placement mapping per combo package (matching invoice spec)
    const comboPlacementConfig = {
      "Starter":        { placement: "sidebar_widget",    durationDays: 7 },
      "Business Growth": { placement: "homepage_sponsored", durationDays: 15 },
      "Premium Brand":  { placement: "homepage_sponsored", durationDays: 30 },
    };
    const placementConfig = comboPlacementConfig[combo.packageName] || { placement: "homepage_sponsored", durationDays: 7 };

    for (let i = 0; i < articleCount; i++) {
      const subArticle = new SponsoredArticle({
        userId: combo.userId,
        comboRequestId: combo._id,
        companyName: combo.companyName,
        contactPerson: combo.contactPerson,
        phone: combo.phone,
        email: combo.email,
        website: combo.website,
        companyLogo: combo.logo,
        packageType: `Combo Sub-Article ${i + 1} (${combo.packageName})`,
        packagePrice: 0, // already paid via combo package
        paymentStatus: "Paid",
        status: "request_submitted",
        placement: placementConfig.placement,
        durationDays: placementConfig.durationDays,
        language: combo.language || "both",
        articleSource: combo.optionType === "Option 1" ? "sponsor_provided" : "reporter_created",
        title: combo.optionType === "Option 1" && i === 0 ? combo.eventDetails.substring(0, 80) : `${combo.companyName} - Coverage Part ${i + 1}`,
        description: combo.optionType === "Option 1" && i === 0 ? combo.description || combo.eventDetails : "",
        eventDetails: combo.eventDetails,
        image: combo.images && combo.images.length > 0 ? combo.images[0] : "",
        documents: combo.documents || []
      });
      await subArticle.save();
      spawnedArticleIds.push(subArticle._id);
    }
    combo.sponsoredArticles = spawnedArticleIds;

    // 2. Setting up social checklist tasks
    const tasks = [];
    if (combo.packageName === "Starter") {
      tasks.push({ taskName: "Instagram Post" }, { taskName: "Facebook Post" }, { taskName: "Sidebar Banner (7 Days)" });
    } else if (combo.packageName === "Business Growth") {
      tasks.push({ taskName: "Instagram Reel" }, { taskName: "Facebook Promotion" }, { taskName: "WhatsApp Broadcast" }, { taskName: "Homepage Banner (15 Days)" });
    } else if (combo.packageName === "Premium Brand") {
      tasks.push({ taskName: "Instagram Reel" }, { taskName: "Facebook Promotion" }, { taskName: "YouTube Community Post" }, { taskName: "WhatsApp Promotion" }, { taskName: "Press Release" }, { taskName: "Homepage Banner (30 Days)" });
    }
    combo.socialChecklist = tasks;

    await combo.save();

    // Notify Admins
    try {
      const admins = await User.find({ role: "admin" });
      for (let admin of admins) {
        await Notification.create({
          recipientId: admin._id,
          type: "submitted",
          text: `Paid Combo Package ${combo.packageName} (₹${combo.packagePrice.toLocaleString()}) active from ${combo.companyName}.`,
          language: "ta",
        });
      }
    } catch (nErr) {}

    res.json({ success: true, message: "Combo Campaign activated & services mapped successfully!", combo });
  } catch (error) {
    console.error("Verify combo payment error:", error);
    res.status(500).json({ success: false, message: "Server error activating combo" });
  }
});

// GET /api/sponsored/admin/combos - Admin retrieve all combo campaigns
router.get("/admin/combos", verifyToken, authorizeRoles("admin"), async (req, res) => {
  try {
    const list = await ComboPackageRequest.find()
      .populate("userId", "name email")
      .populate("assignedReporterId", "name email")
      .populate("sponsoredArticles")
      .sort({ createdAt: -1 });

    res.json({ success: true, combos: list });
  } catch (error) {
    console.error("Fetch admin combos error:", error);
    res.status(500).json({ success: false, message: "Server error fetching combo campaigns" });
  }
});

// PUT /api/sponsored/admin/combos/update/:id - Admin update checklists/placements
router.put("/admin/combos/update/:id", verifyToken, authorizeRoles("admin"), async (req, res) => {
  try {
    const combo = await ComboPackageRequest.findById(req.params.id);
    if (!combo) {
      return res.status(404).json({ success: false, message: "Combo Campaign not found" });
    }

    const { status, socialChecklist, assignedReporterId } = req.body;

    if (status) combo.status = status;
    if (assignedReporterId) combo.assignedReporterId = assignedReporterId;
    if (socialChecklist) combo.socialChecklist = socialChecklist;

    await combo.save();
    res.json({ success: true, message: "Combo campaign configurations saved!", combo });
  } catch (error) {
    console.error("Update combo error:", error);
    res.status(500).json({ success: false, message: "Server error updating combo campaign" });
  }
});

// GET /api/sponsored/admin/combos/analytics - Get dedicated combo metrics
router.get("/admin/combos/analytics", verifyToken, authorizeRoles("admin"), async (req, res) => {
  try {
    const total = await ComboPackageRequest.countDocuments();
    const paidList = await ComboPackageRequest.find({ paymentStatus: "Paid" });

    let totalRevenue = 0;
    let starterCount = 0;
    let growthCount = 0;
    let premiumCount = 0;
    let activeCount = 0;
    let completedCount = 0;
    let expiredCount = 0;

    paidList.forEach(c => {
      totalRevenue += c.packagePrice || 0;
      if (c.packageName === "Starter") starterCount++;
      if (c.packageName === "Business Growth") growthCount++;
      if (c.packageName === "Premium Brand") premiumCount++;

      if (c.status === "active") activeCount++;
      if (c.status === "completed") completedCount++;
      if (c.status === "expired") expiredCount++;
    });

    res.json({
      success: true,
      analytics: {
        total,
        totalRevenue,
        starterCount,
        growthCount,
        premiumCount,
        activeCount,
        completedCount,
        expiredCount
      }
    });
  } catch (error) {
    console.error("Combo analytics error:", error);
    res.status(500).json({ success: false, message: "Server error fetching combo analytics" });
  }
});

// PUT /api/sponsored/admin/reject/:id - Admin rejects regular sponsored request (Wallet Refund)
router.put("/admin/reject/:id", verifyToken, authorizeRoles("admin"), async (req, res) => {
  try {
    const { rejectionReason } = req.body;
    const request = await SponsoredArticle.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, message: "Sponsored request not found" });
    }

    let refunded = false;
    const refundAmount = (request.packagePrice || 0) + (request.videoCharge || 0);

    if (request.paymentStatus === "Paid" && request.userId) {
      const user = await User.findById(request.userId);
      if (user) {
        user.walletBalance = (user.walletBalance || 0) + refundAmount;
        await user.save();
        refunded = true;
      }
    }

    request.status = "rejected";
    request.paymentStatus = "Refunded";
    request.rejectionReason = rejectionReason || "Rejected by Admin.";
    await request.save();

    // Create User Notification
    if (request.userId) {
      try {
        await Notification.create({
          recipientId: request.userId,
          type: "rejected",
          text: `Your Sponsored request for "${request.companyName}" was rejected. ${refunded ? `₹${refundAmount.toLocaleString()} refunded to your wallet.` : ""}`,
          language: "ta"
        });
      } catch (nErr) {}
    }

    res.json({
      success: true,
      message: refunded
        ? `Request rejected. ₹${refundAmount.toLocaleString()} successfully refunded to the sponsor's wallet!`
        : `Request rejected successfully.`,
      request
    });
  } catch (error) {
    console.error("Reject request error:", error);
    res.status(500).json({ success: false, message: "Server error rejecting request" });
  }
});

// PUT /api/sponsored/admin/combos/reject/:id - Admin rejects Combo package request (Wallet Refund)
router.put("/admin/combos/reject/:id", verifyToken, authorizeRoles("admin"), async (req, res) => {
  try {
    const { rejectionReason } = req.body;
    const combo = await ComboPackageRequest.findById(req.params.id);
    if (!combo) {
      return res.status(404).json({ success: false, message: "Combo request not found" });
    }

    let refunded = false;
    const refundAmount = combo.packagePrice || 0;

    if (combo.paymentStatus === "Paid" && combo.userId) {
      const user = await User.findById(combo.userId);
      if (user) {
        user.walletBalance = (user.walletBalance || 0) + refundAmount;
        await user.save();
        refunded = true;
      }
    }

    combo.status = "rejected";
    combo.paymentStatus = "Refunded";
    combo.rejectionReason = rejectionReason || "Rejected by Admin.";
    await combo.save();

    // Create User Notification
    if (combo.userId) {
      try {
        await Notification.create({
          recipientId: combo.userId,
          type: "rejected",
          text: `Your Combo Campaign request "${combo.packageName}" was rejected. ${refunded ? `₹${refundAmount.toLocaleString()} refunded to your wallet.` : ""}`,
          language: "ta"
        });
      } catch (nErr) {}
    }

    res.json({
      success: true,
      message: refunded
        ? `Combo Campaign rejected. ₹${refundAmount.toLocaleString()} successfully refunded to the sponsor's wallet!`
        : `Combo campaign rejected successfully.`,
      combo
    });
  } catch (error) {
    console.error("Reject combo error:", error);
    res.status(500).json({ success: false, message: "Server error rejecting combo campaign" });
  }
});

module.exports = router;
module.exports.ensurePackages = ensurePackages;

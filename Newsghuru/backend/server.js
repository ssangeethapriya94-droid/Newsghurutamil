const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const cors = require("cors");
const path = require("path");

const connectDB = require("./db");
const newsRoutes = require("./routes/newsRoutes");
const infoRoutes = require("./routes/infoRoutes");
const Admin = require("./models/Admin");
const authRoutes = require("./routes/authRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const mediaRoutes = require("./routes/mediaRoutes");
const contactRoutes = require("./routes/contactRoutes");
const Category = require("./models/Category");
const adRoutes = require("./routes/adRoutes");
const AdSettings = require("./models/AdSettings");
const SubscriptionPlan = require("./models/SubscriptionPlan");
const subscriptionRoutes = require("./routes/subscriptionRoutes");

// Connect MongoDB
connectDB().then(() => {
  seedAdmin();
  seedCategories();
  seedAdSettings();
  seedSubscriptionPlans();
});

const seedAdmin = async () => {
  try {
    const adminCount = await Admin.countDocuments();
    if (adminCount === 0) {
      await Admin.create({
        username: "NewsGhuru Admin",
        email: process.env.ADMIN_EMAIL || "newsghuruadmin@gmail.com",
        password: process.env.ADMIN_PASSWORD || "adminnewsghuru123"
      });
      console.log("✅ Default Admin account seeded in MongoDB");
    }
  } catch (error) {
    console.error("❌ Seeding admin failed:", error.message);
  }
};

const seedCategories = async () => {
  try {
    const categoryCount = await Category.countDocuments();
    if (categoryCount === 0) {
      const defaultCategories = [
        { name: "Politics", slug: "politics" },
        { name: "Sports", slug: "sports" },
        { name: "Entertainment", slug: "entertainment" },
        { name: "Technology", slug: "technology" },
        { name: "Education", slug: "education" },
        { name: "India", slug: "india" },
        { name: "World", slug: "world" },
        { name: "Cinema", slug: "cinema" },
        { name: "Tamil", slug: "tamil" },
        { name: "Breaking", slug: "breaking" }
      ];
      await Category.insertMany(defaultCategories);
      console.log("✅ Default categories seeded in MongoDB");
    }
  } catch (error) {
    console.error("❌ Seeding categories failed:", error.message);
  }
};

const seedAdSettings = async () => {
  try {
    const settingsCount = await AdSettings.countDocuments();
    if (settingsCount === 0) {
      await AdSettings.create({
        globalRotationInterval: 10,
        popupEnabled: true,
        popupDelay: 3,
        popupAutoClose: 10
      });
      console.log("✅ Default Advertisement settings seeded in MongoDB");
    }
  } catch (error) {
    console.error("❌ Seeding advertisement settings failed:", error.message);
  }
};

const seedSubscriptionPlans = async () => {
  try {
    // Drop all subscription plans to force reseeding of the updated clean benefits (no magazines/newspapers)
    await SubscriptionPlan.deleteMany({});
    
    const defaultPlans = [
      {
        name: "1 Month",
        price: 129,
        duration: "1 Month",
        durationMonths: 1,
        benefits: [
          "பிரீமியம் கட்டுரைகள்",
          "விளம்பரமற்ற வாசிப்பு"
        ],
        isRecommended: false
      },
      {
        name: "6 Months",
        price: 749,
        duration: "6 Months",
        durationMonths: 6,
        benefits: [
          "பிரீமியம் கட்டுரைகள்",
          "விளம்பரமற்ற வாசிப்பு"
        ],
        isRecommended: false
      },
      {
        name: "1 Year",
        price: 999,
        duration: "1 Year",
        durationMonths: 12,
        benefits: [
          "பிரீமியம் கட்டுரைகள்",
          "விளம்பரமற்ற வாசிப்பு"
        ],
        isRecommended: true
      },
      {
        name: "LIFETIME",
        price: 9999,
        duration: "LIFETIME",
        durationMonths: 999,
        benefits: [
          "பிரீமியம் கட்டுரைகள்",
          "விளம்பரமற்ற வாசிப்பு"
        ],
        isRecommended: false
      }
    ];
    await SubscriptionPlan.insertMany(defaultPlans);
    console.log("✅ Default Subscription Plans seeded in MongoDB (no magazines/newspapers)");
  } catch (error) {
    console.error("❌ Seeding subscription plans failed:", error.message);
  }
};

const app = express();

// Trust proxy so req.protocol accurately reports https behind a load balancer (like Render)
app.set("trust proxy", 1);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static Uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/news", newsRoutes);
app.use("/api/information", infoRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/media", mediaRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/ads", adRoutes);
app.use("/api/subscription", subscriptionRoutes);

// Auth Routes
app.use("/api", authRoutes);

// GET ADMIN PROFILE
app.get("/api/admin/profile", async (req, res) => {
  try {
    const admin = await Admin.findOne();
    if (!admin) {
      return res.status(404).json({ success: false, message: "Admin not found" });
    }
    res.json({
      success: true,
      username: admin.username,
      email: admin.email,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// UPDATE ADMIN PROFILE
app.put("/api/admin/profile", async (req, res) => {
  try {
    const { username, email } = req.body;
    if (!username || !email) {
      return res.status(400).json({ success: false, message: "Username and email are required" });
    }

    const admin = await Admin.findOne();
    if (!admin) {
      return res.status(404).json({ success: false, message: "Admin not found" });
    }

    admin.username = username;
    admin.email = email;
    await admin.save();

    res.json({
      success: true,
      message: "Profile updated successfully",
      username: admin.username,
      email: admin.email,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// CHANGE ADMIN PASSWORD
app.put("/api/admin/change-password", async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: "Current password and new password are required" });
    }

    const admin = await Admin.findOne();
    if (!admin) {
      return res.status(404).json({ success: false, message: "Admin not found" });
    }

    if (admin.password !== currentPassword) {
      return res.status(400).json({ success: false, message: "Incorrect current password" });
    }

    admin.password = newPassword;
    await admin.save();

    res.json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Health Check
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "News Ghuru API Running 🚀",
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Start Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
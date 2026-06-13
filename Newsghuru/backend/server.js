const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
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

dotenv.config();

// Connect MongoDB
connectDB().then(() => {
  seedAdmin();
  seedCategories();
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
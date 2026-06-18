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
const staticPageRoutes = require("./routes/staticPageRoutes");

// Connect MongoDB
connectDB().then(() => {
  seedAdmin();
  seedCategories();
  seedAdSettings();
  seedSubscriptionPlans();
  seedStaticPages();
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

const seedStaticPages = async () => {
  try {
    const StaticPage = require("./models/StaticPage");
    
    const defaultPages = [
      {
        title: "யார் நாம்? (About Us)",
        slug: "about",
        content: `<h2><strong>யார் நாம்? (About Us)</strong></h2>
<p>நியூஸ் குரு (NewsGhuru) என்பது உடனுக்குடன் நம்பகமான செய்திகளை தமிழ் மொழியில் வழங்கும் ஒரு முன்னணி டிஜிட்டல் செய்தித் தளமாகும். நேர்மை, வேகம், மற்றும் துல்லியம் ஆகிய கொள்கைகளின் அடிப்படையில் நாங்கள் செயல்படுகிறோம்.</p>
<h3><strong>எங்கள் நோக்கம்</strong></h3>
<p>தமிழ் பேசும் உலகளாவிய வாசகர்களுக்கு அரசியல், விளையாட்டு, பொழுதுபோக்கு, வணிகம், கல்வி மற்றும் தொழில்நுட்பம் சார்ந்த செய்திகளை உடனுக்குடன் வழங்குவதே எங்களது முதன்மையான நோக்கமாகும். வாசகர்களின் தேவையை உணர்ந்து உடனுக்குடன் செய்திகளை வழங்குவதே எங்கள் தனித்தன்மையாகும்.</p>`
      },
      {
        title: "தனியுரிமைக் கொள்கை (Privacy Policy)",
        slug: "privacy",
        content: `<h2><strong>1. அறிமுகம்</strong></h2>
<p>நியூஸ் குரு (News Ghuru) உங்கள் தனியுரிமையை மதிக்கிறது மற்றும் உங்கள் தனிப்பட்ட தகவல்களைப் பாதுகாப்பதில் உறுதியாக உள்ளது. இந்தத் தனியுரிமைக் கொள்கை, எங்களது சேவைகளைப் பயன்படுத்தும் போது உங்களிடமிருந்து நாங்கள் சேகரிக்கும் தகவல்களை எவ்வாறு கையாளுகிறோம் என்பதை விளக்குகிறது.</p>
<h2><strong>2. நாங்கள் சேகரிக்கும் தகவல்கள்</strong></h2>
<p>எங்கள் வலைத்தளத்தை நீங்கள் பயன்படுத்தும்போது, சந்தா செலுத்தும் போது அல்லது தொடர்பு கொள்ளும் போது நீங்கள் வழங்கும் பெயர் மற்றும் மின்னஞ்சல் முகவரி, மற்றும் குக்கீகள் மூலம் பகுப்பாய்வு தரவுகளை சேகரிக்கலாம்.</p>
<h2><strong>3. தரவுப் பாதுகாப்பு</strong></h2>
<p>உங்கள் தனிப்பட்ட தகவல்கள் எந்தவொரு மூன்றாம் தரப்பினருக்கும் விற்கப்படவோ அல்லது பகிரப்படவோ மாட்டாது. உங்கள் தகவல்களின் பாதுகாப்பை உறுதிசெய்ய நாங்கள் தகுந்த பாதுகாப்பு நடைமுறைகளைப் பின்பற்றுகிறோம்.</p>`
      },
      {
        title: "விதிமுறைகள் மற்றும் நிபந்தனைகள் (Terms & Conditions)",
        slug: "terms",
        content: `<h2><strong>1. விதிமுறைகளை ஒப்புக்கொள்ளுதல்</strong></h2>
<p>நியூஸ் குரு (News Ghuru) வலைத்தளத்தை அணுகுவதன் அல்லது பயன்படுத்துவதன் மூலம், இந்த விதிமுறைகள் மற்றும் நிபந்தனைகளுக்குக் கட்டுப்பட ஒப்புக்கொள்கிறீர்கள். இந்த விதிமுறைகளை நீங்கள் ஏற்கவில்லை எனில், எங்கள் வலைத்தளத்தைப் பயன்படுத்த வேண்டாம் என கேட்டுக்கொள்ளப்படுகிறீர்கள்.</p>
<h2><strong>2. அறிவுசார் சொத்துரிமை</strong></h2>
<p>எங்கள் வலைத்தளத்தில் உள்ள கட்டுரைகள், செய்திகள், படங்கள், லோகோக்கள் மற்றும் பிற உள்ளடக்கங்கள் அனைத்தும் நியூஸ் குருவின் சொத்தாகும். எங்கள் முன் அனுமதியின்றி இவற்றை நகலெடுக்கவோ, வெளியிடவோ அல்லது விநியோகிக்கவோ கூடாது.</p>`
      },
      {
        title: "பொறுப்புத் துறப்பு (Disclaimer)",
        slug: "disclaimer",
        content: `<h2><strong>பொறுப்புத் துறப்பு (Disclaimer)</strong></h2>
<p>இங்குள்ள தகவல்கள் அனைத்தும் பொதுவான விழிப்புணர்வு மற்றும் தகவல் நோக்கங்களுக்காக மட்டுமே வழங்கப்படுகின்றன. நியூஸ் குரு (NewsGhuru) தளம் துல்லியமான மற்றும் நம்பகமான தகவல்களை வழங்க அனைத்து முயற்சிகளையும் மேற்கொள்கிறது, இருப்பினும் தகவல்களின் முழுமை, நம்பகத்தன்மை அல்லது துல்லியம் குறித்து நாங்கள் எந்தவிதமான உத்தரவாதமும் அளிக்கவில்லை.</p>
<h3><strong>1. செய்திகளின் துல்லியம்</strong></h3>
<p>நியூஸ் குரு தளம் பல்வேறு செய்திக் குறிப்புகள், செய்தியாளர்கள் மற்றும் முகமைகளின் அடிப்படையில் செய்திகளை வெளியிடுகிறது. இச்செய்திகளின் உண்மைத்தன்மையை சரிபார்க்க நாங்கள் முழு முயற்சி எடுக்கிறோம். எனினும், ஏதேனும் பிழைகள் அல்லது விடுபடல்களுக்கு இந்த நிர்வாகம் பொறுப்பேற்காது.</p>`
      },
      {
        title: "தொடர்பு கொள்ள (Contact Us)",
        slug: "contact",
        content: `<h2><strong>தொடர்பு விவரங்கள் (Contact Details)</strong></h2>
<p>நியூஸ் குரு தளம் தொடர்பான செய்திகள், விளம்பரங்கள் அல்லது கூடுதல் கேள்விகளுக்கு எங்களைத் தொடர்பு கொள்ள விரும்பினால், கீழே உள்ள தொடர்பு படிவத்தைப் பயன்படுத்தவும் அல்லது மின்னஞ்சல் மூலம் எங்களைத் தொடர்பு கொள்ளவும்.</p>
<p>மின்னஞ்சல்: <strong>info@newsghuru.in</strong></p>
<p>முகவரி: சென்னை, தமிழ்நாடு, இந்தியா</p>`
      },
      {
        title: "எங்களுடன் விளம்பரம் செய்யுங்கள் (Advertise With Us)",
        slug: "advertise",
        content: `<h2><strong>வணிக விளம்பரங்கள் (Business Advertisements)</strong></h2>
<p>நியூஸ் குரு தளம் தினசரி லட்சக்கணக்கான தமிழ் வாசகர்களைக் கொண்டுள்ளது. எங்கள் தளத்தில் விளம்பரம் செய்வதன் மூலம் உங்கள் வணிகத்தின் எல்லைகளை விரிவாக்கலாம்.</p>
<p>விளம்பர வாய்ப்புகள், கட்டணங்கள் மற்றும் விவரங்களைப் பெற கீழே உள்ள விண்ணப்பப் படிவத்தை சமர்ப்பிக்கவும். எங்கள் விளம்பரப் பிரிவு உங்களை விரைவில் தொடர்பு கொள்ளும்.</p>`
      }
    ];

    for (const page of defaultPages) {
      const exists = await StaticPage.findOne({ slug: page.slug });
      if (!exists) {
        await StaticPage.create({
          title: page.title,
          slug: page.slug,
          content: page.content,
          lastUpdated: new Date()
        });
        console.log(`✅ Default Static Page seeded: ${page.title}`);
      }
    }
  } catch (error) {
    console.error("❌ Seeding static pages failed:", error.message);
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
app.use("/api", staticPageRoutes);

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
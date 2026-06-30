const dns = require("dns");
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder("ipv4first");
}

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
const videoRoutes = require("./routes/videoRoutes");
const shortsRoutes = require("./routes/shortsRoutes");
const photoStoryRoutes = require("./routes/photoStoryRoutes");
const anmigamRoutes = require("./routes/anmigamRoutes");
const homepageConfigRoutes = require("./routes/homepageConfigRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const emailScheduleRoutes = require("./routes/emailScheduleRoutes");
const { startEmailScheduler } = require("./utils/scheduler");
const { runSync } = require("./utils/youtubeSync");
const { ensurePackages } = require("./routes/sponsoredArticleRoutes");

// Connect MongoDB
connectDB().then(async () => {
  await seedAdmin();
  await seedCategories();
  await seedAdSettings();
  await seedSubscriptionPlans();
  await seedTransactions();
  await seedStaticPages();
  await seedVideos();
  await seedShorts();
  await seedPhotoStories();
  await seedHomepageConfig();
  await ensurePackages();
  startEmailScheduler();
  
  // YouTube Sync initialization
  console.log("⏰ Initializing YouTube Video and Shorts Sync...");
  runSync();
  setInterval(runSync, 30 * 60 * 1000); // Sync every 30 minutes
}).catch((err) => {
  console.warn("⚠️ Database connection failed. Seeding default data was skipped.");
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
    const planCount = await SubscriptionPlan.countDocuments();
    if (planCount > 0) {
      return;
    }
    
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
        isRecommended: false,
        language: "ta"
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
        isRecommended: false,
        language: "ta"
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
        isRecommended: true,
        language: "ta"
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
        isRecommended: false,
        language: "ta"
      },
      // English plans
      {
        name: "1 Month",
        price: 129,
        duration: "1 Month",
        durationMonths: 1,
        benefits: [
          "Premium Articles",
          "Ad-free Reading"
        ],
        isRecommended: false,
        language: "en"
      },
      {
        name: "6 Months",
        price: 749,
        duration: "6 Months",
        durationMonths: 6,
        benefits: [
          "Premium Articles",
          "Ad-free Reading"
        ],
        isRecommended: false,
        language: "en"
      },
      {
        name: "1 Year",
        price: 999,
        duration: "1 Year",
        durationMonths: 12,
        benefits: [
          "Premium Articles",
          "Ad-free Reading"
        ],
        isRecommended: true,
        language: "en"
      },
      {
        name: "LIFETIME",
        price: 9999,
        duration: "LIFETIME",
        durationMonths: 999,
        benefits: [
          "Lifetime Articles",
          "Ad-free Reading"
        ],
        isRecommended: false,
        language: "en"
      }
    ];
    await SubscriptionPlan.insertMany(defaultPlans);
    console.log("✅ Default Subscription Plans seeded in MongoDB for both Tamil and English");
  } catch (error) {
    console.error("❌ Seeding subscription plans failed:", error.message);
  }
};

const seedTransactions = async () => {
  try {
    const Transaction = require("./models/Transaction");
    const User = require("./models/User");
    const SubscriptionPlan = require("./models/SubscriptionPlan");

    // Skip seeding if transactions already exist — don't wipe real reader data
    const existingTxCount = await Transaction.countDocuments();
    if (existingTxCount > 0) {
      return;
    }

    console.log("🌱 Seeding mock transactions for revenue dashboard...");

    // Get some plans
    const plans = await SubscriptionPlan.find();
    if (plans.length === 0) {
      console.log("No subscription plans found. Skipping transaction seeding.");
      return;
    }

    // Create 6 reader users for mock transactions only if none exist with these emails
    const dummyUsersData = [
      { name: "கார்த்திக் ராஜ்", email: "karthik@gmail.com", password: "password123", role: "reader", language: "ta" },
      { name: "பிரியா மோகன்", email: "priya@gmail.com", password: "password123", role: "reader", language: "ta" },
      { name: "சரவணன் குமார்", email: "saravanan@gmail.com", password: "password123", role: "reader", language: "ta" },
      { name: "John Doe", email: "john@gmail.com", password: "password123", role: "reader", language: "en" },
      { name: "Sarah Smith", email: "sarah@gmail.com", password: "password123", role: "reader", language: "en" },
      { name: "Alex Jones", email: "alex@gmail.com", password: "password123", role: "reader", language: "en" }
    ];

    const users = [];
    for (const userData of dummyUsersData) {
      let user = await User.findOne({ email: userData.email });
      if (!user) {
        user = await User.create(userData);
      }
      users.push(user);
    }
    console.log("✅ Seeded 6 multilingual reader users for subscription transactions");

    // Make some of these users premium in user collection to make it sync
    const premiumUsers = [users[0], users[1], users[3], users[4]];
    for (const u of premiumUsers) {
      if (!u.isPremium) {
        const userLang = u.language || "ta";
        const langPlans = plans.filter(p => (p.language || "ta") === userLang);
        const chosenPlan = langPlans.length > 0 ? langPlans[Math.floor(Math.random() * langPlans.length)] : plans[Math.floor(Math.random() * plans.length)];
        
        u.isPremium = true;
        u.premiumPlan = chosenPlan._id;
        const validUntil = new Date();
        validUntil.setMonth(validUntil.getMonth() + 6);
        u.premiumValidUntil = validUntil;
        await u.save();
      }
    }

    // Now create mock transactions over the last 6 months
    const mockTransactions = [];
    const now = new Date();

    // Create exactly 8 successful mock transactions (some Tamil, some English)
    for (let i = 0; i < 8; i++) {
      const randomUser = users[Math.floor(Math.random() * users.length)];
      const userLang = randomUser.language || "ta";
      const langPlans = plans.filter(p => (p.language || "ta") === userLang);
      const randomPlan = langPlans.length > 0 ? langPlans[Math.floor(Math.random() * langPlans.length)] : plans[Math.floor(Math.random() * plans.length)];
      
      // Random date in the last 6 months
      const txDate = new Date();
      txDate.setMonth(now.getMonth() - Math.floor(Math.random() * 6));
      txDate.setDate(Math.floor(Math.random() * 28) + 1);

      mockTransactions.push({
        userId: randomUser._id,
        planId: randomPlan._id,
        amount: randomPlan.price,
        paymentId: `pay_mock_${Math.random().toString(36).substr(2, 9)}`,
        orderId: `order_mock_${Math.random().toString(36).substr(2, 9)}`,
        status: "Success",
        createdAt: txDate,
        updatedAt: txDate
      });
    }

    await Transaction.insertMany(mockTransactions);
    console.log(`✅ Seeded ${mockTransactions.length} transaction records`);
  } catch (error) {
    console.error("❌ Seeding transactions failed:", error.message);
  }
};

const seedStaticPages = async () => {
  try {
    const StaticPage = require("./models/StaticPage");
    
    // Tag any existing pages without language as Tamil
    await StaticPage.updateMany(
      { language: { $exists: false } },
      { $set: { language: "ta" } }
    );

    const defaultPages = [
      // Tamil pages
      {
        title: "யார் நாம்?",
        slug: "about",
        language: "ta",
        content: `<h2><strong>யார் நாம்?</strong></h2>
<p>நியூஸ் குரு (NewsGhuru) என்பது உடனுக்குடன் நம்பகமான செய்திகளை தமிழ் மொழியில் வழங்கும் ஒரு முன்னணி டிஜிட்டல் செய்தித் தளமாகும். நேர்மை, வேகம், மற்றும் துல்லியம் ஆகிய கொள்கைகளின் அடிப்படையில் நாங்கள் செயல்படுகிறோம்.</p>
<h3><strong>எங்கள் நோக்கம்</strong></h3>
<p>தமிழ் பேசும் உலகளாவிய வாசகர்களுக்கு அரசியல், விளையாட்டு, பொழுதுபோக்கு, வணிகம், கல்வி மற்றும் தொழில்நுட்பம் சார்ந்த செய்திகளை உடனுக்குடன் வழங்குவதே எங்களது முதன்மையான நோக்கமாகும்.</p>`
      },
      {
        title: "தனியுரிமைக் கொள்கை",
        slug: "privacy",
        language: "ta",
        content: `<h2><strong>1. அறிமுகம்</strong></h2>
<p>நியூஸ் குரு உங்கள் தனியுரிமையை மதிக்கிறது மற்றும் உங்கள் தனிப்பட்ட தகவல்களைப் பாதுகாப்பதில் உறுதியாக உள்ளது. இந்தத் தனியுரிமைக் கொள்கை, எங்களது சேவைகளைப் பயன்படுத்தும் போது உங்களிடமிருந்து நாங்கள் சேகரிக்கும் தகவல்களை எவ்வாறு கையாளுகிறோம் என்பதை விளக்குகிறது.</p>
<h2><strong>2. நாங்கள் சேகரிக்கும் தகவல்கள்</strong></h2>
<p>எங்கள் வலைத்தளத்தை நீங்கள் பயன்படுத்தும்போது, சந்தா செலுத்தும் போது அல்லது தொடர்பு கொள்ளும் போது நீங்கள் வழங்கும் பெயர் மற்றும் மின்னஞ்சல் முகவரி, மற்றும் குக்கீகள் மூலம் பகுப்பாய்வு தரவுகளை சேகரிக்கலாம்.</p>
<h2><strong>3. தரவுப் பாதுகாப்பு</strong></h2>
<p>உங்கள் தனிப்பட்ட தகவல்கள் எந்தவொரு மூன்றாம் தரப்பினருக்கும் விற்கப்படவோ அல்லது பகிரப்படவோ மாட்டாது. உங்கள் தகவல்களின் பாதுகாப்பை உறுதிசெய்ய நாங்கள் தகுந்த பாதுகாப்பு நடைமுறைகளைப் பின்பற்றுகிறோம்.</p>`
      },
      {
        title: "விதிமுறைகள் மற்றும் நிபந்தனைகள்",
        slug: "terms",
        language: "ta",
        content: `<h2><strong>1. விதிமுறைகளை ஒப்புக்கொள்ளுதல்</strong></h2>
<p>நியூஸ் குரு வலைத்தளத்தை அணுகுவதன் அல்லது பயன்படுத்துவதன் மூலம், இந்த விதிமுறைகள் மற்றும் நிபந்தனைகளுக்குக் கட்டுப்பட ஒப்புக்கொள்கிறீர்கள்.</p>
<h2><strong>2. அறிவுசார் சொத்துரிமை</strong></h2>
<p>எங்கள் வலைத்தளத்தில் உள்ள கட்டுரைகள், செய்திகள், படங்கள், லோகோக்கள் மற்றும் பிற உள்ளடக்கங்கள் அனைத்தும் நியூஸ் குருவின் சொத்தாகும்.</p>`
      },
      {
        title: "மறுப்புரை",
        slug: "disclaimer",
        language: "ta",
        content: `<h2><strong>மறுப்புரை</strong></h2>
<p>இங்குள்ள தகவல்கள் அனைத்தும் பொதுவான விழிப்புணர்வு மற்றும் தகவல் நோக்கங்களுக்காக மட்டுமே வழங்கப்படுகின்றன.</p>
<h3><strong>1. செய்திகளின் துல்லியம்</strong></h3>
<p>நியூஸ் குரு தளம் பல்வேறு செய்திக் குறிப்புகள், செய்தியாளர்கள் மற்றும் முகமைகளின் அடிப்படையில் செய்திகளை வெளியிடுகிறது.</p>`
      },
      {
        title: "தொடர்பு கொள்ள",
        slug: "contact",
        language: "ta",
        content: `<h2><strong>தொடர்பு விவரங்கள்</strong></h2>
<p>நியூஸ் குரு தளம் தொடர்பான செய்திகள், விளம்பரங்கள் அல்லது கூடுதல் கேள்விகளுக்கு எங்களைத் தொடர்பு கொள்ள விரும்பினால், கீழே உள்ள தொடர்பு படிவத்தைப் பயன்படுத்தவும்.</p>
<p>மின்னஞ்சல்: <strong>info@newsghuru.in</strong></p>
<p>முகவரி: சென்னை, தமிழ்நாடு, இந்தியா</p>`
      },
      {
        title: "எங்களுடன் விளம்பரம் செய்யுங்கள்",
        slug: "advertise",
        language: "ta",
        content: `<h2><strong>வணிக விளம்பரங்கள்</strong></h2>
<p>நியூஸ் குரு தளம் தினசரி லட்சக்கணக்கான தமிழ் வாசகர்களைக் கொண்டுள்ளது. எங்கள் தளத்தில் விளம்பரம் செய்வதன் மூலம் உங்கள் வணிகத்தின் எல்லைகளை விரிவாக்கலாம்.</p>`
      },
      // English pages
      {
        title: "About Us",
        slug: "about",
        language: "en",
        content: `<h2><strong>About Us</strong></h2>
<p>NewsGhuru is a leading digital news platform delivering reliable and timely news. We operate on the principles of integrity, speed, and accuracy.</p>
<h3><strong>Our Mission</strong></h3>
<p>Our primary mission is to deliver breaking news across politics, sports, entertainment, business, education, and technology to our global readership.</p>`
      },
      {
        title: "Privacy Policy",
        slug: "privacy",
        language: "en",
        content: `<h2><strong>1. Introduction</strong></h2>
<p>NewsGhuru values your privacy and is committed to protecting your personal information. This Privacy Policy explains how we collect and use information when you use our services.</p>
<h2><strong>2. Information We Collect</strong></h2>
<p>We may collect information when you use our website, subscribe to services, or contact us. This includes your name, email address, and other contact details.</p>
<h2><strong>3. Data Security</strong></h2>
<p>We implement appropriate security measures to ensure your personal data is not accessed by unauthorized third parties.</p>`
      },
      {
        title: "Terms & Conditions",
        slug: "terms",
        language: "en",
        content: `<h2><strong>1. Acceptance of Terms</strong></h2>
<p>By accessing or using the NewsGhuru website, you agree to be bound by these terms and conditions. If you do not accept these terms, you should not use our website.</p>
<h2><strong>2. Intellectual Property Rights</strong></h2>
<p>All articles, news, images, logos, and other content on our website belong to NewsGhuru. Copying, publishing, or distributing them without prior written permission is prohibited.</p>`
      },
      {
        title: "Disclaimer",
        slug: "disclaimer",
        language: "en",
        content: `<h2><strong>Disclaimer</strong></h2>
<p>All information provided on our website is for general awareness and informational purposes only. NewsGhuru strives to provide accurate and reliable information, but we do not give any warranty or guarantee regarding completeness, reliability, or accuracy of the information.</p>
<h3><strong>1. Accuracy of News</strong></h3>
<p>NewsGhuru publishes news based on various reports, reporters, and sources. We make every effort to verify the authenticity of the news, but the management does not take responsibility for any inadvertent errors.</p>`
      },
      {
        title: "Contact Us",
        slug: "contact",
        language: "en",
        content: `<h2><strong>Contact Details</strong></h2>
<p>If you have any queries, advertisement requests, or feedback regarding NewsGhuru, feel free to contact us using the contact form below or via email.</p>
<p>Email: <strong>info@newsghuru.in</strong></p>
<p>Address: Chennai, Tamil Nadu, India</p>`
      },
      {
        title: "Advertise With Us",
        slug: "advertise",
        language: "en",
        content: `<h2><strong>Business Advertisements</strong></h2>
<p>NewsGhuru reaches hundreds of thousands of readers daily. By advertising on our platform, you can expand your business reach to a highly engaged audience.</p>`
      }
    ];

    for (const page of defaultPages) {
      const exists = await StaticPage.findOne({ slug: page.slug, language: page.language });
      if (!exists) {
        await StaticPage.create({
          title: page.title,
          slug: page.slug,
          language: page.language,
          content: page.content,
          lastUpdated: new Date()
        });
        console.log(`✅ Default Static Page seeded: ${page.title} [${page.language}]`);
      }
    }
  } catch (error) {
    console.error("❌ Seeding static pages failed:", error.message);
  }
};

const seedVideos = async () => {
  try {
    const Video = require("./models/Video");
    const count = await Video.countDocuments();
    if (count === 0) {
      const defaultVideos = [
        {
          title: "தமிழக பட்ஜெட் 2026: கல்வி மற்றும் விவசாயத்திற்கு முக்கியத்துவம்!",
          thumbnail: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=600&auto=format&fit=crop",
          youtubeUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
          description: "தமிழக பட்ஜெட் 2026 கூட்டத்தொடரில் அறிவிக்கப்பட்ட முக்கிய அம்சங்கள் மற்றும் மக்கள் நல திட்டங்கள் பற்றிய விரிவான அலசல்.",
          category: "Politics",
          isFeatured: true,
          isTrending: true,
          views: 1250
        },
        {
          title: "IPL 2026: சென்னை சூப்பர் கிங்ஸ் அணியின் புதிய கேப்டன் யார்?",
          thumbnail: "https://images.unsplash.com/photo-1540747737956-37872404a8de?w=600&auto=format&fit=crop",
          youtubeUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
          description: "இந்த ஆண்டின் ஐபிஎல் தொடருக்கான சென்னை சூப்பர் கிங்ஸ் அணியின் பயிற்சி மற்றும் புதிய வியூகங்கள் பற்றிய கள நிலவரம்.",
          category: "Sports",
          isFeatured: false,
          isTrending: true,
          views: 890
        },
        {
          title: "தமிழ் சினிமாவில் இந்த வாரம் ஓடிடியில் வெளியாகும் திரைப்படங்கள்!",
          thumbnail: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&auto=format&fit=crop",
          youtubeUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
          description: "திரையரங்குகள் மற்றும் முன்னணி ஓடிடி தளங்களில் வெளியாகும் புதிய தமிழ் திரைப்படங்கள் மற்றும் விமர்சனங்களின் தொகுப்பு.",
          category: "Cinema",
          isFeatured: false,
          isTrending: false,
          views: 450
        },
        {
          title: "ஆர்டிபிஷியல் இன்டெலிஜென்ஸ் (AI): புதிய வேலைவாய்ப்புகள் மற்றும் சவால்கள்!",
          thumbnail: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&auto=format&fit=crop",
          youtubeUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
          description: "தொழில்நுட்ப உலகில் ஏஐ ஏற்படுத்தி வரும் மாற்றங்கள் மற்றும் ஐடி துறையினருக்கான புதிய வாய்ப்புகள்.",
          category: "Technology",
          isFeatured: true,
          isTrending: false,
          views: 620
        }
      ];
      await Video.insertMany(defaultVideos);
      console.log("✅ Default Videos seeded in MongoDB");
    }
  } catch (error) {
    console.error("❌ Seeding videos failed:", error.message);
  }
};

const seedShorts = async () => {
  try {
    const Short = require("./models/Short");
    const count = await Short.countDocuments();
    if (count === 0) {
      const defaultShorts = [
        {
          title: "இன்றைய தங்கம் மற்றும் வெள்ளி விலை நிலவரம்!",
          thumbnail: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=600&auto=format&fit=crop",
          videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
          category: "Business",
          description: "சென்னையில் இன்றைய ஆபரணத் தங்கத்தின் விலை நிலவரம்.",
          isFeatured: true,
          isEnabled: true
        },
        {
          title: "5 நிமிடத்தில் இன்றைய முக்கிய செய்திகள்!",
          thumbnail: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600&auto=format&fit=crop",
          videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
          category: "General",
          description: "தமிழகம் மற்றும் இந்தியாவின் முக்கிய தலைப்பு செய்திகள்.",
          isFeatured: true,
          isEnabled: true
        },
        {
          title: "விம்பிள்டன் டென்னிஸ்: இறுதிப் போட்டிக்கு முன்னேறிய முன்னணி வீரர்!",
          thumbnail: "https://images.unsplash.com/photo-1540747737956-37872404a8de?w=600&auto=format&fit=crop",
          videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
          category: "Sports",
          description: "டென்னிஸ் உலகில் பரபரப்பான அரையிறுதிப் போட்டியின் முக்கிய தருணங்கள்.",
          isFeatured: false,
          isEnabled: true
        }
      ];
      await Short.insertMany(defaultShorts);
      console.log("✅ Default Shorts seeded in MongoDB");
    }
  } catch (error) {
    console.error("❌ Seeding shorts failed:", error.message);
  }
};

const seedPhotoStories = async () => {
  try {
    const PhotoStory = require("./models/PhotoStory");
    const count = await PhotoStory.countDocuments();
    if (count === 0) {
      const defaultPhotoStories = [
        {
          title: "மதுரை சித்திரை திருவிழா 2026: பக்தி பெருவெள்ளத்தில் பக்தர்கள்!",
          description: "அழகர் ஆற்றில் இறங்கும் உலகப் புகழ்பெற்ற சித்திரை திருவிழாவின் வண்ணமயமான மற்றும் தெய்வீக தருணங்கள்.",
          coverImage: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=600&auto=format&fit=crop",
          images: [
            "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=600&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1608958416806-cf76fa1c1fa8?w=600&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1621646733642-f78cfd2ffd37?w=600&auto=format&fit=crop"
          ],
          isFeatured: true
        },
        {
          title: "ஊட்டி மலர் கண்காட்சி 2026: கண்கவர் மலர் அலங்காரங்கள்!",
          description: "கோடை விழாவை முன்னிட்டு ஊட்டியில் நடைபெற்ற மலர் கண்காட்சியில் அமைக்கப்பட்டிருந்த அரிய வகை மலர் சிற்பங்கள்.",
          coverImage: "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=600&auto=format&fit=crop",
          images: [
            "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=600&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1560717789-0ac7c58ac90a?w=600&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=600&auto=format&fit=crop"
          ],
          isFeatured: false
        },
        {
          title: "மேற்குத் தொடர்ச்சி மலையின் அழகிய வனவிலங்கு சரணாலயங்கள்!",
          description: "தமிழ்நாட்டின் இயற்கை எழில் கொஞ்சும் காடுகள் மற்றும் அதில் வசிக்கும் அரிய வகை விலங்குகளின் புகைப்படங்கள்.",
          coverImage: "https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?w=600&auto=format&fit=crop",
          images: [
            "https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?w=600&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1472396961693-142e6e269027?w=600&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1549488344-1f9b8d2bd1f3?w=600&auto=format&fit=crop"
          ],
          isFeatured: false
        }
      ];
      await PhotoStory.insertMany(defaultPhotoStories);
      console.log("✅ Default Photo Stories seeded in MongoDB");
    }
  } catch (error) {
    console.error("❌ Seeding photo stories failed:", error.message);
  }
};

const seedHomepageConfig = async () => {
  try {
    const HomepageConfig = require("./models/HomepageConfig");
    const News = require("./models/News");
    const Video = require("./models/Video");
    const Short = require("./models/Short");
    const count = await HomepageConfig.countDocuments();
    if (count === 0) {
      const sampleNews = await News.find().limit(5);
      const sampleVideos = await Video.find().limit(3);
      const sampleShorts = await Short.find().limit(3);

      const defaultSections = [
        { id: "breaking", titleTa: "முக்கிய செய்திகள்", titleEn: "Breaking News", isEnabled: true, order: 1 },
        { id: "hero", titleTa: "தலைப்புச் செய்திகள்", titleEn: "Top Stories", isEnabled: true, order: 2 },
        { id: "latest", titleTa: "சமீபத்திய செய்திகள்", titleEn: "Latest News", isEnabled: true, order: 3 },
        { id: "politics", titleTa: "அரசியல்", titleEn: "Politics", isEnabled: true, order: 4 },
        { id: "cinema", titleTa: "சினிமா", titleEn: "Cinema", isEnabled: true, order: 5 },
        { id: "sports", titleTa: "விளையாட்டு", titleEn: "Sports", isEnabled: true, order: 6 },
        { id: "tech", titleTa: "தொழில்நுட்பம்", titleEn: "Technology", isEnabled: true, order: 7 },
        { id: "business", titleTa: "வணிகம் & வர்த்தகம்", titleEn: "Business & Markets", isEnabled: true, order: 8 },
        { id: "videos", titleTa: "வீடியோக்கள்", titleEn: "Video News", isEnabled: true, order: 9 },
        { id: "shorts", titleTa: "சார்ட்ஸ்", titleEn: "Shorts Reels", isEnabled: true, order: 10 },
        { id: "photos", titleTa: "புகைப்படக் கதைகள்", titleEn: "Photo Stories", isEnabled: true, order: 11 },
        { id: "editors", titleTa: "ஆசிரியர் தேர்வு", titleEn: "Editor's Picks", isEnabled: true, order: 12 }
      ];

      await HomepageConfig.create({
        heroStory: sampleNews[0]?._id || null,
        trendingStories: sampleNews.slice(1, 4).map(n => n._id),
        editorPicks: sampleNews.slice(2, 5).map(n => n._id),
        featuredVideos: sampleVideos.map(v => v._id),
        featuredShorts: sampleShorts.map(s => s._id),
        sections: defaultSections
      });
      console.log("✅ Default HomepageConfig seeded in MongoDB");
    }
  } catch (error) {
    console.error("❌ Seeding homepage config failed:", error.message);
  }
};

const app = express();

// Trust proxy so req.protocol accurately reports https behind a load balancer (like Render)
app.set("trust proxy", 1);

// Middleware
app.use(cors({
  exposedHeaders: ["x-rtb-fingerprint-id", "request-id", "Authorization"]
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Allow browser APIs that ad scripts (AdZone) use — prevents
// "Permissions policy violation: compute-pressure is not allowed"
// errors that are especially visible in incognito / strict mode.
app.use((req, res, next) => {
  res.setHeader("Access-Control-Expose-Headers", "x-rtb-fingerprint-id, request-id, Authorization");
  res.setHeader(
    "Permissions-Policy",
    [
      "compute-pressure=*",           // CPU pressure API used by some ad networks
      "interest-cohort=()",           // opt-out of FLoC (good privacy practice)
      "camera=()",                    // deny camera access
      "microphone=()",                // deny microphone access
      "geolocation=(self)",           // allow geolocation only on same origin
      "fullscreen=(self)",            // allow fullscreen on same origin
    ].join(", ")
  );
  // Allow popups opened by ad scripts in incognito without COOP blocking them
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  next();
});

app.use((req, res, next) => {
  console.log(`[REQUEST] ${req.method} ${req.url}`);
  next();
});

// Static Uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/images", express.static(path.join(__dirname, "images")));

// Routes
app.use("/api/news", newsRoutes);
app.use("/api/information", infoRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/media", mediaRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/ads", adRoutes);
app.use("/api/subscription", subscriptionRoutes);
app.use("/api/videos", videoRoutes);
app.use("/api/shorts", shortsRoutes);
app.use("/api/photo-stories", photoStoryRoutes);
app.use("/api/anmigam", anmigamRoutes);
app.use("/api/homepage-config", homepageConfigRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/email-schedule", emailScheduleRoutes);
const sponsoredArticleRoutes = require("./routes/sponsoredArticleRoutes");
app.use("/api/sponsored", sponsoredArticleRoutes);

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
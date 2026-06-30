const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, ".env") });

const connectDB = require("./db");
const News = require("./models/News");
const Category = require("./models/Category");
const Video = require("./models/Video");
const Short = require("./models/Short");
const Advertisement = require("./models/Advertisement");
const Notification = require("./models/Notification");
const HomepageConfig = require("./models/HomepageConfig");

const runMigration = async () => {
  try {
    console.log("Connecting to database...");
    await connectDB();
    console.log("Connected. Running migrations...");

    // 1. Update existing articles / News to 'ta'
    const newsRes = await News.updateMany(
      { language: { $exists: false } },
      { $set: { language: "ta" } }
    );
    console.log(`Updated ${newsRes.modifiedCount} news articles to language='ta'`);

    // 2. Update existing categories to 'ta'
    const catRes = await Category.updateMany(
      { language: { $exists: false } },
      { $set: { language: "ta" } }
    );
    console.log(`Updated ${catRes.modifiedCount} categories to language='ta'`);

    // 3. Update existing videos to 'ta'
    const videoRes = await Video.updateMany(
      { language: { $exists: false } },
      { $set: { language: "ta" } }
    );
    console.log(`Updated ${videoRes.modifiedCount} videos to language='ta'`);

    // 4. Update existing shorts to 'ta'
    const shortRes = await Short.updateMany(
      { language: { $exists: false } },
      { $set: { language: "ta" } }
    );
    console.log(`Updated ${shortRes.modifiedCount} shorts to language='ta'`);

    // 5. Update existing advertisements to 'both'
    const adRes = await Advertisement.updateMany(
      { language: { $exists: false } },
      { $set: { language: "both" } }
    );
    console.log(`Updated ${adRes.modifiedCount} advertisements to language='both'`);

    // 6. Update existing notifications to 'ta'
    const notifRes = await Notification.updateMany(
      { language: { $exists: false } },
      { $set: { language: "ta" } }
    );
    console.log(`Updated ${notifRes.modifiedCount} notifications to language='ta'`);

    // 7. Update existing homepage config to 'ta'
    const homeConfigRes = await HomepageConfig.updateMany(
      { language: { $exists: false } },
      { $set: { language: "ta" } }
    );
    console.log(`Updated ${homeConfigRes.modifiedCount} homepage configs to language='ta'`);

    // Drop the old single unique index on slug
    try {
      await Category.collection.dropIndex("slug_1");
      console.log("Dropped old 'slug_1' index from categories.");
    } catch (e) {
      console.log("Could not drop 'slug_1' index (may not exist or already dropped):", e.message);
    }

    // 8. Seed default English Categories (making sure they are separate records)
    const englishCategories = [
      { name: "Politics", slug: "politics", language: "en" },
      { name: "Sports", slug: "sports", language: "en" },
      { name: "Entertainment", slug: "entertainment", language: "en" },
      { name: "Technology", slug: "technology", language: "en" },
      { name: "Education", slug: "education", language: "en" },
      { name: "India", slug: "india", language: "en" },
      { name: "World", slug: "world", language: "en" },
      { name: "Cinema", slug: "cinema", language: "en" },
      { name: "Tamil Nadu", slug: "tamil", language: "en" },
      { name: "Breaking", slug: "breaking", language: "en" },
      { name: "Business", slug: "business", language: "en" },
      { name: "General", slug: "general", language: "en" }
    ];

    for (const cat of englishCategories) {
      const exists = await Category.findOne({ slug: cat.slug, language: "en" });
      if (!exists) {
        await Category.create(cat);
        console.log(`Created English Category: ${cat.name} (${cat.slug})`);
      }
    }

    // 9. Seed default English Homepage Config if missing
    const enConfigExists = await HomepageConfig.findOne({ language: "en" });
    if (!enConfigExists) {
      const defaultSections = [
        { id: "breaking", titleTa: "முக்கிய செய்திகள்", titleEn: "Breaking News", isEnabled: true, order: 1 },
        { id: "hero", titleTa: "தலைப்புச் செய்திகள்", titleEn: "Top Stories", isEnabled: true, order: 2 },
        { id: "latest", titleTa: "சமீபத்திய செய்திகள்", titleEn: "Latest News", isEnabled: true, order: 3 },
        { id: "politics", titleTa: "அரசியல்", titleEn: "Politics", isEnabled: true, order: 4 },
        { id: "cinema", titleTa: "சினிமா", titleEn: "Cinema", isEnabled: true, order: 5 },
        { id: "sports", titleTa: "விளையாட்டு", titleEn: "Sports", isEnabled: true, order: 6 },
        { id: "tech", titleTa: "தொழில்நுட்பம்", titleEn: "Technology", isEnabled: true, order: 7 },
        { id: "business", titleTa: "வணிகம் & வர்த்தகம்", titleEn: "Business & Markets", isEnabled: true, order: 8 },
        { id: "tamil", titleTa: "தமிழ்நாடு", titleEn: "Tamil Nadu", isEnabled: true, order: 9 },
        { id: "shorts", titleTa: "சார்ட்ஸ்", titleEn: "Shorts Reels", isEnabled: true, order: 10 },
        { id: "photos", titleTa: "புகைப்படக் கதைகள்", titleEn: "Photo Stories", isEnabled: true, order: 11 },
        { id: "editors", titleTa: "ஆசிரியர் தேர்வு", titleEn: "Editor's Picks", isEnabled: true, order: 12 }
      ];

      const defaultSidebarWidgets = [
        { id: "ad1", titleTa: "விளம்பரம் 1", titleEn: "Advertisement 1", isEnabled: true, order: 1 },
        { id: "trending", titleTa: "டிரெண்டிங் செய்திகள்", titleEn: "Trending News", isEnabled: true, order: 2 },
        { id: "ad2", titleTa: "விளம்பரம் 2", titleEn: "Advertisement 2", isEnabled: true, order: 3 },
        { id: "mostRead", titleTa: "அதிகம் வாசிக்கப்பட்டவை", titleEn: "Most Read", isEnabled: true, order: 4 },
        { id: "ad3", titleTa: "விளம்பரம் 3 (தொடரும் விளம்பரம்)", titleEn: "Advertisement 3 (Sticky)", isEnabled: true, order: 5 },
        { id: "ad4", titleTa: "விளம்பரம் 4", titleEn: "Advertisement 4", isEnabled: true, order: 6 },
        { id: "cinema", titleTa: "சினிமா செய்திகள்", titleEn: "Cinema News", isEnabled: true, order: 7 },
        { id: "poll", titleTa: "கருத்துக் கணிப்பு", titleEn: "Reader Poll", isEnabled: true, order: 8 },
        { id: "score", titleTa: "விளையாட்டு ஸ்கோர்போர்டு", titleEn: "Cricket Scoreboard", isEnabled: true, order: 9 }
      ];

      await HomepageConfig.create({
        heroStory: null,
        trendingStories: [],
        editorPicks: [],
        featuredVideos: [],
        featuredShorts: [],
        sections: defaultSections,
        sidebarWidgets: defaultSidebarWidgets,
        mostReadSettings: {
          limit: 5,
          showViews: true,
          minViews: 0
        },
        language: "en"
      });
      console.log("✅ Seeded default English HomepageConfig");
    }

    console.log("Migration completed successfully! 🎉");
    process.exit(0);
  } catch (error) {
    console.error("Migration failed ❌:", error);
    process.exit(1);
  }
};

runMigration();

const path = require("path");
require("dotenv").config();
const connectDB = require("./db");
const mongoose = require("mongoose");
const Video = require("./models/Video");
const Short = require("./models/Short");
const { detectCategory } = require("./utils/youtubeSync");

async function main() {
  try {
    await connectDB();
    
    console.log("\n=== Starting Reclassification of Videos ===");
    const videos = await Video.find({});
    let videoUpdates = 0;
    for (const v of videos) {
      const newCategory = detectCategory(v.title, v.description, v.tags || []);
      if (newCategory !== v.category) {
        console.log(`[Video] "${v.title}"\n  -> Changed category: "${v.category}" ===> "${newCategory}"`);
        v.category = newCategory;
        await v.save();
        videoUpdates++;
      }
    }
    console.log(`Updated ${videoUpdates} Videos.`);

    console.log("\n=== Starting Reclassification of Shorts ===");
    const shorts = await Short.find({});
    let shortUpdates = 0;
    for (const s of shorts) {
      const newCategory = detectCategory(s.title, s.description, s.tags || []);
      if (newCategory !== s.category) {
        console.log(`[Short] "${s.title}"\n  -> Changed category: "${s.category}" ===> "${newCategory}"`);
        s.category = newCategory;
        await s.save();
        shortUpdates++;
      }
    }
    console.log(`Updated ${shortUpdates} Shorts.`);
    
    console.log("\nReclassification finished successfully!");
  } catch (err) {
    console.error("Migration error:", err);
  } finally {
    await mongoose.connection.close();
  }
}

main();

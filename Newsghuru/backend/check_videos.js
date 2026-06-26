const mongoose = require("mongoose");
require("dotenv").config();
const connectDB = require("./db");
const Video = require("./models/Video");
const Short = require("./models/Short");

async function run() {
  await connectDB();
  console.log("Connected to MongoDB.");

  console.log("\n--- VIDEOS ---");
  const videos = await Video.find({});
  console.log(`Total Videos: ${videos.length}`);
  videos.forEach(v => {
    console.log(`[Video] Language: ${v.language} | Category: ${v.category} | Title: ${v.title}`);
  });

  console.log("\n--- SHORTS ---");
  const shorts = await Short.find({});
  console.log(`Total Shorts: ${shorts.length}`);
  shorts.forEach(s => {
    console.log(`[Short] Language: ${s.language} | Category: ${s.category} | Title: ${s.title}`);
  });

  await mongoose.disconnect();
}

run().catch(console.error);

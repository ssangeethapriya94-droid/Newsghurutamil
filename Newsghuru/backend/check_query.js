const mongoose = require("mongoose");
require("dotenv").config();
const connectDB = require("./db");
const Video = require("./models/Video");

async function run() {
  await connectDB();
  
  console.log("Querying Video.find({ language: 'en', category: 'world' }):");
  const res1 = await Video.find({ language: "en", category: "world" });
  console.log("Result:", JSON.stringify(res1, null, 2));

  console.log("\nQuerying Video.find({ language: 'en' }):");
  const res2 = await Video.find({ language: "en" });
  console.log("Result:", JSON.stringify(res2, null, 2));

  await mongoose.disconnect();
}
run().catch(console.error);

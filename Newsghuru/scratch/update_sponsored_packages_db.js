const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../backend/.env") });

const SponsoredPackage = require("../backend/models/SponsoredPackage");

const DEFAULT_PACKAGES = [
  { packageId: "article_basic", nameEn: "Sponsored News Article", nameTa: "ஸ்பான்சர் செய்யப்பட்ட செய்தி கட்டுரை", price: 8000, isVideoPackage: false },
  { packageId: "article_seo", nameEn: "SEO Premium Article", nameTa: "எஸ்சிஓ பிரீமியம் கட்டுரை", price: 15000, isVideoPackage: false },
  { packageId: "article_brand", nameEn: "Brand Story", nameTa: "பிராண்ட் கதை (Brand Story)", price: 20000, isVideoPackage: false },
  { packageId: "article_interview", nameEn: "CEO / Founder Interview", nameTa: "சிஇஓ / நிறுவனர் நேர்காணல்", price: 25000, isVideoPackage: false },
  { packageId: "article_launch", nameEn: "Product Launch Coverage", nameTa: "தயாரிப்பு தொடக்க செய்தி", price: 20000, isVideoPackage: false },
  { packageId: "article_event", nameEn: "Event Coverage", nameTa: "நிகழ்ச்சி செய்தி வெளியீடு", price: 15000, isVideoPackage: false },
  { packageId: "article_company", nameEn: "Company Profile Feature", nameTa: "நிறுவன அறிமுக கட்டுரை", price: 18000, isVideoPackage: false },
  { packageId: "video_embed", nameEn: "Promotional Video Embed", nameTa: "விளம்பர வீடியோ இணைப்பு", price: 10000, isVideoPackage: true },
  { packageId: "video_featured", nameEn: "Homepage Featured Video", nameTa: "முகப்பு பக்க வீடியோ விளம்பரம்", price: 20000, isVideoPackage: true },
  { packageId: "video_interview", nameEn: "Business Interview Video", nameTa: "வணிக நேர்காணல் வீடியோ", price: 35000, isVideoPackage: true },
  { packageId: "video_event", nameEn: "Event Video Coverage", nameTa: "நிகழ்ச்சி வீடியோ கவரேஜ்", price: 40000, isVideoPackage: true },
  { packageId: "video_documentary", nameEn: "Documentary / Brand Film", nameTa: "ஆவணப்படம் / பிராண்ட் படம்", price: 75000, isVideoPackage: true },
];

async function run() {
  try {
    const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/newsghuru";
    await mongoose.connect(mongoUri);
    console.log("Connected to Mongo");
    for (const pkg of DEFAULT_PACKAGES) {
      await SponsoredPackage.findOneAndUpdate(
        { packageId: pkg.packageId },
        { price: pkg.price, isVideoPackage: pkg.isVideoPackage },
        { upsert: true, new: true }
      );
    }
    console.log("Packages synced in DB successfully!");
    process.exit(0);
  } catch (err) {
    console.error("Error syncing DB:", err);
    process.exit(1);
  }
}

run();

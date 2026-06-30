const mongoose = require("mongoose");

const sponsoredPackageSchema = new mongoose.Schema(
  {
    packageId: { type: String, required: true, unique: true },
    nameEn: { type: String, required: true },
    nameTa: { type: String, required: true },
    price: { type: Number, required: true },
    featuresEn: { type: [String], default: [] },
    featuresTa: { type: [String], default: [] },
    badgeEn: { type: String, default: "" },
    badgeTa: { type: String, default: "" },
    isVideoPackage: { type: Boolean, default: false },
    isComboPackage: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SponsoredPackage", sponsoredPackageSchema);

const mongoose = require("mongoose");

const adPricingSchema = new mongoose.Schema(
  {
    slotId: {
      type: String,
      required: true,
      unique: true
    },
    nameEn: {
      type: String,
      required: true
    },
    nameTa: {
      type: String,
      required: true
    },
    priceWeekly: {
      type: Number,
      required: true,
      default: 0
    },
    priceMonthly: {
      type: Number,
      default: 0
    },
    descEn: {
      type: String,
      default: ""
    },
    descTa: {
      type: String,
      default: ""
    },
    badgeEn: {
      type: String,
      default: ""
    },
    badgeTa: {
      type: String,
      default: ""
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("AdPricing", adPricingSchema);

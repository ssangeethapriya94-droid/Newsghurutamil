const mongoose = require("mongoose");

const subscriptionPlanSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  duration: {
    type: String,
    required: true
  },
  durationMonths: {
    type: Number,
    required: true,
    default: 1
  },
  benefits: {
    type: [String],
    default: []
  },
  language: {
    type: String,
    enum: ["ta", "en"],
    default: "ta",
    required: true
  },
  isRecommended: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("SubscriptionPlan", subscriptionPlanSchema);

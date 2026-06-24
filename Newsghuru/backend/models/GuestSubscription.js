const mongoose = require("mongoose");

const guestSubscriptionSchema = new mongoose.Schema({
  fcmToken: {
    type: String,
    required: true,
    unique: true,
  },
  language: {
    type: String,
    enum: ["ta", "en", "hi", "te", "ml"],
    default: "ta",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model("GuestSubscription", guestSubscriptionSchema);

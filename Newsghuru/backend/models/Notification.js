const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["submitted", "changes", "rejected", "approved", "published", "contact", "campaign_submitted", "campaign_approved", "campaign_rejected"],
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    reason: {
      type: String,
      default: "",
    },
    read: {
      type: Boolean,
      default: false,
    },
    language: {
      type: String,
      enum: ["ta", "en", "hi", "te", "ml"],
      default: "ta",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Notification", notificationSchema);

const mongoose = require("mongoose");

const advertisementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    advertiserName: {
      type: String,
      required: true,
      trim: true
    },
    advertiserEmail: {
      type: String,
      required: true,
      trim: true
    },
    advertiserPhone: {
      type: String,
      required: true,
      trim: true
    },
    companyName: {
      type: String,
      trim: true,
      default: ""
    },
    description: {
      type: String,
      trim: true,
      default: ""
    },
    image: {
      type: String,
      required: true
    },
    targetUrl: {
      type: String,
      required: true,
      trim: true
    },
    position: {
      type: String,
      required: true,
      enum: [
        "HEADER_BANNER",
        "TOP_BANNER",
        "SIDEBAR",
        "SECTION_BANNER",
        "ARTICLE_ADVERTISEMENT",
        "POPUP_ADVERTISEMENT",
        "FLOATING_ADVERTISEMENT"
      ]
    },
    priority: {
      type: String,
      enum: ["High", "Medium", "Low"],
      default: "Medium"
    },
    status: {
      type: String,
      enum: ["Active", "Inactive", "Scheduled", "Expired", "Draft", "Pending Approval", "Approved", "Published", "Rejected"],
      default: "Active"
    },
    popupDelay: {
      type: Number,
      default: 3
    },
    popupAutoClose: {
      type: Number,
      default: 10
    },
    rotationInterval: {
      type: Number,
      default: 10
    },
    startDate: {
      type: Date,
      required: true
    },
    startTime: {
      type: String,
      default: "00:00"
    },
    endDate: {
      type: Date,
      required: true
    },
    endTime: {
      type: String,
      default: "23:59"
    },
    clicks: {
      type: Number,
      default: 0
    },
    impressions: {
      type: Number,
      default: 0
    },
    ctr: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    publishedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    approvedAt: {
      type: Date
    },
    publishedAt: {
      type: Date
    },
    rejectedAt: {
      type: Date
    },
    rejectionReason: {
      type: String,
      default: ""
    },
    language: {
      type: String,
      enum: ["ta", "en", "both", "hi", "te", "ml"],
      default: "both",
      required: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Advertisement", advertisementSchema);

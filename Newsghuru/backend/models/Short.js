const mongoose = require("mongoose");

const shortSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    thumbnail: {
      type: String,
      required: true
    },
    videoUrl: {
      type: String,
      required: true,
      trim: true
    },
    category: {
      type: String,
      default: "General",
      trim: true
    },
    description: {
      type: String,
      trim: true,
      default: ""
    },
    isFeatured: {
      type: Boolean,
      default: false
    },
    isEnabled: {
      type: Boolean,
      default: true
    },
    status: {
      type: String,
      enum: ["Draft", "Pending Approval", "Approved", "Published", "Rejected"],
      default: "Draft"
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
      enum: ["ta", "en", "hi", "te", "ml"],
      default: "ta",
      required: true
    },
    youtubeVideoId: {
      type: String,
      unique: true,
      sparse: true,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Short", shortSchema);

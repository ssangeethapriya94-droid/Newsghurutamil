const mongoose = require("mongoose");

const templeBlogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    subtitle: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    content: {
      type: String, // Rich text content (HTML from ReactQuill)
      required: true,
    },
    image: {
      type: String, // Main image URL
      default: "",
    },
    templeName: {
      type: String,
      trim: true,
    },
    location: {
      type: String,
      trim: true,
    },
    language: {
      type: String,
      enum: ["ta", "en"],
      required: true,
    },
    status: {
      type: String,
      enum: ["draft", "submitted", "approved", "rejected", "published"],
      default: "draft",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    publishedAt: {
      type: Date,
    },
    rejectedAt: {
      type: Date,
    },
    rejectionReason: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("TempleBlog", templeBlogSchema);

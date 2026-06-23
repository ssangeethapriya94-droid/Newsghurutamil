const mongoose = require("mongoose");

const newsSchema =
  new mongoose.Schema({

    title: {
      type: String,
      required: true,
    },

    subtitle: {
      type: String,
    },

    description: {
      type: String,
      required: true,
    },

    shortDescription: {
      type: String,
    },

    image: {
      type: String,
      required: false,
      default: "",
    },

    coverImage: {
      type: String,
      default: "",
    },

    galleryImages: {
      type: [String],
      default: [],
    },

    category: {
      type: String,
      required: true,
    },

    location: {
      type: String,
    },

    tags: {
      type: String,
    },

    seoKeywords: {
      type: String,
    },

    reporterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    editorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    status: {
      type: String,
      enum: ["draft", "pending_editor_review", "rejected", "pending_admin_verification", "published"],
      default: "draft",
    },

    time: {
      type: String,
    },

    date: {
      type: Date,
      default: Date.now,
    },

    submittedAt: {
      type: Date,
    },

    approvedAt: {
      type: Date,
    },

    publishedAt: {
      type: Date,
    },

    rejectedAt: {
      type: Date,
    },

    rejectionReason: {
      type: String,
    },

    keywords: {
      type: String,
    },

    comments: {
      type: Number,
      default: 0,
    },

    views: {
      type: Number,
      default: 0,
    },

    language: {
      type: String,
      enum: ["ta", "en", "hi", "te", "ml"],
      default: "ta",
      required: true,
    },

    sendBrowserNotification: {
      type: Boolean,
      default: false,
    },

  },
  {
    timestamps: true,
  });

module.exports =
  mongoose.model(
    "News",
    newsSchema
  );
const mongoose = require("mongoose");

const sponsoredArticleSchema = new mongoose.Schema(
  {
    sponsorName: { type: String, default: "" },
    companyName: { type: String, required: true },
    contactPerson: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    website: { type: String, default: "" },
    companyLogo: { type: String, default: "" },
    socialLinks: {
      facebook: { type: String, default: "" },
      twitter: { type: String, default: "" },
      linkedin: { type: String, default: "" },
      instagram: { type: String, default: "" },
      youtube: { type: String, default: "" },
    },

    packageType: {
      type: String,
      default: "Sponsored News Article",
    },
    packagePrice: { type: Number, default: 8000 },
    placement: {
      type: String,
      enum: ["homepage_sponsored", "category_sponsored", "sidebar_widget", "featured_banner", "normal_feed"],
      default: "homepage_sponsored",
    },
    publishStartDate: { type: Date },
    expiryDate: { type: Date },
    durationDays: { type: Number, default: 30 },

    videoPackage: { type: String, default: "None" },
    videoCharge: { type: Number, default: 0 },
    hasVideo: { type: Boolean, default: false },
    videoUrl: { type: String, default: "" },

    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    comboRequestId: { type: mongoose.Schema.Types.ObjectId, ref: "ComboPackageRequest" },

    reporterId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    editorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    status: {
      type: String,
      enum: [
        "request_submitted",
        "assigned_to_reporter",
        "draft",
        "pending_editor_review",
        "pending_admin_approval",
        "approved",
        "published",
        "expired",
        "rejected",
      ],
      default: "request_submitted",
    },

    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Refunded"],
      default: "Pending",
    },

    sponsoredLabel: {
      type: String,
      default: "Sponsored Content",
    },

    articleSource: {
      type: String,
      enum: ["sponsor_provided", "reporter_created"],
      default: "sponsor_provided",
    },

    title: { type: String, default: "" },
    subtitle: { type: String, default: "" },
    description: { type: String, default: "" },
    shortDescription: { type: String, default: "" },
    category: { type: String, default: "General" },
    image: { type: String, default: "" },
    galleryImages: { type: [String], default: [] },
    documents: { type: [String], default: [] },

    language: {
      type: String,
      enum: ["ta", "en", "both"],
      default: "both",
    },

    eventDetails: { type: String, default: "" },
    preferredPublishDate: { type: Date },

    views: { type: Number, default: 0 },
    publishedAt: { type: Date },
    rejectionReason: { type: String, default: "" },
    paymentId: { type: String, default: "" },
    orderId: { type: String, default: "" },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("SponsoredArticle", sponsoredArticleSchema);

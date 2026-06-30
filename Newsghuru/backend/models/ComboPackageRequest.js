const mongoose = require("mongoose");

const comboPackageRequestSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    companyName: { type: String, required: true },
    contactPerson: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    website: { type: String, default: "" },
    logo: { type: String, default: "" },
    images: { type: [String], default: [] },
    videoUrl: { type: String, default: "" },
    video: { type: String, default: "" },
    documents: { type: [String], default: [] },

    packageName: {
      type: String,
      enum: ["Starter", "Business Growth", "Premium Brand"],
      required: true
    },
    packagePrice: { type: Number, required: true },
    includedServices: { type: [String], default: [] },

    optionType: {
      type: String,
      enum: ["Option 1", "Option 2"], // Option 1: Ready-made Article, Option 2: Reporter Writes
      required: true
    },

    eventDetails: { type: String, default: "" },
    description: { type: String, default: "" },

    preferredPublishDate: { type: Date },
    startDate: { type: Date },
    expiryDate: { type: Date },
    durationDays: { type: Number, default: 30 },
    language: { type: String, enum: ["ta", "en", "both"], default: "both" },

    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Refunded"],
      default: "Pending"
    },
    paymentMethod: { type: String, default: "Razorpay" },
    paymentId: { type: String, default: "" },
    orderId: { type: String, default: "" },

    status: {
      type: String,
      enum: ["pending_review", "active", "completed", "expired", "rejected"],
      default: "pending_review"
    },

    assignedReporterId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    sponsoredArticles: [{ type: mongoose.Schema.Types.ObjectId, ref: "SponsoredArticle" }],

    socialChecklist: [
      {
        taskName: { type: String, required: true },
        status: { type: String, enum: ["Pending", "Completed"], default: "Pending" },
        completedAt: { type: Date }
      }
    ],

    rejectionReason: { type: String, default: "" }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("ComboPackageRequest", comboPackageRequestSchema);

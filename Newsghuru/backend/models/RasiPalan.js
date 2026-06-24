const mongoose = require("mongoose");

const rasiPalanSchema = new mongoose.Schema(
  {
    language: {
      type: String,
      enum: ["ta", "en"],
      required: true,
    },
    periodType: {
      type: String,
      enum: ["day", "week", "month"],
      required: true,
      default: "day",
    },
    date: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date, // Optional, useful for weekly/monthly ranges
    },
    dayName: {
      type: String, // e.g. "Thursday" or "வியாழக்கிழமை"
    },
    title: {
      type: String, // e.g. "இன்றைய ராசிபலன்" or "Today's Horoscope"
    },
    status: {
      type: String,
      enum: ["draft", "submitted", "approved", "rejected", "published"],
      default: "draft",
    },
    predictions: [
      {
        rasiKey: {
          type: String,
          required: true, // e.g., "aries", "taurus", etc.
        },
        name: {
          type: String,
          required: true, // e.g., "மேஷம்", "Aries"
        },
        description: {
          type: String,
          required: true,
        },
      },
    ],
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

module.exports = mongoose.model("RasiPalan", rasiPalanSchema);

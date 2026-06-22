const mongoose = require("mongoose");

const staticPageSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
      lowercase: true,
    },
    language: {
      type: String,
      enum: ['ta', 'en'],
      default: 'ta',
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index: one page per slug per language
staticPageSchema.index({ slug: 1, language: 1 }, { unique: true });

module.exports = mongoose.model("StaticPage", staticPageSchema);

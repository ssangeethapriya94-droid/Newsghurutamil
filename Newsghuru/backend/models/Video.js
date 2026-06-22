const mongoose = require("mongoose");

const videoSchema = new mongoose.Schema(
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
    youtubeUrl: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true,
      default: ""
    },
    category: {
      type: String,
      default: "General",
      trim: true
    },
    isFeatured: {
      type: Boolean,
      default: false
    },
    isTrending: {
      type: Boolean,
      default: false
    },
    views: {
      type: Number,
      default: 0
    },
    language: {
      type: String,
      enum: ["ta", "en", "hi", "te", "ml"],
      default: "ta",
      required: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Video", videoSchema);

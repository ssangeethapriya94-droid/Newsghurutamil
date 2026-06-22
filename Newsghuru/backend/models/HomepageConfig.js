const mongoose = require("mongoose");

const homepageConfigSchema = new mongoose.Schema(
  {
    heroStory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "News",
      default: null
    },
    trendingStories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "News"
      }
    ],
    editorPicks: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "News"
      }
    ],
    featuredVideos: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video"
      }
    ],
    featuredShorts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Short"
      }
    ],
    sections: [
      {
        id: { type: String, required: true },
        titleTa: { type: String, required: true },
        titleEn: { type: String, required: true },
        isEnabled: { type: Boolean, default: true },
        order: { type: Number, default: 0 }
      }
    ],
    sidebarWidgets: [
      {
        id: { type: String, required: true },
        titleTa: { type: String, required: true },
        titleEn: { type: String, required: true },
        isEnabled: { type: Boolean, default: true },
        order: { type: Number, default: 0 }
      }
    ],
    mostReadSettings: {
      limit: { type: Number, default: 5 },
      showViews: { type: Boolean, default: true },
      minViews: { type: Number, default: 0 }
    },
    language: {
      type: String,
      enum: ["ta", "en", "hi", "te", "ml"],
      default: "ta",
      required: true,
      unique: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("HomepageConfig", homepageConfigSchema);

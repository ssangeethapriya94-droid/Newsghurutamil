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
    ]
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("HomepageConfig", homepageConfigSchema);

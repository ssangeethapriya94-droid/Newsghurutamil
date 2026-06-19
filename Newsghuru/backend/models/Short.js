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
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Short", shortSchema);

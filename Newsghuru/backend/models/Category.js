const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  name: {
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
    enum: ["ta", "en", "hi", "te", "ml"],
    default: "ta",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

categorySchema.index({ slug: 1, language: 1 }, { unique: true });

module.exports = mongoose.model("Category", categorySchema);

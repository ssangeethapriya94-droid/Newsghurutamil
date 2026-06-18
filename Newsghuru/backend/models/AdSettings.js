const mongoose = require("mongoose");

const adSettingsSchema = new mongoose.Schema(
  {
    globalRotationInterval: {
      type: Number,
      enum: [10, 15, 20, 30],
      default: 10
    },
    popupEnabled: {
      type: Boolean,
      default: true
    },
    popupDelay: {
      type: Number,
      default: 3
    },
    popupAutoClose: {
      type: Number,
      default: 10
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("AdSettings", adSettingsSchema);

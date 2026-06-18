const mongoose = require("mongoose");

const adRequestSchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      required: true,
      trim: true
    },
    contactPerson: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      trim: true
    },
    phone: {
      type: String,
      required: true,
      trim: true
    },
    website: {
      type: String,
      trim: true,
      default: ""
    },
    advertisementType: {
      type: String,
      required: true,
      enum: [
        "TOP_BANNER",
        "SIDEBAR",
        "SECTION_BANNER",
        "ARTICLE_ADVERTISEMENT",
        "POPUP_ADVERTISEMENT",
        "FLOATING_ADVERTISEMENT"
      ]
    },
    message: {
      type: String,
      trim: true,
      default: ""
    },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending"
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("AdRequest", adRequestSchema);

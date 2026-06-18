const mongoose = require("mongoose");

const adEventSchema = new mongoose.Schema({
  adId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Advertisement",
    required: true
  },
  eventType: {
    type: String,
    enum: ["impression", "click"],
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Indexing for high-performance aggregations on date ranges
adEventSchema.index({ adId: 1, eventType: 1, timestamp: 1 });

module.exports = mongoose.model("AdEvent", adEventSchema);

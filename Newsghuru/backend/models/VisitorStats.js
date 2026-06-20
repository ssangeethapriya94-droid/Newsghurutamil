const mongoose = require("mongoose");

const visitorStatsSchema = new mongoose.Schema({
  count: {
    type: Number,
    default: 0,
  },
});

module.exports = mongoose.model("VisitorStats", visitorStatsSchema);

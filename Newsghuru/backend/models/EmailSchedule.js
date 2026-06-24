const mongoose = require("mongoose");

const emailScheduleSchema = new mongoose.Schema({
  language: {
    type: String,
    enum: ["ta", "en"],
    required: true,
    unique: true
  },
  scheduleType: {
    type: String,
    enum: ["daily", "one-time"],
    default: "daily"
  },
  time: {
    type: String, // "HH:MM" in 24h format
    default: "10:00"
  },
  dateTime: {
    type: Date, // Specific date and time
    default: null
  },
  isEnabled: {
    type: Boolean,
    default: false
  },
  lastSent: {
    type: Date,
    default: null
  },
  isSent: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model("EmailSchedule", emailScheduleSchema);

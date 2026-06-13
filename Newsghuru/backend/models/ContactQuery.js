const mongoose = require("mongoose");

const contactQuerySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    default: "",
  },
  category: {
    type: String,
    default: "",
  },
  message: {
    type: String,
    default: "",
  },
  status: {
    type: String,
    enum: ["Pending", "Reviewed"],
    default: "Pending",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("ContactQuery", contactQuerySchema);

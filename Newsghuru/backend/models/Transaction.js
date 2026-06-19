const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    planId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubscriptionPlan",
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    paymentId: {
      type: String,
      required: true
    },
    orderId: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ["Success", "Failed"],
      default: "Success"
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Transaction", transactionSchema);

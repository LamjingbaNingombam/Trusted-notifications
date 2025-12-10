const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    eventType: { type: String, required: true }, // e.g. OTP, PASSWORD_CHANGE
    priority: { type: String, enum: ["CRITICAL", "HIGH", "NORMAL"], default: "NORMAL" },
    channelUsed: { type: String, enum: ["SMS", "EMAIL", "IN_APP"], required: true },
    message: { type: String, required: true },
    status: {
      type: String,
      enum: ["PENDING", "SENT", "FAILED", "DELIVERED"],
      default: "PENDING"
    },
    attempts: { type: Number, default: 0 },
    signature: { type: String, required: true },
    meta: { type: Object } // extra info like phone/email, transactionId, etc.
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);

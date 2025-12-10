const express = require("express");
const Notification = require("../models/Notification");
const { verifySignature } = require("../utils/signature");
const { sendTrustedNotification } = require("../services/notificationService");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Trigger a notification (for demo, we call it from frontend)
router.post("/send", protect, async (req, res) => {
  try {
    const { eventType, priority, message, meta } = req.body;

    const notification = await sendTrustedNotification({
      user: req.user,
      eventType,
      priority,
      message,
      meta
    });

    res.json(notification);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error sending notification" });
  }
});

// Get current user's notifications
router.get("/", protect, async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(
      notifications.map((n) => {
        const payload = {
          userId: n.user.toString(),
          message: n.message,
          eventType: n.eventType,
          createdAt: n.createdAt.toISOString()
        };
        const valid = verifySignature(payload, n.signature);
        return { ...n.toObject(), signatureValid: valid };
      })
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching notifications" });
  }
});

module.exports = router;

const Notification = require("../models/Notification");
const { generateSignature } = require("../utils/signature");
const templates = require("../templates");
const nodemailer = require("nodemailer");
const twilio = require("twilio");

// ==========================
// CHANNEL SENDERS
// ==========================
const twilioSid = process.env.TWILIO_ACCOUNT_SID;
const twilioAuth = process.env.TWILIO_AUTH_TOKEN;
const twilioFrom = process.env.TWILIO_FROM_NUMBER;
const twilioClient = twilioSid && twilioAuth ? twilio(twilioSid, twilioAuth) : null;

const sendSMS = async (payload) => {
  if (!twilioClient || !twilioFrom) {
    console.error("❌ Twilio config missing. SMS not sent.");
    return { success: false, error: "Twilio config missing" };
  }
  const to = payload.meta?.phone || payload.userPhone;
  if (!to) {
    console.error("❌ No recipient phone provided for SMS.");
    return { success: false, error: "No recipient phone" };
  }
  try {
    await twilioClient.messages.create({
      body: payload.message,
      from: twilioFrom,
      to,
    });
    console.log("📱 [SMS] Sent to:", to);
    return { success: true };
  } catch (err) {
    console.error("❌ SMS send failed:", err);
    return { success: false, error: err.message };
  }
};

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendEmail = async (payload) => {
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: payload.meta?.email || payload.userEmail,
      subject: `Notification: ${payload.eventType}`,
      text: payload.message,
    });

    console.log("📧 Email sent to:", payload.meta?.email || payload.userEmail);
    return { success: true };
  } catch (err) {
    console.error("❌ Email send failed:", err);
    return { success: false, error: err.message };
  }
};

const sendInApp = async (payload) => {
  console.log("📥 [IN_APP] Storing:", payload.message);
  return { success: true };
};

// ==========================
// CHANNEL LOGIC MAP
// ==========================
const channelMap = {
  OTP: "SMS",
  PASSWORD_CHANGE: "SMS",
  LOGIN_ALERT: "SMS",
  DEVICE_REGISTRATION: "EMAIL",
  SUSPICIOUS_ACTIVITY: "SMS",
  TRANSACTION_DEBIT: "SMS",
  TRANSACTION_CREDIT: "SMS",
  BILL_PAYMENT: "EMAIL",
  EMI_REMINDER: "EMAIL",
  STATEMENT_READY: "IN_APP",
  OFFER_ALERT: "IN_APP",
};

// fallback definition for CRITICAL & HIGH
const fallbackChain = {
  SMS: ["EMAIL", "IN_APP"],
  EMAIL: ["IN_APP"],
  IN_APP: []
};

// ==========================
// MAIN NOTIFICATION FUNCTION
// ==========================
const sendTrustedNotification = async ({
  user,
  eventType,
  priority,
  message,
  meta = {},
}) => {
  const basePayload = {
    userId: user._id.toString(),
    userEmail: user.email,
    eventType,
    priority,
    meta,
  };

  const template = templates[eventType];
  const finalMessage =
    message !== undefined
      ? message
      : template
      ? template(meta)
      : "Notification";

  let primaryChannel = channelMap[eventType] || "SMS";
  let status = "FAILED";
  let channelUsed = primaryChannel;
  let attempts = 0;
  let result;

  // Helper: run the appropriate sender
  const runChannel = async (channel) => {
    if (channel === "SMS")
      return sendSMS({ ...basePayload, channel, message: finalMessage });
    if (channel === "EMAIL")
      return sendEmail({ ...basePayload, channel, message: finalMessage });
    return sendInApp({ ...basePayload, channel, message: finalMessage });
  };

  // 1️⃣ Attempt primary channel
  attempts++;
  result = await runChannel(primaryChannel);

  // 2️⃣ Fallback for critical/high
  if (!result.success && (priority === "CRITICAL" || priority === "HIGH")) {
    for (const fallback of fallbackChain[primaryChannel] || []) {
      attempts++;
      channelUsed = fallback;

      result = await runChannel(fallback);
      if (result.success) break;
    }
  }

  // 3️⃣ Always store in in-app (final fallback)
  if (!result.success) {
    attempts++;
    channelUsed = "IN_APP";
    await sendInApp({ ...basePayload, channel: "IN_APP", message: finalMessage });
  }

  status = result.success ? "SENT" : "FAILED";

  // Signature timestamp alignment
  const createdAt = new Date();
  const signaturePayload = {
    userId: basePayload.userId,
    message: finalMessage,
    eventType,
    createdAt: createdAt.toISOString(),
  };
  const signature = generateSignature(signaturePayload);

  const notification = await Notification.create({
    user: user._id,
    eventType,
    priority,
    channelUsed,
    message: finalMessage,
    status,
    attempts,
    signature,
    meta,
    createdAt,
  });

  return notification;
};

module.exports = { sendTrustedNotification };

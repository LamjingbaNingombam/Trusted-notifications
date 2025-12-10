const crypto = require("crypto");

const generateSignature = (payload) => {
  const secret = process.env.SIGNING_SECRET;
  const dataString = JSON.stringify(payload);
  return crypto.createHmac("sha256", secret).update(dataString).digest("hex");
};

const verifySignature = (payload, signature) => {
  const expected = generateSignature(payload);
  return expected === signature;
};

module.exports = { generateSignature, verifySignature };

module.exports = {
  OTP: (data) => `Your login OTP is ${data.otp}. Do not share it.`,

  PASSWORD_CHANGE: () =>
    `Your password was changed. If this wasn't you, contact support.`,

  LOGIN_ALERT: () =>
    `A login was made to your account. If this wasn't you, secure your account.`,

  DEVICE_REGISTRATION: () =>
    `A new device was registered to your account.`,

  SUSPICIOUS_ACTIVITY: () =>
    `Suspicious activity detected in your account.`,

  TRANSACTION_DEBIT: (data) =>
    `Rs.${data.amount} was debited from your account.`,

  TRANSACTION_CREDIT: (data) =>
    `Rs.${data.amount} was credited to your account.`,

  BILL_PAYMENT: (data) =>
    `Your bill of Rs.${data.amount} has been paid.`,

  EMI_REMINDER: (data) =>
    `Your EMI of Rs.${data.amount} is due soon.`,

  STATEMENT_READY: () =>
    `Your monthly statement is ready.`,

  OFFER_ALERT: (data) =>
    `New offer available: ${data.offerName}`,
};


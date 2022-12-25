// Stores success messages in authentication middleware
const auth = {
  verificationCodeSent: {
    en: "Verification code has been sent to your email",
    ar: "تم ارسال كود التفعيل إلى بريدك الإلكتروني",
  },
  passwordResetCodeSent: {
    en: "Verification code has been sent to your email",
    ar: "تم ارسال كود استعادة كلمة المرور إلى بريدك الإلكتروني",
  },
  notificationSent: {
    en: "Notification has been sent to users",
    ar: "تم ارسال الاشعار للمستخدمين",
  },
};

module.exports = {
  auth,
};

const auth = {
  user: "thedev.samer@gmail.com",
  password: process.env["EMAIL_PRIVATE_KEY"],
  emailURL: "http://192.168.1.235:4000/",
  siteDomains: {
    verifyEmail: "http://192.168.1.235:4000/api/users/verify-email/",
  },
};

const content = {
  register: {
    name: "المعلم التكنولوجي",
    intro:
      "أهلاً بك في مجتمع المعلم التكنولوجي، نحن سعداء جداً بإنضمامك إلينا.",
    action: {
      instructions: "لتفعيل حسابك، يرجى الضغط على الزر في الأسفل:",
      button: {
        color: "#1a73e8",
        text: "تفعيل الحساب",
        link: "***",
      },
    },
    outro: "شكراً لإنضمامك لمجتمع المعلم التكنولوجي.",
  },

  resetPassword: {
    name: "المعلم التكنولوجي",
    intro:
      "هذا الرابط صالح للإستخدام مرة واحدة فقط ولمدة 15 دقيقة من وقت الإرسال.",
    action: {
      instructions:
        "لإعادة تعيين كلمة المرور الخاصة بك، يرجى الضغط على الزر في الأسفل:",
      button: {
        color: "#1a73e8",
        text: "إعادة تعيين كلمة المرور",
        link: "***",
      },
    },
    outro: "شكراً لإنضمامك لمجتمع المعلم التكنولوجي.",
  },
};

const message = {
  register: {
    from: auth.user,
    to: "***",
    subject: "أهلاً بك في المعلم التكنولوجي",
    html: "***",
  },

  resetPassword: {
    from: auth.user,
    to: "***",
    subject: "إعادة تعيين كلمة مرور حسابك في المعلم التكنولوجي",
    html: "***",
  },
};

module.exports = {
  auth,
  content,
  message,
};

const auth = {
  user: "thedev.samer@gmail.com",
  password: process.env["EMAIL_PRIVATE_KEY"],
  emailURL: "http://192.168.1.235:4000/",
  siteDomain: "http://192.168.1.235:4000/api/auth/verify/",
};

const content = {
  name: "المعلم التكنولوجي",
  intro: "أهلاً بك في مجتمع المعلم التكنولوجي، نحن سعداء جداً بإنضمامك إلينا.",
  action: {
    instructions: "لتفعيل حسابك، يرجى الضغط على الزر في الأسفل:",
    button: {
      color: "#1a73e8",
      text: "تفعيل الحساب",
      link: "***",
    },
  },
  outro: "شكراً لإنضمامك لمجتمع المعلم التكنولوجي.",
};

const message = {
  from: auth.user,
  to: "***",
  subject: "أهلاً بك في المعلم التكنولوجي",
  html: "***",
};

module.exports = {
  auth,
  content,
  message,
};

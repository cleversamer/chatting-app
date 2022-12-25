const mail = require("../../config/mail");
const Mailgen = require("mailgen");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "Gmail",
  secure: true,
  auth: {
    user: mail.auth.user,
    pass: mail.auth.password,
  },
});

module.exports.registerEmail = async (email, user) => {
  try {
    const mailGenerator = new Mailgen({
      theme: "default",
      product: {
        name: "المعلم التكنولوجي",
        link: "#",
        copyright: "Copyright © 2022 Technology Teacher. All rights reserved.",
      },
    });

    const emailBody = mailGenerator.generate({
      body: {
        title: `هذا هو الكود الخاص بتفعيل الحساب صالح لمدة 10 دقائق: ${user.verificationCode.code}`,
        greeting: "Dear",
        signature: `${user.firstname} ${user.lastname}`,
      },
    });

    const message = {
      to: email,
      from: "المعلم التكنولوجي",
      html: emailBody,
      subject: "أهلاً بك في المعلم التكنولوجي",
    };

    await transporter.sendMail(message);
    return true;
  } catch (err) {
    throw err;
  }
};

module.exports.forgotPasswordEmail = async (email, user) => {
  try {
    const mailGenerator = new Mailgen({
      theme: "default",
      product: {
        name: "المعلم التكنولوجي",
        link: "#",
        copyright: "Copyright © 2022 Technology Teacher. All rights reserved.",
      },
    });

    const emailBody = mailGenerator.generate({
      body: {
        title: `هذا هو الكود الخاص باستعادة كلمة المرور صالح لمدة 10 دقائق: ${user.resetPasswordCode.code}`,
        greeting: "Dear",
        signature: `${user.firstname} ${user.lastname}`,
      },
    });

    const message = {
      to: email,
      from: "المعلم التكنولوجي",
      html: emailBody,
      subject: "إعادة تعيين كلمة المرور",
    };

    await transporter.sendMail(message);
    return true;
  } catch (err) {
    throw err;
  }
};

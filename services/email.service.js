const nodemailer = require("nodemailer");
const Mailgen = require("mailgen");
const mail = require("../config/mail");

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
    const emailToken = user.genRegisterToken();

    const mailGenerator = new Mailgen({
      theme: "default",
      product: {
        name: mail.content.register.name,
        link: mail.auth.emailURL,
      },
    });

    const emailBody = mailGenerator.generate({
      body: {
        ...mail.content.register,
        name: user.firstname,
        action: {
          ...mail.content.register.action,
          button: {
            ...mail.content.register.action.button,
            link: `${mail.auth.siteDomain.verifyEmail}?key=${emailToken}`,
          },
        },
      },
    });

    const message = {
      ...mail.message.register,
      to: email,
      html: emailBody,
    };

    await transporter.sendMail(message);
    return true;
  } catch (err) {
    throw err;
  }
};

module.exports.resetPassword = async (email, user) => {
  try {
    const emailToken = user.genPasswordResetToken();

    const mailGenerator = new Mailgen({
      theme: "default",
      product: {
        name: mail.content.resetPassword.name,
        link: mail.auth.emailURL,
      },
    });

    const emailBody = mailGenerator.generate({
      body: {
        ...mail.content.resetPassword,
        name: user.firstname,
        action: {
          ...mail.content.resetPassword.action,
          button: {
            ...mail.content.resetPassword.action.button,
            link: `${mail.auth.siteDomain.resetPassword}${emailToken}`,
          },
        },
      },
    });

    const message = {
      ...mail.message.resetPassword,
      to: email,
      html: emailBody,
    };

    await transporter.sendMail(message);
    return true;
  } catch (err) {
    throw err;
  }
};

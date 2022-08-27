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
        name: mail.content.name,
        link: mail.auth.emailURL,
      },
    });

    const emailBody = mailGenerator.generate({
      body: {
        ...mail.content,
        name: user.firstname,
        action: {
          ...mail.content.action,
          button: {
            ...mail.content.action.button,
            link: `${mail.auth.siteDomain}?key=${emailToken}`,
          },
        },
      },
    });

    const message = {
      ...mail.message,
      to: email,
      html: emailBody,
    };

    await transporter.sendMail(message);
    return true;
  } catch (err) {
    throw err;
  }
};

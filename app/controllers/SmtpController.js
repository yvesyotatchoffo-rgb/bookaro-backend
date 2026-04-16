var nodemailer = require("nodemailer");
var smtpTransport = require("nodemailer-smtp-transport");

module.exports = {
  sendEmail: async (toList, subject, message, next) => {
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = Number(process.env.SMTP_PORT || 587);
    const smtpUser = process.env.SMTP_USER;
    const smtpPassword = process.env.SMTP_PASSWORD;

    if (!smtpHost || !smtpUser || !smtpPassword) {
      throw new Error("SMTP is not configured. Please set SMTP_HOST, SMTP_USER and SMTP_PASSWORD.");
    }

    const transport = nodemailer.createTransport(
      smtpTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        requiresAuth: true,
        auth: {
          user: smtpUser,
          pass: smtpPassword,
        },
        tls: {
          rejectUnauthorized: false,
        },
      })
    );

    const to = Array.isArray(toList) ? toList.join(",") : toList;
    const info = await transport.sendMail({
      from: "BOOKAROO <" + smtpUser + ">",
      to: to,
      subject: subject,
      html: message,
    });

    return info;
  },
};

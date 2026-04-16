var nodemailer = require("nodemailer");
var smtpTransport = require("nodemailer-smtp-transport");
const { sendEmail: sendBrevoEmail, brevoEmailModules } = require("../config/brevo.config");

module.exports = {
  sendEmail: async (toList, subject, message, next) => {
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = Number(process.env.SMTP_PORT || 587);
    const smtpUser = process.env.SMTP_USER;
    const smtpPassword = process.env.SMTP_PASSWORD;

    if (!smtpHost || !smtpUser || !smtpPassword) {
      if (process.env.BREVO_API_KEY) {
        const brevoResult = await sendBrevoEmail({
          module: brevoEmailModules.AUTH,
          to: toList,
          subject,
          htmlContent: message,
        });

        if (!brevoResult || !brevoResult.success) {
          throw new Error(
            "Email delivery failed via Brevo fallback: " +
              (brevoResult && brevoResult.error ? brevoResult.error : "Unknown error")
          );
        }

        return brevoResult;
      }

      throw new Error(
        "Email delivery is not configured. Set SMTP_* or BREVO_API_KEY/BREVO_* settings."
      );
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


var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');

module.exports = {
  sendEmail: (toList, subject, message, next) => {
    console.log("emails",toList)
    transport = nodemailer.createTransport(
      smtpTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        debug: true,
        sendmail: true,
        requiresAuth: true,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        },
        tls: {
          rejectUnauthorized: false,
        },
      })
    );

    const to = Array.isArray(toList) ? toList.join(",") : toList;

    transport.sendMail(
      {
        from: 'BOOKAROO  <' + process.env.SMTP_USER + '>',
        to: to,
        subject: subject,
        html: message,
      },
      function (err, info) {
        console.log('err',err, info);
      }
    );
    console.log("sended successfully")
  },
};

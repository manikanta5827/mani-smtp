// send.js
const nodemailer = require('nodemailer');

async function sendMail() {
  let transporter = nodemailer.createTransport({
    host: 'localhost',
    port: 2525,
    secure: false, // No SSL for local
    tls: {
      rejectUnauthorized: false
    }
  });

  let info = await transporter.sendMail({
    from: '"Alice" <alice@example.com>',
    to: "Bob <bob@example.com>",
    subject: "Hello from Local SMTP",
    text: "This is a test email from Nodemailer to our local SMTP server."
  });

  console.log("Message sent:", info.messageId);
}

sendMail().catch(console.error);
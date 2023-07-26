const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  /*  name: "hostgator", */
  host: process.env.EMAIL_HOST,
  port: 587,
  service: "hostgator",
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  debug: true, // show debug output
  /* logger: true  */ // log information in console
});

module.exports = transporter;

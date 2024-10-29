const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'itg.donotreply@gmail.com',
    pass: 'suntduvmuohcccwa'
  }
});

module.exports = { transporter };
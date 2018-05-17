const nodemailer = require('nodemailer');

let transporter = nodemailer.createTransport({
  host: 'gator4138.hostgator.com',
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: 'ship-it@wake.mx', // generated ethereal user
    pass: 'uzpLtL7aGU8J' // generated ethereal password
  }
});

async function sendMail(mailOptions) {
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Message sent: %s', info.messageId);
  } catch (e) {
    console.log(e);
  }
}

// setup email data with unicode symbols
let mailOptions = {
  from: '"Ship It" <ship-it@wake.mx>', // sender address
  to: '"Jonathan Ginsburg" <j@wake.guru>', // list of receivers
  subject: 'Hello ✔', // Subject line
  text: 'Hello world?', // plain text body
  html: '<b>Hello world?</b>' // html body
};

module.exports = sendMail;

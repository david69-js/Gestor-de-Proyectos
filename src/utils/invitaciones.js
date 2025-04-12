const nodemailer = require('nodemailer'); // Correct import

const transporter = nodemailer.createTransport({
  service: 'gmail', // Puede ser 'gmail' o cualquier otro proveedor de correo.
  auth: {
    user: process.env.GMAIL_USER,  // Tu correo de Gmail
    pass: process.env.GMAIL_PASS   // Tu contraseña de Gmail o una app password
  }
});

module.exports = { transporter };

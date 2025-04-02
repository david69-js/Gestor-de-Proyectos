const nodemailer = require("nodemailer");

async function enviarInvitacion(senderEmail, senderName, recipientEmail, codigo) {
    let transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: "tuemail@gmail.com",
            pass: "tupassword",
        },
    });

    let mailOptions = {
        from: `"${senderName}" <${senderEmail}>`,
        to: recipientEmail,
        subject: "Invitación a un Proyecto",
        html: `<p>${senderName} te ha invitado a unirte a un proyecto.</p>
               <p>Usa este código para confirmar tu invitación: <b>${codigo}</b></p>
               <a href="https://localhost/aceptar-invitacion?codigo=${codigo}">Aceptar Invitación</a>`,
    };

    await transporter.sendMail(mailOptions);
}

module.exports = { enviarInvitacion };
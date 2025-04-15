// controllers/invitations.controller.js
const jwt = require('jsonwebtoken');
const {transporter} = require('../utils/invitaciones');

async function createInvitation(req, res) {
  const { rol, id_organizacion, nombre_organizacion, id_proyecto, email_destino } = req.body;

  try {
    // Validaciones mínimas
    if (!rol || ![1, 2].includes(rol)) {
      return res.status(400).json({ message: 'Rol inválido para la invitación.' });
    }

    if (!id_organizacion) {
      return res.status(400).json({ message: 'La invitación debe tener id_organizacion.' });
    }

    if (!email_destino) {
      return res.status(400).json({ message: 'Se requiere un correo de destino.' });
    }

    // Crea el token
    const payload = {
      rol,
      id_organizacion,
      nombre_organizacion,
      id_proyecto: id_proyecto || null
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

    // Construir el enlace de invitación
    const url_invitation = `${process.env.BASE_URL}/invitacion/${token}`;

    // Enviar el correo de invitación
    const mailOptions = {
      from: process.env.GMAIL_USER,  // Correo de tu servidor (asegúrate de configurarlo en .env)
      to: email_destino,             // Correo de destino
      subject: 'Invitación a la Organización',
      html: `
        <h1>Invitación a la Organización</h1>
        <p>Has sido invitado a unirte a nuestra organización. Haz clic en el siguiente enlace para completar tu registro:</p>
        <a href="${url_invitation}">${url_invitation}</a>
        <p>Este enlace expirará en 7 días.</p>
      `
    };

    await transporter.sendMail(mailOptions);

    return res.status(201).json({
      message: 'Invitación enviada correctamente.',
      token_invitacion: token
    });

  } catch (error) {
    console.error('Error generando invitación:', error.message);
    return res.status(500).json({ message: 'Error del servidor al generar invitación.' });
  }
}

module.exports = { createInvitation };

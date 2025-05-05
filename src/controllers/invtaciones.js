// controllers/invitations.controller.js
const jwt = require('jsonwebtoken');
const {transporter} = require('../utils/invitaciones');
const { getConnection } = require('../config/db');

async function createInvitation(req, res) {
  const { rol, id_organizacion, nombre_organizacion, id_proyecto, email_destino } = req.body;
  const pool = await getConnection();
  let transaction = null;

  try {
    // Validaciones mínimas
    if (!rol || ![1, 2, 3].includes(rol)) {
      return res.status(400).json({ message: 'Rol inválido para la invitación.' });
    }

    if (!id_organizacion || !nombre_organizacion) {
      return res.status(400).json({ message: 'Se requieren id_organizacion y nombre_organizacion.' });
    }

    if (!email_destino) {
      return res.status(400).json({ message: 'Se requiere un correo de destino.' });
    }

      const userCheck = await pool.request()
      .input('email', email_destino)
      .query(`
        SELECT COUNT(*) AS count FROM Usuarios
        WHERE correo = @email;
      `);

    if (userCheck.recordset[0].count > 0) {
      return res.status(400).json({ message: 'El usuario ya es parte de una organización.' });
    }
    
    // Iniciar transacción
    transaction = pool.transaction();
    await transaction.begin();

    // Crea el token
    const payload = {
      rol,
      id_organizacion,
      nombre_organizacion,
      email_invitado: email_destino,
      id_proyecto: id_proyecto || null
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

    // Replace the current query execution with this parameterized version
   
    await transaction.request()
      .input('correo', email_destino)
      .input('proyecto_id', id_proyecto || null)
      .input('rol_id', rol)
      .input('codigo_confirmacion', token)
      .query(`
        INSERT INTO Invitaciones 
        (correo, proyecto_id, rol_id, estado, codigo_confirmacion)
        VALUES 
        (@correo, @proyecto_id, @rol_id, 'pendiente', @codigo_confirmacion)
      `);

    // Construir el enlace de invitación
    const url_invitation = `${process.env.BASE_URL_FRONT}/registro?invitacion=${token}`;

    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: email_destino,
      subject: `Invitación a ${nombre_organizacion}`,
      html: `
        <h1>Invitación a ${nombre_organizacion}</h1>
        <p>Has sido invitado a unirte a nuestra organización ${nombre_organizacion}. Haz clic en el siguiente enlace para completar tu registro:</p>
        <a href="${url_invitation}" 
           style="display:inline-block;padding:10px 20px;background-color:#007bff;color:#fff;text-decoration:none;border-radius:5px;">
          IR A LA INVITACIÓN
        </a>
        <p>Este enlace expirará en 7 días.</p>
      `
    };
    
    await transporter.sendMail(mailOptions);
    await transaction.commit();

    return res.status(201).json({
      message: 'Invitación enviada correctamente.',
      token_invitacion: token
    });

  } catch (error) {
    if (transaction) {
      await transaction.rollback();
    }
    console.error('Error generando invitación:', error.message);
    return res.status(500).json({ message: 'Error del servidor al generar invitación.' });
  }
}

module.exports = { createInvitation };

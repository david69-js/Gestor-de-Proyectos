const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getConnection } = require('../config/db');

async function registerUser(userData) {
  const {
    nombre,
    correo,
    contrasena,
    imagen_perfil,
    numero_telefono,
    fecha_nacimiento,
    token,
    nombre_organizacion
  } = userData;

  const pool = await getConnection();
  const transaction = pool.transaction();

  try {
    await transaction.begin();

    // Verificar si el correo ya está registrado
    const userExists = await transaction.request()
      .input('correo', correo)
      .execute('sp_CompararContrasena');

    if (userExists.recordset.length > 0) {
      throw new Error('El usuario ya existe');
    }

    // Hashear la contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(contrasena, salt);

    // Preparar variables
    let id_organizacion = null;
    let id_proyecto = null;
    let rol = 1;

    if (token) {
      try {
        const invitacion = jwt.verify(token, process.env.JWT_SECRET);
        rol = invitacion.rol;
        id_organizacion = invitacion.id_organizacion || null;
        id_proyecto = invitacion.id_proyecto || null;
      } catch (err) {
        throw new Error('Token de invitación inválido o expirado');
      }
    }

    // Verificar rol
    const rolResult = await transaction.request()
      .input('rol_id', rol)
      .query('SELECT id FROM Roles WHERE id = @rol_id');

    if (rolResult.recordset.length === 0) {
      throw new Error('El rol especificado no existe en la base de datos');
    }

    const id_rol = rolResult.recordset[0].id;

    // Registrar usuario
    const result = await transaction.request()
      .input('nombre', nombre)
      .input('correo', correo)
      .input('contrasena', hashedPassword)
      .input('imagen_perfil', imagen_perfil || null)
      .input('numero_telefono', numero_telefono || null)
      .input('fecha_nacimiento', fecha_nacimiento || null)
      .input('nombre_organizacion', nombre_organizacion || null)
      .input('id_rol', id_rol)
      .input('id_organizacion', id_organizacion)
      .input('id_proyecto', id_proyecto)
      .input('codigo_invitacion', token || null )
      .execute('sp_RegistrarUsuarioConInvitacion');

    const userId = result.recordset?.[0]?.usuario_id;
    const organizacionId = result.recordset?.[0]?.organizacion_id;

    if (!userId) {
      throw new Error('El registro del usuario falló');
    }

    await transaction.commit();

    return {
      id_usuario: userId,
      nombre,
      correo,
      rol,
      id_organizacion: organizacionId
    };

  } catch (error) {
    await transaction.rollback();
    console.error('Error registrando usuario:', error.message);
    throw error;
  }
}

async function loginUser(userData) {
  const { correo, contrasena } = userData;
  const pool = await getConnection();
  // No necesitamos transacción para login ya que es solo lectura
  
  try {
    const result = await pool.request()
      .input('correo', correo)
      .execute('sp_CompararContrasena');

    if (result.recordset.length === 0) {
      throw new Error('Invalid credentials');
    }
    
    const user = result.recordset[0];
    const validPassword = await bcrypt.compare(contrasena, user.contrasena);
    
    if (!validPassword) {
      throw new Error('Invalid credentials');
    }

    const userInfo = await pool.request()
      .input('correo', correo)
      .execute('sp_ObtenerInformacionUsuario');

    const userDetails = userInfo.recordset[0];

    const token = jwt.sign(
      { 
        id: userDetails.id,
        organizacion: userDetails.nombre_organizacion,
        id_organizacion: userDetails.id_organizacion,
        rol: userDetails.nombre_rol
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    return {
      user: userDetails,
      token
    };
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
}

module.exports = {
  registerUser,
  loginUser,
};
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
      token, // opcional
      nombre_organizacion // opcional (solo si no hay token, o si es admin)
    } = userData;
  
    const pool = await getConnection();
  
    try {
      // 1. Verificar si el correo ya existe
      const userExists = await pool.request()
        .input('correo', correo)
        .query('SELECT 1 FROM Usuarios WHERE correo = @correo');
  
      if (userExists.recordset.length > 0) {
        throw new Error('El usuario ya existe');
      }
  
      // 2. Hashear la contraseña
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(contrasena, salt);
  
      // 3. Variables que se ajustan según el token
      let rol = 'admin';
      let id_organizacion = null;
      let id_proyecto = null;
  
      if (token) {
        try {
          const invitacion = jwt.verify(token, process.env.JWT_SECRET);
  
          rol = invitacion.rol || 'colaborador';
          id_organizacion = invitacion.id_organizacion || null;
          id_proyecto = invitacion.id_proyecto || null;
        } catch (err) {
          throw new Error('Token de invitación inválido o expirado');
        }
      }
  
      // 4. Llamar procedimiento almacenado actualizado
      const result = await pool.request()
        .input('nombre', nombre)
        .input('correo', correo)
        .input('contrasena', hashedPassword)
        .input('imagen_perfil', imagen_perfil || null)
        .input('numero_telefono', numero_telefono || null)
        .input('fecha_nacimiento', fecha_nacimiento || null)
        .input('rol', rol)
        .input('id_organizacion', id_organizacion)
        .input('id_proyecto', id_proyecto)
        .input('nombre_organizacion', nombre_organizacion || null)
        .execute('sp_RegistrarUsuarioConInvitacion');
  
      const userId = result.recordset?.[0]?.usuario_id;
      const organizacionId = result.recordset?.[0]?.organizacion_id;
  
      if (!userId) {
        throw new Error('El registro del usuario falló');
      }
  
      return {
        id_usuario: userId,
        nombre,
        correo,
        rol,
        id_organizacion: organizacionId
      };
  
    } catch (error) {
      console.error('Error registrando usuario:', error.message);
      throw error;
    }
  }

  
async function loginUser(userData) {
    const { correo, contrasena } = userData;
    try {
        const pool = await getConnection();

        // Get user
        const result = await pool.request()
            .input('correo', correo)
            .query(`SELECT 
                      u.*, 
                      uo.id_organizacion
                  FROM Usuarios u
                  LEFT JOIN Usuarios_Organizaciones uo ON u.id = uo.id_usuario
                  WHERE u.correo = @correo;
                  `);

        if (result.recordset.length === 0) {
            throw new Error('Invalid credentials');
        }

        const user = result.recordset[0];

        // Verify password
        const validPassword = await bcrypt.compare(contrasena, user.contrasena);
        if (!validPassword) {
            throw new Error('Invalid credentials');
        }

        // Get user roles
        const roles = await pool.request()
            .input('usuario_id', user.id)
            .query(`
                SELECT 
                uo.rol_organizacion
                FROM Organizaciones o
                JOIN Usuarios_Organizaciones uo ON o.id = uo.id_organizacion
                JOIN Usuarios u ON @usuario_id = uo.id_usuario
                ORDER BY o.nombre, u.nombre;
            `);

        // Create token
        const token = jwt.sign(
            { 
                id: user.id,
                roles: roles.recordset.map(r => r.rol_organizacion)
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        delete user.contrasena;
        return {
            user,
            token,
            roles: roles.recordset.map(r => r.rol_organizacion)
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
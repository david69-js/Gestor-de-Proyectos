import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../config/db.js';

// User Controllers
export const getUsuarios = async (req, res) => {
    try {
        const pool = await db.getConnection();
        const result = await pool.request().execute('ObtenerUsuarios');
        res.json(result.recordset);
    } catch (error) {
        console.error('Error getting users:', error);
        res.status(500).json({ error: 'Error getting users' });
    }
};

export const registerUsuario = async (req, res) => {
    const { nombre, apellido, correo, contrasena, edad, sexo } = req.body;
    try {
        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(contrasena, salt);

        const pool = await db.getConnection();
        const result = await pool.request()
            .input('nombre', sql.VarChar, nombre)
            .input('apellido', sql.VarChar, apellido)
            .input('correo', sql.VarChar, correo)
            .input('contrasena', sql.VarChar, hashedPassword)
            .input('edad', sql.Int, edad)
            .input('sexo', sql.VarChar, sexo)
            .execute('CrearUsuario');

        const user = result.recordset[0];
        delete user.contrasena;
        res.status(201).json(user);
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ error: 'Error registering user' });
    }
};

export const loginUsuario = async (req, res) => {
    const { correo, contrasena } = req.body;
    try {
        const pool = await db.getConnection();
        const result = await pool.request()
            .input('correo', sql.VarChar, correo)
            .query('SELECT * FROM Usuarios WHERE correo = @correo');

        const user = result.recordset[0];
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Verify password
        const validPassword = await bcrypt.compare(contrasena, user.contrasena);
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Create token
        const token = jwt.sign(
            { id: user.id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        delete user.contrasena;
        res.json({ user, token });
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ error: 'Error logging in' });
    }
};

export const getUsuarioPorToken = async (req, res) => {
    try {
        const pool = await db.getConnection();
        const result = await pool.request()
            .input('id', sql.Int, req.user.id)
            .execute('ObtenerUsuario');

        const user = result.recordset[0];
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        console.error('Error getting profile:', error);
        res.status(500).json({ error: 'Error getting profile' });
    }
};

export const updateUsuario = async (req, res) => {
    const { nombre, apellido, correo, edad, sexo } = req.body;
    try {
        const pool = await db.getConnection();
        const result = await pool.request()
            .input('id', sql.Int, req.params.id)
            .input('nombre', sql.VarChar, nombre)
            .input('apellido', sql.VarChar, apellido)
            .input('correo', sql.VarChar, correo)
            .input('edad', sql.Int, edad)
            .input('sexo', sql.VarChar, sexo)
            .execute('ActualizarUsuario');

        const user = result.recordset[0];
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        delete user.contrasena;
        res.json(user);
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ error: 'Error updating user' });
    }
};

export const deleteUsuario = async (req, res) => {
    try {
        const pool = await db.getConnection();
        await pool.request()
            .input('id', sql.Int, req.params.id)
            .execute('EliminarUsuario');

        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: 'Error deleting user' });
    }
};

// Role Controllers
export const getRoles = async (req, res) => {
    try {
        const pool = await db.getConnection();
        const result = await pool.request().query('SELECT * FROM Roles');
        res.json(result.recordset);
    } catch (error) {
        console.error('Error getting roles:', error);
        res.status(500).json({ error: 'Error getting roles' });
    }
};

export const getRolPorId = async (req, res) => {
    try {
        const pool = await db.getConnection();
        const result = await pool.request()
            .input('id', sql.Int, req.params.id)
            .query('SELECT * FROM Roles WHERE id = @id');

        const role = result.recordset[0];
        if (!role) {
            return res.status(404).json({ error: 'Role not found' });
        }
        res.json(role);
    } catch (error) {
        console.error('Error getting role:', error);
        res.status(500).json({ error: 'Error getting role' });
    }
};

export const createRol = async (req, res) => {
    const { nombre_rol } = req.body;
    try {
        const pool = await db.getConnection();
        const result = await pool.request()
            .input('nombre_rol', sql.VarChar, nombre_rol)
            .execute('CrearRol');
        res.status(201).json(result.recordset[0]);
    } catch (error) {
        console.error('Error creating role:', error);
        res.status(500).json({ error: 'Error creating role' });
    }
};

export const updateRol = async (req, res) => {
    const { nombre_rol } = req.body;
    try {
        const pool = await db.getConnection();
        const result = await pool.request()
            .input('id', sql.Int, req.params.id)
            .input('nombre_rol', sql.VarChar, nombre_rol)
            .query('UPDATE Roles SET nombre_rol = @nombre_rol WHERE id = @id; SELECT * FROM Roles WHERE id = @id');

        const role = result.recordset[0];
        if (!role) {
            return res.status(404).json({ error: 'Role not found' });
        }
        res.json(role);
    } catch (error) {
        console.error('Error updating role:', error);
        res.status(500).json({ error: 'Error updating role' });
    }
};

export const deleteRol = async (req, res) => {
    try {
        const pool = await db.getConnection();
        await pool.request()
            .input('id', sql.Int, req.params.id)
            .query('DELETE FROM Roles WHERE id = @id');

        res.json({ message: 'Role deleted successfully' });
    } catch (error) {
        console.error('Error deleting role:', error);
        res.status(500).json({ error: 'Error deleting role' });
    }
};

// Permission Controllers
export const getPermisos = async (req, res) => {
    try {
        const permisos = await db.query('SELECT * FROM permisos');
        res.json(permisos);
    } catch (error) {
        console.error('Error getting permissions:', error);
        res.status(500).json({ error: 'Error getting permissions' });
    }
};

export const getPermisoPorId = async (req, res) => {
    try {
        const permiso = await db.query('SELECT * FROM permisos WHERE id = $1', [req.params.id]);
        if (!permiso) {
            return res.status(404).json({ error: 'Permission not found' });
        }
        res.json(permiso);
    } catch (error) {
        console.error('Error getting permission:', error);
        res.status(500).json({ error: 'Error getting permission' });
    }
};

export const createPermiso = async (req, res) => {
    const { nombre_permiso } = req.body;
    try {
        const permiso = await db.query('INSERT INTO permisos (nombre_permiso) VALUES ($1) RETURNING *', [nombre_permiso]);
        res.status(201).json(permiso);
    } catch (error) {
        console.error('Error creating permission:', error);
        res.status(500).json({ error: 'Error creating permission' });
    }
};

export const updatePermiso = async (req, res) => {
    const { nombre_permiso } = req.body;
    try {
        const permiso = await db.query('UPDATE permisos SET nombre_permiso = $1 WHERE id = $2 RETURNING *', [nombre_permiso, req.params.id]);
        if (!permiso) {
            return res.status(404).json({ error: 'Permission not found' });
        }
        res.json(permiso);
    } catch (error) {
        console.error('Error updating permission:', error);
        res.status(500).json({ error: 'Error updating permission' });
    }
};

export const deletePermiso = async (req, res) => {
    try {
        const permiso = await db.query('DELETE FROM permisos WHERE id = $1 RETURNING *', [req.params.id]);
        if (!permiso) {
            return res.status(404).json({ error: 'Permission not found' });
        }
        res.json({ message: 'Permission deleted successfully' });
    } catch (error) {
        console.error('Error deleting permission:', error);
        res.status(500).json({ error: 'Error deleting permission' });
    }
};

// Assignment Controllers
export const asignarPermisoARol = async (req, res) => {
    const { rol_id, permiso_id } = req.body;
    try {
        const assignment = await db.query('INSERT INTO rol_permiso (rol_id, permiso_id) VALUES ($1, $2) RETURNING *', [rol_id, permiso_id]);
        res.status(201).json(assignment);
    } catch (error) {
        console.error('Error assigning permission to role:', error);
        res.status(500).json({ error: 'Error assigning permission to role' });
    }
};

export const asignarRolAUsuario = async (req, res) => {
    const { usuario_id, rol_id } = req.body;
    try {
        const assignment = await db.query('INSERT INTO usuario_rol (usuario_id, rol_id) VALUES ($1, $2) RETURNING *', [usuario_id, rol_id]);
        res.status(201).json(assignment);
    } catch (error) {
        console.error('Error assigning role to user:', error);
        res.status(500).json({ error: 'Error assigning role to user' });
    }
};
const jwt = require('jsonwebtoken');
const { getConnection } = require('../config/db');

// Helper function to handle errors
const handleError = (res, error, message) => {
    console.error(message, error);
    res.status(500).json({ error: message });
};

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Invalid token' });
    }
};

// Middleware to check user roles
const checkRole = (requiredRoles) => {
    return async (req, res, next) => {
        try {
            const pool = await getConnection();
            const result = await pool.request()
                .input('usuario_id', req.user.id)
                .query(`
                    SELECT r.nombre_rol
                    FROM Roles r
                    INNER JOIN Usuarios_Roles ur ON r.id = ur.rol_id
                    WHERE ur.usuario_id = @usuario_id
                `);

            const userRoles = result.recordset.map(r => r.nombre_rol);
            const hasRequiredRole = requiredRoles.some(role => userRoles.includes(role));

            if (!hasRequiredRole) {
                return res.status(403).json({ error: 'Insufficient permissions' });
            }

            next();
        } catch (error) {
            handleError(res, error, 'Error checking user roles');
        }
    };
};

// Middleware to check project participation
const checkProjectParticipation = async (req, res, next) => {
    try {
        const pool = await getConnection();
        const result = await pool.request()
            .input('usuario_id', req.user.id)
            .input('proyecto_id', req.params.id)
            .query(`
                SELECT 1
                FROM Participantes_Proyecto
                WHERE usuario_id = @usuario_id AND proyecto_id = @proyecto_id
            `);

        if (result.recordset.length === 0) {
            return res.status(403).json({ error: 'User is not a participant in this project' });
        }

        next();
    } catch (error) {
        handleError(res, error, 'Error checking project participation');
    }
};

// Middleware to check team membership
const checkTeamMembership = async (req, res, next) => {
    try {
        const pool = await getConnection();
        const result = await pool.request()
            .input('usuario_id', req.user.id)
            .input('equipo_id', req.params.id)
            .query(`
                SELECT 1
                FROM Miembros_Equipo
                WHERE usuario_id = @usuario_id AND equipo_id = @equipo_id
            `);

        if (result.recordset.length === 0) {
            return res.status(403).json({ error: 'User is not a member of this team' });
        }

        next();
    } catch (error) {
        handleError(res, error, 'Error checking team membership');
    }
};

// Middleware to check task assignment
const checkTaskAssignment = async (req, res, next) => {
    try {
        const pool = await getConnection();
        const result = await pool.request()
            .input('usuario_id', req.user.id)
            .input('tarea_id', req.params.id)
            .query(`
                SELECT 1
                FROM Asignaciones_Tarea
                WHERE usuario_id = @usuario_id AND tarea_id = @tarea_id
            `);

        if (result.recordset.length === 0) {
            return res.status(403).json({ error: 'User is not assigned to this task' });
        }

        next();
    } catch (error) {
        handleError(res, error, 'Error checking task assignment');
    }
};

module.exports = {
    verifyToken,
    checkRole,
    checkProjectParticipation,
    checkTeamMembership,
    checkTaskAssignment
};
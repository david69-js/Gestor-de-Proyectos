## usuarios, roles y organizaciones
SELECT 
    u.id,
    u.nombre,
    u.correo,
    uo.rol_organizacion AS rol,
    uo.organizacion_id AS id_organizacion
FROM Usuarios u
JOIN Usuarios_Organizaciones uo ON u.id = uo.usuario_id;


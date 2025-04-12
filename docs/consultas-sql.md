## usuarios, roles y organizaciones
SELECT 
    u.id,
    u.nombre,
    u.correo,
    uo.rol_organizacion AS rol,
    uo.id_organizacion AS id_organizacion
FROM Usuarios u
JOIN Usuarios_Organizaciones uo ON u.id = uo.id_usuario;

## Muestra a todos los usuarios que pertenecen a una organizacion
SELECT 
    o.nombre AS nombre_organizacion,
    u.id AS id_usuario,
    u.nombre AS nombre_usuario,
    u.correo,
    u.numero_telefono,
    u.fecha_nacimiento,
    u.fecha_registro,
    u.imagen_perfil,
    uo.rol_organizacion
FROM Organizaciones o
JOIN Usuarios_Organizaciones uo ON o.id = uo.id_organizacion
JOIN Usuarios u ON u.id = uo.id_usuario
ORDER BY o.nombre, u.nombre;


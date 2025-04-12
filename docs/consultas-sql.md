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

## Muestra los proyectos de un usuario
SELECT p.id, p.nombre_proyecto, p.descripcion, p.fecha_inicio, p.fecha_fin
FROM Proyectos p
JOIN Proyectos_Usuarios pu ON p.id = pu.proyecto_id
WHERE pu.usuario_id = 3025;


## Muestra los proyectos de una organizacion, si el usuarios pertenece a la organizacion
SELECT p.id, 
       p.nombre_proyecto, 
       p.descripcion, 
       p.fecha_inicio, 
       p.fecha_fin, 
       pu.usuario_id, 
       o.nombre AS nombre_organizacion
FROM Proyectos p
JOIN Proyectos_Usuarios pu ON p.id = pu.proyecto_id
JOIN Usuarios_Organizaciones uo ON pu.usuario_id = uo.id_usuario
JOIN Usuarios u ON uo.id_usuario = u.id
JOIN Organizaciones o ON uo.id_organizacion = o.id
WHERE uo.id_organizacion = (SELECT id_organizacion FROM Usuarios_Organizaciones WHERE usuario_id = 3025);
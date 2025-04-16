--Creacion de base de datos
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'GestionProyectos')
BEGIN
    CREATE DATABASE GestionProyectos;
END

Use GestionProyectos


-- Crear la tabla Usuarios solo si no existe
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name = 'Usuarios' AND xtype = 'U')
BEGIN
    CREATE TABLE Usuarios (
        id INT PRIMARY KEY IDENTITY(1,1),
        nombre VARCHAR(100) NOT NULL,
        correo VARCHAR(100) UNIQUE NOT NULL,
        contrasena VARCHAR(255) NOT NULL,
        imagen_perfil VARCHAR(255), -- opcional
        numero_telefono VARCHAR(20), -- opcional
        fecha_nacimiento DATE, -- opcional
        fecha_registro DATETIME DEFAULT GETDATE()
    );
END

-- Crear la tabla Roles solo si no existe
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name = 'Roles' AND xtype = 'U')
BEGIN
    CREATE TABLE Roles (
        id INT PRIMARY KEY IDENTITY(1,1),
        nombre_rol VARCHAR(50)
    );
END;

-- Crear la tabla Permisos solo si no existe
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name = 'Permisos' AND xtype = 'U')
BEGIN
    CREATE TABLE Permisos (
        id INT PRIMARY KEY IDENTITY(1,1),
        rol_id INT FOREIGN KEY REFERENCES Roles(id),
        permiso VARCHAR(255)
    );
END;

-- Crear la tabla Proyectos solo si no existe
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name = 'Proyectos' AND xtype = 'U')
BEGIN
    CREATE TABLE Proyectos (
        id INT PRIMARY KEY IDENTITY(1,1),
        nombre_proyecto VARCHAR(255),
        descripcion VARCHAR(MAX),
        fecha_inicio DATETIME DEFAULT GETDATE(),
        fecha_fin DATETIME
    );
END;

-- Crear la tabla Estados_Tarea solo si no existe
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name = 'Estados_Tarea' AND xtype = 'U')
BEGIN
    CREATE TABLE Estados_Tarea (
        id INT PRIMARY KEY IDENTITY(1,1),
        estado VARCHAR(50)
    );
END;

-- Crear la tabla Tareas solo si no existe
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name = 'Tareas' AND xtype = 'U')
BEGIN
    CREATE TABLE Tareas (
        id INT PRIMARY KEY IDENTITY(1,1),
        proyecto_id INT FOREIGN KEY REFERENCES Proyectos(id) ON DELETE CASCADE,
        organizacion_id INT FOREIGN KEY REFERENCES Organizaciones(id) ON DELETE CASCADE,
        nombre_tarea VARCHAR(255),
        descripcion VARCHAR(MAX),
        fecha_creacion DATETIME DEFAULT GETDATE(),
        fecha_limite DATETIME,
        estado_id INT FOREIGN KEY REFERENCES Estados_Tarea(id)
    );
END;


IF NOT EXISTS (SELECT * FROM sysobjects WHERE name = 'Comentarios' AND xtype = 'U')
BEGIN
    CREATE TABLE Comentarios (
        id INT PRIMARY KEY IDENTITY(1,1),
        tarea_id INT FOREIGN KEY REFERENCES Tareas(id) ON DELETE CASCADE,
        usuario_id INT FOREIGN KEY REFERENCES Usuarios(id_usuario) ON DELETE CASCADE,
        comentario VARCHAR(MAX),
        fecha_comentario DATETIME DEFAULT GETDATE()
    );
END


-- Crear la tabla Archivos solo si no existe
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name = 'Archivos' AND xtype = 'U')
BEGIN
    CREATE TABLE Archivos (
        id INT PRIMARY KEY IDENTITY(1,1),
        proyecto_id INT FOREIGN KEY REFERENCES Proyectos(id),
        nombre_archivo VARCHAR(255),
        ruta_archivo VARCHAR(255),
        fecha_subida DATETIME DEFAULT GETDATE()
    );
END;

-- Crear la tabla Eventos_Calendar solo si no existe
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name = 'Eventos_Calendar' AND xtype = 'U')
BEGIN
    CREATE TABLE Eventos_Calendar (
        id INT PRIMARY KEY IDENTITY(1,1),
        nombre_evento VARCHAR(255),
        descripcion VARCHAR(MAX),
        fecha_evento DATETIME,
        usuario_id INT FOREIGN KEY REFERENCES Usuarios(id_usuario) ON DELETE CASCADE
    );
END


-- Crear la tabla Etiquetas solo si no existe
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name = 'Etiquetas' AND xtype = 'U')
BEGIN
    CREATE TABLE Etiquetas (
        id INT PRIMARY KEY IDENTITY(1,1),
        nombre_etiqueta VARCHAR(50)
    );
END;

-- Crear la tabla Usuarios_Tareas solo si no existe
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name = 'Usuarios_Tareas' AND xtype = 'U')
BEGIN
    CREATE TABLE Usuarios_Tareas (
        id INT PRIMARY KEY IDENTITY(1,1),
        usuario_id INT FOREIGN KEY REFERENCES Usuarios(id_usuario) ON DELETE CASCADE,
        tarea_id INT FOREIGN KEY REFERENCES Tareas(id) ON DELETE CASCADE,
        fecha_asignacion DATETIME DEFAULT GETDATE()
    );
END

-- Crear la tabla Etiquetas_Tareas solo si no existe
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name = 'Etiquetas_Tareas' AND xtype = 'U')
BEGIN
    CREATE TABLE Etiquetas_Tareas (
        tarea_id INT NOT NULL,
        etiqueta_id INT NOT NULL,
        PRIMARY KEY (tarea_id, etiqueta_id),
        FOREIGN KEY (tarea_id) REFERENCES Tareas(id) ON DELETE CASCADE,
        FOREIGN KEY (etiqueta_id) REFERENCES Etiquetas(id) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (SELECT * FROM sysobjects WHERE name = 'Invitaciones' AND xtype = 'U')
BEGIN
    CREATE TABLE Invitaciones (
        id INT PRIMARY KEY IDENTITY(1,1),
        correo VARCHAR(255) NOT NULL,  -- Email del usuario invitado
        proyecto_id INT NULL,  -- Puede ser NULL si es una invitación a un equipo
        rol_id INT NOT NULL,  -- Rol asignado al usuario al aceptar la invitación
        estado VARCHAR(20) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'aceptada', 'rechazada')),
        codigo_confirmacion VARCHAR(50) NOT NULL,  -- Código único para la invitación
        fecha_creacion DATETIME DEFAULT GETDATE(),
        FOREIGN KEY (proyecto_id) REFERENCES Proyectos(id) ON DELETE CASCADE,
        FOREIGN KEY (rol_id) REFERENCES Roles(id) ON DELETE CASCADE
    );
END;

-- Ensure all columns are correctly defined in their respective tables
-- Example table definition for Notificaciones
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name = 'Notificaciones' AND xtype = 'U')
BEGIN
    CREATE TABLE Notificaciones (
        id INT PRIMARY KEY IDENTITY(1,1),
        usuario_id INT FOREIGN KEY REFERENCES Usuarios(id) ON DELETE CASCADE,
        mensaje VARCHAR(255),
        fecha_notificacion DATETIME DEFAULT GETDATE(),
        leida BIT DEFAULT 0 -- Ensure 'leida' column is defined
    );
END;
GO


IF NOT EXISTS (SELECT * FROM sysobjects WHERE name = 'Usuarios_Proyectos' AND xtype = 'U')
BEGIN
CREATE TABLE Usuarios_Proyectos (
    id_usuario INT NOT NULL,
    id_proyecto INT NOT NULL,
    fecha_asignacion DATETIME DEFAULT GETDATE(),

    CONSTRAINT PK_Usuarios_Proyectos PRIMARY KEY (id_usuario, id_proyecto),

    CONSTRAINT FK_Usuarios_Proyectos_Usuario FOREIGN KEY (id_usuario)
        REFERENCES Usuarios(id)
        ON DELETE CASCADE,

    CONSTRAINT FK_Usuarios_Proyectos_Proyecto FOREIGN KEY (id_proyecto)
        REFERENCES Proyectos(id)
        ON DELETE CASCADE
);
END;

IF NOT EXISTS (SELECT * FROM sysobjects WHERE name = 'Organizaciones' AND xtype = 'U')
BEGIN
CREATE TABLE Organizaciones (
    id INT PRIMARY KEY IDENTITY(1,1),
    nombre VARCHAR(255) NOT NULL,
    fecha_creacion DATETIME DEFAULT GETDATE()
);
END;


IF NOT EXISTS (SELECT * FROM sysobjects WHERE name = 'Usuarios_Organizaciones' AND xtype = 'U')
BEGIN
CREATE TABLE Usuarios_Organizaciones (
     id INT PRIMARY KEY IDENTITY(1,1),
    id_usuario INT NOT NULL,
    id_organizacion INT NOT NULL,
    id_rol INT NOT NULL, -- Aquí el ID del rol en lugar de texto
    fecha_union DATETIME DEFAULT GETDATE(),

    CONSTRAINT FK_Usuarios_Organizaciones_Usuario FOREIGN KEY (id_usuario)
        REFERENCES Usuarios(id)
        ON DELETE CASCADE,

    CONSTRAINT FK_Usuarios_Organizaciones_Organizacion FOREIGN KEY (id_organizacion)
        REFERENCES Organizaciones(id)
        ON DELETE CASCADE,

    CONSTRAINT FK_Usuarios_Organizaciones_Rol FOREIGN KEY (id_rol)
        REFERENCES Roles(id)
);
END;

IF NOT EXISTS (SELECT * FROM sysobjects WHERE name = 'Roles_Permisos' AND xtype = 'U')
BEGIN
    CREATE TABLE Roles_Permisos (
        id INT PRIMARY KEY IDENTITY(1,1),
        id_rol INT NOT NULL,
        id_permiso INT NOT NULL,
        CONSTRAINT FK_Roles_Permisos_Rol FOREIGN KEY (id_rol) REFERENCES Roles(id) ON DELETE CASCADE,
        CONSTRAINT FK_Roles_Permisos_Permiso FOREIGN KEY (id_permiso) REFERENCES Permisos(id) ON DELETE CASCADE,
        CONSTRAINT UNIQUE_Rol_Permiso UNIQUE (id_rol, id_permiso)
    );
END;



IF OBJECT_ID('sp_SetupRolesYPermisos', 'P') IS NOT NULL
    DROP PROCEDURE sp_SetupRolesYPermisos;
GO
CREATE PROCEDURE sp_SetupRolesYPermisos
AS
BEGIN
    SET NOCOUNT ON;

    -- Insertar Roles si no existen
    IF NOT EXISTS (SELECT 1 FROM Roles WHERE nombre_rol = 'admin')
        INSERT INTO Roles (nombre_rol) VALUES ('admin');

    IF NOT EXISTS (SELECT 1 FROM Roles WHERE nombre_rol = 'colaborador')
        INSERT INTO Roles (nombre_rol) VALUES ('colaborador');

    IF NOT EXISTS (SELECT 1 FROM Roles WHERE nombre_rol = 'cliente')
        INSERT INTO Roles (nombre_rol) VALUES ('cliente');

    -- Insertar Permisos si no existen
    IF NOT EXISTS (SELECT 1 FROM Permisos WHERE permiso = 'lectura')
        INSERT INTO Permisos (permiso) VALUES ('lectura');

    IF NOT EXISTS (SELECT 1 FROM Permisos WHERE permiso = 'escritura')
        INSERT INTO Permisos (permiso) VALUES ('escritura');

    IF NOT EXISTS (SELECT 1 FROM Permisos WHERE permiso = 'eliminacion')
        INSERT INTO Permisos (permiso) VALUES ('eliminacion');

    -- Asignar Permisos a Roles
    -- Asignar permisos al rol de 'admin' (todos los permisos)
    DECLARE @id_admin INT = (SELECT id FROM Roles WHERE nombre_rol = 'admin');
    DECLARE @id_lectura INT = (SELECT id FROM Permisos WHERE permiso = 'lectura');
    DECLARE @id_escritura INT = (SELECT id FROM Permisos WHERE permiso = 'escritura');
    DECLARE @id_eliminacion INT = (SELECT id FROM Permisos WHERE permiso = 'eliminacion');
    
    -- Asignar todos los permisos al rol de 'admin'
    IF NOT EXISTS (SELECT 1 FROM Roles_Permisos WHERE id_rol = @id_admin AND id_permiso = @id_lectura)
        INSERT INTO Roles_Permisos (id_rol, id_permiso) VALUES (@id_admin, @id_lectura);
    
    IF NOT EXISTS (SELECT 1 FROM Roles_Permisos WHERE id_rol = @id_admin AND id_permiso = @id_escritura)
        INSERT INTO Roles_Permisos (id_rol, id_permiso) VALUES (@id_admin, @id_escritura);
    
    IF NOT EXISTS (SELECT 1 FROM Roles_Permisos WHERE id_rol = @id_admin AND id_permiso = @id_eliminacion)
        INSERT INTO Roles_Permisos (id_rol, id_permiso) VALUES (@id_admin, @id_eliminacion);

    -- Asignar permisos al rol de 'colaborador' (lectura y escritura)
    DECLARE @id_colaborador INT = (SELECT id FROM Roles WHERE nombre_rol = 'colaborador');
    
    IF NOT EXISTS (SELECT 1 FROM Roles_Permisos WHERE id_rol = @id_colaborador AND id_permiso = @id_lectura)
        INSERT INTO Roles_Permisos (id_rol, id_permiso) VALUES (@id_colaborador, @id_lectura);
    
    IF NOT EXISTS (SELECT 1 FROM Roles_Permisos WHERE id_rol = @id_colaborador AND id_permiso = @id_escritura)
        INSERT INTO Roles_Permisos (id_rol, id_permiso) VALUES (@id_colaborador, @id_escritura);

    -- Asignar permisos al rol de 'cliente' (solo lectura)
    DECLARE @id_cliente INT = (SELECT id FROM Roles WHERE nombre_rol = 'cliente');
    
    IF NOT EXISTS (SELECT 1 FROM Roles_Permisos WHERE id_rol = @id_cliente AND id_permiso = @id_lectura)
        INSERT INTO Roles_Permisos (id_rol, id_permiso) VALUES (@id_cliente, @id_lectura);
    
END;
GO

-- Ejecutar el procedimiento
EXEC sp_SetupRolesYPermisos;

DROP PROCEDURE IF EXISTS sp_CrearOrganizacion;
GO
CREATE PROCEDURE sp_CrearOrganizacion
  @nombreOrganizacion NVARCHAR(255)
AS
BEGIN
  SET NOCOUNT ON;
  INSERT INTO Organizaciones (nombre)
  VALUES (@nombreOrganizacion);

  SELECT SCOPE_IDENTITY() AS id_organizacion;
END
GO


DROP PROCEDURE IF EXISTS sp_AsignarUsuarioAOrganizacion;
GO
CREATE PROCEDURE sp_AsignarUsuarioAOrganizacion
  @id_usuario INT,
  @id_organizacion INT,
  @id_rol INT
AS
BEGIN
  SET NOCOUNT ON;

  -- Ensure the column names match the table definition
  INSERT INTO Usuarios_Organizaciones (id, id_organizacion, id_rol)
  VALUES (@id_usuario, @id_organizacion, @id_rol);
END
GO

DROP PROCEDURE IF EXISTS sp_AsignarUsuarioAProyecto;
GO
CREATE PROCEDURE sp_AsignarUsuarioAProyecto
  @id_usuario INT,
  @id_proyecto INT
AS
BEGIN
  SET NOCOUNT ON;

  INSERT INTO Usuarios_Proyectos (id_usuario, id_proyecto)
  VALUES (@id_usuario, @id_proyecto);
END
GO


DROP PROCEDURE IF EXISTS sp_RegistrarUsuarioConInvitacion;
GO

IF OBJECT_ID('sp_RegistrarUsuarioConInvitacion', 'P') IS NOT NULL
    DROP PROCEDURE sp_RegistrarUsuarioConInvitacion;
GO

CREATE PROCEDURE sp_RegistrarUsuarioConInvitacion
    @nombre NVARCHAR(100),
    @correo NVARCHAR(100),
    @contrasena NVARCHAR(255),
    @imagen_perfil NVARCHAR(255) = NULL,
    @numero_telefono NVARCHAR(20) = NULL,
    @fecha_nacimiento DATE = NULL,
    @nombre_organizacion NVARCHAR(100),
    @id_rol INT,
    @id_organizacion INT = NULL,
    @id_proyecto INT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    -- Validar que el correo no exista
    IF EXISTS (SELECT 1 FROM Usuarios WHERE correo = @correo)
    BEGIN
        THROW 50001, 'El correo ya está registrado.', 1;
    END

    -- Validar que el rol exista
    DECLARE @rol_nombre NVARCHAR(50);
    SELECT @rol_nombre = nombre_rol FROM Roles WHERE id = @id_rol;

    IF @rol_nombre IS NULL
    BEGIN
        THROW 50002, 'El rol especificado no existe.', 1;
    END

    -- Insertar usuario
    INSERT INTO Usuarios (nombre, correo, contrasena, imagen_perfil, numero_telefono, fecha_nacimiento)
    VALUES (@nombre, @correo, @contrasena, @imagen_perfil, @numero_telefono, @fecha_nacimiento);

    DECLARE @id_usuario INT = SCOPE_IDENTITY();

    -- Si es admin, crear nueva organización
    IF @rol_nombre = 'admin'
    BEGIN
        INSERT INTO Organizaciones (nombre)
        VALUES (@nombre_organizacion + ' Org');

        SET @id_organizacion = SCOPE_IDENTITY();
    END

    -- Asignar usuario a la organización
    EXEC sp_AsignarUsuarioAOrganizacion @id_usuario, @id_organizacion, @id_rol;

    -- Si el rol es colaborador o cliente y viene con proyecto, asignarlo
    IF @rol_nombre IN ('colaborador', 'cliente') AND @id_proyecto IS NOT NULL
    BEGIN
        EXEC sp_AsignarUsuarioAProyecto @id_usuario, @id_proyecto;
    END

    -- Retornar ID de usuario y organización
    SELECT @id_usuario AS usuario_id, @id_organizacion AS organizacion_id;
END
GO


DROP PROCEDURE IF EXISTS sp_ObtenerInformacionUsuario;
GO
CREATE PROCEDURE sp_ObtenerInformacionUsuario
    @correo NVARCHAR(100)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        U.id,
        U.nombre AS usuario_nombre,
        U.correo,
        U.numero_telefono,
        U.fecha_nacimiento,
        O.id AS id_organizacion,
        O.nombre AS nombre_organizacion,
        R.id AS id_rol,
        R.nombre_rol,
        STRING_AGG(P.permiso, ', ') AS permisos
    FROM 
        Usuarios U
    INNER JOIN 
        Usuarios_Organizaciones UO ON U.id = UO.id_usuario
    INNER JOIN 
        Organizaciones O ON UO.id_organizacion = O.id
    INNER JOIN 
        Roles R ON UO.id_rol = R.id
    INNER JOIN 
        Roles_Permisos RP ON R.id = RP.id_rol
    INNER JOIN 
        Permisos P ON RP.id_permiso = P.id
    WHERE 
        U.correo = @correo
    GROUP BY 
        U.id, U.nombre, U.correo, U.numero_telefono, U.fecha_nacimiento,
        O.id, O.nombre,
        R.id, R.nombre_rol
    ORDER BY 
        U.id, O.nombre, R.nombre_rol;
END;
GO

DROP PROCEDURE IF EXISTS sp_CompararContrasena;
GO
CREATE PROCEDURE sp_CompararContrasena
    @correo NVARCHAR(100)
AS
BEGIN
    SELECT contrasena FROM Usuarios WHERE correo = @correo
END;
GO


DROP PROCEDURE IF EXISTS sp_CompararContrasenaPorId;
GO
CREATE PROCEDURE sp_CompararContrasenaPorId
    @id NVARCHAR(100)
AS
BEGIN
    SELECT contrasena FROM Usuarios WHERE id = @id
END;
GO


DROP PROCEDURE IF EXISTS sp_CambiarContrasena;
GO
CREATE PROCEDURE sp_CambiarContrasena
    @userId INT,
    @nueva_contrasena NVARCHAR(255)
AS
BEGIN
    SET NOCOUNT ON;

    -- Update password
    UPDATE Usuarios
    SET contrasena = @nueva_contrasena
    WHERE id = @userId;
END;
GO


-- Procedimiento para eliminar un usuario
DROP PROCEDURE IF EXISTS sp_EliminarUsuario;
GO
CREATE PROCEDURE sp_EliminarUsuario
    @id_usuario INT
AS
BEGIN
    IF EXISTS (SELECT 1 FROM Usuarios WHERE id = @id_usuario)
    BEGIN
        DELETE FROM Usuarios WHERE id= @id_usuario;
    END;
END;
GO

-- Procedimiento para actualizar un usuario
DROP PROCEDURE IF EXISTS sp_ActualizarUsuario;
GO
CREATE PROCEDURE sp_ActualizarUsuario
    @id INT,
    @nombre NVARCHAR(255),
    @imagen_perfil NVARCHAR(255) = NULL, -- Optional
    @numero_telefono NVARCHAR(20) = NULL, -- Optional
    @fecha_nacimiento DATE = NULL -- Optional
AS
BEGIN
    UPDATE Usuarios
    SET nombre = @nombre,
        imagen_perfil = @imagen_perfil,
        numero_telefono = @numero_telefono,
        fecha_nacimiento = @fecha_nacimiento
    WHERE id = @id;
    
    SELECT * FROM Usuarios WHERE id = @id;
END;
GO

-- Procedimiento para obtener todos los proyectos
DROP PROCEDURE IF EXISTS sp_ObtenerProyectosPorOrganizacion;
GO
CREATE PROCEDURE sp_ObtenerProyectosPorOrganizacion
    @id_organizacion INT
AS
BEGIN
    SELECT * FROM Proyectos WHERE organizacion_id = @id_organizacion;
END;
GO

DROP PROCEDURE IF EXISTS sp_CrearProyecto;
GO
CREATE PROCEDURE sp_CrearProyecto
    @nombre_proyecto NVARCHAR(100),
    @descripcion NVARCHAR(255),
    @fecha_fin DATETIME,
    @id_usuario INT,
    @id_organizacion INT
AS
BEGIN
    SET NOCOUNT ON;

    -- Insertar en Proyectos
    INSERT INTO Proyectos (nombre_proyecto, descripcion, fecha_inicio, fecha_fin, id_organizacion)
    VALUES (@nombre_proyecto, @descripcion, GETDATE(), @fecha_fin, @id_organizacion);

    -- Obtener el ID recién creado
    DECLARE @id_proyecto INT;
    SET @id_proyecto = SCOPE_IDENTITY();

    -- Insertar en Proyectos_Usuarios la relación
    INSERT INTO Usuarios_Proyectos (id_usuario, id_proyecto)
    VALUES (@id_usuario, @id_proyecto);

    -- Devolver el ID del proyecto
    SELECT @id_proyecto AS id_proyecto;
END;
GO


-- Procedimiento para obtener un proyecto por ID
DROP PROCEDURE IF EXISTS sp_ObtenerProyectoPorId;
GO
CREATE PROCEDURE sp_ObtenerProyectoPorId
    @id_proyecto INT,
    @id_organizacion INT
AS
BEGIN
    SELECT *
    FROM Proyectos
    WHERE id = @id_proyecto and id_organizacion = @id_organizacion;
END;
GO


---<<> Prodedimientos almacernados controlados<><>---








-- Check and correct any syntax errors related to 'estado_id'
-- Example procedure definition
DROP PROCEDURE IF EXISTS InsertarTarea;
GO
CREATE PROCEDURE InsertarTarea
    @proyecto_id INT,
    @titulo NVARCHAR(100),
    @descripcion NVARCHAR(255),
    @fecha_limite DATETIME,
    @estado_id INT -- Ensure 'estado_id' is correctly used
AS
BEGIN
    INSERT INTO Tareas (proyecto_id, nombre_tarea, descripcion, fecha_creacion, fecha_limite, estado_id)
    VALUES (@proyecto_id, @titulo, @descripcion, GETDATE(), @fecha_limite, @estado_id);
END;
GO

-- Procedimiento para obtener todos los usuarios
DROP PROCEDURE IF EXISTS ObtenerUsuarios;
GO
CREATE PROCEDURE ObtenerUsuarios
AS
BEGIN
    SELECT * FROM Usuarios;
END;
GO


-- Procedimiento para insertar un rol
DROP PROCEDURE IF EXISTS InsertarRol;
GO
CREATE PROCEDURE InsertarRol
    @nombre NVARCHAR(50)
AS
BEGIN
    INSERT INTO Roles (nombre_rol) VALUES (@nombre);
END;
GO

-- Procedimiento para obtener todos los roles
DROP PROCEDURE IF EXISTS ObtenerRoles;
GO
CREATE PROCEDURE ObtenerRoles
AS
BEGIN
    SELECT * FROM Roles;
END;
GO

-- Procedimiento para insertar un equipo
DROP PROCEDURE IF EXISTS InsertarEquipo;
GO
CREATE PROCEDURE InsertarEquipo
    @nombre NVARCHAR(100)
AS
BEGIN
    INSERT INTO Equipos (nombre_equipo) VALUES (@nombre);
END;
GO

-- Procedimiento para obtener todos los equipos
DROP PROCEDURE IF EXISTS ObtenerEquipos;
GO
CREATE PROCEDURE ObtenerEquipos
AS
BEGIN
    SELECT * FROM Equipos;
END;
GO

-- Procedimiento para eliminar un equipo
DROP PROCEDURE IF EXISTS EliminarEquipo;
GO
CREATE PROCEDURE EliminarEquipo
    @id_equipo INT
AS
BEGIN
    IF EXISTS (SELECT 1 FROM Equipos WHERE id = @id_equipo)
    BEGIN
        DELETE FROM Equipos WHERE id = @id_equipo;
    END;
END;
GO





-- Eliminar el procedimiento si ya existe
DROP PROCEDURE IF EXISTS InsertarProyectoUsuario;
GO

-- Crear el procedimiento almacenado
CREATE PROCEDURE InsertarProyectoUsuario
    @proyecto_id INT,
    @usuario_id INT
AS
BEGIN
    -- Insertar un nuevo registro en la tabla Proyectos_Usuarios
    INSERT INTO Proyectos_Usuarios (proyecto_id, usuario_id)
    VALUES (@proyecto_id, @usuario_id);
END;
GO



-- Procedimiento para eliminar un proyecto
DROP PROCEDURE IF EXISTS EliminarProyecto;
GO
CREATE PROCEDURE EliminarProyecto
    @id_proyecto INT
AS
BEGIN
    IF EXISTS (SELECT 1 FROM Proyectos WHERE id = @id_proyecto)
    BEGIN
        DELETE FROM Proyectos WHERE id = @id_proyecto;
    END;
END;
GO

-- Procedimiento para insertar una tarea
DROP PROCEDURE IF EXISTS InsertarTarea;
GO
CREATE PROCEDURE InsertarTarea
    @proyecto_id INT,
    @titulo NVARCHAR(100),
    @descripcion NVARCHAR(255),
    @fecha_limite DATETIME,
    @estado_id INT
AS
BEGIN
    INSERT INTO Tareas (proyecto_id, nombre_tarea, descripcion, fecha_creacion, fecha_limite, estado_id)
    VALUES (@proyecto_id, @titulo, @descripcion, GETDATE(), @fecha_limite, @estado_id);
END;
GO

-- Procedimiento para obtener todas las tareas
DROP PROCEDURE IF EXISTS ObtenerTareas;
GO
CREATE PROCEDURE ObtenerTareas
AS
BEGIN
    SELECT * FROM Tareas;
END;
GO

-- Procedimiento para eliminar una tarea
DROP PROCEDURE IF EXISTS EliminarTarea;
GO
CREATE PROCEDURE EliminarTarea
    @id_tarea INT
AS

BEGIN
    IF EXISTS (SELECT 1 FROM Tareas WHERE id = @id_tarea)
    BEGIN
        DELETE FROM Tareas WHERE id = @id_tarea;
    END;
END;
GO

-- Procedimiento para obtener notificaciones de un usuario
DROP PROCEDURE IF EXISTS ObtenerNotificacionesUsuario;
GO
CREATE PROCEDURE ObtenerNotificacionesUsuario
    @usuario_id INT
AS
BEGIN
    SELECT *
    FROM Notificaciones
    WHERE usuario_id = @usuario_id;
END;
GO

-- Procedimiento para crear una notificación
DROP PROCEDURE IF EXISTS CrearNotificacion;
GO
CREATE PROCEDURE CrearNotificacion
    @usuario_id INT,
    @mensaje NVARCHAR(255)
AS
BEGIN
    INSERT INTO Notificaciones (usuario_id, mensaje, fecha_notificacion, leida)
    VALUES (@usuario_id, @mensaje, GETDATE(), 0);
    
    -- Return the inserted notification
    SELECT SCOPE_IDENTITY() AS id_notificacion;
END;
GO

-- Procedimiento para actualizar una tarea
DROP PROCEDURE IF EXISTS ActualizarTarea;
GO
CREATE PROCEDURE ActualizarTarea
    @id_tarea INT,
    @proyecto_id INT,
    @nombre_tarea NVARCHAR(255),
    @descripcion NVARCHAR(MAX),
    @fecha_limite DATETIME,
    @estado_id INT
AS
BEGIN
    UPDATE Tareas
    SET proyecto_id = @proyecto_id,
        nombre_tarea = @nombre_tarea,
        descripcion = @descripcion,
        fecha_limite = @fecha_limite,
        estado_id = @estado_id
    WHERE id = @id_tarea;
    
    SELECT * FROM Tareas WHERE id = @id_tarea;
END;
GO

-- Procedimiento para desasignar un usuario de una tarea
DROP PROCEDURE IF EXISTS DesasignarUsuarioDeTarea;
GO
CREATE PROCEDURE DesasignarUsuarioDeTarea
    @tarea_id INT,
    @usuario_id INT
AS
BEGIN
    DELETE FROM Usuarios_Tareas
    WHERE tarea_id = @tarea_id AND usuario_id = @usuario_id;
END;
GO

-- Procedimiento para agregar un miembro a un equipo
DROP PROCEDURE IF EXISTS AgregarMiembroEquipo;
GO
CREATE PROCEDURE AgregarMiembroEquipo
    @equipo_id INT,
    @usuario_id INT,
    @rol NVARCHAR(50)
AS
BEGIN
    INSERT INTO Miembros_Equipo (equipo_id, usuario_id, rol)
    VALUES (@equipo_id, @usuario_id, @rol);
    
    SELECT * FROM Miembros_Equipo WHERE equipo_id = @equipo_id AND usuario_id = @usuario_id;
END;
GO

-- Procedimiento para crear un equipo
DROP PROCEDURE IF EXISTS CrearEquipo;
GO
CREATE PROCEDURE CrearEquipo
    @nombre_equipo NVARCHAR(255),
    @descripcion NVARCHAR(MAX)
AS
BEGIN
    INSERT INTO Equipos (nombre_equipo, descripcion)
    VALUES (@nombre_equipo, @descripcion);
    
    SELECT SCOPE_IDENTITY() AS id_equipo;
END;
GO

-- Procedimiento para obtener un usuario por ID
DROP PROCEDURE IF EXISTS ObtenerUsuarioPorId;
GO
CREATE PROCEDURE ObtenerUsuarioPorId
    @id INT
AS
BEGIN
    SELECT id, nombre, correo, fecha_registro
    FROM Usuarios
    WHERE id = @id;
END;
GO


-- Procedimiento para obtener roles de un usuario
DROP PROCEDURE IF EXISTS ObtenerRolesDeUsuario;
GO
CREATE PROCEDURE ObtenerRolesDeUsuario
    @id INT
AS
BEGIN
    SELECT r.id, r.nombre_rol
    FROM Roles r
    INNER JOIN Usuarios_Roles ur ON r.id = ur.rol_id
    WHERE ur.usuario_id = @id;
END;
GO

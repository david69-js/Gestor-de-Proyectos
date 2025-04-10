--Creacion de base de datos
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'GestionProyectos')
BEGIN
    CREATE DATABASE GestionProyectos;
END


-- Crear la tabla Usuarios solo si no existe
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name = 'Usuarios' AND xtype = 'U')
BEGIN
    CREATE TABLE Usuarios (
        id INT PRIMARY KEY IDENTITY(1,1),
        nombre VARCHAR(255),
        correo VARCHAR(255) UNIQUE,
        contrasena VARCHAR(255),
        fecha_registro DATETIME DEFAULT GETDATE()
    );
END;

-- Crear la tabla Equipos solo si no existe
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name = 'Equipos' AND xtype = 'U')
BEGIN
    CREATE TABLE Equipos (
        id INT PRIMARY KEY IDENTITY(1,1),
        nombre_equipo VARCHAR(255),
        descripcion VARCHAR(MAX)
    );
END;

-- Crear la tabla Miembros_Equipo solo si no existe
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name = 'Miembros_Equipo' AND xtype = 'U')
BEGIN
    CREATE TABLE Miembros_Equipo (
        id INT PRIMARY KEY IDENTITY(1,1),
        usuario_id INT FOREIGN KEY REFERENCES Usuarios(id),
        equipo_id INT FOREIGN KEY REFERENCES Equipos(id)
    );
END;

-- Crear la tabla Roles solo si no existe
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name = 'Roles' AND xtype = 'U')
BEGIN
    CREATE TABLE Roles (
        id INT PRIMARY KEY IDENTITY(1,1),
        nombre_rol VARCHAR(50)
    );
END;

-- Crear la tabla Usuarios_Roles solo si no existe
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name = 'Usuarios_Roles' AND xtype = 'U')
BEGIN
    CREATE TABLE Usuarios_Roles (
        id INT PRIMARY KEY IDENTITY(1,1),
        usuario_id INT FOREIGN KEY REFERENCES Usuarios(id),
        rol_id INT FOREIGN KEY REFERENCES Roles(id)
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

-- Relación entre Proyectos y Equipos
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name = 'Proyectos_Usuarios' AND xtype = 'U')
BEGIN
CREATE TABLE Proyectos_Usuarios (
    id INT PRIMARY KEY IDENTITY(1,1),
    proyecto_id INT FOREIGN KEY REFERENCES Proyectos(id),
    usuario_id INT FOREIGN KEY REFERENCES Usuarios(id)
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
        proyecto_id INT FOREIGN KEY REFERENCES Proyectos(id),
        nombre_tarea VARCHAR(255),
        descripcion VARCHAR(MAX),
        fecha_creacion DATETIME DEFAULT GETDATE(),
        fecha_limite DATETIME
        estado_id INT FOREIGN KEY REFERENCES Estados_Tarea(id)
    );
END;

-- Crear la tabla Asignaciones_Tarea solo si no existe
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name = 'Asignaciones_Tarea' AND xtype = 'U')
BEGIN
    CREATE TABLE Asignaciones_Tarea (
        id INT PRIMARY KEY IDENTITY(1,1),
        usuario_id INT,
        tarea_id INT,
        fecha_asignacion DATETIME DEFAULT GETDATE(),
        estado_asignacion VARCHAR(50),
        FOREIGN KEY (usuario_id) REFERENCES Usuarios(id) ON DELETE CASCADE,
        FOREIGN KEY (tarea_id) REFERENCES Tareas(id) ON DELETE CASCADE
    );
END;

-- Crear la tabla Comentarios solo si no existe
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name = 'Comentarios' AND xtype = 'U')
BEGIN
    CREATE TABLE Comentarios (
        id INT PRIMARY KEY IDENTITY(1,1),
        tarea_id INT FOREIGN KEY REFERENCES Tareas(id),
        usuario_id INT FOREIGN KEY REFERENCES Usuarios(id),
        comentario VARCHAR(MAX),
        fecha_comentario DATETIME DEFAULT GETDATE()
    );
END;

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
        usuario_id INT FOREIGN KEY REFERENCES Usuarios(id)
    );
END;

-- Crear la tabla Notificaciones solo si no existe
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name = 'Notificaciones' AND xtype = 'U')
BEGIN
    CREATE TABLE Notificaciones (
        id INT PRIMARY KEY IDENTITY(1,1),
        usuario_id INT FOREIGN KEY REFERENCES Usuarios(id),
        mensaje VARCHAR(255),
        fecha_notificacion DATETIME DEFAULT GETDATE()
    );
END;

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
        usuario_id INT FOREIGN KEY REFERENCES Usuarios(id),
        tarea_id INT FOREIGN KEY REFERENCES Tareas(id),
        fecha_asignacion DATETIME DEFAULT GETDATE()
    );
END;

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
        equipo_id INT NULL,  -- Puede ser NULL si es una invitación general
        proyecto_id INT NULL,  -- Puede ser NULL si es una invitación a un equipo
        rol_id INT NOT NULL,  -- Rol asignado al usuario al aceptar la invitación
        estado VARCHAR(20) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'aceptada', 'rechazada')),
        codigo_confirmacion VARCHAR(50) NOT NULL,  -- Código único para la invitación
        fecha_creacion DATETIME DEFAULT GETDATE(),
        FOREIGN KEY (equipo_id) REFERENCES Equipos(id) ON DELETE CASCADE,
        FOREIGN KEY (proyecto_id) REFERENCES Proyectos(id) ON DELETE CASCADE,
        FOREIGN KEY (rol_id) REFERENCES Roles(id) ON DELETE CASCADE
    );
END;


-- Procedimiento para insertar un usuario
-- Remove existing InsertarUsuario if exists
DROP PROCEDURE IF EXISTS RegistrarUsuario;
GO

-- Create RegistrarUsuario procedure
CREATE PROCEDURE RegistrarUsuario
    @nombre VARCHAR(255),
    @correo VARCHAR(255),
    @contrasena VARCHAR(255)
AS
BEGIN
    BEGIN TRANSACTION
    BEGIN TRY
        -- Insert user
        INSERT INTO Usuarios (nombre, correo, contrasena)
        VALUES (@nombre, @correo, @contrasena);
        
        -- Get inserted user ID
        DECLARE @usuario_id INT = SCOPE_IDENTITY();
        
        -- Assign default role
        INSERT INTO Usuarios_Roles (usuario_id, rol_id)
        SELECT @usuario_id, id FROM Roles WHERE nombre_rol = 'Miembro del Equipo';
        
        COMMIT TRANSACTION
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION
        THROW
    END CATCH
END;
GO

-- Create IniciarSesion procedure
DROP PROCEDURE IF EXISTS  IniciarSesion
GO
CREATE PROCEDURE ObtenerUsuarios
    @correo VARCHAR(255)
AS
BEGIN
    SELECT u.*, r.nombre_rol AS roles
    FROM Usuarios u
    INNER JOIN Usuarios_Roles ur ON u.id = ur.usuario_id
    INNER JOIN Roles r ON ur.rol_id = r.id
    WHERE u.correo = @correo;
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

-- Procedimiento para eliminar un usuario
DROP PROCEDURE IF EXISTS EliminarUsuario;
GO
CREATE PROCEDURE EliminarUsuario
    @id_usuario INT
AS
BEGIN
    IF EXISTS (SELECT 1 FROM Usuarios WHERE id = @id_usuario)
    BEGIN
        DELETE FROM Usuarios WHERE id= @id_usuario;
    END;
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

-- Procedimiento para crear un proyecto
DROP PROCEDURE IF EXISTS CrearProyecto;
GO
CREATE PROCEDURE CrearProyecto
    @nombre_proyecto NVARCHAR(100),
    @descripcion NVARCHAR(255),
    @fecha_fin DATETIME
AS
BEGIN
    INSERT INTO Proyectos (nombre_proyecto, descripcion, fecha_inicio, fecha_fin)
    VALUES (@nombre_proyecto, @descripcion, GETDATE(), @fecha_fin);
    
    -- Return the inserted project ID
    SELECT SCOPE_IDENTITY() AS id_proyecto;
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



-- Procedimiento para obtener todos los proyectos
DROP PROCEDURE IF EXISTS ObtenerProyectos;
GO
CREATE PROCEDURE ObtenerProyectos
AS
BEGIN
    SELECT * FROM Proyectos;
END;
GO

-- Procedimiento para obtener un proyecto por ID
DROP PROCEDURE IF EXISTS ObtenerProyectoPorId;
GO
CREATE PROCEDURE ObtenerProyectoPorId
    @id_proyecto INT
AS
BEGIN
    SELECT *
    FROM Proyectos
    WHERE id = @id_proyecto;
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


-- Procedimiento para actualizar un usuario
DROP PROCEDURE IF EXISTS ActualizarUsuario;
GO
CREATE PROCEDURE ActualizarUsuario
    @id INT,
    @nombre NVARCHAR(255),
    @correo NVARCHAR(255)
AS
BEGIN
    UPDATE Usuarios
    SET nombre = @nombre,
        correo = @correo
    WHERE id = @id;
    
    SELECT * FROM Usuarios WHERE id = @id;
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

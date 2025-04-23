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

-- Crear la tabla Eventos solo si no existe <AUNPOR_REVISAR>
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name = 'Eventos' AND xtype = 'U')
BEGIN
    CREATE TABLE Eventos (
        id INT PRIMARY KEY IDENTITY(1,1),
        nombre_evento VARCHAR(255),
        descripcion VARCHAR(MAX),
        fecha_evento DATETIME,
        usuario_id INT FOREIGN KEY REFERENCES Usuarios(id_usuario) ON DELETE CASCADE
    );
END


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

IF NOT EXISTS (SELECT * FROM sysobjects WHERE name = 'Anuncios' AND xtype = 'U')
BEGIN
CREATE TABLE Anuncios (
    id_anuncio INT PRIMARY KEY IDENTITY(1,1),
    id_proyecto INT NOT NULL,
    id_organizacion INT NOT NULL,
    id_usuario INT NULL,  -- <-- ahora permite NULL
    titulo NVARCHAR(255) NOT NULL,
    descripcion NVARCHAR(MAX),
    fecha_publicacion DATETIME DEFAULT GETDATE(),
    fecha_creacion DATETIME DEFAULT GETDATE(),

    CONSTRAINT FK_Anuncios_Proyectos FOREIGN KEY (id_proyecto) 
        REFERENCES Proyectos(id) 
        ON DELETE CASCADE,

    CONSTRAINT FK_Anuncios_Organizaciones FOREIGN KEY (id_organizacion) 
        REFERENCES Organizaciones(id) 
        ON DELETE NO ACTION,

    CONSTRAINT FK_Anuncios_Usuarios FOREIGN KEY (id_usuario) 
        REFERENCES Usuarios(id) 
        ON DELETE SET NULL
);
END



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
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name = 'Notificaciones' AND xtype = 'U')
BEGIN
   CREATE TABLE Notificaciones (
        id INT PRIMARY KEY IDENTITY(1,1),
        usuario_id INT FOREIGN KEY REFERENCES Usuarios(id), -- Usuario que recibirá la notificación
        tipo_notificacion VARCHAR(50), -- 'comentario', 'asignacion', 'estado', 'anuncio'
        referencia_id INT, -- ID de la tarea, anuncio u otro elemento relacionado
        mensaje VARCHAR(255),
        fecha_notificacion DATETIME DEFAULT GETDATE(),
        leida BIT DEFAULT 0
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
EXEC sp_SetupRolesYPermisos;
GO


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

    -- Insert without specifying the identity column
    INSERT INTO Usuarios_Organizaciones (id_usuario, id_organizacion, id_rol)
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

    IF EXISTS (SELECT 1 FROM Usuarios WHERE correo = @correo)
    BEGIN
        THROW 50001, 'El correo ya está registrado.', 1;
    END

    DECLARE @rol_nombre NVARCHAR(50);
    SELECT @rol_nombre = nombre_rol FROM Roles WHERE id = @id_rol;

    IF @rol_nombre IS NULL
    BEGIN
        THROW 50002, 'El rol especificado no existe.', 1;
    END

    INSERT INTO Usuarios (nombre, correo, contrasena, imagen_perfil, numero_telefono, fecha_nacimiento)
    VALUES (@nombre, @correo, @contrasena, @imagen_perfil, @numero_telefono, @fecha_nacimiento);

    DECLARE @id_usuario INT = SCOPE_IDENTITY();

    IF @rol_nombre = 'admin'
    BEGIN
        INSERT INTO Organizaciones (nombre)
        VALUES (@nombre_organizacion + ' Org');

        SET @id_organizacion = SCOPE_IDENTITY();
    END

    EXEC sp_AsignarUsuarioAOrganizacion @id_usuario, @id_organizacion, @id_rol;

    IF @rol_nombre IN ('colaborador', 'cliente')
    BEGIN
        IF @id_proyecto IS NOT NULL
        BEGIN
            EXEC sp_AsignarUsuarioAProyecto @id_usuario, @id_proyecto;
        END
        ELSE
        BEGIN
            PRINT '⚠️ Usuario es colaborador o cliente, pero no se asignó a ningún proyecto (id_proyecto NULL).';
        END
    END

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

-- Procedimiento para obtener un usuario por ID
DROP PROCEDURE IF EXISTS sp_ObtenerUsuarioPorId;
GO
CREATE PROCEDURE sp_ObtenerUsuarioPorId
    @id_usuario INT,
    @id_organizacion INT
AS
BEGIN
    IF NOT EXISTS (SELECT 1 FROM Usuarios_Organizaciones WHERE id_usuario = @id_usuario AND id_organizacion = @id_organizacion)
    BEGIN
        THROW 50001, 'El usuario no pertenece a la organizacion', 1;
    END

    SELECT *
    FROM Usuarios
    WHERE id = @id_usuario;
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

DROP PROCEDURE IF EXISTS sp_ActualizarProyecto;
GO
CREATE PROCEDURE sp_ActualizarProyecto
    @id_proyecto INT,
    @nombre_proyecto NVARCHAR(100) = NULL,
    @descripcion NVARCHAR(255) = NULL,
    @fecha_fin DATETIME = NULL,
    @id_organizacion INT
AS
BEGIN
    SET NOCOUNT ON;

    -- Verify if project exists and belongs to the organization
    IF NOT EXISTS (SELECT 1 FROM Proyectos WHERE id = @id_proyecto AND id_organizacion = @id_organizacion)
    BEGIN
        THROW 50001, 'El proyecto no existe o no pertenece a la organización.', 1;
    END

    -- Update project using COALESCE to keep existing values if parameter is NULL
    UPDATE Proyectos
    SET 
        nombre_proyecto = CASE WHEN @nombre_proyecto IS NULL THEN nombre_proyecto ELSE @nombre_proyecto END,
        descripcion = CASE WHEN @descripcion IS NULL THEN descripcion ELSE @descripcion END,
        fecha_fin = CASE WHEN @fecha_fin IS NULL THEN fecha_fin ELSE @fecha_fin END
    WHERE id = @id_proyecto AND id_organizacion = @id_organizacion;

    -- Return updated project
    SELECT *
    FROM Proyectos
    WHERE id = @id_proyecto;
END;
GO


DROP PROCEDURE IF EXISTS sp_EliminarProyecto;
GO
CREATE PROCEDURE sp_EliminarProyecto
    @id_proyecto INT,
    @id_organizacion INT
AS
BEGIN
    SET NOCOUNT ON;
    
    IF NOT EXISTS (SELECT 1 FROM Proyectos WHERE id = @id_proyecto AND id_organizacion = @id_organizacion)
    BEGIN
        THROW 50001, 'El proyecto no existe o no pertenece a la organización.', 1;
    END

    DELETE FROM Proyectos WHERE id = @id_proyecto;
    
    -- Return success message
    SELECT 'Proyecto eliminado exitosamente' as message;
END;
GO

-- Procedure to add participant
DROP PROCEDURE IF EXISTS sp_AgregarParticipante;
GO
CREATE PROCEDURE sp_AgregarParticipante
    @proyecto_id INT,
    @id_usuario INT,
    @id_organizacion INT,
    @rol NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    -- Validar si es admin o colaborador
    IF (@rol = 'admin' OR @rol = 'colaborador')
    BEGIN
        -- Verificar que el rol exista en la tabla Roles
        IF NOT EXISTS (SELECT 1 FROM Roles WHERE nombre_rol = @rol)
        BEGIN
            THROW 50001, 'El rol especificado no es válido.', 1;
        END

        -- Validar si el proyecto existe
        IF NOT EXISTS (SELECT 1 FROM Proyectos WHERE id = @proyecto_id AND id_organizacion = @id_organizacion)
        BEGIN
            THROW 50001, 'El proyecto no existe.', 1;
        END

        -- Validar si el usuario existe
        IF NOT EXISTS (SELECT 1 FROM Usuarios WHERE id = @id_usuario)
        BEGIN
            THROW 50002, 'El usuario no existe.', 1;
        END

        -- Validar si ya existe la relación
        IF EXISTS (SELECT 1 FROM Usuarios_Proyectos WHERE id_usuario = @id_usuario AND id_proyecto = @proyecto_id)
        BEGIN
            THROW 50003, 'El usuario ya está asignado a este proyecto.', 1;
        END

        IF NOT EXISTS (SELECT 1 FROM Usuarios_Organizaciones WHERE id_usuario = @id_usuario AND id_organizacion = @id_organizacion)
        BEGIN
            THROW 50003, 'El usuario no pertece a la organizacion.', 1;
        END

        -- Insertar relación
        INSERT INTO Usuarios_Proyectos (id_usuario, id_proyecto)
        VALUES (@id_usuario, @proyecto_id);

        -- Retornar la relación creada
        SELECT 
            u.id AS usuario_id,
            u.nombre AS usuario_nombre,
            p.id AS proyecto_id,
            p.nombre_proyecto
        FROM Usuarios_Proyectos up
        JOIN Usuarios u ON u.id = up.id_usuario
        JOIN Proyectos p ON p.id = up.id_proyecto
        WHERE up.id_usuario = @id_usuario AND up.id_proyecto = @proyecto_id;
    END
    ELSE
    BEGIN
        -- Si no es admin ni colaborador, lanza error
        THROW 50004, 'Solo administradores o colaboradores pueden ser asignados.', 1;
    END
END;
GO


-- Procedure to remove participant
DROP PROCEDURE IF EXISTS sp_EliminarParticipante;
GO
CREATE PROCEDURE sp_EliminarParticipante
    @id_proyecto INT,
    @id_usuario INT,
    @id_organizacion INT
AS
BEGIN
    SET NOCOUNT ON;

    -- Check if relation exists

    IF NOT EXISTS (SELECT 1 FROM Proyectos 
                  WHERE id_organizacion = @id_organizacion AND id = @id_proyecto)
    BEGIN
        THROW 50001, 'El usuario no está asignado a este proyecto.', 1;
    END

    IF NOT EXISTS (SELECT 1 FROM Usuarios_Proyectos 
                  WHERE id_usuario = @id_usuario AND id_proyecto = @id_proyecto)
    BEGIN
        THROW 50001, 'El usuario no está asignado a este proyecto.', 1;
    END

    -- Remove participant
    DELETE FROM Usuarios_Proyectos 
    WHERE id_usuario = @id_usuario AND id_proyecto = @id_proyecto;

    -- Return success message
    SELECT 'Participante eliminado exitosamente' as message;
END;
GO


DROP PROCEDURE IF EXISTS sp_ObtenerUsuariosPorProyecto;
GO
CREATE PROCEDURE sp_ObtenerUsuariosPorProyecto
    @id_proyecto INT,
    @id_organizacion INT
AS
BEGIN
    SET NOCOUNT ON;

    -- Check if relation exists

    IF NOT EXISTS (SELECT 1 FROM Proyectos 
        WHERE id_organizacion = @id_organizacion AND id = @id_proyecto)
    BEGIN
        THROW 50001, 'El proyecto no existe o no es parte de la organizacion.', 1;
    END

    SELECT 
        u.id AS usuario_id,
        u.nombre AS usuario_nombre,
        p.id AS proyecto_id,
        p.nombre_proyecto
    FROM Usuarios_Proyectos up
    INNER JOIN Usuarios u ON u.id = up.id_usuario
    INNER JOIN Proyectos p ON p.id = up.id_proyecto
    INNER JOIN Usuarios_Organizaciones uo ON uo.id_usuario = u.id
    WHERE p.id = @id_proyecto;

    -- Return success message
    SELECT 'Usuarios disponibles' as message;
END;
GO

-- Procedimiento para obtener todas las tareas
DROP PROCEDURE IF EXISTS sp_ObtenerTareasPorOrganizacion;
GO
CREATE PROCEDURE sp_ObtenerTareasPorOrganizacion
    @id_organizacion INT,
    @id_proyecto INT
AS
BEGIN
    IF NOT EXISTS (SELECT 1 FROM Proyectos 
        WHERE id_organizacion = @id_organizacion AND id = @id_proyecto)
    BEGIN
        THROW 50001, 'El proyecto no existe o no es parte de la organizacion.', 1;
    END

    SELECT 
        p.id AS proyecto_id,
        p.nombre_proyecto,
        t.nombre_tarea,
        t.id AS TareaId,
        t.proyecto_id
    FROM Tareas t
    INNER JOIN Proyectos p ON p.id = t.proyecto_id
    INNER JOIN Organizaciones o ON  o.id = @id_organizacion 
    WHERE p.id = @id_proyecto;
END;
GO


DROP PROCEDURE IF EXISTS sp_ObtenerTareaIdPorOrganizacion;
GO
CREATE PROCEDURE sp_ObtenerTareaIdPorOrganizacion
    @id_tarea INT,
    @id_organizacion INT,
    @id_proyecto INT
AS
BEGIN
    IF NOT EXISTS (SELECT 1 FROM Proyectos 
        WHERE id_organizacion = @id_organizacion AND id = @id_proyecto)
    BEGIN
        THROW 50001, 'El proyecto no existe o no es parte de la organizacion.', 1;
    END

    IF NOT EXISTS (SELECT 1 FROM Tareas
        WHERE id = @id_tarea AND proyecto_id = @id_proyecto)
    BEGIN
        THROW 50001, 'La tarea no existe o no es parte del proyecto.', 1;
    END

    SELECT 
        p.id AS proyecto_id,
        p.nombre_proyecto,
        t.*
    FROM Tareas t
    INNER JOIN Proyectos p ON p.id = t.proyecto_id
    INNER JOIN Organizaciones o ON  o.id = @id_organizacion 
    WHERE t.id = @id_tarea;
END;
GO


DROP PROCEDURE IF EXISTS sp_InsertarEstadosTarea;
GO
CREATE PROCEDURE sp_InsertarEstadosTarea
AS
BEGIN
    -- Insertar estados si no existen (previene duplicados)
    IF NOT EXISTS (SELECT 1 FROM Estados_Tarea WHERE estado = 'Por hacer')
        INSERT INTO Estados_Tarea (estado) VALUES ('Por hacer');

    IF NOT EXISTS (SELECT 1 FROM Estados_Tarea WHERE estado = 'En progreso')
        INSERT INTO Estados_Tarea (estado) VALUES ('En progreso');

    IF NOT EXISTS (SELECT 1 FROM Estados_Tarea WHERE estado = 'Listo')
        INSERT INTO Estados_Tarea (estado) VALUES ('Listo');
END;
GO
EXEC sp_InsertarEstadosTarea;
GO



DROP PROCEDURE IF EXISTS sp_CrearTarea;
GO
CREATE PROCEDURE sp_CrearTarea
    @id_proyecto INT,
    @id_organizacion INT,
    @id_usuario INT,
    @nombre_tarea NVARCHAR(100),
    @descripcion NVARCHAR(255),
    @fecha_limite DATETIME,
    @estado_id INT -- Ensure 'estado_id' is correctly used
AS
BEGIN
    SET NOCOUNT ON;

    -- Validar si el proyecto existe en la organización
    IF NOT EXISTS (SELECT 1 FROM Proyectos
                   WHERE id_organizacion = @id_organizacion AND id = @id_proyecto)
    BEGIN
        THROW 50001, 'El proyecto no existe o no es parte de la organizacion.', 1;
    END

    -- Validar si el usuario pertenece al proyecto
    IF NOT EXISTS (SELECT 1 FROM Usuarios_Proyectos
                   WHERE id_usuario = @id_usuario AND id_proyecto = @id_proyecto)
    BEGIN
        THROW 50001, 'El usuario no pertenece al proyecto.', 1;
    END

    -- Insertar tarea
    INSERT INTO Tareas (proyecto_id, nombre_tarea, descripcion, fecha_creacion, fecha_limite, estado_id)
    VALUES (@id_proyecto, @nombre_tarea, @descripcion, GETDATE(), @fecha_limite, @estado_id);

    DECLARE @id_tarea INT;
    SET @id_tarea = SCOPE_IDENTITY(); -- Obtiene el ID de la tarea recién insertada

    -- Verificar si el usuario ya está asignado a esta tarea
    IF EXISTS (SELECT 1 FROM Usuarios_Tareas WHERE usuario_id = @id_usuario AND tarea_id = @id_tarea)
    BEGIN
        THROW 50001, 'El usuario ya está asignado a esta tarea.', 1;
    END

    -- Asignar al usuario a la tarea
    INSERT INTO Usuarios_Tareas (usuario_id, tarea_id)
    VALUES (@id_usuario, @id_tarea);

    SELECT 
        t.*
    FROM Tareas t
    WHERE t.id = @id_tarea;

    PRINT 'Tarea creada y usuario asignado correctamente.';
END;
GO

DROP PROCEDURE IF EXISTS sp_ActualizarTarea;
GO
CREATE PROCEDURE sp_ActualizarTarea
    @id_tarea INT,
    @id_proyecto INT,
    @id_organizacion INT,
    @nombre_tarea NVARCHAR(255),
    @descripcion NVARCHAR(MAX),
    @fecha_limite DATETIME,
    @estado_id INT
AS
BEGIN
    SET NOCOUNT ON;
    
    IF NOT EXISTS (SELECT 1 FROM Proyectos 
        WHERE id = @id_proyecto AND id_organizacion = @id_organizacion)
    BEGIN
        THROW 50001, 'El proyecto no existe o no pertenece a la organización.', 1;
    END

    IF NOT EXISTS (SELECT 1 FROM Tareas WHERE id = @id_tarea AND proyecto_id = @id_proyecto)
    BEGIN
        THROW 50002, 'La tarea no existe o no pertenece al proyecto.', 1;
    END

    UPDATE Tareas
    SET nombre_tarea = @nombre_tarea,
        descripcion = @descripcion,
        fecha_limite = @fecha_limite,
        estado_id = @estado_id
    WHERE id = @id_tarea;
    
    SELECT t.*, p.nombre_proyecto
    FROM Tareas t
    INNER JOIN Proyectos p ON p.id = t.proyecto_id
    WHERE t.id = @id_tarea;
END;
GO

-- Delete task procedure
DROP PROCEDURE IF EXISTS sp_EliminarTarea;
GO
CREATE PROCEDURE sp_EliminarTarea
    @id_tarea INT,
    @id_proyecto INT,
    @id_organizacion INT
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Validación: proyecto existe y pertenece a la organización
    IF NOT EXISTS (SELECT 1 FROM Proyectos 
                   WHERE id = @id_proyecto AND id_organizacion = @id_organizacion)
    BEGIN
        THROW 50001, 'El proyecto no existe o no pertenece a la organización.', 1;
    END

    -- Validación: tarea existe y pertenece al proyecto
    IF NOT EXISTS (SELECT 1 FROM Tareas 
                   WHERE id = @id_tarea AND proyecto_id = @id_proyecto)
    BEGIN
        THROW 50002, 'La tarea no existe o no pertenece al proyecto.', 1;
    END

    -- Eliminar asignaciones de usuarios a la tarea
    DELETE FROM Usuarios_Tareas WHERE tarea_id = @id_tarea;

    -- Eliminar la tarea
    DELETE FROM Tareas WHERE id = @id_tarea;

    -- Confirmación
    SELECT 'Tarea eliminada exitosamente' AS message;
END;
GO


-- Assign user to task procedure
DROP PROCEDURE IF EXISTS sp_AsignarUsuarioATarea;
GO
CREATE PROCEDURE sp_AsignarUsuarioATarea
    @id_tarea INT,
    @id_usuario INT,
    @id_proyecto INT,
    @id_organizacion INT
AS
BEGIN
    SET NOCOUNT ON;
    
    IF NOT EXISTS (SELECT 1 FROM Proyectos 
        WHERE id = @id_proyecto AND id_organizacion = @id_organizacion)
    BEGIN
        THROW 50001, 'El proyecto no existe o no pertenece a la organización.', 1;
    END

    IF NOT EXISTS (SELECT 1 FROM Usuarios_Proyectos 
        WHERE id_usuario = @id_usuario AND id_proyecto = @id_proyecto)
    BEGIN
        THROW 50002, 'El usuario no pertenece al proyecto.', 1;
    END

    IF EXISTS (SELECT 1 FROM Usuarios_Tareas 
        WHERE usuario_id = @id_usuario AND tarea_id = @id_tarea)
    BEGIN
        THROW 50003, 'El usuario ya está asignado a esta tarea.', 1;
    END

    IF NOT EXISTS (SELECT 1 FROM Usuarios_Organizaciones 
        WHERE id_usuario = @id_usuario AND id_organizacion = @id_organizacion)
    BEGIN
        THROW 50003, 'El usuario no pertenece a la organizacion.', 1;
    END

    INSERT INTO Usuarios_Tareas (usuario_id, tarea_id)
    VALUES (@id_usuario, @id_tarea);

    SELECT 
        u.id as id_usuario,
        u.nombre as usuario_nombre,
        t.id as tarea_id,
        t.nombre_tarea
        FROM Usuarios_Tareas ut
        INNER JOIN Usuarios u ON u.id = ut.usuario_id
        INNER JOIN Tareas t ON t.id = ut.tarea_id
        WHERE ut.usuario_id = @id_usuario AND ut.tarea_id = @id_tarea;
END;
GO

DROP PROCEDURE IF EXISTS sp_DesasignarUsuarioTarea;
GO
CREATE PROCEDURE sp_DesasignarUsuarioTarea
    @id_tarea INT,
    @id_usuario INT,
    @id_proyecto INT,
    @id_organizacion INT
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Validate project belongs to organization
    IF NOT EXISTS (SELECT 1 FROM Proyectos 
        WHERE id = @id_proyecto AND id_organizacion = @id_organizacion)
    BEGIN
        THROW 50001, 'El proyecto no existe o no pertenece a la organización.', 1;
    END

    -- Validate task belongs to project
    IF NOT EXISTS (SELECT 1 FROM Tareas 
        WHERE id = @id_tarea AND proyecto_id = @id_proyecto)
    BEGIN
        THROW 50002, 'La tarea no existe o no pertenece al proyecto.', 1;
    END

    -- Validate user is assigned to task
    IF NOT EXISTS (SELECT 1 FROM Usuarios_Tareas 
        WHERE usuario_id = @id_usuario AND tarea_id = @id_tarea)
    BEGIN
        THROW 50003, 'El usuario no está asignado a esta tarea.', 1;
    END

    -- Remove user from task
    DELETE FROM Usuarios_Tareas
    WHERE usuario_id = @id_usuario AND tarea_id = @id_tarea;

    -- Return confirmation
    SELECT 'Usuario desasignado exitosamente de la tarea' AS message;
END;
GO

-- Add comment to task procedure
DROP PROCEDURE IF EXISTS sp_AgregarComentario;
GO
CREATE PROCEDURE sp_AgregarComentario
    @id_tarea INT,
    @id_usuario INT,
    @id_proyecto INT,
    @id_organizacion INT,
    @comentario NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;
    
    IF NOT EXISTS (SELECT 1 FROM Proyectos 
        WHERE id = @id_proyecto AND id_organizacion = @id_organizacion)
    BEGIN
        THROW 50001, 'El proyecto no existe o no pertenece a la organización.', 1;
    END

    IF NOT EXISTS (SELECT 1 FROM Tareas WHERE id = @id_tarea AND proyecto_id = @id_proyecto)
    BEGIN
        THROW 50002, 'La tarea no existe o no pertenece al proyecto.', 1;
    END

    INSERT INTO Comentarios (tarea_id, usuario_id, comentario)
    VALUES (@id_tarea, @id_usuario, @comentario);

    SELECT 
        c.*,
        u.nombre as usuario_nombre
    FROM Comentarios c
    INNER JOIN Usuarios u ON u.id = c.usuario_id
    WHERE c.id = SCOPE_IDENTITY();
END;
GO


DROP PROCEDURE IF EXISTS sp_CrearAnuncio;
GO
CREATE PROCEDURE sp_CrearAnuncio
    @id_proyecto INT,
    @id_organizacion INT,
    @id_usuario INT,
    @titulo NVARCHAR(255),
    @descripcion NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Validate project belongs to organization
    IF NOT EXISTS (SELECT 1 FROM Proyectos 
        WHERE id = @id_proyecto AND id_organizacion = @id_organizacion)
    BEGIN
        THROW 50001, 'El proyecto no existe o no pertenece a la organización.', 1;
    END

    -- Insert announcement
    INSERT INTO Anuncios (
        id_proyecto,
        id_organizacion,
        id_usuario,
        titulo,
        descripcion
    )
    VALUES (
        @id_proyecto,
        @id_organizacion,
        @id_usuario,
        @titulo,
        @descripcion
    );

    -- Return the created announcement
    SELECT 
        a.*,
        p.nombre_proyecto,
        u.nombre as nombre_usuario
    FROM Anuncios a
    INNER JOIN Proyectos p ON p.id = a.id_proyecto
    LEFT JOIN Usuarios u ON u.id = a.id_usuario
    WHERE a.id_anuncio = SCOPE_IDENTITY();
END;
GO


DROP PROCEDURE IF EXISTS sp_ObtenerAnunciosPorProyecto;
GO
CREATE PROCEDURE sp_ObtenerAnunciosPorProyecto
    @id_proyecto INT,
    @id_organizacion INT
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Validate project belongs to organization
    IF NOT EXISTS (SELECT 1 FROM Proyectos 
        WHERE id = @id_proyecto AND id_organizacion = @id_organizacion)
    BEGIN
        THROW 50001, 'El proyecto no existe o no pertenece a la organización.', 1;
    END

    -- Get all announcements for the project
    SELECT 
        a.*,
        p.nombre_proyecto,
        u.nombre as nombre_usuario
    FROM Anuncios a
    INNER JOIN Proyectos p ON p.id = a.id_proyecto
    LEFT JOIN Usuarios u ON u.id = a.id_usuario
    WHERE a.id_proyecto = @id_proyecto
    ORDER BY a.fecha_publicacion DESC;
END;
GO

DROP PROCEDURE IF EXISTS sp_ObtenerAnuncio;
GO
CREATE PROCEDURE sp_ObtenerAnuncio
    @id_anuncio INT,
    @id_organizacion INT,
    @id_proyecto INT
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Validate announcement exists and belongs to organization
    IF NOT EXISTS (SELECT 1 FROM Anuncios 
        WHERE id_anuncio = @id_anuncio AND id_organizacion = @id_organizacion AND id_proyecto = @id_proyecto)
    BEGIN
        THROW 50001, 'El anuncio no existe o no pertenece a la organización.', 1;
    END

    -- Get the announcement with related information
    SELECT 
        a.*,
        p.nombre_proyecto,
        u.nombre as nombre_usuario
    FROM Anuncios a
    INNER JOIN Proyectos p ON p.id = a.id_proyecto
    LEFT JOIN Usuarios u ON u.id = a.id_usuario
    WHERE a.id_anuncio = @id_anuncio;
END;
GO


DROP PROCEDURE IF EXISTS sp_ObtenerAnunciosPorProyecto;
GO
CREATE PROCEDURE sp_ObtenerAnunciosPorProyecto
    @id_proyecto INT,
    @id_organizacion INT,
    @id_usuario INT
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Validate user belongs to organization
    IF NOT EXISTS (SELECT 1 FROM Usuarios_Organizaciones 
        WHERE id_usuario = @id_usuario AND id_organizacion = @id_organizacion)
    BEGIN
        THROW 50001, 'El usuario no pertenece a la organización.', 1;
    END

    -- Validate project belongs to organization
    IF NOT EXISTS (SELECT 1 FROM Proyectos 
        WHERE id = @id_proyecto AND id_organizacion = @id_organizacion)
    BEGIN
        THROW 50002, 'El proyecto no existe o no pertenece a la organización.', 1;
    END

    -- Get all announcements for the project
    SELECT 
        a.*,
        p.nombre_proyecto,
        u.nombre as nombre_usuario,
        u.imagen_perfil as usuario_imagen
    FROM Anuncios a
    INNER JOIN Proyectos p ON p.id = a.id_proyecto
    LEFT JOIN Usuarios u ON u.id = a.id_usuario
    WHERE a.id_proyecto = @id_proyecto
    ORDER BY a.fecha_publicacion DESC;
END;
GO



DROP PROCEDURE IF EXISTS sp_EliminarAnuncio;
GO
CREATE PROCEDURE sp_EliminarAnuncio
    @id_anuncio INT,
    @id_organizacion INT,
    @id_proyecto INT,
    @id_usuario INT
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Validate announcement exists and belongs to organization
    IF NOT EXISTS (SELECT 1 FROM Anuncios 
        WHERE id_anuncio = @id_anuncio AND id_organizacion = @id_organizacion AND id_proyecto = @id_proyecto)
    BEGIN
        THROW 50001, 'El anuncio no existe o no pertenece a la organización.', 1;
    END

    -- Validate user either created the announcement or belongs to the organization
    IF NOT EXISTS (
        SELECT 1 
        FROM Anuncios a
        WHERE a.id_anuncio = @id_anuncio 
        AND (
            a.id_usuario = @id_usuario -- User created the announcement
            OR EXISTS (
                SELECT 1 
                FROM Usuarios_Organizaciones uo 
                WHERE uo.id_usuario = @id_usuario 
                AND uo.id_organizacion = @id_organizacion
            )
        )
    )
    BEGIN
        THROW 50002, 'No tienes permisos para eliminar este anuncio.', 1;
    END

    -- Delete the announcement
    DELETE FROM Anuncios 
    WHERE id_anuncio = @id_anuncio;

    -- Return success message
    SELECT 'Anuncio eliminado exitosamente' AS message;
END;
GO




DROP TRIGGER IF EXISTS TR_Notificar_Comentario;
GO
CREATE TRIGGER TR_Notificar_Comentario
ON Comentarios
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Declaración de variables
    DECLARE @nombre_tarea VARCHAR(255);
    
    INSERT INTO Notificaciones (
        usuario_id,
        tipo_notificacion,
        referencia_id,
        mensaje
    )
    SELECT
        ut.usuario_id,
        'comentario',
        i.tarea_id,
        CONCAT('Nuevo comentario en la tarea: ', t.nombre_tarea)
    FROM inserted i
    INNER JOIN Tareas t ON t.id = i.tarea_id
    INNER JOIN Usuarios_Tareas ut ON ut.tarea_id = i.tarea_id
    WHERE ut.usuario_id != i.usuario_id;
END;
GO


-- Trigger para asignación de tareas
DROP TRIGGER IF EXISTS TR_Notificar_Asignacion_Tarea;
GO
CREATE TRIGGER TR_Notificar_Asignacion_Tarea
ON Usuarios_Tareas
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Declaración de variables
    DECLARE @nombre_tarea VARCHAR(255);
    
    INSERT INTO Notificaciones (
        usuario_id,
        tipo_notificacion,
        referencia_id,
        mensaje
    )
    SELECT
        i.usuario_id,
        'asignacion',
        i.tarea_id,
        CONCAT('Has sido asignado a la tarea: ', t.nombre_tarea)
    FROM inserted i
    INNER JOIN Tareas t ON t.id = i.tarea_id;
END;
GO


-- Trigger para cambios de estado en tareas
DROP TRIGGER IF EXISTS TR_Notificar_Estado_Tarea;
GO
CREATE TRIGGER TR_Notificar_Estado_Tarea
ON Tareas
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Variables para almacenar los cambios
    DECLARE @nombre_tarea VARCHAR(255);
    DECLARE @estado VARCHAR(50);
    DECLARE @mensaje VARCHAR(500);
    
    -- Verificar si hubo cambio en el estado
    IF UPDATE(estado_id)
    BEGIN
        INSERT INTO Notificaciones (
            usuario_id,
            tipo_notificacion,
            referencia_id,
            mensaje
        )
        SELECT
            ut.usuario_id,
            'estado',
            i.id,
            CONCAT('El estado de la tarea ', i.nombre_tarea, ' ha cambiado a: ', et.estado)
        FROM inserted i
        INNER JOIN deleted d ON i.id = d.id
        INNER JOIN Estados_Tarea et ON et.id = i.estado_id
        INNER JOIN Usuarios_Tareas ut ON ut.tarea_id = i.id
        WHERE i.estado_id != d.estado_id;
    END

    -- Verificar otros cambios en la tarea
    IF UPDATE(nombre_tarea) OR UPDATE(descripcion) OR UPDATE(fecha_limite)
    BEGIN
        INSERT INTO Notificaciones (
            usuario_id,
            tipo_notificacion,
            referencia_id,
            mensaje
        )
        SELECT
            ut.usuario_id,
            'actualizacion',
            i.id,
            CONCAT('La tarea ', i.nombre_tarea, ' ha sido actualizada')
        FROM inserted i
        INNER JOIN deleted d ON i.id = d.id
        INNER JOIN Usuarios_Tareas ut ON ut.tarea_id = i.id
        WHERE i.nombre_tarea != d.nombre_tarea 
           OR i.descripcion != d.descripcion 
           OR i.fecha_limite != d.fecha_limite;
    END
END;
GO



DROP TRIGGER IF EXISTS TR_Notificar_Asignacion_Proyecto;
GO
CREATE TRIGGER TR_Notificar_Asignacion_Proyecto
ON Usuarios_Proyectos
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Declaración de variables
    DECLARE @nombre_proyecto VARCHAR(255);
    
    INSERT INTO Notificaciones (
        usuario_id,
        tipo_notificacion,
        referencia_id,
        mensaje
    )
    SELECT
        i.id_usuario,
        'asignacion_proyecto',
        i.id_proyecto,
        CONCAT('Has sido asignado al proyecto: ', p.nombre_proyecto)
    FROM inserted i
    INNER JOIN Proyectos p ON p.id = i.id_proyecto;
END;
GO

DROP PROCEDURE IF EXISTS sp_ObtenerNotificaciones;
GO
CREATE PROCEDURE sp_ObtenerNotificaciones
    @usuario_id INT
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        id,
        usuario_id,
        tipo_notificacion,
        referencia_id,
        mensaje,
        fecha_notificacion,
        leida
    FROM Notificaciones
    WHERE usuario_id = @usuario_id
    ORDER BY fecha_notificacion DESC;
END;
GO

-- Procedimiento para marcar una notificación como leída
CREATE OR ALTER PROCEDURE sp_MarcarNotificacionComoLeida
    @id INT,
    @usuario_id INT
AS
BEGIN
    SET NOCOUNT ON;
    
    UPDATE Notificaciones 
    SET leida = 1 
    WHERE id = @id AND usuario_id = @usuario_id;
    
    -- Devolver la notificación actualizada
    SELECT * FROM Notificaciones WHERE id = @id;
END;
GO

-- Procedimiento para obtener notificaciones no leídas
DROP PROCEDURE IF EXISTS sp_ObtenerNotificacionesNoLeidas;
GO
CREATE PROCEDURE sp_ObtenerNotificacionesNoLeidas
    @usuario_id INT
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        id,
        usuario_id,
        tipo_notificacion,
        referencia_id,
        mensaje,
        fecha_notificacion,
        leida
    FROM Notificaciones
    WHERE usuario_id = @usuario_id
        AND leida = 0
    ORDER BY fecha_notificacion DESC;
END;
GO



-- Trigger para nuevos anuncios
DROP TRIGGER TR_Notificar_Anuncio
GO
CREATE TRIGGER TR_Notificar_Anuncio
ON Anuncios
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;
    
    INSERT INTO Notificaciones (
        usuario_id,
        usuario_origen_id,
        tipo_notificacion,
        referencia_id,
        mensaje
    )
    SELECT 
        uo.id_usuario,
        i.id_usuario,
        'anuncio',
        i.id_anuncio,
        CONCAT(u.nombre, ' publicó un nuevo anuncio en ', p.nombre_proyecto, ': ', i.titulo)
    FROM inserted i
    INNER JOIN Proyectos p ON p.id = i.id_proyecto
    INNER JOIN Usuarios_Organizaciones uo ON uo.id_organizacion = i.id_organizacion
    INNER JOIN Usuarios u ON u.id = i.id_usuario
    WHERE uo.id_usuario != i.id_usuario;
END;
GO


--REPORTES-----

CREATE PROCEDURE sp_GetProjectProgressReport
    @id_proyecto INT = NULL,
    @id_organizacion INT = NULL
AS
BEGIN
    IF @id_proyecto IS NOT NULL
    BEGIN
        SELECT
            p.nombre_proyecto AS nombre_proyecto,
            COUNT(t.id) AS total_tareas,
            SUM(CASE WHEN e.estado = 'Completado' THEN 1 ELSE 0 END) AS tareas_completadas,
            (SUM(CASE WHEN e.estado = 'Completado' THEN 1 ELSE 0 END) * 100.0 / COUNT(t.id)) AS porcentaje_completado
        FROM Proyectos p
        LEFT JOIN Tareas t ON p.id = t.proyecto_id
        LEFT JOIN Estados_Tarea e ON t.estado_id = e.id
        WHERE p.id = @id_proyecto
        GROUP BY p.nombre_proyecto
    END
    ELSE IF @id_organizacion IS NOT NULL
    BEGIN
        SELECT
            p.nombre_proyecto AS nombre_proyecto,
            COUNT(t.id) AS total_tareas,
            SUM(CASE WHEN e.estado = 'Completado' THEN 1 ELSE 0 END) AS tareas_completadas,
            (SUM(CASE WHEN e.estado = 'Completado' THEN 1 ELSE 0 END) * 100.0 / COUNT(t.id)) AS porcentaje_completado
        FROM Proyectos p
        LEFT JOIN Tareas t ON p.id = t.proyecto_id
        LEFT JOIN Estados_Tarea e ON t.estado_id = e.id
        WHERE p.organizacion_id = @id_organizacion
        GROUP BY p.nombre_proyecto
    END
END

CREATE PROCEDURE sp_GetUserParticipationReport
    @id_organizacion INT,
    @id_proyecto INT = NULL
AS
BEGIN
    IF @id_proyecto IS NULL
    BEGIN
        SELECT
            u.nombre AS nombre_usuario,
            COUNT(ut.tarea_id) AS tareas_asignadas,
            SUM(CASE WHEN e.estado = 'Completado' THEN 1 ELSE 0 END) AS tareas_completadas
        FROM Usuarios u
        JOIN Usuarios_Tareas ut ON u.id = ut.usuario_id
        JOIN Tareas t ON ut.tarea_id = t.id
        JOIN Estados_Tarea e ON t.estado_id = e.id
        JOIN Usuarios_Organizaciones uo ON u.id = uo.id_usuario
        WHERE uo.id_organizacion = @id_organizacion
        GROUP BY u.nombre
    END
    ELSE
    BEGIN
        SELECT
            u.nombre AS nombre_usuario,
            COUNT(ut.tarea_id) AS tareas_asignadas,
            SUM(CASE WHEN e.estado = 'Completado' THEN 1 ELSE 0 END) AS tareas_completadas
        FROM Usuarios u
        JOIN Usuarios_Tareas ut ON u.id = ut.usuario_id
        JOIN Tareas t ON ut.tarea_id = t.id
        JOIN Estados_Tarea e ON t.estado_id = e.id
        WHERE t.proyecto_id = @id_proyecto
        GROUP BY u.nombre
    END
END

CREATE PROCEDURE sp_GetTimeTrackingReport
    @id_usuario INT = NULL,
    @startDate DATE,
    @endDate DATE,
    @id_proyecto INT = NULL
AS
BEGIN
    IF @id_usuario IS NOT NULL
    BEGIN
        SELECT 
            t.nombre_tarea AS nombre_tarea,
            p.nombre_proyecto AS nombre_proyecto,
            t.fecha_creacion,
            t.fecha_limite
        FROM Tareas t
        JOIN Proyectos p ON t.proyecto_id = p.id
        JOIN Usuarios_Tareas ut ON t.id = ut.tarea_id
        WHERE ut.usuario_id = @id_usuario
        AND t.fecha_creacion BETWEEN @startDate AND @endDate
    END
    ELSE IF @id_proyecto IS NOT NULL
    BEGIN
        SELECT 
            t.nombre_tarea AS nombre_tarea,
            u.nombre AS nombre_usuario,
            t.fecha_creacion,
            t.fecha_limite
        FROM Tareas t
        JOIN Usuarios_Tareas ut ON t.id = ut.tarea_id
        JOIN Usuarios u ON ut.usuario_id = u.id
        WHERE t.proyecto_id = @id_proyecto
        AND t.fecha_creacion BETWEEN @startDate AND @endDate
    END
END


---<<> Prodedimientos almacernados controlados<><>---
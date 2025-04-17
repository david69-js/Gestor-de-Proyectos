const sql = require('mssql');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Configuración de conexión base
const baseConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  port: parseInt(process.env.DB_PORT),
  options: {
    encrypt: false,
    trustServerCertificate: true,
    enableArithAbort: true
  }
};

async function getConnection() {
  let pool;
  try {
    pool = await sql.connect({ ...baseConfig, database: process.env.DB_DATABASE });
    console.log("✅ Conexión a la base de datos exitosa.");

    await verifySchemaVersion(pool);
    await insertarValoresPredeterminados(pool);
    return pool;

  } catch (error) {
    console.log("⚠️ No se pudo conectar. Intentando crear la base de datos...");

    try {
      const adminPool = await sql.connect(baseConfig);
      await adminPool.request().query(`
        IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = '${process.env.DB_DATABASE}')
        CREATE DATABASE ${process.env.DB_DATABASE}
      `);
      await adminPool.close();

      pool = await sql.connect({ ...baseConfig, database: process.env.DB_DATABASE });

      const sqlScript = fs.readFileSync(path.join(__dirname, '../database/schema.sql'), 'utf-8');
      const queries = sqlScript.split(/\bGO\b/gi).filter(q => q.trim());

      for (const query of queries) {
        try {
          await pool.request().query(query);
        } catch (queryError) {
          console.warn(`⚠️ Error en query: ${queryError.message}`);
        }
      }

      console.log("✅ Base de datos y procedimientos creados correctamente.");

      await insertarValoresPredeterminados(pool);
      return pool;

    } catch (creationError) {
      console.error('❌ Error al crear la base de datos:', creationError);
      throw creationError;
    }
  }
}

async function verifySchemaVersion(pool) {
  try {
    const procedures = [
      'sp_AsignarUsuarioAOrganizacion',
      'sp_AsignarUsuarioAProyecto',
      'sp_SetupRolesYPermisos',
      'sp_InsertarEstadosTarea',
      'sp_CrearTarea',
      'CambiarContrasena',
      'ObtenerUsuarioPorId',
      'ActualizarUsuario',
      'EliminarUsuario',
      'InsertarTarea',
    ];

    const missingProcedures = [];
    for (const proc of procedures) {
      const result = await pool.request()
        .query(`SELECT OBJECT_ID('${proc}', 'P') as procId`);
      if (result.recordset[0].procId === null) {
        missingProcedures.push(proc);
      }
    }

    if (missingProcedures.length > 0) {
      console.log(`🔄 Procedimientos faltantes: ${missingProcedures.join(', ')}. Ejecutando script...`);
      await executeSchemaScript(pool);
    } else {
      console.log("✅ Todos los procedimientos ya están disponibles.");
    }

  } catch (error) {
    console.error('❌ Error al verificar procedimientos:', error);
    throw error;
  }
}

async function executeSchemaScript(pool) {
  const sqlScript = fs.readFileSync(path.join(__dirname, '../database/schema.sql'), 'utf-8');
  const batches = sqlScript.split(/\bGO\b/gi).filter(q => q.trim());

  for (const batch of batches) {
    try {
      await pool.request().query(batch);
    } catch (queryError) {
      console.warn(`⚠️ Error al ejecutar batch: ${queryError.message}`);
    }
  }

  console.log('✅ Script de procedimientos ejecutado.');
}

async function insertarValoresPredeterminados(pool) {
  try {
    await pool.request().execute('sp_InsertarEstadosTarea');
    await pool.request().execute('sp_SetupRolesYPermisos');
    console.log('✅ Valores predeterminados insertados correctamente.');
  } catch (error) {
    console.error('❌ Error al insertar valores predeterminados:', error);
  }
}

module.exports = {
  getConnection
};

const sql = require('mssql');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Base configuration for initial connection
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
    // Attempt direct connection to the specified database
    pool = await sql.connect({ ...baseConfig, database: process.env.DB_DATABASE });
    console.log("✅ Connection to existing DB successful");
    
    // Verify schema version
    await verifySchemaVersion(pool);
    
    return pool;
  } catch (error) {
    console.log("⚠️ Attempting to recreate the database...");
    
    try {
      // Connect to server without specifying a database (use 'master')
      const adminPool = await sql.connect(baseConfig);
      
      // Verify and create database if it doesn't exist
      await adminPool.request().query(`
        IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = '${process.env.DB_DATABASE}')
        CREATE DATABASE ${process.env.DB_DATABASE}
      `);
      
      await adminPool.close();
      
      // Connect to the newly created database
      pool = await sql.connect({ ...baseConfig, database: process.env.DB_DATABASE });
      
      // Execute SQL script
      const sqlScript = fs.readFileSync(path.join(__dirname, '../database/schema.sql'), 'utf-8');
        console.log(sqlScript)
     
      const queries = sqlScript.split('GO').filter(q => q.trim());
      
      for (const query of queries) {
        try {
          await pool.request().query(query);
        } catch (queryError) {
          console.warn(`⚠️ Warning in query: ${queryError.message}`);
        }
      }
      
      console.log("✅ Database and schema recreated successfully");
      return pool;
      
    } catch (creationError) {
      console.error('❌ Error recreating the database:', creationError);
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
      'CambiarContrasena',
      'ObtenerUsuarioPorId',
      'ActualizarUsuario',
      'EliminarUsuario',
      'InsertarTarea',
    ];

    // Check if all procedures exist
    const missingProcedures = [];
    for (const proc of procedures) {
      const result = await pool.request()
        .query(`SELECT OBJECT_ID('${proc}', 'P') as procId`);
      
      if (result.recordset[0].procId === null) {
        missingProcedures.push(proc);
      }
    }

    if (missingProcedures.length > 0) {
      console.log(`🔄 Missing procedures: ${missingProcedures.join(', ')}. Updating database schema...`);
      await executeSchemaScript(pool);
    } else {
      console.log("✅ All procedures are present.");
    }
  } catch (error) {
    console.error('Schema verification failed:', error);
    throw error;
  }
}

async function executeSchemaScript(pool) {
  const sqlScript = fs.readFileSync(path.join(__dirname, '../database/schema.sql'), 'utf-8');
  const batches = sqlScript.split(/^GO$/gm).filter(q => q.trim());
  
  for (const batch of batches) {
    try {
      await pool.request().query(batch);
    } catch (queryError) {
      console.warn(`⚠️ Batch execution warning: ${queryError.message}`);
    }
  }
}

module.exports = {
  getConnection
};
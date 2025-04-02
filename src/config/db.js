const sql = require('mssql');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Configuración base sin especificar BD (para conexión inicial)
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
    // 1. First try direct connection
    pool = await sql.connect({ ...baseConfig, database: process.env.DB_DATABASE });
    console.log("✅ Connection to existing DB successful");
    
    // Always verify schema version
    await verifySchemaVersion(pool);
    
    return pool;
  } catch (error) {
    // 2. Si falla, intentar crear la BD
    console.log("⚠️ Intentando recrear la base de datos...");
    
    try {
      // Conectar al servidor sin BD específica (usa 'master')
      const adminPool = await sql.connect(baseConfig);
      
      // Verificar y crear BD si no existe
      await adminPool.request().query(`
        IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = '${process.env.DB_DATABASE}')
        CREATE DATABASE ${process.env.DB_DATABASE}
      `);
      
      // Cerrar conexión temporal
      await adminPool.close();
      
      // 3. Conectar a la nueva BD
      pool = await sql.connect({ ...baseConfig, database: process.env.DB_DATABASE });
      
      // 4. Ejecutar script SQL
      const sqlScript = fs.readFileSync(path.join(__dirname, '../database/schema.sql'), 'utf-8');
      const queries = sqlScript.split('GO').filter(q => q.trim());
      
      for (const query of queries) {
        try {
          await pool.request().query(query);
        } catch (queryError) {
          console.warn(`⚠️ Advertencia en consulta: ${queryError.message}`);
        }
      }
      
      console.log("✅ Base de datos y esquema recreados exitosamente");
      return pool;
      
    } catch (creationError) {
      console.error('❌ Error al recrear la base de datos:', creationError);
      throw creationError;
    }
  }
}

// Add new helper function
async function verifySchemaVersion(pool) {
  try {
    // Check if procedures exist
    const result = await pool.request()
      .query(`SELECT OBJECT_ID('RegistrarUsuario', 'P') as procId`);
      
    if (result.recordset[0].procId === null) {
      console.log("🔄 Updating database schema...");
      await executeSchemaScript(pool);
    }
  } catch (error) {
    console.error('Schema verification failed:', error);
    throw error;
  }
}

// Extract schema execution logic
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
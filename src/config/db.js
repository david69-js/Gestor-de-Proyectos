const sql = require('mssql');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  port: parseInt(process.env.DB_PORT),
  options: {
    encrypt: false,
    trustServerCertificate: true
  }
};

async function getConnection() {
  try {
    const sqlScript = fs.readFileSync(path.join(__dirname, '../database/schema.sql'), 'utf-8');
    const queries = sqlScript.split('GO');
    const pool = await sql.connect(dbConfig);
    
    // Existing query execution
    for (let query of queries) {
      if (query.trim()) { 
        await pool.request().query(query.trim());
      }
    }
    console.log("Script ejecutado correctamente");
    
    return pool;

  } catch (error) {
    console.error('Database connection error:', error);
    throw error;
  }
}

module.exports = {
  getConnection
};
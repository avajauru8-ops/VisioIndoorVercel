import { MongoClient, Db } from 'mongodb';

// ============================================
// MYSQL CONFIGURATION (COMMENTED OUT)
// ============================================
/*
import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'visioindoor',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export async function initDb() {
  try {
    const connection = await pool.getConnection();
    console.log('Connected to MySQL database.');
    
    // Auto-create basic tables if needed, or rely on manual DB dump
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nome VARCHAR(255) NOT NULL,
        cpf VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        senha VARCHAR(255) NOT NULL,
        nivel ENUM('admin', 'agencia') NOT NULL,
        status_licenca ENUM('ativa', 'expirada') NOT NULL DEFAULT 'ativa',
        validade_licenca DATETIME NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Only create tables if they don't exist to not overwrite data
    console.log('Ensure other tables are imported via phpMyAdmin or MySQL client.');
    connection.release();
  } catch (err) {
    console.error('Failed to connect to MySQL:', err);
  }
}

export default pool;
*/

// ============================================
// MONGODB CONFIGURATION
// ============================================

import dotenv from 'dotenv';
dotenv.config();

let client: MongoClient | null = null;
let dbInstance: Db | null = null;

export async function initDb() {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) throw new Error('MONGO_URI is not set in environment variables');
    
    client = new MongoClient(uri);
    await client.connect();
    const dbName = process.env.MONGO_DB_NAME || 'visioindoor';
    dbInstance = client.db(dbName);
    console.log(`Connected to MongoDB database (${dbName}).`);

    // Create unique indexes
    await dbInstance.collection('usuarios').createIndex({ email: 1 }, { unique: true });
    await dbInstance.collection('usuarios').createIndex({ cpf: 1 }, { unique: true });
    await dbInstance.collection('totens').createIndex({ device_id: 1 }, { unique: true });

  } catch (err) {
    console.error('Failed to connect to MongoDB:', err);
    throw err;
  }
}

export function getDb() {
  if (!dbInstance) throw new Error('Database not initialized. Call initDb first.');
  return dbInstance;
}

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

let pool: mysql.Pool | null = null;

export async function initDb() {
  try {
    pool = mysql.createPool({
      host: process.env.MYSQL_HOST || 'localhost',
      user: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD || '',
      database: process.env.MYSQL_DATABASE || 'visioindoor',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      charset: 'utf8mb4'
    });

    const connection = await pool.getConnection();
    console.log('Connected to MySQL database.');

    // Auto-create basic tables
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

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS totens (
        id INT AUTO_INCREMENT PRIMARY KEY,
        usuario_id INT NOT NULL,
        nome VARCHAR(255) NOT NULL,
        device_id VARCHAR(255) UNIQUE NOT NULL,
        status ENUM('online', 'offline', 'manutencao') NOT NULL DEFAULT 'offline',
        ultima_sincronizacao DATETIME NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
      )
    `);

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS campanhas (
        id INT AUTO_INCREMENT PRIMARY KEY,
        usuario_id INT NOT NULL,
        totem_id INT NULL,
        titulo VARCHAR(255) NOT NULL,
        tipo_midia VARCHAR(50) NOT NULL,
        tempo_exibicao INT NOT NULL,
        data_inicio DATETIME NULL,
        data_fim DATETIME NULL,
        arquivo_url TEXT NOT NULL,
        ativo TINYINT(1) DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
        FOREIGN KEY (totem_id) REFERENCES totens(id) ON DELETE CASCADE
      )
    `);

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS configuracoes_admin (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nome_painel VARCHAR(255) DEFAULT 'VisioIndoor',
        logo_url TEXT NULL,
        show_apk_banner TINYINT(1) DEFAULT 1,
        apk_banner_title VARCHAR(255) DEFAULT 'Player Android',
        apk_banner_desc TEXT NULL,
        apk_banner_btn_text VARCHAR(255) DEFAULT 'Instalar Player',
        apk_file_url TEXT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    connection.release();
  } catch (err) {
    console.error('Failed to connect to MySQL:', err);
    throw err;
  }
}

export function getDb(): mysql.Pool {
  if (!pool) throw new Error('Database not initialized. Call initDb first.');
  return pool;
}

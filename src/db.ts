import mysql from 'mysql2/promise';
import Database from 'better-sqlite3';
import path from 'path';
import bcrypt from 'bcryptjs';

let isMySQL = !!(process.env.MYSQL_HOST && process.env.MYSQL_USER && process.env.MYSQL_DATABASE);

let sqliteDb: any = null;
let mysqlPool: any = null;

function getSqliteDb() {
  if (!sqliteDb) {
    const dbPath = path.join(process.cwd(), 'lancepro.db');
    sqliteDb = new Database(dbPath);
  }
  return sqliteDb;
}

if (isMySQL) {
  console.log('=== Connecting to MySQL Database ===');
  console.log(`Host: ${process.env.MYSQL_HOST}`);
  console.log(`Port: ${process.env.MYSQL_PORT || 3306}`);
  console.log(`Database: ${process.env.MYSQL_DATABASE}`);
  console.log(`User: ${process.env.MYSQL_USER}`);
  
  mysqlPool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    port: process.env.MYSQL_PORT ? parseInt(process.env.MYSQL_PORT, 10) : 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    multipleStatements: true,
    connectTimeout: 5000 // fail fast within 5s
  });
} else {
  getSqliteDb();
}

// Translate SQLite schema SQL to MySQL compatible format
function translateSchemaForMySQL(sql: string): string {
  let res = sql;
  // Replace AUTOINCREMENT
  res = res.replace(/\bINTEGER PRIMARY KEY AUTOINCREMENT\b/gi, 'INT AUTO_INCREMENT PRIMARY KEY');
  return res;
}

// Direct SQL query translator from SQLite dialects to MySQL
function translateQueryForMySQL(sql: string): string {
  let res = sql;
  
  // 1. Convert strftime('%m', created_at) and strftime('%m', 'now')
  res = res.replace(/strftime\(\s*['"]%m['"]\s*,\s*created_at\s*\)/gi, "DATE_FORMAT(created_at, '%m')");
  res = res.replace(/strftime\(\s*['"]%m['"]\s*,\s*['"]now['"]\s*\)/gi, "DATE_FORMAT(CURRENT_DATE(), '%m')");
  
  // 2. Convert strftime('%Y-%m', created_at)
  res = res.replace(/strftime\(\s*['"]%Y-%m['"]\s*,\s*created_at\s*\)/gi, "DATE_FORMAT(created_at, '%Y-%m')");
  
  // 3. Convert date('now') and date('now', '+7 days')
  res = res.replace(/date\(\s*['"]now['"]\s*\)/gi, "CURRENT_DATE()");
  res = res.replace(/date\(\s*['"]now['"]\s*,\s*['"]\+7 days['"]\s*\)/gi, "DATE_ADD(CURRENT_DATE(), INTERVAL 7 DAY)");
  
  return res;
}

export const db = {
  get isMySQL(): boolean {
    return isMySQL;
  },
  
  async exec(sql: string): Promise<void> {
    if (isMySQL) {
      const translated = translateSchemaForMySQL(sql);
      await mysqlPool.query(translated);
    } else {
      getSqliteDb().exec(sql);
    }
  },
  
  prepare(sql: string) {
    return {
      async run(...params: any[]): Promise<{ lastInsertRowid: number; changes: number }> {
        if (isMySQL) {
          const translated = translateQueryForMySQL(sql);
          const [result] = await mysqlPool.execute(translated, params);
          return {
            lastInsertRowid: (result as any).insertId || 0,
            changes: (result as any).affectedRows || 0
          };
        } else {
          const stmt = getSqliteDb().prepare(sql);
          const info = stmt.run(...params);
          return {
            lastInsertRowid: Number(info.lastInsertRowid),
            changes: info.changes
          };
        }
      },
      
      async get(...params: any[]): Promise<any> {
        if (isMySQL) {
          const translated = translateQueryForMySQL(sql);
          const [rows] = await mysqlPool.execute(translated, params);
          return (rows as any)[0] || null;
        } else {
          return getSqliteDb().prepare(sql).get(...params);
        }
      },
      
      async all(...params: any[]): Promise<any[]> {
        if (isMySQL) {
          const translated = translateQueryForMySQL(sql);
          const [rows] = await mysqlPool.execute(translated, params);
          return rows as any[];
        } else {
          return getSqliteDb().prepare(sql).all(...params);
        }
      }
    };
  }
};

export async function initDb() {
  if (isMySQL && mysqlPool) {
    try {
      console.log('Testing MySQL Connection...');
      const connection = await mysqlPool.getConnection();
      connection.release();
      console.log('MySQL Connection successful!');
    } catch (err: any) {
      console.error('MySQL Connection failed. Falling back to SQLite database. Error detail:', err.message);
      isMySQL = false;
      try {
        await mysqlPool.end();
      } catch (e) {}
    }
  }

  console.log(`Initializing Database schemas (${isMySQL ? 'MySQL' : 'SQLite'})...`);
  
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nama TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      profesi TEXT,
      tarif_per_jam INTEGER DEFAULT 0,
      bio TEXT,
      telepon TEXT,
      foto TEXT,
      role TEXT DEFAULT 'user',
      remember_token TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS clients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      nama TEXT NOT NULL,
      perusahaan TEXT,
      email TEXT,
      telepon TEXT,
      alamat TEXT,
      catatan TEXT,
      status TEXT DEFAULT 'Aktif',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      client_id INTEGER NOT NULL,
      nama TEXT NOT NULL,
      deskripsi TEXT,
      kategori TEXT,
      nilai_kontrak INTEGER DEFAULT 0,
      status TEXT DEFAULT 'Perencanaan',
      prioritas TEXT DEFAULT 'Sedang',
      progress INTEGER DEFAULT 0,
      tanggal_mulai DATE,
      deadline DATE,
      catatan TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (client_id) REFERENCES clients(id)
    );
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL,
      nama_task TEXT NOT NULL,
      selesai INTEGER DEFAULT 0,
      urutan INTEGER DEFAULT 0,
      FOREIGN KEY (project_id) REFERENCES projects(id)
    );
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS invoices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      client_id INTEGER NOT NULL,
      project_id INTEGER NOT NULL,
      nomor_invoice TEXT NOT NULL,
      subtotal INTEGER DEFAULT 0,
      diskon INTEGER DEFAULT 0,
      pajak INTEGER DEFAULT 0,
      total INTEGER DEFAULT 0,
      status TEXT DEFAULT 'Belum Dibayar',
      catatan TEXT,
      tanggal_jatuh_tempo DATE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (client_id) REFERENCES clients(id),
      FOREIGN KEY (project_id) REFERENCES projects(id)
    );
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS invoice_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      invoice_id INTEGER NOT NULL,
      nama_item TEXT NOT NULL,
      qty INTEGER DEFAULT 1,
      harga_satuan INTEGER DEFAULT 0,
      subtotal INTEGER DEFAULT 0,
      FOREIGN KEY (invoice_id) REFERENCES invoices(id)
    );
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS gallery (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      judul TEXT NOT NULL,
      deskripsi TEXT,
      kategori TEXT,
      gambar TEXT NOT NULL,
      tahun TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS activity_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      aksi TEXT NOT NULL,
      keterangan TEXT,
      ip_address TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);

  // Seed Admin User
  const adminEmail = 'admin@lancepro.com';
  const existingAdmin = await db.prepare('SELECT id FROM users WHERE email = ?').get(adminEmail);

  if (!existingAdmin) {
    const hashedPassword = bcrypt.hashSync('admin123', 10);
    await db.prepare(`
      INSERT INTO users (nama, email, password, profesi, role) 
      VALUES (?, ?, ?, ?, ?)
    `).run('Admin LancePro', adminEmail, hashedPassword, 'Full Stack Developer', 'admin');
    
    console.log('Admin user status: Created successfully');
  } else {
    console.log('Admin user status: Already exists');
  }
}

export default db;

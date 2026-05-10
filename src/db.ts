import Database from 'better-sqlite3';
import path from 'path';
import bcrypt from 'bcryptjs';

const dbPath = path.join(process.cwd(), 'lancepro.db');
const db = new Database(dbPath);

// Create tables
db.exec(`
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

  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL,
    nama_task TEXT NOT NULL,
    selesai INTEGER DEFAULT 0,
    urutan INTEGER DEFAULT 0,
    FOREIGN KEY (project_id) REFERENCES projects(id)
  );

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

  CREATE TABLE IF NOT EXISTS invoice_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    invoice_id INTEGER NOT NULL,
    nama_item TEXT NOT NULL,
    qty INTEGER DEFAULT 1,
    harga_satuan INTEGER DEFAULT 0,
    subtotal INTEGER DEFAULT 0,
    FOREIGN KEY (invoice_id) REFERENCES invoices(id)
  );

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
const existingAdmin = db.prepare('SELECT id FROM users WHERE email = ?').get(adminEmail);

if (!existingAdmin) {
  const hashedPassword = bcrypt.hashSync('admin123', 10);
  db.prepare(`
    INSERT INTO users (nama, email, password, profesi, role) 
    VALUES (?, ?, ?, ?, ?)
  `).run('Admin LancePro', adminEmail, hashedPassword, 'Full Stack Developer', 'admin');
  
  console.log('Admin user created');
}

export default db;

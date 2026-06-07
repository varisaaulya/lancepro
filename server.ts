import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import db, { initDb } from './src/db.js';
import { seedData } from './src/seed.js';

const __dirname = path.resolve();
const SECRET_KEY = process.env.GEMINI_API_KEY || 'lancepro-secret-2024';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Initialize DB schemas & run database seeds asynchronously
  try {
    await initDb();
    await seedData();
  } catch (error) {
    console.error('Database Initialization or Seeding failed:', error);
  }

  app.use(cors({
    origin: true,
    credentials: true
  }));
  app.use(express.json());
  app.use(cookieParser());
  app.use('/uploads', express.static(path.join(__dirname, 'src/assets/uploads')));

  // --- Middleware ---
  const authenticate = (req: any, res: any, next: any) => {
    const token = req.cookies.token;
    if (!token) {
      console.log('Authentication failed: No token');
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    try {
      const decoded = jwt.verify(token, SECRET_KEY) as any;
      req.user = decoded;
      next();
    } catch (err: any) {
      console.log('Authentication failed: Invalid token', err.message);
      res.clearCookie('token', { path: '/', secure: true, sameSite: 'lax' });
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }
  };

  const activityLog = async (user_id: number, aksi: string, keterangan: string) => {
    try {
      await db.prepare('INSERT INTO activity_log (user_id, aksi, keterangan) VALUES (?, ?, ?)')
        .run(user_id, aksi, keterangan);
    } catch (e) {
      console.error('Log error:', e);
    }
  };

  // --- Multer Storage ---
  const storage = multer.diskStorage({
    destination: './src/assets/uploads/',
    filename: (req, file, cb) => {
      cb(null, Date.now() + path.extname(file.originalname));
    }
  });
  const upload = multer({ storage });

  // --- Auth Routes ---
  app.post('/api/auth/register', async (req, res) => {
    const { nama, email, password } = req.body;
    if (!nama || !email || !password || password.length < 8) {
      return res.status(400).json({ success: false, message: 'Validasi gagal' });
    }

    try {
      const exists = await db.prepare('SELECT id FROM users WHERE email = ?').get(email);
      if (exists) return res.status(400).json({ success: false, message: 'Email sudah terdaftar' });

      const hash = bcrypt.hashSync(password, 10);
      const result = await db.prepare('INSERT INTO users (nama, email, password) VALUES (?, ?, ?)')
        .run(nama, email, hash);
      
      res.json({ success: true, message: 'Registrasi berhasil' });
    } catch (e: any) {
      res.status(500).json({ success: false, message: e.message });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    const { email, password, remember } = req.body;
    try {
      const user = await db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;
      if (!user || !bcrypt.compareSync(password, user.password)) {
        return res.status(401).json({ success: false, message: 'Email atau password salah' });
      }

      const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, SECRET_KEY, {
        expiresIn: remember ? '30d' : '24h'
      });

      res.cookie('token', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        path: '/',
        maxAge: remember ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000
      });

      await activityLog(user.id, 'Login', 'User melakukan login ke sistem');
      res.json({ success: true, data: { id: user.id, nama: user.nama, role: user.role } });
    } catch (e: any) {
      res.status(500).json({ success: false, message: e.message });
    }
  });

  app.post('/api/auth/logout', (req, res) => {
    res.clearCookie('token', { path: '/', secure: true, sameSite: 'lax' });
    res.json({ success: true, message: 'Logout berhasil' });
  });

  app.get('/api/auth/me', authenticate, async (req: any, res) => {
    try {
      const user = await db.prepare('SELECT id, nama, email, profesi, bio, telepon, foto, role, tarif_per_jam FROM users WHERE id = ?').get(req.user.id);
      res.json({ success: true, data: user });
    } catch (e: any) {
      res.status(500).json({ success: false, message: e.message });
    }
  });

  // --- Dashboard Stats ---
  app.get('/api/dashboard/stats', authenticate, async (req: any, res) => {
    const userId = req.user.id;
    console.log('Fetching dashboard stats for user:', userId);
    try {
      const activeProjects = await db.prepare("SELECT COUNT(*) as count FROM projects WHERE user_id = ? AND status != 'Selesai'").get(userId) as any;
      const monthlyIncome = await db.prepare("SELECT SUM(total) as sum FROM invoices WHERE user_id = ? AND status = 'Lunas' AND strftime('%m', created_at) = strftime('%m', 'now')").get(userId) as any;
      const unpaidInvoices = await db.prepare("SELECT COUNT(*) as count FROM invoices WHERE user_id = ? AND status != 'Lunas'").get(userId) as any;
      const upcomingDeadlines = await db.prepare("SELECT COUNT(*) as count FROM projects WHERE user_id = ? AND deadline >= date('now') AND deadline <= date('now', '+7 days')").get(userId) as any;
      const revenueHistory = await db.prepare(`
        SELECT strftime('%Y-%m', created_at) as month, SUM(total) as total 
        FROM invoices WHERE user_id = ? AND status = 'Lunas' 
        GROUP BY month ORDER BY month DESC LIMIT 6
      `).all(userId);
      const statusDistribution = await db.prepare("SELECT status, COUNT(*) as count FROM projects WHERE user_id = ? GROUP BY status").all(userId);
      const recentProjects = await db.prepare("SELECT p.*, c.nama as client_name FROM projects p JOIN clients c ON p.client_id = c.id WHERE p.user_id = ? ORDER BY p.created_at DESC LIMIT 5").all(userId);
      const activities = await db.prepare("SELECT * FROM activity_log WHERE user_id = ? ORDER BY created_at DESC LIMIT 10").all(userId);

      const stats = {
        activeProjects: activeProjects || { count: 0 },
        monthlyIncome: { sum: monthlyIncome?.sum || 0 },
        unpaidInvoices: unpaidInvoices || { count: 0 },
        upcomingDeadlines: upcomingDeadlines || { count: 0 },
        revenueHistory: revenueHistory || [],
        statusDistribution: statusDistribution || [],
        recentProjects: recentProjects || [],
        activities: activities || []
      };

      console.log('Dashboard stats prepared successfully');
      res.json({ success: true, data: stats });
    } catch (error: any) {
      console.error('Dashboard Stats API Error:', error);
      res.status(500).json({ success: false, message: 'Gagal mengambil data dashboard', error: error.message });
    }
  });

  // --- Projects CRUD ---
  app.get('/api/projects', authenticate, async (req: any, res) => {
    try {
      const projects = await db.prepare("SELECT p.*, c.nama as client_name FROM projects p JOIN clients c ON p.client_id = c.id WHERE p.user_id = ?").all(req.user.id);
      res.json({ success: true, data: projects });
    } catch (e: any) {
      res.status(500).json({ success: false, message: e.message });
    }
  });

  app.post('/api/projects', authenticate, async (req: any, res) => {
    const { client_id, nama, deskripsi, kategori, nilai_kontrak, status, prioritas, progress, tanggal_mulai, deadline } = req.body;
    try {
      const result = await db.prepare(`
        INSERT INTO projects (user_id, client_id, nama, deskripsi, kategori, nilai_kontrak, status, prioritas, progress, tanggal_mulai, deadline)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(req.user.id, client_id, nama, deskripsi, kategori, nilai_kontrak, status, prioritas, progress, tanggal_mulai, deadline);
      
      await activityLog(req.user.id, 'Tambah Proyek', `Menambah proyek: ${nama}`);
      res.json({ success: true, data: { id: result.lastInsertRowid } });
    } catch (e: any) {
      res.status(500).json({ success: false, message: e.message });
    }
  });

  app.put('/api/projects/:id', authenticate, async (req: any, res) => {
    const { nama, deskripsi, kategori, nilai_kontrak, status, prioritas, progress, tanggal_mulai, deadline } = req.body;
    try {
      await db.prepare(`
        UPDATE projects SET nama = ?, deskripsi = ?, kategori = ?, nilai_kontrak = ?, status = ?, prioritas = ?, progress = ?, tanggal_mulai = ?, deadline = ?
        WHERE id = ? AND user_id = ?
      `).run(nama, deskripsi, kategori, nilai_kontrak, status, prioritas, progress, tanggal_mulai, deadline, req.params.id, req.user.id);
      
      await activityLog(req.user.id, 'Update Proyek', `Mengupdate proyek ID: ${req.params.id}`);
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ success: false, message: e.message });
    }
  });

  app.delete('/api/projects/:id', authenticate, async (req: any, res) => {
    try {
      await db.prepare('DELETE FROM projects WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
      await activityLog(req.user.id, 'Hapus Proyek', `Menghapus proyek ID: ${req.params.id}`);
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ success: false, message: e.message });
    }
  });

  // --- Clients CRUD ---
  app.get('/api/clients', authenticate, async (req: any, res) => {
    try {
      const clients = await db.prepare("SELECT * FROM clients WHERE user_id = ?").all(req.user.id);
      res.json({ success: true, data: clients });
    } catch (e: any) {
      res.status(500).json({ success: false, message: e.message });
    }
  });

  app.post('/api/clients', authenticate, async (req: any, res) => {
    const { nama, perusahaan, email, telepon, alamat, catatan, status } = req.body;
    try {
      const result = await db.prepare(`
        INSERT INTO clients (user_id, nama, perusahaan, email, telepon, alamat, catatan, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(req.user.id, nama, perusahaan, email, telepon, alamat, catatan, status);
      
      await activityLog(req.user.id, 'Tambah Klien', `Menambah klien: ${nama}`);
      res.json({ success: true, data: { id: result.lastInsertRowid } });
    } catch (e: any) {
      res.status(500).json({ success: false, message: e.message });
    }
  });

  app.put('/api/clients/:id', authenticate, async (req: any, res) => {
    const { nama, perusahaan, email, telepon, alamat, catatan, status } = req.body;
    try {
      await db.prepare(`
        UPDATE clients SET nama = ?, perusahaan = ?, email = ?, telepon = ?, alamat = ?, catatan = ?, status = ?
        WHERE id = ? AND user_id = ?
      `).run(nama, perusahaan, email, telepon, alamat, catatan, status, req.params.id, req.user.id);
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ success: false, message: e.message });
    }
  });

  app.get('/api/clients/:id', authenticate, async (req: any, res) => {
    try {
      const client = await db.prepare("SELECT * FROM clients WHERE id = ? AND user_id = ?").get(req.params.id, req.user.id);
      const projects = await db.prepare("SELECT * FROM projects WHERE client_id = ?").all(req.params.id);
      res.json({ success: true, data: { ...client, projects } });
    } catch (e: any) {
      res.status(500).json({ success: false, message: e.message });
    }
  });

  // --- Invoices ---
  app.get('/api/invoices', authenticate, async (req: any, res) => {
    try {
      const invoices = await db.prepare(`
        SELECT i.*, c.nama as client_name, p.nama as project_name 
        FROM invoices i 
        JOIN clients c ON i.client_id = c.id 
        JOIN projects p ON i.project_id = p.id 
        WHERE i.user_id = ?
      `).all(req.user.id);
      res.json({ success: true, data: invoices });
    } catch (e: any) {
      res.status(500).json({ success: false, message: e.message });
    }
  });

  app.post('/api/invoices', authenticate, async (req: any, res) => {
    const { client_id, project_id, nomor_invoice, subtotal, diskon, pajak, total, status, catatan, tanggal_jatuh_tempo, items } = req.body;
    try {
      const result = await db.prepare(`
        INSERT INTO invoices (user_id, client_id, project_id, nomor_invoice, subtotal, diskon, pajak, total, status, catatan, tanggal_jatuh_tempo)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(req.user.id, client_id, project_id, nomor_invoice, subtotal, diskon, pajak, total, status, catatan, tanggal_jatuh_tempo);
      
      if (items && Array.isArray(items)) {
        const stmt = db.prepare('INSERT INTO invoice_items (invoice_id, nama_item, qty, harga_satuan, subtotal) VALUES (?, ?, ?, ?, ?)');
        for (const item of items) {
          await stmt.run(result.lastInsertRowid, item.nama, item.qty, item.harga, item.subtotal);
        }
      }
      
      await activityLog(req.user.id, 'Buat Invoice', `Membuat invoice: ${nomor_invoice}`);
      res.json({ success: true, data: { id: result.lastInsertRowid } });
    } catch (e: any) {
      res.status(500).json({ success: false, message: e.message });
    }
  });

  app.put('/api/invoices/:id/status', authenticate, async (req: any, res) => {
    const { status } = req.body;
    try {
      await db.prepare('UPDATE invoices SET status = ? WHERE id = ? AND user_id = ?').run(status, req.params.id, req.user.id);
      await activityLog(req.user.id, 'Update Invoice', `Mengubah status invoice ID: ${req.params.id} menjadi ${status}`);
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ success: false, message: e.message });
    }
  });

  app.delete('/api/invoices/:id', authenticate, async (req: any, res) => {
    try {
      await db.prepare('DELETE FROM invoice_items WHERE invoice_id = ?').run(req.params.id);
      await db.prepare('DELETE FROM invoices WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
      await activityLog(req.user.id, 'Hapus Invoice', `Menghapus invoice ID: ${req.params.id}`);
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ success: false, message: e.message });
    }
  });

  // --- Gallery ---
  app.get('/api/gallery', authenticate, async (req: any, res) => {
    try {
      const items = await db.prepare("SELECT * FROM gallery WHERE user_id = ?").all(req.user.id);
      res.json({ success: true, data: items });
    } catch (e: any) {
      res.status(500).json({ success: false, message: e.message });
    }
  });

  app.post('/api/gallery', authenticate, upload.single('gambar'), async (req: any, res) => {
    const { judul, deskripsi, kategori, tahun } = req.body;
    const gambar = req.file ? `/uploads/${req.file.filename}` : req.body.gambar;
    
    try {
      const result = await db.prepare(`
        INSERT INTO gallery (user_id, judul, deskripsi, kategori, gambar, tahun)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(req.user.id, judul, deskripsi, kategori, gambar, tahun);
      
      res.json({ success: true, data: { id: result.lastInsertRowid } });
    } catch (e: any) {
      res.status(500).json({ success: false, message: e.message });
    }
  });

  app.delete('/api/gallery/:id', authenticate, async (req: any, res) => {
    try {
      await db.prepare('DELETE FROM gallery WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ success: false, message: e.message });
    }
  });

  // --- Profiles ---
  app.put('/api/profile', authenticate, async (req: any, res) => {
    const { nama, profesi, bio, telepon, tarif_per_jam } = req.body;
    try {
      await db.prepare(`
        UPDATE users SET nama = ?, profesi = ?, bio = ?, telepon = ?, tarif_per_jam = ?
        WHERE id = ?
      `).run(nama, profesi, bio, telepon, tarif_per_jam, req.user.id);
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ success: false, message: e.message });
    }
  });

  app.put('/api/profile/password', authenticate, async (req: any, res) => {
    const { oldPassword, newPassword } = req.body;
    try {
      const user = await db.prepare('SELECT password FROM users WHERE id = ?').get(req.user.id) as any;
      if (!bcrypt.compareSync(oldPassword, user.password)) {
        return res.status(400).json({ success: false, message: 'Password lama salah' });
      }
      const hash = bcrypt.hashSync(newPassword, 10);
      await db.prepare('UPDATE users SET password = ? WHERE id = ?').run(hash, req.user.id);
      res.json({ success: true, message: 'Password berhasil diubah' });
    } catch (e: any) {
      res.status(500).json({ success: false, message: e.message });
    }
  });

  // --- Exports ---
  app.get('/api/export/projects', authenticate, async (req: any, res) => {
    try {
      const projects = await db.prepare("SELECT * FROM projects WHERE user_id = ?").all(req.user.id) as any[];
      let csv = 'ID,Nama,Kategori,Nilai,Status,Progress,Deadline\n';
      projects.forEach(p => {
        csv += `${p.id},"${p.nama}",${p.kategori},${p.nilai_kontrak},${p.status},${p.progress}%,${p.deadline}\n`;
      });
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=projects.csv');
      res.send(csv);
    } catch (e: any) {
      res.status(500).json({ success: false, message: e.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

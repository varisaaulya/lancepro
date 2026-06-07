import db from './db.js';
import bcrypt from 'bcryptjs';

export async function seedData() {
  console.log('Seeding initial data if tables are empty...');
  
  const users = [
    { nama: 'Budi Santoso', email: 'budi@example.com', password: 'password123', profesi: 'UI/UX Designer' },
    { nama: 'Siti Aminah', email: 'siti@example.com', password: 'password123', profesi: 'Copywriter' },
    { nama: 'Andi Wijaya', email: 'andi@example.com', password: 'password123', profesi: 'Web Developer' }
  ];

  for (const u of users) {
    const exists = await db.prepare('SELECT id FROM users WHERE email = ?').get(u.email);
    if (!exists) {
      const hash = bcrypt.hashSync(u.password, 10);
      await db.prepare('INSERT INTO users (nama, email, password, profesi) VALUES (?, ?, ?, ?)').run(u.nama, u.email, hash, u.profesi);
    }
  }

  // Check if we have clients
  const clientCount = await db.prepare('SELECT COUNT(*) as count FROM clients').get() as { count: number };
  if (clientCount && clientCount.count === 0) {
    const admin = await db.prepare('SELECT id FROM users WHERE email = ?').get('admin@lancepro.com') as { id: number };
    if (admin) {
      const clients = [
        ['Toko Maju', 'Pak Ahmad', 'ahmad@maju.com', '08123456789', 'Jl. Sudirman 10'],
        ['PT Digital', 'Ibu Rina', 'rina@digital.com', '08129876543', 'Gedung Cyber 5'],
        ['Coffe Sini', 'Mas Bagus', 'bagus@sini.com', '0811223344', 'Jl. Senopati 2'],
        ['Resto Enak', 'Bu Dewi', 'dewi@enak.com', '0899887766', 'PIM 3'],
        ['Studio Foto', 'Kevin', 'kevin@studio.com', '0812009988', 'Kelapa Gading']
      ];

      for (const [perusahaan, nama, email, telp, alamat] of clients) {
        await db.prepare('INSERT INTO clients (user_id, nama, perusahaan, email, telepon, alamat) VALUES (?, ?, ?, ?, ?, ?)')
          .run(admin.id, nama, perusahaan, email, telp, alamat);
      }

      // Add Projects
      const clientIds = await db.prepare('SELECT id FROM clients').all() as { id: number }[];
      const projects = [
        ['Redesign Website Maju', 'Website', 5000000, 'Selesai', 'Tinggi', 100],
        ['Logo Baru Digital', 'Branding', 2000000, 'Dalam Pengerjaan', 'Sedang', 45],
        ['App Mobile Coffe', 'Mobile App', 15000000, 'Perencanaan', 'Tinggi', 10],
        ['Menu Digital Resto', 'Web Design', 3000000, 'Selesai', 'Rendah', 100],
        ['Video Profile Studio', 'Branding', 4500000, 'Dalam Pengerjaan', 'Sedang', 60],
        ['SEO Campaign Maju', 'Lainnya', 7500000, 'Dalam Pengerjaan', 'Sedang', 30]
      ];

      for (let i = 0; i < projects.length; i++) {
        const [nama, kat, nilai, status, prio, prog] = projects[i];
        const clientId = clientIds[i % clientIds.length].id;
        await db.prepare('INSERT INTO projects (user_id, client_id, nama, kategori, nilai_kontrak, status, prioritas, progress, tanggal_mulai, deadline) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
          .run(admin.id, clientId, nama, kat, nilai, status, prio, prog, '2024-01-01', '2024-06-01');
      }

      // Add Invoices
      const projectIds = await db.prepare('SELECT id FROM projects').all() as { id: number }[];
      for (let i = 0; i < 4; i++) {
        const project = await db.prepare('SELECT client_id, nama, nilai_kontrak FROM projects WHERE id = ?').get(projectIds[i].id) as { client_id: number, nama: string, nilai_kontrak: number };
        const total = project.nilai_kontrak;
        const status = i % 2 === 0 ? 'Lunas' : 'Belum Dibayar';
        const res = await db.prepare('INSERT INTO invoices (user_id, client_id, project_id, nomor_invoice, total, status, tanggal_jatuh_tempo) VALUES (?, ?, ?, ?, ?, ?, ?)')
          .run(admin.id, project.client_id, projectIds[i].id, `INV-2024-00${i+1}`, total, status, '2024-12-31');
        
        await db.prepare('INSERT INTO invoice_items (invoice_id, nama_item, qty, harga_satuan, subtotal) VALUES (?, ?, ?, ?, ?)')
          .run(res.lastInsertRowid, project.nama, 1, total, total);
      }

      // Add Gallery
      const categories = ['Web Design', 'Mobile App', 'Branding', 'Ilustrasi'];
      for (let i = 0; i < 8; i++) {
        await db.prepare('INSERT INTO gallery (user_id, judul, deskripsi, kategori, gambar, tahun) VALUES (?, ?, ?, ?, ?, ?)')
          .run(admin.id, `Karya ke-${i+1}`, 'Deskripsi karya portofolio yang menarik.', categories[i % categories.length], `https://picsum.photos/seed/lance${i}/800/600`, '2023');
      }

      // Add Activity Logs
      const logs = ['Login', 'Update Proyek', 'Tambah Klien', 'Buat Invoice', 'Upload Portofolio'];
      for (let i = 0; i < 20; i++) {
        await db.prepare('INSERT INTO activity_log (user_id, aksi, keterangan) VALUES (?, ?, ?)')
          .run(admin.id, logs[i % logs.length], `Melakukan aksi ${logs[i % logs.length]} pada sistem.`);
      }
      
      console.log('Seeding status: Completed successfully');
    }
  } else {
    console.log('Seeding status: Database already has entries, skipping');
  }
}

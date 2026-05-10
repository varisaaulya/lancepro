import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button, Input, Card } from '../components/ui/BaseComponents';
import { UserPlus, ShieldCheck, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'motion/react';

export default function Register() {
  const [formData, setFormData] = useState({
    nama: '',
    email: '',
    password: '',
    confirm: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirm) {
      return toast.error('Konfirmasi password tidak cocok');
    }
    if (formData.password.length < 8) {
      return toast.error('Password minimal 8 karakter');
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Registrasi berhasil! Silakan login.');
        navigate('/login');
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error('Gagal registrasi. Coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-10 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-0 overflow-hidden rounded-[2.5rem] shadow-2xl border border-gray-100">
        {/* Left Side - Info */}
        <div className="hidden md:flex flex-col justify-center p-12 bg-burgundy text-white relative">
           <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
           <div className="relative z-10">
              <h2 className="text-4xl font-serif font-bold mb-8">Mulailah Mengelola Bisnis Freelance Anda Secara Profesional.</h2>
              <div className="space-y-6">
                 {[
                   'Manajemen Proyek & Deadline',
                   'Invoicing & Arus Kas Otomatis',
                   'Kredibilitas dengan Portofolio Galeri',
                   'Database Klien yang Terorganisir'
                 ].map((item, i) => (
                   <div key={i} className="flex items-center gap-4">
                      <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center shrink-0">
                         <Check size={14} className="text-white" />
                      </div>
                      <span className="text-lg font-medium text-gray-200">{item}</span>
                   </div>
                 ))}
              </div>
              <div className="mt-12 p-6 bg-white/5 rounded-2xl border border-white/10 flex items-center gap-4">
                 <ShieldCheck size={32} className="text-white/60" />
                 <p className="text-sm text-gray-300">Data Anda aman dan terenkripsi menggunakan sistem database LancePro yang handal.</p>
              </div>
           </div>
        </div>

        {/* Right Side - Form */}
        <div className="p-8 md:p-12 bg-white flex flex-col justify-center">
          <div className="text-center md:text-left mb-8">
            <h1 className="text-3xl font-serif font-bold text-burgundy">Daftar Akun Baru</h1>
            <p className="text-gray-muted mt-2">Buat akun untuk memulai pengalaman freelance yang lebih baik.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input 
              label="Nama Lengkap" 
              placeholder="Masukkan nama Anda"
              value={formData.nama}
              onChange={(e) => setFormData({...formData, nama: e.target.value})}
              required 
            />
            <Input 
              label="Email" 
              type="email" 
              placeholder="nama@email.com" 
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required 
            />
            <Input 
              label="Password (min. 8 karakter)" 
              type="password" 
              placeholder="••••••••" 
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required 
            />
            <Input 
              label="Konfirmasi Password" 
              type="password" 
              placeholder="••••••••" 
              value={formData.confirm}
              onChange={(e) => setFormData({...formData, confirm: e.target.value})}
              required 
            />

            <Button type="submit" disabled={loading} className="w-full py-4 text-lg flex items-center justify-center gap-2 mt-4">
              {loading ? 'Mendaftarkan...' : <><UserPlus size={20} /> Daftar Sekarang</>}
            </Button>
          </form>

          <div className="mt-8 text-center text-sm text-gray-muted">
            Sudah punya akun? <Link to="/login" className="text-burgundy font-bold hover:underline">Masuk di sini</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

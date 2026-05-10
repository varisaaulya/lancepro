import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button, Input, Card } from '../components/ui/BaseComponents';
import { LogIn, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'motion/react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password, remember })
      });
      const data = await res.json();
      if (data.success) {
        login(data.data);
        toast.success(`Selamat datang kembali, ${data.data.nama}!`);
        navigate('/dashboard');
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error('Gagal login. Coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <Card className="p-8 shadow-2xl border-burgundy/10">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-burgundy text-white rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl font-bold shadow-xl shadow-burgundy/20">LP</div>
            <h1 className="text-3xl font-serif font-bold text-burgundy">Masuk ke LancePro</h1>
            <p className="text-gray-muted mt-2">Kelola proyek Anda dengan mudah harian.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input 
              label="Email" 
              type="email" 
              placeholder="nama@email.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <label className="block text-sm font-semibold text-gray-700">Password</label>
                <a href="#" className="text-xs text-burgundy hover:underline">Lupa Password?</a>
              </div>
              <Input 
                type="password" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
              />
            </div>

            <div className="flex items-center gap-2">
              <input 
                type="checkbox" 
                id="remember" 
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-burgundy focus:ring-burgundy" 
              />
              <label htmlFor="remember" className="text-sm text-gray-600">Ingat saya selama 30 hari</label>
            </div>

            <Button type="submit" disabled={loading} className="w-full py-4 text-lg flex items-center justify-center gap-2">
              {loading ? 'Memproses...' : <><LogIn size={20} /> Masuk Sekarang</>}
            </Button>
          </form>

          <div className="mt-8 text-center text-sm text-gray-muted">
            Belum punya akun? <Link to="/register" className="text-burgundy font-bold hover:underline">Daftar sekarang gratis</Link>
          </div>
        </Card>
        
        <div className="mt-6 p-4 bg-orange-50 border border-orange-100 rounded-xl flex items-center justify-between">
          <div className="text-xs text-orange-800">
            <strong>Gunakan akun demo:</strong><br />
            admin@lancepro.com / admin123
          </div>
          <button 
            onClick={() => { setEmail('admin@lancepro.com'); setPassword('admin123'); }}
            className="text-xs font-bold text-orange-600 hover:underline flex items-center gap-1"
          >
            Auto Fill <ArrowRight size={12} />
          </button>
        </div>
      </motion.div>
    </div>
  );
}

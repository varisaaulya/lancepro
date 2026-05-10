import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  ArrowRight, 
  BarChart3, 
  Briefcase, 
  Users, 
  Wallet, 
  Image as ImageIcon, 
  ShieldCheck,
  Star
} from 'lucide-react';
import { Button } from '../components/ui/BaseComponents';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Home() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleDemoLogin = async () => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@lancepro.com', password: 'admin123' })
      });
      const data = await res.json();
      if (data.success) {
        login(data.data);
        toast.success('Login Demo Berhasil!');
        navigate('/dashboard');
      }
    } catch (err) {
      toast.error('Gagal login demo');
    }
  };

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-burgundy-gradient text-white">
        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl font-serif font-bold mb-6 tracking-tight">
              Kelola Proyek Freelance <br /> 
              <span className="text-orange-300 italic">Lebih Profesional.</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-200 mb-10 max-w-3xl mx-auto font-light leading-relaxed">
              Platform all-in-one untuk pelacakan proyek, manajemen klien, keuangan, dan portofolio bagi pekerja kreatif modern.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register">
                <Button className="px-10 py-4 text-lg rounded-full bg-white text-burgundy hover:bg-gray-100 border-none shadow-2xl">
                  Mulai Gratis <ArrowRight className="inline ml-2" />
                </Button>
              </Link>
              <Button 
                onClick={handleDemoLogin}
                variant="secondary" 
                className="px-10 py-4 text-lg rounded-full bg-transparent border-white/30 text-white hover:bg-white/10"
              >
                Lihat Demo
              </Button>
            </div>
          </motion.div>
        </div>
        
        {/* Abstract Background Shapes */}
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-burgundy-light rounded-full blur-[120px] opacity-20"></div>
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-orange-500 rounded-full blur-[120px] opacity-10"></div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { label: 'Total Pengguna', value: '1,200+' },
              { label: 'Proyek Selesai', value: '5,000+' },
              { label: 'Pendapatan Dikelola', value: 'Rp 25M+' },
              { label: 'Rating Kepuasan', value: '4.9/5' }
            ].map((stat, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <div className="text-3xl font-bold text-burgundy mb-1 font-serif">{stat.value}</div>
                <div className="text-sm text-gray-muted uppercase tracking-widest font-semibold">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-serif font-bold text-gray-dark mb-4">Semua Yang Anda Butuhkan</h2>
            <div className="w-20 h-1.5 bg-burgundy mx-auto rounded-full"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: 'Project Tracking', desc: 'Pantau progress proyek secara mendalam dengan checklist dan deadline.', icon: Briefcase },
              { title: 'Client Management', desc: 'Simpan data klien, riwayat komunikasi, dan proyek terkait.', icon: Users },
              { title: 'Invoicing', desc: 'Buat invoice profesional dan pantau status pembayaran secara otomatis.', icon: Wallet },
              { title: 'Portfolio Gallery', desc: 'Pamerkan karya terbaik Anda dalam galeri yang elegan.', icon: ImageIcon },
              { title: 'Dashboard Analytics', desc: 'Lihat ringkasan bisnis Anda melalui grafik pendapatan dan beban kerja.', icon: BarChart3 },
              { title: 'Data Aman', desc: 'Keamanan data Anda adalah prioritas utama kami dengan sistem terenkripsi.', icon: ShieldCheck }
            ].map((feature, idx) => (
              <motion.div 
                key={idx}
                whileHover={{ y: -10 }}
                className="p-8 bg-white border border-gray-100 rounded-3xl shadow-sm hover:shadow-xl transition-all"
              >
                <div className="w-14 h-14 bg-burgundy/10 text-burgundy rounded-2xl flex items-center justify-center mb-6">
                  <feature.icon size={28} />
                </div>
                <h3 className="text-xl font-bold mb-3 font-serif text-burgundy">{feature.title}</h3>
                <p className="text-gray-muted leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-gray-dark text-white overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <h2 className="text-4xl font-serif font-bold text-center mb-20 text-orange-200 uppercase tracking-tighter">Apa Kata Mereka?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { name: 'Rendra', role: 'Graphic Designer', text: 'LancePro merubah cara saya mengelola klien. Sangat intuitif!' },
              { name: 'Siska', role: 'Fullstack Dev', text: 'Fitur invoicing-nya sangat membantu me-manajemen cashflow bulanan saya.' },
              { name: 'Dewo', role: 'Illustrator', text: 'Satu-satunya platform yang mengerti alur kerja freelancer Indonesia.' }
            ].map((t, idx) => (
              <div key={idx} className="relative p-8 bg-white/5 rounded-3xl border border-white/10">
                <Star className="text-orange-300 absolute -top-4 -right-4" fill="currentColor" />
                <p className="text-lg italic mb-6 text-gray-300">"{t.text}"</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-burgundy rounded-full flex items-center justify-center font-bold">{t.name[0]}</div>
                  <div>
                    <div className="font-bold">{t.name}</div>
                    <div className="text-xs text-gray-500">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Footer Banner */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-burgundy px-12 py-16 rounded-[3rem] text-center text-white relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <h2 className="text-4xl font-serif font-bold mb-6">Siap Menjadi Freelancer Elit?</h2>
            <p className="text-xl text-gray-200 mb-10 max-w-xl mx-auto">Daftar sekarang dan kelola bisnis freelance Anda seperti perusahaan profesional.</p>
            <Link to="/register">
              <Button className="px-12 py-5 text-lg rounded-full bg-white text-burgundy hover:bg-gray-100 shadow-2xl transition-transform hover:scale-105">
                Daftar Sekarang Secara Gratis
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Simple Footer */}
      <footer className="py-12 border-t border-gray-100 text-center text-gray-muted text-sm">
        <div className="flex justify-center gap-6 mb-4">
          <Link to="/" className="hover:text-burgundy">Home</Link>
          <Link to="/about" className="hover:text-burgundy">Tentang</Link>
          <a href="#" className="hover:text-burgundy">Privacy Policy</a>
        </div>
        <p>© 2024 LancePro Indonesia. Made with passion for freelancers.</p>
      </footer>
    </div>
  );
}

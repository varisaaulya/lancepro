import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Card, Button } from '../components/ui/BaseComponents';
import { 
  CheckCircle2, 
  Target, 
  Zap, 
  MessageCircle, 
  Instagram, 
  Github, 
  Linkedin,
  MapPin,
  Mail,
  Phone,
  Plus
} from 'lucide-react';

export default function About() {
  return (
    <div className="bg-white">
      {/* Header */}
      <section className="py-20 bg-burgundy text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <h1 className="text-5xl font-serif font-bold mb-6">Tentang LancePro</h1>
            <p className="text-xl text-gray-200 max-w-2xl mx-auto italic font-light">"Memberdayakan Freelancer Indonesia untuk Tumbuh Lebih Cepat dan Profesional."</p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
              <div>
                 <h2 className="text-3xl font-serif font-bold text-burgundy mb-6">Misi Kami</h2>
                 <p className="text-gray-muted leading-relaxed mb-6">
                    LancePro lahir dari kebutuhan nyata para pejuang lepas (freelancer) di era digital. Kami memahami bahwa menjadi freelancer bukan hanya tentang keahlian teknis, tapi juga tentang bagaimana mengelola hubungan bisnis, keuangan, dan track record secara profesional.
                 </p>
                 <p className="text-gray-muted leading-relaxed">
                    Kami hadir untuk menghapus hambatan administratif bagi para kreatif, developer, dan penulis, sehingga mereka bisa fokus pada apa yang mereka lakukan paling baik: <strong>Berkarya.</strong>
                 </p>
                 <div className="mt-8 space-y-4">
                    {[
                      'Menyediakan alat pelacakan proyek yang intuitif',
                      'Mempermudah manajemen keuangan dan invoicing',
                      'Membangun kredibilitas melalui galeri portofolio',
                      'Menciptakan ekosistem bisnis freelance yang sehat'
                    ].map((misi, i) => (
                      <div key={i} className="flex items-start gap-3">
                         <div className="mt-1 w-5 h-5 bg-burgundy/10 text-burgundy rounded-full flex items-center justify-center shrink-0">
                            <CheckCircle2 size={12} />
                         </div>
                         <span className="text-sm font-semibold">{misi}</span>
                      </div>
                    ))}
                 </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-4">
                    <img src="https://picsum.photos/seed/abt1/400/500" className="w-full rounded-[2rem] h-64 object-cover" />
                    <img src="https://picsum.photos/seed/abt2/400/300" className="w-full rounded-[2rem] h-40 object-cover" />
                 </div>
                 <div className="space-y-4 pt-8">
                    <img src="https://picsum.photos/seed/abt3/400/300" className="w-full rounded-[2rem] h-40 object-cover" />
                    <img src="https://picsum.photos/seed/abt4/400/500" className="w-full rounded-[2rem] h-64 object-cover" />
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
           <h2 className="text-3xl font-serif font-bold text-burgundy mb-16">Tim Di Balik Layar</h2>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {[
                { name: 'Ahmad Faisal', role: 'Founder & Architect', img: 'https://picsum.photos/seed/p1/200/200' },
                { name: 'Siti Nurhaliza', role: 'UX Designer', img: 'https://picsum.photos/seed/p2/200/200' },
                { name: 'Dewo Kusuma', role: 'Developer', img: 'https://picsum.photos/seed/p3/200/200' }
              ].map((member, i) => (
                <div key={i} className="group">
                   <div className="w-48 h-48 mx-auto mb-6 rounded-full overflow-hidden border-8 border-white shadow-xl grayscale group-hover:grayscale-0 transition-all duration-500 scale-95 group-hover:scale-100">
                      <img src={member.img} alt={member.name} className="w-full h-full object-cover" />
                   </div>
                   <h3 className="text-xl font-bold font-serif">{member.name}</h3>
                   <p className="text-sm text-gray-muted font-medium uppercase tracking-widest mt-1">{member.role}</p>
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* Accordion FAQ */}
      <section className="py-20">
         <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-serif font-bold text-center mb-12">Paling Sering Ditanyakan</h2>
            <div className="space-y-4">
               {[
                 { q: 'Apakah LancePro benar-benar gratis?', a: 'Ya, Anda bisa menggunakan fitur dasar LancePro secara gratis selamanya.' },
                 { q: 'Bagaimana keamanan data saya?', a: 'Kami menggunakan enkripsi tingkat lanjut dan database terisolasi untuk setiap pengguna.' },
                 { q: 'Dapatkah saya ekspor data invoice?', a: 'Tentu, Anda bisa mendownload data dalam format CSV atau print ke PDF.' },
                 { q: 'Apakah ada aplikasi mobile?', a: 'Saat ini LancePro adalah Progressive Web App yang bisa Anda akses dengan lancar di smartphone melalui browser.' }
               ].map((faq, i) => (
                 <details key={i} className="group bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                    <summary className="p-6 cursor-pointer font-bold flex justify-between items-center list-none hover:bg-gray-50 transition-colors">
                       {faq.q}
                       <Plus size={18} className="group-open:rotate-45 transition-transform" />
                    </summary>
                    <div className="px-6 pb-6 text-gray-muted leading-relaxed border-t border-gray-50 pt-4">
                       {faq.a}
                    </div>
                 </details>
               ))}
            </div>
         </div>
      </section>

      {/* Contact Section */}
      <section className="py-24 bg-burgundy-dark text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
              <div>
                 <h2 className="text-4xl font-serif font-bold mb-8">Hubungi Kami</h2>
                 <p className="text-gray-300 text-lg mb-10 leading-relaxed">
                    Punya pertanyaan atau masukan? Kami senang mendengarnya. Tim bantuan kami siap membantu Anda kapan saja.
                 </p>
                 <div className="space-y-6">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center"><Mail size={24} /></div>
                       <div><div className="text-xs text-gray-400">EMAIL</div><div className="font-bold">halo@lancepro.id</div></div>
                    </div>
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center"><Phone size={24} /></div>
                       <div><div className="text-xs text-gray-400">TELEPON</div><div className="font-bold">+62 812 3456 7890</div></div>
                    </div>
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center"><MapPin size={24} /></div>
                       <div><div className="text-xs text-gray-400">KANTOR</div><div className="font-bold">Jakarta, Indonesia</div></div>
                    </div>
                 </div>
              </div>
              <div className="bg-white/5 p-8 rounded-[2rem] border border-white/10">
                 <h3 className="text-2xl font-serif font-bold mb-6">Sosial Media</h3>
                 <div className="flex gap-4">
                    <a href="#" className="w-14 h-14 bg-white text-burgundy rounded-2xl flex items-center justify-center hover:scale-110 transition-transform"><Instagram size={28} /></a>
                    <a href="#" className="w-14 h-14 bg-white text-burgundy rounded-2xl flex items-center justify-center hover:scale-110 transition-transform"><Github size={28} /></a>
                    <a href="#" className="w-14 h-14 bg-white text-burgundy rounded-2xl flex items-center justify-center hover:scale-110 transition-transform"><Linkedin size={28} /></a>
                 </div>
                 <div className="mt-12 p-6 bg-burgundy rounded-2xl border border-white/10 relative overflow-hidden">
                    <Zap size={64} className="absolute -right-4 -bottom-4 text-white/10 -rotate-12" />
                    <h4 className="font-bold mb-1">Butuh bantuan cepat?</h4>
                    <p className="text-sm text-gray-200">Chat tim kami melalui tombol bantuan di pojok kanan bawah dashboard.</p>
                 </div>
              </div>
           </div>
        </div>
      </section>
    </div>
  );
}

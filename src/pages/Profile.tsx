import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Card, Button, Input } from '../components/ui/BaseComponents';
import { User, Shield, Lock, Bell, MessageSquare, Trash2, Camera } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export default function Profile() {
  const { user, checkAuth } = useAuth();
  const [activeTab, setActiveTab] = useState('profil');
  const [loading, setLoading] = useState(false);

  const [profileData, setProfileData] = useState({
    nama: user?.nama || '',
    profesi: user?.profesi || '',
    bio: user?.bio || '',
    telepon: user?.telepon || '',
    tarif_per_jam: user?.tarif_per_jam || 0
  });

  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(profileData)
      });
      if (res.ok) {
        toast.success('Profil berhasil diperbaharui');
        await checkAuth();
      }
    } catch (err) {
      toast.error('Gagal update profil');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return toast.error('Konfirmasi password tidak cocok');
    }
    setLoading(true);
    try {
      const res = await fetch('/api/profile/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(passwordData)
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Password berhasil diubah');
        setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error('Gagal ganti password');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'profil', icon: User, label: 'Edit Profil' },
    { id: 'password', icon: Shield, label: 'Keamanan' },
    { id: 'pengaturan', icon: Bell, label: 'Preferensi' }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-serif font-bold text-burgundy">Pengaturan Akun</h1>
        <p className="text-gray-muted">Kelola informasi profil dan preferensi keamanan Anda.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-1/3 space-y-4">
          <Card className="p-4 bg-white">
            <div className="flex flex-col items-center p-6 space-y-4 text-center">
              <div className="relative group">
                <div className="w-24 h-24 rounded-full bg-burgundy/10 flex items-center justify-center text-burgundy font-bold text-3xl overflow-hidden border-4 border-white shadow-xl relative z-10">
                  {user?.foto ? <img src={user.foto} className="w-full h-full object-cover" /> : user?.nama[0]}
                </div>
                <button className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-lg border border-gray-100 text-burgundy hover:scale-110 transition-transform z-20">
                  <Camera size={14} />
                </button>
              </div>
              <div>
                <h3 className="font-bold text-lg">{user?.nama}</h3>
                <p className="text-sm text-gray-muted">{user?.profesi || 'Profesional Freelancer'}</p>
                <div className="mt-2 text-xs bg-burgundy/5 text-burgundy px-3 py-1 rounded-full font-bold uppercase">{user?.role}</div>
              </div>
            </div>
          </Card>

          <Card className="p-2">
             {tabs.map(tab => (
               <button
                 key={tab.id}
                 onClick={() => setActiveTab(tab.id)}
                 className={cn(
                   "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm",
                   activeTab === tab.id ? "bg-burgundy text-white shadow-lg shadow-burgundy/20" : "text-gray-dark hover:bg-gray-50"
                 )}
               >
                 <tab.icon size={18} /> {tab.label}
               </button>
             ))}
          </Card>
        </div>

        <div className="flex-1">
          <AnimatePresence mode="wait">
            {activeTab === 'profil' ? (
              <motion.div key="profil" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <Card className="p-8">
                  <h3 className="text-xl font-bold font-serif mb-6 flex items-center gap-2"><User className="text-burgundy" /> lnformasi Dasar</h3>
                  <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <Input label="Nama Lengkap" value={profileData.nama} onChange={e => setProfileData({...profileData, nama: e.target.value})} />
                    <Input label="Spesialisasi / Profesi" value={profileData.profesi} onChange={e => setProfileData({...profileData, profesi: e.target.value})} />
                    <Input label="Telepon" value={profileData.telepon} onChange={e => setProfileData({...profileData, telepon: e.target.value})} />
                    <Input label="Tarif Per Jam (Rp)" type="number" value={profileData.tarif_per_jam} onChange={e => setProfileData({...profileData, tarif_per_jam: parseInt(e.target.value)})} />
                    <div className="space-y-1.5">
                      <label className="block text-sm font-semibold text-gray-700">Bio Singkat</label>
                      <textarea 
                        value={profileData.bio} 
                        onChange={e => setProfileData({...profileData, bio: e.target.value})}
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl outline-none min-h-[120px] focus:ring-2 focus:ring-burgundy/10"
                      />
                    </div>
                    <Button type="submit" disabled={loading} className="w-full">
                      {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
                    </Button>
                  </form>
                </Card>
              </motion.div>
            ) : activeTab === 'password' ? (
              <motion.div key="password" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <Card className="p-8">
                   <h3 className="text-xl font-bold font-serif mb-6 flex items-center gap-2"><Lock className="text-burgundy" /> Ganti Password</h3>
                   <form onSubmit={handleUpdatePassword} className="space-y-4">
                     <Input label="Password Lama" type="password" value={passwordData.oldPassword} onChange={e => setPasswordData({...passwordData, oldPassword: e.target.value})} required />
                     <Input label="Password Baru" type="password" value={passwordData.newPassword} onChange={e => setPasswordData({...passwordData, newPassword: e.target.value})} required />
                     <Input label="Konfirmasi Password Baru" type="password" value={passwordData.confirmPassword} onChange={e => setPasswordData({...passwordData, confirmPassword: e.target.value})} required />
                     <Button type="submit" disabled={loading} className="w-full mt-4">Update Keamanan</Button>
                   </form>
                </Card>
              </motion.div>
            ) : (
                <motion.div key="pengaturan" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <Card className="p-8">
                     <h3 className="text-xl font-bold font-serif mb-6 flex items-center gap-2"><Bell className="text-burgundy" /> Preferensi Sistem</h3>
                     <div className="space-y-6">
                        <ToggleItem icon={Bell} title="Notifikasi Email" desc="Terima ringkasan progres proyek harian Anda via email." />
                        <ToggleItem icon={MessageSquare} title="Pesan Langsung" desc="Izinkan orang lain mengirim pesan via profil portofolio." />
                        <div className="pt-6 border-t border-gray-100">
                           <h4 className="text-red-600 font-bold flex items-center gap-2 mb-2"><Trash2 size={16} /> Area Berbahaya</h4>
                           <p className="text-sm text-gray-muted mb-4">Menghapus akun Anda akan menghilangkan semua data proyek, klien, dan portofolio secara permanen.</p>
                           <Button variant="danger" className="w-full flex items-center justify-center gap-2">Hapus Akun Saya</Button>
                        </div>
                     </div>
                  </Card>
                </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function ToggleItem({ icon: Icon, title, desc }: { icon: any, title: string, desc: string }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex gap-4">
        <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-muted">
          <Icon size={20} />
        </div>
        <div>
          <div className="font-bold text-gray-dark">{title}</div>
          <div className="text-xs text-gray-muted">{desc}</div>
        </div>
      </div>
      <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 cursor-pointer">
         <span className="inline-block h-4 w-4 transform rounded-full bg-white transition translate-x-1" />
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Mail, 
  Phone, 
  MapPin, 
  MoreVertical,
  Trash2,
  Edit3,
  ExternalLink,
  ChevronRight,
  Building2
} from 'lucide-react';
import { Card, Button, Input, Modal } from '../components/ui/BaseComponents';
import { cn } from '../lib/utils';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

export default function Clients() {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<any>(null);

  const [formData, setFormData] = useState({
    nama: '',
    perusahaan: '',
    email: '',
    telepon: '',
    alamat: '',
    catatan: '',
    status: 'Aktif'
  });

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const res = await fetch('/api/clients', { credentials: 'include' });
      const data = await res.json();
      if (data.success) setClients(data.data);
    } catch (err) {
      toast.error('Gagal memuat klien');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingClient ? 'PUT' : 'POST';
    const url = editingClient ? `/api/clients/${editingClient.id}` : '/api/clients';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        toast.success(editingClient ? 'Klien diperbarui' : 'Klien ditambahkan');
        setIsModalOpen(false);
        setEditingClient(null);
        setFormData({ nama: '', perusahaan: '', email: '', telepon: '', alamat: '', catatan: '', status: 'Aktif' });
        fetchClients();
      }
    } catch (err) {
      toast.error('Gagal menyimpan klien');
    }
  };

  const filteredClients = clients.filter(c => 
    c.nama.toLowerCase().includes(search.toLowerCase()) || 
    c.perusahaan.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-burgundy">Klien Saya</h1>
          <p className="text-gray-muted">Kelola daftar kontak klien dan perusahaan mereka.</p>
        </div>
        <Button onClick={() => { setEditingClient(null); setIsModalOpen(true); }} className="flex items-center gap-2">
          <Plus size={20} /> Tambah Klien
        </Button>
      </div>

      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Cari nama klien atau perusahaan..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy outline-none"
          />
        </div>
      </Card>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3].map(i => <div key={i} className="h-48 bg-gray-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClients.map((client) => (
            <Card key={client.id} className="group hover:shadow-xl transition-all">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-white text-xl shadow-lg",
                    client.id % 2 === 0 ? "bg-burgundy" : "bg-gray-dark"
                  )}>
                    {client.nama[0]}
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => { setEditingClient(client); setFormData(client); setIsModalOpen(true); }} className="p-2 hover:bg-gray-100 rounded-lg text-gray-muted"><Edit3 size={16} /></button>
                  </div>
                </div>

                <h3 className="text-xl font-bold font-serif mb-1">{client.nama}</h3>
                <p className="text-sm text-gray-muted flex items-center gap-1.5 mb-6"><Building2 size={16} /> {client.perusahaan}</p>
                
                <div className="space-y-3 pt-4 border-t border-gray-50">
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Mail size={16} className="text-burgundy" /> {client.email}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Phone size={16} className="text-burgundy" /> {client.telepon}
                  </div>
                </div>

                <div className="mt-6">
                  <Link to={`/clients/${client.id}`} className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-burgundy/5 group/link transition-all">
                    <span className="text-sm font-bold text-gray-dark group-hover/link:text-burgundy">Detail Lengkap</span>
                    <ChevronRight size={16} className="text-gray-400 group-hover/link:text-burgundy" />
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingClient ? 'Edit Klien' : 'Tambah Klien Baru'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Nama Lengkap" value={formData.nama} onChange={(e) => setFormData({...formData, nama: e.target.value})} required />
          <Input label="Nama Perusahaan" value={formData.perusahaan} onChange={(e) => setFormData({...formData, perusahaan: e.target.value})} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Email" type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
            <Input label="Telepon" value={formData.telepon} onChange={(e) => setFormData({...formData, telepon: e.target.value})} />
          </div>
          <Input label="Alamat" value={formData.alamat} onChange={(e) => setFormData({...formData, alamat: e.target.value})} />
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-gray-700">Status</label>
            <select 
              value={formData.status} 
              onChange={(e) => setFormData({...formData, status: e.target.value})}
              className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy outline-none"
            >
              <option value="Aktif">Aktif</option>
              <option value="Tidak Aktif">Tidak Aktif</option>
            </select>
          </div>
          <Button type="submit" className="w-full py-3 mt-4">
            {editingClient ? 'Simpan Perubahan' : 'Tambah Klien'}
          </Button>
        </form>
      </Modal>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  LayoutGrid, 
  List, 
  MoreVertical, 
  Trash2, 
  Edit3,
  Calendar,
  Layers,
  Flag,
  CheckCircle2,
  Circle,
  Users
} from 'lucide-react';
import { Card, Button, Input, Modal } from '../components/ui/BaseComponents';
import { formatCurrency, formatDate, cn } from '../lib/utils';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'motion/react';

export default function Projects() {
  const [projects, setProjects] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'grid' | 'table'>('grid');
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<any>(null);

  // Form State
  const [formData, setFormData] = useState({
    client_id: '',
    nama: '',
    deskripsi: '',
    kategori: 'Web Design',
    nilai_kontrak: 0,
    status: 'Perencanaan',
    prioritas: 'Sedang',
    progress: 0,
    tanggal_mulai: '',
    deadline: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [projRes, clientRes] = await Promise.all([
        fetch('/api/projects', { credentials: 'include' }),
        fetch('/api/clients', { credentials: 'include' })
      ]);
      const projData = await projRes.json();
      const clientData = await clientRes.json();
      if (projData.success) setProjects(projData.data);
      if (clientData.success) setClients(clientData.data);
    } catch (err) {
      toast.error('Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingProject ? 'PUT' : 'POST';
    const url = editingProject ? `/api/projects/${editingProject.id}` : '/api/projects';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        toast.success(editingProject ? 'Proyek diperbarui' : 'Proyek ditambahkan');
        setIsModalOpen(false);
        setEditingProject(null);
        setFormData({
          client_id: '',
          nama: '',
          deskripsi: '',
          kategori: 'Web Design',
          nilai_kontrak: 0,
          status: 'Perencanaan',
          prioritas: 'Sedang',
          progress: 0,
          tanggal_mulai: '',
          deadline: '',
        });
        fetchData();
      }
    } catch (err) {
      toast.error('Gagal menyimpan proyek');
    }
  };

  const handleDelete = async (id: number, name: string) => {
    const confirmName = window.prompt(`Ketik "${name}" untuk konfirmasi hapus:`);
    if (confirmName !== name) return;

    try {
      const res = await fetch(`/api/projects/${id}`, { method: 'DELETE', credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        toast.success('Proyek dihapus');
        fetchData();
      }
    } catch (err) {
      toast.error('Gagal menghapus proyek');
    }
  };

  const openEditModal = (p: any) => {
    setEditingProject(p);
    setFormData({
      client_id: p.client_id,
      nama: p.nama,
      deskripsi: p.deskripsi || '',
      kategori: p.kategori,
      nilai_kontrak: p.nilai_kontrak,
      status: p.status,
      prioritas: p.prioritas,
      progress: p.progress,
      tanggal_mulai: p.tanggal_mulai || '',
      deadline: p.deadline || '',
    });
    setIsModalOpen(true);
  };

  const filteredProjects = projects.filter(p => 
    p.nama.toLowerCase().includes(search.toLowerCase()) || 
    p.client_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-burgundy">Proyek Saya</h1>
          <p className="text-gray-muted">Daftar semua proyek yang sedang Anda kerjakan.</p>
        </div>
        <Button onClick={() => { setEditingProject(null); setIsModalOpen(true); }} className="flex items-center gap-2">
          <Plus size={20} /> Tambah Proyek
        </Button>
      </div>

      <Card className="p-4">
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Cari nama proyek atau klien..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy outline-none"
            />
          </div>
          <div className="flex items-center gap-2 border-l border-gray-200 pl-4">
            <button 
              onClick={() => setView('grid')}
              className={cn("p-2 rounded-lg transition-colors", view === 'grid' ? "bg-burgundy text-white" : "hover:bg-gray-100 text-gray-muted")}
            >
              <LayoutGrid size={20} />
            </button>
            <button 
              onClick={() => setView('table')}
              className={cn("p-2 rounded-lg transition-colors", view === 'table' ? "bg-burgundy text-white" : "hover:bg-gray-100 text-gray-muted")}
            >
              <List size={20} />
            </button>
          </div>
        </div>
      </Card>

      {loading ? (
        <div className="p-8 text-center text-gray-500">Memuat proyek...</div>
      ) : (
        <>
          {view === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((p) => (
                <ProjectCard key={p.id} project={p} onEdit={() => openEditModal(p)} onDelete={() => handleDelete(p.id, p.nama)} />
              ))}
            </div>
          ) : (
            <Card className="overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-xs font-semibold uppercase text-gray-muted tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Proyek</th>
                    <th className="px-6 py-4">Klien</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Progress</th>
                    <th className="px-6 py-4">Deadline</th>
                    <th className="px-6 py-4">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredProjects.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-medium">{p.nama}</td>
                      <td className="px-6 py-4 text-sm text-gray-muted">{p.client_name}</td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "px-2 py-1 rounded-full text-[10px] font-bold uppercase",
                          p.status === 'Selesai' ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
                        )}>
                          {p.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="bg-burgundy h-full" style={{ width: `${p.progress}%` }} />
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">{formatDate(p.deadline)}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button onClick={() => openEditModal(p)} className="p-1 hover:text-blue-600"><Edit3 size={16} /></button>
                          <button onClick={() => handleDelete(p.id, p.nama)} className="p-1 hover:text-red-600"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          )}
        </>
      )}

      {/* Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingProject ? 'Edit Proyek' : 'Tambah Proyek Baru'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Nama Proyek" value={formData.nama} onChange={(e) => setFormData({...formData, nama: e.target.value})} required />
          
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-gray-700">Pilih Klien</label>
            <select 
              value={formData.client_id} 
              onChange={(e) => setFormData({...formData, client_id: e.target.value})}
              className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy outline-none"
              required
            >
              <option value="">Pilih Klien...</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.nama} ({c.perusahaan})</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label="Kategori" value={formData.kategori} onChange={(e) => setFormData({...formData, kategori: e.target.value})} />
            <Input label="Nilai Kontrak (Rp)" type="number" value={formData.nilai_kontrak} onChange={(e) => setFormData({...formData, nilai_kontrak: parseInt(e.target.value)})} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-gray-700">Status</label>
              <select 
                value={formData.status} 
                onChange={(e) => setFormData({...formData, status: e.target.value})}
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy outline-none"
              >
                <option value="Perencanaan">Perencanaan</option>
                <option value="Dalam Pengerjaan">Dalam Pengerjaan</option>
                <option value="Tertunda">Tertunda</option>
                <option value="Selesai">Selesai</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-gray-700">Prioritas</label>
              <select 
                value={formData.prioritas} 
                onChange={(e) => setFormData({...formData, prioritas: e.target.value})}
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy outline-none"
              >
                <option value="Rendah">Rendah</option>
                <option value="Sedang">Sedang</option>
                <option value="Tinggi">Tinggi</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-gray-700">Progress ({formData.progress}%)</label>
            <input 
              type="range" 
              min="0" max="100" 
              value={formData.progress} 
              onChange={(e) => setFormData({...formData, progress: parseInt(e.target.value)})}
              className="w-full accent-burgundy"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label="Mulai" type="date" value={formData.tanggal_mulai} onChange={(e) => setFormData({...formData, tanggal_mulai: e.target.value})} />
            <Input label="Deadline" type="date" value={formData.deadline} onChange={(e) => setFormData({...formData, deadline: e.target.value})} />
          </div>

          <Button type="submit" className="w-full py-3 mt-4">
            {editingProject ? 'Simpan Perubahan' : 'Tambah Proyek'}
          </Button>
        </form>
      </Modal>
    </div>
  );
}

function ProjectCard({ project, onEdit, onDelete }: { project: any, onEdit: () => void, onDelete: () => void }) {
  return (
    <Card className="hover:shadow-xl transition-all group flex flex-col h-full bg-white relative">
      <div className="p-6 flex-1">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-2">
            <span className={cn(
              "p-1.5 rounded-lg",
              project.prioritas === 'Tinggi' ? "bg-red-100 text-red-600" : 
              project.prioritas === 'Sedang' ? "bg-orange-100 text-orange-600" : "bg-green-100 text-green-600"
            )}>
              <Flag size={14} fill="currentColor" />
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-muted">{project.kategori}</span>
          </div>
          <div className="flex gap-1">
            <button onClick={onEdit} className="p-2 hover:bg-gray-100 rounded-lg text-gray-muted transition-colors"><Edit3 size={16} /></button>
            <button onClick={onDelete} className="p-2 hover:bg-gray-100 rounded-lg text-red-400 transition-colors"><Trash2 size={16} /></button>
          </div>
        </div>

        <h3 className="text-xl font-bold font-serif mb-1 text-gray-dark group-hover:text-burgundy transition-colors">{project.nama}</h3>
        <p className="text-sm text-gray-muted mb-4 flex items-center gap-1"><Users size={14} /> {project.client_name}</p>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-gray-muted">Progress</span>
            <span className="font-bold text-burgundy">{project.progress}%</span>
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${project.progress}%` }}
              className="h-full bg-burgundy rounded-full"
            />
          </div>
        </div>
      </div>
      
      <div className="px-6 py-4 border-t border-gray-50 bg-gray-50/50 flex justify-between items-center">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-muted">
          <Calendar size={14} /> {formatDate(project.deadline)}
        </div>
        <div className="text-sm font-bold text-burgundy">
          {formatCurrency(project.nilai_kontrak)}
        </div>
      </div>
    </Card>
  );
}

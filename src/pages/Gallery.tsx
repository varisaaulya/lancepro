import { useState, useEffect } from 'react';
import { Plus, Trash2, Maximize2, Upload, Filter, Grid3X3 } from 'lucide-react';
import { Card, Button, Input, Modal } from '../components/ui/BaseComponents';
import { cn } from '../lib/utils';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'motion/react';

export default function Gallery() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState('Semua');
  const [selectedImage, setSelectedImage] = useState<any>(null);

  const [formData, setFormData] = useState<any>({
    judul: '',
    deskripsi: '',
    kategori: 'Web Design',
    tahun: new Date().getFullYear().toString(),
    file: null
  });

  const categories = ['Semua', 'Web Design', 'Mobile App', 'Branding', 'Ilustrasi', 'Lainnya'];

  useEffect(() => {
    fetchGallery();
  }, []);

  const fetchGallery = async () => {
    try {
      const res = await fetch('/api/gallery', { credentials: 'include' });
      const data = await res.json();
      if (data.success) setItems(data.data);
    } catch (err) {
      toast.error('Gagal memuat galeri');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append('judul', formData.judul);
    fd.append('deskripsi', formData.deskripsi);
    fd.append('kategori', formData.kategori);
    fd.append('tahun', formData.tahun);
    if (formData.file) fd.append('gambar', formData.file);

    try {
      const res = await fetch('/api/gallery', {
        method: 'POST',
        credentials: 'include',
        body: fd
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Karya ditambahkan ke portofolio');
        setIsModalOpen(false);
        fetchGallery();
      }
    } catch (err) {
      toast.error('Gagal upload');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Hapus karya ini dari galeri?')) return;
    try {
      const res = await fetch(`/api/gallery/${id}`, { method: 'DELETE', credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        toast.success('Berhasil dihapus');
        fetchGallery();
      }
    } catch (err) {
      toast.error('Gagal menghapus');
    }
  };

  const filteredItems = activeFilter === 'Semua' ? items : items.filter(i => i.kategori === activeFilter);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-burgundy">Galeri Portofolio</h1>
          <p className="text-gray-muted">Pamerkan hasil karya terbaik Anda kepada dunia.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
          <Plus size={20} /> Upload Karya
        </Button>
      </div>

      <div className="flex flex-wrap gap-2 pb-2">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveFilter(cat)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-semibold transition-all border",
              activeFilter === cat ? "bg-burgundy text-white border-burgundy shadow-md shadow-burgundy/20" : "bg-white text-gray-muted border-gray-100 hover:bg-gray-50"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1,2,3].map(i => <div key={i} className="aspect-square bg-gray-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredItems.map((item) => (
            <motion.div 
              key={item.id} 
              layout 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }}
              className="group"
            >
              <Card className="overflow-hidden relative flex flex-col h-full bg-white transition-all group-hover:shadow-2xl active:scale-[0.98]">
                <div className="aspect-[4/3] relative overflow-hidden bg-gray-100">
                  <img 
                    src={item.gambar} 
                    alt={item.judul} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <button onClick={() => setSelectedImage(item)} className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-burgundy shadow-xl"><Maximize2 size={20} /></button>
                    <button onClick={() => handleDelete(item.id)} className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-red-500 shadow-xl"><Trash2 size={20} /></button>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-burgundy bg-burgundy/5 px-2 py-1 rounded-md">{item.kategori}</span>
                    <span className="text-[10px] font-bold text-gray-400">{item.tahun}</span>
                  </div>
                  <h3 className="text-lg font-bold font-serif mb-2 line-clamp-1">{item.judul}</h3>
                  <p className="text-sm text-gray-muted line-clamp-2">{item.deskripsi}</p>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Upload Karya Baru">
        <form onSubmit={handleUpload} className="space-y-4">
          <Input label="Judul Karya" value={formData.judul} onChange={(e) => setFormData({...formData, judul: e.target.value})} required />
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-gray-700">Kategori</label>
              <select 
                value={formData.kategori} 
                onChange={(e) => setFormData({...formData, kategori: e.target.value})}
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl outline-none" required
              >
                {categories.filter(c => c !== 'Semua').map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <Input label="Tahun" value={formData.tahun} onChange={(e) => setFormData({...formData, tahun: e.target.value})} />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-gray-700">File Gambar</label>
            <div className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center hover:border-burgundy transition-colors cursor-pointer relative">
              <input type="file" onChange={(e) => setFormData({...formData, file: e.target.files?.[0]})} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
              <div className="text-gray-muted flex flex-col items-center">
                <Upload size={32} className="mb-2" />
                <p className="text-sm font-semibold">{formData.file ? formData.file.name : 'Klik atau seret gambar ke sini'}</p>
                <p className="text-xs mt-1">JPG, PNG, WebP (Maks 2MB)</p>
              </div>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-gray-700">Deskripsi Singkat</label>
            <textarea 
              value={formData.deskripsi} 
              onChange={(e) => setFormData({...formData, deskripsi: e.target.value})}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl outline-none min-h-[100px]"
            />
          </div>
          <Button type="submit" className="w-full py-3 mt-4">Simpan Portofolio</Button>
        </form>
      </Modal>

      {/* Lightbox / Preview */}
      <AnimatePresence>
        {selectedImage && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedImage(null)} className="absolute inset-0 bg-black/90" />
             <motion.div 
               initial={{ scale: 0.9, opacity: 0 }} 
               animate={{ scale: 1, opacity: 1 }} 
               exit={{ scale: 0.9, opacity: 0 }}
               className="relative max-w-5xl w-full max-h-screen p-4 flex flex-col items-center justify-center"
             >
                <img src={selectedImage.gambar} alt={selectedImage.judul} className="max-w-full max-h-[80vh] rounded-2xl object-contain shadow-2xl" />
                <div className="mt-6 text-center text-white">
                   <h2 className="text-2xl font-serif font-bold">{selectedImage.judul}</h2>
                   <p className="text-gray-400 mt-1">{selectedImage.kategori} • {selectedImage.tahun}</p>
                   <p className="mt-4 max-w-xl text-gray-300">{selectedImage.deskripsi}</p>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

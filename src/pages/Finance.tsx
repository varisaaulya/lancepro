import { useState, useEffect } from 'react';
import { 
  Plus, 
  Wallet, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2, 
  FileText, 
  Download, 
  Send,
  Trash2
} from 'lucide-react';
import { Card, Button, Input, Modal } from '../components/ui/BaseComponents';
import { formatCurrency, formatDate, cn } from '../lib/utils';
import toast from 'react-hot-toast';

export default function Finance() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    client_id: '',
    project_id: '',
    nomor_invoice: `INV-${Date.now().toString().slice(-4)}`,
    items: [{ nama: '', qty: 1, harga: 0, subtotal: 0 }],
    diskon: 0,
    pajak: 0,
    status: 'Belum Dibayar',
    catatan: '',
    tanggal_jatuh_tempo: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [invRes, clientRes, projRes] = await Promise.all([
        fetch('/api/invoices', { credentials: 'include' }),
        fetch('/api/clients', { credentials: 'include' }),
        fetch('/api/projects', { credentials: 'include' })
      ]);
      const invData = await invRes.json();
      const clientData = await clientRes.json();
      const projData = await projRes.json();
      if (invData.success) setInvoices(invData.data);
      if (clientData.success) setClients(clientData.data);
      if (projData.success) setProjects(projData.data);
    } catch (err) {
      toast.error('Gagal memuat data keuangan');
    } finally {
      setLoading(false);
    }
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { nama: '', qty: 1, harga: 0, subtotal: 0 }]
    });
  };

  const removeItem = (idx: number) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== idx)
    });
  };

  const updateItem = (idx: number, field: string, val: any) => {
    const newItems = [...formData.items];
    newItems[idx] = { ...newItems[idx], [field]: val };
    if (field === 'qty' || field === 'harga') {
      newItems[idx].subtotal = newItems[idx].qty * newItems[idx].harga;
    }
    setFormData({ ...formData, items: newItems });
  };

  const calculateTotal = () => {
    const subtotal = formData.items.reduce((sum, item) => sum + item.subtotal, 0);
    const diskonVal = (formData.diskon / 100) * subtotal;
    const pajakVal = (formData.pajak / 100) * subtotal;
    return subtotal - diskonVal + pajakVal;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const total = calculateTotal();
    const subtotal = formData.items.reduce((sum, item) => sum + item.subtotal, 0);
    
    try {
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ...formData, total, subtotal })
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Invoice berhasil dibuat');
        setIsModalOpen(false);
        fetchData();
      }
    } catch (err) {
      toast.error('Gagal membuat invoice');
    }
  };

  const handleStatusChange = async (id: number, status: string) => {
    try {
      const res = await fetch(`/api/invoices/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Status invoice berhasil diubah menjadi ${status}`);
        fetchData();
      } else {
        toast.error(data.message || 'Gagal mengubah status');
      }
    } catch (err) {
      toast.error('Gagal menghubungi server');
    }
  };

  const handleDeleteInvoice = async (id: number) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus invoice ini?')) {
      return;
    }
    try {
      const res = await fetch(`/api/invoices/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Invoice berhasil dihapus');
        fetchData();
      } else {
        toast.error(data.message || 'Gagal menghapus invoice');
      }
    } catch (err) {
      toast.error('Gagal menghubungi server');
    }
  };

  const stats = {
    totalRevenue: invoices.filter(i => i.status === 'Lunas').reduce((sum, i) => sum + i.total, 0),
    unpaid: invoices.filter(i => i.status === 'Belum Dibayar').reduce((sum, i) => sum + i.total, 0),
    overdue: invoices.filter(i => i.status === 'Jatuh Tempo').reduce((sum, i) => sum + i.total, 0),
    paidCount: invoices.filter(i => i.status === 'Lunas').length,
    count: invoices.length
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-burgundy">Keuangan & Invoice</h1>
          <p className="text-gray-muted">Monitor arus kas dan tagihan proyek Anda.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
          <Plus size={20} /> Buat Invoice
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Total Pendapatan" value={formatCurrency(stats.totalRevenue)} icon={<TrendingUp className="text-green-500" />} />
        <StatCard label="Tagihan Tertunda" value={formatCurrency(stats.unpaid)} icon={<AlertCircle className="text-orange-500" />} />
        <StatCard label="Sudah Dibayar" value={stats.paidCount} icon={<CheckCircle2 className="text-blue-500" />} desc="Invoice Lunas" />
        <StatCard label="Jatuh Tempo" value={formatCurrency(stats.overdue)} icon={<FileText className="text-red-500" />} />
      </div>

      <Card className="overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-lg font-bold">Daftar Invoice</h3>
          <Button variant="secondary" onClick={() => window.open('/api/export/projects')}>Export CSV</Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-xs font-semibold uppercase text-gray-muted tracking-wider">
              <tr>
                <th className="px-6 py-4">Nomor</th>
                <th className="px-6 py-4">Klien</th>
                <th className="px-6 py-4">Proyek</th>
                <th className="px-6 py-4">Jumlah</th>
                <th className="px-6 py-4">Jatuh Tempo</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-bold text-burgundy">{inv.nomor_invoice}</td>
                  <td className="px-6 py-4 text-sm">{inv.client_name}</td>
                  <td className="px-6 py-4 text-sm text-gray-muted">{inv.project_name}</td>
                  <td className="px-6 py-4 font-semibold">{formatCurrency(inv.total)}</td>
                  <td className="px-6 py-4 text-sm">{formatDate(inv.tanggal_jatuh_tempo)}</td>
                  <td className="px-6 py-4">
                    <select
                      value={inv.status}
                      onChange={(e) => handleStatusChange(inv.id, e.target.value)}
                      className={cn(
                        "px-3 py-1 rounded-full text-xs font-bold uppercase cursor-pointer border border-transparent outline-none focus:ring-2 focus:ring-burgundy/20 transition-all",
                        inv.status === 'Lunas' ? "bg-green-100 text-green-700 hover:bg-green-200" :
                        inv.status === 'Jatuh Tempo' ? "bg-red-100 text-red-700 hover:bg-red-200" : "bg-orange-100 text-orange-700 hover:bg-orange-200"
                      )}
                    >
                      <option value="Belum Dibayar" className="bg-white text-gray-800">Belum Dibayar</option>
                      <option value="Lunas" className="bg-white text-gray-800">Lunas</option>
                      <option value="Jatuh Tempo" className="bg-white text-gray-800">Jatuh Tempo</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                       <button title="Kirim Pengingat" onClick={() => toast.success('Pengingat dikirim ke klien!')} className="p-1 hover:text-burgundy transition-colors"><Send size={16} /></button>
                       <button title="Print / PDF" onClick={() => window.print()} className="p-1 hover:text-gray-900 transition-colors"><Download size={16} /></button>
                       <button title="Hapus Invoice" onClick={() => handleDeleteInvoice(inv.id)} className="p-1 text-red-500 hover:text-red-700 transition-colors"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Buat Invoice Baru">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-gray-700">Klien</label>
              <select 
                value={formData.client_id} 
                onChange={(e) => setFormData({...formData, client_id: e.target.value})}
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-burgundy/20 outline-none" required
              >
                <option value="">Pilih Klien...</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.nama}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-gray-700">Proyek</label>
              <select 
                value={formData.project_id} 
                onChange={(e) => setFormData({...formData, project_id: e.target.value})}
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-burgundy/20 outline-none" required
              >
                <option value="">Pilih Proyek...</option>
                {projects.filter(p => p.client_id.toString() === formData.client_id).map(p => <option key={p.id} value={p.id}>{p.nama}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-bold border-b pb-2">Item Layanan</h4>
            {formData.items.map((item, idx) => (
              <div key={idx} className="flex gap-2 items-end">
                <div className="flex-1"><Input placeholder="Nama layanan" value={item.nama} onChange={(e) => updateItem(idx, 'nama', e.target.value)} required /></div>
                <div className="w-16"><Input type="number" placeholder="Qty" value={item.qty} onChange={(e) => updateItem(idx, 'qty', parseInt(e.target.value))} required /></div>
                <div className="w-32"><Input type="number" placeholder="Harga" value={item.harga} onChange={(e) => updateItem(idx, 'harga', parseInt(e.target.value))} required /></div>
                <button type="button" onClick={() => removeItem(idx)} className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl"><Trash2 size={20} /></button>
              </div>
            ))}
            <Button type="button" variant="secondary" onClick={addItem} className="w-full flex items-center justify-center gap-2">
              <Plus size={16} /> Tambah Baris Layanan
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label="Diskon (%)" type="number" value={formData.diskon} onChange={(e) => setFormData({...formData, diskon: parseInt(e.target.value)})} />
            <Input label="Pajak (%)" type="number" value={formData.pajak} onChange={(e) => setFormData({...formData, pajak: parseInt(e.target.value)})} />
          </div>

          <div className="p-4 bg-gray-50 rounded-2xl flex justify-between items-center text-lg font-bold">
            <span className="text-gray-muted">Total Estimasi</span>
            <span className="text-burgundy">{formatCurrency(calculateTotal())}</span>
          </div>

          <Input label="Jatuh Tempo" type="date" value={formData.tanggal_jatuh_tempo} onChange={(e) => setFormData({...formData, tanggal_jatuh_tempo: e.target.value})} required />

          <Button type="submit" className="w-full py-4 text-lg">Buat & Simpan Invoice</Button>
        </form>
      </Modal>
    </div>
  );
}

function StatCard({ label, value, icon, desc }: { label: string, value: any, icon: React.ReactNode, desc?: string }) {
  return (
    <Card className="p-6">
      <div className="flex justify-between items-start mb-4">
        <div className="p-2 bg-gray-50 rounded-xl">{icon}</div>
      </div>
      <div className="text-sm font-medium text-gray-muted mb-1">{label}</div>
      <div className="text-2xl font-bold text-gray-dark">{value}</div>
      {desc && <div className="text-[10px] text-gray-400 mt-1 uppercase tracking-wider">{desc}</div>}
    </Card>
  );
}

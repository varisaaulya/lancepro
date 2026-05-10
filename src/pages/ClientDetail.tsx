import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  ArrowLeft,
  Briefcase,
  FileText,
  MessageSquare
} from 'lucide-react';
import { Card, Button } from '../components/ui/BaseComponents';
import { formatCurrency, formatDate, cn } from '../lib/utils';
import toast from 'react-hot-toast';

export default function ClientDetail() {
  const { id } = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClient();
  }, [id]);

  const fetchClient = async () => {
    try {
      const res = await fetch(`/api/clients/${id}`, { credentials: 'include' });
      const json = await res.json();
      if (json.success) setData(json.data);
    } catch (err) {
      toast.error('Gagal mengambil data klien');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Memuat detail klien...</div>;
  if (!data) return <div className="p-8 text-center text-red-500">Klien tidak ditemukan.</div>;

  return (
    <div className="space-y-8">
      <Link to="/clients" className="flex items-center gap-2 text-gray-muted hover:text-burgundy transition-colors">
        <ArrowLeft size={18} /> Kembali ke Daftar Klien
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <Card className="p-8 text-center">
          <div className="w-24 h-24 rounded-3xl bg-burgundy flex items-center justify-center text-white text-4xl font-bold mx-auto mb-6 shadow-xl shadow-burgundy/20">
            {data.nama[0]}
          </div>
          <h1 className="text-2xl font-serif font-bold text-gray-dark">{data.nama}</h1>
          <p className="text-gray-muted mb-6 flex items-center justify-center gap-1.5"><Building2 size={16} /> {data.perusahaan}</p>
          
          <div className="flex justify-center gap-4 mb-8">
             <div className="text-center px-4 py-2 bg-gray-50 rounded-xl">
                <div className="text-xs text-gray-400 font-bold uppercase">Proyek</div>
                <div className="text-lg font-bold text-burgundy">{data.projects?.length || 0}</div>
             </div>
             <div className="text-center px-4 py-2 bg-gray-50 rounded-xl">
                <div className="text-xs text-gray-400 font-bold uppercase">Nilai</div>
                <div className="text-lg font-bold text-burgundy">
                   {formatCurrency(data.projects?.reduce((sum: number, p: any) => sum + p.nilai_kontrak, 0) || 0)}
                </div>
             </div>
          </div>

          <div className="space-y-4 text-left border-t border-gray-50 pt-6">
             <div className="flex items-center gap-3 text-sm">
                <Mail size={16} className="text-burgundy" /> <span className="text-gray-600 truncate">{data.email}</span>
             </div>
             <div className="flex items-center gap-3 text-sm">
                <Phone size={16} className="text-burgundy" /> <span className="text-gray-600">{data.telepon}</span>
             </div>
             <div className="flex items-start gap-3 text-sm">
                <MapPin size={16} className="text-burgundy mt-1" /> <span className="text-gray-600 leading-relaxed">{data.alamat}</span>
             </div>
          </div>
          
          <Button variant="secondary" className="w-full mt-8">Hubungi Klien</Button>
        </Card>

        {/* Details and Projects */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="p-8">
             <h3 className="text-xl font-bold font-serif mb-4 flex items-center gap-2"><MessageSquare size={20} className="text-burgundy" /> Catatan Rekanan</h3>
             <p className="text-gray-muted leading-relaxed italic">{data.catatan || 'Tidak ada catatan khusus untuk klien ini.'}</p>
          </Card>

          <Card className="overflow-hidden">
             <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h3 className="text-lg font-bold flex items-center gap-2">
                   <Briefcase size={20} className="text-burgundy" /> Daftar Proyek Terkait
                </h3>
             </div>
             <div className="divide-y divide-gray-100">
                {data.projects && data.projects.length > 0 ? data.projects.map((p: any) => (
                  <div key={p.id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                     <div>
                        <div className="font-bold text-gray-dark flex items-center gap-2">
                           {p.nama}
                           <span className={cn(
                             "text-[8px] px-1.5 py-0.5 rounded-full font-black uppercase text-white shadow-sm",
                             p.status === 'Selesai' ? "bg-green-500" : "bg-burgundy"
                           )}>{p.status}</span>
                        </div>
                        <div className="text-xs text-gray-muted mt-1">{p.kategori} • Deadline: {formatDate(p.deadline)}</div>
                     </div>
                     <div className="text-right">
                        <div className="font-bold text-burgundy">{formatCurrency(p.nilai_kontrak)}</div>
                        <div className="text-[10px] text-gray-400 font-bold uppercase transition-all flex items-center gap-1 justify-end">
                           <FileText size={10} /> {p.progress}% Progress
                        </div>
                     </div>
                  </div>
                )) : (
                  <div className="p-12 text-center text-gray-400 italic">Belum ada proyek terdaftar.</div>
                )}
             </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

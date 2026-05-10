import { useState, useEffect } from 'react';
import { 
  BarChart3, 
  PieChart as PieChartIcon, 
  Clock, 
  DollarSign, 
  AlertCircle, 
  CheckCircle2,
  Calendar,
  ArrowUpRight,
  ClipboardList,
  Briefcase
} from 'lucide-react';
import { Card, Button } from '../components/ui/BaseComponents';
import { formatCurrency, formatDate, cn } from '../lib/utils';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { motion } from 'motion/react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function Dashboard() {
  const { checkAuth } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/dashboard/stats', { credentials: 'include' });
      
      if (res.status === 401) {
        toast.error('Sesi Anda telah berakhir. Silakan login kembali.');
        checkAuth(); // This will update the user state and potentially redirect to login
        return;
      }

      const data = await res.json();
      if (data.success) {
        setStats(data.data);
      } else {
        toast.error(data.message || 'Gagal mengambil data dashboard');
      }
    } catch (err) {
      console.error('Fetch error:', err);
      toast.error('Gagal terhubung ke server. Periksa koneksi Anda.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="w-10 h-10 border-4 border-burgundy border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 font-medium italic">Memuat data dashboard...</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-8 text-center space-y-4">
        <AlertCircle size={48} className="mx-auto text-red-500" />
        <h2 className="text-xl font-bold">Terjadi Kesalahan</h2>
        <p className="text-gray-500">Gagal memuat data statistik dashboard Anda.</p>
        <Button onClick={fetchStats}>Coba Lagi</Button>
      </div>
    );
  }

  const revenueData = {
    labels: stats?.revenueHistory?.length > 0 
      ? stats.revenueHistory.map((h: any) => h.month).reverse() 
      : ['No Data'],
    datasets: [
      {
        label: 'Pendapatan (IDR)',
        data: stats?.revenueHistory?.length > 0 
          ? stats.revenueHistory.map((h: any) => h.total).reverse() 
          : [0],
        backgroundColor: '#6B1A2A',
        borderRadius: 8,
      },
    ],
  };

  const statusData = {
    labels: stats?.statusDistribution?.length > 0 
      ? stats.statusDistribution.map((s: any) => s.status) 
      : ['No Status'],
    datasets: [
      {
        data: stats?.statusDistribution?.length > 0 
          ? stats.statusDistribution.map((s: any) => s.count) 
          : [1],
        backgroundColor: ['#6B1A2A', '#8E2338', '#4D121E', '#3A3A3C', '#F27D26'],
        borderWidth: 0,
      },
    ],
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-serif font-bold text-burgundy">Ringkasan Bisnis</h1>
        <p className="text-gray-muted">Selamat datang kembali! Berikut kondisi proyek Anda hari ini.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={<Briefcase className="text-blue-500" />} 
          label="Proyek Aktif" 
          value={stats.activeProjects.count} 
          desc="Sedang dikerjakan" 
        />
        <StatCard 
          icon={<DollarSign className="text-green-500" />} 
          label="Pendapatan Bulan Ini" 
          value={formatCurrency(stats.monthlyIncome.sum || 0)} 
          desc="Berdasarkan invoice lunas" 
        />
        <StatCard 
          icon={<AlertCircle className="text-red-500" />} 
          label="Tagihan Tertunda" 
          value={stats.unpaidInvoices.count} 
          desc="Belum dibayar" 
        />
        <StatCard 
          icon={<Calendar className="text-purple-500" />} 
          label="Deadline Minggu Ini" 
          value={stats.upcomingDeadlines.count} 
          desc="Perlu perhatian" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 p-6">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <BarChart3 size={20} className="text-burgundy" /> Pendapatan 6 Bulan Terakhir
          </h3>
          <div className="h-[300px]">
            <Bar 
              data={revenueData} 
              options={{ 
                responsive: true, 
                maintainAspectRatio: false,
                plugins: { legend: { display: false } } 
              }} 
            />
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <PieChartIcon size={20} className="text-burgundy" /> Distribusi Proyek
          </h3>
          <div className="h-[300px] flex items-center justify-center">
            <Doughnut 
              data={statusData} 
              options={{ 
                responsive: true, 
                maintainAspectRatio: false,
                plugins: { legend: { position: 'bottom' } } 
              }} 
            />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 p-0 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <ClipboardList size={20} className="text-burgundy" /> Proyek Terbaru
            </h3>
            <Button variant="ghost" className="text-sm">Lihat Semua</Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-muted">
                <tr>
                  <th className="px-6 py-3 font-semibold">Proyek</th>
                  <th className="px-6 py-3 font-semibold">Klien</th>
                  <th className="px-6 py-3 font-semibold">Status</th>
                  <th className="px-6 py-3 font-semibold">Nilai</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {stats.recentProjects.map((p: any) => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-dark">{p.nama}</td>
                    <td className="px-6 py-4 text-sm text-gray-muted">{p.client_name}</td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-2 py-1 rounded-full text-[10px] font-bold uppercase",
                        p.status === 'Selesai' ? "bg-green-100 text-green-700" :
                        p.status === 'Dalam Pengerjaan' ? "bg-blue-100 text-blue-700" :
                        "bg-gray-100 text-gray-700"
                      )}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold">{formatCurrency(p.nilai_kontrak)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="p-0 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Clock size={20} className="text-burgundy" /> Aktivitas Terkini
            </h3>
          </div>
          <div className="p-6 space-y-6">
            {stats.activities.map((a: any) => (
              <div key={a.id} className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-burgundy/10 flex items-center justify-center shrink-0">
                  <ArrowUpRight size={14} className="text-burgundy" />
                </div>
                <div>
                  <div className="text-sm font-bold text-gray-dark">{a.aksi}</div>
                  <div className="text-xs text-gray-muted">{a.keterangan}</div>
                  <div className="text-[10px] text-gray-400 mt-1">{formatDate(a.created_at)}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, desc }: { icon: React.ReactNode, label: string, value: any, desc: string }) {
  return (
    <Card className="p-4 border-l-4 border-l-burgundy/50 hover:shadow-medium transition-all active:scale-[0.98]">
      <div className="text-[11px] text-gray-muted font-bold uppercase tracking-widest mb-1">{label}</div>
      <div className="text-2xl font-bold text-gray-dark mb-1">{value}</div>
      <div className="text-[10px] text-gray-400 font-medium">{desc}</div>
    </Card>
  );
}

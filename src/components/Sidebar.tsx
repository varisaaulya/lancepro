import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Briefcase, 
  Users, 
  Wallet, 
  Image as ImageIcon, 
  Settings,
  X
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

const menuItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/projects', label: 'Proyek', icon: Briefcase },
  { path: '/clients', label: 'Klien', icon: Users },
  { path: '/finance', label: 'Keuangan', icon: Wallet },
  { path: '/gallery', label: 'Galeri', icon: ImageIcon },
  { path: '/profile', label: 'Pengaturan', icon: Settings },
];

export default function Sidebar({ isMobile, onToggle }: { isMobile?: boolean, onToggle?: () => void }) {
  const location = useLocation();

  return (
    <div className={cn(
      "flex flex-col bg-burgundy text-white shrink-0",
      isMobile 
        ? "w-full h-full" 
        : "hidden md:flex w-[220px] h-screen sticky top-0 shadow-xl z-40"
    )}>
      <div className="p-6 mb-4 flex justify-between items-center">
        <div>
          <h1 className="font-serif text-3xl">LancePro</h1>
          <p className="text-[10px] opacity-60 tracking-widest uppercase mt-1">Project Tracker v1.0</p>
        </div>
        {isMobile && (
          <button onClick={onToggle} className="p-2 hover:bg-white/10 rounded-full">
            <X size={20} />
          </button>
        )}
      </div>
      <nav className="flex-1 px-3 space-y-1">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onToggle}
              className={cn(
                "group flex items-center px-4 py-3 text-sm rounded-lg transition-all relative overflow-hidden",
                isActive 
                  ? "bg-white/15 border-l-4 border-white font-bold" 
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              )}
            >
              <item.icon className={cn("mr-3 h-5 w-5 opacity-70", isActive ? "opacity-100" : "")} />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 bg-black/10 mx-3 mb-6 rounded-xl italic text-[10px] text-white/40 text-center">
        © 2024 LancePro v1.0
      </div>
    </div>
  );
}

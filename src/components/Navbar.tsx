import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, Menu, X, Bell, Moon, Sun } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export default function Navbar({ onMenuClick }: { onMenuClick?: () => void }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const toggleMobileMenu = () => {
    if (user && onMenuClick) {
      onMenuClick();
    } else {
      setMobileMenuOpen(!mobileMenuOpen);
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 h-16 shrink-0 flex items-center shadow-sm">
      <div className="w-full px-8 flex justify-between items-center">
        <div className="flex items-center">
          <Link to="/" className="flex-shrink-0 flex items-center gap-2">
            {!user && (
              <>
                <div className="w-8 h-8 bg-burgundy rounded-lg flex items-center justify-center text-white font-bold">LP</div>
                <span className="text-xl font-serif font-bold text-burgundy tracking-tight">LancePro</span>
              </>
            )}
            {user && <span className="text-lg font-bold text-gray-dark">Dashboard</span>}
          </Link>
        </div>

        <div className="hidden md:flex items-center space-x-6">
          {!user && (
            <>
              <Link to="/" className="text-gray-dark hover:text-burgundy font-medium transition-colors">Home</Link>
              <Link to="/about" className="text-gray-dark hover:text-burgundy font-medium transition-colors">Tentang</Link>
              <div className="flex items-center gap-4">
                <Link to="/login" className="text-gray-dark hover:text-burgundy font-medium">Login</Link>
                <Link to="/register" className="bg-burgundy text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm">Daftar Akun</Link>
              </div>
            </>
          )}
          
          {user && (
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 bg-gray-soft px-3 py-1.5 rounded-full text-[11px] font-bold text-gray-muted">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span> Database Online
              </div>
              <div className="flex items-center gap-4 text-gray-muted">
                <button className="hover:text-burgundy"><Bell size={18} /></button>
                <button className="hover:text-burgundy"><Moon size={18} /></button>
                
                <div className="relative">
                  <button 
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-burgundy flex items-center justify-center text-white text-xs font-bold ring-2 ring-offset-2 ring-transparent group-hover:ring-burgundy/10 transition-all">
                      {user.foto ? <img src={user.foto} className="w-full h-full rounded-full object-cover" /> : user.nama[0]}
                    </div>
                  </button>
                  <AnimatePresence>
                    {userDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-1"
                      >
                        <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                          <User size={16} /> Profil
                        </Link>
                        <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                          <LogOut size={16} /> Logout
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="md:hidden flex items-center">
          <button onClick={toggleMobileMenu} className="text-gray-dark p-2 hover:bg-gray-100 rounded-lg transition-colors">
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-gray-100 overflow-hidden"
          >
            <div className="px-4 py-4 space-y-3">
              <Link to="/" className="block text-gray-dark font-medium">Home</Link>
              <Link to="/about" className="block text-gray-dark font-medium">Tentang</Link>
              {user ? (
                <>
                  <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="block text-gray-dark font-medium">Dashboard</Link>
                  <Link to="/projects" onClick={() => setMobileMenuOpen(false)} className="block text-gray-dark font-medium">Proyek</Link>
                  <Link to="/clients" onClick={() => setMobileMenuOpen(false)} className="block text-gray-dark font-medium">Klien</Link>
                  <Link to="/finance" onClick={() => setMobileMenuOpen(false)} className="block text-gray-dark font-medium">Keuangan</Link>
                  <Link to="/gallery" onClick={() => setMobileMenuOpen(false)} className="block text-gray-dark font-medium">Galeri</Link>
                  <Link to="/profile" onClick={() => setMobileMenuOpen(false)} className="block text-gray-dark font-medium">Profil</Link>
                  <button onClick={handleLogout} className="block text-red-600 font-medium w-full text-left pt-2 border-t border-gray-100">Logout</button>
                </>
              ) : (
                <>
                  <Link to="/login" className="block text-gray-dark font-medium">Login</Link>
                  <Link to="/register" className="block bg-burgundy text-white px-4 py-2 rounded-lg text-center">Daftar</Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

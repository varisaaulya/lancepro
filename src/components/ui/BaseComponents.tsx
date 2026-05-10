import React from 'react';
import { cn } from '../../lib/utils';
import { motion } from 'motion/react';
import { X } from 'lucide-react';

// --- Card ---
export const Card = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={cn("bg-white rounded-xl border border-gray-100 shadow-tight overflow-hidden", className)}>
    {children}
  </div>
);

// --- Button ---
export const Button = ({ 
  children, 
  variant = 'primary', 
  className, 
  ...props 
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'danger' | 'ghost' }) => {
  const variants = {
    primary: "bg-burgundy text-white hover:bg-burgundy-light shadow-sm",
    secondary: "bg-white text-burgundy border border-gray-200 hover:bg-gray-50",
    danger: "bg-red-500 text-white hover:bg-red-600",
    ghost: "bg-transparent text-gray-muted hover:text-burgundy hover:bg-burgundy/5"
  };
  return (
    <button 
      className={cn("px-4 py-2 rounded-lg font-bold text-sm transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100", variants[variant], className)}
      {...props}
    >
      {children}
    </button>
  );
};

// --- Input ---
export const Input = ({ label, className, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label?: string }) => (
  <div className="space-y-1">
    {label && <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-muted">{label}</label>}
    <input 
      className={cn("w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-burgundy/5 focus:border-burgundy outline-none transition-all placeholder:text-gray-300", className)}
      {...props}
    />
  </div>
);

// --- Modal ---
export const Modal = ({ isOpen, onClose, title, children }: { isOpen: boolean, onClose: () => void, title: string, children: React.ReactNode }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-gray-dark/50 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h3 className="text-xl font-bold text-burgundy font-serif">{title}</h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="p-6 max-h-[80vh] overflow-y-auto">
          {children}
        </div>
      </motion.div>
    </div>
  );
};

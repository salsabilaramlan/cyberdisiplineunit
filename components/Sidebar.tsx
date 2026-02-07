import React from 'react';
import { LayoutDashboard, Users, PieChart, ShieldAlert, Cpu } from 'lucide-react';
import { ViewMode } from '../types';

interface SidebarProps {
  currentView: ViewMode;
  onChangeView: (view: ViewMode) => void;
  onOpenSettings: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView }) => {
  const menuItems = [
    { id: ViewMode.DASHBOARD, label: 'Papan Kawalan Utama', icon: LayoutDashboard },
    { id: ViewMode.LIST, label: 'Direktori Pelajar', icon: Users },
    { id: ViewMode.ANALYTICS, label: 'Analitik Perisikan', icon: PieChart },
  ];

  return (
    <aside className="flex flex-col w-72 h-screen bg-slate-950/90 border-r border-cyan-900/50 backdrop-blur-xl relative overflow-hidden z-20 shadow-[5px_0_30px_rgba(0,0,0,0.5)]">
      {/* Decorative Glow & Lines */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-80 animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none"></div>
      
      {/* Header Section */}
      <div className="p-6 mb-2 relative">
        <div className="absolute top-4 right-4 animate-spin-slow opacity-20">
           <Cpu className="w-12 h-12 text-cyan-500" />
        </div>

        <div className="flex items-center space-x-3 mb-2 relative z-10">
          <div className="bg-gradient-to-br from-cyan-900 to-slate-900 p-2.5 rounded-xl border border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.4)]">
            <ShieldAlert className="w-8 h-8 text-cyan-400" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-2xl font-black text-white tracking-tighter font-mono italic leading-none">
              SK <span className="text-cyan-400">SATU</span>
            </h1>
            <span className="text-[10px] font-bold text-cyan-200 tracking-[0.1em] uppercase">Sultan Alam Shah</span>
          </div>
        </div>
        
        <div className="mt-3 border-t border-slate-800 pt-3">
            <p className="text-[9px] text-fuchsia-400 font-mono uppercase tracking-widest flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-fuchsia-500 animate-ping"></span>
                CYBER DISCIPLINE UNIT
            </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-3 mt-4">
        {menuItems.map((item) => {
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onChangeView(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-4 rounded-xl transition-all duration-300 group border ${
                isActive 
                  ? 'bg-gradient-to-r from-cyan-900/40 to-slate-900 border-cyan-500/50 text-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.15)] translate-x-1' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/60 border-transparent hover:border-slate-700'
              }`}
            >
              <item.icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${isActive ? 'text-cyan-400 drop-shadow-[0_0_5px_rgba(34,211,238,0.8)]' : ''}`} />
              <span className={`font-medium tracking-wide ${isActive ? 'font-bold' : ''}`}>{item.label}</span>
              {isActive && (
                 <div className="ml-auto flex space-x-1">
                    <div className="w-1 h-4 bg-cyan-500/50 skew-x-[-12deg]"></div>
                    <div className="w-1 h-4 bg-cyan-400 skew-x-[-12deg]"></div>
                 </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Area */}
      <div className="p-6 border-t border-slate-800/50 bg-black/20">
        <div className="flex justify-between items-end">
             <div className="text-[10px] text-slate-500 font-mono">
              SYSTEM: <span className="text-emerald-500">ONLINE</span><br/>
              VER: <span className="text-slate-400">3.0.1 ALPHA</span>
            </div>
            <div className="text-[10px] text-right text-slate-600 font-mono uppercase">
                SK SATU SAS<br/>
                INTELLIGENCE
            </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
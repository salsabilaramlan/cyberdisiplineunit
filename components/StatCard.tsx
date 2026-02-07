import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  color?: 'cyan' | 'fuchsia' | 'emerald' | 'amber';
}

const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  color = 'cyan' 
}) => {
  const colorMap = {
    cyan: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/5 shadow-cyan-500/10',
    fuchsia: 'text-fuchsia-400 border-fuchsia-500/30 bg-fuchsia-500/5 shadow-fuchsia-500/10',
    emerald: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/5 shadow-emerald-500/10',
    amber: 'text-amber-400 border-amber-500/30 bg-amber-500/5 shadow-amber-500/10',
  };

  const activeColor = colorMap[color];

  return (
    <div className={`relative p-5 rounded-xl border backdrop-blur-md transition-all duration-300 hover:scale-[1.02] ${activeColor}`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-slate-100 font-mono tracking-tight">{value}</h3>
          {subtitle && <p className="text-xs text-slate-500 mt-2">{subtitle}</p>}
        </div>
        <div className={`p-2 rounded-lg bg-slate-950/50 border border-white/5`}>
          <Icon className="w-6 h-6 opacity-80" />
        </div>
      </div>
      
      {/* Decor corners */}
      <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-white/20 rounded-tr-sm"></div>
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-white/20 rounded-bl-sm"></div>
    </div>
  );
};

export default StatCard;
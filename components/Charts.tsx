import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area
} from 'recharts';

// Custom Tooltip for Futuristic Look
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/95 border border-cyan-500/50 p-3 rounded-lg shadow-[0_0_15px_rgba(6,182,212,0.2)] backdrop-blur-xl">
        <p className="text-cyan-400 font-bold text-sm mb-1">{label}</p>
        <p className="text-white text-xs font-mono">
          Jumlah: <span className="text-cyan-300 text-lg">{payload[0].value}</span>
        </p>
      </div>
    );
  }
  return null;
};

interface TrendChartProps {
  data: any[];
}

export const TrendChart: React.FC<TrendChartProps> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
        <XAxis 
          dataKey="date" 
          stroke="#64748b" 
          fontSize={12} 
          tickMargin={10} 
          tickLine={false}
          axisLine={false}
        />
        <YAxis 
          stroke="#64748b" 
          fontSize={12} 
          tickLine={false}
          axisLine={false}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area 
          type="monotone" 
          dataKey="count" 
          stroke="#06b6d4" 
          strokeWidth={3}
          fillOpacity={1} 
          fill="url(#colorCount)" 
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export const ClassBarChart: React.FC<{ data: any[] }> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} layout="vertical" margin={{ left: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
        <XAxis type="number" stroke="#64748b" fontSize={12} hide />
        <YAxis 
          dataKey="className" 
          type="category" 
          stroke="#94a3b8" 
          fontSize={11} 
          tickLine={false}
          axisLine={false}
          width={70}
        />
        <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} content={<CustomTooltip />} />
        <Bar dataKey="count" fill="#d946ef" radius={[0, 4, 4, 0]} barSize={15} />
      </BarChart>
    </ResponsiveContainer>
  );
};
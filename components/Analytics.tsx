import React, { useState, useMemo } from 'react';
import { LateRecord } from '../types';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { Calendar, Users, Trophy, TrendingUp, Filter } from 'lucide-react';

interface AnalyticsProps {
  data: LateRecord[];
  onStudentClick: (name: string) => void;
}

const MONTH_NAMES_MY = [
  "Januari", "Februari", "Mac", "April", "Mei", "Jun",
  "Julai", "Ogos", "September", "Oktober", "November", "Disember"
];

const Analytics: React.FC<AnalyticsProps> = ({ data, onStudentClick }) => {
  // 1. Dapatkan senarai bulan yang wujud dalam data
  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    data.forEach(d => {
      const date = new Date(d.timestamp);
      // Format YYYY-MM untuk sorting
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      months.add(key);
    });
    return Array.from(months).sort().reverse(); // Terkini dahulu
  }, [data]);

  const [selectedMonthKey, setSelectedMonthKey] = useState<string>(availableMonths[0] || '');

  // Update selected month if data loads later
  React.useEffect(() => {
    if (!selectedMonthKey && availableMonths.length > 0) {
        setSelectedMonthKey(availableMonths[0]);
    }
  }, [availableMonths]);

  // 2. Data Statistik Keseluruhan (Trend Tahunan)
  const annualTrendData = useMemo(() => {
    const stats: Record<string, number> = {};
    availableMonths.forEach(m => stats[m] = 0); // Init 0
    
    data.forEach(d => {
        const date = new Date(d.timestamp);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        stats[key] = (stats[key] || 0) + 1;
    });

    return Object.keys(stats).sort().map(key => {
        const [year, month] = key.split('-');
        return {
            name: `${MONTH_NAMES_MY[parseInt(month) - 1]}`,
            fullKey: key,
            count: stats[key]
        };
    });
  }, [data, availableMonths]);

  // 3. Data Spesifik Bulan Pilihan
  const monthlyStats = useMemo(() => {
    if (!selectedMonthKey) return null;

    const filtered = data.filter(d => {
        const date = new Date(d.timestamp);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        return key === selectedMonthKey;
    });

    // Cari Murid Kerap Lewat
    const studentCounts: Record<string, { count: number, class: string, id: string }> = {};
    filtered.forEach(d => {
        if (!studentCounts[d.studentName]) {
            studentCounts[d.studentName] = { count: 0, class: d.className, id: d.studentId };
        }
        studentCounts[d.studentName].count++;
    });

    const topStudents = Object.entries(studentCounts)
        .map(([name, info]) => ({ name, ...info }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10); // Top 10

    // Cari Kelas Paling Bermasalah Bulan Ini
    const classCounts: Record<string, number> = {};
    filtered.forEach(d => classCounts[d.className] = (classCounts[d.className] || 0) + 1);
    const topClass = Object.entries(classCounts).sort((a, b) => b[1] - a[1])[0];

    return {
        total: filtered.length,
        topStudents,
        topClass: topClass ? { name: topClass[0], count: topClass[1] } : null
    };
  }, [data, selectedMonthKey]);

  // Format label bulan pilihan
  const displayMonthLabel = useMemo(() => {
      if (!selectedMonthKey) return "Tiada Data";
      const [year, month] = selectedMonthKey.split('-');
      return `${MONTH_NAMES_MY[parseInt(month) - 1]} ${year}`;
  }, [selectedMonthKey]);

  if (data.length === 0) {
      return <div className="p-10 text-center text-slate-500">Tiada data untuk dianalisis.</div>;
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900/95 border border-fuchsia-500/50 p-3 rounded-lg shadow-[0_0_15px_rgba(232,121,249,0.2)] backdrop-blur-xl">
          <p className="text-fuchsia-400 font-bold text-sm mb-1">{label}</p>
          <p className="text-white text-xs font-mono">
            Jumlah: <span className="text-fuchsia-300 text-lg">{payload[0].value}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      
      {/* 1. Header & Selector */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4 bg-slate-900/50 backdrop-blur-md p-4 md:p-6 rounded-2xl border border-slate-800">
        <div>
            <h2 className="text-2xl font-bold text-white tracking-wide flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-fuchsia-400" />
                Analisis Bulanan
            </h2>
            <p className="text-slate-400 text-sm mt-1">Laporan terperinci trend kehadiran lewat.</p>
        </div>
        
        <div className="relative group min-w-[200px] w-full md:w-auto">
             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar className="h-4 w-4 text-fuchsia-400" />
            </div>
            <select 
                value={selectedMonthKey}
                onChange={(e) => setSelectedMonthKey(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 focus:border-fuchsia-500 focus:ring-1 focus:ring-fuchsia-500 appearance-none cursor-pointer outline-none font-mono text-sm"
            >
                {availableMonths.map(m => {
                    const [y, mon] = m.split('-');
                    return <option key={m} value={m}>{MONTH_NAMES_MY[parseInt(mon)-1]} {y}</option>;
                })}
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <Filter className="h-3 w-3 text-slate-500" />
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 2. Carta Bar Tahunan */}
        <div className="lg:col-span-2 bg-slate-900/50 backdrop-blur-md border border-slate-800 p-4 md:p-6 rounded-2xl">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center">
                <span className="w-1 h-6 bg-slate-500 mr-3 rounded-full"></span>
                Trend Keseluruhan ({new Date().getFullYear()})
            </h3>
            <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={annualTrendData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                        <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip content={<CustomTooltip />} cursor={{stroke: '#e879f9', strokeWidth: 2}} />
                        <Line 
                            type="monotone" 
                            dataKey="count" 
                            stroke="#e879f9" 
                            strokeWidth={3}
                            dot={{r: 4, fill: '#1e293b', strokeWidth: 2, stroke: '#e879f9'}}
                            activeDot={{r: 6, fill: '#e879f9'}}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* 3. Ringkasan Bulan Pilihan */}
        <div className="space-y-6">
            <div className="bg-gradient-to-br from-fuchsia-900/20 to-slate-900 border border-fuchsia-500/30 p-6 rounded-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-fuchsia-500/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                <p className="text-fuchsia-300 text-xs font-bold uppercase tracking-widest mb-2">Bulan Pilihan</p>
                <h3 className="text-3xl font-bold text-white mb-1">{displayMonthLabel}</h3>
                <div className="mt-6 flex justify-between items-end">
                    <div>
                        <p className="text-slate-400 text-xs">Jumlah Kes</p>
                        <p className="text-2xl font-mono text-fuchsia-400">{monthlyStats?.total || 0}</p>
                    </div>
                    {monthlyStats?.topClass && (
                        <div className="text-right">
                             <p className="text-slate-400 text-xs">Kelas Kritikal</p>
                             <p className="text-lg font-bold text-white">{monthlyStats.topClass.name}</p>
                             <p className="text-xs text-fuchsia-400/80">{monthlyStats.topClass.count} kes</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl">
                 <h4 className="text-white font-bold mb-4 flex items-center">
                    <Users className="w-4 h-4 mr-2 text-cyan-400" /> Statistik Ringkas
                 </h4>
                 <div className="space-y-4 text-sm">
                    <div className="flex justify-between border-b border-slate-800 pb-2">
                        <span className="text-slate-400">Purata Harian</span>
                        <span className="text-white font-mono">
                            {monthlyStats ? (monthlyStats.total / 20).toFixed(1) : 0} <span className="text-xs text-slate-500">anggaran</span>
                        </span>
                    </div>
                    <div className="flex justify-between border-b border-slate-800 pb-2">
                        <span className="text-slate-400">Murid Unik</span>
                        <span className="text-white font-mono">{monthlyStats?.topStudents.length || 0}</span>
                    </div>
                 </div>
            </div>
        </div>
      </div>

      {/* 4. Senarai Murid Kerap Lewat (Top Violators) */}
      <div className="bg-slate-900/50 backdrop-blur-md border border-red-900/30 p-4 md:p-6 rounded-2xl shadow-lg mt-6">
        <h3 className="text-lg font-bold text-white mb-6 flex items-center">
            <Trophy className="w-5 h-5 text-amber-400 mr-2" />
            Murid Kerap Lewat ({displayMonthLabel})
        </h3>
        
        <div className="overflow-x-auto rounded-xl border border-slate-800/50">
            <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead>
                    <tr className="bg-slate-950/80 text-slate-400 text-xs uppercase tracking-wider border-b border-slate-800">
                        <th className="p-3 md:p-4 w-16 text-center">Rank</th>
                        <th className="p-3 md:p-4">Nama Pelajar</th>
                        <th className="p-3 md:p-4">ID</th>
                        <th className="p-3 md:p-4">Kelas</th>
                        <th className="p-3 md:p-4 text-center">Kekerapan</th>
                        <th className="p-3 md:p-4">Status</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                    {monthlyStats?.topStudents.map((s, idx) => (
                        <tr key={idx} className="hover:bg-slate-800/40 transition-colors group cursor-pointer" onClick={() => onStudentClick(s.name)}>
                            <td className="p-3 md:p-4 text-center font-mono">
                                {idx === 0 ? <span className="text-2xl">🥇</span> : 
                                 idx === 1 ? <span className="text-2xl">🥈</span> :
                                 idx === 2 ? <span className="text-2xl">🥉</span> : 
                                 <span className="text-slate-500">#{idx + 1}</span>}
                            </td>
                            <td className="p-3 md:p-4 font-medium text-slate-200 group-hover:text-cyan-400 transition-colors underline decoration-dotted decoration-slate-600 underline-offset-4">{s.name}</td>
                            <td className="p-3 md:p-4 text-xs text-cyan-400 font-mono">{s.id}</td>
                            <td className="p-3 md:p-4 text-xs text-slate-400">{s.class}</td>
                            <td className="p-3 md:p-4 text-center">
                                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-500/20 text-red-400 font-bold text-sm border border-red-500/30">
                                    {s.count}
                                </span>
                            </td>
                            <td className="p-3 md:p-4">
                                {s.count >= 3 ? (
                                    <span className="px-2 py-1 bg-red-900/30 text-red-400 text-[10px] rounded border border-red-900/50 font-bold uppercase tracking-wider">
                                        Perlu Kaunseling
                                    </span>
                                ) : (
                                    <span className="px-2 py-1 bg-amber-900/30 text-amber-400 text-[10px] rounded border border-amber-900/50 font-bold uppercase tracking-wider">
                                        Amaran
                                    </span>
                                )}
                            </td>
                        </tr>
                    ))}
                    {(!monthlyStats || monthlyStats.topStudents.length === 0) && (
                        <tr>
                            <td colSpan={6} className="p-12 text-center text-slate-500 italic">
                                Tiada rekod kelewatan untuk bulan ini. Tahniah!
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
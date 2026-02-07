import React, { useMemo } from 'react';
import { LateRecord } from '../types';
import { X, BrainCircuit, Activity, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface StudentAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentName: string | null;
  data: LateRecord[];
}

const StudentAnalysisModal: React.FC<StudentAnalysisModalProps> = ({ isOpen, onClose, studentName, data }) => {
  const stats = useMemo(() => {
    if (!studentName) return null;
    const records = data.filter(r => r.studentName === studentName);
    const totalLate = records.length;
    
    // Calculate average minutes
    const avgMinutes = totalLate > 0 
      ? Math.round(records.reduce((acc, curr) => acc + curr.minutesLate, 0) / totalLate) 
      : 0;

    // Last record
    const lastRecord = records.length > 0 ? records[0] : null; // Assumes sorted desc

    // Trend graph data (last 5 incidents)
    const trendData = records.slice(0, 10).reverse().map(r => ({
      date: new Date(r.timestamp).toLocaleDateString('ms-MY', {day: '2-digit', month: '2-digit'}),
      minutes: r.minutesLate
    }));

    // AI Prediction / Status
    let status = "NORMAL";
    let color = "text-emerald-400";
    let message = "Pola kehadiran pelajar ini masih terkawal.";

    if (totalLate > 5) {
        status = "KRITIKAL";
        color = "text-red-500";
        message = "Pelajar ini menunjukkan corak kelewatan tegar. Sesi kaunseling amat disyorkan.";
    } else if (totalLate > 2) {
        status = "BERISIKO";
        color = "text-amber-400";
        message = "Kekerapan lewat semakin meningkat. Perlu diberi teguran.";
    }

    return { totalLate, avgMinutes, lastRecord, trendData, status, color, message, records };
  }, [studentName, data]);

  if (!isOpen || !stats) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-slate-900 border border-cyan-500/30 rounded-2xl w-full max-w-2xl shadow-[0_0_50px_rgba(6,182,212,0.15)] overflow-hidden animate-fade-in flex flex-col max-h-[90vh]">
        
        {/* Header with AI Animation */}
        <div className="p-6 border-b border-slate-800 bg-slate-900/50 flex justify-between items-start relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent animate-pulse"></div>
          
          <div className="flex gap-4 items-center relative z-10">
            <div className="w-16 h-16 rounded-full bg-slate-800 border border-cyan-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                <span className="text-2xl font-bold text-white">{studentName?.charAt(0)}</span>
            </div>
            <div>
                <div className="flex items-center gap-2 mb-1">
                    <BrainCircuit className="w-4 h-4 text-cyan-400 animate-pulse" />
                    <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest">AI ANALYSIS</span>
                </div>
                <h2 className="text-2xl font-bold text-white">{studentName}</h2>
                <p className="text-slate-400 text-sm">{stats.lastRecord?.className || 'Pelajar'}</p>
            </div>
          </div>

          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors bg-slate-800 p-2 rounded-full hover:bg-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar">
          
          {/* Main KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800 flex flex-col items-center justify-center text-center">
                <span className="text-slate-400 text-xs uppercase mb-1">Jumlah Lewat</span>
                <span className="text-4xl font-bold text-white font-mono">{stats.totalLate}x</span>
             </div>
             <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800 flex flex-col items-center justify-center text-center">
                <span className="text-slate-400 text-xs uppercase mb-1">Purata Masa</span>
                <span className="text-4xl font-bold text-fuchsia-400 font-mono">+{stats.avgMinutes}m</span>
             </div>
             <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800 flex flex-col items-center justify-center text-center relative overflow-hidden">
                <div className={`absolute inset-0 opacity-10 ${stats.status === 'KRITIKAL' ? 'bg-red-500' : 'bg-emerald-500'}`}></div>
                <span className="text-slate-400 text-xs uppercase mb-1">Status AI</span>
                <span className={`text-xl font-bold ${stats.color} tracking-widest`}>{stats.status}</span>
             </div>
          </div>

          {/* AI Insight Box */}
          <div className="bg-gradient-to-r from-cyan-900/20 to-slate-900 border border-cyan-500/20 p-5 rounded-xl flex gap-4">
             <BrainCircuit className="w-8 h-8 text-cyan-400 shrink-0 mt-1" />
             <div>
                <h4 className="text-cyan-100 font-bold mb-1">Analisis Corak Tingkah Laku</h4>
                <p className="text-slate-300 text-sm leading-relaxed">{stats.message}</p>
             </div>
          </div>

          {/* Trend Chart */}
          <div className="bg-slate-800/30 p-4 rounded-xl border border-slate-700">
            <h4 className="text-slate-400 text-xs font-bold uppercase mb-4 flex items-center gap-2">
                <Activity className="w-4 h-4" /> Trend 10 Rekod Terkini (Minit Lewat)
            </h4>
            <div className="h-32 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={stats.trendData}>
                        <defs>
                            <linearGradient id="colorMin" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#d946ef" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#d946ef" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <Tooltip 
                            contentStyle={{backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px'}}
                            itemStyle={{color: '#e2e8f0'}}
                        />
                        <Area type="monotone" dataKey="minutes" stroke="#d946ef" strokeWidth={2} fillOpacity={1} fill="url(#colorMin)" />
                        <XAxis dataKey="date" hide />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
          </div>

          {/* History List */}
          <div>
            <h4 className="text-slate-400 text-xs font-bold uppercase mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4" /> Sejarah Terdahulu
            </h4>
            <div className="space-y-2">
                {stats.records.slice(0, 5).map((rec, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 bg-slate-950 rounded-lg border border-slate-800 text-sm">
                        <span className="text-slate-300 font-mono">
                            {new Date(rec.timestamp).toLocaleDateString('ms-MY')}
                        </span>
                        <div className="flex items-center gap-3">
                            <span className="text-slate-500 text-xs">
                                {new Date(rec.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                            </span>
                            <span className="text-red-400 font-bold font-mono">+{rec.minutesLate}m</span>
                        </div>
                    </div>
                ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default StudentAnalysisModal;
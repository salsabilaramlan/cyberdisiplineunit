import React, { useMemo } from 'react';
import { LateRecord } from '../types';
import StatCard from './StatCard';
import { TrendChart, ClassBarChart } from './Charts';
import { Clock, TrendingUp, AlertTriangle, UserX } from 'lucide-react';

interface DashboardProps {
  data: LateRecord[];
  onStudentClick: (name: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ data, onStudentClick }) => {
  const stats = useMemo(() => {
    const totalLate = data.length;
    
    // Today's count
    const today = new Date().toDateString();
    const todayLate = data.filter(d => new Date(d.timestamp).toDateString() === today).length;

    // Average minutes late
    const avgMinutes = totalLate > 0 
      ? Math.round(data.reduce((acc, curr) => acc + curr.minutesLate, 0) / totalLate) 
      : 0;

    // Daily Trend (Last 7 days)
    const dailyCounts: Record<string, number> = {};
    const last7Days = [...Array(7)].map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return d.toLocaleDateString('ms-MY', { day: '2-digit', month: '2-digit'});
    });

    // Initialize map
    last7Days.forEach(d => dailyCounts[d] = 0);

    data.forEach(r => {
        const dStr = new Date(r.timestamp).toLocaleDateString('ms-MY', { day: '2-digit', month: '2-digit'});
        if (dailyCounts[dStr] !== undefined) dailyCounts[dStr]++;
    });

    const trendData = Object.keys(dailyCounts).map(date => ({ date, count: dailyCounts[date] }));

    // Class Stats
    const classCounts: Record<string, number> = {};
    data.forEach(r => {
      classCounts[r.className] = (classCounts[r.className] || 0) + 1;
    });
    const classData = Object.entries(classCounts)
      .map(([className, count]) => ({ className, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return { totalLate, todayLate, avgMinutes, trendData, classData };
  }, [data]);

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Jumlah Kes (30 Hari)" 
          value={stats.totalLate} 
          icon={UserX} 
          color="cyan"
          subtitle="Rekod terkumpul"
        />
        <StatCard 
          title="Lewat Hari Ini" 
          value={stats.todayLate} 
          icon={AlertTriangle} 
          color="fuchsia"
          subtitle={stats.todayLate > 0 ? "Tindakan diperlukan segera" : "Tiada kes setakat ini"}
        />
        <StatCard 
          title="Purata Masa Lewat" 
          value={`${stats.avgMinutes} min`} 
          icon={Clock} 
          color="amber"
          subtitle="Kelewatan purata per murid"
        />
        <StatCard 
          title="Kelas Kritikal" 
          value={stats.classData[0]?.className || '-'} 
          icon={TrendingUp} 
          color="emerald"
          subtitle={`${stats.classData[0]?.count || 0} kes direkodkan`}
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Trend Chart */}
        <div className="lg:col-span-2 bg-slate-900/50 backdrop-blur-md border border-cyan-900/50 p-4 md:p-6 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <TrendingUp className="w-24 h-24 text-cyan-400" />
          </div>
          <h3 className="text-lg font-bold text-white mb-6 flex items-center">
            <span className="w-1 h-6 bg-cyan-400 mr-3 rounded-full shadow-[0_0_10px_#22d3ee]"></span>
            Analisis Trend Mingguan
          </h3>
          <div className="h-64 w-full">
            <TrendChart data={stats.trendData} />
          </div>
        </div>

        {/* Class Breakdown */}
        <div className="bg-slate-900/50 backdrop-blur-md border border-fuchsia-900/50 p-4 md:p-6 rounded-2xl relative overflow-hidden">
           <h3 className="text-lg font-bold text-white mb-6 flex items-center">
            <span className="w-1 h-6 bg-fuchsia-400 mr-3 rounded-full shadow-[0_0_10px_#e879f9]"></span>
            Top 5 Kelas Bermasalah
          </h3>
          <div className="h-64 w-full">
            <ClassBarChart data={stats.classData} />
          </div>
        </div>
      </div>

      {/* Charts Row 2 - Modified to remove Pie Chart and expand List */}
      <div className="grid grid-cols-1 gap-6">
        {/* Recent List Compact */}
        <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 p-4 md:p-6 rounded-2xl overflow-hidden">
          <h3 className="text-lg font-bold text-white mb-4">Aktiviti Terkini (Live Feed)</h3>
          <div className="space-y-3 overflow-y-auto max-h-60 pr-2 custom-scrollbar">
            {data.slice(0, 6).map((record) => (
              <div 
                key={record.id} 
                onClick={() => onStudentClick(record.studentName)}
                className="flex items-center justify-between p-3 rounded-lg bg-slate-800/30 border border-slate-700/50 hover:bg-slate-800/60 transition-colors cursor-pointer group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-300 group-hover:bg-cyan-900 group-hover:text-cyan-400 transition-colors">
                    {record.studentName.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-200 group-hover:text-cyan-400 transition-colors">{record.studentName}</p>
                    <p className="text-xs text-cyan-400/80 font-mono">{record.className}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-mono text-cyan-400">
                    {new Date(record.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </p>
                  <p className="text-[10px] text-red-400">+{record.minutesLate} min</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
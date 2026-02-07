import React, { useState, useMemo } from 'react';
import { LateRecord } from '../types';
import { Search, Filter, Download } from 'lucide-react';

interface StudentListProps {
  data: LateRecord[];
  onStudentClick: (name: string) => void;
}

const StudentList: React.FC<StudentListProps> = ({ data, onStudentClick }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClass, setFilterClass] = useState('ALL');

  const classes = useMemo(() => {
    return ['ALL', ...Array.from(new Set(data.map(d => d.className))).sort()];
  }, [data]);

  const filteredData = useMemo(() => {
    return data.filter(item => {
      const matchesSearch = 
        item.studentName.toLowerCase().includes(searchTerm.toLowerCase()) || 
        item.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesClass = filterClass === 'ALL' || item.className === filterClass;
      return matchesSearch && matchesClass;
    });
  }, [data, searchTerm, filterClass]);

  return (
    <div className="space-y-6 pb-10">
      <div className="bg-slate-900/50 backdrop-blur-md border border-cyan-900/30 p-4 md:p-6 rounded-2xl shadow-lg">
        {/* Header Controls */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
          <h2 className="text-2xl font-bold text-white tracking-wide">Pangkalan Data Kehadiran</h2>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-hover:text-cyan-400 transition-colors" />
              <input 
                type="text" 
                placeholder="Cari nama atau ID..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-64 bg-slate-950/50 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 transition-all"
              />
            </div>
            
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <select 
                value={filterClass}
                onChange={(e) => setFilterClass(e.target.value)}
                className="w-full sm:w-48 bg-slate-950/50 border border-slate-700 rounded-lg pl-10 pr-8 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500 appearance-none cursor-pointer hover:bg-slate-900"
              >
                {classes.map(c => <option key={c} value={c}>{c === 'ALL' ? 'Semua Kelas' : c}</option>)}
              </select>
            </div>

            <button className="flex items-center justify-center space-x-2 bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-[0_0_15px_rgba(8,145,178,0.4)]">
              <Download className="w-4 h-4" />
              <span>Eksport</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-800/50">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-slate-950/80 text-slate-400 text-xs uppercase tracking-wider border-b border-slate-800">
                <th className="p-3 md:p-4 font-medium">Tarikh / Masa</th>
                <th className="p-3 md:p-4 font-medium">ID Pelajar</th>
                <th className="p-3 md:p-4 font-medium">Nama Pelajar</th>
                <th className="p-3 md:p-4 font-medium">Kelas</th>
                <th className="p-3 md:p-4 font-medium text-right">Masa Lewat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredData.length > 0 ? (
                filteredData.map((row) => (
                  <tr key={row.id} className="hover:bg-cyan-900/10 transition-colors group">
                    <td className="p-3 md:p-4 text-sm text-slate-400 font-mono">
                      {new Date(row.timestamp).toLocaleDateString('ms-MY')} 
                      <span className="text-slate-600 mx-2">|</span>
                      {new Date(row.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </td>
                    <td className="p-3 md:p-4 text-sm text-cyan-400 font-mono">{row.studentId}</td>
                    <td 
                        className="p-3 md:p-4 text-sm text-slate-200 font-medium group-hover:text-cyan-300 cursor-pointer underline decoration-dotted underline-offset-4 decoration-slate-600 hover:decoration-cyan-400"
                        onClick={() => onStudentClick(row.studentName)}
                    >
                        {row.studentName}
                    </td>
                    <td className="p-3 md:p-4">
                      <span className="inline-block px-2 py-1 rounded bg-slate-800 border border-slate-700 text-xs text-slate-300">
                        {row.className}
                      </span>
                    </td>
                    <td className="p-3 md:p-4 text-sm text-right font-mono text-red-400 font-bold">
                      +{row.minutesLate} min
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-slate-500">
                    Tiada rekod dijumpai.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <div className="mt-4 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-slate-500">
          <p>Menunjukkan {filteredData.length} daripada {data.length} rekod</p>
          <div className="flex gap-2">
            <button className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-50">Sebelum</button>
            <button className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700">Seterusnya</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentList;
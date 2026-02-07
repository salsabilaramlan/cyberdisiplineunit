import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import StudentList from './components/StudentList';
import Analytics from './components/Analytics';
import StudentAnalysisModal from './components/StudentAnalysisModal';
import { ViewMode, LateRecord } from './types';
import { fetchSheetData } from './services/sheetService';
import { Menu, Wifi, WifiOff } from 'lucide-react';

const App: React.FC = () => {
  const [view, setView] = useState<ViewMode>(ViewMode.DASHBOARD);
  const [data, setData] = useState<LateRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // AI Modal State
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  
  // Default Deployment ID provided by user
  const DEFAULT_ID = 'AKfycbyUNPqQKVRt_AgNFyz7cI89IqU7hGLXOMzYfuz2Lu_gXaEPqQG9pHOS8NHD42HDDBoM';
  const [sheetId] = useState(DEFAULT_ID);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const records = await fetchSheetData(sheetId);
      if (records.length === 0) {
        console.warn("Data kosong diterima.");
      }
      setData(records);

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Ralat memuat turun data.");
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [sheetId]);

  const handleStudentClick = (name: string) => {
    setSelectedStudent(name);
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Background Grid Effect */}
      <div className="fixed inset-0 cyber-grid pointer-events-none z-0 opacity-40"></div>
      
      {/* Ambient Glows */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-[128px] pointer-events-none z-0"></div>
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-fuchsia-600/10 rounded-full blur-[128px] pointer-events-none z-0"></div>

      {/* AI Analysis Modal */}
      <StudentAnalysisModal 
        isOpen={!!selectedStudent} 
        onClose={() => setSelectedStudent(null)} 
        studentName={selectedStudent}
        data={data}
      />

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 md:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar - responsive container */}
      <div className={`fixed inset-y-0 left-0 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition-transform duration-300 ease-in-out z-30`}>
        <Sidebar 
          currentView={view} 
          onChangeView={(v) => { setView(v); setIsSidebarOpen(false); }} 
          onOpenSettings={() => {}} // No-op as settings removed
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col relative z-10 overflow-hidden">
        {/* Top Navbar for Mobile/Status */}
        <header className="h-16 border-b border-slate-800/50 bg-slate-900/50 backdrop-blur-md flex items-center justify-between px-6 sticky top-0">
          <div className="flex items-center">
            <button 
                className="md:hidden p-2 text-slate-400 hover:text-white mr-4"
                onClick={() => setIsSidebarOpen(true)}
            >
                <Menu className="w-6 h-6" />
            </button>
            
            <div className="hidden md:block">
                <h2 className="text-sm font-medium text-slate-400 tracking-wide uppercase">
                Sistem Pengurusan / <span className="text-cyan-400">{view === ViewMode.DASHBOARD ? 'Papan Pemuka' : view === ViewMode.LIST ? 'Data' : 'Analitik'}</span>
                </h2>
            </div>
          </div>

          <div className="flex items-center space-x-4">
             <div className={`flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-900 border ${error ? 'border-red-500/30' : 'border-emerald-500/30'} shadow-[0_0_10px_rgba(0,0,0,0.2)]`}>
                {error ? (
                    <>
                        <WifiOff className="w-3 h-3 text-red-500" />
                        <span className="text-[10px] font-bold text-red-400 tracking-wider">OFFLINE</span>
                    </>
                ) : (
                    <>
                         <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <span className="text-[10px] font-bold text-emerald-400 tracking-wider">
                            ONLINE
                        </span>
                    </>
                )}
             </div>
          </div>
        </header>

        {/* Scrollable Main Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
          {error ? (
            <div className="flex flex-col items-center justify-center h-full space-y-4">
                <div className="bg-red-500/10 p-6 rounded-2xl border border-red-500/30 text-center max-w-md">
                    <WifiOff className="w-12 h-12 text-red-400 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">Ralat Sambungan</h3>
                    <p className="text-slate-400 text-sm mb-4">{error}</p>
                    <button 
                        onClick={() => loadData()}
                        className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                    >
                        Cuba Lagi
                    </button>
                </div>
            </div>
          ) : loading ? (
            <div className="flex flex-col items-center justify-center h-full space-y-4">
              <div className="relative w-16 h-16">
                 <div className="absolute top-0 left-0 w-full h-full border-4 border-cyan-500/30 rounded-full"></div>
                 <div className="absolute top-0 left-0 w-full h-full border-4 border-t-cyan-500 rounded-full animate-spin"></div>
              </div>
              <p className="text-cyan-400 font-mono text-sm animate-pulse">MENYAMBUNG KEPADA APPS SCRIPT...</p>
            </div>
          ) : (
            <>
              {view === ViewMode.DASHBOARD && <Dashboard data={data} onStudentClick={handleStudentClick} />}
              {view === ViewMode.LIST && <StudentList data={data} onStudentClick={handleStudentClick} />}
              {view === ViewMode.ANALYTICS && <Analytics data={data} onStudentClick={handleStudentClick} />}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default App;
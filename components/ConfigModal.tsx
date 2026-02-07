import React, { useState, useEffect } from 'react';
import { X, Save, Database, AlertCircle, Code } from 'lucide-react';

interface ConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (sheetId: string) => void;
  currentSheetId: string;
}

const ConfigModal: React.FC<ConfigModalProps> = ({ 
  isOpen, onClose, onSave, currentSheetId 
}) => {
  const [sheetId, setSheetId] = useState(currentSheetId);
  const [error, setError] = useState('');

  useEffect(() => {
    setSheetId(currentSheetId);
  }, [currentSheetId]);

  const handleSave = () => {
    if (!sheetId.trim()) {
      setError('Sila masukkan Deployment ID');
      return;
    }
    onSave(sheetId);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-slate-900 border border-cyan-500/30 rounded-2xl w-full max-w-lg shadow-[0_0_50px_rgba(6,182,212,0.15)] overflow-hidden animate-fade-in">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Database className="w-5 h-5 text-cyan-400" />
            Konfigurasi Sambungan
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-cyan-400 mb-1 uppercase tracking-wider">Apps Script Deployment ID</label>
              <input 
                type="text" 
                value={sheetId}
                onChange={(e) => { setSheetId(e.target.value); setError(''); }}
                placeholder="AKfy..."
                className="w-full bg-slate-950/50 border border-slate-700 rounded-lg p-3 text-sm text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all font-mono break-all"
              />
              {error && <p className="text-red-400 text-xs mt-1 flex items-center"><AlertCircle className="w-3 h-3 mr-1"/> {error}</p>}
            </div>

            <div className="bg-cyan-900/10 border border-cyan-900/30 rounded-lg p-4">
              <h4 className="text-cyan-400 text-sm font-bold mb-2 flex items-center">
                <Code className="w-4 h-4 mr-2"/> Status Sambungan
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Sistem kini dipautkan secara eksklusif ke Google Apps Script anda. Pastikan deployment anda ditetapkan sebagai:
              </p>
              <ul className="text-xs text-slate-300 mt-2 list-disc pl-4 space-y-1 font-mono">
                <li>Execute as: <strong>Me</strong></li>
                <li>Who has access: <strong>Anyone</strong></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/50 flex justify-end">
          <button 
            onClick={handleSave}
            className="flex items-center space-x-2 bg-cyan-600 hover:bg-cyan-500 text-white px-5 py-2 rounded-lg text-sm font-medium transition-all shadow-[0_0_15px_rgba(8,145,178,0.4)] active:scale-95"
          >
            <Save className="w-4 h-4" />
            <span>Simpan</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfigModal;
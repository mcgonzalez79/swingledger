import React from 'react';
import { X } from 'lucide-react';
import { theme } from '../theme';

export default function FilterModal({ isOpen, onClose, filters, setFilters, availableClubs }) {
  if (!isOpen) return null;

  const handleDateQuickSelect = (days) => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days);
    setFilters(prev => ({ 
      ...prev, 
      startDate: start.toISOString().split('T')[0], 
      endDate: end.toISOString().split('T')[0] 
    }));
  };

  const handleClubToggle = (club) => {
    setFilters(prev => ({
      ...prev,
      clubs: prev.clubs.includes(club)
        ? prev.clubs.filter(c => c !== club)
        : [...prev.clubs, club]
    }));
  };

  // THE FIX: Reset all fields to their default state
  const handleReset = () => {
    setFilters({
      startDate: '',
      endDate: '',
      clubs: availableClubs
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-md border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        
        <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Filter Data</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-3 uppercase tracking-wider">Date Range</h3>
            <div className="flex gap-2 mb-3">
              <button onClick={() => handleDateQuickSelect(7)} className="flex-1 py-1 text-sm border border-slate-200 dark:border-slate-700 rounded text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">7 Days</button>
              <button onClick={() => handleDateQuickSelect(30)} className="flex-1 py-1 text-sm border border-slate-200 dark:border-slate-700 rounded text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">30 Days</button>
              <button onClick={() => handleDateQuickSelect(90)} className="flex-1 py-1 text-sm border border-slate-200 dark:border-slate-700 rounded text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">90 Days</button>
            </div>
            <div className="flex gap-4">
              <input type="date" value={filters.startDate} onChange={e => setFilters(p => ({...p, startDate: e.target.value}))} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded p-2 text-sm text-slate-900 dark:text-slate-100" />
              <input type="date" value={filters.endDate} onChange={e => setFilters(p => ({...p, endDate: e.target.value}))} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded p-2 text-sm text-slate-900 dark:text-slate-100" />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Clubs</h3>
              <div className="space-x-2">
                <button onClick={() => setFilters(p => ({...p, clubs: availableClubs}))} className="text-xs text-emerald-600 dark:text-emerald-500 font-medium">All</button>
                <button onClick={() => setFilters(p => ({...p, clubs: []}))} className="text-xs text-slate-500 dark:text-slate-400 font-medium">None</button>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {availableClubs.map(club => (
                <button
                  key={club}
                  onClick={() => handleClubToggle(club)}
                  className={`py-2 text-sm font-medium rounded border ${
                    filters.clubs.includes(club) 
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-500/20 dark:border-emerald-500/50 dark:text-emerald-400'
                      : 'bg-transparent border-slate-200 text-slate-500 dark:border-slate-700 dark:text-slate-400'
                  }`}
                >
                  {club}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* THE FIX: Added a Reset button next to the Apply button */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex gap-3">
          <button 
            onClick={handleReset} 
            className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors w-1/3 shadow-sm"
          >
            Reset
          </button>
          <button onClick={onClose} className={theme.classes.btnPrimary + " flex-1"}>
            Apply Filters
          </button>
        </div>

      </div>
    </div>
  );
}
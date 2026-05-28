import React, { useState } from 'react';
import { ScanLine, Sparkles } from 'lucide-react';
import AdviceModal from './AdviceModal';

export default function SwingMetrics({ metrics, activeClub }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!metrics) return null;

  const formatMetric = (val) => Math.abs(val).toFixed(1) + '°';

  const getPathData = (val) => {
    if (Math.abs(val) < 1) return { text: 'Neutral', color: 'text-emerald-500' };
    return val > 0 ? { text: 'In-to-Out', color: 'text-blue-500' } : { text: 'Out-to-In', color: 'text-red-500' };
  };

  const getFaceData = (val) => {
    if (Math.abs(val) < 1) return { text: 'Square', color: 'text-emerald-500' };
    return val > 0 ? { text: 'Open (Right)', color: 'text-red-500' } : { text: 'Closed (Left)', color: 'text-blue-500' };
  };

  const getAoaData = (val) => {
    if (Math.abs(val) < 1) return { text: 'Level', color: 'text-emerald-500' };
    return val > 0 ? { text: 'Up', color: 'text-blue-500' } : { text: 'Down', color: 'text-red-500' };
  };

  const pathData = getPathData(metrics.avgPath);
  const fttData = getFaceData(metrics.avgFtt);
  const ftpData = getFaceData(metrics.avgFtP);
  const aoaData = getAoaData(metrics.avgAoa);

  const MetricCard = ({ label, value, meta }) => (
    <div className="flex flex-col items-center justify-center p-4">
      <span className="font-medium text-xs md:text-sm text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 text-center">
        {label}
      </span>
      <span className="text-2xl md:text-3xl text-slate-900 dark:text-slate-100 mb-1">
        {formatMetric(value)}
      </span>
      <span className={`text-[10px] md:text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-full bg-slate-50 dark:bg-slate-900 ${meta.color}`}>
        {meta.text}
      </span>
    </div>
  );

  return (
    <>
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm mb-8">
        
        <div className="flex justify-between items-center p-4 md:p-6 border-b border-slate-100 dark:border-slate-700/50 bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-2">
            <ScanLine className="w-5 h-5 text-emerald-600 dark:text-emerald-500" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Average Delivery / D-Plane</h3>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-500/20 dark:hover:bg-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs md:text-sm font-bold rounded-lg transition-colors shadow-sm"
          >
            <Sparkles className="w-4 h-4" />
            Get Advice
          </button>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-slate-100 dark:divide-slate-700/50">
          <MetricCard label="Club Path" value={metrics.avgPath} meta={pathData} />
          <MetricCard label="Face to Target" value={metrics.avgFtt} meta={fttData} />
          <MetricCard label="Face to Path" value={metrics.avgFtP} meta={ftpData} />
          <MetricCard label="Angle of Attack" value={metrics.avgAoa} meta={aoaData} />
        </div>
      </div>

      <AdviceModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        metrics={metrics}
        activeClub={activeClub}
      />
    </>
  );
}
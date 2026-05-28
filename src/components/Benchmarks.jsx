import React, { useState } from 'react';
import { Target, X, Table2 } from 'lucide-react';
import { getDistanceTier, getOptimalSmash, DISTANCE_CHART } from '../utils/benchmarksLogic';

const DistanceTableModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-4xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 rounded-t-xl">
          <h2 className="text-lg md:text-xl font-bold text-slate-900 dark:text-slate-100 uppercase tracking-tight">Golf Club Distance Chart</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="overflow-x-auto overflow-y-auto">
          <table className="w-full text-left text-sm md:text-base">
            <thead className="bg-slate-900 text-white sticky top-0">
              <tr>
                <th className="p-3 md:p-4 font-bold">Club</th>
                <th className="p-3 md:p-4 font-bold">Beginner</th>
                <th className="p-3 md:p-4 font-bold">Average</th>
                <th className="p-3 md:p-4 font-bold">Good</th>
                <th className="p-3 md:p-4 font-bold">Advanced</th>
                <th className="p-3 md:p-4 font-bold">PGA Tour</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {DISTANCE_CHART.map((row, idx) => (
                <tr key={idx} className={idx % 2 === 0 ? 'bg-slate-50 dark:bg-slate-800/30' : 'bg-white dark:bg-slate-900'}>
                  <td className="p-3 md:p-4 font-bold text-slate-800 dark:text-slate-200">{row.club}</td>
                  <td className="p-3 md:p-4 text-slate-600 dark:text-slate-400">{row.beginner} yds</td>
                  <td className="p-3 md:p-4 text-slate-600 dark:text-slate-400">{row.average} yds</td>
                  <td className="p-3 md:p-4 text-slate-600 dark:text-slate-400">{row.good} yds</td>
                  <td className="p-3 md:p-4 text-slate-600 dark:text-slate-400">{row.advanced} yds</td>
                  <td className="p-3 md:p-4 font-medium text-purple-600 dark:text-purple-400">{row.pga} yds</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default function Benchmarks({ metrics, activeClub }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!metrics || !activeClub) return null;

  const total = Math.round(metrics.avgTotal);
  const tier = getDistanceTier(activeClub, metrics.avgTotal);
  
  const smash = metrics.avgSmash ? metrics.avgSmash.toFixed(2) : '--';
  const optimalSmash = getOptimalSmash(activeClub);
  const smashPercent = metrics.avgSmash ? Math.min(100, Math.round((metrics.avgSmash / optimalSmash) * 100)) : 0;

  const getSmashColor = (percent) => {
    if (percent >= 98) return 'text-purple-500';
    if (percent >= 90) return 'text-emerald-500';
    if (percent >= 80) return 'text-amber-500';
    return 'text-red-500';
  };

  const MetricCard = ({ label, value, meta, metaColor = "text-slate-500" }) => (
    <div className="flex flex-col items-center justify-center p-4">
      <span className="font-medium text-xs md:text-sm text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 text-center">
        {label}
      </span>
      <span className="text-2xl md:text-3xl text-slate-900 dark:text-slate-100 mb-1">
        {value}
      </span>
      <span className={`text-[10px] md:text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-full bg-slate-50 dark:bg-slate-900 ${metaColor}`}>
        {meta}
      </span>
    </div>
  );

  return (
    <>
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm mb-8">
        <div className="flex justify-between items-center p-4 md:p-6 border-b border-slate-100 dark:border-slate-700/50 bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-600 dark:text-blue-500" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Performance Benchmarks</h3>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs md:text-sm font-bold rounded-lg transition-colors shadow-sm"
          >
            <Table2 className="w-4 h-4" />
            <span className="hidden sm:inline">View Chart</span>
          </button>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-slate-100 dark:divide-slate-700/50">
          <MetricCard label="Avg Total" value={total > 0 ? total : '--'} meta="Yards" />
          <MetricCard label="Distance Tier" value={total > 0 ? tier.label : '--'} meta="Matrix Rating" metaColor={tier.color} />
          <MetricCard label="Avg Smash" value={smash} meta={`Target: ${optimalSmash.toFixed(2)}`} />
          <MetricCard label="% Of Optimal" value={smashPercent > 0 ? `${smashPercent}%` : '--'} meta="Strike Quality" metaColor={getSmashColor(smashPercent)} />
        </div>
      </div>

      <DistanceTableModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
import React, { useMemo } from 'react';
import { Activity, Target, CircleDashed, AlertTriangle } from 'lucide-react';

export default function RecentRoundsReport({ rounds }) {
  const stats = useMemo(() => {
    if (!rounds || rounds.length === 0) return null;

    // Grab up to the last 5 rounds
    const recent = rounds.slice(0, 5);
    
    let totalScore = 0, totalPutts = 0, totalPenalties = 0;
    let totalFIR = 0, possibleFIR = 0;

    recent.forEach(r => {
      const is9 = r.holes_played === 9;
      const multiplier = is9 ? 2 : 1; // Scale 9-hole stats to 18-hole equivalents
      
      totalScore += (r.total_score * multiplier);
      totalPutts += (r.total_putts * multiplier);
      totalPenalties += ((r.penalty_strokes || 0) * multiplier);
      
      // Calculate Fairways accurately based on 9 or 18
      if (r.fairways_hit != null) {
         totalFIR += r.fairways_hit;
         possibleFIR += is9 ? 7 : 14; 
      }
    });

    const count = recent.length;
    return {
       score: Math.round(totalScore / count),
       putts: Math.round(totalPutts / count),
       penalties: (totalPenalties / count).toFixed(1),
       fir: possibleFIR > 0 ? Math.round((totalFIR / possibleFIR) * 100) : '--'
    };
  }, [rounds]);

  if (!stats) return null;

  return (
    <div className="mb-8 p-4 md:p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
      <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider mb-4 flex items-center gap-2">
        <Activity className="w-5 h-5 text-emerald-500" /> Last 5 Rounds Averages <span className="text-xs font-normal text-slate-400 normal-case ml-2">(18-Hole Eqv.)</span>
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 divide-x-0 md:divide-x divide-y md:divide-y-0 divide-slate-100 dark:divide-slate-800">
        
        <div className="md:px-4 py-2 md:py-0 flex items-center gap-4">
          <div className="p-3 bg-emerald-100 dark:bg-emerald-500/20 rounded-lg text-emerald-600"><Activity className="w-6 h-6" /></div>
          <div><p className="text-xs text-slate-500">Avg Score</p><p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.score}</p></div>
        </div>
        
        <div className="md:px-4 py-2 md:py-0 flex items-center gap-4">
          <div className="p-3 bg-blue-100 dark:bg-blue-500/20 rounded-lg text-blue-600"><Target className="w-6 h-6" /></div>
          <div><p className="text-xs text-slate-500">Fairways Hit</p><p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.fir}<span className="text-sm font-normal text-slate-500">%</span></p></div>
        </div>

        <div className="md:px-4 py-2 md:py-0 flex items-center gap-4">
          <div className="p-3 bg-purple-100 dark:bg-purple-500/20 rounded-lg text-purple-600"><CircleDashed className="w-6 h-6" /></div>
          <div><p className="text-xs text-slate-500">Avg Putts</p><p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.putts}</p></div>
        </div>

        <div className="md:px-4 py-2 md:py-0 flex items-center gap-4">
          <div className="p-3 bg-red-100 dark:bg-red-500/20 rounded-lg text-red-600"><AlertTriangle className="w-6 h-6" /></div>
          <div><p className="text-xs text-slate-500">Avg Penalties</p><p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.penalties}</p></div>
        </div>

      </div>
    </div>
  );
}
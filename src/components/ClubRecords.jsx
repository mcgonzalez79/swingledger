import React from 'react';
import { Target, Trophy, Zap, Gauge } from 'lucide-react';

export default function ClubRecords({ prs }) {
  if (!prs) return null;

  const RecordCard = ({ icon: Icon, label, value, unit }) => (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 shadow-sm flex items-center gap-4 transition-all hover:shadow-md">
      <div className="p-3 bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-500 rounded-lg">
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-0.5">{label}</p>
        <p className="text-2xl md:text-3xl text-slate-900 dark:text-slate-100">
          {value} <span className="text-sm font-medium text-slate-400">{unit}</span>
        </p>
      </div>
    </div>
  );

  return (
    <div className="mb-8">
      <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4">Personal Records</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <RecordCard icon={Target} label="Max Carry" value={Math.round(prs.maxCarry)} unit="yds" />
        <RecordCard icon={Trophy} label="Max Total" value={Math.round(prs.maxTotal)} unit="yds" />
        <RecordCard icon={Zap} label="Ball Speed" value={Math.round(prs.maxBallSpeed)} unit="mph" />
        <RecordCard icon={Gauge} label="Club Speed" value={Math.round(prs.maxClubSpeed)} unit="mph" />
      </div>
    </div>
  );
}
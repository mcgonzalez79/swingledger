import React, { useMemo } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, ZAxis } from 'recharts';

export default function DispersionChart({ shots }) {
  
  // 1. Generate a consistent color for each club
  const clubColors = useMemo(() => {
    const clubs = [...new Set(shots.map(s => s.club))];
    const colors = [
      '#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', 
      '#ec4899', '#06b6d4', '#f97316', '#a855f7'
    ];
    
    return clubs.reduce((acc, club, index) => {
      acc[club] = colors[index % colors.length];
      return acc;
    }, {});
  }, [shots]);

  const data = shots.map(shot => ({
    club: shot.club,
    carry: Math.round(shot.carry),
    offline: Math.round(shot.offline || 0),
    fill: clubColors[shot.club] // Assign the color here
  }));

  const maxOffline = Math.max(...data.map(d => Math.abs(d.offline)), 20);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-slate-800 p-3 border border-slate-200 dark:border-slate-700 rounded shadow-lg">
          <p className="font-bold" style={{ color: data.fill }}>{data.club}</p>
          <p className="text-sm text-slate-600 dark:text-slate-400">Carry: {data.carry} yds</p>
          <p className="text-sm text-slate-600 dark:text-slate-400">Offline: {Math.abs(data.offline)} yds {data.offline > 0 ? 'Right' : 'Left'}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-[400px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: -20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
          <XAxis 
            type="number" dataKey="offline" 
            domain={[-maxOffline - 5, maxOffline + 5]} 
            tickFormatter={(val) => val === 0 ? '0' : val > 0 ? `R${val}` : `L${Math.abs(val)}`}
            stroke="#64748b"
          />
          <YAxis type="number" dataKey="carry" stroke="#64748b" />
          <ZAxis type="category" dataKey="club" name="club" />
          <ReferenceLine x={0} stroke="#cbd5e1" strokeDasharray="3 3" opacity={0.5} />
          <Tooltip content={<CustomTooltip />} />
          <Scatter 
            name="Shots" 
            data={data} 
            fill="fill" // This tells Recharts to use the 'fill' key we added to our data objects
          />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}
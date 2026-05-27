import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingDown } from 'lucide-react';

export default function ScoringTrendChart({ rounds }) {
  const chartData = useMemo(() => {
    if (!rounds) return null;

    const validRounds = rounds.filter(r => r.total_score != null);
    
    if (validRounds.length < 2) return null;

    // THE FIX: Explicitly sort the last 10 rounds chronologically (Oldest first)
    const recentRounds = validRounds.slice(0, 10).sort((a, b) => new Date(a.date) - new Date(b.date));

    return recentRounds.map(round => {
      const is9 = round.holes_played === 9;
      const eqvScore = is9 ? round.total_score * 2 : round.total_score;
      
      return {
        id: round.id,
        // THE FIX: Added timeZone: 'UTC' to prevent the off-by-one bug here as well
        date: new Date(round.date).toLocaleDateString(undefined, { timeZone: 'UTC', month: 'short', day: 'numeric' }),
        rawScore: round.total_score,
        eqvScore: eqvScore,
        is9: is9,
        course: round.course_name || 'Unnamed Course'
      };
    });
  }, [rounds]);

  if (!chartData) return null;

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-slate-800 p-3 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl z-50">
          <p className="font-bold text-slate-900 dark:text-slate-100 mb-1">
            {data.date} <span className="font-normal text-slate-500 text-sm">• {data.course}</span>
          </p>
          <div className="flex items-end gap-2">
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-500">{data.eqvScore}</span>
            <span className="text-sm font-semibold text-slate-500 mb-1">Eqv.</span>
          </div>
          {data.is9 && (
            <p className="text-xs text-orange-600 dark:text-orange-400 font-medium mt-1">
              *Normalized from 9-hole score ({data.rawScore})
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="mb-8 p-4 md:p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm w-full">
      <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider mb-6 flex items-center gap-2">
        <TrendingDown className="w-5 h-5 text-emerald-500" /> 
        Scoring Trend 
        <span className="text-xs font-normal text-slate-400 normal-case ml-2">(Last 10 Rounds, 18-Hole Eqv.)</span>
      </h2>
      
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cbd5e1" opacity={0.3} />
            <XAxis 
              dataKey="date" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 12, fill: '#64748b' }} 
              dy={10} 
            />
            <YAxis 
              domain={['dataMin - 5', 'dataMax + 5']} 
              allowDecimals={false}
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 12, fill: '#64748b' }} 
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }} />
            <Line 
              type="monotone" 
              dataKey="eqvScore" 
              stroke="#10b981" 
              strokeWidth={3} 
              dot={{ r: 4, strokeWidth: 2, fill: '#fff', stroke: '#10b981' }} 
              activeDot={{ r: 6, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }}
              animationDuration={1500}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
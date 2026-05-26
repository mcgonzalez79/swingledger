import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList, Legend } from 'recharts';

export default function GappingChart({ data }) {
  if (!data || data.length === 0) return null;

  // Custom tooltip for clean dark/light mode styling
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const shotData = payload[0].payload;
      return (
        <div className="bg-white dark:bg-slate-800 p-3 border border-slate-200 dark:border-slate-700 rounded shadow-lg">
          <p className="font-bold text-slate-800 dark:text-slate-100">{shotData.club}</p>
          <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">Carry: {Math.round(shotData.carry)} yds</p>
          {shotData.total && (
            <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Total: {Math.round(shotData.total)} yds</p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-[500px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        {/* Pass the raw data straight in. Dashboard.jsx already sorted it perfectly (Driver -> Wedges) */}
        <BarChart 
          data={data} 
          layout="vertical" 
          margin={{ top: 20, right: 40, bottom: 20, left: 10 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} horizontal={false} />
          
          <XAxis 
            type="number" 
            stroke="#64748b" 
            tick={{ fill: '#64748b', fontSize: 12 }}
            domain={[0, 'dataMax + 20']} 
          />
          
          <YAxis 
            dataKey="club" 
            type="category" 
            stroke="#64748b" 
            tick={{ fill: '#64748b', fontSize: 12, fontWeight: 'bold' }}
            interval={0} 
            width={60}
          />
          
          <Tooltip 
            content={<CustomTooltip />} 
            cursor={{ fill: '#334155', opacity: 0.1 }} 
          />
          
          <Legend verticalAlign="top" height={36} />
          
          <Bar dataKey="carry" name="Carry" fill="#10b981" radius={[0, 4, 4, 0]}>
            <LabelList 
              dataKey="carry" 
              position="insideRight" 
              formatter={(val) => Math.round(val)} 
              fill="#ffffff" 
              fontSize={10} 
            />
          </Bar>

          <Bar dataKey="total" name="Total" fill="#3b82f6" radius={[0, 4, 4, 0]}>
            <LabelList 
              dataKey="total" 
              position="right" 
              formatter={(val) => Math.round(val)} 
              fill="#64748b" 
              fontSize={10} 
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
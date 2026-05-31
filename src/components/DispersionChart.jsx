import React, { useMemo } from 'react';
import { 
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, ReferenceArea, ReferenceDot 
} from 'recharts';
import { calculateDispersionStats } from '../utils/dispersionMath';

// Custom SVG Shape for the 1 SD Ellipse
const ConfidenceEllipse = ({ x, y, width, height }) => {
  if (!width || !height) return null;
  const cx = x + width / 2;
  const cy = y + height / 2;
  const rx = width / 2;
  const ry = height / 2;

  return (
    <ellipse
      cx={cx}
      cy={cy}
      rx={rx}
      ry={ry}
      fill="rgba(16, 185, 129, 0.1)" // Emerald at 10% opacity
      stroke="#10b981"               // Emerald stroke
      strokeWidth={2}
      strokeDasharray="4 4"
    />
  );
};

// Custom SVG Shape for the Centroid Crosshair
const CentroidCrosshair = ({ cx, cy }) => {
  const size = 8;
  return (
    <g>
      <line x1={cx - size} y1={cy} x2={cx + size} y2={cy} stroke="#ef4444" strokeWidth={2} />
      <line x1={cx} y1={cy - size} x2={cx} y2={cy + size} stroke="#ef4444" strokeWidth={2} />
      <circle cx={cx} cy={cy} r={2} fill="#ef4444" />
    </g>
  );
};

export default function DispersionChart({ shots }) {
  // Pass the entire filtered 'shots' array directly into the math utility
  const stats = useMemo(() => calculateDispersionStats(shots), [shots]);

  if (!stats || stats.data.length === 0) {
    return (
      <div className="flex items-center justify-center h-80 bg-slate-900/50 rounded-xl border border-slate-800 border-dashed text-slate-500">
        No shot data available in current filter.
      </div>
    );
  }

  const { centroid, stdDev, data } = stats;

  // Force symmetric X-Axis so "0" (Target Line) is exactly in the middle
  const maxOffline = Math.max(
    ...data.map(d => Math.abs(d.offline || 0)),
    Math.abs(centroid.x) + stdDev.x + 5
  );
  const xDomain = [-Math.ceil(maxOffline), Math.ceil(maxOffline)];

  // Dynamic Y-Axis based on carry distances
  const minCarry = Math.min(...data.map(d => d.carry || 0), centroid.y - stdDev.y) - 5;
  const maxCarry = Math.max(...data.map(d => d.carry || 0), centroid.y + stdDev.y) + 5;
  const yDomain = [Math.floor(minCarry), Math.ceil(maxCarry)];

  return (
    <div className="w-full">
      {/* Tendency Text */}
      <div className="mb-4 text-center">
        <span className="text-xs md:text-sm font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full inline-block">
          {stats.tendencyText}
        </span>
      </div>

      <div className="h-80 w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 10, right: 10, bottom: 20, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            
            <XAxis 
              type="number" 
              dataKey="offline" 
              name="Offline" 
              unit=" yds" 
              domain={xDomain} 
              stroke="#94a3b8" 
              tick={{ fill: '#94a3b8', fontSize: 12 }}
            />
            <YAxis 
              type="number" 
              dataKey="carry" 
              name="Carry" 
              unit=" yds" 
              domain={yDomain} 
              stroke="#94a3b8" 
              tick={{ fill: '#94a3b8', fontSize: 12 }}
            />
            
            <Tooltip 
              cursor={{ strokeDasharray: '3 3' }}
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#f8fafc' }}
            />

            {/* Center Target Line */}
            <ReferenceArea x1={-0.5} x2={0.5} fill="#334155" fillOpacity={0.3} />

            {/* 68% Confidence Ellipse */}
            {stdDev.x > 0 && stdDev.y > 0 && (
              <ReferenceArea
                x1={centroid.x - stdDev.x}
                x2={centroid.x + stdDev.x}
                y1={centroid.y - stdDev.y}
                y2={centroid.y + stdDev.y}
                shape={<ConfidenceEllipse />}
              />
            )}

            {/* Individual Shots (Semi-transparent to show cluster density) */}
            <Scatter 
              name="Shots" 
              data={data} 
              fill="#10b981" 
              fillOpacity={0.6} 
            />

            {/* Centroid Miss Location Crosshair */}
            <ReferenceDot 
              x={centroid.x} 
              y={centroid.y} 
              shape={<CentroidCrosshair />} 
            />
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {/* Map Legend */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-xs font-medium text-slate-400">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 opacity-60"></div>
          <span>Shot</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full border border-dashed border-emerald-500 bg-emerald-500/10"></div>
          <span>68% Range</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-red-500 font-bold text-lg leading-none">+</span>
          <span>Center</span>
        </div>
      </div>
    </div>
  );
}
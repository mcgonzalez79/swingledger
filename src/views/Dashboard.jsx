import React, { useState, useMemo, useEffect } from 'react';
import { Activity, Target, Navigation, Filter, PlusCircle, Calendar, Zap } from 'lucide-react';
import { useShots } from '../hooks/useShots';
import { processGappingData } from '../utils/shotMath';
import GappingChart from '../components/GappingChart';
import DispersionChart from '../components/DispersionChart';
import AveragesTable from '../components/AveragesTable';
import FilterModal from '../components/FilterModal';
import { theme } from '../theme';

// --- Data Pipeline Utilities ---

const normalizeClubName = (clubName) => {
  if (!clubName) return 'Unknown';
  let name = clubName.toString().toUpperCase().trim();
  name = name.replace(/Â/g, ''); 
  
  if (name === 'DRIVER' || name === 'DR') return 'Driver';
  if (name.includes('WOOD')) return name.replace(' WOOD', 'W');
  if (name.includes('HYBRID')) return name.replace(' HYBRID', 'H');
  if (name.includes('IRON')) return name.replace(' IRON', 'I');
  
  if (/^\d+$/.test(name)) return `${name}°`;
  return name;
};

const getClubRank = (clubName) => {
  if (!clubName) return 999;
  const normalized = clubName.toUpperCase().replace('°', '');
  const order = [
    'DRIVER', '1W', '2W', '3W', '4W', '5W', '7W', '9W',
    '2H', '3H', '4H', '5H', '6H',
    '1I', '2I', '3I', '4I', '5I', '6I', '7I', '8I', '9I',
    'PW', 'AW', 'GW', 'SW', 'LW'
  ];
  const index = order.indexOf(normalized);
  if (index !== -1) return index;

  const numericMatch = normalized.match(/\d+/);
  if (numericMatch) {
    const wedgeDegree = parseInt(numericMatch[0], 10);
    if (wedgeDegree >= 45 && wedgeDegree <= 64) return 100 + wedgeDegree;
  }
  return 999;
};

// --- Component ---

export default function Dashboard({ refreshTrigger }) {
  const { shots, loading, error } = useShots(refreshTrigger);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [availableClubs, setAvailableClubs] = useState([]);
  const [filters, setFilters] = useState({ startDate: '', endDate: '', clubs: [] });

  const normalizedShots = useMemo(() => {
    return shots.map(shot => ({
      ...shot,
      club: normalizeClubName(shot.club)
    }));
  }, [shots]);

  useEffect(() => {
    if (normalizedShots.length > 0 && availableClubs.length === 0) {
      const clubs = [...new Set(normalizedShots.map(s => s.club))]
        .filter(Boolean)
        .sort((a, b) => getClubRank(a) - getClubRank(b));
      
      setAvailableClubs(clubs);
      setFilters(prev => ({ ...prev, clubs }));
    }
  }, [normalizedShots]);

  const filteredShots = useMemo(() => {
    return normalizedShots.filter(shot => {
      if (!filters.clubs.includes(shot.club)) return false;
      
      if (filters.startDate || filters.endDate) {
        const shotDate = new Date(shot.created_at || shot.date);
        
        if (filters.startDate) {
          const startBound = new Date(`${filters.startDate}T00:00:00`);
          if (shotDate < startBound) return false;
        }
        
        if (filters.endDate) {
          const endBound = new Date(`${filters.endDate}T23:59:59`);
          if (shotDate > endBound) return false;
        }
      }
      return true;
    });
  }, [normalizedShots, filters]);

  const gappingData = useMemo(() => {
    const data = processGappingData(filteredShots);
    return data.sort((a, b) => getClubRank(a.club) - getClubRank(b.club));
  }, [filteredShots]);

  // Main Summary Stats (Top Row)
  const summaryStats = useMemo(() => {
    if (!filteredShots.length) return null;
    
    // Calculate unique sessions by looking at unique days in the filtered data
    const uniqueSessions = new Set(filteredShots.map(s => {
      const d = new Date(s.created_at);
      return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    })).size;

    const driverShots = filteredShots.filter(s => s.club === 'Driver');
    const avgDriverCarry = driverShots.length ? Math.round(driverShots.reduce((acc, s) => acc + s.carry, 0) / driverShots.length) : '--';
    
    return { 
      totalShots: filteredShots.length, 
      avgDriverCarry, 
      clubsTracked: gappingData.length,
      sessionsTracked: uniqueSessions
    };
  }, [filteredShots, gappingData]);

  // Secondary KPI Stats (Based on currently active filters)
  const kpiStats = useMemo(() => {
    if (!filteredShots.length) return null;

    const calcAvg = (key, decimals = 1) => {
      const validShots = filteredShots.filter(s => s[key] != null && s[key] > 0);
      if (!validShots.length) return '--';
      const avg = validShots.reduce((sum, s) => sum + s[key], 0) / validShots.length;
      return decimals === 0 ? Math.round(avg) : avg.toFixed(decimals);
    };

    return {
      carry: calcAvg('carry', 0),
      total: calcAvg('total', 0),
      ballSpeed: calcAvg('ball_speed', 1),
      clubSpeed: calcAvg('club_speed', 1),
      smash: calcAvg('smash_factor', 2)
    };
  }, [filteredShots]);


  if (loading) return <div className="p-8 flex justify-center text-emerald-500">Loading Dashboard...</div>;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      <header className="mb-8 flex flex-col md:flex-row md:justify-between md:items-end gap-4 print:hidden">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100">Performance Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Your launch monitor analytics and club gapping.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => window.dispatchEvent(new CustomEvent('open-upload'))} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm transition-colors">
            <PlusCircle className="w-4 h-4" /> Import Data
          </button>
          <button onClick={() => setIsFilterOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm transition-colors">
            <Filter className="w-4 h-4" /> Filters
          </button>
        </div>
      </header>

      {error && <div className="bg-red-50 text-red-600 p-4 rounded-lg">{error}</div>}

      {summaryStats ? (
        <>
          {/* Top Summary Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 print:hidden">
            <div className={theme.classes.card + " !m-0 !w-full flex items-center gap-4"}>
              <div className="p-3 bg-emerald-100 dark:bg-emerald-500/20 rounded-lg text-emerald-600"><Activity className="w-6 h-6" /></div>
              <div><p className="text-sm text-slate-500">Total Shots</p><p className="text-xl font-bold text-slate-900 dark:text-slate-100">{summaryStats.totalShots}</p></div>
            </div>
            <div className={theme.classes.card + " !m-0 !w-full flex items-center gap-4"}>
              <div className="p-3 bg-blue-100 dark:bg-blue-500/20 rounded-lg text-blue-600"><Calendar className="w-6 h-6" /></div>
              <div><p className="text-sm text-slate-500">Sessions</p><p className="text-xl font-bold text-slate-900 dark:text-slate-100">{summaryStats.sessionsTracked}</p></div>
            </div>
            <div className={theme.classes.card + " !m-0 !w-full flex items-center gap-4 hidden md:flex"}>
              <div className="p-3 bg-orange-100 dark:bg-orange-500/20 rounded-lg text-orange-600"><Navigation className="w-6 h-6" /></div>
              <div><p className="text-sm text-slate-500">Avg Driver</p><p className="text-xl font-bold text-slate-900 dark:text-slate-100">{summaryStats.avgDriverCarry} <span className="text-sm font-normal text-slate-500">yds</span></p></div>
            </div>
            <div className={theme.classes.card + " !m-0 !w-full flex items-center gap-4 hidden md:flex"}>
              <div className="p-3 bg-purple-100 dark:bg-purple-500/20 rounded-lg text-purple-600"><Target className="w-6 h-6" /></div>
              <div><p className="text-sm text-slate-500">Clubs Tracked</p><p className="text-xl font-bold text-slate-900 dark:text-slate-100">{summaryStats.clubsTracked}</p></div>
            </div>
          </div>

          {/* Filtered KPI Row */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 md:p-6 print:hidden">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-5 h-5 text-yellow-500" />
              <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">Filtered Performance Averages</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 divide-x divide-slate-100 dark:divide-slate-800">
              <div className="px-2"><p className="text-xs text-slate-500 mb-1">Carry</p><p className="text-lg font-bold text-slate-800 dark:text-slate-200">{kpiStats.carry} <span className="text-xs font-normal">yds</span></p></div>
              <div className="px-2"><p className="text-xs text-slate-500 mb-1">Total</p><p className="text-lg font-bold text-slate-800 dark:text-slate-200">{kpiStats.total} <span className="text-xs font-normal">yds</span></p></div>
              <div className="px-2"><p className="text-xs text-slate-500 mb-1">Ball Speed</p><p className="text-lg font-bold text-slate-800 dark:text-slate-200">{kpiStats.ballSpeed} <span className="text-xs font-normal">mph</span></p></div>
              <div className="px-2"><p className="text-xs text-slate-500 mb-1">Club Speed</p><p className="text-lg font-bold text-slate-800 dark:text-slate-200">{kpiStats.clubSpeed} <span className="text-xs font-normal">mph</span></p></div>
              <div className="px-2"><p className="text-xs text-slate-500 mb-1">Smash Factor</p><p className="text-lg font-bold text-slate-800 dark:text-slate-200">{kpiStats.smash}</p></div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 print:hidden">
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-4 md:p-6">
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-6">Bag Gapping Profile</h2>
              <GappingChart data={gappingData} />
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-4 md:p-6">
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-6">Lateral Dispersion</h2>
              <DispersionChart shots={filteredShots} />
            </div>
          </div>

          {/* THE FIX: Added print zoom class directly to a wrapper around the table */}
          <div className="print:[zoom:0.5]">
            <AveragesTable data={gappingData} />
          </div>
        </>
      ) : (
        <div className="text-center p-12 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-slate-500">No data found for these filters.</div>
      )}

      <FilterModal isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)} filters={filters} setFilters={setFilters} availableClubs={availableClubs} />
    </div>
  );
}
import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../supabase';
import { analyzeClub, getOverallHighlights } from '../utils/clubMath';
import ClubRecords from '../components/ClubRecords';
import Benchmarks from '../components/Benchmarks';
import SwingMetrics from '../components/SwingMetrics';
import Assessment from '../components/Assessment';
import ClubTrendCharts from '../components/ClubTrendCharts';
import FilterModal from '../components/FilterModal';
import { Filter, Target, Trophy, Crosshair } from 'lucide-react';

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

export default function Insights() {
  const [shots, setShots] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [availableClubs, setAvailableClubs] = useState([]);
  const [filters, setFilters] = useState({ startDate: '', endDate: '', clubs: [] });

  useEffect(() => {
    const fetchShots = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('shots')
        .select('*')
        .eq('user_id', user.id);

      if (!error && data) {
        setShots(data);
      }
      setLoading(false);
    };

    fetchShots();
  }, []);

  useEffect(() => {
    if (shots.length > 0 && availableClubs.length === 0) {
      const clubs = [...new Set(shots.map(s => s.club).filter(Boolean))]
        .sort((a, b) => getClubRank(a) - getClubRank(b));
      
      setAvailableClubs(clubs);
      
      if (clubs.length > 0) {
        const driverMatches = clubs.filter(c => c.toUpperCase().includes('DRIVER') || c.toUpperCase() === '1W');
        const defaultClub = driverMatches.length > 0 ? driverMatches[0] : clubs[0];
        setFilters(prev => ({ ...prev, clubs: [defaultClub] }));
      }
    }
  }, [shots]);

  const filteredShots = useMemo(() => {
    return shots.filter(shot => {
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
  }, [shots, filters]);

  const activeClub = filters.clubs.length > 0 ? filters.clubs[0] : null;
  
  const clubData = useMemo(() => analyzeClub(filteredShots, activeClub), [filteredShots, activeClub]);
  const highlights = useMemo(() => getOverallHighlights(shots), [shots]);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (loading) return <div className="p-8 text-emerald-600 text-center font-bold">Loading Insights...</div>;

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto w-full pb-24 md:pb-8">
      
      <header className="mb-8 flex flex-col md:flex-row md:justify-between md:items-end gap-4 print:hidden">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100">Club Performance</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Deep dive into your simulator metrics and trends.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setIsFilterOpen(true)} 
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm transition-colors font-medium"
          >
            <Filter className="w-4 h-4 text-emerald-600 dark:text-emerald-500" /> 
            Filters
          </button>
        </div>
      </header>

      {shots.length === 0 ? (
        <div className="text-center p-12 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <p className="text-slate-500 font-medium">No simulator data found. Upload a SkyTrak CSV on the Dashboard to see insights.</p>
        </div>
      ) : (
        <>
          {highlights && (
            <div className="mb-10">
              <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 px-1">All-Time Highlights</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 shadow-sm relative overflow-hidden">
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-sm font-bold text-slate-500">Longest Carry</p>
                    <Target className="w-5 h-5 text-emerald-500 opacity-80" />
                  </div>
                  <p className="text-3xl text-slate-900 dark:text-slate-100 mb-1">
                    {Math.round(highlights.prCarry.distance)} <span className="text-sm font-medium text-slate-400">yds</span>
                  </p>
                  <p className="text-xs font-bold text-emerald-600 dark:text-emerald-500">
                    {highlights.prCarry.club} <span className="text-slate-400 font-normal ml-1">• {formatDate(highlights.prCarry.date)}</span>
                  </p>
                </div>

                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 shadow-sm relative overflow-hidden">
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-sm font-bold text-slate-500">Longest Total</p>
                    <Trophy className="w-5 h-5 text-amber-500 opacity-80" />
                  </div>
                  <p className="text-3xl text-slate-900 dark:text-slate-100 mb-1">
                    {Math.round(highlights.prTotal.distance)} <span className="text-sm font-medium text-slate-400">yds</span>
                  </p>
                  <p className="text-xs font-bold text-amber-600 dark:text-amber-500">
                    {highlights.prTotal.club} <span className="text-slate-400 font-normal ml-1">• {formatDate(highlights.prTotal.date)}</span>
                  </p>
                </div>

                {highlights.mostConsistent && (
                  <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 shadow-sm relative overflow-hidden">
                    <div className="flex justify-between items-start mb-2">
                      <p className="text-sm font-bold text-slate-500">Most Consistent</p>
                      <Crosshair className="w-5 h-5 text-blue-500 opacity-80" />
                    </div>
                    <p className="text-3xl text-slate-900 dark:text-slate-100 mb-1">
                      {highlights.mostConsistent.club}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-400">{Math.round(highlights.mostConsistent.score)}% Rating</span>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-900/50 ${highlights.mostConsistent.color}`}>
                        {highlights.mostConsistent.label}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          
          <div className="mb-6 pt-6 border-t border-slate-200 dark:border-slate-800">
            <h2 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
              {activeClub ? `${activeClub} Analytics` : 'No Club Selected'}
            </h2>
          </div>
          
          {clubData && (
            <div className="mt-2">
              <p className="text-xs font-bold text-slate-400 mb-6 uppercase tracking-wider">
                Analyzing {clubData.shotCount} filtered shots for {activeClub}
              </p>
              
              <ClubRecords prs={clubData.prs} />
              <Benchmarks metrics={clubData.metrics} activeClub={activeClub} />
              <SwingMetrics metrics={clubData.metrics} activeClub={activeClub} />
              <Assessment metrics={clubData.metrics} activeClub={activeClub} />
              <ClubTrendCharts trends={clubData.trends} />
            </div>
          )}
        </>
      )}

      <FilterModal 
        isOpen={isFilterOpen} 
        onClose={() => setIsFilterOpen(false)} 
        filters={filters} 
        setFilters={setFilters} 
        availableClubs={availableClubs} 
        singleSelect={true}
      />
    </div>
  );
}
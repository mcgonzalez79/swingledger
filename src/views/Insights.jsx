import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../supabase';
import { analyzeClub, getOverallHighlights } from '../utils/clubMath';
import ClubRecords from '../components/ClubRecords';
import Benchmarks from '../components/Benchmarks';
import SwingMetrics from '../components/SwingMetrics';
import Assessment from '../components/Assessment';
import ClubTrendCharts from '../components/ClubTrendCharts';
import FilterModal from '../components/FilterModal';
import { Filter, Target, Trophy, Crosshair, UploadCloud, Table, X, Download, Printer } from 'lucide-react';

const getClubRank = (clubName) => {
  if (!clubName) return 999;
  
  let normalized = clubName.toString().toUpperCase().trim();
  
  if (normalized === 'DR' || normalized === 'DRIVER') normalized = 'DRIVER';
  else if (normalized.includes('WOOD')) normalized = normalized.replace(' WOOD', 'W');
  else if (normalized.includes('HYBRID')) normalized = normalized.replace(' HYBRID', 'H');
  else if (normalized.includes('IRON')) normalized = normalized.replace(' IRON', 'I');
  else if (normalized.includes('PITCHING WEDGE')) normalized = 'PW';
  else if (normalized.includes('GAP WEDGE') || normalized === 'A WEDGE' || normalized === 'APPROACH WEDGE') normalized = 'GW';
  else if (normalized.includes('SAND WEDGE')) normalized = 'SW';
  else if (normalized.includes('LOB WEDGE')) normalized = 'LW';
  
  normalized = normalized.replace('°', '');

  const order = [
    'DRIVER', '1W', '2W', '3W', '4W', '5W', '7W', '9W',
    '1H', '2H', '3H', '4H', '5H', '6H', '7H',
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

// Club Data Modal Component
const ClubDataModal = ({ isOpen, onClose, shots }) => {
  if (!isOpen) return null;

  const averages = useMemo(() => {
    const clubMap = {};
    shots.forEach(shot => {
      if (!shot.club) return;
      if (!clubMap[shot.club]) {
        clubMap[shot.club] = {
          club: shot.club, count: 0, carry: 0, total: 0, smash: 0, clubSpeed: 0, ballSpeed: 0, spin: 0, launch: 0,
          hasSmash: 0, hasClubSpeed: 0, hasBallSpeed: 0, hasSpin: 0, hasLaunch: 0
        };
      }
      const c = clubMap[shot.club];
      c.count++;
      c.carry += shot.carry || 0;
      c.total += shot.total || 0;
      
      if (shot.smash_factor) { c.smash += shot.smash_factor; c.hasSmash++; }
      if (shot.club_speed) { c.clubSpeed += shot.club_speed; c.hasClubSpeed++; }
      if (shot.ball_speed) { c.ballSpeed += shot.ball_speed; c.hasBallSpeed++; }
      if (shot.backspin) { c.spin += shot.backspin; c.hasSpin++; }
      if (shot.launch_angle) { c.launch += shot.launch_angle; c.hasLaunch++; }
    });

    return Object.values(clubMap).map(c => ({
      club: c.club,
      count: c.count,
      carry: Math.round(c.carry / c.count),
      total: Math.round(c.total / c.count),
      smash: c.hasSmash ? (c.smash / c.hasSmash).toFixed(2) : '--',
      clubSpeed: c.hasClubSpeed ? Math.round(c.clubSpeed / c.hasClubSpeed) : '--',
      ballSpeed: c.hasBallSpeed ? Math.round(c.ballSpeed / c.hasBallSpeed) : '--',
      spin: c.hasSpin ? Math.round(c.spin / c.hasSpin) : '--',
      launch: c.hasLaunch ? (c.launch / c.hasLaunch).toFixed(1) : '--'
    })).sort((a, b) => getClubRank(a.club) - getClubRank(b.club));
  }, [shots]);

  const handleExportCSV = () => {
    const headers = ["Club", "Shots", "Carry (yd)", "Total (yd)", "Smash", "Club Spd (mph)", "Ball Spd (mph)", "Backspin (rpm)", "Launch (deg)"];
    const rows = averages.map(r => [r.club, r.count, r.carry, r.total, r.smash, r.clubSpeed, r.ballSpeed, r.spin, r.launch].join(','));
    const csvContent = [headers.join(','), ...rows].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Club_Averages_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 print:static print:bg-transparent print:p-0">
      {/* THE FIX: Added print:[zoom:0.5] to this container to force the print preview to exactly 50% scale */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-5xl overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh] print:max-h-none print:shadow-none print:border-none print:bg-white text-slate-900 print:text-black print:[zoom:0.5]">
        
        <div className="flex justify-between items-center p-4 md:p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 print:bg-white print:border-b-2">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 print:text-black print:text-3xl">
            <Table className="w-5 h-5 text-blue-500 print:hidden" />
            All Club Averages
          </h2>
          
          <div className="flex gap-2 print:hidden">
            <button onClick={handleExportCSV} className="text-slate-500 hover:text-emerald-600 p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 flex items-center gap-2 text-sm font-bold transition-colors">
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export</span>
            </button>
            <button onClick={() => window.print()} className="text-slate-500 hover:text-blue-600 p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 flex items-center gap-2 text-sm font-bold transition-colors">
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Print</span>
            </button>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-2 ml-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <div className="p-4 md:p-6 flex-1 min-h-0 flex flex-col print:p-0 print:mt-4">
          <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-auto flex-1 bg-white dark:bg-slate-900 shadow-sm print:overflow-visible print:border-none print:shadow-none">
            <table className="w-full text-left border-collapse whitespace-nowrap min-w-max">
              <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 sticky top-0 z-10 shadow-sm print:static print:bg-white print:text-black">
                <tr>
                  <th className="p-4 font-bold align-top print:text-lg">Club</th>
                  <th className="p-4 font-bold text-right align-top print:text-lg">Shots</th>
                  <th className="p-4 font-bold text-right align-top">
                    <div className="leading-none mb-1 print:text-lg">Carry</div>
                    <div className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold normal-case tracking-normal print:text-slate-500 print:text-sm">(yd)</div>
                  </th>
                  <th className="p-4 font-bold text-right align-top">
                    <div className="leading-none mb-1 print:text-lg">Total</div>
                    <div className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold normal-case tracking-normal print:text-slate-500 print:text-sm">(yd)</div>
                  </th>
                  <th className="p-4 font-bold text-right align-top print:text-lg">Smash</th>
                  <th className="p-4 font-bold text-right align-top">
                    <div className="leading-none mb-1 print:text-lg">Club Spd</div>
                    <div className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold normal-case tracking-normal print:text-slate-500 print:text-sm">(mph)</div>
                  </th>
                  <th className="p-4 font-bold text-right align-top">
                    <div className="leading-none mb-1 print:text-lg">Ball Spd</div>
                    <div className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold normal-case tracking-normal print:text-slate-500 print:text-sm">(mph)</div>
                  </th>
                  <th className="p-4 font-bold text-right align-top">
                    <div className="leading-none mb-1 print:text-lg">Backspin</div>
                    <div className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold normal-case tracking-normal print:text-slate-500 print:text-sm">(rpm)</div>
                  </th>
                  <th className="p-4 font-bold text-right align-top pr-6">
                    <div className="leading-none mb-1 print:text-lg">Launch</div>
                    <div className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold normal-case tracking-normal print:text-slate-500 print:text-sm">(°)</div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 print:divide-slate-300">
                {averages.map((row) => (
                  <tr key={row.club} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors print:hover:bg-transparent">
                    <td className="p-4 font-bold text-slate-900 dark:text-slate-100 print:text-black print:text-lg">{row.club}</td>
                    <td className="p-4 text-right text-slate-600 dark:text-slate-400 print:text-black print:text-lg">{row.count}</td>
                    <td className="p-4 text-right font-semibold text-emerald-600 dark:text-emerald-400 print:text-black print:text-lg">{row.carry}</td>
                    <td className="p-4 text-right font-semibold text-emerald-600 dark:text-emerald-400 print:text-black print:text-lg">{row.total}</td>
                    <td className="p-4 text-right text-slate-600 dark:text-slate-300 print:text-black print:text-lg">{row.smash}</td>
                    <td className="p-4 text-right text-slate-600 dark:text-slate-300 print:text-black print:text-lg">{row.clubSpeed}</td>
                    <td className="p-4 text-right text-slate-600 dark:text-slate-300 print:text-black print:text-lg">{row.ballSpeed}</td>
                    <td className="p-4 text-right text-slate-600 dark:text-slate-300 print:text-black print:text-lg">{row.spin}</td>
                    <td className="p-4 text-right text-slate-600 dark:text-slate-300 pr-6 print:text-black print:text-lg">{row.launch}</td>
                  </tr>
                ))}
                {averages.length === 0 && (
                  <tr>
                    <td colSpan="9" className="p-8 text-center text-slate-500 print:text-black print:text-lg">No data available.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default function Insights({ refreshTrigger }) {
  const [shots, setShots] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isClubDataOpen, setIsClubDataOpen] = useState(false);
  
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
  }, [refreshTrigger]);

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
      
      <div className={isClubDataOpen ? 'print:hidden' : ''}>
        <header className="mb-8 flex flex-col md:flex-row md:justify-between md:items-end gap-4 print:hidden">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100">Club Performance</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Deep dive into your simulator metrics and trends.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={() => window.dispatchEvent(new CustomEvent('open-upload'))}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm transition-colors font-medium"
            >
              <UploadCloud className="w-4 h-4" /> 
              Import
            </button>
            
            <button 
              onClick={() => setIsClubDataOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm transition-colors font-medium"
            >
              <Table className="w-4 h-4 text-blue-500" /> 
              Club Data
            </button>

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
            <p className="text-slate-500 font-medium">No simulator data found. Upload a SkyTrak CSV to see insights.</p>
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
      </div>

      <FilterModal 
        isOpen={isFilterOpen} 
        onClose={() => setIsFilterOpen(false)} 
        filters={filters} 
        setFilters={setFilters} 
        availableClubs={availableClubs} 
        singleSelect={true}
      />

      <ClubDataModal 
        isOpen={isClubDataOpen} 
        onClose={() => setIsClubDataOpen(false)} 
        shots={filteredShots} 
      />
    </div>
  );
}
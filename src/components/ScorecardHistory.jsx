import React, { useState } from 'react';
import { FileEdit, X, MapPin, Search, Calendar, AlignLeft } from 'lucide-react'; 
import EditRoundModal from './EditRoundModal';

export default function ScorecardHistory({ rounds, loading, onUpdateRound, onDeleteRound }) {
  const [editingRound, setEditingRound] = useState(null);
  const [showAllModal, setShowAllModal] = useState(false);
  
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  if (loading) return <div className="p-4 text-emerald-600 font-medium">Loading history...</div>;
  if (!rounds || rounds.length === 0) return <div className="p-8 text-center text-slate-500">No rounds logged yet. Get out there!</div>;

  const recentRounds = rounds.slice(0, 5);

  const filteredRounds = rounds.filter(round => {
    // 1. Text Query Match
    let matchesText = true;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const courseMatch = round.course_name?.toLowerCase().includes(query);
      const clubMatch = round.club?.toLowerCase().includes(query);
      const locationMatch = round.location?.toLowerCase().includes(query);
      const scoreMatch = round.total_score?.toString().includes(query);
      // Also search within notes!
      const notesMatch = round.notes?.toLowerCase().includes(query);
      
      matchesText = courseMatch || clubMatch || locationMatch || scoreMatch || notesMatch;
    }

    // 2. Date Range Match
    let matchesDate = true;
    if (startDate && round.date < startDate) {
      matchesDate = false;
    }
    if (endDate && round.date > endDate) {
      matchesDate = false;
    }

    return matchesText && matchesDate;
  });

  const handleResetFilters = () => {
    setSearchQuery('');
    setStartDate('');
    setEndDate('');
  };

  const handleCloseModal = () => {
    setShowAllModal(false);
    handleResetFilters();
  };

  const renderCard = (round) => (
    <div key={round.id} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm relative group transition-all hover:shadow-md shrink-0">
      
      <button 
        onClick={() => {
          setEditingRound(round);
          handleCloseModal(); 
        }}
        className="absolute top-4 right-4 p-2 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors bg-white dark:bg-slate-800 rounded-full shadow-sm border border-slate-100 dark:border-slate-700 z-10"
        title="Edit / View Details"
      >
        <FileEdit className="w-4 h-4" />
      </button>

      <div className="p-4 border-b border-slate-100 dark:border-slate-700/50 pr-14 flex flex-col justify-center">
        <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 flex items-center gap-2 flex-wrap">
          {round.course_name || 'Unnamed Course'}
          <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${
            round.holes_played === 9 
              ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' 
              : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
          }`}>
            {round.holes_played || 18} Holes
          </span>
        </h3>
        
        <p className="text-sm text-slate-500 mt-1 flex items-center gap-1.5 flex-wrap">
          {round.club && <span className="font-semibold">{round.club} •</span>}
          {round.location && <><MapPin className="w-3.5 h-3.5" /> {round.location} • </>}
          {new Date(round.date).toLocaleDateString(undefined, { timeZone: 'UTC', weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
        </p>
      </div>

      <div className="grid grid-cols-4 divide-x divide-slate-100 dark:divide-slate-700/50 bg-slate-50 dark:bg-slate-800/50">
        <div className="p-3 text-center flex flex-col justify-center">
          <span className="block text-xs text-slate-400 mb-1 tracking-wide">SCORE</span>
          <span className="font-bold text-emerald-600 dark:text-emerald-500 text-xl leading-none">
            {round.total_score || '--'}
          </span>
        </div>
        <div className="p-3 text-center flex flex-col justify-center">
          <span className="block text-xs text-slate-400 mb-1 tracking-wide">PUTTS</span>
          <span className="font-semibold text-slate-700 dark:text-slate-300 text-lg leading-none">
            {round.total_putts || '--'}
          </span>
        </div>
        <div className="p-3 text-center flex flex-col justify-center">
          <span className="block text-xs text-slate-400 mb-1 tracking-wide">FIR / GIR</span>
          <span className="font-semibold text-slate-700 dark:text-slate-300 text-lg leading-none">
            {round.fairways_hit !== null ? round.fairways_hit : '-'} / {round.greens_in_regulation !== null ? round.greens_in_regulation : '-'}
          </span>
        </div>
        <div className="p-3 text-center flex flex-col justify-center">
          <span className="block text-xs text-slate-400 mb-1 tracking-wide">PENALTY</span>
          <span className="font-semibold text-slate-700 dark:text-slate-300 text-lg leading-none">
            {round.penalty_strokes !== null ? round.penalty_strokes : '--'}
          </span>
        </div>
      </div>

      {/* THE FIX: Conditionally render Notes block at the bottom of the card */}
      {round.notes && (
        <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-700/50 flex items-start gap-2">
          <AlignLeft className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
          <p className="text-sm text-slate-600 dark:text-slate-400 italic leading-relaxed">
            "{round.notes}"
          </p>
        </div>
      )}
      
    </div>
  );

  return (
    <>
      <div className="space-y-4 w-full pb-4">
        {recentRounds.map(renderCard)}
      </div>

      {rounds.length > 5 && (
        <button 
          onClick={() => setShowAllModal(true)}
          className="w-full mb-8 py-4 bg-slate-100 dark:bg-slate-800/50 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-xl transition-colors border-2 border-slate-200 dark:border-slate-700 border-dashed"
        >
          View All {rounds.length} Past Rounds
        </button>
      )}

      {showAllModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-40">
          <div className="bg-slate-50 dark:bg-slate-950 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col border border-slate-200 dark:border-slate-700 overflow-hidden">
            
            <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 z-10 shrink-0">
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">All Past Rounds</h2>
              <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 bg-slate-100 dark:bg-slate-800 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter Section */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0 space-y-3">
              {/* Text Search */}
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by course, club, location, score, or notes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:border-emerald-500 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 transition-colors"
                />
              </div>

              {/* Date Range Selection & Clear Button */}
              <div className="flex gap-3 items-end">
                <div className="flex-1 relative">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">From Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:border-emerald-500 text-slate-900 dark:text-slate-100 transition-colors"
                  />
                </div>
                <div className="flex-1 relative">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">To Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:border-emerald-500 text-slate-900 dark:text-slate-100 transition-colors"
                  />
                </div>
                
                {/* Dynamically show Clear button if any filter is active */}
                {(searchQuery || startDate || endDate) && (
                  <button 
                    onClick={handleResetFilters}
                    className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-sm font-bold transition-colors border border-slate-200 dark:border-slate-700 shrink-0"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
            
            <div className="p-4 overflow-y-auto space-y-4 flex-1">
              {filteredRounds.length === 0 ? (
                <div className="p-8 text-center text-slate-500 dark:text-slate-400 font-medium bg-white dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700">
                  No rounds found matching your criteria.
                </div>
              ) : (
                filteredRounds.map(renderCard)
              )}
            </div>
          </div>
        </div>
      )}

      {editingRound && (
        <EditRoundModal 
          round={editingRound} 
          onClose={() => setEditingRound(null)} 
          onUpdate={onUpdateRound} 
          onDelete={onDeleteRound}
        />
      )}
    </>
  );
}
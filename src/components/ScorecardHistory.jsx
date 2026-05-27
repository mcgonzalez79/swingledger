import React, { useState } from 'react';
import { FileEdit, X } from 'lucide-react';
import EditRoundModal from './EditRoundModal';

export default function ScorecardHistory({ rounds, loading, onUpdateRound, onDeleteRound }) {
  const [editingRound, setEditingRound] = useState(null);
  const [showAllModal, setShowAllModal] = useState(false); // State for the new View All modal

  if (loading) return <div className="p-4 text-emerald-600 font-medium">Loading history...</div>;
  if (!rounds || rounds.length === 0) return <div className="p-8 text-center text-slate-500">No rounds logged yet. Get out there!</div>;

  // Split out the last 5 for the main view
  const recentRounds = rounds.slice(0, 5);

  // We abstract the card into a function so we can render it in both the main view AND the modal without duplicating code!
  const renderCard = (round) => (
    <div key={round.id} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm relative group transition-all hover:shadow-md shrink-0">
      
      <button 
        onClick={() => setEditingRound(round)}
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
        
        <p className="text-sm text-slate-500 mt-1">
          {round.club ? `${round.club} • ` : ''}
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

      {round.notes && (
        <div className="p-4 border-t border-slate-100 dark:border-slate-700/50 bg-white dark:bg-slate-800">
          <p className="text-sm text-slate-600 dark:text-slate-400 italic line-clamp-2">"{round.notes}"</p>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* 1. The Main View (Limited to 5) */}
      <div className="space-y-4 w-full pb-4">
        {recentRounds.map(renderCard)}
      </div>

      {/* 2. The View All Trigger Button (Only shows if there are >5 rounds) */}
      {rounds.length > 5 && (
        <button 
          onClick={() => setShowAllModal(true)}
          className="w-full mb-8 py-4 bg-slate-100 dark:bg-slate-800/50 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-xl transition-colors border-2 border-slate-200 dark:border-slate-700 border-dashed"
        >
          View All {rounds.length} Past Rounds
        </button>
      )}

      {/* 3. The View All Modal (z-40) */}
      {showAllModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-40">
          <div className="bg-slate-50 dark:bg-slate-950 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col border border-slate-200 dark:border-slate-700 overflow-hidden">
            
            <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 z-10 shrink-0">
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">All Past Rounds</h2>
              <button onClick={() => setShowAllModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 bg-slate-100 dark:bg-slate-800 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Scrollable interior mapping ALL rounds */}
            <div className="p-4 overflow-y-auto space-y-4 flex-1">
              {rounds.map(renderCard)}
            </div>

          </div>
        </div>
      )}

      {/* 4. The Edit Modal (z-50: overlays on top of everything) */}
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
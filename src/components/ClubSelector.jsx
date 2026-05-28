import React from 'react';

export default function ClubSelector({ shots, selectedClub, onSelectClub }) {
  if (!shots || shots.length === 0) return null;

  // Extract unique clubs, remove blanks, and sort alphabetically
  const uniqueClubs = [...new Set(shots.map(s => s.club).filter(Boolean))].sort();

  if (uniqueClubs.length === 0) return null;

  return (
    <div className="mb-6">
      <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3 px-1">Select Club</h3>
      <div className="flex overflow-x-auto pb-2 gap-2 snap-x hide-scrollbar">
        {uniqueClubs.map(club => (
          <button
            key={club}
            onClick={() => onSelectClub(club)}
            className={`snap-start whitespace-nowrap px-6 py-2.5 rounded-full font-bold transition-all ${
              selectedClub === club
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-emerald-500'
            }`}
          >
            {club}
          </button>
        ))}
      </div>
    </div>
  );
}
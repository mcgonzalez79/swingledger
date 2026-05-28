import React, { useMemo } from 'react';
import { useAchievements } from '../context/AchievementContext';
import { ACHIEVEMENTS } from '../config/achievements';
import { Lock, CheckCircle2, Target } from 'lucide-react';

// THE FIX: Added the intelligent club ranking function to sort by loft
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
    const degree = parseInt(numericMatch[0], 10);
    if (degree >= 42 && degree <= 64) return 100 + degree;
  }
  
  return 999;
};

export default function Achievements() {
  const { unlockedIds, clubPrs } = useAchievements();

  // Group achievements by category
  const groupedAchievements = useMemo(() => {
    return ACHIEVEMENTS.reduce((acc, ach) => {
      const isUnlocked = unlockedIds.includes(ach.id);
      
      // Hide secret achievements entirely if locked
      if (ach.isSecret && !isUnlocked) return acc;

      if (!acc[ach.category]) acc[ach.category] = [];
      acc[ach.category].push({ ...ach, isUnlocked });
      return acc;
    }, {});
  }, [unlockedIds]);

  // THE FIX: Sort PRs using the getClubRank function (lowest loft to highest loft)
  const sortedPrs = useMemo(() => {
    if (!clubPrs) return [];
    return Object.entries(clubPrs)
      .map(([club, data]) => ({ club, ...data }))
      .sort((a, b) => getClubRank(a.club) - getClubRank(b.club));
  }, [clubPrs]);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto w-full pb-24 md:pb-8">
      <header className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100">Trophy Room</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Track your progress, milestones, and legacy.</p>
      </header>

      {/* --- PERSONAL RECORDS SECTION --- */}
      {sortedPrs.length > 0 && (
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-4 border-b border-slate-200 dark:border-slate-800 pb-2">
            <Target className="w-5 h-5 text-emerald-600 dark:text-emerald-500" />
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              Personal Records
            </h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {sortedPrs.map((pr) => (
              <div key={pr.club} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-sm flex flex-col">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                  {pr.club}
                </span>
                <span className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                  {Math.round(pr.max_carry)} <span className="text-xs font-medium text-slate-400">yds</span>
                </span>
                <span className="mt-auto text-[10px] font-medium text-slate-400 dark:text-slate-500">
                  {formatDate(pr.achieved_at)}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* --- GAMIFICATION ACHIEVEMENTS SECTION --- */}
      <div className="space-y-12">
        {Object.entries(groupedAchievements).map(([category, items]) => (
          <section key={category}>
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-4 border-b border-slate-200 dark:border-slate-800 pb-2">
              {category}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {items.map((ach) => {
                const Icon = ach.icon;
                
                return (
                  <div 
                    key={ach.id} 
                    className={`relative p-5 rounded-xl border transition-all ${
                      ach.isUnlocked 
                        ? 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm' 
                        : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 opacity-60 grayscale hover:grayscale-0 hover:opacity-100'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-xl shrink-0 ${ach.isUnlocked ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-slate-200 dark:bg-slate-800 text-slate-400'}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className={`font-bold text-base mb-1 ${ach.isUnlocked ? 'text-slate-900 dark:text-slate-100' : 'text-slate-500'}`}>
                          {ach.title}
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 leading-snug mb-3">
                          {ach.description}
                        </p>
                        
                        {/* Status */}
                        <div className="flex items-center">
                          {ach.isUnlocked ? (
                            <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-500 uppercase tracking-wider">
                              <CheckCircle2 className="w-4 h-4" /> Unlocked
                            </span>
                          ) : (
                            <span className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider">
                              <Lock className="w-3.5 h-3.5" /> Locked
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
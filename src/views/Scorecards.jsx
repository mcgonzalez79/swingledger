import React, { useState } from 'react';
import ScorecardForm from '../components/ScorecardForm';
import ScorecardHistory from '../components/ScorecardHistory';
import RecentRoundsReport from '../components/RecentRoundsReport';
import ScoringTrendChart from '../components/ScoringTrendChart'; // NEW IMPORT
import { useRounds } from '../hooks/useRounds';

export default function Scorecards() {
  const [activeTab, setActiveTab] = useState('history');
  const { rounds, loading, insertRound, updateRound, deleteRound } = useRounds();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogRound = async (data) => {
    setIsSubmitting(true);
    const result = await insertRound(data);
    setIsSubmitting(false);
    
    if (result.success) {
      setTimeout(() => setActiveTab('history'), 500); 
    }
    return result;
  };

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto w-full">
      <header className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100">Scorecards</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Track your on-course performance and history.</p>
      </header>
      
      <div className="flex p-1 mb-8 bg-slate-200 dark:bg-slate-800 rounded-lg w-full">
        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 py-3 text-sm font-bold rounded-md transition-all ${
            activeTab === 'history' 
              ? 'bg-white dark:bg-slate-900 text-emerald-600 shadow-sm' 
              : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          Round History
        </button>
        <button
          onClick={() => setActiveTab('log')}
          className={`flex-1 py-3 text-sm font-bold rounded-md transition-all ${
            activeTab === 'log' 
              ? 'bg-white dark:bg-slate-900 text-emerald-600 shadow-sm' 
              : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          Log New Round
        </button>
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        {activeTab === 'history' ? (
          <>
            <RecentRoundsReport rounds={rounds} />
            
            {/* NEW CHART DROPPED HERE */}
            <ScoringTrendChart rounds={rounds} />
            
            <ScorecardHistory 
              rounds={rounds} 
              loading={loading} 
              onUpdateRound={updateRound} 
              onDeleteRound={deleteRound} 
            />
          </>
        ) : (
          <ScorecardForm 
            onSubmit={handleLogRound} 
            isSubmitting={isSubmitting} 
          />
        )}
      </div>
    </div>
  );
}
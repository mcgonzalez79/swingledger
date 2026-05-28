import React, { useState } from 'react';
import { supabase } from '../supabase';
import { PlusCircle, Calendar, Flag } from 'lucide-react';
import { useAchievements } from '../context/AchievementContext';

export default function ScorecardForm({ onRoundAdded }) {
  const { triggerEvaluation } = useAchievements(); // Initialize Engine

  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [course, setCourse] = useState('');
  const [score, setScore] = useState('');
  const [putts, setPutts] = useState('');
  const [fairways, setFairways] = useState('');
  const [greens, setGreens] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user");

      const newRound = {
        user_id: user.id,
        date,
        course_name: course,
        total_score: Number(score),
        total_putts: putts ? Number(putts) : null,
        fairways_hit: fairways ? Number(fairways) : null,
        greens_in_regulation: greens ? Number(greens) : null
      };

      const { error: dbError } = await supabase
        .from('rounds')
        .insert([newRound]);

      if (dbError) throw dbError;

      // TRIGGER EVALUATION: Pass the new round directly into the achievement engine
      triggerEvaluation([], [newRound]);

      // Reset form
      setCourse('');
      setScore('');
      setPutts('');
      setFairways('');
      setGreens('');
      if (onRoundAdded) onRoundAdded();

    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4 md:p-6">
      <div className="flex items-center gap-2 mb-6 border-b border-slate-100 dark:border-slate-700/50 pb-4">
        <PlusCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-500" />
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Log New Round</h2>
      </div>

      {error && (
        <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Date</label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input 
                type="date" 
                required
                value={date} 
                onChange={(e) => setDate(e.target.value)}
                className="w-full pl-10 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:border-emerald-500 outline-none text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Course Name</label>
            <div className="relative">
              <Flag className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input 
                type="text" 
                required
                placeholder="e.g. Pebble Beach"
                value={course} 
                onChange={(e) => setCourse(e.target.value)}
                className="w-full pl-10 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:border-emerald-500 outline-none text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Score *</label>
            <input 
              type="number" 
              required
              min="50" max="150"
              placeholder="Total"
              value={score} 
              onChange={(e) => setScore(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold text-emerald-700 dark:text-emerald-400 focus:border-emerald-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Putts</label>
            <input 
              type="number" 
              min="18" max="60"
              placeholder="Optional"
              value={putts} 
              onChange={(e) => setPutts(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:border-emerald-500 outline-none text-slate-900 dark:text-slate-100"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Fairways</label>
            <input 
              type="number" 
              min="0" max="14"
              placeholder="Hit"
              value={fairways} 
              onChange={(e) => setFairways(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:border-emerald-500 outline-none text-slate-900 dark:text-slate-100"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">GIR</label>
            <input 
              type="number" 
              min="0" max="18"
              placeholder="Hit"
              value={greens} 
              onChange={(e) => setGreens(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:border-emerald-500 outline-none text-slate-900 dark:text-slate-100"
            />
          </div>
        </div>

        <div className="pt-4">
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-sm shadow-sm transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : 'Save Scorecard'}
          </button>
        </div>
      </form>
    </div>
  );
}
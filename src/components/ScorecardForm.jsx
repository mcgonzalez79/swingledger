import React, { useState } from 'react';
import { supabase } from '../supabase';
import { PlusCircle, Calendar, Flag, MapPin, Building2 } from 'lucide-react';
import { useAchievements } from '../context/AchievementContext';

// THE FIX: Changed props to accept `onSubmit` and `isSubmitting` from Scorecards.jsx
export default function ScorecardForm({ onSubmit, isSubmitting }) {
  const { triggerEvaluation } = useAchievements();

  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [holes, setHoles] = useState(18);
  const [course, setCourse] = useState('');
  const [club, setClub] = useState('');
  const [location, setLocation] = useState('');
  const [score, setScore] = useState('');
  const [putts, setPutts] = useState('');
  const [fairways, setFairways] = useState('');
  const [greens, setGreens] = useState('');
  const [penalties, setPenalties] = useState('');
  const [error, setError] = useState('');

  const isFormValid = date && course.trim() !== '' && score !== '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user");

      const newRound = {
        user_id: user.id,
        date,
        holes_played: Number(holes),
        course_name: course.trim(),
        club: club.trim(),
        location: location.trim(),
        total_score: Number(score),
        total_putts: putts !== '' ? Number(putts) : null,
        fairways_hit: fairways !== '' ? Number(fairways) : null,
        greens_in_regulation: greens !== '' ? Number(greens) : null,
        penalty_strokes: penalties !== '' ? Number(penalties) : null
      };

      // THE FIX: We now call the parent's onSubmit function to update the list and switch tabs!
      const result = await onSubmit(newRound);

      if (result && result.success) {
        triggerEvaluation([], [newRound]);

        // Reset form
        setCourse('');
        setClub('');
        setLocation('');
        setScore('');
        setPutts('');
        setFairways('');
        setGreens('');
        setPenalties('');
        setHoles(18);
      } else if (result && result.error) {
        setError(result.error);
      }
    } catch (err) {
      setError(err.message);
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="col-span-1">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Date</label>
            <div className="relative">
              <input 
                type="date" 
                required
                value={date} 
                onChange={(e) => setDate(e.target.value)}
                className="w-full pl-3 pr-10 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:border-emerald-500 outline-none text-slate-900 dark:text-slate-100 [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:w-10 [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
              />
              <Calendar className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
            </div>
          </div>
          <div className="col-span-1">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Holes</label>
            <select 
              value={holes} 
              onChange={(e) => setHoles(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:border-emerald-500 outline-none text-slate-900 dark:text-slate-100 font-medium"
            >
              <option value="18">18 Holes</option>
              <option value="9">9 Holes</option>
            </select>
          </div>
          <div className="col-span-2 md:col-span-2">
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Club</label>
            <div className="relative">
              <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input 
                type="text" 
                placeholder="e.g. Pinehurst Resort" 
                value={club} 
                onChange={(e) => setClub(e.target.value)} 
                className="w-full pl-10 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:border-emerald-500 outline-none text-slate-900 dark:text-slate-100" 
              />
            </div>
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">City, State</label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input 
                type="text" 
                placeholder="e.g. Monterey, CA" 
                value={location} 
                onChange={(e) => setLocation(e.target.value)} 
                className="w-full pl-10 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:border-emerald-500 outline-none text-slate-900 dark:text-slate-100" 
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 pt-2">
          <div className="md:col-span-1">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Score *</label>
            <input 
              type="number" 
              required
              min="20" max="150"
              value={score} 
              onChange={(e) => setScore(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold text-emerald-700 dark:text-emerald-400 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Putts</label>
            <input 
              type="number" 
              min="9" max="60"
              placeholder="--"
              value={putts} 
              onChange={(e) => setPutts(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none text-slate-900 dark:text-slate-100"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">FIR</label>
            <input 
              type="number" 
              min="0" max="14"
              placeholder="--"
              value={fairways} 
              onChange={(e) => setFairways(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none text-slate-900 dark:text-slate-100"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">GIR</label>
            <input 
              type="number" 
              min="0" max="18"
              placeholder="--"
              value={greens} 
              onChange={(e) => setGreens(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none text-slate-900 dark:text-slate-100"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Penalties</label>
            <input 
              type="number" 
              placeholder="--"
              value={penalties} 
              onChange={(e) => setPenalties(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none text-slate-900 dark:text-slate-100"
            />
          </div>
        </div>

        <div className="pt-4">
          <button 
            type="submit" 
            disabled={isSubmitting || !isFormValid}
            className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-sm shadow-sm transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : 'Save Scorecard'}
          </button>
        </div>
      </form>
    </div>
  );
}
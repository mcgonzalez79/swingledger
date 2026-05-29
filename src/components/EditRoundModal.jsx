import React, { useState } from 'react';
import { X, Calendar, Flag, MapPin, Building2, Trash2 } from 'lucide-react';

export default function EditRoundModal({ round, onClose, onUpdate, onDelete }) {
  
  const initialDate = round.date ? round.date.substring(0, 10) : new Date().toISOString().split('T')[0];
  
  const [date, setDate] = useState(initialDate);
  const [holes, setHoles] = useState(round.holes_played || 18); 
  const [course, setCourse] = useState(round.course_name || '');
  const [club, setClub] = useState(round.club || '');
  const [location, setLocation] = useState(round.location || '');
  const [score, setScore] = useState(round.total_score || '');
  const [putts, setPutts] = useState(round.total_putts || '');
  const [fairways, setFairways] = useState(round.fairways_hit || '');
  const [greens, setGreens] = useState(round.greens_in_regulation || '');
  const [penalties, setPenalties] = useState(round.penalty_strokes || '');
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isFormValid = date && course.trim() !== '' && score !== '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const updatedData = {
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

    await onUpdate(round.id, updatedData);
    setIsSubmitting(false);
    onClose();
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this round? This cannot be undone.")) {
      await onDelete(round.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
        
        <div className="flex justify-between items-center p-4 md:p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Edit Scorecard</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-2 bg-white dark:bg-slate-800 rounded-full shadow-sm border border-slate-200 dark:border-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 md:p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="col-span-1">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Date</label>
                <div className="relative">
                  {/* THE FIX: Moved calendar icon to the right, hidden default browser icon, preserved click area */}
                  <input 
                    type="date" 
                    required
                    value={date} 
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full pl-3 pr-10 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:border-emerald-500 outline-none text-slate-900 dark:text-slate-100 [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:w-10 [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                  />
                  <Calendar className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                </div>
              </div>
              <div className="col-span-1">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Holes</label>
                <select 
                  value={holes} 
                  onChange={(e) => setHoles(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:border-emerald-500 outline-none text-slate-900 dark:text-slate-100 font-medium"
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
                    value={course} 
                    onChange={(e) => setCourse(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:border-emerald-500 outline-none text-slate-900 dark:text-slate-100"
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
                    className="w-full pl-10 pr-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:border-emerald-500 outline-none text-slate-900 dark:text-slate-100" 
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
                    className="w-full pl-10 pr-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:border-emerald-500 outline-none text-slate-900 dark:text-slate-100" 
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
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-bold text-emerald-700 dark:text-emerald-400 outline-none"
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
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm outline-none text-slate-900 dark:text-slate-100"
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
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm outline-none text-slate-900 dark:text-slate-100"
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
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm outline-none text-slate-900 dark:text-slate-100"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Penalties</label>
                <input 
                  type="number" 
                  placeholder="--"
                  value={penalties} 
                  onChange={(e) => setPenalties(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm outline-none text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>

            <div className="pt-6 flex gap-3">
              <button 
                type="button"
                onClick={handleDelete}
                className="p-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-lg transition-colors flex items-center justify-center shrink-0"
                title="Delete Round"
              >
                <Trash2 className="w-5 h-5" />
              </button>
              
              <button 
                type="submit" 
                disabled={isSubmitting || !isFormValid}
                className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-sm shadow-sm transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Saving Updates...' : 'Update Scorecard'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
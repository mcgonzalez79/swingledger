import React, { useState, useEffect } from 'react';
import DOMPurify from 'dompurify';

const getLocalDateString = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().split('T')[0];
};

const defaultData = {
  date: getLocalDateString(),
  club: '',
  course_name: '',
  location: '',
  tees: 'White',
  holes_played: 18,
  total_score: '',
  total_putts: '',
  fairways_hit: '',
  greens_in_regulation: '',
  penalty_strokes: '',
  notes: ''
};

export default function ScorecardForm({ onSubmit, isSubmitting, initialData = null, onCancel = null }) {
  const [successStatus, setSuccessStatus] = useState(false);
  const [formData, setFormData] = useState(initialData || defaultData);

  useEffect(() => {
    if (initialData) setFormData(initialData);
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // THE FIX: Prevent users from physically typing a number greater than 999
    const statFields = ['total_score', 'total_putts', 'fairways_hit', 'greens_in_regulation', 'penalty_strokes'];
    if (statFields.includes(name) && value !== '') {
      if (Number(value) > 999) return; // Ignore the keystroke if it pushes the value over 999
    }

    setFormData(prev => ({ 
      ...prev, 
      [name]: name === 'holes_played' ? parseInt(value, 10) : value 
    }));
  };

  const blockInvalidNumberChars = (e) => {
    if (e.key === '-' || e.key === 'e' || e.key === 'E' || e.key === '+') {
      e.preventDefault();
    }
  };

  const parseNum = (val) => (val === '' || val === null ? null : parseInt(val, 10));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      course_name: DOMPurify.sanitize(formData.course_name || ''),
      club: DOMPurify.sanitize(formData.club || ''),
      location: DOMPurify.sanitize(formData.location || ''),
      notes: DOMPurify.sanitize(formData.notes || ''),
      
      // THE FIX: Added Math.min(999) to completely secure the payload bounds
      total_score: formData.total_score ? Math.min(999, Math.max(0, parseNum(formData.total_score))) : null,
      total_putts: formData.total_putts ? Math.min(999, Math.max(0, parseNum(formData.total_putts))) : null,
      fairways_hit: formData.fairways_hit ? Math.min(999, Math.max(0, parseNum(formData.fairways_hit))) : null,
      greens_in_regulation: formData.greens_in_regulation ? Math.min(999, Math.max(0, parseNum(formData.greens_in_regulation))) : null,
      penalty_strokes: formData.penalty_strokes ? Math.min(999, Math.max(0, parseNum(formData.penalty_strokes))) : null,
    };

    const result = await onSubmit(payload);
    if (result && result.success && !initialData) {
      setSuccessStatus(true);
      setTimeout(() => setSuccessStatus(false), 3000);
      setFormData(prev => ({
        ...prev, total_score: '', total_putts: '', fairways_hit: '', greens_in_regulation: '', penalty_strokes: '', notes: ''
      }));
    }
  };

  const gridInputClass = "w-full bg-transparent text-center font-bold text-xl md:text-2xl outline-none p-4 text-slate-900 dark:text-slate-100 placeholder:text-slate-300 dark:placeholder:text-slate-700 transition-colors focus:bg-emerald-50 dark:focus:bg-emerald-900/20";
  const headerInputClass = "w-full bg-transparent text-sm md:text-base outline-none p-3 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:bg-slate-50 dark:focus:bg-slate-800";

  return (
    <form onSubmit={handleSubmit} className="w-full pb-8">
      {successStatus && (
        <div className="mb-6 p-4 bg-emerald-100 text-emerald-800 rounded-lg text-center font-bold">
          Round logged successfully!
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 border-2 border-slate-800 dark:border-slate-500 rounded-xl overflow-hidden shadow-lg mb-6">
        
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-300 dark:divide-slate-700 border-b-2 border-slate-800 dark:border-slate-500 bg-slate-50 dark:bg-slate-800/50">
          <input type="text" name="course_name" placeholder="Course Name" value={formData.course_name ?? ''} onChange={handleChange} className={headerInputClass + " font-bold uppercase"} />
          <div className="grid grid-cols-3 divide-x divide-slate-300 dark:divide-slate-700">
            <input type="date" name="date" value={formData.date ?? ''} onChange={handleChange} className={headerInputClass} />
            <select name="tees" value={formData.tees ?? ''} onChange={handleChange} className={headerInputClass + " appearance-none text-center"}>
              <option value="Red">Red</option>
              <option value="White">White</option>
              <option value="Blue">Blue</option>
              <option value="Black">Black</option>
              <option value="Champ">Champ</option>
            </select>
            <select name="holes_played" value={formData.holes_played ?? 18} onChange={handleChange} className={headerInputClass + " appearance-none text-center font-bold text-emerald-600"}>
              <option value={18}>18 Holes</option>
              <option value={9}>9 Holes</option>
            </select>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-300 dark:divide-slate-700 border-b-2 border-slate-800 dark:border-slate-500 bg-slate-50 dark:bg-slate-800/50">
           <input type="text" name="club" placeholder="Club / Association (Optional)" value={formData.club ?? ''} onChange={handleChange} className={headerInputClass} />
           <input type="text" name="location" placeholder="City, State (Optional)" value={formData.location ?? ''} onChange={handleChange} className={headerInputClass} />
        </div>

        <div>
          <div className="grid grid-cols-5 divide-x divide-slate-300 dark:divide-slate-700 border-b border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800">
            {['SCORE', 'PUTTS', 'FIR', 'GIR', 'PEN'].map(label => (
              <div key={label} className="py-2 text-center text-[10px] md:text-xs font-black text-slate-500 dark:text-slate-400 tracking-widest">{label}</div>
            ))}
          </div>
          <div className="grid grid-cols-5 divide-x divide-slate-300 dark:divide-slate-700">
            {/* THE FIX: Added max="999" to all stat inputs */}
            <input type="number" min="0" max="999" name="total_score" placeholder="--" value={formData.total_score ?? ''} onChange={handleChange} onKeyDown={blockInvalidNumberChars} className={gridInputClass} />
            <input type="number" min="0" max="999" name="total_putts" placeholder="--" value={formData.total_putts ?? ''} onChange={handleChange} onKeyDown={blockInvalidNumberChars} className={gridInputClass} />
            <input type="number" min="0" max="999" name="fairways_hit" placeholder="--" value={formData.fairways_hit ?? ''} onChange={handleChange} onKeyDown={blockInvalidNumberChars} className={gridInputClass} />
            <input type="number" min="0" max="999" name="greens_in_regulation" placeholder="--" value={formData.greens_in_regulation ?? ''} onChange={handleChange} onKeyDown={blockInvalidNumberChars} className={gridInputClass} />
            <input type="number" min="0" max="999" name="penalty_strokes" placeholder="--" value={formData.penalty_strokes ?? ''} onChange={handleChange} onKeyDown={blockInvalidNumberChars} className={gridInputClass} />
          </div>
        </div>

        <div className="border-t-2 border-slate-800 dark:border-slate-500">
          <textarea 
            name="notes" 
            rows="3" 
            maxLength={2000}
            placeholder="Round notes, weather, swing thoughts..." 
            value={formData.notes ?? ''} 
            onChange={handleChange} 
            className="w-full bg-transparent p-4 outline-none text-slate-700 dark:text-slate-300 resize-none placeholder:text-slate-400 focus:bg-slate-50 dark:focus:bg-slate-800/50 transition-colors"
          ></textarea>
        </div>
      </div>

      <div className="flex gap-4">
        {onCancel && (
          <button type="button" onClick={onCancel} className="flex-1 p-4 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-lg font-bold rounded-lg transition-colors">
            Cancel
          </button>
        )}
        <button type="submit" disabled={isSubmitting} className="flex-[2] p-4 bg-emerald-600 hover:bg-emerald-700 text-white text-lg font-bold rounded-lg transition-colors disabled:opacity-50">
          {isSubmitting ? 'Saving...' : initialData ? 'Update Scorecard' : 'Save Scorecard'}
        </button>
      </div>
    </form>
  );
}
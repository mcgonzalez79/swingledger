import React, { useState } from 'react';
import { X, Trash2 } from 'lucide-react'; // Added Trash2 icon
import ScorecardForm from './ScorecardForm';

export default function EditRoundModal({ round, onClose, onUpdate, onDelete }) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (updatedData) => {
    setIsSubmitting(true);
    await onUpdate(round.id, updatedData);
    setIsSubmitting(false);
    onClose();
  };

  // NEW: Handle the delete confirmation
  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this scorecard? This cannot be undone.")) {
      setIsSubmitting(true);
      await onDelete(round.id);
      setIsSubmitting(false);
      onClose();
    }
  };

  if (!round) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-700">
        
        {/* Updated Header with Delete Button */}
        <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-800 sticky top-0 bg-white dark:bg-slate-900 z-10">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Edit Scorecard</h2>
          <div className="flex items-center gap-4">
            <button 
              onClick={handleDelete} 
              disabled={isSubmitting}
              className="flex items-center gap-1 px-3 py-1.5 text-sm font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" /> Delete
            </button>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-4 md:p-6 bg-slate-50 dark:bg-slate-950">
          <ScorecardForm 
            initialData={round} 
            onSubmit={handleSubmit} 
            onCancel={onClose} 
            isSubmitting={isSubmitting} 
          />
        </div>
      </div>
    </div>
  );
}
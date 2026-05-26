import React from 'react';
import { Flag } from 'lucide-react';

export const theme = {
  classes: {
    // Page backgrounds adapt to deep slate in dark mode
    pageContainer: 'min-h-screen bg-slate-50 dark:bg-slate-950 pb-20 md:pb-0 flex flex-col md:flex-row transition-colors duration-300',
    
    // Cards get a dark slate background and subtle borders
    card: 'bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-4 sm:p-6 w-full max-w-md mx-auto transition-colors duration-300',
    
    // Inputs invert colors
    input: 'w-full px-4 py-3 text-base rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors duration-300',
    
    label: 'block text-sm font-medium text-slate-700 dark:text-slate-400 mb-1.5',
    
    // Primary button gets a high-performance contrast and subtle glow in dark mode
    btnPrimary: 'w-full bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-400 text-white dark:text-slate-950 font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 dark:shadow-[0_0_15px_rgba(16,185,129,0.15)]',
    
    btnSecondary: 'w-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2',
  }
};

export function Logo({ className = '' }) {
  return (
    <div className={`flex items-center gap-2 text-emerald-700 dark:text-emerald-500 font-bold tracking-tight transition-colors duration-300 ${className}`}>
      <Flag className="w-6 h-6 md:w-7 md:h-7" />
      <span className="text-xl md:text-2xl">SwingLedger</span>
    </div>
  );
}
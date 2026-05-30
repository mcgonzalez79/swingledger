import React from 'react';
import { X, Target, Info, ArrowRight } from 'lucide-react';
import { getSwingDiagnosis, OPTIMAL_TARGETS } from '../utils/coachingLogic';

export default function AdviceModal({ isOpen, onClose, metrics, activeClub }) {
  if (!isOpen || !metrics || !activeClub) return null;

  const diagnosis = getSwingDiagnosis(metrics);
  const isDriver = activeClub.toLowerCase().includes('driver') || activeClub === '1W';
  const optimal = isDriver ? OPTIMAL_TARGETS.driver : OPTIMAL_TARGETS.irons;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 md:p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-slate-100">{activeClub} Swing Diagnosis</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Based on your average D-Plane delivery</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors bg-white dark:bg-slate-900 rounded-full shadow-sm">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 md:p-6 overflow-y-auto">
          
          {diagnosis ? (
            <div className="space-y-6">
              
              {/* Diagnosis Banner */}
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-xl p-4">
                  <p className="text-xs font-bold text-emerald-600 dark:text-emerald-500 uppercase tracking-wider mb-1">Typical Ball Flight</p>
                  <p className="text-xl font-black text-slate-900 dark:text-slate-100">{diagnosis.typical_shot}</p>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mt-1">Starts {diagnosis.ball_start.toLowerCase()}, curves {diagnosis.curve.toLowerCase()}</p>
                </div>
                <div className="flex-1 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Launch Tendencies</p>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{diagnosis.tendencies}</p>
                </div>
              </div>

              {/* Actionable Corrections */}
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 mb-3">
                  <Target className="w-4 h-4 text-emerald-500" /> Actionable Corrections
                </h3>
                <ul className="space-y-3">
                  {diagnosis.corrections.primary.map((tip, i) => (
                    <li key={i} className="flex items-start gap-3 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-lg p-3 shadow-sm">
                      <ArrowRight className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span className="text-sm text-slate-700 dark:text-slate-300">{tip}</span>
                    </li>
                  ))}
                  
                  {/* Club Specific Correction */}
                  <li className="flex items-start gap-3 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-lg p-3 shadow-sm">
                    <ArrowRight className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                    <span className="text-sm text-blue-900 dark:text-blue-300 font-medium">
                      <span className="font-bold uppercase mr-1">{isDriver ? 'Driver Fix:' : 'Iron Fix:'}</span> 
                      {isDriver ? diagnosis.corrections.driver[0] : diagnosis.corrections.irons[0]}
                    </span>
                  </li>
                </ul>
              </div>

              {/* Optimal Targets Guide */}
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2 mb-3">
                  <Info className="w-4 h-4" /> {isDriver ? 'Driver' : 'Iron'} Optimal Targets
                </h3>
                {/* THE FIX: Removed AoA from the Optimal Targets grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-y-2 gap-x-4 text-sm">
                  <p className="text-slate-600 dark:text-slate-400"><span className="font-bold text-slate-800 dark:text-slate-200">Path:</span> {optimal.path}</p>
                  <p className="text-slate-600 dark:text-slate-400"><span className="font-bold text-slate-800 dark:text-slate-200">Face:</span> {optimal.face}</p>
                  <p className="text-slate-600 dark:text-slate-400"><span className="font-bold text-slate-800 dark:text-slate-200">Face to Path:</span> {optimal.face_to_path}</p>
                </div>
              </div>

            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">
              We couldn't diagnose this exact swing profile. Ensure you have enough data points.
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
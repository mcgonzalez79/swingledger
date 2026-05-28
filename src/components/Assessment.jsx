import React, { useState } from 'react';
import { ClipboardCheck, Info, X } from 'lucide-react';
import { getOptimalSmash } from '../utils/benchmarksLogic';

const InfoModal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-lg border border-slate-200 dark:border-slate-800 flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 rounded-t-xl">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">{title}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 text-sm text-slate-700 dark:text-slate-300 space-y-4">
          {children}
        </div>
      </div>
    </div>
  );
};

export default function Assessment({ metrics, activeClub }) {
  const [activeModal, setActiveModal] = useState(null);

  if (!metrics || !activeClub) return null;

  const consistency = Math.round(metrics.consistency);
  let consistencyColor = 'text-red-500';
  let consistencyLabel = 'Not Reliable';
  if (consistency >= 85) {
    consistencyColor = 'text-emerald-500';
    consistencyLabel = 'Excellent';
  } else if (consistency >= 75) {
    consistencyColor = 'text-blue-500';
    consistencyLabel = 'Solid';
  } else if (consistency >= 65) {
    consistencyColor = 'text-amber-500';
    consistencyLabel = 'Inconsistent';
  }

  const optimalSmash = getOptimalSmash(activeClub);
  const actualSmash = metrics.avgSmash || optimalSmash;
  let cqScore = ((actualSmash / optimalSmash) * 100) - (metrics.avgSpinAxis / 2);
  cqScore = Math.max(0, Math.min(100, Math.round(cqScore)));

  let cqColor = 'text-red-500';
  let cqLabel = 'Poor';
  if (cqScore >= 95) {
    cqColor = 'text-purple-500';
    cqLabel = 'Tour Level';
  } else if (cqScore >= 85) {
    cqColor = 'text-blue-500';
    cqLabel = 'Solid';
  }

  let vHcp = ((100 - consistency) * 0.5) + (metrics.avgAbsOffline * 0.4);
  vHcp = Math.max(0, Math.min(36, vHcp));
  let hcpString = vHcp < 1 ? '+ ' + Math.abs(vHcp).toFixed(1) : vHcp.toFixed(1);

  const MetricCard = ({ label, value, meta, metaColor, onInfoClick }) => (
    <div className="flex flex-col items-center justify-center p-4 relative">
      {onInfoClick && (
        <button onClick={onInfoClick} className="absolute top-4 right-4 text-slate-400 hover:text-emerald-500 transition-colors">
          <Info className="w-4 h-4" />
        </button>
      )}
      <span className="font-medium text-xs md:text-sm text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 text-center">
        {label}
      </span>
      <span className="text-2xl md:text-3xl text-slate-900 dark:text-slate-100 mb-1">
        {value}
      </span>
      <span className={`text-[10px] md:text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-full bg-slate-50 dark:bg-slate-900 ${metaColor}`}>
        {meta}
      </span>
    </div>
  );

  return (
    <>
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm mb-8">
        <div className="flex items-center gap-2 p-4 md:p-6 border-b border-slate-100 dark:border-slate-700/50 bg-slate-50 dark:bg-slate-800/50">
          <ClipboardCheck className="w-5 h-5 text-purple-600 dark:text-purple-500" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Performance Assessment</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100 dark:divide-slate-700/50">
          <MetricCard 
            label="Consistency Index" 
            value={`${consistency}%`} 
            meta={consistencyLabel} 
            metaColor={consistencyColor} 
            onInfoClick={() => setActiveModal('consistency')}
          />
          <MetricCard 
            label="Contact Quality" 
            value={cqScore} 
            meta={cqLabel} 
            metaColor={cqColor} 
            onInfoClick={() => setActiveModal('contact')}
          />
          <MetricCard 
            label="Virtual Handicap" 
            value={hcpString} 
            meta="Projected Skill" 
            metaColor="text-slate-500" 
          />
        </div>
      </div>

      <InfoModal isOpen={activeModal === 'consistency'} onClose={() => setActiveModal(null)} title="Consistency Index">
        <p>This score measures the statistical variation of your carry distance for each club, then averages those scores. A higher score means less variation.</p>
        <ul className="space-y-2 mt-4 font-medium">
          <li><strong className="text-emerald-500">≥ 85%:</strong> Excellent consistency (tour-like, under stable conditions)</li>
          <li><strong className="text-blue-500">75–85%:</strong> Solid; gapping and strategy decisions are reliable</li>
          <li><strong className="text-amber-500">65–75%:</strong> Inconsistent; work on strike quality/face control before trusting averages</li>
          <li><strong className="text-red-500">&lt; 65%:</strong> Not Reliable yet; collect more shots, simplify goals, add drills</li>
        </ul>
      </InfoModal>

      <InfoModal isOpen={activeModal === 'contact'} onClose={() => setActiveModal(null)} title="Contact Quality Score">
        <p className="leading-relaxed">
          This score evaluates how efficiently you transfer energy to the golf ball. It compares your actual smash factor against the optimal target for your specific club to measure compression. Then, it applies a penalty for your spin axis—since a tilted spin axis indicates a glancing blow or an off-center strike. A perfectly compressed, dead-center strike scores a 100.
        </p>
        
        <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-2 mt-4">How to Grade Your Score</h4>
        <ul className="space-y-2 font-medium">
          <li><strong className="text-purple-500">95 to 100:</strong> Tour-level compression and dead-center contact.</li>
          <li><strong className="text-blue-500">85 to 94:</strong> Game-improvement standard. Solid contact with minor energy loss.</li>
          <li><strong className="text-red-500">Below 85:</strong> Poor contact. You are striking the ball fat, thin, or heavily off-center.</li>
        </ul>
      </InfoModal>
    </>
  );
}
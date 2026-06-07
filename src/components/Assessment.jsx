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

// --- HELPER: Dynamic Tolerance Logic ---
const getToleranceRadius = (clubName) => {
  if (!clubName) return 10; // Default
  const c = clubName.toUpperCase();
  
  // Woods & Driver (e.g., DRIVER, DR, 3W, 5W)
  if (c === 'DRIVER' || c === 'DR' || (c.includes('W') && !c.includes('WEDGE'))) {
    return 15;
  }
  // Wedges (e.g., PW, AW, SW, LW, WEDGE)
  if (c.includes('WEDGE') || c === 'PW' || c === 'AW' || c === 'GW' || c === 'SW' || c === 'LW') {
    return 5;
  }
  // Irons & Default
  return 10;
};

// --- HELPER: CI Math ---
const calculateConsistencyIndex = (shots, club) => {
  if (!shots || shots.length === 0) return 0;
  
  // Ensure we are only calculating the centroid for the currently selected club
  const clubShots = club && club !== 'All Clubs' 
    ? shots.filter(s => s.club === club) 
    : shots;

  const N = clubShots.length;
  if (N === 0) return 0;

  // 1. Find the Centroid
  const avgCarry = clubShots.reduce((sum, s) => sum + (s.carry || 0), 0) / N;
  const avgOffline = clubShots.reduce((sum, s) => sum + (s.offline || 0), 0) / N;

  // 2. Determine acceptable zone size based on club type
  const tolerance = getToleranceRadius(club);
  
  // 3. Count consistent shots
  let consistentShots = 0;
  clubShots.forEach(s => {
    const carry = s.carry || 0;
    const offline = s.offline || 0;
    
    // Pythagorean theorem for distance from centroid
    const distance = Math.sqrt(Math.pow(carry - avgCarry, 2) + Math.pow(offline - avgOffline, 2));
    
    if (distance <= tolerance) {
      consistentShots++;
    }
  });

  // 4. Return CI Percentage
  return Math.round((consistentShots / N) * 100);
};

export default function Assessment({ metrics, activeClub, shots = [] }) {
  const [activeModal, setActiveModal] = useState(null);

  if (!metrics || !activeClub) return null;

  // Calculate CI
  const consistency = calculateConsistencyIndex(shots, activeClub);
  
  let consistencyColor = 'text-red-500';
  let consistencyLabel = 'Needs Range Time';
  
  if (consistency >= 90) {
    consistencyColor = 'text-emerald-500';
    consistencyLabel = 'Tour Pro';
  } else if (consistency >= 75) {
    consistencyColor = 'text-blue-500';
    consistencyLabel = 'Solid Striker';
  } else if (consistency >= 50) {
    consistencyColor = 'text-amber-500';
    consistencyLabel = 'Developing';
  }

  // Calculate Contact Quality
  const optimalSmash = getOptimalSmash(activeClub);
  const actualSmash = metrics.avgSmash || optimalSmash;
  let cqScore = ((actualSmash / optimalSmash) * 100) - ((metrics.avgSpinAxis || 0) / 2);
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

  // Calculate Virtual Handicap
  let vHcp = ((100 - consistency) * 0.5) + ((metrics.avgAbsOffline || 0) * 0.4);
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
            onInfoClick={() => setActiveModal('handicap')} // THE FIX: Added info click
          />
        </div>
      </div>

      <InfoModal isOpen={activeModal === 'consistency'} onClose={() => setActiveModal(null)} title="Consistency Index (CI)">
        <p>This score measures how many of your shots fall within a tightly controlled radius of your average carry and offline distances (your "Centroid").</p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 p-3 bg-slate-50 dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700">
          <strong>Tolerance Zones:</strong> Driver/Woods (15 yds), Irons (10 yds), Wedges (5 yds).
        </p>
        <ul className="space-y-2 mt-4 font-medium">
          <li><strong className="text-emerald-500">≥ 90%:</strong> Tour Pro (Elite grouping)</li>
          <li><strong className="text-blue-500">75–89%:</strong> Solid Striker (Reliable patterns)</li>
          <li><strong className="text-amber-500">50–74%:</strong> Developing (Room for improvement)</li>
          <li><strong className="text-red-500">&lt; 50%:</strong> Needs Range Time (High shot dispersion)</li>
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

      {/* THE FIX: Added new InfoModal for Virtual Handicap */}
      <InfoModal isOpen={activeModal === 'handicap'} onClose={() => setActiveModal(null)} title="Virtual Handicap">
        <p className="leading-relaxed">
          Your Virtual Handicap is an estimated skill level based <em>purely</em> on your ball striking with this specific club. 
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 p-3 bg-slate-50 dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700">
          <strong>The Formula:</strong> It combines your lack of consistency (weighted at 50%) and adds a penalty for your average lateral/offline dispersion (weighted at 40%).
        </p>

        <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-2 mt-4">Handicap Scale</h4>
        <ul className="space-y-2 font-medium">
          <li><strong className="text-emerald-500">+ (Plus) to 5:</strong> Elite ball striking. You own this club.</li>
          <li><strong className="text-blue-500">6 to 15:</strong> Mid-handicap striking. Reliable, but with occasional noticeable dispersion.</li>
          <li><strong className="text-red-500">16 to 36:</strong> High-handicap striking. High distance variation and wide lateral misses.</li>
        </ul>
      </InfoModal>
    </>
  );
}
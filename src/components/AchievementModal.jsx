import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Trophy, Medal, Target } from 'lucide-react';

export default function AchievementModal({ isOpen, onClose, achievements = [], prs = [], goals = [] }) {
  const navigate = useNavigate();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setShow(true), 10);
    } else {
      setShow(false);
    }
  }, [isOpen]);

  const hasTrophies = achievements?.length > 0;
  const hasPrs = prs?.length > 0;
  const hasGoals = goals?.length > 0;

  if (!isOpen || (!hasTrophies && !hasPrs && !hasGoals)) return null;

  const handleGoToTrophyRoom = () => {
    onClose();
    navigate('/achievements');
  };

  return (
    <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-500 ${show ? 'bg-slate-900/60 backdrop-blur-sm opacity-100' : 'bg-transparent opacity-0 pointer-events-none'}`}>
      <div className={`bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-amber-500/30 shadow-[0_0_40px_rgba(245,158,11,0.2)] w-full max-w-sm overflow-hidden flex flex-col transform transition-all duration-500 ${show ? 'scale-100 translate-y-0' : 'scale-95 translate-y-8'}`}>
        
        <div className="relative p-6 text-center overflow-hidden">
          <div className="absolute inset-0 bg-amber-500/20 blur-2xl"></div>
          <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white z-10"><X className="w-5 h-5" /></button>
          <Trophy className="w-16 h-16 text-amber-400 mx-auto mb-3 drop-shadow-[0_0_15px_rgba(251,191,36,0.5)] relative z-10" />
          <h2 className="text-xl font-black text-white tracking-tight relative z-10 uppercase">New Achievement!</h2>
        </div>

        <div className="p-6 pt-0 space-y-4 max-h-[50vh] overflow-y-auto">
          {hasPrs && prs.map((pr, idx) => (
            <div key={`pr-${idx}`} className="bg-blue-900/30 border border-blue-500/30 rounded-xl p-4 flex items-start gap-4">
              <div className="p-3 bg-blue-500/20 rounded-lg text-blue-400 shrink-0"><Medal className="w-6 h-6" /></div>
              <div>
                <h3 className="text-white font-bold mb-1">New PR: {pr.club}</h3>
                <p className="text-sm text-slate-300 leading-snug">Boom! <span className="font-bold text-blue-400">{Math.round(pr.carry)} yards</span> carry.</p>
              </div>
            </div>
          ))}

          {hasGoals && goals.map((goal, idx) => (
            <div key={`goal-${idx}`} className="bg-emerald-900/30 border border-emerald-500/30 rounded-xl p-4 flex items-start gap-4">
              <div className="p-3 bg-emerald-500/20 rounded-lg text-emerald-400 shrink-0"><Target className="w-6 h-6" /></div>
              <div>
                <h3 className="text-white font-bold mb-1">Goal Achieved!</h3>
                <p className="text-sm text-slate-300 leading-snug">Hit <span className="font-bold text-emerald-400">{goal.title}</span>.</p>
              </div>
            </div>
          ))}

          {hasTrophies && achievements.map((ach) => {
            const Icon = ach.icon; // This variable now holds the component
            return (
              <div key={ach.id} className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 flex items-start gap-4">
                <div className="p-3 bg-amber-500/10 rounded-lg text-amber-400 shrink-0">
                  <Icon className="w-6 h-6" /> {/* Rendered as a component here */}
                </div>
                <div>
                  <h3 className="text-white font-bold mb-1">{ach.name}</h3>
                  <p className="text-sm text-slate-400 leading-snug">{ach.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-4 border-t border-slate-700/50 flex gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-2 text-sm font-bold text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors">Dismiss</button>
          <button onClick={handleGoToTrophyRoom} className="flex-1 px-4 py-2 text-sm font-bold text-slate-900 bg-amber-400 hover:bg-amber-500 rounded-lg shadow-[0_0_15px_rgba(251,191,36,0.4)] transition-all">View Trophies</button>
        </div>
      </div>
    </div>
  );
}
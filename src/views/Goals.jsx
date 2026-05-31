import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { Target, PlusCircle, Edit, Trash2, X, TrendingUp, AlertCircle } from 'lucide-react';

const GOAL_TYPES = [
  // Shot / Simulator Metrics
  { value: 'carry', label: 'Sim: Carry Distance', source: 'shots', isLowerBetter: false },
  { value: 'total', label: 'Sim: Total Distance', source: 'shots', isLowerBetter: false },
  { value: 'club_speed', label: 'Sim: Club Speed', source: 'shots', isLowerBetter: false },
  { value: 'ball_speed', label: 'Sim: Ball Speed', source: 'shots', isLowerBetter: false },
  { value: 'smash_factor', label: 'Sim: Smash Factor', source: 'shots', isLowerBetter: false },
  { value: 'backspin', label: 'Sim: Backspin', source: 'shots', isLowerBetter: false },
  { value: 'apex', label: 'Sim: Apex Height', source: 'shots', isLowerBetter: false },
  { value: 'offline', label: 'Sim: Carry Deviation / Offline', source: 'shots', isLowerBetter: true },
  
  // Scorecard / Round Metrics
  { value: 'total_score', label: 'Course: Total Score', source: 'rounds', isLowerBetter: true },
  { value: 'total_putts', label: 'Course: Total Putts', source: 'rounds', isLowerBetter: true },
  { value: 'penalty_strokes', label: 'Course: Penalty Strokes', source: 'rounds', isLowerBetter: true },
  { value: 'fairways_hit', label: 'Course: Fairways Hit (FIR)', source: 'rounds', isLowerBetter: false },
  { value: 'greens_in_regulation', label: 'Course: Greens in Reg (GIR)', source: 'rounds', isLowerBetter: false },
];

const getClubSortWeight = (clubName) => {
  if (clubName === 'All Clubs' || clubName === 'N/A') return 0;
  if (clubName === '18 Holes' || clubName === '9 Holes') return 1;
  
  const c = clubName.toUpperCase();
  if (c === 'DR' || c.includes('DRIVER')) return 10;
  if (c.includes('W') && !c.includes('WEDGE') && !['PW', 'AW', 'GW', 'SW', 'LW'].includes(c)) {
    const num = parseInt(c.match(/\d+/)?.[0] || 0);
    return 20 + num;
  }
  if (c.includes('H') || c.includes('HYBRID')) {
    const num = parseInt(c.match(/\d+/)?.[0] || 0);
    return 30 + num;
  }
  if (c.includes('I') || c.includes('IRON') || /^\d+$/.test(c)) {
    const num = parseInt(c.match(/\d+/)?.[0] || 0);
    return 40 + num;
  }
  if (c === 'PW' || c.includes('PITCH')) return 50;
  if (c === 'AW' || c === 'GW' || c.includes('APPROACH') || c.includes('GAP')) return 51;
  if (c === 'SW' || c.includes('SAND')) return 52;
  if (c === 'LW' || c.includes('LOB')) return 53;
  if (c.includes('WEDGE')) return 54;
  if (c === 'PT' || c.includes('PUTT')) return 60;
  
  return 100;
};

export default function Goals() {
  const [goals, setGoals] = useState([]);
  const [shots, setShots] = useState([]);
  const [rounds, setRounds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);

  // Form State
  const [title, setTitle] = useState('');
  const [goalType, setGoalType] = useState('carry');
  const [metricType, setMetricType] = useState('average');
  const [club, setClub] = useState('All Clubs');
  const [targetValue, setTargetValue] = useState('');

  const uniqueClubs = ['All Clubs', ...new Set(shots.map(s => s.club).filter(Boolean))]
    .sort((a, b) => getClubSortWeight(a) - getClubSortWeight(b));

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const [goalsData, shotsData, roundsData] = await Promise.all([
      supabase.from('goals').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      supabase.from('shots').select('*').eq('user_id', user.id),
      supabase.from('rounds').select('*').eq('user_id', user.id)
    ]);

    if (goalsData.data) setGoals(goalsData.data);
    if (shotsData.data) setShots(shotsData.data);
    if (roundsData.data) setRounds(roundsData.data);
    
    setLoading(false);
  };

  const calculateCurrentValue = (goal) => {
    const goalDef = GOAL_TYPES.find(g => g.value === goal.goal_type);
    if (!goalDef) return 0;

    let values = [];

    // Calculate from Simulator Shots
    if (goalDef.source === 'shots') {
      let relevantShots = shots.filter(s => s[goal.goal_type] !== null && s[goal.goal_type] !== undefined);
      if (goal.club && goal.club !== 'All Clubs' && goal.club !== 'N/A') {
        relevantShots = relevantShots.filter(s => s.club === goal.club);
      }
      values = relevantShots.map(s => goal.goal_type === 'offline' ? Math.abs(s.offline) : s[goal.goal_type]);
    } 
    // Calculate from Scorecard Rounds
    else {
      let relevantRounds = rounds.filter(r => r[goal.goal_type] !== null && r[goal.goal_type] !== undefined);
      
      // Target specific hole counts based on what was selected in the form
      const targetHoles = goal.club === '9 Holes' ? 9 : 18; // Default to 18 for older goals
      relevantRounds = relevantRounds.filter(r => r.holes_played === targetHoles);
      
      values = relevantRounds.map(r => r[goal.goal_type]);
    }

    if (values.length === 0) return 0;

    if (goal.metric_type === 'maximum') {
      return Math.max(...values);
    } else if (goal.metric_type === 'minimum') {
      return Math.min(...values);
    } else {
      // Average
      const sum = values.reduce((a, b) => a + b, 0);
      return sum / values.length;
    }
  };

  const calculateProgress = (current, target, goalType) => {
    if (current === 0 && goalType !== 'penalty_strokes') return 0;
    
    const goalDef = GOAL_TYPES.find(g => g.value === goalType);
    const isLowerBetter = goalDef?.isLowerBetter || false;

    if (isLowerBetter) {
      if (current <= target) return 100;
      const progress = target === 0 ? (current === 0 ? 100 : 0) : (target / current) * 100;
      return Math.min(100, Math.max(0, progress));
    }

    if (current >= target) return 100;
    return Math.min(100, Math.max(0, (current / target) * 100));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Use the club string which now either holds the Club Name OR "18 Holes" / "9 Holes"
    const goalData = {
      user_id: user.id,
      title,
      goal_type: goalType,
      metric_type: metricType,
      club: club,
      target_value: Number(targetValue)
    };

    if (editingGoal) {
      await supabase.from('goals').update({ ...goalData, is_completed: false }).eq('id', editingGoal.id);
    } else {
      await supabase.from('goals').insert([goalData]);
    }

    closeModal();
    fetchData();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this goal?")) return;
    await supabase.from('goals').delete().eq('id', id);
    fetchData();
  };

  const openModal = (goal = null) => {
    if (goal) {
      const def = GOAL_TYPES.find(g => g.value === goal.goal_type);
      setEditingGoal(goal);
      setTitle(goal.title);
      setGoalType(goal.goal_type);
      setMetricType(goal.metric_type);
      // Ensure older 'N/A' round goals get converted to '18 Holes' in the editor
      if (def?.source === 'rounds' && (!goal.club || goal.club === 'N/A' || goal.club === 'All Clubs')) {
        setClub('18 Holes');
      } else {
        setClub(goal.club || 'All Clubs');
      }
      setTargetValue(goal.target_value.toString());
    } else {
      setEditingGoal(null);
      setTitle('');
      setGoalType('carry');
      setMetricType('average');
      setClub('All Clubs');
      setTargetValue('');
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingGoal(null);
  };

  // Helper values for the form UI
  const selectedGoalDef = GOAL_TYPES.find(g => g.value === goalType);
  const isRoundGoal = selectedGoalDef?.source === 'rounds';
  const isLowerBetter = selectedGoalDef?.isLowerBetter || false;

  if (loading) return <div className="p-8 text-emerald-600 font-medium flex items-center justify-center h-full">Loading goals...</div>;

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto w-full pb-24 md:pb-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-3">
            <Target className="w-8 h-8 text-emerald-600 dark:text-emerald-500" />
            Milestones & Goals
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Track progress on specific metrics across your bag.</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="w-full md:w-auto px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-sm shadow-sm transition-colors flex items-center justify-center gap-2"
        >
          <PlusCircle className="w-5 h-5" />
          Create Goal
        </button>
      </div>

      {goals.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
          <Target className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200 mb-1">No Goals Set</h3>
          <p className="text-slate-500 dark:text-slate-400">Set a milestone to start tracking your improvement.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
          {goals.map((goal) => {
            const current = calculateCurrentValue(goal);
            const progressPct = calculateProgress(current, goal.target_value, goal.goal_type);
            const isCompleted = progressPct >= 100;
            const def = GOAL_TYPES.find(g => g.value === goal.goal_type);
            
            // Clean up the club string for older entries if needed
            const displayClub = (def?.source === 'rounds' && (goal.club === 'N/A' || goal.club === 'All Clubs')) 
              ? '18 Holes' 
              : goal.club;

            return (
              <div key={goal.id} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 shadow-sm relative group flex flex-col">
                <div className="absolute top-4 right-4 flex gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openModal(goal)} className="p-1.5 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 bg-slate-50 dark:bg-slate-900 rounded-md">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(goal.id)} className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 bg-slate-50 dark:bg-slate-900 rounded-md">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="mb-4 pr-16">
                  <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 leading-tight">{goal.title}</h3>
                  <p className="text-xs font-semibold text-slate-500 mt-1 uppercase tracking-wider flex items-center gap-1.5">
                    {displayClub && displayClub !== 'N/A' ? `${displayClub} • ` : ''} 
                    {goal.metric_type === 'minimum' ? 'Best (Min)' : goal.metric_type === 'maximum' ? 'Best (Max)' : 'Average'}
                  </p>
                </div>

                <div className="flex-1 flex flex-col justify-end">
                  <div className="flex justify-between items-end mb-2">
                    <div>
                      <span className="block text-xs text-slate-400 uppercase tracking-wide mb-0.5">Current</span>
                      <span className="text-2xl font-bold text-slate-800 dark:text-slate-100 leading-none">
                        {current > 0 || current === 0 ? (current % 1 !== 0 ? current.toFixed(1) : current) : '--'}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="block text-xs text-slate-400 uppercase tracking-wide mb-0.5">Target</span>
                      <span className="text-xl font-bold text-emerald-600 dark:text-emerald-500 leading-none">
                        {goal.target_value}
                      </span>
                    </div>
                  </div>

                  <div className="w-full h-3 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden mb-2">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${isCompleted ? 'bg-emerald-500' : 'bg-blue-500 dark:bg-blue-600'}`}
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                  
                  {isCompleted && (
                    <p className="text-xs font-bold text-emerald-600 dark:text-emerald-500 text-center flex items-center justify-center gap-1">
                      <TrendingUp className="w-3 h-3" /> Goal Achieved!
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 dark:border-slate-800">
            <div className="flex justify-between items-center p-4 md:p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">{editingGoal ? 'Edit Goal' : 'Create New Goal'}</h2>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-2 bg-white dark:bg-slate-800 rounded-full shadow-sm border border-slate-200 dark:border-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Goal Title</label>
                <input 
                  type="text" 
                  required
                  placeholder={isRoundGoal ? "e.g. Break 80" : "e.g. Break 160mph Ball Speed"}
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:border-emerald-500 outline-none text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Metric</label>
                  <select 
                    value={goalType} 
                    onChange={(e) => {
                      const newType = e.target.value;
                      setGoalType(newType);
                      const def = GOAL_TYPES.find(g => g.value === newType);
                      
                      // Auto-switch metric types
                      if (def.isLowerBetter && metricType === 'maximum') {
                        setMetricType('minimum');
                      } else if (!def.isLowerBetter && metricType === 'minimum') {
                        setMetricType('maximum');
                      }

                      // Auto-switch Club vs Round Type
                      if (def.source === 'rounds') {
                         if (club !== '18 Holes' && club !== '9 Holes') setClub('18 Holes');
                      } else {
                         if (club === '18 Holes' || club === '9 Holes') setClub('All Clubs');
                      }
                    }}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:border-emerald-500 outline-none text-slate-900 dark:text-slate-100"
                  >
                    {GOAL_TYPES.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Goal Type</label>
                  <select 
                    value={metricType} 
                    onChange={(e) => setMetricType(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:border-emerald-500 outline-none text-slate-900 dark:text-slate-100"
                  >
                    {isLowerBetter ? (
                      <option value="minimum">Achieve Minimum (Best)</option>
                    ) : (
                      <option value="maximum">Achieve Maximum (Best)</option>
                    )}
                    <option value="average">Improve Average</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 md:col-span-1">
                  {/* Dynamic Label depending on Goal Type */}
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    {isRoundGoal ? 'Round Type' : 'Club'}
                  </label>
                  <select 
                    value={club} 
                    onChange={(e) => setClub(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:border-emerald-500 outline-none text-slate-900 dark:text-slate-100"
                  >
                    {isRoundGoal ? (
                      <>
                        <option value="18 Holes">18 Holes</option>
                        <option value="9 Holes">9 Holes</option>
                      </>
                    ) : (
                      uniqueClubs.map(c => <option key={c} value={c}>{c}</option>)
                    )}
                  </select>
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Target Value</label>
                  <input 
                    type="number" 
                    required
                    step="any"
                    placeholder={isRoundGoal ? (club === '9 Holes' ? "e.g. 39" : "e.g. 79") : "e.g. 160"}
                    value={targetValue} 
                    onChange={(e) => setTargetValue(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-bold text-emerald-600 dark:text-emerald-400 focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>

              {isLowerBetter && (
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 rounded-lg flex items-start gap-2 text-blue-700 dark:text-blue-400 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <p>For this metric, a lower number is better! The progress bar will fill up as your current numbers drop toward your target.</p>
                </div>
              )}

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={closeModal} className="flex-1 py-3 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-bold text-sm transition-colors">Cancel</button>
                <button type="submit" disabled={!title || !targetValue} className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-sm shadow-sm transition-colors disabled:opacity-50">
                  {editingGoal ? 'Update Goal' : 'Save Goal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
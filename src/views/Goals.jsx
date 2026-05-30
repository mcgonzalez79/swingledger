import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { Target, PlusCircle, Edit, Trash2, X, TrendingUp, AlertCircle } from 'lucide-react';

const GOAL_TYPES = [
  { value: 'carry', label: 'Carry Distance' },
  { value: 'total', label: 'Total Distance' },
  { value: 'club_speed', label: 'Club Speed' },
  { value: 'ball_speed', label: 'Ball Speed' },
  { value: 'smash_factor', label: 'Smash Factor' },
  { value: 'backspin', label: 'Backspin' },
  { value: 'apex', label: 'Apex Height' },
  { value: 'offline', label: 'Carry Deviation / Offline' },
];

// Smart sorting algorithm to order clubs from lowest to highest loft
const getClubSortWeight = (clubName) => {
  if (clubName === 'All Clubs') return 0; // Always keep "All Clubs" at the very top
  
  const c = clubName.toUpperCase();
  
  // Driver
  if (c === 'DR' || c.includes('DRIVER')) return 10;
  
  // Woods (e.g., 3W, 5 WOOD)
  if (c.includes('W') && !c.includes('WEDGE') && !['PW', 'AW', 'GW', 'SW', 'LW'].includes(c)) {
    const num = parseInt(c.match(/\d+/)?.[0] || 0);
    return 20 + num;
  }
  
  // Hybrids (e.g., 3H, 4 HYBRID)
  if (c.includes('H') || c.includes('HYBRID')) {
    const num = parseInt(c.match(/\d+/)?.[0] || 0);
    return 30 + num;
  }
  
  // Irons (e.g., 4I, 5 IRON, or just "5")
  if (c.includes('I') || c.includes('IRON') || /^\d+$/.test(c)) {
    const num = parseInt(c.match(/\d+/)?.[0] || 0);
    return 40 + num;
  }
  
  // Wedges
  if (c === 'PW' || c.includes('PITCH')) return 50;
  if (c === 'AW' || c === 'GW' || c.includes('APPROACH') || c.includes('GAP')) return 51;
  if (c === 'SW' || c.includes('SAND')) return 52;
  if (c === 'LW' || c.includes('LOB')) return 53;
  if (c.includes('WEDGE')) return 54; // Catch-all for custom wedges
  
  // Putter
  if (c === 'PT' || c.includes('PUTT')) return 60;
  
  // Unknown clubs drop to the bottom
  return 100;
};

export default function Goals() {
  const [goals, setGoals] = useState([]);
  const [shots, setShots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);

  // Form State
  const [title, setTitle] = useState('');
  const [goalType, setGoalType] = useState('carry');
  const [metricType, setMetricType] = useState('average');
  const [club, setClub] = useState('All Clubs');
  const [targetValue, setTargetValue] = useState('');

  // Apply the sort logic to the unique clubs extracted from the database
  const uniqueClubs = ['All Clubs', ...new Set(shots.map(s => s.club).filter(Boolean))]
    .sort((a, b) => getClubSortWeight(a) - getClubSortWeight(b));

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const [goalsData, shotsData] = await Promise.all([
      supabase.from('goals').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      supabase.from('shots').select('*').eq('user_id', user.id)
    ]);

    if (goalsData.data) setGoals(goalsData.data);
    if (shotsData.data) setShots(shotsData.data);
    setLoading(false);
  };

  const calculateCurrentValue = (goal) => {
    let relevantShots = shots.filter(s => s[goal.goal_type] !== null && s[goal.goal_type] !== undefined);
    
    if (goal.club !== 'All Clubs') {
      relevantShots = relevantShots.filter(s => s.club === goal.club);
    }

    if (relevantShots.length === 0) return 0;

    let values = relevantShots.map(s => {
      if (goal.goal_type === 'offline') return Math.abs(s.offline);
      return s[goal.goal_type];
    });

    if (goal.metric_type === 'maximum') {
      return Math.max(...values);
    } else {
      const sum = values.reduce((a, b) => a + b, 0);
      return sum / values.length;
    }
  };

  const calculateProgress = (current, target, goalType) => {
    if (current === 0) return 0;
    
    if (goalType === 'offline') {
      if (current <= target) return 100;
      const progress = (target / current) * 100;
      return Math.min(100, Math.max(0, progress));
    }

    if (current >= target) return 100;
    return Math.min(100, Math.max(0, (current / target) * 100));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const goalData = {
      user_id: user.id,
      title,
      goal_type: goalType,
      metric_type: metricType,
      club,
      target_value: Number(targetValue)
    };

    if (editingGoal) {
      // Set is_completed to false in case the edited goal is now harder
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
      setEditingGoal(goal);
      setTitle(goal.title);
      setGoalType(goal.goal_type);
      setMetricType(goal.metric_type);
      setClub(goal.club);
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
            const isCompleted = goal.goal_type === 'offline' ? current <= goal.target_value && current > 0 : current >= goal.target_value;

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
                    {goal.club} • {goal.metric_type}
                  </p>
                </div>

                <div className="flex-1 flex flex-col justify-end">
                  <div className="flex justify-between items-end mb-2">
                    <div>
                      <span className="block text-xs text-slate-400 uppercase tracking-wide mb-0.5">Current</span>
                      <span className="text-2xl font-bold text-slate-800 dark:text-slate-100 leading-none">
                        {current > 0 ? (current % 1 !== 0 ? current.toFixed(1) : current) : '--'}
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
                  placeholder="e.g. Break 160mph Ball Speed"
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:border-emerald-500 outline-none text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Metric</label>
                  <select 
                    value={goalType} 
                    onChange={(e) => setGoalType(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:border-emerald-500 outline-none text-slate-900 dark:text-slate-100"
                  >
                    {GOAL_TYPES.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Goal Type</label>
                  <select 
                    value={metricType} 
                    onChange={(e) => setMetricType(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:border-emerald-500 outline-none text-slate-900 dark:text-slate-100"
                  >
                    <option value="maximum">Achieve Maximum</option>
                    <option value="average">Improve Average</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Club</label>
                  <select 
                    value={club} 
                    onChange={(e) => setClub(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:border-emerald-500 outline-none text-slate-900 dark:text-slate-100"
                  >
                    {uniqueClubs.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Target Value</label>
                  <input 
                    type="number" 
                    required
                    step="any"
                    placeholder="e.g. 160"
                    value={targetValue} 
                    onChange={(e) => setTargetValue(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-bold text-emerald-600 dark:text-emerald-400 focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>

              {goalType === 'offline' && (
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 rounded-lg flex items-start gap-2 text-blue-700 dark:text-blue-400 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <p>For offline/deviation goals, enter a positive number. The app will measure how close your average or max mistake stays to absolute zero.</p>
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
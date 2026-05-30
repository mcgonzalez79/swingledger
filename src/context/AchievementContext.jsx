import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { evaluateAchievements } from '../utils/achievementEngine';
import AchievementModal from '../components/AchievementModal';

const AchievementContext = createContext();

export const useAchievements = () => useContext(AchievementContext);

export const AchievementProvider = ({ children }) => {
  const [unlockedIds, setUnlockedIds] = useState([]);
  const [clubPrs, setClubPrs] = useState({}); 
  const [activeGoals, setActiveGoals] = useState([]);
  
  const [newUnlocks, setNewUnlocks] = useState([]);
  const [newPrsList, setNewPrsList] = useState([]);
  const [newGoalsList, setNewGoalsList] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: achData } = await supabase.from('user_achievements').select('achievement_id').eq('user_id', user.id);
      if (achData) setUnlockedIds(achData.map(a => a.achievement_id));

      const { data: prData } = await supabase.from('club_prs').select('*').eq('user_id', user.id);
      if (prData) {
        const prMap = {};
        prData.forEach(pr => {
          prMap[pr.club.toUpperCase().trim()] = { max_carry: pr.max_carry, achieved_at: pr.achieved_at };
        });
        setClubPrs(prMap);
      }

      const { data: goalData, error: goalErr } = await supabase.from('goals').select('*').eq('user_id', user.id).eq('is_completed', false);
      if (goalErr) console.error("Initial Goal Fetch Error (Did you add the is_completed column?):", goalErr);
      if (goalData) setActiveGoals(goalData);
    };
    fetchData();
  }, []);

  const triggerEvaluation = async (latestShots = [], latestRounds = []) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      let modalTriggered = false;

      const { count: totalShots } = await supabase.from('shots').select('id', { count: 'exact', head: true }).eq('user_id', user.id);
      const globalStats = { totalShots: totalShots || latestShots.length };

      const { newlyEarned, newlyEarnedPrs } = evaluateAchievements(latestShots, latestRounds, unlockedIds, globalStats, clubPrs);

      setNewUnlocks(newlyEarned);
      setNewPrsList(newlyEarnedPrs);

      if (newlyEarned.length > 0) {
        const payload = newlyEarned.map(ach => ({ user_id: user.id, achievement_id: ach.id }));
        await supabase.from('user_achievements').insert(payload);
        setUnlockedIds(prev => [...prev, ...newlyEarned.map(a => a.id)]);
        modalTriggered = true;
      }

      if (newlyEarnedPrs.length > 0) {
        const prPayload = newlyEarnedPrs.map(pr => ({
          user_id: user.id, club: pr.club.toUpperCase().trim(), max_carry: pr.carry, achieved_at: pr.date
        }));
        await supabase.from('club_prs').upsert(prPayload, { onConflict: 'user_id, club' });
        setClubPrs(prev => {
          const next = { ...prev };
          newlyEarnedPrs.forEach(pr => { next[pr.club.toUpperCase().trim()] = { max_carry: pr.carry, achieved_at: pr.date }; });
          return next;
        });
        modalTriggered = true;
      }

      // --- EVALUATE GOALS ---
      console.log("Checking Goals...");
      const { data: currentGoals, error: currentGoalErr } = await supabase.from('goals').select('*').eq('user_id', user.id).eq('is_completed', false);
      
      if (currentGoalErr) {
        console.error("FAILED TO FETCH GOALS! Make sure the 'is_completed' column exists in Supabase:", currentGoalErr);
      }

      let completedGoals = [];
      if (currentGoals && currentGoals.length > 0 && latestShots.length > 0) {
        console.log(`Found ${currentGoals.length} active goals. Evaluating against historical shots...`);
        
        const { data: allShots } = await supabase.from('shots').select('*').eq('user_id', user.id);
        
        if (allShots) {
          completedGoals = currentGoals.filter(goal => {
            let relevantShots = allShots.filter(s => s[goal.goal_type] !== null && s[goal.goal_type] !== undefined);
            if (goal.club !== 'All Clubs') relevantShots = relevantShots.filter(s => s.club === goal.club);
            
            if (relevantShots.length === 0) return false;
            
            let values = relevantShots.map(s => goal.goal_type === 'offline' ? Math.abs(s.offline) : s[goal.goal_type]);
            let current = goal.metric_type === 'maximum' ? Math.max(...values) : values.reduce((a, b) => a + b, 0) / values.length;
            
            // Force target to be a Number (Postgres sometimes returns numeric as a string)
            const target = Number(goal.target_value);

            const isHit = goal.goal_type === 'offline' ? current <= target && current > 0 : current >= target;
            
            if (isHit) console.log(`GOAL HIT! ${goal.title} | Target: ${target} | Current: ${current}`);
            
            return isHit;
          });
        }
      } else {
        console.log("No active goals found or no shots to evaluate.");
      }

      if (completedGoals.length > 0) {
        const goalIds = completedGoals.map(g => g.id);
        await supabase.from('goals').update({ is_completed: true }).in('id', goalIds);
        setActiveGoals(prev => prev.filter(g => !goalIds.includes(g.id)));
        setNewGoalsList(completedGoals);
        modalTriggered = true;
      } else {
        setNewGoalsList([]);
      }

      if (modalTriggered) {
        setIsModalOpen(true);
      }
      
    } catch (err) {
      console.error("Critical error in triggerEvaluation:", err);
    }
  };

  return (
    <AchievementContext.Provider value={{ unlockedIds, clubPrs, triggerEvaluation }}>
      {children}
      <AchievementModal 
        key={`${newUnlocks.length}-${newPrsList.length}-${newGoalsList.length}`}
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        achievements={newUnlocks} 
        prs={newPrsList}
        goals={newGoalsList}
      />
    </AchievementContext.Provider>
  );
};
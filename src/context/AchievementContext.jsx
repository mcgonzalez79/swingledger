import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { evaluateAchievements } from '../utils/achievementEngine';
import AchievementModal from '../components/AchievementModal';

const AchievementContext = createContext();

export const useAchievements = () => useContext(AchievementContext);

export const AchievementProvider = ({ children }) => {
  const [unlockedIds, setUnlockedIds] = useState([]);
  const [clubPrs, setClubPrs] = useState({}); // Stores PRs: { "DRIVER": { max_carry: 280, achieved_at: "..." } }
  
  const [newUnlocks, setNewUnlocks] = useState([]);
  const [newPrsList, setNewPrsList] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch existing unlocked achievements and PRs on mount
  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Fetch Trophies
      const { data: achData } = await supabase
        .from('user_achievements')
        .select('achievement_id')
        .eq('user_id', user.id);

      if (achData) {
        setUnlockedIds(achData.map(a => a.achievement_id));
      }

      // 2. Fetch Personal Records
      const { data: prData } = await supabase
        .from('club_prs')
        .select('*')
        .eq('user_id', user.id);

      if (prData) {
        const prMap = {};
        prData.forEach(pr => {
          prMap[pr.club.toUpperCase().trim()] = { 
            max_carry: pr.max_carry, 
            achieved_at: pr.achieved_at 
          };
        });
        setClubPrs(prMap);
      }
    };
    fetchData();
  }, []);

  const triggerEvaluation = async (latestShots = [], latestRounds = []) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { count: totalShots } = await supabase
      .from('shots')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id);

    const globalStats = { totalShots: totalShots || latestShots.length };

    // Pass everything into the engine
    const { newlyEarned, newlyEarnedPrs } = evaluateAchievements(latestShots, latestRounds, unlockedIds, globalStats, clubPrs);
    
    let modalTriggered = false;

    // Handle New Trophies
    if (newlyEarned.length > 0) {
      const payload = newlyEarned.map(ach => ({
        user_id: user.id,
        achievement_id: ach.id
      }));
      const { error } = await supabase.from('user_achievements').insert(payload);
      if (!error) {
        setUnlockedIds(prev => [...prev, ...newlyEarned.map(a => a.id)]);
        setNewUnlocks(newlyEarned);
        modalTriggered = true;
      }
    } else {
      setNewUnlocks([]);
    }

    // Handle New Personal Records
    if (newlyEarnedPrs.length > 0) {
      // Upsert overwrites existing records for that specific club due to the UNIQUE constraint
      const prPayload = newlyEarnedPrs.map(pr => ({
        user_id: user.id,
        club: pr.club.toUpperCase().trim(),
        max_carry: pr.carry,
        achieved_at: pr.date
      }));
      
      const { error } = await supabase.from('club_prs').upsert(prPayload, { onConflict: 'user_id, club' });
      
      if (!error) {
        setClubPrs(prev => {
          const next = { ...prev };
          newlyEarnedPrs.forEach(pr => {
            next[pr.club.toUpperCase().trim()] = { max_carry: pr.carry, achieved_at: pr.date };
          });
          return next;
        });
        setNewPrsList(newlyEarnedPrs);
        modalTriggered = true;
      }
    } else {
      setNewPrsList([]);
    }

    if (modalTriggered) {
      setIsModalOpen(true);
    }
  };

  return (
    <AchievementContext.Provider value={{ unlockedIds, clubPrs, triggerEvaluation }}>
      {children}
      <AchievementModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        achievements={newUnlocks} 
        prs={newPrsList}
      />
    </AchievementContext.Provider>
  );
};
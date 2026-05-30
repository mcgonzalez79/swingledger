import { ACHIEVEMENTS } from '../config/achievements';

export const evaluateAchievements = (shots = [], rounds = [], currentUnlockedIds = [], globalStats = { totalShots: 0 }, currentPrs = {}) => {
  const newUnlocks = [];
  const newPrs = []; // Track any broken records in this batch

  const isUnlocked = (id) => currentUnlockedIds.includes(id) || newUnlocks.some(a => a.id === id);
  
  const unlock = (id) => {
    if (!isUnlocked(id)) {
      const achievement = ACHIEVEMENTS.find(a => a.id === id);
      if (achievement) newUnlocks.push(achievement);
    }
  };

  // ---------------------------------------------------------
  // 1. GLOBAL LIFETIME VOLUME
  // ---------------------------------------------------------
  const total = globalStats.totalShots || shots.length;
  if (total >= 1) unlock('first_swing');
  if (total >= 100) unlock('grind_100');
  if (total >= 1000) unlock('grind_1000');
  if (total >= 5000) unlock('grind_5000');
  if (total >= 10000) unlock('grind_10000');
  if (total >= 20000) unlock('grind_20000');
  if (total >= 50000) unlock('grind_50000');
  if (total >= 100000) unlock('grind_100000');

  // ---------------------------------------------------------
  // 2. SESSION-LEVEL EVALUATION
  // ---------------------------------------------------------
  if (shots.length >= 100) unlock('century_club');

  if (shots.length > 0) {
    const firstShotDate = new Date(shots[0].created_at || shots[0].date);
    const hour = firstShotDate.getHours();
    
    if (hour < 7) unlock('dawn_patrol');
    if (hour >= 20) unlock('night_owl');
    if (hour >= 11 && hour <= 13 && shots.length < 50) unlock('lunch_break');
    
    const isDataRich = shots.some(s => s.path !== null && s.angle_of_attack !== null && s.spin_axis !== null);
    if (isDataRich) unlock('data_scientist');

    const clubs = [...new Set(shots.map(s => s.club ? s.club.toUpperCase() : ''))].filter(Boolean);
    const hasDriver = clubs.some(c => c.includes('DRIVER') || c === '1W');
    const hasWood = clubs.some(c => c.includes('W') && !c.includes('DRIVER') && c !== '1W' && c !== 'PW' && c !== 'SW' && c !== 'AW' && c !== 'GW' && c !== 'LW');
    const hasIron = clubs.some(c => c.includes('I'));
    const hasWedge = clubs.some(c => c.includes('W') && (c === 'PW' || c === 'SW' || c === 'AW' || c === 'GW' || c === 'LW'));
    if (hasDriver && hasWood && hasIron && hasWedge) unlock('full_bag');

    if (shots.some(s => s.offline > 30) && shots.some(s => s.offline < -30)) unlock('two_way');

    const carries = shots.map(s => Number(s.carry) || 0).filter(c => c > 0);
    if (carries.length >= 10) {
      const mean = carries.reduce((a, b) => a + b, 0) / carries.length;
      const variance = carries.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / carries.length;
      const stdDev = Math.sqrt(variance);
      const consistency = Math.max(0, Math.min(100, 100 - ((stdDev / mean) * 100)));
      if (consistency >= 80) unlock('dialed_80');
      if (consistency >= 85) unlock('tour_85');
    }

    const validPaths = shots.filter(s => s.path !== null && s.path !== undefined);
    if (validPaths.length >= 10) {
      const avgPath = validPaths.reduce((a, b) => a + Number(b.path), 0) / validPaths.length;
      if (avgPath >= -1 && avgPath <= 1) unlock('on_plane');
    }
  }

  // ---------------------------------------------------------
  // 3. SHOT-BY-SHOT, SEQUENCE, & PR EVALUATION
  // ---------------------------------------------------------
  let seqFairway = 0;
  let seqDraw = 0;
  let seqFade = 0;
  let seqSniper = 0;
  let seqOpt = 0;
  let lastSniperTotal = null;

  const batchMaxCarries = {};

  shots.forEach(shot => {
    const safeNum = (val) => Number(val) || 0;
    const club = shot.club ? shot.club.toUpperCase().trim() : '';
    const isDriver = club.includes('DRIVER') || club === '1W';
    const isIron = club.includes('I');
    const isWedge = ['PW', 'AW', 'GW', 'SW', 'LW'].includes(club) || parseInt(club) >= 45;

    const ball = safeNum(shot.ball_speed);
    const clubSpd = safeNum(shot.club_speed);
    const smash = safeNum(shot.smash_factor);
    const total = safeNum(shot.total);
    const carry = safeNum(shot.carry);
    const offline = safeNum(shot.offline);
    const backspin = safeNum(shot.backspin);
    const launch = safeNum(shot.launch_angle);
    const apex = safeNum(shot.apex); 
    
    if (club && carry > 0) {
      if (!batchMaxCarries[club] || carry > batchMaxCarries[club].carry) {
        batchMaxCarries[club] = { carry, date: shot.created_at || shot.date, club: shot.club };
      }
    }

    if (clubSpd >= 100) unlock('club_100');
    if (ball >= 150) unlock('ball_150');
    if (isDriver && total >= 220) unlock('drive_220');
    if (isDriver && total >= 250) unlock('drive_250');
    if (isDriver && total >= 280) unlock('drive_280');
    if (total >= 300) unlock('bombs_300');
    if (smash >= 1.52) unlock('untouchable');
    if (backspin >= 8000) unlock('spin_8000');
    
    if (isDriver && launch > 14 && backspin > 0 && backspin < 2500) unlock('high_low');
    if (isIron && launch > 0 && launch < 15 && backspin > 4000) unlock('stinger');
    if (apex >= 150) unlock('apex_50');
    if (isWedge && launch > 45) unlock('flop_45');
    if (total > 100 && apex > 0 && apex < 15) unlock('wormburner');
    if (launch < 0) unlock('grounded'); 
    if (offline >= 40) unlock('fore_right'); 

    if (shot.ftt !== null && shot.path !== null) {
      const ftp = safeNum(shot.ftt) - safeNum(shot.path);
      if (ftp >= 8) unlock('lumberjack');
      
      if (ftp < -1) { seqDraw++; seqFade = 0; if(seqDraw >= 5) unlock('draw_5'); }
      else if (ftp > 1) { seqFade++; seqDraw = 0; if(seqFade >= 5) unlock('fade_5'); }
      else { seqDraw = 0; seqFade = 0; }
    }

    if (Math.abs(offline) <= 10) {
      seqFairway++;
      if (seqFairway >= 5) unlock('fairway_finder');
    } else {
      seqFairway = 0;
    }

    if (lastSniperTotal !== null && Math.abs(total - lastSniperTotal) <= 3) {
      seqSniper++;
      if (seqSniper >= 3) unlock('sniper_3');
      if (seqSniper >= 5) unlock('sniper_5');
    } else {
      seqSniper = 1; 
    }
    lastSniperTotal = total;

    if (isDriver && smash >= 1.48) {
      seqOpt++;
      if (seqOpt >= 5) unlock('opt_5');
      if (seqOpt >= 10) unlock('opt_10');
    } else if (isDriver) {
      seqOpt = 0;
    }
  });

  Object.keys(batchMaxCarries).forEach(c => {
    const batchBest = batchMaxCarries[c];
    const historicalBest = currentPrs[c]?.max_carry || 0;
    
    if (batchBest.carry > historicalBest) {
      newPrs.push(batchBest);
    }
  });

  // ---------------------------------------------------------
  // 4. ROUND EVALUATION (Scoring)
  // ---------------------------------------------------------
  if (rounds.length > 0) {
    unlock('first_card');
    rounds.forEach(round => {
      const score = Number(round.total_score) || 999;
      
      // THE FIX: Aggressively hunt for the 9/18 hole indicator in the database object
      const holesRaw = round.holes || round.format || round.holes_played || round.round_type;
      let holes = 18; // Default assumption

      if (holesRaw) {
        // If the database says "9 Holes", extract just the number 9
        const match = String(holesRaw).match(/(\d+)/);
        if (match) {
          holes = parseInt(match[0], 10);
        }
      } else {
        // Absolute last resort fallback: Guess based on score thresholds
        holes = score < 65 ? 9 : 18;
      }

      // 18-Hole Achievements (Requires score > 50 to prevent 9-hole scores from leaking in)
      if (holes === 18 && score > 50) {
        if (score < 100) unlock('break_100'); 
        if (score < 90) unlock('break_90'); 
        if (score < 80) unlock('break_80'); 
      } 
      // 9-Hole Achievements
      else if (holes === 9) {
        if (score < 50 && score > 20) unlock('break_50_9');
        if (score < 45 && score > 20) unlock('break_45_9');
        if (score < 40 && score > 20) unlock('break_40_9');
      }
    });
  }

  return { newlyEarned: newUnlocks, newlyEarnedPrs: newPrs };
};
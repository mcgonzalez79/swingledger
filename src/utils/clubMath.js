export const analyzeClub = (shots, selectedClub) => {
  if (!shots || shots.length === 0 || !selectedClub) return null;

  const clubShots = shots.filter(s => s.club === selectedClub);
  if (clubShots.length === 0) return null;

  const safeNum = (val) => (val === null || val === undefined || isNaN(Number(val)) ? 0 : Number(val));

  // 1. Personal Records (PRs)
  const prs = {
    maxCarry: Math.max(...clubShots.map(s => safeNum(s.carry))),
    maxTotal: Math.max(...clubShots.map(s => safeNum(s.total))),
    maxBallSpeed: Math.max(...clubShots.map(s => safeNum(s.ball_speed))),
    maxClubSpeed: Math.max(...clubShots.map(s => safeNum(s.club_speed)))
  };

  // 2. Swing Metrics (Averages)
  const validPathShots = clubShots.filter(s => s.path !== null && s.path !== '');
  const validFaceShots = clubShots.filter(s => s.ftt !== null && s.ftt !== '');
  const validAoaShots = clubShots.filter(s => s.angle_of_attack !== null && s.angle_of_attack !== '');
  
  const validTotalShots = clubShots.filter(s => s.total !== null && s.total > 0);
  const validSmashShots = clubShots.filter(s => s.smash_factor !== null && s.smash_factor > 0);
  const validSpinAxisShots = clubShots.filter(s => s.spin_axis !== null && s.spin_axis !== undefined && s.spin_axis !== '');

  const avgPath = validPathShots.length ? validPathShots.reduce((acc, s) => acc + safeNum(s.path), 0) / validPathShots.length : 0;
  const avgFtt = validFaceShots.length ? validFaceShots.reduce((acc, s) => acc + safeNum(s.ftt), 0) / validFaceShots.length : 0;
  const avgAoa = validAoaShots.length ? validAoaShots.reduce((acc, s) => acc + safeNum(s.angle_of_attack), 0) / validAoaShots.length : 0;
  
  const avgTotal = validTotalShots.length ? validTotalShots.reduce((acc, s) => acc + safeNum(s.total), 0) / validTotalShots.length : 0;
  const avgSmash = validSmashShots.length ? validSmashShots.reduce((acc, s) => acc + safeNum(s.smash_factor), 0) / validSmashShots.length : 0;
  const avgSpinAxis = validSpinAxisShots.length ? validSpinAxisShots.reduce((acc, s) => acc + Math.abs(safeNum(s.spin_axis)), 0) / validSpinAxisShots.length : 0;

  const avgFtP = avgFtt - avgPath;
  
  // Calculate Absolute Offline for Handicap
  const avgAbsOffline = clubShots.length ? clubShots.reduce((acc, s) => acc + Math.abs(safeNum(s.offline)), 0) / clubShots.length : 0;

  // Calculate Club-Specific Consistency Index
  const carries = clubShots.map(s => safeNum(s.carry)).filter(c => c > 0);
  let consistency = 0;
  if (carries.length >= 4) {
    const mean = carries.reduce((a, b) => a + b, 0) / carries.length;
    const variance = carries.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / carries.length;
    const stdDev = Math.sqrt(variance);
    consistency = Math.max(0, Math.min(100, 100 - ((stdDev / mean) * 100)));
  } else if (carries.length > 0) {
    consistency = 50; // Default if not enough shots
  }

  // 3. Trend Data (Grouped by date)
  const sessionMap = {};
  clubShots.forEach(s => {
    const dateStr = new Date(s.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    if (!sessionMap[dateStr]) {
      sessionMap[dateStr] = { carry: [], offline: [], rawDate: s.created_at };
    }
    sessionMap[dateStr].carry.push(safeNum(s.carry));
    sessionMap[dateStr].offline.push(safeNum(s.offline));
  });

  const trends = Object.keys(sessionMap)
    .map(date => ({
      date,
      rawDate: sessionMap[date].rawDate,
      avgCarry: Math.round(sessionMap[date].carry.reduce((a, b) => a + b, 0) / sessionMap[date].carry.length),
      avgOffline: Math.round((sessionMap[date].offline.reduce((a, b) => a + b, 0) / sessionMap[date].offline.length) * 10) / 10
    }))
    .sort((a, b) => new Date(a.rawDate) - new Date(b.rawDate)); 

  return { 
    prs, 
    metrics: { avgPath, avgFtt, avgFtP, avgAoa, avgTotal, avgSmash, avgSpinAxis, avgAbsOffline, consistency }, 
    trends, 
    shotCount: clubShots.length 
  };
};

export const getOverallHighlights = (shots) => {
  if (!shots || shots.length === 0) return null;

  let prCarry = { distance: 0, club: '', date: '' };
  let prTotal = { distance: 0, club: '', date: '' };

  const clubGroups = {};

  shots.forEach(shot => {
    const carry = Number(shot.carry) || 0;
    if (carry > prCarry.distance) {
      prCarry = { distance: carry, club: shot.club, date: shot.created_at };
    }

    const total = Number(shot.total) || carry; 
    if (total > prTotal.distance) {
      prTotal = { distance: total, club: shot.club, date: shot.created_at };
    }

    if (shot.club && carry > 0) {
      if (!clubGroups[shot.club]) clubGroups[shot.club] = [];
      clubGroups[shot.club].push(carry);
    }
  });

  let mostConsistent = { club: '', score: 0, label: '', color: '' };

  Object.entries(clubGroups).forEach(([club, distances]) => {
    if (distances.length >= 4) {
      const n = distances.length;
      const mean = distances.reduce((a, b) => a + b, 0) / n;
      const variance = distances.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / n;
      const stdDev = Math.sqrt(variance);

      let score = 100 - ((stdDev / mean) * 100);
      score = Math.max(0, Math.min(100, score));

      if (score > mostConsistent.score) {
        mostConsistent.club = club;
        mostConsistent.score = score;
      }
    }
  });

  if (mostConsistent.score > 0) {
    const s = mostConsistent.score;
    if (s >= 85) {
      mostConsistent.label = 'Excellent';
      mostConsistent.color = 'text-emerald-500';
    } else if (s >= 75) {
      mostConsistent.label = 'Solid';
      mostConsistent.color = 'text-blue-500';
    } else if (s >= 65) {
      mostConsistent.label = 'Inconsistent';
      mostConsistent.color = 'text-orange-500';
    } else {
      mostConsistent.label = 'Not Reliable';
      mostConsistent.color = 'text-red-500';
    }
  }

  return {
    prCarry,
    prTotal,
    mostConsistent: mostConsistent.club ? mostConsistent : null
  };
};
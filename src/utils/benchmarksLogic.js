export const DISTANCE_CHART = [
  { club: 'Driver', beginner: 180, average: 220, good: 250, advanced: 280, pga: 296 },
  { club: '3-wood', beginner: 170, average: 210, good: 225, advanced: 235, pga: 262 },
  { club: '5-wood', beginner: 150, average: 195, good: 205, advanced: 220, pga: 248 },
  { club: 'Hybrid', beginner: 145, average: 180, good: 190, advanced: 210, pga: 242 },
  { club: '2-iron', beginner: 100, average: 180, good: 190, advanced: 215, pga: 236 },
  { club: '3-iron', beginner: 100, average: 170, good: 180, advanced: 205, pga: 228 },
  { club: '4-iron', beginner: 100, average: 160, good: 170, advanced: 195, pga: 219 },
  { club: '5-iron', beginner: 125, average: 155, good: 165, advanced: 185, pga: 209 },
  { club: '6-iron', beginner: 120, average: 145, good: 160, advanced: 175, pga: 197 },
  { club: '7-iron', beginner: 110, average: 140, good: 150, advanced: 165, pga: 185 },
  { club: '8-iron', beginner: 100, average: 130, good: 140, advanced: 155, pga: 172 },
  { club: '9-iron', beginner: 90, average: 115, good: 125, advanced: 145, pga: 159 },
  { club: 'Pitching Wedge', beginner: 80, average: 100, good: 110, advanced: 135, pga: 146 },
  { club: 'Gap Wedge', beginner: 60, average: 90, good: 100, advanced: 125, pga: 135 },
  { club: 'Sand Wedge', beginner: 55, average: 80, good: 95, advanced: 115, pga: 124 },
  { club: 'Lob Wedge', beginner: 40, average: 60, good: 80, advanced: 105, pga: 113 },
];

const mapClubToChartName = (rawClub) => {
  const c = rawClub.toUpperCase().trim();
  if (c.includes('DRIVER') || c === '1W') return 'Driver';
  if (c === '3W') return '3-wood';
  if (c === '5W' || c === '4W' || c === '7W') return '5-wood'; // Approximation for other woods
  if (c.includes('H')) return 'Hybrid';
  if (c === '2I') return '2-iron';
  if (c === '3I') return '3-iron';
  if (c === '4I') return '4-iron';
  if (c === '5I') return '5-iron';
  if (c === '6I') return '6-iron';
  if (c === '7I') return '7-iron';
  if (c === '8I') return '8-iron';
  if (c === '9I') return '9-iron';
  if (c === 'PW') return 'Pitching Wedge';
  if (c === 'AW' || c === 'GW' || c === '50°' || c === '52°') return 'Gap Wedge';
  if (c === 'SW' || c === '54°' || c === '56°') return 'Sand Wedge';
  if (c === 'LW' || c === '58°' || c === '60°' || c === '64°') return 'Lob Wedge';
  return null;
};

export const getDistanceTier = (club, avgTotal) => {
  const chartName = mapClubToChartName(club);
  if (!chartName) return { label: 'Unrated', color: 'text-slate-500' };

  const row = DISTANCE_CHART.find(r => r.club === chartName);
  if (!row) return { label: 'Unrated', color: 'text-slate-500' };

  if (avgTotal >= row.pga) return { label: 'PGA Tour', color: 'text-purple-500' };
  if (avgTotal >= row.advanced) return { label: 'Advanced', color: 'text-emerald-500' };
  if (avgTotal >= row.good) return { label: 'Good', color: 'text-blue-500' };
  if (avgTotal >= row.average) return { label: 'Average', color: 'text-amber-500' };
  if (avgTotal >= row.beginner) return { label: 'Beginner', color: 'text-orange-500' };
  
  return { label: 'Novice', color: 'text-slate-400' };
};

export const getOptimalSmash = (club) => {
  const c = club.toUpperCase();
  if (c.includes('DRIVER') || c === '1W') return 1.50;
  if (c.includes('W')) return 1.48; // Fairway Woods
  if (c.includes('H')) return 1.45; // Hybrids
  if (['1I', '2I', '3I', '4I'].includes(c)) return 1.45; // Long Irons
  if (['5I', '6I', '7I'].includes(c)) return 1.40; // Mid Irons
  if (['8I', '9I'].includes(c)) return 1.35; // Short Irons
  if (['PW', 'AW', 'GW', 'SW', 'LW'].includes(c) || parseInt(c) >= 45) return 1.25; // Wedges
  return 1.40; // Generic fallback
};
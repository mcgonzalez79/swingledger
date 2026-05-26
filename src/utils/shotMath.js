export const processGappingData = (shots) => {
  if (!shots || shots.length === 0) return [];

  // 1. Group shots by club
  const clubGroups = shots.reduce((acc, shot) => {
    const club = shot.club?.trim().toUpperCase();
    if (!club) return acc;

    if (!acc[club]) {
      acc[club] = { totalCarry: 0, totalDistance: 0, totalOffline: 0, count: 0 };
    }

    // Only average valid numerical values
    if (shot.carry > 0) acc[club].totalCarry += shot.carry;
    if (shot.total > 0) acc[club].totalDistance += shot.total;
    if (shot.offline !== null) acc[club].totalOffline += shot.offline;
    
    acc[club].count += 1;
    return acc;
  }, {});

  // 2. Calculate averages
  const averages = Object.keys(clubGroups).map(club => {
    const data = clubGroups[club];
    return {
      club,
      carry: Math.round(data.totalCarry / data.count),
      total: Math.round(data.totalDistance / data.count),
      offline: Math.round((data.totalOffline / data.count) * 10) / 10, // Keep 1 decimal for dispersion
      shotCount: data.count
    };
  });

  // 3. Sort standard bag order (Woods -> Hybrids -> Irons -> Wedges)
  const bagOrder = [
    'DR', 'DRIVER', '1W', 
    '3W', '5W', '7W', 
    '3H', '4H', '5H', 
    '3I', '4I', '5I', '6I', '7I', '8I', '9I', 
    'PW', 'AW', 'GW', 'SW', 'LW',
    '46', '48', '50', '52', '54', '56', '58', '60', '62' // Degree wedges
  ];

  return averages.sort((a, b) => {
    let indexA = bagOrder.indexOf(a.club);
    let indexB = bagOrder.indexOf(b.club);
    
    // If a club isn't in our standard list, push it to the end
    if (indexA === -1) indexA = 999;
    if (indexB === -1) indexB = 999;
    
    return indexB - indexA; // Sort highest distance (Driver) to lowest (Wedges) on chart
  });
};
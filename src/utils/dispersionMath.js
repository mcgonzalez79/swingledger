export const calculateDispersionStats = (clubShots) => {
  if (!clubShots || clubShots.length === 0) return null;

  const n = clubShots.length;
  
  // Calculate Sums
  const sumX = clubShots.reduce((sum, s) => sum + (s.offline || 0), 0);
  const sumY = clubShots.reduce((sum, s) => sum + (s.carry || 0), 0);

  // Calculate Centroid (Averages)
  const centroidX = sumX / n;
  const centroidY = sumY / n;

  // Calculate Variance
  const varianceX = clubShots.reduce((sum, s) => sum + Math.pow((s.offline || 0) - centroidX, 2), 0) / n;
  const varianceY = clubShots.reduce((sum, s) => sum + Math.pow((s.carry || 0) - centroidY, 2), 0) / n;

  // Calculate Standard Deviation (1 SD = 68% confidence)
  const stdDevX = Math.sqrt(varianceX);
  const stdDevY = Math.sqrt(varianceY);

  // Generate Tendency Text
  const absX = Math.abs(centroidX);
  const direction = centroidX > 0 ? 'Right' : centroidX < 0 ? 'Left' : 'Dead Center';
  
  const tendencyText = absX <= 1.5 
    ? "Your average miss is dead on target."
    : `Your average miss is ${absX.toFixed(1)} yds ${direction} of target.`;

  return {
    centroid: { x: centroidX, y: centroidY },
    stdDev: { x: stdDevX, y: stdDevY },
    tendencyText,
    data: clubShots
  };
};
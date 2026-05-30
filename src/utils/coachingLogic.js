export const OPTIMAL_TARGETS = {
  driver: {
    path: "Neutral to slight In-to-out (0° to +2°)",
    face: "Near zero (−0.5° to +0.5°)",
    face_to_path: "Near zero to slightly negative (0° to −1°)"
  },
  irons: {
    path: "Neutral (−1° to +1°)",
    face: "Near zero (−0.5° to +0.5°)",
    face_to_path: "Near zero (−0.5° to +0.5°)"
  }
};

const COACHING_MATRIX = [
  { 
    path_state: "Out-to-in", 
    face_state: "Closed (left)", 
    face_to_path_state: "Zero", 
    ball_start: "Left", 
    curve: "None", 
    typical_shot: "Pull-straight", 
    tendencies: "Steep angle of attack tendency; leads to lower launch and higher spin.", 
    corrections: { 
      primary: ["Open the face slightly: neutralize/soften grip, add a bit more lead-wrist extension, feel a hold-off through impact.", "Reduce out-to-in path: close stance slightly, trail-foot back, feel the club approach from inside-to-out.", "Face-to-path near zero—good baseline for straight ball flight."], 
      driver: ["Focus on hitting up on the ball: tee higher, move ball forward, tilt spine away from target."], 
      irons: ["Ensure you are hitting down and compressing the ball: shift pressure left before impact, brush turf after the ball."] 
    } 
  },
  { 
    path_state: "Out-to-in", 
    face_state: "Square", 
    face_to_path_state: "Positive (fade bias)", 
    ball_start: "Straight", 
    curve: "Right", 
    typical_shot: "Straight-fade", 
    tendencies: "Steep angle of attack tendency; leads to lower launch and higher spin.", 
    corrections: { 
      primary: ["Reduce out-to-in path: close stance slightly, trail-foot back, feel the club approach from inside-to-out.", "Face-to-path is positive (fade/slice). Options: close the face a touch OR shift path a bit more right—do one at a time."], 
      driver: ["Focus on hitting up on the ball: tee higher, move ball forward, tilt spine away from target."], 
      irons: ["Ensure you are hitting down and compressing the ball: shift pressure left before impact, brush turf after the ball."] 
    } 
  },
  { 
    path_state: "Out-to-in", 
    face_state: "Open (right)", 
    face_to_path_state: "Positive (fade bias)", 
    ball_start: "Right", 
    curve: "Right", 
    typical_shot: "Push-slice", 
    tendencies: "Glancing blow tendency; leads to weak, high-spinning shots that lack distance.", 
    corrections: { 
      primary: ["Close the face: slightly stronger lead-hand grip, more lead-wrist flexion (bow) through impact, ensure release.", "Reduce out-to-in path: close stance slightly, trail-foot back, feel the club approach from inside-to-out.", "Face-to-path is positive (fade/slice). Options: close the face a touch OR shift path a bit more right—do one at a time."], 
      driver: ["Focus on hitting up on the ball: tee higher, move ball forward, tilt spine away from target."], 
      irons: ["Ensure you are hitting down and compressing the ball: shift pressure left before impact, brush turf after the ball."] 
    } 
  },
  { 
    path_state: "Neutral", 
    face_state: "Closed (left)", 
    face_to_path_state: "Negative (draw bias)", 
    ball_start: "Left", 
    curve: "Left", 
    typical_shot: "Pull-hook", 
    tendencies: "Strong strike but prone to low, diving hooks.", 
    corrections: { 
      primary: ["Open the face slightly: neutralize/soften grip, add a bit more lead-wrist extension, feel a hold-off through impact.", "Face-to-path is negative (draw/hook). Options: open the face a touch OR shift path a bit more left—do one at a time."], 
      driver: ["Focus on hitting up on the ball: tee higher, move ball forward, tilt spine away from target."], 
      irons: ["Ensure you are hitting down and compressing the ball: shift pressure left before impact, brush turf after the ball."] 
    } 
  },
  { 
    path_state: "Neutral", 
    face_state: "Square", 
    face_to_path_state: "Zero", 
    ball_start: "Straight", 
    curve: "None", 
    typical_shot: "Straight", 
    tendencies: "Optimal energy transfer and standard launch conditions.", 
    corrections: { 
      primary: ["Face-to-path near zero—good baseline for straight ball flight. Keep doing what you're doing!"], 
      driver: ["Maintain an upward strike: tee high, ball forward, slight trail-shoulder lower."], 
      irons: ["Maintain a downward strike: ball slightly forward of center, brush turf after the ball."] 
    } 
  },
  { 
    path_state: "Neutral", 
    face_state: "Open (right)", 
    face_to_path_state: "Positive (fade bias)", 
    ball_start: "Right", 
    curve: "Right", 
    typical_shot: "Push-slice", 
    tendencies: "Weaker strike, tendency to launch higher with more spin.", 
    corrections: { 
      primary: ["Close the face: slightly stronger lead-hand grip, more lead-wrist flexion (bow) through impact, ensure release.", "Face-to-path is positive (fade/slice). Options: close the face a touch OR shift path a bit more right—do one at a time."], 
      driver: ["Focus on hitting up on the ball: tee higher, move ball forward, tilt spine away from target."], 
      irons: ["Ensure you are hitting down and compressing the ball: shift pressure left before impact, brush turf after the ball."] 
    } 
  },
  { 
    path_state: "In-to-out", 
    face_state: "Closed (left)", 
    face_to_path_state: "Negative (draw bias)", 
    ball_start: "Left", 
    curve: "Left", 
    typical_shot: "Pull-hook", 
    tendencies: "Shallow angle of attack tendency; leads to high launch, low spin, and potential for fat/thin shots.", 
    corrections: { 
      primary: ["Open the face slightly: neutralize/soften grip, add a bit more lead-wrist extension, feel a hold-off through impact.", "Reduce in-to-out path: align a touch left, feel lead-hip opening earlier, swing more 'left' through impact.", "Face-to-path is negative (draw/hook). Options: open the face a touch OR shift path a bit more left—do one at a time."], 
      driver: ["Maintain upward strike without getting too far underneath: keep head behind ball but rotate through."], 
      irons: ["Focus on hitting down: move ball a hair back, feel lead side pressure earlier, ensure you take a divot after the ball."] 
    } 
  },
  { 
    path_state: "In-to-out", 
    face_state: "Square", 
    face_to_path_state: "Negative (draw bias)", 
    ball_start: "Straight", 
    curve: "Left", 
    typical_shot: "Straight-draw", 
    tendencies: "Excellent for distance (high launch, low spin), but path can get too shallow.", 
    corrections: { 
      primary: ["Reduce in-to-out path: align a touch left, feel lead-hip opening earlier, swing more 'left' through impact.", "Face-to-path is negative (draw/hook). Options: open the face a touch OR shift path a bit more left—do one at a time."], 
      driver: ["Maintain upward strike without getting too far underneath: keep head behind ball but rotate through."], 
      irons: ["Focus on hitting down: move ball a hair back, feel lead side pressure earlier, ensure you take a divot after the ball."] 
    } 
  },
  { 
    path_state: "In-to-out", 
    face_state: "Open (right)", 
    face_to_path_state: "Zero", 
    ball_start: "Right", 
    curve: "None", 
    typical_shot: "Push-straight", 
    tendencies: "High, blocking shots. Tends to be shallow through impact.", 
    corrections: { 
      primary: ["Close the face: slightly stronger lead-hand grip, more lead-wrist flexion (bow) through impact, ensure release.", "Reduce in-to-out path: align a touch left, feel lead-hip opening earlier, swing more 'left' through impact.", "Face-to-path near zero—good baseline for straight ball flight."], 
      driver: ["Maintain upward strike without getting too far underneath: keep head behind ball but rotate through."], 
      irons: ["Focus on hitting down: move ball a hair back, feel lead side pressure earlier, ensure you take a divot after the ball."] 
    } 
  }
];

export const getSwingDiagnosis = (metrics) => {
  if (!metrics) return null;

  // Convert raw degrees into state strings
  const pathState = metrics.avgPath < -1 ? "Out-to-in" : metrics.avgPath > 1 ? "In-to-out" : "Neutral";
  const faceState = metrics.avgFtt < -1 ? "Closed (left)" : metrics.avgFtt > 1 ? "Open (right)" : "Square";

  // Find the matching combination in our condensed coaching matrix
  const match = COACHING_MATRIX.find(c => 
    c.path_state === pathState && 
    c.face_state === faceState
  );

  return match || null;
};
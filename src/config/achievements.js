import { 
  Swords, Zap, Flame, Target, Trophy, Flag, Clock, HelpCircle, 
  Rocket, Medal, Crown, Star, Bird, Calendar, CalendarDays, 
  Sun, Moon, Droplets, MapPin, Gauge, MoveRight, MoveLeft, Anchor, 
  CloudRain, Wind, Mountain, Maximize, Activity, ClipboardCheck 
} from 'lucide-react';

export const ACHIEVEMENTS = [
  // --- THE GRIND (Volume & Consistency) ---
  { id: 'first_swing', title: 'First Swings', description: 'Import your first practice session.', category: 'The Grind', icon: Swords, isSecret: false, manualUnlock: false },
  { id: 'grind_100', title: 'Range Rat', description: 'Log over 100 total shots.', category: 'The Grind', icon: Flame, isSecret: false, manualUnlock: false },
  { id: 'century_club', title: 'Century Club', description: 'Log 100 shots in a single session.', category: 'The Grind', icon: Target, isSecret: false, manualUnlock: false },
  { id: 'workhorse_250', title: 'Workhorse', description: 'Log over 250 shots in a single week.', category: 'The Grind', icon: Activity, isSecret: false, manualUnlock: false },
  { id: 'back_to_back', title: 'Back to Back', description: 'Complete sessions on two consecutive days.', category: 'The Grind', icon: Calendar, isSecret: false, manualUnlock: false },
  { id: 'dedicated_3', title: 'Dedicated', description: 'Log sessions on 3 different days within a single week.', category: 'The Grind', icon: CalendarDays, isSecret: false, manualUnlock: false },
  { id: 'monthly_3', title: 'Monthly Milestone', description: 'Log a session in 3 consecutive months.', category: 'The Grind', icon: Clock, isSecret: false, manualUnlock: false },
  { id: 'weekly_2', title: 'Weekly Warrior', description: 'Complete a session in two consecutive weeks.', category: 'The Grind', icon: Swords, isSecret: false, manualUnlock: false },
  { id: 'grind_1000', title: 'The Grinder', description: 'Log over 1,000 total shots.', category: 'The Grind', icon: Medal, isSecret: false, manualUnlock: false },
  { id: 'grind_5000', title: 'The Grinder II', description: 'Log over 5,000 total shots.', category: 'The Grind', icon: Crown, isSecret: false, manualUnlock: false },
  { id: 'grind_10000', title: 'True Dedication', description: 'Log over 10,000 total shots.', category: 'The Grind', icon: Trophy, isSecret: false, manualUnlock: false },
  { id: 'grind_20000', title: 'Elite Practitioner', description: 'Log over 20,000 total shots.', category: 'The Grind', icon: Star, isSecret: false, manualUnlock: false },
  { id: 'grind_50000', title: 'Elite Practitioner II', description: 'Log over 50,000 total shots.', category: 'The Grind', icon: Star, isSecret: false, manualUnlock: false },
  { id: 'grind_100000', title: 'Elite Practitioner III', description: 'Log over 100,000 total shots.', category: 'The Grind', icon: Star, isSecret: false, manualUnlock: false },

  // --- THE ARSENAL (Club-Specific Volume) ---
  { id: 'full_bag', title: 'Full Bag Workout', description: 'Log shots with a Driver, Wood/Hybrid, Iron, and Wedge in one session.', category: 'The Arsenal', icon: Anchor, isSecret: false, manualUnlock: false },
  { id: 'new_tool', title: 'New Tool', description: 'Log the first shot with a new club that you haven\'t recorded before.', category: 'The Arsenal', icon: Target, isSecret: false, manualUnlock: false },
  { id: 'wedge_100', title: 'Wedge Rat', description: 'Log over 100 total shots with wedges.', category: 'The Arsenal', icon: MapPin, isSecret: false, manualUnlock: false },
  { id: 'wedge_500', title: 'Wedge Master', description: 'Log over 500 total shots with wedges.', category: 'The Arsenal', icon: Crown, isSecret: false, manualUnlock: false },
  { id: 'iron_1000', title: 'Iron Specialist', description: 'Log over 1,000 total shots with irons (3i-9i).', category: 'The Arsenal', icon: Swords, isSecret: false, manualUnlock: false },
  { id: 'iron_2000', title: 'Iron Sharpens Iron', description: 'Log over 2,000 total shots with irons (3i-9i).', category: 'The Arsenal', icon: Flame, isSecret: false, manualUnlock: false },
  { id: 'wood_50', title: 'Woodsman', description: 'Hit 50 total shots with Fairway Woods.', category: 'The Arsenal', icon: Rocket, isSecret: false, manualUnlock: false },
  { id: 'wood_100', title: 'Woodsman II', description: 'Hit 100 total shots with Fairway Woods.', category: 'The Arsenal', icon: Rocket, isSecret: false, manualUnlock: false },
  { id: 'wood_150', title: 'Woodsman III', description: 'Hit 150 total shots with Fairway Woods.', category: 'The Arsenal', icon: Trophy, isSecret: false, manualUnlock: false },

  // --- BALL STRIKER (Advanced Metrics) ---
  { id: 'data_scientist', title: 'Data Scientist', description: 'Import a session containing 10 or more data columns.', category: 'Ball Striker', icon: Activity, isSecret: false, manualUnlock: false },
  { id: 'untouchable', title: 'Untouchable', description: 'Hit a drive with a smash factor of 1.52 or higher.', category: 'Ball Striker', icon: Zap, isSecret: false, manualUnlock: false },
  { id: 'spin_8000', title: 'Spin Doctor', description: 'Log a shot with over 8,000 RPM of backspin.', category: 'Ball Striker', icon: Wind, isSecret: false, manualUnlock: false },
  { id: 'fairway_finder', title: 'Fairway Finder', description: 'Log 5 consecutive shots within 10 yards of the center line.', category: 'Ball Striker', icon: Target, isSecret: false, manualUnlock: false },
  { id: 'dialed_80', title: 'Dialed In', description: 'Achieve a Consistency Index of over 80% for a session.', category: 'Ball Striker', icon: Target, isSecret: false, manualUnlock: false },
  { id: 'tour_85', title: 'Tour-Like', description: 'Achieve a Consistency Index of over 85% for a session.', category: 'Ball Striker', icon: Medal, isSecret: false, manualUnlock: false },
  { id: 'compression_king', title: 'Compression King', description: 'Achieve an average Angle of Attack of -5° or lower with an iron in a session.', category: 'Ball Striker', icon: Droplets, isSecret: false, manualUnlock: false },
  { id: 'draw_5', title: 'Drawing Board', description: 'Hit 5 consecutive shots with a draw shape.', category: 'Ball Striker', icon: MoveLeft, isSecret: false, manualUnlock: false },
  { id: 'fade_5', title: 'Fade Away', description: 'Hit 5 consecutive shots with a fade shape.', category: 'Ball Striker', icon: MoveRight, isSecret: false, manualUnlock: false },
  { id: 'on_plane', title: 'On Plane', description: 'Complete a session with an average Club Path between -1° and +1°.', category: 'Ball Striker', icon: Gauge, isSecret: false, manualUnlock: false },
  { id: 'sniper_3', title: 'Sniper', description: 'Hit 3 consecutive shots that land within 3 yards of the same total distance.', category: 'Ball Striker', icon: MapPin, isSecret: false, manualUnlock: false },
  { id: 'sniper_5', title: 'Elite Sniper', description: 'Hit 5 consecutive shots that land within 3 yards of the same total distance.', category: 'Ball Striker', icon: Star, isSecret: false, manualUnlock: false },
  { id: 'opt_5', title: 'The Optimizer', description: 'Maintain a Smash Factor of 1.48 or higher for 5 consecutive driver shots.', category: 'Ball Striker', icon: Zap, isSecret: false, manualUnlock: false },
  { id: 'opt_10', title: 'Elite Optimizer', description: 'Maintain a Smash Factor of 1.48 or higher for 10 consecutive driver shots.', category: 'Ball Striker', icon: Crown, isSecret: false, manualUnlock: false },
  { id: 'pos_aoa', title: 'Positive Angles', description: 'Achieve a positive average Angle of Attack with your driver in a session.', category: 'Ball Striker', icon: Rocket, isSecret: false, manualUnlock: false },

  // --- LAUNCH PAD (Speed, Distance & Trajectory) ---
  { id: 'club_100', title: 'Speed Demon', description: 'Exceed 100 mph club speed for the first time.', category: 'Launch Pad', icon: Gauge, isSecret: false, manualUnlock: false },
  { id: 'ball_150', title: 'Ballistic', description: 'Exceed 150 mph ball speed for the first time.', category: 'Launch Pad', icon: Zap, isSecret: false, manualUnlock: false },
  { id: 'pr_carry', title: 'New Best: Carry', description: 'Set a new personal record for longest carry distance.', category: 'Launch Pad', icon: Maximize, isSecret: false, manualUnlock: false },
  { id: 'pr_club', title: 'Club PR', description: 'Set a new personal record for longest carry distance with a specific club.', category: 'Launch Pad', icon: Target, isSecret: false, manualUnlock: false },
  { id: 'drive_220', title: 'Getting Out There', description: 'Hit a drive over 220 yards (total distance).', category: 'Launch Pad', icon: Rocket, isSecret: false, manualUnlock: false },
  { id: 'drive_250', title: 'Quarter-Miler', description: 'Hit a drive over 250 yards (total distance).', category: 'Launch Pad', icon: Rocket, isSecret: false, manualUnlock: false },
  { id: 'bombs_300', title: 'Bombs Away', description: 'Hit any shot over 300 yards in total distance.', category: 'Launch Pad', icon: Flame, isSecret: false, manualUnlock: false },
  { id: 'high_low', title: 'High Launch, Low Spin', description: 'Hit a driver shot with >14° launch and <2500 RPM backspin.', category: 'Launch Pad', icon: Rocket, isSecret: false, manualUnlock: false },
  { id: 'stinger', title: 'Stinger', description: 'Hit an iron shot with <15° launch angle and >4000 RPM backspin.', category: 'Launch Pad', icon: MoveRight, isSecret: false, manualUnlock: false },
  { id: 'apex_50', title: 'Apex Predator', description: 'Hit a shot with an apex of over 50 yards.', category: 'Launch Pad', icon: Mountain, isSecret: false, manualUnlock: false },
  { id: 'flop_45', title: 'The Flop', description: 'Hit a wedge shot with a launch angle greater than 45°.', category: 'Launch Pad', icon: CloudRain, isSecret: false, manualUnlock: false },
  { id: 'wormburner', title: 'Wormburner', description: 'Hit a drive or iron over 100 yards with an apex under 15 feet.', category: 'Launch Pad', icon: Droplets, isSecret: false, manualUnlock: false },
  { id: 'drive_280', title: 'Deep Threat', description: 'Hit a drive over 280 yards (total distance).', category: 'Launch Pad', icon: Flame, isSecret: false, manualUnlock: false },

  // --- ON THE COURSE (Real Play & Scoring) ---
  { id: 'hole_in_one', title: 'Ace', description: 'Record a Hole in One.', category: 'On The Course', icon: Star, isSecret: false, manualUnlock: false },
  { id: 'first_birdie', title: 'Birdie Hunter', description: 'Record your first birdie.', category: 'On The Course', icon: Bird, isSecret: false, manualUnlock: false },
  { id: 'first_eagle', title: 'The Eagle Has Landed', description: 'Record your first eagle.', category: 'On The Course', icon: Crown, isSecret: false, manualUnlock: false },
  { id: 'par_train', title: 'Par Train', description: 'Record 3 consecutive pars in a single round.', category: 'On The Course', icon: Flag, isSecret: false, manualUnlock: false },
  { id: 'clean_card', title: 'Clean Card', description: 'Play a round with no double-bogeys.', category: 'On The Course', icon: ClipboardCheck, isSecret: false, manualUnlock: false },
  { id: 'front_nine', title: 'Front-Nine Hero', description: 'Shoot a lower score on the front 9 than the back 9.', category: 'On The Course', icon: Flag, isSecret: false, manualUnlock: false },
  { id: 'back_nine', title: 'Closer', description: 'Shoot a lower score on the back 9 than the front 9.', category: 'On The Course', icon: Target, isSecret: false, manualUnlock: false },
  { id: 'break_100', title: 'Breaking 100', description: 'Shoot under 100 for an 18-hole round.', category: 'On The Course', icon: Medal, isSecret: false, manualUnlock: false },
  { id: 'break_90', title: 'Breaking 90', description: 'Shoot under 90 for an 18-hole round.', category: 'On The Course', icon: Trophy, isSecret: false, manualUnlock: false },
  { id: 'break_80', title: 'Breaking 80', description: 'Shoot under 80 for an 18-hole round.', category: 'On The Course', icon: Crown, isSecret: false, manualUnlock: false },
  // THE FIX: Added 9-Hole Achievements
  { id: 'break_50_9', title: 'Breaking 50 (9 Holes)', description: 'Shoot under 50 for a 9-hole round.', category: 'On The Course', icon: Medal, isSecret: false, manualUnlock: false },
  { id: 'break_45_9', title: 'Breaking 45 (9 Holes)', description: 'Shoot under 45 for a 9-hole round.', category: 'On The Course', icon: Trophy, isSecret: false, manualUnlock: false },
  { id: 'break_40_9', title: 'Breaking 40 (9 Holes)', description: 'Shoot under 40 for a 9-hole round.', category: 'On The Course', icon: Crown, isSecret: false, manualUnlock: false },
  
  { id: 'hcp_5', title: 'Breaking 5', description: 'Achieve a Virtual Handicap below 5.', category: 'On The Course', icon: Star, isSecret: false, manualUnlock: false },
  { id: 'first_card', title: 'On the Course', description: 'Record your first scorecard.', category: 'On The Course', icon: Flag, isSecret: false, manualUnlock: false },
  { id: 'ghin_3', title: 'GHIN Ready', description: 'Record three scorecards.', category: 'On The Course', icon: Medal, isSecret: false, manualUnlock: false },
  { id: 'well_round_5', title: 'Well Rounded', description: 'Record five scorecards.', category: 'On The Course', icon: Trophy, isSecret: false, manualUnlock: false },
  { id: 'hcp_15', title: 'Breaking 15', description: 'Achieve a Virtual Handicap below 15.', category: 'On The Course', icon: Target, isSecret: false, manualUnlock: false },
  { id: 'hcp_10', title: 'Single Digit', description: 'Achieve a Virtual Handicap below 10.', category: 'On The Course', icon: Trophy, isSecret: false, manualUnlock: false },

  // --- TIME & HABIT BASED ---
  { id: 'dawn_patrol', title: 'Dawn Patrol', description: 'Log a session before 7:00 AM.', category: 'Time & Habit', icon: Sun, isSecret: false, manualUnlock: false },
  { id: 'lunch_break', title: 'Lunch Break', description: 'Log a quick session between 11:00 AM and 1:00 PM.', category: 'Time & Habit', icon: Clock, isSecret: false, manualUnlock: false },
  { id: 'night_owl', title: 'Night Owl', description: 'Log a session after 8:00 PM.', category: 'Time & Habit', icon: Moon, isSecret: false, manualUnlock: false },
  { id: 'four_seasons', title: 'Four Seasons', description: 'Log at least one session in Spring, Summer, Fall, and Winter.', category: 'Time & Habit', icon: CalendarDays, isSecret: false, manualUnlock: false },

  // --- EASTER EGGS (Hidden) ---
  { id: 'lumberjack', title: 'Lumberjack', description: 'Hit a shot with a Face-to-Path of +8° or higher.', category: 'Easter Eggs', icon: HelpCircle, isSecret: true, manualUnlock: false },
  { id: 'fore_right', title: 'Fore Right!', description: 'Hit a shot that ends up 40+ yards right of the center line.', category: 'Easter Eggs', icon: MoveRight, isSecret: true, manualUnlock: false },
  { id: 'two_way', title: 'Two-Way Miss', description: 'Hit a severe slice and a severe hook in the exact same practice session.', category: 'Easter Eggs', icon: HelpCircle, isSecret: true, manualUnlock: false },
  { id: 'grounded', title: 'Grounded', description: 'Hit a shot with a negative launch angle (topping the ball).', category: 'Easter Eggs', icon: Droplets, isSecret: true, manualUnlock: false },
];
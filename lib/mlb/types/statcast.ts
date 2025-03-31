/**
 * MLB Statcast Type Definitions
 *
 * This file contains type definitions for Statcast data from Baseball Savant.
 * Includes metrics for pitch tracking, ball flight, exit velocity, and other advanced analytics.
 */

/**
 * Individual pitch data from Statcast
 *
 * @property pitch_type - Pitch type code (FF, SL, CU, etc.)
 * @property count - Number of pitches thrown
 * @property velocity - Average velocity in mph
 * @property whiff_rate - Swing and miss rate
 * @property put_away_rate - Rate at which pitch results in outs
 */
export interface StatcastPitch {
  pitch_type: string;
  count: number;
  velocity: number;
  whiff_rate: number;
  put_away_rate: number;
}

/**
 * Pitcher control metrics from Statcast
 *
 * @property zone_rate - Percentage of pitches in strike zone
 * @property first_pitch_strike - First pitch strike percentage
 * @property whiff_rate - Overall swing and miss rate
 * @property chase_rate - Rate at which batters chase pitches outside zone
 */
export interface StatcastControlMetrics {
  zone_rate: number;
  first_pitch_strike: number;
  whiff_rate: number;
  chase_rate: number;
}

/**
 * Velocity trend data from Statcast
 *
 * @property game_date - Date of the game
 * @property pitch_type - Pitch type code
 * @property avg_velocity - Average velocity for that game
 * @property velocity_change - Change in velocity compared to baseline
 */
export interface StatcastVelocityTrend {
  game_date: string;
  pitch_type: string;
  avg_velocity: number;
  velocity_change: number;
}

/**
 * Comprehensive Statcast data structure
 *
 * @property pitch_mix - Array of pitch types and statistics
 * @property control_metrics - Pitcher control statistics
 * @property velocity_trends - Velocity trends over time
 * @property is_default_data - Whether this is default data (not actual Statcast)
 */
export interface StatcastData {
  pitch_mix: StatcastPitch[];
  control_metrics: StatcastControlMetrics;
  velocity_trends: StatcastVelocityTrend[];
  is_default_data?: boolean;
}

/**
 * Pitch effectiveness metrics
 *
 * @property fastballEff - Fastball effectiveness rating
 * @property sliderEff - Slider effectiveness rating
 * @property curveEff - Curveball effectiveness rating
 * @property changeupEff - Changeup effectiveness rating
 * @property sinkerEff - Sinker effectiveness rating
 * @property cutterEff - Cutter effectiveness rating
 */
export interface PitchEffectiveness {
  fastballEff?: number;
  sliderEff?: number;
  curveEff?: number;
  changeupEff?: number;
  sinkerEff?: number;
  cutterEff?: number;
}

/**
 * Statcast pitcher data with pitch effectiveness
 *
 * @property player_id - MLB player ID
 * @property name - Pitcher's name
 * @property pitch_effectiveness - Optional effectiveness metrics by pitch type
 */
export interface StatcastPitcherData extends StatcastData {
  player_id: number;
  name: string;
  pitch_effectiveness?: PitchEffectiveness;
}

/**
 * Expected statistics from Statcast data
 * Includes expected batting average, slugging, etc. based on quality of contact
 */
export interface ExpectedStats {
  player_id: string;
  xba: string;
  xslg: string;
  xwoba: string;
  xobp: string;
  xiso: string;
  exit_velocity_avg: string;
  launch_angle_avg: string;
  barrel_batted_rate: string;
  sweet_spot_percent: string;
  hard_hit_percent: string;
}

/**
 * Core Statcast metrics for a player
 * Contains raw batting data metrics from Baseball Savant
 */
export interface StatcastMetrics {
  "last_name, first_name": string;
  player_id: string;
  attempts: string;
  avg_hit_angle: string;
  anglesweetspotpercent: string;
  max_hit_speed: string;
  avg_hit_speed: string;
  fbld: string;
  gb: string;
  max_distance: string;
  avg_distance: string;
  avg_hr_distance: string;
  ev95plus: string;
  ev95percent: string;
  barrels: string;
  brl_pa: string;
  expected_stats: ExpectedStats;
}

/**
 * Data for a specific pitch type thrown by a pitcher
 * Includes velocity, movement, and effectiveness metrics
 */
export interface PitchTypeData {
  pitch_type: string;
  count: number;
  percentage: number;
  velocity: number;
  spin_rate: number;
  vertical_movement: number;
  horizontal_movement: number;
  whiff_rate: number;
  put_away_rate: number;
  release_extension?: number;
  release_height?: number;
  zone_rate?: number;
  chase_rate?: number;
  zone_contact_rate?: number;
  chase_contact_rate?: number;
  batting_avg_against?: number;
  expected_woba?: number;
}

/**
 * Distribution of pitch types for a pitcher
 * Percentages of each pitch type in a pitcher's arsenal
 */
export interface PitchUsage {
  fastball: number;
  slider: number;
  curve: number;
  changeup: number;
  sinker: number;
  cutter: number;
  splitter: number;
  sweep: number;
  fork: number;
  knuckle: number;
  other: number;
}

/**
 * Velocity trends for a pitcher over time
 * Tracks changes in velocity for specific pitch types
 */
export interface PitcherVelocityTrend {
  player_id: number;
  game_date: string;
  pitch_type: string;
  avg_velocity: number;
  max_velocity: number;
  min_velocity: number;
  velocity_range: number;
  velocity_stddev: number;
  previous_avg_velocity?: number;
  velocity_change?: number;
}

/**
 * Comprehensive Statcast data for a pitcher
 * Includes pitch mix, velocity, control, and results metrics
 */
export interface PitcherStatcastData {
  player_id: number;
  name: string;
  team: string;
  team_id: number;
  handedness: string;
  pitch_mix: PitchTypeData[];
  pitches: PitchUsage;
  velocity_trends: PitcherVelocityTrend[];
  control_metrics: {
    zone_rate: number;
    first_pitch_strike: number;
    whiff_rate: number;
    chase_rate: number;
    csw_rate: number;
    called_strike_rate?: number;
    edge_percent?: number;
    zone_contact_rate?: number;
    chase_contact_rate?: number;
  };
  movement_metrics: {
    horizontal_break: number;
    induced_vertical_break: number;
    release_extension: number;
    release_height: number;
  };
  result_metrics: {
    hard_hit_percent: number;
    batting_avg_against: number;
    slugging_against: number;
    woba_against: number;
    expected_woba: number;
  };
  command_metrics: {
    edge_percent: number;
    middle_percent: number;
    plate_discipline: {
      o_swing_percent: number;
      z_swing_percent: number;
      swing_percent: number;
      o_contact_percent: number;
      z_contact_percent: number;
      contact_percent: number;
    };
  };
  season_stats: {
    games: number;
    innings_pitched: number;
    era: number;
    whip: number;
    k_rate: number;
    bb_rate: number;
    hr_rate: number;
    ground_ball_rate: number;
  };
}

/**
 * Comprehensive Statcast data for a batter
 * Includes quality of contact metrics, platoon splits, and performance against pitch types
 */
export interface BatterStatcastData {
  player_id: number;
  name: string;
  team?: string;
  team_id?: number;
  handedness?: string;
  batting_metrics: {
    avg: number;
    obp: number;
    slg: number;
    ops: number;
    woba: number;
    xwoba: number;
    exit_velocity_avg: number;
    sweet_spot_percent: number;
    barrel_percent: number;
    hard_hit_percent: number;
    k_percent: number;
    bb_percent: number;
  };
  platoon_splits: {
    vs_left: {
      avg: number;
      obp: number;
      slg: number;
      ops: number;
      woba: number;
    };
    vs_right: {
      avg: number;
      obp: number;
      slg: number;
      ops: number;
      woba: number;
    };
  };
  pitch_type_performance: {
    vs_fastball: number; // Score 0-100
    vs_breaking: number;
    vs_offspeed: number;
  };
  recent_performance?: {
    last_7_days: {
      avg: number;
      obp: number;
      slg: number;
      ops: number;
    };
    last_15_days: {
      avg: number;
      obp: number;
      slg: number;
      ops: number;
    };
    last_30_days: {
      avg: number;
      obp: number;
      slg: number;
      ops: number;
    };
  };
  season_stats?: {
    games: number;
    plate_appearances: number;
    at_bats: number;
    hits: number;
    home_runs: number;
    rbis: number;
    stolen_bases: number;
    avg: number;
    obp: number;
    slg: number;
    ops: number;
  };
}

/**
 * Statcast team-level data
 * Includes both batting and pitching metrics for a team, plus roster information
 */
export interface TeamStatcastData {
  team_id: number;
  team_name: string;
  team_abbrev: string;
  team_record: {
    wins: number;
    losses: number;
    win_pct: number;
  };
  batting_stats: {
    runs_per_game: number;
    avg: number;
    obp: number;
    slg: number;
    ops: number;
    woba: number;
    wrc_plus: number;
    k_percent: number;
    bb_percent: number;
    home_runs: number;
  };
  pitching_stats: {
    era: number;
    whip: number;
    k_per_9: number;
    bb_per_9: number;
    hr_per_9: number;
    fip: number;
    quality_start_percent: number;
  };
  roster: {
    pitchers: Array<{
      player_id: number;
      name: string;
      role: string; // 'SP', 'RP', 'CL'
      handedness: string;
      era: number;
    }>;
    batters: Array<{
      player_id: number;
      name: string;
      position: string;
      handedness: string;
      ops: number;
    }>;
  };
}

/**
 * Response format for Statcast leaderboard queries
 * Contains ranked list of players for a specific metric
 */
export interface LeaderboardResponse {
  leaderboard: Array<{
    player_id: number;
    name: string;
    team: string;
    value: number;
  }>;
  metric: string;
  season: string;
  player_type: "pitcher" | "batter";
}

/**
 * Combined player data including both raw and expected metrics
 */
export interface CombinedPlayerData extends StatcastMetrics {
  expected_stats: ExpectedStats;
}

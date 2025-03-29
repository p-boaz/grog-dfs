import { z } from "zod";

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

export interface CombinedPlayerData extends StatcastMetrics {
  expected_stats: ExpectedStats;
}

// Movement metrics validation schema
export const MovementMetricsSchema = z.object({
  horizontal_break: z.number().min(-30).max(30), // Typical range for horizontal break in inches
  induced_vertical_break: z.number().min(-30).max(30), // Typical range for vertical break in inches
  release_extension: z.number().min(4).max(8), // Typical range for release extension in feet
  release_height: z.number().min(3).max(8), // Typical range for release height in feet
});

// Control metrics validation schema
export const ControlMetricsSchema = z.object({
  zone_rate: z.number().min(0).max(100),
  first_pitch_strike: z.number().min(0).max(100),
  whiff_rate: z.number().min(0).max(100),
  chase_rate: z.number().min(0).max(100),
  csw_rate: z.number().min(0).max(100),
  called_strike_rate: z.number().min(0).max(100),
  edge_percent: z.number().min(0).max(100),
  zone_contact_rate: z.number().min(0).max(100),
  chase_contact_rate: z.number().min(0).max(100),
});

// Result metrics validation schema
export const ResultMetricsSchema = z.object({
  hard_hit_percent: z.number().min(0).max(100),
  batting_avg_against: z.number().min(0).max(1),
  slugging_against: z.number().min(0).max(5),
  woba_against: z.number().min(0).max(1),
  expected_woba: z.number().min(0).max(1),
});

// Update PitchTypeData interface to include validation
export const PitchTypeDataSchema = z.object({
  pitch_type: z.string(),
  count: z.number().min(0),
  percentage: z.number().min(0).max(100),
  velocity: z.number().min(50).max(110), // MLB pitch velocities typically range from 50-110 mph
  spin_rate: z.number().min(0).max(4000), // Typical spin rates range from 1000-3500 rpm
  vertical_movement: z.number().min(-30).max(30),
  horizontal_movement: z.number().min(-30).max(30),
  whiff_rate: z.number().min(0).max(1),
  put_away_rate: z.number().min(0).max(1),
  release_extension: z.number().min(4).max(8).optional(),
  release_height: z.number().min(3).max(8).optional(),
  zone_rate: z.number().min(0).max(1).optional(),
  chase_rate: z.number().min(0).max(1).optional(),
  zone_contact_rate: z.number().min(0).max(1).optional(),
  chase_contact_rate: z.number().min(0).max(1).optional(),
  batting_avg_against: z.number().min(0).max(1).optional(),
  expected_woba: z.number().min(0).max(1).optional(),
});

// Update PitchUsage interface to include validation
export const PitchUsageSchema = z
  .object({
    fastball: z.number().min(0).max(100),
    slider: z.number().min(0).max(100),
    curve: z.number().min(0).max(100),
    changeup: z.number().min(0).max(100),
    sinker: z.number().min(0).max(100),
    cutter: z.number().min(0).max(100),
    splitter: z.number().min(0).max(100),
    sweep: z.number().min(0).max(100),
    fork: z.number().min(0).max(100),
    knuckle: z.number().min(0).max(100),
    other: z.number().min(0).max(100),
  })
  .refine(
    (data) => {
      const total = Object.values(data).reduce((sum, val) => sum + val, 0);
      return Math.abs(total - 100) < 0.1; // Allow for small rounding errors
    },
    {
      message: "Pitch usage percentages must sum to 100%",
    }
  );

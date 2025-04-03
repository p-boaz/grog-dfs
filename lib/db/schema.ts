import {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  integer,
  date,
  real,
  json,
  boolean,
  unique,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: varchar('role', { length: 20 }).notNull().default('member'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'),
});

export const teams = pgTable('teams', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  stripeCustomerId: text('stripe_customer_id').unique(),
  stripeSubscriptionId: text('stripe_subscription_id').unique(),
  stripeProductId: text('stripe_product_id'),
  planName: varchar('plan_name', { length: 50 }),
  subscriptionStatus: varchar('subscription_status', { length: 20 }),
});

export const teamMembers = pgTable('team_members', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  teamId: integer('team_id')
    .notNull()
    .references(() => teams.id),
  role: varchar('role', { length: 50 }).notNull(),
  joinedAt: timestamp('joined_at').notNull().defaultNow(),
});

export const activityLogs = pgTable('activity_logs', {
  id: serial('id').primaryKey(),
  teamId: integer('team_id')
    .notNull()
    .references(() => teams.id),
  userId: integer('user_id').references(() => users.id),
  action: text('action').notNull(),
  timestamp: timestamp('timestamp').notNull().defaultNow(),
  ipAddress: varchar('ip_address', { length: 45 }),
});

export const invitations = pgTable('invitations', {
  id: serial('id').primaryKey(),
  teamId: integer('team_id')
    .notNull()
    .references(() => teams.id),
  email: varchar('email', { length: 255 }).notNull(),
  role: varchar('role', { length: 50 }).notNull(),
  invitedBy: integer('invited_by')
    .notNull()
    .references(() => users.id),
  invitedAt: timestamp('invited_at').notNull().defaultNow(),
  status: varchar('status', { length: 20 }).notNull().default('pending'),
});

export const teamsRelations = relations(teams, ({ many }) => ({
  teamMembers: many(teamMembers),
  activityLogs: many(activityLogs),
  invitations: many(invitations),
}));

export const usersRelations = relations(users, ({ many }) => ({
  teamMembers: many(teamMembers),
  invitationsSent: many(invitations),
}));

export const invitationsRelations = relations(invitations, ({ one }) => ({
  team: one(teams, {
    fields: [invitations.teamId],
    references: [teams.id],
  }),
  invitedBy: one(users, {
    fields: [invitations.invitedBy],
    references: [users.id],
  }),
}));

export const teamMembersRelations = relations(teamMembers, ({ one }) => ({
  user: one(users, {
    fields: [teamMembers.userId],
    references: [users.id],
  }),
  team: one(teams, {
    fields: [teamMembers.teamId],
    references: [teams.id],
  }),
}));

export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
  team: one(teams, {
    fields: [activityLogs.teamId],
    references: [teams.id],
  }),
  user: one(users, {
    fields: [activityLogs.userId],
    references: [users.id],
  }),
}));

// MLB Player Tables
export const mlbPlayers = pgTable('mlb_players', {
  id: integer('id').primaryKey(), // MLB API player ID
  fullName: varchar('full_name', { length: 100 }).notNull(),
  team: varchar('team', { length: 50 }),
  teamId: integer('team_id'),
  position: varchar('position', { length: 10 }),
  handedness: varchar('handedness', { length: 5 }),
  throwsHand: varchar('throws_hand', { length: 5 }),
  isPitcher: boolean('is_pitcher').notNull(),
  lastUpdated: timestamp('last_updated').notNull().defaultNow(),
  metadata: json('metadata').$type<Record<string, any>>(),
});

export const mlbBatterStats = pgTable('mlb_batter_stats', {
  id: serial('id').primaryKey(),
  playerId: integer('player_id').notNull().references(() => mlbPlayers.id),
  season: varchar('season', { length: 10 }).notNull(),
  isCareer: boolean('is_career').default(false),
  gamesPlayed: integer('games_played').default(0),
  atBats: integer('at_bats').default(0),
  hits: integer('hits').default(0),
  homeRuns: integer('home_runs').default(0),
  rbi: integer('rbi').default(0),
  stolenBases: integer('stolen_bases').default(0),
  avg: real('avg').default(0),
  obp: real('obp').default(0),
  slg: real('slg').default(0),
  ops: real('ops').default(0),
  runs: integer('runs').default(0),
  walks: integer('walks').default(0),
  strikeouts: integer('strikeouts').default(0),
  caughtStealing: integer('caught_stealing').default(0),
  doubles: integer('doubles').default(0),
  triples: integer('triples').default(0),
  hitByPitches: integer('hit_by_pitches').default(0),
  sacrificeFlies: integer('sacrifice_flies').default(0),
  plateAppearances: integer('plate_appearances').default(0),
  babip: real('babip').default(0),
  iso: real('iso').default(0),
  hrRate: real('hr_rate').default(0),
  kRate: real('k_rate').default(0),
  bbRate: real('bb_rate').default(0),
  sbRate: real('sb_rate').default(0),
  lastUpdated: timestamp('last_updated').notNull().defaultNow(),
}, (table) => {
  return {
    playerSeasonIdx: unique('player_season_idx').on(table.playerId, table.season, table.isCareer),
  };
});

export const mlbPitcherStats = pgTable('mlb_pitcher_stats', {
  id: serial('id').primaryKey(),
  playerId: integer('player_id').notNull().references(() => mlbPlayers.id),
  season: varchar('season', { length: 10 }).notNull(),
  isCareer: boolean('is_career').default(false),
  gamesPlayed: integer('games_played').default(0),
  gamesStarted: integer('games_started').default(0),
  inningsPitched: real('innings_pitched').default(0),
  wins: integer('wins').default(0),
  losses: integer('losses').default(0),
  era: real('era').default(0),
  whip: real('whip').default(0),
  strikeouts: integer('strikeouts').default(0),
  walks: integer('walks').default(0),
  saves: integer('saves').default(0),
  homeRunsAllowed: integer('home_runs_allowed').default(0),
  hitBatsmen: integer('hit_batsmen').default(0),
  qualityStarts: integer('quality_starts').default(0),
  blownSaves: integer('blown_saves').default(0),
  holds: integer('holds').default(0),
  battersFaced: integer('batters_faced').default(0),
  hitsAllowed: integer('hits_allowed').default(0),
  earnedRuns: integer('earned_runs').default(0),
  completeGames: integer('complete_games').default(0),
  shutouts: integer('shutouts').default(0),
  kRate: real('k_rate').default(0),
  bbRate: real('bb_rate').default(0),
  k9: real('k9').default(0),
  bb9: real('bb9').default(0),
  hr9: real('hr9').default(0),
  lastUpdated: timestamp('last_updated').notNull().defaultNow(),
}, (table) => {
  return {
    playerSeasonIdx: unique('pitcher_season_idx').on(table.playerId, table.season, table.isCareer),
  };
});

// MLB Game Tables
export const mlbGames = pgTable('mlb_games', {
  gamePk: integer('game_pk').primaryKey(),
  gameDate: date('game_date').notNull(),
  gameTime: timestamp('game_time').notNull(),
  homeTeamId: integer('home_team_id').notNull(),
  awayTeamId: integer('away_team_id').notNull(),
  homeTeamName: varchar('home_team_name', { length: 50 }).notNull(),
  awayTeamName: varchar('away_team_name', { length: 50 }).notNull(),
  venueId: integer('venue_id'),
  venueName: varchar('venue_name', { length: 100 }),
  status: varchar('status', { length: 20 }).notNull(),
  detailedState: varchar('detailed_state', { length: 50 }),
  isComplete: boolean('is_complete').default(false),
  lastUpdated: timestamp('last_updated').notNull().defaultNow(),
});

// MLB Analysis Tables
export const mlbBatterProjections = pgTable('mlb_batter_projections', {
  id: serial('id').primaryKey(),
  playerId: integer('player_id').notNull().references(() => mlbPlayers.id),
  gamePk: integer('game_pk').notNull().references(() => mlbGames.gamePk),
  projectedPoints: real('projected_points').notNull(),
  confidence: real('confidence').default(50), // 0-100 scale
  draftKingsSalary: integer('dk_salary'),
  projectedHits: real('projected_hits').default(0),
  projectedHomeRuns: real('projected_home_runs').default(0),
  projectedRbi: real('projected_rbi').default(0),
  projectedRuns: real('projected_runs').default(0),
  projectedStolenBases: real('projected_stolen_bases').default(0),
  battingOrderPosition: integer('batting_order_position'),
  opposingPitcherId: integer('opposing_pitcher_id'),
  analysisFactors: json('analysis_factors').$type<string[]>(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => {
  return {
    playerGameIdx: unique('batter_player_game_idx').on(table.playerId, table.gamePk),
  };
});

export const mlbPitcherProjections = pgTable('mlb_pitcher_projections', {
  id: serial('id').primaryKey(),
  playerId: integer('player_id').notNull().references(() => mlbPlayers.id),
  gamePk: integer('game_pk').notNull().references(() => mlbGames.gamePk),
  projectedPoints: real('projected_points').notNull(),
  confidence: real('confidence').default(50), // 0-100 scale
  draftKingsSalary: integer('dk_salary'),
  projectedInnings: real('projected_innings').default(0),
  projectedStrikeouts: real('projected_strikeouts').default(0),
  projectedWinProbability: real('projected_win_probability').default(0),
  projectedQualityStart: real('projected_quality_start').default(0),
  opposingLineupStrength: real('opposing_lineup_strength').default(0),
  analysisFactors: json('analysis_factors').$type<string[]>(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => {
  return {
    playerGameIdx: unique('pitcher_player_game_idx').on(table.playerId, table.gamePk),
  };
});

// Relations for MLB Tables
export const mlbPlayerRelations = relations(mlbPlayers, ({ many }) => ({
  batterStats: many(mlbBatterStats),
  pitcherStats: many(mlbPitcherStats),
  batterProjections: many(mlbBatterProjections),
  pitcherProjections: many(mlbPitcherProjections),
}));

export const mlbBatterStatsRelations = relations(mlbBatterStats, ({ one }) => ({
  player: one(mlbPlayers, {
    fields: [mlbBatterStats.playerId],
    references: [mlbPlayers.id],
  }),
}));

export const mlbPitcherStatsRelations = relations(mlbPitcherStats, ({ one }) => ({
  player: one(mlbPlayers, {
    fields: [mlbPitcherStats.playerId],
    references: [mlbPlayers.id],
  }),
}));

export const mlbGameRelations = relations(mlbGames, ({ many }) => ({
  batterProjections: many(mlbBatterProjections),
  pitcherProjections: many(mlbPitcherProjections),
}));

export const mlbBatterProjectionsRelations = relations(mlbBatterProjections, ({ one }) => ({
  player: one(mlbPlayers, {
    fields: [mlbBatterProjections.playerId],
    references: [mlbPlayers.id],
  }),
  game: one(mlbGames, {
    fields: [mlbBatterProjections.gamePk],
    references: [mlbGames.gamePk],
  }),
}));

export const mlbPitcherProjectionsRelations = relations(mlbPitcherProjections, ({ one }) => ({
  player: one(mlbPlayers, {
    fields: [mlbPitcherProjections.playerId],
    references: [mlbPlayers.id],
  }),
  game: one(mlbGames, {
    fields: [mlbPitcherProjections.gamePk],
    references: [mlbGames.gamePk],
  }),
}));

// User-related type exports
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Team = typeof teams.$inferSelect;
export type NewTeam = typeof teams.$inferInsert;
export type TeamMember = typeof teamMembers.$inferSelect;
export type NewTeamMember = typeof teamMembers.$inferInsert;
export type ActivityLog = typeof activityLogs.$inferSelect;
export type NewActivityLog = typeof activityLogs.$inferInsert;
export type Invitation = typeof invitations.$inferSelect;
export type NewInvitation = typeof invitations.$inferInsert;
export type TeamDataWithMembers = Team & {
  teamMembers: (TeamMember & {
    user: Pick<User, 'id' | 'name' | 'email'>;
  })[];
};

// MLB Player type exports
export type MLBPlayer = typeof mlbPlayers.$inferSelect;
export type NewMLBPlayer = typeof mlbPlayers.$inferInsert;
export type BatterStats = typeof mlbBatterStats.$inferSelect;
export type NewBatterStats = typeof mlbBatterStats.$inferInsert;
export type PitcherStats = typeof mlbPitcherStats.$inferSelect;
export type NewPitcherStats = typeof mlbPitcherStats.$inferInsert;

// MLB Game type exports
export type MLBGame = typeof mlbGames.$inferSelect;
export type NewMLBGame = typeof mlbGames.$inferInsert;

// MLB Analysis type exports
export type BatterProjection = typeof mlbBatterProjections.$inferSelect;
export type NewBatterProjection = typeof mlbBatterProjections.$inferInsert;
export type PitcherProjection = typeof mlbPitcherProjections.$inferSelect;
export type NewPitcherProjection = typeof mlbPitcherProjections.$inferInsert;

export enum ActivityType {
  SIGN_UP = 'SIGN_UP',
  SIGN_IN = 'SIGN_IN',
  SIGN_OUT = 'SIGN_OUT',
  UPDATE_PASSWORD = 'UPDATE_PASSWORD',
  DELETE_ACCOUNT = 'DELETE_ACCOUNT',
  UPDATE_ACCOUNT = 'UPDATE_ACCOUNT',
  CREATE_TEAM = 'CREATE_TEAM',
  REMOVE_TEAM_MEMBER = 'REMOVE_TEAM_MEMBER',
  INVITE_TEAM_MEMBER = 'INVITE_TEAM_MEMBER',
  ACCEPT_INVITATION = 'ACCEPT_INVITATION',
}

export enum MLBGameStatus {
  SCHEDULED = 'SCHEDULED',
  PREGAME = 'PREGAME',
  LIVE = 'LIVE',
  FINAL = 'FINAL',
  POSTPONED = 'POSTPONED',
  SUSPENDED = 'SUSPENDED',
  CANCELLED = 'CANCELLED',
}

CREATE TABLE "mlb_batter_projections" (
	"id" serial PRIMARY KEY NOT NULL,
	"player_id" integer NOT NULL,
	"game_pk" integer NOT NULL,
	"projected_points" real NOT NULL,
	"confidence" real DEFAULT 50,
	"dk_salary" integer,
	"projected_hits" real DEFAULT 0,
	"projected_home_runs" real DEFAULT 0,
	"projected_rbi" real DEFAULT 0,
	"projected_runs" real DEFAULT 0,
	"projected_stolen_bases" real DEFAULT 0,
	"batting_order_position" integer,
	"opposing_pitcher_id" integer,
	"analysis_factors" json,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "batter_player_game_idx" UNIQUE("player_id","game_pk")
);
--> statement-breakpoint
CREATE TABLE "mlb_batter_stats" (
	"id" serial PRIMARY KEY NOT NULL,
	"player_id" integer NOT NULL,
	"season" varchar(10) NOT NULL,
	"is_career" boolean DEFAULT false,
	"games_played" integer DEFAULT 0,
	"at_bats" integer DEFAULT 0,
	"hits" integer DEFAULT 0,
	"home_runs" integer DEFAULT 0,
	"rbi" integer DEFAULT 0,
	"stolen_bases" integer DEFAULT 0,
	"avg" real DEFAULT 0,
	"obp" real DEFAULT 0,
	"slg" real DEFAULT 0,
	"ops" real DEFAULT 0,
	"runs" integer DEFAULT 0,
	"walks" integer DEFAULT 0,
	"strikeouts" integer DEFAULT 0,
	"caught_stealing" integer DEFAULT 0,
	"doubles" integer DEFAULT 0,
	"triples" integer DEFAULT 0,
	"hit_by_pitches" integer DEFAULT 0,
	"sacrifice_flies" integer DEFAULT 0,
	"plate_appearances" integer DEFAULT 0,
	"babip" real DEFAULT 0,
	"iso" real DEFAULT 0,
	"hr_rate" real DEFAULT 0,
	"k_rate" real DEFAULT 0,
	"bb_rate" real DEFAULT 0,
	"sb_rate" real DEFAULT 0,
	"last_updated" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "player_season_idx" UNIQUE("player_id","season","is_career")
);
--> statement-breakpoint
CREATE TABLE "mlb_games" (
	"game_pk" integer PRIMARY KEY NOT NULL,
	"game_date" date NOT NULL,
	"game_time" timestamp NOT NULL,
	"home_team_id" integer NOT NULL,
	"away_team_id" integer NOT NULL,
	"home_team_name" varchar(50) NOT NULL,
	"away_team_name" varchar(50) NOT NULL,
	"venue_id" integer,
	"venue_name" varchar(100),
	"status" varchar(20) NOT NULL,
	"detailed_state" varchar(50),
	"is_complete" boolean DEFAULT false,
	"last_updated" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mlb_pitcher_projections" (
	"id" serial PRIMARY KEY NOT NULL,
	"player_id" integer NOT NULL,
	"game_pk" integer NOT NULL,
	"projected_points" real NOT NULL,
	"confidence" real DEFAULT 50,
	"dk_salary" integer,
	"projected_innings" real DEFAULT 0,
	"projected_strikeouts" real DEFAULT 0,
	"projected_win_probability" real DEFAULT 0,
	"projected_quality_start" real DEFAULT 0,
	"opposing_lineup_strength" real DEFAULT 0,
	"analysis_factors" json,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "pitcher_player_game_idx" UNIQUE("player_id","game_pk")
);
--> statement-breakpoint
CREATE TABLE "mlb_pitcher_stats" (
	"id" serial PRIMARY KEY NOT NULL,
	"player_id" integer NOT NULL,
	"season" varchar(10) NOT NULL,
	"is_career" boolean DEFAULT false,
	"games_played" integer DEFAULT 0,
	"games_started" integer DEFAULT 0,
	"innings_pitched" real DEFAULT 0,
	"wins" integer DEFAULT 0,
	"losses" integer DEFAULT 0,
	"era" real DEFAULT 0,
	"whip" real DEFAULT 0,
	"strikeouts" integer DEFAULT 0,
	"walks" integer DEFAULT 0,
	"saves" integer DEFAULT 0,
	"home_runs_allowed" integer DEFAULT 0,
	"hit_batsmen" integer DEFAULT 0,
	"quality_starts" integer DEFAULT 0,
	"blown_saves" integer DEFAULT 0,
	"holds" integer DEFAULT 0,
	"batters_faced" integer DEFAULT 0,
	"hits_allowed" integer DEFAULT 0,
	"earned_runs" integer DEFAULT 0,
	"complete_games" integer DEFAULT 0,
	"shutouts" integer DEFAULT 0,
	"k_rate" real DEFAULT 0,
	"bb_rate" real DEFAULT 0,
	"k9" real DEFAULT 0,
	"bb9" real DEFAULT 0,
	"hr9" real DEFAULT 0,
	"last_updated" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "pitcher_season_idx" UNIQUE("player_id","season","is_career")
);
--> statement-breakpoint
CREATE TABLE "mlb_players" (
	"id" integer PRIMARY KEY NOT NULL,
	"full_name" varchar(100) NOT NULL,
	"team" varchar(50),
	"team_id" integer,
	"position" varchar(10),
	"handedness" varchar(5),
	"throws_hand" varchar(5),
	"is_pitcher" boolean NOT NULL,
	"last_updated" timestamp DEFAULT now() NOT NULL,
	"metadata" json
);
--> statement-breakpoint
ALTER TABLE "mlb_batter_projections" ADD CONSTRAINT "mlb_batter_projections_player_id_mlb_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."mlb_players"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mlb_batter_projections" ADD CONSTRAINT "mlb_batter_projections_game_pk_mlb_games_game_pk_fk" FOREIGN KEY ("game_pk") REFERENCES "public"."mlb_games"("game_pk") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mlb_batter_stats" ADD CONSTRAINT "mlb_batter_stats_player_id_mlb_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."mlb_players"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mlb_pitcher_projections" ADD CONSTRAINT "mlb_pitcher_projections_player_id_mlb_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."mlb_players"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mlb_pitcher_projections" ADD CONSTRAINT "mlb_pitcher_projections_game_pk_mlb_games_game_pk_fk" FOREIGN KEY ("game_pk") REFERENCES "public"."mlb_games"("game_pk") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mlb_pitcher_stats" ADD CONSTRAINT "mlb_pitcher_stats_player_id_mlb_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."mlb_players"("id") ON DELETE no action ON UPDATE no action;
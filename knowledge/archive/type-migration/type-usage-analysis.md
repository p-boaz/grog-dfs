# Type Usage Analysis Report

Generated on: 3/31/2025, 4:28:30 PM

## Summary

- Total interfaces analyzed: 128
- Interfaces with usage mismatches: 75

## Detailed Analysis

### RunProductionStats

Defined in: `lib/mlb/types/analysis/batter.ts`

Properties (11):
- `runs: number`
- `rbi: number`
- `games: number`
- `plateAppearances: number`
- `runsPerGame: number`
- `rbiPerGame: number`
- `onBasePercentage: number`
- `sluggingPct: number`
- `battingAverage: number`
- `runningSpeed: number`
- `battedBallProfile: {
    flyBallPct: number;
    lineDrivePct: number;
    groundBallPct: number;
    hardHitPct: number;
  }`

#### Usage Mismatches

- Extra properties (not in type definition): 111
- Unused properties (defined but not used): 0

**File**: `lib/mlb/dfs-analysis/run-production.ts`

Extra properties:
- `getFullYear`
- `primaryPosition`
- `atBats`
- `seasonStats`
- `gamesPlayed`
- `log`
- `walks`
- `hitByPitches`
- `obp`
- `slg`
- `avg`
- `error`
- `careerStats`
- `length`
- `forEach`
- `season`
- `push`
- `abs`
- `sort`
- `reduce`
- `min`
- `hitting`
- `max`
- `singles`
- `types`
- `doubles`
- `triples`
- `homeRuns`
- `overall`
- `lineups`
- `warn`
- `home`
- `teams`
- `away`
- `id`
- `team`
- `teamStats`
- `toString`
- `inningsPitched`
- `era`
- `whip`
- `round`
- `all`
- `catch`
- `resolve`
- `then`
- `venue`
- `careerRunsPerGame`
- `position`
- `currentTeam`
- `teamOffensiveRating`
- `runPreventionRating`
- `seasonToSeasonVariance`
- `homeBatters`
- `awayBatters`
- `findIndex`
- `probablePitcher`
- `toISOString`
- `abstractGameState`
- `status`
- `gameData`
- `detailedState`
- `codedGameState`
- `name`
- `careerRBIPerGame`
- `expected`
- `confidence`
- `batterId`
- `flyBallPct`
- `lineDrivePct`
- `groundBallPct`
- `hardHitPct`
- `lineupStrength`
- `topOfOrder`
- `bottomOfOrder`
- `runFactor`
- `rbiFactor`
- `isTopOfOrder`
- `isBottomOfOrder`
- `runnersOnBaseFrequency`
- `rbiOpportunities`
- `runScoringOpportunities`
- `gamesStarted`
- `wins`
- `losses`
- `strikeouts`
- `saves`
- `hitBatsmen`
- `runsAllowedPerGame`
- `earnedRunAverage`
- `qualityStartPercentage`
- `runScoringVulnerability`
- `early`
- `middle`
- `late`
- `venueId`
- `ceiling`
- `floor`
- `runFactors`
- `playerSkill`
- `lineupContext`
- `opposingPitcher`
- `ballparkFactor`
- `gamePk`
- `gameDate`
- `statusCode`
- `fullName`
- `rbiFactors`
- `rbis`
- `total`
- `points`

---

### CareerRunProductionProfile

Defined in: `lib/mlb/types/analysis/run-production.ts`

Properties (9):
- `careerRuns: number`
- `careerRBI: number`
- `careerGames: number`
- `careerRunsPerGame: number`
- `careerRBIPerGame: number`
- `bestSeasonRuns: number`
- `bestSeasonRBI: number`
- `recentTrend: "increasing" | "decreasing" | "stable"`
- `seasonToSeasonVariance: number`

#### Usage Mismatches

- Extra properties (not in type definition): 103
- Unused properties (defined but not used): 6

**File**: `lib/mlb/dfs-analysis/run-production.ts`

Extra properties:
- `careerStats`
- `length`
- `forEach`
- `runs`
- `rbi`
- `gamesPlayed`
- `getFullYear`
- `season`
- `push`
- `abs`
- `sort`
- `runsPerGame`
- `rbiPerGame`
- `reduce`
- `min`
- `error`
- `hitting`
- `obp`
- `max`
- `singles`
- `types`
- `doubles`
- `triples`
- `homeRuns`
- `overall`
- `lineups`
- `warn`
- `home`
- `teams`
- `away`
- `id`
- `team`
- `teamStats`
- `toString`
- `seasonStats`
- `inningsPitched`
- `era`
- `whip`
- `round`
- `all`
- `catch`
- `resolve`
- `then`
- `venue`
- `position`
- `currentTeam`
- `teamOffensiveRating`
- `runPreventionRating`
- `homeBatters`
- `awayBatters`
- `findIndex`
- `probablePitcher`
- `toISOString`
- `abstractGameState`
- `status`
- `gameData`
- `detailedState`
- `codedGameState`
- `name`
- `sluggingPct`
- `expected`
- `confidence`
- `batterId`
- `lineupStrength`
- `topOfOrder`
- `bottomOfOrder`
- `runFactor`
- `rbiFactor`
- `isTopOfOrder`
- `isBottomOfOrder`
- `runnersOnBaseFrequency`
- `rbiOpportunities`
- `runScoringOpportunities`
- `gamesStarted`
- `wins`
- `losses`
- `strikeouts`
- `walks`
- `saves`
- `hitBatsmen`
- `runsAllowedPerGame`
- `earnedRunAverage`
- `qualityStartPercentage`
- `runScoringVulnerability`
- `early`
- `middle`
- `late`
- `venueId`
- `ceiling`
- `floor`
- `runFactors`
- `playerSkill`
- `lineupContext`
- `opposingPitcher`
- `ballparkFactor`
- `gamePk`
- `gameDate`
- `statusCode`
- `fullName`
- `rbiFactors`
- `rbis`
- `total`
- `points`

Unused properties:
- `careerRuns`
- `careerRBI`
- `careerGames`
- `bestSeasonRuns`
- `bestSeasonRBI`
- `recentTrend`

---

### TeamOffensiveContext

Defined in: `lib/mlb/types/analysis/run-production.ts`

Properties (4):
- `runsPerGame: number`
- `teamOffensiveRating: number`
- `lineupStrength: {
    overall: number;
    topOfOrder: number;
    bottomOfOrder: number;
  }`
- `runnersOnBaseFrequency: number`

#### Usage Mismatches

- Extra properties (not in type definition): 94
- Unused properties (defined but not used): 0

**File**: `lib/mlb/dfs-analysis/run-production.ts`

Extra properties:
- `getFullYear`
- `hitting`
- `gamesPlayed`
- `runs`
- `obp`
- `min`
- `max`
- `error`
- `singles`
- `types`
- `doubles`
- `triples`
- `homeRuns`
- `overall`
- `lineups`
- `warn`
- `home`
- `teams`
- `away`
- `id`
- `team`
- `teamStats`
- `rbi`
- `toString`
- `seasonStats`
- `inningsPitched`
- `era`
- `whip`
- `round`
- `all`
- `catch`
- `resolve`
- `then`
- `venue`
- `careerRunsPerGame`
- `position`
- `currentTeam`
- `runPreventionRating`
- `seasonToSeasonVariance`
- `homeBatters`
- `awayBatters`
- `findIndex`
- `probablePitcher`
- `toISOString`
- `abstractGameState`
- `status`
- `gameData`
- `detailedState`
- `codedGameState`
- `name`
- `rbiPerGame`
- `careerRBIPerGame`
- `sluggingPct`
- `expected`
- `confidence`
- `topOfOrder`
- `bottomOfOrder`
- `runFactor`
- `rbiFactor`
- `isTopOfOrder`
- `isBottomOfOrder`
- `rbiOpportunities`
- `runScoringOpportunities`
- `gamesStarted`
- `wins`
- `losses`
- `strikeouts`
- `walks`
- `saves`
- `hitBatsmen`
- `runsAllowedPerGame`
- `earnedRunAverage`
- `qualityStartPercentage`
- `runScoringVulnerability`
- `early`
- `middle`
- `late`
- `venueId`
- `season`
- `ceiling`
- `floor`
- `runFactors`
- `playerSkill`
- `lineupContext`
- `opposingPitcher`
- `ballparkFactor`
- `gamePk`
- `gameDate`
- `statusCode`
- `fullName`
- `rbiFactors`
- `rbis`
- `total`
- `points`

---

### LineupContext

Defined in: `lib/mlb/types/analysis/run-production.ts`

Properties (6):
- `position: number`
- `isTopOfOrder: boolean`
- `isBottomOfOrder: boolean`
- `runnersOnBaseFrequency: number`
- `rbiOpportunities: number`
- `runScoringOpportunities: number`

#### Usage Mismatches

- Extra properties (not in type definition): 82
- Unused properties (defined but not used): 0

**File**: `lib/mlb/dfs-analysis/run-production.ts`

Extra properties:
- `lineups`
- `warn`
- `home`
- `teams`
- `away`
- `id`
- `team`
- `teamStats`
- `obp`
- `hitting`
- `runs`
- `gamesPlayed`
- `rbi`
- `getFullYear`
- `toString`
- `seasonStats`
- `inningsPitched`
- `era`
- `whip`
- `round`
- `error`
- `all`
- `catch`
- `resolve`
- `then`
- `venue`
- `runsPerGame`
- `careerRunsPerGame`
- `currentTeam`
- `teamOffensiveRating`
- `runPreventionRating`
- `overall`
- `seasonToSeasonVariance`
- `min`
- `max`
- `homeBatters`
- `awayBatters`
- `findIndex`
- `probablePitcher`
- `toISOString`
- `abstractGameState`
- `status`
- `gameData`
- `detailedState`
- `codedGameState`
- `name`
- `rbiPerGame`
- `careerRBIPerGame`
- `sluggingPct`
- `expected`
- `confidence`
- `gamesStarted`
- `wins`
- `losses`
- `strikeouts`
- `walks`
- `saves`
- `hitBatsmen`
- `runsAllowedPerGame`
- `earnedRunAverage`
- `qualityStartPercentage`
- `runScoringVulnerability`
- `early`
- `middle`
- `late`
- `venueId`
- `season`
- `ceiling`
- `floor`
- `runFactors`
- `playerSkill`
- `lineupContext`
- `opposingPitcher`
- `ballparkFactor`
- `gamePk`
- `gameDate`
- `statusCode`
- `fullName`
- `rbiFactors`
- `rbis`
- `total`
- `points`

---

### PitcherRunAllowance

Defined in: `lib/mlb/types/analysis/run-production.ts`

Properties (5):
- `runsAllowedPerGame: number`
- `earnedRunAverage: number`
- `runPreventionRating: number`
- `qualityStartPercentage: number`
- `runScoringVulnerability: {
    early: number;
    middle: number;
    late: number;
  }`

#### Usage Mismatches

- Extra properties (not in type definition): 73
- Unused properties (defined but not used): 0

**File**: `lib/mlb/dfs-analysis/run-production.ts`

Extra properties:
- `getFullYear`
- `toString`
- `seasonStats`
- `inningsPitched`
- `era`
- `whip`
- `round`
- `error`
- `all`
- `catch`
- `resolve`
- `then`
- `id`
- `venue`
- `runsPerGame`
- `careerRunsPerGame`
- `position`
- `currentTeam`
- `teamOffensiveRating`
- `overall`
- `seasonToSeasonVariance`
- `min`
- `max`
- `lineups`
- `homeBatters`
- `awayBatters`
- `findIndex`
- `probablePitcher`
- `away`
- `teams`
- `home`
- `toISOString`
- `abstractGameState`
- `status`
- `gameData`
- `detailedState`
- `codedGameState`
- `team`
- `name`
- `rbiPerGame`
- `careerRBIPerGame`
- `sluggingPct`
- `expected`
- `confidence`
- `gamesPlayed`
- `gamesStarted`
- `wins`
- `losses`
- `strikeouts`
- `walks`
- `saves`
- `hitBatsmen`
- `early`
- `middle`
- `late`
- `venueId`
- `season`
- `ceiling`
- `floor`
- `runFactors`
- `playerSkill`
- `lineupContext`
- `opposingPitcher`
- `ballparkFactor`
- `gamePk`
- `gameDate`
- `statusCode`
- `fullName`
- `rbiFactors`
- `runs`
- `rbis`
- `total`
- `points`

---

### ExpectedRuns

Defined in: `lib/mlb/types/analysis/run-production.ts`

Properties (5):
- `expected: number`
- `ceiling: number`
- `floor: number`
- `runFactors: {
    playerSkill: number;
    lineupContext: number;
    opposingPitcher: number;
    ballparkFactor: number;
  }`
- `confidence: number`

#### Usage Mismatches

- Extra properties (not in type definition): 53
- Unused properties (defined but not used): 0

**File**: `lib/mlb/dfs-analysis/run-production.ts`

Extra properties:
- `all`
- `catch`
- `resolve`
- `then`
- `id`
- `venue`
- `toString`
- `getFullYear`
- `runsPerGame`
- `careerRunsPerGame`
- `position`
- `currentTeam`
- `teamOffensiveRating`
- `runPreventionRating`
- `overall`
- `seasonToSeasonVariance`
- `min`
- `max`
- `error`
- `lineups`
- `homeBatters`
- `awayBatters`
- `findIndex`
- `probablePitcher`
- `away`
- `teams`
- `home`
- `toISOString`
- `abstractGameState`
- `status`
- `gameData`
- `detailedState`
- `codedGameState`
- `team`
- `name`
- `rbiPerGame`
- `careerRBIPerGame`
- `sluggingPct`
- `venueId`
- `season`
- `playerSkill`
- `lineupContext`
- `opposingPitcher`
- `ballparkFactor`
- `gamePk`
- `gameDate`
- `statusCode`
- `fullName`
- `rbiFactors`
- `runs`
- `rbis`
- `total`
- `points`

---

### ExpectedRBIs

Defined in: `lib/mlb/types/analysis/run-production.ts`

Properties (5):
- `expected: number`
- `ceiling: number`
- `floor: number`
- `rbiFactors: {
    playerSkill: number;
    lineupContext: number;
    opposingPitcher: number;
    ballparkFactor: number;
  }`
- `confidence: number`

#### Usage Mismatches

- Extra properties (not in type definition): 30
- Unused properties (defined but not used): 0

**File**: `lib/mlb/dfs-analysis/run-production.ts`

Extra properties:
- `all`
- `catch`
- `resolve`
- `then`
- `id`
- `venue`
- `toString`
- `getFullYear`
- `rbiPerGame`
- `careerRBIPerGame`
- `position`
- `currentTeam`
- `teamOffensiveRating`
- `runPreventionRating`
- `overall`
- `sluggingPct`
- `seasonToSeasonVariance`
- `min`
- `max`
- `error`
- `venueId`
- `season`
- `playerSkill`
- `lineupContext`
- `opposingPitcher`
- `ballparkFactor`
- `runs`
- `rbis`
- `total`
- `points`

---

### RunProductionAnalysis

Defined in: `lib/mlb/types/analysis/batter.ts`

Properties (3):
- `runs: {
    expected: number;
    points: number;
    confidence: number;
  }`
- `rbis: {
    expected: number;
    points: number;
    confidence: number;
  }`
- `total: {
    expected: number;
    points: number;
    confidence: number;
  }`

#### Usage Mismatches

- Extra properties (not in type definition): 93
- Unused properties (defined but not used): 0

**File**: `lib/mlb/dfs-analysis/batter-analysis.ts`

Extra properties:
- `points`
- `expected`
- `walks`
- `hits`
- `error`
- `toString`
- `startsWith`
- `split`
- `id`
- `isHome`
- `away`
- `pitchers`
- `home`
- `gameId`
- `environment`
- `ballpark`
- `singles`
- `byType`
- `doubles`
- `triples`
- `homeRuns`
- `confidence`
- `name`
- `throwsHand`
- `position`
- `venue`
- `lineupPosition`
- `temperature`
- `windSpeed`
- `windDirection`
- `isOutdoor`
- `overall`
- `types`
- `gamesPlayed`
- `atBats`
- `rbi`
- `avg`
- `obp`
- `slg`
- `ops`
- `stolenBases`
- `caughtStealing`
- `strikeouts`
- `sacrificeFlies`
- `hitByPitches`
- `plateAppearances`
- `wOBA`
- `iso`
- `babip`
- `kRate`
- `bbRate`
- `hrRate`
- `sbRate`
- `expectedPoints`
- `hitProjections`
- `upside`
- `floor`
- `factors`
- `weather`
- `career`
- `batterId`
- `team`
- `opponent`
- `opposingPitcher`
- `stats`
- `matchup`
- `projections`
- `draftKings`
- `seasonStats`
- `quality`
- `advantageScore`
- `platoonAdvantage`
- `historicalStats`
- `homeRunProbability`
- `stolenBaseProbability`
- `expectedHits`
- `dfsProjection`
- `breakdown`
- `platoon`
- `temperatureFactor`
- `windFactor`
- `overallFactor`
- `byHitType`
- `draftKingsId`
- `salary`
- `positions`
- `avgPointsPerGame`
- `battedBallQuality`
- `power`
- `contactRate`
- `plateApproach`
- `speed`
- `consistency`

---

### BatterAnalysis

Defined in: `lib/mlb/types/analysis/batter.ts`

Properties (14):
- `batterId: number`
- `name: string`
- `team: string`
- `opponent: string`
- `opposingPitcher: {
    id: number;
    name: string;
    throwsHand: string;
  }`
- `position: string`
- `gameId: number`
- `venue: string`
- `stats: {
    seasonStats: {
      "2024": SeasonStats;
      "2025": SeasonStats;
    };
    quality: BatterQualityMetrics;
  }`
- `matchup: {
    advantageScore: number;
    platoonAdvantage: boolean;
    historicalStats: {
      atBats: number;
      hits: number;
      avg: number;
      homeRuns: number;
      ops: number;
    };
  }`
- `projections: {
    homeRunProbability: number;
    stolenBaseProbability: number;
    expectedHits: {
      total: number;
      singles: number;
      doubles: number;
      triples: number;
      homeRuns: number;
      confidence: number;
    };
    dfsProjection: {
      expectedPoints: number;
      upside: number;
      floor: number;
      breakdown: {
        hits: number;
        singles: number;
        doubles: number;
        triples: number;
        homeRuns: number;
        runs: number;
        rbi: number;
        stolenBases: number;
        walks: number;
      };
    };
  }`
- `lineupPosition: number`
- `factors: {
    weather: {
      temperature: number;
      windSpeed: number;
      windDirection: string;
      isOutdoor: boolean;
      temperatureFactor: number;
      windFactor: number;
      overallFactor: number;
      byHitType: {
        singles: number;
        doubles: number;
        triples: number;
        homeRuns: number;
      };
    };
    ballpark: {
      overall: number;
      singles: number;
      doubles: number;
      triples: number;
      homeRuns: number;
      runs: number;
    };
    platoon: boolean;
    career: any;
  }`
- `draftKings: {
    draftKingsId: number | null;
    salary: number | null;
    positions: string[];
    avgPointsPerGame: number;
  }`

#### Usage Mismatches

- Extra properties (not in type definition): 100
- Unused properties (defined but not used): 0

**File**: `lib/mlb/dfs-analysis/batter-analysis.ts`

Extra properties:
- `error`
- `map`
- `push`
- `id`
- `sort`
- `expectedPoints`
- `dfsProjection`
- `isHome`
- `homeTeam`
- `awayTeam`
- `catch`
- `away`
- `pitchers`
- `throwsHand`
- `toString`
- `temperature`
- `environment`
- `windSpeed`
- `windDirection`
- `isOutdoor`
- `overall`
- `ballpark`
- `singles`
- `types`
- `doubles`
- `triples`
- `homeRuns`
- `runs`
- `gamesPlayed`
- `seasonStats`
- `atBats`
- `hits`
- `rbi`
- `avg`
- `obp`
- `slg`
- `ops`
- `stolenBases`
- `caughtStealing`
- `walks`
- `strikeouts`
- `sacrificeFlies`
- `hitByPitches`
- `plateAppearances`
- `wOBAvsL`
- `wOBAvsR`
- `wOBA`
- `iso`
- `babip`
- `kRate`
- `bbRate`
- `hrRate`
- `sbRate`
- `batSide`
- `home`
- `awayCatcher`
- `lineups`
- `homeCatcher`
- `probability`
- `fullName`
- `platoon`
- `temperatureFactor`
- `weather`
- `windFactor`
- `wind`
- `overallFactor`
- `weatherOverall`
- `advantageScore`
- `hitProjections`
- `total`
- `expected`
- `rbis`
- `dkPlayerId`
- `salary`
- `avgPointsPerGame`
- `quality`
- `points`
- `startsWith`
- `split`
- `byType`
- `confidence`
- `season`
- `platoonAdvantage`
- `historicalStats`
- `homeRunProbability`
- `stolenBaseProbability`
- `expectedHits`
- `upside`
- `floor`
- `breakdown`
- `career`
- `byHitType`
- `draftKingsId`
- `positions`
- `battedBallQuality`
- `power`
- `contactRate`
- `plateApproach`
- `speed`
- `consistency`

---

### BatterQualityMetrics

Defined in: `lib/mlb/types/analysis/batter.ts`

Properties (6):
- `battedBallQuality: number`
- `power: number`
- `contactRate: number`
- `plateApproach: number`
- `speed: number`
- `consistency: number`

#### Usage Mismatches

- Extra properties (not in type definition): 14
- Unused properties (defined but not used): 0

**File**: `lib/mlb/dfs-analysis/quality-metrics.ts`

Extra properties:
- `babip`
- `iso`
- `hrRate`
- `kRate`
- `avg`
- `bbRate`
- `obp`
- `sbRate`
- `triples`
- `gamesPlayed`
- `error`
- `min`
- `max`
- `round`

---

### HitProjection

Defined in: `lib/mlb/types/analysis/batter.ts`

Properties (10):
- `singles: number`
- `doubles: number`
- `triples: number`
- `homeRuns: number`
- `walks: number`
- `hitByPitch: number`
- `stolenBases: number`
- `expectedPoints: number`
- `total: number`
- `confidence: number`

#### Usage Mismatches

- Extra properties (not in type definition): 85
- Unused properties (defined but not used): 6

**File**: `lib/mlb/dfs-analysis/batter-analysis.ts`

Extra properties:
- `error`
- `id`
- `name`
- `away`
- `pitchers`
- `throwsHand`
- `position`
- `toString`
- `gameId`
- `venue`
- `lineupPosition`
- `temperature`
- `environment`
- `windSpeed`
- `windDirection`
- `isOutdoor`
- `overall`
- `ballpark`
- `types`
- `runs`
- `byType`
- `factors`
- `expected`
- `points`
- `weather`
- `career`
- `gamesPlayed`
- `atBats`
- `hits`
- `rbi`
- `avg`
- `obp`
- `slg`
- `ops`
- `caughtStealing`
- `strikeouts`
- `sacrificeFlies`
- `hitByPitches`
- `plateAppearances`
- `batterId`
- `team`
- `opponent`
- `opposingPitcher`
- `stats`
- `matchup`
- `projections`
- `draftKings`
- `seasonStats`
- `quality`
- `advantageScore`
- `platoonAdvantage`
- `historicalStats`
- `homeRunProbability`
- `stolenBaseProbability`
- `expectedHits`
- `dfsProjection`
- `upside`
- `floor`
- `breakdown`
- `platoon`
- `temperatureFactor`
- `windFactor`
- `overallFactor`
- `byHitType`
- `draftKingsId`
- `salary`
- `positions`
- `avgPointsPerGame`
- `battedBallQuality`
- `power`
- `contactRate`
- `plateApproach`
- `speed`
- `consistency`

Unused properties:
- `hitByPitch`

**File**: `lib/mlb/dfs-analysis/hits.ts`

Extra properties:
- `error`
- `SINGLE`
- `DOUBLE`
- `TRIPLE`
- `HOME_RUN`
- `byType`
- `totalHitPoints`
- `expected`
- `points`
- `expectedHits`
- `atBats`

Unused properties:
- `walks`
- `hitByPitch`
- `stolenBases`
- `expectedPoints`
- `total`

---

### DetailedHitProjection

Defined in: `lib/mlb/types/analysis/events.ts`

Properties (5):
- `expectedHits: number`
- `byType: {
    singles: {
      expected: number;
      points: number;
    };
    doubles: {
      expected: number;
      points: number;
    };
    triples: {
      expected: number;
      points: number;
    };
    homeRuns: {
      expected: number;
      points: number;
    };
  }`
- `totalHitPoints: number`
- `atBats: number`
- `confidence: number`

#### Usage Mismatches

- Extra properties (not in type definition): 90
- Unused properties (defined but not used): 1

**File**: `lib/mlb/dfs-analysis/batter-analysis.ts`

Extra properties:
- `error`
- `id`
- `name`
- `away`
- `pitchers`
- `throwsHand`
- `position`
- `toString`
- `gameId`
- `venue`
- `lineupPosition`
- `temperature`
- `environment`
- `windSpeed`
- `windDirection`
- `isOutdoor`
- `overall`
- `ballpark`
- `singles`
- `types`
- `doubles`
- `triples`
- `homeRuns`
- `runs`
- `total`
- `factors`
- `expected`
- `points`
- `weather`
- `career`
- `gamesPlayed`
- `hits`
- `rbi`
- `avg`
- `obp`
- `slg`
- `ops`
- `stolenBases`
- `caughtStealing`
- `walks`
- `strikeouts`
- `sacrificeFlies`
- `hitByPitches`
- `plateAppearances`
- `batterId`
- `team`
- `opponent`
- `opposingPitcher`
- `stats`
- `matchup`
- `projections`
- `draftKings`
- `seasonStats`
- `quality`
- `advantageScore`
- `platoonAdvantage`
- `historicalStats`
- `homeRunProbability`
- `stolenBaseProbability`
- `dfsProjection`
- `expectedPoints`
- `upside`
- `floor`
- `breakdown`
- `platoon`
- `temperatureFactor`
- `windFactor`
- `overallFactor`
- `byHitType`
- `draftKingsId`
- `salary`
- `positions`
- `avgPointsPerGame`
- `battedBallQuality`
- `power`
- `contactRate`
- `plateApproach`
- `speed`
- `consistency`

Unused properties:
- `totalHitPoints`

**File**: `lib/mlb/dfs-analysis/hits.ts`

Extra properties:
- `error`
- `SINGLE`
- `DOUBLE`
- `TRIPLE`
- `HOME_RUN`
- `singles`
- `doubles`
- `triples`
- `homeRuns`
- `expected`
- `points`

---

### DetailedHitProjections

Defined in: `lib/mlb/types/analysis/batter.ts`

Properties (4):
- `total: number`
- `byType: {
    singles: { expected: number; points: number };
    doubles: { expected: number; points: number };
    triples: { expected: number; points: number };
    homeRuns: { expected: number; points: number };
  }`
- `confidence: number`
- `factors: {
    weather: any;
    ballpark: any;
    career: any;
  }`

#### Usage Mismatches

- Extra properties (not in type definition): 79
- Unused properties (defined but not used): 0

**File**: `lib/mlb/dfs-analysis/batter-analysis.ts`

Extra properties:
- `error`
- `id`
- `name`
- `away`
- `pitchers`
- `throwsHand`
- `position`
- `toString`
- `gameId`
- `venue`
- `lineupPosition`
- `temperature`
- `environment`
- `windSpeed`
- `windDirection`
- `isOutdoor`
- `overall`
- `ballpark`
- `singles`
- `types`
- `doubles`
- `triples`
- `homeRuns`
- `runs`
- `expected`
- `points`
- `weather`
- `career`
- `gamesPlayed`
- `atBats`
- `hits`
- `rbi`
- `avg`
- `obp`
- `slg`
- `ops`
- `stolenBases`
- `caughtStealing`
- `walks`
- `strikeouts`
- `sacrificeFlies`
- `hitByPitches`
- `plateAppearances`
- `batterId`
- `team`
- `opponent`
- `opposingPitcher`
- `stats`
- `matchup`
- `projections`
- `draftKings`
- `seasonStats`
- `quality`
- `advantageScore`
- `platoonAdvantage`
- `historicalStats`
- `homeRunProbability`
- `stolenBaseProbability`
- `expectedHits`
- `dfsProjection`
- `expectedPoints`
- `upside`
- `floor`
- `breakdown`
- `platoon`
- `temperatureFactor`
- `windFactor`
- `overallFactor`
- `byHitType`
- `draftKingsId`
- `salary`
- `positions`
- `avgPointsPerGame`
- `battedBallQuality`
- `power`
- `contactRate`
- `plateApproach`
- `speed`
- `consistency`

---

### Projections

Defined in: `lib/mlb/types/analysis/batter.ts`

Properties (6):
- `runs: number`
- `rbi: number`
- `expectedPoints: number`
- `hitProjections: {
    total: number;
    singles: number;
    doubles: number;
    triples: number;
    homeRuns: number;
    confidence: number;
  }`
- `upside: number`
- `floor: number`

#### Usage Mismatches

- Extra properties (not in type definition): 80
- Unused properties (defined but not used): 0

**File**: `lib/mlb/dfs-analysis/batter-analysis.ts`

Extra properties:
- `id`
- `isHome`
- `away`
- `pitchers`
- `home`
- `toString`
- `gameId`
- `environment`
- `ballpark`
- `total`
- `expected`
- `singles`
- `byType`
- `doubles`
- `triples`
- `homeRuns`
- `confidence`
- `error`
- `name`
- `throwsHand`
- `position`
- `venue`
- `lineupPosition`
- `temperature`
- `windSpeed`
- `windDirection`
- `isOutdoor`
- `overall`
- `types`
- `factors`
- `points`
- `weather`
- `career`
- `gamesPlayed`
- `atBats`
- `hits`
- `avg`
- `obp`
- `slg`
- `ops`
- `stolenBases`
- `caughtStealing`
- `walks`
- `strikeouts`
- `sacrificeFlies`
- `hitByPitches`
- `plateAppearances`
- `batterId`
- `team`
- `opponent`
- `opposingPitcher`
- `stats`
- `matchup`
- `projections`
- `draftKings`
- `seasonStats`
- `quality`
- `advantageScore`
- `platoonAdvantage`
- `historicalStats`
- `homeRunProbability`
- `stolenBaseProbability`
- `expectedHits`
- `dfsProjection`
- `breakdown`
- `platoon`
- `temperatureFactor`
- `windFactor`
- `overallFactor`
- `byHitType`
- `draftKingsId`
- `salary`
- `positions`
- `avgPointsPerGame`
- `battedBallQuality`
- `power`
- `contactRate`
- `plateApproach`
- `speed`
- `consistency`

---

### BatterInfo

Defined in: `lib/mlb/types/analysis/batter.ts`

Properties (6):
- `id: number`
- `name: string`
- `position: string`
- `lineupPosition: number`
- `isHome: boolean`
- `opposingPitcher: {
    id: number;
    name: string;
    throwsHand: string;
  }`

#### Usage Mismatches

- Extra properties (not in type definition): 108
- Unused properties (defined but not used): 0

**File**: `lib/mlb/dfs-analysis/batter-analysis.ts`

Extra properties:
- `error`
- `map`
- `push`
- `sort`
- `expectedPoints`
- `dfsProjection`
- `projections`
- `homeTeam`
- `awayTeam`
- `catch`
- `away`
- `pitchers`
- `throwsHand`
- `toString`
- `gameId`
- `venue`
- `temperature`
- `environment`
- `windSpeed`
- `windDirection`
- `isOutdoor`
- `overall`
- `ballpark`
- `singles`
- `types`
- `doubles`
- `triples`
- `homeRuns`
- `runs`
- `gamesPlayed`
- `seasonStats`
- `atBats`
- `hits`
- `rbi`
- `avg`
- `obp`
- `slg`
- `ops`
- `stolenBases`
- `caughtStealing`
- `walks`
- `strikeouts`
- `sacrificeFlies`
- `hitByPitches`
- `plateAppearances`
- `wOBAvsL`
- `wOBAvsR`
- `wOBA`
- `iso`
- `babip`
- `kRate`
- `bbRate`
- `hrRate`
- `sbRate`
- `batSide`
- `home`
- `awayCatcher`
- `lineups`
- `homeCatcher`
- `probability`
- `fullName`
- `platoon`
- `factors`
- `temperatureFactor`
- `weather`
- `windFactor`
- `wind`
- `overallFactor`
- `weatherOverall`
- `matchup`
- `advantageScore`
- `hitProjections`
- `total`
- `expected`
- `rbis`
- `draftKings`
- `dkPlayerId`
- `salary`
- `avgPointsPerGame`
- `quality`
- `stats`
- `points`
- `startsWith`
- `split`
- `byType`
- `confidence`
- `batterId`
- `season`
- `team`
- `opponent`
- `platoonAdvantage`
- `historicalStats`
- `homeRunProbability`
- `stolenBaseProbability`
- `expectedHits`
- `upside`
- `floor`
- `breakdown`
- `career`
- `byHitType`
- `draftKingsId`
- `positions`
- `battedBallQuality`
- `power`
- `contactRate`
- `plateApproach`
- `speed`
- `consistency`

---

### GameInfo

Defined in: `lib/mlb/types/analysis/batter.ts`

Properties (8):
- `gameId: number`
- `venue: {
    id: number;
    name: string;
  }`
- `homeTeam: {
    name: string;
  }`
- `awayTeam: {
    name: string;
  }`
- `environment: {
    temperature: number;
    windSpeed: number;
    windDirection: string;
    isOutdoor: boolean;
  }`
- `ballpark: {
    overall: number;
    types: {
      homeRuns: number;
      runs: number;
    };
  }`
- `lineups: {
    homeCatcher?: { id: number };
    awayCatcher?: { id: number };
  }`
- `pitchers: {
    away: {
      id: number;
      name: string;
      throwsHand: string;
    };
    home: {
      id: number;
      name: string;
      throwsHand: string;
    };
  }`

#### Usage Mismatches

- Extra properties (not in type definition): 103
- Unused properties (defined but not used): 0

**File**: `lib/mlb/dfs-analysis/batter-analysis.ts`

Extra properties:
- `isHome`
- `catch`
- `id`
- `name`
- `away`
- `throwsHand`
- `position`
- `toString`
- `lineupPosition`
- `temperature`
- `windSpeed`
- `windDirection`
- `isOutdoor`
- `overall`
- `singles`
- `types`
- `doubles`
- `triples`
- `homeRuns`
- `runs`
- `gamesPlayed`
- `seasonStats`
- `atBats`
- `hits`
- `rbi`
- `avg`
- `obp`
- `slg`
- `ops`
- `stolenBases`
- `caughtStealing`
- `walks`
- `strikeouts`
- `sacrificeFlies`
- `hitByPitches`
- `plateAppearances`
- `wOBAvsL`
- `wOBAvsR`
- `wOBA`
- `iso`
- `babip`
- `kRate`
- `bbRate`
- `hrRate`
- `sbRate`
- `batSide`
- `home`
- `awayCatcher`
- `homeCatcher`
- `probability`
- `fullName`
- `platoon`
- `factors`
- `temperatureFactor`
- `weather`
- `windFactor`
- `wind`
- `overallFactor`
- `weatherOverall`
- `matchup`
- `advantageScore`
- `projections`
- `hitProjections`
- `total`
- `expected`
- `rbis`
- `draftKings`
- `dkPlayerId`
- `salary`
- `avgPointsPerGame`
- `quality`
- `stats`
- `error`
- `points`
- `startsWith`
- `split`
- `byType`
- `confidence`
- `batterId`
- `season`
- `team`
- `opponent`
- `opposingPitcher`
- `platoonAdvantage`
- `historicalStats`
- `homeRunProbability`
- `stolenBaseProbability`
- `expectedHits`
- `dfsProjection`
- `expectedPoints`
- `upside`
- `floor`
- `breakdown`
- `career`
- `byHitType`
- `draftKingsId`
- `positions`
- `battedBallQuality`
- `power`
- `contactRate`
- `plateApproach`
- `speed`
- `consistency`

---

### HomeRunAnalysis

Defined in: `lib/mlb/types/analysis/events.ts`

Properties (5):
- `expectedHomeRuns: number`
- `homeRunProbability: number`
- `multipleHRProbability: number`
- `factors: {
    batterPower: number; // 0-10 scale
    pitcherVulnerability: number; // 0-10 scale
    ballparkFactor: number; // 0-10 scale
    weatherFactor: number; // 0-10 scale
    recentForm: number; // 0-10 scale
  }`
- `confidence: number`

#### Usage Mismatches

- Extra properties (not in type definition): 35
- Unused properties (defined but not used): 1

**File**: `lib/mlb/dfs-analysis/home-runs.ts`

Extra properties:
- `all`
- `toString`
- `getFullYear`
- `barrelRate`
- `homeRunRate`
- `hardHitPct`
- `homeRunVulnerability`
- `hardHitPercent`
- `types`
- `homeRuns`
- `isOutdoor`
- `temperature`
- `windSpeed`
- `windDirection`
- `toLowerCase`
- `includes`
- `homeFieldAdvantage`
- `homeVsAway`
- `batterProfile`
- `pitcherVulnerability`
- `ballpark`
- `weather`
- `platoonAdvantage`
- `max`
- `min`
- `error`
- `venueId`
- `season`
- `gamePk`
- `probability`
- `batterPower`
- `ballparkFactor`
- `weatherFactor`
- `recentForm`
- `expectedValue`

Unused properties:
- `multipleHRProbability`

---

### StolenBaseAnalysis

Defined in: `lib/mlb/types/analysis/events.ts`

Properties (5):
- `expectedSteals: number`
- `stealAttemptProbability: number`
- `stealSuccessProbability: number`
- `factors: {
    batterSpeed: number; // 0-10 scale
    batterTendency: number; // 0-10 scale
    catcherDefense: number; // 0-10 scale
    pitcherHoldRate: number; // 0-10 scale
    gameScriptFactor: number; // 0-10 scale
  }`
- `confidence: number`

#### Usage Mismatches

- Extra properties (not in type definition): 48
- Unused properties (defined but not used): 0

**File**: `lib/mlb/dfs-analysis/stolen-bases.ts`

Extra properties:
- `currentTeam`
- `id`
- `team`
- `home`
- `teams`
- `gameData`
- `players`
- `boxscore`
- `liveData`
- `entries`
- `code`
- `position`
- `person`
- `warn`
- `all`
- `sprintSpeed`
- `runningMetrics`
- `min`
- `max`
- `stolenBaseRate`
- `stolenBaseSuccess`
- `sprintSpeedPercentile`
- `round`
- `defensiveRating`
- `popTime`
- `slideStepTime`
- `holdRating`
- `precipitation`
- `temperature`
- `batter`
- `catcher`
- `pitcher`
- `context`
- `careerRate`
- `recentTrend`
- `attemptLikelihood`
- `successRateProjection`
- `error`
- `probability`
- `batterSpeed`
- `batterTendency`
- `catcherDefense`
- `pitcherHoldRate`
- `gameScriptFactor`
- `batterProfile`
- `pitcherHold`
- `gameContext`
- `expectedValue`

---

### PlayerHitStats

Defined in: `lib/mlb/types/analysis/hits.ts`

Properties (6):
- `avg: number`
- `obp: number`
- `slg: number`
- `ops: number`
- `iso: number`
- `babip: number`

#### Usage Mismatches

- Extra properties (not in type definition): 98
- Unused properties (defined but not used): 2

**File**: `lib/mlb/dfs-analysis/hits.ts`

Extra properties:
- `getFullYear`
- `primaryPosition`
- `seasonStats`
- `atBats`
- `gamesPlayed`
- `log`
- `hits`
- `homeRuns`
- `doubles`
- `triples`
- `strikeouts`
- `max`
- `error`
- `careerStats`
- `length`
- `forEach`
- `season`
- `push`
- `sort`
- `toString`
- `overall`
- `singles`
- `types`
- `runs`
- `rHB`
- `handedness`
- `lHB`
- `temperature`
- `windSpeed`
- `windDirection`
- `isOutdoor`
- `inningsPitched`
- `whip`
- `walks`
- `round`
- `homeRunsAllowed`
- `gamesStarted`
- `min`
- `all`
- `batSide`
- `catch`
- `then`
- `id`
- `venue`
- `currentTeam`
- `battingAverage`
- `advantage`
- `hitVulnerability`
- `platoonAdvantage`
- `byHitType`
- `singleRate`
- `doubleRate`
- `tripleRate`
- `SINGLE`
- `DOUBLE`
- `TRIPLE`
- `HOME_RUN`
- `single`
- `hitTypeRates`
- `double`
- `triple`
- `homeRun`
- `factors`
- `matchup`
- `pitcher`
- `platoon`
- `batterId`
- `rbi`
- `stolenBases`
- `caughtStealing`
- `onBasePercentage`
- `sluggingPct`
- `games`
- `lineDriverRate`
- `contactRate`
- `singlePct`
- `doublePct`
- `triplePct`
- `homeRunPct`
- `homeVsAway`
- `homeAdvantage`
- `runFactor`
- `rbiFactor`
- `byHandedness`
- `vsLeft`
- `vsRight`
- `platoonSplit`
- `expectedBA`
- `playerBaseline`
- `ballpark`
- `weather`
- `homeAway`
- `expectedHits`
- `byType`
- `totalHitPoints`
- `confidence`
- `expected`
- `points`

Unused properties:
- `iso`
- `babip`

---

### CareerHitProfile

Defined in: `lib/mlb/types/analysis/hits.ts`

Properties (5):
- `careerAvg: number`
- `careerIso: number`
- `recentTrend: "increasing" | "decreasing" | "stable"`
- `consistencyRating: number`
- `advantageVsHandedness: number`

#### Usage Mismatches

- Extra properties (not in type definition): 95
- Unused properties (defined but not used): 5

**File**: `lib/mlb/dfs-analysis/hits.ts`

Extra properties:
- `careerStats`
- `length`
- `forEach`
- `hits`
- `gamesPlayed`
- `atBats`
- `homeRuns`
- `doubles`
- `triples`
- `avg`
- `getFullYear`
- `season`
- `push`
- `sort`
- `error`
- `toString`
- `overall`
- `singles`
- `types`
- `runs`
- `rHB`
- `handedness`
- `lHB`
- `temperature`
- `windSpeed`
- `windDirection`
- `isOutdoor`
- `primaryPosition`
- `seasonStats`
- `inningsPitched`
- `whip`
- `walks`
- `round`
- `homeRunsAllowed`
- `strikeouts`
- `max`
- `gamesStarted`
- `min`
- `all`
- `obp`
- `slg`
- `ops`
- `batSide`
- `catch`
- `then`
- `id`
- `venue`
- `currentTeam`
- `battingAverage`
- `advantage`
- `hitVulnerability`
- `platoonAdvantage`
- `byHitType`
- `singleRate`
- `doubleRate`
- `tripleRate`
- `SINGLE`
- `DOUBLE`
- `TRIPLE`
- `HOME_RUN`
- `single`
- `hitTypeRates`
- `double`
- `triple`
- `homeRun`
- `factors`
- `matchup`
- `pitcher`
- `platoon`
- `batterId`
- `singlePct`
- `doublePct`
- `triplePct`
- `homeRunPct`
- `homeVsAway`
- `homeAdvantage`
- `runFactor`
- `rbiFactor`
- `byHandedness`
- `onBasePercentage`
- `sluggingPct`
- `vsLeft`
- `vsRight`
- `platoonSplit`
- `expectedBA`
- `playerBaseline`
- `ballpark`
- `weather`
- `homeAway`
- `expectedHits`
- `byType`
- `totalHitPoints`
- `confidence`
- `expected`
- `points`

Unused properties:
- `careerAvg`
- `careerIso`
- `recentTrend`
- `consistencyRating`
- `advantageVsHandedness`

---

### BallparkHitFactor

Defined in: `lib/mlb/types/environment/ballpark.ts`

Properties (7):
- `singles: number`
- `doubles: number`
- `triples: number`
- `homeRuns: number`
- `runFactor: number`
- `overall: number`
- `rbiFactor: number`

#### Usage Mismatches

- Extra properties (not in type definition): 162
- Unused properties (defined but not used): 0

**File**: `lib/mlb/dfs-analysis/hits.ts`

Extra properties:
- `toString`
- `getFullYear`
- `types`
- `runs`
- `rHB`
- `handedness`
- `lHB`
- `error`
- `temperature`
- `windSpeed`
- `windDirection`
- `isOutdoor`
- `primaryPosition`
- `seasonStats`
- `inningsPitched`
- `whip`
- `walks`
- `round`
- `homeRunsAllowed`
- `strikeouts`
- `max`
- `gamesStarted`
- `min`
- `all`
- `atBats`
- `hits`
- `avg`
- `obp`
- `slg`
- `ops`
- `batSide`
- `catch`
- `then`
- `id`
- `venue`
- `currentTeam`
- `battingAverage`
- `advantage`
- `hitVulnerability`
- `platoonAdvantage`
- `byHitType`
- `singleRate`
- `doubleRate`
- `tripleRate`
- `SINGLE`
- `DOUBLE`
- `TRIPLE`
- `HOME_RUN`
- `single`
- `hitTypeRates`
- `double`
- `triple`
- `homeRun`
- `factors`
- `matchup`
- `pitcher`
- `platoon`
- `byHandedness`
- `onBasePercentage`
- `sluggingPct`
- `vsLeft`
- `vsRight`
- `platoonSplit`
- `expectedBA`
- `playerBaseline`
- `ballpark`
- `weather`
- `homeAway`
- `expectedHits`
- `byType`
- `totalHitPoints`
- `confidence`
- `expected`
- `points`

**File**: `lib/mlb/dfs-analysis/run-production.ts`

Extra properties:
- `types`
- `runs`
- `lineups`
- `warn`
- `home`
- `teams`
- `away`
- `id`
- `team`
- `teamStats`
- `obp`
- `hitting`
- `gamesPlayed`
- `rbi`
- `getFullYear`
- `toString`
- `seasonStats`
- `inningsPitched`
- `era`
- `whip`
- `round`
- `error`
- `all`
- `catch`
- `resolve`
- `then`
- `venue`
- `runsPerGame`
- `careerRunsPerGame`
- `position`
- `currentTeam`
- `teamOffensiveRating`
- `runPreventionRating`
- `seasonToSeasonVariance`
- `min`
- `max`
- `homeBatters`
- `awayBatters`
- `findIndex`
- `probablePitcher`
- `toISOString`
- `abstractGameState`
- `status`
- `gameData`
- `detailedState`
- `codedGameState`
- `name`
- `rbiPerGame`
- `careerRBIPerGame`
- `sluggingPct`
- `expected`
- `confidence`
- `isTopOfOrder`
- `isBottomOfOrder`
- `runnersOnBaseFrequency`
- `rbiOpportunities`
- `runScoringOpportunities`
- `gamesStarted`
- `wins`
- `losses`
- `strikeouts`
- `walks`
- `saves`
- `hitBatsmen`
- `runsAllowedPerGame`
- `earnedRunAverage`
- `qualityStartPercentage`
- `runScoringVulnerability`
- `early`
- `middle`
- `late`
- `venueId`
- `season`
- `ceiling`
- `floor`
- `runFactors`
- `playerSkill`
- `lineupContext`
- `opposingPitcher`
- `ballparkFactor`
- `gamePk`
- `gameDate`
- `statusCode`
- `fullName`
- `rbiFactors`
- `rbis`
- `total`
- `points`

---

### WeatherHitImpact

Defined in: `lib/mlb/types/analysis/hits.ts`

Properties (4):
- `temperature: number`
- `wind: number`
- `overall: number`
- `byType: {
    singles: number;
    doubles: number;
    triples: number;
    homeRuns: number;
  }`

#### Usage Mismatches

- Extra properties (not in type definition): 70
- Unused properties (defined but not used): 2

**File**: `lib/mlb/dfs-analysis/hits.ts`

Extra properties:
- `windSpeed`
- `windDirection`
- `isOutdoor`
- `error`
- `getFullYear`
- `primaryPosition`
- `seasonStats`
- `inningsPitched`
- `toString`
- `whip`
- `walks`
- `round`
- `homeRunsAllowed`
- `strikeouts`
- `max`
- `gamesStarted`
- `min`
- `all`
- `atBats`
- `hits`
- `homeRuns`
- `doubles`
- `triples`
- `avg`
- `obp`
- `slg`
- `ops`
- `batSide`
- `catch`
- `then`
- `id`
- `venue`
- `currentTeam`
- `battingAverage`
- `advantage`
- `hitVulnerability`
- `platoonAdvantage`
- `byHitType`
- `singleRate`
- `doubleRate`
- `tripleRate`
- `SINGLE`
- `DOUBLE`
- `TRIPLE`
- `HOME_RUN`
- `single`
- `hitTypeRates`
- `double`
- `triple`
- `homeRun`
- `factors`
- `matchup`
- `pitcher`
- `platoon`
- `singles`
- `onBasePercentage`
- `sluggingPct`
- `vsLeft`
- `vsRight`
- `platoonSplit`
- `expectedBA`
- `playerBaseline`
- `ballpark`
- `weather`
- `homeAway`
- `expectedHits`
- `totalHitPoints`
- `confidence`
- `expected`
- `points`

Unused properties:
- `wind`
- `overall`

---

### PitcherHitVulnerability

Defined in: `lib/mlb/types/analysis/hits.ts`

Properties (3):
- `contactAllowed: number`
- `hardHitAllowed: number`
- `byType: {
    singles: number;
    doubles: number;
    triples: number;
    homeRuns: number;
  }`

#### Usage Mismatches

- Extra properties (not in type definition): 67
- Unused properties (defined but not used): 2

**File**: `lib/mlb/dfs-analysis/hits.ts`

Extra properties:
- `getFullYear`
- `primaryPosition`
- `seasonStats`
- `inningsPitched`
- `toString`
- `whip`
- `walks`
- `round`
- `homeRunsAllowed`
- `strikeouts`
- `max`
- `gamesStarted`
- `min`
- `error`
- `all`
- `atBats`
- `hits`
- `homeRuns`
- `doubles`
- `triples`
- `avg`
- `obp`
- `slg`
- `ops`
- `batSide`
- `catch`
- `then`
- `id`
- `venue`
- `currentTeam`
- `battingAverage`
- `advantage`
- `hitVulnerability`
- `platoonAdvantage`
- `byHitType`
- `singleRate`
- `doubleRate`
- `tripleRate`
- `SINGLE`
- `DOUBLE`
- `TRIPLE`
- `HOME_RUN`
- `single`
- `hitTypeRates`
- `double`
- `triple`
- `homeRun`
- `factors`
- `matchup`
- `pitcher`
- `platoon`
- `singles`
- `onBasePercentage`
- `sluggingPct`
- `vsLeft`
- `vsRight`
- `platoonSplit`
- `expectedBA`
- `playerBaseline`
- `ballpark`
- `weather`
- `homeAway`
- `expectedHits`
- `totalHitPoints`
- `confidence`
- `expected`
- `points`

Unused properties:
- `contactAllowed`
- `hardHitAllowed`

---

### MatchupHitStats

Defined in: `lib/mlb/types/analysis/hits.ts`

Properties (6):
- `atBats: number`
- `hits: number`
- `extraBaseHits: number`
- `homeRuns: number`
- `avg: number`
- `ops: number`

#### Usage Mismatches

- Extra properties (not in type definition): 53
- Unused properties (defined but not used): 1

**File**: `lib/mlb/dfs-analysis/hits.ts`

Extra properties:
- `all`
- `seasonStats`
- `doubles`
- `triples`
- `error`
- `obp`
- `slg`
- `batSide`
- `catch`
- `then`
- `id`
- `venue`
- `currentTeam`
- `battingAverage`
- `advantage`
- `hitVulnerability`
- `platoonAdvantage`
- `byHitType`
- `singleRate`
- `doubleRate`
- `tripleRate`
- `SINGLE`
- `DOUBLE`
- `TRIPLE`
- `HOME_RUN`
- `single`
- `hitTypeRates`
- `double`
- `triple`
- `homeRun`
- `factors`
- `matchup`
- `pitcher`
- `platoon`
- `max`
- `min`
- `onBasePercentage`
- `sluggingPct`
- `vsLeft`
- `vsRight`
- `platoonSplit`
- `singles`
- `expectedBA`
- `playerBaseline`
- `ballpark`
- `weather`
- `homeAway`
- `expectedHits`
- `byType`
- `totalHitPoints`
- `confidence`
- `expected`
- `points`

Unused properties:
- `extraBaseHits`

---

### BatterPlatoonSplits

Defined in: `lib/mlb/types/analysis/hits.ts`

Properties (2):
- `vsLeft: {
    avg: number;
    ops: number;
    wOBA: number;
  }`
- `vsRight: {
    avg: number;
    ops: number;
    wOBA: number;
  }`

#### Usage Mismatches

- Extra properties (not in type definition): 55
- Unused properties (defined but not used): 0

**File**: `lib/mlb/dfs-analysis/hits.ts`

Extra properties:
- `avg`
- `seasonStats`
- `obp`
- `slg`
- `ops`
- `atBats`
- `batSide`
- `error`
- `all`
- `catch`
- `then`
- `id`
- `venue`
- `currentTeam`
- `battingAverage`
- `advantage`
- `hitVulnerability`
- `platoonAdvantage`
- `byHitType`
- `singleRate`
- `doubleRate`
- `tripleRate`
- `SINGLE`
- `DOUBLE`
- `TRIPLE`
- `HOME_RUN`
- `single`
- `hitTypeRates`
- `double`
- `triple`
- `homeRun`
- `factors`
- `matchup`
- `pitcher`
- `platoon`
- `max`
- `min`
- `onBasePercentage`
- `sluggingPct`
- `platoonSplit`
- `singles`
- `doubles`
- `triples`
- `homeRuns`
- `expectedBA`
- `playerBaseline`
- `ballpark`
- `weather`
- `homeAway`
- `expectedHits`
- `byType`
- `totalHitPoints`
- `confidence`
- `expected`
- `points`

---

### HitTypeRates

Defined in: `lib/mlb/types/analysis/hits.ts`

Properties (4):
- `single: number`
- `double: number`
- `triple: number`
- `homeRun: number`

#### Usage Mismatches

- Extra properties (not in type definition): 42
- Unused properties (defined but not used): 0

**File**: `lib/mlb/dfs-analysis/hits.ts`

Extra properties:
- `all`
- `catch`
- `then`
- `id`
- `venue`
- `currentTeam`
- `battingAverage`
- `advantage`
- `hitVulnerability`
- `platoonAdvantage`
- `byHitType`
- `singleRate`
- `doubleRate`
- `tripleRate`
- `error`
- `SINGLE`
- `DOUBLE`
- `TRIPLE`
- `HOME_RUN`
- `hitTypeRates`
- `factors`
- `matchup`
- `pitcher`
- `platoon`
- `max`
- `min`
- `singles`
- `doubles`
- `triples`
- `homeRuns`
- `expectedBA`
- `playerBaseline`
- `ballpark`
- `weather`
- `homeAway`
- `expectedHits`
- `byType`
- `totalHitPoints`
- `atBats`
- `confidence`
- `expected`
- `points`

---

### RareEventAnalysis

Defined in: `lib/mlb/types/analysis/events.ts`

Properties (5):
- `expectedRareEventPoints: number`
- `confidenceScore: number`
- `confidence: number`
- `eventProbabilities: {
    completeGame: number; // 0-100, percentage
    qualityStart: number; // 0-100, percentage
    shutout: number; // 0-100, percentage
    noHitter: number; // 0-100, percentage
    perfectGame: number; // 0-100, percentage
  }`
- `riskRewardRating: number`

#### Usage Mismatches

- Extra properties (not in type definition): 63
- Unused properties (defined but not used): 0

**File**: `lib/mlb/dfs-analysis/innings-pitched.ts`

Extra properties:
- `getFullYear`
- `durabilityRating`
- `seasonStats`
- `era`
- `toString`
- `avgInningsPerStart`
- `min`
- `qualityStartPercentage`
- `max`
- `round`
- `error`
- `completeGame`
- `shutout`
- `noHitter`
- `qualityStart`
- `perfectGame`

**File**: `lib/mlb/dfs-analysis/rare-events.ts`

Extra properties:
- `getFullYear`
- `all`
- `name`
- `team`
- `home`
- `teams`
- `gameData`
- `currentTeam`
- `away`
- `id`
- `toString`
- `seasonStats`
- `inningsPitched`
- `era`
- `whip`
- `gamesPlayed`
- `runs`
- `hitting`
- `walks`
- `strikeouts`
- `max`
- `min`
- `error`
- `reduce`
- `careerStats`
- `length`
- `round`
- `fullName`
- `season`
- `completeGame`
- `qualityStart`
- `shutout`
- `noHitter`
- `perfectGame`
- `gamesStarted`
- `wins`
- `losses`
- `saves`
- `hitBatsmen`
- `pitcher`
- `completeGames`
- `shutouts`
- `noHitters`
- `perfectGames`
- `qualityStarts`
- `totalGames`
- `completionRate`

---

### AdvancedMatchupAnalysis

Defined in: `lib/mlb/types/analysis/matchups.ts`

Properties (6):
- `matchupRating: number`
- `advantagePlayer: "pitcher" | "batter" | "neutral"`
- `confidenceScore: number`
- `factors: {
    historicalSuccess: number; // -10 to +10
    pitchTypeAdvantage: number; // -10 to +10
    plateSplitAdvantage: number; // -10 to +10
    recentForm: number; // -10 to +10
    velocityTrend: number; // -5 to +5
  }`
- `keyInsights: string[]`
- `historicalMatchup: PitcherBatterMatchup`

#### Usage Mismatches

- Extra properties (not in type definition): 56
- Unused properties (defined but not used): 0

**File**: `lib/mlb/player/matchups.ts`

Extra properties:
- `all`
- `atBats`
- `stats`
- `ops`
- `historicalSuccess`
- `push`
- `fastball`
- `pitches`
- `sinker`
- `vsFastball`
- `pitchTypePerformance`
- `toFixed`
- `slider`
- `curve`
- `vsBreakingBall`
- `changeup`
- `other`
- `vsOffspeed`
- `chaseRate`
- `discipline`
- `zonePercentage`
- `controlMetrics`
- `pitchTypeAdvantage`
- `min`
- `max`
- `throwsHand`
- `pitcher`
- `batsHand`
- `batter`
- `plateSplitAdvantage`
- `seasonStats`
- `wOBAvsL`
- `wOBAvsR`
- `last30wOBA`
- `obp`
- `slg`
- `recentForm`
- `era`
- `whip`
- `toString`
- `getFullYear`
- `velocityTrends`
- `velocityChange`
- `velocityTrend`
- `reduce`
- `values`
- `error`
- `hits`
- `homeRuns`
- `strikeouts`
- `sqrt`
- `avg`
- `inningsPitched`
- `walks`
- `homeRunsAllowed`
- `hitByPitch`

---

### HitterMatchupAnalysis

Defined in: `lib/mlb/types/analysis/matchups.ts`

Properties (11):
- `plateAppearances: number`
- `babip: number`
- `sampleSize: number`
- `confidence: number`
- `expectedAvg: number`
- `expectedObp: number`
- `expectedSlg: number`
- `strikeoutProbability: number`
- `walkProbability: number`
- `homeProbability: number`
- `stats: {
    plateAppearances: number;
    walks: number;
    hitByPitch: number;
    strikeouts: number;
  }`

#### Usage Mismatches

- Extra properties (not in type definition): 14
- Unused properties (defined but not used): 10

**File**: `lib/mlb/player/matchups.ts`

Extra properties:
- `atBats`
- `min`
- `hits`
- `homeRuns`
- `strikeouts`
- `sqrt`
- `avg`
- `obp`
- `slg`
- `seasonStats`
- `inningsPitched`
- `walks`
- `homeRunsAllowed`
- `hitByPitch`

Unused properties:
- `plateAppearances`
- `babip`
- `sampleSize`
- `confidence`
- `expectedAvg`
- `expectedObp`
- `expectedSlg`
- `strikeoutProbability`
- `walkProbability`
- `homeProbability`

---

### StartingPitcherAnalysis

Defined in: `lib/mlb/types/analysis/pitcher.ts`

Properties (11):
- `pitcherId: number`
- `name: string`
- `team: string`
- `opponent: string`
- `gameId: number`
- `venue: string`
- `stats: {
    seasonStats: PitcherSeasonStats;
    homeRunVulnerability?: {
      hrPer9: number | null;
      flyBallPct?: number | null;
      hrPerFlyBall?: number | null;
      homeRunVulnerability: number | null;
    };
  }`
- `projections: {
    winProbability: number | null;
    expectedStrikeouts: number | null;
    expectedInnings: number | null;
    dfsProjection: {
      expectedPoints: number | null;
      upside: number | null;
      floor: number | null;
    };
  }`
- `environment: {
    temperature: number;
    windSpeed: number;
    windDirection: string;
    isOutdoor: boolean;
  }`
- `ballparkFactors: {
    overall: number;
    homeRuns: number;
  }`
- `draftKings: DraftKingsInfo`

#### Usage Mismatches

- Extra properties (not in type definition): 69
- Unused properties (defined but not used): 0

**File**: `lib/mlb/dfs-analysis/starting-pitcher-analysis.ts`

Extra properties:
- `home`
- `pitchers`
- `away`
- `warn`
- `id`
- `push`
- `error`
- `all`
- `seasonStats`
- `gamesPlayed`
- `NUMERIC`
- `toString`
- `winProbability`
- `overallWinProbability`
- `awayTeam`
- `homeTeam`
- `expectedStrikeouts`
- `expectedInnings`
- `catch`
- `map`
- `lineups`
- `total`
- `points`
- `controlRating`
- `overall`
- `expectedRareEventPoints`
- `dfsProjection`
- `inningsPitched`
- `wins`
- `losses`
- `era`
- `whip`
- `strikeouts`
- `walks`
- `saves`
- `homeRunsAllowed`
- `fullName`
- `temperature`
- `windSpeed`
- `windDirection`
- `TEXT`
- `isOutdoor`
- `BOOLEAN`
- `ballpark`
- `homeRuns`
- `types`
- `log`
- `sort`
- `expectedPoints`
- `forEach`
- `toFixed`
- `floor`
- `upside`
- `filter`
- `isHome`
- `season`
- `confidenceScore`
- `eventProbabilities`
- `riskRewardRating`
- `completeGame`
- `qualityStart`
- `shutout`
- `noHitter`
- `perfectGame`
- `homeRunVulnerability`
- `draftKingsId`
- `salary`
- `positions`
- `avgPointsPerGame`

---

### WinProbabilityAnalysis

Defined in: `lib/mlb/types/analysis/pitcher.ts`

Properties (4):
- `overallWinProbability: number`
- `factorWeights: {
    pitcherSkill: number;
    teamOffense: number;
    teamDefense: number;
    bullpenStrength: number;
    homeField: number;
    opposingPitcher: number;
  }`
- `factors: {
    pitcherSkill: number; // 0-10 scale
    teamOffense: number; // 0-10 scale
    teamDefense: number; // 0-10 scale
    bullpenStrength: number; // 0-10 scale
    homeField: number; // 0-10 scale
    opposingPitcher: number; // 0-10 scale
  }`
- `confidence: number`

#### Usage Mismatches

- Extra properties (not in type definition): 43
- Unused properties (defined but not used): 0

**File**: `lib/mlb/dfs-analysis/pitcher-win.ts`

Extra properties:
- `getFullYear`
- `currentTeam`
- `all`
- `catch`
- `min`
- `max`
- `era`
- `avgInningsPerStart`
- `teamWinPct`
- `runSupportRating`
- `bullpenRating`
- `winPercentage`
- `round`
- `gamesStarted`
- `error`
- `home`
- `teams`
- `gameData`
- `away`
- `name`
- `includes`
- `temperature`
- `windSpeed`
- `toLowerCase`
- `windDirection`
- `pitcherFactors`
- `teamFactors`
- `gameFactors`
- `pitcherSkill`
- `teamOffense`
- `teamDefense`
- `bullpenStrength`
- `homeField`
- `opposingPitcher`
- `recentForm`
- `opposingTeam`
- `homeAway`
- `weather`
- `expectedDfsPoints`
- `pitcherQuality`
- `durability`
- `teamQuality`
- `runSupport`

---

### StrikeoutProjection

Defined in: `lib/mlb/types/analysis/pitcher.ts`

Properties (5):
- `expectedStrikeouts: number`
- `perInningRate: number`
- `factors: {
    pitcherKRate: number; // 0-10 scale
    opposingTeamKRate: number; // 0-10 scale
    parkFactor: number; // 0-10 scale
    weather: number; // 0-10 scale
  }`
- `ranges: {
    low: number;
    high: number;
  }`
- `confidence: number`

#### Usage Mismatches

- Extra properties (not in type definition): 27
- Unused properties (defined but not used): 0

**File**: `lib/mlb/dfs-analysis/strikeouts.ts`

Extra properties:
- `currentTeam`
- `all`
- `inningsPitched`
- `strikeouts`
- `strikeoutVulnerability`
- `isOutdoor`
- `temperature`
- `venue`
- `gamesStarted`
- `max`
- `whiff`
- `min`
- `error`
- `gamePk`
- `expectedRatePerInning`
- `low`
- `high`
- `pitcherBaseline`
- `teamVulnerability`
- `ballpark`
- `weather`
- `pitcherKRate`
- `opposingTeamKRate`
- `parkFactor`
- `lowRange`
- `highRange`
- `expectedDfsPoints`

---

### InningsProjection

Defined in: `lib/mlb/types/analysis/pitcher.ts`

Properties (6):
- `expectedInnings: number`
- `leashLength: number`
- `workloadConcerns: number`
- `gameScriptImpact: number`
- `pastWorkload: {
    last3Games: number[]; // Innings pitched in last 3 games
    averageInnings: number;
  }`
- `confidence: number`

#### Usage Mismatches

- Extra properties (not in type definition): 38
- Unused properties (defined but not used): 0

**File**: `lib/mlb/dfs-analysis/innings-pitched.ts`

Extra properties:
- `getFullYear`
- `all`
- `avgInningsPerStart`
- `min`
- `max`
- `durabilityRating`
- `pitchEfficiency`
- `error`
- `overallWinProbability`
- `isOutdoor`
- `temperature`
- `windSpeed`
- `gamesStarted`
- `qualityStartPercentage`
- `seasonStats`
- `era`
- `toString`
- `round`
- `ranges`
- `expectedDfsPoints`
- `factors`
- `confidenceScore`
- `last3Games`
- `averageInnings`
- `low`
- `high`
- `pitcherDurability`
- `teamHookTendency`
- `gameContext`
- `pitcherEfficiency`
- `expectedRareEventPoints`
- `eventProbabilities`
- `riskRewardRating`
- `completeGame`
- `shutout`
- `noHitter`
- `qualityStart`
- `perfectGame`

---

### ControlProjection

Defined in: `lib/mlb/types/analysis/pitcher.ts`

Properties (4):
- `walks: {
    expected: number;
    high: number;
    low: number;
    range: number;
    points?: number;
    confidence?: number;
  }`
- `hits: {
    expected: number;
    high: number;
    low: number;
    range: number;
    points?: number;
    confidence?: number;
  }`
- `hbp: {
    expected: number;
    high: number;
    low: number;
    range: number;
    points?: number;
    confidence?: number;
  }`
- `overall: {
    controlRating: number; // 0-10 scale
    confidenceScore: number; // 0-100 scale
  }`

#### Usage Mismatches

- Extra properties (not in type definition): 57
- Unused properties (defined but not used): 0

**File**: `lib/mlb/dfs-analysis/pitcher-control.ts`

Extra properties:
- `expectedHitsAllowed`
- `expectedWalksAllowed`
- `expectedHbpAllowed`
- `max`
- `confidenceScore`
- `error`
- `expected`
- `high`
- `low`
- `range`
- `points`
- `confidence`
- `controlRating`

**File**: `lib/mlb/dfs-analysis/plate-discipline.ts`

Extra properties:
- `expectedWalks`
- `expectedHbp`
- `max`
- `confidenceScore`
- `error`
- `all`
- `seasonStats`
- `atBats`
- `strikeouts`
- `battersFaced`
- `inningsPitched`
- `controlMetrics`
- `zoneRate`
- `chaseRate`
- `whiffRate`
- `firstPitchStrike`
- `obp`
- `qualityMetrics`
- `min`
- `hitBatsmen`
- `walkProbability`
- `expectedOutcomes`
- `hitByPitchProbability`
- `predictionConfidence`
- `matchupAdvantage`
- `push`
- `batterMetrics`
- `pitcherMetrics`
- `expected`
- `high`
- `low`
- `range`
- `controlRating`
- `zoneContactRate`
- `firstPitchSwingRate`
- `zoneSwingRate`
- `walkRate`
- `strikeoutRate`
- `chaseInducedRate`
- `contactAllowedRate`
- `firstPitchStrikeRate`
- `total`
- `points`
- `confidence`

---

### PitcherControlStats

Defined in: `lib/mlb/types/analysis/pitcher.ts`

Properties (13):
- `walks: number`
- `hits: number`
- `hitBatsmen: number`
- `inningsPitched: number`
- `gamesStarted: number`
- `walksPerNine: number`
- `hitsPerNine: number`
- `hbpPerNine: number`
- `whip: number`
- `strikeoutToWalkRatio: number`
- `zonePercentage: number`
- `firstPitchStrikePercentage: number`
- `pitchEfficiency: number`

#### Usage Mismatches

- Extra properties (not in type definition): 60
- Unused properties (defined but not used): 0

**File**: `lib/mlb/dfs-analysis/pitcher-control.ts`

Extra properties:
- `getFullYear`
- `primaryPosition`
- `seasonStats`
- `toString`
- `strikeouts`
- `catch`
- `gamesPlayed`
- `controlMetrics`
- `firstPitchStrikePercent`
- `error`
- `min`
- `max`
- `careerStats`
- `length`
- `forEach`
- `season`
- `push`
- `reduce`
- `round`
- `sort`
- `abs`
- `slice`
- `filter`
- `ip`
- `stats`
- `atBats`
- `hitByPitch`
- `hitByPitches`
- `sacrificeFlies`
- `chaseRate`
- `discipline`
- `contactRate`
- `map`
- `all`
- `eyeRating`
- `contactRating`
- `sampleSize`
- `relativeHitRate`
- `relativeWalkRate`
- `expectedHitsAllowed`
- `expectedWalksAllowed`
- `expectedHbpAllowed`
- `confidenceScore`
- `control`
- `controlRating`
- `careerHbp`
- `age`
- `factors`
- `pitcherControlFactor`
- `batterEyeFactor`
- `batterContactFactor`
- `matchupFactor`
- `hbp`
- `overall`
- `expected`
- `high`
- `low`
- `range`
- `points`
- `confidence`

---

### PitcherControlProfile

Defined in: `lib/mlb/types/analysis/pitcher.ts`

Properties (13):
- `gamesStarted: number`
- `inningsPitched: number`
- `walks: number`
- `strikeouts: number`
- `hits: number`
- `hitBatsmen: number`
- `walksPerNine: number`
- `hitsPerNine: number`
- `hbpPerNine: number`
- `whip: number`
- `strikeoutToWalkRatio: number`
- `control: {
    walkPropensity: "high" | "medium" | "low";
    hitsPropensity: "high" | "medium" | "low";
    hbpPropensity: "high" | "medium" | "low";
    zonePercentage?: number;
    firstPitchStrikePercentage?: number;
    pitchEfficiency?: number;
  }`
- `controlRating: number`

#### Usage Mismatches

- Extra properties (not in type definition): 134
- Unused properties (defined but not used): 1

**File**: `lib/mlb/dfs-analysis/pitcher-control.ts`

Extra properties:
- `getFullYear`
- `catch`
- `zonePercentage`
- `controlMetrics`
- `firstPitchStrikePercent`
- `min`
- `firstPitchStrikePercentage`
- `pitchEfficiency`
- `max`
- `error`
- `careerStats`
- `length`
- `forEach`
- `toString`
- `season`
- `push`
- `reduce`
- `round`
- `sort`
- `abs`
- `slice`
- `filter`
- `ip`
- `stats`
- `atBats`
- `hitByPitch`
- `seasonStats`
- `hitByPitches`
- `sacrificeFlies`
- `chaseRate`
- `discipline`
- `contactRate`
- `map`
- `all`
- `eyeRating`
- `contactRating`
- `sampleSize`
- `relativeHitRate`
- `relativeWalkRate`
- `expectedHitsAllowed`
- `expectedWalksAllowed`
- `expectedHbpAllowed`
- `confidenceScore`
- `careerHbp`
- `age`
- `factors`
- `pitcherControlFactor`
- `batterEyeFactor`
- `batterContactFactor`
- `matchupFactor`
- `hbp`
- `overall`
- `expected`
- `high`
- `low`
- `range`
- `points`
- `confidence`

**File**: `lib/mlb/dfs-analysis/plate-discipline.ts`

Extra properties:
- `getFullYear`
- `primaryPosition`
- `toString`
- `seasonStats`
- `round`
- `zonePercentage`
- `firstPitchStrikePercentage`
- `pitchEfficiency`
- `max`
- `min`
- `error`
- `catch`
- `stats`
- `walkRate`
- `plateAppearances`
- `hitByPitch`
- `atBats`
- `vsLeft`
- `obp`
- `avg`
- `vsRight`
- `strikeoutRate`
- `abs`
- `warn`
- `walkProbability`
- `expectedOutcomes`
- `hitByPitchProbability`
- `batterMetrics`
- `pitcherMetrics`
- `matchupAdvantage`
- `predictionConfidence`
- `pitchHand`
- `batSide`
- `sampleSize`
- `hbpRate`
- `relativeWalkRate`
- `platoonDifference`
- `expectedWalks`
- `expectedHbp`
- `confidenceScore`
- `all`
- `battersFaced`
- `controlMetrics`
- `zoneRate`
- `chaseRate`
- `whiffRate`
- `firstPitchStrike`
- `qualityMetrics`
- `push`
- `gamesPlayed`
- `wins`
- `losses`
- `era`
- `saves`
- `hitsPropensity`
- `factors`
- `pitcherId`
- `batterWalkPropensity`
- `pitcherControlFactor`
- `matchupFactor`
- `platoonFactor`
- `hbp`
- `overall`
- `expected`
- `high`
- `low`
- `range`
- `zoneContactRate`
- `firstPitchSwingRate`
- `zoneSwingRate`
- `chaseInducedRate`
- `contactAllowedRate`
- `firstPitchStrikeRate`
- `total`
- `points`
- `confidence`

Unused properties:
- `strikeoutToWalkRatio`

---

### CareerControlProfile

Defined in: `lib/mlb/types/analysis/pitcher.ts`

Properties (11):
- `careerWalks: number`
- `careerHits: number`
- `careerHbp: number`
- `careerInningsPitched: number`
- `careerWhip: number`
- `bestSeasonWhip: number`
- `recentTrend: "improving" | "declining" | "stable"`
- `controlPropensity: "high" | "medium" | "low"`
- `age: number`
- `yearsExperience: number`
- `seasonToSeasonConsistency: number`

#### Usage Mismatches

- Extra properties (not in type definition): 60
- Unused properties (defined but not used): 9

**File**: `lib/mlb/dfs-analysis/pitcher-control.ts`

Extra properties:
- `careerStats`
- `length`
- `forEach`
- `toString`
- `inningsPitched`
- `season`
- `walks`
- `whip`
- `push`
- `reduce`
- `max`
- `round`
- `getFullYear`
- `min`
- `sort`
- `abs`
- `slice`
- `filter`
- `ip`
- `error`
- `catch`
- `stats`
- `hitsPerNine`
- `walksPerNine`
- `atBats`
- `hitByPitch`
- `hits`
- `strikeouts`
- `seasonStats`
- `hitByPitches`
- `sacrificeFlies`
- `chaseRate`
- `discipline`
- `contactRate`
- `map`
- `all`
- `eyeRating`
- `contactRating`
- `sampleSize`
- `relativeHitRate`
- `relativeWalkRate`
- `hbpPerNine`
- `expectedHitsAllowed`
- `expectedWalksAllowed`
- `expectedHbpAllowed`
- `confidenceScore`
- `factors`
- `pitcherControlFactor`
- `batterEyeFactor`
- `batterContactFactor`
- `matchupFactor`
- `hbp`
- `overall`
- `expected`
- `high`
- `low`
- `range`
- `points`
- `confidence`
- `controlRating`

Unused properties:
- `careerWalks`
- `careerHits`
- `careerInningsPitched`
- `careerWhip`
- `bestSeasonWhip`
- `recentTrend`
- `controlPropensity`
- `yearsExperience`
- `seasonToSeasonConsistency`

---

### ControlMatchupData

Defined in: `lib/mlb/types/analysis/pitcher.ts`

Properties (13):
- `plateAppearances: number`
- `atBats: number`
- `hits: number`
- `walks: number`
- `hitByPitch: number`
- `strikeouts: number`
- `hitRate: number`
- `walkRate: number`
- `hbpRate: number`
- `strikeoutRate: number`
- `sampleSize: "large" | "medium" | "small" | "none"`
- `relativeHitRate: number`
- `relativeWalkRate: number`

#### Usage Mismatches

- Extra properties (not in type definition): 101
- Unused properties (defined but not used): 7

**File**: `lib/mlb/dfs-analysis/pitcher-control.ts`

Extra properties:
- `catch`
- `stats`
- `hitsPerNine`
- `walksPerNine`
- `error`
- `seasonStats`
- `hitByPitches`
- `sacrificeFlies`
- `max`
- `min`
- `chaseRate`
- `discipline`
- `contactRate`
- `map`
- `all`
- `filter`
- `reduce`
- `eyeRating`
- `length`
- `contactRating`
- `forEach`
- `hbpPerNine`
- `inningsPitched`
- `expectedHitsAllowed`
- `expectedWalksAllowed`
- `expectedHbpAllowed`
- `confidenceScore`
- `factors`
- `pitcherControlFactor`
- `batterEyeFactor`
- `batterContactFactor`
- `matchupFactor`
- `hbp`
- `overall`
- `expected`
- `high`
- `low`
- `range`
- `points`
- `confidence`
- `controlRating`

Unused properties:
- `plateAppearances`
- `hitRate`
- `walkRate`
- `hbpRate`
- `strikeoutRate`

**File**: `lib/mlb/dfs-analysis/plate-discipline.ts`

Extra properties:
- `catch`
- `stats`
- `max`
- `error`
- `vsLeft`
- `obp`
- `avg`
- `vsRight`
- `abs`
- `warn`
- `walkProbability`
- `expectedOutcomes`
- `hitByPitchProbability`
- `batterMetrics`
- `pitcherMetrics`
- `matchupAdvantage`
- `predictionConfidence`
- `pitchHand`
- `batSide`
- `walksPerNine`
- `hbpPerNine`
- `platoonDifference`
- `inningsPitched`
- `min`
- `expectedWalks`
- `expectedHbp`
- `confidenceScore`
- `all`
- `seasonStats`
- `battersFaced`
- `controlMetrics`
- `zoneRate`
- `chaseRate`
- `whiffRate`
- `firstPitchStrike`
- `qualityMetrics`
- `hitBatsmen`
- `push`
- `factors`
- `pitcherId`
- `batterWalkPropensity`
- `pitcherControlFactor`
- `matchupFactor`
- `platoonFactor`
- `hbp`
- `overall`
- `expected`
- `high`
- `low`
- `range`
- `controlRating`
- `zoneContactRate`
- `firstPitchSwingRate`
- `zoneSwingRate`
- `chaseInducedRate`
- `contactAllowedRate`
- `firstPitchStrikeRate`
- `total`
- `points`
- `confidence`

Unused properties:
- `hitRate`
- `relativeHitRate`

---

### BatterControlFactors

Defined in: `lib/mlb/types/analysis/pitcher.ts`

Properties (3):
- `eyeRating: number`
- `contactRating: number`
- `discipline: {
    chaseRate?: number; // Swing % at pitches outside zone
    contactRate?: number; // Contact % on swings
    walkRate: number; // BB/PA
    strikeoutRate: number; // K/PA
  }`

#### Usage Mismatches

- Extra properties (not in type definition): 44
- Unused properties (defined but not used): 0

**File**: `lib/mlb/dfs-analysis/pitcher-control.ts`

Extra properties:
- `seasonStats`
- `catch`
- `error`
- `atBats`
- `walks`
- `hitByPitches`
- `sacrificeFlies`
- `strikeouts`
- `max`
- `min`
- `chaseRate`
- `contactRate`
- `map`
- `all`
- `filter`
- `reduce`
- `length`
- `forEach`
- `sampleSize`
- `relativeHitRate`
- `relativeWalkRate`
- `hitsPerNine`
- `walksPerNine`
- `hbpPerNine`
- `inningsPitched`
- `expectedHitsAllowed`
- `expectedWalksAllowed`
- `expectedHbpAllowed`
- `confidenceScore`
- `factors`
- `pitcherControlFactor`
- `batterEyeFactor`
- `batterContactFactor`
- `matchupFactor`
- `hits`
- `hbp`
- `overall`
- `expected`
- `high`
- `low`
- `range`
- `points`
- `confidence`
- `controlRating`

---

### ExpectedControlEvents

Defined in: `lib/mlb/types/analysis/pitcher.ts`

Properties (5):
- `expectedHitsAllowed: number`
- `expectedWalksAllowed: number`
- `expectedHbpAllowed: number`
- `confidenceScore: number`
- `factors: {
    pitcherControlFactor: number;
    batterEyeFactor: number;
    batterContactFactor: number;
    matchupFactor: number;
  }`

#### Usage Mismatches

- Extra properties (not in type definition): 34
- Unused properties (defined but not used): 0

**File**: `lib/mlb/dfs-analysis/pitcher-control.ts`

Extra properties:
- `catch`
- `map`
- `all`
- `filter`
- `reduce`
- `eyeRating`
- `max`
- `length`
- `contactRating`
- `forEach`
- `sampleSize`
- `relativeHitRate`
- `relativeWalkRate`
- `hitsPerNine`
- `walksPerNine`
- `hbpPerNine`
- `inningsPitched`
- `min`
- `error`
- `pitcherControlFactor`
- `batterEyeFactor`
- `batterContactFactor`
- `matchupFactor`
- `hits`
- `walks`
- `hbp`
- `overall`
- `expected`
- `high`
- `low`
- `range`
- `points`
- `confidence`
- `controlRating`

---

### RunProductionPoints

Defined in: `lib/mlb/types/analysis/run-production.ts`

Properties (3):
- `runs: {
    expected: number;
    points: number;
    confidence: number;
  }`
- `rbis: {
    expected: number;
    points: number;
    confidence: number;
  }`
- `total: {
    expected: number;
    points: number;
    confidence: number;
  }`

#### Usage Mismatches

- Extra properties (not in type definition): 7
- Unused properties (defined but not used): 0

**File**: `lib/mlb/dfs-analysis/run-production.ts`

Extra properties:
- `all`
- `expected`
- `confidence`
- `max`
- `min`
- `error`
- `points`

---

### TeamStats

Defined in: `lib/mlb/types/game.ts`

Properties (13):
- `hits: number`
- `walks: number`
- `hitByPitch: number`
- `plateAppearances: number`
- `runsPerGame: number`
- `rbisPerGame: number`
- `sluggingPct: number`
- `onBasePct: number`
- `battingAvg: number`
- `ops: number`
- `woba: number`
- `wrc: number`
- `sourceTimestamp: Date`

#### Usage Mismatches

- Extra properties (not in type definition): 36
- Unused properties (defined but not used): 12

**File**: `lib/mlb/schedule/schedule.ts`

Extra properties:
- `error`
- `name`
- `teams`
- `stat`
- `splits`
- `stats`
- `warn`
- `find`
- `group`
- `gamesPlayed`
- `wins`
- `losses`
- `runs`
- `avg`
- `obp`
- `slg`
- `era`
- `whip`
- `strikeOuts`
- `inningsPitched`
- `hitting`
- `pitching`
- `id`
- `runsScored`
- `runsAllowed`
- `strikeouts`
- `strikeoutRate`
- `overall`
- `handedness`
- `types`
- `rHB`
- `lHB`
- `singles`
- `doubles`
- `triples`
- `homeRuns`

Unused properties:
- `hits`
- `walks`
- `hitByPitch`
- `plateAppearances`
- `runsPerGame`
- `rbisPerGame`
- `sluggingPct`
- `onBasePct`
- `battingAvg`
- `woba`
- `wrc`
- `sourceTimestamp`

---

### DetailedWeatherInfo

Defined in: `lib/mlb/types/game.ts`

Properties (5):
- `temperature: number`
- `condition: string`
- `wind: {
    speed: number;
    direction: string;
    isCalm: boolean;
  }`
- `isOutdoor: boolean`
- `isPrecipitation: boolean`

#### Usage Mismatches

- Extra properties (not in type definition): 38
- Unused properties (defined but not used): 0

**File**: `lib/mlb/weather/weather.ts`

Extra properties:
- `temp`
- `includes`
- `toLowerCase`
- `some`
- `gamePk`
- `error`
- `weather`
- `gameData`
- `toString`
- `venue`
- `roofType`
- `id`
- `roofStatus`
- `speed`
- `direction`
- `humidity`
- `pressure`
- `name`
- `isCalm`
- `sourceTimestamp`
- `windSpeed`
- `windDirection`
- `precipitation`
- `humidityPercent`
- `pressureMb`
- `venueId`
- `venueName`
- `hasRoof`
- `overall`
- `handedness`
- `types`
- `rHB`
- `lHB`
- `singles`
- `doubles`
- `triples`
- `homeRuns`
- `runs`

---

### GameFeedResponse

Defined in: `lib/mlb/types/game.ts`

Properties (4):
- `gamePk: number`
- `gameData: {
    status?: {
      abstractGameState?: string;
      detailedState?: string;
      codedGameState?: string;
    };
    teams?: {
      away?: {
        team?: {
          id: number;
          name: string;
        };
      };
      home?: {
        team?: {
          id: number;
          name: string;
        };
      };
    };
    weather?: {
      temp?: number;
      wind?: string;
      humidity?: number;
      pressure?: number;
      condition?: string;
    };
    venue?: {
      id?: number;
      name?: string;
      roofType?: string;
      roofStatus?: string;
    };
  }`
- `liveData: {
    plays?: any;
    boxscore?: any;
    linescore?: any;
  }`
- `sourceTimestamp: Date`

#### Usage Mismatches

- Extra properties (not in type definition): 17
- Unused properties (defined but not used): 0

**File**: `lib/mlb/game/game-feed.ts`

Extra properties:
- `log`
- `name`
- `team`
- `away`
- `teams`
- `home`
- `error`
- `message`
- `game`
- `length`
- `join`
- `all`
- `then`
- `getGameEnvironmentData`
- `getProbableLineups`
- `id`
- `boxscore`

---

### MLBScheduleResponse

Defined in: `lib/mlb/types/game.ts`

Properties (1):
- `dates: Array<{
    date: string;
    games: Array<{
      gamePk: number;
      gameDate: string;
      status: {
        abstractGameState?: string;
        detailedState?: string;
        statusCode?: string;
      };
      teams: {
        away: {
          team: {
            id: number;
            name: string;
          };
          probablePitcher?: {
            id: number;
            fullName: string;
          };
        };
        home: {
          team: {
            id: number;
            name: string;
          };
          probablePitcher?: {
            id: number;
            fullName: string;
          };
        };
      };
      venue: {
        id: number;
        name: string;
      };
    }>;
  }>`

#### Usage Mismatches

- Extra properties (not in type definition): 42
- Unused properties (defined but not used): 0

**File**: `lib/mlb/schedule/schedule.ts`

Extra properties:
- `warn`
- `length`
- `games`
- `find`
- `id`
- `team`
- `home`
- `teams`
- `away`
- `error`
- `name`
- `stat`
- `splits`
- `stats`
- `group`
- `gamesPlayed`
- `wins`
- `losses`
- `runs`
- `avg`
- `obp`
- `slg`
- `ops`
- `era`
- `whip`
- `strikeOuts`
- `inningsPitched`
- `hitting`
- `pitching`
- `runsScored`
- `runsAllowed`
- `strikeouts`
- `strikeoutRate`
- `overall`
- `handedness`
- `types`
- `rHB`
- `lHB`
- `singles`
- `doubles`
- `triples`
- `homeRuns`

---

### GameEnvironmentData

Defined in: `lib/mlb/types/game.ts`

Properties (12):
- `temperature: number`
- `windSpeed: number`
- `windDirection: string`
- `precipitation: boolean`
- `isOutdoor: boolean`
- `humidityPercent: number`
- `pressureMb: number`
- `venueId: number`
- `venueName: string`
- `hasRoof: boolean`
- `roofStatus: string`
- `sourceTimestamp: Date`

#### Usage Mismatches

- Extra properties (not in type definition): 28
- Unused properties (defined but not used): 0

**File**: `lib/mlb/weather/weather.ts`

Extra properties:
- `gamePk`
- `error`
- `gameData`
- `weather`
- `condition`
- `toString`
- `temp`
- `wind`
- `venue`
- `roofType`
- `id`
- `includes`
- `speed`
- `direction`
- `isPrecipitation`
- `humidity`
- `pressure`
- `name`
- `overall`
- `handedness`
- `types`
- `rHB`
- `lHB`
- `singles`
- `doubles`
- `triples`
- `homeRuns`
- `runs`

---

### ProbableLineup

Defined in: `lib/mlb/types/game.ts`

Properties (7):
- `away: number[]`
- `home: number[]`
- `awayBatters: Array<{
    id: number;
    fullName: string;
    position: string;
  }>`
- `homeBatters: Array<{
    id: number;
    fullName: string;
    position: string;
  }>`
- `confirmed: boolean`
- `confidence: number`
- `sourceTimestamp: Date`

#### Usage Mismatches

- Extra properties (not in type definition): 23
- Unused properties (defined but not used): 0

**File**: `lib/mlb/game/lineups.ts`

Extra properties:
- `catch`
- `teams`
- `boxscore`
- `liveData`
- `length`
- `batters`
- `battingOrder`
- `map`
- `fullName`
- `person`
- `players`
- `abbreviation`
- `position`
- `probableLineups`
- `gameNotes`
- `id`
- `statusCode`
- `status`
- `gameData`
- `all`
- `min`
- `error`
- `lineups`

---

### BallparkFactors

Defined in: `lib/mlb/types/environment/ballpark.ts`

Properties (6):
- `overall: number`
- `handedness: {
    rHB: number; // Factor for right-handed batters
    lHB: number; // Factor for left-handed batters
  }`
- `types: {
    singles: number;
    doubles: number;
    triples: number;
    homeRuns: number;
    runs: number;
  }`
- `venueId: number`
- `season: string`
- `sourceTimestamp: Date`

#### Usage Mismatches

- Extra properties (not in type definition): 191
- Unused properties (defined but not used): 11

**File**: `lib/mlb/dfs-analysis/batter-analysis.ts`

Extra properties:
- `id`
- `isHome`
- `away`
- `pitchers`
- `home`
- `toString`
- `gameId`
- `environment`
- `ballpark`
- `total`
- `expected`
- `singles`
- `byType`
- `doubles`
- `triples`
- `homeRuns`
- `confidence`
- `error`
- `name`
- `throwsHand`
- `position`
- `venue`
- `lineupPosition`
- `temperature`
- `windSpeed`
- `windDirection`
- `isOutdoor`
- `runs`
- `rbi`
- `expectedPoints`
- `hitProjections`
- `upside`
- `floor`
- `factors`
- `points`
- `weather`
- `career`
- `gamesPlayed`
- `atBats`
- `hits`
- `avg`
- `obp`
- `slg`
- `ops`
- `stolenBases`
- `caughtStealing`
- `walks`
- `strikeouts`
- `sacrificeFlies`
- `hitByPitches`
- `plateAppearances`
- `batterId`
- `team`
- `opponent`
- `opposingPitcher`
- `stats`
- `matchup`
- `projections`
- `draftKings`
- `seasonStats`
- `quality`
- `advantageScore`
- `platoonAdvantage`
- `historicalStats`
- `homeRunProbability`
- `stolenBaseProbability`
- `expectedHits`
- `dfsProjection`
- `breakdown`
- `platoon`
- `temperatureFactor`
- `windFactor`
- `overallFactor`
- `byHitType`
- `draftKingsId`
- `salary`
- `positions`
- `avgPointsPerGame`
- `battedBallQuality`
- `power`
- `contactRate`
- `plateApproach`
- `speed`
- `consistency`

Unused properties:
- `handedness`
- `venueId`
- `season`
- `sourceTimestamp`

**File**: `lib/mlb/dfs-analysis/run-production.ts`

Extra properties:
- `singles`
- `doubles`
- `triples`
- `homeRuns`
- `runs`
- `lineups`
- `warn`
- `home`
- `teams`
- `away`
- `id`
- `team`
- `teamStats`
- `obp`
- `hitting`
- `gamesPlayed`
- `rbi`
- `getFullYear`
- `toString`
- `seasonStats`
- `inningsPitched`
- `era`
- `whip`
- `round`
- `error`
- `all`
- `catch`
- `resolve`
- `then`
- `venue`
- `runsPerGame`
- `careerRunsPerGame`
- `position`
- `currentTeam`
- `teamOffensiveRating`
- `runPreventionRating`
- `seasonToSeasonVariance`
- `min`
- `max`
- `homeBatters`
- `awayBatters`
- `findIndex`
- `probablePitcher`
- `toISOString`
- `abstractGameState`
- `status`
- `gameData`
- `detailedState`
- `codedGameState`
- `name`
- `rbiPerGame`
- `careerRBIPerGame`
- `sluggingPct`
- `expected`
- `confidence`
- `runFactor`
- `rbiFactor`
- `isTopOfOrder`
- `isBottomOfOrder`
- `runnersOnBaseFrequency`
- `rbiOpportunities`
- `runScoringOpportunities`
- `gamesStarted`
- `wins`
- `losses`
- `strikeouts`
- `walks`
- `saves`
- `hitBatsmen`
- `runsAllowedPerGame`
- `earnedRunAverage`
- `qualityStartPercentage`
- `runScoringVulnerability`
- `early`
- `middle`
- `late`
- `ceiling`
- `floor`
- `runFactors`
- `playerSkill`
- `lineupContext`
- `opposingPitcher`
- `ballparkFactor`
- `gamePk`
- `gameDate`
- `statusCode`
- `fullName`
- `rbiFactors`
- `rbis`
- `total`
- `points`

Unused properties:
- `handedness`
- `sourceTimestamp`

**File**: `lib/mlb/schedule/schedule.ts`

Extra properties:
- `warn`
- `rHB`
- `lHB`
- `singles`
- `doubles`
- `triples`
- `homeRuns`
- `runs`

Unused properties:
- `venueId`
- `season`
- `sourceTimestamp`

**File**: `lib/mlb/weather/weather.ts`

Extra properties:
- `venue`
- `rHB`
- `lHB`
- `singles`
- `doubles`
- `triples`
- `homeRuns`
- `runs`

Unused properties:
- `venueId`
- `season`

---

### PitcherBatterMatchup

Defined in: `lib/mlb/types/player/matchups.ts`

Properties (4):
- `pitcher: {
    id: number;
    name: string;
    throwsHand: string;
  }`
- `batter: {
    id: number;
    name: string;
    batsHand: string;
  }`
- `stats: MatchupStats`
- `sourceTimestamp: Date`

#### Usage Mismatches

- Extra properties (not in type definition): 150
- Unused properties (defined but not used): 0

**File**: `lib/mlb/player/matchups.ts`

Extra properties:
- `warn`
- `fullName`
- `pitchHand`
- `batSide`
- `length`
- `splits`
- `stat`
- `atBats`
- `hits`
- `homeRuns`
- `strikeouts`
- `baseOnBalls`
- `avg`
- `obp`
- `slg`
- `ops`
- `error`
- `player`
- `getFullYear`
- `pitch_mix`
- `zone_rate`
- `control_metrics`
- `first_pitch_strike`
- `whiff_rate`
- `chase_rate`
- `velocity_trends`
- `includes`
- `message`
- `reduce`
- `count`
- `forEach`
- `pitch_type`
- `keys`
- `round`
- `velocity`
- `put_away_rate`
- `min`
- `max`
- `sort`
- `filter`
- `getTime`
- `game_date`
- `map`
- `slice`
- `avg_velocity`
- `velocity_change`
- `toFixed`
- `all`
- `historicalSuccess`
- `push`
- `fastball`
- `pitches`
- `sinker`
- `vsFastball`
- `pitchTypePerformance`
- `slider`
- `curve`
- `vsBreakingBall`
- `changeup`
- `other`
- `vsOffspeed`
- `chaseRate`
- `discipline`
- `zonePercentage`
- `controlMetrics`
- `pitchTypeAdvantage`
- `throwsHand`
- `batsHand`
- `plateSplitAdvantage`
- `seasonStats`
- `wOBAvsL`
- `wOBAvsR`
- `last30wOBA`
- `recentForm`
- `era`
- `whip`
- `toString`
- `velocityTrends`
- `velocityChange`
- `velocityTrend`
- `values`
- `sqrt`
- `inningsPitched`
- `walks`
- `homeRunsAllowed`
- `id`
- `name`
- `season`
- `playerId`
- `averageVelocity`
- `effectiveness`
- `firstPitchStrikePercent`
- `swingingStrikePercent`
- `FF`
- `FT`
- `FA`
- `SL`
- `CU`
- `KC`
- `CH`
- `SI`
- `FC`
- `cutter`
- `date`
- `avgVelocity`
- `change`
- `seasonAvg`
- `recent15DayAvg`
- `historicalMatchup`
- `matchupRating`
- `advantagePlayer`
- `confidenceScore`
- `factors`
- `keyInsights`
- `hitByPitch`

**File**: `lib/mlb/player/pitcher-stats.ts`

Extra properties:
- `length`
- `splits`
- `fullName`
- `pitchHand`
- `batSide`
- `stat`
- `atBats`
- `hits`
- `homeRuns`
- `strikeouts`
- `baseOnBalls`
- `avg`
- `obp`
- `slg`
- `ops`
- `error`
- `player`
- `getFullYear`
- `inningsPitched`
- `seasonStats`
- `era`
- `homeRunsAllowed`
- `round`
- `gamesPlayed`
- `max`
- `min`
- `id`
- `name`
- `throwsHand`
- `batsHand`
- `walks`
- `gamesStarted`
- `flyBallPct`
- `hrPerFlyBall`
- `homeRunVulnerability`

---

### PitcherPitchMixData

Defined in: `lib/mlb/types/player/pitcher.ts`

Properties (8):
- `playerId: number`
- `name: string`
- `pitches: {
    fastball: number; // percentage
    slider: number;
    curve: number;
    changeup: number;
    sinker: number;
    cutter: number;
    other: number;
  }`
- `averageVelocity: {
    fastball?: number;
    slider?: number;
    curve?: number;
    changeup?: number;
    sinker?: number;
    cutter?: number;
  }`
- `effectiveness: {
    fastball?: number; // scale 0-100
    slider?: number;
    curve?: number;
    changeup?: number;
    sinker?: number;
    cutter?: number;
  }`
- `controlMetrics: {
    zonePercentage: number;
    firstPitchStrikePercent: number;
    swingingStrikePercent: number;
    chaseRate: number;
  }`
- `velocityTrends: {
    recentGames: {
      date: string;
      avgVelocity: number;
      change: number;
    }[];
    seasonAvg: number;
    recent15DayAvg: number;
    velocityChange: number;
  }`
- `sourceTimestamp: Date`

#### Usage Mismatches

- Extra properties (not in type definition): 153
- Unused properties (defined but not used): 1

**File**: `lib/mlb/player/matchups.ts`

Extra properties:
- `getFullYear`
- `fullName`
- `pitch_mix`
- `zone_rate`
- `control_metrics`
- `first_pitch_strike`
- `whiff_rate`
- `chase_rate`
- `velocity_trends`
- `includes`
- `message`
- `warn`
- `error`
- `reduce`
- `count`
- `forEach`
- `pitch_type`
- `keys`
- `round`
- `velocity`
- `put_away_rate`
- `min`
- `max`
- `length`
- `sort`
- `filter`
- `getTime`
- `game_date`
- `map`
- `slice`
- `avg_velocity`
- `velocity_change`
- `toFixed`
- `player`
- `all`
- `atBats`
- `stats`
- `ops`
- `historicalSuccess`
- `push`
- `fastball`
- `sinker`
- `vsFastball`
- `pitchTypePerformance`
- `slider`
- `curve`
- `vsBreakingBall`
- `changeup`
- `other`
- `vsOffspeed`
- `chaseRate`
- `discipline`
- `zonePercentage`
- `pitchTypeAdvantage`
- `throwsHand`
- `pitcher`
- `batsHand`
- `batter`
- `plateSplitAdvantage`
- `seasonStats`
- `wOBAvsL`
- `wOBAvsR`
- `last30wOBA`
- `obp`
- `slg`
- `recentForm`
- `era`
- `whip`
- `toString`
- `velocityChange`
- `velocityTrend`
- `values`
- `hits`
- `homeRuns`
- `strikeouts`
- `sqrt`
- `avg`
- `inningsPitched`
- `walks`
- `homeRunsAllowed`
- `season`
- `firstPitchStrikePercent`
- `swingingStrikePercent`
- `FF`
- `FT`
- `FA`
- `SL`
- `CU`
- `KC`
- `CH`
- `SI`
- `FC`
- `cutter`
- `date`
- `avgVelocity`
- `change`
- `seasonAvg`
- `recent15DayAvg`
- `historicalMatchup`
- `matchupRating`
- `advantagePlayer`
- `confidenceScore`
- `factors`
- `keyInsights`
- `hitByPitch`

**File**: `lib/mlb/player/pitcher-stats.ts`

Extra properties:
- `fullName`
- `error`
- `player`
- `stats`
- `length`
- `splits`
- `pitchHand`
- `batSide`
- `stat`
- `atBats`
- `hits`
- `homeRuns`
- `strikeouts`
- `baseOnBalls`
- `avg`
- `obp`
- `slg`
- `ops`
- `getFullYear`
- `inningsPitched`
- `seasonStats`
- `era`
- `homeRunsAllowed`
- `round`
- `gamesPlayed`
- `max`
- `min`
- `fastball`
- `slider`
- `curve`
- `changeup`
- `sinker`
- `cutter`
- `other`
- `zonePercentage`
- `firstPitchStrikePercent`
- `swingingStrikePercent`
- `chaseRate`
- `pitcher`
- `batter`
- `id`
- `throwsHand`
- `batsHand`
- `walks`
- `gamesStarted`
- `flyBallPct`
- `hrPerFlyBall`
- `homeRunVulnerability`

Unused properties:
- `velocityTrends`

---

### BatterPlateDiscipline

Defined in: `lib/mlb/types/player/batter.ts`

Properties (8):
- `playerId: number`
- `name: string`
- `discipline: {
    chaseRate: number; // Swing % on pitches outside zone
    contactRate: number; // Contact % on all swings
    zoneSwingRate: number; // Swing % on pitches in zone
    whiffRate: number; // Miss % on all swings
    firstPitchSwingRate: number;
    zoneContactRate?: number; // Contact % on pitches in zone
    firstPitchStrikeRate?: number; // First pitch strike %
  }`
- `pitchTypePerformance: {
    vsFastball: number; // Performance score 0-100
    vsBreakingBall: number;
    vsOffspeed: number;
  }`
- `walkRate: number`
- `hbpRate: number`
- `plateAppearances: number`
- `sourceTimestamp: Date`

#### Usage Mismatches

- Extra properties (not in type definition): 133
- Unused properties (defined but not used): 2

**File**: `lib/mlb/dfs-analysis/plate-discipline.ts`

Extra properties:
- `getFullYear`
- `primaryPosition`
- `atBats`
- `seasonStats`
- `gamesPlayed`
- `log`
- `walks`
- `hitByPitches`
- `sacrificeFlies`
- `strikeouts`
- `chaseRate`
- `contactRate`
- `fullName`
- `zoneSwingRate`
- `whiffRate`
- `firstPitchSwingRate`
- `error`
- `careerStats`
- `length`
- `forEach`
- `season`
- `push`
- `min`
- `max`
- `sort`
- `abs`
- `reduce`
- `slice`
- `filter`
- `pa`
- `toString`
- `inningsPitched`
- `hitBatsmen`
- `whip`
- `round`
- `zonePercentage`
- `firstPitchStrikePercentage`
- `pitchEfficiency`
- `gamesStarted`
- `catch`
- `stats`
- `hitByPitch`
- `hits`
- `vsLeft`
- `obp`
- `avg`
- `vsRight`
- `strikeoutRate`
- `warn`
- `walkProbability`
- `expectedOutcomes`
- `hitByPitchProbability`
- `batterMetrics`
- `pitcherMetrics`
- `matchupAdvantage`
- `predictionConfidence`
- `pitchHand`
- `batSide`
- `walksPerNine`
- `sampleSize`
- `hbpPerNine`
- `relativeWalkRate`
- `platoonDifference`
- `expectedWalks`
- `expectedHbp`
- `confidenceScore`
- `all`
- `battersFaced`
- `controlMetrics`
- `zoneRate`
- `firstPitchStrike`
- `qualityMetrics`
- `batterId`
- `zoneContactRate`
- `firstPitchStrikeRate`
- `vsFastball`
- `vsBreakingBall`
- `vsOffspeed`
- `age`
- `wins`
- `losses`
- `era`
- `saves`
- `hitsPerNine`
- `control`
- `controlRating`
- `hitsPropensity`
- `factors`
- `pitcherId`
- `batterWalkPropensity`
- `pitcherControlFactor`
- `matchupFactor`
- `platoonFactor`
- `hbp`
- `overall`
- `expected`
- `high`
- `low`
- `range`
- `chaseInducedRate`
- `contactAllowedRate`
- `total`
- `points`
- `confidence`

Unused properties:
- `playerId`

**File**: `lib/mlb/player/batter-stats.ts`

Extra properties:
- `fullName`
- `error`
- `player`
- `getFullYear`
- `splits`
- `stats`
- `stat`
- `find`
- `code`
- `split`
- `atBats`
- `hits`
- `avg`
- `obp`
- `slg`
- `ops`
- `baseOnBalls`
- `strikeOuts`
- `chaseRate`
- `contactRate`
- `zoneSwingRate`
- `whiffRate`
- `firstPitchSwingRate`
- `vsFastball`
- `vsBreakingBall`
- `vsOffspeed`
- `vsLeft`
- `vsRight`
- `strikeoutRate`

Unused properties:
- `hbpRate`

---

### MLBGame

Defined in: `lib/mlb/types/game.ts`

Properties (9):
- `gamePk: number`
- `gameDate: string`
- `status: {
    abstractGameState?: string;
    detailedState?: string;
    statusCode?: string;
  }`
- `teams: {
    away: {
      team: {
        id: number;
        name: string;
      };
      probablePitcher?: {
        id: number;
        fullName: string;
      };
    };
    home: {
      team: {
        id: number;
        name: string;
      };
      probablePitcher?: {
        id: number;
        fullName: string;
      };
    };
  }`
- `venue: {
    id: number;
    name: string;
  }`
- `lineups: {
    away: number[];
    home: number[];
    awayBatters?: Array<{
      id: number;
      fullName: string;
      position: string;
    }>;
    homeBatters?: Array<{
      id: number;
      fullName: string;
      position: string;
    }>;
  }`
- `pitchers: {
    away?: {
      id: number;
      fullName: string;
      throwsHand?: string;
    };
    home?: {
      id: number;
      fullName: string;
      throwsHand?: string;
    };
  }`
- `environment: {
    temperature: number;
    windSpeed: number;
    windDirection: string;
    isOutdoor: boolean;
  }`
- `teamStats: {
    home: CoreTeamStats;
    away: CoreTeamStats;
  }`

#### Usage Mismatches

- Extra properties (not in type definition): 81
- Unused properties (defined but not used): 2

**File**: `lib/mlb/dfs-analysis/run-production.ts`

Extra properties:
- `warn`
- `home`
- `away`
- `id`
- `team`
- `obp`
- `hitting`
- `runs`
- `gamesPlayed`
- `rbi`
- `getFullYear`
- `toString`
- `seasonStats`
- `inningsPitched`
- `era`
- `whip`
- `round`
- `error`
- `all`
- `catch`
- `resolve`
- `then`
- `runsPerGame`
- `careerRunsPerGame`
- `position`
- `currentTeam`
- `teamOffensiveRating`
- `runPreventionRating`
- `overall`
- `seasonToSeasonVariance`
- `min`
- `max`
- `homeBatters`
- `awayBatters`
- `findIndex`
- `probablePitcher`
- `toISOString`
- `abstractGameState`
- `gameData`
- `detailedState`
- `codedGameState`
- `name`
- `rbiPerGame`
- `careerRBIPerGame`
- `sluggingPct`
- `expected`
- `confidence`
- `isTopOfOrder`
- `isBottomOfOrder`
- `runnersOnBaseFrequency`
- `rbiOpportunities`
- `runScoringOpportunities`
- `gamesStarted`
- `wins`
- `losses`
- `strikeouts`
- `walks`
- `saves`
- `hitBatsmen`
- `runsAllowedPerGame`
- `earnedRunAverage`
- `qualityStartPercentage`
- `runScoringVulnerability`
- `early`
- `middle`
- `late`
- `venueId`
- `season`
- `ceiling`
- `floor`
- `runFactors`
- `playerSkill`
- `lineupContext`
- `opposingPitcher`
- `ballparkFactor`
- `statusCode`
- `fullName`
- `rbiFactors`
- `rbis`
- `total`
- `points`

Unused properties:
- `pitchers`
- `environment`

---

### DailyMLBData

Defined in: `lib/mlb/types/game.ts`

Properties (5):
- `date: string`
- `games: Array<{
    gameId: number;
    gameTime: string;
    status: {
      abstractGameState?: string;
      detailedState?: string;
      statusCode?: string;
    };
    homeTeam: {
      id: number;
      name: string;
    };
    awayTeam: {
      id: number;
      name: string;
    };
    venue: {
      id: number;
      name: string;
    };
    lineups?: {
      away: number[];
      home: number[];
      awayBatters?: Array<{
        id: number;
        fullName: string;
        position: string;
      }>;
      homeBatters?: Array<{
        id: number;
        fullName: string;
        position: string;
      }>;
    };
    pitchers?: {
      away?: {
        id: number;
        fullName: string;
        throwsHand?: string;
      };
      home?: {
        id: number;
        fullName: string;
        throwsHand?: string;
      };
    };
    environment?: {
      temperature: number;
      windSpeed: number;
      windDirection: string;
      isOutdoor: boolean;
    };
    teamStats: {
      home: TeamStats;
      away: TeamStats;
    };
    ballpark: BallparkFactors;
  }>`
- `count: number`
- `collectTimestamp: Date`
- `seasons: string[]`

#### Usage Mismatches

- Extra properties (not in type definition): 82
- Unused properties (defined but not used): 0

**File**: `lib/mlb/daily-data-collector.ts`

Extra properties:
- `log`
- `entries`
- `ID`
- `Name`
- `Position`
- `Salary`
- `AvgPointsPerGame`
- `TeamAbbrev`
- `set`
- `size`
- `map`
- `dates`
- `gamePk`
- `gameDate`
- `status`
- `id`
- `team`
- `home`
- `teams`
- `name`
- `away`
- `venue`
- `probablePitcher`
- `fullName`
- `length`
- `slice`
- `all`
- `catch`
- `toString`
- `gameId`
- `warn`
- `message`
- `NUMERIC`
- `TEXT`
- `BOOLEAN`
- `homeTeam`
- `awayTeam`
- `environment`
- `teamStats`
- `ballpark`
- `lineups`
- `filter`
- `pitchers`
- `forEach`
- `get`
- `pitcherId`
- `draftKings`
- `salary`
- `position`
- `avgPointsPerGame`
- `opponent`
- `expectedPoints`
- `dfsProjection`
- `projections`
- `winProbability`
- `expectedStrikeouts`
- `expectedInnings`
- `gameTime`
- `from`
- `values`
- `batterId`
- `error`
- `mlbId`
- `temperature`
- `windSpeed`
- `windDirection`
- `isOutdoor`
- `hitting`
- `pitching`
- `overall`
- `types`
- `handedness`
- `singles`
- `doubles`
- `triples`
- `homeRuns`
- `runs`
- `rHB`
- `lHB`
- `precipitation`
- `draftKingsId`
- `positions`

---

### MLBWeatherData

Defined in: `lib/mlb/types/game.ts`

Properties (4):
- `condition: string`
- `temp: string`
- `wind: string`
- `sourceTimestamp: Date`

#### Usage Mismatches

- Extra properties (not in type definition): 39
- Unused properties (defined but not used): 0

**File**: `lib/mlb/weather/weather.ts`

Extra properties:
- `includes`
- `toLowerCase`
- `some`
- `gamePk`
- `error`
- `weather`
- `gameData`
- `toString`
- `venue`
- `roofType`
- `id`
- `roofStatus`
- `isOutdoor`
- `temperature`
- `speed`
- `direction`
- `isPrecipitation`
- `humidity`
- `pressure`
- `name`
- `isCalm`
- `windSpeed`
- `windDirection`
- `precipitation`
- `humidityPercent`
- `pressureMb`
- `venueId`
- `venueName`
- `hasRoof`
- `overall`
- `handedness`
- `types`
- `rHB`
- `lHB`
- `singles`
- `doubles`
- `triples`
- `homeRuns`
- `runs`

---

### Environment

Defined in: `lib/mlb/types/environment/weather.ts`

Properties (4):
- `temperature: number`
- `windSpeed: number`
- `windDirection: string`
- `isOutdoor: boolean`

#### Usage Mismatches

- Extra properties (not in type definition): 118
- Unused properties (defined but not used): 0

**File**: `lib/mlb/dfs-analysis/batter-analysis.ts`

Extra properties:
- `id`
- `isHome`
- `away`
- `pitchers`
- `home`
- `toString`
- `gameId`
- `environment`
- `ballpark`
- `total`
- `expected`
- `singles`
- `byType`
- `doubles`
- `triples`
- `homeRuns`
- `confidence`
- `error`
- `name`
- `throwsHand`
- `position`
- `venue`
- `lineupPosition`
- `overall`
- `types`
- `runs`
- `rbi`
- `expectedPoints`
- `hitProjections`
- `upside`
- `floor`
- `factors`
- `points`
- `weather`
- `career`
- `gamesPlayed`
- `atBats`
- `hits`
- `avg`
- `obp`
- `slg`
- `ops`
- `stolenBases`
- `caughtStealing`
- `walks`
- `strikeouts`
- `sacrificeFlies`
- `hitByPitches`
- `plateAppearances`
- `batterId`
- `team`
- `opponent`
- `opposingPitcher`
- `stats`
- `matchup`
- `projections`
- `draftKings`
- `seasonStats`
- `quality`
- `advantageScore`
- `platoonAdvantage`
- `historicalStats`
- `homeRunProbability`
- `stolenBaseProbability`
- `expectedHits`
- `dfsProjection`
- `breakdown`
- `platoon`
- `temperatureFactor`
- `windFactor`
- `overallFactor`
- `byHitType`
- `draftKingsId`
- `salary`
- `positions`
- `avgPointsPerGame`
- `battedBallQuality`
- `power`
- `contactRate`
- `plateApproach`
- `speed`
- `consistency`

**File**: `lib/mlb/weather/weather.ts`

Extra properties:
- `gamePk`
- `error`
- `gameData`
- `weather`
- `condition`
- `toString`
- `temp`
- `wind`
- `venue`
- `roofType`
- `id`
- `includes`
- `roofStatus`
- `speed`
- `direction`
- `isPrecipitation`
- `humidity`
- `pressure`
- `name`
- `precipitation`
- `humidityPercent`
- `pressureMb`
- `venueId`
- `venueName`
- `hasRoof`
- `sourceTimestamp`
- `overall`
- `handedness`
- `types`
- `rHB`
- `lHB`
- `singles`
- `doubles`
- `triples`
- `homeRuns`
- `runs`

---

### PlayerSBSeasonStats

Defined in: `lib/mlb/types/player/common.ts`

Properties (13):
- `playerId: number`
- `season: string`
- `stolenBases: number`
- `caughtStealing: number`
- `stolenBaseAttempts: number`
- `stolenBaseSuccess: number`
- `stolenBasePercentage: number`
- `gamesStolenBase: number`
- `attemptsPerGame: number`
- `successPerGame: number`
- `greenLightScore: number`
- `opportunityRate: number`
- `sprintSpeed: number`

#### Usage Mismatches

- Extra properties (not in type definition): 107
- Unused properties (defined but not used): 16

**File**: `lib/mlb/dfs-analysis/stolen-bases.ts`

Extra properties:
- `getFullYear`
- `seasonStats`
- `gamesPlayed`
- `runningMetrics`
- `avg`
- `error`
- `careerStats`
- `length`
- `forEach`
- `push`
- `sort`
- `sbRate`
- `fullName`
- `caughtStealingPercentage`
- `stolenBasesAllowed`
- `attemptsPer9`
- `defensiveRating`
- `currentTeam`
- `id`
- `team`
- `home`
- `teams`
- `gameData`
- `players`
- `boxscore`
- `liveData`
- `entries`
- `code`
- `position`
- `person`
- `warn`
- `all`
- `min`
- `max`
- `stolenBaseRate`
- `sprintSpeedPercentile`
- `round`
- `popTime`
- `slideStepTime`
- `holdRating`
- `precipitation`
- `temperature`
- `batter`
- `catcher`
- `pitcher`
- `context`
- `careerRate`
- `recentTrend`
- `attemptLikelihood`
- `successRateProjection`
- `battingAverage`
- `armStrength`
- `pickoffMoves`
- `timeToPlate`
- `expectedSteals`
- `stealAttemptProbability`
- `stealSuccessProbability`
- `factors`
- `confidence`
- `probability`
- `batterSpeed`
- `batterTendency`
- `catcherDefense`
- `pitcherHoldRate`
- `gameScriptFactor`
- `batterProfile`
- `pitcherHold`
- `gameContext`
- `expectedValue`

Unused properties:
- `stolenBaseAttempts`
- `stolenBasePercentage`
- `gamesStolenBase`
- `attemptsPerGame`
- `successPerGame`
- `greenLightScore`
- `opportunityRate`

**File**: `lib/mlb/player/base-stealing.ts`

Extra properties:
- `getFullYear`
- `people`
- `abbreviation`
- `primaryPosition`
- `stats`
- `splits`
- `find`
- `displayName`
- `group`
- `type`
- `toString`
- `stat`
- `gamesPlayed`
- `log`
- `avg`
- `error`
- `length`
- `forEach`
- `push`
- `sort`
- `sbRate`
- `all`
- `stolenBaseRate`
- `careerRate`
- `caughtStealingPercentage`
- `max`
- `min`
- `scoreMargin`
- `inning`
- `isHome`
- `recentTrend`
- `battingAverage`
- `factors`
- `playerBaseline`
- `careerTrend`
- `catcherImpact`
- `pitcherImpact`
- `situationalAdjustment`

Unused properties:
- `playerId`
- `stolenBaseAttempts`
- `stolenBasePercentage`
- `gamesStolenBase`
- `attemptsPerGame`
- `successPerGame`
- `greenLightScore`
- `opportunityRate`
- `sprintSpeed`

---

### PlayerSBCareerProfile

Defined in: `lib/mlb/types/player/batter.ts`

Properties (6):
- `careerStolenBases: number`
- `careerGames: number`
- `careerRate: number`
- `bestSeasonSB: number`
- `bestSeasonRate: number`
- `recentTrend: "increasing" | "decreasing" | "stable"`

#### Usage Mismatches

- Extra properties (not in type definition): 103
- Unused properties (defined but not used): 8

**File**: `lib/mlb/dfs-analysis/stolen-bases.ts`

Extra properties:
- `careerStats`
- `length`
- `forEach`
- `stolenBases`
- `gamesPlayed`
- `getFullYear`
- `season`
- `push`
- `sort`
- `sbRate`
- `error`
- `playerId`
- `fullName`
- `caughtStealingPercentage`
- `stolenBasesAllowed`
- `caughtStealing`
- `attemptsPer9`
- `defensiveRating`
- `currentTeam`
- `id`
- `team`
- `home`
- `teams`
- `gameData`
- `players`
- `boxscore`
- `liveData`
- `entries`
- `code`
- `position`
- `person`
- `warn`
- `all`
- `sprintSpeed`
- `runningMetrics`
- `min`
- `max`
- `stolenBaseRate`
- `stolenBaseSuccess`
- `sprintSpeedPercentile`
- `round`
- `popTime`
- `slideStepTime`
- `holdRating`
- `precipitation`
- `temperature`
- `batter`
- `catcher`
- `pitcher`
- `context`
- `attemptLikelihood`
- `successRateProjection`
- `armStrength`
- `pickoffMoves`
- `timeToPlate`
- `expectedSteals`
- `stealAttemptProbability`
- `stealSuccessProbability`
- `factors`
- `confidence`
- `probability`
- `batterSpeed`
- `batterTendency`
- `catcherDefense`
- `pitcherHoldRate`
- `gameScriptFactor`
- `batterProfile`
- `pitcherHold`
- `gameContext`
- `expectedValue`

Unused properties:
- `careerStolenBases`
- `careerGames`
- `bestSeasonSB`
- `bestSeasonRate`

**File**: `lib/mlb/player/base-stealing.ts`

Extra properties:
- `people`
- `stats`
- `splits`
- `find`
- `displayName`
- `group`
- `type`
- `length`
- `forEach`
- `stat`
- `stolenBases`
- `gamesPlayed`
- `getFullYear`
- `season`
- `push`
- `sort`
- `sbRate`
- `error`
- `all`
- `stolenBaseRate`
- `stolenBaseSuccess`
- `caughtStealingPercentage`
- `max`
- `min`
- `scoreMargin`
- `inning`
- `isHome`
- `factors`
- `playerBaseline`
- `careerTrend`
- `catcherImpact`
- `pitcherImpact`
- `situationalAdjustment`

Unused properties:
- `careerStolenBases`
- `careerGames`
- `bestSeasonSB`
- `bestSeasonRate`

---

### StolenBaseProjection

Defined in: `lib/mlb/types/player/batter.ts`

Properties (4):
- `expectedAttempts: number`
- `successProbability: number`
- `projectedSB: number`
- `factors: {
    playerBaseline: number;
    careerTrend: number;
    catcherImpact: number;
    pitcherImpact: number;
    situationalAdjustment: number;
  }`

#### Usage Mismatches

- Extra properties (not in type definition): 17
- Unused properties (defined but not used): 3

**File**: `lib/mlb/player/base-stealing.ts`

Extra properties:
- `all`
- `stolenBaseRate`
- `careerRate`
- `stolenBaseSuccess`
- `caughtStealingPercentage`
- `max`
- `min`
- `scoreMargin`
- `inning`
- `isHome`
- `recentTrend`
- `error`
- `playerBaseline`
- `careerTrend`
- `catcherImpact`
- `pitcherImpact`
- `situationalAdjustment`

Unused properties:
- `expectedAttempts`
- `successProbability`
- `projectedSB`

---

### StolenBaseContext

Defined in: `lib/mlb/types/player/batter.ts`

Properties (4):
- `isHome: boolean`
- `scoreMargin: number`
- `inning: number`
- `isCloseGame: boolean`

#### Usage Mismatches

- Extra properties (not in type definition): 15
- Unused properties (defined but not used): 1

**File**: `lib/mlb/player/base-stealing.ts`

Extra properties:
- `all`
- `stolenBaseRate`
- `careerRate`
- `stolenBaseSuccess`
- `caughtStealingPercentage`
- `max`
- `min`
- `recentTrend`
- `error`
- `factors`
- `playerBaseline`
- `careerTrend`
- `catcherImpact`
- `pitcherImpact`
- `situationalAdjustment`

Unused properties:
- `isCloseGame`

---

### BatterSplits

Defined in: `lib/mlb/types/player/batter.ts`

Properties (2):
- `vsLeft: {
    plateAppearances: number;
    atBats: number;
    hits: number;
    avg: number;
    obp: number;
    slg: number;
    ops: number;
    walkRate: number;
    strikeoutRate: number;
  }`
- `vsRight: {
    plateAppearances: number;
    atBats: number;
    hits: number;
    avg: number;
    obp: number;
    slg: number;
    ops: number;
    walkRate: number;
    strikeoutRate: number;
  }`

#### Usage Mismatches

- Extra properties (not in type definition): 20
- Unused properties (defined but not used): 0

**File**: `lib/mlb/player/batter-stats.ts`

Extra properties:
- `getFullYear`
- `splits`
- `stats`
- `stat`
- `find`
- `code`
- `split`
- `plateAppearances`
- `atBats`
- `hits`
- `avg`
- `obp`
- `slg`
- `ops`
- `baseOnBalls`
- `strikeOuts`
- `error`
- `player`
- `walkRate`
- `strikeoutRate`

---

### BatterStats

Defined in: `lib/mlb/types/player/batter.ts`

Properties (10):
- `id: number`
- `fullName: string`
- `currentTeam: string`
- `primaryPosition: string`
- `batSide: string`
- `seasonStats: BatterSeasonStats`
- `careerStats: Array<{
    season: string;
    team: string;
    gamesPlayed: number;
    atBats: number;
    hits: number;
    homeRuns: number;
    rbi: number;
    avg: number;
    obp: number;
    slg: number;
    ops: number;
    stolenBases: number;
    caughtStealing: number;
    hitByPitches: number;
    sacrificeFlies: number;
    walks: number;
    strikeouts: number;
    plateAppearances: number;
  }>`
- `lastGameStats: BatterSeasonStats`
- `lastFiveGames: BatterSeasonStats[]`
- `sourceTimestamp: Date`

#### Usage Mismatches

- Extra properties (not in type definition): 64
- Unused properties (defined but not used): 2

**File**: `lib/mlb/player/batter-stats.ts`

Extra properties:
- `getFullYear`
- `people`
- `warn`
- `error`
- `player`
- `stats`
- `splits`
- `find`
- `displayName`
- `group`
- `type`
- `stat`
- `season`
- `toString`
- `atBats`
- `hits`
- `doubles`
- `triples`
- `homeRuns`
- `walks`
- `strikeouts`
- `plateAppearances`
- `hitByPitch`
- `sacrificeFlies`
- `stolenBases`
- `caughtStealing`
- `name`
- `abbreviation`
- `code`
- `gamesPlayed`
- `rbi`
- `avg`
- `obp`
- `slg`
- `ops`
- `runs`
- `map`
- `team`
- `hitByPitches`
- `baseOnBalls`
- `strikeOuts`
- `split`
- `rbis`
- `babip`
- `iso`
- `hrRate`
- `kRate`
- `bbRate`
- `sbRate`
- `playerId`
- `discipline`
- `pitchTypePerformance`
- `chaseRate`
- `contactRate`
- `zoneSwingRate`
- `whiffRate`
- `firstPitchSwingRate`
- `vsFastball`
- `vsBreakingBall`
- `vsOffspeed`
- `vsLeft`
- `vsRight`
- `walkRate`
- `strikeoutRate`

Unused properties:
- `lastGameStats`
- `lastFiveGames`

---

### CatcherDefenseMetrics

Defined in: `lib/mlb/types/player/common.ts`

Properties (12):
- `playerId: number`
- `fullName: string`
- `caughtStealingPercentage: number`
- `stolenBasesAllowed: number`
- `caughtStealing: number`
- `attemptsPer9: number`
- `popTime: number`
- `armStrength: number`
- `defensiveRating: number`
- `teamRank: number`
- `runs_saved_vs_running: number`
- `sourceTimestamp: Date`

#### Usage Mismatches

- Extra properties (not in type definition): 75
- Unused properties (defined but not used): 5

**File**: `lib/mlb/dfs-analysis/stolen-bases.ts`

Extra properties:
- `getFullYear`
- `error`
- `currentTeam`
- `id`
- `team`
- `home`
- `teams`
- `gameData`
- `players`
- `boxscore`
- `liveData`
- `entries`
- `code`
- `position`
- `person`
- `warn`
- `all`
- `sprintSpeed`
- `runningMetrics`
- `min`
- `max`
- `stolenBaseRate`
- `stolenBaseSuccess`
- `sprintSpeedPercentile`
- `round`
- `slideStepTime`
- `holdRating`
- `precipitation`
- `temperature`
- `batter`
- `catcher`
- `pitcher`
- `context`
- `careerRate`
- `recentTrend`
- `attemptLikelihood`
- `successRateProjection`
- `pickoffMoves`
- `timeToPlate`
- `expectedSteals`
- `stealAttemptProbability`
- `stealSuccessProbability`
- `factors`
- `confidence`
- `probability`
- `batterSpeed`
- `batterTendency`
- `catcherDefense`
- `pitcherHoldRate`
- `gameScriptFactor`
- `batterProfile`
- `pitcherHold`
- `gameContext`
- `expectedValue`

Unused properties:
- `teamRank`
- `runs_saved_vs_running`
- `sourceTimestamp`

**File**: `lib/mlb/player/defense-stats.ts`

Extra properties:
- `getFullYear`
- `people`
- `abbreviation`
- `primaryPosition`
- `stats`
- `splits`
- `find`
- `displayName`
- `group`
- `type`
- `toString`
- `stat`
- `season`
- `name`
- `position`
- `passedBall`
- `innings`
- `max`
- `min`
- `error`
- `player`

Unused properties:
- `teamRank`
- `runs_saved_vs_running`

---

### BatteryVulnerability

Defined in: `lib/mlb/types/player/common.ts`

Properties (4):
- `vulnerability: number`
- `catcherFactor: number`
- `pitcherFactor: number`
- `catcherMetrics: CatcherDefenseMetrics | null`

#### Usage Mismatches

- Extra properties (not in type definition): 5
- Unused properties (defined but not used): 4

**File**: `lib/mlb/player/defense-stats.ts`

Extra properties:
- `getFullYear`
- `max`
- `min`
- `caughtStealingPercentage`
- `error`

Unused properties:
- `vulnerability`
- `catcherFactor`
- `pitcherFactor`
- `catcherMetrics`

---

### MatchupAnalysis

Defined in: `lib/mlb/types/player/matchups.ts`

Properties (2):
- `projections: {
    expectedOutcome: string; // e.g., "Strong advantage batter", "Slight advantage pitcher"
    hitProbability: number; // 0-1
    hrProbability: number; // 0-1
    kProbability: number; // 0-1
    expectedDfsPoints: number; // For the batter
  }`
- `factors: {
    handedness: number; // Impact of platoon advantage (0-10)
    recentForm: number; // Recent performance factor (0-10)
    ballparkFactor: number; // Impact of ballpark (0-10)
    weatherFactor: number; // Impact of weather (0-10)
  }`

#### Usage Mismatches

- Extra properties (not in type definition): 61
- Unused properties (defined but not used): 1

**File**: `lib/mlb/player/matchups.ts`

Extra properties:
- `all`
- `atBats`
- `stats`
- `ops`
- `historicalSuccess`
- `push`
- `fastball`
- `pitches`
- `sinker`
- `vsFastball`
- `pitchTypePerformance`
- `toFixed`
- `slider`
- `curve`
- `vsBreakingBall`
- `changeup`
- `other`
- `vsOffspeed`
- `chaseRate`
- `discipline`
- `zonePercentage`
- `controlMetrics`
- `pitchTypeAdvantage`
- `min`
- `max`
- `throwsHand`
- `pitcher`
- `batsHand`
- `batter`
- `plateSplitAdvantage`
- `seasonStats`
- `wOBAvsL`
- `wOBAvsR`
- `last30wOBA`
- `obp`
- `slg`
- `recentForm`
- `era`
- `whip`
- `toString`
- `getFullYear`
- `velocityTrends`
- `velocityChange`
- `velocityTrend`
- `reduce`
- `values`
- `error`
- `hits`
- `homeRuns`
- `strikeouts`
- `sqrt`
- `avg`
- `inningsPitched`
- `walks`
- `homeRunsAllowed`
- `historicalMatchup`
- `matchupRating`
- `advantagePlayer`
- `confidenceScore`
- `keyInsights`
- `hitByPitch`

Unused properties:
- `projections`

---

### PitcherHoldMetrics

Defined in: `lib/mlb/types/player/pitcher.ts`

Properties (5):
- `pickoffMoves: number`
- `slideStepTime: number`
- `timeToPlate: number`
- `stolenBaseAllowedRate: number`
- `holdRating: number`

#### Usage Mismatches

- Extra properties (not in type definition): 52
- Unused properties (defined but not used): 1

**File**: `lib/mlb/dfs-analysis/stolen-bases.ts`

Extra properties:
- `getFullYear`
- `error`
- `currentTeam`
- `id`
- `team`
- `home`
- `teams`
- `gameData`
- `players`
- `boxscore`
- `liveData`
- `entries`
- `code`
- `position`
- `person`
- `warn`
- `all`
- `sprintSpeed`
- `runningMetrics`
- `min`
- `max`
- `stolenBaseRate`
- `stolenBaseSuccess`
- `sprintSpeedPercentile`
- `round`
- `defensiveRating`
- `popTime`
- `precipitation`
- `temperature`
- `batter`
- `catcher`
- `pitcher`
- `context`
- `careerRate`
- `recentTrend`
- `attemptLikelihood`
- `successRateProjection`
- `expectedSteals`
- `stealAttemptProbability`
- `stealSuccessProbability`
- `factors`
- `confidence`
- `probability`
- `batterSpeed`
- `batterTendency`
- `catcherDefense`
- `pitcherHoldRate`
- `gameScriptFactor`
- `batterProfile`
- `pitcherHold`
- `gameContext`
- `expectedValue`

Unused properties:
- `stolenBaseAllowedRate`

---

### PitcherStats

Defined in: `lib/mlb/types/player/pitcher.ts`

Properties (8):
- `id: number`
- `fullName: string`
- `currentTeam: string`
- `primaryPosition: string`
- `pitchHand: string`
- `seasonStats: {
    [season: string]: PitcherSeasonStats;
  }`
- `careerStats: PitcherCareerStatsSeason[]`
- `sourceTimestamp: Date`

#### Usage Mismatches

- Extra properties (not in type definition): 73
- Unused properties (defined but not used): 0

**File**: `lib/mlb/player/pitcher-stats.ts`

Extra properties:
- `getFullYear`
- `time`
- `log`
- `stringify`
- `people`
- `timeEnd`
- `find`
- `stats`
- `displayName`
- `group`
- `type`
- `splits`
- `length`
- `warn`
- `error`
- `now`
- `player`
- `homeRuns`
- `homeRunsAllowed`
- `inningsPitched`
- `round`
- `forEach`
- `season`
- `stat`
- `gamesPlayed`
- `gamesStarted`
- `wins`
- `losses`
- `era`
- `whip`
- `strikeouts`
- `baseOnBalls`
- `walks`
- `saves`
- `hitBatsmen`
- `name`
- `team`
- `teams`
- `abbreviation`
- `code`
- `map`
- `hits`
- `batSide`
- `atBats`
- `avg`
- `obp`
- `slg`
- `ops`
- `max`
- `min`
- `playerId`
- `pitches`
- `averageVelocity`
- `effectiveness`
- `controlMetrics`
- `fastball`
- `slider`
- `curve`
- `changeup`
- `sinker`
- `cutter`
- `other`
- `zonePercentage`
- `firstPitchStrikePercent`
- `swingingStrikePercent`
- `chaseRate`
- `pitcher`
- `batter`
- `throwsHand`
- `batsHand`
- `flyBallPct`
- `hrPerFlyBall`
- `homeRunVulnerability`

---

### PitcherHomeRunVulnerability

Defined in: `lib/mlb/types/player/pitcher.ts`

Properties (7):
- `gamesStarted: number`
- `inningsPitched: number`
- `homeRunsAllowed: number`
- `hrPer9: number`
- `flyBallPct: number`
- `hrPerFlyBall: number`
- `homeRunVulnerability: number`

#### Usage Mismatches

- Extra properties (not in type definition): 48
- Unused properties (defined but not used): 2

**File**: `lib/mlb/dfs-analysis/home-runs.ts`

Extra properties:
- `getFullYear`
- `seasonStats`
- `hardHitPercent`
- `resultMetrics`
- `barrelRate`
- `max`
- `min`
- `error`
- `all`
- `toString`
- `homeRunRate`
- `hardHitPct`
- `types`
- `homeRuns`
- `isOutdoor`
- `temperature`
- `windSpeed`
- `windDirection`
- `toLowerCase`
- `includes`
- `homeFieldAdvantage`
- `homeVsAway`
- `batterProfile`
- `pitcherVulnerability`
- `ballpark`
- `weather`
- `platoonAdvantage`
- `venueId`
- `season`
- `gamePk`
- `probability`
- `homeRunProbability`
- `expectedHomeRuns`
- `factors`
- `batterPower`
- `ballparkFactor`
- `weatherFactor`
- `recentForm`
- `confidence`
- `expectedValue`

Unused properties:
- `hrPer9`

**File**: `lib/mlb/player/pitcher-stats.ts`

Extra properties:
- `getFullYear`
- `seasonStats`
- `era`
- `round`
- `gamesPlayed`
- `max`
- `min`
- `error`

Unused properties:
- `hrPer9`

---

### PitchTypeData

Defined in: `lib/mlb/types/statcast.ts`

Properties (17):
- `pitch_type: string`
- `count: number`
- `percentage: number`
- `velocity: number`
- `spin_rate: number`
- `vertical_movement: number`
- `horizontal_movement: number`
- `whiff_rate: number`
- `put_away_rate: number`
- `release_extension: number`
- `release_height: number`
- `zone_rate: number`
- `chase_rate: number`
- `zone_contact_rate: number`
- `chase_contact_rate: number`
- `batting_avg_against: number`
- `expected_woba: number`

#### Usage Mismatches

- Extra properties (not in type definition): 162
- Unused properties (defined but not used): 0

**File**: `lib/mlb/savant.ts`

Extra properties:
- `split`
- `trim`
- `length`
- `log`
- `findIndex`
- `max`
- `parse`
- `push`
- `warn`
- `error`
- `forEach`
- `reduce`
- `values`
- `fastball`
- `slider`
- `curve`
- `changeup`
- `sinker`
- `cutter`
- `splitter`
- `sweep`
- `fork`
- `knuckle`
- `other`
- `name`
- `team`
- `team_id`
- `handedness`
- `season_stats`
- `control_metrics`
- `first_pitch_strike`
- `csw_rate`
- `called_strike_rate`
- `edge_percent`
- `movement_metrics`
- `horizontal_break`
- `induced_vertical_break`
- `result_metrics`
- `hard_hit_percent`
- `slugging_against`
- `woba_against`
- `pitches`
- `pitch_percent`
- `pitch_usage`
- `whiff_percent`
- `put_away`
- `k_percent`
- `get`
- `set`
- `entries`
- `pitch_mix`
- `toFixed`
- `toString`
- `player_name`
- `p_throws`
- `zone_percent`
- `zone_percentage`
- `first_pitch_strike_percent`
- `o_swing_percent`
- `outside_zone_swing_percent`
- `csw_percent`
- `g`
- `games`
- `ip`
- `innings_pitched`
- `era`
- `whip`
- `strikeout_percent`
- `bb_percent`
- `walk_percent`
- `hr_9`
- `home_runs_per_nine`
- `gb_percent`
- `ground_ball_percent`
- `pitch_name`
- `ba`
- `slg`
- `woba`
- `est_woba`
- `getFullYear`
- `ok`
- `status`
- `statusText`
- `text`
- `includes`
- `batting_metrics`
- `sweet_spot_percent`
- `anglesweetspotpercent`
- `sweet_spot_rate`
- `sweet_spot`
- `ev95percent`
- `hard_hit_rate`
- `hard_hit`
- `stand`
- `b_stands`
- `avg`
- `obp`
- `ops`
- `xwoba`
- `exit_velocity_avg`
- `launch_speed`
- `avg_hit_speed`
- `barrel_percent`
- `barrel_batted_rate`
- `brl_percent`
- `barrels_per_bbe_percent`
- `so`
- `pa`
- `bb`
- `ab`
- `at_bats`
- `h`
- `hits`
- `hr`
- `home_runs`
- `rbi`
- `rbis`
- `sb`
- `stolen_bases`
- `toLowerCase`
- `sort`
- `value`
- `abs`
- `min`
- `all`
- `player_id`
- `velocity_trends`
- `command_metrics`
- `middle_percent`
- `plate_discipline`
- `z_swing_percent`
- `swing_percent`
- `o_contact_percent`
- `z_contact_percent`
- `contact_percent`
- `k_rate`
- `bb_rate`
- `hr_rate`
- `ground_ball_rate`
- `year`
- `player_type`
- `group_by`
- `headers`
- `Accept`
- `min_pa`
- `position`
- `sort_col`
- `sort_order`
- `min_results`
- `metrics`
- `csv`
- `details`
- `platoon_splits`
- `pitch_type_performance`
- `vs_left`
- `vs_right`
- `vs_fastball`
- `vs_breaking`
- `vs_offspeed`
- `plate_appearances`
- `season`
- `launchAngle`

---

### PitchUsage

Defined in: `lib/mlb/types/statcast.ts`

Properties (11):
- `fastball: number`
- `slider: number`
- `curve: number`
- `changeup: number`
- `sinker: number`
- `cutter: number`
- `splitter: number`
- `sweep: number`
- `fork: number`
- `knuckle: number`
- `other: number`

#### Usage Mismatches

- Extra properties (not in type definition): 168
- Unused properties (defined but not used): 0

**File**: `lib/mlb/savant.ts`

Extra properties:
- `forEach`
- `parse`
- `warn`
- `pitch_type`
- `count`
- `reduce`
- `values`
- `name`
- `team`
- `team_id`
- `handedness`
- `season_stats`
- `control_metrics`
- `zone_rate`
- `first_pitch_strike`
- `whiff_rate`
- `chase_rate`
- `csw_rate`
- `called_strike_rate`
- `edge_percent`
- `zone_contact_rate`
- `chase_contact_rate`
- `movement_metrics`
- `horizontal_break`
- `induced_vertical_break`
- `release_extension`
- `release_height`
- `result_metrics`
- `hard_hit_percent`
- `batting_avg_against`
- `slugging_against`
- `woba_against`
- `expected_woba`
- `length`
- `pitches`
- `pitch_percent`
- `pitch_usage`
- `velocity`
- `whiff_percent`
- `put_away`
- `k_percent`
- `get`
- `percentage`
- `put_away_rate`
- `set`
- `entries`
- `push`
- `pitch_mix`
- `log`
- `toFixed`
- `error`
- `split`
- `trim`
- `findIndex`
- `toString`
- `player_name`
- `p_throws`
- `zone_percent`
- `zone_percentage`
- `first_pitch_strike_percent`
- `o_swing_percent`
- `outside_zone_swing_percent`
- `csw_percent`
- `g`
- `games`
- `ip`
- `innings_pitched`
- `era`
- `whip`
- `strikeout_percent`
- `bb_percent`
- `walk_percent`
- `hr_9`
- `home_runs_per_nine`
- `gb_percent`
- `ground_ball_percent`
- `spin_rate`
- `pitch_name`
- `ba`
- `slg`
- `woba`
- `est_woba`
- `getFullYear`
- `ok`
- `status`
- `statusText`
- `text`
- `includes`
- `batting_metrics`
- `sweet_spot_percent`
- `anglesweetspotpercent`
- `sweet_spot_rate`
- `sweet_spot`
- `ev95percent`
- `hard_hit_rate`
- `hard_hit`
- `stand`
- `b_stands`
- `avg`
- `obp`
- `ops`
- `xwoba`
- `exit_velocity_avg`
- `launch_speed`
- `avg_hit_speed`
- `barrel_percent`
- `barrel_batted_rate`
- `brl_percent`
- `barrels_per_bbe_percent`
- `so`
- `pa`
- `bb`
- `ab`
- `at_bats`
- `h`
- `hits`
- `hr`
- `home_runs`
- `rbi`
- `rbis`
- `sb`
- `stolen_bases`
- `toLowerCase`
- `max`
- `sort`
- `value`
- `abs`
- `min`
- `all`
- `player_id`
- `velocity_trends`
- `command_metrics`
- `middle_percent`
- `plate_discipline`
- `z_swing_percent`
- `swing_percent`
- `o_contact_percent`
- `z_contact_percent`
- `contact_percent`
- `k_rate`
- `bb_rate`
- `hr_rate`
- `ground_ball_rate`
- `vertical_movement`
- `horizontal_movement`
- `year`
- `player_type`
- `group_by`
- `headers`
- `Accept`
- `min_pa`
- `position`
- `sort_col`
- `sort_order`
- `min_results`
- `metrics`
- `csv`
- `details`
- `platoon_splits`
- `pitch_type_performance`
- `vs_left`
- `vs_right`
- `vs_fastball`
- `vs_breaking`
- `vs_offspeed`
- `plate_appearances`
- `season`
- `launchAngle`

---

### PitcherStatcastData

Defined in: `lib/mlb/types/statcast.ts`

Properties (13):
- `player_id: number`
- `name: string`
- `team: string`
- `team_id: number`
- `handedness: string`
- `pitch_mix: PitchTypeData[]`
- `pitches: PitchUsage`
- `velocity_trends: PitcherVelocityTrend[]`
- `control_metrics: {
    zone_rate: number;
    first_pitch_strike: number;
    whiff_rate: number;
    chase_rate: number;
    csw_rate: number;
    called_strike_rate?: number;
    edge_percent?: number;
    zone_contact_rate?: number;
    chase_contact_rate?: number;
  }`
- `movement_metrics: {
    horizontal_break: number;
    induced_vertical_break: number;
    release_extension: number;
    release_height: number;
  }`
- `result_metrics: {
    hard_hit_percent: number;
    batting_avg_against: number;
    slugging_against: number;
    woba_against: number;
    expected_woba: number;
  }`
- `command_metrics: {
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
  }`
- `season_stats: {
    games: number;
    innings_pitched: number;
    era: number;
    whip: number;
    k_rate: number;
    bb_rate: number;
    hr_rate: number;
    ground_ball_rate: number;
  }`

#### Usage Mismatches

- Extra properties (not in type definition): 181
- Unused properties (defined but not used): 11

**File**: `lib/mlb/savant.ts`

Extra properties:
- `getFullYear`
- `log`
- `length`
- `warn`
- `error`
- `ok`
- `status`
- `statusText`
- `text`
- `includes`
- `trim`
- `split`
- `join`
- `forEach`
- `pitch_type`
- `pitch_name`
- `pitch_usage`
- `push`
- `toString`
- `min`
- `findIndex`
- `max`
- `parse`
- `count`
- `reduce`
- `values`
- `fastball`
- `slider`
- `curve`
- `changeup`
- `sinker`
- `cutter`
- `splitter`
- `sweep`
- `fork`
- `knuckle`
- `other`
- `zone_rate`
- `first_pitch_strike`
- `whiff_rate`
- `chase_rate`
- `csw_rate`
- `called_strike_rate`
- `edge_percent`
- `zone_contact_rate`
- `chase_contact_rate`
- `horizontal_break`
- `induced_vertical_break`
- `release_extension`
- `release_height`
- `hard_hit_percent`
- `batting_avg_against`
- `slugging_against`
- `woba_against`
- `expected_woba`
- `pitch_percent`
- `velocity`
- `whiff_percent`
- `put_away`
- `k_percent`
- `get`
- `percentage`
- `put_away_rate`
- `set`
- `entries`
- `toFixed`
- `player_name`
- `p_throws`
- `zone_percent`
- `zone_percentage`
- `first_pitch_strike_percent`
- `o_swing_percent`
- `outside_zone_swing_percent`
- `csw_percent`
- `g`
- `games`
- `ip`
- `innings_pitched`
- `era`
- `whip`
- `strikeout_percent`
- `bb_percent`
- `walk_percent`
- `hr_9`
- `home_runs_per_nine`
- `gb_percent`
- `ground_ball_percent`
- `spin_rate`
- `ba`
- `slg`
- `woba`
- `est_woba`
- `batting_metrics`
- `sweet_spot_percent`
- `anglesweetspotpercent`
- `sweet_spot_rate`
- `sweet_spot`
- `ev95percent`
- `hard_hit_rate`
- `hard_hit`
- `stand`
- `b_stands`
- `avg`
- `obp`
- `ops`
- `xwoba`
- `exit_velocity_avg`
- `launch_speed`
- `avg_hit_speed`
- `barrel_percent`
- `barrel_batted_rate`
- `brl_percent`
- `barrels_per_bbe_percent`
- `so`
- `pa`
- `bb`
- `ab`
- `at_bats`
- `h`
- `hits`
- `hr`
- `home_runs`
- `rbi`
- `rbis`
- `sb`
- `stolen_bases`
- `toLowerCase`
- `sort`
- `value`
- `abs`
- `all`
- `headers`
- `Accept`
- `type`
- `usage`
- `year`
- `player_type`
- `group_by`
- `min_pitches`
- `details`
- `metrics`
- `sort_col`
- `sort_order`
- `csv`
- `vertical_movement`
- `horizontal_movement`
- `middle_percent`
- `plate_discipline`
- `z_swing_percent`
- `swing_percent`
- `o_contact_percent`
- `z_contact_percent`
- `contact_percent`
- `k_rate`
- `bb_rate`
- `hr_rate`
- `ground_ball_rate`
- `min_pa`
- `position`
- `min_results`
- `platoon_splits`
- `pitch_type_performance`
- `vs_left`
- `vs_right`
- `vs_fastball`
- `vs_breaking`
- `vs_offspeed`
- `plate_appearances`
- `season`
- `launchAngle`

**File**: `lib/mlb/services/pitcher-data-service.ts`

Extra properties:
- `filter`
- `includes`
- `pitch_type`
- `length`
- `reduce`
- `count`
- `velocity`
- `max`
- `map`
- `max_velocity`
- `spin_rate`

Unused properties:
- `player_id`
- `name`
- `team`
- `team_id`
- `handedness`
- `pitches`
- `control_metrics`
- `movement_metrics`
- `result_metrics`
- `command_metrics`
- `season_stats`

---

### BatterStatcastData

Defined in: `lib/mlb/types/statcast.ts`

Properties (10):
- `player_id: number`
- `name: string`
- `team: string`
- `team_id: number`
- `handedness: string`
- `batting_metrics: {
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
  }`
- `platoon_splits: {
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
  }`
- `pitch_type_performance: {
    vs_fastball: number; // Score 0-100
    vs_breaking: number;
    vs_offspeed: number;
  }`
- `recent_performance: {
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
  }`
- `season_stats: {
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
  }`

#### Usage Mismatches

- Extra properties (not in type definition): 89
- Unused properties (defined but not used): 1

**File**: `lib/mlb/savant.ts`

Extra properties:
- `getFullYear`
- `log`
- `toString`
- `ok`
- `status`
- `statusText`
- `text`
- `includes`
- `length`
- `trim`
- `sweet_spot_percent`
- `hard_hit_percent`
- `error`
- `split`
- `findIndex`
- `forEach`
- `anglesweetspotpercent`
- `sweet_spot_rate`
- `sweet_spot`
- `ev95percent`
- `hard_hit_rate`
- `hard_hit`
- `player_name`
- `stand`
- `b_stands`
- `ba`
- `avg`
- `obp`
- `slg`
- `ops`
- `woba`
- `xwoba`
- `expected_woba`
- `exit_velocity_avg`
- `launch_speed`
- `avg_hit_speed`
- `barrel_percent`
- `barrel_batted_rate`
- `brl_percent`
- `barrels_per_bbe_percent`
- `k_percent`
- `strikeout_percent`
- `so`
- `pa`
- `bb_percent`
- `walk_percent`
- `bb`
- `g`
- `games`
- `ab`
- `at_bats`
- `h`
- `hits`
- `hr`
- `home_runs`
- `rbi`
- `rbis`
- `sb`
- `stolen_bases`
- `toLowerCase`
- `warn`
- `max`
- `push`
- `sort`
- `value`
- `abs`
- `min`
- `all`
- `year`
- `player_type`
- `group_by`
- `headers`
- `Accept`
- `min_pa`
- `position`
- `sort_col`
- `sort_order`
- `min_results`
- `metrics`
- `csv`
- `details`
- `vs_left`
- `vs_right`
- `vs_fastball`
- `vs_breaking`
- `vs_offspeed`
- `plate_appearances`
- `season`
- `launchAngle`

Unused properties:
- `recent_performance`

---

### TeamStatcastData

Defined in: `lib/mlb/types/statcast.ts`

Properties (7):
- `team_id: number`
- `team_name: string`
- `team_abbrev: string`
- `team_record: {
    wins: number;
    losses: number;
    win_pct: number;
  }`
- `batting_stats: {
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
  }`
- `pitching_stats: {
    era: number;
    whip: number;
    k_per_9: number;
    bb_per_9: number;
    hr_per_9: number;
    fip: number;
    quality_start_percent: number;
  }`
- `roster: {
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
  }`

#### Usage Mismatches

- Extra properties (not in type definition): 31
- Unused properties (defined but not used): 7

**File**: `lib/mlb/savant.ts`

Extra properties:
- `getFullYear`
- `log`
- `error`
- `ok`
- `status`
- `statusText`
- `text`
- `includes`
- `length`
- `trim`
- `toString`
- `split`
- `findIndex`
- `toLowerCase`
- `warn`
- `max`
- `push`
- `sort`
- `value`
- `forEach`
- `abs`
- `min`
- `all`
- `headers`
- `Accept`
- `season`
- `player_type`
- `player_id`
- `launchAngle`
- `sweet_spot_percent`
- `hard_hit_percent`

Unused properties:
- `team_id`
- `team_name`
- `team_abbrev`
- `team_record`
- `batting_stats`
- `pitching_stats`
- `roster`

---

### LeaderboardResponse

Defined in: `lib/mlb/types/statcast.ts`

Properties (4):
- `leaderboard: Array<{
    player_id: number;
    name: string;
    team: string;
    value: number;
  }>`
- `metric: string`
- `season: string`
- `player_type: "pitcher" | "batter"`

#### Usage Mismatches

- Extra properties (not in type definition): 29
- Unused properties (defined but not used): 2

**File**: `lib/mlb/savant.ts`

Extra properties:
- `getFullYear`
- `log`
- `ok`
- `status`
- `statusText`
- `text`
- `includes`
- `length`
- `trim`
- `toString`
- `error`
- `split`
- `findIndex`
- `toLowerCase`
- `warn`
- `max`
- `push`
- `sort`
- `value`
- `forEach`
- `abs`
- `min`
- `all`
- `headers`
- `Accept`
- `player_id`
- `launchAngle`
- `sweet_spot_percent`
- `hard_hit_percent`

Unused properties:
- `leaderboard`
- `metric`

---

### StatcastPitch

Defined in: `lib/mlb/types/statcast.ts`

Properties (5):
- `pitch_type: string`
- `count: number`
- `velocity: number`
- `whiff_rate: number`
- `put_away_rate: number`

#### Usage Mismatches

- Extra properties (not in type definition): 98
- Unused properties (defined but not used): 0

**File**: `lib/mlb/player/matchups.ts`

Extra properties:
- `reduce`
- `forEach`
- `keys`
- `round`
- `min`
- `max`
- `length`
- `sort`
- `filter`
- `includes`
- `getTime`
- `game_date`
- `map`
- `slice`
- `avg_velocity`
- `velocity_change`
- `toFixed`
- `player`
- `all`
- `atBats`
- `stats`
- `ops`
- `historicalSuccess`
- `push`
- `fastball`
- `pitches`
- `sinker`
- `vsFastball`
- `pitchTypePerformance`
- `slider`
- `curve`
- `vsBreakingBall`
- `changeup`
- `other`
- `vsOffspeed`
- `chaseRate`
- `discipline`
- `zonePercentage`
- `controlMetrics`
- `pitchTypeAdvantage`
- `throwsHand`
- `pitcher`
- `batsHand`
- `batter`
- `plateSplitAdvantage`
- `seasonStats`
- `wOBAvsL`
- `wOBAvsR`
- `last30wOBA`
- `obp`
- `slg`
- `recentForm`
- `era`
- `whip`
- `toString`
- `getFullYear`
- `velocityTrends`
- `velocityChange`
- `velocityTrend`
- `values`
- `error`
- `hits`
- `homeRuns`
- `strikeouts`
- `sqrt`
- `avg`
- `inningsPitched`
- `walks`
- `homeRunsAllowed`
- `FF`
- `FT`
- `FA`
- `SL`
- `CU`
- `KC`
- `CH`
- `SI`
- `FC`
- `cutter`
- `playerId`
- `name`
- `averageVelocity`
- `effectiveness`
- `sourceTimestamp`
- `firstPitchStrikePercent`
- `swingingStrikePercent`
- `date`
- `avgVelocity`
- `change`
- `seasonAvg`
- `recent15DayAvg`
- `historicalMatchup`
- `matchupRating`
- `advantagePlayer`
- `confidenceScore`
- `factors`
- `keyInsights`
- `hitByPitch`

---

### StatcastData

Defined in: `lib/mlb/types/statcast.ts`

Properties (4):
- `pitch_mix: StatcastPitch[]`
- `control_metrics: StatcastControlMetrics`
- `velocity_trends: StatcastVelocityTrend[]`
- `is_default_data: boolean`

#### Usage Mismatches

- Extra properties (not in type definition): 191
- Unused properties (defined but not used): 3

**File**: `lib/mlb/savant.ts`

Extra properties:
- `getFullYear`
- `log`
- `length`
- `warn`
- `error`
- `ok`
- `status`
- `statusText`
- `text`
- `includes`
- `trim`
- `split`
- `join`
- `forEach`
- `player_id`
- `pitch_type`
- `pitch_name`
- `pitch_usage`
- `pitches`
- `push`
- `toString`
- `min`
- `findIndex`
- `max`
- `parse`
- `count`
- `reduce`
- `values`
- `fastball`
- `slider`
- `curve`
- `changeup`
- `sinker`
- `cutter`
- `splitter`
- `sweep`
- `fork`
- `knuckle`
- `other`
- `name`
- `team`
- `team_id`
- `handedness`
- `season_stats`
- `zone_rate`
- `first_pitch_strike`
- `whiff_rate`
- `chase_rate`
- `csw_rate`
- `called_strike_rate`
- `edge_percent`
- `zone_contact_rate`
- `chase_contact_rate`
- `movement_metrics`
- `horizontal_break`
- `induced_vertical_break`
- `release_extension`
- `release_height`
- `result_metrics`
- `hard_hit_percent`
- `batting_avg_against`
- `slugging_against`
- `woba_against`
- `expected_woba`
- `pitch_percent`
- `velocity`
- `whiff_percent`
- `put_away`
- `k_percent`
- `get`
- `percentage`
- `put_away_rate`
- `set`
- `entries`
- `toFixed`
- `player_name`
- `p_throws`
- `zone_percent`
- `zone_percentage`
- `first_pitch_strike_percent`
- `o_swing_percent`
- `outside_zone_swing_percent`
- `csw_percent`
- `g`
- `games`
- `ip`
- `innings_pitched`
- `era`
- `whip`
- `strikeout_percent`
- `bb_percent`
- `walk_percent`
- `hr_9`
- `home_runs_per_nine`
- `gb_percent`
- `ground_ball_percent`
- `spin_rate`
- `ba`
- `slg`
- `woba`
- `est_woba`
- `batting_metrics`
- `sweet_spot_percent`
- `anglesweetspotpercent`
- `sweet_spot_rate`
- `sweet_spot`
- `ev95percent`
- `hard_hit_rate`
- `hard_hit`
- `stand`
- `b_stands`
- `avg`
- `obp`
- `ops`
- `xwoba`
- `exit_velocity_avg`
- `launch_speed`
- `avg_hit_speed`
- `barrel_percent`
- `barrel_batted_rate`
- `brl_percent`
- `barrels_per_bbe_percent`
- `so`
- `pa`
- `bb`
- `ab`
- `at_bats`
- `h`
- `hits`
- `hr`
- `home_runs`
- `rbi`
- `rbis`
- `sb`
- `stolen_bases`
- `toLowerCase`
- `sort`
- `value`
- `abs`
- `all`
- `headers`
- `Accept`
- `type`
- `usage`
- `year`
- `player_type`
- `group_by`
- `min_pitches`
- `details`
- `metrics`
- `sort_col`
- `sort_order`
- `csv`
- `vertical_movement`
- `horizontal_movement`
- `command_metrics`
- `middle_percent`
- `plate_discipline`
- `z_swing_percent`
- `swing_percent`
- `o_contact_percent`
- `z_contact_percent`
- `contact_percent`
- `k_rate`
- `bb_rate`
- `hr_rate`
- `ground_ball_rate`
- `min_pa`
- `position`
- `min_results`
- `platoon_splits`
- `pitch_type_performance`
- `vs_left`
- `vs_right`
- `vs_fastball`
- `vs_breaking`
- `vs_offspeed`
- `plate_appearances`
- `season`
- `launchAngle`

Unused properties:
- `is_default_data`

**File**: `lib/mlb/services/pitcher-data-service.ts`

Extra properties:
- `filter`
- `includes`
- `pitch_type`
- `length`
- `reduce`
- `count`
- `velocity`
- `max`
- `map`
- `max_velocity`
- `spin_rate`

Unused properties:
- `control_metrics`
- `is_default_data`

---

## Recommendations

1. Update interface definitions to include all properties used in code
2. Consider making rarely used properties optional with the `?` modifier
3. Use type composition (`Type1 & Type2`) instead of inheritance for specialized cases
4. Consider creating more granular interfaces for specific contexts
5. Add runtime validation for critical properties

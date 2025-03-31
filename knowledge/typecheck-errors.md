[2:37:35 AM] File change detected. Starting incremental compilation...

lib/mlb/dfs-analysis/batter-analysis.ts:1183:55 - error TS2339: Property 'total' does not exist on type 'ControlProjection | { walks: { expected: number; points: number; confidence: number; }; hbp: { expected: number; points: number; confidence: number; }; total: { expected: number; points: number; confidence: number; }; }'.
Property 'total' does not exist on type 'ControlProjection'.

1183 runProductionProj.total.points + disciplineProj.total.points;
~~~~~

lib/mlb/dfs-analysis/hits.ts:11:3 - error TS2724: '"../types/player"' has no exported member named 'BatterStats'. Did you mean 'BaseStats'?

11 BatterStats
~~~~~~~~~~~

lib/mlb/dfs-analysis/innings-pitched.ts:481:7 - error TS2741: Property 'confidence' is missing in type '{ expectedRareEventPoints: number; confidenceScore: number; eventProbabilities: { completeGame: number; shutout: number; noHitter: number; qualityStart: number; perfectGame: number; }; riskRewardRating: number; }' but required in type 'RareEventAnalysis'.

481 return {
~~~~~~

lib/mlb/types/analysis/events.ts:307:3
307 confidence: number; // Added alias for aggregateScoring.ts compatibility
~~~~~~~~~~
'confidence' is declared here.

lib/mlb/dfs-analysis/innings-pitched.ts:580:5 - error TS2741: Property 'confidence' is missing in type '{ expectedRareEventPoints: number; confidenceScore: number; eventProbabilities: { completeGame: number; shutout: number; noHitter: number; qualityStart: number; perfectGame: number; }; riskRewardRating: number; }' but required in type 'RareEventAnalysis'.

580 return {
~~~~~~

lib/mlb/types/analysis/events.ts:307:3
307 confidence: number; // Added alias for aggregateScoring.ts compatibility
~~~~~~~~~~
'confidence' is declared here.

lib/mlb/dfs-analysis/innings-pitched.ts:599:5 - error TS2741: Property 'confidence' is missing in type '{ expectedRareEventPoints: number; confidenceScore: number; eventProbabilities: { completeGame: number; shutout: number; noHitter: number; qualityStart: number; perfectGame: number; }; riskRewardRating: number; }' but required in type 'RareEventAnalysis'.

599 return {
~~~~~~

lib/mlb/types/analysis/events.ts:307:3
307 confidence: number; // Added alias for aggregateScoring.ts compatibility
~~~~~~~~~~
'confidence' is declared here.

lib/mlb/dfs-analysis/pitcher-control.ts:747:9 - error TS2353: Object literal may only specify known properties, and 'points' does not exist in type '{ expected: number; high: number; low: number; range: number; }'.

747 points: hitPoints,
~~~~~~

lib/mlb/types/analysis/pitcher.ts:153:3
153 hits: {
~~~~
The expected type comes from property 'hits' which is declared here on type 'ControlProjection'

lib/mlb/dfs-analysis/pitcher-control.ts:752:9 - error TS2353: Object literal may only specify known properties, and 'points' does not exist in type '{ expected: number; high: number; low: number; range: number; }'.

752 points: walkPoints,
~~~~~~

lib/mlb/types/analysis/pitcher.ts:147:3
147 walks: {
~~~~~
The expected type comes from property 'walks' which is declared here on type 'ControlProjection'

lib/mlb/dfs-analysis/pitcher-control.ts:776:9 - error TS2353: Object literal may only specify known properties, and 'points' does not exist in type '{ expected: number; high: number; low: number; range: number; }'.

776 points: 6.0 \* HIT_AGAINST_POINTS,
~~~~~~

lib/mlb/types/analysis/pitcher.ts:153:3
153 hits: {
~~~~
The expected type comes from property 'hits' which is declared here on type 'ControlProjection'

lib/mlb/dfs-analysis/pitcher-control.ts:781:9 - error TS2353: Object literal may only specify known properties, and 'points' does not exist in type '{ expected: number; high: number; low: number; range: number; }'.

781 points: 2.25 \* WALK_AGAINST_POINTS,
~~~~~~

lib/mlb/types/analysis/pitcher.ts:147:3
147 walks: {
~~~~~
The expected type comes from property 'walks' which is declared here on type 'ControlProjection'

lib/mlb/dfs-analysis/plate-discipline.ts:99:7 - error TS2353: Object literal may only specify known properties, and 'walks' does not exist in type 'BatterPlateDiscipline'.

99 walks: batting.walks || 0,
~~~~~

lib/mlb/dfs-analysis/plate-discipline.ts:368:24 - error TS2339: Property 'hits' does not exist on type 'PitcherSeasonStats'.

368 const hits = stats.hits || 0; // For use with determineHitsPropensity
~~~~

lib/mlb/dfs-analysis/plate-discipline.ts:419:5 - error TS2739: Type '{ gamesStarted: number; inningsPitched: number; walks: number; strikeouts: number; hitBatsmen: number; walksPerNine: number; hbpPerNine: number; strikeoutToWalkRatio: number; control: { walkPropensity: "high" | ... 1 more ... | "low"; ... 4 more ...; pitchEfficiency: number; }; controlRating: number; }' is missing the following properties from type 'PitcherControlProfile': hits, hitsPerNine, whip

419 return {
~~~~~~

lib/mlb/dfs-analysis/rare-events.ts:33:7 - error TS2741: Property 'confidence' is missing in type '{ eventProbabilities: { completeGame: number; qualityStart: number; shutout: number; noHitter: number; perfectGame: number; }; expectedRareEventPoints: number; riskRewardRating: number; confidenceScore: number; }' but required in type 'RareEventAnalysis'.

33 return {
~~~~~~

lib/mlb/types/analysis/events.ts:307:3
307 confidence: number; // Added alias for aggregateScoring.ts compatibility
~~~~~~~~~~
'confidence' is declared here.

lib/mlb/dfs-analysis/rare-events.ts:173:5 - error TS2741: Property 'confidence' is missing in type '{ eventProbabilities: { completeGame: number; qualityStart: number; shutout: number; noHitter: number; perfectGame: number; }; expectedRareEventPoints: number; riskRewardRating: number; confidenceScore: number; }' but required in type 'RareEventAnalysis'.

173 return {
~~~~~~

lib/mlb/types/analysis/events.ts:307:3
307 confidence: number; // Added alias for aggregateScoring.ts compatibility
~~~~~~~~~~
'confidence' is declared here.

lib/mlb/dfs-analysis/rare-events.ts:191:5 - error TS2741: Property 'confidence' is missing in type '{ eventProbabilities: { completeGame: number; qualityStart: number; shutout: number; noHitter: number; perfectGame: number; }; expectedRareEventPoints: number; riskRewardRating: number; confidenceScore: number; }' but required in type 'RareEventAnalysis'.

191 return {
~~~~~~

lib/mlb/types/analysis/events.ts:307:3
307 confidence: number; // Added alias for aggregateScoring.ts compatibility
~~~~~~~~~~
'confidence' is declared here.

lib/mlb/dfs-analysis/run-production.ts:124:80 - error TS2304: Cannot find name 'CareerRunProductionProfile'.

124 export async function getCareerRunProductionProfile(playerId: number): Promise<CareerRunProductionProfile | null> {
~~~~~~~~~~~~~~~~~~~~~~~~~~

lib/mlb/dfs-analysis/run-production.ts:274:12 - error TS2304: Cannot find name 'TeamOffensiveContext'.

274 ): Promise<TeamOffensiveContext | null> {
~~~~~~~~~~~~~~~~~~~~

lib/mlb/dfs-analysis/run-production.ts:345:7 - error TS2353: Object literal may only specify known properties, and 'runFactor' does not exist in type 'BallparkHitFactor'.

345 runFactor: factors.types.runs,
~~~~~~~~~

lib/mlb/dfs-analysis/run-production.ts:363:12 - error TS2304: Cannot find name 'LineupContext'.

363 ): Promise<LineupContext | null> {
~~~~~~~~~~~~~

lib/mlb/dfs-analysis/run-production.ts:459:12 - error TS2304: Cannot find name 'PitcherRunAllowance'.

459 ): Promise<PitcherRunAllowance | null> {
~~~~~~~~~~~~~~~~~~~

lib/mlb/dfs-analysis/run-production.ts:535:12 - error TS2304: Cannot find name 'ExpectedRuns'.

535 ): Promise<ExpectedRuns> {
~~~~~~~~~~~~

lib/mlb/dfs-analysis/run-production.ts:691:12 - error TS2304: Cannot find name 'ExpectedRBIs'.

691 ): Promise<ExpectedRBIs> {
~~~~~~~~~~~~

lib/mlb/dfs-analysis/starting-pitcher-analysis.ts:283:22 - error TS2339: Property 'total' does not exist on type 'ControlProjection | { total: { points: number; expected: number; confidence: number; }; }'.
Property 'total' does not exist on type 'ControlProjection'.

283 (controlProj.total.points || 0) +
~~~~~

lib/mlb/dfs-analysis/stolen-bases.ts:78:7 - error TS2353: Object literal may only specify known properties, and 'sprintSpeed' does not exist in type 'PlayerSBSeasonStats'.

78 sprintSpeed,
~~~~~~~~~~~

lib/mlb/dfs-analysis/stolen-bases.ts:506:7 - error TS2322: Type '{ batterSpeed: number; batterTendency: number; catcherDefense: number; pitcherHoldRate: number; gameScriptFactor: number; }' is not assignable to type '{ batterSpeed: number; batterTendency: number; catcherDefense: number; pitcherHoldRate: number; gameScriptFactor: number; } & { batterProfile: number; catcherDefense: number; pitcherHold: number; gameContext: number; sprintSpeed: number; }'.
Type '{ batterSpeed: number; batterTendency: number; catcherDefense: number; pitcherHoldRate: number; gameScriptFactor: number; }' is missing the following properties from type '{ batterProfile: number; catcherDefense: number; pitcherHold: number; gameContext: number; sprintSpeed: number; }': batterProfile, pitcherHold, gameContext, sprintSpeed

506 factors: {
~~~~~~~

lib/mlb/types/analysis/events.ts:43:3
43 factors: {
~~~~~~~
The expected type comes from property 'factors' which is declared here on type 'StolenBaseAnalysis & StolenBaseProbabilityResult'

lib/mlb/dfs-analysis/stolen-bases.ts:532:7 - error TS2322: Type '{ batterSpeed: number; batterTendency: number; catcherDefense: number; pitcherHoldRate: number; gameScriptFactor: number; }' is not assignable to type '{ batterSpeed: number; batterTendency: number; catcherDefense: number; pitcherHoldRate: number; gameScriptFactor: number; } & { batterProfile: number; catcherDefense: number; pitcherHold: number; gameContext: number; sprintSpeed: number; }'.
Type '{ batterSpeed: number; batterTendency: number; catcherDefense: number; pitcherHoldRate: number; gameScriptFactor: number; }' is missing the following properties from type '{ batterProfile: number; catcherDefense: number; pitcherHold: number; gameContext: number; sprintSpeed: number; }': batterProfile, pitcherHold, gameContext, sprintSpeed

532 factors: {
~~~~~~~

lib/mlb/types/analysis/events.ts:43:3
43 factors: {
~~~~~~~
The expected type comes from property 'factors' which is declared here on type 'StolenBaseAnalysis & StolenBaseProbabilityResult'

lib/mlb/player/batter-stats.ts:6:3 - error TS2724: '"../types/player"' has no exported member named 'BatterStats'. Did you mean 'BaseStats'?

6 BatterStats,
~~~~~~~~~~~

lib/mlb/types/player/index.ts:12:3 - error TS1205: Re-exporting a type when 'isolatedModules' is enabled requires using 'export type'.

12 MLBBatter,
~~~~~~~~~

lib/mlb/types/player/index.ts:13:3 - error TS1205: Re-exporting a type when 'isolatedModules' is enabled requires using 'export type'.

13 BatterSeasonStats,
~~~~~~~~~~~~~~~~~

lib/mlb/types/player/index.ts:14:3 - error TS1205: Re-exporting a type when 'isolatedModules' is enabled requires using 'export type'.

14 BatterPlateDiscipline,
~~~~~~~~~~~~~~~~~~~~~

lib/mlb/types/player/index.ts:15:3 - error TS1205: Re-exporting a type when 'isolatedModules' is enabled requires using 'export type'.

15 BatterSplits
~~~~~~~~~~~~

[2:37:36 AM] Found 31 errors. Watching for file changes.

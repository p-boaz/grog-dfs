[9:15:39 AM] File change detected. Starting incremental compilation...

lib/mlb/dfs-analysis/batter-analysis.ts:18:10 - error TS2724: '"./run-production"' has no exported member named 'calculateRunProductionProjection'. Did you mean 'calculateRunProductionPoints'?

18 import { calculateRunProductionProjection } from "./run-production";
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

lib/mlb/dfs-analysis/run-production.ts:823:23
823 export async function calculateRunProductionPoints(
~~~~~~~~~~~~~~~~~~~~~~~~~~~~
'calculateRunProductionPoints' is declared here.

lib/mlb/dfs-analysis/run-production.ts:10:33 - error TS2307: Cannot find module '../types/analysis/ballpark-factors' or its corresponding type declarations.

10 import { BallparkFactors } from "../types/analysis/ballpark-factors";
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

lib/mlb/dfs-analysis/run-production.ts:369:5 - error TS2353: Object literal may only specify known properties, and 'singles' does not exist in type 'BallparkHitFactor'.

369 singles: factors.types.singles,
~~~~~~~

lib/mlb/dfs-analysis/run-production.ts:402:41 - error TS2339: Property 'onBasePct' does not exist on type 'TeamStats'.

402 const onBasePercentage = teamStats?.onBasePct || 0.33; // League average OBP if no stats
~~~~~~~~~

lib/mlb/dfs-analysis/run-production.ts:405:35 - error TS2339: Property 'runsPerGame' does not exist on type 'TeamStats'.

405 const lineupRuns = teamStats?.runsPerGame || 4.5; // League average if no stats
~~~~~~~~~~~

lib/mlb/dfs-analysis/run-production.ts:406:35 - error TS2339: Property 'rbisPerGame' does not exist on type 'TeamStats'.

406 const lineupRBIs = teamStats?.rbisPerGame || 4.3; // League average if no stats
~~~~~~~~~~~

lib/mlb/dfs-analysis/run-production.ts:539:11 - error TS2554: Expected 1 arguments, but got 2.

539 new Date().getFullYear().toString()
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

lib/mlb/dfs-analysis/run-production.ts:706:11 - error TS2554: Expected 1 arguments, but got 2.

706 new Date().getFullYear().toString()
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

lib/mlb/dfs-analysis/run-production.ts:827:12 - error TS2552: Cannot find name 'RunProductionPoints'. Did you mean 'RunProductionStats'?

827 ): Promise<RunProductionPoints> {
~~~~~~~~~~~~~~~~~~~

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

lib/mlb/player/pitcher-stats.ts:230:5 - error TS2322: Type '{ season: any; team: any; gamesPlayed: any; gamesStarted: any; inningsPitched: any; wins: any; losses: any; era: any; whip: any; strikeouts: any; walks: any; saves: any; homeRunsAllowed: number; hitBatsmen: any; }[]' is not assignable to type 'PitcherCareerStatsSeason[]'.
Property 'hits' is missing in type '{ season: any; team: any; gamesPlayed: any; gamesStarted: any; inningsPitched: any; wins: any; losses: any; era: any; whip: any; strikeouts: any; walks: any; saves: any; homeRunsAllowed: number; hitBatsmen: any; }' but required in type 'PitcherCareerStatsSeason'.

230 careerStats: yearByYearPitchingStats.map((year: any) => {
~~~~~~~~~~~

lib/mlb/types/player/pitcher.ts:54:3
54 hits: number;
~~~~
'hits' is declared here.
lib/mlb/types/player/pitcher.ts:87:3
87 careerStats: PitcherCareerStatsSeason[];
~~~~~~~~~~~
The expected type comes from property 'careerStats' which is declared here on type 'PitcherStats'

lib/mlb/services/pitcher-data-service.ts:193:5 - error TS2322: Type '{ season: string; team: string; gamesPlayed: number; gamesStarted: number; inningsPitched: number; wins: number; losses: number; era: number; whip: number; strikeouts: number; walks: number; saves: number; homeRunsAllowed: number; hitBatsmen: number; }[]' is not assignable to type 'PitcherCareerStatsSeason[]'.
Property 'hits' is missing in type '{ season: string; team: string; gamesPlayed: number; gamesStarted: number; inningsPitched: number; wins: number; losses: number; era: number; whip: number; strikeouts: number; walks: number; saves: number; homeRunsAllowed: number; hitBatsmen: number; }' but required in type 'PitcherCareerStatsSeason'.

193 careerStats,
~~~~~~~~~~~

lib/mlb/types/player/pitcher.ts:54:3
54 hits: number;
~~~~
'hits' is declared here.
lib/mlb/services/pitcher-data-service.ts:34:3
34 careerStats: PitcherCareerStatsSeason[];
~~~~~~~~~~~
The expected type comes from property 'careerStats' which is declared here on type 'EnhancedPitcherData'

lib/mlb/types/game.ts:7:10 - error TS2440: Import declaration conflicts with local declaration of 'TeamStats'.

7 import { TeamStats } from "./core";
~~~~~~~~~

lib/mlb/types/index.ts:9:1 - error TS2308: Module './core' has already exported a member named 'TeamStats'. Consider explicitly re-exporting to resolve the ambiguity.

9 export \* from './game';

```

[9:15:40 AM] Found 16 errors. Watching for file changes.

```

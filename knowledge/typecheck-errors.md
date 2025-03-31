[3:31:36 PM] File change detected. Starting incremental compilation...

lib/mlb/daily-data-collector.ts:366:7 - error TS2345: Argument of type '{ gameId: number; gameTime: string; status: { abstractGameState?: string; detailedState?: string; statusCode?: string; }; homeTeam: { id: number; name: string; }; awayTeam: { id: number; name: string; }; venue: { ...; }; ... 4 more ...; ballpark: { ...; }; }[]' is not assignable to parameter of type 'string'.

366 gameData,
~~~~~~~~

lib/mlb/dfs-analysis/batter-analysis.ts:12:10 - error TS2724: '"./stolen-bases"' has no exported member named 'estimateStolenBaseProbability'. Did you mean 'calculateStolenBaseProbability'?

12 import { estimateStolenBaseProbability } from "./stolen-bases";
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

lib/mlb/dfs-analysis/stolen-bases.ts:276:23
276 export async function calculateStolenBaseProbability(
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
'calculateStolenBaseProbability' is declared here.

lib/mlb/dfs-analysis/batter-analysis.ts:13:10 - error TS2724: '"./run-production"' has no exported member named 'calculateRunProduction'. Did you mean 'calculateRunProductionPoints'?

13 import { calculateRunProduction } from "./run-production";
~~~~~~~~~~~~~~~~~~~~~~

lib/mlb/dfs-analysis/run-production.ts:906:23
906 export async function calculateRunProductionPoints(
~~~~~~~~~~~~~~~~~~~~~~~~~~~~
'calculateRunProductionPoints' is declared here.

lib/mlb/dfs-analysis/batter-analysis.ts:15:10 - error TS2724: '"./hits"' has no exported member named 'calculateHitProjections'. Did you mean 'calculateHitProjection'?

15 import { calculateHitProjections } from "./hits";
~~~~~~~~~~~~~~~~~~~~~~~

lib/mlb/dfs-analysis/hits.ts:738:23
738 export async function calculateHitProjection(
~~~~~~~~~~~~~~~~~~~~~~
'calculateHitProjection' is declared here.

lib/mlb/dfs-analysis/batter-analysis.ts:17:36 - error TS2307: Cannot find module '../environment' or its corresponding type declarations.

17 import { getBallparkFactors } from "../environment";
~~~~~~~~~~~~~~~~

lib/mlb/dfs-analysis/batter-analysis.ts:20:10 - error TS2305: Module '"../player/matchups"' has no exported member 'getMatchupData'.

20 import { getMatchupData } from "../player/matchups";
~~~~~~~~~~~~~~

lib/mlb/dfs-analysis/batter-analysis.ts:21:10 - error TS2459: Module '"./starting-pitcher-analysis"' declares 'calculatePitcherDfsProjection' locally, but it is not exported.

21 import { calculatePitcherDfsProjection } from "./starting-pitcher-analysis";
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

lib/mlb/dfs-analysis/starting-pitcher-analysis.ts:5:10
5 import { calculatePitcherDfsProjection } from "./aggregate-scoring";
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
'calculatePitcherDfsProjection' is declared here.

lib/mlb/dfs-analysis/batter-analysis.ts:35:10 - error TS2305: Module '"../draftkings/player-mapping"' has no exported member 'mapBatterToPlayer'.

35 import { mapBatterToPlayer } from "../draftkings/player-mapping";
~~~~~~~~~~~~~~~~~

lib/mlb/dfs-analysis/batter-analysis.ts:49:47 - error TS2345: Argument of type 'string' is not assignable to parameter of type '{ gamePk: string; }'.

49 const game = await getGameEnvironmentData(gameId);
~~~~~~

lib/mlb/dfs-analysis/batter-analysis.ts:59:54 - error TS2345: Argument of type 'GameEnvironmentData' is not assignable to parameter of type 'GameInfo'.
Type 'GameEnvironmentData' is missing the following properties from type 'GameInfo': gameId, venue, homeTeam, awayTeam, and 2 more.

59 const analysis = await analyzeBatter(batter, game);
~~~~

lib/mlb/dfs-analysis/batter-analysis.ts:63:55 - error TS2345: Argument of type 'GameEnvironmentData' is not assignable to parameter of type 'GameInfo'.
Type 'GameEnvironmentData' is missing the following properties from type 'GameInfo': gameId, venue, homeTeam, awayTeam, and 2 more.

63 results.push(getDefaultBatterAnalysis(batter, game));
~~~~

lib/mlb/dfs-analysis/batter-analysis.ts:205:42 - error TS2339: Property 'singles' does not exist on type '{ homeRuns: number; runs: number; }'.

205 singles: game.ballpark?.types?.singles || 1.0,
~~~~~~~

lib/mlb/dfs-analysis/batter-analysis.ts:206:42 - error TS2339: Property 'doubles' does not exist on type '{ homeRuns: number; runs: number; }'.

206 doubles: game.ballpark?.types?.doubles || 1.0,
~~~~~~~

lib/mlb/dfs-analysis/batter-analysis.ts:207:42 - error TS2339: Property 'triples' does not exist on type '{ homeRuns: number; runs: number; }'.

207 triples: game.ballpark?.types?.triples || 1.0,
~~~~~~~

lib/mlb/dfs-analysis/batter-analysis.ts:299:9 - error TS2345: Argument of type '{ overall: number; types: { homeRuns: number; runs: number; }; }' is not assignable to parameter of type 'number'.

299 game.ballpark,
~~~~~~~~~~~~~

lib/mlb/dfs-analysis/batter-analysis.ts:333:9 - error TS2345: Argument of type '{ overall: number; types: { homeRuns: number; runs: number; }; }' is not assignable to parameter of type 'BallparkFactors'.
Property 'handedness' is missing in type '{ overall: number; types: { homeRuns: number; runs: number; }; }' but required in type 'BallparkFactors'.

333 game.ballpark,
~~~~~~~~~~~~~

lib/mlb/types/environment/ballpark.ts:19:3
19 handedness: {
~~~~~~~~~~
'handedness' is declared here.

lib/mlb/dfs-analysis/batter-analysis.ts:355:31 - error TS2339: Property 'temperature' does not exist on type '{ batterPower: number; pitcherVulnerability: number; ballparkFactor: number; weatherFactor: number; recentForm: number; } & { batterProfile: number; pitcherVulnerability: number; ballpark: number; weather: number; platoonAdvantage: number; }'.

355 hrProbability.factors.temperature || 1.0;
~~~~~~~~~~~

lib/mlb/dfs-analysis/batter-analysis.ts:356:64 - error TS2339: Property 'wind' does not exist on type '{ batterPower: number; pitcherVulnerability: number; ballparkFactor: number; weatherFactor: number; recentForm: number; } & { batterProfile: number; pitcherVulnerability: number; ballpark: number; weather: number; platoonAdvantage: number; }'.

356 entry.factors.weather.windFactor = hrProbability.factors.wind || 1.0;
~~~~

lib/mlb/dfs-analysis/batter-analysis.ts:358:31 - error TS2339: Property 'weatherOverall' does not exist on type '{ batterPower: number; pitcherVulnerability: number; ballparkFactor: number; weatherFactor: number; recentForm: number; } & { batterProfile: number; pitcherVulnerability: number; ballpark: number; weather: number; platoonAdvantage: number; }'.

358 hrProbability.factors.weatherOverall || 1.0;
~~~~~~~~~~~~~~

lib/mlb/dfs-analysis/batter-analysis.ts:751:41 - error TS2339: Property 'singles' does not exist on type '{ homeRuns: number; runs: number; }'.

751 singles: game?.ballpark?.types?.singles || 1.0,
~~~~~~~

lib/mlb/dfs-analysis/batter-analysis.ts:752:41 - error TS2339: Property 'doubles' does not exist on type '{ homeRuns: number; runs: number; }'.

752 doubles: game?.ballpark?.types?.doubles || 1.0,
~~~~~~~

lib/mlb/dfs-analysis/batter-analysis.ts:753:41 - error TS2339: Property 'triples' does not exist on type '{ homeRuns: number; runs: number; }'.

753 triples: game?.ballpark?.types?.triples || 1.0,
~~~~~~~

lib/mlb/dfs-analysis/hits.ts:13:3 - error TS2305: Module '"../types/analysis/hits"' has no exported member 'DetailedHitProjection'.

13 DetailedHitProjection,
~~~~~~~~~~~~~~~~~~~~~

lib/mlb/dfs-analysis/hits.ts:146:7 - error TS2353: Object literal may only specify known properties, and 'battingAverage' does not exist in type 'PlayerHitStats'.

146 battingAverage: batting.avg || 0,
~~~~~~~~~~~~~~

lib/mlb/dfs-analysis/hits.ts:277:7 - error TS2561: Object literal may only specify known properties, but 'careerHits' does not exist in type 'CareerHitProfile'. Did you mean to write 'careerIso'?

277 careerHits,
~~~~~~~~~~

lib/mlb/dfs-analysis/hits.ts:322:7 - error TS2353: Object literal may only specify known properties, and 'overall' does not exist in type 'BallparkHitFactor'.

322 overall: factors.overall,
~~~~~~~

lib/mlb/dfs-analysis/hits.ts:402:7 - error TS2353: Object literal may only specify known properties, and 'windSpeed' does not exist in type 'WeatherHitImpact'.

402 windSpeed,
~~~~~~~~~

lib/mlb/dfs-analysis/hits.ts:480:7 - error TS2353: Object literal may only specify known properties, and 'gamesStarted' does not exist in type 'PitcherHitVulnerability'.

480 gamesStarted:
~~~~~~~~~~~~

lib/mlb/dfs-analysis/hits.ts:551:7 - error TS2353: Object literal may only specify known properties, and 'singles' does not exist in type 'MatchupHitStats'.

551 singles,
~~~~~~~

lib/mlb/dfs-analysis/hits.ts:597:7 - error TS2739: Type '{ ops: number; battingAverage: number; onBasePercentage: number; sluggingPct: number; atBats: number; }' is missing the following properties from type '{ avg: number; ops: number; wOBA: number; }': avg, wOBA

597 vsLeft: {
~~~~~~

lib/mlb/types/analysis/hits.ts:84:3
84 vsLeft: {
~~~~~~
The expected type comes from property 'vsLeft' which is declared here on type 'BatterPlatoonSplits'

lib/mlb/dfs-analysis/hits.ts:601:7 - error TS2739: Type '{ ops: number; battingAverage: number; onBasePercentage: number; sluggingPct: number; atBats: number; }' is missing the following properties from type '{ avg: number; ops: number; wOBA: number; }': avg, wOBA

601 vsRight: {
~~~~~~~

lib/mlb/types/analysis/hits.ts:89:3
89 vsRight: {
~~~~~~~
The expected type comes from property 'vsRight' which is declared here on type 'BatterPlatoonSplits'

lib/mlb/dfs-analysis/hits.ts:661:37 - error TS2339: Property 'battingAverage' does not exist on type 'PlayerHitStats'.

661 let baselineBA = playerHitStats.battingAverage;
~~~~~~~~~~~~~~

lib/mlb/dfs-analysis/hits.ts:702:47 - error TS2339: Property 'singleRate' does not exist on type 'PlayerHitStats'.

702 const adjustedSingleRate = playerHitStats.singleRate \* adjustedBA;
~~~~~~~~~~

lib/mlb/dfs-analysis/hits.ts:703:47 - error TS2339: Property 'doubleRate' does not exist on type 'PlayerHitStats'.

703 const adjustedDoubleRate = playerHitStats.doubleRate \* adjustedBA;
~~~~~~~~~~

lib/mlb/dfs-analysis/hits.ts:704:47 - error TS2339: Property 'tripleRate' does not exist on type 'PlayerHitStats'.

704 const adjustedTripleRate = playerHitStats.tripleRate \* adjustedBA;
~~~~~~~~~~

lib/mlb/dfs-analysis/hits.ts:709:7 - error TS2353: Object literal may only specify known properties, and 'expectedBA' does not exist in type 'HitTypeRates'.

709 expectedBA: adjustedBA,
~~~~~~~~~~

lib/mlb/dfs-analysis/hits.ts:788:38 - error TS2339: Property 'hitTypeRates' does not exist on type 'HitTypeRates'.

788 const expectedSingles = hitRates.hitTypeRates.single \* atBats;
~~~~~~~~~~~~

lib/mlb/dfs-analysis/hits.ts:789:38 - error TS2339: Property 'hitTypeRates' does not exist on type 'HitTypeRates'.

789 const expectedDoubles = hitRates.hitTypeRates.double \* atBats;
~~~~~~~~~~~~

lib/mlb/dfs-analysis/hits.ts:790:38 - error TS2339: Property 'hitTypeRates' does not exist on type 'HitTypeRates'.

790 const expectedTriples = hitRates.hitTypeRates.triple \* atBats;
~~~~~~~~~~~~

lib/mlb/dfs-analysis/hits.ts:791:39 - error TS2339: Property 'hitTypeRates' does not exist on type 'HitTypeRates'.

791 const expectedHomeRuns = hitRates.hitTypeRates.homeRun \* atBats;
~~~~~~~~~~~~

lib/mlb/dfs-analysis/hits.ts:811:30 - error TS2339: Property 'factors' does not exist on type 'HitTypeRates'.

811 const factors = hitRates.factors;
~~~~~~~

lib/mlb/types/index.ts:98:3 - error TS2305: Module '"./statcast"' has no exported member 'PitchData'.

98 PitchData,
~~~~~~~~~

lib/mlb/types/index.ts:99:3 - error TS2724: '"./statcast"' has no exported member named 'StatcastEventData'. Did you mean 'StatcastData'?

99 StatcastEventData,
~~~~~~~~~~~~~~~~~

lib/mlb/types/index.ts:100:3 - error TS2305: Module '"./statcast"' has no exported member 'PitchOutcomes'.

100 PitchOutcomes,
~~~~~~~~~~~~~

lib/mlb/types/index.ts:102:3 - error TS2305: Module '"./statcast"' has no exported member 'ControlMetrics'.

102 ControlMetrics,
~~~~~~~~~~~~~~

lib/mlb/types/index.ts:103:3 - error TS2305: Module '"./statcast"' has no exported member 'MovementMetrics'.

103 MovementMetrics,
~~~~~~~~~~~~~~~

lib/mlb/types/index.ts:104:3 - error TS2305: Module '"./statcast"' has no exported member 'ResultMetrics'.

104 ResultMetrics,
~~~~~~~~~~~~~

lib/mlb/types/index.ts:110:3 - error TS2305: Module '"./validation"' has no exported member 'ValidationError'.

110 ValidationError,
~~~~~~~~~~~~~~~

lib/mlb/types/index.ts:111:3 - error TS2305: Module '"./validation"' has no exported member 'ValidationResult'.

111 ValidationResult
~~~~~~~~~~~~~~~~

[3:31:37 PM] Found 49 errors. Watching for file changes.

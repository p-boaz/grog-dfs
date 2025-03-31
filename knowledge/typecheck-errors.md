File change detected. Starting incremental compilation...

lib/mlb/dfs-analysis/aggregate-scoring.ts:65:75 - error TS2345: Argument of type 'number' is not assignable to parameter of type 'string'.

65 calculateExpectedStrikeouts(pitcherId, parseInt(gamePk.toString()), season),
~~~~~~

lib/mlb/dfs-analysis/home-runs.ts:476:38 - error TS2345: Argument of type 'string | number' is not assignable to parameter of type 'number'.
Type 'string' is not assignable to type 'number'.

476 getPitcherHomeRunVulnerability(pitcherId),
~~~~~~~~~

lib/mlb/dfs-analysis/home-runs.ts:556:44 - error TS2339: Property 'isOutdoor' does not exist on type 'number | { temperature?: number; windSpeed?: number; windDirection?: string; isOutdoor?: boolean; }'.
Property 'isOutdoor' does not exist on type 'number'.

556 if (gameEnvironment && gameEnvironment.isOutdoor) {
~~~~~~~~~

lib/mlb/dfs-analysis/home-runs.ts:558:27 - error TS2339: Property 'temperature' does not exist on type 'number | { temperature?: number; windSpeed?: number; windDirection?: string; isOutdoor?: boolean; }'.
Property 'temperature' does not exist on type 'number'.

558 if (gameEnvironment.temperature) {
~~~~~~~~~~~

lib/mlb/dfs-analysis/home-runs.ts:559:29 - error TS2339: Property 'temperature' does not exist on type 'number | { temperature?: number; windSpeed?: number; windDirection?: string; isOutdoor?: boolean; }'.
Property 'temperature' does not exist on type 'number'.

559 if (gameEnvironment.temperature > 85) weatherFactor += 0.2;
~~~~~~~~~~~

lib/mlb/dfs-analysis/home-runs.ts:560:34 - error TS2339: Property 'temperature' does not exist on type 'number | { temperature?: number; windSpeed?: number; windDirection?: string; isOutdoor?: boolean; }'.
Property 'temperature' does not exist on type 'number'.

560 else if (gameEnvironment.temperature > 75) weatherFactor += 0.1;
~~~~~~~~~~~

lib/mlb/dfs-analysis/home-runs.ts:561:34 - error TS2339: Property 'temperature' does not exist on type 'number | { temperature?: number; windSpeed?: number; windDirection?: string; isOutdoor?: boolean; }'.
Property 'temperature' does not exist on type 'number'.

561 else if (gameEnvironment.temperature < 50) weatherFactor -= 0.1;
~~~~~~~~~~~

lib/mlb/dfs-analysis/home-runs.ts:562:34 - error TS2339: Property 'temperature' does not exist on type 'number | { temperature?: number; windSpeed?: number; windDirection?: string; isOutdoor?: boolean; }'.
Property 'temperature' does not exist on type 'number'.

562 else if (gameEnvironment.temperature < 40) weatherFactor -= 0.2;
~~~~~~~~~~~

lib/mlb/dfs-analysis/home-runs.ts:566:27 - error TS2339: Property 'windSpeed' does not exist on type 'number | { temperature?: number; windSpeed?: number; windDirection?: string; isOutdoor?: boolean; }'.
Property 'windSpeed' does not exist on type 'number'.

566 if (gameEnvironment.windSpeed && gameEnvironment.windDirection) {
~~~~~~~~~

lib/mlb/dfs-analysis/home-runs.ts:566:56 - error TS2339: Property 'windDirection' does not exist on type 'number | { temperature?: number; windSpeed?: number; windDirection?: string; isOutdoor?: boolean; }'.
Property 'windDirection' does not exist on type 'number'.

566 if (gameEnvironment.windSpeed && gameEnvironment.windDirection) {
~~~~~~~~~~~~~

lib/mlb/dfs-analysis/home-runs.ts:567:43 - error TS2339: Property 'windSpeed' does not exist on type 'number | { temperature?: number; windSpeed?: number; windDirection?: string; isOutdoor?: boolean; }'.
Property 'windSpeed' does not exist on type 'number'.

567 const windSpeed = gameEnvironment.windSpeed;
~~~~~~~~~

lib/mlb/dfs-analysis/home-runs.ts:568:41 - error TS2339: Property 'windDirection' does not exist on type 'number | { temperature?: number; windSpeed?: number; windDirection?: string; isOutdoor?: boolean; }'.
Property 'windDirection' does not exist on type 'number'.

568 const windDir = gameEnvironment.windDirection.toLowerCase();
~~~~~~~~~~~~~

[9:35:52 PM] Found 12 errors. Watching for file changes.

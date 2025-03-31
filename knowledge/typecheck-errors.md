[10:38:57 PM] File change detected. Starting incremental compilation...

lib/mlb/dfs-analysis/innings-pitched.ts:259:9 - error TS2353: Object literal may only specify known properties, and 'inningsProjection' does not exist in type 'InningsProjection & { expectedDfsPoints: number; factors: { pitcherDurability: number; teamHookTendency: number; gameContext: number; pitcherEfficiency: number; }; confidenceScore: number; }'.

259 inningsProjection: {
~~~~~~~~~~~~~~~~~

lib/mlb/dfs-analysis/innings-pitched.ts:311:7 - error TS2353: Object literal may only specify known properties, and 'ranges' does not exist in type 'InningsProjection & { expectedDfsPoints: number; factors: { pitcherDurability: number; teamHookTendency: number; gameContext: number; pitcherEfficiency: number; }; confidenceScore: number; }'.

311 ranges: {
~~~~~~

lib/mlb/dfs-analysis/innings-pitched.ts:346:7 - error TS2353: Object literal may only specify known properties, and 'ranges' does not exist in type 'InningsProjection & { expectedDfsPoints: number; factors: { pitcherDurability: number; teamHookTendency: number; gameContext: number; pitcherEfficiency: number; }; confidenceScore: number; }'.

346 ranges: {
~~~~~~

lib/mlb/dfs-analysis/innings-pitched.ts:453:9 - error TS2353: Object literal may only specify known properties, and 'completeGameProbability' does not exist in type 'RareEventAnalysis'.

453 completeGameProbability: 0.5,
~~~~~~~~~~~~~~~~~~~~~~~

[10:38:57 PM] Found 4 errors. Watching for file changes.

I've examined the codebase and noticed that the rich data from the savant.ts module isn't being fully utilized in the DFS analysis modules. Here are my recommendations for better incorporating the savant.ts functions into the mlb/dfs-analysis modules:

## 1. Direct Integration with Key Analysis Modules

The DFS analysis modules could benefit from direct access to the detailed metrics available through savant.ts:

## Current Progress and Next Steps

### Completed Integration:

- Created intermediate service modules as recommended in section 2:

  - Implemented `pitcher-data-service.ts` with `getEnhancedPitcherData()` which combines MLB API and Statcast data
  - Implemented `batter-data-service.ts` with `getEnhancedBatterData()` for comprehensive batter stats

- Integrated Statcast data into key analysis modules:
  - **strikeouts.ts**: Now uses Statcast metrics (whiff rate, chase rate, zone percentage) through the `getEnhancedPitcherData` service
  - **home-runs.ts**: Updated to leverage Statcast quality of contact metrics for more accurate home run probability models
  - **stolen-bases.ts**: Successfully enhanced with sprint speed data from Statcast for more accurate baserunning projections
  - **plate-discipline.ts**: Successfully enhanced with chase rate, zone contact rate, and other plate discipline metrics from Statcast
  - Fixed linter errors and type compatibility issues across the integrated modules

### Recently Completed: Plate Discipline Enhancement

Successfully implemented the enhanced plate discipline module with Statcast metrics as planned. The implementation includes:

1. The `getAdvancedPlateDisciplineMetrics` function that:

   - Combines data from both batter and pitcher using our enhanced data services
   - Integrates Statcast metrics like chase rate, zone contact rate, and whiff rate
   - Calculates matchup-specific advantage ratings
   - Provides expected outcome probabilities for walks, strikeouts, HBP, and balls in play
   - Includes confidence scores based on data quality and sample size

2. Added a usage example function `calculateAdvancedPlateDisciplineProjection` for DFS points projection that:

   - Uses the advanced metrics to calculate expected fantasy points
   - Provides matchup-specific insights for DFS analysis
   - Offers confidence ratings for predictions

3. Enhanced the existing `calculateExpectedWalks` function to:

   - Use the new advanced metrics when available
   - Gracefully fall back to traditional analysis when needed
   - Maintain compatibility with existing code

4. Created a test suite in `test-plate-discipline.ts` to validate functionality with multiple matchup scenarios

### Next Step:

Enhance the innings-pitched.ts module by incorporating Statcast pitch mix and efficiency data to better predict pitcher stamina and workload:

```typescript
// TO IMPLEMENT:
import { getEnhancedPitcherData } from "../services/pitcher-data-service";

/**
 * Enhanced innings pitched projection that uses pitch efficiency and mix data
 */
export async function getPitchEfficiencyMetrics(pitcherId: number): Promise<{
  pitchesPerInning: number;
  pitchesPerBatter: number;
  stressPitchPercentage: number; // % of pitches thrown in high-leverage counts
  earlyContactRate: number; // Rate of contact in first 3 pitches
  deepCountPercentage: number; // % of PAs going to 3+ pitches
  pitchMixDiversity: number; // How many effective pitches (entropy measure)
  staminaProjection: "high" | "medium" | "low";
  expectedPitchCount: number;
  expectedInningsPitched: number;
  predictionConfidence: number; // 1-10 scale
}> {
  // Get enhanced pitcher data
  const pitcherData = await getEnhancedPitcherData(pitcherId);

  // Use pitch mix, movement, and results metrics from Statcast
  // to create a more accurate innings projection model
}
```

This integration will strengthen our ability to predict pitcher longevity, which is crucial for both DFS points projections and betting markets related to outs recorded.

### For batter-analysis.ts:

```typescript
import { getBatterStatcastData } from "../savant";

// Inside analysis function
const statcastData = await getBatterStatcastData({ batterId: batter.id });
if (statcastData) {
  // Use quality of contact metrics to enhance projections
  projections.homeRunProbability *= adjustFactorForBarrelRate(
    statcastData.batting_metrics.barrel_rate
  );
  projections.expectedHits.confidence = calculateConfidenceFromExitVelo(
    statcastData.batting_metrics.exit_velocity
  );
}
```

### For home-runs.ts:

```typescript
import { getBatterStatcastData } from "../savant";

// Inside probability calculation
const statcastData = await getBatterStatcastData({ batterId });
const barrelRate = statcastData?.batting_metrics.barrel_rate || 0.05; // Default if unavailable
const exitVelocity = statcastData?.batting_metrics.exit_velocity || 88; // League average default
const launchAngle = statcastData?.batting_metrics.launch_angle || 12; // League average default

// Use these metrics to create a more accurate HR probability model
```

### For pitcher-win.ts and strikeouts.ts:

```typescript
import { getPitcherStatcastData } from "../savant";

// Use control metrics for more accurate K projections
const statcastData = await getPitcherStatcastData({ pitcherId });
const whiffRate = statcastData?.control_metrics.whiff_rate || 22; // Default if unavailable
const chaseRate = statcastData?.control_metrics.chase_rate || 28; // Default if unavailable

// Calculate strikeout probability using these more granular metrics
```

## 2. Create Intermediate Service Modules

To avoid duplicating code across analysis modules, create service modules that combine data from MLB API and Savant:

```typescript
// lib/mlb/services/batter-data-service.ts
import { getBatterStats } from "../player/batter-stats";
import { getBatterStatcastData } from "../savant";

export async function getEnhancedBatterData(batterId: number) {
  const [baseStats, statcastData] = await Promise.all([
    getBatterStats({ batterId }),
    getBatterStatcastData({ batterId }).catch(() => null),
  ]);

  return {
    ...baseStats,
    qualityMetrics: statcastData
      ? {
          barrelRate: statcastData.batting_metrics.barrel_rate,
          exitVelocity: statcastData.batting_metrics.exit_velocity,
          hardHitRate: statcastData.batting_metrics.hard_hit_percent,
          sweetSpotRate: statcastData.batting_metrics.sweet_spot_percent,
          expectedStats: {
            xBA: statcastData.expected_stats.xba,
            xSLG: statcastData.expected_stats.xslg,
            xwOBA: statcastData.expected_stats.xwoba,
          },
        }
      : null,
  };
}
```

## 3. Add Fallback and Caching Strategies

The Savant API can be rate-limited, so implement robust fallback strategies:

```typescript
// Inside analysis modules
try {
  const statcastData = await getBatterStatcastData({ batterId });
  // Use detailed metrics
} catch (error) {
  console.warn(
    `Falling back to basic metrics for batter ${batterId}: ${error.message}`
  );
  // Use simpler model with MLB API data only
}
```

## 4. Enrich Existing Analysis with Specialized Metrics

Each analysis module can benefit from specific Savant metrics:

- **plate-discipline.ts**: ✅ Implemented with chase rate, zone contact rate, and advanced metrics
- **innings-pitched.ts**: Use pitch mix data to estimate pitcher efficiency
- **stolen-bases.ts**: ✅ Enhanced with sprint speed data for baserunning projections
- **rare-events.ts**: Use launch angle and exit velocity for triples prediction

## 5. Create a Unified Player Profile Module

Build a comprehensive player profiling system that combines all data sources:

```typescript
// lib/mlb/player/player-profile.ts
import { getBatterStats } from "./batter-stats";
import { getBatterStatcastData } from "../savant";
import { getBatterMatchups } from "./matchups";

export async function getCompleteBatterProfile(batterId: number) {
  // Fetch data from all sources in parallel
  const [basicStats, statcastData, matchupData] = await Promise.allSettled([
    getBatterStats({ batterId }),
    getBatterStatcastData({ batterId }).catch((e) => null),
    getBatterMatchups({ batterId }).catch((e) => null),
  ]);

  // Combine data with preferences for higher quality sources
  return combinePlayerData(
    basicStats.status === "fulfilled" ? basicStats.value : null,
    statcastData.status === "fulfilled" ? statcastData.value : null,
    matchupData.status === "fulfilled" ? matchupData.value : null
  );
}
```

## 6. Add Visualization and Validation Support

To help understand the impact of Savant data:

```typescript
// Add debug metrics that show the impact of Savant data
const projectionWithoutStatcast = calculateBaseProjection(playerData);
const projectionWithStatcast = enhanceProjectionWithStatcast(
  projectionWithoutStatcast,
  statcastData
);

console.log(
  `Statcast impact: ${
    Math.round(
      (projectionWithStatcast.points - projectionWithoutStatcast.points) * 100
    ) / 100
  } DK points`
);
```

By implementing these strategies, you'll significantly enhance your DFS analysis with the rich data available from Baseball Savant while maintaining robust fallbacks when that data isn't available.

/**
 * Specialized functions for analyzing plate discipline (walks and HBP)
 * Both walks and hit-by-pitch are worth +2 points in DraftKings
 */

import { getBatterSplits, getBatterStats } from "../player/batter-stats";
import { analyzeHitterMatchup } from "../player/matchups";
import { getPitcherStats } from "../player/pitcher-stats";
import { getEnhancedBatterData } from "../services/batter-data-service";
import { getEnhancedPitcherData } from "../services/pitcher-data-service";
import { BatterControlFactors, ControlMatchupData, ControlProjection, PitcherControlProfile } from "../types/analysis/pitcher";
import { BatterPlateDiscipline } from "../types/player/batter";

// Points awarded in DraftKings for these categories
export const WALK_POINTS = 2;
export const HBP_POINTS = 2;

/**
 * Get player's plate discipline stats
 *
 * @param playerId MLB player ID
 * @param season Season year (defaults to current year)
 * @returns Object with plate discipline statistics
 */
export async function getPlayerPlateDisciplineStats(
  playerId: number,
  season = new Date().getFullYear()
): Promise<BatterPlateDiscipline | null> {
  try {
    // Fetch full player stats
    const playerData = await getBatterStats({
      batterId: playerId,
      season,
    });

    // Skip pitchers unless they have significant batting stats
    if (
      playerData.primaryPosition === "P" &&
      playerData.seasonStats.atBats < 20
    ) {
      return null;
    }

    // Extract season batting stats
    const batting = playerData.seasonStats;

    // If we don't have the stats we need, return null
    if (!batting || !batting.gamesPlayed || !batting.atBats) {
      console.log(
        `No batting stats found for player ${playerId}, season ${season}`
      );
      return null;
    }

    // Calculate plate appearances if not provided
    const plateAppearances =
      batting.atBats +
      (batting.walks || 0) +
      (batting.hitByPitches || 0) +
      (batting.sacrificeFlies || 0);

    // Calculate rates
    const walkRate =
      plateAppearances > 0 ? (batting.walks || 0) / plateAppearances : 0;
    const strikeoutRate =
      plateAppearances > 0 ? (batting.strikeouts || 0) / plateAppearances : 0;
    const hbpRate =
      plateAppearances > 0 ? (batting.hitByPitches || 0) / plateAppearances : 0;
    const bbToK =
      (batting.strikeouts || 1) > 0
        ? (batting.walks || 0) / (batting.strikeouts || 1)
        : 0;
    const atBatsPerWalk =
      (batting.walks || 1) > 0 ? batting.atBats / (batting.walks || 1) : 0;

    // Estimate plate discipline metrics if not directly available
    // These would come from Statcast data in a real implementation
    const estimatedDiscipline = {
      chaseRate: 0.3, // League average is ~30%
      zoneSwingRate: 0.65, // League average is ~65%
      contactRate: 0.75, // League average is ~75%
      zoneContactRate: 0.85, // League average is ~85%
      firstPitchStrikeRate: 0.6, // League average is ~60%
    };

    // Adjust estimated discipline based on available stats
    // Higher BB/K ratio suggests better plate discipline
    if (bbToK > 0.5) {
      estimatedDiscipline.chaseRate -= 0.05;
      estimatedDiscipline.contactRate += 0.05;
    } else if (bbToK < 0.2) {
      estimatedDiscipline.chaseRate += 0.05;
      estimatedDiscipline.contactRate -= 0.05;
    }

    return {
      walks: batting.walks || 0,
      strikeouts: batting.strikeouts || 0,
      hitByPitch: batting.hitByPitches || 0,
      plateAppearances,
      atBats: batting.atBats,
      games: batting.gamesPlayed,
      walkRate,
      strikeoutRate,
      hbpRate,
      bbToK,
      atBatsPerWalk,
      discipline: estimatedDiscipline,
    };
  } catch (error) {
    console.error(
      `Error fetching plate discipline stats for player ${playerId}:`,
      error
    );
    return null;
  }
}

/**
 * Get career plate discipline metrics and trends
 */
export async function getCareerPlateDisciplineProfile(
  playerId: number
): Promise<{
  careerWalks: number;
  careerHbp: number;
  careerPlateAppearances: number;
  careerWalkRate: number;
  careerHbpRate: number;
  bestSeasonWalkRate: number;
  recentTrend: "improving" | "declining" | "stable";
  walkPropensity: "high" | "medium" | "low";
  age: number;
  yearsExperience: number;
  seasonToSeasonConsistency: number; // 0-1 scale, 1 being very consistent
} | null> {
  try {
    // Get player stats with historical data
    const playerData = await getBatterStats({
      batterId: playerId,
    });

    if (
      !playerData ||
      !playerData.careerStats ||
      playerData.careerStats.length === 0
    ) {
      return null;
    }

    // Get career totals
    let careerWalks = 0;
    let careerHbp = 0;
    let careerPlateAppearances = 0;
    let bestSeasonWalkRate = 0;
    let firstSeasonYear: number | null = null;

    // Track walkRate by season for consistency and trend analysis
    const seasonWalkRates: { season: number; walkRate: number; pa: number }[] =
      [];

    // Process each season
    playerData.careerStats.forEach((season) => {
      // Skip seasons with too few PAs
      if ((season.plateAppearances || 0) < 50) return;

      const seasonYear = parseInt(season.season);
      const walks = season.walks || 0;
      const hbp = season.hitByPitches || 0;
      const plateAppearances =
        season.plateAppearances ||
        season.atBats + walks + hbp + (season.sacrificeFlies || 0);

      // Track first season for experience calculation
      if (firstSeasonYear === null || seasonYear < firstSeasonYear) {
        firstSeasonYear = seasonYear;
      }

      // Update career totals
      careerWalks += walks;
      careerHbp += hbp;
      careerPlateAppearances += plateAppearances;

      // Calculate walk rate
      const walkRate = plateAppearances > 0 ? walks / plateAppearances : 0;

      // Check if best season
      if (walkRate > bestSeasonWalkRate && plateAppearances >= 200) {
        bestSeasonWalkRate = walkRate;
      }

      // Track for consistency and trend analysis
      seasonWalkRates.push({
        season: seasonYear,
        walkRate,
        pa: plateAppearances,
      });
    });

    // Calculate career rates
    const careerWalkRate =
      careerPlateAppearances > 0 ? careerWalks / careerPlateAppearances : 0;
    const careerHbpRate =
      careerPlateAppearances > 0 ? careerHbp / careerPlateAppearances : 0;

    // Calculate years of experience
    const currentYear = new Date().getFullYear();
    const yearsExperience = firstSeasonYear ? currentYear - firstSeasonYear : 0;

    // Estimate age (usually debut around 23-25)
    const estimatedAge = Math.min(38, Math.max(24, yearsExperience + 24));

    // Determine walk propensity
    let walkPropensity: "high" | "medium" | "low" = "medium";
    if (careerWalkRate >= 0.12) {
      walkPropensity = "high";
    } else if (careerWalkRate <= 0.06) {
      walkPropensity = "low";
    }

    // Calculate consistency
    let seasonToSeasonConsistency = 0.5; // Default medium consistency
    if (seasonWalkRates.length >= 2) {
      const variations: number[] = [];
      let previousWalkRate: number | null = null;

      // Sort seasons chronologically
      seasonWalkRates.sort((a, b) => a.season - b.season);

      for (const season of seasonWalkRates) {
        if (previousWalkRate !== null) {
          // Calculate relative change from previous season
          const change =
            Math.abs(season.walkRate - previousWalkRate) / previousWalkRate;
          variations.push(change);
        }
        previousWalkRate = season.walkRate;
      }

      if (variations.length > 0) {
        // Average the variations and convert to a consistency score
        // Lower variation = higher consistency
        const avgVariation =
          variations.reduce((sum, val) => sum + val, 0) / variations.length;
        seasonToSeasonConsistency = Math.max(0, Math.min(1, 1 - avgVariation));
      }
    }

    // Determine trend by focusing on recent seasons
    let recentTrend: "improving" | "declining" | "stable" = "stable";

    if (seasonWalkRates.length >= 3) {
      // Get last 3 seasons with enough PAs
      const recentSeasons = seasonWalkRates
        .filter((s) => s.pa >= 100)
        .sort((a, b) => b.season - a.season)
        .slice(0, 3);

      if (recentSeasons.length >= 2) {
        // Most recent season vs previous
        const mostRecent = recentSeasons[0];
        const previous = recentSeasons[1];

        // Calculate percent change
        const pctChange =
          (mostRecent.walkRate - previous.walkRate) / previous.walkRate;

        if (pctChange >= 0.15) {
          recentTrend = "improving";
        } else if (pctChange <= -0.15) {
          recentTrend = "declining";
        }
      }
    }

    return {
      careerWalks,
      careerHbp,
      careerPlateAppearances,
      careerWalkRate,
      careerHbpRate,
      bestSeasonWalkRate,
      recentTrend,
      walkPropensity,
      age: estimatedAge,
      yearsExperience,
      seasonToSeasonConsistency,
    };
  } catch (error) {
    console.error(
      `Error fetching career plate discipline profile for player ${playerId}:`,
      error
    );
    return null;
  }
}

/**
 * Get pitcher's walk and HBP tendencies
 */
export async function getPitcherControlProfile(
  pitcherId: number,
  season = new Date().getFullYear()
): Promise<PitcherControlProfile | null> {
  try {
    // Get pitcher stats
    const pitcherData = await getPitcherStats({
      pitcherId,
      season,
    });

    // Verify player is a pitcher
    if (!pitcherData || pitcherData.primaryPosition !== "P") {
      return null;
    }

    const currentSeason = season.toString();
    const stats = pitcherData.seasonStats[currentSeason] || {
      gamesPlayed: 0,
      gamesStarted: 0,
      inningsPitched: 0,
      wins: 0,
      losses: 0,
      era: 0,
      whip: 0,
      strikeouts: 0,
      walks: 0,
      saves: 0,
      hitBatsmen: 0,
    };

    // If no innings pitched, return null
    if (
      !stats.inningsPitched ||
      parseFloat(stats.inningsPitched.toString()) === 0
    ) {
      return null;
    }

    // Extract needed values
    const ip = parseFloat(stats.inningsPitched.toString());
    const walks = stats.walks || 0;
    const strikeouts = stats.strikeouts || 0;
    const hitBatsmen = stats.hitBatsmen || 0;

    // Calculate per 9 inning rates
    const walksPerNine = (walks / ip) * 9;
    const strikeoutsPerNine = (strikeouts / ip) * 9;
    const hbpPerNine = (hitBatsmen / ip) * 9;

    // Calculate K/BB ratio
    const strikeoutToWalkRatio = walks > 0 ? strikeouts / walks : strikeouts;

    // Determine walk and HBP propensity
    // MLB average BB/9 is ~3.0
    let walkPropensity: "high" | "medium" | "low" = "medium";
    if (walksPerNine >= 4.0) {
      walkPropensity = "high";
    } else if (walksPerNine <= 2.0) {
      walkPropensity = "low";
    }

    // MLB average HBP/9 is ~0.3-0.4
    let hbpPropensity: "high" | "medium" | "low" = "medium";
    if (hbpPerNine >= 0.6) {
      hbpPropensity = "high";
    } else if (hbpPerNine <= 0.2) {
      hbpPropensity = "low";
    }

    // Estimate control metrics if not directly available
    // These would come from pitch tracking data in a real implementation
    const estimatedControl = {
      zonePercentage: 0.5, // League average is ~50%
      firstPitchStrikePercentage: 0.6, // League average is ~60%
      pitchEfficiency: 3.8, // League average is ~3.8 pitches per PA
    };

    // Adjust estimated control based on available stats
    if (walksPerNine <= 2.0) {
      estimatedControl.zonePercentage += 0.05;
      estimatedControl.firstPitchStrikePercentage += 0.05;
      estimatedControl.pitchEfficiency -= 0.3;
    } else if (walksPerNine >= 4.0) {
      estimatedControl.zonePercentage -= 0.05;
      estimatedControl.firstPitchStrikePercentage -= 0.05;
      estimatedControl.pitchEfficiency += 0.3;
    }

    // Calculate control rating on 0-10 scale where 5 is average
    // Invert the walk rate so lower walk rates = higher control rating
    // MLB average BB/9 is ~3.0
    const controlRating = 5 * (3.0 / Math.max(0.5, walksPerNine));

    return {
      gamesStarted: stats.gamesStarted || 0,
      inningsPitched: ip,
      walks,
      strikeouts,
      hitBatsmen,
      walksPerNine,
      strikeoutsPerNine,
      hbpPerNine,
      strikeoutToWalkRatio,
      control: {
        walkPropensity,
        hbpPropensity,
        zonePercentage: estimatedControl.zonePercentage,
        firstPitchStrikePercentage: estimatedControl.firstPitchStrikePercentage,
        pitchEfficiency: estimatedControl.pitchEfficiency,
      },
      controlRating: Math.max(1, Math.min(10, controlRating)),
    };
  } catch (error) {
    console.error(
      `Error fetching pitcher control profile for player ${pitcherId}:`,
      error
    );
    return null;
  }
}

/**
 * Get batter vs pitcher matchup data focused on walks
 */
export async function getMatchupWalkData(
  batterId: number,
  pitcherId: number
): Promise<ControlMatchupData | null> {
  try {
    // Get matchup data
    const matchup = await analyzeHitterMatchup(batterId, pitcherId).catch(
      () => null
    );

    if (!matchup || !matchup.stats) {
      return null;
    }

    // Get player's baseline walk rate for comparison
    const playerStats = await getPlayerPlateDisciplineStats(batterId).catch(
      () => null
    );
    const baselineWalkRate = playerStats?.walkRate || 0.08; // Default to 8% if not available

    // Extract plate discipline stats from matchup
    const plateAppearances = matchup.stats.plateAppearances || 0;
    const walks = matchup.stats.walks || 0;
    const hitByPitch = matchup.stats.hitByPitch || 0;
    const strikeouts = matchup.stats.strikeouts || 0;

    // Calculate rates
    const walkRate = plateAppearances > 0 ? walks / plateAppearances : 0;
    const hbpRate = plateAppearances > 0 ? hitByPitch / plateAppearances : 0;
    const strikeoutRate =
      plateAppearances > 0 ? strikeouts / plateAppearances : 0;

    // Calculate relative walk rate
    // (matchup walk rate / batter's baseline walk rate)
    const relativeWalkRate =
      baselineWalkRate > 0 ? walkRate / baselineWalkRate : 1.0;

    // Determine sample size
    let sampleSize: "large" | "medium" | "small" | "none" = "none";
    if (plateAppearances >= 20) {
      sampleSize = "large";
    } else if (plateAppearances >= 10) {
      sampleSize = "medium";
    } else if (plateAppearances > 0) {
      sampleSize = "small";
    }

    return {
      plateAppearances,
      walks,
      hitByPitch,
      strikeouts,
      walkRate,
      hbpRate,
      strikeoutRate,
      sampleSize,
      relativeWalkRate,
    };
  } catch (error) {
    console.error(
      `Error getting matchup walk data for batter ${batterId} vs pitcher ${pitcherId}:`,
      error
    );
    return null;
  }
}

/**
 * Get batter's split stats against LHP/RHP with focus on walks
 */
export async function getWalkRateSplits(batterId: number): Promise<{
  vsLeft: {
    walkRate: number;
    strikeoutRate: number;
    plateAppearances: number;
  };
  vsRight: {
    walkRate: number;
    strikeoutRate: number;
    plateAppearances: number;
  };
  platoonDifference: number; // How much walk rate differs between L/R pitchers
} | null> {
  try {
    // Get batter splits
    const splits = await getBatterSplits(batterId);

    if (!splits) {
      return null;
    }

    // Calculate walk rates from splits data
    // If walk rate not directly available, estimate from OBP and AVG
    const vsLWalkRate =
      splits.vsLeft.walkRate || (splits.vsLeft.obp - splits.vsLeft.avg) * 0.8;
    const vsRWalkRate =
      splits.vsRight.walkRate ||
      (splits.vsRight.obp - splits.vsRight.avg) * 0.8;

    // Get plate appearances if available, otherwise estimate from at-bats
    const vsLPA = splits.vsLeft.plateAppearances || splits.vsLeft.atBats * 1.15;
    const vsRPA =
      splits.vsRight.plateAppearances || splits.vsRight.atBats * 1.15;

    // Calculate strikeout rates if available, otherwise use defaults
    const vsLStrikeoutRate = splits.vsLeft.strikeoutRate || 0.22; // League average
    const vsRStrikeoutRate = splits.vsRight.strikeoutRate || 0.22; // League average

    // Calculate platoon difference in walk rate (absolute difference)
    const platoonDifference = Math.abs(vsLWalkRate - vsRWalkRate);

    return {
      vsLeft: {
        walkRate: vsLWalkRate,
        strikeoutRate: vsLStrikeoutRate,
        plateAppearances: vsLPA,
      },
      vsRight: {
        walkRate: vsRWalkRate,
        strikeoutRate: vsRStrikeoutRate,
        plateAppearances: vsRPA,
      },
      platoonDifference,
    };
  } catch (error) {
    console.error(
      `Error getting walk rate splits for batter ${batterId}:`,
      error
    );
    return null;
  }
}

/**
 * Calculate expected walks for a batter against a specific pitcher
 * Enhanced with Statcast metrics for more accurate projections
 *
 * @param batterId MLB player ID for the batter
 * @param opposingPitcherId MLB player ID for the pitcher
 * @returns Object with expected walks and related metrics
 */
export async function calculateExpectedWalks(
  batterId: number,
  opposingPitcherId: number
): Promise<{
  expectedWalks: number;
  expectedHbp: number;
  confidenceScore: number; // 0-100
  factors: {
    batterWalkPropensity: number;
    pitcherControlFactor: number;
    matchupFactor: number;
    platoonFactor: number;
  };
}> {
  try {
    // Try to use the advanced metrics first if available
    let advancedMetrics;
    try {
      advancedMetrics = await getAdvancedPlateDisciplineMetrics(
        batterId,
        opposingPitcherId
      );
    } catch (error) {
      console.warn(
        `Could not get advanced plate discipline metrics, falling back to traditional analysis: ${error}`
      );
      advancedMetrics = null;
    }

    // If we have advanced metrics, use them for more accurate predictions
    if (advancedMetrics) {
      // Estimate plate appearances (typically 4-5 for a starter)
      const estimatedPlateAppearances = 4.2;

      // Calculate expected walks and HBP from the probabilities
      const expectedWalks =
        advancedMetrics.expectedOutcomes.walkProbability *
        estimatedPlateAppearances;

      const expectedHbp =
        advancedMetrics.expectedOutcomes.hitByPitchProbability *
        estimatedPlateAppearances;

      // Derive factors from advanced metrics for compatibility with existing model
      const batterWalkPropensity =
        advancedMetrics.batterMetrics.walkRate > 0.12
          ? 1.2
          : advancedMetrics.batterMetrics.walkRate > 0.09
          ? 1.0
          : 0.8;

      const pitcherControlFactor =
        advancedMetrics.pitcherMetrics.walkRate > 0.1
          ? 1.2
          : advancedMetrics.pitcherMetrics.walkRate > 0.07
          ? 1.0
          : 0.8;

      const matchupFactor =
        advancedMetrics.matchupAdvantage === "batter"
          ? 1.2
          : advancedMetrics.matchupAdvantage === "pitcher"
          ? 0.8
          : 1.0;

      // Estimate platoon factor (not directly available in advanced metrics)
      const platoonFactor = 1.0;

      return {
        expectedWalks,
        expectedHbp,
        confidenceScore: advancedMetrics.predictionConfidence * 10, // Convert to 0-100 scale
        factors: {
          batterWalkPropensity,
          pitcherControlFactor,
          matchupFactor,
          platoonFactor,
        },
      };
    }

    // If advanced metrics aren't available, fall back to the existing implementation
    // (Original code starts here)

    // Get batter's plate discipline profile
    const batterProfile = await getPlayerPlateDisciplineStats(batterId);

    if (!batterProfile) {
      throw new Error(`No batter profile found for ${batterId}`);
    }

    // Get pitcher's control profile
    const pitcherProfile = await getPitcherControlProfile(opposingPitcherId);

    if (!pitcherProfile) {
      throw new Error(`No pitcher profile found for ${opposingPitcherId}`);
    }

    // Get matchup data if available
    const matchupData = await getMatchupWalkData(
      batterId,
      opposingPitcherId
    ).catch(() => null);

    // Get platoon splits if available
    const platoonData = await getWalkRateSplits(batterId).catch(() => null);

    // Get pitcher handedness
    const pitcherData = await getPitcherStats({ pitcherId: opposingPitcherId });
    const pitcherThrows = pitcherData?.pitchHand || "R"; // Default to right-handed

    // Get batter handedness
    const batterData = await getBatterStats({ batterId });
    const batterHits = batterData?.batSide || "R"; // Default to right-handed

    // Base walk rate is weighted average of batter and pitcher tendencies
    const batterWalkRate = batterProfile.walkRate;
    const pitcherWalkRate = pitcherProfile.walksPerNine / 9 / 4.3; // Convert BB/9 to rate per PA

    // Weight the batter's walk rate more than the pitcher's (60/40 split)
    let expectedWalkRate = batterWalkRate * 0.6 + pitcherWalkRate * 0.4;

    // Adjust for matchup history if we have enough sample size
    if (matchupData && matchupData.sampleSize !== "none") {
      const matchupWeight =
        matchupData.sampleSize === "large"
          ? 0.3
          : matchupData.sampleSize === "medium"
          ? 0.2
          : 0.1;

      expectedWalkRate =
        expectedWalkRate * (1 - matchupWeight) +
        matchupData.walkRate * matchupWeight;
    }

    // Adjust for platoon splits if available
    if (platoonData) {
      const isSameSide =
        (batterHits === "L" && pitcherThrows === "L") ||
        (batterHits === "R" && pitcherThrows === "R");

      const platoonWalkRate = isSameSide
        ? platoonData.vsLeft.walkRate
        : platoonData.vsRight.walkRate;

      // Apply a small adjustment based on platoon splits
      expectedWalkRate = expectedWalkRate * 0.85 + platoonWalkRate * 0.15;
    }

    // Calculate expected HBP rate
    const batterHbpRate = batterProfile.hbpRate;

    // Calculate HBP rate based on inningsPitched since battersFaced isn't in the interface
    const pitcherHbpRate = pitcherProfile.hbpPerNine / 9; // Convert HBP/9 to rate per batter

    // HBP is more pitcher-driven than batter-driven (30/70 split)
    const expectedHbpRate = batterHbpRate * 0.3 + pitcherHbpRate * 0.7;

    // Estimate 4.2 plate appearances for a full game for a starter
    const estimatedPlateAppearances = 4.2;

    // Calculate expected walks and HBP
    const expectedWalks = expectedWalkRate * estimatedPlateAppearances;
    const expectedHbp = expectedHbpRate * estimatedPlateAppearances;

    // Calculate factors for insight
    const batterWalkPropensity =
      batterWalkRate > 0.12 ? 1.2 : batterWalkRate > 0.09 ? 1.0 : 0.8;

    const pitcherControlFactor =
      pitcherWalkRate > 0.1 ? 1.2 : pitcherWalkRate > 0.07 ? 1.0 : 0.8;

    const matchupFactor = matchupData?.relativeWalkRate || 1.0;

    const platoonFactor = platoonData
      ? Math.abs(platoonData.platoonDifference) > 0.03
        ? 1.2
        : 1.0
      : 1.0;

    // Confidence score calculation (0-100 scale)
    let confidenceScore = 70; // Base confidence

    // Adjust for sample sizes
    confidenceScore += batterProfile.plateAppearances > 300 ? 5 : 0;
    confidenceScore += pitcherProfile.inningsPitched > 50 ? 5 : 0;
    confidenceScore +=
      matchupData && matchupData.sampleSize !== "none" ? 10 : 0;
    confidenceScore += platoonData ? 5 : 0;

    // Cap at 100
    confidenceScore = Math.min(100, confidenceScore);

    return {
      expectedWalks,
      expectedHbp,
      confidenceScore,
      factors: {
        batterWalkPropensity,
        pitcherControlFactor,
        matchupFactor,
        platoonFactor,
      },
    };
  } catch (error) {
    console.error(`Error calculating expected walks: ${error}`);

    // Return default values if there's an error
    return {
      expectedWalks: 0.4, // League average is about 0.4 walks per game
      expectedHbp: 0.05, // League average is about 0.05 HBP per game
      confidenceScore: 30, // Low confidence due to error
      factors: {
        batterWalkPropensity: 1.0,
        pitcherControlFactor: 1.0,
        matchupFactor: 1.0,
        platoonFactor: 1.0,
      },
    };
  }
}

/**
 * Calculate expected DFS points from walks and HBP for a player in a specific game
 */
export async function calculatePlateDisciplineProjection(
  batterId: number,
  opposingPitcherId: number
): Promise<ControlProjection> {
  try {
    // Get walks projection
    const projection = await calculateExpectedWalks(
      batterId,
      opposingPitcherId
    );

    // Calculate expected points (2 points per walk and HBP)
    const walkPoints = projection.expectedWalks * WALK_POINTS;
    const hbpPoints = projection.expectedHbp * HBP_POINTS;

    // Calculate total expected points
    const totalPoints = walkPoints + hbpPoints;
    const totalExpected = projection.expectedWalks + projection.expectedHbp;

    // HBP is less predictable than walks, so lower confidence
    const hbpConfidence = Math.max(40, projection.confidenceScore - 20);

    return {
      walks: {
        expected: projection.expectedWalks,
        points: walkPoints,
        confidence: projection.confidenceScore,
      },
      hbp: {
        expected: projection.expectedHbp,
        points: hbpPoints,
        confidence: hbpConfidence,
      },
      total: {
        expected: totalExpected,
        points: totalPoints,
        confidence: projection.confidenceScore,
      },
    };
  } catch (error) {
    console.error(
      `Error calculating plate discipline projection for player ${batterId}:`,
      error
    );

    // Return conservative default values
    return {
      walks: {
        expected: 0.4,
        points: 0.8,
        confidence: 50,
      },
      hbp: {
        expected: 0.04,
        points: 0.08,
        confidence: 40,
      },
      total: {
        expected: 0.44,
        points: 0.88,
        confidence: 50,
      },
    };
  }
}

/**
 * Enhanced plate discipline metrics that combines MLB API and Statcast data
 * for both batter and pitcher to provide comprehensive matchup analysis
 *
 * @param batterId MLB player ID for the batter
 * @param pitcherId MLB player ID for the pitcher
 * @returns Object with detailed plate discipline metrics and matchup analysis
 */
export async function getAdvancedPlateDisciplineMetrics(
  batterId: number,
  pitcherId: number
): Promise<{
  batterMetrics: {
    chaseRate: number; // Swing percentage on pitches outside zone
    zoneContactRate: number; // Contact rate on pitches in zone
    whiffRate: number; // Miss rate on swings
    firstPitchSwingRate: number; // Rate of swinging at first pitch
    zoneSwingRate: number; // Swing rate on pitches in zone
    walkRate: number; // Overall walk rate
    strikeoutRate: number; // Overall strikeout rate
  };
  pitcherMetrics: {
    zoneRate: number; // Percentage of pitches in zone
    chaseInducedRate: number; // Rate at which batters chase
    contactAllowedRate: number; // Rate of contact allowed on swings
    firstPitchStrikeRate: number; // First pitch strike percentage
    walkRate: number; // Overall walk rate
    strikeoutRate: number; // Overall strikeout rate
  };
  matchupAdvantage: "batter" | "pitcher" | "neutral";
  predictionConfidence: number; // 1-10 scale
  expectedOutcomes: {
    walkProbability: number; // 0-1 probability of walk
    strikeoutProbability: number; // 0-1 probability of strikeout
    hitByPitchProbability: number; // 0-1 probability of HBP
    inPlayProbability: number; // 0-1 probability of ball in play
  };
}> {
  // Get enhanced data for both players in parallel
  const [batterData, pitcherData] = await Promise.all([
    getEnhancedBatterData(batterId),
    getEnhancedPitcherData(pitcherId),
  ]);

  // Get available plate discipline metrics from base stats and statcast
  const batterStats = batterData.seasonStats;
  const pitcherStats = pitcherData.seasonStats;

  // Calculate base metrics
  const batterWalkRate =
    batterStats.walks / (batterStats.atBats + batterStats.walks);
  const batterStrikeoutRate =
    batterStats.strikeouts / (batterStats.atBats + batterStats.walks);
  const pitcherWalkRate =
    pitcherStats.walks /
    (pitcherStats.battersFaced || pitcherStats.inningsPitched * 4.3);
  const pitcherStrikeoutRate =
    pitcherStats.strikeouts /
    (pitcherStats.battersFaced || pitcherStats.inningsPitched * 4.3);

  // Default plate discipline metrics if Statcast data isn't available
  let batterChaseRate = 0.3; // League average ~30%
  let batterZoneContactRate = 0.85; // League average ~85%
  let batterWhiffRate = 0.24; // League average ~24%
  let batterFirstPitchSwingRate = 0.28; // League average ~28%
  let batterZoneSwingRate = 0.67; // League average ~67%

  let pitcherZoneRate = 0.48; // League average ~48%
  let pitcherChaseInducedRate = 0.28; // League average ~28%
  let pitcherContactAllowedRate = 0.77; // League average ~77%
  let pitcherFirstPitchStrikeRate = 0.6; // League average ~60%

  // Use Statcast data if available
  if (pitcherData.controlMetrics) {
    pitcherZoneRate = pitcherData.controlMetrics.zoneRate;
    pitcherChaseInducedRate = pitcherData.controlMetrics.chaseRate;
    pitcherContactAllowedRate = 1 - pitcherData.controlMetrics.whiffRate / 100;
    pitcherFirstPitchStrikeRate = pitcherData.controlMetrics.firstPitchStrike;
  }

  // Adjust default values based on walk and strikeout rates if Statcast isn't available
  if (!pitcherData.controlMetrics) {
    // Higher K rate usually means better chase rate
    if (pitcherStrikeoutRate > 0.25) {
      pitcherChaseInducedRate += 0.05;
    } else if (pitcherStrikeoutRate < 0.18) {
      pitcherChaseInducedRate -= 0.03;
    }

    // Lower walk rate usually means better zone control
    if (pitcherWalkRate < 0.07) {
      pitcherZoneRate += 0.03;
    } else if (pitcherWalkRate > 0.1) {
      pitcherZoneRate -= 0.03;
    }
  }

  // Extract or estimate batter plate discipline metrics
  const batterOBP =
    batterStats.obp ||
    (batterStats.hits + batterStats.walks) /
      (batterStats.atBats + batterStats.walks);

  // Use batting statcast data if available
  // Note: These fields may need to be adjusted based on actual Statcast field names
  if (batterData.qualityMetrics) {
    // This is a simplification - in a real implementation you would extract the actual
    // discipline metrics from the Statcast data instead of using these proxies
    batterWhiffRate = 0.24; // This would come from Statcast whiff_percent
    batterChaseRate = batterOBP < 0.32 ? 0.33 : batterOBP > 0.38 ? 0.25 : 0.29;
    batterZoneContactRate = 0.85;
  }

  // Calculate matchup advantage
  let disciplineAdvantage = 0;

  // Batter with good discipline vs pitcher with poor control
  if (batterChaseRate < 0.28 && pitcherZoneRate < 0.46) {
    disciplineAdvantage += 2;
  }

  // Batter with poor discipline vs pitcher with good control
  if (batterChaseRate > 0.32 && pitcherZoneRate > 0.5) {
    disciplineAdvantage -= 2;
  }

  // Batter with good contact vs pitcher with low whiff rate
  if (batterZoneContactRate > 0.88 && pitcherContactAllowedRate > 0.8) {
    disciplineAdvantage += 1;
  }

  // Batter with poor contact vs pitcher with high whiff rate
  if (batterZoneContactRate < 0.82 && pitcherContactAllowedRate < 0.75) {
    disciplineAdvantage -= 1;
  }

  let matchupAdvantage: "batter" | "pitcher" | "neutral" = "neutral";
  if (disciplineAdvantage >= 2) {
    matchupAdvantage = "batter";
  } else if (disciplineAdvantage <= -2) {
    matchupAdvantage = "pitcher";
  }

  // Calculate prediction confidence
  // Higher confidence if we have statcast data for both players
  const hasQualityData = Boolean(
    batterData.qualityMetrics && pitcherData.controlMetrics
  );
  const sampleSizeConfidence = Math.min(
    10,
    Math.max(1, batterStats.atBats / 100 + pitcherStats.inningsPitched / 20)
  );
  const predictionConfidence = hasQualityData
    ? Math.min(10, sampleSizeConfidence + 2)
    : sampleSizeConfidence;

  // Calculate expected outcomes
  // 1. Start with baseline probabilities from season stats
  let walkProbability = (batterWalkRate + pitcherWalkRate) / 2;
  let strikeoutProbability = (batterStrikeoutRate + pitcherStrikeoutRate) / 2;

  // 2. Adjust based on matchup-specific metrics
  if (batterChaseRate < 0.27 && pitcherZoneRate < 0.47) {
    // Patient batter vs wild pitcher = more walks
    walkProbability *= 1.3;
  } else if (batterChaseRate > 0.33 && pitcherZoneRate > 0.5) {
    // Free-swinging batter vs control pitcher = fewer walks
    walkProbability *= 0.7;
  }

  if (batterWhiffRate > 0.27 && pitcherContactAllowedRate < 0.75) {
    // High whiff batter vs high whiff pitcher = more strikeouts
    strikeoutProbability *= 1.2;
  } else if (batterWhiffRate < 0.21 && pitcherContactAllowedRate > 0.8) {
    // Low whiff batter vs low whiff pitcher = fewer strikeouts
    strikeoutProbability *= 0.85;
  }

  // HBP is rare and harder to predict, use pitcher tendency as main factor
  const hitByPitchProbability = pitcherStats.hitBatsmen
    ? pitcherStats.hitBatsmen /
      (pitcherStats.battersFaced || pitcherStats.inningsPitched * 4.3)
    : 0.008; // League average ~0.8%

  // Probability of ball in play is everything else
  const inPlayProbability = Math.max(
    0,
    1 - (walkProbability + strikeoutProbability + hitByPitchProbability)
  );

  // Cap probabilities to reasonable ranges
  walkProbability = Math.min(0.25, Math.max(0.02, walkProbability));
  strikeoutProbability = Math.min(0.45, Math.max(0.1, strikeoutProbability));

  return {
    batterMetrics: {
      chaseRate: batterChaseRate,
      zoneContactRate: batterZoneContactRate,
      whiffRate: batterWhiffRate,
      firstPitchSwingRate: batterFirstPitchSwingRate,
      zoneSwingRate: batterZoneSwingRate,
      walkRate: batterWalkRate,
      strikeoutRate: batterStrikeoutRate,
    },
    pitcherMetrics: {
      zoneRate: pitcherZoneRate,
      chaseInducedRate: pitcherChaseInducedRate,
      contactAllowedRate: pitcherContactAllowedRate,
      firstPitchStrikeRate: pitcherFirstPitchStrikeRate,
      walkRate: pitcherWalkRate,
      strikeoutRate: pitcherStrikeoutRate,
    },
    matchupAdvantage,
    predictionConfidence,
    expectedOutcomes: {
      walkProbability,
      strikeoutProbability,
      hitByPitchProbability,
      inPlayProbability,
    },
  };
}

/**
 * Calculate DFS points projection based on advanced plate discipline metrics
 * This demonstrates how to use the getAdvancedPlateDisciplineMetrics function
 * for Daily Fantasy Sports (DFS) points projection
 *
 * @param batterId MLB player ID for the batter
 * @param pitcherId MLB player ID for the pitcher
 * @returns Projected DFS points from walks and HBP for this matchup
 */
export async function calculateAdvancedPlateDisciplineProjection(
  batterId: number,
  pitcherId: number
): Promise<{
  walks: {
    expected: number;
    points: number;
    confidence: number;
  };
  hbp: {
    expected: number;
    points: number;
    confidence: number;
  };
  total: {
    expected: number;
    points: number;
    confidence: number;
  };
  insights: string[];
}> {
  // Get advanced metrics that leverage Statcast data
  const advancedMetrics = await getAdvancedPlateDisciplineMetrics(
    batterId,
    pitcherId
  );

  // Estimate plate appearances for this game (typically 4-5 for a starter)
  const estimatedPlateAppearances = 4.2;

  // Calculate expected walks based on probability
  const expectedWalks =
    advancedMetrics.expectedOutcomes.walkProbability *
    estimatedPlateAppearances;

  // Calculate expected HBP based on probability
  const expectedHbp =
    advancedMetrics.expectedOutcomes.hitByPitchProbability *
    estimatedPlateAppearances;

  // Convert to DFS points
  const walkPoints = expectedWalks * WALK_POINTS;
  const hbpPoints = expectedHbp * HBP_POINTS;

  // Convert 1-10 confidence to percentage
  const confidencePercentage = advancedMetrics.predictionConfidence * 10;

  // Generate insights based on the matchup
  const insights: string[] = [];

  if (advancedMetrics.matchupAdvantage === "batter") {
    insights.push("Batter has plate discipline advantage in this matchup");

    if (
      advancedMetrics.batterMetrics.chaseRate < 0.28 &&
      advancedMetrics.pitcherMetrics.zoneRate < 0.46
    ) {
      insights.push("Patient batter vs. wild pitcher creates walk potential");
    }
  } else if (advancedMetrics.matchupAdvantage === "pitcher") {
    insights.push("Pitcher has control advantage in this matchup");

    if (
      advancedMetrics.batterMetrics.chaseRate > 0.32 &&
      advancedMetrics.pitcherMetrics.zoneRate > 0.5
    ) {
      insights.push(
        "Free-swinging batter vs. control pitcher reduces walk potential"
      );
    }
  }

  // Add insights on sample size
  if (advancedMetrics.predictionConfidence < 5) {
    insights.push("Limited sample size - prediction has higher variance");
  } else if (advancedMetrics.predictionConfidence > 8) {
    insights.push("Strong sample size with quality metrics from Statcast");
  }

  return {
    walks: {
      expected: expectedWalks,
      points: walkPoints,
      confidence: confidencePercentage,
    },
    hbp: {
      expected: expectedHbp,
      points: hbpPoints,
      confidence: confidencePercentage * 0.7, // Less confident in HBP prediction
    },
    total: {
      expected: expectedWalks + expectedHbp,
      points: walkPoints + hbpPoints,
      confidence: confidencePercentage,
    },
    insights,
  };
}

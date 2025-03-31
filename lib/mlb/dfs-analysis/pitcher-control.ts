/**
 * Specialized functions for analyzing pitcher control metrics (hits, walks, HBP allowed)
 * In DraftKings, pitcher control impacts negative points:
 * - Hit Against: -0.6 Pts
 * - Base on Balls Against: -0.6 Pts
 * - Hit Batsman: -0.6 Pts
 */

import {
  getBatterPlateDiscipline,
  getBatterStats,
} from "../player/batter-stats";
import { analyzeHitterMatchup } from "../player/matchups";
import { getPitcherPitchMix, getPitcherStats } from "../player/pitcher-stats";
import {
  BatterControlFactors,
  CareerControlProfile,
  ControlMatchupData,
  ControlProjection,
  ExpectedControlEvents,
  PitcherControlProfile,
  PitcherControlStats,
} from "../types/analysis";

// Negative points in DraftKings for these categories
export const HIT_AGAINST_POINTS = -0.6;
export const WALK_AGAINST_POINTS = -0.6;
export const HBP_AGAINST_POINTS = -0.6;

/**
 * Get pitcher's control stats and metrics
 *
 * @param pitcherId MLB player ID
 * @param season Season year (defaults to current year)
 * @returns Object with pitcher control statistics
 */
export async function getPitcherControlStats(
  pitcherId: number,
  season = new Date().getFullYear()
): Promise<PitcherControlStats | null> {
  try {
    // Get pitcher stats
    const pitcherData = await getPitcherStats({
      pitcherId,
      season,
    });

    // Verify player is a pitcher with innings pitched
    if (
      !pitcherData ||
      pitcherData.primaryPosition !== "P" ||
      !pitcherData.seasonStats.inningsPitched ||
      parseFloat(pitcherData.seasonStats.inningsPitched.toString()) === 0
    ) {
      return null;
    }

    // Extract needed values
    const stats = (pitcherData.seasonStats[season.toString()] || {}) as Record<
      string,
      any
    >;
    const ip = parseFloat(stats.inningsPitched?.toString() || "0");
    const walks = Number(stats.walks || 0);
    const strikeouts = Number(stats.strikeouts || 0);
    const hits = 0; // Need to calculate or retrieve from more detailed stats

    // Try to get more detailed pitch mix data which includes control metrics
    const pitchMixData = await getPitcherPitchMix({ pitcherId }).catch(
      () => null
    );

    // Calculate per 9 inning rates
    const walksPerNine = (walks / ip) * 9;
    const hitsPerNine = 0; // Need to calculate
    const hbpPerNine = 0; // Need to extract from more detailed stats

    // Calculate WHIP (Walks + Hits per Inning Pitched)
    const whip = Number(stats.whip || 0);

    // Calculate K/BB ratio
    const strikeoutToWalkRatio = walks > 0 ? strikeouts / walks : strikeouts;

    return {
      walks,
      hits: 0, // Placeholder - need to extract from detailed stats
      hitBatsmen: 0, // Placeholder - need to extract from detailed stats
      inningsPitched: ip,
      gamesStarted: Number(stats.gamesPlayed || 0),
      walksPerNine,
      hitsPerNine: hitsPerNine || 0,
      hbpPerNine: hbpPerNine || 0,
      whip,
      strikeoutToWalkRatio,
      zonePercentage: pitchMixData?.controlMetrics?.zonePercentage,
      firstPitchStrikePercentage:
        pitchMixData?.controlMetrics?.firstPitchStrikePercent,
      pitchEfficiency: 3.8, // Default MLB average pitches per PA
    };
  } catch (error) {
    console.error(
      `Error fetching pitcher control stats for player ${pitcherId}:`,
      error
    );
    return null;
  }
}

/**
 * Get detailed pitcher control profile with ratings
 */
export async function getPitcherControlProfile(
  pitcherId: number,
  season = new Date().getFullYear()
): Promise<PitcherControlProfile | null> {
  try {
    // Get pitcher control stats
    const controlStats = await getPitcherControlStats(pitcherId, season);

    if (!controlStats) {
      return null;
    }

    // Get pitch mix data for more detailed metrics
    const pitchMixData = await getPitcherPitchMix({ pitcherId }).catch(
      () => null
    );

    // Extract stats from pitcher data
    const ip = controlStats.inningsPitched;
    const walks = controlStats.walks;
    const hits = controlStats.hits || 0;
    const hitBatsmen = controlStats.hitBatsmen || 0;
    const strikeouts = controlStats.strikeoutToWalkRatio * walks; // Calculate from ratio

    // Calculate per 9 inning rates
    const walksPerNine = controlStats.walksPerNine;
    const hitsPerNine = (hits / ip) * 9 || 9.0; // Default to MLB average if not available
    const hbpPerNine = (hitBatsmen / ip) * 9 || 0.4; // Default to MLB average if not available

    // Determine walk propensity (MLB average BB/9 is ~3.0)
    let walkPropensity: "high" | "medium" | "low" = "medium";
    if (walksPerNine >= 4.0) {
      walkPropensity = "high";
    } else if (walksPerNine <= 2.0) {
      walkPropensity = "low";
    }

    // Determine hits propensity (MLB average H/9 is ~9.0)
    let hitsPropensity: "high" | "medium" | "low" = "medium";
    if (hitsPerNine >= 10.5) {
      hitsPropensity = "high";
    } else if (hitsPerNine <= 7.5) {
      hitsPropensity = "low";
    }

    // Determine HBP propensity (MLB average HBP/9 is ~0.3-0.4)
    let hbpPropensity: "high" | "medium" | "low" = "medium";
    if (hbpPerNine >= 0.6) {
      hbpPropensity = "high";
    } else if (hbpPerNine <= 0.2) {
      hbpPropensity = "low";
    }

    // Use pitch mix data for detailed control metrics or estimate
    const controlMetrics = {
      zonePercentage: pitchMixData?.controlMetrics?.zonePercentage || 0.5, // MLB average ~50%
      firstPitchStrikePercentage:
        pitchMixData?.controlMetrics?.firstPitchStrikePercent || 0.6, // MLB average ~60%
      pitchEfficiency: 3.8, // MLB average pitches per PA
    };

    // Adjust estimated control based on available walk rate
    if (walksPerNine <= 2.0) {
      controlMetrics.zonePercentage = Math.min(
        0.58,
        (controlMetrics.zonePercentage || 0.5) + 0.05
      );
      controlMetrics.firstPitchStrikePercentage = Math.min(
        0.68,
        (controlMetrics.firstPitchStrikePercentage || 0.6) + 0.05
      );
      controlMetrics.pitchEfficiency -= 0.3;
    } else if (walksPerNine >= 4.0) {
      controlMetrics.zonePercentage = Math.max(
        0.42,
        (controlMetrics.zonePercentage || 0.5) - 0.05
      );
      controlMetrics.firstPitchStrikePercentage = Math.max(
        0.52,
        (controlMetrics.firstPitchStrikePercentage || 0.6) - 0.05
      );
      controlMetrics.pitchEfficiency += 0.3;
    }

    // Calculate overall control rating on 0-10 scale where 5 is average
    // Base on WHIP (walks + hits per inning pitched)
    // MLB average WHIP is ~1.30
    let controlRating = 5 * (1.3 / Math.max(0.8, controlStats.whip));

    // Adjust control rating based on K/BB ratio
    // Higher K/BB indicates better control
    if (controlStats.strikeoutToWalkRatio > 3.0) {
      controlRating += 1.0;
    } else if (controlStats.strikeoutToWalkRatio < 1.5) {
      controlRating -= 1.0;
    }

    return {
      gamesStarted: controlStats.gamesStarted,
      inningsPitched: ip,
      walks,
      strikeouts,
      hits,
      hitBatsmen,
      walksPerNine,
      hitsPerNine,
      hbpPerNine,
      whip: controlStats.whip,
      strikeoutToWalkRatio: controlStats.strikeoutToWalkRatio,
      control: {
        walkPropensity,
        hitsPropensity,
        hbpPropensity,
        zonePercentage: controlMetrics.zonePercentage,
        firstPitchStrikePercentage: controlMetrics.firstPitchStrikePercentage,
        pitchEfficiency: controlMetrics.pitchEfficiency,
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
 * Get career control profile and trends for pitcher
 */
export async function getCareerControlProfile(
  pitcherId: number
): Promise<CareerControlProfile | null> {
  try {
    // Get player stats with historical data
    const pitcherData = await getPitcherStats({
      pitcherId,
    });

    if (
      !pitcherData ||
      !pitcherData.careerStats ||
      pitcherData.careerStats.length === 0
    ) {
      return null;
    }

    // Get career totals
    let careerWalks = 0;
    let careerHits = 0; // Would need to calculate from WHIP and IP
    let careerHbp = 0; // Not directly available in basic stats
    let careerInningsPitched = 0;
    let bestSeasonWhip = 999; // Start with a high value
    let firstSeasonYear: number | null = null;

    // Track WHIP by season for consistency and trend analysis
    const seasonWhipValues: { season: number; whip: number; ip: number }[] = [];

    // Process each season
    pitcherData.careerStats.forEach((season) => {
      // Skip seasons with too few innings
      if (parseFloat(season.inningsPitched?.toString() || "0") < 20) return;

      const seasonYear = parseInt(season.season);
      const walks = season.walks || 0;
      const ip = parseFloat(season.inningsPitched?.toString() || "0");
      const whip = season.whip || 0;

      // Track first season for experience calculation
      if (firstSeasonYear === null || seasonYear < firstSeasonYear) {
        firstSeasonYear = seasonYear;
      }

      // Update career totals
      careerWalks += walks;
      careerInningsPitched += ip;

      // Check if best season by WHIP
      if (whip < bestSeasonWhip && ip >= 50) {
        bestSeasonWhip = whip;
      }

      // Track for consistency and trend analysis
      seasonWhipValues.push({
        season: seasonYear,
        whip,
        ip,
      });
    });

    // Calculate career WHIP
    const careerWhip =
      pitcherData.careerStats.reduce(
        (total, season) =>
          total +
          parseFloat(season.inningsPitched?.toString() || "0") *
            (season.whip || 0),
        0
      ) / Math.max(1, careerInningsPitched);

    // Estimate careerHits based on WHIP and walks
    careerHits = Math.round(careerWhip * careerInningsPitched - careerWalks);

    // Calculate years of experience
    const currentYear = new Date().getFullYear();
    const yearsExperience = firstSeasonYear ? currentYear - firstSeasonYear : 0;

    // Estimate age (usually debut around 23-25)
    const estimatedAge = Math.min(38, Math.max(24, yearsExperience + 24));

    // Determine control propensity
    let controlPropensity: "high" | "medium" | "low" = "medium";
    if (careerWhip <= 1.15) {
      controlPropensity = "high";
    } else if (careerWhip >= 1.45) {
      controlPropensity = "low";
    }

    // Calculate consistency
    let seasonToSeasonConsistency = 0.5; // Default medium consistency
    if (seasonWhipValues.length >= 2) {
      const variations: number[] = [];
      let previousWhip: number | null = null;

      // Sort seasons chronologically
      seasonWhipValues.sort((a, b) => a.season - b.season);

      for (const season of seasonWhipValues) {
        if (previousWhip !== null && previousWhip > 0) {
          // Calculate relative change from previous season
          const change = Math.abs(season.whip - previousWhip) / previousWhip;
          variations.push(change);
        }
        previousWhip = season.whip;
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

    if (seasonWhipValues.length >= 3) {
      // Get last 3 seasons with enough innings
      const recentSeasons = seasonWhipValues
        .filter((s) => s.ip >= 30)
        .sort((a, b) => b.season - a.season)
        .slice(0, 3);

      if (recentSeasons.length >= 2) {
        // Most recent season vs previous - lower WHIP is better
        const mostRecent = recentSeasons[0];
        const previous = recentSeasons[1];

        // Calculate percent change (negative change means WHIP is lower = better)
        const pctChange = (mostRecent.whip - previous.whip) / previous.whip;

        if (pctChange <= -0.1) {
          recentTrend = "improving";
        } else if (pctChange >= 0.1) {
          recentTrend = "declining";
        }
      }
    }

    return {
      careerWalks,
      careerHits,
      careerHbp: 0, // Not available in basic stats
      careerInningsPitched,
      careerWhip,
      bestSeasonWhip,
      recentTrend,
      controlPropensity,
      age: estimatedAge,
      yearsExperience,
      seasonToSeasonConsistency,
    };
  } catch (error) {
    console.error(
      `Error fetching career control profile for pitcher ${pitcherId}:`,
      error
    );
    return null;
  }
}

/**
 * Get batter vs pitcher control matchup data
 */
export async function getControlMatchupData(
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

    // Get pitcher's baseline control rates for comparison
    const pitcherStats = await getPitcherControlStats(pitcherId).catch(
      () => null
    );
    const baselineHitRate = pitcherStats ? pitcherStats.hitsPerNine / 9 : 0.25; // Default to 25% if not available
    const baselineWalkRate = pitcherStats
      ? pitcherStats.walksPerNine / 9
      : 0.08; // Default to 8% if not available

    // Extract matchup stats
    const plateAppearances =
      matchup.stats.atBats +
      (matchup.stats.walks || 0) +
      (matchup.stats.hitByPitch || 0);
    const atBats = matchup.stats.atBats || 0;
    const hits = matchup.stats.hits || 0;
    const walks = matchup.stats.walks || 0;
    const hitByPitch = matchup.stats.hitByPitch || 0;
    const strikeouts = matchup.stats.strikeouts || 0;

    // Calculate rates
    const hitRate = atBats > 0 ? hits / atBats : 0;
    const walkRate = plateAppearances > 0 ? walks / plateAppearances : 0;
    const hbpRate = plateAppearances > 0 ? hitByPitch / plateAppearances : 0;
    const strikeoutRate =
      plateAppearances > 0 ? strikeouts / plateAppearances : 0;

    // Calculate relative rates
    // (matchup rate / pitcher's baseline rate)
    const relativeHitRate =
      baselineHitRate > 0 ? hitRate / baselineHitRate : 1.0;
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
      atBats,
      hits,
      walks,
      hitByPitch,
      strikeouts,
      hitRate,
      walkRate,
      hbpRate,
      strikeoutRate,
      sampleSize,
      relativeHitRate,
      relativeWalkRate,
    };
  } catch (error) {
    console.error(
      `Error getting control matchup data for batter ${batterId} vs pitcher ${pitcherId}:`,
      error
    );
    return null;
  }
}

/**
 * Get batter's control-related attributes
 */
export async function getBatterControlFactors(
  batterId: number
): Promise<BatterControlFactors | null> {
  try {
    // Get batter stats
    const batterStats = await getBatterStats({
      batterId,
    });

    if (!batterStats || !batterStats.seasonStats) {
      return null;
    }

    // Try to get plate discipline data if available
    const disciplineData = await getBatterPlateDiscipline({ batterId }).catch(
      (error) => {
        console.error(
          `Error getting batter discipline for ${batterId}:`,
          error
        );
        return null;
      }
    );

    // Calculate walk rate and strikeout rate
    const stats = batterStats.seasonStats;
    const plateAppearances =
      stats.atBats +
      (stats.walks || 0) +
      (stats.hitByPitches || 0) +
      (stats.sacrificeFlies || 0);
    const walkRate =
      plateAppearances > 0 ? (stats.walks || 0) / plateAppearances : 0;
    const strikeoutRate =
      plateAppearances > 0 ? (stats.strikeouts || 0) / plateAppearances : 0;

    // Calculate eye rating (0-10 scale based on walk rate)
    // MLB average walk rate is ~8%
    const eyeRating = Math.max(1, Math.min(10, (walkRate / 0.08) * 5));

    // Calculate contact rating (0-10 scale based on inverse of strikeout rate)
    // MLB average strikeout rate is ~22%
    const contactRating = Math.max(
      1,
      Math.min(10, (1 - strikeoutRate / 0.22) * 5)
    );

    // Construct discipline metrics
    const discipline = {
      chaseRate: disciplineData?.discipline.chaseRate || null,
      contactRate: disciplineData?.discipline.contactRate || null,
      walkRate,
      strikeoutRate,
    };

    return {
      eyeRating,
      contactRating,
      discipline: {
        chaseRate: discipline.chaseRate || undefined,
        contactRate: discipline.contactRate || undefined,
        walkRate,
        strikeoutRate,
      },
    };
  } catch (error) {
    console.error(
      `Error getting batter control factors for player ${batterId}:`,
      error
    );
    return null;
  }
}

/**
 * Calculate expected hits, walks, and HBP allowed for a pitcher in a game
 */
export async function calculateExpectedControlEvents(
  pitcherId: number,
  opposingLineup: number[] // Array of batter IDs
): Promise<ExpectedControlEvents> {
  try {
    // Get pitcher's control profile
    const controlProfile = await getPitcherControlProfile(pitcherId).catch(
      () => null
    );

    if (!controlProfile) {
      // Return conservative default values
      return {
        expectedHitsAllowed: 6.0, // MLB average ~6 hits per game
        expectedWalksAllowed: 2.25, // MLB average ~2.25 walks per game
        expectedHbpAllowed: 0.3, // MLB average ~0.3 HBP per game
        confidenceScore: 50,
        factors: {
          pitcherControlFactor: 1.0,
          batterEyeFactor: 1.0,
          batterContactFactor: 1.0,
          matchupFactor: 1.0,
        },
      };
    }

    // Get batter control factors for each batter in lineup
    const batterPromises = opposingLineup.map((batterId) =>
      getBatterControlFactors(batterId).catch(() => null)
    );

    const batterFactors = await Promise.all(batterPromises);
    const validBatterFactors = batterFactors.filter(Boolean);

    // Calculate average batter eye and contact ratings
    const avgEyeRating =
      validBatterFactors.reduce(
        (sum, batter) => sum + (batter?.eyeRating || 5),
        0
      ) / Math.max(1, validBatterFactors.length);

    const avgContactRating =
      validBatterFactors.reduce(
        (sum, batter) => sum + (batter?.contactRating || 5),
        0
      ) / Math.max(1, validBatterFactors.length);

    // Get matchup data for each batter
    const matchupPromises = opposingLineup.map((batterId) =>
      getControlMatchupData(batterId, pitcherId).catch(() => null)
    );

    const matchups = await Promise.all(matchupPromises);
    const validMatchups = matchups.filter(Boolean);

    // Calculate average matchup factors, weighted by sample size
    let totalWeight = 0;
    let weightedHitRateSum = 0;
    let weightedWalkRateSum = 0;

    validMatchups.forEach((matchup) => {
      let weight = 0;
      if (matchup.sampleSize === "large") weight = 3;
      else if (matchup.sampleSize === "medium") weight = 2;
      else if (matchup.sampleSize === "small") weight = 1;

      if (weight > 0) {
        weightedHitRateSum += matchup.relativeHitRate * weight;
        weightedWalkRateSum += matchup.relativeWalkRate * weight;
        totalWeight += weight;
      }
    });

    // Calculate average matchup factors (default to 1.0 if no data)
    const avgMatchupHitFactor =
      totalWeight > 0 ? weightedHitRateSum / totalWeight : 1.0;
    const avgMatchupWalkFactor =
      totalWeight > 0 ? weightedWalkRateSum / totalWeight : 1.0;

    // Calculate factors
    const pitcherControlFactor = 1.0; // Neutral base value

    // Calculate relative to MLB average (5.0 is average on 0-10 scale)
    const batterEyeFactor = avgEyeRating / 5.0;
    const batterContactFactor = avgContactRating / 5.0;

    // Base expectations for 6-inning start
    const baseInnings = 6.0;

    // Calculate expected values
    const expectedHitsAllowed =
      (controlProfile.hitsPerNine / 9) *
      baseInnings *
      batterContactFactor *
      avgMatchupHitFactor;
    const expectedWalksAllowed =
      (controlProfile.walksPerNine / 9) *
      baseInnings *
      batterEyeFactor *
      avgMatchupWalkFactor;
    const expectedHbpAllowed = (controlProfile.hbpPerNine / 9) * baseInnings;

    // Calculate confidence score
    let confidence = 70; // Start with baseline confidence

    // Adjust confidence based on data quality
    if (controlProfile.inningsPitched > 50) confidence += 10;
    if (validBatterFactors.length > 6) confidence += 5;
    if (validMatchups.filter((m) => m.sampleSize !== "none").length > 3)
      confidence += 5;

    // Cap confidence at 100
    confidence = Math.min(100, confidence);

    return {
      expectedHitsAllowed,
      expectedWalksAllowed,
      expectedHbpAllowed,
      confidenceScore: confidence,
      factors: {
        pitcherControlFactor,
        batterEyeFactor,
        batterContactFactor,
        matchupFactor: (avgMatchupHitFactor + avgMatchupWalkFactor) / 2,
      },
    };
  } catch (error) {
    console.error(
      `Error calculating expected control events for pitcher ${pitcherId}:`,
      error
    );

    // Return conservative default values
    return {
      expectedHitsAllowed: 6.0, // MLB average ~6 hits per game
      expectedWalksAllowed: 2.25, // MLB average ~2.25 walks per game
      expectedHbpAllowed: 0.3, // MLB average ~0.3 HBP per game
      confidenceScore: 50,
      factors: {
        pitcherControlFactor: 1.0,
        batterEyeFactor: 1.0,
        batterContactFactor: 1.0,
        matchupFactor: 1.0,
      },
    };
  }
}

/**
 * Calculate expected DFS points from control events (hits, walks, HBP allowed)
 */
export async function calculateControlProjection(
  pitcherId: number,
  opposingLineup: number[] // Array of batter IDs
): Promise<ControlProjection> {
  try {
    // Get control events projection
    const projection = await calculateExpectedControlEvents(
      pitcherId,
      opposingLineup
    );

    // Calculate expected points (all negative values in DraftKings)
    const hitPoints = projection.expectedHitsAllowed * HIT_AGAINST_POINTS;
    const walkPoints = projection.expectedWalksAllowed * WALK_AGAINST_POINTS;
    const hbpPoints = projection.expectedHbpAllowed * HBP_AGAINST_POINTS;

    // Calculate total expected events and points
    const totalEvents =
      projection.expectedHitsAllowed +
      projection.expectedWalksAllowed +
      projection.expectedHbpAllowed;
    const totalPoints = hitPoints + walkPoints + hbpPoints;

    // HBP is less predictable, so lower confidence
    const hbpConfidence = Math.max(40, projection.confidenceScore - 20);

    return {
      hits: {
        expected: projection.expectedHitsAllowed,
        high: projection.expectedHitsAllowed * 1.3,
        low: projection.expectedHitsAllowed * 0.7,
        range: projection.expectedHitsAllowed * 0.6,
        points: hitPoints,
        confidence: projection.confidenceScore,
      },
      walks: {
        expected: projection.expectedWalksAllowed,
        high: projection.expectedWalksAllowed * 1.3,
        low: projection.expectedWalksAllowed * 0.7,
        range: projection.expectedWalksAllowed * 0.6,
        points: walkPoints,
        confidence: projection.confidenceScore,
      },
      hbp: {
        expected: projection.expectedHbpAllowed,
        high: projection.expectedHbpAllowed * 1.5,
        low: projection.expectedHbpAllowed * 0.5,
        range: projection.expectedHbpAllowed,
        points: hbpPoints,
        confidence: hbpConfidence,
      },
      overall: {
        controlRating: 5.0, // Default to average
        confidenceScore: projection.confidenceScore,
      },
    };
  } catch (error) {
    console.error(
      `Error calculating control projection for pitcher ${pitcherId}:`,
      error
    );

    // Return conservative default values
    const defaultControlProjection: ControlProjection = {
      hits: {
        expected: 6.0,
        high: 7.8,
        low: 4.2,
        range: 3.6,
        points: 6.0 * HIT_AGAINST_POINTS,
        confidence: 50,
      },
      walks: {
        expected: 2.25,
        high: 2.9,
        low: 1.6,
        range: 1.3,
        points: 2.25 * WALK_AGAINST_POINTS,
        confidence: 50,
      },
      hbp: {
        expected: 0.3,
        high: 0.45,
        low: 0.15,
        range: 0.3,
        points: 0.3 * HBP_AGAINST_POINTS,
        confidence: 40,
      },
      overall: {
        controlRating: 5.0,
        confidenceScore: 50,
      },
    };
    return defaultControlProjection;
  }
}

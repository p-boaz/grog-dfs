/**
 * Specialized functions for analyzing plate discipline (walks and HBP)
 * Both walks and hit-by-pitch are worth +2 points in DraftKings
 */

import { getBatterSplits, getBatterStats } from "../player/batter-stats";
import { analyzeHitterMatchup } from "../player/matchups";
import { getPitcherStats } from "../player/pitcher-stats";

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
): Promise<{
  walks: number;
  strikeouts: number;
  hitByPitch: number;
  plateAppearances: number;
  atBats: number;
  games: number;
  walkRate: number;
  strikeoutRate: number;
  hbpRate: number;
  bbToK: number; // Walk to strikeout ratio
  atBatsPerWalk: number;
  discipline: {
    chaseRate?: number; // Swing % at pitches outside zone
    zoneSwingRate?: number; // Swing % at pitches in zone
    contactRate?: number; // Contact % on swings
    zoneContactRate?: number; // Contact % on pitches in zone
    firstPitchStrikeRate?: number; // First pitch strike percentage
  };
} | null> {
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
): Promise<{
  gamesStarted: number;
  inningsPitched: number;
  walks: number;
  strikeouts: number;
  hitBatsmen: number;
  walksPerNine: number;
  strikeoutsPerNine: number;
  hbpPerNine: number;
  strikeoutToWalkRatio: number;
  control: {
    walkPropensity: "high" | "medium" | "low";
    hbpPropensity: "high" | "medium" | "low";
    zonePercentage?: number; // Percent of pitches in the strike zone
    firstPitchStrikePercentage?: number;
    pitchEfficiency?: number; // Average pitches per PA
  };
  controlRating: number; // 0-10 scale where 5 is average
} | null> {
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
): Promise<{
  plateAppearances: number;
  walks: number;
  hitByPitch: number;
  strikeouts: number;
  walkRate: number;
  hbpRate: number;
  strikeoutRate: number;
  sampleSize: "large" | "medium" | "small" | "none";
  relativeWalkRate: number; // How this matchup compares to batter's overall walk rate
} | null> {
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
 * Calculate expected walks for a player in a specific game
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
    // Gather all required data in parallel
    const [
      batterStats,
      careerProfile,
      pitcherProfile,
      matchupData,
      platoonData,
    ] = await Promise.all([
      getPlayerPlateDisciplineStats(batterId).catch(() => null),
      getCareerPlateDisciplineProfile(batterId).catch(() => null),
      getPitcherControlProfile(opposingPitcherId).catch(() => null),
      getMatchupWalkData(batterId, opposingPitcherId).catch(() => null),
      getWalkRateSplits(batterId).catch(() => null),
    ]);

    // Get pitcher handedness to determine platoon advantage
    const pitcherData = await getPitcherStats({
      pitcherId: opposingPitcherId,
    }).catch(() => null);
    const pitcherHand = pitcherData?.pitchHand || "R"; // Default to right-handed if unknown

    // Get batter handedness for platoon advantage
    const batterData = await getBatterStats({ batterId }).catch(() => null);
    const batterHand = batterData?.batSide || "R"; // Default to right-handed if unknown

    // Average MLB plate appearances per game
    const plateAppearancesPerGame = 4.2;

    // Baseline walk rate from player's season stats or career
    let baseWalkRate;
    let baseHbpRate;

    if (batterStats) {
      baseWalkRate = batterStats.walkRate;
      baseHbpRate = batterStats.hbpRate;
    } else if (careerProfile) {
      baseWalkRate = careerProfile.careerWalkRate;
      baseHbpRate = careerProfile.careerHbpRate;
    } else {
      // Default to MLB average if no stats available
      baseWalkRate = 0.08; // 8% walk rate
      baseHbpRate = 0.008; // 0.8% HBP rate
    }

    // Apply pitcher control factor
    let pitcherControlFactor = 1.0;
    if (pitcherProfile) {
      // Inverse of pitcher control: lower control rating = more walks
      pitcherControlFactor = 10 / pitcherProfile.controlRating;
    }

    // Apply matchup adjustment
    let matchupFactor = 1.0;
    if (matchupData && matchupData.sampleSize !== "none") {
      // Use matchup data if sample size is reasonable
      // Weight based on sample size
      if (matchupData.sampleSize === "large") {
        matchupFactor = matchupData.relativeWalkRate * 0.6 + 0.4;
      } else if (matchupData.sampleSize === "medium") {
        matchupFactor = matchupData.relativeWalkRate * 0.4 + 0.6;
      } else {
        matchupFactor = matchupData.relativeWalkRate * 0.2 + 0.8;
      }
    }

    // Apply platoon adjustment
    let platoonFactor = 1.0;
    if (platoonData) {
      // Higher walk rate vs either LHP or RHP
      if (
        pitcherHand === "L" &&
        platoonData.vsLeft.walkRate > platoonData.vsRight.walkRate
      ) {
        platoonFactor =
          1 + (platoonData.platoonDifference / baseWalkRate) * 0.5;
      } else if (
        pitcherHand === "R" &&
        platoonData.vsRight.walkRate > platoonData.vsLeft.walkRate
      ) {
        platoonFactor =
          1 + (platoonData.platoonDifference / baseWalkRate) * 0.5;
      }
    } else {
      // If no platoon data, use traditional platoon advantage
      // Left-handed batters typically walk more against right-handed pitchers
      // Right-handed batters typically walk more against left-handed pitchers
      if (
        (batterHand === "L" && pitcherHand === "R") ||
        (batterHand === "R" && pitcherHand === "L")
      ) {
        platoonFactor = 1.1; // 10% increase for platoon advantage
      }
    }

    // Calculate adjusted walk and HBP rates
    const adjustedWalkRate =
      baseWalkRate * pitcherControlFactor * matchupFactor * platoonFactor;

    // HBP rate is mainly influenced by pitcher's HBP tendency
    let hbpPitcherFactor = 1.0;
    if (pitcherProfile) {
      if (pitcherProfile.control.hbpPropensity === "high") {
        hbpPitcherFactor = 1.5;
      } else if (pitcherProfile.control.hbpPropensity === "low") {
        hbpPitcherFactor = 0.5;
      }
    }
    const adjustedHbpRate = baseHbpRate * hbpPitcherFactor;

    // Calculate expected walks and HBP per game
    const expectedWalks = adjustedWalkRate * plateAppearancesPerGame;
    const expectedHbp = adjustedHbpRate * plateAppearancesPerGame;

    // Calculate confidence score
    let confidence = 70; // Start with baseline confidence

    // Adjust confidence based on data quality
    if (batterStats && careerProfile) confidence += 10;
    if (matchupData && matchupData.sampleSize !== "none") confidence += 10;

    // Cap confidence at 100
    confidence = Math.min(100, confidence);

    return {
      expectedWalks,
      expectedHbp,
      confidenceScore: confidence,
      factors: {
        batterWalkPropensity: baseWalkRate / 0.08, // Normalized to league average
        pitcherControlFactor,
        matchupFactor,
        platoonFactor,
      },
    };
  } catch (error) {
    console.error(
      `Error calculating expected walks for player ${batterId} vs pitcher ${opposingPitcherId}:`,
      error
    );

    // Return conservative default values
    return {
      expectedWalks: 0.4, // MLB average (~0.4 walks per game)
      expectedHbp: 0.04, // MLB average (~0.04 HBP per game)
      confidenceScore: 50,
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
}> {
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

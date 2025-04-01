/**
 * MLB Player Domain Types
 * 
 * These types build on the raw API types to provide a more structured
 * and validated representation of player data for the application.
 */

import { BatterApiResponse, BatterCareerApiStats, BatterSeasonApiStats, 
         PitcherApiResponse, PitcherCareerApiStats, PitcherSeasonApiStats } from '../api/player';

/**
 * Normalized batter stats with consistent numeric values
 * This converts string values from API to proper numbers
 */
export interface BatterStats {
  // Required core batting statistics
  gamesPlayed: number;
  atBats: number;
  hits: number;
  homeRuns: number;
  rbi: number; // PRIMARY field for runs batted in
  stolenBases: number;
  avg: number; // Normalized as number (not string)
  obp: number; // Normalized as number (not string)
  slg: number; // Normalized as number (not string)
  ops: number; // Normalized as number (not string)
  runs: number;
  walks: number;
  strikeouts: number;
  caughtStealing: number;
  
  // Additional hit types
  doubles: number;
  triples: number;
  
  // Secondary statistics (always include but may be 0)
  hitByPitches: number;
  sacrificeFlies: number;
  plateAppearances: number;
  
  // Advanced metrics
  babip: number;  // Batting Average on Balls In Play
  iso: number;    // Isolated Power (SLG - AVG)
  hrRate: number; // Home Run Rate (HR/AB)
  kRate: number;  // Strikeout Rate (K/PA)
  bbRate: number; // Walk Rate (BB/PA)
  sbRate: number; // Stolen Base Rate (SB/Games)
  wOBA?: number;  // Weighted On-Base Average
  
  // Calculate with default value if missing
  [key: string]: number | undefined;
}

/**
 * Normalized pitcher stats with consistent numeric values
 */
export interface PitcherStats {
  // Core pitching statistics
  gamesPlayed: number;
  gamesStarted: number;
  inningsPitched: number; // Normalized as number (not string)
  inningsDecimal: number; // Decimal representation (e.g., 7.2 -> 7.667)
  wins: number;
  losses: number;
  era: number; // Normalized as number (not string)
  whip: number; // Normalized as number (not string)
  strikeouts: number;
  walks: number;
  saves: number;
  homeRunsAllowed: number;
  hitBatsmen: number;
  
  // Additional statistics
  qualityStarts: number;
  blownSaves: number;
  holds: number;
  battersFaced: number;
  hitsAllowed: number;
  earnedRuns: number;
  completeGames: number;
  shutouts: number;
  
  // Advanced metrics
  kRate: number; // Strikeout Rate (K/BF)
  bbRate: number; // Walk Rate (BB/BF)
  k9: number; // Strikeouts per 9 innings
  bb9: number; // Walks per 9 innings
  hr9: number; // Home runs per 9 innings
  
  // Calculate with default value if missing
  [key: string]: number;
}

/**
 * Complete normalized batter information
 */
export interface Batter {
  id: number;
  fullName: string;
  team: string;
  teamId?: number;
  position: string;
  handedness: string;
  currentSeason: BatterStats;
  careerByYear: Record<string, BatterStats>;
  career: BatterStats; // Aggregated career stats
}

/**
 * Complete normalized pitcher information
 */
export interface Pitcher {
  id: number;
  fullName: string;
  team: string;
  teamId?: number;
  position: string;
  throwsHand: string;
  currentSeason: PitcherStats;
  careerByYear: Record<string, PitcherStats>;
  career: PitcherStats; // Aggregated career stats
}

/**
 * Normalize a BatterSeasonApiStats object to BatterStats
 * This handles conversion of string values to numbers and adds defaults
 */
export function normalizeBatterStats(apiStats: BatterSeasonApiStats): BatterStats {
  return {
    gamesPlayed: apiStats.gamesPlayed || 0,
    atBats: apiStats.atBats || 0,
    hits: apiStats.hits || 0,
    homeRuns: apiStats.homeRuns || 0,
    rbi: apiStats.rbi || apiStats.rbis || 0,
    stolenBases: apiStats.stolenBases || 0,
    avg: parseFloat(apiStats.avg || '0'),
    obp: parseFloat(apiStats.obp || '0'),
    slg: parseFloat(apiStats.slg || '0'),
    ops: parseFloat(apiStats.ops || '0'),
    runs: apiStats.runs || 0,
    walks: apiStats.walks || 0,
    strikeouts: apiStats.strikeouts || 0,
    caughtStealing: apiStats.caughtStealing || 0,
    doubles: apiStats.doubles || 0,
    triples: apiStats.triples || 0,
    hitByPitches: apiStats.hitByPitches || 0,
    sacrificeFlies: apiStats.sacrificeFlies || 0,
    plateAppearances: apiStats.plateAppearances || 0,
    babip: apiStats.babip || 0,
    iso: apiStats.iso || 0,
    hrRate: apiStats.hrRate || 0,
    kRate: apiStats.kRate || 0,
    bbRate: apiStats.bbRate || 0,
    sbRate: apiStats.sbRate || 0,
  };
}

/**
 * Normalize a PitcherSeasonApiStats object to PitcherStats
 * This handles conversion of string values to numbers and adds defaults
 */
export function normalizePitcherStats(apiStats: PitcherSeasonApiStats): PitcherStats {
  // Parse innings pitched into decimal innings
  // Format is typically like "183.2" meaning 183 2/3 innings
  const inningsPitched = parseFloat(apiStats.inningsPitched || '0');
  
  // Calculate decimal innings (e.g., 183.2 -> 183.667)
  const wholePart = Math.floor(inningsPitched);
  const fractionPart = inningsPitched % 1;
  const decimalInnings = wholePart + (fractionPart === 0.1 ? 1/3 : (fractionPart === 0.2 ? 2/3 : 0));
  
  // Calculate advanced metrics if we have the necessary stats
  const battersFaced = apiStats.battersFaced || 0;
  const kRate = battersFaced > 0 ? (apiStats.strikeouts || 0) / battersFaced : 0;
  const bbRate = battersFaced > 0 ? (apiStats.walks || 0) / battersFaced : 0;
  
  // Per 9 inning metrics
  const inningsForRatio = decimalInnings > 0 ? decimalInnings : 1;
  const k9 = 9 * (apiStats.strikeouts || 0) / inningsForRatio;
  const bb9 = 9 * (apiStats.walks || 0) / inningsForRatio;
  const hr9 = 9 * (apiStats.homeRunsAllowed || 0) / inningsForRatio;
  
  return {
    gamesPlayed: apiStats.gamesPlayed || 0,
    gamesStarted: apiStats.gamesStarted || 0,
    inningsPitched: inningsPitched,
    inningsDecimal: decimalInnings,
    wins: apiStats.wins || 0,
    losses: apiStats.losses || 0,
    era: parseFloat(apiStats.era || '0'),
    whip: parseFloat(apiStats.whip || '0'),
    strikeouts: apiStats.strikeouts || 0,
    walks: apiStats.walks || 0,
    saves: apiStats.saves || 0,
    homeRunsAllowed: apiStats.homeRunsAllowed || 0,
    hitBatsmen: apiStats.hitBatsmen || 0,
    qualityStarts: apiStats.qualityStarts || 0,
    blownSaves: apiStats.blownSaves || 0,
    holds: apiStats.holds || 0,
    battersFaced: battersFaced,
    hitsAllowed: apiStats.hitsAllowed || 0,
    earnedRuns: apiStats.earnedRuns || 0,
    completeGames: apiStats.completeGames || 0,
    shutouts: apiStats.shutouts || 0,
    kRate,
    bbRate,
    k9,
    bb9,
    hr9,
  };
}

/**
 * Convert an API batter response to a normalized Batter domain object
 */
export function batterFromApi(apiResponse: BatterApiResponse): Batter {
  // Process current season stats
  const currentSeason = normalizeBatterStats(apiResponse.seasonStats);
  
  // Process career stats by year
  const careerByYear: Record<string, BatterStats> = {};
  
  apiResponse.careerStats.forEach(season => {
    careerByYear[season.season] = normalizeCareerBatterStats(season);
  });
  
  // Generate aggregated career stats
  const career = calculateAggregateBatterStats(Object.values(careerByYear));
  
  return {
    id: apiResponse.id,
    fullName: apiResponse.fullName,
    team: apiResponse.currentTeam,
    position: apiResponse.primaryPosition,
    handedness: apiResponse.batSide,
    currentSeason,
    careerByYear,
    career,
  };
}

/**
 * Convert an API pitcher response to a normalized Pitcher domain object
 */
export function pitcherFromApi(apiResponse: PitcherApiResponse): Pitcher {
  // Get the most recent season's stats
  const seasons = Object.keys(apiResponse.seasonStats).sort().reverse();
  const currentSeasonKey = seasons[0] || 'unknown';
  const currentSeasonApi = apiResponse.seasonStats[currentSeasonKey] || {} as PitcherSeasonApiStats;
  
  // Process current season stats
  const currentSeason = normalizePitcherStats(currentSeasonApi);
  
  // Process career stats by year
  const careerByYear: Record<string, PitcherStats> = {};
  
  apiResponse.careerStats.forEach(season => {
    careerByYear[season.season] = normalizeCareerPitcherStats(season);
  });
  
  // Generate aggregated career stats
  const career = calculateAggregatePitcherStats(Object.values(careerByYear));
  
  return {
    id: apiResponse.id,
    fullName: apiResponse.fullName,
    team: apiResponse.currentTeam,
    position: apiResponse.primaryPosition,
    throwsHand: apiResponse.pitchHand,
    currentSeason,
    careerByYear,
    career,
  };
}

/**
 * Normalize career batter stats from API to domain model
 */
function normalizeCareerBatterStats(career: BatterCareerApiStats): BatterStats {
  return {
    gamesPlayed: career.gamesPlayed || 0,
    atBats: career.atBats || 0,
    hits: career.hits || 0,
    homeRuns: career.homeRuns || 0,
    rbi: career.rbi || 0,
    stolenBases: career.stolenBases || 0,
    avg: parseFloat(career.avg || '0'),
    obp: parseFloat(career.obp || '0'),
    slg: parseFloat(career.slg || '0'),
    ops: parseFloat(career.ops || '0'),
    runs: 0, // Often not included in career stats
    walks: career.walks || 0,
    strikeouts: career.strikeouts || 0,
    caughtStealing: career.caughtStealing || 0,
    doubles: career.doubles || 0,
    triples: career.triples || 0,
    hitByPitches: 0, // Often not included in career stats
    sacrificeFlies: 0, // Often not included in career stats
    plateAppearances: career.plateAppearances || 0,
    babip: career.babip || 0,
    iso: career.iso || 0,
    hrRate: career.homeRuns / career.atBats || 0,
    kRate: career.strikeouts ? career.strikeouts / (career.plateAppearances || career.atBats) : 0,
    bbRate: career.walks ? career.walks / (career.plateAppearances || career.atBats) : 0,
    sbRate: career.stolenBases / career.gamesPlayed || 0,
  };
}

/**
 * Normalize career pitcher stats from API to domain model
 */
function normalizeCareerPitcherStats(career: PitcherCareerApiStats): PitcherStats {
  // Parse innings pitched
  const inningsPitched = parseFloat(career.inningsPitched || '0');
  const wholePart = Math.floor(inningsPitched);
  const fractionPart = inningsPitched % 1;
  const decimalInnings = wholePart + (fractionPart === 0.1 ? 1/3 : (fractionPart === 0.2 ? 2/3 : 0));
  
  // Estimate batters faced if not provided
  const estimatedBF = decimalInnings * 4.3; // Average batters per inning
  
  return {
    gamesPlayed: career.gamesPlayed || 0,
    gamesStarted: career.gamesStarted || 0,
    inningsPitched: inningsPitched,
    inningsDecimal: decimalInnings,
    wins: career.wins || 0,
    losses: career.losses || 0,
    era: parseFloat(career.era || '0'),
    whip: parseFloat(career.whip || '0'),
    strikeouts: career.strikeouts || 0,
    walks: career.walks || 0,
    saves: career.saves || 0,
    homeRunsAllowed: career.homeRunsAllowed || 0,
    hitBatsmen: career.hitBatsmen || 0,
    qualityStarts: 0, // Often not in career stats
    blownSaves: 0,    // Often not in career stats
    holds: 0,         // Often not in career stats
    battersFaced: estimatedBF,
    hitsAllowed: 0,   // Calculate from WHIP if needed
    earnedRuns: 0,    // Calculate from ERA if needed
    completeGames: 0, // Often not in career stats
    shutouts: 0,      // Often not in career stats
    
    // Derived metrics
    kRate: career.strikeouts / estimatedBF || 0,
    bbRate: career.walks / estimatedBF || 0,
    k9: 9 * career.strikeouts / decimalInnings || 0,
    bb9: 9 * career.walks / decimalInnings || 0,
    hr9: 9 * career.homeRunsAllowed / decimalInnings || 0,
  };
}

/**
 * Calculate aggregate batter stats from multiple seasons
 */
function calculateAggregateBatterStats(seasons: BatterStats[]): BatterStats {
  if (seasons.length === 0) {
    return createEmptyBatterStats();
  }
  
  // Sum up countable stats
  const summed = seasons.reduce((total, season) => {
    return {
      gamesPlayed: total.gamesPlayed + season.gamesPlayed,
      atBats: total.atBats + season.atBats,
      hits: total.hits + season.hits,
      homeRuns: total.homeRuns + season.homeRuns,
      rbi: total.rbi + season.rbi,
      stolenBases: total.stolenBases + season.stolenBases,
      runs: total.runs + season.runs,
      walks: total.walks + season.walks,
      strikeouts: total.strikeouts + season.strikeouts,
      caughtStealing: total.caughtStealing + season.caughtStealing,
      doubles: total.doubles + season.doubles,
      triples: total.triples + season.triples,
      hitByPitches: total.hitByPitches + season.hitByPitches,
      sacrificeFlies: total.sacrificeFlies + season.sacrificeFlies,
      plateAppearances: total.plateAppearances + season.plateAppearances,
      
      // These will be recalculated below
      avg: 0,
      obp: 0,
      slg: 0,
      ops: 0,
      babip: 0,
      iso: 0,
      hrRate: 0,
      kRate: 0,
      bbRate: 0,
      sbRate: 0,
    };
  }, createEmptyBatterStats());
  
  // Calculate rate stats
  const avg = summed.atBats > 0 ? summed.hits / summed.atBats : 0;
  const obp = summed.plateAppearances > 0 ? 
    (summed.hits + summed.walks + summed.hitByPitches) / summed.plateAppearances : 0;
  
  const totalBases = summed.hits + summed.doubles + 2 * summed.triples + 3 * summed.homeRuns;
  const slg = summed.atBats > 0 ? totalBases / summed.atBats : 0;
  
  return {
    ...summed,
    avg,
    obp,
    slg,
    ops: obp + slg,
    iso: slg - avg,
    babip: (summed.hits - summed.homeRuns) / (summed.atBats - summed.strikeouts - summed.homeRuns + summed.sacrificeFlies) || 0,
    hrRate: summed.atBats > 0 ? summed.homeRuns / summed.atBats : 0,
    kRate: summed.plateAppearances > 0 ? summed.strikeouts / summed.plateAppearances : 0,
    bbRate: summed.plateAppearances > 0 ? summed.walks / summed.plateAppearances : 0,
    sbRate: summed.gamesPlayed > 0 ? summed.stolenBases / summed.gamesPlayed : 0,
  };
}

/**
 * Calculate aggregate pitcher stats from multiple seasons
 */
function calculateAggregatePitcherStats(seasons: PitcherStats[]): PitcherStats {
  if (seasons.length === 0) {
    return createEmptyPitcherStats();
  }
  
  // Sum up countable stats
  const summed = seasons.reduce((total, season) => {
    return {
      gamesPlayed: total.gamesPlayed + season.gamesPlayed,
      gamesStarted: total.gamesStarted + season.gamesStarted,
      inningsPitched: total.inningsPitched + season.inningsPitched,
      inningsDecimal: total.inningsDecimal + season.inningsDecimal,
      wins: total.wins + season.wins,
      losses: total.losses + season.losses,
      strikeouts: total.strikeouts + season.strikeouts,
      walks: total.walks + season.walks,
      saves: total.saves + season.saves,
      homeRunsAllowed: total.homeRunsAllowed + season.homeRunsAllowed,
      hitBatsmen: total.hitBatsmen + season.hitBatsmen,
      qualityStarts: total.qualityStarts + season.qualityStarts,
      blownSaves: total.blownSaves + season.blownSaves,
      holds: total.holds + season.holds,
      battersFaced: total.battersFaced + season.battersFaced,
      hitsAllowed: total.hitsAllowed + season.hitsAllowed,
      earnedRuns: total.earnedRuns + season.earnedRuns,
      completeGames: total.completeGames + season.completeGames,
      shutouts: total.shutouts + season.shutouts,
      
      // These will be recalculated below
      era: 0,
      whip: 0,
      kRate: 0,
      bbRate: 0,
      k9: 0,
      bb9: 0,
      hr9: 0,
    };
  }, createEmptyPitcherStats());
  
  // Calculate rate stats
  const era = summed.inningsDecimal > 0 ? (9 * summed.earnedRuns) / summed.inningsDecimal : 0;
  const whip = summed.inningsDecimal > 0 ? (summed.walks + summed.hitsAllowed) / summed.inningsDecimal : 0;
  
  return {
    ...summed,
    era,
    whip,
    kRate: summed.battersFaced > 0 ? summed.strikeouts / summed.battersFaced : 0,
    bbRate: summed.battersFaced > 0 ? summed.walks / summed.battersFaced : 0,
    k9: summed.inningsDecimal > 0 ? (9 * summed.strikeouts) / summed.inningsDecimal : 0,
    bb9: summed.inningsDecimal > 0 ? (9 * summed.walks) / summed.inningsDecimal : 0,
    hr9: summed.inningsDecimal > 0 ? (9 * summed.homeRunsAllowed) / summed.inningsDecimal : 0,
  };
}

/**
 * Create an empty batter stats object with all values initialized to 0
 */
function createEmptyBatterStats(): BatterStats {
  return {
    gamesPlayed: 0,
    atBats: 0,
    hits: 0,
    homeRuns: 0,
    rbi: 0,
    stolenBases: 0,
    avg: 0,
    obp: 0,
    slg: 0,
    ops: 0,
    runs: 0,
    walks: 0,
    strikeouts: 0,
    caughtStealing: 0,
    doubles: 0,
    triples: 0,
    hitByPitches: 0,
    sacrificeFlies: 0,
    plateAppearances: 0,
    babip: 0,
    iso: 0,
    hrRate: 0,
    kRate: 0,
    bbRate: 0,
    sbRate: 0,
  };
}

/**
 * Create an empty pitcher stats object with all values initialized to 0
 */
function createEmptyPitcherStats(): PitcherStats {
  return {
    gamesPlayed: 0,
    gamesStarted: 0,
    inningsPitched: 0,
    inningsDecimal: 0,
    wins: 0,
    losses: 0,
    era: 0,
    whip: 0,
    strikeouts: 0,
    walks: 0,
    saves: 0,
    homeRunsAllowed: 0,
    hitBatsmen: 0,
    qualityStarts: 0,
    blownSaves: 0,
    holds: 0,
    battersFaced: 0,
    hitsAllowed: 0,
    earnedRuns: 0,
    completeGames: 0,
    shutouts: 0,
    kRate: 0,
    bbRate: 0,
    k9: 0,
    bb9: 0,
    hr9: 0,
  };
}

/**
 * Type guard to check if an object is a valid BatterStats
 */
export function isBatterStats(obj: any): obj is BatterStats {
  return obj && 
    typeof obj === 'object' &&
    typeof obj.gamesPlayed === 'number' &&
    typeof obj.atBats === 'number' &&
    typeof obj.hits === 'number' &&
    typeof obj.homeRuns === 'number' &&
    typeof obj.rbi === 'number';
}

/**
 * Type guard to check if an object is a valid PitcherStats
 */
export function isPitcherStats(obj: any): obj is PitcherStats {
  return obj && 
    typeof obj === 'object' &&
    typeof obj.gamesPlayed === 'number' &&
    typeof obj.gamesStarted === 'number' &&
    typeof obj.inningsPitched === 'number' &&
    typeof obj.wins === 'number' &&
    typeof obj.losses === 'number' &&
    typeof obj.era === 'number';
}

/**
 * Type guard to check if an object is a valid Batter
 */
export function isBatter(obj: any): obj is Batter {
  return obj && 
    typeof obj === 'object' &&
    typeof obj.id === 'number' &&
    typeof obj.fullName === 'string' &&
    typeof obj.position === 'string' &&
    isBatterStats(obj.currentSeason);
}

/**
 * Type guard to check if an object is a valid Pitcher
 */
export function isPitcher(obj: any): obj is Pitcher {
  return obj && 
    typeof obj === 'object' &&
    typeof obj.id === 'number' &&
    typeof obj.fullName === 'string' &&
    typeof obj.position === 'string' &&
    isPitcherStats(obj.currentSeason);
}
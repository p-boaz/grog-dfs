/**
 * Type guards for runtime type checking
 */

/**
 * Type guard for RunProductionStats
 */
export function isRunProductionStats(value: any): value is RunProductionStats {
  return (
    value !== null &&
    typeof value === 'object' &&
    'runs' in value &&
    'rbi' in value &&
    'games' in value &&
    'plateAppearances' in value &&
    'runsPerGame' in value &&
    'rbiPerGame' in value &&
    'onBasePercentage' in value &&
    'sluggingPct' in value &&
    'battingAverage' in value &&
    'runningSpeed' in value &&
    'battedBallProfile' in value
  );
}

/**
 * Type guard for CareerRunProductionProfile
 */
export function isCareerRunProductionProfile(value: any): value is CareerRunProductionProfile {
  return (
    value !== null &&
    typeof value === 'object' &&
    'careerRuns' in value &&
    'careerRBI' in value &&
    'careerGames' in value &&
    'careerRunsPerGame' in value &&
    'careerRBIPerGame' in value &&
    'bestSeasonRuns' in value &&
    'bestSeasonRBI' in value &&
    'recentTrend' in value &&
    'seasonToSeasonVariance' in value
  );
}

/**
 * Type guard for TeamOffensiveContext
 */
export function isTeamOffensiveContext(value: any): value is TeamOffensiveContext {
  return (
    value !== null &&
    typeof value === 'object' &&
    'runsPerGame' in value &&
    'teamOffensiveRating' in value &&
    'lineupStrength' in value &&
    'runnersOnBaseFrequency' in value
  );
}

/**
 * Type guard for LineupContext
 */
export function isLineupContext(value: any): value is LineupContext {
  return (
    value !== null &&
    typeof value === 'object' &&
    'lineupPosition' in value &&
    'battingOrder' in value &&
    'hittersBehind' in value &&
    'hittersAhead' in value &&
    'expectedRunOpportunities' in value &&
    'expectedRbiOpportunities' in value
  );
}

/**
 * Type guard for PitcherRunAllowance
 */
export function isPitcherRunAllowance(value: any): value is PitcherRunAllowance {
  return (
    value !== null &&
    typeof value === 'object' &&
    'gamesStarted' in value &&
    'inningsPitched' in value &&
    'earnedRuns' in value &&
    'runsAllowed' in value &&
    'era' in value &&
    'runsPer9' in value &&
    'whip' in value &&
    'runScoringOpportunityRate' in value &&
    'runAllowanceRating' in value
  );
}

/**
 * Type guard for ExpectedRuns
 */
export function isExpectedRuns(value: any): value is ExpectedRuns {
  return (
    value !== null &&
    typeof value === 'object' &&
    'expectedRuns' in value &&
    'confidenceScore' in value &&
    'factors' in value
  );
}

/**
 * Type guard for ExpectedRBIs
 */
export function isExpectedRBIs(value: any): value is ExpectedRBIs {
  return (
    value !== null &&
    typeof value === 'object' &&
    'expectedRBIs' in value &&
    'confidenceScore' in value &&
    'factors' in value
  );
}

/**
 * Type guard for RunProductionAnalysis
 */
export function isRunProductionAnalysis(value: any): value is RunProductionAnalysis {
  return (
    value !== null &&
    typeof value === 'object' &&
    'runs' in value &&
    'rbis' in value &&
    'total' in value
  );
}

/**
 * Type guard for BatterAnalysis
 */
export function isBatterAnalysis(value: any): value is BatterAnalysis {
  return (
    value !== null &&
    typeof value === 'object' &&
    'batterId' in value &&
    'name' in value &&
    'team' in value &&
    'opponent' in value &&
    'opposingPitcher' in value &&
    'position' in value &&
    'gameId' in value &&
    'venue' in value &&
    'stats' in value &&
    'matchup' in value &&
    'projections' in value &&
    'lineupPosition' in value &&
    'factors' in value &&
    'draftKings' in value
  );
}

/**
 * Type guard for BatterQualityMetrics
 */
export function isBatterQualityMetrics(value: any): value is BatterQualityMetrics {
  return (
    value !== null &&
    typeof value === 'object' &&
    'battedBallQuality' in value &&
    'power' in value &&
    'contactRate' in value &&
    'plateApproach' in value &&
    'speed' in value &&
    'consistency' in value
  );
}

/**
 * Type guard for HitProjection
 */
export function isHitProjection(value: any): value is HitProjection {
  return (
    value !== null &&
    typeof value === 'object' &&
    'singles' in value &&
    'doubles' in value &&
    'triples' in value &&
    'homeRuns' in value &&
    'walks' in value &&
    'hitByPitch' in value &&
    'stolenBases' in value &&
    'expectedPoints' in value &&
    'total' in value &&
    'confidence' in value
  );
}

/**
 * Type guard for BatterProjections
 */
export function isBatterProjections(value: any): value is BatterProjections {
  return (
    value !== null &&
    typeof value === 'object' &&
    'expected' in value &&
    'upside' in value &&
    'floor' in value &&
    'confidence' in value &&
    'homeRunProbability' in value &&
    'stolenBaseProbability' in value
  );
}

/**
 * Type guard for DetailedHitProjection
 */
export function isDetailedHitProjection(value: any): value is DetailedHitProjection {
  return (
    value !== null &&
    typeof value === 'object' &&
    'expectedHits' in value &&
    'byType' in value &&
    'confidence' in value &&
    'totalHitPoints' in value &&
    'atBats' in value
  );
}

/**
 * Type guard for DetailedHitProjections
 */
export function isDetailedHitProjections(value: any): value is DetailedHitProjections {
  return (
    value !== null &&
    typeof value === 'object' &&
    'total' in value &&
    'byType' in value &&
    'confidence' in value &&
    'factors' in value
  );
}

/**
 * Type guard for ExpectedRuns
 */
export function isExpectedRuns(value: any): value is ExpectedRuns {
  return (
    value !== null &&
    typeof value === 'object' &&
    'expected' in value &&
    'ceiling' in value &&
    'floor' in value &&
    'runFactors' in value &&
    'confidence' in value
  );
}

/**
 * Type guard for ExpectedRBIs
 */
export function isExpectedRBIs(value: any): value is ExpectedRBIs {
  return (
    value !== null &&
    typeof value === 'object' &&
    'expected' in value &&
    'ceiling' in value &&
    'floor' in value &&
    'rbiFactors' in value &&
    'confidence' in value
  );
}

/**
 * Type guard for PitcherRunAllowance
 */
export function isPitcherRunAllowance(value: any): value is PitcherRunAllowance {
  return (
    value !== null &&
    typeof value === 'object' &&
    'runsAllowedPerGame' in value &&
    'earnedRunAverage' in value &&
    'baseRunners' in value &&
    'scoringInningPercentage' in value
  );
}

/**
 * Type guard for Projections
 */
export function isProjections(value: any): value is Projections {
  return (
    value !== null &&
    typeof value === 'object' &&
    'runs' in value &&
    'rbi' in value &&
    'expectedPoints' in value &&
    'hitProjections' in value &&
    'upside' in value &&
    'floor' in value
  );
}

/**
 * Type guard for BatterInfo
 */
export function isBatterInfo(value: any): value is BatterInfo {
  return (
    value !== null &&
    typeof value === 'object' &&
    'id' in value &&
    'name' in value &&
    'position' in value &&
    'lineupPosition' in value &&
    'isHome' in value &&
    'opposingPitcher' in value
  );
}

/**
 * Type guard for GameInfo
 */
export function isGameInfo(value: any): value is GameInfo {
  return (
    value !== null &&
    typeof value === 'object' &&
    'gameId' in value &&
    'venue' in value &&
    'homeTeam' in value &&
    'awayTeam' in value &&
    'environment' in value &&
    'ballpark' in value &&
    'pitchers' in value
  );
}

/**
 * Type guard for DKPlayer
 */
export function isDKPlayer(value: any): value is DKPlayer {
  return (
    value !== null &&
    typeof value === 'object' &&
    'id' in value &&
    'name' in value &&
    'position' in value &&
    'salary' in value &&
    'avgPointsPerGame' in value &&
    'team' in value &&
    'lineupPosition' in value
  );
}

/**
 * Type guard for HomeRunAnalysis
 */
export function isHomeRunAnalysis(value: any): value is HomeRunAnalysis {
  return (
    value !== null &&
    typeof value === 'object' &&
    'expectedHomeRuns' in value &&
    'homeRunProbability' in value &&
    'multipleHRProbability' in value &&
    'factors' in value &&
    'confidence' in value
  );
}

/**
 * Type guard for StolenBaseAnalysis
 */
export function isStolenBaseAnalysis(value: any): value is StolenBaseAnalysis {
  return (
    value !== null &&
    typeof value === 'object' &&
    'expectedSteals' in value &&
    'stealAttemptProbability' in value &&
    'stealSuccessProbability' in value &&
    'factors' in value &&
    'confidence' in value
  );
}

/**
 * Type guard for HitAnalysis
 */
export function isHitAnalysis(value: any): value is HitAnalysis {
  return (
    value !== null &&
    typeof value === 'object' &&
    'expectedHits' in value &&
    'hitTypes' in value &&
    'factors' in value &&
    'confidence' in value
  );
}

/**
 * Type guard for PlayerHitStats
 */
export function isPlayerHitStats(value: any): value is PlayerHitStats {
  return (
    value !== null &&
    typeof value === 'object' &&
    'battingAverage' in value &&
    'onBasePercentage' in value &&
    'sluggingPct' in value &&
    'hits' in value &&
    'singles' in value &&
    'doubles' in value &&
    'triples' in value &&
    'atBats' in value &&
    'games' in value &&
    'hitRate' in value &&
    'singleRate' in value &&
    'doubleRate' in value &&
    'tripleRate' in value &&
    'babip' in value &&
    'lineDriverRate' in value &&
    'contactRate' in value
  );
}

/**
 * Type guard for CareerHitProfile
 */
export function isCareerHitProfile(value: any): value is CareerHitProfile {
  return (
    value !== null &&
    typeof value === 'object' &&
    'careerHits' in value &&
    'careerSingles' in value &&
    'careerDoubles' in value &&
    'careerTriples' in value &&
    'careerGames' in value &&
    'careerAtBats' in value &&
    'careerBattingAverage' in value &&
    'hitTypeDistribution' in value &&
    'bestSeasonAvg' in value &&
    'recentTrend' in value &&
    'homeVsAway' in value
  );
}

/**
 * Type guard for BallparkHitFactor
 */
export function isBallparkHitFactor(value: any): value is BallparkHitFactor {
  return (
    value !== null &&
    typeof value === 'object' &&
    'overall' in value &&
    'singles' in value &&
    'doubles' in value &&
    'triples' in value &&
    'homeRuns' in value &&
    'runFactor' in value &&
    'rbiFactor' in value &&
    'byHitType' in value &&
    'byHandedness' in value
  );
}

/**
 * Type guard for WeatherHitImpact
 */
export function isWeatherHitImpact(value: any): value is WeatherHitImpact {
  return (
    value !== null &&
    typeof value === 'object' &&
    'temperature' in value &&
    'windSpeed' in value &&
    'windDirection' in value &&
    'isOutdoor' in value &&
    'temperatureFactor' in value &&
    'windFactor' in value &&
    'overallFactor' in value &&
    'byHitType' in value
  );
}

/**
 * Type guard for PitcherHitVulnerability
 */
export function isPitcherHitVulnerability(value: any): value is PitcherHitVulnerability {
  return (
    value !== null &&
    typeof value === 'object' &&
    'gamesStarted' in value &&
    'inningsPitched' in value &&
    'hitsAllowed' in value &&
    'hitsPer9' in value &&
    'babip' in value &&
    'byHitType' in value &&
    'hitVulnerability' in value
  );
}

/**
 * Type guard for MatchupHitStats
 */
export function isMatchupHitStats(value: any): value is MatchupHitStats {
  return (
    value !== null &&
    typeof value === 'object' &&
    'atBats' in value &&
    'hits' in value &&
    'singles' in value &&
    'doubles' in value &&
    'triples' in value &&
    'battingAverage' in value &&
    'sampleSize' in value &&
    'advantage' in value
  );
}

/**
 * Type guard for BatterPlatoonSplits
 */
export function isBatterPlatoonSplits(value: any): value is BatterPlatoonSplits {
  return (
    value !== null &&
    typeof value === 'object' &&
    'vsLeft' in value &&
    'vsRight' in value &&
    'platoonAdvantage' in value &&
    'platoonSplit' in value
  );
}

/**
 * Type guard for HitTypeRates
 */
export function isHitTypeRates(value: any): value is HitTypeRates {
  return (
    value !== null &&
    typeof value === 'object' &&
    'expectedBA' in value &&
    'hitTypeRates' in value &&
    'factors' in value
  );
}

/**
 * Type guard for DetailedHitProjection
 */
export function isDetailedHitProjection(value: any): value is DetailedHitProjection {
  return (
    value !== null &&
    typeof value === 'object' &&
    'expectedHits' in value &&
    'byType' in value &&
    'totalHitPoints' in value &&
    'atBats' in value &&
    'confidence' in value
  );
}

/**
 * Type guard for RareEventAnalysis
 */
export function isRareEventAnalysis(value: any): value is RareEventAnalysis {
  return (
    value !== null &&
    typeof value === 'object' &&
    'expectedRareEventPoints' in value &&
    'confidenceScore' in value &&
    'confidence' in value &&
    'eventProbabilities' in value &&
    'riskRewardRating' in value
  );
}

/**
 * Type guard for HitTypeRates
 */
export function isHitTypeRates(value: any): value is HitTypeRates {
  return (
    value !== null &&
    typeof value === 'object' &&
    'single' in value &&
    'double' in value &&
    'triple' in value &&
    'homeRun' in value
  );
}

/**
 * Type guard for BallparkHitFactor
 */
export function isBallparkHitFactor(value: any): value is BallparkHitFactor {
  return (
    value !== null &&
    typeof value === 'object' &&
    'singles' in value &&
    'doubles' in value &&
    'triples' in value &&
    'homeRuns' in value
  );
}

/**
 * Type guard for WeatherHitImpact
 */
export function isWeatherHitImpact(value: any): value is WeatherHitImpact {
  return (
    value !== null &&
    typeof value === 'object' &&
    'temperature' in value &&
    'wind' in value &&
    'overall' in value &&
    'byType' in value
  );
}

/**
 * Type guard for BatterPlatoonSplits
 */
export function isBatterPlatoonSplits(value: any): value is BatterPlatoonSplits {
  return (
    value !== null &&
    typeof value === 'object' &&
    'vsLeft' in value &&
    'vsRight' in value
  );
}

/**
 * Type guard for PlayerHitStats
 */
export function isPlayerHitStats(value: any): value is PlayerHitStats {
  return (
    value !== null &&
    typeof value === 'object' &&
    'avg' in value &&
    'obp' in value &&
    'slg' in value &&
    'ops' in value &&
    'iso' in value &&
    'babip' in value
  );
}

/**
 * Type guard for CareerHitProfile
 */
export function isCareerHitProfile(value: any): value is CareerHitProfile {
  return (
    value !== null &&
    typeof value === 'object' &&
    'careerAvg' in value &&
    'careerIso' in value &&
    'recentTrend' in value &&
    'consistencyRating' in value &&
    'advantageVsHandedness' in value
  );
}

/**
 * Type guard for PitcherHitVulnerability
 */
export function isPitcherHitVulnerability(value: any): value is PitcherHitVulnerability {
  return (
    value !== null &&
    typeof value === 'object' &&
    'contactAllowed' in value &&
    'hardHitAllowed' in value &&
    'byType' in value
  );
}

/**
 * Type guard for MatchupHitStats
 */
export function isMatchupHitStats(value: any): value is MatchupHitStats {
  return (
    value !== null &&
    typeof value === 'object' &&
    'atBats' in value &&
    'hits' in value &&
    'extraBaseHits' in value &&
    'homeRuns' in value &&
    'avg' in value &&
    'ops' in value
  );
}

/**
 * Type guard for AdvancedMatchupAnalysis
 */
export function isAdvancedMatchupAnalysis(value: any): value is AdvancedMatchupAnalysis {
  return (
    value !== null &&
    typeof value === 'object' &&
    'matchupRating' in value &&
    'advantagePlayer' in value &&
    'confidenceScore' in value &&
    'factors' in value &&
    'keyInsights' in value &&
    'historicalMatchup' in value
  );
}

/**
 * Type guard for HitterMatchupAnalysis
 */
export function isHitterMatchupAnalysis(value: any): value is HitterMatchupAnalysis {
  return (
    value !== null &&
    typeof value === 'object' &&
    'plateAppearances' in value &&
    'babip' in value &&
    'sampleSize' in value &&
    'confidence' in value &&
    'expectedAvg' in value &&
    'expectedObp' in value &&
    'expectedSlg' in value &&
    'strikeoutProbability' in value &&
    'walkProbability' in value &&
    'homeProbability' in value &&
    'stats' in value
  );
}

/**
 * Type guard for StartingPitcherAnalysis
 */
export function isStartingPitcherAnalysis(value: any): value is StartingPitcherAnalysis {
  return (
    value !== null &&
    typeof value === 'object' &&
    'pitcherId' in value &&
    'name' in value &&
    'team' in value &&
    'opponent' in value &&
    'gameId' in value &&
    'venue' in value &&
    'projections' in value &&
    'environment' in value &&
    'ballparkFactors' in value &&
    'draftKings' in value
  );
}

/**
 * Type guard for WinProbabilityAnalysis
 */
export function isWinProbabilityAnalysis(value: any): value is WinProbabilityAnalysis {
  return (
    value !== null &&
    typeof value === 'object' &&
    'overallWinProbability' in value &&
    'factorWeights' in value &&
    'factors' in value &&
    'confidence' in value
  );
}

/**
 * Type guard for StrikeoutProjection
 */
export function isStrikeoutProjection(value: any): value is StrikeoutProjection {
  return (
    value !== null &&
    typeof value === 'object' &&
    'expectedStrikeouts' in value &&
    'perInningRate' in value &&
    'factors' in value &&
    'ranges' in value &&
    'confidence' in value
  );
}

/**
 * Type guard for InningsProjection
 */
export function isInningsProjection(value: any): value is InningsProjection {
  return (
    value !== null &&
    typeof value === 'object' &&
    'expectedInnings' in value &&
    'leashLength' in value &&
    'workloadConcerns' in value &&
    'gameScriptImpact' in value &&
    'pastWorkload' in value &&
    'confidence' in value
  );
}

/**
 * Type guard for ControlProjection
 */
export function isControlProjection(value: any): value is ControlProjection {
  return (
    value !== null &&
    typeof value === 'object' &&
    'overall' in value
  );
}

/**
 * Type guard for PitcherControlStats
 */
export function isPitcherControlStats(value: any): value is PitcherControlStats {
  return (
    value !== null &&
    typeof value === 'object' &&
    'walks' in value &&
    'hits' in value &&
    'hitBatsmen' in value &&
    'inningsPitched' in value &&
    'gamesStarted' in value &&
    'walksPerNine' in value &&
    'hitsPerNine' in value &&
    'hbpPerNine' in value &&
    'whip' in value &&
    'strikeoutToWalkRatio' in value &&
    'zonePercentage' in value &&
    'firstPitchStrikePercentage' in value &&
    'pitchEfficiency' in value
  );
}

/**
 * Type guard for PitcherControlProfile
 */
export function isPitcherControlProfile(value: any): value is PitcherControlProfile {
  return (
    value !== null &&
    typeof value === 'object' &&
    'gamesStarted' in value &&
    'inningsPitched' in value &&
    'walks' in value &&
    'strikeouts' in value &&
    'hits' in value &&
    'hitBatsmen' in value &&
    'walksPerNine' in value &&
    'hitsPerNine' in value &&
    'hbpPerNine' in value &&
    'whip' in value &&
    'strikeoutToWalkRatio' in value &&
    'controlRating' in value
  );
}

/**
 * Type guard for CareerControlProfile
 */
export function isCareerControlProfile(value: any): value is CareerControlProfile {
  return (
    value !== null &&
    typeof value === 'object' &&
    'careerWalks' in value &&
    'careerHits' in value &&
    'careerHbp' in value &&
    'careerInningsPitched' in value &&
    'careerWhip' in value &&
    'bestSeasonWhip' in value &&
    'recentTrend' in value &&
    'controlPropensity' in value &&
    'age' in value &&
    'yearsExperience' in value &&
    'seasonToSeasonConsistency' in value
  );
}

/**
 * Type guard for ControlMatchupData
 */
export function isControlMatchupData(value: any): value is ControlMatchupData {
  return (
    value !== null &&
    typeof value === 'object' &&
    'plateAppearances' in value &&
    'atBats' in value &&
    'hits' in value &&
    'walks' in value &&
    'hitByPitch' in value &&
    'strikeouts' in value &&
    'hitRate' in value &&
    'walkRate' in value &&
    'hbpRate' in value &&
    'strikeoutRate' in value &&
    'sampleSize' in value &&
    'relativeHitRate' in value &&
    'relativeWalkRate' in value
  );
}

/**
 * Type guard for BatterControlFactors
 */
export function isBatterControlFactors(value: any): value is BatterControlFactors {
  return (
    value !== null &&
    typeof value === 'object' &&
    'eyeRating' in value &&
    'contactRating' in value
  );
}

/**
 * Type guard for ExpectedControlEvents
 */
export function isExpectedControlEvents(value: any): value is ExpectedControlEvents {
  return (
    value !== null &&
    typeof value === 'object' &&
    'expectedHitsAllowed' in value &&
    'expectedWalksAllowed' in value &&
    'expectedHbpAllowed' in value &&
    'confidenceScore' in value &&
    'factors' in value
  );
}

/**
 * Type guard for CareerRunProductionProfile
 */
export function isCareerRunProductionProfile(value: any): value is CareerRunProductionProfile {
  return (
    value !== null &&
    typeof value === 'object' &&
    'careerRuns' in value &&
    'careerRBI' in value &&
    'careerGames' in value &&
    'careerRunsPerGame' in value &&
    'careerRBIPerGame' in value &&
    'bestSeasonRuns' in value &&
    'bestSeasonRBI' in value &&
    'recentTrend' in value &&
    'seasonToSeasonVariance' in value
  );
}

/**
 * Type guard for TeamOffensiveContext
 */
export function isTeamOffensiveContext(value: any): value is TeamOffensiveContext {
  return (
    value !== null &&
    typeof value === 'object' &&
    'runsPerGame' in value &&
    'teamOffensiveRating' in value &&
    'lineupStrength' in value &&
    'runnersOnBaseFrequency' in value
  );
}

/**
 * Type guard for BallparkHitFactor
 */
export function isBallparkHitFactor(value: any): value is BallparkHitFactor {
  return (
    value !== null &&
    typeof value === 'object' &&
    'overall' in value &&
    'types' in value &&
    'dimensions' in value
  );
}

/**
 * Type guard for LineupContext
 */
export function isLineupContext(value: any): value is LineupContext {
  return (
    value !== null &&
    typeof value === 'object' &&
    'position' in value &&
    'isTopOfOrder' in value &&
    'isBottomOfOrder' in value &&
    'runnersOnBaseFrequency' in value &&
    'rbiOpportunities' in value &&
    'runScoringOpportunities' in value
  );
}

/**
 * Type guard for PitcherRunAllowance
 */
export function isPitcherRunAllowance(value: any): value is PitcherRunAllowance {
  return (
    value !== null &&
    typeof value === 'object' &&
    'runsAllowedPerGame' in value &&
    'earnedRunAverage' in value &&
    'runPreventionRating' in value &&
    'qualityStartPercentage' in value &&
    'runScoringVulnerability' in value
  );
}

/**
 * Type guard for ExpectedRuns
 */
export function isExpectedRuns(value: any): value is ExpectedRuns {
  return (
    value !== null &&
    typeof value === 'object' &&
    'expected' in value &&
    'ceiling' in value &&
    'floor' in value &&
    'runFactors' in value &&
    'confidence' in value
  );
}

/**
 * Type guard for ExpectedRBIs
 */
export function isExpectedRBIs(value: any): value is ExpectedRBIs {
  return (
    value !== null &&
    typeof value === 'object' &&
    'expected' in value &&
    'ceiling' in value &&
    'floor' in value &&
    'rbiFactors' in value &&
    'confidence' in value
  );
}

/**
 * Type guard for RunProductionPoints
 */
export function isRunProductionPoints(value: any): value is RunProductionPoints {
  return (
    value !== null &&
    typeof value === 'object' &&
    'runs' in value &&
    'rbis' in value &&
    'total' in value
  );
}

/**
 * Type guard for BatterDFSPoints
 */
export function isBatterDFSPoints(value: any): value is BatterDFSPoints {
  return (
    value !== null &&
    typeof value === 'object' &&
    'singles' in value &&
    'doubles' in value &&
    'triples' in value &&
    'homeRuns' in value &&
    'rbis' in value &&
    'runs' in value &&
    'walks' in value &&
    'hitByPitch' in value &&
    'stolenBases' in value &&
    'total' in value
  );
}

/**
 * Type guard for PitcherDFSPoints
 */
export function isPitcherDFSPoints(value: any): value is PitcherDFSPoints {
  return (
    value !== null &&
    typeof value === 'object' &&
    'inningsPitched' in value &&
    'strikeouts' in value &&
    'win' in value &&
    'earnedRuns' in value &&
    'hitsAllowed' in value &&
    'walksAllowed' in value &&
    'hitBatsmen' in value &&
    'completeGame' in value &&
    'shutout' in value &&
    'noHitter' in value &&
    'total' in value
  );
}

/**
 * Type guard for DFSScoringValues
 */
export function isDFSScoringValues(value: any): value is DFSScoringValues {
  return (
    value !== null &&
    typeof value === 'object' &&
    'hitter' in value &&
    'pitcher' in value
  );
}

/**
 * Type guard for PlayerProjection
 */
export function isPlayerProjection(value: any): value is PlayerProjection {
  return (
    value !== null &&
    typeof value === 'object' &&
    'playerId' in value &&
    'name' in value &&
    'position' in value &&
    'team' in value &&
    'opponent' in value &&
    'salary' in value &&
    'projectedPoints' in value &&
    'upside' in value &&
    'floor' in value &&
    'valueScore' in value &&
    'confidence' in value
  );
}

/**
 * Type guard for DFSLineup
 */
export function isDFSLineup(value: any): value is DFSLineup {
  return (
    value !== null &&
    typeof value === 'object' &&
    'totalSalary' in value &&
    'totalProjectedPoints' in value &&
    'players' in value
  );
}

/**
 * Type guard for TeamStats
 */
export function isTeamStats(value: any): value is TeamStats {
  return (
    value !== null &&
    typeof value === 'object' &&
    'hitting' in value &&
    'pitching' in value
  );
}

/**
 * Type guard for ApiSourceMetadata
 */
export function isApiSourceMetadata(value: any): value is ApiSourceMetadata {
  return (
    value !== null &&
    typeof value === 'object' &&
    'sourceTimestamp' in value
  );
}

/**
 * Type guard for AnalysisMetadata
 */
export function isAnalysisMetadata(value: any): value is AnalysisMetadata {
  return (
    value !== null &&
    typeof value === 'object' &&
    'confidence' in value &&
    'analysisTimestamp' in value &&
    'dataVersion' in value &&
    'factors' in value
  );
}

/**
 * Type guard for DateRange
 */
export function isDateRange(value: any): value is DateRange {
  return (
    value !== null &&
    typeof value === 'object' &&
    'startDate' in value &&
    'endDate' in value
  );
}

/**
 * Type guard for DetailedWeatherInfo
 */
export function isDetailedWeatherInfo(value: any): value is DetailedWeatherInfo {
  return (
    value !== null &&
    typeof value === 'object' &&
    'temperature' in value &&
    'condition' in value &&
    'wind' in value &&
    'isOutdoor' in value &&
    'isPrecipitation' in value
  );
}

/**
 * Type guard for GameFeedResponse
 */
export function isGameFeedResponse(value: any): value is GameFeedResponse {
  return (
    value !== null &&
    typeof value === 'object' &&
    'gamePk' in value &&
    'sourceTimestamp' in value
  );
}

/**
 * Type guard for GameBoxScoreResponse
 */
export function isGameBoxScoreResponse(value: any): value is GameBoxScoreResponse {
  return (
    value !== null &&
    typeof value === 'object' &&
    'officials' in value &&
    'info' in value &&
    'pitchingNotes' in value
  );
}

/**
 * Type guard for MLBScheduleResponse
 */
export function isMLBScheduleResponse(value: any): value is MLBScheduleResponse {
  return (
    value !== null &&
    typeof value === 'object'
  );
}

/**
 * Type guard for PlayerStats
 */
export function isPlayerStats(value: any): value is PlayerStats {
  return (
    value !== null &&
    typeof value === 'object' &&
    'id' in value &&
    'fullName' in value &&
    'currentTeam' in value &&
    'primaryPosition' in value &&
    'batSide' in value &&
    'pitchHand' in value &&
    'sourceTimestamp' in value
  );
}

/**
 * Type guard for PlayerGameStats
 */
export function isPlayerGameStats(value: any): value is PlayerGameStats {
  return (
    value !== null &&
    typeof value === 'object' &&
    'gamePk' in value &&
    'date' in value &&
    'batting' in value &&
    'pitching' in value
  );
}

/**
 * Type guard for TeamStats
 */
export function isTeamStats(value: any): value is TeamStats {
  return (
    value !== null &&
    typeof value === 'object' &&
    'hitting' in value &&
    'pitching' in value
  );
}

/**
 * Type guard for GameEnvironmentData
 */
export function isGameEnvironmentData(value: any): value is GameEnvironmentData {
  return (
    value !== null &&
    typeof value === 'object' &&
    'temperature' in value &&
    'windSpeed' in value &&
    'windDirection' in value &&
    'precipitation' in value &&
    'isOutdoor' in value &&
    'humidityPercent' in value &&
    'pressureMb' in value &&
    'venueId' in value &&
    'venueName' in value &&
    'hasRoof' in value &&
    'roofStatus' in value &&
    'sourceTimestamp' in value
  );
}

/**
 * Type guard for ProbableLineup
 */
export function isProbableLineup(value: any): value is ProbableLineup {
  return (
    value !== null &&
    typeof value === 'object' &&
    'away' in value &&
    'home' in value &&
    'awayBatters' in value &&
    'homeBatters' in value &&
    'confirmed' in value &&
    'confidence' in value &&
    'sourceTimestamp' in value
  );
}

/**
 * Type guard for BallparkFactors
 */
export function isBallparkFactors(value: any): value is BallparkFactors {
  return (
    value !== null &&
    typeof value === 'object' &&
    'overall' in value &&
    'handedness' in value &&
    'types' in value &&
    'venueId' in value &&
    'season' in value &&
    'sourceTimestamp' in value
  );
}

/**
 * Type guard for PitcherBatterMatchup
 */
export function isPitcherBatterMatchup(value: any): value is PitcherBatterMatchup {
  return (
    value !== null &&
    typeof value === 'object' &&
    'pitcher' in value &&
    'batter' in value &&
    'sourceTimestamp' in value
  );
}

/**
 * Type guard for PitcherPitchMixData
 */
export function isPitcherPitchMixData(value: any): value is PitcherPitchMixData {
  return (
    value !== null &&
    typeof value === 'object' &&
    'playerId' in value &&
    'name' in value &&
    'pitches' in value &&
    'controlMetrics' in value &&
    'velocityTrends' in value &&
    'sourceTimestamp' in value
  );
}

/**
 * Type guard for BatterPlateDiscipline
 */
export function isBatterPlateDiscipline(value: any): value is BatterPlateDiscipline {
  return (
    value !== null &&
    typeof value === 'object' &&
    'playerId' in value &&
    'name' in value &&
    'discipline' in value &&
    'pitchTypePerformance' in value &&
    'sourceTimestamp' in value
  );
}

/**
 * Type guard for MLBGame
 */
export function isMLBGame(value: any): value is MLBGame {
  return (
    value !== null &&
    typeof value === 'object' &&
    'gamePk' in value &&
    'gameDate' in value &&
    'venue' in value &&
    'environment' in value
  );
}

/**
 * Type guard for DailyMLBData
 */
export function isDailyMLBData(value: any): value is DailyMLBData {
  return (
    value !== null &&
    typeof value === 'object' &&
    'date' in value &&
    'count' in value &&
    'collectTimestamp' in value &&
    'seasons' in value
  );
}

/**
 * Type guard for DraftKingsCSVEntry
 */
export function isDraftKingsCSVEntry(value: any): value is DraftKingsCSVEntry {
  return (
    value !== null &&
    typeof value === 'object' &&
    'Position' in value &&
    'Name' in value &&
    'Name_and_ID' in value &&
    'ID' in value &&
    'Roster_Position' in value &&
    'Salary' in value &&
    'Game_Info' in value &&
    'TeamAbbrev' in value &&
    'AvgPointsPerGame' in value
  );
}

/**
 * Type guard for DraftKingsPlayer
 */
export function isDraftKingsPlayer(value: any): value is DraftKingsPlayer {
  return (
    value !== null &&
    typeof value === 'object' &&
    'mlbId' in value &&
    'id' in value &&
    'name' in value &&
    'position' in value &&
    'salary' in value &&
    'avgPointsPerGame' in value &&
    'team' in value
  );
}

/**
 * Type guard for DraftKingsMapping
 */
export function isDraftKingsMapping(value: any): value is DraftKingsMapping {
  return (
    value !== null &&
    typeof value === 'object' &&
    'dkName' in value &&
    'mlbId' in value &&
    'mlbName' in value &&
    'team' in value
  );
}

/**
 * Type guard for DraftKingsInfo
 */
export function isDraftKingsInfo(value: any): value is DraftKingsInfo {
  return (
    value !== null &&
    typeof value === 'object' &&
    'draftKingsId' in value &&
    'salary' in value &&
    'positions' in value &&
    'avgPointsPerGame' in value
  );
}

/**
 * Type guard for DraftKingsScoringRules
 */
export function isDraftKingsScoringRules(value: any): value is DraftKingsScoringRules {
  return (
    value !== null &&
    typeof value === 'object' &&
    'hitter' in value &&
    'pitcher' in value
  );
}

/**
 * Type guard for BallparkFactors
 */
export function isBallparkFactors(value: any): value is BallparkFactors {
  return (
    value !== null &&
    typeof value === 'object' &&
    'overall' in value &&
    'handedness' in value &&
    'types' in value &&
    'venueId' in value &&
    'season' in value &&
    'sourceTimestamp' in value
  );
}

/**
 * Type guard for BallparkHitFactor
 */
export function isBallparkHitFactor(value: any): value is BallparkHitFactor {
  return (
    value !== null &&
    typeof value === 'object' &&
    'singles' in value &&
    'doubles' in value &&
    'triples' in value &&
    'homeRuns' in value &&
    'runFactor' in value &&
    'overall' in value &&
    'rbiFactor' in value
  );
}

/**
 * Type guard for BallparkDimensions
 */
export function isBallparkDimensions(value: any): value is BallparkDimensions {
  return (
    value !== null &&
    typeof value === 'object' &&
    'leftField' in value &&
    'leftCenter' in value &&
    'center' in value &&
    'rightCenter' in value &&
    'rightField' in value &&
    'wallHeight' in value
  );
}

/**
 * Type guard for MLBVenue
 */
export function isMLBVenue(value: any): value is MLBVenue {
  return (
    value !== null &&
    typeof value === 'object' &&
    'venueId' in value &&
    'name' in value &&
    'city' in value &&
    'state' in value &&
    'hasRoof' in value &&
    'roofType' in value &&
    'surface' in value &&
    'elevation' in value &&
    'dimensions' in value &&
    'factors' in value
  );
}

/**
 * Type guard for MLBWeatherData
 */
export function isMLBWeatherData(value: any): value is MLBWeatherData {
  return (
    value !== null &&
    typeof value === 'object' &&
    'condition' in value &&
    'temp' in value &&
    'wind' in value &&
    'sourceTimestamp' in value
  );
}

/**
 * Type guard for DetailedWeatherInfo
 */
export function isDetailedWeatherInfo(value: any): value is DetailedWeatherInfo {
  return (
    value !== null &&
    typeof value === 'object' &&
    'temperature' in value &&
    'condition' in value &&
    'wind' in value &&
    'isOutdoor' in value &&
    'isPrecipitation' in value
  );
}

/**
 * Type guard for GameEnvironmentData
 */
export function isGameEnvironmentData(value: any): value is GameEnvironmentData {
  return (
    value !== null &&
    typeof value === 'object' &&
    'temperature' in value &&
    'windSpeed' in value &&
    'windDirection' in value &&
    'precipitation' in value &&
    'isOutdoor' in value &&
    'humidityPercent' in value &&
    'pressureMb' in value &&
    'venueId' in value &&
    'venueName' in value &&
    'hasRoof' in value &&
    'roofStatus' in value &&
    'sourceTimestamp' in value
  );
}

/**
 * Type guard for Environment
 */
export function isEnvironment(value: any): value is Environment {
  return (
    value !== null &&
    typeof value === 'object' &&
    'temperature' in value &&
    'windSpeed' in value &&
    'windDirection' in value &&
    'isOutdoor' in value
  );
}

/**
 * Type guard for WeatherImpactAnalysis
 */
export function isWeatherImpactAnalysis(value: any): value is WeatherImpactAnalysis {
  return (
    value !== null &&
    typeof value === 'object' &&
    'overall' in value &&
    'homeRuns' in value &&
    'distance' in value &&
    'pitchMovement' in value &&
    'factors' in value
  );
}

/**
 * Type guard for WeatherForecast
 */
export function isWeatherForecast(value: any): value is WeatherForecast {
  return (
    value !== null &&
    typeof value === 'object' &&
    'date' in value &&
    'hourly' in value &&
    'daily' in value &&
    'source' in value &&
    'sourceTimestamp' in value
  );
}

/**
 * Type guard for MLBWeatherData
 */
export function isMLBWeatherData(value: any): value is MLBWeatherData {
  return (
    value !== null &&
    typeof value === 'object' &&
    'condition' in value &&
    'temp' in value &&
    'wind' in value &&
    'sourceTimestamp' in value
  );
}

/**
 * Type guard for DetailedWeatherInfo
 */
export function isDetailedWeatherInfo(value: any): value is DetailedWeatherInfo {
  return (
    value !== null &&
    typeof value === 'object' &&
    'temperature' in value &&
    'condition' in value &&
    'wind' in value &&
    'isOutdoor' in value &&
    'isPrecipitation' in value
  );
}

/**
 * Type guard for GameFeedResponse
 */
export function isGameFeedResponse(value: any): value is GameFeedResponse {
  return (
    value !== null &&
    typeof value === 'object' &&
    'gamePk' in value &&
    'sourceTimestamp' in value
  );
}

/**
 * Type guard for GameBoxScoreResponse
 */
export function isGameBoxScoreResponse(value: any): value is GameBoxScoreResponse {
  return (
    value !== null &&
    typeof value === 'object' &&
    'officials' in value &&
    'info' in value &&
    'pitchingNotes' in value
  );
}

/**
 * Type guard for GameSchedule
 */
export function isGameSchedule(value: any): value is GameSchedule {
  return (
    value !== null &&
    typeof value === 'object' &&
    'gamePk' in value &&
    'gameDate' in value &&
    'officialDate' in value
  );
}

/**
 * Type guard for MLBScheduleResponse
 */
export function isMLBScheduleResponse(value: any): value is MLBScheduleResponse {
  return (
    value !== null &&
    typeof value === 'object'
  );
}

/**
 * Type guard for PlayerGameStats
 */
export function isPlayerGameStats(value: any): value is PlayerGameStats {
  return (
    value !== null &&
    typeof value === 'object' &&
    'gamePk' in value &&
    'date' in value &&
    'batting' in value &&
    'pitching' in value
  );
}

/**
 * Type guard for GameEnvironmentData
 */
export function isGameEnvironmentData(value: any): value is GameEnvironmentData {
  return (
    value !== null &&
    typeof value === 'object' &&
    'temperature' in value &&
    'windSpeed' in value &&
    'windDirection' in value &&
    'precipitation' in value &&
    'isOutdoor' in value &&
    'humidityPercent' in value &&
    'pressureMb' in value &&
    'venueId' in value &&
    'venueName' in value &&
    'hasRoof' in value &&
    'roofStatus' in value &&
    'sourceTimestamp' in value
  );
}

/**
 * Type guard for ProbableLineup
 */
export function isProbableLineup(value: any): value is ProbableLineup {
  return (
    value !== null &&
    typeof value === 'object' &&
    'away' in value &&
    'home' in value &&
    'awayBatters' in value &&
    'homeBatters' in value &&
    'confirmed' in value &&
    'confidence' in value &&
    'sourceTimestamp' in value
  );
}

/**
 * Type guard for MLBGame
 */
export function isMLBGame(value: any): value is MLBGame {
  return (
    value !== null &&
    typeof value === 'object' &&
    'gamePk' in value &&
    'gameDate' in value &&
    'venue' in value &&
    'environment' in value &&
    'teamStats' in value
  );
}

/**
 * Type guard for DailyMLBData
 */
export function isDailyMLBData(value: any): value is DailyMLBData {
  return (
    value !== null &&
    typeof value === 'object' &&
    'date' in value &&
    'count' in value &&
    'collectTimestamp' in value &&
    'seasons' in value
  );
}

/**
 * Type guard for TeamStats
 */
export function isTeamStats(value: any): value is TeamStats {
  return (
    value !== null &&
    typeof value === 'object' &&
    'hits' in value &&
    'walks' in value &&
    'hitByPitch' in value &&
    'plateAppearances' in value &&
    'runsPerGame' in value &&
    'rbisPerGame' in value &&
    'sluggingPct' in value &&
    'onBasePct' in value &&
    'battingAvg' in value &&
    'ops' in value &&
    'woba' in value &&
    'wrc' in value &&
    'sourceTimestamp' in value
  );
}

/**
 * Type guard for PlayerSBSeasonStats
 */
export function isPlayerSBSeasonStats(value: any): value is PlayerSBSeasonStats {
  return (
    value !== null &&
    typeof value === 'object' &&
    'battingAverage' in value &&
    'stolenBases' in value &&
    'stolenBaseAttempts' in value &&
    'caughtStealing' in value &&
    'gamesPlayed' in value &&
    'stolenBaseRate' in value &&
    'stolenBaseSuccess' in value &&
    'sprintSpeed' in value
  );
}

/**
 * Type guard for PlayerSBCareerProfile
 */
export function isPlayerSBCareerProfile(value: any): value is PlayerSBCareerProfile {
  return (
    value !== null &&
    typeof value === 'object' &&
    'careerStolenBases' in value &&
    'careerGames' in value &&
    'careerRate' in value &&
    'bestSeasonSB' in value &&
    'bestSeasonRate' in value &&
    'recentTrend' in value
  );
}

/**
 * Type guard for StolenBaseProjection
 */
export function isStolenBaseProjection(value: any): value is StolenBaseProjection {
  return (
    value !== null &&
    typeof value === 'object' &&
    'expectedAttempts' in value &&
    'successProbability' in value &&
    'projectedSB' in value &&
    'factors' in value
  );
}

/**
 * Type guard for StolenBaseContext
 */
export function isStolenBaseContext(value: any): value is StolenBaseContext {
  return (
    value !== null &&
    typeof value === 'object' &&
    'isHome' in value &&
    'scoreMargin' in value &&
    'inning' in value &&
    'isCloseGame' in value
  );
}

/**
 * Type guard for BatterSeasonStats
 */
export function isBatterSeasonStats(value: any): value is BatterSeasonStats {
  return (
    value !== null &&
    typeof value === 'object' &&
    'gamesPlayed' in value &&
    'atBats' in value &&
    'hits' in value &&
    'homeRuns' in value &&
    'rbi' in value &&
    'stolenBases' in value &&
    'avg' in value &&
    'obp' in value &&
    'slg' in value &&
    'ops' in value &&
    'runs' in value &&
    'walks' in value &&
    'strikeouts' in value &&
    'caughtStealing' in value &&
    'doubles' in value &&
    'triples' in value &&
    'hitByPitches' in value &&
    'sacrificeFlies' in value &&
    'plateAppearances' in value &&
    'wOBAvsL' in value &&
    'wOBAvsR' in value &&
    'last30wOBA' in value &&
    'babip' in value &&
    'iso' in value &&
    'hrRate' in value &&
    'kRate' in value &&
    'bbRate' in value &&
    'sbRate' in value &&
    'wOBA' in value &&
    'rbis' in value
  );
}

/**
 * Type guard for MLBBatter
 */
export function isMLBBatter(value: any): value is MLBBatter {
  return (
    value !== null &&
    typeof value === 'object' &&
    'batterId' in value &&
    'name' in value &&
    'team' in value &&
    'teamId' in value &&
    'position' in value &&
    'handedness' in value &&
    'stats' in value
  );
}

/**
 * Type guard for BatterPlateDiscipline
 */
export function isBatterPlateDiscipline(value: any): value is BatterPlateDiscipline {
  return (
    value !== null &&
    typeof value === 'object' &&
    'playerId' in value &&
    'name' in value &&
    'pitchTypePerformance' in value &&
    'walkRate' in value &&
    'hbpRate' in value &&
    'plateAppearances' in value &&
    'sourceTimestamp' in value
  );
}

/**
 * Type guard for BatterSplits
 */
export function isBatterSplits(value: any): value is BatterSplits {
  return (
    value !== null &&
    typeof value === 'object' &&
    'vsLeft' in value &&
    'vsRight' in value
  );
}

/**
 * Type guard for BatterStats
 */
export function isBatterStats(value: any): value is BatterStats {
  return (
    value !== null &&
    typeof value === 'object' &&
    'id' in value &&
    'fullName' in value &&
    'currentTeam' in value &&
    'primaryPosition' in value &&
    'batSide' in value &&
    'seasonStats' in value &&
    'careerStats' in value &&
    'lastGameStats' in value &&
    'lastFiveGames' in value &&
    'sourceTimestamp' in value
  );
}

/**
 * Type guard for BatterStatsResponse
 */
export function isBatterStatsResponse(value: any): value is BatterStatsResponse {
  return (
    value !== null &&
    typeof value === 'object' &&
    'fullName' in value &&
    'currentTeam' in value &&
    'primaryPosition' in value &&
    'batSide' in value &&
    'seasonStats' in value &&
    'careerStats' in value &&
    'lastGameStats' in value &&
    'lastFiveGames' in value
  );
}

/**
 * Type guard for BasePlayer
 */
export function isBasePlayer(value: any): value is BasePlayer {
  return (
    value !== null &&
    typeof value === 'object' &&
    'playerId' in value &&
    'name' in value &&
    'team' in value &&
    'teamId' in value &&
    'position' in value &&
    'handedness' in value
  );
}

/**
 * Type guard for BaseStats
 */
export function isBaseStats(value: any): value is BaseStats {
  return (
    value !== null &&
    typeof value === 'object' &&
    'gamesPlayed' in value &&
    'sourceSeason' in value &&
    'sourceType' in value
  );
}

/**
 * Type guard for DraftKingsPlayer
 */
export function isDraftKingsPlayer(value: any): value is DraftKingsPlayer {
  return (
    value !== null &&
    typeof value === 'object' &&
    'mlbId' in value &&
    'id' in value &&
    'name' in value &&
    'position' in value &&
    'salary' in value &&
    'avgPointsPerGame' in value &&
    'team' in value
  );
}

/**
 * Type guard for DraftKingsInfo
 */
export function isDraftKingsInfo(value: any): value is DraftKingsInfo {
  return (
    value !== null &&
    typeof value === 'object' &&
    'draftKingsId' in value &&
    'salary' in value &&
    'positions' in value &&
    'avgPointsPerGame' in value
  );
}

/**
 * Type guard for PlayerSearchResult
 */
export function isPlayerSearchResult(value: any): value is PlayerSearchResult {
  return (
    value !== null &&
    typeof value === 'object' &&
    'id' in value &&
    'fullName' in value &&
    'team' in value &&
    'position' in value &&
    'handedness' in value &&
    'lastSeason' in value &&
    'active' in value
  );
}

/**
 * Type guard for CatcherDefenseMetrics
 */
export function isCatcherDefenseMetrics(value: any): value is CatcherDefenseMetrics {
  return (
    value !== null &&
    typeof value === 'object' &&
    'playerId' in value &&
    'fullName' in value &&
    'caughtStealingPercentage' in value &&
    'stolenBasesAllowed' in value &&
    'caughtStealing' in value &&
    'attemptsPer9' in value &&
    'popTime' in value &&
    'armStrength' in value &&
    'defensiveRating' in value &&
    'teamRank' in value &&
    'runs_saved_vs_running' in value &&
    'sourceTimestamp' in value
  );
}

/**
 * Type guard for BatteryVulnerability
 */
export function isBatteryVulnerability(value: any): value is BatteryVulnerability {
  return (
    value !== null &&
    typeof value === 'object' &&
    'vulnerability' in value &&
    'catcherFactor' in value &&
    'pitcherFactor' in value &&
    'catcherMetrics' in value
  );
}

/**
 * Type guard for PlayerSBSeasonStats
 */
export function isPlayerSBSeasonStats(value: any): value is PlayerSBSeasonStats {
  return (
    value !== null &&
    typeof value === 'object' &&
    'playerId' in value &&
    'season' in value &&
    'stolenBases' in value &&
    'caughtStealing' in value &&
    'stolenBaseAttempts' in value &&
    'stolenBaseSuccess' in value &&
    'stolenBasePercentage' in value &&
    'gamesStolenBase' in value &&
    'attemptsPerGame' in value &&
    'successPerGame' in value &&
    'greenLightScore' in value &&
    'opportunityRate' in value &&
    'sprintSpeed' in value
  );
}

/**
 * Type guard for PlayerPitchOutcomes
 */
export function isPlayerPitchOutcomes(value: any): value is PlayerPitchOutcomes {
  return (
    value !== null &&
    typeof value === 'object' &&
    'strikeouts' in value &&
    'walks' in value &&
    'hits' in value &&
    'homeRuns' in value &&
    'total' in value
  );
}

/**
 * Type guard for PlayerVsPitchType
 */
export function isPlayerVsPitchType(value: any): value is PlayerVsPitchType {
  return (
    value !== null &&
    typeof value === 'object' &&
    'fastball' in value &&
    'slider' in value &&
    'curveball' in value &&
    'changeup' in value &&
    'sinker' in value &&
    'cutter' in value &&
    'splitter' in value
  );
}

/**
 * Type guard for MLBPitcher
 */
export function isMLBPitcher(value: any): value is MLBPitcher {
  return (
    value !== null &&
    typeof value === 'object' &&
    'pitcherId' in value &&
    'name' in value &&
    'team' in value &&
    'teamId' in value &&
    'position' in value &&
    'handedness' in value &&
    'stats' in value
  );
}

/**
 * Type guard for PitcherGameLog
 */
export function isPitcherGameLog(value: any): value is PitcherGameLog {
  return (
    value !== null &&
    typeof value === 'object' &&
    'date' in value &&
    'opponent' in value &&
    'inningsPitched' in value &&
    'hits' in value &&
    'runs' in value &&
    'earnedRuns' in value &&
    'walks' in value &&
    'strikeouts' in value &&
    'homeRuns' in value &&
    'era' in value &&
    'result' in value
  );
}

/**
 * Type guard for PitcherStatsResponse
 */
export function isPitcherStatsResponse(value: any): value is PitcherStatsResponse {
  return (
    value !== null &&
    typeof value === 'object' &&
    'fullName' in value &&
    'currentTeam' in value &&
    'primaryPosition' in value &&
    'throwsHand' in value &&
    'seasonStats' in value &&
    'careerStats' in value
  );
}

/**
 * Type guard for PitcherPitchTypes
 */
export function isPitcherPitchTypes(value: any): value is PitcherPitchTypes {
  return (
    value !== null &&
    typeof value === 'object' &&
    'fourSeam' in value &&
    'twoSeam' in value &&
    'cutter' in value &&
    'slider' in value &&
    'curveball' in value &&
    'changeup' in value &&
    'splitter' in value &&
    'sinker' in value &&
    'other' in value
  );
}

/**
 * Type guard for MatchupStats
 */
export function isMatchupStats(value: any): value is MatchupStats {
  return (
    value !== null &&
    typeof value === 'object' &&
    'atBats' in value &&
    'hits' in value &&
    'homeRuns' in value &&
    'strikeouts' in value &&
    'walks' in value &&
    'avg' in value &&
    'obp' in value &&
    'slg' in value &&
    'ops' in value &&
    'totalPitches' in value &&
    'timing' in value
  );
}

/**
 * Type guard for PitcherBatterMatchup
 */
export function isPitcherBatterMatchup(value: any): value is PitcherBatterMatchup {
  return (
    value !== null &&
    typeof value === 'object' &&
    'pitcher' in value &&
    'batter' in value &&
    'stats' in value &&
    'sourceTimestamp' in value
  );
}

/**
 * Type guard for MatchupAnalysis
 */
export function isMatchupAnalysis(value: any): value is MatchupAnalysis {
  return (
    value !== null &&
    typeof value === 'object' &&
    'projections' in value &&
    'factors' in value
  );
}

/**
 * Type guard for PitcherHoldMetrics
 */
export function isPitcherHoldMetrics(value: any): value is PitcherHoldMetrics {
  return (
    value !== null &&
    typeof value === 'object' &&
    'pickoffMoves' in value &&
    'slideStepTime' in value &&
    'timeToPlate' in value &&
    'stolenBaseAllowedRate' in value &&
    'holdRating' in value
  );
}

/**
 * Type guard for PitcherSeasonStats
 */
export function isPitcherSeasonStats(value: any): value is PitcherSeasonStats {
  return (
    value !== null &&
    typeof value === 'object' &&
    'gamesPlayed' in value &&
    'gamesStarted' in value &&
    'inningsPitched' in value &&
    'wins' in value &&
    'losses' in value &&
    'era' in value &&
    'whip' in value &&
    'strikeouts' in value &&
    'walks' in value &&
    'saves' in value &&
    'homeRunsAllowed' in value &&
    'hitBatsmen' in value &&
    'hits' in value
  );
}

/**
 * Type guard for PitcherCareerStatsSeason
 */
export function isPitcherCareerStatsSeason(value: any): value is PitcherCareerStatsSeason {
  return (
    value !== null &&
    typeof value === 'object' &&
    'season' in value &&
    'team' in value
  );
}

/**
 * Type guard for PitcherStats
 */
export function isPitcherStats(value: any): value is PitcherStats {
  return (
    value !== null &&
    typeof value === 'object' &&
    'id' in value &&
    'fullName' in value &&
    'currentTeam' in value &&
    'primaryPosition' in value &&
    'pitchHand' in value &&
    'seasonStats' in value &&
    'careerStats' in value &&
    'sourceTimestamp' in value
  );
}

/**
 * Type guard for PitcherPitchMixData
 */
export function isPitcherPitchMixData(value: any): value is PitcherPitchMixData {
  return (
    value !== null &&
    typeof value === 'object' &&
    'playerId' in value &&
    'name' in value &&
    'pitches' in value &&
    'controlMetrics' in value &&
    'velocityTrends' in value &&
    'sourceTimestamp' in value
  );
}

/**
 * Type guard for PitcherHomeRunVulnerability
 */
export function isPitcherHomeRunVulnerability(value: any): value is PitcherHomeRunVulnerability {
  return (
    value !== null &&
    typeof value === 'object' &&
    'gamesStarted' in value &&
    'inningsPitched' in value &&
    'homeRunsAllowed' in value &&
    'hrPer9' in value &&
    'flyBallPct' in value &&
    'hrPerFlyBall' in value &&
    'homeRunVulnerability' in value
  );
}

/**
 * Type guard for PitcherProjections
 */
export function isPitcherProjections(value: any): value is PitcherProjections {
  return (
    value !== null &&
    typeof value === 'object' &&
    'expectedInnings' in value &&
    'expectedStrikeouts' in value &&
    'winProbability' in value &&
    'qualityStartProbability' in value &&
    'projectedDFSPoints' in value
  );
}

/**
 * Type guard for ExpectedStats
 */
export function isExpectedStats(value: any): value is ExpectedStats {
  return (
    value !== null &&
    typeof value === 'object' &&
    'player_id' in value &&
    'xba' in value &&
    'xslg' in value &&
    'xwoba' in value &&
    'xobp' in value &&
    'xiso' in value &&
    'exit_velocity_avg' in value &&
    'launch_angle_avg' in value &&
    'barrel_batted_rate' in value &&
    'sweet_spot_percent' in value &&
    'hard_hit_percent' in value
  );
}

/**
 * Type guard for StatcastMetrics
 */
export function isStatcastMetrics(value: any): value is StatcastMetrics {
  return (
    value !== null &&
    typeof value === 'object' &&
    '"last_name, first_name"' in value &&
    'player_id' in value &&
    'attempts' in value &&
    'avg_hit_angle' in value &&
    'anglesweetspotpercent' in value &&
    'max_hit_speed' in value &&
    'avg_hit_speed' in value &&
    'fbld' in value &&
    'gb' in value &&
    'max_distance' in value &&
    'avg_distance' in value &&
    'avg_hr_distance' in value &&
    'ev95plus' in value &&
    'ev95percent' in value &&
    'barrels' in value &&
    'brl_pa' in value &&
    'expected_stats' in value
  );
}

/**
 * Type guard for PitchTypeData
 */
export function isPitchTypeData(value: any): value is PitchTypeData {
  return (
    value !== null &&
    typeof value === 'object' &&
    'pitch_type' in value &&
    'count' in value &&
    'percentage' in value &&
    'velocity' in value &&
    'spin_rate' in value &&
    'vertical_movement' in value &&
    'horizontal_movement' in value &&
    'whiff_rate' in value &&
    'put_away_rate' in value &&
    'release_extension' in value &&
    'release_height' in value &&
    'zone_rate' in value &&
    'chase_rate' in value &&
    'zone_contact_rate' in value &&
    'chase_contact_rate' in value &&
    'batting_avg_against' in value &&
    'expected_woba' in value
  );
}

/**
 * Type guard for PitchUsage
 */
export function isPitchUsage(value: any): value is PitchUsage {
  return (
    value !== null &&
    typeof value === 'object' &&
    'fastball' in value &&
    'slider' in value &&
    'curve' in value &&
    'changeup' in value &&
    'sinker' in value &&
    'cutter' in value &&
    'splitter' in value &&
    'sweep' in value &&
    'fork' in value &&
    'knuckle' in value &&
    'other' in value
  );
}

/**
 * Type guard for PitcherVelocityTrend
 */
export function isPitcherVelocityTrend(value: any): value is PitcherVelocityTrend {
  return (
    value !== null &&
    typeof value === 'object' &&
    'player_id' in value &&
    'game_date' in value &&
    'pitch_type' in value &&
    'avg_velocity' in value &&
    'max_velocity' in value &&
    'min_velocity' in value &&
    'velocity_range' in value &&
    'velocity_stddev' in value &&
    'previous_avg_velocity' in value &&
    'velocity_change' in value
  );
}

/**
 * Type guard for PitcherStatcastData
 */
export function isPitcherStatcastData(value: any): value is PitcherStatcastData {
  return (
    value !== null &&
    typeof value === 'object' &&
    'player_id' in value &&
    'name' in value &&
    'team' in value &&
    'team_id' in value &&
    'handedness' in value &&
    'pitch_mix' in value &&
    'pitches' in value &&
    'velocity_trends' in value &&
    'movement_metrics' in value &&
    'result_metrics' in value &&
    'command_metrics' in value &&
    'season_stats' in value
  );
}

/**
 * Type guard for BatterStatcastData
 */
export function isBatterStatcastData(value: any): value is BatterStatcastData {
  return (
    value !== null &&
    typeof value === 'object' &&
    'player_id' in value &&
    'name' in value &&
    'team' in value &&
    'team_id' in value &&
    'handedness' in value &&
    'batting_metrics' in value &&
    'platoon_splits' in value &&
    'pitch_type_performance' in value &&
    'recent_performance' in value &&
    'season_stats' in value
  );
}

/**
 * Type guard for TeamStatcastData
 */
export function isTeamStatcastData(value: any): value is TeamStatcastData {
  return (
    value !== null &&
    typeof value === 'object' &&
    'team_id' in value &&
    'team_name' in value &&
    'team_abbrev' in value &&
    'team_record' in value &&
    'batting_stats' in value &&
    'pitching_stats' in value &&
    'roster' in value
  );
}

/**
 * Type guard for LeaderboardResponse
 */
export function isLeaderboardResponse(value: any): value is LeaderboardResponse {
  return (
    value !== null &&
    typeof value === 'object' &&
    'leaderboard' in value &&
    'metric' in value &&
    'season' in value &&
    'player_type' in value
  );
}

/**
 * Type guard for CombinedPlayerData
 */
export function isCombinedPlayerData(value: any): value is CombinedPlayerData {
  return (
    value !== null &&
    typeof value === 'object' &&
    'expected_stats' in value
  );
}

/**
 * Type guard for StatcastPitch
 */
export function isStatcastPitch(value: any): value is StatcastPitch {
  return (
    value !== null &&
    typeof value === 'object' &&
    'pitch_type' in value &&
    'count' in value &&
    'velocity' in value &&
    'whiff_rate' in value &&
    'put_away_rate' in value
  );
}

/**
 * Type guard for StatcastControlMetrics
 */
export function isStatcastControlMetrics(value: any): value is StatcastControlMetrics {
  return (
    value !== null &&
    typeof value === 'object' &&
    'zone_rate' in value &&
    'first_pitch_strike' in value &&
    'whiff_rate' in value &&
    'chase_rate' in value
  );
}

/**
 * Type guard for StatcastVelocityTrend
 */
export function isStatcastVelocityTrend(value: any): value is StatcastVelocityTrend {
  return (
    value !== null &&
    typeof value === 'object' &&
    'game_date' in value &&
    'pitch_type' in value &&
    'avg_velocity' in value &&
    'velocity_change' in value
  );
}

/**
 * Type guard for StatcastData
 */
export function isStatcastData(value: any): value is StatcastData {
  return (
    value !== null &&
    typeof value === 'object' &&
    'pitch_mix' in value &&
    'control_metrics' in value &&
    'velocity_trends' in value &&
    'is_default_data' in value
  );
}

/**
 * Type guard for PitchEffectiveness
 */
export function isPitchEffectiveness(value: any): value is PitchEffectiveness {
  return (
    value !== null &&
    typeof value === 'object' &&
    'fastballEff' in value &&
    'sliderEff' in value &&
    'curveEff' in value &&
    'changeupEff' in value &&
    'sinkerEff' in value &&
    'cutterEff' in value
  );
}

/**
 * Type guard for StatcastPitcherData
 */
export function isStatcastPitcherData(value: any): value is StatcastPitcherData {
  return (
    value !== null &&
    typeof value === 'object' &&
    'player_id' in value &&
    'name' in value &&
    'pitch_effectiveness' in value
  );
}

/**
 * Type guard for ExpectedStats
 */
export function isExpectedStats(value: any): value is ExpectedStats {
  return (
    value !== null &&
    typeof value === 'object' &&
    'player_id' in value &&
    'xba' in value &&
    'xslg' in value &&
    'xwoba' in value &&
    'xobp' in value &&
    'xiso' in value &&
    'exit_velocity_avg' in value &&
    'launch_angle_avg' in value &&
    'barrel_batted_rate' in value &&
    'sweet_spot_percent' in value &&
    'hard_hit_percent' in value
  );
}

/**
 * Type guard for StatcastMetrics
 */
export function isStatcastMetrics(value: any): value is StatcastMetrics {
  return (
    value !== null &&
    typeof value === 'object' &&
    '"last_name, first_name"' in value &&
    'player_id' in value &&
    'attempts' in value &&
    'avg_hit_angle' in value &&
    'anglesweetspotpercent' in value &&
    'max_hit_speed' in value &&
    'avg_hit_speed' in value &&
    'fbld' in value &&
    'gb' in value &&
    'max_distance' in value &&
    'avg_distance' in value &&
    'avg_hr_distance' in value &&
    'ev95plus' in value &&
    'ev95percent' in value &&
    'barrels' in value &&
    'brl_pa' in value &&
    'expected_stats' in value
  );
}

/**
 * Type guard for PitchTypeData
 */
export function isPitchTypeData(value: any): value is PitchTypeData {
  return (
    value !== null &&
    typeof value === 'object' &&
    'pitch_type' in value &&
    'count' in value &&
    'percentage' in value &&
    'velocity' in value &&
    'spin_rate' in value &&
    'vertical_movement' in value &&
    'horizontal_movement' in value &&
    'whiff_rate' in value &&
    'put_away_rate' in value &&
    'release_extension' in value &&
    'release_height' in value &&
    'zone_rate' in value &&
    'chase_rate' in value &&
    'zone_contact_rate' in value &&
    'chase_contact_rate' in value &&
    'batting_avg_against' in value &&
    'expected_woba' in value
  );
}

/**
 * Type guard for PitchUsage
 */
export function isPitchUsage(value: any): value is PitchUsage {
  return (
    value !== null &&
    typeof value === 'object' &&
    'fastball' in value &&
    'slider' in value &&
    'curve' in value &&
    'changeup' in value &&
    'sinker' in value &&
    'cutter' in value &&
    'splitter' in value &&
    'sweep' in value &&
    'fork' in value &&
    'knuckle' in value &&
    'other' in value
  );
}

/**
 * Type guard for PitcherVelocityTrend
 */
export function isPitcherVelocityTrend(value: any): value is PitcherVelocityTrend {
  return (
    value !== null &&
    typeof value === 'object' &&
    'player_id' in value &&
    'game_date' in value &&
    'pitch_type' in value &&
    'avg_velocity' in value &&
    'max_velocity' in value &&
    'min_velocity' in value &&
    'velocity_range' in value &&
    'velocity_stddev' in value &&
    'previous_avg_velocity' in value &&
    'velocity_change' in value
  );
}

/**
 * Type guard for PitcherStatcastData
 */
export function isPitcherStatcastData(value: any): value is PitcherStatcastData {
  return (
    value !== null &&
    typeof value === 'object' &&
    'player_id' in value &&
    'name' in value &&
    'team' in value &&
    'team_id' in value &&
    'handedness' in value &&
    'pitch_mix' in value &&
    'pitches' in value &&
    'velocity_trends' in value &&
    'movement_metrics' in value &&
    'result_metrics' in value &&
    'command_metrics' in value &&
    'season_stats' in value
  );
}

/**
 * Type guard for BatterStatcastData
 */
export function isBatterStatcastData(value: any): value is BatterStatcastData {
  return (
    value !== null &&
    typeof value === 'object' &&
    'player_id' in value &&
    'name' in value &&
    'team' in value &&
    'team_id' in value &&
    'handedness' in value &&
    'batting_metrics' in value &&
    'platoon_splits' in value &&
    'pitch_type_performance' in value &&
    'recent_performance' in value &&
    'season_stats' in value
  );
}

/**
 * Type guard for TeamStatcastData
 */
export function isTeamStatcastData(value: any): value is TeamStatcastData {
  return (
    value !== null &&
    typeof value === 'object' &&
    'team_id' in value &&
    'team_name' in value &&
    'team_abbrev' in value &&
    'team_record' in value &&
    'batting_stats' in value &&
    'pitching_stats' in value &&
    'roster' in value
  );
}

/**
 * Type guard for LeaderboardResponse
 */
export function isLeaderboardResponse(value: any): value is LeaderboardResponse {
  return (
    value !== null &&
    typeof value === 'object' &&
    'leaderboard' in value &&
    'metric' in value &&
    'season' in value &&
    'player_type' in value
  );
}

/**
 * Type guard for CombinedPlayerData
 */
export function isCombinedPlayerData(value: any): value is CombinedPlayerData {
  return (
    value !== null &&
    typeof value === 'object' &&
    'expected_stats' in value
  );
}


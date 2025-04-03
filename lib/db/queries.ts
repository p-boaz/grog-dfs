import { desc, and, eq, isNull } from 'drizzle-orm';
import { db } from './drizzle';
import { 
  activityLogs, 
  teamMembers, 
  teams, 
  users,
  mlbPlayers,
  mlbBatterStats,
  mlbPitcherStats,
  mlbGames,
  mlbBatterProjections,
  mlbPitcherProjections,
  NewMLBPlayer,
  NewBatterStats,
  NewPitcherStats,
  NewMLBGame,
  NewBatterProjection,
  NewPitcherProjection,
  MLBGameStatus
} from './schema';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth/session';
import { Domain } from '../mlb/types';

export async function getUser() {
  const sessionCookie = (await cookies()).get('session');
  if (!sessionCookie || !sessionCookie.value) {
    return null;
  }

  const sessionData = await verifyToken(sessionCookie.value);
  if (
    !sessionData ||
    !sessionData.user ||
    typeof sessionData.user.id !== 'number'
  ) {
    return null;
  }

  if (new Date(sessionData.expires) < new Date()) {
    return null;
  }

  const user = await db
    .select()
    .from(users)
    .where(and(eq(users.id, sessionData.user.id), isNull(users.deletedAt)))
    .limit(1);

  if (user.length === 0) {
    return null;
  }

  return user[0];
}

export async function getTeamByStripeCustomerId(customerId: string) {
  const result = await db
    .select()
    .from(teams)
    .where(eq(teams.stripeCustomerId, customerId))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function updateTeamSubscription(
  teamId: number,
  subscriptionData: {
    stripeSubscriptionId: string | null;
    stripeProductId: string | null;
    planName: string | null;
    subscriptionStatus: string;
  }
) {
  await db
    .update(teams)
    .set({
      ...subscriptionData,
      updatedAt: new Date(),
    } as any)
    .where(eq(teams.id, teamId));
}

export async function getUserWithTeam(userId: number) {
  const result = await db
    .select({
      user: users,
      teamId: teamMembers.teamId,
    })
    .from(users)
    .leftJoin(teamMembers, eq(users.id, teamMembers.userId))
    .where(eq(users.id, userId))
    .limit(1);

  return result[0];
}

export async function getActivityLogs() {
  const user = await getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  return await db
    .select({
      id: activityLogs.id,
      action: activityLogs.action,
      timestamp: activityLogs.timestamp,
      ipAddress: activityLogs.ipAddress,
      userName: users.name,
    })
    .from(activityLogs)
    .leftJoin(users, eq(activityLogs.userId, users.id))
    .where(eq(activityLogs.userId, user.id))
    .orderBy(desc(activityLogs.timestamp))
    .limit(10);
}

export async function getTeamForUser(userId: number) {
  const result = await db.query.users.findFirst({
    where: eq(users.id, userId),
    with: {
      teamMembers: {
        with: {
          team: {
            with: {
              teamMembers: {
                with: {
                  user: {
                    columns: {
                      id: true,
                      name: true,
                      email: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  return result?.teamMembers[0]?.team || null;
}

// MLB Data Access Functions

/**
 * Insert a player into the MLB players table
 */
export async function insertPlayer(player: Domain.Batter | Domain.Pitcher): Promise<void> {
  const isPitcher = 'throwsHand' in player;

  const newPlayer: NewMLBPlayer = {
    id: player.id,
    fullName: player.fullName,
    team: player.team,
    teamId: player.teamId,
    position: player.position,
    isPitcher,
    handedness: isPitcher ? undefined : player.handedness,
    throwsHand: isPitcher ? (player as Domain.Pitcher).throwsHand : undefined,
  };

  await db.insert(mlbPlayers).values(newPlayer)
    .onConflictDoUpdate({
      target: mlbPlayers.id,
      set: {
        fullName: newPlayer.fullName,
        team: newPlayer.team,
        teamId: newPlayer.teamId,
        position: newPlayer.position,
        handedness: newPlayer.handedness,
        throwsHand: newPlayer.throwsHand,
        lastUpdated: new Date(),
      },
    });
}

/**
 * Insert batter stats into the MLB batter stats table
 */
export async function insertBatterStats(
  playerId: number, 
  season: string, 
  stats: Domain.BatterStats, 
  isCareer = false
): Promise<void> {
  const newStats: NewBatterStats = {
    playerId,
    season,
    isCareer,
    gamesPlayed: stats.gamesPlayed,
    atBats: stats.atBats,
    hits: stats.hits,
    homeRuns: stats.homeRuns,
    rbi: stats.rbi,
    stolenBases: stats.stolenBases,
    avg: stats.avg,
    obp: stats.obp,
    slg: stats.slg,
    ops: stats.ops,
    runs: stats.runs,
    walks: stats.walks,
    strikeouts: stats.strikeouts,
    caughtStealing: stats.caughtStealing,
    doubles: stats.doubles,
    triples: stats.triples,
    hitByPitches: stats.hitByPitches,
    sacrificeFlies: stats.sacrificeFlies,
    plateAppearances: stats.plateAppearances,
    babip: stats.babip,
    iso: stats.iso,
    hrRate: stats.hrRate,
    kRate: stats.kRate,
    bbRate: stats.bbRate,
    sbRate: stats.sbRate,
  };

  await db.insert(mlbBatterStats).values(newStats)
    .onConflictDoUpdate({
      target: [mlbBatterStats.playerId, mlbBatterStats.season, mlbBatterStats.isCareer],
      set: {
        gamesPlayed: newStats.gamesPlayed,
        atBats: newStats.atBats,
        hits: newStats.hits,
        homeRuns: newStats.homeRuns,
        rbi: newStats.rbi,
        stolenBases: newStats.stolenBases,
        avg: newStats.avg,
        obp: newStats.obp,
        slg: newStats.slg,
        ops: newStats.ops,
        runs: newStats.runs,
        walks: newStats.walks,
        strikeouts: newStats.strikeouts,
        caughtStealing: newStats.caughtStealing,
        doubles: newStats.doubles,
        triples: newStats.triples,
        hitByPitches: newStats.hitByPitches,
        sacrificeFlies: newStats.sacrificeFlies,
        plateAppearances: newStats.plateAppearances,
        babip: newStats.babip,
        iso: newStats.iso,
        hrRate: newStats.hrRate,
        kRate: newStats.kRate,
        bbRate: newStats.bbRate,
        sbRate: newStats.sbRate,
        lastUpdated: new Date(),
      },
    });
}

/**
 * Insert pitcher stats into the MLB pitcher stats table
 */
export async function insertPitcherStats(
  playerId: number, 
  season: string, 
  stats: Domain.PitcherStats, 
  isCareer = false
): Promise<void> {
  const newStats: NewPitcherStats = {
    playerId,
    season,
    isCareer,
    gamesPlayed: stats.gamesPlayed,
    gamesStarted: stats.gamesStarted,
    inningsPitched: stats.inningsPitched,
    wins: stats.wins,
    losses: stats.losses,
    era: stats.era,
    whip: stats.whip,
    strikeouts: stats.strikeouts,
    walks: stats.walks,
    saves: stats.saves,
    homeRunsAllowed: stats.homeRunsAllowed,
    hitBatsmen: stats.hitBatsmen,
    qualityStarts: stats.qualityStarts,
    blownSaves: stats.blownSaves,
    holds: stats.holds,
    battersFaced: stats.battersFaced,
    hitsAllowed: stats.hitsAllowed,
    earnedRuns: stats.earnedRuns,
    completeGames: stats.completeGames,
    shutouts: stats.shutouts,
    kRate: stats.kRate,
    bbRate: stats.bbRate,
    k9: stats.k9,
    bb9: stats.bb9,
    hr9: stats.hr9,
  };

  await db.insert(mlbPitcherStats).values(newStats)
    .onConflictDoUpdate({
      target: [mlbPitcherStats.playerId, mlbPitcherStats.season, mlbPitcherStats.isCareer],
      set: {
        gamesPlayed: newStats.gamesPlayed,
        gamesStarted: newStats.gamesStarted,
        inningsPitched: newStats.inningsPitched,
        wins: newStats.wins,
        losses: newStats.losses,
        era: newStats.era,
        whip: newStats.whip,
        strikeouts: newStats.strikeouts,
        walks: newStats.walks,
        saves: newStats.saves,
        homeRunsAllowed: newStats.homeRunsAllowed,
        hitBatsmen: newStats.hitBatsmen,
        qualityStarts: newStats.qualityStarts,
        blownSaves: newStats.blownSaves,
        holds: newStats.holds,
        battersFaced: newStats.battersFaced,
        hitsAllowed: newStats.hitsAllowed,
        earnedRuns: newStats.earnedRuns,
        completeGames: newStats.completeGames,
        shutouts: newStats.shutouts,
        kRate: newStats.kRate,
        bbRate: newStats.bbRate,
        k9: newStats.k9,
        bb9: newStats.bb9,
        hr9: newStats.hr9,
        lastUpdated: new Date(),
      },
    });
}

/**
 * Insert game data into the MLB games table
 */
export async function insertGame(game: Domain.Game): Promise<void> {
  // Convert abstract game state to our enum
  let status = MLBGameStatus.SCHEDULED;
  if (game.status?.abstractGameState === 'Preview') {
    status = MLBGameStatus.PREGAME;
  } else if (game.status?.abstractGameState === 'Live') {
    status = MLBGameStatus.LIVE;
  } else if (game.status?.abstractGameState === 'Final') {
    status = MLBGameStatus.FINAL;
  } else if (game.status?.detailedState?.toLowerCase().includes('postponed')) {
    status = MLBGameStatus.POSTPONED;
  } else if (game.status?.detailedState?.toLowerCase().includes('suspended')) {
    status = MLBGameStatus.SUSPENDED;
  } else if (game.status?.detailedState?.toLowerCase().includes('cancelled')) {
    status = MLBGameStatus.CANCELLED;
  }

  const newGame: NewMLBGame = {
    gamePk: game.gamePk,
    gameDate: new Date(game.gameDate.split('T')[0]), // Just the date part
    gameTime: new Date(game.gameDate), // Full timestamp
    homeTeamId: game.teams.home.team.id,
    awayTeamId: game.teams.away.team.id,
    homeTeamName: game.teams.home.team.name,
    awayTeamName: game.teams.away.team.name,
    venueId: game.venue?.id,
    venueName: game.venue?.name,
    status,
    detailedState: game.status?.detailedState,
    isComplete: status === MLBGameStatus.FINAL,
  };

  await db.insert(mlbGames).values(newGame)
    .onConflictDoUpdate({
      target: mlbGames.gamePk,
      set: {
        gameDate: newGame.gameDate,
        gameTime: newGame.gameTime,
        homeTeamId: newGame.homeTeamId,
        awayTeamId: newGame.awayTeamId,
        homeTeamName: newGame.homeTeamName,
        awayTeamName: newGame.awayTeamName,
        venueId: newGame.venueId,
        venueName: newGame.venueName,
        status: newGame.status,
        detailedState: newGame.detailedState,
        isComplete: newGame.isComplete,
        lastUpdated: new Date(),
      },
    });
}

/**
 * Get all player IDs from the database
 */
export async function getAllPlayerIds(): Promise<number[]> {
  const players = await db.select({ id: mlbPlayers.id }).from(mlbPlayers);
  return players.map(player => player.id);
}

/**
 * Get all MLB games for a specific date
 */
export async function getGamesByDate(date: Date): Promise<typeof mlbGames.$inferSelect[]> {
  return db.select().from(mlbGames)
    .where(eq(mlbGames.gameDate, date))
    .orderBy(mlbGames.gameTime);
}

/**
 * Get player profile with stats
 */
export async function getPlayerWithStats(playerId: number, isPitcher: boolean): Promise<any> {
  const player = await db.select().from(mlbPlayers)
    .where(eq(mlbPlayers.id, playerId))
    .limit(1);

  if (player.length === 0) {
    return null;
  }

  if (isPitcher) {
    const stats = await db.select().from(mlbPitcherStats)
      .where(eq(mlbPitcherStats.playerId, playerId))
      .orderBy(desc(mlbPitcherStats.season));
    
    return {
      ...player[0],
      stats
    };
  } else {
    const stats = await db.select().from(mlbBatterStats)
      .where(eq(mlbBatterStats.playerId, playerId))
      .orderBy(desc(mlbBatterStats.season));
    
    return {
      ...player[0],
      stats
    };
  }
}

/**
 * Save batter projection to the database
 */
export async function saveBatterProjection(
  projection: {
    playerId: number;
    gamePk: number;
    projectedPoints: number;
    confidence?: number;
    draftKingsSalary?: number;
    projectedHits?: number;
    projectedHomeRuns?: number;
    projectedRbi?: number;
    projectedRuns?: number;
    projectedStolenBases?: number;
    battingOrderPosition?: number;
    opposingPitcherId?: number;
    analysisFactors?: string[];
  }
): Promise<void> {
  const newProjection: NewBatterProjection = {
    playerId: projection.playerId,
    gamePk: projection.gamePk,
    projectedPoints: projection.projectedPoints,
    confidence: projection.confidence ?? 50,
    draftKingsSalary: projection.draftKingsSalary,
    projectedHits: projection.projectedHits,
    projectedHomeRuns: projection.projectedHomeRuns,
    projectedRbi: projection.projectedRbi,
    projectedRuns: projection.projectedRuns,
    projectedStolenBases: projection.projectedStolenBases,
    battingOrderPosition: projection.battingOrderPosition,
    opposingPitcherId: projection.opposingPitcherId,
    analysisFactors: projection.analysisFactors,
  };

  await db.insert(mlbBatterProjections).values(newProjection)
    .onConflictDoUpdate({
      target: [mlbBatterProjections.playerId, mlbBatterProjections.gamePk],
      set: {
        projectedPoints: newProjection.projectedPoints,
        confidence: newProjection.confidence,
        draftKingsSalary: newProjection.draftKingsSalary,
        projectedHits: newProjection.projectedHits,
        projectedHomeRuns: newProjection.projectedHomeRuns,
        projectedRbi: newProjection.projectedRbi,
        projectedRuns: newProjection.projectedRuns,
        projectedStolenBases: newProjection.projectedStolenBases,
        battingOrderPosition: newProjection.battingOrderPosition,
        opposingPitcherId: newProjection.opposingPitcherId,
        analysisFactors: newProjection.analysisFactors,
        createdAt: new Date(),
      },
    });
}

/**
 * Save pitcher projection to the database
 */
export async function savePitcherProjection(
  projection: {
    playerId: number;
    gamePk: number;
    projectedPoints: number;
    confidence?: number;
    draftKingsSalary?: number;
    projectedInnings?: number;
    projectedStrikeouts?: number;
    projectedWinProbability?: number;
    projectedQualityStart?: number;
    opposingLineupStrength?: number;
    analysisFactors?: string[];
  }
): Promise<void> {
  const newProjection: NewPitcherProjection = {
    playerId: projection.playerId,
    gamePk: projection.gamePk,
    projectedPoints: projection.projectedPoints,
    confidence: projection.confidence ?? 50,
    draftKingsSalary: projection.draftKingsSalary,
    projectedInnings: projection.projectedInnings,
    projectedStrikeouts: projection.projectedStrikeouts,
    projectedWinProbability: projection.projectedWinProbability,
    projectedQualityStart: projection.projectedQualityStart,
    opposingLineupStrength: projection.opposingLineupStrength,
    analysisFactors: projection.analysisFactors,
  };

  await db.insert(mlbPitcherProjections).values(newProjection)
    .onConflictDoUpdate({
      target: [mlbPitcherProjections.playerId, mlbPitcherProjections.gamePk],
      set: {
        projectedPoints: newProjection.projectedPoints,
        confidence: newProjection.confidence,
        draftKingsSalary: newProjection.draftKingsSalary,
        projectedInnings: newProjection.projectedInnings,
        projectedStrikeouts: newProjection.projectedStrikeouts,
        projectedWinProbability: newProjection.projectedWinProbability,
        projectedQualityStart: newProjection.projectedQualityStart,
        opposingLineupStrength: newProjection.opposingLineupStrength,
        analysisFactors: newProjection.analysisFactors,
        createdAt: new Date(),
      },
    });
}

/**
 * Get top projected batters for a given date
 */
export async function getTopProjectedBatters(date: Date, limit: number = 10): Promise<any[]> {
  return db.select({
    projection: mlbBatterProjections,
    player: mlbPlayers,
    game: mlbGames,
  })
  .from(mlbBatterProjections)
  .innerJoin(mlbPlayers, eq(mlbBatterProjections.playerId, mlbPlayers.id))
  .innerJoin(mlbGames, eq(mlbBatterProjections.gamePk, mlbGames.gamePk))
  .where(eq(mlbGames.gameDate, date))
  .orderBy(desc(mlbBatterProjections.projectedPoints))
  .limit(limit);
}

/**
 * Get top projected pitchers for a given date
 */
export async function getTopProjectedPitchers(date: Date, limit: number = 10): Promise<any[]> {
  return db.select({
    projection: mlbPitcherProjections,
    player: mlbPlayers,
    game: mlbGames,
  })
  .from(mlbPitcherProjections)
  .innerJoin(mlbPlayers, eq(mlbPitcherProjections.playerId, mlbPlayers.id))
  .innerJoin(mlbGames, eq(mlbPitcherProjections.gamePk, mlbGames.gamePk))
  .where(eq(mlbGames.gameDate, date))
  .orderBy(desc(mlbPitcherProjections.projectedPoints))
  .limit(limit);
}

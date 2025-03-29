import { withCache, DEFAULT_CACHE_TTL, markAsApiSource } from "../cache";
import { makeMLBApiRequest } from "../core/api-client";
import { ProbableLineup } from "../core/types";

/**
 * Raw fetch function for probable lineup data
 */
async function fetchProbableLineups(params: {
  gamePk: string;
}): Promise<ProbableLineup> {
  const { gamePk } = params;

  try {
    // First try to get the actual lineup if the game has started
    const liveFeedData = await makeMLBApiRequest<any>(
      `/game/${gamePk}/feed/live`,
      "V11"
    ).catch(() => null);

    if (liveFeedData?.liveData?.boxscore?.teams) {
      const { home, away } = liveFeedData.liveData.boxscore.teams;
      const isConfirmed = true; // Live game means lineup is confirmed

      return markAsApiSource({
        away: away.battingOrder || [],
        home: home.battingOrder || [],
        awayBatters: away.batters?.map((id: number) => ({
          id,
          fullName: away.players[`ID${id}`]?.person?.fullName || "",
          position: away.players[`ID${id}`]?.position?.abbreviation || "",
        })),
        homeBatters: home.batters?.map((id: number) => ({
          id,
          fullName: home.players[`ID${id}`]?.person?.fullName || "",
          position: home.players[`ID${id}`]?.position?.abbreviation || "",
        })),
        confirmed: isConfirmed,
        sourceTimestamp: new Date(),
      });
    }

    // If live lineup not available, fall back to probable lineup from game preview
    const previewData = await makeMLBApiRequest<any>(
      `/game/${gamePk}/content`,
      "V1"
    );

    // Extract probable lineup from preview data
    const probableLineup: ProbableLineup = {
      away: [],
      home: [],
      confirmed: false, // Probable lineup, not confirmed
      sourceTimestamp: new Date(),
    };

    // Parse the preview data to extract probable lineups
    if (previewData.gameNotes?.probableLineups) {
      const { away, home } = previewData.gameNotes.probableLineups;
      probableLineup.awayBatters = away?.map((batter: any) => ({
        id: batter.id,
        fullName: batter.fullName,
        position: batter.position,
      }));
      probableLineup.homeBatters = home?.map((batter: any) => ({
        id: batter.id,
        fullName: batter.fullName,
        position: batter.position,
      }));
      probableLineup.away = probableLineup.awayBatters?.map((b) => b.id) || [];
      probableLineup.home = probableLineup.homeBatters?.map((b) => b.id) || [];
    }

    return markAsApiSource(probableLineup);
  } catch (error) {
    console.error("Error fetching lineup data:", error);
    return markAsApiSource({
      away: [],
      home: [],
      confirmed: false,
      sourceTimestamp: new Date(),
    });
  }
}

/**
 * Get probable lineups with caching (10-minute TTL)
 */
export const getProbableLineups = withCache(
  fetchProbableLineups,
  "lineup",
  DEFAULT_CACHE_TTL.lineup
);
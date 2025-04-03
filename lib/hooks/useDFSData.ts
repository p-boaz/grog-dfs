import { useState, useEffect } from "react";

interface BatterData {
  batterId: number;
  name: string;
  position: string;
  team: string;
  opponent: string;
  opposingPitcher: {
    id: number;
    name: string;
    throwsHand: string;
  };
  gameId: number;
  venue: string;
  stats: {
    seasonStats: {
      [year: string]: {
        gamesPlayed: number;
        atBats: number;
        hits: number;
        runs: number;
        doubles: number;
        triples: number;
        homeRuns: number;
        rbi: number;
        avg: string;
        obp: string;
        slg: string;
        ops: string;
        stolenBases: number;
        caughtStealing: number;
      };
    };
  };
  projections: {
    dfsProjection: {
      expectedPoints: number;
      upside: number;
      floor: number;
    };
    homeRunProbability: number;
    stolenBaseProbability: number;
  };
  environment: {
    temperature: number;
    windSpeed: number;
    windDirection: string;
    isOutdoor: boolean;
  };
  ballparkFactors: {
    overall: number;
    homeRuns: number;
    runs: number;
  };
}

interface PitcherData {
  pitcherId: number;
  name: string;
  team: string;
  opponent: string;
  gameId: number;
  venue: string;
  stats: {
    seasonStats: {
      [year: string]: {
        gamesPlayed: number;
        gamesStarted: number;
        inningsPitched: number;
        wins: number;
        losses: number;
        era: string;
        whip: string;
        strikeouts: number;
        walks: number;
        saves: number;
        homeRunsAllowed: number;
        hitBatsmen: number;
      };
    };
  };
  projections: {
    winProbability: number;
    expectedStrikeouts: number;
    expectedInnings: number;
    dfsProjection: {
      expectedPoints: number;
      upside: number;
      floor: number;
    };
  };
  environment: {
    temperature: number;
    windSpeed: number;
    windDirection: string;
    isOutdoor: boolean;
  };
  ballparkFactors: {
    overall: number;
    homeRuns: number;
  };
}

interface BattersResponse {
  date: string;
  analysisTimestamp: string;
  batters: BatterData[];
}

interface PitchersResponse {
  date: string;
  analysisTimestamp: string;
  pitchers: PitcherData[];
}

interface GameData {
  gamePk: number;
  gameDate: string;
  status: {
    abstractGameState: string;
    detailedState: string;
  };
  teams: {
    home: {
      team: {
        id: number;
        name: string;
      }
    };
    away: {
      team: {
        id: number;
        name: string;
      }
    }
  };
  venue: {
    id?: number;
    name?: string;
  };
}

interface DFSData {
  batters: BattersResponse;
  pitchers: PitchersResponse;
  games?: GameData[];
  date: string;
  source?: string;
}

export function useDFSData(date?: string) {
  const [data, setData] = useState<DFSData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const url = date ? `/api/dfs?date=${date}` : "/api/dfs";
        const response = await fetch(url);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch data");
        }

        const jsonData = await response.json();

        // Ensure the data structure matches our interface
        const formattedData: DFSData = {
          batters: {
            date: jsonData.batters.date,
            analysisTimestamp: jsonData.batters.analysisTimestamp,
            batters: Array.isArray(jsonData.batters.batters)
              ? jsonData.batters.batters
              : [],
          },
          pitchers: {
            date: jsonData.pitchers.date,
            analysisTimestamp: jsonData.pitchers.analysisTimestamp,
            pitchers: Array.isArray(jsonData.pitchers.pitchers)
              ? jsonData.pitchers.pitchers
              : [],
          },
          games: Array.isArray(jsonData.games) ? jsonData.games : [],
          date: jsonData.date,
          source: jsonData.source || 'api'
        };

        setData(formattedData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [date]); // Re-fetch when date changes

  return { data, loading, error };
}

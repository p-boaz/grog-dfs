import { useState, useEffect } from "react";

interface BatterData {
  batterId: number;
  name: string;
  team: string;
  opponent: string;
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
  projections: {
    winProbability: number;
    expectedStrikeouts: number;
    expectedInnings: number;
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

interface DFSData {
  batters: BattersResponse;
  pitchers: PitchersResponse;
  date: string;
}

export function useDFSData() {
  const [data, setData] = useState<DFSData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const response = await fetch("/api/dfs");
        if (!response.ok) throw new Error("Failed to fetch data");
        const jsonData = await response.json();
        setData(jsonData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return { data, loading, error };
}

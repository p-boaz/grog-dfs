"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { EnvironmentInfo } from "@/components/dfs/EnvironmentInfo";
import { useDFSData } from "@/lib/hooks/useDFSData";

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

interface EnvironmentInfoProps {
  environment: {
    temperature: number;
    windSpeed: number;
    windDirection: string;
    isOutdoor: boolean;
  };
  ballparkFactors: {
    overall: number;
    homeRuns: number;
    runs?: number;
  };
}

interface BattersResponse {
  date: string;
  analysisTimestamp: string;
  batters: BatterData[];
}

interface DFSData {
  batters: BattersResponse;
  pitchers: any[];
  date: string;
}

interface DFSBattersViewProps {
  date: string;
}

export function DFSBattersView({ date }: DFSBattersViewProps) {
  const { data, loading, error } = useDFSData(date);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!data?.batters?.batters || !Array.isArray(data.batters.batters)) {
    return <div>No data available</div>;
  }

  // Calculate quick stats
  const topValuePlay =
    data.batters.batters.length > 0
      ? [...data.batters.batters].sort(
          (a, b) =>
            b.projections.dfsProjection.expectedPoints /
              b.projections.dfsProjection.floor -
            a.projections.dfsProjection.expectedPoints /
              a.projections.dfsProjection.floor
        )[0]
      : null;

  const highestUpside =
    data.batters.batters.length > 0
      ? [...data.batters.batters].sort(
          (a, b) =>
            b.projections.dfsProjection.upside -
            a.projections.dfsProjection.upside
        )[0]
      : null;

  const significantWeather = data.batters.batters.find(
    (b) =>
      b.environment.isOutdoor &&
      (b.environment.windSpeed > 15 ||
        b.environment.temperature < 50 ||
        b.environment.temperature > 90)
  );

  return (
    <div className="space-y-6">
      {/* Quick Stats Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Top Value Play</CardTitle>
          </CardHeader>
          <CardContent>
            {topValuePlay && (
              <div>
                <div className="font-medium">{topValuePlay.name}</div>
                <div className="text-sm text-muted-foreground">
                  {topValuePlay.team} vs {topValuePlay.opponent}
                </div>
                <div className="mt-2">
                  <div className="text-sm">
                    Projected:{" "}
                    {topValuePlay.projections.dfsProjection.expectedPoints.toFixed(
                      2
                    )}
                  </div>
                  <div className="text-sm">
                    Floor:{" "}
                    {topValuePlay.projections.dfsProjection.floor.toFixed(2)}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Highest Upside</CardTitle>
          </CardHeader>
          <CardContent>
            {highestUpside && (
              <div>
                <div className="font-medium">{highestUpside.name}</div>
                <div className="text-sm text-muted-foreground">
                  {highestUpside.team} vs {highestUpside.opponent}
                </div>
                <div className="mt-2">
                  <div className="text-sm">
                    Upside:{" "}
                    {highestUpside.projections.dfsProjection.upside.toFixed(2)}
                  </div>
                  <div className="text-sm">
                    HR Prob:{" "}
                    {(
                      highestUpside.projections.homeRunProbability * 100
                    ).toFixed(1)}
                    %
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Weather Alert</CardTitle>
          </CardHeader>
          <CardContent>
            {significantWeather && (
              <div>
                <div className="font-medium">{significantWeather.name}</div>
                <div className="text-sm text-muted-foreground">
                  {significantWeather.team} vs {significantWeather.opponent}
                </div>
                <div className="mt-2">
                  <div className="text-sm">
                    Temp: {significantWeather.environment.temperature}°F
                  </div>
                  <div className="text-sm">
                    Wind: {significantWeather.environment.windSpeed} mph{" "}
                    {significantWeather.environment.windDirection}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Main Batters Table */}
      <Card>
        <CardHeader>
          <CardTitle>Batter Projections</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Pos</TableHead>
                <TableHead>Matchup</TableHead>
                <TableHead>2025 Stats</TableHead>
                <TableHead>Proj. Points</TableHead>
                <TableHead>Floor</TableHead>
                <TableHead>Upside</TableHead>
                <TableHead>HR Prob</TableHead>
                <TableHead>SB Prob</TableHead>
                <TableHead>Environment</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.batters.batters.map((batter) => (
                <TableRow key={batter.batterId}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span>{batter.name}</span>
                      <Badge>{batter.team}</Badge>
                    </div>
                  </TableCell>
                  <TableCell>{batter.position}</TableCell>
                  <TableCell>
                    <div>vs {batter.opponent}</div>
                    <div className="text-sm text-muted-foreground">
                      vs {batter.opposingPitcher.name} (
                      {batter.opposingPitcher.throwsHand})
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>
                        AVG: {batter.stats.seasonStats["2025"]?.avg || "N/A"}
                      </div>
                      <div>
                        OBP: {batter.stats.seasonStats["2025"]?.obp || "N/A"}
                      </div>
                      <div>
                        SLG: {batter.stats.seasonStats["2025"]?.slg || "N/A"}
                      </div>
                      <div>
                        OPS: {batter.stats.seasonStats["2025"]?.ops || "N/A"}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {batter.projections.dfsProjection.expectedPoints.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    {batter.projections.dfsProjection.floor.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    {batter.projections.dfsProjection.upside.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    {(batter.projections.homeRunProbability * 100).toFixed(1)}%
                  </TableCell>
                  <TableCell>
                    {(batter.projections.stolenBaseProbability * 100).toFixed(
                      1
                    )}
                    %
                  </TableCell>
                  <TableCell>
                    <EnvironmentInfo
                      environment={batter.environment}
                      ballparkFactors={batter.ballparkFactors}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { EnvironmentInfo } from "./EnvironmentInfo";
import { useDFSData } from "@/lib/hooks/useDFSData";

interface PitcherData {
  pitcherId: number;
  name: string;
  team: string;
  opponent: string;
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

export function DFSPitchersView() {
  const { data, loading, error } = useDFSData();
  const pitchers = data?.pitchers || [];

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg">Loading DFS data...</div>
      </div>
    );

  if (error)
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg text-red-500">Error: {error}</div>
      </div>
    );

  // Sort pitchers by expected points
  const sortedPitchers = [...pitchers].sort(
    (a, b) =>
      b.projections.dfsProjection.expectedPoints -
      a.projections.dfsProjection.expectedPoints
  );

  return (
    <div className="space-y-6">
      {/* Pitcher Analysis Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedPitchers.map((pitcher) => (
          <Card key={pitcher.pitcherId}>
            <CardHeader>
              <CardTitle className="flex justify-between">
                <span>{pitcher.name}</span>
                <Badge>{pitcher.team}</Badge>
              </CardTitle>
              <div className="text-sm text-muted-foreground">
                vs {pitcher.opponent}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Win Probability</span>
                  <span>{pitcher.projections.winProbability}%</span>
                </div>
                <Progress value={pitcher.projections.winProbability} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium">Expected K's</div>
                  <div className="text-2xl">
                    {pitcher.projections.expectedStrikeouts.toFixed(1)}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium">Expected IP</div>
                  <div className="text-2xl">
                    {pitcher.projections.expectedInnings.toFixed(1)}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="text-sm font-medium mb-2">DFS Projection</div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <div className="text-sm text-muted-foreground">Floor</div>
                    <div className="font-medium">
                      {pitcher.projections.dfsProjection.floor.toFixed(1)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Proj</div>
                    <div className="font-medium">
                      {pitcher.projections.dfsProjection.expectedPoints.toFixed(
                        1
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Ceiling</div>
                    <div className="font-medium">
                      {pitcher.projections.dfsProjection.upside.toFixed(1)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <EnvironmentInfo
                  environment={pitcher.environment}
                  ballparkFactors={pitcher.ballparkFactors}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

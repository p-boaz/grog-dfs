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

export function DFSBattersView() {
  const { data, loading, error } = useDFSData();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!data?.batters) {
    return <div>No data available</div>;
  }

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Batter Projections</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Team</TableHead>
                <TableHead>Projected Points</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.batters.map((batter: any) => (
                <TableRow key={batter.batterId}>
                  <TableCell>{batter.name}</TableCell>
                  <TableCell>
                    <Badge>{batter.team}</Badge>
                  </TableCell>
                  <TableCell>
                    {batter.projections?.dfsProjection?.expectedPoints?.toFixed(
                      2
                    ) || "N/A"}
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

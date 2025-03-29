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

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!data?.pitchers?.pitchers || !Array.isArray(data.pitchers.pitchers)) {
    return <div>No data available</div>;
  }

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Pitcher Projections</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Team</TableHead>
                <TableHead>Win Prob</TableHead>
                <TableHead>Expected Ks</TableHead>
                <TableHead>Expected IP</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.pitchers.pitchers.map((pitcher) => (
                <TableRow key={pitcher.pitcherId}>
                  <TableCell>{pitcher.name}</TableCell>
                  <TableCell>
                    <Badge>{pitcher.team}</Badge>
                  </TableCell>
                  <TableCell>
                    {pitcher.projections.winProbability.toFixed(1)}%
                  </TableCell>
                  <TableCell>
                    {pitcher.projections.expectedStrikeouts.toFixed(1)}
                  </TableCell>
                  <TableCell>
                    {pitcher.projections.expectedInnings.toFixed(1)}
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

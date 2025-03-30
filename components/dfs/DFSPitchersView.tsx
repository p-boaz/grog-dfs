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

interface DFSPitchersViewProps {
  date: string;
}

export function DFSPitchersView({ date }: DFSPitchersViewProps) {
  const { data, loading, error } = useDFSData(date);

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
                <TableHead>Opponent</TableHead>
                <TableHead>2025 Stats</TableHead>
                <TableHead>Win Prob</TableHead>
                <TableHead>Expected Ks</TableHead>
                <TableHead>Expected IP</TableHead>
                <TableHead>Proj. Points</TableHead>
                <TableHead>Environment</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.pitchers.pitchers.map((pitcher) => (
                <TableRow key={pitcher.pitcherId}>
                  <TableCell>{pitcher.name}</TableCell>
                  <TableCell>
                    <Badge>{pitcher.team}</Badge>
                  </TableCell>
                  <TableCell>{pitcher.opponent}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>
                        ERA: {pitcher.stats.seasonStats["2025"]?.era || "N/A"}
                      </div>
                      <div>
                        WHIP: {pitcher.stats.seasonStats["2025"]?.whip || "N/A"}
                      </div>
                      <div>
                        W-L: {pitcher.stats.seasonStats["2025"]?.wins || 0}-
                        {pitcher.stats.seasonStats["2025"]?.losses || 0}
                      </div>
                      <div>
                        K/BB:{" "}
                        {(pitcher.stats.seasonStats["2025"]?.strikeouts || 0) /
                          (pitcher.stats.seasonStats["2025"]?.walks || 1)}
                      </div>
                    </div>
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
                  <TableCell>
                    <div className="text-sm">
                      <div>
                        Proj:{" "}
                        {pitcher.projections.dfsProjection.expectedPoints.toFixed(
                          2
                        )}
                      </div>
                      <div>
                        Floor:{" "}
                        {pitcher.projections.dfsProjection.floor.toFixed(2)}
                      </div>
                      <div>
                        Upside:{" "}
                        {pitcher.projections.dfsProjection.upside.toFixed(2)}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <EnvironmentInfo
                      environment={pitcher.environment}
                      ballparkFactors={pitcher.ballparkFactors}
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

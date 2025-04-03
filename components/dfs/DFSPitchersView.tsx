"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useDFSData } from "@/lib/hooks/useDFSData";
import {
  CaretSortIcon,
  FileIcon,
  MagnifyingGlassIcon,
} from "@radix-ui/react-icons";
import { useMemo, useState } from "react";
import { EnvironmentInfo } from "./EnvironmentInfo";

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

interface DFSPitchersViewProps {
  date: string;
}

// Salary tier definitions
const SALARY_TIERS = {
  All: [0, 100000],
  "Ace ($10K+)": [10000, 100000],
  "High ($8K-$10K)": [8000, 9999],
  "Mid ($6K-$8K)": [6000, 7999],
  "Value (< $6K)": [0, 5999],
};

export function DFSPitchersView({ date }: DFSPitchersViewProps) {
  const { data, loading, error } = useDFSData(date);

  // State for filtering and sorting
  const [searchQuery, setSearchQuery] = useState("");
  const [salaryTier, setSalaryTier] = useState("All");
  const [teamFilter, setTeamFilter] = useState("All");
  const [sortBy, setSortBy] = useState("points");
  const [sortOrder, setSortOrder] = useState("desc");
  const [activeTab, setActiveTab] = useState("all");

  // Extract pitchers data - use empty array as fallback
  const pitchers = data?.pitchers?.pitchers || [];

  // Calculate insights and top performers
  const highestProjection =
    pitchers.length > 0
      ? [...pitchers].sort(
          (a, b) =>
            b.projections.dfsProjection.expectedPoints -
            a.projections.dfsProjection.expectedPoints
        )[0]
      : null;

  const highestStrikeouts =
    pitchers.length > 0
      ? [...pitchers].sort(
          (a, b) =>
            b.projections.expectedStrikeouts - a.projections.expectedStrikeouts
        )[0]
      : null;

  const bestWinProbability =
    pitchers.length > 0
      ? [...pitchers].sort(
          (a, b) => b.projections.winProbability - a.projections.winProbability
        )[0]
      : null;

  // Extract unique teams for filtering
  const teams = ["All", ...new Set(pitchers.map((p) => p.team))].sort();

  // Filter and sort pitchers
  const filteredPitchers = useMemo(() => {
    return pitchers
      .filter((pitcher) => {
        // Text search
        const matchesSearch =
          searchQuery === "" ||
          pitcher.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          pitcher.team.toLowerCase().includes(searchQuery.toLowerCase());

        // Team filter
        const matchesTeam = teamFilter === "All" || pitcher.team === teamFilter;

        // Salary tier filter
        const salary =
          pitcher.projections?.dfsProjection?.expectedPoints * 1000 || 0; // Using points as proxy for salary
        const [minSalary, maxSalary] =
          SALARY_TIERS[salaryTier as keyof typeof SALARY_TIERS];
        const matchesSalary = salary >= minSalary && salary <= maxSalary;

        // Tab filter
        if (activeTab === "value") {
          // Value plays have high points per dollar
          const valueRatio =
            salary > 0
              ? pitcher.projections.dfsProjection.expectedPoints /
                (salary / 1000)
              : 0;
          return (
            matchesSearch && matchesTeam && matchesSalary && valueRatio > 2.0
          );
        } else if (activeTab === "upside") {
          // Upside plays have high ceiling compared to their expected points
          const upsideRatio =
            pitcher.projections.dfsProjection.upside /
            pitcher.projections.dfsProjection.expectedPoints;
          return (
            matchesSearch && matchesTeam && matchesSalary && upsideRatio > 1.3
          );
        } else if (activeTab === "strikeouts") {
          // K machines have high strikeout projections
          return (
            matchesSearch &&
            matchesTeam &&
            matchesSalary &&
            pitcher.projections.expectedStrikeouts > 7.0
          );
        } else if (activeTab === "winners") {
          // Likely winners have high win probability
          return (
            matchesSearch &&
            matchesTeam &&
            matchesSalary &&
            pitcher.projections.winProbability > 55
          );
        }

        // Default "all" tab
        return matchesSearch && matchesTeam && matchesSalary;
      })
      .sort((a, b) => {
        // Sorting logic
        if (sortBy === "points") {
          return sortOrder === "desc"
            ? b.projections.dfsProjection.expectedPoints -
                a.projections.dfsProjection.expectedPoints
            : a.projections.dfsProjection.expectedPoints -
                b.projections.dfsProjection.expectedPoints;
        } else if (sortBy === "upside") {
          return sortOrder === "desc"
            ? b.projections.dfsProjection.upside -
                a.projections.dfsProjection.upside
            : a.projections.dfsProjection.upside -
                b.projections.dfsProjection.upside;
        } else if (sortBy === "floor") {
          return sortOrder === "desc"
            ? b.projections.dfsProjection.floor -
                a.projections.dfsProjection.floor
            : a.projections.dfsProjection.floor -
                b.projections.dfsProjection.floor;
        } else if (sortBy === "strikeouts") {
          return sortOrder === "desc"
            ? b.projections.expectedStrikeouts -
                a.projections.expectedStrikeouts
            : a.projections.expectedStrikeouts -
                b.projections.expectedStrikeouts;
        } else if (sortBy === "innings") {
          return sortOrder === "desc"
            ? b.projections.expectedInnings - a.projections.expectedInnings
            : a.projections.expectedInnings - b.projections.expectedInnings;
        } else if (sortBy === "win") {
          return sortOrder === "desc"
            ? b.projections.winProbability - a.projections.winProbability
            : a.projections.winProbability - b.projections.winProbability;
        } else if (sortBy === "name") {
          return sortOrder === "desc"
            ? b.name.localeCompare(a.name)
            : a.name.localeCompare(b.name);
        } else if (sortBy === "team") {
          return sortOrder === "desc"
            ? b.team.localeCompare(a.team)
            : a.team.localeCompare(b.team);
        }

        // Default sort by points
        return sortOrder === "desc"
          ? b.projections.dfsProjection.expectedPoints -
              a.projections.dfsProjection.expectedPoints
          : a.projections.dfsProjection.expectedPoints -
              b.projections.dfsProjection.expectedPoints;
      });
  }, [
    pitchers,
    searchQuery,
    teamFilter,
    salaryTier,
    sortBy,
    sortOrder,
    activeTab,
  ]);

  // Toggle sort order
  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  // Handle loading and error states
  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="h-8 bg-muted rounded-md animate-pulse w-1/3 mb-4"></div>
            <div className="space-y-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-12 bg-muted rounded-md animate-pulse"
                ></div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-destructive">
            <p>Error loading pitcher data</p>
            <p className="text-sm text-muted-foreground mt-2">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data?.pitchers?.pitchers || !Array.isArray(data.pitchers.pitchers)) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <p>No pitcher data available for this date</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Quick Stats Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">
              Top Projected Pitcher
            </CardTitle>
          </CardHeader>
          <CardContent>
            {highestProjection ? (
              <div>
                <div className="font-medium">{highestProjection.name}</div>
                <div className="text-sm text-muted-foreground">
                  {highestProjection.team} vs {highestProjection.opponent}
                </div>
                <div className="mt-2 grid grid-cols-2 gap-x-2 gap-y-1">
                  <div className="text-sm">
                    <span className="text-muted-foreground">Proj:</span>{" "}
                    {highestProjection.projections?.dfsProjection?.expectedPoints.toFixed(
                      2
                    )}{" "}
                    pts
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Win%:</span>{" "}
                    {highestProjection.projections.winProbability.toFixed(1)}%
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">K:</span>{" "}
                    {highestProjection.projections.expectedStrikeouts.toFixed(
                      1
                    )}
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">IP:</span>{" "}
                    {highestProjection.projections.expectedInnings.toFixed(1)}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">
                No data available
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">
              Strikeout Specialist
            </CardTitle>
          </CardHeader>
          <CardContent>
            {highestStrikeouts ? (
              <div>
                <div className="font-medium">{highestStrikeouts.name}</div>
                <div className="text-sm text-muted-foreground">
                  {highestStrikeouts.team} vs {highestStrikeouts.opponent}
                </div>
                <div className="mt-2 grid grid-cols-2 gap-x-2 gap-y-1">
                  <div className="text-sm">
                    <span className="text-muted-foreground">Exp. K:</span>{" "}
                    {highestStrikeouts.projections.expectedStrikeouts.toFixed(
                      1
                    )}
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Proj Pts:</span>{" "}
                    {highestStrikeouts.projections.dfsProjection.expectedPoints.toFixed(
                      1
                    )}
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">2025 K:</span>{" "}
                    {highestStrikeouts.stats.seasonStats["2025"]?.strikeouts ||
                      "N/A"}
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">ERA:</span>{" "}
                    {highestStrikeouts.stats.seasonStats["2025"]?.era || "N/A"}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">
                No data available
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">
              Likely Winner
            </CardTitle>
          </CardHeader>
          <CardContent>
            {bestWinProbability ? (
              <div>
                <div className="font-medium">{bestWinProbability.name}</div>
                <div className="text-sm text-muted-foreground">
                  {bestWinProbability.team} vs {bestWinProbability.opponent}
                </div>
                <div className="mt-2 grid grid-cols-2 gap-x-2 gap-y-1">
                  <div className="text-sm">
                    <span className="text-muted-foreground">Win%:</span>{" "}
                    {bestWinProbability.projections.winProbability.toFixed(1)}%
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Proj Pts:</span>{" "}
                    {bestWinProbability.projections.dfsProjection.expectedPoints.toFixed(
                      1
                    )}
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">2025 W-L:</span>{" "}
                    {bestWinProbability.stats.seasonStats["2025"]?.wins || 0}-
                    {bestWinProbability.stats.seasonStats["2025"]?.losses || 0}
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">WHIP:</span>{" "}
                    {bestWinProbability.stats.seasonStats["2025"]?.whip ||
                      "N/A"}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">
                No data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Filters Section */}
      <div className="grid grid-cols-1 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">
              Filter and Sort
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search Input */}
              <div className="flex items-center space-x-2">
                <MagnifyingGlassIcon className="h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search pitchers or teams..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-9"
                />
              </div>

              {/* Team Filter */}
              <div className="flex items-center space-x-2">
                <CaretSortIcon className="h-5 w-5 text-muted-foreground" />
                <Select value={teamFilter} onValueChange={setTeamFilter}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Team" />
                  </SelectTrigger>
                  <SelectContent>
                    {teams.map((team) => (
                      <SelectItem key={team} value={team}>
                        {team}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Salary Tier */}
              <div className="flex items-center space-x-2">
                <FileIcon className="h-5 w-5 text-muted-foreground" />
                <Select value={salaryTier} onValueChange={setSalaryTier}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Salary Tier" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(SALARY_TIERS).map((tier) => (
                      <SelectItem key={tier} value={tier}>
                        {tier}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Sort Controls */}
              <div className="flex items-center space-x-2">
                <CaretSortIcon className="h-5 w-5 text-muted-foreground" />
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="points">Expected Points</SelectItem>
                    <SelectItem value="upside">Upside</SelectItem>
                    <SelectItem value="floor">Floor</SelectItem>
                    <SelectItem value="strikeouts">Strikeouts</SelectItem>
                    <SelectItem value="innings">Innings</SelectItem>
                    <SelectItem value="win">Win Probability</SelectItem>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="team">Team</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  className="h-9"
                  onClick={toggleSortOrder}
                >
                  {sortOrder === "desc" ? "↓" : "↑"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Pitchers Content with Tabs */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle>Pitcher Projections</CardTitle>
            <div className="text-sm text-muted-foreground">
              {filteredPitchers.length} pitchers
            </div>
          </div>
        </CardHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="px-6">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="all">All Pitchers</TabsTrigger>
              <TabsTrigger value="value">Value Plays</TabsTrigger>
              <TabsTrigger value="upside">Upside Plays</TabsTrigger>
              <TabsTrigger value="strikeouts">K Machines</TabsTrigger>
              <TabsTrigger value="winners">Likely Winners</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="all" className="m-0">
            <PitchersTable pitchers={filteredPitchers} />
          </TabsContent>

          <TabsContent value="value" className="m-0">
            <PitchersTable pitchers={filteredPitchers} />
          </TabsContent>

          <TabsContent value="upside" className="m-0">
            <PitchersTable pitchers={filteredPitchers} />
          </TabsContent>

          <TabsContent value="strikeouts" className="m-0">
            <PitchersTable pitchers={filteredPitchers} />
          </TabsContent>

          <TabsContent value="winners" className="m-0">
            <PitchersTable pitchers={filteredPitchers} />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}

// Separate pitcher table component to keep the main component cleaner
function PitchersTable({ pitchers }: { pitchers: PitcherData[] }) {
  return (
    <div className="px-4 pb-4">
      {pitchers.length === 0 ? (
        <div className="py-6 text-center">
          <p className="text-muted-foreground">
            No pitchers match the current filters
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[180px]">Name</TableHead>
                <TableHead>Matchup</TableHead>
                <TableHead className="text-center">2025 Stats</TableHead>
                <TableHead>Win %</TableHead>
                <TableHead>Projected Stats</TableHead>
                <TableHead>DFS Projection</TableHead>
                <TableHead>Environment</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pitchers.map((pitcher) => (
                <TableRow key={pitcher.pitcherId}>
                  <TableCell>
                    <div className="font-medium">{pitcher.name}</div>
                    <div className="flex items-center mt-1">
                      <Badge>{pitcher.team}</Badge>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex flex-col">
                      <span>vs {pitcher.opponent}</span>
                      <div className="text-xs text-muted-foreground mt-1">
                        {pitcher.venue}
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="grid grid-cols-2 gap-x-4 text-sm min-w-[160px]">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">ERA:</span>
                        <span>
                          {pitcher.stats.seasonStats["2025"]?.era || "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">WHIP:</span>
                        <span>
                          {pitcher.stats.seasonStats["2025"]?.whip || "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">W-L:</span>
                        <span>
                          {pitcher.stats.seasonStats["2025"]?.wins || 0}-
                          {pitcher.stats.seasonStats["2025"]?.losses || 0}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">K:</span>
                        <span>
                          {pitcher.stats.seasonStats["2025"]?.strikeouts || 0}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">IP:</span>
                        <span>
                          {pitcher.stats.seasonStats[
                            "2025"
                          ]?.inningsPitched?.toFixed(1) || "0.0"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">K/BB:</span>
                        <span>
                          {(
                            (pitcher.stats.seasonStats["2025"]?.strikeouts ||
                              0) /
                            Math.max(
                              1,
                              pitcher.stats.seasonStats["2025"]?.walks || 1
                            )
                          ).toFixed(1)}
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex flex-col items-center">
                      <div className="font-medium text-lg mb-1">
                        {pitcher.projections.winProbability.toFixed(0)}%
                      </div>
                      <Progress
                        value={pitcher.projections.winProbability}
                        className="h-2 w-16"
                      />
                      <div className="text-xs text-muted-foreground mt-1">
                        Win Probability
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex flex-col">
                      <div className="text-sm flex items-center mb-1">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex items-center justify-between w-full">
                                <span className="text-muted-foreground">
                                  K:
                                </span>
                                <span>
                                  {pitcher.projections.expectedStrikeouts.toFixed(
                                    1
                                  )}
                                </span>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Projected strikeouts</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <div className="text-sm flex items-center mb-1">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex items-center justify-between w-full">
                                <span className="text-muted-foreground">
                                  IP:
                                </span>
                                <span>
                                  {pitcher.projections.expectedInnings.toFixed(
                                    1
                                  )}
                                </span>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Projected innings pitched</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <div className="text-sm flex items-center">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex items-center justify-between w-full">
                                <span className="text-muted-foreground">
                                  K/IP:
                                </span>
                                <span>
                                  {(
                                    pitcher.projections.expectedStrikeouts /
                                    Math.max(
                                      1,
                                      pitcher.projections.expectedInnings
                                    )
                                  ).toFixed(2)}
                                </span>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Strikeouts per inning</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex flex-col min-w-[120px]">
                      <div className="font-medium">
                        {pitcher.projections?.dfsProjection?.expectedPoints.toFixed(
                          2
                        )}{" "}
                        pts
                      </div>
                      <div className="flex items-center h-2 gap-1 mt-1 mb-2">
                        <span className="text-xs">
                          {pitcher.projections.dfsProjection.floor.toFixed(1)}
                        </span>
                        <Progress
                          value={
                            ((pitcher.projections.dfsProjection.expectedPoints -
                              pitcher.projections.dfsProjection.floor) /
                              (pitcher.projections.dfsProjection.upside -
                                pitcher.projections.dfsProjection.floor)) *
                            100
                          }
                          className="h-2 flex-1"
                        />
                        <span className="text-xs">
                          {pitcher.projections.dfsProjection.upside.toFixed(1)}
                        </span>
                      </div>
                      <div className="text-xs flex justify-between">
                        <span className="text-muted-foreground">Floor:</span>
                        <span>
                          {pitcher.projections.dfsProjection.floor.toFixed(1)}
                        </span>
                      </div>
                      <div className="text-xs flex justify-between">
                        <span className="text-muted-foreground">Upside:</span>
                        <span>
                          {pitcher.projections.dfsProjection.upside.toFixed(1)}
                        </span>
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
        </div>
      )}
    </div>
  );
}

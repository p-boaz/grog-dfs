"use client";

import { EnvironmentInfo } from "@/components/dfs/EnvironmentInfo";
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
  InfoCircledIcon,
  MagnifyingGlassIcon,
} from "@radix-ui/react-icons";
import { useMemo, useState } from "react";

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

// Available positions for filtering
const POSITIONS = ["All", "C", "1B", "2B", "3B", "SS", "OF", "DH"];

// Salary tier definitions
const SALARY_TIERS = {
  All: [0, 100000],
  "High ($8K+)": [8000, 100000],
  "Mid ($5K-$8K)": [5000, 7999],
  "Value ($3K-$5K)": [3000, 4999],
  "Budget (< $3K)": [0, 2999],
};

export function DFSBattersView({ date }: DFSBattersViewProps) {
  const { data, loading, error } = useDFSData(date);

  // State for filtering and sorting
  const [searchQuery, setSearchQuery] = useState("");
  const [positionFilter, setPositionFilter] = useState("All");
  const [salaryTier, setSalaryTier] = useState("All");
  const [teamFilter, setTeamFilter] = useState("All");
  const [sortBy, setSortBy] = useState("points");
  const [sortOrder, setSortOrder] = useState("desc");
  const [activeTab, setActiveTab] = useState("all");

  // Extract batters data - use empty array as fallback
  const batters = data?.batters?.batters || [];

  // Calculate quick stats
  const topValuePlay =
    batters.length > 0
      ? [...batters].sort(
          (a, b) =>
            b.projections.dfsProjection.expectedPoints /
              b.projections.dfsProjection.floor -
            a.projections.dfsProjection.expectedPoints /
              a.projections.dfsProjection.floor
        )[0]
      : null;

  const highestUpside =
    batters.length > 0
      ? [...batters].sort(
          (a, b) =>
            b.projections.dfsProjection.upside -
            a.projections.dfsProjection.upside
        )[0]
      : null;

  const significantWeather = batters.find(
    (b) =>
      b.environment.isOutdoor &&
      (b.environment.windSpeed > 15 ||
        b.environment.temperature < 50 ||
        b.environment.temperature > 90)
  );

  // Extract unique teams for filtering
  const teams = ["All", ...new Set(batters.map((b) => b.team))].sort();

  // Filter and sort batters
  const filteredBatters = useMemo(() => {
    return batters
      .filter((batter) => {
        // Text search
        const matchesSearch =
          searchQuery === "" ||
          batter.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          batter.team.toLowerCase().includes(searchQuery.toLowerCase());

        // Position filter
        const matchesPosition =
          positionFilter === "All" || batter.position.includes(positionFilter);

        // Team filter
        const matchesTeam = teamFilter === "All" || batter.team === teamFilter;

        // Salary tier filter
        const salary =
          batter.projections?.dfsProjection?.expectedPoints * 1000 || 0; // Using points as proxy for salary
        const [minSalary, maxSalary] =
          SALARY_TIERS[salaryTier as keyof typeof SALARY_TIERS];
        const matchesSalary = salary >= minSalary && salary <= maxSalary;

        // Tab filter
        if (activeTab === "value") {
          // Value plays have high points per dollar
          const valueRatio =
            salary > 0
              ? batter.projections.dfsProjection.expectedPoints /
                (salary / 1000)
              : 0;
          return (
            matchesSearch &&
            matchesPosition &&
            matchesTeam &&
            matchesSalary &&
            valueRatio > 1.8
          );
        } else if (activeTab === "upside") {
          // Upside plays have high ceiling compared to their expected points
          const upsideRatio =
            batter.projections.dfsProjection.upside /
            batter.projections.dfsProjection.expectedPoints;
          return (
            matchesSearch &&
            matchesPosition &&
            matchesTeam &&
            matchesSalary &&
            upsideRatio > 1.3
          );
        } else if (activeTab === "hr") {
          // HR plays have high home run probability
          return (
            matchesSearch &&
            matchesPosition &&
            matchesTeam &&
            matchesSalary &&
            batter.projections.homeRunProbability > 0.2
          );
        } else if (activeTab === "sb") {
          // Stolen base plays have high SB probability
          return (
            matchesSearch &&
            matchesPosition &&
            matchesTeam &&
            matchesSalary &&
            batter.projections.stolenBaseProbability > 0.15
          );
        }

        // Default "all" tab
        return matchesSearch && matchesPosition && matchesTeam && matchesSalary;
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
        } else if (sortBy === "hr") {
          return sortOrder === "desc"
            ? b.projections.homeRunProbability -
                a.projections.homeRunProbability
            : a.projections.homeRunProbability -
                b.projections.homeRunProbability;
        } else if (sortBy === "sb") {
          return sortOrder === "desc"
            ? b.projections.stolenBaseProbability -
                a.projections.stolenBaseProbability
            : a.projections.stolenBaseProbability -
                b.projections.stolenBaseProbability;
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
    batters,
    searchQuery,
    positionFilter,
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
              {[1, 2, 3, 4, 5].map((i) => (
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
            <p>Error loading batter data</p>
            <p className="text-sm text-muted-foreground mt-2">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data?.batters?.batters || !Array.isArray(data.batters.batters)) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <p>No batter data available for this date</p>
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
              Top Value Play
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topValuePlay ? (
              <div>
                <div className="flex items-center">
                  <div className="font-medium">{topValuePlay.name}</div>
                  <Badge variant="outline" className="ml-2">
                    {topValuePlay.position}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  {topValuePlay.team} vs {topValuePlay.opponent}
                </div>
                <div className="mt-2 grid grid-cols-2 gap-x-2 gap-y-1">
                  <div className="text-sm">
                    <span className="text-muted-foreground">Proj:</span>{" "}
                    {topValuePlay.projections?.dfsProjection?.expectedPoints
                      ? topValuePlay.projections.dfsProjection.expectedPoints.toFixed(
                          2
                        )
                      : "N/A"}
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Floor:</span>{" "}
                    {topValuePlay.projections?.dfsProjection?.floor
                      ? topValuePlay.projections.dfsProjection.floor.toFixed(2)
                      : "N/A"}
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Upside:</span>{" "}
                    {topValuePlay.projections?.dfsProjection?.upside
                      ? topValuePlay.projections.dfsProjection.upside.toFixed(2)
                      : "N/A"}
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">OPS:</span>{" "}
                    {topValuePlay.stats.seasonStats["2025"]?.ops || "N/A"}
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
              Highest Upside
            </CardTitle>
          </CardHeader>
          <CardContent>
            {highestUpside ? (
              <div>
                <div className="flex items-center">
                  <div className="font-medium">{highestUpside.name}</div>
                  <Badge variant="outline" className="ml-2">
                    {highestUpside.position}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  {highestUpside.team} vs {highestUpside.opponent}
                </div>
                <div className="mt-2 grid grid-cols-2 gap-x-2 gap-y-1">
                  <div className="text-sm">
                    <span className="text-muted-foreground">Upside:</span>{" "}
                    {highestUpside.projections?.dfsProjection?.upside
                      ? highestUpside.projections.dfsProjection.upside.toFixed(
                          2
                        )
                      : "N/A"}
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">HR Prob:</span>{" "}
                    {highestUpside.projections?.homeRunProbability
                      ? (
                          highestUpside.projections.homeRunProbability * 100
                        ).toFixed(1)
                      : "N/A"}
                    %
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">SB Prob:</span>{" "}
                    {highestUpside.projections?.stolenBaseProbability
                      ? (
                          highestUpside.projections.stolenBaseProbability * 100
                        ).toFixed(1)
                      : "N/A"}
                    %
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Career HR:</span>{" "}
                    {highestUpside.stats.seasonStats["2025"]?.homeRuns || "N/A"}
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
              {significantWeather ? "Weather Alert" : "DFS Insights"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {significantWeather ? (
              <div>
                <div className="flex items-center">
                  <div className="font-medium">{significantWeather.name}</div>
                  <Badge variant="outline" className="ml-2">
                    {significantWeather.position}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  {significantWeather.team} vs {significantWeather.opponent}
                </div>
                <div className="mt-2">
                  <div className="text-sm">
                    <span className="text-muted-foreground">Temp:</span>{" "}
                    {significantWeather.environment.temperature}°F
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Wind:</span>{" "}
                    {significantWeather.environment.windSpeed} mph{" "}
                    {significantWeather.environment.windDirection}
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Venue:</span>{" "}
                    {significantWeather.venue}
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <div className="space-y-2">
                  <div className="text-sm">
                    <span className="font-medium">Total Batters:</span>{" "}
                    {batters.length}
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Avg. Projection:</span>{" "}
                    {(
                      batters.reduce(
                        (sum, b) =>
                          sum + b.projections.dfsProjection.expectedPoints,
                        0
                      ) / batters.length
                    ).toFixed(2)}{" "}
                    pts
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Highest HR%:</span>{" "}
                    {(
                      Math.max(
                        ...batters.map((b) => b.projections.homeRunProbability)
                      ) * 100
                    ).toFixed(1)}
                    %
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Highest SB%:</span>{" "}
                    {(
                      Math.max(
                        ...batters.map(
                          (b) => b.projections.stolenBaseProbability
                        )
                      ) * 100
                    ).toFixed(1)}
                    %
                  </div>
                </div>
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
                  placeholder="Search batters or teams..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-9"
                />
              </div>

              {/* Position Filter */}
              <div className="flex items-center space-x-2">
                <FileIcon className="h-5 w-5 text-muted-foreground" />
                <Select
                  value={positionFilter}
                  onValueChange={setPositionFilter}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Position" />
                  </SelectTrigger>
                  <SelectContent>
                    {POSITIONS.map((pos) => (
                      <SelectItem key={pos} value={pos}>
                        {pos}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Team Filter */}
              <div className="flex items-center space-x-2">
                <FileIcon className="h-5 w-5 text-muted-foreground" />
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
              <div className="flex items-center space-x-2 md:col-span-2">
                <CaretSortIcon className="h-5 w-5 text-muted-foreground" />
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="points">Expected Points</SelectItem>
                    <SelectItem value="upside">Upside</SelectItem>
                    <SelectItem value="floor">Floor</SelectItem>
                    <SelectItem value="hr">HR Probability</SelectItem>
                    <SelectItem value="sb">SB Probability</SelectItem>
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

      {/* Main Batters Content with Tabs */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle>Batter Projections</CardTitle>
            <div className="text-sm text-muted-foreground">
              {filteredBatters.length} batters
            </div>
          </div>
        </CardHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="px-6">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="all">All Batters</TabsTrigger>
              <TabsTrigger value="value">Value Plays</TabsTrigger>
              <TabsTrigger value="upside">Upside Plays</TabsTrigger>
              <TabsTrigger value="hr">HR Plays</TabsTrigger>
              <TabsTrigger value="sb">SB Plays</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="all" className="m-0">
            <BattersTable batters={filteredBatters} />
          </TabsContent>

          <TabsContent value="value" className="m-0">
            <BattersTable batters={filteredBatters} />
          </TabsContent>

          <TabsContent value="upside" className="m-0">
            <BattersTable batters={filteredBatters} />
          </TabsContent>

          <TabsContent value="hr" className="m-0">
            <BattersTable batters={filteredBatters} />
          </TabsContent>

          <TabsContent value="sb" className="m-0">
            <BattersTable batters={filteredBatters} />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}

// Separate batter table component to keep the main component cleaner
function BattersTable({ batters }: { batters: BatterData[] }) {
  return (
    <div className="px-4 pb-4">
      {batters.length === 0 ? (
        <div className="py-6 text-center">
          <p className="text-muted-foreground">
            No batters match the current filters
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
                <TableHead>Projection</TableHead>
                <TableHead>Confidence Range</TableHead>
                <TableHead>Probabilities</TableHead>
                <TableHead>Environment</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {batters.map((batter) => (
                <TableRow key={batter.batterId}>
                  <TableCell>
                    <div className="font-medium">{batter.name}</div>
                    <div className="flex items-center mt-1">
                      <Badge variant="outline" className="mr-1">
                        {batter.position}
                      </Badge>
                      <Badge>{batter.team}</Badge>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex flex-col">
                      <span>vs {batter.opponent}</span>
                      <div className="text-sm text-muted-foreground flex items-center mt-1">
                        <span>
                          {batter.opposingPitcher.name} (
                          {batter.opposingPitcher.throwsHand})
                        </span>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <InfoCircledIcon className="h-3.5 w-3.5 ml-1 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Opposing pitcher handedness</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {batter.venue}
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="grid grid-cols-2 gap-x-4 text-sm min-w-[160px]">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">AVG:</span>
                        <span>
                          {batter.stats.seasonStats["2025"]?.avg || "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">OBP:</span>
                        <span>
                          {batter.stats.seasonStats["2025"]?.obp || "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">SLG:</span>
                        <span>
                          {batter.stats.seasonStats["2025"]?.slg || "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">OPS:</span>
                        <span>
                          {batter.stats.seasonStats["2025"]?.ops || "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">HR:</span>
                        <span>
                          {batter.stats.seasonStats["2025"]?.homeRuns || "0"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">SB:</span>
                        <span>
                          {batter.stats.seasonStats["2025"]?.stolenBases || "0"}
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="font-medium">
                      {batter.projections?.dfsProjection?.expectedPoints
                        ? batter.projections.dfsProjection.expectedPoints.toFixed(
                            2
                          )
                        : "N/A"}{" "}
                      pts
                    </div>
                    <div className="flex items-center h-2 gap-1 mt-1">
                      <span className="text-xs">
                        {batter.projections.dfsProjection.floor.toFixed(1)}
                      </span>
                      <Progress
                        value={
                          ((batter.projections.dfsProjection.expectedPoints -
                            batter.projections.dfsProjection.floor) /
                            (batter.projections.dfsProjection.upside -
                              batter.projections.dfsProjection.floor)) *
                          100
                        }
                        className="h-2 flex-1"
                      />
                      <span className="text-xs">
                        {batter.projections.dfsProjection.upside.toFixed(1)}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex flex-col">
                      <div className="text-sm flex justify-between mb-1">
                        <span className="text-muted-foreground">Floor:</span>
                        <span>
                          {batter.projections?.dfsProjection?.floor.toFixed(2)}
                        </span>
                      </div>
                      <div className="text-sm flex justify-between">
                        <span className="text-muted-foreground">Upside:</span>
                        <span>
                          {batter.projections?.dfsProjection?.upside.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="min-w-[100px]">
                      <div className="mb-1.5">
                        <div className="flex justify-between text-xs mb-0.5">
                          <span className="text-muted-foreground">HR:</span>
                          <span>
                            {(
                              batter.projections.homeRunProbability * 100
                            ).toFixed(1)}
                            %
                          </span>
                        </div>
                        <Progress
                          value={
                            batter.projections.homeRunProbability * 100 * 3
                          }
                          className="h-1.5"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between text-xs mb-0.5">
                          <span className="text-muted-foreground">SB:</span>
                          <span>
                            {(
                              batter.projections.stolenBaseProbability * 100
                            ).toFixed(1)}
                            %
                          </span>
                        </div>
                        <Progress
                          value={
                            batter.projections.stolenBaseProbability * 100 * 3
                          }
                          className="h-1.5"
                        />
                      </div>
                    </div>
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
        </div>
      )}
    </div>
  );
}

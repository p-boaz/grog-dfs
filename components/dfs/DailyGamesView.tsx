"use client";

import { Card, CardContent } from "@/components/ui/card";
import { MLBScheduleResponse } from "@/lib/mlb/types/core";
import { useDFSData } from "@/lib/hooks/useDFSData";
import { useEffect, useState } from "react";
import { GameCard } from "./GameCard";

interface DailyGamesViewProps {
  date: string;
}

export function DailyGamesView({ date }: DailyGamesViewProps) {
  // Use the shared DFS data hook to get games
  const { data, loading, error } = useDFSData(date);

  // Extract games from the DFS data response
  const games = data?.games || [];

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 flex justify-center items-center h-48">
          <div className="animate-pulse text-center space-y-4">
            <div className="h-6 w-32 bg-muted rounded mx-auto"></div>
            <div className="h-4 w-48 bg-muted rounded mx-auto"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-destructive">
            <p>Error loading games</p>
            <p className="text-sm text-muted-foreground mt-2">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (games.length === 0) {
    // Fallback to API call if no games in DFS data
    return (
      <FallbackScheduleView date={date} />
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {games.map((game) => (
        <GameCard key={game.gamePk} game={game} />
      ))}
    </div>
  );
}

// Fallback component that uses the original API call if the DFS data doesn't include games
function FallbackScheduleView({ date }: { date: string }) {
  const [games, setGames] = useState<MLBScheduleResponse["dates"][0]["games"]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchGames() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/mlb/schedule?date=${date}`);

        if (!response.ok) {
          throw new Error(`Failed to fetch games: ${response.statusText}`);
        }

        const data: MLBScheduleResponse = await response.json();

        if (data.dates && data.dates.length > 0 && data.dates[0].games) {
          setGames(data.dates[0].games);
        } else {
          setGames([]);
        }
      } catch (err) {
        console.error("Error fetching games:", err);
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
      } finally {
        setLoading(false);
      }
    }

    fetchGames();
  }, [date]);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 flex justify-center items-center h-48">
          <div className="animate-pulse text-center space-y-4">
            <div className="h-6 w-32 bg-muted rounded mx-auto"></div>
            <div className="h-4 w-48 bg-muted rounded mx-auto"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-destructive">
            <p>Error loading games</p>
            <p className="text-sm text-muted-foreground mt-2">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (games.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <p>No games scheduled for this date</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {games.map((game) => (
        <GameCard key={game.gamePk} game={game} />
      ))}
    </div>
  );
}

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format, parseISO } from "date-fns";
import { Clock, MapPin } from "lucide-react";
import Image from "next/image";

interface GameCardProps {
  game: {
    gamePk: number;
    gameDate: string;
    status: {
      abstractGameState?: string;
      detailedState?: string;
      statusCode?: string;
    };
    teams: {
      away: {
        team: {
          id: number;
          name: string;
        };
        probablePitcher?: {
          id: number;
          fullName: string;
        };
      };
      home: {
        team: {
          id: number;
          name: string;
        };
        probablePitcher?: {
          id: number;
          fullName: string;
        };
      };
    };
    venue: {
      id: number;
      name: string;
    };
  };
}

export function GameCard({ game }: GameCardProps) {
  // Format game time
  const gameTime = format(parseISO(game.gameDate), "h:mm a");

  // Determine game status badge color
  const getStatusBadge = () => {
    if (!game.status.abstractGameState) return null;

    switch (game.status.abstractGameState.toLowerCase()) {
      case "preview":
        return (
          <Badge variant="outline">
            {game.status.detailedState || "Scheduled"}
          </Badge>
        );
      case "live":
        return (
          <Badge variant="secondary">
            {game.status.detailedState || "In Progress"}
          </Badge>
        );
      case "final":
        return <Badge>{game.status.detailedState || "Final"}</Badge>;
      default:
        return (
          <Badge variant="outline">
            {game.status.detailedState || game.status.abstractGameState}
          </Badge>
        );
    }
  };

  // Get team logo URL by team ID
  const getTeamLogoUrl = (teamId: number) => {
    return `https://www.mlbstatic.com/team-logos/${teamId}.svg`;
  };

  return (
    <Card className="h-full">
      <CardHeader className="p-4 pb-2 flex flex-row justify-between items-start">
        <div>
          <h3 className="text-sm font-medium">
            {game.teams.away.team.name} @ {game.teams.home.team.name}
          </h3>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="relative w-8 h-8 mr-2">
                <Image
                  src={getTeamLogoUrl(game.teams.away.team.id)}
                  alt={game.teams.away.team.name}
                  width={32}
                  height={32}
                  className="object-contain"
                />
              </div>
              <div className="text-sm font-medium">
                {game.teams.away.team.name}
              </div>
            </div>
          </div>

          {game.teams.away.probablePitcher && (
            <div className="text-sm flex justify-between pl-10">
              <div className="text-muted-foreground">Pitcher:</div>
              <div>{game.teams.away.probablePitcher.fullName}</div>
            </div>
          )}

          <div className="h-px bg-border my-2"></div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="relative w-8 h-8 mr-2">
                <Image
                  src={getTeamLogoUrl(game.teams.home.team.id)}
                  alt={game.teams.home.team.name}
                  width={32}
                  height={32}
                  className="object-contain"
                />
              </div>
              <div className="text-sm font-medium">
                {game.teams.home.team.name}
              </div>
            </div>
          </div>

          {game.teams.home.probablePitcher && (
            <div className="text-sm flex justify-between pl-10">
              <div className="text-muted-foreground">Pitcher:</div>
              <div>{game.teams.home.probablePitcher.fullName}</div>
            </div>
          )}

          <div className="h-px bg-border my-2"></div>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center">
              <Clock className="mr-1 h-3 w-3" />
              <span>{gameTime}</span>
            </div>
            <div className="flex items-center">
              <MapPin className="mr-1 h-3 w-3" />
              <span>{game.venue.name}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

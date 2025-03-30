import { Card, CardContent } from "@/components/ui/card";
import { Wind, Thermometer } from "lucide-react";

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

export function EnvironmentInfo({
  environment,
  ballparkFactors,
}: EnvironmentInfoProps) {
  return (
    <Card className="bg-muted">
      <CardContent className="p-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <Thermometer className="h-4 w-4 mr-2" />
            <span>{environment.temperature}°F</span>
          </div>

          {environment.isOutdoor && (
            <div className="flex items-center">
              <Wind className="h-4 w-4 mr-2" />
              <span>
                {environment.windSpeed} mph {environment.windDirection}
              </span>
            </div>
          )}

          <div className="text-sm">
            <span className="font-medium">Park Factors: </span>
            <span>HR {(ballparkFactors.homeRuns * 100).toFixed(0)}</span>
            {ballparkFactors.runs && (
              <span className="ml-2">
                Runs {(ballparkFactors.runs * 100).toFixed(0)}
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

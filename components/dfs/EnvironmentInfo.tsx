import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Wind, Thermometer, Droplets, ArrowDown, ArrowUp } from "lucide-react";

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
  // Convert park factors from decimal to percentage differences from average (100)
  const homeRunFactor = Math.round((ballparkFactors.homeRuns - 1) * 100);
  const runFactor = ballparkFactors.runs ? Math.round((ballparkFactors.runs - 1) * 100) : null;
  const overallFactor = Math.round((ballparkFactors.overall - 1) * 100);

  // Determine if weather is favorable or not
  const isTempFavorable = environment.temperature >= 75; // Higher temps generally better for hitters
  const isWindFavorable = environment.isOutdoor && 
    (environment.windDirection === "OUT" || 
     environment.windDirection === "S" || 
     environment.windDirection === "SW" || 
     environment.windDirection === "SE") && 
    environment.windSpeed >= 8;

  return (
    <Card className="bg-muted">
      <CardContent className="p-2">
        <div className="flex flex-col space-y-2">
          {/* Temperature info */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Thermometer className="h-3.5 w-3.5 mr-1.5" />
              <span className="text-sm">{environment.temperature}°F</span>
            </div>
            
            {isTempFavorable && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Badge variant="outline" className="h-5 px-1 text-xs">
                      <ArrowUp className="h-3 w-3 text-green-500 mr-0.5" />
                      Hitter
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Warm temperatures favor hitters</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>

          {/* Wind info - only show if outdoor */}
          {environment.isOutdoor && (
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Wind className="h-3.5 w-3.5 mr-1.5" />
                <span className="text-sm">
                  {environment.windSpeed} mph {environment.windDirection}
                </span>
              </div>
              
              {isWindFavorable && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Badge variant="outline" className="h-5 px-1 text-xs">
                        <ArrowUp className="h-3 w-3 text-green-500 mr-0.5" />
                        HR
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Wind direction favors home runs</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          )}

          {/* Park factors */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <span className="flex items-center text-xs">
                      <span className="font-medium">HR</span>
                      <span className={`ml-1 ${homeRunFactor > 0 ? 'text-green-500' : homeRunFactor < 0 ? 'text-red-500' : ''}`}>
                        {homeRunFactor > 0 ? '+' : ''}{homeRunFactor}%
                      </span>
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Park factor for home runs relative to average</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {runFactor !== null && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <span className="flex items-center text-xs">
                        <span className="font-medium">Runs</span>
                        <span className={`ml-1 ${runFactor > 0 ? 'text-green-500' : runFactor < 0 ? 'text-red-500' : ''}`}>
                          {runFactor > 0 ? '+' : ''}{runFactor}%
                        </span>
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Park factor for runs relative to average</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>

            {!environment.isOutdoor && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Badge variant="outline" className="h-5 px-1 text-xs">
                      Indoor
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Indoor stadium (no weather effects)</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
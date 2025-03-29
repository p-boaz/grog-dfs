// Map of MLB team names to their abbreviations
export const MLB_TEAM_ABBREV_MAP: Record<string, string> = {
  "Arizona Diamondbacks": "ARI",
  "Atlanta Braves": "ATL",
  "Baltimore Orioles": "BAL",
  "Boston Red Sox": "BOS",
  "Chicago Cubs": "CHC",
  "Chicago White Sox": "CWS",
  "Cincinnati Reds": "CIN",
  "Cleveland Guardians": "CLE",
  "Colorado Rockies": "COL",
  "Detroit Tigers": "DET",
  "Houston Astros": "HOU",
  "Kansas City Royals": "KC",
  "Los Angeles Angels": "LAA",
  "Los Angeles Dodgers": "LAD",
  "Miami Marlins": "MIA",
  "Milwaukee Brewers": "MIL",
  "Minnesota Twins": "MIN",
  "New York Mets": "NYM",
  "New York Yankees": "NYY",
  "Oakland Athletics": "OAK",
  "Philadelphia Phillies": "PHI",
  "Pittsburgh Pirates": "PIT",
  "San Diego Padres": "SD",
  "San Francisco Giants": "SF",
  "Seattle Mariners": "SEA",
  "St. Louis Cardinals": "STL",
  "Tampa Bay Rays": "TB",
  "Texas Rangers": "TEX",
  "Toronto Blue Jays": "TOR",
  "Washington Nationals": "WSH",
};

// Map of MLB team abbreviations to their full names
export const MLB_TEAM_NAME_MAP: Record<string, string> = Object.entries(
  MLB_TEAM_ABBREV_MAP
).reduce((acc, [name, abbrev]) => {
  acc[abbrev] = name;
  return acc;
}, {} as Record<string, string>);

// Function to get team abbreviation from full name
export function getTeamAbbrev(teamName: string): string {
  return MLB_TEAM_ABBREV_MAP[teamName] || teamName;
}

// Function to get full team name from abbreviation
export function getTeamName(teamAbbrev: string): string {
  return MLB_TEAM_NAME_MAP[teamAbbrev] || teamAbbrev;
}

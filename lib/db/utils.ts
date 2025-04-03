/**
 * Database utility functions
 * 
 * This file contains helper functions for common database operations.
 */

import { db, client } from './drizzle';
import { sql } from 'drizzle-orm';
import { MLBGameStatus, mlbGames, mlbPlayers } from './schema';

/**
 * Format a date for PostgreSQL (YYYY-MM-DD format)
 */
export function formatDateForDb(date: Date | string): string {
  if (typeof date === 'string') {
    // If already a string, make sure it's in the right format
    return date.split('T')[0]; // Just take the YYYY-MM-DD part
  }
  
  // Format a date object as YYYY-MM-DD
  return date.toISOString().split('T')[0];
}

/**
 * Check if the database is connected and accessible
 */
export async function checkDbConnection(): Promise<boolean> {
  try {
    // Try a simple query
    await db.select({ now: sql`now()` }).limit(1);
    return true;
  } catch (error) {
    console.error('Database connection check failed:', error);
    return false;
  }
}

/**
 * Get the count of records in a table
 */
export async function getTableCount(tableName: string): Promise<number> {
  try {
    const result = await db.execute(sql`SELECT COUNT(*) FROM ${sql.identifier(tableName)}`);
    return parseInt(result[0].count, 10);
  } catch (error) {
    console.error(`Error getting count from ${tableName}:`, error);
    return 0;
  }
}

/**
 * Check if there is data for a specific date
 */
export async function hasDataForDate(date: Date | string): Promise<boolean> {
  try {
    const formattedDate = formatDateForDb(date);
    
    // Check if there are any games for this date
    const games = await db.select({ count: sql`count(*)` })
      .from(mlbGames)
      .where(sql`game_date = ${formattedDate}`);
    
    return parseInt(games[0].count, 10) > 0;
  } catch (error) {
    console.error('Error checking for data on date:', error);
    return false;
  }
}

/**
 * Get all distinct teams in the database
 */
export async function getAllTeams(): Promise<{id: number, name: string}[]> {
  try {
    // Get unique teams from the players table
    const teams = await db.select({
      id: mlbPlayers.teamId,
      name: mlbPlayers.team
    })
    .from(mlbPlayers)
    .where(sql`team_id IS NOT NULL AND team IS NOT NULL`)
    .groupBy(mlbPlayers.teamId, mlbPlayers.team);
    
    return teams;
  } catch (error) {
    console.error('Error getting teams:', error);
    return [];
  }
}

/**
 * Get all MLB games between two dates
 */
export async function getGamesBetweenDates(
  startDate: Date | string, 
  endDate: Date | string
): Promise<typeof mlbGames.$inferSelect[]> {
  try {
    const start = formatDateForDb(startDate);
    const end = formatDateForDb(endDate);
    
    return await db.select().from(mlbGames)
      .where(sql`game_date BETWEEN ${start} AND ${end}`)
      .orderBy(mlbGames.gameDate, mlbGames.gameTime);
  } catch (error) {
    console.error('Error getting games between dates:', error);
    return [];
  }
}

/**
 * Get games with a specific status (LIVE, SCHEDULED, etc.)
 */
export async function getGamesByStatus(status: MLBGameStatus): Promise<typeof mlbGames.$inferSelect[]> {
  try {
    return await db.select().from(mlbGames)
      .where(sql`status = ${status}`)
      .orderBy(mlbGames.gameDate, mlbGames.gameTime);
  } catch (error) {
    console.error('Error getting games by status:', error);
    return [];
  }
}

/**
 * Get all MLB games for a specific team
 */
export async function getGamesByTeam(teamId: number): Promise<typeof mlbGames.$inferSelect[]> {
  try {
    return await db.select().from(mlbGames)
      .where(sql`home_team_id = ${teamId} OR away_team_id = ${teamId}`)
      .orderBy(mlbGames.gameDate, mlbGames.gameTime);
  } catch (error) {
    console.error('Error getting games for team:', error);
    return [];
  }
}

/**
 * Close the database connection
 */
export async function closeDbConnection(): Promise<void> {
  try {
    await client.end();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error closing database connection:', error);
  }
}
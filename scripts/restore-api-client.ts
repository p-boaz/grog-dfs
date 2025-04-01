/**
 * API Client Restore Tool
 *
 * Restores the original API client if the capture process is interrupted
 * or fails to complete properly.
 *
 * Usage:
 * pnpm tsx scripts/restore-api-client.ts
 */

import fs from "fs";
import path from "path";

const MLB_API_CLIENT_PATH = path.resolve(
  __dirname,
  "../lib/mlb/core/api-client.ts"
);
const BACKUP_CLIENT_PATH = `${MLB_API_CLIENT_PATH}.backup`;

function restoreApiClient() {
  try {
    if (fs.existsSync(BACKUP_CLIENT_PATH)) {
      console.log(`Restoring original API client from backup...`);
      fs.copyFileSync(BACKUP_CLIENT_PATH, MLB_API_CLIENT_PATH);
      fs.unlinkSync(BACKUP_CLIENT_PATH);
      console.log(`Original API client successfully restored.`);
    } else {
      console.log(`No backup found at ${BACKUP_CLIENT_PATH}`);
      console.log(
        `The API client was either not modified or the backup was already removed.`
      );
    }
  } catch (error) {
    console.error(`Error restoring API client:`, error);
  }
}

restoreApiClient();

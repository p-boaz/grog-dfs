import fs from "fs";
import path from "path";

/**
 * Save data to a JSON file in the data directory
 * @param filename The name of the file to save
 * @param data The data to save
 * @param subdirectory Optional subdirectory within the data directory
 */
export async function saveToJsonFile(
  filename: string,
  data: any,
  subdirectory?: string
): Promise<void> {
  try {
    // Create base data directory if it doesn't exist
    const dataDir = path.join(process.cwd(), "data");
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir);
    }

    // If subdirectory is specified, create it within data directory
    const targetDir = subdirectory ? path.join(dataDir, subdirectory) : dataDir;

    if (subdirectory && !fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    // Save to JSON file
    const filePath = path.join(targetDir, filename);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

    console.log(`Data saved to: ${filePath}`);
  } catch (error) {
    console.error(`Error saving data to ${filename}:`, error);
    throw error;
  }
}

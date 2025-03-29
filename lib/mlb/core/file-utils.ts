import fs from "fs";
import path from "path";

/**
 * Save data to a JSON file in the data directory
 */
export async function saveToJsonFile(
  filename: string,
  data: any
): Promise<void> {
  try {
    // Create data directory if it doesn't exist
    const dataDir = path.join(process.cwd(), "data");
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir);
    }

    // Save to JSON file
    const filePath = path.join(dataDir, filename);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

    console.log(`Data saved to: ${filePath}`);
  } catch (error) {
    console.error(`Error saving data to ${filename}:`, error);
    throw error;
  }
}

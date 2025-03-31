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

/**
 * Create a write stream for logging console output
 * @param filename The name of the log file
 * @param subdirectory Optional subdirectory within the data directory
 * @returns Object containing the write stream and path to the log file
 */
export function createLogStream(filename: string, subdirectory?: string) {
  const dataDir = path.join(process.cwd(), "data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
  }

  const targetDir = subdirectory ? path.join(dataDir, subdirectory) : dataDir;
  if (subdirectory && !fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const logPath = path.join(targetDir, filename);
  const stream = fs.createWriteStream(logPath, { flags: "w" });

  return { stream, logPath };
}

/**
 * Capture console output and save it to a file while also printing to console
 * @param stream The write stream to save output to
 * @returns Function to restore original console methods
 */
export function captureConsoleOutput(stream: fs.WriteStream) {
  const originalConsole = {
    log: console.log,
    error: console.error,
    warn: console.warn,
  };

  // Wrap console methods to both log to file and console
  console.log = (...args) => {
    const message = args
      .map((arg) =>
        typeof arg === "object" ? JSON.stringify(arg, null, 2) : arg
      )
      .join(" ");
    stream.write(message + "\n");
    originalConsole.log(...args);
  };

  console.error = (...args) => {
    const message = args
      .map((arg) =>
        typeof arg === "object" ? JSON.stringify(arg, null, 2) : arg
      )
      .join(" ");
    stream.write("[ERROR] " + message + "\n");
    originalConsole.error(...args);
  };

  console.warn = (...args) => {
    const message = args
      .map((arg) =>
        typeof arg === "object" ? JSON.stringify(arg, null, 2) : arg
      )
      .join(" ");
    stream.write("[WARN] " + message + "\n");
    originalConsole.warn(...args);
  };

  // Return function to restore original console
  return () => {
    console.log = originalConsole.log;
    console.error = originalConsole.error;
    console.warn = originalConsole.warn;
    stream.end();
  };
}

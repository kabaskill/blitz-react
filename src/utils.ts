import fs from "fs-extra";
import path from "path";
import { exec, execSync } from "child_process";
import { UserOptions } from "./types.js";
import { getDependencies } from "./config.js";
import pc from "picocolors";
import { promisify } from "util";

const execAsync = promisify(exec);

// Replace initializeGit function
export async function initializeGit(targetDir: string): Promise<void> {
  console.log(pc.blue("\nInitializing git repository..."));
  try {
    await execAsync('git init', { cwd: targetDir });
    await execAsync('git add .', { cwd: targetDir });
    await execAsync('git commit -m "Initial commit from create-minimalist-app"', { cwd: targetDir });
    console.log(pc.green("Git repository initialized successfully!"));
  } catch (error) {
    console.warn(pc.yellow("Warning: Git initialization failed. You can initialize git manually."));
    console.log(pc.dim(`Error details: ${error instanceof Error ? error.message : String(error)}`));
  }
}

export async function installDependencies(targetDir: string, options: UserOptions): Promise<void> {
  console.log(pc.blue("\nInstalling dependencies..."));
  
  try {
    // Get dependencies based on the selected template
    const { dependencies, devDependencies } = await getDependencies(options.template);
    
    if (Object.keys(dependencies).length === 0 && Object.keys(devDependencies).length === 0) {
      console.log(pc.yellow("No dependencies to install."));
      return;
    }
    
    // Show what's being installed
    console.log(pc.dim("Installing packages:"));
    if (Object.keys(dependencies).length > 0) {
      console.log(pc.dim("- Dependencies: " + Object.keys(dependencies).join(", ")));
    } else {
      console.log(pc.dim("- Dependencies: none"));
    }
    
    if (Object.keys(devDependencies).length > 0) {
      console.log(pc.dim("- Dev dependencies: " + Object.keys(devDependencies).join(", ")));
    } else {
      console.log(pc.dim("- Dev dependencies: none"));
    }
    
    // Set a timeout for the installation process
    const timeoutMs = 180000; // 3 minutes
    const installPromise = execAsync('npm install', { 
      cwd: targetDir,
      timeout: timeoutMs
    });
    
    // Provide some visual feedback during installation
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      process.stdout.write(`\r${pc.blue('Installing packages...')} ${elapsed}s elapsed`);
    }, 1000);
    
    try {
      await installPromise;
      clearInterval(interval);
      process.stdout.write('\r' + ' '.repeat(50) + '\r'); // Clear the line
      console.log(pc.green("✓ Dependencies installed successfully!"));
    } catch (error) {
      clearInterval(interval);
      process.stdout.write('\r' + ' '.repeat(50) + '\r'); // Clear the line
      
      if (error instanceof Error && error.message.includes('Timed out')) {
        throw new Error(`Installation timed out after ${timeoutMs/1000} seconds. Try installing manually with 'npm install'.`);
      }
      throw new Error(`Failed to install dependencies: ${error instanceof Error ? error.message : String(error)}`);
    }
  } catch (error) {
    throw new Error(`Failed to install dependencies: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export function ensureDirectoryExistence(filePath: string): void {
  const dirname = path.dirname(filePath);
  if (fs.existsSync(dirname)) {
    return;
  }
  fs.mkdirSync(dirname, { recursive: true });
}

export function validateProjectName(name: string): { valid: boolean; message?: string } {
  if (!name) {
    return { valid: false, message: "Project name cannot be empty" };
  }
  
  if (name.trim() !== name) {
    return { valid: false, message: "Project name cannot start or end with whitespace" };
  }
  
  if (!/^[a-zA-Z0-9-_]+$/.test(name)) {
    return { valid: false, message: "Project name can only contain alphanumeric characters, hyphens and underscores" };
  }
  
  // Check for npm reserved names and other restrictions
  const reservedNames = ['node_modules', 'favicon.ico', 'test', 'tests', 'dist', 'build'];
  if (reservedNames.includes(name.toLowerCase())) {
    return { valid: false, message: `"${name}" is a reserved name and cannot be used` };
  }
  
  return { valid: true };
}

export async function cleanupFailedProject(targetDir: string): Promise<void> {
  console.log(pc.yellow("\nCleaning up failed project..."));
  try {
    await fs.remove(targetDir);
    console.log(pc.green("Cleanup completed."));
  } catch (error) {
    console.error(pc.red(`Error during cleanup: ${error instanceof Error ? error.message : String(error)}`));
    console.log(pc.yellow(`Please manually remove the directory: ${targetDir}`));
  }
}

export async function checkEnvironment(): Promise<void> {
  try {
    // Check for Node.js version
    const nodeVersion = process.version;
    const minVersion = 'v16.0.0';
    if (compareVersions(nodeVersion, minVersion) < 0) {
      console.warn(pc.yellow(`Warning: You're using Node.js ${nodeVersion}. We recommend at least ${minVersion}.`));
    }

    // Check for Git
    try {
      await execAsync('git --version');
    } catch (error) {
      console.warn(pc.yellow('Warning: Git is not installed or not in PATH. Git initialization will be skipped.'));
    }

    // Check for npm
    try {
      await execAsync('npm --version');
    } catch (error) {
      throw new Error('npm is not installed or not in PATH. Please install npm to use this tool.');
    }
  } catch (error) {
    throw error;
  }
}

// Simple version comparison helper
function compareVersions(a: string, b: string): number {
  const cleanA = a.replace(/^v/, '');
  const cleanB = b.replace(/^v/, '');
  
  const partsA = cleanA.split('.').map(Number);
  const partsB = cleanB.split('.').map(Number);
  
  for (let i = 0; i < Math.max(partsA.length, partsB.length); i++) {
    const numA = partsA[i] || 0;
    const numB = partsB[i] || 0;
    if (numA > numB) return 1;
    if (numA < numB) return -1;
  }
  return 0;
}
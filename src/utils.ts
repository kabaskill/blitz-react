import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import { execSync } from 'child_process';
import { UserOptions } from './types.js';
import { getDependencies } from './config.js';

export function initializeGit(targetDir: string): void {
  try {
    process.chdir(targetDir);
    execSync("git init", { stdio: "ignore" });
    execSync("git add .", { stdio: "ignore" });
    execSync('git commit -m "Initial commit"', { stdio: "ignore" });
    console.log(chalk.green("\nInitialized git repository"));
  } catch (error) {
    console.warn(chalk.yellow("\nFailed to initialize git repository"));
  }
}

export async function installDependencies(targetDir: string, options: UserOptions): Promise<void> {
  console.log(chalk.cyan("\nInstalling dependencies..."));

  const { dependencies, devDependencies } = getDependencies(options.template);

  try {
    process.chdir(targetDir);
    execSync(`npm install ${dependencies.join(" ")}`, { stdio: "inherit" });
    execSync(`npm install -D ${devDependencies.join(" ")}`, { stdio: "inherit" });
  } catch (error) {
    console.error(chalk.red("Failed to install dependencies"), error);
    throw error;
  }
}

export function ensureDirectoryExistence(filePath: string): void {
  const dirname = path.dirname(filePath);
  if (fs.existsSync(dirname)) {
    return;
  }
  fs.mkdirSync(dirname, { recursive: true });
}
#!/usr/bin/env node
import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import { Command } from 'commander';
import inquirer from 'inquirer';
import { execSync } from 'child_process';
import { UserOptions, TemplateType, UserQuestions, UserPromptAnswers } from './types.js';
import { TEMPLATES } from './config.js';
import { generateProject } from './generators.js';

// Create a new program instance
const program = new Command();

async function promptUser(projectName?: string): Promise<UserOptions> {
  const questions: UserQuestions = [
    {
      type: "input",
      name: "projectName",
      message: "What is your project named?",
      default: "my-app",
      when: () => !projectName,
    },
    {
      type: "list",
      name: "template",
      message: "Which template would you like to use?",
      choices: Object.entries(TEMPLATES).map(([key, value]) => ({
        name: value.name,
        value: key,
      })),
    },
    {
      type: "confirm",
      name: "installDeps",
      message: "Would you like to install dependencies?",
      default: true,
    },
    {
      type: "confirm",
      name: "initGit",
      message: "Would you like to initialize a git repository?",
      default: true,
    },
  ];

  const answers = await inquirer.prompt<UserPromptAnswers>(questions);
  return {
    projectName: projectName || answers.projectName || "my-app",
    template: answers.template,
    installDeps: answers.installDeps,
    initGit: answers.initGit,
  };
}

function initializeGit(targetDir: string): void {
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

async function installDependencies(targetDir: string, options: UserOptions): Promise<void> {
  console.log(chalk.cyan("\nInstalling dependencies..."));

  try {
    process.chdir(targetDir);
    execSync(`npm install`, { stdio: "inherit" });
    console.log(chalk.green("\nDependencies installed successfully"));
  } catch (error) {
    console.error(chalk.red("Failed to install dependencies"));
    throw error;
  }
}

async function createProject(options: UserOptions): Promise<void> {
  const targetDir = path.join(process.cwd(), options.projectName);

  try {
    // Check if directory exists
    if (fs.existsSync(targetDir)) {
      console.error(chalk.red(`Error: Directory ${options.projectName} already exists`));
      process.exit(1);
    }

    // Generate project files from templates
    await generateProject(options);

    // Install dependencies if requested
    if (options.installDeps) {
      await installDependencies(targetDir, options);
    }

    // Initialize git if requested
    if (options.initGit) {
      initializeGit(targetDir);
    }

    // Success message
    console.log(chalk.green("\nProject created successfully! 🎉"));
    console.log("\nNext steps:");
    console.log(chalk.cyan(`  cd ${options.projectName}`));

    if (!options.installDeps) {
      console.log(chalk.cyan("  npm install"));
    }

    console.log(chalk.cyan("  npm run dev"));
  } catch (error) {
    console.error(chalk.red("Error creating project:"), error);
    process.exit(1);
  }
}

program
  .name("create-minimalist-app")
  .description("Create a new React project with minimal setup")
  .version("0.1.0")
  .argument("[project-name]")
  .option("-t, --template <template>", "Template to use (react-js, react-ts)")
  .option("--no-install", "Skip installing dependencies")
  .option("--no-git", "Skip git initialization")
  .action(async (projectName, options) => {
    try {
      const userOptions = options.template
        ? {
            projectName: projectName || "my-app",
            template: options.template as TemplateType,
            installDeps: options.install !== false,
            initGit: options.git !== false,
          }
        : await promptUser(projectName);

      await createProject(userOptions);
    } catch (error) {
      console.error(chalk.red("Error:"), error);
      process.exit(1);
    }
  });

program.parse();
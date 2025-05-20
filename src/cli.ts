#!/usr/bin/env node
import fs from "fs-extra";
import path from "path";
import pc from "picocolors";
import { Command } from "commander";
import inquirer from "inquirer";
import { UserOptions, TemplateType, UserQuestions, UserPromptAnswers } from "./types.js";
import { TEMPLATES } from "./config.js";
import { generateProject } from "./generators.js";
import {
  validateProjectName,
  initializeGit,
  installDependencies,
  cleanupFailedProject,
  checkEnvironment,
} from "./utils.js";

const program = new Command();

async function promptUser(projectName?: string): Promise<UserOptions> {
  const questions: UserQuestions = [
    {
      type: "input",
      name: "projectName",
      message: "What is your project named?",
      default: "my-app",
      when: () => !projectName,
      validate: (input: string) => {
        const result = validateProjectName(input);
        return result.valid ? true : result.message || "Invalid project name";
      },
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

async function createProject(options: UserOptions): Promise<void> {
  const targetDir = path.join(process.cwd(), options.projectName);
  let projectCreated = false;

  console.clear();

  console.log(pc.cyan(pc.bold("====================================")));
  console.log(pc.cyan(pc.bold("   ⚡    Blitz React   ⚡    ")));
  console.log(pc.cyan(pc.bold("====================================")));
  console.log("");
  console.log(pc.white("Let's set up your new project!\n"));

  try {
    if (fs.existsSync(targetDir)) {
      console.error(pc.red(`Error: Directory ${options.projectName} already exists`));
      process.exit(1);
    }

    await generateProject(options);
    projectCreated = true;

    if (options.installDeps) {
      // installDependencies now handles its own cleanup on failure
      await installDependencies(targetDir, options);
    }

    if (options.initGit) {
      await initializeGit(targetDir); // This already handles its own errors
    }

    console.log(pc.green("\nProject created successfully! 🎉"));
    console.log("\nNext steps:");
    console.log(pc.cyan(`  cd ${options.projectName}`));

    if (!options.installDeps) {
      console.log(pc.cyan("  npm install"));
    }

    console.log(pc.cyan("  npm run dev"));
  } catch (error) {
    console.error(pc.red("Error creating project:"), error);

    if (projectCreated) {
      console.log(pc.yellow("\nProject was partially created."));
      const { shouldCleanup } = await inquirer.prompt<{ shouldCleanup: boolean }>([
        {
          type: "confirm",
          name: "shouldCleanup",
          message: "Would you like to clean up the partially created project?",
          default: true,
        },
      ]);

      if (shouldCleanup) {
        await cleanupFailedProject(targetDir);
      } else {
        console.log(pc.yellow(`You can manually complete the setup in: ${targetDir}`));
      }
    }
    process.exit(1);
  }
}

program
  .name("blitz-react")
  .description("Create a new React project with minimal setup")
  .version("0.1.0")
  .argument("[project-name]")
  .option("-t, --template <template>", "Template to use (react-js, react-ts)")
  .option("--no-install", "Skip installing dependencies")
  .option("--no-git", "Skip git initialization")
  .action(async (projectName, options) => {
    try {
      await checkEnvironment();

      // Validate project name if provided
      if (projectName) {
        const validation = validateProjectName(projectName);
        if (!validation.valid) {
          console.error(pc.red(`Error: ${validation.message}`));
          process.exit(1);
        }
      }

      // Validate template if provided through CLI
      if (options.template && !Object.keys(TEMPLATES).includes(options.template)) {
        console.error(pc.red(`Error: Template "${options.template}" does not exist.`));
        console.log(pc.cyan("Available templates:"));
        Object.entries(TEMPLATES).forEach(([key, value]) => {
          console.log(`  - ${key} (${value.name})`);
        });
        process.exit(1);
      }

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
      console.error(pc.red("Error:"), error);
      process.exit(1);
    }
  });

program.parse();

#!/usr/bin/env node
import fs from "fs-extra";
import path from "path";
import pc from "picocolors";
import { Command } from "commander";
import inquirer from "inquirer";
import { UserOptions, TemplateType, UserQuestions, UserPromptAnswers } from "./types.js";
import { TEMPLATES } from "./config.js";
import { generateProject } from "./generators.js";
import { initializeGit, installDependencies } from "./utils.js";

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

async function createProject(options: UserOptions): Promise<void> {
  const targetDir = path.join(process.cwd(), options.projectName);

  console.clear();

  console.log(pc.cyan(pc.bold("====================================")));
  console.log(pc.cyan(pc.bold("  Create Minimalist App")));
  console.log(pc.cyan(pc.bold("====================================")));
  console.log("");
  console.log(pc.white("Let's set up your new project!\n"));

  try {
    if (fs.existsSync(targetDir)) {
      console.error(pc.red(`Error: Directory ${options.projectName} already exists`));
      process.exit(1);
    }

    await generateProject(options);

    if (options.installDeps) {
      await installDependencies(targetDir, options);
    }

    if (options.initGit) {
      initializeGit(targetDir);
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
      console.error(pc.red("Error:"), error);
      process.exit(1);
    }
  });

program.parse();

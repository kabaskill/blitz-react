#!/usr/bin/env node
import { program } from "commander";
import inquirer from "inquirer";
import fs from "fs-extra";
import path, { dirname } from "path";
import chalk from "chalk";
import { execSync } from "child_process";
import { fileURLToPath } from "url";
import {
  TemplateConfig,
  UserOptions,
  UserPromptAnswers,
  TemplateType,
  UserQuestions,
} from "./types";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const TEMPLATES: Record<TemplateType, TemplateConfig> = {
  "react-js": {
    name: "React (JavaScript)",
    directory: "minimalist-react-js",
    dependencies: {
      install: ["npm install"],
      start: ["npm run dev"],
    },
  },
  "react-ts": {
    name: "React (TypeScript)",
    directory: "minimalist-react-ts",
    dependencies: {
      install: ["npm install"],
      start: ["npm run dev"],
    },
  },
};

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

  const answers = await inquirer.prompt<UserPromptAnswers>(questions as any);
  return {
    projectName: projectName || answers.projectName || "my-app",
    template: answers.template,
    installDeps: answers.installDeps,
    initGit: answers.initGit,
  };
}

async function installDependencies(targetDir: string, options: UserOptions): Promise<void> {
  console.log(chalk.cyan("\nInstalling dependencies..."));

  // Core React dependencies
  const dependencies = ["react@^latest", "react-dom@^latest", "tailwindcss", "@tailwindcss/vite"];

  // Dev dependencies
  const devDependencies = ["@vitejs/plugin-react", "vite"];

  if (options.template === "react-ts") {
    devDependencies.push("typescript", "@types/react", "@types/react-dom");
  }

  try {
    process.chdir(targetDir);
    execSync(`npm install ${dependencies.join(" ")}`, { stdio: "inherit" });
    execSync(`npm install -D ${devDependencies.join(" ")}`, { stdio: "inherit" });
  } catch (error) {
    console.error(chalk.red("Failed to install dependencies"), error);
    throw error;
  }
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

async function createProject(options: UserOptions): Promise<void> {
  const templateConfig = TEMPLATES[options.template];
  const templateDir = path.join(__dirname, "..", templateConfig.directory);
  const targetDir = path.join(process.cwd(), options.projectName);

  try {
    // Check if directory exists
    if (fs.existsSync(targetDir)) {
      console.error(chalk.red(`Error: Directory ${options.projectName} already exists`));
      process.exit(1);
    }

    // Copy template
    await fs.copy(templateDir, targetDir);

    // Update package.json
    const packageJsonPath = path.join(targetDir, "package.json");
    const packageJson = await fs.readJson(packageJsonPath);
    packageJson.name = options.projectName;
    await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });

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
            installDeps: options.install,
            initGit: options.git,
          }
        : await promptUser(projectName);

      await createProject(userOptions);
    } catch (error) {
      console.error(chalk.red("Error:"), error);
      process.exit(1);
    }
  });

program.parse();

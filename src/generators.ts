import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import Handlebars from "handlebars";
import pc from "picocolors";
import { UserOptions } from "./types.js";
import { getDependencies, getLatestVersion } from "./config.js";
import { ensureDirectoryExistence } from "./utils.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const TEMPLATE_DIR = path.resolve(__dirname, "..", "templates");

export async function generateProject(options: UserOptions): Promise<void> {
  const targetDir = path.join(process.cwd(), options.projectName);

  await fs.ensureDir(targetDir);

  await generatePackageJson(targetDir, options);

  await generateProjectFiles(targetDir, options);
}

async function generatePackageJson(targetDir: string, options: UserOptions): Promise<void> {
  const { dependencies, devDependencies } = await getDependencies(options.template);

  const templatePath = path.join(TEMPLATE_DIR, "common/package.json.hbs");

  try {
    const templateContent = await fs.readFile(templatePath, "utf8");
    const template = Handlebars.compile(templateContent);

    // Convert dependency objects to arrays of package names
    const packageJson = template({
      projectName: options.projectName,
      dependencies: Object.keys(dependencies),
      devDependencies: Object.keys(devDependencies),
      isTypeScript: options.template === "react-ts",
    });

    await fs.writeFile(path.join(targetDir, "package.json"), packageJson);
  } catch (error) {
    console.error(pc.red("Error generating package.json:"), error);
    throw error;
  }
}

export async function generateProjectFiles(targetDir: string, options: UserOptions): Promise<void> {
  const templateBaseDir = path.join(
    TEMPLATE_DIR,
    options.template === "react-ts" ? "react-ts" : "react-js"
  );
  const commonTemplatesDir = path.join(TEMPLATE_DIR, "common");

  const latestVersions = {
    react: await getLatestVersion("react"),
    reactDom: await getLatestVersion("react-dom"),
    tailwindcss: await getLatestVersion("tailwindcss"),
    vite: await getLatestVersion("vite"),
    typescript: options.template === "react-ts" ? await getLatestVersion("typescript") : null,
  };

  try {
    // Add current year for LICENSE template
    const templateData = {
      projectName: options.projectName,
      versions: latestVersions,
      isTypeScript: options.template === "react-ts",
      currentYear: new Date().getFullYear(),
    };

    await processTemplateDirectory(commonTemplatesDir, targetDir, options, templateData);
    await processTemplateDirectory(templateBaseDir, targetDir, options, templateData);
  } catch (error) {
    console.error(pc.red("Error generating project files:"), error);
    throw error;
  }
}

async function processTemplateDirectory(
  sourceDir: string,
  targetDir: string,
  options: UserOptions,
  templateData: Record<string, any>,
  relativePath: string = ""
): Promise<void> {
  try {
    const sourcePath = path.join(sourceDir, relativePath);
    if (!fs.existsSync(sourcePath)) {
      return;
    }

    const entries = await fs.readdir(sourcePath, { withFileTypes: true });

    for (const entry of entries) {
      const entrySourcePath = path.join(sourceDir, relativePath, entry.name);

      let targetFileName = entry.name
        .replace(".hbs", "")
        .replace("__projectname__", options.projectName);

      const targetPath = path.join(targetDir, relativePath, targetFileName);

      if (entry.isDirectory()) {
        await fs.ensureDir(targetPath);
        await processTemplateDirectory(
          sourceDir,
          targetDir,
          options,
          templateData,
          path.join(relativePath, entry.name)
        );
      } else if (entry.name.endsWith(".hbs")) {
        const content = await fs.readFile(entrySourcePath, "utf8");
        const template = Handlebars.compile(content);
        const processedContent = template(templateData);

        ensureDirectoryExistence(targetPath);
        await fs.writeFile(targetPath, processedContent);
      } else {
        ensureDirectoryExistence(targetPath);
        await fs.copy(entrySourcePath, targetPath);
      }
    }
  } catch (error) {
    console.error(
      pc.red(`Error processing template directory: ${sourceDir}/${relativePath}`),
      error
    );
    throw error;
  }
}

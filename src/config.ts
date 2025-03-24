import { TemplateConfig, TemplateType } from "./types.js";
import { promisify } from 'util';
import { exec } from 'child_process';
import pc from "picocolors";

const execAsync = promisify(exec);

export async function getLatestVersion(packageName: string): Promise<string> {
  try {
    const { stdout } = await execAsync(`npm show ${packageName} version`);
    return stdout.trim();
  } catch (error) {
    console.warn(pc.yellow(`Warning: Could not fetch latest version for ${packageName}`));
    return 'latest'; // Fallback to using "latest" tag
  }
}
export const PACKAGES = {
  core: {
    dependencies: ["react", "react-dom"],
    devDependencies: ["vite", "@vitejs/plugin-react", "tailwindcss", "@tailwindcss/vite"],
  },

  typescript: {
    dependencies: [],
    devDependencies: ["typescript", "@types/react", "@types/react-dom"],
  },
};

export const TEMPLATES: Record<TemplateType, TemplateConfig> = {
  "react-js": {
    name: "React (JavaScript)",
    directory: "react-js",
  },
  "react-ts": {
    name: "React (TypeScript)",
    directory: "react-ts",
  },
};

export function getDependencies(template: TemplateType) {
  const dependencies = PACKAGES.core.dependencies.map((pkg) => `${pkg}@${getLatestVersion(pkg)}`);

  const devDependencies = PACKAGES.core.devDependencies.map(
    (pkg) => `${pkg}@${getLatestVersion(pkg)}`
  );

  if (template === "react-ts") {
    PACKAGES.typescript.dependencies.forEach((pkg) => {
      dependencies.push(`${pkg}@${getLatestVersion(pkg)}`);
    });

    PACKAGES.typescript.devDependencies.forEach((pkg) => {
      devDependencies.push(`${pkg}@${getLatestVersion(pkg)}`);
    });
  }

  return { dependencies, devDependencies };
}

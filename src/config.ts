import { execSync } from "child_process";
import { TemplateConfig, TemplateType } from "./types.js";

// Function to get latest version of a package
export function getLatestVersion(packageName: string): string {
  try {
    const version = execSync(`npm view ${packageName} version`).toString().trim();
    return version;
  } catch (error) {
    console.warn(`Couldn't fetch latest version for ${packageName}, using fallback`);
    return "latest"; // Fallback to 'latest' tag
  }
}

// Define packages needed for each template
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

// Get dependencies based on template with latest versions
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

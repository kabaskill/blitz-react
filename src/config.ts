import { TemplateConfig, TemplateType } from "./types.js";
import { promisify } from 'util';
import { exec } from 'child_process';
import pc from "picocolors";

const execAsync = promisify(exec);

const versionCache = new Map<string, string>();

export async function getLatestVersion(packageName: string): Promise<string> {
  // Check cache first
  if (versionCache.has(packageName)) {
    return versionCache.get(packageName)!;
  }
  
  try {
    const { stdout } = await execAsync(`npm show ${packageName} version`);
    const version = stdout.trim();
    // Cache the result
    versionCache.set(packageName, version);
    return version;
  } catch (error) {
    console.warn(pc.yellow(`Warning: Could not fetch latest version for ${packageName}`));
    return 'latest';
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

export async function getDependencies(template: TemplateType) {
  // Create a function to get package with version
  async function getPackageWithVersion(pkg: string) {
    const version = await getLatestVersion(pkg);
    return `${pkg}@${version}`;
  }

  // Get core dependencies
  const dependencyPromises = PACKAGES.core.dependencies.map(getPackageWithVersion);
  const devDependencyPromises = PACKAGES.core.devDependencies.map(getPackageWithVersion);

  // Add TypeScript dependencies if needed
  if (template === "react-ts") {
    PACKAGES.typescript.dependencies.forEach((pkg) => {
      dependencyPromises.push(getPackageWithVersion(pkg));
    });

    PACKAGES.typescript.devDependencies.forEach((pkg) => {
      devDependencyPromises.push(getPackageWithVersion(pkg));
    });
  }

  // Wait for all promises to resolve
  const dependencies = await Promise.all(dependencyPromises);
  const devDependencies = await Promise.all(devDependencyPromises);

  // Create an object with package names as keys and versions as values
  const dependencyMap = Object.fromEntries(
    dependencies.map(dep => {
      const [name, version] = dep.split('@');
      return [name, version];
    })
  );

  const devDependencyMap = Object.fromEntries(
    devDependencies.map(dep => {
      const [name, version] = dep.split('@');
      return [name, version];
    })
  );

  return { dependencies: dependencyMap, devDependencies: devDependencyMap };
}
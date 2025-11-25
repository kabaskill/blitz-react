import { TemplateConfig, TemplateType } from "./types.js";
import { promisify } from "util";
import { exec } from "child_process";
import pc from "picocolors";

const execAsync = promisify(exec);

const versionCache = new Map<string, string>();

export async function getLatestVersion(packageName: string): Promise<string> {
  // Check cache first
  if (versionCache.has(packageName)) {
    return versionCache.get(packageName)!;
  }

  try {
    // Use npm view with json output to ensure we get the latest version
    // and bypass potential cache issues
    const { stdout } = await execAsync(
      `npm view ${packageName} version --json 2>/dev/null || npm show ${packageName} version`
    );
    let version = stdout.trim();
    
    // Remove quotes if present (json output may include quotes)
    version = version.replace(/^"(.*)"$/, "$1");
    
    // Validate that we got a valid semantic version
    if (!version || version === "latest" || !version.match(/^\d+\.\d+\.\d+/)) {
      // Fallback: Try to get the dist-tags latest version
      try {
        const { stdout: tagOutput } = await execAsync(
          `npm view ${packageName} dist-tags.latest`
        );
        version = tagOutput.trim();
      } catch {
        console.warn(pc.yellow(`Warning: Could not fetch latest version for ${packageName}`));
        return "latest";
      }
    }
    
    // Cache the result
    versionCache.set(packageName, version);
    return version;
  } catch (error) {
    console.warn(pc.yellow(`Warning: Could not fetch latest version for ${packageName}`));
    return "latest";
  }
}

export const PACKAGES = {
  core: {
    dependencies: ["react", "react-dom", "clsx", "tailwind-merge"],
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
    dependencies.map((dep) => {
      const lastAtIndex = dep.lastIndexOf("@");
      const name = dep.substring(0, lastAtIndex);
      const version = dep.substring(lastAtIndex + 1);
      return [name, version];
    })
  );

  const devDependencyMap = Object.fromEntries(
    devDependencies.map((dep) => {
      const lastAtIndex = dep.lastIndexOf("@");
      const name = dep.substring(0, lastAtIndex);
      const version = dep.substring(lastAtIndex + 1);
      return [name, version];
    })
  );

  return { dependencies: dependencyMap, devDependencies: devDependencyMap };
}

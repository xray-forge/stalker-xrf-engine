import * as fsp from "node:fs/promises";
import * as path from "node:path";

/**
 * Get declaration source files eligible for extern parsing.
 *
 * @param directory - Declarations directory to scan.
 * @returns Sorted TypeScript source paths, excluding test sources.
 */
export async function getExternSourceFiles(directory: string): Promise<Array<string>> {
  const files: Array<string> = [];

  async function collect(current: string): Promise<void> {
    const entries = await fsp.readdir(current, { withFileTypes: true });

    await Promise.all(
      entries.map(async (entry) => {
        const item: string = path.resolve(current, entry.name);

        if (entry.isDirectory()) {
          if (entry.name !== "__test__") {
            await collect(item);
          }
        } else if (
          entry.isFile() &&
          entry.name.endsWith(".ts") &&
          !entry.name.endsWith(".test.ts") &&
          !entry.name.endsWith(".spec.ts")
        ) {
          files.push(item);
        }
      })
    );
  }

  await collect(directory);

  return files.sort((left: string, right: string): number => left.localeCompare(right));
}

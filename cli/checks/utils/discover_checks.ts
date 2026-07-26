import * as fs from "node:fs";
import * as path from "node:path";

import { GAME_DATA_CHECKS_DIR } from "#/globals/paths";

/**
 * Suffix marking a file as a runnable check. Files without it are treated as shared helpers
 * and get no launcher.
 */
export const CHECK_SUFFIX: string = ".check.ts";

/**
 * Prefix of generated launcher scripts. Also the marker `checks clean` matches them by.
 */
export const LAUNCHER_PREFIX: string = "check_";

/**
 * Descriptor of a single discovered check.
 */
export interface ICheckDescriptor {
  /** Source file, absolute. */
  source: string;
  /** Path relative to the checks root, posix separators, e.g. `configs/condlists.check.ts`. */
  relative: string;
  /** Emitted script path relative to the checks output dir, e.g. `configs/condlists_check.script`. */
  emitted: string;
  /** Lua module name the transpiler emits, e.g. `checks.configs.condlists_check`. */
  module: string;
  /** Generated launcher file name, e.g. `check_configs_condlists.script`. */
  launcher: string;
  /** Console command to run it. */
  command: string;
}

/**
 * Walk a directory collecting files that satisfy the filter.
 */
function walk(dir: string, filter: (name: string) => boolean, acc: Array<string> = []): Array<string> {
  let entries: Array<fs.Dirent>;

  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return acc;
  }

  for (const entry of entries) {
    const full: string = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      walk(full, filter, acc);
    } else if (filter(entry.name)) {
      acc.push(full);
    }
  }

  return acc;
}

/**
 * Discover checks and derive their module and launcher names.
 *
 * The nested source layout is flattened into launcher names because `run_script` resolves its
 * argument as a single file directly under `$game_scripts$` and cannot descend into directories.
 *
 * @returns List of check descriptors, sorted by relative path.
 */
export function discoverChecks(): Array<ICheckDescriptor> {
  const sources: Array<string> = walk(GAME_DATA_CHECKS_DIR, (name) => name.endsWith(CHECK_SUFFIX));

  return sources
    .map((source) => {
      const relative: string = path.relative(GAME_DATA_CHECKS_DIR, source).replace(/\\/g, "/");
      const withoutExtension: string = relative.replace(/\.ts$/, "");
      const identity: string = withoutExtension.replace(/\.check$/, "").replace(/\//g, "_");

      // The transpiler cannot keep dots inside a file name, since a dot separates lua module
      // path segments, so `condlists.check.ts` is emitted as `condlists_check.script`.
      const emitted: string = withoutExtension.replace(/\./g, "_");

      return {
        source,
        relative,
        emitted: `${emitted}.script`,
        module: `checks.${emitted.replace(/\//g, ".")}`,
        launcher: `${LAUNCHER_PREFIX}${identity}.script`,
        command: `run_script ${LAUNCHER_PREFIX}${identity}`,
      };
    })
    .sort((first, second) => first.relative.localeCompare(second.relative));
}

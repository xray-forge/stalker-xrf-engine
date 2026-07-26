import * as fs from "node:fs";
import * as path from "node:path";

import { GAME_DATA_CHECKS_DIR } from "#/globals/paths";

/**
 * The two kinds of runnable artifact, distinguished by source suffix.
 *
 * A check runs to completion in one invocation. A flow is walked one step per invocation, keeping
 * its cursor in the save, so real play can happen in between.
 */
export const CHECK_SUFFIX: string = ".check.ts";
export const FLOW_SUFFIX: string = ".flow.ts";

/**
 * Prefixes of generated launcher scripts. Also the markers `checks clean` matches them by.
 */
export const CHECK_LAUNCHER_PREFIX: string = "check_";
export const FLOW_LAUNCHER_PREFIX: string = "flow_";

/**
 * Every prefix a generated launcher can carry.
 */
export const LAUNCHER_PREFIXES: Array<string> = [CHECK_LAUNCHER_PREFIX, FLOW_LAUNCHER_PREFIX];

/**
 * Descriptor of a single discovered check or flow.
 */
export interface ICheckDescriptor {
  /** Which lifecycle this artifact uses. */
  kind: "check" | "flow";
  /** Source file, absolute. */
  source: string;
  /** Path relative to the checks root, posix separators, e.g. `quests/zat_b29.check.ts`. */
  relative: string;
  /** Emitted script path relative to the checks output dir, e.g. `quests/zat_b29_check.script`. */
  emitted: string;
  /** Lua module name the transpiler emits, e.g. `checks.quests.zat_b29_check`. */
  module: string;
  /** Generated launcher file name, e.g. `check_quests_zat_b29.script`. */
  launcher: string;
  /** Console command to run it. */
  command: string;
  /** Launcher resetting the cursor, flows only. */
  resetLauncher?: string;
  /** Console command resetting the cursor, flows only. */
  resetCommand?: string;
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
 * Discover checks and flows, and derive their module and launcher names.
 *
 * Launcher names flatten the source layout because `run_script` resolves its argument as a single
 * file directly under `$game_scripts$` and cannot descend into directories.
 *
 * @returns List of descriptors, sorted by relative path.
 */
export function discoverChecks(): Array<ICheckDescriptor> {
  const sources: Array<string> = walk(
    GAME_DATA_CHECKS_DIR,
    (name) => name.endsWith(CHECK_SUFFIX) || name.endsWith(FLOW_SUFFIX)
  );

  return sources
    .map((source) => {
      const relative: string = path.relative(GAME_DATA_CHECKS_DIR, source).replace(/\\/g, "/");
      const withoutExtension: string = relative.replace(/\.ts$/, "");
      const isFlow: boolean = relative.endsWith(FLOW_SUFFIX);
      const prefix: string = isFlow ? FLOW_LAUNCHER_PREFIX : CHECK_LAUNCHER_PREFIX;
      const identity: string = withoutExtension.replace(/\.(check|flow)$/, "").replace(/\//g, "_");

      // The transpiler cannot keep dots inside a file name, since a dot separates lua module
      // path segments, so `zat_b29.check.ts` is emitted as `zat_b29_check.script`.
      const emitted: string = withoutExtension.replace(/\./g, "_");

      return {
        kind: isFlow ? ("flow" as const) : ("check" as const),
        source,
        relative,
        emitted: `${emitted}.script`,
        module: `checks.${emitted.replace(/\//g, ".")}`,
        launcher: `${prefix}${identity}.script`,
        command: `run_script ${prefix}${identity}`,
        resetLauncher: isFlow ? `${prefix}${identity}_reset.script` : undefined,
        resetCommand: isFlow ? `run_script ${prefix}${identity}_reset` : undefined,
      };
    })
    .sort((first, second) => first.relative.localeCompare(second.relative));
}

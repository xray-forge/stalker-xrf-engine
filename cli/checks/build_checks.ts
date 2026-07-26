import * as fs from "node:fs";
import * as path from "node:path";

import { blueBright, green, greenBright, red, yellow, yellowBright } from "chalk";
import * as tstl from "typescript-to-lua";

import {
  CHECK_LAUNCHER_PREFIX,
  discoverChecks,
  ICheckDescriptor,
  SUITE_EMITTED,
  SUITE_IDENTITY,
  SUITE_MODULE,
} from "#/checks/utils/discover_checks";
import { BUILD_CHECKS_TSCONFIG, TARGET_GAME_DATA_CHECKS_DIR, TARGET_GAME_DATA_SCRIPTS_DIR } from "#/globals/paths";
import { NodeLogger } from "#/utils/logging";
import { TimeTracker } from "#/utils/timing";

const log: NodeLogger = NodeLogger.forFile(__filename);

export interface IBuildChecksParameters {
  verbose?: boolean;
}

/**
 * Transpile checks into gamedata and emit a console launcher for each one.
 *
 * Checks live outside the regular script build, so nothing here affects normal build or watch
 * timings. Running this command is the only way check code reaches gamedata.
 */
export async function buildChecks(parameters: IBuildChecksParameters = {}): Promise<void> {
  NodeLogger.IS_VERBOSE = Boolean(parameters.verbose);

  log.info(blueBright("Build checks"));

  const timeTracker: TimeTracker = new TimeTracker().start();
  const checks: Array<ICheckDescriptor> = discoverChecks();

  if (!checks.length) {
    return log.warn("No checks found, nothing to build");
  }

  log.info("Discovered checks:", checks.length);

  transpileChecks();
  timeTracker.addMark("CHECKS_TRANSPILED");

  emitLaunchers(checks);
  timeTracker.addMark("CHECKS_LAUNCHERS");

  const suiteCommand: string | null = emitSuiteLauncher(checks);

  timeTracker.addMark("CHECKS_SUITE");

  log.info("Checks built in", timeTracker.end().getDuration() / 1000, "sec");
  log.pushNewLine();
  log.info("Run in game console (engine variant must be", yellowBright("mixed"), "or", yellowBright("release") + "):");

  for (const check of checks) {
    log.info(" ", greenBright(check.command), green(`(${check.kind}, ${check.relative})`));

    if (check.resetCommand) {
      log.info("   ", green(`${check.resetCommand} to walk it again from step 1`));
    }
  }

  if (suiteCommand) {
    log.info(" ", greenBright(suiteCommand), green("(every check in sequence, flows excluded)"));
  }
}

/**
 * Flatten a possibly chained diagnostic message into readable text.
 */
function flattenDiagnostic(message: string | { messageText: string; next?: Array<unknown> }): string {
  return typeof message === "string" ? message : message.messageText;
}

/**
 * Transpile the checks project into gamedata.
 */
function transpileChecks(): void {
  const result = tstl.transpileProject(BUILD_CHECKS_TSCONFIG, { noHeader: true, tstlVerbose: false });

  if (result.diagnostics?.length) {
    result.diagnostics.forEach((it) => {
      log.error(red("Lua issue:"), it.code, yellowBright(it.file?.fileName), red(flattenDiagnostic(it.messageText)));
    });

    throw new Error(
      `Checks transpiling failed with ${result.diagnostics.length} issue(s). Use ${yellow(
        "'npm run typecheck:checks'"
      )} for investigation.`
    );
  }
}

/**
 * Write one launcher script per check into `$game_scripts$`, plus a reset launcher per flow.
 *
 * Clearing `package.loaded` inside the launcher is what lets a rebuild take effect without a game
 * restart: `run_script` reloads the launcher, but would otherwise reuse the cached check module.
 */
function emitLaunchers(checks: Array<ICheckDescriptor>): void {
  fs.mkdirSync(TARGET_GAME_DATA_SCRIPTS_DIR, { recursive: true });

  let emitted: number = 0;

  for (const check of checks) {
    const emittedPath: string = path.resolve(TARGET_GAME_DATA_CHECKS_DIR, check.emitted);

    // Guard against the transpiler changing how it derives emitted file names: a launcher
    // pointing at a module that does not exist would only fail once typed into the console.
    if (!fs.existsSync(emittedPath)) {
      throw new Error(
        `Expected transpiled check at '${emittedPath}' for source '${check.relative}'. ` +
          `Emitted file naming changed, launcher module '${check.module}' would not resolve.`
      );
    }

    writeLauncher(check.launcher, check, "run");

    // A flow keeps a cursor in the save, so it needs a second entry point to send it back to the
    // start. The console cannot pass arguments to `run_script`, hence a launcher rather than a flag.
    if (check.resetLauncher) {
      writeLauncher(check.resetLauncher, check, "reset");
      emitted += 1;
    }

    emitted += 1;
  }

  log.info("Emitted launchers:", emitted, green(TARGET_GAME_DATA_CHECKS_DIR));
}

/**
 * Write the launcher that sweeps every check in one invocation.
 *
 * Only checks are listed. A flow advances a cursor kept in the save, so sweeping it would move state
 * nobody asked to move. The generated file carries nothing but the list: the sequencing, isolation and
 * combined reporting live in `framework/suite.ts`, where they are typed and readable.
 *
 * @param checks - Everything discovered, flows included and filtered out here.
 * @returns Console command for the suite, or null when there is nothing to sweep.
 */
function emitSuiteLauncher(checks: Array<ICheckDescriptor>): string | null {
  const runnable: Array<ICheckDescriptor> = checks.filter((it) => it.kind === "check");

  if (!runnable.length) {
    log.info("No checks to sweep, skipping", yellow(`${CHECK_LAUNCHER_PREFIX}${SUITE_IDENTITY}`));

    return null;
  }

  const collision: ICheckDescriptor | undefined = checks.find((it) => it.identity === SUITE_IDENTITY);

  if (collision) {
    throw new Error(
      `Source '${collision.relative}' produces identity '${SUITE_IDENTITY}', which the sweep launcher ` +
        `already uses. Rename it, so 'run_script ${CHECK_LAUNCHER_PREFIX}${SUITE_IDENTITY}' stays unambiguous.`
    );
  }

  const suitePath: string = path.resolve(TARGET_GAME_DATA_CHECKS_DIR, SUITE_EMITTED);

  if (!fs.existsSync(suitePath)) {
    throw new Error(`Expected transpiled suite at '${suitePath}'. Module '${SUITE_MODULE}' would not resolve.`);
  }

  const launcher: string = `${CHECK_LAUNCHER_PREFIX}${SUITE_IDENTITY}.script`;
  const unload: string = [SUITE_MODULE, ...runnable.map((it) => it.module)]
    .map((it) => `  package.loaded["${it}"] = nil\n`)
    .join("");
  const entries: string = runnable
    .map((it) => `    { name = "${it.identity}", run = require("${it.module}").run },\n`)
    .join("");

  const body: string =
    `-- Generated by 'xrf checks build'. Do not edit.\n` +
    `-- Runs every built check in sequence. Flows are excluded, they advance a saved cursor.\n` +
    `-- Run with: run_script ${CHECK_LAUNCHER_PREFIX}${SUITE_IDENTITY}\n` +
    `function main()\n` +
    unload +
    `  require("${SUITE_MODULE}").runAll({\n` +
    entries +
    `  })\n` +
    `end\n`;

  fs.writeFileSync(path.resolve(TARGET_GAME_DATA_SCRIPTS_DIR, launcher), body, "utf8");

  log.info("Emitted sweep launcher:", green(launcher), `over ${runnable.length} check(s)`);

  return `run_script ${CHECK_LAUNCHER_PREFIX}${SUITE_IDENTITY}`;
}

/**
 * Write a single launcher script invoking one exported entry point of a check module.
 *
 * The work must live in `main`: `run_script X` loads the file into namespace `X`, then resumes
 * `X.main()` as a coroutine. Without it the engine ends up calling a nil value.
 */
function writeLauncher(launcher: string, check: ICheckDescriptor, entry: "run" | "reset"): void {
  const body: string =
    `-- Generated by 'xrf checks build'. Do not edit.\n` +
    `-- Launcher for ${check.relative} (${check.kind}, ${entry}).\n` +
    `-- Run with: run_script ${launcher.replace(/\.script$/, "")}\n` +
    `function main()\n` +
    `  package.loaded["${check.module}"] = nil\n` +
    `  require("${check.module}").${entry}()\n` +
    `end\n`;

  fs.writeFileSync(path.resolve(TARGET_GAME_DATA_SCRIPTS_DIR, launcher), body, "utf8");

  log.debug("Emitted launcher:", launcher, "->", `${check.module}.${entry}`);
}

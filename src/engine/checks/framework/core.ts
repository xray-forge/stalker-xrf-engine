import { getFS, level, log, time_global } from "xray16";
import {
  AnyArgs,
  AnyCallable,
  executeConsoleCommand,
  LuaArray,
  Nillable,
  TCount,
  TDuration,
  TLabel,
  TName,
  TPath,
} from "xray16/lib";
import { $isNil, $isNotNil } from "xray16/macros";

import { roots } from "@/engine/constants/roots";
import { getManager, registry } from "@/engine/core/database";
import { NotificationManager } from "@/engine/core/managers/notifications";
import { saveTextToFile } from "@/engine/core/utils/fs";
import { openLogFile } from "@/engine/core/utils/logging";

/** Prefix of every reported line, to make output greppable in the log. */
const PREFIX: TLabel = "[check]";
/** Maximum failures echoed to the console. The result file always holds all of them. */
const CONSOLE_FAILURE_LIMIT: TCount = 25;
/** Name of the `_appdata_` subdirectory results are written to. */
const RESULTS_DIR: TPath = "check_results";

/**
 * Dedicated `$logs$\xrf_checks.log`, holding everything reported across a whole game session.
 *
 * Written directly rather than through `LuaLogger` on purpose. A check is something explicitly asked
 * for, so its output must not depend on `forge.ltx` debug flags, and duplicating every line into
 * `xrf_lua.log` would bury it in the noisiest file in the folder.
 */
const [isLogOpened, openedLog] = pcall(openLogFile, "checks");
const checksFile: Nillable<LuaFile> = isLogOpened ? (openedLog as LuaFile) : null;

if (!isLogOpened) {
  log(`${PREFIX} could not open xrf_checks.log, console only -> ${tostring(openedLog)}`);
}

/**
 * Write one line to both destinations, which are deliberately identical.
 *
 * @param text - Line to write, already formatted.
 */
function writeLine(text: TLabel): void {
  log(text);

  if ($isNotNil(checksFile)) {
    checksFile.write(text);
    checksFile.write("\n");
  }
}

/**
 * Print a line to the game console, the engine log and the check log.
 *
 * @param base - Base string for interpolation.
 * @param args - Variadic list of values to interpolate.
 */
export function report(base: string, ...args: AnyArgs): void {
  writeLine(`[${time_global()}] ${PREFIX} ${string.format(base, ...args)}`);
}

/**
 * Mark the start of an invocation, so a session of repeated walks stays navigable.
 *
 * @param name - Name of the flow being walked.
 */
export function reportBanner(name: TName): void {
  writeLine("");
  writeLine(`=== ${name} @ ${time_global()} ===`);
}

/**
 * Show a line in game as a PDA tip, for output the operator has to act on.
 *
 * @param base - Base string for interpolation.
 * @param args - Variadic list of values to interpolate.
 */
export function notify(base: string, ...args: AnyArgs): void {
  const text: TLabel = string.format(base, ...args);
  const [isCompleted, caught] = pcall(() =>
    getManager(NotificationManager).sendTipNotification(text, null, null, 10_000)
  );

  if (!isCompleted) {
    report("could not show notification '%s' -> %s", text, tostring(caught));
  }
}

/**
 * Turn engine script logging on, since the engine drops non error script messages while the
 * `lua_debug` mask is off, and it ships off.
 */
export function ensureScriptLoggingEnabled(): void {
  executeConsoleCommand("lua_debug", "on");
}

/**
 * Single failed assertion.
 */
export interface ICheckFailure {
  assertion: TLabel;
  detail: TLabel;
}

/**
 * Outcome of a single invocation of a flow.
 */
export interface ICheckResult {
  name: TName;
  steps: TCount;
  checked: TCount;
  failures: LuaArray<ICheckFailure>;
  skipReason: Nillable<TLabel>;
}

/**
 * Collector behind the free assertion functions, one per invocation.
 *
 * Bodies report through it instead of throwing, so one failed assertion does not hide the rest.
 */
export class CheckContext {
  public readonly name: TName;
  public readonly failures: LuaArray<ICheckFailure> = new LuaTable();

  public checked: TCount = 0;
  public steps: TCount = 0;

  public constructor(name: TName) {
    this.name = name;
  }

  /**
   * Record a failed assertion.
   *
   * @param assertion - Short label of what was being verified.
   * @param detail - Context needed to locate the problem.
   */
  public fail(assertion: TLabel, detail: TLabel): void {
    table.insert(this.failures, { assertion: assertion, detail: detail });
  }

  /**
   * Assert a condition, recording a failure instead of throwing when it does not hold.
   *
   * @param condition - Result of the assertion.
   * @param assertion - Short label of what was being verified.
   * @param detail - Context needed to locate the problem.
   */
  public expect(condition: boolean, assertion: TLabel, detail: TLabel): void {
    this.checked += 1;

    if (!condition) {
      this.fail(assertion, detail);
    }
  }

  /**
   * Assert that a value matches the expected one.
   *
   * @param actual - Value produced by the code under check.
   * @param expected - Value the code is expected to produce.
   * @param assertion - Short label of what was being verified.
   */
  public expectEqual(actual: unknown, expected: unknown, assertion: TLabel): void {
    this.expect(actual === expected, assertion, `expected '${tostring(expected)}', got '${tostring(actual)}'`);
  }

  /**
   * Run a callable and record a failure when it aborts, instead of letting the abort kill the run.
   *
   * @param callable - Function to protect.
   * @param assertion - Short label of what was being verified.
   * @param detail - Context needed to locate the problem.
   * @returns Whether the call completed without error.
   */
  public expectNoThrow(callable: AnyCallable, assertion: TLabel, detail: TLabel): boolean {
    this.checked += 1;

    const [isCompleted, caught] = pcall(callable);

    if (!isCompleted) {
      this.fail(assertion, `${detail} -> ${tostring(caught)}`);
    }

    return isCompleted as boolean;
  }
}

/**
 * A world state a flow needs before it is worth starting.
 */
export interface IStateRequirement {
  holds: (this: void) => boolean;
  missing: TLabel;
}

/**
 * Everything needed before a check or flow is worth running at all.
 */
export interface ICheckRequirements {
  /** Level that must be loaded, otherwise the run reports as skipped. */
  level?: TName;
  /**
   * Progression the flow starts from. Nothing here is ever forced: an unmet requirement blocks the
   * run and says which flow to walk instead, because forcing a chain into a mid state produces portion
   * combinations the game's own logic never produces.
   */
  state?: Array<IStateRequirement>;
}

/**
 * Decide whether the current environment can host a run.
 *
 * A registered actor is required unconditionally, whether or not a level is declared.
 *
 * @param requires - Declared requirements, if any.
 * @returns Reason the run must be skipped, or null when it can proceed.
 */
export function evaluateRequirements(requires: Nillable<ICheckRequirements>): Nillable<TLabel> {
  if ($isNil(registry.actor)) {
    return "actor is not registered, load a save first";
  }

  const requiredLevel: Nillable<TName> = requires?.level;

  if ($isNotNil(requiredLevel) && level.name() !== requiredLevel) {
    return `requires level '${requiredLevel}', current is '${level.name()}'`;
  }

  return null;
}

/**
 * Collect the progression requirements the world does not currently satisfy.
 *
 * @param requires - Declared requirements, if any.
 * @returns Messages for every unmet requirement, empty when the flow can start.
 */
export function evaluateStateRequirements(requires: Nillable<ICheckRequirements>): LuaArray<TLabel> {
  const unmet: LuaArray<TLabel> = new LuaTable();

  if ($isNil(requires?.state)) {
    return unmet;
  }

  for (const requirement of requires!.state!) {
    const [isCompleted, caught] = pcall(() => requirement.holds());

    if (!isCompleted) {
      table.insert(unmet, `${requirement.missing} (precondition aborted -> ${tostring(caught)})`);
    } else if (caught !== true) {
      table.insert(unmet, requirement.missing);
    }
  }

  return unmet;
}

/**
 * Echo the outcome of a run to the console and log.
 *
 * @param result - Result of the run.
 * @param verdict - Headline verdict, since flows have more outcomes than pass and fail.
 * @param duration - How long the run took, in milliseconds.
 */
export function reportOutcome(result: ICheckResult, verdict: TLabel, duration: TDuration): void {
  if ($isNotNil(result.skipReason)) {
    report("%s: SKIP | %s", result.name, result.skipReason);

    return;
  }

  const failuresCount: TCount = result.failures.length();

  for (const [index, failure] of result.failures) {
    if (index > CONSOLE_FAILURE_LIMIT) {
      report("%s: ... %s more failure(s), see result file", result.name, failuresCount - CONSOLE_FAILURE_LIMIT);
      break;
    }

    report("%s: FAIL %s | %s", result.name, failure.assertion, failure.detail);
  }

  report(
    "%s: %s | steps %s, checked %s, failed %s, took %s ms",
    result.name,
    verdict,
    result.steps,
    result.checked,
    failuresCount,
    duration
  );
}

/**
 * Write the run outcome where the CLI can turn it into an exit code.
 *
 * @param result - Result of the run.
 * @param extra - Additional `key=value` lines, written before the failure rows.
 */
export function persistOutcome(result: ICheckResult, extra: Nillable<LuaArray<string>> = null): void {
  const lines: LuaArray<string> = new LuaTable();

  table.insert(lines, `name=${result.name}`);
  table.insert(lines, `steps=${result.steps}`);
  table.insert(lines, `checked=${result.checked}`);
  table.insert(lines, `failed=${result.failures.length()}`);
  table.insert(lines, `skipped=${$isNotNil(result.skipReason) ? 1 : 0}`);

  if ($isNotNil(extra)) {
    for (const [, line] of extra) {
      table.insert(lines, line);
    }
  }

  if ($isNotNil(result.skipReason)) {
    table.insert(lines, `skip\t${result.skipReason}`);
  }

  for (const [, failure] of result.failures) {
    table.insert(lines, `fail\t${failure.assertion}\t${failure.detail}`);
  }

  const [isCompleted, caught] = pcall(() => {
    const folder: TPath = getFS().update_path(roots.appDataRoot, RESULTS_DIR);
    const path: TPath = saveTextToFile(folder, `${result.name}.txt`, table.concat(lines, "\n"));

    report("%s: result -> %s", result.name, path);
  });

  if (!isCompleted) {
    report("%s: could not persist result -> %s", result.name, tostring(caught));
  }
}

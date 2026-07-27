import { time_global } from "xray16";
import { AnyObject, LuaArray, TCount, TDuration, TLabel, TName } from "xray16/lib";
import { $isNotNil } from "xray16/macros";

import {
  ensureScriptLoggingEnabled,
  ICheckResult,
  persistOutcome,
  report,
  reportBanner,
  reportOutcome,
} from "@/engine/checks/framework/core";
import { run } from "@/engine/checks/framework/entry";

/** Name the combined run reports and persists itself under. */
const SUITE_NAME: TName = "all";

/**
 * One check the suite runs, as handed over by the generated launcher.
 */
interface ICheckEntry {
  name: TName;
  module: TName;
}

/**
 * Run every built check in sequence and report a combined verdict.
 *
 * Each check is isolated: one that aborts is recorded and the rest still run, which is the whole
 * point of a sweep. Checks establish their own preconditions, so order does not matter, and any that
 * cannot run here report as skipped rather than failing.
 *
 * Flows are deliberately absent. They are walked one step per invocation and carry a cursor in the
 * save, so running them from a sweep would advance state nobody asked to advance.
 *
 * @param entries - Checks to run, in order.
 * @returns Combined result of the sweep.
 */
export function runAll(entries: LuaArray<ICheckEntry>): ICheckResult {
  ensureScriptLoggingEnabled();

  const total: TCount = entries.length();
  const startedAt: TDuration = time_global();
  const combined: ICheckResult = {
    name: SUITE_NAME,
    stages: 0,
    checked: 0,
    failures: new LuaTable(),
    skipReason: null,
  };

  const rows: LuaArray<string> = new LuaTable();

  let passed: TCount = 0;
  let failed: TCount = 0;
  let skipped: TCount = 0;

  reportBanner(SUITE_NAME, "suite");
  report("%s: start, %s check(s)", SUITE_NAME, total);

  for (const [, entry] of entries) {
    const verdict: TLabel = runEntry(combined, entry);

    if (verdict === "SKIP") {
      skipped += 1;
    } else if (verdict === "PASS") {
      passed += 1;
    } else {
      failed += 1;
    }

    table.insert(rows, `check\t${entry.name}\t${string.lower(verdict)}`);
  }

  const extra: LuaArray<string> = new LuaTable();

  table.insert(extra, `kind=suite`);
  table.insert(extra, `checks=${total}`);
  table.insert(extra, `passed=${passed}`);
  table.insert(extra, `failedChecks=${failed}`);
  table.insert(extra, `skippedChecks=${skipped}`);

  for (const [, row] of rows) {
    table.insert(extra, row);
  }

  report("%s: %s passed, %s failed, %s skipped", SUITE_NAME, passed, failed, skipped);

  reportOutcome(combined, failed === 0 ? "PASS" : "FAIL", time_global() - startedAt);
  persistOutcome(combined, extra);

  return combined;
}

/**
 * Require one check module and run whatever it registered, folding the outcome into the sweep.
 *
 * @param combined - Result of the whole sweep, mutated in place.
 * @param entry - Check to run.
 * @returns Verdict for this single check.
 */
function runEntry(combined: ICheckResult, entry: ICheckEntry): TLabel {
  const [isCompleted, caught] = pcall(() => {
    // Reached through `_G` because `package` is a reserved word in a TypeScript module.
    const loaded: LuaTable<TName, unknown> = ((_G as AnyObject).package as AnyObject).loaded;

    loaded.set(entry.module, null);
    require(entry.module);

    return run(entry.name, "check");
  });

  if (!isCompleted) {
    table.insert(combined.failures, {
      assertion: `check '${entry.name}'`,
      detail: `aborted -> ${tostring(caught)}`,
    });

    return "FAIL";
  }

  const result: ICheckResult = caught as ICheckResult;

  combined.stages += result.stages;
  combined.checked += result.checked;

  for (const [, failure] of result.failures) {
    table.insert(combined.failures, {
      assertion: `${entry.name} / ${failure.assertion}`,
      detail: failure.detail,
    });
  }

  if ($isNotNil(result.skipReason)) {
    return "SKIP";
  }

  return result.failures.length() === 0 ? "PASS" : "FAIL";
}

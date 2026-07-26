import { $dirname, $filename } from "xray16/macros";

import { runCheck } from "@/engine/checks/framework/check";
import { CheckContext, ICheckResult } from "@/engine/checks/framework/core";
import { evaluateFreshTaskState, setInfoPortion } from "@/engine/checks/framework/world";
import { infoPortions, TInfoPortion } from "@/engine/constants/info_portions";
import { ETaskState } from "@/engine/core/managers/tasks/types";

/**
 * Gating portions that have no generated constant, since nothing in the TypeScript sources
 * references them. They exist only in configs and dialog xml.
 */
const BARMEN_EVACUATION_ASKED: TInfoPortion = "zat_a2_stalker_barmen_evacuation_asked" as TInfoPortion;
const JUPITER_EVACUATION_VISITED: TInfoPortion = "jup_b205_evacuation_visited" as TInfoPortion;

/**
 * Make every evacuation task's title resolvable.
 *
 * The Pripyat title condlist has branches for `(+heli3 +blackbox)`, `(+heli3 -blackbox)` and
 * `(-heli3 +blackbox)`, but none for neither, and a nil title aborts the task notification. The heli
 * portion is pinned on for the whole run; it gates nothing under check, so outcomes are unaffected.
 */
function pinResolvableTitles(): void {
  setInfoPortion(infoPortions.zat_b28_heli_3_searched, true);
}

/**
 * Zaton b107 evacuation chain: three tasks, one per destination, gated purely on info portions.
 *
 * Covers `complete`, `reversed`, and the precedence rule that an earlier condlist wins when several
 * are satisfied at once. Needs no particular level, so it produces signal on any save.
 */
export function run(): ICheckResult {
  return runCheck($dirname, $filename, {
    setup: (): void => pinResolvableTitles(),
    body: (context: CheckContext): void => {
      const blackbox: TInfoPortion = infoPortions.jup_b9_blackbox_decrypted;
      const commanderDialog: TInfoPortion = infoPortions.pri_a17_military_base_commander_task_dialog_end;

      context.stage("zaton: settles on neither gate", () => {
        setInfoPortion(BARMEN_EVACUATION_ASKED, false);
        setInfoPortion(blackbox, false);
        context.expectEqual(evaluateFreshTaskState("zat_b107_evacuation_zaton"), null, "state");
      });

      context.stage("zaton: reverses once the blackbox is decrypted", () => {
        setInfoPortion(BARMEN_EVACUATION_ASKED, false);
        setInfoPortion(blackbox, true);
        context.expectEqual(evaluateFreshTaskState("zat_b107_evacuation_zaton"), ETaskState.REVERSED, "state");
      });

      context.stage("zaton: complete precedes reversed", () => {
        setInfoPortion(BARMEN_EVACUATION_ASKED, true);
        setInfoPortion(blackbox, true);
        context.expectEqual(evaluateFreshTaskState("zat_b107_evacuation_zaton"), ETaskState.COMPLETED, "state");
      });

      context.stage("jupiter: settles on neither gate", () => {
        setInfoPortion(JUPITER_EVACUATION_VISITED, false);
        setInfoPortion(blackbox, false);
        context.expectEqual(evaluateFreshTaskState("zat_b107_evacuation_jupiter"), null, "state");
      });

      context.stage("jupiter: completes once the evacuation point was visited", () => {
        setInfoPortion(JUPITER_EVACUATION_VISITED, true);
        setInfoPortion(blackbox, false);
        context.expectEqual(evaluateFreshTaskState("zat_b107_evacuation_jupiter"), ETaskState.COMPLETED, "state");
      });

      context.stage("pripyat: held open without the commander dialog", () => {
        setInfoPortion(commanderDialog, false);
        context.expectEqual(evaluateFreshTaskState("zat_b107_evacuation_pripyat"), null, "state");
      });

      context.stage("pripyat: completes on the commander dialog", () => {
        setInfoPortion(commanderDialog, true);
        context.expectEqual(evaluateFreshTaskState("zat_b107_evacuation_pripyat"), ETaskState.COMPLETED, "state");
      });
    },
  });
}

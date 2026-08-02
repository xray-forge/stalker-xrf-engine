import { GameObject } from "xray16/alias";
import { abort, extern, LuaArray } from "xray16/lib";
import { $fromArray, $isNil } from "xray16/macros";

import { infoPortions, TInfoPortion } from "@/engine/constants/info_portions";
import { hasInfoPortion } from "@/engine/core/utils/info_portion";

/**
 * Determine, for the `jup_b221` quest, whether a faction conversation theme is still reachable or which faction starts.
 *
 * @param _ - Actor game object, not used.
 * @param __ - Target game object, not used.
 * @param p - Tuple with the mode, either `ability` to check availability or `choose` to pick the starting faction.
 * @returns Whether a theme is reachable in `ability` mode, or whether the chosen faction is duty in `choose` mode.
 */
extern("xr_conditions.jup_b221_who_will_start", (_: GameObject, __: GameObject, p: [string]): boolean => {
  const reachableTheme: LuaArray<number> = new LuaTable();
  const infoPortionsList: LuaArray<TInfoPortion> = $fromArray<TInfoPortion>([
    infoPortions.jup_b25_freedom_flint_gone,
    infoPortions.jup_b25_flint_blame_done_to_duty,
    infoPortions.jup_b4_monolith_squad_in_duty,
    infoPortions.jup_a6_duty_leader_bunker_guards_work,
    infoPortions.jup_a6_duty_leader_employ_work,
    infoPortions.jup_b207_duty_wins,
    infoPortions.jup_b207_freedom_know_about_depot,
    infoPortions.jup_b46_duty_founder_pda_to_freedom,
    infoPortions.jup_b4_monolith_squad_in_freedom,
    infoPortions.jup_a6_freedom_leader_bunker_guards_work,
    infoPortions.jup_a6_freedom_leader_employ_work,
    infoPortions.jup_b207_freedom_wins,
  ]);

  for (const [index, infoPortion] of infoPortionsList) {
    const factionsList: LuaArray<string> = new LuaTable();

    if (index <= 6) {
      factionsList.set(1, "duty");
      factionsList.set(2, "0");
    } else {
      factionsList.set(1, "freedom");
      factionsList.set(2, "6");
    }

    if (
      hasInfoPortion(infoPortion) &&
      !hasInfoPortion(
        ("jup_b221_" +
          factionsList.get(1) +
          "_main_" +
          tostring(index - tonumber(factionsList.get(2))!) +
          "_played") as TInfoPortion
      )
    ) {
      table.insert(reachableTheme, index);
    }
  }

  if ($isNil(p && p[0])) {
    abort("No such parameters in function 'jup_b221_who_will_start'");
  }

  if (tostring(p[0]) === "ability") {
    return reachableTheme.length() !== 0;
  } else if (tostring(p[0]) === "choose") {
    return reachableTheme.get(math.random(1, reachableTheme.length())) <= 6;
  } else {
    abort("Wrong parameters in function 'jup_b221_who_will_start'");
  }
});

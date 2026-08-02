import { GameObject } from "xray16/alias";
import { AnyArgs, extern, LuaArray, TCount, TLabel } from "xray16/lib";

import { infoPortions } from "@/engine/constants/info_portions";
import { getManager } from "@/engine/core/database";
import { UpgradesManager } from "@/engine/core/managers/upgrades/UpgradesManager";
import { hasInfoPortion } from "@/engine/core/utils/info_portion";

/**
 * Build the Kardan upgrade hint list based on brought tools and learned info portions, and report upgrade readiness.
 *
 * @param _ - Actor game object, not used.
 * @param __ - Target game object, not used.
 * @param params - Arguments where the first value is the count of tools brought to the technician.
 * @returns Whether enough conditions are met for the upgrade to be available.
 */
extern("xr_conditions.upgrade_hint_kardan", (_: GameObject, __: GameObject, params: AnyArgs): boolean => {
  const itemUpgradeHints: LuaArray<TLabel> = new LuaTable();
  const toolsCount: TCount = (params && tonumber(params[0])) || 0;
  let canUpgrade: number = 0;

  if (!hasInfoPortion(infoPortions.zat_b3_all_instruments_brought)) {
    if (!hasInfoPortion(infoPortions.zat_b3_tech_instrument_1_brought) && (toolsCount === 0 || toolsCount === 1)) {
      table.insert(itemUpgradeHints, "st_upgr_toolkit_1");
    } else if (toolsCount === 1) {
      canUpgrade = canUpgrade + 1;
    }

    if (!hasInfoPortion(infoPortions.zat_b3_tech_instrument_2_brought) && (toolsCount === 0 || toolsCount === 2)) {
      table.insert(itemUpgradeHints, "st_upgr_toolkit_2");
    } else if (toolsCount === 2) {
      canUpgrade = canUpgrade + 1;
    }

    if (!hasInfoPortion(infoPortions.zat_b3_tech_instrument_3_brought) && (toolsCount === 0 || toolsCount === 3)) {
      table.insert(itemUpgradeHints, "st_upgr_toolkit_3");
    } else if (toolsCount === 3) {
      canUpgrade = canUpgrade + 1;
    }
  } else {
    canUpgrade = canUpgrade + 1;
  }

  if (!hasInfoPortion(infoPortions.zat_b3_tech_see_produce_62)) {
    if (toolsCount === 1 && !hasInfoPortion(infoPortions.zat_b3_tech_have_one_dose)) {
      table.insert(itemUpgradeHints, "st_upgr_vodka");
    } else if (toolsCount !== 1 && !hasInfoPortion(infoPortions.zat_b3_tech_have_couple_dose)) {
      table.insert(itemUpgradeHints, "st_upgr_vodka");
    } else {
      canUpgrade = canUpgrade + 1;
    }
  } else {
    canUpgrade = canUpgrade + 1;
  }

  getManager(UpgradesManager).setCurrentHints(itemUpgradeHints);

  return canUpgrade >= 2;
});

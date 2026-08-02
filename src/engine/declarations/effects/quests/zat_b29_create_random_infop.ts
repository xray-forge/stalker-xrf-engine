import { GameObject } from "xray16/alias";
import { abort, extern, LuaArray, TCount, TIndex } from "xray16/lib";
import { $isNil } from "xray16/macros";

import { TInfoPortion } from "@/engine/constants/info_portions";
import { disableInfoPortion, giveInfoPortion, hasInfoPortion } from "@/engine/core/utils/info_portion";

/**
 * Disable the provided info portions and randomly give back the requested number of them.
 *
 * @param actor - Actor game object initiating the effect.
 * @param object - Game object owning the logics scheme.
 * @param parameters - List whose first element is the amount needed and the rest are candidate info portions.
 */
extern(
  "xr_effects.zat_b29_create_random_infop",
  (actor: GameObject, object: GameObject, parameters: LuaArray<TInfoPortion>): void => {
    if ($isNil(parameters.get(2))) {
      abort("Not enough parameters for zat_b29_create_random_infop!");
    }

    let amountNeeded: TCount = parameters.get(1) as unknown as number;
    let currentInfop: TIndex = 0;
    let totalInfop: TCount = 0;

    if ($isNil(amountNeeded)) {
      amountNeeded = 1;
    }

    for (const [index, infoPortion] of parameters) {
      if (index > 1) {
        totalInfop = totalInfop + 1;
        disableInfoPortion(infoPortion);
      }
    }

    if (amountNeeded > totalInfop) {
      amountNeeded = totalInfop;
    }

    for (const it of $range(1, amountNeeded)) {
      currentInfop = math.random(1, totalInfop);
      for (const [k, v] of parameters) {
        if (k > 1) {
          if (k === currentInfop + 1 && !hasInfoPortion(v)) {
            giveInfoPortion(v);
            break;
          }
        }
      }
    }
  }
);

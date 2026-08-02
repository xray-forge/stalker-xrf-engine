import { GameObject } from "xray16/alias";
import { extern, Nillable, TRate } from "xray16/lib";

import { getManager } from "@/engine/core/database";
import { UpgradesManager } from "@/engine/core/managers/upgrades/UpgradesManager";

/**
 * Set current discount value for mechanic based on parameter.
 */
extern("xr_effects.mech_discount", (_: GameObject, __: GameObject, [discount]: [Nillable<string>]): void => {
  const discountPercent: Nillable<number> = (discount && tonumber(discount)) as Nillable<TRate>;

  if (discountPercent) {
    getManager(UpgradesManager).setCurrentPriceDiscount(discountPercent);
  }
});

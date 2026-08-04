import { GameObject } from "xray16/alias";
import { AnyCallable, extern, getExtern, Nillable, TName } from "xray16/lib";

import { TInfoPortion } from "@/engine/constants/info_portions";
import { disableInfoPortion, hasInfoPortion } from "@/engine/core/utils/info_portion";
import { zatB29AfTable, zatB29InfopBringTable } from "@/engine/scripts/quests/zaton/zat_b29/advanced_artefacts_data";

/**
 * Pick the Zaton b29 artefact matching the active bring info portion from its assigned anomaly zone.
 *
 * @param actor - Actor game object that receives the artefact.
 * @param object - Game object owning the logics scheme.
 * @param p - Tuple containing the target story ID forwarded to the pick artefact effect.
 */
extern("xr_effects.give_item_b29", (actor: GameObject, object: GameObject, p: [string]): void => {
  // --	const story_object = p && getStoryObject(p[1])
  const anomalyZonesList: Array<TName> = [
    "zat_b55_anomal_zone",
    "zat_b54_anomal_zone",
    "zat_b53_anomal_zone",
    "zat_b39_anomal_zone",
    "zaton_b56_anomal_zone",
  ];

  for (const it of $range(16, 23)) {
    if (hasInfoPortion(zatB29InfopBringTable.get(it))) {
      let anomalyZoneName: Nillable<TName> = null;

      for (const name of anomalyZonesList) {
        if (hasInfoPortion(name as TInfoPortion)) {
          anomalyZoneName = name;
          disableInfoPortion(anomalyZoneName as TInfoPortion);
          break;
        }
      }

      getExtern<AnyCallable>("pick_artefact_from_anomaly", getExtern("xr_effects"))(actor, null, [
        p[0],
        anomalyZoneName,
        zatB29AfTable.get(it),
      ]);
      break;
    }
  }
});

import { game } from "xray16";
import { GameObject } from "xray16/alias";
import { AnyObject, extern, LuaArray, TIndex, TName, TSection } from "xray16/lib";
import { $fromArray, $fromObject, $isNotNil } from "xray16/macros";

import { infoPortions } from "@/engine/constants/info_portions";
import { AnomalyZoneBinder } from "@/engine/core/binders/zones";
import { registry } from "@/engine/core/database";
import { getNpcSpeaker } from "@/engine/core/utils/dialog";
import { disableInfoPortion, hasInfoPortion } from "@/engine/core/utils/info_portion";
import { giveMoneyToActor, transferItemsFromActor, transferItemsToActor } from "@/engine/core/utils/reward";
import {
  zatB29AfNamesTable,
  zatB29AfTable,
  zatB29InfopBringTable,
  zatB29InfopTable,
} from "@/engine/scripts/quests/zaton/zat_b29/advanced_artefacts_data";
import { getGoodGunsInInventory } from "@/engine/scripts/quests/zaton/zat_b29/exchange_weapons";

/**
 * Force-spawn the requested zat_b29 artefact in a randomly chosen anomaly zone of the matching type.
 */
extern("dialogs_zaton.zat_b29_create_af_in_anomaly", (): void => {
  const anomTbl: LuaTable<TIndex, string> = $fromObject<TIndex, string>({
    [16]: "gravi",
    [17]: "thermal",
    [18]: "acid",
    [19]: "electra",
    [20]: "gravi",
    [21]: "thermal",
    [22]: "acid",
    [23]: "electra",
  });

  const anomaliesNamesTbl: LuaTable<string, LuaArray<string>> = $fromObject<string, LuaArray<string>>({
    ["gravi"]: $fromArray<string>(["zat_b14_anomal_zone", "zat_b55_anomal_zone", "zat_b44_anomal_zone_gravi"]),
    ["thermal"]: $fromArray<string>(["zat_b20_anomal_zone", "zat_b53_anomal_zone", "zaton_b56_anomal_zone"]),
    ["acid"]: $fromArray<string>(["zat_b39_anomal_zone", "zat_b101_anomal_zone", "zat_b44_anomal_zone_acid"]),
    ["electra"]: $fromArray<string>(["zat_b54_anomal_zone", "zat_b100_anomal_zone"]),
  });

  let zone: TSection = "";
  let key;

  for (const [k, v] of zatB29InfopBringTable) {
    if (hasInfoPortion(v)) {
      key = k;
      zone = anomTbl.get(key);
      break;
    }
  }

  const zoneName: TName = anomaliesNamesTbl.get(zone).get(math.random(1, anomaliesNamesTbl.get(zone).length()));

  (registry.anomalyZones.get(zoneName) as AnomalyZoneBinder).setForcedSpawnOverride(zatB29AfTable.get(key as number));
});

/**
 * Build the comma-separated list of advanced zat_b29 artefacts the actor is asked to bring.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 * @returns Translated, comma-separated list of requested artefact names ending with a period.
 */
extern("dialogs_zaton.zat_b29_linker_give_adv_task", (firstSpeaker: GameObject, secondSpeaker: GameObject): string => {
  let result: string = "";
  let isFirst: boolean = true;

  for (const i of $range(16, 23)) {
    disableInfoPortion(zatB29InfopBringTable.get(i));
    if (hasInfoPortion(zatB29InfopTable.get(i))) {
      if (isFirst) {
        result = game.translate_string(zatB29AfNamesTable.get(i));
        isFirst = false;
      } else {
        result = result + ", " + game.translate_string(zatB29AfNamesTable.get(i));
      }
    }
  }

  return result + ".";
});

/**
 * Check whether the actor is missing every requested advanced zat_b29 artefact.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 * @returns Whether the actor does not carry any of the currently requested advanced artefacts.
 */
extern(
  "dialogs_zaton.zat_b29_actor_do_not_has_adv_task_af",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
    for (const i of $range(16, 23)) {
      if (hasInfoPortion(zatB29InfopBringTable.get(i)) && registry.actor.object(zatB29AfTable.get(i))) {
        return false;
      }
    }

    return true;
  }
);

/**
 * Check whether the actor carries any requested advanced zat_b29 artefact.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 * @returns Whether the actor owns at least one of the currently requested advanced artefacts.
 */
extern(
  "dialogs_zaton.zat_b29_actor_has_adv_task_af",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
    for (const i of $range(16, 23)) {
      if (hasInfoPortion(zatB29InfopBringTable.get(i)) && registry.actor.object(zatB29AfTable.get(i))) {
        return true;
      }
    }

    return false;
  }
);

/**
 * Take the requested advanced zat_b29 artefact from the actor and pay the matching reward.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 */
extern("dialogs_zaton.zat_b29_linker_get_adv_task_af", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  for (const i of $range(16, 23)) {
    if (hasInfoPortion(zatB29InfopBringTable.get(i))) {
      disableInfoPortion(infoPortions.zat_b29_adv_task_given);
      transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), zatB29AfTable.get(i));
      if (i < 20) {
        if (hasInfoPortion(infoPortions.zat_b29_linker_take_af_from_rival)) {
          giveMoneyToActor(12000);
        } else {
          giveMoneyToActor(18000);
        }
      } else if (i > 19) {
        if (hasInfoPortion(infoPortions.zat_b29_linker_take_af_from_rival)) {
          giveMoneyToActor(18000);
        } else {
          giveMoneyToActor(24000);
        }
      }

      break;
    }
  }
});

/**
 * Pick a good gun from the actor inventory for the zat_b29 exchange and remember it on the actor.
 *
 * @returns Whether a suitable weapon for exchange was found on the actor.
 */
extern("dialogs_zaton.zat_b29_actor_has_exchange_item", (): boolean => {
  const actor: GameObject = registry.actor;
  const actorWeaponsTable = getGoodGunsInInventory(actor);

  if (actorWeaponsTable.length() > 0) {
    (actor as AnyObject).goodGun = table.random(actorWeaponsTable)[1];
  }

  return $isNotNil((actor as AnyObject).goodGun);
});

/**
 * Exchange the actor remembered good gun for the requested advanced zat_b29 artefact.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 */
extern("dialogs_zaton.zat_b29_actor_exchange", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  const actor: GameObject = registry.actor;

  for (const i of $range(16, 23)) {
    if (hasInfoPortion(zatB29InfopBringTable.get(i))) {
      if ($isNotNil((actor as AnyObject).goodGun)) {
        transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), (actor as AnyObject).goodGun);
        transferItemsToActor(getNpcSpeaker(firstSpeaker, secondSpeaker), zatB29AfTable.get(i));

        (actor as AnyObject).goodGun = null;
        break;
      }
    }
  }
});

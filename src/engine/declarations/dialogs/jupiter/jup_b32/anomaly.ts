import { GameObject } from "xray16/alias";
import { extern, LuaArray, Nillable, TIndex, TName } from "xray16/lib";
import { $fromArray } from "xray16/macros";

import { infoPortions, TInfoPortion } from "@/engine/constants/info_portions/info_portions";
import { AnomalyZoneBinder } from "@/engine/core/binders/zones/AnomalyZoneBinder";
import { registry } from "@/engine/core/database";
import { getNpcSpeaker } from "@/engine/core/utils/dialog";
import { disableInfoPortion, giveInfoPortion, hasInfoPortion } from "@/engine/core/utils/info_portion";
import { giveMoneyToActor, transferItemsToActor } from "@/engine/core/utils/reward";

/**
 * Check whether the b32 task can be offered, blocking it while the task is started but not ended.
 *
 * @param _ - Actor participating in the dialog, unused.
 * @param __ - NPC participating in the dialog, unused.
 * @returns Whether the b32 task dialog is available.
 */
extern("dialogs_jupiter.jup_b32_task_give_dialog_precond", (_: GameObject, __: GameObject): boolean => {
  return !(hasInfoPortion(infoPortions.jup_b32_task_start) && !hasInfoPortion(infoPortions.jup_b32_task_end));
});

/**
 * Give the actor three b32 scanner devices from the NPC speaker.
 *
 * @param firstSpeaker - Actor participating in the dialog.
 * @param secondSpeaker - NPC participating in the dialog.
 */
extern("dialogs_jupiter.jup_b32_transfer_scanners", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  transferItemsToActor(getNpcSpeaker(firstSpeaker, secondSpeaker), infoPortions.jup_b32_scanner_device, 3);
});

/**
 * Give the actor two b32 scanner devices from the NPC speaker.
 *
 * @param firstSpeaker - Actor participating in the dialog.
 * @param secondSpeaker - NPC participating in the dialog.
 */
extern("dialogs_jupiter.jup_b32_transfer_scanners_2", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  transferItemsToActor(getNpcSpeaker(firstSpeaker, secondSpeaker), infoPortions.jup_b32_scanner_device, 2);
});

/**
 * Reward the actor with money for the b32 quest.
 *
 * @param _ - Actor participating in the dialog, unused.
 * @param __ - NPC participating in the dialog, unused.
 */
extern("dialogs_jupiter.jup_b32_give_reward_to_actor", (_: GameObject, __: GameObject): void => {
  giveMoneyToActor(5000);
});

/**
 * Check whether the marked b32 anomaly zone currently has no spawned artefact, cleaning up stale info portions.
 *
 * @param _ - Actor participating in the dialog, unused.
 * @param __ - NPC participating in the dialog, unused.
 * @returns Whether the anomaly has no artefact.
 */
extern("dialogs_jupiter.jup_b32_anomaly_do_not_has_af", (_: GameObject, __: GameObject): boolean => {
  if (hasInfoPortion(infoPortions.jup_b32_anomaly_true)) {
    disableInfoPortion(infoPortions.jup_b32_anomaly_true);

    return false;
  }

  const azTable: LuaArray<TName> = $fromArray([
    "jup_b32_anomal_zone",
    "jup_b201_anomal_zone",
    "jup_b209_anomal_zone",
    "jup_b211_anomal_zone",
    "jup_b10_anomal_zone",
  ]);
  const infoPortionsTable: LuaArray<TInfoPortion> = $fromArray<TInfoPortion>([
    infoPortions.jup_b32_anomaly_1,
    infoPortions.jup_b32_anomaly_2,
    infoPortions.jup_b32_anomaly_3,
    infoPortions.jup_b32_anomaly_4,
    infoPortions.jup_b32_anomaly_5,
  ]);

  let index: TIndex = 0;

  for (const it of $range(1, infoPortionsTable.length())) {
    if (hasInfoPortion(infoPortionsTable.get(it))) {
      index = it;
      break;
    }
  }

  if (index === 0) {
    return true;
  }

  const anomalyZone: Nillable<AnomalyZoneBinder> = registry.anomalyZones.get(azTable.get(index));

  if (!anomalyZone) {
    disableInfoPortion(infoPortionsTable.get(index));

    return true;
  }

  if (anomalyZone.spawnedArtefactsCount > 0) {
    return false;
  }

  disableInfoPortion(infoPortionsTable.get(index));

  return true;
});

/**
 * Check whether the marked b32 anomaly zone has a spawned artefact and update the related info portions.
 *
 * @param _ - Actor participating in the dialog, unused.
 * @param __ - NPC participating in the dialog, unused.
 * @returns Whether the anomaly has an artefact.
 */
extern("dialogs_jupiter.jup_b32_anomaly_has_af", (_: GameObject, __: GameObject): boolean => {
  const azTable: LuaArray<string> = $fromArray<string>([
    "jup_b32_anomal_zone",
    "jup_b201_anomal_zone",
    "jup_b209_anomal_zone",
    "jup_b211_anomal_zone",
    "jup_b10_anomal_zone",
  ]);
  const infopTable: LuaArray<TInfoPortion> = $fromArray<TInfoPortion>([
    infoPortions.jup_b32_anomaly_1,
    infoPortions.jup_b32_anomaly_2,
    infoPortions.jup_b32_anomaly_3,
    infoPortions.jup_b32_anomaly_4,
    infoPortions.jup_b32_anomaly_5,
  ]);

  let index: TIndex = 0;

  for (const it of $range(1, infopTable.length())) {
    if (hasInfoPortion(infopTable.get(it))) {
      index = it;
      break;
    }
  }

  if (index === 0) {
    return false;
  }

  const anomalyZone: Nillable<AnomalyZoneBinder> = registry.anomalyZones.get(azTable.get(index));

  if (!anomalyZone) {
    return false;
  }

  if (anomalyZone.spawnedArtefactsCount > 0) {
    disableInfoPortion(infopTable.get(index));
    giveInfoPortion(infoPortions.jup_b32_anomaly_true);

    return true;
  }

  return false;
});

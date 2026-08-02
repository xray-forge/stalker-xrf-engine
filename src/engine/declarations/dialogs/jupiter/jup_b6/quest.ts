import { GameObject, ServerCreatureObject } from "xray16/alias";
import { AnyCallable, extern, getExtern, Nillable, TName } from "xray16/lib";
import { $isNil, $isNotNil } from "xray16/macros";

import { infoPortions } from "@/engine/constants/info_portions/info_portions";
import { detectors } from "@/engine/constants/items/detectors";
import { registry } from "@/engine/core/database";
import { getNpcSpeaker } from "@/engine/core/utils/dialog";
import { hasInfoPortion } from "@/engine/core/utils/info_portion";
import { giveMoneyToActor, transferItemsToActor } from "@/engine/core/utils/reward";

/**
 * Check the precondition for the scientist anomaly scan dialog based on the b6 and b32 quest info portions.
 *
 * @param _ - Actor participating in the dialog, unused.
 * @param __ - NPC participating in the dialog, unused.
 * @returns Whether the scan anomaly dialog is available.
 */
extern(
  "dialogs_jupiter.jup_b6_scientist_nuclear_physicist_scan_anomaly_precond",
  (_: GameObject, __: GameObject): boolean => {
    if (!hasInfoPortion(infoPortions.jup_b6_b32_quest_active)) {
      return false;
    } else if (hasInfoPortion(infoPortions.jup_b6_give_task) && hasInfoPortion(infoPortions.jup_b32_task_addon_start)) {
      return false;
    } else if (hasInfoPortion(infoPortions.jup_b6_task_fail) && hasInfoPortion(infoPortions.jup_b32_task_addon_start)) {
      return false;
    }

    return true;
  }
);

/**
 * Check whether the actor is wearing the CS heavy outfit.
 *
 * @param _ - Actor participating in the dialog, unused.
 * @param __ - NPC participating in the dialog, unused.
 * @returns Whether the CS heavy outfit is equipped.
 */
extern("dialogs_jupiter.jup_b6_actor_outfit_cs", (_: GameObject, __: GameObject): boolean => {
  const actor: GameObject = registry.actor;

  if ($isNotNil(actor.item_in_slot(7)) && actor.item_in_slot(7)!.section() === "cs_heavy_outfit") {
    return true;
  }

  return false;
});

/**
 * Reward the actor with money for the first part of the b6 quest.
 *
 * @param _ - Actor participating in the dialog, unused.
 * @param __ - NPC participating in the dialog, unused.
 */
extern("dialogs_jupiter.jup_b6_first_reward_for_actor", (_: GameObject, __: GameObject): void => {
  giveMoneyToActor(2500);
});

/**
 * Reward the actor with money for the second part of the b6 quest.
 *
 * @param _ - Actor participating in the dialog, unused.
 * @param __ - NPC participating in the dialog, unused.
 */
extern("dialogs_jupiter.jup_b6_second_reward_for_actor", (_: GameObject, __: GameObject): void => {
  giveMoneyToActor(2500);
});

/**
 * Reward the actor with money for completing the full b6 quest.
 *
 * @param _ - Actor participating in the dialog, unused.
 * @param __ - NPC participating in the dialog, unused.
 */
extern("dialogs_jupiter.jup_b6_all_reward_for_actor", (_: GameObject, __: GameObject): void => {
  giveMoneyToActor(5000);
});

/**
 * Reward the actor with extra money for the first part of the b6 quest.
 *
 * @param _ - Actor participating in the dialog, unused.
 * @param __ - NPC participating in the dialog, unused.
 */
extern("dialogs_jupiter.jup_b6_first_reward_for_actor_extra", (_: GameObject, __: GameObject): void => {
  giveMoneyToActor(3500);
});

/**
 * Reward the actor with extra money for the second part of the b6 quest.
 *
 * @param _ - Actor participating in the dialog, unused.
 * @param __ - NPC participating in the dialog, unused.
 */
extern("dialogs_jupiter.jup_b6_second_reward_for_actor_extra", (_: GameObject, __: GameObject): void => {
  giveMoneyToActor(3500);
});

/**
 * Reward the actor with extra money for completing the full b6 quest.
 *
 * @param _ - Actor participating in the dialog, unused.
 * @param __ - NPC participating in the dialog, unused.
 */
extern("dialogs_jupiter.jup_b6_all_reward_for_actor_extra", (_: GameObject, __: GameObject): void => {
  giveMoneyToActor(7000);
});

/**
 * Give the actor an elite detector from the NPC speaker as a b6 reward.
 *
 * @param firstSpeaker - Actor participating in the dialog.
 * @param secondSpeaker - NPC participating in the dialog.
 */
extern(
  "dialogs_jupiter.jup_b6_reward_actor_by_detector",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
    transferItemsToActor(getNpcSpeaker(firstSpeaker, secondSpeaker), detectors.detector_elite);
  }
);

/**
 * Check whether the actor cannot start the b6 quest yet.
 *
 * @param firstSpeaker - Actor participating in the dialog.
 * @param secondSpeaker - NPC participating in the dialog.
 * @returns Whether the b6 quest cannot start.
 */
extern("dialogs_jupiter.jup_b6_actor_can_not_start", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return !getExtern<AnyCallable>("jup_b6_actor_can_start", getExtern("dialogs_jupiter"))(firstSpeaker, secondSpeaker);
});

/**
 * Check whether the actor may start the b6 quest based on the b1 squad and employment info portions.
 *
 * @param _ - Actor participating in the dialog, unused.
 * @param __ - NPC participating in the dialog, unused.
 * @returns Whether the b6 quest can start.
 */
extern("dialogs_jupiter.jup_b6_actor_can_start", (_: GameObject, __: GameObject): boolean => {
  if (
    hasInfoPortion(infoPortions.jup_b1_squad_is_dead) &&
    !(
      hasInfoPortion(infoPortions.jup_b6_freedom_employed) ||
      hasInfoPortion(infoPortions.jup_b6_duty_employed) ||
      hasInfoPortion(infoPortions.jup_b6_gonta_employed) ||
      hasInfoPortion(infoPortions.jup_b6_exprisoner_work_on_sci)
    )
  ) {
    return false;
  }

  return true;
});

/**
 * Check whether the NPC speaker belongs to one of the b6 stalker squads the actor may talk to.
 *
 * @param firstSpeaker - Actor participating in the dialog.
 * @param secondSpeaker - NPC participating in the dialog.
 * @returns Whether the b6 stalker dialog is available.
 */
extern(
  "dialogs_jupiter.jup_b6_stalker_dialog_precond",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
    const object: GameObject = getNpcSpeaker(firstSpeaker, secondSpeaker);
    const npcAlife: Nillable<ServerCreatureObject> = registry.simulator.object(object.id());

    if (!npcAlife) {
      return false;
    }

    if ($isNil(registry.simulator.object(npcAlife.group_id))) {
      return false;
    }

    const squadName: TName = registry.simulator.object(npcAlife.group_id)!.section_name();

    if ($isNotNil(squadName) && squadName !== "") {
      if (!hasInfoPortion(infoPortions.jup_b1_squad_is_dead) && squadName === infoPortions.jup_b1_stalker_squad) {
        return true;
      } else if (
        hasInfoPortion(infoPortions.jup_b6_freedom_employed) &&
        squadName === infoPortions.jup_b6_stalker_freedom_squad
      ) {
        return true;
      } else if (
        hasInfoPortion(infoPortions.jup_b6_duty_employed) &&
        squadName === infoPortions.jup_b6_stalker_duty_squad
      ) {
        return true;
      } else if (
        hasInfoPortion(infoPortions.jup_b6_gonta_employed) &&
        squadName === infoPortions.jup_b6_stalker_gonta_squad
      ) {
        return true;
      } else if (
        hasInfoPortion(infoPortions.jup_b6_exprisoner_work_on_sci) &&
        squadName === infoPortions.jup_b6_stalker_exprisoner_squad
      ) {
        return true;
      }
    }

    return false;
  }
);

/**
 * Reward the actor with money for selling the b6 half artefact.
 *
 * @param _ - Actor participating in the dialog, unused.
 * @param __ - NPC participating in the dialog, unused.
 */
extern("dialogs_jupiter.jupiter_b6_sell_halfartefact", (_: GameObject, __: GameObject): void => {
  giveMoneyToActor(2000);
});

import { GameObject } from "xray16/alias";
import { extern, LuaArray, TCount } from "xray16/lib";
import { $fromArray, $fromObject, $isNotNil } from "xray16/macros";

import { infoPortions, TInfoPortion } from "@/engine/constants/info_portions";
import { TInventoryItem } from "@/engine/constants/items";
import { artefacts } from "@/engine/constants/items/artefacts";
import { detectors } from "@/engine/constants/items/detectors";
import { questItems } from "@/engine/constants/items/quest_items";
import { registry } from "@/engine/core/database";
import { hasInfoPortion } from "@/engine/core/utils/info_portion";

/**
 * Check whether the actor carries any quest item that the Owl trader is willing to buy.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 * @returns Whether the actor has at least one sellable quest item not yet discussed with the trader.
 */
extern(
  "dialogs_zaton.zat_b30_owl_stalker_trader_actor_has_item_to_sell",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
    const itemsTable: LuaArray<TInventoryItem> = $fromArray<TInventoryItem>([
      questItems.zat_b20_noah_pda,
      questItems.zat_b40_notebook,
      questItems.zat_b40_pda_1,
      questItems.zat_b40_pda_2,
      questItems.pri_b36_monolith_hiding_place_pda,
      questItems.pri_b306_envoy_pda,
      questItems.jup_b46_duty_founder_pda,
      questItems.jup_b207_merc_pda_with_contract,
      questItems.device_pda_zat_b5_dealer,
      questItems.jup_b10_notes_01,
      questItems.jup_b10_notes_02,
      questItems.jup_b10_notes_03,
      questItems.jup_a9_evacuation_info,
      questItems.jup_a9_meeting_info,
      questItems.jup_a9_losses_info,
      questItems.jup_a9_delivery_info,
      questItems.zat_b12_documents_1,
      questItems.zat_b12_documents_2,
      questItems.device_flash_snag,
      questItems.jup_b202_bandit_pda,
      questItems.device_pda_port_bandit_leader,
      questItems.jup_b10_ufo_memory_2,
      // -- no sell
      questItems.jup_b1_half_artifact,
      artefacts.af_quest_b14_twisted,
      artefacts.af_oasis_heart,
      detectors.detector_scientific,
    ]);

    const infoPortionsTable: LuaTable<TInventoryItem, TInfoPortion> = $fromObject({
      [questItems.jup_b1_half_artifact]: infoPortions.zat_b30_owl_stalker_about_halfart_jup_b6_asked,
      [artefacts.af_quest_b14_twisted]: infoPortions.zat_b30_owl_stalker_about_halfart_zat_b14_asked,
      [artefacts.af_oasis_heart]: infoPortions.zat_b30_owl_stalker_trader_about_osis_art,
      [detectors.detector_scientific]: infoPortions.zat_b30_owl_detectors_approached,
    } as Record<TInventoryItem, TInfoPortion>);

    const actor: GameObject = registry.actor;

    for (const [_k, v] of itemsTable) {
      if ($isNotNil(actor.object(v))) {
        if (v === detectors.detector_scientific && !hasInfoPortion(infoPortions.zat_b30_second_detector)) {
          // --
        } else {
          if ($isNotNil(infoPortionsTable.get(v))) {
            if (!hasInfoPortion(infoPortionsTable.get(v))) {
              return true;
            }
          } else {
            return true;
          }
        }
      }
    }

    return false;
  }
);

/**
 * Check whether Owl still has undiscussed information about searched helicopters.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 * @returns Whether at least one of the tracked helicopters is searched and not yet reported by Owl.
 */
extern(
  "dialogs_zaton.zat_b30_owl_can_say_about_heli",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
    const table: LuaArray<TInfoPortion> = $fromArray<TInfoPortion>([
      infoPortions.zat_b28_heli_3_searched,
      infoPortions.zat_b100_heli_2_searched,
      infoPortions.zat_b101_heli_5_searched,
    ]);

    const table2: LuaArray<TInfoPortion> = $fromArray<TInfoPortion>([
      infoPortions.zat_b30_owl_scat_1,
      infoPortions.zat_b30_owl_scat_2,
      infoPortions.zat_b30_owl_scat_3,
    ]);

    let count: TCount = 3;

    for (const k of $range(1, table.length())) {
      if (hasInfoPortion(table.get(k)) || hasInfoPortion(table2.get(k))) {
        count -= 1;
      }
    }

    return count > 0;
  }
);

/**
 * Check whether the actor has at least 1000 money.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 * @returns Whether the actor owns 1000 money or more.
 */
extern("dialogs_zaton.zat_b30_actor_has_1000", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return registry.actor.money() >= 1000;
});

/**
 * Check whether the actor has at least 200 money.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 * @returns Whether the actor owns 200 money or more.
 */
extern("dialogs_zaton.zat_b30_actor_has_200", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return registry.actor.money() >= 200;
});

/**
 * Check whether the actor carries the Pripyat monolith hiding place PDA.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 * @returns Whether the actor owns the monolith hiding place PDA quest item.
 */
extern(
  "dialogs_zaton.zat_b30_actor_has_pri_b36_monolith_hiding_place_pda",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
    return $isNotNil(registry.actor.object(questItems.pri_b36_monolith_hiding_place_pda));
  }
);

/**
 * Check whether the actor carries the envoy PDA.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 * @returns Whether the actor owns the envoy PDA quest item.
 */
extern(
  "dialogs_zaton.zat_b30_actor_has_pri_b306_envoy_pda",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
    return $isNotNil(registry.actor.object(questItems.pri_b306_envoy_pda));
  }
);

/**
 * Check whether the actor carries the first part of Strelok notes.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 * @returns Whether the actor owns the first Strelok notes quest item.
 */
extern(
  "dialogs_zaton.zat_b30_actor_has_jup_b10_strelok_notes_1",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
    return $isNotNil(registry.actor.object(questItems.jup_b10_notes_01));
  }
);

/**
 * Check whether the actor carries the second part of Strelok notes.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 * @returns Whether the actor owns the second Strelok notes quest item.
 */
extern(
  "dialogs_zaton.zat_b30_actor_has_jup_b10_strelok_notes_2",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
    return $isNotNil(registry.actor.object(questItems.jup_b10_notes_02));
  }
);

/**
 * Check whether the actor carries the third part of Strelok notes.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 * @returns Whether the actor owns the third Strelok notes quest item.
 */
extern(
  "dialogs_zaton.zat_b30_actor_has_jup_b10_strelok_notes_3",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
    return $isNotNil(registry.actor.object(questItems.jup_b10_notes_03));
  }
);

/**
 * Check whether the actor carries a scientific detector.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 * @returns Whether the actor owns the scientific detector.
 */
extern(
  "dialogs_zaton.zat_b30_actor_has_detector_scientific",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
    return $isNotNil(registry.actor.object(detectors.detector_scientific));
  }
);

/**
 * Check whether the actor carries the flash drive quest item.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 * @returns Whether the actor owns the flash drive quest item.
 */
extern(
  "dialogs_zaton.zat_b30_actor_has_device_flash_snag",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
    return $isNotNil(registry.actor.object(questItems.device_flash_snag));
  }
);

/**
 * Check whether the actor carries the port bandit leader PDA.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 * @returns Whether the actor owns the port bandit leader PDA quest item.
 */
extern(
  "dialogs_zaton.zat_b30_actor_has_device_pda_port_bandit_leader",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
    return $isNotNil(registry.actor.object(questItems.device_pda_port_bandit_leader));
  }
);

/**
 * Check whether the actor carries the UFO memory device.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 * @returns Whether the actor owns the UFO memory quest item.
 */
extern(
  "dialogs_zaton.zat_b30_actor_has_jup_b10_ufo_memory",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
    return $isNotNil(registry.actor.object(questItems.jup_b10_ufo_memory_2));
  }
);

/**
 * Check whether the actor carries the bandit PDA from Jupiter.
 *
 * @param firstSpeaker - First participant of the dialog (actor).
 * @param secondSpeaker - Second participant of the dialog (NPC).
 * @returns Whether the actor owns the bandit PDA quest item.
 */
extern(
  "dialogs_zaton.zat_b30_actor_has_jup_b202_bandit_pda",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
    return $isNotNil(registry.actor.object(questItems.jup_b202_bandit_pda));
  }
);

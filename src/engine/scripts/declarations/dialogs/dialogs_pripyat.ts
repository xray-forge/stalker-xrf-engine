import { GameObject } from "xray16/alias";
import { $filename, $fromArray } from "xray16/macros";

import { registry } from "@/engine/core/database";
import { extern, getExtern } from "@/engine/core/utils/binding";
import { getNpcSpeaker } from "@/engine/core/utils/dialog";
import { disableInfoPortion, giveInfoPortion, hasInfoPortion } from "@/engine/core/utils/info_portion";
import { LuaLogger } from "@/engine/core/utils/logging";
import {
  giveMoneyToActor,
  transferItemsFromActor,
  transferItemsToActor,
  transferMoneyFromActor,
} from "@/engine/core/utils/reward";
import { infoPortions, TInfoPortion } from "@/engine/lib/constants/info_portions/info_portions";
import { TInventoryItem } from "@/engine/lib/constants/items";
import { ammo, TAmmoItem } from "@/engine/lib/constants/items/ammo";
import { artefacts } from "@/engine/lib/constants/items/artefacts";
import { drugs } from "@/engine/lib/constants/items/drugs";
import { food } from "@/engine/lib/constants/items/food";
import { helmets } from "@/engine/lib/constants/items/helmets";
import { outfits } from "@/engine/lib/constants/items/outfits";
import { questItems } from "@/engine/lib/constants/items/quest_items";
import { weapons } from "@/engine/lib/constants/items/weapons";
import { AnyCallable, LuaArray, TCount } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

logger.info("Resolve and bind dialogs pripyat");

/**
 * Declare globals object.
 */
extern("dialogs_pripyat", {});

/**
 * Transfer the PKM machine gun reward from Zulus to the actor.
 *
 * @param firstSpeaker - One of the dialog speakers, actor or NPC.
 * @param secondSpeaker - One of the dialog speakers, actor or NPC.
 */
extern("dialogs_pripyat.pri_b301_zulus_reward", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  transferItemsToActor(getNpcSpeaker(firstSpeaker, secondSpeaker), weapons.wpn_pkm_zulus);
});

/**
 * Give the actor a money reward for the pri_a17 quest, scaled by the outcome info portion.
 *
 * @param firstSpeaker - One of the dialog speakers, actor or NPC.
 * @param secondSpeaker - One of the dialog speakers, actor or NPC.
 */
extern("dialogs_pripyat.pri_a17_reward", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  if (hasInfoPortion(infoPortions.pri_a17_reward_well)) {
    giveMoneyToActor(7500);
  } else if (hasInfoPortion(infoPortions.pri_a17_reward_norm)) {
    giveMoneyToActor(4000);
  } else if (hasInfoPortion(infoPortions.pri_a17_reward_bad)) {
    giveMoneyToActor(3000);
  }
});

/**
 * Check whether the actor possesses the pri_a17 gauss rifle.
 *
 * @param firstSpeaker - One of the dialog speakers, actor or NPC.
 * @param secondSpeaker - One of the dialog speakers, actor or NPC.
 * @returns Whether the actor has the pri_a17 gauss rifle in inventory.
 */
extern(
  "dialogs_pripyat.actor_has_pri_a17_gauss_rifle",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
    return registry.actor.object("pri_a17_gauss_rifle") !== null;
  }
);

/**
 * Check whether the actor does not possess the pri_a17 gauss rifle.
 *
 * @param firstSpeaker - One of the dialog speakers, actor or NPC.
 * @param secondSpeaker - One of the dialog speakers, actor or NPC.
 * @returns Whether the actor is missing the pri_a17 gauss rifle.
 */
extern(
  "dialogs_pripyat.actor_hasnt_pri_a17_gauss_rifle",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
    return !getExtern<AnyCallable>("actor_has_pri_a17_gauss_rifle", getExtern("dialogs_pripyat"))(
      firstSpeaker,
      secondSpeaker
    );
  }
);

/**
 * Transfer the af_baloon artefact from the NPC to the actor.
 *
 * @param firstSpeaker - One of the dialog speakers, actor or NPC.
 * @param secondSpeaker - One of the dialog speakers, actor or NPC.
 */
extern("dialogs_pripyat.transfer_artifact_af_baloon", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  transferItemsToActor(getNpcSpeaker(firstSpeaker, secondSpeaker), artefacts.af_baloon);
});

/**
 * Take the guide fee for travel to Zaton from the actor, discounted if maps were already given.
 *
 * @param firstSpeaker - One of the dialog speakers, actor or NPC.
 * @param secondSpeaker - One of the dialog speakers, actor or NPC.
 */
extern("dialogs_pripyat.pay_cost_to_guide_to_zaton", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  if (hasInfoPortion(infoPortions.zat_b215_gave_maps)) {
    transferMoneyFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), 1000);
  } else {
    transferMoneyFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), 3000);
  }
});

/**
 * Check whether the actor has enough money for the Zaton guide fee, discounted if maps were given.
 *
 * @param firstSpeaker - One of the dialog speakers, actor or NPC.
 * @param secondSpeaker - One of the dialog speakers, actor or NPC.
 * @returns Whether the actor can afford the Zaton guide fee.
 */
extern(
  "dialogs_pripyat.jup_b43_actor_has_10000_money",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
    if (hasInfoPortion(infoPortions.zat_b215_gave_maps)) {
      return registry.actor.money() >= 3000;
    }

    return registry.actor.money() >= 5000;
  }
);

/**
 * Check whether the actor cannot afford the Zaton guide fee.
 *
 * @param firstSpeaker - One of the dialog speakers, actor or NPC.
 * @param secondSpeaker - One of the dialog speakers, actor or NPC.
 * @returns Whether the actor lacks enough money for the Zaton guide fee.
 */
extern(
  "dialogs_pripyat.jup_b43_actor_do_not_has_10000_money",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
    return !getExtern<AnyCallable>("jup_b43_actor_has_10000_money", getExtern("dialogs_pripyat"))(
      firstSpeaker,
      secondSpeaker
    );
  }
);

/**
 * Take the guide fee for travel to Jupiter from the actor.
 *
 * @param firstSpeaker - One of the dialog speakers, actor or NPC.
 * @param secondSpeaker - One of the dialog speakers, actor or NPC.
 */
extern("dialogs_pripyat.pay_cost_to_guide_to_jupiter", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  transferMoneyFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), 7000);
});

/**
 * Check whether the actor has at least 7000 money for the Jupiter guide fee.
 *
 * @param firstSpeaker - One of the dialog speakers, actor or NPC.
 * @param secondSpeaker - One of the dialog speakers, actor or NPC.
 * @returns Whether the actor has at least 7000 money.
 */
extern(
  "dialogs_pripyat.jup_b43_actor_has_7000_money",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
    return registry.actor.money() >= 7000;
  }
);

/**
 * Check whether the actor has less than 7000 money for the Jupiter guide fee.
 *
 * @param firstSpeaker - One of the dialog speakers, actor or NPC.
 * @param secondSpeaker - One of the dialog speakers, actor or NPC.
 * @returns Whether the actor has less than 7000 money.
 */
extern(
  "dialogs_pripyat.jup_b43_actor_do_not_has_7000_money",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
    return registry.actor.money() < 7000;
  }
);

/**
 * Transfer the SVD rifle and its ammunition from the NPC to the actor.
 *
 * @param firstSpeaker - One of the dialog speakers, actor or NPC.
 * @param secondSpeaker - One of the dialog speakers, actor or NPC.
 */
extern("dialogs_pripyat.pri_b35_transfer_svd", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  transferItemsToActor(getNpcSpeaker(firstSpeaker, secondSpeaker), weapons.wpn_svd);
  transferItemsToActor(getNpcSpeaker(firstSpeaker, secondSpeaker), ammo["ammo_7.62x54_7h1"]);
});

/**
 * Give the actor the pri_b35 ammunition reward, tripled when the secondary objective is completed.
 *
 * @param firstSpeaker - One of the dialog speakers, actor or NPC.
 * @param secondSpeaker - One of the dialog speakers, actor or NPC.
 */
extern("dialogs_pripyat.pri_b35_give_actor_reward", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  const amount: TCount = hasInfoPortion(infoPortions.pri_b35_secondary) ? 3 : 1;

  transferItemsToActor(getNpcSpeaker(firstSpeaker, secondSpeaker), ammo["ammo_7.62x54_7h1"], amount);
});

/**
 * Descriptor of the medkit supply contents granted for each pri_a25 medic kit tier.
 */
const medicItemsTable = {
  ["basic"]: {
    [food.conserva]: 2,
    [drugs.medkit_army]: 2,
    [drugs.antirad]: 2,
    [drugs.bandage]: 4,
  },
  ["advanced"]: {
    [food.conserva]: 3,
    [drugs.medkit_army]: 3,
    [drugs.antirad]: 3,
    [drugs.bandage]: 5,
  },
  ["elite"]: {
    [food.conserva]: 4,
    [drugs.medkit_army]: 5,
    [drugs.antirad]: 5,
    [drugs.bandage]: 8,
  },
} as unknown as LuaTable<TInfoPortion, LuaTable<TInventoryItem, TCount>>;

/**
 * Transfer the medkit supplies to the actor based on the requested kit tier and disable that request.
 *
 * @param firstSpeaker - One of the dialog speakers, actor or NPC.
 * @param secondSpeaker - One of the dialog speakers, actor or NPC.
 */
extern("dialogs_pripyat.pri_a25_medic_give_kit", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  let kit = "basic";

  if (hasInfoPortion(infoPortions.pri_a25_actor_needs_medikit_advanced_supply)) {
    kit = "advanced";
  } else if (hasInfoPortion(infoPortions.pri_a25_actor_needs_medikit_elite_supply)) {
    kit = "elite";
  }

  for (const [key, itemsList] of medicItemsTable) {
    if (key === kit) {
      for (const [section, count] of itemsList) {
        transferItemsToActor(getNpcSpeaker(firstSpeaker, secondSpeaker), section, count);
      }

      disableInfoPortion(key);
    }
  }
});

const suppliesList = {
  ["supply_ammo_1"]: { ["ammo_9x18_fmj"]: 2, ["ammo_9x18_pmm"]: 1 },
  ["supply_ammo_2"]: { ["ammo_9x19_fmj"]: 2, ["ammo_9x19_pbp"]: 1 },
  ["supply_ammo_3"]: { ["ammo_11.43x23_fmj"]: 2, ["ammo_11.43x23_hydro"]: 1 },
  ["supply_ammo_4"]: { ["ammo_12x70_buck"]: 10, ["ammo_12x76_zhekan"]: 5 },
  ["supply_ammo_5"]: { ["ammo_5.45x39_fmj"]: 2, ["ammo_5.45x39_ap"]: 1 },
  ["supply_ammo_6"]: { ["ammo_5.56x45_ss190"]: 2, ["ammo_5.56x45_ap"]: 1 },
  ["supply_ammo_7"]: { ["ammo_9x39_pab9"]: 1, ["ammo_9x39_ap"]: 1 },
  ["supply_ammo_8"]: { ["ammo_7.62x54_7h1"]: 1 },
  ["supply_ammo_9"]: { ["ammo_pkm_100"]: 1 },
  ["supply_grenade_1"]: { ["grenade_rgd5"]: 3, ["grenade_f1"]: 2 },
  ["supply_grenade_2"]: { ["ammo_vog-25"]: 3 },
  ["supply_grenade_3"]: { ["ammo_m209"]: 3 },
} as unknown as LuaTable<TInfoPortion, LuaTable<TAmmoItem, TCount>>;

extern("dialogs_pripyat.pri_a22_army_signaller_supply", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  for (const [name, itemsList] of suppliesList) {
    if (hasInfoPortion(name)) {
      for (const [section, amount] of itemsList) {
        transferItemsToActor(getNpcSpeaker(firstSpeaker, secondSpeaker), section, amount);
      }

      disableInfoPortion(name);
    }
  }
});

/**
 * Transfer the military outfit and battle helmet from the NPC to the actor.
 *
 * @param firstSpeaker - One of the dialog speakers, actor or NPC.
 * @param secondSpeaker - One of the dialog speakers, actor or NPC.
 */
extern("dialogs_pripyat.pri_a22_give_actor_outfit", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  transferItemsToActor(getNpcSpeaker(firstSpeaker, secondSpeaker), outfits.military_outfit);
  transferItemsToActor(getNpcSpeaker(firstSpeaker, secondSpeaker), helmets.helm_battle);
});

/**
 * Check whether the actor carries at least one of Strelok's notes.
 *
 * @returns Whether the actor has any of the three Strelok notes.
 */
extern("dialogs_pripyat.pri_b305_actor_has_strelok_notes", (): boolean => {
  const actor: GameObject = registry.actor;

  return (
    actor.object(questItems.jup_b10_notes_01) !== null ||
    actor.object(questItems.jup_b10_notes_02) !== null ||
    actor.object(questItems.jup_b10_notes_03) !== null
  );
});

/**
 * Check whether the actor carries only Strelok's first note.
 *
 * @returns Whether the actor has note 1 and neither note 2 nor note 3.
 */
extern("dialogs_pripyat.pri_b305_actor_has_strelok_note_1", (): boolean => {
  const actor: GameObject = registry.actor;

  return (
    actor.object(questItems.jup_b10_notes_01) !== null &&
    actor.object(questItems.jup_b10_notes_02) === null &&
    actor.object(questItems.jup_b10_notes_03) === null
  );
});

/**
 * Check whether the actor carries only Strelok's second note.
 *
 * @returns Whether the actor has note 2 and neither note 1 nor note 3.
 */
extern("dialogs_pripyat.pri_b305_actor_has_strelok_note_2", (): boolean => {
  const actor: GameObject = registry.actor;

  return (
    actor.object(questItems.jup_b10_notes_02) !== null &&
    actor.object(questItems.jup_b10_notes_01) === null &&
    actor.object(questItems.jup_b10_notes_03) === null
  );
});

/**
 * Check whether the actor carries only Strelok's third note.
 *
 * @returns Whether the actor has note 3 and neither note 1 nor note 2.
 */
extern("dialogs_pripyat.pri_b305_actor_has_strelok_note_3", (): boolean => {
  const actor: GameObject = registry.actor;

  return (
    actor.object(questItems.jup_b10_notes_03) !== null &&
    actor.object(questItems.jup_b10_notes_01) === null &&
    actor.object(questItems.jup_b10_notes_02) === null
  );
});

/**
 * Check whether the actor carries Strelok's first and second notes but not the third.
 *
 * @returns Whether the actor has notes 1 and 2 but not note 3.
 */
extern("dialogs_pripyat.pri_b305_actor_has_strelok_note_12", (): boolean => {
  const actor: GameObject = registry.actor;

  return (
    actor.object(questItems.jup_b10_notes_01) !== null &&
    actor.object(questItems.jup_b10_notes_02) !== null &&
    actor.object(questItems.jup_b10_notes_03) === null
  );
});

/**
 * Check whether the actor carries Strelok's first and third notes but not the second.
 *
 * @returns Whether the actor has notes 1 and 3 but not note 2.
 */
extern("dialogs_pripyat.pri_b305_actor_has_strelok_note_13", (): boolean => {
  const actor: GameObject = registry.actor;

  return (
    actor.object(questItems.jup_b10_notes_01) !== null &&
    actor.object(questItems.jup_b10_notes_03) !== null &&
    actor.object(questItems.jup_b10_notes_02) === null
  );
});

/**
 * Check whether the actor carries Strelok's second and third notes but not the first.
 *
 * @returns Whether the actor has notes 2 and 3 but not note 1.
 */
extern("dialogs_pripyat.pri_b305_actor_has_strelok_note_23", (): boolean => {
  const actor: GameObject = registry.actor;

  return (
    actor.object(questItems.jup_b10_notes_02) !== null &&
    actor.object(questItems.jup_b10_notes_03) !== null &&
    actor.object(questItems.jup_b10_notes_01) === null
  );
});

/**
 * Check whether the actor carries all three of Strelok's notes.
 *
 * @returns Whether the actor has notes 1, 2 and 3.
 */
extern("dialogs_pripyat.pri_b305_actor_has_strelok_note_all", (): boolean => {
  const actor: GameObject = registry.actor;

  return (
    actor.object(questItems.jup_b10_notes_01) !== null &&
    actor.object(questItems.jup_b10_notes_02) !== null &&
    actor.object(questItems.jup_b10_notes_03) !== null
  );
});

/**
 * Take Strelok's notes from the actor and give rewards scaled to how many notes were handed over.
 *
 * @param firstSpeaker - One of the dialog speakers, actor or NPC.
 * @param secondSpeaker - One of the dialog speakers, actor or NPC.
 */
extern("dialogs_pripyat.pri_b305_sell_strelok_notes", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  const itemsTable: LuaArray<string> = $fromArray<string>([
    questItems.jup_b10_notes_01,
    questItems.jup_b10_notes_02,
    questItems.jup_b10_notes_03,
  ]);
  const actor: GameObject = registry.actor;

  let amount: number = 0;

  for (const [k, v] of itemsTable) {
    if (actor.object(v) !== null) {
      transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), v);
      amount = amount + 1;
    }
  }

  if (actor.object(weapons.wpn_gauss) !== null) {
    transferItemsToActor(getNpcSpeaker(firstSpeaker, secondSpeaker), ammo.ammo_gauss, 2);
  } else {
    transferItemsToActor(getNpcSpeaker(firstSpeaker, secondSpeaker), drugs.medkit_scientic, 3);
  }

  if (amount > 1) {
    transferItemsToActor(getNpcSpeaker(firstSpeaker, secondSpeaker), artefacts.af_fire);
  }

  if (amount > 2) {
    transferItemsToActor(getNpcSpeaker(firstSpeaker, secondSpeaker), artefacts.af_glass);
    giveInfoPortion(infoPortions.pri_b305_all_strelok_notes_given);
  }
});

/**
 * Check whether Sokolov is no longer at the base because he left and died.
 *
 * @param firstSpeaker - One of the dialog speakers, actor or NPC.
 * @param secondSpeaker - One of the dialog speakers, actor or NPC.
 * @returns Whether Sokolov has left the base and is dead.
 */
extern(
  "dialogs_pripyat.pri_a17_sokolov_is_not_at_base",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
    return hasInfoPortion(infoPortions.pri_a15_sokolov_out) && hasInfoPortion(infoPortions.pas_b400_sokolov_dead);
  }
);

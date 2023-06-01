import { registry } from "@/engine/core/database";
import { extern, getExtern } from "@/engine/core/utils/binding";
import { disableInfo, giveInfo, hasAlifeInfo } from "@/engine/core/utils/info_portion";
import { LuaLogger } from "@/engine/core/utils/logging";
import {
  getNpcSpeaker,
  giveMoneyToActor,
  transferItemsFromActor,
  transferItemsToActor,
  transferMoneyFromActor,
} from "@/engine/core/utils/task_reward";
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
import { AnyCallable, ClientObject, LuaArray, TCount } from "@/engine/lib/types";

const log: LuaLogger = new LuaLogger($filename);

extern("dialogs_pripyat", {});

/**
 * todo;
 */
extern("dialogs_pripyat.pri_b301_zulus_reward", (firstSpeaker: ClientObject, secondSpeaker: ClientObject): void => {
  transferItemsToActor(getNpcSpeaker(firstSpeaker, secondSpeaker), weapons.wpn_pkm_zulus);
});

/**
 * todo;
 */
extern("dialogs_pripyat.pri_a17_reward", (firstSpeaker: ClientObject, secondSpeaker: ClientObject): void => {
  if (hasAlifeInfo(infoPortions.pri_a17_reward_well)) {
    giveMoneyToActor(7500);
  } else if (hasAlifeInfo(infoPortions.pri_a17_reward_norm)) {
    giveMoneyToActor(4000);
  } else if (hasAlifeInfo(infoPortions.pri_a17_reward_bad)) {
    giveMoneyToActor(3000);
  }
});

/**
 * todo;
 */
extern(
  "dialogs_pripyat.actor_has_pri_a17_gauss_rifle",
  (firstSpeaker: ClientObject, secondSpeaker: ClientObject): boolean => {
    return registry.actor.object("pri_a17_gauss_rifle") !== null;
  }
);

/**
 * todo;
 */
extern(
  "dialogs_pripyat.actor_hasnt_pri_a17_gauss_rifle",
  (firstSpeaker: ClientObject, secondSpeaker: ClientObject): boolean => {
    return !getExtern<AnyCallable>("actor_has_pri_a17_gauss_rifle", getExtern("dialogs_pripyat"))(
      firstSpeaker,
      secondSpeaker
    );
  }
);

/**
 * todo;
 */
extern(
  "dialogs_pripyat.transfer_artifact_af_baloon",
  (firstSpeaker: ClientObject, secondSpeaker: ClientObject): void => {
    transferItemsToActor(getNpcSpeaker(firstSpeaker, secondSpeaker), artefacts.af_baloon);
  }
);

/**
 * todo;
 */
extern(
  "dialogs_pripyat.pay_cost_to_guide_to_zaton",
  (firstSpeaker: ClientObject, secondSpeaker: ClientObject): void => {
    if (hasAlifeInfo(infoPortions.zat_b215_gave_maps)) {
      transferMoneyFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), 1000);
    } else {
      transferMoneyFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), 3000);
    }
  }
);

/**
 * todo;
 */
extern(
  "dialogs_pripyat.jup_b43_actor_has_10000_money",
  (firstSpeaker: ClientObject, secondSpeaker: ClientObject): boolean => {
    if (hasAlifeInfo(infoPortions.zat_b215_gave_maps)) {
      return registry.actor.money() >= 3000;
    }

    return registry.actor.money() >= 5000;
  }
);

/**
 * todo;
 */
extern(
  "dialogs_pripyat.jup_b43_actor_do_not_has_10000_money",
  (firstSpeaker: ClientObject, secondSpeaker: ClientObject): boolean => {
    return !getExtern<AnyCallable>("jup_b43_actor_has_10000_money", getExtern("dialogs_pripyat"))(
      firstSpeaker,
      secondSpeaker
    );
  }
);

/**
 * todo;
 */
extern(
  "dialogs_pripyat.pay_cost_to_guide_to_jupiter",
  (firstSpeaker: ClientObject, secondSpeaker: ClientObject): void => {
    transferMoneyFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), 7000);
  }
);

/**
 * todo;
 */
extern(
  "dialogs_pripyat.jup_b43_actor_has_7000_money",
  (firstSpeaker: ClientObject, secondSpeaker: ClientObject): boolean => {
    return registry.actor.money() >= 7000;
  }
);

/**
 * todo;
 */
extern(
  "dialogs_pripyat.jup_b43_actor_do_not_has_7000_money",
  (firstSpeaker: ClientObject, secondSpeaker: ClientObject): boolean => {
    return registry.actor.money() < 7000;
  }
);

/**
 * todo;
 */
extern("dialogs_pripyat.pri_b35_transfer_svd", (firstSpeaker: ClientObject, secondSpeaker: ClientObject): void => {
  transferItemsToActor(getNpcSpeaker(firstSpeaker, secondSpeaker), weapons.wpn_svd);
  transferItemsToActor(getNpcSpeaker(firstSpeaker, secondSpeaker), ammo["ammo_7.62x54_7h1"]);
});

/**
 * todo;
 */
extern("dialogs_pripyat.pri_b35_give_actor_reward", (firstSpeaker: ClientObject, secondSpeaker: ClientObject): void => {
  const amount: TCount = hasAlifeInfo(infoPortions.pri_b35_secondary) ? 3 : 1;

  transferItemsToActor(getNpcSpeaker(firstSpeaker, secondSpeaker), ammo["ammo_7.62x54_7h1"], amount);
});

/**
 * todo;
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
 * todo;
 */
extern("dialogs_pripyat.pri_a25_medic_give_kit", (firstSpeaker: ClientObject, secondSpeaker: ClientObject): void => {
  let kit = "basic";

  if (hasAlifeInfo(infoPortions.pri_a25_actor_needs_medikit_advanced_supply)) {
    kit = "advanced";
  } else if (hasAlifeInfo(infoPortions.pri_a25_actor_needs_medikit_elite_supply)) {
    kit = "elite";
  }

  for (const [key, itemsList] of medicItemsTable) {
    if (key === kit) {
      for (const [section, count] of itemsList) {
        transferItemsToActor(getNpcSpeaker(firstSpeaker, secondSpeaker), section, count);
      }

      disableInfo(key);
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

extern(
  "dialogs_pripyat.pri_a22_army_signaller_supply",
  (firstSpeaker: ClientObject, secondSpeaker: ClientObject): void => {
    for (const [name, itemsList] of suppliesList) {
      if (hasAlifeInfo(name)) {
        for (const [section, amount] of itemsList) {
          transferItemsToActor(getNpcSpeaker(firstSpeaker, secondSpeaker), section, amount);
        }

        disableInfo(name);
      }
    }
  }
);

/**
 * todo;
 */
extern("dialogs_pripyat.pri_a22_give_actor_outfit", (firstSpeaker: ClientObject, secondSpeaker: ClientObject): void => {
  transferItemsToActor(getNpcSpeaker(firstSpeaker, secondSpeaker), outfits.military_outfit);
  transferItemsToActor(getNpcSpeaker(firstSpeaker, secondSpeaker), helmets.helm_battle);
});

/**
 * todo;
 */
extern("dialogs_pripyat.pri_b305_actor_has_strelok_notes", (): boolean => {
  const actor: ClientObject = registry.actor;

  return (
    actor.object(questItems.jup_b10_notes_01) !== null ||
    actor.object(questItems.jup_b10_notes_02) !== null ||
    actor.object(questItems.jup_b10_notes_03) !== null
  );
});

/**
 * todo;
 */
extern("dialogs_pripyat.pri_b305_actor_has_strelok_note_1", (): boolean => {
  const actor: ClientObject = registry.actor;

  return (
    actor.object(questItems.jup_b10_notes_01) !== null &&
    actor.object(questItems.jup_b10_notes_02) === null &&
    actor.object(questItems.jup_b10_notes_03) === null
  );
});

/**
 * todo;
 */
extern("dialogs_pripyat.pri_b305_actor_has_strelok_note_2", (): boolean => {
  const actor: ClientObject = registry.actor;

  return (
    actor.object(questItems.jup_b10_notes_02) !== null &&
    actor.object(questItems.jup_b10_notes_01) === null &&
    actor.object(questItems.jup_b10_notes_03) === null
  );
});

/**
 * todo;
 */
extern("dialogs_pripyat.pri_b305_actor_has_strelok_note_3", (): boolean => {
  const actor: ClientObject = registry.actor;

  return (
    actor.object(questItems.jup_b10_notes_03) !== null &&
    actor.object(questItems.jup_b10_notes_01) === null &&
    actor.object(questItems.jup_b10_notes_02) === null
  );
});

/**
 * todo;
 */
extern("dialogs_pripyat.pri_b305_actor_has_strelok_note_12", (): boolean => {
  const actor: ClientObject = registry.actor;

  return (
    actor.object(questItems.jup_b10_notes_01) !== null &&
    actor.object(questItems.jup_b10_notes_02) !== null &&
    actor.object(questItems.jup_b10_notes_03) === null
  );
});

/**
 * todo;
 */
extern("dialogs_pripyat.pri_b305_actor_has_strelok_note_13", (): boolean => {
  const actor: ClientObject = registry.actor;

  return (
    actor.object(questItems.jup_b10_notes_01) !== null &&
    actor.object(questItems.jup_b10_notes_03) !== null &&
    actor.object(questItems.jup_b10_notes_02) === null
  );
});

/**
 * todo;
 */
extern("dialogs_pripyat.pri_b305_actor_has_strelok_note_23", (): boolean => {
  const actor: ClientObject = registry.actor;

  return (
    actor.object(questItems.jup_b10_notes_02) !== null &&
    actor.object(questItems.jup_b10_notes_03) !== null &&
    actor.object(questItems.jup_b10_notes_01) === null
  );
});

/**
 * todo;
 */
extern("dialogs_pripyat.pri_b305_actor_has_strelok_note_all", (): boolean => {
  const actor: ClientObject = registry.actor;

  return (
    actor.object(questItems.jup_b10_notes_01) !== null &&
    actor.object(questItems.jup_b10_notes_02) !== null &&
    actor.object(questItems.jup_b10_notes_03) !== null
  );
});

/**
 * todo;
 */
extern(
  "dialogs_pripyat.pri_b305_sell_strelok_notes",
  (firstSpeaker: ClientObject, secondSpeaker: ClientObject): void => {
    const itemsTable: LuaArray<string> = $fromArray<string>([
      questItems.jup_b10_notes_01,
      questItems.jup_b10_notes_02,
      questItems.jup_b10_notes_03,
    ]);
    const actor: ClientObject = registry.actor;

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
      giveInfo(infoPortions.pri_b305_all_strelok_notes_given);
    }
  }
);

/**
 * todo;
 */
extern(
  "dialogs_pripyat.pri_a17_sokolov_is_not_at_base",
  (firstSpeaker: ClientObject, secondSpeaker: ClientObject): boolean => {
    return hasAlifeInfo(infoPortions.pri_a15_sokolov_out) && hasAlifeInfo(infoPortions.pas_b400_sokolov_dead);
  }
);

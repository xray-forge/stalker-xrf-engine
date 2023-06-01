/* eslint @typescript-eslint/explicit-function-return-type: "error" */

import { alife } from "xray16";

import { registry } from "@/engine/core/database";
import { getPortableStoreValue } from "@/engine/core/database/portable_store";
import { TreasureManager } from "@/engine/core/managers/world/TreasureManager";
import { AnomalyZoneBinder } from "@/engine/core/objects/binders/zones/AnomalyZoneBinder";
import { extern, getExtern } from "@/engine/core/utils/binding";
import { isActorEnemyWithFaction } from "@/engine/core/utils/check/check";
import { disableInfo, giveInfo, hasAlifeInfo } from "@/engine/core/utils/info_portion";
import { LuaLogger } from "@/engine/core/utils/logging";
import { getObjectsRelationSafe } from "@/engine/core/utils/relation";
import {
  getNpcSpeaker,
  giveItemsToActor,
  giveMoneyToActor,
  isObjectName,
  transferItemsFromActor,
  transferItemsToActor,
  transferMoneyFromActor,
} from "@/engine/core/utils/task_reward";
import { communities } from "@/engine/lib/constants/communities";
import { infoPortions, TInfoPortion } from "@/engine/lib/constants/info_portions/info_portions";
import { ammo } from "@/engine/lib/constants/items/ammo";
import { artefacts, TArtefact } from "@/engine/lib/constants/items/artefacts";
import { detectors } from "@/engine/lib/constants/items/detectors";
import { drugs } from "@/engine/lib/constants/items/drugs";
import { food } from "@/engine/lib/constants/items/food";
import { helmets, THelmet } from "@/engine/lib/constants/items/helmets";
import { misc } from "@/engine/lib/constants/items/misc";
import { outfits, TOutfit } from "@/engine/lib/constants/items/outfits";
import { questItems } from "@/engine/lib/constants/items/quest_items";
import { weapons } from "@/engine/lib/constants/items/weapons";
import { treasures } from "@/engine/lib/constants/treasures";
import {
  AnyCallable,
  AnyCallablesModule,
  AnyObject,
  ClientObject,
  EClientObjectRelation,
  LuaArray,
  Optional,
  PartialRecord,
  ServerCreatureObject,
  TCount,
  TIndex,
  TName,
  TSection,
} from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

extern("dialogs_jupiter", {});

/**
 * todo;
 */
extern("dialogs_jupiter.jup_b208_give_reward", (firstSpeaker: ClientObject, secondSpeaker: ClientObject): void => {
  giveMoneyToActor(5000);

  const treasureManager: TreasureManager = TreasureManager.getInstance();

  treasureManager.giveActorTreasureCoordinates(treasures.jup_hiding_place_18);
  treasureManager.giveActorTreasureCoordinates(treasures.jup_hiding_place_35);
  treasureManager.giveActorTreasureCoordinates(treasures.jup_hiding_place_45);
});

/**
 * todo;
 */
extern(
  "dialogs_jupiter.jupiter_a9_actor_hasnt_all_mail_items",
  (firstSpeaker: ClientObject, secondSpeaker: ClientObject): boolean => {
    return !getExtern<AnyCallable>("jupiter_a9_actor_has_all_mail_items", getExtern("dialogs_jupiter"))(
      firstSpeaker,
      secondSpeaker
    );
  }
);

/**
 * todo;
 */
extern(
  "dialogs_jupiter.jupiter_a9_actor_has_all_mail_items",
  (firstSpeaker: ClientObject, secondSpeaker: ClientObject): boolean => {
    const actor: ClientObject = registry.actor;

    return (
      actor.object(questItems.jup_a9_conservation_info) !== null &&
      actor.object(questItems.jup_a9_power_info) !== null &&
      actor.object(questItems.jup_a9_way_info) !== null
    );
  }
);

/**
 * todo;
 */
extern(
  "dialogs_jupiter.jupiter_a9_actor_has_any_items",
  (firstSpeaker: ClientObject, secondSpeaker: ClientObject): boolean => {
    const actor: ClientObject = registry.actor;

    return (
      actor.object(questItems.jup_a9_delivery_info) !== null ||
      actor.object(questItems.jup_a9_evacuation_info) !== null ||
      actor.object(questItems.jup_a9_losses_info) !== null ||
      actor.object(questItems.jup_a9_power_info) !== null ||
      actor.object(questItems.jup_a9_conservation_info) !== null ||
      actor.object(questItems.jup_a9_way_info) !== null ||
      actor.object(questItems.jup_a9_meeting_info) !== null
    );
  }
);

/**
 * todo;
 */
extern(
  "dialogs_jupiter.jupiter_a9_actor_has_any_mail_items",
  (firstSpeaker: ClientObject, secondSpeaker: ClientObject): boolean => {
    const actor: ClientObject = registry.actor;

    return (
      actor.object(questItems.jup_a9_conservation_info) !== null ||
      actor.object(questItems.jup_a9_power_info) !== null ||
      actor.object(questItems.jup_a9_way_info) !== null
    );
  }
);

/**
 * todo;
 */
extern(
  "dialogs_jupiter.jupiter_a9_actor_has_any_secondary_items",
  (firstSpeaker: ClientObject, secondSpeaker: ClientObject): boolean => {
    const actor: ClientObject = registry.actor;

    return (
      actor.object(questItems.jup_a9_delivery_info) !== null ||
      actor.object(questItems.jup_a9_evacuation_info) !== null ||
      actor.object(questItems.jup_a9_losses_info) !== null ||
      actor.object(questItems.jup_a9_meeting_info) !== null
    );
  }
);

/**
 * todo;
 */
extern(
  "dialogs_jupiter.jupiter_a9_actor_hasnt_any_mail_items",
  (firstSpeaker: ClientObject, secondSpeaker: ClientObject): boolean => {
    const actor: ClientObject = registry.actor;

    return (
      actor.object(questItems.jup_a9_conservation_info) === null ||
      actor.object(questItems.jup_a9_power_info) === null ||
      actor.object(questItems.jup_a9_way_info) === null
    );
  }
);

/**
 * todo;
 */
extern(
  "dialogs_jupiter.jupiter_a9_freedom_leader_jupiter_delivery",
  (firstSpeaker: ClientObject, secondSpeaker: ClientObject): void => {
    giveMoneyToActor(500);
  }
);

/**
 * todo;
 */
extern(
  "dialogs_jupiter.jupiter_a9_freedom_leader_jupiter_evacuation",
  (firstSpeaker: ClientObject, secondSpeaker: ClientObject): void => {
    giveMoneyToActor(500);
  }
);

/**
 * todo;
 */
extern(
  "dialogs_jupiter.jupiter_a9_freedom_leader_jupiter_losses",
  (firstSpeaker: ClientObject, secondSpeaker: ClientObject): void => {
    giveMoneyToActor(500);
  }
);

/**
 * todo;
 */
extern(
  "dialogs_jupiter.jupiter_a9_freedom_leader_jupiter_meeting",
  (firstSpeaker: ClientObject, secondSpeaker: ClientObject): void => {
    giveMoneyToActor(500);
  }
);

/**
 * todo;
 */
extern(
  "dialogs_jupiter.jupiter_a9_dolg_leader_jupiter_delivery",
  (firstSpeaker: ClientObject, secondSpeaker: ClientObject): void => {
    giveMoneyToActor(500);
  }
);

/**
 * todo;
 */
extern(
  "dialogs_jupiter.jupiter_a9_dolg_leader_jupiter_evacuation",
  (firstSpeaker: ClientObject, secondSpeaker: ClientObject): void => {
    giveMoneyToActor(500);
  }
);

/**
 * todo;
 */
extern(
  "dialogs_jupiter.jupiter_a9_dolg_leader_jupiter_losses",
  (firstSpeaker: ClientObject, secondSpeaker: ClientObject): void => {
    giveMoneyToActor(500);
  }
);

/**
 * todo;
 */
extern(
  "dialogs_jupiter.jupiter_a9_dolg_leader_jupiter_meeting",
  (firstSpeaker: ClientObject, secondSpeaker: ClientObject): void => {
    giveMoneyToActor(500);
  }
);

/**
 * todo;
 */
extern(
  "dialogs_jupiter.jup_a9_owl_stalker_trader_sell_jup_a9_evacuation_info",
  (firstSpeaker: ClientObject, secondSpeaker: ClientObject): void => {
    transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), questItems.jup_a9_evacuation_info);
    giveMoneyToActor(750);
    giveInfo(infoPortions.jup_a9_evacuation_info_sold);
  }
);

/**
 * todo;
 */
extern(
  "dialogs_jupiter.jup_a9_owl_stalker_trader_sell_jup_a9_meeting_info",
  (firstSpeaker: ClientObject, secondSpeaker: ClientObject): void => {
    transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), questItems.jup_a9_meeting_info);
    giveMoneyToActor(750);
    giveInfo(infoPortions.jup_a9_meeting_info_sold);
  }
);

/**
 * todo;
 */
extern(
  "dialogs_jupiter.jup_a9_owl_stalker_trader_sell_jup_a9_losses_info",
  (firstSpeaker: ClientObject, secondSpeaker: ClientObject): void => {
    transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), questItems.jup_a9_losses_info);
    giveMoneyToActor(750);
    giveInfo(infoPortions.jup_a9_losses_info_sold);
  }
);

/**
 * todo;
 */
extern(
  "dialogs_jupiter.jup_a9_owl_stalker_trader_sell_jup_a9_delivery_info",
  (firstSpeaker: ClientObject, secondSpeaker: ClientObject): void => {
    transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), questItems.jup_a9_delivery_info);
    giveMoneyToActor(750);
    giveInfo(infoPortions.jup_a9_delivery_info_sold);
  }
);

/**
 * todo;
 */
extern(
  "dialogs_jupiter.jupiter_a9_dolg_leader_jupiter_sell_all_secondary_items",
  (firstSpeaker: ClientObject, secondSpeaker: ClientObject): void => {
    if (
      getExtern<AnyCallable>("jup_a9_actor_has_evacuation_info", getExtern("dialogs_jupiter"))(
        firstSpeaker,
        secondSpeaker
      )
    ) {
      getExtern<AnyCallable>("actor_relocate_evacuation_info", getExtern("dialogs_jupiter"))(
        firstSpeaker,
        secondSpeaker
      );
      getExtern<AnyCallable>("jupiter_a9_dolg_leader_jupiter_evacuation", getExtern("dialogs_jupiter"))(
        firstSpeaker,
        secondSpeaker
      );
    }

    if (
      getExtern<AnyCallable>("jup_a9_actor_has_meeting_info", getExtern("dialogs_jupiter"))(firstSpeaker, secondSpeaker)
    ) {
      getExtern<AnyCallable>("actor_relocate_meeting_info", getExtern("dialogs_jupiter"))(firstSpeaker, secondSpeaker);
      getExtern<AnyCallable>("jupiter_a9_dolg_leader_jupiter_meeting", getExtern("dialogs_jupiter"))(
        firstSpeaker,
        secondSpeaker
      );
    }

    if (
      getExtern<AnyCallable>("jup_a9_actor_has_losses_info", getExtern("dialogs_jupiter"))(firstSpeaker, secondSpeaker)
    ) {
      getExtern<AnyCallable>("actor_relocate_losses_info", getExtern("dialogs_jupiter"))(firstSpeaker, secondSpeaker);
      getExtern<AnyCallable>("jupiter_a9_dolg_leader_jupiter_losses", getExtern("dialogs_jupiter"))(
        firstSpeaker,
        secondSpeaker
      );
    }

    if (
      getExtern<AnyCallable>("jup_a9_actor_has_delivery_info", getExtern("dialogs_jupiter"))(
        firstSpeaker,
        secondSpeaker
      )
    ) {
      getExtern<AnyCallable>("actor_relocate_delivery_info", getExtern("dialogs_jupiter"))(firstSpeaker, secondSpeaker);
      getExtern<AnyCallable>("jupiter_a9_dolg_leader_jupiter_delivery", getExtern("dialogs_jupiter"))(
        firstSpeaker,
        secondSpeaker
      );
    }
  }
);

/**
 * todo;
 */
extern(
  "dialogs_jupiter.jupiter_a9_freedom_leader_jupiter_sell_all_secondary_items",
  (firstSpeaker: ClientObject, secondSpeaker: ClientObject): void => {
    if (
      getExtern<AnyCallable>("jup_a9_actor_has_evacuation_info", getExtern("dialogs_jupiter"))(
        firstSpeaker,
        secondSpeaker
      )
    ) {
      getExtern<AnyCallable>("actor_relocate_evacuation_info", getExtern("dialogs_jupiter"))(
        firstSpeaker,
        secondSpeaker
      );
      getExtern<AnyCallable>("jupiter_a9_freedom_leader_jupiter_evacuation", getExtern("dialogs_jupiter"))(
        firstSpeaker,
        secondSpeaker
      );
    }

    if (
      getExtern<AnyCallable>("jup_a9_actor_has_meeting_info", getExtern("dialogs_jupiter"))(firstSpeaker, secondSpeaker)
    ) {
      getExtern<AnyCallable>("actor_relocate_meeting_info", getExtern("dialogs_jupiter"))(firstSpeaker, secondSpeaker);
      getExtern<AnyCallable>("jupiter_a9_freedom_leader_jupiter_meeting", getExtern("dialogs_jupiter"))(
        firstSpeaker,
        secondSpeaker
      );
    }

    if (
      getExtern<AnyCallable>("jup_a9_actor_has_losses_info", getExtern("dialogs_jupiter"))(firstSpeaker, secondSpeaker)
    ) {
      getExtern<AnyCallable>("actor_relocate_losses_info", getExtern("dialogs_jupiter"))(firstSpeaker, secondSpeaker);
      getExtern<AnyCallable>("jupiter_a9_freedom_leader_jupiter_losses", getExtern("dialogs_jupiter"))(
        firstSpeaker,
        secondSpeaker
      );
    }

    if (
      getExtern<AnyCallable>("jup_a9_actor_has_delivery_info", getExtern("dialogs_jupiter"))(
        firstSpeaker,
        secondSpeaker
      )
    ) {
      getExtern<AnyCallable>("actor_relocate_delivery_info", getExtern("dialogs_jupiter"))(firstSpeaker, secondSpeaker);
      getExtern<AnyCallable>("jupiter_a9_freedom_leader_jupiter_delivery", getExtern("dialogs_jupiter"))(
        firstSpeaker,
        secondSpeaker
      );
    }
  }
);

/**
 * todo;
 */
extern(
  "dialogs_jupiter.jup_a9_actor_has_conservation_info",
  (firstSpeaker: ClientObject, secondSpeaker: ClientObject): boolean => {
    return registry.actor.object(questItems.jup_a9_conservation_info) !== null;
  }
);

/**
 * todo;
 */
extern(
  "dialogs_jupiter.jup_a9_actor_hasnt_conservation_info",
  (firstSpeaker: ClientObject, secondSpeaker: ClientObject): boolean => {
    return !getExtern<AnyCallable>("jup_a9_actor_has_conservation_info", getExtern("dialogs_jupiter"))(
      firstSpeaker,
      secondSpeaker
    );
  }
);

/**
 * todo;
 */
extern(
  "dialogs_jupiter.actor_relocate_conservation_info",
  (firstSpeaker: ClientObject, secondSpeaker: ClientObject): void => {
    transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), questItems.jup_a9_conservation_info);
  }
);

/**
 * todo;
 */
extern(
  "dialogs_jupiter.jup_a9_actor_has_power_info",
  (firstSpeaker: ClientObject, secondSpeaker: ClientObject): boolean => {
    return registry.actor.object(questItems.jup_a9_power_info) !== null;
  }
);

/**
 * todo;
 */
extern(
  "dialogs_jupiter.jup_a9_actor_hasnt_power_info",
  (firstSpeaker: ClientObject, secondSpeaker: ClientObject): boolean => {
    return !getExtern<AnyCallable>("jup_a9_actor_has_power_info", getExtern("dialogs_jupiter"))(
      firstSpeaker,
      secondSpeaker
    );
  }
);

/**
 * todo;
 */
extern("dialogs_jupiter.actor_relocate_power_info", (firstSpeaker: ClientObject, secondSpeaker: ClientObject): void => {
  transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), questItems.jup_a9_power_info);
});

/**
 * todo;
 */
extern(
  "dialogs_jupiter.jup_a9_actor_has_way_info",
  (firstSpeaker: ClientObject, secondSpeaker: ClientObject): boolean => {
    return registry.actor.object(questItems.jup_a9_way_info) !== null;
  }
);

/**
 * todo;
 */
extern(
  "dialogs_jupiter.jup_a9_actor_hasnt_way_info",
  (firstSpeaker: ClientObject, secondSpeaker: ClientObject): boolean => {
    return !getExtern<AnyCallable>("jup_a9_actor_has_way_info", getExtern("dialogs_jupiter"))(
      firstSpeaker,
      secondSpeaker
    );
  }
);

/**
 * todo;
 */
extern("dialogs_jupiter.actor_relocate_way_info", (firstSpeaker: ClientObject, secondSpeaker: ClientObject): void => {
  transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), questItems.jup_a9_way_info);
});

/**
 * todo;
 */
extern(
  "dialogs_jupiter.jup_a9_actor_has_meeting_info",
  (firstSpeaker: ClientObject, secondSpeaker: ClientObject): boolean => {
    return registry.actor.object(questItems.jup_a9_meeting_info) !== null;
  }
);

/**
 * todo;
 */
extern(
  "dialogs_jupiter.jup_a9_actor_hasnt_meeting_info",
  (firstSpeaker: ClientObject, secondSpeaker: ClientObject): boolean => {
    return !getExtern<AnyCallable>("jup_a9_actor_has_meeting_info", getExtern("dialogs_jupiter"))(
      firstSpeaker,
      secondSpeaker
    );
  }
);

/**
 * todo;
 */
extern(
  "dialogs_jupiter.actor_relocate_meeting_info",
  (firstSpeaker: ClientObject, secondSpeaker: ClientObject): void => {
    transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), questItems.jup_a9_meeting_info);
    giveInfo(infoPortions.jup_a9_meeting_info_sold);
  }
);

/**
 * todo;
 */
extern(
  "dialogs_jupiter.jup_a9_actor_has_delivery_info",
  (firstSpeaker: ClientObject, secondSpeaker: ClientObject): boolean => {
    return registry.actor.object(questItems.jup_a9_delivery_info) !== null;
  }
);

/**
 * todo;
 */
extern(
  "dialogs_jupiter.jup_a9_actor_hasnt_delivery_info",
  (firstSpeaker: ClientObject, secondSpeaker: ClientObject): boolean => {
    return !getExtern<AnyCallable>("jup_a9_actor_has_delivery_info", getExtern("dialogs_jupiter"))(
      firstSpeaker,
      secondSpeaker
    );
  }
);

/**
 * todo;
 */
extern(
  "dialogs_jupiter.jup_a9_actor_has_evacuation_info",
  (firstSpeaker: ClientObject, secondSpeaker: ClientObject): boolean => {
    return registry.actor.object(questItems.jup_a9_evacuation_info) !== null;
  }
);

/**
 * todo;
 */
extern(
  "dialogs_jupiter.jup_a9_actor_hasnt_evacuation_info",
  (firstSpeaker: ClientObject, secondSpeaker: ClientObject): boolean => {
    return !getExtern<AnyCallable>("jup_a9_actor_has_evacuation_info", getExtern("dialogs_jupiter"))(
      firstSpeaker,
      secondSpeaker
    );
  }
);

/**
 * todo;
 */
extern(
  "dialogs_jupiter.actor_relocate_evacuation_info",
  (firstSpeaker: ClientObject, secondSpeaker: ClientObject): void => {
    transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), questItems.jup_a9_evacuation_info);
    giveInfo(infoPortions.jup_a9_evacuation_info_sold);
  }
);

/**
 * todo;
 */
extern(
  "dialogs_jupiter.actor_relocate_delivery_info",
  (firstSpeaker: ClientObject, secondSpeaker: ClientObject): void => {
    transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), questItems.jup_a9_delivery_info);
    giveInfo(infoPortions.jup_a9_delivery_info_sold);
  }
);

/**
 * todo;
 */
extern(
  "dialogs_jupiter.jup_a9_actor_has_losses_info",
  (firstSpeaker: ClientObject, secondSpeaker: ClientObject): boolean => {
    return registry.actor.object(questItems.jup_a9_losses_info) !== null;
  }
);

/**
 * todo;
 */
extern(
  "dialogs_jupiter.jup_a9_actor_hasnt_losses_info",
  (firstSpeaker: ClientObject, secondSpeaker: ClientObject): boolean => {
    return !getExtern<AnyCallable>("jup_a9_actor_has_losses_info", getExtern("dialogs_jupiter"))(
      firstSpeaker,
      secondSpeaker
    );
  }
);

/**
 * todo;
 */
extern(
  "dialogs_jupiter.actor_relocate_losses_info",
  (firstSpeaker: ClientObject, secondSpeaker: ClientObject): void => {
    transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), questItems.jup_a9_losses_info);
    giveInfo(infoPortions.jup_a9_losses_info_sold);
  }
);

/**
 * todo;
 */
extern("dialogs_jupiter.actor_has_plant", (firstSpeaker: ClientObject, secondSpeaker: ClientObject): boolean => {
  return registry.actor.object(questItems.jup_b206_plant) !== null;
});

/**
 * todo;
 */
extern("dialogs_jupiter.actor_relocate_plant", (firstSpeaker: ClientObject, secondSpeaker: ClientObject): void => {
  transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), questItems.jup_b206_plant);
});

/**
 * todo;
 */
extern(
  "dialogs_jupiter.actor_relocate_trapper_reward",
  (firstSpeaker: ClientObject, secondSpeaker: ClientObject): void => {
    transferItemsToActor(getNpcSpeaker(firstSpeaker, secondSpeaker), weapons.wpn_wincheaster1300_trapper);
  }
);

/**
 * todo;
 */
extern("dialogs_jupiter.zat_b106_trapper_reward", (firstSpeaker: ClientObject, secondSpeaker: ClientObject): void => {
  if (hasAlifeInfo(infoPortions.zat_b106_one_hit)) {
    giveMoneyToActor(3000);
  } else {
    giveMoneyToActor(2000);
  }
});

/**
 * todo;
 */
extern("dialogs_jupiter.jup_a10_proverka_wpn", (firstSpeaker: ClientObject, secondSpeaker: ClientObject): boolean => {
  const table = [
    weapons.wpn_desert_eagle,
    weapons.wpn_desert_eagle_nimble,
    weapons.wpn_sig550,
    weapons.wpn_g36,
    weapons.wpn_g36_nimble,
    weapons.wpn_fn2000,
    weapons.wpn_fn2000_nimble,
    weapons.wpn_groza,
    weapons.wpn_groza_nimble,
    weapons.wpn_val,
    weapons.wpn_vintorez,
    weapons.wpn_vintorez_nimble,
    weapons.wpn_svd,
    weapons.wpn_svu,
    weapons.wpn_pkm,
    weapons.wpn_spas12,
    weapons.wpn_spas12_nimble,
    weapons.wpn_protecta,
    weapons.wpn_protecta_nimble,
    weapons.wpn_gauss,
    weapons.wpn_rpg7,
    weapons["wpn_rg-6"],
    weapons.wpn_pkm_zulus,
  ];

  const actor: ClientObject = registry.actor;

  for (const [k, v] of table) {
    if (actor.item_in_slot(2)?.section() === v || actor.item_in_slot(3)?.section() === v) {
      return true;
    }
  }

  return false;
});

/**
 * todo;
 */
extern(
  "dialogs_jupiter.jup_a10_proverka_wpn_false",
  (firstSpeaker: ClientObject, secondSpeaker: ClientObject): boolean => {
    return !getExtern<AnyCallable>("jup_a10_proverka_wpn", getExtern("dialogs_jupiter"))(firstSpeaker, secondSpeaker);
  }
);

/**
 * todo;
 */
extern(
  "dialogs_jupiter.jup_a10_actor_has_money",
  (firstSpeaker: ClientObject, secondSpeaker: ClientObject): boolean => {
    const actor: ClientObject = registry.actor;

    if (hasAlifeInfo(infoPortions.jup_a10_debt_wo_percent)) {
      return actor.money() >= 5000;
    } else {
      return actor.money() >= 7000;
    }
  }
);

/**
 * todo;
 */
extern(
  "dialogs_jupiter.jup_a10_actor_has_not_money",
  (firstSpeaker: ClientObject, secondSpeaker: ClientObject): boolean => {
    return !getExtern<AnyCallable>("jup_a10_actor_has_money", getExtern("dialogs_jupiter"))(
      firstSpeaker,
      secondSpeaker
    );
  }
);

/**
 * todo;
 */
extern("dialogs_jupiter.jup_a10_actor_give_money", (firstSpeaker: ClientObject, secondSpeaker: ClientObject): void => {
  if (hasAlifeInfo(infoPortions.jup_a10_debt_wo_percent)) {
    transferMoneyFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), 5000);
    giveInfo(infoPortions.jup_a10_bandit_take_money);
  } else {
    transferMoneyFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), 7000);
    giveInfo(infoPortions.jup_a10_bandit_take_all_money);
  }
});

/**
 * todo;
 */
extern("dialogs_jupiter.jup_a10_vano_give_money", (firstSpeaker: ClientObject, secondSpeaker: ClientObject): void => {
  giveMoneyToActor(5000);
});

/**
 * todo;
 */
extern(
  "dialogs_jupiter.jup_a10_actor_give_outfit_money",
  (firstSpeaker: ClientObject, secondSpeaker: ClientObject): void => {
    transferMoneyFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), 5000);
  }
);

/**
 * todo;
 */
extern(
  "dialogs_jupiter.jup_a10_actor_has_outfit_money",
  (firstSpeaker: ClientObject, secondSpeaker: ClientObject): boolean => {
    return registry.actor.money() >= 5000;
  }
);

/**
 * todo;
 */
extern(
  "dialogs_jupiter.jup_a10_actor_has_not_outfit_money",
  (firstSpeaker: ClientObject, secondSpeaker: ClientObject): boolean => {
    return !getExtern<AnyCallable>("jup_a10_actor_has_outfit_money", getExtern("dialogs_jupiter"))(
      firstSpeaker,
      secondSpeaker
    );
  }
);

/**
 * todo;
 */
extern(
  "dialogs_jupiter.if_actor_has_jup_b16_oasis_artifact",
  (firstSpeaker: ClientObject, secondSpeaker: ClientObject): boolean => {
    return firstSpeaker.object(artefacts.af_oasis_heart) !== null;
  }
);

/**
 * todo;
 */
extern(
  "dialogs_jupiter.if_actor_hasnt_jup_b16_oasis_artifact",
  (firstSpeaker: ClientObject, secondSpeaker: ClientObject): boolean => {
    return !getExtern<AnyCallable>("if_actor_has_jup_b16_oasis_artifact", getExtern("dialogs_jupiter"))(
      firstSpeaker,
      secondSpeaker
    );
  }
);

/**
 * todo;
 */
extern("dialogs_jupiter.jupiter_b16_reward", (firstSpeaker: ClientObject, secondSpeaker: ClientObject): void => {
  giveMoneyToActor(7000);
});

/**
 * todo;
 */
extern(
  "dialogs_jupiter.give_jup_b16_oasis_artifact",
  (firstSpeaker: ClientObject, secondSpeaker: ClientObject): void => {
    transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), artefacts.af_oasis_heart);
  }
);

/**
 * todo;
 */
extern(
  "dialogs_jupiter.jup_a12_actor_has_15000_money",
  (firstSpeaker: ClientObject, secondSpeaker: ClientObject): boolean => {
    return registry.actor.money() >= 15000;
  }
);

/**
 * todo;
 */
extern(
  "dialogs_jupiter.jup_a12_actor_do_not_has_15000_money",
  (firstSpeaker: ClientObject, secondSpeaker: ClientObject): boolean => {
    return registry.actor.money() < 15000;
  }
);

/**
 * todo;
 */
const jupA12AfTable: LuaArray<TArtefact> = $fromArray<TArtefact>([
  artefacts.af_fire,
  artefacts.af_gold_fish,
  artefacts.af_glass,
  artefacts.af_ice,
]);

/**
 * todo;
 */
extern(
  "dialogs_jupiter.jup_a12_actor_has_artefacts",
  (firstSpeaker: ClientObject, secondSpeaker: ClientObject): boolean => {
    for (const [k, v] of jupA12AfTable) {
      if (registry.actor.object(v) !== null) {
        return true;
      }
    }

    return false;
  }
);

/**
 * todo;
 */
extern(
  "dialogs_jupiter.jup_a12_actor_has_artefact_1",
  (firstSpeaker: ClientObject, secondSpeaker: ClientObject): boolean => {
    return registry.actor.object(jupA12AfTable.get(1)) !== null;
  }
);

/**
 * todo;
 */
extern(
  "dialogs_jupiter.jup_a12_actor_has_artefact_2",
  (firstSpeaker: ClientObject, secondSpeaker: ClientObject): boolean => {
    return registry.actor.object(jupA12AfTable.get(2)) !== null;
  }
);

/**
 * todo;
 */
extern(
  "dialogs_jupiter.jup_a12_actor_has_artefact_3",
  (firstSpeaker: ClientObject, secondSpeaker: ClientObject): boolean => {
    return registry.actor.object(jupA12AfTable.get(3)) !== null;
  }
);

/**
 * todo;
 */
extern(
  "dialogs_jupiter.jup_a12_actor_has_artefact_4",
  (firstSpeaker: ClientObject, secondSpeaker: ClientObject): boolean => {
    return registry.actor.object(jupA12AfTable.get(4)) !== null;
  }
);

/**
 * todo;
 */
extern(
  "dialogs_jupiter.jup_a12_actor_do_not_has_artefacts",
  (firstSpeaker: ClientObject, secondSpeaker: ClientObject): boolean => {
    const actor: ClientObject = registry.actor;

    for (const [k, v] of jupA12AfTable) {
      if (actor.object(v) !== null) {
        return false;
      }
    }

    return true;
  }
);

/**
 * todo;
 */
extern(
  "dialogs_jupiter.jup_a12_transfer_ransom_from_actor",
  (firstSpeaker: ClientObject, secondSpeaker: ClientObject): void => {
    if (hasAlifeInfo(infoPortions.jup_a12_ransom_by_money)) {
      transferMoneyFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), 15000);

      return;
    }

    const jupA12InfoTable: LuaArray<TName> = $fromArray<TName>([
      "jup_a12_af_fire",
      "jup_a12_af_gold_fish",
      "jup_a12_af_glass",
      "jup_a12_af_ice",
    ]);

    for (const i of $range(1, 4)) {
      if (hasAlifeInfo(jupA12InfoTable.get(i))) {
        transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), jupA12AfTable.get(i));

        return;
      }
    }
  }
);

/**
 * todo;
 */
extern(
  "dialogs_jupiter.jup_a12_transfer_5000_money_to_actor",
  (firstSpeaker: ClientObject, secondSpeaker: ClientObject): void => {
    const treasureManager: TreasureManager = TreasureManager.getInstance();

    giveMoneyToActor(5000);
    treasureManager.giveActorTreasureCoordinates(treasures.jup_hiding_place_40);
    treasureManager.giveActorTreasureCoordinates(treasures.jup_hiding_place_34);
  }
);

/**
 * todo;
 */
extern(
  "dialogs_jupiter.jup_a12_transfer_artefact_to_actor",
  (firstSpeaker: ClientObject, secondSpeaker: ClientObject): void => {
    transferItemsToActor(getNpcSpeaker(firstSpeaker, secondSpeaker), artefacts.af_gold_fish);

    if (hasAlifeInfo(infoPortions.jup_a12_stalker_prisoner_free_dialog_done)) {
      const treasureManager: TreasureManager = TreasureManager.getInstance();

      treasureManager.giveActorTreasureCoordinates(treasures.jup_hiding_place_40);
      treasureManager.giveActorTreasureCoordinates(treasures.jup_hiding_place_34);
    }
  }
);

/**
 * todo;
 */
extern(
  "dialogs_jupiter.jup_a12_transfer_cashier_money_from_actor",
  (firstSpeaker: ClientObject, secondSpeaker: ClientObject): void => {
    let amount: TCount = math.random(20, 50) * 100;
    const actor: ClientObject = registry.actor;

    if (actor.money() < amount) {
      amount = actor.money();
    }

    transferMoneyFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), amount);
  }
);

/**
 * todo;
 */
extern(
  "dialogs_jupiter.zat_b30_transfer_detectors",
  (firstSpeaker: ClientObject, secondSpeaker: ClientObject): void => {
    transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), detectors.detector_elite, 3);
  }
);

/**
 * todo;
 */
extern(
  "dialogs_jupiter.zat_b30_actor_do_not_has_transfer_items",
  (firstSpeaker: ClientObject, secondSpeaker: ClientObject): boolean => {
    return !getExtern<AnyCallable>("zat_b30_actor_has_transfer_items", getExtern("dialogs_jupiter"))(
      firstSpeaker,
      secondSpeaker
    );
  }
);

/**
 * todo;
 */
extern(
  "dialogs_jupiter.zat_b30_actor_has_transfer_items",
  (firstSpeaker: ClientObject, secondSpeaker: ClientObject): boolean => {
    const actor: ClientObject = registry.actor;
    let cnt: TCount = 0;

    const zatB30Count = (npc: ClientObject, item: ClientObject): void => {
      if (item.section() === "detector_elite") {
        cnt = cnt + 1;
      }
    };

    actor.iterate_inventory(zatB30Count, actor);

    return cnt >= 3;
  }
);

/**
 * todo;
 */
extern(
  "dialogs_jupiter.jup_b6_scientist_nuclear_physicist_scan_anomaly_precond",
  (firstSpeaker: ClientObject, secondSpeaker: ClientObject): boolean => {
    if (!hasAlifeInfo(infoPortions.jup_b6_b32_quest_active)) {
      return false;
    } else if (hasAlifeInfo(infoPortions.jup_b6_give_task) && hasAlifeInfo(infoPortions.jup_b32_task_addon_start)) {
      return false;
    } else if (hasAlifeInfo(infoPortions.jup_b6_task_fail) && hasAlifeInfo(infoPortions.jup_b32_task_addon_start)) {
      return false;
    }

    return true;
  }
);

/**
 * todo;
 */
extern(
  "dialogs_jupiter.jup_b32_task_give_dialog_precond",
  (firstSpeaker: ClientObject, secondSpeaker: ClientObject): boolean => {
    return !(hasAlifeInfo(infoPortions.jup_b32_task_start) && !hasAlifeInfo("jup_b32_task_end"));
  }
);

/**
 * todo;
 */
extern("dialogs_jupiter.jup_b32_transfer_scanners", (firstSpeaker: ClientObject, secondSpeaker: ClientObject): void => {
  transferItemsToActor(getNpcSpeaker(firstSpeaker, secondSpeaker), infoPortions.jup_b32_scanner_device, 3);
});

/**
 * todo;
 */
extern(
  "dialogs_jupiter.jup_b32_transfer_scanners_2",
  (firstSpeaker: ClientObject, secondSpeaker: ClientObject): void => {
    transferItemsToActor(getNpcSpeaker(firstSpeaker, secondSpeaker), infoPortions.jup_b32_scanner_device, 2);
  }
);

/**
 * todo;
 */
extern(
  "dialogs_jupiter.jup_b32_give_reward_to_actor",
  (firstSpeaker: ClientObject, secondSpeaker: ClientObject): void => {
    giveMoneyToActor(5000);
  }
);

/**
 * todo;
 */
extern(
  "dialogs_jupiter.jup_b209_get_monster_scanner",
  (firstSpeaker: ClientObject, secondSpeaker: ClientObject): void => {
    transferItemsToActor(getNpcSpeaker(firstSpeaker, secondSpeaker), "jup_b209_monster_scanner", 1);
  }
);

/**
 * todo;
 */
extern(
  "dialogs_jupiter.jup_b209_return_monster_scanner",
  (firstSpeaker: ClientObject, secondSpeaker: ClientObject): void => {
    transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), "jup_b209_monster_scanner", 1);
  }
);

/**
 * todo;
 */
extern(
  "dialogs_jupiter.jup_b32_anomaly_do_not_has_af",
  (firstSpeaker: ClientObject, secondSpeaker: ClientObject): boolean => {
    if (hasAlifeInfo("jup_b32_anomaly_true")) {
      disableInfo("jup_b32_anomaly_true");

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
      if (hasAlifeInfo(infoPortionsTable.get(it))) {
        index = it;
        break;
      }
    }

    if (index === 0) {
      return true;
    }

    const anomalyZone: AnomalyZoneBinder = registry.anomalyZones.get(azTable.get(index));

    if (anomalyZone === null) {
      disableInfo(infoPortionsTable.get(index));

      return true;
    }

    if (anomalyZone.spawnedArtefactsCount > 0) {
      return false;
    }

    disableInfo(infoPortionsTable.get(index));

    return true;
  }
);

/**
 * todo;
 */
extern(
  "dialogs_jupiter.jup_b207_generic_decrypt_need_dialog_precond",
  (firstSpeaker: ClientObject, secondSpeaker: ClientObject): boolean => {
    const actor: ClientObject = registry.actor;

    if (actor.object(questItems.jup_b9_blackbox) !== null) {
      return true;
    }

    if (isObjectName(secondSpeaker, "mechanic") || isObjectName(secondSpeaker, "tech")) {
      return false;
    }

    return false;
  }
);

/**
 * todo;
 */
extern(
  "dialogs_jupiter.jup_b207_actor_has_dealers_pda",
  (firstSpeaker: ClientObject, secondSpeaker: ClientObject): boolean => {
    return registry.actor.object("device_pda_zat_b5_dealer") !== null;
  }
);

/**
 * todo;
 */
extern("dialogs_jupiter.jup_b207_sell_dealers_pda", (firstSpeaker: ClientObject, secondSpeaker: ClientObject): void => {
  transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), "device_pda_zat_b5_dealer");
  giveMoneyToActor(4_000);
  giveInfo(infoPortions.jup_b207_dealers_pda_sold);
});

/**
 * todo;
 */
extern("dialogs_jupiter.jup_b207_give_dealers_pda", (firstSpeaker: ClientObject, secondSpeaker: ClientObject): void => {
  transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), "device_pda_zat_b5_dealer");
});

/**
 * todo;
 */
extern(
  "dialogs_jupiter.jup_b207_actor_has_merc_pda_with_contract",
  (firstSpeaker: ClientObject, secondSpeaker: ClientObject): boolean => {
    return registry.actor.object("jup_b207_merc_pda_with_contract") !== null;
  }
);

/**
 * todo;
 */
extern(
  "dialogs_jupiter.jup_b207_sell_merc_pda_with_contract",
  (firstSpeaker: ClientObject, secondSpeaker: ClientObject): void => {
    const amount: TCount = 1000;

    transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), "jup_b207_merc_pda_with_contract");
    giveMoneyToActor(amount);
    giveInfo("jup_b207_merc_pda_with_contract_sold");
  }
);

/**
 * todo;
 */
extern(
  "dialogs_jupiter.jup_b207_transfer_blackmail_reward",
  (firstSpeaker: ClientObject, secondSpeaker: ClientObject): void => {
    transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), "jup_b207_merc_pda_with_contract");
  }
);

/**
 * todo;
 */
extern(
  "dialogs_jupiter.jup_b207_transfer_blackmail_reward_for_pda",
  (firstSpeaker: ClientObject, secondSpeaker: ClientObject): void => {
    transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), "jup_b207_merc_pda_with_contract");
    transferItemsToActor(getNpcSpeaker(firstSpeaker, secondSpeaker), "wpn_abakan");
  }
);

/**
 * todo;
 */
extern("dialogs_jupiter.give_jup_b1_art", (firstSpeaker: ClientObject, secondSpeaker: ClientObject): void => {
  transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), "jup_b1_half_artifact");
});

/**
 * todo;
 */
extern(
  "dialogs_jupiter.if_actor_has_jup_b1_art",
  (firstSpeaker: ClientObject, secondSpeaker: ClientObject): boolean => {
    return registry.actor.object("jup_b1_half_artifact") !== null;
  }
);

/**
 * todo;
 */
extern(
  "dialogs_jupiter.jup_b1_actor_do_not_have_good_suit",
  (firstSpeaker: ClientObject, secondSpeaker: ClientObject): boolean => {
    return !getExtern<AnyCallable>("jup_b1_actor_have_good_suit", getExtern("dialogs_jupiter"))(
      firstSpeaker,
      secondSpeaker
    );
  }
);

/**
 * todo;
 */
extern("dialogs_jupiter.jup_b1_reward_actor", (firstSpeaker: ClientObject, secondSpeaker: ClientObject): void => {
  giveMoneyToActor(6000);
});

/**
 * todo;
 */
extern("dialogs_jupiter.jup_b6_actor_outfit_cs", (firstSpeaker: ClientObject, secondSpeaker: ClientObject): boolean => {
  const actor: ClientObject = registry.actor;

  if (actor.item_in_slot(7) !== null && actor.item_in_slot(7)!.section() === "cs_heavy_outfit") {
    return true;
  }

  return false;
});

/**
 * todo;
 */
extern(
  "dialogs_jupiter.jup_b6_first_reward_for_actor",
  (firstSpeaker: ClientObject, secondSpeaker: ClientObject): void => {
    giveMoneyToActor(2500);
  }
);

/**
 * todo;
 */
extern(
  "dialogs_jupiter.jup_b6_second_reward_for_actor",
  (firstSpeaker: ClientObject, secondSpeaker: ClientObject): void => {
    giveMoneyToActor(2500);
  }
);

/**
 * todo;
 */
extern(
  "dialogs_jupiter.jup_b6_all_reward_for_actor",
  (firstSpeaker: ClientObject, secondSpeaker: ClientObject): void => {
    giveMoneyToActor(5000);
  }
);

/**
 * todo;
 */
extern(
  "dialogs_jupiter.jup_b6_first_reward_for_actor_extra",
  (firstSpeaker: ClientObject, secondSpeaker: ClientObject): void => {
    giveMoneyToActor(3500);
  }
);

/**
 * todo;
 */
extern(
  "dialogs_jupiter.jup_b6_second_reward_for_actor_extra",
  (firstSpeaker: ClientObject, secondSpeaker: ClientObject): void => {
    giveMoneyToActor(3500);
  }
);

/**
 * todo;
 */
extern(
  "dialogs_jupiter.jup_b6_all_reward_for_actor_extra",
  (firstSpeaker: ClientObject, secondSpeaker: ClientObject): void => {
    giveMoneyToActor(7000);
  }
);

/**
 * todo;
 */
extern(
  "dialogs_jupiter.jup_b6_reward_actor_by_detector",
  (firstSpeaker: ClientObject, secondSpeaker: ClientObject): void => {
    transferItemsToActor(getNpcSpeaker(firstSpeaker, secondSpeaker), detectors.detector_elite);
  }
);

/**
 * todo;
 */
extern(
  "dialogs_jupiter.jup_b1_actor_have_good_suit",
  (firstSpeaker: ClientObject, secondSpeaker: ClientObject): boolean => {
    const suitsList: LuaTable<string, boolean> = $fromObject<string, boolean>({
      [outfits.scientific_outfit]: true,
      [outfits.military_outfit]: true,
      [outfits.dolg_heavy_outfit]: true,
      [outfits.exo_outfit]: true,
      [outfits.svoboda_light_outfit]: true,
      [outfits.svoboda_heavy_outfit]: true,
      [outfits.cs_heavy_outfit]: true,
    });

    const helmetsList: LuaTable<THelmet, boolean | undefined> = $fromObject<PartialRecord<THelmet, boolean>>({
      [helmets.helm_battle]: true,
      [helmets.helm_tactic]: true,
      [helmets.helm_protective]: true,
    });

    const actor: ClientObject = registry.actor;

    if (actor.item_in_slot(7) !== null && suitsList.get(actor.section())) {
      return true;
    }

    if (actor.item_in_slot(12) !== null && helmetsList.get(actor.item_in_slot(12)!.section())) {
      return true;
    }

    return false;
  }
);

/**
 * todo;
 */
extern(
  "dialogs_jupiter.jup_b6_actor_can_not_start",
  (firstSpeaker: ClientObject, secondSpeaker: ClientObject): boolean => {
    return !getExtern<AnyCallable>("jup_b6_actor_can_start", getExtern("dialogs_jupiter"))(firstSpeaker, secondSpeaker);
  }
);

/**
 * todo;
 */
extern("dialogs_jupiter.jup_b6_actor_can_start", (firstSpeaker: ClientObject, secondSpeaker: ClientObject): boolean => {
  if (
    hasAlifeInfo(infoPortions.jup_b1_squad_is_dead) &&
    !(
      hasAlifeInfo(infoPortions.jup_b6_freedom_employed) ||
      hasAlifeInfo(infoPortions.jup_b6_duty_employed) ||
      hasAlifeInfo(infoPortions.jup_b6_gonta_employed) ||
      hasAlifeInfo(infoPortions.jup_b6_exprisoner_work_on_sci)
    )
  ) {
    return false;
  }

  return true;
});

/**
 * todo;
 */
extern(
  "dialogs_jupiter.jup_b1_stalker_squad_thanks",
  (firstSpeaker: ClientObject, secondSpeaker: ClientObject): void => {
    transferItemsToActor(getNpcSpeaker(firstSpeaker, secondSpeaker), drugs.medkit_scientic, 3);
    transferItemsToActor(getNpcSpeaker(firstSpeaker, secondSpeaker), drugs.antirad, 5);
    transferItemsToActor(getNpcSpeaker(firstSpeaker, secondSpeaker), drugs.drug_psy_blockade, 2);
    transferItemsToActor(getNpcSpeaker(firstSpeaker, secondSpeaker), drugs.drug_antidot, 2);
    transferItemsToActor(getNpcSpeaker(firstSpeaker, secondSpeaker), drugs.drug_radioprotector, 2);
    transferItemsToActor(getNpcSpeaker(firstSpeaker, secondSpeaker), drugs.drug_anabiotic);
    transferItemsToActor(getNpcSpeaker(firstSpeaker, secondSpeaker), helmets.helm_protective);
  }
);

/**
 * todo;
 */
extern(
  "dialogs_jupiter.jup_b202_actor_has_medkit",
  (firstSpeaker: ClientObject, secondSpeaker: ClientObject): boolean => {
    const actor: ClientObject = registry.actor;

    return (
      actor.object(drugs.medkit) !== null ||
      actor.object(drugs.medkit_army) !== null ||
      actor.object(drugs.medkit_scientic) !== null
    );
  }
);

/**
 * todo;
 */
extern(
  "dialogs_jupiter.jup_b202_hit_bandit_from_actor",
  (firstSpeaker: ClientObject, secondSpeaker: ClientObject): void => {
    const npc: ClientObject = getNpcSpeaker(firstSpeaker, secondSpeaker);
    const actor: ClientObject = registry.actor;

    giveInfo(infoPortions.jup_b202_bandit_hited);
    giveInfo(infoPortions.jup_b202_bandit_hited_by_actor);
    getExtern<AnyCallablesModule>("xr_effects").set_squad_goodwill(actor, npc, ["jup_b202_bandit_squad", "enemy"]);
    // --xr_effects.hit_npc_from_actor(actor,npc,{"jup_b202_bandit"})
  }
);

/**
 * todo;
 */
extern(
  "dialogs_jupiter.jup_b202_medic_dialog_precondition",
  (firstSpeaker: ClientObject, secondSpeaker: ClientObject): boolean => {
    if (hasAlifeInfo(infoPortions.jup_b218_gather_squad_complete)) {
      return !hasAlifeInfo(infoPortions.jup_b202_polustanok);
    } else {
      return !hasAlifeInfo(infoPortions.jup_b52_medic_testimony);
    }
  }
);

/**
 * todo;
 */
extern(
  "dialogs_jupiter.jup_b6_stalker_dialog_precond",
  (firstSpeaker: ClientObject, secondSpeaker: ClientObject): boolean => {
    const npc: ClientObject = getNpcSpeaker(firstSpeaker, secondSpeaker);
    const npcAlife: Optional<ServerCreatureObject> = alife().object(npc.id());

    if (!npcAlife) {
      return false;
    }

    if (alife().object(npcAlife.group_id) === null) {
      return false;
    }

    const squadName: TName = alife().object(npcAlife.group_id)!.section_name();

    if (squadName !== null && squadName !== "") {
      if (!hasAlifeInfo(infoPortions.jup_b1_squad_is_dead) && squadName === infoPortions.jup_b1_stalker_squad) {
        return true;
      } else if (
        hasAlifeInfo(infoPortions.jup_b6_freedom_employed) &&
        squadName === infoPortions.jup_b6_stalker_freedom_squad
      ) {
        return true;
      } else if (
        hasAlifeInfo(infoPortions.jup_b6_duty_employed) &&
        squadName === infoPortions.jup_b6_stalker_duty_squad
      ) {
        return true;
      } else if (
        hasAlifeInfo(infoPortions.jup_b6_gonta_employed) &&
        squadName === infoPortions.jup_b6_stalker_gonta_squad
      ) {
        return true;
      } else if (
        hasAlifeInfo(infoPortions.jup_b6_exprisoner_work_on_sci) &&
        squadName === infoPortions.jup_b6_stalker_exprisoner_squad
      ) {
        return true;
      }
    }

    return false;
  }
);

/**
 * todo;
 */
extern(
  "dialogs_jupiter.jup_b217_actor_got_toolkit",
  (firstSpeaker: ClientObject, secondSpeaker: ClientObject): boolean => {
    const actor: ClientObject = registry.actor as ClientObject;

    const isToolkit = (npc: ClientObject, item: ClientObject): void => {
      const section: TSection = item.section();

      if (
        (section === misc.toolkit_1 && !hasAlifeInfo(infoPortions.jup_b217_tech_instrument_1_brought)) ||
        (section === misc.toolkit_2 && !hasAlifeInfo(infoPortions.jup_b217_tech_instrument_2_brought)) ||
        (section === misc.toolkit_3 && !hasAlifeInfo(infoPortions.jup_b217_tech_instrument_3_brought))
      ) {
        (actor as AnyObject).toolkit = section;

        return;
      }
    };

    actor.iterate_inventory(isToolkit, actor);

    if ((actor as AnyObject).toolkit !== null) {
      return true;
    }

    return false;
  }
);

/**
 * todo;
 */
extern(
  "dialogs_jupiter.jupiter_b200_tech_materials_relocate",
  (firstSpeaker: ClientObject, secondSpeaker: ClientObject): void => {
    const needItems: LuaTable<TName, boolean> = $fromObject<TName, boolean>({
      [questItems.jup_b200_tech_materials_wire]: true,
      [questItems.jup_b200_tech_materials_acetone]: true,
      [questItems.jup_b200_tech_materials_textolite]: true,
      [questItems.jup_b200_tech_materials_transistor]: true,
      [questItems.jup_b200_tech_materials_capacitor]: true,
    });

    const actor: ClientObject = registry.actor;
    const itemsToRelocate: LuaTable<string, number> = new LuaTable();
    let count: TCount = 0;

    const relocateAndIncCount = (object: ClientObject, item: ClientObject): void => {
      if (needItems.get(item.section())) {
        const section: string = item.section();

        count = count + 1;

        if (itemsToRelocate.get(section) === null) {
          itemsToRelocate.set(section, 1);
        } else {
          itemsToRelocate.set(section, itemsToRelocate.get(section) + 1);
        }
      }
    };

    actor.iterate_inventory(relocateAndIncCount, actor);

    getExtern<AnyCallablesModule>("xr_effects").inc_counter(actor, null, [
      "jup_b200_tech_materials_brought_counter",
      tostring(count),
    ]);

    for (const [k, v] of itemsToRelocate) {
      transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), k, v);
    }
  }
);

/**
 * todo;
 */
extern("dialogs_jupiter.npc_in_b4_smart", (firstSpeaker: ClientObject, secondSpeaker: ClientObject): void => {
  return getExtern<AnyCallablesModule>("dialogs").is_npc_in_current_smart(firstSpeaker, secondSpeaker, "jup_b4");
});

/**
 * todo;
 */
extern("dialogs_jupiter.jup_b202_transfer_medkit", (firstSpeaker: ClientObject, secondSpeaker: ClientObject): void => {
  const actor: ClientObject = registry.actor;

  if (actor.object(drugs.medkit) !== null) {
    transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), drugs.medkit);
  } else if (actor.object(drugs.medkit_army) !== null) {
    transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), drugs.medkit_army);
  } else if (actor.object(drugs.medkit_scientic) !== null) {
    transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), drugs.medkit_scientic);
  }
});

/**
 * todo;
 */
extern(
  "dialogs_jupiter.jupiter_b220_all_hunted",
  (firstSpeaker: ClientObject, secondSpeaker: ClientObject): boolean => {
    if (
      hasAlifeInfo(infoPortions.jup_b220_trapper_bloodsucker_lair_hunted_told) &&
      hasAlifeInfo(infoPortions.jup_b220_trapper_zaton_chimera_hunted_told) &&
      hasAlifeInfo(infoPortions.jup_b211_swamp_bloodsuckers_hunt_done) &&
      hasAlifeInfo(infoPortions.jup_b208_burers_hunt_done) &&
      hasAlifeInfo(infoPortions.jup_b212_jupiter_chimera_hunt_done)
    ) {
      return false;
    }

    return true;
  }
);

/**
 * todo;
 */
extern(
  "dialogs_jupiter.jupiter_b220_no_one_hunted",
  (firstSpeaker: ClientObject, secondSpeaker: ClientObject): boolean => {
    if (
      hasAlifeInfo(infoPortions.jup_b220_trapper_about_himself_told) &&
      hasAlifeInfo(infoPortions.zat_b57_den_of_the_bloodsucker_tell_stalkers_about_destroy_lair_give) &&
      !hasAlifeInfo(infoPortions.jup_b220_trapper_bloodsucker_lair_hunted_told)
    ) {
      return false;
    } else if (
      hasAlifeInfo(infoPortions.zat_b106_chimera_dead) &&
      !hasAlifeInfo(infoPortions.jup_b220_trapper_zaton_chimera_hunted_told)
    ) {
      return false;
    } else if (
      hasAlifeInfo(infoPortions.jup_b6_all_hunters_are_dead) &&
      !hasAlifeInfo(infoPortions.jup_b211_swamp_bloodsuckers_hunt_done)
    ) {
      return false;
    } else if (
      hasAlifeInfo(infoPortions.jup_b208_burers_dead) &&
      !hasAlifeInfo(infoPortions.jup_b208_burers_hunt_done)
    ) {
      return false;
    } else if (
      hasAlifeInfo(infoPortions.jup_b212_jupiter_chimera_dead) &&
      !hasAlifeInfo(infoPortions.jup_b212_jupiter_chimera_hunt_done)
    ) {
      return false;
    }

    return true;
  }
);

/**
 * todo;
 */
const moneyCountTable: LuaArray<TCount> = $fromArray([3000, 2850, 2700, 2550, 2400, 2250, 2100, 1950, 1800, 1650]);

/**
 * todo;
 */
extern("dialogs_jupiter.jup_b9_actor_has_money", (firstSpeaker: ClientObject, secondSpeaker: ClientObject): boolean => {
  let moneyCount: TCount = 0;

  for (const it of $range(1, 9)) {
    if (hasAlifeInfo(("jup_b200_tech_materials_brought_counter_" + it) as TInfoPortion)) {
      moneyCount = moneyCountTable.get(it);
    }
  }

  return registry.actor.money() >= moneyCount;
});

/**
 * todo;
 */
extern("dialogs_jupiter.jupiter_b9_relocate_money", (firstSpeaker: ClientObject, secondSpeaker: ClientObject): void => {
  let moneyCount: TCount = 0;

  for (const it of $range(1, 9)) {
    if (hasAlifeInfo(("jup_b200_tech_materials_brought_counter_" + it) as TInfoPortion)) {
      moneyCount = moneyCountTable.get(it);
    }
  }

  transferMoneyFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), moneyCount);
});

/**
 * todo;
 */
extern("dialogs_jupiter.give_jup_b9_blackbox", (firstSpeaker: ClientObject, secondSpeaker: ClientObject): void => {
  transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), questItems.jup_b9_blackbox);
});

/**
 * todo;
 */
extern(
  "dialogs_jupiter.jup_b9_actor_has_not_money",
  (firstSpeaker: ClientObject, secondSpeaker: ClientObject): boolean => {
    return !getExtern<AnyCallable>("jup_b9_actor_has_money", getExtern("dialogs_jupiter"))(firstSpeaker, secondSpeaker);
  }
);

/**
 * todo;
 */
extern(
  "dialogs_jupiter.if_actor_has_jup_b9_blackbox",
  (firstSpeaker: ClientObject, secondSpeaker: ClientObject): boolean => {
    return registry.actor.object(questItems.jup_b9_blackbox) !== null;
  }
);

/**
 * todo;
 */
extern(
  "dialogs_jupiter.if_actor_has_af_mincer_meat",
  (firstSpeaker: ClientObject, secondSpeaker: ClientObject): boolean => {
    return firstSpeaker.object(artefacts.af_mincer_meat) !== null;
  }
);

/**
 * todo;
 */
extern(
  "dialogs_jupiter.if_actor_has_af_fuzz_kolobok",
  (firstSpeaker: ClientObject, secondSpeaker: ClientObject): boolean => {
    return firstSpeaker.object(artefacts.af_fuzz_kolobok) !== null;
  }
);

/**
 * todo;
 */
extern(
  "dialogs_jupiter.actor_has_first_or_second_artefact",
  (firstSpeaker: ClientObject, secondSpeaker: ClientObject): boolean => {
    return (
      firstSpeaker.object(artefacts.af_mincer_meat) !== null || firstSpeaker.object(artefacts.af_fuzz_kolobok) !== null
    );
  }
);

/**
 * todo;
 */
extern("dialogs_jupiter.transfer_af_mincer_meat", (firstSpeaker: ClientObject, secondSpeaker: ClientObject): void => {
  transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), artefacts.af_mincer_meat);
});

/**
 * todo;
 */
extern("dialogs_jupiter.jup_b15_dec_counter", (firstSpeaker: ClientObject, secondSpeaker: ClientObject): boolean => {
  const npc: ClientObject = getNpcSpeaker(firstSpeaker, secondSpeaker);
  const actor: ClientObject = registry.actor;

  return getExtern<AnyCallablesModule>("xr_effects").dec_counter(actor, npc, ["jup_b15_full_drunk_count", 1]);
});

/**
 * todo;
 */
extern(
  "dialogs_jupiter.jup_b46_sell_duty_founder_pda",
  (firstSpeaker: ClientObject, secondSpeaker: ClientObject): void => {
    if (hasAlifeInfo(infoPortions.jup_b46_duty_founder_pda_to_freedom)) {
      giveMoneyToActor(4000);
      giveItemsToActor(weapons.wpn_sig550, 1);
      giveItemsToActor(ammo["ammo_5.56x45_ss190"], 150);
    } else if (hasAlifeInfo(infoPortions.jup_b46_duty_founder_pda_to_duty)) {
      giveMoneyToActor(4000);
      giveItemsToActor(weapons.wpn_groza, 1);
      giveItemsToActor(ammo.ammo_9x39_ap, 60);
      giveItemsToActor(ammo["ammo_vog-25"], 2);
    }
  }
);

/**
 * todo;
 */
extern(
  "dialogs_jupiter.jup_b46_transfer_duty_founder_pda",
  (firstSpeaker: ClientObject, secondSpeaker: ClientObject): void => {
    if (registry.actor.object(questItems.jup_b46_duty_founder_pda) !== null) {
      transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), questItems.jup_b46_duty_founder_pda);
    }
  }
);

/**
 * todo;
 */
extern(
  "dialogs_jupiter.jup_b46_sell_duty_founder_pda_to_owl",
  (firstSpeaker: ClientObject, secondSpeaker: ClientObject): void => {
    transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), questItems.jup_b46_duty_founder_pda);
    giveMoneyToActor(2500);
    giveInfo(infoPortions.jup_b46_duty_founder_pda_sold);
    giveInfo(infoPortions.jup_b46_duty_founder_pda_to_stalkers);
  }
);

/**
 * todo;
 */
extern(
  "dialogs_jupiter.jup_b46_actor_has_founder_pda",
  (firstSpeaker: ClientObject, secondSpeaker: ClientObject): boolean => {
    return registry.actor.object(questItems.jup_b46_duty_founder_pda) !== null;
  }
);

/**
 * todo;
 */
extern(
  "dialogs_jupiter.jup_b47_jupiter_docs_enabled",
  (firstSpeaker: ClientObject, secondSpeaker: ClientObject): boolean => {
    const actor: ClientObject = registry.actor;
    const itemsTable: LuaArray<TName> = $fromArray([
      "jup_a9_conservation_info",
      "jup_a9_power_info",
      "jup_a9_way_info",
      "jup_a9_evacuation_info",
      "jup_a9_meeting_info",
      "jup_a9_losses_info",
      "jup_a9_delivery_info",
      // --						"jup_b47_jupiter_products_info"
    ]);

    let a: boolean = false;

    for (const [k, v] of itemsTable) {
      if (actor.object(v) !== null) {
        a = true;
        break;
      }
    }

    const b: boolean =
      !hasAlifeInfo(infoPortions.jup_b47_jupiter_products_start) &&
      actor.object(infoPortions.jup_b47_jupiter_products_info) !== null;
    const c: boolean = hasAlifeInfo(infoPortions.jup_b6_scientist_nuclear_physicist_jupiter_docs_talked);

    return (a || b) && !c;
  }
);

/**
 * todo;
 */
extern("dialogs_jupiter.transfer_af_fuzz_kolobok", (firstSpeaker: ClientObject, secondSpeaker: ClientObject): void => {
  transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), "af_fuzz_kolobok");
});

/**
 * todo;
 */
extern(
  "dialogs_jupiter.pay_cost_to_guide_to_pripyat",
  (firstSpeaker: ClientObject, secondSpeaker: ClientObject): void => {
    transferMoneyFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), 5000);
  }
);

/**
 * todo;
 */
extern(
  "dialogs_jupiter.jup_b43_actor_has_5000_money",
  (firstSpeaker: ClientObject, secondSpeaker: ClientObject): boolean => {
    return registry.actor.money() >= 5000;
  }
);

/**
 * todo;
 */
extern(
  "dialogs_jupiter.jup_b43_actor_do_not_has_5000_money",
  (firstSpeaker: ClientObject, secondSpeaker: ClientObject): boolean => {
    return registry.actor.money() < 5000;
  }
);

/**
 * todo;
 */
extern(
  "dialogs_jupiter.jup_b43_reward_for_first_artefact",
  (firstSpeaker: ClientObject, secondSpeaker: ClientObject): void => {
    giveMoneyToActor(2500);
  }
);

/**
 * todo;
 */
extern(
  "dialogs_jupiter.jup_b43_reward_for_second_artefact",
  (firstSpeaker: ClientObject, secondSpeaker: ClientObject): void => {
    giveMoneyToActor(3500);
  }
);

/**
 * todo;
 */
extern(
  "dialogs_jupiter.jup_b43_reward_for_both_artefacts",
  (firstSpeaker: ClientObject, secondSpeaker: ClientObject): void => {
    giveMoneyToActor(6000);
  }
);

/**
 * todo;
 */
extern("dialogs_jupiter.jup_b218_counter_not_3", (firstSpeaker: ClientObject, secondSpeaker: ClientObject): boolean => {
  const actor: ClientObject = registry.actor;

  return getPortableStoreValue(actor, "jup_b218_squad_members_count", 0 as number) !== 3;
});

/**
 * todo;
 */
extern(
  "dialogs_jupiter.jup_b218_counter_equal_3",
  (firstSpeaker: ClientObject, secondSpeaker: ClientObject): boolean => {
    const actor: ClientObject = registry.actor;

    return getPortableStoreValue(actor, "jup_b218_squad_members_count", 0 as number) === 3;
  }
);

/**
 * todo;
 */
extern("dialogs_jupiter.jup_b218_counter_not_0", (firstSpeaker: ClientObject, secondSpeaker: ClientObject): boolean => {
  const actor: ClientObject = registry.actor;

  return getPortableStoreValue(actor, "jup_b218_squad_members_count", 0 as number) !== 0;
});

/**
 * todo;
 */
extern(
  "dialogs_jupiter.jup_b25_frase_count_inc",
  (firstSpeaker: ClientObject, secondSpeaker: ClientObject): boolean => {
    const npc: ClientObject = getNpcSpeaker(firstSpeaker, secondSpeaker);
    const actor: ClientObject = registry.actor;

    return getExtern<AnyCallablesModule>("xr_effects").inc_counter(actor, npc, ["jup_b25_frase", 1]);
  }
);

/**
 * todo;
 */
extern("dialogs_jupiter.jup_b32_anomaly_has_af", (firstSpeaker: ClientObject, secondSpeaker: ClientObject): boolean => {
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
    if (hasAlifeInfo(infopTable.get(it))) {
      index = it;
      break;
    }
  }

  if (index === 0) {
    return false;
  }

  const anomalZone: AnomalyZoneBinder = registry.anomalyZones.get(azTable.get(index));

  if (anomalZone === null) {
    return false;
  }

  if (anomalZone.spawnedArtefactsCount > 0) {
    disableInfo(infopTable.get(index));
    giveInfo(infoPortions.jup_b32_anomaly_true);

    return true;
  }

  return false;
});

/**
 * todo;
 */
extern(
  "dialogs_jupiter.jup_b4_is_actor_not_enemies_to_freedom",
  (firstSpeaker: ClientObject, secondSpeaker: ClientObject): boolean => {
    return !getExtern<AnyCallable>("jup_b4_is_actor_enemies_to_freedom", getExtern("dialogs_jupiter"))(
      firstSpeaker,
      secondSpeaker
    );
  }
);

/**
 * todo;
 */
extern(
  "dialogs_jupiter.jup_b4_is_actor_enemies_to_freedom",
  (firstSpeaker: ClientObject, secondSpeaker: ClientObject): boolean => {
    return getObjectsRelationSafe(firstSpeaker, secondSpeaker) === EClientObjectRelation.ENEMY;
  }
);

/**
 * todo;
 */
extern(
  "dialogs_jupiter.jup_b4_is_actor_friend_to_freedom",
  (firstSpeaker: ClientObject, secondSpeaker: ClientObject): boolean => {
    return getObjectsRelationSafe(firstSpeaker, secondSpeaker) === EClientObjectRelation.FRIEND;
  }
);

/**
 * todo;
 */
extern(
  "dialogs_jupiter.jup_b4_is_actor_neutral_to_freedom",
  (firstSpeaker: ClientObject, secondSpeaker: ClientObject): boolean => {
    return getObjectsRelationSafe(firstSpeaker, secondSpeaker) === EClientObjectRelation.NEUTRAL;
  }
);

/**
 * todo;
 */
extern(
  "dialogs_jupiter.jup_b4_is_actor_not_enemies_to_dolg",
  (firstSpeaker: ClientObject, secondSpeaker: ClientObject): boolean => {
    return !getExtern<AnyCallable>("jup_b4_is_actor_enemies_to_dolg", getExtern("dialogs_jupiter"))(
      firstSpeaker,
      secondSpeaker
    );
  }
);

/**
 * todo;
 */
extern(
  "dialogs_jupiter.jup_b4_is_actor_enemies_to_dolg",
  (firstSpeaker: ClientObject, secondSpeaker: ClientObject): boolean => {
    return getObjectsRelationSafe(firstSpeaker, secondSpeaker) === EClientObjectRelation.ENEMY;
  }
);

/**
 * todo;
 */
extern(
  "dialogs_jupiter.jup_b4_is_actor_friend_to_dolg",
  (firstSpeaker: ClientObject, secondSpeaker: ClientObject): boolean => {
    return getObjectsRelationSafe(firstSpeaker, secondSpeaker) === EClientObjectRelation.FRIEND;
  }
);

/**
 * todo;
 */
extern(
  "dialogs_jupiter.jup_b4_is_actor_neutral_to_dolg",
  (firstSpeaker: ClientObject, secondSpeaker: ClientObject): boolean => {
    return firstSpeaker.relation(secondSpeaker) === EClientObjectRelation.NEUTRAL;
  }
);

/**
 * todo;
 */
extern(
  "dialogs_jupiter.jup_b47_jupiter_products_info_enabled",
  (firstSpeaker: ClientObject, secondSpeaker: ClientObject): boolean => {
    return registry.actor.object(questItems.jup_b47_jupiter_products_info) !== null;
  }
);

/**
 * todo;
 */
extern(
  "dialogs_jupiter.jup_b47_jupiter_products_info_disabled",
  (firstSpeaker: ClientObject, secondSpeaker: ClientObject): boolean => {
    return registry.actor.object(questItems.jup_b47_jupiter_products_info) === null;
  }
);

/**
 * todo;
 */
extern(
  "dialogs_jupiter.jup_b47_jupiter_products_info_revard",
  (firstSpeaker: ClientObject, secondSpeaker: ClientObject): void => {
    transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), questItems.jup_b47_jupiter_products_info);

    giveMoneyToActor(7000);
    giveItemsToActor(drugs.medkit_scientic, 3);
    giveItemsToActor(drugs.antirad, 5);
    giveItemsToActor(drugs.drug_psy_blockade, 2);
    giveItemsToActor(drugs.drug_antidot, 2);
    giveItemsToActor(drugs.drug_radioprotector, 2);
  }
);

/**
 * todo;
 */
extern(
  "dialogs_jupiter.jup_b47_actor_has_merc_pda",
  (firstSpeaker: ClientObject, secondSpeaker: ClientObject): boolean => {
    return registry.actor.object("jup_b47_merc_pda") !== null;
  }
);

/**
 * todo;
 */
extern(
  "dialogs_jupiter.jup_b47_actor_has_not_merc_pda",
  (firstSpeaker: ClientObject, secondSpeaker: ClientObject): boolean => {
    return !getExtern<AnyCallable>("jup_b47_actor_has_merc_pda", getExtern("dialogs_jupiter"))(
      firstSpeaker,
      secondSpeaker
    );
  }
);

/**
 * todo;
 */
extern("dialogs_jupiter.jup_b47_merc_pda_revard", (firstSpeaker: ClientObject, secondSpeaker: ClientObject): void => {
  transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), questItems.jup_b47_merc_pda);
  giveMoneyToActor(2500);
});

/**
 * todo;
 */
extern(
  "dialogs_jupiter.jup_b47_actor_can_take_task",
  (firstSpeaker: ClientObject, secondSpeaker: ClientObject): boolean => {
    const a: boolean = hasAlifeInfo(infoPortions.jup_b6_task_done) && !hasAlifeInfo(infoPortions.jup_b6_task_fail);
    const b: boolean = hasAlifeInfo(infoPortions.jup_b6_task_fail) && !hasAlifeInfo(infoPortions.jup_b6_task_done);

    return a || b;
  }
);

/**
 * todo;
 */
extern("dialogs_jupiter.jup_b47_employ_squad", (firstSpeaker: ClientObject, secondSpeaker: ClientObject): boolean => {
  const a: boolean =
    hasAlifeInfo(infoPortions.jup_b47_bunker_guards_started) && !hasAlifeInfo(infoPortions.jup_b47_bunker_guards_done);
  const b: boolean =
    hasAlifeInfo(infoPortions.jup_b6_employ_stalker) && !hasAlifeInfo(infoPortions.jup_b6_employed_stalker);

  return a || b;
});

/**
 * todo;
 */
extern(
  "dialogs_jupiter.jup_b47_bunker_guard_revard",
  (firstSpeaker: ClientObject, secondSpeaker: ClientObject): void => {
    giveMoneyToActor(4000);
    giveItemsToActor(drugs.drug_psy_blockade, 2);
    giveItemsToActor(drugs.drug_antidot, 3);
    giveItemsToActor(drugs.drug_radioprotector, 3);
  }
);

/**
 * todo;
 */
extern(
  "dialogs_jupiter.jup_b47_gauss_rifle_revard",
  (firstSpeaker: ClientObject, secondSpeaker: ClientObject): void => {
    giveMoneyToActor(12000);
  }
);

/**
 * todo;
 */
extern(
  "dialogs_jupiter.jup_b47_actor_has_hauss_rifle_docs",
  (firstSpeaker: ClientObject, secondSpeaker: ClientObject): boolean => {
    return registry.actor.object(questItems.zat_a23_gauss_rifle_docs) !== null;
  }
);

/**
 * todo;
 */
// -- Jupiter B10 --------------------------------------------------------------
extern(
  "dialogs_jupiter.jup_b10_ufo_memory_give_to_npc",
  (firstSpeaker: ClientObject, secondSpeaker: ClientObject): void => {
    transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), questItems.jup_b10_ufo_memory);
  }
);

/**
 * todo;
 */
extern(
  "dialogs_jupiter.jup_b10_ufo_memory_give_to_actor",
  (firstSpeaker: ClientObject, secondSpeaker: ClientObject): boolean => {
    return firstSpeaker.object(questItems.jup_b10_ufo_memory) !== null;
  }
);

/**
 * todo;
 */
extern(
  "dialogs_jupiter.jup_b10_ufo_memory_2_give_to_actor",
  (firstSpeaker: ClientObject, secondSpeaker: ClientObject): void => {
    transferItemsToActor(getNpcSpeaker(firstSpeaker, secondSpeaker), questItems.jup_b10_ufo_memory_2);
  }
);

/**
 * todo;
 */
extern(
  "dialogs_jupiter.jup_b10_ufo_has_money_1000",
  (firstSpeaker: ClientObject, secondSpeaker: ClientObject): boolean => {
    return registry.actor.money() >= 1000;
  }
);

/**
 * todo;
 */
extern(
  "dialogs_jupiter.jup_b10_ufo_has_money_3000",
  (firstSpeaker: ClientObject, secondSpeaker: ClientObject): boolean => {
    return registry.actor.money() >= 2000;
  }
);

/**
 * todo;
 */
extern(
  "dialogs_jupiter.jup_b10_ufo_hasnt_money_1000",
  (firstSpeaker: ClientObject, secondSpeaker: ClientObject): boolean => {
    return !getExtern<AnyCallable>("jup_b10_ufo_has_money_1000", getExtern("dialogs_jupiter"))(
      firstSpeaker,
      secondSpeaker
    );
  }
);

/**
 * todo;
 */
extern(
  "dialogs_jupiter.jup_b10_ufo_hasnt_money_3000",
  (firstSpeaker: ClientObject, secondSpeaker: ClientObject): boolean => {
    return !getExtern<AnyCallable>("jup_b10_ufo_has_money_3000", getExtern("dialogs_jupiter"))(
      firstSpeaker,
      secondSpeaker
    );
  }
);

/**
 * todo;
 */
extern(
  "dialogs_jupiter.jup_b10_ufo_relocate_money_1000",
  (firstSpeaker: ClientObject, secondSpeaker: ClientObject): void => {
    transferMoneyFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), 1000);
  }
);

/**
 * todo;
 */
extern(
  "dialogs_jupiter.jup_b10_ufo_relocate_money_3000",
  (firstSpeaker: ClientObject, secondSpeaker: ClientObject): void => {
    transferMoneyFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), 2000);
  }
);

/**
 * todo;
 */
extern(
  "dialogs_jupiter.jup_b10_actor_has_ufo_memory",
  (firstSpeaker: ClientObject, secondSpeaker: ClientObject): boolean => {
    return registry.actor.object(questItems.jup_b10_ufo_memory) !== null;
  }
);

/**
 * todo;
 */
extern(
  "dialogs_jupiter.jup_b211_kill_bludsuckers_reward",
  (firstSpeaker: ClientObject, secondSpeaker: ClientObject): void => {
    giveMoneyToActor(3000);
  }
);

/**
 * todo;
 */
extern(
  "dialogs_jupiter.jup_b19_transfer_conserva_to_actor",
  (firstSpeaker: ClientObject, secondSpeaker: ClientObject): void => {
    transferItemsToActor(getNpcSpeaker(firstSpeaker, secondSpeaker), food.conserva);
  }
);

/**
 * todo;
 */
extern(
  "dialogs_jupiter.jupiter_b6_sell_halfartefact",
  (firstSpeaker: ClientObject, secondSpeaker: ClientObject): void => {
    giveMoneyToActor(2000);
  }
);

/**
 * todo;
 */
extern(
  "dialogs_jupiter.pri_a15_sokolov_actor_has_note",
  (firstSpeaker: ClientObject, secondSpeaker: ClientObject): boolean => {
    return registry.actor.object(questItems.jup_b205_sokolov_note) !== null;
  }
);

/**
 * todo;
 */
extern(
  "dialogs_jupiter.pri_a15_sokolov_actor_has_not_note",
  (firstSpeaker: ClientObject, secondSpeaker: ClientObject): boolean => {
    return !getExtern<AnyCallable>("pri_a15_sokolov_actor_has_note", getExtern("dialogs_jupiter"))(
      firstSpeaker,
      secondSpeaker
    );
  }
);

/**
 * todo;
 */
extern(
  "dialogs_jupiter.pri_a15_sokolov_actor_give_note",
  (firstSpeaker: ClientObject, secondSpeaker: ClientObject): void => {
    transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), questItems.jup_b205_sokolov_note);
    transferItemsToActor(getNpcSpeaker(firstSpeaker, secondSpeaker), drugs.medkit_army);
  }
);

/**
 * todo;
 */
extern(
  "dialogs_jupiter.jup_b47_actor_not_enemy_to_freedom",
  (firstSpeaker: ClientObject, secondSpeaker: ClientObject): boolean => {
    return !isActorEnemyWithFaction(communities.freedom);
  }
);

/**
 * todo;
 */
extern(
  "dialogs_jupiter.jup_b47_actor_not_enemy_to_dolg",
  (firstSpeaker: ClientObject, secondSpeaker: ClientObject): boolean => {
    return !isActorEnemyWithFaction(communities.dolg);
  }
);

/**
 * todo;
 */
extern(
  "dialogs_jupiter.jup_b15_actor_sci_outfit",
  (firstSpeaker: ClientObject, secondSpeaker: ClientObject): boolean => {
    return registry.actor.object(outfits.scientific_outfit) !== null;
  }
);

/**
 * todo;
 */
extern(
  "dialogs_jupiter.jup_b15_no_actor_sci_outfit",
  (firstSpeaker: ClientObject, secondSpeaker: ClientObject): boolean => {
    return registry.actor.object(outfits.scientific_outfit) === null;
  }
);

/**
 * todo;
 */
extern("dialogs_jupiter.jup_b19_reward", (firstSpeaker: ClientObject, secondSpeaker: ClientObject): void => {
  TreasureManager.giveTreasureCoordinates(treasures.jup_hiding_place_38);
});

import { EGameObjectRelation, GameObject, ServerCreatureObject } from "xray16/alias";
import { $filename, $fromArray, $fromObject } from "xray16/macros";

import { AnomalyZoneBinder } from "@/engine/core/binders/zones/AnomalyZoneBinder";
import { getManager, registry } from "@/engine/core/database";
import { getPortableStoreValue } from "@/engine/core/database/portable_store";
import { TreasureManager } from "@/engine/core/managers/treasures";
import { extern, getExtern } from "@/engine/core/utils/binding";
import { getNpcSpeaker, isObjectName } from "@/engine/core/utils/dialog";
import { disableInfoPortion, giveInfoPortion, hasInfoPortion } from "@/engine/core/utils/info_portion";
import { LuaLogger } from "@/engine/core/utils/logging";
import { isObjectInSmartTerrain } from "@/engine/core/utils/position";
import { getObjectsRelationSafe, isActorEnemyWithFaction } from "@/engine/core/utils/relation";
import {
  giveItemsToActor,
  giveMoneyToActor,
  transferItemsFromActor,
  transferItemsToActor,
  transferMoneyFromActor,
} from "@/engine/core/utils/reward";
import { communities } from "@/engine/lib/constants/communities";
import { ACTOR_ID } from "@/engine/lib/constants/ids";
import { infoPortions, TInfoPortion } from "@/engine/lib/constants/info_portions/info_portions";
import { ammo } from "@/engine/lib/constants/items/ammo";
import { artefacts, TArtefact } from "@/engine/lib/constants/items/artefacts";
import { detectors } from "@/engine/lib/constants/items/detectors";
import { drugs } from "@/engine/lib/constants/items/drugs";
import { food } from "@/engine/lib/constants/items/food";
import { helmets, THelmet } from "@/engine/lib/constants/items/helmets";
import { misc } from "@/engine/lib/constants/items/misc";
import { outfits } from "@/engine/lib/constants/items/outfits";
import { questItems } from "@/engine/lib/constants/items/quest_items";
import { weapons } from "@/engine/lib/constants/items/weapons";
import {
  AnyCallable,
  AnyCallablesModule,
  AnyObject,
  LuaArray,
  Nillable,
  PartialRecord,
  TCount,
  TIndex,
  TName,
  TSection,
} from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

logger.info("Resolve and bind dialogs jupiter");

/**
 * Declare globals object.
 */
extern("dialogs_jupiter", {});

/**
 * Reward the actor for the b208 burer hunt with money and treasure coordinates.
 *
 * @param _ - Actor participating in the dialog, unused.
 * @param __ - NPC participating in the dialog, unused.
 */
extern("dialogs_jupiter.jup_b208_give_reward", (_: GameObject, __: GameObject): void => {
  giveMoneyToActor(5000);

  const treasureManager: TreasureManager = getManager(TreasureManager);

  treasureManager.giveActorTreasureCoordinates("jup_hiding_place_18");
  treasureManager.giveActorTreasureCoordinates("jup_hiding_place_35");
  treasureManager.giveActorTreasureCoordinates("jup_hiding_place_45");
});

/**
 * Check whether the actor is missing at least one of the a9 mail quest items.
 *
 * @param firstSpeaker - Actor participating in the dialog.
 * @param secondSpeaker - NPC participating in the dialog.
 * @returns Whether the actor does not have all a9 mail items.
 */
extern(
  "dialogs_jupiter.jupiter_a9_actor_hasnt_all_mail_items",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
    return !getExtern<AnyCallable>("jupiter_a9_actor_has_all_mail_items", getExtern("dialogs_jupiter"))(
      firstSpeaker,
      secondSpeaker
    );
  }
);

/**
 * Check whether the actor has all three a9 mail quest items.
 *
 * @param _ - Actor participating in the dialog, unused.
 * @param __ - NPC participating in the dialog, unused.
 * @returns Whether the actor has all a9 mail items.
 */
extern("dialogs_jupiter.jupiter_a9_actor_has_all_mail_items", (_: GameObject, __: GameObject): boolean => {
  const actor: GameObject = registry.actor;

  return (
    actor.object(questItems.jup_a9_conservation_info) !== null &&
    actor.object(questItems.jup_a9_power_info) !== null &&
    actor.object(questItems.jup_a9_way_info) !== null
  );
});

/**
 * Check whether the actor has any of the a9 quest documents.
 *
 * @param _ - Actor participating in the dialog, unused.
 * @param __ - NPC participating in the dialog, unused.
 * @returns Whether the actor has any a9 quest item.
 */
extern("dialogs_jupiter.jupiter_a9_actor_has_any_items", (_: GameObject, __: GameObject): boolean => {
  const actor: GameObject = registry.actor;

  return (
    actor.object(questItems.jup_a9_delivery_info) !== null ||
    actor.object(questItems.jup_a9_evacuation_info) !== null ||
    actor.object(questItems.jup_a9_losses_info) !== null ||
    actor.object(questItems.jup_a9_power_info) !== null ||
    actor.object(questItems.jup_a9_conservation_info) !== null ||
    actor.object(questItems.jup_a9_way_info) !== null ||
    actor.object(questItems.jup_a9_meeting_info) !== null
  );
});

/**
 * Check whether the actor has any of the a9 mail quest items.
 *
 * @param _ - Actor participating in the dialog, unused.
 * @param __ - NPC participating in the dialog, unused.
 * @returns Whether the actor has any a9 mail item.
 */
extern("dialogs_jupiter.jupiter_a9_actor_has_any_mail_items", (_: GameObject, __: GameObject): boolean => {
  const actor: GameObject = registry.actor;

  return (
    actor.object(questItems.jup_a9_conservation_info) !== null ||
    actor.object(questItems.jup_a9_power_info) !== null ||
    actor.object(questItems.jup_a9_way_info) !== null
  );
});

/**
 * Check whether the actor has any of the a9 secondary quest documents.
 *
 * @param _ - Actor participating in the dialog, unused.
 * @param __ - NPC participating in the dialog, unused.
 * @returns Whether the actor has any a9 secondary item.
 */
extern("dialogs_jupiter.jupiter_a9_actor_has_any_secondary_items", (_: GameObject, __: GameObject): boolean => {
  const actor: GameObject = registry.actor;

  return (
    actor.object(questItems.jup_a9_delivery_info) !== null ||
    actor.object(questItems.jup_a9_evacuation_info) !== null ||
    actor.object(questItems.jup_a9_losses_info) !== null ||
    actor.object(questItems.jup_a9_meeting_info) !== null
  );
});

/**
 * Check whether the actor is missing any of the a9 mail quest items.
 *
 * @param _ - Actor participating in the dialog, unused.
 * @param __ - NPC participating in the dialog, unused.
 * @returns Whether the actor lacks at least one a9 mail item.
 */
extern("dialogs_jupiter.jupiter_a9_actor_hasnt_any_mail_items", (_: GameObject, __: GameObject): boolean => {
  const actor: GameObject = registry.actor;

  return (
    actor.object(questItems.jup_a9_conservation_info) === null ||
    actor.object(questItems.jup_a9_power_info) === null ||
    actor.object(questItems.jup_a9_way_info) === null
  );
});

/**
 * Reward the actor with money for delivering the a9 delivery info to the Freedom leader.
 *
 * @param _ - Actor participating in the dialog, unused.
 * @param __ - NPC participating in the dialog, unused.
 */
extern("dialogs_jupiter.jupiter_a9_freedom_leader_jupiter_delivery", (_: GameObject, __: GameObject): void => {
  giveMoneyToActor(500);
});

/**
 * Reward the actor with money for delivering the a9 evacuation info to the Freedom leader.
 *
 * @param _ - Actor participating in the dialog, unused.
 * @param __ - NPC participating in the dialog, unused.
 */
extern("dialogs_jupiter.jupiter_a9_freedom_leader_jupiter_evacuation", (_: GameObject, __: GameObject): void => {
  giveMoneyToActor(500);
});

/**
 * Reward the actor with money for delivering the a9 losses info to the Freedom leader.
 *
 * @param _ - Actor participating in the dialog, unused.
 * @param __ - NPC participating in the dialog, unused.
 */
extern("dialogs_jupiter.jupiter_a9_freedom_leader_jupiter_losses", (_: GameObject, __: GameObject): void => {
  giveMoneyToActor(500);
});

/**
 * Reward the actor with money for delivering the a9 meeting info to the Freedom leader.
 *
 * @param _ - Actor participating in the dialog, unused.
 * @param __ - NPC participating in the dialog, unused.
 */
extern("dialogs_jupiter.jupiter_a9_freedom_leader_jupiter_meeting", (_: GameObject, __: GameObject): void => {
  giveMoneyToActor(500);
});

/**
 * Reward the actor with money for delivering the a9 delivery info to the Duty leader.
 *
 * @param _ - Actor participating in the dialog, unused.
 * @param __ - NPC participating in the dialog, unused.
 */
extern("dialogs_jupiter.jupiter_a9_dolg_leader_jupiter_delivery", (_: GameObject, __: GameObject): void => {
  giveMoneyToActor(500);
});

/**
 * Reward the actor with money for delivering the a9 evacuation info to the Duty leader.
 *
 * @param _ - Actor participating in the dialog, unused.
 * @param __ - NPC participating in the dialog, unused.
 */
extern("dialogs_jupiter.jupiter_a9_dolg_leader_jupiter_evacuation", (_: GameObject, __: GameObject): void => {
  giveMoneyToActor(500);
});

/**
 * Reward the actor with money for delivering the a9 losses info to the Duty leader.
 *
 * @param _ - Actor participating in the dialog, unused.
 * @param __ - NPC participating in the dialog, unused.
 */
extern("dialogs_jupiter.jupiter_a9_dolg_leader_jupiter_losses", (_: GameObject, __: GameObject): void => {
  giveMoneyToActor(500);
});

/**
 * Reward the actor with money for delivering the a9 meeting info to the Duty leader.
 *
 * @param _ - Actor participating in the dialog, unused.
 * @param __ - NPC participating in the dialog, unused.
 */
extern("dialogs_jupiter.jupiter_a9_dolg_leader_jupiter_meeting", (_: GameObject, __: GameObject): void => {
  giveMoneyToActor(500);
});

/**
 * Sell the a9 evacuation info to the Owl trader for money and mark it as sold.
 *
 * @param firstSpeaker - Actor participating in the dialog.
 * @param secondSpeaker - NPC participating in the dialog.
 */
extern(
  "dialogs_jupiter.jup_a9_owl_stalker_trader_sell_jup_a9_evacuation_info",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
    transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), questItems.jup_a9_evacuation_info);
    giveMoneyToActor(750);
    giveInfoPortion(infoPortions.jup_a9_evacuation_info_sold);
  }
);

/**
 * Sell the a9 meeting info to the Owl trader for money and mark it as sold.
 *
 * @param firstSpeaker - Actor participating in the dialog.
 * @param secondSpeaker - NPC participating in the dialog.
 */
extern(
  "dialogs_jupiter.jup_a9_owl_stalker_trader_sell_jup_a9_meeting_info",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
    transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), questItems.jup_a9_meeting_info);
    giveMoneyToActor(750);
    giveInfoPortion(infoPortions.jup_a9_meeting_info_sold);
  }
);

/**
 * Sell the a9 losses info to the Owl trader for money and mark it as sold.
 *
 * @param firstSpeaker - Actor participating in the dialog.
 * @param secondSpeaker - NPC participating in the dialog.
 */
extern(
  "dialogs_jupiter.jup_a9_owl_stalker_trader_sell_jup_a9_losses_info",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
    transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), questItems.jup_a9_losses_info);
    giveMoneyToActor(750);
    giveInfoPortion(infoPortions.jup_a9_losses_info_sold);
  }
);

/**
 * Sell the a9 delivery info to the Owl trader for money and mark it as sold.
 *
 * @param firstSpeaker - Actor participating in the dialog.
 * @param secondSpeaker - NPC participating in the dialog.
 */
extern(
  "dialogs_jupiter.jup_a9_owl_stalker_trader_sell_jup_a9_delivery_info",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
    transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), questItems.jup_a9_delivery_info);
    giveMoneyToActor(750);
    giveInfoPortion(infoPortions.jup_a9_delivery_info_sold);
  }
);

/**
 * Hand over every a9 secondary info the actor owns to the Duty leader and reward each one.
 *
 * @param firstSpeaker - Actor participating in the dialog.
 * @param secondSpeaker - NPC participating in the dialog.
 */
extern(
  "dialogs_jupiter.jupiter_a9_dolg_leader_jupiter_sell_all_secondary_items",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
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
 * Hand over every a9 secondary info the actor owns to the Freedom leader and reward each one.
 *
 * @param firstSpeaker - Actor participating in the dialog.
 * @param secondSpeaker - NPC participating in the dialog.
 */
extern(
  "dialogs_jupiter.jupiter_a9_freedom_leader_jupiter_sell_all_secondary_items",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
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
 * Check whether the actor has the a9 conservation info item.
 *
 * @param _ - Actor participating in the dialog, unused.
 * @param __ - NPC participating in the dialog, unused.
 * @returns Whether the actor has the conservation info.
 */
extern("dialogs_jupiter.jup_a9_actor_has_conservation_info", (_: GameObject, __: GameObject): boolean => {
  return registry.actor.object(questItems.jup_a9_conservation_info) !== null;
});

/**
 * Check whether the actor does not have the a9 conservation info item.
 *
 * @param firstSpeaker - Actor participating in the dialog.
 * @param secondSpeaker - NPC participating in the dialog.
 * @returns Whether the actor lacks the conservation info.
 */
extern(
  "dialogs_jupiter.jup_a9_actor_hasnt_conservation_info",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
    return !getExtern<AnyCallable>("jup_a9_actor_has_conservation_info", getExtern("dialogs_jupiter"))(
      firstSpeaker,
      secondSpeaker
    );
  }
);

/**
 * Transfer the a9 conservation info item from the actor to the NPC speaker.
 *
 * @param firstSpeaker - Actor participating in the dialog.
 * @param secondSpeaker - NPC participating in the dialog.
 */
extern(
  "dialogs_jupiter.actor_relocate_conservation_info",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
    transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), questItems.jup_a9_conservation_info);
  }
);

/**
 * Check whether the actor has the a9 power info item.
 *
 * @param _ - Actor participating in the dialog, unused.
 * @param __ - NPC participating in the dialog, unused.
 * @returns Whether the actor has the power info.
 */
extern("dialogs_jupiter.jup_a9_actor_has_power_info", (_: GameObject, __: GameObject): boolean => {
  return registry.actor.object(questItems.jup_a9_power_info) !== null;
});

/**
 * Check whether the actor does not have the a9 power info item.
 *
 * @param firstSpeaker - Actor participating in the dialog.
 * @param secondSpeaker - NPC participating in the dialog.
 * @returns Whether the actor lacks the power info.
 */
extern(
  "dialogs_jupiter.jup_a9_actor_hasnt_power_info",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
    return !getExtern<AnyCallable>("jup_a9_actor_has_power_info", getExtern("dialogs_jupiter"))(
      firstSpeaker,
      secondSpeaker
    );
  }
);

/**
 * Transfer the a9 power info item from the actor to the NPC speaker.
 *
 * @param firstSpeaker - Actor participating in the dialog.
 * @param secondSpeaker - NPC participating in the dialog.
 */
extern("dialogs_jupiter.actor_relocate_power_info", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), questItems.jup_a9_power_info);
});

/**
 * Check whether the actor has the a9 way info item.
 *
 * @param _ - Actor participating in the dialog, unused.
 * @param __ - NPC participating in the dialog, unused.
 * @returns Whether the actor has the way info.
 */
extern("dialogs_jupiter.jup_a9_actor_has_way_info", (_: GameObject, __: GameObject): boolean => {
  return registry.actor.object(questItems.jup_a9_way_info) !== null;
});

/**
 * Check whether the actor does not have the a9 way info item.
 *
 * @param firstSpeaker - Actor participating in the dialog.
 * @param secondSpeaker - NPC participating in the dialog.
 * @returns Whether the actor lacks the way info.
 */
extern(
  "dialogs_jupiter.jup_a9_actor_hasnt_way_info",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
    return !getExtern<AnyCallable>("jup_a9_actor_has_way_info", getExtern("dialogs_jupiter"))(
      firstSpeaker,
      secondSpeaker
    );
  }
);

/**
 * Transfer the a9 way info item from the actor to the NPC speaker.
 *
 * @param firstSpeaker - Actor participating in the dialog.
 * @param secondSpeaker - NPC participating in the dialog.
 */
extern("dialogs_jupiter.actor_relocate_way_info", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), questItems.jup_a9_way_info);
});

/**
 * Check whether the actor has the a9 meeting info item.
 *
 * @param _ - Actor participating in the dialog, unused.
 * @param __ - NPC participating in the dialog, unused.
 * @returns Whether the actor has the meeting info.
 */
extern("dialogs_jupiter.jup_a9_actor_has_meeting_info", (_: GameObject, __: GameObject): boolean => {
  return registry.actor.object(questItems.jup_a9_meeting_info) !== null;
});

/**
 * Check whether the actor does not have the a9 meeting info item.
 *
 * @param firstSpeaker - Actor participating in the dialog.
 * @param secondSpeaker - NPC participating in the dialog.
 * @returns Whether the actor lacks the meeting info.
 */
extern(
  "dialogs_jupiter.jup_a9_actor_hasnt_meeting_info",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
    return !getExtern<AnyCallable>("jup_a9_actor_has_meeting_info", getExtern("dialogs_jupiter"))(
      firstSpeaker,
      secondSpeaker
    );
  }
);

/**
 * Transfer the a9 meeting info from the actor to the NPC and mark it as sold.
 *
 * @param firstSpeaker - Actor participating in the dialog.
 * @param secondSpeaker - NPC participating in the dialog.
 */
extern("dialogs_jupiter.actor_relocate_meeting_info", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), questItems.jup_a9_meeting_info);
  giveInfoPortion(infoPortions.jup_a9_meeting_info_sold);
});

/**
 * Check whether the actor has the a9 delivery info item.
 *
 * @param _ - Actor participating in the dialog, unused.
 * @param __ - NPC participating in the dialog, unused.
 * @returns Whether the actor has the delivery info.
 */
extern("dialogs_jupiter.jup_a9_actor_has_delivery_info", (_: GameObject, __: GameObject): boolean => {
  return registry.actor.object(questItems.jup_a9_delivery_info) !== null;
});

/**
 * Check whether the actor does not have the a9 delivery info item.
 *
 * @param firstSpeaker - Actor participating in the dialog.
 * @param secondSpeaker - NPC participating in the dialog.
 * @returns Whether the actor lacks the delivery info.
 */
extern(
  "dialogs_jupiter.jup_a9_actor_hasnt_delivery_info",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
    return !getExtern<AnyCallable>("jup_a9_actor_has_delivery_info", getExtern("dialogs_jupiter"))(
      firstSpeaker,
      secondSpeaker
    );
  }
);

/**
 * Check whether the actor has the a9 evacuation info item.
 *
 * @param _ - Actor participating in the dialog, unused.
 * @param __ - NPC participating in the dialog, unused.
 * @returns Whether the actor has the evacuation info.
 */
extern("dialogs_jupiter.jup_a9_actor_has_evacuation_info", (_: GameObject, __: GameObject): boolean => {
  return registry.actor.object(questItems.jup_a9_evacuation_info) !== null;
});

/**
 * Check whether the actor does not have the a9 evacuation info item.
 *
 * @param firstSpeaker - Actor participating in the dialog.
 * @param secondSpeaker - NPC participating in the dialog.
 * @returns Whether the actor lacks the evacuation info.
 */
extern(
  "dialogs_jupiter.jup_a9_actor_hasnt_evacuation_info",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
    return !getExtern<AnyCallable>("jup_a9_actor_has_evacuation_info", getExtern("dialogs_jupiter"))(
      firstSpeaker,
      secondSpeaker
    );
  }
);

/**
 * Transfer the a9 evacuation info from the actor to the NPC and mark it as sold.
 *
 * @param firstSpeaker - Actor participating in the dialog.
 * @param secondSpeaker - NPC participating in the dialog.
 */
extern(
  "dialogs_jupiter.actor_relocate_evacuation_info",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
    transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), questItems.jup_a9_evacuation_info);
    giveInfoPortion(infoPortions.jup_a9_evacuation_info_sold);
  }
);

/**
 * Transfer the a9 delivery info from the actor to the NPC and mark it as sold.
 *
 * @param firstSpeaker - Actor participating in the dialog.
 * @param secondSpeaker - NPC participating in the dialog.
 */
extern("dialogs_jupiter.actor_relocate_delivery_info", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), questItems.jup_a9_delivery_info);
  giveInfoPortion(infoPortions.jup_a9_delivery_info_sold);
});

/**
 * Check whether the actor has the a9 losses info item.
 *
 * @param _ - Actor participating in the dialog, unused.
 * @param __ - NPC participating in the dialog, unused.
 * @returns Whether the actor has the losses info.
 */
extern("dialogs_jupiter.jup_a9_actor_has_losses_info", (_: GameObject, __: GameObject): boolean => {
  return registry.actor.object(questItems.jup_a9_losses_info) !== null;
});

/**
 * Check whether the actor does not have the a9 losses info item.
 *
 * @param firstSpeaker - Actor participating in the dialog.
 * @param secondSpeaker - NPC participating in the dialog.
 * @returns Whether the actor lacks the losses info.
 */
extern(
  "dialogs_jupiter.jup_a9_actor_hasnt_losses_info",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
    return !getExtern<AnyCallable>("jup_a9_actor_has_losses_info", getExtern("dialogs_jupiter"))(
      firstSpeaker,
      secondSpeaker
    );
  }
);

/**
 * Transfer the a9 losses info from the actor to the NPC and mark it as sold.
 *
 * @param firstSpeaker - Actor participating in the dialog.
 * @param secondSpeaker - NPC participating in the dialog.
 */
extern("dialogs_jupiter.actor_relocate_losses_info", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), questItems.jup_a9_losses_info);
  giveInfoPortion(infoPortions.jup_a9_losses_info_sold);
});

/**
 * Check whether the actor has the b206 plant quest item.
 *
 * @param _ - Actor participating in the dialog, unused.
 * @param __ - NPC participating in the dialog, unused.
 * @returns Whether the actor has the plant item.
 */
extern("dialogs_jupiter.actor_has_plant", (_: GameObject, __: GameObject): boolean => {
  return registry.actor.object(questItems.jup_b206_plant) !== null;
});

/**
 * Transfer the b206 plant quest item from the actor to the NPC speaker.
 *
 * @param firstSpeaker - Actor participating in the dialog.
 * @param secondSpeaker - NPC participating in the dialog.
 */
extern("dialogs_jupiter.actor_relocate_plant", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), questItems.jup_b206_plant);
});

/**
 * Give the trapper Winchester reward weapon from the NPC speaker to the actor.
 *
 * @param firstSpeaker - Actor participating in the dialog.
 * @param secondSpeaker - NPC participating in the dialog.
 */
extern("dialogs_jupiter.actor_relocate_trapper_reward", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  transferItemsToActor(getNpcSpeaker(firstSpeaker, secondSpeaker), weapons.wpn_wincheaster1300_trapper);
});

/**
 * Reward the actor with money for the trapper quest, paying more if the chimera was killed in one hit.
 *
 * @param _ - Actor participating in the dialog, unused.
 * @param __ - NPC participating in the dialog, unused.
 */
extern("dialogs_jupiter.zat_b106_trapper_reward", (_: GameObject, __: GameObject): void => {
  if (hasInfoPortion(infoPortions.zat_b106_one_hit)) {
    giveMoneyToActor(3000);
  } else {
    giveMoneyToActor(2000);
  }
});

/**
 * Check whether the actor carries one of the accepted high-tier weapons in a weapon slot.
 *
 * @param _ - Actor participating in the dialog, unused.
 * @param __ - NPC participating in the dialog, unused.
 * @returns Whether a matching weapon is equipped.
 */
extern("dialogs_jupiter.jup_a10_proverka_wpn", (_: GameObject, __: GameObject): boolean => {
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

  const actor: GameObject = registry.actor;

  for (const [, v] of table) {
    if (actor.item_in_slot(2)?.section() === v || actor.item_in_slot(3)?.section() === v) {
      return true;
    }
  }

  return false;
});

/**
 * Check whether the actor does not carry any of the accepted high-tier weapons.
 *
 * @param firstSpeaker - Actor participating in the dialog.
 * @param secondSpeaker - NPC participating in the dialog.
 * @returns Whether no matching weapon is equipped.
 */
extern("dialogs_jupiter.jup_a10_proverka_wpn_false", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return !getExtern<AnyCallable>("jup_a10_proverka_wpn", getExtern("dialogs_jupiter"))(firstSpeaker, secondSpeaker);
});

/**
 * Check whether the actor has enough money for the a10 debt, reduced when the percent-free info is set.
 *
 * @param _ - Actor participating in the dialog, unused.
 * @param __ - NPC participating in the dialog, unused.
 * @returns Whether the actor can pay the debt.
 */
extern("dialogs_jupiter.jup_a10_actor_has_money", (_: GameObject, __: GameObject): boolean => {
  const actor: GameObject = registry.actor;

  if (hasInfoPortion(infoPortions.jup_a10_debt_wo_percent)) {
    return actor.money() >= 5000;
  } else {
    return actor.money() >= 7000;
  }
});

/**
 * Check whether the actor cannot afford the a10 debt payment.
 *
 * @param firstSpeaker - Actor participating in the dialog.
 * @param secondSpeaker - NPC participating in the dialog.
 * @returns Whether the actor lacks the required money.
 */
extern(
  "dialogs_jupiter.jup_a10_actor_has_not_money",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
    return !getExtern<AnyCallable>("jup_a10_actor_has_money", getExtern("dialogs_jupiter"))(
      firstSpeaker,
      secondSpeaker
    );
  }
);

/**
 * Take the a10 debt payment from the actor and set the matching paid-debt info portion.
 *
 * @param firstSpeaker - Actor participating in the dialog.
 * @param secondSpeaker - NPC participating in the dialog.
 */
extern("dialogs_jupiter.jup_a10_actor_give_money", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  if (hasInfoPortion(infoPortions.jup_a10_debt_wo_percent)) {
    transferMoneyFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), 5000);
    giveInfoPortion(infoPortions.jup_a10_bandit_take_money);
  } else {
    transferMoneyFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), 7000);
    giveInfoPortion(infoPortions.jup_a10_bandit_take_all_money);
  }
});

/**
 * Give the actor money from Vano during the a10 quest.
 *
 * @param _ - Actor participating in the dialog, unused.
 * @param __ - NPC participating in the dialog, unused.
 */
extern("dialogs_jupiter.jup_a10_vano_give_money", (_: GameObject, __: GameObject): void => {
  giveMoneyToActor(5000);
});

/**
 * Take the outfit payment money from the actor for the a10 quest.
 *
 * @param firstSpeaker - Actor participating in the dialog.
 * @param secondSpeaker - NPC participating in the dialog.
 */
extern(
  "dialogs_jupiter.jup_a10_actor_give_outfit_money",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
    transferMoneyFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), 5000);
  }
);

/**
 * Check whether the actor has enough money to pay for the a10 outfit.
 *
 * @param _ - Actor participating in the dialog, unused.
 * @param __ - NPC participating in the dialog, unused.
 * @returns Whether the actor can afford the outfit.
 */
extern("dialogs_jupiter.jup_a10_actor_has_outfit_money", (_: GameObject, __: GameObject): boolean => {
  return registry.actor.money() >= 5000;
});

/**
 * Check whether the actor cannot afford the a10 outfit.
 *
 * @param firstSpeaker - Actor participating in the dialog.
 * @param secondSpeaker - NPC participating in the dialog.
 * @returns Whether the actor lacks the outfit money.
 */
extern(
  "dialogs_jupiter.jup_a10_actor_has_not_outfit_money",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
    return !getExtern<AnyCallable>("jup_a10_actor_has_outfit_money", getExtern("dialogs_jupiter"))(
      firstSpeaker,
      secondSpeaker
    );
  }
);

/**
 * Check whether the actor has the b16 oasis heart artefact.
 *
 * @param firstSpeaker - Actor participating in the dialog.
 * @param __ - NPC participating in the dialog, unused.
 * @returns Whether the actor has the oasis artefact.
 */
extern("dialogs_jupiter.if_actor_has_jup_b16_oasis_artifact", (firstSpeaker: GameObject, __: GameObject): boolean => {
  return firstSpeaker.object(artefacts.af_oasis_heart) !== null;
});

/**
 * Check whether the actor does not have the b16 oasis heart artefact.
 *
 * @param firstSpeaker - Actor participating in the dialog.
 * @param secondSpeaker - NPC participating in the dialog.
 * @returns Whether the actor lacks the oasis artefact.
 */
extern(
  "dialogs_jupiter.if_actor_hasnt_jup_b16_oasis_artifact",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
    return !getExtern<AnyCallable>("if_actor_has_jup_b16_oasis_artifact", getExtern("dialogs_jupiter"))(
      firstSpeaker,
      secondSpeaker
    );
  }
);

/**
 * Reward the actor with money for the b16 oasis quest.
 *
 * @param _ - Actor participating in the dialog, unused.
 * @param __ - NPC participating in the dialog, unused.
 */
extern("dialogs_jupiter.jupiter_b16_reward", (_: GameObject, __: GameObject): void => {
  giveMoneyToActor(7000);
});

/**
 * Transfer the b16 oasis heart artefact from the actor to the NPC speaker.
 *
 * @param firstSpeaker - Actor participating in the dialog.
 * @param secondSpeaker - NPC participating in the dialog.
 */
extern("dialogs_jupiter.give_jup_b16_oasis_artifact", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), artefacts.af_oasis_heart);
});

/**
 * Check whether the actor has at least the a12 ransom of money.
 *
 * @param _ - Actor participating in the dialog, unused.
 * @param __ - NPC participating in the dialog, unused.
 * @returns Whether the actor has enough money.
 */
extern("dialogs_jupiter.jup_a12_actor_has_15000_money", (_: GameObject, __: GameObject): boolean => {
  return registry.actor.money() >= 15000;
});

/**
 * Check whether the actor has less than the a12 ransom of money.
 *
 * @param _ - Actor participating in the dialog, unused.
 * @param __ - NPC participating in the dialog, unused.
 * @returns Whether the actor lacks the ransom money.
 */
extern("dialogs_jupiter.jup_a12_actor_do_not_has_15000_money", (_: GameObject, __: GameObject): boolean => {
  return registry.actor.money() < 15000;
});

/**
 * List of artefacts accepted as the a12 ransom.
 */
const jupA12AfTable: LuaArray<TArtefact> = $fromArray<TArtefact>([
  artefacts.af_fire,
  artefacts.af_gold_fish,
  artefacts.af_glass,
  artefacts.af_ice,
]);

/**
 * Check whether the actor has any of the a12 ransom artefacts.
 *
 * @param _ - Actor participating in the dialog, unused.
 * @param __ - NPC participating in the dialog, unused.
 * @returns Whether the actor has a ransom artefact.
 */
extern("dialogs_jupiter.jup_a12_actor_has_artefacts", (_: GameObject, __: GameObject): boolean => {
  for (const [k, v] of jupA12AfTable) {
    if (registry.actor.object(v) !== null) {
      return true;
    }
  }

  return false;
});

/**
 * Check whether the actor has the first a12 ransom artefact.
 *
 * @param _ - Actor participating in the dialog, unused.
 * @param __ - NPC participating in the dialog, unused.
 * @returns Whether the actor has the first artefact.
 */
extern("dialogs_jupiter.jup_a12_actor_has_artefact_1", (_: GameObject, __: GameObject): boolean => {
  return registry.actor.object(jupA12AfTable.get(1)) !== null;
});

/**
 * Check whether the actor has the second a12 ransom artefact.
 *
 * @param _ - Actor participating in the dialog, unused.
 * @param __ - NPC participating in the dialog, unused.
 * @returns Whether the actor has the second artefact.
 */
extern("dialogs_jupiter.jup_a12_actor_has_artefact_2", (_: GameObject, __: GameObject): boolean => {
  return registry.actor.object(jupA12AfTable.get(2)) !== null;
});

/**
 * Check whether the actor has the third a12 ransom artefact.
 *
 * @param _ - Actor participating in the dialog, unused.
 * @param __ - NPC participating in the dialog, unused.
 * @returns Whether the actor has the third artefact.
 */
extern("dialogs_jupiter.jup_a12_actor_has_artefact_3", (_: GameObject, __: GameObject): boolean => {
  return registry.actor.object(jupA12AfTable.get(3)) !== null;
});

/**
 * Check whether the actor has the fourth a12 ransom artefact.
 *
 * @param _ - Actor participating in the dialog, unused.
 * @param __ - NPC participating in the dialog, unused.
 * @returns Whether the actor has the fourth artefact.
 */
extern("dialogs_jupiter.jup_a12_actor_has_artefact_4", (_: GameObject, __: GameObject): boolean => {
  return registry.actor.object(jupA12AfTable.get(4)) !== null;
});

/**
 * Check whether the actor has none of the a12 ransom artefacts.
 *
 * @param _ - Actor participating in the dialog, unused.
 * @param __ - NPC participating in the dialog, unused.
 * @returns Whether the actor lacks all ransom artefacts.
 */
extern("dialogs_jupiter.jup_a12_actor_do_not_has_artefacts", (_: GameObject, __: GameObject): boolean => {
  const actor: GameObject = registry.actor;

  for (const [k, v] of jupA12AfTable) {
    if (actor.object(v) !== null) {
      return false;
    }
  }

  return true;
});

/**
 * Take the a12 ransom from the actor as money or the matching artefact, depending on the chosen info portion.
 *
 * @param firstSpeaker - Actor participating in the dialog.
 * @param secondSpeaker - NPC participating in the dialog.
 */
extern(
  "dialogs_jupiter.jup_a12_transfer_ransom_from_actor",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
    if (hasInfoPortion(infoPortions.jup_a12_ransom_by_money)) {
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
      if (hasInfoPortion(jupA12InfoTable.get(i))) {
        transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), jupA12AfTable.get(i));

        return;
      }
    }
  }
);

/**
 * Reward the actor with money and treasure coordinates for the a12 quest.
 *
 * @param _ - Actor participating in the dialog, unused.
 * @param __ - NPC participating in the dialog, unused.
 */
extern("dialogs_jupiter.jup_a12_transfer_5000_money_to_actor", (_: GameObject, __: GameObject): void => {
  const treasureManager: TreasureManager = getManager(TreasureManager);

  giveMoneyToActor(5000);

  treasureManager.giveActorTreasureCoordinates("jup_hiding_place_40");
  treasureManager.giveActorTreasureCoordinates("jup_hiding_place_34");
});

/**
 * Give the actor the gold fish artefact, plus treasure coordinates if the prisoner was freed.
 *
 * @param firstSpeaker - Actor participating in the dialog.
 * @param secondSpeaker - NPC participating in the dialog.
 */
extern(
  "dialogs_jupiter.jup_a12_transfer_artefact_to_actor",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
    transferItemsToActor(getNpcSpeaker(firstSpeaker, secondSpeaker), artefacts.af_gold_fish);

    if (hasInfoPortion(infoPortions.jup_a12_stalker_prisoner_free_dialog_done)) {
      const treasureManager: TreasureManager = getManager(TreasureManager);

      treasureManager.giveActorTreasureCoordinates("jup_hiding_place_40");
      treasureManager.giveActorTreasureCoordinates("jup_hiding_place_34");
    }
  }
);

/**
 * Take a random amount of money from the actor for the a12 cashier, capped at what the actor owns.
 *
 * @param firstSpeaker - Actor participating in the dialog.
 * @param secondSpeaker - NPC participating in the dialog.
 */
extern(
  "dialogs_jupiter.jup_a12_transfer_cashier_money_from_actor",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
    let amount: TCount = math.random(20, 50) * 100;
    const actor: GameObject = registry.actor;

    if (actor.money() < amount) {
      amount = actor.money();
    }

    transferMoneyFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), amount);
  }
);

/**
 * Transfer three elite detectors from the actor to the NPC speaker.
 *
 * @param firstSpeaker - Actor participating in the dialog.
 * @param secondSpeaker - NPC participating in the dialog.
 */
extern("dialogs_jupiter.zat_b30_transfer_detectors", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), detectors.detector_elite, 3);
});

/**
 * Check whether the actor does not have the elite detectors required for the b30 transfer.
 *
 * @param firstSpeaker - Actor participating in the dialog.
 * @param secondSpeaker - NPC participating in the dialog.
 * @returns Whether the actor lacks the required detectors.
 */
extern(
  "dialogs_jupiter.zat_b30_actor_do_not_has_transfer_items",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
    return !getExtern<AnyCallable>("zat_b30_actor_has_transfer_items", getExtern("dialogs_jupiter"))(
      firstSpeaker,
      secondSpeaker
    );
  }
);

/**
 * Check whether the actor carries at least three elite detectors in the inventory.
 *
 * @param _ - Actor participating in the dialog, unused.
 * @param __ - NPC participating in the dialog, unused.
 * @returns Whether the actor has enough detectors.
 */
extern("dialogs_jupiter.zat_b30_actor_has_transfer_items", (_: GameObject, __: GameObject): boolean => {
  const actor: GameObject = registry.actor;
  let cnt: TCount = 0;

  function zatB30Count(object: GameObject, item: GameObject): void {
    if (item.section() === "detector_elite") {
      cnt = cnt + 1;
    }
  }

  actor.iterate_inventory(zatB30Count, actor);

  return cnt >= 3;
});

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
 * Check whether the b32 task can be offered, blocking it while the task is started but not ended.
 *
 * @param _ - Actor participating in the dialog, unused.
 * @param __ - NPC participating in the dialog, unused.
 * @returns Whether the b32 task dialog is available.
 */
extern("dialogs_jupiter.jup_b32_task_give_dialog_precond", (_: GameObject, __: GameObject): boolean => {
  return !(hasInfoPortion(infoPortions.jup_b32_task_start) && !hasInfoPortion("jup_b32_task_end"));
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
 * Give the actor the b209 monster scanner from the NPC speaker.
 *
 * @param firstSpeaker - Actor participating in the dialog.
 * @param secondSpeaker - NPC participating in the dialog.
 */
extern("dialogs_jupiter.jup_b209_get_monster_scanner", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  transferItemsToActor(getNpcSpeaker(firstSpeaker, secondSpeaker), "jup_b209_monster_scanner", 1);
});

/**
 * Take the b209 monster scanner from the actor and return it to the NPC speaker.
 *
 * @param firstSpeaker - Actor participating in the dialog.
 * @param secondSpeaker - NPC participating in the dialog.
 */
extern(
  "dialogs_jupiter.jup_b209_return_monster_scanner",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
    transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), "jup_b209_monster_scanner", 1);
  }
);

/**
 * Check whether the marked b32 anomaly zone currently has no spawned artefact, cleaning up stale info portions.
 *
 * @param _ - Actor participating in the dialog, unused.
 * @param __ - NPC participating in the dialog, unused.
 * @returns Whether the anomaly has no artefact.
 */
extern("dialogs_jupiter.jup_b32_anomaly_do_not_has_af", (_: GameObject, __: GameObject): boolean => {
  if (hasInfoPortion("jup_b32_anomaly_true")) {
    disableInfoPortion("jup_b32_anomaly_true");

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

  const anomalyZone: AnomalyZoneBinder = registry.anomalyZones.get(azTable.get(index));

  if (anomalyZone === null) {
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
 * Check the precondition for the b207 decrypt dialog, requiring the actor to carry the b9 blackbox.
 *
 * @param _ - Actor participating in the dialog, unused.
 * @param secondSpeaker - NPC participating in the dialog.
 * @returns Whether the decrypt dialog is available.
 */
extern(
  "dialogs_jupiter.jup_b207_generic_decrypt_need_dialog_precond",
  (_: GameObject, secondSpeaker: GameObject): boolean => {
    const actor: GameObject = registry.actor;

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
 * Check whether the actor has the b5 dealer PDA device.
 *
 * @param _ - Actor participating in the dialog, unused.
 * @param __ - NPC participating in the dialog, unused.
 * @returns Whether the actor has the dealer PDA.
 */
extern("dialogs_jupiter.jup_b207_actor_has_dealers_pda", (_: GameObject, __: GameObject): boolean => {
  return registry.actor.object("device_pda_zat_b5_dealer") !== null;
});

/**
 * Sell the dealer PDA from the actor for money and mark it as sold.
 *
 * @param firstSpeaker - Actor participating in the dialog.
 * @param secondSpeaker - NPC participating in the dialog.
 */
extern("dialogs_jupiter.jup_b207_sell_dealers_pda", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), "device_pda_zat_b5_dealer");
  giveMoneyToActor(4_000);
  giveInfoPortion(infoPortions.jup_b207_dealers_pda_sold);
});

/**
 * Transfer the dealer PDA from the actor to the NPC speaker.
 *
 * @param firstSpeaker - Actor participating in the dialog.
 * @param secondSpeaker - NPC participating in the dialog.
 */
extern("dialogs_jupiter.jup_b207_give_dealers_pda", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), "device_pda_zat_b5_dealer");
});

/**
 * Check whether the actor has the b207 mercenary PDA with contract.
 *
 * @param _ - Actor participating in the dialog, unused.
 * @param __ - NPC participating in the dialog, unused.
 * @returns Whether the actor has the mercenary PDA.
 */
extern("dialogs_jupiter.jup_b207_actor_has_merc_pda_with_contract", (_: GameObject, __: GameObject): boolean => {
  return registry.actor.object("jup_b207_merc_pda_with_contract") !== null;
});

/**
 * Sell the mercenary PDA with contract from the actor for money and mark it as sold.
 *
 * @param firstSpeaker - Actor participating in the dialog.
 * @param secondSpeaker - NPC participating in the dialog.
 */
extern(
  "dialogs_jupiter.jup_b207_sell_merc_pda_with_contract",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
    const amount: TCount = 1000;

    transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), "jup_b207_merc_pda_with_contract");
    giveMoneyToActor(amount);
    giveInfoPortion("jup_b207_merc_pda_with_contract_sold");
  }
);

/**
 * Transfer the mercenary PDA with contract from the actor to the NPC speaker.
 *
 * @param firstSpeaker - Actor participating in the dialog.
 * @param secondSpeaker - NPC participating in the dialog.
 */
extern(
  "dialogs_jupiter.jup_b207_transfer_blackmail_reward",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
    transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), "jup_b207_merc_pda_with_contract");
  }
);

/**
 * Take the mercenary PDA with contract from the actor and give an Abakan rifle in return.
 *
 * @param firstSpeaker - Actor participating in the dialog.
 * @param secondSpeaker - NPC participating in the dialog.
 */
extern(
  "dialogs_jupiter.jup_b207_transfer_blackmail_reward_for_pda",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
    transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), "jup_b207_merc_pda_with_contract");
    transferItemsToActor(getNpcSpeaker(firstSpeaker, secondSpeaker), "wpn_abakan");
  }
);

/**
 * Transfer the b1 half artefact from the actor to the NPC speaker.
 *
 * @param firstSpeaker - Actor participating in the dialog.
 * @param secondSpeaker - NPC participating in the dialog.
 */
extern("dialogs_jupiter.give_jup_b1_art", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), "jup_b1_half_artifact");
});

/**
 * Check whether the actor has the b1 half artefact.
 *
 * @param _ - Actor participating in the dialog, unused.
 * @param __ - NPC participating in the dialog, unused.
 * @returns Whether the actor has the half artefact.
 */
extern("dialogs_jupiter.if_actor_has_jup_b1_art", (_: GameObject, __: GameObject): boolean => {
  return registry.actor.object("jup_b1_half_artifact") !== null;
});

/**
 * Check whether the actor is not wearing one of the accepted protective suits or helmets.
 *
 * @param firstSpeaker - Actor participating in the dialog.
 * @param secondSpeaker - NPC participating in the dialog.
 * @returns Whether the actor lacks a good suit.
 */
extern(
  "dialogs_jupiter.jup_b1_actor_do_not_have_good_suit",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
    return !getExtern<AnyCallable>("jup_b1_actor_have_good_suit", getExtern("dialogs_jupiter"))(
      firstSpeaker,
      secondSpeaker
    );
  }
);

/**
 * Reward the actor with money for the b1 quest.
 *
 * @param _ - Actor participating in the dialog, unused.
 * @param __ - NPC participating in the dialog, unused.
 */
extern("dialogs_jupiter.jup_b1_reward_actor", (_: GameObject, __: GameObject): void => {
  giveMoneyToActor(6000);
});

/**
 * Check whether the actor is wearing the CS heavy outfit.
 *
 * @param _ - Actor participating in the dialog, unused.
 * @param __ - NPC participating in the dialog, unused.
 * @returns Whether the CS heavy outfit is equipped.
 */
extern("dialogs_jupiter.jup_b6_actor_outfit_cs", (_: GameObject, __: GameObject): boolean => {
  const actor: GameObject = registry.actor;

  if (actor.item_in_slot(7) !== null && actor.item_in_slot(7)!.section() === "cs_heavy_outfit") {
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
 * Check whether the actor is wearing one of the accepted protective suits or helmets.
 *
 * @param _ - Actor participating in the dialog, unused.
 * @param __ - NPC participating in the dialog, unused.
 * @returns Whether the actor has a good suit.
 */
extern("dialogs_jupiter.jup_b1_actor_have_good_suit", (_: GameObject, __: GameObject): boolean => {
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

  const actor: GameObject = registry.actor;

  if (actor.item_in_slot(7) !== null && suitsList.get(actor.section())) {
    return true;
  }

  if (actor.item_in_slot(12) !== null && helmetsList.get(actor.item_in_slot(12)!.section())) {
    return true;
  }

  return false;
});

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
 * Give the actor medicine and a protective helmet as thanks from the b1 stalker squad.
 *
 * @param firstSpeaker - Actor participating in the dialog.
 * @param secondSpeaker - NPC participating in the dialog.
 */
extern("dialogs_jupiter.jup_b1_stalker_squad_thanks", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  transferItemsToActor(getNpcSpeaker(firstSpeaker, secondSpeaker), drugs.medkit_scientic, 3);
  transferItemsToActor(getNpcSpeaker(firstSpeaker, secondSpeaker), drugs.antirad, 5);
  transferItemsToActor(getNpcSpeaker(firstSpeaker, secondSpeaker), drugs.drug_psy_blockade, 2);
  transferItemsToActor(getNpcSpeaker(firstSpeaker, secondSpeaker), drugs.drug_antidot, 2);
  transferItemsToActor(getNpcSpeaker(firstSpeaker, secondSpeaker), drugs.drug_radioprotector, 2);
  transferItemsToActor(getNpcSpeaker(firstSpeaker, secondSpeaker), drugs.drug_anabiotic);
  transferItemsToActor(getNpcSpeaker(firstSpeaker, secondSpeaker), helmets.helm_protective);
});

/**
 * Check whether the actor carries any kind of medkit.
 *
 * @param _ - Actor participating in the dialog, unused.
 * @param __ - NPC participating in the dialog, unused.
 * @returns Whether the actor has a medkit.
 */
extern("dialogs_jupiter.jup_b202_actor_has_medkit", (_: GameObject, __: GameObject): boolean => {
  const actor: GameObject = registry.actor;

  return (
    actor.object(drugs.medkit) !== null ||
    actor.object(drugs.medkit_army) !== null ||
    actor.object(drugs.medkit_scientic) !== null
  );
});

/**
 * Mark the b202 bandit as hit by the actor and turn the bandit squad hostile.
 *
 * @param firstSpeaker - Actor participating in the dialog.
 * @param secondSpeaker - NPC participating in the dialog.
 */
extern(
  "dialogs_jupiter.jup_b202_hit_bandit_from_actor",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
    const object: GameObject = getNpcSpeaker(firstSpeaker, secondSpeaker);
    const actor: GameObject = registry.actor;

    giveInfoPortion(infoPortions.jup_b202_bandit_hited);
    giveInfoPortion(infoPortions.jup_b202_bandit_hited_by_actor);
    getExtern<AnyCallablesModule>("xr_effects").set_squad_goodwill(actor, object, ["jup_b202_bandit_squad", "enemy"]);
  }
);

/**
 * Check the precondition for the b202 medic dialog based on the gather squad and testimony info portions.
 *
 * @param _ - Actor participating in the dialog, unused.
 * @param __ - NPC participating in the dialog, unused.
 * @returns Whether the medic dialog is available.
 */
extern("dialogs_jupiter.jup_b202_medic_dialog_precondition", (_: GameObject, __: GameObject): boolean => {
  if (hasInfoPortion(infoPortions.jup_b218_gather_squad_complete)) {
    return !hasInfoPortion(infoPortions.jup_b202_polustanok);
  } else {
    return !hasInfoPortion(infoPortions.jup_b52_medic_testimony);
  }
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

    if (registry.simulator.object(npcAlife.group_id) === null) {
      return false;
    }

    const squadName: TName = registry.simulator.object(npcAlife.group_id)!.section_name();

    if (squadName !== null && squadName !== "") {
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
 * Check whether the actor carries a toolkit that has not yet been brought for the b217 quest.
 *
 * @param _ - Actor participating in the dialog, unused.
 * @param __ - NPC participating in the dialog, unused.
 * @returns Whether the actor has an undelivered toolkit.
 */
extern("dialogs_jupiter.jup_b217_actor_got_toolkit", (_: GameObject, __: GameObject): boolean => {
  const actor: GameObject = registry.actor as GameObject;

  function isToolkit(object: GameObject, item: GameObject): void {
    const section: TSection = item.section();

    if (
      (section === misc.toolkit_1 && !hasInfoPortion(infoPortions.jup_b217_tech_instrument_1_brought)) ||
      (section === misc.toolkit_2 && !hasInfoPortion(infoPortions.jup_b217_tech_instrument_2_brought)) ||
      (section === misc.toolkit_3 && !hasInfoPortion(infoPortions.jup_b217_tech_instrument_3_brought))
    ) {
      (actor as AnyObject).toolkit = section;

      return;
    }
  }

  actor.iterate_inventory(isToolkit, actor);

  if ((actor as AnyObject).toolkit !== null) {
    return true;
  }

  return false;
});

/**
 * Transfer all b200 tech materials from the actor to the NPC and update the brought counter.
 *
 * @param firstSpeaker - Actor participating in the dialog.
 * @param secondSpeaker - NPC participating in the dialog.
 */
extern(
  "dialogs_jupiter.jupiter_b200_tech_materials_relocate",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
    const needItems: LuaTable<TName, boolean> = $fromObject<TName, boolean>({
      [questItems.jup_b200_tech_materials_wire]: true,
      [questItems.jup_b200_tech_materials_acetone]: true,
      [questItems.jup_b200_tech_materials_textolite]: true,
      [questItems.jup_b200_tech_materials_transistor]: true,
      [questItems.jup_b200_tech_materials_capacitor]: true,
    });

    const actor: GameObject = registry.actor;
    const itemsToRelocate: LuaTable<string, number> = new LuaTable();
    let count: TCount = 0;

    function relocateAndIncCount(object: GameObject, item: GameObject): void {
      if (needItems.get(item.section())) {
        const section: string = item.section();

        count = count + 1;

        if (itemsToRelocate.get(section) === null) {
          itemsToRelocate.set(section, 1);
        } else {
          itemsToRelocate.set(section, itemsToRelocate.get(section) + 1);
        }
      }
    }

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
 * Check whether the NPC speaker is located in the jup_b4 smart terrain.
 *
 * @param firstSpeaker - Actor participating in the dialog.
 * @param secondSpeaker - NPC participating in the dialog.
 * @returns Whether the NPC is in the b4 smart terrain.
 */
extern("dialogs_jupiter.npc_in_b4_smart", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return isObjectInSmartTerrain(getNpcSpeaker(firstSpeaker, secondSpeaker), "jup_b4");
});

/**
 * Transfer one available medkit of any kind from the actor to the NPC speaker.
 *
 * @param firstSpeaker - Actor participating in the dialog.
 * @param secondSpeaker - NPC participating in the dialog.
 */
extern("dialogs_jupiter.jup_b202_transfer_medkit", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  const actor: GameObject = registry.actor;

  if (actor.object(drugs.medkit) !== null) {
    transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), drugs.medkit);
  } else if (actor.object(drugs.medkit_army) !== null) {
    transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), drugs.medkit_army);
  } else if (actor.object(drugs.medkit_scientic) !== null) {
    transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), drugs.medkit_scientic);
  }
});

/**
 * Check whether not all b220 hunting targets have been reported as done yet.
 *
 * @param _ - Actor participating in the dialog, unused.
 * @param __ - NPC participating in the dialog, unused.
 * @returns Whether some hunts are still pending.
 */
extern("dialogs_jupiter.jupiter_b220_all_hunted", (_: GameObject, __: GameObject): boolean => {
  if (
    hasInfoPortion(infoPortions.jup_b220_trapper_bloodsucker_lair_hunted_told) &&
    hasInfoPortion(infoPortions.jup_b220_trapper_zaton_chimera_hunted_told) &&
    hasInfoPortion(infoPortions.jup_b211_swamp_bloodsuckers_hunt_done) &&
    hasInfoPortion(infoPortions.jup_b208_burers_hunt_done) &&
    hasInfoPortion(infoPortions.jup_b212_jupiter_chimera_hunt_done)
  ) {
    return false;
  }

  return true;
});

/**
 * Check whether no completed b220 hunt is currently waiting to be reported.
 *
 * @param _ - Actor participating in the dialog, unused.
 * @param __ - NPC participating in the dialog, unused.
 * @returns Whether no hunt is ready to report.
 */
extern("dialogs_jupiter.jupiter_b220_no_one_hunted", (_: GameObject, __: GameObject): boolean => {
  if (
    hasInfoPortion(infoPortions.jup_b220_trapper_about_himself_told) &&
    hasInfoPortion(infoPortions.zat_b57_den_of_the_bloodsucker_tell_stalkers_about_destroy_lair_give) &&
    !hasInfoPortion(infoPortions.jup_b220_trapper_bloodsucker_lair_hunted_told)
  ) {
    return false;
  } else if (
    hasInfoPortion(infoPortions.zat_b106_chimera_dead) &&
    !hasInfoPortion(infoPortions.jup_b220_trapper_zaton_chimera_hunted_told)
  ) {
    return false;
  } else if (
    hasInfoPortion(infoPortions.jup_b6_all_hunters_are_dead) &&
    !hasInfoPortion(infoPortions.jup_b211_swamp_bloodsuckers_hunt_done)
  ) {
    return false;
  } else if (
    hasInfoPortion(infoPortions.jup_b208_burers_dead) &&
    !hasInfoPortion(infoPortions.jup_b208_burers_hunt_done)
  ) {
    return false;
  } else if (
    hasInfoPortion(infoPortions.jup_b212_jupiter_chimera_dead) &&
    !hasInfoPortion(infoPortions.jup_b212_jupiter_chimera_hunt_done)
  ) {
    return false;
  }

  return true;
});

/**
 * Descending money amounts paid for the b9 blackbox based on the brought-materials counter.
 */
const moneyCountTable: LuaArray<TCount> = $fromArray([3000, 2850, 2700, 2550, 2400, 2250, 2100, 1950, 1800, 1650]);

/**
 * Check whether the actor has enough money for the b9 blackbox, scaled by the brought-materials counter.
 *
 * @param _ - Actor participating in the dialog, unused.
 * @param __ - NPC participating in the dialog, unused.
 * @returns Whether the actor can pay for the blackbox.
 */
extern("dialogs_jupiter.jup_b9_actor_has_money", (_: GameObject, __: GameObject): boolean => {
  let moneyCount: TCount = 0;

  for (const it of $range(1, 9)) {
    if (hasInfoPortion(("jup_b200_tech_materials_brought_counter_" + it) as TInfoPortion)) {
      moneyCount = moneyCountTable.get(it);
    }
  }

  return registry.actor.money() >= moneyCount;
});

/**
 * Take the b9 blackbox payment from the actor, scaled by the brought-materials counter.
 *
 * @param firstSpeaker - Actor participating in the dialog.
 * @param secondSpeaker - NPC participating in the dialog.
 */
extern("dialogs_jupiter.jupiter_b9_relocate_money", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  let moneyCount: TCount = 0;

  for (const it of $range(1, 9)) {
    if (hasInfoPortion(("jup_b200_tech_materials_brought_counter_" + it) as TInfoPortion)) {
      moneyCount = moneyCountTable.get(it);
    }
  }

  transferMoneyFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), moneyCount);
});

/**
 * Transfer the b9 blackbox from the actor to the NPC speaker.
 *
 * @param firstSpeaker - Actor participating in the dialog.
 * @param secondSpeaker - NPC participating in the dialog.
 */
extern("dialogs_jupiter.give_jup_b9_blackbox", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), questItems.jup_b9_blackbox);
});

/**
 * Check whether the actor cannot afford the b9 blackbox.
 *
 * @param firstSpeaker - Actor participating in the dialog.
 * @param secondSpeaker - NPC participating in the dialog.
 * @returns Whether the actor lacks the required money.
 */
extern("dialogs_jupiter.jup_b9_actor_has_not_money", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return !getExtern<AnyCallable>("jup_b9_actor_has_money", getExtern("dialogs_jupiter"))(firstSpeaker, secondSpeaker);
});

/**
 * Check whether the actor has the b9 blackbox.
 *
 * @param _ - Actor participating in the dialog, unused.
 * @param __ - NPC participating in the dialog, unused.
 * @returns Whether the actor has the blackbox.
 */
extern("dialogs_jupiter.if_actor_has_jup_b9_blackbox", (_: GameObject, __: GameObject): boolean => {
  return registry.actor.object(questItems.jup_b9_blackbox) !== null;
});

/**
 * Check whether the actor has the mincer meat artefact.
 *
 * @param firstSpeaker - Actor participating in the dialog.
 * @param __ - NPC participating in the dialog, unused.
 * @returns Whether the actor has the mincer meat artefact.
 */
extern("dialogs_jupiter.if_actor_has_af_mincer_meat", (firstSpeaker: GameObject, __: GameObject): boolean => {
  return firstSpeaker.object(artefacts.af_mincer_meat) !== null;
});

/**
 * Check whether the actor has the fuzz kolobok artefact.
 *
 * @param firstSpeaker - Actor participating in the dialog.
 * @param __ - NPC participating in the dialog, unused.
 * @returns Whether the actor has the fuzz kolobok artefact.
 */
extern("dialogs_jupiter.if_actor_has_af_fuzz_kolobok", (firstSpeaker: GameObject, __: GameObject): boolean => {
  return firstSpeaker.object(artefacts.af_fuzz_kolobok) !== null;
});

/**
 * Check whether the actor has the mincer meat or fuzz kolobok artefact.
 *
 * @param firstSpeaker - Actor participating in the dialog.
 * @param __ - NPC participating in the dialog, unused.
 * @returns Whether the actor has either artefact.
 */
extern("dialogs_jupiter.actor_has_first_or_second_artefact", (firstSpeaker: GameObject, __: GameObject): boolean => {
  return (
    firstSpeaker.object(artefacts.af_mincer_meat) !== null || firstSpeaker.object(artefacts.af_fuzz_kolobok) !== null
  );
});

/**
 * Transfer the mincer meat artefact from the actor to the NPC speaker.
 *
 * @param firstSpeaker - Actor participating in the dialog.
 * @param secondSpeaker - NPC participating in the dialog.
 */
extern("dialogs_jupiter.transfer_af_mincer_meat", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), artefacts.af_mincer_meat);
});

/**
 * Decrement the b15 drunk-count counter for the actor and return the effect result.
 *
 * @param firstSpeaker - Actor participating in the dialog.
 * @param secondSpeaker - NPC participating in the dialog.
 * @returns Whether the counter effect succeeded.
 */
extern("dialogs_jupiter.jup_b15_dec_counter", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  const object: GameObject = getNpcSpeaker(firstSpeaker, secondSpeaker);
  const actor: GameObject = registry.actor;

  return getExtern<AnyCallablesModule>("xr_effects").dec_counter(actor, object, ["jup_b15_full_drunk_count", 1]);
});

/**
 * Reward the actor with money and weapons for the b46 founder PDA, depending on the chosen faction.
 *
 * @param _ - Actor participating in the dialog, unused.
 * @param __ - NPC participating in the dialog, unused.
 */
extern("dialogs_jupiter.jup_b46_sell_duty_founder_pda", (_: GameObject, __: GameObject): void => {
  if (hasInfoPortion(infoPortions.jup_b46_duty_founder_pda_to_freedom)) {
    giveMoneyToActor(4000);
    giveItemsToActor(weapons.wpn_sig550, 1);
    giveItemsToActor(ammo["ammo_5.56x45_ss190"], 150);
  } else if (hasInfoPortion(infoPortions.jup_b46_duty_founder_pda_to_duty)) {
    giveMoneyToActor(4000);
    giveItemsToActor(weapons.wpn_groza, 1);
    giveItemsToActor(ammo.ammo_9x39_ap, 60);
    giveItemsToActor(ammo["ammo_vog-25"], 2);
  }
});

/**
 * Transfer the b46 Duty founder PDA from the actor to the NPC speaker if present.
 *
 * @param firstSpeaker - Actor participating in the dialog.
 * @param secondSpeaker - NPC participating in the dialog.
 */
extern(
  "dialogs_jupiter.jup_b46_transfer_duty_founder_pda",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
    if (registry.actor.object(questItems.jup_b46_duty_founder_pda) !== null) {
      transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), questItems.jup_b46_duty_founder_pda);
    }
  }
);

/**
 * Sell the b46 Duty founder PDA to the Owl trader for money and set the related info portions.
 *
 * @param firstSpeaker - Actor participating in the dialog.
 * @param secondSpeaker - NPC participating in the dialog.
 */
extern(
  "dialogs_jupiter.jup_b46_sell_duty_founder_pda_to_owl",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
    transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), questItems.jup_b46_duty_founder_pda);
    giveMoneyToActor(2500);
    giveInfoPortion(infoPortions.jup_b46_duty_founder_pda_sold);
    giveInfoPortion(infoPortions.jup_b46_duty_founder_pda_to_stalkers);
  }
);

/**
 * Check whether the actor has the b46 Duty founder PDA.
 *
 * @param _ - Actor participating in the dialog, unused.
 * @param __ - NPC participating in the dialog, unused.
 * @returns Whether the actor has the founder PDA.
 */
extern("dialogs_jupiter.jup_b46_actor_has_founder_pda", (_: GameObject, __: GameObject): boolean => {
  return registry.actor.object(questItems.jup_b46_duty_founder_pda) !== null;
});

/**
 * Check whether the Jupiter documents dialog should be enabled based on the a9 items and b47 info portions.
 *
 * @param _ - Actor participating in the dialog, unused.
 * @param __ - NPC participating in the dialog, unused.
 * @returns Whether the Jupiter docs dialog is enabled.
 */
extern("dialogs_jupiter.jup_b47_jupiter_docs_enabled", (_: GameObject, __: GameObject): boolean => {
  const actor: GameObject = registry.actor;
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
    !hasInfoPortion(infoPortions.jup_b47_jupiter_products_start) &&
    actor.object(infoPortions.jup_b47_jupiter_products_info) !== null;
  const c: boolean = hasInfoPortion(infoPortions.jup_b6_scientist_nuclear_physicist_jupiter_docs_talked);

  return (a || b) && !c;
});

/**
 * Transfer the fuzz kolobok artefact from the actor to the NPC speaker.
 *
 * @param firstSpeaker - Actor participating in the dialog.
 * @param secondSpeaker - NPC participating in the dialog.
 */
extern("dialogs_jupiter.transfer_af_fuzz_kolobok", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), "af_fuzz_kolobok");
});

/**
 * Take the guide fee from the actor for travelling to Pripyat.
 *
 * @param firstSpeaker - Actor participating in the dialog.
 * @param secondSpeaker - NPC participating in the dialog.
 */
extern("dialogs_jupiter.pay_cost_to_guide_to_pripyat", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  transferMoneyFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), 5000);
});

/**
 * Check whether the actor has at least the b43 fee of money.
 *
 * @param _ - Actor participating in the dialog, unused.
 * @param __ - NPC participating in the dialog, unused.
 * @returns Whether the actor has enough money.
 */
extern("dialogs_jupiter.jup_b43_actor_has_5000_money", (_: GameObject, __: GameObject): boolean => {
  return registry.actor.money() >= 5000;
});

/**
 * Check whether the actor has less than the b43 fee of money.
 *
 * @param _ - Actor participating in the dialog, unused.
 * @param __ - NPC participating in the dialog, unused.
 * @returns Whether the actor lacks the required money.
 */
extern("dialogs_jupiter.jup_b43_actor_do_not_has_5000_money", (_: GameObject, __: GameObject): boolean => {
  return registry.actor.money() < 5000;
});

/**
 * Reward the actor with money for the first b43 artefact.
 *
 * @param _ - Actor participating in the dialog, unused.
 * @param __ - NPC participating in the dialog, unused.
 */
extern("dialogs_jupiter.jup_b43_reward_for_first_artefact", (_: GameObject, __: GameObject): void => {
  giveMoneyToActor(2500);
});

/**
 * Reward the actor with money for the second b43 artefact.
 *
 * @param _ - Actor participating in the dialog, unused.
 * @param __ - NPC participating in the dialog, unused.
 */
extern("dialogs_jupiter.jup_b43_reward_for_second_artefact", (_: GameObject, __: GameObject): void => {
  giveMoneyToActor(3500);
});

/**
 * Reward the actor with money for both b43 artefacts.
 *
 * @param _ - Actor participating in the dialog, unused.
 * @param __ - NPC participating in the dialog, unused.
 */
extern("dialogs_jupiter.jup_b43_reward_for_both_artefacts", (_: GameObject, __: GameObject): void => {
  giveMoneyToActor(6000);
});

/**
 * Check whether the b218 squad members count is not equal to three.
 *
 * @param _ - Actor participating in the dialog, unused.
 * @param __ - NPC participating in the dialog, unused.
 * @returns Whether the squad count is not three.
 */
extern("dialogs_jupiter.jup_b218_counter_not_3", (_: GameObject, __: GameObject): boolean => {
  return getPortableStoreValue(ACTOR_ID, "jup_b218_squad_members_count", 0 as number) !== 3;
});

/**
 * Check whether the b218 squad members count equals three.
 *
 * @param _ - Actor participating in the dialog, unused.
 * @param __ - NPC participating in the dialog, unused.
 * @returns Whether the squad count is three.
 */
extern("dialogs_jupiter.jup_b218_counter_equal_3", (_: GameObject, __: GameObject): boolean => {
  return getPortableStoreValue(ACTOR_ID, "jup_b218_squad_members_count", 0 as number) === 3;
});

/**
 * Check whether the b218 squad members count is not zero.
 *
 * @param _ - Actor participating in the dialog, unused.
 * @param __ - NPC participating in the dialog, unused.
 * @returns Whether the squad count is not zero.
 */
extern("dialogs_jupiter.jup_b218_counter_not_0", (_: GameObject, __: GameObject): boolean => {
  return getPortableStoreValue(ACTOR_ID, "jup_b218_squad_members_count", 0 as number) !== 0;
});

/**
 * Increment the b25 phrase counter for the actor and return the effect result.
 *
 * @param firstSpeaker - Actor participating in the dialog.
 * @param secondSpeaker - NPC participating in the dialog.
 * @returns Whether the counter effect succeeded.
 */
extern("dialogs_jupiter.jup_b25_frase_count_inc", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  const object: GameObject = getNpcSpeaker(firstSpeaker, secondSpeaker);
  const actor: GameObject = registry.actor;

  return getExtern<AnyCallablesModule>("xr_effects").inc_counter(actor, object, ["jup_b25_frase", 1]);
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

  const anomalZone: AnomalyZoneBinder = registry.anomalyZones.get(azTable.get(index));

  if (anomalZone === null) {
    return false;
  }

  if (anomalZone.spawnedArtefactsCount > 0) {
    disableInfoPortion(infopTable.get(index));
    giveInfoPortion(infoPortions.jup_b32_anomaly_true);

    return true;
  }

  return false;
});

/**
 * Check whether the actor is not an enemy of the Freedom NPC speaker.
 *
 * @param firstSpeaker - Actor participating in the dialog.
 * @param secondSpeaker - NPC participating in the dialog.
 * @returns Whether the actor is not an enemy.
 */
extern(
  "dialogs_jupiter.jup_b4_is_actor_not_enemies_to_freedom",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
    return !getExtern<AnyCallable>("jup_b4_is_actor_enemies_to_freedom", getExtern("dialogs_jupiter"))(
      firstSpeaker,
      secondSpeaker
    );
  }
);

/**
 * Check whether the actor is an enemy of the Freedom NPC speaker.
 *
 * @param firstSpeaker - Actor participating in the dialog.
 * @param secondSpeaker - NPC participating in the dialog.
 * @returns Whether the actor is an enemy.
 */
extern(
  "dialogs_jupiter.jup_b4_is_actor_enemies_to_freedom",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
    return getObjectsRelationSafe(firstSpeaker, secondSpeaker) === EGameObjectRelation.ENEMY;
  }
);

/**
 * Check whether the actor is a friend of the Freedom NPC speaker.
 *
 * @param firstSpeaker - Actor participating in the dialog.
 * @param secondSpeaker - NPC participating in the dialog.
 * @returns Whether the actor is a friend.
 */
extern(
  "dialogs_jupiter.jup_b4_is_actor_friend_to_freedom",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
    return getObjectsRelationSafe(firstSpeaker, secondSpeaker) === EGameObjectRelation.FRIEND;
  }
);

/**
 * Check whether the actor is neutral toward the Freedom NPC speaker.
 *
 * @param firstSpeaker - Actor participating in the dialog.
 * @param secondSpeaker - NPC participating in the dialog.
 * @returns Whether the actor is neutral.
 */
extern(
  "dialogs_jupiter.jup_b4_is_actor_neutral_to_freedom",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
    return getObjectsRelationSafe(firstSpeaker, secondSpeaker) === EGameObjectRelation.NEUTRAL;
  }
);

/**
 * Check whether the actor is not an enemy of the Duty NPC speaker.
 *
 * @param firstSpeaker - Actor participating in the dialog.
 * @param secondSpeaker - NPC participating in the dialog.
 * @returns Whether the actor is not an enemy.
 */
extern(
  "dialogs_jupiter.jup_b4_is_actor_not_enemies_to_dolg",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
    return !getExtern<AnyCallable>("jup_b4_is_actor_enemies_to_dolg", getExtern("dialogs_jupiter"))(
      firstSpeaker,
      secondSpeaker
    );
  }
);

/**
 * Check whether the actor is an enemy of the Duty NPC speaker.
 *
 * @param firstSpeaker - Actor participating in the dialog.
 * @param secondSpeaker - NPC participating in the dialog.
 * @returns Whether the actor is an enemy.
 */
extern(
  "dialogs_jupiter.jup_b4_is_actor_enemies_to_dolg",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
    return getObjectsRelationSafe(firstSpeaker, secondSpeaker) === EGameObjectRelation.ENEMY;
  }
);

/**
 * Check whether the actor is a friend of the Duty NPC speaker.
 *
 * @param firstSpeaker - Actor participating in the dialog.
 * @param secondSpeaker - NPC participating in the dialog.
 * @returns Whether the actor is a friend.
 */
extern(
  "dialogs_jupiter.jup_b4_is_actor_friend_to_dolg",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
    return getObjectsRelationSafe(firstSpeaker, secondSpeaker) === EGameObjectRelation.FRIEND;
  }
);

/**
 * Check whether the actor is neutral toward the Duty NPC speaker.
 *
 * @param firstSpeaker - Actor participating in the dialog.
 * @param secondSpeaker - NPC participating in the dialog.
 * @returns Whether the actor is neutral.
 */
extern(
  "dialogs_jupiter.jup_b4_is_actor_neutral_to_dolg",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
    return firstSpeaker.relation(secondSpeaker) === EGameObjectRelation.NEUTRAL;
  }
);

/**
 * Check whether the actor has the b47 Jupiter products info item.
 *
 * @param _ - Actor participating in the dialog, unused.
 * @param __ - NPC participating in the dialog, unused.
 * @returns Whether the products info is present.
 */
extern("dialogs_jupiter.jup_b47_jupiter_products_info_enabled", (_: GameObject, __: GameObject): boolean => {
  return registry.actor.object(questItems.jup_b47_jupiter_products_info) !== null;
});

/**
 * Check whether the actor does not have the b47 Jupiter products info item.
 *
 * @param _ - Actor participating in the dialog, unused.
 * @param __ - NPC participating in the dialog, unused.
 * @returns Whether the products info is absent.
 */
extern("dialogs_jupiter.jup_b47_jupiter_products_info_disabled", (_: GameObject, __: GameObject): boolean => {
  return registry.actor.object(questItems.jup_b47_jupiter_products_info) === null;
});

/**
 * Take the b47 Jupiter products info from the actor and reward money and medicine in return.
 *
 * @param firstSpeaker - Actor participating in the dialog.
 * @param secondSpeaker - NPC participating in the dialog.
 */
extern(
  "dialogs_jupiter.jup_b47_jupiter_products_info_revard",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
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
 * Check whether the actor has the b47 mercenary PDA.
 *
 * @param _ - Actor participating in the dialog, unused.
 * @param __ - NPC participating in the dialog, unused.
 * @returns Whether the actor has the mercenary PDA.
 */
extern("dialogs_jupiter.jup_b47_actor_has_merc_pda", (_: GameObject, __: GameObject): boolean => {
  return registry.actor.object("jup_b47_merc_pda") !== null;
});

/**
 * Check whether the actor does not have the b47 mercenary PDA.
 *
 * @param firstSpeaker - Actor participating in the dialog.
 * @param secondSpeaker - NPC participating in the dialog.
 * @returns Whether the actor lacks the mercenary PDA.
 */
extern(
  "dialogs_jupiter.jup_b47_actor_has_not_merc_pda",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
    return !getExtern<AnyCallable>("jup_b47_actor_has_merc_pda", getExtern("dialogs_jupiter"))(
      firstSpeaker,
      secondSpeaker
    );
  }
);

/**
 * Take the b47 mercenary PDA from the actor and reward money in return.
 *
 * @param firstSpeaker - Actor participating in the dialog.
 * @param secondSpeaker - NPC participating in the dialog.
 */
extern("dialogs_jupiter.jup_b47_merc_pda_revard", (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
  transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), questItems.jup_b47_merc_pda);
  giveMoneyToActor(2500);
});

/**
 * Check whether the actor may take the b47 task based on the b6 task completion info portions.
 *
 * @param _ - Actor participating in the dialog, unused.
 * @param __ - NPC participating in the dialog, unused.
 * @returns Whether the b47 task can be taken.
 */
extern("dialogs_jupiter.jup_b47_actor_can_take_task", (_: GameObject, __: GameObject): boolean => {
  const a: boolean = hasInfoPortion(infoPortions.jup_b6_task_done) && !hasInfoPortion(infoPortions.jup_b6_task_fail);
  const b: boolean = hasInfoPortion(infoPortions.jup_b6_task_fail) && !hasInfoPortion(infoPortions.jup_b6_task_done);

  return a || b;
});

/**
 * Check whether a squad can be employed for the b47 quest based on the bunker guard and stalker info portions.
 *
 * @param _ - Actor participating in the dialog, unused.
 * @param __ - NPC participating in the dialog, unused.
 * @returns Whether a squad can be employed.
 */
extern("dialogs_jupiter.jup_b47_employ_squad", (_: GameObject, __: GameObject): boolean => {
  const a: boolean =
    hasInfoPortion(infoPortions.jup_b47_bunker_guards_started) &&
    !hasInfoPortion(infoPortions.jup_b47_bunker_guards_done);
  const b: boolean =
    hasInfoPortion(infoPortions.jup_b6_employ_stalker) && !hasInfoPortion(infoPortions.jup_b6_employed_stalker);

  return a || b;
});

/**
 * Reward the actor with money and medicine for the b47 bunker guard task.
 *
 * @param _ - Actor participating in the dialog, unused.
 * @param __ - NPC participating in the dialog, unused.
 */
extern("dialogs_jupiter.jup_b47_bunker_guard_revard", (_: GameObject, __: GameObject): void => {
  giveMoneyToActor(4000);
  giveItemsToActor(drugs.drug_psy_blockade, 2);
  giveItemsToActor(drugs.drug_antidot, 3);
  giveItemsToActor(drugs.drug_radioprotector, 3);
});

/**
 * Reward the actor with money for the b47 gauss rifle documents.
 *
 * @param _ - Actor participating in the dialog, unused.
 * @param __ - NPC participating in the dialog, unused.
 */
extern("dialogs_jupiter.jup_b47_gauss_rifle_revard", (_: GameObject, __: GameObject): void => {
  giveMoneyToActor(12000);
});

/**
 * Check whether the actor has the gauss rifle documents.
 *
 * @param _ - Actor participating in the dialog, unused.
 * @param __ - NPC participating in the dialog, unused.
 * @returns Whether the actor has the gauss rifle docs.
 */
extern("dialogs_jupiter.jup_b47_actor_has_hauss_rifle_docs", (_: GameObject, __: GameObject): boolean => {
  return registry.actor.object(questItems.zat_a23_gauss_rifle_docs) !== null;
});

/**
 * Transfer the b10 UFO memory item from the actor to the NPC speaker.
 *
 * @param firstSpeaker - Actor participating in the dialog.
 * @param secondSpeaker - NPC participating in the dialog.
 */
// -- Jupiter B10 --------------------------------------------------------------
extern(
  "dialogs_jupiter.jup_b10_ufo_memory_give_to_npc",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
    transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), questItems.jup_b10_ufo_memory);
  }
);

/**
 * Check whether the actor has the b10 UFO memory item.
 *
 * @param firstSpeaker - Actor participating in the dialog.
 * @param __ - NPC participating in the dialog, unused.
 * @returns Whether the actor has the UFO memory.
 */
extern("dialogs_jupiter.jup_b10_ufo_memory_give_to_actor", (firstSpeaker: GameObject, __: GameObject): boolean => {
  return firstSpeaker.object(questItems.jup_b10_ufo_memory) !== null;
});

/**
 * Give the actor the second b10 UFO memory item from the NPC speaker.
 *
 * @param firstSpeaker - Actor participating in the dialog.
 * @param secondSpeaker - NPC participating in the dialog.
 */
extern(
  "dialogs_jupiter.jup_b10_ufo_memory_2_give_to_actor",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
    transferItemsToActor(getNpcSpeaker(firstSpeaker, secondSpeaker), questItems.jup_b10_ufo_memory_2);
  }
);

/**
 * Check whether the actor has at least the lower b10 UFO fee of money.
 *
 * @param _ - Actor participating in the dialog, unused.
 * @param __ - NPC participating in the dialog, unused.
 * @returns Whether the actor has enough money.
 */
extern("dialogs_jupiter.jup_b10_ufo_has_money_1000", (_: GameObject, __: GameObject): boolean => {
  return registry.actor.money() >= 1000;
});

/**
 * Check whether the actor has at least the higher b10 UFO fee of money.
 *
 * @param _ - Actor participating in the dialog, unused.
 * @param __ - NPC participating in the dialog, unused.
 * @returns Whether the actor has enough money.
 */
extern("dialogs_jupiter.jup_b10_ufo_has_money_3000", (_: GameObject, __: GameObject): boolean => {
  return registry.actor.money() >= 2000;
});

/**
 * Check whether the actor cannot afford the lower b10 UFO fee.
 *
 * @param firstSpeaker - Actor participating in the dialog.
 * @param secondSpeaker - NPC participating in the dialog.
 * @returns Whether the actor lacks the required money.
 */
extern(
  "dialogs_jupiter.jup_b10_ufo_hasnt_money_1000",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
    return !getExtern<AnyCallable>("jup_b10_ufo_has_money_1000", getExtern("dialogs_jupiter"))(
      firstSpeaker,
      secondSpeaker
    );
  }
);

/**
 * Check whether the actor cannot afford the higher b10 UFO fee.
 *
 * @param firstSpeaker - Actor participating in the dialog.
 * @param secondSpeaker - NPC participating in the dialog.
 * @returns Whether the actor lacks the required money.
 */
extern(
  "dialogs_jupiter.jup_b10_ufo_hasnt_money_3000",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
    return !getExtern<AnyCallable>("jup_b10_ufo_has_money_3000", getExtern("dialogs_jupiter"))(
      firstSpeaker,
      secondSpeaker
    );
  }
);

/**
 * Take the lower b10 UFO fee from the actor.
 *
 * @param firstSpeaker - Actor participating in the dialog.
 * @param secondSpeaker - NPC participating in the dialog.
 */
extern(
  "dialogs_jupiter.jup_b10_ufo_relocate_money_1000",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
    transferMoneyFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), 1000);
  }
);

/**
 * Take the higher b10 UFO fee from the actor.
 *
 * @param firstSpeaker - Actor participating in the dialog.
 * @param secondSpeaker - NPC participating in the dialog.
 */
extern(
  "dialogs_jupiter.jup_b10_ufo_relocate_money_3000",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
    transferMoneyFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), 2000);
  }
);

/**
 * Check whether the actor has the b10 UFO memory item.
 *
 * @param _ - Actor participating in the dialog, unused.
 * @param __ - NPC participating in the dialog, unused.
 * @returns Whether the actor has the UFO memory.
 */
extern("dialogs_jupiter.jup_b10_actor_has_ufo_memory", (_: GameObject, __: GameObject): boolean => {
  return registry.actor.object(questItems.jup_b10_ufo_memory) !== null;
});

/**
 * Reward the actor with money for killing the b211 bloodsuckers.
 *
 * @param _ - Actor participating in the dialog, unused.
 * @param __ - NPC participating in the dialog, unused.
 */
extern("dialogs_jupiter.jup_b211_kill_bludsuckers_reward", (_: GameObject, __: GameObject): void => {
  giveMoneyToActor(3000);
});

/**
 * Give the actor a can of food from the NPC speaker for the b19 quest.
 *
 * @param firstSpeaker - Actor participating in the dialog.
 * @param secondSpeaker - NPC participating in the dialog.
 */
extern(
  "dialogs_jupiter.jup_b19_transfer_conserva_to_actor",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
    transferItemsToActor(getNpcSpeaker(firstSpeaker, secondSpeaker), food.conserva);
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

/**
 * Check whether the actor has the Sokolov note quest item.
 *
 * @param _ - Actor participating in the dialog, unused.
 * @param __ - NPC participating in the dialog, unused.
 * @returns Whether the actor has the note.
 */
extern("dialogs_jupiter.pri_a15_sokolov_actor_has_note", (_: GameObject, __: GameObject): boolean => {
  return registry.actor.object(questItems.jup_b205_sokolov_note) !== null;
});

/**
 * Check whether the actor does not have the Sokolov note quest item.
 *
 * @param firstSpeaker - Actor participating in the dialog.
 * @param secondSpeaker - NPC participating in the dialog.
 * @returns Whether the actor lacks the note.
 */
extern(
  "dialogs_jupiter.pri_a15_sokolov_actor_has_not_note",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
    return !getExtern<AnyCallable>("pri_a15_sokolov_actor_has_note", getExtern("dialogs_jupiter"))(
      firstSpeaker,
      secondSpeaker
    );
  }
);

/**
 * Take the Sokolov note from the actor and give an army medkit in return.
 *
 * @param firstSpeaker - Actor participating in the dialog.
 * @param secondSpeaker - NPC participating in the dialog.
 */
extern(
  "dialogs_jupiter.pri_a15_sokolov_actor_give_note",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): void => {
    transferItemsFromActor(getNpcSpeaker(firstSpeaker, secondSpeaker), questItems.jup_b205_sokolov_note);
    transferItemsToActor(getNpcSpeaker(firstSpeaker, secondSpeaker), drugs.medkit_army);
  }
);

/**
 * Check whether the actor is not an enemy of the Freedom faction.
 *
 * @param _ - Actor participating in the dialog, unused.
 * @param __ - NPC participating in the dialog, unused.
 * @returns Whether the actor is not a Freedom enemy.
 */
extern("dialogs_jupiter.jup_b47_actor_not_enemy_to_freedom", (_: GameObject, __: GameObject): boolean => {
  return !isActorEnemyWithFaction(communities.freedom);
});

/**
 * Check whether the actor is not an enemy of the Duty faction.
 *
 * @param _ - Actor participating in the dialog, unused.
 * @param __ - NPC participating in the dialog, unused.
 * @returns Whether the actor is not a Duty enemy.
 */
extern("dialogs_jupiter.jup_b47_actor_not_enemy_to_dolg", (_: GameObject, __: GameObject): boolean => {
  return !isActorEnemyWithFaction(communities.dolg);
});

/**
 * Check whether the actor has the scientific outfit.
 *
 * @param _ - Actor participating in the dialog, unused.
 * @param __ - NPC participating in the dialog, unused.
 * @returns Whether the actor has the scientific outfit.
 */
extern("dialogs_jupiter.jup_b15_actor_sci_outfit", (_: GameObject, __: GameObject): boolean => {
  return registry.actor.object(outfits.scientific_outfit) !== null;
});

/**
 * Check whether the actor does not have the scientific outfit.
 *
 * @param _ - Actor participating in the dialog, unused.
 * @param __ - NPC participating in the dialog, unused.
 * @returns Whether the actor lacks the scientific outfit.
 */
extern("dialogs_jupiter.jup_b15_no_actor_sci_outfit", (_: GameObject, __: GameObject): boolean => {
  return registry.actor.object(outfits.scientific_outfit) === null;
});

/**
 * Give the actor the b19 treasure coordinates as a reward.
 *
 * @param _ - Actor participating in the dialog, unused.
 * @param __ - NPC participating in the dialog, unused.
 */
extern("dialogs_jupiter.jup_b19_reward", (_: GameObject, __: GameObject): void => {
  TreasureManager.giveTreasureCoordinates("jup_hiding_place_38");
});

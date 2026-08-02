import { GameObject } from "xray16/alias";
import { AnyCallable, extern, getExtern } from "xray16/lib";
import { $isNotNil } from "xray16/macros";

import { infoPortions } from "@/engine/constants/info_portions/info_portions";
import { questItems } from "@/engine/constants/items/quest_items";
import { registry } from "@/engine/core/database";
import { getNpcSpeaker } from "@/engine/core/utils/dialog";
import { giveInfoPortion } from "@/engine/core/utils/info_portion";
import { giveMoneyToActor, transferItemsFromActor } from "@/engine/core/utils/reward";

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
    $isNotNil(actor.object(questItems.jup_a9_delivery_info)) ||
    $isNotNil(actor.object(questItems.jup_a9_evacuation_info)) ||
    $isNotNil(actor.object(questItems.jup_a9_losses_info)) ||
    $isNotNil(actor.object(questItems.jup_a9_meeting_info))
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
 * Check whether the actor has the a9 meeting info item.
 *
 * @param _ - Actor participating in the dialog, unused.
 * @param __ - NPC participating in the dialog, unused.
 * @returns Whether the actor has the meeting info.
 */
extern("dialogs_jupiter.jup_a9_actor_has_meeting_info", (_: GameObject, __: GameObject): boolean => {
  return $isNotNil(registry.actor.object(questItems.jup_a9_meeting_info));
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
  return $isNotNil(registry.actor.object(questItems.jup_a9_delivery_info));
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
  return $isNotNil(registry.actor.object(questItems.jup_a9_evacuation_info));
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
  return $isNotNil(registry.actor.object(questItems.jup_a9_losses_info));
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

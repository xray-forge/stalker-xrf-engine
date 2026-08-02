import { GameObject } from "xray16/alias";
import { AnyCallable, extern, getExtern } from "xray16/lib";

import { infoPortions } from "@/engine/constants/info_portions/info_portions";
import { registry } from "@/engine/core/database";
import { getNpcSpeaker } from "@/engine/core/utils/dialog";
import { hasInfoPortion } from "@/engine/core/utils/info_portion";
import { transferMoneyFromActor } from "@/engine/core/utils/reward";

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

import { game, level, patrol } from "xray16";

import { getManager, getObjectByStoryId, getServerObjectByStoryId, registry } from "@/engine/core/database";
import { ActorInputManager } from "@/engine/core/managers/actor";
import { ENotificationDirection, NotificationManager, TNotificationIcon } from "@/engine/core/managers/notifications";
import { sleepConfig } from "@/engine/core/managers/sleep";
import { SleepManager } from "@/engine/core/managers/sleep/SleepManager";
import { TaskManager } from "@/engine/core/managers/tasks";
import { TreasureManager } from "@/engine/core/managers/treasures";
import type { Squad } from "@/engine/core/objects/squad";
import { objectPunchActor } from "@/engine/core/utils/action";
import { abort, assert } from "@/engine/core/utils/assertion";
import { extern } from "@/engine/core/utils/binding";
import { LuaLogger } from "@/engine/core/utils/logging";
import { isObjectInZone } from "@/engine/core/utils/position";
import { giveItemsToActor } from "@/engine/core/utils/reward";
import { detectorsOrder } from "@/engine/lib/constants/items/detectors";
import { helmets } from "@/engine/lib/constants/items/helmets";
import { outfits } from "@/engine/lib/constants/items/outfits";
import { weapons } from "@/engine/lib/constants/items/weapons";
import { TRUE } from "@/engine/lib/constants/words";
import {
  EActiveItemSlot,
  GameObject,
  GameTask,
  LuaArray,
  Optional,
  TLabel,
  TName,
  TSection,
  TStringId,
  TStringifiedBoolean,
  Vector,
} from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Disable game UI for actor and reset active item slot.
 */
extern(
  "xr_effects.disable_ui",
  (actor: GameObject, object: GameObject, [preserveSlot]: [TStringifiedBoolean]): void => {
    getManager(ActorInputManager).disableGameUi(preserveSlot !== TRUE);
  }
);

/**
 * Disable game UI for actor.
 */
extern("xr_effects.disable_ui_only", (): void => {
  getManager(ActorInputManager).disableGameUiOnly();
});

/**
 * Enable actor UI.
 * Effect parameter describes whether slot should be restored - `true` by default.
 */
extern("xr_effects.enable_ui", (actor: GameObject, object: GameObject, [preserveSlot]: [TStringifiedBoolean]): void => {
  getManager(ActorInputManager).enableGameUi(preserveSlot !== TRUE);
});

/**
 * Disable actor night vision tools.
 */
extern("xr_effects.disable_actor_nightvision", (actor: GameObject): void => {
  getManager(ActorInputManager).disableActorNightVision();
});

/**
 * Enable actor night vision tools.
 */
extern("xr_effects.enable_actor_nightvision", (actor: GameObject): void => {
  getManager(ActorInputManager).enableActorNightVision();
});

/**
 * Disable actor torch.
 */
extern("xr_effects.disable_actor_torch", (actor: GameObject): void => {
  getManager(ActorInputManager).disableActorTorch();
});

/**
 * Enable actor torch.
 */
extern("xr_effects.enable_actor_torch", (actor: GameObject): void => {
  getManager(ActorInputManager).enableActorTorch();
});

/**
 * Run game tutorial.
 * Expects tutorial name parameter to run.
 */
extern("xr_effects.run_tutorial", (actor: GameObject, object: GameObject, [tutorialName]: [TName]): void => {
  logger.format("Run tutorial: '%s'", tutorialName);
  game.start_tutorial(tutorialName);
});

/**
 * Give items of provided section to actor.
 * Expects variadic list of sections to give for the actor.
 */
extern("xr_effects.give_actor", (actor: GameObject, object: Optional<GameObject>, sections: Array<TSection>): void => {
  for (const section of sections) {
    giveItemsToActor(section);
  }
});

/**
 * Remove item from actor inventory based on provided section parameter.
 */
extern("xr_effects.remove_item", (actor: GameObject, object: GameObject, [section]: [Optional<TSection>]): void => {
  logger.info("Remove item");

  assert(section, "Wrong parameters in function 'remove_item'.");

  const inventoryItem: Optional<GameObject> = actor.object(section);

  if (inventoryItem) {
    registry.simulator.release(registry.simulator.object(inventoryItem.id()), true);
    getManager(NotificationManager).sendItemRelocatedNotification(ENotificationDirection.OUT, section);
  } else {
    abort(`Actor has no item to remove with section '${section}'.`);
  }
});

/**
 * Drop actor item with provided `section` on first point from provided path.
 */
extern(
  "xr_effects.drop_object_item_on_point",
  (actor: GameObject, object: GameObject, [section, pathName]: [TSection, TName]): void => {
    const inventoryItem: Optional<GameObject> = actor.object(section);

    if (inventoryItem) {
      actor.drop_item_and_teleport(actor.object(section) as GameObject, new patrol(pathName).point(0));
    } else {
      abort(`Actor has no item to drop with section '${section}'.`);
    }
  }
);

/**
 * Relocate item by section from one story ID to another story ID object.
 */
extern(
  "xr_effects.relocate_item",
  (actor: GameObject, object: GameObject, [itemSection, fromStoryId, toStoryId]: [TSection, TStringId, TStringId]) => {
    logger.info("Relocate item: '%s', '%s' -> '%s'", itemSection, fromStoryId, toStoryId);

    const fromObject: Optional<GameObject> = getObjectByStoryId(fromStoryId);
    const toObject: Optional<GameObject> = getObjectByStoryId(toStoryId);

    assert(toObject, "Couldn't relocate item to not existing object '%s' in 'relocate_item' effect.", toStoryId);

    const item: Optional<GameObject> = fromObject && fromObject.object(itemSection);

    if (item) {
      (fromObject as GameObject).transfer_item(item, toObject);
    } else {
      registry.simulator.create(
        itemSection,
        toObject.position(),
        toObject.level_vertex_id(),
        toObject.game_vertex_id(),
        toObject.id()
      );
    }
  }
);

/**
 * Set weapon slot as currently active for actor.
 */
extern(
  "xr_effects.activate_weapon_slot",
  (actor: GameObject, object: GameObject, [slot]: [Optional<EActiveItemSlot>]): void => {
    assert(slot, "Expected weapon slot to be provided as parameter in effect 'activate_weapon_slot'.");
    actor.activate_slot(slot);
  }
);

// todo: Move to input manager or effects state.
let actorPositionForRestore: Optional<Vector> = null;

/**
 * Set current actor position based on previously saved one (with save effect).
 */
extern("xr_effects.restore_actor_position", (): void => {
  assert(actorPositionForRestore, "Trying to restore actor position with effect while not saved previous one.");
  registry.actor.set_actor_position(actorPositionForRestore);
});

/**
 * Save actor position vector for further restoration.
 */
extern("xr_effects.save_actor_position", (): void => {
  actorPositionForRestore = registry.actor.position();
});

/**
 * Punch actor and force to drop active slot weapon as object.
 */
extern("xr_effects.actor_punch", (actor: GameObject, object: GameObject): void => {
  objectPunchActor(object);
});

/**
 * Show tip in bottom left of game interface.
 */
extern(
  "xr_effects.send_tip",
  (actor: GameObject, object: GameObject, [caption, icon, senderId]: [TLabel, TNotificationIcon, TStringId]): void => {
    assert(caption, "Expected caption to be provided for sent_tip effect.");
    getManager(NotificationManager).sendTipNotification(caption, icon, 0, null, senderId);
  }
);

/**
 * Give new task for actor.
 */
extern("xr_effects.give_task", (actor: GameObject, object: GameObject, [taskId]: [Optional<TStringId>]): void => {
  assert(taskId, "No task id parameter in give_task effect.");
  getManager(TaskManager).giveTask(taskId);
});

/**
 * Set one of active actor tasks as current one.
 */
extern("xr_effects.set_active_task", (actor: GameObject, object: GameObject, [taskId]: [Optional<TStringId>]): void => {
  logger.info("Set active task:", taskId);

  const task: Optional<GameTask> = taskId ? actor.get_task(tostring(taskId), true) : null;

  if (task) {
    actor.set_active_task(task);
  }
});

/**
 * Kill actor instantly.
 */
extern("xr_effects.kill_actor", (actor: GameObject): void => {
  logger.info("Kill actor effect");
  actor.kill(actor);
});

/**
 * Find all online objects of squad and make actor visible for them.
 * Expects squad story ID as parameter.
 */
extern(
  "xr_effects.make_actor_visible_to_squad",
  (actor: GameObject, object: GameObject, [storyId]: [TStringId]): void => {
    const squad: Optional<Squad> = getServerObjectByStoryId(storyId);

    assert(squad, "There is no squad with story id - '%s'.", storyId);

    for (const squadMember of squad.squad_members()) {
      const gameObject: Optional<GameObject> = (registry.objects.get(squadMember.id)?.object ??
        level.object_by_id(squadMember.id)) as Optional<GameObject>;

      if (gameObject) {
        gameObject.make_object_visible_somewhen(actor);
      }
    }
  }
);

/**
 * Trigger sleep dialog for actor.
 * Checks if actor is in one of sleep zones and shows UI.
 *
 * todo: Is zone check needed?
 */
extern("xr_effects.sleep", (): void => {
  logger.info("Sleep effect");

  for (const [, zone] of sleepConfig.SLEEP_ZONES) {
    if (isObjectInZone(registry.actor, registry.zones.get(zone))) {
      logger.format("Actor sleep in: '%s'", zone);

      getManager(SleepManager).showSleepDialog();

      return;
    }
  }
});

/**
 * Set item of provided section as active for actor.
 * Throws if item is not present.
 */
extern("xr_effects.activate_weapon", (actor: GameObject, object: GameObject, [section]: [TSection]) => {
  const item: Optional<GameObject> = actor.object(section);

  assert(item, "Actor has no such item to activate - '%s'.", section);

  actor.make_item_active(item);
});

/**
 * Give actor list of treasures.
 * Expects variadic list of treasure IDs.
 */
extern("xr_effects.give_treasure", (actor: GameObject, object: GameObject, treasures: LuaArray<TStringId>): void => {
  logger.info("Give treasures for actor");

  const treasureManager: TreasureManager = getManager(TreasureManager);

  for (const [, id] of pairs(treasures)) {
    treasureManager.giveActorTreasureCoordinates(id);
  }
});

/**
 * Force actor to use detector if any exists in inventory.
 */
extern("xr_effects.get_best_detector", (actor: GameObject): void => {
  for (const [, detector] of ipairs(detectorsOrder)) {
    const item: Optional<GameObject> = actor.object(detector);

    if (item) {
      item.enable_attachable_item(true);

      return;
    }
  }
});

/**
 * Hide actor detector if it is active item.
 */
extern("xr_effects.hide_best_detector", (actor: GameObject): void => {
  for (const [, detector] of ipairs(detectorsOrder)) {
    const item: Optional<GameObject> = actor.object(detector);

    if (item) {
      item.enable_attachable_item(false);

      return;
    }
  }
});

/**
 * Damage actor starting items.
 */
extern("xr_effects.damage_actor_items_on_start", (actor: GameObject): void => {
  // todo: To be more generic, pick items from slots and add randomization?

  logger.info("Damage actor items on game start");

  actor.object(helmets.helm_respirator)?.set_condition(0.8);
  actor.object(outfits.stalker_outfit)?.set_condition(0.76);
  actor.object(weapons.wpn_pm_actor)?.set_condition(0.9);
  actor.object(weapons.wpn_ak74u)?.set_condition(0.7);
});

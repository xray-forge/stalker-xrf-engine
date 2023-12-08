import { device, game, level, patrol } from "xray16";

import {
  getManager,
  getObjectByStoryId,
  getServerObjectByStoryId,
  IRegistryObjectState,
  registry,
  SYSTEM_INI,
} from "@/engine/core/database";
import { ActorInputManager } from "@/engine/core/managers/actor";
import { ENotificationDirection, NotificationManager, TNotificationIcon } from "@/engine/core/managers/notifications";
import { SleepManager } from "@/engine/core/managers/sleep/SleepManager";
import { TaskManager } from "@/engine/core/managers/tasks";
import { TreasureManager } from "@/engine/core/managers/treasures";
import type { Squad } from "@/engine/core/objects/squad";
import { objectPunchActor } from "@/engine/core/utils/action";
import { abort, assert, assertDefined } from "@/engine/core/utils/assertion";
import { extern } from "@/engine/core/utils/binding";
import { LuaLogger } from "@/engine/core/utils/logging";
import { isObjectInZone } from "@/engine/core/utils/position";
import { giveItemsToActor } from "@/engine/core/utils/reward";
import { detectorsOrder } from "@/engine/lib/constants/items/detectors";
import { helmets } from "@/engine/lib/constants/items/helmets";
import { misc } from "@/engine/lib/constants/items/misc";
import { outfits } from "@/engine/lib/constants/items/outfits";
import { weapons } from "@/engine/lib/constants/items/weapons";
import { TRUE } from "@/engine/lib/constants/words";
import {
  EActiveItemSlot,
  GameObject,
  GameTask,
  LuaArray,
  Optional,
  TIndex,
  TLabel,
  TName,
  TNumberId,
  TRate,
  TSection,
  TStringId,
  Vector,
} from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Disable game UI for actor and reset active item slot.
 */
extern("xr_effects.disable_ui", (actor: GameObject, object: GameObject, parameters: [string]): void => {
  getManager(ActorInputManager).disableGameUi(!parameters || (parameters && parameters[0] !== TRUE));
});

/**
 * Disable game UI for actor.
 */
extern("xr_effects.disable_ui_only", (actor: GameObject, object: GameObject): void => {
  getManager(ActorInputManager).disableGameUiOnly();
});

/**
 * Enable actor UI.
 * Effect parameter describes whether slot should be restored - `true` by default.
 */
extern("xr_effects.enable_ui", (actor: GameObject, object: GameObject, parameters: [string]): void => {
  getManager(ActorInputManager).enableGameUi(!parameters || (parameters && parameters[0] !== TRUE));
});

let camEffectorPlayingObjectId: Optional<TNumberId> = null;

/**
 * todo;
 */
extern("xr_effects.run_cam_effector", (actor: GameObject, object: GameObject, p: [string, number, string]) => {
  logger.info("Run cam effector");

  if (p[0]) {
    let loop: boolean = false;
    let num: number = 1000 + math.random(100);

    if (p[1] && type(p[1]) === "number" && p[1] > 0) {
      num = p[1];
    }

    if (p[2] && p[2] === TRUE) {
      loop = true;
    }

    // --level.add_pp_effector(p[1] + ".ppe", num, loop)
    level.add_cam_effector("camera_effects\\" + p[0] + ".anm", num, loop, "xr_effects.cam_effector_callback");
    camEffectorPlayingObjectId = object.id();
  }
});

/**
 * todo;
 */
extern("xr_effects.stop_cam_effector", (actor: GameObject, object: GameObject, p: [Optional<number>]): void => {
  logger.info("Stop cam effector:", p);

  if (p[0] && type(p[0]) === "number" && p[0] > 0) {
    level.remove_cam_effector(p[0]);
  }
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
 * todo;
 */
extern(
  "xr_effects.run_cam_effector_global",
  (actor: GameObject, object: GameObject, params: [string, Optional<number>, Optional<number>]): void => {
    logger.info("Run cam effector global");

    let num: TIndex = 1000 + math.random(100);
    let fov: TRate = device().fov;

    if (params[1] && type(params[1]) === "number" && params[1] > 0) {
      num = params[1];
    }

    if (params[2] !== null && type(params[2]) === "number") {
      fov = params[2];
    }

    level.add_cam_effector2(
      "camera_effects\\" + params[0] + ".anm",
      num,
      false,
      "xr_effects.cam_effector_callback",
      fov
    );
    camEffectorPlayingObjectId = object.id();
  }
);

/**
 * todo;
 */
extern("xr_effects.cam_effector_callback", (): void => {
  logger.info("Run cam effector callback");

  if (camEffectorPlayingObjectId === null) {
    return;
  }

  const state: IRegistryObjectState = registry.objects.get(camEffectorPlayingObjectId);

  if (state === null || state.activeScheme === null) {
    return;
  }

  if (state[state.activeScheme!]!.signals === null) {
    return;
  }

  state[state.activeScheme!]!.signals!.set("cameff_end", true);
});

/**
 * todo;
 */
extern("xr_effects.run_postprocess", (actor: GameObject, object: GameObject, p: [string, number]): void => {
  logger.info("Run postprocess");

  if (p[0]) {
    if (SYSTEM_INI.section_exist(p[0])) {
      let num: number = 2000 + math.random(100);

      if (p[1] && type(p[1]) === "number" && p[1] > 0) {
        num = p[1];
      }

      level.add_complex_effector(p[0], num);
    } else {
      abort("Complex effector section is no set! [%s]", tostring(p[1]));
    }
  }
});

/**
 * todo;
 */
extern("xr_effects.stop_postprocess", (actor: GameObject, object: GameObject, p: [number]): void => {
  logger.info("Stop postprocess");

  if (p[0] && type(p[0]) === "number" && p[0] > 0) {
    level.remove_complex_effector(p[0]);
  }
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
 * todo;
 */
extern("xr_effects.remove_item", (actor: GameObject, object: GameObject, p: [TSection]): void => {
  logger.info("Remove item");

  assert(p && p[0], "Wrong parameters in function 'remove_item'.");

  const section: TSection = p[0];
  const inventoryItem: Optional<GameObject> = actor.object(section);

  if (inventoryItem !== null) {
    registry.simulator.release(registry.simulator.object(inventoryItem.id()), true);
  } else {
    abort("Actor has no such item!");
  }

  getManager(NotificationManager).sendItemRelocatedNotification(ENotificationDirection.OUT, section);
});

/**
 * todo;
 */
extern("xr_effects.drop_object_item_on_point", (actor: GameObject, object: GameObject, p: [number, string]): void => {
  const dropObject: GameObject = actor.object(p[0]) as GameObject;
  const dropPoint: Vector = new patrol(p[1]).point(0);

  actor.drop_item_and_teleport(dropObject, dropPoint);
});

/**
 * todo;
 */
extern("xr_effects.relocate_item", (actor: GameObject, object: GameObject, params: [string, string, string]) => {
  logger.info("Relocate item");

  const item: Optional<TSection> = params && params[0];
  const fromObject: Optional<GameObject> = params && getObjectByStoryId(params[1]);
  const toObject: Optional<GameObject> = params && getObjectByStoryId(params[2]);

  if (toObject !== null) {
    if (fromObject !== null && fromObject.object(item) !== null) {
      fromObject.transfer_item(fromObject.object(item)!, toObject);
    } else {
      registry.simulator.create(
        item,
        toObject.position(),
        toObject.level_vertex_id(),
        toObject.game_vertex_id(),
        toObject.id()
      );
    }
  } else {
    abort("Couldn't relocate item to NULL");
  }
});

/**
 * todo;
 */
extern("xr_effects.activate_weapon_slot", (actor: GameObject, object: GameObject, [slot]: [EActiveItemSlot]): void => {
  actor.activate_slot(slot);
});

// todo: Move to input manager.
let actorPositionForRestore: Optional<Vector> = null;

/**
 * todo;
 */
extern("xr_effects.save_actor_position", (): void => {
  actorPositionForRestore = registry.actor.position();
});

/**
 * todo;
 */
extern("xr_effects.restore_actor_position", (): void => {
  registry.actor.set_actor_position(actorPositionForRestore!);
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
    logger.info("Send tip");
    getManager(NotificationManager).sendTipNotification(caption, icon, 0, null, senderId);
  }
);

/**
 * todo;
 */
extern("xr_effects.give_task", (actor: GameObject, object: GameObject, [taskId]: [Optional<TStringId>]): void => {
  assertDefined(taskId, "No parameter in give_task effect.");
  getManager(TaskManager).giveTask(taskId);
});

/**
 * todo;
 */
extern("xr_effects.set_active_task", (actor: GameObject, object: GameObject, [taskId]: [TStringId]): void => {
  logger.info("Set active task:", taskId);

  if (taskId !== null) {
    const task: Optional<GameTask> = actor.get_task(tostring(taskId), true);

    if (task) {
      actor.set_active_task(task);
    }
  }
});

/**
 * Kill actor instantly.
 */
extern("xr_effects.kill_actor", (actor: GameObject, object: GameObject): void => {
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

    assertDefined(squad, "There is no squad with id[%s]", storyId);

    for (const squadMember of squad.squad_members()) {
      const gameObject: Optional<GameObject> = level.object_by_id(squadMember.id);

      if (gameObject !== null) {
        gameObject.make_object_visible_somewhen(actor);
      }
    }
  }
);

/**
 * Trigger sleep dialog for actor.
 * Checks if actor is in one of sleep zones and shows UI.
 */
extern("xr_effects.sleep", (): void => {
  logger.info("Sleep effect");

  // todo: Define sleep zones somewhere in config.
  // todo: Define sleep zones somewhere in config.
  // todo: Define sleep zones somewhere in config.
  const sleepZones: LuaArray<TName> = $fromArray([
    "zat_a2_sr_sleep",
    "jup_a6_sr_sleep",
    "pri_a16_sr_sleep",
    "actor_surge_hide_2",
  ]);

  for (const [, zone] of sleepZones) {
    if (isObjectInZone(registry.actor, registry.zones.get(zone))) {
      logger.format("Actor sleep in: '%s'", zone);
      getManager(SleepManager).showSleepDialog();
      break;
    }
  }
});

// todo: To be more generic, pick items from slots and add randomization.
extern("xr_effects.damage_actor_items_on_start", (actor: GameObject): void => {
  logger.info("Damage actor items on start");

  actor.object(helmets.helm_respirator)?.set_condition(0.8);
  actor.object(outfits.stalker_outfit)?.set_condition(0.76);
  actor.object(weapons.wpn_pm_actor)?.set_condition(0.9);
  actor.object(weapons.wpn_ak74u)?.set_condition(0.7);
});

/**
 * todo;
 */
extern("xr_effects.activate_weapon", (actor: GameObject, object: GameObject, [section]: [TSection]) => {
  const inventoryItem: Optional<GameObject> = actor.object(section);

  assertDefined(inventoryItem, "Actor has no such weapon - '%s'.", section);

  actor.make_item_active(inventoryItem);
});

/**
 * Give actor list of treasures.
 * Expects variadic list of treasure IDs.
 */
extern("xr_effects.give_treasure", (actor: GameObject, object: GameObject, treasures: LuaArray<TStringId>): void => {
  logger.info("Give treasures for actor");

  assertDefined(treasures, "Required parameter is 'NIL'.");

  const treasureManager: TreasureManager = getManager(TreasureManager);

  for (const [, id] of treasures) {
    treasureManager.giveActorTreasureCoordinates(id);
  }
});

/**
 * Force actor to use detector if any exists in inventory.
 */
extern("xr_effects.get_best_detector", (actor: GameObject): void => {
  for (const [, detector] of ipairs(detectorsOrder)) {
    const item: Optional<GameObject> = actor.object(detector);

    if (item !== null) {
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

    if (item !== null) {
      item.enable_attachable_item(false);

      return;
    }
  }
});

/**
 * todo;
 */
extern("xr_effects.set_torch_state", (actor: GameObject, object: GameObject, p: [string, Optional<string>]): void => {
  if (p === null || p[1] === null) {
    abort("Not enough parameters in 'set_torch_state' function!");
  }

  const storyObject: Optional<GameObject> = getObjectByStoryId(p[0]);

  if (storyObject === null) {
    return;
  }

  const torch: Optional<GameObject> = storyObject.object(misc.device_torch);

  if (torch) {
    if (p[1] === "on") {
      torch.enable_attachable_item(true);
    } else if (p[1] === "off") {
      torch.enable_attachable_item(false);
    }
  }
});

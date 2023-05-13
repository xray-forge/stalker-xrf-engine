import { alife, device, game, level, patrol, XR_CGameTask, XR_game_object, XR_vector } from "xray16";

import { getObjectByStoryId, getServerObjectByStoryId, registry, SYSTEM_INI } from "@/engine/core/database";
import { SleepManager } from "@/engine/core/managers/interaction/SleepManager";
import { TaskManager } from "@/engine/core/managers/interaction/tasks";
import {
  ActorInputManager,
  ENotificationDirection,
  NotificationManager,
  TNotificationIcon,
} from "@/engine/core/managers/interface";
import { TreasureManager } from "@/engine/core/managers/world/TreasureManager";
import { Squad } from "@/engine/core/objects";
import { abort, assert, assertDefined } from "@/engine/core/utils/assertion";
import { extern } from "@/engine/core/utils/binding";
import { isActorInZoneWithName } from "@/engine/core/utils/check/check";
import { LuaLogger } from "@/engine/core/utils/logging";
import { giveItemsToActor } from "@/engine/core/utils/task_reward";
import { animations } from "@/engine/lib/constants/animation/animations";
import { detectors, TDetector } from "@/engine/lib/constants/items/detectors";
import { helmets } from "@/engine/lib/constants/items/helmets";
import { misc } from "@/engine/lib/constants/items/misc";
import { outfits } from "@/engine/lib/constants/items/outfits";
import { weapons } from "@/engine/lib/constants/items/weapons";
import { TTreasure } from "@/engine/lib/constants/treasures";
import { TRUE } from "@/engine/lib/constants/words";
import { TZone, zones } from "@/engine/lib/constants/zones";
import { LuaArray, Optional, TIndex, TLabel, TName, TNumberId, TSection, TStringId } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
extern("xr_effects.disable_ui", (actor: XR_game_object, npc: XR_game_object, p: [string]): void => {
  ActorInputManager.getInstance().disableGameUi(actor, !p || (p && p[0] !== TRUE));
});

/**
 * todo;
 */
extern("xr_effects.disable_ui_only", (actor: XR_game_object, npc: XR_game_object): void => {
  ActorInputManager.getInstance().disableGameUiOnly(actor);
});

/**
 * todo;
 */
extern("xr_effects.enable_ui", (actor: XR_game_object, npc: XR_game_object, p: [string]): void => {
  ActorInputManager.getInstance().enableGameUi(!p || (p && p[0] !== TRUE));
});

let cam_effector_playing_object_id: Optional<TNumberId> = null;

/**
 * todo;
 */
extern("xr_effects.run_cam_effector", (actor: XR_game_object, npc: XR_game_object, p: [string, number, string]) => {
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
    cam_effector_playing_object_id = npc.id();
  }
});

/**
 * todo;
 */
extern("xr_effects.stop_cam_effector", (actor: XR_game_object, npc: XR_game_object, p: [Optional<number>]): void => {
  logger.info("Stop cam effector:", p);

  if (p[0] && type(p[0]) === "number" && p[0] > 0) {
    level.remove_cam_effector(p[0]);
  }
});

/**
 * todo;
 */
extern("xr_effects.disable_actor_nightvision", (actor: XR_game_object): void => {
  ActorInputManager.getInstance().disableActorNightVision(actor);
});

/**
 * todo;
 */
extern("xr_effects.enable_actor_nightvision", (actor: XR_game_object): void => {
  ActorInputManager.getInstance().enableActorNightVision(actor);
});

/**
 * todo;
 */
extern("xr_effects.disable_actor_torch", (actor: XR_game_object): void => {
  ActorInputManager.getInstance().disableActorTorch(actor);
});

/**
 * todo;
 */
extern("xr_effects.enable_actor_torch", (actor: XR_game_object): void => {
  ActorInputManager.getInstance().enableActorTorch(actor);
});

/**
 * todo;
 */
extern(
  "xr_effects.run_cam_effector_global",
  (actor: XR_game_object, npc: XR_game_object, params: [string, Optional<number>, Optional<number>]): void => {
    logger.info("Run cam effector global");

    let num = 1000 + math.random(100);
    let fov = device().fov;

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
    cam_effector_playing_object_id = npc.id();
  }
);

/**
 * todo;
 */
extern("xr_effects.cam_effector_callback", (): void => {
  logger.info("Run cam effector callback");

  if (cam_effector_playing_object_id === null) {
    return;
  }

  const state = registry.objects.get(cam_effector_playing_object_id);

  if (state === null || state.active_scheme === null) {
    return;
  }

  if (state[state.active_scheme!]!.signals === null) {
    return;
  }

  state[state.active_scheme!]!.signals!.set("cameff_end", true);
});

/**
 * todo;
 */
extern("xr_effects.run_postprocess", (actor: XR_game_object, npc: XR_game_object, p: [string, number]): void => {
  logger.info("Run postprocess");

  if (p[0]) {
    if (SYSTEM_INI.section_exist(p[0])) {
      let num = 2000 + math.random(100);

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
extern("xr_effects.stop_postprocess", (actor: XR_game_object, npc: XR_game_object, p: [number]): void => {
  logger.info("Stop postprocess");

  if (p[0] && type(p[0]) === "number" && p[0] > 0) {
    level.remove_complex_effector(p[0]);
  }
});

/**
 * todo;
 */
extern("xr_effects.run_tutorial", (actor: XR_game_object, npc: XR_game_object, params: [string]): void => {
  logger.info("Run tutorial");
  game.start_tutorial(params[0]);
});

/**
 * todo;
 */
extern(
  "xr_effects.give_actor",
  (actor: XR_game_object, npc: Optional<XR_game_object>, params: Array<TSection>): void => {
    for (const section of params) {
      giveItemsToActor(section);
    }
  }
);

/**
 * todo;
 */
extern("xr_effects.remove_item", (actor: XR_game_object, object: XR_game_object, p: [TSection]): void => {
  logger.info("Remove item");

  assert(p && p[0], "Wrong parameters in function 'remove_item'.");

  const section: TSection = p[0];
  const inventoryItem: Optional<XR_game_object> = actor.object(section);

  if (inventoryItem !== null) {
    alife().release(alife().object(inventoryItem.id()), true);
  } else {
    abort("Actor has no such item!");
  }

  NotificationManager.getInstance().sendItemRelocatedNotification(ENotificationDirection.OUT, section);
});

/**
 * todo;
 */
extern(
  "xr_effects.drop_object_item_on_point",
  (actor: XR_game_object, object: XR_game_object, p: [number, string]): void => {
    const drop_object: XR_game_object = actor.object(p[0]) as XR_game_object;
    const drop_point: XR_vector = new patrol(p[1]).point(0);

    actor.drop_item_and_teleport(drop_object, drop_point);
  }
);

/**
 * todo;
 */
extern("xr_effects.relocate_item", (actor: XR_game_object, npc: XR_game_object, params: [string, string, string]) => {
  logger.info("Relocate item");

  const item = params && params[0];
  const from_obj = params && getObjectByStoryId(params[1]);
  const to_obj = params && getObjectByStoryId(params[2]);

  if (to_obj !== null) {
    if (from_obj !== null && from_obj.object(item) !== null) {
      from_obj.transfer_item(from_obj.object(item)!, to_obj);
    } else {
      alife().create(item, to_obj.position(), to_obj.level_vertex_id(), to_obj.game_vertex_id(), to_obj.id());
    }
  } else {
    abort("Couldn't relocate item to NULL");
  }
});

/**
 * todo;
 */
extern("xr_effects.activate_weapon_slot", (actor: XR_game_object, npc: XR_game_object, [index]: [TIndex]): void => {
  actor.activate_slot(index);
});

let actor_position_for_restore: Optional<XR_vector> = null;

/**
 * todo;
 */
extern("xr_effects.save_actor_position", (): void => {
  actor_position_for_restore = registry.actor.position();
});

/**
 * todo;
 */
extern("xr_effects.restore_actor_position", (): void => {
  registry.actor.set_actor_position(actor_position_for_restore!);
});

/**
 * todo;
 */
extern("xr_effects.actor_punch", (object: XR_game_object): void => {
  const actor: XR_game_object = registry.actor;

  if (actor.position().distance_to_sqr(object.position()) > 4) {
    return;
  }

  ActorInputManager.getInstance().setInactiveInputTime(30);
  level.add_cam_effector(animations.camera_effects_fusker, 999, false, "");

  // todo: Enum for active object slot.
  const active_slot = actor.active_slot();

  if (active_slot !== 2 && active_slot !== 3) {
    return;
  }

  const activeItem: Optional<XR_game_object> = actor.active_item();

  if (activeItem) {
    actor.drop_item(activeItem);
  }
});

/**
 * todo;
 */
extern(
  "xr_effects.send_tip",
  (
    actor: XR_game_object,
    npc: XR_game_object,
    [caption, icon, senderId]: [TLabel, TNotificationIcon, TStringId]
  ): void => {
    logger.info("Send tip");
    NotificationManager.getInstance().sendTipNotification(caption, icon, 0, null, senderId);
  }
);

/**
 * todo;
 */
extern("xr_effects.give_task", (actor: XR_game_object, object: XR_game_object, [taskId]: [Optional<TStringId>]) => {
  assertDefined(taskId, "No parameter in give_task effect.");
  TaskManager.getInstance().giveTask(taskId);
});

/**
 * todo;
 */
extern("xr_effects.set_active_task", (actor: XR_game_object, object: XR_game_object, [taskId]: [TStringId]): void => {
  logger.info("Set active task:", taskId);

  if (taskId !== null) {
    const task: Optional<XR_CGameTask> = actor.get_task(tostring(taskId), true);

    if (task) {
      actor.set_active_task(task);
    }
  }
});

/**
 * todo;
 */
extern("xr_effects.kill_actor", (actor: XR_game_object, npc: XR_game_object): void => {
  logger.info("Kill actor");
  actor.kill(actor);
});

/**
 * todo;
 */
extern(
  "xr_effects.make_actor_visible_to_squad",
  (actor: XR_game_object, object: XR_game_object, parameters: [TStringId]): void => {
    const storyId: Optional<TStringId> = parameters && parameters[0];
    const squad: Optional<Squad> = getServerObjectByStoryId(storyId);

    assertDefined(squad, "There is no squad with id[%s]", storyId);

    for (const squadMember of squad.squad_members()) {
      const clientObject = level.object_by_id(squadMember.id);

      if (clientObject !== null) {
        clientObject.make_object_visible_somewhen(actor);
      }
    }
  }
);

/**
 * todo;
 */
extern("xr_effects.sleep", (actor: XR_game_object): void => {
  logger.info("Sleep effect");

  // todo: Define sleep zones somewhere in config.
  const sleepZones: LuaArray<TZone> = $fromArray<TZone>([
    zones.zat_a2_sr_sleep,
    zones.jup_a6_sr_sleep,
    zones.pri_a16_sr_sleep,
    zones.actor_surge_hide_2,
  ]);

  for (const [index, zone] of sleepZones) {
    if (isActorInZoneWithName(zone, actor)) {
      SleepManager.getInstance().showSleepDialog();
      break;
    }
  }
});

// todo: To be more generic, pick items from slots and add randomization.
extern("xr_effects.damage_actor_items_on_start", (actor: XR_game_object): void => {
  logger.info("Damage actor items on start");

  actor.object(helmets.helm_respirator)?.set_condition(0.8);
  actor.object(outfits.stalker_outfit)?.set_condition(0.76);
  actor.object(weapons.wpn_pm_actor)?.set_condition(0.9);
  actor.object(weapons.wpn_ak74u)?.set_condition(0.7);
});

/**
 * todo;
 */
extern("xr_effects.activate_weapon", (actor: XR_game_object, npc: XR_game_object, p: [string]) => {
  const object: Optional<XR_game_object> = actor.object(p[0]);

  assertDefined(object, "Actor has no such weapon! [%s]", p[0]);

  if (object !== null) {
    actor.make_item_active(object);
  }
});

/**
 * todo;
 */
extern(
  "xr_effects.give_treasure",
  (actor: XR_game_object, object: XR_game_object, parameters: LuaArray<TTreasure>): void => {
    logger.info("Give treasures");

    assertDefined(parameters, "Required parameter is [NIL].");

    const treasureManager: TreasureManager = TreasureManager.getInstance();

    for (const [index, value] of parameters) {
      treasureManager.giveActorTreasureCoordinates(value);
    }
  }
);

const detectorsOrder: LuaArray<TDetector> = $fromArray<TDetector>([
  detectors.detector_simple,
  detectors.detector_advanced,
  detectors.detector_elite,
  detectors.detector_scientific,
]);

/**
 * todo;
 */
extern("xr_effects.get_best_detector", (actor: XR_game_object): void => {
  for (const [k, v] of detectorsOrder) {
    const obj = actor.object(v);

    if (obj !== null) {
      obj.enable_attachable_item(true);

      return;
    }
  }
});

/**
 * todo;
 */
extern("xr_effects.hide_best_detector", (actor: XR_game_object): void => {
  for (const [k, v] of detectorsOrder) {
    const item = actor.object(v);

    if (item !== null) {
      item.enable_attachable_item(false);

      return;
    }
  }
});

/**
 * todo;
 */
extern(
  "xr_effects.set_torch_state",
  (actor: XR_game_object, npc: XR_game_object, p: [string, Optional<string>]): void => {
    if (p === null || p[1] === null) {
      abort("Not enough parameters in 'set_torch_state' function!");
    }

    const object: Optional<XR_game_object> = getObjectByStoryId(p[0]);

    if (object === null) {
      return;
    }

    const torch = object.object(misc.device_torch);

    if (torch) {
      if (p[1] === "on") {
        torch.enable_attachable_item(true);
      } else if (p[1] === "off") {
        torch.enable_attachable_item(false);
      }
    }
  }
);

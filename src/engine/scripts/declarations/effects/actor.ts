import { device, game, level, XR_game_object } from "xray16";

import { registry, SYSTEM_INI } from "@/engine/core/database";
import { ActorInputManager } from "@/engine/core/managers/interface";
import { abort } from "@/engine/core/utils/assertion";
import { extern } from "@/engine/core/utils/binding";
import { LuaLogger } from "@/engine/core/utils/logging";
import { giveItemsToActor } from "@/engine/core/utils/task_reward";
import { TRUE } from "@/engine/lib/constants/words";
import { Optional, TIndex, TNumberId, TSection } from "@/engine/lib/types";

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

    if (p[2] && p[2] === "true") {
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
extern("xr_effects.activate_weapon_slot", (actor: XR_game_object, npc: XR_game_object, [index]: [TIndex]): void => {
  actor.activate_slot(index);
});

import { game, get_hud, level, XR_CUIGameCustom, XR_game_object } from "xray16";

import { TDuration, TIndex } from "@/mod/lib/types";
import { registry } from "@/mod/scripts/core/database";
import {
  disable_actor_nightvision,
  disable_actor_torch,
  enable_actor_nightvision,
  enable_actor_torch,
} from "@/mod/scripts/declarations/effects";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("controls");

/**
 * todo; move to registry
 */
let uiActiveSlot: TIndex = 0;

/**
 * todo;
 */
export function setInactiveInputTime(delta: TDuration): void {
  const actor: XR_game_object = registry.actor;

  registry.objects.get(actor.id()).disable_input_time = game.get_game_time();
  registry.objects.get(actor.id()).disable_input_idle = delta;

  level.disable_input();
}

/**
 * todo;
 */
export function disableGameUiOnly(actor: XR_game_object): void {
  if (actor.is_talking()) {
    actor.stop_talk();
  }

  level.show_weapon(false);

  const slot: TIndex = actor.active_slot();

  if (slot !== 0) {
    uiActiveSlot = slot;
    actor.activate_slot(0);
  }

  level.disable_input();
  level.hide_indicators_safe();

  const hud: XR_CUIGameCustom = get_hud();

  hud.HideActorMenu();
  hud.HidePdaMenu();
}

/**
 * todo;
 */
export function disableGameUi(actor: XR_game_object, resetSlot: boolean): void {
  if (actor.is_talking()) {
    actor.stop_talk();
  }

  level.show_weapon(false);

  if (resetSlot) {
    const slot = actor.active_slot();

    if (slot !== 0) {
      uiActiveSlot = slot;
      actor.activate_slot(0);
    }
  }

  level.disable_input();
  level.hide_indicators_safe();

  const hud: XR_CUIGameCustom = get_hud();

  hud.HideActorMenu();
  hud.HidePdaMenu();

  disable_actor_nightvision(actor);
  disable_actor_torch(actor);
}

export function enableGameUi(restore: boolean): void {
  logger.info("Enable UI");

  if (restore) {
    if (uiActiveSlot !== 0 && registry.actor.item_in_slot(uiActiveSlot) !== null) {
      registry.actor.activate_slot(uiActiveSlot);
    }
  }

  uiActiveSlot = 0;
  level.show_weapon(true);
  level.enable_input();
  level.show_indicators();

  enable_actor_nightvision(registry.actor);
  enable_actor_torch(registry.actor);
}

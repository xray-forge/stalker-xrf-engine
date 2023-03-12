import { game, get_hud, level, XR_CUIGameCustom, XR_game_object } from "xray16";

import { misc } from "@/mod/globals/items/misc";
import { Optional, TDuration, TIndex } from "@/mod/lib/types";
import { registry } from "@/mod/scripts/core/database";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger(FILENAME);

/**
 * todo; move to registry
 */
let uiActiveSlot: TIndex = 0;
let isActorNightVisionEnabled: boolean = false;
let isActorTorchEnabled: boolean = false;

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

  disableActorNightVision(actor);
  disableActorTorch(actor);
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

  enableActorNightVision(registry.actor);
  enableActorTorch(registry.actor);
}

/**
 * todo;
 */
export function disableActorNightVision(actor: XR_game_object = registry.actor): void {
  const nightVision: Optional<XR_game_object> = actor.object(misc.device_torch);

  if (nightVision !== null && nightVision.night_vision_enabled()) {
    nightVision.enable_night_vision(false);
    isActorNightVisionEnabled = true;
  }
}

/**
 * todo;
 */
export function enableActorNightVision(actor: XR_game_object = registry.actor): void {
  const nightVision: Optional<XR_game_object> = actor.object(misc.device_torch);

  if (nightVision !== null && !nightVision.night_vision_enabled() && isActorNightVisionEnabled) {
    nightVision.enable_night_vision(true);
    isActorNightVisionEnabled = false;
  }
}

/**
 * todo;
 */
export function disableActorTorch(actor: XR_game_object = registry.actor): void {
  const torch: Optional<XR_game_object> = actor.object(misc.device_torch);

  if (torch !== null && torch.torch_enabled()) {
    torch.enable_torch(false);
    isActorTorchEnabled = true;
  }
}

/**
 * todo;
 */
export function enableActorTorch(actor: XR_game_object = registry.actor): void {
  const torch: Optional<XR_game_object> = actor.object(misc.device_torch);

  if (torch !== null && !torch.torch_enabled() && isActorTorchEnabled) {
    torch.enable_torch(true);
    isActorTorchEnabled = false;
  }
}

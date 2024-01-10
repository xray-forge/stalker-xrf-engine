import { get_hud, level } from "xray16";

import { registry } from "@/engine/core/database";
import { LuaLogger } from "@/engine/core/utils/logging";
import { GameHud, GameObject } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Set game UI visibility of player.
 *
 * @param isVisible - whether UI should be visible
 */
export function setUiVisibility(isVisible: boolean): void {
  const hud: GameHud = get_hud();
  const actor: GameObject = registry.actor;

  if (isVisible) {
    logger.format("[setUiVisibility] Showing UI");

    level.show_indicators();

    actor.disable_hit_marks(false);
    hud.show_messages();
  } else {
    logger.format("[setUiVisibility] Hiding UI");

    if (actor.is_talking()) {
      actor.stop_talk();
    }

    level.hide_indicators_safe();

    hud.HideActorMenu();
    hud.HidePdaMenu();
    hud.hide_messages();

    actor.disable_hit_marks(true);
  }

  logger.format("[setUiVisibility] Completed");
}

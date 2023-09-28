import { game, get_hud, StaticDrawableWrapper } from "xray16";

import { getPortableStoreValue, setPortableStoreValue } from "@/engine/core/database";
import { ItemUpgradesManager } from "@/engine/core/managers/interface/ItemUpgradesManager";
import { extern } from "@/engine/core/utils/binding";
import { executeConsoleCommand } from "@/engine/core/utils/console";
import { createGameAutoSave } from "@/engine/core/utils/game_save";
import { LuaLogger } from "@/engine/core/utils/logging";
import { consoleCommands } from "@/engine/lib/constants/console_commands";
import { ACTOR_ID } from "@/engine/lib/constants/ids";
import { ClientObject, GameHud, LuaArray, Optional, TCount, TLabel, TName } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Increment counter in pstore.
 */
extern(
  "xr_effects.inc_counter",
  (actor: ClientObject, object: ClientObject, [name, count]: [Optional<TName>, TCount]): void => {
    if (name) {
      setPortableStoreValue(ACTOR_ID, name, getPortableStoreValue(ACTOR_ID, name, 0) + (count ?? 1));
    }
  }
);

/**
 * todo;
 */
extern(
  "xr_effects.dec_counter",
  (actor: ClientObject, object: ClientObject, [name, count]: [Optional<TName>, TCount]): void => {
    if (name) {
      const newValue: TCount = getPortableStoreValue(ACTOR_ID, name, 0) - (count ?? 1);

      setPortableStoreValue(ACTOR_ID, name, newValue < 0 ? 0 : newValue);
    }
  }
);

/**
 * todo;
 */
extern(
  "xr_effects.set_counter",
  (actor: ClientObject, object: ClientObject, [name, count]: [Optional<TName>, TCount]): void => {
    if (name) {
      setPortableStoreValue(ACTOR_ID, name, count ?? 0);
    }
  }
);

/**
 * todo;
 */
extern("xr_effects.game_disconnect", (actor: ClientObject, object: ClientObject): void => {
  logger.info("Game disconnect");
  executeConsoleCommand(consoleCommands.disconnect);
});

let isGameoverCreditsStarted: boolean = false;

/**
 * Show game credits scene.
 */
extern("xr_effects.game_credits", (): void => {
  logger.info("Game credits");

  isGameoverCreditsStarted = true;
  game.start_tutorial("credits_seq");
});

/**
 * todo;
 */
extern("xr_effects.game_over", (): void => {
  logger.info("Game over");

  if (isGameoverCreditsStarted !== true) {
    return;
  }

  executeConsoleCommand(consoleCommands.main_menu, "on");
});

/**
 * todo;
 */
extern("xr_effects.after_credits", (): void => {
  executeConsoleCommand(consoleCommands.main_menu, "on");
});

/**
 * todo;
 */
extern("xr_effects.before_credits", (): void => {
  executeConsoleCommand(consoleCommands.main_menu, "off");
});

/**
 * todo;
 */
extern("xr_effects.on_tutor_gameover_stop", (): void => {
  executeConsoleCommand(consoleCommands.main_menu, "on");
});

/**
 * todo; extern
 */
extern("xr_effects.on_tutor_gameover_quickload", (): void => {
  executeConsoleCommand(consoleCommands.load_last_save);
});

/**
 * todo;
 */
extern("xr_effects.stop_tutorial", (): void => {
  logger.info("Stop tutorial");
  game.stop_tutorial();
});

/**
 * todo;
 */
extern("xr_effects.scenario_autosave", (actor: ClientObject, object: ClientObject, [name]: [TName]): void => {
  createGameAutoSave(name);
});

/**
 * todo;
 */
extern("xr_effects.mech_discount", (actor: ClientObject, object: ClientObject, p: [string]): void => {
  if (p[0]) {
    ItemUpgradesManager.getInstance().setCurrentPriceDiscount(tonumber(p[0])!);
  }
});

/**
 * todo;
 */
extern(
  "xr_effects.upgrade_hint",
  (actor: ClientObject, object: ClientObject, parameters: Optional<LuaArray<TLabel>>): void => {
    if (parameters) {
      ItemUpgradesManager.getInstance().setCurrentHints(parameters);
    }
  }
);

/**
 * todo;
 */
extern("xr_effects.add_cs_text", (actor: ClientObject, object: ClientObject, [label]: [Optional<TLabel>]): void => {
  if (label) {
    const hud: GameHud = get_hud();
    let customText: Optional<StaticDrawableWrapper> = hud.GetCustomStatic("text_on_screen_center");

    if (customText) {
      hud.RemoveCustomStatic("text_on_screen_center");
    }

    hud.AddCustomStatic("text_on_screen_center", true);
    customText = hud.GetCustomStatic("text_on_screen_center");
    customText!.wnd().TextControl().SetText(game.translate_string(label));
  }
});

/**
 * Delete custom text on screen center.
 */
extern("xr_effects.del_cs_text", (): void => {
  const gameHud: GameHud = get_hud();
  const csText: Optional<StaticDrawableWrapper> = gameHud.GetCustomStatic("text_on_screen_center");

  if (csText) {
    gameHud.RemoveCustomStatic("text_on_screen_center");
  }
});

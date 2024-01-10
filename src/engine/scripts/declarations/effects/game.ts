import { game, get_hud, StaticDrawableWrapper } from "xray16";

import { getManager, getPortableStoreValue, setPortableStoreValue } from "@/engine/core/database";
import { UpgradesManager } from "@/engine/core/managers/upgrades/UpgradesManager";
import { extern } from "@/engine/core/utils/binding";
import { executeConsoleCommand } from "@/engine/core/utils/console";
import { disconnectFromGame } from "@/engine/core/utils/game";
import { createGameAutoSave } from "@/engine/core/utils/game_save";
import { LuaLogger } from "@/engine/core/utils/logging";
import { consoleCommands } from "@/engine/lib/constants/console_commands";
import { ACTOR_ID } from "@/engine/lib/constants/ids";
import { GameHud, GameObject, LuaArray, Optional, TCount, TLabel, TName, TRate } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Increment counter in pstore for actor object.
 * Key is provided, count is optional and fallbacks to 1.
 */
extern(
  "xr_effects.inc_counter",
  (actor: GameObject, object: GameObject, [name, count]: [Optional<TName>, TCount]): void => {
    if (!name) {
      return;
    }

    setPortableStoreValue(ACTOR_ID, name, getPortableStoreValue(ACTOR_ID, name, 0) + (count ?? 1));
  }
);

/**
 * Decrement counter in pstore for actor object.
 * Key is provided, count is optional and fallbacks to 1.
 */
extern(
  "xr_effects.dec_counter",
  (actor: GameObject, object: GameObject, [name, count]: [Optional<TName>, TCount]): void => {
    if (!name) {
      return;
    }

    const newValue: TCount = getPortableStoreValue(ACTOR_ID, name, 0) - (count ?? 1);

    setPortableStoreValue(ACTOR_ID, name, newValue < 0 ? 0 : newValue);
  }
);

/**
 * Set counter value in pstore for actor object.
 * Key is provided, count is optional and fallbacks to 1.
 */
extern(
  "xr_effects.set_counter",
  (actor: GameObject, object: GameObject, [name, count]: [Optional<TName>, TCount]): void => {
    if (!name) {
      return;
    }

    setPortableStoreValue(ACTOR_ID, name, count ?? 0);
  }
);

/**
 * Disconnect from game simulator.
 * Stops current game and opens main manu.
 */
extern("xr_effects.game_disconnect", (): void => disconnectFromGame());

/**
 * Handle gave over credits
 */
extern("xr_effects.game_over", (): void => {
  logger.format("Game over, credits sequence ended");

  if (!isGameoverCreditsStarted) {
    return;
  }

  executeConsoleCommand(consoleCommands.main_menu, "on");
});

/**
 * Handle UI changes after credits tutorial.
 */
extern("xr_effects.after_credits", (): void => {
  executeConsoleCommand(consoleCommands.main_menu, "on");
});

/**
 * Handle UI changes before credits tutorial.
 */
extern("xr_effects.before_credits", (): void => {
  executeConsoleCommand(consoleCommands.main_menu, "off");
});

let isGameoverCreditsStarted: boolean = false;

/**
 * Show game credits tutorial scene.
 */
extern("xr_effects.game_credits", (): void => {
  logger.format("Game credits");

  isGameoverCreditsStarted = true;
  game.start_tutorial("credits_seq");
});

/**
 * Handle UI changes when stop game over tutorial.
 */
extern("xr_effects.on_tutor_gameover_stop", (): void => {
  executeConsoleCommand(consoleCommands.main_menu, "on");
});

/**
 * Handle UI changes when force load last save on quick load.
 */
extern("xr_effects.on_tutor_gameover_quickload", (): void => {
  executeConsoleCommand(consoleCommands.load_last_save);
});

/**
 * Stop active game tutorial.
 */
extern("xr_effects.stop_tutorial", (): void => {
  logger.format("Stop tutorial");
  game.stop_tutorial();
});

/**
 * Create game save based on provide name.
 */
extern("xr_effects.scenario_autosave", (actor: GameObject, object: GameObject, [name]: [TName]): void => {
  createGameAutoSave(name);
});

/**
 * Set current discount value for mechanic based on parameter.
 */
extern("xr_effects.mech_discount", (actor: GameObject, object: GameObject, [discount]: [Optional<string>]): void => {
  const discountPercent: Optional<number> = (discount && tonumber(discount)) as Optional<TRate>;

  if (discountPercent) {
    getManager(UpgradesManager).setCurrentPriceDiscount(discountPercent);
  }
});

/**
 * Set current mechanic upgrade hints based on list of parameters.
 */
extern(
  "xr_effects.upgrade_hint",
  (actor: GameObject, object: GameObject, parameters: Optional<LuaArray<TLabel>>): void => {
    getManager(UpgradesManager).setCurrentHints(parameters);
  }
);

/**
 * Add custom test on in-game screen.
 */
extern("xr_effects.add_cs_text", (actor: GameObject, object: GameObject, [label]: [Optional<TLabel>]): void => {
  if (!label) {
    return;
  }

  const hud: GameHud = get_hud();
  let customText: Optional<StaticDrawableWrapper> = hud.GetCustomStatic("text_on_screen_center");

  if (customText) {
    hud.RemoveCustomStatic("text_on_screen_center");
  }

  // todo: Use return value?
  hud.AddCustomStatic("text_on_screen_center", true);

  customText = hud.GetCustomStatic("text_on_screen_center");
  customText!.wnd().TextControl().SetText(game.translate_string(label));
});

/**
 * Delete custom text on in-game screen.
 */
extern("xr_effects.del_cs_text", (): void => {
  const gameHud: GameHud = get_hud();
  const csText: Optional<StaticDrawableWrapper> = gameHud.GetCustomStatic("text_on_screen_center");

  if (csText) {
    gameHud.RemoveCustomStatic("text_on_screen_center");
  }
});

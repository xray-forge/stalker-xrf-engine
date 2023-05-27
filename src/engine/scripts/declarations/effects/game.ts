import { game, get_console, get_hud, StaticDrawableWrapper } from "xray16";

import { getPortableStoreValue, setPortableStoreValue } from "@/engine/core/database";
import { ItemUpgradesManager } from "@/engine/core/managers/interface/ItemUpgradesManager";
import { extern } from "@/engine/core/utils/binding";
import { createAutoSave } from "@/engine/core/utils/game_save";
import { LuaLogger } from "@/engine/core/utils/logging";
import { TCaption } from "@/engine/lib/constants/captions";
import { ClientObject, GameHud, LuaArray, Optional, TName } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
extern("xr_effects.inc_counter", (actor: ClientObject, npc: ClientObject, p: [Optional<string>, number]) => {
  if (p[0]) {
    const inc_value = p[1] || 1;
    const new_value = getPortableStoreValue(actor, p[0], 0) + inc_value;

    setPortableStoreValue(actor, p[0], new_value);
  }
});

/**
 * todo;
 */
extern("xr_effects.dec_counter", (actor: ClientObject, npc: ClientObject, p: [Optional<string>, number]) => {
  if (p[0]) {
    const dec_value = p[1] || 1;
    let new_value = getPortableStoreValue(actor, p[0], 0) - dec_value;

    if (new_value < 0) {
      new_value = 0;
    }

    setPortableStoreValue(actor, p[0], new_value);
  }
});

/**
 * todo;
 */
extern(
  "xr_effects.set_counter",
  (actor: ClientObject, npc: ClientObject, params: [Optional<string>, Optional<number>]): void => {
    if (params[0]) {
      setPortableStoreValue(actor, params[0], params[1] || 0);
    }
  }
);

/**
 * todo;
 */
extern("xr_effects.game_disconnect", (actor: ClientObject, npc: ClientObject): void => {
  logger.info("Game disconnect");
  get_console().execute("disconnect");
});

let gameover_credits_started: boolean = false;

/**
 * todo;
 */
extern("xr_effects.game_credits", (actor: ClientObject, npc: ClientObject): void => {
  logger.info("Game credits");

  gameover_credits_started = true;
  game.start_tutorial("credits_seq");
});

/**
 * todo;
 */
extern("xr_effects.game_over", (actor: ClientObject, npc: ClientObject): void => {
  logger.info("Game over");

  if (gameover_credits_started !== true) {
    return;
  }

  get_console().execute("main_menu on");
});

/**
 * todo;
 */
extern("xr_effects.after_credits", (actor: ClientObject, npc: ClientObject): void => {
  get_console().execute("main_menu on");
});

/**
 * todo;
 */
extern("xr_effects.before_credits", (actor: ClientObject, npc: ClientObject): void => {
  get_console().execute("main_menu off");
});

/**
 * todo;
 */
extern("xr_effects.on_tutor_gameover_stop", () => {
  get_console().execute("main_menu on");
});

/**
 * todo; extern
 */
extern("xr_effects.on_tutor_gameover_quickload", () => {
  get_console().execute("load_last_save");
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
  createAutoSave(name);
});

/**
 * todo;
 */
extern("xr_effects.mech_discount", (actor: ClientObject, npc: ClientObject, p: [string]) => {
  if (p[0]) {
    ItemUpgradesManager.getInstance().setCurrentPriceDiscount(tonumber(p[0])!);
  }
});

/**
 * todo;
 */
extern(
  "xr_effects.upgrade_hint",
  (actor: ClientObject, npc: ClientObject, parameters: Optional<LuaArray<TCaption>>): void => {
    if (parameters) {
      ItemUpgradesManager.getInstance().setCurrentHints(parameters);
    }
  }
);

/**
 * todo;
 */
extern("xr_effects.add_cs_text", (actor: ClientObject, npc: ClientObject, p: [string]) => {
  if (p[0]) {
    const hud = get_hud();
    let cs_text = hud.GetCustomStatic("text_on_screen_center");

    if (cs_text) {
      hud.RemoveCustomStatic("text_on_screen_center");
    }

    hud.AddCustomStatic("text_on_screen_center", true);
    cs_text = hud.GetCustomStatic("text_on_screen_center");
    cs_text!.wnd().TextControl().SetText(game.translate_string(p[0]));
  }
});

/**
 * todo;
 */
extern("xr_effects.del_cs_text", (actor: ClientObject, npc: ClientObject, p: []) => {
  const hud: GameHud = get_hud();
  const csText: Optional<StaticDrawableWrapper> = hud.GetCustomStatic("text_on_screen_center");

  if (csText) {
    hud.RemoveCustomStatic("text_on_screen_center");
  }
});

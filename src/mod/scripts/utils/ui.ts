import { gameConfig } from "@/mod/lib/configs/GameConfig";
import { getActor } from "@/mod/scripts/core/db";
import { abort } from "@/mod/scripts/utils/debug";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const log: LuaLogger = new LuaLogger("utils/rendering");

export function isWideScreen(): boolean {
  return device().width / device().height > 1024 / 768 + 0.01;
}

/**
 * Util to get XML file for current screen resolution.
 * Default util in XRay is problematic and needs update.
 *
 * todo: Respect dot-separated files in XRAY.
 * todo: Respect folders in XRAY.
 */
export function resolveXmlFormPath(path: string, hasWideScreenSupport: boolean = false): string {
  const base: string = path.endsWith(".xml") ? path.slice(0, path.length - 4) : path;
  const wideBase: string = base + ".16" + ".xml";
  const canBeWide: boolean = hasWideScreenSupport && isWideScreen();

  log.info("Resolving XML form file:", path);

  /**
   * Warn about bad path in dev mode.
   */
  if (gameConfig.DEBUG.IS_ENABLED) {
    if (string.find(path, "/") !== null) {
      abort("Non-windows path for XML supplied:", path);
    }
  }

  const resolved: string = canBeWide && getFS().exist("$game_config$", "ui\\" + wideBase) ? wideBase : base + ".xml";

  log.info("Resolved XML to:", resolved);

  return resolved;
}

export function setUiVisibility(isVisible: boolean): void {
  const hud: XR_CUIGameCustom = get_hud();
  const actor: XR_game_object = getActor()!;

  if (isVisible) {
    log.info("[setUiVisibility] Showing UI");

    level.show_indicators();

    // --      db.actor:restore_weapon()

    actor.disable_hit_marks(false);
    hud.show_messages();
  } else {
    log.info("[setUiVisibility] Hiding UI");

    if (actor.is_talking()) {
      actor.stop_talk();
    }

    level.hide_indicators_safe();

    hud.HideActorMenu();
    hud.HidePdaMenu();
    hud.hide_messages();

    // --      db.actor:hide_weapon()

    actor.disable_hit_marks(true);
  }

  log.info("[setUiVisibility] Completed");
}

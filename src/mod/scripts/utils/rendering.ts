import { gameConfig } from "@/mod/lib/configs/GameConfig";
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
    if (lua_string.find(path, "/") !== null) {
      log.error("Non-windows path for XML supplied:", path);
      abort("Non-windows path supplied for FS");
    }
  }

  const resolved: string = canBeWide && getFS().exist("$game_config$", "ui\\" + wideBase) ? wideBase : base + ".xml";

  log.info("Resolved XML to:", resolved);

  return resolved;
}

export function showAllUi(show: boolean): void {
  const hud: XR_CUIGameCustom = get_hud();

  if (show) {
    level.show_indicators();

    // --      db.actor:restore_weapon()

    db.actor.disable_hit_marks(false);
    hud.show_messages();
  } else {
    if (db.actor.is_talking()) {
      db.actor.stop_talk();
    }

    level.hide_indicators_safe();

    hud.HideActorMenu();
    hud.HidePdaMenu();
    hud.hide_messages();

    // --      db.actor:hide_weapon()

    db.actor.disable_hit_marks(true);
  }
}

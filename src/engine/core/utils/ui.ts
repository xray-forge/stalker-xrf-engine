import {
  CScriptXmlInit,
  device,
  get_hud,
  getFS,
  level,
  XR_CScriptXmlInit,
  XR_CUIGameCustom,
  XR_game_object,
} from "xray16";

import { registry } from "@/engine/core/database";
import { abort } from "@/engine/core/utils/assertion";
import { LuaLogger } from "@/engine/core/utils/logging";
import { gameConfig } from "@/engine/lib/configs/GameConfig";
import { roots } from "@/engine/lib/constants/roots";
import { TPath } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
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
export function resolveXmlFormPath(path: TPath, hasWideScreenSupport: boolean = false): TPath {
  const base: string = path.endsWith(".xml") ? path.slice(0, path.length - 4) : path;
  const wideBase: string = base + ".16" + ".xml";
  const canBeWide: boolean = hasWideScreenSupport && isWideScreen();

  /**
   * Warn about bad path in dev mode.
   */
  if (gameConfig.DEBUG.IS_ENABLED) {
    const [hasNonWindowsChars] = string.find(path, "/");

    if (hasNonWindowsChars !== null) {
      abort("Non-windows path for XML supplied:", path);
    }
  }

  const resolved: TPath = canBeWide && getFS().exist(roots.gameConfig, "ui\\" + wideBase) ? wideBase : base + ".xml";

  logger.info("Resolved XML to:", resolved);

  return resolved;
}

/**
 * todo;
 */
export function setUiVisibility(isVisible: boolean): void {
  const hud: XR_CUIGameCustom = get_hud();
  const actor: XR_game_object = registry.actor;

  if (isVisible) {
    logger.info("[setUiVisibility] Showing UI");

    level.show_indicators();

    actor.disable_hit_marks(false);
    hud.show_messages();
  } else {
    logger.info("[setUiVisibility] Hiding UI");

    if (actor.is_talking()) {
      actor.stop_talk();
    }

    level.hide_indicators_safe();

    hud.HideActorMenu();
    hud.HidePdaMenu();
    hud.hide_messages();

    actor.disable_hit_marks(true);
  }

  logger.info("[setUiVisibility] Completed");
}

/**
 * todo;
 */
export function resolveXmlFile(path: TPath, xml: XR_CScriptXmlInit = new CScriptXmlInit()): XR_CScriptXmlInit {
  xml.ParseFile(resolveXmlFormPath(path));

  return xml;
}

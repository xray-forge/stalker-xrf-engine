import { gameConfig } from "@/mod/lib/configs/GameConfig";
import { DebugLogger } from "@/mod/scripts/debug_tools/DebugLogger";

const log: DebugLogger = new DebugLogger("utils/rendering");

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

  log.info("Resolving XML form file:", path, canBeWide);

  /**
   * Warn about bad path in dev mode.
   */
  if (gameConfig.DEBUG.IS_ENABLED) {
    if (lua_string.find(path, "/") !== null) {
      log.error("Non-windows path for XML supplied:", path);
      abort("Non-windows path supplied for FS");
    }
  }

  if (canBeWide && getFS().exist("$game_config$", "ui\\" + wideBase)) {
    return wideBase;
  } else {
    return base + ".xml";
  }
}

import { CScriptXmlInit, getFS } from "xray16";

import { abort } from "@/engine/core/utils/assertion";
import { LuaLogger } from "@/engine/core/utils/logging";
import { isWideScreen } from "@/engine/core/utils/ui/ui_screen";
import { gameConfig } from "@/engine/lib/configs/GameConfig";
import { roots } from "@/engine/lib/constants/roots";
import { TPath, XmlInit } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Util to get XML file for current screen resolution.
 *
 * todo: Respect dot-separated files in XRAY.
 * todo: Respect folders in XRAY.
 *
 * @param path - target path to parse xml from
 * @param hasWideScreenSupport - whether should check existence of `.16.xml` alternative and use it in wide screen
 * @returns normalized xml form file path
 */
export function resolveXmlFormPath(path: TPath, hasWideScreenSupport: boolean = false): TPath {
  const base: string = path.endsWith(".xml") ? path.slice(0, path.length - 4) : path;
  const wideBase: string = base + ".16.xml";
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

  // logger.info("Resolved XML to:", resolved);

  return resolved;
}

/**
 * Resolve xml file by path and try parsing it.
 *
 * @param path - xml form file path
 * @param xml - target xml form initializer, or it will be created from empty
 * @returns xml initialized based on provided path
 */
export function resolveXmlFile(path: TPath, xml: XmlInit = new CScriptXmlInit()): XmlInit {
  xml.ParseFile(resolveXmlFormPath(path));

  return xml;
}
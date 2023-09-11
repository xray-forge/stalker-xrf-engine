import { device } from "xray16";

import { LuaLogger } from "@/engine/core/utils/logging";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Check whether game is in wide screen mode right now.
 *
 * @returns whether game resolution is wide screen
 */
export function isWideScreen(): boolean {
  return device().width / device().height > 1024 / 768 + 0.01;
}
